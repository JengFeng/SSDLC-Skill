using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Data;
using System.Data.SqlClient;

namespace SyncDataBase
{
    // 注意: 您可以使用 [重構] 功能表上的 [重新命名] 命令同時變更程式碼和組態檔中的介面名稱 "IService1"。
    [ServiceContract]
    [ServiceKnownType(typeof(CmdParameter))]
    //[ServiceKnownType(typeof(ListCmdParameter))]
    [ServiceKnownType(typeof(UpdateCommandBuilder))]
    [ServiceKnownType(typeof(InsertCommandBuilder))]
    [ServiceKnownType(typeof(SelectCommandBuilder))]
    [ServiceKnownType(typeof(System.DBNull))]
    public interface ISqlService
    {
        [OperationContract]
        string CheckKey(string InputKey);//

        // TODO: 在此新增您的服務作業 
        [OperationContract]
        //[WebGet]
        string[] GetSchemaTables();//取得資料庫中所有資料表名稱陣列

        [OperationContract]
        //[WebGet]
        string[] GetSchemaColumnsByTable(string tableName);//取得資料表中的所有欄位名稱陣列

        [OperationContract]
        //[WebInvoke]
        CmdParameter[] GetCmdParametersByTable(string tableName);//取得資料表中的命令參數列陣設定

        [OperationContract]
        //[WebInvoke]
        DataSet GetDataBySelectBuilder(SelectCommandBuilder builder);//查詢取得DataSet

        [OperationContract]
        //[WebInvoke(BodyStyle = WebMessageBodyStyle.WrappedRequest)]
        DataSet GetDataByParameter(string comText, CmdParameter[] comParms);//查詢取得DataSet(簡易)

        [OperationContract]
        //[WebInvoke]
        DataSet GetDataByText(string comText);//SQL 語法查詢取得DataSet(簡易)

        [OperationContract]
        //[WebInvoke]
        string GetScalarByParameter(string comText, CmdParameter[] comParms);//查詢第一列的第一行資料

        [OperationContract]
        //[WebInvoke]
        string GetScalarByText(string comText);//SQL 語法查詢第一列的第一行資料(簡易)

        [OperationContract]
        //[WebInvoke]
        string GetJsonByParameter(string comText, CmdParameter[] comParms);//SQL 語法查詢取得Json String

        [OperationContract]
        //[WebInvoke]
        string GetJsonByParameterForJoe(string comText, CmdParameter[] comParms);//SQL 語法查詢取得Json String

        [OperationContract]
        //[WebInvoke]
        int ExecuteByUpdateBuilder(UpdateCommandBuilder builder);//SQL Execute For Update 

        [OperationContract]
        //[WebInvoke]
        int ExecuteByInsertBuilder(InsertCommandBuilder builder);//SQL Execute For Insert

        [OperationContract]
        //[WebInvoke(BodyStyle = WebMessageBodyStyle.WrappedRequest)]
        int ExecuteByParameter(string comText, CmdParameter[] comParms);//SQL Execute(簡易)

        [OperationContract]
        //[WebInvoke(BodyStyle = WebMessageBodyStyle.WrappedRequest)]
        int ExecuteByParameter_ReSN(string comText, CmdParameter[] comParms, out int intSN);//SQL Execute(自動編號後的數值)

        [OperationContract]
        //[WebInvoke]
        int ExecuteByText(string comText);//SQL Execute 無參數(簡易)

        [OperationContract]
        //[WebInvoke]
        DataSet GetDataSetByListParamByJoe(List<string> listSQL, List<int> listCount, CmdParameter[] allComParms);//查詢取得所有DataSet

    }

    #region CmdParameter
    //使用下列範例中所示的資料合約，新增複合型別至服務作業。
    [DataContract]
    [System.SerializableAttribute()]
    [KnownType(typeof(CmdParameter))]
    [KnownType(typeof(System.DBNull))]
    //[Serializable]
    //[KnownType(typeof(System.Data.SqlClient.SqlParameter))]
    public struct CmdParameter
    {
        /// <summary>
        /// 參數名稱
        /// </summary>
        [DataMember(Name = "ParameterName", IsRequired = true)]
        public string ParameterName;
        /// <summary>
        /// 參數類型
        /// </summary>
        [DataMember(Name = "SqlDbType")]
        public SqlDbType? SqlDbType;
        /// <summary>
        /// 參數長度大小
        /// </summary>
        [DataMember(Name = "Size")]
        public int? Size;
        /// <summary>
        /// 參數值
        /// </summary>
        [DataMember(Name = "Value")]
        public object Value;

