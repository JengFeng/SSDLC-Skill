using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Extensions;
using TWNPPublic.Domain.Service;

namespace TWNPPublic
{
    public class Startup
    {
        public static void ConfigureServices(IServiceCollection services,IConfiguration configuration)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.ConfigureApplicationCookie(options =>
            {
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.None;
            });

            services.AddSession(option => {
                option.Cookie.HttpOnly = true;
                option.Cookie.Name = ".TWNP.Session";
                option.Cookie.SameSite = SameSiteMode.None;
                option.IdleTimeout = TimeSpan.FromSeconds(3600);
                option.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            });

            services.AddControllersWithViews().AddJsonOptions(option =>
            {
                //Json按原類型回傳
                option.JsonSerializerOptions.PropertyNamingPolicy = null;
            });

            //Wcf 功能網站的網址
            var wcfServerUrl = configuration["DapperWcfUrl"];
            var SQLWcfUrl = configuration["SQLWcfUrl"];
            //加入資料庫注入
            services.AddWcfData(SQLWcfUrl);
            //用ORM代理 Wcf
            services.AddWcfDapper(wcfServerUrl);

            //服務只有幾個就不用AOF了
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddScoped<IAspNetUser, AspNetUser>();
            services.AddTransient<IHomeService, HomeService>();
            services.AddTransient<IDashboardService, DashboardService>();
            services.AddTransient<IAlertService, AlertService>();
            services.AddTransient<IUserManageService, UserManageService>();
            services.AddTransient<IQualityService, QualityService>();
        }
    }
}
