using Dapper;
using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
using NLog;
using NLog.Extensions.Logging;
using SqlData;
using System.Globalization;
using TWNPPublic.Models.Entity;
using TWNPPublic.Models.SqlFunctions;
using TWNPPublic.ViewModels.Dashboard;

namespace TWNPPublic.Domain.Service
{
    public class DashboardService : IDashboardService
    {
        private readonly IDapperDataAccess dataAccess;
        private readonly IHttpClientFactory httpClientFactory;
        private readonly IConfiguration configuration;
        private Logger logger = LogManager.GetCurrentClassLogger();
        public DashboardService(IDapperDataAccess dataAccess, IHttpClientFactory HttpClientFactory, IConfiguration configuration)
        {
            NLog.LogManager.Configuration = new NLogLoggingConfiguration(configuration.GetSection("NLog"));
            this.configuration = configuration;
            this.httpClientFactory = HttpClientFactory;
            this.dataAccess = dataAccess;
        }

        public DashMainViewModel GetDashMain(string WaterNo, string Account, DateTime dayText)
        {
            string mainsql = @"select * From dbo.F_B_HOME(@WaterNo,@Account,@Theday)";
            string Theday = dayText.ToString("yyyy/MM/dd");
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

        /// <summary>
        /// 更新 BNoteHour 資料
        /// </summary>
        /// <param name="SN"></param>
        /// <param name="Hour"></param>
        /// <param name="Note"></param>
        /// <returns></returns>
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
        /// 更新或新增  BNoteHour 資料
        /// </summary>
        /// <param name="SN"></param>
        /// <param name="Hour"></param>
        /// <param name="Note"></param>
        /// <returns></returns>
        public int UpdateOrInsertNoteHour(int SN, int Hour, string Note)
        {
            string mainsql = @"Update [dbo].[B_NOTE_HOUR] SET [NOTE] = @Note WHERE B_NODE_SN = @SN And A_HOUR = @Hour
                                IF @@ROWCOUNT = 0
                                    INSERT INTO [dbo].[B_NOTE_HOUR]([B_NODE_SN]
                                                                   ,[A_HOUR]
                                                                   ,[AMOUNT]
                                                                   ,[APERCENT]
                                                                   ,[NOTE]) VALUES (@SN,@Hour,0,0,@Note)";
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

        //AP主機網址/TWN_Transfer/WebService/OracleForTWN_WATERNO.ashx?Table=V_A_WATERFEE&WATERNO=7D76026501K


        public async Task<V_A_WATERFEE?> GetVWaterFee2ByWaterNoAndTime(string WaterNo, DateTime cTime)
        {
            var httpClient = httpClientFactory.CreateClient();
            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();
            string F1 = "T" + cTime.ToString("yyyMM", culture);
            string F2 = WaterNo;

            try
            {
                var responseMessage = await httpClient.GetAsync($"https://swns.water.gov.tw/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=67&key=57D22AF765176213&F1={F1}&F2={F2}");
                if (responseMessage.IsSuccessStatusCode)
                {
                    string responseBody = await responseMessage.Content.ReadAsStringAsync();
                    var root = JsonConvert.DeserializeObject<Root>(responseBody);
                    if (root != null)
                        return root.DataRoot.DataLoop.Data;
                    return null;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                return null;
            }
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

        public (float? Increase, float? Decrease) GetIncreaseAndDecrease(string WaterNo)
        {
            string mainsql = @"Select * From B_ALART_SETTING Where WATER_NO = @WaterNo And B_ALART_CODE_SN = 50";
            object obj = new
            {
                WaterNo
            };
            var result = dataAccess.Query<B_ALART_SETTING>(mainsql, obj).FirstOrDefault();
            float increase;
            float decrease;
            if (result != null)
            {
                if (!string.IsNullOrEmpty(result.VALUE1))
                {
                    //高明的設計...
                    var vs = result.VALUE1.Split(',');
                    float.TryParse(vs[0], out increase);
                    float.TryParse(vs[1], out decrease);
                    return (increase, decrease);
                }
            }

            return (null, null);
        }

        public A_WATERFEE_BILLDATE GetA_WATERFEE_BILLDATE(string WaterNo)
        {
            string mainsql = @"SELECT Top(1) [STQTY] FROM [TWN].[dbo].[A_WATERFEE] where WATERNO = @WaterNo Order by BILLDATE ";
            object obj = new
            {
                WaterNo
            };
            return dataAccess.Query<A_WATERFEE_BILLDATE>(mainsql, obj).FirstOrDefault();
        }

        /// <summary>
        /// 給水號取地址
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public string GetAddressByWaterNos(string WaterNo)
        {
            string mainsql = @"SELECT TOP (1) ADDRESS_DAES FROM [V_A_WATERFEE] Where WATERNO = @WaterNO";
            object obj = new
            {
                WaterNo
            };
            if (dataAccess.Query<Addresses>(mainsql, obj).FirstOrDefault() == null)
                return "";
            return dataAccess.Query<Addresses>(mainsql, obj).FirstOrDefault().ADDRESS_DAES;
        }

        public int InsertBNote(string WaterNo, string PROPERTY_NO, string NOTE, DateTime ADate)
        {
            string mainsql = @"INSERT INTO [dbo].[B_NOTE]
                                       ([WATER_NO]
                                       ,[PROPERTY_NO]
                                       ,[NOTE]
                                       ,[INP_DATE]
                                       ,[A_DATE])
                                 OUTPUT INSERTED.B_NOTE_SN
                                 VALUES
                                       (@WATER_NO
                                       ,@PROPERTY_NO
                                       ,@NOTE
                                       ,@INP_DATE
                                       ,@A_DATE)";
            object obj = new
            {
                WATER_NO = WaterNo,
                PROPERTY_NO = "1",
                NOTE = "事件",
                INP_DATE = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                A_DATE = ADate.ToString("yyyy-MM-dd")
            };

            return dataAccess.Query<B_Note_ReuturnSN>(mainsql, obj).First().B_NOTE_SN;
        }

        public List<A_PH_METER_RECORD_LIST>? LitedPhMeterRecordList(DateTime QueryTime, string WaterNo)
        {
            string FilePathTemp = configuration["MeterRecordSqllite"];
            //string FilePathTemp = "D:\\WEB\\DataTransferWeb\\UploadFile\\A_PH_METER_RECORD_LIST\\{0}.sqlite";
            string FilePath = string.Format(FilePathTemp, QueryTime.ToString("yyyy_MM_dd"));

            if (!File.Exists(FilePath))
            {
                return null;
            }

            string mainsql = @"Select Distinct * 
                                From A_PH_METER_RECORD_LIST 
                                Where 1=1 And @et > REC_DATE_TIME And REC_DATE_TIME >= @st And WATER_NO = @WaterNo
                                Order by REC_DATE_TIME asc";

            var start = new DateTime(QueryTime.Year, QueryTime.Month, QueryTime.Day);
            var end = new DateTime(QueryTime.Year, QueryTime.Month, QueryTime.Day + 1);

            string sqliteconn = "Data Source= " + FilePath;
            using (var connection = new SqliteConnection(sqliteconn))
            {
                //logger.Debug(sqliteconn + mainsql);
                var result = connection.Query<A_PH_METER_RECORD_LIST>(mainsql, new { st = start, et = end, WaterNo }).ToList();

                //找前一天最後一筆
                string FilePathYesterday = string.Format(FilePathTemp, QueryTime.ToString("yyyy_MM_dd"));

                float? yesterdayAoumt = null;

                if (File.Exists(FilePathYesterday))
                {
                    var yesterdaystart = start.AddDays(-1);
                    var yesterdaysend = end.AddDays(-1);

                    var yesterdayresult = connection.Query<A_PH_METER_RECORD_LIST>(mainsql, new { st = yesterdaystart, et = yesterdaysend, WaterNo }).ToList();

                    yesterdayAoumt = yesterdayresult.Last().AMOUNT;
                }

                var counter = result.Count;
                float?[] miner = new float?[24];

                if(yesterdayAoumt != null)
                {
                    miner[0] = result[0].AMOUNT - yesterdayAoumt.Value;
                }

                if (counter > 1)
                {
                    for (int i = 1; i < counter; i++)
                    {
                        miner[i] = result[i].AMOUNT - result[i - 1].AMOUNT;
                    }

                    for (int i = 0; i < miner.Length; i++)
                    {
                        result[i].AMOUNT = miner[i];
                    }
                }


                return result;
            }
        }
    }

    public interface IDashboardService
    {
        //public Tuple<string, int> TestSqlite(DateTime QueryTime, string WaterNo);
        public DashMainViewModel GetDashMain(string WATER_NO, string ACCOUNT, DateTime THEDAY);
        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate);
        public List<B_NEWSViewModel> ListedNews();
        public List<B_NOTEViewModel> ListedNotes(string WaterNo, DateTime StartTime, DateTime EndTime);
        public (List<V_B_MESSAGE> items, int Count) LitedExceptionItem(string WaterNo, int page, int itemsPerPage);
        public List<F_B_CHART> ListedChart(string WaterNo, DateTime Cdate, string Timesplit);
        public List<F_B_CHART1> ListedChart1(string WaterNo, string ChartTpye, DateTime StartTime, DateTime EndTime);
        public B_NOTE GetB_NOTEbyWaterNoAndDate(string WaterNo, DateTime date);
        public List<B_NOTE_HOUR> ListedB_NOTE_HOURBySN(int SN);
        public List<A_PH_METER_RECORD_LIST> LitedPhMeterRecordList(DateTime QueryTime, string WaterNo);

        /// <summary>
        /// 更新 BNoteHour 資料
        /// </summary>
        /// <param name="SN"></param>
        /// <param name="Hour"></param>
        /// <param name="Note"></param>
        /// <returns></returns>
        public int UpdateNoteHour(int SN, int Hour, string Note);

        /// <summary>
        /// 新增或更新 BNoteHour
        /// </summary>
        /// <param name="SN"></param>
        /// <param name="Hour"></param>
        /// <param name="Note"></param>
        /// <returns></returns>
        public int UpdateOrInsertNoteHour(int SN, int Hour, string Note);

        /// <summary>
        /// 當NOTE空白時新增NOTE
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="PROPERTY_NO"></param>
        /// <param name="NOTE"></param>
        /// <param name="ADate"></param>
        /// <returns></returns>
        public int InsertBNote(string WaterNo, string PROPERTY_NO, string NOTE, DateTime ADate);
        public A_WATERFEE2 GetWaterFee2ByWaterNoAndTime(string WaterNo, string Time);
        public (int? startPeople, int? enderPeople) Listedpeople(DateTime cdate);
        public (float? Increase, float? Decrease) GetIncreaseAndDecrease(string WaterNo);
        public Task<V_A_WATERFEE?> GetVWaterFee2ByWaterNoAndTime(string WaterNo, DateTime CTime);
        public A_WATERFEE_BILLDATE GetA_WATERFEE_BILLDATE(string WaterNo);
        public string GetAddressByWaterNos(string WaterNo);
    }
}
