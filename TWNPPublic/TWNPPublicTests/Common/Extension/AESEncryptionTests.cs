using Microsoft.VisualStudio.TestTools.UnitTesting;
using TWNPPublic.Common.Extension;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TWNPPublic.Common.Extension.Tests
{
    [TestClass()]
    public class AESEncryptionTests
    {
        [TestMethod()]
        public void AesEncryptExtenedTest()
        {
            Assert.AreEqual("eyLqTs+fUE+9amdgMP7n3Q==", "加密測試".AesEncryptExtened());
        }

        [TestMethod()]
        public void AesDecryptExtenedTest()
        {
            Assert.AreEqual("加密測試", "eyLqTs+fUE+9amdgMP7n3Q==".AesDecryptExtened());
        }

        [TestMethod("加解密測試")]
        public void AesEnDeExtendTest()
        {
            string TestString = "加密測試";
            string EncryptText = TestString.AesEncryptExtened();
            string DecryptText = EncryptText.AesDecryptExtened();
            Assert.AreEqual(DecryptText, TestString);
        }
    }
}