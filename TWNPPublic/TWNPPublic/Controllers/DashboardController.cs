using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Web;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models.Entity;
using TWNPPublic.ViewModels.Dashboard;
using static System.Net.Mime.MediaTypeNames;

namespace TWNPPublic.Controllers
{
    [Menu("首頁")]
    public class DashboardController : BasicController
    {

        private readonly IAspNetUser aspNetUser;
        private readonly IDashboardService dashboardService;

        public DashboardController(IAspNetUser aspNetUser, IDashboardService dashboardService)
        {
            this.dashboardService = dashboardService;
            this.aspNetUser = aspNetUser;
        }

        /// <summary>
        /// 首頁
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> Index()
        {
            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();
            ViewBag.CurrentTime = DateTime.Now.ToString("yyy年MM月dd日", culture);
            #region 這個邏輯只是為了澎科大寫的其他都沒用到
            ViewBag.ShowRealMap = false;
            try
            {
                var result = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now.AddYears(-1));
                if (result == null)
                {
                    result = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now.AddYears(-1).AddMonths(-1));
                }

                if (result != null)
                {
                    if (result.NAME_DAES == "國立澎湖科技大學")
                        ViewBag.ShowRealMap = true;
                }
            }
            catch (Exception e)
            {

            }

            #endregion

