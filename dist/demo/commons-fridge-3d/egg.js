// 拎起角落企鹅时的表情和两个彩蛋。
// 这只是严肃的那只：严肃、克制、嘴硬，不卖萌不蹦跳。喜感全在“一个严肃的人被冒犯了”：
//   拎起来那一下吓一跳（张嘴睁圆眼 0.45 秒，头顶一个“!”）→ 歪头斜眼瞥你，脑门边一滴汗慢慢滑下来 → 拎久了冒一句“……放我下来。”
//   彩蛋一 摇晕：拎着左右来回甩（1.5 秒里横向掉头 4 次以上、每次够远）→ 闭眼、头顶三颗小星星绕圈、“……晕。”；落地后星星再转 1.5 秒
//   彩蛋二 数着呢：同一次打开页面里第 5 次拎起来说“……第五次了。”，第 10 次说“……随你。”，之后不再数
// 只读 window.__idle（held / falling / transform / has）、window.__app（mode）和 #penguin 上的类，idle.js 的状态一样不碰。
// 换脸：#penguin 上加自己的 eg-* 类，egg.css 用更具体的选择器把要的那张 pose 图显示出来、别的压下去（图都是现成的，DOM 里已有）。
// 只在默认界面、非定格（没有 ?t=）、idle.js 启动了时生效；?egg=0 关掉。
// 自测用：window.__egg = { face, dizzy, lifts, bubble }
(() => {
'use strict';
const idle = window.__idle, app = window.__app, phone = document.querySelector('#phone'), pen = document.querySelector('#penguin');
const lean = pen && pen.querySelector('.lean');
if (!idle || !app || !phone || !pen || !lean) return;
const qs = new URLSearchParams(location.search);
if (!(window.SKIN && SKIN.name === 'a') || qs.has('t') || qs.get('idle') === '0' || qs.get('egg') === '0') return;
if (qs.has('it') || qs.has('lift')) return;   // idle.js 的定格调试：不掺和
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches || qs.get('rm') === '1';
const TAU = Math.PI * 2;

// ---------- 搭架子：跟着身子走的放在 .lean 里，气泡放在手机画面上（保持正着） ----------
const el = (cls, host) => { const d = document.createElement('div'); d.className = cls; host.append(d); return d; };
const fx = el('egfx', lean);
const head = el('eg-head', fx);      // 头顶那一点：气泡和星星都按它定位
const bang = el('eg-bang', fx);
const sweat = el('eg-sweat', fx);
const stars = el('eg-stars', fx);
const ss = [0, 1, 2].map(() => el('eg-star', stars));
const bub = document.createElement('div'); bub.id = 'egBubble'; pen.after(bub);
if (RM) { pen.classList.add('eg-rm'); bub.classList.add('rm'); }

// 这张图在不在（加载失败的姿势不用）
const ok = n => {
  if (n === 'eat') { const i = lean.querySelector('img.pose.eat'); return !!(i && i.complete && i.naturalWidth > 0); }
  const h = idle.has; return !!(h && h[n]);
};

// ---------- 状态 ----------
const S = { on: false, held: false, at: 0, face: '', dizzy: false, lifts: 0, line: '', bubAt: 1e9, bubble: '', landAt: null,
  sweatOn: false, x: null, d: 0, m: 0, turn: 0, revs: [] };

function setFace(f) {
  if (f === S.face) return;
  S.face = f;
  const img = f === 'shock' ? (ok('eat') ? 'eat' : ok('tilt') ? 'tilt' : '') : f === 'side' ? (ok('tilt') ? 'tilt' : '') : f === 'dizzy' ? (ok('blink') ? 'blink' : '') : '';
  pen.classList.toggle('eg-face', !!img);
  ['eat', 'tilt', 'blink'].forEach(n => pen.classList.toggle('eg-f-' + n, img === n));
}
function restart(cls) { pen.classList.remove(cls); void pen.offsetWidth; pen.classList.add(cls); }
function say(text) {
  if (S.bubble === text) return;
  S.bubble = text; bub.textContent = text;
  bub.classList.add('on'); phone.classList.add('egg-talk');
  place();
}
function hush() { S.bubble = ''; bub.classList.remove('on'); phone.classList.remove('egg-talk'); }
function clearAll() {
  S.on = false; S.dizzy = false; S.landAt = null; S.sweatOn = false; S.bubAt = 1e9;
  setFace(''); pen.classList.remove('eg-bang', 'eg-sweat', 'eg-dizzy'); hush();
}

function onLift(t) {
  if (S.lifts < 10) S.lifts++;   // 数到 10 就不数了
  S.on = true; S.at = t; S.dizzy = false; S.landAt = null; S.sweatOn = false;
  S.x = null; S.d = 0; S.revs = [];
  const n = S.lifts;
  S.line = n === 5 && !S.said5 ? '……第五次了。' : n === 10 && !S.said10 ? '……随你。' : '……放我下来。';
  if (n === 5) S.said5 = true; if (n === 10) S.said10 = true;
  S.bubAt = S.line === '……放我下来。' ? 1400 : 520;   // 数着的那两句一被拎起来就说
  pen.classList.remove('eg-sweat', 'eg-dizzy'); hush();
  setFace('shock'); restart('eg-bang');
}
function onRelease(t) {
  if (!S.dizzy) { clearAll(); return; }   // 没晕：表情收掉，交还给 idle.js（它落地会自己眨眼）
  hush();                                   // 晕了：话不说了，星星接着转，落地后再转 1.5 秒
}
function dizzy() {
  S.dizzy = true; setFace('dizzy');
  pen.classList.remove('eg-sweat', 'eg-bang'); pen.classList.add('eg-dizzy');
  S.bubble = ''; say('……晕。');
}

// 横向甩：盯着企鹅的横向位移（idle.js 写在 .idle 上的 translate），走过头再往回 26 像素算一次掉头；
// 这一趟要走够 40 像素才算数（正常拖过去再拖回来只有一两次掉头，碰不到 4 次）
const TX = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/;
function shake(t) {
  const m = TX.exec(idle.transform || ''); if (!m) return;
  const x = +m[1];
  if (S.x == null) { S.x = S.m = S.turn = x; return; }
  S.x = x;
  if (!S.d) { if (Math.abs(x - S.turn) > 10) { S.d = Math.sign(x - S.turn); S.m = x; } return; }
  if ((x - S.m) * S.d > 0) { S.m = x; return; }
  if (Math.abs(S.m - x) > 26) {
    if (Math.abs(S.m - S.turn) >= 40) S.revs.push(t);
    S.turn = S.m; S.d = -S.d; S.m = x;
  }
  while (S.revs.length && t - S.revs[0] > 1500) S.revs.shift();
  if (S.revs.length >= 4) dizzy();
}

// 气泡：跟着头走，尾巴朝企鹅；左边放不下就放右边；不出 390 宽的手机画面
function place() {
  if (!S.bubble) return;
  const pr = phone.getBoundingClientRect(), k = pr.width / 390 || 1, hr = head.getBoundingClientRect();
  const hx = (hr.left + hr.width / 2 - pr.left) / k, hy = (hr.top + hr.height / 2 - pr.top) / k;
  const w = bub.offsetWidth, h = bub.offsetHeight || 38;
  let left = hx - 30 - w, right = false;
  if (left < 8) { left = hx + 30; right = true; }
  left = Math.min(Math.max(left, 8), 390 - 8 - w);
  const top = Math.min(Math.max(hy + 4 - h / 2, 50), 844 - 70 - h);
  bub.classList.toggle('r', right);
  bub.style.transform = `translate(${left.toFixed(1)}px, ${top.toFixed(1)}px)`;
}
function renderStars(t) {
  if (!S.dizzy) return;
  ss.forEach((s, i) => {
    const a = (RM ? 0.6 : t / 1100 * TAU) + i * TAU / 3, z = Math.sin(a);
    s.style.transform = `translate(${(25 * Math.cos(a)).toFixed(2)}px, ${(7 * z).toFixed(2)}px) scale(${(0.82 + 0.22 * z).toFixed(3)}) rotate(${RM ? 0 : (t / 6) % 360 | 0}deg)`;
    s.style.opacity = (0.72 + 0.28 * z).toFixed(3);
    s.style.zIndex = z > 0 ? 2 : 0;
  });
}

// ---------- 每帧 ----------
function weekUI() { return phone.classList.contains('week-hush') || !!document.querySelector('#weekSheet.show'); }
function frame() {
  const t = performance.now();
  const held = !!idle.held, active = (app.mode === 'open' || app.mode === 'closed') && !weekUI();
  // 从拎起到落回角落、表情收干净为止，冰箱那句提示一直藏着（没晕的松手后还在往下落时也藏，免得它先冒出来指着空角落）
  phone.classList.toggle('egg-hold', active && (held || S.on || !!idle.falling));
  if (!active) { if (S.on) clearAll(); S.held = held; requestAnimationFrame(frame); return; }
  if (held && !S.held) onLift(t);
  else if (!held && S.held && S.on) onRelease(t);
  S.held = held;
  if (S.on) {
    if (held) {
      const e = t - S.at;
      if (!S.dizzy) shake(t);
      if (!S.dizzy) {
        setFace(e < 450 ? 'shock' : 'side');
        if (e >= 450 && !S.sweatOn) { S.sweatOn = true; restart('eg-sweat'); if (RM) pen.classList.remove('eg-bang'); }   // 不要动效时“!”不淡出，换脸时直接收掉
        if (e >= S.bubAt) say(S.line);
      }
    } else if (S.dizzy) {
      if (!idle.falling && S.landAt == null) S.landAt = t;
      if (S.landAt != null && t - S.landAt > 1500) clearAll();
    }
    renderStars(t);
    place();
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

window.__egg = { get face() { return S.face; }, get dizzy() { return S.dizzy; }, get lifts() { return S.lifts; }, get bubble() { return S.bubble; } };
})();
