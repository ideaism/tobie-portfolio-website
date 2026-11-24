// 冰箱交互小样：开门 / 拿起来 / 拖给企鹅吃鱼。
// 所有动画都是“时间的纯函数”（弹簧用解析解），所以 ?scene=…&t=毫秒 能把画面定在任意一刻。
(() => {
'use strict';
const D = window.FRIDGE;
const $ = (s, r = document) => r.querySelector(s);
const qs = new URLSearchParams(location.search);
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches || qs.get('rm') === '1';
const phone = $('#phone'), frameEl = $('#frame');
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, p) => a + (b - a) * p;
const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const easeOut = p => 1 - Math.pow(1 - clamp(p, 0, 1), 3);
const easeIn = p => Math.pow(clamp(p, 0, 1), 2.2);
window.__errors = []; window.__trace = [];
const trace = m => { window.__trace.push(m); if (window.__trace.length > 40) window.__trace.shift(); };
addEventListener('error', e => window.__errors.push(String(e.message)));

// ---------- 时钟和补间 ----------
let frozen = null;                         // 定格时的逻辑时间
const clock = () => (frozen != null ? frozen : performance.now());
let nowT = 0;                              // 当前逻辑时间（事件里用来当补间起点）
const tweens = [];
function tween(dur, fn, o = {}) {
  // 减少动态效果：所有过程直接跳到结果（庆祝的自动收起除外，不然一闪就没了）
  const skip = RM && o.tag !== 'celAuto' ? 100000 : 0;
  const tw = { start: (o.start != null ? o.start : nowT) + (o.delay || 0) - skip, dur, fn, done: o.done, tag: o.tag };
  tweens.push(tw); return tw;
}
const at = (delay, fn, tag) => tween(0, () => {}, { delay, done: fn, tag });
function cancel(tag) { for (let i = tweens.length - 1; i >= 0; i--) if (tweens[i].tag === tag) tweens.splice(i, 1); }
function step(t) {
  for (let guard = 0; guard < 400; guard++) {
    let changed = false;
    tweens.sort((a, b) => a.start - b.start);
    for (const tw of tweens.slice()) {
      if (!tweens.includes(tw)) continue;
      const e = t - tw.start;
      if (e < 0) continue;
      if (e >= tw.dur) {
        tweens.splice(tweens.indexOf(tw), 1);
        nowT = tw.start + tw.dur; tw.fn(tw.dur, 1); if (tw.done) tw.done();
        changed = true;
      } else { nowT = tw.start + e; tw.fn(e, e / tw.dur); }
    }
    if (!changed) break;
  }
  nowT = t;
}
// 阻尼弹簧解析解：ms 毫秒后的位置和速度（v0、v 单位是 每秒）
function spring(ms, from, to, v0 = 0, w = 14, z = 0.6) {
  const t = Math.max(0, ms) / 1000, A = from - to;
  if (z < 1) {
    const wd = w * Math.sqrt(1 - z * z), B = (v0 + z * w * A) / wd, e = Math.exp(-z * w * t);
    const c = Math.cos(wd * t), s = Math.sin(wd * t);
    return { x: to + e * (A * c + B * s), v: e * (-z * w * (A * c + B * s) + (-A * wd * s + B * wd * c)) };
  }
  const B = v0 + w * A, e = Math.exp(-w * t);
  return { x: to + (A + B * t) * e, v: (B - w * (A + B * t)) * e };
}
const springMs = (w, z) => Math.min(4000, 1000 * Math.log(1500) / (z * w));
const act = fn => e => { nowT = clock(); fn(e); };

// ---------- 画面缩放和坐标 ----------
let SC = 1;
function fit() {
  const W = innerWidth, H = innerHeight;
  const mobile = W <= 440 || (W <= 600 && matchMedia('(pointer:coarse)').matches);
  let s, l, t;
  // 手机上宽、高哪边先碰到边就按哪边缩，整个画面都放得下（屏幕比画面矮时左右留和底色一样的边，不再切掉底下）
  if (mobile) { s = Math.min(W / 390, H / 844); l = (W - 390 * s) / 2; t = (H - 844 * s) / 2; } else { s = Math.min((W - 48) / 390, (H - 48) / 844); l = (W - 390 * s) / 2; t = (H - 844 * s) / 2; }
  frameEl.classList.toggle('mobile', mobile);
  document.documentElement.classList.toggle('mobile', mobile);
  document.body.style.overflow = 'hidden';
  SC = s; document.documentElement.dataset.vw = W + "x" + H;
  Object.assign(frameEl.style, { left: l + 'px', top: t + 'px', width: 390 * s + 'px', height: 844 * s + 'px' });
  phone.style.transform = `scale(${s})`;
  // “重播”只放在手机画面外面；手机上没空白就藏起来
  $('#replay').classList.toggle('hidden', mobile || (W - 390 * s) / 2 < 90);
}
addEventListener('resize', fit); fit();
function loc(e) { const r = frameEl.getBoundingClientRect(); return { x: (e.clientX - r.left) / SC, y: (e.clientY - r.top) / SC }; }

// ---------- 层板 ----------
const S = [264, 346, 427, 509, 584], SOFF = [4, 5, 7, 9, 3], X = [69, 153, 237, 321];
const src = name => D.img + 'item-' + name + '.webp';
const draggable = it => it.kind === 'mine' || it.kind === 'shared';   // 能处理：喂企鹅、扔进桶、详情卡上的按钮（只有我的、共用的）
// 能挪：默认界面里谁的东西都能按住拖起来换一层、放进冷冻（照产品，归属不变）；旧界面、方向 B 和以前一样只有能处理的才拖得动
const movable = it => draggable(it) || (A && (it.kind === 'other' || it.kind === 'unknown'));
function rectOf(it) {
  const [w, h] = D.sizes[it.img], maxH = it.t < 4 ? 52 : 40, k = Math.min(maxH / h, 62 / w);
  const W = w * k, H = h * k; return { x: X[it.s] - W / 2, y: S[it.t] + SOFF[it.t] - H, w: W, h: H };
}
function div(cls, text) { const d = document.createElement('div'); d.className = cls; if (text != null) d.textContent = text; return d; }

// ---------- 冰箱：每台一份 ----------
// 方向 A（默认界面）有两台冰箱，并排摆在一个“厨房”（#kitchen）里，每台一个 .fx 容器，里面是这台自己的
// 底图、内腔光、层板和东西、门缝条、门、冷冻标签、转场铭牌。第二台是第一台的复制品（id 换成同名 class）。
// 旧界面（?skin=0）和方向 B 只有一台，DOM 原样不动，“这台冰箱”就是原来那几个 id 元素。
// 每台的状态：门角度 a、开过没有 popped、东西记录 recs；全局的（企鹅、气泡、拿起层、详情卡、庆祝）还是一份。
const A = !!(window.SKIN && SKIN.name === 'a' && D.fridges);
const bubble = $('#bubble');
const FR = [];
let cur = null;   // 镜头正对着的那台
function mkFridge(i, root, q, data) {
  const F = { i, root, data, recs: {}, a: 0, popped: false, pendingAuto: false, mine: -1, bubble: '',
    stage: q('stage'), shelf: q('shelf'), strip: q('strip'), scene: q('doorScene'), doorEl: q('door'), ftags: q('freezerTags') };
  const inn = q('interior'); F.dark = inn.querySelector('.dark'); F.glow = inn.querySelector('.glow');
  F.face = F.doorEl.querySelector('.face'); F.shade = F.doorEl.querySelector('.shade');
  return F;
}
function setupFridges() {
  if (!A) { FR.push(mkFridge(0, phone, id => $('#' + id), D)); return; }
  const kitchen = document.createElement('div'); kitchen.id = 'kitchen';
  phone.insertBefore(kitchen, $('#stage'));
  const fx0 = div('fx'); kitchen.append(fx0);
  ['stage', 'interior', 'shelf', 'strip', 'doorScene', 'freezerTags'].forEach(id => fx0.append($('#' + id)));
  const proto = fx0.cloneNode(true);   // 层板还没建，先留一份空的当模子
  const html0 = bubble.innerHTML;       // 第一台的气泡就是 skin.js 写好的那句
  D.fridges.forEach((data, i) => {
    let root = fx0, q = id => $('#' + id);
    if (i > 0) {
      root = proto.cloneNode(true); root.classList.add('fxc');
      root.querySelectorAll('[id]').forEach(el => { el.classList.add(el.id); el.removeAttribute('id'); });
      kitchen.append(root); q = c => root.querySelector('.' + c);
    }
    const F = mkFridge(i, root, q, data);
    if (i > 0) {
      F.stage.src = data.stage;
      F.face.style.backgroundImage = `url(${D.img + data.door})`;
      const tp = F.ftags.querySelector('.tp'); if (tp) tp.textContent = data.freezer;
    }
    F.plate = div('plate'); F.plateTp = div('tp'); F.plate.append(F.plateTp); root.append(F.plate);
    F.bubble = data.bubble || html0;
    FR.push(F);
  });
}

function build(F) {
  const shelf = F.shelf, dat = F.data;
  dat.shelves.forEach(s => {
    const n = div('name fade' + (s.mine ? ' mine' : ''), s.label);
    n.style.top = s.y + 'px';
    if (s.right) n.style.right = (390 - s.right) + 'px'; else n.style.left = '31px';
    shelf.append(n);
  });
  dat.items.forEach(it => {
    const r = rectOf(it), el = div('item ' + it.kind);
    Object.assign(el.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px', opacity: 0 });
    const im = new Image(); im.src = src(it.img); im.alt = ''; im.draggable = false; im.style.transition = 'transform .14s';
    el.append(im, div('hit'));
    shelf.append(el);
    let st = null;
    if (it.sticker || it.kind === 'unknown') {
      const txt = it.kind === 'unknown' ? '?' : it.sticker;
      st = div('sticker pop' + (txt === '共' ? ' shared' : txt === '?' ? ' ask' : ''), txt);
      if (D.owners[txt]) st.style.background = D.owners[txt];
      Object.assign(st.style, { left: (r.x + r.w - 11) + 'px', top: (r.y - 7) + 'px', transform: 'scale(0)' });
      shelf.append(st);
    }
    const rec = { it, el, img: im, st, r, F };
    F.recs[it.id] = rec; bindItem(rec); decorate(rec);   // 名字小标签、黄标（只有默认界面）
  });
  if (dat.more) {
    const m = div('more fade', dat.more.text);
    Object.assign(m.style, { left: (X[dat.more.s] - 20) + 'px', top: '312px', width: '40px', padding: 0, textAlign: 'center' });
    shelf.append(m);
  }
  F.root.querySelectorAll('.fade').forEach(f => { f.style.opacity = 0; });
}

// 门开到底后：东西一层一层、一样一样弹出来，然后名牌、贴纸、+2、气泡淡入
function popItems(F = cur) {
  const list = F.data.items.map(it => F.recs[it.id]).filter(Boolean);
  let last = 0;
  list.forEach((rec, i) => {
    const d = rec.it.t * 55 + i * 38; last = d;
    const w = 17, z = 0.42;
    tween(springMs(w, z), e => {
      const s = Math.max(0, spring(e, 0, 1, 0, w, z).x);
      rec.el.style.transform = `translateY(${(1 - Math.min(1, s)) * 10}px) scale(${s.toFixed(4)})`;
      rec.el.style.opacity = clamp(e / 60, 0, 1);
    }, { delay: d, tag: 'pop' });
  });
  const t1 = last + 220;
  const fades = [...F.root.querySelectorAll('.fade')];
  if (A && F === cur && !BUB.out) fades.push(bubble);   // 气泡是全局的：只有正对着的那台开门时才跟着淡入
  fades.forEach((f, i) => {
    // 气泡的这一下用 'bub' 标签：镜头一动 bubbleOut() 能把它取消
    tween(320, e => { const p = easeOut(e / 320); f.style.opacity = p; f.style.translate = `0 ${(1 - p) * 4}px`; }, { delay: t1 + i * 28, tag: f === bubble ? 'bub' : 'pop' });
  });
  list.filter(r => r.st).forEach((rec, i) => {
    // rec.st 可能在弹出途中被收走（比如录入时这一层多出“+N”，第 4 件收进去、贴纸跟着没了）：没了就不弹
    tween(springMs(20, .4), e => { if (rec.st) rec.st.style.transform = `scale(${Math.max(0, spring(e, 0, 1, 0, 20, .4).x)})`; }, { delay: t1 + 60 + i * 50, tag: 'pop' });
  });
}

// ---------- 1 开门 ----------
// 门、门缝条、内腔光都是每台冰箱一份（F）；不传 F 就是镜头正对着的那台
const HINGE = 384, DOOR_W = 374, PERSP = 900, PO = 195;
function setDoor(a, F = cur) {
  F.a = a;
  const doorEl = F.doorEl;
  doorEl.style.transform = `rotateY(${a.toFixed(3)}deg)`;
  F.shade.style.opacity = clamp(a / 90, 0, 1);              // 门板转开时变暗一点
  doorEl.style.opacity = 1 - smooth(72, 89, a);              // 将近 90 度时淡出
  doorEl.style.visibility = a >= 89.5 ? 'hidden' : 'visible';
  doorEl.style.pointerEvents = a >= 86 ? 'none' : 'auto';
  F.strip.style.opacity = 1 - smooth(58, 72, a);             // 七八成时露出 stage 里那条开着的门
  const p = smooth(2, 80, a);
  F.dark.style.opacity = 0.6 * (1 - p);                      // 里面从暗到亮
  F.glow.style.opacity = smooth(16, 70, a).toFixed(3);       // 顶灯亮起来
  if (!F.popped && a > 84) { F.popped = true; F.pendingAuto = false; if (F === cur && mode === 'closed') mode = 'open'; popItems(F); }
}
// 透视下：门上离合页 d 的那一点，转到 a 度时在屏幕上的 x
const projX = (d, a) => { const r = a * Math.PI / 180; return PO + (HINGE - d * Math.cos(r) - PO) * PERSP / (PERSP - d * Math.sin(r)); };
function bisect(f, lo, hi, target) { for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (f(m) < target) lo = m; else hi = m; } return (lo + hi) / 2; }
function openDoor(v0 = 0, F = cur) {
  cancel('door' + F.i); cancel('hint' + F.i);
  const a0 = F.a, w = 9.5, z = 0.58;
  tween(springMs(w, z), e => setDoor(spring(e, a0, 96, v0, w, z).x, F), { tag: 'door' + F.i, done: () => setDoor(96, F) });
}
function closeDoor(v0 = 0, F = cur) {
  cancel('door' + F.i);
  const a0 = F.a, w = 13, z = 0.42;
  // 关门时越过 0 度就当撞到门框，弹回来（取绝对值）
  tween(springMs(w, z), e => setDoor(Math.abs(spring(e, a0, 0, v0, w, z).x), F), { tag: 'door' + F.i, done: () => { setDoor(0, F); scheduleHint(1800, F); } });
}
// 门关着时，每隔一会儿门轻轻被拽一下，提示能拉
function scheduleHint(delay = 1400, F = cur) {
  if (RM) return;
  tween(900, e => { const p = e / 900; setDoor(5.5 * Math.abs(Math.sin(p * Math.PI * 2)) * Math.exp(-2.4 * p), F); },
    { delay, tag: 'hint' + F.i, done: () => { setDoor(0, F); scheduleHint(2800, F); } });
}
let G = null; // 当前手势
function bindDoor(F) {
  const doorEl = F.doorEl;
  doorEl.addEventListener('pointerdown', act(e => {
    if (F.popped || G || F !== cur) return;
    // 两台冰箱时：只有抓在把手附近（门左边）才是拉门；门上别处按下去是转镜头，点一下还是开门
    if (A && (!camSettled() || (F.a < 8 && loc(e).x > 130))) { if (mode === 'closed' || mode === 'open') camGesture(e, () => openDoor(260, F)); return; }
    e.preventDefault();
    cancel('door' + F.i); cancel('hint' + F.i);
    const p = loc(e), a0 = F.a;
    const d0 = clamp(bisect(d => -projX(d, a0), 30, DOOR_W, -p.x), 30, DOOR_W);
    const hist = [{ t: performance.now(), a: a0 }];
    let moved = 0; const t0 = performance.now();
    doorEl.classList.add('grab');
    G = {
      id: e.pointerId,
      move(q) {
        moved = Math.max(moved, Math.hypot(q.x - p.x, q.y - p.y));
        let a;
        if (q.x <= projX(d0, 0)) a = 0;
        else if (q.x >= projX(d0, 92)) a = 92 + (q.x - projX(d0, 92)) * 0.05;
        else a = bisect(x => projX(d0, x), 0, 92, q.x);
        setDoor(Math.min(a, 99), F);
        const now = performance.now(); hist.push({ t: now, a: F.a });
        while (hist.length > 2 && now - hist[0].t > 90) hist.shift();
      },
      up() {
        doorEl.classList.remove('grab');
        const now = performance.now(), h0 = hist[0];
        const v = now - h0.t > 8 ? (F.a - h0.a) / ((now - h0.t) / 1000) : 0;
        if (moved < 6 && now - t0 < 450) openDoor(260, F);               // 点一下：自己开
        else if (F.a > 38 || v > 320) openDoor(Math.max(v, 0), F);       // 角度够了或甩得够快：弹开到底
        else closeDoor(Math.min(v, 0), F);                               // 否则弹回关上
      }
    };
    try { doorEl.setPointerCapture(e.pointerId); } catch (_) {}
  }));
}

// ---------- 2 拿起来 ----------
let mode = 'closed'; // closed / open / picked / drag / busy / celebrate
const dim = $('#dim'), liftEl = $('#lift'), tiltEl = $('#lift .tilt'), liftImg = $('#lift img'), gloss = $('#lift .gloss'), lshadow = $('#liftShadow');
const sheet = $('#sheet');
const L = { rec: null, w: 0, h: 0, cx: 0, cy: 0, s: 1, rx: 0, ry: 0, rz: 0, vrx: 0, vry: 0, tilt: { x: 0, y: 0 }, tiltOn: false, bobA: 0, up: 0, shOp: 0, gap: 8, mv: null, token: null };
function prepLift(rec) {
  const [nw, nh] = D.sizes[rec.it.img], k = 170 / Math.max(nw, nh);
  L.w = nw * k; L.h = nh * k; L.rec = rec;
  liftEl.style.width = L.w + 'px'; liftEl.style.height = L.h + 'px';
  liftImg.src = src(rec.it.img);
  const m = `url(${src(rec.it.img)})`; gloss.style.webkitMaskImage = m; gloss.style.maskImage = m;   // 反光只在图的不透明处
  liftEl.style.display = 'block'; lshadow.style.display = 'block';
  const r = rectNow(rec); L.cx = r.x + r.w / 2; L.cy = r.y + r.h / 2; L.s = r.h / L.h;
  L.rx = L.ry = L.rz = L.vrx = L.vry = 0; L.tilt = { x: 0, y: 0 }; L.bobA = 0; L.up = 0; L.shOp = 0.2;
  rec.el.style.visibility = 'hidden'; if (rec.st) rec.st.style.visibility = 'hidden';
  if (rec.tv) rec.tv.el.style.visibility = 'hidden';   // 从托盘上拿起来的：藏的是托盘上那一份
}
// 东西此刻在屏幕上的位置：镜头没歪时就是排版位置；镜头还在晃（悬停、陀螺仪）时量一下真实位置
function rectNow(rec) {
  if (rec.tv) return rec.tv.r;   // 在托盘上：托盘格子里的位置
  if (!A || camRest()) return rec.r;
  const b = rec.el.getBoundingClientRect(), f = frameEl.getBoundingClientRect();
  return { x: (b.left - f.left) / SC, y: (b.top - f.top) / SC, w: b.width / SC, h: b.height / SC };
}
function hideLift() { liftEl.style.display = 'none'; lshadow.style.display = 'none'; L.rec = null; }
function renderLift() {
  if (!L.rec) return;
  const bob = RM ? 0 : Math.sin(clock() / 650) * 2.2 * L.bobA;
  liftEl.style.transform = `translate(${L.cx - L.w / 2}px, ${L.cy - L.h / 2 + bob}px) scale(${L.s}) rotate(${L.rz}deg)`;
  tiltEl.style.transform = `rotateX(${L.rx}deg) rotateY(${L.ry}deg)`;
  gloss.style.backgroundPosition = `${50 - L.ry * 2.6}% ${50 + L.rx * 2.6}%`;
  gloss.style.opacity = (0.45 + Math.min(1, (Math.abs(L.rx) + Math.abs(L.ry)) / 16) * 0.55).toFixed(3);
  // 影子：光在左上，影子偏右下；举得越高越远越淡
  const sw = L.w * L.s * 0.82, sh = 10 + 12 * L.s;
  const sy = L.cy + L.h * L.s / 2 + L.gap * L.up + 4 - sh / 2, sx = L.cx + 6 * L.up + L.ry * 0.4;
  lshadow.style.width = sw + 'px'; lshadow.style.height = sh + 'px';
  lshadow.style.transform = `translate(${sx - sw / 2}px, ${sy}px)`;
  lshadow.style.opacity = L.shOp.toFixed(3);
}
function setTiltFrom(p) {
  const hw = L.w * L.s / 2, hh = L.h * L.s / 2;
  const nx = clamp((p.x - L.cx) / hw, -1.15, 1.15), ny = clamp((p.y - L.cy) / hh, -1.15, 1.15);
  L.tilt = { y: nx * 14, x: -ny * 14 };
}
function dimTo(on) {
  cancel('dim'); const o0 = +dim.style.opacity || 0;
  dim.classList.toggle('on', on);
  tween(on ? 280 : 260, e => { dim.style.opacity = lerp(o0, on ? 1 : 0, easeOut(e / (on ? 280 : 260))); }, { tag: 'dim' });
}
function pick(rec) {
  trace('pick ' + rec.it.id);
  ED = null; TH = null;
  mode = 'picked'; prepLift(rec); L.tiltOn = true; L.gap = 16;
  const f = { cx: L.cx, cy: L.cy, s: L.s }, w = 12, z = 0.66;
  tween(springMs(w, z), e => {
    const p = spring(e, 0, 1, 0, w, z).x, q = clamp(p, 0, 1);
    L.cx = lerp(f.cx, 195, p); L.cy = lerp(f.cy, 300, p) - 40 * Math.sin(Math.PI * q);   // 带一点弧线飞上来
    L.s = lerp(f.s, 1, p); L.up = q; L.shOp = 0.25 + 0.65 * q;
  }, { tag: 'lift' });
  tween(700, e => { L.bobA = smooth(0, 700, e); }, { delay: 380, tag: 'lift' });
  dimTo(true);
  openSheet(rec);
  maybeModel(rec);
}
function flyBack(done) {
  cancel('lift'); cancel('dscale'); cancel('doff');
  const rec = L.rec, f = { cx: L.cx, cy: L.cy, s: L.s, rx: L.rx, ry: L.ry, rz: L.rz, up: L.up, sh: L.shOp }, w = 14, z = 0.72;
  let r = rec.tv ? rec.tv.r : rec.r;
  // 默认界面：托盘开着时放回层板上（比如冷冻托盘上点了“拿出来解冻”）：层板跟着冰箱缩了，换算到屏幕上
  if (A && TR.on && !rec.tv) { const k = kNow(), a = toScr(r.x, r.y, k); r = { x: a.x, y: a.y, w: r.w * k, h: r.h * k }; }
  L.tiltOn = false; L.bobA = 0; const ts = r.h / L.h;
  tween(springMs(w, z), e => {
    const p = spring(e, 0, 1, 0, w, z).x, q = clamp(p, 0, 1);
    L.cx = lerp(f.cx, r.x + r.w / 2, p); L.cy = lerp(f.cy, r.y + r.h / 2, p) - 26 * Math.sin(Math.PI * q);
    L.s = lerp(f.s, ts, p); L.rx = f.rx * (1 - q); L.ry = f.ry * (1 - q); L.rz = f.rz * (1 - q);
    L.up = f.up * (1 - q); L.shOp = f.sh * (1 - q);
  }, { tag: 'lift', done: () => {
    hideLift(); rec.el.style.visibility = ''; if (rec.st) rec.st.style.visibility = '';
    if (rec.tv) rec.tv.el.style.visibility = '';
    // 落回层板（或托盘）时压扁一下再弹起
    const lt = rec.tv ? rec.tv.box : rec.el;
    tween(springMs(22, .35), e => { const k = spring(e, 0.16, 0, 0, 22, .35).x; lt.style.transform = `scale(${1 + k * 0.6}, ${1 - k})`; }, { tag: 'land' });
    if (done) done();
  } });
}
function unpick(v = 0) {
  trace('unpick ' + mode);
  if (mode !== 'picked') return;
  mode = 'busy'; closeSheet(v); dimTo(false); removeModel();
  flyBack(() => { mode = 'open'; });
}

// 底部白卡
const plainChip = (t, c = '') => `<span class="chip ${c}">${t}</span>`;
function sheetHTML(it, DD = D) {
  const name = (A && it.name) || D.names[it.img], where = DD.shelves[it.t].label;   // 默认界面：东西有自己的名字就用它
  let chips = '', btns = '', note = '';
  if (it.kind === 'mine') {
    chips = plainChip('个人', 'me') + (it.plan ? plainChip(it.plan, 'plan') : '') + plainChip(`放了 ${it.days} 天`);
  } else if (it.kind === 'shared') {
    chips = plainChip('共用', 'me') + plainChip(`放了 ${it.days} 天`);
  } else if (it.kind === 'unknown') {
    chips = plainChip('不知道是谁的', 'ask') + plainChip(`放了 ${it.days} 天`);
    btns = `<div class="btns"><button>这是我的</button><button>我打算处理它</button><button class="wide" data-act="leave">先别动</button></div>`;
  } else {
    chips = plainChip('个人') + `<span class="chip" style="color:${D.owners[it.owner]}">${D.ownerNames[it.owner]}</span>`;
  }
  if (draggable(it)) {
    btns = `<div class="btns"><button>开了</button><button>放进冷冻</button><button>更新</button><button class="go" data-act="eat">处理掉它</button></div>`;
    note = `<div class="note">处理掉它，企鹅就能吃到一条</div>`;
  }
  return `<div class="handle"></div><div class="head"><div class="sicon"><img src="${src(it.img)}" alt=""></div><div><div class="title">${name}</div><div class="sub">${where}</div></div></div><div class="chips">${chips}</div>${btns}${note}`;
}
let sheetY = 0;
const setSheetY = y => { sheetY = y; sheet.style.transform = `translateY(${y}px)`; };
// 详情卡的内容（打开时、点了“开了”“更新”“取消”“保存更新”后都重画一遍）。方向 B、旧界面出来的字和以前一样
let ED = null;   // 默认界面：“更新”展开的编辑面板的草稿（见“8 详情卡上的开了 / 更新”）；没展开时是 null
let TH = null;   // 默认界面：“拿出来解冻”展开的两行的草稿 { rec, t 放回哪层（'s' + 层号）, plan, zones }（第四步，见 openThaw）
function fillSheet(rec) {
  // 第二台的层名不一样：给详情卡一份“这台的层 + 共用的名字、颜色”
  const DV = !rec.F || rec.F.data === D ? D : Object.assign(Object.create(D), { shelves: rec.F.data.shelves });
  sheet.innerHTML = window.SKIN ? SKIN.sheetHTML(rec.it, DV, draggable(rec.it), A ? sheetEx(rec) : undefined) : sheetHTML(rec.it, DV);
  sheet.querySelectorAll('button').forEach(b => {
    b.addEventListener('click', act(() => {
      if (mode !== 'picked') return;
      if (sheetLocked(SLK.down)) return;   // 卡片内容刚换过：这一下多半是连点落到了换上来的按钮上，不接
      const a = b.dataset.act;
      if (a === 'eat') feedFromPick();
      else if (a === 'leave') unpick();
      else if (A && a === 'freeze') freezeFromPick();
      else if (A && a === 'open') { if (rec.it.opened) unOpen(rec); else markOpened(rec); }   // “已开”再点一下 = 改回没开
      else if (A && a === 'edit') openEdit(rec);
      else if (A && a === 'thaw') openThaw(rec);   // 第四步：先展开选层、选计划，点“放回去”才飞
      else if (A && a === 'thaw-go') thawGo();
      else if (A && a === 'thaw-cancel') closeThaw();
      else if (A && a === 'save') saveEdit();
      else if (A && a === 'cancel') closeEdit();
      else if (A && (ED || TH) && b.dataset.v) pickOpt(b);
      else if (A && window.MARKS && MARKS.act(a, rec, b)) {}   // 记号那几个按钮（这是我的 / 我打算处理它 / 先别动 / 谁想吃都可以拿 / 收回），见 marks.js
      else tween(260, e => { b.style.transform = `scale(${1 - 0.05 * Math.sin(Math.PI * e / 260)})`; }); // 其他按钮这一批不起作用，只回个手感
    }));
  });
}
function openSheet(rec) {
  cancel('sheet');
  fillSheet(rec); sheet.style.display = 'block';
  const H = sheet.offsetHeight; sheet.style.top = (844 - H) + 'px';
  setSheetY(H + 30);
  tween(springMs(15, .8), e => setSheetY(spring(e, H + 30, 0, 0, 15, .8).x), { tag: 'sheet', delay: 50 });
  if (A) peekTo(1);   // 企鹅从白卡上沿右边探出半个身子
}
function closeSheet(v = 0) {
  ED = null; TH = null;   // 编辑面板（和解冻那两行）的草稿不留：放回去、拖走、喂掉都等于“取消”
  if (sheet.style.display !== 'block') return;
  if (A) peekTo(0);
  cancel('sheet'); const y0 = sheetY, H = sheet.offsetHeight + 40;
  tween(420, e => setSheetY(Math.min(H, spring(e, y0, H, v, 16, 1).x)), { tag: 'sheet', done: () => { sheet.style.display = 'none'; } });
}
// 防连点（只有默认界面）：卡片内容刚换过（打开编辑面板、保存、取消、标开了、改回，见 refill）之后 400 毫秒里，
// 卡上的按钮不接、卡不让拖、点暗处也不放回去。按下的时刻也算：在这段时间里按下去、过了才松手的，也不接。
const SLK = { t0: -1e9, t1: -1e9, down: -1e9, dimAt: -1e9 };
const sheetLocked = d => A && ((nowT >= SLK.t0 && nowT < SLK.t1) || (d >= SLK.t0 && d < SLK.t1));
if (A) sheet.addEventListener('pointerdown', () => { SLK.down = clock(); }, true);
sheet.addEventListener('pointerdown', act(e => {
  if (mode !== 'picked' || e.target.closest('button') || G) return;
  if (sheetLocked(nowT)) return;   // 卡刚变高还在往上弹：这时按住会停在半路，松手就当成“往下拖走了”
  const p = loc(e), hist = [{ t: performance.now(), y: 0 }];
  cancel('sheet');
  G = {
    id: e.pointerId,
    move(q) { const dy = q.y - p.y; setSheetY(dy > 0 ? dy : dy * 0.22); const n = performance.now(); hist.push({ t: n, y: sheetY }); while (hist.length > 2 && n - hist[0].t > 90) hist.shift(); },
    up() {
      const n = performance.now(), h0 = hist[0], v = n - h0.t > 8 ? (sheetY - h0.y) / ((n - h0.t) / 1000) : 0;
      if (sheetY > 70 || v > 600) unpick(v);
      else { const y0 = sheetY; tween(springMs(16, .7), e2 => setSheetY(spring(e2, y0, 0, v, 16, .7).x), { tag: 'sheet' }); }
    }
  };
  try { sheet.setPointerCapture(e.pointerId); } catch (_) {}
}));
// 点压暗处放回去。要求按下也在压暗层上：触摸点东西后浏览器补发的 click 会落到刚出现的压暗层上，不能把它当成“点了空白”
let dimDown = false;
dim.addEventListener('pointerdown', () => { dimDown = mode === 'picked'; SLK.dimAt = clock(); });
dim.addEventListener('click', act(e => { if (mode === 'picked' && dimDown && !sheetLocked(SLK.dimAt) && !nearToast(e)) unpick(); dimDown = false; }));   // nearToast：点偏在“撤销”提示条旁边不算

// 拿起来之后：手指在东西上移动它就歪；“我的”“共用”还能直接拖走
liftEl.addEventListener('pointerdown', act(e => {
  if (A && mode === 'picked' && !G && L.mv && L.mv.loaded && L.mv.style.opacity === '1') { spinGesture(e); return; }
  if (mode !== 'picked' || G || e.target.closest('model-viewer')) return;
  e.preventDefault();
  const p = loc(e); setTiltFrom(p);
  G = {
    id: e.pointerId,
    move(q) {
      if (movable(L.rec.it) && Math.hypot(q.x - p.x, q.y - p.y) > 8) { beginDrag(L.rec, 'lift', q); return; }
      setTiltFrom(q);
    },
    up() { L.tilt = { x: 0, y: 0 }; }
  };
  try { liftEl.setPointerCapture(e.pointerId); } catch (_) {}
}));
liftEl.addEventListener('pointerleave', () => { if (!G && mode === 'picked') L.tilt = { x: 0, y: 0 }; });

// 真模型的口子：有 model 字段才按需从 CDN 加载 <model-viewer>，失败就留着图
let mvP = null;
function loadMV() {
  if (!mvP) mvP = new Promise((res, rej) => {
    const s = document.createElement('script'); s.type = 'module';
    s.src = 'vendor/model-viewer.min.js';
    s.onerror = () => rej(new Error('cdn')); document.head.append(s);
    customElements.whenDefined('model-viewer').then(res);
    setTimeout(() => rej(new Error('timeout')), 12000);
  });
  return mvP;
}
function maybeModel(rec) {
  const m = rec.it.model; if (!m) return;
  const token = L.token = {}; window.__mv = 'loading';
  loadMV().then(() => {
    if (L.token !== token) return;
    const mv = document.createElement('model-viewer');
    const attrs = { src: m, 'camera-controls': '', 'disable-zoom': '', 'disable-pan': '', 'interaction-prompt': 'none', 'shadow-intensity': '0.9', 'shadow-softness': '1', exposure: '1.05', 'camera-orbit': '30deg 72deg auto', 'environment-image': 'neutral' };
    // 默认皮肤：不用库自带的转动，手势自己接（横着拖转、往下拖走），见 spinGesture
    if (A) { delete attrs['camera-controls']; SPIN.th = 30; SPIN.ph = 72; SPIN.w = 0; SPIN.held = false; }
    for (const k in attrs) mv.setAttribute(k, attrs[k]);
    // 出来时自己转一圈停在斜前方，手一碰就交给手指。
    // 不用 model-viewer 自带的 auto-rotate：按下的同时去掉那个属性，这一下拖动就不转了（2026-11-19 试出来的）
    let held = false; mv.addEventListener('pointerdown', () => { held = true; });
    mv.addEventListener('load', () => {
      if (RM || L.token !== token) return;
      if (A) {
        // 入场那一圈和手指用同一个角度：没碰时跟着这一圈走；手一碰，剩下的交给手指和惯性
        tween(1300, e => { if (SPIN.held || L.mv !== mv) return; SPIN.th = 30 - 360 * (1 - easeOut(e / 1300)); setOrbit(mv); }, { start: clock(), tag: 'lift' });
        return;
      }
      tween(1300, e => { if (held || L.mv !== mv) return; mv.cameraOrbit = `${(30 - 360 * (1 - easeOut(e / 1300))).toFixed(1)}deg 72deg auto`; if (mv.jumpCameraToGoal) mv.jumpCameraToGoal(); }, { start: clock(), tag: 'lift' });
    });
    // 大小由样式表定死（230 像素）。原来按当时的缩放去除，库已经加载好时会在东西还很小的那一刻算，结果模型大出三倍
    mv.addEventListener('load', () => { if (L.token !== token) return; mv.style.opacity = 1; tiltEl.style.opacity = 0; window.__mv = A ? mv : 'loaded'; });
    mv.addEventListener('error', () => { mv.remove(); tiltEl.style.opacity = ''; window.__mv = 'error'; });
    liftEl.append(mv); L.mv = mv;
  }).catch(err => { window.__mv = 'fail:' + err.message; });
}
function removeModel() { L.token = null; if (L.mv) { L.mv.remove(); L.mv = null; } tiltEl.style.opacity = ''; if (A) { SPIN.w = 0; SPIN.held = false; } }

// 默认皮肤的模型转动：自己接手势。横着拖为主就转（约 0.9 度/像素，松手带惯性，上下只给一点点俯仰）；
// 往下拖为主，或者转着转着往下走了 88 像素，就变成原来的“拖走”（喂企鹅、放冷冻）
const SPIN = { th: 30, ph: 72, w: 0, held: false };
function setOrbit(mv) {
  if (!mv) return;
  mv.cameraOrbit = `${SPIN.th.toFixed(2)}deg ${SPIN.ph.toFixed(2)}deg auto`;
  if (mv.jumpCameraToGoal) mv.jumpCameraToGoal();
}
function spinGesture(e) {
  e.preventDefault();
  const p = loc(e), mv = L.mv, can = movable(L.rec.it);
  let how = null, last = p, ymin = p.y, th0 = SPIN.th;
  const hist = [{ t: performance.now(), th: SPIN.th }];
  SPIN.held = true; SPIN.w = 0; cancel('lift');
  G = {
    id: e.pointerId,
    move(q) {
      const dx = q.x - p.x, dy = q.y - p.y;
      if (!how) {
        if (Math.hypot(dx, dy) < 7) return;
        if (can && dy > Math.abs(dx) * 1.1) { beginDrag(L.rec, 'lift', q); return; }
        how = 'spin'; th0 = SPIN.th + dx * 0.9; // 从判定这一刻接上，不跳
      }
      SPIN.th = th0 - dx * 0.9;
      SPIN.ph = clamp(72 - dy * 0.12, 64, 80);
      setOrbit(mv);
      const now = performance.now(); hist.push({ t: now, th: SPIN.th });
      while (hist.length > 2 && now - hist[0].t > 90) hist.shift();
      ymin = Math.min(ymin, q.y); last = q;
      if (can && q.y - ymin > 88) { SPIN.w = 0; beginDrag(L.rec, 'lift', q); }
    },
    up() {
      const h0 = hist[0], h1 = hist[hist.length - 1], dt = h1.t - h0.t;
      SPIN.w = how && dt > 8 && performance.now() - h1.t < 80 ? clamp((h1.th - h0.th) / dt * 1000, -600, 600) : 0;
    }
  };
  try { liftEl.setPointerCapture(e.pointerId); } catch (_) {}
}
// 惯性和俯仰回正：每帧推一次（手指按着时不推）
function spinUpdate(dt) {
  if (!A || !L.mv || mode !== 'picked' || G) return;
  if (Math.abs(SPIN.w) > 2 || Math.abs(SPIN.ph - 72) > .05) {
    SPIN.th += SPIN.w * dt / 1000; SPIN.w *= Math.exp(-dt / 450);
    SPIN.ph += (72 - SPIN.ph) * (1 - Math.exp(-dt / 180));
    if (Math.abs(SPIN.w) <= 2) SPIN.w = 0;
    setOrbit(L.mv);
  }
}

// ---------- 3 拖给企鹅 ----------
const penEl = $('#penguin'), leanEl = $('#penguin .lean'), ringEl = $('#penguin .ring');
const PC = { x: 296 + 39.5, y: 660 + 55 };
const P = { lean: 0, vl: 0, leanT: 0, sc: 1, vs: 0, scT: 1, ring: 0, ringT: 0, eat: false, hop: 0, sq: 0, hl: 0,   // hop/sq/hl：换冰箱时的小跳、压扁、歪向
  st: 0, vst: 0, stT: 0, look: null };   // st：看高处时身子往上拔一点（默认界面）；look：按着的那样东西在哪（手机坐标）
function setEat(on) {
  if (P.eat === on) return; P.eat = on;
  $('#penguin .stand').style.opacity = on ? 0 : 1; $('#penguin .eat').style.opacity = on ? 1 : 0;
  P.vs += on ? 2.2 : -1;   // 换姿势时弹一下
}
function penguinTrack(x, y, allowEat) {
  const dx = x - PC.x, dy = y - PC.y, d = Math.hypot(dx, dy);
  P.leanT = clamp(dx / 150, -1, 1) * 12 * (d < 360 ? 1 : 0.5);
  const near = allowEat && d < 120;
  P.scT = near ? 1.16 : 1; P.ringT = near ? 1 : 0; setEat(near);
  if (A) { if (!near) lookAt(x, y); else P.stT = 0; }   // 默认界面：没凑到嘴边时按方向探身（左上和近处歪得不一样）
  return near;
}
function penguinRest() { P.leanT = 0; P.scT = 1; P.ringT = 0; P.stT = 0; setEat(false); }
// 企鹅看向一点：从头的位置看过去，偏左就往左探、偏右往右（右边地方小，探得少）；目标越高身子越往上拔
function lookAt(x, y) {
  const dx = x - PC.x, dy = y - 672, ang = Math.atan2(dx, -dy);
  P.leanT = clamp(14 * Math.sin(ang), -14, 8);
  P.stT = 0.075 * smooth(60, 460, -dy) - 0.02 * smooth(0, 100, dy);
}
function renderPenguin(t) {
  // 没在跳的时候字符串和以前一模一样（基线截图逐像素比对）
  leanEl.style.transform = (P.hop ? `translateY(${(-P.hop).toFixed(2)}px) ` : '') + `rotate(${(P.lean + P.hl).toFixed(2)}deg) scale(${P.sc.toFixed(3)})` + (P.sq ? ` scale(${(1 + P.sq).toFixed(4)}, ${(1 - P.sq).toFixed(4)})` : '')
    + (Math.abs(P.st) > 2e-4 ? ` scale(${(1 - P.st * 0.35).toFixed(4)}, ${(1 + P.st).toFixed(4)})` : '');
  ringEl.style.opacity = (P.ring * 0.95).toFixed(3);
  ringEl.style.transform = `scale(${(0.6 + 0.4 * P.ring + 0.05 * P.ring * Math.sin(t / 170)).toFixed(3)})`;
}
const DR = { on: false, fx: 0, fy: 0, ox: 0, oy: 0, vx: 0, vy: 0, s: 1, nx: 0, ny: 0, sy: 0 };   // s 拖着时的大小（没算到桶上缩的那点）；nx/ny 到了桶上往桶口偏的量；sy 开始拖那一刻手指的高度（shelfAt 看手指走了多远）
function beginDrag(rec, from, p) {
  trace('drag ' + from); P.look = null;
  if (from === 'shelf') { prepLift(rec); L.shOp = 0.3; }
  else { cancel('lift'); closeSheet(); dimTo(false); removeModel(); }
  mode = 'drag'; L.tiltOn = false; L.bobA = 0; L.gap = 30;
  DR.on = true; DR.fx = p.x; DR.fy = DR.sy = p.y; DR.vx = DR.vy = 0;
  const ox0 = L.cx - p.x, oy0 = L.cy - p.y, s0 = L.s, sD = 92 / 170, sh0 = L.shOp, up0 = L.up;
  DR.ox = ox0; DR.oy = oy0; DR.s = s0; DR.nx = DR.ny = 0;
  if (binOn() && draggable(rec.it)) BIN.up();   // 垃圾桶改版：拖起东西时桶从左下角弹上来（冷冻托盘开着时不出来）；别人的、没人认的只能挪，桶不出来
  tween(springMs(14, .55), e => { L.s = DR.s = spring(e, s0, sD, 0, 14, .55).x; }, { tag: 'dscale' });
  tween(240, e => { const q = easeOut(e / 240); DR.ox = lerp(ox0, 0, q); DR.oy = lerp(oy0, -38, q); L.shOp = lerp(sh0, 0.45, q); L.up = lerp(up0, 1, q); }, { tag: 'doff' });
  G = { id: G ? G.id : -1, move(q) { DR.fx = q.x; DR.fy = q.y; }, up() { endDrag(); } };
}
function endDrag() {
  DR.on = false;
  const d = Math.hypot(L.cx - PC.x, L.cy - PC.y), inBin = binOn() && BIN.hovering;
  if (binOn() && (d < 120 || !inBin)) BIN.down();   // 没扔进桶：桶沉回底边下面
  // 冷冻托盘开着时抽屉一直开着（不关）；从冷冻托盘上拖出来的东西本来就冻着，在抽屉上松手不算“放进冷冻”，飞回托盘
  // 在企鹅身上松手：什么都吃（不换鱼的吃掉了没有鱼，见 feed / ateNoFish）；在垃圾桶上松手扔进去（先于冷冻抽屉判断）
  // 默认界面：在冰箱里别的一层上松手 = 挪到那层（shelfAt / moveToShelf）
  const mv = A ? shelfAt() : -1; if (A) shelfMark(-1);
  // 别人的、没人认的（只能挪）：在企鹅身上松手不喂，照常飞回去（shelfAt 在企鹅嘴边也是 -1）
  if (d < 120 && draggable(L.rec.it)) { if (A && !TR.frz) dwSet(0); feed(); }
  else if (inBin) { if (A && !TR.frz) dwSet(0); binDrop(); }
  else if (A && DW.tg === 1 && !DW.busy && L.rec.frz == null) dropFreeze();   // 在开着的冷冻抽屉上松手：掉进去
  else if (mv >= 0) { if (!TR.frz) dwSet(0); moveToShelf(mv); }
  else { if (A && !TR.frz) dwSet(0); mode = 'busy'; penguinRest(); flyBack(() => { mode = 'open'; }); }
}
const MOUTH = () => ({ x: PC.x, y: 770 - 110 * P.sc + 110 * P.sc * 0.36 });
// 在企鹅身上松手：东西缩进嘴里
function feed() {
  mode = 'busy'; cancel('dscale'); cancel('doff');
  const f = { cx: L.cx, cy: L.cy, s: L.s, rz: L.rz, sh: L.shOp }, m = MOUTH(), due = isDue(L.rec);   // 旧界面、方向 B：isDue 总是 true
  tween(300, e => {
    const q = easeIn(e / 300);
    L.cx = lerp(f.cx, m.x, q); L.cy = lerp(f.cy, m.y, q); L.s = lerp(f.s, 0.04, q); L.rz = f.rz + 40 * q; L.rx = L.ry = 0; L.shOp = f.sh * (1 - q);
  }, { tag: 'lift', done: () => { const rec = L.rec; hideLift(); P.vs -= 2.5; at(90, () => (due ? celebrate(rec) : ateNoFish(rec))); } });
}
// 默认界面：还没到“过了大半”的东西拖给企鹅：不弹庆祝，企鹅原地开心地蹦两下。
// 方向 A“吃掉就有鱼”：放坏前吃掉也给一条鱼（标没标、“说不准”的都算），一条鱼划进严肃那只的嘴里（flyFish）；
// 这次打开页面才放入的、这台冰箱今天已经给过 3 条的：照常蹦，没有鱼，也不多出字（freshFish）
function ateNoFish(rec) {
  const fish = freshFish(rec);
  if (window.MARKS) MARKS.handled(rec);   // 和扔进垃圾桶一样：没人认的、有人挂起的原位留回执
  removeItem(rec); penguinRest(); yumHop();
  if (fish) { D.fish += 1; flyFish(); }
  toast(fish ? '企鹅吃掉了，得到一条鱼' : '企鹅吃掉了'); mode = 'open';
}
// 防钻空子（打算 · 四 A）：NEWI 这次打开页面“放入”的东西（putNew 记的；数据里原有的都当放了好几天）；
// FF 每台冰箱这次打开页面里“新鲜吃掉”给过几条（小样里一次打开就当一天；过了大半走庆祝的不占这 3 条）
const NEWI = new Set(), FF = new Map(), FF_CAP = 3;
function freshFish(rec) {
  if (!A || NEWI.has(rec.it.id)) return false;
  const k = (rec.F || cur).i, n = FF.get(k) || 0;
  if (n >= FF_CAP) return false;
  FF.set(k, n + 1); return true;
}
// 鱼从企鹅左上方冒出来，划个弧落进嘴里，落进去企鹅咕一下。用的是庆祝里那张 fish.webp，插在 #penguin 后面（同一层，盖在企鹅上）
let yFish = null;
function flyFish() {
  if (!yFish) {
    yFish = new Image(); yFish.src = D.img + 'fish.webp'; yFish.alt = ''; yFish.draggable = false; yFish.className = 'yfish';
    Object.assign(yFish.style, { position: 'absolute', left: '0', top: '0', width: '40px', pointerEvents: 'none', opacity: '0', zIndex: getComputedStyle(penEl).zIndex });
    penEl.after(yFish);
  }
  cancel('yfish');
  const S0 = { x: PC.x - 56, y: 618 }, dur = 780;
  tween(dur, e => {
    const q = e / dur, m = { x: PC.x, y: MOUTH().y + 9 }, u = smooth(0.32, 1, q), k = u * u * (3 - 2 * u);
    const pop = spring(Math.min(e, 0.32 * dur), 0, 1, 0, 20, .5).x;
    const x = lerp(S0.x, m.x, k), y = lerp(S0.y, m.y, k) - 46 * Math.sin(Math.PI * k);
    const sc = pop * (1 - 0.62 * k), ang = -18 + 72 * k;
    yFish.style.transform = `translate(${(x - 20).toFixed(1)}px, ${(y - 15).toFixed(1)}px) rotate(${ang.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
    yFish.style.opacity = q >= 1 ? 0 : (1 - smooth(0.9, 1, q)).toFixed(3);
  }, { delay: 200, tag: 'yfish', done: () => { yFish.style.opacity = 0; P.vs -= 1.8; } });
}
function yumHop() {
  cancel('hop'); cancel('nod');
  const D_ = 620, H = [11, 6];
  tween(D_, e => {
    const q = e / D_, k = clamp(q / 0.75, 0, 1) * 2, n = Math.min(1, Math.floor(k)), f = k - n;
    P.hop = q < 0.75 ? H[n] * Math.sin(Math.PI * f) : 0;
    P.sq = q < 0.75 ? Math.max(0, 1 - Math.min(f, 1 - f) / 0.12) * 0.08 : spring(e - 0.75 * D_, 0.08, 0, 0, 26, .4).x;   // 起落压一下
  }, { tag: 'hop', done: () => { P.hop = 0; P.sq = 0; } });
}

// ---------- 3a 拖到别的一层（只有默认界面） ----------
// 拖着层板上的东西（或从白卡上拖走的）到这台冰箱别的一层上松手：挪到那层，和“更新”里换区域一样（detach + placeOnShelf），
// 那层满了就进“+N”。看的是手指（不看浮在手指上面 38 像素、还慢半拍的东西：原地小拖会算成上一层，快甩会落在半路），按每层的竖条判断：
// 一层 = 上一层胶带下沿到这一层胶带下沿（第一层往上留 110；最底层一直到冷冻抽屉开的那条线 dwEdge，和抽屉用同一条线，不留缝也不重叠）；
// 横向只算冰箱里面。手指上下离开始拖的地方不到 36 像素不算（原地拖一下、从白卡上往下拖一点都照常飞回去）。
// 能去的层和“更新”里“区域”能选的一样（zonesFor：这台冰箱的每一层，别人的层也能去；满了也能去，多出来的进“+N”），自己那层不算。
// 托盘开着、冻着的、镜头没停稳、冷冻抽屉开着、在垃圾桶上、在企鹅嘴边（和松手喂企鹅同一个判断）都不算。拖着的时候那层的胶带变色放大、整格淡淡铺一层底
const DROP_MIN = 36;
function shelfAt() {
  const rec = L.rec;
  if (!A || !rec || TR.on || rec.frz != null || rec.hidden || rec.tv || rec.F !== cur || !camSettled()) return -1;
  if (DW.tg === 1 || (binOn() && BIN.hovering)) return -1;
  if (Math.hypot(L.cx - PC.x, L.cy - PC.y) < 120) return -1;
  const x = DR.fx, y = DR.fy;
  if (x < 24 || x > 366 || Math.abs(y - DR.sy) < DROP_MIN) return -1;
  const n = Math.min(S.length, cur.data.shelves.length), cz = curZone(rec);
  for (let t = 0; t < n; t++) {
    const y0 = t ? S[t - 1] + 24 : S[0] - 110, y1 = t === S.length - 1 ? dwEdge() : S[t] + 24;
    if (y >= y0 && y < y1) return 's' + t !== cz && zonesFor(rec).some(z => z.v === 's' + t) ? t : -1;
  }
  return -1;
}
const SZ = { F: null, t: -1 };   // 正亮着的那层
function shelfMark(t) {
  const F = t >= 0 ? cur : null;
  if (SZ.F === F && SZ.t === t) return;
  if (SZ.F) { const n = SZ.F.shelf.querySelectorAll('.name')[SZ.t]; if (n) n.classList.remove('drop'); if (SZ.F.dc) SZ.F.dc.classList.remove('on'); }
  SZ.F = F; SZ.t = t;
  if (!F) return;
  const n = F.shelf.querySelectorAll('.name')[t]; if (n) n.classList.add('drop');
  if (!F.dc) { F.dc = div('dropcell'); F.shelf.insertBefore(F.dc, F.mc ? F.mc.el.nextSibling : F.shelf.firstChild); }   // 压在东西、名牌下面
  const top = t ? S[t - 1] + 26 : S[0] - 70, bot = S[t] + 17;
  Object.assign(F.dc.style, { top: top + 'px', height: (bot - top) + 'px' });
  F.dc.classList.add('on');
}
function moveToShelf(t) {
  const rec = L.rec, F = rec.F || cur, label = F.data.shelves[t].label.split(' · ')[0];
  trace('move ' + rec.it.id + ' ' + rec.it.t + '>' + t);
  mode = 'busy'; penguinRest();
  detach(rec); placeOnShelf(F, rec, t);   // 原来那层回到 open 后补位（flushN）
  const m = rec.hidden && F.moreEls[t];   // 那层满了：飞进“+N”格，格子弹一下
  flyBack(() => { mode = 'open'; if (m && m.animate && !RM) m.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.3,1.6,.5,1)' }); });
  // 挪的是别人的东西：提示里带上是谁的什么（归属、计划、开没开都不变，只换层；不弹确认）
  const it = rec.it, whose = it.kind === 'other' && D.ownerNames[it.owner];
  toast('已放到' + label + (whose ? ' · ' + whose + '的' + (it.name || D.names[it.img]) : ''));
}
// 白卡上的“处理掉它”：东西从半空划过去喂给企鹅
function feedFromPick() {
  if (!isDue(L.rec) && binOn()) { binFromPick(); return; }   // 第四步：不换鱼的东西扔进垃圾桶
  mode = 'busy'; closeSheet(); dimTo(false); removeModel(); cancel('lift');
  L.tiltOn = false; L.bobA = 0;
  const f = { cx: L.cx, cy: L.cy, s: L.s, rx: L.rx, ry: L.ry }, dur = 620;
  tween(dur, e => {
    const q = e / dur, k = q * q * (3 - 2 * q), m = MOUTH();
    L.cx = lerp(f.cx, m.x, k); L.cy = lerp(f.cy, m.y, k) - 90 * Math.sin(Math.PI * k);
    L.s = lerp(f.s, 92 / 170, smooth(0, .6, q)) * (1 - smooth(.72, 1, q) * 0.96);
    L.rx = f.rx * (1 - q); L.ry = f.ry * (1 - q); L.rz = 30 * smooth(.5, 1, q); L.shOp = 0.6 * (1 - q);
    penguinTrack(L.cx, L.cy, true);
  }, { tag: 'lift', done: () => { const rec = L.rec; hideLift(); P.vs -= 2.5; at(90, () => celebrate(rec)); } });
}

// ---------- 3b 垃圾桶（第四步，只有默认界面；桶和桶盖由 bin.js 画） ----------
// 换不换鱼由 marks.js 判断（计划过了大半、过了的才换）：换鱼的拖到企鹅身上照样喂、扔进垃圾桶也照样庆祝；
// 不换鱼的（还新鲜的、没计划的、没人认的、冻着的）扔进垃圾桶：提示“已处理”，角落企鹅慢慢点一下头，没有鱼
const binOn = () => A && !!window.BIN;
const isDue = rec => !A || !window.MARKS || MARKS.due(rec);
function nodPenguin() {
  cancel('nod');
  tween(900, e => { P.sq = 0.035 * Math.sin(Math.PI * smooth(0, 900, e)); }, { tag: 'nod', done: () => { P.sq = 0; } });
}
// 东西缩进桶里以后：换鱼的走庆祝（celebrate 里留回执、拿掉东西）；不换鱼的在这里拿掉
function binDone(rec) {
  if (isDue(rec)) { P.vs -= 1; at(160, () => celebrate(rec)); return; }
  if (window.MARKS) MARKS.handled(rec);   // 回执只留给没人认的、有人挂起的（marks.js 里判断）
  removeItem(rec); penguinRest(); nodPenguin();
  toast('已处理'); mode = 'open';
}
// 拖到垃圾桶上松手：桶盖掀开，东西缩进桶口，盖子落下弹一下
function binDrop() {
  const rec = L.rec, f = { cx: L.cx, cy: L.cy, s: L.s, rz: L.rz, sh: L.shOp };
  mode = 'busy'; cancel('dscale'); cancel('doff'); cancel('lift');
  BIN.open(); lookAt(BIN.mouth().x, BIN.mouth().y);
  tween(320, e => {
    const q = easeIn(e / 320), m = BIN.mouth();
    L.cx = lerp(f.cx, m.x, q); L.cy = lerp(f.cy, m.y, q) - 14 * Math.sin(Math.PI * q); L.s = lerp(f.s, 0.04, q);
    L.rz = f.rz - 30 * q; L.rx = L.ry = 0; L.shOp = f.sh * (1 - q);
  }, { tag: 'lift', done: () => { hideLift(); BIN.shut(); binDone(rec); } });
}
// 白卡上的“处理掉它”（不换鱼的）：东西从半空划一道弧扔进垃圾桶，快到时桶盖掀开
function binFromPick() {
  mode = 'busy'; closeSheet(); dimTo(false); removeModel(); cancel('lift');
  L.tiltOn = false; L.bobA = 0;
  // 垃圾桶改版：桶先从左下角弹上来（企鹅转头看一眼），等 240 毫秒东西再划过去。冷冻托盘开着时也出来（点了按钮，东西总得有地方去）
  BIN.up(true); { const m = BIN.mouth(); lookAt(m.x, m.y); }
  const f = { cx: L.cx, cy: L.cy, s: L.s, rx: L.rx, ry: L.ry }, dur = 620, wait = 240;
  at(wait + dur * 0.45, () => BIN.open(), 'binop');
  tween(dur, e => {
    const q = e / dur, k = q * q * (3 - 2 * q), m = BIN.mouth();
    L.cx = lerp(f.cx, m.x, k); L.cy = lerp(f.cy, m.y, k) - 90 * Math.sin(Math.PI * k);
    L.s = lerp(f.s, 92 / 170, smooth(0, .6, q)) * (1 - smooth(.72, 1, q) * 0.96);
    L.rx = f.rx * (1 - q); L.ry = f.ry * (1 - q); L.rz = -30 * smooth(.5, 1, q); L.shOp = 0.6 * (1 - q);
    lookAt(L.cx, L.cy);
  }, { delay: wait, tag: 'lift', done: () => { const rec = L.rec; hideLift(); BIN.shut(); binDone(rec); } });
}

// ---------- 庆祝 ----------
const C = { el: $('#celebrate'), dim: $('#celebrate .cdim'), rays: $('#celebrate .rays'), burst: $('#celebrate .burst'), fish: $('#celebrate .cfish'),
  pen: $('#celebrate .cpenguin'), card: $('#celebrate .ccard'), row: $('#celebrate .fishrow'), conf: $('#celebrate .confetti'), t0: 0, leaving: false };
// 企鹅身后的三层圆盘（新界面用，旧界面里是藏着的）：下标 0 最小、最先弹出来；大的垫在下面
C.rings = [1, 2, 3].map(n => { const r = document.createElement('i'); r.className = 'ring r' + n; C.rays.prepend(r); return r; });
const CP = { cx: 0, cy: 0, s: 1, sx: 1, sy: 1, rot: 0 };
// 018 卡：庆祝改成两只企鹅各演各的。严肃那只（一直在角落的）吃到鱼只点一下头，不笑不举手；
// 开心那只从右下角蹦进来举手欢呼，收起时再蹦出去。?cel=old 看改之前的样子（严肃那只自己欢呼，换成 3D 模型转一圈）。
// 019 卡本人的备注：“改前更好，不需要两只，另外一只可以在其他页面出现”。所以默认还是改之前的庆祝（严肃那只自己欢呼）；
// 两只的版本留着没删，网址带 ?cel=duo 才出来，而且只在新界面里（旧界面 ?skin=0 留着做新旧对比，一直是原样）。
const DUO = !!window.SKIN && qs.get('cel') === 'duo';
const HP = { el: $('#celebrate .cpenguin2'), on: false, pose: '', x: 0, y: 0, s: 165 / 110, sx: 1, sy: 1, rot: 0, at: { x: 316, y: 418 }, out: { x: 474, y: 524 } };
window.__duo = HP;
function renderHP() {
  HP.el.style.transform = `translate(${HP.x - 39.5}px, ${HP.y - 55}px) scale(${HP.s}) rotate(${HP.rot}deg) translateY(55px) scale(${HP.sx}, ${HP.sy}) translateY(-55px)`;
}
function hpose(name) { if (HP.pose === name) return; HP.pose = name; HP.el.querySelectorAll('.pose').forEach(p => { p.style.opacity = p.classList.contains(name) ? 1 : 0; }); }
// e = 从“欢呼”那一下算起的毫秒数：蹦进来（460 毫秒）→ 落地压一下，换成举手 → 跳两下 → 原地小幅一颠一颠
function happyIn(e) {
  if (e < 0 || mode !== 'celebrate' || C.leaving) return;
  if (!HP.on) { HP.on = true; HP.el.style.opacity = 1; }
  const A = HP.at, O = HP.out, hop = 460;
  if (e < hop) {
    const q = e / hop, p = easeOut(q);
    HP.x = lerp(O.x, A.x, p); HP.y = lerp(O.y, A.y, p) - 96 * Math.sin(Math.PI * q);
    HP.rot = -14 * (1 - p); HP.sx = HP.sy = 1; hpose('stand');
  } else {
    const a = e - hop, land = spring(a, 0.16, 0, 0, 22, .4).x, j = a - 140;
    let up = 0;
    if (!RM && j > 0) up = j < 760 ? 44 * Math.abs(Math.sin(Math.PI * j / 380)) : 7 * Math.abs(Math.sin(Math.PI * (j - 760) / 520));
    HP.x = A.x; HP.y = A.y - up; HP.rot = 0;
    HP.sx = 1 + land - 0.035 * up / 44; HP.sy = 1 - land + 0.05 * up / 44; hpose('cheer');
  }
  renderHP();
}
// 庆祝时的企鹅真模型：一开机就在后台加载；到“欢呼”那一下换上去，先自己转一圈，之后手指能拨着转。
// 没加载到就一直用图，不影响别的。
const CM = { mv: null, ready: false, on: false, held: false, tc: 0, spin: 1100 };
function prepCelModel() {
  if (DUO) { window.__cmv = 'off'; return; }   // 那个欢呼的模型是严肃那只在笑，两只各演各的时候不加载（文件没删）
  if (!D.models || !D.models.penguin) return;
  window.__cmv = 'loading';
  loadMV().then(() => {
    const mv = document.createElement('model-viewer'); mv.className = 'cmodel';
    const attrs = { src: D.models.penguin, loading: 'eager', 'camera-controls': '', 'disable-zoom': '', 'disable-pan': '', 'interaction-prompt': 'none', 'shadow-intensity': '0', exposure: '1.05', 'camera-orbit': '0deg 82deg auto', 'field-of-view': '24deg', 'environment-image': 'neutral' };
    if (D.penguinLit) Object.assign(attrs, { 'environment-image': 'env-warm.jpg', exposure: '1.25', 'shadow-intensity': '0.9', 'shadow-softness': '0.85' }); // 暖光加脚下的影子
    for (const k in attrs) mv.setAttribute(k, attrs[k]);
    if (D.penguinLit) Object.assign(mv.style, { width: '268px', height: '268px', margin: '-134px 0 0 -134px' }); // 和欢呼图一样大，从图换成模型时不跳
    mv.addEventListener('load', () => { CM.ready = true; window.__cmv = 'loaded'; if (mode === 'celebrate' && !C.leaving) celModel(clock() - C.t0 - CM.tc); });
    mv.addEventListener('error', () => { window.__cmv = 'error'; });
    // 手指按在企鹅上：不收起庆祝，停掉自动收起；松手后再等一会儿才收
    mv.addEventListener('pointerdown', e => { e.stopPropagation(); CM.held = true; cancel('celAuto'); });
    const rearm = () => { if (mode === 'celebrate' && !C.leaving) { cancel('celAuto'); tween(0, () => {}, { start: clock(), delay: 2600, done: () => dismissCel(), tag: 'celAuto' }); } };
    mv.addEventListener('pointerup', rearm); mv.addEventListener('pointercancel', rearm);
    C.el.insertBefore(mv, C.card); CM.mv = mv;
  }).catch(err => { window.__cmv = 'fail:' + err.message; });
}
// e = 从“欢呼”那一下算起的毫秒数
function celModel(e) {
  if (!CM.ready || e < 0 || mode !== 'celebrate' || C.leaving) return;
  if (!CM.on) { CM.on = true; CM.mv.style.opacity = 1; CM.mv.style.pointerEvents = 'auto'; C.pen.style.opacity = 0; }
  CM.mv.style.transform = `translateY(${(CP.cy - CENTER.y).toFixed(1)}px)`;
  if (!CM.held) {
    const th = -360 * (1 - easeOut(e / CM.spin));
    CM.mv.cameraOrbit = `${th.toFixed(1)}deg 82deg auto`;
    if (CM.mv.jumpCameraToGoal) CM.mv.jumpCameraToGoal();
  }
}
const CENTER = { x: 195, y: 372 }, BIG = 240 / 110;
function renderCP() {
  C.pen.style.transform = `translate(${CP.cx - 39.5}px, ${CP.cy - 55}px) scale(${CP.s}) rotate(${CP.rot}deg) translateY(55px) scale(${CP.sx}, ${CP.sy}) translateY(-55px)`;
}
function cpose(name) { C.pen.querySelectorAll('.pose').forEach(p => { p.style.opacity = p.classList.contains(name) ? 1 : 0; }); }
// 庆祝时撒的东西（固定随机种子，截图可复现）。旧界面（?skin=0）还是原来的黏土小粒。
// 新界面是星星：012 卡本人说黏土小粒“黑不拉几的”，014 卡在亮色纸片、星星、爱心里选了星星
const STARS = document.documentElement.classList.contains('skin');
const CONF_MS = STARS ? 9000 : 1700;
const confetti = [];
(function makeConfetti() {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const add = (c, w, h) => { c.el = document.createElement('i'); c.el.style.width = w + 'px'; c.el.style.height = h + 'px'; c.w = w; c.h = h; confetti.push(c); C.conf.append(c.el); return c.el; };
  if (!STARS) {
    const cols = [['#6f8c7a', '#506b5b', '#3b5245'], ['#ebb06d', '#d89245', '#b87430'], ['#fff6e2', '#f3e6c8', '#d9c7a1'], ['#b2c2cc', '#8fa3b0', '#6e8391']];
    for (let i = 0; i < 64; i++) {
      const c = cols[i % 4], round = rnd() < 0.5, sz = 8 + rnd() * 7, h = round ? sz : sz * (0.7 + rnd() * 0.5);
      const ang = -Math.PI / 2 + (rnd() - 0.5) * Math.PI * 1.9, sp = 260 + rnd() * 380;
      const el = add({ vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 160, r0: rnd() * 360, vr: (rnd() - 0.5) * 720 }, sz, h);
      el.style.borderRadius = round ? '50%' : '2.5px';
      el.style.background = `radial-gradient(circle at 32% 28%, ${c[0]}, ${c[1]} 55%, ${c[2]})`;
    }
    return;
  }
  // 四角的闪光星：从企鹅身后弹到固定的位置，留在那儿一闪一闪，收起时一起淡掉。位置是手摆的，避开企鹅和下面的卡片。
  // 三颗里一颗是金色的：中间发白、边上是金黄，在橙色的底上靠这圈金边站得住（纯浅黄会糊进底色里）
  const d = 'M20 3C23 12.5 27.5 17 37 20C27.5 23 23 27.5 20 37C17 27.5 12.5 23 3 20C12.5 17 17 12.5 20 3Z';
  const spots = [[62, 246, 36], [330, 228, 42], [110, 164, 22], [270, 146, 28], [188, 112, 17], [34, 368, 24], [354, 344, 20], [66, 474, 28],
    [322, 466, 32], [148, 62, 24], [300, 78, 13], [20, 180, 15], [368, 146, 17], [232, 60, 13], [44, 96, 13], [362, 500, 14]];
  spots.forEach(([x, y, sz], i) => {
    const gold = i % 3 === 1, fill = gold ? `url(#sg${i})` : '#fffdf4', edge = gold ? '#ffc93c' : '#fffdf4';
    add({ x, y, dl: i * 42, ph: rnd() * 6.28 }, sz, sz).innerHTML = `<svg viewBox="0 0 40 40">`
      + (gold ? `<defs><radialGradient id="sg${i}" cx="46%" cy="44%" r="52%"><stop offset="0" stop-color="#fffbe6"/><stop offset=".45" stop-color="#ffe680"/><stop offset="1" stop-color="#ffc93c"/></radialGradient></defs>` : '')
      + `<path d="${d}" fill="${fill}" stroke="${edge}" stroke-width="3" stroke-linejoin="round"/></svg>`;
  });
})();
function renderConfetti(ms) {
  const t = ms / 1000;
  if (STARS) return confetti.forEach(c => {
    const e = ms - c.dl; if (e <= 0) { c.el.style.opacity = 0; return; }
    const p = spring(e, 0, 1, 0, 11, .5).x, tw = smooth(500, 1100, e), m = 0.3 + 0.7 * p;
    const s = Math.max(0, p) * (1 + 0.15 * tw * Math.sin(e / 260 + c.ph));
    const x = CENTER.x + (c.x - CENTER.x) * m, y = CENTER.y + (c.y - CENTER.y) * m;
    c.el.style.transform = `translate(${(x - c.w / 2).toFixed(1)}px, ${(y - c.h / 2).toFixed(1)}px) rotate(${(-80 * (1 - Math.min(1, p)) + 9 * tw * Math.sin(e / 520 + c.ph)).toFixed(1)}deg) scale(${s.toFixed(3)})`;
    c.el.style.opacity = smooth(0, 120, e);
  });
  const k = 1.7, g = 980, ek = 1 - Math.exp(-k * t);
  confetti.forEach(c => { // 旧界面的黏土小粒，和改之前逐像素一样
    const x = CENTER.x + c.vx * ek / k, y = CENTER.y - 10 + g * t / k + (c.vy - g / k) * ek / k;
    c.el.style.transform = `translate(${x - c.w / 2}px, ${y - c.w / 2}px) rotate(${c.r0 + c.vr * t}deg)`;
    c.el.style.opacity = t <= 0 ? 0 : 1 - smooth(1.1, 1.6, t);
  });
}
function fishIcon() {
  const f = div('f'), im = new Image(); im.src = D.img + 'fish.webp'; im.alt = ''; im.draggable = false;
  im.onerror = () => { im.remove(); f.classList.add('ph'); };
  f.append(im); return f;
}
function removeItem(rec) {
  // 默认界面：从层板 / “+N”/ 冷冻里拿掉，层板上空出来的位子回到 open 后补上（见“9 层板补位”）
  if (A) { const F = rec.F || cur; detach(rec); delete F.recs[rec.it.id]; if (F.i === 0) D.items = F.data.items; return; }
  rec.el.remove(); if (rec.st) rec.st.remove();
  const F = rec.F || cur;   // 从它所在的那台冰箱里拿掉；第一台的数据和顶层 D.items 保持同一份
  if (rec.tv) trayDrop(rec);  // 在托盘上：托盘上那一份也拿掉，庆祝收起后剩下的重新排
  if (rec.hidden) { F.data.more.items = F.data.more.items.filter(i => i !== rec.it); updateMore(F); }   // “+N”里收着的
  else F.data.items = F.data.items.filter(i => i !== rec.it);
  delete F.recs[rec.it.id];
  if (F.i === 0) D.items = F.data.items;
}
function celebrate(rec) {
  if (rec && A && window.MARKS) MARKS.handled(rec);   // 原位留一张“已处理”小纸条（marks.js）
  if (rec) removeItem(rec);
  mode = 'celebrate'; C.leaving = false; penguinRest();
  cancel('conf'); renderConfetti(0);   // 上一次撒的东西（星星会一直留着）先收掉
  const keep = nowT; C.t0 = nowT;
  C.el.style.display = 'block'; penEl.style.opacity = 0;
  CP.cx = PC.x; CP.cy = 770 - 55 * P.sc; CP.s = P.sc; CP.sx = CP.sy = 1; CP.rot = 0; cpose('eat'); renderCP();
  C.pen.style.opacity = 1; CM.on = false; CM.held = false;
  HP.on = false; HP.el.style.opacity = 0;
  if (CM.mv) { CM.mv.style.opacity = 0; CM.mv.style.pointerEvents = 'none'; CM.mv.style.transform = ''; }
  const fromS = CP.s, fx = CP.cx, fy = CP.cy;
  // 压暗、放光
  tween(320, e => { C.dim.style.opacity = easeOut(e / 320); }, { tag: 'cel' });
  tween(6000, e => {
    const s = Math.max(0, spring(e, 0, 1, 0, 7, .65).x);
    C.rays.style.opacity = smooth(0, 300, e).toFixed(3);
    C.burst.style.transform = `rotate(${e * 0.014}deg) scale(${s.toFixed(4)})`;
    // 圆盘：隔 110 毫秒一层弹出来；欢呼那一下（1480 毫秒）从里到外再鼓一下；之后很慢地一呼一吸
    C.rings.forEach((r, i) => {
      const a = e - 60 - i * 110, b = e - 1480 - i * 70;
      const pop = a > 0 ? Math.max(0, spring(a, 0, 1, 0, 9, .55).x) : 0;
      const bump = b > 0 ? spring(b, 0.07, 0, 0, 13, .4).x : 0;
      r.style.transform = `scale(${(pop * (1 + bump + 0.012 * Math.sin(e / 700 - i * 0.9))).toFixed(4)})`;
    });
  }, { tag: 'cel' });
  // 企鹅从角落跳到中间放大（张嘴）
  tween(760, e => {
    const p = spring(e, 0, 1, 0, 10.5, .7).x, h = clamp(e / 560, 0, 1);
    CP.cx = lerp(fx, CENTER.x, p); CP.cy = lerp(fy, CENTER.y, p) - 120 * Math.sin(Math.PI * h);
    CP.s = lerp(fromS, BIG, p); CP.rot = -10 * Math.sin(Math.PI * h); renderCP();
  }, { tag: 'cel' });
  // 一条鱼从右上方划弧线落进嘴里
  const mouth = { x: CENTER.x, y: CENTER.y - 120 + 240 * 0.36 }, P0 = { x: 440, y: -70 }, P1 = { x: 250, y: 40 };
  const fishDur = 560;
  C.fish.style.opacity = 0;
  tween(fishDur, e => {
    const q = e / fishDur, u = q * q * 0.35 + q * 0.65, iu = 1 - u;
    const x = iu * iu * P0.x + 2 * iu * u * P1.x + u * u * mouth.x, y = iu * iu * P0.y + 2 * iu * u * P1.y + u * u * mouth.y;
    const dx = 2 * iu * (P1.x - P0.x) + 2 * u * (mouth.x - P1.x), dy = 2 * iu * (P1.y - P0.y) + 2 * u * (mouth.y - P1.y);
    const ang = Math.atan2(dy, dx) * 180 / Math.PI - 180 + 6 * Math.sin(q * 18);
    const sc = 1 - 0.55 * smooth(0.8, 1, q);
    C.fish.style.transform = `translate(${x - 37}px, ${y - 28}px) rotate(${ang}deg) scale(${sc})`;
    C.fish.style.opacity = q >= 1 ? 0 : 1;
  }, { delay: 540, tag: 'cel', done: () => { C.fish.style.opacity = 0; } });
  // 吃到：换成吃饱，挤压拉伸一下，轻震
  at(540 + fishDur, () => {
    cpose(DUO ? 'calm' : 'full');   // 两只各演各的：严肃那只含着鱼不笑
    if (navigator.vibrate && frozen == null) { try { navigator.vibrate(18); } catch (_) {} }
    tween(springMs(20, .3), e => { const k = spring(e, 0.2, 0, -1.5, 20, .3).x; CP.sx = 1 + k; CP.sy = 1 - k; renderCP(); }, { tag: 'cel' });
  }, 'cel');
  // 再换成庆祝，跳一下，撒彩纸
  const tc = 540 + fishDur + 380;
  at(tc, () => {
    if (DUO) {
      // 严肃那只不换图、不离地，只点一下头（往下一沉再起来）
      tween(480, e => { const d = Math.sin(Math.PI * smooth(0, 480, e)); CP.cy = CENTER.y; CP.sx = 1 + 0.03 * d; CP.sy = 1 - 0.07 * d; renderCP(); }, { tag: 'cel' });
    } else {
      cpose('cheer');
      tween(640, e => {
        const h = clamp(e / 440, 0, 1), land = e > 440 ? spring(e - 440, 0.12, 0, 0, 24, .35).x : 0;
        CP.cy = CENTER.y - 70 * Math.sin(Math.PI * h); CP.sx = 1 + land - 0.05 * Math.sin(Math.PI * h); CP.sy = 1 - land + 0.07 * Math.sin(Math.PI * h); renderCP();
      }, { tag: 'cel' });
    }
    tween(CONF_MS, e => renderConfetti(e), { tag: 'conf', done: () => renderConfetti(CONF_MS) });
  }, 'cel');
  if (DUO) tween(6000, e => happyIn(e), { delay: tc, tag: 'cel' });   // 开心那只在同一拍蹦进来欢呼
  CM.tc = tc;
  tween(CM.spin, e => celModel(e), { delay: tc, tag: 'cel' });
  // 下方卡片和一排小鱼
  const had = D.fish; D.fish += 1;
  C.row.innerHTML = '';
  const shown = Math.min(had, 4);
  for (let i = 0; i < shown; i++) C.row.append(fishIcon());
  const nf = fishIcon(); nf.style.transform = 'scale(0)'; C.row.append(nf);
  C.card.style.opacity = 0;
  tween(springMs(12, .72), e => {
    const y = spring(e, 900, 560, 0, 12, .72).x;
    C.card.style.transform = `translateY(${y}px)`; C.card.style.opacity = smooth(0, 160, e);
  }, { delay: tc + 60, tag: 'cel' });
  tween(springMs(18, .4), e => { nf.style.transform = `scale(${Math.max(0, spring(e, 0, 1, 0, 18, .4).x)})`; }, { delay: tc + 380, tag: 'cel' });
  // 自动收起按真实时间算（减少动态效果时也要停留一会儿，不能一闪就没）
  tween(0, () => {}, { start: RM ? clock() : nowT, delay: RM ? 3000 : tc + (CM.mv ? 3600 : DUO ? 3000 : 2300), done: () => dismissCel(), tag: 'celAuto' });
  nowT = keep;
}
function dismissCel() {
  if (mode !== 'celebrate' || C.leaving) return;
  C.leaving = true; cancel('cel'); cancel('celAuto');
  const f = { ...CP }, d0 = +C.dim.style.opacity || 0, w = 11, z = .75;
  const hadModel = CM.on;   // 收起时换回图飞回角落，模型很快淡掉
  if (hadModel) { C.pen.style.opacity = 1; cpose('cheer'); CM.mv.style.pointerEvents = 'none'; }
  const hf = { on: HP.on, x: HP.x, y: HP.y };   // 开心那只：从站的地方往右下角蹦出画面
  tween(springMs(w, z), e => {
    if (hf.on) { const q = clamp(e / 400, 0, 1); HP.x = lerp(hf.x, HP.out.x, q); HP.y = lerp(hf.y, HP.out.y, q) - 64 * Math.sin(Math.PI * q); HP.rot = 12 * q; HP.sx = HP.sy = 1; renderHP(); }
    const p = spring(e, 0, 1, 0, w, z).x, q = clamp(p, 0, 1), o = 1 - smooth(0, 320, e);
    CP.cx = lerp(f.cx, PC.x, p); CP.cy = lerp(f.cy, PC.y, p) - 50 * Math.sin(Math.PI * q); CP.s = lerp(f.s, 1, p); CP.sx = CP.sy = 1; CP.rot = 0; renderCP();
    C.dim.style.opacity = d0 * o; C.rays.style.opacity = o; C.conf.style.opacity = o;
    if (hadModel) CM.mv.style.opacity = 1 - smooth(0, 150, e);
    C.card.style.opacity = o; C.card.style.transform = `translateY(${560 + 120 * smooth(0, 320, e)}px)`;
  }, { done: () => {
    C.el.style.display = 'none'; C.conf.style.opacity = ''; penEl.style.opacity = 1; P.vs += 1.5;
    mode = 'open'; C.leaving = false; CM.on = false; CM.held = false;
    HP.on = false; HP.el.style.opacity = 0;
    if (CM.mv) CM.mv.style.opacity = 0;
  } });
}
C.el.addEventListener('pointerdown', act(() => { if (nowT - C.t0 > 500) dismissCel(); }));

// ---------- 层板上的东西：点 = 拿起来；按住拖 = 拖走 ----------
function bindItem(rec) {
  rec.el.addEventListener('pointerdown', act(e => {
    if (mode !== 'open' || G || rec.F !== cur || !camSettled() || TR.on) return;
    e.preventDefault();
    const p = loc(e); rec.img.style.transform = 'scale(.93)';
    if (A) { const r = rectNow(rec); P.look = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }   // 按着的时候企鹅探身看过去
    G = {
      id: e.pointerId,
      move(q) {
        if (movable(rec.it) && Math.hypot(q.x - p.x, q.y - p.y) > 8) { rec.img.style.transform = ''; const id = G.id; beginDrag(rec, 'shelf', q); G.id = id; }
        // 拖不走的东西：横着划就当是在转镜头（默认界面谁的东西都能挪了，这一支现在走不到，留着防以后再收紧）
        else if (A && !movable(rec.it) && Math.abs(q.x - p.x) > 10 && Math.abs(q.x - p.x) > Math.abs(q.y - p.y)) { rec.img.style.transform = ''; camStart(G.id, p, null); G.move(q); }
      },
      up() { rec.img.style.transform = ''; trace('item up ' + mode); pick(rec); }
    };
    try { rec.el.setPointerCapture(e.pointerId); } catch (_) {}
  }));
}

// ---------- 镜头（只有默认界面「冰箱贴」有）：横着拖空白处 = 镜头跟着转一点；拖过一半或甩一下 = 换到另一台 ----------
// 两台冰箱并排摆着，中心相距 GAP。CAM.x 是镜头的横向位置：正对第 i 台时 = i*GAP。
// 拖的时候 CAM.x 跟手；松手用解析弹簧回到某一台（所以 ?scene=turn&t= 能定格在转场中间）。
// 每台冰箱随离镜头中心的远近 u 绕竖轴转（最多 14 度），并按深度分层错开：箱体正面是基准（底图、门、门缝条、冷冻标签、铭牌
// 都在这一层，互相不错位），内腔里的东西（连胶带、贴纸）在里面，反方向错 0.3 份；企鹅和气泡最近 3.2 份。
// CAM.hx / hy 是鼠标悬停或陀螺仪带来的一点点歪，每帧缓动跟随（这部分是跟手的，不是时间的纯函数）。
const GAP = 480;
const CAM = { x: 0, hx: 0, hy: 0 };
const HV = { x: 0, y: 0, seen: false };      // 鼠标悬停的目标（seen：用过鼠标就不再听陀螺仪）
const GY = { x: 0, y: 0, on: false, b: null }; // 陀螺仪的目标
const camMax = () => (FR.length - 1) * GAP;
const camSettled = () => !A || Math.abs(CAM.x - cur.i * GAP) < 2;
const camRest = () => !A || (CAM.x === cur.i * GAP && CAM.hx === 0 && CAM.hy === 0);
const camMid = () => { const c = clamp(CAM.x, 0, camMax()) / GAP; return Math.abs(c - Math.round(c)); };  // 0 正对一台，0.5 正好两台中间
const camZoom = () => 1 - 0.13 * smooth(0, 0.5, camMid());   // 转到中途镜头往后拉，到位再推回来
// 两头拉过头：橡皮筋，越拉越拉不动
const RB = 160, rb = d => RB * (1 - 1 / (d * 0.55 / RB + 1)), rbInv = y => (RB / (1 - Math.min(y, RB - 1e-3) / RB) - RB) / 0.55;
const rubber = raw => { const m = camMax(); return raw < 0 ? -rb(-raw) : raw > m ? m + rb(raw - m) : raw; };
const unrubber = x => { const m = camMax(); return x < 0 ? -rbInv(-x) : x > m ? m + rbInv(x - m) : x; };
const tf = (el, v) => { if (el.style.transform !== v) el.style.transform = v; };
const f2 = v => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(2);
function renderCam() {
  if (!A) return;
  const z = camZoom(), mid = camMid(), uh = CAM.hx * 0.15, vh = CAM.hy;
  FR.forEach(F => {
    const o = F.i * GAP - CAM.x, sx = o * z, u = o / GAP + uh;
    F.root.style.visibility = Math.abs(sx) > 470 ? 'hidden' : '';
    const ry = 14 * Math.tanh(u * 2.2), rx = vh * 2.4;
    const still = Math.abs(sx) < 5e-3 && z === 1 && Math.abs(ry) < 5e-4 && Math.abs(rx) < 5e-4;
    tf(F.root, still ? '' : `translateX(${sx.toFixed(2)}px) scale(${z.toFixed(4)}) perspective(1000px) rotateY(${ry.toFixed(3)}deg) rotateX(${rx.toFixed(3)}deg)`);
    const p = 7 * Math.tanh(u * 3), zero = Math.abs(p) < 5e-4;
    // 分层（第二段改）：门、门缝条、冷冻标签、铭牌都贴在箱体正面上，和底图同一层、零相对错位（不再单独挪）；
    // 内腔里的东西（连层名胶带、贴纸）在“里面”，朝反方向错一点点，量小到不像在层板上滑；企鹅和气泡在最前面（见下面）
    tf(F.shelf, zero ? '' : `translate(${f2(-p * 0.3)}px, 0px)`);
    // 铭牌沿着顶上横梁往画面里滑：转到一半时冰箱中线已经在屏幕边上，铭牌要停在看得见的那段梁上
    const cx = 195 + sx, slide = clamp((clamp(cx, 72, 318) - cx) / z, -125, 125);
    tf(F.plate, Math.abs(slide) < 5e-3 ? '' : `translate(${f2(slide)}px, 0px)`);
    // 铭牌“我的 N 件”：转的途中才出来
    if (F.mine < 0 || mid > 0.02) {
      const n = F.data.items.filter(it => it.kind === 'mine').length;
      if (n !== F.mine) { F.mine = n; F.plateTp.textContent = `我的 ${n} 件`; }
    }
    F.plate.style.opacity = smooth(0.1, 0.3, mid).toFixed(3);
  });
  // 企鹅和气泡不跟冰箱走（它们是这个画面的前景），只按视差错开：离到位越远错得越多，到中途回到原位
  const f = CAM.x / GAP, up = -Math.sin(2 * Math.PI * f) / (2 * Math.PI) + uh;
  const px = 7 * Math.tanh(up * 3) * 3.2, py = -vh * 1.5 * 3.2, z0 = Math.abs(px) < 5e-3 && Math.abs(py) < 5e-3;
  const pv = z0 ? '' : `${f2(px)}px ${f2(py)}px`;
  if (penEl.style.translate !== pv) penEl.style.translate = pv;
  tf(bubble, z0 ? '' : `translate(${f2(px)}px, ${f2(py)}px)`);
}
// 手指在空白处按下：开始转镜头。onTap：没怎么动就松手时做的事（比如门上点一下 = 开门）
function camGesture(e, onTap) { camStart(e.pointerId, loc(e), onTap); }
function camStart(id, p, onTap) {
  cancel('cam'); cancel('auto');
  let raw = unrubber(CAM.x), last = p, moved = 0;
  const t0 = performance.now(), hist = [{ t: t0, x: CAM.x }];
  G = {
    id, cam: true,
    move(q) {
      moved = Math.max(moved, Math.hypot(q.x - p.x, q.y - p.y));
      if (moved > 6) bubbleOut();   // 一开始拖，气泡就淡出
      raw -= (q.x - last.x) / camZoom(); last = q;
      CAM.x = rubber(raw);
      const n = performance.now(); hist.push({ t: n, x: CAM.x }); while (hist.length > 2 && n - hist[0].t > 90) hist.shift();
    },
    up() {
      // 速度按最后几次移动算（松手前停住超过 120 毫秒就当没甩）
      const n = performance.now(), h0 = hist[0], h1 = hist[hist.length - 1];
      const v = h1.t - h0.t > 8 && n - h1.t < 120 ? (h1.x - h0.x) / ((h1.t - h0.t) / 1000) : 0;
      if (moved < 6 && n - t0 < 450) { snapTo(cur.i); if (onTap) onTap(); return; }
      const d = CAM.x - cur.i * GAP;
      trace('cam up d=' + d.toFixed(0) + ' v=' + v.toFixed(0));
      let t = clamp(Math.round(CAM.x / GAP), 0, FR.length - 1);
      if (t === cur.i && Math.abs(v) > 400 && Math.abs(d) > 20 && Math.sign(v) === Math.sign(d)) t = clamp(cur.i + Math.sign(v), 0, FR.length - 1);   // 甩一下也算
      if (t !== cur.i) setCur(FR[t]);
      snapTo(t, v);
    }
  };
  try { phone.setPointerCapture(id); } catch (_) {}
}
// 镜头弹到第 i 台。第一次到一台“自己开门”的冰箱：停稳一点后门自己打开
function snapTo(i, v0 = 0) {
  cancel('cam');
  const x0 = CAM.x, to = i * GAP, w = 9.5, z = 0.84;
  tween(springMs(w, z), e => { CAM.x = spring(e, x0, to, v0, w, z).x; }, { tag: 'cam', done: () => { CAM.x = to; } });
  const F = FR[i];
  // 气泡：一开始转就淡出（拖动时在 camStart 里已经淡出了），差不多到位时带着这台的话淡入
  if (Math.abs(x0 - to) > 2 || BUB.html !== F.bubble) bubbleOut();
  if (BUB.out) at(440, () => bubbleIn(F), 'cam');
  if (F.pendingAuto && !F.popped) {
    cancel('auto');
    at(560, () => { if (F === cur && !F.popped && F.a < 1 && mode === 'closed' && !G) openDoor(260, F); }, 'auto');
  }
}
function setCur(F) {
  if (F === cur) return;
  const dir = Math.sign(F.i - cur.i);
  cur = F;
  mode = F.popped ? 'open' : 'closed';
  if (F.data.autoOpen && !F.popped) F.pendingAuto = true;
  else if (!F.popped) { cancel('hint' + F.i); scheduleHint(900, F); }   // 关着门、不会自己开的那台：到了再提示一下能拉
  document.querySelectorAll('#topbar .tab').forEach((b, i) => b.classList.toggle('on', i === F.i));
  popTab(F.i); hopPenguin(dir);
  trace('fridge ' + F.i);
}
function goTo(i) { if (i === cur.i) return; setCur(FR[i]); snapTo(i); }
// 顶上的字：换过去时弹一下
function popTab(i) {
  const b = document.querySelectorAll('#topbar .tab')[i]; if (!b) return;
  cancel('tab');
  tween(springMs(16, .45), e => { const s = spring(e, 0.82, 1, 0, 16, .45).x; b.style.transform = Math.abs(s - 1) < 1e-4 ? '' : `scale(${s.toFixed(4)})`; },
    { tag: 'tab', done: () => { b.style.transform = ''; } });
}
// 气泡：镜头一开始动就淡出；差不多到位时换成这台的话，这台开着才再冒出来（关着的那台等门开了跟着东西一起淡入）
const BUB = { out: false, html: '' };
function bubbleOut() {
  if (BUB.out) return;
  BUB.out = true; cancel('bub');
  const o0 = +bubble.style.opacity || 0;
  tween(140, e => { bubble.style.opacity = (o0 * (1 - e / 140)).toFixed(3); }, { tag: 'bub' });
}
function bubbleIn(F) {
  if (!BUB.out) return;
  BUB.out = false; cancel('bub');
  if (BUB.html !== F.bubble) { bubble.innerHTML = BUB.html = F.bubble; }
  if (!F.popped) { bubble.style.opacity = 0; return; }
  const o0 = +bubble.style.opacity || 0;
  tween(260, e => { const p = easeOut(e / 260); bubble.style.opacity = lerp(o0, 1, p).toFixed(3); bubble.style.translate = `0 ${((1 - p) * 4 * (1 - o0)).toFixed(2)}px`; }, { tag: 'bub' });
}
// 换一台冰箱自己的那句话（默认界面 marks.js 每帧按记号算出件数）。正显示着这台的话就原地换字、不闪；
// 正说着别的（“放进冷冻了”）或淡出着，就只记下，轮到时再换上
function setBubble(F, html) {
  if (F.bubble === html) return;
  const prev = F.bubble; F.bubble = html;
  if (F === cur && !BUB.out && BUB.html === prev) bubble.innerHTML = BUB.html = html;
}
// 企鹅：往要去的那边歪，小跳三下
function hopPenguin(dir) {
  cancel('hop');
  const D_ = 900, H = [10, 8, 5];
  tween(D_, e => {
    const q = e / D_, k = clamp(q / 0.8, 0, 1) * 3, n = Math.min(2, Math.floor(k)), f = k - n;
    P.hop = q < 0.8 ? H[n] * Math.sin(Math.PI * f) : 0;
    // 落地那一下压扁：每跳的起落各压一点，最后一下用弹簧收
    const c = q < 0.8 ? Math.max(0, 1 - Math.min(f, 1 - f) / 0.12) * 0.07 : spring(e - 0.8 * D_, 0.07, 0, 0, 26, .4).x;
    P.sq = c; P.hl = dir * 9 * Math.sin(Math.PI * clamp(q / 0.85, 0, 1));
  }, { tag: 'hop', done: () => { P.hop = 0; P.sq = 0; P.hl = 0; } });
}
// 陀螺仪：非 iOS 直接听；iOS 要用户点一下才能问权限，而且只在网址带 ?gyro=1 时才问
function initGyro() {
  if (!A || frozen != null) return;
  const on = () => {
    try {
      addEventListener('deviceorientation', e => {
        try {
          if (e.gamma == null || e.beta == null) return;
          if (!GY.b) GY.b = { g: e.gamma, b: e.beta };
          GY.b.g += (e.gamma - GY.b.g) * 0.01; GY.b.b += (e.beta - GY.b.b) * 0.01;   // 基准慢慢漂过去：手机一直斜着拿也会回正
          GY.x = clamp((e.gamma - GY.b.g) / 20, -1, 1); GY.y = clamp((e.beta - GY.b.b) / 20, -1, 1) * 0.6; GY.on = true;
        } catch (_) {}
      });
    } catch (_) {}
  };
  try {
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return;
    if (typeof DOE.requestPermission === 'function') {
      if (qs.get('gyro') !== '1') return;
      const ask = () => { removeEventListener('click', ask); removeEventListener('touchend', ask);
        try { DOE.requestPermission().then(r => { if (r === 'granted') on(); }).catch(() => {}); } catch (_) {} };
      addEventListener('click', ask); addEventListener('touchend', ask);
    } else on();
  } catch (_) {}
}
function bindCam() {
  if (!A) return;
  document.querySelectorAll('#topbar .tab').forEach((b, i) => b.addEventListener('click', act(() => {
    if (G || (mode !== 'open' && mode !== 'closed')) return;
    // 拉出一层时点顶上的字：先把托盘收回去，收好了再换过去（点的就是这台就只收）
    if (TR.on) { if (mode !== 'open') return; TR.then = i === cur.i ? null : () => goTo(i); if (!TR.closing) closeTray(); return; }
    goTo(i);
  })));
  // 空白处按下：转镜头（按钮、详情卡、拿起层、庆祝层不算）
  phone.addEventListener('pointerdown', act(e => {
    if (G || (mode !== 'open' && mode !== 'closed') || TR.on) return;
    if (e.target.closest('button, #sheet, #lift, #dim, #celebrate')) return;
    // 企鹅的气泡：点一下（没拖）拉出记号最多的那层（marks.js 挑层）；拖着照样转镜头
    if (window.MARKS && e.target.closest('#bubble')) { camGesture(e, () => MARKS.bubbleTap()); return; }
    camGesture(e, null);
  }));
  frameEl.addEventListener('pointerleave', () => { HV.x = 0; HV.y = 0; });
}

// ---------- 4 拉出一层（只有默认界面「冰箱贴」有） ----------
// 门开着时点一层的层名胶带（末尾有个小箭头）或“+N”叠放格：这一层像抽屉一样朝人滑出来，变成屏幕中间的一个黏土托盘，
// 这一层的东西（连“+N”里收着的）从原位飞到托盘的格子里，按主人分组摆开；后面的冰箱退后、变暗。
// 托盘的展开量 TR.p、每样东西的飞行进度 c.q 都由补间写（时间的纯函数，?scene=shelf&t= 能定格）；
// “往上推”时的推回量 TR.push 是跟手的。renderTray() 每帧按这几个数算出所有位置。
const TRAY = { x: 12, y: 190, w: 366, h: 426 };   // 托盘停下来的位置：下沿 616，名牌骑在下沿上，最低到 ~632
// 托盘停下来的上沿。冷冻托盘停得低：下沿贴着拉开的抽屉面上沿（冰箱缩到 0.94 时的屏幕位置），像从抽屉里升出来；h 是托盘此刻的高度
function trayTop(h) { return TR.frz ? toScr(0, dwTop(1), 0.94).y + 1 - h : TRAY.y; }
const TG = { rim: 13, padX: 7, padT: 9, cols: 4, head: 20, img: 64, rowH: 124 };
TG.colW = (TRAY.w - 2 * TG.rim - 2 * TG.padX) / TG.cols;   // 一格宽 81.5
const KO = { x: 195, y: 420 };                     // 后面的冰箱退后时的缩放中心（和 skin.css 里 #kitchen 的 transform-origin 一致）
const TR = { on: false, F: null, t: -1, p: 0, push: 0, hf: 1, closing: false, dirty: false, list: [], order: [], heads: [], scroll: 0, maxScroll: 0, from: null, nameFrom: null, shelfName: null, frz: false };   // frz：拉出来的是冷冻（t 是 'z'）
let TL = null;    // 托盘这几块 DOM
const CHEV = '<svg class="chev" viewBox="0 0 10 10" aria-hidden="true"><path d="M3.6 1.8 6.8 5 3.6 8.2"/></svg>';
const OWN_ORDER = ['满', '青'];   // “别人的”按人分组的先后
function groupOf(it) {
  if (it.kind === 'unknown') return { k: 0, label: '不知道是谁的', dot: 'ask' };
  if (it.kind === 'mine') return { k: 1, label: '我的', dot: D.owners['我'] };
  if (it.kind === 'shared') return { k: 2, label: '大家的', dot: 'shared' };
  const i = OWN_ORDER.indexOf(it.owner);
  return { k: 3 + (i < 0 ? 9 : i), label: (D.ownerNames[it.owner] || it.owner) + '的', dot: D.owners[it.owner] || '#9a8a74' };
}
const trayFrom = t => ({ x: 28, y: S[t] - 56, w: 334, h: 72 });   // 这一层层板（连上面那一格）在屏幕上的位置和大小
// 第 t 层“+N”格的中心（默认界面的“+N”都在第 4 格：left 304、宽 34、上沿 = 层板 - 30，见 skin.js after()）
function moreBox(F, t) { return { x: 304 + 17, y: S[t] - 30 + 21 }; }
const dotHTML = d => `<i class="gd${d === 'ask' || d === 'shared' ? ' ' + d : ''}"${d.startsWith('#') ? ` style="background:${d}"` : ''}></i>`;

function initPull() {
  TL = { kitchen: $('#kitchen'), layer: div(''), dim: div('trayDim'), tray: div('tray'), items: div('trayItems'), name: div('name trayname') };
  TL.layer.id = 'trayLayer';
  TL.tray.innerHTML = '<div class="floor"><div class="grain"></div></div>';
  TL.layer.append(TL.dim, TL.tray, TL.items, TL.name);
  TL.kitchen.after(TL.layer);   // 在冰箱上面、顶栏下面：顶栏的“只看我的”在托盘开着时还能点
  FR.forEach(F => {
    // 层名胶带：末尾加个小箭头，点了拉出这一层
    F.shelf.querySelectorAll('.name').forEach((n, t) => {
      const tp = n.querySelector('.tp'); if (tp) tp.insertAdjacentHTML('beforeend', CHEV);
      n.classList.add('pull'); bindPull(F, n, t);
    });
    F.moreEl = F.shelf.querySelector('.more');
    // 每层收着的东西：F.hid[层号] 是数组，F.moreEls[层号] 是那层的“+N”格（哪层东西放不下了才建）。
    // 第一台二层原来那个“+2”就是 F.data.more，两边保持同一份（syncMore）
    F.hid = {}; F.moreEls = {};
    if (F.moreEl && F.data.more) {
      F.hid[F.data.more.t] = F.data.more.items || []; F.moreEls[F.data.more.t] = F.moreEl;
      F.moreEl.classList.add('pull'); bindPull(F, F.moreEl, F.data.more.t);
      // “+N”里收着的东西：层板上没有它们的位置，只有拉出这一层时才在托盘上出现
      (F.data.more.items || []).forEach(it => {
        const el = div('item ' + it.kind), im = new Image(); im.src = src(it.img); im.alt = ''; im.draggable = false; el.append(im);
        const b = moreBox(F, F.data.more.t), r = { x: b.x - 10, y: b.y - 20, w: 20, h: 20 };
        F.recs[it.id] = { it, el, img: im, st: null, r, F, hidden: true, ht: F.data.more.t };
      });
      updateMore(F);
    }
  });
  // 托盘外面的暗处：点一下收起（按下也要在暗处，理由同 #dim）
  let down = false;
  TL.dim.addEventListener('pointerdown', () => { down = TR.on && !TR.closing && mode === 'open' && !G; });
  TL.dim.addEventListener('click', act(() => { if (down) closeTray(); down = false; }));
  // 托盘本身：东西多了上下滚（拖空白处或滚轮）
  TL.tray.addEventListener('pointerdown', act(e => {
    if (!TR.on || G || mode !== 'open') return;
    e.preventDefault();
    const p = loc(e), s0 = TR.scroll;
    G = { id: e.pointerId, move(q) { if (TR.maxScroll > 0) TR.scroll = clamp(s0 - (q.y - p.y), 0, TR.maxScroll); }, up() {} };
    try { TL.tray.setPointerCapture(e.pointerId); } catch (_) {}
  }));
  TL.layer.addEventListener('wheel', e => { if (TR.on && TR.maxScroll > 0 && mode === 'open') { e.preventDefault(); TR.scroll = clamp(TR.scroll + e.deltaY / SC, 0, TR.maxScroll); } }, { passive: false });
  // 托盘前沿的名牌：点一下收起；按住往上推，托盘跟着手往回缩，推过一点或往上甩就收起，否则弹回来
  TL.name.addEventListener('pointerdown', act(e => {
    if (!TR.on || TR.closing || mode !== 'open' || G || TR.p < 0.9) return;
    e.preventDefault(); cancel('trayPush');
    const p = loc(e), push0 = TR.push, hist = [{ t: performance.now(), y: p.y }]; let moved = 0;
    TL.name.classList.add('press');
    G = {
      id: e.pointerId,
      move(q) {
        moved = Math.max(moved, Math.hypot(q.x - p.x, q.y - p.y));
        const dy = q.y - p.y;
        TR.push = dy < 0 ? clamp(push0 - dy / 320, 0, 1) : Math.max(0, push0 - dy / 320) - rb(dy) / 1400;   // 往下拉：一点点橡皮筋
        const n = performance.now(); hist.push({ t: n, y: q.y }); while (hist.length > 2 && n - hist[0].t > 90) hist.shift();
      },
      up(q, ev) {
        TL.name.classList.remove('press');
        const n = performance.now(), h0 = hist[0], v = n - h0.t > 8 && ev && ev.type !== 'pointercancel' ? (q.y - h0.y) / ((n - h0.t) / 1000) : 0;
        if (ev && ev.type === 'pointercancel') { pushBack(); return; }
        if (moved < 6 || TR.push > 0.22 || v < -450) closeTray(); else pushBack();
      }
    };
    try { TL.name.setPointerCapture(e.pointerId); } catch (_) {}
  }));
  // “只看我的”
  MINE.btn = $('#topbar .onlymine'); MINE.sw = MINE.btn && MINE.btn.querySelector('.sw');
  if (MINE.btn) {
    MINE.btn.setAttribute('aria-pressed', 'false');
    MINE.btn.addEventListener('click', act(() => { if (G || mode === 'picked' || mode === 'drag' || mode === 'busy' || mode === 'celebrate') return; setMine(!MINE.on); }));
  }
}
function pushBack() { cancel('trayPush'); const p0 = TR.push; tween(springMs(16, .72), e => { TR.push = spring(e, p0, 0, 0, 16, .72).x; }, { tag: 'trayPush', done: () => { TR.push = 0; } }); }
// “+N”格：字跟着收着的件数走，下沿一样一个主人颜色的小泥点。
// 第 t 层（不传就是 F.data.more 那层）。收着的没了：缩一下藏起来；这层第一次放不下：新建一个弹出来。inst：不要动画
function updateMore(F, t = F.data.more && F.data.more.t, inst) {
  if (t == null || !F.hid) return;
  const list = F.hid[t] || []; let m = F.moreEls[t];
  if (!list.length) {
    if (!m || m.style.display === 'none') return;
    if (inst) { m.style.display = 'none'; return; }
    tween(220, e => { m.style.transform = `scale(${(1 - easeIn(e / 220)).toFixed(4)})`; }, { tag: 'norm', done: () => { m.style.display = 'none'; m.style.transform = ''; } });
    return;
  }
  const fresh = !m || m.style.display === 'none';
  if (!m) {
    m = F.moreEls[t] = div('more pull');
    Object.assign(m.style, { left: '304px', top: (S[t] - 30) + 'px', width: '34px', padding: 0, textAlign: 'center' });
    F.shelf.append(m); bindPull(F, m, t);
  }
  m.style.display = '';
  m.textContent = '+' + list.length;
  const dots = list.map(it => it.kind === 'mine' ? D.owners['我'] : it.kind === 'other' ? (D.owners[it.owner] || '#9a8a74') : it.kind === 'shared' ? 'shared' : 'ask');
  m.insertAdjacentHTML('beforeend', `<span class="mdots">${dots.map(dotHTML).join('')}</span>`);
  if (fresh && !inst) { m.style.transform = 'scale(0)'; tween(springMs(18, .45), e => { m.style.transform = `scale(${Math.max(0, spring(e, 0, 1, 0, 18, .45).x).toFixed(4)})`; }, { tag: 'norm', delay: 120, done: () => { m.style.transform = ''; } }); }
}
// 层名胶带 /“+N”格按下：缩一下；松手拉出这一层。横着划就当转镜头（和层板上拖不走的东西一样）
function bindPull(F, el, t) {
  el.addEventListener('pointerdown', act(e => {
    if (mode !== 'open' || G || F !== cur || !camSettled() || TR.on) return;
    e.preventDefault();
    const p = loc(e); el.classList.add('press');
    G = {
      id: e.pointerId,
      move(q) { if (Math.abs(q.x - p.x) > 10 && Math.abs(q.x - p.x) > Math.abs(q.y - p.y)) { el.classList.remove('press'); camStart(G.id, p, null); G.move(q); } },
      up(q, ev) { el.classList.remove('press'); if (ev && ev.type === 'pointercancel') return; if (window.START && START.name(F, t, el)) return; openTray(F, t); }   // START：start.js（只在 ?start= 时有），“还没人认”的名牌交给它
    };
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
  }));
}
function mkTrayItem(rec) {
  const it = rec.it, [nw, nh] = D.sizes[it.img], k = Math.min(60 / nh, 70 / nw), w = nw * k, h = nh * k;
  const el = div('titem ' + it.kind), box = div('tbox'), im = new Image();
  im.src = src(it.img); im.alt = ''; im.draggable = false; im.style.transition = 'transform .14s'; box.append(im);
  const lab = div('tlab'); lab.append(div('tn', (A && it.name) || D.names[it.img]), div('ti', tInfo(rec)));
  if (rec.frz != null) { const s = div('tst'); tstSet(s, it); box.append(s); }   // 冷冻托盘：每样东西都带主人贴纸
  el.append(box, lab, div('hit'));
  el.style.width = w + 'px'; el.style.height = h + 'px';
  TL.items.append(el);
  const c = { rec, el, box, img: im, lab, w, h, q: 0, m: 1, cell: null, prev: null, r: { x: 0, y: 0, w, h } };
  if (rec.hidden) { const b = moreBox(rec.F, rec.ht); c.sx = b.x; c.sy = b.y + h * 0.09; c.s0 = 0.18; }   // 从“+N”格里冒出来
  else if (rec.frz != null) { c.sx = 195; c.sy = 676; c.s0 = 0.3; }                               // 从冷冻抽屉里冒出来（openTray 里再按顺序错开）
  else { c.sx = rec.r.x + rec.r.w / 2; c.sy = rec.r.y + rec.r.h; c.s0 = rec.r.w / w; }        // 从层板上的原位出发
  rec.el.classList.add('intray'); if (rec.st) rec.st.classList.add('intray');
  rec.tv = c; rec.mk = null;   // “只看我的”的样子要在托盘这份上重新套一遍
  bindTrayItem(c);
  return c;
}
// 托盘上的东西：点 = 拿起来看详情（放回时回到托盘上）；能处理的按住拖 = 拖给企鹅
function bindTrayItem(c) {
  const rec = c.rec;
  c.el.addEventListener('pointerdown', act(e => {
    if (mode !== 'open' || G || !TR.on || TR.closing || c.q < 0.85 || rec.tv !== c) return;
    e.preventDefault();
    const p = loc(e); c.img.style.transform = 'scale(.93)';
    P.look = { x: c.r.x + c.r.w / 2, y: c.r.y + c.r.h / 2 };
    G = {
      id: e.pointerId,
      move(q) {
        // 别人的、没人认的（只能挪，从托盘上只能挪进冷冻）：托盘滚得动时竖着划还是滚托盘，别的方向才拖起来
        const only = !draggable(rec.it), vert = TR.maxScroll > 0 && Math.abs(q.y - p.y) > Math.abs(q.x - p.x);
        if (movable(rec.it) && !(only && vert) && Math.hypot(q.x - p.x, q.y - p.y) > 8) { c.img.style.transform = ''; const id = G.id; beginDrag(rec, 'shelf', q); G.id = id; }
        else if (only && TR.maxScroll > 0 && Math.abs(q.y - p.y) > 8) {   // 拖不走的东西上下划 = 滚托盘
          c.img.style.transform = ''; const s0 = TR.scroll, id = G.id;
          G = { id, move(q2) { TR.scroll = clamp(s0 - (q2.y - p.y), 0, TR.maxScroll); }, up() {} };
        }
      },
      up(q, ev) { c.img.style.transform = ''; if (ev && ev.type === 'pointercancel') return; trace('tray item up'); pick(rec); }
    };
    try { c.el.setPointerCapture(e.pointerId); } catch (_) {}
  }));
}
// 排格子：按主人分组（不知道是谁的 → 我的 → 大家的 → 别人的按人），一行 4 格。
// 一组放得进这一行剩下的格子就接着放，放不进就换行；每组第一格上面一个小标题
function layoutTray() {
  const idx = c => TR.list.indexOf(c);
  const gk = c => TR.frz ? c.rec.frz : groupOf(c.rec.it).k;   // 冷冻托盘按冷冻里的分层排
  const order = TR.list.slice().sort((a, b) => gk(a) - gk(b) || idx(a) - idx(b));
  const groups = [];
  if (TR.frz) TR.F.data.frozen.forEach((z, k) => { const cs = order.filter(c => c.rec.frz === k); groups.push({ k, label: `${z.label} · ${cs.length} 件`, dot: '', cold: true, cs }); });
  else order.forEach(c => { const g = groupOf(c.rec.it), last = groups[groups.length - 1]; if (last && last.k === g.k) last.cs.push(c); else groups.push({ ...g, cs: [c] }); });
  const ox = TRAY.x + TG.rim + TG.padX, oy = TRAY.y + TG.rim + TG.padT;
  let row = 0, col = 0; const heads = [];
  groups.forEach(g => {
    if (col > 0 && (g.cold || col + g.cs.length > TG.cols)) { row++; col = 0; }   // 冷冻的每一层另起一行
    heads.push({ label: g.label, dot: g.dot, cold: g.cold, x: ox + col * TG.colW + 3, y: oy + row * TG.rowH, n: Math.min(g.cs.length, TG.cols - col) });
    if (g.cold && !g.cs.length) col = TG.cols;   // 空的那层也留一行，标题写“0 件”
    g.cs.forEach(c => {
      if (col >= TG.cols) { row++; col = 0; }
      c.prev = c.cell; c.cell = { bx: ox + (col + 0.5) * TG.colW, by: oy + row * TG.rowH + TG.head + TG.img };
      col++;
    });
  });
  TR.order = order;
  const rows = col > 0 ? row + 1 : row, viewH = TRAY.h - 2 * TG.rim - TG.padT;
  TR.maxScroll = Math.max(0, rows * TG.rowH + 4 - viewH); TR.scroll = clamp(TR.scroll, 0, TR.maxScroll);
  // 托盘高度跟着东西走（一两行就别撑满一屏），最高 TRAY.h，再多就滚
  const h1 = clamp(2 * TG.rim + TG.padT + Math.max(1, rows) * TG.rowH + 6, 200, TRAY.h);
  TR.h0 = TR.h == null || !TR.on ? h1 : TR.h; TR.h = h1;
  // 冷冻托盘的上沿跟着高度走（下沿固定在抽屉上）：格子和小标题整体挪过去。普通层 dy 是 0
  const dy = trayTop(h1) - TRAY.y;
  if (dy) { order.forEach(c => { c.cell.by += dy; }); heads.forEach(h => { h.y += dy; }); }
  TR.heads.forEach(h => h.el.remove());
  TR.heads = heads.map(h => {
    const el = div('tgh' + (h.cold ? ' cold' : h.n === 1 && h.label.length >= 5 ? ' tight' : '')); el.innerHTML = h.dot ? dotHTML(h.dot) : ''; el.append(h.label);
    TL.items.append(el); return { ...h, el };
  });
}
function openTray(F, t) {
  if (!A || TR.on || mode !== 'open') return;
  // t = 'z'：点了冷冻抽屉（或抽屉上的“冷冻 · N 件”胶带），拉出来的是冷冻托盘：冷冻里每层的东西都摆出来，抽屉一直开着
  const fz = t === 'z';
  const vis = fz ? F.data.frozen.flatMap(z => z.items).map(it => F.recs[it.id]).filter(Boolean)
    : F.data.items.filter(it => it.t === t).map(it => F.recs[it.id]).filter(Boolean);
  const hid = fz ? [] : ((F.hid && F.hid[t]) || []).map(it => F.recs[it.id]).filter(Boolean);
  trace('tray open ' + F.i + ':' + t);
  Object.assign(TR, { on: true, F, t, p: 0, push: 0, hf: 1, closing: false, dirty: false, list: [], heads: [], scroll: 0, h: null, from: fz ? { x: 24, y: 626, w: 342, h: 96 } : trayFrom(t), then: null, frz: fz });
  TL.layer.style.display = 'block'; TL.items.style.clipPath = '';
  TL.layer.classList.toggle('cold', fz);
  // 名牌：从层板上那条胶带的位置出发，最后骑在托盘前沿上（冷冻：从抽屉上那条“冷冻 · N 件”胶带出发）
  const sn = fz ? F.ftags : F.shelf.querySelectorAll('.name')[t]; TR.shelfName = sn;
  TL.name.className = 'name trayname' + (fz ? ' frzname' : sn.classList.contains('mine') ? ' mine' : '');
  TL.name.innerHTML = fz ? `<span class="tp">冷冻 · ${frzCount(F)} 件${CHEV}</span>` : sn.innerHTML;
  TR.nameFrom = fz ? { x: 34, y: 624, rot: -1.4 } : { x: sn.offsetLeft, y: sn.offsetTop, rot: parseFloat(sn.style.rotate) || 0 };
  sn.classList.add('intray');
  [...vis, ...hid].forEach(rec => TR.list.push(mkTrayItem(rec)));
  if (fz) { TR.list.forEach((c, i) => { c.sx = 70 + (i * 61) % 250; c.sy = 668 + (i % 2) * 14; }); dwSet(1, F); }   // 从抽屉各处冒出来；抽屉开着
  layoutTray();
  // 托盘一个弹簧滑出来；东西一样一样错开 40 毫秒飞过去（收着的那几样最后从“+N”里冒出来）
  const w = 11, z = 0.8;
  tween(springMs(w, z), e => { TR.p = spring(e, 0, 1, 0, w, z).x; }, { tag: 'tray', done: () => { TR.p = 1; } });
  TR.list.forEach((c, i) => {
    const w2 = 13, z2 = 0.62;
    tween(springMs(w2, z2), e => { c.q = spring(e, 0, 1, 0, w2, z2).x; }, { tag: 'tray', delay: 70 + i * 40, done: () => { c.q = 1; } });
  });
}
// force：冷冻托盘上点了“拿出来解冻”时由 thaw 调（那时 mode 是 busy）；返回收完要多少毫秒
function closeTray(force) {
  if (!TR.on || TR.closing || (mode !== 'open' && !force)) return 0;
  trace('tray close');
  // 推了一半松手收起：把推回量折进展开量和每样东西的进度里，从那儿接着收
  const P0 = TR.p * (1 - TR.push); TR.list.forEach(c => { c.q *= 1 - TR.push; if (c.prev) { c.m = 1; } }); TR.p = P0; TR.push = 0;
  cancel('tray'); cancel('trayPush'); cancel('trayRe');
  TR.closing = true; TR.hf = 1;
  const n = TR.list.length; let end = 0;
  // 倒着放一遍：东西先飞回层板原位（收着的缩回“+N”格），托盘跟着缩回去
  TR.list.forEach((c, i) => {
    const q0 = c.q, d = (n - 1 - i) * 34, w = 15, z = 0.9, dur = springMs(w, z);
    tween(dur, e => { c.q = Math.max(0, spring(e, q0, 0, 0, w, z).x); }, { tag: 'tray', delay: d });
    end = Math.max(end, d + dur);
  });
  const w = 12, z = 0.92, dur = springMs(w, z);
  tween(dur, e => { TR.p = Math.max(0, spring(e, P0, 0, 0, w, z).x); }, { tag: 'tray', delay: 40 });
  at(Math.max(end, 40 + dur), finishTray, 'tray');
  return Math.max(end, 40 + dur);
}
function finishTray() {
  TR.list.forEach(c => { c.el.remove(); delete c.rec.tv; c.rec.mk = null; c.rec.el.classList.remove('intray'); if (c.rec.st) c.rec.st.classList.remove('intray'); });
  if (TR.shelfName) TR.shelfName.classList.remove('intray');
  TR.heads.forEach(h => h.el.remove());
  if (TR.frz) { dwSet(0, TR.F); TL.layer.classList.remove('cold'); }   // 冷冻托盘收好了：抽屉推回去
  Object.assign(TR, { on: false, F: null, t: -1, p: 0, push: 0, closing: false, dirty: false, list: [], order: [], heads: [], scroll: 0, shelfName: null, frz: false });
  TL.layer.style.display = 'none'; TL.items.style.clipPath = ''; tf(TL.kitchen, '');
  trace('tray closed');
  const then = TR.then; TR.then = null; if (then && mode === 'open' && !G) then();
}
// 托盘上的一样东西被处理掉了（removeItem 里调）：拿掉它，等庆祝收起回到 open 再重新排
function trayDrop(rec) {
  const c = rec.tv; c.el.remove(); delete rec.tv;
  TR.list = TR.list.filter(x => x !== c); TR.dirty = true;
}
function relayoutTray() {
  layoutTray();
  TR.hf = 0; cancel('trayRe');
  TR.order.forEach((c, i) => {
    if (!c.prev) return; c.m = 0;
    tween(springMs(14, .7), e => { c.m = spring(e, 0, 1, 0, 14, .7).x; }, { tag: 'trayRe', delay: i * 30, done: () => { c.m = 1; } });
  });
  tween(260, e => { TR.hf = easeOut(e / 260); }, { tag: 'trayRe', delay: 160 });
}
function renderTray() {
  if (!TR.on) return;
  if (TR.dirty && mode === 'open' && !TR.closing) { TR.dirty = false; if (TR.list.length) relayoutTray(); else closeTray(); if (!TR.on) return; }
  const P = TR.p * (1 - TR.push), Pc = clamp(P, 0, 1), k = 1 - 0.06 * Pc;
  tf(TL.kitchen, Pc < 1e-4 ? '' : `scale(${k.toFixed(4)})`);
  TL.dim.style.opacity = Pc.toFixed(3);
  const kx = x => KO.x + (x - KO.x) * k, ky = y => KO.y + (y - KO.y) * k;
  // 托盘：从层板（跟着冰箱一起缩）滑到屏幕中间；前沿不动，后沿从“平躺着”翻起来正对人
  const TH = lerp(TR.h0, TR.h, TR.hf);
  const TY = trayTop(TH);
  const f = TR.from, R = { x: lerp(kx(f.x), TRAY.x, P), y: lerp(ky(f.y), TY, P), w: lerp(f.w * k, TRAY.w, P), h: lerp(f.h * k, TH, P) };
  const ts = TL.tray.style;
  ts.left = R.x.toFixed(2) + 'px'; ts.top = R.y.toFixed(2) + 'px'; ts.width = R.w.toFixed(2) + 'px'; ts.height = R.h.toFixed(2) + 'px';
  ts.opacity = smooth(0, 0.12, P).toFixed(3);
  ts.transform = `perspective(900px) rotateX(${(56 * Math.pow(1 - Pc, 1.7)).toFixed(2)}deg)`;
  // 东西
  const sc = TR.scroll;
  TR.list.forEach(c => {
    const Q = c.q * (1 - TR.push), Qc = clamp(Q, 0, 1);
    const cb = c.prev && c.m < 1 ? { bx: lerp(c.prev.bx, c.cell.bx, c.m), by: lerp(c.prev.by, c.cell.by, c.m) } : c.cell;
    const ex = cb.bx, ey = cb.by - sc, sx = kx(c.sx), sy = ky(c.sy);
    const x = lerp(sx, ex, Q), y = lerp(sy, ey, Q) - 34 * Math.sin(Math.PI * Qc), s = lerp(c.s0 * k, 1, Q);
    tf(c.el, `translate(${f2(x - c.w / 2)}px, ${f2(y - c.h)}px) scale(${s.toFixed(4)})`);
    const op = c.rec.hidden || c.rec.frz != null ? smooth(0, 0.3, Q).toFixed(3) : '';
    if (c.el.style.opacity !== op) c.el.style.opacity = op;
    c.lab.style.opacity = (smooth(0.7, 1, Q) * (1 - 0.6 * (c.rec.mv || 0))).toFixed(3);
    c.r = { x: c.cell.bx - c.w / 2, y: c.cell.by - sc - c.h, w: c.w, h: c.h };   // 拿起来 / 放回去用的位置
  });
  const ho = (smooth(0.55, 1, P) * TR.hf).toFixed(3);
  TR.heads.forEach(h => { h.el.style.opacity = ho; tf(h.el, `translate(${f2(h.x)}px, ${f2(h.y - sc)}px)`); });
  // 名牌：骑在托盘前沿上，变大一号；箭头从“›”转成朝上（往上推收起）
  const nx = R.x + lerp(TR.nameFrom.x - f.x, 14, P), ny = R.y + R.h - lerp(10, 12, P);
  tf(TL.name, `translate(${f2(nx)}px, ${f2(ny)}px) scale(${lerp(k, 1.3, P).toFixed(4)})`);
  TL.name.style.rotate = lerp(TR.nameFrom.rot, -1.2, Pc).toFixed(2) + 'deg';
  TL.name.style.setProperty('--o', Pc.toFixed(3));
  // 东西多到要滚时，把托盘里的东西裁在托盘里面
  const clip = TR.maxScroll > 0 && P > 0.98 && !TR.closing
    ? `inset(${TY + TG.rim}px ${390 - TRAY.x - TRAY.w + TG.rim}px ${844 - TY - TH + TG.rim}px ${TRAY.x + TG.rim}px round 17px)` : '';
  if (TL.items.style.clipPath !== clip) TL.items.style.clipPath = clip;
}

// ---------- 6 冷冻抽屉（只有默认界面） ----------
// 拖着“我的”“共用”的东西到下面的冷冻抽屉上（离企鹅够远）：抽屉面往外滑出 34 像素、稍微放大，上面露出一道冷冻腔；
// 离开就关上；在上面松手：东西缩小掉进去（下半截被抽屉面挡住），抽屉推回去带一下回弹、冒两三缕冷气，胶带上的件数滚一格。
// 白卡上的“放进冷冻”自动演一遍。抽屉开合量 DW.o 和掉落都由补间写（时间的纯函数）；拖的时候进没进抽屉区看手指。
// 抽屉在冰箱那一层里（跟着冰箱一起缩、一起转），拿起来的东西在最上层：两边用 toScr / toLoc 换算（托盘开着时冰箱缩了 k）。
const DRW = { x: 17.7, y: 621.6, w: 356, h: 127.4 };
const DW = { F: null, o: 0, tg: 0, busy: false, lx: 150 };
const dwDy = o => 34 * o, dwS = o => 1 + 0.04 * o;
const dwTop = o => DRW.y + dwDy(o) - DRW.h * (dwS(o) - 1) / 2;   // 抽屉面此刻的上沿（冰箱里的坐标）
const kNow = () => (TR.on ? 1 - 0.06 * clamp(TR.p * (1 - TR.push), 0, 1) : 1);
const toScr = (x, y, k = kNow()) => ({ x: KO.x + (x - KO.x) * k, y: KO.y + (y - KO.y) * k });
const toLoc = (x, y, k = kNow()) => ({ x: KO.x + (x - KO.x) / k, y: KO.y + (y - KO.y) / k });
function initFreezer() {
  FR.forEach(F => {
    const w = div('frz'), cav = div('dcav'), stuff = div('dstuff'), drop = new Image(), face = new Image();
    drop.className = 'ddrop'; drop.alt = ''; drop.draggable = false;
    face.className = 'dface'; face.alt = ''; face.draggable = false; face.src = D.img + (F.i === 0 ? 'drawer-front.webp' : 'drawer-front-b.webp');
    // 腔里已经冻着的几样：只露个结霜的顶
    [[30, -13, 74, 44], [146, -6, 50, 40], [226, -17, 88, 46], [318, -4, 26, 40]].forEach(([x, y, ww, hh]) => {
      const i = document.createElement('i'); Object.assign(i.style, { left: x + 'px', top: y + 'px', width: ww + 'px', height: hh + 'px' }); stuff.append(i);
    });
    cav.append(stuff);
    const puffs = [0, 1, 2].map(() => div('puff'));
    w.append(cav, drop, face, ...puffs);
    F.root.insertBefore(w, F.ftags);
    const tape = F.ftags.querySelector('.tapewrap'), tp = F.ftags.querySelector('.tp');
    F.ftags.style.transformOrigin = `${(DRW.x + DRW.w / 2 - 34).toFixed(1)}px ${(DRW.y + DRW.h / 2 - 624).toFixed(1)}px`;   // 胶带跟着抽屉面一起动
    const m = ((tp && tp.textContent) || '').match(/\d+/);
    F.frz = m ? +m[0] : 0;
    F.dw = { w, cav, stuff, drop, face, puffs, tape, tp, dropOn: false, pf: [0, 0, 0], px: [0, 0, 0], tk: 0, dp: { x: 0, rel: 0, s: 1, w: 0, h: 0 } };
    // 冷冻里的东西（data.js 的 frozen，分两层）：和“+N”里收着的一样，层板上没有位置，只在冷冻托盘上出现。件数按这里算
    if (!F.data.frozen) F.data.frozen = [];
    F.data.frozen.forEach((z, k) => z.items.forEach(it => { const g = ghost(it); F.recs[it.id] = { it, el: g.el, img: g.img, st: null, r: { x: 175, y: 650, w: 40, h: 40 }, F, frz: k }; }));
    F.frz = frzCount(F);
    // 点抽屉面（连上面的“冷冻 · N 件”胶带）：拉出冷冻托盘。横着划还是转镜头（bindPull 里管）
    const hit = div('dhit');
    Object.assign(hit.style, { left: DRW.x + 'px', top: (DRW.y - 4) + 'px', width: DRW.w + 'px', height: (DRW.h - 30) + 'px' });
    F.root.append(hit); bindPull(F, hit, 'z'); F.dhit = hit;
  });
}
function dwSet(tg, F = DW.F || cur) {
  if (DW.tg === tg && (DW.F === F || !tg)) return;
  if (tg && DW.F && DW.F !== F) DW.o = 0;
  DW.F = F; DW.tg = tg; cancel('dw');
  const o0 = DW.o, w = tg ? 13 : 15, z = tg ? .6 : .85;
  tween(springMs(w, z), e => { DW.o = Math.max(0, spring(e, o0, tg, 0, w, z).x); }, { tag: 'dw', done: () => { DW.o = tg; } });
}
// 拖着的时候：手指过了 dwEdge（抽屉面上沿往上 6 像素；也是最底层竖条的下沿，见 shelfAt）、东西离企鹅够远，就开；手指往上离开（留 16 像素余量免得来回闪）就关
function dwEdge() { return toScr(0, DRW.y).y - 6; }
function dwZone() {
  if (DW.busy || (L.rec && L.rec.frz != null)) return;   // 冻着的东西（从冷冻托盘上拖出来的）不管抽屉
  const F = (L.rec && L.rec.F) || cur, it = L.rec && L.rec.it;
  const near = Math.hypot(L.cx - PC.x, L.cy - PC.y) < 120;
  const inX = DR.fx > 8 && DR.fx < 382;
  // 别人的、没人认的（只能挪）：桶不出来，但拖到左下角桶那块（和 bin.js 接东西的范围 ZIN 一样：东西中心 x < 142、y > 712）抽屉也不开，松手飞回去
  const corner = binOn() && it && !draggable(it) && L.cx < 142 && L.cy > 712;
  const inZ = it && movable(it) && !near && inX && DR.fy > dwEdge() - (DW.tg === 1 ? 16 : 0) && !(binOn() && BIN.hovering) && !corner;   // 在垃圾桶上：抽屉不开
  dwSet(inZ ? 1 : 0, F);
}
// 东西掉进抽屉（拖到抽屉上松手，或者白卡上点了“放进冷冻”飞过来之后）
function dropFreeze() {
  const rec = L.rec, F = rec.F || cur, d = F.dw;
  trace('freeze ' + rec.it.id);
  mode = 'busy'; DW.busy = true; cancel('dscale'); cancel('doff'); cancel('lift'); cancel('frz');
  if (DW.tg !== 1 || DW.F !== F) dwSet(1, F);
  L.tiltOn = false; L.bobA = 0; P.ringT = 0;
  const k = kNow(), FT = dwTop(1), lx = clamp(toLoc(L.cx, 0, k).x, 70, 300);
  DW.lx = lx;
  const hS = 0.4, rel0 = -L.h * hS / 2 - 3, tgt = toScr(lx, FT + rel0 + 2, k);
  const f = { cx: L.cx, cy: L.cy, s: L.s, rz: L.rz, rx: L.rx, ry: L.ry, sh: L.shOp };
  // 一：飞到口子正上方、缩小、摆正
  tween(200, e => {
    const q = easeOut(e / 200);
    L.cx = lerp(f.cx, tgt.x, q); L.cy = lerp(f.cy, tgt.y, q) - 10 * Math.sin(Math.PI * q); L.s = lerp(f.s, hS * k, q);
    L.rz = f.rz * (1 - q); L.rx = f.rx * (1 - q); L.ry = f.ry * (1 - q); L.shOp = f.sh * (1 - q);
  }, { tag: 'frz', done: () => {
    // 二：换成抽屉里那一份（在抽屉面后面），往下掉
    d.drop.src = liftImg.src; d.drop.style.width = L.w + 'px'; d.drop.style.height = L.h + 'px';
    Object.assign(d.dp, { x: lx, rel: rel0, s: hS, w: L.w, h: L.h }); d.dropOn = true;
    hideLift(); removeItem(rec);
    addFrozen(F, rec, DW.zone || 0); DW.zone = 0;   // 真的放进冷冻（默认上层；编辑面板选了下层就进下层），计划清掉
    tween(360, e => { const q = easeIn(e / 360); d.dp.rel = lerp(rel0, 34, q); d.dp.s = lerp(hS, 0.3, q); }, { tag: 'frz', done: () => { d.dropOn = false; } });
  } });
  // 三：推回去，带一下回弹
  at(520, () => { cancel('dw'); DW.tg = 0; const o0 = DW.o; tween(springMs(15, .5), e => { DW.o = Math.abs(spring(e, o0, 0, 0, 15, .5).x); }, { tag: 'dw', done: () => { DW.o = 0; } }); }, 'frz');
  // 冷气：三小缕从缝里冒出来
  [0, 1, 2].forEach(i => {
    d.px[i] = lx + (i - 1) * 46 + (i === 1 ? 0 : 8 * (i - 1));
    tween(950, e => { d.pf[i] = e / 950; }, { delay: 630 + i * 90, tag: 'frz', done: () => { d.pf[i] = 0; } });
  });
  // 胶带：件数滚一格，胶带弹一下
  at(670, () => {
    const n1 = frzCount(F), n0 = n1 - 1; F.frz = n1;   // 件数按冷冻里真有的东西算
    if (d.tp) {
      d.tp.innerHTML = `冷冻 · <span class="roll"><span><span>${n0}</span><span>${n1}</span></span></span> 件`;
      const col = d.tp.querySelector('.roll > span');
      tween(springMs(16, .62), e => { col.style.transform = `translateY(${(-17 * spring(e, 0, 1, 0, 16, .62).x).toFixed(2)}px)`; },
        { tag: 'frz', done: () => { d.tp.textContent = `冷冻 · ${n1} 件`; } });
    }
    tween(springMs(18, .35), e => { d.tk = spring(e, .16, 0, 0, 18, .35).x; }, { tag: 'frz', done: () => { d.tk = 0; } });
  }, 'frz');
  // 气泡：先收起，说一句“放进冷冻了”，过一会儿换回这台自己的话
  cancel('bub'); BUB.out = false;
  const b0 = +bubble.style.opacity || 0;
  tween(140, e => { bubble.style.opacity = (b0 * (1 - e / 140)).toFixed(3); }, { tag: 'bub' });
  const say = (html, delay) => at(delay, () => {
    if (F !== cur) return;
    bubble.innerHTML = BUB.html = typeof html === 'function' ? html() : html;
    tween(260, e => { const p = easeOut(e / 260); bubble.style.opacity = p.toFixed(3); bubble.style.translate = `0 ${((1 - p) * 4).toFixed(2)}px`; }, { tag: 'bub' });
  }, 'bub');
  say('放进冷冻了', 760);
  tween(140, e => { bubble.style.opacity = (1 - e / 140).toFixed(3); }, { delay: 760 + 2600, tag: 'bub' });
  say(() => F.bubble, 760 + 2600 + 150);   // 到时候再取：冻进去以后件数可能变了
  at(1100, () => { mode = 'open'; DW.busy = false; }, 'frz');
}
// 白卡上的“放进冷冻”：卡收起，东西从半空划到抽屉上方，抽屉开了接住
function freezeFromPick() {
  const F = L.rec.F || cur;
  trace('freeze from sheet');
  mode = 'busy'; DW.busy = true; closeSheet(); dimTo(false); removeModel(); cancel('lift');
  L.tiltOn = false; L.bobA = 0;
  const f = { cx: L.cx, cy: L.cy, s: L.s, rx: L.rx, ry: L.ry }, dur = 560, k = kNow();
  const lx = clamp(toLoc(L.cx, 0, k).x, 120, 260), to = toScr(lx, dwTop(1) - 44, k);
  DW.lx = lx;
  cancel('bub'); BUB.out = false; { const b0 = +bubble.style.opacity || 0; tween(140, e => { bubble.style.opacity = (b0 * (1 - e / 140)).toFixed(3); }, { tag: 'bub' }); }
  at(200, () => dwSet(1, F), 'frz');
  tween(dur, e => {
    const q = e / dur, kk = q * q * (3 - 2 * q);
    L.cx = lerp(f.cx, to.x, kk); L.cy = lerp(f.cy, to.y, kk) - 70 * Math.sin(Math.PI * kk);
    L.s = lerp(f.s, 92 / 170, smooth(0, .7, q)); L.rx = f.rx * (1 - q); L.ry = f.ry * (1 - q); L.rz = -10 * Math.sin(Math.PI * kk); L.shOp = 0.6 * (1 - q);
  }, { tag: 'lift', done: () => { DW.busy = false; dropFreeze(); } });
}
function renderFrz() {
  const hb = DW.tg === 1 || !DW.busy ? clamp(DW.o, 0, 1) : 0, h = Math.max(hb, clamp(PK.p, 0, 1));   // 抽屉开着、企鹅探着头时气泡让开
  const bf = h > 1e-3 ? `opacity(${(1 - h).toFixed(3)})` : '';
  if (bubble.style.filter !== bf) bubble.style.filter = bf;
  FR.forEach(F => {
    const d = F.dw; if (!d) return;
    const o = DW.F === F ? DW.o : 0, puff = d.pf.some(p => p > 0), show = o > 1e-4 || d.dropOn || puff || d.tk !== 0;
    const disp = show ? 'block' : 'none';
    if (d.w.style.display !== disp) d.w.style.display = disp;
    const ft = o > 1e-4 || d.tk ? `translateY(${dwDy(o).toFixed(2)}px) scale(${dwS(o).toFixed(4)})` : '';
    tf(F.ftags, ft);
    if (d.tape) tf(d.tape, d.tk ? `scale(${(1 + d.tk).toFixed(4)})` : '');
    if (!show) return;
    tf(d.face, `translateY(${dwDy(o).toFixed(2)}px) scale(${dwS(o).toFixed(4)})`);
    const oc = clamp(o, 0, 1);
    d.face.style.filter = oc > 1e-3 ? `drop-shadow(0 -2px 4px rgba(2, 16, 18, ${(.5 * oc).toFixed(3)}))` : '';
    d.cav.style.opacity = clamp(o * 5, 0, 1).toFixed(3);
    tf(d.stuff, `translateY(${(dwTop(o) - DRW.y).toFixed(2)}px)`);
    if (d.dropOn) {
      const dp = d.dp, y = dwTop(o) + dp.rel;
      d.drop.style.display = 'block';
      tf(d.drop, `translate(${f2(dp.x - dp.w / 2)}px, ${f2(y - dp.h / 2)}px) scale(${dp.s.toFixed(4)})`);
    } else if (d.drop.style.display !== 'none') d.drop.style.display = 'none';
    const top = dwTop(o);
    d.puffs.forEach((el, i) => {
      const p = d.pf[i];
      el.style.opacity = p > 0 ? (0.6 * Math.sin(Math.PI * p)).toFixed(3) : '0';
      if (p > 0) tf(el, `translate(${f2(d.px[i] - 23 + (i - 1) * 10 * p)}px, ${f2(top - 16 - 30 * p)}px) scale(${(0.55 + 0.9 * p).toFixed(3)})`);
    });
  });
  // 托盘开着时拖过来：压暗层在抽屉那里开个洞，抽屉从暗处亮出来
  if (TL) {
    const o = TR.on ? clamp(DW.o, 0, 1) : 0;
    let mk = '';
    if (o > 1e-3) { const c = toScr(195, DRW.y + 30); mk = `radial-gradient(ellipse 230px 96px at ${c.x.toFixed(1)}px ${c.y.toFixed(1)}px, rgba(0,0,0,${(1 - 0.95 * o).toFixed(3)}) 55%, #000 100%)`; }
    if (TL.dim.style.webkitMaskImage !== mk) { TL.dim.style.webkitMaskImage = mk; TL.dim.style.maskImage = mk; }
  }
}

// ---------- 8 详情卡上的“开了”“更新”、冷冻里的东西（只有默认界面） ----------
// “开了”：记下开了，计划从现在重新起算（没计划或“说不准”的改成“这几天吃”），按钮变成灰的“已开”。
// “更新”：卡里展开编辑面板（归属 / 打算什么时候吃？/ 区域），保存才生效，取消什么都不变。
// 区域换到别的层：数据马上改，东西放回去时落到新位置，原来那层在回到冰箱画面后补位（“9 层板补位”）；
// 换到冷冻：和点“放进冷冻”一样演一遍，掉进选的那一层。
// 冷冻里的东西 rec.frz = 第几层（0 上层 / 1 下层），el 是不挂在页面上的替身，只在冷冻托盘上露面。
function frzCount(F) { return (F.data.frozen || []).reduce((n, z) => n + z.items.length, 0); }
// 这台冰箱里所有东西：层板上的、各层“+N”里收着的、冷冻里的
function allItems(F) {
  let l = F.data.items.slice();
  if (F.hid) Object.keys(F.hid).forEach(t => { l = l.concat(F.hid[t]); });
  else if (F.data.more && F.data.more.items) l = l.concat(F.data.more.items);
  (F.data.frozen || []).forEach(z => { l = l.concat(z.items); });
  return l;
}
// 不挂在页面上的替身（收在“+N”里、冻着的东西用）：拿起来、只看我的照样能往它身上写样式
function ghost(it) {
  const el = div('item ' + it.kind), img = new Image(); img.src = src(it.img); img.alt = ''; img.draggable = false; el.append(img);
  return { el, img };
}
// 东西现在在哪：'s层号' 或 'z冷冻层号'
function curZone(rec) { return rec.frz != null ? 'z' + rec.frz : 's' + (rec.hidden ? rec.ht : rec.it.t); }
// 托盘格子下面那行小字：我的写计划（开了的前面加“开了 · ”），冻着的、别人的写放了几天
function tInfo(rec) {
  const it = rec.it;
  if (it.kind === 'mine' && rec.frz == null) return it.plan ? (it.opened ? '开了 · ' : '') + it.plan : '';
  return it.days != null ? `放了 ${it.days} 天` : '';
}
// 冷冻托盘上每样东西右上角的主人贴纸
function tstSet(s, it) {
  const txt = it.kind === 'unknown' ? '?' : it.kind === 'shared' ? '共' : it.kind === 'mine' ? '我' : it.owner;
  s.className = 'tst' + (txt === '共' ? ' shared' : txt === '?' ? ' ask' : '');
  s.textContent = txt; s.style.background = D.owners[txt] || '';
}
// 给 skin.js 的 sheetHTML 拼“此刻的状态”
function sheetEx(rec) {
  const F = rec.F || cur, fz = rec.frz != null;
  return { where: fz ? F.data.frozen[rec.frz].label : rec.hidden ? F.data.shelves[rec.ht].label : undefined, frozen: fz, edit: ED && ED.rec === rec ? ED : null,
    mk: window.MARKS ? MARKS.sheet(rec) : null,   // 记号带来的那几行（marks.js）：{ meta, btns, replace }
    // 第四步：due 处理掉换不换鱼；paused 我不在、计划暂停着（没有“开了”）；thaw 解冻那两行的草稿
    due: isDue(rec), paused: !fz && !!window.MARKS && MARKS.planState(rec.it) === 'paused', thaw: TH && TH.rec === rec ? TH : null };
}
// 编辑面板“区域”里能选的：这台冰箱的每一层（别人的层也能放，照产品：挪东西不分谁的层），再加冷冻两层。
// 第四步起放满了（4 件）也照样能选（skin.js 不再灰掉“满了”），多出来的收进那层的“+N”；full 只是留着给别处读
function zonesFor(rec) {
  const F = rec.F, cz = curZone(rec), out = [];
  F.data.shelves.forEach((s, t) => {
    const v = 's' + t;
    const n = F.data.items.filter(i => i.t === t).length + ((F.hid && F.hid[t]) || []).length;
    out.push({ v, label: s.label, full: v !== cz && n >= 4, stamp: !!s.full });   // stamp：第五步手动标了“满了”（skin.js 画章）
  });
  (F.data.frozen || []).forEach((z, k) => out.push({ v: 'z' + k, label: z.label, full: false }));
  return out;
}
// 卡的内容重画；卡变高了从原来的上沿弹上去（卡贴着屏幕底，变高是往上长）
function refill(rec) {
  SLK.t0 = clock(); SLK.t1 = SLK.t0 + 400;   // 防连点：见 sheetLocked
  const h0 = sheet.offsetHeight; fillSheet(rec); const h1 = sheet.offsetHeight;
  if (h1 > h0 + 1) {
    cancel('sheet'); const y0 = sheetY + h1 - h0; setSheetY(y0);
    tween(springMs(16, .78), e => setSheetY(spring(e, y0, 0, 0, 16, .78).x), { tag: 'sheet' });
  }
  liftFit();
}
// 拿起来的东西让开详情卡：编辑面板开着时卡变高，东西往上挪（还不够就缩一点），整个露在卡上沿之上；
// 面板收起回到原来的位置（中心 y 300）和大小（1）。真模型挂在 #lift 里，跟着一起挪、一起缩，拨着转不受影响
function liftFit() {
  if (!A || mode !== 'picked' || !L.rec) return;
  const top = 844 - sheet.offsetHeight;   // 卡弹到位后的上沿
  const s1 = ED ? clamp((top - 120) / L.h, 0.6, 1) : 1;
  const cy1 = ED ? Math.min(300, top - 16 - L.h * s1 / 2) : 300;
  if (Math.abs(cy1 - L.cy) < 0.5 && Math.abs(s1 - L.s) < 0.005) return;
  cancel('lfit');
  const f = { cy: L.cy, s: L.s }, w = 14, z = 0.8;
  tween(springMs(w, z), e => {
    if (mode !== 'picked') return;   // 半路放回去、拖走了：交给那边的动画
    const p = spring(e, 0, 1, 0, w, z).x; L.cy = lerp(f.cy, cy1, p); L.s = lerp(f.s, s1, p);
  }, { tag: 'lfit' });
}
// 卡上沿再往上一点（提示出在卡的上面）
const aboveSheet = () => clamp(844 - sheet.offsetHeight - 50, 104, 700);
function markOpened(rec) {
  const it = rec.it; if (it.opened) return;
  trace('opened ' + it.id);
  // 记下标之前的计划，改回没开时还原；mark 是标完那一刻的计划，之后在“更新”里改过就不还原
  const prev = { has: 'plan' in it, plan: it.plan, hasAt: 'planAt' in it, planAt: it.planAt };
  it.opened = true; it.planAt = nowT;
  if (!it.plan || it.plan === '说不准') it.plan = '这几天吃';
  it.openUndo = { prev, mark: { plan: it.plan, planAt: it.planAt } };
  if (rec.tv) rec.tv.lab.querySelector('.ti').textContent = tInfo(rec);
  refill(rec);
  toast('计划已从现在重新起算', aboveSheet(), { label: '撤销', ms: 5000, rec, fn: () => unOpen(rec) });   // rec：只在还拿着它、面板没开时有效（见 undoLive）
}
// 改回没开（点“已开”，或提示条上的“撤销”）：opened 变回 false；标完以后没再改过计划，计划和起算时间也还原
function unOpen(rec) {
  const it = rec.it; if (!it.opened) return;
  trace('unopened ' + it.id);
  const u = it.openUndo; it.opened = false; delete it.openUndo;
  if (u && it.plan === u.mark.plan && it.planAt === u.mark.planAt) {
    if (u.prev.has) it.plan = u.prev.plan; else delete it.plan;
    if (u.prev.hasAt) it.planAt = u.prev.planAt; else delete it.planAt;
  }
  if (rec.tv) rec.tv.lab.querySelector('.ti').textContent = tInfo(rec);
  if (mode === 'picked' && L.rec === rec) refill(rec);   // 卡还开着：重画；已经放回去了就只改数据
  toast('已改回没开', mode === 'picked' ? aboveSheet() : 104);
}
function openEdit(rec) {
  const it = rec.it;
  ED = { rec, own: it.ask ? 'ask' : it.kind === 'shared' ? 'shared' : it.kind === 'unknown' ? 'unknown' : 'mine', plan: it.plan || '说不准', zone: curZone(rec), zones: zonesFor(rec) };   // 归属四种（第四步）
  trace('edit ' + it.id);
  refill(rec);
}
function closeEdit() { if (!ED) return; const rec = ED.rec; ED = null; refill(rec); }
// 编辑面板里点了一个选项：只改草稿和高亮，不重画
function pickOpt(b) {
  const box = b.parentNode, k = box.dataset.k, o = ED || TH; if (!k || !o) return;   // TH：解冻那两行（第四步）
  o[k] = b.dataset.v;
  box.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
  if (ED && k === 'zone') { const ed = sheet.querySelector('.edit'); if (ed) ed.classList.toggle('cold', ED.zone[0] === 'z'); }
  tween(200, e => { b.style.transform = `scale(${1 - 0.05 * Math.sin(Math.PI * e / 200)})`; }, { done: () => { b.style.transform = ''; } });
}
function saveEdit() {
  const e = ED; if (!e) return;
  const rec = e.rec, it = rec.it, F = rec.F; ED = null;
  trace('save ' + it.id + ' ' + e.own + ' ' + e.plan + ' ' + e.zone);
  // 归属四种（第四步）：需询问 = 还是这个人的（我的、别人的保持原样，共用的变成我的），只是记一个 ask；层板上不加贴纸
  const kind = e.own === 'ask' ? (it.kind === 'shared' || it.kind === 'unknown' ? 'mine' : it.kind) : e.own;
  if (e.own === 'ask') it.ask = true; else delete it.ask;
  if (kind !== it.kind) { it.kind = kind; restyle(rec); }
  const cz = curZone(rec), toZ = e.zone[0] === 'z', k = +e.zone.slice(1);
  // 计划：换到冷冻的不设计划；换了才重新起算
  if (!toZ && e.plan !== (it.plan || '说不准')) { it.plan = e.plan; it.planAt = nowT; }
  if (e.zone !== cz) {
    if (toZ && rec.frz == null) { DW.zone = k; toast('记录已更新'); freezeFromPick(); return; }   // 层板 → 冷冻：和“放进冷冻”一样
    if (toZ) {   // 冷冻上层 ↔ 下层：只挪数据，冷冻托盘回到 open 后重排
      const z0 = F.data.frozen[rec.frz]; z0.items = z0.items.filter(i => i !== it);
      rec.frz = k; F.data.frozen[k].items.push(it); if (TR.on && TR.frz) TR.dirty = true;
    } else { detach(rec); placeOnShelf(F, rec, k); }   // 换到别的层（或从冷冻拿出来）：放回去时落到新位置
  }
  if (rec.tv) rec.tv.lab.querySelector('.ti').textContent = tInfo(rec);
  refill(rec); toast('记录已更新', aboveSheet());
}
// 归属变了：东西的样子（别人的淡）、贴纸、托盘上那一份跟着换
function restyle(rec) {
  const k = rec.it.kind, KS = ['mine', 'shared', 'other', 'unknown'];
  rec.el.classList.remove(...KS); rec.el.classList.add(k);
  if (rec.tv) {
    rec.tv.el.classList.remove(...KS); rec.tv.el.classList.add(k);
    const s = rec.tv.box.querySelector('.tst'); if (s) tstSet(s, rec.it);
  }
  if (rec.frz == null && !rec.hidden && rec.el.parentNode) setSticker(rec);
  rec.mk = null;
}
// 冷冻里拿出来：我的回我的层，共用的回有空位的“大家都能放”，都满了就收进那层的“+N”
function thawShelf(F, it) {
  const sh = F.data.shelves, n = t => F.data.items.filter(i => i.t === t).length, h = t => ((F.hid && F.hid[t]) || []).length;
  if (it.kind === 'mine') { const t = sh.findIndex(s => s.mine); if (t >= 0) return t; }
  const pub = sh.map((s, t) => t).filter(t => sh[t].label.includes('大家都能放'));
  return pub.find(t => !h(t) && n(t) < 4) ?? (pub[0] != null ? pub[0] : 0);
}
// 第四步：点“拿出来解冻”先在卡上展开两行（放回哪一层：默认是 thawShelf 选的那层；打算什么时候吃：默认说不准），点“放回去”才飞
function openThaw(rec) {
  const F = rec.F, t0 = thawShelf(F, rec.it), sh = F.data.shelves;
  const zones = sh.map((s, t) => ({ v: 's' + t, label: s.label, t, stamp: !!s.full })).filter(z => sh[z.t].mine || sh[z.t].label.includes('大家都能放') || z.t === t0);
  TH = { rec, t: 's' + t0, plan: '说不准', zones };
  trace('thaw panel ' + rec.it.id);
  refill(rec);
}
function closeThaw() { if (!TH) return; const rec = TH.rec; TH = null; refill(rec); }
function thawGo() {
  const e = TH; if (!e) return; TH = null;
  const it = e.rec.it;
  it.plan = e.plan; if (e.plan !== '说不准') it.planAt = nowT;   // 定了计划就从今天起算
  thaw(e.rec, +e.t.slice(1));
}
function thaw(rec, tt) {
  const F = rec.F, t = tt != null ? tt : thawShelf(F, rec.it);
  trace('thaw ' + rec.it.id + ' -> ' + t);
  if (!(TR.on && TR.frz)) { detach(rec); placeOnShelf(F, rec, t); toast('已拿出来解冻'); unpick(); return; }
  // 冷冻托盘开着（平常都是）：一、卡收起，拿着的东西缩回抽屉口，同时冷冻托盘收起、抽屉跟着关；
  // 二、托盘收好后，东西从抽屉那儿飞出来落到层板上（那层满了就飞进“+N”格，格子弹一下、数字这时才变）
  const m0 = F.moreEls && F.moreEls[t], n0 = ((F.hid && F.hid[t]) || []).length;
  detach(rec); placeOnShelf(F, rec, t);
  const hid = !!rec.hidden, m = F.moreEls && F.moreEls[t];
  if (hid && m && m === m0 && n0 && m.firstChild) m.firstChild.textContent = '+' + n0;   // 先显示旧数，落进去时再变
  toast('已拿出来解冻');
  mode = 'busy'; closeSheet(); dimTo(false); removeModel();
  cancel('lift'); cancel('lfit');
  L.tiltOn = false; L.bobA = 0;
  const k = kNow(), mouth = toScr(195, dwTop(1) + 6, k), f = { cx: L.cx, cy: L.cy, s: L.s, rx: L.rx, ry: L.ry, rz: L.rz, sh: L.shOp, up: L.up };
  tween(300, e => {
    const q = easeIn(e / 300);
    L.cx = lerp(f.cx, mouth.x, q); L.cy = lerp(f.cy, mouth.y, q); L.s = lerp(f.s, 0.12, q);
    L.rx = f.rx * (1 - q); L.ry = f.ry * (1 - q); L.rz = f.rz * (1 - q); L.shOp = f.sh * (1 - q); L.up = f.up * (1 - q);
  }, { tag: 'lift', done: () => { L.rec = null; liftEl.style.display = 'none'; lshadow.style.display = 'none'; } });
  const dur = closeTray(true);
  at(Math.max(dur, 300) + 140, () => {
    // 二：从关上的抽屉上沿冒出来（小、贴着抽屉），弧线飞到层板上的位置（flyBack 管落地压扁）
    prepLift(rec);
    Object.assign(L, { cx: 195, cy: DRW.y + 14, s: 0.2, up: 0, shOp: 0, rx: 0, ry: 0, rz: 0 });
    if (!hid || !m) { flyBack(() => { mode = 'open'; }); return; }
    // 进“+N”：路上长到层板上东西的大小（看得清是什么），快到格子时缩进去；格子弹一下，数字这时才变
    const b = moreBox(F, t), f = { cx: L.cx, cy: L.cy }, sMid = 52 / L.h, sEnd = 20 / L.h, dur = 640;
    tween(dur, e => {
      const q = smooth(0, dur, e);
      L.cx = lerp(f.cx, b.x, q); L.cy = lerp(f.cy, b.y, q) - 70 * Math.sin(Math.PI * q);
      L.s = e < dur * 0.7 ? lerp(0.2, sMid, easeOut(e / (dur * 0.7))) : lerp(sMid, sEnd, easeIn((e - dur * 0.7) / (dur * 0.3)));
    }, { tag: 'lift', done: () => {
      hideLift(); mode = 'open';
      updateMore(F, t, true);   // 数字变成新的
      cancel('nbump');
      tween(springMs(20, .38), e => { m.style.transform = `scale(${(1 + 0.35 * spring(e, 1, 0, 0, 20, .38).x).toFixed(4)})`; }, { tag: 'nbump', done: () => { m.style.transform = ''; } });
    } });
  }, 'thaw');
}
// 掉进冷冻（dropFreeze 里 removeItem 之后调）：数据放进冷冻第 k 层，计划清掉
function addFrozen(F, rec, k) {
  const it = rec.it;
  ['plan', 'opened', 'planAt', 't', 's', 'sticker'].forEach(f => delete it[f]);
  if (!F.data.frozen[k]) k = 0;
  F.data.frozen[k].items.push(it);
  const g = ghost(it);
  Object.assign(rec, { el: g.el, img: g.img, st: null, frz: k, hidden: false, mk: null, r: { x: 175, y: 650, w: 40, h: 40 } }); delete rec.ht;
  F.recs[it.id] = rec;
}
// 胶带上的件数按冷冻里真有的东西改；anim：数字滚一格（往上加、往下减）
function tapeTo(F, anim) {
  const n0 = F.frz, n1 = frzCount(F); F.frz = n1;
  if (TR.on && TR.frz && TR.F === F) TL.name.innerHTML = `<span class="tp">冷冻 · ${n1} 件${CHEV}</span>`;
  const d = F.dw; if (!d || !d.tp) return;
  cancel('tape' + F.i);
  if (!anim || n0 === n1) { d.tp.textContent = `冷冻 · ${n1} 件`; return; }
  const up = n1 > n0;
  d.tp.innerHTML = `冷冻 · <span class="roll"><span><span>${up ? n0 : n1}</span><span>${up ? n1 : n0}</span></span></span> 件`;
  const col = d.tp.querySelector('.roll > span'), a = up ? 0 : 1, b = up ? 1 : 0;
  col.style.transform = `translateY(${-17 * a}px)`;
  tween(springMs(16, .62), e => { col.style.transform = `translateY(${(-17 * spring(e, a, b, 0, 16, .62).x).toFixed(2)}px)`; },
    { tag: 'tape' + F.i, delay: 200, done: () => { d.tp.textContent = `冷冻 · ${n1} 件`; } });
}
// 页面上方的一行提示（2.2 秒后自己淡掉）。y：上沿
const TO = { el: null, text: '', rec: null, ghost: null };
// 带动作的形态（默认界面“开了”之后的“撤销”）：act = { label, fn, ms, rec }，提示条右边多一个按钮、停 ms 毫秒，点整条都执行 fn 并收起。
// 带 rec 的只在“还拿着这一样、编辑面板没开”时有效；不再满足就马上收掉（每帧查，见 keepUndo），收掉以后不接点击也不撤
const undoLive = () => !TO.rec || (mode === 'picked' && L.rec === TO.rec && !ED && !!TO.rec.it.opened);
function dropUndo() {
  const el = TO.el, o0 = +el.style.opacity || 0;
  TO.act = null; TO.rec = null; TO.text = ''; el.style.pointerEvents = 'none';
  cancel('toast');
  tween(120, e => { el.style.opacity = (o0 * (1 - e / 120)).toFixed(3); }, { tag: 'toast', done: () => { el.style.display = 'none'; } });
}
function keepUndo() { if (TO.act && TO.rec && !undoLive()) dropUndo(); }
// 提示条在手机画面里的框（上下各多 5：点得到的 44 高）
function toastBox() {
  const r = TO.el.getBoundingClientRect(), f = frameEl.getBoundingClientRect();
  return { x0: (r.left - f.left) / SC, y0: (r.top - f.top) / SC - 5, x1: (r.right - f.left) / SC, y1: (r.bottom - f.top) / SC + 5 };
}
// 点暗处时落在带撤销的提示条四周约 12 的缓冲区里（或提示条到点自己淡掉后 0.5 秒里的原位置）：什么都不做，不放回
// 左右 14（框的边常是小数，留 2 的余量，点在“外 12”上也稳稳算在里面），上下在 44 高的热区外再 12（离药丸 17）；外 20 照常放回
function nearToast(e) {
  if (!A || !TO.el) return false;
  const r = TO.act && undoLive() ? toastBox() : TO.ghost && clock() < TO.ghost.until ? TO.ghost.r : null;
  if (!r) return false;
  const p = loc(e), mx = 14, my = 12;
  return p.x >= r.x0 - mx && p.x <= r.x1 + mx && p.y >= r.y0 - my && p.y <= r.y1 + my;
}
function toast(text, y = 104, act) {
  if (!TO.el) {
    TO.el = div(''); TO.el.id = 'toast'; phone.insertBefore(TO.el, $('#celebrate'));
    TO.el.addEventListener('click', e => {
      if (!TO.act || !undoLive()) return;
      e.stopPropagation(); nowT = clock();
      const fn = TO.act.fn; TO.act = null; TO.rec = null; fn();
    });
  }
  TO.act = act || null; TO.text = text; TO.rec = (act && act.rec) || null; TO.ghost = null; TO.el.style.pointerEvents = '';
  if (act) { TO.el.textContent = ''; TO.el.append(div('tmsg', text)); const b = document.createElement('button'); b.type = 'button'; b.className = 'tact'; b.textContent = act.label; TO.el.append(b); }
  else TO.el.textContent = text;
  TO.el.classList.toggle('act', !!act);
  TO.el.style.top = y + 'px'; TO.el.style.display = act ? 'flex' : 'block';
  cancel('toast');
  const ms = act ? act.ms || 5000 : 2200;
  tween(ms, e => {
    TO.el.style.opacity = (smooth(0, 160, e) * (1 - smooth(ms - 300, ms, e))).toFixed(3);
    TO.el.style.translate = `-50% ${((1 - easeOut(e / 260)) * 6).toFixed(2)}px`;
  }, { tag: 'toast', done: () => {
    if (TO.act && A) TO.ghost = { r: toastBox(), until: nowT + 500 };   // 带撤销的到点自己淡掉：之后 0.5 秒里点原位置也不放回
    TO.el.style.display = 'none'; TO.text = ''; TO.act = null; TO.rec = null;
  } });
}

// ---------- 9 层板补位（只有默认界面） ----------
// 一层最多 4 个位子。这层东西（层板上的 + “+N”里收着的）不超过 4 件：全摆出来、“+N”收掉；超过：摆 3 件，第 4 格是“+N”（N = 总数 - 3）。
// 拿走、挪走一样以后先记下哪层要补（queueN），回到冰箱画面（mode 为 open、没在收托盘）再一起补（flushN）：
// 剩下的往左弹过去，“+N”里的东西从“+N”格里冒出来变回普通的层板东西（贴纸、只看我的照常）。
// 从来没有“+N”的层（东西本来就隔着摆的）不挪。这层的托盘正开着：层板这边直接到位（藏在托盘后面），托盘收起时飞回新位置。
const ST_ROT = [-9, 7, -6, 10, -5, 8];
// 层板上的贴纸写什么：不知道谁的“?”、共用“共”；我的放在我的层不贴，别处贴“我”；别人的放在自己那层不贴，别处贴名字
function stickerFor(F, it) {
  if (it.kind === 'unknown') return '?';
  if (it.kind === 'shared') return '共';
  const s = F.data.shelves[it.t] || { label: '' };
  if (it.kind === 'mine') return s.mine ? '' : '我';
  return s.label.includes(D.ownerNames[it.owner] || '\u0000') ? '' : it.owner;
}
function placeSt(rec, x = rec.r.x) {
  const r = rec.r;
  Object.assign(rec.st.style, { left: (x + r.w - 12) + 'px', top: (r.y - 8) + 'px' });
}
function setSticker(rec, pop) {
  const F = rec.F, it = rec.it, txt = stickerFor(F, it);
  if (!txt) { if (rec.st) { rec.st.remove(); rec.st = null; } delete it.sticker; return; }
  if (it.kind !== 'unknown') it.sticker = txt;
  if (!rec.st) {
    rec.st = div('sticker'); F.shelf.append(rec.st);
    let h = 0; for (const ch of it.id) h = (h * 31 + ch.charCodeAt(0)) % 997;
    rec.st.style.rotate = ST_ROT[h % 6] + 'deg';
  }
  const st = rec.st;
  st.className = 'sticker' + (txt === '共' ? ' shared' : txt === '?' ? ' ask' : '') + (rec.el.classList.contains('intray') ? ' intray' : '');
  st.textContent = txt; st.style.background = D.owners[txt] || '';
  st.style.visibility = L.rec === rec ? 'hidden' : '';
  placeSt(rec); rec.mk = null;
  if (pop) { st.style.transform = 'scale(0)'; tween(springMs(20, .4), e => { st.style.transform = `scale(${Math.max(0, spring(e, 0, 1, 0, 20, .4).x).toFixed(4)})`; }, { tag: 'norm', delay: 220 }); }
  else st.style.transform = '';
}
// 给一样东西在层板上建一份（和 build() 里的一样）；正被拿着的先藏着，等它飞回来
function mkShelfEl(rec) {
  const F = rec.F, it = rec.it, r = rectOf(it), el = div('item ' + it.kind);
  Object.assign(el.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
  const im = new Image(); im.src = src(it.img); im.alt = ''; im.draggable = false; im.style.transition = 'transform .14s';
  el.append(im, div('hit'));
  F.shelf.insertBefore(el, F.shelf.querySelector('.sticker'));   // 压在贴纸下面
  if (L.rec === rec) el.style.visibility = 'hidden';
  if (TR.on && TR.F === F && TR.t === it.t) el.classList.add('intray');
  Object.assign(rec, { el, img: im, r, hidden: false, mk: null }); delete rec.ht;
  bindItem(rec); decorate(rec);
  return el;
}
// 名字小标签、黄标（只有默认界面「冰箱贴」）：挂在 .item 里面，跟着东西一起动、一起被拿起来藏掉。
// it.label：借了别的样子、认不出来的东西上贴一张白纸小标签（最多 4 个字）；it.yellow：左上角一张黄色价签“临期”。样式在 add.css
function decorate(rec) {
  if (!A || !rec || !rec.el) return;
  const it = rec.it, el = rec.el;
  el.querySelectorAll('.nlab, .ytag').forEach(n => n.remove());
  let h = 0; for (const ch of it.id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  if (it.label) {
    const n = div('nlab', Array.from(it.label).slice(0, 4).join(''));
    if (window.KINDS && !KINDS.fits(n.textContent)) n.classList.add('plain');   // 手写体子集里缺字：整条换正文字体，免得一条里两种字
    n.style.rotate = (h % 2 ? 1.5 : -1.5) + 'deg';
    el.append(n);
  }
  if (it.yellow) { const y = div('ytag', '临期'); y.style.rotate = (h % 2 ? -8 : -5) + 'deg'; el.append(y); }
}
// 往某台冰箱放一样新东西（录入面板 add.js 用）。f：第几台（0 起）或冰箱本身；where：层号，或 { frozen: 冷冻第几层 }。
// hold：先藏着（等飞过来的那一份落地再露出来，调返回的 land()）。层满了照常收进“+N”。
// 返回 { rec, x, y 落点中心（手机坐标）, w, h, more 进了“+N”没有, frozen, land }
function putNew(f, it, where, hold) {
  const F = typeof f === 'number' ? FR[f] : (f || cur);
  NEWI.add(it.id);   // 这次打开页面才放入的：吃掉不给鱼（产品里是放进来满一天才给，见 freshFish）
  const rec = { it, el: null, img: null, st: null, r: null, F };
  F.recs[it.id] = rec;
  if (where && where.frozen != null) {
    addFrozen(F, rec, where.frozen);
    const tp = F.dw && F.dw.tp;
    let x = 60, y = 632;
    if (tp) { const b = tp.getBoundingClientRect(), fr = frameEl.getBoundingClientRect(); x = (b.left - fr.left + b.width / 2) / SC; y = (b.top - fr.top + b.height / 2) / SC; }
    const land = () => { nowT = clock(); tapeTo(F, true); };
    if (!hold) land();
    return { rec, x, y, w: 24, h: 24, more: false, frozen: true, land };
  }
  const t = clamp(Math.round(+where || 0), 0, F.data.shelves.length - 1);
  placeOnShelf(F, rec, t);
  if (rec.hidden) {
    const b = moreBox(F, t), m = F.moreEls[t];
    return { rec, x: b.x, y: b.y, w: 34, h: 34, more: true, frozen: false, land() { if (m && m.animate && !RM) m.animate([{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.3,1.6,.5,1)' }); } };
  }
  const vis = v => { rec.el.style.visibility = v; if (rec.st) rec.st.style.visibility = v; };
  if (hold) vis('hidden');
  return { rec, x: rec.r.x + rec.r.w / 2, y: rec.r.y + rec.r.h / 2, w: rec.r.w, h: rec.r.h, more: false, frozen: false, land() { if (L.rec !== rec) vis(''); } };
}
// 录入面板开着时：冰箱这边什么都不接（mode 记下来改成 busy），关上时原样还回去
let LK = null;
function lock(on) {
  if (on) { if (LK == null) { LK = mode; mode = 'busy'; } }
  else if (LK != null) { mode = LK; LK = null; }
}
// 放到第 t 层：有空位（这层没有“+N”、不到 4 件）就摆在第一个空位上，否则收进“+N”；补位 flushN 时再排
function placeOnShelf(F, rec, t) {
  const it = rec.it, vis = F.data.items.filter(i => i.t === t), hid = F.hid[t] || [];
  it.t = t; delete it.s;
  if (!hid.length && vis.length < 4) {
    const used = vis.map(i => i.s); let s = 0; while (used.includes(s)) s++;
    it.s = s; F.data.items.push(it); if (F.i === 0) D.items = F.data.items;
    mkShelfEl(rec); setSticker(rec, L.rec !== rec);
  } else {
    hid.push(it); F.hid[t] = hid;
    const g = ghost(it), b = moreBox(F, t);
    Object.assign(rec, { el: g.el, img: g.img, st: null, hidden: true, ht: t, mk: null, r: { x: b.x - 10, y: b.y - 20, w: 20, h: 20 } });
    syncMore(F, t); updateMore(F, t);
  }
  queueN(F, t);
}
// 从现在的位置拿下来（层板 / “+N”/ 冷冻），rec 留着；拿下来的那层记下要补位
function detach(rec) {
  const F = rec.F || cur, it = rec.it;
  if (rec.el.parentNode) rec.el.remove();
  if (rec.st) { rec.st.remove(); rec.st = null; }
  if (rec.tv) trayDrop(rec);
  if (rec.frz != null) {
    const z = F.data.frozen[rec.frz]; z.items = z.items.filter(i => i !== it); delete rec.frz; tapeTo(F, true);
  } else if (rec.hidden) {
    const t = rec.ht; F.hid[t] = (F.hid[t] || []).filter(i => i !== it); syncMore(F, t); updateMore(F, t); queueN(F, t);
  } else {
    F.data.items = F.data.items.filter(i => i !== it); if (F.i === 0) D.items = F.data.items; queueN(F, it.t);
  }
  rec.hidden = false; delete rec.ht;
}
// 第一台二层原来那个“+2”（F.data.more）和 F.hid 保持同一份
function syncMore(F, t) { if (F.data.more && F.data.more.t === t) { F.data.more.items = F.hid[t]; F.data.more.text = '+' + F.hid[t].length; } }
const RQ = new Map();   // 要补位的层：冰箱 → 层号集合
function queueN(F, t) { if (!RQ.has(F)) RQ.set(F, new Set()); RQ.get(F).add(t); }
function flushN() {
  if (!RQ.size || mode !== 'open' || G || TR.closing) return;
  RQ.forEach((ts, F) => ts.forEach(t => normalize(F, t, TR.on && TR.F === F && TR.t === t)));
  RQ.clear();
}
// 排第 t 层。inst：这层的托盘正开着，层板这边直接到位
function normalize(F, t, inst) {
  const hid = F.hid[t] || [], vis = F.data.items.filter(i => i.t === t).sort((a, b) => a.s - b.s);
  if (!hid.length && vis.length <= 4) { updateMore(F, t, inst); return; }
  const order = vis.concat(hid), cap = order.length <= 4 ? 4 : 3;
  trace('norm ' + F.i + ':' + t + ' ' + order.length);
  order.forEach((it, i) => {
    const rec = F.recs[it.id]; if (!rec) return;
    if (i < cap) { if (hid.includes(it)) promote(F, rec, i, inst); else if (it.s !== i) slide(rec, i, inst); }
    else if (!hid.includes(it)) demote(F, rec, t, inst);
  });
  F.hid[t] = order.slice(cap).filter(it => F.recs[it.id]); syncMore(F, t); updateMore(F, t, inst);
}
// 托盘开着时：托盘收起要飞回的“原位”跟着换
function tvFrom(rec) {
  const c = rec.tv; if (!c) return;
  if (rec.hidden) { const b = moreBox(rec.F, rec.ht); c.sx = b.x; c.sy = b.y + c.h * 0.09; c.s0 = 0.18; }
  else { c.sx = rec.r.x + rec.r.w / 2; c.sy = rec.r.y + rec.r.h; c.s0 = rec.r.w / c.w; }
}
// “+N”里的一样摆到第 i 格：从“+N”格里冒出来，弹到位，贴纸随后弹出
function promote(F, rec, i, inst) {
  const it = rec.it, t = rec.ht; it.s = i; it.t = t;
  F.data.items.push(it); if (F.i === 0) D.items = F.data.items;
  const el = mkShelfEl(rec), r = rec.r; setSticker(rec, !inst);
  tvFrom(rec);
  if (inst) return;
  const b = moreBox(F, t), dx = b.x - (r.x + r.w / 2), dy = b.y + 10 - (r.y + r.h);
  el.style.transform = `translate(${dx}px, ${dy}px) scale(.3)`; el.style.opacity = 0;
  tween(springMs(15, .62), e => {
    const p = spring(e, 0, 1, 0, 15, .62).x;
    el.style.transform = `translate(${f2(dx * (1 - p))}px, ${f2(dy * (1 - p))}px) scale(${lerp(.3, 1, p).toFixed(4)})`;
    el.style.opacity = clamp(e / 90, 0, 1).toFixed(3);
  }, { tag: 'norm', delay: 60, done: () => { el.style.transform = ''; el.style.opacity = ''; } });
}
// 层板上的一样往左挪到第 i 格（弹簧），贴纸跟着
function slide(rec, i, inst) {
  const x0 = rec.r.x; rec.it.s = i; const r = rectOf(rec.it); rec.r = r;
  tvFrom(rec);
  if (inst) { rec.el.style.left = r.x + 'px'; if (rec.st) placeSt(rec); return; }
  tween(springMs(14, .68), e => {
    const x = spring(e, x0, r.x, 0, 14, .68).x;
    rec.el.style.left = x.toFixed(2) + 'px'; if (rec.st) placeSt(rec, x);
  }, { tag: 'norm', done: () => { rec.el.style.left = r.x + 'px'; if (rec.st) placeSt(rec); } });
}
// 这层超过 4 件时第 4 格那样收进“+N”：缩进“+N”格里
function demote(F, rec, t, inst) {
  const it = rec.it, el = rec.el, r = rec.r;
  F.data.items = F.data.items.filter(i => i !== it); if (F.i === 0) D.items = F.data.items;
  delete it.s; if (rec.st) { rec.st.remove(); rec.st = null; }
  const g = ghost(it), b = moreBox(F, t);
  Object.assign(rec, { el: g.el, img: g.img, hidden: true, ht: t, mk: null, r: { x: b.x - 10, y: b.y - 20, w: 20, h: 20 } });
  tvFrom(rec);
  if (inst) { el.remove(); return; }
  const dx = b.x - (r.x + r.w / 2), dy = b.y + 10 - (r.y + r.h);
  tween(260, e => {
    const q = easeIn(e / 260);
    el.style.transform = `translate(${f2(dx * q)}px, ${f2(dy * q)}px) scale(${lerp(1, .3, q).toFixed(4)})`; el.style.opacity = (1 - q).toFixed(3);
  }, { tag: 'norm', done: () => el.remove() });
}

// ---------- 7 企鹅探头（只有默认界面） ----------
// 拿起一样东西、白卡升上来时：角落里的企鹅换成一只“探头”的，从白卡上沿右边冒出半个身子（下半身在卡后面），歪着头看举起来的东西；
// 卡收起时回到角落。位置用白卡此刻真实的上沿（卡多高、拖到哪都跟着）。探出量 PK.p 由补间写。
const PK = { el: null, inner: null, p: 0, lean: 0, vl: 0, top: 560 };
function initPeek() {
  const el = div(''), inner = div('plean');
  el.id = 'peek';
  inner.innerHTML = `<img class="pose stand" src="${D.img}penguin-stand.webp" alt="" draggable="false"><img class="pose tilt" src="${D.img}penguin-tilt.webp" alt="" draggable="false">`;
  el.append(inner); phone.insertBefore(el, $('#liftLayer'));
  PK.el = el; PK.inner = inner; PK.stand = inner.querySelector('.stand'); PK.tilt = inner.querySelector('.tilt');
  PK.tilt.addEventListener('error', () => { PK.tilt.remove(); PK.tilt = null; });
  if (frozen != null && window.ResizeObserver) new ResizeObserver(() => renderPeek()).observe(sheet);   // 定格时字体后到、卡变高也跟着
}
function peekTo(tg) {
  if (!PK.el || (tg && PK.p >= 1 && !PK.closing)) return;
  cancel('peek'); PK.closing = !tg;
  const p0 = PK.p, w = tg ? 10 : 20, z = tg ? .62 : .9;
  tween(springMs(w, z), e => { PK.p = spring(e, p0, tg, 0, w, z).x; }, { tag: 'peek', delay: tg ? 160 : 0, done: () => { PK.p = tg; PK.closing = false; } });
}
function peekPos() {
  if (sheet.style.display === 'block') PK.top = 844 - sheet.offsetHeight + sheetY;
  const p = PK.p, q = clamp(p, 0, 1);
  return { x: lerp(PC.x, 320, p), b: lerp(770, PK.top + 38, p) - 26 * Math.sin(Math.PI * q) };
}
function peekLeanT() {
  if (!L.rec) return 0;
  const o = peekPos(), dx = L.cx - o.x, dy = L.cy - (o.b - 88);
  return clamp(Math.atan2(dx, -dy) * 180 / Math.PI * 0.32, -14, 8);
}
function renderPeek() {
  if (!PK.el) return;
  const on = PK.p > 1e-3, vis = on ? 'hidden' : '';
  if (PK.el.style.display !== (on ? 'block' : 'none')) PK.el.style.display = on ? 'block' : 'none';
  if (penEl.style.visibility !== vis) penEl.style.visibility = vis;
  if (!on) return;
  const o = peekPos(), q = clamp(PK.p, 0, 1), sw = smooth(.08, .45, q);
  tf(PK.el, `translate(${f2(o.x - 39.5)}px, ${f2(o.b - 110)}px)`);
  tf(PK.inner, `rotate(${f2(PK.lean)}deg) scale(${(1 + 0.04 * Math.sin(Math.PI * q)).toFixed(4)})`);
  if (PK.tilt) { PK.tilt.style.opacity = sw.toFixed(3); PK.stand.style.opacity = (1 - sw).toFixed(3); }
}

// ---------- 5 只看我的（只有默认界面） ----------
// 打开：不是我的东西一样一样错开着退后（变淡、降饱和，贴纸一起淡），我的东西轻轻跳一下；再点反过来。
// 全局的：换冰箱、拉出一层都保持。每样东西的样子由“开关那一刻的逻辑时间 + 它的序号”算出来（时间的纯函数）。
const MINE = { on: false, t0: -1e9, snap: null, btn: null, sw: null, k: 0 };
function setMine(on, instant) {
  MINE.on = on; MINE.t0 = instant ? -1e9 : nowT;
  MINE.snap = new Map(); FR.forEach(F => Object.values(F.recs).forEach(r => MINE.snap.set(r, r.mv || 0)));
  if (MINE.btn) { MINE.btn.classList.toggle('on', on); MINE.btn.setAttribute('aria-pressed', String(on)); }
  cancel('mineSw'); const k0 = MINE.k;
  if (instant) MINE.k = on ? 1 : 0;
  else tween(springMs(18, .6), e => { MINE.k = spring(e, k0, on ? 1 : 0, 0, 18, .6).x; }, { tag: 'mineSw', done: () => { MINE.k = on ? 1 : 0; } });
  trace('mine ' + on);
}
function renderMine(t) {
  if (!A) return;
  if (MINE.sw) {   // 开关：滑块滑过去，底色换成“放入”那颗按钮的绿
    const v = Math.abs(MINE.k) < 1e-4 ? '' : MINE.k.toFixed(4);
    if (MINE.sw.style.getPropertyValue('--k') !== v) { if (v) MINE.sw.style.setProperty('--k', v); else MINE.sw.style.removeProperty('--k'); }
  }
  if (!MINE.snap) return;
  const to = MINE.on ? 1 : 0;
  FR.forEach(F => {
    let i = 0;
    const list = allItems(F);   // 层板上的、各层“+N”里的、冷冻里的
    for (const it of list) {
      const rec = F.recs[it.id]; if (!rec) continue;
      const e = t - MINE.t0 - (i++) * 34;
      if (it.kind === 'mine') {   // 我的：打开时轻轻跳一下
        const h = MINE.on && e > 0 && e < 320 ? -6 * Math.sin(Math.PI * e / 320) : 0;
        applyMine(rec, 0, h);
      } else {
        const from = MINE.snap.has(rec) ? MINE.snap.get(rec) : 1 - to;
        applyMine(rec, lerp(from, to, easeOut(clamp(e / 300, 0, 1))), 0);
      }
    }
  });
}
// ---------- 我的层整格底色（只有默认界面，定格 ?t= 时不建） ----------
// 用户把“二层 · 我的层”的名牌看成了下面那一排的标题：给我的层这一格的背板铺一块鼠尾草绿的底，
// 从上一块层板的胶带下面到这一层层板的前沿，名牌落在它左下角，一眼看出“这一整格是我的”。
// 底色在层板层的最下面（东西、名牌、贴纸都在它上面），跟着冰箱一起转、一起缩。
// 浓度跟着这一层名牌的淡入淡出走（开门、week.js 关门都跟着）；第一次显示全时亮一下（0.8 秒）；拉出这一层的托盘时跟着淡掉。
function initMineCell() {
  if (!A || qs.has('t')) return;
  FR.forEach(F => {
    const t = F.data.shelves.findIndex(s => s.mine); if (t < 1) return;
    const el = div('minecell'), top = S[t - 1] + 26, bot = S[t] + 17;
    Object.assign(el.style, { top: top + 'px', height: (bot - top) + 'px', opacity: 0 });
    F.shelf.insertBefore(el, F.shelf.firstChild);
    F.mc = { el, t, name: F.shelf.querySelectorAll('.name')[t], flashAt: null, op: '0', fl: '' };
  });
}
function renderMineCell(t) {
  FR.forEach(F => {
    const m = F.mc; if (!m) return;
    const base = clamp(+m.name.style.opacity || 0, 0, 1);
    if (m.flashAt == null && base > 0.995 && !RM) m.flashAt = t;
    const tr = TR.on && TR.F === F && !TR.frz && TR.t === m.t ? 1 - clamp(TR.p * (1 - TR.push), 0, 1) : 1;
    const op = (base * tr).toFixed(3);
    if (op !== m.op) { m.op = op; m.el.style.opacity = op; }
    const e = m.flashAt == null ? 1 : (t - m.flashAt) / 800;
    const fl = e >= 1 || e < 0 ? '' : (e < 0.28 ? smooth(0, 0.28, e) : 1 - smooth(0.28, 1, e)).toFixed(3);
    if (fl !== m.fl) { m.fl = fl; if (fl) m.el.style.setProperty('--fl', fl); else m.el.style.removeProperty('--fl'); }
  });
}
// v：变淡了多少（0 原样，1 到底：不透明度约 0.28、降饱和）；hop：往上跳了几像素
function applyMine(rec, v, hop) {
  const key = v.toFixed(3) + '|' + hop.toFixed(2) + (rec.tv ? 't' : '');
  if (rec.mk === key) return; rec.mk = key; rec.mv = v;
  const other = rec.it.kind === 'other', bo = other ? 0.82 : 1;   // 别人的东西本来就褪了色（skin.css）
  const fl = v < 1e-3 ? '' : `${other ? 'saturate(.38) brightness(1.05) ' : ''}saturate(${(1 - 0.85 * v).toFixed(3)}) opacity(${lerp(1, 0.28 / bo, v).toFixed(3)})`;
  const mf = v < 1e-3 ? '' : (1 - 0.75 * v).toFixed(3), tr = hop ? `0 ${hop.toFixed(2)}px` : '';
  const put = (img, host, mover) => {
    img.style.filter = fl;
    if (mf) host.style.setProperty('--mf', mf); else host.style.removeProperty('--mf');
    mover.style.translate = tr;
  };
  put(rec.img, rec.el, rec.el);
  if (rec.st) rec.st.style.opacity = v < 1e-3 ? '' : lerp(1, 0.3, v).toFixed(3);
  if (rec.tv) put(rec.tv.img, rec.tv.el, rec.tv.box);
}

// ---------- 全局指针 ----------
addEventListener('pointermove', e => {
  if (G && e.pointerId === G.id) { nowT = clock(); G.move(loc(e), e); return; }
  if (A && !G && e.pointerType === 'mouse' && e.buttons === 0) {   // 鼠标悬停：镜头轻轻跟着歪
    const p = loc(e); HV.seen = true;
    HV.x = -clamp((p.x - 195) / 195, -1, 1); HV.y = clamp((p.y - 422) / 422, -1, 1) * 0.6;
  }
  if (!G && mode === 'picked' && e.pointerType === 'mouse' && L.rec) {   // 鼠标悬停也能看歪
    const p = loc(e), hw = L.w * L.s / 2, hh = L.h * L.s / 2;
    if (Math.abs(p.x - L.cx) < hw && Math.abs(p.y - L.cy) < hh) setTiltFrom(p); else L.tilt = { x: 0, y: 0 };
  }
});
const endG = e => { if (G && e.pointerId === G.id) { nowT = clock(); const g = G; G = null; g.up(loc(e), e); } };
addEventListener('pointerup', endG);
addEventListener('pointercancel', endG);

// ---------- 每帧：跟手的部分（倾斜弹簧、拖拽滞后、企鹅歪头） ----------
function liveUpdate(dt, t) {
  const s = dt / 1000;
  if (L.rec && L.tiltOn) {
    const k = 240, c = 19;   // 倾斜用一个真弹簧，松手会带一点回弹
    L.vrx += (k * (L.tilt.x - L.rx) - c * L.vrx) * s; L.rx += L.vrx * s;
    L.vry += (k * (L.tilt.y - L.ry) - c * L.vry) * s; L.ry += L.vry * s;
  }
  if (DR.on && L.rec) {
    let tx = DR.fx + DR.ox, ty = DR.fy + DR.oy;
    // 垃圾桶改版：到了桶上，东西往桶口右上方偏一半过去（露出掀开的盖子）
    if (binOn()) { const m = BIN.aim(), h = 0.5 * BIN.pull; DR.nx = (m.x - tx) * h; DR.ny = (m.y - ty) * h; tx += DR.nx; ty += DR.ny; }
    const a = 1 - Math.exp(-dt / 55);
    const nx = L.cx + (tx - L.cx) * a, ny = L.cy + (ty - L.cy) * a;
    const vx = dt > 0 ? (nx - L.cx) / s : 0, vy = dt > 0 ? (ny - L.cy) / s : 0;
    L.cx = nx; L.cy = ny;
    const b = 1 - Math.exp(-dt / 70); DR.vx += (vx - DR.vx) * b; DR.vy += (vy - DR.vy) * b;
    L.rz = clamp(DR.vx * 0.02, -16, 16); L.ry = clamp(DR.vx * 0.03, -20, 20); L.rx = clamp(-DR.vy * 0.025, -16, 16);
    penguinTrack(L.cx, L.cy, draggable(L.rec.it));   // 我的、大家的什么都能喂：凑到嘴边就张嘴；别人的、没人认的只能挪：企鹅只看着，不张嘴
    // 垃圾桶改版：桶跟着东西变大小、到了桶上掀盖子（按没偏过的位置判断）；到了桶上东西缩小一点
    if (binOn()) { BIN.track(L.cx - DR.nx, L.cy - DR.ny); L.s = DR.s * (1 - 0.36 * BIN.pull); }
    if (A) { dwZone(); shelfMark(shelfAt()); }
  } else if (mode === 'picked' && L.rec) { if (A) penguinRest(); else penguinTrack(L.cx, L.cy, false); }   // 默认界面：拿起来时企鹅探头到白卡上（7 企鹅探头），角落里那只歇着
  else if (mode === 'open' || mode === 'closed') {
    if (A && P.look && (!G || G.cam)) P.look = null;
    if (A && P.look) lookAt(P.look.x, P.look.y);
    else if (A && TR.on && !TR.closing && TR.p < 0.97) lookAt(195, trayTop(TR.h || 0) + 150);   // 拉出一层：看着托盘滑出来，到位就回正
    else penguinRest();
  }
  if (A && DW.busy) { if (DW.tg === 1 || DW.o > .05) { const q = toScr(DW.lx, dwTop(DW.o)); lookAt(q.x, q.y); } else if (mode === 'busy') penguinRest(); }
  // 企鹅的歪、缩放、提示环都是弹簧跟随
  const k2 = 170, c2 = 16;
  P.vl += (k2 * (P.leanT - P.lean) - c2 * P.vl) * s; P.lean += P.vl * s;
  if (A) {
    P.vst += (k2 * (P.stT - P.st) - c2 * P.vst) * s; P.st += P.vst * s;
    if (Math.abs(P.stT) < 1e-6 && Math.abs(P.st) < 2e-4 && Math.abs(P.vst) < 1e-3) P.st = P.vst = 0;   // 回正后字符串和以前一样
    const pt = PK.p > 1e-3 ? peekLeanT() : 0; PK.vl += (120 * (pt - PK.lean) - 14 * PK.vl) * s; PK.lean += PK.vl * s;
    spinUpdate(dt);
  }
  P.vs += (k2 * (P.scT - P.sc) - c2 * P.vs) * s; P.sc += P.vs * s;
  P.ring += (P.ringT - P.ring) * (1 - Math.exp(-dt / 90));
  // 镜头的一点点歪：用过鼠标就跟鼠标，否则跟陀螺仪；拿起东西、拖镜头时回正
  if (A) {
    const free = (mode === 'open' || mode === 'closed') && !(G && G.cam) && !TR.on;
    const tg = HV.seen ? HV : GY, tx = free ? tg.x : 0, ty = free ? tg.y : 0, a = 1 - Math.exp(-dt / 160);
    CAM.hx += (tx - CAM.hx) * a; CAM.hy += (ty - CAM.hy) * a;
    if (Math.abs(tx - CAM.hx) < 1e-3) CAM.hx = tx;
    if (Math.abs(ty - CAM.hy) < 1e-3) CAM.hy = ty;
  }
}
let lastF = performance.now();
function frame() {
  const tr = performance.now(), dt = Math.min(34, tr - lastF); lastF = tr;
  const t = clock();
  step(t); if (A) keepUndo(); liveUpdate(dt, t); renderLift(); renderPenguin(t); renderCam(); if (A) flushN(); renderTray(); renderMine(t);
  if (A) { renderFrz(); renderPeek(); renderMineCell(t); }
  if (frozen == null) requestAnimationFrame(frame);
}

// ---------- 图片没出来时用纯色顶着 ----------
function guardImg(img, cls) {
  const bad = () => { const d = div(img.className + ' ph'); img.replaceWith(d); };
  if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) bad(); else img.addEventListener('error', bad);
}
document.querySelectorAll('img.pose, img.cfish').forEach(i => guardImg(i));
function guardDoor(F) { const t = new Image(); t.onerror = () => F.face.classList.add('ph'); t.src = D.img + (A ? F.data.door : 'door-front.webp'); }

// ---------- 启动 / 调试场景 ----------
// ?scene=closed|opening|door|open|picked|drag|celebrate  &t=毫秒（定格）  &item=t1-milk  &a=门角度  &x=&y=拖到哪  &tx=&ty=倾斜
function settleOpen() {
  const k = nowT; nowT = k - 200000; setDoor(96); step(k - 100000); nowT = k; mode = 'open';
}
function boot() {
  setupFridges();
  FR.forEach(F => {
    build(F);
    if (window.SKIN) SKIN.after(F.shelf, F.data); // 换肤（?skin=a|b）：层名、贴纸的位置在这里调
    bindDoor(F); guardDoor(F);
  });
  if (A) initPull();   // 拉出一层、“+N”上的主人圆点、“只看我的”（只有默认界面）
  if (A) { initFreezer(); initPeek(); initMineCell(); }   // 冷冻抽屉、企鹅探头、我的层底色（只有默认界面）
  // ?fridge=1：一打开就对着第二台（只有默认界面有两台）
  cur = FR[A ? clamp(Math.round(+qs.get('fridge') || 0), 0, FR.length - 1) : 0];
  CAM.x = cur.i * GAP;
  if (A) {
    document.querySelectorAll('#topbar .tab').forEach((b, i) => b.classList.toggle('on', i === cur.i));
    bubble.innerHTML = BUB.html = cur.bubble; bubble.style.opacity = 0;
  }
  const scene = qs.get('scene') || 'closed', T = qs.has('t') ? +qs.get('t') : null;
  const base = performance.now();
  if (T != null) frozen = base;
  nowT = base - (T != null ? T : 100000);
  bindCam(); initGyro();
  FR.forEach(F => { if (F !== cur) setDoor(0, F); });   // 别的那台先关着门；第二台第一次转过去时自己开
  if (scene === 'closed') {
    mode = 'closed'; setDoor(0);
    if (T != null) scheduleHint(0);
    else if (A && cur.data.autoOpen) { nowT = base; cur.pendingAuto = true; at(900, () => { if (!cur.popped && mode === 'closed' && !G && cur.a < 1) openDoor(260); }, 'auto'); }
    else { nowT = base; scheduleHint(1400); }
  }
  else if (scene === 'opening') { mode = 'closed'; setDoor(0); openDoor(260); }
  else if (scene === 'door') { mode = 'closed'; setDoor(+qs.get('a') || 45); }
  else if (scene === 'open') { setDoor(96); mode = 'open'; }
  else if (scene === 'turn' && A) { settleOpen(); goTo(cur.i === 0 ? 1 : 0); }   // ?scene=turn&t=毫秒：换冰箱途中定格
  else if (scene === 'shelf' && A) { settleOpen(); openTray(cur, clamp(Math.round(+qs.get('shelf') || 0), 0, cur.data.shelves.length - 1)); }   // ?scene=shelf&shelf=层号&t=毫秒：拉出一层
  // ?scene=look&x=&y=&t=：按住这一点（手机坐标）多久时企鹅的样子
  else if (scene === 'look' && A) { settleOpen(); P.look = { x: +qs.get('x') || 69, y: +qs.get('y') || 325 }; if (T != null) G = { id: -2, move() {}, up() {} }; }
  // ?scene=freeze&item=&t=：从层板拖到抽屉上松手后多久；&phase=hover：拖进抽屉区后多久（还没松手）；&via=sheet：点了白卡上的“放进冷冻”后多久。&x=&y= 东西在哪
  else if (scene === 'freeze' && A) {
    settleOpen();
    const rec = cur.recs[qs.get('item') || (cur.i === 0 ? 't1-milk' : 'f1-t2-milk')], t0 = nowT;
    if (qs.get('via') === 'sheet') { nowT = t0 - 1600; pick(rec); step(t0); freezeFromPick(); }
    else {
      const x = +qs.get('x') || 150, y = +qs.get('y') || 580;
      nowT = t0 - 600; beginDrag(rec, 'shelf', { x, y: y + 38 }); G = null; step(t0);
      L.cx = x; L.cy = y; DR.fx = x; DR.fy = y + 38; DR.vx = DR.vy = 0; L.rz = L.rx = L.ry = 0;
      if (qs.get('phase') === 'hover') dwSet(1, cur);
      else { DW.F = cur; DW.tg = 1; DW.o = 1; DR.on = false; dropFreeze(); }
    }
  }
  else {
    settleOpen();
    const rec = cur.recs[qs.get('item') || (cur.i === 0 ? 't1-milk' : 'f1-t2-milk')];
    if (scene === 'picked') {
      pick(rec);
      if (qs.has('tx')) { L.tilt = { x: +qs.get('ty') || 0, y: +qs.get('tx') || 0 }; L.rx = L.tilt.x; L.ry = L.tilt.y; }
    } else if (scene === 'drag') {
      const x = +qs.get('x') || 300, y = +qs.get('y') || 640;
      beginDrag(rec, 'shelf', { x, y: y + 38 }); G = null;
      step(base); L.cx = x; L.cy = y; DR.vx = +qs.get('vx') || -260; DR.vy = 0;
      L.rz = clamp(DR.vx * 0.02, -16, 16); L.ry = clamp(DR.vx * 0.03, -20, 20);
      penguinTrack(x, y, true); P.lean = P.leanT; P.sc = P.scT; P.ring = P.ringT; P.vs = 0; DR.on = false;
    } else if (scene === 'celebrate') {
      celebrate(rec);
    }
  }
  if (T != null && scene !== 'drag' && scene !== 'picked') { P.lean = P.leanT; P.sc = P.scT; P.ring = P.ringT; }
  if (A) {
    // ?tilt=0.8：镜头往右拖了 0.8 份（160 像素一份）的样子；不定格时松开弹回去
    if (qs.has('tilt')) { CAM.x = cur.i * GAP - (+qs.get('tilt') || 0) * 160; if (frozen == null) snapTo(cur.i); }
    // ?hover=x,y：鼠标停在手机画面这一点（手机坐标）时的轻微歪
    if (qs.has('hover')) { const [x, y] = qs.get('hover').split(',').map(Number); HV.seen = true;
      HV.x = CAM.hx = -clamp(((x || 195) - 195) / 195, -1, 1); HV.y = CAM.hy = clamp(((y || 422) - 422) / 422, -1, 1) * 0.6; }
    // ?mine=1：“只看我的”一打开就是开着的
    if (qs.get('mine') === '1') setMine(true, true);
  }
  if (frozen != null) { step(frozen); liveUpdate(0, frozen); if (scene === 'drag') { P.lean = P.leanT; P.sc = P.scT; }
    if (A) { if (scene === 'freeze' || scene === 'look') { P.lean = P.leanT; P.st = P.stT; P.sc = P.scT; } PK.lean = PK.p > 1e-3 ? peekLeanT() : 0; }
    renderLift(); renderPenguin(frozen); renderCam(); renderTray(); renderMine(frozen); if (A) { renderFrz(); renderPeek(); } document.body.dataset.ready = '1'; }
  else { requestAnimationFrame(frame); document.body.dataset.ready = '1'; }
}
// ---------- 每周结算（week.js）用：把开着的门关回去，回到一开始“关着门”的样子 ----------
// 原来门开了就关不回去。结算时新冰箱贴要贴到门上，所以加这一个口子，别的地方都不调它。
// 只在默认界面、手上没东西、托盘和抽屉都收着、没开编辑面板、镜头停稳时才关，关不了返回 false。
// 关好后 mode 回到 'closed'，点门照常再开，层板上的东西重新弹出来一遍。
function reclose() {
  const F = cur;
  if (!A || mode !== 'open' || G || !F.popped || TR.on || DW.busy || DW.o > 0.01 || ED || !camSettled()) return false;
  mode = 'busy'; cancel('pop'); cancel('bub');
  const fades = [...F.root.querySelectorAll('.fade'), bubble].map(f => [f, +f.style.opacity || 0]);
  tween(160, e => fades.forEach(([f, o]) => { f.style.opacity = (o * (1 - e / 160)).toFixed(3); }), { tag: 'reclose' });
  closeDoor(0, F);
  at(springMs(13, .42) + 20, () => {
    F.popped = false; mode = 'closed';
    F.data.items.forEach(it => { const r = F.recs[it.id]; if (!r) return; r.el.style.opacity = 0; if (r.st) r.st.style.transform = 'scale(0)'; });
  }, 'reclose');
  return true;
}
// ---------- 第五步：“查看处理”清单点一行（manage.js）：直接打开那一件的详情卡 ----------
// 全是现有的几步串起来：收起别的层 → 转到那台 → 开门 → 拉出那层（冷冻的拉冷冻托盘）→ 托盘里滚到它 → 拿起来开卡。
// 每一步等上一步停稳再走；中途手碰了冰箱、或者 6 秒还没到，就停在那一步。现在不行（手上有东西、面板开着）返回 false
function showItem(id) {
  nowT = clock();
  const F = A && FR.find(f => f.recs[id]), rec = F && F.recs[id];
  if (!rec || G || (mode !== 'open' && mode !== 'closed')) return false;
  const t = rec.frz != null ? 'z' : rec.hidden ? rec.ht : rec.it.t, t0 = nowT, wait = () => at(60, next, 'show');
  trace('show ' + id);
  function next() {
    if (G || nowT - t0 > 6000 || (mode !== 'open' && mode !== 'closed') || !F.recs[id]) return;
    if (TR.on && (TR.closing || TR.F !== F || TR.t !== t)) { if (!TR.closing && mode === 'open') closeTray(); return wait(); }
    if (cur !== F) { goTo(F.i); return wait(); }
    if (!camSettled()) return wait();
    if (!F.popped) { if (!tweens.some(w => w.tag === 'door' + F.i)) openDoor(260, F); return wait(); }
    if (mode !== 'open') return wait();
    if (!TR.on) { openTray(F, t); return wait(); }
    const c = rec.tv; if (!c || TR.p < 0.97 || c.q < 0.9) return wait();
    const top = trayTop(TR.h) + TG.rim + TG.padT, bot = trayTop(TR.h) + TR.h - TG.rim;
    if (c.cell.by - TR.scroll > bot || c.cell.by - c.h - TG.head - TR.scroll < top) {   // 托盘里一屏放不下、它在下面：先滚到它
      const s = clamp(c.cell.by - c.h - TG.head - top, 0, TR.maxScroll);
      if (Math.abs(s - TR.scroll) > 1) { TR.scroll = s; return wait(); }
    }
    pick(rec);
  }
  cancel('show'); next();
  return true;
}
// 第五步：“买菜前看一眼”里每层手动标的“满了”（shop.js）。只是提示，不限制放：名牌、选层时带一个“满”字章
function setFull(fi, t, on) { const s = FR[fi] && FR[fi].data.shelves[t]; if (!s) return false; s.full = !!on; return true; }
$('#replay').addEventListener('click', () => { location.href = location.pathname; });
prepCelModel();
window.__app = { get cm() { return { ready: CM.ready, on: CM.on, held: CM.held }; }, get mode() { return mode; }, get door() { return cur.a; }, get lift() { return { ...L, rec: L.rec && L.rec.it.id, mv: !!L.mv }; }, get items() { return cur.data.items.map(i => i.id); }, get fish() { return D.fish; }, P,
  // 两台冰箱：fridge 正对着第几台（0 起）；cam.x 镜头位置（像素，第 i 台 = i*480），pos = x/480；tilt 是悬停/陀螺仪的歪
  get fridge() { return cur.i; }, get popped() { return FR.map(F => F.popped); },
  get cam() { return { x: CAM.x, pos: CAM.x / GAP, zoom: camZoom(), settled: camSettled() }; },
  get tilt() { const u = (cur.i * GAP - CAM.x) / GAP + CAM.hx * 0.15; return { u, ry: A ? 14 * Math.tanh(u * 2.2) : 0, hx: CAM.hx, hy: CAM.hy, gyro: GY.on }; },
  // 拉出一层：on 开着没有；fridge / shelf 哪台哪层；p 托盘展开量（0 收着，1 到位）；closing 正在收；items 托盘上的东西（按摆放顺序）；scroll 托盘里滚了多少
  get tray() { return { on: TR.on, fridge: TR.F ? TR.F.i : -1, shelf: TR.t, p: +(TR.p * (1 - TR.push)).toFixed(4), closing: TR.closing, items: TR.list.map(c => c.rec.it.id), groups: TR.heads.map(h => h.label), scroll: TR.scroll }; },
  // 只看我的：on 开关；p 每样东西现在变淡了多少（0 原样，1 变淡到底）
  get mine() { const p = {}; FR.forEach(F => Object.values(F.recs).forEach(r => { p[r.it.id] = +(r.mv || 0).toFixed(3); })); return { on: MINE.on, p }; },
  // 冷冻抽屉：drawer.o 开合量（0 关，1 开到底）、tg 目标、busy 正在收东西、fridge 哪台；freezer 每台冷冻里的件数
  get drawer() { return { o: +DW.o.toFixed(4), tg: DW.tg, busy: DW.busy, fridge: DW.F ? DW.F.i : -1 }; }, get freezer() { return FR.map(F => F.frz); },
  // 模型转动：th 水平角（度）、ph 俯仰、w 惯性角速度（度/秒）、held 手碰过没有；peek 企鹅探头 p 探出量、lean 歪头角度
  get spin() { return { ...SPIN }; }, get peek() { return { p: +PK.p.toFixed(4), lean: +PK.lean.toFixed(2) }; },
  // 层板补位：shelves[台][层] = { vis 层板上摆着的（按格子顺序）, more “+N”里收着的, plus “+N”格上写的字（没有是 ''） }
  get shelves() { return FR.map(F => F.data.shelves.map((s, t) => { const m = F.moreEls && F.moreEls[t];
    return { vis: F.data.items.filter(i => i.t === t).sort((a, b) => a.s - b.s).map(i => i.id), more: ((F.hid && F.hid[t]) || []).map(i => i.id),
      plus: m && m.style.display !== 'none' && m.firstChild ? m.firstChild.textContent : '' }; })); },
  // 冷冻：frozen[台][层] = 那层里的东西 id；frzTray 冷冻托盘开着没有
  get frozen() { return FR.map(F => (F.data.frozen || []).map(z => z.items.map(i => i.id))); }, get frzTray() { return TR.on && TR.frz; },
  // 一样东西此刻的状态：opened 开了没有、plan 计划、planAt 计划从什么时候起算（逻辑时间）、kind 归属、zone 在哪（s层号 / z冷冻层号）、sticker 层板上贴纸的字
  item(id) { for (const F of FR) { const r = F.recs[id]; if (!r) continue; const it = r.it;
    return { fridge: F.i, opened: !!it.opened, plan: it.plan || null, planAt: it.planAt != null ? it.planAt : null, kind: it.kind, zone: A ? curZone(r) : null,
      slot: it.s != null ? it.s : null, sticker: r.st ? r.st.textContent : null, left: r.el.parentNode ? parseFloat(r.el.style.left) : null }; } return null; },
  // 编辑面板：开着时是草稿（item / own / plan / zone / zones），没开是 null；toast 当前提示的字
  get edit() { return ED ? { item: ED.rec.it.id, own: ED.own, plan: ED.plan, zone: ED.zone, zones: ED.zones } : null; }, get toast() { return TO.text; },
  // 每周结算（week.js）：把开着的门关回去，见上面的 reclose()
  reclose,
  // 录入面板（add.js）用：decorate 重贴名字小标签和黄标；putNew 往某层 / 冷冻放一样新东西（见上面 putNew）；
  // say 弹一行提示（toast 是读当前提示的字，所以换个名字）；lock 面板开着时冰箱不接手势；openDoor 开正对着的那台的门；
  // shelfInfo[台][层] = { label, mine }；frozenInfo[台][层] = 冷冻层名；rm 减少动态效果；frozenT 是不是 ?t= 定格
  decorate(id) { for (const F of FR) if (F.recs[id]) decorate(F.recs[id]); }, putNew, lock,
  say(text) { nowT = clock(); toast(text); }, openDoor() { nowT = clock(); if (mode === 'closed') openDoor(260); },
  get shelfInfo() { return FR.map(F => F.data.shelves.map(s => ({ label: s.label, mine: !!s.mine }))); },
  get frozenInfo() { return FR.map(F => (F.data.frozen || []).map(z => z.label)); }, rm: RM, get frozenT() { return frozen != null; },
  get camOk() { return camSettled() && !TR.on; },
  // 第五步：showItem(id) 打开某一件的详情卡（见上面 showItem）；setFull(台, 层, 开关) 手动标“满了”；full[台][层] 标了没有
  showItem, setFull, get full() { return FR.map(F => F.data.shelves.map(s => !!s.full)); },
  // 记号（marks.js）用的口子：只有默认界面有。now() 先把逻辑时间对上再弹提示、开托盘
  mk: A ? { FR, S, X, SOFF, get cur() { return cur; }, get mode() { return mode; }, get mine() { return MINE.on; }, get frozen() { return frozen != null; },
    get tray() { return { on: TR.on, F: TR.F, t: TR.t, closing: TR.closing }; }, get lifted() { return L.rec; }, get settled() { return camSettled(); },
    now() { nowT = clock(); }, openTray, closeTray, refill, toast, aboveSheet, restyle, setBubble, openEdit } : null };
boot();
})();
