document.documentElement.classList.add('js');

/* top bar: hairline once the page scrolls */
const bar = document.querySelector('.topbar');
const onScroll = () => bar?.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

/* mobile menu */
const menu = document.querySelector('.menu-btn');
const nav = document.querySelector('.nav');
if (menu && nav) {
  const set = open => { menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open); };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; set(open); if (open) nav.querySelector('a')?.focus(); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { set(false); menu.focus(); } });
}

/* reveal on scroll */
const reveal = [...document.querySelectorAll('.reveal')];
if ('IntersectionObserver' in window && reveal.length) {
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  reveal.forEach(el => io.observe(el));
} else reveal.forEach(el => el.classList.add('is-in'));

/* hero: the objects in the portrait and the method steps point at each other.
   Hover / focus shows a note beside the object and dims the rest; a tap pins it (touch has no hover). */
const hot = document.querySelector('.portrait .hot');
if (hot) {
  const dim = hot.querySelector('.hot__dim'), note = hot.querySelector('.hot__note');
  const spots = [...hot.querySelectorAll('.hot__spot')], steps = [...document.querySelectorAll('.method__step')];
  let pinned = null;
  const show = key => {
    const mine = spots.filter(s => s.dataset.key === key), step = steps.find(s => s.dataset.key === key);
    if (!mine.length || (!step && !mine[0].dataset.title)) return;
    const w = hot.clientWidth;
    // one round hole in the dim layer per object
    const holes = mine.map(s => { const r = s.dataset.r * w / 100; return `radial-gradient(circle at ${s.dataset.x}% ${s.dataset.y}%, transparent ${r}px, #000 ${r + 16}px)`; }).join(',');
    dim.style.maskImage = dim.style.webkitMaskImage = holes;
    dim.style.maskComposite = 'intersect'; dim.style.webkitMaskComposite = 'source-in';
    note.querySelector('b').textContent = step ? step.querySelector('b').textContent : mine[0].dataset.title;   // objects that are not a method step carry their own note
    note.querySelector('span').textContent = step ? step.querySelector('small').textContent : mine[0].dataset.sub;
    // which side of the object the note sits on, so it never leaves the frame
    const { x, y, r, side } = mine[0].dataset, X = +x, Y = +y, R = +r;
    note.style.cssText = '';
    if (side === 'right') { note.style.left = (X + R + 2) + '%'; note.style.top = (Y - 6) + '%'; }
    if (side === 'left') { note.style.right = (100 - X + R + 2) + '%'; note.style.top = (Y - 6) + '%'; }
    if (side === 'below') { note.style.right = (100 - X - R) + '%'; note.style.top = (Y + R + 2) + '%'; }
    hot.classList.add('is-on');
    spots.forEach(s => s.classList.toggle('is-active', s.dataset.key === key));
    steps.forEach(s => s.classList.toggle('is-active', s.dataset.key === key));
  };
  const clear = () => {
    if (pinned) return show(pinned);
    hot.classList.remove('is-on');
    spots.forEach(s => s.classList.remove('is-active')); steps.forEach(s => s.classList.remove('is-active'));
  };
  [...spots, ...steps].forEach(el => {
    el.addEventListener('mouseenter', () => show(el.dataset.key));
    el.addEventListener('mouseleave', clear);
    el.addEventListener('focus', () => show(el.dataset.key));
    el.addEventListener('blur', clear);
    el.addEventListener('click', e => { e.stopPropagation(); pinned = pinned === el.dataset.key ? null : el.dataset.key; pinned ? show(pinned) : clear(); });
  });
  document.addEventListener('click', () => { if (pinned) { pinned = null; clear(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && pinned) { pinned = null; clear(); } });
}

/* case tabs (2026-11-18, only smt for now): one case page holding two projects.
   The page is built as jump links over stacked panels (readable without JS); this turns them into tabs.
   A hash opens its tab: #daton opens that panel, and a hash inside a panel (#section-3, #try) opens the panel holding it. */
const tabList = document.querySelector('[data-tablist]');
if (tabList) {
  const tabs = [...tabList.querySelectorAll('[data-tab]')];
  const panels = tabs.map(tab => document.getElementById(tab.dataset.tab));
  tabList.setAttribute('role', 'tablist');
  tabs.forEach((tab, n) => {
    tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', panels[n].id);
    panels[n].setAttribute('role', 'tabpanel'); panels[n].setAttribute('aria-labelledby', tab.id);
  });
  const select = n => {
    tabs.forEach((tab, k) => { const on = k === n; tab.setAttribute('aria-selected', String(on)); tab.tabIndex = on ? 0 : -1; panels[k].hidden = !on; });
    window.dispatchEvent(new Event('scroll'));   // re-run the contents highlight for the panel now shown
  };
  const target = () => { try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return null; } };
  const openHash = () => {
    const el = location.hash.length > 1 && target();
    const n = el ? panels.findIndex(p => p.contains(el)) : -1;
    if (n < 0) return false;
    const wasHidden = panels[n].hidden;
    select(n);
    if (panels.includes(el)) {   // a tab link: show the tab bar and the head of that tab
      const top = () => window.scrollTo({ top: 0, behavior: 'instant' });
      top();
      if (document.readyState !== 'complete') window.addEventListener('load', () => requestAnimationFrame(top), { once: true });   // the browser's own jump to the hash comes after this script
    }
    else if (wasHidden) el.scrollIntoView({ behavior: 'instant' });               // the browser could not scroll to it while it was hidden
    return true;
  };
  if (!openHash()) select(0);
  window.addEventListener('hashchange', openHash);
  const choose = n => {
    select(n); tabs[n].focus();
    history.replaceState(null, '', n === 0 ? location.pathname + location.search : '#' + panels[n].id);   // the first tab keeps the plain address
  };
  tabs.forEach((tab, n) => tab.addEventListener('click', e => { e.preventDefault(); choose(n); }));
  tabList.addEventListener('keydown', e => {
    const n = tabs.indexOf(document.activeElement);
    if (n < 0) return;
    const to = { ArrowRight: n + 1, ArrowLeft: n - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to !== undefined) { e.preventDefault(); choose((to + tabs.length) % tabs.length); }
    else if (e.key === ' ') { e.preventDefault(); choose(n); }
  });
}

