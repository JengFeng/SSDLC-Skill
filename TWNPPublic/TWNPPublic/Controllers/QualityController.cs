using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using NPOI.SS.UserModel;
using NPOI.SS.Util;
using NPOI.XSSF.UserModel;
using TWNPPublic.Common.Attributes;
using TWNPPublic.Common.Extension;
using TWNPPublic.Domain.Service;
using TWNPPublic.Models.Entity;
using TWNPPublic.Models.SqlFunctions;

namespace TWNPPublic.Controllers
{
    public class QualityController : BasicController
    {
        private readonly IAspNetUser aspNetUser;
        private readonly IQualityService qualityService;

        public QualityController(IAspNetUser aspNetUser, IQualityService qualityService)
        {
            this.qualityService = qualityService;
            this.aspNetUser = aspNetUser;
        }

        //看起來沒查權限相關的東西隨便寫吧
        //這個沒用到
        [NonAction]
        [Menu("水質查詢")]
        public IActionResult WaterQuality()
        {
            return View();
        }

        /// <summary>
        /// 用水指針查詢頁面，call 下面那個Ajax 叫圖表
        /// </summary>
        /// <returns></returns>
        [Menu("用水指針查詢")]
        public IActionResult UseWaterQuery()
        {
            //又要改....
            return View();
        }

        /// <summary>
        /// 唯一的圖表查資料
        /// </summary>
        /// <returns></returns>
        [HttpPost]
        public IActionResult UseWaterChart(DateTime? StartTime, DateTime? EndTime)
        {
            #region 摺疊

            //if (StartTimeZone.HasValue)
            //{
            //    if (StartTime.HasValue)
            //    {
            //        StartTime = StartTime.Value.AddHours(StartTimeZone.Value.Hour).AddMinutes(StartTimeZone.Value.Minute);
            //    }
            //    else
            //    {
            //        return Json(Failed(message: "需要指定日期"));
            //    }
            //}

            //if (EndTimeZone.HasValue)
            //{
            //    if (EndTime.HasValue)
            //    {
            //        EndTime = EndTime.Value.AddHours(EndTimeZone.Value.Hour).AddMinutes(EndTimeZone.Value.Minute);
            //    }
            //    else
            //    {
            //        return Json(Failed(message: "需要指定日期"));
            //    }
            //}

            #endregion

            var result = qualityService.GetWaterUseChart(StartTime, EndTime);

            List<JObject> Pindatas = new List<JObject>();
            List<JObject> Amountdatas = new List<JObject>();

            if (result.PinChartData.Count() == 0 && result.AmountChartData.Count() == 0)
                return Json(Failed(new
                {
                    alert = "此時間段尚無資料"
                }, "此時間段尚無資料")); ;

            foreach (var item in result.PinChartData)
            {
                Pindatas.Add(new JObject {
                                 new JProperty("value", new Object[] { item.X, item.Y})
                            });
            }

            foreach (var item in result.PinChartData)
            {
                Amountdatas.Add(new JObject {
                                     new JProperty("value", new Object[] {item.X, item.Y * 5})
                                });
            }


            JObject option = new JObject()
            {
                new JProperty("Pindatas", Pindatas),
                new JProperty("Amountdatas", Amountdatas)
            };
            return Json(Success<string>(JsonConvert.SerializeObject(option)));
        }

        /// <summary>
        /// 用水量查詢(meun)
        /// </summary>
        /// <returns></returns>
        [Menu("用水量查詢")]
        public IActionResult UseWaterQueryNew()
        {
            return View();
        }

        /// <summary>
        /// 用水指針查詢(meun)
        /// </summary>
        /// <returns></returns>
        [Menu("用水指針查詢")]
        public IActionResult UseWaterQueryPin()
        {
            // 產生 00 ~ 24 的時段清單
            List<string> hourList = Enumerable.Range(0, 25)
                                              .Select(h => h.ToString("D2")) // 格式化為 00, 01, 02, ..., 24
                                              .ToList();

            ViewBag.HourList = hourList; // 傳遞到 View

            return View();
        }

