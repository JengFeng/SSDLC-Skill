using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models.Entity;
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

        /// <summary>
        /// 初始化
        /// </summary>
        /// <returns></returns>
        public IActionResult AlertSettings()
        {
            if (aspNetUser.UserId == null)
                return View();
            ViewBag.WaterNo = aspNetUser.WaterNo;
            ViewBag.MMcode = alertService.GetAlertMMCode();
            return View();
        }

        /// <summary>
        /// 載入這個使用者的警示設定
        /// </summary>
        /// <returns></returns>
        public IActionResult LoadAlertSet()
        {
            if (aspNetUser.UserId == null)
                return Json(Failed(message: "尚未註冊帳號"));
            var result = alertService.GetAertSetByAccountSN(aspNetUser.UserId.Value);
            return Json(Success<object>(result));
        }

        /// <summary>
        /// 更新警示設定
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult SaveAlertSet(SaveAlertSetViewModel model)
        {
            if (aspNetUser.UserId == null)
            {
                return Json(Failed(message: "尚未註冊帳號"));
            }

            //沒選水號刪除所有的設定
            if (model.WaterNo == null || model.WaterNo.Count() <= 0)
            {
                var reuslt = alertService.DeleteAllAlertSetBySN(aspNetUser.UserId.Value);
                return Json(Success<int>(reuslt, "已清空設定"));
            }
            //有選水號
            else
            {
                //先檢查手機是不是必填
                //在檢查信箱格式
                //在檢查 惟至少50度以上 有選這個就要填 要填就要50度以上
                //好醜 Not like this
                #region 額外判斷
                if (!ModelState.IsValid)
                {
                    return Json(ValidationFailed(
                     ModelState.Where(x => x.Value.Errors.Count > 0)
                         .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                         ), "欄位錯誤"));
                }

                if (model.AlertValue2 == "12")
                {
                    if (!model.AlertExtion2.HasValue)
                    {
                        ModelState.AddModelError("AlertExtion2", "您需填寫克制化度數");
                        return Json(ValidationFailed(
                        ModelState.Where(x => x.Value.Errors.Count > 0)
                        .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                        ), "欄位錯誤"));
                    }

                    if (model.AlertExtion2 < 50)
                    {
                        ModelState.AddModelError("AlertExtion2", "至少50度以上");
                        return Json(ValidationFailed(
                          ModelState.Where(x => x.Value.Errors.Count > 0)
                          .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                          ), "欄位錯誤"));
                    }
                }

                if (model.AlertValue5 == "53")
                {
                    if (!model.AlertExtion3.HasValue || !model.AlertExtion4.HasValue)
                    {
                        ModelState.AddModelError("AlertExtion3", "您需填寫限制值");
                        ModelState.AddModelError("AlertExtion4", "您需填寫限制值");
                        return Json(ValidationFailed(
                        ModelState.Where(x => x.Value.Errors.Count > 0)
                        .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                        ), "欄位錯誤"));
                    }
                }

                if (model.AlertValue5 == "54")
                {
                    if (!model.AlertExtion5.HasValue || !model.AlertExtion6.HasValue)
                    {
                        ModelState.AddModelError("AlertExtion5", "您需填寫限制值");
                        ModelState.AddModelError("AlertExtion6", "您需填寫限制值");
                        return Json(ValidationFailed(
                        ModelState.Where(x => x.Value.Errors.Count > 0)
                        .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                        ), "欄位錯誤"));
                    }
                }

                #endregion

                List<B_ALART_SETTING> alertsetitems = new List<B_ALART_SETTING>();
                //Mail處理
                List<string> Mails = new List<string>();
                if (model.AlertEmail1 != null)
                    Mails.Add(model.AlertEmail1);
                if (model.AlertEmail2 != null)
                    Mails.Add(model.AlertEmail2);
                if (model.AlertEmail3 != null)
                    Mails.Add(model.AlertEmail3);

                //Set處理
                foreach (var item in model.WaterNo)
                {
                    if (Mails.Count() > 0)
                    {
                        B_ALART_SETTING MailItem = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 15,
                            WATER_NO = item,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = string.Join(',', Mails)
                        };
                        alertsetitems.Add(MailItem);
                    }
                    //信箱

                    //手機
                    B_ALART_SETTING PhoneItem = new B_ALART_SETTING()
                    {
                        B_ALART_CODE_SN = 16,
                        WATER_NO = item,
                        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                        VALUE = model.AlertPhone
                    };
                    alertsetitems.Add(PhoneItem);

                    if (!string.IsNullOrEmpty(model.AlertValue2))
                    {
                        B_ALART_SETTING MMcode3Item = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 3,
                            WATER_NO = item,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = model.AlertValue2,
                            VALUE1 = model.AlertExtion2.ToString()
                        };
                        alertsetitems.Add(MMcode3Item);
                    }

                    if (!string.IsNullOrEmpty(model.AlertValue3))
                    {
                        B_ALART_SETTING MMcode5Item = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 5,
                            WATER_NO = item,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = model.AlertValue3
                        };
                        alertsetitems.Add(MMcode5Item);
                    }


                    if (!string.IsNullOrEmpty(model.AlertValue4))
                    {
                        B_ALART_SETTING MMcode49Item = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 49,
                            WATER_NO = item,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = model.AlertValue4
                        };
                        alertsetitems.Add(MMcode49Item);
                    }

                    if (!string.IsNullOrEmpty(model.AlertValue5))
                    {
                        var temp = "";
                        if(model.AlertValue5 == "53")
                        {
                            temp = model.AlertExtion3.ToString() + ',' + model.AlertExtion4.ToString();
                        }

                        if (model.AlertValue5 == "54")
                        {
                            temp = model.AlertExtion5.ToString() + ',' + model.AlertExtion6.ToString();
                        }

                        B_ALART_SETTING MMcode50Item = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 50,
                            WATER_NO = item,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = model.AlertValue5,
                            VALUE1 = temp
                        };
                        alertsetitems.Add(MMcode50Item);
                    }
                }

                alertService.UpdateAlertServiceBySN(aspNetUser.UserId.Value, alertsetitems);

                //最簡單刪掉所有在加回去
                return Json(Success("更新成功"));
            }
        }
    }
}
