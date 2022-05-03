using System;
using System.ServiceModel;
using SyncDataBase;
using System.Data;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;

namespace SqlData
{
    public class WcfData : ISqlData
    {
        #region 參數
        protected const string Key = "ILoveJeffery";
        private bool IsConnection = false;
        [ThreadStatic]
        private ChannelFactory<ISqlService> ServerChannel = null;
        private ISqlService ChannelService = null;
        private string ServiceUrl;
        /// <summary>
        /// 預設的網路協定。
        /// </summary>
        private static BasicHttpBinding DefaultHttpBinding = WcfManager.LoadDefaultHttpBinding();
        #endregion

        #region 建構子
        /// <summary>
        /// 建構子(必須手動設定連線網址)。
        /// </summary>
        public WcfData()
        {
        }
        /// <summary>
        /// 建構子。
        /// </summary>
        /// <param name="serviceUrl">連線網址</param> 
        public WcfData(string serviceUrl)
        {
            this.setServiceUrl(serviceUrl);
        }
        /// <summary>
        /// 解構子。
        /// </summary>
        ~WcfData()
        {
            Dispose(false);
        }
        /// <summary>
        /// 釋放資源。
        /// </summary>
        public void Dispose()
        {
            try
            {
                if (ServerChannel != null) ServerChannel.Close();
            }
            catch
            {
                if (ServerChannel != null) ServerChannel.Abort();
            }
            Dispose(true);
        }
        /// <summary>
        /// 釋放資源
        /// </summary>
        /// <param name="disposing">是否要使用 GC 釋放資源</param>
        public void Dispose(bool disposing)
        {
            if (disposing) GC.SuppressFinalize(this);
        }
        private ISqlService LoadService()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(this.ServiceUrl)) throw new NotSupportedException("This url is not Null or Empty!");
                else
                {
                    Uri baseAddress = new Uri(this.ServiceUrl);
                    var endpoint = new EndpointAddress(baseAddress);
                    this.ServerChannel = new ChannelFactory<ISqlService>(DefaultHttpBinding, endpoint);
                    var service = this.ServerChannel.CreateChannel();
                    return service;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }
        private void checkService()
        {
            if (this.ChannelService == null) this.ChannelService = LoadService();
        }
        private void checkConnection()
        {
            try
            {
                if (!this.IsConnection)
                {
                    checkService();
                    var key = ChannelService.CheckKey(WcfData.Key);
                    if (key == WcfManager.OK) this.IsConnection = true;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Connection Service:" + ex.Message);
            }
        }
        #endregion

        #region ISqlData 方法
        /// <summary>
        /// 重新設定連線網址。
        /// </summary>
        /// <param name="serviceUrl">連線網址</param> 
        public void setServiceUrl(string serviceUrl)
        {
            this.ServiceUrl = serviceUrl;
            this.ChannelService = LoadService();
        }

        /// <summary>
        /// 執行命令。
        /// </summary>
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <returns>執行數</returns> 
        public int Execute(string sql)
        {
            return Execute(sql, null);
        }
        /// <summary>
        /// 執行命令。
        /// </summary>
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>執行數</returns> 
        public int Execute(string sql, List<SqlParameter> listSqlParam)
        {
            checkConnection();
            CmdParameter[] arrayCmdParam = WcfManager.GetParameter(listSqlParam).ToArray();
            return ChannelService.ExecuteByParameter(sql, arrayCmdParam);
        }
        /// <summary>
        /// 執行命令。
        /// </summary>
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>執行數</returns> 
        public async Task<int> ExecuteAsync(string sql, List<SqlParameter> listSqlParam = null)
        {
            TaskCompletionSource<int> source = new TaskCompletionSource<int>();
            try
            {
                int result = Execute(sql, listSqlParam);
                source.TrySetResult(result);
            }
            catch (Exception ex)
            {
                source.SetException(ex);
            }
            return await source.Task;
        }
        /// <summary>
        /// 執行命令。
        /// </summary>
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>自動編號後的數值</returns> 
        public int ExecuteReturnSN(string sql, List<SqlParameter> listSqlParam)
        {
            checkConnection();
            CmdParameter[] arrayCmdParam = WcfManager.GetParameter(listSqlParam).ToArray();
            ChannelService.ExecuteByParameter_ReSN(sql, arrayCmdParam, out int sn);
            return sn;
        }
        /// <summary>
        /// 查詢第一個資料列的第一個資料行。
        /// </summary>
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <returns>DataTable</returns> 
        public string ExecuteScalar(string sql)
        {
            return ExecuteScalar(sql, null);
        }
        /// <summary>
        /// 查詢第一個資料列的第一個資料行。
        /// </summary>
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>字串值</returns> 
        public string ExecuteScalar(string sql, List<SqlParameter> listSqlParam)
        {
            checkConnection();
            CmdParameter[] arrayCmdParam = WcfManager.GetParameter(listSqlParam).ToArray();
            return ChannelService.GetScalarByParameter(sql, arrayCmdParam);
        }
        /// <summary>
        /// 查詢資料。
        /// </summary>
        /// <param name="sql">Transact-SQL 陳述式</param>
        /// <returns>DataTable</returns> 
        public DataTable Select(string sql)
        {
            return Select(sql, null);
        }
        /// <summary>
        /// 查詢資料。
        /// </summary>
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>DataTable</returns> 
        public DataTable Select(string sql, List<SqlParameter> listSqlParam)
        {
            checkConnection();
            CmdParameter[] arrayCmdParam = WcfManager.GetParameter(listSqlParam).ToArray();
            var result = ChannelService.GetDataByParameter(sql, arrayCmdParam);
            if (result != null && result.Tables.Count > 0) return result.Tables[0];
            return null;
        }
        /// <summary>
        /// 查詢資料。
        /// </summary>
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>DataTable</returns> 
        public async Task<DataTable> SelectAsync(string sql, List<SqlParameter> listSqlParam = null)
        {
            TaskCompletionSource<DataTable> source = new TaskCompletionSource<DataTable>();
            try
            {
                DataTable result = Select(sql, listSqlParam);
                source.TrySetResult(result);
            }
            catch (Exception ex)
            {
                source.SetException(ex);
            }
            return await source.Task;
        }
        #endregion
    }
}
