using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Controllers
{
    public class QualityController : BasicController
    {
        //看起來沒查權限相關的東西隨便寫吧
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
        
    }
    
}
