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
        public string AlertValue1 { get; set; } = string.Empty;
        public string AlertValue2 { get; set; } = string.Empty;
        public int? AlertExtion2 { get; set; }
        public string AlertValue3 { get; set; } = string.Empty;
    }
}
