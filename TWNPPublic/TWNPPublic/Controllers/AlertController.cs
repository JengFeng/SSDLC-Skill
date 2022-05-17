using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Service;
using TWNPPublic.ViewModels.Alert;

namespace TWNPPublic.Controllers
{
    [Menu("警示設定")]
    public class AlertController : BasicController
    {
        private readonly IAlertService alertService;
        private readonly IAspNetUser aspNetUser;

        public AlertController(IAlertService alertService, IAspNetUser aspNetUser)
        {
            this.alertService = alertService;
            this.aspNetUser = aspNetUser;
        }

        public IActionResult AlertSettings()
        {
            if (aspNetUser.UserId == null)
                return View();
            ViewBag.WaterNo = aspNetUser.WaterNo;
            ViewBag.MMcode = alertService.GetAlertMMCode();
            return View();
        }

        public IActionResult LoadAlertSet()
        {
            if (aspNetUser.UserId == null)
                return Json(Failed(message: "尚未註冊帳號"));
            var result = alertService.GetAertSetByAccountSN(aspNetUser.UserId.Value);
            return Json(Success<object>(result));
        }

        [HttpPost]
        public IActionResult SaveAlertSet(SaveAlertSetViewModel model)
        {
            //沒選水號刪除所有的設定
            if (model.WaterNo == null)
            {
                return Json(Success("已清空設定"));
            }
            //有選水號
            else
            {
                if (ModelState.IsValid)
                {
                    //先檢查手機是不是必填
                    //在檢查信箱格式
                    //在檢查 惟至少50度以上
                    //刪掉所有在加回去
                    return Json(Success("更新成功"));
                }
                else
                {
                    return Json(ValidationFailed(
                          ModelState.Where(x => x.Value.Errors.Count > 0)
                              .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                              ), "欄位錯誤"));
                }
            }
        }
    }

}
