// 鱼和冰箱贴怎么来（打算 · 三，方向 A）：只有默认界面「冰箱贴」有。不改 manage.js，只往它的面板里加东西。
// “查看处理”打开后，顶上严肃那只企鹅和它的话下面加一行小字：鱼几条 · 冰箱贴几枚 + ⓘ；点了从底下升上来一张小卡，三行字，没有企鹅图（一个画面只有一只企鹅）。
// 鱼数读 window.__app.fish；冰箱贴数读 week.js 的 window.__week.magnets（还没贴到门上的那枚不算）。每次面板打开时重读。
// 自测用：window.FISHINFO = { open(), close(), get on(), get line() }
(function () {
  const APP = window.__app, D = window.FRIDGE;
  if (!APP || !D || !window.SKIN || SKIN.name !== 'a' || !window.MANAGE) return;
  const phone = document.getElementById('phone'), layer = document.getElementById('mgLayer');
  const head = layer && layer.querySelector('.mghead');
  if (!phone || !head) return;
  const RM = APP.rm;
  const el = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  const INFO = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.6"/><path d="M8 7.2v4"/><circle cx="8" cy="4.9" r=".55" class="dot"/></svg>';
  const counts = () => ({ fish: APP.fish, mag: window.__week ? __week.magnets.filter(m => !m.pending).length : 0 });

  // ---------- 顶上那一行 ----------
  const line = el('button', 'fiinfo', head); line.type = 'button';
  line.setAttribute('aria-label', '鱼和冰箱贴怎么来');
  function fill() {
    const c = counts();
    line.innerHTML = `<img src="${D.img}fish.webp" alt="鱼" draggable="false"><span>${c.fish} · 冰箱贴 ${c.mag}</span><i>${INFO}</i>`;
    if (card) card.querySelector('.finow').textContent = `现在：鱼 ${c.fish} 条，冰箱贴 ${c.mag} 枚`;
  }

  // ---------- 小卡：从底下升上来，盖住底栏；点哪儿都收回去 ----------
  const wrap = el('div', '', phone); wrap.id = 'fiLayer';
  const dim = el('div', 'fidim', wrap);
  const card = el('div', 'ficard', wrap);
  card.innerHTML = '<p>东西在放坏前吃掉，企鹅得一条鱼</p><p>一周里冰箱没有放坏的东西，周日门上多一枚冰箱贴</p><p class="finow"></p>';
  ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'click'].forEach(t => wrap.addEventListener(t, e => e.stopPropagation(), t === 'wheel' ? { passive: true } : undefined));
  const S = { on: false, busy: false };
  const ease = 'cubic-bezier(.2, 1.12, .35, 1)';
  function open() {
    if (S.on || S.busy || !MANAGE.on) return;
    S.on = true; fill(); wrap.classList.add('on');
    [card, dim].forEach(x => x.getAnimations().forEach(a => a.cancel()));
    card.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: RM ? 1 : 380, easing: ease, fill: 'forwards' });
    dim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RM ? 1 : 240, fill: 'forwards' });
  }
  function close() {
    if (!S.on || S.busy) return;
    S.busy = true;
    const a = card.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: RM ? 1 : 240, easing: 'cubic-bezier(.5, 0, .75, .4)', fill: 'forwards' });
    dim.animate([{ opacity: 1 }, { opacity: 0 }], { duration: RM ? 1 : 240, fill: 'forwards' });
    a.finished.then(() => { wrap.classList.remove('on'); S.on = false; S.busy = false; }, () => { S.busy = false; });
  }
  line.addEventListener('click', e => { e.stopPropagation(); open(); });
  wrap.addEventListener('click', () => close());

  // 面板一打开就重读两个数；面板收起时小卡也收起
  new MutationObserver(() => {
    if (phone.classList.contains('mg-open')) fill();
    else if (S.on) { wrap.classList.remove('on'); S.on = false; S.busy = false; }
  }).observe(phone, { attributes: true, attributeFilter: ['class'] });
  fill();

  window.FISHINFO = { open, close, get on() { return S.on; }, get line() { return line.textContent; } };
})();
