# crud_tester 模組

**目的：** 對每個管理頁面跑完整 CRUD（建立→查詢→編輯→刪除），驗證資料一致性與副作用。

## 觸發

- `/web-sqa crud`
- full 模式第 4 步

## 目標頁（每個都要跑完整 CRUD）

| 頁面 | 單元 | 測試資料前綴 |
|------|------|------------|
| stations.php | 站點 | `QA_STATION_` |
| sensors.php | 感測器 | `QA_SENSOR_` |
| sensor_types.php | 感測器類型 | `QA_TYPE_` |
| allowed_ips.php | IP 白名單 | `192.0.2.XX`（保留段 TEST-NET-1） |
| mqtt_brokers.php | MQTT broker | `QA_BROKER_` |
| control_commands.php | 控制指令 | `QA_CTL_` |
| roles_management.php | 角色 | `QA_ROLE_` |
| users_management.php | 使用者 | `qa_test_user_N` |
| email_config.php | 郵件設定 | `qa@qa.test` |
| outflow_api.php | 出流 API | `QA_OUTFLOW_` |
| sensor_sync_settings.php | 同步設定 | 現有感測器 |
| motor_dependency.php | 馬達依賴 | 現有感測器 |

## 測試腳本 pattern

對每個單元跑：

```
STEP 1: ADD
  - fetch 初始列表 → 記 count_before
  - navigate to 頁面
  - find form → form_input 填必填欄位（前綴 QA_）
  - click submit button
  - fetch 列表 → 記 count_after
  - 預期: count_after == count_before + 1 ✅
  - 預期: 列表有 QA_... 那列 ✅
  - 若 POST 回 403/400 → ❌ action=add 失敗

STEP 2: READ
  - navigate to 列表頁
  - JS 找 QA_... 那列
  - 展開 / 編輯按鈕 → navigate 詳情頁
  - 驗證欄位值與剛才填的一致

STEP 3: UPDATE
  - 在詳情/編輯頁 → form_input 改一個欄位
  - submit
  - 再 fetch 詳情 → 確認欄位已改

STEP 4: DELETE
  - 找刪除 / 停用 form → submit
  - fetch 列表 → 確認那列消失（或狀態變停用）
  - 若實際走停用：再 fetch 確認 Is_Active=0

STEP 5: CLEANUP
  - 若前面中間失敗留下殘跡 → 現在清
  - 若刪除失敗 → 記「清理失敗」bug
```

## 額外檢查

每個 CRUD 動作後：
1. **稽核日誌** — `audit_log` 是否正確寫入（只能透過 DB 直查或 control_logs 頁看）
2. **副作用** — 如建立感測器會不會影響 sensor_realtime_data 表？測完看一眼
3. **邊界值** — 空字串 / 超長字串 / 特殊字元 / SQL injection payload（`' OR '1'='1`）必須被拒絕
4. **CSRF** — 不帶 token 的 POST 必須被擋（status 403 或 redirect）

## 邊界值測試清單（每個 add 都跑一次）

```
- 全空 → 預期擋（錯誤訊息）
- 必填欄位空白 → 預期擋
- 欄位超長（100 字 → 200 字 → 1000 字）→ 預期擋或截斷
- SQL injection: ' OR 1=1--    → 預期不出錯
- XSS: <script>alert(1)</script> → 預期存入 DB 但顯示時被 escape
- Unicode / emoji → 預期正常儲存顯示
- 重複 key（username/ip 等 unique 欄位）→ 預期回「已存在」
```

## 輸出

**功能異常清單.md** 的「CRUD 測試結果」章節 + 每個單元的 CRUD 矩陣：

```
單元          ADD  READ  UPDATE  DELETE  CLEANUP
stations       ✅    ✅    ✅      ✅      ✅
sensors        ✅    ✅    ❌      ✅      ⚠️
...
```
