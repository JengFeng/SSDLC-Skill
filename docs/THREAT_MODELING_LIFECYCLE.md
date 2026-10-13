# 威脅建模啟用政策與生命週期

## 唯一啟用條件

**安全基準已啟用，或使用者明確要求／選取威脅建模時，威脅模型為必要交付物；其餘情況為選用。**

機器可檢查的條件為 `security_baseline.enabled == true OR threat_modeling.requested == true OR threat_modeling.selected == true`，記錄於專案 `phase_gates.json`。舊專案無新增區塊時，requested／selected 預設 false，仍承接原有安全基準開關。代理須將當次明確要求／選取記錄至專案設定；勾選建模不會自動啟用安全基準。未知與推論不能代替使用者選擇。

## 開始、交付與驗證是不同里程碑

| 階段 | 工作 | 完成判準 |
|---|---|---|
| 01 規劃 | 資產、安全目標、範圍、適用條件及交接需求 | 建模規劃與安全需求明確；此時不要求完整模型 |
| 02 設計 | DFD／邊界、威脅、排序、處置與驗證追溯 | 第一版模型完成並接受模型審查；控制可尚未實作／驗證 |
| 03 開發 | 實作核准控制、記錄設計差異及新攻擊面 | CTRL 對應到實作；差異已回饋 |
| 04 測試 | 負向／濫用／邊界與正常操作驗證 | 本次版本改善措施有執行證據，剩餘風險有處置；未執行不算通過 |
| 05 部署 | 核對實際配置、邊界、權限與模型假設 | 部署差異已處理／記錄 |
| 06 維運 | 事故、變更、接受效期及新威脅觸發更新 | 持續維護，沒有永久終止點 |

文件存在、模型審查通過、控制驗證通過與階段核准分開；完整性腳本只檢查必要交付存在，不代替模型品質、正式風險接受或資安合規判定。

## SSOT 與交付路徑

- 正向預設：`02_system_design/outputs/threat_model.md`。`phase_02_design.outputs.threat_model` 記錄專案根相對路徑；未產出為 null，不能用佔位文件假稱完成。
- 若專案 Phase 02 的 `io_files.yaml`／`io_files.override.yaml` 明確宣告 `id: threat_model.md`，以其 path 作為專案根相對路徑；override 優先。SSOT 與 IO 同時有路徑時必須一致。
- 既有頂層 `phases` 相容投影只在適用且正式登錄交付時加入 `threat_model.md`，不把未選用模型加入全部專案的必填清單。代理必須依啟用條件設定 IO `required`；完整性腳本獨立檢查必要交付，不能以契約漏列或 required=false 跳過。
- 正向必要交付在 Phase 02 完成／交接時檢查，後續 Phase 03–06 啟動時承接模型。Phase 01 或尚未交付的 Phase 02 不因模型未存在而阻擋。
- 逆向候選：`outputs/phase_02_reverse/threat_model.md`；逆向 Phase 02 已完成時必要交付生效。未完成的逆向盤點可繼續建立模型。人工核准及正向設計審查維持原流程。
- 新安全需求先用候選 ID，經既有核准流程後映射正式 REQ；三軌規格與 RTM 使用原有同步方式，不新增第二份正式 SSOT。

## 檢查方式與邊界

`check_spec_integrity.py` 在 A／B／C／D／E／S 模式呼叫威脅模型條件檢查。根框架母版的預設條件關閉，不要求模型。符合條件的正向 Phase 02 完成／交接、後續階段啟動或已完成的逆向 Phase 02，缺少模型列為完整性缺失；是否退回或放行仍依既有規章，腳本不修改 gate。

可以單獨執行 `python scripts/check_threat_modeling.py --project <專案目錄> --phase 02 --mode B` 檢查 Phase 02 交付；不會掃描服務或修改資料。`scripts/test_threat_modeling_policy.py` 用暫存專案驗證開關、里程碑、路徑及逆向條件；不代表真實系統控制驗證。
