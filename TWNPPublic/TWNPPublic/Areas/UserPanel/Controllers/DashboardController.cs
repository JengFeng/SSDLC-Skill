using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Areas.UserPanel.Controllers
{
    [Area("UserPanel")]
    [Menu("首頁")]
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
