namespace TWNPPublic.Models.Entity
{
    public class SYS_LOG
    {

        public string ID { get; set; } = String.Empty;
        public string LOG_TIME { get; set; } = String.Empty;
        public string SYS_TIME { get; set; } = String.Empty;
        public string EXEC_LEVEL { get; set; } = String.Empty;
        public string EXEC_SYS_CODE { get; set; } = String.Empty;
        public string PAGE_CODE { get; set; } = String.Empty;
        public string ACTION_NAME { get; set; } = String.Empty;
        public string OP_TYPE { get; set; } = String.Empty;
        public string EXEC_CONTENT { get; set; } = String.Empty;
        public string CLIENT_IP { get; set; } = String.Empty;
        public string SERVER_IP { get; set; } = String.Empty;
        public string ACCOUNT_SN { get; set; } = String.Empty;
        public string ACCOUNT_NAME { get; set; } = String.Empty;
        public string ERROR_CODE { get; set; } = String.Empty;


    }
}
