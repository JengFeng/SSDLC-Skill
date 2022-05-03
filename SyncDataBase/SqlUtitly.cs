using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;
using Newtonsoft.Json;
using System.Threading;
using System.Configuration;
using System.Text;

namespace SyncDataBase
{
    /// <summary>  
    /// 參數確認型態
    /// </summary> 
    public enum CheckParameterType
    {
        Select,
        Execute
    }
    public sealed class SqlUtitly
    {
        //檢查Client是否為允許的IP
        public bool CheckClientIP()
        {
            //允許的IP名單
            List<string> listIP = new List<string>();
            listIP.Add("");
            listIP.Add("");
            listIP.Add("");
            for (int i = 0; i < listIP.Count; i++)
                if (HttpContext.Current.Request.UserHostAddress.IndexOf(listIP[i].Trim()) > -1)
                    return true;

            return false;
        }
        /// <summary>  
        /// 確認傳入參數是否正確
        /// </summary>  
        /// <param name="parameterType">參數確認型態</param> 
        /// <param name="comType">命令類別</param> 
        /// <param name="comText">Transact-SQL 陳述式</param> 
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列(沒用到!?)</param>  
        public static void CheckParameter(CheckParameterType parameterType, CommandType comType, string comText, CmdParameter[] comParms)//comParms沒用到!?
        {
            switch (parameterType)
            {
                case CheckParameterType.Select:
                    if (comType == CommandType.TableDirect)
                    {
                        if (string.IsNullOrEmpty(comText)) throw new ArgumentNullException("tableName");
                    }
                    else
                    {
                        if (string.IsNullOrEmpty(comText)) throw new ArgumentNullException("comText");
                        //Transact-SQL 陳述式轉大寫檢查(因為SQL語法大小寫都可以使用)
                        //string selectStr = comText.ToUpper();

                        //使用大寫來比對是否包含下列字串    (20131014因欄位名稱會包含到~所以取消掉)          
                        //if (selectStr.IndexOf(SqlKeyWord.UPDATE) > 0) throw new Exception("使用非法 Transact-SQL 陳述式" + SqlKeyWord.UPDATE);
                        //else if (selectStr.IndexOf(SqlKeyWord.INSERT) > 0) throw new Exception("使用非法 Transact-SQL 陳述式" + SqlKeyWord.INSERT);
                        //else if (selectStr.IndexOf(SqlKeyWord.DELETE) > 0) throw new Exception("使用非法 Transact-SQL 陳述式" + SqlKeyWord.DELETE);

                    }
                    break;
                case CheckParameterType.Execute:
                    if (string.IsNullOrEmpty(comText)) throw new ArgumentNullException("comText");
                    //Transact-SQL 陳述式轉大寫檢查(因為SQL語法大小寫都可以使用)
                    string executeStr = comText.ToUpper();
                    if (Setting.IsExecute == false) throw new Exception("不提供執行資料庫更新動作的服務");
                    else
                    {
                        if (comType == CommandType.Text)
                        {
                            if (executeStr.IndexOf(SqlKeyWord.UPDATE) == -1 && executeStr.IndexOf(SqlKeyWord.INSERT) == -1 && executeStr.IndexOf(SqlKeyWord.DELETE) == -1 &&
                            executeStr.IndexOf(SqlKeyWord.ALTER) == -1 && executeStr.IndexOf(SqlKeyWord.CREATE) == -1 && executeStr.IndexOf(SqlKeyWord.PROCEDURE) == -1 &&
                            executeStr.IndexOf(SqlKeyWord.FUNCTION) == -1 && executeStr.IndexOf(SqlKeyWord.VIEW) == -1 && executeStr.IndexOf(SqlKeyWord.TABLE) == -1 &&
                            executeStr.IndexOf(SqlKeyWord.EXECUTE) == -1 && executeStr.IndexOf(SqlKeyWord.EXEC) == -1)
                                throw new Exception("(EXECUTE)使用非法 Transact-SQL 陳述式");
                        }
                    }
                    break;
            }
        }
        /// <summary>  
        /// 取得資料庫中所有資料表名稱陣列 
        /// </summary> 
        public static string[] GetTables()
        {
            return Setting.SchemaTables.ToArray<string>();
        }
        /// <summary>  
        /// 取得資料表中的命令參數列陣設定
        /// </summary> 
        public static CmdParameter[] GetCmdParameter(string tableName)
        {
            CheckParameter(CheckParameterType.Select, CommandType.TableDirect, tableName, null);//確認傳入參數列陣是否正確
            return Setting.GetCmdParametersByTable(tableName).ToArray();//取得資料表中的命令參數列陣設定
        }
        /// <summary>  
        /// 查詢DataSet資料 
        /// </summary>  
        public static DataSet GetDataByCommand(CommandType comType, string comText, CmdParameter[] comParms)
        {
            //先檢查自訂的驗證
            if (/*SqlService.Pass == null ||*/ !SqlService.Pass)
            {
                throw new Exception("無存取權限!-1");
                //return null;
            }

            CheckParameter(CheckParameterType.Select, comType, comText, comParms);//確認傳入參數是否正確
            DataSet dataset = null;
            try
            {                
                string key = string.Empty;
                //是否使用快取
                if (Setting.IsCache)
                {
                    //將語法跟所有條件組成字串後加密 當做Key值，去找看看記憶體是否已有快取資料

                    //---取得MD5的關鍵主鍵---
                    StringBuilder source = new StringBuilder("GetDataByCommand");
                    source.AppendFormat("({0})[{1}]", comType.ToString(), comText);
                    if (comParms != null) foreach (var parm in comParms) source.AppendFormat("|{0}", parm.Value);
                    key = SqlMemoryCache.MD5HashKey(source.ToString());
                    //---檢查快取是否有資料---
                    dataset = SqlMemoryCache.GetValue(key) as DataSet;
                    //---返回快取資料---
                    if (dataset != null) return dataset;
                }

                //若無使用快取 或 使用快取但是無cache資料時(第一次撈資料)
                //取得查詢資料
                using (SqlServer server = new SqlServer())
                    dataset = server.SelectDataSet(comType, comText, comParms);

                //---加入快取---
                if (Setting.IsCache) SqlMemoryCache.Add(key, dataset);
            }
            catch (Exception e) { throw e; }
            return dataset;
        }
        /// <summary>  
        /// 查詢Scalar資料(執行查詢並回傳結果第一列第一欄)
        /// </summary>  
        public static string GetScalarByCommand(CommandType comType, string comText, CmdParameter[] comParms)
        {
            CheckParameter(CheckParameterType.Select, comType, comText, comParms);
            object obj = null;
            try
            {
                string key = string.Empty;
                //是否使用快取
                if (Setting.IsCache)
                {
                    //將語法跟所有條件組成字串後加密 當做Key值，去找看看記憶體是否已有快取資料

                    //---取得MD5的關鍵主鍵---
                    StringBuilder source = new StringBuilder("GetScalarByCommand");
                    source.AppendFormat("({0})[{1}]", comType.ToString(), comText);
                    if (comParms != null) foreach (var parm in comParms) source.AppendFormat("|{0}", parm.Value);
                    key = SqlMemoryCache.MD5HashKey(source.ToString());
                    //---檢查快取是否有資料---
                    obj = SqlMemoryCache.GetValue(key);
                    //---返回快取資料---
                    if (obj != null) return Convert.ToString(obj);
                }
                //若無使用快取 或 使用快取但是無cache資料時(第一次撈資料)
                //取得查詢資料
                using (SqlServer server = new SqlServer())
                    obj = server.SelectScalar(comType, comText, comParms);

                //---加入快取---
                if (Setting.IsCache) SqlMemoryCache.Add(key, obj);
            }
            catch (Exception e) { throw e; }
            return Convert.ToString(obj);
        }
        /// <summary>  
        /// 查詢Json資料 
        /// </summary>  
        public static string GetJsonByCommand(CommandType comType, string comText, CmdParameter[] comParms)
        {
            DataSet dataset = GetDataByCommand(comType, comText, comParms);

            return JsonConvert.SerializeObject(dataset);
        }

