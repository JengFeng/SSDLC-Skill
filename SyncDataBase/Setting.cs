using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Text;
using System.Linq;
using System.Diagnostics;

namespace SyncDataBase
{
    /// <summary>  
    /// 資料庫類別列舉
    /// </summary> 
    public enum DataBaseType
    {
        Server = 1,
        Remoting = 2
    }
    public sealed class Setting
    {
        #region 資料庫類別相關
        private static string _database = ConfigurationManager.AppSettings["Database"];
        /// <summary>  
        /// 本機主要的資料庫類別(預設使用的資料庫)
        /// </summary> 
        public static DataBaseType LocalDataBase//取得正在使用中的DB代號
        {
            get
            {
                if (string.IsNullOrEmpty(_database)) return DataBaseType.Server;//若抓不到web.config值時預設給DataBaseType.Server的值
                return (DataBaseType)Enum.Parse(typeof(DataBaseType), _database);
            }
        }
        /// <summary>  
        /// 正在使用中的第一個資料庫類別(會隨資料庫可用狀態改變)
        /// </summary> 
        public static DataBaseType UseDataBase = LocalDataBase;
        /// <summary>  
        /// 備用的第二個資料庫類別(會隨資料庫可用狀態改變)
        /// </summary> 
        public static DataBaseType ReserveDataBase//第二個資料庫代號
        {
            get
            {
                return UseDataBase == DataBaseType.Server ? DataBaseType.Remoting : DataBaseType.Server;
            }
        }
        /// <summary>  
        /// 連線失敗的資料庫類別集合記錄
        /// </summary> 
        private static List<DataBaseType> FailDataBaseTypeList = InitializeFailDataBase();//取得記憶體或SQL資料夾內是否有連線失敗記錄
        /// <summary>  
        /// 載入未處理之失敗的資料庫類別集合記錄
        /// </summary> 
        private static List<DataBaseType> InitializeFailDataBase()//取得SQL下DB連線失敗記錄
        {
            List<DataBaseType> faildatabasetypelist = new List<DataBaseType>();
            string[] typeNames = Enum.GetNames(typeof(DataBaseType));
            foreach (string name in typeNames)
            {
                DataBaseType type = (DataBaseType)Enum.Parse(typeof(DataBaseType), name);
                if (File.Exists(Setting.GetFailDataBaseFile(type))) faildatabasetypelist.Add(type);
            }
            return faildatabasetypelist;
        }
        /// <summary>  
        /// 設定連線失敗的資料庫類別集合記錄
        /// </summary>  
        /// <param name="type">資料庫類別</param>  
        /// <param name="status">連線是否成功</param> 
        /// <returns>string</returns> 
        public static void SetFailDataBaseTypeStatus(DataBaseType type, bool status)
        {
            if (status)//連線成功
            {

                //處理交易同步成功
                if (Setting.Synchronize(type))//
                {
                    //移除連線失敗的資料庫類別集合
                    FailDataBaseTypeList.Remove(type);
                }

            }
            else//連線失敗
            {

                if (!File.Exists(Setting.GetFailDataBaseFile(type)))//如果不存在Server 或 Remoting檔案    //if (!FailDataBaseTypeList.Contains(type))//沒有在SQL執行失敗名單內
                {
                    ////加入連線失敗的資料庫類別集合
                    //FailDataBaseTypeList.Add(type);

                    //設置記錄檔
                    Setting.AddFailDataBaseLog(type);//寫Server或Remoting檔
                }
            }
        }

