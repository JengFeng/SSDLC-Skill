using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;

namespace SyncDataBase
{
    /// <summary>
    /// SQL Server 資料庫的開啟及回傳。這個類別無法被繼承。。
    /// </summary>
    public sealed class SqlServer : IDisposable
    {
        #region 類別成員
        private SqlConnection sqlconnection = new SqlConnection();
        private SqlCommand sqlcommand = new SqlCommand();
        private SqlDataAdapter sqldataadapter = new SqlDataAdapter();
        #endregion

        #region 建構子
        /// <summary>
        /// 初始化 MsSqlConnection 類別的新執行個體，方式一:同步預設連線失敗會自動轉換，並記錄資料庫失敗。
        /// </summary>
        public SqlServer()//一般使用
        {
            try
            {

                this.sqlconnection.ConnectionString = Setting.ConnectionString;
                this.sqlconnection.Open();

            }
            catch//連線DB失敗
            {
                throw;


                //try
                //{
                //    this.sqlconnection.ConnectionString = Setting.ToChangeConnectionString();//交換連線字串並記Server檔或Remoting檔
                //    this.sqlconnection.Open();
                //}
                //catch { throw new Exception("已經無法連線到任何資料庫"); }
            }
        }



        /// <summary>
        /// 初始化 MsSqlConnection 類別的新執行個體，方式二:如果連線失敗會記錄資料庫失敗，如果使用需要同步功能，連線成功則會處理同步問題。
        /// </summary>
        /// <param name="type">資料庫類別</param>
        /// <param name="IsSynchronize">是否要同步化</param>
        public SqlServer(DataBaseType type, bool IsSynchronize = false)//管理平台使用
        {
            try
            {
                this.sqlconnection.ConnectionString = Setting.GetConnectionString(type);//
                this.sqlconnection.Open();
            }
            catch
            {
                Setting.SetFailDataBaseTypeStatus(type, false);//記錄失敗時間
                throw new Exception("無法連線到資料庫");
            }
        }

        /// <summary>
        /// 初始化 MsSqlConnection 類別的新執行個體，方式三:提供給其他連線使用，只有執行命令，不做任何同步相關的處理。
        /// </summary>
        /// <param name="connectionstring">連線字串</param>
        public SqlServer(string connectionstring, int time = 0)//初始化設定使用
        {
            try
            {
                this.sqlconnection.ConnectionString = connectionstring;
                if (time > 0) this.sqlconnection.ConnectionString += string.Format(";Connection Timeout={0}", 30);
                this.sqlconnection.Open();
            }
            catch (Exception ex) { throw new Exception("無法連線到資料庫:" + ex.Message); }
        }
        #endregion

        #region 解構子
        ~SqlServer()
        {
            // Do not re-create Dispose clean-up code here.
            // Calling Dispose(false) is optimal in terms of
            // readability and maintainability.        
            Dispose(false);
        }

        /// <summary>
        /// 釋放 MsSqlConnection 所使用的資源。
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
        }

        /// <summary>
        /// 釋放 MsSqlConnection 所使用的資源。
        /// </summary>
        /// <param name="disposing">是否要使用 GC 釋放資源</param>
        public void Dispose(bool disposing)
        {
            // If disposing equals true, dispose all managed 
            // and unmanaged resources.
            if (disposing)
                GC.SuppressFinalize(this);

            // Release unmanaged resources. If disposing is false, 
            // only the following code is executed.            
            this.sqlconnection.Close();
            this.sqlconnection.Dispose();
            this.sqlcommand.Dispose();
            this.sqldataadapter.Dispose();
        }
        #endregion

        #region 類別方法
        /// <summary>
        /// 預先產生SqlCommand
        /// </summary>
        /// <param name="comType">命令類別</param>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <param name="comParms">使用查詢的參數陣列</param>
        /// <returns>DataSet</returns>
        public SqlCommand prepareCommand(CommandType comType, string comText, params CmdParameter[] comParms)
        {
            SqlCommand command = new SqlCommand();
            command.CommandType = comType;
            command.CommandText = comText;
            command.Connection = this.sqlconnection;
            if (comParms != null)
            {
                foreach (CmdParameter cmdparameter in comParms)
                {
                    command.Parameters.Add(this.ToSqlParameter(cmdparameter));
                }
            }
            return command;
        }

