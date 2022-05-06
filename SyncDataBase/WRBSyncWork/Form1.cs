using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using System.Configuration;
using System.IO;
using WRBSyncWork.WRBWebService;
using System.Data.SqlClient;
using System.Diagnostics;



namespace WRBSyncWork
{
    public partial class Form1 : Form
    {

        public Form1()
        {
            InitializeComponent();
        }
        //static List<string> listSQL;
        static int DBConncetTimeOut = 0;
        string strSQLPath = "C:\\web\\WRBWebService\\SyncDataBase\\SQL";//預設路徑
        string strConncetString;
        bool SaveLog = false;
        int ImageIndex = 0;
        int intKeepDays = 7;
        List<Image> listImg = new List<Image>();
        List<Icon> listIcon = new List<Icon>();
        List<int> listIndex = new List<int>();
        static int intVersion = 1;//※是否為本身單一運轉版本，1本身單一運轉版本，2是由WebService呼叫開啟之合作版本※
        private void Form1_Load(object sender, EventArgs e)
        {
            try
            {
                #region 是否為本身單一運轉版本，1本身單一運轉版本，2是由WebService呼叫開啟之合作版本
                int intVersion_;
                if (int.TryParse(ConfigurationManager.AppSettings["Version"].Trim(), out intVersion_))
                {
                    intVersion = intVersion_;
                }
                #endregion
                #region 設定執行周期
                int intCycle = 60000;
                if (ConfigurationManager.AppSettings["ReadFileCycle"].Trim() != "")
                {
                    int ReadFileCycle;
                    if (int.TryParse(ConfigurationManager.AppSettings["ReadFileCycle"].Trim(), out ReadFileCycle))
                        intCycle = ReadFileCycle;
                }
                ReadFileTimer.Interval = intCycle;
                labReadFileCycle.Text = intCycle + "毫秒";
                #endregion
                #region 設定SQL TimeOut
                if (ConfigurationManager.AppSettings["DBConnectTimeOut"].Trim() != "")//取得有無設定TimeOut
                {
                    int TimeOut;
                    if (int.TryParse(ConfigurationManager.AppSettings["DBConnectTimeOut"].Trim(), out TimeOut))
                        DBConncetTimeOut = TimeOut;
                }
                #endregion
                #region 取得連線字串
                strConncetString = ConfigurationManager.ConnectionStrings["ConnectionString"].ConnectionString;//取得連線字串
                
                //if (DBConncetTimeOut > 0) sqlconnection.ConnectionString += string.Format(";Connection Timeout={0}", DBConncetTimeOut);

                labDB.Text = strConncetString.Substring(strConncetString.IndexOf("=") + 1, strConncetString.IndexOf(";") - strConncetString.IndexOf("=") - 1);
                #endregion
                #region 取得SQL資料夾路徑
                string strSQLPath_ = ConfigurationManager.AppSettings["AuotStartSyncPath"].ToString().Trim();//設定的路徑
                if (strSQLPath_ != "")//有設定路徑時
                    strSQLPath = strSQLPath_;
                labPath.Text = strSQLPath;
                #endregion
                #region 是否程式一啟動即執行自動同步
                if (intVersion == 1)//本身單一運轉版本
                {
                    //是否程式一啟動即執行自動同步
                    if (Convert.ToBoolean(ConfigurationManager.AppSettings["AuotStartSync"]))
                    {
                        ReadFileTimer.Enabled = true;
                        ReadFileTimer.Start();
                        IsRun.Text = "執行中";//同步狀態
                        labAutoRun.Text = "是";
                    }
                    else
                    {
                        IsRun.Text = "停止中";//同步狀態
                        labAutoRun.Text = "否";
                    }
                }
                else//由WebService呼叫開啟之合作版本
                {
                    ReadFileTimer.Enabled = true;
                    ReadFileTimer.Start();
                    IsRun.Text = "執行中";//同步狀態
                    labAutoRun.Text = "是";
                }

                #endregion
                #region 是否儲存再執行失敗log檔
                 if (ConfigurationManager.AppSettings["SaveLog"].Trim() != "")
                {
                    bool saveFlag;
                    if (bool.TryParse(ConfigurationManager.AppSettings["SaveLog"],out saveFlag))
                        SaveLog = saveFlag;
                }

                labSaveLog.Text = SaveLog ? "保留" : "不保留";
                #endregion
                #region AllDay Log保留天數
                
                if (ConfigurationManager.AppSettings["AllDayLogKeepDay"].Trim() != "")
                {
                    int Days;
                    if (int.TryParse(ConfigurationManager.AppSettings["AllDayLogKeepDay"].Trim(), out Days))
                        intKeepDays = Days;
                }
                labAllDayLog.Text = intKeepDays + "天";
                #endregion
                #region 眨眼圖
                string strPath = Application.StartupPath;
                Icon icon1 = new System.Drawing.Icon(strPath+"\\eye.ico");
                Icon icon2 = new System.Drawing.Icon(strPath+"\\eye2.ico");
                Icon icon3 = new System.Drawing.Icon(strPath+"\\eye3.ico");
                Icon icon4 = new System.Drawing.Icon(strPath+"\\eye4.ico");
                listIcon.Add(icon1);
                listIcon.Add(icon2);
                listIcon.Add(icon3);
                listIcon.Add(icon4);
                listIndex.Add(0); listIndex.Add(0); listIndex.Add(0); listIndex.Add(0);
                listIndex.Add(0); listIndex.Add(0); listIndex.Add(0); listIndex.Add(0);
                listIndex.Add(1); listIndex.Add(2); listIndex.Add(3); listIndex.Add(2); listIndex.Add(1);
                listIndex.Add(1); listIndex.Add(2); listIndex.Add(3); listIndex.Add(2); listIndex.Add(1);
                listIndex.Add(0); listIndex.Add(0); listIndex.Add(0); listIndex.Add(0);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[1]);
                //listImg.Add(imageList1.Images[2]);
                //listImg.Add(imageList1.Images[3]);
                //listImg.Add(imageList1.Images[2]);
                //listImg.Add(imageList1.Images[1]);
                //listImg.Add(imageList1.Images[2]);
                //listImg.Add(imageList1.Images[3]);
                //listImg.Add(imageList1.Images[2]);
                //listImg.Add(imageList1.Images[1]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                //listImg.Add(imageList1.Images[0]);
                #endregion
            }
            catch(Exception ex)
            {
                throw ex;
            }
        }

