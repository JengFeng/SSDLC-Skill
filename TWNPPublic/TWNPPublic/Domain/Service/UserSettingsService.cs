using SqlData;
using System.Security.Cryptography;
using TWNPPublic.Common.Extension;
using TWNPPublic.Models.Entity;
using TWNPPublic.ViewModels.Alert;
using TWNPPublic.ViewModels.UserManage;

namespace TWNPPublic.Domain.Service
{
    public class UserManageService : IUserManageService
    {
        private readonly IDapperDataAccess dapperDataAccess;
        private readonly IAspNetUser aspNetUser;
        private const int Iterations = 10000;
        private const int SaltLength = 16;
        private const int KeyLength = 32; // 256 bits = 32 bytes

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
        public List<V_B_ACCOUNT_WATER_NO> ListedWaterNOBySN(int Id)
        {
            string mainsql = @"Select BW.B_ACCOUNT_SN
                                      , BW.WATER_NO
                                      , BW.VALID
                                      , BW.ST_DATE
                                      , BW.EN_DATE
                                      , BW.NICK_NAME
                                      , BW.NICK_NAME_SHOW
	                                  , A.NAME_DAES
	                                  , A.ADDRESS_DAES 
                               From B_ACCOUNT_WATER_NO  BW
                               LEFT JOIN A_WATERFEE Ａ ON BW.WATER_NO = A.WATERNO
                               Where B_ACCOUNT_SN = @Id And BW.VALID=1
                               ORDER BY BW.WATER_NO";
                

            object obj = new { Id };
            return this.dapperDataAccess.Query<V_B_ACCOUNT_WATER_NO>(mainsql, obj);
        }

