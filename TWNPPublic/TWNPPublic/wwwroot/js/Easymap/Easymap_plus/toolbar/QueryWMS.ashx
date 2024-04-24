<%@ WebHandler Language="C#" Class="QueryWMS" %>

using System;
using System.Web;
using System.Net;
using System.IO;
using System.Xml;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Collections;

public class QueryWMS : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {

        string mapno = context.Request.QueryString["mapno"].ToString();
        string _USERNAME_ = "foodgov";
        string _PWD_ = "govfood/U55AP";


        try
        {
            if (mapno != null)
            {
                string url = "http://owms.afasi.gov.tw/asofb/" + mapno + "/wms?SERVICE=WMS&REQUEST=GetCapabilities";
                //string url = "http://owms.afasi.gov.tw/asofb/94201004/wms?";
                WebRequest myWebRequest = WebRequest.Create(url);
                myWebRequest.PreAuthenticate = true;



                NetworkCredential networkCredential = new NetworkCredential(_USERNAME_, _PWD_);
                myWebRequest.Credentials = networkCredential;
                WebResponse myWebResponse = myWebRequest.GetResponse();
                Stream dataStream = new MemoryStream();
                dataStream = myWebResponse.GetResponseStream();
                StreamReader streamRead = new StreamReader(dataStream);
                string responseString = streamRead.ReadToEnd();
                XmlDocument xml = new XmlDocument();
                xml.LoadXml(responseString);
                XmlNamespaceManager ns = new XmlNamespaceManager(xml.NameTable);

                XmlNodeList xmlNodeList = xml.GetElementsByTagName("Layer");

                List<WMS> WMSs = new List<WMS>();

                foreach (XmlNode node in xmlNodeList)
                {

                    if (node.Attributes.Count > 0)
                    {
                        XmlDocument xmlItem = new XmlDocument();
                        xmlItem.LoadXml("<XML>" + node.InnerXml + "</XML>");

                        WMS wms = new WMS();
                        wms.NAME = readElementContent(xmlItem, "Name");
                        wms.Title = readElementContent(xmlItem, "Title");
                        WMSs.Add(wms);
                    }
                }



                string jsonString = "makeDDLOption(" + JsonConvert.SerializeObject(WMSs) + ");";

                context.Response.ContentType = "text/plain";
                context.Response.Write(jsonString);
            }
            else
            {
                context.Response.ContentType = "text/json";
                context.Response.Write("makeDDLOption({});");
            }
        }
        catch (Exception ex) {
            
            context.Response.ContentType = "text/json";
            context.Response.Write("makeDDLOption({});");
            
        }
        
        
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

    /// <summary>
    /// 取得element中的資訊
    /// </summary>
    /// <param name="xmlDoc"></param>
    /// <param name="TagName"></param>
    /// <returns></returns>
    public string readElementContent(XmlDocument xmlDoc, string TagName)
    {
        string Content = "";
        try
        {
            Content = xmlDoc.GetElementsByTagName(TagName)[0].InnerText;
        }
        catch { }

        return Content;
    }
    public class WMS
    {
        public string NAME;
        public string Title;
    
	    public WMS()
	    {
		    //
		    // TODO: 在此加入建構函式的程式碼
		    //
	    }
    }

}