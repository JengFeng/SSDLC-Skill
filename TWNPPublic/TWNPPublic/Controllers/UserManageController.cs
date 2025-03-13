using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models.Entity;
using TWNPPublic.ViewModels.UserManage;

namespace TWNPPublic.Controllers
{
    [Menu("密碼設定")]
    public class UserManageController : BasicController
    {
        private readonly IAspNetUser aspNetUser;
        private readonly IUserManageService userManageService;

        public UserManageController(IAspNetUser aspNetUser, IUserManageService userManageService)
        {
            this.aspNetUser = aspNetUser;
            this.userManageService = userManageService;
        }

        public IActionResult UserSettings()
        {
            ViewBag.IsTestUser = false;

            if (aspNetUser.UserId == 1)
            {
                ViewBag.IsTestUser = true;
            }

            ViewBag.IsSignAccount = false;
            if (aspNetUser.UserId != null)
            {
                ViewBag.IsSignAccount = true;
            }

            return View();
        }

        /// <summary>
        /// 用於取得使用者資料
        /// </summary>
        /// <returns></returns>
        public IActionResult GetUserInfo()
        {
            if (aspNetUser.UserId != null)
            {
                var result = userManageService.GetAccountBySN(aspNetUser.UserId.Value);
                if (result != null)
                    return Json(Success<b_ACCOUNT>(result));
            }

            return Json(Failed(message: "系統帳號尚未綁定"));
        }

        /// <summary>
        /// 用於載入水號
        /// </summary>
        /// <returns></returns>
        public IActionResult ListedUserWaterNo()
        {
            if (aspNetUser.UserId != null)
            {
                var result = userManageService.ListedWaterNOBySN(aspNetUser.UserId.Value);
                if (result != null)
                    return Json(Success<List<V_B_ACCOUNT_WATER_NO>>(result));
            }

            return Json(Failed(message: "帳號尚未綁定水號"));
        }

        /// <summary>
        /// 用於更新帳號
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult UpdateUserInfo(UpdateUserManageViewModel model)
        {
            try
            {
                if (aspNetUser.UserId == null)
                    return Json(Failed("使用者尚未註冊"));

                if (ModelState.IsValid)
                {
                    //foreach (var item in model.WaterNO)
                    //{
                    //    if (string.IsNullOrEmpty(item))
                    //    {
                    //        ModelState.AddModelError("WaterNO", "水號不能為空");
                    //        return Json(ValidationFailed(
                    //        ModelState.Where(x => x.Value.Errors.Count > 0)
                    //            .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                    //            ), "欄位錯誤"));
                    //    }
                    //}

                    var result = userManageService.UpdateAccountInfo(model, aspNetUser.UserId.Value);

                    //自動讀表期滿通知之保固截止日
                    if (model.ExpDate != null)
                    {
                        var reuslt2 = userManageService.DeleteAllAlertSetBySNAndWaterNo(aspNetUser.UserId.Value, aspNetUser.CurrentWaterNo);
                        List<B_ALART_SETTING> alertsetitems = new List<B_ALART_SETTING>();
                        var QualifyDate = userManageService.GetPhMeterQualifyDateByWaterNo(aspNetUser.CurrentWaterNo.ToString());
                        string updatedDate = "";
                        if (QualifyDate.QUALIFY_DATE.HasValue)
                        {
                            // 將日期轉換為字串並去掉時間部分，再加上 8 年
                            updatedDate = QualifyDate.QUALIFY_DATE.Value.AddYears(8).ToString("yyyy-MM-dd");
                        }
                        else
                        {
                            updatedDate = "-";  // 如果 QUALIFY_DATE 為 null，可以設置預設日期
                        }

                        foreach (var item in model.ExpDate)
                        {
                            if (item == "653")
                            {
                                B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                                {
                                    B_ALART_CODE_SN = 652,
                                    WATER_NO = aspNetUser.CurrentWaterNo,
                                    B_ACCOUNT_SN = aspNetUser.UserId.Value,
                                    VALUE = "653",
                                    VALUE1 = updatedDate
                                };
                                alertsetitems.Add(MMcode1Item);
                            }

                            if (item == "654")
                            {
                                B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                                {
                                    B_ALART_CODE_SN = 652,
                                    WATER_NO = aspNetUser.CurrentWaterNo,
                                    B_ACCOUNT_SN = aspNetUser.UserId.Value,
                                    VALUE = "654",
                                    VALUE1 = updatedDate
                                };
                                alertsetitems.Add(MMcode1Item);
                            }
                            if (item == "655")
                            {
                                B_ALART_SETTING MMcode1Item = new B_ALART_SETTING()
                                {
                                    B_ALART_CODE_SN = 652,
                                    WATER_NO = aspNetUser.CurrentWaterNo,
                                    B_ACCOUNT_SN = aspNetUser.UserId.Value,
                                    VALUE = "655",
                                    VALUE1 = updatedDate
                                };
                                alertsetitems.Add(MMcode1Item);
                            }
                        }
                        userManageService.UpdateAlertServiceBySNAndWaterNo(aspNetUser.UserId.Value, aspNetUser.CurrentWaterNo, alertsetitems);
                    }

                    if (result >= 1 && model.WaterData != null)
                    {
                        //HttpContext.Session.SetString("WaterNo", string.Join(',', model.WaterNO));
                        // 序列化 List<F_B_LOGIN_WaterNo> 為 JSON 字符串
                        string waterNoJson = JsonConvert.SerializeObject(model.WaterData.ToList());
                        HttpContext.Session.SetString("WaterNo", waterNoJson);
                        return Json(Success(@$"更新成功"));
                    }
                    else if (result >= 1)
                        return Json(Success(@$"更新成功"));
                    else
                        return Json(Failed(message: "更新失敗"));
                }
                else
                {
                    return Json(ValidationFailed(
                        ModelState.Where(x => x.Value.Errors.Count > 0)
                            .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                            ), "欄位錯誤"));
                }
            }
            catch (Exception e)
            {
                return Json(Failed("系統錯誤"));
            }
        }

