const menu = document.querySelector('.menu-btn');
const nav = document.querySelector('.navlinks');
if (menu && nav) {
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.classList.toggle('mobile-open', open); if (open) nav.querySelector('a')?.focus(); });
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('mobile-open'); } });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { menu.setAttribute('aria-expanded','false');nav.classList.remove('mobile-open');menu.focus(); }});
}
const box = document.querySelector('.lightbox');
if (box) {
  let trigger;
  document.querySelectorAll('[data-enlarge]').forEach(button => button.addEventListener('click', () => {
    trigger = button;
    const picture = button.querySelector('img');
    box.querySelector('img').src = picture.src;
    box.querySelector('img').alt = picture.alt;
    box.querySelector('.original-image').href = picture.src;
    box.querySelector('p').textContent = button.closest('figure').querySelector('figcaption')?.textContent || picture.alt;
    box.showModal(); document.body.style.overflow = 'hidden';
  }));
  box.querySelector('button').addEventListener('click', () => box.close());
  box.addEventListener('click', event => { if (event.target === box) { const r=box.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)box.close(); }});
  box.addEventListener('close', () => { document.body.style.overflow = ''; if(trigger) trigger.focus(); });
}
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      document.querySelectorAll('.case-toc a').forEach(a => a.classList.toggle('current', a.hash === '#' + entry.target.id));
    }
  }, { rootMargin: '-100px 0px -60% 0px' });
  document.querySelectorAll('.case-section').forEach(section => observer.observe(section));
}
