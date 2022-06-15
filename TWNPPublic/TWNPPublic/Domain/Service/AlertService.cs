using SqlData;
using TWNPPublic.Models.Entity;
using TWNPPublic.ViewModels.Alert;

namespace TWNPPublic.Domain.Service
{
    public class AlertService : IAlertService
    {
        private readonly IDapperDataAccess dataAccess;

        public AlertService(IDapperDataAccess dataAccess)
        {
            this.dataAccess = dataAccess;
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

        public int DeleteAllAlertSetBySN(int AccountSN)
        {
            string mainsql = @"DELETE FROM B_ALART_SETTING
                                WHERE B_ACCOUNT_SN = @SN";
            object obj = new { SN = AccountSN };
            return dataAccess.Execute(mainsql, obj);
        }

        public ListedAlertSetViewModel GetAertSetByAccountSN(int SN)
        {
            string mainsql = @"Select * From B_ALART_SETTING Where B_ACCOUNT_SN = @SN";
            object obj = new { SN };
            var result = dataAccess.Query<B_ALART_SETTING>(mainsql, obj);

            //那一長串奇怪的參數來自 MMcode 
            string AlertValueStraight7Day = "";
            string AlertValueStraight30Day = "";
            string AlertValueStraight24HR = "";
            //額外參數 這設計應該是有點問題""
            string ExtendValueStraight7Day = "";
            string ExtendValueStraight30Day = "";
            string AlertValueStraightLimitGate = "";
            string ExtendValueStraightLimitMaxGate = "";
            string ExtendValueStraightLimitMinGate = "";
            //聯絡信箱
            string AlertEmail = "";
            //連絡電話
            string AlertPhone = "";
            List<string> WaterNo = new List<string>();

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 3) != null)
            {
                AlertValueStraight7Day = result.First(c => c.B_ALART_CODE_SN == 3).VALUE;
                ExtendValueStraight7Day = result.First(c => c.B_ALART_CODE_SN == 3).VALUE1;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 5) != null)
            {
                AlertValueStraight30Day = result.First(c => c.B_ALART_CODE_SN == 5).VALUE;
                ExtendValueStraight30Day = result.First(c => c.B_ALART_CODE_SN == 5).VALUE1;
            }

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


            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 49) != null)
            {
                AlertValueStraight24HR = result.First(c => c.B_ALART_CODE_SN == 49).VALUE;
            }

            if (result.FirstOrDefault(c => c.B_ALART_CODE_SN == 50) != null)
            {
                AlertValueStraightLimitGate = result.First(c => c.B_ALART_CODE_SN == 50).VALUE;
                var temp = result.First(c => c.B_ALART_CODE_SN == 50).VALUE1;
                if (!string.IsNullOrEmpty(temp))
                {
                    var array = temp.Split(',');
                    ExtendValueStraightLimitMaxGate = array[0];
                    ExtendValueStraightLimitMinGate = array[1];
                }
            }

            return new ListedAlertSetViewModel()
            {
                AlertEmail = AlertEmail,
                AlertEmails = AlertEmail.Split(','),
                AlertPhone = AlertPhone,
                AlertValueStraight7Day = AlertValueStraight7Day,
                ExtendValueStraight7Day = ExtendValueStraight7Day,
                AlertValueStraight30Day = AlertValueStraight30Day,
                ExtendValueStraight30Day = ExtendValueStraight30Day,
                WaterNos = WaterNo,
                AlertValueStraight24HR = AlertValueStraight24HR,
                AlertValueStraightLimitGate = AlertValueStraightLimitGate,
                ExtendValueStraightLimitMaxGate = ExtendValueStraightLimitMaxGate,
                ExtendValueStraightLimitMinGate = ExtendValueStraightLimitMinGate
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
    }

    public interface IAlertService
    {
        public int UpdateAlertServiceBySN(int AccountSN, List<B_ALART_SETTING> obj);
        public int DeleteAllAlertSetBySN(int AccountSN);
        public Dictionary<string, List<Tuple<int, string>>> GetAlertMMCode();
        public ListedAlertSetViewModel GetAertSetByAccountSN(int SN);
        //public ListedAlertSetViewModel GetAlertSetByWaterNo(string WaterNO);
    }
}