        private void btnStartSync_Click(object sender, EventArgs e)//啟動按鈕
        {
            ReadFileTimer.Enabled = true;
            ReadFileTimer.Start();
            DoWork();
            IsRun.Text = "執行中";//同步狀態
        }

        private void btnStopSync_Click(object sender, EventArgs e)//停止按鈕
        {
            ReadFileTimer.Stop();
            ReadFileTimer.Enabled = false;
            IsRun.Text = "停止中";//同步狀態
        }

        bool Runing = false;
        private void ReadFileTimer_Tick(object sender, EventArgs e)//定時讀取SQL檔
        {
            DoWork();
        }

        private void DoWork()//執行工作
        {
            try
            {
                if (Runing) return;
                Runing = true;
                #region AllDay Log保留天數
                //DirectoryInfo InfoDirectory = new DirectoryInfo(strSQLPath).GetFiles("Remoting*.SQL");;//取得SQL資料夾的路徑
                FileInfo[] AllDayFiles = new DirectoryInfo(strSQLPath).GetFiles("AllDayLog*.txt"); ;//取得SQL資料夾的路徑
                foreach (FileInfo F in AllDayFiles)
                {
                    string Temp = F.Name.Substring(F.Name.IndexOf("_") + 1, 8);
                    string Date = Temp.Substring(0, 4) + "/" + Temp.Substring(4, 2) + "/" + Temp.Substring(6, 2);
                    DateTime Date2 = Convert.ToDateTime(Date);
                    if (Date2.AddDays(intKeepDays) < DateTime.Now)
                        File.Delete(F.FullName);//刪除該檔
                }

                #endregion

                #region 讀取所有SQL檔案

                int ExecuteCntFlag = 100;//限制單次執行數量
                if (ConfigurationManager.AppSettings["ReadFileCycle"].Trim() != "")//檢查是否有設定限制數量
                {
                    int cnt;
                    if (Int32.TryParse(ConfigurationManager.AppSettings["ReadFileCycle"].Trim(), out cnt))
                        ExecuteCntFlag = cnt;
                }

                int ExecuteCnt = 0;//記錄執行數量
                DirectoryInfo InfoDirectory = new DirectoryInfo(strSQLPath);//取得SQL資料夾的路徑
                foreach (DirectoryInfo infoYMD in InfoDirectory.GetDirectories())//裡面所有的資料夾(日期資料夾)(年-月-日)
                {
                    DirectoryInfo[] directoryInfo = infoYMD.GetDirectories();
                    if (directoryInfo.Length < 1)//裡面沒資料夾時
                        infoYMD.Delete();//刪除年月日資料夾
                    else//有資料夾時
                    {
                        foreach (DirectoryInfo infoHour in directoryInfo)//裡面所有的資料夾(小時)
                        {
                            FileInfo[] Files = infoHour.GetFiles("Remoting*.SQL");//取出SQL檔案

                            if (Files.Length < 1)//沒有SQL檔案時
                            {
                                FileInfo[] Files_Log = infoHour.GetFiles("*.log");///取出Log檔案
                                if (Files_Log.Length < 1)//也沒有Log檔時
                                    infoHour.Delete();//刪除該資料夾
                            }
                            else//有SQL檔案時
                            {
                                foreach (FileInfo F in Files)
                                {
                                    if (ExecuteCnt > ExecuteCntFlag) goto End;//超過限制數量時 跳到最後
                                    ExecuteCnt++;//記錄執行數量
                                    AllCountStatus.Value = 0;//總狀態
                                    //if (F.FullName.IndexOf(".bak") > 0) continue;//是bak檔的跳過
                                    string strSQL = File.ReadAllText(F.FullName);
                                    string ErrorMessage;
                                    if (SQLExecute(strSQL, out ErrorMessage))//執行SQL 若失敗會回傳Error Message
                                    {
                                        File.Delete(F.FullName);//刪除該檔
                                    }
                                    else
                                    {
                                        if (SaveLog)//設定要儲存log時
                                        {
                                            string contents = string.Format(@"SQL:[{0}] 錯誤訊息:[{1}] 執行時間:[{2}]",
                                                                              strSQL, ErrorMessage, DateTime.Now.ToString());
                                            File.WriteAllText(F.FullName + ".log", contents);//儲存.log檔
                                        }
                                    }
                                    AllCountStatus.Value = 10;//總狀態
                                }
                            }

                        }
                    }
                }
            End:
                Runing = false;//跑完
                AllCountStatus.Value = 0;

                if (intVersion == 2)//由WebService呼叫開啟之合作版本
                {
                    ReadFileTimer.Stop();//停止同步
                    ReadFileTimer.Enabled = false;
                    Real = true;
                    this.Close();//關閉程式
                }
                #endregion

            }
            catch (Exception ex)
            {
                ReadFileTimer.Stop();
                ReadFileTimer.Enabled = false;
                Eye_timer.Stop();
                Eye_timer.Enabled = false;
                IsRun.Text = "停止中";//同步狀態
                MessageBox.Show(ex.Message + ex.StackTrace);
            }
        }

