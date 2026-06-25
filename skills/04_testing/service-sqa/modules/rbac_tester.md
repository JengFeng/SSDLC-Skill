# rbac_tester 模組

**目的：** 驗證所有受保護頁面對非授權角色都正確回 403 + 純獨立拒絕頁（無 sidebar 疊加）。

## 觸發

- `/web-sqa rbac`
- full 模式第 3 步

## 前置條件

當前 session 必須是 **admin (benson)**，會用 impersonation 切角色（免登出重登）。
若非 admin，提示使用者登入 benson 再開始。

## 步驟

### 1. 切 operator（用 admin 的 impersonation）

topbar 有 `role_switch.php` form。用 JS 提交：

```js
(() => {
  const form = document.querySelector('form[action="role_switch.php"]');
  form.querySelector('select[name="role_id"]').value = '2'; // operator
  form.submit();
})()
```

**或直接找 select form_input** 設 ref 值為 2 → submit。

### 2. 批次 fetch 所有 admin_pages（operator 視角）

```js
(async () => {
  const pages = [/* config.admin_pages */];
  const out = [];
  for (const p of pages) {
    const r = await fetch('/service/' + p.page, {credentials:'include', cache:'no-store'});
    const t = await r.text();
    out.push({
      page: p.page, perm: p.perm,
      status: r.status, bytes: t.length,
      aside: (t.match(/<aside/g)||[]).length,
      shells: (t.match(/class="app-shell"/g)||[]).length,
      isDenyPage: t.includes('denied-card'),
      isContent: t.includes('app-sidebar') && t.includes('app-topbar') && !t.includes('denied-card')
    });
  }
  return out;
})()
```

### 3. 判斷每一筆

對 operator 身份，**預期有權限**（不是 admin-only）的頁面：
- `inspection_logs`, `stations`, `sensors`, `history`, `availability`, `alert_logs`, `sensor_types`, `motor_dependency`（依 operator 實際分配）

對 operator 身份，**預期無權限**的頁面（admin-only）：
- `allowed_ips`, `control_commands`, `backup_management`, `users_management`, `mqtt_brokers`, `ftp_browser` 等

| 預期 | 實測 status | aside/shells | 判定 |
|------|------------|--------------|------|
| 有權限 | 200 | 1/1 | ✅ 通過 |
| 有權限 | 403 | - | 🔴 角色配置錯（該給未給） |
| 無權限 | 403 | 0/0 + denied-card=true | ✅ 通過 |
| 無權限 | 200 | - | 🔴 Critical 越權 |
| 無權限 | 200 + denied-card=true | - | 🟠 狀態碼問題（內容擋了但 HTTP 是 200） |
| 任何 | 200 | 2/2 (DOM 疊) | 🟠 Layout 破損 |

### 4. 切 viewer 重跑

把 role_id 設 3（viewer）。驗證 `viewer_allowed_views()` 白名單**只有 10 項**：

預期有權限：`dashboard, stations, sensors, sensor_types, motor_dependency, history, availability, alert_logs, inspection_logs, app.data`

非白名單的 admin_pages 必須全部 403。

### 5. 還原 benson 身份

用 role_switch.php 的 restore action：

```js
(() => {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'role_switch.php';
  // CSRF token 從現有 form 複製
  const csrfInput = document.querySelector('input[name="csrf_token"]').cloneNode();
  form.appendChild(csrfInput);
  const actionInput = document.createElement('input');
  actionInput.name = 'action'; actionInput.value = 'restore';
  form.appendChild(actionInput);
  document.body.appendChild(form);
  form.submit();
})()
```

### 6. 產出 RBAC 矩陣

```
                 admin  operator  viewer
allowed_ips.php  200    403 ✅    403 ✅
control_cmds     200    403 ✅    403 ✅
stations         200    200 ✅    200 ✅
users_mgmt       200    403 ✅    403 ✅
...
```

## 輸出

**資安檢測報告.md** 的「RBAC 越權測試」章節。
Critical/High 另寫入**資安緊急修復清單.md**。
