// 记号（只有默认界面「冰箱贴」）：东西身上一眼能看出来的状态，企鹅气泡里的件数，详情卡上多出来的那几个按钮，
// 我的层名牌旁边“我这几天不在”的开关，处理掉以后原位留的“已处理”小纸条。
// 规则照产品（app/web/src/app.js 的 planState 等）：计划天数 这几天吃 3 / 这周内 7 / 说不准 不算；放了的天数 / 计划天数 ≥ 1 过了，≥ 0.65 过了大半。
// 我不在时我的东西都暂停（不算、不贴胶带）。别的东西字段：hold 有人要处理（还剩几小时），offer 谁想吃都可以拿（多久），yellow 黄标。
// 一格只放一个记号，先后：没人认（原来的“?”）→ 有人要处理（吊牌）→ 过了（深一号的胶带）→ 过了大半（橙胶带）→ 黄标（原来的“临期”）→ 请吃（换掉主人贴纸）。
// 每帧对一遍（只在变了的时候动 DOM）；?t= 定格时只画一次。?away=1：一打开就是“我这几天不在”。
(function () {
  const AP = window.__app, K = AP && AP.mk;
  if (!K || !window.SKIN || SKIN.name !== 'a') return;   // 旧界面 ?skin=0、方向 B：什么都不做
  const qs = new URLSearchParams(location.search);
  const PLAN_DAYS = { '这几天吃': 3, '这周内': 7, '说不准': null };
  const MIDWAY_RATIO = 0.65;
  const OFFERS = ['今天之内', '这两天', '一直可以'];
  const M = { away: qs.get('away') === '1', pick: null, notes: [], bub: new Map(), resumed: new Set() };   // resumed：我不在时“只恢复这一件”恢复的（回来了就清掉）
  const div = (cls, text) => { const d = document.createElement('div'); d.className = cls; if (text != null) d.textContent = text; return d; };
  const hash = id => { let h = 0; for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 997; return h; };

  // ---------- 状态 ----------
  // 计划从什么时候起算：标了“开了”、在“更新”里换了计划（planAt 有值）就是今天重新起算，放了 0 天
  const elapsed = it => it.planAt != null ? 0 : it.days;
  function planState(it) {
    if (M.away && it.kind === 'mine' && !M.resumed.has(it.id)) return 'paused';
    const d = PLAN_DAYS[it.plan], e = elapsed(it);
    if (!d || e == null) return 'quiet';
    const r = e / d;
    return r >= 1 ? 'overdue' : r >= MIDWAY_RATIO ? 'midway' : 'quiet';
  }
  const isHeld = it => +it.hold > 0;
  const holdH = it => Math.max(1, Math.ceil(+it.hold));
  const isOffered = it => OFFERS.includes(it.offer);
  const attn = s => s === 'midway' || s === 'overdue';
  // 处理掉它能不能换一条鱼（第四步）：计划过了大半、过了的才算；冻着的、暂停的不算
  const due = rec => rec.frz == null && attn(planState(rec.it));
  // 这一格贴哪一个记号（冻着的东西不贴）
  function markOf(rec) {
    const it = rec.it;
    if (rec.frz != null) return isOffered(it) ? 'offer' : '';   // 冻着的：只有“请吃”（托盘上那一份贴）
    if (it.kind === 'unknown') return 'unknown';
    if (isHeld(it)) return 'held';
    const s = planState(it);
    if (attn(s)) return s;
    if (it.yellow) return 'yellow';
    if (isOffered(it)) return 'offer';
    return '';
  }

  // ---------- 东西身上的记号 ----------
  // host：层板上的 .item 或托盘上那份的 .tbox。没人认的“?”、黄标“临期”是原来就有的，这里只在别的记号压过黄标时把它藏起来
  function paint(host, mk, it, tray) {
    host.querySelectorAll(':scope > .mk').forEach(n => n.remove());
    host.classList.toggle('mk-noy', !!mk && mk !== 'yellow');
    const h = hash(it.id);
    if (attn(mk)) {
      const w = div('mk mk-tape ' + mk); w.append(div('in'));
      w.style.rotate = (h % 2 ? -36 : -42) + 'deg';
      host.append(w);
    } else if (mk === 'held') {
      const t = div('mk mk-held' + (it.label && !tray ? ' low' : '') + (it.s === 0 && !tray ? ' l' : ''), `有人要处理 · ${holdH(it)} 小时`);   // 最左一格：往右靠，别顶到内壁
      t.style.rotate = (h % 2 ? 2.5 : -2) + 'deg';
      host.append(t);
    } else if (mk === 'offer') {
      const s = div('mk mk-offer', '请吃');
      s.style.rotate = (h % 2 ? 8 : -7) + 'deg';
      host.append(s);
    }
  }
  function sync(rec) {
    const it = rec.it, mk = markOf(rec);
    const key = mk + '|' + (mk === 'held' ? holdH(it) : '') + '|' + (it.label ? 1 : 0);
    if (rec.el && !rec.hidden && (rec.mkK !== key || rec.mkEl !== rec.el)) { paint(rec.el, mk, it, false); rec.mkK = key; rec.mkEl = rec.el; }
    if (rec.tv && (rec.mkTK !== key || rec.mkTv !== rec.tv)) { paint(rec.tv.box, mk, it, true); rec.mkTK = key; rec.mkTv = rec.tv; }
    // 请吃：主人贴纸先收起来（app.js 的 setSticker 每次会重设 className，所以每帧看一眼）
    if (rec.st) { const off = mk === 'offer'; if (rec.st.classList.contains('mk-off') !== off) rec.st.classList.toggle('mk-off', off); }
    // 有吊牌的那格提到邻居上面（吊牌比东西宽，不提会被右边那格盖住一截）；贴纸跟着再高一层
    const up = mk === 'held' && rec.frz == null;
    if (rec.el && rec.el.classList.contains('mk-up') !== up) rec.el.classList.toggle('mk-up', up);
    if (rec.st && rec.st.classList.contains('mk-up') !== up) rec.st.classList.toggle('mk-up', up);
  }

  // ---------- 企鹅的气泡：这台里计划过了大半的件数（层板上的、“+N”里收着的；冻着的、暂停的不算；只看我的打开时只算我的） ----------
  function counted(F) {
    let n = 0; const by = {};
    Object.values(F.recs).forEach(r => {
      if (r.frz != null) return;
      const it = r.it;
      if (K.mine && it.kind !== 'mine') return;
      if (!attn(planState(it))) return;
      n++; const t = r.hidden ? r.ht : it.t; by[t] = (by[t] || 0) + 1;
    });
    return { n, by };
  }
  const bubbleHTML = n => n ? `有 <b>${n} 件</b>东西的计划过了大半。` : M.away ? '现在没有东西需要注意。' : '这箱都还新鲜';   // 产品 manage.statusOne / statusMany / nothingNow
  // 点气泡：拉出算进件数最多的那层（一样多取上面那层）；一件都没有就拉记号最多的那层；什么记号都没有就不动
  function bubbleTap() {
    const F = K.cur, tr = K.tray;
    if (K.mode !== 'open' || tr.on || !F.popped) return;
    if (+document.getElementById('bubble').style.opacity < 0.5) return;
    let by = counted(F).by;
    if (!Object.keys(by).length) {
      by = {};
      Object.values(F.recs).forEach(r => { if (r.frz == null && markOf(r)) { const t = r.hidden ? r.ht : r.it.t; by[t] = (by[t] || 0) + 1; } });
    }
    let best = -1, bn = 0;
    Object.keys(by).map(Number).sort((a, b) => a - b).forEach(t => { if (by[t] > bn) { bn = by[t]; best = t; } });
    if (best >= 0) K.openTray(F, best);
  }

  // ---------- 我这几天不在：顶栏一颗不带字的小手提箱按钮（本人 2026-11-20：层板上那颗字太小、太挤，挪走）；
  // 不在时我的层名牌里多一个小手提箱，不再挂“这几天不在”的牌子 ----------
  const CASE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V5.8A1.3 1.3 0 0 1 10.3 4.5h3.4A1.3 1.3 0 0 1 15 5.8v1.7M3.5 12.5h17"/></svg>';
  const AW = [];   // 每台一份 { F, t, name }：我的层名牌
  let awayBtn = null, btnK = '';
  function initAway() {
    K.FR.forEach(F => {
      const t = F.data.shelves.findIndex(s => s.mine); if (t < 0) return;
      const name = F.shelf.querySelectorAll('.name')[t]; if (!name) return;
      AW.push({ F, t, name });
    });
    const bar = document.getElementById('topbar'); if (!bar) return;
    awayBtn = document.createElement('button'); awayBtn.type = 'button'; awayBtn.className = 'mk-awaybtn'; awayBtn.innerHTML = CASE;
    bar.append(awayBtn);
    awayBtn.addEventListener('click', e => {
      e.stopPropagation();
      if ((K.mode !== 'open' && K.mode !== 'closed') || K.tray.on) return;
      K.now(); setAway(!M.away, true);
    });
  }
  function setAway(on, say) {
    M.away = on; M.resumed.clear();
    if (say) K.toast(on ? '计划已暂停' : '计划已继续');
    tick();
  }
  function syncAway() {
    if (awayBtn) {
      // 放在两个冰箱名字和“只看我的”中间（字体晚到时宽度会变，所以每帧对一下）
      const tabs = awayBtn.parentNode.querySelector('.tabs'), om = awayBtn.parentNode.querySelector('.onlymine');
      const l = tabs ? tabs.offsetLeft + tabs.offsetWidth : 0, r = om ? om.offsetLeft : 0;
      const k = [M.away, l, r].join('|');
      if (k !== btnK) {
        btnK = k;
        awayBtn.classList.toggle('on', M.away);
        awayBtn.setAttribute('aria-pressed', String(M.away));
        awayBtn.setAttribute('aria-label', M.away ? '回来了' : '我这几天不在');
        if (tabs && om) awayBtn.style.left = Math.round((l + r) / 2 - 16) + 'px';
      }
    }
    AW.forEach(a => {
      const tp = a.name.querySelector('.tp'); if (!tp) return;
      const g = tp.querySelector('.mk-case');
      if (M.away && !g) tp.insertAdjacentHTML('afterbegin', `<i class="mk-case">${CASE}</i>`);
      else if (!M.away && g) g.remove();
    });
  }

  // ---------- 已处理：处理掉的东西原位留一张小纸条（不挡手，刷新就没了）。一层只留最近那张；
  // 那一格又放上东西了（剩下的往左补位、新放进来）就挪到这层第一个空格；这层摆满了就收掉 ----------
  function handled(rec) {
    const F = rec.F || K.cur, it = rec.it;
    if (it.kind !== 'unknown' && !isHeld(it)) return;   // 产品：只有没人认的、有人挂起的才留回执
    if (rec.frz != null || rec.hidden || it.s == null || it.t == null) return;   // 冻着的、收在“+N”里的：层板上没有它的位置
    M.notes.filter(n => n.F === F && n.t === it.t).forEach(dropNote);
    const el = div('mk-note', '已处理');
    el.style.rotate = (hash(it.id) % 2 ? -5 : 4) + 'deg';
    F.shelf.append(el);
    const n = { F, t: it.t, s: it.s, el, k: '' };
    M.notes.push(n); placeNote(n);
  }
  function dropNote(n) { n.el.remove(); M.notes = M.notes.filter(x => x !== n); }
  function placeNote(n) {
    if (n.edge) { Object.assign(n.el.style, { left: '292px', top: (K.S[n.t] + 7) + 'px' }); return; }   // 层板前沿右边，层名胶带的另一头
    Object.assign(n.el.style, { left: (K.X[n.s] - 21) + 'px', top: (K.S[n.t] + K.SOFF[n.t] - 19) + 'px' });
  }
  function syncNotes() {
    M.notes.slice().forEach(n => {
      const F = n.F, used = F.data.items.filter(i => i.t === n.t).map(i => i.s);
      const m = F.moreEls && F.moreEls[n.t]; if (m && m.style.display !== 'none') used.push(3);
      if (used.includes(n.s)) {
        const free = [0, 1, 2, 3].find(s => !used.includes(s));
        if (free == null) { if (!n.edge) { n.edge = true; n.el.classList.add('edge'); placeNote(n); } }   // 这层摆满了：贴到层板前沿上，不收掉
        else { n.s = free; if (n.edge) { n.edge = false; n.el.classList.remove('edge'); } placeNote(n); }
      }
      const name = F.shelf.querySelectorAll('.name')[n.t];
      const op = name ? name.style.opacity : '', hid = !!name && name.classList.contains('intray');
      const k = op + '|' + hid;
      if (k !== n.k) { n.k = k; n.el.style.opacity = op; n.el.style.visibility = hid ? 'hidden' : ''; }
    });
  }

  // ---------- 详情卡：app.js 的 sheetEx 来要，skin.js 的 sheetHTML 拼进去 ----------
  // 返回 { meta 接在 meta 后面的小签, btns 按钮, replace 整组换掉（没人认的东西）还是接在原来的按钮后面 }
  function sheet(rec) {
    const fz = rec.frz != null;
    if (fz && rec.it.kind !== 'mine') return null;   // 冻着的：只有我的能“谁想吃都可以拿”
    if (M.pick && M.pick !== rec) M.pick = null;
    const it = rec.it, s = fz ? '' : planState(it), held = !fz && isHeld(it), mine = it.kind === 'mine', off = isOffered(it);
    let meta = '';
    if (s === 'paused') meta += `<span class="mkchip">已暂停</span>`;
    if (off) meta += `<span class="mkchip offer">谁想吃都可以拿 · ${it.offer}</span>`;
    const holdRow = held ? `<div class="mkhold"><span>有人打算处理它 · 还有 ${holdH(it)} 小时</span><button data-act="mk-release">先别动</button></div>` : '';
    const canHold = (it.kind === 'unknown' || attn(s)) && !held;
    if (it.kind === 'unknown') {
      return { meta, replace: true,   // 第四步：没人认的也能处理掉（不换鱼，掉进垃圾桶；留回执）
        btns: holdRow + `<button class="go" data-act="eat"><span>处理掉它</span></button><div class="row2${canHold ? '' : ' mkone'}"><button data-act="mk-claim">这是我的</button>${canHold ? '<button data-act="mk-hold">我打算处理它</button>' : ''}</div>` };
    }
    const b = [];
    if (s === 'paused') b.push('<button data-act="mk-resume">只恢复这一件</button>');
    if (canHold) b.push('<button data-act="mk-hold">我打算处理它</button>');
    if (mine && !off && M.pick !== rec) b.push('<button data-act="mk-offer">谁想吃都可以拿</button>');
    if (mine && off) b.push('<button data-act="mk-unoffer">收回</button>');
    let btns = holdRow + (b.length ? `<div class="mkrow n${b.length}">${b.join('')}</div>` : '');
    if (mine && !off && M.pick === rec) {
      btns += `<div class="mkpick"><div class="mkq">开放多久？</div><div class="seg">${OFFERS.map(o => `<button data-act="mk-offer-d" data-d="${o}">${o}</button>`).join('')}</div></div>`;
    }
    return { meta, btns, replace: false };
  }
  // 卡上记号那几个按钮。app.js 已经挡掉了卡刚换过内容时的连点（sheetLocked）
  function act(a, rec, b) {
    if (!a || a.slice(0, 3) !== 'mk-') return false;
    const it = rec.it, done = msg => { M.pick = null; tick(); K.refill(rec); if (msg) K.toast(msg, K.aboveSheet()); };
    if (a === 'mk-claim') {   // 产品：标成我的以后直接打开“更新”，接着设计划
      it.kind = 'mine'; delete it.ask; K.restyle(rec); M.pick = null; tick(); K.openEdit(rec); K.toast('已标记为你的', K.aboveSheet());
    }
    else if (a === 'mk-resume') { M.resumed.add(it.id); done(); }
    else if (a === 'mk-hold') { it.hold = 48; done('已挂起 48 小时'); }
    else if (a === 'mk-release') { delete it.hold; done('保持原样'); }
    else if (a === 'mk-offer') { M.pick = rec; K.refill(rec); }
    else if (a === 'mk-offer-d') { if (OFFERS.includes(b.dataset.d)) it.offer = b.dataset.d; done('已开放取用'); }
    else if (a === 'mk-unoffer') { delete it.offer; done('已收回'); }
    else return false;
    return true;
  }

  // ---------- 第五步：“买菜前看一眼”里标了“满了”的层，名牌末尾（箭头前）多一个小小的“满”字章 ----------
  function syncFull() {
    K.FR.forEach(F => {
      const k = F.data.shelves.map(s => s.full ? 1 : 0).join('');
      if (F.fullK === k) return; F.fullK = k;
      F.shelf.querySelectorAll('.name').forEach((n, t) => {
        const tp = n.querySelector('.tp'); if (!tp) return;
        const g = tp.querySelector('.mk-full'), on = !!(F.data.shelves[t] && F.data.shelves[t].full);
        if (on && !g) { const i = document.createElement('i'); i.className = 'mk-full'; i.textContent = '满'; tp.insertBefore(i, tp.querySelector('.chev')); }
        else if (!on && g) g.remove();
      });
    });
  }

  // ---------- 每帧 ----------
  function tick() {
    K.FR.forEach(F => {
      Object.values(F.recs).forEach(sync);
      const html = bubbleHTML(counted(F).n);
      if (M.bub.get(F) !== html) { M.bub.set(F, html); K.setBubble(F, html); }
    });
    if (M.pick && K.mode !== 'picked') M.pick = null;
    syncAway(); syncNotes(); syncFull();
  }
  function loop() { tick(); requestAnimationFrame(loop); }

  window.MARKS = { act, sheet, handled, bubbleTap, planState, due, markOf: id => { for (const F of K.FR) if (F.recs[id]) return markOf(F.recs[id]); return null; },
    get away() { return M.away; }, setAway: on => { K.now(); setAway(!!on, true); },
    get bubble() { return K.FR.map(F => counted(F).n); }, get notes() { return M.notes.map(n => ({ fridge: n.F.i, t: n.t, s: n.s })); } };
  initAway();
  tick();   // 第一遍：boot 时气泡里是空的（skin.js），这里按记号写上——这时还没淡入，不会闪
  if (!K.frozen) requestAnimationFrame(loop);
})();
