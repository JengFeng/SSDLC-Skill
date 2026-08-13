using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NuGet.Protocol;
using System.Collections.Generic;
using System.ComponentModel;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Xml.Linq;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Common.Security;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models.Entity;
using TWNPPublic.Models.SqlFunctions;
using TWNPPublic.ViewModels.Dashboard;
using static System.Net.Mime.MediaTypeNames;

namespace TWNPPublic.Controllers
{
    [Menu("首頁")]
    public class DashboardController : BasicController
    {

        private readonly IAspNetUser aspNetUser;
        private readonly IDashboardService dashboardService;

        public DashboardController(ILogger<DashboardController> logger, IAspNetUser aspNetUser, IDashboardService dashboardService)
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

            //將費用名字改成帳號的名稱
            var result2 = await dashboardService.GetAccountByWaterNo(aspNetUser.CurrentWaterNo);
            var NAME = result2 == null ? CurrentResult.NAME_DAES : result2.USERNAME == null ? CurrentResult.NAME_DAES : result2.USERNAME == "" ? CurrentResult.NAME_DAES : result2.USERNAME;
            CurrentResult.NAME_DAES = NAME;
            if (aspNetUser.UserId > 0)
            {
                //民眾版
                CurrentResult.NAME_DAES = NAME;
            }

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

