using SqlData;
using System.Data.SqlClient;
using TWNPPublic.Models.Entity;
using TWNPPublic.Models.SqlFunctions;
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

        public List<F_B_CHART> ListedChart(string WaterNo, DateTime Cdate, string Timesplit)
        {
            string mainsql = @"Select * From [dbo].[F_B_CHART](@WaterNo,@Timesplit,@Cdate) Order by X";
            object obj = new { WaterNo, Cdate, Timesplit };
            var result = dataAccess.Query<F_B_CHART>(mainsql, obj);
            return result;
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

        /// <summary>
        /// 警示訊息分頁用
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="page"></param>
        /// <param name="itemsPerPage"></param>
        /// <returns></returns>
        public (List<V_B_MESSAGE> items, int Count) LitedExceptionItem(string WaterNo, int page, int itemsPerPage)
        {
            //測試機是 又舊版SQL 又要ROW_NUMBER() 真的母湯 ==
            string countsql = @"Select Count(*) as Counter
                                From  B_MESSAGE M 
                                Where M.VALID=1 ANd M.WATER_NO = @WaterNo";
            string mainsql = @"Select * From 
                                (
                                    Select Top 10000 ROW_NUMBER() OVER (ORDER BY M.INP_DATE) AS Seq,M.WATER_NO,M.NOTE,M.INP_DATE,M.B_MESSAGE_SN 
                                    From B_MESSAGE M 
                                    Where M.VALID=1 ANd M.WATER_NO = @WaterNo
                                    order by M.INP_DATE desc 
                                )t
                                WHERE 1=1 ";

            mainsql += " AND Seq Between @StartPage AND @EndPage";
            //mainsql += @" ORDER BY CreateTime DESC" + @" OFFSET @skip ROWS" + @" FETCH NEXT @take ROWS ONLY";
            object obj = new
            {
                WaterNo,
                StartPage = itemsPerPage * page + 1,
                EndPage = itemsPerPage * page + itemsPerPage
            };
            var result = dataAccess.Query<V_B_MESSAGE>(mainsql, obj);
            object countobj = new
            {
                WaterNo
            };
            var counter = dataAccess.Query<CounterModel>(countsql, countobj);
            return (result, counter.First().Counter);
        }

        public List<F_B_CHART1> ListedChart1(string WaterNo, string ChartTpye, DateTime StartTime, DateTime EndTime)
        {
            string mainsql = @"SELECT * FROM [dbo].[F_B_CHART1]('7D762461969','pin','2022/4/4 00:00:00','2022/4/4 23:00:00')";

            //object obj = new
            //{
            //    WaterNo = "7D762461969",
            //    ChartTpye,
            //    StartTimes = StartTime.ToString("yyyy/MM/dd HH:mm:ss"),
            //    EndTimes = EndTime.ToString("yyyy/MM/dd HH:mm:ss")
            //};
            var result = dataAccess.Query<F_B_CHART1>(mainsql);
            return result;
        }

        public B_NOTE GetB_NOTEbyWaterNoAndDate(string WaterNo, DateTime date)
        {
            string mainsql = @"Select * From [dbo].[B_NOTE] Where WATER_NO = @WaterNo And A_DATE = @date";
            object obj = new
            {
                WaterNo,
                date
            };
            var result = dataAccess.Query<B_NOTE>(mainsql, obj).ToList().FirstOrDefault();
            return result;
        }

        public List<B_NOTE_HOUR> ListedB_NOTE_HOURBySN(int SN)
        {
            string mainsql = @"Select * From [dbo].[B_NOTE_HOUR] Where B_NODE_SN  = @SN";
            object obj = new
            {
                SN,
            };
            var result = dataAccess.Query<B_NOTE_HOUR>(mainsql, obj).ToList();
            return result;
        }

        public int UpdateNoteHour(int SN, int Hour, string Note)
        {
            string mainsql = @"UPDATE [dbo].[B_NOTE_HOUR]
                               SET [NOTE] = @Note
                               WHERE B_NODE_SN = @SN And A_HOUR = @Hour";
            object obj = new
            {
                Note,
                SN,
                Hour
            };
            return dataAccess.Execute(mainsql, obj);
        }

        /// <summary>
        /// 直接取Table
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Time"></param>
        /// <returns></returns>
        public A_WATERFEE2 GetWaterFee2ByWaterNoAndTime(string WaterNo, string Time)
        {
            string mainsql = @"SELECT TOP (1) *
                             FROM [TWN].[dbo].[A_WATERFEE2] 
                             Where WATERNO = @WaterNo And METERED= @Time";
            object obj = new
            {
                WaterNo,
                Time
            };
            var result = dataAccess.Query<A_WATERFEE2>(mainsql, obj).FirstOrDefault();
            if (result == null)
                return new A_WATERFEE2();
            return result;
        }

        public V_A_WATERFEE GetVWaterFee2ByWaterNoAndTime(string WaterNo, string Time)
        {
            string mainsql = @"SELECT TOP (1) *
                             FROM [TWN].[dbo].[V_A_WATERFEE] 
                             Where WATERNO = @WaterNo";
            object obj = new
            {
                WaterNo,
                Time
            };
            var result = dataAccess.Query<V_A_WATERFEE>(mainsql, obj).FirstOrDefault();
            if (result == null)
                return new V_A_WATERFEE();
            return result;
        }

        public (int? startPeople, int? enderPeople) Listedpeople(DateTime cdate)
        {
            var sdate = cdate.AddMonths(-1);
            int startYear = sdate.Year;
            int startMonth = sdate.Month;
            int? ansStartPeople = null;
            int? ansEnderPeople = null;

            string mainsql = @"SELECT * FROM [J_PEOPLE] WHERE AYEAR=@Year And AMONTH=@Month";
            object sobj = new
            {
                Year = startYear,
                Month = startMonth
            };
            var startPeople = dataAccess.Query<J_PEOPLE>(mainsql, sobj).FirstOrDefault();
            object eobj = new
            {
                Year = cdate.Year,
                Month = cdate.Month
            };
            var enderPeople = dataAccess.Query<J_PEOPLE>(mainsql, eobj).FirstOrDefault();

            if (startPeople != null)
            {
                ansStartPeople = startPeople.PEOPLE;
            }

            if (enderPeople != null)
            {
                ansEnderPeople = enderPeople.PEOPLE;
            }

            return (ansStartPeople, ansEnderPeople);
        }

        public (int? Increase, int? Decrease) GetIncreaseAndDecrease(string WaterNo)
        {
            string mainsql = @"Select * From B_ALART_SETTING Where WATER_NO = @WaterNo And B_ALART_CODE_SN = 50";
            object obj = new
            {
                WaterNo
            };
            var result = dataAccess.Query<B_ALART_SETTING>(mainsql, obj).FirstOrDefault();
            int increase;
            int decrease;
            if (result != null)
            {
                if (!string.IsNullOrEmpty(result.VALUE1))
                {
                    //高明的設計...
                    var vs = result.VALUE1.Split(',');
                    Int32.TryParse(vs[0], out increase);
                    Int32.TryParse(vs[1], out decrease);
                    return (increase, decrease);
                }
            }

            return (null, null);
        }
    }

    public interface IDashboardService
    {
        public DashMainViewModel GetDashMain(string WATER_NO, string ACCOUNT, DateTime THEDAY);
        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate);
        public List<B_NEWSViewModel> ListedNews();
        public List<B_NOTEViewModel> ListedNotes(string WaterNo, DateTime StartTime, DateTime EndTime);
        public (List<V_B_MESSAGE> items, int Count) LitedExceptionItem(string WaterNo, int page, int itemsPerPage);
        public List<F_B_CHART> ListedChart(string WaterNo, DateTime Cdate, string Timesplit);
        public List<F_B_CHART1> ListedChart1(string WaterNo, string ChartTpye, DateTime StartTime, DateTime EndTime);
        public B_NOTE GetB_NOTEbyWaterNoAndDate(string WaterNo, DateTime date);
        public List<B_NOTE_HOUR> ListedB_NOTE_HOURBySN(int SN);
        public int UpdateNoteHour(int SN, int Hour, string Note);
        public A_WATERFEE2 GetWaterFee2ByWaterNoAndTime(string WaterNo, string Time);
        public (int? startPeople, int? enderPeople) Listedpeople(DateTime cdate);
        public (int? Increase, int? Decrease) GetIncreaseAndDecrease(string WaterNo);
        public V_A_WATERFEE GetVWaterFee2ByWaterNoAndTime(string WaterNo, string Time);
    }
}