        /// <summary>
        /// 更新使用者資料
        /// </summary>
        /// <param name="model">本身不會使用帳號進行查詢或更新帳號</param>
        /// <param name="SN">用SN更新</param>
        /// <returns></returns>
        public int UpdateAccountInfo(UpdateUserManageViewModel model, int SN, bool isPasswordChanged)
        {

            string mainsql = @"Update B_ACCOUNT
                               SET APWD = @Pwd
                                  ,EMAIL = @Email
                                  ,CELL_PHONE = @CellPhone 
                               Where B_ACCOUNT_SN = @SN";

            CommonFunc comm = new();
            string EncryptPWD = comm.AesEncrypt(model.Pwd?.Trim());  //加密
            object obj = new
            {
                Pwd = EncryptPWD,
                Email = model.Email?.Trim(),
                CellPhone = model.PhoneNumber?.Trim(),
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

                //foreach (var item in model.WaterNO)
                //{
                //    string insertWaterNO5sql = @"Insert Into B_ACCOUNT_WATER_NO
                //                                   (B_ACCOUNT_SN,WATER_NO,VALID)
                //                             VALUES
                //                                   (@SN,@WaterNo,@Valid)";
                //    object waterobj = new
                //    {
                //        SN = SN,
                //        WaterNo = item,
                //        Valid = 1
                //    };
                //    this.dapperDataAccess.Execute(insertWaterNO5sql, waterobj);
                //}
                foreach (var item in model.WaterData)
                {
                    string insertWaterNO5sql = @"INSERT INTO B_ACCOUNT_WATER_NO
                                                    (B_ACCOUNT_SN, WATER_NO, NICK_NAME, NICK_NAME_SHOW, VALID)
                                                VALUES
                                                    (@SN, @WaterNo, @NickName, @NickNameShow, @Valid)";

                    var waterobj = new
                    {
                        SN = SN, // B_ACCOUNT_SN
                        WaterNo = item.WATER_NO?.Trim(), // 水號
                        NickName = item.NICK_NAME?.Trim(), // 暱稱
                        NickNameShow = item.NICK_NAME_SHOW, // 顯示暱稱的狀態（0 或 1）
                        Valid = 1 // 這裡假設有效狀態是 1，根據實際情況修改
                    };

                    this.dapperDataAccess.Execute(insertWaterNO5sql, waterobj);
                }

            }

            int result = this.dapperDataAccess.Execute(mainsql, obj);

            if (result > 0)
            {
                var accountInfo = this.GetAccountBySN(SN);
                if (accountInfo != null)
                {
                    bool isGroupedAccount = this.IsSttnGrpIdExist(accountInfo.B_ACCOUNT);
                    string hashedPassword = HashPassword(model.Pwd?.Trim());  //加密
                    if (isGroupedAccount)
                    {
                        // 歸戶：更新其他 DB 的密碼/電話/郵件
                        this.UpdateWmmmdbSttngrp(accountInfo.B_ACCOUNT, hashedPassword, model.Email, model.PhoneNumber, isPasswordChanged);
                    }
                    else if (isPasswordChanged)
                    {
                        // 一般水號：只更新其他 DB 的密碼
                        // 這裡放你「一般水號」原本的其他 DB 密碼更新 SQL
                        this.UpdateWmmmdbImCmuserPassword(accountInfo.B_ACCOUNT, hashedPassword);
                    }
                }
            }

            return result;
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
                                       ,[APWD]
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
            CommonFunc comm = new();
            string EncryptPWD = comm.AesEncrypt(model.Pwd);  //加密
            object obj = new
            {
                B_ACCOUNT = model.Account,
                PWD = EncryptPWD,
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
            string mainsql = @"SELECT * FROM B_ACCOUNT Where B_ACCOUNT = @Account And Valid=1";
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

        /// <summary>
        /// 使用水號取得自動讀表驗收次日日期
        /// </summary>
        /// <param name="Id"></param>
        /// <returns></returns>
        public A_PH_METER_QUALIFY_DATE? GetPhMeterQualifyDateByWaterNo(string WaterNO)
        {
            string mainsql = "Select * From A_PH_METER_QUALIFY_DATE Where WATER_NO = @WaterNO";
            object obj = new { WaterNO };
            return this.dapperDataAccess.Query<A_PH_METER_QUALIFY_DATE>(mainsql, obj).FirstOrDefault();
        }

        public int DeleteAllAlertSetBySNAndWaterNo(int AccountSN, string WaterNo)
        {
            string mainsql = @"DELETE FROM B_ALART_SETTING
                                WHERE B_ACCOUNT_SN = @SN And WATER_NO = @WaterNo AND B_ALART_CODE_SN = 652";
            object obj = new { SN = AccountSN, WaterNo };
            return this.dapperDataAccess.Execute(mainsql, obj);
        }

        public int UpdateAlertServiceBySNAndWaterNo(int AccountSN, string WaterNo, List<B_ALART_SETTING> obj)
        {
            string mainsql = @"INSERT INTO [dbo].[B_ALART_SETTING]
                                       ([WATER_NO]
                                       ,[B_ALART_CODE_SN]
                                       ,[VALUE]
                                       ,[VALUE1]
                                       ,[B_ACCOUNT_SN])
                                 VALUES
                                       (@WATER_NO
                                       ,@B_ALART_CODE_SN
                                       ,@VALUE
                                       ,@VALUE1
                                       ,@B_ACCOUNT_SN)";
            return this.dapperDataAccess.ExecuteList(mainsql, obj); ;
        }

        public List<B_ALART_SETTING> GetAertSetByAccountSNAndWaterNo(int SN, string WaterNos)
        {
            string mainsql = @"Select * From B_ALART_SETTING Where B_ACCOUNT_SN = @SN And WATER_NO = @WaterNos AND B_ALART_CODE_SN = 652";
            object obj = new { SN, WaterNos };
            var result = this.dapperDataAccess.Query<B_ALART_SETTING>(mainsql, obj).ToList(); ;

            return result;
        }

        public bool IsSttnGrpIdExist(string SttnGrpId)
        {
            string mainsql = @"SELECT 1 
                       FROM A_PH_METER_STTNGRP 
                       WHERE sttn_grp_id = @SttnGrpId";

            object obj = new { SttnGrpId };
            return this.dapperDataAccess.Query<int>(mainsql, obj).Any();
        }

        private int UpdateWmmmdbSttngrp(string sttnGrpId, string encryptedPwd, string email, string tel, bool isPasswordChanged)
        {
            //調整密碼更新SQL，讓它只更新密碼欄位，其他欄位保持不變
            string mainsql = isPasswordChanged
                            ? @"UPDATE WMMMDB.dbo.sttngrp
                           SET login_pwd = @LoginPwd
                              ,email = @Email
                              ,tel = @Tel
                         WHERE sttn_grp_id = @SttnGrpId"
                            : @"UPDATE WMMMDB.dbo.sttngrp
                           SET email = @Email
                              ,tel = @Tel
                         WHERE sttn_grp_id = @SttnGrpId";

            object obj = new
            {
                SttnGrpId = sttnGrpId,
                LoginPwd = encryptedPwd,
                Email = email?.Trim(),
                Tel = tel?.Trim()
            };

            return this.dapperDataAccess.Execute(mainsql, obj);
        }

        private int UpdateWmmmdbImCmuserPassword(string account, string encryptedPwd)
        {
            //調整密碼更新SQL，讓它只更新密碼欄位，其他欄位保持不變
            string mainsql = @"UPDATE WMMMDB.dbo.im_cmuser
                       SET password = @Password
                       WHERE user_id = @Account";

            object obj = new
            {
                Account = account,
                Password = encryptedPwd
            };

            return this.dapperDataAccess.Execute(mainsql, obj);
        }

        /// <summary>
        /// 雜湊密碼：iterations:salt:hash
        /// </summary>
        public string HashPassword(string password)
        {
            byte[] salt = new byte[SaltLength];
            RandomNumberGenerator.Fill(salt);

            byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                Iterations,
                HashAlgorithmName.SHA256,
                KeyLength
            );

            string saltBase64 = Convert.ToBase64String(salt);
            string hashBase64 = Convert.ToBase64String(hash);

            return $"{Iterations}:{saltBase64}:{hashBase64}";
        }

        /// <summary>
        /// 驗證密碼
        /// </summary>
        public bool VerifyPassword(string password, string storedHash)
        {
            try
            {
                var parts = storedHash.Split(':');
                if (parts.Length != 3) return false;

                int iterations = int.Parse(parts[0]);
                byte[] salt = Convert.FromBase64String(parts[1]);
                byte[] stored = Convert.FromBase64String(parts[2]);

                byte[] computed = Rfc2898DeriveBytes.Pbkdf2(
                    password,
                    salt,
                    iterations,
                    HashAlgorithmName.SHA256,
                    stored.Length
                );

                // 固定時間比對（避免 timing attack）
                return CryptographicOperations.FixedTimeEquals(stored, computed);
            }
            catch
            {
                return false;
            }
        }

    }
    public interface IUserManageService
    {
        public b_ACCOUNT? GetAccountBySN(int Id);
        public List<V_B_ACCOUNT_WATER_NO> ListedWaterNOBySN(int Id);
        public int UpdateAccountInfo(UpdateUserManageViewModel model, int SN, bool isPasswordChanged);
        public int CreateAccountInfo(CreateUserManageViewModel model);
        public int GetSNByAccount(string Account);
        public (bool IsExist, string Message) IsThisAccountCanUsed(string Account);
        public int CreateWaterNosBySN(int SN, string WaterNO);

        public int DeleteWateNoByUserSN(int SN, string WaterNo);

        public A_PH_METER_QUALIFY_DATE? GetPhMeterQualifyDateByWaterNo(string WaterNO);

        public int DeleteAllAlertSetBySNAndWaterNo(int AccountSN, string WaterNo);

        public int UpdateAlertServiceBySNAndWaterNo(int AccountSN, string WaterNo, List<B_ALART_SETTING> obj);

        public List<B_ALART_SETTING> GetAertSetByAccountSNAndWaterNo(int SN, string WaterNo);

        public bool IsSttnGrpIdExist(string SttnGrpId);
        /// <summary>
        /// 雜湊密碼：iterations:salt:hash
        /// </summary>
        public string HashPassword(string password);

        /// <summary>
        /// 驗證密碼是否正確
        /// </summary>
        public bool VerifyPassword(string password, string hash);

    }
}