        /// <summary>
        /// SQL SELECT 取得DataSet
        /// </summary>
        /// <param name="comType">命令類別</param>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <param name="comParms">使用查詢的參數陣列</param>
        /// <returns>DataSet</returns>
        public DataSet SelectDataSet(CommandType comType, string comText, params CmdParameter[] comParms)
        {
            DataSet dataset = new DataSet();
            this.sqlcommand = this.prepareCommand(comType, comText, comParms);//預先產生SqlCommand
            this.sqldataadapter.SelectCommand = this.sqlcommand;//System SqlDataAdapter
            try { this.sqldataadapter.Fill(dataset); }
            catch (Exception e) { throw e; }
            return dataset;
        }
        /// <summary>
        /// 取得記憶中快取
        /// </summary>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <param name="comParms">使用查詢的參數陣列</param>
        /// <returns>DataSet</returns>
        public DataSet SelectDataSet(string comText, params CmdParameter[] comParms)
        {
            return SelectDataSet(CommandType.Text, comText, comParms);
        }
        /// <summary>
        /// 取得記憶中快取
        /// </summary>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <returns>DataSet</returns>
        public DataSet SelectDataSet(string comText)
        {
            return SelectDataSet(CommandType.Text, comText, null);
        }
        /// <summary>
        /// 取得記憶中快取
        /// </summary>
        /// <param name="builder">Transact-SQL 陳述式產生器</param>
        /// <returns></returns>
        public DataSet SelectDataSet(SelectCommandBuilder builder)
        {
            return SelectDataSet(builder.GetCommandType(), builder.ToSelectCommandString(), builder.GetSelectParameters());
        }
        /// <summary>
        /// 取得資料列的單向捲動檢視 (Forward-only) 資料流。
        /// </summary>
        /// <param name="comType">命令類別</param>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>
        /// <returns>DataSet</returns>
        public SqlDataReader SelectReader(CommandType comType, string comText, params CmdParameter[] comParms)
        {
            SqlDataReader sqldatareader;
            this.sqlcommand = this.prepareCommand(comType, comText, comParms);
            try { sqldatareader = this.sqlcommand.ExecuteReader(CommandBehavior.CloseConnection); }
            catch (Exception e) { throw e; }
            return sqldatareader;
        }
        /// <summary>
        /// 取得資料列的單向捲動檢視 (Forward-only) 資料流。
        /// </summary>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>
        /// <returns>SqlDataReader</returns>
        public SqlDataReader SelectReader(string comText, params CmdParameter[] comParms)
        {
            return SelectReader(CommandType.Text, comText, comParms);
        }
        /// <summary>
        /// 取得資料列的單向捲動檢視 (Forward-only) 資料流。
        /// </summary>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <returns>SqlDataReader</returns>
        public SqlDataReader SelectReader(string comText)
        {
            return SelectReader(CommandType.Text, comText, null);
        }
        /// <summary>
        /// 取得記憶中快取
        /// </summary>
        /// <param name="builder">Transact-SQL 陳述式產生器</param>
        /// <returns>SqlDataReader</returns>
        public SqlDataReader SelectReader(SelectCommandBuilder builder)
        {
            return SelectReader(builder.GetCommandType(), builder.ToSelectCommandString(), builder.GetSelectParameters());
        }

        /// <summary>
        /// 取得資料列的單向捲動檢視 (Forward-only) 資料流。
        /// 執行查詢並回傳結果第一列第一欄
        /// </summary>
        /// <param name="comType">命令類別</param>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>
        /// <returns>object</returns>
        public object SelectScalar(CommandType comType, string comText, params CmdParameter[] comParms)
        {
            object obj;
            this.sqlcommand = this.prepareCommand(comType, comText, comParms);
            try { obj = this.sqlcommand.ExecuteScalar(); }
            catch (Exception e) { throw e; }
            return obj;
        }
        /// <summary>
        /// 取得資料列的單向捲動檢視 (Forward-only) 資料流。
        /// </summary>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>
        /// <returns>object</returns>
        public object SelectScalar(string comText, params CmdParameter[] comParms)
        {
            return SelectScalar(CommandType.Text, comText, comParms);
        }
        /// <summary>
        /// 取得資料列的單向捲動檢視 (Forward-only) 資料流。
        /// 執行查詢並回傳結果第一列第一欄
        /// </summary>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <returns>object</returns>
        public object SelectScalar(string comText)
        {
            return SelectScalar(CommandType.Text, comText, null);
        }
        /// <summary>
        /// 取得記憶中快取
        /// </summary>
        /// <param name="builder">Transact-SQL 陳述式產生器</param>
        /// <returns>object</returns>
        public object SelectScalar(SelectCommandBuilder builder)
        {
            return SelectScalar(builder.GetCommandType(), builder.ToSelectCommandString(), builder.GetSelectParameters());
        }

