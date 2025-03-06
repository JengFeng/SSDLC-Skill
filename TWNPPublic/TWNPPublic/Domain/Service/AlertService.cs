using SqlData;
using TWNPPublic.Common.Extension;
using TWNPPublic.Models.Entity;
using TWNPPublic.ViewModels.Alert;

namespace TWNPPublic.Domain.Service
{
    public class AlertService : IAlertService
    {
        private readonly IDapperDataAccess dataAccess;
        private readonly IAspNetUser aspNetUser;

        public AlertService(IDapperDataAccess dataAccess, IAspNetUser aspNetUser)
        {
            this.dataAccess = dataAccess;
            this.aspNetUser = aspNetUser;
            this.dataAccess.SetHttpContextAccessor(aspNetUser.Name.ToString(), aspNetUser.ClientIP.ToString());
        }

        public int UpdateAlertServiceBySN(int AccountSN, List<B_ALART_SETTING> obj)
        {
            DeleteAllAlertSetBySN(AccountSN);
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
            return dataAccess.ExecuteList(mainsql, obj); ;
        }

        public int UpdateAlertServiceBySNAndWaterNo(int AccountSN, string WaterNo, List<B_ALART_SETTING> obj)
        {
            GetAertSetByAccountSNAndWaterNo(AccountSN, WaterNo);
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
            return dataAccess.ExecuteList(mainsql, obj); ;
        }

