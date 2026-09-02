using Microsoft.AspNetCore.Mvc;
using TWNPPublic.Common.Attributes;

namespace TWNPPublic.Controllers
{
    [SessionAuthorization]//認證在這裡喔 沒有角色規則簡單隨便寫 :D
    [AutoValidateAntiforgeryToken]
    public class BasicController : ContextController
    {

    }
}