        [HttpPost]
        public async Task<IActionResult> QueryWaterTypeData(DateTime StartDate, DateTime EndDate)
        {
            try
            {
                var result = qualityService.QueryWaterTypeData(StartDate, EndDate, aspNetUser.CurrentWaterNo);

                return Json(Success(result));
            }
            catch (Exception ex)
            {
                return Json(Success());
            }
        }


        [HttpPost]
        public async Task<IActionResult> CheckOptCondition( DateTime dateTime)
        {
            try
            {

                DateTime currentDate = DateTime.Now;
                TimeSpan timeDifference = currentDate - dateTime;

                if (timeDifference.Days > 7)
                {
                    var result = qualityService.CheckOptCondition(dateTime, aspNetUser.CurrentWaterNo);

                    if (result == null)
                    {
                        var dayresultTask = qualityService.UpdateSQLite(dateTime, aspNetUser.CurrentWaterNo);
                        return Json(Success("操作成功，正在執行資料回寫中....."));
                    }
                    else if (result != null && result.STATUS2 == 10)
                    {
                        var dayresultTask = qualityService.UpdateSQLite(dateTime, aspNetUser.CurrentWaterNo);
                        return Json(Success("操作成功，正在執行資料回寫中....."));
                    }
                    else if (result != null && result.STATUS2 != 10 && result.STATUS2 == 1)
                    {
                        return Json(Failed("請稍後再試，已有其他資料正在回寫中......"));
                    }
                    else if (result != null && result.STATUS2 != 10 && (result.STATUS2 >= 2 && result.STATUS2 <= 9))
                    {
                        return Json(Failed("執行錯誤出現問題......"));
                    }
                    else
                    {
                        return Json(Failed("執行錯誤出現'其他問題'......"));
                    }

                }
                else
                {
                    //var waterNo = aspNetUser.CurrentWaterNo; //"7D760253004"; //aspNetUser.CurrentWaterNo;
                    //dateTime = DateTime.Parse("2025-07-01"); //測試用
                    var dayresultTask = await qualityService.LitedPhMeterRecordApiList(aspNetUser.CurrentWaterNo, dateTime);
                    List<A_PH_METER_RECORD_LIST> aphmeterrecord = new List<A_PH_METER_RECORD_LIST>();

                    if (dayresultTask == null || !dayresultTask.Any())
                    {
                        return Json(Failed("無資料可更新"));
                    }

                    // 排序確保資料依時間順序
                    var sortedData = dayresultTask?
                        .OrderBy(d => DateTime.Parse($"{d.date} {d.time}"))
                        .ToList();

                    for (int i = 0; i < sortedData.Count; i++)
                    {
                        var d = sortedData[i];

                        // 將 date + time 轉換成 DateTime
                        DateTime recDateTime = DateTime.Parse($"{d.date} {d.time}");

                        aphmeterrecord.Add(new A_PH_METER_RECORD_LIST
                        {
                            WATER_NO = aspNetUser.CurrentWaterNo,                 
                            PROPERTY_NO = d.meter_no,            
                            REC_DATE_TIME = recDateTime,         
                            AMOUNT = (decimal)d.total_flow,      
                        });
                    }

                    var result = qualityService.UpdateAphMeterRecordByWaterNoAndDateTime(aspNetUser.CurrentWaterNo, aphmeterrecord);
                    var res = result > 0 ? true : false;
                    if (res)return Json(Success("更新成功"));
                    else return Json(Failed("更新失敗"));
                }
            }
            catch (Exception ex)
            {
                return Json(Failed("系統錯誤"));
            }
        }

