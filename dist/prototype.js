// Demos built from original screens. No network calls except the optional
// embed of the public Commons Fridge prototype, loaded only on request.
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const read = el => JSON.parse(el.dataset.proto || el.dataset.tour || el.dataset.smt || '{}');

/* ---------- 1. Screen-flow player ---------- */
function flowPlayer(root) {
  const data = read(root);
  const layer = root.querySelector('.proto__hotspots');
  const screens = [...root.querySelectorAll('.proto__screen')];
  const note = root.querySelector('[data-note]');
  const next = root.querySelector('[data-next]');
  const rail = [...root.querySelectorAll('.rail button')];
  const order = rail.map(b => b.dataset.go);
  const screenBox = root.querySelector('.proto__screens');
  let current = data.start;
  const visited = new Set([current]);

  function endCard() {
    const end = document.createElement('div');
    end.className = 'proto__end';
    end.innerHTML = `<div><p></p><button type="button" class="btn btn--small">↺ ${data.labels.restart}</button></div>`;
    end.querySelector('p').textContent = data.end;
    end.querySelector('button').addEventListener('click', () => { end.remove(); go(data.start, true); });
    screenBox.append(end);
    end.querySelector('button').focus();
  }

  function go(id, focus) {
    if (id === '@end') { endCard(); return; }
    const s = data.screens[id];
    if (!s) return;
    current = id; visited.add(id);
    screenBox.querySelector('.proto__end')?.remove();
    screens.forEach(img => {
      if (img.dataset.screen === id) img.removeAttribute('data-hidden');
      else img.setAttribute('data-hidden', '');
    });
    note.textContent = s.note;
    next.textContent = s.next;
    rail.forEach(b => {
      b.toggleAttribute('aria-current', false);
      if (b.dataset.go === id) b.setAttribute('aria-current', 'step');
      b.classList.toggle('is-done', visited.has(b.dataset.go) && b.dataset.go !== id && order.indexOf(b.dataset.go) < order.indexOf(id));
    });
    layer.replaceChildren(...s.hotspots.map(h => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hotspot';
      Object.assign(b.style, { left: h.x + '%', top: h.y + '%', width: h.w + '%', height: h.h + '%' });
      b.setAttribute('aria-label', h.label);
      b.addEventListener('click', () => {
        if (h.go) go(h.go, true);
        else if (h.note) { note.textContent = h.note; }
      });
      return b;
    }));
    if (focus) layer.querySelector('.hotspot')?.focus({ preventScroll: true });
  }

  rail.forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
  root.querySelector('[data-action="restart"]')?.addEventListener('click', () => { visited.clear(); visited.add(data.start); go(data.start); });
  root.querySelector('[data-action="hint"]')?.addEventListener('click', () => {
    root.classList.remove('is-hinting'); void root.offsetWidth; root.classList.add('is-hinting');
    setTimeout(() => root.classList.remove('is-hinting'), 2600);
  });
  go(current);
}

