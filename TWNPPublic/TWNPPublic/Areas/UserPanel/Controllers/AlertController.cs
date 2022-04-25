using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Areas.UserPanel.Controllers
{
    [Area("UserPanel")]
    [Menu("警示設定")]
    public class AlertController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
