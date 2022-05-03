using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.Text;

namespace SyncDataBase
{
    // 注意: 您可以使用 [重構] 功能表上的 [重新命名] 命令同時變更程式碼和組態檔中的介面名稱 "IAdminService"。
    [ServiceContract]
    [ServiceKnownType(typeof(DataBaseType))]
    public interface IAdminService
    {
        [OperationContract]
        DataBaseType GetLocalDataBase();

        [OperationContract]
        DataBaseType GetUseDataBase();

        [OperationContract]
        bool IsBackup();

        [OperationContract]
        bool IsExecute();

        [OperationContract]
        string GetFailDataBaseDate(DataBaseType type);

        [OperationContract]
        string[] GetRecordFiles();

        [OperationContract]
        string GetLogFile(string filename);

        [OperationContract]
        bool TryDatabaseConnection(DataBaseType type);

        [OperationContract]
        bool TryDatabaseConnection2(DataBaseType type,out string strDBIP);

        [OperationContract]
        void SynchronizeService(DataBaseType type);
    }


}
