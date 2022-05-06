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

        //public IActionResult Index()
        //{
        //    var sqlexecute = "SELECT * FROM [B_NEWS]";
        //    var execute = dataAccess.Execute(sqlexecute);

        //    var sqlString = "SELECT * FROM [B_NEWS]";
        //    var result = dataAccess.Query<B_NEWS>(sqlString);

        //    return View();
        //}

        public IActionResult Logout()
        {
            HttpContext.Session.Remove("UserName");
            return RedirectToAction("Login", "Home");
        }

        public IActionResult Login()
        {
            string Host = Request.Host.Host;
            if (Host == "localhost")
            {
                ViewBag.islocalhost = true;
                return View(new LoginViewModel
                {
                    UserName = "7D76026501K",
                });
            }
            else
            {
                ViewBag.islocalhost = false;
            }
            return View();
        }

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

            var result = homeService.LoginByUserNameAndPassWord(model.UserName, model.Password);
            if (result.IsSuccess)
            {
                HttpContext.Session.SetString("UserName", model.UserName);
                HttpContext.Session.SetString("WaterNo", result.WaterNos.First().WATER_NO);
                return RedirectToAction("Index", "Dashboard");
            }
            else
            {
                ModelState.AddModelError("", result.Message);
            }

            return View();
        }

        public FileContentResult CreateValidate()
        {
            //驗證碼有用的 bitmap, bitmap 是 windows kernel 的東西,不能部屬到 linux 上 (◜◔。◔◝)~
            CaptchaHelper vCode = new CaptchaHelper();
            string code = vCode.CreateValidateCode(5);
            HttpContext.Session.SetString("ValidateCode", code);
            byte[] bytes = vCode.CreateValidateGraphic(code);

            return File(bytes, "image/JPEG");
        }


        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}