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

    public class GetIsAutoMeter
    {
        public int? PH_METER_LIST_SN { get; set; }
    }

    public class GetBACCOUNT
    {
        public int B_ACCOUNT_SN { get; set; }
    }
    public class ResetPwVm
    {
        [Required(ErrorMessage = "帳號為必填欄位")]
        public string Account { get; set; } = string.Empty;

        [Required(ErrorMessage = "電子信箱為必填欄位")]
        [EmailAddress(ErrorMessage = "請檢察您的電子信箱格式")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "驗證碼為必填")]
        public string CapthCode { get; set; } = string.Empty;
    }

}
