# REA provider 與 SSDLC 證據契約

## 執行版本與限制

檢視版本：`rea-agents 6.4.0`，commit `bb96afdbe32f5318d57fcb00099191c5a7712f53`。一般 Node 要求 `^22.19.0 || ^24.11.0 || >=26.0.0`；SQLite 另需 Node 24.15+。先核對固定版本的 [安裝文件](https://github.com/morluto/rea/blob/bb96afdbe32f5318d57fcb00099191c5a7712f53/docs/installation.md)。

操作範例（路徑為示意；首次 npx 可能下載套件）：

```powershell
npx -y rea-agents@6.4.0 inspect-web-network-capture 'E:\REA-POC\sanitized.har' har --json
npx -y rea-agents@6.4.0 inspect-managed-artifact 'E:\REA-POC\Api.dll' --json
```

保存 stdout／stderr 與結束碼至新的受控檔案；失敗、部分或截斷結果仍記 limitations，不視為完整分析。若自動化執行，使用 subprocess argument array，避免 shell 插值；敏感值不放命令列。

.NET 靜態解析 metadata／CIL，不載入組件，不保證還原 C#；單檔 .NET、NativeAOT、IL2CPP 不沿用一般 managed 路徑。APK 需要適用 full JDK／headless JADX 與平台 bundle。Windows Ghidra 是 experimental、唯讀、限定 native x86/x64 PE 等 P0 範圍；Native Windows 新程序 scenario capture 不支援，WSL 不等同 Windows 程序擷取。沒有引擎時保持 unknown。

MCP annotations 是提示，不是授權防線。後續接 MCP 時按實際 effects 檢查操作範圍；本版沒有自動註冊 MCP，也沒有硬性攔截目標程式執行。

## 來源 manifest

以下都是 SSDLC 自建格式，非 REA 原始 schema。檔案位置相對案例根目錄，檔案來源需先複製到該案例的受控 inputs；共享前先去識別化。遠端黑箱目標使用不含憑證的識別與環境說明。

`inputs/reverse_input_manifest.json`：

```json
{
  "schema_version": 1,
  "source_available": false,
  "sources": [
    {"source_id": "SRC-001", "kind": "capture", "path": "inputs/sanitized.har", "sha256": "實際檔案 SHA-256"}
  ],
  "scope": {"allowed_operations": ["offline_inspect"], "environment": "離線測試案例"}
}
```

`kind` 支援 artifact、capture、document、configuration、log、blackbox；前五者必填 path／sha256，blackbox 必填 target／environment。只有黑箱也能使用本契約，provider 可為人工或其他工具，REA 非必要。

## Phase 03 產物

`outputs/phase_03_reverse/evidence_manifest.json`：

```json
{
  "schema_version": 1,
  "records": [
    {
      "evidence_id": "EV-001",
      "source_id": "SRC-001",
      "provider": "rea-agents@6.4.0",
      "operation": "inspect-web-network-capture",
      "evidence_kind": "historical_capture",
      "confidence": "observed",
      "authority": "historical-reference",
      "environment": "錄製版本未知；離線解析",
      "limitations": ["無法代表目前服務"],
      "relationship_coverage": "partial"
    }
  ]
}
```

摘要 evidence_id 可為自建 ID；如有 canonical REA record，另存 `origin_evidence_id` 與受控 `record_path`。REA 的 nullable subject／environment／profile 原樣保存，不補造；來源 ID 在本地摘要內另行關聯。摘要的 environment 是分析／錄製說明，不覆寫原 canonical environment。authority、confidence 保留上游原值。

`evidence_kind`：document_claim、static_observation、historical_capture、controlled_execution、analyst_inference。受控執行另外必填 execution.version／environment／action／expected／actual，靜態 observed 不得直接轉成 controlled_execution。不能只為通過檢查而補寫未執行結果。

`findings_index.json`：`{"findings":[{"finding_id":"F-001","statement":"在紀錄中觀察到 GET 請求","evidence_ids":["EV-001"],"status":"candidate"}]}`。

`unknowns.json`：`{"unknowns":[{"unknown_id":"U-001","question":"服務端如何存取資料？","status":"open","evidence_ids":[],"resolution_evidence_ids":[]}]}`。狀態為 open／resolved；resolved 必須引用支持證據，但不代表業務核准。

## 產物覆蓋

Phase 03 及 Phase 02 分別在自己的輸出目錄建立 coverage.json。每份現行 IO 中 required=true 的產物都需一項，另可記可選產物：

```json
{
  "products": [
    {"product": "api_routes.json", "status": "partial", "reason": "僅取得單次錄製", "evidence_ids": ["EV-001"], "unknown_ids": []},
    {"product": "table_list.json", "status": "unknown", "reason": "沒有服務端或資料庫證據", "evidence_ids": [], "unknown_ids": ["U-001"]}
  ]
}
```

status 為 supported／partial／unknown／not_observed／not_applicable。supported／partial 必須有 evidence_ids；unknown／not_observed 必須有 unknown_ids；not_applicable 必須有理由，不能用於尚未知道是否存在的資料表。所有狀態必填 reason；partial 應在理由或未知清單說明範圍。覆蓋表可以包含 metadata 產物自身，支持來源可引用同份 evidence_manifest。

保留既有產物檔名；缺資料的 JSON 可為空清單，Markdown 寫明未知及原因。沒有 DB 證據時 ER 文件只是未知說明，不畫虛構 ER；不要捏造 handler、行號、百分比或 DDL。檢查器不會從空清單推論系統不存在功能。

## 檢查及驗收

```powershell
python scripts/check_no_source_evidence.py --project 'E:\REA-POC' --phase 03
python scripts/check_no_source_evidence.py --project 'E:\REA-POC' --phase 02
```

不需 REA runtime 即可檢查已交付證據契約。此檢查驗證欄位、來源指紋及引用完整性，不驗證反編譯正確性、來源發布者身分或安全控制。正式階段核准仍由既有 SSOT／Evaluator 處理。

上游來源：[Evidence schema](https://github.com/morluto/rea/blob/bb96afdbe32f5318d57fcb00099191c5a7712f53/src/domain/evidence.ts)、[MCP 契約](https://github.com/morluto/rea/blob/bb96afdbe32f5318d57fcb00099191c5a7712f53/docs/mcp-contracts.md)、[HAR 排除限制](https://github.com/morluto/rea/blob/bb96afdbe32f5318d57fcb00099191c5a7712f53/docs/web-network-captures.md)。REA-authored code 是 MIT；本版只引用來源，未複製上游程式碼。
