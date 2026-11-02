using System.Security.Cryptography;
using System.Text;

namespace Mpx.Domain.Security;

public static class MorphusSecurity
{
  private const int SaltSize = 16; // 128 bits
  private const int KeySize = 32;  // 256 bits
  private const int Iterations = 100_000;

  public static string HashPassword(string password)
  {
    ArgumentException.ThrowIfNullOrWhiteSpace(password);

    byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);

    byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
        password: Encoding.UTF8.GetBytes(password),
        salt: salt,
        iterations: Iterations,
        hashAlgorithm: HashAlgorithmName.SHA256,
        outputLength: KeySize);

    return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
  }

  public static bool VerifyPassword(string password, string storedHash)
  {
    if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(storedHash))
      return false;

    string[] parts = storedHash.Split('.');
    if (parts.Length != 2)
      return false;

    try
    {
      byte[] salt = Convert.FromBase64String(parts[0]);
      byte[] expectedHash = Convert.FromBase64String(parts[1]);

      byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(
          password: Encoding.UTF8.GetBytes(password),
          salt: salt,
          iterations: Iterations,
          hashAlgorithm: HashAlgorithmName.SHA256,
          outputLength: expectedHash.Length);

      // Comparação em tempo constante imune a Timing Attacks
      return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }
    catch (FormatException)
    {
      return false;
    }
  }

  public static string GenerateSecureToken()
  {
    byte[] secureRandomBytes = RandomNumberGenerator.GetBytes(64);
    return Convert.ToBase64String(secureRandomBytes);
  }
}

