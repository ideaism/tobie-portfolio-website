"""Evidence figures per case section. Every entry points at an ORIGINAL asset
exported by tools/prepare_assets.py. `prov` sets the provenance tag:
  original  – my original screen / file
  team      – team UI (not my visual design)
  research  – research artefact
  photo     – photograph
  recording – screen recording
  live      – the working prototype
Chinese interface text in some artefacts is the original language of the work.
"""

PROV = {
    'original': (['原始界面', 'Original screen'], ''),
    'wire': (['原始线框', 'Original wireframes'], ''),
    'team': (['团队 UI', 'Team UI'], 'prov--team'),
    'research': (['研究材料', 'Research artefact'], ''),
    'photo': (['实拍', 'Photo'], ''),
    'mixed': (['原稿对比', 'Source comparison'], ''),
}

# (slug, section number) -> list of figures
FIGURES = {
 # ---------------- Qingju ----------------
 ('qingju', 2): [
  {'kind': 'image', 'src': 'qingju/research', 'prov': 'research', 'project': 'qingju',
   'label': ['研究摘要 · 2021 原稿', 'Research summary · 2021 original'],
   'caption': ['原始研究摘要（中文原稿）。样本数量来自当年的项目记录；以休闲骑行为主的样本并不代表全部骑行者。', 'Original research summary (in Chinese, as produced). Sample counts come from the historical project record; the leisure-focused sample does not represent all riders.']},
  {'kind': 'image', 'src': 'qingju/field', 'prov': 'photo', 'project': 'qingju',
   'label': ['实地观察 · 武汉东湖', 'Field observation · East Lake, Wuhan'],
   'caption': ['实地观察（2021 年 5 月，武汉东湖）：投放的车很多，真正在骑的很少——当时的产品在休闲场景里缺少引导和关联。', 'Field observation (May 2021, East Lake, Wuhan): plenty of bikes, few being ridden — in this leisure setting the product offered little guidance or relevance.']},
 ],
 ('qingju', 3): [
  {'kind': 'image', 'src': 'qingju/journey', 'prov': 'research', 'project': 'qingju',
   'label': ['用户旅程图 · 骑行前 / 中 / 后', 'Journey map · before / during / after'],
   'caption': ['原始旅程图：行为与机会的综合，不是对情绪的量化测量。', 'Original journey map: a synthesis of behaviours and opportunities, not a quantitative measurement of emotion.']},
 ],
 ('qingju', 4): [
  {'kind': 'image', 'src': 'qingju/lofi-board', 'prov': 'wire', 'project': 'qingju', 'bg': '#4F4F4F',
   'label': ['低保真原型板 · 21 个界面', 'Low-fidelity board · 21 screens'],
   'caption': ['完整的低保真原型板（本人完成）。上方原型走的是第一行的主流程。', 'The full low-fidelity board (my work). The prototype above follows its first row, the main flow.']},
 ],
 ('qingju', 6): [
  {'kind': 'phones', 'prov': 'team', 'project': 'qingju', 'n': 2,
   'label': ['团队高保真 · 在研究之上完成', 'Team high fidelity · built on the research'],
   'items': [('qingju/team-memory', ['骑行回忆', 'Ride memories']), ('qingju/team-route', ['路线发现与讨论圈', 'Route discovery & discussion'])],
   'caption': ['最终高保真由团队完成，展示研究结论如何被带进界面；不是我的视觉设计。', 'The final high fidelity was a team output, shown to trace how the research carried into the interface — it is not my visual design.']},
 ],
 # ---------------- PlayBook ----------------
 ('playbook', 1): [
  {'kind': 'pair', 'prov': 'original', 'project': 'playbook',
   'label': ['同一条规则的两端 · Studio → App', 'Two sides of one rule · Studio → App'],
   'wide': ('playbook/studio-campaign', ['Studio：配置活动、任务、物品与配方（我的 UX/UI）', 'Studio: configure campaigns, tasks, items and recipes (my UX/UI)']),
   'phone': ('playbook/app-missions', ['App：参与任务（我的 UX）', 'App: take part in missions (my UX)']),
   'caption': ['左：创作者端 Studio 活动页原稿。右：粉丝端 App 任务页的 UX 稿。', 'Left: the creator-side Studio campaign page. Right: the fan-side App missions screen, UX version.']},
 ],
 ('playbook', 3): [
  {'kind': 'phones', 'prov': 'mixed', 'project': 'playbook', 'n': 4,
   'label': ['合成界面的演变 · 谁做了什么', 'How the crafting screen evolved · who did what'],
   'items': [('playbook/early-ui', ['早期 UI · 另一位设计师', 'Early UI · another designer']), ('playbook/cauldron-list', ['配方列表 · 我的 UX', 'Recipe list · my UX']), ('playbook/app-craft-ready', ['配方详情 · 我的 UX', 'Recipe detail · my UX']), ('playbook/team-inventory', ['完成的 UI · 团队', 'Completed UI · the team'])],
   'caption': ['早期视觉确立了方向；我的线框补全了任务、物品状态和决策点；最终视觉由团队完成。', 'The early UI set a visual direction; my wireframes filled in tasks, object states and decision points; the final visual design was a team effort.']},
 ],
 ('playbook', 4): [
  {'kind': 'phones', 'prov': 'original', 'project': 'playbook', 'n': 4,
   'label': ['创作者上下文与搜索 · 我的 UX', 'Creator context and search · my UX'],
   'items': [('playbook/app-home', ['首页：上下文与进度', 'Home: context + progress']), ('playbook/app-inventory', ['背包：相关物品', 'Inventory: related items']), ('playbook/app-search', ['全局搜索：分类筛选', 'Global search: categories']), ('playbook/app-search-creators', ['搜索结果：创作者', 'Results: creators'])],
   'caption': ['日常任务保留创作者上下文；2023 年 10 月的评审后，搜索改为跨社区的全局入口。', 'Everyday tasks keep the creator context; after the October 2023 review, search became a global, cross-community entry point.']},
 ],
 ('playbook', 5): [
  {'kind': 'phones', 'prov': 'original', 'project': 'playbook', 'n': 2,
   'label': ['反馈的分量 · 轻提示与领取弹窗', 'Weight of feedback · light cue vs claim dialog'],
   'items': [('playbook/app-home', ['日常进度：+5 · 2m 的小提示', 'Routine progress: a small “+5 · 2m” cue']), ('playbook/app-reward', ['重要奖励：Acquire items 领取', 'A significant reward: “Acquire items”'])],
   'caption': ['日常的小进度贴在任务旁边；只有值得停下来的奖励才用弹窗和一次明确的领取。', 'Routine progress stays next to the task; only a reward worth pausing for gets a dialog and a deliberate claim.']},
 ],
 ('playbook', 6): [
  {'kind': 'phones', 'prov': 'team', 'project': 'playbook', 'n': 3,
   'label': ['团队完成的 UI · 用于产品与投资沟通', 'Completed team UI · used in product and investor conversations'],
   'items': [('playbook/team-home', ['首页', 'Home']), ('playbook/team-profile', ['个人主页', 'Profile']), ('playbook/team-mission', ['任务', 'Mission'])],
   'caption': ['团队完成的视觉稿，基于我整理的流程与状态。视觉设计不是我的个人成果。', 'The team’s finished visual design, built on the flows and states I defined. The visual design is not my individual work.']},
 ],
 # ---------------- SMT ----------------
 ('smt', 3): [
  {'kind': 'image', 'src': 'smt/states', 'prov': 'original', 'project': 'smt', 'pad': True,
   'label': ['原稿截图 · 行状态', 'Source crop · row states'],
   'caption': ['上方复刻所依据的原稿行状态截图（默认、选中、悬停）；无数据变体在原稿中保留行高。', 'The source crop the replica follows (default, selected, hover); the no-data variant keeps the row height in the source.']},
 ],
 ('smt', 4): [
  {'kind': 'image', 'src': 'smt/trade-components', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['交易控件与变体 · 组件库原稿', 'Trading controls and variants · library source'],
   'caption': ['买入 3 种、卖出 6 种状态（选中、聚焦、未选中，有无角标）。这是我负责的组件范围，不代表整套证券产品由我个人负责。', 'Buy has 3 states and sell has 6 (selected, focused, unselected, with or without a badge). This is my component scope, not sole ownership of the securities product.']},
 ],
 # ---------------- Commons Fridge ----------------
 ('commons-fridge', 1): [
  {'kind': 'image', 'src': 'fridge/research', 'prov': 'research', 'project': 'fridge', 'pad': True,
   'label': ['五场共享冰箱习惯访谈 · U01–U05', 'Five shared-fridge habit interviews · U01–U05'],
   'caption': ['访谈卡片（中文原稿）。这些是个人叙述，不是统计结论。', 'Interview cards (Chinese originals). These are individual accounts, not statistics.']},
 ],
 ('commons-fridge', 2): [
  {'kind': 'phones', 'prov': 'original', 'project': 'fridge', 'n': 2,
   'label': ['v1.7 原型 · 四个入口', 'v1.7 prototype · four entry points'],
   'items': [('fridge/cf-home', ['在冰箱前：只做这一刻需要的事', 'At the fridge: only what this moment needs']), ('fridge/cf-add', ['放进去：记下一个计划', 'Put in: record a plan'])],
   'caption': ['不再要求完整库存，而是在四个具体时刻提供帮助。', 'Instead of a complete inventory, help at four concrete moments.']},
 ],
 ('commons-fridge', 3): [
  {'kind': 'phones', 'prov': 'original', 'project': 'fridge', 'n': 2,
   'label': ['House 视图 · 位置、归属与权限', 'House view · location, ownership and permission'],
   'items': [('fridge/cf-house', ['按区域分组，而不是按人', 'Grouped by area, not by person']), ('fridge/cf-found', ['发现物品：保留“不确定是谁的”', 'Found something: keep “not sure whose”'])],
   'caption': ['看得见不等于有权处理：未认领的物品保持“不确定”，直到有人明确声明。', 'Seeing something does not grant permission: an unclaimed item stays “not sure whose” until someone explicitly claims it.']},
 ],
 ('commons-fridge', 4): [
  {'kind': 'image', 'src': 'fridge/photo-touch', 'prov': 'photo', 'project': 'fridge', 'narrow': True,
   'label': ['冰箱门上的实体入口 · 研究者演示', 'Physical entry on the fridge door · researcher demo'],
   'caption': ['在真实厨房里：碰一下冰箱门上的入口，手机打开对应页面。这是研究者演示，不是参与者可用性测试。', 'In a real kitchen: touching the entry on the fridge door opens the matching phone route. A researcher demonstration, not a participant usability test.']},
  {'kind': 'penguins', 'prov': 'original', 'project': 'fridge',
   'label': ['企鹅角色 · 邀请 / 确认 / 发现', 'Penguin character · invite / acknowledge / found'],
   'items': [('fridge/penguin-add', ['邀请一个动作', 'Invite an action']), ('fridge/penguin-received', ['确认一条记录', 'Acknowledge a record']), ('fridge/penguin-manage', ['一起查看', 'Check together']), ('fridge/penguin-found', ['发现了东西', 'Found something'])],
   'caption': ['用 AI 辅助探索后，我挑选并精修成一套一致的角色，每个表情对应一种交互时刻。', 'Explored with AI assistance, then selected and refined into one consistent character; each expression maps to an interaction moment.']},
 ],
 ('commons-fridge', 6): [
  {'kind': 'image', 'src': 'fridge/penguin-motion', 'prov': 'original', 'project': 'fridge', 'pad': True,
   'label': ['展览动态研究 · 2026 年 9 月', 'Exhibition motion study · September 2026'],
   'caption': ['角色的下一步：把邀请与确认做成触觉和动态反馈。', 'Next for the character: turning invite and acknowledge into tactile and motion feedback.']},
 ],
}
