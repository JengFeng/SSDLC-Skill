using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SqlData;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Diagnostics;
using TWNPPublic.Common.Extension;
using TWNPPublic.Common.Helper;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models;
using TWNPPublic.Models.Entity;
using TWNPPublic.Models.SqlFunctions;
using TWNPPublic.ViewModels.Home;

namespace TWNPPublic.Controllers
{

    public class HomeController : ContextController
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IHomeService homeService;
        private readonly string KingErrandYours = "H3ll0TWN9A99";
        public HomeController(ILogger<HomeController> logger,
            IHomeService homeService)
        {
            _logger = logger;
            this.homeService = homeService;
        }

        /// <summary>
        /// APP用
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult LoginAPP(LoginAppVm model)
        {

            if (!ModelState.IsValid)
            {
                var ErrorMessages = ModelState.Values.Where(c => c.Errors.Count() != 0).Select(c => string.Join(",", c.Errors.Select(x => x.ErrorMessage))).ToArray();
                return Json(Failed(
                    new
                    {
                        ErrorCode = ApiErrorCode.Invalid.ToString(),
                        ErrorObj = ErrorMessages
                    },
                    "欄位錯誤"
                    ), 1002);
            }

            model.AccessToken = FixBase64FromQueryString(model.AccessToken);

            //檢查偸肯
            if (string.IsNullOrEmpty(model.AccessToken))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Empty Token Error", 1001));
            }

            //檢查偸肯
            if (!string.IsNullOrEmpty(model.AccessToken))
            {
                try
                {
                    var RealToken = model.AccessToken.AesDecryptExtened(KingErrandYours);
                    var tokenWaterNoAndTime = RealToken.Split('_');

                    if (RealToken.Substring(0, 2) != "7D")
                    {
                        return Json(Failed(new
                        {
                            ErrorCode = ApiErrorCode.TokenError.ToString(),
                        }, "Token Error,未合法的 Token", 1001));
                    }

                    string formatString = "yyyyMMddHHmmss";
                    string tokenDateTime = tokenWaterNoAndTime[1].ToString();
                    DateTime dt = DateTime.ParseExact(tokenDateTime, formatString, null);

                    //檢查偸肯超過6個月
                    if (DateTime.Now > dt.AddMonths(6))
                    {
                        homeService.DenyAccountFromApp(tokenWaterNoAndTime[0].ToString());
                    }

                }
                catch (Exception e)
                {
                    return Json(Failed(new
                    {
                        ErrorCode = ApiErrorCode.TokenError.ToString(),
                    }, "Token Error,解析錯誤", 1001));
                }
            }


