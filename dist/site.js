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
    img.src = pic.currentSrc || pic.src; img.alt = pic.alt; link.href = img.src;
    cap.textContent = btn.closest('figure')?.querySelector('figcaption')?.textContent || pic.alt;
    box.showModal(); document.body.style.overflow = 'hidden';
  });
  box.querySelector('.lightbox__close').addEventListener('click', () => box.close());
  box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('lightbox__inner')) box.close(); });
  box.addEventListener('close', () => { document.body.style.overflow = ''; img.removeAttribute('src'); trigger?.focus(); });
}

/* figures with 'scroll': the picture scrolls inside a 16:9 window (CSS only);
   this just hides the "scroll to see more" hint once the bottom has been reached */
document.querySelectorAll('[data-scroll-shot]').forEach(shot => {
  const view = shot.querySelector('.shot-scroll__view');
  const update = () => shot.classList.toggle('is-end', view.scrollHeight - view.scrollTop - view.clientHeight < 4);
  view.addEventListener('scroll', update, { passive: true });
  view.querySelector('img')?.addEventListener('load', update);
  window.addEventListener('resize', update, { passive: true });
  update();
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