        public ListedAlertSetViewModel GetAertSetByAccountSN(int SN)
        {
            string mainsql = @"Select * From B_ALART_SETTING Where B_ACCOUNT_SN = @SN";
            object obj = new { SN };
            var result = dataAccess.Query<B_ALART_SETTING>(mainsql, obj);

            //那一長串奇怪的參數來自 MMcode 
            string AlertValueYesterday = "";
            string ExtendValue1Yesterday = "";
            string ExtendValue2Yesterday = "";
            string AlertValueWeek = "";
            string ExtendValue1Week = "";
            //額外參數 這設計應該是有點問題...
            string AlertValueLastMonth = "";
            string ExtendValueLastMonth = "";
            //連續用水警示
            string AlertValueContinuousWaterUsage = "";
            string ExtendValueContinuousWaterUsage = "";
            //連續無用水警示
            string AlertValueContinuousIdleWaterUsage = "";
            string ExtendValueContinuousIdleWaterUsage = "";
            //夜間用水增加警示
            string AlertValueNighttimeWaterIncrease = "";
            string ExtendValueNighttimeWaterIncrease = "";
            //每日用水上限提醒
            string AlertValueDailyWaterUsageLimit = "";
            string ExtendValueDailyWaterUsageLimit = "";
            //每期用水預算提醒
            string AlertValueWaterUsageBudget = "";
            string ExtendValueWaterUsageBudget = "";

            string AlertValueThreedayWaterUse = "";
            string AlertValueThreedayWaterNonUse = "";
            //聯絡信箱
            string AlertEmail = "";
            //連絡電話
            string AlertPhone = "";
            //水號
            List<string> WaterNo = new List<string>();

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 15) != null)
            {
                AlertEmail = result.First(c => c.B_ALART_CODE_SN == 15).VALUE;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 16) != null)
            {
                AlertPhone = result.First(c => c.B_ALART_CODE_SN == 16).VALUE;
            }

            if (result.Where(c => c.B_ALART_CODE_SN == 16).Count() >= 1)
            {
                WaterNo = result.Where(c => c.B_ALART_CODE_SN == 16).Select(c => c.WATER_NO).ToList();
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 100) != null)
            {
                AlertValueYesterday = result.First(c => c.B_ALART_CODE_SN == 100).VALUE;
                ExtendValue1Yesterday = result.First(c => c.B_ALART_CODE_SN == 100).VALUE1;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 646) != null)
            {
                AlertValueWeek = result.First(c => c.B_ALART_CODE_SN == 646).VALUE;
                ExtendValue1Week = result.First(c => c.B_ALART_CODE_SN == 646).VALUE1;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 101) != null)
            {
                AlertValueLastMonth = result.First(c => c.B_ALART_CODE_SN == 101).VALUE;
                ExtendValueLastMonth = result.First(c => c.B_ALART_CODE_SN == 101).VALUE1;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102) != null)
            {
                var AlertValueThreedayWaterUseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "108");
                AlertValueContinuousWaterUsage = AlertValueThreedayWaterUseTemp == null ? "" : AlertValueThreedayWaterUseTemp.VALUE;
                AlertValueThreedayWaterUse = AlertValueThreedayWaterUseTemp == null ? "" : AlertValueThreedayWaterUseTemp.VALUE1;
                
                var AlertValueThreedayWaterNonUseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "107");
                AlertValueContinuousIdleWaterUsage = AlertValueThreedayWaterNonUseTemp == null ? "" : AlertValueThreedayWaterNonUseTemp.VALUE;
                ExtendValueContinuousIdleWaterUsage = AlertValueThreedayWaterNonUseTemp == null ? "" : AlertValueThreedayWaterNonUseTemp.VALUE1;

                var AlertValueNighttimeWaterIncreaseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "649");
                AlertValueNighttimeWaterIncrease = AlertValueNighttimeWaterIncreaseTemp == null ? "" : AlertValueNighttimeWaterIncreaseTemp.VALUE;
                ExtendValueNighttimeWaterIncrease = AlertValueNighttimeWaterIncreaseTemp == null ? "" : AlertValueNighttimeWaterIncreaseTemp.VALUE1;

                var AlertValueDailyWaterUsageLimitTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "650");
                AlertValueDailyWaterUsageLimit = AlertValueDailyWaterUsageLimitTemp == null ? "" : AlertValueDailyWaterUsageLimitTemp.VALUE;
                ExtendValueDailyWaterUsageLimit = AlertValueDailyWaterUsageLimitTemp == null ? "" : AlertValueDailyWaterUsageLimitTemp.VALUE1;

                var AlertValueWaterUsageBudgetTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "651");
                AlertValueWaterUsageBudget = AlertValueWaterUsageBudgetTemp == null ? "" : AlertValueWaterUsageBudgetTemp.VALUE;
                ExtendValueWaterUsageBudget = AlertValueWaterUsageBudgetTemp == null ? "" : AlertValueWaterUsageBudgetTemp.VALUE1;
            }

            //if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102) != null)
            //{
            //    var AlertValueThreedayWaterUseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "107");
            //    AlertValueThreedayWaterUse = AlertValueThreedayWaterUseTemp == null ? "" : AlertValueThreedayWaterUseTemp.VALUE;
            //    var AlertValueThreedayWaterNonUseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "108");
            //    AlertValueThreedayWaterNonUse = AlertValueThreedayWaterNonUseTemp == null ? "" : AlertValueThreedayWaterNonUseTemp.VALUE;
            //}

            return new ListedAlertSetViewModel()
            {
                AlertEmail = AlertEmail,
                AlertEmails = AlertEmail.Split(';'),
                AlertPhone = AlertPhone,
                WaterNos = WaterNo,
                AlertValueYesterday = AlertValueYesterday,
                ExtendValue1Yesterday = ExtendValue1Yesterday,
                ExtendValue2Yesterday = ExtendValue1Yesterday,

                AlertValueWeek = AlertValueWeek,
                ExtendValue1Week = ExtendValue1Week,

                AlertValueLastMonth = AlertValueLastMonth,
                ExtendValueLastMonth = ExtendValueLastMonth,

                AlertValueContinuousWaterUsage = AlertValueContinuousWaterUsage,
                ExtendValueContinuousWaterUsage = ExtendValueContinuousWaterUsage,

                AlertValueContinuousIdleWaterUsage = AlertValueContinuousIdleWaterUsage,
                ExtendValueContinuousIdleWaterUsage = ExtendValueContinuousIdleWaterUsage,

                AlertValueNighttimeWaterIncrease = AlertValueNighttimeWaterIncrease,
                ExtendValueNighttimeWaterIncrease = ExtendValueNighttimeWaterIncrease,

                AlertValueDailyWaterUsageLimit = AlertValueDailyWaterUsageLimit,
                ExtendValueDailyWaterUsageLimit = ExtendValueDailyWaterUsageLimit,

                AlertValueWaterUsageBudget = AlertValueWaterUsageBudget,
                ExtendValueWaterUsageBudget = ExtendValueWaterUsageBudget

                //AlertValueThreedayWaterNonUse = AlertValueThreedayWaterNonUse,
                //AlertValueThreedayWaterUse = AlertValueThreedayWaterUse
            };

        }

        public ListedAlertSetViewModel GetAertSetByAccountSNAndWaterNo(int SN, string WaterNos)
        {
            string mainsql = @"Select * From B_ALART_SETTING Where B_ACCOUNT_SN = @SN And WATER_NO = @WaterNos";
            object obj = new { SN, WaterNos };
            var result = dataAccess.Query<B_ALART_SETTING>(mainsql, obj);

            //那一長串奇怪的參數來自 MMcode 
            string AlertValueYesterday = "";
            string ExtendValue1Yesterday = "";
            string ExtendValue2Yesterday = "";
            string AlertValueWeek = "";
            string ExtendValue1Week = "";
            //額外參數 這設計應該是有點問題...
            string AlertValueLastMonth = "";
            string ExtendValueLastMonth = "";
            //連續用水警示
            string AlertValueContinuousWaterUsage = "";
            string ExtendValueContinuousWaterUsage = "";
            //連續無用水警示
            string AlertValueContinuousIdleWaterUsage = "";
            string ExtendValueContinuousIdleWaterUsage = "";
            //夜間用水增加警示
            string AlertValueNighttimeWaterIncrease = "";
            string ExtendValueNighttimeWaterIncrease = "";
            //每日用水上限提醒
            string AlertValueDailyWaterUsageLimit = "";
            string ExtendValueDailyWaterUsageLimit = "";
            //每期用水預算提醒
            string AlertValueWaterUsageBudget = "";
            string ExtendValueWaterUsageBudget = "";

            string AlertValueThreedayWaterUse = "";
            string AlertValueThreedayWaterNonUse = "";
            //聯絡信箱
            string AlertEmail = "";
            //連絡電話
            string AlertPhone = "";
            //水號
            //List<string> WaterNo = new List<string>();

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 15) != null)
            {
                AlertEmail = result.First(c => c.B_ALART_CODE_SN == 15).VALUE;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 16) != null)
            {
                AlertPhone = result.First(c => c.B_ALART_CODE_SN == 16).VALUE;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 100) != null)
            {
                AlertValueYesterday = result.First(c => c.B_ALART_CODE_SN == 100).VALUE;
                ExtendValue1Yesterday = result.First(c => c.B_ALART_CODE_SN == 100).VALUE1;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 646) != null)
            {
                AlertValueWeek = result.First(c => c.B_ALART_CODE_SN == 646).VALUE;
                ExtendValue1Week = result.First(c => c.B_ALART_CODE_SN == 646).VALUE1;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 101) != null)
            {
                AlertValueLastMonth = result.First(c => c.B_ALART_CODE_SN == 101).VALUE;
                ExtendValueLastMonth = result.First(c => c.B_ALART_CODE_SN == 101).VALUE1;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102) != null)
            {
                var AlertValueThreedayWaterUseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "108");
                AlertValueContinuousWaterUsage = AlertValueThreedayWaterUseTemp == null ? "" : AlertValueThreedayWaterUseTemp.VALUE;
                ExtendValueContinuousWaterUsage = AlertValueThreedayWaterUseTemp == null ? "" : AlertValueThreedayWaterUseTemp.VALUE1;

                var AlertValueThreedayWaterNonUseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "107");
                AlertValueContinuousIdleWaterUsage = AlertValueThreedayWaterNonUseTemp == null ? "" : AlertValueThreedayWaterNonUseTemp.VALUE;
                ExtendValueContinuousIdleWaterUsage = AlertValueThreedayWaterNonUseTemp == null ? "" : AlertValueThreedayWaterNonUseTemp.VALUE1;

                var AlertValueNighttimeWaterIncreaseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "649");
                AlertValueNighttimeWaterIncrease = AlertValueNighttimeWaterIncreaseTemp == null ? "" : AlertValueNighttimeWaterIncreaseTemp.VALUE;
                ExtendValueNighttimeWaterIncrease = AlertValueNighttimeWaterIncreaseTemp == null ? "" : AlertValueNighttimeWaterIncreaseTemp.VALUE1;

                var AlertValueDailyWaterUsageLimitTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "650");
                AlertValueDailyWaterUsageLimit = AlertValueDailyWaterUsageLimitTemp == null ? "" : AlertValueDailyWaterUsageLimitTemp.VALUE;
                ExtendValueDailyWaterUsageLimit = AlertValueDailyWaterUsageLimitTemp == null ? "" : AlertValueDailyWaterUsageLimitTemp.VALUE1;

                var AlertValueWaterUsageBudgetTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "651");
                AlertValueWaterUsageBudget = AlertValueWaterUsageBudgetTemp == null ? "" : AlertValueWaterUsageBudgetTemp.VALUE;
                ExtendValueWaterUsageBudget = AlertValueWaterUsageBudgetTemp == null ? "" : AlertValueWaterUsageBudgetTemp.VALUE1;
            }

            //if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102) != null)
            //{
            //    var AlertValueThreedayWaterUseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "107");
            //    AlertValueThreedayWaterUse = AlertValueThreedayWaterUseTemp == null ? "" : AlertValueThreedayWaterUseTemp.VALUE;
            //    var AlertValueThreedayWaterNonUseTemp = result.FirstOrDefault(c => c.B_ALART_CODE_SN == 102 && c.VALUE == "108");
            //    AlertValueThreedayWaterNonUse = AlertValueThreedayWaterNonUseTemp == null ? "" : AlertValueThreedayWaterNonUseTemp.VALUE;
            //}

            return new ListedAlertSetViewModel()
            {
                AlertEmail = AlertEmail,
                AlertEmails = AlertEmail.Split(';'),
                AlertPhone = AlertPhone,
                AlertValueYesterday = AlertValueYesterday,
                ExtendValue1Yesterday = ExtendValue1Yesterday,
                ExtendValue2Yesterday = ExtendValue1Yesterday,
                AlertValueWeek = AlertValueWeek,
                ExtendValue1Week = ExtendValue1Week,

                AlertValueLastMonth = AlertValueLastMonth,
                ExtendValueLastMonth = ExtendValueLastMonth,

                AlertValueContinuousWaterUsage = AlertValueContinuousWaterUsage,
                ExtendValueContinuousWaterUsage = ExtendValueContinuousWaterUsage,

                AlertValueContinuousIdleWaterUsage = AlertValueContinuousIdleWaterUsage,
                ExtendValueContinuousIdleWaterUsage = ExtendValueContinuousIdleWaterUsage,

                AlertValueNighttimeWaterIncrease = AlertValueNighttimeWaterIncrease,
                ExtendValueNighttimeWaterIncrease = ExtendValueNighttimeWaterIncrease,

                AlertValueDailyWaterUsageLimit = AlertValueDailyWaterUsageLimit,
                ExtendValueDailyWaterUsageLimit = ExtendValueDailyWaterUsageLimit,

                AlertValueWaterUsageBudget = AlertValueWaterUsageBudget,
                ExtendValueWaterUsageBudget = ExtendValueWaterUsageBudget

                //AlertValueThreedayWaterNonUse = AlertValueThreedayWaterNonUse,
                //AlertValueThreedayWaterUse = AlertValueThreedayWaterUse
            };
        }

        public Dictionary<string, List<Tuple<int, string>>> GetAlertMMCode()
        {
            string mainsqlStraight7Day = @"SELECT * FROM MM_CODE Where CLASS_SN = 1 And FATHER_SN = 3 Order by CODE_ID";
            string mainsqlStraight30Day = @"SELECT * FROM MM_CODE Where CLASS_SN = 1 And FATHER_SN = 5 Order by CODE_ID";

            var resultStraight7Day = dataAccess.Query<MM_CODE>(mainsqlStraight7Day, null);
            var resultStraight30Day = dataAccess.Query<MM_CODE>(mainsqlStraight30Day, null);

            Dictionary<string, List<Tuple<int, string>>> dicMMcode = new Dictionary<string, List<Tuple<int, string>>>();

            List<Tuple<int, string>> tuplesStraight7Day = new List<Tuple<int, string>>();
            foreach (var item in resultStraight7Day)
            {
                tuplesStraight7Day.Add(new Tuple<int, string>(item.CODE_SN, item.CODE_NAME));
            }
            dicMMcode.Add("連續七天累積用水量", tuplesStraight7Day);

            List<Tuple<int, string>> tuplesStraight30Day = new List<Tuple<int, string>>();
            foreach (var item in resultStraight30Day)
            {
                tuplesStraight30Day.Add(new Tuple<int, string>(item.CODE_SN, item.CODE_NAME));
            }
            dicMMcode.Add("連續三十天累積用水量", tuplesStraight30Day);

            return dicMMcode;
        }

        public int DeleteAllAlertSetBySN(int AccountSN)
        {
            string mainsql = @"DELETE FROM B_ALART_SETTING
                                WHERE B_ACCOUNT_SN = @SN AND B_ALART_CODE_SN != 652";
            object obj = new { SN = AccountSN };
            return dataAccess.Execute(mainsql, obj);
        }

        public int DeleteAllAlertSetBySNAndWaterNo(int AccountSN, string WaterNo)
        {
            string mainsql = @"DELETE FROM B_ALART_SETTING
                                WHERE B_ACCOUNT_SN = @SN And WATER_NO = @WaterNo AND B_ALART_CODE_SN != 652";
            object obj = new { SN = AccountSN, WaterNo };
            return dataAccess.Execute(mainsql, obj);
        }
    }

    public interface IAlertService
    {
        public int UpdateAlertServiceBySN(int AccountSN, List<B_ALART_SETTING> obj);
        public int UpdateAlertServiceBySNAndWaterNo(int AccountSN, string WaterNo, List<B_ALART_SETTING> obj);
        public int DeleteAllAlertSetBySN(int AccountSN);
        public int DeleteAllAlertSetBySNAndWaterNo(int AccountSN, string WaterNo);
        public Dictionary<string, List<Tuple<int, string>>> GetAlertMMCode();
        public ListedAlertSetViewModel GetAertSetByAccountSN(int SN);
        /// <summary>
        /// 用使用者SN 水號取得警界設定
        /// </summary>
        /// <param name="SN"></param>
        /// <param name="WaterNo"></param>
        /// <returns></returns>
        public ListedAlertSetViewModel GetAertSetByAccountSNAndWaterNo(int SN, string WaterNo);
        //public ListedAlertSetViewModel GetAlertSetByWaterNo(string WaterNO);
    }
}
