// Demos built from original screens. No network calls except the optional
// embed of the public Commons Fridge prototype, loaded only on request.
// (The recipe rules further down have no DOM in them; tests load this file in Node to run them.)
const inBrowser = typeof document !== 'undefined';
const reduce = inBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

/* ---------- 6. PlayBook Studio, rebuilt in code (2026-11-16) ----------
   Three small interfaces that can be operated freely inside stated limits.
   What they look like comes from the source (recording frames, icons cut from
   them, sizes and colours measured on them); see prototypes.py STUDIO. */

/* 6a. Recipe rules: plain data in, plain data out. No DOM in here, so
   tests/recipe_rules.test.js runs the same code in Node.
   A recipe is { require: [piece], optional: [piece], groups: [{ choose, items: [piece], joins }], joins }.
   `joins` are the And / Or between neighbours: inside a group, and between groups. */
const recipeRules = (() => {
  const blank = () => ({ require: [], optional: [], groups: [], joins: [], seq: 0 });
  const fit = (a, n, fill) => { n = Math.max(0, n); while (a.length < n) a.push(fill); a.length = n; };
  const at = (i, n) => Math.min(Math.max(i ?? n, 0), n);
  function tidy(s) {   // keep the joins in step with what they join
    s.groups = s.groups.filter(g => g.items.length);
    s.groups.forEach(g => {
      fit(g.joins, g.items.length - 1, 'or');
      if (g.items.length < 2) g.choose = false;
      if (g.choose) g.joins.fill('or');
    });
    fit(s.joins, s.groups.length - 1, 'and');
    return s;
  }
  function load(spec) {
    const s = blank();
    const piece = (id, pct) => (pct == null ? { uid: 'p' + (++s.seq), id } : { uid: 'p' + (++s.seq), id, pct });
    s.require = (spec.require || []).map(id => piece(id));
    s.optional = (spec.optional || []).map(id => piece(id));
    s.groups = (spec.groups || []).map(g => ({ choose: !!g.choose, items: g.items.map(([id, pct]) => piece(id, pct)), joins: [...(g.joins || [])] }));
    s.joins = [...(spec.joins || [])];
    return tidy(s);
  }
  function find(s, uid) {
    for (const zone of ['require', 'optional']) {
      const i = s[zone].findIndex(p => p.uid === uid);
      if (i >= 0) return { zone, index: i, item: s[zone][i] };
    }
    for (let g = 0; g < s.groups.length; g++) {
      const i = s.groups[g].items.findIndex(p => p.uid === uid);
      if (i >= 0) return { zone: 'output', group: g, index: i, item: s.groups[g].items[i] };
    }
    return null;
  }
  const sideOf = (s, zone) => (zone === 'output' ? s.groups.flatMap(g => g.items) : [...s.require, ...s.optional]);
  // May item `id` go to `to`? '' means yes; otherwise the reason. `moving` is the uid of a piece that is already placed.
  function check(s, id, to, lim, moving) {
    if (!to || !['require', 'optional', 'output'].includes(to.zone)) return 'nowhere';
    if (sideOf(s, to.zone).some(p => p.id === id && p.uid !== moving)) return 'dup';
    if (to.zone !== 'output') return s[to.zone].filter(p => p.uid !== moving).length >= lim[to.zone] ? 'full' : '';
    if (to.group == null) {
      const from = moving ? find(s, moving) : null;
      const alone = from && from.zone === 'output' && s.groups[from.group].items.length === 1;   // its own group leaves with it
      return s.groups.length - (alone ? 1 : 0) >= lim.groups ? 'groups' : '';
    }
    const g = s.groups[to.group];
    if (!g) return 'nowhere';
    return g.items.filter(p => p.uid !== moving).length >= lim.group ? 'groupfull' : '';
  }
  function insert(s, item, to) {
    if (to.zone !== 'output') { s[to.zone].splice(at(to.index, s[to.zone].length), 0, item); return; }
    if (to.group == null) {
      const i = at(to.index, s.groups.length);
      s.groups.splice(i, 0, { choose: false, items: [item], joins: [] });
      if (s.groups.length > 1) s.joins.splice(Math.min(i, s.joins.length), 0, 'and');
      return;
    }
    const g = s.groups[to.group], i = at(to.index, g.items.length);
    g.items.splice(i, 0, item);
    if (g.items.length > 1) g.joins.splice(Math.min(i, g.joins.length), 0, 'or');
  }
  function detach(s, loc) {
    if (loc.zone !== 'output') { s[loc.zone].splice(loc.index, 1); return; }
    const g = s.groups[loc.group];
    g.items.splice(loc.index, 1);
    if (g.joins.length) g.joins.splice(Math.min(loc.index, g.joins.length - 1), 1);
    if (!g.items.length) {
      s.groups.splice(loc.group, 1);
      if (s.joins.length) s.joins.splice(Math.min(loc.group, s.joins.length - 1), 1);
    }
  }
  function add(s, id, to, lim, pct) {
    const why = check(s, id, to, lim);
    if (why) return why;
    const item = { uid: 'p' + (++s.seq), id };
    if (to.zone === 'output') item.pct = pct;
    insert(s, item, to);
    tidy(s);
    return '';
  }
  function move(s, uid, to, lim, pct) {
    const from = find(s, uid);
    if (!from) return 'nowhere';
    const why = check(s, from.item.id, to, lim, uid);
    if (why) return why;
    let t = { ...to };
    const gone = from.zone === 'output' && s.groups[from.group].items.length === 1;   // the group disappears with its last piece
    detach(s, from);
    // the piece has left: positions after it have shifted by one
    if (t.zone !== 'output') {
      if (t.zone === from.zone && t.index > from.index) t.index--;
    } else if (from.zone === 'output') {
      if (t.group == null) { if (gone && t.index > from.group) t.index--; }
      else if (gone && t.group === from.group) t = { zone: 'output', group: null, index: from.group };   // dropped on itself
      else if (gone && t.group > from.group) t.group--;
      else if (!gone && t.group === from.group && t.index > from.index) t.index--;
    }
    const item = from.item;
    if (t.zone === 'output') { if (item.pct == null) item.pct = pct; } else delete item.pct;
    insert(s, item, t);
    tidy(s);
    return '';
  }
  function remove(s, uid) {
    const loc = find(s, uid);
    if (!loc) return false;
    detach(s, loc);
    tidy(s);
    return true;
  }
  function nudge(s, uid, d) {   // one step earlier (-1) or later (+1): inside its list, or its whole group along the chain
    const loc = find(s, uid);
    if (!loc) return false;
    const solo = loc.zone === 'output' && s.groups[loc.group].items.length === 1;
    const list = solo ? s.groups : loc.zone === 'output' ? s.groups[loc.group].items : s[loc.zone];
    const i = solo ? loc.group : loc.index, j = i + d;
    if (j < 0 || j >= list.length) return false;
    [list[i], list[j]] = [list[j], list[i]];
    return true;
  }
  function toggleJoin(s, group, i) {
    const g = group == null ? null : s.groups[group];
    const a = g ? g.joins : s.joins;
    if (group != null && !g) return false;
    if (i < 0 || i >= a.length || (g && g.choose)) return false;
    a[i] = a[i] === 'and' ? 'or' : 'and';
    return true;
  }
  function toggleChoose(s, group) {
    const g = s.groups[group];
    if (!g || g.items.length < 2) return false;
    g.choose = !g.choose;
    tidy(s);
    return true;
  }
  function setPct(s, uid, value) {
    const loc = find(s, uid);
    if (!loc || loc.zone !== 'output' || !Number.isFinite(value)) return false;
    loc.item.pct = Math.min(100, Math.max(0, Math.round(value / 5) * 5));
    return true;
  }
  const count = s => s.require.length + s.optional.length + s.groups.reduce((n, g) => n + g.items.length, 0);
  return { blank, load, find, check, add, move, remove, nudge, toggleJoin, toggleChoose, setPct, count };
})();

