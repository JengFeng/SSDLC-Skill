using Microsoft.AspNetCore.Mvc;
using SqlData;
using System.Data.SqlClient;
using System.Diagnostics;
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

        public IActionResult Index()
        {
            var sqlexecute = "SELECT * FROM [B_NEWS]";
            var execute = dataAccess.Execute(sqlexecute);

            var sqlString = "SELECT * FROM [B_NEWS]";
            var result = dataAccess.Query<B_NEWS>(sqlString);

            return View();
        }

        [HttpPost]
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
            return View();
        }

        [HttpPost]
        public IActionResult Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            //if(model.CapthCode != )
            //{
            //    ModelState.AddModelError("CapthCode", "驗證碼錯誤");
            //    return View(model);
            //}

            var result = homeService.LoginByUserNameAndPassWord(model.UserName, model.Password);
            if (result.IsSuccess)
            {
                HttpContext.Session.SetString("UserName", model.UserName);
                return RedirectToAction("Index", "Dashboard");
            }
            else
            {
                ModelState.AddModelError("", result.Message);
            }

            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}