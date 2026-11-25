// 垃圾桶（改版 B：左下角探出一只胖桶。只有默认界面「冰箱贴」）
// 平时屏幕上没有桶。拖起东西（从层上拖、或者拿起来以后往下拉）时，一只 Q 版胖桶从左下角底边下面弹上来，探出大半个身子，晃一晃；底栏淡掉、往下沉。
// 拖着走的时候桶跟着东西变大小：东西离桶越近桶越大，离企鹅越近桶越小（连续变化，弹簧跟随）。
// 东西到了桶上：盖子绕左后方的铰链大大掀开，桶身往东西那边歪一点；东西缩小一点、往桶口偏一点（app.js 读 pull / aim），盖子露在外面。
// 松手进桶：盖子落下，桶“咕”地一缩，跳一下，再沉回底边下面。松在别处：桶直接沉回去。
// 不换鱼的东西（还新鲜的、没计划的、没人认的、冻着的）扔进这里；换鱼的扔进来也照样庆祝（app.js 的 binDone）。
// 图是 img/trim/bin-q-a.webp（435×600，卡 20261120-011 选的 A 踏板桶，原来像电饭煲的 bin-q.webp 留着没用）一张：叠两份，一份只露盖子、一份只露桶身。分界按图上量出来的接缝（两边高、中间低的弧线）
// 用同一串点切，两份不重叠，掀盖子时不会带着一条绿边转。不接手势（pointer-events: none）。
// 冷冻托盘开着时也出来、也接东西（托盘上冻着的东西能直接扔）。
// 给 app.js 的口子 window.BIN：
//   up(force)   拖起东西了：桶弹上来（force 是“处理掉它”）   down()  松手没进桶：桶沉回去
//   track(x, y) 拖着时每帧报一次东西（中心，手机坐标）在哪：桶跟着变大小、到了桶上掀盖子；返回在不在桶上
//   hovering    东西现在在不在桶上（带一点回差：进来要近一点，出去要远一点）   pull  0–1，到了桶上的程度（平滑过的）
//   aim()       东西到了桶上时往哪偏（桶口右上方一点）            mouth() 桶口在哪（手机坐标，跟着桶动）
//   open()      要扔进来了：盖子掀开                             shut()  东西进去了：盖子落下，咕一下、跳一下，再沉回去
//   over(x, y)  这一点在不在桶上（按 hovering 的范围算）           notYet() 企鹅头上冒一句“这件还不急”（1.5 秒）
// 桶按真实时间走（自己的 requestAnimationFrame）。
(function () {
  const AP = window.__app;
  if (!AP || !AP.mk || !window.SKIN || SKIN.name !== 'a') return;   // 旧界面 ?skin=0、方向 B：没有垃圾桶
  const phone = document.getElementById('phone'), pen = document.getElementById('penguin'), bar = document.getElementById('bottombar');
  if (!phone || !pen) return;
  const RM = !!AP.rm;
  // 桶的盒子（缩放 1 时）：宽 117、高 161（图 435×600，宽和换图前一样，所以高了）；底边在 854（比屏幕底边 844 低 10，脚藏在下面）；缩放以底边中点为原点
  const W0 = 117, H0 = 161, X0 = 20, BOT = 854, CX = X0 + W0 / 2;
  // 接缝（在 bin-q-a.webp 上逐列量的：盖子和垃圾袋之间那道深色细缝的正中）：[x 占图宽 %, y 占图高 %]。
  // 两边高（20.7%）、中间低（24.9%）。盖子和桶身用同一串点切，不重叠也不留缝
  const SEAM = [[0, 20.67], [1.1, 21], [2.5, 21.42], [3.4, 21.83], [5.5, 22.5], [8.3, 23.08], [11, 23.5], [13.8, 23.83], [16.6, 24], [19.5, 24.33],
    [22.3, 24.42], [25.1, 24.58], [27.8, 24.67], [30.6, 24.75], [33.3, 24.83], [38.9, 24.83], [41.6, 24.92], [58.4, 24.92], [61.1, 24.83], [66.7, 24.83],
    [69.4, 24.75], [72.2, 24.67], [74.9, 24.5], [77.7, 24.42], [80.5, 24.25], [83.2, 24.08], [86.2, 23.75], [89, 23.5], [91.7, 23], [94.5, 22.5],
    [96.8, 21.67], [97.9, 21.33], [98.9, 21], [100, 20.67]];
  const pts = a => a.map(([x, y]) => `${x}% ${y}%`).join(', ');
  const LIDCLIP = `polygon(0% 0%, 100% 0%, ${pts(SEAM.slice().reverse())})`;
  const BODYCLIP = `polygon(${pts(SEAM)}, 100% 100%, 0% 100%)`;

  const el = document.createElement('div'); el.id = 'bin';
  el.innerHTML = '<div class="bb"><div class="mouth"></div><img class="body" alt="" draggable="false"><img class="lid" alt="" draggable="false"></div>';
  phone.insertBefore(el, pen);   // 和企鹅同一层：在托盘、冰箱、底栏上面，在压暗层、白卡、拿着的东西下面
  Object.assign(el.style, { left: X0 + 'px', top: (BOT - H0) + 'px', width: W0 + 'px', height: H0 + 'px' });
  const bb = el.querySelector('.bb'), lid = el.querySelector('.lid'), body = el.querySelector('.body'), mouth = el.querySelector('.mouth');
  body.src = lid.src = 'img/trim/bin-q-a.webp';
  lid.style.clipPath = LIDCLIP;

  const say = document.createElement('div'); say.id = 'binSay'; say.textContent = '这件还不急';
  phone.insertBefore(say, pen.nextSibling);

  // p 探出量（0 藏在底边下面，1 探出来），弹簧跟 pt：上来时有一点过冲，沉下去不过冲
  // sc 大小（弹簧跟 sct）；ln 歪的角度（度，弹簧跟 lnt，弹上来时晃一晃）；a 盖子掀开量（0 合着，1 掀到底）
  // bump 咕一下（压扁）；hy 跳起来的高度（像素，负的是往上）
  const S = { p: 0, pv: 0, pt: 0, sc: 1, sv: 0, sct: 1, ln: 0, lv: 0, lnt: 0, a: 0, v: 0, tg: 0, hov: false, pull: 0,
    bump: 0, bv: 0, armed: false, hy: 0, hv: 0, hopAt: -1, sinkAt: -1, wob: false, sayT: -1 };
  const MAXDEG = 60;                                             // 盖子掀到底的角度（绕左后方的铰链往左上翻）
  const SC_NEAR_PEN = 0.7, SC_NEAR_BIN = 1.18, SC_OVER = 1.25;   // 桶的大小：靠近企鹅 0.7，靠近桶 1.18，到了桶上 1.25
  const PEN = { x: 296 + 39.5, y: 660 + 55 };                    // 企鹅中心（和 app.js 的 PC 一样）
  const BINC = { x: CX, y: 772 };                                // 量远近用的桶中心（缩放 1 时桶口一带）
  // 接东西的范围（东西中心，手机坐标）：进来要到 x < 142、y > 712；已经在桶上时放宽到 x < 156、y > 698，免得在边上来回闪
  const ZIN = { r: 142, t: 712 }, ZOUT = { r: 156, t: 698 };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function up(force) {
    // 冷冻托盘开着也出来：托盘上的东西也能拖进桶里（force 留着：白卡上点了“处理掉它”）
    if (S.pt !== 1) { S.pt = 1; S.wob = false; S.sinkAt = -1; S.hopAt = -1; S.hy = 0; S.hv = 0; }
    else { S.sinkAt = -1; S.hopAt = -1; }   // 刚扔完、还没沉下去就又拖起一件：别再按上一次的时间沉下去（不然拖到一半桶没了）
  }
  function down() { S.pt = 0; S.hov = false; S.tg = 0; S.lnt = 0; S.sinkAt = -1; }
  function inZone(x, y, z) { return x > -40 && x < z.r && y > z.t && y < 900; }
  function over(x, y) { return S.pt === 1 && S.p > 0.3 && inZone(x, y, S.hov ? ZOUT : ZIN); }
  function track(x, y) {
    if (S.pt !== 1) { S.hov = false; return false; }
    const on = over(x, y);
    if (on !== S.hov) { S.hov = on; S.tg = on ? 1 : 0; }
    // 远近：r = 到桶的距离 /（到桶 + 到企鹅），0 在桶上、1 在企鹅身上
    const dB = Math.hypot(x - BINC.x, y - BINC.y), dP = Math.hypot(x - PEN.x, y - PEN.y), r = dB / (dB + dP + 1e-6);
    S.sct = on ? SC_OVER : SC_NEAR_BIN - (SC_NEAR_BIN - SC_NEAR_PEN) * smooth(0.12, 0.88, r);
    if (RM) S.sct = 1 + (S.sct - 1) * 0.4;   // 减少动态效果：大小只变一点
    // 到了桶上：往东西那边歪几度（东西多半在右上方，往右歪）
    S.lnt = on && !RM ? Math.max(-5, Math.min(7, (x - CX + 30) / 10)) : 0;
    return on;
  }
  function hover(on) { if (!on && S.hov) { S.hov = false; S.tg = 0; S.lnt = 0; } }   // 旧口子：只用来取消
  function open() { S.tg = 1; }
  function shut() {
    S.hov = false; S.tg = 0; S.armed = true; S.v = Math.min(S.v, -2); S.lnt = 0;
    const now = performance.now();
    if (RM) { S.sinkAt = now + 250; return; }
    S.hopAt = now + 330; S.sinkAt = now + 900;   // 盖子落下 → 碰到桶沿咕一下 → 跳一下 → 沉回去（盖子落到桶沿时按那一刻重新排）
  }
  function dropY() { return (1 - S.p) * (H0 * Math.max(1, S.sc) + 36); }
  // 桶上一点（盒子里的比例）此刻在手机上的位置：按 .bb 的变换（以底边中点为原点：平移、歪、缩放、压扁）算
  function ptAt(fx, fy) {
    const t = (pen.style.translate || '').split(' ').map(parseFloat);
    const sk = Math.max(0, -S.hv / 270) * 0.05, sx = S.sc * (1 + S.bump * 0.12 - sk * 0.5), sy = S.sc * (1 - S.bump * 0.15 + sk);   // sk：往上蹬时拉长一点
    const lx = (fx - 0.5) * W0 * sx, ly = (fy - 1) * H0 * sy, r = S.ln * Math.PI / 180;
    const rx = lx * Math.cos(r) - ly * Math.sin(r), ry = lx * Math.sin(r) + ly * Math.cos(r);
    return { x: CX + rx + (t[0] || 0), y: BOT + dropY() + S.hy + ry + (t[1] || 0) };
  }
  function mouthAt() { return ptAt(0.5, 0.22); }   // 桶口椭圆的中心（bin.css 的 .mouth）
  function aim() { const m = mouthAt(); return { x: m.x + 16 * S.sc, y: m.y - 34 * S.sc }; }
  function notYet() { S.sayT = performance.now(); }

  let last = performance.now(), barOn = false;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (S.hopAt > 0 && now >= S.hopAt) { S.hopAt = -1; S.hv = -270; }
    if (S.sinkAt > 0 && now >= S.sinkAt) { S.sinkAt = -1; S.pt = 0; }
    // 探出：上来快、带过冲；沉下去稳一点。减少动态效果时只淡入淡出
    if (RM) { S.p += (S.pt - S.p) * (1 - Math.exp(-dt / 0.06)); S.pv = 0; }
    else {
      const k = S.pt > S.p ? 260 : 150, c = S.pt > S.p ? 19 : 25;
      S.pv += (k * (S.pt - S.p) - c * S.pv) * dt; S.p += S.pv * dt;
    }
    if (S.pt === 0 && S.p < 0.004 && Math.abs(S.pv) < 0.05) { S.p = 0; S.pv = 0; }
    if (S.pt === 1 && !S.wob && S.p > 0.8) { S.wob = true; if (!RM) S.lv -= 75; }   // 快到位时晃一晃
    // 大小、歪：弹簧跟随（不跳）
    S.sv += (120 * (S.sct - S.sc) - 15 * S.sv) * dt; S.sc += S.sv * dt;
    if (S.p < 0.02 && S.pt === 1) { S.sc = S.sct; S.sv = 0; }   // 刚开始往上弹：直接用该有的大小
    S.lv += (150 * (S.lnt - S.ln) - 8 * S.lv) * dt; S.ln += S.lv * dt;
    if (RM) { S.ln = 0; S.lv = 0; }
    // pull：到了桶上的程度，app.js 用来缩小、偏移手里的东西
    S.pull += ((S.hov ? 1 : 0) - S.pull) * (1 - Math.exp(-dt / 0.09));
    if (S.pull < 1e-3 && !S.hov) S.pull = 0;
    // 盖子：掀开时快、合上时稍慢，碰到桶沿（a < 0）弹回一点，同时桶身咕一下
    const k = S.tg > S.a ? 190 : 150, c = S.tg > S.a ? 17 : 13;
    S.v += (k * (S.tg - S.a) - c * S.v) * dt; S.a += S.v * dt;
    if (RM) S.a = Math.min(1, S.a);
    if (S.a < 0) {
      if (S.armed && S.v < -0.6 && !RM) {
        if (S.hopAt > 0) { S.bv += 8; S.hopAt = now + 120; S.sinkAt = now + 640; }   // 东西刚进去、盖子第一次落到桶沿：咕一下（压扁），稍后跳
        else S.bv += Math.min(2, -S.v * 0.3);
        S.v = -S.v * 0.3; S.armed = S.v > 0.6;
      }
      else { S.v = Math.max(0, S.v); S.armed = false; }
      S.a = 0;
    }
    if (S.tg === 0 && S.a < 1e-3 && Math.abs(S.v) < 1e-2) { S.a = 0; S.v = 0; }
    S.bv += (-300 * S.bump - 13 * S.bv) * dt; S.bump += S.bv * dt;
    if (Math.abs(S.bump) < 1e-4 && Math.abs(S.bv) < 1e-3) S.bump = S.bv = 0;
    // 跳：往上一蹬，落回来
    if (S.hv || S.hy) { S.hv += 2600 * dt; S.hy += S.hv * dt; if (S.hy >= 0) { S.hy = 0; S.hv = 0; } }

    const shown = S.p > 0.002 || S.pt === 1;
    if (el.classList.contains('up') !== shown) el.classList.toggle('up', shown);   // 没出来时藏着（bin.css）
    if (shown) {
      const sk = Math.max(0, -S.hv / 270) * 0.05, sx = S.sc * (1 + S.bump * 0.12 - sk * 0.5), sy = S.sc * (1 - S.bump * 0.15 + sk);   // sk：往上蹬时拉长一点
      bb.style.transform = `translateY(${(dropY() + S.hy).toFixed(2)}px) rotate(${S.ln.toFixed(2)}deg) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
      lid.style.transform = S.a ? `rotate(${(-MAXDEG * S.a).toFixed(2)}deg)` : '';
      // 盖子合着时桶身整张露出来（接缝处没有切口的细线），掀开了才按接缝切
      const bc = S.a > 1e-3 ? BODYCLIP : '';
      if (body.style.clipPath !== bc) body.style.clipPath = bc;
      mouth.style.opacity = Math.min(1, S.a * 4).toFixed(3);
      if (RM) el.style.opacity = Math.min(1, S.p).toFixed(3);
    }
    // 底栏：桶上来时淡掉、往下沉；桶收好了把样式还回去
    if (bar) {
      const q = Math.min(1, Math.max(0, S.p));
      if (q > 0.001) {
        bar.style.opacity = (1 - q).toFixed(3); bar.style.translate = RM ? '' : `0 ${(16 * q).toFixed(2)}px`;
        bar.style.pointerEvents = q > 0.5 ? 'none' : ''; barOn = true;
      } else if (barOn) { bar.style.opacity = ''; bar.style.translate = ''; bar.style.pointerEvents = ''; barOn = false; }
    }
    // 跟企鹅一样按视差错开（app.js 写在 #penguin 的 translate 上）
    if (el.style.translate !== pen.style.translate) el.style.translate = pen.style.translate;
    // 这件还不急：淡入 160 毫秒、停住、最后 300 毫秒淡出，一共 1.5 秒
    const st = S.sayT < 0 ? -1 : now - S.sayT;
    if (st >= 0 && st < 1500) {
      const o = Math.min(1, st / 160) * (1 - Math.max(0, (st - 1200) / 300));
      say.style.display = 'block'; say.style.opacity = o.toFixed(3);
      say.style.translate = `0 ${((1 - Math.min(1, st / 220)) * 5).toFixed(2)}px`;
    } else if (say.style.display !== 'none') { say.style.display = 'none'; S.sayT = -1; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.BIN = { up, down, track, over, hover, open, shut, mouth: mouthAt, aim, notYet,
    get hovering() { return S.hov; }, get pull() { return S.pull; },
    get state() { return { p: +S.p.toFixed(3), pt: S.pt, sc: +S.sc.toFixed(3), sct: +S.sct.toFixed(3), lean: +S.ln.toFixed(2), a: +S.a.toFixed(3), tg: S.tg,
      hover: S.hov, pull: +S.pull.toFixed(3), bump: +S.bump.toFixed(4), hop: +S.hy.toFixed(2), say: say.style.display === 'block' }; } };
})();
