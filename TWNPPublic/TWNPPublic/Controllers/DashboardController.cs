using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System.ComponentModel;
using System.Globalization;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Service;
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
        public IActionResult Index()
        {
            CultureInfo culture = new CultureInfo("zh-TW");
            culture.DateTimeFormat.Calendar = new TaiwanCalendar();
            ViewBag.CurrentTime = DateTime.Now.ToString("yyy年MM月dd日", culture);
            return View();
        }

        //右下的圖表頁面
        public IActionResult Fancybox_chart_WaterUseAnalyzer()
        {
            return View();
        }
        //左中詳細資料
        public IActionResult Fancybox_detailsTable()
        {
            return View();
        }
        //用戶記事
        public IActionResult Fancybox_tableChart()
        {
            return View();
        }

        //左上的圖表頁面
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
            var result = dashboardService.GetDashWaterUse(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper()).OrderBy(c => c.X);

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
                        dic.Add(item.ToString("yyyy-MM-dd HH:mm:ss"),null);
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

        /// <summary>
        /// 左下用水既是
        /// </summary>
        /// <param name="start"></param>
        /// <param name="end"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> ListedNotes(DateTime start, DateTime end)
        {

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

            var result = dashboardService.ListedNotes(aspNetUser.CurrentWaterNo, start, end);

            List<fullcalendar> calendarData = new List<fullcalendar>();

            Random Rnd = new Random();

            calendarData.Add(new fullcalendar
            {
                id = "1",
                title = "測試事件1",
                start = start.AddDays(Rnd.Next(1, 11)).ToString("yyyy-MM-dd")
            });

            calendarData.Add(new fullcalendar
            {
                id = "2",
                title = "測試事件2",
                start = start.AddDays(Rnd.Next(1, 11)).ToString("yyyy-MM-dd")
            });


            calendarData.Add(new fullcalendar
            {
                id = "3",
                title = "測試事件3",
                start = end.AddDays(0 - (Rnd.Next(1, 11))).ToString("yyyy-MM-dd")
            });


            calendarData.Add(new fullcalendar
            {
                id = "4",
                title = "測試事件4",
                start = end.AddDays(0 - (Rnd.Next(1, 11))).ToString("yyyy-MM-dd")
            });

            return Json(Success(calendarData.ToArray()));
        }

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
    }

    public class ListedTable
    {
        public int Max { get; set; }
        public List<ExceptionItem> PageData { get; set; }
    }
}