/* 6b. Shared pieces of the three demos */
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
const fillIn = (s, vars) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
let justDragged = false;   // the click a browser fires right after a drag's release must not count as a click

// A press that has moved a little becomes a drag; one that has not stays a click.
// `start(event, x0, y0)` returns { move, end } or nothing to decline.
function dragOn(node, start) {
  node.addEventListener('pointerdown', e => {
    if (e.button || !e.isPrimary) return;
    const x0 = e.clientX, y0 = e.clientY;
    let run = null;
    const stop = () => ['pointermove', 'pointerup', 'pointercancel'].forEach((type, i) => window.removeEventListener(type, i ? end : move));
    const move = ev => {
      if (!run) {
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 6) return;
        run = start(ev, x0, y0);
        if (!run) { stop(); return; }
      }
      ev.preventDefault();
      run.move(ev);
    };
    const end = ev => {
      stop();
      if (!run) return;
      justDragged = true;
      setTimeout(() => { justDragged = false; }, 0);
      run.end(ev, ev.type === 'pointercancel');
    };
    ['pointermove', 'pointerup', 'pointercancel'].forEach((type, i) => window.addEventListener(type, i ? end : move));
  });
}

function studioShell(root) {
  const stage = root.querySelector('[data-stage]');
  const bar = root.querySelector('[data-bar]');
  const status = root.querySelector('[data-status]');
  const tools = root.querySelector('[data-tools]');
  const say = text => { status.textContent = text; };
  const button = (text, fn, o = {}) => {
    const b = el('button', 'studio__btn' + (o.cls ? ' ' + o.cls : ''), text);
    b.type = 'button';
    if (o.key) b.dataset.key = o.key;
    if (o.label) b.setAttribute('aria-label', o.label);
    if (o.pressed != null) b.setAttribute('aria-pressed', String(o.pressed));
    if (o.off) b.setAttribute('aria-disabled', 'true');
    b.addEventListener('click', () => (o.off ? say(o.off) : fn()));   // a blocked button says why instead of going dead
    return b;
  };
  const tool = (text, fn) => { const b = el('button', 'tool-btn', text); b.type = 'button'; b.addEventListener('click', fn); tools.append(b); return b; };
  // keep the keyboard where it was when part of the demo is drawn again
  const keepFocus = draw => {
    const key = root.contains(document.activeElement) ? document.activeElement.dataset.key : null;
    draw();
    if (key) root.querySelector(`[data-key="${key}"]`)?.focus({ preventScroll: true });
  };
  // the stage tells the stylesheet how wide it is; narrow screens get their own arrangement
  const watch = fn => {
    const run = () => { const w = stage.clientWidth; if (w) fn(w, w < 620); };
    new ResizeObserver(run).observe(stage);
    run();
  };
  // "Enlarge": the demo takes over the window, so the parts are big enough to grab on a laptop
  const big = root.querySelector('[data-action="big"]');
  if (big) {
    const close = el('button', 'studio__close btn btn--small', '✕ ' + big.dataset.on);
    close.type = 'button';
    root.append(close);
    const enlarge = on => {
      root.toggleAttribute('data-big', on);
      document.documentElement.classList.toggle('studio-open', on);
      big.textContent = '⤢ ' + (on ? big.dataset.on : big.dataset.off);
      if (on) { root.scrollTop = 0; close.focus({ preventScroll: true }); } else { big.focus({ preventScroll: true }); root.scrollIntoView({ block: 'nearest' }); }
    };
    big.hidden = false;
    big.addEventListener('click', () => enlarge(!root.hasAttribute('data-big')));
    close.addEventListener('click', () => enlarge(false));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !e.defaultPrevented && root.hasAttribute('data-big')) enlarge(false); });
  }
  stage.replaceChildren();   // the still picture is only for pages without JavaScript
  return { stage, bar, status, say, button, tool, keepFocus, watch, cfg: JSON.parse(root.dataset.config) };
}

