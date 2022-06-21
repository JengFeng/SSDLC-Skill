// See https://aka.ms/new-console-template for more information
using SqlData;
using TWNPSendMailService.Model;

IDapperDataAccess dapperDataAccess = new DapperDataAccess("http://59.120.223.172/TWN_WCF/DapperService.svc");
string mainsql = @"SELECT *
                    FROM [TWN].[dbo].[V_B_MESSAGE_MAIL]
                    Where IS_SEND = 0";
var result = dapperDataAccess.Query<V_B_MESSAGE_MAIL>(mainsql).ToList();
string sendmailsql = @"EXEC spSEND_MAIL @mailreceiver,@context,@title";

string UserMailBody = @"
            <!DOCTYPE html PUBLIC ""-//W3C//DTD XHTML 1.0 Transitional//EN"" ""http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"">
            <html xmlns=""http://www.w3.org/1999/xhtml"">
             <head>
              <meta http-equiv=""Content-Type"" content=""text/html; charset=UTF-8"" />
              <title>Demystifying Email Design</title>
              <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
            </head>
            <body>
            <table cellpadding=""0"" cellspacing=""0"" width=""100%"">
                 <tr>
                  <td>
                   您好:
                  </td>
                 </tr>
                 <tr>
                  <td style=""padding: 20px 0 30px 0;"">
                    你好:<br/>
                    {0}<br/>
                    <br/>
                  </td>
                 </tr>
                 <tr>
                  <td>
                    智慧水表用戶用水查詢平台
                  </td>
                 </tr>
                </table>
            </body>
            </html>
            ";


foreach (var item in result)
{
    object obj = new
    {
        mailreceiver = item.VALUE,
        context = "",
        title = ""
    };
    dapperDataAccess.Execute(sendmailsql, obj);
}
