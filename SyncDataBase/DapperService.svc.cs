using Dapper;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;

namespace SyncDataBase
{
    // 注意: 您可以使用 [重構] 功能表上的 [重新命名] 命令同時變更程式碼、svc 和組態檔中的類別名稱 "DapperService"。
    // 注意: 若要啟動 WCF 測試用戶端以便測試此服務，請在 [方案總管] 中選取 DapperService.svc 或 DapperService.svc.cs，然後開始偵錯。
    public class DapperService : IDapperService
    {

        public int Execute(string sql, string parameters = null)
        {
            var parameter = new DynamicParameters();
            if (parameters != "null")
            {
                var obj = JsonConvert.DeserializeObject<Dictionary<string, string>>(parameters);
                foreach (var item in obj)
                {
                    parameter.Add(item.Key, item.Value);
                }
            }

            using (var connection = CreateConnection())
            {
                return connection.Execute(sql, parameter);
            }
        }

        public string Query(string sql, string parameters = null)
        {
            var parameter = new DynamicParameters();
            if (parameters != "null")
            {
                var obj = JsonConvert.DeserializeObject<Dictionary<string, string>>(parameters);
                foreach (var item in obj)
                {
                    parameter.Add(item.Key, item.Value);
                }
            }

            using (var connection = CreateConnection())
            {            
                var result = connection.Query<object>(sql, parameter).ToList();
                return JsonConvert.SerializeObject(result);
            }
        }

        private IDbConnection CreateConnection()
        {
            var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["ConnectionString1"].ConnectionString);
            return connection;
        }
    }
}