        /// <summary>
        /// 執行SQL
        /// </summary>
        /// <param name="strSQL"></param>
        /// <param name="ErrorMessage"></param>
        /// <returns></returns>
        private bool SQLExecute(string strSQL, out string ErrorMessage)//執行SQL
        {
            try
            {
                ErrorMessage = "";
                SqlConnection sqlconnection = new SqlConnection();
                sqlconnection.ConnectionString = strConncetString;
                
                sqlconnection.Open();

                int ReturnValue = 0;
                SqlCommand sqlCommand = new SqlCommand();
                sqlCommand.CommandType = CommandType.Text;
                sqlCommand.CommandText = strSQL;
                sqlCommand.Connection = sqlconnection;
                ReturnValue = sqlCommand.ExecuteNonQuery();

                sqlconnection.Close();
            }
            catch (Exception e)
            {
                ErrorMessage = e.Message;
                return false;
            }
            return true;

        }

        private void btnClose_Click(object sender, EventArgs e)//關閉程式
        {
            Real = true;
            this.Close();//關閉
        }

        private void Form1_Resize(object sender, EventArgs e)//縮放時
        {
            if (this.WindowState == FormWindowState.Minimized)//縮小時
            {
                this.notifyIcon1.Visible = true;//顯示Icon
                this.Hide();//隱藏Form
                if (ReadFileTimer.Enabled)//有執行時 眨眼
                {
                    Eye_timer.Enabled = true;//開始眨眼
                    Eye_timer.Start();//開始眨眼
                }
            }
            else//放大時
            {
                this.notifyIcon1.Visible = false;//隱藏Icon
                Eye_timer.Stop();//停止眨眼
                Eye_timer.Enabled = false;//停止眨眼
            }
        }

