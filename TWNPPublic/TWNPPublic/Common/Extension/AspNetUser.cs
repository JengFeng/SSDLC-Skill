namespace TWNPPublic.Common.Extension
{
    public class AspNetUser : IAspNetUser
    {
        private readonly IHttpContextAccessor accessor;
        public string Name
        {
            get => GetUserName();
        }

        public string WaterNo
        {
            get => GetWaterNo();
        }

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

        private string GetWaterNo()
        {
            if (accessor.HttpContext == null)
                return string.Empty;

            var WaterNo = accessor.HttpContext.Session.GetString("WaterNo");

            if (string.IsNullOrEmpty(WaterNo))
                return string.Empty;

            return WaterNo;
        }
    }

    public interface IAspNetUser
    {
        public string WaterNo { get; }
        public string Name { get;}
    }
}
