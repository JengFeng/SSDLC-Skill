// See https://aka.ms/new-console-template for more information
using Microsoft.Extensions.Configuration;
using NLog;
using NLog.Extensions.Logging;
using SqlData;
using TWNPPublicSendmail.Model;

var configuration = new ConfigurationBuilder()
.SetBasePath(Directory.GetParent(AppContext.BaseDirectory).FullName)
.AddJsonFile("appsettings.json", false)
.Build();

NLog.LogManager.Configuration = new NLogLoggingConfiguration(configuration.GetSection("NLog"));
var logger = LogManager.GetCurrentClassLogger();

var wcfurl = configuration.GetSection("WcfUrl");
IDapperDataAccess dapperDataAccess = new DapperDataAccess(wcfurl.Value);

string mainsql = @"SELECT *
                    FROM [TWN].[dbo].[V_B_MESSAGE_MAIL]
                    Where IS_SEND = 0";

string updatessq = @"Update [dbo].[B_MESSAGE]
                    Set [IS_SEND] = 1
                    Where B_MESSAGE_SN = @B_MESSAGE_SN";

var result = dapperDataAccess.Query<V_B_MESSAGE_MAIL>(mainsql).ToList();
string sendmailsql = @"EXEC spSEND_MAIL @mailreceiver,@context,@title";
string FilePath = Directory.GetCurrentDirectory() + "\\AlertMailTemplate.html";
StreamReader str = new StreamReader(FilePath);
string MailText = str.ReadToEnd();
str.Close();

foreach (var item in result)
{
    var setContext = MailText.Replace("{AlertMessage}", item.NOTE).Replace("{AlertType}", item.CODE_NAME);
    object obj = new
    {
        mailreceiver = item.VALUE,
        context = setContext,
        title = "台灣自來水公司-智慧水網用戶用水提醒通知"
    };
    var sendresult = dapperDataAccess.Query<object>(sendmailsql, obj);
    dapperDataAccess.Execute(updatessq, new { B_MESSAGE_SN = item.B_MESSAGE_SN });
    var loggedMsg = sendresult.Select(c => c.ToString());
    logger.Debug(String.Join(',', loggedMsg));
}
