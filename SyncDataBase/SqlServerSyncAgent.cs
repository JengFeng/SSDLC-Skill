using Microsoft.Synchronization;
using Microsoft.Synchronization.Data;
using Microsoft.Synchronization.Data.Server;
using Microsoft.Synchronization.Data.SqlServer;
using Microsoft.Synchronization.Data.SqlServerCe;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace SyncDataBase
{
    public class SqlServerSyncAgent
    {
        private string _tablename;
        public string TableName
        {
            get { return this._tablename; }
            set { this._tablename = value; }
        }
        public string TableScope
        {
            get { return this._tablename + "Scope"; }
        }
        private SqlConnection serverConn;
        private SqlConnection clientConn;
        public SqlServerSyncAgent(string tablename)
        {
            this._tablename = tablename;
            serverConn = new SqlConnection(Setting.ConnectionString);
            DbSyncScopeDescription serverDesc = null;//SqlSyncDescriptionBuilder.GetDescriptionForScope(this.TableScope, serverConn);
            if (serverDesc == null)
            {
                serverDesc = new DbSyncScopeDescription(this.TableScope);
                DbSyncTableDescription serverTableDesc = SqlSyncDescriptionBuilder.GetDescriptionForTable(this._tablename, serverConn);
                serverDesc.Tables.Add(serverTableDesc);
            }

            SqlSyncScopeProvisioning serverProvision = new SqlSyncScopeProvisioning(serverConn, serverDesc);
            if (!serverProvision.ScopeExists(this.TableScope))
            {
                serverProvision.SetCreateTableDefault(DbSyncCreationOption.Skip);
                serverProvision.Apply();
            }

            clientConn = new SqlConnection(Setting.ChangeConnectionString);
            DbSyncScopeDescription clientDesc = SqlSyncDescriptionBuilder.GetDescriptionForScope(this.TableScope, clientConn);
            if (clientDesc == null)
            {
                clientDesc = new DbSyncScopeDescription(this.TableScope);
                DbSyncTableDescription clientTableDesc = SqlSyncDescriptionBuilder.GetDescriptionForTable(this._tablename, clientConn);
                clientDesc.Tables.Add(clientTableDesc);
            }

            SqlSyncScopeProvisioning clientProvision = new SqlSyncScopeProvisioning(clientConn, clientDesc);
            if (!clientProvision.ScopeExists(this.TableScope))
            {
                clientProvision.Apply();
            }
        }
        public SyncOperationStatistics Synchronize()
        {
            SyncOrchestrator syncOrchestrator = new SyncOrchestrator();
            //本地是server
            syncOrchestrator.LocalProvider = new SqlSyncProvider(this.TableScope, serverConn);
            //遠端是client
            syncOrchestrator.RemoteProvider = new SqlSyncProvider(this.TableScope, clientConn);
            syncOrchestrator.Direction = SyncDirectionOrder.DownloadAndUpload;

            SyncOperationStatistics syncStats = syncOrchestrator.Synchronize();

            Console.WriteLine("Start Time: " + syncStats.SyncStartTime);
            Console.WriteLine("Total Changes Uploaded: " + syncStats.UploadChangesTotal);
            Console.WriteLine("Total Changes Downloaded: " + syncStats.DownloadChangesTotal);
            Console.WriteLine("Complete Time: " + syncStats.SyncEndTime);
            Console.WriteLine(String.Empty);
            return syncStats;
        }
    }
}