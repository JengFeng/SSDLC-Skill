# scenario_runner 模組

**目的：** 模擬真人走完整使用流程（登入→CRUD→登出），每步截圖 + 狀態快照。

## 觸發

- `/web-sqa scenario`
- full 模式第 2 步

## 步驟

### 1. 讀 `config/service_config.yaml` 的 `scenarios` 清單

預設情境：
- `admin_crud_station` — admin 完整 CRUD 站點
- `operator_access_boundary` — operator 能看監測、不能看管理
- `viewer_readonly` — viewer 能看但所有輸入被 disable

### 2. 每個情境逐步執行

依情境 `steps` 執行。每個 step 類型：

| Step | 做法 |
|------|-----|
| `login: X` | 請使用者手動登入（不能代輸密碼） |
| `navigate: page` | `navigate()` |
| `action: add_station` | `form_input` 填欄位 + `left_click` submit button |
| `verify: row_exists` | JS 查表格裡是否有 TEST_STATION 那列 |
| `navigate_and_expect_200: [...]` | 逐個 fetch 確認 status |
| `navigate_and_expect_403: [...]` | 逐個 fetch 確認 status |
| `attempt: post_edit` | JS 偽造 POST 看是否擋 |
| `verify: all_inputs_disabled` | JS 查 input/select/textarea 是否全 disabled |
| `verify: db_unchanged` | 再次 fetch 列表，確認無新紀錄 |
| `logout` | 找登出 form submit |

### 3. 每步截圖

每個 action / navigate 後 `screenshot` + 存入 `docs/qa-reports/{YYYY-MM-DD}/screenshots/{scenario}_{step}.jpg`

### 4. 自動清理測試資料

若情境建了 `QA_TEST_*` 資料，最後 delete / 停用。
若中間失敗導致沒清，下一次重跑時 bug_scanner 提醒。

## 安全原則

- **不能代輸密碼** → `login` step 改成提示使用者手動操作
- **建立的資料一律帶 `QA_TEST_` 前綴** → 好辨識 + 好清理
- **不碰 production 資料** → 所有寫操作都用測試前綴

## 輸出

**功能異常清單.md** 的「情境演練」章節，每個情境給：
- 走完的步數 / 預期步數
- 每步狀態（✅ / ❌）
- 失敗步的截圖連結與 DOM 快照
