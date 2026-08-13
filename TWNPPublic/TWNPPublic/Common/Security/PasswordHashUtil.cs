using System.Security.Cryptography;
using TWNPPublic.Common.Extension;

namespace TWNPPublic.Common.Security
{
    public static class PasswordHashUtil
    {
        private const int Iterations = 10000;
        private const int SaltLength = 16;
        private const int KeyLength = 32; // 256 bits = 32 bytes

        public static string HashPassword(string password)
        {
            byte[] salt = new byte[SaltLength];
            RandomNumberGenerator.Fill(salt);

            byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA256,
                KeyLength
            );

            return $"{Iterations}:{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
        }

        public static bool VerifyPassword(string password, string storedHash)
        {
            try
            {
                var parts = storedHash.Split(':');
                if (parts.Length != 3) return false;

                int iterations = int.Parse(parts[0]);
                byte[] salt = Convert.FromBase64String(parts[1]);
                byte[] stored = Convert.FromBase64String(parts[2]);

                byte[] computed = Rfc2898DeriveBytes.Pbkdf2(
                    password,
                    salt,
                    iterations,
                    HashAlgorithmName.SHA256,
                    stored.Length
                );

                return CryptographicOperations.FixedTimeEquals(stored, computed);
            }
            catch
            {
                return false;
            }
        }

        public static bool IsHashFormat(string storedHash)
        {
            if (string.IsNullOrWhiteSpace(storedHash)) return false;

            var parts = storedHash.Split(':');
            return parts.Length == 3
                && int.TryParse(parts[0], out _)
                && IsBase64(parts[1])
                && IsBase64(parts[2]);
        }

        public static bool VerifyPasswordOrLegacyAes(string password, string storedPassword)
        {
            if (VerifyPassword(password, storedPassword)) return true;

            try
            {
                CommonFunc comm = new();
                return comm.AesEncrypt(password) == storedPassword;
            }
            catch
            {
                return false;
            }
        }

        private static bool IsBase64(string value)
        {
            try
            {
                Convert.FromBase64String(value);
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
