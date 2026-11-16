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
    'submission': (['提交稿原页', 'Submitted page'], ''),     # 学术提交稿里的一页，英文原文，只裁掉页脚和空白
    'retro': (['2026 复盘图', '2026 diagram'], ''),           # 2026 年回看时新画的图，不是当年的原稿，也不是研究材料
}

# (slug, section number) -> list of figures
FIGURES = {
 # ---------------- Qingju ----------------
 ('qingju', 2): [
  {'kind': 'image', 'src': 'qingju/research', 'prov': 'research', 'project': 'qingju',
   'label': ['访谈摘要 · 2021 原稿（中文）', 'Interview summary · 2021 original (Chinese)'],
   'alt': ['2021 年访谈摘要原稿（中文）：访谈提纲说明；11 位受访者关键表述的气泡；一个标为“没有注意过用户成长体系”的百分比；以及两组关键词——成长体系关注点（权益、优惠、收集、社交）与休闲骑行影响因素（自我情感、社交、环境）。', 'Original 2021 interview summary, in Chinese: the interview guide; speech bubbles with key remarks from 11 interviewees; a percentage labelled “had not noticed the growth system”; and two keyword chains — what riders look for in a growth system (status, discounts, collecting, sharing) and what shapes a leisure ride (personal feelings, social needs, environment).'],
   'caption': ['研究摘要原稿（中文），聚焦休闲骑行场景。', 'Original research summary (in Chinese), focused on leisure riding.']},
  {'kind': 'image', 'src': 'qingju/field', 'prov': 'photo', 'project': 'qingju',
   'label': ['实地观察 · 武汉藏龙岛湿地公园', 'Field observation · Canglongdao Wetland Park, Wuhan'],
   'caption': ['实地观察（2021-05-09 18:00–19:30，武汉藏龙岛湿地公园）：现场投放的车多、在骑的少。', 'Field observation (9 May 2021, 18:00–19:30, Canglongdao Wetland Park, Wuhan): many bikes deployed, few in use.']},
 ],
 ('qingju', 3): [
  {'kind': 'image', 'src': 'qingju/journey', 'prov': 'research', 'project': 'qingju',
   'label': ['用户旅程图 · 骑行前 / 中 / 后', 'Journey map · before / during / after'],
   'caption': ['原始旅程图：行为与机会的综合。', 'Original journey map: a synthesis of behaviours and opportunities.']},
 ],
 ('qingju', 4): [
  {'kind': 'image', 'src': 'qingju/lofi-board', 'prov': 'wire', 'project': 'qingju', 'bg': '#4F4F4F',
   'label': ['低保真原型板 · 21 个界面', 'Low-fidelity board · 21 screens'],
   'alt': ['21 个灰度低保真界面，三行连线。第一行是主流程：地图发现路线、路线预览、路线详情、骑行中、结束骑行获得金币、骑行汇总、写下感受。第二行是店铺地图、路线讨论圈、宝库、宝箱升级、获得风景卡、获得店铺券、发布成功。第三行是个人中心、优惠券条码、我的风景卡、骑行回忆列表与详情。', 'Twenty-one greyscale wireframes in three connected rows. Row one is the main flow: discover a route on the map, preview, route detail, riding, end of ride with coins, ride summary, write a note. Row two covers the shop map, route discussion, treasure vault, chest upgrade, scenery-card and shop-coupon rewards, and the published post. Row three covers the profile menu, coupon barcode, scenery-card collection, and the ride-memory list and detail.'],
   'caption': ['完整的低保真原型板（2021，本人完成）。上方原型走的是第一行主流程。', 'The full low-fidelity board (2021, my work). The prototype above follows the first row, the main flow.']},
 ],
 ('qingju', 6): [
  {'kind': 'phones', 'prov': 'team', 'project': 'qingju', 'n': 2,
   'label': ['团队高保真 · 在研究之上完成', 'Team high fidelity · built on the research'],
   'items': [('qingju/team-memory', ['骑行回忆', 'Ride memories'])],
   'caption': ['团队完成的最终高保真：研究结论被带进了界面。', 'The team’s final high fidelity: the research carried into the interface.']},
  # 2026-11-16（卡 042）：横向三屏拼图不进手机条，单独一条 image，按原比例完整显示（原图宽 1200，正文栏 936，不放大）
  {'kind': 'image', 'src': 'qingju/team-route', 'prov': 'team', 'project': 'qingju',
   'label': ['团队高保真 · 路线发现与讨论圈', 'Team high fidelity · route discovery & discussion'],
   'alt': ['三屏拼在一起的团队高保真：左边是某条路线的讨论圈，中间是路线详情（途经风景、里程、照片、他人感受和“去骑车”按钮），右边是收起后的路线卡。', 'Three team high-fidelity screens shown together: a route’s discussion feed on the left, the route detail in the middle (sights, distance, photos, riders’ notes and a “Ride” button), and the collapsed route card on the right.'],
   'caption': ['团队完成的高保真，三屏拼在一起：路线讨论圈、路线详情、收起后的路线卡。', 'High fidelity by the team, three screens shown together: the route discussion feed, the route detail and the collapsed route card.']},
 ],
 # 2026-11-16（卡 20261116-012）：07 节「2026 复盘」的两张图，只把正文里已有的内容画出来；中英文各一张（'src' 中文页，'src_en' 英文页）
 # 同日傍晚：本人看了白底版觉得在绿色页面上突兀，原图底色改成页面底色 #ECF0ED（--canvas）；图框跟着用 'bg' + 'flat'（无白底、无投影）
 ('qingju', 7): [
  {'kind': 'image', 'src': 'qingju/retro-metric-tree-zh', 'src_en': 'qingju/retro-metric-tree-en', 'prov': 'retro', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['指标树 · 激活 / 频次 / 留存', 'Metric tree · activation / frequency / retention'],
   'alt': ['一张指标树。最上面一行是 2021 原稿的四个阶段：试用、体验、习惯、分享。往下分成三个数：激活（第一次从路线入口完成骑行）、频次（每周骑行次数）、留存（30 天内是否回来再骑）。每个数下面列出 2021 方案里的触点：激活是首页 banner、寻宝地图、路线讨论圈；频次是骑行后的金币、宝箱、店铺券，其中“奖励跟着骑行结算”标为保留，“宝箱升级”标为砍掉；留存是骑行回忆（保留）和风景卡。', 'A metric tree. The top row shows the four stages from the 2021 deck: trial, first rides, habit, advocacy. Below, three numbers: activation (a first ride started from a route entry point), frequency (rides per week) and retention (riding again within 30 days). Under each are the touchpoints from the 2021 proposal: home banner, treasure map and route discussions for activation; post-ride coins, chests and shop coupons for frequency, with post-ride rewards marked keep and chest upgrades marked cut; ride memories (keep) and scenery cards for retention.'],
   'caption': ['2026 年画的指标树：把当年的四个阶段收成三个数，再把 2021 方案里的触点逐一归位，标出今天会保留和砍掉的部分。', 'A metric tree drawn in 2026: the four 2021 stages reduced to three numbers, with each touchpoint from the 2021 proposal put in its place and marked keep or cut.']},
  {'kind': 'image', 'src': 'qingju/retro-experiment-zh', 'src_en': 'qingju/retro-experiment-en', 'prov': 'retro', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['第一个实验 · 奖励什么时候给', 'First experiment · when the reward arrives'],
   'alt': ['一张实验设计图。骑行用户按用户随机分成两组：A 组锁车后立即结算，时间线上奖励落在锁车那一刻；B 组奖励延后、汇总再发放，时间线上奖励落在锁车之后。两组汇到右边一个框：主指标是 7 天复骑率，同时盯住每次复骑对应的奖励成本。', 'An experiment design. Riders are randomised by user into two groups: group A is rewarded the moment the bike is locked; group B receives a batched reward later. Both lead to one box on the right: the primary metric is the 7-day repeat-ride rate, with reward cost per repeat ride as a guardrail.'],
   'caption': ['2026 年的实验设计：按用户随机分两组，比较锁车后立即结算和延后汇总发放，主指标是 7 天复骑率。', 'An experiment designed in 2026: riders randomised into two groups to compare an immediate reward at lock with a batched one, judged on the 7-day repeat-ride rate.']},
 ],
 # ---------------- PlayBook ----------------
 ('playbook', 1): [
  {'kind': 'pair', 'prov': 'original', 'project': 'playbook',
   'label': ['同一条规则的两端 · Studio → App', 'Two sides of one rule · Studio → App'],
   'wide': ('playbook/studio-campaign', ['Studio：配置活动、任务、物品与配方（我的 UX/UI）', 'Studio: configure campaigns, tasks, items and recipes (my UX/UI)']),
   'phone': ('playbook/app-missions', ['App：参与任务（我的 UX）', 'App: take part in missions (my UX)']),
   'caption': ['左：创作者端 Studio 活动页原稿。右：粉丝端 App 任务页的 UX 稿。', 'Left: the creator-side Studio campaign page. Right: the fan-side App missions screen, UX version.']},
 ],
 # 2026-11-16：新增 02「用户与动线」、07「收藏与展示」，原 02–06 顺延为 03–06、08（07 这一批没有图）
 ('playbook', 2): [
  # 动线图中英文各一张：'src' 是中文页用的，'src_en' 是英文页用的（build.py figure_html 按语言取）
  {'kind': 'image', 'src': 'playbook/flow-before-after-zh', 'src_en': 'playbook/flow-before-after-en', 'prov': 'mixed', 'project': 'playbook',
   'label': ['用户动线 · 从五个平行视图到一条链路', 'User flow · from five parallel views to one loop'],
   'alt': ['用户动线前后对比：上半是客户方需求文档里的五个平行视图，下半是我按一次回访整理的五步参与链路', 'User flow before and after: the client’s five parallel views above, and the five-step participation loop I organised around a single visit below'],
   'caption': ['上：客户方需求文档里的 App 结构。下：我按粉丝一次回访整理的参与链路，每个节点对应一组 App 中保真线框。', 'Top: the app structure in the client’s requirements. Bottom: the participation loop I organised around one fan visit; each node maps to a set of mid-fidelity wireframes.']},
 ],
 ('playbook', 4): [
  {'kind': 'phones', 'prov': 'mixed', 'project': 'playbook', 'n': 4,
   'label': ['合成界面的演变 · 谁做了什么', 'How the crafting screen evolved · who did what'],
   'items': [('playbook/early-ui', ['早期 UI · 另一位设计师', 'Early UI · another designer']), ('playbook/cauldron-list', ['配方列表 · 我的 UX', 'Recipe list · my UX']), ('playbook/app-craft-ready', ['配方详情 · 我的 UX', 'Recipe detail · my UX']), ('playbook/team-inventory', ['完成的 UI · 团队', 'Completed UI · the team'])],
   'caption': ['早期视觉确立了方向；我的线框补全了任务、物品状态和决策点；最终视觉由团队完成。', 'The early UI set a visual direction; my wireframes filled in tasks, object states and decision points; the final visual design was a team effort.']},
 ],
 ('playbook', 5): [
  {'kind': 'phones', 'prov': 'original', 'project': 'playbook', 'n': 4,
   'label': ['创作者上下文与搜索 · 我的 UX', 'Creator context and search · my UX'],
   'items': [('playbook/app-home', ['首页：上下文与进度', 'Home: context + progress']), ('playbook/app-inventory', ['背包：相关物品', 'Inventory: related items']), ('playbook/app-search', ['全局搜索：分类筛选', 'Global search: categories']), ('playbook/app-search-creators', ['搜索结果：创作者', 'Results: creators'])],
   'caption': ['日常任务保留创作者上下文；2023 年 10 月的评审后，搜索改为跨社区的全局入口。', 'Everyday tasks keep the creator context; after the October 2023 review, search became a global, cross-community entry point.']},
 ],
 ('playbook', 6): [
  # 2026-11-16（卡 20261115-026 选 B）：奖励弹窗是 330×453 的弹窗局部，不是整屏，从 items 挪到 partials：
  # 不加 screen 类，按原比例完整显示，显示宽度不超过原图宽度（见 build.py figure_html）。2 倍原图以后由 playbook agent 导出再换。
  {'kind': 'phones', 'prov': 'original', 'project': 'playbook', 'n': 2,
   'label': ['反馈的分量 · 轻提示与领取弹窗', 'Weight of feedback · light cue vs claim dialog'],
   'items': [('playbook/app-home', ['日常进度：+5 · 2m 的小提示', 'Routine progress: a small “+5 · 2m” cue'])],
   'partials': [('playbook/app-reward', ['重要奖励：Acquire items 领取', 'A significant reward: “Acquire items”'])],
   'caption': ['日常的小进度贴在任务旁边；只有值得停下来的奖励才用弹窗和一次明确的领取。', 'Routine progress stays next to the task; only a reward worth pausing for gets a dialog and a deliberate claim.']},
 ],
 ('playbook', 8): [
  {'kind': 'phones', 'prov': 'team', 'project': 'playbook', 'n': 3,
   'label': ['团队完成的 UI · 用于产品与投资沟通', 'Completed team UI · used in product and investor conversations'],
   'items': [('playbook/team-home', ['首页', 'Home']), ('playbook/team-profile', ['个人主页', 'Profile']), ('playbook/team-mission', ['任务', 'Mission'])],
   'caption': ['团队完成的视觉稿，基于我整理的流程与状态。', 'The team’s finished visual design, built on the flows and states I defined.']},
 ],
 # ---------------- SMT ----------------
 # 2026-11-16（卡 20261116-014）：夜间版原稿导出的 8 张，1 倍，按原比例整张显示（kind 'image'，不进手机条）。
 # 02 节 1 张、03 节接 2 张、新 05 节「界面」5 张；原 05 顺延成 06。来源和打码见 docs/sources.md
 ('smt', 2): [
  {'kind': 'image', 'src': 'smt/credit-order-panel', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['信用交易下单板 · 按业务拆出的 13 个变体', 'Margin-trading order panel · 13 variants by business'],
   'caption': ['同一块下单板按业务拆出的 13 个变体，三行分别是担保品、融资、融券。', 'Thirteen variants of one order panel; the three rows are collateral, margin financing and securities lending.']},
 ],
 ('smt', 3): [
  {'kind': 'image', 'src': 'smt/states', 'prov': 'original', 'project': 'smt', 'pad': True,
   'label': ['原稿截图 · 行状态', 'Source crop · row states'],
   'caption': ['上方复刻所依据的原稿行状态截图（默认、选中、悬停）；无数据变体在原稿中保留行高。', 'The source crop the replica follows (default, selected, hover); the no-data variant keeps the row height in the source.']},
  {'kind': 'image', 'src': 'smt/level-variants', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['买卖档位 · 8 个变体', 'Bid/ask levels · 8 variants'],
   'caption': ['买卖档位的 8 个变体：五档和十档、展开和收起、横排和竖排。', 'Eight variants of the bid/ask levels: five or ten levels, expanded or collapsed, horizontal or vertical.']},
  {'kind': 'image', 'src': 'smt/market-components', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['行情组件', 'Market-data components'],
   'caption': ['行情类组件排在一起：股票详情头、买卖档位、委托队列、分笔成交、资金流向等。', 'Market-data components side by side: stock header, bid/ask levels, order queue, time and sales, capital flow and more.']},
 ],
 ('smt', 4): [
  {'kind': 'image', 'src': 'smt/trade-components', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['交易控件与变体 · 组件库原稿', 'Trading controls and variants · library source'],
   'caption': ['买入 3 种、卖出 6 种状态（选中、聚焦、未选中，有无角标）。', 'Buy has 3 states and sell has 6 (selected, focused, unselected, with or without a badge).']},
 ],
 ('smt', 5): [
  {'kind': 'image', 'src': 'smt/screen-asset-home', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['资产首页', 'Asset home'],
   'caption': ['资产首页：上面是多账户总览，下面是持仓，右边是快捷入口。', 'Asset home: multi-account overview on top, positions below, quick entries on the right.']},
  {'kind': 'image', 'src': 'smt/screen-main-menu', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['主菜单', 'Main menu'],
   'caption': ['主菜单展开：T+0 套利、网格交易、套利工具、策略研发四组入口。', 'Main menu open: four groups of entries — T+0 arbitrage, grid trading, arbitrage tools and strategy research.']},
  {'kind': 'image', 'src': 'smt/screen-quick-order', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['快速挂单', 'Quick order'],
   'caption': ['快速挂单：左边下单板，中间十档盘口和分时图，右边分笔成交，下面持仓表。', 'Quick order: order panel on the left, ten-level order book and intraday chart in the middle, time and sales on the right, positions below.']},
  {'kind': 'image', 'src': 'smt/screen-basket-order', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['篮子下单', 'Basket order'],
   'caption': ['篮子算法 · 篮子下单：左边设组合、方向、算法和时段，右边逐只调整成分股的委托方向、数量和权重。', 'Basket algorithm · basket order: set the portfolio, direction, algorithm and time window on the left; adjust each constituent’s side, quantity and weight on the right.']},
  {'kind': 'image', 'src': 'smt/screen-grid-strategy', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['网格策略', 'Grid strategy'],
   'caption': ['网格策略 · 多档预埋：左边设基准价、价差、档位数和每档数量，右边是运行中的网格任务，下面是任务明细。', 'Grid strategy · multi-level pre-set orders: base price, spread, number of levels and quantity per level on the left; running grid tasks on the right; task details below.']},
 ],
 # ---------------- Commons Fridge ----------------
 # 2026-11-15 加：'fridge/sub-*' 八张取自最终提交稿（23 页横版 PDF）的原页，页码写在 label 里；来源见 docs/sources.md
 ('commons-fridge', 1): [
  {'kind': 'image', 'src': 'fridge/sub-chain', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['从访谈到功能的推导链 · 提交稿 L02', 'How each step produced the next · submission L02'],
   'caption': ['七步：五场访谈 → 行为卡 → 四个画像 → 旅程与情绪 → 失效点 → 设计原则 → 功能与角色。前五步来自访谈，后两步是我的设计判断。', 'Seven steps, from five interviews to features and character. Steps 01–05 rest on the interviews; steps 06–07 are my design decisions.']},
  {'kind': 'image', 'src': 'fridge/research', 'prov': 'research', 'project': 'fridge', 'pad': True,
   'label': ['五场共享冰箱习惯访谈 · U01–U05', 'Five shared-fridge habit interviews · U01–U05'],
   'caption': ['访谈卡片（中文原稿）。', 'Interview cards (Chinese originals).']},
  {'kind': 'image', 'src': 'fridge/sub-personas', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['四个行为情境画像 · 提交稿 L04', 'Four behavioural personas · submission L04'],
   'caption': ['画像描述的是情境，不是人格类型：同一个人会随住处、层架规则和关系的变化在它们之间移动。图里的人像是示意插画。', 'These are situations, not personality types: the same person moves between them when the home, the shelf rules or the relationships change. The portraits are illustrations.']},
  {'kind': 'image', 'src': 'fridge/sub-curves', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['四条情绪曲线，同一条横轴 · 提交稿 L08', 'Four curves, one shared axis · submission L08'],
   'caption': ['纵轴是相对位置，高度本身不重要，要看的是形状：三条曲线能回升，一条不能。除了 A，其余三条都在第四阶段落到最低——出了问题、得有人开口的那一刻。最低点是人与人之间的事，不是技术问题。', 'The vertical axis is relative; what matters is the shape, not the height: three curves recover, one does not. Every curve except A bottoms out at stage 4, the moment something is wrong and someone has to say so. The lowest point is social, not technical.']},
 ],
 ('commons-fridge', 2): [
  {'kind': 'phones', 'prov': 'original', 'project': 'fridge', 'n': 2,
   'label': ['v1.7 原型 · 四个入口', 'v1.7 prototype · four entry points'],
   'items': [('fridge/cf-home', ['在冰箱前：只做这一刻需要的事', 'At the fridge: only what this moment needs']), ('fridge/cf-add', ['放进去：记下一个计划', 'Put in: record a plan'])],
   'caption': ['不再要求完整库存，而是在四个具体时刻提供帮助。', 'Instead of a complete inventory, help at four concrete moments.']},
 ],
 ('commons-fridge', 3): [
  {'kind': 'image', 'src': 'fridge/sub-failures', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['九种共享冰箱失灵的方式 · 提交稿 L09', 'Nine ways a shared fridge fails · submission L09'],
   'caption': ['每张卡是一种跨访谈出现的失效方式；卡片底下的编号（例如 U02 · U05）是它出自哪几场访谈。', 'Each card is a failure pattern seen across interviews; the codes underneath (for example U02 · U05) name the interviews that produced it.']},
  {'kind': 'image', 'src': 'fridge/sub-failure-to-feature', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['每个失效点，对应做出来的一样东西 · 提交稿 L10', 'What was built in answer to each failure · submission L10'],
   'caption': ['从左到右读一行：失效点、原型里回应它的那样东西、在哪一版做出来。', 'Read a row left to right: the failure, the thing in the build that answers it, and the version it shipped in.']},
 ],
 ('commons-fridge', 4): [
  {'kind': 'phones', 'prov': 'original', 'project': 'fridge', 'n': 2,
   'label': ['House 视图 · 位置、归属与权限', 'House view · location, ownership and permission'],
   'items': [('fridge/cf-house', ['按区域分组，而不是按人', 'Grouped by area, not by person']), ('fridge/cf-found', ['发现物品：保留“不确定是谁的”', 'Found something: keep “not sure whose”'])],
   'caption': ['看得见不等于有权处理：未认领的物品保持“不确定”，直到有人明确声明。', 'Seeing something does not grant permission: an unclaimed item stays “not sure whose” until someone explicitly claims it.']},
 ],
 ('commons-fridge', 5): [
  {'kind': 'image', 'src': 'fridge/photo-touch', 'prov': 'photo', 'project': 'fridge', 'narrow': True,
   'label': ['冰箱门上的实体入口 · 研究者演示', 'Physical entry on the fridge door · researcher demo'],
   'caption': ['在真实厨房里：碰一下冰箱门上的入口，手机打开对应页面。', 'In a real kitchen: touching the entry on the fridge door opens the matching phone route.']},
  {'kind': 'penguins', 'prov': 'original', 'project': 'fridge',
   'label': ['企鹅角色 · 邀请 / 确认 / 发现', 'Penguin character · invite / acknowledge / found'],
   'items': [('fridge/penguin-add', ['邀请一个动作', 'Invite an action']), ('fridge/penguin-received', ['确认一条记录', 'Acknowledge a record']), ('fridge/penguin-manage', ['一起查看', 'Check together']), ('fridge/penguin-found', ['发现了东西', 'Found something'])],
   'caption': ['用 AI 辅助探索后，我挑选并精修成一套一致的角色，每个表情对应一种交互时刻。', 'Explored with AI assistance, then selected and refined into one consistent character; each expression maps to an interaction moment.']},
  {'kind': 'image', 'src': 'fridge/sub-refusals', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['否掉一张图的三个理由 · 提交稿 L15', 'Three documented reasons for refusing a render · submission L15'],
   'caption': ['取自生成记录，不是凭记忆。五个文件里有两个根本不是设计方向，而是想得到真正的透明背景时失败的尝试；最终稿放弃了透明，统一用一种米白底色。', 'Taken from the generation record, not from memory. Two of the five files are not design directions at all — they are failed attempts to get a genuine transparent background; the final sources abandoned transparency and use one uniform off-white.']},
  {'kind': 'image', 'src': 'fridge/sub-rounds', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['四轮修改，每一轮被要求改什么 · 提交稿 L16', 'Four rounds, and what each one was told to fix · submission L16'],
   'caption': ['第 3 轮先定下优先级：性格第一，关系第二，吉祥物感最后。第 4a 轮把全身比例改成大头比例。第 4b 轮只用不透明的平涂色块，这一版被选中，进入表情系统和印刷件。', 'Round 3 set an explicit hierarchy: personality, then relationship, then mascot. Round 4a replaced the full-body default with a head-led proportion. Round 4b uses strictly opaque flat fills — the version selected and carried into the expression system and the printed pieces.']},
 ],
 ('commons-fridge', 7): [
  {'kind': 'image', 'src': 'fridge/sub-test-not-run', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['一套备好的比较测试 · 提交稿 L19', 'A comparison test, printed and ready · submission L19'],
   'caption': ['评估材料是齐的：参与者说明、观察表、评分表、NFC 读取测试表、三种顺序的卡片和选择矩阵。获批的伦理路线只覆盖关于已有习惯的访谈，所以这套测试留到下一轮。', 'The evaluation kit is complete — participant instructions, an observer sheet, a rating sheet, an NFC read-test sheet, sequence cards in three orders and a selection matrix. The approved ethics route covered interviews about existing habits, so this test is for the next round.']},
  {'kind': 'image', 'src': 'fridge/penguin-motion', 'prov': 'original', 'project': 'fridge', 'pad': True,
   'label': ['展览动态研究 · 2026 年 9 月', 'Exhibition motion study · September 2026'],
   'caption': ['角色的下一步：把邀请与确认做成触觉和动态反馈。', 'Next for the character: turning invite and acknowledge into tactile and motion feedback.']},
 ],
}
