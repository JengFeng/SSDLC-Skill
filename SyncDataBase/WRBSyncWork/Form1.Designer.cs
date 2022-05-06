namespace WRBSyncWork
{
    partial class Form1
    {
        /// <summary>
        /// 設計工具所需的變數。
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// 清除任何使用中的資源。
        /// </summary>
        /// <param name="disposing">如果應該處置 Managed 資源則為 true，否則為 false。</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form 設計工具產生的程式碼

        /// <summary>
        /// 此為設計工具支援所需的方法 - 請勿使用程式碼編輯器
        /// 修改這個方法的內容。
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
            this.btnStartSync = new System.Windows.Forms.Button();
            this.ReadFileTimer = new System.Windows.Forms.Timer(this.components);
            this.btnStopSync = new System.Windows.Forms.Button();
            this.statusStrip1 = new System.Windows.Forms.StatusStrip();
            this.AllCountStatus = new System.Windows.Forms.ToolStripProgressBar();
            this.labTime = new System.Windows.Forms.ToolStripStatusLabel();
            this.menuStrip1 = new System.Windows.Forms.MenuStrip();
            this.功能ToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.btnClose = new System.Windows.Forms.ToolStripMenuItem();
            this.notifyIcon1 = new System.Windows.Forms.NotifyIcon(this.components);
            this.contextMenuStrip1 = new System.Windows.Forms.ContextMenuStrip(this.components);
            this.toolStripTextBox1 = new System.Windows.Forms.ToolStripTextBox();
            this.toolStripTextBox2 = new System.Windows.Forms.ToolStripTextBox();
            this.toolStripTextBox5 = new System.Windows.Forms.ToolStripTextBox();
            this.toolStripTextBox3 = new System.Windows.Forms.ToolStripTextBox();
            this.toolStripTextBox4 = new System.Windows.Forms.ToolStripTextBox();
            this.splitContainer1 = new System.Windows.Forms.SplitContainer();
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.labAllDayLog = new System.Windows.Forms.Label();
            this.label7 = new System.Windows.Forms.Label();
            this.labSaveLog = new System.Windows.Forms.Label();
            this.labPath = new System.Windows.Forms.Label();
            this.labReadFileCycle = new System.Windows.Forms.Label();
            this.labAutoRun = new System.Windows.Forms.Label();
            this.labDB = new System.Windows.Forms.Label();
            this.IsRun = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.lab01 = new System.Windows.Forms.Label();
            this.label6 = new System.Windows.Forms.Label();
            this.label4 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.label1 = new System.Windows.Forms.Label();
            this.lab = new System.Windows.Forms.Label();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.imageList1 = new System.Windows.Forms.ImageList(this.components);
            this.Eye_timer = new System.Windows.Forms.Timer(this.components);
            this.statusStrip1.SuspendLayout();
            this.menuStrip1.SuspendLayout();
            this.contextMenuStrip1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).BeginInit();
            this.splitContainer1.Panel1.SuspendLayout();
            this.splitContainer1.Panel2.SuspendLayout();
            this.splitContainer1.SuspendLayout();
            this.groupBox1.SuspendLayout();
            this.groupBox2.SuspendLayout();
            this.SuspendLayout();
            // 
            // btnStartSync
            // 
            this.btnStartSync.Location = new System.Drawing.Point(12, 36);
            this.btnStartSync.Name = "btnStartSync";
            this.btnStartSync.Size = new System.Drawing.Size(107, 23);
            this.btnStartSync.TabIndex = 0;
            this.btnStartSync.Text = "開始自動同步";
            this.btnStartSync.UseVisualStyleBackColor = true;
            this.btnStartSync.Click += new System.EventHandler(this.btnStartSync_Click);
            // 
            // ReadFileTimer
            // 
            this.ReadFileTimer.Interval = 3000;
            this.ReadFileTimer.Tick += new System.EventHandler(this.ReadFileTimer_Tick);
            // 
            // btnStopSync
            // 
            this.btnStopSync.Location = new System.Drawing.Point(144, 36);
            this.btnStopSync.Name = "btnStopSync";
            this.btnStopSync.Size = new System.Drawing.Size(107, 23);
            this.btnStopSync.TabIndex = 1;
            this.btnStopSync.Text = "停止自動同步";
            this.btnStopSync.UseVisualStyleBackColor = true;
            this.btnStopSync.Click += new System.EventHandler(this.btnStopSync_Click);
            // 
            // statusStrip1
            // 
            this.statusStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.AllCountStatus,
            this.labTime});
            this.statusStrip1.Location = new System.Drawing.Point(0, 359);
            this.statusStrip1.Name = "statusStrip1";
            this.statusStrip1.Size = new System.Drawing.Size(421, 22);
            this.statusStrip1.TabIndex = 3;
            this.statusStrip1.Text = "statusStrip1";
            // 
            // AllCountStatus
            // 
            this.AllCountStatus.Maximum = 10;
            this.AllCountStatus.Name = "AllCountStatus";
            this.AllCountStatus.Size = new System.Drawing.Size(100, 16);
            // 
            // labTime
            // 
            this.labTime.Name = "labTime";
            this.labTime.Size = new System.Drawing.Size(0, 17);
            // 
            // menuStrip1
            // 
            this.menuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.功能ToolStripMenuItem});
            this.menuStrip1.Location = new System.Drawing.Point(0, 0);
            this.menuStrip1.Name = "menuStrip1";
            this.menuStrip1.Size = new System.Drawing.Size(421, 24);
            this.menuStrip1.TabIndex = 4;
            this.menuStrip1.Text = "menuStrip1";
            // 
            // 功能ToolStripMenuItem
            // 
            this.功能ToolStripMenuItem.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.btnClose});
            this.功能ToolStripMenuItem.Name = "功能ToolStripMenuItem";
            this.功能ToolStripMenuItem.Size = new System.Drawing.Size(44, 20);
            this.功能ToolStripMenuItem.Text = "功能";
            // 
            // btnClose
            // 
            this.btnClose.Name = "btnClose";
            this.btnClose.Size = new System.Drawing.Size(124, 22);
            this.btnClose.Text = "關閉程式";
            this.btnClose.Click += new System.EventHandler(this.btnClose_Click);
            // 
            // notifyIcon1
            // 
            this.notifyIcon1.BalloonTipIcon = System.Windows.Forms.ToolTipIcon.Info;
            this.notifyIcon1.ContextMenuStrip = this.contextMenuStrip1;
            this.notifyIcon1.Icon = ((System.Drawing.Icon)(resources.GetObject("notifyIcon1.Icon")));
            this.notifyIcon1.Text = "WRB DB同步";
            this.notifyIcon1.MouseDoubleClick += new System.Windows.Forms.MouseEventHandler(this.notifyIcon1_MouseDoubleClick);
            this.notifyIcon1.MouseMove += new System.Windows.Forms.MouseEventHandler(this.notifyIcon1_MouseMove);
            // 
            // contextMenuStrip1
            // 
            this.contextMenuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolStripTextBox1,
            this.toolStripTextBox2,
            this.toolStripTextBox5,
            this.toolStripTextBox3,
            this.toolStripTextBox4});
            this.contextMenuStrip1.Name = "contextMenuStrip1";
            this.contextMenuStrip1.Size = new System.Drawing.Size(161, 129);
            // 
            // toolStripTextBox1
            // 
            this.toolStripTextBox1.Name = "toolStripTextBox1";
            this.toolStripTextBox1.Size = new System.Drawing.Size(100, 23);
            this.toolStripTextBox1.Text = "啟動同步";
            this.toolStripTextBox1.Click += new System.EventHandler(this.toolStripTextBox1_Click);
            // 
            // toolStripTextBox2
            // 
            this.toolStripTextBox2.Name = "toolStripTextBox2";
            this.toolStripTextBox2.Size = new System.Drawing.Size(100, 23);
            this.toolStripTextBox2.Text = "停止同步";
            this.toolStripTextBox2.Click += new System.EventHandler(this.toolStripTextBox2_Click);
            // 
            // toolStripTextBox5
            // 
            this.toolStripTextBox5.Name = "toolStripTextBox5";
            this.toolStripTextBox5.Size = new System.Drawing.Size(100, 23);
            this.toolStripTextBox5.Text = "縮小視窗";
            this.toolStripTextBox5.Click += new System.EventHandler(this.toolStripTextBox5_Click);
            // 
            // toolStripTextBox3
            // 
            this.toolStripTextBox3.Name = "toolStripTextBox3";
            this.toolStripTextBox3.Size = new System.Drawing.Size(100, 23);
            this.toolStripTextBox3.Text = "還原視窗";
            this.toolStripTextBox3.Click += new System.EventHandler(this.toolStripTextBox3_Click);
            // 
            // toolStripTextBox4
            // 
            this.toolStripTextBox4.Name = "toolStripTextBox4";
            this.toolStripTextBox4.Size = new System.Drawing.Size(100, 23);
            this.toolStripTextBox4.Text = "關閉程式";
            this.toolStripTextBox4.Click += new System.EventHandler(this.toolStripTextBox4_Click);
            // 
            // splitContainer1
            // 
            this.splitContainer1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.splitContainer1.Location = new System.Drawing.Point(0, 24);
            this.splitContainer1.Name = "splitContainer1";
            this.splitContainer1.Orientation = System.Windows.Forms.Orientation.Horizontal;
            // 
            // splitContainer1.Panel1
            // 
            this.splitContainer1.Panel1.Controls.Add(this.groupBox1);
            // 
            // splitContainer1.Panel2
            // 
            this.splitContainer1.Panel2.Controls.Add(this.groupBox2);
            this.splitContainer1.Size = new System.Drawing.Size(421, 335);
            this.splitContainer1.SplitterDistance = 214;
            this.splitContainer1.TabIndex = 5;
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.labAllDayLog);
            this.groupBox1.Controls.Add(this.label7);
            this.groupBox1.Controls.Add(this.labSaveLog);
            this.groupBox1.Controls.Add(this.labPath);
            this.groupBox1.Controls.Add(this.labReadFileCycle);
            this.groupBox1.Controls.Add(this.labAutoRun);
            this.groupBox1.Controls.Add(this.labDB);
            this.groupBox1.Controls.Add(this.IsRun);
            this.groupBox1.Controls.Add(this.label2);
            this.groupBox1.Controls.Add(this.lab01);
            this.groupBox1.Controls.Add(this.label6);
            this.groupBox1.Controls.Add(this.label4);
            this.groupBox1.Controls.Add(this.label3);
            this.groupBox1.Controls.Add(this.label1);
            this.groupBox1.Controls.Add(this.lab);
            this.groupBox1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.groupBox1.Location = new System.Drawing.Point(0, 0);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(421, 214);
            this.groupBox1.TabIndex = 2;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "狀態列表";
            // 
            // labAllDayLog
            // 
            this.labAllDayLog.AutoSize = true;
            this.labAllDayLog.Location = new System.Drawing.Point(147, 118);
            this.labAllDayLog.Name = "labAllDayLog";
            this.labAllDayLog.Size = new System.Drawing.Size(17, 12);
            this.labAllDayLog.TabIndex = 5;
            this.labAllDayLog.Text = "無";
            // 
            // label7
            // 
            this.label7.AutoSize = true;
            this.label7.Location = new System.Drawing.Point(57, 118);
            this.label7.Name = "label7";
            this.label7.Size = new System.Drawing.Size(84, 12);
            this.label7.TabIndex = 4;
            this.label7.Text = "每日Log保留：";
            // 
            // labSaveLog
            // 
            this.labSaveLog.AutoSize = true;
            this.labSaveLog.Location = new System.Drawing.Point(147, 139);
            this.labSaveLog.Name = "labSaveLog";
            this.labSaveLog.Size = new System.Drawing.Size(17, 12);
            this.labSaveLog.TabIndex = 3;
            this.labSaveLog.Text = "無";
            // 
            // labPath
            // 
            this.labPath.AutoSize = true;
            this.labPath.Location = new System.Drawing.Point(147, 160);
            this.labPath.Name = "labPath";
            this.labPath.Size = new System.Drawing.Size(17, 12);
            this.labPath.TabIndex = 3;
            this.labPath.Text = "無";
            // 
            // labReadFileCycle
            // 
            this.labReadFileCycle.AutoSize = true;
            this.labReadFileCycle.Location = new System.Drawing.Point(147, 95);
            this.labReadFileCycle.Name = "labReadFileCycle";
            this.labReadFileCycle.Size = new System.Drawing.Size(17, 12);
            this.labReadFileCycle.TabIndex = 3;
            this.labReadFileCycle.Text = "無";
            // 
            // labAutoRun
            // 
            this.labAutoRun.AutoSize = true;
            this.labAutoRun.Location = new System.Drawing.Point(147, 73);
            this.labAutoRun.Name = "labAutoRun";
            this.labAutoRun.Size = new System.Drawing.Size(17, 12);
            this.labAutoRun.TabIndex = 3;
            this.labAutoRun.Text = "無";
            // 
            // labDB
            // 
            this.labDB.AutoSize = true;
            this.labDB.Location = new System.Drawing.Point(147, 52);
            this.labDB.Name = "labDB";
            this.labDB.Size = new System.Drawing.Size(17, 12);
            this.labDB.TabIndex = 2;
            this.labDB.Text = "無";
            // 
            // IsRun
            // 
            this.IsRun.AutoSize = true;
            this.IsRun.Location = new System.Drawing.Point(147, 30);
            this.IsRun.Name = "IsRun";
            this.IsRun.Size = new System.Drawing.Size(17, 12);
            this.IsRun.TabIndex = 1;
            this.IsRun.Text = "無";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(9, 139);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(132, 12);
            this.label2.TabIndex = 0;
            this.label2.Text = "儲存再同步失敗Log檔：";
            // 
            // lab01
            // 
            this.lab01.AutoSize = true;
            this.lab01.Location = new System.Drawing.Point(76, 160);
            this.lab01.Name = "lab01";
            this.lab01.Size = new System.Drawing.Size(65, 12);
            this.lab01.TabIndex = 0;
            this.lab01.Text = "同步路徑：";
            // 
            // label6
            // 
            this.label6.AutoSize = true;
            this.label6.Location = new System.Drawing.Point(76, 95);
            this.label6.Name = "label6";
            this.label6.Size = new System.Drawing.Size(65, 12);
            this.label6.TabIndex = 0;
            this.label6.Text = "循環周期：";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Location = new System.Drawing.Point(64, 73);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(77, 12);
            this.label4.TabIndex = 0;
            this.label4.Text = "啟動即同步：";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(64, 73);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(77, 12);
            this.label3.TabIndex = 0;
            this.label3.Text = "啟動即同步：";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(84, 52);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(57, 12);
            this.label1.TabIndex = 0;
            this.label1.Text = "執行DB：";
            // 
            // lab
            // 
            this.lab.AutoSize = true;
            this.lab.Location = new System.Drawing.Point(76, 30);
            this.lab.Name = "lab";
            this.lab.Size = new System.Drawing.Size(65, 12);
            this.lab.TabIndex = 0;
            this.lab.Text = "同步狀態：";
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.btnStartSync);
            this.groupBox2.Controls.Add(this.btnStopSync);
            this.groupBox2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.groupBox2.Location = new System.Drawing.Point(0, 0);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(421, 117);
            this.groupBox2.TabIndex = 0;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "執行功能";
            // 
            // imageList1
            // 
            this.imageList1.ImageStream = ((System.Windows.Forms.ImageListStreamer)(resources.GetObject("imageList1.ImageStream")));
            this.imageList1.TransparentColor = System.Drawing.Color.Transparent;
            this.imageList1.Images.SetKeyName(0, "eye.png");
            this.imageList1.Images.SetKeyName(1, "eye2.png");
            this.imageList1.Images.SetKeyName(2, "eye3.png");
            this.imageList1.Images.SetKeyName(3, "eye4.png");
            // 
            // Eye_timer
            // 
            this.Eye_timer.Tick += new System.EventHandler(this.Eye_timer_Tick);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(421, 381);
            this.ContextMenuStrip = this.contextMenuStrip1;
            this.Controls.Add(this.splitContainer1);
            this.Controls.Add(this.statusStrip1);
            this.Controls.Add(this.menuStrip1);
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MainMenuStrip = this.menuStrip1;
            this.Name = "Form1";
            this.Text = "WRB自動同步";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Form1_FormClosing);
            this.Load += new System.EventHandler(this.Form1_Load);
            this.Resize += new System.EventHandler(this.Form1_Resize);
            this.statusStrip1.ResumeLayout(false);
            this.statusStrip1.PerformLayout();
            this.menuStrip1.ResumeLayout(false);
            this.menuStrip1.PerformLayout();
            this.contextMenuStrip1.ResumeLayout(false);
            this.contextMenuStrip1.PerformLayout();
            this.splitContainer1.Panel1.ResumeLayout(false);
            this.splitContainer1.Panel2.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.splitContainer1)).EndInit();
            this.splitContainer1.ResumeLayout(false);
            this.groupBox1.ResumeLayout(false);
            this.groupBox1.PerformLayout();
            this.groupBox2.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button btnStartSync;
        private System.Windows.Forms.Timer ReadFileTimer;
        private System.Windows.Forms.Button btnStopSync;
        private System.Windows.Forms.StatusStrip statusStrip1;
        private System.Windows.Forms.ToolStripProgressBar AllCountStatus;
        private System.Windows.Forms.MenuStrip menuStrip1;
        private System.Windows.Forms.ToolStripMenuItem 功能ToolStripMenuItem;
        private System.Windows.Forms.ToolStripMenuItem btnClose;
        private System.Windows.Forms.NotifyIcon notifyIcon1;
        private System.Windows.Forms.SplitContainer splitContainer1;
        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.Label IsRun;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label lab;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.Label labDB;
        private System.Windows.Forms.Label labAutoRun;
        private System.Windows.Forms.Label labPath;
        private System.Windows.Forms.Label lab01;
        private System.Windows.Forms.Label labSaveLog;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.ImageList imageList1;
        private System.Windows.Forms.Timer Eye_timer;
        private System.Windows.Forms.Label labReadFileCycle;
        private System.Windows.Forms.Label label6;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.ContextMenuStrip contextMenuStrip1;
        private System.Windows.Forms.ToolStripTextBox toolStripTextBox1;
        private System.Windows.Forms.ToolStripTextBox toolStripTextBox2;
        private System.Windows.Forms.ToolStripTextBox toolStripTextBox3;
        private System.Windows.Forms.ToolStripTextBox toolStripTextBox4;
        private System.Windows.Forms.ToolStripTextBox toolStripTextBox5;
        private System.Windows.Forms.ToolStripStatusLabel labTime;
        private System.Windows.Forms.Label labAllDayLog;
        private System.Windows.Forms.Label label7;
    }
}

