// 假数据。只给交互小样用，不连任何后端。
// kind: mine 我的 / shared 共用 / unknown 不知道是谁的 / other 别人的（淡）
// model: 可选，一个 .glb 的相对路径。有它时“拿起来”显示真模型（牛奶、外卖盒有，见最下面的 models）。
window.FRIDGE = {
  img: 'img/trim/',
  sizes: { // 裁边后的像素尺寸，排版要用
    milk: [428, 600], eggs: [597, 600], jam: [480, 600], cheese: [600, 571],
    takeaway: [600, 585], container: [600, 343],
    // 2026-11-19 录入第二步新加的 4 张（本机 Codex 出的，产品“常放的六样”里缺的肉、面包、蔬菜、饮料）
    meat: [600, 220], bread: [600, 577], veg: [578, 600], bottle: [305, 600]
  },
  names: { milk: '牛奶', eggs: '鸡蛋', jam: '果酱', cheese: '奶酪', takeaway: '外卖盒', container: '保鲜盒',
    meat: '肉', bread: '面包', veg: '蔬菜', bottle: '饮料' },
  // 东西可以有自己的名字（2026-11-19 加，只有默认界面「冰箱贴」读）：name 名字（没有就用上面 names 里图的名字）、
  // label 贴在东西上的名字小标签（借了别的样子、认不出来的才有，最多 4 个字）、yellow 贴了黄标（临期）。种类不存，见 kinds.js
  shelves: [
    { label: '上层 · 阿青', y: 198 },
    { label: '二层 · 我的层', y: 281, mine: true },
    { label: '三层 · 大家都能放', y: 365 },
    { label: '四层 · 小满', y: 451 },
    { label: '底层 · 大家都能放', y: 536, right: 359 }
  ],
  owners: { 我: '#506b5b', 满: '#b9695c', 青: '#8a7bb0' },
  ownerNames: { 青: '阿青', 满: '小满' },
  fish: 2, // 企鹅已经吃到的鱼
  items: [
    { id: 't0-jam', t: 0, s: 0, img: 'jam', kind: 'other', owner: '青' },
    { id: 't0-box', t: 0, s: 1, img: 'container', kind: 'other', owner: '青' },
    { id: 't0-milk', t: 0, s: 2, img: 'milk', kind: 'other', owner: '青', offer: '这两天' },   // offer：阿青说谁想吃都可以拿（今天之内 / 这两天 / 一直可以），层板上贴“请吃”

    { id: 't1-milk', t: 1, s: 0, img: 'milk', kind: 'mine', plan: '这几天吃', days: 5 },   // 5 / 3 天：计划过了，深一号的胶带
    { id: 't1-eggs', t: 1, s: 1, img: 'eggs', kind: 'mine', plan: '这周内', days: 2 },   // 旧界面 2 天；默认界面在文件末尾改成 5 / 7 天（计划过了大半，橙色胶带）
    { id: 't1-take', t: 1, s: 2, img: 'takeaway', kind: 'mine', plan: '这几天吃', days: 1 },

    { id: 't2-box', t: 2, s: 0, img: 'container', kind: 'unknown', days: 3 },
    { id: 't2-cheese', t: 2, s: 1, img: 'cheese', kind: 'mine', sticker: '我', plan: '说不准', days: 8 },
    { id: 't2-jam', t: 2, s: 2, img: 'jam', kind: 'shared', sticker: '共', days: 4 },
    { id: 't2-take', t: 2, s: 3, img: 'takeaway', kind: 'other', owner: '满', sticker: '满', ask: true },   // ask：需询问（拿之前先问小满；旧界面不读）

    { id: 't3-eggs', t: 3, s: 0, img: 'eggs', kind: 'other', owner: '满' },
    { id: 't3-milk', t: 3, s: 1, img: 'milk', kind: 'other', owner: '满', name: '豆浆', label: '豆浆' },

    { id: 't4-cheese', t: 4, s: 0, img: 'cheese', kind: 'shared', sticker: '共', plan: '这几天吃', days: 6, hold: 30 },   // hold：有人说要处理，还剩几小时（吊牌）
    { id: 't4-box', t: 4, s: 1, img: 'container', kind: 'other', owner: '青', sticker: '青', name: '妈妈寄的东西', label: '妈妈寄的' }
  ],
  // “+2”叠放格。items 是收在里面的两样（只有默认界面「冰箱贴」拉出这一层时才摊开；旧界面和方向 B 只读 text）。
  // 字段和上面 items 一样；t 是所在的层，s 不用（收着的东西在层板上没有位置）。
  more: { t: 1, s: 3, text: '+2', items: [
    { id: 't1-more-cheese', t: 1, img: 'cheese', kind: 'mine', plan: '这周内', days: 3 },
    { id: 't1-more-jam', t: 1, img: 'jam', kind: 'other', owner: '满', days: 4 }   // 小满的，放错层了
  ] },
  // Tripo 出的真模型（2026-11-19）。网址带 ?flat=1 就全关掉，回到全用图片。
  // 企鹅：2026-11-19 本人在 008 卡上选了“换成新模型”。默认用欢呼姿势重出的那一版（196 万面压到 17.6 万面，
  // 贴图颜色往欢呼图校过，penguin-cheer.glb 是没校的），带暖光和脚下的影子；模型加载不出来时欢呼图顶上。
  // ?penguin3d=0 只用图；?penguin3d=1 看最早那版（本人说“太粗糙”的）。
  // 奶酪、保鲜盒、果酱罐、鸡蛋盒：2026-11-19 本人在 036 卡上点了通过（Studio 网页出的，gltfpack -si 0.016 -noq 压过）。
  // 注意 container 也是“认不出的种类”借用的样子（kinds.js），所以那些东西拿起来也会是保鲜盒模型。
  models: { milk: 'tripo/web/milk.glb', takeaway: 'tripo/web/takeaway.glb', penguin: 'tripo/web/penguin-cheer-graded.glb', cheese: 'tripo/web/cheese.glb', container: 'tripo/web/container.glb', jam: 'tripo/web/jam.glb', eggs: 'tripo/web/eggs.glb' },
  penguinLit: true
};
// 两台冰箱（只有默认界面「冰箱贴」用；旧界面 ?skin=0 和方向 B 还是只读上面那些顶层字段）。
// 第一台直接引用上面的 shelves / items / more；第二台的东西 id 都带 f1- 前缀，两台之间不重复。
// 用手写体显示的字只能用 fonts/zcool-kuaile-subset.txt 里有的字。
window.FRIDGE.fridges = [
  { name: '厨房大冰箱', stage: 'img/stage.webp', door: 'door-front.webp',
    shelves: window.FRIDGE.shelves, items: window.FRIDGE.items, more: window.FRIDGE.more,
    // 冷冻里的东西（2026-11-19 加）：分两层，产品里冷冻区是“先到先用”，谁都能放，东西上还是带主人。
    // 冻着的东西没有计划（产品：放进冷冻＝取消当前计划）。字段和层板上的一样，只是没有 t / s，所在的层是数组下标。
    // 胶带上的“冷冻 · N 件”由最下面按这里的件数算出来（freezer 字段），不再写死。
    frozen: [
      { label: '冷冻上层', items: [
        { id: 'fz0-take', img: 'takeaway', kind: 'mine', days: 9 },
        { id: 'fz0-box', img: 'container', kind: 'other', owner: '满', days: 14 },
        { id: 'fz0-milk', img: 'milk', kind: 'shared', days: 6 }
      ] },
      { label: '冷冻下层', items: [
        { id: 'fz0-eggs', img: 'eggs', kind: 'other', owner: '青', days: 20 },
        { id: 'fz0-cheese', img: 'cheese', kind: 'mine', days: 12 },
        { id: 'fz0-jam', img: 'jam', kind: 'shared', days: 30 }
      ] }
    ] },
  { name: '厨房小冰箱', stage: 'img/stage-b.webp', door: 'door-front-b.webp',
    frozen: [
      { label: '冷冻上层', items: [
        { id: 'f1-fz-box', img: 'container', kind: 'mine', days: 7 },
        { id: 'f1-fz-jam', img: 'jam', kind: 'other', owner: '满', days: 16 }
      ] },
      { label: '冷冻下层', items: [
        { id: 'f1-fz-cheese', img: 'cheese', kind: 'shared', days: 11 }
      ] }
    ],
    bubble: '这箱都还新鲜',
    autoOpen: true, // 第一次转到这台时门自己打开
    shelves: [
      { label: '上层 · 大家都能放', y: 198 },
      { label: '二层 · 小满', y: 281 },
      { label: '三层 · 我的层', y: 365, mine: true },
      { label: '四层 · 阿青', y: 451 },
      { label: '底层 · 大家都能放', y: 536, right: 359 }
    ],
    items: [
      { id: 'f1-t0-jam', t: 0, s: 0, img: 'jam', kind: 'shared', sticker: '共', days: 3 },
      { id: 'f1-t0-take', t: 0, s: 2, img: 'takeaway', kind: 'unknown', days: 6 },

      { id: 'f1-t1-milk', t: 1, s: 1, img: 'milk', kind: 'other', owner: '满' },

      { id: 'f1-t2-milk', t: 2, s: 0, img: 'milk', kind: 'mine', plan: '这几天吃', days: 3 },
      { id: 'f1-t2-eggs', t: 2, s: 2, img: 'eggs', kind: 'mine', days: 4 },

      { id: 'f1-t3-box', t: 3, s: 0, img: 'container', kind: 'other', owner: '青', sticker: '青' },
      { id: 'f1-t3-cheese', t: 3, s: 2, img: 'cheese', kind: 'other', owner: '青' },

      { id: 'f1-t4-cheese', t: 4, s: 1, img: 'cheese', kind: 'shared', sticker: '共', days: 2 }
    ],
    more: null }
];
// 冷冻抽屉胶带上的字：按上面 frozen 里的件数算
window.FRIDGE.fridges.forEach(f => { f.freezer = '冷冻 · ' + f.frozen.reduce((n, z) => n + z.items.length, 0) + ' 件'; });
{ const p = new URLSearchParams(location.search).get('penguin3d');
  if (p === '0') delete window.FRIDGE.models.penguin;
  if (p === '1') window.FRIDGE.models.penguin = 'tripo/web/penguin.glb';
  if (p === '0' || p === '1') window.FRIDGE.penguinLit = false; }
