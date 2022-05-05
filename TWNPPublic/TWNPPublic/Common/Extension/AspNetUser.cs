namespace TWNPPublic.Common.Extension
{
    public class AspNetUser : IAspNetUser
    {
        private readonly IHttpContextAccessor accessor;
        public string Name { get; set; } = string.Empty;
        public string WaterNo
        {
            get => GetWaterNo();
        }

        public AspNetUser(IHttpContextAccessor accessor)
        {
            this.accessor = accessor;
        }
        private string GetWaterNo()
        {
            if (accessor.HttpContext == null)
                return string.Empty;

            var UserName = accessor.HttpContext.Session.GetString("UserName");

            if (string.IsNullOrEmpty(UserName))
                return string.Empty;

            return UserName;
        }
    }

    public interface IAspNetUser
    {
        public string WaterNo { get; }
        public string Name { get; set; }
    }
}
