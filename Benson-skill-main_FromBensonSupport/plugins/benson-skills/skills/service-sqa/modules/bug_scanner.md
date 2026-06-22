# bug_scanner 模組

**目的：** 批次 fetch 頁面，檢查 DOM 結構完整性、回應大小異常、console / network 錯誤。

## 觸發

- `/web-sqa bugs`
- full 模式第 1 步

## 步驟

### 1. 準備頁面清單
- 讀 `config/service_config.yaml` 的 `admin_pages`
- 額外加：`index.php`, `change_password.php`

### 2. 批次 fetch 測量（用 admin session）

在 Chrome MCP tab 執行：

```js
(async () => {
  const pages = [/* 從 config 帶入 */];
  const results = [];
  for (const p of pages) {
    const r = await fetch('/service/' + p, {credentials:'include', cache:'no-store'});
    const t = await r.text();
    results.push({
      page: p,
      status: r.status,
      bytes: t.length,
      aside: (t.match(/<aside/g)||[]).length,
      shells: (t.match(/class="app-shell"/g)||[]).length,
      titles: (t.match(/<title>/g)||[]).length,
      hasDeny: t.includes('denied-card'),
      hasSidebar: t.includes('app-sidebar'),
      hasMain: t.includes('app-main'),
      hasLogout: t.includes('登出')
    });
  }
  return results;
})()
```

### 3. 判斷 bug

對每一筆結果：

| 指標 | 閾值 | 判定 |
|------|-----|------|
| `status` | != 200 (有權限頁) / != 403 (無權限頁) | 🔴 Critical |
| `bytes` | > 1048576 (1MB) | 🟠 High（回應過大） |
| `aside` | != 1 | 🟠 High（layout 疊或缺） |
| `shells` | != 1 | 🟠 High |
| `titles` | != 1 | 🟠 High |
| `hasSidebar` / `hasMain` / `hasLogout` | false（有權限頁） | 🟠 High（layout 破損） |
| `hasDeny` + `status=200` | true（應該 403 但回 200） | 🟠 High（403 狀態碼錯） |

### 4. 深度測每個頁面的 console / network（抽樣）

對關鍵頁（index、stations、sensors、history、availability）逐一 navigate 後：

```js
// 查 console errors
read_console_messages({ onlyErrors: true, pattern: '.*', limit: 20 })

// 查 failed network requests
read_network_requests({ urlPattern: '/service/' }).filter(r => r.status >= 400)
```

### 5. DOM 深度檢查（同頁面內）

對每個可見的互動元件（按鈕、輸入欄、表單）檢查：
- 沒有重複 id（一個 id 只能出現一次）
- 沒有 inline onclick（CSP 違規 + XSS 風險）
- 沒有 `innerHTML = userInput` 樣的操作（要 grep 原始碼）

可用：
```js
// 找重複 id
(() => {
  const ids = {};
  document.querySelectorAll('[id]').forEach(el => {
    ids[el.id] = (ids[el.id]||0) + 1;
  });
  return Object.entries(ids).filter(([k,v]) => v > 1);
})()
```

### 6. 收集到「發現」陣列

每個發現的 record 格式：

```yaml
id: BUG-001
severity: high   # critical / high / medium / low
page: control_commands.php
issue: "拒絕頁 layout 破損 — aside=2, shells=2"
evidence: "fetch 結果: status=200, aside=2"
repro:
  - "以 operator 身份登入"
  - "訪問 https://your-server.example.com/service/control_commands.php"
  - "觀察 DOM: aside 有 2 個"
suggested_fix: "把 require_permission 移到 include header.php 之前"
```

## 輸出

結果寫入**功能異常清單.md** 的 Bug 區段，依 severity 排序。
