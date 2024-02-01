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

                if (  (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) )
                                    || (!string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && string.IsNullOrEmpty(aspNetUser.EndDate.ToString())  )
                                    || (string.IsNullOrEmpty(aspNetUser.StartDate.ToString()) && !string.IsNullOrEmpty(aspNetUser.EndDate.ToString()) ))
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
                result.NAME_DAES,
                result.AREA,
                result.SUBTOTAL,
                result.TOQTY
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
            var NAME = result2 == null ? result.NAME_DAES : result2.USERNAME == null ? result.NAME_DAES : result2.USERNAME == "" ? result.NAME_DAES : result2.USERNAME;

            return Json(Success(new
            {
                NAME,
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
        public async Task<IActionResult> WaterNoteTableChart(DateTime Cdate)
        {
            //回應25筆
            // 2022/11/13 00:00:00 - 2022/11/14 00:00:00
            // 先做 Hash 25 筆

            Dictionary<string, decimal?> dic = new Dictionary<string, decimal?>();
            DateTime StartTime = DateTime.Now;
            //每月的1號，開始日期的月需要減1
            if ( Cdate.Day == 1)
            {
                StartTime = new DateTime(Cdate.Year, Cdate.AddDays(-1).Month, Cdate.AddDays(-1).Day, 23, 0, 0);

                //若是12月的話，年要-1到去年的時間
                if(Cdate.AddDays(-1).Month == 12)
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

            if ( isLastDayOfMonth )
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
                    if (temp.Count() <= 0 || temp==null) return Json(Failed(message: "資料尚未開放"));
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

                        if (aspNetUser.UserId != 0)
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
                    if ( allValues ) return Json(Failed(message: "資料尚未開放"));
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
                    var dayresult =  dayresultTask;

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
                            if (aspNetUser.UserId != 0)
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
                            if (aspNetUser.UserId != 0)
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


                if(aspNetUser.UserId != 0)
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
            var thisyear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt,"1").OrderBy(c => c.X).ToList();//今年
            var nextyear = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate.AddYears(-1), timespilt,"1").OrderBy(c => c.X).ToList();//去年同期
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
                                dayresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper(),"0").OrderBy(c => c.X).ToList();
                            }
                            else
                            {
                                //前天去撈資料庫
                                dayresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper(),"1").OrderBy(c => c.X).ToList();
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

                        var weekresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper(),"1").OrderBy(c => c.X).ToList();
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

                        var monthresult = dashboardService.ListedChart(aspNetUser.CurrentWaterNo, Cdate, timespilt.ToUpper(),"1").OrderBy(c => c.X);

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

            if(aspNetUser.UserId != null)
            {
                var result = dashboardService.ListedWaterNOBySN(WaterNos);
                HttpContext.Session.SetString("StartDate", result.ST_DATE.ToString() );
                HttpContext.Session.SetString("EndDate", result.EN_DATE.ToString() );
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
                CommonFunc comm = new();
                if (ModelState.IsValid)
                {
                    if (aspNetUser.UserId != null)
                    {
                        vm.Password = comm.AesEncrypt(vm.Password);
                        var result = dashboardService.GetAccountBySN(aspNetUser.UserId.Value);
                        if (result != null)
                        {
                            if (result.APWD != vm.Password)
                            {
                                ModelState.AddModelError("Password", "舊密碼輸入錯誤");
                            }
                        }
                    }
                    else
                    {
                        return Json(Failed(message: "系統帳號尚未開通"));
                    }

                    if (!CommonFunc.magicword(vm.PasswordNew1))
                    {
                        ModelState.AddModelError("PasswordNew1", "密碼長度需為8位元，包含大小寫英文字母、特殊符號、數字");
                    }

                    if (!CommonFunc.magicword(vm.PasswordNew2))
                    {
                        ModelState.AddModelError("PasswordNew2", "密碼長度需為8位元，包含大小寫英文字母、特殊符號、數字");
                    }

                    if (vm.PasswordNew1 != vm.PasswordNew2)
                    {
                        ModelState.AddModelError("PasswordNew1", "新密碼和再確認新密碼輸入不一樣");
                        ModelState.AddModelError("PasswordNew2", "新密碼和再確認新密碼輸入不一樣");

                    }

                    if(!ModelState.IsValid)
                    {

                         return Json(ValidationFailed(
                            ModelState.Where(x => x.Value.Errors.Count > 0)
                           .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                           ), "欄位錯誤")); 
                    }
  
                    vm.PasswordNew2 = comm.AesEncrypt(vm.PasswordNew2);
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
