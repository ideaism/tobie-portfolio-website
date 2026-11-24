// 查看处理（第五步，只有默认界面「冰箱贴」）：底栏“查看处理”点开，一整屏清单从底栏升上来，盖住冰箱和角落的企鹅。
// 顶上是严肃那只企鹅和它现在气泡里那句话；四个过滤照产品（全部 / 个人 / 共用 / 这几天要吃的）：
//   个人 = 不是共用的（别人的、不知道是谁的也算），共用 = 共用，这几天要吃的 = 计划是“这几天吃”。顶栏“只看我的”开着时只列我的。
// 分组：“现在可以拿的”在最前（只看我的时不分这一组，产品里“只看我的”也没有），然后两台冰箱按层排，冷冻的排在每台最后；
// 组里按状态排（过了 → 过了大半 → 还早 → 暂停）。每行：小图、名字、和层上同一种颜色的记号，不放按钮。
// 点一行：清单落下去，app.js 的 showItem 串起 开门 → 转镜头 → 拉出那层 → 拿起来 → 开详情卡。
(function () {
  const APP = window.__app, K = APP && APP.mk, D = window.FRIDGE;
  if (!K || !window.SKIN || SKIN.name !== 'a' || !window.MARKS || !D || !D.fridges) return;
  const phone = document.getElementById('phone'), btn = document.querySelectorAll('#bottombar .side')[0];
  if (!phone || !btn) return;
  const RM = APP.rm;
  const FILTERS = [['all', '全部'], ['personal', '个人'], ['shared', '共用'], ['soon', '这几天要吃的']];
  const ORDER = { overdue: 0, midway: 1, ontrack: 2, quiet: 3, paused: 4 };
  const OFFERS = ['今天之内', '这两天', '一直可以'];
  const S = { on: false, busy: false, f: 'all' };
  const el = (tag, cls, parent) => { const e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- 面板 ----------
  const layer = el('div', '', phone); layer.id = 'mgLayer';
  const panel = el('div', 'mgpanel', layer);
  const head = el('div', 'mghead', panel);
  const peng = el('img', 'mgpeng', head); peng.src = D.img + 'penguin-stand.webp'; peng.alt = ''; peng.draggable = false;
  const say = el('div', 'mgsay', head);
  const seg = el('div', 'mgseg', panel);
  seg.innerHTML = FILTERS.map(([k, l]) => `<button type="button" data-f="${k}" role="radio">${l}</button>`).join('');
  const list = el('div', 'mglist', panel);
  // 面板开着时冰箱那边什么都不接（和录入面板一样）
  ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'click'].forEach(t => layer.addEventListener(t, e => e.stopPropagation(), t === 'wheel' ? { passive: true } : undefined));

  // ---------- 数据 ----------
  const nameOf = it => it.name || D.names[it.img];
  const where = r => r.frz != null ? { z: r.frz } : { t: r.hidden ? r.ht : r.it.t };
  function pass(it) {
    if (K.mine && it.kind !== 'mine') return false;
    if (S.f === 'personal') return it.kind !== 'shared';
    if (S.f === 'shared') return it.kind === 'shared';
    if (S.f === 'soon') return it.plan === '这几天吃';
    return true;
  }
  const stateOf = r => r.frz != null ? 'quiet' : MARKS.planState(r.it);
  const sortRecs = rs => rs.map((r, i) => ({ r, i, o: ORDER[stateOf(r)] })).sort((a, b) => a.o - b.o || a.i - b.i).map(x => x.r);
  function recsOf(F) {   // 层板上的、“+N”里的、冷冻里的，按 data 的顺序
    const ids = F.data.items.map(i => i.id);
    if (F.hid) Object.keys(F.hid).forEach(t => F.hid[t].forEach(i => ids.push(i.id)));
    (F.data.frozen || []).forEach(z => z.items.forEach(i => ids.push(i.id)));
    return ids.map(id => F.recs[id]).filter(Boolean);
  }
  function groups() {
    const all = K.FR.flatMap(F => recsOf(F).map(r => ({ r, F }))).filter(x => pass(x.r.it));
    const offer = K.mine ? [] : all.filter(x => OFFERS.includes(x.r.it.offer));
    const rest = all.filter(x => !offer.includes(x));
    const out = [];
    if (offer.length) out.push({ label: '现在可以拿的', cls: 'offer', recs: sortRecs(offer.map(x => x.r)) });
    K.FR.forEach(F => {
      const fname = D.fridges[F.i].name, mine = rest.filter(x => x.F === F);
      F.data.shelves.forEach((s, t) => {
        const rs = mine.filter(x => { const w = where(x.r); return w.t === t; }).map(x => x.r);
        if (rs.length) out.push({ label: `${fname} · ${s.label}`, cls: s.mine ? 'mine' : '', recs: sortRecs(rs) });
      });
      (F.data.frozen || []).forEach((z, k) => {
        const rs = mine.filter(x => where(x.r).z === k).map(x => x.r);
        if (rs.length) out.push({ label: `${fname} · ${z.label}`, cls: 'cold', recs: sortRecs(rs) });
      });
    });
    return out;
  }
  // 和层上同一种颜色的记号
  function chip(r) {
    const it = r.it, m = MARKS.markOf(it.id);
    if (m === 'unknown') return '<i class="mgc ask">?</i>';
    if (m === 'held') return `<i class="mgc held">有人要处理 · ${Math.max(1, Math.ceil(+it.hold))} 小时</i>`;
    if (m === 'overdue' || m === 'midway') return `<i class="mgc tape ${m}">${esc(it.plan)}</i>`;
    if (m === 'yellow') return '<i class="mgc ylw">临期</i>';
    if (m === 'offer') return '<i class="mgc offer">请吃</i>';
    return '';
  }
  function render() {
    say.innerHTML = K.cur.bubble || '';
    seg.querySelectorAll('button').forEach(b => { const on = b.dataset.f === S.f; b.classList.toggle('on', on); b.setAttribute('aria-checked', String(on)); });
    const gs = groups();
    list.innerHTML = gs.length ? gs.map(g => `<section class="mgg ${g.cls}"><h3><span>${esc(g.label)}</span></h3>` + g.recs.map(r => {
      const it = r.it, nm = nameOf(it);
      return `<button type="button" class="mgrow${it.kind === 'other' ? ' other' : ''}" data-id="${esc(it.id)}"><span class="mgimg"><img src="${D.img}item-${it.img}.webp" alt="" draggable="false"></span>`
        + `<span class="mgname">${esc(nm)}</span>${chip(r)}</button>`;
    }).join('') + '</section>').join('') : '<p class="mgempty">这个视图现在没有项目。</p>';
  }

  // ---------- 开、关 ----------
  const ease = 'cubic-bezier(.2, 1.12, .35, 1)';
  function open() {
    if (S.on || S.busy) return;
    if (window.SHOP && SHOP.on) { SHOP.close(open); return; }   // 买菜前看一眼开着：先收起来再开
    if ((APP.mode !== 'open' && APP.mode !== 'closed') || !APP.cam.settled || APP.lift.rec) return;
    S.on = true; S.f = S.f || 'all';
    APP.lock(true);
    render(); list.scrollTop = 0;
    layer.classList.add('on'); phone.classList.add('mg-open'); btn.classList.add('on');
    panel.getAnimations().forEach(a => a.cancel());
    panel.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: RM ? 1 : 440, easing: ease, fill: 'forwards' });
    peng.animate([{ transform: 'translateY(18px) rotate(-4deg)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: RM ? 1 : 420, delay: RM ? 0 : 160, easing: ease, fill: 'backwards' });
  }
  function close(then) {
    if (!S.on || S.busy) return;
    S.busy = true;
    const a = panel.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(100%)' }], { duration: RM ? 1 : 280, easing: 'cubic-bezier(.5, 0, .75, .4)', fill: 'forwards' });
    btn.classList.remove('on');
    APP.lock(false);
    if (then) then();   // 点了一行：门、镜头这一串和清单落下同时开始
    a.finished.then(() => {
      layer.classList.remove('on'); phone.classList.remove('mg-open');
      S.on = false; S.busy = false;
    }, () => { S.busy = false; });
  }
  btn.addEventListener('click', e => { e.stopPropagation(); if (S.on) close(); else open(); });
  seg.addEventListener('click', e => {
    const b = e.target.closest('button[data-f]'); if (!b || S.busy) return;
    S.f = b.dataset.f; render(); list.scrollTop = 0;
  });
  list.addEventListener('click', e => {
    const b = e.target.closest('.mgrow'); if (!b || S.busy) return;
    const id = b.dataset.id;
    b.classList.add('hit');
    close(() => { APP.showItem(id); });
  });

  window.MANAGE = { open, close, get on() { return S.on; }, get filter() { return S.f; },
    setFilter(f) { if (FILTERS.some(x => x[0] === f)) { S.f = f; if (S.on) render(); } },
    get rows() { return [...list.querySelectorAll('.mgrow')].map(b => b.dataset.id); },
    get groups() { return [...list.querySelectorAll('.mgg h3')].map(h => h.textContent); } };
})();