if (new URLSearchParams(location.search).get('flat') === '1') window.FRIDGE.models = {};
window.FRIDGE.fridges.forEach(f => f.items.forEach(i => { const m = window.FRIDGE.models[i.img]; if (m) i.model = m; }));

// 自测替身：只有网址带 ?standin=1 才给二层的牛奶挂一个现成模型（不是本项目画风）
if (new URLSearchParams(location.search).get('standin') === '1') {
  window.FRIDGE.items.find(i => i.id === 't1-milk').model = 'standin/carton.glb';
}

// 冰箱贴（每周结算，week.js 用，只有默认界面有）。顺序 = 一周发一枚的顺序；第 1 枚开场就贴在厨房大冰箱门上。
// x、y：贴在门板上的位置（门板 374×464，量的是冰箱贴中心），r：歪几度，w：宽（像素），高按图片比例。贴上去以后可以随便挪、随便转。
window.FRIDGE.magnets = [
  { id: 'fish', name: '小鱼', img: 'magnet-fish.webp', size: [1007, 859], w: 56, x: 300, y: 72, r: -8 },
  { id: 'strawberry', name: '草莓', img: 'magnet-strawberry.webp', size: [838, 1034], w: 46, x: 230, y: 66, r: 7 },
  { id: 'eggs', name: '鸡蛋盒', img: 'magnet-eggs.webp', size: [1097, 655], w: 62, x: 158, y: 74, r: -5 },
  { id: 'milk', name: '牛奶盒', img: 'magnet-milk-v2.webp', size: [731, 930], w: 44, x: 96, y: 68, r: 6 }
];

// 第四步（2026-11-19）：鸡蛋 5 / 7 天只在默认界面「冰箱贴」，旧界面 ?skin=0 和方向 B 还是 2 天，截图不变。
{ const q = new URLSearchParams(location.search).get('skin');
  if (q !== '0' && q !== 'b') window.FRIDGE.items.find(i => i.id === 't1-eggs').days = 5; }
