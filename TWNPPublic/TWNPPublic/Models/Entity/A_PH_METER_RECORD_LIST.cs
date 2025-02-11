namespace TWNPPublic.Models.Entity
{
    public class A_PH_METER_RECORD_LIST
    {
        public string WATER_NO { get; set; }
        public string PROPERTY_NO { get; set; }
        public DateTime REC_DATE_TIME { get; set; }
        public decimal? AMOUNT { get; set; }
        public decimal? AMOUNTO { get; set; }
        public string AMOUNT_SUM { get; set; }
    }

    public class PhMeterRecordRoot
    {
        public RootData Root { get; set; }
    }

    public class RootData
    {
        public List<A_PH_METER_RECORD_LIST> Data { get; set; }
    }


    public class PhMeterRecordRoot2
    {
        public RootData2 DataRoot { get; set; }
    }

    public class RootData2
    {
        public Dataloop2 DataLoop { get; set; }
    }

    public class Dataloop2
    {
        public string Result { get; set; }
        public string Message { get; set; }
        public List<A_PH_METER_RECORD_LIST> Data { get; set; }
    }

}