/* 6c. Recipe editor */
function recipeLab(root) {
  const { stage, bar, say, button, tool, keepFocus, watch, cfg } = studioShell(root);
  const T = cfg.t, LIM = cfg.limits, R = recipeRules;
  const ZONE = { require: 'Require', optional: 'Optional', output: 'Output' };
  const items = Object.fromEntries(cfg.items.map((it, n) => [it.id, { ...it, n }]));
  const readout = root.querySelector('[data-read]');
  readout.hidden = false;
  let state = R.load(cfg.start);
  let held = null;   // what is in hand: { lib: item id } from the library, or { uid } of a placed piece

  const icon = id => {
    const i = el('i', 'rz-ico');
    i.style.backgroundImage = `url("${cfg.icons}")`;
    i.style.backgroundPosition = `${items[id].n / (cfg.items.length - 1) * 100}% 0`;
    return i;
  };
  stage.classList.add('rz');
  const chrome = el('div', 'rz__chrome');
  chrome.style.backgroundImage = `url("${cfg.chrome}")`;
  const lib = el('div', 'rz__lib');
  cfg.items.forEach(it => {
    const b = el('button', 'rz-lib');
    b.type = 'button';
    b.dataset.item = it.id; b.dataset.key = 'lib:' + it.id;
    b.style.setProperty('--x', it.lib[0]); b.style.setProperty('--y', it.lib[1]);
    b.setAttribute('aria-label', fillIn(T.lib_item, { name: it.name }));
    const c = el('span', 'rz-lib__ico');
    c.append(icon(it.id));
    b.append(c, el('span', 'rz-lib__name', it.name));
    b.addEventListener('click', () => { if (!justDragged) hold(held && held.lib === it.id ? null : { lib: it.id }); });
    lift(b, { id: it.id });
    lib.append(b);
  });
  const canvas = el('div', 'rz__canvas');
  const panel = (cls, name) => { const p = el('div', 'rz-panel ' + cls); p.append(el('div', 'rz-tab', name)); return p; };
  const pIn = panel('rz-panel--in', 'Input'), pCond = panel('rz-panel--cond', 'Condition'), pOut = panel('rz-panel--out', 'Output');
  const box = (zone, name) => {
    const b = el('div', 'rz-box'), slots = el('div', 'rz-slots');
    b.dataset.zone = zone;
    b.append(el('div', 'rz-tab', name), slots);
    pIn.append(b);
    return [b, slots];
  };
  const [bReq, sReq] = box('require', 'Require'), [bOpt, sOpt] = box('optional', 'Optional');
  const chain = el('div', 'rz-chain');
  pOut.dataset.zone = 'output';
  pOut.append(chain);
  canvas.append(pIn, pCond, pOut);
  const inert = (cls, label, text) => { const b = el('button', 'rz__inert ' + cls); b.type = 'button'; b.setAttribute('aria-label', label); b.addEventListener('click', () => say(text)); return b; };
  stage.append(chrome, el('div', 'rz__title', cfg.heading), lib, canvas, inert('rz__inert--tools', T.tools, T.said_tools), inert('rz__inert--upload', T.upload, T.said_upload));

  const nameOf = id => items[id].name;
  const whyNot = (code, id, to) => fillIn(T['no_' + code], { name: nameOf(id), zone: ZONE[to && to.zone] || '', n: code === 'full' ? LIM[to.zone] : code === 'groups' ? LIM.groups : LIM.group });

  function pill(kind, group, i, locked) {
    const b = el('button', 'rz-pill', kind === 'and' ? 'And' : 'Or');
    b.type = 'button';
    b.dataset.key = `join:${group}:${i}`;
    b.setAttribute('aria-label', fillIn(T.join, { kind: kind === 'and' ? 'And' : 'Or' }));
    b.addEventListener('click', e => {
      e.stopPropagation();
      if (locked) { say(T.said_locked); return; }
      R.toggleJoin(state, group, i);
      draw();
      say(fillIn(T.said_join, { kind: kind === 'and' ? 'Or' : 'And' }));
    });
    return b;
  }
  function paint() {
    const inputs = (slots, zone) => slots.replaceChildren(...state[zone].map(p => {
      const b = el('button', 'rz-in');
      b.type = 'button';
      b.dataset.uid = p.uid; b.dataset.key = 'p:' + p.uid; b.dataset.item = p.id;
      b.setAttribute('aria-label', fillIn(T.in_item, { name: nameOf(p.id), zone: ZONE[zone] }));
      b.append(icon(p.id), el('b', 'rz-n', '1'));
      lift(b, { id: p.id, uid: p.uid });
      return b;
    }));
    inputs(sReq, 'require'); inputs(sOpt, 'optional');
    const kids = [];
    state.groups.forEach((g, gi) => {
      if (gi) kids.push(pill(state.joins[gi - 1], null, gi - 1));
      const ge = el('div', 'rz-group');
      ge.dataset.group = gi;
      ge.toggleAttribute('data-multi', g.items.length > 1);
      ge.toggleAttribute('data-choose', g.choose);
      if (g.choose) {
        const h = el('button', 'rz-choose', `Choose 1 Out Of ${g.items.length}`);
        h.type = 'button';
        h.dataset.key = 'choose:' + gi;
        h.setAttribute('aria-label', T.choose_off);
        ge.append(h);
      }
      g.items.forEach((p, i) => {
        if (i) ge.append(pill(g.joins[i - 1], gi, i - 1, g.choose));
        const t = el('button', 'rz-tile');
        t.type = 'button';
        t.dataset.uid = p.uid; t.dataset.key = 'p:' + p.uid; t.dataset.item = p.id;
        t.setAttribute('aria-label', fillIn(T.out_item, { name: nameOf(p.id) }) + (g.choose ? '' : ` ${p.pct}%`));
        const c = el('span', 'rz-tile__ico');
        c.append(icon(p.id), el('b', 'rz-n', '1'));
        t.append(c);
        if (!g.choose) t.append(el('span', 'rz-pct', p.pct + '%'));
        t.append(el('span', 'rz-name', items[p.id].out));
        lift(t, { id: p.id, uid: p.uid });
        ge.append(t);
      });
      kids.push(ge);
    });
    chain.replaceChildren(...kids);
    stage.style.setProperty('--out-w', cfg.output_w[Math.min(state.groups.length, cfg.output_w.length - 1)]);
    if (held && held.uid && !R.find(state, held.uid)) held = null;
    lib.querySelectorAll('.rz-lib').forEach(b => b.classList.toggle('is-held', !!held && held.lib === b.dataset.item));
    if (held && held.uid) canvas.querySelector(`[data-uid="${held.uid}"]`)?.classList.add('is-held');
    stage.classList.toggle('is-placing', !!(held && held.lib));
    readout.textContent = sentence();
    controls();
  }
  const draw = () => keepFocus(paint);

  function sentence() {
    if (!R.count(state)) return T.read_empty;
    const names = list => list.map(p => items[p.id].out).join(T.read_sep);
    let s = T.read + (state.require.length ? fillIn(T.read_in, { list: names(state.require) }) : T.read_no_in);
    if (state.optional.length) s += fillIn(T.read_opt, { list: names(state.optional) });
    if (!state.groups.length) return s + T.read_no_out;
    const word = k => (k === 'and' ? T.read_and : T.read_or);
    const parts = state.groups.map(g => {
      if (g.choose) return fillIn(T.read_choose, { list: names(g.items) });
      const inner = g.items.map((p, i) => (i ? word(g.joins[i - 1]) : '') + items[p.id].out + ' ' + p.pct + '%').join('');
      return g.items.length > 1 && state.groups.length > 1 ? fillIn(T.read_wrap, { list: inner }) : inner;
    });
    return s + fillIn(T.read_out, { list: parts.map((p, i) => (i ? word(state.joins[i - 1]) : '') + p).join('') });
  }

  function hold(what) { held = what; draw(); }
  function put(id, to) {
    const why = R.add(state, id, to, LIM, items[id].pct);
    if (why) { say(whyNot(why, id, to)); return false; }
    held = null;
    draw();
    say(fillIn(T.said_put, { name: nameOf(id), zone: ZONE[to.zone] }));
    return true;
  }
  const END = 99;   // "at the end" of whatever list it goes to

  // the row of real-size buttons under the canvas: the same actions without dragging
  function controls() {
    const kids = [];
    const what = text => kids.push(el('span', 'studio__what', text));
    if (held && held.lib) {
      const id = held.lib;
      what(fillIn(T.bar_lib, { name: nameOf(id) }));
      const option = (text, to, key) => { const why = R.check(state, id, to, LIM); return button(text, () => put(id, to), { key, off: why ? whyNot(why, id, to) : '' }); };
      kids.push(option(`Require ${state.require.length}/${LIM.require}`, { zone: 'require', index: END }, 'to:require'),
                option(`Optional ${state.optional.length}/${LIM.optional}`, { zone: 'optional', index: END }, 'to:optional'),
                option(T.bar_new, { zone: 'output', group: null, index: END }, 'to:new'));
      state.groups.forEach((g, gi) => kids.push(option(fillIn(T.bar_join, { n: gi + 1 }), { zone: 'output', group: gi, index: END }, 'to:g' + gi)));
      kids.push(button(T.bar_cancel, () => hold(null), { key: 'cancel', cls: 'studio__btn--quiet' }));
    } else if (held && held.uid) {
      const loc = R.find(state, held.uid), id = loc.item.id, uid = held.uid;
      what(fillIn(T.bar_at, { name: nameOf(id), zone: ZONE[loc.zone] }));
      const step = d => { if (R.nudge(state, uid, d)) draw(); else say(T.no_edge); };
      if (loc.zone === 'output') {
        const g = state.groups[loc.group];
        if (!g.choose) {
          const pct = v => { R.setPct(state, uid, v); draw(); };
          const stepper = el('span', 'studio__stepper');
          stepper.append(el('span', 'studio__lbl', T.bar_pct), button('−', () => pct(loc.item.pct - 5), { key: 'less', label: T.bar_less }),
                         el('b', '', loc.item.pct + '%'), button('+', () => pct(loc.item.pct + 5), { key: 'more', label: T.bar_more }));
          kids.push(stepper);
        }
        kids.push(button('‹ ' + T.bar_earlier, () => step(-1), { key: 'earlier' }), button(T.bar_later + ' ›', () => step(1), { key: 'later' }));
        if (g.items.length > 1) kids.push(button(fillIn(T.bar_choose, { n: g.items.length }), () => choose(loc.group), { key: 'choose', pressed: g.choose }));
      } else {
        const other = loc.zone === 'require' ? 'optional' : 'require', to = { zone: other, index: END };
        const why = R.check(state, id, to, LIM, uid);
        kids.push(button('‹ ' + T.bar_earlier, () => step(-1), { key: 'earlier' }), button(T.bar_later + ' ›', () => step(1), { key: 'later' }),
                  button(fillIn(T.bar_to, { zone: ZONE[other] }), () => { R.move(state, uid, to, LIM, items[id].pct); draw(); say(fillIn(T.said_moved, { name: nameOf(id), zone: ZONE[other] })); }, { key: 'other', off: why ? whyNot(why, id, to) : '' }));
      }
      kids.push(button(T.bar_remove, () => take(uid), { key: 'remove', cls: 'studio__btn--quiet' }));
    } else kids.push(el('span', 'studio__hint', T.bar_idle));
    bar.replaceChildren(...kids);
  }
  function take(uid) {
    const loc = R.find(state, uid);
    if (!loc) return;
    R.remove(state, uid);
    held = null;
    draw();
    say(fillIn(T.said_removed, { name: nameOf(loc.item.id) }));
  }
  function choose(gi) {
    const g = state.groups[gi];
    if (!g || g.items.length < 2) { say(T.said_choose_need); return; }
    R.toggleChoose(state, gi);
    draw();
    say(g.choose ? fillIn(T.said_choose_on, { n: g.items.length }) : T.said_choose_off);
  }

  // clicks on the canvas: put down what is in hand, pick a piece up, or turn a group into choose-one
  canvas.addEventListener('click', e => {
    if (justDragged) return;
    const hit = sel => e.target.closest(sel);
    const header = hit('.rz-choose'), pieceEl = hit('[data-uid]'), groupEl = hit('.rz-group'), zoneEl = hit('[data-zone]');
    if (held && held.lib) {
      if (!zoneEl) { say(hit('.rz-panel--cond') ? T.said_cond : whyNot('nowhere', held.lib)); return; }
      put(held.lib, groupEl ? { zone: 'output', group: +groupEl.dataset.group, index: END } : zoneEl.dataset.zone === 'output' ? { zone: 'output', group: null, index: END } : { zone: zoneEl.dataset.zone, index: END });
      return;
    }
    if (header) { choose(+groupEl.dataset.group); return; }
    if (pieceEl) { hold(held && held.uid === pieceEl.dataset.uid ? null : { uid: pieceEl.dataset.uid }); return; }
    if (groupEl) { choose(+groupEl.dataset.group); return; }
    if (held) hold(null);
  });
  root.addEventListener('keydown', e => {
    if (e.key === 'Escape' && held) { e.preventDefault(); hold(null); }
    const uid = e.target.dataset && e.target.dataset.uid;
    if (uid && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); take(uid); }
  });

  /* dragging: from the library, or a piece that is already placed */
  const rect = n => n.getBoundingClientRect();
  const inside = (n, x, y, pad = 0) => { const r = rect(n); return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad; };
  // how many of the pieces in `box` come before the pointer, along the direction the box lays them out
  const before = (box, sel, x, y) => {
    const down = getComputedStyle(box).flexDirection.startsWith('column');
    return [...box.querySelectorAll(sel)].filter(n => { const r = rect(n); return down ? r.top + r.height / 2 < y : r.left + r.width / 2 < x; }).length;
  };
  function targetAt(x, y) {
    if (inside(bReq, x, y)) return { zone: 'require', index: before(sReq, '.rz-in', x, y) };
    if (inside(bOpt, x, y)) return { zone: 'optional', index: before(sOpt, '.rz-in', x, y) };
    if (inside(pOut, x, y)) {
      const groups = [...chain.querySelectorAll('.rz-group')];
      const gi = groups.findIndex(g => inside(g, x, y, 4));
      if (gi >= 0) return { zone: 'output', group: gi, index: before(groups[gi], '.rz-tile', x, y) };
      return { zone: 'output', group: null, index: before(chain, '.rz-group', x, y) };
    }
    if (inside(lib, x, y)) return { zone: 'library' };
    return null;
  }
  const zoneEl = to => (!to ? null : to.zone === 'library' ? lib : to.zone === 'require' ? bReq : to.zone === 'optional' ? bOpt : to.group == null ? pOut : chain.querySelector(`[data-group="${to.group}"]`));
  let marked = null;
  function mark(to, what) {
    if (marked) marked.classList.remove('is-over', 'is-no');
    marked = to && (to.zone !== 'library' || what.uid) ? zoneEl(to) : null;
    if (marked) marked.classList.add(to.zone !== 'library' && R.check(state, what.id, to, LIM, what.uid) ? 'is-no' : 'is-over');
  }
  function lift(node, what) {
    dragOn(node, () => {
      const ghost = el('div', 'rz-ghost');
      ghost.append(icon(what.id));
      stage.append(ghost);
      node.classList.add('is-lifted');
      stage.classList.add('is-dragging');
      stage.classList.toggle('is-returning', !!what.uid);
      let to = null;
      return {
        move(ev) {
          const r = rect(stage);
          ghost.style.left = ev.clientX - r.left + 'px';
          ghost.style.top = ev.clientY - r.top + 'px';
          to = targetAt(ev.clientX, ev.clientY);
          mark(to, what);
        },
        end(ev, cancelled) {
          mark(null, what);
          stage.classList.remove('is-dragging', 'is-returning');
          node.classList.remove('is-lifted');
          const why = cancelled ? 'nowhere' : drop(what, to);
          if (!why) { ghost.remove(); return; }
          say(whyNot(why, what.id, to));
          // not a legal place: the piece goes back to where it came from
          if (reduce || !node.isConnected) { ghost.remove(); return; }
          const r = rect(stage), n = rect(node);
          ghost.classList.add('is-back');
          ghost.style.left = n.left + n.width / 2 - r.left + 'px';
          ghost.style.top = n.top + n.height / 2 - r.top + 'px';
          setTimeout(() => ghost.remove(), 260);
        },
      };
    });
  }
  function drop(what, to) {
    if (!to) return 'nowhere';
    if (to.zone === 'library') { if (what.uid) take(what.uid); return ''; }   // back to the library: taken out
    const why = what.uid ? R.move(state, what.uid, to, LIM, items[what.id].pct) : R.add(state, what.id, to, LIM, items[what.id].pct);
    if (why) return why;
    held = null;
    draw();
    say(fillIn(what.uid ? T.said_moved : T.said_put, { name: nameOf(what.id), zone: ZONE[to.zone] }));
    return '';
  }

  const set = (next, text) => { state = next; held = null; draw(); say(text); };
  root.querySelector('[data-action="reset"]').addEventListener('click', () => set(R.load(cfg.start), T.said_reset));
  tool('⌫ ' + T.clear, () => set(R.blank(), T.said_clear));
  tool('▦ ' + T.sample, () => set(R.load(cfg.sample), T.said_sample));
  watch((w, compact) => {
    root.toggleAttribute('data-compact', compact);
    stage.style.setProperty('--u', w / (compact ? 600 : cfg.frame[0]) + 'px');
  });
  paint();
}