/* case contents: highlight the section being read */
const tocLinks = [...document.querySelectorAll('.toc a')];
const sections = [...document.querySelectorAll('.case-section')];
if (tocLinks.length) {
  let ticking = false;
  const update = () => {
    ticking = false;
    let current = null;
    for (const s of sections) if (s.offsetParent && s.getBoundingClientRect().top < window.innerHeight * 0.35) current = s.id;   // skip sections in a hidden tab
    tocLinks.forEach(a => a.classList.toggle('is-current', a.hash === '#' + current));
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
}

/* lightbox for figures */
const box = document.querySelector('.lightbox');
if (box) {
  let trigger;
  const img = box.querySelector('img'), cap = box.querySelector('p'), link = box.querySelector('a');
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-enlarge]');
    if (!btn) return;
    trigger = btn;
    const pic = btn.querySelector('img') || btn.closest('.frame').querySelector('img');   // 'scroll' figures: the button sits beside the picture, not around it
    img.src = btn.dataset.full || pic.currentSrc || pic.src; img.alt = pic.alt; link.href = img.src;   // data-full (2026-11-26): the page shows a smaller copy, the lightbox the full one
    cap.textContent = btn.closest('figure')?.querySelector('figcaption')?.textContent || pic.alt;
    box.showModal(); document.body.style.overflow = 'hidden';
  });
  box.querySelector('.lightbox__close').addEventListener('click', () => box.close());
  box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('lightbox__inner')) box.close(); });
  box.addEventListener('close', () => { document.body.style.overflow = ''; img.removeAttribute('src'); trigger?.focus(); });
}

/* figures with 'scroll': the picture scrolls inside a 16:9 window (CSS only);
   this hides the "scroll to see more" hint once the bottom has been reached, and (2026-11-25) hands the scroll
   distance to the 'sticky' layer as --st so a side column can ride up and then stay, like it does in the real app */
