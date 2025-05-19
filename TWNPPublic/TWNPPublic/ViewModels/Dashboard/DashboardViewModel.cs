using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;

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
            get
            {
                try
                {
                    return JsonConvert.DeserializeObject<List<DashMainNEWS>>(this.NEWS);
                }
                catch (Exception e)
                {
                    return new List<DashMainNEWS>();
                }
            }

        }
        /// <summary>
        /// 警告訊息
        /// </summary>
        public string B_MESSAGE { get; set; } = string.Empty;

        public List<DashBMessage> DashMainBMessage
        {
            get
            {
                if (this.B_MESSAGE == null)
                    return null;
                else
                    return JsonConvert.DeserializeObject<List<DashBMessage>>(this.B_MESSAGE);
            }
        }

        public DateTime CurrentTime { get; set; }

        public string CurrentTimeText
        {
            get { return CurrentTime.ToString("yyyy/MM/dd"); }
        }

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

        public string BILLDATE { get; set; }

        public string BILLDATE1 { get; set; }
        public string BILLDATE2 { get; set; }

        public string NEW_METER_DATE { get; set; }
        public string LASTMONTH_DATE { get; set; }      //上一期帳單年月
        public string LASTMONTH_DATE1 { get; set; }     //上一期計費期間
        public string THISMONTHEND_DATE { get; set; }   //本期累積計費期間
        public string NEXTMONTHEND_METER { get; set; }   //下期累積度數
        public string NEXTMONTHEND_DATE { get; set; }   //下期累積度數計費期間
        /// <summary>
        /// 下期試算水費 金額
        /// </summary>
        public int? NEXTMONTHEND_MONEY { get; set; } = 0;

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
    /// 警告訊息 首頁 ViewModel 用
    /// </summary>
    public class DashBMessage
    {
        public string WATER_NO { get; set; }
        public string NOTE { get; set; }
        public DateTime INP_DATE { get; set; }
        public string B_MESSAGE_SN { get; set; }
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

    /// <summary>
    /// 首頁 異常狀態列表
    /// </summary>
    public class ExceptionItem
    {
        public string Time { get; set; }
        public int Id { get; set; }
        public string Message { get; set; }
    }

    /// <summary>
    /// 就地址
    /// </summary>
    public class Addresses
    {
        public string ADDRESS_DAES { get; set; }
    }

    public class Location
    {
        public string LAT { get; set; }
        public string LON { get; set; }
    }
    public class fullcalendar
    {
        public string id { get; set; }
        public string title { get; set; }
        public string start { get; set; }
        public string NoteDate { get; set; }
    }

    public class ListedTable
    {
        public int Max { get; set; }
        public List<ExceptionItem> PageData { get; set; }
    }

    /// <summary>
    /// 登入後若INITIAL_LOGIN =0時需要修改密碼
    /// </summary>
    public class UpdatePwVm
    {
        [Required(ErrorMessage = "目前密碼為必填欄位")]
        public string Pwd { get; set; } = string.Empty;

        [Required(ErrorMessage = "新密碼為必填欄位")]
        public string PasswordNew1 { get; set; } = string.Empty;

        [Required(ErrorMessage = "再確認新密碼為必填")]
        public string PasswordNew2 { get; set; } = string.Empty;
    }

    /// <summary>
    /// 轄管廠所聯絡資訊
    /// </summary>
    public class ContactPersonViewModel
    {
        public string FACTORY { get; set; }
        public string TEL { get; set; }
    }
}
