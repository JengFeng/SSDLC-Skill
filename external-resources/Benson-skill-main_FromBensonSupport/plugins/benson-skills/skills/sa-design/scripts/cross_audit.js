// sa-design 內建：跨文件交叉一致性自檢（Workflow 腳本）— v2 強化版
// =====================================================================
// v2 改了什麼（2026-06）：
//   問題：v1 七維度全部丟給 LLM agent 語意判斷，會「看心情」漏抓 —— 山豬湖案實測
//        漏了「ER 漏畫 ROLE_PERMISSION / FN-FS 無對照表 / 九大模組懸空引用 / 數字口徑」
//        等本該被維度 3/5/6 抓到的結構問題。
//   解法：能用程式硬判的，先用 preflight() 正則硬掃（100% 穩定、不靠 LLM 自覺），
//        硬掃結果連同 LLM 語意稽核一起進報告。LLM 只負責程式判不了的語意層。
//   另補 3 個維度：受控詞彙(16類)、狀態欄位完整性、商務範圍對齊。
// 用法：① 改 FILES 路徑 ② 用 Workflow 以 {scriptPath:"<本檔>"} 啟動
// =====================================================================
import { readFileSync } from 'node:fs'

export const meta = {
  name: 'sa-cross-audit',
  description: '系統開發文件跨文件交叉一致性自檢（程式硬檢查 + LLM 語意，只抓結構性）',
  phases: [{ title: 'Preflight' }, { title: 'CrossAudit' }],
}

// ←←← 改這裡：本案要交叉比對的文件「絕對路徑」（給 preflight 程式讀；HTML/純文字）
const FILES = {
  '00b_SRS':   '/絕對路徑/00b_軟體需求規格書SRS.html',
  '03_SA':     '/絕對路徑/03_SA系統分析設計.html',
  '04_FS':     '/絕對路徑/04_功能規格書.html',
  '05_SCR':    '/絕對路徑/05_畫面規格書.html',
  '06_WBS':    '/絕對路徑/06_開發任務拆解WBS.html',
  '07_PLAN':   '/絕對路徑/07_測試計畫.html',
  '08_CASE':   '/絕對路徑/08_測試案例.html',
  '09_UAT':    '/絕對路徑/09_驗收文件.html',
}
const DOCS = `要交叉比對的文件（請用 Read/grep 實際讀內容，不要臆測）：\n` +
  Object.entries(FILES).map(([k, v]) => `- ${k}: ${v}`).join('\n')

// ── 小工具：安全讀檔、去標籤取純文字、抓代號集合 ───────────────────
const read = p => { try { return readFileSync(p, 'utf8') } catch { return '' } }
const plainText = h => h.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ')
const codes = (s, re) => [...new Set((s.match(re) || []))].sort()

