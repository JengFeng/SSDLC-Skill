using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace TWNPPublic.Middleware
{
    public class GlobalDataMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public GlobalDataMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task Invoke(HttpContext context)
        {
            // 取得 appsettings.json 中的設置值
            var yourSettingValue = _configuration["urlPrefix"];

            // 將設置值放置到 HttpContext 中
            context.Items["urlPrefix"] = yourSettingValue;

            await _next(context);
        }
    }
}
