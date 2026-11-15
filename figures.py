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
}

# (slug, section number) -> list of figures
FIGURES = {
 # ---------------- Qingju ----------------
 ('qingju', 2): [
  {'kind': 'image', 'src': 'qingju/research', 'prov': 'research', 'project': 'qingju',
   'label': ['访谈摘要 · 2021 原稿（中文）', 'Interview summary · 2021 original (Chinese)'],
   'alt': ['2021 年访谈摘要原稿（中文）：访谈提纲说明；11 位受访者关键表述的气泡；一个标为“没有注意过用户成长体系”的百分比；以及两组关键词——成长体系关注点（权益、优惠、收集、社交）与休闲骑行影响因素（自我情感、社交、环境）。', 'Original 2021 interview summary, in Chinese: the interview guide; speech bubbles with key remarks from 11 interviewees; a percentage labelled “had not noticed the growth system”; and two keyword chains — what riders look for in a growth system (status, discounts, collecting, sharing) and what shapes a leisure ride (personal feelings, social needs, environment).'],
   'caption': ['研究摘要原稿（中文）。11 位受访者、85 份有效问卷为作品集文字记载，原始记录未核实。图中“90%”排在访谈结果一栏，据我 2026 年确认，它的分母是 85 份有效问卷。研究聚焦休闲场景，不代表所有骑行人群。', 'Original research summary (in Chinese). The 11 interviews and 85 valid questionnaire responses are as recorded in the original portfolio; raw records have not been verified. The “90%” sits among the interview results, but its base, as I confirmed in 2026, is the 85 valid questionnaire responses. The study focused on leisure riding and does not represent all riders.']},
  {'kind': 'image', 'src': 'qingju/field', 'prov': 'photo', 'project': 'qingju',
   'label': ['实地观察 · 武汉藏龙岛湿地公园', 'Field observation · Canglongdao Wetland Park, Wuhan'],
   'caption': ['实地观察（2021-05-09 18:00–19:30，武汉藏龙岛湿地公园）：现场投放的车多、在骑的少，这是一次观察，没有计数。团队当时推断原因是产品在休闲场景缺少引导与关联，这一推断没有经过验证。', 'Field observation (9 May 2021, 18:00–19:30, Canglongdao Wetland Park, Wuhan): many bikes deployed, few in use, from a single visit with no counts recorded. The team inferred that the product offered little guidance or relevance in this setting; that inference was not tested.']},
 ],
 ('qingju', 3): [
  {'kind': 'image', 'src': 'qingju/journey', 'prov': 'research', 'project': 'qingju',
   'label': ['用户旅程图 · 骑行前 / 中 / 后', 'Journey map · before / during / after'],
   'caption': ['原始旅程图：行为与机会的综合，不是对情绪的量化测量。', 'Original journey map: a synthesis of behaviours and opportunities, not a quantitative measurement of emotion.']},
 ],
 ('qingju', 4): [
  {'kind': 'image', 'src': 'qingju/lofi-board', 'prov': 'wire', 'project': 'qingju', 'bg': '#4F4F4F',
   'label': ['低保真原型板 · 21 个界面', 'Low-fidelity board · 21 screens'],
   'alt': ['21 个灰度低保真界面，三行连线。第一行是主流程：地图发现路线、路线预览、路线详情、骑行中、结束骑行获得金币、骑行汇总、写下感受。第二行是店铺地图、路线讨论圈、宝库、宝箱升级、获得风景卡、获得店铺券、发布成功。第三行是个人中心、优惠券条码、我的风景卡、骑行回忆列表与详情。', 'Twenty-one greyscale wireframes in three connected rows. Row one is the main flow: discover a route on the map, preview, route detail, riding, end of ride with coins, ride summary, write a note. Row two covers the shop map, route discussion, treasure vault, chest upgrade, scenery-card and shop-coupon rewards, and the published post. Row three covers the profile menu, coupon barcode, scenery-card collection, and the ride-memory list and detail.'],
   'caption': ['完整的低保真原型板（2021，本人完成）。上方原型走的是第一行主流程。界面里的次数、金币、金额和掉率都是原型占位数据，不是统计结果。', 'The full low-fidelity board (2021, my work). The prototype above follows the first row, the main flow. Counts, coins, prices and drop rates shown in the screens are placeholder content, not data.']},
 ],
 ('qingju', 6): [
  {'kind': 'phones', 'prov': 'team', 'project': 'qingju', 'n': 2,
   'label': ['团队高保真 · 在研究之上完成', 'Team high fidelity · built on the research'],
   'items': [('qingju/team-memory', ['骑行回忆', 'Ride memories'])],
   'caption': ['最终高保真由团队完成，展示研究结论如何被带进界面；不是我的视觉设计。', 'The final high fidelity was a team output, shown to trace how the research carried into the interface — it is not my visual design.']},
  # 2026-11-16（卡 042）：横向三屏拼图不进手机条，单独一条 image，按原比例完整显示（原图宽 1200，正文栏 936，不放大）
  {'kind': 'image', 'src': 'qingju/team-route', 'prov': 'team', 'project': 'qingju',
   'label': ['团队高保真 · 路线发现与讨论圈', 'Team high fidelity · route discovery & discussion'],
   'alt': ['三屏拼在一起的团队高保真：左边是某条路线的讨论圈，中间是路线详情（途经风景、里程、照片、他人感受和“去骑车”按钮），右边是收起后的路线卡。', 'Three team high-fidelity screens shown together: a route’s discussion feed on the left, the route detail in the middle (sights, distance, photos, riders’ notes and a “Ride” button), and the collapsed route card on the right.'],
   'caption': ['团队完成的高保真，三屏拼在一起：路线讨论圈、路线详情、收起后的路线卡。它展示研究结论怎样被带进界面，不是我的视觉设计。界面里的人数、点赞数和里程是占位内容，不是数据。', 'High fidelity by the team, three screens shown together: the route discussion feed, the route detail and the collapsed route card. It shows how the research carried into the interface; it is not my visual design. Rider counts, likes and distances in the screens are placeholder content, not data.']},
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
 # 2026-11-15 加：'fridge/sub-*' 八张取自最终提交稿（23 页横版 PDF）的原页，页码写在 label 里；来源见 docs/sources.md
 ('commons-fridge', 1): [
  {'kind': 'image', 'src': 'fridge/sub-chain', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['从访谈到功能的推导链 · 提交稿 L02', 'How each step produced the next · submission L02'],
   'caption': ['七步：五场访谈 → 行为卡 → 四个画像 → 旅程与情绪 → 失效点 → 设计原则 → 功能与角色。前五步来自访谈；后两步是我自己的判断，没有参与者用过任何原型。', 'Seven steps, from five interviews to features and character. Steps 01–05 rest on the interviews; steps 06–07 are my own decisions — no participant used any prototype.']},
  {'kind': 'image', 'src': 'fridge/research', 'prov': 'research', 'project': 'fridge', 'pad': True,
   'label': ['五场共享冰箱习惯访谈 · U01–U05', 'Five shared-fridge habit interviews · U01–U05'],
   'caption': ['访谈卡片（中文原稿）。这些是个人叙述，不是统计结论。', 'Interview cards (Chinese originals). These are individual accounts, not statistics.']},
  {'kind': 'image', 'src': 'fridge/sub-personas', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['四个行为情境画像 · 提交稿 L04', 'Four behavioural personas · submission L04'],
   'caption': ['画像描述的是情境，不是人格类型：同一个人会随住处、层架规则和关系的变化在它们之间移动。图里的人像是示意插画，不是受访者；年龄、职业和外貌是为了讨论设计做的情境假设，不是研究发现。', 'These are situations, not personality types: the same person moves between them when the home, the shelf rules or the relationships change. The portraits are illustrations, not participants; age, occupation and appearance are situational assumptions, not research findings.']},
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
   'caption': ['从左到右读一行：失效点、原型里回应它的那样东西、在哪一版做出来。底部那句是提交稿自己写的：这些是回应，不是证明，没有一项经过参与者测试。', 'Read a row left to right: the failure, the thing in the build that answers it, and the version it shipped in. The note at the bottom is from the submission itself: these are answers, not proofs, and none has been tested with a participant.']},
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
   'caption': ['在真实厨房里：碰一下冰箱门上的入口，手机打开对应页面。这是研究者演示，不是参与者可用性测试。', 'In a real kitchen: touching the entry on the fridge door opens the matching phone route. A researcher demonstration, not a participant usability test.']},
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
   'label': ['一套印好了、没有跑的比较测试 · 提交稿 L19', 'A comparison test, printed and never run · submission L19'],
   'caption': ['评估材料是齐的：参与者说明、观察表、评分表、NFC 读取测试表、三种顺序的卡片和选择矩阵；结果文件里只有表头。没跑的原因：获批的伦理路线只覆盖关于已有习惯的访谈，让参与者接触设计不在范围内，截止前来不及申请修订。', 'The evaluation kit is complete — participant instructions, an observer sheet, a rating sheet, an NFC read-test sheet, sequence cards in three orders and a selection matrix — and the results file holds only its header. It stayed empty because the approved ethics route covered interviews about existing habits; putting participants in front of the design was outside it, and there was no time to seek an amendment before the deadline.']},
  {'kind': 'image', 'src': 'fridge/penguin-motion', 'prov': 'original', 'project': 'fridge', 'pad': True,
   'label': ['展览动态研究 · 2026 年 9 月', 'Exhibition motion study · September 2026'],
   'caption': ['角色的下一步：把邀请与确认做成触觉和动态反馈。', 'Next for the character: turning invite and acknowledge into tactile and motion feedback.']},
 ],
}
