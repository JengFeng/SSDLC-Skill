using Microsoft.AspNetCore.Mvc;
using SqlData;
using System.Data.SqlClient;
using System.Diagnostics;
using TWNPPublic.Common.Helper;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models;
using TWNPPublic.Models.Entity;
using TWNPPublic.ViewModels.Home;

namespace TWNPPublic.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IDapperDataAccess dataAccess;
        private readonly IHomeService homeService;

        public HomeController(ILogger<HomeController> logger,
            IDapperDataAccess dataAccess,
            IHomeService homeService)
        {
            _logger = logger;
            this.dataAccess = dataAccess;
            this.homeService = homeService;
        }

        /// <summary>
        /// 給業務版得後門 ( ¯ ﹃¯)
        /// </summary>
        /// <returns></returns>
        public IActionResult Index(string WaterNo)
        {
            HttpContext.Session.SetString("UserName", WaterNo);
            HttpContext.Session.SetString("CurrentWaterNo", WaterNo);
            HttpContext.Session.SetString("WaterNo", WaterNo);
            HttpContext.Session.SetString("UserId", "0");

            return RedirectToAction("Index", "Dashboard");
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
                HttpContext.Session.SetString("UserName", model.UserName);
                HttpContext.Session.SetString("CurrentWaterNo", result.UserInfo.F_B_LOGIN_WaterNos.First().WATER_NO.ToString());
                HttpContext.Session.SetString("WaterNo", string.Join(',', result.UserInfo.F_B_LOGIN_WaterNos.Select(c=>c.WATER_NO)));
                HttpContext.Session.SetString("UserId", result.UserInfo.B_ACCOUNT_SN.ToString() ?? "0");
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
    }
}