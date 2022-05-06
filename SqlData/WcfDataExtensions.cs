using System;
using Microsoft.Extensions.DependencyInjection;

namespace SqlData
{
    public static class WcfDataExtensions
    {
        /// <summary>
        /// 加入WCF連線服務。
        /// </summary>
        /// <param name="defaultServiceUrl">連線網址</param> 
        public static IServiceCollection AddWcfData(this IServiceCollection services, string defaultServiceUrl)
        {
            if (services == null) throw new ArgumentNullException(nameof(services));
            if (defaultServiceUrl == null) throw new ArgumentNullException(nameof(defaultServiceUrl));
            //AddSingleton (單一性)            
            //AddScoped (範圍性)           
            //AddTransient (暫時性)            
            services.AddSingleton<ISqlData>(service => new WcfData(defaultServiceUrl));
            return services;
        }
    }
}