        /*
        public CmdParameter(SqlParameter param)
        {
            this.ParameterName = param.ParameterName;
            this.Size = param.Size;
            this.SqlDbType = param.SqlDbType;
            this.Value = param.Value;
        }
        public SqlParameter ToSqlParameter()
        {
            SqlParameter sqlparameter = new SqlParameter();
            sqlparameter.ParameterName = this.ParameterName;
            if (!sqlparameter.ParameterName.StartsWith(SqlKeyWord.AT))
                sqlparameter.ParameterName = SqlKeyWord.AT + sqlparameter.ParameterName;
            if (this.SqlDbType.HasValue) sqlparameter.SqlDbType = this.SqlDbType.Value;
            if (this.Size.HasValue) sqlparameter.Size = this.Size.Value;
            sqlparameter.Value = this.Value;
            if (this.Value == null) sqlparameter.Value = DBNull.Value;
            return sqlparameter;
        }
        */
    }
    #endregion

    //[DataContract]
    //[System.SerializableAttribute()]
    //[KnownType(typeof(ListCmdParameter))]
    //public struct ListCmdParameter
    //{
    //    [DataMember(Name = "list_CmdParameter", IsRequired = true)]
    //    public List<CmdParameter[]> list_CmdParameter;

    //    [DataMember(Name = "CmdParameterA", IsRequired = true)]
    //    public CmdParameter[][] CmdParameterA;
    //}

    #region UpdateCommandBuilder
    [DataContract]
    [KnownType(typeof(UpdateCommandBuilder))]
    public class UpdateCommandBuilder : IDisposable
    {
        #region 欄位
        private string table;
        private string updatecommand;
        private CommandType commandtype;
        private List<CmdParameter> updatesetparameters;
        private List<CmdParameter> updatewhereparameters;
        #endregion

        #region 屬性
        [DataMember(Name = "TableName", IsRequired = true)]
        /// <summary>
        /// 資料表的名稱
        /// </summary>
        public string TableName
        {
            get { return table; }
            set { table = value; }
        }
        #endregion

        #region 建構子
        public UpdateCommandBuilder(string table_name)
        {
            this.table = table_name;
            this.commandtype = CommandType.Text;
            this.updatesetparameters = new List<CmdParameter>();
            this.updatewhereparameters = new List<CmdParameter>();
        }
        #endregion

        #region 解構子
        ~UpdateCommandBuilder()
        {
            Dispose(false);
        }

        /// <summary>
        /// 釋放BalanceWithdraw資源
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
        }

