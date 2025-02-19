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
                var reuslt = alertService.DeleteAllAlertSetBySNAndWaterNo(aspNetUser.UserId.Value, model.WaterNo);
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
                if (model.AlertEmail4 != null)
                    Mails.Add(model.AlertEmail4);
                if (model.AlertEmail5 != null)
                    Mails.Add(model.AlertEmail5);

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

                //每日用水上限提醒
                if (model.AlertCheckbox1 == "650")
                {
                    var value2 = "";
                    value2 = model.AlertExtion10265001;

                    B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                    {
                        B_ALART_CODE_SN = 102,
                        WATER_NO = model.WaterNo,
                        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                        VALUE = model.AlertCheckbox1,
                        VALUE1 = value2
                    };
                    alertsetitems.Add(MMcode1Item);
                }

                //每期用水預算提醒
                if (model.AlertCheckbox2 == "651")
                {
                    var value2 = "";
                    value2 = model.AlertExtion10265101;

                    B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                    {
                        B_ALART_CODE_SN = 102,
                        WATER_NO = model.WaterNo,
                        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                        VALUE = model.AlertCheckbox2,
                        VALUE1 = value2
                    };
                    alertsetitems.Add(MMcode1Item);
                }

                #region 其他選項
                if (model.onoffswitch1 == "on")
                {
                    //日用水量(前日24:00至昨日23:00)
                    if (model.AlertCheckbox3 == "100")
                    {
                        var value2 = "";
                        if (model.AlertValue1 == "103")
                        {
                            value2 = model.AlertExtion10010301 + "," + model.AlertExtion10010302 + "," + model.AlertExtion10010303 + "," + model.AlertExtion10010304;
                        }
                        else if (model.AlertValue1 == "104")
                        {
                            value2 = model.AlertExtion10010401 + "," + model.AlertExtion10010402 + "," + model.AlertExtion10010403 + "," + model.AlertExtion10010404;
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

                    //週用水量警示
                    if (model.AlertCheckbox4 == "646")
                    {
                        var value2 = "";
                        if (model.AlertValue2 == "647")
                        {
                            value2 = model.AlertExtion64664701 + "," + model.AlertExtion64664702 + "," + model.AlertExtion64664703 + "," + model.AlertExtion64664704;
                        }
                        else if (model.AlertValue2 == "648")
                        {
                            value2 = model.AlertExtion64664801 + "," + model.AlertExtion64664802 + "," + model.AlertExtion64664803 + "," + model.AlertExtion64664804;
                        }

                        B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 646,
                            WATER_NO = model.WaterNo,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = model.AlertValue2,
                            VALUE1 = value2
                        };
                        alertsetitems.Add(MMcode1Item);
                    }

                    //月用水量警示
                    if (model.AlertCheckbox5 == "101")
                    {
                        var value2 = "";
                        if (model.AlertValue3 == "105")
                        {
                            value2 = model.AlertExtion10110501 + "," + model.AlertExtion10110502 + "," + model.AlertExtion10110503 + "," + model.AlertExtion10110504;
                        }
                        else if (model.AlertValue3 == "106")
                        {
                            value2 = model.AlertExtion10110601 + "," + model.AlertExtion10110602 + "," + model.AlertExtion10110603 + "," + model.AlertExtion10110604;
                        }

                        B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 101,
                            WATER_NO = model.WaterNo,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = model.AlertValue3,
                            VALUE1 = value2
                        };
                        alertsetitems.Add(MMcode1Item);
                    }

                    //連續水量警示
                    if (model.AlertCheckbox6 == "108")
                    {
                        var value2 = "";
                        if (model.AlertValue4 == "108")
                        {
                            value2 = model.AlertExtion10210801;
                        }
                       
                        B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 102,
                            WATER_NO = model.WaterNo,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = model.AlertValue4,
                            VALUE1 = value2
                        };
                        alertsetitems.Add(MMcode1Item);
                    }

                    //連續無用水
                    if (model.AlertCheckbox7 == "107")
                    {
                        var value2 = "";
                        if (model.AlertValue5 == "107")
                        {
                            value2 = model.AlertExtion10210701;
                        }

                        B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 102,
                            WATER_NO = model.WaterNo,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = model.AlertValue5,
                            VALUE1 = value2
                        };
                        alertsetitems.Add(MMcode1Item);
                    }

                    //夜間用水增加警示
                    if (model.AlertCheckbox8 == "649")
                    {
                        var value2 = "";
                        if (model.AlertValue6 == "649")
                        {
                            value2 = model.AlertExtion10264901 + "," + model.AlertExtion10264902;
                        }

                        B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                        {
                            B_ALART_CODE_SN = 102,
                            WATER_NO = model.WaterNo,
                            B_ACCOUNT_SN = aspNetUser.UserId.Value,
                            VALUE = model.AlertValue6,
                            VALUE1 = value2
                        };
                        alertsetitems.Add(MMcode1Item);
                    }

                }

                #endregion


                #region 其他選項
                ////其他選項

                //if (model.onoffswitch1 == "on")
                //{
                //    var value2 = "";
                //    if (model.AlertValue1 == "103")
                //    {
                //        value2 = model.AlertExtion10010301 + "," + model.AlertExtion10010302;
                //    }
                //    else if (model.AlertValue1 == "104")
                //    {
                //        value2 = model.AlertExtion10010401 + "," + model.AlertExtion10010402;
                //    }

                //    B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                //    {
                //        B_ALART_CODE_SN = 100,
                //        WATER_NO = model.WaterNo,
                //        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                //        VALUE = model.AlertValue1,
                //        VALUE1 = value2
                //    };
                //    alertsetitems.Add(MMcode1Item);
                //}

                //if (model.onoffswitch2 == "on")
                //{
                //    var value2 = "";
                //    if (model.AlertValue2 == "105")
                //    {
                //        value2 = model.AlertExtion10110501;
                //    }
                //    else if (model.AlertValue2 == "106")
                //    {
                //        value2 = model.AlertExtion10110601;
                //    }


                //    B_ALART_SETTING MMcode2Item = new B_ALART_SETTING()
                //    {
                //        B_ALART_CODE_SN = 101,
                //        WATER_NO = model.WaterNo,
                //        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                //        VALUE = model.AlertValue2,
                //        VALUE1 = value2
                //    };
                //    alertsetitems.Add(MMcode2Item);
                //}

                //if (model.onoffswitch3 == "on")
                //{
                //    B_ALART_SETTING MMcode3Item = new B_ALART_SETTING()
                //    {
                //        B_ALART_CODE_SN = 102,
                //        WATER_NO = model.WaterNo,
                //        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                //        VALUE = "107",
                //    };
                //    alertsetitems.Add(MMcode3Item);
                //}

                //if (model.onoffswitch4 == "on")
                //{
                //    B_ALART_SETTING MMcode4Item = new B_ALART_SETTING()
                //    {
                //        B_ALART_CODE_SN = 102,
                //        WATER_NO = model.WaterNo,
                //        B_ACCOUNT_SN = aspNetUser.UserId.Value,
                //        VALUE = "108",
                //    };
                //    alertsetitems.Add(MMcode4Item);
                //}

                #endregion


                alertService.UpdateAlertServiceBySNAndWaterNo(aspNetUser.UserId.Value, model.WaterNo, alertsetitems);

                //最簡單刪掉所有在加回去
                return Json(Success("更新成功"));
            }
        }
    }
}
