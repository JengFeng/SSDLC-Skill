using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using System.Globalization;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models.Entity;
using TWNPPublic.ViewModels.Dashboard;

namespace TWNPPublic.Controllers
{
    [Menu("首頁")]
    public class DashboardController : BasicController
    {

        private readonly IAspNetUser aspNetUser;
        private readonly IDashboardService dashboardService;

        //好醜...寫得好醜,我真醜 ┏( .-. ┏ ) ┓
        public DashboardController(IAspNetUser aspNetUser, IDashboardService dashboardService)
        {
            this.dashboardService = dashboardService;
            this.aspNetUser = aspNetUser;
        }

        /// <summary>
        /// 首頁
        /// </summary>
        /// <returns></returns>
        public IActionResult Index()
        {
            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();
            ViewBag.CurrentTime = DateTime.Now.ToString("yyy年MM月dd日", culture);
            return View();
        }

        #region 左上角基本資料

        /// <summary>
        /// 詳細資料
        /// </summary>
        /// <returns></returns>
        public IActionResult Fancybox_detailsTable()
        {
            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();
            ViewBag.CurrentTime = DateTime.Now.ToString("yyy年MM月份", culture);
            //ViewBag.DetailResult = dashboardService.GetWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now.ToString("yyyMMdd", culture));
            ViewBag.VDetailResult = dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now.ToString("yyyMMdd", culture));
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
            DateTime GetDataDate = new DateTime(2022, 4, 22);
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

            return Json(Success(result));
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

            var Note = dashboardService.GetB_NOTEbyWaterNoAndDate(aspNetUser.CurrentWaterNo, Cdate);
            if (Note != null)
            {
                var HourNotes = dashboardService.ListedB_NOTE_HOURBySN(Note.B_NOTE_SN);
                ViewBag.HourNotes = HourNotes;
                ViewBag.NoteSN = Note.B_NOTE_SN;
            }
            else
            {
                ViewBag.HourNotes = new List<B_NOTE_HOUR>();
                ViewBag.NoteSN = 0;
            }
            return View();
        }

        /// <summary>
        /// 點擊用戶記事後右邊的圖表(裡面還有固定資料記得刪掉)
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public IActionResult WaterNoteTableChart(DateTime Cdate)
        {
            //3/21
            var result = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, "day");
            Dictionary<string, float?> dic = new Dictionary<string, float?>();
            List<int> faker = new List<int>();
            if (result == null)
            {
                return Json(Failed(message: "查無資料"));
            }

            if (result.Count() <= 0)
            {
                return Json(Failed(message: "查無資料"));
            }


            for (DateTime item = Cdate; item < Cdate.AddDays(1); item = item.AddHours(1))
            {
                dic.Add(item.ToString("yyyy-MM-dd HH:mm:ss"), null);
            }

            foreach (var item in result)
            {
                dic[item.X.ToString()] = item.Y;
            }

            object obj = new
            {
                X = dic.Select(c => c.Key.Substring(11, 5)).ToArray(),
                Y = dic.Select(c => c.Value).ToArray(),
                Ymax = dic.Select(c => c.Value + 1).ToArray(),
                Ymin = dic.Select(c => c.Value - 1).ToArray(),
            };
            return Json(Success(obj));
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

            #region Test
            //int Year = 0, Month = 0;

            //DateTime starttime;
            //DateTime endtime;
            //if (Year == 0 && Month == 0)
            //{
            //    starttime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            //    endtime = new DateTime(DateTime.Now.AddMonths(1).Year, DateTime.Now.AddMonths(1).Month, 1).AddDays(-1);
            //}
            //else
            //{
            //    DateTime Setdate = new DateTime(Year, Month, 1);
            //    starttime = new DateTime(Setdate.Year, Setdate.Month, 1);
            //    endtime = new DateTime(Setdate.AddMonths(1).Year, Setdate.AddMonths(1).Month, 1).AddDays(-1);
            //}

            //Random Rnd = new Random();

