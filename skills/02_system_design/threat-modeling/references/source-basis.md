# 威脅建模方法來源與採用原則

整理日期：2026-10-10

本 Skill 以使用者指定的 OWASP Foundation 官方社群頁面 [Threat Modeling Process (Historical)](https://community.owasp.org/Threat_Modeling_Process#data-flow-diagrams) 作為流程主線；其他來源補充新手引導、DFD／信任邊界、風險排序及 AI 協作實務。本文為方法摘要與改寫，不複製來源文章內容。OWASP 頁面可讀，標題標示 Historical；引用時不宣稱該頁是 OWASP 現行唯一或最新標準。可取得性依整理日期記錄；被網站封鎖或只回傳頁面外框的來源，不作為具體方法主張的證據。

## 來源整理

| 來源 | 可讀狀態 | 本 Skill 採用的重點 |
|:--|:--|:--|
| **主要依據：[OWASP Foundation 官方社群頁面：Threat Modeling Process (Historical)](https://community.owasp.org/Threat_Modeling_Process#data-flow-diagrams)** | 可讀，HTTP 200；頁面標題標示為 Historical。 | 四步流程：Scope your work、Determine Threats、Determine Countermeasures and Mitigation、Assess your work。範圍可整理外部依賴、入口／出口、資產、信任等級、使用者故事，並用 DFD 說明系統中的資料路徑；DFD 可先建高階範圍，再逐層細化子系統。威脅辨識以攻擊者角度檢視資料來源、處理程序、資料流及使用者互動，STRIDE 是常用分類方式，也可用濫用／誤用案例補足。對策階段將威脅連到緩解措施，排序可參考攻擊可能性、損害、修復複雜度或成本及業務影響；這些是常見考量，不是固定公式。評估時確認已留下 DFD、威脅清單與控制清單等工作紀錄。OWASP 頁面屬歷史社群文件，不代表 OWASP 當前唯一或最新標準。 |
| [SSD 資安新手村：透過威脅建模盤點組織風險](https://ssd.ocf.tw/guide/assessment.html) | 可讀。 | 先釐清關鍵流程與資產，再剖析行為者與威脅、評估排序、形成文件與後續行動；讓熟悉流程的組織成員參與；優先收斂少數高優先風險，依組織和資料情境調整假設。 |
| [SSDLC by 飛飛：STRIDE、DFD 與信任邊界指南](https://ssdlc.feifei.tw/stride-threat-modeling-data-flow-diagram-trust-boundary-guide/) | 可讀。 | 以 STRIDE 對照攻擊情境與安全屬性；以 DFD 元件承載分析；在資料跨越權限／信任邊界時檢查認證、授權、完整性及資訊暴露。其訂餐案例只作教學例，不直接套用成所有系統的威脅。 |
| [Everpure：How We Built the Threat Model Mentor GPT](https://blog.everpuredata.com/zh-hant/purely-technical/how-we-built-the-threat-model-mentor-gpt-democratizing-cybersecurity-expertise/?print=print) | 原始 URL 曾回 403；不帶 `?print=print` 的同篇頁可讀。 | 文章描述以 AI 降低威脅建模門檻、整合安全知識並貼合 DevSecOps 的產品經驗。Skill 因此採新手引導、結構化產出和早期整合的設計方向；不把該文章視為獨立風險標準，也不要求使用其 GPT。 |
| [FIND 資策會連結](https://www.find.org.tw/wind/browse/47a2653acdf825dab0c40b1b7026a7b3) | HTTP 200，但回應只有 FIND 網站導覽與頁尾，未取到文章正文或標題。 | 沒有從此頁採用任何具體方法結論；需由使用者提供正文／截圖或可讀的新網址後才能補充。 |
| [Cloudflare：What is threat modeling?](https://www.cloudflare.com/zh-tw/learning/security/glossary/what-is-threat-modeling/) | 回應 403 存取封鎖頁。 | 未引用具體內容，避免將未讀頁面內容當作依據。 |
| [Jeremy Blog：威脅建模 Threat Modeling](https://blog.sunqsec.com/blog/threatmodel) | 可讀。 | DFD 可分層呈現：先建系統全貌，再按需要深入高敏感子系統；繪圖同時可從資產與攻擊者路徑思考；完成模型後仍須找出、處理並驗證問題。 |

## 合併後的做法

1. 以 OWASP 四步驟維持分析閉環，不把「畫圖」當作威脅模型的全部。
2. 以 DFD 表達元件、資料流與信任邊界，並以入口、出口、外部依賴、資產和權限補足攻擊面。
3. 以 STRIDE 提醒分析者逐類思考，再依業務情境補充其他濫用風險。
4. 按可能性、影響及組織脈絡排序；分清暫定估算與正式風險接受決策。
5. 將每項高優先威脅連到控制、負責人及驗證證據，並在架構或控制改變時更新模型。
6. 讓系統熟悉者參與情境描述；AI 協助整理和追問，不替組織核定風險。

## 使用邊界

- STRIDE、Mermaid 範例或 AI 產出的威脅清單均不能證明模型完整或系統安全。
- 風險評分尺度須採用專案／組織既有政策；缺少政策時，結果只能標示為暫定排序。
- 程式碼行號、設定與執行行為應分別標記其證據來源和驗證狀態。
- 來源頁面內容可能更新；需要正式合規結論時，應確認適用政策、版本與原文。

## 2026-10-13 補強設計依據

保留原本以 OWASP Historical 頁面為主線的選擇。以下補充流程維護與方法選擇，未取代既有專案規章。

- [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)：持續維護、雲端責任邊界、依情境選擇方法，以及處置與可測量驗證。網頁直接抓取曾回 403，本次透過 [官方原始文件](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Threat_Modeling_Cheat_Sheet.md) 讀取。
- [Threat Modeling Manifesto](https://www.threatmodelingmanifesto.org/)：四個核心問題、持續改善、跨職能協作及避免以形式完整取代實際價值。
- [Microsoft STRIDE](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)：六類威脅提示。

穩定 ID、SEC-CAND 候選需求、追溯表及模型審查結論是此補強包的工程設計選擇，不宣稱是 OWASP 強制欄位。LINDDUN 及 AI 分析提示為按情境選用，不表示所有系統必須導入，也不據此宣告符合特定法規。

## 2026-10-13 網路面向與維度補強

新增 [modeling-dimensions.md](modeling-dimensions.md)，整理九個常見面向、分析維度、方法比較與來源對應。此次重新取得 OWASP 官方原始文件、Microsoft、AWS、LINDDUN、VerSprite、MITRE 及 OWASP API Top 10 正文；SEI 本次連線重設，僅列延伸閱讀。NIST SP 800-154 頁面另保留版本限制，不作正式定稿標準。九面向、覆蓋欄位與登入問題是框架整合，不宣稱出自某單一標準，不推導個案漏洞確認。
