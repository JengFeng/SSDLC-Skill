using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Areas.UserPanel.Controllers
{
    [Menu("水質查詢")]
    [Area("UserPanel")]
    public class QualityController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
