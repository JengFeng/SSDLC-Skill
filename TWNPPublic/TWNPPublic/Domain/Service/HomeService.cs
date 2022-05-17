using SqlData;
using TWNPPublic.Models.SqlFunctions;

namespace TWNPPublic.Domain.Service
{
    public class HomeService : IHomeService
    {
        private readonly IDapperDataAccess dataAccess;

        public HomeService(IDapperDataAccess dataAccess)
        {
            this.dataAccess = dataAccess;
        }
        public (bool IsSuccess, string Message, F_B_LOGIN? UserInfo) LoginByUserNameAndPassWord(string UserName, string PassWord)
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
                return (true, "登入成功", result);
            }

            return (false, result.LOGIN_STATUS, null);
        }
    }


    public interface IHomeService
    {
        //不成體統的寫法 隨便吧==
        public (bool IsSuccess, string Message, F_B_LOGIN? UserInfo) LoginByUserNameAndPassWord(string UserName, string PassWord);
    }
}
