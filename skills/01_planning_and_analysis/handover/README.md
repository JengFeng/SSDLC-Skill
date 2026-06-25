# Handover Skill — 快速上手

跨 session / 裝置 / Agent 的 AI 工作記憶系統。

## 安裝

1. 把整包 `handover-skill/` 資料夾複製到:
   - macOS / Linux:`~/.claude/skills/handover/`
   - 或依你 Claude Code 設定的 skills 目錄

2. 確認系統有 `sqlite3` 和 `python3`:
   ```bash
   sqlite3 --version
   python3 --version
   ```

3. 第一次在任一專案下觸發 skill 時,會自動建 `{專案}/.handover/handover.db`。

## 三階段模式(核心概念)

預設 `learning`,可用 `/handover mode <mode>` 切換。

| 模式 | 行為 | 適用時機 |
|---|---|---|
| `learning` | 偵測到重點時在對話中問你要不要記 | 剛裝好前 1-2 週 |
| `auto` | 直接記,寫完通知你一聲 | 你信任 skill 判斷後 |
| `silent` | 完全靜默,只在 session 結束時摘要確認 | 完全信任後 |

切換指令:
```
/handover mode auto
/handover mode silent
/handover mode learning
```

## 常用指令

| 指令 | 作用 |
|---|---|
| `/handover` | 手動觸發寫入當前 session |
| `/handover show` | 看當前 session 記了什麼 |
| `/handover pull` | 拉最近未結的 handover |
| `/handover list` | 列最近 30 天 open |
| `/handover list --all` | 列全部含 archived |
| `/handover close` | 手動關閉 |
| `/handover edit <欄位>` | 修正某欄位 |
| `/handover digest` | 產出月度 / 年度 digest |

## 資料庫位置

每個專案一個 DB:
- 預設:`{git_root}/.handover/handover.db`
- 非 git repo:`{當前資料夾}/.handover/handover.db`
- Fallback:`~/.handover/handover.db`

## Schema

**Layer 1 — 跨 agent 通用**(任何 AI 都能讀):
- topic、session_type、status
- completed、decisions、blocked、next_steps
- lessons_learned、attempted_approaches、conversation_summary

**Layer 2 — 環境專屬**:
- device、branch、working_dir、test_status、subscription_account、extra_json

## 保留策略

- **365 天**內 open 狀態,之後 archive(不刪除)
- Archived 資料隨時可用 `--all` 參數撈
- Digest 永久保留

## Digest

**月度**:每月 1 號 skill 主動問一次
**年度**:每年 1/15 或你說「X 專案結案了」時

產出位置:`.handover/digests/YYYY-MM.md` / `YYYY-annual.md`

## 試試看

```bash
# 手動測試寫入
cat > /tmp/test.json <<EOF
{
  "topic": "測試主題",
  "session_type": "admin",
  "completed": "測試寫入",
  "next_steps": "驗證讀取"
}
EOF
bash scripts/handover_write.sh --db ./.handover/handover.db --json /tmp/test.json

# 讀取
bash scripts/handover_pull.sh --db ./.handover/handover.db
```

## 問題排解

**Q: sqlite3 not found**
→ macOS 預設有;Linux 跑 `apt install sqlite3`

**Q: Python 錯誤**
→ 需要 Python 3.6+,macOS / Linux 預設都有

**Q: skill 都不主動跑**
→ 確認 SKILL.md 在正確位置;Claude Code 要看得到 skill 描述
