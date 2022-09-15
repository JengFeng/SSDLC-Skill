namespace TWNPPublic.Models.Entity
{
    public class A_PH_METER_RECORD_LIST
    {
        public string WATER_NO { get; set; }
        public string PROPERTY_NO { get; set; }
        public DateTime REC_DATE_TIME { get; set; }
        public float? AMOUNT { get; set; }
    }

    public class PhMeterRecordRoot
    {
        public RootData Root { get; set; }
    }

    public class RootData
    {
        public List<A_PH_METER_RECORD_LIST> Data { get; set; }
    }
}
