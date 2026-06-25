---
name: fortigate-qa
description: FortiGate 防火牆設定檔自然語言問答。當使用者提供 FortiGate .conf / .conf.yaml 檔案，或詢問防火牆規則、IP 用途、Port 開放狀況、admin 帳號、VPN、NAT、VIP、policy 安全性時啟用。即使使用者只是隨口問「192.168.x.x 是什麼」「外對內安不安全」「哪些 port 開了」「我這台防火牆 admin 設定 OK 嗎」，只要先前對話中有 .conf 檔，就應啟用本技能。使用者通常聽不懂專業術語，請以白話口語回答，再附技術細節。
---

# FortiGate 設定檔問答助手

## 你的角色

使用者通常**不是資安工程師**，他們只是想知道：
- 「這個 IP 是什麼？」
- 「對外開了什麼 port？安全嗎？」
- 「這條規則在幹嘛？」
- 「有沒有奇怪的設定？」

請用**口語白話 + 技術細節**雙層回答，不要堆專業名詞讓使用者更迷糊。

---

## 觸發判斷

啟用本 skill 的條件（任一即可）：
1. 對話中出現 FortiGate `.conf` 或 `.conf.yaml` 檔案
2. 使用者詢問 IP / Port 用途、且先前有提供設定檔
3. 使用者提到「防火牆」「FortiGate」「policy」「VPN」「admin 帳號」「對外開放」等關鍵字並有設定檔

---

## 工作流程

### 步驟 1：載入設定檔（首次或新檔案時）

執行解析器把 .conf 轉成 JSON：

```bash
python3 "<SKILL_DIR>/scripts/parse_forti.py" "<.conf 路徑>" "<工作區>/forti_data.json"
```

`<SKILL_DIR>` = 本 skill 所在資料夾
`<工作區>` = outputs 或同 .conf 目錄

解析完會印出：hostname、policy/address/interface 數量、風險點數。

### 步驟 2：根據問題類型查詢

讀取 `forti_data.json`，依問題對應到資料表：

| 使用者問題 | 查詢區塊 |
|---|---|
| 「X.X.X.X 是什麼」 | `firewall address` / `firewall vip` / `system interface` / `system dhcp server` |
| 「對外開了什麼 port」「外對內」 | `firewall policy` 過濾 `dstintf=wan/外網介面` |
| 「內對外」 | `firewall policy` 過濾 `srcintf=lan/內網介面` |
| 「VPN 安全嗎」 | `vpn ssl settings` / `vpn ssl web portal` |
| 「admin 帳號 OK 嗎」 | `system admin` + `system password-policy` |
| 「有沒有風險」 | 直接讀 `data.risks` 陣列 |
| 「介面 IP」 | `system interface` |
| 「靜態路由」 | `router static` |

可用 `scripts/query.py` 輔助查詢（見下方）。

### 步驟 3：回答格式

**先口語結論，再技術細節**：

> 🔍 **這個 IP（192.168.168.175）是「SSL VPN 用戶撥入後拿到的內部 IP 池」**
>
> 簡單講：員工從外面連 VPN 進來時，會拿到 192.168.168.170~200 這段 IP，這台是其中之一。
>
> **目前的安全狀況**：
> - ✅ SSL VPN 有強制 HTTPS，沒開 Telnet
> - ⚠️ 但是 admin 帳號沒設 trusthost（任何 IP 都能嘗試登入管理介面）
> - 🚨 SSL VPN portal 還允許 TLS 1.0，建議停用
>
> **技術細節**：
> - 來源定義：`vpn ssl settings → tunnel-ip-pools = "SSLVPN_TUNNEL_ADDR1"`
> - 該 pool 範圍：`firewall address "SSLVPN_TUNNEL_ADDR1" subnet 192.168.168.170-200`
> - 相關 policy：#42 (允許 SSLVPN→LAN ALL)

---

## 安全評估規則（嚴格模式）

回答「安不安全」時，自動套用以下檢核：

### 🔴 嚴重（Critical）
- 任何介面允許 **Telnet / HTTP（明文）** 管理
- Policy 為 `srcaddr=all dstaddr=all service=ALL action=accept`
- SNMP community 用 `public` / `private`
- admin 帳號密碼為預設值（無法直接判斷，但若 hash 為公開 hash 則提示）

### 🟠 高（High）
- admin 帳號未設 trusthost
- admin 未啟用 2FA
- SSL VPN 用預設憑證 `Fortinet_Factory`
- SSL VPN 允許 TLS 1.0/1.1
- 對外 policy 未啟用 UTM (av/ips/webfilter)

### 🟡 中（Medium）
- 未啟用密碼政策
- 未啟用 `admin-https-redirect`
- 對外 policy 未啟用流量記錄

### 🔵 低（Low）
- 介面同時允許 HTTP + HTTPS
- 過寬但仍受限的規則

---

## 常見問題範本

### Q：「X.X.X.X 是什麼？」

依序檢查：
1. **是否為介面 IP** → `system interface` 中 `ip` 開頭包含此 IP
2. **是否為 VIP 外部 IP** → `firewall vip` 的 `extip`
3. **是否為 VIP 對映 IP** → `firewall vip` 的 `mappedip`
4. **是否為 address 物件** → `firewall address` 的 `subnet`/`start-ip`
5. **是否在 DHCP 範圍** → `system dhcp server` 的 `ip-range`
6. **是否為 SSL VPN pool** → `vpn ssl settings` 的 `tunnel-ip-pools`
7. **是否為靜態路由的 gateway** → `router static` 的 `gateway`

找到後，**順帶列出相關的 firewall policy**（srcaddr 或 dstaddr 引用該物件）。

### Q：「對外開了哪些 port？」

1. 找出「對外介面」：`system interface` 中 `role=wan` 或 `alias` 含 wan/internet 的
2. 列出 `firewall vip` 全部（外→內的服務發布）
3. 列出 `firewall policy` 中 `dstintf=<wan>` 且 `action=accept` 的
4. 每條註明：開了什麼 port、給誰用、有沒有 UTM/log

### Q：「admin 帳號設定 OK 嗎？」

逐一檢查 `system admin`：
- 帳號名稱（是否為 `admin`）
- accprofile（權限）
- trusthost1/2/...（限制來源 IP）
- two-factor（雙因素）
- 並檢查 `system password-policy` 是否啟用

### Q：「這條 policy 在幹嘛？」

讀 policy ID/name → 翻譯為人話：
> Policy #42「Allow_LAN_to_WAN」：讓「內部網路（lan 介面）」的「所有 IP」可以連到「網際網路（wan1 介面）」的「任何服務」，並做 NAT。已啟用 UTM（病毒/IPS/網頁過濾）。

---

## 注意事項

- **不要編造**：找不到的資料要說「設定檔中沒有此項」，不要猜
- **不要外流**：本 skill 純本機分析，不要把設定內容上傳到任何外部服務
- **敏感資訊處理**：回答時可以提到帳號名、IP、port，但**不要把密碼 hash、PSK、private key 完整貼出**
- **多 .conf 對照**：若使用者提供新版設定檔，可重跑 `scripts/parse_forti.py` 產生新版 JSON 後比對兩版差異

---

## 進階：產生視覺化報表

若使用者要求「整理一份報告」「我要給主管看」「做個總覽」，可額外執行：

```bash
python3 "<SKILL_DIR>/scripts/build_html.py" forti_data.json explorer.html
```

產出單一 HTML 互動儀表板（總覽、policy、風險、拓樸、diff）。
