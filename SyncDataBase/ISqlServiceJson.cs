using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;
using System.ServiceModel.Web;

namespace SyncDataBase
{
    // 注意: 您可以使用 [重構] 功能表上的 [重新命名] 命令同時變更程式碼和組態檔中的介面名稱 "ISqlServiceJson"。
    [ServiceContract]
    [ServiceKnownType(typeof(CmdParameter))]
    public interface ISqlServiceJson
    {
        [OperationContract]
        [WebInvoke(Method = "*", BodyStyle = WebMessageBodyStyle.WrappedRequest, RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string GetJsonSchemaTables();//取得資料庫中所有資料表名稱陣列

        [OperationContract]
        [WebInvoke(Method = "*", BodyStyle = WebMessageBodyStyle.WrappedRequest, RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string GetJsonSchemaColumnsByTable(string tableName);////取得資料表中的所有欄位名稱陣列

        [OperationContract]
        [WebInvoke(Method = "*", BodyStyle = WebMessageBodyStyle.WrappedRequest, RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string GetJsonCmdParametersByTable(string tableName);//取得資料表中的命令參數列陣設定

        [OperationContract]
        [WebInvoke(Method = "*", BodyStyle = WebMessageBodyStyle.WrappedRequest, RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string GetJsonByParameter(string comText, CmdParameter[] comParms);

        [OperationContract]
        [WebInvoke(Method = "*", BodyStyle = WebMessageBodyStyle.WrappedRequest, RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string GetJsonByText(string comText);

        [OperationContract]
        [WebInvoke(Method = "*", BodyStyle = WebMessageBodyStyle.WrappedRequest, RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string GetScalarByParameter(string comText, CmdParameter[] comParms);

        [OperationContract]
        [WebInvoke(Method = "*", BodyStyle = WebMessageBodyStyle.WrappedRequest, RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        string GetScalarByText(string comText);

        [OperationContract]
        [WebInvoke(Method = "*", BodyStyle = WebMessageBodyStyle.WrappedRequest, RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        int ExecuteByParameter(string comText, CmdParameter[] comParms);

        [OperationContract]
        [WebInvoke(Method = "*", BodyStyle = WebMessageBodyStyle.WrappedRequest, RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        int ExecuteByText(string comText);
    }
}
