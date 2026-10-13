# 威脅建模面向、分析維度與方法選擇

整理／來源核對日期：2026-10-13。本文是本框架依公開來源整合的選用指引，並非任何機構規定的統一維度標準。既有 OWASP 四問／四步流程及 DFD＋STRIDE 主線保持不變。

## 分清四個層次

| 層次 | 意思 | 例子 |
|---|---|---|
| 建模面向 | 分析什麼對象或問題 | 資料流、身分、隱私、業務、部署 |
| 分析維度 | 從哪些角度檢視該面向 | 權限、期限、目的、能力、前提、影響 |
| 方法與知識庫 | 用什麼工具描述或推導 | DFD、STRIDE、LINDDUN、攻擊樹、ATT&CK |
| 評估與處置 | 如何排序及確認改善 | 可能性、影響、證據信心、剩餘風險 |

STRIDE 是安全威脅分類；DFD 是系統描述工具。部署或隱私不是新增的 STRIDE 字母。方法可以組合，不能以採用方法的數量證明模型完整。

## 常見面向與維度

下表是跨案件提示。依範圍記錄已分析、不適用及理由、待確認或未分析；不要求每案使用全部方法。來源代號僅在本文定位，實際案件保留既有 ID。

| 面向 | 分析維度 | 登入 API 教學問題（非漏洞結論） | 方法／來源 |
|---|---|---|---|
| 系統與資料流 | 元件、入口／出口、資料儲存、外部依賴、協定、信任邊界 | Token 經過何處？跨越哪個權限域？ | DFD＋STRIDE；SRC-W1、SRC-W2、SRC-W3 |
| 身分與授權 | 驗證、角色、物件／租戶隔離、委派、憑證用途／受眾／期限／撤銷 | Token 綁定哪個帳號？該帳號可讀哪些水號？ | STRIDE、API 風險提示；SRC-W2、SRC-W7 |
| 資料與隱私 | 敏感度、蒐集目的、最小化、使用範圍、保留、連結、識別與追蹤 | 用水紀錄與日誌能否推知生活模式？ | LINDDUN；SRC-W4 |
| 業務流程 | 狀態轉換、步驟順序、冪等、重放、競態、合法功能濫用 | 同時換發 Token 如何處理？傳入水號與顯示水號是否符合契約？ | Misuse／Abuse Cases；SRC-W1、SRC-W7 |
| 攻擊者與攻擊路徑 | 目標、能力、權限、入口、前提、多步路徑及 AND／OR 條件 | 取得 Token 後仍需哪些條件才可冒用？ | 攻擊樹、PASTA、ATT&CK；SRC-W1、SRC-W5、SRC-W6 |
| 部署與雲端 | 控制／資料面、網路、服務身分、組態、環境隔離、供應商／客戶責任 | 服務間實際是否加密？誰負責配置與驗證？ | 雲端責任與邊界分析；SRC-W1、SRC-W3 |
| 供應鏈與第三方 | 套件來源、建置輸入、流水線權限、更新、發布憑證、成品完整性、外部 API 信任 | 第三方回應是否過度信任？更新與成品如何驗證？ | 邊界／攻擊路徑提示；SRC-W1、SRC-W6、SRC-W7；CI/CD 細項為框架延伸 |
| 維運與復原 | 日誌完整性／最小化、偵測、限流、撤銷、事件隔離、復原與還原證據 | 能否偵測濫用、撤銷憑證並追查？ | STRIDE、ATT&CK、持續建模；SRC-W1、SRC-W3、SRC-W6 |
| 風險與處置 | 可能性、業務／個人影響、證據信心、改善成本、責任、剩餘風險 | 應先補證或改善什麼？如何驗證有效？ | 組織尺度、PASTA／OCTAVE；SRC-W1、SRC-W3、SRC-W5 |

AI／Agent 存在時另用 [analysis-prompts.md](analysis-prompts.md) 的條件式提示；不將 AI 面向強套一般登入 API。

## 方法比較與選擇

共同點是幫助界定問題與形成處置；差異在分析對象、輸入及輸出。以下方法不是可互換的完整流程。

