// web-sqa 共用 JS 片段 — 貼給 Claude in Chrome MCP 的 javascript_tool 執行
//
// 使用方式：複製對應函式貼到 javascript_tool.text，改參數後執行

// =============================================================
// SECTION A — 批次 fetch 頁面 + DOM 結構檢查
// =============================================================

/**
 * batchFetchPages(pages)
 * 一次 fetch 多個頁面，回傳每個頁面的狀態碼 / 大小 / 關鍵 DOM 元素計數
 */
async function batchFetchPages(pages) {
  const out = [];
  for (const p of pages) {
    try {
      const r = await fetch('/service/' + p, {credentials:'include', cache:'no-store'});
      const t = await r.text();
      out.push({
        page: p,
        status: r.status,
        bytes: t.length,
        aside: (t.match(/<aside/g)||[]).length,
        shells: (t.match(/class="app-shell"/g)||[]).length,
        titles: (t.match(/<title>/g)||[]).length,
        sidebar: t.includes('app-sidebar'),
        topbar: t.includes('app-topbar'),
        main: t.includes('app-main'),
        logout: t.includes('登出'),
        deny: t.includes('denied-card'),
        csrf: /name="csrf_token"/.test(t)
      });
    } catch (e) {
      out.push({ page: p, error: String(e) });
    }
  }
  return out;
}

// =============================================================
// SECTION B — 敏感路徑 404 驗證
// =============================================================

async function checkSensitivePaths(paths) {
  const out = [];
  for (const p of paths) {
    const r = await fetch(p, {cache:'no-store', headers:{'Cache-Control':'no-cache'}});
    const t = await r.text();
    out.push({
      path: p,
      status: r.status,
      bytes: t.length,
      leak: r.status !== 404 && r.status !== 403 && t.length > 200
    });
  }
  return out;
}

// =============================================================
// SECTION C — Security Headers 檢查
// =============================================================

async function checkSecurityHeaders(url = '/service/index.php') {
  const r = await fetch(url, {credentials:'include', cache:'no-store'});
  const h = {};
  for (const [k, v] of r.headers.entries()) h[k.toLowerCase()] = v;
  return {
    url,
    status: r.status,
    headers: h,
    check: {
      hsts: !!h['strict-transport-security'],
      xcto: h['x-content-type-options'] === 'nosniff',
      xfo: (h['x-frame-options'] || '').toUpperCase() === 'SAMEORIGIN',
      referrer: !!h['referrer-policy'],
      csp: !!(h['content-security-policy'] || h['content-security-policy-report-only']),
      permissions: !!h['permissions-policy'],
      xss: h['x-xss-protection'] === '1; mode=block',
      no_xpoweredby: !h['x-powered-by'],
      no_server_version: !(/nginx\/\d/i.test(h['server'] || ''))
    }
  };
}

// =============================================================
// SECTION D — Cookie 屬性（有限，瀏覽器會擋 Set-Cookie）
// =============================================================

function checkCookieProps() {
  // 只能看 JS 可見的 cookie（= 沒 HttpOnly 的）
  const jsVisible = document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(Boolean);
  return {
    js_visible_cookies: jsVisible,
    // 若 PHPSESSID 出現在這裡 → 沒 HttpOnly → Critical
    phpsessid_exposed: jsVisible.includes('PHPSESSID')
  };
}

// =============================================================
// SECTION E — DOM 重複 id / inline handler 檢查
// =============================================================

function scanDomAntipatterns() {
  const idCount = {};
  document.querySelectorAll('[id]').forEach(el => {
    idCount[el.id] = (idCount[el.id] || 0) + 1;
  });
  const dupIds = Object.entries(idCount).filter(([k, v]) => v > 1);

  const inlineHandlers = [];
  document.querySelectorAll('*').forEach(el => {
    for (const a of el.attributes) {
      if (a.name.startsWith('on')) inlineHandlers.push({ tag: el.tagName, attr: a.name, id: el.id, cls: el.className });
    }
  });

  return { duplicate_ids: dupIds, inline_handlers: inlineHandlers.slice(0, 30) };
}

// =============================================================
// SECTION F — XSS payload 注入測試
// =============================================================

async function probeXSS(urlPattern, paramName, payloads) {
  // payloads default
  payloads = payloads || [
    "<script>alert('xss')</script>",
    "\"><img src=x onerror=alert(1)>",
    "javascript:alert(1)",
    "';alert(1);//"
  ];
  const out = [];
  for (const p of payloads) {
    const u = urlPattern.replace('{}', encodeURIComponent(p));
    const r = await fetch(u, {credentials:'include', cache:'no-store'});
    const t = await r.text();
    out.push({
      url: u,
      status: r.status,
      reflected_raw: t.includes(p),  // payload 原樣出現 → 🔴
      reflected_escaped: t.includes(p.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
    });
  }
  return out;
}

// =============================================================
// SECTION G — SQLi 探測
// =============================================================

async function probeSQLi(urlPattern, payloads) {
  payloads = payloads || [
    "' OR '1'='1",
    "1 OR 1=1",
    "'; DROP TABLE users--",
    "\" UNION SELECT 1--"
  ];
  const out = [];
  for (const p of payloads) {
    const u = urlPattern.replace('{}', encodeURIComponent(p));
    const r = await fetch(u, {credentials:'include', cache:'no-store'});
    const t = await r.text();
    const leaks = [
      /PDOException/i, /SQLSTATE/i, /syntax error/i, /mysqli?_/i, /mysql_\w+/i, /ORA-\d+/i, /sqlite3\./i
    ];
    out.push({
      url: u,
      status: r.status,
      leak_indicators: leaks.filter(re => re.test(t)).map(r => r.source)
    });
  }
  return out;
}

// =============================================================
// SECTION H — 重複狀態抓取（debug 用）
// =============================================================

function snapshotCurrentState() {
  return {
    url: location.href,
    title: document.title,
    user: document.querySelector('.welcome-text .user-name')?.textContent?.trim(),
    role: document.querySelector('.welcome-text .role-badge')?.textContent?.trim(),
    impersonating: !!document.querySelector('.impersonation-banner'),
    sidebar_active: document.querySelector('.app-sidebar .nav-link.active')?.textContent?.trim(),
    page_title_topbar: document.querySelector('.app-topbar h1')?.textContent?.trim(),
    alerts: Array.from(document.querySelectorAll('.alert')).map(a => ({
      type: a.className, text: a.textContent.trim().slice(0, 100)
    }))
  };
}

// =============================================================
// USAGE HINT
// =============================================================
// 不要整份貼進 javascript_tool — JS 語法要是 expression（不用 return），
// 所以實際使用時包成 IIFE：
//
// (async () => {
//   // 複製上面某個函式內容到這裡
//   return await batchFetchPages(['index.php', 'stations.php']);
// })()
