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

  /* Direct manipulation on top of the frames (added 2026-11-15).
     A drag or a drawn selection only ever leads to a frame the recording
     already contains; the one exception is the comment demo's own reply box,
     which is declared as a rebuilt component in its provenance line. */
  const OVERLAY = '.proto__ghost,.proto__drop,.proto__sel,.proto__reply,.proto__pin,.proto__bubble';
  const clearOverlay = () => screenBox.querySelectorAll(OVERLAY).forEach(e => e.remove());
  const at = e => { const r = screenBox.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }; };
  const within = (p, b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
  const place = (el, b) => Object.assign(el.style, { left: b.x + '%', top: b.y + '%', width: b.w + '%', height: b.h + '%' });
  // the click that the browser fires right after a drag's release must not count as a tap
  const skipClick = b => { b._skip = true; setTimeout(() => { b._skip = false; }, 0); };

  function dragSetup(b, h) {
    b.classList.add('hotspot--drag');
    let from = null, ghost = null, zone = null;
    const move = e => {
      if (!from) return;
      const p = at(e);
      if (!ghost) {
        if (Math.hypot(p.x - from.x, (p.y - from.y) * 0.5625) < 0.8) return;   // ignore jitter: a tap stays a tap
        const img = screens.find(i => i.dataset.screen === current);
        ghost = document.createElement('div');
        ghost.className = 'proto__ghost';
        // the thing being dragged is the item itself: the same frame, clipped to the item
        Object.assign(ghost.style, { backgroundImage: `url("${img.currentSrc || img.src}")`, backgroundSize: `${10000 / h.w}% ${10000 / h.h}%`, backgroundPosition: `${h.x / (100 - h.w) * 100}% ${h.y / (100 - h.h) * 100}%` });
        zone = document.createElement('div');
        zone.className = 'proto__drop';
        place(zone, h.drop);
        screenBox.append(zone, ghost);
      }
      place(ghost, { x: h.x + p.x - from.x, y: h.y + p.y - from.y, w: h.w, h: h.h });
      zone.classList.toggle('is-over', within(p, h.drop));
    };
    const drop = e => {
      if (!from) return;
      from = null;
      track(false);
      if (!ghost) return;                      // no movement: the click handler moves on
      const hit = within(at(e), h.drop);
      ghost.remove(); zone.remove(); ghost = zone = null;
      skipClick(b);
      if (hit) go(h.go, true);
      else if (h.miss) note.textContent = h.miss;
    };
    // listen on the window while a drag is on, so the release is caught wherever it happens
    const track = on => ['pointermove', 'pointerup', 'pointercancel'].forEach((type, i) => window[on ? 'addEventListener' : 'removeEventListener'](type, i ? drop : move));
    b.addEventListener('pointerdown', e => { if (e.button) return; from = at(e); track(true); });
  }

  function drawSetup(b, h) {
    const c = data.draw;
    b.classList.add('hotspot--draw');
    const live = () => screenBox.clientWidth >= 640;   // too small to type in: a tap follows the recording instead
    const clamp = p => ({ x: Math.min(Math.max(p.x, h.x), h.x + h.w), y: Math.min(Math.max(p.y, h.y), h.y + h.h) });
    let from = null, sel = null;
    const move = e => {
      if (!from) return;
      const p = clamp(at(e)), w = Math.abs(p.x - from.x), hh = Math.abs(p.y - from.y);
      if (!sel) {
        if (Math.max(w, hh * 0.5625) < 1) return;
        clearOverlay();
        sel = document.createElement('div');
        sel.className = 'proto__sel';
        sel.style.borderColor = c.colour;
        screenBox.append(sel);
      }
      place(sel, { x: Math.min(p.x, from.x), y: Math.min(p.y, from.y), w, h: hh });
    };
    const done = () => {
      if (!from) return;
      from = null;
      track(false);
      if (!sel) return;
      skipClick(b);
      const box = { x: parseFloat(sel.style.left), y: parseFloat(sel.style.top), w: parseFloat(sel.style.width), h: parseFloat(sel.style.height) };
      sel = null;
      reply(box, c);
    };
    const track = on => ['pointermove', 'pointerup', 'pointercancel'].forEach((type, i) => window[on ? 'addEventListener' : 'removeEventListener'](type, i ? done : move));
    b.addEventListener('pointerdown', e => { if (e.button || !live()) return; from = clamp(at(e)); track(true); });
  }

  function reply(box, c) {
    const [BW, BH] = c.base, [dx, dy, dw, dh] = c.dialog;
    const px = v => v / BW * 100, py = v => v / BH * 100;
    const crop = ([x, y, w, hh]) => ({ backgroundImage: `url("${c.src}")`, backgroundSize: `${BW / w * 100}% ${BH / hh * 100}%`, backgroundPosition: `${x / (BW - w) * 100}% ${y / (BH - hh) * 100}%` });
    const fontSize = screenBox.clientWidth / BW * 24 + 'px';
    const d = { w: px(dw), h: py(dh) };
    d.x = Math.min(box.x + box.w + px(c.gap[0]), 99 - d.w);
    d.y = Math.min(box.y + box.h + py(c.gap[1]), 99 - d.h);
    const el = document.createElement('form');
    el.className = 'proto__reply';
    place(el, d);
    Object.assign(el.style, crop(c.dialog), { fontSize });
    const part = (tag, [x, y, w, hh]) => {
      const n = document.createElement(tag);
      Object.assign(n.style, { left: (x - dx) / dw * 100 + '%', top: (y - dy) / dh * 100 + '%', width: w / dw * 100 + '%', height: hh / dh * 100 + '%' });
      el.append(n);
      return n;
    };
    const field = part('textarea', c.field);
    field.placeholder = c.placeholder; field.maxLength = 60; field.setAttribute('aria-label', c.field_label);
    const cancel = part('button', c.cancel);
    cancel.type = 'button'; cancel.setAttribute('aria-label', c.cancel_label);
    const send = part('button', c.send);
    send.type = 'submit'; send.setAttribute('aria-label', c.send_label);
    cancel.addEventListener('click', clearOverlay);
    field.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.requestSubmit(); } });
    el.addEventListener('submit', e => {
      e.preventDefault();
      const text = field.value.trim();
      clearOverlay();
      const pin = document.createElement('button');
      pin.type = 'button'; pin.className = 'proto__pin'; pin.setAttribute('aria-label', c.pin_label);
      Object.assign(pin.style, { left: d.x - px(6) + '%', top: d.y + py(5) + '%', width: px(c.pin) + '%', background: c.colour });
      const bubble = document.createElement('div');
      bubble.className = 'proto__bubble';
      Object.assign(bubble.style, { left: d.x + px(9) + '%', top: d.y - py(54) + '%', fontSize });
      const face = document.createElement('i');
      Object.assign(face.style, crop(c.avatar));
      const who = document.createElement('b');
      who.textContent = c.who;
      const said = document.createElement('span');
      said.textContent = text;
      bubble.append(face, who, said);
      pin.addEventListener('click', () => { bubble.hidden = !bubble.hidden; });
      screenBox.append(pin, bubble);
      note.textContent = c.sent; next.textContent = c.sent_next;
      pin.focus({ preventScroll: true });
    });
    screenBox.append(el);
    field.focus({ preventScroll: true });
  }

  function go(id, focus) {
    if (id === '@end') { endCard(); return; }
    const s = data.screens[id];
    if (!s) return;
    current = id; visited.add(id);
    screenBox.querySelector('.proto__end')?.remove();
    clearOverlay();
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
        if (b._skip) return;   // this click is the tail of a drag
        if (h.go) go(h.go, true);
        else if (h.note) { note.textContent = h.note; }
      });
      if (h.drop) dragSetup(b, h);
      if (h.draw && data.draw) drawSetup(b, h);
      return b;
    }));
    if (focus) layer.querySelector('.hotspot')?.focus({ preventScroll: true });
  }

  rail.forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
  root.querySelector('[data-action="restart"]')?.addEventListener('click', () => { visited.clear(); visited.add(data.start); go(data.start); });
  // small screens: the controls inside a desktop frame are too small to hit, so one button does the current step
  root.querySelector('[data-action="do"]')?.addEventListener('click', () => {
    const h = data.screens[current].hotspots.find(x => x.go);
    if (h) go(h.go);
  });
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

/* ---------- 6. Playable recordings: one demo visible at a time ---------- */
function liveset(root) {
  const tabs = [...root.querySelectorAll('[data-live-tab]')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t === tab)));
    root.querySelectorAll('[data-live-panel]').forEach(p => { p.hidden = p.dataset.livePanel !== tab.dataset.liveTab; });
  }));
}

document.querySelectorAll('[data-proto]').forEach(flowPlayer);
document.querySelectorAll('[data-liveset]').forEach(liveset);
document.querySelectorAll('[data-tour]').forEach(tour);
document.querySelectorAll('[data-smt]').forEach(smt);
document.querySelectorAll('[data-live]').forEach(live);
document.querySelectorAll('[data-clips]').forEach(clips);
