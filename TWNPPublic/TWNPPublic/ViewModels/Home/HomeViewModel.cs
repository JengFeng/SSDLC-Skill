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
    public class DenyAppAcounntVm
    {
        [Required(ErrorMessage = "WaterNo 水號 為必填")]
        public string WaterNo { get; set; } = string.Empty;
        [Required(ErrorMessage = "AccessToken 為必填")]
        public string AccessToken { get; set; } = string.Empty;
    }
    public class ExternalLoginViewModel
    {
        [Required(ErrorMessage = "WaterNo 水號 為必填")]
        public string WaterNo { get; set; } = string.Empty;

        [Required(ErrorMessage = "clientId 為必填")]
        public string ClientId { get; set; } = string.Empty;

        public string State { get; set; } = string.Empty;

        [Required(ErrorMessage = "帳號為必填")]
        public string Account { get; set; } = string.Empty;

        [Required(ErrorMessage = "密碼為必填")]
        public string Password { get; set; } = string.Empty;
    }
    public class AccessTokenByCodeRequest
    {
        [Required(ErrorMessage = "clientId 為必填")]
        public string ClientId { get; set; } = string.Empty;

        [Required(ErrorMessage = "clientSecret 為必填")]
        public string ClientSecret { get; set; } = string.Empty;

        [Required(ErrorMessage = "code 為必填")]
        public string Code { get; set; } = string.Empty;
    }
    public class ExternalClientDto
    {
        public string ClientId { get; set; } = string.Empty;
        public string ClientSecret { get; set; } = string.Empty;
        public string CallbackUrl { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
    }
    public class ExternalAuthorizationCodeDto
    {
        public string Code { get; set; } = string.Empty;
        public string WaterNo { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string ClientId { get; set; } = string.Empty;
        public string CallbackUrl { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool Used { get; set; }
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
        TokenExpired,
        Invalid,
        NoSource,
        Other
    }

}
