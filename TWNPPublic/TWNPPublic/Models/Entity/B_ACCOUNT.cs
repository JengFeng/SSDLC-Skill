namespace TWNPPublic.Models.Entity
{
    public class b_ACCOUNT
    {
        public int B_ACCOUNT_SN { get; set; }
        public string B_ACCOUNT { get; set; }
        public string PWD { get; set; }
        public DateTime CREATE_DATE { get; set; }
        public DateTime LAST_DATE { get; set; }
        public string EMAIL { get; set; }
        public string CELL_PHONE { get; set; }
        public decimal VALID { get; set; }
        public string APWD { get; set; }
        public decimal? LOGIN_TYPE { get; set; }
        public decimal? INITIAL_LOGIN { get; set; }
        public decimal? INITIAL_APPLOGIN { get; set; }
        public decimal? DIRECT_APPLOGIN { get; set; }
        public DateTime? ST_DATE { get; set; }
        public DateTime? EN_DATE { get; set; }
        public string ?USERNAME { get; set; }

    }
}
