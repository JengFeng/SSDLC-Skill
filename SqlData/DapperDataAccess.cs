using Newtonsoft.Json;
using SyncDataBase;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Text;
using System.Threading.Tasks;

namespace SqlData
{
    public class DapperDataAccess : IDapperDataAccess
    {
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

        public int Execute(string sql)
        {
            return ChannelService.Execute(sql);
        }

        public List<T> Query<T>(string sql, object parameters = null)
        {
            return JsonConvert.DeserializeObject<List<T>>(ChannelService.Query(sql, parameters)); ;
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
