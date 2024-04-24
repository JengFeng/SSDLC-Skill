using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Script.Services;
using System.Web.Services;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml;
using System.Xml.Linq;

public partial class webpages_section : System.Web.UI.Page
{
    protected void Page_Load(object sender, EventArgs e)
    {

    }

    /// <summary>
    /// 取得xy的地段號資訊
    /// </summary>
    /// <param name="X"></param>
    /// <param name="Y"></param>
    /// <returns></returns>
    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static string get_land(string X, string Y)
    {

        try
        {
            string url = "http://59.120.223.172/identify/qq.ashx?Lon={0}&Lat={1}";

            url = string.Format(url, X, Y);

            WebRequest myWebRequest = WebRequest.Create(url);

            WebResponse myWebResponse;

            myWebRequest.Timeout = 10000;

            myWebResponse = myWebRequest.GetResponse();

            //網頁的contentType
            string cType = myWebResponse.ContentType.ToString();

            Stream responseStream = myWebResponse.GetResponseStream();

            StreamReader reader1 = null;

            reader1 = new StreamReader(responseStream, Encoding.GetEncoding("utf-8"));

            //取出整個網頁
            string str = reader1.ReadToEnd();

            return str;
        }catch(Exception ee){
            return "";
        }
    }

    /// <summary>
    /// 取得mapno
    /// </summary>
    /// <param name="X"></param>
    /// <param name="Y"></param>
    /// <returns></returns>
    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static string get_land1(string X, string Y)
    {

        string section = "";
        string city_id = "";
        string area = "";

        #region 取得縣市代碼
        try
        {

            string url = "http://59.120.223.172/identify/qq.ashx?Lon=" + X + "&Lat=" + Y;

            WebRequest myWebRequest = WebRequest.Create(url);

            WebResponse myWebResponse;

            myWebRequest.Timeout = 10000;

            myWebResponse = myWebRequest.GetResponse();

            //網頁的contentType
            string cType = myWebResponse.ContentType.ToString();

            Stream responseStream = myWebResponse.GetResponseStream();

            StreamReader reader1 = null;

            reader1 = new StreamReader(responseStream, Encoding.GetEncoding("utf-8"));

            //取出整個網頁
            string str = reader1.ReadToEnd();

            //# 處理json
            var jsonReader = JsonReaderWriterFactory.CreateJsonReader(Encoding.UTF8.GetBytes(str), new System.Xml.XmlDictionaryReaderQuotas());

            var root = XElement.Load(jsonReader);

            XmlDocument doc = new XmlDocument();

            doc.LoadXml(root.ToString());

            city_id = doc.SelectSingleNode("/root/city_id").InnerText;
            section = doc.SelectSingleNode("/root/new_section").InnerText;
            string town_id = doc.SelectSingleNode("/root/town_id").InnerText;

            area = city_id + town_id;

        }
        catch (Exception ee)
        {
            return "";
        }
        #endregion


        #region 取得office
        string office_id = "";
        try
        {

            string URLAuth = "http://landmaps.nlsc.gov.tw/S_Maps/qryTileMapIndex?callback=jQuery16409653918257586465_1461049339036&type=2&flag=1&city=" + city_id + "&x=" + X + "&y=" + Y + "&alpah=0.5f&_=1461132832501";
            string postString = string.Format("center=", "");

            const string contentType = "application/x-www-form-urlencoded";
            System.Net.ServicePointManager.Expect100Continue = false;

            CookieContainer cookies = new CookieContainer();
            HttpWebRequest webRequest = WebRequest.Create(URLAuth) as HttpWebRequest;
            webRequest.Method = "POST";
            webRequest.ContentType = contentType;
            webRequest.Timeout = 10000;
            webRequest.CookieContainer = cookies;
            webRequest.ContentLength = postString.Length;
            webRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36";
            webRequest.Accept = "*/*";
            webRequest.Referer = "http://maps.nlsc.gov.tw/O09/mapshow.action";

            StreamWriter requestWriter = new StreamWriter(webRequest.GetRequestStream());
            requestWriter.Write(postString);
            requestWriter.Close();

            StreamReader responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream());
            string responseData = responseReader.ReadToEnd();

            string json = responseData.Replace("jQuery16409653918257586465_1461049339036", "").Replace("(", "").Replace(")", "");

            responseReader.Close();
            webRequest.GetResponse().Close();

            office_id = json;
        }
        catch (Exception ee)
        {
            return "";
        }
        #endregion

