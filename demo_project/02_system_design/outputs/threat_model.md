# 威脅模型 (STRIDE) — Enhanced

> Phase 02: System Design | Security-Principles General Baseline | 2026-06-28

## STRIDE 威脅分析矩陣

| 威脅類別 | 威脅描述 | 影響資產 | 風險等級 | 緩解措施 | 驗證方式 |
|:---|:---|:---|:---|:---|:---|
| **S**poofing (偽造) | 攻擊者偽造 Session Cookie | 所有 CRUD | 🔴 高 | Session secret_key 隨機生成、30min 逾時 | 滲透測試 |
| **T**ampering (竄改) | SQL Injection 篡改/竊取資料 | 資料庫 | 🔴 高 | 參數化查詢 (?)、輸入過濾 validate_input() | SAST + SQLMap |
| **T**ampering (竄改) | XSS 跨站腳本攻擊 | 瀏覽器 | 🟡 中 | Jinja2 自動轉義、輸入字元過濾 | 手動測試 |
| **R**epudiation (否認) | 使用者否認操作行為 | 審計 | 🟡 中 | app.log 記錄所有 CRUD + 登入/登出 | 日誌審查 |
| **I**nfo Disclosure (資訊洩漏) | debug mode 洩漏 traceback | 系統 | 🟡 中 | 部署時 debug=False、Security Headers | 組態檢查 |
| **I**nfo Disclosure (資訊洩漏) | 錯誤訊息揭露帳號存在 | 使用者 | 🟢 低 | 統一錯誤訊息 "Invalid credentials" | 手動測試 |
| **D**oS (阻斷服務) | 暴力登入嘗試 | 可用性 | 🟡 中 | 5 次失敗鎖定 15 分鐘 | 自動化測試 |
| **E**levation (權限提升) | 未授權存取 CRUD 路由 | 所有 CRUD | 🔴 高 | @login_required 裝飾器保護所有路由 | pytest |

## 攻擊樹 — 未授權存取


```text
                    ┌─ 未授權存取員工資料 ─┐
                    │                        │
             直接存取 URL               Session 偽造
                    │                        │
           ┌───────┴───────┐          ┌─────┴─────┐
           │               │          │           │
      GET / (無登入)   POST /add   猜測 secret  竊取 Cookie
           │               │          │           │
      ✅ @login_required  ✅ 同上   ✅ 32-byte  ✅ HttpOnly
      302 → /login       302       random      (未來增強)


## 信任邊界


```text
┌──────────┐     HTTPS      ┌─────────────┐     SQL      ┌──────────┐
│ 🌐 瀏覽器  │ ───────────────> │ 🐍 Flask App │ ──────────> │ 🗄️ SQLite │
│          │ <─────────────── │             │ <────────── │          │
│ 未信任區   │   Security       │ 信任區       │  參數化查詢   │ 信任區    │
│          │   Headers        │             │             │          │
└──────────┘                  └─────────────┘             └──────────┘
     │                              │
     │                    ┌─────────┴─────────┐
     │                    │ ✅ 輸入驗證        │
     │                    │ ✅ Session 管理    │
     │                    │ ✅ 參數化查詢      │
     │                    │ ✅ Security Headers│
     │                    │ ✅ 日誌審計        │
     │                    └───────────────────┘
```

## 風險矩陣摘要

| 風險等級 | 數量 | 處理策略 |
|:---|:---|:---|
| 🔴 高 | 3 | 必須緩解後才能部署 |
| 🟡 中 | 4 | 建議上線前緩解 |
| 🟢 低 | 1 | 持續監控 |
