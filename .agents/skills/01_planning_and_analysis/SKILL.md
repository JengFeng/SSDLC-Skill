---
name: 01_planning_and_analysis
description: 規劃與需求分析階段，負責原始需求釐清、口語需求正規化、需求追溯矩陣建置、Skill 複選與階段交付物定義。
---

# 規劃與需求分析階段技能規範 (01_planning_and_analysis)

本技能定義了開發團隊在規劃與需求分析階段的標準作業程序（SOP）與代理職責。

> ⚠️ **最高指導框架原則**：本規範受 [CORE_RULES.md](../../../docs/CORE_RULES.md) 管轄，所有代理行為必須遵循 PDCA 閉環與錯誤分級重試機制。

## 一、 代理人職責規範

### 0. 安全防護整合（條件式）

> 本節僅在 `phase_gates.json` 中 `security_baseline.enabled` 為 `true` 時啟用。

*   **適用安全構面**：構面 5（系統與服務獲得—需求階段）
*   **對應參考文件**：`external-resources/Security-Principles/references/05_acquisition.md`


### 1. Planner (規劃代理)
*   **任務**：
    1.  讀取使用者提供的原始需求素材（口語描述、訪談記錄、RFP 文件、會議逐字稿等），存放於 `inputs/`。
    2.  分析需求範圍與模糊點，規劃需求釐清策略（選定 grill-me 或 brainstorming 進行缺口拷問）。
    2.  **[條件式] 安全需求規劃**：若 `security_baseline.enabled` 為 `true`，讀取構面 5 需求階段控制措施，將安全需求（CIA 等級定義、威脅建模要求、OWASP 防範需求）納入需求分析範圍。
    3.  **Skill 上下文推薦**：分析需求素材與對話上下文，主動向使用者推薦：
    - 需求有大量模糊點或缺口 → 推薦 `grill-me`（結構化缺口拷問）
    - 創意發想或探索性需求 → 推薦 `brainstorming`
    - 需處理大量文件/RFP → 推薦 `langchain`（文件分析）
    - 使用者決定採用、跳過、或換其他 Skill。不可未確認即載入。
    4.  **資安防護基準初始化**：詢問使用者「本專案是否需導入資通系統防護基準（Security-Principles）？」若同意，進一步確認防護等級（general / medium / high），執行 `scripts/generate_checklist.py <等級>` 產生對應檢核表至 `outputs/`，並記錄至 `phase_gates.json`。
    5.  執行相容性檢查：比對 Security-Principles 控制措施與現有 Skill 規則，偵測重複或衝突（參照 `00_cross_phase/SKILL.md` 第四節）。
    6.  定義本階段的交付物清單與驗收標準。
*   **驗收標準**：需求規劃清單中必須明確定義需求釐清的範圍、預計使用的 Skill、以及正規化需求規格書的章節結構。

### 2. Generator (執行代理)
*   **核心鐵律**：**只執行、不判斷、不檢查、不修改**。
*   **任務**：
    1.  執行 grill-me 需求釐清對話：先讀取既有專案文件，僅針對未交代清楚的缺口逐點提問，將結論回寫。
    2.  將口語需求萃取為正規化規格：萃取功能需求（做什麼）、業務規則（不違背什麼）、邊界條件（不做什麼）。
    3.  **[條件式] 安全需求寫入**：若 `phase_gates.json` 中 `security_baseline.enabled` 為 `true`，則讀取 `external-resources/Security-Principles/assets/checklist_*.md` 對應等級之構面 5（系統與服務獲得）控制措施，將安全需求（CIA、威脅建模、OWASP）納入 `formal_requirements.md`。
    3.  產出正規化需求規格書 `outputs/formal_requirements.md`（含功能清單、資料模型、技術棧定義）。
    4.  **SSOT 雙軌規格產出（關鍵）**：產出兩份規格供後續階段使用：
        - 👤 **人可讀**：`system_specification.md`（SRS 系統規格書，IEEE 830 格式）
        - 🤖 **AI 可執行（結構化）**：`specs/executable_spec.yaml`（YAML SSOT，含需求、資料模型、API、安全控制、Phase Gates）
    5.  - 🤖 **AI 可執行（行為化）**：`specs/features/requirements.feature`（Gherkin Given-When-Then 場景規格）（YAML SSOT，含需求、資料模型、API、安全控制、Phase Gates）
    5.  確保 SSOT 規格與正規化需求完全一致，為後續所有階段的唯一資料源。
    4.  將所有需求登錄至 `reg/requirement_tracker.md` 統一追蹤表（REQ ID、日期、來源、優先級、描述、狀態）。
    5.  完成後儲存執行快照至根目錄的 `snapshots/` 目錄。