// =====================================================================
// ★ Preflight：程式化硬檢查（正則，100% 穩定，不靠 LLM）
//   只回報「鐵證型」結構問題；查無 → 該項 pass。
// =====================================================================
function preflight() {
  const T = Object.fromEntries(Object.entries(FILES).map(([k, p]) => [k, plainText(read(p))]))
  const out = []
  const add = (severity, docs, problem, evidence, fix) =>
    out.push({ dimension: 'PREFLIGHT(程式硬檢查)', severity, docs, problem, evidence, fix })

  // [P1] ER 圖實體 vs 資料字典表名：字典有、ER 圖沒畫 = 疑似漏畫
  //   ⚠ 純正則難做到零誤報（表名格式活、舊表名殘留在「合併說明」、字根誤判）。
  //   故收緊兩道：①白名單排 SQL/HTTP/縮寫雜訊 ②候選詞附近須有「PK」(真表定義特徵)；
  //   仍標「疑似·需人工確認」而非鐵證，把最終判斷留給人（避免假精準）。
  const sa = T['03_SA'] || ''
  if (sa) {
    const NOISE = new Set(['NVARCHAR','DATETIME','DECIMAL','INT','BIT','IDENTITY','GETDATE','PK','FK','UK',
      'CRUD','JWT','HTTPS','HTTP','JSON','NULL','HTML','POST','GET','PUT','DELETE','API','DATA','DATE',
      'SDLC','YYYY','MAX','CLIENT','VIEW','MVC','CDN','NAS','SQL','DMZ','IIS','LINE','RECORD','RESULT','TARGET'])
    const cand = codes(sa, /\b[A-Z][A-Z_]{3,}\b/g).filter(x => !NOISE.has(x))
    // 真表特徵：該詞附近 200 字內有 PK（欄位定義）
    const realTables = cand.filter(t => {
      const re = new RegExp(t, 'g'); let m
      while ((m = re.exec(sa))) { if (/PK/.test(sa.slice(m.index, m.index + 200))) return true }
      return false
    })
    const erBlock = (read(FILES['03_SA']).match(/erDiagram[\s\S]*?(?:<\/|```|"er_)/i) || [''])[0].toUpperCase()
    const missing = realTables.filter(t => erBlock && !erBlock.includes(t))
    if (erBlock && missing.length)
      add('中', '03_SA', 'ER 圖疑似漏畫資料字典中的表（需人工確認，可能含舊表名殘留）',
        `字典疑似有、erDiagram 未見：${missing.join(', ')}（請排除「合併原 XXX」說明裡的舊表名）`,
        '逐一確認：現役表→補進 ER；舊表名/設定表→忽略或註明')
  }

  // [P2] 雙編碼 FN↔FS：兩套碼都存在，但沒有任何一處讓 FN 與 FS「鄰近並列」= 缺對照
  //   收緊：不靠「對照表」三字（太寬會誤判），改判 FN\d{2} 與 FS-X\d{2} 是否在 ±40 字內共現
  const hasFN = Object.values(T).some(t => /FN\d{2}/.test(t))
  const hasFS = Object.values(T).some(t => /FS-[A-Z]\d{2}/.test(t))
  const hasRealMap = t => {
    const re = /FN\d{2}/g; let m
    while ((m = re.exec(t))) {
      if (/FS-[A-Z]\d{2}/.test(t.slice(Math.max(0, m.index - 40), m.index + 40))) return true
    }
    return false
  }
  if (hasFN && hasFS && !Object.values(T).some(hasRealMap))
    add('高', '00b_SRS/04_FS', '存在 FN 與 FS 兩套編碼，但沒有任何一處讓兩者並列對照',
      '偵測到 FNxx 與 FS-Xxx 並用，但全文無 FN/FS 鄰近共現', '在 SRS 5.3 或功能規格首節補 FN↔FS 對照表')

  // [P3] 跨文件名詞錨點：某文件叫人「對齊 X」，但來源文件無 X = 懸空引用
  for (const [k, t] of Object.entries(T)) {
    const m = t.match(/[對照]齊?[^。\n]{0,8}([一二三四五六七八九十\d]+大模組)/)
    if (m) {
      const anchor = m[1]
      const existsInSrc = (T['00b_SRS'] || '').includes(anchor)
      if (!existsInSrc)
        add('高', `${k} ↔ 00b_SRS`, `「${anchor}」是懸空錨點：引用文件叫人對齊它，但來源(SRS)無此詞`,
          `${k} 出現「${anchor}」；SRS 全文無此詞（實際為 FN/FS 編碼）`,
          `改引「需求追溯表 R-xx」或「FN/FS 清單」，刪掉不存在的「${anchor}」`)
    }
  }

  // [P4] 數字口徑：同一指標跨文件出現兩種值（表數/API數/功能數/案例數）
  const grab = (label, re) => {
    const vals = {}
    for (const [k, t] of Object.entries(T)) {
      const mm = [...t.matchAll(re)].map(x => x[1])
      if (mm.length) vals[k] = [...new Set(mm)]
    }
    const flat = [...new Set(Object.values(vals).flat())]
    if (flat.length > 1)
      add('中', Object.keys(vals).join('/'), `「${label}」跨文件出現多個數值`,
        Object.entries(vals).map(([k, v]) => `${k}:${v.join('/')}`).join('；'),
        `統一${label}口徑、附清單，單一真實來源`)
  }
  grab('資料表數', /(\d+)\s*張表/g)
  grab('API 支數', /(\d+)\+?\s*支\s*API/g)
  grab('測試案例數', /(\d+)\s*條\s*(?:TC|測試案例)/g)

  // [P5] 版號一致：各文件抬頭 vX.Y 是否同一版
  const vers = {}
  for (const [k, t] of Object.entries(T)) {
    const v = (t.match(/v\d+\.\d+/i) || [])[0]
    if (v) vers[k] = v
  }
  if (new Set(Object.values(vers)).size > 1)
    add('中', Object.keys(vers).join('/'), '各文件版號不一致',
      Object.entries(vers).map(([k, v]) => `${k}:${v}`).join('；'), '全套版號同步')

  return out
}

// =====================================================================
// LLM 語意稽核（沿用 v1，補 3 維度）
// =====================================================================
const RULES = `
規則（收緊·只抓結構性）：
- 只報「結構性」不一致：①代號對不上②欄位/資料表/JSON 結構各文件不同(含 ER 圖漏欄 vs 資料字典)③API 端點各文件不同④追溯鏈斷點⑤同一數字兩種值⑥決策狀態矛盾。
- 絕對不要報純風格：同義詞/量詞(「16 表」vs「16 類」)、章節/案例排序、標點、贅字、潤飾——一律略過、判 consistent=true。
- 判準：工程師照不同文件做會「做出不同的東西/找不到對應/追溯斷」才報。
- 每個 issue 附證據(引用各文件衝突的實際文字)。找不到 → consistent=true、issues=[]。
- 嚴重度：高=害工程師做錯/追溯斷；中=結構性但影響較小；低=從嚴，能不報就不報。`

const SCHEMA = {
  type: 'object', required: ['dimension', 'consistent', 'issues'],
  properties: {
    dimension: { type: 'string' }, consistent: { type: 'boolean' },
    issues: { type: 'array', items: { type: 'object',
      required: ['severity', 'docs', 'problem', 'evidence', 'fix'],
      properties: {
        severity: { type: 'string', enum: ['高', '中', '低'] },
        docs: { type: 'string' }, problem: { type: 'string' },
        evidence: { type: 'string' }, fix: { type: 'string' },
      } } },
  },
}

const DIMS = [
  { key: '功能編碼', q: 'FN(SRS)／FS(功能規格)／SCR(畫面)／TC(測試分組) 是不是同一批功能、對得上；有沒有少/多；雙編碼有無對照表；功能總數(FN 軸 vs FS 軸)說法是否自洽。' },
  { key: '畫面追溯', q: '功能/測試/SRS 引用的畫面，畫面規格 SCR 清單裡都真的有嗎(雙向)；反之每個 SCR 都對得到功能嗎；二期/不出畫面的功能各文件定位一致嗎。' },
  { key: '資料表與JSON欄位', q: '資料表名稱與關鍵 JSON 欄位各文件一致嗎；★ER 圖欄位是否與同檔資料字典一致(常漏欄/漏表)。' },
  { key: 'API端點', q: 'SA/SRS/功能規格/畫面規格/WBS 的 API 端點與支數一致嗎；被引用的端點 SA 是否有定義。' },
  { key: '需求追溯鏈', q: '需求 R-* → 功能 FN/FS → 畫面 SCR → 測試 TC/UAT 是否每條串得起來、不斷點。' },
  { key: '數字一致', q: '功能數/資料表數/畫面數/測試案例數/UAT數/工時/版號，跨文件有沒有兩種值；抬頭版號與修訂紀錄是否一致。' },
  { key: '狀態機與基準決議', q: '狀態機各文件描述一致嗎；專案基準決議(範圍/MVP、已定案 vs 待確認)各文件同一狀態嗎。' },
  // ── v2 新增 3 維度 ──
  { key: '受控詞彙完整性', q: '★文件反覆引用的「受控清單」(如 0611 版 16 類巡檢表、角色清單、頻率清單)，是否在至少一份文件「完整列出明細＋對照表」，而非只報數量？若全文只出現「16 類」字樣卻無 16 項明細清單→報缺漏。計數陷阱(如緊急類含頓號是否算 1 表)是否明確標註？' },
  { key: '狀態欄位完整性', q: '★凡功能規格要求「狀態判定」的(如簽核未齊不可送、工單狀態流轉、逾期判定)，資料字典是否有對應的「結構化狀態/時間欄位」可供程式判定？若只存姓名/文字字串、無 status/時間欄位→報結構落差(驗證邏輯無欄位支撐)。' },
  { key: '商務範圍對齊', q: '★報價單/經費表的收費項目，與 SRS/WBS/功能規格的「本期交付範圍」是否對齊？有沒有「收費項列為二期/本期不交付」或「綑綁項夾了二期子項卻未切邊界」？(此維度跨商務文件，需一併讀報價/經費表)' },
]

// =====================================================================
phase('Preflight')
const pf = preflight()
log(`程式硬檢查：${pf.length} 個鐵證型結構問題`)

phase('CrossAudit')
const results = (await parallel(DIMS.map(d => () =>
  agent(`${d.q}\n\n${DOCS}${RULES}`, { label: `audit:${d.key}`, phase: 'CrossAudit', schema: SCHEMA })
))).filter(Boolean)

const llmIssues = results.flatMap(r => (r.issues || []).map(i => ({ dimension: r.dimension, ...i })))
const issues = [...pf, ...llmIssues]
const order = { '高': 0, '中': 1, '低': 2 }
issues.sort((a, b) => order[a.severity] - order[b.severity])
log(`交叉稽核合計：硬檢查 ${pf.length} ＋ 語意 ${llmIssues.length} ＝ ${issues.length}（高:${issues.filter(i=>i.severity==='高').length} 中:${issues.filter(i=>i.severity==='中').length} 低:${issues.filter(i=>i.severity==='低').length}）`)
return {
  preflightIssues: pf.length,
  dimensionsChecked: results.length,
  totalIssues: issues.length,
  byDimension: results.map(r => ({ dimension: r.dimension, consistent: r.consistent, count: (r.issues||[]).length })),
  issues,
}
