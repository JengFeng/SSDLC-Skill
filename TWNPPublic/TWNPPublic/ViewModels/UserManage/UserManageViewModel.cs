using System.ComponentModel.DataAnnotations;
using TWNPPublic.Common.Attributes.CustomValidation;

namespace TWNPPublic.ViewModels.UserManage
{
    public class UpdateUserManageViewModel
    {
        [Required(ErrorMessage = "帳號為必填")]
        public string Account { get; set; }
        [Required(ErrorMessage = "密碼為必填")]
        public string Password { get; set; }
        [Required(ErrorMessage = "電話為必填")]
        [RegularExpression("^[0-9]*$", ErrorMessage = "請確定電話號碼格式")]
        public string PhoneNumber { get; set; }
        [EmailAddress(ErrorMessage = "請確定您的Email格式")]
        [Required(ErrorMessage = "信箱為必填")]
        public string Email { get; set; }
        //[ListWaterNoUnNull]
        public List<string> WaterNO { get; set; }
    }

    public class CreateUserManageViewModel
    {
        [Required(ErrorMessage = "帳號為必填")]
        public string Account { get; set; }
        [Required(ErrorMessage = "密碼為必填")]
        public string Password { get; set; }
        [Required(ErrorMessage = "電話為必填")]
        [RegularExpression("^[0-9]{10}$", ErrorMessage = "請確定電話號碼格式")]
        public string PhoneNumber { get; set; }
        [EmailAddress(ErrorMessage = "請確定您的Email格式")]
        [Required(ErrorMessage = "信箱為必填")]
        public string Email { get; set; }
    }
}
