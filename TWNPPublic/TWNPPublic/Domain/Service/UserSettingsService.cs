using SqlData;
using TWNPPublic.Common.Extension;
using TWNPPublic.Models.Entity;
using TWNPPublic.ViewModels.UserManage;

namespace TWNPPublic.Domain.Service
{
    public class UserManageService : IUserManageService
    {
        private readonly IDapperDataAccess dapperDataAccess;
        private readonly IAspNetUser aspNetUser;

        public UserManageService(IDapperDataAccess dapperDataAccess, IAspNetUser aspNetUser)
        {
            this.dapperDataAccess = dapperDataAccess;
            this.aspNetUser = aspNetUser;
            this.dapperDataAccess.SetHttpContextAccessor(aspNetUser.Name.ToString(), aspNetUser.ClientIP.ToString());
        }

        /// <summary>
        /// 使用SN取得使用者資料
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public b_ACCOUNT? GetAccountBySN(int Id)
        {
            string mainsql = "Select * From B_ACCOUNT Where B_ACCOUNT_SN = @Id";
            object obj = new { Id };
            return this.dapperDataAccess.Query<b_ACCOUNT>(mainsql, obj).FirstOrDefault();
        }

        /// <summary>
        /// 使用者SN 取得這個使用者下的所有水號
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public List<B_ACCOUNT_WATER_NO> ListedWaterNOBySN(int Id)
        {
            string mainsql = "Select * From B_ACCOUNT_WATER_NO Where B_ACCOUNT_SN = @Id";
            object obj = new { Id };
            return this.dapperDataAccess.Query<B_ACCOUNT_WATER_NO>(mainsql, obj);
        }

        /// <summary>
        /// 更新使用者資料
        /// </summary>
        /// <param name="model">本身不會使用帳號進行查詢或更新帳號</param>
        /// <param name="SN">用SN更新</param>
        /// <returns></returns>
        public int UpdateAccountInfo(UpdateUserManageViewModel model, int SN)
        {

            string mainsql = @"Update B_ACCOUNT
                               SET PWD = @Pwd
                                  ,EMAIL = @Email
                                  ,CELL_PHONE = @CellPhone 
                               Where B_ACCOUNT_SN = @SN";
            object obj = new
            {
                Pwd = model.Password,
                Email = model.Email,
                CellPhone = model.PhoneNumber,
                SN = SN
            };

            if(model.WaterNO != null)
            {

                string deleteWaterNo5sql = @"Delete 
                                          From B_ACCOUNT_WATER_NO
                                          Where B_ACCOUNT_SN = @SN";
                object deleteobj = new
                {
                    SN = SN
                };
                this.dapperDataAccess.Execute(deleteWaterNo5sql, deleteobj);

                foreach (var item in model.WaterNO)
                {
                    string insertWaterNO5sql = @"Insert Into B_ACCOUNT_WATER_NO
                                                   (B_ACCOUNT_SN,WATER_NO,VALID)
                                             VALUES
                                                   (@SN,@WaterNo,@Valid)";
                    object waterobj = new
                    {
                        SN = SN,
                        WaterNo = item,
                        Valid = 1
                    };
                    this.dapperDataAccess.Execute(insertWaterNO5sql, waterobj);
                }
            }

            return this.dapperDataAccess.Execute(mainsql, obj); ;
        }

        /// <summary>
        /// 新建使用者
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        public int CreateAccountInfo(CreateUserManageViewModel model)
        {
            //這裡沒原子性耶 併發量不大應該可以吧 ._.!?
            string mainsql = @"Insert Into B_ACCOUNT
                                       ([B_ACCOUNT]
                                       ,[PWD]
                                       ,[CREATE_DATE]
                                       ,[LAST_DATE]
                                       ,[EMAIL]
                                       ,[CELL_PHONE]
                                       ,[VALID])
                                 Values
                                       (@B_ACCOUNT
                                       ,@PWD
                                       ,@CREATE_DATE
                                       ,@LAST_DATE
                                       ,@EMAIL
                                       ,@CELL_PHONE
                                       ,@VALID)";
            object obj = new
            {
                B_ACCOUNT = model.Account,
                PWD = model.Password,
                CREATE_DATE = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                LAST_DATE = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                EMAIL = model.Email,
                CELL_PHONE = model.PhoneNumber,
                VALID = 1
            };

            return this.dapperDataAccess.Execute(mainsql, obj);
        }

        /// <summary>
        /// 檢查帳號是否存在於系統中
        /// </summary>
        /// <param name="Account"></param>
        /// <returns></returns>
        public (bool IsExist, string Message) IsThisAccountCanUsed(string Account)
        {
            string mainsql = @"Select * From B_ACCOUNT where B_ACCOUNT=@Account";
            object obj = new { Account };
            var result = this.dapperDataAccess.Query<b_ACCOUNT>(mainsql, obj);
            if (result.Count() > 0)
                return (false, "此帳號已經被使用，請使用別的帳號註冊系統。");
            else
                return (true, "您可以使用此帳號");
        }

        /// <summary>
        /// 使用帳號，取得UserSN 
        /// </summary>
        /// <param name="Account"></param>
        /// <returns></returns>
        /// <exception cref="NotImplementedException"></exception>
        public int GetSNByAccount(string Account)
        {
            string mainsql = @"SELECT * FROM B_ACCOUNT Where B_ACCOUNT = @Account";
            object obj = new { Account };
            var result = this.dapperDataAccess.Query<b_ACCOUNT>(mainsql, obj).FirstOrDefault();
            if (result == null)
                return 0;
            else
                return result.B_ACCOUNT_SN;
        }

        /// <summary>
        /// 給我SN 跟水號幫你加進使用者-水號表 
        /// </summary>
        /// <param name="SN"></param>
        /// <param name="WaterNO"></param>
        /// <returns></returns>
        public int CreateWaterNosBySN(int SN, string WaterNO)
        {
            string mainsql = @"INSERT INTO B_ACCOUNT_WATER_NO
                                   ([B_ACCOUNT_SN],[WATER_NO],[VALID])
                             VALUES
                                   (@SN,@WaterNO,1)";
            object obj = new { SN, WaterNO };
            return this.dapperDataAccess.Execute(mainsql, obj);
        }

        public int DeleteWateNoByUserSN(int SN, string WaterNo)
        {
            string mainsql = @"DELETE FROM [TWN].[dbo].[B_ACCOUNT_WATER_NO]
                                Where B_ACCOUNT_SN = @SN And WATER_NO = @WaterNo";

            string mainsqlext = @"Delete From [TWN].[dbo].[B_ALART_SETTING]
                                Where B_ACCOUNT_SN = @SN And WATER_NO = @WaterNo";

            object obj = new
            {
                SN,
                WaterNo
            };

            this.dapperDataAccess.Execute(mainsqlext, obj);
            return this.dapperDataAccess.Execute(mainsql, obj);
        }
    }
    public interface IUserManageService
    {
        public b_ACCOUNT? GetAccountBySN(int Id);
        public List<B_ACCOUNT_WATER_NO> ListedWaterNOBySN(int Id);
        public int UpdateAccountInfo(UpdateUserManageViewModel model, int SN);
        public int CreateAccountInfo(CreateUserManageViewModel model);
        public int GetSNByAccount(string Account);
        public (bool IsExist, string Message) IsThisAccountCanUsed(string Account);
        public int CreateWaterNosBySN(int SN, string WaterNO);

        public int DeleteWateNoByUserSN(int SN, string WaterNo);
    }
}