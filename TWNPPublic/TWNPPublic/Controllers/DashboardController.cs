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

        /// <summary>
        /// 用水分析預測圖表點擊
        /// </summary>
        /// <returns></returns>
        public IActionResult Fancybox_chart_WaterUseAnalyzer()
        {
            return View();
        }

        /// <summary>
        /// 用水情形分析資料來源
        /// </summary>
        /// <returns></returns>
        public IActionResult WaterUseAnalyzer(string timespilt, DateTime Cdate)
        {
            var lastYear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt);
            var thisYear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate.AddYears(-1), timespilt);

            return Json(Success(new
            {
                lastYear = new
                {
                    X = lastYear.Select(c => c.X).ToArray(),
                    Y = lastYear.Select(c => c.Y).ToArray()
                },
                thisYear = new
                {
                    X = thisYear.Select(c => c.X).ToArray(),
                    Y = thisYear.Select(c => c.Y).ToArray()
                },
                tourists = new
                {
                    X = 1,
                    Y = 2
                }
            }));
        }

        /// <summary>
        /// 詳細資料
        /// </summary>
        /// <returns></returns>
        public IActionResult Fancybox_detailsTable()
        {
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
        /// 柱狀圖點擊彈出視窗的臭東西
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public IActionResult Fancybox_modalBarchart(DateTime Cdate)
        {
            ViewBag.Cdate = Cdate;
            return View();
        }

        /// <summary>
        /// 用水量查詢柱狀圖
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public async Task<IActionResult> ModalBarchart(DateTime Cdate)
        {

            int Rotate = 30;
            Cdate = new DateTime(2020, 4, 4);
            DateTime start = new DateTime(Cdate.Year, Cdate.Month, Cdate.Day, 0, 0, 0);
            DateTime end = new DateTime(Cdate.Year, Cdate.Month, Cdate.Day, 23, 0, 0);
            var reuslt = dashboardService.ListedChart1(aspNetUser.CurrentWaterNo, "pin", start, end);
            return Json(Success(new
            {
                X = reuslt.Select(c => c.X).ToArray(),
                Y = reuslt.Select(c => c.Y).ToArray(),
                Rotate
            }));
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

        /// <summary>
        /// 用水量查詢圖表
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> GetDashWaterUseSearchChart(DateTime Cdate)
        {
            var result = dashboardService.GetDashWaterUse(aspNetUser.CurrentWaterNo, Cdate);
            Dictionary<string, float> dic = new Dictionary<string, float>();

            for (int i = 1; i <= 7; i++)
            {
                dic.Add(i.ToString(), 0);
            }

            foreach (var item in result)
            {
                if (dic.ContainsKey(item.X))
                {
                    dic[item.X] = item.Y.Value;
                }
            }

            var Data = dic.Select(c => c.Value).ToArray();

            return Json(Success(Data));
        }

        /// <summary>
        /// 用水情形分析
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

            int Rotate = 0;
            switch (timespilt)
            {
                case "day":
                    Rotate = 30;
                    for (DateTime item = Cdate; item < Cdate.AddDays(1); item = item.AddHours(1))
                    {
                        dic.Add(item.ToString("yyyy-MM-dd HH:mm:ss"), null);
                    }

                    foreach (var item in result)
                    {
                        dic[item.X.ToString()] = item.Y;
                    }

                    break;
                case "week":
                    dic.Add("Mon", null);
                    dic.Add("Tue", null);
                    dic.Add("Wed", null);
                    dic.Add("Thu", null);
                    dic.Add("Fri", null);
                    dic.Add("Sat", null);
                    dic.Add("Sun", null);

                    foreach (var item in result)
                    {
                        switch (item.X)
                        {
                            case "1":
                                dic["Mon"] = item.Y;
                                break;
                            case "2":
                                dic["Tue"] = item.Y;
                                break;
                            case "3":
                                dic["Wed"] = item.Y;
                                break;
                            case "4":
                                dic["Thu"] = item.Y;
                                break;
                            case "5":
                                dic["Fri"] = item.Y;
                                break;
                            case "6":
                                dic["Sat"] = item.Y;
                                break;
                            case "7":
                                dic["Sun"] = item.Y;
                                break;
                        }
                    }


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

                    break;
            }

            object obj = new
            {
                X = dic.Select(c => c.Key).ToArray(),
                Y = dic.Select(c => c.Value).ToArray(),
                Rotate
            };
            return Json(Success(obj));
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

        #region 用水記事

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
        /// 點擊用戶記事後右邊的圖表
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public IActionResult WaterNoteTableChart(DateTime Cdate)
        {
            Cdate = new DateTime(2022, 3, 21);
            var result = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, "day");
            Dictionary<string, float?> dic = new Dictionary<string, float?>();

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
                X = dic.Select(c => c.Key.Substring(10)).ToArray(),
                Y = dic.Select(c => c.Value).ToArray(),
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

            if(result >= 1 )
            {
                return Json(Success("更新成功"));
            }
            else
            {
                return Json(Success("更新失敗"));
            }
        }

        #endregion

        /// <summary>
        /// 異常狀態 
        /// </summary>
        /// <param name="page"></param>
        /// <returns></returns>
        public async Task<IActionResult> ListedExceptionState(int? page)
        {
            int pager = (page ?? 1) - 1;
            var reuslt = dashboardService.LitedExceptionItem(aspNetUser.CurrentWaterNo, pager, 10);
            List<ExceptionItem> exceptionItems = new List<ExceptionItem>();

            //foreach (var item in reuslt)
            //{
            //    exceptionItems.Add(new ExceptionItem
            //    {
            //        Id = item.Id,
            //        Message = item.Message,
            //        Time = item.Time
            //    });
            //}
            return Json(Success(exceptionItems));
        }

        public async Task<IActionResult> ListedUserWaterNos()
        {
            object obj = new
            {
                WaterNos = aspNetUser.WaterNo,
                CurrentNos = aspNetUser.CurrentWaterNo
            };
            return Json(Success(obj));
        }

        [HttpPost]
        public async Task<IActionResult> ChangeUserWaterNos(string WaterNos)
        {
            HttpContext.Session.SetString("CurrentWaterNo", WaterNos);
            return Json(Success(message: $"已切換至{WaterNos}"));
        }
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
