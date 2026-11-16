# Content and asset sources

Author: Yucheng Feng / Tobie. User confirmed UP NO.1 is a colleague's account; do not treat its workspace files as the user's. All final Figma source discoveries were read from the Tobie desktop session or known personal project links. No Figma source was edited.

## Personal identity
- ai头像系列: https://www.figma.com/design/qWSYEJeIBKS6cL1oZfwzPC?node-id=7-3 (500×500 avatar, used unchanged).
- Old portfolio biography: https://www.figma.com/design/lfqzkEzhH33yq5kvIkNEqW?node-id=2151-62982. Confirms 冯渝程, email and professional context.
- Local /Users/beijixinfei/eai/Yucheng_Feng_English_CV.pdf for education. No employment date table copied because company/date variants conflict with earlier records. Degree completion is not claimed.

## Qingju
- https://www.figma.com/design/lfqzkEzhH33yq5kvIkNEqW?node-id=2206-19887
- Cover 2206:19923; research 2206:20210; journey 2206:20389; wireframes 2206:20837; reflection 2206:21841.
- Source clearly states the leisure-cycling direction was proposed by the author. Existing project index records user confirmation of research, interview, persona, journey and low-fi scope.
- High fidelity is credited to the team. Historical sample counts use explicit provenance; no causal lift or numerical outcome inferred. User was asked asynchronously about the additional outcome mentioned.

## PlayBook
- Studio: https://www.figma.com/design/XDyOn5545LrSOsCwqUcED7?node-id=5562-28622
- App: https://www.figma.com/design/3IhJOmCVR6WC8mJYbbYLA7?node-id=704-61173
- Existing PDF and playbook-meeting-digest.md / playbook-app-redesign-audit.md / case-study notes used for coherent context. Later confirmed roles take precedence over old inconsistent co-founder wording. Use designer without founder title.
- Studio UX/UI by user; App UX by user, visual UI by another designer.

## Industrial Securities SMT
- https://www.figma.com/design/RXWxFWgHwWEXBBcLQ6LlZB?node-id=0-5802
- Existing exported assets from output/portfolio/assets. SMT overview is the portfolio asset with account identifiers already masked.
- Components, guidelines and maintenance; collaborative business decomposition. No code implementation or measured efficiency claims.
- 2026-11-16 加 8 张图、新开 05 节「界面」（原 05 顺延成 06）。依据：`04-shared/SMT-交接单.md`「本次可合并」一节；这次只合这一节，交接单其余部分（T2–T5、F3 等）没合，事实卡、deck、摘要、01–04 节文字、原 05 节文字都没动。
  - Figma 文件：夜间版 `On3eDCRN7DKUpwuvGjd8rF`「兴业项目-兴业SMT (Copy)」（节点编号和日间版源文件 `RXWxFWgHwWEXBBcLQ6LlZB` 一样）。2026-11-16 导出，1 倍（导出工具最多给节点原尺寸）。原件在 `04-shared/SMT-导图-2026-11-16/`，复制到 `sources/work/smt/`，导出时只压缩成 WebP，没有缩放、没有裁切。
  - `smt/credit-order-panel`：节点 `683:24828`，信用交易下单板 13 个变体，1840×1542，02 节。
  - `smt/level-variants`：节点 `517:54278`，买卖档位 8 个变体（五档 4 个、十档 4 个），1510×842，03 节。
  - `smt/market-components`：节点 `2492:69029`，行情组件全集，3309×4113，03 节，整张放。
  - `smt/screen-asset-home`：节点 `0:1110`「资产总览-展开」，1920×1080，05 节。
  - `smt/screen-main-menu`：节点 `213:5799`，资产首页上展开的主菜单，1920×1080，05 节。
  - `smt/screen-quick-order`：节点 `656:24252`，快速挂单整页，1920×1080，05 节。
  - `smt/screen-basket-order`：节点 `1759:63399`，篮子算法 · 篮子下单，1920×1080，05 节。
  - `smt/screen-grid-strategy`：节点 `1727:54810`，网格策略 · 多档预埋，1920×1080，05 节。
  - 打码：整页 5 张（`smt/screen-*`）的账号和姓名用 `04-shared/SMT-导图-2026-11-16/mask.py` 打了马赛克，网站用的是 `打码/` 文件夹里的版本（`sources/work/smt/` 里文件名带 `-masked`），不是 `原图/` 里同名的未打码文件。组件 3 张上没有账号姓名，用的是 `原图/` 里的。
  - 本人确认：卡 20261115-008（卡上六页是本人画的）、20261115-019（下单板和行情组件算本人范围）、20261116-010（用夜间版）、20261116-014（验收通过，原话「前面正常第九张不放」）。
  - 没放的：日间版下单板（`原图/day-credit-order-panel-683-24828.png`），字段名在日间版里看不见，本人定不放。
  - 05 节正文第一句的依据是卡 20261115-008 第 2 版；第二句（每一页由同一批组件拼成）是 SMT 会话照图写的，本人在卡 20261116-014 上读过。label、caption 照交接单「0 号更新 · 甲″」的表逐字用；英文术语（T+0 arbitrage、pre-set orders、time and sales 等）是 SMT 会话译的。
  - 落点：`cases.py` → `CASES['smt']['sections']` 第 5 项（新）和第 6 项的 label；`figures.py` 新增 `('smt', 2)`、`('smt', 5)`，`('smt', 3)` 后面接两张；`tools/prepare_assets.py` 的 `JOBS` 加 8 行。`prototypes.py`（复刻演示在第 3 节）和 `build.py` 没有改。

