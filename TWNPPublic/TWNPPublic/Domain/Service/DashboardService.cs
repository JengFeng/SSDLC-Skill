using SqlData;
using System.Data.SqlClient;
using TWNPPublic.Models.Entity;
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
            string mainsql = @"select * From dbo.F_B_HOME(@WaterNo,@Account,@Theday)";
            object obj = new { Account, WaterNo, Theday };
            return dataAccess.Query<DashMainViewModel>(mainsql, obj).FirstOrDefault();
        }

        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate)
        {
            string mainsql = @"Select * From [dbo].[F_B_CHART](@WaterNo,'WEEK',@Cdate) Order by X";
            object obj = new { WaterNo, Cdate };
            return dataAccess.Query<DashMainWaterUseSearchViewModel>(mainsql, obj);
        }

        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate, string Timesplit)
        {
            string mainsql = @"Select * From [dbo].[F_B_CHART](@WaterNo,@Timesplit,@Cdate) Order by X";
            object obj = new { WaterNo, Cdate, Timesplit };
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
            return dataAccess.Query<B_NOTEViewModel>(mainsql, obj);
        }

        public List<V_B_MESSAGE> LitedExceptionItem(string WaterNo, int page, int itemsPerPage)
        {
            //測試機是 又舊版SQL 又要ROW_NUMBER() 真的母湯 ==
            string countsql = @"Select Count(*)
                                From  V_B_ACCOUNT V,B_MESSAGE M 
                                Where V.B_ACCOUNT_SN=M.B_ACCOUNT_SN AND M.VALID=1 ANd M.WATER_NO = @WaterNo";
            string mainsql = @"Select * From 
                                (
	                                Select Top 10000 ROW_NUMBER() OVER (ORDER BY M.INP_DATE) AS Seq,M.WATER_NO,M.NOTE,M.INP_DATE,M.B_MESSAGE_SN 
	                                From  V_B_ACCOUNT V,B_MESSAGE M 
	                                Where V.B_ACCOUNT_SN=M.B_ACCOUNT_SN AND M.VALID=1 ANd M.WATER_NO = @WaterNo
                                )t
                                WHERE 1=1 ";

            mainsql += " AND Seq Between @StartPage AND @EndPage";
            //mainsql += @" ORDER BY CreateTime DESC" + @" OFFSET @skip ROWS" + @" FETCH NEXT @take ROWS ONLY";
            object obj = new
            {
                WaterNo,
                StartPage = itemsPerPage * page,
                EndPage = itemsPerPage * page + itemsPerPage
            };
            var result = dataAccess.Query<V_B_MESSAGE>(mainsql, obj);
            return result;
        }
    }

    public interface IDashboardService
    {
        public DashMainViewModel GetDashMain(string WATER_NO, string ACCOUNT, DateTime THEDAY);
        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate);
        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate, string Timesplit);
        public List<B_NEWSViewModel> ListedNews();
        public List<B_NOTEViewModel> ListedNotes(string WaterNo, DateTime StartTime, DateTime EndTime);
        public List<V_B_MESSAGE> LitedExceptionItem(string WaterNo, int page, int itemsPerPage);
    }
}
