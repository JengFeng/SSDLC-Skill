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
        public IActionResult LoadAlertSet(string WaterNo)
        {
            if (aspNetUser.UserId == null)
                return Json(Failed(message: "尚未註冊帳號"));
            var result = alertService.GetAertSetByAccountSNAndWaterNo(aspNetUser.UserId.Value, WaterNo);
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
                //資料設計好醜 Not like this
                #region 額外判斷
                if (!ModelState.IsValid)
                {
                    return Json(ValidationFailed(
                     ModelState.Where(x => x.Value.Errors.Count > 0)
                         .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                         ), "欄位錯誤"));
                }

                //if (model.AlertValue2 == "12")
                //{
                //    if (!model.AlertExtion2.HasValue)
                //    {
                //        ModelState.AddModelError("AlertExtion2", "您需填寫克制化度數");
                //        return Json(ValidationFailed(
                //        ModelState.Where(x => x.Value.Errors.Count > 0)
                //        .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                //        ), "欄位錯誤"));
                //    }

                //    if (model.AlertExtion2 < 50)
                //    {
                //        ModelState.AddModelError("AlertExtion2", "至少50度以上");
                //        return Json(ValidationFailed(
                //          ModelState.Where(x => x.Value.Errors.Count > 0)
                //          .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                //          ), "欄位錯誤"));
                //    }
                //}

                //if (model.AlertValue5 == "53")
                //{
                //    if (!model.AlertExtion3.HasValue || !model.AlertExtion4.HasValue)
                //    {
                //        ModelState.AddModelError("AlertExtion3", "您需填寫限制值");
                //        ModelState.AddModelError("AlertExtion4", "您需填寫限制值");
                //        return Json(ValidationFailed(
                //        ModelState.Where(x => x.Value.Errors.Count > 0)
                //        .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                //        ), "欄位錯誤"));
                //    }
                //}

                //if (model.AlertValue5 == "54")
                //{
                //    if (!model.AlertExtion5.HasValue || !model.AlertExtion6.HasValue)
                //    {
                //        ModelState.AddModelError("AlertExtion5", "您需填寫限制值");
                //        ModelState.AddModelError("AlertExtion6", "您需填寫限制值");
                //        return Json(ValidationFailed(
                //        ModelState.Where(x => x.Value.Errors.Count > 0)
                //        .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                //        ), "欄位錯誤"));
                //    }
                //}

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

                if (Mails.Count() > 0)
                {
                    B_ALART_SETTING MailItem = new B_ALART_SETTING()
                    {
                        B_ALART_CODE_SN = 15,
                        WATER_NO = model.WaterNo,
                        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                        VALUE = string.Join(';', Mails)
                    };
                    alertsetitems.Add(MailItem);
                }
                //信箱

                //手機
                B_ALART_SETTING PhoneItem = new B_ALART_SETTING()
                {
                    B_ALART_CODE_SN = 16,
                    WATER_NO = model.WaterNo,
                    B_ACCOUNT_SN = aspNetUser.UserId.Value,
                    VALUE = model.AlertPhone
                };
                alertsetitems.Add(PhoneItem);


                #region 其他選項
                //其他選項

                if (model.onoffswitch1 == "on")
                {
                    var value2 = "";
                    if (model.AlertValue1 == "103")
                    {
                        value2 = model.AlertExtion10010301 + "," + model.AlertExtion10010302;
                    }
                    else if (model.AlertValue1 == "104")
                    {
                        value2 = model.AlertExtion10010401 + "," + model.AlertExtion10010402;
                    }

                    B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                    {
                        B_ALART_CODE_SN = 100,
                        WATER_NO = model.WaterNo,
                        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                        VALUE = model.AlertValue1,
                        VALUE1 = value2
                    };
                    alertsetitems.Add(MMcode1Item);
                }

                if (model.onoffswitch2 == "on")
                {
                    var value2 = "";
                    if (model.AlertValue2 == "105")
                    {
                        value2 = model.AlertExtion10110501;
                    }
                    else if (model.AlertValue2 == "106")
                    {
                        value2 = model.AlertExtion10110601;
                    }


                    B_ALART_SETTING MMcode2Item = new B_ALART_SETTING()
                    {
                        B_ALART_CODE_SN = 101,
                        WATER_NO = model.WaterNo,
                        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                        VALUE = model.AlertValue2,
                        VALUE1 = value2
                    };
                    alertsetitems.Add(MMcode2Item);
                }

                if (model.onoffswitch3 == "on")
                {
                    B_ALART_SETTING MMcode3Item = new B_ALART_SETTING()
                    {
                        B_ALART_CODE_SN = 102,
                        WATER_NO = model.WaterNo,
                        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                        VALUE = "107",
                    };
                    alertsetitems.Add(MMcode3Item);
                }

                if (model.onoffswitch4 == "on")
                {
                    B_ALART_SETTING MMcode4Item = new B_ALART_SETTING()
                    {
                        B_ALART_CODE_SN = 102,
                        WATER_NO = model.WaterNo,
                        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                        VALUE = "108",
                    };
                    alertsetitems.Add(MMcode4Item);
                }

                #endregion


                alertService.UpdateAlertServiceBySNAndWaterNo(aspNetUser.UserId.Value, model.WaterNo, alertsetitems);

                //最簡單刪掉所有在加回去
                return Json(Success("更新成功"));
            }
        }
    }
}