document.querySelectorAll('[data-scroll-shot]').forEach(shot => {
  const view = shot.querySelector('.shot-scroll__view');
  const sticky = shot.querySelector('.shot-scroll__sticky');
  const update = () => {
    shot.classList.toggle('is-end', view.scrollHeight - view.scrollTop - view.clientHeight < 4);
    if (sticky) shot.style.setProperty('--st', view.scrollTop);
  };
  view.addEventListener('scroll', update, { passive: true });
  view.querySelector('img')?.addEventListener('load', update);
  window.addEventListener('resize', update, { passive: true });
  // 2026-11-27: inside a hidden tab panel (figure kind 'tabs') the window measures 0 tall and reads as "at the end";
  // re-measure when the panel is shown, otherwise the hint and fade stay hidden on a picture that still scrolls
  if ('ResizeObserver' in window) new ResizeObserver(update).observe(view);
  update();
});

/* 「更多系统模块」 (2026-11-25, card 20261126-005): an open row's header sticks under the top bar (CSS).
   Closing it while it is stuck would leave the reader far below, in whatever came after the long body;
   so after closing, bring the row back to the top of the screen */
document.querySelectorAll('.case-module > summary').forEach(sum => {
  const d = sum.parentElement;
  sum.addEventListener('click', () => {
    if (!d.open) return;
    const bar = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0;
    if (d.getBoundingClientRect().top >= bar - 1) return;
    requestAnimationFrame(() => window.scrollBy({ top: d.getBoundingClientRect().top - bar, behavior: 'instant' }));   // not scrollIntoView: the page's scroll-padding (96px, for anchor jumps) would leave a gap
  });
});

/* numbered pins (2026-11-26): pointing at or tabbing to a line under a figure enlarges the pin with the same number
   (styles.css keeps it still when the system asks for reduced motion) */
document.querySelectorAll('.pin-notes li[data-pin]').forEach(li => {
  const scope = li.closest('[data-pins]');
  if (!scope) return;
  const on = v => scope.querySelectorAll(`.pin-layer .pin[data-pin="${li.dataset.pin}"]`).forEach(p => p.classList.toggle('is-active', v));
  li.addEventListener('pointerenter', () => on(true));
  li.addEventListener('pointerleave', () => on(false));
  li.addEventListener('focus', () => on(true));
  li.addEventListener('blur', () => on(false));
});

/* image placeholders (2026-11-26): until a case picture has arrived its box shows the page colour, not the white frame
   behind it, so a jump through the contents on a slow connection does not flash white rectangles */
document.querySelectorAll('.case-body img').forEach(im => {
  if (im.complete) return;
  im.classList.add('is-wait');
  const done = () => im.classList.remove('is-wait');
  im.addEventListener('load', done, { once: true });
  im.addEventListener('error', done, { once: true });
});

/* structure mode: shows the components this page is built from */
const structure = document.querySelector('.structure-toggle');
if (structure) {
  structure.addEventListener('click', () => {
    const on = structure.getAttribute('aria-pressed') !== 'true';
    structure.setAttribute('aria-pressed', String(on));
    document.body.classList.toggle('show-structure', on);
  });
}

/* before/after box (2026-11-28, Agent Matrix 03): --pos is where the line sits, from the left; the "after" picture is cut away left of it.
   Mouse: press anywhere to jump there, then drag. Touch: only a sideways drag moves the line, an up-down swipe scrolls the page
   (styles.css touch-action: pan-y). Keyboard and screen readers use the hidden range on top. The two tags push the line to one end;
   with reduced motion they jump without the slide */
document.querySelectorAll('[data-compare]').forEach(box => {
  const range = box.querySelector('.compare__range');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  const set = (v, anim) => {
    v = Math.max(0, Math.min(100, Math.round(v * 10) / 10));
    box.classList.toggle('is-anim', !!anim && !calm.matches);
    box.style.setProperty('--pos', v + '%');
    range.value = Math.round(v);
    range.setAttribute('aria-valuetext', Math.round(v) + '%');
  };
  const at = e => { const r = box.getBoundingClientRect(); return (e.clientX - r.left) / r.width * 100; };
  range.addEventListener('input', () => set(+range.value, false));
  box.querySelectorAll('.compare__tag').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); set(+b.dataset.to, true); }));
  let drag = null;
  box.addEventListener('pointerdown', e => {
    if (e.target.closest('.compare__tag') || e.button > 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, live: e.pointerType === 'mouse' };
    if (drag.live) { e.preventDefault(); box.setPointerCapture(e.pointerId); set(at(e), false); }
  });
  box.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.live) {
      const dx = Math.abs(e.clientX - drag.x), dy = Math.abs(e.clientY - drag.y);
      if (dy > dx && dy > 6) { drag = null; return; }   // up-down: leave it to the page scroll
      if (dx < 6) return;
      drag.live = true;
      try { box.setPointerCapture(e.pointerId); } catch (_) {}
    }
    set(at(e), false);
  });
  const end = e => { if (drag && e.pointerId === drag.id) drag = null; };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
});