        /// <summary>
        /// 用於創建帳號
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult CreatUserInfo(CreateUserManageViewModel model)
        {
            //微軟為什麼你要把反向指名拿掉 cli不等於比較難寫齁 ==!?
            try
            {
                if (ModelState.IsValid)
                {
                    //檢查帳號是否存在系統中，不加一下唯一索引嗎:D
                    var UserCanUse = userManageService.IsThisAccountCanUsed(model.Account);
                    if (!UserCanUse.IsExist)
                    {
                        ModelState.AddModelError("Account", UserCanUse.Message);
                        return Json(ValidationFailed(
                        ModelState.Where(x => x.Value.Errors.Count > 0)
                            .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                            ), "系統內已有相同的帳號註冊"));
                    }


                    var result = userManageService.CreateAccountInfo(model);
                    if (result >= 1)
                    {
                        var SN = userManageService.GetSNByAccount(model.Account);
                        //新增成功把 SN 加進 Session
                        HttpContext.Session.SetString("UserId", SN.ToString());
                        HttpContext.Session.SetString("UserName", model.Account);
                        //順便把現在的水號也加進去好了 芒草結繩也想出航麻煩
                        userManageService.CreateWaterNosBySN(SN, aspNetUser.CurrentWaterNo);
                        return Json(Success(@$"新增成功"));
                    }
                    else
                        return Json(Failed(message: "新增失敗"));
                }
                else
                {
                    return Json(ValidationFailed(
                        ModelState.Where(x => x.Value.Errors.Count > 0)
                            .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                            ), "欄位錯誤"));
                }
            }
            catch (Exception e)
            {
                return Json(Failed("系統錯誤"));
            }
        }

        [HttpPost]
        public IActionResult DeleteUserWaterNo(string WaterNo)
        {
            if (aspNetUser.UserId.HasValue)
            {
                userManageService.DeleteWateNoByUserSN(aspNetUser.UserId.Value, WaterNo);
            }

            return Json(Success());
        }

        public IActionResult UserSettingsNew()
        {
            ViewBag.IsTestUser = false;

            if (aspNetUser.UserId == 1)
            {
                ViewBag.IsTestUser = true;
            }

            ViewBag.IsSignAccount = false;
            if (aspNetUser.UserId != null)
            {
                ViewBag.IsSignAccount = true;
            }

            return View();
        }

        /// <summary>
        /// 載入這個使用者的警示設定之自動讀表期滿通知設定
        /// </summary>
        /// <returns></returns>
        public IActionResult LoadAlertSet()
        {
            if (aspNetUser.UserId != null)
            {
                var result = userManageService.GetAertSetByAccountSNAndWaterNo(aspNetUser.UserId.Value, aspNetUser.CurrentWaterNo.ToString());
                if (result != null)
                    return Json(Success<object>(result));
            }

            return Json(Failed(message: "無資料"));
        }

        /// <summary>
        /// 載入這個使用者的警示設定之自動讀表期滿通知設定
        /// </summary>
        /// <returns></returns>
        public IActionResult GetPhMeterQualifyDate()
        {
            var result = userManageService.GetPhMeterQualifyDateByWaterNo(aspNetUser.CurrentWaterNo.ToString());
            if (result != null)
                return Json(Success<object>(result));
            else
                return Json(Failed(message: "無資料"));
        }
    }
}
