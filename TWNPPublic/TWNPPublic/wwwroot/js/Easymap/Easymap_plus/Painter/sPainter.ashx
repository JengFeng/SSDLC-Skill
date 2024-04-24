<%@ WebHandler Language="C#" Class="sPainter" %>

using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;

public class sPainter : IHttpHandler
{

    public void ProcessRequest(HttpContext context)
    {
        string f = context.Request.QueryString["f"] == null ? "" : context.Request.QueryString["f"].ToString();

        var json = getFileJson();
        context.Response.ContentType = "application/json";
        context.Response.Write(json);
    }

    private string getFileJson()
    {
        var lst = new List<dynamic>();
        var reqUrl = HttpContext.Current.Request.Url.ToString();
        var url = reqUrl.Substring(0, reqUrl.ToLower().IndexOf("modules"));
        var serverPath = HttpContext.Current.Server.MapPath("../../../uploadFile/easymap_plus/Painter");
        var dis = new DirectoryInfo(serverPath);

        foreach (var di in dis.GetDirectories())
        {
            var dyna = new ResultObj();
            dyna.Directorie = di.Name;

            dyna.Files = new  List<FileObj>();
            foreach (var file in di.GetFiles())
            {
                var fileObj = new FileObj {
                    name = file.Name,
                    path = string.Format("{0}uploadFile/easymap_plus/painter/{1}/{2}","",di.Name,file.Name)
                };
                dyna.Files.Add(fileObj);
            }

            lst.Add(dyna);
        }

        return (new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(lst));
    }

    private class ResultObj {
        public string Directorie { get; set; }
        public List<FileObj> Files { get; set; }
    }
    private class FileObj {
        public string name { get; set; }
        public string path { get; set; }
    }

    public string DataTableToJsonWithJavaScriptSerializer(DataTable table)
    {
        JavaScriptSerializer jsSerializer = new JavaScriptSerializer();
        List<Dictionary<string, object>> parentRow = new List<Dictionary<string, object>>();
        Dictionary<string, object> childRow;
        foreach (DataRow row in table.Rows)
        {
            childRow = new Dictionary<string, object>();
            foreach (DataColumn col in table.Columns)
            {
                childRow.Add(col.ColumnName, row[col]);
            }
            parentRow.Add(childRow);
        }
        return jsSerializer.Serialize(parentRow);
    }

    public bool IsReusable
    {
        get
        {
            return false;
        }
    }

}