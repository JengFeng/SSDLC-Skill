namespace TWNPPublic.Models.Entity
{
    public class A_PH_METER_RECORD_COVER_LOG
    {
        public string SN { get; set; }
        public DateTime ADATE { get; set; }//資料庫類型是 date
        public string? WATER_NO { get; set; }
        public string? MESSAGE { get; set; }
        public int? STATUS1 { get; set; }
        public int? STATUS2 { get; set; }
        public DateTime INP_DATE { get; set; }//資料庫類型是 datetime
    }
}
