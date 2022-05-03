using Microsoft.AspNetCore.Mvc;
using SqlData;
using System.Data.SqlClient;
using System.Diagnostics;
using TWNPPublic.Models;
using TWNPPublic.Models.Entity;

namespace TWNPPublic.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ISqlData sqlData;
        private readonly IDapperDataAccess dataAccess;

        public HomeController(ILogger<HomeController> logger, ISqlData sqlData, IDapperDataAccess dataAccess)
        {
            _logger = logger;
            this.sqlData = sqlData;
            this.dataAccess = dataAccess;
        }

        public IActionResult Index()
        {
            var sqlexecute = "SELECT * FROM [B_NEWS]";
            var execute = dataAccess.Execute(sqlexecute);

            var sqlString = "SELECT * FROM [B_NEWS]";
            var result = dataAccess.Query<B_NEWS>(sqlString);
    
            return View();
        }
        public IActionResult Login()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}