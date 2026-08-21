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
        public string Pwd { get; set; } = string.Empty;

        //[Required(ErrorMessage = "驗證碼為必填")]
        public string? CapthCode { get; set; } = string.Empty;
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
    public class LoginAppVm
    {
        [Required(ErrorMessage = "AccountNo App會員編號 為必填")]
        public string AccountNo { get; set; } = string.Empty;
        [Required(ErrorMessage = "WaterNo 水號 為必填")]
        public string WaterNo { get; set; } = string.Empty;
        [Required(ErrorMessage = "AccessToken 為必填")]
        public string AccessToken { get; set; } = string.Empty;
    }

    public class AppAccessTokenV4RequestVm
    {
        [Required(ErrorMessage = "grant_type 為必填")]
        public string grant_type { get; set; } = string.Empty;

        [Required(ErrorMessage = "account_no 為必填")]
        public string account_no { get; set; } = string.Empty;

        [Required(ErrorMessage = "water_no 為必填")]
        public string water_no { get; set; } = string.Empty;

        [Required(ErrorMessage = "redirect_uri 為必填")]
        public string redirect_uri { get; set; } = string.Empty;
    }

    public class LoginAppV4Vm
    {
        [Required(ErrorMessage = "account_no 為必填")]
        public string account_no { get; set; } = string.Empty;

        [Required(ErrorMessage = "water_no 為必填")]
        public string water_no { get; set; } = string.Empty;

        [Required(ErrorMessage = "access_token 為必填")]
        public string access_token { get; set; } = string.Empty;
    }

    public class ExternalLoginViewModel
    {
        [Required(ErrorMessage = "帳號為必填")]
        public string Account { get; set; } = string.Empty;

        [Required(ErrorMessage = "密碼為必填")]
        public string Password { get; set; } = string.Empty;

        public string GrantType { get; set; } = string.Empty;

        public string AccountNo { get; set; } = string.Empty;

        public string WaterNo { get; set; } = string.Empty;

        public string RedirectUri { get; set; } = string.Empty;

        [Required(ErrorMessage = "驗證碼為必填")]
        public string CapthCode { get; set; } = string.Empty;
    }

    public class AppTokenConfirmViewModel
    {
        public string GrantType { get; set; } = string.Empty;

        public string AccountNo { get; set; } = string.Empty;

        public string WaterNo { get; set; } = string.Empty;

        public string RedirectUri { get; set; } = string.Empty;
    }

    public class AppTokenV4ResponseVm
    {
        public string account_no { get; set; } = string.Empty;

        public string water_no { get; set; } = string.Empty;

        public int result { get; set; }

        public string message { get; set; } = string.Empty;

        public string? access_token { get; set; }

        public string? expires_in { get; set; }

        public string? refresh_token { get; set; }
    }

    public class AppTokenInfoDto
    {
        public string ACCOUNT_NO { get; set; } = string.Empty;

        public string WATER_NO { get; set; } = string.Empty;

        public string ACCESS_TOKEN { get; set; } = string.Empty;

        public DateTime EXPIRES_AT { get; set; }

        public decimal? VALID { get; set; }
    }
    public class DenyAppAcounntVm
    {
        [Required(ErrorMessage = "WaterNo 水號 為必填")]
        public string WaterNo { get; set; } = string.Empty;
        [Required(ErrorMessage = "AccessToken 為必填")]
        public string AccessToken { get; set; } = string.Empty;
    }
    public class WaterNoInfoDto
    {
        public string WATER_NO { get; set; }
        public string NICK_NAME { get; set; }
        public decimal? NICK_NAME_SHOW { get; set; }
    }

    public enum ApiErrorCode
    {
        TokenError,
        Invalid,
        NoSource,
        Other
    }

}
