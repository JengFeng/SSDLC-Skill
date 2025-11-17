using System.Collections.Generic;
using TWNPPublic.Models.SqlFunctions;

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

    /// <summary>
    /// ////////////////////////////////////////////////////
    /// </summary>
    //public class PhMeterRecordRoot2
    //{
    //    public RootData2 DataRoot { get; set; }
    //}

    //public class RootData2
    //{
    //    public Dataloop2 DataLoop { get; set; }
    //}

    public class PhMeterRecordRoot2
    {
        public string Result { get; set; }
        public string Message { get; set; }
        public List<A_PH_METER_RECORD_LIST> Data { get; set; }
    }

    // 
    public class DailyChartData
    {
        public string datetime { get; set; }
        public List<TimeData> time_data { get; set; }
    }

    public class TimeData
    {
        public string time { get; set; }
        public decimal amount { get; set; }
    }

    public class UseWaterQueryPinExportTable
    {
        public List<timeData> _data { get; set; }
        public string _date { get; set; }
        public string _difference { get; set; }
        public decimal _estimate { get; set; }
        public string _min { get; set; }
    }

    public class timeData
    {
        public string _time { get; set; }
        public decimal _amount { get; set; }
    }

    public class UseWaterQueryPinExportChart
    {
        public List<F_B_CHART1> result { get; set; }
    }

    public class PhMeterRecordAPIResponse
    {
        public string ISOK { get; set; }
        public string Message { get; set; }
        public List<A_PH_METER_RECORD_LIST> Data { get; set; }
    }


    public class Rootobject
    {
        public string Result { get; set; }
        public bool ISOK { get; set; }
        public string Message { get; set; }
        public APIData DataContent { get; set; }
    }

    public class APIData
    {
        public string date { get; set; }
        public List<Datum> data { get; set; }
        public string water_no { get; set; }
    }

    public class Datum
    {
        public string date { get; set; }
        public float total_flow { get; set; }
        public string meter_no { get; set; }
        public string time { get; set; }
    }
}