## Commons Fridge
- https://www.figma.com/design/lx9WbYRybWceTemdXVkoJj?node-id=190-148
- Final 23-page landscape submission in 毕业设计/最终交付/06-正式提交包-Final-Submission/03-补充材料-Optional-Supporting.
- Figures are exports from the submitted document. Habit interviews and researcher demonstration are explicitly distinct from participant testing. v1.7 uses browser-local example records; no multi-user synchronisation claimed.

## School and application exploration
Reviewed all four CDU project PDFs, EAI CV and Wuhan mapping, plus the graduation submission.
- CDU CCTV: /Users/beijixinfei/cdu/project2/project2.pdf. Live prototype linked as shown in source.
- CDU Quantified Self: /Users/beijixinfei/cdu/project3/Frame 69.pdf and slide/p3-slide-07.png. WeChat mood counts not republished; focus on design method.
- EAI Jianghan Road: /Users/beijixinfei/eai/project1-material/wuhan mapping.pdf. Source PDF copied as readable supporting artifact, rendered cover used on homepage.
- Native Figma Tobie session: communication design 42 (the university of Southampton), team 1529429636816422389, Team project folder 420920556. Files observed: wuhan mapping; collect, define,understand; project2; output; 共享单车项目; 基于IDS的数字孪生医疗餐饮体系; ar相关; 脑机接口, plus reference material.
- 共享单车项目 file 3Lmu2yG7oAKiIxxIMkOWie is a distinct application study, not automatically the commercial Qingju growth-system case. Kept separate to avoid conflating projects.

Existing 27-page portfolio PDF is offered as a companion download; it is not represented as identical to the website selection.

## Original PlayBook motion — 2026-09-19
- Old portfolio: https://www.figma.com/design/lfqzkEzhH33yq5kvIkNEqW
- 2159:24200 创建合成配方1: original GIF, 369 frames, 12.31 seconds.
- 2159:24203 查看物品 2: original GIF, 1216 frames, 20.27 seconds; also represented by VIDEO node 2136:29465.
- 2159:24207 评论1: original GIF, 367 frames, 12.23 seconds.
- Source GIF bytes downloaded through Figma asset tool. Web MP4 versions transcode the original recordings with no new animation/content. Silent source clips. Three-frame inspection confirms the respective recipe creation, item detail/relationship and contextual comment flows.
- User confirms one PlayBook demonstration was made in ProtoPie; tool metadata alone cannot identify which clip, so individual clip tool attribution is not invented.
- New inline browser demos are retrospective, operable explanations of the documented design rules; historical design authorship/launch boundaries remain unchanged.

