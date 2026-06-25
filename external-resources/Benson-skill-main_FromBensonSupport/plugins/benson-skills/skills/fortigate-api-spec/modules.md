# FortiOS 7.2.13 API 模組索引

**Spec 檔位置**：`C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\FortiOS\FortiOS_7.12.13_API\`

**檔名規則**：`FortiOS 7.2 FortiOS 7.2.13 <Configuration|Monitor|Log> API <module>.json`

**讀取方式**：用 Read tool 加 `offset` + `limit` 分段讀（檔大會有大 json）

---

## 🔧 Configuration API（31 個）— `/api/v2/cmdb/...`

讀寫設定（policy/vip/address/interface 等）

| 模組 | 大小 | 主要 endpoint | 何時用 |
|---|---|---|---|
| **firewall** | 6.7M | `cmdb/firewall/policy`<br>`cmdb/firewall/vip`<br>`cmdb/firewall/address`<br>`cmdb/firewall/addrgrp`<br>`cmdb/firewall/service/custom` | 防火牆規則、VIP、address 物件、服務定義 |
| **system** | 7.1M | `cmdb/system/interface`<br>`cmdb/system/sdwan`<br>`cmdb/system/admin`<br>`cmdb/system/api-user`<br>`cmdb/system/dns` | 介面、SD-WAN、管理員、API user |
| **router** | 大 | `cmdb/router/static`<br>`cmdb/router/policy` | 靜態路由、路由策略 |
| **vpn** | 2.3M | `cmdb/vpn.ssl.settings`<br>`cmdb/vpn.ipsec.phase1-interface` | SSL VPN / IPsec |
| **user** | - | `cmdb/user/local`<br>`cmdb/user/group`<br>`cmdb/user/radius` | 本地使用者、群組、RADIUS |
| **ips** | - | `cmdb/ips/sensor` | IPS sensor 設定 |
| **antivirus** | 546K | `cmdb/antivirus/profile` | 防毒 profile |
| **webfilter** | - | `cmdb/webfilter/profile`<br>`cmdb/webfilter/urlfilter` | 網頁過濾 |
| **dnsfilter** | - | `cmdb/dnsfilter/profile` | DNS 過濾 |
| **application** | - | `cmdb/application/list` | 應用程式控管 |
| **dlp** | - | `cmdb/dlp.sensor` | 資料外洩防護 |
| **emailfilter** | - | - | Email 過濾 |
| **file-filter** | - | - | 檔案類型過濾 |
| **waf** | - | `cmdb/waf/profile` | Web 應用防火牆 |
| **wireless-controller** | 3.7M | `cmdb/wireless-controller/...` | 無線控制器 |
| **switch-controller** | - | - | 交換器控制 |
| **endpoint-control** | - | - | FortiClient 整合 |
| **automation** | - | `cmdb/system/automation-stitch` | 自動化 |
| **log** | 2.0M | `cmdb/log.disk.setting`<br>`cmdb/log.fortianalyzer.setting` | log 後端設定 |
| **alertemail** | 54K | `cmdb/alertemail.setting` | 告警 email |
| **report** | - | - | 報表設定 |
| **certificate** | - | `cmdb/vpn.certificate.local` | 憑證 |
| **authentication** | - | - | 認證 scheme |
| **icap** | - | - | ICAP 服務 |
| **ftp-proxy** | - | - | FTP proxy |
| **web-proxy** | - | - | Web proxy |
| **voip** | - | - | VoIP profile |
| **videofilter** | - | - | 視訊過濾 |
| **monitoring** | - | - | 監控設定 |
| **rule** | - | - | rule 物件 |
| **sctp-filter** | - | - | SCTP 協定 filter |
| **extension-controller** | - | - | extension control |

## 📊 Monitor API（28 個）— `/api/v2/monitor/...`

即時狀態查詢（不能改設定）

| 模組 | 主要 endpoint | 何時用 |
|---|---|---|
| **firewall** | `monitor/firewall/session`<br>`monitor/firewall/policy`<br>`monitor/firewall/policy-lookup` | **即時 sessions（最常用）**、policy 命中次數 |
| **system** | `monitor/system/status`<br>`monitor/system/interface/select`<br>`monitor/system/dhcp`<br>`monitor/system/vdom-resource`<br>`monitor/system/security-rating` | 系統資訊、**介面流量**、DHCP leases、CPU/mem、安全評分 |
| **network** | `monitor/network/arp`<br>`monitor/network/lldp/neighbors` | **ARP 表**、LLDP 鄰居 |
| **router** | `monitor/router/ipv4`<br>`monitor/router/ipv6` | 路由表 |
| **virtual-wan** | `monitor/virtual-wan/health-check`<br>`monitor/virtual-wan/members` | SD-WAN 健康狀態 |
| **vpn** | `monitor/vpn/ssl`<br>`monitor/vpn/ipsec` | VPN 連線狀態 |
| **user** | `monitor/user/firewall`<br>`monitor/user/banned` | 已認證使用者、被擋的使用者 |
| **ips** | `monitor/ips/anomaly`<br>`monitor/ips/rate-based-statistics` | IPS 即時狀態 |
| **utm** | `monitor/utm/blacklisted-certificates` | UTM 通用 |
| **fortiview** | `monitor/fortiview/statistics?report_by=...` | **TopN 分析**（top src/dst/app/threat）|
| **fortiguard** | `monitor/fortiguard/service-status` | FortiGuard 訂閱狀態 |
| **geoip** | `monitor/geoip/geoip-query` | GeoIP 查詢（IP → 國家）|
| **license** | `monitor/license/status` | 授權狀態 |
| **registration** | - | 設備註冊 |
| **log** | `monitor/log/forticloud`<br>`monitor/log/stats` | log 統計 |
| **webfilter** | `monitor/webfilter/category-quota` | webfilter 即時狀態 |
| **webcache** | - | - |
| **webproxy** | - | - |
| **wifi** | `monitor/wifi/client` | 無線使用者 |
| **switch-controller** | - | - |
| **extender-controller** | - | - |
| **endpoint-control** | - | - |
| **azure** | - | Azure 整合 |
| **nsx** | - | NSX 整合 |
| **wanopt** | - | WAN optimizer |
| **videofilter** | - | - |
| **web-ui** | - | - |
| **vpn-certificate** | - | - |

## 📋 Log API（5 個）— `/api/v2/log/<device>/<category>`

device = `memory` / `disk` / `fortianalyzer` / `forticloud`
category = `traffic/forward` / `ips` / `virus` / `webfilter` / `app-ctrl` / `event/system` 等

| 模組 | 何時用 |
|---|---|
| **memory** | RAM 內 log（最快、量少）|
| **disk** | 硬碟 log（看是否有開 disk logging）|
| **fortianalyzer** | 如果有 FortiAnalyzer，從這抓 |
| **forticloud** | FortiCloud 訂閱用 |
| **search** | 跨來源 log 搜尋 |

範例 URL：
- `/api/v2/log/memory/traffic/forward?rows=100`
- `/api/v2/log/memory/ips?rows=50`
- `/api/v2/log/disk/event/system`

---

## 快速 grep 範例

```bash
# 找 firewall 模組裡所有「vip」相關 endpoint
grep -i '"vip"' "C:\\Users\\benso\\Desktop\\CLAUDE COWORK\\PROJECTS\\FortiOS\\FortiOS_7.12.13_API\\FortiOS 7.2 FortiOS 7.2.13 Configuration API firewall.json"

# 找 session 監控的所有欄位
grep -i 'session' "C:\\Users\\benso\\Desktop\\CLAUDE COWORK\\PROJECTS\\FortiOS\\FortiOS_7.12.13_API\\FortiOS 7.2 FortiOS 7.2.13 Monitor API firewall.json"
```

## 進階：用 Grep tool

```
Grep:
  pattern: "realservers"
  path: "C:\Users\benso\Desktop\CLAUDE COWORK\PROJECTS\FortiOS\FortiOS_7.12.13_API"
  output_mode: "files_with_matches"
```

會告訴你 `realservers` 出現在哪些 spec 檔，然後針對性 Read。
