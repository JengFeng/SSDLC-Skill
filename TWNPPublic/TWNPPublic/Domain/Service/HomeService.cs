using SqlData;
using TWNPPublic.Common.Extension;
using TWNPPublic.Models.Entity;
using TWNPPublic.Models.SqlFunctions;
using TWNPPublic.ViewModels.Home;

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

            var result =dataAccess.Query<B_ACCOUNT_WATER_NO>(querysql, new
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
        public void CreateAppUser(string AccountNo, string WaterNo,string Token)
        {

            //string mainsql = @"INSERT INTO [dbo].[B_ACCOUNT]
            //                       ([B_ACCOUNT]
            //                       ,[PWD]
            //                       ,[CREATE_DATE]
            //                       ,[LAST_DATE]
            //                       ,[VALID]
            //                       ,[LOGIN_TYPE])
            //                 Select @B_ACCOUNT
            //                       ,@PWD
            //                       ,@CREATE_DATE
            //                       ,@LAST_DATE
            //                       ,@VALID
            //                       ,@LOGIN_TYPE
            //             Where Not Exists (Select 1 From [B_ACCOUNT] Where [B_ACCOUNT] = @B_ACCOUNT )";

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
    }


    public interface IHomeService
    {
        //不成體統的寫法 隨便吧==
        public (bool IsSuccess, string Message, F_B_LOGIN? UserInfo) LoginByUserNameAndPassWord(string UserName, string PassWord, string remoteIpAddress);

        public bool CheckWaterNoIsAutoMeter(string WaterNo);

        public b_ACCOUNT? CheckAccountNoIsApp(string AccountNo);

        public List<string> CheckWaterNoNoIsApp(int AccountSN, string WaterNo);

        public void CreateAppUser(string AccountNo, string WaterNo,string Token);

        public int DenyAccountFromApp(string AccountNo);
    }
}