        private void notifyIcon1_MouseDoubleClick(object sender, MouseEventArgs e)//點兩下Icon時
        {
            this.Show();//顯示Form
            this.WindowState = FormWindowState.Normal;//回到正常大小
            this.Activate();//焦點
            this.Focus();//焦點
        }

        private void notifyIcon1_MouseMove(object sender, MouseEventArgs e)
        {

        }

        bool Real = false;//是否真的關閉程式
        private void Form1_FormClosing(object sender, FormClosingEventArgs e)//關閉Form時
        {
            if (!Real)
            {
                MessageBox.Show("程式縮到工具列通知區域");
                e.Cancel = true;//不關閉
                this.WindowState = FormWindowState.Minimized;//縮到最小
                
            }
        }

        private void Eye_timer_Tick(object sender, EventArgs e)//眨眼動作
        {
            //Image img = this.imageList1.Images[ImageIndex];
            //Bitmap b = new Bitmap(img);
            //Icon icon = Icon.FromHandle(b.GetHicon());
            //this.notifyIcon1.Icon = icon;
            
            //notifyIcon1.Icon = Icon.FromHandle(((Bitmap)listImg[ImageIndex]).GetHicon());
            //ImageIndex++;
            //if (ImageIndex >= listImg.Count) ImageIndex = 0;

            this.notifyIcon1.Icon = listIcon[listIndex[ImageIndex]];
            ImageIndex++;
            if (ImageIndex >= listIndex.Count) ImageIndex = 0;
        }

        private void toolStripTextBox1_Click(object sender, EventArgs e)//執行同步
        {
            ReadFileTimer.Enabled = true;
            ReadFileTimer.Start();
            IsRun.Text = "執行中";//同步狀態

            Eye_timer.Enabled = true;//開始眨眼
            Eye_timer.Start();//開始眨眼
        }

        private void toolStripTextBox2_Click(object sender, EventArgs e)//停只同步
        {
            ReadFileTimer.Stop();
            ReadFileTimer.Enabled = false;
            IsRun.Text = "停止中";//同步狀態

            Eye_timer.Stop();//停止眨眼
            Eye_timer.Enabled = false;//停止眨眼
        }

        private void toolStripTextBox5_Click(object sender, EventArgs e)//縮小視窗
        {
            this.WindowState = FormWindowState.Minimized;//縮到最小
        }

        private void toolStripTextBox3_Click(object sender, EventArgs e)//還原視窗
        {
            this.Show();//顯示Form
            this.WindowState = FormWindowState.Normal;//回到正常大小
            this.Activate();//焦點
            this.Focus();//焦點
        }

        private void toolStripTextBox4_Click(object sender, EventArgs e)//關閉程式
        {
            Real = true;
            this.Close();//關閉
        }
















        private void DoListSQL()
        {
            //if (listSQL.Count < 1) return;


            //#region 執行SQL
            //string ErrorMessage = "";
            //if (SQLExecute(listSQL[0], out ErrorMessage))
            //{
            //    listSQL.RemoveAt(0);
            //}
            //else
            //{
            //    //把檔案移到最後一筆
            //    listSQL.Add(listSQL[0]);
            //    listSQL.RemoveAt(0);
            //}
            //#endregion

            //DoListSQL();
        }
    }
}
