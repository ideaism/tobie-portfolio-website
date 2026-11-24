// 界面。2026-11-19 本人在 007 卡上选了 a「冰箱贴」，现在它是默认界面。
// 网址带 ?skin=b 看另一个方向，带 ?skin=0 看改之前的旧界面（留着做新旧对比）。
//   a「冰箱贴」：层名是贴在层板边上的纸胶带，主人是小贴纸，企鹅说话有气泡
//   b「刻字」  ：字直接印在冰箱上，不加底，界面退到后面
// 这个文件要放在 data.js 之后、app.js 之前：先把写死在 index.html 里的顶栏、底栏换掉，
// app.js 建好层板以后再调 SKIN.after() 调整层名、贴纸的位置。
(() => {
  const q = new URLSearchParams(location.search).get('skin');
  if (q === '0') return;
  const skin = q === 'b' ? 'b' : 'a';
  const A = skin === 'a', $ = s => document.querySelector(s);
  document.documentElement.classList.add('skin', 'skin-' + skin);
  const link = href => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.append(l); };
  // a 的手写体随网页带（fonts/ 里的子集，见 skin.css 的 @font-face）；b 不是默认，宋体粗字还是在线拉
  if (!A) link('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700;900&display=swap');

  const I = {
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M10 6h10M10 12h10M10 18h10"/><path d="M3.6 6.2l1.3 1.3 2.3-2.6M3.6 12.2l1.3 1.3 2.3-2.6M3.6 18.2l1.3 1.3 2.3-2.6"/></svg>',
    basket: '<svg viewBox="0 0 24 24"><path d="M3 10h18l-1.5 8.3a2 2 0 0 1-2 1.7H6.5a2 2 0 0 1-2-1.7L3 10z"/><path d="M8 10l3-6M16 10l-3-6M9.5 14v2.5M14.5 14v2.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>'
  };

  // ---- 顶栏 ----
  $('#topbar').innerHTML = A
    ? `<div class="tabs"><button class="tab on">厨房大冰箱</button><button class="tab">厨房小冰箱</button></div>
       <button class="onlymine"><i class="sw"></i>只看我的</button>`
    : `<div class="ttl"><h1>厨房大冰箱</h1><button class="other">换到厨房小冰箱${I.chev}</button></div>
       <button class="onlymine"><i class="ck"></i>只看我的</button>`;

  // ---- 冷冻抽屉上的字、企鹅的话 ----
  $('#freezerTags').innerHTML = A
    ? `<span class="tapewrap"><span class="tp">${(window.FRIDGE.fridges && window.FRIDGE.fridges[0].freezer) || '冷冻 · 6 件'}</span></span><span class="hint">先到先用</span>`
    : `<b>冷冻</b><span>6 件 · 先到先用</span>`;
  $('#bubble').innerHTML = A
    ? ``   // 默认界面：件数由 marks.js 按每台冰箱里的记号算出来再写
    : `<i class="dot"></i><span>有 <b>1 件</b>东西的计划过了大半</span>${I.chev}`;
  const ct = $('#celebrate .ctext');
  if (ct) ct.innerHTML = `<b>赶上了</b><span>企鹅得到一条鱼</span>`;

  // ---- 底栏 ----
  $('#bottombar').innerHTML = A
    ? `<button class="side">${I.list}<span>查看处理</span></button>
       <button class="fab">${I.plus}<span>放入</span></button>
       <button class="side">${I.basket}<span>买菜前看一眼</span></button>`
    : `<button class="quiet">${I.list}<span>查看处理</span></button>
       <button class="quiet">${I.basket}<span>买菜前看一眼</span></button>
       <button class="put">${I.plus}<span>放入</span></button>`;

  // ---- 底部详情卡：一个主按钮，其余退后 ----
  const dark = { 我: '#3f5a4a', 满: '#9a4c40', 青: '#62528f' };
  // ex：只有默认界面「冰箱贴」传（app.js 里拼好的这样东西此刻的状态）；方向 B 不传，出来的字和以前一模一样。
  //   ex.where 所在位置的名字（冻着的东西是“冷冻上层”这种）；ex.frozen 冻着没有；ex.edit 编辑面板开着时的草稿
  //   （own 归属、plan 计划、zone 区域、zones 能选的区域 [{ v, label, full }]）。“开了”记在 it.opened 上。
  function sheetHTML(it, D, canAct, ex) {
    // 默认界面（ex 有）：东西有自己的名字（data.js 的 name）就用它；方向 B 照旧用图的名字
    const name = (ex && it.name) || D.names[it.img], where = (ex && ex.where) || D.shelves[it.t].label;
    // 名字里有手写体子集没有的字：标题整条用正文字体（见 kinds.js 的 fits），免得一行两种字
    const tcls = ex && window.KINDS && !KINDS.fits(name) ? ' plain' : '';
    const days = it.days != null ? `<div class="days"><small>放了</small><b>${it.days}</b><span>天</span></div>` : '';
    let meta = '', btns = '';
    const plan = it.plan ? `<span class="plan">${ex && it.opened ? '开了 · ' : ''}${it.plan}</span>` : '';
    const cold = ex && ex.frozen ? `<span class="cold">冷冻的先不设计划</span>` : '';
    const own = ex && it.ask ? '需询问' : '个人';   // 需询问（第四步）：东西还是这个人的，只是拿之前要先问；层板上不加贴纸
    if (it.kind === 'mine') meta = `<span class="me">${own}</span>` + (cold || plan);
    else if (it.kind === 'shared') meta = `<span class="me">共用</span>` + (ex ? cold || plan : '');
    else if (it.kind === 'unknown') {
      meta = `<span class="ask">不知道是谁的</span>`;
      btns = `<div class="row2"><button>这是我的</button><button>我打算处理它</button></div><button class="text" data-act="leave">先别动</button>`;
    } else meta = `<span>${own}</span><span style="color:${dark[it.owner]};font-weight:600">${D.ownerNames[it.owner]}</span>` + cold;
    if (ex && it.yellow) meta += `<span class="ylw">临期</span>`;   // 贴了黄标（录入时打开的“黄标 · 临期”），样式在 add.css
    // 开了以后计划下面多一行小字（产品 strings.json：manage.openedNote）
    const mnote = ex && it.opened && !ex.frozen && it.plan ? `<div class="mnote">开了之后重新起算 · 今天</div>` : '';
    if (canAct) {
      // 默认界面：只有计划过了大半、过了的（ex.due）处理掉才换一条鱼，别的不写那行小字
      const go = `<button class="go" data-act="eat"><span>处理掉它</span>${!ex || ex.due ? `<small><img src="${D.img}fish.webp" alt="">企鹅能吃到一条</small>` : ''}</button>`;
      if (ex && ex.edit) btns = editHTML(ex.edit);
      else if (ex && ex.frozen && ex.thaw) btns = thawHTML(ex.thaw);
      else if (ex && ex.frozen) btns = go + `<div class="row3 two"><button data-act="thaw">拿出来解冻</button><button data-act="edit">更新</button></div>`;
      else if (ex && ex.paused) btns = go + `<div class="row3 two"><button data-act="freeze">放进冷冻</button><button data-act="edit">更新</button></div>`;   // 暂停着：没有“开了”
      else if (ex) btns = go + `<div class="row3"><button data-act="open"${it.opened ? ' class="done" aria-pressed="true" aria-label="已开，点一下改回没开"' : ''}>${it.opened ? '已开<svg class="ck" viewBox="0 0 24 24"><path d="M5.5 12.5l4 4L18.5 7.5"/></svg>' : '开了'}</button><button data-act="freeze">放进冷冻</button><button data-act="edit">更新</button></div>`;
      else btns = go + `
              <div class="row3"><button>开了</button><button${A ? ' data-act="freeze"' : ''}>放进冷冻</button><button>更新</button></div>`;
    }
    // 记号（只有默认界面，marks.js 拼好）：meta 后面多几个小签；按钮整组换掉（没人认的东西）或接在后面；编辑面板开着时不加按钮
    if (ex && ex.mk) {
      meta += ex.mk.meta;
      if (!ex.edit && !ex.thaw) btns = ex.mk.replace ? ex.mk.btns : btns + ex.mk.btns;
    }
    return `<div class="handle"></div><div class="shead"><div><div class="title${tcls}">${name}</div><div class="sub">${where}</div></div>${days}</div><div class="meta">${meta}</div>${mnote}${btns}`;
  }
  // “更新”展开的编辑面板（产品里的 editPanel：归属 / 打算什么时候吃？/ 区域，保存更新 / 取消）。字都用正文字体
  function editHTML(e) {
    const seg = (k, opts, v) => `<div class="seg" data-k="${k}">` + opts.map(([val, lab]) => `<button data-v="${val}"${val === v ? ' class="on"' : ''}>${lab}</button>`).join('') + `</div>`;
    const zones = `<div class="zones" data-k="zone">` + e.zones.map(z =>
      `<button data-v="${z.v}" class="${(z.v === e.zone ? 'on ' : '') + (z.v[0] === 'z' ? 'cz' : '')}"><span>${z.label}</span>${z.stamp ? '<i class="fullst">满</i>' : ''}</button>`).join('') + `</div>`;   // 第五步：手动标了“满了”的层带一个“满”字章（照样能选）。第四步：不再灰掉“满了”，放满的层多出来的进“+N”
    return `<div class="edit${e.zone[0] === 'z' ? ' cold' : ''}">`
      + `<div class="erow"><div class="el">归属</div>${seg('own', [['mine', '个人'], ['shared', '共用'], ['ask', '需询问'], ['unknown', '不知道是谁的']], e.own)}</div>`
      + `<div class="erow eplan"><div class="el">打算什么时候吃？</div>${seg('plan', [['这几天吃', '这几天吃'], ['这周内', '这周内'], ['说不准', '说不准']], e.plan)}<div class="ecold">冷冻的先不设计划。</div></div>`
      + `<div class="erow"><div class="el">区域</div>${zones}</div>`
      + `<div class="eact"><button class="save" data-act="save">保存更新</button><button class="cancel" data-act="cancel">取消</button></div></div>`;
  }
  // “拿出来解冻”展开的两行（第四步）：放回哪一层（默认是原来自动选的那层）、打算什么时候吃（默认说不准），点“放回去”才飞出来
  function thawHTML(t) {
    const zones = `<div class="zones" data-k="t">` + t.zones.map(z => `<button data-v="${z.v}"${z.v === t.t ? ' class="on"' : ''}><span>${z.label}</span>${z.stamp ? '<i class="fullst">满</i>' : ''}</button>`).join('') + `</div>`;
    const plan = `<div class="seg" data-k="plan">` + ['这几天吃', '这周内', '说不准'].map(p => `<button data-v="${p}"${p === t.plan ? ' class="on"' : ''}>${p}</button>`).join('') + `</div>`;
    return `<div class="edit thawp"><div class="erow"><div class="el">放回哪一层</div>${zones}</div>`
      + `<div class="erow eplan"><div class="el">打算什么时候吃？</div>${plan}</div>`
      + `<div class="eact"><button class="save" data-act="thaw-go">放回去</button><button class="cancel" data-act="thaw-cancel">取消</button></div></div>`;
  }

  // ---- app.js 建好层板以后（两台冰箱时每台调一次：shelf 是那台的层板层，D 是那台的数据） ----
  function after(shelf = $('#shelf'), D = window.FRIDGE) {
    const S = [264, 346, 427, 509, 592];
    const own = window.FRIDGE;   // 主人颜色、名字是两台共用的
    const names = [...shelf.querySelectorAll('.name')];
    names.forEach((n, i) => {
      const s = D.shelves[i], owner = Object.keys(own.ownerNames).find(k => s.label.includes(own.ownerNames[k]));
      if (A) {            // 纸胶带：贴在这一层层板的前沿上，稍微歪一点
        n.innerHTML = `<span class="tp">${s.label}</span>`;
        Object.assign(n.style, { top: (S[i] + (i < 4 ? 6 : 0)) + 'px', left: '30px', right: 'auto', rotate: [-1.6, 1.1, -0.8, 1.4, -1.2][i] + 'deg' });
      } else {            // 刻字：字前面一个主人颜色的点，和下面东西上的小圆点是同一套颜色
        const c = s.mine ? own.owners['我'] : owner ? own.owners[owner] : null;
        n.innerHTML = (c ? `<i class="dot" style="background:${c}"></i>` : `<i class="dot ring"></i>`) + s.label;
        if (!s.right) n.style.left = '34px';
        n.style.top = (s.y - 3) + 'px';
      }
    });
    const marked = D.items.filter(it => it.sticker || it.kind === 'unknown');
    const els = [...shelf.querySelectorAll('.item')], sts = [...shelf.querySelectorAll('.sticker')];
    marked.forEach((it, i) => {
      const st = sts[i], el = els[D.items.indexOf(it)]; if (!st || !el) return;
      const x = parseFloat(el.style.left), y = parseFloat(el.style.top), w = parseFloat(el.style.width), h = parseFloat(el.style.height);
      if (A) Object.assign(st.style, { left: (x + w - 12) + 'px', top: (y - 8) + 'px', rotate: [-9, 7, -6, 10, -5, 8][i % 6] + 'deg' });
      else {              // 刻字：圆贴纸换成印在脚下层板边上的两个字
        const k = it.kind === 'unknown' ? '?' : it.sticker;
        st.textContent = { 我: '我的', 共: '共用', 满: '小满', 青: '阿青', '?': '谁的？' }[k];
        Object.assign(st.style, { left: (x + w / 2 - 24) + 'px', top: (y + h + 1) + 'px', color: dark[k] || (k === '?' ? '#9a5f22' : '#3f5a4a') });
      }
    });
    const more = shelf.querySelector('.more');
    if (more && A) Object.assign(more.style, { left: '304px', top: '316px', width: '34px' });
    if (more && !A) { more.textContent = '还有 ' + parseInt(D.more.text, 10) + ' 件'; Object.assign(more.style, { left: '291px', top: '352px', width: '60px' }); }
  }

  window.SKIN = { name: skin, sheetHTML, after };
})();
