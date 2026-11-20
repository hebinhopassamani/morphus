using System.Security.Cryptography;
using System.Text;

namespace Mpx.Jarbass.Security;

public sealed record JarbassDoubleSignedEnvelope(
    string EncryptedMetadataHeader,
    string EncryptedContentBody,
    string InnerContentSignature,
    string OuterEnvelopeSignature,
    string CombinedDiskFileContent);

public sealed record JarbassVerifiedEnvelopeInspection(
    bool SignatureValid,
    string? FailureReason,
    byte[]? DecryptedMetadataBytes,
    string? EncryptedContentBody,
    string? InnerContentSignature,
    string? OuterEnvelopeSignature);

public sealed class JarbassFileVaultGuardian
{
  private const string MagicHeader = "MPX_JRB_VAULT_V1:";
  private const string DoubleSignedMagicHeader = "MPX_JRB_SEAL_V2:";

  public string ComputeSha256(byte[] content) => Convert.ToHexString(SHA256.HashData(content));

  public string ComputeSha256(string text) => ComputeSha256(Encoding.UTF8.GetBytes(text));

  public string ComputeHmacSha256(string payload, string secretKey)
  {
    var keyBytes = SHA256.HashData(Encoding.UTF8.GetBytes(secretKey));
    var payloadBytes = Encoding.UTF8.GetBytes(payload);
    return Convert.ToHexString(HMACSHA256.HashData(keyBytes, payloadBytes));
  }

  public string EncryptContentAesGcm(byte[] plaintext, string masterSecret)
  {
    var key = SHA256.HashData(Encoding.UTF8.GetBytes(masterSecret));
    var nonce = RandomNumberGenerator.GetBytes(12);
    var ciphertext = new byte[plaintext.Length];
    var tag = new byte[16];

    using var aes = new AesGcm(key, 16);
    aes.Encrypt(nonce, plaintext, ciphertext, tag);

    var combined = new byte[nonce.Length + tag.Length + ciphertext.Length];
    Buffer.BlockCopy(nonce, 0, combined, 0, nonce.Length);
    Buffer.BlockCopy(tag, 0, combined, nonce.Length, tag.Length);
    Buffer.BlockCopy(ciphertext, 0, combined, nonce.Length + tag.Length, ciphertext.Length);

    return MagicHeader + Convert.ToBase64String(combined);
  }

  public byte[] DecryptContentAesGcm(string encryptedEnvelope, string masterSecret)
  {
    var b64 = encryptedEnvelope.StartsWith(MagicHeader, StringComparison.Ordinal)
        ? encryptedEnvelope[MagicHeader.Length..]
        : encryptedEnvelope;

    var combined = Convert.FromBase64String(b64);
    var key = SHA256.HashData(Encoding.UTF8.GetBytes(masterSecret));

    var nonce = new byte[12];
    var tag = new byte[16];
    var ciphertext = new byte[combined.Length - 28];

    Buffer.BlockCopy(combined, 0, nonce, 0, 12);
    Buffer.BlockCopy(combined, 12, tag, 0, 16);
    Buffer.BlockCopy(combined, 28, ciphertext, 0, ciphertext.Length);

    var plaintext = new byte[ciphertext.Length];
    using var aes = new AesGcm(key, 16);
    aes.Decrypt(nonce, ciphertext, tag, plaintext);

    return plaintext;
  }

