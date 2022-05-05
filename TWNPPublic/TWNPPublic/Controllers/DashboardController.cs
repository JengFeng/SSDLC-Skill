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
    [SessionAuthorization]
    public class DashboardController : BasicController
    {
        private readonly IDashboardService dashboardService;
        private readonly IAspNetUser aspNetUser;

        public DashboardController(IDashboardService dashboardService, IAspNetUser aspNetUser)
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

        public IActionResult Fancybox_chart()
        {
            return View();
        }

        /// <summary>
        /// 左上的資訊，用水比較，最新資訊，警示資訊
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> GetDashMainData()
        {
            var result = dashboardService.GetDashMain(aspNetUser.WaterNo, aspNetUser.WaterNo, new DateTime(2022, 4, 22));
            //名字是空的話 用帳號先取代
            if (string.IsNullOrEmpty(result.NAME))
            {
                result.NAME = aspNetUser.WaterNo;
            }
            return Json(Success(result));
        }

        /// <summary>
        /// 用水查詢
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> GetDashWaterUseSearchChart(string Cdate)
        {
            var result = dashboardService.GetDashWaterUse(aspNetUser.WaterNo, new DateTime(2022, 4, 4));
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

        public async Task<IActionResult> ListedNews()
        {
            var result = dashboardService.ListedNews();
            return Json(Success(result));
        }

        [HttpPost]
        public async Task<IActionResult> ListedNotes(DateTime start, DateTime end)
        {

             int Year = 0, Month = 0;

            DateTime starttime;
            DateTime endtime;
            if (Year == 0 && Month == 0)
            {
                starttime = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
                endtime = new DateTime(DateTime.Now.AddMonths(1).Year, DateTime.Now.AddMonths(1).Month, 1).AddDays(-1);
            }
            else
            {
                DateTime Setdate = new DateTime(Year, Month, 1);
                starttime = new DateTime(Setdate.Year, Setdate.Month, 1);
                endtime = new DateTime(Setdate.AddMonths(1).Year, Setdate.AddMonths(1).Month, 1).AddDays(-1);
            }

            var result = dashboardService.ListedNotes(aspNetUser.WaterNo, starttime, endtime);
            return Json(Success(result));
        }
    }
}
