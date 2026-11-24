(() => { const MODE = new URLSearchParams(location.search).get('start'); if (MODE !== 'new' && MODE !== 'join') return;
// 建冰箱和新人加入（产品逻辑/建冰箱和加入-A打算.md，拍板卡 20261121-002 选 A，邀请贴纸只在这两段里有）。
// 只在网址带 ?start=new（建冰箱的人）或 ?start=join（新人）、默认界面「冰箱贴」时起作用；不带 ?start= 上面第一行就返回。
// 放在 skin.js 之后、app.js 之前：先把数据拷一份改好（只有这一台冰箱），app.js 再按它建冰箱。界面部分等 DOMContentLoaded。
// 接 5 处：1 建冰箱那一屏  2 新人登录前那一屏  3 纸条揭一次（新人）/ 纸条上打勾（建的人）  4 名牌认层  5 门上的邀请贴纸。
// 名牌认层的口子在 app.js bindPull 松手那一行：window.START.name(F, t, el) 返回 true 就不拉出这一层。
const D0 = window.FRIDGE;
if (!window.SKIN || SKIN.name !== 'a' || !D0 || !D0.fridges) return;
const UN = '还没人认';
const NEW = MODE === 'new';
const DEMO = { me: '小禾', mail: 'xiaohe@example.com', code: '428619' };   // 演示自动填的（不发出去）
const $ = s => document.querySelector(s);

// ---------- 数据：拷一份再改，data.js 不动 ----------
const f = JSON.parse(JSON.stringify(D0.fridges[0]));
const keep = (s, label) => Object.assign({ label, y: s.y }, s.right ? { right: s.right } : {});   // 不带 mine
if (NEW) {
  f.name = '厨房冰箱';
  f.shelves = f.shelves.map(s => keep(s, s.label.split(' · ')[0] + ' · ' + UN));
  f.items = []; f.more = null;
  f.frozen = f.frozen.map(z => ({ label: z.label, items: [] }));
} else {
  // 新人还没东西：去掉“我”的（层板、“+2”里、冷冻里）；二层空出来。阿青、小满的不动。
  // “+2”叠放格原来收着我的奶酪和小满放错层的果酱，二层空了以后不再有叠放格（见 子代理自测/记录.md）
  f.items = f.items.filter(it => it.kind !== 'mine'); f.more = null;
  f.frozen = f.frozen.map(z => Object.assign({}, z, { items: z.items.filter(it => it.kind !== 'mine') }));
  f.shelves[1] = keep(f.shelves[1], '二层 · ' + UN);
}
f.freezer = '冷冻 · ' + f.frozen.reduce((n, z) => n + z.items.length, 0) + ' 件';
// 只加入了这一台：小冰箱不出现
window.FRIDGE = Object.assign({}, D0, { shelves: f.shelves, items: f.items, more: f.more, fridges: [f] });

// skin.js 已经写好的顶栏、冷冻胶带：跟着换
const tabs = document.querySelectorAll('#topbar .tab');
for (let i = 1; i < tabs.length; i++) tabs[i].remove();
if (tabs[0]) tabs[0].textContent = f.name;
const ftp = $('#freezerTags .tp'); if (ftp) ftp.textContent = f.freezer;
document.documentElement.classList.add('st-on', 'st-' + MODE);

addEventListener('DOMContentLoaded', () => {
  const APP = window.__app, K = APP && APP.mk;
  const phone = $('#phone'), face = $('#door .face');
  if (!K || !phone || !face || !K.FR[0]) return;
  const F = K.FR[0], RM = APP.rm;
  const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const scale = () => phone.getBoundingClientRect().width / 390 || 1;
  const rectOf = n => { const p = phone.getBoundingClientRect(), r = n.getBoundingClientRect(), k = scale(); return { x: (r.left - p.left) / k, y: (r.top - p.top) / k, w: r.width / k, h: r.height / k }; };
  const inside = (p, r) => r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const ptOf = e => { const p = phone.getBoundingClientRect(), k = scale(); return { x: (e.clientX - p.left) / k, y: (e.clientY - p.top) / k }; };
  const can = () => APP.mode === 'closed' && APP.fridge === 0 && APP.cam.settled && !APP.tray.on;   // 和门上纸条一样：关着门、停稳时才点得到
  const stop = n => ['pointerdown', 'pointermove', 'pointerup'].forEach(t => n.addEventListener(t, e => e.stopPropagation()));
  const names = () => [...F.shelf.querySelectorAll('.name')];

  // ---------- 二维码（CSS 小方块里的一张内联 SVG，不是图片文件；花纹是假的，固定不变） ----------
  const QR = (() => {
    const N = 21, g = [];
    let s = 20261121; const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    for (let y = 0; y < N; y++) { g.push([]); for (let x = 0; x < N; x++) g[y].push(rnd() < 0.48); }
    const finder = (ox, oy) => { for (let y = -1; y < 8; y++) for (let x = -1; x < 8; x++) {
      const X = ox + x, Y = oy + y; if (X < 0 || Y < 0 || X >= N || Y >= N) continue;
      const m = Math.max(Math.abs(x - 3), Math.abs(y - 3)); g[Y][X] = m !== 2 && m !== 4; } };
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    for (let i = 8; i < N - 8; i++) { g[6][i] = i % 2 === 0; g[i][6] = i % 2 === 0; }
    let d = ''; g.forEach((r, y) => r.forEach((on, x) => { if (on) d += `M${x} ${y}h1v1h-1z`; }));
    return `<svg viewBox="-1.5 -1.5 24 24" shape-rendering="crispEdges" aria-hidden="true"><path d="${d}"/></svg>`;
  })();

  // ---------- 5 门上的邀请贴纸 ----------
  // 门板左边中间、把手右边（避开顶上那排冰箱贴、右下的纸条）。在门板里最底下：冰箱贴、门转开时的变暗都盖在它上面。
  // 外框不带变换（门转开一点时带变换的小块在 3D 里点不中），斜放的是里面那张。
  const tag = el('div', 'stqr', null, `<div class="stqr-in">${QR}</div>`);
  face.insertBefore(tag, face.firstChild);
  tag.setAttribute('role', 'button'); tag.setAttribute('aria-label', '邀请');
  tag.addEventListener('pointerdown', e => { if (can()) e.stopPropagation(); });
  tag.addEventListener('click', e => { if (!can()) return; e.stopPropagation(); openInvite(); });

  // 点了从底下升上来的卡：大二维码、冰箱名、三个按钮（小样里只弹提示）
  const inv = el('div', 'st-inv', phone, `<div class="st-dim"></div><div class="st-panel"><div class="st-qrbig">${QR}</div><div class="st-fname"></div>
    <div class="st-acts"><button type="button" data-t="已分享">分享</button><button type="button" data-t="已复制">复制链接</button><button type="button" data-t="已送去打印">打印</button></div></div>`);
  const invDim = inv.querySelector('.st-dim'), invPanel = inv.querySelector('.st-panel');
  stop(inv);
  const IV = { on: false, busy: false };
  function openInvite() {
    if (IV.on || IV.busy) return;
    IV.on = IV.busy = true;
    APP.lock(true);
    inv.querySelector('.st-fname').textContent = F.data.name;
    inv.classList.add('on'); phone.classList.add('st-inv-open');
    invDim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RM ? 1 : 240, fill: 'forwards' });
    invPanel.animate([{ transform: 'translateY(104%)' }, { transform: 'translateY(0)' }], { duration: RM ? 1 : 420, easing: 'cubic-bezier(.2, .9, .3, 1.04)', fill: 'forwards' })
      .finished.then(() => { IV.busy = false; }, () => { IV.busy = false; });
  }
  function closeInvite() {
    if (!IV.on || IV.busy) return;
    IV.busy = true;
    invDim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: RM ? 1 : 220, fill: 'forwards' });
    invPanel.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(104%)' }], { duration: RM ? 1 : 260, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' }).finished.then(() => {
      inv.classList.remove('on'); phone.classList.remove('st-inv-open');
      invDim.getAnimations().forEach(a => a.cancel()); invPanel.getAnimations().forEach(a => a.cancel());
      APP.lock(false); IV.on = IV.busy = false;
    }, () => { IV.busy = false; });
  }
  invDim.addEventListener('click', closeInvite);
  inv.querySelectorAll('.st-acts button').forEach(b => b.addEventListener('click', () => APP.say(b.dataset.t)));

  // ---------- 1 / 2 盖在冰箱上的卡 ----------
  // 整屏一层接住手指（不开门、不转镜头）；新人那边压暗一点。卡在这层里贴着下半屏
  const lay = el('div', 'st-lay', phone, `<div class="st-dim"></div><div class="st-card"></div>`);
  const card = lay.querySelector('.st-card'), layDim = lay.querySelector('.st-dim');
  phone.classList.add('st-card-on');
  ['pointerdown', 'pointermove', 'pointerup'].forEach(t => lay.addEventListener(t, e => e.stopPropagation()));
  // 建冰箱那屏不压暗：卡上面露着的门上纸条、邀请贴纸照样点得到（这层盖着它们，按位置转给它们）
  if (NEW) lay.addEventListener('click', e => {
    if (e.target.closest('.st-card') || !can()) return;
    const p = ptOf(e);
    if (window.RULES && inside(p, RULES.rect)) RULES.open();
    else if (inside(p, rectOf(tag))) openInvite();
  });
  function dropCard(then) {
    card.querySelectorAll('input').forEach(i => i.blur());
    const a = card.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(115%) rotate(3deg)', opacity: 1 }], { duration: RM ? 1 : 420, easing: 'cubic-bezier(.5, 0, .9, .45)', fill: 'forwards' });
    if (!NEW) layDim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: RM ? 1 : 380, fill: 'forwards' });
    a.finished.then(() => { lay.remove(); phone.classList.remove('st-card-on'); then(); }, () => {});
  }
  function swap(html) {   // 同一张卡里换下一步
    card.innerHTML = html;
    if (!RM) [...card.children].forEach((c, i) => c.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 220, delay: i * 30, easing: 'ease-out', fill: 'backwards' }));
  }
  const field = (lab, inner) => `<label class="st-f"><span>${lab}</span>${inner}</label>`;

  // ---------- 气泡、二层一闪一闪 ----------
  let saved = null;
  function say(html) { if (saved == null) saved = F.bubble; K.setBubble(F, html); }
  function unsay() { if (saved != null) { K.setBubble(F, saved); saved = null; } }
  let blinkEl = null;
  function blink(t) { blinkEl = names()[t]; if (blinkEl) blinkEl.classList.add('st-blink'); }
  function unblink() { if (blinkEl) blinkEl.classList.remove('st-blink'); blinkEl = null; }
  // 碰别的东西就不闪了
  addEventListener('pointerdown', e => { if (blinkEl && !blinkEl.contains(e.target)) unblink(); }, true);

  // 门开着、到了“开着”那一步再做
  function whenOpen(fn) { const t0 = performance.now(); (function w() { if (APP.mode === 'open' && F.popped) fn(); else if (performance.now() - t0 < 8000) setTimeout(w, 60); })(); }

  if (NEW) {
    // ---------- 1 建冰箱那一屏 ----------
    swap(field('冰箱叫什么', `<input class="st-in" value="${f.name}" maxlength="8" autocomplete="off">`)
      + field('你叫什么', `<input class="st-in" value="" maxlength="6" autocomplete="off">`)
      + `<button type="button" class="st-go">建好</button>`);
    const [iName, iMe] = card.querySelectorAll('input'), go = card.querySelector('.st-go');
    const sync = () => { go.disabled = !iName.value.trim() || !iMe.value.trim(); };
    iMe.addEventListener('pointerdown', () => { if (!iMe.value) { iMe.value = DEMO.me; sync(); } });   // 演示：点一下自动填好
    [iName, iMe].forEach(i => i.addEventListener('input', sync)); sync();
    go.addEventListener('click', () => {
      if (go.disabled) return;
      go.disabled = true;
      const nm = iName.value.trim() || f.name;
      F.data.name = nm; const tb = $('#topbar .tab'); if (tb) tb.textContent = nm;
      dropCard(() => {
        say('点名牌，认一层是你的');
        APP.openDoor();
      });
    });
  } else {
    // ---------- 2 新人登录前那一屏 ----------
    const own = window.FRIDGE.owners, head = `<div class="st-t">加入「${f.name}」</div>`;
    swap(head + `<div class="st-who">已有 2 人<span class="st-dots"><i style="background:${own['青']}"></i><i style="background:${own['满']}"></i></span></div>`
      + `<button type="button" class="st-go">加入</button>`);
    card.querySelector('.st-go').addEventListener('click', mail);
    function mail() {
      swap(head + field('邮箱', `<input class="st-in" type="email" readonly>`) + `<button type="button" class="st-go" disabled>发验证码</button>`);
      const i = card.querySelector('input'), go = card.querySelector('.st-go');
      i.addEventListener('click', () => { i.value = DEMO.mail; go.disabled = false; });
      go.addEventListener('click', () => { if (!go.disabled) code(); });
    }
    function code() {
      swap(head + `<div class="st-f"><span>验证码</span><div class="st-code" role="button">${'<i></i>'.repeat(6)}</div></div>`);
      const box = card.querySelector('.st-code'); let busy = false;
      box.addEventListener('click', () => {
        if (busy) return; busy = true;
        [...box.children].forEach((c, k) => setTimeout(() => { c.textContent = DEMO.code[k]; c.classList.add('on'); }, RM ? 0 : 70 * k));
        setTimeout(me, RM ? 60 : 70 * 6 + 380);
      });
    }
    function me() {
      swap(head + field('你叫什么', `<input class="st-in" readonly>`) + `<button type="button" class="st-go" disabled>进来</button>`);
      const i = card.querySelector('input'), go = card.querySelector('.st-go');
      i.addEventListener('click', () => { i.value = DEMO.me; go.disabled = false; });
      go.addEventListener('click', () => { if (go.disabled) return; go.disabled = true; dropCard(peel); });
    }
    // ---------- 3 纸条自己揭下来一次 → 点一下贴回去 → 门自己打开 ----------
    function peel() {
      const R = window.RULES;
      if (!R) return openUp();
      let seen = false;
      (function w(n) {
        if (!seen) { if (can()) R.open(); if (R.on) seen = true; else if (n > 60) return openUp(); }
        if (seen && !R.on) return setTimeout(openUp, RM ? 0 : 160);
        setTimeout(() => w(n + 1), 60);
      })(0);
    }
    function openUp() {
      say('还空着的是二层');
      APP.openDoor();
      whenOpen(() => blink(1));
    }
  }

  // ---------- 3 建冰箱的人：放大的纸条上每条前面一个空框，点一条勾一条（只记在这一页） ----------
  if (NEW) document.querySelectorAll('#rulesBig .rb-paper li').forEach(li => {
    const b = el('i', 'st-box'); li.prepend(b); li.classList.add('st-ck');
    li.addEventListener('click', e => { e.stopPropagation(); li.classList.toggle('st-done'); });
  });

  // ---------- 4 名牌认层 ----------
  // 点“还没人认”的名牌：名牌旁边两个小按钮。一个人只认一层：再认别的层，原来那层变回“还没人认”
  const pop = el('div', 'st-pop', phone, `<button type="button" data-k="mine">这层是我的</button><button type="button" data-k="pub">大家都能放</button>`);
  stop(pop);
  let popT = -1;
  function showPop(t, n) {
    popT = t; unblink();
    pop.classList.add('on');
    const r = rectOf(n), w = pop.offsetWidth, h = pop.offsetHeight;
    let x = r.x + r.w + 8, y = r.y + r.h / 2 - h / 2;
    if (x + w > 382) { x = Math.max(8, r.x); y = r.y + r.h + 8; }
    pop.style.left = x.toFixed(1) + 'px'; pop.style.top = y.toFixed(1) + 'px';
    if (!RM) pop.animate([{ opacity: 0, transform: 'scale(.86)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: 'cubic-bezier(.2, .9, .3, 1.2)' });
  }
  function hidePop() { pop.classList.remove('on'); popT = -1; }
  addEventListener('pointerdown', e => { if (popT >= 0 && !pop.contains(e.target)) hidePop(); }, true);
  const base = t => F.data.shelves[t].label.split(' · ')[0];
  function setShelf(t, label, mine) {
    const s = F.data.shelves[t], n = names()[t]; if (!s || !n) return;
    s.label = label; if (mine) s.mine = true; else delete s.mine;
    const tp = n.querySelector('.tp'), tx = tp && [...tp.childNodes].find(c => c.nodeType === 3);
    if (tx) tx.textContent = label; else if (tp) tp.prepend(label);
    n.classList.toggle('mine', mine);
    // 我的层整格底色：和 app.js initMineCell 一样（上层不铺）
    if (mine && t >= 1 && !(F.mc && F.mc.t === t)) {
      if (F.mc) F.mc.el.remove();
      const c = el('div', 'minecell'), top = K.S[t - 1] + 26, bot = K.S[t] + 17;
      Object.assign(c.style, { top: top + 'px', height: (bot - top) + 'px', opacity: 0 });
      F.shelf.insertBefore(c, F.shelf.firstChild);
      F.mc = { el: c, t, name: n, flashAt: null, op: '0', fl: '' };
    } else if (!mine && F.mc && F.mc.t === t) { F.mc.el.remove(); F.mc = null; }
    if (tp && !RM) tp.animate([{ transform: 'scale(1.14)' }, { transform: 'none' }], { duration: 280, easing: 'cubic-bezier(.2, .9, .3, 1.3)' });
  }
  pop.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const t = popT; if (t < 0) return; hidePop();
    const nm = base(t);
    if (b.dataset.k === 'mine') {
      const old = F.data.shelves.findIndex(s => s.mine);
      if (old >= 0 && old !== t) setShelf(old, base(old) + ' · ' + UN, false);
      setShelf(t, nm + ' · 我的层', true);
      APP.say(nm + '是你的了');
    } else setShelf(t, nm + ' · 大家都能放', false);
    unsay();
  }));
  window.START = {
    // app.js bindPull 松手时问一句：是“还没人认”的名牌就弹两个小按钮，返回 true（这一下不拉出这一层）
    name(F0, t, n) {
      if (F0 !== F || !n || !n.classList.contains('name')) return false;
      const s = F.data.shelves[t]; if (!s || !s.label.includes(UN)) return false;
      showPop(t, n); return true;
    },
    get mode() { return MODE; }, get pop() { return popT; }, get invite() { return IV.on; }, openInvite, closeInvite
  };

  // ---------- 手机框外的演示按钮（和“快进到周日（演示）”一样，窗口窄时藏起来） ----------
  const bx = el('div', '', document.body); bx.id = 'startBtns';
  [['new', '建冰箱（演示）'], ['join', '新人加入（演示）']].forEach(([k, t]) => {
    const b = el('button', k === MODE ? 'on' : '', bx); b.type = 'button'; b.textContent = t;
    b.addEventListener('click', () => { location.href = location.pathname + '?start=' + k; });
  });
  const frameEl = $('#frame');
  const fitBtns = () => bx.classList.toggle('hidden', (innerWidth - frameEl.getBoundingClientRect().width) / 2 < 170);
  addEventListener('resize', fitBtns); fitBtns();
});
})();
