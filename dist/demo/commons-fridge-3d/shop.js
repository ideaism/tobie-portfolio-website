// 买菜前看一眼（第五步，只有默认界面「冰箱贴」）：底栏“买菜前看一眼”点开，门自己打开，下半屏升起一张卡，上半屏还看得到冰箱的几层。
// 卡沿上探出开心那只企鹅；角落严肃的那只藏起来（一个画面只有一只）。
// 第一块“需要先吃掉的”：和企鹅气泡、“查看处理”最上面一组同一份（MARKS.attention）—— 计划过了大半、过了的；这台的在前再另一台，不截件数。
//   每行名字后面一行小字“放了 N 天”（和详情卡同一个字段），同名的两件靠它分开。
//   卡一升起，这几件在后面的层上轻轻跳一下、亮一圈；点哪一行那一件再跳一下。一件都没有写产品原话。
// 第二块把产品的“屋内已经有的”“哪一区还有空间”合成一块：每层一行“名字　N 件　还有空间”，点一下换成“满了”（再点换回来）。
//   标了“满了”的层：名牌末尾一个“满”字章（marks.js），“更新”“拿出来解冻”选层时带章（skin.js），“放入”选层时带章（这里接，add.js 不改）。
//   只是提示，照样能放。产品底下那句“这一屏不改任何东西。”不放（手动标满了就是在改）。
(function () {
  const APP = window.__app, K = APP && APP.mk, D = window.FRIDGE;
  if (!K || !window.SKIN || SKIN.name !== 'a' || !window.MARKS || !D || !D.fridges) return;
  const phone = document.getElementById('phone'), bar = document.getElementById('bottombar');
  const sides = document.querySelectorAll('#bottombar .side'), btn = sides[sides.length - 1];
  if (!phone || !bar || !btn) return;
  const RM = APP.rm;
  const ORDER = { overdue: 0, midway: 1, ontrack: 2, quiet: 3, paused: 4 };
  const S = { on: false, busy: false, first: [], seq: 0 };
  const el = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const later = (ms, fn) => setTimeout(fn, ms);

  // ---------- 卡 ----------
  const layer = el('div', '', phone); layer.id = 'shopLayer';
  const above = el('div', 'shabove', layer);   // 上半屏：点一下收起
  const wrap = el('div', 'shwrap', layer);     // 企鹅和卡一起升：企鹅在卡后面，卡没到位时不会先露出来
  const peng = el('img', 'shpeng', wrap); peng.src = D.img + 'penguin-happy-stand.webp'; peng.alt = ''; peng.draggable = false;
  const card = el('div', 'shcard', wrap);
  const scroll = el('div', 'shscroll', card);
  ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'click'].forEach(t => layer.addEventListener(t, e => e.stopPropagation(), t === 'wheel' ? { passive: true } : undefined));

  // ---------- 数据 ----------
  const nameOf = it => it.name || D.names[it.img];
  const recsOf = F => {   // 层板上的、“+N”里的（冻着的没有计划，不会进“需要先吃掉的”）
    const ids = F.data.items.map(i => i.id);
    if (F.hid) Object.keys(F.hid).forEach(t => F.hid[t].forEach(i => ids.push(i.id)));
    return ids.map(id => F.recs[id]).filter(r => r && r.frz == null);
  };
  // 和气泡、“查看处理”最上面一组同一份单子（MARKS.attention）：这台的在前，再另一台的；不截件数
  const eatFirst = () => [K.cur, ...K.FR.filter(F => F !== K.cur)].flatMap(F => MARKS.attention(F));
  const countOf = (F, t) => F.data.items.filter(i => i.t === t).length + ((F.hid && F.hid[t]) || []).length;
  function render() {
    S.first = eatFirst();
    const first = S.first.length ? S.first.map(r => {
      const it = r.it, st = MARKS.planState(it);
      return `<button type="button" class="shrow" data-id="${esc(it.id)}"><span class="shimg"><img src="${D.img}item-${it.img}.webp" alt="" draggable="false"></span>`
        + `<span class="shname">${esc(nameOf(it))}${it.days != null ? `<small class="shdays">放了 ${it.days} 天</small>` : ''}</span><i class="shplan ${st}">${esc(it.plan || '说不准')}</i></button>`;
    }).join('') : '<p class="shempty">现在没有需要先吃掉的东西。</p>';
    const zones = K.FR.map(F => `<div class="shfr"><span>${esc(D.fridges[F.i].name)}</span></div>` + F.data.shelves.map((s, t) =>
      `<button type="button" class="shzone${s.full ? ' full' : ''}" data-f="${F.i}" data-t="${t}"><span class="shzn">${esc(s.label)}</span>`
      + `<span class="shcnt">${countOf(F, t)} 件</span><i class="shroom">${s.full ? '满了' : '还有空间'}</i></button>`).join('')).join('');
    scroll.innerHTML = `<h3 class="shh">需要先吃掉的</h3><div class="shfirst">${first}</div><div class="shzones">${zones}</div>`;
  }

  // ---------- 层上的那一件：跳一下、亮一圈 ----------
  function bounce(rec) {
    if (!rec || rec.F !== K.cur || !rec.F.popped || rec.frz != null) return;
    const F = rec.F, host = rec.hidden ? F.moreEls && F.moreEls[rec.ht] : rec.el;
    if (!host || rec.tv) return;
    const hop = RM ? [{ translate: '0 0' }, { translate: '0 0' }]
      : [{ translate: '0 0' }, { translate: '0 -13px', offset: .32 }, { translate: '0 0', offset: .62 }, { translate: '0 -4px', offset: .8 }, { translate: '0 0' }];
    const o = { duration: 640, easing: 'ease-out', composite: 'add' };
    host.animate(hop, o);
    if (!rec.hidden && rec.st) rec.st.animate(hop, o);
    const g = el('div', 'shglow', host);
    const a = g.animate([{ opacity: 0, transform: 'scale(.72)' }, { opacity: 1, transform: 'scale(1)', offset: .3 }, { opacity: .85, transform: 'scale(1.06)', offset: .7 }, { opacity: 0, transform: 'scale(1.18)' }],
      { duration: RM ? 600 : 1100, easing: 'ease-out' });
    a.finished.then(() => g.remove(), () => g.remove());
  }
  const bounceAll = () => S.first.forEach((r, i) => later(i * 90, () => { if (S.on) bounce(r); }));

  // ---------- 开、关 ----------
  const ease = 'cubic-bezier(.2, 1.15, .35, 1)';
  const waitFor = (ok, ms, fn) => { const t0 = performance.now(), seq = S.seq; (function step() { if (seq !== S.seq) return; if (ok()) fn(true); else if (performance.now() - t0 > ms) fn(false); else requestAnimationFrame(step); })(); };
  function open() {
    if (S.on || S.busy) return;
    if (window.MANAGE && MANAGE.on) { MANAGE.close(); later(300, open); return; }   // 清单开着：先落下去
    if ((APP.mode !== 'open' && APP.mode !== 'closed') || !APP.cam.settled || APP.lift.rec) return;
    if (APP.tray.on) { if (!APP.tray.closing && APP.mode === 'open') { K.now(); K.closeTray(); } waitFor(() => !APP.tray.on, 2000, ok => { if (ok) open(); }); return; }
    S.on = true; S.busy = true; S.seq++;
    render(); scroll.scrollTop = 0;
    layer.classList.add('on'); phone.classList.add('shop-open'); btn.classList.add('on');
    [wrap, peng].forEach(n => n.getAnimations().forEach(a => a.cancel()));
    wrap.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: RM ? 1 : 460, easing: ease, fill: 'forwards' });
    peng.animate([{ transform: 'translateY(96px) rotate(6deg)' }, { transform: 'translateY(0) rotate(0deg)' }], { duration: RM ? 1 : 520, delay: RM ? 0 : 300, easing: 'cubic-bezier(.3, 1.5, .5, 1)', fill: 'both' });
    const wasOpen = APP.mode === 'open';
    if (!wasOpen) APP.openDoor();
    // 门开好、东西弹出来以后再锁住冰箱（锁的时候 mode 记下来，关卡时原样还回去），然后让那几件跳
    waitFor(() => APP.mode === 'open' && APP.door >= 95.5, 4000, ok => {
      if (!S.on) return;
      S.busy = false; if (!ok) return;
      APP.lock(true);
      later(wasOpen ? 260 : 520, () => { if (S.on) bounceAll(); });
    });
  }
  function close(then) {
    if (!S.on || S.busy) return;
    S.busy = true; S.seq++;
    const a = wrap.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: RM ? 1 : 300, easing: 'cubic-bezier(.5, 0, .75, .4)', fill: 'forwards' });
    peng.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(110px)' }], { duration: RM ? 1 : 200, easing: 'ease-in', fill: 'forwards' });
    btn.classList.remove('on');
    a.finished.then(() => {
      layer.classList.remove('on'); phone.classList.remove('shop-open');
      APP.lock(false); S.on = false; S.busy = false;
      if (typeof then === 'function') then();
    }, () => { S.busy = false; });
  }
  btn.addEventListener('click', e => { e.stopPropagation(); if (S.on) close(); else open(); });
  // 卡开着时“放入”先不接（门正在开的那一下冰箱还没锁）
  bar.addEventListener('click', e => { if (S.on && e.target.closest('.fab')) e.stopPropagation(); }, true);
  above.addEventListener('click', () => close());
  scroll.addEventListener('click', e => {
    if (S.busy) return;
    const r = e.target.closest('.shrow');
    if (r) { const rec = S.first.find(x => x.it.id === r.dataset.id); r.animate([{ transform: 'scale(1)' }, { transform: 'scale(.97)' }, { transform: 'scale(1)' }], { duration: 220 }); bounce(rec); return; }
    const z = e.target.closest('.shzone');
    if (z) {
      const fi = +z.dataset.f, t = +z.dataset.t, on = !APP.full[fi][t];
      APP.setFull(fi, t, on);
      z.classList.toggle('full', on); z.querySelector('.shroom').textContent = on ? '满了' : '还有空间';
      z.querySelector('.shroom').animate([{ transform: 'scale(.86)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: RM ? 1 : 300, easing: 'ease-out' });
    }
  });

  // ---------- “放入”里选层那颗按钮：那层标了满了就带“满”字章（add.js 每次重画，这里看着它画完补上） ----------
  function placeT(label) {   // 照 add.js 的 places()：我的层（二层）/ 大家都能放的层名 / 冷冻
    const fi = APP.fridge, sh = APP.shelfInfo[fi] || [];
    const mine = sh.findIndex(s => s.mine);
    if (mine >= 0 && label === `我的层（${sh[mine].label.split(' · ')[0]}）`) return mine;
    return sh.findIndex(s => s.label === label);
  }
  function stampAdd() {
    const L = document.getElementById('addLayer'); if (!L) return;
    const full = APP.full[APP.fridge] || [];
    L.querySelectorAll('button[data-act="place"]').forEach(b => {
      const tx = b.firstChild && b.firstChild.nodeType === 3 ? b.firstChild.textContent.trim() : '';
      const t = placeT(tx), on = t >= 0 && !!full[t], g = b.querySelector('.fullst');
      if (on && !g) { const i = document.createElement('i'); i.className = 'fullst'; i.textContent = '满'; b.append(i); }
      else if (!on && g) g.remove();
    });
  }
  const addL = document.getElementById('addLayer');
  if (addL) new MutationObserver(stampAdd).observe(addL, { childList: true, subtree: true });

  window.SHOP = { open, close, get on() { return S.on; }, get first() { return S.first.map(r => r.it.id); }, bounce: id => bounce(S.first.find(r => r.it.id === id)) };
})();
