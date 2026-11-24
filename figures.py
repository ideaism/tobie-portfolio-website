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
    'diagram': (['按项目记录绘制', 'Drawn from project records'], ''),   # 2026-11-17，Agent Matrix：照项目自己的记录（分工表、复盘、审核卡、台账）画的图，不是界面截图
    'cover-ill': (['原始界面 + 生成插画', 'Original UI + AI illustration'], ''),   # 2026-11-18 卡 20261118-013：封面底图/图标是 Figma AI 生成的装饰，界面是原图
    'cover-gen': (['生成插画', 'AI illustration'], ''),   # 2026-11-18 卡 20261118-017：兴业 SMT 封面只有文字和 Figma AI 生成的 3D 图标，没有界面
}

# (slug, section number) -> list of figures
FIGURES = {
 # ---------------- Qingju ----------------
 # 2026-11-16 夜（交接单 2g）：01、04 节的三张 2021 原稿配图；label / alt / caption 照交接单
 # 2026-11-17（卡 20261117-002「可以的话把白底去掉」）：三张原图白底换成页面底色 #ECF0ED，图框跟着用 'bg' + 'flat'（和 07 节两张一样）
 ('qingju', 1): [
  {'kind': 'image', 'src': 'qingju/growth-system-2021', 'prov': 'research', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['成长体系痛点分析 · 2021（中文）', 'Growth-system pain points · 2021 (Chinese)'],
   'alt': ['2021 原稿「成长体系痛点分析」：左边三条问题，层级深、模块多、感知度弱；右边一张结构图，入口、成长形式、出口三列，任务中心、骑行累积、每日签到三个入口各自连到“达成特定成就”。', 'The 2021 “growth-system pain points” page: three problems on the left (too deep, too many modules, low visibility) and a diagram on the right with three columns (entry, mechanism, outcome), where the task centre, ride accumulation and daily check-in each lead separately to an achievement.'],
   'caption': ['2021 年对当时青桔成长体系的梳理：任务中心、骑行累积、每日签到三个入口，各自通向“达成特定成就”，彼此不相连。问题归为三点：层级深、模块多（任务、等级、勋章、积分四套）、感知弱。', 'A 2021 map of Qingju’s growth system at the time: three entry points (task centre, ride accumulation, daily check-in) each lead separately to “achievement unlocked”, with nothing linking them. Three problems are named: buried too deep, too many modules (tasks, levels, badges, points) and low visibility.']},
  {'kind': 'image', 'src': 'qingju/active-user-stages-2021', 'prov': 'research', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['定义活跃用户 · 2021（中文）', 'Defining an active rider · 2021 (Chinese)'],
   'alt': ['2021 原稿「定义活跃用户」：四列阶段，试用单车（1–3 天）、体验骑行（7 天）、习惯使用（30 天）、分享推荐（3 个月以上）；每列往下是主要指标和主要标准；最下面归成潜力用户、活跃用户、忠实用户。', 'The 2021 “defining an active rider” page: four stage columns, trial (days 1–3), first rides (day 7), habit (day 30) and advocacy (three months and beyond), each with indicators and a threshold beneath; at the bottom, riders are grouped as potential, active or loyal.'],
   'caption': ['把“提高活跃度”拆成四个阶段：试用单车（1–3 天）、体验骑行（7 天）、习惯使用（30 天）、分享推荐（3 个月以上）。每个阶段写了主要指标和判断标准，再归成潜力、活跃、忠实三类用户。', 'The brief to “increase engagement”, broken into four stages: trial (days 1–3), first rides (day 7), habit (day 30) and advocacy (three months and beyond). Each stage has indicators and a threshold, and riders are grouped as potential, active or loyal.']},
  # 2026-11-18 本人在看板上说「完成这部分」；场景图是 Figma 2206:20030 2 倍导出去白底；画像文字照 2206:20310 原稿，原稿的网上照片换成 AI 头像（本人选的）。
  {'kind': 'image', 'src': 'qingju/scenarios-2021', 'prov': 'research', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['核心使用场景 · 2021（中文）', 'Core riding scenarios · 2021 (Chinese)'],
   'alt': ['2021 原稿「核心使用场景」：左边是场景需求分类柱状图，从高到低是上下班、购物逛街、运动、景区旅游、上学、其他；下面两个数字，74.8% 是上下班和上学的通勤需求比例，118.7% 是购物逛街、运动和景区的休闲需求比例；右边一段结论：休闲场景占比较高，用户骑车的增量空间在休闲时间；最下面是 95 后和 00 后的兴趣圈层。', 'The 2021 “core riding scenarios” page: on the left, a bar chart of riding scenarios from most to least chosen — commuting to work, shopping, exercise, sightseeing, getting to school, other; beneath it two figures, 74.8% for commuting to work and school and 118.7% for shopping, exercise and sightseeing; on the right, the conclusion that leisure scenarios rank high and the room for more riding lies in leisure time; at the bottom, the interest circles of riders born after 1995 and after 2000.'],
   'caption': ['团队问卷里的场景需求（多选，所以各项相加会超过 100%）：上下班和上学两项通勤合计 74.8%，购物逛街、运动、景区三项休闲合计 118.7%。通勤时间是固定的，骑行的增量在休闲时间；95 后、00 后的兴趣圈层里，体育、健身、美拍这类提升自我的爱好排在前面。', 'Riding scenarios from the team’s questionnaire (multiple choice, so the options add up to more than 100%): commuting to work and to school together come to 74.8%; shopping, exercise and sightseeing together come to 118.7%. Commutes follow a fixed timetable, so the room for more riding lies in leisure time; among riders born after 1995 and after 2000, self-improving hobbies such as sport, fitness and photography lead their interest circles.']},
 ],
 ('qingju', 2): [
  {'kind': 'image', 'src': 'qingju/research', 'prov': 'research', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['访谈摘要 · 2021（中文）', 'Interview summary · 2021 (Chinese)'],
   'alt': ['2021 年访谈摘要原稿（中文）：访谈提纲说明；11 位受访者关键表述的气泡；一个标为“没有注意过用户成长体系”的百分比；以及两组关键词——成长体系关注点（权益、优惠、收集、社交）与休闲骑行影响因素（自我情感、社交、环境）。', 'Original 2021 interview summary, in Chinese: the interview guide; speech bubbles with key remarks from 11 interviewees; a percentage labelled “had not noticed the growth system”; and two keyword chains — what riders look for in a growth system (status, discounts, collecting, sharing) and what shapes a leisure ride (personal feelings, social needs, environment).'],
   'caption': ['研究摘要原稿（中文），聚焦休闲骑行场景。', 'Original research summary (in Chinese), focused on leisure riding.']},
  {'kind': 'image', 'src': 'qingju/field', 'prov': 'photo', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['实地观察 · 武汉藏龙岛湿地公园', 'Field observation · Canglongdao Wetland Park, Wuhan'],
   'caption': ['实地观察（2021-05-09 18:00–19:30，武汉藏龙岛湿地公园）：现场投放的车多、在骑的少。', 'Field observation (9 May 2021, 18:00–19:30, Canglongdao Wetland Park, Wuhan): many bikes deployed, few in use.']},
 ],
 ('qingju', 3): [
  # 2026-11-18 本人在看板上说「完成这部分」；场景图是 Figma 2206:20030 2 倍导出去白底；画像文字照 2206:20310 原稿，原稿的网上照片换成 AI 头像（本人选的）。2026-11-18 卡 20261118-026 本人意见：不写 AI 生成、不写重新排版，来源标签用「研究材料」。
  {'kind': 'image', 'src': 'qingju/personas-zh', 'src_en': 'qingju/personas-en', 'prov': 'research', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['用户画像 · 三类休闲骑行者', 'Personas · three kinds of leisure rider'],
   'alt': ['三个用户画像：杨志豪，27 岁，一级用户，游览记录型；郭嘉欣，22 岁，二级用户，社交分享型；林小琳，22 岁，三级用户，逛街探店型。每人一行，写着决策力、诉求、痛点各三到四条。', 'Three personas: Yang Zhihao, 27, primary persona, the explore-and-record rider; Guo Jiaxin, 22, secondary persona, the social sharer; Lin Xiaolin, 22, tertiary persona, the shop explorer. Each row lists three or four points under what they decide on, what they want and their pain points.'],
   'caption': ['三类休闲骑行者的画像（2021），由访谈和问卷综合而来：游览记录型、社交分享型、逛街探店型，各自写了决策力、诉求和痛点。', 'Personas for three kinds of leisure rider (2021), synthesised from the interviews and questionnaire: the explore-and-record rider, the social sharer and the shop explorer, each with what they decide on, what they want and their pain points.']},
  {'kind': 'image', 'src': 'qingju/journey', 'prov': 'research', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['用户旅程图 · 游览记录型（杨志豪）', 'Journey map · explore-and-record rider, Yang Zhihao'],
   'caption': ['原始旅程图：行为与机会的综合。', 'Original journey map: a synthesis of behaviours and opportunities.']},
  {'kind': 'image', 'src': 'qingju/journey-guo', 'prov': 'research', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['用户旅程图 · 社交分享型（郭嘉欣）', 'Journey map · social sharer, Guo Jiaxin (Chinese)'],
   'caption': ['约男朋友去湿地公园：两个人很难同时找到车，骑久了累，不知道哪里适合拍照。机会点落在推荐拍照位置和热门场景信息。',
               'A ride with her boyfriend to a wetland park: two bikes are hard to find at once, a long ride gets tiring, and she can’t tell where the good photo spots are. The opportunities: suggest photo spots and show which places are popular.']},
  {'kind': 'image', 'src': 'qingju/journey-lin', 'prov': 'research', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['用户旅程图 · 逛街探店型（林小琳）', 'Journey map · shop explorer, Lin Xiaolin (Chinese)'],
   'caption': ['约好友去小红书上的热门店：小店导航不准，店铺太远。机会点落在推荐附近店铺、快到时提醒、店铺带清晰图片和准确定位。',
               'A ride with a friend to a shop trending on Xiaohongshu: navigation can’t find small shops and the shop is far away. The opportunities: suggest nearby shops, remind her when she is close, and give each shop clear photos and an exact location.']},
 ],
 ('qingju', 4): [
  {'kind': 'image', 'src': 'qingju/user-flow-2021', 'prov': 'research', 'project': 'qingju', 'bg': '#ECF0ED', 'flat': True,
   'label': ['用户流程 · 2021（中文）', 'User flow · 2021 (Chinese)'],
   'alt': ['2021 原稿「用户流程」流程图：选择路线或店铺、扫码开始骑行、结束骑行、获得宝藏、前往宝库查看、使用金币升级宝箱；下方分支是合并路线、发布骑行感受、发布至讨论圈或查看骑行回忆，以及查看风景卡和优惠券。', 'The 2021 user-flow chart: choose a route or shop, scan to start, end the ride, receive treasure, open the vault, upgrade chests with coins; lower branches cover merging routes, writing up the ride, publishing to the route discussion or viewing ride memories, and viewing scenery cards and coupons.'],
   'caption': ['低保真之前的整条路径：选择路线或店铺 → 扫码骑行 → 结束骑行 → 获得宝藏（优惠券、风景卡、金币）→ 去宝库查看 → 用金币升级宝箱。另一支是记录：可以合并多条路线，发布骑行感受，公开的进讨论圈，不公开的进骑行回忆。', 'The whole path before wireframing: choose a route or shop → scan and ride → end the ride → receive treasure (coupons, scenery cards, coins) → open the vault → upgrade chests with coins. A second branch covers recording: merge several routes, write up the ride, then publish it to the route discussion or keep it in ride memories.']},
  {'kind': 'image', 'src': 'qingju/lofi-board', 'prov': 'wire', 'project': 'qingju', 'bg': '#4F4F4F',
   'label': ['低保真原型板 · 21 个界面', 'Low-fidelity board · 21 screens'],
   'alt': ['21 个灰度低保真界面，三行连线。第一行是主流程：地图发现路线、路线预览、路线详情、骑行中、结束骑行获得金币、骑行汇总、写下感受。第二行是店铺地图、路线讨论圈、宝库、宝箱升级、获得风景卡、获得店铺券、发布成功。第三行是个人中心、优惠券条码、我的风景卡、骑行回忆列表与详情。', 'Twenty-one greyscale wireframes in three connected rows. Row one is the main flow: discover a route on the map, preview, route detail, riding, end of ride with coins, ride summary, write a note. Row two covers the shop map, route discussion, treasure vault, chest upgrade, scenery-card and shop-coupon rewards, and the published post. Row three covers the profile menu, coupon barcode, scenery-card collection, and the ride-memory list and detail.'],
   'caption': ['完整的低保真原型板（2021，本人完成）。上方原型走的是第一行主流程。', 'The full low-fidelity board (2021, my work). The prototype above follows the first row, the main flow.']},
 ],
 # 2026-11-17（卡 20261117-021 选 A，交接单 3c）：06 节改成四块，按一次骑行的先后：寻宝地图 → 路线发现与讨论圈 → 宝库与宝箱 → 记录与回忆
 # 2026-11-18（卡 20261118-003 本人打回：背景和网站统一，不要一黑一块白一块）：前三块图的底色都换成 #F6F8F6，和第 4 块手机条同一个底
 ('qingju', 6): [
  {'kind': 'image', 'src': 'qingju/team-treasure-map', 'prov': 'team', 'project': 'qingju', 'bg': '#F6F8F6', 'narrow': True,
   'label': ['团队高保真 · 寻宝地图', 'Team high fidelity · treasure map'],
   'alt': ['两屏叠放的高保真：前面是美景地图，路线沿途标着不同等级的宝箱；后面是美食地图，店铺围成的范围中间有一个宝箱。底部分栏选中“寻找宝藏”。', 'Two high-fidelity screens, overlapping: in front, the scenery map with chests of different tiers along its routes; behind, the food map, where a chest sits inside a cluster of shops. The bottom tab “Find treasure” is selected.'],
   'caption': ['寻宝地图放在首页的一级分栏里。美景地图按路线走，骑完一条路线开宝箱；美食地图按范围打卡，到范围内任意一家店就算完成。', 'The treasure map sits in a first-level tab on the home screen. The scenery map works by route: finish a route to open its chest. The food map works by area: reach any shop inside the area to check in.']},
  # 2026-11-16（卡 042）：横向三屏拼图不进手机条，单独一条 image，按原比例完整显示（原图宽 1200，正文栏 936，不放大）
  {'kind': 'image', 'src': 'qingju/team-route', 'prov': 'team', 'project': 'qingju', 'bg': '#F6F8F6',
   'label': ['团队高保真 · 路线发现与讨论圈', 'Team high fidelity · route discovery & discussion'],
   'alt': ['三屏拼在一起的团队高保真：左边是某条路线的讨论圈，中间是路线详情（途经风景、里程、照片、他人感受和“去骑车”按钮），右边是收起后的路线卡。', 'Three team high-fidelity screens shown together: a route’s discussion feed on the left, the route detail in the middle (sights, distance, photos, riders’ notes and a “Ride” button), and the collapsed route card on the right.'],
   'caption': ['团队完成的高保真，三屏拼在一起：路线讨论圈、路线详情、收起后的路线卡。', 'High fidelity by the team, three screens shown together: the route discussion feed, the route detail and the collapsed route card.']},
  {'kind': 'image', 'src': 'qingju/team-vault', 'prov': 'team', 'project': 'qingju', 'bg': '#F6F8F6',
   'label': ['团队高保真 · 宝库与宝箱', 'Team high fidelity · vault and chests'],
   'alt': ['左边是宝库一屏：顶部是金币数，中间是当前的骑行宝箱和升级按钮，下面是“我的优惠券”和“我的风景卡”两个分栏。右边是金、银、铜三个等级的宝箱。', 'On the left, the vault screen: the coin balance at the top, the current ride chest with an upgrade button in the middle, and two tabs below, “My coupons” and “My scenery cards”. On the right, the three chest tiers: gold, silver and bronze.'],
   'caption': ['骑行结束后，金币、店铺券和风景卡都收进宝库。金币可以用来升级宝箱，宝箱分金、银、铜三级。', 'After a ride, coins, shop coupons and scenery cards all land in the vault. Coins upgrade the chest, which comes in three tiers: gold, silver and bronze.']},
  {'kind': 'phones', 'prov': 'team', 'project': 'qingju', 'n': 4,
   'label': ['团队高保真 · 记录与回忆', 'Team high fidelity · recording and memories'],
   'items': [('qingju/team-publish', ['发布成功', 'Published']),
             ('qingju/team-merge', ['合并发布', 'Merge and publish']),
             ('qingju/team-memory-list', ['回忆列表', 'Memory list']),
             ('qingju/team-memory', ['骑行回忆', 'Ride memories'])],
   'caption': ['骑行结束后可以把多条路线合并成一篇发布。骑行回忆里每次骑行一张卡，有风景卡的用风景卡做封面，点开能看到感受、照片和路线。', 'After a ride, several routes can be merged into one post. In ride memories each ride is a card, with a scenery card as its cover when there is one; opening it shows the note, photos and route.']},
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
   'wide': ('playbook/studio-campaign', ['Studio：配置活动、任务、物品与配方', 'Studio: configure campaigns, tasks, items and recipes']),
   'phone': ('playbook/app-missions', ['App：参与任务', 'App: take part in missions']),
   'caption': ['左：创作者端 Studio 活动页原稿。右：粉丝端 App 任务页的 UX 稿。', 'Left: the creator-side Studio campaign page. Right: the fan-side App missions screen, UX version.']},
 ],
 # 2026-11-16：新增 02「用户与动线」、07「收藏与展示」，原 02–06 顺延为 03–06、08（07 这一批没有图）
 ('playbook', 2): [
  # 动线图中英文各一张：'src' 是中文页用的，'src_en' 是英文页用的（build.py figure_html 按语言取）
  {'kind': 'image', 'src': 'playbook/flow-before-after-zh', 'src_en': 'playbook/flow-before-after-en', 'prov': 'mixed', 'project': 'playbook',
   'label': ['用户动线 · 从五个平行视图到一条链路', 'User flow · from five parallel views to one loop'],
   'alt': ['用户动线前后对比：上半是客户方需求文档里的五个平行视图，下半是我按一次回访整理的五步参与链路', 'User flow before and after: the client’s five parallel views above, and the five-step participation loop I organised around a single visit below'],
   'caption': ['上：客户方需求文档里的 App 结构。下：我按粉丝一次回访整理的参与链路，每个节点对应一组 App 中保真线框。', 'Top: the app structure in the client’s requirements. Bottom: the participation loop I organised around one fan visit; each node maps to a set of mid-fidelity wireframes.']},
  # 功能架构图：内容是 2024 年秋整理作品集时画的；2026-11-17 照原图重画，只换呈现方式（卡 20261117-001），中英文各一张
  {'kind': 'image', 'src': 'playbook/feature-map-zh', 'src_en': 'playbook/feature-map-en', 'prov': 'research', 'project': 'playbook',
   'label': ['App 功能架构图 · 2024 年整理', 'App feature map · compiled in 2024'],
   'alt': ['功能树：主页面、物品百科、物品合成、社区、任务五个入口，以及个人主页、搜索、通知，各自展开到下一级页面', 'A feature tree: Home, Item catalogue, Crafting, Community and Missions, plus Profile, Search and Notifications, each expanded to its sub-pages'],
   'caption': ['App 的功能架构：五个入口，加上个人主页、搜索和通知。2024 年秋整理。', 'The app’s feature map: five entry points plus profile, search and notifications. Compiled in autumn 2024.']},
 ],
 # 2026-11-24（交接单 ⑧）：起草助手从第 11 节挪到 04（没有图，演示挂在 prototypes.py section_demo），原 4–10 键顺延为 5–11
 ('playbook', 5): [
  # 2026-11-16 第三批：加熔炉废案稿。它是 390×1080 的长屏，熔炉在最底部，不能裁成一屏高，放在 'whole'（整张显示），
  # 第三项 1 是它在这一排里的位置：早期 UI 之后、配方列表之前。五张排一排。
  {'kind': 'phones', 'prov': 'mixed', 'project': 'playbook', 'n': 5,
   'label': ['合成界面的演变 · 谁做了什么', 'How the crafting screen evolved · who did what'],
   'items': [('playbook/early-ui', ['早期 UI · 另一位设计师', 'Early UI · another designer']), ('playbook/cauldron-list', ['配方列表 · 我的 UX', 'Recipe list · my UX']), ('playbook/app-craft-ready', ['配方详情 · 我的 UX', 'Recipe detail · my UX']), ('playbook/team-inventory', ['完成的 UI · 团队', 'Completed UI · the team'])],
   'whole': [('playbook/app-furnace-draft', ['废案 · 把材料拖进熔炉', 'Dropped · drag materials into a furnace'], 1)],
   'caption': ['早期视觉确立了方向。我先画了把材料拖进熔炉的版本，评审后改成配方列表和配方详情；最终视觉由团队完成。', 'The early UI set a visual direction. I first drew a version where materials are dragged into a furnace, then moved to a recipe list and recipe detail after review. The final visual design was a team effort.']},
 ],
 ('playbook', 6): [
  {'kind': 'phones', 'prov': 'original', 'project': 'playbook', 'n': 4,
   'label': ['创作者上下文与搜索', 'Creator context and search'],
   'items': [('playbook/app-home', ['首页：上下文与进度', 'Home: context + progress']), ('playbook/app-inventory', ['背包：相关物品', 'Inventory: related items']), ('playbook/app-search', ['全局搜索：分类筛选', 'Global search: categories']), ('playbook/app-search-creators', ['搜索结果：创作者', 'Results: creators'])],
   'caption': ['日常任务保留创作者上下文；2023 年 10 月的评审后，搜索改为跨社区的全局入口。', 'Everyday tasks keep the creator context; after the October 2023 review, search became a global, cross-community entry point.']},
 ],
 ('playbook', 7): [
  # 2026-11-16（卡 20261115-026 选 B）：奖励弹窗是 330×453 的弹窗局部，不是整屏，从 items 挪到 partials：
  # 不加 screen 类，按原比例完整显示（见 build.py figure_html）。第三批换成 2 倍图（660×906），'cap' 把显示宽度上限留在 330；
  # 首页和弹窗之间加一张「领取之后」。
  {'kind': 'phones', 'prov': 'original', 'project': 'playbook', 'n': 3,
   'label': ['反馈的分量 · 轻提示与领取弹窗', 'Weight of feedback · light cue vs claim dialog'],
   'items': [('playbook/app-home', ['日常进度：+5 · 2m 的小提示', 'Routine progress: a small “+5 · 2m” cue']), ('playbook/app-home-events-only', ['领取之后：每日任务离开首页', 'After claiming: daily tasks leave Home'])],
   'partials': [('playbook/app-reward', ['重要奖励：Acquire items 领取', 'A significant reward: “Acquire items”'])],
   'cap': {'playbook/app-reward': 330},
   'caption': ['日常的小进度贴在任务旁边；只有值得停下来的奖励才用弹窗和一次明确的领取。', 'Routine progress stays next to the task; only a reward worth pausing for gets a dialog and a deliberate claim.']},
 ],
 # 2026-11-16 第三批：07 节加展示柜四个状态；新增 08「交易与交换」，原 08「交付与反思」顺延为 09
 ('playbook', 8): [
  # 「推荐选择」那张是 390×770，不是整屏，放在 'whole'（不套竖屏框，按原比例整张显示），第三项 1 是它在这一排里的位置
  {'kind': 'phones', 'prov': 'original', 'project': 'playbook', 'n': 4,
   'label': ['展示柜的四个状态', 'Four showcase states'],
   'items': [('playbook/app-showcase-empty', ['未填充：空架子和“一键展示”', 'Empty: a bare shelf and “One-click Show”']), ('playbook/app-showcase-filled', ['已填充', 'Filled']), ('playbook/app-showcase-visitor', ['访客视角：共同关注的创作者', 'Visitor’s view: creators you both follow'])],
   'whole': [('playbook/app-showcase-pick', ['推荐选择：从背包里推荐', 'Choosing: recommended from the inventory'], 1)],
   'caption': ['展示柜从空架子开始：点“一键展示”，系统从背包里推荐物品，选好后出现在个人主页上；别人来访时还能看到共同关注的创作者。', 'The showcase starts as an empty shelf. “One-click Show” recommends items from the inventory; once chosen they appear on the profile, and visitors also see the creators you both follow.']},
 ],
 ('playbook', 9): [
  # 交易市场和以物换物各四屏，1 倍图（390 宽），2 倍图以后再换。
  # 七张 390×868 的屏只比竖屏框（390:844）高 3%，但底部正好是操作按钮（Refuse / Accept、List、Sure…），
  # 套竖屏框会把按钮切掉一半，所以放在 'whole' 里整张显示；只有 390×1203 的社区首页照常裁成一屏高。
  {'kind': 'phones', 'prov': 'wire', 'project': 'playbook', 'n': 4,
   'label': ['交易市场 · 线框', 'Marketplace · wireframes'],
   'items': [('playbook/app-market-home', ['社区首页：市场和以物换物的入口', 'Community home: entry to Market and Barter'])],
   'whole': [('playbook/app-market-listings', ['物品行情：挂单列表', 'Item page: listings']), ('playbook/app-market-trend', ['价格走势与买卖盘', 'Price trend and order book']), ('playbook/app-market-buy-confirm', ['购买确认：数量、单价、应付总额', 'Purchase confirmation: quantity, price, total due'])],
   'caption': ['', '']},     # 两条手机条共用下一条的图注
  {'kind': 'phones', 'prov': 'wire', 'project': 'playbook', 'n': 4,
   'label': ['以物换物 · 线框', 'Barter · wireframes'],
   'items': [],
   'whole': [('playbook/app-barter-market', ['换物市场：他有什么、他要什么', 'Barter market: what they have, what they want']), ('playbook/app-barter-request', ['发起交换：上面是会失去的，下面是想得到的', 'Posting a request: what you lose above, what you want below']), ('playbook/app-barter-consume', ['确认要交出的物品', 'Confirm the items you will give up']), ('playbook/app-barter-received', ['收到的交换：接受或拒绝', 'A received request: accept or refuse'])],
   'caption': ['交易市场和以物换物共约 27 屏线框，这里各放四屏。', 'The marketplace and barter flows run to about 27 wireframes; four of each are shown here.']},
 ],
 # 2026-11-17（卡 20261115-031、20261117-011）：新增 09「二创与联名 / Remix」，原 09「交付与反思」顺延为 10。
 # 五张 Studio 定稿（UX + UI 都是本人），1440 宽画框的 2 倍图，按原比例整张显示，不裁切。
 # 2026-11-17 第 2 版（卡 20261117-017 本人打回：一屏放不下的做成上下滑动）：比 16:9 高的三张（新建挑战、挑战页、作品详情）
 # 加 'scroll': True，放进 16:9 窗口里按窗口宽度整张显示、上下滑动看；另外两张本来就是 16:9，不开。
 # 第 3 版（卡 20261117-017 本人：「侧边栏都是固定的，不要让侧边栏也一起滑动」）：'fixed' 写哪几块界面不跟着滑，
 # 按 2 倍原图（sources/work/playbook/studio-remix-*@2x.png，2880 宽）上量的像素：
 #   新建挑战、挑战页：顶部搜索栏到 y=96（下沿那条线在 y=94–95），左侧菜单到 x=512（右边那条竖线在 x=510–511）；
 #   作品详情：没有左侧菜单；顶部条到 y=96（白底在 y=95 结束），右侧「Message From The Creator」栏从 x=2238 起（2880−2238=642）。
 ('playbook', 10): [
  {'kind': 'image', 'src': 'playbook/studio-remix-fan-challenges', 'prov': 'original', 'project': 'playbook',
   'label': ['粉丝挑战列表', 'Fan challenges'],
   'caption': ['Fans 页签：进行中和已结束的挑战分开，右上角新建挑战。', 'The Fans tab: ongoing and expired challenges, with “Create New Challenge” at the top right.']},
  {'kind': 'image', 'src': 'playbook/studio-remix-new-challenge', 'prov': 'original', 'project': 'playbook', 'scroll': True,
   'fixed': {'of': 2880, 'top': 96, 'left': 512},
   'label': ['新建挑战', 'New challenge'],
   'caption': ['名称、说明、可提交的文件类型和数量、阶段时间、给粉丝的分成。', 'Name, description, accepted file types and counts, phase timing and the fan’s share.']},
  {'kind': 'image', 'src': 'playbook/studio-remix-challenge-page', 'prov': 'original', 'project': 'playbook', 'scroll': True,
   'fixed': {'of': 2880, 'top': 96, 'left': 512},
   'label': ['挑战页', 'Challenge page'],
   'caption': ['当前阶段、剩余天数和全部投稿，创作者从这里选出获胜者。', 'The current phase, days left and all submissions. The creator picks the winner here.']},
  {'kind': 'image', 'src': 'playbook/studio-remix-submission-detail', 'prov': 'original', 'project': 'playbook', 'scroll': True,
   'fixed': {'of': 2880, 'top': 96, 'right': 642},
   'label': ['作品详情', 'Submission detail'],
   'caption': ['在画面上框出一块留修改意见，右侧按版本记录往来。', 'Mark an area of the image to comment on it. The side panel keeps the feedback by revision.']},
  {'kind': 'image', 'src': 'playbook/studio-remix-creator-collab', 'prov': 'original', 'project': 'playbook',
   'label': ['创作者联名', 'Creator collaborations'],
   'caption': ['已联名的物品按合作的创作者分组，另有待审批和收到的申请两个页签。', 'Collaborated items grouped by partner creator, with tabs for pending approvals and incoming requests.']},
 ],
 ('playbook', 11): [
  {'kind': 'phones', 'prov': 'team', 'project': 'playbook', 'n': 3,
   'label': ['团队完成的 UI · 用于产品与投资沟通', 'Completed team UI · used in product and investor conversations'],
   'items': [('playbook/team-home', ['首页', 'Home']), ('playbook/team-profile', ['个人主页', 'Profile']), ('playbook/team-mission', ['任务', 'Mission'])],
   'caption': ['团队完成的视觉稿，基于我整理的流程与状态。', 'The team’s finished visual design, built on the flows and states I defined.']},
 ],
 # ---------------- SMT ----------------
 # 2026-11-16（卡 20261116-014）：夜间版原稿导出的 8 张，1 倍，按原比例整张显示（kind 'image'，不进手机条）。
 # 02 节 1 张、03 节接 2 张、新 05 节「界面」5 张；原 05 顺延成 06。来源和打码见 docs/sources.md
 # 2026-11-18（卡 20261118-028）：01 节加旧版整屏 1 张；label、caption 照 `04-shared/给本人读-SMT改版前后-2026-11-18.md` 第 2 条
 ('smt', 1): [
  {'kind': 'image', 'src': 'smt/old-client', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['旧版客户端 · 整屏', 'Old client · full screen'],
   'caption': ['改版前的信用交易客户端：左边下单，中间行情和 K 线，下面是持仓表。账号和姓名已打码。', 'The old margin-trading client before the redesign: order entry on the left, quotes and the K-line chart in the middle, positions below. Account numbers and names are masked.']},
 ],
 ('smt', 2): [
  {'kind': 'image', 'src': 'smt/credit-order-panel', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['信用交易下单板 · 按业务拆出的 13 个变体', 'Margin-trading order panel · 13 variants by business'],
   'caption': ['同一块下单板按业务拆出的 13 个变体，三行分别是担保品、融资、融券。', 'Thirteen variants of one order panel; the three rows are collateral, margin financing and securities lending.']},
 ],
 ('smt', 3): [
  {'kind': 'image', 'src': 'smt/states', 'prov': 'original', 'project': 'smt', 'pad': True,
   'label': ['行状态', 'Row states'],
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
   'label': ['交易控件与变体', 'Trading controls and variants'],
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
 # 2026-11-18（卡 20261118-028）：新 06 节「改版前后」三组图，label、caption 照 `04-shared/给本人读-SMT改版前后-2026-11-18.md` 第 5 条。
 # 下单面板两张是 1 倍截图（518、608 宽），比正文栏窄：放进 'phones' 的 'whole'（不套竖屏框、不带 screen 类、显示宽度上限 = 原图宽），
 # 桌面并排、手机两列；不用 'image'，因为 .frame img{width:100%} 会把它们放大。快速交易「改版后」复用 05 节的 smt/screen-quick-order。
 ('smt', 6): [
  {'kind': 'image', 'src': 'smt/layout-flow', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['版面动线 · 上下排布到左右分屏', 'Reading path · from top-and-bottom to left-right'],
   'caption': ['左：旧版上下单一布局，查找信息效率低。右：新版左右分屏，合理分配快速入口。虚线是浏览的顺序。', 'Left: the old single top-and-bottom layout, where finding information was slow. Right: the new left-right split, with room set aside for quick entries. The dashed lines show the reading order.']},
  {'kind': 'phones', 'prov': 'original', 'project': 'smt', 'n': 2,
   'label': ['下单面板 · 改版前后', 'Order panel · before & after'],
   'items': [],
   'whole': [('smt/order-panel-before', ['下单面板 · 改版前', 'Order panel · before']), ('smt/order-panel-after', ['下单面板 · 改版后', 'Order panel · after'])],
   'caption': ['改版前：旧版下单面板和十档盘口。账号和姓名已打码。改版后：新版快速挂单：方向从两个单选圆圈改成并排的「买入」「卖出」按钮，数量可以按全部、1/2、1/3、1/4 快捷填。', 'Before: the old order panel and ten-level order book. Account numbers and names are masked. After: the new quick order panel: direction changes from two radio buttons to side-by-side Buy and Sell buttons, and quantity can be filled with All, 1/2, 1/3 or 1/4.']},
  {'kind': 'image', 'src': 'smt/quick-trade-before', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['快速交易 · 改版前', 'Quick trade · before'],
   'caption': ['旧版快速挂单整屏。', 'The old quick-order full screen.']},
  {'kind': 'image', 'src': 'smt/screen-quick-order', 'prov': 'original', 'project': 'smt', 'bg': '#1E1E1E',
   'label': ['快速交易 · 改版后', 'Quick trade · after'],
   'caption': ['新版快速挂单整页，和 05 节那张是同一页。', 'The new quick-order screen, the same page as in section 05.']},
 ],
 # 2026-11-17（卡 20261117-013，交接单第 0 节）：新 06 节「适老化方案」，大通证券关怀版五组手机界面，2 倍图（打码版）。
 # 750×1624 的十张和竖屏框（390:844）比例一致，放 'items'；交易首页两张是比一屏长的整页稿（600×1698、600×1860），
 # 放 'whole' 整张显示、顶对齐，关怀版比原版矮一截是稿子本来的样子。
 # 2026-11-18（卡 20261118-028）：前面加了 06 节「改版前后」，这一节顺延成 07，键从 ('smt', 6) 改成 ('smt', 7)，内容没动。
# 2026-11-18（卡 030 选 A）：大通拆成 smt 案例页的第二个 tab（cases.py CASES['smt']['tabs'] 里 id 'daton'），
# 这一节是那个 tab 的 01 节，键从 ('smt', 7) 改成 ('daton', 1)，五组图内容没动。
 ('daton', 1): [
  {'kind': 'phones', 'prov': 'original', 'project': 'smt', 'n': 2,
   'label': ['交易首页 · 关怀版与原版', 'Trading home · Care mode vs Standard'],
   'items': [],
   'whole': [('smt/daton-home-care', ['关怀版', 'Care mode']), ('smt/daton-home-standard', ['原版', 'Standard'])],
   'caption': ['① 常用功能放进大格子，放在好点到的位置 ② 核心功能用高对比的色块，点击范围更大 ③ 主要组件的可点区域大于 60×60pt，底部图标换成文字', '① Frequent functions sit in large tiles within easy reach ② Core functions get high-contrast blocks with larger tap areas ③ Main components have tap areas larger than 60×60pt; bottom-bar icons become text']},
  {'kind': 'phones', 'prov': 'original', 'project': 'smt', 'n': 2,
   'label': ['买入页面 · 关怀版与原版', 'Buy screen · Care mode vs Standard'],
   'items': [('smt/daton-buy-care', ['关怀版', 'Care mode']), ('smt/daton-buy-standard', ['原版', 'Standard'])],
   'caption': ['① 买入、卖出、撤单、查询、持仓的标签放大，可点范围扩大 ② 最新价移到顶部，同时显示涨跌额和涨跌幅 ③ 选市场和输代码合在一起，输入代码后系统判断所属市场 ④ 委托方式和价格合成一栏，价格栏随委托方式变化 ⑤ 最小字号大于 18pt，盘口移到下方并放大 ⑥ 盘口和持仓做成标签切换', '① The Buy, Sell, Cancel, Query and Holdings tabs are enlarged, with wider tap areas ② The latest price moves to the top, shown with its change and change % ③ Market selection merges with the stock-code field: the system detects the market from the code ④ Order type and price share one row; the price field changes with the order type ⑤ Minimum type size above 18pt; the order book moves below the form and is enlarged ⑥ Order book and holdings become two tabs']},
  {'kind': 'phones', 'prov': 'original', 'project': 'smt', 'n': 3,
   'label': ['三种委托方式 · 关怀版', 'Three order types · Care mode'],
   'items': [('smt/daton-order-limit', ['限价', 'Limit order']), ('smt/daton-order-market', ['市价', 'Market order']), ('smt/daton-order-star-market', ['科创板市价', 'STAR Market · market order'])],
   'caption': ['委托方式不同，可选项也不同：系统按股票的市场和类型调整。左起：限价、市价、科创板市价。', 'Options change with the order type: the system adjusts them to the stock’s market and type. From left: limit order, market order, STAR Market market order.']},
  {'kind': 'phones', 'prov': 'original', 'project': 'smt', 'n': 3,
   'label': ['持仓页面 · 关怀版与原版', 'Holdings · Care mode vs Standard'],
   'items': [('smt/daton-holdings-care', ['关怀版', 'Care mode']), ('smt/daton-holdings-care-sheet', ['关怀版 · 点持仓后', 'Care mode · after tapping a holding']), ('smt/daton-holdings-standard', ['原版', 'Standard'])],
   'caption': ['① 币种切换从滑动改成「切换」按钮加底部弹窗 ② 三列改成两列，总资产单独一行 ③ 点一只持仓的股票，从底部弹出买入、卖出、行情', '① Currency switching changes from a swipe to a “Switch” button with a bottom sheet ② Three columns become two, with total assets on its own line ③ Tapping a holding opens a bottom sheet with Buy, Sell and Quote']},
  {'kind': 'phones', 'prov': 'original', 'project': 'smt', 'n': 2,
   'label': ['还款 · 关怀版与原版', 'Margin repayment · Care mode vs Standard'],
   'items': [('smt/daton-repay-care', ['关怀版', 'Care mode']), ('smt/daton-repay-standard', ['原版', 'Standard'])],
   'caption': ['① 最小字号放大到 18pt，最新价放到更显眼的位置 ② 布局和买入、卖出页统一 ③ 可点区域大于 44×44pt，委托方式和价格合成一栏 ④ 持仓从右侧弹出改成标签切换', '① Minimum type size raised to 18pt; the latest price moves to a more prominent position ② Layout matches the buy and sell screens ③ Tap areas larger than 44×44pt; order type and price share one row ④ Holdings move from a right-side panel to a tab']},
 ],
 # ---------------- Commons Fridge ----------------
 # 2026-11-15 加：'fridge/sub-*' 八张取自最终提交稿（23 页横版 PDF）的原页，页码写在 label 里；来源见 docs/sources.md
 ('commons-fridge', 1): [
  {'kind': 'image', 'src': 'fridge/sub-chain', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['从访谈到功能的推导链', 'How each step produced the next'],
   'caption': ['七步：五场访谈 → 行为卡 → 四个画像 → 旅程与情绪 → 失效点 → 设计原则 → 功能与角色。前五步来自访谈，后两步是我的设计判断。', 'Seven steps, from five interviews to features and character. Steps 01–05 rest on the interviews; steps 06–07 are my design decisions.']},
  {'kind': 'image', 'src': 'fridge/research', 'prov': 'research', 'project': 'fridge', 'pad': True,
   'label': ['五场共享冰箱习惯访谈 · U01–U05', 'Five shared-fridge habit interviews · U01–U05'],
   'caption': ['访谈卡片（中文原稿）。', 'Interview cards (Chinese originals).']},
  {'kind': 'image', 'src': 'fridge/sub-personas', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['四个行为情境画像', 'Four behavioural personas'],
   'caption': ['画像描述的是情境，不是人格类型：同一个人会随住处、层架规则和关系的变化在它们之间移动。图里的人像是示意插画。', 'These are situations, not personality types: the same person moves between them when the home, the shelf rules or the relationships change. The portraits are illustrations.']},
  {'kind': 'image', 'src': 'fridge/sub-curves', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['四条情绪曲线，同一条横轴', 'Four curves, one shared axis'],
   'caption': ['纵轴是相对位置，高度本身不重要，要看的是形状：三条曲线能回升，一条不能。除了 A，其余三条都在第四阶段落到最低——出了问题、得有人开口的那一刻。最低点是人与人之间的事，不是技术问题。', 'The vertical axis is relative; what matters is the shape, not the height: three curves recover, one does not. Every curve except A bottoms out at stage 4, the moment something is wrong and someone has to say so. The lowest point is social, not technical.']},
 ],
 # 2026-11-24（交接单 6h）：02、04 两节的四张 v1.7 截图换成 3D 小样里同一件事的画面（tools/prepare_assets.py 'fridge/3d-*'，docs/sources.md）
 ('commons-fridge', 2): [
  {'kind': 'phones', 'prov': 'original', 'project': 'fridge', 'n': 2,
   'label': ['3D 小样 · 首页与放进去', '3D prototype · home and putting in'],
   'items': [('fridge/3d-home', ['在冰箱前：只做这一刻需要的事', 'At the fridge: only what this moment needs']), ('fridge/3d-add-plan', ['放进去：记下一个计划', 'Put in: record a plan'])],
   'caption': ['不再要求完整库存，只在放入、查看处理、买菜前这几个时刻帮忙。', 'No complete inventory: help only when putting in, checking, and before shopping.']},
 ],
 ('commons-fridge', 3): [
  {'kind': 'image', 'src': 'fridge/sub-failures', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['九种共享冰箱失灵的方式', 'Nine ways a shared fridge fails'],
   'caption': ['每张卡是一种跨访谈出现的失效方式；卡片底下的编号（例如 U02 · U05）是它出自哪几场访谈。', 'Each card is a failure pattern seen across interviews; the codes underneath (for example U02 · U05) name the interviews that produced it.']},
  {'kind': 'image', 'src': 'fridge/sub-failure-to-feature', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['每个失效点，对应做出来的一样东西', 'What was built in answer to each failure'],
   'caption': ['从左到右读一行：失效点、原型里回应它的那样东西、在哪一版做出来。', 'Read a row left to right: the failure, the thing in the build that answers it, and the version it shipped in.']},
 ],
 ('commons-fridge', 4): [
  {'kind': 'phones', 'prov': 'original', 'project': 'fridge', 'n': 2,
   'label': ['3D 小样 · 位置、归属与权限', '3D prototype · location, ownership and permission'],
   'items': [('fridge/3d-other-on-my-shelf', ['小满的果酱在我的层：没有处理按钮', 'Xiaoman’s jam on my shelf: no button to dispose of it']), ('fridge/3d-unknown', ['没人认的保鲜盒：“不知道是谁的”', 'An unclaimed container: “not sure whose”'])],
   'caption': ['没人认的东西一直是“不知道是谁的”，直到有人说“这是我的”。', 'An unclaimed item stays “not sure whose” until someone says “this is mine”.']},
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
   'label': ['否掉一张图的三个理由', 'Three documented reasons for refusing a render'],
   'caption': ['取自生成记录，不是凭记忆。五个文件里有两个根本不是设计方向，而是想得到真正的透明背景时失败的尝试；最终稿放弃了透明，统一用一种米白底色。', 'Taken from the generation record, not from memory. Two of the five files are not design directions at all — they are failed attempts to get a genuine transparent background; the final sources abandoned transparency and use one uniform off-white.']},
  {'kind': 'image', 'src': 'fridge/sub-rounds', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['四轮修改，每一轮被要求改什么', 'Four rounds, and what each one was told to fix'],
   'caption': ['第 3 轮先定下优先级：性格第一，关系第二，吉祥物感最后。第 4a 轮把全身比例改成大头比例。第 4b 轮只用不透明的平涂色块，这一版被选中，进入表情系统和印刷件。', 'Round 3 set an explicit hierarchy: personality, then relationship, then mascot. Round 4a replaced the full-body default with a head-led proportion. Round 4b uses strictly opaque flat fills — the version selected and carried into the expression system and the printed pieces.']},
 ],
 # 2026-11-23：新 07「3D 小样」（交接单 6f ②、6g 第 2、3 条）。五张小样录屏，GIF 转成动态 WebP（tools/prepare_assets.py ANIMS）。
 # 两行：第一行三张整屏（对应正文第 1 段），第二行冰箱贴和每周结算（对应第 2 段）。同一行等高、顶对齐，放不下就等比缩，不换行；
 # 手机上第一行排成 2+1（styles.css .anims）。一张图里只有一只企鹅。待机两张没用（docs/sources.md）
 ('commons-fridge', 7): [
  {'kind': 'anims', 'prov': 'original', 'project': 'fridge',
   'label': ['', ''], 'caption': ['', ''],   # 交接单只给了每张的图注，没给整组的图名和图注：都不出
   'rows': [
    [('fridge/3d-open-door', ['点一下，门开了', 'Tap, and the door opens']),
     ('fridge/3d-drag-shelf', ['拿起来，拖到别的层', 'Pick it up, drag it to another shelf']),
     ('fridge/3d-penguin-cheer', ['吃掉一样，企鹅得一条鱼', 'Eat something, the penguin gets a fish'])],
    [('fridge/3d-magnet-drag-turn', ['冰箱贴：抓中间是挪，抓边上是转', 'Magnets: grab the middle to move, the edge to turn']),
     ('fridge/3d-weekly-pass', ['一周没有东西放坏，得一枚冰箱贴', 'A week with nothing spoiled earns a magnet'])],
   ]},
 ],
 # 2026-11-18：前面插了 06「产品化」（v2.0，交接单 6e），「下一步」从 07 顺延为 08，这两张图跟着挪；新 06 节这次不放图
 # 2026-11-23：前面又插了 07「3D 小样」，「下一步」顺延为 09
 # 2026-11-24（交接单 6h）：原 08「原型与结果」并进 07，「下一步」回到 08
 ('commons-fridge', 8): [
  {'kind': 'image', 'src': 'fridge/sub-test-not-run', 'prov': 'submission', 'project': 'fridge', 'bg': '#F6F0E3',
   'label': ['一套备好的比较测试', 'A comparison test, printed and ready'],
   'caption': ['评估材料是齐的：参与者说明、观察表、评分表、NFC 读取测试表、三种顺序的卡片和选择矩阵。获批的伦理路线只覆盖关于已有习惯的访谈，所以这套测试留到下一轮。', 'The evaluation kit is complete — participant instructions, an observer sheet, a rating sheet, an NFC read-test sheet, sequence cards in three orders and a selection matrix. The approved ethics route covered interviews about existing habits, so this test is for the next round.']},
  {'kind': 'image', 'src': 'fridge/penguin-motion', 'prov': 'original', 'project': 'fridge', 'pad': True,
   'label': ['展览动态研究 · 2026 年 9 月', 'Exhibition motion study · September 2026'],
   'caption': ['角色的下一步：把邀请与确认做成触觉和动态反馈。', 'Next for the character: turning invite and acknowledge into tactile and motion feedback.']},
 ],
 # ---------------- Agent Matrix ----------------
 # 2026-11-17：四张图，中英文各一张（'src' 中文页，'src_en' 英文页）。本人在卡 20261115-001 第 3 版通过；图注照交接单第 3 节。
 # 2026-11-25 重讲成 5 节（交接单第 14 节，卡 20261125-001；卡 20261124-009 选 C、20261124-012 选 A）。图跟着挪：
 #   旧 01 九个问题 + 旧 02 飞书两张 → 新 01；旧 03 审核卡 → 新 02（前面加每天卡数）；新 03 四组前后对照是新出的；
 #   旧 07 撤回 8 秒 → 新 04；旧 06 等着的六张卡 + 旧 08 信任等级 → 新 05。旧 01 的十四个 agent 分工图不再放（文件留着）。
 ('agent-matrix', 1): [
  {'kind': 'image', 'src': 'agent-matrix/fig-sequence-zh', 'src_en': 'agent-matrix/fig-sequence-en', 'prov': 'diagram', 'project': 'matrix',
   'label': ['九个问题，各引出一个机制', 'Nine problems, one mechanism each'],
   'caption': ['每个机制，都是被一个具体的问题逼出来的。', 'Every mechanism was forced by one specific problem.']},
  # 2026-11-24（交接单第 11 节，卡 20261124-005 选 A）：飞书多维表两张截图上下叠放（'stack'）：上面甘特（只留前 13 行），下面看板（原样）。
  # 图注已写明上 / 下，每张图下面不再出小字；build.py 的 stack 不读 'alt'，两张图的替代文字用的是图注，'alt' 只留作记录
  {'kind': 'stack', 'prov': 'original', 'project': 'matrix',
   'label': ['', ''],
   'items': [('agent-matrix/feishu-gantt-top13', ['', '']), ('agent-matrix/feishu-kanban', ['', ''])],
   'alt': ['飞书多维表的两张截图。上：甘特视图，13 行任务，每行有状态、进度条和横跨 2026 年 10 月到 12 月的时间条。下：看板视图，按未开始、进行中、完成分三列，每张卡写着计划开始、计划结束、进度和项目。', 'Two screenshots of a Feishu Base table. Top: the Gantt view with 13 tasks, each with a status, a progress bar and a time bar running from October to December 2026. Bottom: the kanban view in three columns (not started, in progress, done); each card shows planned start, planned end, progress and project.'],
   'caption': ['上：我定的计划。下：agent 此刻在做什么。', 'Top: the plan I set. Bottom: what each agent is doing now.']},
 ],
 # 新 02：每天卡数（cards_full.json 按卡片创建日重算，见 docs/sources.md）和一张示例审核卡，放在正文后、原型前（'before_demo'）；原型是审核中心小原型（#try）。
 # 审核卡是 2026-11-21 用审核中心小原型拍的示例卡，整卡比一屏高，放进 16:9 窗口上下滑，左侧菜单不动
 ('agent-matrix', 2): [
  {'kind': 'image', 'src': 'agent-matrix/fig-daily-cards-zh', 'src_en': 'agent-matrix/fig-daily-cards-en', 'prov': 'diagram', 'project': 'matrix', 'before_demo': True,
   'label': ['每天新来的卡', 'New cards each day'],
   'caption': ['柱子上的数是当天所有项目的卡，深色是作品集的。', 'The number above each bar counts every project that day; the dark part is the portfolio.']},
  {'kind': 'image', 'src': 'agent-matrix/review-card', 'prov': 'original', 'project': 'matrix', 'scroll': True, 'before_demo': True,
   'fixed': {'of': 2880, 'left': 496},
   'label': ['一张审核卡', 'A review card'],
   'caption': ['一张卡回答五个问题。这是示例卡，不是真实待办。', 'One card answers five questions. This is an example card, not a live item.']},
 ],
 # 新 03：四组前后对照，顺序同表格四行。上下叠放（'stack'），改之前在上、改之后在下。每张从哪来见 docs/sources.md「2026-11-25：Agent Matrix 重讲（5 节）」
 ('agent-matrix', 3): [
  {'kind': 'stack', 'prov': 'original', 'project': 'matrix',
   'label': ['PlayBook 配方编辑', 'PlayBook recipe editor'],
   'items': [('agent-matrix/ba-playbook-before', ['改之前 · 11-15', 'Before · Nov 15'], 'agent-matrix/ba-playbook-before-en'), ('agent-matrix/ba-playbook-after', ['改之后', 'After'], 'agent-matrix/ba-playbook-after-en')],
   'caption': ['原来下面是固定的六步，现在没有固定顺序。', 'There used to be six fixed steps below; now there is no set order.']},
  {'kind': 'stack', 'prov': 'original', 'project': 'matrix',
   'label': ['首页四张封面', 'The four home covers'],
   'items': [('agent-matrix/ba-covers-before', ['改之前 · 11-17', 'Before · Nov 17'], 'agent-matrix/ba-covers-before-en'), ('agent-matrix/ba-covers-after', ['改之后 · 11-18', 'After · Nov 18'], 'agent-matrix/ba-covers-after-en')],
   'caption': ['PlayBook 的摆法留着，另外三张各换一种。', 'PlayBook keeps its layout; the other three each get their own.']},
  {'kind': 'stack', 'prov': 'original', 'project': 'matrix',
   'label': ['兴业 SMT 案例页顶部', 'Top of the SMT case page'],
   'items': [('agent-matrix/ba-smt-before', ['改之前', 'Before'], 'agent-matrix/ba-smt-before-en'), ('agent-matrix/ba-smt-after', ['改之后', 'After'], 'agent-matrix/ba-smt-after-en')],
   'caption': ['顶部多了两个标签页，兴业和大通各占一个。', 'Two tabs at the top now, one for Industrial Securities and one for Daton.']},
  {'kind': 'stack', 'prov': 'original', 'project': 'matrix',
   'label': ['The Commons Fridge 的一节', 'A section of The Commons Fridge'],
   'items': [('agent-matrix/ba-fridge-before', ['停下的那一版 · 11-18', 'The version that stopped · Nov 18'], 'agent-matrix/ba-fridge-before-en'), ('agent-matrix/ba-fridge-after', ['之后上线的 3D 一节 · 11-24', 'The 3D section that went live · Nov 24'], 'agent-matrix/ba-fridge-after-en')],
   'caption': ['停下的那一版只有文字；之后冰箱本身成了界面。', 'The version that stopped was text only; afterwards the fridge itself became the interface.']},
 ],
 # 2026-11-23（交接单第 10 节）：撤回 8 秒。都裁自示例数据截图（卡上有「示例卡片」）；'before_demo'：放在正文后、原型（批次图）前。2026-11-25 从旧 07 挪到新 04
 # 改之前 / 改之后两条 13:1 的扁图并排会缩到三分之一宽、字看不清，所以上下排（'stack'）
 ('agent-matrix', 4): [
  {'kind': 'stack', 'prov': 'original', 'project': 'matrix', 'before_demo': True,
   'label': ['', ''],   # 每张图下面已经写了改之前 / 改之后，上面不再出一行图名
   'items': [('agent-matrix/undo-before', ['改之前', 'Before']), ('agent-matrix/undo-after', ['改之后', 'After'])],
   'caption': ['以前点完只闪一下「已记下」；现在停 8 秒，可以撤回。', 'Before, a decision just flashed “Saved”. Now it stays for eight seconds, with Undo.']},
  {'kind': 'stack', 'prov': 'original', 'project': 'matrix', 'before_demo': True,   # 交接单写的是 image；也是扁图（8:1），用 stack 让放大按钮不盖住「通过」
   'label': ['', ''],   # 交接单只给了图注，没给图名：不出图名那一行
   'items': [('agent-matrix/undo-restored', ['', ''])],
   'caption': ['撤回以后，意见和图上批注都还在。', 'After Undo, the comment and the pinned note are still there.']},
 ],
 # 2026-11-25：旧 06「等着的六张卡」和旧 08 信任等级并进新 05「下一步」。信任图换成 2026-11-24 的台账（ledger/trust.md 逐格核对）
 ('agent-matrix', 5): [
  {'kind': 'image', 'src': 'agent-matrix/fig-who-waits-zh', 'src_en': 'agent-matrix/fig-who-waits-en', 'prov': 'diagram', 'project': 'matrix',
   'label': ['当时在等的六张卡', 'The six cards that were waiting'],
   'caption': ['不急、有推荐选项的可以先走；要我亲眼看、亲手做的仍然等我。', 'Non-urgent cards with a recommended option can go ahead; what I must see or do myself still waits.']},
  {'kind': 'image', 'src': 'agent-matrix/fig-trust-zh', 'src_en': 'agent-matrix/fig-trust-en', 'prov': 'diagram', 'project': 'matrix',
   'label': ['四级信任等级和台账', 'Four trust levels and the ledger'],
   'caption': ['每类任务从最低一级开始。', 'Every task type starts at the lowest level.']},
 ],
}
