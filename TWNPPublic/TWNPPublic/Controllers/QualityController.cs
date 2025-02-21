using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Service;

namespace TWNPPublic.Controllers
{
    public class QualityController : BasicController
    {
        private readonly IAspNetUser aspNetUser;
        private readonly IQualityService qualityService;

        public QualityController(IAspNetUser aspNetUser, IQualityService qualityService)
        {
            this.qualityService = qualityService;
            this.aspNetUser = aspNetUser;
        }

        //看起來沒查權限相關的東西隨便寫吧
        //這個沒用到
        [NonAction]
        [Menu("水質查詢")]
        public IActionResult WaterQuality()
        {
            return View();
        }

        /// <summary>
        /// 用水指針查詢頁面，call 下面那個Ajax 叫圖表
        /// </summary>
        /// <returns></returns>
        [Menu("用水指針查詢")]
        public IActionResult UseWaterQuery()
        {
            //又要改....
            return View();
        }

        /// <summary>
        /// 唯一的圖表查資料
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public IActionResult UseWaterChart(DateTime? StartTime, DateTime? EndTime)
        {
            #region 摺疊

            //if (StartTimeZone.HasValue)
            //{
            //    if (StartTime.HasValue)
            //    {
            //        StartTime = StartTime.Value.AddHours(StartTimeZone.Value.Hour).AddMinutes(StartTimeZone.Value.Minute);
            //    }
            //    else
            //    {
            //        return Json(Failed(message: "需要指定日期"));
            //    }
            //}

            //if (EndTimeZone.HasValue)
            //{
            //    if (EndTime.HasValue)
            //    {
            //        EndTime = EndTime.Value.AddHours(EndTimeZone.Value.Hour).AddMinutes(EndTimeZone.Value.Minute);
            //    }
            //    else
            //    {
            //        return Json(Failed(message: "需要指定日期"));
            //    }
            //}

            #endregion

            var result = qualityService.GetWaterUseChart(StartTime, EndTime);

            List<JObject> Pindatas = new List<JObject>();
            List<JObject> Amountdatas = new List<JObject>();

            if (result.PinChartData.Count() == 0 && result.AmountChartData.Count() == 0)
                return Json(Failed(new
                {
                    alert = "此時間段尚無資料"
                }, "此時間段尚無資料")); ;

            foreach (var item in result.PinChartData)
            {
                Pindatas.Add(new JObject {
                                 new JProperty("value", new Object[] { item.X, item.Y})
                            });
            }

            foreach (var item in result.PinChartData)
            {
                Amountdatas.Add(new JObject {
                                     new JProperty("value", new Object[] {item.X, item.Y * 5})
                                });
            }


            JObject option = new JObject()
            {
                new JProperty("Pindatas", Pindatas),
                new JProperty("Amountdatas", Amountdatas)
            };
            return Json(Success<string>(JsonConvert.SerializeObject(option)));
        }

        /// <summary>
        /// 用水量查詢(meun)
        /// </summary>
        /// <returns></returns>
        [Menu("用水量查詢")]
        public IActionResult UseWaterQueryNew()
        {
            return View();
        }

        /// <summary>
        /// 用水指針查詢(meun)
        /// </summary>
        /// <returns></returns>
        [Menu("用水指針查詢")]
        public IActionResult UseWaterQueryPin()
        {
            // 產生 00 ~ 24 的時段清單
            List<string> hourList = Enumerable.Range(0, 25)
                                              .Select(h => h.ToString("D2")) // 格式化為 00, 01, 02, ..., 24
                                              .ToList();

            ViewBag.HourList = hourList; // 傳遞到 View

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> QueryWaterTypeData(DateTime StartDate, DateTime EndDate)
        {
            try
            {
                var result = qualityService.QueryWaterTypeData(StartDate, EndDate, aspNetUser.CurrentWaterNo);

                return Json(Success(result));
            }
            catch (Exception ex)
            {
                return Json(Success());
            }
        }
    }

}