## 2026-11-15：两张手机截图换成 2 倍原稿，SMT 公司名
起因是走查报告 `04-shared/qa/walkthrough/2026-10-27-browser.md` 第 4、5 条（图被放大显示）。只换分辨率，画面内容没有变：新图缩回原尺寸后和旧图逐像素比较，平均差异分别是 1.2 和 3.1（满分 255），差在缩放的边缘。
- `playbook/app-home`：App UX 文件 `3IhJOmCVR6WC8mJYbbYLA7`，节点 `704:52540`「首页/每日任务(完成未领取）」，390 × 1617，按 2 倍导出为 780 × 3234。原图 `sources/work/playbook/app-home@2x.png`。
- `qingju/team-memory`：旧作品集文件 `lfqzkEzhH33yq5kvIkNEqW`，节点 `2206:21339`「iPhone 11 Pro / X - 1」（骑行回忆 + 引导浮层），400 × 866，按 2 倍导出为 800 × 1733。里面的界面截图是团队高保真的位图，原始宽度 750，所以不是严格的 2 倍清晰度。原图 `sources/work/qingju/team-memory@2x.png`。
- `playbook/early-ui`（走查第 3 条，左右各裁约 2%）没有动：它是另一位设计师的 390 × 812 整屏，换成 390 × 844 等于改别人的稿子。
- SMT 公司名：按 `04-shared/CLAUDE.md` 小改动第 2 条，「优品财富 / Youpin Wealth」改为「武汉优品楚鼎科技有限公司 / Wuhan Youpin Chuding Technology」（英文写法取自 `cv-pm/master/` 英文简历）。
- 分享卡片 `dist/assets/share-zh.jpg`、`share-en.jpg`：由 `tools/share-card.html` 截图得到，只用了首页已有的标题和自画像。

## 2026-11-15：Commons Fridge 加八页提交稿原页，新增第 03 节
- 来源：最终提交稿 `03_The-Commons-Fridge__Landscape-EN__23pp.pdf`（私有仓库 `04-shared/外部原件/毕业设计/最终交付/06-正式提交包-Final-Submission/03-补充材料-Optional-Supporting/`），23 页横版，842 × 595 pt。
- 用到的页：L02（推导链）、L04（四个画像）、L08（情绪曲线）、L09（九种失效）、L10（失效点对功能）、L15（否掉出图的理由）、L16（四轮修改）、L19（没跑的比较测试）。
- 处理：PyMuPDF 按 2.6 倍渲染成 PNG，裁掉 560 pt 以下的页脚和四周空白，内容没有改。原图 `sources/work/fridge/sub-L02-chain.png` 等八张，导出为 `fridge/sub-*`（最宽 2000）。
- 新增的正文（第 03 节两段和注释、第 05 节一段）和八条图注都是这八页原文的转述或翻译，没有加新事实。「没有一项经过参与者测试」「前两轮被直接否掉」「获批的伦理路线只覆盖关于已有习惯的访谈」分别出自 L10、L16、L19。
- 没用的：三次转向、刻意没做的三件事、v0.9 版本对照。它们只在 Figma 内部整理页（`lx9WbYRybWceTemdXVkoJj` 的 01、05 页）和竖版草稿里，最终提交稿里没有，等本人确认后再定。
- `figures.py` 的 `PROV` 新增一个标签 `submission`（提交稿原页 / Submitted page）。

## PlayBook Studio · 三段录屏的可操作演示（2026-11-15）

> 这一版已被 2026-11-16 的重做替换（见本文件最后一节）。下面的记录留作当时的依据。

- 画面：`sources/playbook-video/recipe.gif`（15 帧）、`items.gif`（4 帧）、`comments.gif`（4 帧），帧号写在 `tools/extract_playbook_frames.py`；导出为 `dist/assets/work/playbook/live-*.webp`，1440×810。每一屏都是录屏里的一帧，没有合成。
- 依据：本人 2026-11-15 在审核卡 20261115-033 上的意见：给投资人演示的 ProtoPie 原型还在，但会员过期；希望用 Claude 把当年视频里的交互在网页里补一遍。
- 事实边界：拖动、点击、框选是 2026 年为作品集加的，不是当年的交付物。配方编辑和物品交互不新增任何状态。评论演示里访客自己拖框时出现的选框、回复框、圆点是按原稿复刻的部件（回复框裁自 `comments.gif` 第 144 帧，圆点颜色 `#486CFF` 取自第 352 帧），位置和文字随访客的操作变化；窄屏上不提供自己拖框，只按录屏那一处走。
- 画面里的 Lofi Girl 图和名字：本人在审核卡 20261115-031 上选了「可以直接用」。

## PlayBook Studio · 三个演示用代码重做（2026-11-16）

- 依据：本人在审核卡 20261115-057 上打回了逐帧版，原话：「体验太差了呀，这个就是不用按照我完全的我的那一种定死的交互来，然后然后也是可以来回滑动的，就是去设定一个边界就好了。现在直接用代码完成的话，这些东西就不太有所谓吧，就我觉得现在的体验，那还不如像之前一样直接放视频呢。」据此改了 `docs/design-system.md` 第 5 节规则 8。
- 性质：三个演示都是 2026 年按原稿和当年录屏用代码重做的，不是当年的交付物。每个演示的画框标签和底部来源说明都写明了这一点。三段原始录屏仍在演示下方。
- 界面从哪里来：
  - 配方编辑：物品库、标题栏、底部工具栏是 `recipe.gif` 第 132 帧（`live-recipe-03`，空画布）；八样物品的图标从同一帧裁出，去掉周围的底色（`sources/work/playbook-live/parts/recipe-icons.png` → `live-recipe-icons`）；三个栏、物品卡片、And / Or、概率条按这一帧和第 366 帧量出的尺寸和颜色用代码画。Output 栏随组数变宽（264 / 392 / 592 / 1000 像素）是照录屏第 132、168、184、276 帧量的。
  - 物品与关系网：整页是 `items.gif` 第 240、520、800 帧（`live-items-01/02/03`）；关系网里的七件物品从第 520、800 帧裁成圆片（`parts/items-nodes.png` → `live-items-nodes`）；连线按画面里的方向和红蓝两色重画。第 240 帧和第 800 帧里各有一个 ProtoPie 的触点圆圈（录屏时的鼠标），分别用页面底色和第 520 帧的同一位置盖掉了。
  - 评论：底图是 `comments.gif` 第 0 帧（`live-comments-00`）；回复框和头像裁自第 144 帧（`live-comments-01`）；选框、圆点、气泡按第 144、268 帧复刻，圆点颜色 `#486CFF`。
- 重做时定的、原稿里看不出来的（都写在各演示的来源说明里）：
  - 配方：上限 Require 3 样、Optional 2 样、Output 3 组、每组 3 样；同一样物品在材料一边或产出一边各只放一次；多样物品的一组一律上下排（录屏里电池和增压器那一组是左右排）；概率每次加减 5%；Key 和 Crates 在录屏里没当过产出，放进 Output 时默认 100%，其余六样用录屏里的数（100 / 10 / 10 / 10 / 80 / 20）；拖回物品库等于拿掉；画面下方的按钮和「读作」那一行。一打开是录屏进行到一半的样子（宝箱、钥匙；手柄 And 两种颜料）。
  - 物品：关系网里的物品可以拖、可以点着走到另一件；一打开就是纸鹤的详情；带青色圈的两件是有详情的。
  - 评论：最多 5 个标记、一条最多 60 个字；圆点可以拖；只点一下（不拖框）也能留评论；画面下方的清单。
- 事实边界：
  - 原稿只给纸鹤和红耳机画了详情，其余 32 件物品没有数据，点了只提示，没有编。
  - 红耳机的关系网在第 800 帧最下面还露出一条蓝线和半件物品，看不清是什么，没有画。
  - 红线、蓝线各自代表什么，录屏里没有图例，页面上没有解释。
  - 条件栏（Condition）、底部工具栏、Upload 在这段录屏里没有用到，演示里只照原样摆着，点了会说明。
  - 录屏里发出评论以后右边的留言栏没有新增条目，演示里也没有改它。
  - 画布上重画的文字用访客设备上的字体（原稿是一款圆体，网站没有内嵌它），字形和录屏画面里的略有差别。
- 窄屏（画面窄于 620 像素）：配方换成上下排（物品库、Input、Condition、Output），不再用录屏画面做底；物品和评论演示把录屏画面放大，只看其中一块。这是为手机做的排法，不是原稿的布局。
- 不再用到的画面：`live-recipe-00/01/02`、`live-recipe-04` 到 `live-recipe-14`（其中 `-08` 留作没有 JavaScript 时的静态图）、`live-items-00`、`live-comments-02/03`（`-02` 留作静态图）。文件都还在，没有删。
- 画面里的 Lofi Girl 图和名字：沿用审核卡 20261115-031 上「可以直接用」的决定。

## 2026-11-16 第一批合并：青桔、PlayBook 已定的文字（本人在审核卡上的结论）

青桔
- 职责写「提出休闲骑行方向；参与调研与访谈」，英文不用 Led：卡 20261115-038（研究是一起做的）。
- 「2021 · 2 个月 · 4 人团队」：卡 20261115-045；旁证是旧目录页（Figma 2206:19888）和证书上的四位作者。
- 奖项：证书 `03-qingju/portfolio/evidence/award-certificate-card039.jpg`（卡 20261115-039）。知群中国产品设计大赛，青桔单车用户成长体系赛段，最佳方案奖，四位作者。证书上没有年份、「金奖」「学生组」，这些不写；英文奖名是译名。
- 实地观察地点是藏龙岛湿地公园，2021-05-09 18:00–19:30：卡 20261115-043；Figma 2206:20149 / 2206:20163 的文字层。
- 「约九成」的分母是 85 份有效问卷：卡 20261115-041，本人 2026 年回忆；原稿（Figma 2206:20210）只写 90%，原始问卷未核实。不写 77 份、90.6%。
- 低保真界面里的数字是原型占位（Figma 2206:20837）。
- `qingju/team-route`：原图 `qingju-final.png`，1200×867，团队高保真；按原比例完整显示（卡 20261115-042）。Figma 节点应为 2206:21317，未回 Figma 核对。

PlayBook
- 手机端改版从 2023 年 10 月下旬开始、做了三到四周：卡 20261115-009；内容清单第 1 条；两份会议逐字稿的文件名（2023-10-21、2023-10-23）。
- 「演示原型用于路演，项目已获得投资」：卡 20261115-051；`cv-pm/master` 中英文母版；`02-playbook/case-study/playbook-case-study-notes.md`。不写金额、轮次、时间、投资方。
- `playbook/studio-campaign`：Figma 导出时没有裁到画框（1464×966，带灰边，内容溢出），2026-11-16 在 `tools/prepare_assets.py` 的 `CROP` 里裁到 1440×810 的画框，画面内容没改。


## 2026-11-16：四个案例加开头摘要，页面上的声明句删掉

- 依据：本人 2026-11-16 定的写法（根 `CLAUDE.md`「通用」：往强里写，不写防御句；审核卡 20261116-007），和改稿方案第二版（审核卡 20261116-006，本人在会话里说「两样都做」）。
- 新增：每个案例标题下面三行摘要（问题 / 我的关键决定 / 结果），数据在 `cases.py` 的 `brief`，模板在 `build.py`，样式 `.case-brief`。摘要的句子都取自各案例已有的正文，只有下面一条是新写上页面的事实。
- 新写上页面的事实：兴业 SMT「参与兴业证券 SMT 5.0 交易系统改造，已开发上线」。来源：`cv-pm/master/` 中文母版；根 `CLAUDE.md` 和 `04-shared/CLAUDE.md` 的 SMT 一节（“已开发上线（CV 记载）”）。
- 没写上页面、等交接单的：Commons Fridge 在合租里试用（本人在卡 20261115-012 上答：2026-09-15 告知五位室友，19、20 日有人使用）。是哪个版本、总人数怎么算，冰箱交接单还没定（`01-commons-fridge/portfolio/handoff.md` 第 6 节那一项没勾）。
- 从页面上拿掉、但事实没有变的（留在这里备查，被问到如实说）：
  - 青桔：11 位访谈、128 份回收、85 份有效、“约九成”都来自当年的项目记录；原始问卷和访谈记录没有找到；“约九成”的分母 85 是本人 2026 年回忆（卡 20261115-041）。实地观察只去了一次，没有计数；“产品在休闲场景缺少引导”是团队当时的推断。低保真和团队高保真里的数字是占位内容。高保真是团队做的。方案没有上线，没有前后对比。
  - PlayBook：App 的视觉 UI 是另一位设计师做的；团队变动后项目没有完成全面开发交付；融资是公司层面的进展。App 合成流程里的热点是作品集加的，没有新增状态。三个用代码重做的演示里哪些是重画的、哪些规矩是重做时定的，见上面「三个演示用代码重做（2026-11-16）」一节。
  - 兴业 SMT：本人不负责软件开发；没有工时统计，没有效率数字；复刻的表格不连接账户或行情，搜索框只有外观。
  - Commons Fridge：五场访谈研究的是生活习惯；冰箱前的照片是研究者演示；提交时没有参与者用过原型，比较测试的材料备好了但没有执行（获批的伦理路线只覆盖关于已有习惯的访谈）。原型的共享视图用单个浏览器里的示例记录，不做跨设备同步。画像里的人像是示意插画，年龄、职业是情境假设。
- 版本：第 06 节正文改成「提交时的功能原型 v1.7……下面嵌入的是展览期更新的 v1.8」，两个版本号都没有改。
- 第 06 节标题从「一条能运行的路径，一组明确的证据边界。」改成「从碰一下冰箱门，到确认一个计划。」

封面换成成品界面（2026-11-16，本人定：封面可以用团队的资料，不一定用线框图）
- 青桔封面三块：`qingju/hifi-map`、`qingju/hifi-route`、`qingju/hifi-chests`，都裁自旧作品集文件 `lfqzkEzhH33yq5kvIkNEqW` 节点 `2206:20841`（2021 年方案展示页，原尺寸 1920 × 4980）的导出图。裁切范围：地图 (100,1270)–(900,2230)，路线讨论圈 (130,3860)–(925,4800)，宝箱 (930,1960)–(1820,2200)。封面底色 #404040 取自原稿。界面是团队高保真。原图 `sources/work/qingju-hifi/`，私有备份 `04-shared/网站原图/work/qingju-hifi/`。
- PlayBook 封面：`playbook/studio-campaign`（Studio 活动页，本人做的）+ `playbook/team-mission`、`playbook/team-home`（App 成品界面，团队做的），封面里两屏 App 各只显示第一屏（按 390:844 从顶部裁）。原来的 `playbook/studio-editor` 和 `playbook/app-craft-ready` 不再用作封面，正文里照旧。
- 封面标签：青桔「青桔 · 寻宝地图与路线讨论圈 · 2021」，PlayBook「PlayBook · Studio 活动页 + App 首页与任务页」。

## 2026-11-16：青桔新增第 07 节「2026 复盘」

- 依据：`03-qingju/portfolio/handoff.md` 第 2 节「新增 07」；本人在审核卡 20261116-004 上读过并通过，2026-11-16 在青桔会话里说「先合 07 节复盘」。交接单整体还是 draft，这次只合这一节，其他条目没动。
- 性质：07 节是本人 2026 年的回看判断，不含当年数据或效果数据。label 和标题里说明是 2026 年的回看，正文四段不带「2026 判断 ·」前缀（根 `CLAUDE.md`「通用」）。
- 第 4 段按本人在卡 20261116-004 上的批注改短，只留「没有请骑行者试用，低保真流程只在团队内部测过」；这句只有本人的话为据，没有记录。
- 提到的当年触点出自旧作品集 Figma `lfqzkEzhH33yq5kvIkNEqW`：`2206:20028`（定义活跃用户：试用、体验、习惯、分享四个阶段）、`2206:20579`（成长体系构建：入口 / 成长形式 / 出口）、`2206:20709`（电梯宣言与用户流程）、`2206:20841`（首页 banner、地图类型、寻宝地图、路线讨论圈）、`2206:21324`（骑行回忆）、`2206:21364`（合并记录、线下店铺、宝箱随机掉落、金银铜宝箱升级）。文字层摘录在 `03-qingju/research/ux-fit-2026-09-19/figma-evidence-1.json`。
- 落点：`cases.py` → `CASES['qingju']['sections']` 第 7 项，接在 06 之后；06 仍是 outcome 节，07 不加 `outcome`，没有图，`figures.py`、`prototypes.py` 没有改。
- 07 节的两张图（2026-11-16 加，卡 20261116-012：本人写「内容可以但是感觉可以加一些图表说明」，随后在青桔会话里说「做这两张」；交接单「07 节的两张图」一小节，交接单整体还是 draft，这次只加这两张图）：
  - 指标树 `qingju/retro-metric-tree-zh`、`-en`：原图 `03-qingju/portfolio/figures/retro-metric-tree-zh.png`、`-en.png`（2800×2136）。
  - 奖励时机实验 `qingju/retro-experiment-zh`、`-en`：原图 `03-qingju/portfolio/figures/retro-experiment-zh.png`、`-en.png`（2800×1488）。
  - 四张都由 `03-qingju/portfolio/figures/src/build_retro.mjs` 生成（HTML 排版，无头浏览器按 2 倍截图），2026-11-16。是 2026 年新画的图，不是当年的原稿。图里的内容只来自 07 节正文（四个阶段和三个数、三组触点出自段 1，保留 / 砍掉出自段 2，分组、主指标、成本出自段 3），没有新增事实和数字。
  - 复制到 `sources/work/qingju/`，导出成 1920×1465 和 1920×1020（正文栏 936 的 2 倍），只缩放和压缩，没有裁切。中文页取 `src`，英文页取 `src_en`。
  - 底色（2026-11-16 傍晚改）：四张原图重新生成，底色从白色改成网站页面底色 `#ECF0ED`（`--canvas`），只有方框是白的；内容、尺寸、文件名没变。原因是本人看过白底版，原话「在绿色页面上突然的白色有点突兀，内容没问题」（交接单「07 节的两张图」里「底色」一条）。新原图覆盖 `sources/work/qingju/` 里的同名文件，导出参数不变（宽 1920、质量 86）；导出后的 webp 四角实测 `#ECF1ED` / `#EDF0ED`（有损压缩差 1 级）。这两张图的图框跟着改成平铺：`figures.py` 条目加 `'bg': '#ECF0ED', 'flat': True`，`build.py` 的 `figure_html` 新增可选键 `flat`（给该图框加内联 `box-shadow:none`），没有白底、描边和投影；别的图框没有动，`styles.css` 没有改。label、alt、caption、来源标签、顺序、07 节文字都没动。
  - 来源标签：`figures.py` 的 `PROV` 新增键 `retro`（2026 复盘图 / 2026 diagram），两张图都用它。`figures.py` 新增 `('qingju', 7)`，先指标树、后实验。07 节文字没有动。交接单给的 `alt` 记在条目上，`build.py` 现在不读 `alt` 键（见下面 PlayBook 第二批一节「没接上的」那条），替代文字用的是 `label`。

## 2026-11-16：PlayBook 第二批文字（6 节变 8 节、三个决策块、动线图、奖励弹窗显示）

- 依据：`02-playbook/portfolio/handoff.md` 第 0a 节「本批交付：第二批文字」（2026-11-16 定稿，`status: ready` 只指这一节）。本人 2026-11-16 在会话里说「先合文字」。只合到本机预览，没有部署；合进网站以后本人还要细看一遍（卡 20261115-036），验收卡由 playbook agent 提。0a 没列的（交易市场一节、废案对比图、功能架构图、AI 回看小节、便签引句）这一次没合。
- 节号：新增 02「用户与动线」、07「收藏与展示」；原 02–06 顺延为 03、04、05、06、08。同步改了 `figures.py` 的 `('playbook', n)` 键（3→4、4→5、5→6、6→8）、`prototypes.py` 的 `section_demo`（Studio 导览 + 三段演示 + 录屏 2→3，合成点击流 3→4）、`tests/test_prototypes.py` 里取 Studio 那一节的节号。
- 新 02 节第 1、3 段：需求原文 FigJam `bGkaqSo1p0WEagLrWU3eL3` 节点 `1:111`「PlayBook Feature List」、`2:115`「PlayBook User Flow and Views」（客户方撰写）；App UX `3IhJOmCVR6WC8mJYbbYLA7` 首页 `704:52105`、任务 `704:61172`、合成 `704:61173`、以物换物 `704:61174`、个人主页 `704:55397`。
- 新 02 节第 2 段、三张画像卡：卡 20261115-024（画像是当年项目里做的一步，聊过以后凭印象整理）、025（和一些看虚拟主播的观众非正式聊过，人数没有记录）、036（本人读过）。卡片文字是 2026 年按本人口述重写的，当年画像的原件没找到。创作者一侧来自客户方与创作者及其公司的沟通：内容清单第 3 条。这些只记在这里，不上页面；页面不写聊过几位，也不写成调研得出。
- 新 02 节注释（冷启动）：会议一 00:32:14–00:33:48。
- 动线图 `playbook/flow-before-after-zh`、`-en`：原图 `02-playbook/portfolio/figures/flow-before-after-zh.png`、`-en.png`（2800×2980），由 `02-playbook/portfolio/figures/src/build_flow.py` 生成，2026-10-27 重画；上半按 FigJam `2:115` 重画，本人答可以放（卡 20261116-001 第 2 版）。复制到 `sources/work/playbook/`，导出成 1920×2043（正文栏 936 的 2 倍），只缩放和压缩，没有裁切。中文页取 `src`，英文页取 `src_en`。来源标签用「原稿对比」。
- 决策一（04 节）：会议一 01:03:13–01:06:51、01:08:08–01:08:46；会议二 00:05:40–00:08:35；废案 UX `656:15668`；UX 合成 `704:61173`；快速合成当年只画了两个静态状态（卡 20261115-023），页面不写动效；以物换物评审过并保留（卡 20261115-029）。
- 决策二（06 节）：会议一 00:33:56–00:35:26、00:40:08、00:43:17–00:44:28、00:51:34–00:53:50；UX `704:52105`、`704:61172`。
- 决策三、新 07 节：会议一 00:31:36–00:33:48、01:06:46–01:06:51、01:10:38–01:10:52；废案 UX 首页 `655:12599`；UX 个人主页 `704:55397`；UI `366:25318` / `191:3974`。07 节这一批没有图，展示柜状态图在 playbook agent 的待导出清单里。
- 08 节第 1 段「方案已交付开发」、第 3、4 段（本人的反思）：卡 20261115-037 本人的五条文件批注（2026-11-16 01:32），原文在交接单 6a。原话里的「哈希值」例子中文版不写，用了「名称过长」。原第 3 段「下一步，我会围绕一条配方做两端测试……」是 agent 早先起的，已拿掉。NIJISANJI 这一批不写。
- 三个决策整体：本人读过草稿（卡 20261115-036，2026-11-16 01:33）。会议一 = `02-playbook/meetings/transcripts/20231021135044-冯渝程预定的会议-逐字稿文本-1.pdf`，会议二 = `02-playbook/meetings/transcripts/20231023015703-冯渝程预定的会议-逐字稿文本-1.pdf`，时间戳是逐字稿里的时间。页面上客户方人员只写「客户方产品负责人 / the client’s product lead」。
- 决策块的做法：`cases.py` 的 section 上加可选键 `decision`（四行，每行 `[zh, en]`），`build.py` 渲染成 `<dl class="case-brief case-decision">`，放在正文之后、注释卡和图之前；行名在 `build.py` 的 `DECISION_LABELS`。交接单旧表里的「依据」一列不上页面，就是上面这几条。
- 奖励弹窗 `playbook/app-reward`（卡 20261115-026 选 B）：330×453 的弹窗局部，不是整屏。从手机条的 `items` 挪到新的 `partials`：不加 `screen` 类，按原比例完整显示，显示宽度上限就是原图宽度 330，不带放大按钮（桌面上已经是原图大小）。手机（520 以下）这条手机条不左右滑，改成上下排，两张图都能一眼看全。原图没有换，还是 330 宽；2 倍原图以后由 playbook agent 从 Figma 导出再换。走查静态检查（`04-shared/tools/walkthrough/check_figures.py`）只看 `items`，所以这张图它不再检查；实际显示尺寸是在浏览器里量的。
- 没接上的：`figures.py` 里动线图的 `alt`（交接单给了中英文）照青桔三张图的写法记在条目上，但 `build.py` 现在不读 `alt` 键，图片的替代文字用的还是 `label`。接上会同时改到青桔页面的替代文字，这一次没动。

## 2026-11-16 晚：青桔项目背景 + 01、04 节文字（交接单 2f）

- 依据：`03-qingju/portfolio/handoff.md`「2f. 2026-11-16 晚定稿：项目背景 + 五页的文字」；本人 2026-11-16 在青桔会话里说「合这两处」。交接单整体还是 draft，这次只合 2f 这一小节；2d 的旧草稿没有用。
- 项目背景：卡 20261116-002 本人选 B「维持：商业委托」（可以点名青桔（滴滴）是卡 20261115-040）。事实卡第 1 格改为「青桔（滴滴）商业委托 · 训练营结项」/ “Commercial brief from Qingju (DiDi) · Programme capstone”。案例页标题上方的小字和首页卡片那一行不是从 facts 取的，用的是 `build.py` 里 `PROJECTS` 青桔一项的 `type`，一并改成同一句。
- 归属：卡 20261115-044 第 2 版，本人答「五页都是不过我们经过了讨论」。事实卡「我的职责」加上问题拆解、用户流程；01 节第 1 段第二句主语从「团队」换成「我」。
- 01 节新增段（把“活跃”拆成四个阶段、通勤与休闲的判断）：旧作品集 Figma `lfqzkEzhH33yq5kvIkNEqW` 节点 `2206:19940`（问题拆解）、`2206:20028`（定义活跃用户）。
- 04 节新增第 1 段（观点陈述、“我们如何”、四个维度、五个方向、入口 → 成长形式 → 出口）：节点 `2206:20579`。这一页只核了文字层（`03-qingju/research/ux-fit-2026-09-19/figma-evidence-1.json`），没看图；五个方案原文是「设置宝藏地图、设置宝箱系统、开设路线讨论圈、骑行回忆功能、简化记录」。
- 04 节低保真一段开头加的一句（先画流程图）：节点 `2206:20709`（用户流程）。
- 落点：`cases.py` → `CASES['qingju']` 的 `facts` 第 1、2 格，`sections` 第 1 项（01）和第 4 项（04）的 `text`；`build.py` → `PROJECTS` 青桔的 `type`。
- 没动的：顶部三行摘要（brief）、标题、其他节、所有图和图注，`figures.py`、`prototypes.py`。带 74.8%、118.7% 的「核心使用场景」图没上（交接单记：分母对不上 85 或 128，等配图那一批再和本人确认）。

## 2026-11-16：PlayBook 第三批配图和新 08 节「交易与交换」（8 节变 9 节）

- 依据：`02-playbook/portfolio/handoff.md` 第 0b 节「本批交付：第三批配图和『交易与交换』一节」。本人 2026-11-16 在会话里说「先出图」。只合到本机预览，没有部署；验收卡由 playbook agent 提。
- 图都在 `02-playbook/portfolio/figures/`，2026-11-16 从 Figma 导出后切出来的，只切、没改内容；切法在 `02-playbook/portfolio/figures/src/build_batch3.py`，导出的原图在 `figures/src/figma-1x/`、`figma-2x/`。16 张复制到 `sources/work/playbook/`，在 `tools/prepare_assets.py` 登记，只缩放和压缩，没有再裁。
- 节号：新增 08「交易与交换」，原 08「交付与反思」顺延为 09；`figures.py` 的 `('playbook', 8)` 改成 `('playbook', 9)`，新增 `('playbook', 7)`、`('playbook', 8)`。`prototypes.py` 里按节号匹配的演示在 03、04 节，没有变。
- `playbook/app-furnace-draft`（04 节，熔炉废案稿）：App UX `3IhJOmCVR6WC8mJYbbYLA7` 废案页，画框 `656:15668`「Inventory View (Global)」，2 倍导出（780×2160）。本人画的（卡 20261115-022）。
- `playbook/app-reward`（06 节，换成 2 倍图 660×906）、`playbook/app-home-events-only`（06 节，780×2658）：同文件分区 `704:52105`（首页状态组）2 倍导出后切出；分区里各画框的节点号没有逐个查。原来 330 宽的 `04-shared/output/portfolio/assets/app-reward.png` 不再用，文件还在。「领取之后：每日任务离开首页」这个小标是 playbook agent 看图定的，等本人在验收卡上确认。
- `playbook/app-showcase-empty`、`-pick`、`-filled`、`-visitor`（07 节）：同文件分区 `704:55397`（个人主页与展示柜）2 倍导出后切出。
- `playbook/app-market-home`、`-listings`、`-trend`、`-buy-confirm`，`playbook/app-barter-market`、`-request`、`-consume`、`-received`（08 节）：同文件分区 `704:61174`（交易市场与以物换物）1 倍截图后切出（390 宽，2 倍图以后再换）。评审过并保留（卡 20261115-029）；中文版可以放挂单和价格走势（卡 20261115-030）。
- `playbook/feature-map`（02 节）：旧作品集 `lfqzkEzhH33yq5kvIkNEqW` 节点 `2234:20235`，2024 年秋整理作品集时画的（卡 20261115-032），不是当年的交付物；页面图注只写「2024 年秋整理」。图里的字是中文，中英文页用同一张。来源标签用「研究材料」。
- 新 08 节文字：「约 27 屏」出自 `04-shared/figma-盘点-2026-11-15/figma-盘点-playbook.md` 第 25 条；第 2 段两条确认规则是线框里看得到的（`app-market-buy-confirm`、`app-barter-request`）；第 3 段：卡 20261115-029。**这三段是 playbook agent 2026-11-16 新起草的，本人还没读过**，等验收卡。页面不写交易功能已上线或有人用过。
- 导出日期都是 2026-11-16。
- 显示上的处理（`build.py` 的 `figure_html`、`figures.py`）：
  - 熔炉废案稿是 390×1080 的长屏，熔炉在最底部；「推荐选择」是 390×770，不到一屏。两张都放在手机条的新键 `whole` 里：不套 390:844 的竖屏框，按原比例整张显示，顶对齐，带放大按钮。条目的第三项是它在这一排里的位置。
  - 04 节手机条从四张变五张，排一排（桌面每张约 155 宽）。
  - 奖励弹窗换 2 倍图以后，`'cap': {'playbook/app-reward': 330}` 把显示宽度上限留在 330。06 节手机条从两格变三格。
  - 08 节两条手机条共用后一条的图注；前一条的 `caption` 留空，`build.py` 不再输出空的图注行。
  - `whole` 和 `partials` 里的图不在 `04-shared/tools/walkthrough/check_figures.py` 的检查范围里（它只看 `items`）；这三张（熔炉稿、推荐选择、奖励弹窗）的实际显示尺寸是在浏览器里量的。
- 没接上的（和第二批一样）：功能架构图的 `alt` 记在 `figures.py` 上，`build.py` 不读 `alt` 键，页面替代文字用的是 `label`。
