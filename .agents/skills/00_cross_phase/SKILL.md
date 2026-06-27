---
name: 00_cross_phase
description: 跨階段全域共用技能。適用於所有 SSDLC 開發階段的通用工具，包含版本控制、多 Agent 協作、程式碼差異同步、自主迭代研究與 TDD 流程。
---

# 跨階段全域共用技能規範 (00_cross_phase)

本技能定義了跨階段全域共用層的標準作業程序（SOP）與代理職責。此層級的 Skill 不歸屬於任一特定開發階段，而是為所有階段提供通用基礎能力。

> ⚠️ **最高指導框架原則**：本規範受 [CORE_RULES.md](file:///d:/00AI協作/SSDLC_Skill/docs/CORE_RULES.md) 管轄，所有代理行為必須遵循 PDCA 閉環與錯誤分級重試機制。

## 一、 代理人職責規範

### 1. Planner (規劃代理)
*   **任務**：
    1.  根據當前工作階段的上下文，判斷需要哪些跨階段通用工具（版本控制、多 Agent 協作、程式碼差異同步、自主迭代研究等）。
    2.  確認工具的適用性與相容性（如 git 工作區狀態、langgraph Agent 狀態、diffsync 差異範圍）。
    3.  選定工具使用的先後順序與相依關係。
*   **驗收標準**：規劃清單中必須明確定義本次任務所需的跨階段工具清單、使用順序，以及各工具的預期產出格式。

### 2. Generator (執行代理)
*   **核心鐵律**：**只執行、不判斷、不檢查、不修改**。
*   **任務**：
    1.  嚴格依照 Planner 選定的工具清單依序執行。
    2.  執行版本控制操作（git commit、tag、stash、baseline 封存）。
    3.  執行多 Agent 協作工作流（langgraph 狀態管理、Agent 間訊息傳遞）。
    4.  執行程式碼差異對比與同步（diffsync 跨階段比對）。
    5.  執行自主迭代研究循環（autoresearch: 修改→驗證→保留/丟棄）。
    6.  執行 TDD 流程（test-driven-development: 紅→綠→重構）。
    7.  完成後儲存執行快照至根目錄的 `snapshots/` 目錄。

### 3. Evaluator (審查代理)
*   **任務**：驗證跨階段工具執行結果的正確性與完整性。
*   **審查重點**：
    *   **版本控制完整性 (30%)**：確認 git 操作正確執行、commit message 符合規範、tag 正確標記。
    *   **Agent 協作正確性 (25%)**：確認 langgraph 狀態流轉無異常、Agent 間訊息無遺漏。
    *   **差異同步準確性 (25%)**：確認 diffsync 比對結果正確、無遺漏的跨階段差異。
    *   **迭代研究有效性 (20%)**：確認 autoresearch 循環有正確的保留/丟棄決策記錄。
*   **錯誤分類與重試**（依 CORE_RULES.md 規範）：
    *   **A 類錯誤**（工具執行異常、逾時、環境問題）：局部重試最多 3 次，僅退回 Generator。
    *   **B 類錯誤**（工具不相容、Agent 狀態衝突）：立即升級全域迭代，上限 2 輪。

---

## 二、 輸入與輸出規範

*   **輸入路徑 (`inputs/`)**：各階段提出的跨階段工具需求請求。
*   **輸出路徑 (`outputs/`)**：
    *   `cross_phase_report.md`：本次跨階段工具執行摘要報告。
    *   `agent_state_snapshot.json`：langgraph Agent 狀態快照（如有）。
    *   `diff_report.md`：diffsync 跨階段差異比對報告（如有）。

## 三、 可用技能

| 快捷 | 技能名稱 | 用途 |
|:---|:---|:---|
| 01 | langgraph | 多 Agent 協作工作流狀態管理 |
| 02 | git | 版本控制與 Baseline 封存追溯 |
| 03 | diffsync | 跨階段程式碼差異對比與同步 |
| 04 | autoresearch | 自主迭代研究：修改→驗證→保留/丟棄 |
| 05 | brainstorming | 創意發想引導與需求探索 |
| 06 | firecrawl | 網頁擷取、截圖、搜尋與爬蟲 |
| 07 | test-driven-development | 測試驅動開發 (TDD) 流程 |
| 08 | verification-before-completion | 完成前強制驗證 |
| 09 | writing-plans | 多步驟任務規劃與規格撰寫 |
| 10 | ralph-loop | 自主 AI 開發循環（修改→測試→驗證→保留） |
| 11 | using-superpowers | Skill 尋找與使用引導 |