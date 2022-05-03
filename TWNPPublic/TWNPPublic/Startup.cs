using TWNPPublic.Domain.Extensions;

namespace TWNPPublic
{
    public class Startup
    {
        public static void ConfigureServices(IServiceCollection services)
        {
            services.AddControllersWithViews();

            //Wcf 功能網站的網址
            var wcfServerUrl = "http://localhost:41027/DapperService.svc";
            //加入資料庫注入
            services.AddWcfData(wcfServerUrl);
            //用ORM代理 Wcf
            services.AddWcfDapper(wcfServerUrl);
        }
    }
}
