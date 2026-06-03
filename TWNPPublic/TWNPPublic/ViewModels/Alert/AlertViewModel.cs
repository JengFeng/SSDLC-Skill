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

        public List<string> WaterNos { get; set; }
        public string AlertValueYesterday { get; set; }
        public string ExtendValue1Yesterday { get; set; }
        public string ExtendValue2Yesterday { get; set; }
        public string AlertValueLastMonth { get; set; }
        public string ExtendValueLastMonth { get; set; }
        public string AlertValueThreedayWaterUse { get; set; }
        public string AlertValueThreedayWaterNonUse { get; set; }

        public string AlertValueWeek { get; set; }
        public string ExtendValue1Week { get; set; }

        public string AlertValueContinuousWaterUsage { get; set; }
        public string ExtendValueContinuousWaterUsage { get; set; }

        public string AlertValueContinuousIdleWaterUsage { get; set; }
        public string ExtendValueContinuousIdleWaterUsage { get; set; }

        public string AlertValueNighttimeWaterIncrease { get; set; }

        public string ExtendValueNighttimeWaterIncrease { get; set; }

        public string AlertValueDailyWaterUsageLimit { get; set; }
        public string ExtendValueDailyWaterUsageLimit { get; set; }

        public string AlertValueWaterUsageBudget { get; set; }

        public string ExtendValueWaterUsageBudget { get; set; }

    }

    public class SaveAlertSetViewModel
    {
        [Required(ErrorMessage = "水號為必選項")]
        public string WaterNo { get; set; }
        [Required(ErrorMessage = "手機號碼為必填")]
        [RegularExpression("^[0-9]{10}$", ErrorMessage = "請確定電話號碼格式")]
        public string? AlertPhone { get; set; } = string.Empty;
        [Required(ErrorMessage = "信箱為必填")]
        [EmailAddress(ErrorMessage = "請確定您的信箱格式")]
        public string? AlertEmail1 { get; set; } = string.Empty;
        [EmailAddress(ErrorMessage = "請確定您的信箱格式")]
        public string? AlertEmail2 { get; set; } = string.Empty;
        [EmailAddress(ErrorMessage = "請確定您的信箱格式")]
        public string? AlertEmail3 { get; set; } = string.Empty;
        [EmailAddress(ErrorMessage = "請確定您的信箱格式")]
        public string? AlertEmail4 { get; set; } = string.Empty;
        [EmailAddress(ErrorMessage = "請確定您的信箱格式")]
        public string? AlertEmail5 { get; set; } = string.Empty;
        public string? onoffswitch1 { get; set; } = string.Empty; //日用水量(前日24:00至昨日23:00) 
        public string? onoffswitch2 { get; set; } = string.Empty; //上月用水量
        public string? onoffswitch3 { get; set; } = string.Empty; //連續三日無用水
        public string? onoffswitch4 { get; set; } = string.Empty; //連續三日用水
        public string? AlertValue1 { get; set; } = string.Empty; //較前期比較突增 & 較上月日平均用水突增
        public string? AlertValue2 { get; set; } = string.Empty; //較前月用水突增 & 較去年同期用水突增
        public string? AlertValue3 { get; set; } = string.Empty; //
        public string? AlertValue4 { get; set; } = string.Empty; //
        public string? AlertValue5 { get; set; } = string.Empty; //
        public string? AlertValue6 { get; set; } = string.Empty; //

        public string? AlertExtion10010301 { get; set; } = string.Empty; // 度且突增
        public string? AlertExtion10010302 { get; set; } = string.Empty; // %(含以上)
        public string? AlertExtion10010303 { get; set; } = string.Empty; // 度且突減
        public string? AlertExtion10010304 { get; set; } = string.Empty; // %(含以下)
        public string? AlertExtion10010401 { get; set; } = string.Empty; // 度且突增
        public string? AlertExtion10010402 { get; set; } = string.Empty; // %(含以上)
        public string? AlertExtion10010403 { get; set; } = string.Empty; // 度且突減
        public string? AlertExtion10010404 { get; set; } = string.Empty; // %(含以下)
        public string? AlertExtion10110501 { get; set; } = string.Empty; // %(含)以上
        public string? AlertExtion10110502 { get; set; } = string.Empty; // %(含)以上
        public string? AlertExtion10110503 { get; set; } = string.Empty; // %(含)以上
        public string? AlertExtion10110504 { get; set; } = string.Empty; // %(含)以上

        public string? AlertExtion10110601 { get; set; } = string.Empty; // %(含)以上
        public string? AlertExtion10110602 { get; set; } = string.Empty; // %(含)以上
        public string? AlertExtion10110603 { get; set; } = string.Empty; // %(含)以上
        public string? AlertExtion10110604 { get; set; } = string.Empty; // %(含)以上

        public string? AlertCheckbox1 { get; set; } = string.Empty; //每日用水上限提醒
        public string? AlertCheckbox2 { get; set; } = string.Empty; //每期用水預算提醒
        public string? AlertCheckbox3 { get; set; } = string.Empty; //日用水量(前日24:00至昨日23:00)
        public string? AlertCheckbox4 { get; set; } = string.Empty; //週用水量警示
        public string? AlertCheckbox5 { get; set; } = string.Empty; //月用水量警示
        public string? AlertCheckbox6 { get; set; } = string.Empty; //連續水量警示
        public string? AlertCheckbox7 { get; set; } = string.Empty; //連續無用水警示
        public string? AlertCheckbox8 { get; set; } = string.Empty; //夜間用水增加警示

        public string? AlertExtion64664701 { get; set; } = string.Empty; // 度且突增
        public string? AlertExtion64664702 { get; set; } = string.Empty; // 度且突增
        public string? AlertExtion64664703 { get; set; } = string.Empty; // 度且突增
        public string? AlertExtion64664704 { get; set; } = string.Empty; // 度且突增

        public string? AlertExtion64664801 { get; set; } = string.Empty; // 度且突增
        public string? AlertExtion64664802 { get; set; } = string.Empty; // 度且突增
        public string? AlertExtion64664803 { get; set; } = string.Empty; // 度且突增
        public string? AlertExtion64664804 { get; set; } = string.Empty; // 度且突增

        public string? AlertExtion10210801 { get; set; } = string.Empty; // 
        public string? AlertExtion10210701 { get; set; } = string.Empty;
        public string? AlertExtion10264901 { get; set; } = string.Empty;//夜間用水增加1
        public string? AlertExtion10264902 { get; set; } = string.Empty;//夜間用水增加2
        public string? AlertExtion10265001 { get; set; } = string.Empty;
        public string? AlertExtion10265101 { get; set; } = string.Empty;

    }
}

