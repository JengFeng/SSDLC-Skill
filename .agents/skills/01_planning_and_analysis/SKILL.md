# 階段 01：規劃與需求分析 — Skill 配置

## 已導入 Skill
| 快捷 | Skill | 用途 |
|:---|:---|:---|
| 07 | grill-me | 需求釐清拷問（先讀後問、只問缺口、結論回寫） |
| 10 | langchain | 需求場景拆解、語意整理與鏈式呼叫 |

## 標準產出
- `inputs/user_requirement_raw.md` — 使用者原始口述需求
- `reg/grill_me_session.md` — grill-me 釐清對話紀錄
- `reg/requirement_tracker.md` — 統一需求追蹤表（REQ ID、日期、來源、優先級、描述、對應階段、狀態）
- `outputs/formal_requirements.md` — 正規化需求規格書

## 需求追蹤規範
所有需求統一記錄於 `reg/requirement_tracker.md` 單一表格。
欄位：REQ ID | 提出日期 | 來源 | 優先級 | 描述 | 對應設計 | 對應實作 | 對應測試 | 狀態
狀態值：✅ 已驗證 | ✅ 設計完成 | 🔄 開發中 | ⏳ 待規劃 | ❌ 已取消
優先級：P0 核心 | P1 重要 | P2 次要
