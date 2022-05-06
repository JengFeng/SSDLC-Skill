using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Controllers
{
    [Menu("密碼設定")]
    public class UserManageController : BasicController
    {
        public IActionResult UserSettings()
        {
            return View();
        }
    }
}
