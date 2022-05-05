using System.ComponentModel.DataAnnotations;

namespace TWNPPublic.ViewModels.Home
{
    public class HomeViewModel
    {
    }

    public class LoginViewModel
    {
        [Required(ErrorMessage = "帳號(水號)為必填")]
        public string UserName { get; set; } = string.Empty;

        [Required(ErrorMessage = "密碼為必填")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "驗證碼為必填")]
        public string CapthCode { get; set; } = string.Empty;
    }
}
