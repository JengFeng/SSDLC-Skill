using Newtonsoft.Json;

namespace TWNPPublic.ViewModels.Dashboard
{
    public class DashboardViewModel
    {
    }

    /// <summary>
    /// 首頁
    /// </summary>
    public class DashMainViewModel
    {
        /// <summary>
        /// 名稱
        /// </summary>
        public string NAME { get; set; } = string.Empty;
        /// <summary>
        /// 跑馬燈
        /// </summary>
        public string NEWS { get; set; } = string.Empty;
        /// <summary>
        /// 跑馬燈 Object 不知道為啥沒辦法自動轉至
        /// </summary>
        public List<DashMainNEWS> DashMainNEWS
        {
            get { return JsonConvert.DeserializeObject<List<DashMainNEWS>>(this.NEWS); }
        }
        /// <summary>
        /// 警告訊息
        /// </summary>
        public string B_MESSAGE { get; set; } = string.Empty;
        /// <summary>
        /// 去年同期使用度數
        /// </summary>
        public float? LASTYEAR_METER { get; set; } = 0;
        /// <summary>
        /// 上個月使用度數
        /// </summary>
        public float? LASTMONTH_METER { get; set; } = 0;
        /// <summary>
        /// 這個月使用度數
        /// </summary>
        public float? THISMONTH_METER { get; set; } = 0;
        /// <summary>
        /// 預估本月使用度數
        /// </summary>
        public float? THISMONTHEND_METER { get; set; } = 0;
        /// <summary>
        /// 目前指針度數
        /// </summary>
        public float? NEW_METER { get; set; } = 0;
        /// <summary>
        /// 去年同期水費(此為系統計算，非實際繳費金額)
        /// </summary>
        public int? LASTYEAR_MONEY { get; set; } = 0;
        /// <summary>
        ///上個月水費(此為系統計算，非實際繳費金額)
        /// </summary>
        public int? LASTMONTH_MONEY { get; set; } = 0;
        /// <summary>
        /// 本月水費(此為系統計算，非實際繳費金額)
        /// </summary>
        public int? THISMONTH_MONEY { get; set; } = 0;
        /// <summary>
        /// 預估本月水費(此為系統計算，非實際繳費金額)
        /// </summary>
        public int? THISMONTHEND_MONEY { get; set; } = 0;
    }

    /// <summary>
    /// 首頁右下用水查詢圖表
    /// </summary>
    public class DashMainWaterUseSearchViewModel
    {
        public string X { get; set; } = string.Empty;
        public float? Y { get; set; }
    }

    /// <summary>
    /// 最新消息 首頁 ViewModel 用
    /// </summary>
    public class DashMainNEWS
    {
        public string B_NEWS_SN { get; set; }
        public string TITLE { get; set; }
        public string NOTE { get; set; }
        public DateTime? INP_DATE { get; set; }
    }

    /// <summary>
    /// 最新消息
    /// </summary>
    public class B_NEWSViewModel
    {
        public int B_NEWS_SN { get; set; }
        public string TITLE { get; set; }
        public string NOTE { get; set; }
        public DateTime? INP_DATE { get; set; }
    }

    /// <summary>
    /// 用水技士
    /// </summary>
    public class B_NOTEViewModel
    {
        public int B_NOTE_SN { get; set; }
        public string WATER_NO { get; set; }
        public string PROPERTY_NO { get; set; }
        public string NOTE { get; set; }
        public DateTime INP_DATE { get; set; }
        public DateTime? A_DATE { get; set; }
    }
}
