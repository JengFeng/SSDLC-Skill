using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using System.ServiceModel.Web;
using System.ServiceModel.Activation;
using Newtonsoft.Json;
using System.Data;
using System.Data.SqlClient;

namespace SyncDataBase
{
    // 注意: 您可以使用 [重構] 功能表上的 [重新命名] 命令同時變更程式碼、svc 和組態檔中的類別名稱 "SqlServiceJson"。
    // 注意: 若要啟動 WCF 測試用戶端以便測試此服務，請在 [方案總管] 中選取 SqlServiceJson.svc 或 SqlServiceJson.svc.cs，然後開始偵錯。
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class SqlServiceJson : ISqlServiceJson
    {
        #region 資料結構相關
        /// <summary>  
        /// 取得資料庫中所有資料表名稱陣列
        /// </summary>  
        /// <returns>Json</returns> 
        public string GetJsonSchemaTables()
        {
            string[] names = SqlUtitly.GetTables();
            return JsonConvert.SerializeObject(names);
        }
        /// <summary>  
        /// 取得資料表中的所有欄位名稱陣列
        /// </summary>  
        /// <param name="tableName">資料庫中的資料表名稱</param> 
        /// <returns>Json</returns> 
        public string GetJsonSchemaColumnsByTable(string tableName)
        {
            List<CmdParameter> CmdParameterList = new List<CmdParameter>(SqlUtitly.GetCmdParameter(tableName));
            List<string> ColumnList = new List<string>();
            foreach (CmdParameter parameter in CmdParameterList)
            {
                ColumnList.Add(parameter.ParameterName);
            }
            return JsonConvert.SerializeObject(ColumnList.ToArray<string>());
        }
        /// <summary>  
        /// 取得資料表中的命令參數列陣設定
        /// </summary>  
        /// <param name="tableName">資料庫中的資料表名稱</param> 
        /// <returns>Json</returns> 
        public string GetJsonCmdParametersByTable(string tableName)
        {
            CmdParameter[] cmdparameters = SqlUtitly.GetCmdParameter(tableName);
            return JsonConvert.SerializeObject(cmdparameters);
        }
        #endregion

        #region 查詢資料相關
        /// <summary>  
        /// 查詢資料 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param> 
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>  
        /// <returns>Json</returns> 
        public string GetJsonByParameter(string comText, CmdParameter[] comParms)
        {
            return SqlUtitly.GetJsonByCommand(CommandType.Text, comText, comParms);
        }
        /// <summary>  
        /// 查詢資料 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param>  
        /// <returns>Json</returns> 
        public string GetJsonByText(string comText)
        {
            return SqlUtitly.GetJsonByCommand(CommandType.Text, comText, null);
        }/// <summary>  
        /// 查詢第一筆的第一個資料 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param> 
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>  
        /// <returns>Json</returns> 
        public string GetScalarByParameter(string comText, CmdParameter[] comParms)
        {
            return SqlUtitly.GetScalarByCommand(CommandType.Text, comText, comParms);
        }
        /// <summary>  
        /// 查詢第一筆的第一個資料 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param>  
        /// <returns>string</returns> 
        public string GetScalarByText(string comText)
        {
            return SqlUtitly.GetScalarByCommand(CommandType.Text, comText, null);
        }
        #endregion

        #region 執行命令相關
        /// <summary>  
        /// 執行命令 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param> 
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>  
        /// <returns>int</returns> 
        public int ExecuteByParameter(string comText, CmdParameter[] comParms)
        {
            return SqlUtitly.ExecuteByCommand(CommandType.Text, comText, comParms);
        }
        /// <summary>  
        /// 執行命令 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param> 
        /// <returns>int</returns> 
        public int ExecuteByText(string comText)
        {
            return SqlUtitly.ExecuteByCommand(CommandType.Text, comText, null);
        }
        #endregion
    }
}
