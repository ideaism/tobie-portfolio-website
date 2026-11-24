// 每周结算和门上的冰箱贴。只有默认界面有；旧界面（?skin=0）和方向 B（?skin=b）里什么都不做。
//
// 一、门上的冰箱贴：贴在厨房大冰箱关着的门上，跟着门转。开场 1 枚（小鱼）。
//    · 按住拖：随便挪到门板上哪儿都行（不出门板、不盖住把手），可以互相叠，最后碰的在最上面
//    · 转：抓在边上拖，它会被“拖着甩”过去（抓正中间只挪不转）；两根手指拧；鼠标滚轮
//    · 点一下：晃一晃
//    只有关着门、正对着大冰箱时能动。位置只记在这一次打开的页面里，“重播”回到开场。
// 二、“快进到周日（演示）”：手机框外面的按钮，不算产品界面。演示只结算一次。
//    · 过关（那盒计划过了大半的牛奶 t1-milk 处理掉了：吃掉，或者收进冷冻）：整屏结算页，开心的那只企鹅欢呼，
//      亮出一枚新冰箱贴；点“贴到门上”后门关上，冰箱贴飞到门上。
//    · 没过关：不出整屏、不扣东西、不指是哪一样，角落里严肃的那只说一句“下周再来”。
// 不改 app.js 里原有的东西：只读 window.__app，关门用它专门留的 __app.reclose()。
//
// 自测用：window.__week = { magnets（每枚的位置和角度）, state, passed, press()（等于按一下按钮）, close()（等于点“贴到门上”） }
(() => {
'use strict';
const app = window.__app, D = window.FRIDGE, SK = window.SKIN;
const phone = document.querySelector('#phone'), face = document.querySelector('#door .face'), btn = document.querySelector('#weekBtn');
if (!app || !D || !D.magnets || !SK || SK.name !== 'a' || !phone || !face || !btn) return;
const qs = new URLSearchParams(location.search);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches || qs.get('rm') === '1';
const ATTENTION = 't1-milk';                 // “计划过了大半”的那件，气泡说的就是它
const DOOR_W = 374, DOOR_H = 464;            // 门板大小（和 style.css 的 #door 一致）
const PAD = 30;                              // 冰箱贴中心离门板边至少这么远
const HANDLE = { x: 78, y0: 117, y1: 322 };  // 把手那一块（门左边中间）不让放
const IMG = D.img;

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const wrap = a => { a %= 360; return a > 180 ? a - 360 : a < -180 ? a + 360 : a; };
const el = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
const buzz = ms => { if (navigator.vibrate) { try { navigator.vibrate(ms); } catch (_) {} } };

document.documentElement.classList.add('week-on');
// 按钮比“重播”宽：手机框旁边空白不够 170 像素（窗口窄）时藏起来，免得压到手机画面上
const frameEl = document.querySelector('#frame');
const fitBtn = () => btn.classList.toggle('hidden', (innerWidth - frameEl.getBoundingClientRect().width) / 2 < 170);
addEventListener('resize', fitBtn); fitBtn();

// ---------- 门上的冰箱贴 ----------
const layer = el('div', 'mags'); face.insertBefore(layer, face.firstChild);   // 在 .shade 下面：门转过去时一起变暗
const catcher = el('div', 'magcatch', layer);
const MAGS = [];
function place(m) { m.el.style.left = (m.x - m.s / 2).toFixed(2) + 'px'; m.el.style.top = (m.y - m.s / 2).toFixed(2) + 'px'; m.rotEl.style.rotate = m.r.toFixed(2) + 'deg'; }
// 留在门板里、让开把手：把中心推到最近的允许位置
function keepIn(p) {
  let x = clamp(p.x, PAD, DOOR_W - PAD), y = clamp(p.y, PAD, DOOR_H - PAD);
  if (x < HANDLE.x && y > HANDLE.y0 && y < HANDLE.y1) {
    const dr = HANDLE.x - x, du = y - HANDLE.y0, dd = HANDLE.y1 - y;
    if (dr <= du && dr <= dd) x = HANDLE.x; else if (du <= dd) y = HANDLE.y0; else y = HANDLE.y1;
  }
  return { x, y };
}
function addMagnet(d, hidden) {
  const h = d.w * d.size[1] / d.size[0], s = Math.max(d.w, h) + 10;   // s：接手指的方框边长（比图大一圈，怎么转都按得到）
  const m = { d, id: d.id, x: d.x, y: d.y, r: d.r, w: d.w, h, s, el: el('div', 'mag' + (hidden ? ' pending' : '')) };
  m.el.dataset.id = d.id; m.el.style.width = m.el.style.height = s.toFixed(2) + 'px';
  m.rotEl = el('div', 'mag-rot', el('div', 'mag-sh', m.el));
  const inner = el('div', 'mag-in', m.rotEl), img = el('img', '', inner);
  Object.assign(inner.style, { width: d.w + 'px', height: h.toFixed(2) + 'px', marginLeft: -d.w / 2 + 'px', marginTop: (-h / 2).toFixed(2) + 'px' });
  img.alt = ''; img.draggable = false; img.src = IMG + d.img;
  layer.insertBefore(m.el, catcher); place(m);
  m.el.addEventListener('pointerdown', e => down(m, e));
  m.el.addEventListener('wheel', e => { if (!canMove() || H) return; e.preventDefault(); e.stopPropagation(); toTop(m); m.r = wrap(m.r + clamp(e.deltaY, -120, 120) * 0.1); place(m); }, { passive: false });
  m.el.addEventListener('animationend', () => m.el.classList.remove('wig', 'land'));
  MAGS.push(m); return m;
}
const toTop = m => { if (m.el.nextSibling !== catcher) layer.insertBefore(m.el, catcher); };
// 只有关着门、正对着大冰箱、镜头停稳时能动；否则这一下让给门（开门、转镜头）
const canMove = () => !W.busy && app.mode === 'closed' && app.fridge === 0 && app.cam.settled;

// 手势。H = { m, pts: Map(指针 id → 门板上的位置), g: 抓的点（冰箱贴自己的坐标，相对中心）, … }
let H = null;
const rot = (v, a) => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return { x: v.x * c - v.y * s, y: v.x * s + v.y * c }; };
const doorPt = e => ({ x: e.offsetX, y: e.offsetY });                     // 指针落在门板上的哪儿（事件的目标是 catcher，和门板一样大）
function grab1(id) {   // 改成一根手指拖：记下它抓在冰箱贴的哪儿
  const m = H.m, p = H.pts.get(id);
  H.one = id; H.g = rot({ x: p.x - m.x, y: p.y - m.y }, -m.r); H.two = null;
}
function grab2() {     // 改成两根手指：记下两指中点、夹角和这时冰箱贴的样子
  const m = H.m, [a, b] = [...H.pts.values()];
  H.two = { mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, ang: deg(Math.atan2(b.y - a.y, b.x - a.x)), x: m.x, y: m.y, r: m.r }; H.one = null;
}
function down(m, e) {
  if (H || !canMove() || (e.pointerType === 'mouse' && e.button !== 0)) return;
  e.preventDefault(); e.stopPropagation();
  // 抓的点：事件给的是它在冰箱贴外框里的位置（已经算上了门和镜头的歪；外框不转，所以这是门板的方向）
  const o = { x: e.offsetX - m.s / 2, y: e.offsetY - m.s / 2 }, g = rot(o, -m.r);
  H = { m, pts: new Map([[e.pointerId, { x: m.x + o.x, y: m.y + o.y }]]), one: e.pointerId, g, two: null, moved: 0, t0: performance.now(), x0: m.x, y0: m.y, r0: m.r, twisted: false };
  toTop(m); m.el.classList.remove('wig', 'land'); m.el.classList.add('held'); catcher.classList.add('on');
  try { catcher.setPointerCapture(e.pointerId); } catch (_) {}
}
catcher.addEventListener('pointerdown', e => {      // 第二根手指
  e.preventDefault(); e.stopPropagation();
  if (!H || H.pts.size >= 2) return;
  H.pts.set(e.pointerId, doorPt(e)); H.twisted = true; grab2();
  try { catcher.setPointerCapture(e.pointerId); } catch (_) {}
});
catcher.addEventListener('pointermove', e => {
  if (!H || !H.pts.has(e.pointerId)) return;
  const m = H.m, p = doorPt(e); H.pts.set(e.pointerId, p);
  if (H.two) {
    const [a, b] = [...H.pts.values()], mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const da = wrap(deg(Math.atan2(b.y - a.y, b.x - a.x)) - H.two.ang), o = rot({ x: H.two.x - H.two.mid.x, y: H.two.y - H.two.mid.y }, da);
    m.r = wrap(H.two.r + da); Object.assign(m, keepIn({ x: mid.x + o.x, y: mid.y + o.y }));
  } else if (e.pointerId === H.one) {
    // 抓的点跟着手指走；冰箱贴的中心尽量留在原地 —— 所以抓在边上拖，它会转过去让中心“拖在后面”。
    // 抓得离中心越近转得越少（k），正中间只挪不转。
    const gl = Math.hypot(H.g.x, H.g.y), k = smooth(7, 20, gl);
    const v = { x: m.x - p.x, y: m.y - p.y };
    if (k > 0 && Math.hypot(v.x, v.y) > 1) {
      const want = deg(Math.atan2(v.y, v.x)) - deg(Math.atan2(-H.g.y, -H.g.x));
      m.r = wrap(m.r + wrap(want - m.r) * k);
    }
    const o = rot(H.g, m.r); Object.assign(m, keepIn({ x: p.x - o.x, y: p.y - o.y }));
  }
  H.moved = Math.max(H.moved, Math.hypot(m.x - H.x0, m.y - H.y0), Math.abs(wrap(m.r - H.r0)) * 0.4);
  place(m);
});
function up(e) {
  if (!H || !H.pts.has(e.pointerId)) return;
  H.pts.delete(e.pointerId);
  try { catcher.releasePointerCapture(e.pointerId); } catch (_) {}
  if (H.pts.size) { grab1([...H.pts.keys()][0]); return; }               // 还剩一根手指：接着拖
  const m = H.m, tap = !H.twisted && H.moved < 5 && performance.now() - H.t0 < 320;
  m.el.classList.remove('held'); catcher.classList.remove('on');
  if (tap) { m.x = H.x0; m.y = H.y0; m.r = H.r0; place(m); if (!RM) { void m.el.offsetWidth; m.el.classList.add('wig'); } }
  else buzz(8);
  H = null;
}
catcher.addEventListener('pointerup', up);
catcher.addEventListener('pointercancel', up);

// ---------- 快进到周日 ----------
const W = { busy: false, done: false, result: '', next: 1 };   // next：下一枚发第几枚（第 0 枚开场就在门上）
addMagnet(D.magnets[0]);
const tipEl = el('div', '', document.body); tipEl.id = 'weekTip';
let tipT = 0;
function tip(text) { tipEl.textContent = text; tipEl.classList.add('on'); clearTimeout(tipT); tipT = setTimeout(() => tipEl.classList.remove('on'), 2200); W.tip = text; }
// 那盒牛奶处理掉了没有：吃掉了（冰箱里找不到了），或者收进了冷冻
function passed() { const it = app.item(ATTENTION); return !it || /^z/.test(String(it.zone || '')); }
// 回到了冰箱画面（没拿着东西、没拉出一层、抽屉关着、没开编辑面板）才结算
function ready() {
  const md = app.mode;
  return (md === 'closed' || md === 'open') && app.fridge === 0 && app.cam.settled && !app.tray.on && !app.drawer.busy && app.drawer.o < 0.01 && !app.edit && !H;
}
function press() {
  if (W.busy) return 'busy';
  if (W.done) { tip('演示只做了一周'); return 'done'; }
  if (!ready()) { tip('先回到厨房大冰箱的画面'); return 'notready'; }
  W.done = true; btn.classList.add('used');
  if (passed()) { W.result = 'pass'; openSheet(); } else { W.result = 'miss'; sayMiss(); }
  return W.result;
}
btn.addEventListener('click', press);

// 没过关：角落里严肃的那只说一句（自己的气泡，说完收掉；这会儿把原来那句先藏起来）
const bub = el('div', '', phone); bub.id = 'weekBubble'; bub.textContent = '下周再来';
function sayMiss() {
  phone.classList.add('week-hush'); bub.classList.add('on');
  setTimeout(() => { bub.classList.remove('on'); setTimeout(() => phone.classList.remove('week-hush'), 260); }, 2600);
}

// 过关：整屏结算页。只有开心的那只。
const sheet = el('div', RM ? 'rm' : '', phone); sheet.id = 'weekSheet';
const fly = el('div', '', phone); fly.id = 'weekFly';
['pointerdown', 'click', 'wheel'].forEach(t => { sheet.addEventListener(t, e => e.stopPropagation()); fly.addEventListener(t, e => e.stopPropagation()); });
let NEW = null, sheetImg = null;
const BIG = 132;   // 结算页上冰箱贴的大小（长的那一边）
function openSheet() {
  W.busy = true;
  const d = D.magnets[W.next], k = BIG / Math.max(d.size[0], d.size[1]);
  NEW = { d, bw: d.size[0] * k, bh: d.size[1] * k };
  sheet.innerHTML = '';
  el('div', 'wrays', sheet);
  el('div', 'wtitle', sheet).textContent = '这周没有东西放坏';
  el('div', 'wsub', sheet).textContent = '门上多了一枚冰箱贴';
  const plate = el('div', 'wplate', sheet);
  for (let i = 0; i < 10; i++) {
    const s = el('div', 'wstar', sheet), a = i / 10 * Math.PI * 2 + 0.3, r = 112 + (i % 3) * 22;
    s.style.setProperty('--dx', (Math.cos(a) * r).toFixed(1) + 'px'); s.style.setProperty('--dy', (Math.sin(a) * r).toFixed(1) + 'px');
    s.style.animationDelay = (1.16 + (i % 4) * 0.03) + 's';
  }
  const wm = el('div', 'wmag', sheet); sheetImg = el('img', '', wm);
  sheetImg.alt = ''; sheetImg.draggable = false; sheetImg.src = IMG + d.img; sheetImg.style.width = NEW.bw.toFixed(1) + 'px'; sheetImg.style.height = NEW.bh.toFixed(1) + 'px';
  el('div', 'wpshadow', sheet);
  const pen = el('div', 'wpen', sheet);
  [['stand', 'penguin-happy-stand.webp'], ['cheer', 'penguin-happy-cheer.webp']].forEach(([c, f]) => { const i = el('img', 'pose ' + c, pen); i.alt = ''; i.draggable = false; i.src = IMG + f; });
  const go = el('button', 'wgo', sheet); go.type = 'button'; go.textContent = '贴到门上';
  go.addEventListener('click', close);
  sheet.classList.add('show'); void sheet.offsetWidth; sheet.classList.add('on');
  if (!RM) setTimeout(() => { plate.classList.add('thud'); buzz(14); }, 1160);
  W.state = 'sheet';
}
// 收起：门关上，新冰箱贴飞到门上
function close() {
  if (W.state !== 'sheet') return;
  W.state = 'fly';
  const d = NEW.d, m = addMagnet(d, true);
  const sc = phone.getBoundingClientRect().width / 390, pr = phone.getBoundingClientRect();
  const toPhone = r => ({ x: (r.left + r.width / 2 - pr.left) / sc, y: (r.top + r.height / 2 - pr.top) / sc });
  const from = toPhone(sheetImg.getBoundingClientRect());
  const land = () => {
    fly.classList.remove('on'); fly.innerHTML = ''; sheet.classList.remove('show', 'on'); sheet.innerHTML = '';
    m.el.classList.remove('pending');
    if (!RM) { m.el.classList.add('land'); const ring = el('div', 'magring', layer); ring.style.left = m.x + 'px'; ring.style.top = m.y + 'px'; ring.addEventListener('animationend', () => ring.remove()); buzz(18); }
    W.next++; W.busy = false; W.state = 'done';
  };
  const wasOpen = app.mode === 'open';
  if (wasOpen) app.reclose();
  if (RM) { sheet.classList.remove('on'); setTimeout(land, wasOpen ? 1500 : 60); return; }
  const f = el('img', '', fly); f.alt = ''; f.src = IMG + d.img; f.style.width = NEW.bw.toFixed(1) + 'px'; f.style.height = NEW.bh.toFixed(1) + 'px';
  const put = (p, s, r) => { f.style.transform = `translate(${(p.x - NEW.bw / 2).toFixed(2)}px, ${(p.y - NEW.bh / 2).toFixed(2)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`; };
  put(from, 1, -6); fly.classList.add('on'); sheetImg.style.visibility = 'hidden';
  sheet.classList.remove('on');                                   // 结算页淡掉，露出正在关上的门
  const HOLD = wasOpen ? 420 : 160, DUR = 760, t0 = performance.now(), s1 = m.w / NEW.bw;
  const step = () => {
    const e = performance.now() - t0 - HOLD;
    if (e >= DUR) { land(); return; }
    if (e > 0) {
      const t = e / DUR, u = t * t * (3 - 2 * t);
      // 落点跟着门上那枚真的（还藏着）走：门还在回弹的时候也对得上
      const to = toPhone(m.el.getBoundingClientRect());
      const ctl = { x: (from.x + to.x) / 2 + 70, y: Math.min(from.y, to.y) - 90 };
      const p = { x: (1 - u) * (1 - u) * from.x + 2 * u * (1 - u) * ctl.x + u * u * to.x, y: (1 - u) * (1 - u) * from.y + 2 * u * (1 - u) * ctl.y + u * u * to.y };
      put(p, lerp(1, s1 * 1.5, u), lerp(-6, m.r + 360, u));
    } else put(from, 1 + 0.08 * Math.sin(Math.max(0, e + HOLD) / HOLD * Math.PI), -6);
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

window.__week = {
  get magnets() { return MAGS.map(m => ({ id: m.id, x: +m.x.toFixed(2), y: +m.y.toFixed(2), r: +m.r.toFixed(2), w: m.w, h: +m.h.toFixed(2), held: !!(H && H.m === m), pending: m.el.classList.contains('pending'), top: m.el.nextSibling === catcher })); },
  get state() { return { busy: W.busy, done: W.done, result: W.result, stage: W.state || '', tip: W.tip || '', canMove: canMove(), ready: ready() }; },
  get passed() { return passed(); },
  press, close
};
})();
