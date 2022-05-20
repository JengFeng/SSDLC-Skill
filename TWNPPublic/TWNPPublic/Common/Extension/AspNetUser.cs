namespace TWNPPublic.Common.Extension
{
    public class AspNetUser : IAspNetUser
    {
        private readonly IHttpContextAccessor accessor;
        public string Name => GetUserName();

        public int? UserId => GetUserId();

        public string CurrentWaterNo => GetCurrentWaterNo();

        public List<string> WaterNo => GetWaterNo();

        public AspNetUser(IHttpContextAccessor accessor)
        {
            this.accessor = accessor;
        }

        private string GetUserName()
        {
            if (accessor.HttpContext == null)
                return string.Empty;

            var UserName = accessor.HttpContext.Session.GetString("UserName");

            if (string.IsNullOrEmpty(UserName))
                return string.Empty;

            return UserName;
        }

        private List<string> GetWaterNo()
        {
            if (accessor.HttpContext == null)
                return new List<string>();
            var WaterNo = accessor.HttpContext.Session.GetString("WaterNo");

            if (string.IsNullOrEmpty(WaterNo))
                return new List<string>();

            return WaterNo.Split(',').ToList();
        }

        private int? GetUserId()
        {
            if (accessor.HttpContext == null)
                return null;

            var UserId = accessor.HttpContext.Session.GetString("UserId");

            if (string.IsNullOrEmpty(UserId))
                return null;

            return Int32.Parse(UserId);
        }

        private string GetCurrentWaterNo()
        {
            if (accessor.HttpContext == null)
                return string.Empty;

            var CurrentWaterNo = accessor.HttpContext.Session.GetString("CurrentWaterNo");

            if (string.IsNullOrEmpty(CurrentWaterNo))
                return string.Empty;

            return CurrentWaterNo;
        }
    }

    public interface IAspNetUser
    {
        public int? UserId { get; }
        public string CurrentWaterNo { get; }
        public List<string> WaterNo { get; }
        public string Name { get; }
    }
}