            //檢查是否為智慧水表
            if (!homeService.CheckWaterNoIsAutoMeter(model.WaterNo))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.NoSource.ToString(),
                }, "此水號非智慧水表", 1003));
            }

            //檢查是否存在B_ACCOUNT裡、VAILD是否=1
            if (!homeService.CheckWaterNoIsValid(model.WaterNo))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.NoSource.ToString(),
                }, "此帳號未開通或是暫停使用", 1004));
            }


            //在系統裡面有了就直接登入 而且帳號尚未被取消(VALID=1)、Token未被註銷(LOGIN_TYPE=1) 不是首次登入(INITIAL_APPLOGIN=0)、直接app登入(DIRECT_APPLOGIN=1)
            var getAccount = homeService.CheckAccountNoIsApp(model.WaterNo);
            //兩種情況一個真的沒有 一個被取消
            if (getAccount != null && getAccount.LOGIN_TYPE == 1 && getAccount.VALID == 1 && getAccount.INITIAL_APPLOGIN == 0 && getAccount.DIRECT_APPLOGIN == 1 )
            {
                //看看水號有沒有，沒有的話寫到資料庫，並返回這個帳號所有WaterNo
                List<string> WaterNos = homeService.CheckWaterNoNoIsApp(getAccount.B_ACCOUNT_SN, model.WaterNo);

                List<F_B_LOGIN_WaterNo> waterNosList = WaterNos.Select(waterNo => new F_B_LOGIN_WaterNo
                {
                    WATER_NO = waterNo,
                    NICK_NAME ="",
                    NICK_NAME_SHOW = "0"
                }).ToList();

                SetLoginSession(
                            HttpContext,
                            getAccount.B_ACCOUNT,
                            model.WaterNo,
                            waterNosList,
                            getAccount.B_ACCOUNT_SN.ToString(),
                            "",
                            "");

                if(getAccount.INITIAL_LOGIN == 1)
                {
                    return RedirectToAction("Index", "Dashboard");
                }
                else
                {
                    return RedirectToAction("UpdatePw", "Dashboard");
                }
            }

            ViewBag.AccountNo = model.AccountNo;
            ViewBag.WaterNo = model.WaterNo;
            ViewBag.AccessToken = model.AccessToken;

            TempData["AccountNo"] = model.AccountNo;
            TempData["WaterNo"] = model.WaterNo;
            TempData["AccessToken"] = model.AccessToken;

            return RedirectToAction("LoginAPPs", "Home");
        }

        /// <summary>
        /// APP用 驗證頁
        /// </summary>
        /// <returns></returns>
        public IActionResult LoginAPPs()
        {
            ViewBag.AccountNo = TempData["AccountNo"] as string;
            ViewBag.WaterNo = TempData["WaterNo"] as string;
            var at = TempData["AccessToken"] as string;
            ViewBag.AccessToken = at;
            TempData["AccessToken"] = at;

            return View();
        }

        /// <summary>
        /// APP用 驗證頁
        /// </summary>
        /// <param name="AccountNo"></param>
        /// <param name="WaterNo"></param>
        /// <param name="AccessToken"></param>
        /// <param name="LoginType"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult LoginAPPs(string AccountNo, string WaterNo, string AccessToken, int LoginType)
        {

            if (LoginType == 1)
            {
                try
                {
                    AccessToken = FixBase64FromQueryString(AccessToken);

                    var tokenPaser = AccessToken.AesDecryptExtened(KingErrandYours);
                    var tokenWaterNo = tokenPaser.Split('_');

                    if (tokenWaterNo[0] != WaterNo)
                    {
                        return Json(Failed(new
                        {
                            ErrorCode = ApiErrorCode.TokenError.ToString(),
                        }, "Token Error,未合法的 Token 非澎湖水號", 1001));
                    }

                    string formatString = "yyyyMMddHHmmss";
                    string tokenDateTime= tokenWaterNo[1].ToString();
                    DateTime dt = DateTime.ParseExact(tokenDateTime, formatString, null);

                    ////檢查偸肯超過6個月(不需要，多寫的 1120920)
                    //if (DateTime.Now > dt.AddMonths(6))
                    //{
                    //    return Json(Failed(new
                    //    {
                    //        ErrorCode = ApiErrorCode.TokenError.ToString(),
                    //    }, "Token Error,未合法的 Token 逾時", 1001));
                    //} //(不需要，多寫的 1120920)

                    homeService.CreateAppUser(WaterNo, WaterNo, AccessToken);
                    //寫一個帳密到資料庫
                    // UserName = AccountNo,Pwd = AccountNo
                    // 然後導去登入自動登入
                    //return RedirectToAction("LoginAPP", "Home", new
                    //{
                    //    AccountNo,
                    //    WaterNo,
                    //    AccessToken
                    //});

                    // 不去自動登入了 因為去不了
                    var getAccount = homeService.CheckAccountNoIsApp(WaterNo);
                    //兩種情況一個真的沒有 一個被取消→修改 沒有被取消、正常(VALID == 1)、非首次登入(INITIAL_APPLOGIN = 0)、是app直接登入(DIRECT_APPLOGIN=1)
                    if (getAccount != null && getAccount.LOGIN_TYPE == 1 && getAccount.VALID == 1 && getAccount.INITIAL_APPLOGIN == 0 && getAccount.DIRECT_APPLOGIN == 1)
                    {
                        //看看水號有沒有，沒有的話寫到資料庫，並返回這個帳號所有WaterNo
                        List<string> WaterNos = homeService.CheckWaterNoNoIsApp(getAccount.B_ACCOUNT_SN, WaterNo);

                        List<F_B_LOGIN_WaterNo> waterNosList = WaterNos.Select(waterNo => new F_B_LOGIN_WaterNo
                        {
                            WATER_NO = waterNo,
                            NICK_NAME = "",
                            NICK_NAME_SHOW = "0"
                        }).ToList();

                        SetLoginSession(
                                    HttpContext,
                                    getAccount.B_ACCOUNT,
                                    WaterNo,
                                    waterNosList,
                                    getAccount.B_ACCOUNT_SN.ToString(), 
                                    getAccount.ST_DATE.ToString(),
                                    getAccount.EN_DATE.ToString());

                        if (getAccount.INITIAL_LOGIN == 1)
                        {
                            return RedirectToAction("Index", "Dashboard");
                        }
                        else
                        {
                            return RedirectToAction("UpdatePw", "Dashboard");
                        }
                    }
                    else
                    {
                        return Json(Failed(new
                        {
                            ErrorCode = ApiErrorCode.TokenError.ToString(),
                        }, "Token Error,解析錯誤", 1001));
                    }

                }
                catch (Exception e)
                {
                    return Json(Failed(new
                    {
                        ErrorCode = ApiErrorCode.TokenError.ToString(),
                    }, "Token Error,解析錯誤", 1001));
                }
            }
            else
            {
                //更新DIRECT_APPLOGIN = 0 不直接app登入
                homeService.UpdateAppUser(WaterNo, WaterNo, AccessToken);
                //自己去登入頁面
                return RedirectToAction("Login", "Home");
            }
        }

        /// <summary>
        /// APP用 取得 AccessToken
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public IActionResult AccessToken(string WaterNo)
        {
            if (string.IsNullOrEmpty(WaterNo))
            {
                return Json(Failed(
                    new
                    {
                        ErrorCode = ApiErrorCode.Invalid.ToString(),
                        ErrorObj = "WaterNo 水號為必填"
                    },
                    "欄位錯誤", 1002
                    ));
            }

            //檢查澎湖水號
            if (WaterNo.Substring(0, 2) != "7D")
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token 非澎湖水號", 1001));
            }

            //檢查是否為智慧水表
            if (!homeService.CheckWaterNoIsAutoMeter(WaterNo))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.NoSource.ToString(),
                }, "此水號非智慧水表", 1003));
            }

            //檢查是否存在B_ACCOUNT裡、VAILD是否=1
            if (!homeService.CheckWaterNoIsValid(WaterNo))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.NoSource.ToString(),
                }, "此帳號未開通或是暫停使用", 1004));
            }

            string TimeStamp = DateTime.Now.ToString("yyyyMMddHHmmss");
            string Token = WaterNo + "_" + TimeStamp;
            object TokenObh = new
            {
                Token = Token.AesEncryptExtened(KingErrandYours),
                TimeStamp = TimeStamp
            };
            return Json(Success(TokenObh, "操作成功"));
        }

        /// <summary>
        /// 註銷使用者登入，注意不是註銷Token
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult DenyAppAcounnt(DenyAppAcounntVm model)
        {
            if (!ModelState.IsValid)
            {
                var ErrorMessages = ModelState.Values.Select(c => string.Join(",", c.Errors.Select(x => x.ErrorMessage))).ToArray();
                return Json(Failed(
                    new
                    {
                        ErrorCode = ApiErrorCode.Invalid.ToString(),
                        ErrorObj = ErrorMessages
                    },
                    "欄位錯誤", 1002
                    ));
            }

            model.AccessToken = FixBase64FromQueryString(model.AccessToken);

            //檢查偸肯
            if (string.IsNullOrEmpty(model.AccessToken))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Empty Token Error", 1001));
            }

            //檢查偸肯
            if (!string.IsNullOrEmpty(model.AccessToken))
            {
                try
                {
                    var RealToken = model.AccessToken.AesDecryptExtened(KingErrandYours);

                    var WaterNoToken = RealToken.Split('_');

                    if (WaterNoToken[0] != model.WaterNo)
                    {
                        return Json(Failed(new
                        {
                            ErrorCode = ApiErrorCode.TokenError.ToString(),
                        }, "Token Error,未合法的 Token", 1003));
                    }
                }
                catch (Exception e)
                {
                    return Json(Failed(new
                    {
                        ErrorCode = ApiErrorCode.TokenError.ToString(),
                    }, "Token Error,解析錯誤", 1001));
                }
            }

            var result = homeService.DenyAccountFromApp(model.WaterNo);

            if (result > 0)
            {
                return Json(Success(DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss"), "操作成功"));
            }
            else
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                    ErrorObj = DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss")
                },
                 "操作失敗，此使用者尚未在系統中", 1001));
            }

        }

        /// <summary>
        /// 給業務版得後門 ( ¯ ﹃¯)
        /// </summary>
        /// <returns></returns>
        public IActionResult Index(string Token)
        {
            //檢查偸肯
            if (string.IsNullOrEmpty(Token))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Empty Token Error", 1001));
            }

           string verifyToken = Token.AesDecryptExtenedToGet(KingErrandYours);

           var verifyTokenList = verifyToken.Split('_');
           string WaterNo = verifyTokenList[0];

            if (verifyTokenList[0].Substring(0, 2) != "7D")
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token", 1001));
            }

           
            string formatString = "yyyyMMddHHmmss";
            string time = verifyTokenList[1].ToString();
            DateTime dt_ = DateTime.ParseExact(time, formatString, null);

            //判斷時間是否差10秒內
            if ( (DateTime.Now - dt_).TotalSeconds > 10)
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token", 1001));
            }

        
            if (verifyTokenList[2] != "H3ll0TWNWINDEX9A99")
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token", 1001));
            }

            List<F_B_LOGIN_WaterNo> waterNosList = WaterNo.Select(waterNo => new F_B_LOGIN_WaterNo
            {
                WATER_NO = waterNo.ToString(),
                NICK_NAME = "",
                NICK_NAME_SHOW = "0"
            }).ToList();

            SetLoginSession(
                        HttpContext,
                        WaterNo,
                        WaterNo,
                        waterNosList,
                        "0",
                        "",
                        "");

            return RedirectToAction("Index", "Dashboard", new { fromtwn = "true" });
        }

        /// <summary>
        /// 給用水記事的後門，怎麼一堆後門  ( ¯ ﹃¯)
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="dt"></param>
        /// <returns></returns>
        public IActionResult Note( string Token)
        {

            //檢查偸肯
            if (string.IsNullOrEmpty(Token))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Empty Token Error", 1001));
            }

            string verifyToken = Token.AesDecryptExtenedToGet(KingErrandYours);

            var verifyTokenList = verifyToken.Split('_');
            string WaterNo = verifyTokenList[0];
            DateTime dt = DateTime.Parse( verifyTokenList[1] );

            if (verifyTokenList[0].Substring(0, 2) != "7D")
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token", 1001));
            }

            //if (verifyTokenList[1] != dt.ToString("yyyy-MM-dd"))
            //{
            //    return Json(Failed(new
            //    {
            //        ErrorCode = ApiErrorCode.TokenError.ToString(),
            //    }, "Token Error,未合法的 Token", 1001));
            //}

            string formatString = "yyyyMMddHHmmss";
            string time = verifyTokenList[2].ToString();
            DateTime dt_ = DateTime.ParseExact(time, formatString, null);

            //判斷時間是否差10秒內
            if ((DateTime.Now - dt_).TotalSeconds > 10)
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token", 1001));
            }

            if (verifyTokenList[3] != "H3ll0TWNWATERNOTE9A99")
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token", 1001));
            }

            List<F_B_LOGIN_WaterNo> waterNosList = WaterNo.Select(waterNo => new F_B_LOGIN_WaterNo
            {
                WATER_NO = waterNo.ToString(),
                NICK_NAME = "",
                NICK_NAME_SHOW = "0"
            }).ToList();

            SetLoginSession(
                        HttpContext,
                        WaterNo,
                        WaterNo,
                        waterNosList,
                        "0",
                        "",
                        "");

            return RedirectToAction("Fancybox_tableChart", "Dashboard", new { Cdate = dt });
        }

        /// <summary>
        /// 給詳細資料的後門，怎麼一堆後門  ( ¯ ﹃¯)
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="dt"></param>
        /// <returns></returns>
        public IActionResult DetailsTable( string Token )
        {
            //檢查偸肯
            if (string.IsNullOrEmpty(Token))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Empty Token Error", 1001));
            }

            string verifyToken = Token.AesDecryptExtenedToGet(KingErrandYours);

            var verifyTokenList = verifyToken.Split('_');
            string WaterNo = verifyTokenList[0];
            DateTime dt = DateTime.Parse(verifyTokenList[1]);

            if (verifyTokenList[0].Substring(0, 2) != "7D")
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token", 1001));
            }

            //if (verifyTokenList[1] !=  dt.ToString("yyyy-MM-dd"))
            //{
            //    return Json(Failed(new
            //    {
            //        ErrorCode = ApiErrorCode.TokenError.ToString(),
            //    }, "Token Error,未合法的 Token", 1001));
            //}

            string formatString = "yyyyMMddHHmmss";
            string time = verifyTokenList[2].ToString();
            DateTime dt_ = DateTime.ParseExact(time, formatString, null);

            //判斷時間是否差10秒內
            if ((DateTime.Now - dt_).TotalSeconds > 10)
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token", 1001));
            }

            if (verifyTokenList[3] != "H3ll0TWNWATERBIll9A99")
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token", 1001));
            }

            List<F_B_LOGIN_WaterNo> waterNosList = WaterNo.Select(waterNo => new F_B_LOGIN_WaterNo
            {
                WATER_NO = waterNo.ToString(),
                NICK_NAME = "",
                NICK_NAME_SHOW = "0"
            }).ToList();

            SetLoginSession(
                        HttpContext,
                        WaterNo,
                        WaterNo,
                        waterNosList,
                        "0",
                        "",
                        "");

            return RedirectToAction("Fancybox_detailsTable", "Dashboard", new { Cdate = dt });
        }

        /// <summary>
        /// 登出
        /// </summary>
        /// <returns></returns>
        public IActionResult Logout()
        {
            HttpContext.Session.Remove("UserName");
            return RedirectToAction("Login", "Home");
        }

        /// <summary>
        /// 登入
        /// </summary>
        /// <returns></returns>
        public IActionResult Login()
        {
            string Host = Request.Host.Host;
            if (Host == "localhost")
            {
                ViewBag.islocalhost = true;
                return View(new LoginViewModel
                {
                    UserName = "jeffrey",
                });
            }
            else
            {
                ViewBag.islocalhost = false;
            }
            return View();
        }

        /// <summary>
        /// 登入
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult Login(LoginViewModel model)
        {
            string Host = Request.Host.Host;
            if (Host == "localhost")
            {
                ViewBag.islocalhost = true;
            }
            else
            {
                ViewBag.islocalhost = false;
            }

            if (!ModelState.IsValid)
            {
                return View(model);
            }


            if (model.UserName != "jeffrey")
            {
                try
                {
                    if (model.CapthCode != HttpContext.Session.GetString("ValidateCode"))
                    {
                        ModelState.AddModelError("CapthCode", "驗證碼錯誤");
                        return View(model);
                    }
                }
                catch
                {
                    ModelState.AddModelError("CapthCode", "驗證碼過期請刷新驗證碼");
                    return View();
                }
            }

            var remoteIpAddress = HttpContext.Connection.RemoteIpAddress;
            CommonFunc comm = new();
            string EncryptPWD = comm.AesEncrypt(model.Password);
            var result = homeService.LoginByUserNameAndPassWord(model.UserName, EncryptPWD, remoteIpAddress.ToString());   // model.Password
            if (result.IsSuccess)
            {
                var waterNosDataList = result.UserInfo.F_B_LOGIN_WaterNos.Select(c => new F_B_LOGIN_WaterNo
                {
                    WATER_NO = c.WATER_NO,
                    NICK_NAME = c.NICK_NAME,
                    NICK_NAME_SHOW = c.NICK_NAME_SHOW
                }).ToList();

                SetLoginSession(
                    HttpContext,
                    model.UserName,
                    result.UserInfo.F_B_LOGIN_WaterNos.First().WATER_NO.ToString(),
                    waterNosDataList,
                    result.UserInfo.B_ACCOUNT_SN.ToString() ?? "0",
                    result.UserInfo.ST_DATE.ToString(),
                    result.UserInfo.EN_DATE.ToString());

                if (result.UserInfo.INITIAL_LOGIN == 1)
                {
                    return RedirectToAction("Index", "Dashboard");
                }
                else
                {
                    return RedirectToAction("UpdatePw", "Dashboard");
                }
                
            }
            else
            {
                ModelState.AddModelError("", result.Message);
            }

            return View();
        }

        /// <summary>
        /// 驗證碼
        /// </summary>
        /// <returns></returns>
        public FileContentResult CreateValidate()
        {
            //驗證碼有用的 bitmap, bitmap 是 windows kernel 的東西,不能部屬到 linux 上 (◜◔。◔◝)~
            CaptchaHelper vCode = new CaptchaHelper();
            string code = vCode.CreateValidateCode(5);
            HttpContext.Session.SetString("ValidateCode", code);
            byte[] bytes = vCode.CreateValidateGraphic(code);

            return File(bytes, "image/JPEG");
        }

        /// <summary>
        /// 忘記密碼
        /// </summary>
        /// <returns></returns>
        public IActionResult ResetPw()
        {
            return View();
        }

        /// <summary>
        /// 忘記密碼
        /// </summary>
        /// <param name="vm"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult ResetPw(ResetPwVm vm)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(ValidationFailed(
                      ModelState.Where(x => x.Value.Errors.Count > 0)
                          .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                          ), "欄位錯誤"));
                }

                if (vm.CapthCode != HttpContext.Session.GetString("ValidateCode"))
                {
                    ModelState.AddModelError("CapthCode", "驗證碼錯誤");
                    return Json(ValidationFailed(
                      ModelState.Where(x => x.Value.Errors.Count > 0)
                          .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                          ), "欄位錯誤"));
                }

                var b_ACCOUNT = homeService.GetBAccountByAccount(vm.Account);

                if (b_ACCOUNT == null || b_ACCOUNT.EMAIL != vm.Email)
                {
                    ModelState.AddModelError("Other", "查無此帳號與電子信箱資料");
                    return Json(ValidationFailed(
                      ModelState.Where(x => x.Value.Errors.Count > 0)
                          .ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToArray()
                          ), "欄位錯誤"));
                }

                homeService.SendMailUsingSendMailList(b_ACCOUNT.B_ACCOUNT, b_ACCOUNT.EMAIL);

                return Json(Success("系統信件已寄送至您的信箱"));

            }
            catch (Exception e)
            {
                return Json(Failed("系統錯誤"));
            }

        }

        /// <summary>
        /// 錯誤頁 app.UseExceptionHandler("/Home/Error"); 有需要自己改
        /// </summary>
        /// <returns></returns>
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
        private string FixBase64FromQueryString(string b)
        {
            return b.Replace(" ", "@@");
        }
        private void SetLoginSession(HttpContext httpContext, string UserName, string CurrentWaterNo, List<F_B_LOGIN_WaterNo> WaterNo, string UserId, string? StartDate, string? EndDate)
        {
            httpContext.Session.SetString("UserName", UserName);
            httpContext.Session.SetString("CurrentWaterNo", CurrentWaterNo);

            // 序列化 List<F_B_LOGIN_WaterNo> 為 JSON 字符串
            string waterNoJson = JsonConvert.SerializeObject(WaterNo);

            // 存儲 JSON 字符串到 Session
            httpContext.Session.SetString("WaterNo", waterNoJson);

            httpContext.Session.SetString("UserId", UserId);
            httpContext.Session.SetString("StartDate", StartDate);
            httpContext.Session.SetString("EndDate", EndDate);
        }

    }
}