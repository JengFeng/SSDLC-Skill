using System.Security.Cryptography;
using System.Text;

namespace TWNPPublic.Common.Extension
{
    public static class AESEncryption
    {

        static string defaultkey = "t3n9u6lic";

        public static string AesEncryptExtened(this string text, string key)
        {
            if (string.IsNullOrEmpty(text))
            {
                throw new ArgumentNullException("text");
            }

            return EncryptStringAes(text, key);
        }

        public static string AesDecryptExtened(this string text, string key)
        {
            if (string.IsNullOrEmpty(text))
            {
                throw new ArgumentNullException("text");
            }

            return DecryptStringAes(text, key);
        }



        public static string AesEncryptExtened(this string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                throw new ArgumentNullException("text");
            }

            return EncryptStringAes(text, defaultkey);
        }

        public static string AesDecryptExtened(this string text)
        {
            if (string.IsNullOrEmpty(text))
            {
                throw new ArgumentNullException("text");
            }

            return DecryptStringAes(text, defaultkey);
        }



        static string EncryptStringAes(string plainText, string Key)
        {
            if (plainText == null || plainText.Length <= 0)
                throw new ArgumentNullException("plainText");
            if (Key == null || Key.Length <= 0)
                throw new ArgumentNullException("Key");

            var keyIv = new AesKeyIV(Key);
            var aes = Aes.Create();
            aes.Key = keyIv.Key;
            aes.IV = keyIv.IV;

            var rawData = Encoding.UTF8.GetBytes(plainText);
            using (var ms = new MemoryStream())
            {
                using (var cs = new CryptoStream(ms, aes.CreateEncryptor(aes.Key, aes.IV), CryptoStreamMode.Write))
                {
                    cs.Write(rawData, 0, rawData.Length);
                    cs.FlushFinalBlock();
                    return Convert.ToBase64String(ms.ToArray());
                }
            }
        }

        static string DecryptStringAes(string cipherText, string Key)
        {
            // Check arguments.
            if (cipherText == null || cipherText.Length <= 0)
                throw new ArgumentNullException("cipherText");
            if (Key == null || Key.Length <= 0)
                throw new ArgumentNullException("Key");

            var keyIv = new AesKeyIV(Key);
            var aes = Aes.Create();
            aes.Key = keyIv.Key;
            aes.IV = keyIv.IV;
            var encData = Convert.FromBase64String(cipherText);
            byte[] buffer = new byte[8192];
            using (var ms = new MemoryStream(encData))
            {
                using (var cs = new CryptoStream(ms, aes.CreateDecryptor(aes.Key, aes.IV), CryptoStreamMode.Read))
                {
                    using (var sr = new StreamReader(cs))
                    {
                        using (var dec = new MemoryStream())
                        {
                            cs.CopyTo(dec);
                            return Encoding.UTF8.GetString(dec.ToArray());
                        }
                    }
                }
            }
        }

        private class AesKeyIV
        {
            public Byte[] Key = new Byte[16];
            public Byte[] IV = new Byte[16];
            public AesKeyIV(string strKey)
            {
                var sha = SHA256.Create();
                var hash = sha.ComputeHash(Encoding.ASCII.GetBytes(strKey));
                Array.Copy(hash, 0, Key, 0, 16);
                Array.Copy(hash, 16, IV, 0, 16);
            }
        }
    }
}
