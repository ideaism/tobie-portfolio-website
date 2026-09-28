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

/* hero: method steps light up the matching pin on the portrait */
const pins = [...document.querySelectorAll('.portrait .pin')];
document.querySelectorAll('.method__step').forEach(step => {
  const on = v => () => { pins.forEach(p => p.classList.toggle('is-active', v && p.dataset.pin === step.dataset.pin)); step.classList.toggle('is-active', v); };
  step.addEventListener('mouseenter', on(true)); step.addEventListener('mouseleave', on(false));
  step.addEventListener('focus', on(true)); step.addEventListener('blur', on(false));
});

/* case contents: highlight the section being read */
const tocLinks = [...document.querySelectorAll('.toc a')];
const sections = [...document.querySelectorAll('.case-section')];
if (tocLinks.length) {
  let ticking = false;
  const update = () => {
    ticking = false;
    let current = null;
    for (const s of sections) if (s.getBoundingClientRect().top < window.innerHeight * 0.35) current = s.id;
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
    const pic = btn.querySelector('img');
    img.src = pic.currentSrc || pic.src; img.alt = pic.alt; link.href = img.src;
    cap.textContent = btn.closest('figure')?.querySelector('figcaption')?.textContent || pic.alt;
    box.showModal(); document.body.style.overflow = 'hidden';
  });
  box.querySelector('.lightbox__close').addEventListener('click', () => box.close());
  box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('lightbox__inner')) box.close(); });
  box.addEventListener('close', () => { document.body.style.overflow = ''; img.removeAttribute('src'); trigger?.focus(); });
}

/* structure mode: shows the components this page is built from */
const structure = document.querySelector('.structure-toggle');
if (structure) {
  structure.addEventListener('click', () => {
    const on = structure.getAttribute('aria-pressed') !== 'true';
    structure.setAttribute('aria-pressed', String(on));
    document.body.classList.toggle('show-structure', on);
  });
}
