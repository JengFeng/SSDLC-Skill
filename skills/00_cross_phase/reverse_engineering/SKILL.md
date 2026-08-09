# 逆向工程 Reverse Engineering — 主控 Orchestrator

---
name: ReverseEngineering
description: 對既有無完整文件之交付專案原始碼，逆向還原六大 SSDLC 各階段交付物。從程式碼（Phase 03）往回推至設計（Phase 02）再到需求（Phase 01），逆向完成後無縫切換順向流程。
---

## 一、定位與核心原則

本 Skill 為逆向工程的**主控 Orchestrator**，負責：
1. 接收使用者提供的舊專案原始碼
2. 判斷是否為逆向工程任務
3. 依序調度六個子 Skill（Phase 03→02→01→04→05→06）
4. 管控逆向進度與階段轉換
5. 逆向完成後切換至順向 SSDLC 流程

**核心原則**：不新增階段，不改現有流程。逆向工程是現有六階段的「逆向模式」擴充。

---

## 二、觸發條件

### 2.1 自動觸發
- 使用者提供舊專案原始碼目錄路徑
- 使用者說「幫我逆向分析這個專案」「還原這個舊專案的文件」「從程式碼反推需求」

### 2.2 手動觸發
- 指令：`@reverse [專案路徑]`
- 口語觸發：「啟動逆向工程」「逆向還原」「reverse engineering」

### 2.3 不觸發條件
- 使用者提供的是新專案（從零開始）→ 走正常 Phase 01~06
- 使用者只想做程式碼審查 → 不啟動逆向流程

---

## 三、執行流程（逆序遞推）

```
使用者提供原始碼
    │
    ▼
┌─────────────────────────────────────────┐
│  Phase 03 Reverse：程式碼分析（起點）    │
│  輸入：原始碼目錄                        │
│  輸出：模組清單、API 路由、DB Schema     │
└─────────────────────────────────────────┘
    │ 產出物自動成為下一階段輸入
    ▼
┌─────────────────────────────────────────┐
│  Phase 02 Reverse：設計文件反推          │
│  輸入：Phase 03 逆向產出                 │
│  輸出：ER 圖、API Spec、系統架構圖       │
└─────────────────────────────────────────┘
    │ 產出物自動成為下一階段輸入
    ▼
┌─────────────────────────────────────────┐
│  Phase 01 Reverse：需求文件反推          │
│  輸入：Phase 02 逆向產出                 │
│  輸出：需求文件、SSOT、追溯矩陣          │
└─────────────────────────────────────────┘
    │ 逆向完成，切換順向
    ▼
┌─────────────────────────────────────────┐
│  Phase 04：測試整合（順向）              │
│  輸入：原始碼 + 現有測試                 │
│  輸出：測試報告、覆蓋率分析              │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  Phase 05：部署解析（順向）              │
│  輸入：部署腳本、Dockerfile、組態檔      │
│  輸出：部署拓撲圖、建置清單              │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│  Phase 06：運維解析（順向）              │
│  輸入：日誌配置、監控配置                │
│  輸出：運維手冊、監控儀表板              │
└─────────────────────────────────────────┘
    │
    ▼
  順向 SSDLC 流程（Phase 01~06 正常運作）
```

---

## 四、子 Skill 清單

| 子 Skill | SSDLC 階段 | 核心功能 |
|:---------|:-----------|:---------|
| `phase_03_code_restore` | Phase 03 逆向 | 程式碼分析、模組拆解、API 路由匯整、DB Schema 反推 |
| `phase_02_design_restore` | Phase 02 逆向 | 系統架構圖、ER 圖、API Spec、Use Case 圖反推 |
| `phase_01_requirements_restore` | Phase 01 逆向 | 需求文件、Gherkin 場景、SSOT、追溯矩陣反推 |
| `phase_04_test_restore` | Phase 04 順向 | 現有測試匯整、覆蓋率分析、缺失測試標註 |
| `phase_05_deploy_restore` | Phase 05 順向 | Dockerfile 解析、部署腳本匯整、環境參數提取 |
| `phase_06_ops_restore` | Phase 06 順向 | 日誌配置解析、監控配置匯整、運維手冊生成 |

---

## 五、階段間資料流

每個子 Skill 的輸出自動成為下一個子 Skill 的輸入，透過 `outputs/` 目錄傳遞：

```
outputs/
  ├── phase_03_reverse/     ← Phase 03 逆向產出
  │   ├── module_list.json
  │   ├── api_routes.json
  │   ├── db_schema_raw.sql
  │   └── code_analysis.md
  ├── phase_02_reverse/     ← Phase 02 逆向產出
  │   ├── er_diagram.md
  │   ├── api_spec.md
  │   ├── system_architecture.md
  │   └── use_case_diagram.md
  ├── phase_01_reverse/     ← Phase 01 逆向產出
  │   ├── formal_requirements.md
  │   ├── executable_spec.yaml
  │   ├── requirements.feature
  │   └── traceability_matrix.md
  ├── phase_04/             ← Phase 04 產出
  ├── phase_05/             ← Phase 05 產出
  └── phase_06/             ← Phase 06 產出
```

---

## 六、錯誤處理與重試

遵循 CORE_RULES.md 的錯誤分級機制：
- **A 類錯誤**（工具執行異常）：局部重試最多 3 次
- **B 類錯誤**（跨階段不一致）：升級全域迭代，上限 2 輪
- **人工審核閘口**：Phase 01 逆向完成後，強制暫停等待使用者確認

---

## 七、與現有框架的整合

### 7.1 與 PDCA 閉環整合
每個子 Skill 內部仍遵循 Planner → Generator → Evaluator 流程，只是 Planner 的規劃方向改為「逆向分析」。

### 7.2 與 SSOT 整合
Phase 01 逆向產出的 `executable_spec.yaml`、`requirements.feature`、`system_specification.md`、`traceability_matrix.md` 直接進入 SSOT 追溯鏈。

### 7.3 與 Baseline 整合
逆向完成後，自動觸發 `@baseline` 封存逆向成果。

### 7.4 與 Security-Principles 整合
逆向完成後，可透過 `@security-load` 導入資安防護基準。

---

## 八、使用範例

### 範例 1：完整逆向
```
使用者：@reverse D:/old_projects/legacy_app
AI：偵測到舊專案原始碼，啟動逆向工程流程。
    Phase 03 逆向：分析程式碼中...
    Phase 02 逆向：反推設計文件中...
    Phase 01 逆向：反推需求文件中...
    逆向完成！已產出完整 SSOT 文件。
    要繼續走順向流程（Phase 04~06）嗎？
```

### 範例 2：僅逆向部分階段
```
使用者：@reverse D:/old_projects/legacy_app --phase 03,02
AI：僅執行 Phase 03 和 Phase 02 的逆向分析。
```

### 範例 3：口語觸發
```
使用者：幫我從這個舊專案的程式碼反推需求文件
AI：偵測到逆向工程需求，啟動 @reverse 流程...
```
