using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;

namespace Morphus.Core.MorphusSecurity;

public static class MorphusSecurity
{
  public static string HashPassword(string password)
  {
    // Generate a 128-bit salt using a cryptographically strong random byte sequence.
    byte[] salt = RandomNumberGenerator.GetBytes(128 / 8);

    // Derive a 256-bit subkey (the hash) using PBKDF2 with HMACSHA256, 100,000 iterations.
    string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
        password: password,
        salt: salt,
        prf: KeyDerivationPrf.HMACSHA256,
        iterationCount: 100000,
        numBytesRequested: 256 / 8));

    // Combine salt and hash for storage (e.g., in a single string separated by a delimiter).
    // For simplicity, this example stores them as a single Base64 string where salt is prepended.
    return $"{Convert.ToBase64String(salt)}.{hashed}";
  }

  public static bool VerifyPassword(string password, string storedHash)
  {
    // Split the stored hash to extract the salt and the actual hash.
    string[] parts = storedHash.Split('.');
    byte[] salt = Convert.FromBase64String(parts[0]);
    string actualHash = parts[1];

    // Re-hash the provided password with the extracted salt.
    string hashedProvidedPassword = Convert.ToBase64String(KeyDerivation.Pbkdf2(
        password: password,
        salt: salt,
        prf: KeyDerivationPrf.HMACSHA256,
        iterationCount: 100000,
        numBytesRequested: 256 / 8));

    // Compare the newly generated hash with the stored hash.
    return hashedProvidedPassword == actualHash;
  }

}
