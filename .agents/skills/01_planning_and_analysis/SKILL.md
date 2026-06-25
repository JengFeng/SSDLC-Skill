---
name: 01_planning_and_analysis
description: 規劃與需求分析階段，負責將人類的模糊口語敘述進行萃取與正規化，產出結構化需求。
---

# 規劃與需求分析階段技能規範 (01_planning_and_analysis)

本技能定義了開發團隊在規劃與需求分析階段的標準作業程序（SOP）與代理職責。

## 一、 代理人職責規範

### 1. Planner (規劃代理)
*   **任務**：設計需求訪談大綱，明確指出當前商業目標中的技術盲點、未確認的業務邊界與潛在的例外狀況。
*   **驗收標準**：產出之訪談大綱必須包含至少 5 個針對性問題，引導使用者提供精確邊界。

### 2. Generator (執行代理)
*   **任務**：
    1.  讀取人類儲存於 `inputs/` 中的口述需求記錄檔案 `REQ_*.md`。
    2.  執行前處理流水線：進行**萃取**（拉出功能、業務規則、邊界條件）與**正規化**（將模糊詞彙轉化為可量化指標）。
    3.  產出結構化規格檔案 `outputs/requirements.yaml`，其格式必須符合系統 SSOT 規範。
    4.  自動撰寫人讀版會議與訪談記錄 `outputs/interview_notes.md`。

### 3. Evaluator (審查代理)
*   **任務**：逐條對照 `inputs/REQ_*.md` 與 `outputs/requirements.yaml`。
*   **審查重點**：
    *   確認無任何口述功能點被遺漏。
    *   確認所有業務規則皆已正規化（例如：無「系統要夠快」等模糊字眼，皆已轉為數據指標）。
    *   若審查通過，則在根目錄 `traceability_matrix.md` 中註冊該需求。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：存放人類提出的原始需求記錄點 `REQ_YYYYMMDD_HHMMSS.md`。
*   **輸出路徑 (`outputs/`)**：
    *   `interview_notes.md`：繁體中文 Markdown 格式會議記錄。
    *   `requirements.yaml`：正規化結構規格。
