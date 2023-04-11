using SqlData;
using TWNPPublic.Common.Extension;
using TWNPPublic.Models.Entity;
using TWNPPublic.Models.SqlFunctions;
using TWNPPublic.ViewModels.Home;
using System.Security.Cryptography;

namespace TWNPPublic.Domain.Service
{
    public class HomeService : IHomeService
    {
        private readonly IDapperDataAccess dataAccess;

        public HomeService(IDapperDataAccess dataAccess)
        {
            this.dataAccess = dataAccess;
        }

        public b_ACCOUNT? CheckAccountNoIsApp(string AccountNo)
        {
            string mainsql = @" Select * 
                                From [TWN].[dbo].[B_ACCOUNT] 
                                Where VALID = 1 And 
                                      [LOGIN_TYPE] = 1 And
                                      B_ACCOUNT = @AccountNo";
            object obj = new { AccountNo };
            var result = dataAccess.Query<b_ACCOUNT>(mainsql, obj).ToList().FirstOrDefault();
            return result;
        }

        /// <summary>
        /// 取得第一筆 [A_PH_METER_LIST] 
        /// </summary>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public bool CheckWaterNoIsAutoMeter(string WaterNo)
        {
            string mainsql = @"Select Top (1) [PH_METER_LIST_SN] From [A_PH_METER_LIST] Where WATER_NO = @WaterNo";
            object obj = new { WaterNo };
            var result = dataAccess.Query<GetIsAutoMeter>(mainsql, obj).ToList().FirstOrDefault();

            if (result != null && result.PH_METER_LIST_SN != null)
            {
                return true;
            }

            return false;
        }

        public List<string> CheckWaterNoNoIsApp(int AccountSN, string WaterNo)
        {
            string mainsql = @"Insert Into [dbo].[B_ACCOUNT_WATER_NO]            
			                                ([B_ACCOUNT_SN]
			                                ,[WATER_NO]
			                                ,[VALID])
                                Select @B_ACCOUNT_SN,@WATER_NO,@VALID
                                Where Not Exists
	                                (Select 1 From 
	                                [B_ACCOUNT_WATER_NO] Where [B_ACCOUNT_SN] = @B_ACCOUNT_SN And [WATER_NO] = @WATER_NO )";
            object obj = new
            {
                B_ACCOUNT_SN = AccountSN,
                WATER_NO = WaterNo,
                VALID = 1
            };
            dataAccess.Execute(mainsql, obj);

            string querysql = @"SELECT *
                                FROM [TWN].[dbo].[B_ACCOUNT_WATER_NO]
                                Where B_ACCOUNT_SN = @B_ACCOUNT_SN";

            var result = dataAccess.Query<B_ACCOUNT_WATER_NO>(querysql, new
            {
                B_ACCOUNT_SN = AccountSN
            });

            return result.Select(c => c.WATER_NO).ToList();
        }

        /// <summary>
        /// 本來有就重新打開，沒有就加進去
        /// </summary>
        /// <param name="AccountNo"></param>
        /// <param name="WaterNo"></param>
        public void CreateAppUser(string AccountNo, string WaterNo, string Token)
        {
            string mainsql = @"If exists(Select Top(1) [B_ACCOUNT_SN] From [TWN].[dbo].[B_ACCOUNT] Where B_ACCOUNT=@B_ACCOUNT And [LOGIN_TYPE] = 1)            
                                Begin            
	                                Update [TWN].[dbo].[B_ACCOUNT] 
	                                Set VALID = 1, 
                                        PWD = @PWD
	                                Where B_ACCOUNT=@B_ACCOUNT And [LOGIN_TYPE] = 1  
                                End                    
                                Else            
                                Begin  
	                                Insert Into [TWN].[dbo].[B_ACCOUNT] 
				                                ([B_ACCOUNT]
                                                ,[PWD]
                                                ,[CREATE_DATE]
                                                ,[LAST_DATE]
                                                ,[VALID]
                                                ,[LOGIN_TYPE])
	                                Values
                                       (@B_ACCOUNT,
                                        @PWD,
                                        @CREATE_DATE,
                                        @LAST_DATE,
                                        @VALID,
                                        @LOGIN_TYPE)  
                                End ";

            object obj = new
            {
                B_ACCOUNT = AccountNo,
                WATER_NO = WaterNo,
                PWD = Token,
                CREATE_DATE = DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss"),
                LAST_DATE = DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss"),
                VALID = 1,
                LOGIN_TYPE = 1
            };
            dataAccess.Execute(mainsql, obj);

        }

        public int DenyAccountFromApp(string AccountNo)
        {
            string mainsql = @"Update [dbo].[B_ACCOUNT]
                               Set [VALID] = 0
                               Where  B_ACCOUNT = @AccountNo And [LOGIN_TYPE] = 1";

            return dataAccess.Execute(mainsql, new { AccountNo });
        }

        public b_ACCOUNT? GetBAccountByAccount(string AcountName)
        {
            string mainsql = @" Select * 
                                From [TWN].[dbo].[B_ACCOUNT] 
                                Where VALID = 1 And 
                                      B_ACCOUNT = @AcountName";
            object obj = new { AcountName };
            var result = dataAccess.Query<b_ACCOUNT>(mainsql, obj).ToList().FirstOrDefault();
            return result;
        }

