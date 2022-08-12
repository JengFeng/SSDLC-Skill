using Microsoft.AspNetCore.Mvc;
using SqlData;
using System.ComponentModel.DataAnnotations;
using System.Data.SqlClient;
using System.Diagnostics;
using TWNPPublic.Common.Extension;
using TWNPPublic.Common.Helper;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models;
using TWNPPublic.Models.Entity;
using TWNPPublic.ViewModels.Home;

namespace TWNPPublic.Controllers
{

    public enum ApiErrorCode
    {
        TokenError,
        Valid,
        NoSource,
        Other
    }
    public class LoginAppVm
    {
        [Required(ErrorMessage = "AccountNo App會員編號 為必填")]
        public string AccountNo { get; set; } = string.Empty;
        [Required(ErrorMessage = "WaterNo 水號 為必填")]
        public string WaterNo { get; set; } = string.Empty;
        [Required(ErrorMessage = "AccessToken 為必填")]
        public string AccessToken { get; set; } = string.Empty;
    }
    public class DenyAppAcounntVm
    {
        [Required(ErrorMessage = "WaterNo 水號 為必填")]
        public string WaterNo { get; set; } = string.Empty;
        [Required(ErrorMessage = "AccessToken 為必填")]
        public string AccessToken { get; set; } = string.Empty;
    }

    public class HomeController : ContextController
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IDapperDataAccess dataAccess;
        private readonly IHomeService homeService;
        private readonly string KingErrandYours = "H3ll0TWN9A99";
        public HomeController(ILogger<HomeController> logger,
            IDapperDataAccess dataAccess,
            IHomeService homeService)
        {
            _logger = logger;
            this.dataAccess = dataAccess;
            this.homeService = homeService;
        }

        private string FixBase64FromQueryString(string b)
        {
            return b.Replace(" ", "+");
        }

        /// <summary>
        /// APP用
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public IActionResult LoginAPP(LoginAppVm model)
        {

            if (!ModelState.IsValid)
            {
                var ErrorMessages = ModelState.Values.Where(c => c.Errors.Count() != 0).Select(c => string.Join(",", c.Errors.Select(x => x.ErrorMessage))).ToArray();
                return Json(Failed(
                    new
                    {
                        ErrorCode = ApiErrorCode.Valid.ToString(),
                        ErrorObj = ErrorMessages
                    },
                    "欄位錯誤"
                    ));
            }

            model.AccessToken = FixBase64FromQueryString(model.AccessToken);

            //檢查偸肯
            if (string.IsNullOrEmpty(model.AccessToken))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Empty Token Error"));
            }

            //檢查偸肯
            if (!string.IsNullOrEmpty(model.AccessToken))
            {
                try
                {
                    var RealToken = model.AccessToken.AesDecryptExtened(KingErrandYours);

                    if (RealToken.Substring(0, 2) != "7D")
                    {
                        return Json(Failed(new
                        {
                            ErrorCode = ApiErrorCode.TokenError.ToString(),
                        }, "Token Error,未合法的 Token"));
                    }
                }
                catch (Exception e)
                {
                    return Json(Failed(new
                    {
                        ErrorCode = ApiErrorCode.TokenError.ToString(),
                    }, "Token Error,解析錯誤"));
                }
            }


