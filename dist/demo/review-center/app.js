/* 审核中心 · 前端。没有依赖，读 /api/cards，把决定 POST 回去。线上要先登录（/api/session 说 auth 为真时弹登录框）。
   2026-11-14 改版：窄屏（≤900px：手机、桌面 App 的浏览器窗格）队列一页、单张卡一页；给结论先弹确认面板；
   项目是第一层标签，agent 是它下面的第二层；意见里能贴图；看大图能放大、拖动、滑动翻图。
   2026-11-15 二次改版：项目和 agent 从一排横着滑的药丸改成竖着的项目栏（#qnav）：宽屏（≥1280）在最左边一直展开，
   窄一些收成队列顶上一行「筛选」，点开才展开。队列列表在 #qlist。字号只用 style.css 里的那一套阶梯。
   2026-11-15 下午（用户：左边两栏一个能收一个不能收，看着怪；照 Claude / Notion 的侧栏做）：左边合成一个侧栏（#queue），
   项目一组、下面直接挂它的卡片，agent 写在每张卡的小字里，不再按 agent 筛；整个侧栏能收起，鼠标移到最左边才浮出来。
   意见框照 Claude 的输入框：一个框，图在上、字在下，图片能拖进来。
   2026-11-16 重构第一批（只换视觉和版式，照「方案稿/2026-11-15-整套稿」，行为不动）：顶栏只留标识和计数，搜索、标签页、深浅色挪进侧栏；
   队列一行是「类型 + 标题」、下面「agent · 等了多久」和状态；卡片页是头部（为什么找你在标题右边）→ 关键事实行 → 两栏内容；决定栏按原型重排。 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const STATUS = {
    pending: "待审", approved: "通过", rejected: "打回", chosen: "已选", answered: "已答",
    snoozed: "稍后再看", dropped: "不用处理了", withdrawn: "agent 撤回", closed: "已处理",
    defaulted: "按推荐先推进",
  };
  const DONE = new Set(["approved", "rejected", "chosen", "answered", "dropped", "withdrawn", "closed"]);
  const S = { cards: [], card: null, filter: "pending", project: "", agent: "", q: "", pins: [], imgs: [], note: "", choice: null, lb: null, pinning: false,
    df: "all", seq: 0, timers: [], busy: false, sheet: null, uploading: 0, listY: 0, loaded: false, navMode: "pinned", peek: false, doc: null, dnotes: [], bgOpen: null };
  const narrow = () => matchMedia("(max-width: 900px)").matches;

  // ---------- 小工具 ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const md = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  const asset = (id, f) => (/^https?:\/\//.test(f) ? f : `/assets/${id}/${encodeURIComponent(f)}`);
  // file 证据：哪些后缀在网页里排版直接读、哪些交给浏览器打开；其余只给下载。要和 server.py 的 ASSET_TEXT / ASSET_INLINE 对得上
  const TEXT_EXT = ["md", "markdown", "txt", "csv", "tsv", "json", "log", "yaml", "yml", "srt", "toml", "ini"];
  const IMG_FILE_EXT = ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "svg"];
  const READ_MAX = 1024 * 1024; // 文字文件超过 1 MB 就不在网页里排版了，交给浏览器开
  const extOf = (f) => (String(f || "").match(/\.([A-Za-z0-9]+)$/)?.[1] || "").toLowerCase();
  const sizeText = (n) => (n < 1024 ? `${n} 字节` : n < 1048576 ? `${Math.round(n / 1024)} KB` : `${(n / 1048576).toFixed(1)} MB`);
  const when = (iso) => {
    if (!iso) return "";
    const d = new Date(iso), now = new Date(), diff = (now - d) / 60000;
    if (diff < 1) return "刚刚";
    if (diff < 60) return `${Math.floor(diff)} 分钟前`;
    const hm = d.toTimeString().slice(0, 5);
    if (d.toDateString() === now.toDateString()) return `今天 ${hm}`;
    return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${hm}`;
  };
  const toast = (t) => { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove("on"), 2200); };
  const api = async (url, body) => {
    const r = await fetch(url, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : { cache: "no-store" });
    if (r.status === 401) { const e = new Error("登录过期了，要重新输密码"); e.auth = true; throw e; }
    const j = await r.json();
    if (!r.ok) throw new Error(j.error || r.statusText);
    return j;
  };
  const isDone = (c) => DONE.has(c.status || c.decision?.status);
  // 这张卡从哪一刻开始等你：提卡、交新一版、改回待审里最晚的一个（和 review.py 的 pending_since 一个算法）。
  // 列表摘要里没有记录：待审的卡用 updated_at（这三件事都会改它），别的用 created_at；正开着的那张用完整的记录算
  const sinceOf = (c) => {
    const full = S.card?.id === c.id ? S.card : c;
    const ts = (full.history || []).filter((h) => ["created", "updated", "reopened"].includes(h.event)).map((h) => Date.parse(h.at)).filter((t) => !isNaN(t));
    if (ts.length) return Math.max(...ts);
    return Date.parse(((c.status || c.decision?.status || "pending") === "pending" && c.updated_at) || c.created_at);
  };
  const waited = (c) => {
    const m = (Date.now() - sinceOf(c)) / 60000;
    if (isNaN(m)) return "";
    return m < 1 ? "刚到" : `等了 ${m < 60 ? `${Math.floor(m)} 分钟` : m < 1440 ? `${Math.floor(m / 60)} 小时` : `${Math.floor(m / 1440)} 天`}`;
  };
  const whoOf = (c) => String(c.agent || "agent").trim().split(/\s+/)[0] || "agent"; // 「A1 美术方向」→「A1」
  const shortType = (t) => (t === "回答问题" ? "回答" : t);
  // 线条小图标（Lucide，跟着字的颜色）。2026-11-20 卡 20261120-003：类型标签、深浅色、快捷键、底部 Tab、说明的 i、看密码都用它
  const sv = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const IC = {
    keys: sv('<rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 8h.01"/><path d="M10 8h.01"/><path d="M14 8h.01"/><path d="M18 8h.01"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M7 16h10"/>'),
    moon: sv('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>'),
    sun: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),
    info: sv('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    eye: sv('<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: sv('<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>'),
    inbox: sv('<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'),
    chart: sv('<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 15 4-4 3 3 5-6"/>'),
    image: sv('<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>'),
    logout: sv('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>'),
    refresh: sv('<path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/>'),
    // 左边菜单（卡 20261120-016）：已处理、项目进度、收起 / 展开菜单
    done: sv('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>'),
    grid: sv('<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'),
    panel: sv('<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/>'),
  };
  const TYPE_IC = {
    拍板: sv('<path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8.3a4 4 0 0 0-1.17-2.87L3 3"/><path d="m15 9 6-6"/>'),
    验收: sv('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
    动手: sv('<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'),
    回答问题: sv('<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>'),
  };
  // 类型标签（卡 20261120-003 选的 B 版）：细描边 + 图标 + 两个字；「回答问题」字面写「回答」，全称留在读屏名字和 title 里
  const typeTag = (t) => {
    const full = String(t || ""), short = shortType(full);
    return `<span class="tag type"${short !== full ? ` role="img" title="${esc(full)}" aria-label="${esc(full)}"` : ""}>${TYPE_IC[full] || ""}<span${short !== full ? ' aria-hidden="true"' : ""}>${esc(short)}</span></span>`;
  };
  const mmdd = (iso) => { const d = new Date(iso); return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${d.toTimeString().slice(0, 5)}`; };
  const copy = (text) => {
    const fallback = () => { const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch {} t.remove(); };
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).catch(fallback).finally(() => toast("已复制"));
  };
  const statusText = (c) => {
    const st = c.status || c.decision?.status, sbc = c.status_before_close || c.decision?.status_before_close, ch = c.choice ?? c.decision?.choice;
    return st === "closed" && sbc ? `${STATUS[sbc]}${ch ? " " + ch : ""} → 已处理` : `${STATUS[st] || st}${ch ? " " + ch : ""}`;
  };
  // 按钮上、提示里怎么叫这个结论：动手卡是「做好了 / 做不了」，拍板卡的打回是「都不要」
  const actLabel = (type, st, key) => st === "chosen" ? `选 ${key}` : st === "approved" ? (type === "动手" ? "做好了" : "通过")
    : st === "rejected" ? (type === "拍板" ? "都不要" : type === "动手" ? "做不了" : "打回") : st === "answered" ? "回答" : st === "snoozed" ? "稍后再看" : "不用处理";
  const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

  // ---------- 队列 ----------
  async function loadList() {
    const { cards } = await api("/api/cards");
    S.cards = cards;
    renderQueue();
    const pend = cards.filter((c) => !isDone(c)), red = pend.filter((c) => c.urgency === "🔴" && !["snoozed", "defaulted"].includes(c.status));
    $("#n-pending").textContent = pend.length;
    $("#n-done").textContent = cards.filter(isDone).length;
    $("#count").textContent = cards.length;
    // 顶栏「待你处理」入口上的数（2026-11-18 进度页简版：原来的「待你处理 N」药丸改成了入口），旁边还是「几件卡住进度」
    $("#n-top").textContent = pend.length;
    $("#summary").innerHTML = red.length ? `<span class="state stop">${red.length} 件卡住进度</span>` : "";
    // 顶栏 B（2026-11-18 卡 20261118-016）：手机上右边放不下「几件卡住进度」，改成这个数变红、前面一个红点（样子在 style.css）
    $("#n-top").classList.toggle("hot", red.length > 0);
    $("#n-top").title = red.length ? `其中 ${red.length} 件卡住进度` : "";
    // 手机底部 Tab「待处理」上的红点：有卡住进度的卡才亮（卡 20261120-003）
    $("#tab-dot").hidden = !red.length;
    $("#tab-dot").title = red.length ? `其中 ${red.length} 件卡住进度` : "";
    // 电脑左边菜单上的两个数；有卡住进度的，「待你处理」那个数变红
    $("#m-n-pending").textContent = pend.length;
    $("#m-n-pending").classList.toggle("hot", red.length > 0);
    $("#m-n-pending").title = red.length ? `其中 ${red.length} 件卡住进度` : "";
    $("#m-n-done").textContent = cards.filter(isDone).length;
    document.title = pend.length ? `(${pend.length}) 审核中心` : "审核中心";
    if (S.card) {
      const fresh = cards.find((c) => c.id === S.card.id);
      if (fresh && fresh.updated_at !== S.card.updated_at) openCard(S.card.id, true);
    }
  }
  // ---------- 侧栏：一个项目一组，项目下面直接挂它的卡片（agent 写在每张卡的小字里）----------
  const projects = () => [...new Set(S.cards.map((c) => c.project || ""))].sort();
  const pname = (p) => p || "（没写项目）";
  function visible() {
    const q = S.q.trim().toLowerCase();
    return S.cards.filter((c) => {
      if (S.filter === "pending" && isDone(c)) return false;
      if (S.filter === "done" && !isDone(c)) return false;
      if (q && !`${c.title} ${c.ask} ${c.agent} ${c.project}`.toLowerCase().includes(q)) return false; // 搜标题、一句话、agent、项目
      return true;
    });
  }
  const hot = (c) => c.urgency === "🔴" && !isDone(c) && !["snoozed", "defaulted"].includes(c.status);
  // 2026-11-21 卡 20261121-005 选 D：不急的卡放了 3 天以上（从最近一次进待审算），沉到列表最后一组，默认折着。
  // 卡住进度、按推荐先推进了、稍后再看的不沉；搜索时不沉（免得搜到的卡藏起来）
  const STALE_MS = 3 * 864e5, STALE_KEY = "\u0000stale"; // STALE_KEY 记在「折起来的项目」里，意思反过来：在里面 = 展开着
  const stale = (c) => !isDone(c) && c.urgency !== "🔴" && !["snoozed", "defaulted"].includes(c.status) && Date.now() - sinceOf(c) > STALE_MS;
  // 待审里的先后：卡住进度 → 按推荐先推进了等确认 → 不急 → 稍后再看（每个项目里都按这个顺序排）
  function groups(list) {
    return [
      ["red", "🔴 卡住进度", list.filter(hot)],
      ["amber defaulted", "⏳ 按推荐先推进了，等你确认", list.filter((c) => c.status === "defaulted")],
      ["amber", "🟡 不急", list.filter((c) => c.urgency !== "🔴" && !["snoozed", "defaulted"].includes(c.status))],
      ["", "稍后再看", list.filter((c) => c.status === "snoozed")],
    ];
  }
  // 哪些项目折起来了，记在这台设备上；搜索时全部展开，免得搜到的卡藏在折起来的项目里
  const closedSet = () => { try { return new Set(JSON.parse(store.get("rc-closed") || "[]")); } catch { return new Set(); } };
  const saveClosed = (set) => store.set("rc-closed", JSON.stringify([...set]));
  function tree() {
    const list = visible(), closed = S.q.trim() ? new Set() : closedSet();
    const sink = S.filter === "pending" && !S.q.trim();
    const old = sink ? list.filter(stale) : [];
    const gs = projects().map((p) => {
      const mine = list.filter((c) => (c.project || "") === p && !old.includes(c));
      const cards = S.filter === "pending" ? groups(mine).flatMap((g) => g[2]) : mine;
      return { p, cards, red: cards.filter(hot).length, open: !closed.has(p) };
    });
    if (old.length) gs.push({ p: STALE_KEY, stale: true, cards: old.sort((a, b) => sinceOf(b) - sinceOf(a)), red: 0, open: closed.has(STALE_KEY) });
    return gs;
  }
  // J / K、「下一张」、第几张：按侧栏里看得见的顺序（折起来的项目里的卡不算）
  // 电脑上的「已处理」那一页是时间线：J / K、上一张下一张按时间线上（筛过以后）的顺序
  const ordered = () => (timeline() ? doneList() : tree().filter((g) => g.open).flatMap((g) => g.cards));
  // ---------- 已处理（电脑，卡 20261120-016 选 A）：按给结论的时间倒着排，上面四个筛选 ----------
  const desk = () => !narrow();
  const timeline = () => desk() && S.filter === "done";
  // 已处理的结论：agent 后来关了的卡（closed）按关之前的结论算
  const finalSt = (c) => { const st = c.status || c.decision?.status; return st === "closed" ? (c.status_before_close || c.decision?.status_before_close || "closed") : st; };
  const DF = { all: () => true, ok: (c) => ["approved", "chosen", "answered"].includes(finalSt(c)), no: (c) => finalSt(c) === "rejected", wd: (c) => finalSt(c) === "withdrawn" };
  const DF_KEYS = [["all", "全部已处理"], ["ok", "已通过"], ["no", "已打回"], ["wd", "已撤回"]];
  const doneAt = (c) => Date.parse(c.decided_at || c.updated_at || c.created_at) || 0;
  const doneList = () => visible().filter(DF[S.df] || DF.all).sort((a, b) => doneAt(b) - doneAt(a));
  // 2026-11-20 卡 20261120-018 打回「时间线是预览版效果更好」：照 preview-tideline 的卡片流——左边一根线、每张一个圆点，
  // 卡上标题和「几小时前」、agent · 类型 · 结论胶囊、要你做什么、影响 / 证据 / 项目小胶囊和「查看详情」；不按天分段
  const ago = (t) => { const m = (Date.now() - t) / 60000; return m < 1 ? "刚刚" : m < 60 ? `${Math.floor(m)} 分钟前` : m < 1440 ? `${Math.floor(m / 60)} 小时前` : `${Math.floor(m / 1440)} 天前`; };
  function tlRow(c) {
    const fs = finalSt(c), tone = fs === "rejected" ? "no" : fs === "withdrawn" ? "calm" : "ok", t = doneAt(c);
    const pills = [];
    if (c.blocks?.length) pills.push(`<span class="pill">影响：<b>${esc(c.blocks.join(" · "))}</b></span>`);
    if (c.evidence_count) pills.push(`<span class="pill">附带 <b>${c.evidence_count}</b> 样证据</span>`);
    pills.push(`<span class="pill"><i style="background:${pColor(c.project)}"></i>${esc(pname(c.project))}</span>`);
    return `<li class="d-row ${tone}"><span class="tl-node" aria-hidden="true">${tone === "no" ? "×" : tone === "calm" ? "–" : "✓"}</span>
      <a class="d-card ${S.card?.id === c.id ? "on" : ""}" href="#/card/${esc(c.id)}" data-id="${esc(c.id)}">
        <div class="d-l1"><span class="t">${esc(c.title)}</span><time class="d-time" datetime="${new Date(t).toISOString()}" title="${esc(when(new Date(t).toISOString()))}">${ago(t)}</time></div>
        <div class="d-l2"><span>${esc(c.agent)}</span>${typeTag(c.type)}<span class="pill st ${tone}"><i></i>${esc(statusText(c))}</span></div>
        ${c.ask ? `<p class="d-ask">${esc(c.ask)}</p>` : ""}
        <div class="d-l3"><div class="d-pills">${pills.join("")}</div><span class="d-cta">查看详情 ›</span></div>
      </a></li>`;
  }
  function renderDone() {
    const all = visible(), list = doneList();
    const chips = `<div class="chips d-filter" role="group" aria-label="按结论筛">${DF_KEYS.map(([k, t]) => `<button class="chip${S.df === k ? " on" : ""}" data-df="${k}" aria-pressed="${S.df === k}">${t}<b>${all.filter(DF[k]).length}</b></button>`).join("")}</div>`;
    if (!list.length) return `${chips}<div class="qempty">${S.q.trim() ? "没搜到卡片" : S.df === "all" ? "还没有处理过的卡" : "没有这样的卡"}</div>`;
    return `${chips}<ol class="d-list">${list.map(tlRow).join("")}</ol>`;
  }
  // 一行「类型小标签 + 标题」，下面一行「agent · 等了多久」，右边是状态（圆点 + 字）；使用原生 <a> 支持中键新开与完整键盘访问
  // 项目圆点（ds-01）：4 个常驻项目颜色写死，别的项目按名字从 6 色里挑一个；「（示例）」跟本体同色
  const PDOT_FIX = { "作品集": "#6366f1", "仙境的明天": "#10b981", "审核中心": "#f59e0b", "协同与自动化": "#ec4899" };
  const PDOTS = ["#3b82f6", "#8b5cf6", "#6366f1", "#10b981", "#f59e0b", "#ec4899"];
  const pColor = (p) => { const k = String(p || "").replace(/（示例）$/, ""); if (PDOT_FIX[k]) return PDOT_FIX[k]; let h = 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return PDOTS[h % PDOTS.length]; };
  function qitem(c) {
    const done = isDone(c);
    const color = ["approved", "chosen", "closed", "answered"].includes(c.status) ? "ok" : c.status === "rejected" ? "no" : "calm";
    const dot = `<i class="dot ${hot(c) ? "red" : ""}"></i>`;
    const st = done ? `<span class="st tag ${color}">${dot}${esc(statusText(c))}</span>`
      : c.status === "snoozed" ? `<span class="st tag calm">${dot}稍后再看</span>`
      : c.status === "defaulted" ? `<span class="st wait" title="等满 3 天按 agent 推荐先推进，不是你点的">${dot}按推荐先推进了 ${esc(c.choice || "")}</span>`
      : hot(c) ? `<span class="st stop">${dot}卡住进度</span>` : `<span class="st none">${dot}</span>`;
    const w = done ? when(c.decided_at || c.updated_at || c.created_at) : waited(c);
    return `<a class="qitem ${S.card?.id === c.id ? "on" : ""} ${done ? "done" : ""}" href="#/card/${esc(c.id)}" data-id="${esc(c.id)}">
      <div class="l1">${typeTag(c.type)}<span class="t">${esc(c.title)}</span></div>
      <div class="m"><span>${esc(c.agent)}</span><span class="w">· ${w}</span>${c.version > 1 ? `<span>第 ${c.version} 版</span>` : ""}<span class="pj"><i style="background:${pColor(c.project)}"></i>${esc(pname(c.project))}</span>${st}</div>
      ${c.ask ? `<p class="ask-l">${esc(c.ask)}</p>` : ""}</a>`;
  }
  function renderQueue() {
    const gs = tree().filter((g) => !S.q.trim() || g.cards.length); // 搜索时，没搜到卡的项目不列
    let html = "";
    if (timeline()) html = renderDone();
    else if (!gs.some((g) => g.cards.length)) html = `<div class="qempty">${S.q.trim() ? "没搜到卡片" : S.filter === "pending" ? "没有等你看的事 ✓" : "没有卡片"}</div>`;
    else html = gs.map((g) => {
      const n = g.cards.length, open = g.open && n > 0;
      return `<section class="pgroup ${open ? "open" : ""}${g.stale ? " stale" : ""}"><button class="phead" data-p="${esc(g.p)}" aria-expanded="${open}"${n ? "" : " disabled"}>
        <span class="chev" aria-hidden="true"></span>${g.stale ? `<span class="pname">放了 3 天以上</span>` : `<span class="pdot" style="--pdot:${pColor(g.p)}" aria-hidden="true"></span><span class="pname">${esc(pname(g.p))}</span>`}${g.red ? `<span class="pred" title="卡住进度的有 ${g.red} 张">${g.red}</span>` : ""}<b>${n}</b></button>
        ${open ? `<div class="pcards">${g.cards.map(qitem).join("")}</div>` : ""}</section>`;
    }).join("");
    $("#qlist").innerHTML = html;
    renderHead();
    renderMenu();
    applyNav();
    renderNav();
  }
  // 电脑上卡片列表那一页的标题：待你处理（有卡住进度的写几件）/ 已处理
  function renderHead() {
    const red = S.cards.filter(hot).length;
    $("#lp-head").innerHTML = S.filter === "done" ? `<h1>已处理</h1>` : S.filter === "all" ? `<h1>全部卡片</h1>`
      : `<h1>待你处理</h1>${red ? `<span class="state stop">${red} 件卡住进度</span>` : ""}`;
  }
  // 左边菜单：哪一项亮着；项目一行一个（圆点、名字、等你的张数），点了去它的进度页
  function renderMenu() {
    const v = document.body.dataset.view, prog = v === "progress", cur = prog ? "progress" : S.filter === "done" ? "done" : "pending";
    $$("#m-nav a").forEach((a) => { const on = a.dataset.nav === cur; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    const pend = S.cards.filter((c) => !isDone(c));
    $("#m-projs").innerHTML = projects().filter((p) => p).map((p) => {
      const mine = pend.filter((c) => (c.project || "") === p), red = mine.some(hot), on = prog && P.project === p;
      return `<a class="m-proj${on ? " on" : ""}" href="#/progress/${pkey(p)}"${on ? ' aria-current="page"' : ""}><i style="background:${pColor(p)}"></i><span class="m-t">${esc(p)}</span>${mine.length ? `<b class="${red ? "hot" : ""}">${mine.length}</b>` : ""}</a>`;
    }).join("");
  }
  // 打开某张卡时，它的项目要是折着的就展开，不然侧栏里找不到它
  function openProject(p) { const set = closedSet(); if (set.delete(p || "")) saveClosed(set); }
  // 打开一张沉底的卡时，把「放了 3 天以上」那组也展开，不然 J / K 和「还剩几张」里没有它
  function openStale() { const set = closedSet(); if (!set.has(STALE_KEY)) { set.add(STALE_KEY); saveClosed(set); } }

  // 整个侧栏（比 900 宽时）有两种摆法：固定在左边；收起，鼠标移到屏幕最左边（或顶栏左上角的按钮上）才浮出来盖在卡片上。选的哪种记在这台设备上
  const roomy = () => matchMedia("(min-width: 901px)").matches;
  let peekT = 0, holdUntil = 0;
  function applyNav() {
    const col = S.navMode === "collapsed";
    if (!col || !roomy()) S.peek = false;
    document.body.dataset.nav = col ? "collapsed" : "pinned";
    $("#menu").classList.toggle("peek", S.peek);
    const pin = $("#side-pin"), tg = $("#side-toggle");
    pin.setAttribute("aria-label", col ? "固定菜单" : "收起菜单"); pin.title = col ? "把菜单固定在左边" : "收起菜单：鼠标移到屏幕最左边才浮出来";
    tg.setAttribute("aria-label", "展开菜单"); tg.title = "把菜单固定回左边（鼠标停在这里可以先看一眼）";
    tg.setAttribute("aria-expanded", !col || S.peek);
  }
  function setPeek(on) { clearTimeout(peekT); if (S.peek !== !!on) { S.peek = !!on; $("#menu").classList.add("anim"); applyNav(); } }
  // 刚点了「收起」的半秒里不浮出：这时鼠标多半还停在左边，不拦一下它会立刻弹回来
  function setNavMode(mode) { S.navMode = mode; store.set("rc-nav", mode); S.peek = false; clearTimeout(peekT); $("#menu").classList.remove("anim"); holdUntil = Date.now() + 500; applyNav(); }
  {
    const side = $("#menu"), edge = $("#side-edge"), tg = $("#side-toggle");
    const wantPeek = () => { clearTimeout(peekT); if (S.navMode === "collapsed" && roomy() && !S.peek && Date.now() > holdUntil) peekT = setTimeout(() => setPeek(true), 80); };
    const wantHide = () => { clearTimeout(peekT); if (S.peek) peekT = setTimeout(() => { if (!side.matches(":hover") && !tg.matches(":hover")) setPeek(false); }, 260); };
    edge.addEventListener("mouseenter", wantPeek);
    edge.addEventListener("mouseleave", () => { if (!S.peek) clearTimeout(peekT); });
    edge.addEventListener("click", () => setPeek(true)); // 触屏没有「移上去」，点一下最左边也行
    tg.addEventListener("mouseenter", wantPeek);
    tg.addEventListener("mouseleave", wantHide);
    tg.addEventListener("click", () => setNavMode(S.navMode === "collapsed" ? "pinned" : "collapsed"));
    side.addEventListener("mouseenter", () => clearTimeout(peekT));
    side.addEventListener("mouseleave", wantHide);
    side.addEventListener("focusout", (e) => { if (S.peek && e.relatedTarget && !side.contains(e.relatedTarget)) setPeek(false); });
    // 点在侧栏外面就收回去（composedPath：点侧栏里的东西会重画，点过的那个已经不在页面上了，不能用 closest 判断）
    document.addEventListener("click", (e) => { const path = e.composedPath(); if (S.peek && !path.includes(side) && !path.includes(tg) && !path.includes(edge) && !e.target.closest?.("[data-crumb]")) setPeek(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && S.peek) { setPeek(false); tg.focus(); } });
    matchMedia("(min-width: 901px)").addEventListener("change", applyNav);
  }
  $("#side-pin").innerHTML = IC.panel; $("#side-toggle").innerHTML = IC.panel;
  $("#m-ic-q").innerHTML = IC.inbox; $("#m-ic-d").innerHTML = IC.done; $("#m-ic-p").innerHTML = IC.grid;
  $("#side-pin").addEventListener("click", () => setNavMode(S.navMode === "collapsed" ? "pinned" : "collapsed"));
  $("#queue").addEventListener("click", (e) => {
    const df = e.target.closest("[data-df]"); // 已处理页上的四个筛选
    if (df) { S.df = df.dataset.df; renderQueue(); $(`[data-df="${S.df}"]`)?.focus(); return; }
    const ph = e.target.closest(".phead");
    if (ph) { const set = closedSet(), p = ph.dataset.p; if (!set.delete(p)) set.add(p); saveClosed(set); renderQueue(); $$(".phead").find((b) => b.dataset.p === p)?.focus(); return; }
    const it = e.target.closest(".qitem, .d-card");
    if (it && !e.metaKey && !e.ctrlKey && !e.shiftKey && e.button === 0) { S.listY = window.scrollY; }
  });

  // 窄屏单张卡的顶栏：第几张 / 共几张、下一张
  function navNext() {
    const list = ordered(), i = list.findIndex((x) => x.id === S.card?.id);
    return { list, i, next: i < 0 ? list[0] : list.length > 1 ? list[(i + 1) % list.length] : null };
  }
  // 2026-11-21 卡 20261121-005 选 D：待你处理里看卡时，第几张换成「还剩 N 张 · 下一张：标题」，点了展开一个小列表（#qpeek）。
  // 还剩几张不数稍后再看和放了 3 天以上的；已处理时间线里还是「第几张 / 共几张」
  function renderNav() {
    const { list, i, next } = navNext();
    const pend = S.filter === "pending", left = list.filter((x) => x.id !== S.card?.id && x.status !== "snoozed" && !stale(x)).length;
    const nt = next && next.id !== S.card?.id ? next.title : "";
    $("#nav-pos").textContent = i < 0 ? (S.card ? statusText(S.card) : "") : pend ? (left ? `还剩 ${left} 张` : "最后一张") : `${i + 1} / ${list.length}`;
    const cp = $("#crumb-pos"); // 宽屏卡片顶上的面包屑里也写；这张卡不在侧栏现在列出来的里面，就不写
    if (cp) {
      cp.innerHTML = i < 0 ? "" : pend ? `${left ? `还剩 ${left} 张` : "最后一张"}${nt ? ` · 下一张：<span class="nt">${esc(nt)}</span>` : ""}` : `${i + 1} / ${list.length}`;
      cp.title = nt ? `下一张：${nt}` : "";
      cp.hidden = i < 0;
      $$("#card [data-step]").forEach((b) => (b.disabled = i < 0 || (b.dataset.step === "-1" ? i === 0 : i === list.length - 1)));
    }
    $("#nav-next").hidden = !next;
    $("#nav-next").textContent = i < 0 ? "去待审 ›" : "下一张 ›";
    if (!$("#qpeek").hidden) renderQPeek();
  }
  // 小列表：就是 J / K 走的那串卡，正在看的亮着；点一张就开那张
  function renderQPeek() { $("#qpeek").innerHTML = `<div class="pcards">${ordered().map(qitem).join("")}</div>`; }
  function setQPeek(btn) {
    const box = $("#qpeek"), open = !!btn;
    $("#crumb-pos")?.setAttribute("aria-expanded", String(open));
    if (!open) { box.hidden = true; return; }
    renderQPeek();
    const r = btn.getBoundingClientRect(), w = Math.min(380, window.innerWidth - 32);
    box.style.width = `${w}px`;
    box.style.top = `${Math.round(r.bottom + 6)}px`;
    box.style.left = `${Math.round(Math.max(16, Math.min(r.right - w, window.innerWidth - 16 - w)))}px`;
    box.hidden = false;
    box.querySelector(".qitem.on")?.scrollIntoView({ block: "nearest" });
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest?.("#crumb-pos");
    if (b) { setQPeek($("#qpeek").hidden || b.getAttribute("aria-expanded") !== "true" ? b : null); return; }
    if (!$("#qpeek").hidden && !e.target.closest?.("#qpeek")) setQPeek(null);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#qpeek").hidden) { setQPeek(null); e.stopPropagation(); } }, true);
  window.addEventListener("hashchange", () => setQPeek(null));
  window.addEventListener("resize", () => setQPeek(null));
  $("#nav-back").addEventListener("click", () => { location.hash = "#/"; });
  $("#nav-next").addEventListener("click", () => { const { next } = navNext(); if (next) location.hash = `#/card/${next.id}`; });

  // ---------- 卡片 ----------
  // silent = 后台刷新（agent 更新了版本）：保留批注、选择、意见和滚动位置
  async function openCard(id, silent) {
    const seq = silent ? S.seq : ++S.seq;
    try {
      const card = await api(`/api/cards/${encodeURIComponent(id)}`);
      if (seq !== S.seq) return; // 等的时候用户又点了别的卡，这次的结果作废
      if (silent && S.card && S.card.id !== card.id) return;
      const switched = !S.card || S.card.id !== card.id;
      S.card = card;
      if (!silent || switched) { openProject(card.project); if (!S.q.trim() && stale(card)) openStale(); }
      if (!silent || switched) {
        const d = card.decision || {};
        // 「稍后」过的卡，回来时把上次写的意见、批注、贴的图带回来
        const back = d.status === "snoozed";
        S.pins = back ? (d.pins || []).map((p) => ({ ...p })) : [];
        S.dnotes = back ? (d.doc_notes || []).map((n) => ({ file: n.file, line: n.line, quote: n.quote, text: n.text })) : [];
        S.imgs = back ? [...(d.images || [])] : [];
        S.note = back ? d.note || "" : "";
        S.choice = null;
        S.show = null;
        S.bgOpen = null;
        closeSheet();
      }
      renderCard(silent && !switched);
      renderQueue();
      $$(".qitem.on").forEach((el) => el.scrollIntoView({ block: "nearest" }));
    } catch (e) { if (e.auth) return showLogin(e.message); if (seq === S.seq) toast("打不开这张卡：" + e.message); }
  }
  // 2026-11-21 卡 20261121-005 选 D：同一件事的卡串起来。同一个会话、同一个项目、3 天内先提的卡，最多列最近 3 张和当时的结论，
  // 对照时不用来回切。只用列表里已有的 session / created_at，不用 agent 多填
  function thread(c) {
    const t0 = Date.parse(c.created_at);
    if (!c.session || isNaN(t0)) return [];
    return S.cards.filter((x) => { const t = Date.parse(x.created_at); return x.id !== c.id && x.session === c.session && (x.project || "") === (c.project || "") && t < t0 && t0 - t < 3 * 864e5; })
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 3).reverse();
  }
  function threadHtml(c) {
    const l = thread(c);
    if (!l.length) return "";
    return `<section class="thread" aria-label="这件事前几张卡"><h2>前几张</h2><ol>${l.map((x) => `<li><a href="#/card/${esc(x.id)}">${typeTag(x.type)}<span class="t">${esc(x.title)}</span><span class="th-st">${esc(isDone(x) || x.status !== "pending" ? statusText(x) : "等你")}</span></a></li>`).join("")}</ol></section>`;
  }
  function renderCard(keepScroll) {
    const c = S.card, id = c.id, d = c.decision || {}, st = d.status || "pending", done = isDone(c);
    S.timers.forEach(clearInterval); S.timers = [];
    const y = window.scrollY;
    const ctx = c.context || {}, who = whoOf(c);
    const ev = c.evidence || [], aft = c.after || {}, hasOpts = c.type === "拍板" && c.options?.length;
    const hasLeft = !!(ev.length || hasOpts || c.checks?.length);
    let html = `<div class="card-inner${hasLeft ? "" : " solo"}" data-id="${esc(id)}">`;
    // 一行小字导航：项目 / agent，右边是第几张和上一张、下一张。侧栏收起来的时候靠它知道自己在哪、往下翻。
    // 卡号不再写出来（卡 20261120-003），留在 .card-inner 的 data-id 和这一行的 title 里
    // 电脑上最前面是回列表那一页（待你处理 / 已处理）；手机上顶栏有「‹ 队列」，这一截不显示
    const back = S.filter === "done" ? ["#/done", "已处理"] : ["#/", "待你处理"];
    html += `<nav class="crumb meta" aria-label="这张卡在哪"><span class="path" title="${esc(id)}"><a class="c-back" href="${back[0]}">${back[1]}</a><span class="c-sep" aria-hidden="true"> / </span><button data-crumb="${esc(c.project || "")}" title="在列表里看这个项目">${esc(pname(c.project))}</button> / ${esc(c.agent)}</span>
      <button type="button" class="pos peek-btn" id="crumb-pos" aria-expanded="false" aria-controls="qpeek" hidden></button><button class="btn sm" data-step="-1" title="上一张（K）">上一张</button><button class="btn sm" data-step="1" title="下一张（J）">下一张 ›</button></nav>`;
    // 示例卡片：一条细横幅，全文在 title 里（读屏念后面那段 sr-only）
    const DEMO = "用《仙境的明天》的真实截图编的，内容只用来演示格式，不代表项目现状。";
    if (c.demo) html += `<div class="demo-note" title="示例卡片：${DEMO}"><span>示例卡片</span>${IC.info}<span class="sr-only">：${DEMO}</span></div>`;

    // 头部：标签行 → 标题 → 要你做什么 → 为什么找你（宽于 1100 在标题右边的面板里，窄一些排在「要你做什么」下面）
    const urg = st === "defaulted" ? `<span class="tag amber">按推荐先推进了</span>` : c.urgency === "🔴" ? `<span class="tag red">卡住进度</span>` : `<span class="tag blue">不急</span>`;
    const stTag = done ? `<span class="tag">${esc(st === "closed" ? "已处理" : STATUS[st] || st)}</span>` : urg + (st === "snoozed" ? `<span class="tag">稍后再看</span>` : "");
    html += `<header class="head"><div class="head-main"><div class="tags">${typeTag(c.type)}${stTag}${done ? "" : `<span class="waited">${waited(c)}</span>`}${c.version > 1 ? `<span class="waited">第 ${c.version} 版</span>` : ""}</div>
      <h1>${esc(c.title)}</h1>${askHtml(c)}</div>
      <div class="why"><b>${esc(who)} 为什么找你</b>${md(ctx.why_you) || "<span style='color:var(--muted)'>（没写）</span>"}</div>${dueNote(c)}</header>`;
    html += threadHtml(c);

    // 会卡住哪几步、agent 的自查（已处理的卡不放）。电脑上是标题下面一行关键事实（.facts），
    // 手机上和「为什么找你」合成一块三行的 .ctx（卡住 / 自查 / 原因，原因最多两行、能展开）；哪边显示由 style.css 按宽窄定
    const nck = (r) => (c.checks || []).filter((x) => x.result === r).length;
    const ckSum = `<span class="state no">未通过 ${nck("未通过")}</span><span class="state untested">未测 ${nck("未测")}</span><span class="state ok">通过 ${nck("通过")}</span>`;
    const stops = done ? [] : (c.blocks || []), hasCk = !done && c.checks?.length > 0;
    const ctxRows = (stops.length ? `<div class="ctx-row"><span class="ctx-k">卡住</span><span class="ctx-stop">${stops.map(esc).join(" · ")}</span></div>` : "")
      + (hasCk ? `<div class="ctx-row"><span class="ctx-k">自查</span><span class="ctx-sum">${ckSum}<button class="go" data-jump="sec-checks">看自查 ›</button></span></div>` : "")
      + (ctx.why_you ? `<div class="ctx-row"><span class="ctx-k">原因</span><span><span class="ctx-why">${md(ctx.why_you)}</span><button class="ctx-more" data-ctxmore aria-expanded="false">展开</button></span></div>` : "");
    if (ctxRows) html += `<div class="ctx">${ctxRows}</div>`;

    if (st === "defaulted") html += defaultedBox(c);
    else if (done || st === "snoozed") html += verdict(c);

    // 关键事实行（电脑）：会卡住的几步合成一格「会卡住」，自查一格
    const cells = (stops.length ? `<div class="stop"><dt>会卡住</dt><dd>${stops.map(esc).join(" · ")}</dd></div>` : "")
      + (hasCk ? `<div><dt>自查</dt><dd class="sum">${ckSum}</dd><small><button data-jump="sec-checks">看自查</button></small></div>` : "");
    if (cells) html += `<dl class="panel facts">${cells}</dl>`;

    // 左栏：要看的 / 可以怎么选 / 自查表
    const evTitle = c.type === "拍板" ? "还要看的" : c.type === "动手" ? "先读这个" : c.type === "回答问题" ? "可以参考的" : "要看的";
    const evSec = ev.length ? `<section class="sec" id="sec-ev"><div class="sec-h"><h2>${evTitle}</h2><span>${ev.length} 样</span></div><div class="evs">${ev.map((e, i) => evidence(e, i, id)).join("")}</div></section>` : "";
    let optSec = "";
    if (hasOpts) {
      optSec = `<section class="sec" id="sec-opts"><div class="sec-h"><h2>选一版</h2></div>
        ${swapMode(c) ? `<div class="panel swap">${swapHtml(c, d, who)}</div>` : `<div class="opts">${c.options.map((o) => option(o, id, d, who)).join("")}</div>`}</section>`;
    }
    let ckSec = "";
    if (c.checks?.length) {
      const cls = (r) => (r === "通过" ? "ok" : r === "未通过" ? "no" : "untested");
      // 一条一行：没过的、没测的排前面，通过的折起来
      const all = c.checks.map((x, i) => ({ ...x, i })), bad = all.filter((x) => x.result !== "通过"), ok = all.filter((x) => x.result === "通过");
      const ck = (x) => `<div class="ck r-${cls(x.result)}"><span class="state ${cls(x.result)}">${esc(x.result)}</span><b>${x.i + 1}. ${md(x.item)}</b>${x.evidence ? `<p class="e">${md(x.evidence)}</p>` : ""}</div>`;
      ckSec = `<section class="sec" id="sec-checks"><div class="sec-h"><h2>${esc(who)} 自己查过什么</h2><span>没通过和没测的排在前面</span></div>
        <div class="panel checks"><div class="sum">${ckSum}<em>没测过的不算通过，自己判断要不要再看</em></div>
        ${bad.map(ck).join("")}${ok.length ? `<details${bad.length ? "" : " open"}><summary>通过的 ${ok.length} 条（点开看）</summary>${ok.map(ck).join("")}</details>` : ""}</div></section>`;
    }
    const left = hasOpts ? optSec + evSec + ckSec : evSec + ckSec;

    // 右栏：背景（手机上默认收起；点过开合就记着，这张卡重画时不变）、你定了以后、相关文件和记录
    const bgOpen = S.bgOpen ?? !narrow();
    let side = `<details class="panel sidecard bg" id="sec-why"${bgOpen ? " open" : ""}><summary>背景：怎么走到这一步的</summary>
      ${step("这一步为了什么", ctx.goal)}${step("之前", ctx.before)}${step("这次做了什么", ctx.change)}</details>`;
    if (aft.approve || aft.reject) side += `<div class="panel sidecard" id="sec-after"><h2>你定了以后</h2><div class="then">
      <b>${c.type === "拍板" ? "选定以后" : c.type === "动手" ? "做好以后" : c.type === "回答问题" ? "回答以后" : "通过以后"}</b><span>${md(aft.approve)}</span>
      ${aft.reject ? `<b>${c.type === "拍板" ? "都不要的话" : c.type === "动手" ? "做不了的话" : c.type === "回答问题" ? "答不上来的话" : "打回以后"}</b><span>${md(aft.reject)}</span>` : ""}</div></div>`;
    const whereHtml = c.where?.length ? `<div class="where">${c.where.map((w) => {
      const isUrl = /^https?:\/\//.test(w.path || "");
      return `<div class="w"><span class="l">${esc(w.label)}</span><code>${isUrl ? `<a href="${esc(w.path)}" target="_blank">${esc(w.path)}</a>` : esc(w.path)}</code><button class="btn-ghost" data-copy="${esc(w.path)}">复制</button></div>`;
    }).join("")}</div>` : "";
    const histHtml = c.history?.length ? `<div class="hist" id="sec-hist">${c.history.map((h) => `<div>${when(h.at)}　<b>${esc(h.who)}</b> ${esc(({ created: "提交", updated: "更新", reopened: "改回待审", closed: "已处理" }[h.event]) || STATUS[h.event] || h.event)}${h.note ? `：${esc(h.note)}` : ""}</div>`).join("")}</div>` : "";
    if (whereHtml || histHtml) side += `<div class="panel sidecard" id="sec-where"><h2>${whereHtml ? "相关文件" : "记录"}</h2>${whereHtml}${histHtml}</div>`;
    html += `<div class="cols${left ? "" : " solo"}">${left ? `<div class="col-main">${left}</div>` : ""}<aside class="col-side">${side}</aside></div></div>`;
    $("#card").innerHTML = html;
    // 手机上的「原因」：两行放得下就不要「展开」
    const cw = $("#card .ctx-why"); if (cw) $("#card [data-ctxmore]").hidden = cw.scrollHeight <= cw.clientHeight + 1;
    if (keepScroll) window.scrollTo(0, y); else { $("#card").scrollTop = 0; window.scrollTo(0, 0); }
    bindEvidence();
    renderDecide();
  }
  const step = (k, v) => `<div class="step"><div class="k">${k}</div><div class="v">${md(v) || "<span style='color:var(--muted)'>（没写）</span>"}</div></div>`;
  // 要你做什么。动手卡里用 ①②③ 写了步骤的，拆成编号列表（① 前面要是还有一句，照样放在列表上面）
  function askHtml(c) {
    const a = String(c.ask || "");
    if (c.type !== "动手" || !/[①-⑳]/.test(a)) return `<div class="ask">${md(a)}</div>`;
    const parts = a.split(/[①-⑳]/), lead = parts[0].trim(), items = parts.slice(1).map((x) => x.trim().replace(/[；;。]$/, "")).filter(Boolean);
    return `${lead ? `<div class="ask">${md(lead)}</div>` : ""}<ol class="todo">${items.map((x) => `<li><span>${md(x)}</span></li>`).join("")}</ol>`;
  }
  // 批注钉在哪：「图 2」「图 1 左边」「图 1 连拍第 3 张」「方案 A」
  function pinWhere(c, p) {
    const ev = c.evidence || [];
    for (let i = 0; i < ev.length; i++) {
      const e = ev[i];
      if (e.kind === "image" && e.src === p.src) return `图 ${i + 1}`;
      if (e.kind === "compare" && (e.before === p.src || e.after === p.src)) return `图 ${i + 1}${e.before === p.src ? "左边" : "右边"}`;
      if (e.kind === "frames" && (e.srcs || []).includes(p.src)) return `图 ${i + 1} 连拍第 ${e.srcs.indexOf(p.src) + 1} 张`;
    }
    const o = (c.options || []).find((x) => x.image === p.src);
    return o ? `方案 ${o.key}` : "";
  }

  // 待审的 🟡 拍板卡有推荐：提前说哪天到点（数据来自列表摘要的 default_due）
  function dueNote(c) {
    const sum = S.cards.find((x) => x.id === c.id), st = c.decision?.status || "pending";
    if (st !== "pending" || !sum?.default_due) return "";
    const due = new Date(sum.default_due), key = esc(sum.default_choice || "");
    const when_ = due > new Date() ? `到 <b>${mmdd(sum.default_due)}</b> 你还没点，A13 会按推荐 ${key} 先推进` : `已经等满 3 天，A13 下次跑时会按推荐 ${key} 先推进`;
    return `<div class="due-note">⏳ ${when_}（不算你的结论，你点了就以你的为准）。</div>`;
  }
  function defaultedBox(c) {
    const d = c.decision, days = d.waited_hours != null ? (d.waited_hours / 24).toFixed(1) : "3";
    return `<div class="verdict defaulted auto"><div class="row"><div><div class="big">按推荐先推进 ${esc(d.choice || "")}</div><div class="when">不是你点的 · ${when(d.at)}</div></div></div>
      <div class="note">你 ${days} 天没点，A13 结论分发按 agent 推荐的 <b>${esc(d.choice || "")}</b> 先推进了。<b>这不是你的结论</b>：agent 只做能撤回的部分，花钱、对外发布、碰账号、删东西的照样等你。
在下面点「选 ${esc(d.choice || "")}」就是确认；点别的方案、「都不要」或「稍后」，agent 会改回来。</div></div>`;
  }
  const thumbs = (names, del) => names.map((n) => `<span class="att"><img src="${asset(S.card.id, n)}" alt="你贴的图" data-lbs="att" data-src="${esc(n)}">${del ? `<button data-unimg="${esc(n)}" title="不要这张图" aria-label="不要这张图">×</button>` : ""}</span>`).join("");
  function verdict(c) {
    const d = c.decision, st = d.status, cls = st === "closed" ? (d.status_before_close === "rejected" ? "no" : "ok") : ["approved", "chosen", "answered"].includes(st) ? "ok" : st === "rejected" ? "no" : "mid";
    const before = st === "closed" && d.status_before_close ? `${STATUS[d.status_before_close]}${d.choice ? " " + d.choice : ""} → ` : "";
    const pins = (d.pins || []).map((p) => { const at = pinWhere(c, p); return `<li><span class="pinno">${p.n}</span><span>${at ? esc(at) + "：" : ""}${esc(p.text)}</span></li>`; }).join("");
    const dns = (d.doc_notes || []).map((n) => `<li><span class="tag">${esc(n.label || n.file)} 第 ${n.line} 行</span><span>${esc(n.text)}</span></li>`).join("");
    const imgs = d.images?.length && st !== "snoozed" ? `<div class="atts-shown">你贴的图：${thumbs(d.images)}</div>` : "";
    const acted = c.acted ? `<div class="acted"><b>后来</b>${md(c.acted.note)}<span class="when">　${when(c.acted.at)}</span></div>` : "";
    return `<div class="verdict ${cls}"><div class="row"><div><div class="big">${before}${STATUS[st]}${d.choice && !before ? ` ${d.choice}` : ""}</div><div class="when">${when(d.at)}</div></div><button class="btn sm" id="reopen">改回待审</button></div>
      <div class="note">${md(d.note) || "<span style='color:var(--muted)'>没写意见</span>"}</div>${imgs}${pins || dns ? `<ul class="pinlist">${pins}${dns}</ul>` : ""}${acted}</div>`;
  }

  function evidence(e, i, id) {
    const n = `<span class="n">${i + 1}</span>`;
    const pinsMini = (src) => `<div class="pins-mini" data-src="${esc(src)}"></div>`;
    // 说明旁边的按钮：和点图一样是看大图（连拍开的是现在停着的那一帧）
    const zoom = `<button class="btn sm" data-lbfig>${isDone(S.card) ? "放大" : "放大、钉批注"}</button>`;
    if (e.kind === "image") return `<figure class="ev ${e.wide ? "wide" : ""}"><div class="img" data-lb="${i}" data-src="${esc(e.src)}"><img src="${asset(id, e.src)}" alt="" loading="lazy">${pinsMini(e.src)}</div>
      <figcaption>${n}<span>${md(e.caption)}</span>${zoom}<span class="src" title="${esc(e.src_original || "")}">${esc(e.src_original || "")}</span></figcaption></figure>`;
    if (e.kind === "compare") {
      const [l, r] = e.labels || ["之前", "现在"];
      const sideImg = (src, lab) => `<figure><div class="img" data-lb="${i}" data-src="${esc(src)}"><img src="${asset(id, src)}" alt="">${pinsMini(src)}</div><figcaption>${esc(lab)}</figcaption></figure>`;
      return `<figure class="ev wide"><div class="cmp" data-cmp="${i}" title="拖动对比：左边${esc(l)}，右边${esc(r)}"><img class="before" src="${asset(id, e.before)}" alt="${esc(l)}" draggable="false"><div class="after"><img src="${asset(id, e.after)}" alt="${esc(r)}" draggable="false"></div><div class="bar"></div><span class="lab l">◂ ${esc(l)}</span><span class="lab r">${esc(r)} ▸</span></div>
        <div class="side" hidden>${sideImg(e.before, l)}${sideImg(e.after, r)}</div>
        <div class="cmp-tools"><button class="on" data-mode="slide">拖线对比</button><button data-mode="side">并排</button><button data-lbs="${i}" data-src="${esc(e.before)}" title="放大 ${esc(l)}">放大左图</button><button data-lbs="${i}" data-src="${esc(e.after)}" title="放大 ${esc(r)}">放大右图</button></div>
        <figcaption>${n}<span>${md(e.caption)}</span></figcaption></figure>`;
    }
    if (e.kind === "frames") {
      const srcs = e.srcs || [];
      if (!srcs.length) return "";
      return `<figure class="ev wide" data-frames="${i}"><div class="img" data-lb="${i}" data-src="${esc(srcs[0])}"><img src="${asset(id, srcs[0])}" alt="" data-srcs='${esc(JSON.stringify(srcs))}'>${pinsMini(srcs[0])}</div>
        <div class="frames-tools"><button data-play>▶ 播放</button><button data-fstep="-1" disabled>‹ 上一帧</button><input type="range" min="0" max="${srcs.length - 1}" value="0" aria-label="拖动看逐帧"><button data-fstep="1"${srcs.length > 1 ? "" : " disabled"}>下一帧 ›</button><i class="brk" aria-hidden="true"></i><span class="idx">1 / ${srcs.length}</span></div>
        <div class="strip" role="group" aria-label="点一张跳到这一帧">${srcs.map((s, k) => `<button data-f="${k}" aria-pressed="${k === 0}" title="第 ${k + 1} 张"><img src="${asset(id, s)}" alt="" loading="lazy"><span>${k + 1}</span></button>`).join("")}</div>
        <figcaption>${n}<span>${md(e.caption)}</span>${zoom}<span class="src">${esc(e.dir_original || "")}</span></figcaption></figure>`;
    }
    if (e.kind === "link") return `<div class="ev link"><a class="go" href="${esc(e.href)}" target="_blank" rel="noopener">${esc(e.label || "打开")} ↗</a><div><div>${n} ${md(e.caption || "")}</div><div class="note">${md(e.note || "")}</div><div class="href">${esc(e.href)}</div></div></div>`;
    if (e.kind === "file") {
      // 2026-11-15：提卡时文件跟着卡带上来了（e.file 是卡片文件夹里的文件名）就能点开看；老卡、文件夹只有路径，点不开
      const f = e.file, x = extOf(f || e.path), url = f ? asset(id, f) : "";
      const what = x === "md" || x === "markdown" ? "Markdown" : x === "pdf" ? "PDF" : IMG_FILE_EXT.includes(x) ? "图片" : TEXT_EXT.includes(x) ? "文字" : x ? x.toUpperCase() : "文件";
      const go = !f ? "" : TEXT_EXT.includes(x) && !(e.size > READ_MAX) ? `<button class="go" data-doc="${i}">打开看</button>`
        : x === "pdf" || IMG_FILE_EXT.includes(x) || TEXT_EXT.includes(x) ? `<a class="go" href="${url}" target="_blank" rel="noopener">打开看 ↗</a>`
        : `<a class="go" href="${url}" download="${esc(f)}">下载</a>`;
      return `<div class="ev file ${f ? "" : "nofile"}"><span class="ico" aria-hidden="true">${esc((x || "文件").toUpperCase().slice(0, 4))}</span>${go}<div class="f-main"><div class="f-title">${n} <b>${esc(e.label || f || "文件")}</b><span class="f-meta">${what}${e.size ? " · " + sizeText(e.size) : ""}</span>${f && shownDnotes().some((n) => n.file === f) ? `<span class="f-notes">批注 ${shownDnotes().filter((n) => n.file === f).length} 条</span>` : ""}</div>
        <div class="note">${md(e.caption || "")}</div>
        ${f ? "" : `<div class="f-warn">这份文件没有带到审核中心，网页上打不开，只能在提卡的那台电脑上按下面的路径找。</div>`}
        <div class="f-path"><code>${esc(e.path)}</code> <button class="btn-ghost" data-copy="${esc(e.path)}">复制路径</button></div></div></div>`;
    }
    return "";
  }
  // swap：手机上 A/B 切着看的那一块里只摆一个方案，点图就是看大图（能钉批注），不用点方案去选
  function option(o, id, d, who, swap) {
    const on = !swap && (S.choice === o.key || (d.choice === o.key && !["pending", "defaulted"].includes(d.status)));
    const ahead = d.status === "defaulted" && d.choice === o.key ? `<div class="ahead">⏳ 先按这个推进了，还没经你确认</div>` : "";
    return `<div class="opt ${on ? "on" : ""}" data-key="${esc(o.key)}">
      ${o.image ? `<div class="img"${swap ? ` data-lb="opt" data-src="${esc(o.image)}"` : ""}><img src="${asset(id, o.image)}" alt=""><div class="pins-mini" data-src="${esc(o.image)}"></div><button class="zoom" data-lbs="opt" data-src="${esc(o.image)}">放大</button></div>` : ""}
      <div class="body"><div class="name"><span class="radio" aria-hidden="true"></span><span class="key">${esc(o.key)}</span><span class="ttl">${esc(o.title)}</span>${o.recommended ? `<span class="rec">${esc(who)} 推荐</span>` : ""}</div>
        <div class="desc">${md(o.desc)}</div>${o.cost ? `<div class="cost"><span class="lbl">代价</span>${md(o.cost)}</div>` : ""}${ahead}${on ? `<div class="picked">✓ 选了这个</div>` : ""}</div></div>`;
  }

  // 手机上的拍板卡、每个方案都带图（2026-11-18 第 6 项）：方案区变成一块，顶上一排「A 开灯｜B 白纸」，点哪个就在原地换成哪个的图、说明、代价；
  // 底下主按钮跟着显示的那个走（「选 B 白纸」）。没图的拍板卡、电脑上、已经定了的卡照旧
  const swapMode = (c) => !!c && narrow() && c.type === "拍板" && !isDone(c) && (c.options || []).length > 1 && c.options.every((o) => o.image);
  // 现在显示哪个：你切过的 → 已按推荐先推进的那个 → 推荐的 → 第一个
  const shownKey = (c) => { const o = c.options, has = (k) => k && o.some((x) => x.key === k); return [S.show, c.decision?.status === "defaulted" ? c.decision.choice : null, o.find((x) => x.recommended)?.key, o[0].key].find(has); };
  const swapHtml = (c, d, who) => {
    const key = shownKey(c);
    return `<div class="seg" role="group" aria-label="看哪个方案">${c.options.map((o) => `<button data-optab="${esc(o.key)}" aria-pressed="${o.key === key}"><b>${esc(o.key)}</b> ${esc(o.title)}${o.recommended ? `<small>推荐</small>` : ""}${d.status === "defaulted" && d.choice === o.key ? `<small class="amber">先推进了</small>` : ""}</button>`).join("")}</div>
      ${option(c.options.find((o) => o.key === key), c.id, d, who, true)}`;
  };
  function showOpt(key) {
    const c = S.card, box = $("#sec-opts .swap");
    if (!box || !c.options.some((o) => o.key === key)) return;
    S.show = key; box.innerHTML = swapHtml(c, c.decision || {}, whoOf(c));
    drawMiniPins(); renderDecide();
  }
  function pick(key) {
    if (swapMode(S.card)) return key && showOpt(key);
    S.choice = key;
    $$(".opt").forEach((el) => el.classList.toggle("on", el.dataset.key === S.choice));
    $$(".opt .picked").forEach((el) => el.remove());
    const opt = $$(".opt").find((el) => el.dataset.key === S.choice);
    if (opt) opt.querySelector(".body").insertAdjacentHTML("beforeend", `<div class="picked">✓ 选了这个</div>`);
    renderDecide();
  }
  $("#card").addEventListener("click", (e) => {
    if (!S.card) return;
    const bg = e.target.closest("details.bg > summary"); // 「背景」那一块：记下你是点开还是收起（点的这一下之后才变），这张卡重画时照着来
    if (bg) { S.bgOpen = !bg.parentElement.open; return; }
    const zf = e.target.closest("[data-lbfig]"); // 说明旁边的「放大、钉批注」：开这一块现在显示的那张图
    if (zf) { const im = zf.closest(".ev")?.querySelector(".img"); if (im) openLb(im.dataset.src); return; }
    const z = e.target.closest("[data-lb], [data-lbs]");
    if (z) { openLb(z.dataset.src); return; }
    const cp = e.target.closest("[data-copy]");
    if (cp) { copy(cp.dataset.copy); return; }
    const dc = e.target.closest("[data-doc]");
    if (dc) { openDoc(+dc.dataset.doc); return; }
    const cr = e.target.closest("[data-crumb]"); // 面包屑里的项目：侧栏收着就浮出来，滚到这个项目
    // 电脑：回到待你处理那一页，滚到这个项目、焦点落在它的组头上
    if (cr && desk()) { openProject(cr.dataset.crumb); S.focusP = cr.dataset.crumb; location.hash = "#/"; return; }
    if (cr) { openProject(cr.dataset.crumb); renderQueue(); const b = $$(".phead").find((x) => x.dataset.p === cr.dataset.crumb); b?.scrollIntoView({ block: "nearest" }); b?.focus(); return; }
    const sp = e.target.closest("[data-step]");
    if (sp) { const list = ordered(), i = list.findIndex((x) => x.id === S.card.id), n = list[i + +sp.dataset.step]; if (i >= 0 && n) location.hash = `#/card/${n.id}`; return; }
    const cm = e.target.closest("[data-ctxmore]"); // 手机上「原因」展开、收起
    if (cm) { const w = cm.parentElement.querySelector(".ctx-why"), open = w.classList.toggle("open"); cm.textContent = open ? "收起" : "展开"; cm.setAttribute("aria-expanded", open); return; }
    const jp = e.target.closest("[data-jump]");
    if (jp) { $("#" + jp.dataset.jump)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); return; }
    const tab = e.target.closest("[data-optab]"); // 手机上切着看方案
    if (tab) { showOpt(tab.dataset.optab); return; }
    const opt = e.target.closest(".opt");
    if (opt && !isDone(S.card) && !swapMode(S.card)) { pick(S.choice === opt.dataset.key ? null : opt.dataset.key); return; }
    const md_ = e.target.closest("[data-mode]");
    if (md_) { const fig = md_.closest(".ev"); const side = md_.dataset.mode === "side"; fig.querySelector(".cmp").hidden = side; fig.querySelector(".side").hidden = !side; $$("[data-mode]", fig).forEach((b) => b.classList.toggle("on", b === md_)); return; }
    if (e.target.closest("#reopen")) {
      const id = S.card.id;
      api(`/api/cards/${id}/reopen`, {}).then((card) => { if (S.card?.id === id) S.card = card; toast("改回待审了"); S.pins = []; S.dnotes = []; S.imgs = []; S.choice = null; S.note = ""; renderCard(true); return loadList(); })
        .catch((err) => (err.auth ? showLogin(err.message + "；刚才没改成，登录后再点一次") : toast("没改成：" + err.message)));
    }
  });
  function bindEvidence() {
    // 对比滑块：.after 是右边「现在」那一层，宽度 = 线右边的部分
    $$(".cmp").forEach((el) => {
      const after = el.querySelector(".after"), bar = el.querySelector(".bar");
      const set = (w) => { w = Math.min(1, Math.max(0, w)); after.style.width = `${(1 - w) * 100}%`; after.style.setProperty("--w", Math.max(1 - w, 0.0001)); bar.style.left = `${w * 100}%`; el.dataset.pos = w.toFixed(3); };
      const at = (x) => { const r = el.getBoundingClientRect(); return r.width ? (x - r.left) / r.width : 0.5; };
      set(0.5);
      let drag = false;
      el.addEventListener("pointerdown", (e) => { drag = true; set(at(e.clientX)); try { el.setPointerCapture(e.pointerId); } catch {} e.preventDefault(); });
      el.addEventListener("pointermove", (e) => { if (drag) set(at(e.clientX)); });
      const stop = () => (drag = false);
      el.addEventListener("pointerup", stop);
      el.addEventListener("pointercancel", stop);
    });
    // 连拍：拖进度条、点两头的「上一帧」「下一帧」、点下面一排小图，逐帧看；播放每秒 8 帧
    $$("[data-frames]").forEach((fig) => {
      const box = fig.querySelector(".img"), img = box.querySelector("img"), mini = box.querySelector(".pins-mini"), srcs = JSON.parse(img.dataset.srcs);
      const range = fig.querySelector("input"), idx = fig.querySelector(".idx"), play = fig.querySelector("[data-play]");
      const [prev, next] = [...fig.querySelectorAll("[data-fstep]")], strip = [...fig.querySelectorAll(".strip [data-f]")];
      let timer = null;
      const show = (i) => {
        i = +i; img.src = asset(S.card.id, srcs[i]); box.dataset.src = srcs[i]; mini.dataset.src = srcs[i]; range.value = i; idx.textContent = `${i + 1} / ${srcs.length}`;
        prev.disabled = i === 0; next.disabled = i === srcs.length - 1;
        strip.forEach((b, k) => b.setAttribute("aria-pressed", k === i));
        drawMiniPins();
      };
      const stop = () => { if (!timer) return; clearInterval(timer); S.timers = S.timers.filter((t) => t !== timer); timer = null; play.textContent = "▶ 播放"; };
      // 往前、往后一帧（到头就停，不绕回去）。电脑上按 ← → 也走这里
      fig.step = (d) => { stop(); const i = Math.min(srcs.length - 1, Math.max(0, +range.value + d)); if (i !== +range.value) show(i); };
      srcs.forEach((s) => { const im = new Image(); im.src = asset(S.card.id, s); });
      range.addEventListener("input", () => { stop(); show(range.value); });
      prev.addEventListener("click", () => fig.step(-1));
      next.addEventListener("click", () => fig.step(1));
      strip.forEach((b) => b.addEventListener("click", () => { stop(); show(b.dataset.f); }));
      play.addEventListener("click", () => {
        if (timer) return stop();
        play.textContent = "⏸ 停";
        timer = setInterval(() => show((+range.value + 1) % srcs.length), 1000 / 8);
        S.timers.push(timer);
      });
    });
    drawMiniPins();
  }
  const shownPins = () => (S.card && isDone(S.card) ? S.card.decision?.pins || [] : S.pins);
  const shownImgs = () => (S.card && isDone(S.card) ? S.card.decision?.images || [] : S.imgs);
  function drawMiniPins() {
    const pins = shownPins();
    $$(".pins-mini").forEach((box) => {
      box.innerHTML = pins.filter((p) => p.src === box.dataset.src).map((p) => `<div class="pin sm" style="left:${p.x * 100}%;top:${p.y * 100}%" title="${esc(p.text)}"><span>${p.n}</span></div>`).join("");
    });
  }

  // ---------- 看大图 + 批注 ----------
  // 放大不用 transform：直接把图撑大，外层 .stage 滚动。这样批注的大头针不跟着变大，批注输入框也不会被带歪。
  const Z = { z: 1, fitW: 0 };
  // 一组连拍算一张图（2026-11-18）：fr.srcs 是这组的每一帧，fr.k 是现在停在第几帧，fr.no 是卡上的「图 几」
  function lbList() {
    const out = [];
    (S.card.evidence || []).forEach((e, i) => {
      if (e.kind === "image") out.push({ src: e.src, cap: e.caption });
      if (e.kind === "compare") { out.push({ src: e.before, cap: `${e.labels?.[0] || "之前"} · ${e.caption || ""}` }); out.push({ src: e.after, cap: `${e.labels?.[1] || "现在"} · ${e.caption || ""}` }); }
      if (e.kind === "frames" && e.srcs?.length) out.push({ src: e.srcs[0], cap: e.caption || "", fr: { srcs: e.srcs, k: 0, no: i + 1 } });
    });
    for (const o of S.card.options || []) if (o.image) out.push({ src: o.image, cap: `方案 ${o.key} ${o.title}` });
    for (const n of shownImgs()) out.push({ src: n, cap: "你贴的图", mine: true });
    return out;
  }
  const lbSrc = () => { const it = S.lb.list[S.lb.i]; return it.fr ? it.fr.srcs[it.fr.k] : it.src; }; // 大图现在显示的那个文件
  function openLb(src) {
    const list = lbList(); let i = list.findIndex((x) => x.src === src || x.fr?.srcs.includes(src)); if (i < 0) i = 0;
    if (list[i].fr) list[i].fr.k = Math.max(0, list[i].fr.srcs.indexOf(src));
    S.lb = { list, i }; S.pinning = false; $("#lb-pin").classList.remove("on"); $("#lb-wrap").classList.remove("pinning");
    setZoom(1);
    showLb();
    $("#lb").classList.add("on");
  }
  function showLb() {
    const { list, i } = S.lb, it = list[i], fr = it.fr;
    $("#lb-img").src = asset(S.card.id, lbSrc());
    // 连拍：顶上写「图 1 · 连拍第 3 / 12 张」，后面跟说明；别的图照旧「第几张 / 一共几张　说明」
    $("#lb-cap").textContent = fr ? `图 ${fr.no} · 连拍第 ${fr.k + 1} / ${fr.srcs.length} 张　${it.cap || ""}` : `${i + 1} / ${list.length}　${it.cap || ""}`;
    $("#lb-cap").classList.remove("open");
    const many = fr && fr.srcs.length > 1;
    $("#lb-frames").hidden = !many;
    if (many) { $("#lb-range").max = fr.srcs.length - 1; $("#lb-range").value = fr.k; $("#lb-fidx").textContent = `${fr.k + 1} / ${fr.srcs.length}`; $("#lb-fprev").disabled = fr.k === 0; $("#lb-fnext").disabled = fr.k === fr.srcs.length - 1; }
    $("#lb-pin").hidden = !!it.mine; // 自己贴的图不用再钉批注
    drawLbPins();
  }
  // 换到第 i 张图：回到铺满
  function lbGo(i) { setZoom(1); S.lb.i = i; showLb(); }
  // 同一组连拍里换帧：留着放大的倍数（放大看脚，再一帧一帧看）。到头就停
  function lbFrame(k) {
    const fr = S.lb.list[S.lb.i].fr; if (!fr) return;
    k = Math.min(fr.srcs.length - 1, Math.max(0, k));
    if (k !== fr.k) { fr.k = k; showLb(); }
  }
  function setZoom(z, cx, cy) {
    const img = $("#lb-img"), st = $("#lb-stage");
    z = Math.min(8, Math.max(1, z));
    const r = img.getBoundingClientRect();
    if (cx == null) { const s = st.getBoundingClientRect(); cx = s.left + s.width / 2; cy = s.top + s.height / 2; }
    const fx = r.width ? (cx - r.left) / r.width : 0.5, fy = r.height ? (cy - r.top) / r.height : 0.5;
    if (Z.z === 1 && z > 1) Z.fitW = r.width;
    if (z > 1 && !Z.fitW) z = 1;
    Z.z = z;
    if (z === 1) { img.style.width = ""; img.style.maxWidth = ""; img.style.maxHeight = ""; }
    else { img.style.maxWidth = "none"; img.style.maxHeight = "none"; img.style.width = `${Z.fitW * z}px`; }
    $("#lb").classList.toggle("zoomed", z > 1);
    $("#lb-zoom").textContent = z > 1 ? "还原" : "放大";
    if (z > 1) { const r2 = img.getBoundingClientRect(); st.scrollLeft += r2.left + fx * r2.width - cx; st.scrollTop += r2.top + fy * r2.height - cy; }
  }
  // 放大到原图大小（至少 2 倍）；已经放大了就还原
  function toggleZoom(cx, cy) {
    if (Z.z > 1) return setZoom(1);
    const img = $("#lb-img"), w = img.getBoundingClientRect().width;
    setZoom(Math.min(6, Math.max(2, w ? img.naturalWidth / w : 2)), cx, cy);
  }
  function openPinBox(x, y, editPin) {
    $$("#lb-wrap .pinbox").forEach((el) => el.remove());
    const box = document.createElement("div");
    box.className = "pinbox" + (y > 0.7 ? " up" : "");
    box.style.left = `${Math.min(x * 100, 68)}%`;
    box.style.top = `${y * 100}%`;
    box.innerHTML = `${editPin ? `<div class="pb-head">编辑批注 #${editPin.n}</div>` : ""}<input placeholder="这里怎么了？" autofocus><div class="r">${editPin ? `<button class="del">删除</button>` : ""}<button class="c">取消</button><button class="ok">${editPin ? "保存" : "钉上"}</button></div>`;
    $("#lb-wrap").appendChild(box);
    const inp = box.querySelector("input");
    if (editPin) inp.value = editPin.text || "";
    inp.focus({ preventScroll: true });
    if (editPin) inp.select();
    const commit = () => {
      const t = inp.value.trim(); box.remove();
      if (editPin) {
        if (!t) { S.pins = S.pins.filter((p) => p !== editPin); renumber(); }
        else editPin.text = t;
      } else {
        if (!t) return;
        S.pins.push({ src: lbSrc(), x: +x.toFixed(4), y: +y.toFixed(4), text: t, n: S.pins.length + 1 });
      }
      drawLbPins(); drawMiniPins(); renderDecide();
    };
    box.querySelector(".ok").addEventListener("click", commit);
    box.querySelector(".c").addEventListener("click", () => box.remove());
    box.querySelector(".del")?.addEventListener("click", () => { box.remove(); S.pins = S.pins.filter((p) => p !== editPin); renumber(); drawLbPins(); drawMiniPins(); renderDecide(); });
    inp.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.isComposing) commit(); if (e.key === "Escape") box.remove(); e.stopPropagation(); });
    box.addEventListener("click", (e) => e.stopPropagation());
  }
  function drawLbPins() {
    $$("#lb-wrap .pin, #lb-wrap .pinbox").forEach((el) => el.remove());
    const src = lbSrc();
    shownPins().filter((p) => p.src === src).forEach((p) => {
      const el = document.createElement("div"); el.className = "pin"; el.style.left = `${p.x * 100}%`; el.style.top = `${p.y * 100}%`; el.innerHTML = `<span>${p.n}</span>`; el.title = p.text;
      el.addEventListener("click", (e) => { e.stopPropagation(); if (isDone(S.card)) return toast(`批注 ${p.n}：${p.text}`); openPinBox(p.x, p.y, p); });
      $("#lb-wrap").appendChild(el);
    });
  }
  function renumber() { S.pins.forEach((p, i) => (p.n = i + 1)); }
  const closeLb = () => { $("#lb").classList.remove("on"); S.pinning = false; $$("#lb-wrap .pinbox").forEach((el) => el.remove()); setZoom(1); };
  const lbStep = (d) => { const n = S.lb.list.length; lbGo((S.lb.i + d + n) % n); };
  $("#lb-close").addEventListener("click", closeLb);
  $("#lb").addEventListener("click", (e) => { if (G.dragged) return; if (Z.z === 1 && (e.target.id === "lb" || e.target.classList.contains("stage"))) closeLb(); });
  $("#lb-prev").addEventListener("click", () => lbStep(-1));
  $("#lb-next").addEventListener("click", () => lbStep(1));
  $("#lb-zoom").addEventListener("click", () => toggleZoom());
  $("#lb-cap").addEventListener("click", () => $("#lb-cap").classList.toggle("open"));
  $("#lb-range").addEventListener("input", () => lbFrame(+$("#lb-range").value));
  $("#lb-fprev").addEventListener("click", () => lbFrame(S.lb.list[S.lb.i].fr.k - 1));
  $("#lb-fnext").addEventListener("click", () => lbFrame(S.lb.list[S.lb.i].fr.k + 1));
  $("#lb-pin").addEventListener("click", () => { if (isDone(S.card)) return toast("已审的卡不能再批注，先「改回待审」"); S.pinning = !S.pinning; $("#lb-pin").classList.toggle("on", S.pinning); $("#lb-wrap").classList.toggle("pinning", S.pinning); if (S.pinning) toast("在图上要说的地方点一下"); });
  $("#lb-img").addEventListener("click", (e) => {
    if (!S.pinning || G.dragged) return;
    const r = e.target.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    openPinBox(x, y, null);
  });
  // 手势：双指缩放；放大后一指拖动；没放大时左右滑翻图；连点两下放大 / 还原；电脑上滚轮缩放
  const G = { pts: new Map(), one: null, pinch: null, dragged: false, lastTap: 0, lastXY: [0, 0] };
  {
    const st = $("#lb-stage");
    const dist = () => { const [a, b] = [...G.pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
    const mid = () => { const [a, b] = [...G.pts.values()]; return [(a.x + b.x) / 2, (a.y + b.y) / 2]; };
    st.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".pinbox, .pin")) return;
      G.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (G.pts.size === 1) { G.dragged = false; G.one = { x: e.clientX, y: e.clientY, sl: st.scrollLeft, stp: st.scrollTop, touch: e.pointerType !== "mouse" }; G.pinch = null; }
      if (G.pts.size === 2) { G.pinch = { d: dist(), z: Z.z }; G.dragged = true; }
    });
    st.addEventListener("pointermove", (e) => {
      if (!G.pts.has(e.pointerId)) return;
      G.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (G.pinch && G.pts.size === 2) { const [mx, my] = mid(); setZoom(G.pinch.z * dist() / G.pinch.d, mx, my); return; }
      if (!G.one || G.pts.size !== 1) return;
      const dx = e.clientX - G.one.x, dy = e.clientY - G.one.y;
      if (Math.abs(dx) + Math.abs(dy) > 8) G.dragged = true;
      if (Z.z > 1 && G.dragged) { st.scrollLeft = G.one.sl - dx; st.scrollTop = G.one.stp - dy; }
    });
    const up = (e) => {
      if (!G.pts.has(e.pointerId)) return;
      G.pts.delete(e.pointerId);
      if (G.pinch) { if (!G.pts.size) { G.pinch = null; G.one = null; if (Z.z < 1.08) setZoom(1); } return; }
      const o = G.one; G.one = null;
      if (!o || e.type === "pointercancel") return;
      const dx = e.clientX - o.x, dy = e.clientY - o.y;
      if (G.dragged) { if (Z.z === 1 && o.touch && !S.pinning && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) lbStep(dx < 0 ? 1 : -1); return; }
      if (S.pinning || !e.target.closest("#lb-wrap")) return;
      const now = Date.now(), near = Math.hypot(e.clientX - G.lastXY[0], e.clientY - G.lastXY[1]) < 30;
      if (now - G.lastTap < 320 && near) { G.lastTap = 0; toggleZoom(e.clientX, e.clientY); } else { G.lastTap = now; G.lastXY = [e.clientX, e.clientY]; }
    };
    st.addEventListener("pointerup", up);
    st.addEventListener("pointercancel", up);
    // 不用 setPointerCapture（用了以后点击会落到 .stage 上，钉批注就点不到图了）；鼠标拖出去就当松手
    st.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && G.pts.has(e.pointerId)) { G.pts.delete(e.pointerId); G.one = null; } });
    st.addEventListener("wheel", (e) => { e.preventDefault(); setZoom(Z.z * (e.deltaY < 0 ? 1.2 : 1 / 1.2), e.clientX, e.clientY); }, { passive: false });
  }

  // ---------- 贴图：意见框里直接粘贴截图，或者点「添加图片」----------
  // 大图先在浏览器里缩一下（最长边 2400、JPEG），免得一张截图传半天
  const shrink = (file) => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onerror = () => rej(new Error("读不了这张图"));
    fr.onload = () => {
      if (file.size <= 1.5 * 1024 * 1024 && /^image\/(png|jpeg|gif|webp)$/.test(file.type)) return res(fr.result);
      const im = new Image();
      im.onerror = () => rej(new Error("这个格式浏览器打不开，换成 PNG 或 JPG 再贴"));
      im.onload = () => {
        const s = Math.min(1, 2400 / Math.max(im.width, im.height)), c = document.createElement("canvas");
        c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
        const x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.85));
      };
      im.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
  async function addImage(file) {
    const c = S.card;
    if (!c || isDone(c)) return toast("这张卡已经定了，先「改回待审」再贴图");
    if (!/^image\//.test(file.type)) return toast("只能贴图片");
    if (S.imgs.length + S.uploading >= 9) return toast("一次最多 9 张图");
    S.uploading++; renderAtts();
    try {
      const r = await api(`/api/cards/${c.id}/attach`, { data: await shrink(file) });
      if (S.card?.id === c.id && !S.imgs.includes(r.name)) S.imgs.push(r.name);
    } catch (e) { if (e.auth) showLogin(e.message + "；图没传上去，登录后再贴一次"); else toast("图没传上去：" + e.message); }
    finally { S.uploading--; renderAtts(); if (S.needReason && hasReason()) clearNeed(); if (narrow()) renderDecide(); }
  }
  // 意见框：电脑底部是单行横排（＋ 在左下角）；手机确认面板是竖排（输入框占满 100% 宽度，底部一行放「贴图」按钮）
  const attsHtml = () => `${thumbs(S.imgs, true)}${S.uploading ? `<span class="att busy">正在传 ${S.uploading} 张…</span>` : ""}`;
  const composer = (ph, rows, label, stacked) => stacked
    ? `<div class="composer stacked"><div class="atts">${attsHtml()}</div>
      <textarea id="note"${rows ? ` rows="${rows}"` : ""}${label ? ` aria-label="${esc(label)}"` : ""} placeholder="${ph}">${esc(S.note)}</textarea>
      <div class="cbar"><button type="button" class="cadd-btn" data-addimg title="添加图片（也可以把图片拖进来，或直接粘贴截图）" aria-label="添加图片">${IC.image}<span>贴图</span></button><span class="chint">支持粘贴或选图</span></div>
      <div class="cdrop" aria-hidden="true">松手添加图片</div></div>`
    : `<div class="composer"><div class="atts">${attsHtml()}</div>
      <div class="crow"><button class="cadd" data-addimg title="添加图片（也可以把图片拖进来，或直接粘贴截图）" aria-label="添加图片">＋</button><textarea id="note"${rows ? ` rows="${rows}"` : ""}${label ? ` aria-label="${esc(label)}"` : ""} placeholder="${ph}">${esc(S.note)}</textarea></div>
      <div class="cdrop" aria-hidden="true">松手添加图片</div></div>`;
  function renderAtts() { $$(".atts").forEach((el) => (el.innerHTML = attsHtml())); }
  // 文件批注（2026-11-15 加）：读卡上带的文件时对着某一段写的。已审的卡看的是当时交上去的那些
  const shownDnotes = () => (S.card && isDone(S.card) ? S.card.decision?.doc_notes || [] : S.dnotes);
  const dlabel = (n) => (S.card?.evidence || []).find((e) => e.kind === "file" && e.file === n.file)?.label || n.file;
  const short = (t, k) => (t.length > k ? t.slice(0, k) + "…" : t);
  const dnotesHtml = () => (S.dnotes.length ? "文件批注：" + S.dnotes.map((n, k) => `<span class="p dn" title="${esc(n.quote)}"><button data-dopen="${k}" title="打开文件看这一条">${esc(dlabel(n))} 第 ${n.line} 行</button> ${esc(short(n.text, 24))}<button data-undnote="${k}" title="删掉这条批注">× 删</button></span>`).join("") : "");
  const pinsHtml = () => [pinsOnly(), dnotesHtml()].filter(Boolean).join("") || "<span>点开图可以在图上钉批注（看大图时按 P）；点开文件可以对着某一段写批注。都会一起写回给 agent</span>";
  // 每条前面写钉在哪（「图 1 连拍第 3 张：左脚悬空」），和结论框里的写法一样
  const pinsOnly = () => (S.pins.length ? "图上批注：" + S.pins.map((p) => { const at = pinWhere(S.card, p); return `<span class="p">${p.n} ${at ? esc(at) + "：" : ""}${esc(p.text)}<button data-unpin="${p.n}" title="删掉这条批注">× 删</button></span>`; }).join("") : "");
  const picker = Object.assign(document.createElement("input"), { type: "file", accept: "image/*", multiple: true, hidden: true });
  document.body.appendChild(picker);
  picker.addEventListener("change", () => { [...picker.files].forEach(addImage); picker.value = ""; });
  document.addEventListener("paste", (e) => {
    if (!$("#login").hidden || $("#lb").classList.contains("on") || !S.card || document.body.dataset.view === "progress") return;
    const t = e.target, inNote = t?.id === "note";
    if (!inNote && ["INPUT", "TEXTAREA", "SELECT"].includes(t?.tagName)) return;
    const files = [...(e.clipboardData?.files || [])].filter((f) => /^image\//.test(f.type));
    if (!files.length) return;
    e.preventDefault();
    files.forEach(addImage);
  });
  // 拖图进来：整页都接，松手在哪都算，意见框亮起来提示（用户定的）。拖偏了也不让浏览器把图当网页打开、把写到一半的意见冲掉
  {
    let depth = 0;
    const files = (e) => [...(e.dataTransfer?.types || [])].includes("Files");
    const busy = () => !$("#login").hidden || !!S.doc || $("#lb").classList.contains("on") || document.body.dataset.view === "progress";
    const stop = () => { depth = 0; document.body.classList.remove("dragging"); };
    document.addEventListener("dragenter", (e) => { if (!files(e)) return; e.preventDefault(); depth++; if (!busy() && S.card && !isDone(S.card)) document.body.classList.add("dragging"); });
    document.addEventListener("dragover", (e) => { if (!files(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = !busy() && S.card && !isDone(S.card) ? "copy" : "none"; });
    document.addEventListener("dragleave", (e) => { if (!files(e)) return; depth = Math.max(0, depth - 1); if (!depth) stop(); });
    document.addEventListener("drop", (e) => {
      if (!files(e)) return;
      e.preventDefault(); stop();
      if (busy()) return;
      if (!S.card) return toast("先打开一张卡，再把图拖进来");
      const all = [...e.dataTransfer.files], imgs = all.filter((f) => /^image\//.test(f.type));
      if (!imgs.length) return toast("只能贴图片");
      if (imgs.length < all.length) toast(`有 ${all.length - imgs.length} 个不是图片，没收`);
      imgs.forEach(addImage);
      $("#note")?.focus();
    });
    window.addEventListener("blur", stop);
  }
  // 决定栏和确认面板里共用的点击：删批注、删图、添加图片
  function sharedClick(e) {
    const up = e.target.closest("[data-unpin]");
    if (up) { S.pins = S.pins.filter((p) => p.n != up.dataset.unpin); renumber(); drawMiniPins(); renderDecide(); if (S.sheet) renderSheet(); return true; }
    const ud = e.target.closest("[data-undnote]");
    if (ud) { S.dnotes.splice(+ud.dataset.undnote, 1); renderCard(true); if (S.sheet) renderSheet(); return true; }
    const od = e.target.closest("[data-dopen]"); // 点某一条文件批注：打开那份文件，滚到那一段
    if (od) { const n = S.dnotes[+od.dataset.dopen], i = (S.card.evidence || []).findIndex((x) => x.kind === "file" && x.file === n?.file); if (i >= 0) { closeSheet(); openDoc(i, n.line); } return true; }
    const ui = e.target.closest("[data-unimg]");
    if (ui) { S.imgs = S.imgs.filter((n) => n !== ui.dataset.unimg); renderAtts(); if (narrow()) renderDecide(); return true; }
    if (e.target.closest("[data-addimg]")) { picker.click(); return true; }
    const z = e.target.closest("[data-lbs]");
    if (z) { openLb(z.dataset.src); return true; }
    return false;
  }
  // 意见框跟着字数自己长高（最多 160），不用拖右下角
  const fitNote = () => { const t = $("#note"); if (!t) return; t.style.height = "auto"; t.style.height = Math.min(160, t.scrollHeight) + "px"; };
  document.addEventListener("input", (e) => { if (e.target.id === "note") { S.note = e.target.value; fitNote(); if (S.needReason && S.note.trim()) clearNeed(); } });

  // ---------- 决定栏 ----------
  // 宽屏：意见框常驻，按钮点了就提交。窄屏：两个大按钮加「更多」，点了先弹确认面板（意见、批注、贴图都在面板里）。
  // 主按钮上面那行小字：点了以后会怎样
  function hintOf(c) {
    const t = c.type, w = whoOf(c);
    if (t === "拍板") return S.choice ? `按回车就选 ${S.choice}，${w} 照 ${S.choice} 做` : "点哪个就按哪个定";
    if (t === "回答问题") return `发送后 ${w} 照你的回答改`;
    if (t === "动手") return `点了以后 ${w} 接着往下做`;
    const n = (r) => (c.checks || []).filter((x) => x.result === r).length;
    return n("未通过") + n("未测") ? `还有 ${n("未通过")} 条未通过、${n("未测")} 条未测` : `通过后 ${w} 接着往下做`;
  }
  function renderDecide() {
    const c = S.card, box = $("#decide");
    if (S.needReason && (!c || S.needReason !== c.id || hasReason())) S.needReason = null; // 换了卡、或已经有理由了：不再标红（删掉批注也不会自己红回来）
    if (!c || isDone(c)) { box.hidden = true; box.innerHTML = ""; return; } // 已经定了的卡没有这一栏：结论和「改回待审」都在上面那一块里
    box.hidden = false;
    const d = c.decision || {};
    const t = c.type;
    if (narrow()) {
      const key = S.choice || (d.status === "defaulted" ? d.choice : null);
      let pri, sec = "";
      if (t === "拍板" && swapMode(c)) { // 切着看的：主按钮一直能点，跟着上面显示的那个方案走
        const o = c.options.find((x) => x.key === shownKey(c));
        pri = `<button class="btn ok" data-act="chosen" data-key="${esc(o.key)}" title="快捷键 ↵">${d.status === "defaulted" && d.choice === o.key ? "确认选" : "选"} ${esc(o.key)} <span class="ttl">${esc(o.title)}</span></button>`;
        sec = `<button class="btn no" data-act="rejected" title="快捷键 R">都不要</button>`;
      } else if (t === "拍板") {
        pri = key ? `<button class="btn ok" data-act="chosen" data-key="${esc(key)}" title="快捷键 ↵">${d.status === "defaulted" && !S.choice ? "确认选" : "选定"} ${esc(key)}</button>` : `<button class="btn" data-act="chosen">先点一个方案</button>`;
        sec = `<button class="btn no" data-act="rejected" title="快捷键 R">都不要</button>`;
      } else if (t === "回答问题") pri = `<button class="btn ok" data-act="answered" title="快捷键 ↵">写回答</button>`;
      else { pri = `<button class="btn ok" data-act="approved" title="快捷键 ↵">${actLabel(t, "approved")}</button>`; sec = `<button class="btn no" data-act="rejected" title="快捷键 R">${actLabel(t, "rejected")}</button>`; }
      const draft = [S.pins.length && `图上批注 ${S.pins.length} 条`, S.dnotes.length && `文件批注 ${S.dnotes.length} 条`, S.imgs.length && `贴图 ${S.imgs.length} 张`, S.note.trim() && "意见已写"].filter(Boolean);
      const mHint = hintOf(c), mWarn = /未通过|未测/.test(mHint) ? `<div class="m-warn">${IC.info}<span>${esc(mHint)}</span></div>` : "";
      box.innerHTML = `${mWarn}${draft.length ? `<div class="draft">${draft.join(" · ")}，点结论时一起交</div>` : ""}<div class="row"><div class="btns"><button class="btn quiet" data-more>更多</button>${sec}${pri}</div></div>`;
      return;
    }
    // 宽屏一排（Tideline 悬浮白底卡片）：意见框 | 不用处理 | 稍后 | 否定按钮 | 主按钮。
    const hint = hintOf(c), warn = /未通过|未测/.test(hint);
    const tip = (k) => ` title="${warn ? "" : esc(hint) + "。"}快捷键 ${k}"`;
    let pri;
    if (t === "拍板") pri = (c.options || []).map((o, i) => `<button class="btn ${S.choice === o.key ? "ok" : ""}" data-act="chosen" data-key="${esc(o.key)}"${tip(i + 1)}>选 ${esc(o.key)}</button>`).join("");
    else if (t === "回答问题") pri = `<button class="btn ok" data-act="answered"${tip("↵")}>发送回答</button>`;
    else pri = `<button class="btn ok" data-act="approved"${tip("↵")}>${actLabel(t, "approved")}</button>`;
    const no = t === "回答问题" ? "" : `<button class="btn no" data-act="rejected" title="快捷键 R">${actLabel(t, "rejected")}</button>`;
    const ph = t === "回答问题" ? "你的回答（必填）。图片可以拖进来或直接粘贴" : t === "拍板" ? "补一句为什么（点「都不要」必填）。图片可以拖进来或直接粘贴" : "要改什么、哪里不对（打回时写清楚）。图片可以拖进来或直接粘贴";
    const dflt = d.status === "defaulted" ? `<div class="dflt-note">已按推荐 ${esc(d.choice || "")} 先推进（不是你点的）：点「选 ${esc(d.choice || "")}」就是确认，点别的 agent 会改回来。</div>` : "";
    box.innerHTML = `<div class="decide-card">${dflt}${S.pins.length || S.dnotes.length ? `<div class="pins">${pinsHtml()}</div>` : ""}<div class="row"><div class="field${needing(c) ? " need" : ""}"><label class="lab" for="note">${needing(c) ? esc(reasonAsk(t)) : "补充你的判断"}</label>${composer(ph, 1, needing(c) ? reasonAsk(t) : "补充你的判断")}</div>
      <div class="btns"><button class="btn quiet" data-act="dropped">不用处理</button><button class="btn" data-act="snoozed" title="快捷键 S">稍后</button>${no}
        <div class="act">${warn ? `<span class="lab warn">${IC.info}<span>${esc(hint)}</span></span>` : ""}<div class="grp">${pri}</div></div></div></div></div>`;
    fitNote();
  }
  // 动态同步底部决定栏高度至 --decide-h，避免固定 padding-bottom 过少或过多
  if (typeof ResizeObserver === "function") {
    new ResizeObserver(() => {
      const h = $("#decide").hidden ? 0 : Math.ceil($("#decide").getBoundingClientRect().height);
      document.documentElement.style.setProperty("--decide-h", `${h}px`);
    }).observe($("#decide"));
  }
  $("#decide").addEventListener("click", (e) => {
    if (sharedClick(e)) return;
    if (e.target.closest("[data-more]")) return openSheet("more");
    const b = e.target.closest("[data-act]");
    if (b) act(b.dataset.act, b.dataset.key);
  });
  // 用户点了某个结论：窄屏先弹确认面板，宽屏直接提交
  function act(status, key) {
    const c = S.card; if (!c || isDone(c) || S.busy) return;
    if (!narrow()) return submit(status, key);
    if (status === "chosen") {
      key = key || (swapMode(c) ? shownKey(c) : null) || S.choice || (c.decision?.status === "defaulted" ? c.decision.choice : null);
      if (!key) { toast("先点一个方案"); $("#sec-opts")?.scrollIntoView({ block: "start" }); return; }
    }
    openSheet(status, key);
  }
  function openSheet(status, key) { S.sheet = { act: status, key, warned: false }; renderSheet(); $("#sheet").hidden = false; const f = ["rejected", "answered"].includes(status) ? $("#note") : $("#sheet-ok"); f?.focus({ preventScroll: true }); }
  function closeSheet() { if (!S.sheet) return; S.sheet = null; S.needReason = null; $("#sheet").hidden = true; $("#sheet").innerHTML = ""; if (S.card) renderDecide(); }
  function renderSheet() {
    const c = S.card, s = S.sheet, t = c.type, d = c.decision || {};
    const more = s.act === "more";
    const o = (c.options || []).find((x) => x.key === s.key);
    const title = more ? "先不定" : s.act === "chosen" ? `选定 ${s.key}${o ? "：" + o.title : ""}` : s.act === "answered" ? "回答这个问题"
      : s.act === "approved" ? (t === "动手" ? "做好了" : "通过这张卡") : s.act === "rejected" ? (t === "拍板" ? "两个方案都不要" : t === "动手" ? "这件事做不了" : "打回这张卡") : actLabel(t, s.act);
    const ph = s.act === "answered" ? "你的回答（必填）" : s.act === "rejected" ? "要改什么、哪里不对（写清楚 agent 才知道怎么改）" : more ? "留一句（可不写）" : "补一句（可不写）";
    const okCls = s.act === "rejected" ? "no solid" : "ok";
    const okText = s.act === "answered" ? "发送回答" : s.act === "chosen" ? `确认选 ${s.key}` : `确认${actLabel(t, s.act)}`;
    // 确认面板里把做决定要知道的三样写在明处（2026-11-17）：通过时自查还有几条没过、这个方案的代价、定了以后会怎样
    const nck = (r) => (c.checks || []).filter((x) => x.result === r).length;
    const unchecked = s.act === "approved" && t === "验收" && nck("未通过") + nck("未测") ? `<div class="sheet-alert" id="sheet-checks">还有 ${nck("未通过")} 条未通过、${nck("未测")} 条未测</div>` : "";
    const cost = s.act === "chosen" && o?.cost ? `<div class="sheet-then" id="sheet-cost"><span class="k">代价</span>${esc(o.cost)}</div>` : "";
    const aft = c.after || {};
    const thenText = more ? "" : s.act === "rejected" ? aft.reject : ["approved", "chosen", "answered"].includes(s.act) ? aft.approve : "";
    const then = thenText ? `<div class="sheet-then" id="sheet-then"><span class="k">定了以后</span>${esc(thenText)}</div>` : "";
    const dflt = d.status === "defaulted" && !more ? `<div class="dflt-note">这张卡已按推荐 ${esc(d.choice || "")} 先推进（不是你点的）。${s.act === "chosen" && s.key === d.choice ? "你点确认，就算你定了。" : "你点了，agent 会照你的改回来。"}</div>` : "";
    $("#sheet").innerHTML = `<div class="sheet-bg" data-close></div>
      <div class="sheet-box" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <h3 id="sheet-title" class="${s.act === "rejected" ? "no" : ""}">${esc(title)}</h3>${unchecked}${dflt}${cost}${then}
        ${composer(ph, null, null, true)}
        ${S.pins.length || S.dnotes.length ? `<div class="pins">${pinsHtml()}</div>` : ""}
        <div class="warn" id="sheet-warn"${s.act === "rejected" && needing(c) ? "" : " hidden"}>${s.act === "rejected" && needing(c) ? esc(reasonAsk(t)) : ""}</div>
        <div class="sheet-btns">${more
          ? `<button class="btn quiet" data-close>取消</button><button class="btn" data-go="dropped">不用处理</button><button class="btn primary" data-go="snoozed" id="sheet-ok">稍后再看</button>`
          : `<button class="btn quiet" data-close>取消</button><button class="btn ${okCls}" id="sheet-ok" data-go="${s.act}">${esc(okText)}</button>`}</div>
      </div>`;
    fitNote();
  }
  $("#sheet").addEventListener("click", (e) => {
    if (sharedClick(e)) return;
    if (e.target.closest("[data-close]")) return closeSheet();
    const go = e.target.closest("[data-go]");
    if (go && S.sheet) submit(go.dataset.go, S.sheet.key);
  });
  // 手机键盘弹出来时，把面板抬到键盘上面
  if (window.visualViewport) {
    const lift = () => { const v = visualViewport; $("#sheet").style.setProperty("--kb", `${Math.max(0, innerHeight - v.height - v.offsetTop)}px`); };
    visualViewport.addEventListener("resize", lift); visualViewport.addEventListener("scroll", lift);
  }
  // 空着理由不能打回（2026-11-17 用户定）：意见、图上批注、文件批注、贴图四样都没有时，「打回 / 都不要 / 做不了」提交不了。
  // 电脑上意见框变红、上面那行小字换成红字，光标进意见框；手机上确认面板里出同一句红字，面板不关。写了字或加了批注、图就自己消掉。
  const hasReason = () => !!(S.note.trim() || S.pins.length || S.dnotes.length || S.imgs.length);
  const reasonAsk = (t) => t === "拍板" ? "写一句为什么都不要，再点「都不要」" : t === "动手" ? "写一句卡在哪，再点「做不了」" : "写一句或钉一处，再打回";
  const needing = (c) => !!c && S.needReason === c.id && !hasReason();
  function needReason(c) {
    S.needReason = c.id;
    if (S.sheet) { const w = $("#sheet-warn"); if (w) { w.textContent = reasonAsk(c.type); w.hidden = false; } }
    else renderDecide();
    $("#note")?.focus();
  }
  function clearNeed() {
    S.needReason = null;
    const f = $("#decide .field.need"); if (f) { f.classList.remove("need"); const l = f.querySelector(".lab"); if (l) l.textContent = "补充你的判断"; $("#note")?.setAttribute("aria-label", "补充你的判断"); }
    const w = $("#sheet-warn"); if (w) w.hidden = true;
  }
  async function submit(status, key) {
    const c = S.card; if (!c || isDone(c) || S.busy) return;
    const note = S.note.trim();
    let choice = null;
    if (status === "chosen") { choice = key || S.choice; if (!choice) return toast("先选一个方案（点方案卡片，或按 1–9）"); }
    if (status === "answered" && !note) { $("#note")?.focus(); return toast("回答不能空着"); }
    if (S.uploading) return toast("图还在传，等一下再点");
    if (status === "rejected" && !hasReason()) return needReason(c);
    const before = ordered().map((x) => x.id), pos = before.indexOf(c.id);
    S.busy = true;
    try {
      const card = await api(`/api/cards/${c.id}/decision`, { status, choice, note, pins: S.pins, images: S.imgs, doc_notes: S.dnotes });
      if (S.card?.id === c.id) S.card = card; // 先换成新版本，免得刷新列表时又重拉一次、和跳下一张抢
      S.pins = []; S.dnotes = []; S.imgs = []; S.choice = null; S.note = "";
      closeSheet();
      await loadList();
      // 跳到队列里它后面的下一张待审；后面没有就从头找；都没有就留在本卡看结论
      const pend = ordered().filter((x) => !isDone(x) && x.status !== "snoozed" && x.id !== c.id);
      const next = pend.find((x) => before.indexOf(x.id) > pos) || pend[0];
      toast(`已记下：${actLabel(c.type, status, choice)}。agent 会读到。${next ? "" : "这一组没有等你看的了。"}`);
      if (next) location.hash = `#/card/${next.id}`; else if (S.card?.id === c.id) { renderCard(true); renderQueue(); }
    } catch (e) { if (e.auth) showLogin(e.message + "；刚才的结论没写进去，登录后再点一次（意见和批注还在）"); else toast("没写进去：" + e.message); }
    finally { S.busy = false; }
  }

  // ---------- 键盘 ----------
  document.addEventListener("keydown", (e) => {
    if (!$("#login").hidden) return; // 登录框开着时快捷键都不生效
    if (document.body.dataset.view === "progress") return; // 进度页上 J / K / 回车不当快捷键（不然会跳到看不见的卡、给看不见的卡下结论）
    if (S.doc) { if (e.key === "Escape") { e.preventDefault(); closeDoc(); } return; } // 正在读文件：只认 Esc，别的键不当快捷键（回车不能变成「通过」）
    if ($("#lb").classList.contains("on")) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.tagName === "INPUT" && e.target.type !== "range") return;
      if (e.key === "Escape") closeLb();
      // ← →：看连拍时一帧一帧换（进度条自己有焦点时让它自己处理，免得一下走两帧）；别的图是换上一张、下一张图
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (e.target.id === "lb-range") return;
        e.preventDefault();
        const d = e.key === "ArrowLeft" ? -1 : 1, fr = S.lb.list[S.lb.i].fr;
        if (fr && fr.srcs.length > 1) lbFrame(fr.k + d); else lbStep(d);
      }
      if (e.key.toLowerCase() === "p") { e.preventDefault(); $("#lb-pin").click(); }
      return;
    }
    const typing = ["TEXTAREA", "INPUT", "SELECT"].includes(e.target.tagName) || e.target.isContentEditable;
    const cmdEnter = e.key === "Enter" && (e.metaKey || e.ctrlKey);
    if (S.sheet) { // 确认面板开着：Esc 关，⌘↵ 确认；别的键不当快捷键
      if (e.key === "Escape") { e.preventDefault(); closeSheet(); }
      else if (cmdEnter) { e.preventDefault(); $("#sheet-ok")?.click(); }
      return;
    }
    if (typing && !cmdEnter) {
      if (e.key === "Escape" && e.target.id === "f-q") { e.preventDefault(); S.q = ""; e.target.value = ""; renderQueue(); e.target.blur(); }
      return;
    }
    if (!cmdEnter && (e.metaKey || e.ctrlKey || e.altKey)) return;
    if (e.key === "/" && !typing) { e.preventDefault(); if (S.navMode === "collapsed" && roomy()) setPeek(true); $("#f-q")?.focus(); return; }
    if (e.key === "Escape" && $(".keys[open]")) { $(".keys[open]").open = false; return; }
    if (e.key === "Enter" && !typing && ["BUTTON", "A", "SUMMARY"].includes(e.target.tagName)) return;
    if (document.body.dataset.view === "list" && (e.key === "ArrowDown" || e.key === "ArrowUp")) return; // 列表页上 ↑ ↓ 留给滚页面
    const list = ordered(), i = document.body.dataset.view === "card" ? list.findIndex((x) => x.id === S.card?.id) : -1; // 列表页上 J / K 从第一张开始
    if (e.key === "j" || e.key === "ArrowDown") { const n = list[i < 0 ? 0 : Math.min(list.length - 1, i + 1)]; if (n) location.hash = `#/card/${n.id}`; e.preventDefault(); return; }
    if (e.key === "k" || e.key === "ArrowUp") { const n = list[i < 0 ? 0 : Math.max(0, i - 1)]; if (n) location.hash = `#/card/${n.id}`; e.preventDefault(); return; }
    // ← →：卡上的连拍换帧。卡上有几组连拍时，换屏幕上能看见的第一组；一组都看不见就不动
    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && S.card && document.body.dataset.view === "card") {
      const fig = $$("[data-frames]").find((f) => { const r = f.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
      if (fig?.step) { e.preventDefault(); fig.step(e.key === "ArrowLeft" ? -1 : 1); }
      return;
    }
    if (!S.card || isDone(S.card) || document.body.dataset.view !== "card") return;
    const t = S.card.type, k = e.key.toLowerCase();
    if (/^[1-9]$/.test(e.key) && t === "拍板") { const o = (S.card.options || [])[+e.key - 1]; if (o) { e.preventDefault(); pick(o.key); } return; }
    if (e.key === "Enter") { e.preventDefault(); if (t === "拍板") act("chosen"); else if (t === "回答问题") act("answered"); else act("approved"); return; }
    if (k === "r" && t !== "回答问题") { e.preventDefault(); act("rejected"); return; } // 空着理由时 submit 会拦住，把意见框标红
    if (k === "s") { e.preventDefault(); act("snoozed"); }
  });

  // ---------- file 证据点开看：Markdown 排版成网页，别的文字原样显示 ----------
  // 先整段转义、再加标签：文件里写的 HTML、脚本只会原样显示成字，不会被执行。链接只认 http(s)。
  function mdInline(s) {
    const keep = [], hold = (h) => { keep.push(h); return `\u0000${keep.length - 1}\u0000`; };
    let t = esc(s);
    t = t.replace(/`([^`]+)`/g, (_, c) => hold(`<code>${c}</code>`));
    t = t.replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, (_, alt, u) => hold(/^https?:\/\//.test(u) ? `<a href="${u}" target="_blank" rel="noopener">图：${alt || u}</a>` : `<span class="doc-img">［图：${alt || u}］</span>`));
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, (_, txt, u) => (/^https?:\/\//.test(u) ? hold(`<a href="${u}" target="_blank" rel="noopener">${txt}</a>`) : `${txt}（${u}）`));
    t = t.replace(/(^|[\s(（：:，,])(https?:\/\/[^\s<)）]+)/g, (_, p, u) => p + hold(`<a href="${u}" target="_blank" rel="noopener">${u}</a>`));
    t = t.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/__([^_]+)__/g, "<b>$1</b>").replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<i>$2</i>").replace(/~~([^~]+)~~/g, "<s>$1</s>");
    while (/\u0000\d+\u0000/.test(t)) t = t.replace(/\u0000(\d+)\u0000/g, (_, k) => keep[+k]);
    return t;
  }
  // lines 是 [{ t: 这一行的字, n: 它在文件里是第几行 }]。排出来的每一段都带 data-ln（第几行）：用户点着这一段写批注，agent 按行号找回去
  function mdBlocks(lines) {
    const LI = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/, indent = (l) => l.match(/^\s*/)[0].length;
    const para = [];
    let out = "", i = 0;
    const flush = () => { if (para.length) { out += `<p data-ln="${para[0].n}">${para.map((x) => mdInline(x.t)).join("<br>")}</p>`; para.length = 0; } };
    while (i < lines.length) {
      const l = lines[i].t, n = lines[i].n;
      let m;
      if ((m = l.match(/^\s*(```|~~~)/))) { // 代码块
        flush(); const buf = []; i++;
        while (i < lines.length && !lines[i].t.trim().startsWith(m[1])) buf.push(lines[i++].t);
        i++; out += `<pre data-ln="${n}"><code>${esc(buf.join("\n"))}</code></pre>`; continue;
      }
      if (!l.trim()) { flush(); i++; continue; }
      if ((m = l.match(/^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/))) { flush(); const lv = Math.min(4, m[1].length); out += `<h${lv} data-ln="${n}">${mdInline(m[2])}</h${lv}>`; i++; continue; }
      if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(l)) { flush(); out += "<hr>"; i++; continue; }
      if (/^\s{0,3}>/.test(l)) { // 引用
        flush(); const buf = [];
        while (i < lines.length && /^\s{0,3}>/.test(lines[i].t)) { buf.push({ t: lines[i].t.replace(/^\s{0,3}>\s?/, ""), n: lines[i].n }); i++; }
        out += `<blockquote>${mdBlocks(buf)}</blockquote>`; continue;
      }
      if (l.includes("|") && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lines[i + 1]?.t || "")) { // 表格
        flush();
        const cells = (r) => r.replace(/\\\|/g, "\u0001").trim().replace(/^\||\|$/g, "").split("|").map((c) => mdInline(c.trim().replace(/\u0001/g, "|")));
        const head = cells(l), rows = []; i += 2;
        while (i < lines.length && lines[i].t.trim() && lines[i].t.includes("|")) { rows.push({ c: cells(lines[i].t), n: lines[i].n }); i++; }
        out += `<div class="doc-tbl"><table><thead><tr>${head.map((c) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr data-ln="${r.n}">${head.map((_, k) => `<td>${r.c[k] || ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
        continue;
      }
      if ((m = l.match(LI))) { // 列表：同一级缩进的是并排的条目，缩进更深的归上一条（子列表、续行）
        flush();
        const base = m[1].length, ordered = /\d/.test(m[2]), start = ordered ? parseInt(m[2], 10) : 1, items = [];
        while (i < lines.length) {
          const cur = lines[i].t, mm = cur.match(LI);
          if (mm && mm[1].length < base) break;
          if (mm && mm[1].length <= base + 1) { if (items.length && /\d/.test(mm[2]) !== ordered) break; items.push({ text: mm[3], n: lines[i].n, kids: [] }); i++; continue; }
          if (!cur.trim()) {
            let k = i + 1; while (k < lines.length && !lines[k].t.trim()) k++;
            const nx = lines[k]?.t, nm = nx?.match(LI);
            if (nx !== undefined && (indent(nx) > base || (nm && nm[1].length === base && /\d/.test(nm[2]) === ordered))) { items[items.length - 1].kids.push(lines[i]); i++; continue; }
            break;
          }
          if (indent(cur) > base) { items[items.length - 1].kids.push(lines[i]); i++; continue; }
          if (lines[i - 1].t.trim() && !items[items.length - 1].kids.length) { items[items.length - 1].text += "\n" + cur.trim(); i++; continue; } // 没缩进但紧跟着：算这一条的续行
          break;
        }
        const tag = ordered ? "ol" : "ul";
        out += `<${tag}${ordered && start !== 1 ? ` start="${start}"` : ""}>${items.map((it) => {
          const real = it.kids.filter((k) => k.t.trim()), cut = real.length ? Math.min(...real.map((k) => indent(k.t))) : 0;
          const task = it.text.match(/^\[( |x|X)\]\s+([\s\S]*)$/), text = (task ? task[2] : it.text).split("\n").map(mdInline).join("<br>");
          return `<li data-ln="${it.n}"${task ? ' class="task"' : ""}>${task ? `<span class="box">${task[1] === " " ? "☐" : "☑"}</span>` : ""}<span class="li-t">${text}</span>${real.length ? mdBlocks(it.kids.map((k) => ({ t: k.t.slice(Math.min(cut, indent(k.t))), n: k.n }))) : ""}</li>`;
        }).join("")}</${tag}>`;
        continue;
      }
      para.push({ t: l.trim(), n }); i++;
    }
    flush();
    return out;
  }
  const docLines = (src) => src.replace(/\r\n?/g, "\n").replace(/[\u0000\u0001]/g, "").split("\n").map((t, k) => ({ t, n: k + 1 }));
  const mdDoc = (src) => mdBlocks(docLines(src));
  // 不是 Markdown 的文字：原样一行一行摆，每一行（空行除外）也能点着写批注
  const plainDoc = (src) => `<div class="doc-plain">${docLines(src).map((x) => (x.t.trim() ? `<div class="pl" data-ln="${x.n}">${esc(x.t)}</div>` : `<div class="pl">&nbsp;</div>`)).join("")}</div>`;
  function decodeText(buf) {
    const b = new Uint8Array(buf);
    if (b[0] === 0xff && b[1] === 0xfe) return new TextDecoder("utf-16le").decode(buf);
    if (b[0] === 0xfe && b[1] === 0xff) return new TextDecoder("utf-16be").decode(buf);
    try { return new TextDecoder("utf-8", { fatal: true }).decode(buf); } catch { return new TextDecoder("gb18030").decode(buf); } // 不是 UTF-8 的中文文件多半是 GBK
  }
  // 读到哪了：同一份文件关掉再打开，回到上次的位置。记在这台设备上，只留最近 60 份
  const docPos = { all: () => { try { return JSON.parse(store.get("rc-docpos") || "{}"); } catch { return {}; } },
    get: (k) => docPos.all()[k] || 0,
    set: (k, y) => { const m = docPos.all(); delete m[k]; if (y > 0) m[k] = Math.round(y); const ks = Object.keys(m); ks.slice(0, Math.max(0, ks.length - 60)).forEach((x) => delete m[x]); store.set("rc-docpos", JSON.stringify(m)); } };
  const docFile = () => (S.doc ? S.card?.evidence?.[S.doc.i]?.file : null);
  const fitDocNote = () => { const t = $("#doc-note"); t.style.height = "auto"; t.style.height = Math.min(120, t.scrollHeight) + "px"; };
  // line：打开后直接滚到这一行那一段（从卡片上点某一条文件批注进来的）
  async function openDoc(i, line) {
    const c = S.card, e = c?.evidence?.[i];
    if (!e?.file) return;
    const url = asset(c.id, e.file), x = extOf(e.file), body = $("#doc-body"), done = isDone(c);
    $("#doc-title").textContent = e.label || e.file;
    $("#doc-raw").href = url; $("#doc-raw").setAttribute("download", e.file);
    body.innerHTML = `<p class="doc-wait">正在打开…</p>`;
    S.doc = { id: c.id, i, dirty: false };
    $("#doc").hidden = false; $("#doc").classList.toggle("can-note", !done); document.body.classList.add("doc-open");
    $("#doc-note").value = S.note; $("#doc-note").hidden = done; fitDocNote();
    $("#doc-done").textContent = done ? "回到卡片" : "读完了，回到卡片";
    docCount();
    history.pushState({ doc: 1 }, ""); // 手机上按「返回」是关掉这一页回到卡片，不是离开卡片
    body.focus(); // 焦点放在正文上：方向键、空格能翻页；不放在按钮上，免得随手按回车把这一页关了
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(r.status === 401 ? "登录过期了，刷新页面重新登录" : r.status === 404 ? "服务器上没有这份文件" : `服务器回了 ${r.status}`);
      const text = decodeText(await r.arrayBuffer()).replace(/^﻿/, "");
      if (S.doc?.id !== c.id || S.doc.i !== i) return;
      body.innerHTML = x === "md" || x === "markdown" ? mdDoc(text) : plainDoc(text);
      drawDocNotes();
      const at = line && body.querySelector(`[data-ln="${line}"]`);
      if (at) at.scrollIntoView({ block: "center" }); else body.scrollTop = docPos.get(`${c.id}/${e.file}`);
    } catch (err) {
      if (S.doc?.id === c.id && S.doc.i === i) body.innerHTML = `<p class="doc-wait">打不开这份文件：${esc(err.message || err)}。可以点右上角「下载」试试。</p>`;
    }
  }
  function closeDoc(fromBack) {
    if (!S.doc) return;
    saveDocNote();
    const i = S.doc.i, dirty = S.doc.dirty, f = docFile();
    if (f && !$("#doc-body .doc-wait")) docPos.set(`${S.doc.id}/${f}`, $("#doc-body").scrollTop);
    S.doc = null; $("#doc").hidden = true; document.body.classList.remove("doc-open"); $("#doc-body").innerHTML = "";
    if (dirty) renderCard(true); // 写过批注：卡上「批注 N 条」和决定栏里的列表跟着变
    else { const t = $("#note"); if (t) { t.value = S.note; fitNote(); } if (narrow()) renderDecide(); }
    $(`#card [data-doc="${i}"]`)?.focus({ preventScroll: true }); // 焦点回到「打开看」上：紧接着再按回车是重新打开，不会变成「通过」
    if (!fromBack && history.state?.doc) history.back();
  }
  // ---- 读文件时写批注：点正文里任意一段，在它下面写一句。记下哪份文件、第几行、那一段开头的原文，随结论一起交给 agent ----
  const docCount = () => { const f = docFile(), k = shownDnotes().filter((n) => n.file === f).length;
    $("#doc-count").textContent = isDone(S.card) ? (k ? `这张卡已经定了，下面是你当时写的 ${k} 条批注` : "这张卡已经定了，只能看") : k ? `这份文件批注 ${k} 条，会随结论一起交给 agent` : "点正文里任意一段，可以对着它写批注"; };
  // 批注放在哪：表格的一行 → 它下面插一行；列表的一条 → 接在这一条自己的字后面（子列表前面）；别的 → 这一段后面
  function placeNote(el, node) {
    if (el.tagName === "TR") { const tr = document.createElement("tr"), td = document.createElement("td"); tr.className = "dnote-tr"; td.colSpan = 99; td.appendChild(node); tr.appendChild(td); el.after(tr); }
    else if (el.tagName === "LI") (el.querySelector(":scope > .li-t") || el).after(node);
    else el.after(node);
  }
  const quoteOf = (el) => (el.tagName === "TR" ? [...el.cells].map((c) => c.textContent.trim()).join(" | ") : (el.tagName === "LI" ? el.querySelector(":scope > .li-t") : el)?.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
  function drawDocNotes() {
    const body = $("#doc-body"), f = docFile(), done = isDone(S.card);
    body.querySelectorAll(".dnote-tr, .dnote").forEach((x) => x.remove());
    body.querySelectorAll(".noted").forEach((x) => x.classList.remove("noted"));
    shownDnotes().forEach((n, k) => {
      if (n.file !== f) return;
      const el = body.querySelector(`[data-ln="${n.line}"]`);
      if (!el) return;
      el.classList.add("noted");
      const d = document.createElement("div");
      d.className = "dnote"; d.dataset.k = k;
      d.innerHTML = `<span class="dn-k">批注</span><span class="dn-t">${esc(n.text)}</span>${done ? "" : `<button data-dedit>改</button><button data-ddel>删</button>`}`;
      placeNote(el, d);
    });
    docCount();
  }
  // 正在写的那一条：保存（空的就算删掉）
  function saveDocNote() {
    const ed = $("#doc-body .dnote-edit");
    if (!ed) return;
    const f = docFile(), line = +ed.dataset.ln, text = ed.querySelector("textarea").value.trim(), at = S.dnotes.findIndex((n) => n.file === f && n.line === line);
    if (at >= 0 && !text) S.dnotes.splice(at, 1);
    else if (at >= 0) S.dnotes[at].text = text;
    else if (text) S.dnotes.push({ file: f, line, quote: ed.dataset.quote || "", text });
    if (at >= 0 || text) S.doc.dirty = true;
    ed.closest(".dnote-tr")?.remove(); ed.remove();
    drawDocNotes();
  }
  function editDocNote(el) {
    saveDocNote();
    const f = docFile(), line = +el.dataset.ln, old = S.dnotes.find((n) => n.file === f && n.line === line);
    $("#doc-body").querySelectorAll(".dnote").forEach((x) => { if (S.dnotes[+x.dataset.k] === old && old) { x.closest(".dnote-tr")?.remove(); x.remove(); } });
    const ed = document.createElement("div");
    ed.className = "dnote dnote-edit"; ed.dataset.ln = line; ed.dataset.quote = quoteOf(el);
    ed.innerHTML = `<textarea rows="2" placeholder="对这一段想说什么？回车记下，Shift+回车换行，Esc 取消" aria-label="对这一段的批注"></textarea><div class="dn-btns"><button class="btn quiet" data-dcancel>取消</button><button class="btn primary" data-dsave>记下这条</button></div>`;
    placeNote(el, ed);
    const t = ed.querySelector("textarea");
    t.value = old?.text || "";
    t.focus();
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); e.stopPropagation(); saveDocNote(); $("#doc-body").focus(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); ed.closest(".dnote-tr")?.remove(); ed.remove(); drawDocNotes(); $("#doc-body").focus(); }
    });
  }
  $("#doc-body").addEventListener("click", (e) => {
    if (!S.doc || isDone(S.card)) return;
    const ed = e.target.closest(".dnote-edit");
    if (ed) { if (e.target.closest("[data-dsave]")) saveDocNote(); else if (e.target.closest("[data-dcancel]")) { ed.closest(".dnote-tr")?.remove(); ed.remove(); drawDocNotes(); } return; }
    const dn = e.target.closest(".dnote");
    if (dn) {
      const n = S.dnotes[+dn.dataset.k], el = n && $("#doc-body").querySelector(`[data-ln="${n.line}"]`);
      if (e.target.closest("[data-ddel]")) { saveDocNote(); S.dnotes.splice(S.dnotes.indexOf(n), 1); S.doc.dirty = true; drawDocNotes(); }
      else if (el) editDocNote(el); // 点「改」或点这条批注本身
      return;
    }
    if (e.target.closest("a") || !getSelection().isCollapsed) return; // 点链接、选中了一段字：不算要写批注
    const el = e.target.closest("[data-ln]");
    if (el) editDocNote(el);
  });
  $("#doc-note").addEventListener("input", (e) => { S.note = e.target.value; fitDocNote(); });
  $("#doc-done").addEventListener("click", () => closeDoc());
  $("#doc-close").addEventListener("click", () => closeDoc());
  window.addEventListener("popstate", () => closeDoc(true));
  window.addEventListener("pagehide", () => { const f = docFile(); if (f && !$("#doc-body .doc-wait")) docPos.set(`${S.doc.id}/${f}`, $("#doc-body").scrollTop); });

  // ---------- 进度页（2026-11-18 简版，照「方案稿/2026-11-17-进度页.md」第一步）----------
  // 只用审核中心自己的卡：打开时读一次 /api/cards?full=1（带每张卡的记录），之后每分钟读一次，页面不在前台时不读。
  // 每样东西怎么算都在 PG 里，是不碰页面的纯函数（自测 tests/test_progress.mjs 直接调 window.RCProgress 核对）。
  const PG = (() => {
    const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
    const WAITING = ["pending", "snoozed", "defaulted"]; // 等你：待审、稍后再看、按推荐先推进了等你确认（和顶栏「待你处理」的数一致）
    const AGENT_OWES = ["approved", "chosen", "rejected", "answered"]; // 你给了结论、agent 还没关：球在它那边（「不用处理」不送 agent，不算）
    const DECIDED = ["approved", "chosen", "rejected", "answered", "dropped"]; // 最近 7 天「你定了」数的这几种（稍后再看不算定了）
    const MOVES = ["created", "updated", "closed"]; // agent 的动静：提卡、交新版、关卡
    const NO_PROJECT = "（没写项目）", NO_AGENT = "（没写 agent）";
    const stOf = (c) => (c.decision && c.decision.status) || c.status || "pending";
    const ms = (iso) => { const x = Date.parse(iso || ""); return isNaN(x) ? null : x; };
    const hist = (c) => (Array.isArray(c.history) ? c.history : []).filter((h) => h && typeof h === "object" && ms(h.at) != null);
    const projectOf = (c) => String(c.project || "").trim() || NO_PROJECT; // 页面上用卡上的叫法
    const agentOf = (c) => String(c.agent || "").trim() || NO_AGENT;
    const isExample = (p) => /[（(]示例[)）]/.test(p); // 「仙境的明天（示例）」这种示例项目不显示
    const hot = (c) => c.urgency === "🔴" && stOf(c) === "pending"; // 卡住进度：和侧栏的红点一个算法（稍后、按推荐先推进的不算）
    // 这张卡从哪一刻开始等你：提卡、交新一版、改回待审里最晚的一个（和 review.py 的 pending_since 一个算法）
    const since = (c) => { const ts = hist(c).filter((h) => ["created", "updated", "reopened"].includes(h.event)).map((h) => ms(h.at)); return ts.length ? Math.max(...ts) : ms(c.updated_at) ?? ms(c.created_at); };
    const moves = (c) => {
      const out = hist(c).filter((h) => MOVES.includes(h.event)).map((h) => ({ at: ms(h.at), event: h.event, card: c }));
      if (!out.length && ms(c.created_at) != null) out.push({ at: ms(c.created_at), event: "created", card: c }); // 老卡没有记录：至少有提卡时间
      return out;
    };
    const latest = (cards) => cards.flatMap(moves).reduce((a, b) => (!a || b.at > a.at ? b : a), null);
    // 等你的卡排的先后：卡住进度 → 按推荐先推进了 → 不急 → 稍后再看；同一组里等得久的在前
    const rank = (c) => (hot(c) ? 0 : stOf(c) === "defaulted" ? 1 : stOf(c) === "snoozed" ? 3 : 2);
    const byWait = (a, b) => rank(a) - rank(b) || (since(a) ?? 0) - (since(b) ?? 0);
    function basic(cards, name, now) {
      const waiting = cards.filter((c) => WAITING.includes(stOf(c))).sort(byWait);
      const ages = waiting.map((c) => now - (since(c) ?? now));
      const last = latest(cards);
      return { name, total: cards.length, waiting, red: waiting.filter(hot).length, longest: ages.length ? Math.max(...ages) : 0,
        owes: cards.filter((c) => AGENT_OWES.includes(stOf(c))), last, quiet: !last || now - last.at > DAY };
    }
    const real = (cards) => (cards || []).filter((c) => c && !isExample(projectOf(c)));
    // 总览：每个项目一行。排在前面的：卡住进度多的 → 等你多的 → 最近有动静的
    function overview(cards, now) {
      const list = real(cards), names = [...new Set(list.map(projectOf))];
      return names.map((p) => basic(list.filter((c) => projectOf(c) === p), p, now))
        .sort((a, b) => b.red - a.red || b.waiting.length - a.waiting.length || (b.last?.at ?? 0) - (a.last?.at ?? 0) || a.name.localeCompare(b.name, "zh"));
    }
    // 一个项目：等你的卡、每个 agent 一行、最近 7 天、卡上写的「不处理会卡住」。没有这个项目返回 null
    function detail(cards, name, now) {
      if (isExample(name)) return null;
      const mine = real(cards).filter((c) => projectOf(c) === name);
      if (!mine.length) return null;
      const base = basic(mine, name, now);
      const agents = [...new Set(mine.map(agentOf))].map((a) => {
        const cs = mine.filter((c) => agentOf(c) === a), last = latest(cs);
        return { name: a, waiting: cs.filter((c) => WAITING.includes(stOf(c))).length, owes: cs.filter((c) => AGENT_OWES.includes(stOf(c))).length,
          last, doing: last ? last.card : null, quiet: !last || now - last.at > DAY };
      }).sort((x, y) => y.waiting - x.waiting || y.owes - x.owes || (y.last?.at ?? 0) - (x.last?.at ?? 0));
      // 最近 7 天：从每张卡的记录里数。「你定了」按卡算（同一张卡 7 天里定过两次，算最后那次）；agent 关了几张也按卡算
      const from = now - 7 * DAY;
      const evs = mine.flatMap((c) => hist(c).map((h) => ({ at: ms(h.at), event: h.event, who: h.who, note: h.note || "", card: c }))).filter((e) => e.at >= from && e.at <= now + MIN);
      const dec = evs.filter((e) => e.who === "用户" && DECIDED.includes(e.event)), closed = evs.filter((e) => e.event === "closed");
      const lastDec = new Map();
      dec.forEach((e) => { const o = lastDec.get(e.card.id); if (!o || e.at >= o.at) lastDec.set(e.card.id, e); });
      const kinds = {};
      for (const e of lastDec.values()) kinds[e.event] = (kinds[e.event] || 0) + 1;
      const week = { decided: lastDec.size, kinds, closed: new Set(closed.map((e) => e.card.id)).size, timeline: [...dec, ...closed].sort((a, b) => b.at - a.at) };
      // 不处理会卡住：卡上写的原话（去掉前后空格，别的不加工），按写了它的卡数从多到少
      const bc = new Map();
      mine.forEach((c) => new Set((Array.isArray(c.blocks) ? c.blocks : []).map((s) => String(s).trim()).filter(Boolean)).forEach((s) => bc.set(s, (bc.get(s) || 0) + 1)));
      const blocks = [...bc].map(([text, n]) => ({ text, n })).sort((a, b) => b.n - a.n || a.text.localeCompare(b.text, "zh"));
      return { ...base, agents, week, blocks, inHand: inHand(mine, now) };
    }
    // ---- 接下来（2026-11-18，方案稿/2026-11-18-进度页-接下来.md 第一块）：只用卡上的 after（agent 写的「你定了以后我会做什么」）----
    const SHOW_FIRST = 6, STALE = 2 * DAY; // 「agent 手上在做的」先显示几件；定了多久还没关算拖了
    const txt = (s) => String(s ?? "").trim();
    // 等你的卡下面那一行：前面的小字按卡的类型（和卡片页「你定了以后」那一栏的说法一致）；after.approve 空就没有这一行
    const NEXT_LEAD = { 验收: "你通过以后：", 拍板: "你选定以后：", 动手: "你做好以后：", 回答问题: "你回答以后：" };
    const nextOf = (c) => { const t = txt(c.after && c.after.approve); return t ? { lead: NEXT_LEAD[c.type] || NEXT_LEAD.验收, text: t } : null; };
    // 你定了什么（一句话）、取 after 的哪一样
    function verdict(c) {
      const st = stOf(c), t = c.type;
      if (st === "approved") return { text: t === "动手" ? "你做好了" : "你通过了", side: "approve" };
      if (st === "chosen") { const k = txt(c.decision && c.decision.choice); return { text: k ? `你选了 ${k}` : "你选定了", side: "approve" }; }
      if (st === "answered") return { text: "你回答了", side: "approve" };
      if (st === "rejected") return { text: t === "拍板" ? "你都不要" : t === "动手" ? "你做不了" : t === "回答问题" ? "你答不上来" : "你打回了", side: "reject" };
      return null;
    }
    // 你是什么时候定的：decision.at；老卡没写就找记录里你最后一次给这个结论的时间
    const decidedAt = (c) => {
      const a = ms(c.decision && c.decision.at);
      if (a != null) return a;
      const ts = hist(c).filter((h) => h.event === stOf(c)).map((h) => ms(h.at));
      return ts.length ? Math.max(...ts) : null;
    };
    // agent 手上在做的：你定了、它还没关（AGENT_OWES）。定得最久的在前；不知道哪天定的排最后
    function inHand(cards, now) {
      return (cards || []).filter((c) => c && AGENT_OWES.includes(stOf(c))).map((c) => {
        const v = verdict(c), at = decidedAt(c), then = txt(c.after && c.after[v.side]);
        return { card: c, verdict: v.text, side: v.side, at, stale: at != null && now - at > STALE,
          then: then || (v.side === "reject" ? "（卡上没写打回以后做什么）" : "（卡上没写定了以后做什么）"), thenMissing: !then };
      }).sort((a, b) => (a.at ?? Infinity) - (b.at ?? Infinity) || String(a.card.id).localeCompare(String(b.card.id)));
    }
    // 多久以前、等了多久
    const ago = (t, now) => { const m = (now - t) / MIN; return m < 1 ? "刚刚" : m < 60 ? `${Math.floor(m)} 分钟前` : m < 1440 ? `${Math.floor(m / 60)} 小时前` : `${Math.floor(m / 1440)} 天前`; };
    const span = (d) => { const m = d / MIN; return m < 1 ? "不到 1 分钟" : m < 60 ? `${Math.floor(m)} 分钟` : m < 1440 ? `${Math.floor(m / 60)} 小时` : `${Math.floor(m / 1440)} 天`; };
    // ---- 时间表（2026-11-18 卡 20261118-015）：总规划师交的，每个项目一份（review.py plan set），这里只照着画、不核对 ----
    const PLAN_STALE = 3 * DAY, PLAN_STATES = ["没开始", "在做", "等你", "做完"]; // 交了超过 3 天（严格大于）标「可能旧了」
    const STEP_WAIT = ["pending", "snoozed"]; // 一步里「还在等你」的卡：待审、稍后再看（按推荐先推进了的不算，那是 agent 已经往下走了）
    const lookOf = (l, ids) => {
      if (!l || typeof l !== "object") return null;
      const label = txt(l.label);
      if (l.url != null) { const u = txt(l.url); return /^https?:\/\//i.test(u) ? { kind: "url", href: u, label } : { kind: "bad", label }; } // 不是 http(s) 的一律不做成链接
      if (l.card != null) { const id = txt(l.card); return id ? { kind: "card", id, found: ids.has(id), label } : null; }
      return null;
    };
    // 走到第几步 = 第一个不是「做完」的那一步（从 1 数）；都做完了 cur 是 0、allDone 为真。没交过返回 null
    function timetable(plan, cards, now) {
      if (!plan || typeof plan !== "object") return null;
      const ids = new Map((cards || []).filter((c) => c && c.id != null).map((c) => [String(c.id), c]));
      const items = (Array.isArray(plan.items) ? plan.items : []).filter((it) => it && typeof it === "object");
      const states = items.map((it) => (PLAN_STATES.includes(it.state) ? it.state : "没开始"));
      const curIdx = states.findIndex((st) => st !== "做完");
      const steps = items.map((it, i) => {
        const cs = (Array.isArray(it.cards) ? it.cards : []).map(txt).filter(Boolean).map((id) => ({ id, found: ids.has(id), card: ids.get(id) || null }));
        return { n: i + 1, what: txt(it.what), state: states[i], when: txt(it.when), forecast: txt(it.forecast),
          phase: states[i] === "做完" ? "done" : i === curIdx ? "now" : "todo", look: lookOf(it.look, ids), cards: cs,
          waiting: cs.filter((k) => k.found && STEP_WAIT.includes(stOf(k.card))).map((k) => k.card).sort(byWait) };
      });
      const at = ms(plan.at);
      return { agent: txt(plan.agent) || NO_AGENT, at, stale: at == null || now - at > PLAN_STALE, note: txt(plan.note), basis: txt(plan.basis),
        total: steps.length, cur: curIdx + 1, allDone: steps.length > 0 && curIdx < 0, steps };
    }
    return { overview, detail, since, hot, stOf, ago, span, isExample, projectOf, agentOf, nextOf, verdict, inHand, timetable, WAITING, AGENT_OWES, STEP_WAIT, SHOW_FIRST, STALE, PLAN_STALE, PLAN_STATES, DAY, MIN };
  })();
  window.RCProgress = PG; // 给自测用：不碰页面，只算数

  // more：哪些项目点开了「再看 N 件」；open：哪几段长字点了展开（"w:卡号" 等你的卡、"o:卡号" agent 手上的）。每分钟重画照这两样画，不收回去
  // plans：各项目交的时间表（null = 没读到）；tab：项目页看哪个 Tab（地址里的，"" = 默认那个）；
  // steps：时间表里点开了「这一步的卡 N 张」的（"项目#第几步"），每分钟重画也不收回去
  const P = { cards: null, plans: null, at: 0, err: "", loading: false, timer: null, project: "", tab: "", seq: 0, more: new Set(), open: new Set(), steps: new Set(), info: false, ttf: "all" };
  const PG_EVERY = 60000; // 每分钟读一次
  const hm = (t) => new Date(t).toTimeString().slice(0, 5);
  const pkey = (p) => encodeURIComponent(p);
  const DEC_TEXT = { approved: "通过", chosen: "选定", rejected: "打回", answered: "回答", dropped: "不用处理" };
  function markTab() {
    const prog = document.body.dataset.view === "progress";
    // 电脑顶栏正中的分段切换、手机底部 Tab 栏：两处一起标哪页亮着
    $$("#topnav a, #tabbar a").forEach((a) => { const on = (a.dataset.tab === "progress") === prog; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    renderMenu();
  }
  // 进到进度页：从别的页进来读一次；总览和项目之间切换用手上的数据，不重读。
  // 同一个项目里换 Tab：已经往下滚过（Tab 那一行吸住了）就停在 Tab 那一行刚吸住的位置，不跳回页顶
  function showProgress(project, entering, tab = "") {
    const bar = $(".pt-bar"), same = !entering && P.project === project && bar;
    const barY = same ? bar.getBoundingClientRect().top + window.scrollY - $("header.top").offsetHeight : 0;
    const keepAtBar = same && window.scrollY > barY;
    if (project !== P.project) P.ttf = "all"; // 换了项目，时间表筛选回到「全部」
    P.project = project; P.tab = tab;
    markTab();
    renderProgress();
    window.scrollTo(0, keepAtBar ? barY : 0);
    showTab();
    if (entering || !P.cards) loadProgress();
    if (!P.timer) P.timer = setInterval(() => { if (document.visibilityState === "visible") loadProgress(); }, PG_EVERY);
  }
  function stopProgress() { if (P.timer) { clearInterval(P.timer); P.timer = null; } markTab(); }
  // 切回这个标签页时：离上次读已经过了一分钟就马上读一次（页面在后台时那一分钟的定时没读）
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && document.body.dataset.view === "progress" && Date.now() - P.at >= PG_EVERY) loadProgress();
  });
  async function loadProgress() {
    if (P.loading) return;
    P.loading = true;
    try {
      // 时间表和卡一起读；时间表读不到（旧服务器 404、断网）不耽误卡，时间表那个 Tab 写「时间表没读到」。登录过期照卡的办法走
      const [{ cards }, plans] = await Promise.all([api("/api/cards?full=1"),
        api("/api/plans").then((j) => (Array.isArray(j && j.plans) ? j.plans : null), (e) => { if (e.auth) throw e; return null; })]);
      P.cards = Array.isArray(cards) ? cards : []; P.plans = plans; P.at = Date.now(); P.err = "";
    } catch (e) {
      // 登录过期：停掉每分钟的读、丢掉手上的旧数据（登录框后面不留卡片内容）；重新登录后 route() 看到没数据会马上重读
      if (e.auth) { P.loading = false; stopProgress(); P.cards = null; P.plans = null; P.at = 0; P.err = ""; renderProgress(); return showLogin(e.message); }
      P.err = e.message || String(e);
    } finally { P.loading = false; }
    if (document.body.dataset.view === "progress") renderProgress(true);
  }
  // keep：每分钟刷新时不动滚动位置（Tab 那一行横着滚到哪也不动）
  function renderProgress(keep) {
    const box = $("#progress"), now = Date.now(), y = window.scrollY, tx = $(".pt-bar")?.scrollLeft || 0;
    const updated = P.at ? `<button type="button" class="p-upd${P.loading ? " spin" : ""}" id="p-upd" title="点一下立即刷新">${IC.refresh}更新于 ${hm(P.at)}</button>` : `<span class="p-upd" id="p-upd">${P.err ? "" : "正在读…"}</span>`;
    const err = P.err ? `<div class="p-err" role="alert">读不到数据：${esc(P.err)}${P.cards ? `。下面是 ${hm(P.at)} 读到的` : ""}，一分钟后再试。</div>` : "";
    let html;
    if (!P.cards) html = `<div class="p-head"><h1>全部项目</h1>${updated}</div>${err}${P.err ? "" : `<div class="p-empty">正在读卡片…</div>`}`;
    else if (P.project) html = progressDetail(now, updated, err);
    else html = progressOverview(now, updated, err);
    box.innerHTML = `<div class="p-inner">${html}</div>`;
    fitClamps();
    if (keep) { window.scrollTo(0, y); const b = $(".pt-bar"); if (b) b.scrollLeft = tx; }
    barEnd();
  }
  // 手机上 Tab 那一行放不下时横着滑：右边有一道渐隐提示「后面还有」，滑到头就去掉（.end）
  function barEnd() { const b = $(".pt-bar"); if (b) b.classList.toggle("end", b.scrollLeft + b.clientWidth >= b.scrollWidth - 1); }
  // 刚进项目页、换了 Tab：当前那个 Tab 要露出来（只横着滚 Tab 那一行，不动页面）
  function showTab() {
    const b = $(".pt-bar"), a = b && b.querySelector('[aria-current="page"]');
    if (!a) return;
    if (a.offsetLeft < b.scrollLeft) b.scrollLeft = a.offsetLeft - 16;
    else if (a.offsetLeft + a.offsetWidth > b.scrollLeft + b.clientWidth) b.scrollLeft = a.offsetLeft + a.offsetWidth - b.clientWidth + 28;
    barEnd();
  }
  $("#progress").addEventListener("scroll", (e) => { if (e.target.classList && e.target.classList.contains("pt-bar")) barEnd(); }, true);
  // 长字最多 3 行：真超出 3 行的才露出「展开」（要量，画完量一次，窗口变宽窄再量）
  function fitClamps() {
    $$("#progress [data-clamp]").forEach((el) => {
      const btn = el.parentElement.querySelector("[data-open]"), open = P.open.has(el.dataset.clamp);
      el.classList.toggle("open", open);
      if (btn) { btn.hidden = !open && el.scrollHeight <= el.clientHeight + 1; btn.textContent = open ? "收起" : "展开"; btn.setAttribute("aria-expanded", open); }
    });
  }
  let fitT = 0;
  window.addEventListener("resize", () => { clearTimeout(fitT); fitT = setTimeout(() => { if (document.body.dataset.view === "progress") { fitClamps(); barEnd(); } }, 150); });
  $("#progress").addEventListener("click", (e) => {
    if (e.target.closest("#p-upd")) { const b = $("#p-upd"); b?.classList.add("spin"); loadProgress(); return; }
    const f = e.target.closest("[data-ttf]");
    if (f) { P.ttf = f.dataset.ttf; renderProgress(true); return; }
    if (e.target.closest("#p-info")) { P.info = !P.info; $("#p-notes").hidden = !P.info; $("#p-info").setAttribute("aria-expanded", P.info); return; }
    const o = e.target.closest("[data-open]"), m = e.target.closest("[data-more]"), sc = e.target.closest("[data-step]");
    if (sc) { const k = sc.dataset.step; P.steps.has(k) ? P.steps.delete(k) : P.steps.add(k); renderProgress(true); }
    else if (o) { const k = o.dataset.open; P.open.has(k) ? P.open.delete(k) : P.open.add(k); fitClamps(); }
    else if (m) { const k = m.dataset.more; P.more.has(k) ? P.more.delete(k) : P.more.add(k); renderProgress(true); }
  });
  const quietTag = (x) => (x.quiet ? `<span class="state wait p-quiet">没动静</span>` : "");
  const lastText = (x, now) => (x.last ? PG.ago(x.last.at, now) : "没有");
  const waitLine = (x) => `等你 <b>${x.waiting.length}</b> 张${x.waiting.length ? `（${x.red ? `<span class="p-red">${x.red} 张卡住进度</span>，` : ""}最久等了 ${PG.span(x.longest)}）` : ""}`;
  const NO_STAGE = "这个项目没排阶段，看不到走到第几步。";
  const planOf = (name) => (P.plans ? P.plans.find((p) => p && String(p.project ?? "").trim() === name) || null : null);
  const stepsText = (tt) => (tt.allDone ? `${tt.total} 步都做完了` : `${tt.total} 步走到第 <b>${tt.cur}</b> 步`);
  // 总览（2026-11-20 卡 20261120-012 选 A，照 ds-07）：顶上 4 个数字块；每行 项目圆点+名字 | 几步+步数条 | 状态胶囊 | 最近动静。
  // 胶囊里的字和原来一行行的字一样（自测按字认），说明收进标题旁边的 ⓘ，点开才显示
  const stepBar = (tt) => `<span class="p-bar${tt.allDone ? " all" : ""}" style="--n:${tt.total}" aria-hidden="true">${tt.steps.map((s) => `<i class="${s.phase}"></i>`).join("")}</span>`;
  function progressOverview(now, updated, err) {
    const list = PG.overview(P.cards, now);
    let planned = 0;
    const rows = list.map((x) => {
      const tt = PG.timetable(planOf(x.name), P.cards, now), has = tt && tt.total;
      if (has) planned++;
      const prog = has ? `<span class="p-steps">${stepsText(tt)}</span>${stepBar(tt)}` : P.plans ? `<span class="p-nostage">未排阶段</span>` : "";
      const w = x.waiting.length;
      const pills = `<span class="pill${w ? " amber" : ""}">等你 <b>${w}</b> 张</span>${x.red ? `<span class="pill red">${x.red} 张卡住进度</span>` : ""}<span class="pill">你定了、agent 还没做完 <b>${x.owes.length}</b> 张</span>`;
      return `<a class="prow" href="#/progress/${pkey(x.name)}">
        <span class="p-name"><i class="p-dot" style="background:${pColor(x.name)}"></i>${esc(x.name)}</span>
        <span class="p-prog">${prog}</span>
        <span class="p-nums">${pills}</span>
        <span class="p-last">${w ? `<span>最久等了 ${PG.span(x.longest)}</span><i>·</i>` : ""}<span>最近动静：${lastText(x, now)}</span>${quietTag(x)}</span>
        <span class="p-go" aria-hidden="true">›</span></a>`;
    }).join("");
    const note = planned ? "排了时间表的项目写着走到第几步（那是总规划师的预测，没人核对过）；没排的只看得到谁在等谁、最近有没有动静。超过一天没有提卡、交新版、关卡的标「没动静」。"
      : "这些项目都没排阶段，这一页只看得到谁在等谁、最近有没有动静，看不到走到第几步。超过一天没有提卡、交新版、关卡的标「没动静」。";
    const sum = (f) => list.reduce((n, x) => n + f(x), 0), wait = sum((x) => x.waiting.length), red = sum((x) => x.red), owes = sum((x) => x.owes.length);
    const lastP = list.filter((x) => x.last).sort((a, b) => b.last.at - a.last.at)[0];
    const tile = (k, v, sub, cls = "") => `<div class="p-tile"><span class="k">${k}</span><b class="v${cls}">${v}</b><span class="s">${sub}</span></div>`;
    const tiles = `<div class="p-tiles">${tile("活跃项目", `${list.length} 个`, P.plans ? `${planned} 个排了时间表` : "时间表没读到")}${tile("待你处理", `${wait} 张`, red ? `${red} 张卡住进度` : "没有卡住进度的", red ? " red" : "")}${tile("手上在做", `${owes} 张`, "你定了、agent 还没做完")}${tile("最近动静", lastP ? PG.ago(lastP.last.at, now) : "没有", lastP ? esc(lastP.name) : "还没有动静")}</div>`;
    const info = `<button type="button" class="icon-btn p-info" id="p-info" aria-label="这一页怎么看" title="这一页怎么看" aria-expanded="${P.info}" aria-controls="p-notes">${IC.info}</button>`;
    return `<div class="p-head p-head-ov"><h1>全部项目</h1>${list.length ? info : ""}${updated}</div>${err}
      ${list.length ? `<div class="p-notes" id="p-notes"${P.info ? "" : " hidden"}><p class="p-note">${note}</p><p class="p-note">名字带「（示例）」的项目不在这里显示，所以这里加起来可能比顶栏的数少。</p></div>${tiles}<div class="panel plist">${rows}</div>`
        : `<div class="p-empty">还没有卡片。agent 提了卡，这里按项目列出来。</div>`}`;
  }
  // 时间表里用的小图标（线条，跟着字的颜色）
  const ICON = {
    check: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    out: `<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><path d="M9.5 2.5h4v4M13.5 2.5L8 8M12 9.5v3.25c0 .41-.34.75-.75.75h-8a.75.75 0 0 1-.75-.75v-8c0-.41.34-.75.75-.75H6.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    card: `<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><rect x="2" y="3" width="12" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 11.5l3.5-3.5 2.5 2.5 1.5-1.5 3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="10.5" cy="6" r="1.2" fill="currentColor"/></svg>`,
    right: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M6 3.5L10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    down: `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 6L8 10.5 12.5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  };
  // 「这一步的卡」里每张卡现在怎样（站在这一步的角度说）
  const STEP_CARD = { pending: "等你", snoozed: "你说稍后再看", defaulted: "按推荐先推进了", approved: "你通过了，它在做", chosen: "你选了，它在做", rejected: "你打回了，它在改",
    answered: "你回答了，它在做", closed: "做完关了", dropped: "你标了不用处理", withdrawn: "agent 撤回了" };
  // 时间表的筛选：等你 = 标了「等你」或这一步有卡在等你；在做 = 标了「在做」还没做完；已做完 = 做完
  const TTF = { all: () => true, wait: (s) => s.phase !== "done" && (s.state === "等你" || s.waiting.length > 0), doing: (s) => s.phase !== "done" && s.state === "在做", done: (s) => s.phase === "done" };
  const TTF_KEYS = [["all", "全部"], ["wait", "等你"], ["doing", "在做"], ["done", "已做完"]];
  // 时间表 Tab：照「方案稿/2026-11-18-总规划师和时间表.md」和 shots/2026-11-18-顶栏和Tab-方向/Tab-时间表-*.png
  function timetablePane(d, now) {
    if (!P.plans) return `<div class="p-empty">时间表没读到，一分钟后再试。</div>`;
    const ttf = TTF[P.ttf] ? P.ttf : "all";
    const tt = PG.timetable(planOf(d.name), P.cards, now);
    if (!tt) return `<div class="p-empty">总规划师还没排过这个项目。</div>`;
    // 谁排的 · 哪天更新的，后面一个琥珀色「预测」小标签，「是预测，没人核对过」放在它的 title 里（卡 20261120-003 少写字）
    const by = `<div class="tt-by"><span>${esc(tt.agent)}</span><i>·</i><span>${tt.at != null ? mmdd(new Date(tt.at).toISOString()) : "不知道哪天"}</span><span class="tt-pred-tag" title="是预测，没人核对过">预测${IC.info}</span>${tt.stale ? `<span class="tag red p-stale">可能旧了</span>` : ""}</div>`;
    const words = tt.note || tt.basis ? `<section class="panel tt-words"><h2>总规划师的话</h2>${tt.note ? `<p>${md(tt.note)}</p>` : ""}${tt.basis ? `<p class="tt-basis">依据：${esc(tt.basis)}</p>` : ""}</section>` : "";
    if (!tt.total) return `<div class="tt-top">${by}</div><div class="p-empty sm">${esc(tt.agent)} 交的时间表里现在没有步骤。</div>${words}`;
    const STATE_TAG = { 在做: "blue", 等你: "amber" };
    const look = (l) => {
      const cap = (t, cls = "") => `<span class="tt-cap${cls}">${esc(t)}</span>`;
      if (!l) return ""; // 没有能看的就空着，不再写「还没有能看的」
      if (l.kind === "url") return `${cap(l.label || "线上页面")}<a class="btn-ghost tt-go" href="${esc(l.href)}" target="_blank" rel="noopener noreferrer">${ICON.out}看现在的样子</a>`;
      if (l.kind === "bad") return cap(`${l.label ? l.label + "：" : ""}链接不是 http(s) 网址，不能点`, " tt-miss");
      return l.found ? `${cap(l.label || "审核卡")}<a class="btn-ghost tt-go" href="#/card/${esc(l.id)}">${ICON.card}看现在的样子</a>`
        : cap(`${l.label ? l.label + "：" : ""}卡读不到`, " tt-miss");
    };
    const waitRow = (c) => `<a class="tt-card" href="#/card/${esc(c.id)}">${PG.hot(c) ? `<span class="state stop">卡住进度</span>` : PG.stOf(c) === "snoozed" ? `<span class="state calm">稍后再看</span>` : ""}<span class="t">${esc(c.title)}</span>
        <span class="m">${esc(shortType(c.type))} · 等了 ${PG.span(now - (PG.since(c) ?? now))}</span><span class="go">${ICON.right}</span></a>`;
    const stepCard = (k) => {
      if (!k.found) return `<div class="tt-card sm tt-gone"><span class="t">${esc(k.id)}</span><span class="m">卡读不到</span></div>`;
      const c = k.card, st = PG.stOf(c), ch = st === "chosen" && c.decision && c.decision.choice ? ` ${esc(c.decision.choice)}` : "";
      return `<a class="tt-card sm" href="#/card/${esc(c.id)}"><span class="tag">${esc(shortType(c.type))}</span><span class="t">${esc(c.title)}</span><span class="m">${esc(STEP_CARD[st] || STATUS[st] || st)}${ch}</span></a>`;
    };
    const step = (s) => {
      const key = `${d.name}#${s.n}`, open = P.steps.has(key);
      const meta = [s.phase === "now" ? `<span class="tag blue tt-here">现在在这</span>` : "",
        s.when ? `<span class="tt-m">${esc(s.when)}</span>` : "",
        s.phase === "done" ? `<span class="tag green tt-st">做完</span>` : STATE_TAG[s.state] ? `<span class="tag ${STATE_TAG[s.state]} tt-st">${esc(s.state)}</span>` : "",
        s.phase !== "now" && s.waiting.length ? `<span class="state wait">${s.waiting.length} 张卡在等你</span>` : ""].join("");
      const more = s.phase !== "now" ? (s.forecast ? `<p class="tt-fc">${md(s.forecast)}</p>` : "") : `<div class="tt-now">
          ${s.waiting.length ? `<div class="tt-row"><span class="tt-k">等你</span><div class="tt-cards">${s.waiting.map(waitRow).join("")}</div></div>` : ""}
          ${s.forecast ? `<div class="tt-row"><span class="tt-k">预测</span><p class="tt-guess">${md(s.forecast)}</p></div>` : ""}
          ${s.cards.length ? `<div class="tt-row"><span class="tt-k"></span><div><button type="button" class="tt-more" data-step="${esc(key)}" aria-expanded="${open}">${open ? "收起" : `这一步的卡 ${s.cards.length} 张`}<span class="${open ? "up" : ""}">${ICON.down}</span></button>
          ${open ? `<div class="tt-cards tt-all">${s.cards.map(stepCard).join("")}</div>` : ""}</div></div>` : ""}</div>`;
      return `<li class="tt-step is-${s.phase}"${TTF[ttf](s) ? "" : " hidden"}><span class="tt-dot">${s.phase === "done" ? ICON.check : s.n}</span>
        <div class="tt-box"><div class="tt-main"><div class="tt-l1"><span class="tt-t">${md(s.what)}</span>${meta}</div>${more}</div>
        <div class="tt-look">${look(s.look)}</div></div></li>`;
    };
    const sum = tt.allDone ? `${tt.total} 步都做完了` : `一共 ${tt.total} 步，现在走到第 <b>${tt.cur}</b> 步`;
    // 筛选胶囊（卡 20261120-012，照 ds-08）：全部 / 等你 / 在做 / 已做完，后面是步数；选了别的就只显示那几步，左边那根线不画
    const chips = TTF_KEYS.map(([k, label]) => `<button type="button" class="chip${k === ttf ? " on" : ""}" data-ttf="${k}" aria-pressed="${k === ttf}">${label}<b>${tt.steps.filter(TTF[k]).length}</b></button>`).join("");
    const shown = tt.steps.filter(TTF[ttf]).length;
    return `<div class="tt-top">${by}<div class="tt-sum">${sum}</div>
        <div class="tt-bar" style="--n:${tt.total}" role="img" aria-label="${tt.allDone ? `${tt.total} 步都做完了` : `一共 ${tt.total} 步，走到第 ${tt.cur} 步`}">${tt.steps.map((s) => `<i class="${s.phase}"></i>`).join("")}</div></div>
      <div class="chips tt-filter" role="group" aria-label="看哪些步">${chips}</div>
      <ol class="tt-list${ttf === "all" ? "" : " filtered"}">${tt.steps.map(step).join("")}</ol>${shown ? "" : `<div class="p-empty sm">没有${TTF_KEYS.find((x) => x[0] === ttf)[1]}的步。</div>`}${words}`;
  }
  // 项目页（2026-11-18 卡 20261118-016）：标题和一行数在上面，下面一行 Tab（吸在顶栏下面），一次只显示一个 Tab。
  // 地址 #/progress/<项目>/<Tab> 记着看的是哪个；没写 Tab 时：排过时间表的看时间表，没排过（或时间表没读到）的看「等你」
  const TABS = [["时间表", "时间表"], ["等你", "等你"], ["手上在做", "手上在做"], ["agent", "每个 agent"], ["最近7天", "最近 7 天"]];
  function progressDetail(now, updated, err) {
    const d = PG.detail(P.cards, P.project, now);
    const back = `<nav class="crumb meta p-crumb"><a href="#/progress">‹ 全部项目</a></nav>`;
    if (!d) return `${back}<div class="p-head"><h1>${esc(P.project)}</h1>${updated}</div>${err}<div class="p-empty">没有这个项目的卡片（可能是示例项目，或者名字改了）。<a href="#/progress">回到全部项目</a></div>`;
    const plan = planOf(d.name), tt = plan ? PG.timetable(plan, P.cards, now) : null;
    const cur = TABS.some((t) => t[0] === P.tab) ? P.tab : plan ? "时间表" : "等你";
    const href = (slug) => `#/progress/${pkey(d.name)}/${pkey(slug)}`;
    const ih = d.inHand, count = { 等你: d.waiting.length, 手上在做: ih.length };
    const bar = `<nav class="pt-bar" aria-label="看哪一块">${TABS.map(([slug, label]) => `<a href="${href(slug)}"${slug === cur ? ` aria-current="page"` : ""}>${label}${slug in count
      ? `<b${slug === "等你" && d.red ? ` class="hot"` : ""}>${count[slug]}</b>` : ""}</a>`).join("")}</nav>`;
    const lead = (t, right = "") => `<div class="pt-lead"><span>${t}</span>${right}</div>`;
    // 「你定了以后会做什么」那一行：卡上的字可能很长、带 markdown 记号，用 md()（先整段转义再加 <b>/<code>），最多 3 行，超出的点「展开」
    const nextLine = (key, ld, html, cls = "") => `<div class="p-next${cls}"><span class="p-lead">${ld}</span><div class="p-clamp" data-clamp="${esc(key)}">${html}</div><button type="button" class="p-open" data-open="${esc(key)}" hidden>展开</button></div>`;
    let pane;
    if (cur === "等你") {
      const card = (c) => { const n = PG.nextOf(c); return `<div class="pitem"><a class="pcard" href="#/card/${esc(c.id)}">
        <span class="pc-l1">${typeTag(c.type)}${PG.hot(c) ? `<span class="state stop">卡住进度</span>` : PG.stOf(c) === "snoozed" ? `<span class="state calm">稍后再看</span>` : PG.stOf(c) === "defaulted" ? `<span class="state wait">按推荐先推进了</span>` : ""}<span class="t">${esc(c.title)}</span></span>
        <span class="pc-m"><span>${esc(PG.agentOf(c))}</span><span>等了 ${PG.span(now - (PG.since(c) ?? now))}</span></span></a>${n ? nextLine("w:" + c.id, esc(n.lead), md(n.text)) : ""}</div>`; };
      // 「最久等了多久」只在上面那一行数里写，这里不重复
      pane = `<div class="pt-pane" id="p-wait">${d.waiting.length ? `${lead("点一张直接去处理。", `<a class="btn sm" href="#/card/${esc(d.waiting[0].id)}">从第一张开始</a>`)}<div class="panel pcards-list">${d.waiting.map(card).join("")}</div>`
        : `<div class="p-empty sm">这个项目没有等你的卡 ✓</div>`}
        <section class="psec" id="p-blocks"><div class="sec-h"><h2>卡上写的「不处理会卡住」</h2><span>照卡上的原话，按写了它的卡数排</span></div>
        ${d.blocks.length ? `<ul class="pblocks">${d.blocks.map((b) => `<li><span>${esc(b.text)}</span><b>${b.n} 张</b></li>`).join("")}</ul>` : `<div class="p-empty sm">这个项目的卡都没写「不处理会卡住」。</div>`}</section></div>`;
    } else if (cur === "手上在做") {
      // agent 手上在做的：你定了、它还没关。先显示前 6 件，剩下的收在「再看 N 件」里
      const own = (x) => `<div class="pitem${x.stale ? " p-late" : ""}"><a class="pcard" href="#/card/${esc(x.card.id)}">
        <span class="pc-l1"><span class="tag p-verdict${x.side === "reject" ? " no" : ""}">${esc(x.verdict)}</span><span class="t">${esc(x.card.title)}</span>${x.stale ? `<span class="tag red p-stale">定了超过 2 天还没关</span>` : ""}</span>
        <span class="pc-m"><span>${esc(PG.agentOf(x.card))}</span><span>${x.at != null ? `${PG.ago(x.at, now)}定的` : "不知道哪天定的"}</span></span></a>${nextLine("o:" + x.card.id, "它接下来：", x.thenMissing ? esc(x.then) : md(x.then), x.thenMissing ? " missing" : "")}</div>`;
      const moreOpen = P.more.has(d.name), shown = moreOpen ? ih : ih.slice(0, PG.SHOW_FIRST), rest = ih.length - PG.SHOW_FIRST;
      pane = `<div class="pt-pane" id="p-owes">${ih.length ? `${lead("你已经定了、agent 还没关的卡。每张下面是它接下来要做的。")}<div class="panel pcards-list">${shown.map(own).join("")}</div>${rest > 0 ? `<button type="button" class="btn sm p-more" data-more="${esc(d.name)}" aria-expanded="${moreOpen}">${moreOpen ? "收起，只看前 6 件" : `再看 ${rest} 件`}</button>` : ""}`
        : `<div class="p-empty sm">现在没有：你定过的卡 agent 都关了。</div>`}
        <p class="p-note">${tt && tt.total ? "这里只看得到每张卡定了以后的下一步。谁先谁后、大概什么时候，看「时间表」，那是总规划师排的。"
          : "这里只看得到每张卡定了以后的下一步。这几件谁先谁后、做完以后项目还剩什么、大概什么时候，现在看不到。"}</p></div>`;
    } else if (cur === "agent") {
      const agentRow = (a) => `<tr><th scope="row">${esc(a.name)}</th><td data-k="等你">${a.waiting}</td><td data-k="你定了它还没做完">${a.owes}</td>
        <td data-k="最近一次交卡或关卡">${lastText(a, now)} ${quietTag(a)}</td>
        <td data-k="最近在做" class="p-doing">${a.doing ? `<a href="#/card/${esc(a.doing.id)}">${esc(a.doing.title)}</a>` : "—"}</td></tr>`;
      pane = `<div class="pt-pane" id="p-agents">${lead("「最近在做」是它最近提卡、交新版或关卡的那张。")}
        <div class="panel ptable-wrap"><table class="ptable"><thead><tr><th scope="col">agent</th><th scope="col">等你</th><th scope="col">你定了它还没做完</th><th scope="col">最近一次交卡或关卡</th><th scope="col">最近在做</th></tr></thead>
        <tbody>${d.agents.map(agentRow).join("")}</tbody></table></div></div>`;
    } else if (cur === "最近7天") {
      const w = d.week, kinds = ["approved", "chosen", "rejected", "answered", "dropped"].filter((k) => w.kinds[k]).map((k) => `${DEC_TEXT[k]} ${w.kinds[k]}`);
      const evText = (e) => {
        const t = `「<a href="#/card/${esc(e.card.id)}">${esc(e.card.title)}</a>」`;
        if (e.event === "closed") return `${esc(PG.agentOf(e.card))} 做完关了${t}`;
        if (e.event === "chosen") { const k = String(e.note || "").match(/^选了 (\S+?)。/)?.[1] || e.card.decision?.choice || ""; return `你选了 ${esc(k)}${t}`; }
        return `你${{ approved: "通过了", rejected: "打回了", answered: "回答了", dropped: "标了不用处理" }[e.event]}${t}`;
      };
      const tl = w.timeline.map((e) => `<li class="${e.event === "closed" ? "by-agent" : "by-you"}"><time>${mmdd(new Date(e.at).toISOString())}</time><span class="p-ev">${evText(e)}</span><span class="p-who">${esc(PG.agentOf(e.card))}</span></li>`).join("");
      pane = `<div class="pt-pane" id="p-week"><div class="p-weeksum"><span>你定了 <b>${w.decided}</b> 张${kinds.length ? `（${kinds.join("、")}）` : ""}</span><span>agent 关了 <b>${w.closed}</b> 张</span></div>
        ${tl ? `<ol class="panel ptl">${tl}</ol>` : `<div class="p-empty sm">最近 7 天这个项目没有人给结论、也没有 agent 关卡。</div>`}</div>`;
    } else pane = `<div class="pt-pane" id="p-tt">${timetablePane(d, now)}</div>`;
    // 「没排阶段」那句：排了时间表（有步骤）就不说；时间表没读到时不知道排没排，也不说
    const noStage = P.plans && !(tt && tt.total) ? `<p class="p-note">${NO_STAGE}agent 没提卡的时候在做什么，审核中心也不知道。</p>` : "";
    return `${back}<div class="pt-head"><h1>${esc(d.name)}</h1>
        <div class="pt-nums"><span>${waitLine(d)}</span><a class="p-jump" href="${href("手上在做")}" title="看是哪几件">你定了、agent 还没做完 <b>${d.owes.length}</b> 张</a><span>最近动静：${lastText(d, now)} ${quietTag(d)}</span></div>${updated}</div>${err}
      ${noStage}${bar}${pane}`;
  }

  // ---------- 筛选、路由、主题 ----------
  const setFilter = (f) => { S.filter = f; $$("#chips .chip").forEach((x) => x.classList.toggle("on", x.dataset.f === f)); };
  $("#chips").addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (!b) return; setFilter(b.dataset.f); renderQueue(); });
  // 搜索：电脑上在左边菜单里（打字时不在列表页就先回列表页），手机上在队列页顶上。同一个输入框，换宽窄时挪过去
  $("#f-q").addEventListener("input", (e) => {
    S.q = e.target.value; renderQueue();
    if (desk() && document.body.dataset.view !== "list") location.hash = S.filter === "done" ? "#/done" : "#/";
  });
  const placeSearch = () => { const q = $(".qsearch"), to = narrow() ? $(".side-top") : $("#m-search"); if (q.parentElement !== to) to.prepend(q); };
  placeSearch(); matchMedia("(max-width: 900px)").addEventListener("change", () => { placeSearch(); if (S.cards.length) renderQueue(); });
  // 深浅色（卡 20261120-003 起只有图标）：电脑在侧栏底，手机在顶栏右边。浅色时画月亮、深色时画太阳，读屏名字和 title 都是「切换深浅色」
  const themeNow = () => document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const themeIcon = () => { $$("[data-theme-btn]").forEach((b) => { b.innerHTML = themeNow() === "dark" ? IC.sun : IC.moon; }); };
  $$("[data-theme-btn]").forEach((b) => b.addEventListener("click", () => { const r = document.documentElement; r.dataset.theme = themeNow() === "dark" ? "light" : "dark"; store.set("rc-theme", r.dataset.theme); themeIcon(); }));
  { const t = store.get("rc-theme"); if (t) document.documentElement.dataset.theme = t; }
  themeIcon(); matchMedia("(prefers-color-scheme: dark)").addEventListener("change", themeIcon);
  $("#keys-ic").innerHTML = IC.keys;
  document.addEventListener("click", (e) => { const k = $(".keys[open]"); if (k && !k.contains(e.target)) k.open = false; });
  $("#tab-q").insertAdjacentHTML("afterbegin", IC.inbox); $("#tab-p").insertAdjacentHTML("afterbegin", IC.chart);
  S.navMode = store.get("rc-nav") === "collapsed" ? "collapsed" : "pinned"; applyNav();
  // 地址栏带了 #/card/<id> 就开那张（窄屏切到单张卡那一页）；#/progress、#/progress/<项目> 是进度页；别的是队列
  function route() {
    const was = document.body.dataset.view, pm = location.hash.match(/^#\/progress(?:\/(.*))?$/);
    if (pm) {
      // #/progress/<项目>/<Tab>：项目名是 encodeURIComponent 过的（里面的 / 写成 %2F），所以按第一个 / 切开再分别解码
      const dec = (x) => { try { return decodeURIComponent(x); } catch { return x; } };
      const raw = pm[1] || "", cut = raw.indexOf("/");
      const p = dec(cut < 0 ? raw : raw.slice(0, cut)), tab = cut < 0 ? "" : dec(raw.slice(cut + 1));
      document.body.dataset.view = "progress";
      closeSheet(); if (S.doc) closeDoc(true);
      showProgress(p, was !== "progress", tab);
      return true;
    }
    const m = location.hash.match(/^#\/card\/([\w\-]+)/);
    // #/done：已处理那一页；电脑上 #/ 就是待你处理（手机的 #/ 照旧看队列顶上选的是哪个标签页）
    if (/^#\/done\/?$/.test(location.hash)) setFilter("done");
    else if (!m && desk()) setFilter("pending");
    document.body.dataset.view = m ? "card" : "list";
    stopProgress(); // 放在改 view 之后：哪个入口亮着照新的 view 定
    if (m) openCard(m[1]);
    else {
      closeSheet();
      if (S.cards.length) renderQueue();
      const fp = S.focusP; S.focusP = null;
      const b = fp != null && $$(".phead").find((x) => x.dataset.p === fp);
      if (b) { b.scrollIntoView({ block: "start" }); b.focus({ preventScroll: true }); }
      else if (narrow() || was === "card") window.scrollTo(0, S.listY || 0);
      else window.scrollTo(0, 0);
    }
    return !!m;
  }
  window.addEventListener("hashchange", route);
  matchMedia("(max-width: 900px)").addEventListener("change", () => { closeSheet(); if (S.card) renderCard(true); }); // 重画整张卡：手机上带图的拍板卡方案区是切着看的，换了宽窄要换排法

  // ---------- 登录（线上要；本机模式 /api/session 回 auth:false，直接开始）----------
  let poll = null;
  function start() {
    $("#login").hidden = true;
    loadList().then(() => {
      // 没带卡号：停在待你处理那一页，自己挑（电脑也一样，卡 20261120-016 起不再自动开第一张）
      route();
    }).catch((e) => { if (e.auth) return showLogin(); $("#qlist").innerHTML = `<div class="qempty">连不上审核中心服务：${esc(e.message)}<br>先运行 python3 server.py</div>`; });
    if (!poll) poll = setInterval(() => loadList().catch((e) => { if (e.auth) showLogin(e.message); }), 8000);
  }
  function showLogin(msg) {
    if (poll) { clearInterval(poll); poll = null; }
    closeLb();
    $("#login").hidden = false;
    $("#login-err").textContent = msg || "";
    setTimeout(() => $("#login-pw").focus(), 0);
  }
  $("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pw = $("#login-pw").value;
    if (!pw) return;
    $("#login-go").disabled = true; $("#login-err").textContent = "";
    try {
      const r = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { $("#login-err").textContent = j.error || `没登录上（${r.status}）`; $("#login-pw").select(); return; }
      $("#login-pw").value = ""; setLoggedIn(true);
      start();
    } catch (err) { $("#login-err").textContent = "连不上服务：" + err.message; }
    finally { $("#login-go").disabled = false; }
  });
  // 退出登录：电脑在顶栏最右（进度页、侧栏收起时也能用），手机在队列最下面；只在登录了的时候出现
  $("#top-logout").innerHTML = IC.logout;
  const setLoggedIn = (on) => { $("#logout").hidden = !on; $("#q-foot").hidden = !on; $("#top-logout").hidden = !on; };
  $$("#logout, #q-logout, #top-logout").forEach((b) => b.addEventListener("click", async () => { try { await fetch("/api/logout", { method: "POST" }); } catch {} location.reload(); }));
  // 点击 ⓘ 说明（登录框密码、示例卡片、时间表「预测」）：手机触屏没有 hover，点一下弹出轻量说明气泡
  {
    const pop = $("#tip-pop");
    let owner = null;
    const hideTip = () => { pop.hidden = true; owner = null; };
    document.addEventListener("click", (e) => {
      const t = e.target.closest("#login-info, .demo-note, .tt-pred-tag");
      if (!t || !t.title) { if (!pop.hidden && !e.target.closest("#tip-pop")) hideTip(); return; }
      e.preventDefault(); e.stopPropagation();
      if (owner === t && !pop.hidden) return hideTip();
      owner = t;
      pop.textContent = t.title;
      pop.hidden = false;
      const r = t.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
      const left = Math.max(12, Math.min(innerWidth - pw - 12, r.left));
      const top = r.bottom + 8 + ph > innerHeight - 12 ? Math.max(12, r.top - ph - 8) : r.bottom + 8;
      pop.style.left = `${left}px`; pop.style.top = `${top}px`;
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.hidden) hideTip(); });
    window.addEventListener("scroll", () => { if (!pop.hidden) hideTip(); }, true);
    window.addEventListener("resize", hideTip);
  }
  // 看密码：眼睛按钮在密码框里右边，点一下明文、再点一下藏起来
  $("#login-info").innerHTML = IC.info;
  const eyeDraw = () => { const shown = $("#login-pw").type === "text", t = shown ? "隐藏密码" : "显示密码"; $("#pw-eye").innerHTML = shown ? IC.eyeOff : IC.eye; $("#pw-eye").setAttribute("aria-label", t); $("#pw-eye").title = t; };
  $("#pw-eye").addEventListener("click", () => { const pw = $("#login-pw"); pw.type = pw.type === "password" ? "text" : "password"; eyeDraw(); pw.focus(); });
  eyeDraw();
  fetch("/api/session", { cache: "no-store" }).then((r) => r.json()).catch(() => ({}))
    .then((s) => {
      setLoggedIn(!!(s.auth && s.user));
      if (s.auth && !s.user) showLogin(s.password_set === false ? "服务器还没设登录密码：在 Mac 终端跑 deploy/set_password.sh" : "");
      else start();
    });
})();