            //calendarData.Add(new fullcalendar
            //{
            //    id = "1",
            //    title = "測試事件1",
            //    start = start.AddDays(Rnd.Next(1, 11)).ToString("yyyy-MM-dd"),
            //    NoteDate = start.AddDays(Rnd.Next(1, 11)).ToString("yyyy-MM-dd")
            //});

            //calendarData.Add(new fullcalendar
            //{
            //    id = "2",
            //    title = "測試事件2",
            //    start = start.AddDays(Rnd.Next(1, 11)).ToString("yyyy-MM-dd"),
            //    NoteDate = start.AddDays(Rnd.Next(1, 11)).ToString("yyyy-MM-dd")
            //});


            //calendarData.Add(new fullcalendar
            //{
            //    id = "3",
            //    title = "測試事件3",
            //    start = end.AddDays(0 - (Rnd.Next(1, 11))).ToString("yyyy-MM-dd"),
            //    NoteDate = start.AddDays(Rnd.Next(1, 11)).ToString("yyyy-MM-dd")
            //});


            //calendarData.Add(new fullcalendar
            //{
            //    id = "4",
            //    title = "測試事件4",
            //    start = end.AddDays(0 - (Rnd.Next(1, 11))).ToString("yyyy-MM-dd"),
            //    NoteDate = start.AddDays(Rnd.Next(1, 11)).ToString("yyyy-MM-dd")
            //});
            #endregion
        }

        public async Task<IActionResult> UpdateHourNote(int NoteSN, string Hour, string Msg)
        {
            if (NoteSN == 0)
            {
                return Json(Failed("尚未核許得記事編號"));
            }

            var result = dashboardService.UpdateNoteHour(NoteSN, Convert.ToInt32(Hour), Msg);

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
            var reuslt = dashboardService.LitedExceptionItem(aspNetUser.CurrentWaterNo, pager , 3);
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
                    #region 嚴重譴責這種改了又改的行為==
                    //dicthisyear.Add("一", null);
                    //dicthisyear.Add("二", null);
                    //dicthisyear.Add("三", null);
                    //dicthisyear.Add("四", null);
                    //dicthisyear.Add("五", null);
                    //dicthisyear.Add("六", null);
                    //dicthisyear.Add("日", null);

                    //dictnextyear.Add("一", null);
                    //dictnextyear.Add("二", null);
                    //dictnextyear.Add("三", null);
                    //dictnextyear.Add("四", null);
                    //dictnextyear.Add("五", null);
                    //dictnextyear.Add("六", null);
                    //dictnextyear.Add("日", null);
                    #endregion

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

                    #region
                    //foreach (var item in thisyear)
                    //{

                    //    switch (item.X)
                    //    {
                    //        case "1":
                    //            dicthisyear["一"] = item.Y;
                    //            break;
                    //        case "2":
                    //            dicthisyear["二"] = item.Y;
                    //            break;
                    //        case "3":
                    //            dicthisyear["三"] = item.Y;
                    //            break;
                    //        case "4":
                    //            dicthisyear["四"] = item.Y;
                    //            break;
                    //        case "5":
                    //            dicthisyear["五"] = item.Y;
                    //            break;
                    //        case "6":
                    //            dicthisyear["六"] = item.Y;
                    //            break;
                    //        case "7":
                    //            dicthisyear["日"] = item.Y;
                    //            break;
                    //    }

                    //}
                    #endregion
                    #region
                    //foreach (var item in nextyear)
                    //{
                    //switch (item.X)
                    //{
                    //    case "1":
                    //        dictnextyear["一"] = item.Y;
                    //        break;
                    //    case "2":
                    //        dictnextyear["二"] = item.Y;
                    //        break;
                    //    case "3":
                    //        dictnextyear["三"] = item.Y;
                    //        break;
                    //    case "4":
                    //        dictnextyear["四"] = item.Y;
                    //        break;
                    //    case "5":
                    //        dictnextyear["五"] = item.Y;
                    //        break;
                    //    case "6":
                    //        dictnextyear["六"] = item.Y;
                    //        break;
                    //    case "7":
                    //        dictnextyear["日"] = item.Y;
                    //        break;
                    //}
                    //}
                    #endregion

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
            int Rotate = 10;
            DateTime start = new DateTime(Cdate.Year, Cdate.Month, Cdate.Day, 0, 0, 0);
            DateTime end = new DateTime(Cdate.Year, Cdate.Month, Cdate.Day, 23, 0, 0);
            var reuslt = dashboardService.ListedChart1(aspNetUser.CurrentWaterNo, "pin", start, end);
            var (increase, decrease) = dashboardService.GetIncreaseAndDecrease(aspNetUser.CurrentWaterNo);

            //取上一期水費
            var STQTY  = dashboardService.GetA_WATERFEE_BILLDATE(aspNetUser.CurrentWaterNo);

            if(STQTY.STQTY != null)
            {
                if (increase != null)
                {

                }

                if (decrease != null)
                {

                }
            }

            //要計算前兩個月的平均

            var Xray = reuslt.Select(c => DateTime.Parse(c.X).ToString("HH:mm"));
            return Json(Success(new
            {
                X = Xray,
                Y = reuslt.Select(c => c.Y).ToArray(),
                Rotate
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
            Dictionary<string, float?> dic = new Dictionary<string, float?>();
            var result = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper()).OrderBy(c => c.X);

            if (result == null)
            {
                return Json(Failed(message: "查無資料"));
            }

            if (result.Count() <= 0)
            {
                return Json(Failed(message: "查無資料"));
            }


            string XrayUnit = "";
            switch (timespilt)
            {
                case "day":

                    for (DateTime item = Cdate; item < Cdate.AddDays(1); item = item.AddHours(1))
                    {
                        dic.Add(item.ToString("HH:mm"), null);
                    }

                    foreach (var item in result)
                    {
                        dic[item.X.Substring(11, 5)] = item.Y;
                    }
                    XrayUnit = "時間(小時)";

                    break;
                case "week":
                    #region 已棄用

                    //dic.Add("一", null);
                    //dic.Add("二", null);
                    //dic.Add("三", null);
                    //dic.Add("四", null);
                    //dic.Add("五", null);
                    //dic.Add("六", null);
                    //dic.Add("日", null);

                    //foreach (var item in result)
                    //{
                    //    switch (item.X)
                    //    {
                    //        case "1":
                    //            dic["一"] = item.Y;
                    //            break;
                    //        case "2":
                    //            dic["二"] = item.Y;
                    //            break;
                    //        case "3":
                    //            dic["三"] = item.Y;
                    //            break;
                    //        case "4":
                    //            dic["四"] = item.Y;
                    //            break;
                    //        case "5":
                    //            dic["五"] = item.Y;
                    //            break;
                    //        case "6":
                    //            dic["六"] = item.Y;
                    //            break;
                    //        case "7":
                    //            dic["日"] = item.Y;
                    //            break;
                    //    }
                    //}

                    #endregion
                    DateTime dt = Cdate.StartOfWeek(DayOfWeek.Monday);

                    for (int i = 0; i < 7; i++)
                    {
                        dic.Add(dt.AddDays(i).ToString("MM/dd"), null);
                    }

                    int rollnumber = 0;
                    if (result != null && result.Count() != 0)
                    {
                        foreach (var cell in dic)
                        {
                            dic[cell.Key] = result.OrderBy(c => c.X).ElementAt(rollnumber).Y;
                            rollnumber++;
                        }
                    }

                    XrayUnit = "時間(日期)";
                    break;

                case "month":
                    int days = DateTime.DaysInMonth(Cdate.Year, Cdate.Month);
                    for (int i = 1; i <= days; i++)
                    {
                        dic.Add(i.ToString(), null);
                    }

                    foreach (var item in result)
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
    }

    /// <summary>
    /// 需求不明確先放這裡
    /// </summary>
    public class fullcalendar
    {
        public string id { get; set; }
        public string title { get; set; }
        public string start { get; set; }
        public string NoteDate { get; set; }
    }

    public class ListedTable
    {
        public int Max { get; set; }
        public List<ExceptionItem> PageData { get; set; }
    }
}
