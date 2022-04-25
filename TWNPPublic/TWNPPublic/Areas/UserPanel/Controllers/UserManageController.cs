using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Areas.UserPanel.Controllers
{
    [Area("UserPanel")]
    [Menu("密碼設定")]
    public class UserManageController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