        /// <summary>
        /// 記錄SQL Execute失敗時間
        /// </summary>
        /// <param name="type">是Server檔或是Remoting檔</param>
        /// <param name="strException">Exception Message</param>
        public static void SetExecuteFail(DataBaseType type, string strException)//記錄SQL Execute失敗時間
        {
            string SavedFileName = Setting.GetFailDataBaseFile(type);
            if (!File.Exists(SavedFileName))//如果不存在Server 或 Remoting檔案
            {
                //修改成新方式20131025By Joe
                FileStream stream = new FileStream(SavedFileName, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
                StreamWriter writer = new StreamWriter(stream, Encoding.UTF8);
                writer.Write(DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss") + " Execute Fail[" + strException + "]" + System.Environment.NewLine);
                writer.Flush();
                stream.Close();
            }
            else
            {
                string contents = File.ReadAllText(SavedFileName, Encoding.UTF8);//讀取內容
                if (contents.IndexOf("Execute Fail") < 0)//沒有Execute錯誤訊息時
                {
                    contents = System.Environment.NewLine + DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss") + " Execute Fail[" + strException + "]" + System.Environment.NewLine;
                    File.AppendAllText(SavedFileName, contents);
                }
            }
        }

        /// <summary>
        /// 記錄DB 連線失敗時間
        /// </summary>
        /// <param name="type">是Server檔或是Remoting檔</param>
        /// <param name="strException">Exception Message</param>
        public static void SetDBConeceFail(DataBaseType type, string strException)//記錄DB 連線失敗時間
        {
            string SavedFileName = Setting.GetFailDataBaseFile(type);
            if (!File.Exists(SavedFileName))//如果不存在Server 或 Remoting檔案
            {
                //修改成新方式20131025By Joe
                FileStream stream = new FileStream(SavedFileName, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
                StreamWriter writer = new StreamWriter(stream, Encoding.UTF8);
                writer.Write(DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss") + " DB Connect Fail[" + strException + "]" + System.Environment.NewLine);
                writer.Flush();
                stream.Close();
            }
            else
            {
                string contents = File.ReadAllText(SavedFileName, Encoding.UTF8);//讀取內容
                if (contents.IndexOf("DB Connect Fail") < 0)//沒有Execute錯誤訊息時
                {
                    contents = System.Environment.NewLine + DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss") + " DB Connect Fail[" + strException + "]" + System.Environment.NewLine;
                    File.AppendAllText(SavedFileName, contents);
                }
            }
        }


        /// <summary>  
        /// 資料庫類別是否連線失敗的資料庫
        /// </summary>  
        /// <param name="type">資料庫類別</param>  
        /// <returns>bool</returns> 
        public static bool IsFailDataBaseTypeStatus(DataBaseType type)
        {
            return FailDataBaseTypeList.Contains(type);
        }
        #endregion

        #region 連線字串相關
        /// <summary>  
        /// 第一個資料庫連線字串
        /// </summary> 
        private static string _connectionString1 = ConfigurationManager.ConnectionStrings["ConnectionString1"].ConnectionString;
        /// <summary>  
        /// 第一個資料庫連線字串
        /// </summary>
        private static string _connectionString2 = ConfigurationManager.ConnectionStrings["ConnectionString2"].ConnectionString;
        /// <summary>  
        /// Server連線字串
        /// </summary> 
        private static string ServerConnectionString
        {
            get
            {
                return _connectionString1;
            }
        }
        /// <summary>  
        /// Remoting連線字串
        /// </summary> 
        private static string RemotingConnectionString
        {
            get
            {
                return _connectionString2;
            }
        }
        /// <summary>  
        /// 正在使用的資料連線字串
        /// </summary> 
        public static string ConnectionString
        {
            get
            {
                if (Setting.UseDataBase == DataBaseType.Server) return Setting.ServerConnectionString;
                else return Setting.RemotingConnectionString;
            }
        }
        /// <summary>  
        /// 備用的資料連線字串
        /// </summary>
        public static string ReserveConnectionString
        {
            get
            {
                if (Setting.UseDataBase == DataBaseType.Server) return Setting.RemotingConnectionString;
                else return Setting.ServerConnectionString;
            }
        }
        /// <summary>  
        /// 轉換為備用的資料連線字串
        /// </summary>
        public static string ToChangeConnectionString()//在new SqlServer建構子時~若連線DB1失敗則會寫Server檔或Remoting檔並切換連線字串
        {
            //加入連線失敗記錄
            Setting.SetFailDataBaseTypeStatus(Setting.UseDataBase, false);//
            //交換連線
            if (Setting.UseDataBase == DataBaseType.Server)
            {
                Setting.UseDataBase = DataBaseType.Remoting;
                return Setting.RemotingConnectionString;
            }
            else
            {
                Setting.UseDataBase = DataBaseType.Server;
                return Setting.ServerConnectionString;
            }
        }
        /// <summary>  
        /// 轉換為備用的資料連線字串
        /// </summary>
        public static string GetConnectionString(DataBaseType type)
        {
            if (type == DataBaseType.Server)
                return Setting.ServerConnectionString;
            else
                return Setting.RemotingConnectionString;
        }
        #endregion

        #region 資料表相關
        /// <summary>  
        /// 資料庫中所有資料表名稱陣列
        /// </summary> 
        public static List<string> SchemaTables = Setting.GetSchemaTablesList();
        /// <summary>  
        /// 取得資料庫中所有資料表名稱陣列
        /// </summary>  
        /// <returns>List<string></returns> 
        private static List<string> GetSchemaTablesList()
        {
            List<string> TablesList = new List<string>();
            try
            {
                //下面的邏輯很奇怪
                //string connectionstring = UseDataBase == DataBaseType.Server ?
                //    Setting.ServerConnectionString : connectionstring = Setting.RemotingConnectionString;//判斷是哪個連線字串
                string connectionstring = Setting.GetConnectionString(UseDataBase);
                using (SqlServer sqlserver = new SqlServer(connectionstring, 5))
                {
                    string sql = "select name from sys.objects where type = 'U' and is_ms_shipped = 0 order by name;";
                    SqlDataReader reader = sqlserver.SelectReader(sql);
                    while (reader.Read())
                    {
                        TablesList.Add(Convert.ToString(reader[0]));
                    }
                }
            }
            catch { }
            return TablesList;
        }
        /// <summary>  
        /// 是否為資料表名稱陣列中的資料表
        /// </summary>  
        /// <param name="tableName">資料庫中的資料表名稱</param> 
        /// <returns>bool</returns> 
        public static bool IsSchemaTables(string tableName)
        {

            string tableNameUpper = tableName.ToUpper();
            //if (Setting.SchemaTables == null || Setting.SchemaTables.Count<1)
            SchemaTables = Setting.GetSchemaTablesList();


            //改寫By Joe
            var v = from t in SchemaTables.ToArray()
                    where t.ToString().ToUpper() == tableNameUpper
                    select t;

            if (v.Count() > 0)
                return true;
            else
                return false;


            //foreach (string name in Setting.SchemaTables)
            //{
            //    if (tableNameUpper.IndexOf(name.ToUpper()) > -1) 
            //        return true;
            //}
            //return false;
        }
        #endregion

        #region 資料表欄位相關
        /// <summary>  
        /// 資料表中的命令參數列陣設定
        /// </summary> 
        private static Dictionary<string, List<CmdParameter>> TableCmdParameters = new Dictionary<string, List<CmdParameter>>();
        /// <summary>  
        /// 取得資料表中的命令參數列陣設定
        /// </summary>  
        /// <param name="tableName">資料庫中的資料表名稱</param> 
        /// <returns>List<CmdParameter></returns> 
        public static List<CmdParameter> GetCmdParametersByTable(string tableName)
        {
            //統一使用大寫的表格名稱為Key
            string tableNameUpper = tableName.ToUpper();
            //已存在就不用再抓資料庫了
            foreach (KeyValuePair<string, List<CmdParameter>> kv in TableCmdParameters)
            {
                if (tableNameUpper.IndexOf(kv.Key) > -1)
                    return Setting.TableCmdParameters[kv.Key];
            }
            //沒有就重新抓
            List<CmdParameter> CmdParameterList = new List<CmdParameter>();
            try
            {
                string connectionstring = Setting.GetConnectionString(UseDataBase);
                using (SqlServer sqlserver = new SqlServer(connectionstring))
                {
                    string sql = "select COLUMN_NAME,DATA_TYPE,CHARACTER_MAXIMUM_LENGTH from information_schema.columns where table_name = @table_name;";
                    SqlDataReader reader = sqlserver.SelectReader(CommandType.Text, sql,
                        new CmdParameter() { ParameterName = "@table_name", Value = tableName });
                    while (reader.Read())
                    {
                        CmdParameter parameter = new CmdParameter();
                        parameter.ParameterName = Convert.ToString(reader[0]);
                        if (!reader.IsDBNull(1))
                        {
                            if (Convert.ToString(reader[1]) == "numeric")
                                parameter.SqlDbType = SqlDbType.Decimal;
                            else
                                parameter.SqlDbType = (SqlDbType)Enum.Parse(typeof(SqlDbType), Convert.ToString(reader[1]), true);

                        }
                        else parameter.SqlDbType = null;
                        if (!reader.IsDBNull(2)) parameter.Size = Convert.ToInt32(reader[2]);
                        else parameter.Size = null;
                        parameter.Value = DBNull.Value.ToString();
                        CmdParameterList.Add(parameter);
                    }
                }
            }
            catch { }
            //如果有值，則加入暫存中
            if (CmdParameterList.Count > 0)
                Setting.TableCmdParameters.Add(tableNameUpper, CmdParameterList);

            return CmdParameterList;
        }
        /// <summary>  
        /// 是否為資料表名稱陣列中的資料表
        /// </summary>  
        /// <param name="tableName">資料庫中的資料表名稱</param> 
        /// /// <param name="columnName">資料表的中欄位名稱</param> 
        /// <returns>bool</returns> 
        public static bool IsSchemaColumn(string tableName, string columnName)
        {
            string tableNameUpper = tableName.ToUpper();

            List<CmdParameter> tableList = Setting.GetCmdParametersByTable(tableNameUpper);
            if (tableList != null && tableList.Count > 0)
            {

                string columnNameUpper = columnName.ToUpper();
                foreach (CmdParameter cmd in tableList)
                {
                    if (columnNameUpper.IndexOf(cmd.ParameterName.ToUpper()) > -1)
                        return true;
                }
            }
            return false;
        }

        /// <summary>
        /// 檢查欄位是否存在Table中
        /// </summary>
        /// <param name="tableName">資料庫中的資料表名稱</param> 
        /// <param name="columnName">資料表的中欄位名稱</param>
        /// <returns></returns>
        public static bool CheckTableColumn(string tableName, string columnName)//檢查欄位是否存在Table中
        {
            string strSQL = @"SELECT COLUMN_NAME
                              FROM information_schema.columns 
                              WHERE table_name = @table_name ";
            SqlServer server = new SqlServer();
            DataTable dt = server.SelectDataSet(CommandType.Text, strSQL, new CmdParameter() { ParameterName = "@table_name", Value = tableName }).Tables[0];
            var v = from t in dt.AsEnumerable()
                    where t["COLUMN_NAME"].ToString().ToUpper() == columnName.ToUpper()
                    select t;
            if (v.Count() > 0)
                return true;
            else
                return false;

        }




        #endregion

        #region Transact-SQL 陳述式相關
        /// <summary>
        /// 寫入Sql記錄檔
        /// </summary> 
        /// <param name="comText">Transact-SQL 陳述式</param> 
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>  
        /// <returns>string</returns> 
        public static string getSqlString(string comText, CmdParameter[] comParms)
        {
            string sb = comText;
            sb = sb.Replace(",", " , ");//將所有豆號前後多空白
            sb = sb.Replace("(", " ( ");//將所有括號前後多空白
            sb = sb.Replace(")", " ) ");//將所有括號前後多空白
            sb += " ";
            if (comParms != null)
            {
                #region 第一次取代
                foreach (CmdParameter cmdparameter in comParms)
                {
                    //string value = cmdparameter.Value;
                    string value = Convert.ToString(cmdparameter.Value);
                    //時間型態
                    if (cmdparameter.SqlDbType == SqlDbType.DateTime || cmdparameter.SqlDbType == SqlDbType.SmallDateTime || cmdparameter.SqlDbType == SqlDbType.Date)
                    {
                        if (value.IndexOf("上午") > 0)
                        {
                            value = value.Replace("上午 ", " ");
                        }
                        int Index1 = value.IndexOf("下午");
                        if (Index1 > 0)//置換下午時間
                        {
                            int Index2 = value.IndexOf(":", Index1);
                            int Hour = Convert.ToInt32(value.Substring(Index1 + 3, Index2 - Index1 - 3));
                            value = value.Substring(0, Index1) + " " + (Hour > 12 ? Hour + 12 : Hour).ToString() + value.Substring(Index2, value.Length - Index2);

                        }
                        //如果字串內有單引號，則取代為二個單引號
                        value = value.Replace("'", "''");
                    }
                    else//一般型態
                    {
                        //如果字串內有單引號，則取代為二個單引號
                        value = value.Replace("'", "''");

                    }

                    string pname = cmdparameter.ParameterName;
                    if (!pname.StartsWith("@")) pname = "@" + pname;
                    //2021/10/29 修正 DBNull 
                    string content = "'" + value + "' ";
                    if (cmdparameter.Value == DBNull.Value) content = "NULL ";
                    if (sb.ToString().IndexOf(pname) == sb.ToString().LastIndexOf(pname))//此參數只有一筆時
                    {
                        //使用單引號包起來
                        sb = sb.Replace(pname + " ", content);
                        sb = sb.Replace(pname + "\r\n", content);
                        sb = sb.Replace(pname + "\t", content);
                        //sb = sb.Replace(pname + " ", "'" + value + "' ");
                        //sb = sb.Replace(pname + "\r\n", "'" + value + "' ");
                        //sb = sb.Replace(pname + "\t", "'" + value + "' ");
                    }
                    else
                    {
                        //使用單引號包起來
                        sb = sb.Replace(pname + " ", content);
                        sb = sb.Replace(pname + "\r\n", content);
                        sb = sb.Replace(pname + "\t", content);
                        //sb = sb.Replace(pname + " ", "'" + value + "' ");
                        //sb = sb.Replace(pname + "\r\n", "'" + value + "' ");
                        //sb = sb.Replace(pname + "\t", "'" + value + "' ");
                    }

                }
                #endregion

                #region 再補一次
                if (sb.ToString().IndexOf("@") > 0)//有漏掉的~再做一次
                {
                    foreach (CmdParameter cmdparameter in comParms)
                    {
                        string pname = cmdparameter.ParameterName;
                        if (!pname.StartsWith("@")) pname = "@" + pname;
                        if (sb.ToString().IndexOf(pname) < 0) continue;//沒有此參數跳過

                        //string value = cmdparameter.Value;
                        string value = Convert.ToString(cmdparameter.Value);
                        //時間型態
                        if (cmdparameter.SqlDbType == SqlDbType.DateTime || cmdparameter.SqlDbType == SqlDbType.SmallDateTime || cmdparameter.SqlDbType == SqlDbType.Date)
                        {
                            if (value.IndexOf("上午") > 0)
                            {
                                value = value.Replace("上午 ", " ");
                            }
                            int Index1 = value.IndexOf("下午");
                            if (Index1 > 0)//置換下午時間
                            {
                                int Index2 = value.IndexOf(":", Index1);
                                int Hour = Convert.ToInt32(value.Substring(Index1 + 3, Index2 - Index1 - 3));
                                value = value.Substring(0, Index1) + " " + (Hour > 12 ? Hour + 12 : Hour).ToString() + value.Substring(Index2, value.Length - Index2);

                            }
                            //如果字串內有單引號，則取代為二個單引號
                            value = value.Replace("'", "''");
                        }
                        else//一般型態
                        {
                            //如果字串內有單引號，則取代為二個單引號
                            value = value.Replace("'", "''");

                        }
                        //2021/10/29 修正 DBNull 
                        string content = "'" + value + "' ";
                        if (cmdparameter.Value == DBNull.Value) content = "NULL ";
                        if (sb.ToString().IndexOf(pname) == sb.ToString().LastIndexOf(pname))//此參數只有一筆時
                        {

                            //使用單引號包起來
                            sb = sb.Replace(pname + " ", content);
                            sb = sb.Replace(pname + "\r\n", content);
                            sb = sb.Replace(pname + "\t", content);
                            //sb = sb.Replace(pname + " ", "'" + value + "' ");
                            //sb = sb.Replace(pname + "\r\n", "'" + value + "' ");
                            //sb = sb.Replace(pname + "\t", "'" + value + "' ");
                        }
                        else
                        {
                            //使用單引號包起來
                            sb = sb.Replace(pname + " ", content);
                            sb = sb.Replace(pname + "\r\n", content);
                            sb = sb.Replace(pname + "\t", content);
                            //sb = sb.Replace(pname + " ", "'" + value + "' ");
                            //sb = sb.Replace(pname + "\r\n", "'" + value + "' ");
                            //sb = sb.Replace(pname + "\t", "'" + value + "' ");
                        }

                    }
                }
                #endregion

            }

            #region 舊方式
            //StringBuilder sb = new StringBuilder(comText);
            //sb.Replace(SqlKeyWord.COMMA, SqlKeyWord.SPACE + SqlKeyWord.COMMA + SqlKeyWord.SPACE);//將所有豆號前後多空白
            //sb.Replace(SqlKeyWord.LBRACKET, SqlKeyWord.SPACE + SqlKeyWord.LBRACKET + SqlKeyWord.SPACE);//將所有括號前後多空白
            //sb.Replace(SqlKeyWord.RBRACKET, SqlKeyWord.SPACE + SqlKeyWord.RBRACKET + SqlKeyWord.SPACE);//將所有括號前後多空白
            //sb.Append(SqlKeyWord.SPACE);
            //if (comParms != null)
            //{
            //    #region 第一次取代
            //    foreach (CmdParameter cmdparameter in comParms)
            //    {
            //        string value = cmdparameter.Value;
            //        //時間型態
            //        if (cmdparameter.SqlDbType == SqlDbType.DateTime || cmdparameter.SqlDbType == SqlDbType.SmallDateTime || cmdparameter.SqlDbType == SqlDbType.Date)
            //        {
            //            if (value.IndexOf("上午") > 0)
            //            {
            //                value = value.Replace("上午 ", " ");
            //            }
            //            int Index1 = value.IndexOf("下午");
            //            if (Index1 > 0)//置換下午時間
            //            {
            //                int Index2 = value.IndexOf(":", Index1);
            //                int Hour = Convert.ToInt32(value.Substring(Index1+3, Index2 - Index1 - 3));
            //                value = value.Substring(0, Index1) + " " + (Hour > 12 ? Hour + 12 : Hour).ToString() + value.Substring(Index2, value.Length - Index2);

            //            }
            //            //如果字串內有單引號，則取代為二個單引號
            //            value = value.Replace(SqlKeyWord.SINGLEQUOTATION, SqlKeyWord.SINGLEQUOTATION + SqlKeyWord.SINGLEQUOTATION);
            //        }
            //        else//一般型態
            //        {
            //            //如果字串內有單引號，則取代為二個單引號
            //            value = value.Replace(SqlKeyWord.SINGLEQUOTATION, SqlKeyWord.SINGLEQUOTATION + SqlKeyWord.SINGLEQUOTATION);

            //        }

            //        string pname = cmdparameter.ParameterName;
            //        if (!pname.StartsWith(SqlKeyWord.AT)) pname = SqlKeyWord.AT + pname;
            //        if (sb.ToString().IndexOf("Pname") == sb.ToString().LastIndexOf("Pname"))//此參數只有一筆時
            //        {
            //            //使用單引號包起來
            //            sb.Replace(pname + SqlKeyWord.SPACE, SqlKeyWord.SINGLEQUOTATION + value + SqlKeyWord.SINGLEQUOTATION + SqlKeyWord.SPACE);
            //        }
            //        else
            //        {
            //            //使用單引號包起來
            //            sb.Replace(pname + SqlKeyWord.SPACE, SqlKeyWord.SINGLEQUOTATION + value + SqlKeyWord.SINGLEQUOTATION + SqlKeyWord.SPACE);
            //        }

            //    }
            //    #endregion

            //    #region 再補一次
            //    if (sb.ToString().IndexOf("@") > 0)//有漏掉的~再做一次
            //    {
            //        foreach (CmdParameter cmdparameter in comParms)
            //        {
            //            string Pname = cmdparameter.ParameterName;
            //            if (!Pname.StartsWith(SqlKeyWord.AT)) Pname = SqlKeyWord.AT + Pname;
            //            if (sb.ToString().IndexOf("Pname") < 0) continue;//沒有此參數跳過

            //            string value = cmdparameter.Value;
            //            //時間型態
            //            if (cmdparameter.SqlDbType == SqlDbType.DateTime || cmdparameter.SqlDbType == SqlDbType.SmallDateTime || cmdparameter.SqlDbType == SqlDbType.Date)
            //            {
            //                if (value.IndexOf("上午") > 0)
            //                {
            //                    value = value.Replace("上午 ", " ");
            //                }
            //                int Index1 = value.IndexOf("下午");
            //                if (Index1 > 0)//置換下午時間
            //                {
            //                    int Index2 = value.IndexOf(":", Index1);
            //                    int Hour = Convert.ToInt32(value.Substring(Index1 + 3, Index2 - Index1 - 3));
            //                    value = value.Substring(0, Index1) + " " + (Hour > 12 ? Hour + 12 : Hour).ToString() + value.Substring(Index2, value.Length - Index2);

            //                }
            //                //如果字串內有單引號，則取代為二個單引號
            //                value = value.Replace(SqlKeyWord.SINGLEQUOTATION, SqlKeyWord.SINGLEQUOTATION + SqlKeyWord.SINGLEQUOTATION);
            //            }
            //            else//一般型態
            //            {
            //                //如果字串內有單引號，則取代為二個單引號
            //                value = value.Replace(SqlKeyWord.SINGLEQUOTATION, SqlKeyWord.SINGLEQUOTATION + SqlKeyWord.SINGLEQUOTATION);

            //            }

            //            string pname = cmdparameter.ParameterName;
            //            if (!pname.StartsWith(SqlKeyWord.AT)) pname = SqlKeyWord.AT + pname;
            //            if (sb.ToString().IndexOf("Pname") == sb.ToString().LastIndexOf("Pname"))//此參數只有一筆時
            //            {
            //                //使用單引號包起來
            //                sb.Replace(pname + System.Environment.NewLine, SqlKeyWord.SINGLEQUOTATION + value + SqlKeyWord.SINGLEQUOTATION + SqlKeyWord.SPACE);
            //            }
            //            else
            //            {
            //                //使用單引號包起來
            //                sb.Replace(pname + System.Environment.NewLine, SqlKeyWord.SINGLEQUOTATION + value + SqlKeyWord.SINGLEQUOTATION + SqlKeyWord.SPACE);
            //            }

            //        }
            //    }
            //    #endregion

            //}
            //sb.Append(System.Environment.NewLine);
            #endregion

            sb = sb.Replace("\r\n", " ");
            sb = sb.Replace("\n", " ");
            return sb.ToString();
        }

        /// <summary>
        /// 寫入Sql記錄檔
        /// </summary>
        /// <param name="databasetype">資料庫類別</param>
        /// <param name="now">現在的時間(做統一標準化同一時間)</param>
        /// <param name="Contents">內容</param>
        public static void WriteSqlLog(DataBaseType type, DateTime now, string contents)
        {
            string SavedFilePath = string.Format("{0}\\{1}\\{2}\\{3}\\",
                Setting.GetSavedFilePath(), now.ToString("yyyy-MM-dd"), now.ToString("HH"), now.ToString("mm"));

            if (!Directory.Exists(SavedFilePath))
                Directory.CreateDirectory(SavedFilePath);

            string SavedFileName = string.Format("{0}\\{1}.{2}", SavedFilePath, type.ToString(), SqlKeyWord.SQL);
            //記錄內容
            string SavedFileContents = contents.Replace(System.Environment.NewLine, string.Empty) + SqlKeyWord.SEMICOLON + System.Environment.NewLine;

            //修改成新方式20131025By Joe
            FileStream stream = new FileStream(SavedFileName, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
            StreamWriter writer = new StreamWriter(stream, Encoding.UTF8);
            writer.Write(SavedFileContents);
            writer.Flush();
            stream.Close();
            //File.AppendAllText(SavedFileName, SavedFileContents);
        }


        /// <summary>
        /// 寫入Sql記錄檔
        /// </summary>
        /// <param name="databasetype">資料庫類別</param>
        /// <param name="now">現在的時間(做統一標準化同一時間)</param>
        /// <param name="Contents">內容</param>
        public static void WriteSqlLog_New(DataBaseType type, DateTime now, string contents, out string strKey)//寫入Remoting.SQL檔
        {
            string SavedFilePath = string.Format("{0}\\{1}\\{2}\\",
                Setting.GetSavedFilePath(), now.ToString("yyyy-MM-dd"), now.ToString("HH"));

            if (!Directory.Exists(SavedFilePath))
                Directory.CreateDirectory(SavedFilePath);
            strKey = now.ToString("HHmmssfff") + GetRandom();
            string SavedFileName = string.Format("{0}\\{1}.{2}", SavedFilePath, type.ToString() + "_" + strKey, SqlKeyWord.SQL);
            //記錄內容
            contents = contents.Replace("\r\n", " ");
            contents = contents.Replace("\n", " ");
            string SavedFileContents = contents + ";\r\n";
            // string SavedFileContents = System.Environment.NewLine + contents.Replace(System.Environment.NewLine, string.Empty) + SqlKeyWord.SEMICOLON + System.Environment.NewLine;

            ////修改成新方式20131025By Joe
            //FileStream stream = new FileStream(SavedFileName, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
            //StreamWriter writer = new StreamWriter(stream, Encoding.UTF8);
            //writer.Write(SavedFileContents);
            //writer.Flush();
            //stream.Close();


            File.WriteAllText(SavedFileName, SavedFileContents);


        }
        #endregion

        #region 其他管理相關
        private static bool ConvertToBoolean(string boolString)
        {
            if (string.IsNullOrEmpty(boolString)) return false;
            return Convert.ToBoolean(boolString);
        }
        private static bool _IsBackup = ConvertToBoolean(ConfigurationManager.AppSettings["IsBackup"]);

        /// <summary>  
        /// 是否使用備份資料庫
        /// </summary> 
        public static bool IsBackup { get { return _IsBackup; } }

        private static bool _IsExecute = ConvertToBoolean(ConfigurationManager.AppSettings["IsExecute"]);
        /// <summary>  
        /// 是否可執行更新資料庫的動作(同一時間只能有一個服務執行更新)
        /// </summary> 
        public static bool IsExecute { get { return _IsExecute; } }

        private static readonly bool _IsCache = ConvertToBoolean(ConfigurationManager.AppSettings["IsCache"]);
        /// <summary>  
        /// 是否使用備份資料庫
        /// </summary> 
        public static bool IsCache { get { return _IsCache; } }

        /// <summary>  
        /// 取得放置記錄的基本路徑
        /// </summary>
        private static string GetSavedFilePath()//SQL資料夾路徑
        {
            string MapPath = System.Web.HttpContext.Current.Server.MapPath(".");
            string SavedFilePath = string.Format("{0}\\{1}\\", MapPath, SqlKeyWord.SQL);
            if (!Directory.Exists(SavedFilePath))
                Directory.CreateDirectory(SavedFilePath);
            return SavedFilePath;
        }
        /// <summary>  
        /// 加入連線失敗記錄
        /// </summary>
        private static void AddFailDataBaseLog(DataBaseType type)//SQL/Server 或SQL/Remoting 
        {
            string SavedFileName = Setting.GetFailDataBaseFile(type);
            //修改成新方式20131025By Joe
            FileStream stream = new FileStream(SavedFileName, FileMode.Append, FileAccess.Write, FileShare.ReadWrite);
            StreamWriter writer = new StreamWriter(stream, Encoding.UTF8);
            writer.Write(DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss") + System.Environment.NewLine);
            writer.Flush();
            stream.Close();

            //File.AppendAllText(SavedFileName, DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss") + System.Environment.NewLine);
        }
        /// <summary>  
        /// 刪除連線失敗記錄
        /// </summary>
        //private static void DeleteFailDataBaseLog(DataBaseType type)
        //{
        //    string SavedFileName = Setting.GetFailDataBaseFile(type);
        //    if (File.Exists(SavedFileName)) File.Delete(SavedFileName);
        //}
        /// <summary>  
        /// 取得連線失敗記錄設定的檔案位置
        /// </summary>
        private static string GetFailDataBaseFile(DataBaseType type)//取得SQL下DB連線失敗記錄 SQL/Server 或SQL/Remoting
        {
            string SavedFilePath = Setting.GetSavedFilePath();//取得SQL資料夾路徑
            string SavedFileName = string.Format("{0}{1}", SavedFilePath, type.ToString());//SQL/Server 或SQL/Remoting
            return SavedFileName;
        }
        /// <summary>  
        /// 取得記錄檔的陣列集合
        /// </summary> 
        public static List<string> GetRecordFiles(DataBaseType type)
        {
            #region 取得記錄檔 檔名及路徑
            string basePath = Setting.GetSavedFilePath();//記錄檔路徑
            string key = string.Format("{0}{1}{2}", basePath, type.ToString(), "_");//記錄檔檔名
            //string SavedFileName = Setting.GetFailDataBaseFile(type);//取得連線失敗記錄設定的檔案位置
            //string key = SavedFileName + "_";
            //string basePath = Setting.GetSavedFilePath();//取得放置記錄的基本路徑
            #endregion

            List<string> FileList = new List<string>();
            DirectoryInfo InfoDirectory = new DirectoryInfo(basePath);
            foreach (FileInfo file in InfoDirectory.GetFiles())
            {
                if (file.FullName.IndexOf(key) > -1)
                    FileList.Add(file.FullName.Substring(basePath.Length));
            }
            return FileList;
        }
        /// <summary>  
        /// 取得log檔內容
        /// </summary> 
        public static string GetLogFile(string filename)
        {
            StringBuilder sb = new StringBuilder();
            string basePath = Setting.GetSavedFilePath();//取得放置記錄的基本路徑
            string file = basePath + filename;
            if (File.Exists(file))
            {
                string[] lines = File.ReadAllLines(file, Encoding.UTF8);
                //從第二行開始是記錄(第一行是失敗時間)
                for (int i = 1; i < lines.Length; i++)
                    sb.Append(lines[i]).Append(System.Environment.NewLine);
            }
            return sb.ToString();
        }

        /// <summary>  
        /// 取得失敗資料庫的時間內容
        /// </summary> 
        public static string GetFailDataBaseDate(DataBaseType type)
        {
            string FailDayString = string.Empty;
            string SavedFileName = Setting.GetFailDataBaseFile(type);
            if (File.Exists(SavedFileName))
            {
                FailDayString = File.ReadAllText(SavedFileName);
            }
            return FailDayString;
        }

        /// <summary>  
        /// 在有連線失敗的記錄之後 執行同步
        /// </summary> 
        public static bool Synchronize(DataBaseType type)//目前無使用
        {
            string SavedFileName = Setting.GetFailDataBaseFile(type);//取得Server 或 Remoting檔案路徑
            if (File.Exists(SavedFileName))//如果存在該檔
            {
                string FailDayString = File.ReadAllText(SavedFileName);//讀取內容
                DateTime FailDay = DateTime.Today;
                if (!string.IsNullOrEmpty(FailDayString))//若不是空的
                    FailDay = Convert.ToDateTime(FailDayString.Trim());//讀取失敗日期(為內容內顯示之日期)
                //檔案做備份
                string NewLogFileName = SavedFileName + "_" + DateTime.Now.ToString("yyyyMMddHHmm") + ".log";//記錄執行同步日期
                File.Move(SavedFileName, NewLogFileName);
                //開始處理SQL
                string hourStr, minuteStr;
                int hour, minute;
                DirectoryInfo InfoDirectory = new DirectoryInfo(Setting.GetSavedFilePath());//取得SQL資料夾的路徑
                foreach (DirectoryInfo infoYMD in InfoDirectory.GetDirectories())//裡面所有的資料夾(日期資料夾)(年-月-日)
                {
                    //年月日
                    DateTime YMD;
                    DateTime.TryParse(infoYMD.Name, out YMD);
                    //if (YMD < new DateTime(FailDay.Year, FailDay.Month, FailDay.Day)) continue;//跳過「失敗日期」之前的「日期資料夾」
                    foreach (DirectoryInfo infoHour in infoYMD.GetDirectories())//裡面所有的資料夾(小時)
                    {
                        //時
                        hourStr = infoHour.Name;
                        int.TryParse(hourStr, out hour);
                        //if (new DateTime(YMD.Year, YMD.Month, YMD.Day, hour, 0, 0) < new DateTime(FailDay.Year, FailDay.Month, FailDay.Day, FailDay.Hour, 0, 0)) continue;//跳過「失敗日期」之前的「日期資料夾」
                        foreach (DirectoryInfo infoMinute in infoHour.GetDirectories())//裡面所有的資料夾(分鐘)
                        {
                            //分
                            minuteStr = infoMinute.Name;
                            int.TryParse(minuteStr, out minute);
                            //if (new DateTime(YMD.Year, YMD.Month, YMD.Day, hour, minute, 0) < new DateTime(FailDay.Year, FailDay.Month, FailDay.Day, FailDay.Hour, FailDay.Minute, 0)) continue;//跳過「失敗日期」之前的「日期資料夾」
                            //處理失敗的話
                            if (!ExecuteSql(type, infoMinute, NewLogFileName))
                            {
                                //更新日期 新的Server檔或Remoting檔
                                File.AppendAllText(SavedFileName, new DateTime(YMD.Year, YMD.Month, YMD.Day, hour, minute, 0).ToString("yyyy/MM/dd HH:mm:ss"));
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        }
        /// <summary>  
        /// 執行Transact-SQL 陳述式
        /// </summary>
        private static bool ExecuteSql(DataBaseType type, DirectoryInfo info, string LogFile)//目前無使用
        {
            bool flag = true;
            string SavedFileName = string.Format("{0}\\{1}.{2}", info.FullName, type.ToString(), SqlKeyWord.SQL);//檔名Server.SQL 或 Remoting.SQL
            if (File.Exists(SavedFileName))//存在該檔
            {
                string[] sqlStringArray = File.ReadAllLines(SavedFileName);
                for (int i = 0; i < sqlStringArray.Length; i++)
                {
                    if (sqlStringArray[i].Trim() != "" && sqlStringArray[i].Length > 1 && sqlStringArray[i].Trim()[0] != '-' && sqlStringArray[i].Trim()[1] != '-')//開頭不是--才執行
                    {
                        int count = 0;
                        try
                        {
                            using (SqlServer server = new SqlServer(Setting.GetConnectionString(type)))
                            {
                                count = server.ExecuteNonQuery(sqlStringArray[i]);
                                sqlStringArray[i] = "";
                            }
                            if (count > 0)
                            {
                                sqlStringArray[i] = SqlKeyWord.EXPLAIN + sqlStringArray[i];
                            }
                            else
                            {
                                flag = false;
                                break;
                            }
                        }
                        catch
                        {
                            flag = false;
                            break;
                        }
                        finally
                        {
                            //在log檔內記錄(成功/失敗)[執行同步時間] 執行之檔名 Line {3} Run {4}.{5}
                            string contents = string.Format("是否成功:({0}) 時間:[{1}] 檔名:{2} 總數{3} 執行數{4}.{5}", flag, DateTime.Now.ToString(), SavedFileName, (i + 1), count, System.Environment.NewLine);
                            File.AppendAllText(LogFile, contents);
                        }
                    }
                }
                //備份檔案 不需要備份
                File.Move(SavedFileName, SavedFileName + ".bak");

                //儲存更新檔
                File.AppendAllLines(SavedFileName, sqlStringArray);

                if (flag && !ConvertToBoolean(ConfigurationManager.AppSettings["SaveExecuteSQLLog"]))//成功後刪除該檔
                {
                    File.Delete(SavedFileName);
                }
            }
            return flag;
        }


        /// <summary>  
        /// 在有連線失敗的記錄之後 執行同步
        /// </summary> 
        public static bool Synchronize_New(DataBaseType type)//新 執行同步 目前無使用
        {
            string SavedFileName = Setting.GetFailDataBaseFile(type);//取得Server 或 Remoting檔案路徑
            if (File.Exists(SavedFileName))//如果存在該檔
            {

                //將Server或Remoting檔移成log
                string NewLogFileName = SavedFileName + "_" + DateTime.Now.ToString("yyyyMMddHHmmfff") + GetRandom() + ".log";//記錄執行同步日期
                File.Move(SavedFileName, NewLogFileName);
                //開始處理SQL
                DirectoryInfo InfoDirectory = new DirectoryInfo(Setting.GetSavedFilePath());//取得SQL資料夾的路徑
                foreach (DirectoryInfo infoYMD in InfoDirectory.GetDirectories())//裡面所有的資料夾(日期資料夾)(年-月-日)
                {
                    //年月日
                    DateTime YMD;
                    DateTime.TryParse(infoYMD.Name, out YMD);
                    foreach (DirectoryInfo infoHour in infoYMD.GetDirectories())//裡面所有的資料夾(小時)
                    {
                        FileInfo[] Files = infoHour.GetFiles(type.ToString() + "*.SQL");
                        foreach (FileInfo F in Files)
                        {
                            if (F.FullName.IndexOf(".bak") > 0) continue;//是bak檔的跳過
                            if (!ExecuteSql_New(type, F, NewLogFileName))//執行SQL
                            {
                                //更新日期 新的Server檔或Remoting檔
                                string strTime = string.Format(@"{0}/{1}/{2} {3} {4}",
                                                                  YMD.Year.ToString(),
                                                                  YMD.Month.ToString(),
                                                                  YMD.Day.ToString(),
                                                                  infoHour.Name,
                                                                  F.Name);
                                File.AppendAllText(SavedFileName, strTime);

                                if (type == DataBaseType.Remoting)
                                    continue;//若是Remoting執行失敗則跳過 跑下一句.SQL
                                return false;
                            }
                        }

                    }
                }
            }
            return true;
        }
        /// <summary>  
        /// 執行Transact-SQL 陳述式
        /// </summary>
        private static bool ExecuteSql_New(DataBaseType type, FileInfo info, string LogFile)
        {
            bool flag = true;
            string SavedFileName = info.FullName;
            if (File.Exists(SavedFileName))//存在該檔(.SQL)
            {


                string strSQL = File.ReadAllText(SavedFileName);
                //讀完馬上刪除該檔，防下一支程式使用。
                if (ConvertToBoolean(ConfigurationManager.AppSettings["SaveExecuteSQLBak"]))//是否儲存bak檔
                    File.Move(SavedFileName, SavedFileName + ".bak");//將.SQL檔案移動成.bak
                else
                    File.Delete(SavedFileName);

                #region Read ALL Text

                if (strSQL.Trim() != "" && strSQL.Trim() != ";" && strSQL.Length > 1 && strSQL.Trim()[0] != '-' && strSQL.Trim()[1] != '-')//開頭不是--才執行
                {
                    int count = 0;
                    bool Success = true;
                    string ErrMessage = "無";
                    try
                    {
                        using (SqlServer server = new SqlServer(Setting.GetConnectionString(type)))
                        {
                            try
                            {
                                count = server.ExecuteNonQuery(strSQL);
                            }
                            catch (Exception ex)
                            {
                                ErrMessage = ex.Message;
                                Success = false;
                            }
                        }
                        if (Success)
                            strSQL = SqlKeyWord.EXPLAIN + strSQL;
                        else
                            flag = false;
                    }
                    catch
                    {
                        flag = false;
                    }
                    finally
                    {
                        //在log檔內記錄(成功/失敗)[執行同步時間] 執行之檔名 Line {3} Run {4}.{5}
                        string contents = string.Format("是否成功:({0}) 執行時間:[{1}] 檔名:[{2}] 總數:[{3}] 執行數:[{4}] 錯誤訊息:[{5}].{6}執行SQL:[{7}]{8}",
                                                         flag,
                                                         DateTime.Now.ToString(),
                                                         info.Name,
                                                         1,
                                                         count,
                                                         ErrMessage,
                                                         System.Environment.NewLine,
                                                         strSQL,
                                                         System.Environment.NewLine);
                        File.AppendAllText(LogFile, contents);
                    }
                }

                #endregion
                #region Read Line
                //string[] sqlStringArray = File.ReadAllLines(SavedFileName);
                //for (int i = 0; i < sqlStringArray.Length; i++)
                //{
                //    if (sqlStringArray[i].Trim() != "" && sqlStringArray[i].Trim() != ";" && sqlStringArray[i].Length > 1 && sqlStringArray[i].Trim()[0] != '-' && sqlStringArray[i].Trim()[1] != '-')//開頭不是--才執行
                //    {
                //        int count = 0;
                //        bool Success = true;
                //        string ErrMessage = "無";
                //        try
                //        {
                //            using (SqlServer server = new SqlServer(Setting.GetConnectionString(type)))
                //            {
                //                try
                //                {
                //                    count = server.ExecuteNonQuery(strSQL);
                //                }
                //                catch (Exception ex)
                //                {
                //                    ErrMessage = ex.Message;
                //                    Success = false;
                //                }
                //            }
                //            if (Success)
                //            {
                //                sqlStringArray[i] = SqlKeyWord.EXPLAIN + strSQL;
                //            }
                //            else
                //            {
                //                flag = false;
                //                break;
                //            }

                //            //if (count > 0)
                //            //{
                //            //    sqlStringArray[i] = SqlKeyWord.EXPLAIN + sqlStringArray[i];
                //            //}
                //            //else
                //            //{
                //            //    flag = false;
                //            //    break;
                //            //}
                //        }
                //        catch
                //        {
                //            flag = false;
                //            break;
                //        }
                //        finally
                //        {
                //            //在log檔內記錄(成功/失敗)[執行同步時間] 執行之檔名 Line {3} Run {4}.{5}
                //            string contents = string.Format("是否成功:({0}) 執行時間:[{1}] 檔名:[{2}] 總數:[{3}] 執行數:[{4}] 錯誤訊息:[{5}].{6}執行SQL:[{7}]{8}", 
                //                                             flag, 
                //                                             DateTime.Now.ToString(), 
                //                                             info.Name, (i + 1), 
                //                                             count,
                //                                             ErrMessage, 
                //                                             System.Environment.NewLine,
                //                                             sqlStringArray[i],
                //                                             System.Environment.NewLine);
                //            File.AppendAllText(LogFile, contents);
                //        }
                //    }
                //}
                //if (ConvertToBoolean(ConfigurationManager.AppSettings["SaveExecuteSQLBak"]))//是否儲存bak檔
                //    File.Move(SavedFileName, SavedFileName + ".bak");//將.SQL檔案移動成.bak
                //else
                //    File.Delete(SavedFileName);

                //if (!flag || ConvertToBoolean(ConfigurationManager.AppSettings["SaveExecuteSQLLog"]))//執行SQL失敗 或是設定儲存成功.SQL檔時
                //{
                //    Random random = new Random();
                //    int r = random.Next(0, 99999);//取唯一數
                //    string NewFileName = SavedFileName.Substring(0, SavedFileName.IndexOf(".SQL") - 5) + r.ToString().PadLeft(5, '0') + ".SQL";
                //    File.AppendAllLines(NewFileName, sqlStringArray);//儲存新的.SQL檔
                //}
                #endregion



                if (!flag || ConvertToBoolean(ConfigurationManager.AppSettings["SaveExecuteSQLLog"]))//執行SQL失敗 或是設定儲存成功.SQL檔時
                {
                    Random random = new Random();
                    int r = random.Next(0, 99999);//取唯一數
                    string NewFileName = SavedFileName.Substring(0, SavedFileName.IndexOf(".SQL") - 6) + GetRandom() + ".SQL";
                    File.WriteAllText(NewFileName, strSQL);//儲存新的.SQL檔
                }
            }
            return flag;
        }


        public static string GetRandom()
        {
            int seed = DateTime.Now.Millisecond;
            Random random = new Random(seed);
            int r = random.Next(0, 99999);//取唯一數

            return "_" + r.ToString().PadLeft(5, '0');
        }



        #endregion



        public static void OpenSyncWork()//開啟同步工具
        {
            bool AutoOpen = false;
            if (!Boolean.TryParse(ConfigurationManager.AppSettings["IsAutoOpenSyncWork"], out AutoOpen))//是否自動開啟同步工具
                AutoOpen = false;

            if (!AutoOpen) return;//未開啟即返回

            Process process = new Process();
            string strPath = string.Format(@"{0}\WRBSyncWork\bin\Debug\{1}",
                                              System.Web.HttpContext.Current.Server.MapPath("."),
                                              "WRBSyncWork.exe");
            process.StartInfo.FileName = strPath;//執行檔實體位置
            process.StartInfo.Arguments = ProcessWindowStyle.Normal.ToString();
            process.Start();
        }

        public static void SaveAllDayLog(string Log)//儲存每日Log
        {
            Log = Log.Replace("\r\n", " ");
            Log = Log.Replace("\n", " ");
            string strFile = string.Format(@"{0}\\{1}{2}{3}",
                                             Setting.GetSavedFilePath(),
                                             "AllDayLog_",
                                              DateTime.Now.ToString("yyyyMMdd"),
                                              ".txt");//取得SQL資料夾路徑

            File.AppendAllText(strFile, Log + "\r\n");


            ////寫入資料(可同時讀檔 存取?)
            //FileStream stream = new FileStream(strFile, FileMode.Append, FileAccess.ReadWrite, FileShare.ReadWrite);//使用覆寫方式
            //StreamWriter sw = new StreamWriter(stream, Encoding.UTF8);
            //sw.Write(Log + "\r\n");
            //sw.Flush();
            //sw.Close();

        }
    }
}