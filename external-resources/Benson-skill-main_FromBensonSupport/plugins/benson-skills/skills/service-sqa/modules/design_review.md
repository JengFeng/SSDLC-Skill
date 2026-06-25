# design_review 模組

**目的：** 架構/設計層面的資安 checklist。逐項檢查、逐項記錄。

## 觸發

- `/web-sqa design`
- full 模式第 6 步

## Checklist

### D-1. Security Headers 完整性

fetch `index.php` 看 response headers：

```js
const r = await fetch('/service/index.php', {credentials:'include'});
const headers = {};
for (const [k,v] of r.headers.entries()) headers[k] = v;
```

對照 `config.required_security_headers`，每個檢查：
- 該有的是否都有
- 值是否符合 pattern

對照 `config.forbidden_headers`，確認**沒有**出現：
- `X-Powered-By`
- `Server: nginx/1.xx.x`（不應帶版本）

### D-2. Cookie 屬性

```js
// 在 /service/index.php 開 DevTools cookies 或用 Application → Cookies
```

或 fetch 看 `Set-Cookie` header：

```js
const r = await fetch('/service/index.php', {credentials:'include'});
const setCookie = r.headers.get('Set-Cookie');  // 注意瀏覽器可能擋 Set-Cookie
```

對每個 cookie 檢查：
- `HttpOnly` 是否設（session cookie 必要）
- `Secure` 是否設（HTTPS 必要）
- `SameSite=Strict` 或 `Lax`
- 不可被 JS 讀取（`document.cookie`）

備用：用 `mcp__Claude_in_Chrome__javascript_tool` 執行 `document.cookie` 看能讀到什麼。讀得到的 = 沒 HttpOnly。

### D-3. 敏感路徑 404 確認

對 `config.sensitive_paths` 每個：

```js
const r = await fetch(path, {cache:'no-store', headers:{'Cache-Control':'no-cache'}});
if (r.status !== 404) report_leak(path, r.status);
```

**重點：** 必須加 `cache: 'no-store'`，不然會吃舊 200。

### D-4. CSRF Token 覆蓋面

grep `C:\github\service\*.php` 的 POST form，檢查每個：
- 有 `csrf_field()` 或 `<input name="csrf_token">`
- 有 `csrf_verify()` 呼叫在處理 POST 前

漏掉的頁面 → 🔴 Critical

### D-5. XSS Reflection 點

對每個有 GET 參數的頁面，用 payload 試注：

```
?q=<script>alert('XSS')</script>
?sort=<img src=x onerror=alert(1)>
```

fetch 回 body 看 payload 是否被 escape：
- 原樣出現 `<script>` → 🔴 Critical
- 被 escape 成 `&lt;script&gt;` → ✅

自動化 payload 清單：

```js
const payloads = [
  "<script>alert(1)</script>",
  "'\"><img src=x onerror=alert(1)>",
  "javascript:alert(1)",
  "{{7*7}}"  // template injection
];
```

### D-6. SQL Injection 點

對搜尋 / 篩選欄位（q, station_id, sensor_id 等）試：

```
?q=' OR '1'='1
?station_id=1 OR 1=1
?sensor_id=1; DROP TABLE users--
```

預期：回應正常（無錯誤訊息 / 空結果），不回 DB error stack trace。

若回 `PDOException` / `SQLSTATE` / `syntax error` → 🔴 Critical。

### D-7. 路徑遍歷

對讀檔 endpoint（`inspection_photo_view.php`、`ftp_download.php`、`sensor_photo.php`）試：

```
?file=../../../../etc/passwd
?file=..\..\..\.env
?file=../../../.env.php
```

預期：404 / 400 / 403。

### D-8. 檔案上傳類型驗證

- 找可上傳檔案的 endpoint（`sensors.php` 照片、`inspection.php` 維護照片、`ftp_browser.php`）
- 試傳：`.php` 改副檔名 `.jpg`、`.jpeg.php`、`image.php;.jpg`
- 預期：被擋 + 不會執行（即使寫入，也該存在 webroot 外或禁 PHP 執行）

### D-9. 敏感資訊洩漏

- Source map (`.map` 檔)：應無
- 錯誤頁：不該顯示 PHP 路徑 / DB 結構 / stack trace
- `.well-known/` 只該有合法內容
- Robots.txt 不該洩漏 admin path
- HTML 註解內不該有 TODO/DEBUG 秘密

### D-10. Session Fixation

登入前後的 PHPSESSID 值要不同：
1. 打開無痕 → 抓 PHPSESSID_A
2. 登入 → 抓 PHPSESSID_B
3. 預期 A != B（login.php 應呼叫 `session_regenerate_id(true)`）

本系統 `login.php:195` 已 `session_regenerate_id(true)` ✅

### D-11. Rate Limiting

嘗試 20 次連續登入失敗 → 應觸發帳號鎖定 + IP 鎖定。
本系統已有 5 次鎖帳 + 10 次 IP 鎖（`login_ip_check_and_record`）。

### D-12. 匿名 MQTT / FTP

看 `mqtt_brokers.php` / `backup_management.php` 的設定是否：
- MQTT broker 允許匿名（allow_anonymous）
- FTP 走 port 21 明文

記錄為「已知接受風險」或開 ticket。

## 輸出

**資安檢測報告.md** 的「設計審查」章節，每項 ✅/❌ + 實證。
Critical/High 寫入**資安緊急修復清單.md**。