            //檢查是否為智慧水表
            if (!homeService.CheckWaterNoIsAutoMeter(model.WaterNo))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.NoSource.ToString(),
                }, "此水號非智慧水表"));
            }

            //在系統裡面有了就直接登入 而且帳號尚未被取消
            var getAccount = homeService.CheckAccountNoIsApp(model.WaterNo);
            //兩種情況一個真的沒有 一個被取消
            if (getAccount != null && getAccount.VALID != 0)
            {
                //看看水號有沒有，沒有的話寫到資料庫，並返回這個帳號所有WaterNo
                List<string> WaterNos = homeService.CheckWaterNoNoIsApp(getAccount.B_ACCOUNT_SN, model.WaterNo);

                SetLoginSession(
                            HttpContext,
                            getAccount.B_ACCOUNT,
                            model.WaterNo,
                            string.Join(',', WaterNos),
                            getAccount.B_ACCOUNT_SN.ToString());

                return RedirectToAction("Index", "Dashboard");
            }

            ViewBag.AccountNo = model.AccountNo;
            ViewBag.WaterNo = model.WaterNo;
            ViewBag.AccessToken = model.AccessToken;

            return View();
        }

        /// <summary>
        /// APP用
        /// </summary>
        /// <param name="AccountNo"></param>
        /// <param name="WaterNo"></param>
        /// <param name="AccessToken"></param>
        /// <param name="LoginType"></param>
        /// <returns></returns>
        [HttpPost]
        public IActionResult LoginAPP(string AccountNo, string WaterNo, string AccessToken, int LoginType)
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
                        }, "Token Error,未合法的 Token 非澎湖水號"));
                    }

                    homeService.CreateAppUser(WaterNo, WaterNo, AccessToken);
                    //寫一個帳密到資料庫
                    // UserName = AccountNo,Pwd = AccountNo
                    // 然後導去登入自動登入
                    return RedirectToAction("LoginAPP", "Home", new
                    {
                        AccountNo,
                        WaterNo,
                        AccessToken
                    });
                }
                catch (Exception e)
                {
                    return Json(Failed(new
                    {
                        ErrorCode = ApiErrorCode.TokenError.ToString(),
                    }, "Token Error,解析錯誤"));
                }
            }
            else
            {
                //自己去登入頁面
                return RedirectToAction("Login", "Home");
            }
        }


        /// <summary>
        /// APP用 取得 AccessToken
        /// </summary>
        /// <returns></returns>
        public IActionResult AccessToken(string WaterNo)
        {
            if (string.IsNullOrEmpty(WaterNo))
            {
                return Json(Failed(
                    new
                    {
                        ErrorCode = ApiErrorCode.Valid.ToString(),
                        ErrorObj = "WaterNo 水號為必填"
                    },
                    "欄位錯誤"
                    ));
            }

            //檢查澎湖水號
            if (WaterNo.Substring(0, 2) != "7D")
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Token Error,未合法的 Token 非澎湖水號"));
            }

            //檢查是否為智慧水表
            if (!homeService.CheckWaterNoIsAutoMeter(WaterNo))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.NoSource.ToString(),
                }, "此水號非智慧水表"));
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


        [HttpPost]
        public IActionResult DenyAppAcounnt(DenyAppAcounntVm model)
        {
            if (!ModelState.IsValid)
            {
                var ErrorMessages = ModelState.Values.Select(c => string.Join(",", c.Errors.Select(x => x.ErrorMessage))).ToArray();
                return Json(Failed(
                    new
                    {
                        ErrorCode = ApiErrorCode.Valid.ToString(),
                        ErrorObj = ErrorMessages
                    },
                    "欄位錯誤"
                    ));
            }

            model.AccessToken = FixBase64FromQueryString(model.AccessToken);

            //檢查偸肯
            if (string.IsNullOrEmpty(model.AccessToken))
            {
                return Json(Failed(new
                {
                    ErrorCode = ApiErrorCode.TokenError.ToString(),
                }, "Empty Token Error"));
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
                        }, "Token Error,未合法的 Token"));
                    }
                }
                catch (Exception e)
                {
                    return Json(Failed(new
                    {
                        ErrorCode = ApiErrorCode.TokenError.ToString(),
                    }, "Token Error,解析錯誤"));
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
                 "操作失敗，此使用者尚未在系統中"));
            }

        }

        /// <summary>
        /// 給業務版得後門 ( ¯ ﹃¯)
        /// </summary>
        /// <returns></returns>
        public IActionResult Index(string WaterNo)
        {
            SetLoginSession(
                        HttpContext,
                        WaterNo,
                        WaterNo,
                        WaterNo,
                        "0");

            return RedirectToAction("Index", "Dashboard");
        }

        /// <summary>
        /// 給用水記事的後門，怎麼一堆後門  ( ¯ ﹃¯)
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="dt"></param>
        /// <returns></returns>
        public IActionResult Note(string WaterNo, DateTime dt)
        {
            SetLoginSession(
                        HttpContext,
                        WaterNo,
                        WaterNo,
                        WaterNo,
                        "0");

            return RedirectToAction("Fancybox_tableChart", "Dashboard", new { Cdate = dt });
        }

        /// <summary>
        /// 給用水記事的後門，怎麼一堆後門  ( ¯ ﹃¯)
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <param name="dt"></param>
        /// <returns></returns>
        public IActionResult DetailsTable(string WaterNo, DateTime dt)
        {
            SetLoginSession(
                        HttpContext,
                        WaterNo,
                        WaterNo,
                        WaterNo,
                        "0");

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
        /// 登出
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

            var remoteIpAddress = HttpContext.Connection.RemoteIpAddress;

            var result = homeService.LoginByUserNameAndPassWord(model.UserName, model.Password, remoteIpAddress.ToString());
            if (result.IsSuccess)
            {
                SetLoginSession(
                    HttpContext,
                    model.UserName,
                    result.UserInfo.F_B_LOGIN_WaterNos.First().WATER_NO.ToString(),
                    string.Join(',', result.UserInfo.F_B_LOGIN_WaterNos.Select(c => c.WATER_NO)),
                    result.UserInfo.B_ACCOUNT_SN.ToString() ?? "0");

                return RedirectToAction("Index", "Dashboard");
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
        /// 錯誤頁 app.UseExceptionHandler("/Home/Error"); 有需要自己改
        /// </summary>
        /// <returns></returns>
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        private void SetLoginSession(HttpContext httpContext, string UserName, string CurrentWaterNo, string WaterNo, string UserId)
        {
            httpContext.Session.SetString("UserName", UserName);
            httpContext.Session.SetString("CurrentWaterNo", CurrentWaterNo);
            httpContext.Session.SetString("WaterNo", WaterNo);
            httpContext.Session.SetString("UserId", UserId);
        }
    }
}