using Dapper;
using Microsoft.Data.Sqlite;
using Newtonsoft.Json;
using NLog;
using NLog.Extensions.Logging;
using SqlData;
using System;
using System.Globalization;
using TWNPPublic.Common.Extension;
using TWNPPublic.Common.Security;
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
        private readonly IAspNetUser _aspNetUser;
        private Logger logger = LogManager.GetCurrentClassLogger();
        public DashboardService(
            IDapperDataAccess dataAccess,
            IHttpClientFactory HttpClientFactory,
            IConfiguration configuration,
            IAspNetUser aspNetUser)
        {
            NLog.LogManager.Configuration = new NLogLoggingConfiguration(configuration.GetSection("NLog"));
            this.configuration = configuration;
            this._aspNetUser = aspNetUser;
            this.httpClientFactory = HttpClientFactory;
            this.dataAccess = dataAccess;
            this.dataAccess.SetHttpContextAccessor(aspNetUser.Name.ToString(), aspNetUser.ClientIP.ToString());
        }

        /// <summary>
        /// 取得 F_B_HOME
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Account"></param>
        /// <param name="dayText"></param>
        /// <returns></returns>
        public DashMainViewModel GetDashMain(string WaterNo, string Account, DateTime dayText)
        {
            string mainsql = @"select * From dbo.[F_B_HOME](@WaterNo,@Account,@Theday)";
            string Theday = dayText.ToString("yyyy/MM/dd");
            object obj = new { Account, WaterNo, Theday };
            return dataAccess.Query<DashMainViewModel>(mainsql, obj).FirstOrDefault();
        }

        /// <summary>
        /// 取得 F_B_HOME_SN
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="AccountSn"></param>
        /// <param name="dayText"></param>
        /// <returns></returns>
        public DashMainViewModel GetDashMain2(string WaterNo, int AccountSn, DateTime dayText)
        {
            string mainsql = @"select * From dbo.F_B_HOME_SN(@WaterNo,@AccountSn,@Theday)";
            string Theday = dayText.ToString("yyyy/MM/dd");
            object obj = new { AccountSn, WaterNo, Theday };
            return dataAccess.Query<DashMainViewModel>(mainsql, obj).FirstOrDefault();
        }

        /// <summary>
        /// 取得 F_B_CHART Week 
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate)
        {
            string mainsql = @"Select * From [dbo].[F_B_CHART](@WaterNo,'WEEK',@Cdate) Order by X";
            object obj = new { WaterNo, Cdate };
            return dataAccess.Query<DashMainWaterUseSearchViewModel>(mainsql, obj);
        }

        /// <summary>
        /// 取得 F_B_CHART 自帶參數
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Cdate"></param>
        /// <param name="Timesplit"></param>
        /// <returns></returns>
        public List<F_B_CHART> ListedChart(string WaterNo, DateTime Cdate, string Timesplit)
        {
            string mainsql = @"Select * From [dbo].[F_B_CHART](@WaterNo,@Timesplit,@Cdate) Order by X";
            object obj = new { WaterNo, Cdate, Timesplit };
            var result = dataAccess.Query<F_B_CHART>(mainsql, obj);
            return result;
        }

        /// <summary>
        /// 取得 F_B_CHART 自帶參數
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Cdate"></param>
        /// <param name="Timesplit"></param>
        /// <param name="Type"></param>
        /// <returns></returns>
        public List<F_B_CHART> ListedChart(string WaterNo, DateTime Cdate, string Timesplit,string Type)
        {
            string mainsql = @"Select * From [dbo].[F_B_CHART](@WaterNo,@Timesplit,@Cdate,@Type) Order by X";
            object obj = new { WaterNo, Cdate, Timesplit, Type};
            var result = dataAccess.Query<F_B_CHART>(mainsql, obj);
            return result;
        }

        public List<B_NEWSViewModel> ListedNews()
        {
            string mainsql = @"SELECT * FROM B_NEWS WHERE VALID=1 And INP_DATE > @INPDATE Order by INP_DATE desc";
            //string mainsql = @"SELECT TOP 5 * FROM B_NEWS WHERE VALID=1";
            return dataAccess.Query<B_NEWSViewModel>(mainsql, new { INPDATE = DateTime.Now.AddDays(-3).ToString("yyyy/MM/dd") });
        }

        /// <summary>
        /// 給水號與時間取 B_NOTE 
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="StartTime"></param>
        /// <param name="EndTime"></param>
        /// <returns></returns>
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

        /// <summary>
        /// 取F_B_CHART1
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="ChartTpye"></param>
        /// <param name="StartTime"></param>
        /// <param name="EndTime"></param>
        /// <returns></returns>
        public List<F_B_CHART1> ListedChart1(string WaterNo, string ChartType, DateTime StartTime, DateTime EndTime)
        {
            string mainsql = @"SELECT * FROM [dbo].[F_B_CHART1](@WaterNo, @pin, @StartTime, @EndTime)";
            object obj = new
            {
                WaterNo,
                pin = ChartType,
                StartTime = StartTime.Date,
                EndTime = EndTime
            };

            var result = dataAccess.Query<F_B_CHART1>(mainsql, obj);
 
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

            if (Note == null)
            {
                Note = String.Empty;
            }

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
                //var responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=67&key=57D22AF765176213&F1={F1}&F2={F2}");
                //var responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/OracleForTWN_WATERNO.ashx?Table={F1}&WATERNO={F2}");

                HttpResponseMessage responseMessage = new HttpResponseMessage(); // 預先初始化                                                                // 
                string environment = configuration["Environment"];
                if ( environment == "Development")
                {
                    responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=67&key=57D22AF765176213&F1={F1}&F2={F2}");
                }
                else{
                    responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/OracleForTWN_WATERNO.ashx?Table={F1}&WATERNO={F2}");
                }

                if (responseMessage.IsSuccessStatusCode)
                {
                    string responseBody = await responseMessage.Content.ReadAsStringAsync();
                    var root = JsonConvert.DeserializeObject<DataLoop>(responseBody);
                    if (root != null)
                    {
                        if( _aspNetUser.Name == "7D767220354" && WaterNo == "7D767190014")
                        {
                            //root.DataRoot.DataLoop.Data.ADDRESS_DAES = "測試資料";
                            //root.DataRoot.DataLoop.Data.NAME_DAES = "測試資料";
                            //root.DataRoot.DataLoop.Data.WATERNO = "7D767220354";
                            root.Data[0].ADDRESS_DAES = "測試資料";
                            root.Data[0].NAME_DAES = "測試資料";
                            root.Data[0].WATERNO = "7D767220354";
                        }
                        else if( _aspNetUser.Name == "7D760002010" && WaterNo == "7D760003007")
                        {
                            //root.DataRoot.DataLoop.Data.ADDRESS_DAES = "測試資料";
                            //root.DataRoot.DataLoop.Data.NAME_DAES = "測試資料";
                            //root.DataRoot.DataLoop.Data.WATERNO = "7D760002010";
                            root.Data[0].ADDRESS_DAES = "測試資料";
                            root.Data[0].NAME_DAES = "測試資料";
                            root.Data[0].WATERNO = "7D760002010";
                        }
                        else
                        {
                            ////root.DataRoot.DataLoop.Data.ADDRESS_DAES = root.DataRoot.DataLoop.Data.ADDRESS.MYSQL_AESDecrypt(); ;
                            ////root.DataRoot.DataLoop.Data.NAME_DAES = root.DataRoot.DataLoop.Data.NAME.MYSQL_AESDecrypt();

                            //root.Data[0].ADDRESS_DAES = root.Data[0].ADDRESS.MYSQL_AESDecrypt(); ;
                            //root.Data[0].NAME_DAES = root.Data[0].NAME.MYSQL_AESDecrypt();

                            if (root != null && root.Data != null && root.Data.Count > 0)
                            {
                                var first = root.Data[0];

                                // 若 ADDRESS 或 NAME 有可能是 null，也建議加上 null 檢查
                                first.ADDRESS_DAES = first.ADDRESS?.MYSQL_AESDecrypt() ?? "";
                                first.NAME_DAES = first.NAME?.MYSQL_AESDecrypt() ?? "";
                            }
                        }
                        
                        return (root?.Data != null && root.Data.Count > 0) ? root.Data[0] : null;
                    }

                    return null;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e)
            {
                logger.Debug("e.Message-SN:67" + e.Message);
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

        public (string Lat, string Lon) GetLatLotByWaterNos(string WaterNo)
        {
            string mainsql = @"SELECT TOP (1) LAT,LON FROM [V_A_WATERFEE]  Where WATERNO = @WaterNO";
            object obj = new
            {
                WaterNo
            };
            var result = dataAccess.Query<Location>(mainsql, obj).FirstOrDefault();
            if (result == null)
                return ("", "");
            else
            {
                return (Lat: result.LAT, Lon: result.LON);
            }
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

        public async Task<List<A_PH_METER_RECORD_LIST>?> LitedPhMeterRecordListNew3(DateTime StartTime, DateTime EnderTime, string WaterNo)
        {
            string qt1 = StartTime.ToString("yyyy-MM-dd 00:00:00");
            string qt2 = EnderTime.ToString("yyyy-MM-dd 23:59:59");
            string mainsql = @"SELECT *
                               FROM A_PH_METER_RECORD_LIST
                               WHERE WATER_NO = @WaterNo AND REC_DATE_TIME >=@StartTime AND REC_DATE_TIME <=@EndTime";
            object obj = new
            {
                WaterNo,
                StartTime = qt1,
                EndTime = qt2
            };

            return (await this.dataAccess.QueryAsync<A_PH_METER_RECORD_LIST>(mainsql, obj).ConfigureAwait(false)).ToList();

            //var result = await this.dataAccess.QueryAsync<A_PH_METER_RECORD_LIST>(mainsql, obj).ConfigureAwait(false);
            //return result.ToList();
        }

        public async Task<List<A_PH_METER_RECORD_LIST>?> LitedPhMeterRecordListNew2(DateTime StartTime, DateTime EnderTime, string WaterNo)
        {
            string qt1 = StartTime.ToString("yyyy-MM-dd");
            string qt2 = EnderTime.ToString("yyyy-MM-dd");
            // 這裡要改成從API拿
            var httpClient = httpClientFactory.CreateClient();
            //var responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=232&key=57FC3CE441543E32&F1={WaterNo}&F2={qt1}&F3={qt2}");
            //var responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/SqliteForTWNP_AMOUNT.ashx?WATER_NO={WaterNo}&START_DATE={qt1}&END_DATE={qt2}");

            HttpResponseMessage responseMessage = new HttpResponseMessage(); // 預先初始化                                                                // 
            string environment = configuration["Environment"];
            if (environment == "Development")
            {
                responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=232&key=57FC3CE441543E32&F1={WaterNo}&F2={qt1}&F3={qt2}");
            }
            else
            {
                responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/SqliteForTWNP_AMOUNT.ashx?WATER_NO={WaterNo}&START_DATE={qt1}&END_DATE={qt2}");
            }

            try
            {
                
                if (responseMessage.IsSuccessStatusCode)
                {
                    string responseBody = await responseMessage.Content.ReadAsStringAsync();
                    var root = JsonConvert.DeserializeObject<PhMeterRecordRoot2>(responseBody);
                    if (root != null)
                    {
                        return root.Data;
                    }

                    return null;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e) // 不知道資料多髒全部 Catch 住..
            {
                logger.Debug("e.Message-SN:232" + e.Message);
                return new List<A_PH_METER_RECORD_LIST>();
            }

        }

        public async Task<List<A_PH_METER_RECORD_LIST>?> LitedPhMeterRecordListNew(DateTime QueryTime, string WaterNo)
        {
            string qt = QueryTime.ToString("yyyy-MM-dd");
            // 這裡要改成從API拿
            var httpClient = httpClientFactory.CreateClient();
            //var responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=108&key=D4B9B60C4CF1434E&F1={WaterNo}&F2={qt}");
            //var responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/SqliteForTWNP.ashx?WaterNo={WaterNo}&QueryTime={qt}");

            HttpResponseMessage responseMessage = new HttpResponseMessage(); // 預先初始化                                                                // 
            string environment = configuration["Environment"];
            if (environment == "Development")
            {
                responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=108&key=D4B9B60C4CF1434E&F1={WaterNo}&F2={qt}");
            }
            else
            {
                responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/SqliteForTWNP.ashx?WaterNo={WaterNo}&QueryTime={qt}");
            }

            try
            {

                if (responseMessage.IsSuccessStatusCode)
                {
                    string responseBody = await responseMessage.Content.ReadAsStringAsync();
                    var root = JsonConvert.DeserializeObject<List<A_PH_METER_RECORD_LIST>>(responseBody);
                    if (root != null)
                    {
                        return root;
                    }

                    return null;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e) // 不知道資料多髒全部 Catch 住..
            {
                logger.Debug("e.Message-SN:108" + e.Message);
                return new List<A_PH_METER_RECORD_LIST>();
            }

        }

        public async Task<List<A_PH_METER_RECORD_LIST>?> LitedPhMeterRecordList(DateTime QueryTime, string WaterNo)
        {
            // https://swns.water.gov.tw/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=108&key=D4B9B60C4CF1434E&F1=7D762347523&F2=2022-08-15
            // https://swns.water.gov.tw/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=108&key=D4B9B60C4CF1434E&F1=XXX&F2=XXX
            string qt = QueryTime.ToString("yyyy-MM-dd");
            // 這裡要改成從API拿
            var httpClient = httpClientFactory.CreateClient();
            //var responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=108&key=D4B9B60C4CF1434E&F1={WaterNo}&F2={qt}");
            //var responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/SqliteForTWNP.ashx?WaterNo={WaterNo}&QueryTime={qt}");

            HttpResponseMessage responseMessage = new HttpResponseMessage(); // 預先初始化                                                                // 
            string environment = configuration["Environment"];
            if (environment == "Development")
            {
                responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=108&key=D4B9B60C4CF1434E&F1={WaterNo}&F2={qt}");
            }
            else
            {
                responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/SqliteForTWNP.ashx?WaterNo={WaterNo}&QueryTime={qt}");
            }

            try
            {
                // 拿前一的最後一筆來相減(邏輯顛倒)，所有原始會有 25 筆，輸出資料時會pop最後一筆 輸出24筆資料
                if (responseMessage.IsSuccessStatusCode)
                {
                    string responseBody = await responseMessage.Content.ReadAsStringAsync();
                    var root = JsonConvert.DeserializeObject<List<A_PH_METER_RECORD_LIST>>(responseBody);
                    if (root != null)
                    {
                        List<A_PH_METER_RECORD_LIST> TimeSerailList = new List<A_PH_METER_RECORD_LIST>();

                        for (var i = QueryTime.Date.AddHours(-1); i < QueryTime.Date.AddDays(1).AddHours(1); i = i.AddHours(1))
                        {
                            var getUseFulData = root.FirstOrDefault(c => c.REC_DATE_TIME == i);
                            if (getUseFulData != null)
                            {
                                //區分業務版與民眾版的小數點規則...
                                if (_aspNetUser.UserId == 0)
                                {
                                    //getUseFulData.AMOUNTO = Math.Round(getUseFulData.AMOUNT.Value, 2);
                                    getUseFulData.AMOUNTO = Math.Floor(getUseFulData.AMOUNT.Value * 100) / 100;
                                }
                                else
                                {
                                    //getUseFulData.AMOUNTO = Math.Truncate(getUseFulData.AMOUNT.Value);
                                    getUseFulData.AMOUNTO = Math.Floor(getUseFulData.AMOUNT.Value);
                                }

                                TimeSerailList.Add(getUseFulData);
                            }
                            else
                            {
                                TimeSerailList.Add(new A_PH_METER_RECORD_LIST { REC_DATE_TIME = i });
                            }
                        }

                        for (int i = 0; i < 24; i++)
                        {
                            if (TimeSerailList[i].AMOUNTO != null && TimeSerailList[i + 1].AMOUNTO != null)
                            {
                                TimeSerailList[i].AMOUNT = TimeSerailList[i + 1].AMOUNTO - TimeSerailList[i].AMOUNTO;
                                TimeSerailList[i].REC_DATE_TIME = TimeSerailList[i + 1].REC_DATE_TIME;
                            }
                            else
                            {
                                TimeSerailList[i].AMOUNT = null;
                                TimeSerailList[i].REC_DATE_TIME = TimeSerailList[i + 1].REC_DATE_TIME;
                            }
                        }

      
                        TimeSerailList.RemoveAt(TimeSerailList.Count() - 1);
                        TimeSerailList.RemoveAt(TimeSerailList.Count() - 1);


                        return TimeSerailList;
                    }

                    return null;
                }
                else
                {
                    return null;
                }
            }
            catch (Exception e) // 不知道資料多髒全部 Catch 住..
            {
                logger.Debug("e.Message-SN:108" + e.Message);
                return new List<A_PH_METER_RECORD_LIST>();
            }

            #region 這裡都沒用，但是留下來

            //string FilePathTemp = configuration["MeterRecordSqllite"];
            ////string FilePathTemp = "D:\\WEB\\DataTransferWeb\\UploadFile\\A_PH_METER_RECORD_LIST\\{0}.sqlite";
            //string FilePath = string.Format(FilePathTemp, QueryTime.ToString("yyyy_MM_dd"));

            //if (!File.Exists(FilePath))
            //{
            //    return null;
            //}

            //string mainsql = @"Select Distinct * 
            //                    From A_PH_METER_RECORD_LIST 
            //                    Where 1=1 And @et > REC_DATE_TIME And REC_DATE_TIME >= @st And WATER_NO = @WaterNo
            //                    Order by REC_DATE_TIME asc";

            //var start = new DateTime(QueryTime.Year, QueryTime.Month, QueryTime.Day);
            //var end = new DateTime(QueryTime.Year, QueryTime.Month, QueryTime.Day + 1);

            //string sqliteconn = "Data Source= " + FilePath;
            //using (var connection = new SqliteConnection(sqliteconn))
            //{
            //    //logger.Debug(sqliteconn + mainsql);
            //    var result = connection.Query<A_PH_METER_RECORD_LIST>(mainsql, new { st = start, et = end, WaterNo }).ToList();

            //    //找前一天最後一筆
            //    string FilePathYesterday = string.Format(FilePathTemp, QueryTime.ToString("yyyy_MM_dd"));

            //    float? yesterdayAoumt = null;

            //    if (File.Exists(FilePathYesterday))
            //    {
            //        var yesterdaystart = start.AddDays(-1);
            //        var yesterdaysend = end.AddDays(-1);

            //        var yesterdayresult = connection.Query<A_PH_METER_RECORD_LIST>(mainsql, new { st = yesterdaystart, et = yesterdaysend, WaterNo }).ToList();

            //        yesterdayAoumt = yesterdayresult.Last().AMOUNT;
            //    }

            //    var counter = result.Count;
            //    float?[] miner = new float?[24];

            //    if(yesterdayAoumt != null)
            //    {
            //        miner[0] = result[0].AMOUNT - yesterdayAoumt.Value;
            //    }

            //    if (counter > 1)
            //    {
            //        for (int i = 1; i < counter; i++)
            //        {
            //            miner[i] = result[i].AMOUNT - result[i - 1].AMOUNT;
            //        }

            //        for (int i = 0; i < miner.Length; i++)
            //        {
            //            result[i].AMOUNT = miner[i];
            //        }
            //    }


            //    return result;
            //}

            #endregion
        }


        /// <summary>
        /// 使用SN取得使用者資料
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public b_ACCOUNT? GetAccountBySN(int Id)
        {
            string mainsql = "Select * From B_ACCOUNT Where B_ACCOUNT_SN = @Id";
            object obj = new { Id };
            return this.dataAccess.Query<b_ACCOUNT>(mainsql, obj).FirstOrDefault();
        }
        /// <summary>
        /// 使用SN取得使用者資料
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public async Task<b_ACCOUNT>? GetAccountByWaterNo(string WaterNo)
        {
            string mainsql = "Select Top 1 * From B_ACCOUNT Where B_ACCOUNT = @WaterNo And EN_DATE IS NULL Order by B_ACCOUNT_SN DESC";
            object obj = new { WaterNo };
            var result = await this.dataAccess.QueryAsync<b_ACCOUNT>(mainsql, obj).ConfigureAwait(false);
            return result.FirstOrDefault();
        }
        /// <summary>
        /// 更新使用者資料
        /// </summary>
        /// <param name="model">本身不會使用帳號進行查詢或更新帳號</param>
        /// <param name="SN">用SN更新</param>
        /// <returns></returns>
        public int UpdateAccountInfo(UpdatePwVm model, int SN)
        {
            string hashedPassword = PasswordHashUtil.HashPassword(model.PasswordNew2);

            string mainsql = @"Update B_ACCOUNT
                               SET APWD = @Pwd, INITIAL_LOGIN = @Initial_login
                               Where B_ACCOUNT_SN = @SN";
            object obj = new
            {
                Pwd = hashedPassword,
                SN = SN,
                Initial_login = 1,
                //Email = model.Email,
                //CellPhone = model.PhoneNumber,

            };

            //if (model.WaterNO != null)
            //{

            //    string deleteWaterNo5sql = @"Delete 
            //                              From B_ACCOUNT_WATER_NO
            //                              Where B_ACCOUNT_SN = @SN";
            //    object deleteobj = new
            //    {
            //        SN = SN
            //    };
            //    this.dapperDataAccess.Execute(deleteWaterNo5sql, deleteobj);

            //    foreach (var item in model.WaterNO)
            //    {
            //        string insertWaterNO5sql = @"Insert Into B_ACCOUNT_WATER_NO
            //                                       (B_ACCOUNT_SN,WATER_NO,VALID)
            //                                 VALUES
            //                                       (@SN,@WaterNo,@Valid)";
            //        object waterobj = new
            //        {
            //            SN = SN,
            //            WaterNo = item,
            //            Valid = 1
            //        };
            //        this.dapperDataAccess.Execute(insertWaterNO5sql, waterobj);
            //    }
            //}

            int result = this.dataAccess.Execute(mainsql, obj);
            if (result > 0)
            {
                var accountInfo = GetAccountBySN(SN);
                if (accountInfo != null)
                {
                    SyncExternalPassword(accountInfo.B_ACCOUNT, hashedPassword);
                }
            }

            return result;
        }

        private void SyncExternalPassword(string account, string hashedPassword)
        {
            bool isGroupedAccount = IsSttnGrpIdExist(account) != null;
            if (isGroupedAccount)
            {
                UpdateWmmmdbSttngrpPassword(account, hashedPassword);
            }
            else
            {
                UpdateWmmmdbImCmuserPassword(account, hashedPassword);
            }
        }

        private A_PH_METER_STTNGRP? IsSttnGrpIdExist(string sttnGrpId)
        {
            string mainsql = @"SELECT 1
                       FROM A_PH_METER_STTNGRP
                       WHERE sttn_grp_id = @SttnGrpId";

            object obj = new { SttnGrpId = sttnGrpId };
            return dataAccess.Query<A_PH_METER_STTNGRP>(mainsql, obj).FirstOrDefault();
        }

        private int UpdateWmmmdbSttngrpPassword(string sttnGrpId, string hashedPassword)
        {
            string mainsql = @"UPDATE WMMMDB.dbo.sttngrp
                           SET login_pwd = @LoginPwd
                         WHERE sttn_grp_id = @SttnGrpId";

            object obj = new
            {
                SttnGrpId = sttnGrpId,
                LoginPwd = hashedPassword
            };

            return dataAccess.Execute(mainsql, obj);
        }

        private int UpdateWmmmdbImCmuserPassword(string account, string hashedPassword)
        {
            string mainsql = @"UPDATE WMMMDB.dbo.im_cmuser
                       SET password = @Password
                       WHERE user_id = @Account";

            object obj = new
            {
                Account = account,
                Password = hashedPassword
            };

            return dataAccess.Execute(mainsql, obj);
        }

        /// <summary>
        /// 水號 取得這個使用者下的水號之開始和結束時間
        /// </summary>
        /// <param name="Id"></param>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public B_ACCOUNT_WATER_NO? ListedWaterNOBySN(string WaterNo)
        {
            string mainsql = "Select Top 1 * From B_ACCOUNT Where B_ACCOUNT=@WaterNo And EN_DATE IS NULL Order by B_ACCOUNT_SN DESC";
            object obj = new { WaterNo };
            return this.dataAccess.Query<B_ACCOUNT_WATER_NO>(mainsql, obj).FirstOrDefault();
        }

        /// <summary>
        /// 取F_B_CHART2
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="ChartTpye"></param>
        /// <param name="StartTime"></param>
        /// <param name="EndTime"></param>
        /// <returns></returns>
        public List<F_B_CHART2> ListedChart2(string WaterNo, string ChartType, DateTime StartTime, DateTime EndTime)
        {
            string mainsql = @"SELECT 
                                        CASE WHEN @pin = 'year' THEN CAST(X AS VARCHAR) + '-01-01'  -- 轉換 `X` 為 '2025-01-01'
                                                ELSE X  -- 其他類型維持原本格式
                                            END AS X,
                                            Y
                               FROM [dbo].[F_B_CHART2](@WaterNo, @pin, @StartTime, @EndTime)";
            object obj = new
            {
                WaterNo,
                pin = ChartType,
                StartTime = StartTime,
                EndTime = EndTime
            };

            var result = dataAccess.Query<F_B_CHART2>(mainsql, obj);

            return result;
        }

        /// <summary>
        /// 取得 F_GET_TEL('7D760003007')
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="AccountSn"></param>
        /// <param name="dayText"></param>
        /// <returns></returns>
        public ContactPersonViewModel GetContactPerson(string WaterNo)
        {
            string mainsql = @"select * from F_GET_TEL( @WaterNo )";
            object obj = new { WaterNo  };
            return dataAccess.Query<ContactPersonViewModel>(mainsql, obj).FirstOrDefault();
        }
    }

    public interface IDashboardService
    {
        //public Tuple<string, int> TestSqlite(DateTime QueryTime, string WaterNo);
        /// <summary>
        /// 取儀錶板
        /// </summary>
        /// <param name="WATER_NO"></param>
        /// <param name="ACCOUNT"></param>
        /// <param name="THEDAY"></param>
        /// <returns></returns>
        public DashMainViewModel GetDashMain(string WATER_NO, string ACCOUNT, DateTime THEDAY);
        /// <summary>
        /// 取儀錶板-過戶
        /// </summary>
        /// <param name="WATER_NO"></param>
        /// <param name="ACCOUNT"></param>
        /// <param name="THEDAY"></param>
        /// <returns></returns>
        public DashMainViewModel GetDashMain2(string WATER_NO, int AccountSn, DateTime THEDAY);
        /// <summary>
        /// 取右下角圖
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public List<DashMainWaterUseSearchViewModel> GetDashWaterUse(string WaterNo, DateTime Cdate);
        /// <summary>
        /// 取最新消息
        /// </summary>
        /// <returns></returns>
        public List<B_NEWSViewModel> ListedNews();
        /// <summary>
        /// 取用水記事
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="StartTime"></param>
        /// <param name="EndTime"></param>
        /// <returns></returns>
        public List<B_NOTEViewModel> ListedNotes(string WaterNo, DateTime StartTime, DateTime EndTime);
        /// <summary>
        /// page 警示訊息 沒用到
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="page"></param>
        /// <param name="itemsPerPage"></param>
        /// <returns></returns>
        public (List<V_B_MESSAGE> items, int Count) LitedExceptionItem(string WaterNo, int page, int itemsPerPage);
        /// <summary>
        /// 圖 fn chart
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Cdate"></param>
        /// <param name="Timesplit"></param>
        /// <returns></returns>
        public List<F_B_CHART> ListedChart(string WaterNo, DateTime Cdate, string Timesplit);
        /// <summary>
        /// 圖 fn chart
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Cdate"></param>
        /// <param name="Timesplit"></param>
        /// <param name="Type"></param>
        /// <returns></returns>
        public List<F_B_CHART> ListedChart(string WaterNo, DateTime Cdate, string Timesplit,string Type);
        /// <summary>
        /// 圖 fn chart1
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="ChartTpye"></param>
        /// <param name="StartTime"></param>
        /// <param name="EndTime"></param>
        /// <returns></returns>
        public List<F_B_CHART1?> ListedChart1(string WaterNo, string ChartTpye, DateTime StartTime, DateTime EndTime);
        /// <summary>
        /// 用水記事每小時
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="date"></param>
        /// <returns></returns>
        public B_NOTE GetB_NOTEbyWaterNoAndDate(string WaterNo, DateTime date);
        /// <summary>
        /// 用水記事每筆
        /// </summary>
        /// <param name="SN"></param>
        /// <returns></returns>
        public List<B_NOTE_HOUR> ListedB_NOTE_HOURBySN(int SN);
        /// <summary>
        /// A_PH_METER_RECORD_LIST 查詢資料表前七天內的資料
        /// </summary>
        /// <param name="StartTime"></param>
        /// <param name="EnderTime"></param>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public Task<List<A_PH_METER_RECORD_LIST>?> LitedPhMeterRecordListNew3(DateTime StartTime, DateTime EnderTime, string WaterNo);
        public Task<List<A_PH_METER_RECORD_LIST>?> LitedPhMeterRecordListNew2(DateTime StartTime, DateTime EnderTime, string WaterNo);
        public Task<List<A_PH_METER_RECORD_LIST>?> LitedPhMeterRecordListNew(DateTime QueryTime, string WaterNo);

        public Task<List<A_PH_METER_RECORD_LIST>> LitedPhMeterRecordList(DateTime QueryTime, string WaterNo);
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
        /// <summary>
        /// 取 Db WaterFee2
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Time"></param>
        /// <returns></returns>
        public A_WATERFEE2 GetWaterFee2ByWaterNoAndTime(string WaterNo, string Time);
        /// <summary>
        /// 取觀光人次
        /// </summary>
        /// <param name="cdate"></param>
        /// <returns></returns>
        public (int? startPeople, int? enderPeople) Listedpeople(DateTime cdate);
        /// <summary>
        /// 判斷單數月單或雙數月單
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public (float? Increase, float? Decrease) GetIncreaseAndDecrease(string WaterNo);
        /// <summary>
        /// 取 View_WaterFee
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="CTime"></param>
        /// <returns></returns>
        public Task<V_A_WATERFEE?> GetVWaterFee2ByWaterNoAndTime(string WaterNo, DateTime CTime);
        /// <summary>
        /// 取繳費日期
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public A_WATERFEE_BILLDATE GetA_WATERFEE_BILLDATE(string WaterNo);
        /// <summary>
        /// 取使用者地址
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public string GetAddressByWaterNos(string WaterNo);
        /// <summary>
        /// 取使用者經緯度
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public (string Lat, string Lon) GetLatLotByWaterNos(string WaterNo);
        /// <summary>
        /// 取使用者資料
        /// </summary>
        /// <returns></returns>
        public b_ACCOUNT? GetAccountBySN(int Id);
        /// <summary>
        /// 取使用者資料
        /// </summary>
        /// <returns></returns>
        public Task<b_ACCOUNT>? GetAccountByWaterNo(string WaterNo);
        /// <summary>
        /// 更新使用者資料
        /// </summary>
        /// <param name="model">本身不會使用帳號進行查詢或更新帳號</param>
        /// <param name="SN">用SN更新</param>
        /// <returns></returns>
        public int UpdateAccountInfo(UpdatePwVm model, int SN);

        public B_ACCOUNT_WATER_NO ListedWaterNOBySN(string WaterNo);

        /// <summary>
        /// 圖 fn chart2
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="ChartTpye"></param>
        /// <param name="StartTime"></param>
        /// <param name="EndTime"></param>
        /// <returns></returns>
        public List<F_B_CHART2?> ListedChart2(string WaterNo, string ChartTpye, DateTime StartTime, DateTime EndTime);
        /// <summary>
        /// 取 F_GET_TEL('7D760003007')
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="Time"></param>
        /// <returns></returns>
        public ContactPersonViewModel GetContactPerson(string WaterNo);
    }
}
