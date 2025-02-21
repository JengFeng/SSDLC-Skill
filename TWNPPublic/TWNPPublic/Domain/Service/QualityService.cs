using SqlData;
using System.Dynamic;
using TWNPPublic.Common.Extension;
using TWNPPublic.Models.SqlFunctions;
using TWNPPublic.ViewModels.Dashboard;
using TWNPPublic.ViewModels.Quality;

namespace TWNPPublic.Domain.Service
{
    public class QualityService : IQualityService
    {
        private readonly IDapperDataAccess dapperDataAccess;
        private readonly IAspNetUser aspNetUser;

        public QualityService(IDapperDataAccess dapperDataAccess, IAspNetUser aspNetUser)
        {
            this.dapperDataAccess = dapperDataAccess;
            this.aspNetUser = aspNetUser;
            this.dapperDataAccess.SetHttpContextAccessor(aspNetUser.Name.ToString(), aspNetUser.ClientIP.ToString());
        }

        public QualityChartViewModel GetWaterUseChart(DateTime? StartTime, DateTime? EndTime)
        {
            string pinsql = @"SELECT * FROM [dbo].[F_B_CHART1](@WaterNo,'PIN',@StartTime,@EndTime)";
            string amountsql = @"SELECT * FROM [dbo].[F_B_CHART1](@WaterNo,'AMOUNT',@StartTime,@EndTime)";

            var NowDate = DateTime.Now;
            //兩個都沒資料
            if (!StartTime.HasValue && !EndTime.HasValue)
            {
                EndTime = new DateTime(NowDate.Year, NowDate.Month, NowDate.Day);
                StartTime = new DateTime(NowDate.Year, NowDate.Month - 1, NowDate.Day);
            }
            else if (!StartTime.HasValue)
            {
                StartTime = EndTime.Value.AddMonths(-1);
            }
            else if (!EndTime.HasValue)
            {
                EndTime = new DateTime(NowDate.Year, NowDate.Month, NowDate.Day);
            }

            object obj = new
            {
                WaterNo = aspNetUser.CurrentWaterNo,
                StartTime,
                //配合資料庫的做出的妥協
                EndTime = EndTime.Value.AddDays(1).AddSeconds(-1)
            };

            var PinResult = this.dapperDataAccess.Query<F_B_CHART1>(pinsql, obj);
            var AmountResult = this.dapperDataAccess.Query<F_B_CHART1>(amountsql, obj);

            return new QualityChartViewModel
            {
                StartTime = StartTime.Value,
                EndTime = EndTime.Value,
                PinChartData = PinResult,
                AmountChartData = AmountResult
            };
        }

        public WaterTypeViewModel QueryWaterTypeData(DateTime StartTime, DateTime EndTime, string WaterNo)
        {
            string mainsql = @"EXEC spGET_CALCLAST_YEAR_AVGWATERUSAGE @WaterNo,@Sdate,@Edate";
            string Sdate = StartTime.ToString("yyyyMM");
            string Edate = EndTime.ToString("yyyyMM");
            object obj = new { Sdate,  Edate, WaterNo };
            return dapperDataAccess.Query<WaterTypeViewModel>(mainsql, obj).FirstOrDefault();
        }
    }
    public interface IQualityService
    {
        public QualityChartViewModel GetWaterUseChart(DateTime? StartTime, DateTime? EndTime);
    
        public WaterTypeViewModel QueryWaterTypeData(DateTime StartTime, DateTime EndTime,string WATER_NO);
    }
}
