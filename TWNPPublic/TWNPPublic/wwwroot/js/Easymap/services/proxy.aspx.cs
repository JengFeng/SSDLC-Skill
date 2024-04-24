using System;
using System.Collections.Generic;

using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

using System.Net;
using System.Text;
using System.IO;
using System.Xml;

using System.Drawing;
using System.Xml.Schema;
using System.Drawing.Imaging;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;

/**
 * version: 1.1
 * last updated: 2016/05/18
 *==============================================
 * 2016/03/17   fix:uri = new Uri(url); bug 加上try catch
 * 2016/05/18   fix:icon href trim \n\r
 * 2016/12/14   fix: request timeout response tag
 * 2017/01/29   fix: arcGis產的kml加上namespace
 * */

public partial class ALLRIVER_Default : System.Web.UI.Page
{
    private static readonly string DefaultUserAgent = "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.2; SV1; .NET CLR 1.1.4322; .NET CLR 2.0.50727)";  
        
    protected void Page_Load(object sender, EventArgs e)
    {
        

        string url = Request.QueryString["url"];
        string ezEncoding = Request.QueryString["ezEncoding"];  //有的來源編碼不為utf-8，需自行定議

        if(string.IsNullOrEmpty(url)){

            Response.ClearContent();
            Response.Write("");
            Response.End();
        }

        //因為?與&無法帶在url裡，先編碼後再傳進來在解碼
        if (url.Length > 0){
            url = url.Replace("[question]","?");
			for(int i=0;i<=20;i++){
				url = url.Replace("[and]","&");
			}
		}

        /*Encoding ed = Encoding.GetEncoding("utf-8");

        url = HttpUtility.UrlEncode(url, ed);

        Response.Write(url);
        Response.End();*/

        //取得目前檔案相對路徑
        Uri uri = null;

        try
        {
            #region 支援相對路徑
            if (url.Substring(0, 4) != "http")
            {
                string home = Request.UrlReferrer.AbsoluteUri.Substring(0, Request.UrlReferrer.AbsoluteUri.LastIndexOf('/') + 1);
                if (url.Substring(0, 2) == "./")
                {
                    url = home + url.Substring(2, url.Length - 2);
                }
                if (url.Substring(0, 3) == "../")
                {
                    var thome = home.Substring(0, home.Length - 1);
                    thome = thome.Substring(0, thome.LastIndexOf('/'));
                    url = thome + url.Substring(2, url.Length - 2);
                }
                else if (url.Substring(0, 1) == "/")
                {
                    url = home + url.Substring(1, url.Length - 1);
                }
                else
                {
                    url = home + url;
                }

            }
            #endregion

            uri = new Uri(url);
        }catch(Exception ee){
            Response.ClearContent();
            Response.Write("");
            Response.End();
        }

        if (uri.Host == "210.65.138.35")
        {
            url = url.Replace("210.65.138.35", "192.168.30.1");
        }

        string thispage = "http://" + uri.Host;
        for (int i = 0; i<uri.Segments.Length-1;i++ )
        {
            thispage += uri.Segments[i];
        }
        

        //讀取資料
        HttpWebRequest request;



        //todo: https sources not work
        if (url.StartsWith("https", StringComparison.OrdinalIgnoreCase))
        {
            request = WebRequest.Create(url) as HttpWebRequest;

            // 強制認為憑證都是通過的，特殊情況再使用
            /*ServicePointManager.ServerCertificateValidationCallback = delegate { return true; };
            ServicePointManager.SecurityProtocol =
                    SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls |
                    SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;*/

            
            // 重點是修改這行
            ServicePointManager.ServerCertificateValidationCallback = new RemoteCertificateValidationCallback(CheckValidationResult);
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;// SecurityProtocolType.Tls1.2;
        }
        else
        {

            request = WebRequest.Create(url) as HttpWebRequest;

        }


        HttpWebResponse myWebResponse;

        request.Timeout = 16000;
        
        try
        {

            myWebResponse = (HttpWebResponse)request.GetResponse();

            string cType = myWebResponse.ContentType.ToString();

            // 資料類型
            switch (myWebResponse.ContentType)
            {
                case "image/gif; charset=utf-8":
                case "image/gif":
                case "image/png":
                case "image/jpeg":
                    
                    //Stream dataStream = new MemoryStream();
                    //dataStream = myWebResponse.GetResponseStream();
        
                    //Bitmap myImage = new Bitmap(dataStream);
                    //MemoryStream ms = new MemoryStream();
                    //myImage.SetResolution(100, 100);

                    //EncoderParameters eParam = new EncoderParameters();
                    //eParam.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, (long)100);

                    //ImageCodecInfo jpegCodec = ImageCodecInfo.GetImageEncoders().Where(ks => ks.MimeType == "image/png").FirstOrDefault();

                    //myImage.Save(ms,jpegCodec,eParam);
         
                    //Response.ClearContent();
                    //Response.BinaryWrite(ms.ToArray());

                    //ms.Close();
                    //myImage.Dispose();
                    //dataStream.Close();
                    break;
                //# kmls
                default:

                    Stream responseStream = myWebResponse.GetResponseStream();
                    
                    string str = "";
                    string filetype = Path.GetExtension(url);

                    if (myWebResponse.ContentType == "application/vnd.google-earth.kmz")
                    {
                        filetype = ".kmz";
                    }
                    if (myWebResponse.ContentType == "application/vnd.google-earth.kmz .kmz") {
                        filetype = ".kmz";
                    }

                    switch(filetype){
                        default:
                            StreamReader reader1 = null;
                            
                            switch (ezEncoding)
                            {
                                case "big5":
                                    reader1 = new StreamReader(responseStream, Encoding.GetEncoding("big5"));
                                    break;
                                default:
                                    reader1 = new StreamReader(responseStream, Encoding.GetEncoding("utf-8"));
                                    break;
                            }

                            str = reader1.ReadToEnd();

                            //# 檔案長度太短就不理他了
                            if (str.Length <= 10) {
                                str = HttpUtility.HtmlEncode(str);

                                Response.Write(str);
                                Response.End();
                            }



                            XmlDocument xdoct = new XmlDocument();

                            try
                            {
                                xdoct.LoadXml(str);
                            }catch(Exception ee){

                                //加上一些可能的namespace
                                try {
                                    XmlDocument xxdoc = new XmlDocument();
                                    NameTable nt = new NameTable();
                                    XmlNamespaceManager nsmgr = new XmlNamespaceManager(nt);

                                    nsmgr.AddNamespace("xsi", "http://www.google.com/kml/ext/2.2");
                                    nsmgr.AddNamespace("gx", "http://www.google.com/kml/ext/2.2");
                                    nsmgr.AddNamespace("kml", "http://www.opengis.net/kml/2.2");
                                    nsmgr.AddNamespace("atom", "http://www.w3.org/2005/Atom");
                                    XmlParserContext context = new XmlParserContext(null, nsmgr, null, XmlSpace.None);
                                    XmlReaderSettings xset = new XmlReaderSettings();
                                    xset.ConformanceLevel = ConformanceLevel.Fragment;
                                    XmlReader rd = XmlReader.Create(new StringReader(str), xset, context);
                                    xdoct.Load(rd);
                                }catch(Exception eee){
                                    Response.ClearContent();
                                    Response.Write("");
                                    Response.End();
                                }

                            }
                            break;
                        case ".kmz"://# 如果是zip

                            try
                            {
                                //ZipInputStream zipInStream = new ZipInputStream(responseStream);
                                //ZipEntry entry = zipInStream.GetNextEntry();
                                //StreamReader reader2 = new StreamReader(zipInStream, Encoding.GetEncoding("utf-8"));
                      
                                //str = reader2.ReadToEnd();
                                //zipInStream.Close();
                            }catch(Exception ee){
                                Response.ClearContent();
                                Response.Write("");
                                Response.End();
                            }

                            break;
                    }

                    XmlDocument xDoc = new XmlDocument();

                    string result = str;
                    System.Xml.XmlNamespaceManager xmlnsManager = new System.Xml.XmlNamespaceManager(xDoc.NameTable);

                    try
                    {

                        result = result.Replace("http://earth.google.com/kml/2.1", "http://www.opengis.net/kml/2.2");
                        result = result.Replace("http://earth.google.com/kml/2.0", "http://www.opengis.net/kml/2.2");
                        result = result.Trim();

                        if (result.ToLower().IndexOf("<!doctype") >= 0) {
                            Response.Write("");
                            Response.End();
                        }

                        //拿掉 xsi:schemaLocation tag
                        int trimTagIndex = result.ToLower().IndexOf("<document");
                        if (trimTagIndex >= 1)
                        {
                            int trimTagIndexNext = result.IndexOf(">", trimTagIndex);

                            result = result.Substring(0, trimTagIndex + "<Document".Length) + result.Substring(trimTagIndexNext, result.Length - trimTagIndexNext);

                        }
                        xDoc.LoadXml(result);
                            
                        //xmlnsManager.AddNamespace("", "http://www.opengis.net/kml/2.2");
                        //xmlnsManager.AddNamespace("gx", "http://www.google.com/kml/ext/2.2");
                        xmlnsManager.AddNamespace("kml", "http://www.opengis.net/kml/2.2");
                        //xmlnsManager.AddNamespace("atom", "http://www.w3.org/2005/Atom");
                    }catch(XmlException x){
                        Response.Write(result); 
                        Response.End();
                        
                    }
   
                    string path = "";
                    string host = Request.ServerVariables["HTTP_HOST"];

                    XmlNodeList xStyle =xDoc.SelectNodes("//kml:Document/kml:Style", xmlnsManager);
                    XmlNodeList xStyle_href = xDoc.SelectNodes("//kml:Document/kml:Style/kml:IconStyle/kml:Icon/kml:href", xmlnsManager);
                    //如果style的href是相對網址，設定一下網址
                    for (int i = 0; i < xStyle_href.Count; i++)
                    {
                        try
                        {
                            string href = xStyle_href[i].ChildNodes[0].InnerText;

                            href = href.Trim('\r', '\n');
                            href = href.TrimEnd('\r', '\n');
                            href = href.Trim();
                            if (href.Substring(0, 4).ToLower() != "http") {
                                xStyle_href[i].ChildNodes[0].InnerText = thispage + href;
                            }
                        }catch(Exception eeee){
                            continue;
                        }
                    }

                    result = xDoc.OuterXml;

                    //result = HttpUtility.HtmlEncode(result);


                    Response.ClearContent();
                    Response.ContentType = myWebResponse.ContentType;
                    Response.Write(result);
                    Response.End();
                
                
                break;
            }
        

            myWebResponse.Close();

            Response.End();
        }
        catch (WebException ee)
        {

            Response.ClearContent();
            Response.Write("@GISMM_EASYMAP_KML_PROXY_TIMEOUT ("+ HttpUtility.HtmlEncode(ee.ToString())+")");
            Response.End();
        }
    }
    //for https
    private static bool CheckValidationResult(object sender, X509Certificate certificate, X509Chain chain, SslPolicyErrors errors)
    {
        return true; //总是接受  
    } 
    public string getFilename(int i,string url)
    {
        string filename;
        Uri uri;
        uri = new Uri(url);

        filename = uri.Segments[uri.Segments.Length - 1];
        filename = i.ToString() + filename;
        return filename;
    }
    public void ResizeImage(string OriginalFile, string NewFile, int NewWidth, int MaxHeight, bool OnlyResizeIfWider)
    {
        System.Drawing.Image FullsizeImage = System.Drawing.Image.FromFile(OriginalFile);

        // Prevent using images internal thumbnail
        FullsizeImage.RotateFlip(System.Drawing.RotateFlipType.Rotate180FlipNone);
        FullsizeImage.RotateFlip(System.Drawing.RotateFlipType.Rotate180FlipNone);

        if (OnlyResizeIfWider)
        {
            if (FullsizeImage.Width <= NewWidth)
            {
                NewWidth = FullsizeImage.Width;
            }
        }

        int NewHeight = FullsizeImage.Height * NewWidth / FullsizeImage.Width;
        if (NewHeight > MaxHeight)
        {
            // Resize with height instead
            NewWidth = FullsizeImage.Width * MaxHeight / FullsizeImage.Height;
            NewHeight = MaxHeight;
        }

        System.Drawing.Image NewImage = FullsizeImage.GetThumbnailImage(NewWidth, NewHeight, null, IntPtr.Zero);

        // Clear handle to original file so that we can overwrite it if necessary
        FullsizeImage.Dispose();

        // Save resized picture
        NewImage.Save(NewFile);
    }


}