using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class Modules_MMLayer_produceFiles : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {
        string thispageurl = Request.Url.AbsoluteUri.Replace("caching.aspx", "");

        thispageurl = thispageurl.Replace(Request.Url.Host, "localhost");

        string path = Server.MapPath("./");
        string str = "";
        WebClient wc = new WebClient();
        wc.Encoding = Encoding.UTF8;

        //# get_layers
        str = wc.DownloadString(thispageurl+ "sPainter.ashx?f=get_layers");
        System.IO.File.WriteAllText(path+"files.json", str);

    }
}