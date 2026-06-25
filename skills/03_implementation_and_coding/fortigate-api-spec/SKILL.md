---
name: fortigate-api-spec
description: FortiGate / FortiOS 7.2.13 REST API 規格查詢工具。當任務涉及呼叫 FortiGate API（包含 /api/v2/cmdb/* 設定、/api/v2/monitor/* 即時查詢、/api/v2/log/* log 查詢），或寫 Python/JavaScript 程式碼存取 FortiGate 設定（policy/vip/address/interface/sessions/IPS/webfilter 等）時必用。觸發詞：FortiGate、FortiOS、Forti API、fapi、防火牆 API、cmdb 端點、Bearer token 撈防火牆設定。避免猜測欄位名稱導致 bug（如 SLB realservers / SD-WAN zone 之類踩過的坑）。
---

# FortiGate API Spec 查詢工具

## 為什麼需要這個 skill

Benson 的 FortiOS 7.2.13 API 完整規格已放在：
```
C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\FortiOS\FortiOS_7.12.13_API\
```

共 **60+ 個 JSON spec 檔**，總計 **34 MB**。不能全部 inline 載入（會爆 context）。
使用方式：**先看 modules.md 找模組 → 再 Read 對應 JSON 查欄位**。

## 何時觸發

✅ 觸發場景：
- 寫 Python / JS / curl 呼叫 FortiGate `/api/v2/...` 端點
- 不確定某欄位叫什麼（如 vip 的對映目標 / sd-wan zone / session 的國家欄位）
- 出現 bug 懷疑欄位名稱錯（之前踩過 SLB `realservers`、SD-WAN `virtual-wan-link` 的坑）
- 設計新 FortiGate 整合（dashboard、自動化腳本、log analyzer）

❌ 不觸發場景：
- 純設定檔解析（.conf）— 但建議**還是改走 API 比較準確**
- 跟 FortiGate 無關的網路問題

## 標準使用流程

### Step 1：先讀 `modules.md`

```
找你要的模組（例如「我要查 firewall vip」）→ 看 modules.md 找到對應檔名 → 拿到完整路徑
```

### Step 2：用 Grep / Read 查具體欄位

```
Grep tool 找 endpoint:
  pattern: "vip"  in modules.md → 確定要看 firewall.json
  pattern: "realservers"  in 那個 json → 找到 SLB 對映目標欄位

或 Read 整段（如果檔不大）:
  Read 對應的 .json 檔
```

### Step 3：開始寫 code，欄位名稱百分百正確

```python
# 確認後再寫
vips = api('cmdb/firewall/vip')['results']
for v in vips:
    if v['type'] == 'server-load-balance':       # ← 從 spec 查到
        for rs in v['realservers']:               # ← 從 spec 查到
            print(rs['ip'], rs['port'], rs['status'])
```

## 常用 base URL 與認證

```
Base URL: https://<firewall-ip>/api/v2/
Header:   Authorization: Bearer <api-token>
Verify:   verify=False (FortiGate 通常自簽憑證)
```

## 三大端點分類

| 類別 | URL 前綴 | 用途 |
|---|---|---|
| **Configuration (CMDB)** | `/api/v2/cmdb/` | **改設定** + 讀設定（policy / vip / address ...） |
| **Monitor** | `/api/v2/monitor/` | **即時狀態**（sessions / interfaces / 即時流量 / IPS event）|
| **Log** | `/api/v2/log/<memory\|disk\|fortianalyzer\|forticloud>/` | log 查詢 |

## 常見模組速查（更詳細在 `modules.md`）

| 我要做 | 模組 | 範例 endpoint |
|---|---|---|
| 撈防火牆規則 | firewall.json (config) | `/api/v2/cmdb/firewall/policy` |
| 撈 VIP（含 SLB）| firewall.json (config) | `/api/v2/cmdb/firewall/vip` |
| 撈 address 物件 | firewall.json (config) | `/api/v2/cmdb/firewall/address` |
| 撈即時連線 | firewall.json (monitor) | `/api/v2/monitor/firewall/session` |
| 撈介面流量 | system.json (monitor) | `/api/v2/monitor/system/interface/select` |
| 撈 IPS 攻擊 log | log.json + ips.json | `/api/v2/log/memory/ips` |
| 撈 SD-WAN zone | system.json (config) | `/api/v2/cmdb/system/sdwan` |
| 撈介面清單 | system.json (config) | `/api/v2/cmdb/system/interface` |

## ⚠️ Benson 踩過的坑（必看）

1. **SLB VIP 的對映目標在 `realservers` 子欄位**，不是 `mappedip` — `.conf` parser 直接掃會漏，**用 API 不會漏**
2. **SD-WAN 模式下，dstintf 不是 wan1/wan2 而是 `virtual-wan-link`** — 要先撈 `cmdb/system/sdwan` 取得 zone 清單，加進「WAN 介面集合」才能正確分類 inbound/outbound
3. **介面流量 `tx_bytes`/`rx_bytes` 是累計值** — 算 bps 要兩次採樣相減 / dt
4. **policy 命中次數要從 `/api/v2/monitor/firewall/policy` 撈**（cmdb 那邊沒有 hit counter）

## 範例完整呼叫（Python）

```python
import requests, urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

FW = "https://59.120.223.190"
TOKEN = "..."
HDR = {"Authorization": f"Bearer {TOKEN}"}

def fapi(path):
    r = requests.get(f"{FW}/api/v2/{path}", headers=HDR, verify=False, timeout=30)
    r.raise_for_status()
    return r.json()

# 撈所有 VIP
vips = fapi("cmdb/firewall/vip")["results"]

# 撈當下 sessions
sess = fapi("monitor/firewall/session?count=1000")["results"]["details"]
```

## 相關專案

`C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\FortiOS\dashboard\app.py` 是 Benson 自己的 FortiGate 即時安全 dashboard，已經把這些 API 用過了，可當參考。
