# FortiGate API 常用任務 Cookbook

10 個最常見的 API 任務範例（Python + requests）。寫程式前先看這裡。

## 0. 共用設定

```python
import requests, urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

FW = "https://59.120.223.190"
TOKEN = "..."     # 從 firewalls.json 讀
HDR = {"Authorization": f"Bearer {TOKEN}"}

def fapi(path):
    r = requests.get(f"{FW}/api/v2/{path}", headers=HDR, verify=False, timeout=30)
    r.raise_for_status()
    return r.json()
```

## 1. 撈系統資訊（驗證連線）

```python
s = fapi("monitor/system/status")["results"]
print(s["hostname"], s["version"], s["serial"], s["model_name"])
```

## 2. 撈所有 firewall policy

```python
policies = fapi("cmdb/firewall/policy")["results"]
for p in policies[:5]:
    print(p["policyid"], p.get("name"), p["srcintf"], p["dstintf"], p["action"])
```

## 3. 撈 VIP（含 SLB realservers，**重要**）

```python
vips = fapi("cmdb/firewall/vip")["results"]
for v in vips:
    vt = v.get("type", "static-nat")
    if vt == "server-load-balance":
        # SLB 的對映目標在 realservers 子欄位
        for rs in v["realservers"]:
            print(v["name"], "→", rs["ip"], rs["port"], rs["status"])
    else:
        # 一般 NAT VIP
        for m in v["mappedip"]:
            print(v["name"], "→", m["range"], v.get("mappedport"))
```

## 4. 取得 SD-WAN zone 名稱（重要：判斷 WAN 介面用）

```python
sdwan = fapi("cmdb/system/sdwan")["results"]
if sdwan["status"] == "enable":
    zones = [z["name"] for z in sdwan.get("zone", [])]
    # 例如 ['virtual-wan-link']
    # 把這些 zone 加進 WAN 介面集合，否則 policy srcintf/dstintf 比對會失敗
```

## 5. 撈即時 sessions（含國家 / NAT 對映）

```python
sess = fapi("monitor/firewall/session?count=2000")["results"]["details"]
for s in sess[:5]:
    print(s["saddr"], "→", s["daddr"], f"port {s['dport']}/{s['proto']}",
          "country:", s.get("country"),
          "internal mapped:", s.get("dnaddr"),
          "policy:", s.get("policyid"))
```

關鍵欄位：
- `saddr`, `sport`：來源 IP/port（外部，如果是 inbound）
- `daddr`, `dport`：目的 IP/port（VIP 的外部 IP，如果是 inbound）
- `dnaddr`, `dnport`：**對映後的內部 IP/port**（重要）
- `snaddr`：NAT 後的對外 IP（如果是 outbound）
- `country`：對方國家
- `sentbyte`, `rcvdbyte`, `duration`
- `srcintf`, `dstintf`, `policyid`

## 6. 介面流量（計算 bps）

```python
import time

def sample():
    return {n: itf for n, itf in fapi("monitor/system/interface/select?include_vlan=true")["results"].items()}

s1 = sample()
time.sleep(15)
s2 = sample()

for name in s2:
    if "wan" in name:
        prev = s1.get(name)
        if prev:
            dt = 15  # 秒
            rx_bps = (s2[name]["rx_bytes"] - prev["rx_bytes"]) * 8 / dt
            tx_bps = (s2[name]["tx_bytes"] - prev["tx_bytes"]) * 8 / dt
            print(name, f"RX {rx_bps/1e6:.2f} Mbps  TX {tx_bps/1e6:.2f} Mbps")
```

## 7. 查 ARP 表（看主機是否還活著）

```python
arp = fapi("monitor/network/arp")["results"]
for entry in arp:
    print(entry["ip"], entry["mac"], entry["interface"])

# 比對某內部 IP 是否還活著
target_ip = "192.168.168.167"
alive = any(e["ip"] == target_ip for e in arp)
```

## 8. 解析 address 物件（含群組遞迴）

```python
addrs = {a["name"]: a for a in fapi("cmdb/firewall/address")["results"]}
grps = {g["name"]: g for g in fapi("cmdb/firewall/addrgrp")["results"]}

def resolve(name, depth=0):
    if depth > 5: return []
    if name == "all": return ["ALL"]
    a = addrs.get(name)
    g = grps.get(name)
    if a:
        t = a.get("type", "ipmask")
        if t == "ipmask":
            return [a["subnet"].replace(" ", "/")]
        elif t == "iprange":
            return [f"{a['start-ip']}-{a['end-ip']}"]
        elif t == "geography":
            return [f"GEO:{a['country']}"]
        elif t == "fqdn":
            return [f"FQDN:{a['fqdn']}"]
        return []
    if g:
        result = []
        for m in g.get("member", []):
            mname = m["name"] if isinstance(m, dict) else m
            result.extend(resolve(mname, depth+1))
        return result
    return []
```

## 9. 撈 IPS 攻擊事件

```python
ips_log = fapi("log/memory/ips?rows=100")
events = ips_log["results"]
print(f"近期 IPS 攻擊事件: {len(events)} 筆")

# 注意：如果回傳 0 筆，可能是因為「policy 沒掛 ips-sensor」→ 防火牆沒攔到任何攻擊
```

## 10. POST 範例（建 address 物件）

```python
new_addr = {
    "name": "Office_IP",
    "subnet": "211.20.175.252 255.255.255.255",
    "comment": "Auto created"
}
r = requests.post(
    f"{FW}/api/v2/cmdb/firewall/address",
    headers=HDR,
    json=new_addr,
    verify=False
)
print(r.json())
```

⚠️ POST/PUT/DELETE 需要 write 權限的 API user，不是 readonly。Benson 目前的 token 是 readonly。

---

## 常見錯誤排查

| 症狀 | 原因 | 解法 |
|---|---|---|
| HTTP 401 | token 錯 / 沒帶 Bearer | 檢查 header 寫法 |
| HTTP 403 | 來源 IP 不在 trusted host | 把你 IP 加進 API user 的 trusthost |
| SSL 錯誤 | FortiGate 自簽憑證 | `verify=False` + 把 urllib3 警告關掉 |
| 連線逾時 | 防火牆不可達 | 先 ping/telnet 443 確認網路通 |
| `policy` 抓不到 inbound/outbound | dstintf 用 `virtual-wan-link` 而你只判斷 `wan1`/`wan2` | 撈 sdwan zones 加進 WAN set |
| VIP 對映目標看不到 | SLB 類型不在 `mappedip` 而在 `realservers` | 看 `v["type"]` 分別處理 |

## 寫 code 時的 SOP

```
1. 先讀 modules.md 找模組
2. 用 Grep 在對應 .json 找確切 endpoint / 欄位
3. 寫 code（參考本檔範例）
4. 用 readonly token 驗證
5. 如果有疑問，去 Benson 的 dashboard/app.py 找參考實作
```
