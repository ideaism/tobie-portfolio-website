// 种类表：一句话（东西的名字）→ 用哪张图、要不要贴名字小标签、默认计划、放冷藏还是冷冻。
// 注意：这张表是这次新提的。产品里没有“种类”这一栏，界面上也不出现“种类”两个字；
// 种类每次都从名字现算，从来不存下来（东西上只存 img / name / label，见 data.js 的说明）。
// 放在 data.js 之后、app.js 之前加载。对外只有 window.KINDS。
//
// 三档：
//   名字就是这一类的本名（“牛奶”“吐司”）：用这一类自己的图，不贴标签；
//   同类的别的东西（“豆浆”“鸡胸肉”）：借这一类的图，贴名字标签（名字前 4 个字）；
//   认不出来的（“妈妈寄的东西”）：用保鲜盒的图，贴名字标签。
(() => {
'use strict';
// exact：本名（不贴标签）；alias：同类的别的东西（贴标签）。plan 为 null 表示不设计划（冷冻的）
const list = [
  { id: 'carton',   name: '纸盒饮品',   img: 'milk',      plan: '这几天吃', exact: ['牛奶', '纯牛奶', '鲜牛奶'], alias: ['豆浆', '燕麦奶', '果汁', '豆奶'] },
  { id: 'egg',      name: '蛋',         img: 'eggs',      plan: '说不准',   exact: ['鸡蛋', '蛋'], alias: ['鸭蛋', '鹌鹑蛋', '皮蛋'] },
  { id: 'jar',      name: '罐和酱',     img: 'jam',       plan: '说不准',   exact: ['果酱'], alias: ['辣酱', '泡菜', '花生酱', '酱', '罐头'] },
  { id: 'cheese',   name: '奶酪黄油',   img: 'cheese',    plan: '说不准',   exact: ['奶酪', '芝士'], alias: ['黄油', '奶油'] },
  { id: 'takeaway', name: '外卖和剩菜', img: 'takeaway',  plan: '这几天吃', exact: ['外卖', '剩菜', '剩饭', '打包'], alias: [] },
  { id: 'meat',     name: '肉和生鲜',   img: 'meat',      plan: '这几天吃', exact: ['肉'], alias: ['鸡胸', '鸡', '猪', '牛', '羊', '排骨', '鱼', '虾'] },
  { id: 'bread',    name: '面包主食',   img: 'bread',     plan: '说不准',   exact: ['面包', '吐司'], alias: ['馒头', '包子', '面条', '饼'] },
  { id: 'veg',      name: '蔬菜',       img: 'veg',       plan: '说不准',   exact: ['蔬菜', '青菜'], alias: ['生菜', '菠菜', '白菜', '番茄', '黄瓜', '菜'] },
  { id: 'bottle',   name: '瓶装饮料',   img: 'bottle',    plan: '说不准',   exact: ['饮料'], alias: ['可乐', '啤酒', '茶', '水', '汽水', '酒'] },
  // 下面三类没有自己的图，先借（产品逻辑\第二阶段-打算.md：这次不出水果、小杯、冷冻的图）
  { id: 'cup',      name: '小杯',       img: 'milk',      plan: '这周内',   exact: [], alias: ['酸奶', '布丁'] },
  { id: 'fruit',    name: '水果',       img: 'container', plan: '说不准',   exact: [], alias: ['苹果', '草莓', '葡萄', '香蕉', '橙', '梨', '水果'] },
  { id: 'frozen',   name: '冷冻的',     img: 'container', plan: null, cold: true, exact: [], alias: ['冰淇淋', '速冻', '冻', '雪糕', '冰棍', '水饺', '饺子'] }
];
const UNKNOWN = { id: 'unknown', name: '认不出来的', img: 'container', plan: '说不准' };
// 别认错：这几个词里的某个字不算数（phrase 里出现的 not 里那些词都跳过）
const BLOCK = [
  { phrase: '蛋糕', not: ['蛋'] }, { phrase: '蛋挞', not: ['蛋'] }, { phrase: '蛋黄酱', not: ['蛋'] },
  { phrase: '果冻', not: ['冻'] }, { phrase: '番茄酱', not: ['番茄'] }, { phrase: '饼干', not: ['饼'] },
  { phrase: '蛋卷', not: ['蛋'] }
];
const chars = s => Array.from(String(s || ''));
const label4 = s => chars(String(s || '').trim()).slice(0, 4).join('');
// 这个位置上的这个词是不是被“别认错”挡掉了
function blocked(text, i, word) {
  return BLOCK.some(b => b.not.includes(word) && (() => {
    for (let j = text.indexOf(b.phrase); j >= 0; j = text.indexOf(b.phrase, j + 1)) if (i >= j && i + word.length <= j + b.phrase.length) return true;
    return false;
  })());
}
// 名字里出现的词（没被挡掉的）：[{ k: 类, word, exact }]
function hits(text, kinds) {
  const out = [];
  kinds.forEach(k => [['exact', true], ['alias', false]].forEach(([f, ex]) => (k[f] || []).forEach(word => {
    for (let i = text.indexOf(word); i >= 0; i = text.indexOf(word, i + 1)) if (!blocked(text, i, word)) { out.push({ k, word, exact: ex }); break; }
  })));
  return out;
}
// 长的词赢；一样长时本名赢
const best = hs => hs.sort((a, b) => b.word.length - a.word.length || (b.exact - a.exact))[0];
function match(text) {
  const name = String(text || '').trim();
  const frozen = list.find(k => k.id === 'frozen');
  // 冷冻的先查
  let h = best(hits(name, [frozen]));
  if (!h) h = best(hits(name, list.filter(k => k !== frozen)));
  const k = h ? h.k : UNKNOWN;
  // 本名：名字整个就是这个词（“纯牛奶”），或名字里最长的那个词是本名（“牛肉”里的“肉”）
  const exact = !!(h && h.exact);
  return { kind: k.id, kindName: k.name, img: k.img, label: exact ? null : label4(name), plan: k.plan, cold: !!k.cold, word: h ? h.word : null };
}
// 换了图以后要不要贴标签：图就是这个名字本来该用的那张、而且是本名 → 不贴；否则贴名字前 4 个字
function labelFor(name, img) { const m = match(name); return m.label == null && m.img === img ? null : label4(name); }
// 手写体子集里有没有这几个字（fonts/zcool-kuaile-subset.txt）。没有的字会落到别的字体上，一行里两种字体，所以整条换正文字体
const SUB = '一三上不东个买了二互交人件企保先入共内冰冷冻准几划别到前动半卖厨只吃周四处外大天奶它家小就层底开得我房打换掉播放新是更有条果查样满牛理用的盒看眼知算箱能菜蛋西计说谁赶过还这进道都酪酱重阿青鱼鲜鸡鹅0123456789+＋·？?';
const fits = s => chars(s).every(c => SUB.includes(c));
// 换图时轮着换的 10 张
const imgs = ['milk', 'eggs', 'jam', 'cheese', 'takeaway', 'container', 'meat', 'bread', 'veg', 'bottle'];
window.KINDS = { list, match, labelFor, label4, fits, imgs };
})();
