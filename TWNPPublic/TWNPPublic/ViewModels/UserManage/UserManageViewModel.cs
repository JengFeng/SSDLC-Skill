using System.ComponentModel.DataAnnotations;
using TWNPPublic.Common.Attributes.CustomValidation;

namespace TWNPPublic.ViewModels.UserManage
{
    public class UpdateUserManageViewModel
    {
        [Required(ErrorMessage = "帳號為必填")]
        public string Account { get; set; }
        // 移除 Required，改為選填（空白 = 不修改密碼）
        // [Required(ErrorMessage = "密碼為必填")]
        public string? Pwd { get; set; } // 改為可 null
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

        public List<string>? ExpDate { get; set; }
    }

    public class CreateUserManageViewModel
    {
        [Required(ErrorMessage = "帳號為必填")]
        public string Account { get; set; }
        [Required(ErrorMessage = "密碼為必填")]
        public string Pwd { get; set; }
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
        public string WATER_NO { get; set; }      // 水號
        public string? NICK_NAME { get; set; }     // 暱稱
        public string? NICK_NAME_SHOW { get; set; }   // 是否顯示暱稱（勾選框）
    }
}
