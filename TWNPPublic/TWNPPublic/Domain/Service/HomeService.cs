namespace TWNPPublic.Domain.Service
{
    public class HomeService : IHomeService
    {
        public (bool IsSuccess, string Message) LoginByUserNameAndPassWord(string UserName, string PassWord)
        {
            return (true, "登入成功");
        }
    }

    
    public interface IHomeService
    {
        //不成體統的寫法 隨便吧==
        public (bool IsSuccess, string Message) LoginByUserNameAndPassWord(string UserName, string PassWord);
    }
}
