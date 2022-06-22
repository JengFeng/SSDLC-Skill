using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SqlData;
using System.Data;
using System.Data.SqlClient;

namespace TWNPPublic.Controllers.Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class LayerController : ControllerBase
    {
        private readonly ISqlData sqlServer;

        public LayerController(ISqlData sql)
        {
            sqlServer = sql;
        }

        /// <summary>
        /// 取得圖層資料
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetLayerData")]
        public JsonResult GetLayerData()
        {
            try
            {
                DataTable dt = GetDtLayer("0");
                string strJson = JsonConvert.SerializeObject(dt);
                return new JsonResult(strJson);
            }
            catch (Exception ex)
            {
                return new JsonResult("");
            }
        }

        /// <summary>
        /// 取得圖層目錄資料
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetDirectoryData")]
        public JsonResult GetDirectoryData()
        {
            try
            {
                DataTable dt = GetDtDirectory("0");
                string strJson = JsonConvert.SerializeObject(dt);
                return new JsonResult(strJson);
            }
            catch (Exception ex)
            {
                return new JsonResult("");
            }
        }

        /// <summary>
        /// 取得底圖資料
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetBaseMapData")]
        public JsonResult GetBaseMapData()
        {
            try
            {
                List<SqlParameter> listSqlParam = new List<SqlParameter>();
                string strSQL = @"
                    SELECT D.[NAME] AS 'DIR_NAME', L.LAYER_SN, L.[TYPES], L.[NAME] as 'LAYER_NAME', [PATH], L.SORT, L.LEGEND, L.LAYER, L.PRELOAD
	                FROM LAYERDIR D
	                INNER JOIN LAYER L ON L.LAYERDIR_SN=D.LAYERDIR_SN AND L.ISVALID=1
	                WHERE D.[NAME]='basemap' AND L.ISVALID=1
					ORDER BY L.SORT";
                DataTable dt = sqlServer.Select(strSQL);
                string strJson = JsonConvert.SerializeObject(dt);
                return new JsonResult(strJson);
            }
            catch (Exception ex)
            {
                return new JsonResult("");
            }
        }

        /// <summary>
        /// 取得圖層資料
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetLayerJsonData")]
        public JsonResult GetLayerJsonData(string? folderRootSn = "0")
        {
            try
            {
                DataTable dtD = GetDtDirectory(folderRootSn);
                DataTable dtL = GetDtLayer(folderRootSn);

                string strJson = JsonConvert.SerializeObject(dtD);

                try
                {
                    List<ItemFolder> list = ParseLayersDataToJson(folderRootSn, dtD, dtL);
                    strJson = JsonConvert.SerializeObject(list).Replace("classes", "class");
                }
                catch (Exception ex)
                {

                }

                return new JsonResult(strJson);
            }
            catch (Exception ex)
            {
                return new JsonResult("");
            }
        }

        private List<ItemFolder> ParseLayersDataToJson(string folderRootSn, DataTable dtD, DataTable dtL)
        {
            List<ItemFolder> list = new();
            for (int i = 0; i < dtD.Rows.Count; i++)
            {
                bool ISEXPAND = dtD.Rows[i]["ISEXPAND"].ToString() == "1";
                List<ItemLayer> listChild = GetLayers(dtL, dtD.Rows[i]["LAYERDIR_SN"].ToString());
                string PARENT_SN = dtD.Rows[i]["PARENT_SN"].ToString().Trim();
                ItemFolder f = new ItemFolder
                {
                    id = "f_" + dtD.Rows[i]["LAYERDIR_SN"].ToString().Trim(),
                    text = dtD.Rows[i]["NAME"].ToString().Trim(),
                    state = new ItemState()
                };
                f.li_attr.classes = "folder-node";
                if (listChild.Count > 0) f.children = listChild;
                list.Add(f);
            }
            return list;
        }

        private List<ItemLayer> GetLayers(DataTable dt, string dirSn)
        {
            List<ItemLayer> list = new List<ItemLayer>();
            List<int> listDel = new List<int>();
            for (int i = dt.Rows.Count - 1; i >= 0 && i < dt.Rows.Count; i--)
            {
                if (dt.Rows[i]["LAYERDIR_SN"].ToString() != dirSn) continue;
                ItemLayer item = new ItemLayer
                {
                    id = "l_" + dt.Rows[i]["LAYER_SN"].ToString(),
                    text = dt.Rows[i]["NAME"].ToString().Trim(),
                    //parent = "f_"+ dirSn
                };
                item.icon += dt.Rows[i]["ICON"].ToString().Trim();
                item.legend += dt.Rows[i]["LEGEND"].ToString().Trim();
                list.Add(item);
                listDel.Add(i);
                dt.Rows.RemoveAt(i);
            }
            list.Reverse();
            return list;
        }

        /// <summary>
        /// 取得圖層資料表
        /// </summary>
        /// <param name="PARENT_SN"></param>
        /// <returns></returns>
        private DataTable GetDtLayer(string PARENT_SN)
        {
            DataTable dt = new DataTable();
            try
            {
                List<SqlParameter> listSqlParam = new List<SqlParameter>();
                string strSQL = @"
                    WITH 
                    LAYER_TREE AS (
	                    SELECT D.PARENT_SN, D.[NAME] AS 'DIR_NAME', D.SORT AS 'DIR_SORT', L.*
	                    FROM LAYERDIR D
	                    INNER JOIN LAYER L ON L.LAYERDIR_SN=D.LAYERDIR_SN AND L.ISVALID=1
	                    --WHERE D.PARENT_SN=@PARENT_SN
						WHERE (D.PARENT_SN=@PARENT_SN AND @PARENT_SN=0) OR D.LAYERDIR_SN=@PARENT_SN
                    ),
                    TREE AS
                      (  -- 不變成員(Anchor Member)
                         SELECT *, 1 AS 'LAYER_LEVEL'
                         FROM LAYER_TREE
                         WHERE ISVALID=1 AND ((PARENT_SN=@PARENT_SN AND @PARENT_SN=0) OR LAYERDIR_SN=@PARENT_SN)
                         UNION ALL
                         -- 遞迴成員(Recursive Member)
                         SELECT L2.*, LAYER_LEVEL+1
                         FROM TREE L1, LAYER_TREE L2
                         WHERE L2.ISVALID=1 AND L1.PARENT_SN = L2.LAYERDIR_SN
                      )
                    SELECT *
                    FROM TREE
					ORDER BY DIR_SORT, SORT";
                listSqlParam.Add(new SqlParameter("@PARENT_SN", PARENT_SN));
                dt = sqlServer.Select(strSQL, listSqlParam);
            }
            catch (Exception ex)
            {

            }
            finally
            {
            }
            return dt;
        }

        /// <summary>
        /// 取得圖層目錄資料表
        /// </summary>
        /// <param name="PARENT_SN"></param>
        /// <returns></returns>
        private DataTable GetDtDirectory(string PARENT_SN)
        {
            DataTable dt = new DataTable();
            try
            {
                List<SqlParameter> listSqlParam = new List<SqlParameter>();
                string strSQL = @"
                    WITH 
                    DIR_TREE AS (
	                    SELECT *
	                    FROM LAYERDIR D
						WHERE (D.PARENT_SN=@PARENT_SN AND @PARENT_SN=0) OR D.LAYERDIR_SN=@PARENT_SN
                    ),
                    TREE AS
                      (  -- 不變成員(Anchor Member)
                         SELECT *, 1 AS 'DIR_LEVEL'
                         FROM DIR_TREE
                         WHERE ISVALID=1 AND ((PARENT_SN=@PARENT_SN AND @PARENT_SN=0) OR LAYERDIR_SN=@PARENT_SN)
                         UNION ALL
                         -- 遞迴成員(Recursive Member)
                         SELECT L2.*, DIR_LEVEL+1
                         FROM TREE L1, DIR_TREE L2
                         WHERE L2.ISVALID=1 AND L1.PARENT_SN = L2.LAYERDIR_SN
                      )
                    SELECT *
                    FROM TREE
					ORDER BY DIR_LEVEL, SORT";
                listSqlParam.Add(new SqlParameter("@PARENT_SN", PARENT_SN));
                dt = sqlServer.Select(strSQL, listSqlParam);
            }
            catch (Exception ex)
            {
            }
            finally
            {
            }
            return dt;
        }

        private class ItemFolder
        {
            public string id { get; set; }
            public string text { get; set; }
            //public string parent { get; set; }
            public string icon { get; set; } = "/images/directory.png";
            public ItemState state { get; set; }
            public List<ItemLayer> children { get; set; }
            public ItemAttribute li_attr { get; set; } = new ItemAttribute();
        }

        private class ItemLayer
        {
            public string id { get; set; }
            public string text { get; set; }
            //public string parent { get; set; }
            public bool children { get; set; } = false;
            public string icon { get; set; } = "/uploadFiles/EzLayer/icon/";
            public string legend { get; set; } = "/uploadFiles/EzLayer/legend/";
            public ItemAttribute li_attr { get; set; } = new ItemAttribute();
        }

        private class ItemState
        {
            public bool opened { get; set; }
            public bool disabled { get; set; } = false;
            public bool selected { get; set; } = false;
        }

        private class ItemAttribute
        {
            public string tooltip { get; set; } = "";
            public string classes { get; set; } = "";
        }

        /// <summary>
        /// 透過 Proxy 取得檔案資料
        /// </summary>
        /// <param name="dataUrl">檔案連結</param>
        /// <param name="ezEncoding">有的來源編碼不為utf-8，需自行定議</param>
        /// <returns></returns>
        [HttpGet("ProxyData")]
        public IActionResult ProxyData(string? dataUrl = null, string? ezEncoding = null)
        {
            if (string.IsNullOrEmpty(dataUrl)) return ShowEmpty();
            if (dataUrl.Length > 0)
            {
                dataUrl = dataUrl.Replace("[question]", "?");
                dataUrl = dataUrl.Replace("[and]", "&");
            }

            Uri? uri = null;
            try
            {
                #region 支援相對路徑
                if (dataUrl.Substring(0, 4) != "http")
                {
                    string home = string.Format(@"{0}://{1}/", Request.Scheme, Request.Host);
                    if (dataUrl.Substring(0, 2) == "./")
                    {
                        dataUrl = home + dataUrl.Substring(2, dataUrl.Length - 2);
                    }
                    if (dataUrl.Substring(0, 3) == "../")
                    {
                        var thome = home.Substring(0, home.Length - 1);
                        thome = thome.Substring(0, thome.LastIndexOf('/'));
                        dataUrl = thome + dataUrl.Substring(2, dataUrl.Length - 2);
                    }
                    else if (dataUrl.Substring(0, 1) == "/") dataUrl = home + dataUrl.Substring(1, dataUrl.Length - 1);
                    else dataUrl = home + dataUrl;
                }
                #endregion
                uri = new Uri(dataUrl);
            }
            catch (Exception ex)
            {
                ShowEmpty();
            }

            string thisPage = "http://" + uri.Host;
            for (int i = 0; i < uri.Segments.Length - 1; i++)
            {
                thisPage += uri.Segments[i];
            }

            //# 讀取資料
            System.Net.HttpWebRequest request;
            if (dataUrl.StartsWith("https", StringComparison.OrdinalIgnoreCase))
            {
                request = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(dataUrl);

                // 重點是修改這行
                System.Net.ServicePointManager.ServerCertificateValidationCallback = new System.Net.Security.RemoteCertificateValidationCallback(CheckValidationResult);
                System.Net.ServicePointManager.SecurityProtocol = (System.Net.SecurityProtocolType)3072;// SecurityProtocolType.Tls1.2;
            }
            else request = (System.Net.HttpWebRequest)System.Net.WebRequest.Create(dataUrl);

            System.Net.HttpWebResponse res;
            request.Timeout = 16000;

            try
            {
                res = (System.Net.HttpWebResponse)request.GetResponse();
                string contentType = res.ContentType.ToString();
                //# 資料類型
                switch (contentType)
                {
                    case "image/gif; charset=utf-8":
                    case "image/gif":
                    case "image/png":
                    case "image/jpeg":
                        #region 影像檔
                        Stream stm = res.GetResponseStream();
                        System.Drawing.Bitmap bmp = new System.Drawing.Bitmap(stm);
                        MemoryStream ms = new MemoryStream();
                        bmp.SetResolution(100, 100);

                        System.Drawing.Imaging.EncoderParameters eParam = new System.Drawing.Imaging.EncoderParameters();
                        eParam.Param[0] = new System.Drawing.Imaging.EncoderParameter(System.Drawing.Imaging.Encoder.Quality, (long)100);

                        System.Drawing.Imaging.ImageCodecInfo jpegCodec = System.Drawing.Imaging.ImageCodecInfo.GetImageEncoders().Where(ks => ks.MimeType == "image/png").FirstOrDefault();
                        bmp.Save(ms, jpegCodec, eParam);

                        System.Drawing.ImageConverter converter = new System.Drawing.ImageConverter();
                        return File(fileContents: converter.ConvertTo(bmp, typeof(byte[])) as byte[], contentType: contentType);
                    #endregion
                    default:
                        #region Kml、Kmz 或其他檔案格式
                        Stream stm2 = res.GetResponseStream();
                        string fileType = Path.GetExtension(dataUrl);
                        if (res.ContentType == "application/vnd.google-earth.kmz") fileType = ".kmz";
                        else if (res.ContentType == "application/vnd.google-earth.kmz .kmz") fileType = ".kmz";
                        switch (fileType)
                        {
                            default:
                                StreamReader reader1 = ezEncoding switch
                                {
                                    "big5" => new StreamReader(stm2, System.Text.Encoding.GetEncoding("big5")),
                                    _ => new StreamReader(stm2, System.Text.Encoding.GetEncoding("utf-8"))
                                };
                                string str = reader1.ReadToEnd();
                                #region 檔案長度太短就不理他了
                                if (str.Length <= 10)
                                    return new ContentResult
                                    {
                                        Content = System.Web.HttpUtility.HtmlEncode(str),
                                        StatusCode = 200
                                    };
                                #endregion

                                System.Xml.XmlDocument xdoct = new System.Xml.XmlDocument();
                                try
                                {
                                    xdoct.LoadXml(str);
                                }
                                catch (Exception ex)
                                {
                                    try
                                    {
                                        System.Xml.XmlDocument xxdoc = new();
                                        System.Xml.NameTable nt = new();
                                        System.Xml.XmlNamespaceManager nsmgr = new(nt);
                                        nsmgr.AddNamespace("xsi", "http://www.google.com/kml/ext/2.2");
                                        nsmgr.AddNamespace("gx", "http://www.google.com/kml/ext/2.2");
                                        nsmgr.AddNamespace("kml", "http://www.opengis.net/kml/2.2");
                                        nsmgr.AddNamespace("atom", "http://www.w3.org/2005/Atom");
                                        System.Xml.XmlParserContext context = new(null, nsmgr, null, System.Xml.XmlSpace.None);
                                        System.Xml.XmlReaderSettings xset = new();
                                        xset.ConformanceLevel = System.Xml.ConformanceLevel.Fragment;
                                        System.Xml.XmlReader rd = System.Xml.XmlReader.Create(new StringReader(str), xset, context);
                                        xdoct.Load(rd);
                                    }
                                    catch (Exception ex2)
                                    {
                                        return ShowEmpty();
                                    }
                                }

                                System.Xml.XmlDocument xDoc = new();
                                string result = str;
                                System.Xml.XmlNamespaceManager xmlnsManager = new(xDoc.NameTable);

                                try
                                {
                                    result = result.Replace("http://earth.google.com/kml/2.1", "http://www.opengis.net/kml/2.2");
                                    result = result.Replace("http://earth.google.com/kml/2.0", "http://www.opengis.net/kml/2.2");
                                    result = result.Trim();
                                    if (result.ToLower().IndexOf("<!doctype") >= 0) return ShowEmpty();
                                    // 拿掉 xsi:schemaLocation tag
                                    int trimTagIndex = result.ToLower().IndexOf("<document");
                                    if (trimTagIndex >= 1)
                                    {
                                        int trimTagIndexNext = result.IndexOf(">", trimTagIndex);
                                        result = result.Substring(0, trimTagIndex + "<Document".Length) + result.Substring(trimTagIndexNext, result.Length - trimTagIndexNext);
                                    }
                                    xDoc.LoadXml(result);
                                    xmlnsManager.AddNamespace("kml", "http://www.opengis.net/kml/2.2");

                                    System.Xml.XmlNodeList xStyle = xDoc.SelectNodes("//kml:Document/kml:Style", xmlnsManager);
                                    System.Xml.XmlNodeList xStyle_href = xDoc.SelectNodes("//kml:Document/kml:Style/kml:IconStyle/kml:Icon/kml:href", xmlnsManager);
                                    // 如果 style的 href 是相對網址，設定一下網址
                                    for (int i = 0; i < xStyle_href.Count; i++)
                                    {
                                        try
                                        {
                                            string href = xStyle_href[i].ChildNodes[0].InnerText;

                                            href = href.Trim('\r', '\n');
                                            href = href.TrimEnd('\r', '\n');
                                            href = href.Trim();
                                            if (href.Substring(0, 4).ToLower() != "http") xStyle_href[i].ChildNodes[0].InnerText = thisPage + href;
                                        }
                                        catch (Exception ex3)
                                        {
                                            continue;
                                        }
                                    }

                                    result = xDoc.OuterXml;
                                    return new ContentResult
                                    {
                                        Content = result,
                                        ContentType = res.ContentType,
                                        StatusCode = 200
                                    };
                                }
                                catch (Exception ex2)
                                {
                                    return new ContentResult
                                    {
                                        Content = System.Web.HttpUtility.HtmlEncode(result),
                                        StatusCode = 200
                                    };
                                }
                            case ".kmz":
                                return ShowEmpty();
                        }
                        #endregion
                }
            }
            catch (Exception ex)
            {
                return new ContentResult
                {
                    Content = "@GISMM_EASYMAP_KML_PROXY_TIMEOUT (" + System.Web.HttpUtility.HtmlEncode(ex.ToString()) + ")",
                    StatusCode = 200
                };
            }
        }

        /// <summary>
        /// 展示空白頁面
        /// </summary>
        /// <returns></returns>
        private ContentResult ShowEmpty()
        {
            return new ContentResult
            {
                Content = "",
                StatusCode = 200
            };
        }

        /// <summary>
        /// for https
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="certificate"></param>
        /// <param name="chain"></param>
        /// <param name="errors"></param>
        /// <returns></returns>
        private static bool CheckValidationResult(object sender, System.Security.Cryptography.X509Certificates.X509Certificate certificate, System.Security.Cryptography.X509Certificates.X509Chain chain, System.Net.Security.SslPolicyErrors errors)
        {
            return true; // 總是接受
        }
    }
}
