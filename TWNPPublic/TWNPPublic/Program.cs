using twn.Middleware;
using TWNPPublic;

var builder = WebApplication.CreateBuilder(args);

// 添加配置appsettings.json
builder.Configuration.AddJsonFile("appsettings.json");

ConfigurationManager configuration = builder.Configuration;
//我還是習慣額外注入拍謝:D
Startup.ConfigureServices(builder.Services, configuration);

var app = builder.Build();

// 使用自定義的中介軟體(為了設定從appsettings.json取得的值變成全域變數)(位置在\Middleware\GlobalDataMiddleware.cs)
app.UseMiddleware<GlobalDataMiddleware>();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseSession();
app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();
app.UseCookiePolicy();

app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute(
      name: "areas",
      pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}"
    );
    endpoints.MapControllerRoute(
    name: "default",
    pattern: "{controller=Dashboard}/{action=Index}/{id?}"
    );
});

app.Run();