            return View();
        }

        #region 左上角基本資料

        /// <summary>
        /// 詳細資料
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> Fancybox_detailsTable(DateTime? Cdate, string billType = "none")
        {

            V_A_WATERFEE? CurrentResult = new V_A_WATERFEE();

            if (Cdate == null)
            {
                Cdate = DateTime.Now;
            }


            //不管了 用惰性載入模板 看得懂就看得懂 看不懂我也沒辦法 佛度有緣人

            switch (billType)
            {
                case "single":
                case "double":
                    CurrentResult = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, Cdate.Value);
                    break;

                default:

                    var CurrentResultAsync = dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, Cdate.Value);
                    var result = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, Cdate.Value.AddMonths(-1));

                    CurrentResult = CurrentResultAsync.Result;
                    if (result == null || CurrentResult == null)
                    {

                        if (result != null)
                            CurrentResult = result;

                        billType = "double";

                        if (CurrentResult != null)
                        {
                            var billdate = CurrentResult.BILLDATE;
                            var monthText = billdate.Substring(3, 4);

                            DateTime pdate = DateTime.ParseExact(monthText, "MMdd", null);
                            Cdate = pdate;
                        }
                        else
                        {
                            Cdate = DateTime.Now;
                        }

                    }
                    else
                    {
                        Cdate = DateTime.Now;
                        billType = "single";
                    }

                    break;
            }

            #region 先移除
            //if (result != null)
            //{
            //    double fee = 0, tax = 0;
            //    int basicfee = 0;
            //    if (result.FEE.HasValue)
            //    {
            //        fee = result.FEE.Value;
            //    }
            //    if (result.TAX.HasValue)
            //    {
            //        tax = result.TAX.Value;
            //    }
            //    if (result.BASICFEE.HasValue)
            //    {
            //        basicfee = result.BASICFEE.Value;
            //    }
            //    result.WaterBillSubtotal = fee + tax + basicfee;
            //}
            #endregion

            ViewBag.Type = billType;
            ViewBag.VDetailResult = CurrentResult;

            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();

            List<SelectListItem> selectListItems = new List<SelectListItem>();
            DateTime nowtime = DateTime.Now;

            if (billType == "double")
            {
                DateTime pdate = DateTime.Now;
                if (CurrentResult != null)
                {
                    var billdate = CurrentResult.BILLDATE;
                    var monthText = billdate.Substring(3, 4);
                    pdate = DateTime.ParseExact(monthText, "MMdd", null);
                }

                // 1 3 5 7  9 11 
                // 2 4 6 8 10 12

                if (pdate.Month % 2 == 0)
                {
                    // 偶數帳單
                    // 偶數月
                    // 基數月
                    if (nowtime.Month % 2 == 0)
                    {

                    }
                    else
                    {
                        nowtime = nowtime.AddMonths(-1);
                    }
                }
                else
                {
                    // 基數帳單
                    // 偶數月
                    // 基數月

                    if (nowtime.Month % 2 == 0)
                    {
                        nowtime = nowtime.AddMonths(-1);
                    }
                    else
                    {

                    }
                }

                for (int i = 0; i <= 12; i = i + 2)
                {
                    selectListItems.Add(new SelectListItem
                    {
                        Text = nowtime.AddMonths(0 - i).ToString("yyy年MM月", culture),
                        Value = nowtime.AddMonths(0 - i).ToString("yyyy-MM-dd")
                    });
                }
            }
            else
            {
                for (int i = 0; i < 6; i = i + 1)
                {
                    selectListItems.Add(new SelectListItem
                    {
                        Text = nowtime.AddMonths(0 - i).ToString("yyy年MM月", culture),
                        Value = nowtime.AddMonths(0 - i).ToString("yyyy-MM-dd")
                    });
                }
            }

            ViewBag.CurrentTime = Cdate.Value.ToString("yyy年MM月", culture);

            ViewBag.ddlYear = selectListItems;

            return View();
        }

        /// <summary>
        /// 左上圖表用水分析
        /// </summary>
        /// <returns></returns>
        public IActionResult Fancybox_chart()
        {
            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();
            ViewBag.CurrentTime = DateTime.Now.ToString("yyy年MM月dd日", culture);
            return View();
        }

        /// <summary>
        /// 左上的資訊，用水比較，最新資訊，警示資訊
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> GetDashMainData()
        {
            //當前資料更新時間
            DateTime GetDataDate = DateTime.Now.AddDays(-1);
            //愈查詢的使用者
            string SetUser = "";
            //有水號跟帳號兩種有問題問SA

            if (aspNetUser.UserId == null)
            {
                SetUser = aspNetUser.CurrentWaterNo;
            }
            else
            {
                SetUser = aspNetUser.Name;
            }
            var result = dashboardService.GetDashMain(aspNetUser.CurrentWaterNo, SetUser, GetDataDate);

            //名字是空的話 用帳號先取代
            if (string.IsNullOrEmpty(result.NAME))
            {
                result.NAME = aspNetUser.CurrentWaterNo;
            }

            string billdatetext = "無試算";
            if (!string.IsNullOrEmpty(result.BILLDATE))
            {
                var billdate = DateTime.Parse(result.BILLDATE);
                CultureInfo culture = new CultureInfo("zh-TW");
                culture.DateTimeFormat.Calendar = new TaiwanCalendar();
                billdatetext = billdate.ToString("yyy/MM/dd", culture);
            }

            string NewMeterDateText = "未取得更新時間";

            if (!string.IsNullOrEmpty(result.NEW_METER_DATE))
            {
                var NewMeterDate = DateTime.Parse(result.NEW_METER_DATE);
                CultureInfo culture = new CultureInfo("zh-TW");
                culture.DateTimeFormat.Calendar = new TaiwanCalendar();
                NewMeterDateText = NewMeterDate.ToString("yyy/MM/dd", culture);
            }

            result.BILLDATE = billdatetext;
            result.NEW_METER_DATE = NewMeterDateText;

            //result.LASTMONTH_MONEY = 0;
            return Json(Success(result));
        }

        /// <summary>
        /// 取得 WaterFee2 目前用在 去年同期水費 和 用水情形比較 去年當月
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> GetWaterFee2()
        {
            var result = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now.AddYears(-1));
            if (result == null)
            {
                result = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now.AddYears(-1).AddMonths(-1));
            }

            return Json(Success(new
            {
                result.NAME_DAES,
                result.AREA,
                result.SUBTOTAL,
                result.TOQTY
            }));
        }

        #endregion

        #region 左下角用水記事

        /// <summary>
        /// 用水記事點擊-用戶記事
        /// </summary>
        /// <returns></returns>
        public IActionResult Fancybox_tableChart(DateTime Cdate)
        {
            ViewBag.Cdate = Cdate;
            Dictionary<decimal, B_NOTE_HOUR> TempBNoteHour = new Dictionary<decimal, B_NOTE_HOUR>();

            for (int i = 0; i < 24; i++)
            {
                TempBNoteHour.Add(i, new B_NOTE_HOUR
                {
                    B_NODE_SN = 0,
                    AMOUNT = null,
                    APERCENT = null,
                    A_HOUR = i,
                    NOTE = "",
                });
            }

            var Note = dashboardService.GetB_NOTEbyWaterNoAndDate(aspNetUser.CurrentWaterNo, Cdate);

            if (Note != null)
            {
                var HourNotes = dashboardService.ListedB_NOTE_HOURBySN(Note.B_NOTE_SN);

                foreach (var item in HourNotes)
                {
                    TempBNoteHour[item.A_HOUR] = item;
                }

                ViewBag.HourNotes = TempBNoteHour.Select(c => c.Value).ToList();
                ViewBag.NoteSN = Note.B_NOTE_SN;
            }
            else
            {
                ViewBag.HourNotes = TempBNoteHour.Select(c => c.Value).ToList();
                ViewBag.NoteSN = 0;
            }
            return View();
        }

        /// <summary>
        /// 點擊用戶記事後右邊的圖表
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public async Task<IActionResult> WaterNoteTableChart(DateTime Cdate)
        {
            //回應25筆
            // 2022/11/13 00:00:00 - 2022/11/14 00:00:00
            // 先做 Hash 25 筆

            Dictionary<string, decimal?> dic = new Dictionary<string, decimal?>();
            DateTime StartTime = new DateTime(Cdate.Year, Cdate.Month, Cdate.Day - 1, 23, 0, 0);
            DateTime EnderTime = new DateTime(Cdate.Year, Cdate.Month, Cdate.Day + 1, 0, 0, 0);
            List<decimal?> NewWaterUser = new List<decimal?>();

            try
            {
                for (DateTime i = StartTime; i < EnderTime; i = i.AddHours(1))
                {
                    dic.Add(i.ToString("yyyy/MM/dd HH:mm"), null);
                }

                // 前六天都要取資料庫
                var ts = Cdate.Date - DateTime.Now;
                if (ts.Days >= -6)
                {

                    // var dayresult2 = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, "day".ToUpper()).OrderBy(c => c.X).ToList();
                    // Cdata =     2022/11/13
                    // StartTime = 2022/11/13 00:00:00
                    // EndTime =   2022/11/14 00:00:00
                    // 測試 SELECT * FROM [dbo].[F_B_CHART1]('7D762461969','PIN','2022/4/4 13:00:00','2022/4/6 13:00:00')

                    //var temp = dashboardService.ListedChart1("7D762461969", "PIN", new DateTime(2022, 4, 4), new DateTime(2022, 4, 6));
                    var temp = dashboardService.ListedChart1(aspNetUser.CurrentWaterNo, "PIN", StartTime, EnderTime);
                    //這裡要去重複
                    foreach (var item in dic)
                    {

                        var cell = temp.FirstOrDefault(c => c.X.ToString("yyyy/MM/dd HH:mm") == item.Key);
                        if (cell == null)
                        {
                            dic[item.Key] = null;
                        }
                        else
                        {
                            dic[item.Key] = cell.Y;
                        }
                    }
                }
                else
                {
                    var dayresultTask = dashboardService.LitedPhMeterRecordListNew(Cdate, aspNetUser.CurrentWaterNo);
                    var day2result = await dashboardService.LitedPhMeterRecordListNew(Cdate.AddDays(-1), aspNetUser.CurrentWaterNo);
                    var dayresult = await dayresultTask;

                    if (dayresult == null) return Json(Failed(message: "資料尚未開放"));
                    if (dayresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

                    foreach (var item in dic)
                    {
                        var takeone = dayresult.FirstOrDefault(c => c.REC_DATE_TIME.ToString("yyyy/MM/dd HH:mm") == item.Key);
                        if (takeone != null)
                        {
                            dic[item.Key] = takeone.AMOUNT;
                        }
                    }

                    foreach (var item in dic)
                    {
                        var takeone = day2result.FirstOrDefault(c => c.REC_DATE_TIME.ToString("yyyy/MM/dd HH:mm") == item.Key);
                        if (takeone != null)
                        {
                            dic[item.Key] = takeone.AMOUNT;
                        }
                    }
                }

                //補業務版的洞
                if (aspNetUser.UserId == 0)
                {
                    foreach (var item in dic)
                    {
                        if (item.Value.HasValue)
                        {
                            dic[item.Key] = Math.Floor(item.Value.Value * 100) / 100;
                        }
                    }

                    for (int i = 0; i < 24; i++)
                    {
                        if (dic.ElementAt(i).Value.HasValue && dic.ElementAt(i + 1).Value.HasValue)
                        {
                            NewWaterUser.Add(dic.ElementAt(i + 1).Value.Value - dic.ElementAt(i).Value.Value);
                        }
                        else
                        {
                            NewWaterUser.Add(null);
                        }
                    }

                    dic.Remove(StartTime.ToString("yyyy/MM/dd HH:mm"));

                    object obj = new
                    {
                        X = dic.Select(c => c.Key).ToArray(),
                        Y = NewWaterUser.ToArray(),
                        O = dic.Select(c => c.Value).ToArray()
                    };

                    return Json(Success(obj));
                }
                else
                {
                    foreach (var item in dic)
                    {
                        if (item.Value.HasValue)
                        {
                            dic[item.Key] = Math.Floor(item.Value.Value);
                        }
                    }

                    for (int i = 0; i < 24; i++)
                    {
                        if (dic.ElementAt(i).Value.HasValue && dic.ElementAt(i + 1).Value.HasValue)
                        {
                            NewWaterUser.Add(dic.ElementAt(i + 1).Value.Value - dic.ElementAt(i).Value.Value);
                        }
                        else
                        {
                            NewWaterUser.Add(null);
                        }
                    }

                    dic.Remove(StartTime.ToString("yyyy/MM/dd HH:mm"));

                    object obj = new
                    {
                        X = dic.Select(c => c.Key).ToArray(),
                        Y = NewWaterUser.ToArray(),
                        O = dic.Select(c => c.Value).ToArray()
                    };

                    return Json(Success(obj));
                }

            }
            catch (Exception e)
            {
                return Json(Success());
            }
        }

        /// <summary>
        /// 左下用水記事日曆
        /// </summary>
        /// <param name="start"></param>
        /// <param name="end"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> ListedNotes(DateTime start, DateTime end)
        {
            var result = dashboardService.ListedNotes(aspNetUser.CurrentWaterNo, start, end);
            List<fullcalendar> calendarData = new List<fullcalendar>();
            foreach (var item in result)
            {
                calendarData.Add(new fullcalendar
                {
                    id = item.B_NOTE_SN.ToString(),
                    title = item.NOTE,
                    start = item.A_DATE.Value.ToString("yyyy-MM-dd"),
                    NoteDate = item.A_DATE.Value.ToString("yyyy-MM-dd")
                });
            }

            return Json(Success(calendarData.ToArray()));

        }

        public async Task<IActionResult> UpdateHourNote(int NoteSN, string Hour, string Msg, DateTime ADate)
        {
            //這邊測試機跟正式機的資料庫不同步(已修正)

            if (NoteSN == 0)
            {
                // 改成去 Note 裡面新增一筆資料給 Hour 用
                //return Json(Failed("尚未核許得記事編號"));
                NoteSN = dashboardService.InsertBNote(aspNetUser.CurrentWaterNo, "1", "事件", ADate);
            }

            var result = dashboardService.UpdateOrInsertNoteHour(NoteSN, Convert.ToInt32(Hour), Msg);

            if (result >= 1)
            {
                return Json(Success("更新成功"));
            }
            else
            {
                return Json(Success("更新失敗"));
            }
        }

        #endregion

        #region 右上角異常狀態加最新公告

        /// <summary>
        /// 異常狀態 
        /// </summary>
        /// <param name="page"></param>
        /// <returns></returns>
        public async Task<IActionResult> ListedExceptionState(int? page)
        {
            int pager = (page ?? 1) - 1;
            var reuslt = dashboardService.LitedExceptionItem(aspNetUser.CurrentWaterNo, pager, 3);
            List<ExceptionItem> ExceptionItems = new List<ExceptionItem>();

            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();

            foreach (var item in reuslt.items)
            {
                ExceptionItems.Add(new ExceptionItem
                {
                    Id = item.B_MESSAGE_SN,
                    Message = item.NOTE,
                    Time = item.INP_DATE.ToString("yyy年MM月dd日", culture)
                });
            }
            return Json(Success(new
            {
                ExceptionItems,
                Max = reuslt.Count
            }));
        }

        /// <summary>
        /// 最新消息跑馬燈
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> ListedNews()
        {
            var result = dashboardService.ListedNews();
            return Json(Success(result));
        }

        #endregion

        #region 右下角用水量查詢

        /// <summary>
        /// 用水分析預測圖表點擊
        /// </summary>
        /// <returns></returns>
        public IActionResult Fancybox_chart_WaterUseAnalyzer(DateTime Cdate)
        {
            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();
            ViewBag.CurrentTime = Cdate.ToString("yyyy/MM/dd");
            ViewBag.CurrentTimeTW = Cdate.ToString("yyy年MM月dd日", culture);
            return View();
        }

        /// <summary>
        /// 用水分析圖表點上面那個秀下面這個
        /// </summary>
        /// <param name="timespilt"></param>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public IActionResult LoadWaterUseAnalyzer(string timespilt, DateTime Cdate)
        {
            var thisyear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt).OrderBy(c => c.X).ToList();//今年
            var nextyear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate.AddYears(-1), timespilt).OrderBy(c => c.X).ToList();//去年同期
            //單位
            string xAayUnit = "";


            List<string> alert = new List<string>();
            if (thisyear == null || thisyear.Count() == 0)
            {
                alert.Add("本期用水趨勢,尚無資料");
            }

            if (nextyear == null || nextyear.Count() == 0)
            {
                alert.Add("去年同期用水趨勢,尚無資料");
            }


            Dictionary<string, float?> dicthisyear = new Dictionary<string, float?>();
            Dictionary<string, float?> dictnextyear = new Dictionary<string, float?>();
            //人數的空殼
            Dictionary<string, float?> dicpeople = new Dictionary<string, float?>();

            //好像可以用代理人或適配器模式解決下次試試看
            switch (timespilt)
            {
                case "day":

                    for (DateTime item = Cdate; item < Cdate.AddDays(1); item = item.AddHours(1))
                    {
                        dicthisyear.Add(item.ToString("HH:mm"), null);
                        dictnextyear.Add(item.ToString("HH:mm"), null);
                    }

                    if (thisyear != null && thisyear.Count() != 0)
                    {
                        foreach (var item in thisyear)
                        {
                            dicthisyear[item.X.Substring(11, 5)] = item.Y;
                        }
                    }

                    if (nextyear != null && dicthisyear.Count() != 0)
                    {
                        foreach (var item in nextyear)
                        {
                            dictnextyear[item.X.Substring(11, 5)] = item.Y;
                        }
                    }

                    alert.Add("日查詢不提供觀光人次");
                    xAayUnit = "時間(小時)";
                    break;
                case "week":
                    DateTime dt = Cdate.StartOfWeek(DayOfWeek.Monday);

                    //寫這啥機巴玩意我好爛==
                    for (int i = 0; i < 7; i++)
                    {
                        dicthisyear.Add(dt.AddDays(i).ToString("MM/dd"), null);
                        dictnextyear.Add(dt.AddDays(i).ToString("MM/dd"), null);
                    }


                    int rollnumber = 0;
                    if (thisyear != null && thisyear.Count() != 0)
                    {
                        foreach (var cell in dicthisyear)
                        {
                            dicthisyear[cell.Key] = thisyear.OrderBy(c => c.X).ElementAt(rollnumber).Y;
                            rollnumber++;
                        }
                    }

                    rollnumber = 0;
                    if (nextyear != null && nextyear.Count() != 0)
                    {
                        foreach (var cell in dictnextyear)
                        {
                            dictnextyear[cell.Key] = thisyear.OrderBy(c => c.X).ElementAt(rollnumber).Y;
                            rollnumber++;
                        }
                    }

                    alert.Add("週查詢不提供觀光人次");
                    xAayUnit = "時間(日期)";

                    break;
                case "month":
                    int days = DateTime.DaysInMonth(Cdate.Year, Cdate.Month);
                    for (int i = 1; i <= days; i++)
                    {
                        dicthisyear.Add(i.ToString(), null);
                        dictnextyear.Add(i.ToString(), null);
                        dicpeople.Add(i.ToString(), null);
                    }

                    if (thisyear != null && thisyear.Count() != 0)
                    {
                        foreach (var item in thisyear)
                        {
                            dicthisyear[item.X.ToString()] = item.Y;
                        }
                    }

                    if (nextyear != null && nextyear.Count() != 0)
                    {
                        foreach (var item in nextyear)
                        {
                            dictnextyear[item.X.ToString()] = item.Y;
                        }
                    }

                    var people = dashboardService.Listedpeople(Cdate);
                    if (people.startPeople == null && people.enderPeople == null)
                    {
                        alert.Add("此區段觀光人次尚無資料");
                        break;
                    }
                    dicpeople[dicpeople.First().Key] = people.startPeople;
                    dicpeople[dicpeople.Last().Key] = people.enderPeople;
                    xAayUnit = "時間(號)";
                    break;
            }


            return Json(Success(
                new
                {
                    X = dicthisyear.Keys.ToArray(),
                    Ythisyear = dicthisyear.Values.ToArray(),
                    Ynextyear = dictnextyear.Values.ToArray(),
                    People = dicpeople.Values.ToArray(),
                    Alert = alert.ToArray(),
                    xAayUnit
                }));
        }

        /// <summary>
        /// 柱狀圖點擊彈出視窗的臭東西,用水趨勢圖
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public IActionResult Fancybox_modalBarchart(DateTime Cdate)
        {
            ViewBag.Cdate = Cdate.ToString("yyyy/MM/dd");
            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();
            ViewBag.CurrentTimeTW = Cdate.ToString("yyy年MM月dd日", culture);
            return View();
        }

        /// <summary>
        /// 用水量查詢柱狀圖
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public async Task<IActionResult> ModalBarchart(DateTime Cdate)
        {
            //int Rotate = 10;
            //DateTime start = new DateTime(Cdate.Year, Cdate.Month, Cdate.Day, 0, 0, 0);
            //DateTime end = new DateTime(Cdate.Year, Cdate.Month, Cdate.Day, 23, 0, 0);
            //var reuslt = dashboardService.ListedChart1(aspNetUser.CurrentWaterNo, "pin", start, end);
            //var (increase, decrease) = dashboardService.GetIncreaseAndDecrease(aspNetUser.CurrentWaterNo);

            ////取上一期水費
            //var STQTY = dashboardService.GetA_WATERFEE_BILLDATE(aspNetUser.CurrentWaterNo);
            //float? IncreaseValue = 0;
            //float? DecreaseValue = 0;

            //if (STQTY.STQTY != null)
            //{
            //    if (increase != null)
            //    {
            //        IncreaseValue = (STQTY.STQTY / 60) * (100 + increase.Value);
            //    }

            //    if (decrease != null)
            //    {
            //        DecreaseValue = (STQTY.STQTY / 60) * decrease.Value;
            //    }
            //}

            ////要計算前兩個月的平均

            //var Xray = reuslt.Select(c => DateTime.Parse(c.X).ToString("HH:mm"));

            Dictionary<string, float?> dic = new Dictionary<string, float?>();
            var dayresult = await dashboardService.LitedPhMeterRecordList(Cdate, aspNetUser.CurrentWaterNo);

            if (dayresult == null) return Json(Failed(message: "資料尚未開放"));
            if (dayresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

            foreach (var item in dayresult)
            {
                dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);
            }

            return Json(Success(new
            {
                X = dic.Select(c => c.Key).ToArray(),
                Y = dic.Select(c => c.Value).ToArray(),
                xAayUnit = "時間(小時)"
                //Increase = $"突減{increase.Value}% \n 轉換為度數{IncreaseValue}度",
                //Decrease = $"突減{decrease.Value}% \n 轉換為度數{DecreaseValue}度",
                //IncreaseValue,
                //DecreaseValue
            }));
        }

        #endregion

        /// <summary>
        /// 用水情形分析/用水量查詢
        /// </summary>
        /// <param name="timespilt"></param>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> GetDashWaterAnalyer(string timespilt, DateTime Cdate)
        {

            //var mondayOfLastWeek = Cdate.AddDays(-(int)Cdate.DayOfWeek - 6);
            try
            {

                Dictionary<string, float?> dic = new Dictionary<string, float?>();

                switch (timespilt)
                {
                    case "week":
                        //Cdate = mondayOfLastWeek.AddDays(7);
                        break;
                    case "month":
                        Cdate = new DateTime(Cdate.Year, Cdate.Month, 1).AddMonths(1).AddDays(-1);
                        break;
                }


                string XrayUnit = "";

                switch (timespilt)
                {
                    case "day":

                        var ts = Cdate.Date - DateTime.Now;
                        if (ts.Days >= -6)
                        {
                            //前天去撈資料庫
                            var dayresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper()).OrderBy(c => c.X).ToList();

                            if (dayresult == null) return Json(Failed(message: "資料尚未開放"));
                            if (dayresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

                            DateTime current = new DateTime(2000, 4, 1);

                            for (int i = 0; i < 24; i++)
                            {
                                dic.Add(current.AddHours(i).ToString("HH:mm"), null);
                            }

                            foreach (var item in dayresult)
                            {
                                var temp0 = item.X.Substring(11, 5);
                                if (dic.ContainsKey(item.X.Substring(11, 5)))
                                {
                                    var temp = item.X.Substring(11, 5);
                                    dic[item.X.Substring(11, 5)] = item.Y;
                                }
                            }
                        }
                        else
                        {
                            //大前天還要取資料庫裡面的一筆去比對前天的SQLite，很多邊緣條件那有辦法嗎?沒辦法
                            float? geYesterdayLastAMOUNT = null;
                            if (Cdate.Date == DateTime.Now.AddDays(-2).Date)
                            {
                                var dayresultGetLast = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate.AddDays(1), timespilt.ToUpper()).OrderBy(c => c.X).ToList();
                                var getYesterdayLastValue = dayresultGetLast.FirstOrDefault();
                                if (getYesterdayLastValue != null)
                                {
                                    geYesterdayLastAMOUNT = getYesterdayLastValue.Y;
                                }
                            }

                            //大前天之前去找SQLite
                            var dayresult = await dashboardService.LitedPhMeterRecordList(Cdate, aspNetUser.CurrentWaterNo);

                            if (dayresult == null) return Json(Failed(message: "資料尚未開放"));
                            if (dayresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

                            foreach (var item in dayresult)
                            {
                                dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);
                            }

                            //大前天還要取資料庫裡面的一筆去比對前天的SQLite，很多邊緣條件那有辦法嗎?沒辦法
                            if (geYesterdayLastAMOUNT != null)
                            {
                                dic["23:00"] = geYesterdayLastAMOUNT;
                            }
                        }

                        XrayUnit = "時間(小時)";
                        break;

                    case "week":

                        var weekresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper()).OrderBy(c => c.X).ToList();
                        //return Json(Success(weekresult));

                        if (weekresult == null) return Json(Failed(message: "資料尚未開放"));
                        if (weekresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

                        var mondayOfLastWeek = Cdate.AddDays(-6);

                        for (int i = 0; i < 7; i++)
                        {
                            dic.Add(mondayOfLastWeek.AddDays(i).ToString("MM-dd"), null);
                        }

                        if (weekresult != null && weekresult.Count() != 0)
                        {
                            foreach (var cell in dic)
                            {
                                // 2022-10-10
                                var getOneWeekResult = weekresult.FirstOrDefault(c => c.X.Substring(5, 5) == cell.Key);

                                if (getOneWeekResult != null)
                                {
                                    dic[cell.Key] = getOneWeekResult.Y;
                                }
                            }
                        }

                        XrayUnit = "時間(日期)";
                        break;

                    case "month":

                        var monthresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper()).OrderBy(c => c.X);

                        if (monthresult == null) return Json(Failed(message: "資料尚未開放"));
                        if (monthresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

                        int days = DateTime.DaysInMonth(Cdate.Year, Cdate.Month);
                        for (int i = 1; i <= days; i++)
                        {
                            dic.Add(new DateTime(Cdate.Year, Cdate.Month, i).ToString("yyyy-MM-dd"), null);
                        }

                        foreach (var item in monthresult)
                        {
                            dic[item.X.ToString()] = item.Y;
                        }

                        XrayUnit = $"時間({Cdate.Month}月/號)";

                        break;
                }

                object obj = new
                {
                    X = dic.Select(c => c.Key).ToArray(),
                    Y = dic.Select(c => c.Value).ToArray(),
                    XrayUnit = XrayUnit
                };
                return Json(Success(obj));
            }
            catch (Exception ex)
            {
                return Json(Failed(message: ex.Message + ex.StackTrace));
            }
        }

        /// <summary>
        /// 整頁右上角Menus切換水號用
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> ListedUserWaterNos()
        {
            object obj = new
            {
                WaterNos = aspNetUser.WaterNo,
                CurrentNos = aspNetUser.CurrentWaterNo
            };
            return Json(Success(obj));
        }

        /// <summary>
        /// 整頁右上角Menus切換水號用
        /// </summary>
        /// <param name="WaterNos"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> ChangeUserWaterNos(string WaterNos)
        {
            HttpContext.Session.SetString("CurrentWaterNo", WaterNos);
            return Json(Success(message: $"已切換至{WaterNos}"));
        }

        /// <summary>
        /// 圖台用的地址訊息
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> GetCurrentAddress()
        {

            var address = dashboardService.GetAddressByWaterNos(aspNetUser.CurrentWaterNo);

            if (string.IsNullOrEmpty(address))
            {
                return Json(Failed("無相關地址資訊"));
            }
            else
            {
                return Json(Success<string>(address));
            }
        }

        public async Task<IActionResult> GetCurrentLatAndLon()
        {

            var location = dashboardService.GetLatLotByWaterNos(aspNetUser.CurrentWaterNo);
            return Json(Success(data: new
            {
                Lot = location.Lon,
                Lat = location.Lat
            }));
        }

        #region 沒用

        ///// <summary>
        ///// 用水情形分析資料來源(棄用)
        ///// </summary>
        ///// <returns></returns>
        //public IActionResult WaterUseAnalyzer(string timespilt, DateTime Cdate)
        //{
        //    var lastYear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt);
        //    var thisYear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate.AddYears(-1), timespilt);

        //    return Json(Success(new
        //    {
        //        lastYear = new
        //        {
        //            X = lastYear.Select(c => c.X).ToArray(),
        //            Y = lastYear.Select(c => c.Y).ToArray()
        //        },
        //        thisYear = new
        //        {
        //            X = thisYear.Select(c => c.X).ToArray(),
        //            Y = thisYear.Select(c => c.Y).ToArray()
        //        },
        //        tourists = new
        //        {
        //            X = 1,
        //            Y = 2
        //        }
        //    }));
        //}

        ///// <summary>
        ///// 用水量查詢圖表(棄用)
        ///// </summary>
        //[HttpPost]
        //public async Task<IActionResult> GetDashWaterUseSearchChart(DateTime Cdate)
        //{
        //    var result = dashboardService.GetDashWaterUse(aspNetUser.CurrentWaterNo, Cdate);
        //    Dictionary<string, float> dic = new Dictionary<string, float>();

        //    for (int i = 1; i <= 7; i++)
        //    {
        //        dic.Add(i.ToString(), 0);
        //    }

        //    foreach (var item in result)
        //    {
        //        if (dic.ContainsKey(item.X))
        //        {
        //            dic[item.X] = item.Y.Value;
        //        }
        //    }

        //    var Data = dic.Select(c => c.Value).ToArray();

        //    return Json(Success(Data));
        //}

        #endregion
    }

    /// <summary>
    /// 需求不明確先放這裡 已經整理到View Model
    /// </summary>
}