/* ---------- 2. Guided tour of one original screen ---------- */
function tour(root) {
  const data = read(root);
  const viewport = root.querySelector('.tour__viewport');
  const canvas = root.querySelector('.tour__canvas');
  const mark = root.querySelector('.tour__mark');
  viewport.append(mark);                           // keep the outline crisp while zoomed
  const note = root.querySelector('[data-note]');
  const rail = [...root.querySelectorAll('.rail button')];
  const branchRow = root.querySelector('[data-branch-row]');
  const dims = { true: root.querySelector('[data-branch="true"]'), false: root.querySelector('[data-branch="false"]') };
  const place = (el, b) => Object.assign(el.style, { left: b[0] + '%', top: b[1] + '%', width: b[2] + '%', height: b[3] + '%' });
  place(dims.true, data.true); place(dims.false, data.false);
  let selected = true;
  const initialNote = note.textContent;

  function setBranch(value) {
    selected = value;
    root.querySelectorAll('[data-selected]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.selected === String(value))));
    // dim the path that does not apply
    dims.false.hidden = !value; dims.true.hidden = value;
  }
  function frame(box) {
    if (!box) {
      canvas.style.transform = 'none';
      mark.setAttribute('data-off', '');
      return;
    }
    const [x, y, w, h] = box;
    const s = Math.min(3, Math.max(1, Math.min(88 / w, 88 / h)));
    let tx = 50 - (x + w / 2) * s, ty = 50 - (y + h / 2) * s;
    tx = Math.min(0, Math.max(100 - 100 * s, tx));
    ty = Math.min(0, Math.max(100 - 100 * s, ty));
    canvas.style.transform = `translate(${tx}%, ${ty}%) scale(${s})`;
    mark.removeAttribute('data-off');
    Object.assign(mark.style, { left: (tx + x * s) + '%', top: (ty + y * s) + '%', width: (w * s) + '%', height: (h * s) + '%' });
  }
  function step(i) {
    const st = data.steps[i];
    rail.forEach((b, n) => { b.toggleAttribute('aria-current', false); if (n === i) b.setAttribute('aria-current', 'step'); b.classList.toggle('is-done', n < i); });
    note.textContent = st.note;
    frame(st.box);
    const isBranch = st.id === 'branches';
    branchRow.hidden = !isBranch;
    if (isBranch) setBranch(selected); else { dims.true.hidden = true; dims.false.hidden = true; }
  }
  rail.forEach((b, i) => b.addEventListener('click', () => step(i)));
  root.querySelectorAll('[data-selected]').forEach(b => b.addEventListener('click', () => setBranch(b.dataset.selected === 'true')));
  root.querySelector('[data-action="overview"]').addEventListener('click', () => {
    rail.forEach(b => b.removeAttribute('aria-current'));
    frame(null); branchRow.hidden = true; dims.true.hidden = true; dims.false.hidden = true; note.textContent = initialNote;
  });
  if (reduce) canvas.style.transition = mark.style.transition = 'none';
}

/* ---------- 3. SMT component states ---------- */
function smt(root) {
  const data = read(root);
  const rows = [...root.querySelectorAll('tbody tr')];
  const note = root.querySelector('[data-note]');
  const rail = [...root.querySelectorAll('.rail button')];
  const first = rows[0];
  const cells = [...first.children].map(td => td.innerHTML);
  function state(name) {
    rail.forEach(b => { b.toggleAttribute('aria-current', false); if (b.dataset.state === name) b.setAttribute('aria-current', 'step'); });
    rows.forEach(r => r.classList.remove('is-hover'));
    first.classList.toggle('is-empty', name === 'empty');
    [...first.children].forEach((td, i) => td.innerHTML = name === 'empty' ? '&nbsp;' : cells[i]);
    if (name === 'selected') { rows.forEach(r => r.classList.remove('is-selected')); first.classList.add('is-selected'); }
    if (name === 'default' || name === 'empty') rows.forEach(r => r.classList.remove('is-selected'));
    if (name === 'hover') first.classList.add('is-hover');
    note.textContent = data.notes[name];
  }
  rail.forEach(b => b.addEventListener('click', () => state(b.dataset.state)));
  rows.forEach(r => {
    const pick = () => {
      if (r.classList.contains('is-empty')) return;
      rows.forEach(x => x.classList.remove('is-selected')); r.classList.add('is-selected');
      rail.forEach(b => { b.toggleAttribute('aria-current', false); if (b.dataset.state === 'selected') b.setAttribute('aria-current', 'step'); });
      note.textContent = data.notes.selected;
    };
    r.addEventListener('click', pick);
    r.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
  });
  state('default');
}

/* ---------- 4. Live prototype embed ---------- */
function live(root) {
  const url = root.dataset.live;
  const screen = root.querySelector('.phone__screen');
  const routes = [...root.querySelectorAll('[data-route]')];
  const reload = root.querySelector('[data-action="reset-frame"]');
  let frame;
  function load(route = 'home') {
    if (!frame) {
      frame = document.createElement('iframe');
      frame.title = root.querySelector('.frame-label__name span').textContent;
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer';
      frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
      screen.querySelector('.live__poster').remove();
      screen.append(frame);
      routes.forEach(b => b.disabled = false);
      reload.disabled = false;
    }
    frame.src = url + (route === 'home' ? '#home' : '#' + route);
  }
  root.querySelector('[data-action="load"]').addEventListener('click', () => { load(); frame.focus(); });
  routes.forEach(b => b.addEventListener('click', () => load(b.dataset.route)));
  reload.addEventListener('click', () => { if (frame) frame.src = frame.src; });
}

/* ---------- 5. Recording tabs ---------- */
function clips(root) {
  const tabs = [...root.querySelectorAll('[data-clip]')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t === tab)));
    root.querySelectorAll('[data-clip-panel]').forEach(p => {
      const on = p.dataset.clipPanel === tab.dataset.clip;
      p.hidden = !on;
      if (!on) p.querySelector('video')?.pause();
    });
  }));
}

document.querySelectorAll('[data-proto]').forEach(flowPlayer);
document.querySelectorAll('[data-tour]').forEach(tour);
document.querySelectorAll('[data-smt]').forEach(smt);
document.querySelectorAll('[data-live]').forEach(live);
document.querySelectorAll('[data-clips]').forEach(clips);