/* 6d. Items and their relationship web */
function itemsLab(root) {
  const { stage, bar, say, button, keepFocus, watch, cfg } = studioShell(root);
  const T = cfg.t, [W, H] = cfg.frame, G = cfg.grid, WEB = cfg.web;
  let open = 'crane';   // which detail view is showing; null when the panel is folded away
  let last = 'crane';
  let view = 'detail';  // narrow screens only: which part of the page is in view
  let compact = false;
  let P = {};           // where the visitor has put each web node
  const home = () => { P = {}; Object.entries(cfg.webs).forEach(([k, web]) => { P[k] = Object.fromEntries(web.nodes.map(([id, x, y]) => [id, [x, y]])); }); };
  home();

  const place = (n, [x, y, w, h]) => Object.assign(n.style, { left: x / W * 100 + '%', top: y / H * 100 + '%', width: w / W * 100 + '%', height: h / H * 100 + '%' });
  // show the part of a frame that sits at `box`, in place
  const windowOn = (n, src, [x, y, w, h]) => Object.assign(n.style, { backgroundImage: `url("${src}")`, backgroundSize: `${W / w * 100}% ${H / h * 100}%`, backgroundPosition: `${x / (W - w) * 100}% ${y / (H - h) * 100}%` });
  stage.classList.add('iz');
  const sheet = el('div', 'iz__in');
  const bgs = Object.fromEntries(Object.entries(cfg.frames).map(([k, src]) => { const d = el('div', 'iz__bg'); d.style.backgroundImage = `url("${src}")`; sheet.append(d); return [k, d]; }));
  const patches = el('div', 'iz__layer');
  const grid = el('div', 'iz__layer');
  const buttons = Array.from({ length: G.count }, (unused, k) => {
    const detail = cfg.detail[k], b = el('button', 'iz-item');
    b.type = 'button';
    b.dataset.key = 'item:' + k;
    if (detail) b.dataset.detail = detail;
    b.setAttribute('aria-label', detail ? cfg.names[detail] : fillIn(T.item_none, { n: k + 1 }));
    b.addEventListener('click', () => {
      if (detail) { show(detail); return; }
      say(T.said_none);
      b.classList.remove('is-no'); void b.offsetWidth; b.classList.add('is-no');
    });
    grid.append(b);
    return b;
  });
  const handle = el('button', 'iz__handle');
  handle.type = 'button'; handle.dataset.key = 'handle';
  handle.addEventListener('click', () => fold(!!open));
  const cover = el('div', 'iz__cover');
  place(cover, WEB.cover);
  cover.style.background = WEB.bg;
  const title = el('i', 'iz__title');
  place(title, WEB.title);
  windowOn(title, cfg.frames[WEB.title_src], WEB.title);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'iz__lines');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('aria-hidden', 'true');
  const nodes = el('div', 'iz__layer');
  sheet.append(patches, grid, handle, cover, title, svg, nodes);
  stage.append(sheet);

  const shown = () => (compact ? open || last : open);
  const at = e => { const r = sheet.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };

  function lines(key) {
    const R0 = WEB.radius, out = [];
    cfg.webs[key].edges.forEach(([a, b, colour, bend]) => {
      const [ax, ay] = P[key][a], [bx, by] = P[key][b];
      const len = Math.hypot(bx - ax, by - ay);
      if (len < R0 * 2 + 60) return;   // the two are on top of each other: no room for a line
      const ux = (bx - ax) / len, uy = (by - ay) / len;
      const sx = ax + ux * (R0 + 14), sy = ay + uy * (R0 + 14), ex = bx - ux * (R0 + 16), ey = by - uy * (R0 + 16);
      const span = Math.hypot(ex - sx, ey - sy);
      const cx = (sx + ex) / 2 - uy * bend * span, cy = (sy + ey) / 2 + ux * bend * span;
      const tl = Math.hypot(ex - cx, ey - cy) || 1, tx = (ex - cx) / tl, ty = (ey - cy) / tl;   // direction the line arrives in
      const stroke = WEB[colour];
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', `M${sx} ${sy} Q${cx} ${cy} ${ex - tx * 8} ${ey - ty * 8}`);
      path.setAttribute('stroke', stroke);
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', sx); dot.setAttribute('cy', sy); dot.setAttribute('r', 6); dot.setAttribute('stroke', stroke);
      const head = document.createElementNS(NS, 'polygon');
      head.setAttribute('points', [[ex + tx * 6, ey + ty * 6], [ex - tx * 14 - ty * 10, ey - ty * 14 + tx * 10], [ex - tx * 14 + ty * 10, ey - ty * 14 - tx * 10]].map(p => p.map(v => v.toFixed(1)).join(',')).join(' '));
      head.setAttribute('fill', stroke);
      out.push(path, dot, head);
    });
    svg.replaceChildren(...out);
  }
  function web(key) {
    const [x0, y0, x1, y1] = WEB.bounds;
    nodes.replaceChildren(...cfg.webs[key].nodes.map(([id, , , detail]) => {
      const b = el('button', 'iz-node');
      b.type = 'button';
      b.dataset.node = id; b.dataset.key = 'node:' + id;
      b.setAttribute('aria-label', fillIn(T.node, { name: cfg.node_names[id] }));
      b.style.width = WEB.node / W * 100 + '%';
      b.style.backgroundImage = `url("${cfg.nodes_src}")`;
      b.style.backgroundSize = `${cfg.sprites.length * 100}% 100%`;
      b.style.backgroundPosition = `${cfg.sprites.indexOf(id) / (cfg.sprites.length - 1) * 100}% 0`;
      const put = () => { b.style.left = P[key][id][0] / W * 100 + '%'; b.style.top = P[key][id][1] / H * 100 + '%'; };
      put();
      b.addEventListener('click', () => {
        if (justDragged) return;
        if (!detail) say(T.said_none);
        else if (detail === key) say(T.said_self);
        else show(detail);
      });
      dragOn(b, (e, cx, cy) => {
        const [px, py] = at({ clientX: cx, clientY: cy }), [sx, sy] = P[key][id];
        b.classList.add('is-held');
        return {
          move(ev) {
            const [x, y] = at(ev);
            P[key][id] = [Math.min(Math.max(sx + x - px, x0), x1), Math.min(Math.max(sy + y - py, y0), y1)];   // the boundary of the web
            put(); lines(key);
          },
          end() { b.classList.remove('is-held'); say(fillIn(T.said_moved, { name: cfg.node_names[id] })); controls(); },
        };
      });
      return b;
    }));
    lines(key);
  }
  function paint() {
    const key = shown(), state = key || 'closed';
    Object.entries(bgs).forEach(([k, d]) => { d.hidden = k !== state; });
    patches.replaceChildren(...(cfg.patches[state] || []).map(p => {
      const d = el('i', 'iz__patch');
      place(d, p.box);
      if (p.from) windowOn(d, cfg.frames[p.from], p.box); else d.style.background = p.fill;
      return d;
    }));
    const L = G[key ? 'open' : 'closed'];
    buttons.forEach((b, k) => {
      const c = (k + 1) % L.cols, r = Math.floor((k + 1) / L.cols);
      place(b, [G.x0 + c * G.dx - G.size / 2, L.rows[r] - G.size / 2, G.size, G.size]);
      b.toggleAttribute('data-current', !!key && b.dataset.detail === key);
    });
    place(handle, cfg.handle[key ? 'open' : 'closed']);
    handle.setAttribute('aria-label', key ? T.handle_open : T.handle_closed);
    [cover, title, svg, nodes].forEach(n => { n.hidden = !key; });
    if (key) web(key); else { nodes.replaceChildren(); svg.replaceChildren(); }
    frame();
    controls();
  }
  const draw = () => keepFocus(paint);
  function frame() {   // narrow screens look at one part of the page at a time
    if (!compact) { sheet.style.width = sheet.style.transform = stage.style.aspectRatio = ''; return; }
    const [x, y, w, h] = cfg.views[view];
    sheet.style.width = W / w * 100 + '%';
    sheet.style.transform = `translate(${-x / W * 100}%, ${-y / H * 100}%)`;
    stage.style.aspectRatio = `${w} / ${h}`;
  }
  function show(key) { open = last = key; view = 'detail'; draw(); say(fillIn(T.said_open, { name: cfg.short[key] })); }
  function fold(yes) { open = yes ? null : last; draw(); say(yes ? T.said_fold : fillIn(T.said_open, { name: cfg.short[last] })); }
  const moved = () => Object.entries(cfg.webs).some(([k, w]) => w.nodes.some(([id, x, y]) => P[k][id][0] !== x || P[k][id][1] !== y));
  function controls() {
    const key = shown();
    const kids = [el('span', 'studio__hint', T.bar_idle)];
    Object.keys(cfg.short).forEach(k => kids.push(button(cfg.short[k], () => show(k), { key: 'show:' + k, pressed: key === k })));
    if (compact) kids.push(button(T.bar_grid, () => { view = 'grid'; draw(); }, { key: 'view:grid', pressed: view === 'grid' }), button(T.bar_detail, () => { view = 'detail'; draw(); }, { key: 'view:detail', pressed: view === 'detail' }));
    else kids.push(button(open ? T.bar_fold : T.bar_unfold, () => fold(!!open), { key: 'fold' }));
    if (moved()) kids.push(button(T.bar_tidy, () => { home(); draw(); say(T.said_tidy); }, { key: 'tidy', cls: 'studio__btn--quiet' }));
    bar.replaceChildren(...kids);
  }
  root.querySelector('[data-action="reset"]').addEventListener('click', () => { home(); open = last = 'crane'; view = 'detail'; draw(); say(T.said_reset); });
  watch((w, narrow) => {
    const changed = narrow !== compact;
    compact = narrow;
    root.toggleAttribute('data-compact', compact);
    if (changed) paint();
  });
  paint();
}

