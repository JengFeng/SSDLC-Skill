using SyncDataBase;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SqlData
{
    public interface IDapperDataAccess : IDisposable
    {
        public List<T> Query<T>(string sql, object parameters = null);
        public int Execute(string sql);
    }
}
