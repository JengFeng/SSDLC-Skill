using Newtonsoft.Json;
using SyncDataBase;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;
using TWNPPublic.Models.Entity;

namespace SqlData
{
    public class DapperDataAccess : IDapperDataAccess
    {
        private string AccountName_;
        private string ClientIP_;
        private bool IsConnection = false;
        private string ServiceUrl;
        [ThreadStatic]
        private ChannelFactory<IDapperService> ServerChannel = null;
        private IDapperService ChannelService = null;
        private static BasicHttpBinding DefaultHttpBinding = WcfManager.LoadDefaultHttpBinding();

        private IDapperService LoadService()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(this.ServiceUrl)) throw new NotSupportedException("This url is not Null or Empty!");
                else
                {
                    Uri baseAddress = new Uri(this.ServiceUrl);
                    var endpoint = new EndpointAddress(baseAddress);
                    this.ServerChannel = new ChannelFactory<IDapperService>(DefaultHttpBinding, endpoint);
                    var service = this.ServerChannel.CreateChannel();
                    return service;
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }


        public DapperDataAccess(string serviceUrl)
        {
            this.setServiceUrl(serviceUrl);
        }
        public void setServiceUrl(string serviceUrl)
        {
            this.ServiceUrl = serviceUrl;
            this.ChannelService = LoadService();
        }


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
        public void Dispose(bool disposing)
        {
            if (disposing) GC.SuppressFinalize(this);
        }

        public int Execute(string sql, object parameters = null)
        {
            //TODO:記錄使用者操作
            SYS_LOG(sql, parameters,1, "Execute", 5);
            
            var steamparameters = JsonConvert.SerializeObject(parameters);
            return ChannelService.Execute(sql, steamparameters);
        }

        public int ExecuteList(string sql, object parameters = null)
        {
            //TODO:記錄使用者操作
            SYS_LOG(sql, parameters, 1, "ExecuteList", 5);

            var steamparameters = JsonConvert.SerializeObject(parameters);
            return ChannelService.ExecuteList(sql, steamparameters);
        }

        public List<T> Query<T>(string sql, object parameters = null)
        {
            //TODO:記錄使用者操作
            SYS_LOG(sql, parameters, 1, "Query", 5);

            var steamparameters = JsonConvert.SerializeObject(parameters);
            return JsonConvert.DeserializeObject<List<T>>(ChannelService.Query(sql, steamparameters));
        }

        public async Task<IEnumerable<T>> QueryAsync<T>(string sql, object parameters = null)
        {
            //TODO:記錄使用者操作
            SYS_LOG(sql, parameters, 1, "QueryAsync", 5);

            var steamparameters = JsonConvert.SerializeObject(parameters);
            return await Task.Run(() =>
            {
                var result = ChannelService.Query(sql, steamparameters);
                return JsonConvert.DeserializeObject<List<T>>(result);
            }).ConfigureAwait(false);
        }
        public void SetHttpContextAccessor(string AccountName, string ClientIP)
        {
            AccountName_ = AccountName;
            ClientIP_ = ClientIP;
        }

        public List<T> Query_<T>(string sql, object parameters = null)
        {
            var steamparameters = JsonConvert.SerializeObject(parameters);
            return JsonConvert.DeserializeObject<List<T>>(ChannelService.Query(sql, steamparameters));
        }

        //記錄使用者操作
        private void SYS_LOG(string sql,Object listSqlParam, int EXEC_LEVEL, string ACTION_NAME, int OP_TYPE = 0)
        {
            if (AccountName_ == null)
                return;

            try
            {
                string CLIENT_IP = ClientIP_;
              
                if (CLIENT_IP.IndexOf(",") > -1)
                {
                    CLIENT_IP = CLIENT_IP.Substring(CLIENT_IP.LastIndexOf(",") + 1);
                }

                System.Net.IPAddress[] ip = System.Net.Dns.GetHostAddresses(System.Net.Dns.GetHostName());

                string SERVER_IP = ip[0].ToString();

                string mainsql = @"INSERT INTO SYS_LOG
                            (ID,LOG_TIME,EXEC_LEVEL,EXEC_SYS_CODE,PAGE_CODE,ACTION_NAME,OP_TYPE,EXEC_CONTENT,CLIENT_IP,SERVER_IP,ACCOUNT_SN,ACCOUNT_NAME,ERROR_CODE)
                            VALUES
                            (@ID,@LOG_TIME,@EXEC_LEVEL,@EXEC_SYS_CODE,@PAGE_CODE,@ACTION_NAME,@OP_TYPE,@EXEC_CONTENT,@CLIENT_IP,@SERVER_IP,@ACCOUNT_SN,@ACCOUNT_NAME,@ERROR_CODE)";

                string ID = Guid.NewGuid().ToString().Trim(); //GUID操作識別碼(唯一值)(使用Guid.NewGuid().ToString())
                string LOG_TIME = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                string EXEC_SYS_CODE = "TWNPPublic";
                string PAGE_CODE = "DapperDataAccess";
                ReplaceWord(ref sql);//去掉多餘空白 
                string EXEC_CONTENT = sql;
                string ACCOUNT_SN = AccountName_;
                string ACCOUNT_NAME = "";
                string ERROR_CODE = "000000";
                object parameters = new { ID, LOG_TIME, EXEC_LEVEL, EXEC_SYS_CODE, PAGE_CODE, ACTION_NAME, OP_TYPE, EXEC_CONTENT, CLIENT_IP, SERVER_IP, ACCOUNT_SN , ACCOUNT_NAME, ERROR_CODE};

                Query_<SYS_LOG>(mainsql, parameters);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        //去掉多餘空白
        private void ReplaceWord(ref string strSQL_)
        {
            strSQL_ = strSQL_.Replace("  ", " ");
            if (strSQL_.IndexOf("  ") > -1)
                ReplaceWord(ref strSQL_);
        }

        private void checkConnection()
        {
            try
            {
                if (!this.IsConnection)
                {
                    checkService();
                     this.IsConnection = true;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Connection Service:" + ex.Message);
            }
        }

        private void checkService()
        {
            if (this.ChannelService == null) this.ChannelService = LoadService();
        }
    }
}
