using System.Security.Cryptography;
using System.Text;

namespace TWNPPublic.Common.Extension
{
    public static class MySQLAESDecrypt
    {
        public static string MYSQL_AESDecrypt(this string Source, string AES_KEY = "097A0D10851D8B3604D448A09BA95308")
        {
            string Result = "";
            try
            {
                if (Source == null || Source.Length == 0 || AES_KEY == null || AES_KEY.Length == 0)
                    return "";

                byte[] Source_bytes = Convert.FromBase64String(Source);
                byte[] AES_KEY_bytes = HexStringToByteArray(AES_KEY);
                using (AesManaged aesFactory = new AesManaged())
                {
                    aesFactory.KeySize = 128;
                    aesFactory.Key = AESCreateKey(AES_KEY_bytes, aesFactory.KeySize / 8);
                    aesFactory.IV = new byte[16];
                    aesFactory.BlockSize = 128;
                    aesFactory.Mode = CipherMode.ECB;
                    aesFactory.Padding = PaddingMode.Zeros;
                    ICryptoTransform decryptor = aesFactory.CreateDecryptor();
                    using (MemoryStream stream = new MemoryStream())
                    {
                        using (CryptoStream decryptStream = new CryptoStream(stream, decryptor, CryptoStreamMode.Write))
                        {
                            decryptStream.Write(Source_bytes, 0, Source_bytes.Length);
                        }
                        Result = Encoding.UTF8.GetString(stream.ToArray());
                        Result = Result.Replace("\b", "").Replace("\u0010", "").Replace("\u0003", "").Replace("\u0006", "").Replace("\b", "").Replace("\u0007", "").Replace("\u000e", "").Replace("\u0005", "").Replace("\u0004", "").Replace("\u000f", "").Replace("\u0001", "").Replace("\u0002", "");
                    }
                }

            }
            catch (Exception ex)
            {

                Result = "";
            }
            return Result;
        }

        private static byte[] HexStringToByteArray(string hex)
        {
            return Enumerable.Range(0, hex.Length)
                                .Where(x => x % 2 == 0)
                                .Select(x => Convert.ToByte(hex.Substring(x, 2), 16))
                                .ToArray();
        }

        private static byte[] AESCreateKey(byte[] key, int keyLength)
        {
            byte[] realkey = new byte[keyLength];
            int num;
            for (int i = 0; i < key.Length; i = num + 1)
            {
                byte[] byteKey = realkey;
                int Index = i % keyLength;
                byteKey[Index] ^= key[i];
                num = i;
            }
            return realkey;
        }
    }
}
