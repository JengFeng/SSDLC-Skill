using SqlData;
using System.Data.SqlClient;
using TWNPPublic.ViewModels.Dashboard;

namespace TWNPPublic.Domain.Service
{
    public class DashboardService : IDashboardService
    {
        private readonly IDapperDataAccess dataAccess;

        public DashboardService(IDapperDataAccess dataAccess)
        {
            this.dataAccess = dataAccess;
        }

        public DashMainViewModel GetDashMain(string WaterNo, string Account, DateTime Theday)
        {
            string mainsql = @"select *  From dbo.F_B_HOME(@WaterNo,@Account,@Theday)";
            object obj = new { Account,WaterNo, Theday };
            return dataAccess.Query<DashMainViewModel>(mainsql, obj).FirstOrDefault();
        }

        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate)
        {
            string mainsql = @"Select * From [dbo].[F_B_CHART](@WaterNo,'WEEK',@Cdate) Order by X";
            object obj = new { WaterNo, Cdate };
            return dataAccess.Query<DashMainWaterUseSearchViewModel>(mainsql, obj);
        }

        public List<B_NEWSViewModel> ListedNews()
        {
            string mainsql = @"SELECT TOP 5 * FROM B_NEWS WHERE VALID=1";
            return dataAccess.Query<B_NEWSViewModel>(mainsql);
        }

        public List<B_NOTEViewModel> ListedNotes(string WaterNo, DateTime StartTime, DateTime EndTime)
        {
            string mainsql = @"Select * From B_NOTE Where WATER_NO = @WaterNo And A_DATE Between @StartTime And @EndTime";
            object obj = new { WaterNo, StartTime, EndTime };
            return dataAccess.Query<B_NOTEViewModel>(mainsql,obj);
        }
    }

    public interface IDashboardService
    {
        public DashMainViewModel GetDashMain(string WATER_NO, string ACCOUNT, DateTime THEDAY);
        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate);
        public List<B_NEWSViewModel> ListedNews();
        public List<B_NOTEViewModel> ListedNotes(string WaterNo, DateTime StartTime, DateTime EndTime);
    }
}
