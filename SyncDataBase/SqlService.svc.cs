
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Channels;
using System.ServiceModel.Web;
using System.Text;

namespace SyncDataBase
{
    // 注意: 您可以使用 [重構] 功能表上的 [重新命名] 命令同時變更程式碼、svc 和組態檔中的類別名稱 "SqlService"。
    // 注意: 若要啟動 WCF 測試用戶端以便測試此服務，請在 [方案總管] 中選取 SqlService.svc 或 SqlService.svc.cs，然後開始偵錯。
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class SqlService : ISqlService
    {
        string Key = "ILoveJeffery"; 
        public static bool Pass;

        public string CheckKey(string InputKey)
        {
            if (InputKey.Trim() == Key)
            {
                Pass = true;
                return "OK";
            }
            else
            {
                Pass = false;
                return "NG";
            }
        }

        #region 資料結構相關
        /// <summary>  
        /// 取得資料庫中所有資料表名稱陣列
        /// </summary>  
        /// <returns>string[]</returns> 
        public string[] GetSchemaTables()
        {
            return SqlUtitly.GetTables();
        }
        /// <summary>  
        /// 取得資料表中的所有欄位名稱陣列
        /// </summary>  
        /// <param name="tableName">資料庫中的資料表名稱</param> 
        /// <returns>string[]</returns> 
        public string[] GetSchemaColumnsByTable(string tableName)
        {
            List<CmdParameter> CmdParameterList = new List<CmdParameter>(this.GetCmdParametersByTable(tableName));
            List<string> ColumnList = new List<string>();
            foreach (CmdParameter parameter in CmdParameterList)
            {
                ColumnList.Add(parameter.ParameterName);
            }
            return ColumnList.ToArray<string>();
        }
        /// <summary>  
        /// 取得資料表中的命令參數列陣設定
        /// </summary>  
        /// <param name="tableName">資料庫中的資料表名稱</param> 
        /// <returns>CmdParameter[]</returns> 
        public CmdParameter[] GetCmdParametersByTable(string tableName)
        {
            return SqlUtitly.GetCmdParameter(tableName);
        }
        #endregion

        #region 查詢資料相關
        /// <summary>  
        /// 查詢資料 
        /// </summary>  
        /// <param name="builder">選擇語法產生器</param>  
        /// <returns>DataSet</returns> 
        public DataSet GetDataBySelectBuilder(SelectCommandBuilder builder)
        {
            if (builder == null) throw new ArgumentNullException("builder");
            return SqlUtitly.GetDataByCommand(builder.GetCommandType(), builder.ToSelectCommandString(), builder.GetSelectParameters());//查詢DataSet資料
        }
        /// <summary>  
        /// 查詢資料 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param> 
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>  
        /// <returns>DataSet</returns> 
        public DataSet GetDataByParameter(string comText, CmdParameter[] comParms)
        {
            return SqlUtitly.GetDataByCommand(CommandType.Text, comText, comParms);//查詢DataSet資料
        }
        /// <summary>  
        /// 查詢資料 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param>  
        /// <returns>DataSet</returns> 
        public DataSet GetDataByText(string comText)
        {
            return SqlUtitly.GetDataByCommand(CommandType.Text, comText, null);
        }
        /// <summary>  
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

        /// <summary>
        /// 查詢Json資料
        /// </summary>
        /// <param name="comText">SQL 查詢字串</param>
        /// <param name="comParms">SQL 陳述式的參數陣列</param>
        /// <returns></returns>
        public string GetJsonByParameter(string comText, CmdParameter[] comParms)//查詢Json資料
        {
            return SqlUtitly.GetJsonByCommand(CommandType.Text, comText, comParms);
        }

        /// <summary>
        /// 查詢Json資料By Joe
        /// </summary>
        /// <param name="comText">SQL 查詢字串</param>
        /// <param name="comParms">SQL 陳述式的參數陣列</param>
        /// <returns></returns>
        public string GetJsonByParameterForJoe(string comText, CmdParameter[] comParms)//查詢Json資料By Joe
        {
            return SqlUtitly.GetJsonByCommandForJoe(CommandType.Text, comText, comParms);
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="listSQL">所有SQL字串List</param>
        /// <param name="listCount">各個查詢的ComParms數量</param>
        /// <param name="allComParms">所有ComParms集合</param>
        /// <returns>DataSet</returns>
        public DataSet GetDataSetByListParamByJoe(List<string> listSQL, List<int> listCount, CmdParameter[] allComParms)
        {
            DataSet ds = new DataSet();
            int ComParmsIndex = 0;

            if (listCount == null || allComParms == null)
            {
                for (int i = 0; i < listSQL.Count; i++)
                {
                    DataTable dt = new DataTable(i.ToString());
                    dt.Merge(SqlUtitly.GetDataByCommand(CommandType.Text, listSQL[i], null).Tables[0]);
                    ds.Tables.Add(dt);
                }
            }
            else
            {
                for (int i = 0; i < listSQL.Count; i++)
                {
                    CmdParameter[] comParms = new CmdParameter[listCount[i]];
                    for (int j = 0; j < listCount[i]; j++)
                    {
                        comParms[j] = allComParms[ComParmsIndex];
                        ComParmsIndex++;
                    }
                    DataTable dt = new DataTable(i.ToString());
                    dt.Merge(SqlUtitly.GetDataByCommand(CommandType.Text, listSQL[i], comParms).Tables[0]);
                    ds.Tables.Add(dt);
                }
            }
            return ds;
        }


        #endregion

        #region 執行命令相關
        /// <summary>  
        /// 更新資料 
        /// </summary>  
        /// <param name="builder">更新語法產生器</param>  
        /// <returns>int</returns> 
        public int ExecuteByUpdateBuilder(UpdateCommandBuilder builder)
        {
            if (builder == null) throw new ArgumentNullException("builder");
            return SqlUtitly.ExecuteByCommand(builder.GetCommandType(), builder.ToUpdateCommandString(), builder.GetAllUpdateParameters());
        }
        /// <summary>  
        /// 新增資料 
        /// </summary>  
        /// <param name="builder">新增語法產生器</param>  
        /// <returns>int</returns> 
        public int ExecuteByInsertBuilder(InsertCommandBuilder builder)
        {
            if (builder == null) throw new ArgumentNullException("builder");
            return SqlUtitly.ExecuteByCommand(builder.GetCommandType(), builder.ToInsertCommandString(), builder.GetInsertParameters());
        }
        /// <summary>  
        /// 執行命令 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param> 
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>  
        /// <returns>執行數</returns> 
        public int ExecuteByParameter(string comText, CmdParameter[] comParms)
        {
            return SqlUtitly.ExecuteByCommand(CommandType.Text, comText, comParms);
        }
        /// <summary>  
        /// 執行命令 
        /// </summary>  
        /// <param name="comText">Transact-SQL 陳述式</param> 
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>  
        /// <param name="intSN">自動編號後的數值</param>  
        /// <returns>執行數</returns> 
        public int ExecuteByParameter_ReSN(string comText, CmdParameter[] comParms, out int intSN)
        {
            if (/*SqlService.Pass == null ||*/ !SqlService.Pass)
            {
                throw new Exception("無存取權限!");
                //return 0;

            }
            return SqlUtitly.ExecuteByCommand_ReSN(CommandType.Text, comText, comParms, out intSN);
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
