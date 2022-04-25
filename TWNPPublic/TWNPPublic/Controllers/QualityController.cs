using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Controllers
{
    public class QualityController : Controller
    {
        public IActionResult WaterQuality()
        {
            return View();
        }
        public IActionResult UseWaterQuery()
        {
            return View();
        }
        
    }
    
}