  /// <summary>
  /// "Uma assinatura digital de outra assinatura digital":
  /// 1) Criptografa o conteúdo do documento com AES-256-GCM e gera a Assinatura Digital #1 (InnerContentSignature = HMAC-SHA256 do conteúdo);
  /// 2) Criptografa os metadados/tags de segurança com AES-256-GCM;
  /// 3) Gera a Assinatura Digital #2 (OuterEnvelopeSignature = HMAC-SHA256 que assina a Assinatura #1 + Cabeçalho de Metadados + Corpo Criptografado).
  /// Assim, entre o escritório e a casa do usuário, NADA pode ser alterado nem no documento e nem nos metadados!
  /// </summary>
  public JarbassDoubleSignedEnvelope SealWithDoubleDigitalSignature(
      byte[] plaintextContent,
      byte[] metadataJsonBytes,
      string masterSecret)
  {
    var plaintextHash = ComputeSha256(plaintextContent);
    var encryptedBody = EncryptContentAesGcm(plaintextContent, masterSecret);

    // Assinatura Digital #1 (Inner Signature: assina o hash do conteúdo original + o corpo criptografado)
    var innerSignature = ComputeHmacSha256($"INNER_V2|{plaintextHash}|{encryptedBody}", masterSecret + "#INNER");

    // Criptografa os metadados/tags para que ninguém veja ou edite o nível de segurança no meio do caminho
    var encryptedMetaHeader = EncryptContentAesGcm(metadataJsonBytes, masterSecret + "#META");

    // Assinatura Digital #2 (Outer Signature: uma assinatura digital em cima da Assinatura #1 + Metadados Criptografados!)
    var outerSignature = ComputeHmacSha256($"OUTER_V2|{innerSignature}|{encryptedMetaHeader}|{encryptedBody}", masterSecret + "#OUTER");

    var combinedFile = $"{DoubleSignedMagicHeader}{outerSignature}.{innerSignature}.{encryptedMetaHeader}.{encryptedBody}";

    return new JarbassDoubleSignedEnvelope(
        EncryptedMetadataHeader: encryptedMetaHeader,
        EncryptedContentBody: encryptedBody,
        InnerContentSignature: innerSignature,
        OuterEnvelopeSignature: outerSignature,
        CombinedDiskFileContent: combinedFile);
  }

  /// <summary>
  /// Inspeciona os metadados locais de um arquivo lacrado validando primeiro a Assinatura Digital #2 (Outer)
  /// e a Assinatura Digital #1 (Inner), sem precisar ir ao servidor e garantindo que nem 1 bit foi adulterado no caminho!
  /// </summary>
  public JarbassVerifiedEnvelopeInspection VerifyDoubleSignatureAndExtractMetadata(
      string sealedDiskFileContent,
      string masterSecret)
  {
    if (string.IsNullOrWhiteSpace(sealedDiskFileContent) ||
        !sealedDiskFileContent.StartsWith(DoubleSignedMagicHeader, StringComparison.Ordinal))
    {
      return new JarbassVerifiedEnvelopeInspection(false, "Arquivo não possui cabeçalho de dupla assinatura MPX_JRB_SEAL_V2.", null, null, null, null);
    }

    var rawPayload = sealedDiskFileContent[DoubleSignedMagicHeader.Length..];
    var parts = rawPayload.Split('.', 4);
    if (parts.Length != 4)
    {
      return new JarbassVerifiedEnvelopeInspection(false, "Estrutura do envelope de dupla assinatura corrompida ou truncada.", null, null, null, null);
    }

    var outerSig = parts[0];
    var innerSig = parts[1];
    var encryptedMeta = parts[2];
    var encryptedBody = parts[3];

    var expectedOuterSig = ComputeHmacSha256($"OUTER_V2|{innerSig}|{encryptedMeta}|{encryptedBody}", masterSecret + "#OUTER");
    if (!CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(outerSig),
            Encoding.UTF8.GetBytes(expectedOuterSig)))
    {
      return new JarbassVerifiedEnvelopeInspection(
          false,
          "VIOLAÇÃO CRÍTICA: Assinatura Digital Externa (OuterEnvelopeSignature) inválida! Tentativa de adulterar metadados ou documento em trânsito.",
          null, null, innerSig, outerSig);
    }

    try
    {
      var decryptedMetaBytes = DecryptContentAesGcm(encryptedMeta, masterSecret + "#META");
      return new JarbassVerifiedEnvelopeInspection(
          true,
          null,
          decryptedMetaBytes,
          encryptedBody,
          innerSig,
          outerSig);
    }
    catch (Exception ex)
    {
      return new JarbassVerifiedEnvelopeInspection(
          false,
          $"VIOLAÇÃO CRÍTICA: Falha na autenticação GCM do cabeçalho de metadados ({ex.Message}).",
          null, null, innerSig, outerSig);
    }
  }

  public bool IsFileEncryptedEnvelope(string filePath)
  {
    if (!File.Exists(filePath))
      return false;

    try
    {
      using var sr = new StreamReader(filePath, Encoding.UTF8);
      var line = sr.ReadLine();
      if (string.IsNullOrEmpty(line))
        return false;

      return line.StartsWith(MagicHeader, StringComparison.Ordinal) ||
             line.StartsWith(DoubleSignedMagicHeader, StringComparison.Ordinal);
    }
    catch
    {
      return false;
    }
  }
}
