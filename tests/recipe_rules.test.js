// The boundary of the rebuilt recipe editor (docs/design-system.md §5, rule 8):
// only the library's items, a ceiling on every area, nothing lands outside the legal areas.
// Runs the same rules the page runs (dist/prototype.js), with the limits the built page ships.
//
// Run: node tests/recipe_rules.test.js     (python3 -m unittest discover tests runs it too)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { recipeRules: R } = require(process.env.PROTOTYPE_JS || path.join(ROOT, 'dist', 'prototype.js'));   // the variable lets a deliberately broken copy be tried

const page = fs.readFileSync(path.join(ROOT, 'dist', 'work', 'playbook', 'index.html'), 'utf8');
const raw = /data-studio="recipe" data-config="([^"]+)"/.exec(page);
assert.ok(raw, 'the built PlayBook page has no recipe demo; run python3 build.py first');
const unescape = s => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const cfg = JSON.parse(unescape(raw[1]));
const LIM = cfg.limits, IDS = cfg.items.map(i => i.id);
const PCT = Object.fromEntries(cfg.items.map(i => [i.id, i.pct]));

const snap = s => JSON.stringify(s);
const ids = list => list.map(p => p.id);
const fresh = () => R.load(cfg.start);
let ran = 0;
const test = (name, fn) => { fn(); ran++; };

// What must hold after every single operation, whatever the visitor does.
function invariants(s, where) {
  const say = m => `${m} (${where})`;
  assert.ok(s.require.length <= LIM.require, say('Require over its limit'));
  assert.ok(s.optional.length <= LIM.optional, say('Optional over its limit'));
  assert.ok(s.groups.length <= LIM.groups, say('too many output groups'));
  assert.equal(s.joins.length, Math.max(0, s.groups.length - 1), say('joins between groups out of step'));
  s.joins.forEach(j => assert.ok(j === 'and' || j === 'or', say('a join that is neither And nor Or')));
  const uids = new Set();
  const seen = { input: new Set(), output: new Set() };
  const piece = (p, side) => {
    assert.ok(IDS.includes(p.id), say(`an item that is not in the library: ${p.id}`));
    assert.ok(!uids.has(p.uid), say('the same piece twice')); uids.add(p.uid);
    assert.ok(!seen[side].has(p.id), say(`${p.id} twice on the ${side} side`)); seen[side].add(p.id);
    if (side === 'input') assert.equal(p.pct, undefined, say('an input with a probability'));
    else assert.ok(Number.isInteger(p.pct) && p.pct >= 0 && p.pct <= 100 && p.pct % 5 === 0, say(`probability out of range: ${p.pct}`));
  };
  s.require.forEach(p => piece(p, 'input'));
  s.optional.forEach(p => piece(p, 'input'));
  s.groups.forEach(g => {
    assert.ok(g.items.length >= 1 && g.items.length <= LIM.group, say('a group that is empty or over its limit'));
    assert.equal(g.joins.length, g.items.length - 1, say('joins inside a group out of step'));
    if (g.choose) {
      assert.ok(g.items.length >= 2, say('choose-one with fewer than two items'));
      assert.ok(g.joins.every(j => j === 'or'), say('choose-one group with an And inside'));
    }
    g.items.forEach(p => piece(p, 'output'));
  });
}

test('the two built-in recipes are legal', () => {
  invariants(R.load(cfg.start), 'start');
  invariants(R.load(cfg.sample), 'sample');
  invariants(R.blank(), 'blank');
  assert.equal(R.count(R.blank()), 0);
});

test('an area refuses what is over its limit, and nothing changes', () => {
  for (const zone of ['require', 'optional']) {
    const s = R.blank();
    const spare = [...IDS];
    for (let n = 0; n < LIM[zone]; n++) assert.equal(R.add(s, spare.shift(), { zone, index: 99 }, LIM, 100), '');
    const before = snap(s);
    assert.equal(R.add(s, spare.shift(), { zone, index: 0 }, LIM, 100), 'full');
    assert.equal(snap(s), before);
  }
  const s = R.blank();
  const spare = [...IDS];
  for (let n = 0; n < LIM.groups; n++) assert.equal(R.add(s, spare.shift(), { zone: 'output', group: null, index: 99 }, LIM, 100), '');
  let before = snap(s);
  assert.equal(R.add(s, spare[0], { zone: 'output', group: null, index: 0 }, LIM, 100), 'groups');
  assert.equal(snap(s), before);
  for (let n = 1; n < LIM.group; n++) assert.equal(R.add(s, spare.shift(), { zone: 'output', group: 0, index: 99 }, LIM, 100), '');
  before = snap(s);
  assert.equal(R.add(s, spare[0], { zone: 'output', group: 0, index: 0 }, LIM, 100), 'groupfull');
  assert.equal(snap(s), before);
  invariants(s, 'filled');
});