        /// <summary>
        /// 查詢Json資料By Joe
        /// </summary>
        /// <param name="comType">comType</param>
        /// <param name="comText">SQL語法字串</param>
        /// <param name="comParms">WHERE參數陣列</param>
        /// <returns></returns>
        public static string GetJsonByCommandForJoe(CommandType comType, string comText, CmdParameter[] comParms)//查詢Json資料By Joe
        {
            DataTable dt = GetDataByCommand(comType, comText, comParms).Tables[0];
            return TransferToJson(null, dt);
        }

        /// <summary>  
        /// 執行命令 
        /// </summary>  
        public static int ExecuteByCommand(CommandType comType, string comText, CmdParameter[] comParms)//主要執行SQL方法
        {
            if (/*SqlService.Pass == null ||*/ !SqlService.Pass)
            {
                throw new Exception("無存取權限!-2");
                //return 0;
            }

            #region New
            bool DB1Connc = false;
            bool DB1Execu = true;
            string DB1Exception = "DB1同步錯誤，請查看Server.log";
            bool DB2Connc = false;
            bool DB2Execu = true;
            string DB2Exception = "DB2同步錯誤，請查看Remoting.log";
            bool SaveAllDayLog;
            if (!Boolean.TryParse(ConfigurationManager.AppSettings["SaveAllDayLog"], out SaveAllDayLog))//是否記錄每日所有Error Log
                SaveAllDayLog = false;

            bool SaveDB1ExecuLog;
            if (!Boolean.TryParse(ConfigurationManager.AppSettings["SaveDB1ExecuLog"], out SaveDB1ExecuLog))//是否將DB1執行錯誤記錄至每日log
                SaveDB1ExecuLog = false;

            //檢查參數是否錯誤
            CheckParameter(CheckParameterType.Execute, comType, comText, comParms);
            //DB1執行成功的數量
            int UseCount = 0;
            //DB2執行成功的數量
            int ReserveCount = 0;

            //如果有自動編號參數的話，傳回的下一個自動編號，若無則為0
            int identity = 0;
            //有自動編號參數的話，傳回的更新後的T-SQL語法
            string exeText = string.Empty;
            #region 第一資料庫執行
            try
            {
                using (SqlServer server = new SqlServer())
                {
                    try
                    {
                        DB1Connc = true;//連線成功

                        //自動取得編號與執行T-SQL語法
                        exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
                        //執行第一個資料庫 T-SQL語法
                        UseCount = server.ExecuteNonQuery(comType, exeText, comParms);

                    }
                    catch (Exception ex)
                    {
                        DB1Execu = false;
                        DB1Exception = ex.Message + ex.StackTrace;
                    }
                }
            }
            catch (Exception e)
            {
                DB1Connc = false;//連線失敗
                DB1Exception = e.Message;
            }

            #endregion
            //20131108甫任新策略 DB1失敗直接Return
            if (!DB1Connc)//
            {
                if (SaveAllDayLog)//是否記錄每日所有Error Log
                {
                    DateTime dateTime = DateTime.Now;
                    string strKey = dateTime.ToString("HHmmssfff") + Setting.GetRandom();
                    Setting.SaveAllDayLog("錯誤訊息:[DB1連線失敗]，時間:[" + DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，KEY:[" + strKey + "]");
                }
                throw new Exception("DB1連線失敗，原因:" + DB1Exception);
            }
            if (!DB1Execu)
            {

                if (SaveDB1ExecuLog)//是否將SQL執行錯誤記錄在 每日Log
                {
                    //取得Transact-SQL 陳述式的文字
                    string sqlString2 = Setting.getSqlString(exeText, comParms);
                    DateTime dateTime = DateTime.Now;
                    string strKey = dateTime.ToString("HHmmssfff") + Setting.GetRandom();
                    Setting.SaveAllDayLog("錯誤訊息:[Server 執行SQL失敗，" + DB1Exception + "]，時間:[" + DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString2 + "]，KEY:[" + strKey + "]");
                }

                throw new Exception("DB1 SQL執行失敗，原因:[" + DB1Exception + "]，SQL:[" + comText + "]");
            }

            #region 第二資料庫執行
            //第二個資料庫同步
            try
            {
                //如果需要備份的話
                if (Setting.IsBackup)//可備份
                {
                    //執行第二個資料庫
                    using (SqlServer server = new SqlServer(DataBaseType.Remoting))
                    {
                        try
                        {
                            DB2Connc = true;//連線成功

                            if (!DB1Connc)//DB1連線失敗時 要使用DB2取自動編號
                            {
                                //自動取得編號與執行T-SQL語法
                                exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
                            }

                            ReserveCount = server.ExecuteNonQuery(comType, exeText, comParms);//執行這次的SQL
                        }
                        catch (Exception ex)
                        {
                            DB2Execu = false;
                            DB2Exception = ex.Message;
                        }
                    }

                }
                else
                {
                    DB2Exception = "手動關閉同步動作(Web.config內設定)";
                }

            }
            catch (Exception e)
            {
                DB2Connc = false;//連線失敗
                DB2Exception = e.Message;
            }

            #endregion
            //取得Transact-SQL 陳述式的文字
            string sqlString = Setting.getSqlString(exeText, comParms);

            bool IsAutoOpenSyncWork;
            if (!Boolean.TryParse(ConfigurationManager.AppSettings["IsAutoOpenSyncWork"], out IsAutoOpenSyncWork))//是否自動呼叫同步程式
                IsAutoOpenSyncWork = false;


            #region 最終執行
            if (DB1Connc)//DB1 連線成功
            {
                if (DB2Connc)//DB2 連線成功
                {
                    if (DB1Execu)//DB1 執行SQL成功
                    {
                        if (DB2Execu)//DB2 執行SQL成功
                        {

                        }
                        else//DB2 執行SQL失敗
                        {
                            DateTime dateTime = DateTime.Now;
                            string strKey;
                            if (Setting.IsBackup)//可備份
                            {
                                //寫入Remoting.SQL檔
                                Setting.WriteSqlLog_New(DataBaseType.Remoting, dateTime, sqlString, out strKey);

                                if (IsAutoOpenSyncWork)//有允許自動同步時
                                    Setting.OpenSyncWork();//開啟同步程式
                            }
                            else
                                strKey = dateTime.ToString("HHmmssfff") + Setting.GetRandom();
                            if (SaveAllDayLog)//是否記錄每日所有Error Log
                                Setting.SaveAllDayLog("錯誤訊息:[Remoting 執行SQL失敗，" + DB2Exception + "]，時間:[" + dateTime.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString + "]，KEY:[" + strKey + "]");
                        }
                    }
                    else//DB1 執行SQL失敗(目前不會跑到這裡)
                    {
                        if (DB2Execu)//DB2 執行SQL成功
                        {
                            DateTime dateTime = DateTime.Now;
                            string strKey;
                            if (Setting.IsBackup)//可備份
                            {
                                //寫入Server.SQL檔
                                Setting.WriteSqlLog_New(DataBaseType.Server, dateTime, sqlString, out strKey);
                                if (IsAutoOpenSyncWork)//有允許自動同步時
                                    Setting.OpenSyncWork();//開啟同步程式
                            }
                            else
                                strKey = dateTime.ToString("HHmmssfff") + Setting.GetRandom();

                            if (SaveAllDayLog)//是否記錄每日所有Error Log
                                Setting.SaveAllDayLog("錯誤訊息:[Server 執行SQL失敗，" + DB1Exception + "]，時間:[" + dateTime.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString + "]，KEY:[" + strKey + "]");

                        }
                        else//DB2 執行SQL失敗
                        {
                            throw new Exception("SQL執行失敗");
                        }

                    }
                }
                else//DB2 連線失敗
                {
                    if (DB1Execu)//DB1 執行SQL成功
                    {
                        string strKey;
                        DateTime dateTime = DateTime.Now;
                        if (Setting.IsBackup)//可備份
                        {
                            //寫入Remoting.SQL檔
                            Setting.WriteSqlLog_New(DataBaseType.Remoting, dateTime, sqlString, out strKey);
                        }
                        else
                            strKey = dateTime.ToString("HHmmssfff") + Setting.GetRandom();
                        if (SaveAllDayLog)//是否記錄每日所有Error Log
                            Setting.SaveAllDayLog("錯誤訊息:[DB2 連線失敗，" + DB2Exception + "]，時間:[" + dateTime.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString + "]，KEY:[" + strKey + "]");
                    }
                    else//DB1 執行SQL失敗
                    {
                        throw new Exception("SQL執行失敗");
                    }
                }

            }
            else//DB1 連線失敗
            {
                if (DB2Connc)//DB2 連線成功
                {
                    if (DB2Execu)//DB2 執行SQL成功
                    {
                        string strKey;
                        DateTime dateTime = DateTime.Now;
                        if (Setting.IsBackup)//可備份
                        {
                            //寫入Server.SQL檔
                            Setting.WriteSqlLog_New(DataBaseType.Server, dateTime, sqlString, out strKey);
                        }
                        else
                            strKey = dateTime.ToString("HHmmssfff") + Setting.GetRandom();

                        if (SaveAllDayLog)//是否記錄每日所有Error Log
                            Setting.SaveAllDayLog("錯誤訊息:[DB1 連線失敗，" + DB1Exception + "]，時間:[" + dateTime.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString + "]，KEY:[" + strKey + "]");

                    }
                    else//DB2 執行SQL失敗
                    {
                        throw new Exception("SQL執行失敗");
                    }
                }
                else//DB2 連線失敗
                {
                    throw new Exception("已經無法連線到任何資料庫");
                }
            }
            #endregion
            return UseCount;
            #endregion

            #region Old
            // bool DB1Connc = false;
            // bool DB1Execu = true;
            // string DB1Exception = "DB1同步錯誤，請查看Server.log";
            // bool DB2Connc = false;
            // bool DB2Execu = true;
            // string DB2Exception = "DB2同步錯誤，請查看Remoting.log";
            // //檢查參數是否錯誤
            // CheckParameter(CheckParameterType.Execute, comType, comText, comParms);
            // //DB1執行成功的數量
            // int UseCount = 0;
            // //DB2執行成功的數量
            // int ReserveCount = 0;

            // //如果有自動編號參數的話，傳回的下一個自動編號，若無則為0
            // int identity = 0;
            // //有自動編號參數的話，傳回的更新後的T-SQL語法
            // string exeText = string.Empty;
            // #region 第一資料庫執行
            // try
            // {
            //     using (SqlServer server = new SqlServer())
            //     {
            //         try
            //         {
            //             DB1Connc = true;//連線成功
            //             //自動同步資料 Joe 
            //             if (Setting.Synchronize_New(DataBaseType.Server))
            //             {
            //                 //自動取得編號與執行T-SQL語法
            //                 exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
            //                 //執行第一個資料庫 T-SQL語法
            //                 UseCount = server.ExecuteNonQuery(comType, exeText, comParms);
            //             }
            //             else
            //                 DB1Execu = false;
            //         }
            //         catch(Exception ex)
            //         {
            //             DB1Execu = false;
            //             DB1Exception = ex.Message;

            //             goto DB1End;//跳到DB1End                       
            //         }
            //     }
            // }
            // catch (Exception e)
            // {
            //     DB1Connc = false;//連線失敗
            //     DB1Exception = e.Message;
            //     //20131108甫任新策略 DB1失敗直接Return
            //     Setting.SetDBConeceFail(DataBaseType.Server, e.Message);//記錄DB 連線失敗時間  Server檔
            // }
            // DB1End:
            // #endregion
            // //20131108甫任新策略 DB1失敗直接Return
            // if (!DB1Connc)//
            // {
            //     throw new Exception("DB1連線失敗");
            // }
            // if (!DB1Execu)
            // {
            //     throw new Exception("DB1 SQL執行失敗");
            // }

            // #region 第二資料庫執行
            // //第二個資料庫同步
            // try
            // {
            //     //如果需要備份的話
            //     if (Setting.IsBackup)//可備份
            //     {
            //         //執行第二個資料庫
            //         using (SqlServer server = new SqlServer(DataBaseType.Remoting))
            //         {
            //             try
            //             {
            //                 DB2Connc = true;//連線成功
            //                 //自動同步之前失敗資料 Joe 
            //                 if (Setting.Synchronize_New(DataBaseType.Remoting))//成功將舊SQL執行完成後
            //                 {
            //                     if (!DB1Connc)//DB1連線失敗時 要使用DB2取自動編號
            //                     {
            //                         //自動取得編號與執行T-SQL語法
            //                         exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
            //                     }

            //                     ReserveCount = server.ExecuteNonQuery(comType, exeText, comParms);//執行這次的SQL
            //                 }
            //                 else
            //                     DB2Execu = false;
            //             }
            //             catch (Exception ex)
            //             {
            //                 DB2Execu = false;
            //                 DB2Exception = ex.Message;
            //                 //Setting.SetExecuteFail(DataBaseType.Remoting, ex.Message);//記錄DB 執行失敗時間  Remoting檔

            //                 goto DB2End;//跳到DB2End
            //             }
            //         }

            //     }

            // }
            //catch (Exception e)
            // {
            //     DB2Connc = false;//連線失敗
            //     DB2Exception = e.Message;
            //     //if (DB1Connc)//DB1成功 DB2失敗
            //     //    Setting.SetDBConeceFail(DataBaseType.Remoting, e.Message);//記錄DB 連線失敗時間  Remoting檔
            //     //else
            //     //    throw new Exception("已經無法連線到任何資料庫");
            // }
            // DB2End:
            // #endregion
            // //取得Transact-SQL 陳述式的文字
            // string sqlString = Setting.getSqlString(exeText, comParms);


            // if (DB1Connc)//DB1 連線成功
            // {
            //     if (DB2Connc)//DB2 連線成功
            //     {
            //         if (DB1Execu)//DB1 執行SQL成功
            //         {
            //             if (DB2Execu)//DB2 執行SQL成功
            //             {

            //             }
            //             else//DB2 執行SQL失敗
            //             {
            //                  Setting.SetExecuteFail(DataBaseType.Remoting, DB2Exception);//記錄DB 執行失敗時間  Remoting檔
            //                  //寫入Remoting.SQL檔
            //                  Setting.WriteSqlLog_New(DataBaseType.Remoting, DateTime.Now, sqlString);
            //             }
            //         }
            //         else//DB1 執行SQL失敗
            //         {
            //             if (DB2Execu)//DB2 執行SQL成功
            //             {
            //                 Setting.SetExecuteFail(DataBaseType.Server, DB1Exception);//記錄DB 執行失敗時間  Server檔
            //                 //寫入Server.SQL檔
            //                 Setting.WriteSqlLog_New(DataBaseType.Server, DateTime.Now, sqlString);
            //             }
            //             else//DB2 執行SQL失敗
            //             {
            //                  throw new Exception("SQL執行失敗");
            //             }

            //         }                       
            //     }
            //     else//DB2 連線失敗
            //     {
            //         if (DB1Execu)//DB1 執行SQL成功
            //         {
            //             Setting.SetDBConeceFail(DataBaseType.Remoting, DB2Exception);//記錄DB 連線失敗時間  Remoting檔
            //             //寫入Remoting.SQL檔
            //             Setting.WriteSqlLog_New(DataBaseType.Remoting, DateTime.Now, sqlString);
            //         }
            //         else//DB1 執行SQL失敗
            //         {
            //             throw new Exception("SQL執行失敗");
            //         }  
            //     }

            // }
            // else//DB1 連線失敗
            // {
            //     if (DB2Connc)//DB2 連線成功
            //     {
            //         if (DB2Execu)//DB2 執行SQL成功
            //         {
            //             Setting.SetDBConeceFail(DataBaseType.Server, DB1Exception);//記錄DB 連線失敗時間  Server檔
            //             //寫入Server.SQL檔
            //             Setting.WriteSqlLog_New(DataBaseType.Server, DateTime.Now, sqlString);
            //         }
            //         else//DB2 執行SQL失敗
            //         {
            //             throw new Exception("SQL執行失敗");
            //         }
            //     }
            //     else//DB2 連線失敗
            //     {
            //         throw new Exception("已經無法連線到任何資料庫");
            //     }
            // }
            // return UseCount;
            #endregion

        }

        /// <summary>
        /// 執行SQL後回傳自動編號後的數值(只能有一個欄位自動編號)
        /// </summary>
        /// <param name="comType">CommandType.Text</param>
        /// <param name="comText">SQL語法</param>
        /// <param name="comParms">條件參數</param>
        /// <param name="intSN">自動編號後的數值</param>
        /// <returns>執行數</returns>
        public static int ExecuteByCommand_ReSN(CommandType comType, string comText, CmdParameter[] comParms, out int intSN)
        {
            #region New
            bool DB1Connc = false;
            bool DB1Execu = true;
            string DB1Exception = "DB1同步錯誤，請查看Server.log";
            bool DB2Connc = false;
            bool DB2Execu = true;
            string DB2Exception = "DB2同步錯誤，請查看Remoting.log";
            bool SaveAllDayLog;
            if (!Boolean.TryParse(ConfigurationManager.AppSettings["SaveAllDayLog"], out SaveAllDayLog))//是否記錄每日所有Error Log
                SaveAllDayLog = false;

            bool SaveDB1ExecuLog;
            if (!Boolean.TryParse(ConfigurationManager.AppSettings["SaveDB1ExecuLog"], out SaveDB1ExecuLog))//是否將DB1執行錯誤記錄至每日log
                SaveDB1ExecuLog = false;

            //檢查參數是否錯誤
            CheckParameter(CheckParameterType.Execute, comType, comText, comParms);
            //DB1執行成功的數量
            int UseCount = 0;
            //DB2執行成功的數量
            int ReserveCount = 0;

            //如果有自動編號參數的話，傳回的下一個自動編號，若無則為0
            int identity = 0;
            //有自動編號參數的話，傳回的更新後的T-SQL語法
            string exeText = string.Empty;
            #region 第一資料庫執行
            try
            {
                using (SqlServer server = new SqlServer())
                {
                    try
                    {
                        DB1Connc = true;//連線成功

                        //自動取得編號與執行T-SQL語法
                        exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
                        //執行第一個資料庫 T-SQL語法
                        UseCount = server.ExecuteNonQuery(comType, exeText, comParms);

                    }
                    catch (Exception ex)
                    {
                        DB1Execu = false;
                        DB1Exception = ex.Message + ex.StackTrace;
                    }
                }
            }
            catch (Exception e)
            {
                DB1Connc = false;//連線失敗
                DB1Exception = e.Message;
            }

            #endregion
            //20131108甫任新策略 DB1失敗直接Return
            if (!DB1Connc)//
            {
                if (SaveAllDayLog)//是否記錄每日所有Error Log
                {
                    DateTime dateTime = DateTime.Now;
                    string strKey = dateTime.ToString("HHmmssfff") + Setting.GetRandom();
                    Setting.SaveAllDayLog("錯誤訊息:[DB1連線失敗]，時間:[" + DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，KEY:[" + strKey + "]");
                }
                throw new Exception("DB1連線失敗，原因:" + DB1Exception);
            }
            if (!DB1Execu)
            {
                if (SaveDB1ExecuLog)//是否將SQL執行錯誤記錄在 每日Log
                {
                    //取得Transact-SQL 陳述式的文字
                    string sqlString2 = Setting.getSqlString(exeText, comParms);
                    DateTime dateTime = DateTime.Now;
                    string strKey = dateTime.ToString("HHmmssfff") + Setting.GetRandom();
                    Setting.SaveAllDayLog("錯誤訊息:[Server 執行SQL失敗，" + DB1Exception + "]，時間:[" + DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString2 + "]，KEY:[" + strKey + "]");
                }

                throw new Exception("DB1 SQL執行失敗，原因:[" + DB1Exception + "]，SQL:[" + comText + "]");
            }

            #region 第二資料庫執行
            //第二個資料庫同步
            try
            {
                //如果需要備份的話
                if (Setting.IsBackup)//可備份
                {
                    //執行第二個資料庫
                    using (SqlServer server = new SqlServer(DataBaseType.Remoting))
                    {
                        try
                        {
                            DB2Connc = true;//連線成功

                            if (!DB1Connc)//DB1連線失敗時 要使用DB2取自動編號
                            {
                                //自動取得編號與執行T-SQL語法
                                exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
                            }

                            ReserveCount = server.ExecuteNonQuery(comType, exeText, comParms);//執行這次的SQL
                        }
                        catch (Exception ex)
                        {
                            DB2Execu = false;
                            DB2Exception = ex.Message;
                        }
                    }

                }

            }
            catch (Exception e)
            {
                DB2Connc = false;//連線失敗
                DB2Exception = e.Message;
            }

            #endregion
            //取得Transact-SQL 陳述式的文字
            string sqlString = Setting.getSqlString(exeText, comParms);

            bool IsAutoOpenSyncWork;
            if (!Boolean.TryParse(ConfigurationManager.AppSettings["IsAutoOpenSyncWork"], out IsAutoOpenSyncWork))//是否自動呼叫同步程式
                IsAutoOpenSyncWork = false;



            if (DB1Connc)//DB1 連線成功
            {
                if (DB2Connc)//DB2 連線成功
                {
                    if (DB1Execu)//DB1 執行SQL成功
                    {
                        if (DB2Execu)//DB2 執行SQL成功
                        {

                        }
                        else//DB2 執行SQL失敗
                        {
                            //寫入Remoting.SQL檔
                            string strKey;
                            DateTime dateTime = DateTime.Now;
                            Setting.WriteSqlLog_New(DataBaseType.Remoting, dateTime, sqlString, out strKey);

                            if (SaveAllDayLog)//是否記錄每日所有Error Log
                                Setting.SaveAllDayLog("錯誤訊息:[Remoting 執行SQL失敗，" + DB2Exception + "]，時間:[" + dateTime.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString + "]，KEY:[" + strKey + "]");
                            if (IsAutoOpenSyncWork)//有允許自動同步時
                                Setting.OpenSyncWork();//開啟同步程式
                        }
                    }
                    else//DB1 執行SQL失敗
                    {
                        if (DB2Execu)//DB2 執行SQL成功
                        {
                            //寫入Server.SQL檔
                            string strKey;
                            DateTime dateTime = DateTime.Now;
                            Setting.WriteSqlLog_New(DataBaseType.Server, dateTime, sqlString, out strKey);

                            if (SaveAllDayLog)//是否記錄每日所有Error Log
                                Setting.SaveAllDayLog("錯誤訊息:[Server 執行SQL失敗，" + DB1Exception + "]，時間:[" + dateTime.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString + "]，KEY:[" + strKey + "]");
                            if (IsAutoOpenSyncWork)//有允許自動同步時
                                Setting.OpenSyncWork();//開啟同步程式
                        }
                        else//DB2 執行SQL失敗
                        {
                            throw new Exception("SQL執行失敗");
                        }

                    }
                }
                else//DB2 連線失敗
                {
                    if (DB1Execu)//DB1 執行SQL成功
                    {
                        //寫入Remoting.SQL檔
                        string strKey;
                        DateTime dateTime = DateTime.Now;
                        Setting.WriteSqlLog_New(DataBaseType.Remoting, dateTime, sqlString, out strKey);

                        if (SaveAllDayLog)//是否記錄每日所有Error Log
                            Setting.SaveAllDayLog("錯誤訊息:[DB2 連線失敗，" + DB2Exception + "]，時間:[" + dateTime.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString + "]，KEY:[" + strKey + "]");
                    }
                    else//DB1 執行SQL失敗
                    {
                        throw new Exception("SQL執行失敗");
                    }
                }

            }
            else//DB1 連線失敗
            {
                if (DB2Connc)//DB2 連線成功
                {
                    if (DB2Execu)//DB2 執行SQL成功
                    {
                        //寫入Server.SQL檔
                        string strKey;
                        DateTime dateTime = DateTime.Now;
                        Setting.WriteSqlLog_New(DataBaseType.Server, dateTime, sqlString, out strKey);

                        if (SaveAllDayLog)//是否記錄每日所有Error Log
                            Setting.SaveAllDayLog("錯誤訊息:[DB1 連線失敗，" + DB1Exception + "]，時間:[" + dateTime.ToString("yyyy/MM/dd HH:mm:ss.fff") + "]，SQL:[" + sqlString + "]，KEY:[" + strKey + "]");
                    }
                    else//DB2 執行SQL失敗
                    {
                        throw new Exception("SQL執行失敗");
                    }
                }
                else//DB2 連線失敗
                {
                    throw new Exception("已經無法連線到任何資料庫");
                }
            }
            intSN = identity;
            return UseCount;
            #endregion

            #region Old2
            //    bool DB1Connc = false;
            //    bool DB1Execu = true;
            //    string DB1Exception = "DB1同步錯誤，請查看Server.log";
            //    bool DB2Connc = false;
            //    bool DB2Execu = true;
            //    string DB2Exception = "DB2同步錯誤，請查看Remoting.log";
            //    //檢查參數是否錯誤
            //    CheckParameter(CheckParameterType.Execute, comType, comText, comParms);
            //    //DB1執行成功的數量
            //    int UseCount = 0;
            //    //DB2執行成功的數量
            //    int ReserveCount = 0;

            //    //如果有自動編號參數的話，傳回的下一個自動編號，若無則為0
            //    int identity = 0;
            //    //有自動編號參數的話，傳回的更新後的T-SQL語法
            //    string exeText = string.Empty;
            //    try
            //    {
            //        using (SqlServer server = new SqlServer())
            //        {
            //            try
            //            {
            //                DB1Connc = true;//連線成功
            //                //自動同步資料 Joe 
            //                if (Setting.Synchronize_New(DataBaseType.Server))
            //                {
            //                    //自動取得編號與執行T-SQL語法
            //                    exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
            //                    //執行第一個資料庫 T-SQL語法
            //                    UseCount = server.ExecuteNonQuery(comType, exeText, comParms);
            //                }
            //                else
            //                    DB1Execu = false;
            //            }
            //            catch (Exception ex)
            //            {
            //                DB1Execu = false;
            //                DB1Exception = ex.Message;
            //                goto DB1End;//跳到DB1End
            //            }
            //        }
            //    }
            //    catch (Exception e)
            //    {
            //        DB1Connc = false;//連線失敗
            //        DB1Exception = e.Message;
            //        //20131108甫任新策略 DB1失敗直接Return
            //        Setting.SetDBConeceFail(DataBaseType.Server, e.Message);//記錄DB 連線失敗時間  Server檔
            //    }

            //DB1End:
            //    //20131108甫任新策略 DB1失敗直接Return
            //    if (!DB1Connc)//
            //    {
            //        throw new Exception("DB1連線失敗");
            //    }
            //    if (!DB1Execu)
            //    {
            //        throw new Exception("DB1 SQL執行失敗");
            //    }
            //    //第二個資料庫同步
            //    try
            //    {
            //        //如果需要備份的話
            //        if (Setting.IsBackup)//可備份
            //        {
            //            //執行第二個資料庫
            //            using (SqlServer server = new SqlServer(DataBaseType.Remoting))
            //            {
            //                try
            //                {
            //                    DB2Connc = true;//連線成功
            //                    //自動同步之前失敗資料 Joe 
            //                    if (Setting.Synchronize_New(DataBaseType.Remoting))//成功將舊SQL執行完成後
            //                    {
            //                        if (!DB1Connc)//DB1連線失敗時 要使用DB2取自動編號
            //                        {
            //                            //自動取得編號與執行T-SQL語法
            //                            exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
            //                        }

            //                        ReserveCount = server.ExecuteNonQuery(comType, exeText, comParms);//執行這次的SQL
            //                    }
            //                    else
            //                        DB2Execu = false;
            //                }
            //                catch (Exception ex)
            //                {
            //                    DB2Execu = false;
            //                    DB2Exception = ex.Message;
            //                    //Setting.SetExecuteFail(DataBaseType.Remoting, ex.Message);//記錄DB 執行失敗時間  Remoting檔

            //                    goto DB2End;//跳到DB2End
            //                }
            //            }

            //        }

            //    }
            //    catch (Exception e)
            //    {
            //        DB2Connc = false;//連線失敗
            //        DB2Exception = e.Message;
            //        //if (DB1Connc)//DB1成功 DB2失敗
            //        //    Setting.SetDBConeceFail(DataBaseType.Remoting, e.Message);//記錄DB 連線失敗時間  Remoting檔
            //        //else
            //        //    throw new Exception("已經無法連線到任何資料庫");
            //    }
            //DB2End:

            //    //取得Transact-SQL 陳述式的文字
            //    string sqlString = Setting.getSqlString(exeText, comParms);


            //    if (DB1Connc)//DB1 連線成功
            //    {
            //        if (DB2Connc)//DB2 連線成功
            //        {
            //            if (DB1Execu)//DB1 執行SQL成功
            //            {
            //                if (DB2Execu)//DB2 執行SQL成功
            //                {

            //                }
            //                else//DB2 執行SQL失敗
            //                {
            //                    Setting.SetExecuteFail(DataBaseType.Remoting, DB2Exception);//記錄DB 執行失敗時間  Remoting檔
            //                    //寫入Remoting.SQL檔
            //                    Setting.WriteSqlLog_New(DataBaseType.Remoting, DateTime.Now, sqlString);
            //                }
            //            }
            //            else//DB1 執行SQL失敗
            //            {
            //                if (DB2Execu)//DB2 執行SQL成功
            //                {
            //                    Setting.SetExecuteFail(DataBaseType.Server, DB1Exception);//記錄DB 執行失敗時間  Server檔
            //                    //寫入Server.SQL檔
            //                    Setting.WriteSqlLog_New(DataBaseType.Server, DateTime.Now, sqlString);
            //                }
            //                else//DB2 執行SQL失敗
            //                {
            //                    throw new Exception("SQL執行失敗");
            //                }

            //            }
            //        }
            //        else//DB2 連線失敗
            //        {
            //            if (DB1Execu)//DB1 執行SQL成功
            //            {
            //                Setting.SetDBConeceFail(DataBaseType.Remoting, DB2Exception);//記錄DB 連線失敗時間  Remoting檔
            //                //寫入Remoting.SQL檔
            //                Setting.WriteSqlLog_New(DataBaseType.Remoting, DateTime.Now, sqlString);
            //            }
            //            else//DB1 執行SQL失敗
            //            {
            //                throw new Exception("SQL執行失敗");
            //            }
            //        }

            //    }
            //    else//DB1 連線失敗
            //    {
            //        if (DB2Connc)//DB2 連線成功
            //        {
            //            if (DB2Execu)//DB2 執行SQL成功
            //            {
            //                Setting.SetDBConeceFail(DataBaseType.Server, DB1Exception);//記錄DB 連線失敗時間  Server檔
            //                //寫入Server.SQL檔
            //                Setting.WriteSqlLog_New(DataBaseType.Server, DateTime.Now, sqlString);
            //            }
            //            else//DB2 執行SQL失敗
            //            {
            //                throw new Exception("SQL執行失敗");
            //            }
            //        }
            //        else//DB2 連線失敗
            //        {
            //            throw new Exception("已經無法連線到任何資料庫");
            //        }
            //    }

            //    intSN = identity;
            //    return UseCount;
            #endregion

            #region Old
            ////檢查參數是否錯誤
            //CheckParameter(CheckParameterType.Execute, comType, comText, comParms);
            ////執行修改成功的數量
            //int UseCount = 0;
            ////如果有自動編號參數的話，傳回的下一個自動編號，若無則為0
            //int identity = 0;
            ////有自動編號參數的話，傳回的更新後的T-SQL語法
            //string exeText = string.Empty;
            //try
            //{
            //    using (SqlServer server = new SqlServer())
            //    {
            //        //自動同步資料 Joe 
            //        Setting.SynAndCheck(Setting.UseDataBase);
            //        //自動取得編號與執行T-SQL語法
            //        exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
            //        //執行第一個資料庫 T-SQL語法
            //        UseCount = server.ExecuteNonQuery(comType, exeText, comParms);
            //    }
            //}
            //catch (Exception e)
            //{   //再執行一次自動編號Insert資料
            //    //取得編號並Insert資料失敗(identity>0 又 Exception 表示其他程式也在執行自動邊號 有衝突)
            //    if (identity > 0)
            //    {
            //        try
            //        {
            //            using (SqlServer server = new SqlServer())
            //            {
            //                //自動同步資料 Joe 
            //                Setting.SynAndCheck(Setting.UseDataBase);
            //                //自動取得編號與執行T-SQL語法
            //                exeText = ConvertToIdentity(server, comText, out identity);//Insert才做置換
            //                //執行第一個資料庫 T-SQL語法
            //                UseCount = server.ExecuteNonQuery(comType, exeText, comParms);
            //            }
            //        }
            //        catch { throw e; }
            //    }
            //    else throw e;
            //}
            ////第一個資料庫成功
            //if (UseCount > 0)
            //{
            //    int ReserveCount = 0;//另一DB執行修改成功的數量
            //    //第二個資料庫同步
            //    try
            //    {
            //        //如果需要備份的話
            //        if (Setting.IsBackup)//可備份  && !Setting.IsFailDataBaseTypeStatus(Setting.ReserveDataBase)沒有DB連線失敗記錄檔 
            //        {
            //            //執行第二個資料庫
            //            using (SqlServer server = new SqlServer(Setting.ReserveDataBase))
            //            {
            //                //自動同步之前失敗資料 Joe 
            //                if (Setting.SynAndCheck(Setting.ReserveDataBase))//成功將舊SQL執行完成後
            //                    ReserveCount = server.ExecuteNonQuery(comType, exeText, comParms);//執行這次的SQL
            //            }
            //        }
            //    }
            //    catch { }
            //    finally
            //    {
            //        //取得現在時間，以便統一時間對齊
            //        DateTime now = DateTime.Now;
            //        //取得Transact-SQL 陳述式的文字
            //        string sqlString = Setting.getSqlString(exeText, comParms);
            //        //因為是成功，所以加入注解符號，不需要再執行
            //        string explainSqlString = SqlKeyWord.EXPLAIN + sqlString;
            //        //20131025修改 成功不記LOG
            //        ////寫入第一個資料庫的Log檔
            //        //Setting.WriteSqlLog(Setting.UseDataBase, now, explainSqlString);

            //        //如果需要備份的話。
            //        if (Setting.IsBackup)
            //        {
            //            string reserveSqlString = sqlString;
            //            //20131025修改 成功不記LOG
            //            ////看是否成功，來加入注解符號
            //            //if (ReserveCount > 0 || sqlString.ToUpper().IndexOf("EXEC ") >= 0) reserveSqlString = explainSqlString;
            //            //UPDATE TestTable SET Name='b''b''b' where [TestID]=1
            //            //insert into [TestTable]([TestID],[Name],[CDate]) values($[TestTable].[TestID]$,'aa','2013/5/2');

            //            if (ReserveCount < 1 && sqlString.ToUpper().IndexOf("EXEC ") < 0)//失敗的話
            //            {
            //                //寫入Server檔
            //                Setting.WriteSqlLog(Setting.ReserveDataBase, now, reserveSqlString);
            //            }
            //        }
            //    }
            //}
            //intSN = identity;
            //return UseCount;
            #endregion
        }


        /// <summary>  
        /// 若為INSERT語法，利用規則 $TableName.ColumnName$，自動取得編號 
        /// </summary>
        public static string ConvertToIdentity(SqlServer server, string comText, out int identity)
        {
            identity = 0;
            try
            {
                //如果是新增的話，重新取得編號的T-SQL語法，必須要符合規則 $TableName.ColumnName$
                if (comText.ToUpper().IndexOf(SqlKeyWord.INSERT) > -1)//Insert語法時
                {
                    //取得起始字串
                    int start = comText.IndexOf(SqlKeyWord.DOLLARS);//找到$號位置
                    if (start > -1)
                    {
                        //起始字串 +1 
                        start = start + 1;
                        //取得結束字串
                        int end = comText.IndexOf(SqlKeyWord.DOLLARS, start);//找到另一個$號位置
                        //符合二個$$規則
                        if (end > -1)
                        {
                            //取得二個$$之間的字串
                            string TableColumn = comText.Substring(start, (end - start));//Table名.欄位名
                            //使用.字元作分割
                            string[] arrays = TableColumn.Split(new string[] { SqlKeyWord.DOT }, StringSplitOptions.RemoveEmptyEntries);
                            //分割陣列為二
                            if (arrays.Length == 2)
                            {
                                //第一個字串為資料表
                                string table = arrays[0];//Table名
                                if (Setting.IsSchemaTables(table))//判斷Table是否存在資料庫
                                {
                                    //第二個字串為資料欄位
                                    string column = arrays[1];//欄位名

                                    //改寫By Joe
                                    //if (Setting.IsSchemaColumn(table, column))//判斷欄位是否存在Table裡
                                    if (Setting.CheckTableColumn(table, column))//判斷欄位是否存在Table裡
                                    {
                                        //產生T-SQL語法 "SELECT MAX(欄位名) FROM Table名"
                                        string sql = SqlKeyWord.SELECT + SqlKeyWord.SPACE + SqlKeyWord.MAX + SqlKeyWord.LBRACKET + column + SqlKeyWord.RBRACKET + SqlKeyWord.SPACE + SqlKeyWord.FROM + SqlKeyWord.SPACE + table;
                                        //取得現在最大的編號
                                        object obj = null;
                                        //使用同一個連線，如果沒有的話，建立新連線
                                        if (server == null) { server = new SqlServer(); }
                                        obj = server.SelectScalar(sql);//執行查詢並回傳結果第一列第一欄
                                        int.TryParse(Convert.ToString(obj), out identity);//將結果值轉int存入identity
                                        //將最大編號加1後，取代T-SQL語法
                                        identity++;
                                        comText = comText.Replace(SqlKeyWord.DOLLARS + TableColumn + SqlKeyWord.DOLLARS, identity.ToString());
                                    }
                                    else throw new Exception(table + "資料表中不包含此" + column + "資料欄位");
                                }
                                else throw new Exception("資料庫中不包含此" + table + "資料表");
                            }
                            else throw new Exception("必須要符合規則 $TableName.ColumnName$ → $資料表名稱.編號欄位名稱$");
                        }
                    }
                }
            }
            catch (Exception e) { throw e; }
            return comText;
        }

        /// <summary>
        /// 轉換成Json格式
        /// </summary>
        /// <param name="ds">欲轉換之資料(DataSet)</param>
        /// /// <param name="dt">欲轉換之資料(DataTable)</param>
        /// <returns>Unicode Json字串</returns>
        public static string TransferToJson(DataSet ds, DataTable dt)//轉換成Json格式
        {
            DataTable dtData = new DataTable();
            if (ds != null)
                dtData = ds.Tables[0];
            else
                dtData = dt;

            string strJson = "";

            int IndexRow = 0;
            foreach (DataRow dr in dtData.Rows)
            {
                strJson += IndexRow == 0 ? "{" : ",{";
                int IndexCol = 0;
                foreach (DataColumn dc in dr.Table.Columns)
                {
                    ////轉Unicode 不轉特殊字元
                    //strJson += string.Format("{0}\"{1}\":\"{2}\"", IndexCol == 0 ? "" : ",", dc.ColumnName, StringToUnicode(dr[dc.ColumnName].ToString()));

                    //轉特殊字元 不轉Unicode
                    strJson += string.Format("{0}\"{1}\":\"{2}\"", IndexCol == 0 ? "" : ",", dc.ColumnName, TransferSymbol(dr[dc.ColumnName].ToString()));//不轉Unicode

                    //轉特殊字元 轉Unicode
                    //strJson += string.Format("{0}\"{1}\":\"{2}\"", IndexCol == 0 ? "" : ",", dc.ColumnName, StringToUnicode(TransferSymbol(dr[dc.ColumnName].ToString())));//不轉Unicode

                    ////不轉特殊字元  不轉Unicode
                    //strJson += string.Format("{0}\"{1}\":\"{2}\"", IndexCol == 0 ? "" : ",", dc.ColumnName, dr[dc.ColumnName].ToString());//不轉Unicode


                    IndexCol++;
                }
                strJson += "}";

                IndexRow++;

            }
            return strJson;
        }

        /// <summary>
        /// 字串轉換Unicode格式
        /// </summary>
        /// <param name="strWord">欲變更之字串</param>
        /// <returns>完成變更之字串</returns>
        public static string StringToUnicode(string strWord)//字串轉換Unicode格式
        {
            string strUnicode = "";
            if (strWord.Trim() != "")
            {


                char[] charU = strWord.ToCharArray();//拆開字串
                for (int i = 0; i < charU.Length; i++)
                {
                    #region 轉換單一式
                    //strUnicode += TransferUnicode(charU[i].ToString());//轉換特殊字元
                    #endregion

                    #region 轉換全判斷式
                    strUnicode += CharToUnicode(charU[i]);

                    #endregion
                }
            }

            return strUnicode;
        }

        /// <summary>
        /// 字元轉換Unicode格式
        /// </summary>
        /// <param name="charU">欲轉換的字元</param>
        /// <returns>完成轉換的字元</returns>
        private static string CharToUnicode(char charU)//字元轉換Unicode格式
        {
            int dstringmax = Convert.ToInt32("9fff", 16);//ASCII中文字最大範圍
            int dstringmin = Convert.ToInt32("4e00", 16);//ASCII中文字最小範圍
            int dRange = (int)charU;
            if ((dRange >= dstringmin && dRange < dstringmax) || char.IsLetter(charU))//是中英文字時
            {
                return "&#" + (dRange).ToString();//轉Unicode
            }
            else if (char.IsNumber(charU))//是數字時
            {
                return charU.ToString();
            }
            else//其他(符號)
            {
                return TransferChar(charU.ToString());//轉換特殊字元
            }

        }

        /// <summary>
        /// 轉換字串中的特殊符號
        /// </summary>
        /// <param name="strWord">被轉換字串</param>
        /// <returns>完成轉換字串</returns>
        private static string TransferSymbol(string strWord)//轉換字串中的特殊符號
        {
            string strUnicode = "";
            char[] charU = strWord.ToCharArray();//拆開字串
            for (int i = 0; i < charU.Length; i++)
            {
                strUnicode += TransferUnicodeSimp(charU[i].ToString());//轉換部份特殊字元
            }

            return strUnicode;
        }

        /// <summary>
        /// 轉換特殊字元
        /// </summary>
        /// <param name="strWord">被轉換字元</param>
        /// <returns>完成轉換字元</returns>
        public static string TransferChar(string strWord)//轉換特殊字元
        {

            switch (strWord)
            {
                case "\"":
                    return "”";
                case "[":
                    return "【";
                case "]":
                    return "】";
                case "\\":
                    return "＼";
                case "<":
                    return "《";
                case ">":
                    return "》";
                case ":":
                    return "：";
                case "-":
                    return "－";
                case "/":
                    return "／";
                case "（":
                    return "《";
                case "）":
                    return "》";
                case " ":
                    return "";
                case "\r":
                    return "";
                case "\n":
                    return "";
                default:
                    return strWord;
            }

        }

        /// <summary>
        /// 轉換部份特殊字元
        /// </summary>
        /// <param name="strWord">被轉換字元</param>
        /// <returns>完成轉換字元</returns>
        public static string TransferUnicodeSimp(string strWord)//轉換部份特殊字元
        {

            switch (strWord)
            {
                case "\r":
                    return "";
                case "\n":
                    return "";
                default:
                    return strWord;
            }

        }
    }
}