        return office_id;
    }
    /// <summary>
    /// 取得mapno
    /// </summary>
    /// <param name="X"></param>
    /// <param name="Y"></param>
    /// <returns></returns>
    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static string get_mapno(string X,string Y)
    {

        
        string mapno = "";
        //# 取得圖幅號
        #region 取得圖幅號
        try
        {
            string URLAuth = "http://210.69.25.156/rice4/webpages/MapAnalysis.asmx/GetMapNo";
            string postString = string.Format("X={0}&Y={1}", X, Y);

            const string contentType = "application/x-www-form-urlencoded";
            System.Net.ServicePointManager.Expect100Continue = false;

            CookieContainer cookies = new CookieContainer();
            HttpWebRequest webRequest = WebRequest.Create(URLAuth) as HttpWebRequest;
            webRequest.Method = "POST";
            webRequest.ContentType = contentType;
            webRequest.CookieContainer = cookies;
            webRequest.ContentLength = postString.Length;
            webRequest.Timeout = 10000;

            StreamWriter requestWriter = new StreamWriter(webRequest.GetRequestStream());
            requestWriter.Write(postString);
            requestWriter.Close();

            StreamReader responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream());
            string responseData = responseReader.ReadToEnd();

            //# 找出數字
            responseData = responseData.Replace("\"", "").Replace("[", "").Replace("]", "").Trim().Trim();

            responseReader.Close();
            webRequest.GetResponse().Close();
            mapno = responseData;

        }catch(Exception ee){

            mapno = "";
        }
        #endregion

        return "{\"mapno\":\""+mapno+"\"}";
    }

    /// <summary>
    /// 取的一個地方的資訊
    /// </summary>
    /// <param name="X"></param>
    /// <param name="Y"></param>
    /// <returns></returns>
    [WebMethod]
    public static string get_information(string X,string Y)
    {

        string html = "";
        //string new_section = "";
        //string landno8 = "";
        //string result = "";

        //try { 
        //    #region get data
        //    try
        //    {
        //        string url = "http://59.120.223.172/identify/qq.ashx?Lon={0}&Lat={1}";

        //        url = string.Format(url, X, Y);

        //        WebRequest myWebRequest = WebRequest.Create(url);

        //        WebResponse myWebResponse;

        //        myWebRequest.Timeout = 10000;

        //        myWebResponse = myWebRequest.GetResponse();

        //        //網頁的contentType
        //        string cType = myWebResponse.ContentType.ToString();

        //        Stream responseStream = myWebResponse.GetResponseStream();

        //        StreamReader reader1 = null;

        //        reader1 = new StreamReader(responseStream, Encoding.GetEncoding("utf-8"));

        //        //取出整個網頁
        //        string str = reader1.ReadToEnd();

        //        var jsonReader = JsonReaderWriterFactory.CreateJsonReader(Encoding.UTF8.GetBytes(str), new System.Xml.XmlDictionaryReaderQuotas());

        //        var root = XElement.Load(jsonReader);

        //        XmlDocument doc = new XmlDocument();

        //        doc.LoadXml(root.ToString());

        //        new_section = doc.SelectNodes("/root/new_section")[0].InnerText;
        //        landno8 = doc.SelectNodes("/root/landno8")[0].InnerText;
        //        result = doc.SelectNodes("/root/result")[0].InnerText;
        //    }
        //    catch (Exception ee)
        //    {
        //        return "";
        //    }
        //    #endregion

        //    #region 組合結果
        //    string OutBox = "";
        //    string Landname = "";

        //    string layer = "";
        //    string layername = "";//shape file名稱

        //    SALUSLib.Draw Map = new SALUSLib.Draw();

        //    DataTable DT = null;
        //    DT = new Schema.LAYERS().ListByLayer(new_section.Substring(0, 1));

        //    //#龍哥元件取出需要的資料
        //    foreach (DataRow R in DT.Rows)
        //    {
        //        string layerone = R["LAYER_ONE"].ToString().ToLower();
        //        string shppath = R["DATAPATH"].ToString() + R["LAYER"].ToString();

        //        layername = R["LAYER_NAME"].ToString();

        //        string attr = "";


        //        attr = Map.QueryRiceShapeAttr(shppath, 1, "NEW_SECTIO in ('" + new_section + "') and LANDNO8 in ('" + landno8 + "') ", @"D:\mapcache\");

        //        OutBox += attr;

        //        if (attr != "")
        //        {
        //            layer = layerone;//下方要使用的圖層名稱
        //            break;
        //        }
        //    }

        //    string MapNO = Common.Global.GetMapNo(X, Y);

        //    html += "土地標示：" + result+"<Br/>";

        //    html += "面積：" + (float.Parse(Common.Global.ParseShpAttr(OutBox)[0]["AREA"]) / 10000).ToString("0.0000") + "(公頃)<Br/>";
        //    #endregion
        //}catch(Exception ee){

        //}

        ////是否有轉作休耕
        //try { 
        //    Schema.Sybase_codes sybase_codes = new Schema.Sybase_codes();

        //    DataTable DT = sybase_codes.ListDeclares(new_section, landno8, "", "105", "1", "", "1040101");

        //    if (DT.Rows.Count >= 1)
        //    {
        //        DataRow dr = DT.Rows[0];


        //        html += "轉作休耕作物類別：" + sybase_codes.get_decl_ares_crops(dr) ;
        //    }
        //    else
        //    {
                
        //    }
        //}catch(Exception ee){

        //}
        return html;
    }

    /// <summary>
    /// 取得mapno
    /// </summary>
    /// <param name="X"></param>
    /// <param name="Y"></param>
    /// <returns></returns>
    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static string get_layer(string X, string Y)
    {

        string section = "";
        string city_id = "";
        string area = "";

        #region 取得縣市代碼
        try
        {
            
            string url = "http://59.120.223.172/identify/qq.ashx?Lon=" + X + "&Lat=" + Y;

            WebRequest myWebRequest = WebRequest.Create(url);

            WebResponse myWebResponse;

            myWebRequest.Timeout = 10000;

            myWebResponse = myWebRequest.GetResponse();

            //網頁的contentType
            string cType = myWebResponse.ContentType.ToString();

            Stream responseStream = myWebResponse.GetResponseStream();

            StreamReader reader1 = null;

            reader1 = new StreamReader(responseStream, Encoding.GetEncoding("utf-8"));

            //取出整個網頁
            string str = reader1.ReadToEnd();

            //# 處理json
            var jsonReader = JsonReaderWriterFactory.CreateJsonReader(Encoding.UTF8.GetBytes(str), new System.Xml.XmlDictionaryReaderQuotas());

            var root = XElement.Load(jsonReader);

            XmlDocument doc = new XmlDocument();

            doc.LoadXml(root.ToString());

            city_id = doc.SelectSingleNode("/root/city_id").InnerText;
            section = doc.SelectSingleNode("/root/new_section").InnerText;
            string town_id = doc.SelectSingleNode("/root/town_id").InnerText;

            area = city_id+town_id;

        }catch(Exception ee){
            return "";
        }
        #endregion


        #region 取得office
        string office_id = "";
        try
        {

            string URLAuth = "http://landmaps.nlsc.gov.tw/S_Maps/qryTileMapIndex?callback=jQuery16409653918257586465_1461049339036&type=2&flag=1&city=" + city_id + "&x=" + X + "&y=" + Y + "&alpah=0.5f&_=1461132832501";
            string postString = string.Format("center=", "");

            const string contentType = "application/x-www-form-urlencoded";
            System.Net.ServicePointManager.Expect100Continue = false;

            CookieContainer cookies = new CookieContainer();
            HttpWebRequest webRequest = WebRequest.Create(URLAuth) as HttpWebRequest;
            webRequest.Method = "POST";
            webRequest.ContentType = contentType;
            webRequest.CookieContainer = cookies;
            webRequest.ContentLength = postString.Length;
            webRequest.UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36";
            webRequest.Accept = "*/*";
            webRequest.Referer = "http://maps.nlsc.gov.tw/O09/mapshow.action";
            webRequest.Timeout = 10000;

            StreamWriter requestWriter = new StreamWriter(webRequest.GetRequestStream());
            requestWriter.Write(postString);
            requestWriter.Close();

            StreamReader responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream());
            string responseData = responseReader.ReadToEnd();

            string json = responseData.Replace("jQuery16409653918257586465_1461049339036", "").Replace("(", "").Replace(")", "");

            responseReader.Close();
            webRequest.GetResponse().Close();

            //# 處理json
            var jsonReader = JsonReaderWriterFactory.CreateJsonReader(Encoding.UTF8.GetBytes(json), new System.Xml.XmlDictionaryReaderQuotas());

            var root = XElement.Load(jsonReader);

            XmlDocument doc = new XmlDocument();

            doc.LoadXml(root.ToString());

            string office = doc.SelectSingleNode("/root/item/office").InnerText;
            string sect = doc.SelectSingleNode("/root/item/sect").InnerText;
            office_id = office+sect;
        }
        catch (Exception ee)
        {
            return "";
        }
        #endregion

        return office_id;
    }

    [WebMethod]
    [ScriptMethod(ResponseFormat = ResponseFormat.Json)]
    public static string get_bbox(string office, string sect, string landno)
    {
        return "";
        string bbox = "";
        //# 取得圖幅號
        #region 取得圖幅號
        try
        {



            string URLAuth = "http://landmaps.nlsc.gov.tw/S_Maps/qryTileMapIndex?callback=jQuery16407335355952871261_1461197445373&type=2&flag=2&office={0}&sect={1}&landno={2}&alpah=0.5f&imgflag=1&_=1461205803672";

            URLAuth = string.Format(URLAuth, office, sect, landno);

            string postString = string.Format("center={0}", "120.648793,24.175915");

            const string contentType = "application/x-www-form-urlencoded";
            System.Net.ServicePointManager.Expect100Continue = false;

            CookieContainer cookies = new CookieContainer();
            HttpWebRequest webRequest = WebRequest.Create(URLAuth) as HttpWebRequest;
            webRequest.Method = "POST";
            webRequest.ContentType = contentType;
            webRequest.CookieContainer = cookies;
            webRequest.ContentLength = postString.Length;
            webRequest.UserAgent = "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.1) Gecko/2008070208 Firefox/3.0.1";
            webRequest.Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
            webRequest.Referer = "http://maps.nlsc.gov.tw/O09/mapshow.action";
            webRequest.Timeout = 10000;

            StreamWriter requestWriter = new StreamWriter(webRequest.GetRequestStream());
            requestWriter.Write(postString);
            requestWriter.Close();

            StreamReader responseReader = new StreamReader(webRequest.GetResponse().GetResponseStream());
            string responseData = responseReader.ReadToEnd();

            string json = responseData.Replace("jQuery16407335355952871261_1461197445373", "").Replace("(", "").Replace(")", "");

            bbox = json;
        }
        catch (Exception ee)
        {

            bbox = "";
        }
        #endregion

        return bbox;
    }
}