// The campaign drafting assistant in PlayBook 11 (a 2026 design concept; 交接单 ⑤).
// Checks the drafts as the built page ships them, and the "check again" rules the page runs (dist/prototype.js).
//
// Run: node tests/draft_rules.test.js     (python3 -m unittest discover tests runs it too)
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const { draftRules: D, recipeRules: R } = require(process.env.PROTOTYPE_JS || path.join(ROOT, 'dist', 'prototype.js'));

const unescape = s => s.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const config = file => {
  const page = fs.readFileSync(path.join(ROOT, 'dist', ...file, 'index.html'), 'utf8');
  const raw = /data-drafter data-config="([^"]+)"/.exec(page);
  assert.ok(raw, `${file.join('/')} has no drafting assistant; run python3 build.py first`);
  return JSON.parse(unescape(raw[1]));
};
const zh = config(['work', 'playbook']), en = config(['en', 'work', 'playbook']);
const LIM = zh.limits;
const byId = (cfg, id) => cfg.drafts.find(d => d.id === id);

let ran = 0;
const test = (name, fn) => { try { fn(); ran++; } catch (e) { e.message = `${name}: ${e.message}`; throw e; } };
const codes = list => list.map(f => f.code + (f.item ? ':' + f.item : ''));

test('three drafts in both languages, the same structure', () => {
  assert.equal(zh.drafts.length, 3);
  assert.deepEqual(zh.drafts.map(d => d.id), en.drafts.map(d => d.id));
  zh.drafts.forEach((d, i) => {
    const e = en.drafts[i];
    assert.deepEqual(d.tasks.map(t => [t.id, t.platform, t.frequency.kind, t.reward]), e.tasks.map(t => [t.id, t.platform, t.frequency.kind, t.reward]));
    assert.deepEqual(d.recipes.map(r => [r.require, r.output.items]), e.recipes.map(r => [r.require, r.output.items]));
  });
});

test('every item a draft mentions is one of its items, and odds add up to 100', () => {
  zh.drafts.forEach(d => {
    const ids = new Set(d.items.map(i => i.id));
    assert.equal(ids.size, d.items.length, `${d.id}: an item twice`);
    d.tasks.forEach(t => assert.ok(ids.has(t.reward.item), `${d.id}: mission ${t.id} gives ${t.reward.item}`));
    d.recipes.forEach(r => {
      [...r.require, ...r.optional, ...r.output.items].forEach(m => assert.ok(ids.has(m.item), `${d.id}: recipe ${r.id} uses ${m.item}`));
      assert.equal(r.output.items.reduce((n, o) => n + o.pct, 0), 100, `${d.id}: recipe ${r.id} odds`);
      r.require.forEach(m => assert.ok(m.qty >= D.MIN && m.qty <= D.MAX, `${d.id}: recipe ${r.id} ${m.item} ${m.qty}`));
    });
    d.tasks.forEach(t => assert.ok(t.reward.qty >= D.MIN && t.reward.qty <= D.MAX));
    assert.ok(d.self_check.every(c => ['ok', 'note', 'problem'].includes(c.kind)));
  });
});

test('untouched: drafts one and three have no problem, draft two reports the key', () => {
  assert.deepEqual(D.check(byId(zh, 'halloween'), D.fresh(byId(zh, 'halloween')), LIM), []);
  assert.deepEqual(D.check(byId(zh, 'newsong'), D.fresh(byId(zh, 'newsong')), LIM), []);
  const move = byId(zh, 'move');
  const found = D.check(move, D.fresh(move), LIM);
  assert.deepEqual(codes(found), ['contention:key']);
  assert.deepEqual(found[0].recipes, [1, 2]);
  assert.equal(found[0].max, 1);
  // draft two's own self-check flags the same problem on the draft
  assert.ok(move.self_check.some(c => c.kind === 'problem' && c.text.includes('新家钥匙')));
});

test('draft one without mission 3: no mission gives the Jack-o’-lantern', () => {
  const d = byId(zh, 'halloween'), st = D.fresh(d);
  st.tasks[3].removed = true;
  assert.ok(D.changed(d, st));
  assert.deepEqual(codes(D.check(d, st, LIM)), ['no_source:jack']);
});

test('draft two without recipe 2: the key is no longer contested', () => {
  const d = byId(zh, 'move'), st = D.fresh(d);
  st.recipes[2].removed = true;
  assert.deepEqual(D.check(d, st, LIM), []);
  st.recipes[2].removed = false; st.recipes[1].removed = true;
  assert.deepEqual(D.check(d, st, LIM), []);
});

