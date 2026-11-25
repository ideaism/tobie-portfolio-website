// 录入：底栏“放入”拉出的面板（只有默认界面「冰箱贴」有；旧界面 ?skin=0 和方向 B 不加载任何东西）。
// 照产品 app\web\src\app.js 的“放入”走：常放的六样一点就进“这一批”，“+ 其他”打一句话，每一行能改归属、计划、放哪，
// 最后“全部放进去”。产品里没有、这次新加的：每样的图（kinds.js 现算）、“黄标 · 临期”开关、“拍购物小票”的演示。
// 放进去时面板收起，门关着就先开门，东西一样一样从“放入”飞到它的格子里（冷冻的飞到冷冻胶带上）。
// 要放在 app.js（要它的 window.__app）之后加载。对外：window.__app.add = { open, close, state, addRow, commit }。
(() => {
'use strict';
const APP = window.__app, D = window.FRIDGE, K = window.KINDS;
if (!window.SKIN || SKIN.name !== 'a' || !APP || !K || !D || !D.fridges) return;
const $ = (s, r = document) => r.querySelector(s);
const phone = $('#phone'), fab = $('#bottombar .fab');
if (!phone || !fab) return;
const RM = !!APP.rm;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const IMG = n => D.img + 'item-' + n + '.webp';

// 界面上的字：能用产品 strings.json（zh）的都用产品的；标了“新”的是这次新提的
const T = {
  mascot: '先放进来，我帮你记住它。',
  groupSoon: '这些我通常尽快吃', groupOpen: '这些先不设计划',
  quickSoon: ['牛奶', '剩菜', '肉'], quickOpen: ['面包', '蔬菜', '饮料'],
  otherLabel: '+ 其他', otherCommit: '加进这批', otherHint: '打一句话，比如 豆浆',
  count: n => n === 1 ? '本次 1 件' : `本次 ${n} 件`,
  save: n => `全部放进去（${n} 件）`, empty: '还没有加任何东西',
  receipt: '拍购物小票', demo: '演示', receiptNote: '演示用的小票。小样里不接真的识别。',   // 新
  yellow: '黄标 · 临期',                                                                    // 新
  foundLink: '不是我的，只是看到一件没人认的东西 →', back: '← 回到放入',
  foundBtn: '看到没人认的东西',   // 第二批 6：跟“拍购物小票”并排的短字（原来那整句 foundLink 留着不删，现在没地方用）
  foundKicker: '看到一件不知道是谁的东西', foundTitle: '把它记下来，<br>不用问任何人。',
  foundLede: '记录本身就让它重新被看见。没有人会被点名。',
  foundNote: '归属锁定为「不知道是谁的」。这一条记录不会 @ 任何人，也不会催任何人认领。',
  foundSave: n => `记下来（${n} 件）`,
  needDesc: '请先写一条简短描述', removed: '已从这批移除', saved: n => n === 1 ? '已记下 1 件' : `已记下 ${n} 件`,
  noPlan: '不设计划'
};
// 归属：产品有四种（个人 / 共用 / 需询问 / 不知道是谁的）。“需询问”这一步不做（要接“问谁”的流程），所以这里只轮三种
const OWN = ['mine', 'shared', 'unknown'], OWN_LABEL = { mine: '个人', shared: '共用', unknown: '不知道是谁的' };
const PLANS = ['这几天吃', '这周内', '说不准'];
const MAX = 42;
// 演示用的小票：六行、假价钱
const RECEIPT = [['纯牛奶', '12.90'], ['鸡胸肉', '18.50'], ['生菜', '4.20'], ['吐司', '9.80'], ['可乐', '3.50'], ['速冻水饺', '16.90']];

// 放哪：我的层、两个“大家都能放”的层、冷冻。名字从 data.js 的层名缩出来
function places(fi) {
  const sh = APP.shelfInfo[fi] || [], out = [];
  const mine = sh.findIndex(s => s.mine);
  if (mine >= 0) out.push({ t: mine, label: `我的层（${sh[mine].label.split(' · ')[0]}）`, open: false });
  sh.forEach((s, t) => { if (s.label.includes('大家都能放')) out.push({ t, label: s.label, open: true }); });
  out.push({ frozen: 0, label: '冷冻', cold: true });
  return out;
}
// 没人认的东西默认放哪：第一个还有空位的“大家都能放”的层（第一台的三层本来就满了，放进去只会进“+N”看不见）；都满了就第一个
function firstOpen(P) {
  const sh = APP.shelves[APP.fridge] || [];
  const room = P.findIndex(p => p.open && sh[p.t] && !sh[p.t].more.length && sh[p.t].vis.length < 4);
  return room >= 0 ? room : Math.max(0, P.findIndex(p => p.open));
}
const coldIdx = P => P.findIndex(p => p.cold);

const S = { on: false, found: false, busy: false, receipt: false, seq: 0, idn: 0, rows: { add: [], found: [] }, placed: [], text: { add: '', found: '' } };
const key = () => (S.found ? 'found' : 'add');
const rows = () => S.rows[key()];

// ---------- DOM ----------
const layer = document.createElement('div'); layer.id = 'addLayer';
layer.innerHTML = '<div class="adim"></div><div class="apanel" role="dialog" aria-label="放入"><div class="ahandle" data-act="close"></div><div class="ascroll"></div><div class="afoot"></div></div>';
const fly = document.createElement('div'); fly.id = 'addFly';
phone.append(fly, layer);
const dimEl = $('.adim', layer), panel = $('.apanel', layer), scroll = $('.ascroll', layer), foot = $('.afoot', layer);
// 只滚面板自己（scrollIntoView 会连整页一起滚，手机框会被顶上去）
function reveal(el) {
  if (!el) return;
  const a = el.getBoundingClientRect(), c = scroll.getBoundingClientRect();
  if (a.bottom > c.bottom) scroll.scrollTop += a.bottom - c.bottom + 8;
  else if (a.top < c.top) scroll.scrollTop -= c.top - a.top + 8;
}
// 面板里的手势一律不往下传：下面的冰箱（转镜头、悬停歪一点）都不接
['pointerdown', 'pointermove', 'pointerup', 'wheel'].forEach(t => layer.addEventListener(t, e => e.stopPropagation()));

const CAM_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.3"/></svg>';
// 第二批 6：“看到没人认的东西”前面一个圈里的问号（层板上没人认的东西贴的就是“?”），跟相机同一种线
const ASK_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><path d="M9.6 9.6a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.5"/><circle class="dot" cx="12" cy="16.6" r=".4"/></svg>';
// 第二批 6：黄标开着时字前面一个勾
const YL_CK = '<svg class="ck" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4 4L18.5 7.5"/></svg>';
function quickBtn(name, plan) {
  const m = K.match(name);
  return `<button type="button" data-act="quick" data-name="${esc(name)}" data-plan="${esc(plan)}"><img src="${IMG(m.img)}" alt="">${esc(name)}</button>`;
}
const labHTML = (txt, cls = 'nlab') => `<span class="${cls}${K.fits(txt) ? '' : ' plain'}">${esc(txt)}</span>`;
function renderTop() {
  const other = `<div class="aother"><span class="aol">${T.otherLabel}</span><input type="text" maxlength="${MAX}" placeholder="${T.otherHint}" value="${esc(S.text[key()])}" enterkeyhint="done"><button type="button" data-act="other">${T.otherCommit}</button></div>`;
  if (S.found) {
    scroll.innerHTML = `<button type="button" class="aback" data-act="back">${T.back}</button>
      <p class="akicker">${T.foundKicker}</p><h2 class="atitle">${T.foundTitle}</h2><p class="alede">${T.foundLede}</p>
      <div class="aquick">${T.quickSoon.concat(T.quickOpen).map(n => quickBtn(n, '说不准')).join('')}</div>
      ${other}<div class="abatch"></div>`;
  } else {
    scroll.innerHTML = `<div class="ahead"><img src="${D.img}penguin-happy-stand.webp" alt="" draggable="false"><div class="abub">${T.mascot}</div></div>
      <p class="aglabel">${T.groupSoon}</p><div class="aquick">${T.quickSoon.map(n => quickBtn(n, '这几天吃')).join('')}</div>
      <p class="aglabel">${T.groupOpen}</p><div class="aquick">${T.quickOpen.map(n => quickBtn(n, '说不准')).join('')}</div>
      ${other}
      <div class="aduo"><button type="button" class="areceipt" data-act="receipt"${S.receipt ? ' disabled' : ''}>${CAM_SVG}${T.receipt}<small>${T.demo}</small></button><button type="button" class="afound" data-act="found">${ASK_SVG}${T.foundBtn}</button></div>
      <div class="rslot"></div>
      <div class="abatch"></div>`;
  }
  const inp = $('input', scroll);
  inp.addEventListener('input', () => { S.text[key()] = inp.value; });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); addOther(); } });
  renderBatch();
}
function rowHTML(r, P, fresh) {
  const p = P[r.place], cold = !!p.cold;
  const own = S.found
    ? `<button type="button" class="open" disabled>${OWN_LABEL.unknown}</button>`
    : `<button type="button" class="${r.own === 'unknown' ? 'open' : 'set'}" data-act="own" data-id="${r.id}">${OWN_LABEL[r.own]}</button>`;
  const plan = cold
    ? `<button type="button" class="cold" disabled>${T.noPlan}</button>`
    : `<button type="button" class="${r.plan === '说不准' ? 'open' : 'set'}" data-act="plan" data-id="${r.id}">${r.plan}</button>`;
  return `<div class="arow${fresh ? ' enter' : ''}" data-id="${r.id}">
    <button type="button" class="athumb" data-act="img" data-id="${r.id}" aria-label="换一个样子"><img src="${IMG(r.img)}" alt="">${r.label ? labHTML(r.label) : ''}${r.yellow ? '<span class="ytag">临期</span>' : ''}</button>
    <div class="abody"><div class="aname">${esc(r.name)}</div><div class="achips">${own}${plan}
      <button type="button" class="${cold ? 'cold' : 'set'}" data-act="place" data-id="${r.id}">${esc(p.label)}</button>
      <button type="button" class="yl${r.yellow ? ' on' : ''}" data-act="yellow" data-id="${r.id}" aria-pressed="${r.yellow}">${r.yellow ? YL_CK : ''}${T.yellow}</button></div></div>
    <button type="button" class="ax" data-act="remove" data-id="${r.id}" aria-label="移除">✕</button></div>`;
}
function renderBatch(freshId) {
  const box = $('.abatch', scroll); if (!box) return;
  const list = rows(), P = places(APP.fridge);
  box.innerHTML = list.length
    ? `<p class="acount">${T.count(list.length)}</p>` + list.map(r => rowHTML(r, P, r.id === freshId)).join('') + (S.found ? `<p class="anote">${T.foundNote}</p>` : '')
    : (S.found ? `<p class="anote">${T.foundNote}</p>` : '');
  const n = list.length;
  foot.innerHTML = `<button type="button" class="ago" data-act="commit"${n ? '' : ' disabled'}>${n ? (S.found ? T.foundSave(n) : T.save(n)) : T.empty}</button>`;
}

