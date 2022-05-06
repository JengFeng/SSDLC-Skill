using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Forms;
using System.Diagnostics;
using System.Configuration;

namespace WRBSyncWork
{
    static class Program
    {
        /// <summary>
        /// 應用程式的主要進入點。
        /// </summary>
        [STAThread]
        static void Main()
        {
            //應用程式是否已執行
            if (Process.GetProcessesByName(Application.ProductName).Length <= 1)
            {
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new Form1());
            }
            else
            {
                int intVersion;
                if (int.TryParse(ConfigurationManager.AppSettings["Version"].Trim(), out intVersion))
                {
                    if(intVersion==1)
                        MessageBox.Show("應用程式已執行!!", "錯誤警告", MessageBoxButtons.OK, MessageBoxIcon.Warning, MessageBoxDefaultButton.Button1, MessageBoxOptions.DefaultDesktopOnly);
                }

                Environment.Exit(0);
            }

            //Application.EnableVisualStyles();
            //Application.SetCompatibleTextRenderingDefault(false);
            //Application.Run(new Form1());
        }


    }
}
