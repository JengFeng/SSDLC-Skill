using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Areas.UserPanel.Controllers
{
    [Area("UserPanel")]
    [Menu("用水指針查詢")]
    public class IndicatorController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
