using Newtonsoft.Json;
using TWNPPublic.Models.SqlFunctions;

namespace TWNPPublic.Common.Extension
{
    public class AspNetUser : IAspNetUser
    {
        private readonly IHttpContextAccessor accessor;
        public string Name => GetUserName();

        public int? UserId => GetUserId();

        public string CurrentWaterNo => GetCurrentWaterNo();

        public string ClientIP => GetClientIP();

        public List<F_B_LOGIN_WaterNo> WaterNo => GetWaterNo();

        public DateTime? StartDate => GetStartDate();

        public DateTime? EndDate => GetEndDate();

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

        private List<F_B_LOGIN_WaterNo> GetWaterNo()
        {
            if (accessor.HttpContext == null)
                return new List<F_B_LOGIN_WaterNo>();  // 如果為 null 返回空列表
            var waterNoJson = accessor.HttpContext.Session.GetString("WaterNo");

            // 如果 Session 中有資料，則反序列化為 List<F_B_LOGIN_WaterNo>
            if (!string.IsNullOrEmpty(waterNoJson))
            {
                try
                {
                    // 嘗試反序列化
                    return JsonConvert.DeserializeObject<List<F_B_LOGIN_WaterNo>>(waterNoJson);
                }
                catch (JsonException ex)
                {
                    return new List<F_B_LOGIN_WaterNo>();  // 返回空列表以防止崩潰
                }
            }

            return new List<F_B_LOGIN_WaterNo>();  // 如果 Session 中沒有資料，返回空列表
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

        private string GetClientIP()
        {
            if (accessor.HttpContext == null)
                return string.Empty;

            var ClientIP = accessor.HttpContext.Request.Headers["X-Forwarded-For"].Count == 0 ? "" : accessor.HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault().ToString().Trim();

            if (string.IsNullOrEmpty(ClientIP))
                return string.Empty;

            return ClientIP;

        }

        private DateTime? GetStartDate()
        {
            if (accessor.HttpContext == null)
                return null;

            var StartDate = accessor.HttpContext.Session.GetString("StartDate");

            if (string.IsNullOrEmpty(StartDate))
                return null;

            return (StartDate == null ? null : DateTime.Parse(StartDate) );
        }

        private DateTime? GetEndDate()
        {
            if (accessor.HttpContext == null)
                return null;

            var EndDate = accessor.HttpContext.Session.GetString("EndDate");

            if (string.IsNullOrEmpty(EndDate))
                return null;

            return (EndDate == null ? null : DateTime.Parse(EndDate));
        }

    }

    public interface IAspNetUser
    {
        public int? UserId { get; }
        public string CurrentWaterNo { get; }
        public List<F_B_LOGIN_WaterNo> WaterNo { get; }
        public string Name { get; }

        public string ClientIP { get; }

        public DateTime? StartDate { get; }

        public DateTime? EndDate { get; }

    }
}