// ---------- 这一批 ----------
// 新的一行：归属、放哪照上一行（第一行是 个人 + 我的层）；计划按常放的那一组或 kinds.js；冷冻的东西默认放冷冻
function addRow(text, plan) {
  const name = String(text == null ? '' : text).trim().slice(0, MAX);
  if (!name) { APP.say(T.needDesc); return null; }
  const m = K.match(name), list = rows(), P = places(APP.fridge), prev = list[list.length - 1];
  let own = S.found ? 'unknown' : prev ? prev.own : 'mine';
  let place = prev ? prev.place : S.found ? firstOpen(P) : 0;
  // 上一行是冷冻的（比如速冻水饺）：不把“冷冻”传给下一件不冻的东西，接着用再往前一件放层板的
  if (P[place] && P[place].cold && !m.cold) { const last = list.slice().reverse().find(r => !P[r.place].cold); place = last ? last.place : S.found ? firstOpen(P) : 0; }
  if (m.cold) place = coldIdx(P);
  const plan0 = S.found ? '说不准' : (plan || m.plan || '说不准');
  const r = { id: ++S.seq, name, img: m.img, label: m.label, yellow: false, own, place, plan0, plan: P[place].cold ? null : plan0 };
  list.push(r);
  if (S.on) { renderBatch(r.id); const el = $(`.arow[data-id="${r.id}"]`, scroll); reveal(el); }
  return r;
}
function addOther() {
  const inp = $('input', scroll), v = inp ? inp.value : S.text[key()];
  if (!addRow(v)) return;
  S.text[key()] = ''; if (inp) { inp.value = ''; }
}
const find = id => rows().find(r => r.id === +id);
function act(a, el) {
  const r = el.dataset.id ? find(el.dataset.id) : null, P = places(APP.fridge);
  if (a === 'close') return close();
  if (a === 'quick') return addRow(el.dataset.name, el.dataset.plan);
  if (a === 'other') return addOther();
  if (a === 'receipt') return receipt();
  if (a === 'found' || a === 'back') { S.found = a === 'found'; renderTop(); scroll.scrollTop = 0; return; }
  if (a === 'commit') return commit();
  if (!r) return;
  if (a === 'remove') { S.rows[key()] = rows().filter(x => x !== r); renderBatch(); APP.say(T.removed); return; }
  if (a === 'own' && !S.found) r.own = OWN[(OWN.indexOf(r.own) + 1) % OWN.length];
  if (a === 'plan' && !P[r.place].cold) { r.plan = PLANS[(PLANS.indexOf(r.plan) + 1) % PLANS.length]; r.plan0 = r.plan; }
  if (a === 'place') {
    r.place = (r.place + 1) % P.length;
    const p = P[r.place];
    if (p.open) r.own = 'unknown';                 // 换到“大家都能放”的层：先算不知道是谁的（之后还能改）
    if (p.cold) r.plan = null;                     // 冷冻的不设计划
    else if (r.plan == null) r.plan = r.yellow ? '这几天吃' : r.plan0;
  }
  if (a === 'yellow') { r.yellow = !r.yellow; if (r.yellow && !P[r.place].cold) r.plan = '这几天吃'; }   // 关掉不改回计划
  if (a === 'img') {                               // 点图：轮着换 10 张；不是这个名字本来的样子就贴名字标签
    r.img = K.imgs[(K.imgs.indexOf(r.img) + 1) % K.imgs.length];
    r.label = K.labelFor(r.name, r.img);
  }
  renderBatch();
}
layer.addEventListener('click', e => {
  if (e.target === dimEl) { close(); return; }
  const b = e.target.closest('[data-act]'); if (!b || b.disabled || !S.on || S.busy) return;
  act(b.dataset.act, b);
});

