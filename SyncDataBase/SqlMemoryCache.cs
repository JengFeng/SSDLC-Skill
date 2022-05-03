using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Caching;
using System.Text;
using System.Security.Cryptography;
using System.Configuration;

namespace SyncDataBase
{
    public class SqlMemoryCache
    {
        /// <summary>  
        /// 預設的快取物件
        /// </summary>
        private static MemoryCache memoryCache = MemoryCache.Default;
        /// <summary>  
        /// 快取的政策
        /// </summary> 
        private static CacheItemPolicy policy = new CacheItemPolicy();
        /// <summary>  
        /// 快取的時間設定值
        /// </summary> 
        private static readonly string _CacheMinutes = ConfigurationManager.AppSettings["CacheMinutes"];
        /// <summary>  
        /// 快取的時間暫存值(不需要每次都轉換)
        /// </summary> 
        private static int CacheMinutes
        {
            get
            {
                int minutes;
                int.TryParse(_CacheMinutes, out minutes);
                if (minutes < 1) return 1;
                else return minutes;
            }
        }
        /// <summary>  
        /// 快取的時間
        /// </summary> 
        private static int DefaultCacheMinutes = SqlMemoryCache.CacheMinutes;
        /// <summary>
        /// 取得快取的值
        /// </summary>
        public static object GetValue(string key)
        {
            return memoryCache.Get(key);
        }
        /// <summary>
        /// 移除快取的值
        /// </summary>
        public static object RemoveValue(string key)
        {
            return memoryCache.Remove(key);
        }
        /// <summary>
        /// 新增快取的值
        /// </summary>
        public static bool Add(string key, object value, DateTimeOffset absExpiration)
        {
            if (value != null)
            {
                policy.AbsoluteExpiration = absExpiration;
                if (memoryCache.Get(key) == null)
                    return memoryCache.Add(key, value, policy);
                else
                {
                    memoryCache.Set(key, value, policy);
                    return true;
                }
            }
            else return false;
        }
        /// <summary>
        /// 新增快取的值
        /// </summary>
        public static bool Add(string key, object value)
        {
            return Add(key, value, DateTime.Now.AddMinutes(DefaultCacheMinutes));
        }
        /// <summary>
        /// 移除快取的值
        /// </summary>
        public static void Remove(string key)
        {
            if (memoryCache.Contains(key))
            {
                memoryCache.Remove(key);
            }
        }
        /// <summary>
        /// 移除關鍵字的所有快取的值
        /// </summary>
        public static void RemoveKeys(string keyword)
        {
            var keys = memoryCache.Where(p => p.Key.IndexOf(keyword) > -1).Select(p => p.Key);
            foreach (var key in keys)
            {
                memoryCache.Remove(key);
            }
        }
        /// <summary>
        /// 取得符合起始字串的數量
        /// </summary>
        public static int GetKeyStartsWithCount(string key)
        {
            return memoryCache.Count(p => p.Key.StartsWith(key));
        }

        /// <summary>
        /// 產生MD5雜湊密碼的關鍵字(小寫英數)
        /// </summary>
        /// <param name="source">來源</param>
        /// <returns></returns>     
        public static string MD5HashKey(string source)
        {
            MD5 md5Hasher = MD5.Create();
            byte[] data = md5Hasher.ComputeHash(Encoding.UTF8.GetBytes(source));
            StringBuilder sBuilder = new StringBuilder();
            for (int i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }
            return sBuilder.ToString();
        }
    }
}