        /// <summary>
        /// 匯出EXCEL
        /// </summary>
        /// <param name="ResultData"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult ExporttoExcelTable(string ResultData, List<string> HoursList)
        {
            try
            {
                List<UseWaterQueryPinExportTable> resultItems = JsonConvert.DeserializeObject<List<UseWaterQueryPinExportTable>>(ResultData);

                //建立Excel
                XSSFWorkbook xssfworkbook = new XSSFWorkbook(); //建立活頁簿

                ISheet sheet = xssfworkbook.CreateSheet("sheet"); //建立sheet

                #region 設定樣式
                #region 標題樣式
                ICellStyle headerStyle = xssfworkbook.CreateCellStyle();
                headerStyle.Alignment = HorizontalAlignment.Center; //水平置中
                headerStyle.VerticalAlignment = VerticalAlignment.Center; //垂直置中
                // 設定換行
                //headerStyle.WrapText = true;
                IFont headerfont = xssfworkbook.CreateFont();
                headerfont.FontName = "微軟正黑體";
                headerfont.FontHeightInPoints = 14;
                headerfont.Boldweight = (short)FontBoldWeight.Bold;
                //字體顏色
                //headerfont.Color = NPOI.HSSF.Util.HSSFColor.Blue.Index;
                headerStyle.SetFont(headerfont);
                //框線
                headerStyle.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
                headerStyle.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;
                headerStyle.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
                headerStyle.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;
                #endregion


                #region 資料樣式1
                ICellStyle DataStyle1 = xssfworkbook.CreateCellStyle();
                IFont Datafont = xssfworkbook.CreateFont();
                DataStyle1.Alignment = HorizontalAlignment.Center; //水平置中
                DataStyle1.VerticalAlignment = VerticalAlignment.Center; //垂直置中
                Datafont.FontName = "微軟正黑體";
                Datafont.FontHeightInPoints = 11;
                //Datafont.Boldweight = (short)FontBoldWeight.Bold;
                DataStyle1.SetFont(Datafont);
                //框線
                DataStyle1.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle1.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle1.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle1.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;
                #endregion


                #region 資料樣式2
                ICellStyle DataStyle2 = xssfworkbook.CreateCellStyle();
                IFont Datafont2 = xssfworkbook.CreateFont();
                DataStyle2.Alignment = HorizontalAlignment.Right; //水平置右
                DataStyle2.VerticalAlignment = VerticalAlignment.Center; //垂直置中
                Datafont2.FontName = "微軟正黑體";
                Datafont2.FontHeightInPoints = 11;
                //Datafont2.Boldweight = (short)FontBoldWeight.Bold;
                DataStyle2.SetFont(Datafont2);
                //框線
                DataStyle2.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle2.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle2.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle2.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;
                #endregion

                #region 資料樣式3(日期格式)
                ICellStyle DataStyle3 = xssfworkbook.CreateCellStyle();
                IFont Datafont3 = xssfworkbook.CreateFont();
                DataStyle3.Alignment = HorizontalAlignment.Right; //水平置右
                DataStyle3.VerticalAlignment = VerticalAlignment.Center; //垂直置中
                Datafont3.FontName = "微軟正黑體";
                Datafont3.FontHeightInPoints = 11;
                //Datafont2.Boldweight = (short)FontBoldWeight.Bold;
                DataStyle3.SetFont(Datafont2);
                //框線
                DataStyle3.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle3.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle3.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle3.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;

                var newDataFormat = xssfworkbook.CreateDataFormat();
                DataStyle3.DataFormat = newDataFormat.GetFormat("yyyy/MM/dd HH:mm:ss");
                #endregion
                #endregion

                int ColumnIndex = 0;
                List<string> listHeader = new List<string> { "估算量(度)", "較前一日增減"};
                listHeader.AddRange(HoursList);// 使用 AddRange 根據 HoursList 來增加項目
                List<int> listColumnWidth = new List<int> { 25, 25, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20 };

                int RowIndex = 0;//列號
                #region Title列
                ColumnIndex = 0;
                sheet.CreateRow(RowIndex); //需先用CreateRow建立
                //建立列並且設定列高
                sheet.CreateRow(RowIndex).Height = (short)30 * 20;//基本要乘20
                sheet.AddMergedRegion(new CellRangeAddress(0, 0, 0, 27)); //合併儲存格 A1 到 AB1 合併
                SetValue(sheet, RowIndex, ColumnIndex, "用水指針比較 數據查詢結果", headerStyle);//給予儲存格內容及套用樣式
                //補邊框樣式
                //SetValue(sheet, RowIndex, 8, "", headerStyle);//給予儲存格內容及套用樣式
                // 補齊合併儲存格的邊框樣式
                int firstRow = 0;
                int lastRow = 0;
                int firstCol = 0;
                int lastCol = 27;

                for (int i = firstRow; i <= lastRow; i++)
                {
                    IRow row = sheet.GetRow(i) ?? sheet.CreateRow(i);
                    for (int j = firstCol; j <= lastCol; j++)
                    {
                        ICell cell = row.GetCell(j) ?? row.CreateCell(j);
                        cell.CellStyle = headerStyle;
                    }
                }


                RowIndex = 1;//列號
                ColumnIndex = 0;
                sheet.CreateRow(RowIndex); //需先用CreateRow建立
                //建立列並且設定列高
                sheet.CreateRow(RowIndex).Height = (short)30 * 20;//基本要乘20
                sheet.AddMergedRegion(new CellRangeAddress(1, 2, 0, 0));  // A2 到 A3 合併
                SetValue(sheet, RowIndex, ColumnIndex, "日期", headerStyle);//給予儲存格內容及套用樣式
                
                ColumnIndex = 1;
                //建立列並且設定列高
                sheet.AddMergedRegion(new CellRangeAddress(1, 1, 1, 2));  // B2 到 C2 合併
                SetValue(sheet, RowIndex, ColumnIndex, "00:00~24:00 用水量", headerStyle);//給予儲存格內容及套用樣式

                ColumnIndex = 3;
                //建立列並且設定列高
                sheet.AddMergedRegion(new CellRangeAddress(1, 1, 3, 27));  // D2 到 AB2 合併
                SetValue(sheet, RowIndex, ColumnIndex, "回傳指針數", headerStyle);//給予儲存格內容及套用樣式
                //補邊框樣式
                SetValue(sheet, RowIndex, 27, "", headerStyle);//給予儲存格內容及套用樣式(AB2)

                RowIndex++;
                #endregion

                #region Header列
                sheet.CreateRow(RowIndex); //需先用CreateRow建立列
                for (int i = 0; i < listHeader.Count; i++)
                {
                    SetValue(sheet, RowIndex, i+1, listHeader[i]+"時", headerStyle);//給予儲存格內容及套用樣式
                    sheet.SetColumnWidth(i, (int)(listColumnWidth[i] + 0.72) * 256);  //寬度調整(實際欄寬要加上0.72常數)
                }
                RowIndex++;
                #endregion

                #region 資料列

                for (int i = 0; i < resultItems.Count; i++)//每一筆資料
                {
                    sheet.CreateRow(RowIndex); //需先用CreateRow建立列
                    ColumnIndex = 0;
                    var resultItem = resultItems[i];
                    string formattedDate = "-";
                    // 將字串型別的 _date 轉換為 DateTime 型別
                    DateTime parsedDate;
                    if (DateTime.TryParse(resultItem._date, out parsedDate))
                    {
                        // 格式化 _date 為 年/月/日 格式
                        formattedDate = parsedDate.ToString("yyyy/MM/dd");
                    }
                    //日期
                    SetValue(sheet, RowIndex, ColumnIndex, formattedDate, DataStyle1);//給予儲存格內容及套用樣式
                    ColumnIndex++;
                    //估算量(度)
                    decimal roundedEstimate = Math.Round(resultItem._estimate, 0);  // 四捨五入到 0 位小數
                    string estimate = roundedEstimate.ToString().Trim();  
                    SetValue(sheet, RowIndex, ColumnIndex, estimate, DataStyle1);//給予儲存格內容及套用樣式
                    ColumnIndex++;
                    //較前一日增減
                    string difference = resultItem._difference.ToString().Trim();
                    SetValue(sheet, RowIndex, ColumnIndex, difference, DataStyle1);//給予儲存格內容及套用樣式
                    ColumnIndex++;

                    // 使用 for 迴圈遍歷 resultItem._data
                    for (int j = 0; j < resultItem._data.Count; j++)
                    {
                        var dataItem = resultItem._data[j];
                        decimal roundedAmount = Math.Round(dataItem._amount,0);
                        string amount = roundedAmount.ToString().Trim();
                        SetValue(sheet, RowIndex, ColumnIndex, amount, DataStyle1);//給予儲存格內容及套用樣式
                        ColumnIndex++;
                    }
                    RowIndex++;
                }
                #endregion

                //隨機命名TempData名稱
                string handle = Guid.NewGuid().ToString();

                MemoryStream memoryStream = new MemoryStream();
                memoryStream.Position = 0;
                xssfworkbook.Write(memoryStream);
                //TempData[handle] = memoryStream.ToArray();
                //必須將MemoryStream轉成Base64字串存到TempData，這個Action才能運作
                TempData[handle] = Convert.ToBase64String(memoryStream.ToArray());

                //將結果、TempData名稱、檔名回傳到前端
                string strJSON = "{\"Result\":\"OK\",\"Message\":\"OK\",\"FileGuid\":\"" + handle + "\",\"FileName\":\"用水指針比較 數據查詢結果" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xlsx\"}";
                //return new JsonResult(strJSON);

                return Content(strJSON, "application/json");


            }
            catch (Exception ex)
            {
                string strJSON = "[{\"Result\":\"NG\",\"Message\":\"" + ex.Message +(ex.InnerException!=null?ex.InnerException.Message:"")+ ex.StackTrace + "\",\"FileGuid\":\"\",\"FileName\":\"TestReportOutput.xlsx\"}]";
                //return new JsonResult(strJSON);

                return Content(strJSON, "application/json");
            }

        }

