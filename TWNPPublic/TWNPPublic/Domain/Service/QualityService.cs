using Newtonsoft.Json;
using NLog;
using NLog.Extensions.Logging;
using SqlData;
using System.Dynamic;
using System.Globalization;
using System.Net;
using System.Net.Http;
using System.Text;
using TWNPPublic.Common.Extension;
using TWNPPublic.Models.Entity;
using TWNPPublic.Models.SqlFunctions;
using TWNPPublic.ViewModels.Dashboard;
using TWNPPublic.ViewModels.Quality;

namespace TWNPPublic.Domain.Service
{
    public class QualityService : IQualityService
    {
        private readonly IDapperDataAccess dapperDataAccess;
        private readonly IAspNetUser aspNetUser;
        private readonly IHttpClientFactory httpClientFactory;
        private readonly IConfiguration configuration;
        private Logger logger = LogManager.GetCurrentClassLogger();

        public QualityService(IDapperDataAccess dapperDataAccess, IAspNetUser aspNetUser, IHttpClientFactory HttpClientFactory, IConfiguration configuration)
        {
            this.dapperDataAccess = dapperDataAccess;
            this.aspNetUser = aspNetUser;
            this.dapperDataAccess.SetHttpContextAccessor(aspNetUser.Name.ToString(), aspNetUser.ClientIP.ToString());
            this.httpClientFactory = HttpClientFactory;
            this.configuration = configuration;
            NLog.LogManager.Configuration = new NLogLoggingConfiguration(configuration.GetSection("NLog"));
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

        public A_PH_METER_RECORD_COVER_LOG CheckOptCondition(DateTime DateTime, string WATER_NO)
        {
            string mainsql = @"SELECT [SN],[ADATE],[WATER_NO],[MESSAGE],[STATUS1],[STATUS2],[INP_DATE] FROM [A_PH_METER_RECORD_COVER_LOG] WHERE ADATE=@Sdate";
            string Sdate = DateTime.ToString("yyyy-MM-dd");
            object obj = new { Sdate, WATER_NO };
            return dapperDataAccess.Query<A_PH_METER_RECORD_COVER_LOG>(mainsql, obj).FirstOrDefault();
        }

        /// <summary>
        /// 呼叫api更新sqlite檔案
        /// </summary>
        /// <param name="DateTime"></param>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public async Task<int> UpdateSQLite(DateTime DateTime, string WaterNo)
        {
            var httpClient = httpClientFactory.CreateClient();
            string qt1 = DateTime.ToString("yyyy-MM-dd");

            HttpResponseMessage responseMessage = new HttpResponseMessage(); // 預先初始化
            string environment = configuration["Environment"];
            if (environment == "Development")
            {
                responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=248&key=0446AC28E94F7257&F1={WaterNo}&F2={qt1}");
            }
            else
            {
                responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/FlowRateSQLite.aspx?WATER_NO={WaterNo}&DATE={qt1}");
            }

            return 1; 
        }

        /// <summary>
        /// 取 資料
        /// </summary>
        /// <param name="SN"></param>
        /// <param name="Hour"></param>
        /// <param name="Note"></param>
        /// <returns></returns>
        public async Task<List<Datum>?> LitedPhMeterRecordApiList(string WaterNo, DateTime DateDay)
        {
            string qt1 = DateDay.ToString("yyyy-MM-dd");
            // 這裡要改成從API拿
            var httpClient = httpClientFactory.CreateClient();

            HttpResponseMessage responseMessage = new HttpResponseMessage(); // 預先初始化                                                                // 
            string environment = configuration["Environment"];
            if (environment == "Development")
            {
                responseMessage = await httpClient.GetAsync($"https://web.water.gov.tw/swns/TWN_Transfer/WebService/WSTransfer.ashx?op=GET&SN=245&key=7E8281B40E35D4B2&F1={WaterNo}&F2={qt1}");
                //// 模擬 API 回傳 JSON
                //string mockJson = @"{
                //            ""ISOK"": true,
                //            ""Message"": """",
                //            ""Data"": {
                //                ""date"": ""2025-07-01"",
                //                ""data"": [
                //                    { ""date"": ""2025-07-01"", ""total_flow"": 481.73767, ""meter_no"": ""111B900657"", ""time"": ""00:00:00"" },
                //                    { ""date"": ""2025-07-01"", ""total_flow"": 481.73828, ""meter_no"": ""111B900657"", ""time"": ""01:00:00"" },
                //                    { ""date"": ""2025-07-01"", ""total_flow"": 481.73828, ""meter_no"": ""111B900657"", ""time"": ""02:00:00"" }
                //                ],
                //                ""water_no"": ""7D760253004""
                //            }
                //        }";

                //// 模擬 HttpResponseMessage
                //responseMessage = new HttpResponseMessage(HttpStatusCode.OK)
                //{
                //    Content = new StringContent(mockJson, Encoding.UTF8, "application/json")
                //};
            }
            else
            {
                responseMessage = await httpClient.GetAsync($"http://10.100.104.158/TWN_TRANSFER/WebService/FlowRate.ashx?WATER_NO={WaterNo}&DATE={qt1}");
            }

            try
            {

                if (responseMessage.IsSuccessStatusCode)
                {
                    string responseBody = await responseMessage.Content.ReadAsStringAsync();
                    var root = JsonConvert.DeserializeObject<Rootobject>(responseBody);
                    if (root != null)
                    {
                        return root.DataContent.data;
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
                logger.Debug("e.Message-SN:245" + e.Message);
                return new List<Datum>();
            }

        }

        public int UpdateAphMeterRecordByWaterNoAndDateTime(string WaterNo, List<A_PH_METER_RECORD_LIST> obj)
        {
            string mainsql = @"
                                IF EXISTS (SELECT 1 FROM [A_PH_METER_RECORD_LIST] 
                                           WHERE WATER_NO = @WATER_NO AND REC_DATE_TIME = @REC_DATE_TIME)
                                BEGIN
                                    UPDATE [A_PH_METER_RECORD_LIST]
                                    SET PROPERTY_NO = @PROPERTY_NO,
                                        AMOUNT = @AMOUNT
                                    WHERE WATER_NO = @WATER_NO AND REC_DATE_TIME = @REC_DATE_TIME;
                                END
                                ELSE
                                BEGIN
                                    INSERT INTO [A_PH_METER_RECORD_LIST]
                                        ([WATER_NO], [PROPERTY_NO], [REC_DATE_TIME], [AMOUNT])
                                    VALUES
                                        (@WATER_NO, @PROPERTY_NO, @REC_DATE_TIME, @AMOUNT);
                                END";

            return dapperDataAccess.ExecuteList(mainsql, obj); ;
        }

    }
    public interface IQualityService
    {
        public QualityChartViewModel GetWaterUseChart(DateTime? StartTime, DateTime? EndTime);
    
        public WaterTypeViewModel QueryWaterTypeData(DateTime StartTime, DateTime EndTime,string WATER_NO);

        public A_PH_METER_RECORD_COVER_LOG CheckOptCondition(DateTime DateTime, string WATER_NO);

        public Task<int> UpdateSQLite( DateTime DateTime, string WaterNo);

        /// <summary>
        /// 用水指針資料回寫
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="DateDay"></param>
        /// <returns></returns>
        public Task<List<Datum>?> LitedPhMeterRecordApiList(string WaterNo, DateTime DateDay);

        public int UpdateAphMeterRecordByWaterNoAndDateTime(string WaterNo, List<A_PH_METER_RECORD_LIST> obj);
    }
}