/* 「一张卡走一圈」 (2026-11-28, Agent Matrix #how, prototypes.py loop()) */

/* 「一张卡走一圈」 (2026-11-27, card 20261127-009; prototypes.py loop()). The page is drawn as 「现在」 with plain <span> blocks,
   so it reads the same without JS and in print; this turns the blocks into buttons, switches the three states
   (blocks that are not in a state are taken out of the page, not faded) and opens one block's detail at a time.
   Desktop: the detail sits at the bottom of the diagram. Phone (≤700px): stations start collapsed, the station name opens one,
   and the detail sits inside that station (or rail) under the block. Pictures get their src only when their block is opened. */
(() => {
  const roots = document.querySelectorAll('[data-loop]');
  if (!roots.length) return;
  const narrow = matchMedia('(max-width:700px)');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const how = () => (still.matches ? 'instant' : 'smooth');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  roots.forEach(root => {
    let cfg;
    try { cfg = JSON.parse(root.dataset.config); } catch { return; }
    const I = cfg.i18n, B = cfg.b;
    const stage = root.querySelector('[data-stage]'), detail = root.querySelector('[data-detail]');
    const seg = root.querySelector('[data-seg]'), segBtns = [...seg.querySelectorAll('[data-state]')];
    const legendNew = root.querySelector('[data-legend-new]');
    const boxes = [...root.querySelectorAll('[data-box]')];
    const stations = boxes.filter(b => b.classList.contains('lp-st'));
    const rails = boxes.filter(b => b.classList.contains('lp-rail'));
    let state = 'now', openBtn = null, before = null, after = null;

    const ids = box => (state === 'start' ? (cfg.start[box] || []) : cfg.boxes[box].concat(state === 'next' ? cfg.plus[box] : []));
    const blockHTML = id => {
      const b = B[id];
      const text = b.plus ? `<span class="lp-b__plus">${esc(b.n[0])}</span>${esc(b.n.slice(1))}` : esc(b.n);
      return `<button type="button" class="lp-b${b.new ? ' lp-b--new' : ''}${b.plus ? ' lp-b--plus' : ''}" data-id="${id}" aria-pressed="false">`
        + (b.new ? '<span class="lp-b__dot" aria-hidden="true"></span>' : '')
        + `<span class="lp-b__t">${text}</span>` + (b.new ? `<span class="sr-only">${esc(I.sr_new)}</span>` : '') + '</button>';
    };

    /* phone: station name → open / close; the badge says how many blocks the station has now, 「收起」 while open */
    const badge = st => {
      const t = st.querySelector('[data-badge]');
      if (t) t.textContent = st.classList.contains('is-open') ? I.close : String(st.querySelectorAll('.lp-b').length);
    };
    const setOpen = (st, on) => {
      st.classList.toggle('is-open', on);
      st.querySelector('.lp-st__tog')?.setAttribute('aria-expanded', String(on));
      badge(st);
    };
    stations.forEach(st => {
      const tog = document.createElement('button');
      tog.type = 'button'; tog.className = 'lp-st__tog';
      tog.setAttribute('aria-expanded', 'false'); tog.setAttribute('aria-controls', st.querySelector('[data-list]').id);
      tog.innerHTML = `<span class="lp-st__tl">${st.querySelector('.lp-st__label').innerHTML}</span><span class="lp-st__badge" data-badge></span>`;
      st.querySelector('.lp-st__h').appendChild(tog);
      tog.addEventListener('click', () => {
        // keep this station's top edge where it is on screen, also when its detail goes with it
        const top = st.getBoundingClientRect().top, on = !st.classList.contains('is-open');
        if (!on && openBtn && st.contains(openBtn)) close(false);
        setOpen(st, on);
        const d = st.getBoundingClientRect().top - top;
        if (Math.abs(d) >= 0.5) window.scrollBy({ top: d, behavior: 'instant' });
      });
    });

    const render = animate => {
      boxes.forEach(box => {
        const list = box.querySelector('[data-list]');
        const had = new Set([...list.querySelectorAll('[data-id]')].map(b => b.dataset.id));
        list.innerHTML = ids(box.dataset.box).map(blockHTML).join('');
        if (animate) list.querySelectorAll('.lp-b').forEach(b => { if (!had.has(b.dataset.id)) b.classList.add('is-enter'); });
      });
      rails.forEach(r => { r.hidden = state === 'start'; });
      legendNew.hidden = state === 'start';
      stations.forEach(st => {
        const empty = !st.querySelector('.lp-b');
        st.classList.toggle('is-empty', empty);
        if (empty) setOpen(st, false); else badge(st);
      });
    };

    /* the detail */
    const fill = id => {
      const b = B[id], im = b.img;
      const fig = im ? `<figure class="lp-fig"><button type="button" class="enlarge" data-enlarge aria-label="${esc(I.zoom + b.n)}">`
        + `<img src="${esc(im.src)}"${im.w ? ` width="${im.w}" height="${im.h}"` : ''} alt="${esc(b.n)}" decoding="async"></button>`
        + `<figcaption>${esc(I.cap)}</figcaption></figure>` : '';
      detail.innerHTML = `<div class="lp-detail__body${im ? ' lp-detail__body--img' : ''}"><dl>`
        + `<dt>${esc(b.plus ? I.pq : I.q)}</dt><dd class="lp-q">${esc(b.q)}</dd>`
        + `<dt>${esc(b.plus ? I.pa : I.a)}</dt><dd>${esc(b.a)}</dd></dl>${fig}</div>`;
    };
    const open = btn => {
      const ref = btn.getBoundingClientRect().top;
      if (!openBtn) { before = window.scrollY; after = null; }
      openBtn?.setAttribute('aria-pressed', 'false');
      openBtn = btn; btn.setAttribute('aria-pressed', 'true');
      const host = narrow.matches ? btn.closest('.lp-st, .lp-rail') : stage;
      if (detail.parentElement !== host) host.appendChild(detail);
      fill(btn.dataset.id);
      // moving the detail out of a station above this one must not move the block that was just tapped
      const d = btn.getBoundingClientRect().top - ref;
      if (Math.abs(d) >= 0.5) window.scrollBy({ top: d, behavior: 'instant' });
      // if the detail's bottom is off screen, scroll only until it is all in view ('nearest'), never past its top
      const r = detail.getBoundingClientRect();
      if (r.bottom > innerHeight) {
        const bar = document.querySelector('.topbar')?.getBoundingClientRect().bottom || 0;
        const by = Math.min(r.bottom - innerHeight + 8, r.top - bar - 8);
        if (by > 0) {
          const max = document.documentElement.scrollHeight - innerHeight;
          after = Math.min(max, Math.round(window.scrollY + by));
          window.scrollTo({ top: after, behavior: how() });
        }
      }
    };
    // closing puts the page back where it was before the detail scrolled it into view (if the reader has not scrolled since)
    function close(restore = true) {
      if (!openBtn) return null;
      const btn = openBtn;
      btn.setAttribute('aria-pressed', 'false'); openBtn = null;
      detail.innerHTML = '';
      if (restore && after !== null && Math.abs(window.scrollY - after) < 2) window.scrollTo({ top: before, behavior: how() });
      before = after = null;
      return btn;
    }

    const setState = (s, animate = true) => {
      if (s === state) return;
      close();
      state = s;
      segBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.state === s)));
      render(animate && !still.matches);
    };

    stage.addEventListener('click', e => {
      const b = e.target.closest('button.lp-b');
      if (!b) return;
      if (b === openBtn) close(); else open(b);
    });
    root.addEventListener('keydown', e => {
      if (e.key !== 'Escape' || !openBtn) return;
      e.preventDefault();
      close()?.focus({ preventScroll: true });
    });
    segBtns.forEach(b => b.addEventListener('click', () => setState(b.dataset.state)));
    narrow.addEventListener?.('change', () => close(false));
    // print is always 「现在」
    let printed = null;
    window.addEventListener('beforeprint', () => { if (state !== 'now') { printed = state; setState('now', false); } });
    window.addEventListener('afterprint', () => { if (printed) { setState(printed, false); printed = null; } });

    seg.hidden = false;
    root.classList.add('is-js');
    render(false);
  });
})();
