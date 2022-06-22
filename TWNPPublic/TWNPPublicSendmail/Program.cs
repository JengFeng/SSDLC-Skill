// See https://aka.ms/new-console-template for more information
using SqlData;
using TWNPPublicSendmail.Model;

IDapperDataAccess dapperDataAccess = new DapperDataAccess("http://59.120.223.172/TWN_WCF/DapperService.svc");
string mainsql = @"SELECT *
                    FROM [TWN].[dbo].[V_B_MESSAGE_MAIL]
                    Where IS_SEND = 0";
var result = dapperDataAccess.Query<V_B_MESSAGE_MAIL>(mainsql).ToList();
string sendmailsql = @"EXEC spSEND_MAIL @mailreceiver,@context,@title";
string FilePath = Directory.GetCurrentDirectory() + "\\AlertMailTemplate.html";
StreamReader str = new StreamReader(FilePath);
string MailText = str.ReadToEnd();
str.Close();

foreach (var item in result)
{
    var setContext = MailText.Replace("{AlertMessage}", item.NOTE);
    object obj = new
    {
        mailreceiver = item.VALUE,
        context = setContext,
        title = "台灣自來水公司-智慧水網用戶用水提醒通知"
    };
    dapperDataAccess.Execute(sendmailsql, obj);
}
