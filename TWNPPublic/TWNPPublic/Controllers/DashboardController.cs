using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Controllers
{
    [Menu("首頁")]
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Fancybox_chart()
        {
            return View();
        }

        public IActionResult test()
        {
            return View();
        }
    }
}
