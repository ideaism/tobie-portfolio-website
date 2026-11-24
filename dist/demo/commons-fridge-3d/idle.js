// 角落企鹅的待机动作：呼吸、眨眼、歪头瞥一眼、轻晃、打盹、点一下、拎起来。
// 这只是严肃的那只：不笑、不瞪圆眼、不蹦跳，动作慢而克制，被拎起来也一脸淡定。
// 不改 app.js：只读 window.__app（mode / fish / items / fridge / popped / cam），动作写在自己包的 .idle 这层上。
//
// 调试参数：
//   ?idle=0                       关掉
//   ?mood=calm|alert|lively|nap   强制一种样子
//   &it=毫秒                      待机时间定格（配 ?scene=…&t=… 截图用）
//   &poke=毫秒                    定格在“点了一下之后第几毫秒”
//   &lift=x,y,rot                 定格在“被拎到这儿”（相对角落的位移和摆角）
//   &nap=秒  &lively=秒           多久没人碰就打盹（默认 20）；拿到鱼以后精神多久（默认 40，产品里是两天）
// 带 ?t=（app 定格）而没带 it / mood / poke / lift 时什么都不做，旧的基线截图逐像素不变。
(() => {
'use strict';
const app = window.__app, pen = document.querySelector('#penguin'), lean = pen && pen.querySelector('.lean');
if (!app || !pen || !lean) return;
const qs = new URLSearchParams(location.search);
if (qs.get('idle') === '0') return;
const DEBUG = ['it', 'mood', 'poke', 'lift'].some(k => qs.has(k));
if (qs.has('t') && !DEBUG) return;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches || qs.get('rm') === '1';
const FROZEN = qs.has('it') || (qs.has('t') && DEBUG);
const IT0 = qs.has('it') ? +qs.get('it') || 0 : 0;
const FORCE = qs.get('mood');
const NAP_AFTER = (+qs.get('nap') || 20) * 1000, LIVELY_FOR = (+qs.get('lively') || 40) * 1000;
const ATTENTION = 't1-milk';   // 大冰箱里“计划过了大半”的那件（气泡说的就是它）

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const x = clamp((v - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const hash = k => { const s = Math.sin(k * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const TAU = Math.PI * 2;

// ---------- 搭架子 ----------
const idle = document.createElement('div'); idle.className = 'idle';
pen.insertBefore(idle, lean); idle.append(lean);
const shadow = document.createElement('div'); shadow.className = 'ishadow'; pen.insertBefore(shadow, idle);
const zz = document.createElement('div'); zz.className = 'izz';
const zs = [0, 1, 2].map(() => { const s = document.createElement('span'); s.textContent = 'z'; zz.append(s); return s; });
pen.append(zz);
const has = { blink: false, nap: false, tilt: false };
Object.keys(has).forEach(n => {
  const im = new Image(); im.className = 'pose ' + n; im.alt = ''; im.draggable = false;
  im.onload = () => { has[n] = true; if (FROZEN) render(); };
  im.src = 'img/trim/penguin-' + n + '.webp';   // 没加载出来就不用这个姿势，站姿顶着
  lean.append(im);
});

// ---------- 状态 ----------
const t0 = performance.now();
const now = () => (FROZEN ? IT0 : performance.now() - t0);
let lastTouch = 0;            // 上一次有人碰屏幕（或界面有变化）的时刻
let moodAt = 0, mood = 'calm';
let livelyUntil = -1, fishSeen = app.fish, fishPending = false;
let lastMode = app.mode, lastFridge = app.fridge;
let pose = 'stand', poseAt = -1e9;
const extraBlinks = [];       // 点一下、落地、醒来时额外眨的眼：{ at, dur }
let pokeAt = qs.has('poke') ? IT0 - (+qs.get('poke') || 0) : -1e9, pokeAmp = 0.13;
// 手势：press（按下还没定是点还是拎）→ held（拎着）→ fall（松手落回去）
let press = null;
const H = { on: false, x: 0, y: 0, tx: 0, ty: 0, rot: 0, vr: 0, vx: 0, lastX: 0, lastY: 0, lastT: 0, vy: 0 };
let fall = null;              // { at, x0, y0, v0, land, vl }
const G_ = 2600;              // 落下的重力，像素/秒²
if (qs.has('lift')) {
  const [x, y, r] = qs.get('lift').split(',').map(Number);
  H.on = true; H.x = H.tx = x || 0; H.y = H.ty = y || 0; H.rot = r || 0;
}

function active() { const m = app.mode; return m === 'open' || m === 'closed'; }
function calcMood(t) {
  if (FORCE) return FORCE === 'nap' ? 'calm' : FORCE;
  if (t < livelyUntil) return 'lively';
  if (app.fridge === 0 && app.popped[0] && app.mode === 'open' && app.items.includes(ATTENTION)) return 'alert';
  return 'calm';
}
function napping(t) {
  if (FORCE) return FORCE === 'nap';
  return mood === 'calm' && !H.on && !fall && !press && app.cam.settled !== false && t - lastTouch > NAP_AFTER;
}
function touch(t) { if (napping(t)) wake(t); lastTouch = t; }
function wake(t) { extraBlinks.push({ at: t + 260, dur: 150 }, { at: t + 560, dur: 150 }); }   // 醒来眨两下，不大惊小怪

// 眨眼：每 4.6 秒一格，格子里哪一刻眨由格子号算出来（所以能定格）；偶尔连眨两下
function blinking(t) {
  for (const b of extraBlinks) if (t >= b.at && t < b.at + b.dur) return true;
  const S = 4600, k = Math.floor(t / S), o = t - k * S, st = 500 + hash(k) * 2600;
  if (o >= st && o < st + 200) return true;
  return hash(k + 0.5) > 0.8 && o >= st + 340 && o < st + 520;
}
// 歪头瞥一眼：alert 时每 7 秒一次，一次 1.8 秒；气泡刚出来 0.7 秒后先瞥第一眼
function glance(t) {
  const o = ((t - moodAt + 1700) % 7000 + 7000) % 7000;
  return smooth(2400, 2660, o) * (1 - smooth(3940, 4200, o));
}

// ---------- 每帧 ----------
function update(t, dt) {
  // 界面有变化就算“有人在”：换了模式、换了冰箱
  if (app.mode !== lastMode || app.fridge !== lastFridge) { lastMode = app.mode; lastFridge = app.fridge; touch(t); }
  // 拿到鱼：等庆祝收了再精神起来
  if (app.fish > fishSeen) { fishSeen = app.fish; fishPending = true; }
  if (fishPending && active()) { fishPending = false; livelyUntil = t + LIVELY_FOR; }
  const m = calcMood(t);
  if (m !== mood) { mood = m; moodAt = t; }
  // 按住不放 200 毫秒就算拎起来
  if (press && !H.on && t - press.at > 200) beginLift(t);
  // 拎着：位置滞后一点跟手，身子像钟摆一样跟着横向速度摆
  if (H.on && !qs.has('lift')) {
    const a = RM ? 1 : 1 - Math.exp(-dt / 60), s = dt / 1000;
    const px = H.x; H.x += (H.tx - H.x) * a; H.y += (H.ty - H.y) * a;
    if (!RM && s > 0) {
      H.vx += ((H.x - px) / s - H.vx) * (1 - Math.exp(-dt / 80));
      const target = clamp(-H.vx * 0.045, -30, 30);
      H.vr += (120 * (target - H.rot) - 9 * H.vr) * s; H.rot += H.vr * s;
    }
  }
  while (extraBlinks.length && t > extraBlinks[0].at + extraBlinks[0].dur + 50) extraBlinks.shift();
}

function render() {
  const t = now();
  const on = active();
  pen.classList.toggle('ip-on', on && !FROZEN);
  pen.classList.toggle('ip-held', H.on);
  if (!on) {   // 拿起东西、拖、庆祝时：交还给 app.js，自己回正
    H.on = false; press = null; fall = null; pen.classList.remove('ip-held');
    setPose('stand', t); idle.style.transform = ''; shadow.style.opacity = 0; zs.forEach(z => { z.style.opacity = 0; });
    return;
  }
  const nap = napping(t), settled = app.cam.settled !== false;
  let x = 0, y = 0, rot = 0, sx = 1, sy = 1, pivot = 0, want = 'stand';

  if (H.on) {
    // 拎起来：脸不变，身子略拉长，转轴移到头顶，跟着手摆
    x = H.x; y = H.y; rot = H.rot; sx = 0.965; sy = 1.055; pivot = 92;
    if (blinking(t)) want = 'blink';
  } else if (fall) {
    const e = (t - fall.at) / 1000;
    if (e < fall.land) {
      const p = smooth(0, 1, e / fall.land);
      x = fall.x0 * (1 - p); y = fall.y0 + fall.v0 * e + G_ * e * e / 2;
      rot = fall.r0 * (1 - p); sx = 0.98; sy = 1.03; pivot = 92 * (1 - p);
    } else {
      // 落地：压扁一下，小弹一下，再回弹收住
      const b = e - fall.land, vb = fall.vl * 0.2, hb = Math.max(0, vb * b - G_ * b * b / 2);
      const amp = clamp(fall.vl / 5200, 0.05, 0.2), sq = amp * Math.exp(-b * 9) * Math.cos(b * 26);
      y = -hb; sx = 1 + sq; sy = 1 - sq;
      if (b > 0.9) fall = null;
    }
  } else {
    // 呼吸：慢，幅度小；打盹时更慢更深
    if (!RM) {
      const bp = nap ? 5600 : 4200, ba = nap ? 0.02 : 0.012, br = Math.sin(TAU * t / bp);
      sy *= 1 + ba * br; sx *= 1 - ba * 0.5 * br;
    }
    if (nap) {
      want = 'nap';
      if (!RM) {   // 头一点一点：慢慢往前栽，栽到底轻轻抬一下
        const o = (t % 5200) / 5200, dip = smooth(0, 0.7, o) * (1 - smooth(0.74, 0.86, o));
        rot += -3.2 * dip; y += 1.6 * dip; sy *= 1 - 0.012 * dip;
      }
    } else if (mood === 'alert' && settled) {
      const g = glance(t);
      if (g > 0.5) want = 'tilt';
      if (!RM) { rot += -3.5 * g; x += -1.5 * g; }
    } else if (mood === 'lively' && settled && !RM) {
      // 刚吃到鱼：不蹦不跳，慢慢左右晃，隔一阵点两下头
      rot += 2.4 * Math.sin(TAU * t / 2800);
      const o = (t - moodAt) % 5200, n = o > 1500 && o < 2220 ? Math.abs(Math.sin(Math.PI * (o - 1500) / 360)) : 0;
      y += 2.4 * n; sy *= 1 - 0.028 * n; sx *= 1 + 0.014 * n;
    }
    // 困了：打盹前眼皮先沉下来
    if (!nap && !FORCE && mood === 'calm' && t - lastTouch > NAP_AFTER - 650) want = 'blink';
    if (want === 'stand' && blinking(t)) want = 'blink';
    // 按着：先往下压一点，手感上有回应
    if (press) { const q = smooth(0, 90, t - press.at) * 0.05; sx *= 1 + q; sy *= 1 - q; }
    // 点一下：压扁回弹，阻尼大，不弹来弹去
    const pe = t - pokeAt;
    if (pe >= 0 && pe < 900 && !RM) { const q = pokeAmp * Math.exp(-pe / 150) * Math.cos(pe / 52); sx *= 1 + q; sy *= 1 - q; }
  }
  if (want !== 'stand' && !has[want]) want = 'stand';
  setPose(want, t);
  // 换图的那一下轻轻顿一顿，盖住两张图轮廓的差别（眨眼不顿：轮廓几乎一样）
  const pe = t - poseAt;
  if (!RM && (BIG[pose] || BIG[posePrev]) && pe >= 0 && pe < 420) { const q = 0.04 * Math.exp(-pe / 110) * Math.cos(pe / 40); sx *= 1 + q; sy *= 1 - q; }

  const still = !x && !y && !rot && sx === 1 && sy === 1;
  idle.style.transform = still ? '' :
    `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)` + (pivot ? ` translateY(${-pivot}px) rotate(${rot.toFixed(2)}deg) translateY(${pivot}px)` : ` rotate(${rot.toFixed(2)}deg)`) +
    ` scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
  // 影子：留在地上，离得越高越小越淡
  const h = Math.max(0, -y), air = H.on || fall ? smooth(0, 14, h) : 0;
  shadow.style.opacity = (air * (0.9 - 0.5 * smooth(0, 420, h))).toFixed(3);
  shadow.style.transform = air ? `translateX(${x.toFixed(2)}px) scale(${(1 - 0.45 * smooth(0, 420, h)).toFixed(3)})` : '';
  // 小 z：从头顶往左上飘，一个接一个
  zs.forEach((z, i) => {
    if (!nap || pose !== 'nap') { z.style.opacity = 0; return; }
    const p = RM ? 0.25 + i * 0.25 : ((t / 3300 + i / 3) % 1 + 1) % 1;
    z.style.opacity = (Math.sin(Math.PI * p) * 0.95).toFixed(3);
    z.style.transform = `translate(${(-4 - 20 * p + 3 * Math.sin(TAU * p * 1.5)).toFixed(2)}px, ${(-4 - 30 * p).toFixed(2)}px) scale(${(0.55 + 0.75 * p).toFixed(3)})`;
  });
}
let posePrev = 'stand';
const BIG = { nap: 1, tilt: 1 };
function setPose(p, t) {
  if (p === pose) return;
  posePrev = pose; pose = p; poseAt = FROZEN ? -1e9 : t;   // 定格时不要换图那一下的顿
  pen.classList.toggle('ip-blink', p === 'blink'); pen.classList.toggle('ip-nap', p === 'nap'); pen.classList.toggle('ip-tilt', p === 'tilt');
}

// ---------- 手势：点一下 / 拎起来 ----------
const scale = () => { const r = document.querySelector('#phone').getBoundingClientRect(); return r.width / 390 || 1; };
function beginLift(t) {
  if (!press) return;
  H.on = true; H.x = H.y = 0; H.rot = 0; H.vr = 0; H.vx = 0; H.vy = 0; H.lastT = t; H.lastX = H.tx; H.lastY = H.ty;
}
idle.addEventListener('pointerdown', e => {
  if (!active() || FROZEN) return;
  e.stopPropagation(); e.preventDefault();   // 不让这一下变成“转镜头”
  const t = now(); touch(t);
  try { idle.setPointerCapture(e.pointerId); } catch (_) {}
  // 落到一半又被接住：从现在的位置接着拎
  const mid = fall && (t - fall.at) / 1000 < fall.land;
  press = { id: e.pointerId, at: t, cx: e.clientX, cy: e.clientY, k: scale(), ox: 0, oy: 0 };
  H.tx = 0; H.ty = 0;
  if (mid) { const el = (t - fall.at) / 1000, p = smooth(0, 1, el / fall.land);
    press.ox = fall.x0 * (1 - p); press.oy = fall.y0 + fall.v0 * el + G_ * el * el / 2;
    fall = null; H.tx = press.ox; H.ty = press.oy; beginLift(t); H.x = press.ox; H.y = press.oy; }
  else fall = null;
});
idle.addEventListener('pointermove', e => {
  if (!press || e.pointerId !== press.id) return;
  const t = now(), dx = (e.clientX - press.cx) / press.k, dy = (e.clientY - press.cy) / press.k;
  if (!H.on && Math.hypot(dx, dy) > 6) beginLift(t);
  if (!H.on) return;
  // 不让它被拖出手机画面，也不让它钻到地面以下
  const nx = clamp(press.ox + dx, -288, 12), ny = clamp(press.oy + dy, -600, 4);
  const s = Math.max(1, t - H.lastT) / 1000;
  H.vy += ((ny - H.lastY) / s - H.vy) * 0.5; H.lastX = nx; H.lastY = ny; H.lastT = t;
  H.tx = nx; H.ty = ny;
});
function release(e) {
  if (!press || e.pointerId !== press.id) return;
  const t = now(); press = null; lastTouch = t;
  if (!H.on) {   // 没拎起来 = 点了一下：压扁回弹，慢慢眨一下眼
    pokeAt = t; extraBlinks.push({ at: t + 140, dur: 300 });
    return;
  }
  H.on = false;
  if (RM) { H.x = H.y = 0; return; }
  // 松手：带着松手那一刻的上下速度，按重力落回角落
  const x0 = H.x, y0 = Math.min(H.y, 0);
  let v0 = clamp(t - H.lastT < 80 ? H.vy : 0, -900, 600);
  let land = (-v0 + Math.sqrt(v0 * v0 + 2 * G_ * -y0)) / G_;
  // 贴着地被拖远了再松手：落地时间太短会像瞬移，给它一道刚好够回到角落的小弧线
  const need = clamp(Math.abs(x0) / 900, 0.12, 0.42);
  if (land < need) { land = need; v0 = (-y0 - G_ * land * land / 2) / land; }
  fall = { at: t, x0, y0, v0, r0: H.rot, land, vl: v0 + G_ * land };
  extraBlinks.push({ at: t + fall.land * 1000 + 180, dur: 280 });   // 落地以后慢慢眨一下，一脸淡定
}
idle.addEventListener('pointerup', release);
idle.addEventListener('pointercancel', release);
// 屏幕上别处有人碰：醒过来，重新开始算多久没人理
addEventListener('pointerdown', () => touch(now()), true);

// ---------- 跑起来 ----------
let last = performance.now();
function frame() {
  const n = performance.now(), dt = Math.min(34, n - last); last = n;
  update(now(), dt); render();
  requestAnimationFrame(frame);
}
if (FROZEN) { mood = calcMood(IT0); update(IT0, 0); render(); }
else requestAnimationFrame(frame);

window.__idle = {
  get it() { return now(); }, get mood() { return mood; }, get pose() { return pose; }, get nap() { return napping(now()); },
  get held() { return H.on; }, get falling() { return !!fall; }, get has() { return { ...has }; },
  get transform() { return idle.style.transform; }, get livelyLeft() { return Math.max(0, livelyUntil - now()); }
};
})();