            #region 水號過戶判斷
            if (aspNetUser.UserId != 0)
            {
                //if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                //{

                //    if ( !( Cdate >= aspNetUser.StartDate) )
                //    {
                //        ViewBag.VDetailResult = null;
                //    }

                //}
                //else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                //{
                //    if ( !(Cdate >= aspNetUser.StartDate) || !(Cdate <= aspNetUser.EndDate) )
                //    {
                //        ViewBag.VDetailResult = null;
                //    }
                //}


                if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && Cdate >= aspNetUser.StartDate && Cdate <= aspNetUser.EndDate)
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && Cdate >= aspNetUser.StartDate)
                                    || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && Cdate <= aspNetUser.EndDate))
                {
                    //
                }
                else
                {
                    ViewBag.VDetailResult = null;
                }

            }
            #endregion

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

            #region  水號過戶判斷
            if (aspNetUser.UserId != 0)
            {
                //if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) )
                //{
                //    result = dashboardService.GetDashMain2(aspNetUser.CurrentWaterNo, aspNetUser.UserId.Value, GetDataDate);
                //}
                //else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) )
                //{
                //    result = dashboardService.GetDashMain2(aspNetUser.CurrentWaterNo, aspNetUser.UserId.Value, GetDataDate);
                //}

                if ((!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                    || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString())))
                {

                    result = dashboardService.GetDashMain2(aspNetUser.CurrentWaterNo, aspNetUser.UserId.Value, GetDataDate);
                }

            }
            #endregion

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
            //result.LASTMONTH_DATE = result.LASTMONTH_DATE;
            //result.LASTMONTH_DATE1 = result.LASTMONTH_DATE1;
            //result.THISMONTHEND_DATE = result.THISMONTHEND_DATE;

            //result.LASTMONTH_MONEY = 0;
            return Json(Success(result));
        }

        /// <summary>
        /// 取得 WaterFee2 目前用在 去年同期水費 和 用水情形比較 去年當月
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> GetWaterFee2()
        {
            var result = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now.AddYears(-1).AddMonths(+2));
            if (result == null)
            {
                result = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now.AddYears(-1).AddMonths(-1).AddMonths(+2));
            }

            #region 水號過戶判斷
            if (aspNetUser.UserId != 0)
            {
                //if ( !string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                //{
                //    if (!(DateTime.Now.AddYears(-1) >= aspNetUser.StartDate) )
                //    {
                //        result.SUBTOTAL = (0).ToString();
                //        result.TOQTY = (0).ToString();
                //    }

                //    if (!(DateTime.Now.AddYears(-1).AddMonths(-1) >= aspNetUser.StartDate) )
                //    {
                //        result.SUBTOTAL = (0).ToString();
                //        result.TOQTY = (0).ToString();
                //    }

                //}
                //else if ( !string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) )
                //{
                //    if (!(DateTime.Now.AddYears(-1) >= aspNetUser.StartDate) || !(DateTime.Now.AddYears(-1) <= aspNetUser.EndDate))
                //    {
                //        result.SUBTOTAL = (0).ToString();
                //        result.TOQTY = (0).ToString();
                //    }

                //    if (!(DateTime.Now.AddYears(-1).AddMonths(-1) >= aspNetUser.StartDate) || !(DateTime.Now.AddYears(-1).AddMonths(-1) <= aspNetUser.EndDate))
                //    {
                //        result.SUBTOTAL = (0).ToString();
                //        result.TOQTY = (0).ToString();
                //    }

                //}


                if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Now.AddYears(-1).AddMonths(-1) >= aspNetUser.StartDate && DateTime.Now.AddYears(-1).AddMonths(-1) <= aspNetUser.EndDate)
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Now.AddYears(-1).AddMonths(-1) >= aspNetUser.StartDate)
                                    || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Now.AddYears(-1).AddMonths(-1) <= aspNetUser.EndDate))
                {

                }
                else
                {
                    result.SUBTOTAL = (0).ToString();
                    result.TOQTY = (0).ToString();
                }

            }
            #endregion

            return Json(Success(new
            {
                result?.NAME_DAES,
                result?.AREA,
                result?.SUBTOTAL,
                result?.TOQTY,
                result?.BILLDATE,
                result?.LASTMETERED,
                result?.METERED,
                result?.TOTAL,

            }));
        }


        /// <summary>
        /// 取得 WaterFee3 為了撈取最新的用戶名稱
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> GetWaterFee3()
        {
            var result = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now);
            if (result == null)
            {
                result = await dashboardService.GetVWaterFee2ByWaterNoAndTime(aspNetUser.CurrentWaterNo, DateTime.Now.AddMonths(-1));
            }

            var result2 = await dashboardService.GetAccountByWaterNo(aspNetUser.CurrentWaterNo);
            string NAME = "用戶";
            // 如果 result2.USERNAME 有值就用它，否則退回 result.NAME_DAES
            NAME = NAME = !string.IsNullOrEmpty(result2?.USERNAME)
                          ? result2.USERNAME
                          : result?.NAME_DAES ?? NAME;

            return Json(Success(new
            {
                NAME,
                result?.AREA,
                result?.SUBTOTAL,
                result?.TOQTY
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

            #region 水號過戶判斷
            if (aspNetUser.UserId != 0)
            {
                //if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                //{
                //    if ( !( Cdate >= aspNetUser.StartDate)  )
                //    {
                //        Note = null;
                //    }

                //}
                //else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                //{
                //    if (!(Cdate >= aspNetUser.StartDate) || !(Cdate <= aspNetUser.EndDate))
                //    {
                //        Note = null;
                //    }
                //}


                if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && Cdate >= aspNetUser.StartDate && Cdate <= aspNetUser.EndDate)
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && Cdate >= aspNetUser.StartDate)
                                    || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && Cdate <= aspNetUser.EndDate))
                {

                }
                else
                {
                    Note = null;
                }

            }
            #endregion

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
        public async Task<IActionResult> WaterNoteTableChart(DateTime Cdate, bool Fromtwn)
        {
            //回應25筆
            // 2022/11/13 00:00:00 - 2022/11/14 00:00:00
            // 先做 Hash 25 筆

            Dictionary<string, decimal?> dic = new Dictionary<string, decimal?>();
            DateTime StartTime = DateTime.Now;
            //每月的1號，開始日期的月需要減1
            if (Cdate.Day == 1)
            {
                StartTime = new DateTime(Cdate.Year, Cdate.AddDays(-1).Month, Cdate.AddDays(-1).Day, 23, 0, 0);

                //若是12月的話，年要-1到去年的時間
                if (Cdate.AddDays(-1).Month == 12)
                {
                    StartTime = new DateTime(Cdate.AddYears(-1).Year, Cdate.AddDays(-1).Month, Cdate.AddDays(-1).Day, 23, 0, 0);
                }
            }
            else
            {
                StartTime = new DateTime(Cdate.Year, Cdate.Month, Cdate.AddDays(-1).Day, 23, 0, 0);
            }

            DateTime EnderTime = DateTime.Now;

            // 取得下個月的第一天
            DateTime firstDayOfNextMonth = new DateTime(Cdate.Year, Cdate.Month, 1).AddMonths(1);
            // 減去一天，即為當前月份的最後一天
            DateTime lastDayOfCurrentMonth = firstDayOfNextMonth.AddDays(-1);
            // 判斷今天是否是最後一天
            bool isLastDayOfMonth = Cdate.Date == lastDayOfCurrentMonth.Date;

            if (isLastDayOfMonth)
            {
                EnderTime = new DateTime(Cdate.Year, Cdate.AddDays(1).Month, Cdate.AddDays(1).Day, 0, 0, 0);
            }
            else
            {
                EnderTime = new DateTime(Cdate.Year, Cdate.Month, Cdate.AddDays(1).Day, 0, 0, 0);
            }


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
                    #region 水號過戶判斷
                    //if (aspNetUser.UserId != 0)
                    //{
                    //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                    //    {
                    //        if ( !(StartTime >= aspNetUser.StartDate) )
                    //        {
                    //            return Json(Failed(message: "查無尚未開放"));
                    //        }

                    //    }
                    //    else if ( !string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                    //    {
                    //        if (!(StartTime >= aspNetUser.StartDate) || !(EnderTime <= aspNetUser.EndDate))
                    //        {
                    //            return Json(Failed(message: "查無尚未開放"));
                    //        }

                    //    }
                    //}
                    #endregion
                    // var dayresult2 = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, "day".ToUpper()).OrderBy(c => c.X).ToList();
                    // Cdata =     2022/11/13
                    // StartTime = 2022/11/13 00:00:00
                    // EndTime =   2022/11/14 00:00:00
                    // 測試 SELECT * FROM [dbo].[F_B_CHART1]('7D762461969','PIN','2022/4/4 13:00:00','2022/4/6 13:00:00')

                    //var temp = dashboardService.ListedChart1("7D762461969", "PIN", new DateTime(2022, 4, 4), new DateTime(2022, 4, 6));
                    var temp = dashboardService.ListedChart1(aspNetUser.CurrentWaterNo, "PIN", StartTime, EnderTime);
                    if (temp.Count() <= 0 || temp == null) return Json(Failed(message: "資料尚未開放"));
                    //這裡要去重複
                    foreach (var item in dic)
                    {

                        var cell = temp.FirstOrDefault(c => c.X.ToString("yyyy/MM/dd HH:mm") == item.Key);

                        #region 水號過戶判斷
                        //if (aspNetUser.UserId != 0)
                        //{
                        //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                        //    {
                        //        if (cell == null)
                        //        {
                        //            dic[item.Key] = null;
                        //        }
                        //        else
                        //        {
                        //            if (!(cell.X >= aspNetUser.StartDate))
                        //            {
                        //                dic[item.Key] = null;
                        //            }
                        //            else
                        //            {
                        //                dic[item.Key] = cell.Y;
                        //            }
                        //        }


                        //    }
                        //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                        //    {

                        //        if (cell == null)
                        //        {
                        //            dic[item.Key] = null;
                        //        }
                        //        else
                        //        {
                        //            if (!(cell.X >= aspNetUser.StartDate) || !(cell.X <= aspNetUser.EndDate))
                        //            {
                        //                dic[item.Key] = null;
                        //            }
                        //            else
                        //            {
                        //                dic[item.Key] = cell.Y;
                        //            }

                        //        }

                        //    }
                        //    else
                        //    {
                        //        //非過戶
                        //        if (cell == null)
                        //        {
                        //            dic[item.Key] = null;
                        //        }
                        //        else
                        //        {
                        //            dic[item.Key] = cell.Y;
                        //        }
                        //    }
                        //}
                        //else
                        //{
                        //    //業務版
                        //    if (cell == null)
                        //    {
                        //        dic[item.Key] = null;
                        //    }
                        //    else
                        //    {
                        //        dic[item.Key] = cell.Y;
                        //    }

                        //}

                        if (aspNetUser.UserId != 0 && !Fromtwn)
                        {
                            if (cell == null)
                            {
                                dic[item.Key] = null;
                            }
                            else
                            {
                                if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && cell.X >= aspNetUser.StartDate && cell.X <= aspNetUser.EndDate)
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && cell.X >= aspNetUser.StartDate)
                                    || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && cell.X <= aspNetUser.EndDate))
                                {
                                    dic[item.Key] = (cell == null) ? null : cell.Y;
                                }
                                else
                                {
                                    dic[item.Key] = null;
                                }
                            }
                        }
                        else
                        {
                            dic[item.Key] = (cell == null) ? null : cell.Y;
                        }

                        #endregion



                    }

                    bool allValues = dic.Values.All(value => value == null);
                    if (allValues) return Json(Failed(message: "資料尚未開放"));
                }
                else
                {
                    #region 水號過戶判斷
                    //if (aspNetUser.UserId != 0)
                    //{
                    //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                    //    {
                    //        if ( !(Cdate >= aspNetUser.StartDate) )
                    //        {
                    //            return Json(Failed(message: "查無尚未開放"));
                    //        }

                    //    }
                    //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) )
                    //    {
                    //        if (!(Cdate >= aspNetUser.StartDate) || !(Cdate <= aspNetUser.EndDate))
                    //        {
                    //            return Json(Failed(message: "查無尚未開放"));
                    //        }
                    //    }
                    //}
                    #endregion

                    var dayresultTask = await dashboardService.LitedPhMeterRecordListNew(Cdate, aspNetUser.CurrentWaterNo);
                    var day2result = await dashboardService.LitedPhMeterRecordListNew(Cdate.AddDays(-1), aspNetUser.CurrentWaterNo);
                    var dayresult = dayresultTask;

                    if (dayresult == null) return Json(Failed(message: "資料尚未開放"));
                    if (dayresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

                    foreach (var item in dic)
                    {
                        var takeone = dayresult.FirstOrDefault(c => c.REC_DATE_TIME.ToString("yyyy/MM/dd HH:mm") == item.Key);

                        #region 水號過戶判斷
                        //if (aspNetUser.UserId != 0)
                        //{
                        //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                        //    {
                        //        if (takeone != null)
                        //        {
                        //            if ((takeone.REC_DATE_TIME >= aspNetUser.StartDate))
                        //            {
                        //                dic[item.Key] = takeone.AMOUNT;
                        //            }

                        //        }


                        //    }
                        //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                        //    {
                        //        if (takeone != null)
                        //        {
                        //            if ((takeone.REC_DATE_TIME >= aspNetUser.StartDate) && (takeone.REC_DATE_TIME <= aspNetUser.EndDate))
                        //            {
                        //                dic[item.Key] = takeone.AMOUNT;
                        //            }
                        //        }

                        //    }
                        //    else
                        //    {
                        //        //非過戶
                        //        if (takeone != null)
                        //        {
                        //            dic[item.Key] = takeone.AMOUNT;
                        //        }
                        //    }
                        //}
                        //else
                        //{
                        //    //業務版
                        //    if (takeone != null)
                        //    {
                        //        dic[item.Key] = takeone.AMOUNT;
                        //    }

                        //}

                        if (takeone != null)
                        {
                            if (aspNetUser.UserId != 0 && !Fromtwn)
                            {
                                if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && takeone.REC_DATE_TIME >= aspNetUser.StartDate && takeone.REC_DATE_TIME <= aspNetUser.EndDate)
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && takeone.REC_DATE_TIME >= aspNetUser.StartDate)
                                    || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && takeone.REC_DATE_TIME <= aspNetUser.EndDate))
                                {
                                    dic[item.Key] = takeone.AMOUNT;
                                }
                            }
                            else
                            {
                                //業務版
                                dic[item.Key] = takeone.AMOUNT;
                            }
                        }
                        #endregion

                    }

                    foreach (var item in dic)
                    {
                        var takeone = day2result.FirstOrDefault(c => c.REC_DATE_TIME.ToString("yyyy/MM/dd HH:mm") == item.Key);

                        #region 水號過戶判斷
                        //if (aspNetUser.UserId != 0)
                        //{
                        //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                        //    {
                        //        if (takeone != null)
                        //        {
                        //            if ((takeone.REC_DATE_TIME >= aspNetUser.StartDate))
                        //            {
                        //                dic[item.Key] = takeone.AMOUNT;
                        //            }

                        //        }


                        //    }
                        //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                        //    {
                        //        if (takeone != null)
                        //        {
                        //            if ((takeone.REC_DATE_TIME >= aspNetUser.StartDate) && (takeone.REC_DATE_TIME <= aspNetUser.EndDate))
                        //            {
                        //                dic[item.Key] = takeone.AMOUNT;
                        //            }
                        //        }

                        //    }
                        //    else
                        //    {
                        //        //非過戶
                        //        if (takeone != null)
                        //        {
                        //            dic[item.Key] = takeone.AMOUNT;
                        //        }
                        //    }
                        //}
                        //else
                        //{
                        //    //業務版
                        //    if (takeone != null)
                        //    {
                        //        dic[item.Key] = takeone.AMOUNT;
                        //    }

                        //}

                        if (takeone != null)
                        {
                            if (aspNetUser.UserId != 0 && !Fromtwn)
                            {
                                if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && takeone.REC_DATE_TIME >= aspNetUser.StartDate && takeone.REC_DATE_TIME <= aspNetUser.EndDate)
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && takeone.REC_DATE_TIME >= aspNetUser.StartDate)
                                    || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && takeone.REC_DATE_TIME <= aspNetUser.EndDate))
                                {
                                    dic[item.Key] = takeone.AMOUNT;
                                }
                            }
                            else
                            {
                                //業務版
                                dic[item.Key] = takeone.AMOUNT;
                            }
                        }
                        #endregion

                    }
                    bool allValues = dic.Values.All(value => value == null);
                    if (allValues) return Json(Failed(message: "資料尚未開放"));
                }

                //補業務版的洞
                if (aspNetUser.UserId == 0 && Fromtwn)
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
                #region 水號過戶判斷
                //if (aspNetUser.UserId != 0)
                //{
                //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                //    {
                //        if (item.A_DATE >= aspNetUser.StartDate)
                //        {
                //            calendarData.Add(new fullcalendar
                //            {
                //                id = item.B_NOTE_SN.ToString(),
                //                title = item.NOTE,
                //                start = item.A_DATE.Value.ToString("yyyy-MM-dd"),
                //                NoteDate = item.A_DATE.Value.ToString("yyyy-MM-dd")
                //            });
                //        }

                //    }
                //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                //    {
                //        if ((item.A_DATE >= aspNetUser.StartDate) && (item.A_DATE <= aspNetUser.EndDate))
                //        {
                //            calendarData.Add(new fullcalendar
                //            {
                //                id = item.B_NOTE_SN.ToString(),
                //                title = item.NOTE,
                //                start = item.A_DATE.Value.ToString("yyyy-MM-dd"),
                //                NoteDate = item.A_DATE.Value.ToString("yyyy-MM-dd")
                //            });
                //        }
                //    }
                //    else
                //    {
                //        calendarData.Add(new fullcalendar
                //        {
                //            id = item.B_NOTE_SN.ToString(),
                //            title = item.NOTE,
                //            start = item.A_DATE.Value.ToString("yyyy-MM-dd"),
                //            NoteDate = item.A_DATE.Value.ToString("yyyy-MM-dd")
                //        });

                //    }
                //}
                //else
                //{
                //    //業務版
                //    calendarData.Add(new fullcalendar
                //    {
                //        id = item.B_NOTE_SN.ToString(),
                //        title = item.NOTE,
                //        start = item.A_DATE.Value.ToString("yyyy-MM-dd"),
                //        NoteDate = item.A_DATE.Value.ToString("yyyy-MM-dd")
                //    });
                //}

                //if ( (aspNetUser.UserId != 0 && string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                //    || (aspNetUser.UserId != 0 && !string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.A_DATE >= aspNetUser.StartDate)
                //    || (aspNetUser.UserId != 0 && !string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.A_DATE >= aspNetUser.StartDate && item.A_DATE <= aspNetUser.EndDate)
                //    || (aspNetUser.UserId != 0 && string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.A_DATE <= aspNetUser.EndDate)
                //    || (aspNetUser.UserId == 0))
                //{
                //    calendarData.Add(new fullcalendar
                //    {
                //        id = item.B_NOTE_SN.ToString(),
                //        title = item.NOTE,
                //        start = item.A_DATE.Value.ToString("yyyy-MM-dd"),
                //        NoteDate = item.A_DATE.Value.ToString("yyyy-MM-dd")
                //    });
                //}


                if (aspNetUser.UserId != 0)
                {

                    if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                              || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.A_DATE >= aspNetUser.StartDate && item.A_DATE <= aspNetUser.EndDate)
                              || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.A_DATE >= aspNetUser.StartDate)
                              || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.A_DATE <= aspNetUser.EndDate))
                    {

                        calendarData.Add(new fullcalendar
                        {
                            id = item.B_NOTE_SN.ToString(),
                            title = item.NOTE,
                            start = item.A_DATE.Value.ToString("yyyy-MM-dd"),
                            NoteDate = item.A_DATE.Value.ToString("yyyy-MM-dd")
                        });
                    }

                }
                else
                {
                    //業務版
                    calendarData.Add(new fullcalendar
                    {
                        id = item.B_NOTE_SN.ToString(),
                        title = item.NOTE,
                        start = item.A_DATE.Value.ToString("yyyy-MM-dd"),
                        NoteDate = item.A_DATE.Value.ToString("yyyy-MM-dd")
                    });
                }

                #endregion

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
            var thisyear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt, "1").OrderBy(c => c.X).ToList();//今年
            var nextyear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate.AddYears(-1), timespilt, "1").OrderBy(c => c.X).ToList();//去年同期
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


                #region 水號過戶判斷
                //if (aspNetUser.UserId != 0)
                //{
                //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                //    {
                //        if ( !( Cdate >= aspNetUser.StartDate ) )
                //        {
                //            return Json(Failed(message: "查無尚未開放"));
                //        }

                //    }
                //    else if ( !string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) )
                //    {
                //        if (!(Cdate >= aspNetUser.StartDate) || !(Cdate <= aspNetUser.EndDate))
                //        {
                //            return Json(Failed(message: "查無尚未開放"));
                //        }
                //    }
                //} 
                #endregion


                string XrayUnit = "";

                switch (timespilt)
                {
                    case "day":
                        // 前六天都要取資料庫
                        var ts = Cdate.Date - DateTime.Now;
                        if (ts.Days >= -6)
                        {
                            List<Models.SqlFunctions.F_B_CHART> dayresult = new List<Models.SqlFunctions.F_B_CHART>();

                            //補業務版的洞
                            if (aspNetUser.UserId == 0)
                            {
                                //前天去撈資料庫
                                dayresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper(), "0").OrderBy(c => c.X).ToList();
                            }
                            else
                            {
                                //前天去撈資料庫
                                dayresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper(), "1").OrderBy(c => c.X).ToList();
                            }

                            if (dayresult == null) return Json(Failed(message: "資料尚未開放"));
                            if (dayresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

                            DateTime current = new DateTime(2000, 4, 1);

                            for (int i = 0; i < 24; i++)
                            {
                                dic.Add(current.AddHours(i).ToString("HH:mm"), null);
                            }

                            foreach (var item in dayresult)
                            {
                                #region 水號過戶判斷
                                //if (aspNetUser.UserId != 0)
                                //{
                                //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                //    {
                                //        if (!(DateTime.Parse(item.X) >= aspNetUser.StartDate))
                                //        {
                                //            var temp = item.X.Substring(11, 5);
                                //            dic[item.X.Substring(11, 5)] = null;
                                //        }
                                //        else
                                //        {
                                //            var temp0 = item.X.Substring(11, 5);
                                //            if (dic.ContainsKey(item.X.Substring(11, 5)))
                                //            {
                                //                var temp = item.X.Substring(11, 5);
                                //                dic[item.X.Substring(11, 5)] = item.Y;
                                //            }
                                //            else
                                //            {
                                //                var temp = item.X.Substring(11, 5);
                                //                dic[item.X.Substring(11, 5)] = null;
                                //            }
                                //        }

                                //    }
                                //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                //    {
                                //        if (!(DateTime.Parse(item.X) >= aspNetUser.StartDate) || !(DateTime.Parse(item.X) <= aspNetUser.EndDate))
                                //        {
                                //            var temp = item.X.Substring(11, 5);
                                //            dic[item.X.Substring(11, 5)] = null;
                                //        }
                                //        else
                                //        {
                                //            var temp0 = item.X.Substring(11, 5);
                                //            if (dic.ContainsKey(item.X.Substring(11, 5)))
                                //            {
                                //                var temp = item.X.Substring(11, 5);
                                //                dic[item.X.Substring(11, 5)] = item.Y;
                                //            }
                                //            else
                                //            {
                                //                var temp = item.X.Substring(11, 5);
                                //                dic[item.X.Substring(11, 5)] = null;
                                //            }

                                //        }
                                //    }
                                //    else
                                //    {
                                //        //非過戶
                                //        var temp0 = item.X.Substring(11, 5);
                                //        if (dic.ContainsKey(item.X.Substring(11, 5)))
                                //        {
                                //            var temp = item.X.Substring(11, 5);
                                //            dic[item.X.Substring(11, 5)] = item.Y;
                                //        }
                                //        else
                                //        {
                                //            var temp = item.X.Substring(11, 5);
                                //            dic[item.X.Substring(11, 5)] = null;
                                //        }
                                //    }
                                //}
                                //else
                                //{
                                //業務版
                                //var temp0 = item.X.Substring(11, 5);
                                //if (dic.ContainsKey(item.X.Substring(11, 5)))
                                //{
                                //    var temp = item.X.Substring(11, 5);
                                //    dic[item.X.Substring(11, 5)] = item.Y;
                                //}
                                //else
                                //{
                                //    var temp = item.X.Substring(11, 5);
                                //    dic[item.X.Substring(11, 5)] = null;
                                //}

                                //}


                                if (aspNetUser.UserId != 0)
                                {

                                    bool isInDateRange =
                                        string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                        || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(item.X) >= aspNetUser.StartDate)
                                        || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(item.X) >= aspNetUser.StartDate && DateTime.Parse(item.X) <= aspNetUser.EndDate)
                                        || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(item.X) <= aspNetUser.EndDate);

                                    if (isInDateRange)
                                    {
                                        if (dic.ContainsKey(item.X.Substring(11, 5)))
                                        {
                                            var temp = item.X.Substring(11, 5);
                                            dic[item.X.Substring(11, 5)] = item.Y;
                                        }
                                        else
                                        {
                                            var temp = item.X.Substring(11, 5);
                                            dic[item.X.Substring(11, 5)] = null;
                                        }
                                    }
                                    else
                                    {
                                        var temp = item.X.Substring(11, 5);
                                        dic[item.X.Substring(11, 5)] = null;
                                    }
                                }
                                else
                                {
                                    //業務版
                                    var temp0 = item.X.Substring(11, 5);
                                    if (dic.ContainsKey(item.X.Substring(11, 5)))
                                    {
                                        var temp = item.X.Substring(11, 5);
                                        dic[item.X.Substring(11, 5)] = item.Y;
                                    }
                                    else
                                    {
                                        var temp = item.X.Substring(11, 5);
                                        dic[item.X.Substring(11, 5)] = null;
                                    }
                                }
                                #endregion
                            }

                        }
                        else
                        {
                            //大前天還要取資料庫裡面的一筆去比對前天的SQLite，很多邊緣條件那有辦法嗎?沒辦法
                            float? geYesterdayLastAMOUNT = null;
                            //if (Cdate.Date == DateTime.Now.AddDays(-2).Date)
                            //{
                            //    var dayresultGetLast = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate.AddDays(1), timespilt.ToUpper(),"1").OrderBy(c => c.X).ToList();
                            //    var getYesterdayLastValue = dayresultGetLast.FirstOrDefault();
                            //    if (getYesterdayLastValue != null)
                            //    {
                            //        geYesterdayLastAMOUNT = getYesterdayLastValue.Y;
                            //    }
                            //}

                            if (Cdate.Date == DateTime.Now.AddDays(-2).Date)
                            {
                                var dayresultGetLast = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate.AddDays(1), timespilt.ToUpper(), "1").OrderBy(c => c.X).ToList();
                                var getYesterdayLastValue = dayresultGetLast.FirstOrDefault();
                                if (getYesterdayLastValue != null)
                                {

                                    #region 水號過戶判斷
                                    if (aspNetUser.UserId != 0)
                                    {

                                        if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                         || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(getYesterdayLastValue.X) >= aspNetUser.StartDate && DateTime.Parse(getYesterdayLastValue.X) <= aspNetUser.EndDate)
                                         || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(getYesterdayLastValue.X) >= aspNetUser.StartDate)
                                         || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(getYesterdayLastValue.X) <= aspNetUser.EndDate))
                                        {
                                            geYesterdayLastAMOUNT = getYesterdayLastValue.Y;
                                        }
                                        else
                                        {
                                            //不用給值
                                        }
                                    }
                                    else
                                    {
                                        // 業務版
                                        geYesterdayLastAMOUNT = getYesterdayLastValue.Y;
                                    }
                                    #endregion
                                }
                            }

                            //大前天之前去找SQLite
                            var dayresult = await dashboardService.LitedPhMeterRecordList(Cdate, aspNetUser.CurrentWaterNo);

                            if (dayresult == null) return Json(Failed(message: "資料尚未開放"));
                            if (dayresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

                            foreach (var item in dayresult)
                            {
                                #region 水號過戶判斷
                                //if (aspNetUser.UserId != 0)
                                //{
                                //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                //    {
                                //        if (!(item.REC_DATE_TIME >= aspNetUser.StartDate))
                                //        {
                                //            dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)null);
                                //        }
                                //        else
                                //        {
                                //            dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);
                                //        }

                                //    }
                                //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                //    {
                                //        if (!(item.REC_DATE_TIME >= aspNetUser.StartDate) || !(item.REC_DATE_TIME <= aspNetUser.EndDate))
                                //        {
                                //            dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)null);
                                //        }
                                //        else
                                //        {
                                //            dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);
                                //        }
                                //    }
                                //    else
                                //    {
                                //        //非過戶
                                //        dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);
                                //    }
                                //}
                                //else
                                //{
                                //    //業務版
                                //    dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);

                                //}

                                //if (aspNetUser.UserId != 0)
                                //{

                                //    bool isTransfer = aspNetUser.StartDate.HasValue || aspNetUser.EndDate.HasValue;

                                //    if (!isTransfer || (aspNetUser.StartDate.HasValue && item.REC_DATE_TIME >= aspNetUser.StartDate.Value) &&
                                //                       (aspNetUser.EndDate.HasValue && item.REC_DATE_TIME <= aspNetUser.EndDate.Value))
                                //    {
                                //        dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);
                                //    }
                                //    else
                                //    {
                                //        dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)null);
                                //    }
                                //}
                                //else
                                //{
                                //    // 業務版
                                //    dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);
                                //}


                                if (aspNetUser.UserId != 0)
                                {

                                    if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                     || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.REC_DATE_TIME >= aspNetUser.StartDate && item.REC_DATE_TIME <= aspNetUser.EndDate)
                                     || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.REC_DATE_TIME >= aspNetUser.StartDate)
                                     || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.REC_DATE_TIME <= aspNetUser.EndDate))
                                    {
                                        dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);
                                    }
                                    else
                                    {
                                        dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)null);
                                    }
                                }
                                else
                                {
                                    // 業務版
                                    dic.Add(item.REC_DATE_TIME.ToString("HH:mm"), (float?)item.AMOUNT);
                                }

                                #endregion

                            }

                            //大前天還要取資料庫裡面的一筆去比對前天的SQLite，很多邊緣條件那有辦法嗎?沒辦法
                            if (geYesterdayLastAMOUNT != null)
                            {
                                #region 水號過戶判斷
                                //if (aspNetUser.UserId != 0)
                                //{
                                //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                //    {
                                //        dic["23:00"] = null;
                                //    }
                                //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                //    {
                                //        dic["23:00"] = null;
                                //    }
                                //    else
                                //    {
                                //        //非過戶
                                //        dic["23:00"] = geYesterdayLastAMOUNT;
                                //    }
                                //}
                                //else
                                //{
                                //    //業務版
                                //    dic["23:00"] = geYesterdayLastAMOUNT;

                                //}
                                #endregion

                                dic["23:00"] = geYesterdayLastAMOUNT;

                            }
                        }

                        XrayUnit = "時間(小時)";
                        break;

                    case "week":

                        var weekresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper(), "1").OrderBy(c => c.X).ToList();
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
                                    #region 水號過戶判斷
                                    //if (aspNetUser.UserId != 0)
                                    //{
                                    //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                    //    {
                                    //        if (!(DateTime.Parse(getOneWeekResult.X) >= aspNetUser.StartDate))
                                    //        {
                                    //            dic[cell.Key] = null;
                                    //        }
                                    //        else
                                    //        {
                                    //            dic[cell.Key] = getOneWeekResult.Y;
                                    //        }

                                    //    }
                                    //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                    //    {
                                    //        if (!(DateTime.Parse(getOneWeekResult.X) >= aspNetUser.StartDate) || !(DateTime.Parse(getOneWeekResult.X) <= aspNetUser.EndDate))
                                    //        {
                                    //            dic[cell.Key] = null;
                                    //        }
                                    //        else
                                    //        {
                                    //            dic[cell.Key] = getOneWeekResult.Y;
                                    //        }
                                    //    }
                                    //    else
                                    //    {
                                    //        //非過戶
                                    //        dic[cell.Key] = getOneWeekResult.Y;
                                    //    }
                                    //}
                                    //else
                                    //{
                                    //    //業務版
                                    //    dic[cell.Key] = getOneWeekResult.Y;

                                    //}


                                    if (aspNetUser.UserId != 0)
                                    {
                                        //if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                        //{
                                        //    if (!(DateTime.Parse(getOneWeekResult.X) >= aspNetUser.StartDate))
                                        //    {
                                        //        dic[cell.Key] = null;
                                        //    }
                                        //    else
                                        //    {
                                        //        dic[cell.Key] = getOneWeekResult.Y;
                                        //    }

                                        //}
                                        //else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                                        //{
                                        //    if (!(DateTime.Parse(getOneWeekResult.X) >= aspNetUser.StartDate) || !(DateTime.Parse(getOneWeekResult.X) <= aspNetUser.EndDate))
                                        //    {
                                        //        dic[cell.Key] = null;
                                        //    }
                                        //    else
                                        //    {
                                        //        dic[cell.Key] = getOneWeekResult.Y;
                                        //    }
                                        //}
                                        //else
                                        //{
                                        //    //非過戶
                                        //    dic[cell.Key] = getOneWeekResult.Y;
                                        //}


                                        if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                     || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(getOneWeekResult.X) >= aspNetUser.StartDate && DateTime.Parse(getOneWeekResult.X) <= aspNetUser.EndDate)
                                     || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(getOneWeekResult.X) >= aspNetUser.StartDate)
                                     || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(getOneWeekResult.X) <= aspNetUser.EndDate))
                                        {
                                            dic[cell.Key] = getOneWeekResult.Y;
                                        }
                                        else
                                        {
                                            dic[cell.Key] = null;
                                        }

                                    }
                                    else
                                    {
                                        //業務版
                                        dic[cell.Key] = getOneWeekResult.Y;

                                    }
                                    #endregion


                                }
                            }
                        }
                        XrayUnit = "時間(日期)";
                        break;

                    case "month":

                        var monthresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper(), "1").OrderBy(c => c.X);

                        if (monthresult == null) return Json(Failed(message: "資料尚未開放"));
                        if (monthresult.Count() <= 0) return Json(Failed(message: "查無尚未開放"));

                        int days = DateTime.DaysInMonth(Cdate.Year, Cdate.Month);
                        for (int i = 1; i <= days; i++)
                        {
                            dic.Add(new DateTime(Cdate.Year, Cdate.Month, i).ToString("yyyy-MM-dd"), null);
                        }

                        foreach (var item in monthresult)
                        {
                            #region 水號過戶判斷
                            //if (aspNetUser.UserId != 0)
                            //{
                            //    if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                            //    {
                            //        if (!(DateTime.Parse(item.X) >= aspNetUser.StartDate))
                            //        {
                            //            dic[item.X.ToString()] = null;
                            //        }
                            //        else
                            //        {
                            //            dic[item.X.ToString()] = item.Y;
                            //        }

                            //    }
                            //    else if (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()))
                            //    {
                            //        if (!(DateTime.Parse(item.X) >= aspNetUser.StartDate) || !(DateTime.Parse(item.X) <= aspNetUser.EndDate))
                            //        {
                            //            dic[item.X.ToString()] = null;
                            //        }
                            //        else
                            //        {
                            //            dic[item.X.ToString()] = item.Y;
                            //        }
                            //    }
                            //    else
                            //    {
                            //        //非過戶
                            //        dic[item.X.ToString()] = item.Y;
                            //    }
                            //}
                            //else
                            //{
                            //    //業務版
                            //    dic[item.X.ToString()] = item.Y;

                            //}


                            if (aspNetUser.UserId != 0)
                            {
                                if (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                     || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(item.X) >= aspNetUser.StartDate && DateTime.Parse(item.X) <= aspNetUser.EndDate)
                                     || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(item.X) >= aspNetUser.StartDate)
                                     || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && DateTime.Parse(item.X) <= aspNetUser.EndDate))
                                {
                                    dic[item.X.ToString()] = item.Y;
                                }
                                else
                                {
                                    dic[item.X.ToString()] = null;
                                }
                            }
                            else
                            {
                                //業務版
                                dic[item.X.ToString()] = item.Y;

                            }
                            #endregion
                        }

                        XrayUnit = $"時間({Cdate.Month}月/號)";
                        break;
                }

                bool allValues = dic.Values.All(value => value == null);
                if (allValues) return Json(Failed(message: "資料尚未開放"));

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
                Name = aspNetUser.Name,
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
            if (WaterNos == "7D767220354") WaterNos = "7D767190014";
            if (WaterNos == "7D760002010") WaterNos = "7D760003007";

            if (aspNetUser.UserId != null)
            {
                var result = dashboardService.ListedWaterNOBySN(WaterNos);
                //HttpContext.Session.SetString("StartDate", result.ST_DATE.ToString());
                //HttpContext.Session.SetString("EndDate", result.EN_DATE.ToString());
                if (result != null && string.IsNullOrEmpty(result.ST_DATE.ToString()))
                {
                    HttpContext.Session.SetString("StartDate", result.ST_DATE.ToString());
                }
                if (result != null && string.IsNullOrEmpty(result.EN_DATE.ToString()))
                {
                    HttpContext.Session.SetString("EndDate", result.EN_DATE.ToString());
                }
            }

            HttpContext.Session.SetString("CurrentWaterNo", WaterNos);
            return Json(Success(message: $"已切換至{WaterNos}"));
        }

        /// <summary>
        /// 登入後若INITIAL_LOGIN =0時需要修改密碼
        /// </summary>
        /// <returns></returns>
        public IActionResult UpdatePw()
        {
            return View();
        }

        /// <summary>
        /// 登入後若INITIAL_LOGIN =0時需要修改密碼
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult UpdatePw(UpdatePwVm vm)
        {
            try
            {
                if (ModelState.IsValid)
                {
                    if (aspNetUser.UserId != null)
                    {
                        var result = dashboardService.GetAccountBySN(aspNetUser.UserId.Value);
                        if (result != null)
                        {
                            if (!PasswordHashUtil.VerifyPasswordOrLegacyAes(vm.Pwd, result.APWD))
                            {
                                ModelState.AddModelError("Pwd", "舊密碼輸入錯誤");
                            }
                        }
                    }
                    else
                    {
                        return Json(Failed(message: "系統帳號尚未開通"));
                    }

                    if (!CommonFunc.magicword(vm.PasswordNew1))
                    {
                        ModelState.AddModelError("PasswordNew1", "密碼長度需為10至20位元，包含大小寫英文字母、特殊符號、數字");
                    }

                    if (!CommonFunc.magicword(vm.PasswordNew2))
                    {
                        ModelState.AddModelError("PasswordNew2", "密碼長度需為10至20位元，包含大小寫英文字母、特殊符號、數字");
                    }

                    if (vm.PasswordNew1 != vm.PasswordNew2)
                    {
                        ModelState.AddModelError("PasswordNew1", "新密碼和再確認新密碼輸入不一樣");
                        ModelState.AddModelError("PasswordNew2", "新密碼和再確認新密碼輸入不一樣");

                    }

                    if (!ModelState.IsValid)
                    {

                        return Json(ValidationFailed(
                           ModelState.Where(x => x.Value.Errors.Count > 0)
                          .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                          ), "欄位錯誤"));
                    }

                    var result2 = dashboardService.UpdateAccountInfo(vm, aspNetUser.UserId.Value);

                    if (result2 >= 1)
                    {
                        return Json(Success("更新成功"));
                    }
                    else
                        return Json(Failed(message: "更新失敗"));


                }
                else
                {
                    return Json(ValidationFailed(
                      ModelState.Where(x => x.Value.Errors.Count > 0)
                     .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                     ), "欄位錯誤"));
                }

            }
            catch (Exception ex)
            {
                return Json(Failed("系統錯誤"));
            }
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

        /// <summary>
        /// 點擊用戶記事後右邊的圖表
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public async Task<IActionResult> WaterNoteTableChart2(string startDate, string endDate, string Type, string TimeType)
        {
            // 定義 Type 對應的時間格式
            string? format = Type switch
            {
                "hour" => "yyyy/MM/dd HH:mm",
                "day" => "yyyy/MM/dd",
                "week" => "yyyy/MM",
                "month" => "yyyy/MM",
                "year" => "yyyy",
                _ => null
            };

            if (format == null)
            {
                return Json(Failed("請選擇X軸維度!!"));
            }

            // 驗證 Sdate 和 Edate 是否符合對應的時間格式
            if (!DateTime.TryParseExact(startDate, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime Sdate) ||
                !DateTime.TryParseExact(endDate, format, CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime Edate))
            {
                return Json(Failed($"時間格式不正確，請使用 {format} 格式"));
            }

            // 進一步的判斷邏輯，處理 Type = "hour"
            if (Type == "hour")
            {
                //// 檢查 startDate 和 endDate 之間是否等於或超過 24 小時
                //if ((Edate - Sdate).TotalHours >= 24)
                //{
                //    return Json(Failed("開始時間和結束時間的差距不能等於或超過 24 小時"));
                //}

                // 檢查開始時間和結束時間是否為同一天，且時間差不能等於或超過 24 小時
                if (Sdate.Date != Edate.Date || (Edate - Sdate).TotalHours >= 24)
                {
                    return Json(Failed("開始時間和結束時間必須在同一天，且間隔不能等於或超過 24 小時"));
                }
            }

            // 檢查 Sdate 和 Edate 之間的時間差是否超過 3 年
            if ((Edate - Sdate).TotalDays > 365 * 3) // 3 年大約是 365*3 天
            {
                return Json(Failed("開始時間和結束時間的差距不能超過 3 年"));
            }

            if (Type.ToLower() == "hour")
            {
                // 當 Type 為 hour 時，不論傳入 Sdate/Edate 為何，最後都補上 2025/02/05 00:00:00 ~ 23:59:59
                if (string.IsNullOrEmpty(TimeType))
                {
                    Sdate = new DateTime(Sdate.Year, Sdate.Month, Sdate.Day, Sdate.Hour, 0, 0);
                    Edate = new DateTime(Edate.Year, Edate.Month, Edate.Day, Edate.Hour, 59, 59);
                }
                else if (TimeType.ToLower() == "day")
                {
                    // 先減一天（依傳入的 Sdate/Edate），接著補上固定日期
                    Sdate = Sdate.AddDays(-1);
                    Edate = Edate.AddDays(-1);
                    Sdate = new DateTime(Sdate.Year, Sdate.Month, Sdate.Day, Sdate.Hour, 0, 0);
                    Edate = new DateTime(Edate.Year, Edate.Month, Edate.Day, Edate.Hour, 59, 59);
                }
                else if (TimeType.ToLower() == "month")
                {
                    // 先減一個月，再補上固定日期
                    Sdate = Sdate.AddMonths(-1);
                    Edate = Edate.AddMonths(-1);
                    Sdate = new DateTime(Sdate.Year, Sdate.Month, Sdate.Day, Sdate.Hour, 0, 0);
                    Edate = new DateTime(Edate.Year, Edate.Month, Edate.Day, Edate.Hour, 59, 59);
                }
                else if (TimeType.ToLower() == "year")
                {
                    // 先減一年，再補上固定日期
                    Sdate = Sdate.AddYears(-1);
                    Edate = Edate.AddYears(-1);
                    Sdate = new DateTime(Sdate.Year, Sdate.Month, Sdate.Day, Sdate.Hour, 0, 0);
                    Edate = new DateTime(Edate.Year, Edate.Month, Edate.Day, Edate.Hour, 59, 59);
                }
            }
            else if (Type.ToLower() == "day")
            {
                // 當 Type 為 day 時：
                if (string.IsNullOrEmpty(TimeType))
                {
                    // 若 TimeType 為空，依您例子表示 Sdate 與 Edate 保持原狀
                    // 例如傳入的為 2025/02/05（日期不含時間）就保持不變
                    // 若您有其他需求，可在此處做調整
                }
                else if (TimeType.ToLower() == "month")
                {
                    // 將 Sdate 與 Edate 減一個月（保留日期部分）
                    Sdate = Sdate.AddMonths(-1);
                    Edate = Edate.AddMonths(-1);
                }
                else if (TimeType.ToLower() == "year")
                {
                    // 將 Sdate 與 Edate 減一年
                    Sdate = Sdate.AddYears(-1);
                    Edate = Edate.AddYears(-1);
                }

                //// 若希望在「日」型查詢時，也能依據月份補上該月的第一天與最後一天，
                //// 可依下列邏輯判斷（例如當傳入 Sdate 與 Edate 只指定了月份）
                //// 假設您希望：若 Sdate 與 Edate 分別為 2025/02（無特定日），則補上 2025/02/01 ~ 2025/02/28
                //// 這裡以判斷傳入的日期是否為該月的第一天與最後一天來示意
                //if (Sdate.Day != 1 || Edate.Day != DateTime.DaysInMonth(Edate.Year, Edate.Month))
                //{
                //    // 如需要補上「月初」與「月尾」的情況，可加上此判斷（請根據實際需求啟用或移除此段）
                //    // 範例：假設若查詢條件為某個月份的查詢，就以該月第一天與最後一天為範圍
                //    // 這裡僅示範如何取出該月的第一、最後一天
                //    int daysInMonth = DateTime.DaysInMonth(Sdate.Year, Sdate.Month);
                //    Sdate = new DateTime(Sdate.Year, Sdate.Month, 1);
                //    Edate = new DateTime(Edate.Year, Edate.Month, daysInMonth);
                //}
            }
            else if (Type.ToLower() == "week")
            {
                // 當 Type 為 week 時：
                if (string.IsNullOrEmpty(TimeType))
                {
                    // 假設傳入 Sdate 與 Edate的年份與月份代表欲查詢的月份，
                    // 補上該月的第一天與最後一天
                    int daysInMonth = DateTime.DaysInMonth(Edate.Year, Edate.Month);
                    Sdate = new DateTime(Sdate.Year, Sdate.Month, 1);
                    Edate = new DateTime(Edate.Year, Edate.Month, daysInMonth);
                }
                else if (TimeType.ToLower() == "year")
                {
                    // 先減一年，再取出該月的第一天與最後一天
                    Sdate = Sdate.AddYears(-1);
                    Edate = Edate.AddYears(-1);
                    int daysInMonth = DateTime.DaysInMonth(Edate.Year, Edate.Month);
                    Sdate = new DateTime(Sdate.Year, Sdate.Month, 1);
                    Edate = new DateTime(Edate.Year, Edate.Month, daysInMonth);
                }
            }
            else if (Type.ToLower() == "month")
            {
                // 當 Type 為 week 時：
                if (string.IsNullOrEmpty(TimeType))
                {
                    // 假設傳入 Sdate 與 Edate的年份與月份代表欲查詢的月份，
                    // 補上該月的第一天與最後一天
                    int daysInMonth = DateTime.DaysInMonth(Edate.Year, Edate.Month);
                    Sdate = new DateTime(Sdate.Year, Sdate.Month, 1);
                    Edate = new DateTime(Edate.Year, Edate.Month, daysInMonth);
                }
                else if (TimeType.ToLower() == "year")
                {
                    // 先減一年，再取出該月的第一天與最後一天
                    Sdate = Sdate.AddYears(-1);
                    Edate = Edate.AddYears(-1);
                    int daysInMonth = DateTime.DaysInMonth(Edate.Year, Edate.Month);
                    Sdate = new DateTime(Sdate.Year, Sdate.Month, 1);
                    Edate = new DateTime(Edate.Year, Edate.Month, daysInMonth);
                }

            }
            else if (Type.ToLower() == "year")
            {
                Sdate = new DateTime(Sdate.Year, 1, 1);
                Edate = new DateTime(Edate.Year, 12, 31);
            }

            try
            {

                // 先建立一個 Dictionary 來存放時間點
                Dictionary<string, decimal?> dic = new Dictionary<string, decimal?>();
                List<F_B_CHART2> lastSixDaysData = new List<F_B_CHART2>();
                List<A_PH_METER_RECORD_LIST> historyData = new List<A_PH_METER_RECORD_LIST>();
                List<F_B_CHART2> finalResult = new List<F_B_CHART2>();

                switch (Type.ToLower())
                {
                    case "hour":
                        // 讀取數據
                        if ((DateTime.Now - Sdate).Days <= 6)
                        {
                            lastSixDaysData = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate, Edate);
                            if (lastSixDaysData != null && lastSixDaysData.Count > 0)
                            {
                                foreach (var item in lastSixDaysData)
                                {
                                    string timeKey = item.X.ToString("HH:mm");
                                    dic[timeKey] = item.Y;
                                }
                            }
                        }
                        else
                        {
                            decimal? geYesterdayLastAMOUNT = null;

                            if (Sdate.Date == DateTime.Now.AddDays(-2).Date)
                            {
                                var lastDayData = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate.AddDays(1), Edate.AddDays(1)).OrderBy(x => x.X).ToList();
                                var getLastValue = lastDayData.FirstOrDefault();
                                if (getLastValue != null)
                                {
                                    geYesterdayLastAMOUNT = getLastValue.Y;
                                }
                            }

                            historyData = await dashboardService.LitedPhMeterRecordList(Sdate, aspNetUser.CurrentWaterNo);
                            if (historyData != null && historyData.Count > 0)
                            {
                                foreach (var item in historyData)
                                {
                                    string timeKey = item.REC_DATE_TIME.ToString("HH:mm");
                                    dic[timeKey] = item.AMOUNT;
                                }
                            }

                            if (geYesterdayLastAMOUNT != null)
                            {
                                dic["23:00"] = geYesterdayLastAMOUNT;
                            }
                        }

                        //// 產生完整的時間點範圍（24 小時，每小時一筆）
                        //for (int i = 0; i < 24; i++)
                        //{
                        //    string timeKey = i.ToString("D2") + ":00"; // 00:00, 01:00, ..., 23:00
                        //    if (!dic.ContainsKey(timeKey))
                        //    {
                        //        dic[timeKey] = 0;  // 預設為 0，確保有數據
                        //    }
                        //}

                        //// 確保有基準時間格式
                        //List<F_B_CHART2> timeBaseSource = lastSixDaysData.Count > 0 ? lastSixDaysData :
                        //                                  (historyData.Count > 0 ? historyData.Select(item => new F_B_CHART2
                        //                                  {
                        //                                      X = item.REC_DATE_TIME,
                        //                                      Y = item.AMOUNT
                        //                                  }).ToList() :
                        //                                  Enumerable.Range(0, 24).Select(i => new F_B_CHART2
                        //                                  {
                        //                                      X = Sdate.Date.AddHours(i),
                        //                                      Y = 0
                        //                                  }).ToList());

                        //finalResult = timeBaseSource.Select(item => new F_B_CHART2
                        //{
                        //    X = item.X,
                        //    Y = dic.ContainsKey(item.X.ToString("HH:mm")) ? dic[item.X.ToString("HH:mm")] : item.Y
                        //}).OrderBy(c => c.X).ToList();

                        //foreach (var key in dic.Keys)
                        //{
                        //    if (!finalResult.Any(x => x.X.ToString("HH:mm") == key))
                        //    {
                        //        finalResult.Add(new F_B_CHART2
                        //        {
                        //            X = Sdate.Date.AddHours(int.Parse(key.Substring(0, 2))),
                        //            Y = dic[key]
                        //        });
                        //    }
                        //}

                        var hourStart = new DateTime(Sdate.Year, Sdate.Month, Sdate.Day, Sdate.Hour, 0, 0);
                        var hourEnd = new DateTime(Edate.Year, Edate.Month, Edate.Day, Edate.Hour, 0, 0);
                        var totalHours = (int)(hourEnd - hourStart).TotalHours + 1;

                        // 確保有基準時間格式（依查詢區間）
                        List<F_B_CHART2> timeBaseSource = lastSixDaysData.Count > 0
                            ? lastSixDaysData.Where(x => x.X >= hourStart && x.X <= hourEnd).ToList()
                            : historyData.Count > 0
                                ? historyData
                                    .Where(x => x.REC_DATE_TIME >= hourStart && x.REC_DATE_TIME <= hourEnd)
                                    .Select(item => new F_B_CHART2
                                    {
                                        X = item.REC_DATE_TIME,
                                        Y = item.AMOUNT
                                    }).ToList()
                                : Enumerable.Range(0, Math.Max(totalHours, 0))
                                    .Select(i => new F_B_CHART2
                                    {
                                        X = hourStart.AddHours(i),
                                        Y = 0
                                    }).ToList();

                        finalResult = timeBaseSource.Select(item => new F_B_CHART2
                        {
                            X = item.X,
                            Y = dic.ContainsKey(item.X.ToString("HH:mm")) ? dic[item.X.ToString("HH:mm")] : item.Y
                        }).OrderBy(c => c.X).ToList();

                        // 補點時限制在查詢區間內，避免超出開始/結束時間
                        foreach (var key in dic.Keys)
                        {
                            var keyHour = int.Parse(key.Substring(0, 2));
                            var keyTime = new DateTime(Sdate.Year, Sdate.Month, Sdate.Day, keyHour, 0, 0);

                            if (keyTime < hourStart || keyTime > hourEnd)
                            {
                                continue;
                            }

                            if (!finalResult.Any(x => x.X.ToString("HH:mm") == key))
                            {
                                finalResult.Add(new F_B_CHART2
                                {
                                    X = keyTime,
                                    Y = dic[key]
                                });
                            }
                        }

                        break;
                    case "day":
                        //finalResult = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate, Edate).OrderBy(x => x.X).ToList();

                        lastSixDaysData = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate, Edate).OrderBy(x => x.X).ToList();
                        // 確保有基準時間格式
                        List<F_B_CHART2> timeBaseSource2 = lastSixDaysData.Count > 0 ? lastSixDaysData : GetEmptyDateRange(Sdate, Edate, "1");
                        finalResult = timeBaseSource2;
                        break;
                    case "week":
                        //finalResult = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate, Edate).OrderBy(x => x.X).ToList();

                        lastSixDaysData = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate, Edate).OrderBy(x => x.X).ToList();
                        // 確保有基準時間格式
                        List<F_B_CHART2> timeBaseSource3 = lastSixDaysData.Count > 0 ? lastSixDaysData : GetEmptyDateRange(Sdate, Edate, "1");
                        finalResult = timeBaseSource3;
                        break;
                    case "month":
                        lastSixDaysData = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate, Edate).OrderBy(x => x.X).ToList();
                        // 確保有基準時間格式
                        List<F_B_CHART2> timeBaseSource4 = lastSixDaysData.Count > 0 ? lastSixDaysData : GetEmptyDateRange(Sdate, Edate, "1");
                        finalResult = timeBaseSource4;
                        break;
                    case "year":
                        //finalResult = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate, Edate).OrderBy(x => x.X).ToList();

                        //lastSixDaysData = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate, Edate)
                        //.Select(x => new F_B_CHART2
                        //{
                        //    X = DateTime.TryParse(x.X.ToString(), out DateTime date) ? date : new DateTime(int.Parse(x.X.ToString()), 1, 1),
                        //    Y = x.Y
                        //}).OrderBy(x => x.X)
                        //.ToList();
                        lastSixDaysData = dashboardService.ListedChart2(aspNetUser.CurrentWaterNo, Type, Sdate, Edate).OrderBy(x => x.X).ToList();
                        // 確保有基準時間格式
                        List<F_B_CHART2> timeBaseSource5 = lastSixDaysData.Count > 0 ? lastSixDaysData : GetEmptyDateRange(Sdate, Edate, "2");
                        finalResult = timeBaseSource5;
                        break;

                }

                #region 水號過戶判斷--濾符合時間條件的數據，並將 Y 四捨五入為整數
                if (aspNetUser.UserId != 0)
                {
                    bool hasStart = aspNetUser.StartDate.HasValue;
                    bool hasEnd = aspNetUser.EndDate.HasValue;

                    // 過濾符合時間條件的數據，並將 Y 四捨五入為整數
                    finalResult = finalResult
                        .Where(item =>
                            (!hasStart && !hasEnd) ||
                            (hasStart && hasEnd && item.X >= aspNetUser.StartDate.Value && item.X <= aspNetUser.EndDate.Value) ||
                            (hasStart && !hasEnd && item.X >= aspNetUser.StartDate.Value) ||
                            (!hasStart && hasEnd && item.X <= aspNetUser.EndDate.Value)
                        )
                        .Select(item => new F_B_CHART2
                        {
                            X = item.X,
                            Y = item.Y.HasValue ? Math.Round(item.Y.Value, 0) : (decimal?)null // 四捨五入為整數
                        })
                        .ToList();
                }
                #endregion

                finalResult = finalResult.OrderBy(x => x.X).ToList();
                List<string> minXValues, maxYValues;
                var minY = finalResult.Min(x => x.Y); // 找出最小的 Y 值
                var maxY = finalResult.Max(x => x.Y); // 找出最大的 Y 值
                if (minY == maxY && minY == 0)
                {
                    minXValues = maxYValues = new List<string>() { "無" };
                }
                else
                {
                    minXValues = finalResult.Where(x => x.Y == minY).Select(x => FormatDateTime(x.X, Type)).ToList(); // 取得所有對應的 X 值
                    maxYValues = finalResult.Where(x => x.Y == maxY).Select(x => FormatDateTime(x.X, Type)).ToList(); // 取得所有對應的 X 值
                }
                object obj = new
                {
                    result = finalResult.Select(item => new F_B_CHART2
                    {
                        X = item.X.AddDays(TimeType?.ToLower() == "day" ? 1 : 0)
                                  .AddMonths(TimeType?.ToLower() == "month" ? 1 : 0)
                                  .AddYears(TimeType?.ToLower() == "year" ? 1 : 0),
                        Y = item.Y
                    }).OrderBy(c => c.X).ToList(),
                    lowData = string.Join("、 ", minXValues),
                    heighData = string.Join("、 ", maxYValues)
                };

                return Json(Success(obj));



            }
            catch (Exception e)
            {
                return Json(Success());
            }
        }

        private List<F_B_CHART2> GetEmptyDateRange(DateTime startDate, DateTime endDate, string type)
        {
            List<F_B_CHART2> result = new List<F_B_CHART2>();

            if (type == "1")
            {
                // 從 startDate 到 endDate 按小時填充日期
                for (DateTime dt = startDate.Date; dt <= endDate; dt = dt.AddDays(1))
                {
                    result.Add(new F_B_CHART2
                    {
                        X = dt, // 日期時間
                        Y = 0   // Y 值為 0
                    });
                }

            }
            else
            {
                // 從 startDate 到 endDate 按小時填充日期
                for (DateTime dt = startDate.Date; dt <= endDate; dt = dt.AddYears(1))
                {
                    result.Add(new F_B_CHART2
                    {
                        X = dt, // 日期時間
                        Y = 0   // Y 值為 0
                    });
                }

            }

            return result;
        }

        // 根據 Type 格式化日期時間
        private string FormatDateTime(DateTime dateTime, string type)
        {
            switch (type.ToLower())
            {
                case "hour":
                    return dateTime.ToString("HH:mm"); // 顯示時:分（例如 00:00）
                case "day":
                    return dateTime.ToString("yyyy/MM/dd"); // 顯示日（例如 2024/01/05）
                case "week":
                    return dateTime.ToString("yyyy/MM/dd"); // 顯示週（例如 2024/01/05）
                case "month":
                    return dateTime.ToString("yyyy/MM"); // 顯示月（例如 2024/01）
                case "year":
                    return dateTime.ToString("yyyy"); // 顯示年（例如 2024）
                default:
                    return dateTime.ToString("yyyy/MM/dd"); // 預設顯示日
            }
        }

        /// <summary>
        /// 點擊用戶記事後右邊的圖表
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public async Task<IActionResult> WaterNoteTableChart3(string StartDate, string EndDate, List<string> HoursList, bool hoursPart = true )
        {
            try
            {
                if( hoursPart && (HoursList.Count() < 6 || HoursList.Count() > 6) )
                {
                    // 可依照您的錯誤回應機制回傳錯誤訊息
                    return Json(Failed("顯示時段請選擇6個時段!!!"));
                }

                //// 解析開始時間和結束時間
                //DateTime StartTime = DateTime.ParseExact(StartDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                //DateTime EnderTime = DateTime.ParseExact(EndDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);

                // --- 加入日期格式與必要參數的檢查 ---
                if (string.IsNullOrWhiteSpace(StartDate) || string.IsNullOrWhiteSpace(EndDate))
                {
                    // 可依照您的錯誤回應機制回傳錯誤訊息
                    return Json(Failed("開始日期或結束日期不能為空"));
                }

                if (!DateTime.TryParseExact(StartDate, "yyyy/MM/dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime StartTime))
                {
                    return Json(Failed("開始日期格式錯誤，請使用 yyyy/MM/dd 格式"));
                }

                if (!DateTime.TryParseExact(EndDate, "yyyy/MM/dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime EnderTime))
                {
                    return Json(Failed("結束日期格式錯誤，請使用 yyyy/MM/dd 格式"));
                }

                //// 檢查開始時間不能晚於結束時間
                //if (StartTime > EnderTime)
                //{
                //    return Json(Failed("開始日期不能晚於結束日期"));
                //}

                // 檢查時間範圍是否超過 2 年 (730 天)
                TimeSpan range = EnderTime - StartTime;
                if (range.TotalDays > 730)
                {
                    return Json(Failed("查詢範圍不能超過 2 年 (730 天)"));
                }

                // 如果 HoursList 為 null，避免後續產生 NullReferenceException，直接初始化為空集合
                HoursList = HoursList ?? new List<string>();

                // 解析開始時間和結束時間
                StartTime = DateTime.ParseExact(StartDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                EnderTime = DateTime.ParseExact(EndDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);

                List<DailyChartData> dailyChartDatas = new List<DailyChartData>();

               var dayresultTask = await dashboardService.LitedPhMeterRecordListNew2(StartTime, EnderTime, aspNetUser.CurrentWaterNo);
               //var dayresultTask = await GetPhMeterRecordAutoSplit(StartTime, EnderTime, aspNetUser.CurrentWaterNo);
               dailyChartDatas = dayresultTask
                   .GroupBy(item => item.REC_DATE_TIME.Date)
                   .Select(g => new DailyChartData
                   {
                       datetime = g.Key.ToString("yyyy/MM/dd"),
                       time_data = g.Select(item => new TimeData
                       {
                           time = item.REC_DATE_TIME.Hour.ToString("00"),
                           amount = item.AMOUNT ?? 0m
                       }).ToList()
                   })
                   .OrderBy(x=>x.datetime)
                   .ToList();
                // 在每個日期資料中補上24:00的資料
                var tempDic2 = dailyChartDatas.ToDictionary(
                               // 將日期字串轉為 DateTime 作為 key
                               d => DateTime.Parse(d.datetime),
                               d =>
                               {
                                   // 將每個日期裡的時間資料依照小時數（轉成數值）排序
                                   var orderedData = d.time_data.OrderBy(t => int.Parse(t.time)).ToList();

                                   // 根據目前日期計算下一天的日期
                                   DateTime currentDate = DateTime.Parse(d.datetime);
                                   DateTime nextDate = currentDate.AddDays(1);

                                   // 嘗試從 dailyChartDatas 中尋找日期為 nextDate 的資料
                                   var nextDayRecord = dailyChartDatas.FirstOrDefault(x => DateTime.Parse(x.datetime) == nextDate);
                                   if (nextDayRecord != null)
                                   {
                                       // 若找得到，則從該天中找尋 "00" 時的資料
                                       var nextDayData = nextDayRecord.time_data.FirstOrDefault(t => t.time == "00");
                                       orderedData.Add(new TimeData
                                       {
                                           time = "24",
                                           amount = nextDayData?.amount ?? 0m  // 若找不到則補 0
                                       });
                                   }
                                   else
                                   {
                                       // 若無下一天資料，則直接補 0
                                       orderedData.Add(new TimeData
                                       {
                                           time = "24",
                                           amount = 0m
                                       });
                                   }

                                   //// 計算 _estimate：排序後第 6 筆資料的 amount 減去第一筆的 amount
                                   //// 若資料不足 6 筆，則預設 _estimate 為 0
                                   decimal estimate = 0;
                                   //if (orderedData.Count >= 6)
                                   //{
                                   //    estimate = orderedData[5].amount - orderedData[0].amount;
                                   //}

                                   return new
                                   {
                                       // 依照排序結果產生 _data 集合，每筆時間加上「時」字
                                       _data = orderedData.Select(t => new
                                       {
                                           _time = t.time,
                                           _amount = t.amount
                                       }),
                                       _estimate = estimate,
                                       _min = orderedData.Min(t => t.amount)
                                   };
                               });

                var tempResult = tempDic2.Select(x =>
                {
                    // 根據 HoursList 依序產生新的 time_data 清單，
                    // 若該時段在原始 _data 中沒有資料則補 0
                    var newData = HoursList.Select(hour =>
                    {
                        var existing = x.Value._data.FirstOrDefault(td => td._time == hour);
                        return new
                        {
                            _time = hour,
                            _amount = aspNetUser.UserId != 0
                                    ? Math.Floor(existing != null ? existing._amount : 0m) // 四捨五入到整數Math.Round→Math.Floor無條件捨去
                                    : (existing != null ? existing._amount : 0m) // 保留小數
                        };
                    }) 
                    // 如果 HoursList 本身未排序或你希望再做依據 hour 值排序，
                    // 這裡假設 hour 是可以轉換成 int 的字串
                    .OrderBy(item => int.Parse(item._time))
                    .ToList();

                    // 根據 newData 第 6 筆與第 1 筆資料計算 _estimate
                    decimal estimate = newData.Count >= 6 ? newData[5]._amount - newData[0]._amount : 0m;
                    estimate = aspNetUser.UserId != 0 ? Math.Floor(estimate) : estimate; // 四捨五入Math.Round→Math.Floor無條件捨去

                    // 取得當天 00:00 資料
                    decimal currentDayZeroAmount = 0m;
                    if (tempDic2.ContainsKey(x.Key))
                    {
                        currentDayZeroAmount = tempDic2[x.Key]._data.FirstOrDefault(t => t._time == "00")?._amount ?? 0m;
                        if (aspNetUser.UserId != 0) currentDayZeroAmount = Math.Floor(currentDayZeroAmount); // 四捨五入到整數Math.Round→Math.Floor無條件捨去
                    }

                    // 取得前一天 00:00 資料
                    decimal prevDayZeroAmount = 0m;
                    if (tempDic2.ContainsKey(x.Key.AddDays(-1)))
                    {
                        prevDayZeroAmount = tempDic2[x.Key.AddDays(-1)]._data.FirstOrDefault(t => t._time == "00")?._amount ?? 0m;
                        if (aspNetUser.UserId != 0) prevDayZeroAmount = Math.Floor(prevDayZeroAmount); // 四捨五入到整數Math.Round→Math.Floor無條件捨去
                    }

                    // 取得隔天 00:00 資料
                    decimal nextDayZeroAmount = 0m;
                    if (tempDic2.ContainsKey(x.Key.AddDays(1)))
                    {
                        nextDayZeroAmount = tempDic2[x.Key.AddDays(1)]._data.FirstOrDefault(t => t._time == "00")?._amount ?? 0m;
                        if (aspNetUser.UserId != 0) nextDayZeroAmount = Math.Floor(nextDayZeroAmount); // 四捨五入到整數Math.Round→Math.Floor無條件捨去
                    }

                    // 計算 A 和 B
                    decimal A = currentDayZeroAmount - prevDayZeroAmount;
                    decimal B = nextDayZeroAmount - currentDayZeroAmount;

                    // 計算 _difference
                    decimal difference = A != 0 ? (B - A) / A : 0m;

                    // 檢查是否有任何變數為 0，如果是則回傳 "-"
                    string _differenceDisplay = A == 0m
                        ? "-"
                        : (aspNetUser.UserId != 0
                          ? Math.Floor(difference * 100).ToString() // 四捨五入到整數Math.Round→Math.Floor無條件捨去
                          : (difference * 100).ToString("F6")); // 顯示6位小數

                    return new
                    {
                        _date = x.Key,       // 日期
                        _data = newData,     // 依 HoursList 產生的新 time_data 清單
                        _estimate = estimate, // 使用 newData 的第6筆與第1筆計算得出的估計值
                        _min = x.Value._min,  // 最小值（來自 tempDic2）
                        _difference = _differenceDisplay // 計算出的差值比例
                    };
                })
                // 在這裡加入對日期部分的排序
                .OrderBy(item => item._date)
                .ToList();

                #region 水號過戶判斷
                // **如果 aspNetUser.UserId != 0，則篩選符合 StartDate / EndDate 的日期**
                if (aspNetUser.UserId != 0)
                {
                    tempResult = tempResult
                        .Where(x =>
                            (aspNetUser.StartDate == null && aspNetUser.EndDate == null) ||
                            (aspNetUser.StartDate != null && aspNetUser.EndDate != null && x._date >= aspNetUser.StartDate && x._date <= aspNetUser.EndDate) ||
                            (aspNetUser.StartDate != null && aspNetUser.EndDate == null && x._date >= aspNetUser.StartDate) ||
                            (aspNetUser.StartDate == null && aspNetUser.EndDate != null && x._date <= aspNetUser.EndDate)
                        )
                        .ToList();
                }
                #endregion

                // **最後再過濾，確保輸出範圍為 StartTime ~ EnderTime**
                var result2 = tempResult
                    .Where(x => x._date >= StartTime && x._date <= EnderTime)
                    .ToList();

                return Json(Success(result2));

            }
            catch (Exception ex)
            {
                throw;
            }
            
        }
        /// <summary>
        /// 點擊用戶記事後右邊的圖表
        /// </summary>
        /// <param name="Cdate"></param>
        /// <returns></returns>
        public async Task<IActionResult> WaterNoteTableChart4(DateTime StartDate, DateTime EndDate)
        {
            try
            {

                //// 解析開始時間和結束時間
                //DateTime StartTime = DateTime.ParseExact(StartDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                //DateTime EnderTime = DateTime.ParseExact(EndDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);

                //// --- 加入日期格式與必要參數的檢查 ---
                //if (string.IsNullOrWhiteSpace(StartDate) || string.IsNullOrWhiteSpace(EndDate))
                //{
                //    // 可依照您的錯誤回應機制回傳錯誤訊息
                //    return Json(Failed("開始日期或結束日期不能為空"));
                //}

                //if (!DateTime.TryParseExact(StartDate, "yyyy/MM/dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime StartTime))
                //{
                //    return Json(Failed("開始日期格式錯誤，請使用 yyyy/MM/dd 格式"));
                //}

                //if (!DateTime.TryParseExact(EndDate, "yyyy/MM/dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime EnderTime))
                //{
                //    return Json(Failed("結束日期格式錯誤，請使用 yyyy/MM/dd 格式"));
                //}

                // 檢查 StartDate 和 EndDate 是否有效
                if (StartDate == default || EndDate == default)
                {
                    return Json(Failed("開始時間或結束時間格式不正確！"));
                }

                //// 檢查開始時間不能晚於結束時間
                //if (StartDate > EndDate)
                //{
                //    return Json(Failed("開始時間不能晚於結束時間！"));
                //}

                // 限制查詢範圍最多為 2 年 (730 天)
                TimeSpan range = EndDate - StartDate;
                if (range.TotalDays > 730)
                {
                    return Json(Failed("查詢範圍不能超過 2 年！"));
                }

                // 解析開始時間和結束時間
                var StartTime = StartDate;// DateTime.ParseExact(StartDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);
                var EnderTime = EndDate;// DateTime.ParseExact(EndDate, "yyyy/MM/dd", CultureInfo.InvariantCulture);

                List<F_B_CHART2> finalResult = new List<F_B_CHART2>();

                var dayresultTask = await dashboardService.LitedPhMeterRecordListNew2(StartTime, EnderTime, aspNetUser.CurrentWaterNo);
                //var dayresultTask = await GetPhMeterRecordAutoSplit(StartTime, EnderTime, aspNetUser.CurrentWaterNo);
                var dailyChartDatas = dayresultTask.OrderBy(x => x.REC_DATE_TIME).ToList();

                #region 水號過戶判斷--濾符合時間條件的數據
                var filteredDailyChartDatas = dailyChartDatas
                    .Where(item =>
                    {
                        bool isInDateRange = string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())
                                             || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.REC_DATE_TIME >= aspNetUser.StartDate && item.REC_DATE_TIME <= aspNetUser.EndDate)
                                             || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.REC_DATE_TIME >= aspNetUser.StartDate)
                                             || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) && item.REC_DATE_TIME <= aspNetUser.EndDate);
                        return isInDateRange;
                    })
                    .ToList();
                #endregion
                var getAddData = filteredDailyChartDatas.Where(s => s.REC_DATE_TIME.Hour == 0).Select(item => new F_B_CHART2
                {
                    X = DateTime.Parse(item.REC_DATE_TIME.AddDays(-1).ToString("yyyy-MM-dd 23:59:59")),
                    Y = aspNetUser.UserId != 0 ? Math.Round(item.AMOUNT ?? 0m) : item.AMOUNT ?? 0m  // 四捨五入//item.AMOUNT ?? 0m
                }).ToList();

                ////object obj = new
                ////{
                ////    result = dailyChartDatas.Select(item => new F_B_CHART2
                ////    {
                ////        X = item.REC_DATE_TIME,
                ////        Y = item.AMOUNT
                ////    }).Union(getAddData).OrderBy(c => c.X).ToList(),

                ////};

                ////object obj = new
                ////{
                ////    result = dailyChartDatas
                ////            .Select(item => new F_B_CHART2
                ////            {
                ////                X = item.REC_DATE_TIME,
                ////                Y = item.AMOUNT
                ////            })                          
                ////            .Union(getAddData) // 假設 getAddData 也為 F_B_CHART2 集合且 X 為字串
                ////            .Select(item =>
                ////            {
                ////                // 將 DateTime 轉成 "HH:mm:ss" 格式的字串
                ////                string timeStr = item.X.ToString("HH:mm:ss");
                ////                // 若等於 23:59:59，則轉換成 24:00:00
                ////                if (timeStr == "23:59:59")
                ////                {
                ////                    timeStr = "24:00:00";
                ////                }
                ////                return new F_B_CHART3
                ////                {
                ////                    X = item.X.ToString("yyyy-MM-dd ")+timeStr,  // X 為字串格式的時間
                ////                    Y = item.Y
                ////                };
                ////            })
                ////            .OrderBy(c => c.X)
                ////            .ToList(),
                //// };

                //object obj = new
                //{
                //    result = filteredDailyChartDatas
                //           .Select(item => new F_B_CHART2
                //           {
                //               X = item.REC_DATE_TIME,
                //               Y = aspNetUser.UserId != 0 ? Math.Round(item.AMOUNT ?? 0m) : item.AMOUNT ?? 0m // 四捨五入//item.AMOUNT
                //           })
                //           .Select(item =>
                //           {
                //               // 將 DateTime 轉成 "HH:mm:ss" 格式的字串
                //               string timeStr = item.X.ToString("HH:mm:ss");
                //               // 若等於 23:59:59，則轉換成 24:00:00
                //               if (timeStr == "23:59:59")
                //               {
                //                   timeStr = "24:00:00";
                //               }

                //               // 若 UserId 不為 0，對 Y 值進行四捨五入
                //               decimal roundedY = aspNetUser.UserId != 0 ? Math.Round(item.Y ?? 0m) : (item.Y ?? 0m);

                //               return new F_B_CHART3
                //               {
                //                   X = item.X.ToString("yyyy-MM-dd ") + timeStr,  // X 為字串格式的時間
                //                   Y = roundedY //item.Y
                //               };
                //           })
                //           .OrderBy(c => c.X)
                //           .ToList(),
                //};

                // 最終合併資料，並確保在查詢區間內
                var queryStart = StartTime;
                var queryEnd = EnderTime.TimeOfDay == TimeSpan.Zero
                    ? EnderTime.Date.AddDays(1).AddTicks(-1)
                    : EnderTime;

                var mergedData = filteredDailyChartDatas
                    .Select(item => new F_B_CHART2
                    {
                        X = item.REC_DATE_TIME,
                        Y = aspNetUser.UserId != 0 ? Math.Round(item.AMOUNT ?? 0m) : item.AMOUNT ?? 0m
                    })
                    .Concat(getAddData)
                    .Where(item => item.X >= queryStart && item.X <= queryEnd)
                    .OrderBy(item => item.X)
                    .ToList();

                object obj = new
                {
                    result = mergedData
                        .Select(item =>
                        {
                            string timeStr = item.X.ToString("HH:mm:ss");
                            if (timeStr == "23:59:59")
                            {
                                timeStr = "24:00:00";
                            }

                            return new F_B_CHART3
                            {
                                X = item.X.ToString("yyyy-MM-dd ") + timeStr,
                                Y = item.Y
                            };
                        })
                        .ToList(),
                };

                return Json(Success(obj));
            }
            catch (Exception ex)
            {
                throw;
            }

        }

        public class F_B_CHART3
        {
            public string X { get; set; } = string.Empty;
            public decimal? Y { get; set; }
        }

        /// <summary>
        /// 轄管廠所聯絡資訊
        /// </summary>
        /// <returns></returns>
        public async Task<IActionResult> GetContactPersonData()
        {
            var result = dashboardService.GetContactPerson(aspNetUser.CurrentWaterNo);
            return Json(Success(result));
        }

        public async Task<List<A_PH_METER_RECORD_LIST>> GetPhMeterRecordAutoSplit(DateTime StartTime, DateTime EnderTime, string WaterNo)
        {
            var now = DateTime.Now;
            var sevenDaysAgo = now.AddDays(-7);

            List<A_PH_METER_RECORD_LIST> mergedList = new List<A_PH_METER_RECORD_LIST>();

            // 1. 完全在 7 天前 
            if (StartTime < sevenDaysAgo && EnderTime < sevenDaysAgo)
            {
                var data = await dashboardService.LitedPhMeterRecordListNew2(StartTime, EnderTime, WaterNo);
                //mergedList.AddRange(data);
                mergedList.AddRange(data ?? Enumerable.Empty<A_PH_METER_RECORD_LIST>());
            }
            // 2. 完全在最近 7 天內(資料庫撈需要多撈前後一天)
            else if (StartTime >= sevenDaysAgo && EnderTime >= sevenDaysAgo)
            {
                var data = await dashboardService.LitedPhMeterRecordListNew3(StartTime.AddDays(-1), EnderTime.AddDays(1), WaterNo);
                //mergedList.AddRange(data);
                mergedList.AddRange(data ?? Enumerable.Empty<A_PH_METER_RECORD_LIST>());
            }
            // 3. 跨越 7 天 → 分段撈
            else
            {
                // 前半段
                if (StartTime < sevenDaysAgo)
                {
                    var oldData = await dashboardService.LitedPhMeterRecordListNew2(StartTime, sevenDaysAgo, WaterNo);

                    //mergedList.AddRange(oldData);
                    mergedList.AddRange(oldData ?? Enumerable.Empty<A_PH_METER_RECORD_LIST>());
                }

                // 後半段(資料庫撈需要多撈前後一天)
                if (EnderTime >= sevenDaysAgo)
                {
                    var newData = await dashboardService.LitedPhMeterRecordListNew3(sevenDaysAgo.AddDays(-1), EnderTime.AddDays(1), WaterNo);
                    //mergedList.AddRange(newData);
                    mergedList.AddRange(newData ?? Enumerable.Empty<A_PH_METER_RECORD_LIST>());
                }
            }
            // 4. 去除 REC_DATE_TIME + WATER_NO 的重複資料
            mergedList = mergedList
                .GroupBy(x => new { x.REC_DATE_TIME, x.WATER_NO })
                .Select(g => g.First())
                .ToList();

            return mergedList;
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
