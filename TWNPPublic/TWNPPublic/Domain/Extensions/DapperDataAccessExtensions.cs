using SqlData;

namespace TWNPPublic.Domain.Extensions
{
    public static class DapperDataAccessExtensions
    {
        /// <summary>
        /// 加入WCF連線服務。
        /// </summary>
        /// <param name="defaultServiceUrl">連線網址</param> 
        public static IServiceCollection AddWcfDapper(this IServiceCollection services, string defaultServiceUrl)
        {
            //單利模式注入注意一下 不要重複連線了:D
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (defaultServiceUrl == null) throw new ArgumentNullException(nameof(defaultServiceUrl));
            services.AddSingleton<IDapperDataAccess>(service => new DapperDataAccess(defaultServiceUrl));
            return services;
        }
    }
}
