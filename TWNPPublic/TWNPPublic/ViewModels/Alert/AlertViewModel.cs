using System.ComponentModel.DataAnnotations;

namespace TWNPPublic.ViewModels.Alert
{
    public class AlertViewModel
    {
    }

    public class ListedAlertSetViewModel
    {
        public string AlertPhone { get; set; }
        public string AlertEmail { get; set; }
        public string[] AlertEmails { get; set; }
        public string AlertValueStraight7Day { get; set; }
        public string ExtendValueStraight7Day { get; set; }
        public string AlertValueStraight30Day { get; set; }
        public string ExtendValueStraight30Day { get; set; }
        public string AlertValueStraight24HR { get; set; }
        public string ExtendValueStraight24HR { get; set; }
        public string AlertValueStraightLimitGate { get; set; }
        public string ExtendValueStraightLimitMaxGate { get; set; }
        public string ExtendValueStraightLimitMinGate { get; set; }

        public List<string> WaterNos { get; set; }
    }

    public class SaveAlertSetViewModel
    {
        public string[]? WaterNo { get; set; }
        [Required(ErrorMessage = "手機號碼為必填")]
        [RegularExpression("^[0-9]{10}$", ErrorMessage = "請確定電話號碼格式")]
        public string? AlertPhone { get; set; } = string.Empty;
        [EmailAddress(ErrorMessage = "請確定您的信箱格式")]
        public string? AlertEmail1 { get; set; } = string.Empty;
        [EmailAddress(ErrorMessage = "請確定您的信箱格式")]
        public string? AlertEmail2 { get; set; } = string.Empty;
        [EmailAddress(ErrorMessage = "請確定您的信箱格式")]
        public string? AlertEmail3 { get; set; } = string.Empty;
        public string AlertValue1 { get; set; } = string.Empty; //無警示 
        public string AlertValue2 { get; set; } = string.Empty; //連續七天累積用水量
        public string AlertValue3 { get; set; } = string.Empty; //連續三十天累積用水量
        public string AlertValue4 { get; set; } = string.Empty; //連續24小時累積用水量
        public string AlertValue5 { get; set; } = string.Empty; //用水量上下限值設定
        public int? AlertExtion2 { get; set; } // 較上週增加 Text
        public int? AlertExtion3 { get; set; } //用水量上下限值 不要問我為什麼要寫那麼醜問SA
        public int? AlertExtion4 { get; set; }  //用水量上下限值
        public int? AlertExtion5 { get; set; }  //用水量上下限值
        public int? AlertExtion6 { get; set; }  //用水量上下限值
    }
}
