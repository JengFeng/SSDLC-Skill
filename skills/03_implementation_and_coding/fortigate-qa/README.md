# fortigate-qa skill

FortiGate 防火牆設定檔自然語言問答。

## 安裝

把這整個 `fortigate-qa` 資料夾複製到：
```
C:\Users\benso\AppData\Roaming\Claude\local-agent-mode-sessions\skills-plugin\<plugin-id>\<workspace-id>\skills\
```
（即現有 skills 旁邊，跟 `bcp-drill-doc`、`isms-audit-prep` 同一層）

重啟 Cowork 或開新對話即生效。

## 怎麼用

1. 把 FortiGate 設定檔 (`.conf` 或 `.conf.yaml`) 放到工作資料夾
2. 開始問問題，例如：
   - 「192.168.168.175 是什麼？」
   - 「我對外開了什麼 port？」
   - 「admin 帳號設定 OK 嗎？」
   - 「Policy #42 在幹嘛？」
   - 「VPN 設定安全嗎？」
   - 「有什麼資安風險？」

Claude 會自動執行 `scripts/parse_forti.py` 解析，再用 `scripts/query.py` 查詢。

## 檔案

- `SKILL.md` — Claude 用的觸發 / 工作流程說明
- `scripts/parse_forti.py` — .conf → JSON 解析器
- `scripts/query.py` — CLI 查詢工具
- `scripts/build_html.py` — 產出視覺化儀表板

## 不滿意？

直接刪掉這個資料夾即可，不會影響其他 skill。
