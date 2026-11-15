# Case content is maintained as paired Chinese / English text.
# Statements are grounded in the source index in docs/sources.md.
CASES = {
'qingju': {
 'title':['青桔：让成长体系，回到骑行本身。','Qingju: making growth part of the ride.'],
 'deck':['将“提高活跃度”的业务目标，转化为围绕休闲骑行的探索、记录与奖励体验。','Turning an engagement brief into an experience built around discovery, memories and rewards in leisure cycling.'],
 'facts':[['项目背景','Context','商业委托 · 训练营结项','Commercial brief · Programme capstone'],['我的职责','My role','前期研究、访谈、画像、旅程图、低保真','Research, interviews, personas, journeys, wireframes'],['项目时间','Period','2021','2021'],['协作成果','Team output','研究与概念方案 · 高保真由团队完成','Research & concept · High fidelity by the team']],
 'image':'qingju-cover','source':'https://www.figma.com/design/lfqzkEzhH33yq5kvIkNEqW?node-id=2206-19887',
 'sections':[
 {'label':['01 / 问题','01 / The challenge'],'title':['为什么用户需要这套成长体系？','Why would a rider care about a growth system?'],'text':[
 ['原始任务是改良青桔的成长体系，以提高用户活跃度。团队对当时产品的分析发现，任务、等级、勋章与积分相互分散；用户需要进入较深层级，才能理解自己的进展与权益。','The brief was to improve Qingju’s growth system with user engagement as the goal. Our review of the product at the time found tasks, levels, badges and points separated from one another, with progress and benefits buried in the navigation.'],
 ['我提出把休闲骑行作为研究方向：通勤通常有固定目的，而在公园、绿道和城市探索中，人们还有“去哪里、看什么、如何留下回忆”的问题。这是我们选择探索的场景假设，随后围绕它开展研究。','I proposed leisure cycling as the research direction. Commuting usually has a fixed destination; parks, greenways and city exploration introduce questions about where to go, what to see and what to remember. This was a scenario hypothesis that shaped the research.']],
 'insight':['成长不应只是开锁之后累积的数字。它需要和用户想完成的骑行体验发生联系。','Growth should connect to what people want from a ride, rather than remain a number that accumulates after unlocking a bike.']},
 {'label':['02 / 研究','02 / Research'],'title':['先理解骑行，再讨论奖励。','Understand the ride before designing the reward.'],'text':[
 ['我们结合访谈、问卷与实地观察，关注休闲骑行者的行为、动机、分享方式，以及对成长权益的感知。旧项目记录记载了 11 位访谈对象、128 份回收问卷与 85 份有效问卷。','We combined interviews, a questionnaire and field observation to explore leisure riders’ behaviour, motivations, sharing habits and awareness of benefits. The original project documentation records 11 interviewees, 128 questionnaire returns and 85 valid responses.'],
 ['访谈摘要中反复出现的线索包括：寻找不熟悉的小风景，与朋友一起探店，以及记录、回顾和分享骑行经历。我参与前期调研与访谈，并将这些线索整理到画像与旅程中。','Recurring themes in the interview summaries included discovering unfamiliar places, visiting shops with friends, and recording or sharing a ride. I contributed to the early research and interviews, then translated these themes into personas and journeys.']],
 'image':'qingju-research','caption':['原始研究摘要。以上样本数字沿用历史项目记录；研究聚焦休闲场景，不能代表所有骑行人群。','Original research summary. Sample counts are from the historical project record; the leisure-focused sample does not represent all riders.']},
 {'label':['03 / 综合','03 / Synthesis'],'title':['把机会放回骑行前、中、后。','Map the opportunities before, during and after a ride.'],'text':[
 ['单独列出“探索、社交、记录”并不足以指导界面。我通过用户建模与旅程图，把这些需求放回具体时刻：选择路线、在途中停留、结束后整理经历。','A list of needs—exploration, social connection, memories—was not enough to guide the interface. Through user modelling and journey maps, I connected them to specific moments: choosing a route, pausing along the way and reflecting afterwards.']],
 'steps':[
 [['骑行前','Before'],['降低路线选择成本','Make choosing easier'],['帮助用户找到符合兴趣的地点与路线，减少在不熟悉区域反复查找的负担。','Help people find places and routes that match their interests, reducing the effort of planning in an unfamiliar area.']],
 [['骑行中','During'],['保留探索与停留的空间','Leave room to explore'],['围绕沿途地点与骑行进程建立体验，避免成长体系与实际行为脱节。','Connect the experience to places along the route and progress through the ride.']],
 [['骑行后','After'],['让经历值得回顾','Make the ride memorable'],['把记录、奖励和分享连接起来，为一次骑行留下可以继续使用的内容。','Connect memories, rewards and sharing so the experience has value beyond the journey itself.']]],
 'image':'qingju-journey','caption':['项目原始旅程图：用于综合行为与机会点，并非用户情绪的量化测量。','Original journey map: a synthesis of behaviours and opportunities, not a quantitative measurement of emotion.']},
 {'label':['04 / 设计决策','04 / Design decision'],'title':['让奖励跟随体验，而不是另开一套任务。','Let rewards follow the experience.'],'text':[
 ['我们没有把“增加一套积分与勋章”作为唯一答案，而是从路线探索出发，把骑行记录和成长权益接到同一条路径上。用户先获得骑行本身的价值，再理解参与如何带来奖励。','We did not treat another points-and-badges system as the only answer. Instead, we connected route discovery, ride records and growth benefits in one path. The ride itself provides value first; rewards make sense within that experience.'],
 ['我负责的低保真阶段把机会转化为可讨论的页面与流程，包括路线选择、骑行记录、奖励和分享。这让团队能围绕入口与任务顺序进行讨论，再进入最终视觉方案。','My low-fidelity work translated the opportunities into screens and flows for route selection, ride records, rewards and sharing. It gave the team a concrete basis for discussing entry points and task order before the final visual design.']],
 'image':'qingju-wireframes','caption':['原始低保真流程。个人贡献聚焦研究、用户建模、旅程与低保真；最终高保真为团队成果。点击可放大。','Original wireframe flow. My contribution focused on research, modelling, journeys and low fidelity; final high fidelity was a team output. Select to enlarge.']},
 {'label':['05 / 取舍','05 / Trade-offs'],'title':['探索可以很丰富，产品需要有边界。','A rich concept still needs boundaries.'],'text':[
 ['把路线、商铺与奖励连接起来，能够形成更完整的体验，也会增加内容、合作与运营成本。我们没有把每一个有趣的想法都加入首版，而是围绕骑行前后的核心路径组织方案。','Connecting routes, shops and rewards creates a more complete experience, but also brings content, partnership and operational costs. We did not include every interesting idea in the first proposal; we organised it around the core journey before and after riding.'],
 ['回看这个项目，我会先验证一个较小的闭环：用户能否找到想骑的路线、完成骑行，并理解记录与奖励的关系。更广泛的合作与生态设想，需要在这条路径成立之后再展开。','Looking back, I would validate a smaller loop first: can someone find a route they want to ride, complete it, and understand the relationship between the ride record and its reward? Wider partnerships should follow evidence that this loop works.']]},
 {'label':['06 / 交付与反思','06 / Outcome & reflection'],'title':['从业务目标，走到可讨论的完整方案。','From a business goal to a concrete experience proposal.'],'text':[
 ['这次项目形成了研究摘要、画像与旅程、低保真流程，以及团队高保真方案。我最核心的贡献，是提出休闲骑行方向，并将研究线索推进到具体流程。','The project produced a research synthesis, personas and journeys, wireframe flows, and a team high-fidelity proposal. My central contribution was proposing the leisure-cycling direction and carrying research themes into concrete flows.'],
 ['这篇案例展示的是研究与设计交付。现有材料尚不能支持上线后活跃度提升的结论；下一步应观察真实骑行者能否独立理解并完成这条体验路径。','This case presents research and design delivery. The available material does not establish an improvement in live engagement. The next step would be observing whether riders can independently understand and complete the proposed journey.']], 'outcome':True}
 ]},
'playbook': {
 'title':['PlayBook：把复杂规则，变成可参与的体验。','PlayBook: complex rules, meaningful participation.'],
 'deck':['创作者在 Studio 中定义活动与物品规则，粉丝在 App 中参与、收集与合成。我连接两端的交互逻辑，让自由度变得可以理解。','Creators define campaigns and item rules in Studio; fans participate, collect and craft in the App. I connected the interaction logic between these two sides.'],
 'facts':[['项目背景','Context','创业团队 · 海外创作者平台','Startup · Creator & fan platform'],['我的职责','My role','Studio UX/UI · App UX','Studio UX/UI · App UX'],['项目时间','Period','2023–2024','2023–2024'],['交付','Delivery','交互流程、界面、状态与演示原型','Flows, interfaces, states & prototypes']],
 'image':'studio-campaign','source':'https://www.figma.com/design/XDyOn5545LrSOsCwqUcED7?node-id=5562-28622',
 'sections':[
 {'label':['01 / 产品关系','01 / Product model'],'title':['一条规则，连接创作者与粉丝。','One rule connects the creator and the fan.'],'text':[
 ['PlayBook 希望让创作者与粉丝的关系在不同内容平台之间保持连续。产品探索通过任务、可收集物品和合成规则，让粉丝表达参与与支持。它需要作为原有内容渠道的补充，帮助用户回到创作者的内容。','PlayBook aimed to keep the relationship between creators and fans continuous across content platforms. Tasks, collectible items and crafting rules offered ways for fans to express participation. The product needed to complement existing channels and lead people back to the creator’s content.'],
 ['我负责 Studio 的 UX 与 UI，以及 App 的 UX 流程和交互状态；App 的视觉 UI 由另一位设计师完成。两端的核心挑战相同：一项自由配置的规则，到了使用时必须能被理解。','I designed Studio’s UX and UI, alongside the App’s UX flows and interaction states. Another designer created the App’s visual UI. Both sides shared a core challenge: a freely configured rule must become understandable when someone uses it.']],
 'steps':[
 [['Studio','Studio'],['配置','Configure'],['创作者组织活动、任务、物品与合成规则。','Creators organise campaigns, tasks, items and crafting rules.']],
 [['App','App'],['参与','Participate'],['粉丝在创作者社区中找到任务并获得物品。','Fans find tasks in a creator’s community and acquire items.']],
 [['Community','Community'],['表达联系','Express connection'],['通过收集、使用与展示物品，体现与创作者的关系。','Collecting, using and displaying items reflects the relationship with the creator.']]]},
 {'label':['02 / Studio','02 / Studio'],'title':['编辑规则时，就能看见它如何运作。','Show the logic while the rule is being edited.'],'text':[
 ['规则编辑器把必需输入、可选输入、条件分支与输出放在同一张画布上。以原稿中的配方为例，手柄与电池是必需材料，增压器是可选材料；是否选择它，决定输出属性如何计算。','The rule editor places required inputs, optional inputs, conditional branches and outputs on one canvas. In the source example, a gamepad and battery are required, while a supercharger is optional. Selecting it changes how an output attribute is calculated.'],
 ['这种结构让创作者能追踪输入与结果的关系。代价是画布复杂度：自由度越高，越需要验证首次使用者能否找到入口、解释自己建立的规则，以及修正错误。','This structure makes the relationship between inputs and outcomes traceable. Its trade-off is canvas complexity: greater flexibility makes it more important to test whether first-time creators can find the entry point, explain their rule and correct mistakes.']],
 'image':'studio-editor','caption':['Studio 配方编辑器原稿，个人负责 UX/UI。这里是确定性规则编辑，并非 AI 工作流。','Original Studio recipe editor; my UX/UI work. This is deterministic rule editing, not an AI workflow.']},
 {'label':['03 / App','03 / App'],'title':['让粉丝先理解代价，再确认合成。','Make the cost clear before the fan confirms.'],'text':[
 ['我早期尝试过更游戏化的“熔炉”交互。产品讨论之后，我把方向调整为更直接的配方浏览：查看要求、判断材料是否足够、确认消耗与可能获得的结果。','An early direction explored a more game-like “furnace” interaction. Product discussions led me toward a more direct recipe-browsing flow: inspect requirements, understand readiness, then confirm consumption and possible outcomes.'],
 ['材料不足、条件满足和确认合成是三个不同状态。即使提供快速合成，也需要让用户在承诺之前看清楚会失去什么、得到什么。','Missing materials, requirements met and confirmation are distinct states. Even quick crafting needs to make the consequence clear before the user commits.']],
 'phones':['app-craft-insufficient','app-craft-ready','app-craft-confirm'],
 'caption':['App 原始 UX 状态：材料不足 → 满足要求 → 确认合成。App 视觉 UI 为另一位设计师的贡献。','Original App UX states: missing materials → requirements met → confirm crafting. App visual UI was another designer’s contribution.']},
 {'label':['04 / 上下文与发现','04 / Context & discovery'],'title':['社区上下文保持一致，发现入口允许跨越。','Keep community context coherent, but discovery open.'],'text':[
 ['首页、物品与任务都需要回答“这是哪位创作者的社区”。我把创作者切换视为共享上下文，让相关内容保持一致。','Home, items and missions need to answer the same question: whose community is this? I treated creator selection as shared context so related content remained coherent.'],
 ['我最初倾向于把搜索限制在单个创作者内。2023 年 10 月的产品评审明确了创作者联动的重要性，我们随后转向独立的全局搜索入口，覆盖创作者、物品、配方与用户。日常任务保留上下文，发现则可以跨社区。','I initially favoured search within a single creator’s world. In the October 2023 product reviews, creator collaboration emerged as a central goal. We moved toward a dedicated global search covering creators, items, recipes and users, retaining local context for everyday tasks.']],
 'insight':['一致的上下文帮助用户定位；过于严格的边界，也可能阻碍产品需要的连接。','Consistent context helps people orient themselves. A boundary that is too strict can prevent the connections the product needs.']},
 {'label':['05 / 反馈与协作','05 / Feedback & collaboration'],'title':['小进度，不需要每次都打断用户。','Small progress should not always interrupt.'],'text':[
 ['在评审中，我提出日常小任务与重大成就不应使用同等强度的反馈。频繁全屏弹窗会打断内容体验；较轻的反馈可以承接日常进展，重要奖励则保留明确的领取动作。','In reviews, I argued that routine tasks and significant achievements should not receive equally intrusive feedback. Frequent full-screen dialogs interrupt the experience. Lighter feedback can support everyday progress, while valuable rewards keep an intentional claim step.'],
 ['这些取舍通过页面、状态与交互演示进入产品讨论，也被用于团队对外的产品与投资沟通。设计的作用，是把抽象规则变成团队可以共同检视的行为。','Screens, states and interaction demonstrations brought these trade-offs into product discussions and supported product and investor communication. The design made abstract rules concrete enough for the team to examine together.']]},
 {'label':['06 / 交付与反思','06 / Outcome & reflection'],'title':['团队可以讨论行为，而不只是页面。','The team could discuss behaviour, not just screens.'],'text':[
 ['交付覆盖 Studio UX/UI、App UX 流程与状态，以及演示原型。团队变动中断了进一步优化，项目没有完成全面开发交付；因此这里呈现设计与原型成果。','The delivery included Studio UX/UI, App UX flows and states, and demonstration prototypes. Team changes interrupted further improvements before a complete development hand-off, so this case presents design and prototype outcomes.'],
 ['下一步，我会围绕一条配方做两端测试：创作者能否解释刚建立的规则，粉丝能否在确认前预测成本与结果。成功标准应是理解、完成与错误恢复，而不是页面数量。','Next, I would test a recipe from both sides: can a creator explain the rule they just made, and can a fan predict its cost and result before confirming? Understanding, completion and recovery matter more than screen count.']], 'outcome':True}
 ]},
'smt': {
 'title':['兴业 SMT：从业务单元，建立界面秩序。','Industrial Securities SMT: a shared structure for financial workflows.'],
 'deck':['在武汉优品楚鼎科技有限公司任职期间，我与同事共同研究业务模块的拆分，负责相关 Figma 组件、使用规范与维护，让高密度金融界面能够复用。','At Wuhan Youpin Chuding Technology, I worked with colleagues to break down business modules, then designed and maintained the relevant Figma components and specifications.'],
 'facts':[['项目背景','Context','武汉优品楚鼎科技有限公司 · 兴业 SMT','Wuhan Youpin Chuding Technology · Industrial Securities SMT'],['我的职责','My role','组件设计、使用规范与维护','Component design, specifications & maintenance'],['协作方式','Collaboration','与同事共同研究业务单元拆分','Collaborative business-unit decomposition'],['交付范围','Delivery','Figma 组件与规范','Figma components & guidelines']],
 'image':'smt-overview','source':'https://www.figma.com/design/RXWxFWgHwWEXBBcLQ6LlZB?node-id=0-5802',
 'sections':[
 {'label':['01 / 问题','01 / The challenge'],'title':['一张表格承载的，是一项业务任务。','A table carries a task, not just data.'],'text':[
 ['证券工具把账户、市场、持仓、数值和操作放在同一个密集工作面中。视觉相似的控件，可能对应完全不同的业务后果；因此，组件划分不能只看外观。','A securities tool brings accounts, markets, positions, values and actions into a dense working surface. Visually similar controls can have very different consequences, so component boundaries cannot be based on appearance alone.'],
 ['这次工作的目标，是在减少重复界面构建的同时，保留业务含义。我与同事共同研究组件库方法与业务单元拆分，再把相关结构推进到组件和规范。','The aim was to reduce repeated interface construction while preserving business meaning. I researched component-library methods and business-unit decomposition with colleagues, then developed the relevant structures into components and guidelines.']],
 'steps':[
 [['Context','Context'],['我在看哪个账户？','Which account?'],['账户和市场决定了如何理解数据。','Account and market context determine how the data should be understood.']],
 [['State','State'],['现在是什么状态？','What is happening?'],['默认、选中、悬停与无数据需要不同反馈。','Default, selected, hover and no-data states need distinct feedback.']],
 [['Action','Action'],['我可以执行什么？','What can I do?'],['操作应属于明确任务，并保留其业务意义。','Each action belongs to a task and must retain its business meaning.']]]},
 {'label':['02 / 拆分','02 / Decomposition'],'title':['用业务含义，而非视觉相似度，决定复用边界。','Use business meaning to decide what can be shared.'],'text':[
 ['以账户持仓为例，表格、账户上下文与操作控件可以拆分为可复用单元，同时保留它们之间的关系。共享结构只有在含义与行为相符时才成立。','For account positions, the table, account context and controls can become reusable units while keeping their relationships explicit. A shared structure only works when its meaning and behaviour match.'],
 ['我的职责包括相关组件设计、使用规范与持续维护。对于不同任务中特有的规则，保留差异比强行统一更重要。','My responsibility included the relevant component design, usage specifications and ongoing maintenance. Where tasks have different rules, preserving those differences matters more than forcing consistency.']],
 'insight':['组件的边界，也是一项产品设计决策。','A component boundary is also a product-design decision.']},
 {'label':['03 / 状态','03 / States'],'title':['状态变化，阅读结构保持稳定。','Let state change without moving the reading structure.'],'text':[
 ['源文件的“表格／账户持仓”组件包含默认、选中、悬停与无数据变体。反馈需要让用户理解发生了什么，同时保持信息的位置与阅读顺序稳定。','The source “Table / Account Positions” component includes default, selected, hover and no-data variants. Feedback needs to explain what changed while keeping information position and reading order stable.'],
 ['这使组件规范不仅回答“长什么样”，还明确“在不同情况下如何表达”。一致的状态定义，也为后续维护提供共同依据。','The specification therefore addresses both appearance and behaviour across situations. Consistent state definitions also give maintenance work a shared reference.']],
 'image':'smt-states','caption':['账户持仓组件的原始状态截取。源组件还包含无数据变体；该变体未显示在这张截图中。','Original account-position state crop. The source also includes a no-data variant, which is not visible in this image.']},
 {'label':['04 / 规范与维护','04 / Specifications & maintenance'],'title':['复用结构，保留操作的不同含义。','Share the structure; preserve the meaning of the action.'],'text':[
 ['买入、卖出、确认、取消和输入控件具有相关结构，但它们不是同一种动作。我维护这些组件与规范，让重复模块有一致基础，同时保留任务之间的区别。','Buy, sell, confirm, cancel and input controls have related structures, but are not the same action. I maintained components and specifications to give repeated modules a consistent foundation while preserving these distinctions.'],
 ['组件被用于跨项目复用与日夜主题适配。这些经验说明了维护上的价值，但没有历史工时统计，因此不把它写成未经测量的效率提升比例。','The components supported cross-project reuse and day/night theme adaptation. These experiences demonstrate a qualitative maintenance benefit; historical time savings were not measured.']],
 'image':'smt-trade-components','caption':['原始控件与变体。展示相关组件设计与维护范围，不代表独立负责整个证券产品。','Original controls and variants. These show my component design and maintenance scope, not sole ownership of the securities product.']},
 {'label':['05 / 交付与反思','05 / Outcome & reflection'],'title':['可复用的设计基础，来自明确的边界。','A reusable design foundation starts with clear boundaries.'],'text':[
 ['交付是 Figma 组件、使用规范与维护工作。我参与了方法研究和业务拆分，个人职责不包含软件开发交付。','The delivery was Figma components, usage guidelines and maintenance. I contributed to the shared method research and business decomposition; software implementation was outside my responsibility.'],
 ['如果继续验证这套方法，我会比较重复模块的组装时间、遗漏状态的数量，以及一次修改同步到多个实例的维护成本。它们能更具体地判断复用是否真正帮助了团队。','To evaluate this approach further, I would compare repeated-module assembly time, omitted states and the effort needed to carry a change across instances. These measures would show more concretely whether reuse helps the team.']], 'outcome':True}
 ]},
'commons-fridge': {
 'title':['The Commons Fridge：共享空间，也共享清晰的边界。','The Commons Fridge: shared space, clearer boundaries.'],
 'deck':['通过五次习惯访谈，把全量库存管理的设想转向更轻量的共享协调：看见物品，了解归属，再决定可以做什么。','Five habit interviews redirected a full-inventory concept toward lighter shared coordination: see the item, understand ownership, then decide what can be done.'],
 'facts':[['项目背景','Context','南安普顿大学 · 硕士毕业设计','University of Southampton · MA final project'],['我的职责','My role','研究、系统设计、交互与功能原型','Research, system design, interactions & prototype'],['项目时间','Period','2026','2026'],['交付','Delivery','实体入口、双语原型与研究者演示','Physical touchpoints, bilingual prototype & demonstration']],
 'image':'fridge-p1-0','source':'https://www.figma.com/design/lx9WbYRybWceTemdXVkoJj?node-id=190-148',
 'sections':[
 {'label':['01 / 研究','01 / Research'],'title':['冰箱里的问题，也是人与人之间的问题。','The friction is social as well as practical.'],'text':[
 ['我通过五次访谈了解人们已有的共享冰箱习惯。研究中出现的不只是“忘记了什么”，还有提醒别人时的顾虑、长期由一个人承担的整理工作，以及模糊边界下反复发生的冲突。','I conducted five interviews about existing shared-fridge habits. The problems went beyond forgotten items: hesitation about reminding someone, recurring care work falling to one person, and repeated conflict around unclear boundaries.'],
 ['例如，U02 担心群消息听起来像抱怨；U01 承担检查和整理；U05 的经历反映了边界与容量压力如何影响参与。这些是特定受访者的经验，而不是人群层面的统计结论。','U02 worried that a group message could sound like a complaint; U01 carried the work of checking and organising; U05 described how boundaries and capacity pressure affected participation. These are individual accounts, not population-level statistics.']],
 'insight':['让下一步行动更清楚，同时避免把提醒变成“谁做错了”的公开记录。','Make the next shared action clearer without turning a reminder into a public record of who failed.']},
 {'label':['02 / 设计转向','02 / Reframing'],'title':['减少管理负担，而不是建立更大的台账。','Reduce the burden instead of building a bigger inventory.'],'text':[
 ['最初的全量记录方案依赖每个人不断输入与维护信息，可能给已经承担整理的人增加工作。我把重心转向几个真正需要协调的时刻：放入物品、检查处理、购物前查看，以及搬走时交接。','A complete inventory depends on people continually entering and maintaining information. That can add work for the person already doing the organising. I shifted toward moments that need coordination: putting something in, checking or handling it, shopping and moving out.']],
 'steps':[
 [['Put in','Put in'],['记录意图','Declare a plan'],['只记录与下一步有关的计划，而非要求完整登记。','Capture the chosen plan rather than demand a complete inventory.']],
 [['Check','Check'],['看见需要关注的事','See what needs attention'],['按区域组织信息，避免把人变成问题标签。','Group by area rather than attaching a problem label to a person.']],
 [['Coordinate','Coordinate'],['保留归属与权限','Respect ownership'],['看到一件物品，并不意味着获得处置它的权限。','Seeing an item does not give someone permission to dispose of it.']]]},
 {'label':['03 / 交互规则','03 / Interaction rules'],'title':['位置、归属、权限，是三件不同的事。','Location, ownership and permission are separate.'],'text':[
 ['我将物品在哪里、谁声明拥有它，以及别人可以做什么分开。无人认领的物品保持“未知归属”；位置和照片都不能自动证明所有者，也不能自动授权他人处理。','I separated where an item is, who claims it and what someone else may do with it. Unclaimed items retain unknown ownership. Neither a location nor a photograph automatically establishes an owner or permission to act.'],
 ['House 视图按区域分组，而不是按人分组。角色只描述情境，不评价个人；界面也不判断食物是否安全，判断与行动仍由人做出。','The House view groups items by area, not by person. The character describes situations without judging people. The interface does not determine food safety; judgement and action remain with the person.']],
 'image':'fridge-p22-0','caption':['提交稿中的功能界面截图。它展示设计规则与可运行流程，不是多人同步服务。','Functional interface image from the submitted project. It demonstrates the rules and working flow, not a synchronised multi-user service.']},
 {'label':['04 / 实体与数字','04 / Physical & digital'],'title':['把入口放在行动发生的地方。','Put the entry where the action happens.'],'text':[
 ['冰箱门上的 Add 与 Manage 是两个清晰的入口，分别支持放入时记录意图和查看已有物品。NFC 链接与二维码把实体提示连接到手机上的详细流程。','Add and Manage are two clear entry points on the fridge door: record an intention when putting something away, or review what is already there. NFC links and a QR fallback connect the physical prompt to the detailed phone flow.'],
 ['企鹅形象承担温和提醒的角色。我通过 AI 辅助视觉迭代，选择并整理了一套一致的角色系统，让提醒保持中性。角色偏好与入口可靠性仍需要参与者测试。','The penguin gives reminders a caring tone. I used AI-assisted visual iteration, then selected and refined a consistent character system. Character preference and entry-point reliability still require participant testing.']],
 'image':'fridge-p18-1','caption':['真实厨房中的研究者演示：实体触点打开手机原型。并非参与者可用性测试。','Researcher demonstration in a real kitchen: the physical touchpoint opens the phone prototype. This was not a participant usability test.']},
 {'label':['05 / 原型与结果','05 / Prototype & outcome'],'title':['一条能运行的路径，一组明确的证据边界。','A working journey, with clear evidence boundaries.'],'text':[
 ['最终功能原型 v1.7 将七条路由与中英双语放在同一页面中。研究者演示记录了触碰入口、持物操作、输入信息与确认计划的路径。','The final v1.7 functional prototype brings seven routes and both languages into one page. A researcher demonstration documents the sequence of touching the entry, working with an item, entering details and confirming a plan.'],
 ['现有访谈研究的是生活习惯；没有参与者使用设计的正式测试。演示证明流程可运行，不能证明采用率、偏好或减少食物浪费。原型中的共享视图使用单个浏览器内的示例记录，不做跨设备同步。','The interviews investigated habits; participants did not formally test the design. The demonstration establishes that the flow runs, not adoption, preference or reduced food waste. The shared view uses example records in one browser without cross-device synchronisation.']],
 'external':['https://ideaism.github.io/commons-fridge-functional-v1/',['打开功能原型 ↗','Open the functional prototype ↗']], 'outcome':True},
 {'label':['06 / 下一步','06 / Next iteration'],'title':['先观察人如何使用，再判断设计是否成立。','Observe use before claiming effectiveness.'],'text':[
 ['下一轮会优先验证“计划”式表达能否被首次使用者理解，再比较角色方向与 NFC 入口。已有比较测试材料，但此前未实际执行；新的测试需要在合适的研究范围与同意流程下开展。','The next iteration would test whether first-time users understand the plan-based framing, then compare character directions and NFC entry points. A comparison kit exists but was not run; future testing needs an appropriate research scope and consent process.'],
 ['我也希望寻找能够成功维护共享库存的反例家庭。现有样本对失败的描述更充分，反例能帮助判断哪些复杂度应该保留、哪些可以删去。','I would also seek a household that successfully maintains a shared inventory. The existing sample describes failure more fully; a counterexample could clarify which complexity is useful and which can be removed.']]}
 ]}
}
