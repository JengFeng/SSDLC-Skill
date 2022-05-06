using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Channels;
using System.Text;
using System.Data;
using System.Data.SqlClient;

namespace SyncDataBase
{
    // 注意: 您可以使用 [重構] 功能表上的 [重新命名] 命令同時變更程式碼、svc 和組態檔中的類別名稱 "AdminService"。
    // 注意: 若要啟動 WCF 測試用戶端以便測試此服務，請在 [方案總管] 中選取 AdminService.svc 或 AdminService.svc.cs，然後開始偵錯。
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Allowed)]
    public class AdminService : IAdminService
    {
        #region 管理相關
        public DataBaseType GetLocalDataBase()
        {
            Setting.OpenSyncWork();
            return Setting.LocalDataBase;
        }

        public DataBaseType GetUseDataBase()
        {
            return Setting.UseDataBase;
        }

        public bool IsBackup()//可使用備份資料庫：值true表示可，值false表示不可
        {
            return Setting.IsBackup;
        }

        public bool IsExecute()//可執行寫入資料庫：值true表示可，值false表示不可
        {
            return Setting.IsExecute;
        }

        public string GetFailDataBaseDate(DataBaseType type)//取得失敗資料庫的時間內容
        {
            return Setting.GetFailDataBaseDate(type);
        }

        public string[] GetRecordFiles()//取得記錄檔路徑List
        {
            List<string> lsit = Setting.GetRecordFiles(DataBaseType.Server);//取得記錄檔路徑List
            lsit.AddRange(Setting.GetRecordFiles(DataBaseType.Remoting));
            return lsit.ToArray();
        }

        public string GetLogFile(string filename)//取得log檔內容
        {
            return Setting.GetLogFile(filename);
        }

        public bool TryDatabaseConnection(DataBaseType type)
        {
            bool IsConnect = false;
            try
            {
                string connectionstring = Setting.GetConnectionString(type);
                using (SqlServer sqlserver = new SqlServer(connectionstring, 5))
                {
                    IsConnect = true;
                }
            }
            catch { }
            return IsConnect;
        }

        public bool TryDatabaseConnection2(DataBaseType type,out string strDBIP)
        {
            bool IsConnect = false;
            string connectionstring = Setting.GetConnectionString(type);
            strDBIP = connectionstring;
            if (connectionstring == null || connectionstring.Trim() == "") return false;

            try
            {
                using (SqlServer sqlserver = new SqlServer(connectionstring, 5))
                {
                    IsConnect = true;
                }
            }
            catch { }
            return IsConnect;
        }

        public void SynchronizeService(DataBaseType type)//做同步處理
        {
            //做同步處理
            using (SqlServer SQLServer = new SqlServer(type, true))
            {
                //自動同步之前失敗資料 Joe 
                if (!Setting.Synchronize_New(Setting.UseDataBase))
                {
                    return;
                }

                SQLServer.SelectScalar(CommandType.Text, "SELECT TOP 1 object_id FROM SYS.OBJECTS WHERE type='U' AND is_ms_shipped = 0;;", null);
            }
        }
        #endregion
    }
}