        public (bool IsSuccess, string Message, F_B_LOGIN? UserInfo) LoginByUserNameAndPassWord(string UserName, string PassWord, string remoteIpAddress)
        {
            string mainsql = @"SELECT * FROM [dbo].[F_B_LOGIN] (@UserName,@PassWord)";
            object obj = new { UserName, PassWord };
            var result = dataAccess.Query<F_B_LOGIN>(mainsql, obj).FirstOrDefault();

            if (result == null)
            {
                return (false, "登入失敗，請確定您的帳號密碼", null);
            }

            if (result.LOGIN_STATUS == "OK")
            {
                string executesql = @"INSERT INTO [B_LOGIN_LOG]
                                       ([WATER_NO]
                                       ,[B_ACCOUNT_SN]
                                       ,[INP_DATE]
                                       ,[IP])
                                 VALUES
                                       (@WATER_NO
                                       ,@B_ACCOUNT_SN
                                       ,@INP_DATE
                                       ,@IP)";


                object execobj = new
                {
                    WATER_NO = "",
                    B_ACCOUNT_SN = result.B_ACCOUNT_SN,
                    INP_DATE = DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss"),
                    IP = remoteIpAddress
                };

                var Execreuslt = dataAccess.Execute(executesql, execobj);

                return (true, "登入成功", result);
            }

            return (false, result.LOGIN_STATUS, null);
        }

        public int SendMailUsingSendMailList(string B_ACCOUNT, string Email)
        {
            string FilePath = Directory.GetCurrentDirectory() + "\\ResetPw.html";
            StreamReader str = new StreamReader(FilePath);
            string MailText = str.ReadToEnd();
            str.Close();

            var pwd = CryptoGen(6);
            var Current = DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss");

            string UpdateSql = @"UPDATE [dbo].[B_ACCOUNT]
                                   SET [PWD] = @PWD
                                WHERE B_ACCOUNT = @BAccount And EMAIL = @EMail ";

            string InsertSql = @"INSERT INTO [dbo].[SEND_MAIL_LIST]
                                       ([TITLE]
                                       ,[CONTENTS]
                                       ,[IS_SEND]
                                       ,[SEND_TIME]
                                       ,[INP_DATE]
                                       ,[EMAIL]
                                       ,[FROM_TABLE]
                                       ,[FROM_SN])
                                 VALUES
                                       (@TITLE
                                       ,@CONTENTS
                                       ,@IS_SEND
                                       ,@SEND_TIME
                                       ,@INP_DATE
                                       ,@EMAIL
                                       ,@FROM_TABLE
                                       ,@FROM_SN)";

            var setContext = MailText.Replace("{pwd}", pwd).Replace("{currenttime}", Current);

            //改密碼
            //寄信

            dataAccess.Execute(UpdateSql, new { PWD = pwd, BAccount = B_ACCOUNT, EMail = Email });
            return dataAccess.Execute(InsertSql, new SEND_MAIL_LIST
            {
                TITLE = "台灣自來水公司-密碼發送通知",
                CONTENTS = setContext,
                IS_SEND = 0,
                INP_DATE = DateTime.Now.ToString("yyyy/MM/dd HH:mm:ss"),
                EMAIL = Email,
                FROM_TABLE = "B_ACCOUNT",
                FROM_SN = B_ACCOUNT,
            });
        }


        public string CryptoGen(int length)
        {
            using (var crypto = new RNGCryptoServiceProvider())
            {
                var bits = (length * 6);
                var byte_size = ((bits + 7) / 8);
                var bytesarray = new byte[byte_size];
                crypto.GetBytes(bytesarray);
                return Convert.ToBase64String(bytesarray);
            }
        }

        public int SendMailUsingSendMailList()
        {
            throw new NotImplementedException();
        }
    }


    public interface IHomeService
    {
        //不成體統的寫法 隨便吧==
        /// <summary>
        /// 去拉 Fn Chart Home
        /// </summary>
        /// <param name="UserName"></param>
        /// <param name="PassWord"></param>
        /// <param name="remoteIpAddress"></param>
        /// <returns></returns>
        public (bool IsSuccess, string Message, F_B_LOGIN? UserInfo) LoginByUserNameAndPassWord(string UserName, string PassWord, string remoteIpAddress);

        public bool CheckWaterNoIsAutoMeter(string WaterNo);

        public b_ACCOUNT? CheckAccountNoIsApp(string AccountNo);

        public b_ACCOUNT? GetBAccountByAccount(string AcountName);

        /// <summary>
        /// App用
        /// </summary>
        /// <param name="AccountSN"></param>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public List<string> CheckWaterNoNoIsApp(int AccountSN, string WaterNo);

        /// <summary>
        /// APP用
        /// </summary>
        /// <param name="AccountNo"></param>
        /// <param name="WaterNo"></param>
        /// <param name="Token"></param>
        public void CreateAppUser(string AccountNo, string WaterNo, string Token);

        /// <summary>
        /// APP用 反授權帳號
        /// </summary>
        /// <param name="AccountNo"></param>
        /// <returns></returns>
        public int DenyAccountFromApp(string AccountNo);

        public int SendMailUsingSendMailList(string B_ACCOUNT, string Email);
    }
}