test('nothing lands outside Require, Optional and Output', () => {
  const s = fresh(), before = snap(s);
  const spare = IDS.find(id => !ids([...s.require, ...s.optional]).includes(id) && !s.groups.some(g => ids(g.items).includes(id)));
  for (const to of [null, undefined, {}, { zone: 'condition', index: 0 }, { zone: 'library' }, { zone: 'toolbar' }, { zone: 'output', group: 7, index: 0 }, { zone: 'output', group: -1, index: 0 }]) {
    assert.equal(R.add(s, spare, to, LIM, 100), 'nowhere');
    assert.equal(R.move(s, s.require[0].uid, to, LIM, 100), 'nowhere');
    assert.equal(snap(s), before);
  }
  assert.equal(R.move(s, 'no-such-piece', { zone: 'require', index: 0 }, LIM, 100), 'nowhere');
  assert.equal(snap(s), before);
});

test('the same item is not placed twice on one side, but may be an input and an output', () => {
  const s = fresh(), before = snap(s);
  const input = s.require[0].id, output = s.groups[0].items[0].id;
  assert.equal(R.add(s, input, { zone: 'optional', index: 0 }, LIM, 100), 'dup');
  assert.equal(R.add(s, output, { zone: 'output', group: null, index: 0 }, LIM, 100), 'dup');
  assert.equal(snap(s), before);
  assert.equal(R.add(s, output, { zone: 'optional', index: 0 }, LIM, 100), '');
  assert.equal(R.add(s, input, { zone: 'output', group: null, index: 99 }, LIM, 100), '');
  invariants(s, 'both sides');
});

test('a placed piece can be moved, reordered and taken out', () => {
  const s = R.load({ require: ['key', 'crates'], optional: [], groups: [{ items: [['gamepad', 100]] }, { items: [['pink', 10], ['blue', 10]] }], joins: ['or'] });
  const key = s.require[0].uid, gamepad = s.groups[0].items[0].uid, blue = s.groups[1].items[1].uid;
  assert.equal(R.move(s, key, { zone: 'require', index: 2 }, LIM, 100), '');            // past Crates
  assert.deepEqual(ids(s.require), ['crates', 'key']);
  assert.equal(R.move(s, key, { zone: 'require', index: 1 }, LIM, 100), '');            // dropped on its own place
  assert.deepEqual(ids(s.require), ['crates', 'key']);
  assert.equal(R.move(s, key, { zone: 'optional', index: 0 }, LIM, 100), '');
  assert.deepEqual([ids(s.require), ids(s.optional)], [['crates'], ['key']]);
  assert.equal(R.move(s, key, { zone: 'output', group: 0, index: 0 }, LIM, 55), '');   // an input becomes an output: it gets a probability
  assert.deepEqual(s.groups[0].items.map(p => [p.id, p.pct]), [['key', 55], ['gamepad', 100]]);
  assert.equal(R.move(s, key, { zone: 'require', index: 0 }, LIM, 100), '');            // and loses it on the way back
  assert.equal(R.find(s, key).item.pct, undefined);
  assert.equal(R.move(s, gamepad, { zone: 'output', group: null, index: 2 }, LIM, 100), '');   // a single-item group to the end of the chain
  assert.deepEqual(s.groups.map(g => ids(g.items)), [['pink', 'blue'], ['gamepad']]);
  assert.equal(R.move(s, gamepad, { zone: 'output', group: 1, index: 0 }, LIM, 100), '');      // dropped on itself
  assert.deepEqual(s.groups.map(g => ids(g.items)), [['pink', 'blue'], ['gamepad']]);
  assert.equal(R.move(s, blue, { zone: 'output', group: 1, index: 1 }, LIM, 100), '');
  assert.deepEqual(s.groups.map(g => ids(g.items)), [['pink'], ['gamepad', 'blue']]);
  assert.equal(R.remove(s, blue), true);
  assert.equal(R.remove(s, blue), false);
  assert.deepEqual(s.groups.map(g => ids(g.items)), [['pink'], ['gamepad']]);
  invariants(s, 'after moves');
  // moving a group's only piece does not count against the limit on groups: it is a reorder
  const full = R.blank();
  IDS.slice(0, LIM.groups).forEach(id => R.add(full, id, { zone: 'output', group: null, index: 99 }, LIM, 100));
  assert.equal(R.move(full, full.groups[0].items[0].uid, { zone: 'output', group: null, index: 99 }, LIM, 100), '');
  assert.deepEqual(full.groups.map(g => g.items[0].id), [...IDS.slice(1, LIM.groups), IDS[0]]);
  // but splitting a piece out of a shared group does
  R.add(full, IDS[LIM.groups], { zone: 'output', group: 0, index: 99 }, LIM, 100);
  assert.equal(R.move(full, full.groups[0].items[1].uid, { zone: 'output', group: null, index: 0 }, LIM, 100), 'groups');
  invariants(full, 'full chain');
});