// ---------- 拍购物小票（演示）：网页画的一张小票，扫描线从上扫到下，六样一样一样进这一批，小票收起来 ----------
async function receipt() {
  if (S.receipt || S.found) return;
  S.receipt = true;
  const btn = $('.areceipt', scroll); if (btn) btn.disabled = true;
  const slot = $('.rslot', scroll);
  const total = RECEIPT.reduce((n, [, p]) => n + +p, 0).toFixed(2);
  slot.innerHTML = `<div class="rwrap"><div class="rpaper"><div class="rh">购物小票</div>${RECEIPT.map(([n, p]) => `<div class="rl"><span>${n}</span><span>${p}</span></div>`).join('')}<div class="rt"><span>合计</span><span>${total}</span></div><div class="rscan"></div></div><p class="rnote">${T.receiptNote}</p></div>`;
  const wrap = $('.rwrap', slot), paper = $('.rpaper', slot), scan = $('.rscan', slot);
  reveal(wrap);
  const H = paper.offsetHeight;
  if (!RM) { const a = scan.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${H - 18}px)` }], { duration: 1200, easing: 'linear' }); await a.finished.catch(() => {}); }
  scan.style.display = 'none';
  const lines = [...slot.querySelectorAll('.rl')];
  for (let i = 0; i < RECEIPT.length; i++) {
    if (!S.on) break;
    lines[i].classList.add('got'); addRow(RECEIPT[i][0]);
    if (!RM) await sleep(170);
  }
  if (!RM) await sleep(380);
  if (wrap.isConnected && !RM) {
    const h0 = wrap.offsetHeight;
    await wrap.animate([{ height: h0 + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 320, easing: 'cubic-bezier(.4,0,.2,1)' }).finished.catch(() => {});
  }
  slot.innerHTML = '';
  S.receipt = false;
  const b2 = $('.areceipt', scroll); if (b2) b2.disabled = false;
}

// ---------- 开、关 ----------
function anim(el, kf, o) {
  if (RM || !el.animate) { Object.assign(el.style, kf[kf.length - 1]); return Promise.resolve(); }
  const a = el.animate(kf, Object.assign({ fill: 'forwards' }, o));
  return a.finished.then(() => { Object.assign(el.style, kf[kf.length - 1]); a.cancel(); }, () => {});
}
function open(found) {
  if (S.on || S.busy) return false;
  const m = APP.mode;
  if ((m !== 'open' && m !== 'closed') || !APP.camOk) return false;
  if (found != null) S.found = !!found;
  S.on = true; APP.lock(true); phone.classList.add('add-open');
  renderTop(); layer.classList.add('on'); scroll.scrollTop = 0;
  anim(dimEl, [{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease-out' });
  anim(panel, [{ transform: 'translateY(102%)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.2,1.25,.35,1)' });
  return true;
}
// 关上：草稿留着，下次打开还在
async function close() {
  if (!S.on) return;
  S.on = false;
  const inp = $('input', scroll); if (inp) { S.text[key()] = inp.value; inp.blur(); }
  await Promise.all([anim(dimEl, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }), anim(panel, [{ transform: 'translateY(0)' }, { transform: 'translateY(102%)' }], { duration: 260, easing: 'cubic-bezier(.4,0,.7,.2)' })]);
  layer.classList.remove('on'); phone.classList.remove('add-open');
  APP.lock(false);
}
fab.addEventListener('click', () => { open(); });

// ---------- 全部放进去 ----------
async function waitFor(cond, ms) { const t0 = performance.now(); while (!cond() && performance.now() - t0 < ms) await sleep(30); return cond(); }
function newId(fi) {
  const pre = fi === 0 ? '' : 'f' + fi + '-';
  let id; do { id = pre + 'new-' + (++S.idn); } while (APP.item(id));
  return id;
}
// 一样东西：放进数据（藏着），一份替身从“放入”沿一点弧线飞到格子，落地时真的那份露出来、压一下弹起
function flyOne(fi, r, P) {
  const p = P[r.place], it = { id: newId(fi), img: r.img, name: r.name, kind: r.own, days: 0 };
  if (r.label) it.label = r.label;
  if (r.yellow) it.yellow = true;
  if (!p.cold && r.plan) it.plan = r.plan;
  const mdl = D.models && D.models[r.img]; if (mdl) it.model = mdl;
  const res = APP.putNew(fi, it, p.cold ? { frozen: p.frozen } : p.t, !RM);
  S.placed.push({ id: it.id, name: it.name, rec: res.rec, more: !!res.more, frozen: !!res.frozen });   // 给自测用：这次放进去的
  if (RM) return Promise.resolve(res);
  const [nw, nh] = D.sizes[r.img], k = Math.min(52 / nh, 62 / nw), w = nw * k, h = nh * k;
  const sEnd = res.more || res.frozen ? 0.42 : res.h / h;
  const f = document.createElement('div'); f.className = 'item af';
  f.style.width = w + 'px'; f.style.height = h + 'px';
  f.innerHTML = `<img src="${IMG(r.img)}" alt="">` + (r.label && !res.frozen && !res.more ? labHTML(r.label) : '') + (r.yellow && !res.frozen && !res.more ? '<span class="ytag">临期</span>' : '');
  fly.append(f);
  const x0 = 195, y0 = 786, x1 = res.x, y1 = res.y, cx = (x0 + x1) / 2 + (x1 - x0) * 0.15, cy = Math.min(y0, y1) - 80;
  const kf = [];
  for (let i = 0; i <= 12; i++) {
    const q = i / 12, u = q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2, iu = 1 - u;
    const x = iu * iu * x0 + 2 * iu * u * cx + u * u * x1, y = iu * iu * y0 + 2 * iu * u * cy + u * u * y1;
    const s = 0.55 + (sEnd - 0.55) * u, rot = -8 * Math.sin(Math.PI * u) * Math.sign(x1 - x0 || 1);
    kf.push({ transform: `translate(${(x - w / 2).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(3)})`, opacity: i === 0 ? 0 : 1 });
  }
  const a = f.animate(kf, { duration: 360, easing: 'linear', fill: 'forwards' });
  return a.finished.catch(() => {}).then(() => {
    f.remove(); res.land();
    const el = res.rec.el;
    if (!res.more && !res.frozen && el && el.animate) {
      el.animate([{ transform: 'scale(1.14, .82)' }, { transform: 'scale(.95, 1.07)', offset: .55 }, { transform: 'scale(1)' }], { duration: 170, easing: 'ease-out' });
      const st = res.rec.st; if (st && st.animate) st.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.15)', offset: .7 }, { transform: 'scale(1)' }], { duration: 220, easing: 'ease-out' });
    }
    return res;
  });
}
async function commit() {
  const list = rows().slice();
  if (S.busy || !list.length) return false;
  S.busy = true;
  const fi = APP.fridge, P = places(fi), was = key();
  await close();
  // 门关着：先用原来的开门开到底，等东西都弹出来
  if (APP.mode === 'closed') { APP.openDoor(); await waitFor(() => APP.mode === 'open' && APP.door >= 95.5, 4000); if (!RM) await sleep(650); }   // 再等原来的东西弹出来得差不多
  APP.lock(true);
  const jobs = [];
  for (let i = 0; i < list.length; i++) { if (i && !RM) await sleep(140); jobs.push(flyOne(fi, list[i], P)); }
  await Promise.all(jobs);
  APP.lock(false);
  S.rows[was] = []; S.text[was] = ''; S.found = false;
  APP.say(T.saved(list.length));   // 不给鱼、不庆祝：只是记下了
  S.busy = false;
  return true;
}

APP.add = { open, close, commit, addRow, get state() { return { on: S.on, found: S.found, busy: S.busy, receipt: S.receipt, rows: rows().map(r => ({ ...r, placeLabel: places(APP.fridge)[r.place].label })), drafts: { add: S.rows.add.length, found: S.rows.found.length } }; },
  // 这一页里放进去过的（自测用：{ id, name, rec, more 进了 +N, frozen 进了冷冻 }；重播整页重来就清空）
  get placed() { return S.placed.slice(); } };
})();