        /// <summary>
        /// 執行 Transact-SQL 陳述式，並傳回受影響的資料列數目。 
        /// </summary>
        /// <param name="comType">命令類別</param>
        /// <param name="comText">Transact-SQL 陳述式</param>
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>
        /// <returns>int</returns>
        public int ExecuteNonQuery(CommandType comType, string comText, params CmdParameter[] comParms)
        {
            int ReturnValue = 0;
            SqlTransaction sqltransaction = this.sqlconnection.BeginTransaction();
            this.sqlcommand = this.prepareCommand(comType, comText, comParms);
            this.sqlcommand.Transaction = sqltransaction;
            try
            {
                ReturnValue = this.sqlcommand.ExecuteNonQuery();
                sqltransaction.Commit();
            }
            catch (Exception e)
            {
                sqltransaction.Rollback();
                throw e;
            }
            return ReturnValue;
        }
        /// <summary>
        /// 執行 Transact-SQL 陳述式，並傳回受影響的資料列數目。 
        /// </summary>
        /// <param name="SqlStatements">Transact-SQL 陳述式</param>
        /// <param name="comParms">Transact-SQL 陳述式的參數陣列</param>
        /// <returns>int</returns>
        public int ExecuteNonQuery(string comText, params CmdParameter[] comParms)
        {
            return ExecuteNonQuery(CommandType.Text, comText, comParms);
        }
        /// <summary>
        /// 執行 Transact-SQL 陳述式，並傳回受影響的資料列數目。 
        /// </summary>
        /// <param name="SqlStatements">Transact-SQL 陳述式</param>
        /// <returns>int</returns>
        public int ExecuteNonQuery(string comText)
        {
            return ExecuteNonQuery(CommandType.Text, comText, null);
        }
        /// <summary>
        /// 執行 Transact-SQL 陳述式，並傳回受影響的資料列數目。
        /// </summary>
        /// <param name="builder">Transact-SQL 陳述式產生器</param>
        /// <returns>int</returns>
        public int ExecuteNonQuery(UpdateCommandBuilder builder)
        {
            return ExecuteNonQuery(builder.GetCommandType(), builder.ToUpdateCommandString(), builder.GetAllUpdateParameters());
        }
        /// <summary>
        /// 執行 Transact-SQL 陳述式，並傳回受影響的資料列數目。
        /// </summary>
        /// <param name="builder">Transact-SQL 陳述式產生器</param>
        /// <returns>int</returns>
        public int ExecuteNonQuery(InsertCommandBuilder builder)
        {
            return ExecuteNonQuery(builder.GetCommandType(), builder.ToInsertCommandString(), builder.GetInsertParameters());
        }
        /// <summary>
        /// 轉換CmdParameter物件為SqlParameter物件。
        /// </summary>
        private SqlParameter ToSqlParameter(CmdParameter cmdparameter)
        {
            SqlParameter sqlparameter = new SqlParameter();
            sqlparameter.ParameterName = cmdparameter.ParameterName;
            if (!sqlparameter.ParameterName.StartsWith(SqlKeyWord.AT))
                sqlparameter.ParameterName = SqlKeyWord.AT + sqlparameter.ParameterName;
            if (cmdparameter.SqlDbType.HasValue)
                sqlparameter.SqlDbType = cmdparameter.SqlDbType.Value;
            if (cmdparameter.Size.HasValue)
                sqlparameter.Size = cmdparameter.Size.Value;
            sqlparameter.Value = cmdparameter.Value;
            if (cmdparameter.Value == null) sqlparameter.Value = DBNull.Value;
            return sqlparameter;
        }
        #endregion
    }
}