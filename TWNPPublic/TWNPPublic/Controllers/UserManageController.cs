using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models.Entity;
using TWNPPublic.Models.SqlFunctions;
using TWNPPublic.ViewModels.UserManage;

namespace TWNPPublic.Controllers
{
    [Menu("密碼設定")]
    public class UserManageController : BasicController
    {
        private readonly IAspNetUser aspNetUser;
        private readonly IUserManageService userManageService;
        private readonly IDashboardService dashboardService;

        public UserManageController(IAspNetUser aspNetUser, IUserManageService userManageService, IDashboardService dashboardService)
        {
            this.aspNetUser = aspNetUser;
            this.userManageService = userManageService;
            this.dashboardService = dashboardService;
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

            bool isGroupedAccount = userManageService.IsSttnGrpIdExist(aspNetUser.Name) != null;
            ViewBag.IsGroupedAccount = isGroupedAccount;//false; //isGroupedAccount;

            return View();
        }

        /// <summary>
        /// 用於取得使用者資料
        /// </summary>
        /// <returns></returns>
        public IActionResult GetUserInfo()
        {
            //if (aspNetUser.UserId != null)
            //{
            //    var result = userManageService.GetAccountBySN(aspNetUser.UserId.Value);
            //    if (result != null) {
            //        CommonFunc comm = new();
            //        result.APWD = comm.AesDecrypt(result.APWD);
            //        return Json(Success<b_ACCOUNT>(result));
            //    }

            //}

            if (aspNetUser.UserId != null)
            {
                var result = userManageService.GetAccountBySN(aspNetUser.UserId.Value);
                if (result != null)
                {
                    bool isGroupedAccount = userManageService.IsSttnGrpIdExist(aspNetUser.Name) != null;
                    // 建立 DTO 或匿名物件，不包含密碼
                    var dto = new
                    {
                        B_ACCOUNT = result.B_ACCOUNT,
                        EMAIL = result.EMAIL,
                        CELL_PHONE = result.CELL_PHONE,
                        IS_GROUPED_ACCOUNT = isGroupedAccount // 傳遞給前端判斷
                    };

                    return Json(Success(dto));
                }
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

                // 檢查是否為歸戶帳號
                bool isGroupedAccount = userManageService.IsSttnGrpIdExist(aspNetUser.Name) != null;

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

                    var data = dashboardService.GetAccountBySN(aspNetUser.UserId.Value);
                    if (data == null) return Json(Failed("查無此使用者"));
                    //if (string.IsNullOrWhiteSpace(model.Pwd)) return Json(Failed("密碼不得為空"));
                    //CommonFunc comm = new();
                    //var oldAPwd = comm.AesEncrypt(model.Pwd); //加密舊密碼

                    //// 如果與舊密碼不同 → 檢查新密碼規則
                    //if ( oldAPwd != data.APWD )
                    //{
                    //  if (!CommonFunc.magicword(model.Pwd))
                    //     return Json(Failed("請輸入密碼長度需為8位元，包含大小寫英文字母、特殊符號、數字"));
                    //}

                    CommonFunc comm = new();
                    bool isPasswordChanged = false;

                    // 如果密碼欄位有值，才進行密碼更新和驗證
                    if (!string.IsNullOrWhiteSpace(model.Pwd))
                    {
                        var newAPwd = comm.AesEncrypt(model.Pwd);
                        isPasswordChanged = newAPwd != data.APWD;
                        // 檢查是否與舊密碼相同
                        if (newAPwd != data.APWD)
                        {
                            // 驗證新密碼強度
                            if (!CommonFunc.magicword(model.Pwd))
                                return Json(Failed("請輸入密碼長度需為8位元，包含大小寫英文字母、特殊符號、數字"));
                        }
                    }
                    else
                    {
                        // 如果密碼為空，保持原密碼不變
                        model.Pwd = comm.AesDecrypt(data.APWD);
                    }

                    // 如果是歸戶帳號，不允許修改帳號和水號資料
                    if (isGroupedAccount)
                    {
                        model.Account = data.B_ACCOUNT; // 保持原帳號
                        model.WaterData = null; // 清空水號資料，不允許修改
                        model.ExpDate = null; // 清空保固截止日通知設定
                    }

                    var result = userManageService.UpdateAccountInfo(model, aspNetUser.UserId.Value, isPasswordChanged);

                    // 只有非歸戶帳號才處理自動讀表期滿通知
                    if (!isGroupedAccount && model.ExpDate != null)
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
                        //從資料庫重新查詢水號列表，保持原始順序
                        var waterNosFromDb = userManageService.ListedWaterNOBySN(aspNetUser.UserId.Value);
                        
                        // 轉換為 F_B_LOGIN_WaterNo 格式
                        var waterNosDataList = waterNosFromDb.Select(c => new F_B_LOGIN_WaterNo
                        {
                            WATER_NO = c.WATER_NO,
                            NICK_NAME = c.NICK_NAME,
                            NICK_NAME_SHOW = c.NICK_NAME_SHOW?.ToString("0") ?? string.Empty  // 轉換為整數格式字串
                        }).ToList();

                        // 序列化 List<F_B_LOGIN_WaterNo> 為 JSON 字符串
                        string waterNoJson = JsonConvert.SerializeObject(waterNosDataList);
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
            //ViewBag.IsTestUser = false;
            ViewBag.IsTestUser = true;  //不管是不是測試帳號都顯示

            if (aspNetUser.UserId == 1)
            {
                ViewBag.IsTestUser = true;
            }

            //ViewBag.IsSignAccount = false;
            ViewBag.IsSignAccount = true;  //不會從網站上註冊的帳號
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
