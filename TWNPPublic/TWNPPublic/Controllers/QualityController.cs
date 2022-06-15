using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Domain.Service;

namespace TWNPPublic.Controllers
{
    public class QualityController : BasicController
    {
        private readonly IQualityService qualityService;

        public QualityController(IQualityService qualityService)
        {
            this.qualityService = qualityService;
        }

        //看起來沒查權限相關的東西隨便寫吧
        //這個沒用到
        [NonAction]
        [Menu("水質查詢")]
        public IActionResult WaterQuality()
        {
            return View();
        }

        [Menu("用水指針查詢")]
        public IActionResult UseWaterQuery()
        {

            return View();
        }

        [HttpPost]
        public IActionResult UseWaterChart(DateTime? StartTime, DateTime? EndTime)
        {
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


            var result = qualityService.GetWaterUseChart(StartTime, EndTime);

            List<JObject> Pindatas = new List<JObject>();
            List<JObject> Amountdatas = new List<JObject>();

            if (result.PinChartData.Count() == 0 && result.AmountChartData.Count() == 0)
                return Json(Failed(message: "查無資料"));

            foreach (var item in result.PinChartData)
            {
                Pindatas.Add(new JObject {
                                 new JProperty("value", new Object[] { item.X, item.Y})
                            });
            }


            foreach (var item in result.AmountChartData)
            {
                Amountdatas.Add(new JObject {
                                 new JProperty("value", new Object[] { item.X, item.Y})
                            });
            }

            JObject option = new JObject()
            {
                new JProperty("Pindatas", Pindatas),
                new JProperty("Amountdatas", Amountdatas)
            };
            return Json(Success<string>(JsonConvert.SerializeObject(option)));
        }
    }

}
