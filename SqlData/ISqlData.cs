using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Data;
using System.Data.SqlClient;

namespace SqlData
{
    public interface ISqlData : IDisposable
    {
        /// <summary>
        /// 設定服務的網址。
        /// <param name="serviceUrl">服務的網址</param> 
        /// </summary>
        public void setServiceUrl(string serviceUrl);
        //--------------------------------------------------
        /// <summary>
        /// 執行命令。
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <returns>執行數</returns> 
        /// </summary>
        public int Execute(string sql);
        /// <summary>
        /// 執行命令。
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>執行數</returns> 
        /// </summary>
        public int Execute(string sql, List<SqlParameter> listSqlParam);
        /// <summary>
        /// 非同步執行命令。
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>執行數</returns> 
        /// </summary>
        public Task<int> ExecuteAsync(string sql, List<SqlParameter> listSqlParam = null);
        //--------------------------------------------------
        /// <summary>
        /// 執行命令。
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>自動編號後的數值</returns> 
        /// </summary>
        public int ExecuteReturnSN(string sql, List<SqlParameter> listSqlParam);
        /// <summary>
        /// 查詢第一個資料列的第一個資料行。
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <returns>自動編號後的數值</returns> 
        /// </summary>
        public string ExecuteScalar(string sql);
        /// <summary>
        /// 查詢第一個資料列的第一個資料行。
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>字串值</returns> 
        /// </summary>
        public string ExecuteScalar(string sql, List<SqlParameter> listSqlParam);
        //--------------------------------------------------
        /// <summary>
        /// 查詢資料。
        /// <param name="sql">Transact-SQL 陳述式</param>
        /// <returns>DataTable</returns> 
        /// </summary>
        public DataTable Select(string sql);
        /// <summary>
        /// 查詢資料。
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>DataTable</returns> 
        /// </summary>
        public DataTable Select(string sql, List<SqlParameter> listSqlParam);
        /// <summary>
        /// 非同步查詢資料。
        /// <param name="sql">Transact-SQL 陳述式</param> 
        /// <param name="listSqlParam">Transact-SQL 陳述式的參數陣列</param> 
        /// <returns>DataTable</returns> 
        /// </summary>
        public Task<DataTable> SelectAsync(string sql, List<SqlParameter> listSqlParam = null);
        //--------------------------------------------------
    }
}