| 方法／名稱（中文） | 主要用途與維度 | 選用時機與限制 |
|---|---|---|
| DFD / Data Flow Diagram（資料流圖） | 外部實體、程序、儲存、資料流、信任邊界 | 作為系統主圖；狀態、時序與競態需補流程／時序圖 |
| STRIDE（六類安全威脅） | S 身分冒用、T 資料竄改、R 否認行為、I 資訊洩漏、D 阻斷服務、E 權限提升 | 檢視元素與資料流；不涵蓋全部隱私與業務傷害 |
| LINDDUN（七類隱私威脅） | Linking 資料連結、Identifying 身分識別、Non-repudiation 不可否認、Detecting 存在／參與可被推知、Data disclosure 資料揭露、Unawareness and Unintervenability 不知情／無法介入、Non-compliance 不符合規範 | 有個人資料及隱私後果時選用；同一字母在不同方法的意思不同；不等於法規合規結論 |
| Attack Trees（攻擊樹） | 目標、替代路徑 OR、共同必要條件 AND | 多步或高價值目標；未證實前提保持假設 |
| Misuse／Abuse Cases（誤用／濫用案例） | 非預期目的、跳步、重複、並行及狀態規則 | 登入、交易、審核等功能；合法功能也可能被濫用 |
| PASTA / Process for Attack Simulation and Threat Analysis（攻擊模擬與威脅分析流程） | 七階段：業務目標、技術範圍、應用拆解、威脅分析、弱點分析、攻擊建模、風險與影響分析 | 需要把技術路徑連回業務損失；方法名稱不授權實際攻擊模擬 |
| OCTAVE / Operationally Critical Threat, Asset, and Vulnerability Evaluation（營運關鍵威脅、資產與弱點評估） | 關鍵資產、組織風險、安全策略 | 組織層風險；不是單一 API 的詳細流程還原工具 |
| VAST / Visual, Agile, and Simple Threat Modeling（視覺化、敏捷、簡易威脅建模） | 應用模型與營運模型、多團隊開發整合 | 大規模協作；依 OWASP 方法摘要選用，不強制產品或工具 |
| MITRE ATT&CK（攻擊者戰術與技術知識庫） | 已知行為、攻擊路徑、偵測與驗證提示 | 補充有依據的情境；本身不是完整建模流程，不強配技術 ID |
| OWASP API Security Top 10 2023（API 十大安全風險） | 物件／屬性／功能授權、驗證、資源、敏感流程、SSRF、組態、盤點、外部 API | API 遺漏檢查；風險清單不能代替範圍、證據、排序與追溯 |

安全與隱私可能存在張力：STRIDE 的 R 關注缺乏可信追查證據；LINDDUN 的 Non-repudiation 關注證據把行為過度連結到個人。增加日誌時同時考慮合法目的、最小化、存取及保留期限。Data disclosure 也含過度蒐集、處理及分享，不能只解釋成未授權外洩。

## 如何落實到模型

1. Planner 依資產、資料、角色、環境及業務目標選面向與方法，記錄理由與未涵蓋問題。
2. Generator 以「面向 × 資產／流程／邊界」建立覆蓋，連回 TM、來源與未知；依案例推導，不能直接複製教學問題作為發現。
3. 每筆風險分列可能性、影響、證據信心、成本、改善前與剩餘風險；不引入通用強制計分公式。
4. Evaluator 檢查適用面向、方法限制、控制執行點及測試證據。只有控制驗證完成才改驗證狀態。
5. 通用字典解釋分類／前綴，個案 `code_glossary.md` 解釋所有實際 ID、分類組合、縮寫與來源；F06 等個案編號不具有跨案固定意義。

小型登入 API 通常先用 DFD＋STRIDE，按需要補業務濫用、LINDDUN、攻擊樹及部署／維運檢查；不強制完整 PASTA、OCTAVE 或 VAST。六階段交接依 [生命週期](../../../../docs/THREAT_MODELING_LIFECYCLE.md)，威脅發生位置與識別／改善／驗證階段分開記錄。

## 來源與查閱限制

以下於 2026-10-13 取得正文（HTTP 200）；摘要為改寫。日期代表本次核對，不代表來源發布日期或正式合規認證。

| 代號 | 來源 | 支持範圍／限制 |
|---|---|---|
| SRC-W1 | [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)；[官方原始文件](https://raw.githubusercontent.com/OWASP/CheatSheetSeries/master/cheatsheets/Threat_Modeling_Cheat_Sheet.md) | 本次讀原始文件；四問、DFD、方法選擇、隱私、雲端、處置；不是固定九面向標準 |
| SRC-W2 | [Microsoft STRIDE](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats) | 六類威脅定義；不證明個案威脅成立 |
| SRC-W3 | [AWS SEC01-BP07](https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/sec_securely_operate_threat_model.html) | 四問、優先排序、持續更新及共享責任；AWS 特有設定不直接套其他平台 |
| SRC-W4 | [LINDDUN Threat Types](https://linddun.org/threat-types/) | 七類隱私威脅及資料最小化；中文為本框架解釋 |
| SRC-W5 | [VerSprite：PASTA](https://versprite.com/blog/what-is-pasta-threat-modeling/) | 方法倡議者的七階段與業務風險說明；不視為普遍強制標準 |
| SRC-W6 | [MITRE ATT&CK](https://attack.mitre.org/) | 攻擊行為知識庫；技術清單更新，個案映射另需證據 |
| SRC-W7 | [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) | API 風險補充提示；保留 2023 版本 |

[SEI 方法比較報告](https://www.sei.cmu.edu/library/threat-modeling-a-summary-of-available-methods/) 本次連線重設，未取得正文；保留延伸閱讀，不以其支持本次新增細節。OCTAVE／VAST 摘要採 SRC-W1。[NIST SP 800-154](https://csrc.nist.gov/pubs/sp/800/154/ipd) 官方頁面本次標示 Initial Public Draft（初始公開草案），發布於 2016 年 3 月；本指引不以草案作正式定稿標準。歷史來源及未取得正文的 FIND／Cloudflare 限制保留於 [source-basis.md](source-basis.md)。
