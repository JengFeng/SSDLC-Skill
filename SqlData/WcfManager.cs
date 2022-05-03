using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.ServiceModel;
using SyncDataBase;

namespace SqlData
{
    public sealed class WcfManager
    {
        public const string AT = "@";
        public const string OK = "OK";
        /// <summary>
        /// 載入網路協定。
        /// </summary>
        public static BasicHttpBinding LoadDefaultHttpBinding()
        {
            BasicHttpBinding binding = new BasicHttpBinding();
            binding.MaxReceivedMessageSize = int.MaxValue; 
            binding.MaxBufferPoolSize = int.MaxValue;
            binding.MaxBufferSize = int.MaxValue;
            binding.ReaderQuotas = System.Xml.XmlDictionaryReaderQuotas.Max;
            binding.ReaderQuotas.MaxStringContentLength = int.MaxValue;
            binding.MaxReceivedMessageSize = int.MaxValue;
            binding.SendTimeout = TimeSpan.MaxValue;
            binding.CloseTimeout = TimeSpan.MaxValue;
            binding.ReceiveTimeout = TimeSpan.MaxValue;
            binding.AllowCookies = true;
            return binding;
        }
        /// <summary>
        /// 建立WCF連線網址。
        /// </summary>
        public static ISqlData CreateChannel(string serviceUrl)
        {
            var service = new WcfData();
            return service;
        }

        /// <summary>
        /// 轉換 SqlParameter 陣列為 SyncWcf 專案的 CmdParameter 陣列。
        /// </summary>
        public static List<CmdParameter> GetParameter(List<SqlParameter> sqlParams)
        {
            List<CmdParameter> comParms = new List<CmdParameter>();
            if (sqlParams != null)
            {
                foreach (var sqlparameter in sqlParams)
                {
                    comParms.Add(ToCmdParameter(sqlparameter));
                }
            }
            return comParms;
        }

        /// <summary>
        /// 轉換 SqlParameter 物件為 SyncWcf 專案的 CmdParameter 物件。
        /// </summary>
        private static CmdParameter ToCmdParameter(SqlParameter sqlparameter)
        {
            CmdParameter cmdparameter = new CmdParameter();
            cmdparameter.ParameterName = sqlparameter.ParameterName;
            if (!cmdparameter.ParameterName.StartsWith(AT)) cmdparameter.ParameterName = AT + cmdparameter.ParameterName;
            cmdparameter.SqlDbType = (SqlDbType)sqlparameter.SqlDbType;
            cmdparameter.Size = sqlparameter.Size;
            cmdparameter.Value = sqlparameter.Value ?? DBNull.Value;
            return cmdparameter;
        }
    }
}
