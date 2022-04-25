using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Controllers
{
    [Area("UserPanel")]
    public class QualityController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
