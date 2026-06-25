# api_auditor 模組

**目的：** 對所有 API 端點（`api/app/*`）做三段式權限測試：無 token / 錯 token / 對 token。

## 觸發

- `/web-sqa api`
- full 模式第 5 步

## 目標

從 config.api_endpoints 讀清單（或即時 grep `api/app/*.php` 補齊）。

## 測試流程

對每個 endpoint 做 3 次請求：

### T1. 無 token
```
curl -X {method} https://your-server.example.com{path}
```

**預期：** 401 Unauthorized + JSON `{"error":"..."}`
**紅旗：** 200 OK / 回正常資料 → Critical 未授權存取

### T2. 錯 token
```
curl -X {method} -H "X-Api-Token: invalid_xxx" https://your-server.example.com{path}
```

**預期：** 401 Unauthorized
**紅旗：** 200 / 5xx → 驗 token 邏輯有問題

### T3. 對 token（但角色無此 perm）
用 `viewer` 角色的 API token 打只有 operator 能用的端點：

```
curl -X {method} -H "X-Api-Token: {viewer_token}" https://your-server.example.com{path}
```

**預期：** 403 Forbidden
**紅旗：** 200 → 跨角色越權

### T4. 對 token（有 perm）→ 驗正常行為
**預期：** 200 + 預期 JSON schema
**額外驗：** 回應不含敏感欄位（password、api_token_hash、FTP_Password）

## 用 Chrome MCP javascript_tool 執行

```js
(async () => {
  const endpoints = [/* from config */];
  const viewerToken = 'xxx';  // 從 users_management 用 generate_token 取
  const operatorToken = 'yyy';
  const results = [];

  for (const ep of endpoints) {
    for (const tok of [null, 'invalid_12345', viewerToken, operatorToken]) {
      const headers = {};
      if (tok) headers['X-Api-Token'] = tok;
      const r = await fetch(ep.path, {method: ep.method, headers, cache:'no-store'});
      let body;
      try { body = await r.json(); } catch { body = await r.text(); }
      results.push({
        endpoint: ep.path, token: tok ? (tok.slice(0, 8) + '...') : 'none',
        status: r.status, hasError: body?.error, keys: Object.keys(body || {})
      });
    }
  }
  return results;
})()
```

## 敏感資訊檢查

在 T4 正常回應中 grep:
- `password`（任何形式）
- `Api_Token_Hash`
- `FTP_Password`
- 完整 `.env` 變數

發現任何 → 🔴 Critical

## 輸出

**資安檢測報告.md** 的「API 權限測試」章節 + 矩陣：

```
端點                         無token  錯token  viewer  operator  洩漏敏感
/api/app/sensors.php         401 ✅   401 ✅   200 ✅  200 ✅    否 ✅
/api/app/inspection.php      401 ✅   401 ✅   403 ✅  200 ✅    否 ✅
...
```