        /// <summary>
        /// 匯出EXCEL
        /// </summary>
        /// <param name="ResultData"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult ExporttoExcelChart(string ResultData)
        {
            try
            {
                // 先將 JSON 反序列化成包含 result 的物件
                var response = JsonConvert.DeserializeObject<UseWaterQueryPinExportChart>(ResultData);

                //建立Excel
                XSSFWorkbook xssfworkbook = new XSSFWorkbook(); //建立活頁簿

                ISheet sheet = xssfworkbook.CreateSheet("sheet"); //建立sheet

                #region 設定樣式
                #region 標題樣式
                ICellStyle headerStyle = xssfworkbook.CreateCellStyle();
                headerStyle.Alignment = HorizontalAlignment.Center; //水平置中
                headerStyle.VerticalAlignment = VerticalAlignment.Center; //垂直置中
                // 設定換行
                //headerStyle.WrapText = true;
                IFont headerfont = xssfworkbook.CreateFont();
                headerfont.FontName = "微軟正黑體";
                headerfont.FontHeightInPoints = 14;
                headerfont.Boldweight = (short)FontBoldWeight.Bold;
                //字體顏色
                //headerfont.Color = NPOI.HSSF.Util.HSSFColor.Blue.Index;
                headerStyle.SetFont(headerfont);
                //框線
                headerStyle.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
                headerStyle.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;
                headerStyle.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
                headerStyle.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;
                #endregion


                #region 資料樣式1
                ICellStyle DataStyle1 = xssfworkbook.CreateCellStyle();
                IFont Datafont = xssfworkbook.CreateFont();
                DataStyle1.Alignment = HorizontalAlignment.Center; //水平置中
                DataStyle1.VerticalAlignment = VerticalAlignment.Center; //垂直置中
                Datafont.FontName = "微軟正黑體";
                Datafont.FontHeightInPoints = 11;
                //Datafont.Boldweight = (short)FontBoldWeight.Bold;
                DataStyle1.SetFont(Datafont);
                //框線
                DataStyle1.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle1.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle1.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle1.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;
                #endregion


                #region 資料樣式2
                ICellStyle DataStyle2 = xssfworkbook.CreateCellStyle();
                IFont Datafont2 = xssfworkbook.CreateFont();
                DataStyle2.Alignment = HorizontalAlignment.Right; //水平置右
                DataStyle2.VerticalAlignment = VerticalAlignment.Center; //垂直置中
                Datafont2.FontName = "微軟正黑體";
                Datafont2.FontHeightInPoints = 11;
                //Datafont2.Boldweight = (short)FontBoldWeight.Bold;
                DataStyle2.SetFont(Datafont2);
                //框線
                DataStyle2.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle2.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle2.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle2.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;
                #endregion

                #region 資料樣式3(日期格式)
                ICellStyle DataStyle3 = xssfworkbook.CreateCellStyle();
                IFont Datafont3 = xssfworkbook.CreateFont();
                DataStyle3.Alignment = HorizontalAlignment.Right; //水平置右
                DataStyle3.VerticalAlignment = VerticalAlignment.Center; //垂直置中
                Datafont3.FontName = "微軟正黑體";
                Datafont3.FontHeightInPoints = 11;
                //Datafont2.Boldweight = (short)FontBoldWeight.Bold;
                DataStyle3.SetFont(Datafont2);
                //框線
                DataStyle3.BorderTop = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle3.BorderBottom = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle3.BorderLeft = NPOI.SS.UserModel.BorderStyle.Thin;
                DataStyle3.BorderRight = NPOI.SS.UserModel.BorderStyle.Thin;

                var newDataFormat = xssfworkbook.CreateDataFormat();
                DataStyle3.DataFormat = newDataFormat.GetFormat("yyyy/MM/dd HH:mm:ss");
                #endregion
                #endregion

                int ColumnIndex = 0;
                List<string> listHeader = new List<string> { "序號", "時間(小時)", "水表指針"};
                List<int> listColumnWidth = new List<int> { 10, 25, 25 };

                int RowIndex = 0;//列號
                #region Title列
                ColumnIndex = 0;
                sheet.CreateRow(RowIndex); //需先用CreateRow建立
                //建立列並且設定列高
                sheet.CreateRow(RowIndex).Height = (short)30 * 20;//基本要乘20
                sheet.AddMergedRegion(new CellRangeAddress(0, 0, 0, listHeader.Count - 1)); //合併儲存格
                SetValue(sheet, RowIndex, ColumnIndex, "水表指針圖表 數據查詢結果", headerStyle);//給予儲存格內容及套用樣式
                //補邊框樣式
                SetValue(sheet, RowIndex, listHeader.Count - 1, "", headerStyle);//給予儲存格內容及套用樣式

                RowIndex++;
                #endregion

                #region Header列
                sheet.CreateRow(RowIndex); //需先用CreateRow建立列
                for (int i = 0; i < listHeader.Count; i++)
                {
                    SetValue(sheet, RowIndex, i, listHeader[i], headerStyle);//給予儲存格內容及套用樣式
                    sheet.SetColumnWidth(i, (int)(listColumnWidth[i] + 0.72) * 256);  //寬度調整(實際欄寬要加上0.72常數)
                }
                RowIndex++;
                #endregion

                // 取出 result 陣列
                List<F_B_CHART1> resultItems = response.result;

                #region 資料列
                int Index = 1;
                for (int i = 0; i < resultItems.Count; i++)//每一筆資料
                {
                    string x = resultItems[i].X.ToString("yyyy/MM/dd HH:mm").Trim();  //時間(小時)
                    string y = Math.Round(resultItems[i].Y,0).ToString().Trim();//用水指針
  
                    sheet.CreateRow(RowIndex); //需先用CreateRow建立列
                    ColumnIndex = 0;
                    //序號
                    SetValue(sheet, RowIndex, ColumnIndex, Index, DataStyle1);//給予儲存格內容及套用樣式
                    ColumnIndex++;
                    //時間(小時)
                    SetValue(sheet, RowIndex, ColumnIndex, x.Trim(), DataStyle1);
                    ColumnIndex++;
                    //用水指針
                    SetValue(sheet, RowIndex, ColumnIndex, y.Trim(), DataStyle1);
                    ColumnIndex++;

                    Index++;
                    RowIndex++;

                }
                #endregion


                //隨機命名TempData名稱
                string handle = Guid.NewGuid().ToString();

                MemoryStream memoryStream = new MemoryStream();
                memoryStream.Position = 0;
                xssfworkbook.Write(memoryStream);
                //TempData[handle] = memoryStream.ToArray();
                //必須將MemoryStream轉成Base64字串存到TempData，這個Action才能運作
                TempData[handle] = Convert.ToBase64String(memoryStream.ToArray());

                //將結果、TempData名稱、檔名回傳到前端
                string strJSON = "{\"Result\":\"OK\",\"Message\":\"OK\",\"FileGuid\":\"" + handle + "\",\"FileName\":\"水表指針圖表 數據查詢結果" + DateTime.Now.ToString("yyyyMMddHHmmss") + ".xlsx\"}";
                //return new JsonResult(strJSON);

                return Content(strJSON, "application/json");


            }
            catch (Exception ex)
            {
                string strJSON = "[{\"Result\":\"NG\",\"Message\":\"" + ex.Message + ex.StackTrace + "\",\"FileGuid\":\"\",\"FileName\":\"TestReportOutput.xlsx\"}]";
                //return new JsonResult(strJSON);

                return Content(strJSON, "application/json");
            }

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="sheet">Excel</param>
        /// <param name="ExcelRowIndex">列號</param>
        /// <param name="ExcelColIndex">行(欄)號</param>
        /// <param name="Value">內容</param>
        /// <param name="CellStyle">樣式</param>
        /// <param name="CellType">指定儲存格資料型態(預設會自動判斷)</param>
        private static void SetValue(ISheet sheet, int ExcelRowIndex, int ExcelColIndex, object Value, ICellStyle CellStyle, string CellType = "")
        {
            if (CellType.Trim() != "")
            {
                switch (CellType.Trim().ToUpper())
                {
                    case "STRING":
                        sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue(Value == null ? "" : Value.ToString().Trim());
                        break;
                    case "DOUBLE":
                        sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((double)Value);
                        break;
                    case "FLOAT":
                        sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((float)Value);
                        break;
                    case "INT":
                        sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((int)Value);
                        break;
                    case "BOOL":
                        sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((bool)Value);
                        break;
                    case "DATETIME":
                        sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((DateTime)Value);
                        break;
                    case "DATE":
                        sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((DateTime)Value);
                        break;
                    default:
                        sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue(Value == null ? "" : Value.ToString().Trim());
                        break;
                }
            }
            else
            {
                if (Value.GetType() == typeof(string))
                    sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue(Value == null ? "" : Value.ToString().Trim());
                else if (Value.GetType() == typeof(double))
                    sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((double)Value);
                else if (Value.GetType() == typeof(float))
                    sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((float)Value);
                else if (Value.GetType() == typeof(int))
                    sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((int)Value);
                else if (Value.GetType() == typeof(bool))
                    sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((bool)Value);
                else if (Value.GetType() == typeof(DateTime))
                    sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue((DateTime)Value);
                else
                    sheet.GetRow(ExcelRowIndex).CreateCell(ExcelColIndex).SetCellValue(Value == null ? "" : Value.ToString().Trim());
            }
            sheet.GetRow(ExcelRowIndex).GetCell(ExcelColIndex).CellStyle = CellStyle;

        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="sheetRow">Excel IRow</param>
        /// <param name="ExcelRowIndex">列號</param>
        /// <param name="ExcelColIndex">行(欄)號</param>
        /// <param name="Formula">函式</param>
        /// <param name="CellStyle">樣式</param>
        /// <param name="CellType">指定儲存格資料型態(預設會自動判斷)</param>
        private static void SetFormula(IRow sheetRow, int ExcelRowIndex, int ExcelColIndex, string Formula, ICellStyle CellStyle, string CellType = "")
        {
            NPOI.SS.UserModel.ICell formulaCell = sheetRow.CreateCell(ExcelColIndex);
            formulaCell.SetCellFormula(Formula); // 設定公式
            sheetRow.GetCell(ExcelColIndex).CellStyle = CellStyle;

        }


        //Controller 處理檔案下載的操作:
        [HttpGet]
        public virtual ActionResult Download(string FileGuid, string FileName)
        {
            try
            {
                if (TempData[FileGuid] != null)
                {
                    //將Base64字串轉回MemoryStream的byte[]
                    string Base64String = TempData[FileGuid].ToString().Trim();
                    byte[] data = Convert.FromBase64String(Base64String);
                    return File(data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", FileName);

                }
                else
                {
                    return new EmptyResult();
                }
            }
            catch (Exception ex)
            {
                return new EmptyResult();
            }
        }

    }

}
