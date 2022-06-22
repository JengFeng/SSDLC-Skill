using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TWNPPublicSendmail.Model
{
    public class V_B_MESSAGE_MAIL
    {
        public int B_MESSAGE_SN { get; set; }
        public string WATER_NO { get; set; }
        public string NOTE { get; set; }
        public string VALUE { get; set; }
        public decimal IS_SEND { get; set; }
        public DateTime INP_DATE { get; set; }
    }
}
