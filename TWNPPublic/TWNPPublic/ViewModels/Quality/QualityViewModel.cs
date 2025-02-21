using TWNPPublic.Models.SqlFunctions;

namespace TWNPPublic.ViewModels.Quality
{
    public class QualityViewModel
    {
    }

    public class QualityChartViewModel
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public List<F_B_CHART1> PinChartData { get; set; }
        public List<F_B_CHART1> AmountChartData { get; set; }
    }

    public class WaterTypeViewModel
    {
        public string? TYPE { get; set; }

        public string? AVG_LASTYEARQTY { get; set; }
    }
}
