using Newtonsoft.Json;

namespace TWNPPublic.Models.SqlFunctions
{
    public class F_B_LOGIN
    {
        public string LOGIN_STATUS { get; set; } = string.Empty;
        public string WATER_NO { get; set; } = string.Empty;

        public List<F_B_LOGIN_WaterNo> F_B_LOGIN_WaterNos
        {
            get { return JsonConvert.DeserializeObject<List<F_B_LOGIN_WaterNo>>(this.WATER_NO); }
        }
        public int? B_ACCOUNT_SN { get; set; }
    }

    public class F_B_LOGIN_WaterNo
    {
        public string WATER_NO { get; set; }
    }
}
