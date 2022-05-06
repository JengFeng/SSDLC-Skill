using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Extensions;
using TWNPPublic.Domain.Service;

namespace TWNPPublic
{
    public class Startup
    {
        public static void ConfigureServices(IServiceCollection services)
        {
            services.AddSession(option => {
                option.Cookie.Name = ".TWNP.Session";
                option.IdleTimeout = TimeSpan.FromSeconds(3600);
                option.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            });

            services.AddControllersWithViews().AddJsonOptions(option =>
            {
                //Json按原類型回傳
                option.JsonSerializerOptions.PropertyNamingPolicy = null;
            });

            //Wcf 功能網站的網址
            var wcfServerUrl = "http://localhost:41027/DapperService.svc";
            //加入資料庫注入
            services.AddWcfData(wcfServerUrl);
            //用ORM代理 Wcf
            services.AddWcfDapper(wcfServerUrl);

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddScoped<IAspNetUser, AspNetUser>();
            services.AddTransient<IHomeService, HomeService>();
            services.AddTransient<IDashboardService, DashboardService>();
        }
    }
}
