using Microsoft.AspNetCore.Mvc;
using TWNPPublic.ViewModels;

namespace TWNPPublic.Controllers
{
    public class ContextController : Controller
    {
        /// <summary>
        /// 回應成功(有物件)
        /// </summary>
        /// <typeparam name="T">型態</typeparam>
        /// <param name="data">回傳結果</param>
        /// <param name="message">提示</param>
        /// <returns></returns>
        [NonAction]
        public MessageAPI<T> Success<T>(T data, string message = "操作成功")
        {
            return new MessageAPI<T>()
            {
                Success = true,
                Message = message,
                Data = data,
            };
        }

        /// <summary>
        /// 回應成功(無物件)
        /// </summary>
        /// <param name="message">提示</param>
        /// <returns></returns>
        [NonAction]
        public MessageAPI Success(string message = "操作成功")
        {
            return new MessageAPI()
            {
                Success = true,
                Message = message,
            };
        }

        /// <summary>
        /// 回應失敗(自訂狀態碼)
        /// </summary>
        /// <param name="message">提示</param>
        /// <returns></returns>
        [NonAction]
        public MessageAPI<T> Failed<T>(T data, string message = "操作失敗", int Status = 200)
        {
            return new MessageAPI<T>()
            {
                Status = Status,
                Success = false,
                Message = message,
                Data = data
            };
        }

        /// <summary>
        /// 回應失敗(無物件)
        /// </summary>
        /// <param name="message">提示</param>
        /// <returns></returns>
        [NonAction]
        public MessageAPI<T> Failed<T>(T data, string message = "操作失敗")
        {
            return new MessageAPI<T>()
            {
                Success = false,
                Message = message,
                Data = data
            };
        }

        [NonAction]
        public MessageAPI Failed(string message = "操作失敗")
        {
            return new MessageAPI()
            {
                Success = false,
                Message = message,
            };
        }

        [NonAction]
        public MessageValidFailed ValidationFailed(Dictionary<string, string[]> ModelStateErrors, string message = "欄位錯誤")
        {
            return new MessageValidFailed()
            {
                Success = false,
                Message = message,
                ModelStateErrors = ModelStateErrors,
            };
        }
    }
}
