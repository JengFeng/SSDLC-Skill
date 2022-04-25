using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Controllers
{
    [Menu("密碼設定")]
    public class UserManageController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult UserSettings()
        {
            return View();
        }
    }
}
