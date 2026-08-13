using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace TWNPPublic.Common.Extension
{
    public class CommonFunc
    {
        private string EncryptKey = "FOCUSIT_TWN";

        #region ========加密========
        public string Encrypt(string strWORD)
        {
            return BitConverter.ToString(SHA1.Create().ComputeHash(Encoding.UTF8.GetBytes(strWORD))).Replace("-", null);
        }
        /// <summary>
        /// SHA256加密
        /// </summary>
        /// <param name="strWORD">來源字串</param>
        /// <returns>加密字串</returns>
        public string AesEncrypt(string strWORD)
        {
            return AesEncrypt(strWORD, EncryptKey);
        }
        /// <summary>
        /// SHA256加密
        /// </summary>
        /// <param name="strWORD">來源字串</param>
        /// <param name="strKey">加密Key</param>
        /// <returns>加密字串</returns>
        public string AesEncrypt(string strWORD, string strKey)
        {
            if (strKey == "")
                strKey = "Transfer";

            string encrypt = "";
            try
            {

                StringBuilder sb = new StringBuilder();
                //MD5CryptoServiceProvider md5 = new MD5CryptoServiceProvider();
                //SHA256CryptoServiceProvider sha256 = new SHA256CryptoServiceProvider();
                //AesCryptoServiceProvider provider = new AesCryptoServiceProvider();

                MD5 md5 = MD5.Create();
                SHA256 sha256 = SHA256.Create();
                Aes provider = Aes.Create();

                byte[] keyData = sha256.ComputeHash(Encoding.UTF8.GetBytes(strKey));
                byte[] IVData = md5.ComputeHash(Encoding.UTF8.GetBytes(strKey));

                provider.Key = keyData;
                provider.IV = IVData;

                byte[] dataByteArray = Encoding.UTF8.GetBytes(strWORD);


                using (MemoryStream ms = new MemoryStream())
                using (CryptoStream cs = new CryptoStream(ms, provider.CreateEncryptor(), CryptoStreamMode.Write))
                {
                    cs.Write(dataByteArray, 0, dataByteArray.Length);
                    cs.FlushFinalBlock();
                    //輸出資料
                    foreach (byte b in ms.ToArray())
                    {
                        sb.AppendFormat("{0:X2}", b);
                    }
                    encrypt = sb.ToString();
                }

                md5.Clear();

            }
            catch (Exception e)
            {
                return "";
            }

            return encrypt;
        }
        #endregion
        #region ========解密========
        /// <summary>
        /// SHA256字串解密
        /// </summary>
        /// <param name="strWORD">來源字串</param>
        /// <returns>解密字串</returns>
        public string AesDecrypt(string strWORD)
        {
            return AesDecrypt(strWORD, EncryptKey);
        }
        /// <summary>
        /// SHA256字串解密
        /// </summary>
        /// <param name="strWORD">來源字串</param>
        /// <param name="strKey">解密Key</param>
        /// <returns>解密字串</returns>
        public string AesDecrypt(string strWORD, string strKey)
        {
            if (strKey == "")
                strKey = "Transfer";


            string decrypt = "";
            try
            {
                byte[] dataByteArray = new byte[strWORD.Length / 2];
                for (int x = 0; x < strWORD.Length / 2; x++)
                {
                    int i = (Convert.ToInt32(strWORD.Substring(x * 2, 2), 16));
                    dataByteArray[x] = (byte)i;
                }

                //MD5CryptoServiceProvider md5 = new MD5CryptoServiceProvider();
                //SHA256CryptoServiceProvider sha256 = new SHA256CryptoServiceProvider();
                //AesCryptoServiceProvider provider = new AesCryptoServiceProvider();
                MD5 md5 = MD5.Create();
                SHA256 sha256 = SHA256.Create();
                Aes provider = Aes.Create();

                byte[] keyData = sha256.ComputeHash(Encoding.UTF8.GetBytes(strKey));
                byte[] IVData = md5.ComputeHash(Encoding.UTF8.GetBytes(strKey));

                provider.Key = keyData;
                provider.IV = IVData;

                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, provider.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(dataByteArray, 0, dataByteArray.Length);
                        cs.FlushFinalBlock();
                        decrypt = Encoding.UTF8.GetString(ms.ToArray());
                    }
                }
            }
            catch (Exception e)
            {
                return "";
            }

            return decrypt;
        }
        #endregion

        #region 密碼規則

        /// <summary>
        /// 密碼規則
        ///     1.長度為10至20位元 
        ///     2.大小寫英文字母 
        ///     3.特殊符號
        ///     4.數字
        /// </summary>
        /// <param name="magicword"></param>
        /// <returns></returns>
        public static bool magicword(string magicword)
        {

            string ex = @"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[~!@#$%^&*()_+`\-={}\[\]:; '<>?,.\/]).{10,20}$";
            return Regex.IsMatch(magicword.Trim(), ex);
        }
        #endregion
    }
}
