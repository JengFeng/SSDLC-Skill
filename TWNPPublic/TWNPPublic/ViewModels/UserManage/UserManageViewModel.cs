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
        public List<string>? WaterNO { get; set; }
        //水號資料的列表
        public List<WaterItem>? WaterData { get; set; }
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

    // 新增 WaterItem 類別，保存每個水號及其相關資料
    public class WaterItem
    {
        public string WaterNo { get; set; }      // 水號
        public string? NickName { get; set; }     // 暱稱
        public decimal? ShowNickName { get; set; }   // 是否顯示暱稱（勾選框）
    }
}