test('quantities: what missions can hand out over the campaign', () => {
  const d = byId(zh, 'halloween');
  assert.deepEqual(D.supply(d, D.tasksLeft(d, D.fresh(d))), { candy: 14, jack: 1, sticker: 1 });   // 2 daily × 7 days; Fridays only count once
  const move = byId(zh, 'move');
  assert.deepEqual(D.supply(move, D.tasksLeft(move, D.fresh(move))), { key: 1, stub: 1, box: 16, sticker: 1 });
  const st = D.fresh(move);
  assert.ok(D.setQty(move, st, 'recipe', 1, 'key', 2));
  assert.deepEqual(codes(D.check(move, st, LIM)), ['short:key']);           // short, so no separate contention line
  assert.equal(D.setQty(move, st, 'recipe', 1, 'key', 10), false);
  assert.equal(D.setQty(move, st, 'recipe', 1, 'key', 0), false);
  assert.equal(D.setQty(move, st, 'recipe', 1, 'candy', 2), false);        // not one of this recipe's materials
  const h = D.fresh(d);
  D.setQty(d, h, 'recipe', 1, 'candy', 9); D.setQty(d, h, 'recipe', 2, 'candy', 9);
  assert.deepEqual(codes(D.check(d, h, LIM)), ['contention:candy']);      // 9 + 9 > 14, each alone fits
  D.setQty(d, h, 'task', 1, 'candy', 1); h.tasks[2].removed = true;        // only 7 candy left
  assert.deepEqual(codes(D.check(d, h, LIM)), ['short:candy', 'short:candy']);
});

test('a material another remaining recipe makes is not "missing"', () => {
  const d = byId(zh, 'newsong'), st = D.fresh(d);
  st.tasks[1].removed = true; st.tasks[2].removed = true;                    // no notes any more
  assert.deepEqual(codes(D.check(d, st, LIM)), ['no_source:note']);          // the record still comes from recipe 1
  st.recipes[1].removed = true;
  assert.deepEqual(codes(D.check(d, st, LIM)), ['no_source:record']);
});

test('back to the home platforms: at least half of what is left, and something must be left', () => {
  const d = byId(zh, 'move'), st = D.fresh(d);
  d.tasks.forEach(t => { st.tasks[t.id].removed = true; });
  assert.ok(codes(D.check(d, st, LIM)).includes('no_tasks'));
  const fake = { ...d, home_platforms: ['Twitch'] };                          // only mission 2 is on Twitch
  assert.ok(D.check(fake, D.fresh(fake), LIM).some(f => f.code === 'platform' && f.n === 5 && f.k === 1));
});

test('valid structure: every recipe goes on the recipe editor canvas under its own limits', () => {
  zh.drafts.forEach(d => d.recipes.forEach(r => {
    const { state, why } = D.canvas(r, LIM);
    assert.equal(why, null, `${d.id}: recipe ${r.id}`);
    assert.deepEqual(state.require.map(p => p.id), r.require.map(m => m.item));
    assert.deepEqual(state.optional.map(p => p.id), r.optional.map(m => m.item));
    const out = state.groups.flatMap(g => g.items.map(p => [p.id, p.pct]));
    assert.deepEqual(out, r.output.items.map(o => [o.item, o.pct]));
    assert.equal(state.groups.some(g => g.choose), r.output.choose_one);
  }));
  const big = { id: 9, require: ['a', 'b', 'c', 'd'].map(item => ({ item, qty: 1 })), optional: [], output: { choose_one: false, items: [{ item: 'x', pct: 100 }] } };
  assert.deepEqual(D.canvas(big, LIM).why, { code: 'full', zone: 'require', item: 'd' });
  const d = { ...byId(zh, 'halloween'), recipes: [big] };
  assert.ok(D.check(d, D.fresh(d), LIM).some(f => f.code === 'structure' && f.why === 'full'));
});

test('accepting alone is not a change; removing and restoring is', () => {
  const d = byId(zh, 'halloween'), st = D.fresh(d);
  st.tasks[1].accepted = true; st.recipes[1].accepted = true;
  assert.equal(D.changed(d, st), false);
  st.recipes[2].removed = true;
  assert.equal(D.removedCount(d, st), 1);
  assert.ok(D.changed(d, st));
  st.recipes[2].removed = false;
  assert.equal(D.changed(d, st), false);
});

test('a sentence of one’s own drafts the closest of the three (交接单 ⑭)', () => {
  [zh, en].forEach(cfg => {
    const at = text => D.closest(text, cfg.drafts, cfg.match);
    const idx = id => cfg.drafts.findIndex(d => d.id === id);
    assert.equal(at('我想要设定一个拉新活动'), idx('newsong'));   // what the owner typed
    assert.equal(at('I want to set up a campaign to get new fans'), idx('newsong'));
    assert.equal(at('想从 Twitch 搬家到 YouTube'), idx('move'));
    assert.equal(at('We are switching to a new platform'), idx('move'));
    assert.equal(at('万圣节守着我的直播'), idx('halloween'));
    assert.equal(at('A Halloween stream'), idx('halloween'));
    assert.equal(at('今天晚饭吃什么好呢'), -1);                    // nothing matches: the page uses the first draft
    assert.equal(at('What should I cook for dinner tonight?'), -1);
    assert.equal(at(''), -1);
    cfg.drafts.forEach((d, i) => assert.equal(at(d.goal), i, `${d.id}'s own goal`));   // each sample goal finds its own draft
  });
});

test('the recipe rules of section 03 are untouched by this', () => {
  assert.equal(typeof R.load, 'function');
  const s = R.blank();
  assert.equal(R.add(s, 'key', { zone: 'require', index: 0 }, LIM), '');
});

console.log(`draft rules: ${ran} checks passed`);
