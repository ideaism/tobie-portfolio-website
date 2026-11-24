// 门上的三条约定（第五步，只有默认界面「冰箱贴」、只在厨房大冰箱的门上）：门板右下贴一张 CSS 画的小纸条，上面压一枚小磁铁，
// 纸条上只写“说好的”和三道手画短线。点一下：纸条从门上揭下来、放大到屏幕中间，三条照产品原文；再点一下贴回原位。
// 纸条在门板（.face）里、冰箱贴那层（.mags）下面：跟着门转、跟着门变暗，冰箱贴拖到它上面时盖在它上面。
// 外框（.rnote）不带变换（门转开一点时带变换的小块在 3D 里点不中），斜放的是里面的 .rn-paper。week.js 不改。
(function () {
  const APP = window.__app, K = APP && APP.mk;
  if (!K || !window.SKIN || SKIN.name !== 'a') return;
  const phone = document.getElementById('phone'), face = document.querySelector('#door .face');
  if (!phone || !face) return;
  const RM = APP.rm;
  const RULES = ['大家都能放的地方，东西要标一下是谁的', '不知道是谁的东西，任何人都可以标出来', '打算处理别人的东西，先挂 48 小时'];
  const LINES = '<svg class="rn-lines" viewBox="0 0 60 30" aria-hidden="true"><path d="M2 5.5c9-1.2 20 .8 31-.4 6-.6 11 .2 16-.3"/><path d="M2 15.2c7 .9 15-.9 24 .1 6 .6 10-.2 14 .2"/><path d="M2 24.6c11-1 22 .7 34-.3"/></svg>';
  const el = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };

  // ---------- 门上的纸条 ----------
  const note = el('div', 'rnote'); face.insertBefore(note, face.firstChild);   // 最底下：冰箱贴（.mags）、变暗（.shade）都在它上面
  note.setAttribute('role', 'button'); note.setAttribute('aria-label', '说好的');
  note.innerHTML = `<div class="rn-paper"><i class="rn-mag"></i><b>说好的</b>${LINES}</div>`;

  // ---------- 揭下来放大 ----------
  const big = el('div', '', phone); big.id = 'rulesBig';
  const dim = el('div', 'rb-dim', big);
  const paper = el('div', 'rb-paper', big);
  paper.innerHTML = `<i class="rn-mag"></i><b>说好的</b><ol>${RULES.map(r => `<li>${r.replace('，', '，<br>').replace('48 小时', '48&nbsp;小时')}</li>`).join('')}</ol>`;   // 在逗号处换行，字照原文
  const S = { on: false, busy: false };

  const can = () => APP.mode === 'closed' && APP.fridge === 0 && APP.cam.settled && !APP.tray.on;
  // 纸条在屏幕（手机框 390×844）上的位置
  const scale = () => { const r = phone.getBoundingClientRect(); return r.width / 390 || 1; };
  function rectOf(n) { const p = phone.getBoundingClientRect(), r = n.getBoundingClientRect(), k = scale(); return { x: (r.left - p.left) / k, y: (r.top - p.top) / k, w: r.width / k, h: r.height / k }; }
  function flip() {   // 大纸条贴回门上那张的样子：从大纸条的位置换算过去
    const a = rectOf(note.querySelector('.rn-paper')), b = { x: paper.offsetLeft, y: paper.offsetTop, w: paper.offsetWidth, h: paper.offsetHeight };
    const s = a.w / b.w;
    return `translate(${(a.x + a.w / 2 - (b.x + b.w / 2)).toFixed(2)}px, ${(a.y + a.h / 2 - (b.y + b.h / 2)).toFixed(2)}px) scale(${s.toFixed(4)}) rotate(4deg)`;
  }
  function open() {
    if (S.on || S.busy || !can()) return;
    S.on = true; S.busy = true;
    APP.lock(true);
    big.classList.add('on');
    const from = flip();
    note.classList.add('lifted');
    dim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RM ? 1 : 260, fill: 'forwards' });
    paper.animate([{ transform: from, boxShadow: '0 1px 2px rgba(40,30,15,.3)' }, { transform: 'translate(0, -14px) scale(1.04) rotate(-3deg)', offset: .55 }, { transform: 'rotate(-1.5deg)', boxShadow: '0 18px 40px rgba(40,30,15,.32)' }],
      { duration: RM ? 1 : 520, easing: 'cubic-bezier(.25, .9, .35, 1)', fill: 'forwards' }).finished.then(() => { S.busy = false; }, () => { S.busy = false; });
  }
  function close() {
    if (!S.on || S.busy) return;
    S.busy = true;
    const to = flip();
    dim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: RM ? 1 : 300, fill: 'forwards' });
    paper.animate([{ transform: 'rotate(-1.5deg)' }, { transform: to, boxShadow: '0 1px 2px rgba(40,30,15,.3)' }], { duration: RM ? 1 : 380, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' }).finished.then(() => {
      note.classList.remove('lifted'); big.classList.remove('on');
      paper.getAnimations().forEach(a => a.cancel()); dim.getAnimations().forEach(a => a.cancel());
      APP.lock(false); S.on = false; S.busy = false;
      note.querySelector('.rn-paper').animate([{ scale: '1.08' }, { scale: '.97' }, { scale: '1' }], { duration: RM ? 1 : 260, easing: 'ease-out' });   // 贴回去时按一下
    }, () => { S.busy = false; });
  }
  // 按在纸条上：不转镜头、不开门（这一下归纸条）；门开着、转着时让给门
  note.addEventListener('pointerdown', e => { if (can()) e.stopPropagation(); });
  note.addEventListener('click', e => { if (!can()) return; e.stopPropagation(); open(); });
  ['pointerdown', 'pointermove', 'pointerup', 'wheel'].forEach(t => big.addEventListener(t, e => e.stopPropagation(), t === 'wheel' ? { passive: true } : undefined));
  big.addEventListener('click', e => { e.stopPropagation(); close(); });

  window.RULES = { open, close, get on() { return S.on; }, get rect() { return rectOf(note); } };
})();