/* 6e. Comments pinned to the image */
function commentLab(root) {
  const { stage, bar, say, button, keepFocus, watch, cfg } = studioShell(root);
  const T = cfg.t, [W, H] = cfg.frame, MAX = cfg.limits.marks;
  const px = v => v / W * 100, py = v => v / H * 100;
  const REG = { x: px(cfg.region[0]), y: py(cfg.region[1]), w: px(cfg.region[2]), h: py(cfg.region[3]) };
  let marks = [];     // { id, x, y, box, text, open } in % of the page
  let draft = null;   // a marked place that has no comment yet
  let seq = 0, compact = false;

  const place = (n, b) => Object.assign(n.style, { left: b.x + '%', top: b.y + '%', width: b.w + '%', height: b.h + '%' });
  const crop = ([x, y, w, h]) => ({ backgroundImage: `url("${cfg.parts}")`, backgroundSize: `${W / w * 100}% ${H / h * 100}%`, backgroundPosition: `${x / (W - w) * 100}% ${y / (H - h) * 100}%` });
  stage.classList.add('cz');
  const sheet = el('div', 'cz__in');
  sheet.style.backgroundImage = `url("${cfg.base}")`;
  const area = el('div', 'cz__area');
  area.setAttribute('role', 'group');
  area.setAttribute('aria-label', T.area);
  place(area, REG);
  const layer = el('div', 'cz__layer');
  sheet.append(area, layer);
  stage.append(sheet);

  const at = e => { const r = sheet.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }; };
  const onImage = p => ({ x: Math.min(Math.max(p.x, REG.x), REG.x + REG.w), y: Math.min(Math.max(p.y, REG.y), REG.y + REG.h) });   // the boundary: the image
  const full = () => { if (marks.length < MAX) return false; say(fillIn(T.said_max, { max: MAX })); return true; };

  dragOn(area, (e, cx, cy) => {
    if (e.pointerType === 'touch' || full()) return null;   // a finger scrolls the page; a tap leaves a point instead
    const from = onImage(at({ clientX: cx, clientY: cy }));
    draft = null;
    paint();
    const sel = el('div', 'cz-sel');
    layer.append(sel);
    const boxTo = ev => { const p = onImage(at(ev)); return { x: Math.min(p.x, from.x), y: Math.min(p.y, from.y), w: Math.abs(p.x - from.x), h: Math.abs(p.y - from.y) }; };
    return { move(ev) { place(sel, boxTo(ev)); }, end(ev, cancelled) { sel.remove(); if (!cancelled) compose(boxTo(ev)); } };
  });
  area.addEventListener('click', e => { if (justDragged || full()) return; const p = onImage(at(e)); compose({ x: p.x, y: p.y, w: 0, h: 0 }); });

  function compose(box) {
    const point = box.w < 0.4 && box.h < 0.4;
    const pin = onImage({ x: box.x + box.w + (point ? 0 : px(cfg.gap[0])), y: box.y + box.h + (point ? 0 : py(cfg.gap[1])) });
    draft = { box: point ? null : box, x: pin.x, y: pin.y };
    marks.forEach(m => { m.open = false; });
    paint();
    say(T.said_draft);
    (compact ? bar : layer).querySelector('textarea')?.focus({ preventScroll: !compact });
  }
  function send(text) {
    text = text.trim();
    if (!text) { say(T.said_empty); return false; }
    const m = { id: ++seq, x: draft.x, y: draft.y, box: draft.box, text, open: true };
    marks.push(m);
    draft = null;
    paint();
    say(T.said_sent);
    layer.querySelector(`[data-key="pin:${m.id}"]`)?.focus({ preventScroll: true });
    return true;
  }
  function cancel() { draft = null; paint(); say(T.said_cancel); }

  function dialog() {
    const [dx, dy, dw, dh] = cfg.dialog;
    const d = { w: px(dw), h: py(dh) };
    d.x = Math.max(0.5, Math.min(draft.x + px(7), 99.5 - d.w));
    d.y = Math.max(0.5, Math.min(draft.y - py(5), 99.5 - d.h));
    const form = el('form', 'cz-reply');
    place(form, d);
    Object.assign(form.style, crop(cfg.dialog));   // the reply box is the recording's own, cut out of the frame
    const part = (tag, [x, y, w, h]) => {
      const n = document.createElement(tag);
      Object.assign(n.style, { left: (x - dx) / dw * 100 + '%', top: (y - dy) / dh * 100 + '%', width: w / dw * 100 + '%', height: h / dh * 100 + '%' });
      form.append(n);
      return n;
    };
    const field = part('textarea', cfg.field);
    field.placeholder = cfg.placeholder; field.maxLength = cfg.limits.chars; field.setAttribute('aria-label', T.field);
    const no = part('button', cfg.cancel);
    no.type = 'button'; no.setAttribute('aria-label', T.cancel);
    no.addEventListener('click', cancel);
    const yes = part('button', cfg.send);
    yes.type = 'submit'; yes.setAttribute('aria-label', T.send);
    field.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } if (e.key === 'Escape') cancel(); });
    form.addEventListener('submit', e => { e.preventDefault(); if (!send(field.value)) field.focus(); });
    return form;
  }
  function bubble(m) {
    const b = el('div', 'cz-bubble');
    const face = el('i');
    Object.assign(face.style, crop(cfg.avatar));
    b.append(face, el('b', '', cfg.who), el('span', '', m.text));
    // to the right of the dot, as in the recording; on the left when there is no room on the image
    if (m.x + px(16) + 26 <= REG.x + REG.w) b.style.left = m.x + px(16) + '%'; else b.style.right = 100 - m.x + px(16) + '%';
    b.style.top = Math.max(m.y - py(61), REG.y + 0.5) + '%';
    return b;
  }
  function paint() {
    const kids = [];
    const sel = box => { const s = el('div', 'cz-sel'); place(s, box); kids.push(s); };
    marks.forEach((m, n) => {
      if (m.open && m.box) sel(m.box);
      const pin = el('button', 'cz-pin');
      pin.type = 'button';
      pin.dataset.key = 'pin:' + m.id;
      pin.style.left = m.x + '%'; pin.style.top = m.y + '%';
      pin.setAttribute('aria-label', fillIn(T.pin, { n: n + 1, text: m.text }));
      pin.setAttribute('aria-expanded', String(m.open));
      pin.addEventListener('click', () => { if (justDragged) return; const was = m.open; marks.forEach(o => { o.open = false; }); m.open = !was; draw(); });
      dragOn(pin, (e, cx, cy) => {
        const p0 = at({ clientX: cx, clientY: cy }), m0 = { x: m.x, y: m.y, box: m.box && { ...m.box } };
        // the dot and the area it belongs to move together, and both stay on the image
        const lo = { x: REG.x - Math.min(m0.x, m0.box ? m0.box.x : m0.x), y: REG.y - Math.min(m0.y, m0.box ? m0.box.y : m0.y) };
        const hi = { x: REG.x + REG.w - Math.max(m0.x, m0.box ? m0.box.x + m0.box.w : m0.x), y: REG.y + REG.h - Math.max(m0.y, m0.box ? m0.box.y + m0.box.h : m0.y) };
        return {
          move(ev) {
            const p = at(ev), dx = Math.min(Math.max(p.x - p0.x, lo.x), hi.x), dy = Math.min(Math.max(p.y - p0.y, lo.y), hi.y);
            m.x = m0.x + dx; m.y = m0.y + dy;
            if (m.box) { m.box.x = m0.box.x + dx; m.box.y = m0.box.y + dy; }
            paint();
          },
          end() { say(T.said_moved); },
        };
      });
      kids.push(pin);
      if (m.open) kids.push(bubble(m));
    });
    if (draft) {
      if (draft.box) sel(draft.box);
      const pin = el('span', 'cz-pin cz-pin--draft');
      pin.style.left = draft.x + '%'; pin.style.top = draft.y + '%';
      kids.push(pin);
      if (!compact) kids.push(dialog());
    }
    layer.replaceChildren(...kids);
    controls();
  }
  const draw = () => keepFocus(paint);
  function controls() {
    const kids = [];
    if (draft && compact) {   // too small to type inside the picture: the reply is written here
      const form = el('form', 'studio__form');
      const field = el('textarea');
      field.rows = 2; field.maxLength = cfg.limits.chars; field.placeholder = cfg.placeholder; field.setAttribute('aria-label', T.field);
      const yes = el('button', 'studio__btn', T.bar_send);
      yes.type = 'submit';
      form.append(el('span', 'studio__what', T.bar_write), field, yes, button(T.bar_cancel, cancel, { cls: 'studio__btn--quiet' }));
      form.addEventListener('submit', e => { e.preventDefault(); if (!send(field.value)) field.focus(); });
      kids.push(form);
    } else {
      kids.push(el('span', marks.length ? 'studio__what' : 'studio__hint', marks.length ? fillIn(T.bar_count, { n: marks.length, max: MAX }) : T.bar_idle));
      marks.forEach(m => {
        const chip = el('span', 'studio__chip');
        const show = button(m.text, () => { marks.forEach(o => { o.open = o === m; }); draw(); }, { key: 'chip:' + m.id, pressed: m.open });
        const del = button('✕', () => { marks = marks.filter(o => o !== m); draw(); say(T.said_deleted); }, { key: 'del:' + m.id, label: T.bar_delete, cls: 'studio__btn--quiet' });
        chip.append(show, del);
        kids.push(chip);
      });
      kids.push(button('＋ ' + T.bar_add, () => { if (!full()) compose({ x: REG.x + REG.w / 2, y: REG.y + REG.h / 2, w: 0, h: 0 }); }, { key: 'add' }));
      if (marks.length) kids.push(button(T.bar_clear, () => { marks = []; draft = null; draw(); say(T.said_cleared); }, { key: 'clear', cls: 'studio__btn--quiet' }));
    }
    bar.replaceChildren(...kids);
  }
  root.querySelector('[data-action="reset"]').addEventListener('click', () => { marks = []; draft = null; draw(); say(T.said_cleared); });
  watch((w, narrow) => {
    const changed = narrow !== compact;
    compact = narrow;
    root.toggleAttribute('data-compact', compact);
    const [x, y, vw, vh] = cfg.view;
    sheet.style.width = compact ? W / vw * 100 + '%' : '';
    sheet.style.transform = compact ? `translate(${-x / W * 100}%, ${-y / H * 100}%)` : '';
    stage.style.aspectRatio = compact ? `${vw} / ${vh}` : '';
    stage.style.setProperty('--u', sheet.getBoundingClientRect().width / W + 'px');
    if (changed) paint();
  });
  paint();
}

/* ---------- 7. The three rebuilt demos: one visible at a time ---------- */
function liveset(root) {
  const tabs = [...root.querySelectorAll('[data-live-tab]')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => t.setAttribute('aria-pressed', String(t === tab)));
    root.querySelectorAll('[data-live-panel]').forEach(p => { p.hidden = p.dataset.livePanel !== tab.dataset.liveTab; });
  }));
}

if (inBrowser) {
  const labs = { recipe: recipeLab, items: itemsLab, comments: commentLab };
  document.querySelectorAll('[data-proto]').forEach(flowPlayer);
  document.querySelectorAll('[data-studio]').forEach(root => labs[root.dataset.studio]?.(root));
  document.querySelectorAll('[data-liveset]').forEach(liveset);
  document.querySelectorAll('[data-tour]').forEach(tour);
  document.querySelectorAll('[data-smt]').forEach(smt);
  document.querySelectorAll('[data-live]').forEach(live);
  document.querySelectorAll('[data-clips]').forEach(clips);
}
if (typeof module !== 'undefined' && module.exports) module.exports = { recipeRules };
