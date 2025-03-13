namespace TWNPPublic.Models.Entity
{
    //public class V_A_WATERFEE
    //{
    //    public string WATERNO { get; set; }
    //    public string CODE_NAME { get; set; }
    //    public string AC1 { get; set; }
    //    public string AC2 { get; set; }
    //    public int? DIAMETER { get; set; }
    //    public int? CONTRACT { get; set; }
    //    public int? TYPE { get; set; }
    //    public int? TOQTY { get; set; }
    //    public int? SQTY { get; set; }
    //    public double? FEE { get; set; }
    //    public int? SERV { get; set; }
    //    public int? TAX { get; set; }
    //    public int? DIRTY { get; set; }
    //    public int? PBFEE { get; set; }
    //    public int? PBSERV { get; set; }
    //    public int? PREFEE { get; set; }
    //    public int? BASICFEE { get; set; }
    //    public int? TOTAL { get; set; }
    //    public string NAME { get; set; }
    //    public string ADDRESS { get; set; }
    //    public string MAIL { get; set; }
    //    public int? RULE33 { get; set; }
    //    public int? FLOOD50 { get; set; }
    //    public int? ALLOWANCESTA { get; set; }
    //    public string ALLOW2STA { get; set; }
    //    public string LASTMETERED { get; set; }
    //    public string METERED { get; set; }
    //    public int? BATCHNO { get; set; }
    //    public int? DELAYFEE { get; set; }
    //    public int? PRESERVE { get; set; }
    //    public int? FEEDBACK { get; set; }
    //    public string DUEDATE { get; set; }
    //    public string DEDUCT { get; set; }
    //    public int? SUBTOTAL { get; set; }
    //    public int? ALLOWANCE { get; set; }
    //    public string NAME_DAES { get; set; }
    //    public string ADDRESS_DAES { get; set; }
    //    public string MAIL_DAES { get; set; }
    //    public double? LON { get; set; }
    //    public double? LAT { get; set; }
    //    public int USERTYPE_CODE_SN { get; set; }
    //    public decimal? ISAUTOMETER { get; set; }
    //    public string STQTY { get; set; }
    //    public string SCNT { get; set; }
    //    public string NEXTMETERED { get; set; }
    //    public string NEXTBILL { get; set; }
    //    public string ALLOW2 { get; set; }
    //    public string FOUL_AMT2 { get; set; }
    //    public string ALLOW33 { get; set; }
    //    public string LASTFEE { get; set; }
    //    public string BILLDATE { get; set; }
    //    public string M_SHSQTY { get; set; }
    //    public string READING { get; set; } = String.Empty;
    //    public string LASTREAD { get; set; } = String.Empty;
    //    //這個不在資料庫裏面，不應該在這邊
    //    public double WaterBillSubtotal { get; set; }
    //}

    public class V_A_WATERFEE
    {
        public string DataCount { get; set; }
        public string WATERNO { get; set; }
        public string AC1 { get; set; }
        public string AC2 { get; set; }
        public string DIAMETER { get; set; }
        public string TYPE { get; set; }
        public string CONTRACT { get; set; }
        public string TOQTY { get; set; }
        public string SQTY { get; set; }
        public string FEE { get; set; }
        public string SERV { get; set; }
        public string TAX { get; set; }
        public string DIRTY { get; set; }
        public string PBFEE { get; set; }
        public string PBSERV { get; set; }
        public string PREFEE { get; set; }
        public string BASICFEE { get; set; }
        public string TOTAL { get; set; }
        public string NAME { get; set; }
        public string ADDRESS { get; set; }
        public string MAIL { get; set; }
        public string RULE33 { get; set; }
        public string FLOOD50 { get; set; }
        public string ALLOWANCESTA { get; set; }
        public string ALLOW2STA { get; set; }
        public string LASTMETERED { get; set; }
        public string METERED { get; set; }
        public string BATCHNO { get; set; }
        public string DELAYFEE { get; set; }
        public string PRESERVE { get; set; }
        public string FEEDBACK { get; set; }
        public string DUEDATE { get; set; }
        public string DEDUCT { get; set; }
        public string SUBTOTAL { get; set; }
        public string ALLOWANCE { get; set; }
        public string ALLOW2 { get; set; }
        public string LASTFEE { get; set; }
        public string BILLDATE { get; set; }
        public string READING { get; set; }
        public string LASTREAD { get; set; }
        public string NEXTMETERED { get; set; }
        public string NEXTBILL { get; set; }
        public string MASTER { get; set; }
        public string BRANCH { get; set; }
        public string ALLOW33 { get; set; }
        public string ALLOW50 { get; set; }
        public string SAVERATIO { get; set; }
        public string SAVEALLOW { get; set; }
        public string LASTAVGQTY { get; set; }
        public string AVGQTY { get; set; }
        public string LEVY { get; set; }
        public string STQTY { get; set; }
        public string SCNT { get; set; }
        public string MSTUS { get; set; }
        public string PAID { get; set; }
        public string PAIDDT { get; set; }
        public string REALFEE { get; set; }
        public string KODATE { get; set; }
        public string FANK { get; set; }
        public string JUCODE { get; set; }
        public string INVOICENO { get; set; }
        public string CARRIERID { get; set; }
        public string CARRIERID_ORIG { get; set; }
        public string BAN { get; set; }
        public string NPOBAN { get; set; }
        public string MNO { get; set; }
        public string IS_DEFER { get; set; }
        public string COIF_ID { get; set; }
        public string RATE_OP { get; set; }
        public string OP_AMT { get; set; }
        public string OP_AMT2 { get; set; }
        public string MB_AMT { get; set; }
        public string MB_AMT2 { get; set; }
        public string M_SHSQTY { get; set; }
        public string FOUL_AMT2 { get; set; }
        public string DCDATE { get; set; }
        public string WAEE_SUBSIDY { get; set; }
        public string SREAD1 { get; set; }
        public string SREAD2 { get; set; }
        public string APPFANK { get; set; }
        public string APPMEM { get; set; }
        public string AREA { get; set; }
        public string LAST_DAVGQ { get; set; }
        public string LAST_REAL_QTY { get; set; }
        public string LYEAR_REAL_QTY { get; set; }
        public string NAME_DAES { get; set; }
        public string ADDRESS_DAES { get; set; }
        public string MAIL_DAES { get; set; }
    }

    public class DataLoop
    {
        public string DataCount { get; set; }
        public List<V_A_WATERFEE> Data { get; set; }
    }

    public class DataRoot
    {
        public DataLoop DataLoop { get; set; }
    }

    public class Root
    {
        public DataRoot DataRoot { get; set; }
    }
}
