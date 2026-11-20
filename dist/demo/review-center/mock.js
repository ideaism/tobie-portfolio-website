/* 作品集演示版 · 假的服务器（在 app.js 之前加载）。
   审核中心的网页（index.html / app.js / style.css）是从 ~/其他任务/审核中心/web/ 原样抄来的，只有这一个文件是新写的：
   - 把 fetch 里发往 /api/ 的请求接住，用内存里的 8 张示例卡回答，回的格式照 server.py（列表是 summary()，单张是整张卡）；
   - 给结论、改回待审只改内存，刷新页面就回到 8 张卡的初始样子；
   - /api/session 回「不用登录」，所以不会出登录框；贴图（attach）回一句「演示版不保存贴的图」；
   - 图都是这个文件夹 img/ 里画的占位图，用完整地址（http://…/img/x.svg）交给 app.js，它对 http 开头的地址不加 /assets/，所以不会去要服务器；
   - 卡的时间都按「打开页面这一刻」往前推，「放了 3 天以上」那张永远够 3 天。
   可选参数：?theme=light|dark 强制深浅色（不带就跟系统）。 */
(() => {
  "use strict";
  const T0 = Date.now(), H = 36e5;
  const ago = (h) => new Date(T0 - h * H).toISOString();
  const now = () => new Date().toISOString();
  const img = (f) => new URL("img/" + f, document.baseURI).href;

  // 刷新即重置：清掉 app.js 记在这台设备上的东西（折起来的组、菜单收起、深浅色、读文件的位置），只清它自己的 rc- 开头的键
  try { ["rc-closed", "rc-nav", "rc-theme", "rc-docpos"].forEach((k) => localStorage.removeItem(k)); } catch {}
  // 补一个原网页的毛病（app.js 不改）：「放了 3 天以上」那组的钥匙是 "\u0000stale"，写进按钮的 data-p 时
  // 浏览器把 \u0000 换成了 �，点组头记下的是另一个字，组永远打不开。这里在记 rc-closed 时换回去，并按「点一下开、再点一下关」处理。
  // 原网页修好以后（不再出现 �）这段自然不起作用。
  try {
    const raw = Storage.prototype.setItem, BAD = "�stale", KEY = "\u0000stale";
    Storage.prototype.setItem = function (k, v) {
      if (this === window.localStorage && k === "rc-closed") {
        try { let a = JSON.parse(v); if (Array.isArray(a) && a.includes(BAD)) { const had = a.includes(KEY); a = a.filter((x) => x !== BAD && x !== KEY); if (!had) a.push(KEY); v = JSON.stringify(a); } } catch {}
      }
      return raw.call(this, k, v);
    };
  } catch {}
  try { const t = new URLSearchParams(location.search).get("theme"); if (t === "light" || t === "dark") document.documentElement.dataset.theme = t; } catch {}

  const P = "示例项目";
  const pending = () => ({ status: "pending", choice: null, note: "", pins: [], at: null });
  const created = (h, who) => [{ at: ago(h), who, event: "created", note: "第 1 版提交" }];
  // 一张卡的公共部分（照 review.py build_new 的样子：id、version、created_at、updated_at、decision、history）
  const card = (o) => {
    const c = Object.assign({ project: P, version: 1, blocks: [], evidence: [], options: [], checks: [], where: [] }, o);
    c.created_at = c.updated_at = ago(o.h);
    c.history = created(o.h, o.agent);
    c.decision = pending();
    delete c.h;
    return c;
  };
  const decide = (c, h, status, note, extra = {}) => {
    c.decision = { status, choice: null, note, pins: [], at: ago(h), by: "用户", ...extra };
    c.history.push({ at: ago(h), who: "用户", event: status, note });
    c.updated_at = ago(h);
    return c;
  };

  const THREAD = "demo-thread-home-button";
  const CARDS = [
    // ---- 同一件事的三张（同一个 session）：第一张打回、第二张通过、第三张等你 → 第三张卡头下面列出「前几张」
    decide(card({
      id: "demo-01", h: 26, session: THREAD, agent: "示例A 设计", type: "验收", urgency: "🔴", blocks: ["示例里程碑 · 首页改版"],
      title: "首页主按钮换成品牌蓝",
      ask: "看一眼改完的首页，主按钮的颜色对不对。",
      context: {
        goal: "让第一次打开的人一眼找到「开始打卡」。",
        before: "主按钮是浅灰蓝，和背景差不多。",
        change: "按钮换成品牌蓝，别的没动。",
        why_you: "颜色对不对是主观判断，我自己定不了。",
      },
      evidence: [{ kind: "image", src: img("btn-v1.svg"), caption: "改完的首页，看最下面那颗按钮。" }],
      checks: [
        { item: "按钮用的是品牌蓝", result: "通过", evidence: "设计稿取色" },
        { item: "深色模式下也看得清", result: "未测", evidence: "还没截深色模式" },
      ],
      after: { approve: "合进主分支，接着改按钮文案。", reject: "补一张改之前的截图做对照，再交一次。" },
    }), 25, "rejected", "看不出跟之前有什么区别，下次放一张改之前的对照。"),
    (() => {
      const c = decide(card({
        id: "demo-02", h: 20, session: THREAD, agent: "示例A 设计", type: "验收", urgency: "🟡",
        title: "三处按钮的圆角统一成 8",
        ask: "看首页、设置页、弹窗三处按钮，圆角是不是一样了。",
        context: {
          goal: "改色之前先把按钮的样子统一。",
          before: "三处按钮的圆角分别是 4、8、12。",
          change: "全部改成 8，主按钮和次按钮都改了。",
          why_you: "统一成哪个数要你点头，之后所有新按钮都照这个做。",
        },
        evidence: [{ kind: "image", src: img("radius.svg"), caption: "上面一排主按钮，下面一排次按钮。" }],
        checks: [
          { item: "三处主按钮圆角都是 8", result: "通过", evidence: "逐个量过" },
          { item: "次按钮也一起改了", result: "通过", evidence: "同上" },
          { item: "按钮里的字没被挤到", result: "通过", evidence: "三种屏幕宽度截图" },
        ],
        after: { approve: "合进主分支，再回头改主按钮的颜色。", reject: "按你说的数再改一遍，一小时内交。" },
      }), 19, "approved", "可以。");
      return c;
    })(),
    card({
      id: "demo-03", h: 2, session: THREAD, agent: "示例A 设计", type: "验收", urgency: "🔴", version: 1, blocks: ["示例里程碑 · 首页改版"],
      title: "首页主按钮改色：这次带了前后对比",
      ask: "拖中间的线比一比：主按钮比之前醒目了吗？",
      context: {
        goal: "让第一次打开的人一眼找到「开始打卡」。",
        before: "第一次改色被你打回了：看不出跟之前的区别。",
        change: "颜色再加深一档，按钮加高 8px；这次放了改之前的截图做对照。",
        why_you: "醒不醒目要你的眼睛来判断，我量得出对比度，量不出感觉。",
      },
      evidence: [{ kind: "compare", before: img("btn-before.svg"), after: img("btn-after.svg"), labels: ["之前", "现在"], caption: "左边是改之前，右边是这一版。看最下面那颗按钮。" }],
      checks: [
        { item: "按钮文字和底色的对比度到 4.5 以上", result: "通过", evidence: "取色计算是 5.6" },
        { item: "深色模式也看得清", result: "未测", evidence: "深色模式的截图下一版补" },
        { item: "三种屏幕宽度下按钮都没被挡住", result: "通过", evidence: "三张截图" },
      ],
      after: { approve: "合进主分支，下一步改按钮上的字。", reject: "照你的批注再调，半天内交下一版。" },
    }),
    // ---- 拍板（三个方案，带图；作品集 03 节截的就是这张）
    card({
      id: "demo-04", h: 5, session: "demo-s-04", agent: "示例B 插画", type: "拍板", urgency: "🔴", blocks: ["示例里程碑 · 新用户首日"],
      title: "空页面的插图，从三版里选一版",
      ask: "从 A / B / C 里选一版，放在「还没有记录」那一页。",
      context: {
        goal: "列表空着的时候，给新用户一个开始的理由。",
        before: "这一页现在只有一行灰字「暂无数据」。",
        change: "画了三版风格不同的插图，按同一个尺寸出的图。",
        why_you: "三版都能用。选哪种风格会定下后面所有插图的样子，这要你定。",
      },
      options: [
        { key: "A", title: "线条", desc: "细线条，安静，跟现在的图标是一套。", image: img("empty-a.svg"), cost: "不用多做。", recommended: true },
        { key: "B", title: "色块", desc: "大色块，更活泼，第一眼更抓人。", image: img("empty-b.svg"), cost: "别的页面的插图要跟着重画，约 2 天。", recommended: false },
        { key: "C", title: "只放文字", desc: "不放图，一句话加一个按钮。", image: img("empty-c.svg"), cost: "最快，但页面显得冷。", recommended: false },
      ],
      evidence: [{ kind: "image", src: img("empty-context.svg"), caption: "插图放进页面的位置：中间偏上，按钮在图下面。" }],
      after: { approve: "照选的那版把另外 4 个空页面也画齐，明天交验收卡。", reject: "三版都不要的话，写一句想要什么感觉，我再出两版。" },
    }),
    // ---- 回答问题
    card({
      id: "demo-05", h: 9, session: "demo-s-05", agent: "示例C 文案", type: "回答问题", urgency: "🟡",
      title: "新用户引导做 3 步还是 5 步",
      ask: "新用户引导你想要 3 步还是 5 步？说一句理由就行。",
      context: {
        goal: "第一次打开时讲清楚怎么打卡。",
        before: "现在没有引导，打开直接进首页。",
        change: "写了 3 步和 5 步两套草稿。",
        why_you: "步数多了怕人走掉，少了怕讲不清。这是产品判断，不是文案问题。",
      },
      evidence: [{ kind: "image", src: img("guide-steps.svg"), caption: "上面一排是 3 步版，下面一排是 5 步版。" }],
      after: { approve: "照你说的步数定稿，配图交给示例B。", reject: "答不上来的话我先按 3 步做，之后随时能改。" },
    }),
    // ---- 动手
    card({
      id: "demo-06", h: 3, session: "demo-s-06", agent: "示例D 测试", type: "动手", urgency: "🔴", blocks: ["示例里程碑 · 首页改版"],
      title: "在你的手机上装一次测试版",
      ask: "① 用手机打开交接单里的安装链接，装上测试版；② 打开后点一次「开始打卡」；③ 没闪退就点「做好了」，闪退了点「做不了」。",
      context: {
        goal: "上架之前要在真手机上走一遍。",
        before: "之前只在模拟器上跑过。",
        change: "测试包打好了，安装链接放在交接单里。",
        why_you: "我没有真手机，只能请你装。",
      },
      evidence: [{ kind: "image", src: img("btn-after.svg"), caption: "装好打开以后，首页应该是这样。" }],
      where: [{ label: "交接单", path: "交接/示例D-测试.md" }],
      after: { approve: "我去收闪退记录，没问题就提交上架审核。", reject: "写一句卡在哪一步，我换个装法。" },
    }),
    // ---- 不急的拍板（两个方案、没图、有推荐：会显示「到某天按推荐先推进」）
    card({
      id: "demo-07", h: 30, session: "demo-s-07", agent: "示例A 设计", type: "拍板", urgency: "🟡",
      title: "设置页按功能分组，还是按常用程度分组",
      ask: "从 A / B 里选一种分法。",
      context: {
        goal: "设置页从 6 项长到了 14 项，要分组。",
        before: "现在是一长串，没有分组。",
        change: "按两种分法各排了一版草图。",
        why_you: "两种都说得通，选哪种要看你更在意好找还是好记。",
      },
      options: [
        { key: "A", title: "按功能分组", desc: "提醒、数据、账号各一组。", cost: "不用多做。", recommended: true },
        { key: "B", title: "按常用程度分组", desc: "常用的放最上面，其余收进「更多」。", cost: "要先统计哪几项最常用，约半天。", recommended: false },
      ],
      evidence: [{ kind: "image", src: img("settings-ab.svg"), caption: "左边是 A，右边是 B，只排了前几项。" }],
      after: { approve: "照选的分法改设置页，下午交验收卡。", reject: "都不要的话，说一句你想怎么分。" },
    }),
    // ---- 放了 3 天以上的不急卡：沉到列表最后折着的「放了 3 天以上」
    card({
      id: "demo-08", h: 4.5 * 24, session: "demo-s-08", agent: "示例C 文案", type: "验收", urgency: "🟡",
      title: "帮助页的错别字改完了",
      ask: "扫一眼改过的 6 处，没问题就通过。",
      context: {
        goal: "上架前把帮助页的字过一遍。",
        before: "帮助页有 6 处错别字和标点不一致。",
        change: "6 处都改了，标点统一成全角。",
        why_you: "改动很小，但帮助页上线前要你看过。",
      },
      checks: [
        { item: "6 处错别字都改了", result: "通过", evidence: "逐条对过" },
        { item: "标点统一成全角", result: "通过", evidence: "全文搜过半角逗号" },
        { item: "英文版也一起改了", result: "未测", evidence: "英文版还没做" },
      ],
      after: { approve: "合进主分支。", reject: "照你圈的地方再改。" },
    }),
  ];
  const DB = new Map(CARDS.map((c) => [c.id, c]));

  // ---- 跟 server.py 一样的规则 ----
  const SUMMARY_KEYS = ["id", "project", "agent", "type", "urgency", "title", "ask", "blocks", "created_at", "updated_at", "version", "demo", "session", "session_cc"];
  const USER_STATUS = new Set(["approved", "rejected", "chosen", "answered", "snoozed", "dropped"]);
  const recommended = (c) => { const k = (c.options || []).filter((o) => o.recommended).map((o) => o.key); return k.length === 1 ? k[0] : null; };
  const pendingSince = (c) => { const ts = (c.history || []).filter((h) => ["created", "updated", "reopened"].includes(h.event)).map((h) => Date.parse(h.at)).filter((t) => !isNaN(t)); return ts.length ? Math.max(...ts) : Date.parse(c.created_at); };
  const defaultDue = (c) => (c.urgency === "🟡" && c.type === "拍板" && recommended(c) ? new Date(pendingSince(c) + 72 * H).toISOString() : null);
  function summary(c) {
    const s = {}, d = c.decision || {};
    SUMMARY_KEYS.forEach((k) => (s[k] = c[k] ?? null));
    Object.assign(s, { status: d.status || "pending", decided_at: d.at || null, choice: d.choice ?? null, status_before_close: d.status_before_close ?? null, acted: !!c.acted, decided_by: d.by ?? null });
    const due = defaultDue(c);
    s.default_choice = due ? recommended(c) : null;
    s.default_due = due;
    const ev = c.evidence || [];
    s.evidence_count = ev.length;
    s.thumb = [...ev.filter((e) => ["image", "compare", "frames"].includes(e.kind)).map((e) => e.src || e.after || (e.srcs || [])[0]), ...(c.options || []).map((o) => o.image)].find(Boolean) || null;
    return s;
  }
  const sorted = () => [...DB.values()].sort((a, b) => (b.created_at + b.id).localeCompare(a.created_at + a.id));
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const cleanPins = (pins) => (Array.isArray(pins) ? pins : []).filter((p) => p && String(p.text || "").trim() && isFinite(+p.x) && isFinite(+p.y))
    .map((p, i) => ({ src: String(p.src || ""), x: Math.min(1, Math.max(0, +p.x)), y: Math.min(1, Math.max(0, +p.y)), text: String(p.text).trim(), n: i + 1 }));

  function handle(path, query, method, body) {
    if (path === "/api/session") return [200, { auth: false, user: true, password_set: false }];
    if (path === "/api/logout") return [200, { ok: true }];
    if (path === "/api/login") return [400, { error: "演示版不用登录" }];
    if (path === "/api/plans") return [200, { plans: [], now: now() }];
    if (path === "/api/cards" && method === "GET") return [200, { cards: query.get("full") === "1" ? sorted().map(clone) : sorted().map(summary), now: now() }];
    let m = path.match(/^\/api\/cards\/([^/]+)$/);
    if (m && method === "GET") { const c = DB.get(m[1]); return c ? [200, clone(c)] : [404, { error: `没有这张卡片：${m[1]}` }]; }
    m = path.match(/^\/api\/cards\/([^/]+)\/(decision|reopen|attach)$/);
    if (m && method === "POST") {
      const c = DB.get(m[1]);
      if (!c) return [404, { error: "没有这张卡片" }];
      if (m[2] === "attach") return [400, { error: "演示版不保存贴的图" }];
      if (m[2] === "decision") {
        const status = body.status, choice = body.choice;
        if (!USER_STATUS.has(status)) return [400, { error: `status 只能是 ${[...USER_STATUS].sort()}` }];
        if (status === "chosen" && !(c.options || []).some((o) => o.key === choice)) return [400, { error: "choice 要是选项之一" }];
        const d = { status, choice: status === "chosen" ? choice : null, note: String(body.note || "").trim(), pins: cleanPins(body.pins), at: now(), by: "用户" };
        c.decision = d;
        c.history.push({ at: d.at, who: "用户", event: status, note: (choice && status === "chosen" ? `选了 ${choice}。` : "") + d.note });
      } else {
        const prev = c.decision || {};
        c.decision = { ...pending(), previous: prev.status && prev.status !== "pending" ? prev : null };
        delete c.acted;
        c.history.push({ at: now(), who: "用户", event: "reopened", note: String(body.note || "改回待审").trim() });
      }
      c.updated_at = now();
      return [200, clone(c)];
    }
    return [404, { error: "演示版没有这个地址" }];
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (url.origin !== location.origin || !url.pathname.startsWith("/api/")) return realFetch(input, init);
    const method = (init.method || "GET").toUpperCase();
    let body = {};
    try { body = init.body ? JSON.parse(init.body) : {}; } catch {}
    await new Promise((r) => setTimeout(r, 60)); // 像真的网络一样晚一点点回来
    const [status, json] = handle(decodeURIComponent(url.pathname), url.searchParams, method, body);
    return new Response(JSON.stringify(json), { status, headers: { "Content-Type": "application/json; charset=utf-8" } });
  };
})();