        /// <summary>
        /// 釋放WithdrawType資源
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
        }
        #endregion

        #region 方法
        /// <summary>
        /// 取得命令列型態
        /// </summary>
        public CommandType GetCommandType()
        {
            return this.commandtype;
        }
        /// <summary>
        /// 設定命令列型態
        /// </summary>
        public void SetCommandType(CommandType value)
        {
            this.commandtype = value;
        }
        /// <summary>
        /// 轉為 Select 命令列
        /// </summary>
        public string ToUpdateCommandString()
        {
            if (string.IsNullOrEmpty(this.updatecommand))
            {
                StringBuilder sb = new StringBuilder();
                sb.Append(SqlKeyWord.UPDATE).Append(SqlKeyWord.SPACE);
                sb.Append(this.table).Append(SqlKeyWord.SPACE);
                sb.Append(SqlKeyWord.SET).Append(SqlKeyWord.SPACE);
                if (this.updatesetparameters != null && this.updatesetparameters.Count > 0)
                {
                    for (int i = 0; i < this.updatesetparameters.Count; i++)
                    {
                        if (i != 0) sb.Append(SqlKeyWord.COMMA);
                        string name = this.updatesetparameters[i].ParameterName;
                        string pname = name;
                        if (name.StartsWith(SqlKeyWord.AT)) name = name.Substring(1);
                        else pname = SqlKeyWord.AT + name;
                        sb.Append(name).Append(SqlKeyWord.EQUAL).Append(pname).Append(SqlKeyWord.SPACE);
                    }
                }
                if (this.updatewhereparameters != null && this.updatewhereparameters.Count > 0)
                {
                    sb.Append(SqlKeyWord.WHERE).Append(SqlKeyWord.SPACE);
                    for (int i = 0; i < this.updatewhereparameters.Count; i++)
                    {
                        if (i != 0) sb.Append(SqlKeyWord.AND);
                        string name = this.updatewhereparameters[i].ParameterName;
                        string pname = name;
                        if (name.StartsWith(SqlKeyWord.AT)) name = name.Substring(1);
                        else pname = SqlKeyWord.AT + name;
                        sb.Append(name).Append(SqlKeyWord.EQUAL).Append(pname).Append(SqlKeyWord.SPACE);
                    }
                }
                this.updatecommand = sb.ToString();
            }
            return this.updatecommand;
        }
        /// <summary>
        /// 增加要更新資料的設定參數
        /// </summary>
        /// <param name="parameter">更新資料的設定參數</param>
        /// <returns></returns>
        public void AddUpdateSetParameter(CmdParameter parameter)
        {
            if (this.updatesetparameters != null)
                this.updatesetparameters.Add(parameter);
        }
        /// <summary>
        /// 移除要更新資料的設定參數
        /// </summary>
        /// <param name="parameter">更新資料的設定參數</param>
        /// <returns></returns>
        public void RemoveUpdateSetParameter(CmdParameter parameter)
        {
            if (this.updatesetparameters != null)
                this.updatesetparameters.Remove(parameter);
        }
        /// <summary>
        /// 取得更新資料的設定參數數目陣列
        /// </summary>
        /// <returns>更新資料的設定參數數目陣列</returns>
        public CmdParameter[] GetUpdateSetParameters()
        {
            if (this.updatesetparameters != null)
                return this.updatesetparameters.ToArray<CmdParameter>();
            return null;
        }
        /// <summary>
        /// 設定更新資料的設定參數數目陣列
        /// </summary>
        /// <param name="comParms">更新資料的設定參數數目陣列</param>
        /// <returns></returns>
        public void SetUpdateSetParameters(params CmdParameter[] comParms)
        {
            if (comParms != null)
                this.updatesetparameters = new List<CmdParameter>(comParms); ;
        }
        /// <summary>
        /// 增加要更新資料的條件參數
        /// </summary>
        /// <param name="parameter">更新資料的條件參數</param>
        /// <returns></returns>
        public void AddUpdateWhereParameter(CmdParameter parameter)
        {
            if (this.updatewhereparameters != null)
                this.updatewhereparameters.Add(parameter);
        }
        /// <summary>
        /// 移除要更新資料的條件參數
        /// </summary>
        /// <param name="parameter">更新資料的條件參數</param>
        /// <returns></returns>
        public void RemoveUpdateWhereParameter(CmdParameter parameter)
        {
            if (this.updatewhereparameters != null)
                this.updatewhereparameters.Remove(parameter);
        }
        /// <summary>
        /// 取得更新資料的條件參數數目陣列
        /// </summary>
        /// <returns>更新資料的條件參數數目陣列</returns>
        public CmdParameter[] GetUpdateWhereParameters()
        {
            if (this.updatewhereparameters != null)
                return this.updatesetparameters.ToArray<CmdParameter>();
            return null;
        }
        /// <summary>
        /// 設定更新資料的條件參數數目陣列
        /// </summary>
        /// <param name="comParms">更新資料的條件參數數目陣列</param>
        /// <returns></returns>
        public void SetUpdateWhereParameters(params CmdParameter[] comParms)
        {
            if (comParms != null)
                this.updatewhereparameters = new List<CmdParameter>(comParms); ;
        }

        /// <summary>
        /// 取得所有的更新參數與條件參數數目陣列
        /// </summary>
        /// <returns>所有的更新參數與條件參數數目陣列</returns>
        public CmdParameter[] GetAllUpdateParameters()
        {
            List<CmdParameter> list = new List<CmdParameter>();
            list.AddRange(this.GetUpdateSetParameters());
            list.AddRange(this.GetUpdateWhereParameters());
            return list.ToArray<CmdParameter>(); ;
        }

        /// <summary>
        /// 設定自定的SQL語法(如果不要自定請設定為空字串)
        /// </summary>
        /// <returns></returns>
        public void SetUpdateCommandString(string updateCommand)
        {
            this.updatecommand = updateCommand;
        }
        #endregion
    }
    #endregion

    #region InsertCommandBuilder
    [DataContract]
    [KnownType(typeof(InsertCommandBuilder))]
    public class InsertCommandBuilder : IDisposable
    {
        #region 欄位
        private string table;
        private string insertcommand;
        private CommandType commandtype;
        private List<CmdParameter> insertparameters;
        private string identitycolumn;
        #endregion

        #region 屬性
        [DataMember(Name = "TableName", IsRequired = true)]
        /// <summary>
        /// 資料表的名稱
        /// </summary>
        public string TableName
        {
            get { return table; }
            set { table = value; }
        }
        #endregion

        #region 建構子
        public InsertCommandBuilder(string table_name)
        {
            this.table = table_name;
            this.commandtype = CommandType.Text;
            this.insertparameters = new List<CmdParameter>();
        }
        #endregion

        #region 解構子
        ~InsertCommandBuilder()
        {
            Dispose(false);
        }

        /// <summary>
        /// 釋放BalanceWithdraw資源
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
        }

        /// <summary>
        /// 釋放WithdrawType資源
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
        }
        #endregion

        #region 方法
        /// <summary>
        /// 取得命令列型態
        /// </summary>
        public CommandType GetCommandType()
        {
            return this.commandtype;
        }
        /// <summary>
        /// 設定命令列型態
        /// </summary>
        public void SetCommandType(CommandType value)
        {
            this.commandtype = value;
        }
        /// <summary>
        /// 轉為 Select 命令列
        /// </summary>
        public string ToInsertCommandString()
        {
            if (string.IsNullOrEmpty(this.insertcommand))
            {
                StringBuilder sb = new StringBuilder();
                sb.Append(SqlKeyWord.INSERT).Append(SqlKeyWord.SPACE).Append(SqlKeyWord.INTO).Append(SqlKeyWord.SPACE);
                sb.Append(this.table).Append(SqlKeyWord.SPACE);
                if (this.insertparameters != null && this.insertparameters.Count > 0)
                {
                    sb.Append(SqlKeyWord.LBRACKET);
                    if (string.IsNullOrEmpty(identitycolumn) == false)
                        sb.Append(identitycolumn).Append(SqlKeyWord.SPACE).Append(SqlKeyWord.COMMA);
                    for (int i = 0; i < this.insertparameters.Count; i++)
                    {
                        if (i != 0) sb.Append(SqlKeyWord.COMMA);
                        string name = this.insertparameters[i].ParameterName;
                        if (name.StartsWith(SqlKeyWord.AT)) name = name.Substring(1);
                        sb.Append(name).Append(SqlKeyWord.SPACE);
                    }
                    sb.Append(SqlKeyWord.RBRACKET).Append(SqlKeyWord.SPACE);
                    sb.Append(SqlKeyWord.VALUES).Append(SqlKeyWord.LBRACKET);
                    if (string.IsNullOrEmpty(identitycolumn) == false)
                        sb.Append(SqlKeyWord.DOLLARS).Append(TableName).Append(SqlKeyWord.DOT).Append(identitycolumn).Append(SqlKeyWord.DOLLARS).Append(SqlKeyWord.SPACE).Append(SqlKeyWord.COMMA);
                    for (int i = 0; i < this.insertparameters.Count; i++)
                    {
                        if (i != 0) sb.Append(SqlKeyWord.COMMA);
                        string pname = this.insertparameters[i].ParameterName;
                        if (!pname.StartsWith(SqlKeyWord.AT)) pname = SqlKeyWord.AT + pname;
                        sb.Append(pname).Append(SqlKeyWord.SPACE);
                    }
                    sb.Append(SqlKeyWord.RBRACKET);
                }
                this.insertcommand = sb.ToString();
            }
            return this.insertcommand;
        }
        /// <summary>
        /// 設定自動編號的欄位
        /// </summary>
        /// <param name="column">自動編號的欄位</param>
        /// <returns></returns>
        public void SetIdentityColumn(string column)
        {
            this.identitycolumn = column;
        }
        /// <summary>
        /// 增加要更新資料的設定參數
        /// </summary>
        /// <param name="parameter">更新資料的設定參數</param>
        /// <returns></returns>
        public void AddInsertParameter(CmdParameter parameter)
        {
            if (this.insertparameters != null)
                this.insertparameters.Add(parameter);
        }
        /// <summary>
        /// 移除要更新資料的設定參數
        /// </summary>
        /// <param name="parameter">更新資料的設定參數</param>
        /// <returns></returns>
        public void RemoveInsertParameter(CmdParameter parameter)
        {
            if (this.insertparameters != null)
                this.insertparameters.Remove(parameter);
        }
        /// <summary>
        /// 取得更新資料的設定參數數目陣列
        /// </summary>
        /// <returns>更新資料的設定參數數目陣列</returns>
        public CmdParameter[] GetInsertParameters()
        {
            if (this.insertparameters != null)
                return this.insertparameters.ToArray<CmdParameter>();
            return null;
        }
        /// <summary>
        /// 設定更新資料的設定參數數目陣列
        /// </summary>
        /// <param name="comParms">更新資料的設定參數數目陣列</param>
        /// <returns></returns>
        public void SetInsertParameters(params CmdParameter[] comParms)
        {
            if (comParms != null)
                this.insertparameters = new List<CmdParameter>(comParms); ;
        }
        /// <summary>
        /// 設定自定的SQL語法(如果不要自定請設定為空字串)
        /// </summary>
        /// <returns></returns>
        public void SetInsertCommandString(string insertCommand)
        {
            this.insertcommand = insertCommand;
        }
        #endregion
    }
    #endregion

    #region SelectCommandBuilder
    [DataContract]
    [KnownType(typeof(SelectCommandBuilder))]
    public class SelectCommandBuilder : IDisposable
    {
        #region 欄位
        private bool distinct;
        private int top;
        private string table;
        private string selectcommand;
        private CommandType commandtype;
        private List<CmdParameter> selectparameters;
        private List<string> selectcolumns;
        private Dictionary<string, bool> orderbycolumns;
        #endregion

        #region 屬性
        [DataMember(Name = "TableName", IsRequired = true)]
        /// <summary>
        /// 資料表的名稱
        /// </summary>
        public string TableName
        {
            get { return table; }
            set { table = value; }
        }
        #endregion

        #region 建構子
        public SelectCommandBuilder(string table_name)
        {
            this.table = table_name;
            this.commandtype = CommandType.Text;
            this.selectparameters = new List<CmdParameter>();
            this.selectcolumns = new List<string>();
            this.orderbycolumns = new Dictionary<string, bool>();
        }
        #endregion

        #region 解構子
        ~SelectCommandBuilder()
        {
            Dispose(false);
        }

        /// <summary>
        /// 釋放BalanceWithdraw資源
        /// </summary>
        public void Dispose()
        {
            Dispose(true);
        }

        /// <summary>
        /// 釋放WithdrawType資源
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
        }
        #endregion

        #region 方法
        /// <summary>
        /// 取得DISTINCT狀態
        /// </summary>
        public bool GetSelectDistinct()
        {
            return this.distinct;
        }
        /// <summary>
        /// 設定DISTINCT狀態
        /// </summary>
        public void SetSelectDistinct(bool value)
        {
            this.distinct = value;
        }
        /// <summary>
        /// 取得TOP數列資料
        /// </summary>
        public int GetSelectTop()
        {
            return this.top;
        }
        /// <summary>
        /// 設定TOP數列
        /// </summary>
        public void SetSelectTop(int value)
        {
            this.top = value;
        }
        /// <summary>
        /// 取得命令列型態
        /// </summary>
        public CommandType GetCommandType()
        {
            return this.commandtype;
        }
        /// <summary>
        /// 設定命令列型態
        /// </summary>
        public void SetCommandType(CommandType value)
        {
            this.commandtype = value;
        }
        /// <summary>
        /// 轉為 Select 命令列
        /// </summary>
        /// <returns></returns>
        public string ToSelectCommandString()
        {
            if (string.IsNullOrEmpty(this.selectcommand))
            {
                StringBuilder sb = new StringBuilder();
                sb.Append(SqlKeyWord.SELECT).Append(SqlKeyWord.SPACE);
                if (this.top > 0) sb.Append(SqlKeyWord.TOP).Append(SqlKeyWord.SPACE).Append(this.top).Append(SqlKeyWord.SPACE);
                if (this.distinct) sb.Append(SqlKeyWord.DISTINCT).Append(SqlKeyWord.SPACE);
                if (this.selectcolumns != null && this.selectcolumns.Count > 0)
                {
                    for (int i = 0; i < this.selectcolumns.Count; i++)
                    {
                        if (i != 0) sb.Append(SqlKeyWord.COMMA);
                        sb.Append(this.selectcolumns[i]);
                    }
                }
                else sb.Append(SqlKeyWord.ALL);
                sb.Append(SqlKeyWord.SPACE).Append(SqlKeyWord.FROM).Append(SqlKeyWord.SPACE).Append(this.table);
                if (this.selectparameters != null && this.selectparameters.Count > 0)
                {
                    sb.Append(SqlKeyWord.WHERE).Append(SqlKeyWord.SPACE);
                    for (int i = 0; i < this.selectparameters.Count; i++)
                    {
                        if (i != 0) sb.Append(SqlKeyWord.AND);
                        string name = this.selectparameters[i].ParameterName;
                        string pname = name;
                        if (name.StartsWith(SqlKeyWord.AT)) name = name.Substring(1);
                        else pname = SqlKeyWord.AT + name;
                        sb.Append(name).Append(SqlKeyWord.EQUAL).Append(pname).Append(SqlKeyWord.SPACE);
                    }
                }
                if (this.orderbycolumns != null && this.orderbycolumns.Count > 0)
                {
                    sb.Append(SqlKeyWord.ORDERBY).Append(SqlKeyWord.SPACE);
                    int i = 0;
                    foreach (KeyValuePair<string, bool> kv in this.orderbycolumns)
                    {
                        if (i != 0) sb.Append(SqlKeyWord.COMMA);
                        sb.Append(kv.Key);
                        if (kv.Value) sb.Append(SqlKeyWord.ASC);
                        else sb.Append(SqlKeyWord.DESC);
                        sb.Append(SqlKeyWord.SPACE);
                        i++;
                    }
                }
                this.selectcommand = sb.ToString();
            }
            return this.selectcommand;
        }
        /// <summary>
        /// 增加要取得資料欄位
        /// </summary>
        /// <param name="column">資料欄位</param>
        /// <returns></returns>
        public void AddSelectColumn(string column)
        {
            if (this.selectcolumns != null)
                this.selectcolumns.Add(column);
        }
        /// <summary>
        /// 移除要取得欄位
        /// </summary>
        /// <param name="column">資料欄位</param>
        /// <returns></returns>
        public void RemoveSelectColumn(string column)
        {
            if (this.selectcolumns != null)
                this.selectcolumns.Remove(column);
        }
        /// <summary>
        /// 取得欄位數目
        /// </summary>
        /// <returns>欄位數目</returns>
        public int SelectColumnCount()
        {
            if (this.selectcolumns != null)
                return this.selectcolumns.Count;
            return 0;
        }
        /// <summary>
        /// 增加要取得資料條件參數
        /// </summary>
        /// <param name="parameter">資料條件參數</param>
        /// <returns></returns>
        public void AddSelectParameter(CmdParameter parameter)
        {
            if (this.selectparameters != null)
                this.selectparameters.Add(parameter);
        }
        /// <summary>
        /// 移除要取得資料條件參數
        /// </summary>
        /// <param name="parameter">資料條件參數</param>
        /// <returns></returns>
        public void RemoveSelectParameter(CmdParameter parameter)
        {
            if (this.selectparameters != null)
                this.selectparameters.Remove(parameter);
        }
        /// <summary>
        /// 取得參數數目陣列
        /// </summary>
        /// <returns>參數數目陣列</returns>
        public CmdParameter[] GetSelectParameters()
        {
            if (this.selectparameters != null)
                return this.selectparameters.ToArray<CmdParameter>();
            return null;
        }
        /// <summary>
        /// 設定參數數目陣列
        /// </summary>
        /// <param name="comParms">參數數目陣列</param>
        /// <returns></returns>
        public void SetSelectParameters(params CmdParameter[] comParms)
        {
            if (comParms != null)
                this.selectparameters = new List<CmdParameter>(comParms); ;
        }
        /// <summary>
        /// 增加要排列欄位
        /// </summary>
        /// <param name="column">資料欄位</param>
        /// <param name="asc">正向排序</param>
        /// <returns></returns>
        public void AddOrderByColumn(string column, bool asc)
        {
            if (this.orderbycolumns != null)
                this.orderbycolumns.Add(column, asc);
        }
        /// <summary>
        /// 移除要排列欄位
        /// </summary>
        /// <param name="column">資料欄位</param>
        /// <returns></returns>
        public void RemoveOrderByColumn(string column)
        {
            if (this.orderbycolumns != null)
                this.orderbycolumns.Remove(column);
        }
        /// <summary>
        /// 排列欄位數目
        /// </summary>
        /// <returns>欄位數目</returns>
        public int OrderByColumnCount()
        {
            if (this.orderbycolumns != null)
                return this.orderbycolumns.Count;
            return 0;
        }
        /// <summary>
        /// 設定自定的SQL語法(如果不要自定請設定為空字串)
        /// </summary>
        /// <returns></returns>
        public void SetSelectCommandString(string selectCommand)
        {
            this.selectcommand = selectCommand;
        }
        #endregion
    }
    #endregion
}
