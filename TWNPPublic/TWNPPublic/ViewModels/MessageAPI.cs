namespace TWNPPublic.ViewModels
{
    public class MessageAPI<T>
    {
        public MessageAPI()
        {

        }
        public MessageAPI(bool haveData)
        {
            this.HaveData = haveData;
        }

        public bool ShouldSerializeData()
        {
            return (HaveData);
        }

        private bool HaveData = false;
        /// <summary>
        /// 狀態碼
        /// </summary>
        public int Status { get; set; } = 200;
        /// <summary>
        /// 操作是否成功
        /// </summary>
        public bool Success { get; set; } = false;
        /// <summary>
        /// 提示
        /// </summary>
        public string Message { get; set; } = string.Empty;
        /// <summary>
        /// 可傳遞的資料
        /// </summary>
        public T? Data { get; set; }
    }

    public class MessageAPI
    {
        /// <summary>
        /// 狀態
        /// </summary>
        public int Status { get; set; } = 200;
        /// <summary>
        /// 操作是否成功
        /// </summary>
        public bool Success { get; set; } = false;
        /// <summary>
        /// 提示
        /// </summary>
        public string Message { get; set; } = "";
    }

    public class MessageValidFailed
    {
        /// <summary>
        /// 狀態
        /// </summary>
        public int Status { get; set; } = 200;
        /// <summary>
        /// 操作是否成功
        /// </summary>
        public bool Success { get; set; } = false;
        /// <summary>
        /// 提示
        /// </summary>
        public string Message { get; set; } = "欄位錯誤";
        /// <summary>
        /// ModelStateErrors 轉 Dictionary
        /// </summary>
        public Dictionary<string, string[]> ModelStateErrors { get; set; }
    }
}
