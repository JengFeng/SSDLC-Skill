namespace TWNPPublic.Models
{
    public class CaptchaModel
    {
        /// <summary>
        /// 驗證碼內容
        /// </summary>
        public string Code { get; set; }

        /// <summary>
        /// 生成時間
        /// </summary>
        public DateTime CreatedTime { get; set; }

        /// <summary>
        /// 過期時間(分鐘)
        /// </summary>
        public int ExpirationMinutes { get; set; } = 5;

        /// <summary>
        /// 錯誤嘗試次數
        /// </summary>
        public int FailedAttempts { get; set; } = 0;

        /// <summary>
        /// 最大錯誤次數
        /// </summary>
        public int MaxFailedAttempts { get; set; } = 3;

        /// <summary>
        /// SessionID 綁定
        /// </summary>
        public string SessionId { get; set; }

        /// <summary>
        /// 是否已使用
        /// </summary>
        public bool IsUsed { get; set; } = false;

        /// <summary>
        /// 使用時間 (記錄驗證碼被使用的時間點)
        /// </summary>
        public DateTime? UsedTime { get; set; }

        /// <summary>
        /// 檢查是否過期
        /// </summary>
        public bool IsExpired()
        {
            return DateTime.Now > CreatedTime.AddMinutes(ExpirationMinutes);
        }

        /// <summary>
        /// 檢查是否超過錯誤次數
        /// </summary>
        public bool IsLocked()
        {
            return FailedAttempts >= MaxFailedAttempts;
        }
    }
}