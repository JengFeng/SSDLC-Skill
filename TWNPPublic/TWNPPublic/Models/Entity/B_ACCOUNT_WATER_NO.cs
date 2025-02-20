namespace TWNPPublic.Models.Entity
{
    public class B_ACCOUNT_WATER_NO
    {
        public int B_ACCOUNT_SN { get; set; }
        public string WATER_NO { get; set; }
        public decimal VALID { get; set; }
        public DateTime? ST_DATE { get; set; }
        public DateTime? EN_DATE { get; set; }
        public string NICK_NAME { get; set; }
        public decimal? NICK_NAME_SHOW { get; set; }

    }

    public class V_B_ACCOUNT_WATER_NO: B_ACCOUNT_WATER_NO
    {
        public string NAME_DAES { get; set; }
        public string ADDRESS_DAES { get; set; }
    }
}