### 3. Evaluator (審查代理)
*   **任務**：進行需求完整性審查與追溯鏈驗證。
*   **審查重點**：
    *   **需求覆蓋率 (35%)**：確認所有原始需求均已正規化、無遺漏的功能點或業務規則。
    *   **需求明確性 (25%)**：確認正規化需求無歧義、可量化、可測試（每個需求皆有對應的驗收條件）。
    *   **追溯鏈完整性 (20%)**：確認 `reg/requirement_tracker.md` 中每條需求皆有 REQ ID，且狀態欄位正確。
    *   **格式一致性 (10%)**：確認 `outputs/formal_requirements.md` 格式符合 TEMPLATE_SKILL.md 定義。
    *   **安全需求覆蓋率 (10%)（條件式）：若 `security_baseline.enabled` 為 `true`，確認 `formal_requirements.md` 已涵蓋構面 5 安全需求。若未啟用則此項權重歸還：需求覆蓋率 40% + 需求明確性 30%。
*   **錯誤分類與重試**（依 CORE_RULES.md 規範）：
    *   **A 類錯誤**（需求描述模糊、格式錯誤、Skill 執行異常）：局部重試最多 3 次，僅退回 Generator。
    *   **B 類錯誤**（需求矛盾、範圍錯誤、不可測試的需求）：立即升級全域迭代，上限 2 輪。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：
    *   `user_requirement_raw.md`：使用者原始口述需求或訪談記錄。
    *   需求相關的 RFP 文件、會議記錄、參考文件。
*   **輸出路徑 (`outputs/`)**：
    *   `formal_requirements.md`：正規化需求規格書（含功能清單、資料模型、技術棧）。
*   `system_specification.md`：👤 人可讀 SRS 系統規格書（IEEE 830）。
*   `specs/executable_spec.yaml`：🤖 AI 可執行規格（SSOT，一源多用）。
*   **需求歷程 (`reg/`)**：
    *   `requirement_tracker.md`：統一需求追蹤表（REQ ID | 日期 | 來源 | 優先級 | 描述 | 對應設計 | 對應實作 | 對應測試 | 狀態）。
    *   `grill_me_session.md`：grill-me 釐清對話記錄（如有執行）。

> 📋 **IO 檔案管理（選擇性功能）**：
> 若使用者已透過以下任一方式啟用 IO 檔案合約管理：
> ① `@init` 時同意啟用 ② `@io set [phase]` ③ `@[phase] in:/out:` 快速定義語法，
> 則
> 本階段的 inputs/outputs 定義將由 `io_files.yaml` 取代上述預設值，
> Planner / Generator / Evaluator 須遵循
> [00_cross_phase/SKILL.md 第六節](../00_cross_phase/SKILL.md) 的合約管理規範。
> 若未啟用，本段不適用，照上述預設值執行。

## 三、 需求追蹤規範

所有需求統一記錄於 `reg/requirement_tracker.md` 單一表格，不另建獨立 .md 檔案。
| 欄位 | 說明 |
|:---|:---|
| REQ ID | 唯一需求編號（格式：REQ_001, REQ_002...） |
| 提出日期 | YYYY-MM-DD |
| 來源 | 使用者口述 / RFP 文件 / 訪談記錄 |
| 優先級 | P0 核心 / P1 重要 / P2 次要 |
| 描述 | 一句話描述需求內容 |
| 狀態 | ✅ 已驗證 / ✅ 設計完成 / 🔄 開發中 / ⏳ 待規劃 / ❌ 已取消 |

*   **🔒 安全產出（條件式）**：若 `security_baseline.enabled` 為 `true`，額外產出：
    *   `outputs/security_requirements.md` — 安全需求規格（CIA 等級定義、威脅建模範圍、法規遵循清單）