test('And / Or, choose-one and probability stay inside their rules', () => {
  const s = R.load(cfg.sample);
  const gi = s.groups.findIndex(g => g.choose);
  assert.ok(gi >= 0, 'the sample recipe has a choose-one group');
  assert.equal(R.toggleJoin(s, gi, 0), false);                    // fixed to Or inside choose-one
  assert.equal(R.toggleJoin(s, null, 0), true);
  assert.equal(R.toggleJoin(s, null, 9), false);
  assert.equal(R.toggleJoin(s, 9, 0), false);
  assert.equal(R.toggleChoose(s, gi), true);
  assert.equal(s.groups[gi].choose, false);
  assert.equal(R.toggleJoin(s, gi, 0), true);
  assert.equal(R.toggleChoose(s, gi), true);                      // back on: the And inside becomes Or again
  assert.ok(s.groups[gi].joins.every(j => j === 'or'));
  const single = s.groups.findIndex(g => g.items.length === 1);
  assert.equal(R.toggleChoose(s, single), false);                 // one item is not a choice
  while (s.groups[gi].items.length > 1) R.remove(s, s.groups[gi].items[0].uid);
  assert.equal(s.groups[gi].choose, false);                       // choose-one ends when only one item is left
  const p = s.groups[gi].items[0];
  for (const [given, kept] of [[250, 100], [-30, 0], [43, 45], [42, 40], [0, 0], [100, 100]]) { assert.equal(R.setPct(s, p.uid, given), true); assert.equal(p.pct, kept); }
  assert.equal(R.setPct(s, p.uid, NaN), false);
  assert.equal(R.setPct(s, s.require[0].uid, 50), false);         // inputs have no probability
  assert.equal(R.nudge(s, s.require[0].uid, -1), false);          // already first
  assert.equal(R.nudge(s, s.require[0].uid, 1), true);
  invariants(s, 'after toggles');
});

test('ten thousand random operations never leave the boundary', () => {
  let seed = 20261116;
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n; };
  const zones = ['require', 'optional', 'output', 'output', 'output', 'condition', 'library'];
  const target = s => {
    const zone = zones[rnd(zones.length)];
    if (zone !== 'output') return rnd(12) ? { zone, index: rnd(6) } : null;
    return rnd(2) ? { zone, group: null, index: rnd(5) } : { zone, group: rnd(5), index: rnd(5) };
  };
  const pieces = s => [...s.require, ...s.optional, ...s.groups.flatMap(g => g.items)];
  let s = fresh(), placed = 0, refused = 0;
  for (let n = 0; n < 10000; n++) {
    const all = pieces(s), any = all.length ? all[rnd(all.length)].uid : 'none';
    const op = rnd(11);
    const before = snap(s);
    let why = '';
    if (op < 4) { const id = IDS[rnd(IDS.length)]; why = R.add(s, id, target(s), LIM, PCT[id]); }
    else if (op < 7) why = R.move(s, any, target(s), LIM, 100);
    else if (op === 7) R.remove(s, any);
    else if (op === 8) R.toggleJoin(s, rnd(3) ? null : rnd(4), rnd(3));
    else if (op === 9) R.toggleChoose(s, rnd(4));
    else if (rnd(2)) R.setPct(s, any, rnd(300) - 100); else R.nudge(s, any, rnd(2) ? 1 : -1);
    if (why) { refused++; assert.equal(snap(s), before, `a refused operation changed the recipe (${why}, step ${n})`); } else if (op < 7) placed++;
    invariants(s, `step ${n}, operation ${op}`);
    if (n % 2500 === 2499) s = R.load(cfg.sample);
  }
  assert.ok(placed > 500 && refused > 500, `the run should both place and refuse a lot (placed ${placed}, refused ${refused})`);
});

console.log(`recipe rules: ${ran} groups of checks passed (limits ${JSON.stringify(LIM)}, ${IDS.length} library items)`);
