using System.Security.Cryptography;
using System.Text;

namespace Mpx.Jarbass.Security;

public sealed class JarbassFileVaultGuardian
{
  private const string MagicHeader = "MPX_JRB_VAULT_V1:";

  public string ComputeSha256(byte[] content) => Convert.ToHexString(SHA256.HashData(content));

  public string ComputeSha256(string text) => ComputeSha256(Encoding.UTF8.GetBytes(text));

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

  public bool IsFileEncryptedEnvelope(string filePath)
  {
    if (!File.Exists(filePath))
      return false;

    try
    {
      using var sr = new StreamReader(filePath, Encoding.UTF8);
      var buffer = new char[MagicHeader.Length];
      var read = sr.Read(buffer, 0, MagicHeader.Length);
      return read == MagicHeader.Length && new string(buffer) == MagicHeader;
    }
    catch
    {
      return false;
    }
  }
}
