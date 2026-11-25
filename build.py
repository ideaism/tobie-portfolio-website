"""Generate the bilingual static site into dist/.

  python3 tools/prepare_assets.py   # only when source images change
  python3 build.py

Content: cases.py (case text), figures.py (evidence), prototypes.py (demos).
Design system: docs/design-system.md, implemented in dist/styles.css.
"""
from pathlib import Path
from html import escape
import json, re

from cases import CASES
from figures import FIGURES, PROV
from prototypes import section_demo

ROOT = Path(__file__).parent
OUT = ROOT / 'dist'
MANIFEST = json.loads((OUT / 'assets' / 'work' / 'manifest.json').read_text(encoding='utf-8'))
LEGACY = json.loads((ROOT / 'assets.json').read_text(encoding='utf-8'))          # exploration images
LINKEDIN = 'https://www.linkedin.com/in/yucheng-feng-18a9b0375/'
EMAIL = 'beijixinfei@gmail.com'
VERSION = '20261125b'    # 样式表或脚本改了就要换这个号，不然访客的浏览器会继续用旧的缓存
SITE = 'https://www.tobiefeng.com'       # 线上地址，必须带 www；canonical、分享卡片、站点地图都用它

def t(zh, en, lang): return zh if lang == 'zh' else en
def T(pair, lang): return pair[0] if lang == 'zh' else pair[1]
def url(slug, lang): return ('/en' if lang == 'en' else '') + ('/' if not slug else f'/work/{slug}/')

def img(name, alt, cls='', lazy=True):
    w, h = MANIFEST[name]
    attrs = f' class="{cls}"' if cls else ''
    if lazy:
        attrs += ' loading="lazy" decoding="async"'
    return f'<img src="/assets/work/{name}.webp" width="{w}" height="{h}" alt="{escape(alt)}"{attrs}>'

def legacy_img(name, alt):
    w, h = LEGACY[name]
    return f'<img src="/assets/{name}.webp" width="{w}" height="{h}" alt="{escape(alt)}" loading="lazy" decoding="async">'

def frame_label(name, prov_text, prov_cls='', project='explore'):
    prov = f'<span class="prov {prov_cls}">{prov_text}</span>' if prov_text else ''    # 来源小标签不显示时整个不出（见 prov_shown）
    return (f'<div class="frame-label" style="--project:var(--p-{project})"><span class="frame-label__name"><span>{name}</span></span>'
            f'{prov}</div>')


# 2026-11-18 卡 20261118-021 本人「同意」（交接单 8b 第 5 条）：图上的来源小标签只留必要的——团队 UI、生成插画两种、
# 按项目记录绘制、提交稿 / 原稿对比 / 回看。下面四类是本人自己的图，图注里已经说了是什么，不显示；figures.py 里的数据照旧留着。
PROV_HIDDEN = {'original', 'wire', 'research', 'photo'}
def prov_shown(key):
    return (['', ''], '') if key in PROV_HIDDEN else PROV[key]


# ------------------------------------------------------------------ shell
def head(title, desc, lang, path):
    other = ('/en' + path) if lang == 'zh' else (path[3:] or '/')
    zh_path, en_path = (path, other) if lang == 'zh' else (other, path)
    return f'''<!doctype html>
<html lang="{'zh-CN' if lang == 'zh' else 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script>(function(){{var m=/^(ai|ux|fin)\\./.exec(location.hostname);if(m)document.documentElement.setAttribute('data-track',m[1])}})()</script>
<title>{escape(title)}</title>
<meta name="description" content="{escape(desc)}">
<meta name="theme-color" content="#ECF0ED">
<link rel="canonical" href="{SITE}{path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Tobie · Yucheng Feng">
<meta property="og:locale" content="{'zh_CN' if lang == 'zh' else 'en_GB'}">
<meta property="og:url" content="{SITE}{path}">
<meta property="og:title" content="{escape(title)}">
<meta property="og:description" content="{escape(desc)}">
<meta property="og:image" content="{SITE}/assets/share-{lang}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" hreflang="zh-CN" href="{SITE}{zh_path}">
<link rel="alternate" hreflang="en" href="{SITE}{en_path}">
<link rel="alternate" hreflang="x-default" href="{SITE}{en_path}">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%230E2A27'/%3E%3Ccircle cx='32' cy='32' r='12' fill='%23F7775F'/%3E%3C/svg%3E">
<link rel="preload" href="/assets/fonts/AtkinsonHyperlegibleNext-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/styles.css?v={VERSION}">
<script src="/site.js?v={VERSION}" defer></script>
<script src="/prototype.js?v={VERSION}" defer></script>
</head>
<body>
'''

def topbar(lang, path, current=''):
    other = ('/en' + path) if lang == 'zh' else (path[3:] or '/')
    home = url('', lang)
    links = [('work', t('作品', 'Work', lang), f'{home}#work'), ('explore', t('探索', 'Explorations', lang), f'{home}#explorations'),
             ('about', t('关于', 'About', lang), f'{home}#about'), ('contact', t('联系', 'Contact', lang), '#contact')]
    nav = ''.join(f'<a href="{href}"{" aria-current=\"page\"" if key == current else ""}>{label}</a>' for key, label, href in links)
    return f'''<a class="skip" href="#main">{t('跳到正文', 'Skip to content', lang)}</a>
<header class="topbar" data-component="Top bar"><div class="wrap topbar__inner">
 <a class="brand" href="{home}" aria-label="Tobie — {t('首页', 'home', lang)}"><span class="brand__dot" aria-hidden="true"></span>Tobie<span class="brand__sub">Yucheng Feng · 冯渝程</span></a>
 <nav class="nav" id="nav" aria-label="{t('主导航', 'Main', lang)}">{nav}<a class="nav__lang" href="{other}" lang="{'en' if lang == 'zh' else 'zh-CN'}" hreflang="{'en' if lang == 'zh' else 'zh-CN'}">{t('EN', '中文', lang)}</a></nav>
 <button class="menu-btn" type="button" aria-controls="nav" aria-expanded="false">{t('菜单', 'Menu', lang)}</button>
</div></header>
'''

def footer(lang):
    return f'''<footer class="contact" id="contact" data-component="Contact">
 <div class="wrap">
  <div class="contact__grid">
   <div>
    <span class="label">{t('一起聊聊', 'Let’s talk', lang)}</span>
    <h2>{t('好的合作，<br>从一次对话开始。', 'Good work starts<br>with a conversation.', lang)}</h2>
    <a class="contact__mail" href="mailto:{EMAIL}">{EMAIL} <span aria-hidden="true">↗</span></a>
    <div class="contact__links">
     <span class="contact__wechat">{t('微信 beijixinfei', 'WeChat beijixinfei', lang)}</span>
     <a href="{LINKEDIN}" target="_blank" rel="noopener">LinkedIn ↗</a>
     <a href="/assets/Yucheng-Feng-Portfolio.pdf" target="_blank" rel="noopener">{t('PDF 作品集', 'Portfolio PDF', lang)} ↗</a>
     <a href="#main">{t('回到顶部', 'Back to top', lang)} ↑</a>
    </div>
   </div>
   <div class="contact__penguins">{img('fridge/penguin-duo', t('Commons Fridge 项目中我设计的两只企鹅角色', 'The two penguin characters I designed for The Commons Fridge', lang))}</div>
  </div>
  <div class="footer-row">
   <span>© 2026 Yucheng Feng (Tobie)</span>
   <span>{t('字体 Atkinson Hyperlegible——为易读性而设计', 'Set in Atkinson Hyperlegible, a typeface designed for legibility', lang)}</span>
   <button type="button" class="structure-toggle" aria-pressed="false" style="color:#9FB7B1"><i aria-hidden="true"></i>{t('显示页面结构', 'Show page structure', lang)}</button>
  </div>
 </div>
</footer>
<dialog class="lightbox" aria-label="{t('放大查看', 'Enlarged image', lang)}"><button type="button" class="lightbox__close">{t('关闭', 'Close', lang)} ×</button><div class="lightbox__inner"><img alt=""><p></p><a target="_blank" rel="noopener">{t('打开原图', 'Open the image file', lang)} ↗</a></div></dialog>
</body>
</html>
'''


# ------------------------------------------------------------------ home
PROJECTS = [
 # 2026-11-17 新增第五个案例（交接单 05-agent-matrix/portfolio/handoff.md 第 0 节；标题是卡 20261115-002 选的 A）
 {'slug': 'agent-matrix', 'project': 'matrix', 'name': 'Agent Matrix', 'year': '2026',
  'type': ['个人项目 · 多 agent 协作', 'Personal project · Multi-agent workflow'],
  # 2026-11-25 重讲（交接单第 13 节，卡 20261125-001）：标题换成新标题的后半句（卡 20261124-012 选 A），摘要直接用新导语
  'title': ['我先设计 AI 怎么问我，再用它改这份作品集。', 'I designed how AI asks me. Then I used it to rework this portfolio.'],
  'summary': CASES['agent-matrix']['deck'],
  'chips': [['问题定义', '协作流程', '复盘'], ['Problem framing', 'Workflow design', 'Retrospective']],
  # 2026-11-25 封面换成四个机器人连到审核中心（卡 20261125-007 选 A），标签跟着换
  'label': ['Agent Matrix · 四个模型连到审核中心', 'Agent Matrix · four models wired into the review center'], 'prov': 'cover-ill'},
 {'slug': 'qingju', 'project': 'qingju', 'name': 'Qingju · 青桔', 'year': '2021',
  'type': ['青桔（滴滴）商业委托 · 训练营结项', 'Commercial brief from Qingju (DiDi) · Programme capstone'],
  'title': ['让成长体系，回到骑行本身。', 'Make growth part of the ride.'],
  'summary': ['把“提高活跃度”的业务目标，变成围绕休闲骑行的发现、记录与奖励。我们从研究一路做到高保真方案，获大赛最佳方案奖。', 'An engagement brief turned into discovery, memories and rewards around leisure riding. We carried it from research to a high-fidelity proposal that won the competition’s Best Proposal Award.'],
  'chips': [['用户研究', '旅程图', '原型', '最佳方案奖'], ['User research', 'Journey mapping', 'Prototyping', 'Best Proposal Award']],
  'label': ['青桔 · 寻宝地图与路线讨论圈，2021', 'Qingju · treasure map and route discussion, 2021'], 'prov': 'cover-ill'},
 {'slug': 'playbook', 'project': 'playbook', 'name': 'PlayBook', 'year': '2023–24',
  'type': ['创业团队 · 创作者平台', 'Startup · creator platform'],
  'title': ['把复杂规则，变成可参与的体验。', 'Turn creator rules into fan experiences.'],
  'summary': ['创作者在 Studio 里编辑规则，粉丝在 App 里参与、收集与合成。我让同一条规则在两端都能被理解。', 'Creators build rules in Studio; fans take part, collect and craft in the App. I made the same rule understandable on both sides.'],
  'chips': [['Studio UX/UI', 'App UX', '交互原型', '竞品分析'], ['Studio UX/UI', 'App UX', 'Prototyping', 'Competitive analysis']],
  'label': ['PlayBook · Studio 活动页 + App 首页与任务页', 'PlayBook · Studio campaign page + App home and missions'], 'prov': 'original'},
 {'slug': 'smt', 'project': 'smt', 'name': 'Industrial Securities · 兴业 SMT', 'year': '2022–23',
  'type': ['在职项目 · 证券桌面软件', 'In-house · securities software'],
  'title': ['从业务单元，建立界面秩序。', 'Let business meaning set component boundaries.'],
  'summary': ['与同事一起拆分业务单元，我负责组件、状态与使用规范，再用它们参与绘制交易、行情等页面，让高密度的金融界面可以复用。同期做的适老化方案被公司采纳为通用投标提案。', 'With colleagues I broke the product into business units; I designed and maintained the components, states and usage rules, then used them to help design trading and market-data screens, so a dense financial interface could be reused. My age-friendly proposal from the same period became the company’s standard pitch for bids.'],
  'chips': [['业务拆分', '组件设计', '适老化方案', '需求对接'], ['Business decomposition', 'Components', 'Age-friendly design', 'Requirements liaison']],
  'label': ['兴业 SMT · 项目卡', 'Industrial Securities SMT · project card'], 'prov': 'cover-gen'},
 {'slug': 'commons-fridge', 'project': 'fridge', 'name': 'The Commons Fridge', 'year': '2026',
  'type': ['硕士毕业设计', 'MA final project'],
  'title': ['共享一台冰箱，也共享清晰的边界。', 'Make shared care easier to negotiate.'],
  'summary': ['五场习惯访谈，把“全量库存”转向更轻的共享协调：看见物品，了解归属，再决定能做什么。附可运行的原型。', 'Five habit interviews turned a full-inventory idea into lighter coordination: see the item, understand ownership, then decide what you may do. Comes with a working prototype.'],
  'chips': [['质性研究', 'NFC 入口', '功能原型'], ['Qualitative research', 'NFC touchpoints', 'Working prototype']],
  'label': ['The Commons Fridge · 原型首页', 'The Commons Fridge · prototype home'], 'prov': 'cover-ill'},
]

# 首页「精选作品」和案例页底部「下一个项目」的先后顺序。改顺序只改这一行。
# 2026-11-17 本人定（卡 20261115-049 第 2 版选 C）：PlayBook → 兴业 SMT → 冰箱 → 青桔。
# PlayBook 最前是 11-16 说的，后面三个照 11-15 选的先后。Agent 矩阵 2026-11-17 进来，放第一个（卡 20261115-003 选 A）。
PROJECT_ORDER = ['agent-matrix', 'playbook', 'smt', 'commons-fridge', 'qingju']
PROJECTS.sort(key=lambda p: PROJECT_ORDER.index(p['slug']))

def collage(slug, lang):
    """Compositions made only of original screens and photos."""
    if slug == 'qingju':
        # 2026-11-16（本人定）：封面用团队高保真，不用低保真线框。
        # 2026-11-18（卡 20261118-013 第 3 版选 A = Q1）：生成的公园骑行地图铺底，上面正着立两屏真界面，看得清；
        # 本人另外要求加上单车和藏宝图宝箱（从生成的黏土图里抠出来，tools/cut_gen_clay.py）。
        # 地图、单车、宝箱是 Figma AI 生成的装饰，不是项目成果；两屏界面是团队高保真原图，只缩放、转一点角度。
        return ('<div class="collage collage--ill" style="--bg:#BFE8CF">'
                + img('gen/qj-map', t('插画：公园里的骑行地图，虚线路线上放着宝箱', 'Illustration: a park cycling map with chests along a dotted route', lang), 'cover-bg')
                + '<span class="cover-veil" aria-hidden="true"></span>'
                + img('gen/qj-bike-chest', t('插画：一辆青绿色单车、一箱金币和一张藏宝图', 'Illustration: a teal bike, a chest of coins and a treasure map', lang), 'cover-deco').replace('<img', '<img style="left:2cqw;bottom:2.5cqw;width:40cqw"')
                + img('qingju/hifi-phone-map', t('高保真：寻宝地图，地图上散落着不同等级的宝箱', 'High fidelity: the treasure map, with chests of different tiers on the map', lang), 'cover-phone').replace('<img', '<img style="right:29cqw;top:5cqw;width:22cqw;--r:-3deg"')
                + img('qingju/hifi-phone-discussion', t('高保真：路线讨论圈', 'High fidelity: route discussion', lang), 'cover-phone').replace('<img', '<img style="right:5cqw;top:8cqw;width:22cqw;--r:3deg"')
                + '</div>')
    if slug == 'playbook':
        # 2026-11-17（本人定，卡 20261117-020 选 A）：深色舞台，一叠真实界面斜着往后排开，鼠标移上去散开一点。
        # 界面只斜放，不改颜色和内容。Studio 活动页是本人做的，三屏 App 是团队的成品。
        # 2026-11-18 本人要求：手机压在 Studio 页面上面。（先写的在下面：Studio 页面放第一个）
        phone = 'aspect-ratio:390/844;object-fit:cover;object-position:top'
        def piece(name, alt, i, style, cls=''):
            return img(name, alt, ('stage__item ' + cls).strip()).replace('<img', f'<img style="--i:{i};{style}"')
        return ('<div class="collage collage--stage" style="--bg:#15100F;--glow:249,87,87">'
                '<span class="stage__word" aria-hidden="true">PlayBook</span><div class="stage__stack">'
                + piece('playbook/studio-campaign', t('PlayBook Studio 活动页', 'PlayBook Studio campaign page', lang), 0, 'left:4%;top:32%;width:60%')
                + piece('playbook/team-inventory', t('PlayBook App 物品库（成品界面）', 'PlayBook App inventory (finished UI)', lang), 3, f'left:83%;top:15%;width:17.5%;{phone}', 'collage__phone')
                + piece('playbook/team-home', t('PlayBook App 首页（成品界面）', 'PlayBook App home (finished UI)', lang), 2, f'left:69%;top:19%;width:18.5%;{phone}', 'collage__phone')
                + piece('playbook/team-mission', t('PlayBook App 任务页（成品界面）', 'PlayBook App mission page (finished UI)', lang), 1, f'left:54%;top:24%;width:19.5%;{phone}', 'collage__phone')
                + '</div></div>')
    if slug == 'smt':
        # 2026-11-18（卡 20261118-017 本人改选 S1）：设计中心项目卡。浅蓝底、三色小标签、大标题、一句副标题、
        # 左下一行「我做了什么」，右边一个玻璃质感的 3D 图标（Figma AI 生成：交易窗口 + K 线，只当装饰）。不放界面截图，不放关怀版。
        chips = ''.join(f'<span class="cover-chip">{c}</span>' for c in
                        (['2022–23', '桌面端', '组件与规范'] if lang == 'zh' else ['2022–23', 'Desktop', 'Components & specs']))
        long = '' if lang == 'zh' else ' cover-title--long'
        return ('<div class="collage collage--idcard" style="--bg:#EEF5FF">'
                + f'<div class="cover-chips" aria-hidden="true">{chips}</div>'
                + f'<p class="cover-title{long}" aria-hidden="true">{t("兴业 SMT", "Industrial Securities SMT", lang)}</p>'
                + f'<p class="idcard__sub" aria-hidden="true">{t("从业务单元，建立界面秩序", "Let business meaning set component boundaries", lang)}</p>'
                + '<p class="idcard__credit" aria-hidden="true">' + img('tobie/face', t('冯渝程', 'Yucheng Feng', lang), 'idcard__face')
                + t('组件设计、使用规范与维护', 'Component design, specifications & maintenance', lang) + '</p>'
                + img('gen/smt-icon-window', t('插画：玻璃质感的交易窗口 3D 图标，里面是 K 线', 'Illustration: a glassy 3D trading-window icon with a candlestick chart', lang), 'idcard__icon')
                + '</div>')
    if slug == 'commons-fridge':
        # 2026-11-18（卡 20261118-013 第 3 版选 A = F1）：生成的插画铺底（贴满冰箱贴的冰箱门，一只手拿手机碰门上的小贴片），
        # 左边立一屏原型首页；本人另外要求加一只小企鹅（项目里的企鹅原图，当贴纸）。
        # 插画是 Figma AI 生成的装饰，不是项目成果；原型界面和企鹅是原图，只缩放、转一点角度。
        chips = ''.join(f'<span class="cover-chip">{c}</span>' for c in
                        (['硕士毕业设计', 'NFC 入口'] if lang == 'zh' else ['MA final project', 'NFC touchpoints']))
        return ('<div class="collage collage--ill collage--door" style="--bg:#F3E7D1">'
                + img('gen/cf-door', t('插画：贴满冰箱贴的共享冰箱门，一只手拿手机碰门上的小贴片', 'Illustration: a shared fridge door covered in magnets, a hand tapping a sticker with a phone', lang), 'cover-bg').replace('<img', '<img style="object-position:100% 50%"')
                + f'<div class="cover-chips" aria-hidden="true">{chips}</div>'
                + img('fridge/3d-home', t('Commons Fridge 3D 小样首页', 'Commons Fridge 3D prototype home', lang), 'cover-phone').replace('<img', '<img style="left:9cqw;top:12cqw;width:21cqw;--r:-4deg"')
                # 2026-11-24：手机里换成 3D 小样首页后，画面角上已经有严肃那只企鹅；原来叠在手机右下的开心企鹅贴纸（fridge/penguin-add）拿掉，一个画面只放一只
                + '</div>')
    return ''

def matrix_cover(lang):
    """Agent Matrix 封面（2026-11-25，卡 20261125-007 第 4 版本人选 A）：Codex 生成的底图（四个机器人分在左右两边），
    中间一台正放的笔记本，屏幕里是审核中心示例页（按封面上的大小直接渲染，不裁不压）；名字标签是合成时加的。
    审核中心只有中文界面，中英文页用同一张。合成页：05-agent-matrix/portfolio/figures/gen/compose-小样v4.html"""
    name = 'agent-matrix/cover-robots'
    w, h = MANIFEST[name]
    return (f'<div class="collage" style="--bg:#F2EFE9;aspect-ratio:{w}/{h}">'
            + img(name, t('插画：Claude、Gemini、Codex、DeepSeek 四个机器人分在两边，各拉一根线连到中间笔记本上的审核中心页面',
                          'Illustration: four robots — Claude, Gemini, Codex and DeepSeek — on either side, each wired to the review center open on a laptop in the middle', lang)).replace('<img', '<img style="left:0;top:0;width:100%;border-radius:0;box-shadow:none"')
            + '</div>')

def cover(slug, lang):
    """首页卡片和案例页顶部的封面入口。Agent Matrix 的临时封面单独写在 matrix_cover()，其余四张走 collage()。"""
    return matrix_cover(lang) if slug == 'agent-matrix' else collage(slug, lang)

def has_try(slug):
    """这个案例有没有可以亲手试的演示（页面里有没有 #try 这个锚点）。没有的案例不出「试原型」的按钮。"""
    return any('id="try"' in section_demo(slug, n + 1, 'zh') for n in range(len(CASES[slug]['sections'])))

# 自画像上的五个物件，顺序和 METHOD 一致：(x%, y%, 半径%, 说明纸条贴在物件的哪一侧)
# 2026-11-15 本人要求：去掉图上的数字圆点。平时只有很小的呼吸点，碰到或点到物件才压暗其余部分并贴出说明。
PORTRAIT_SPOTS = [
    (12.2, 63.5, 9, 'right'), (88.2, 44.5, 6.5, 'left'), (70.2, 10.5, 8, 'below'), (74.5, 32.5, 9, 'left'), (11.5, 29.0, 10, 'right')]
# 肩上的两个小人是 MBTI（卡 20261115-053，本人答：INTP 和 ENTP，偏 INTP 一点）。
# 它们不对应「我怎么工作」的步骤，只在图上能碰：(key, x%, y%, 半径%, 纸条贴哪一侧, 四个字母, 小字)
PORTRAIT_MBTI = [
    ('mbti-intp', 28.5, 55.0, 12.5, 'right', 'INTP', ['MBTI · 更偏这一型', 'MBTI · I lean this way']),
    ('mbti-entp', 78.0, 56.5, 12.0, 'left', 'ENTP', ['MBTI · 有时是这一型', 'MBTI · sometimes this one']),
]
METHOD = [
    (['看清情境', 'Read the context'], ['指南针 · 研究', 'compass · research']),
    (['问清卡在哪', 'Ask why it hurts'], ['问号 · 问题定义', 'question mark · framing']),
    (['选定关键决定', 'Pick the decision'], ['灯泡 · 判断', 'light bulb · judgement']),
    (['把规则画出来', 'Draw the rule'], ['Figma · 结构与界面', 'Figma · structure']),
    (['做出原型，再请人检验', 'Prototype, then test'], ['AI · 快速原型', 'AI · fast prototyping']),
]

# 2026-11-18（卡 20261118-022 第 2 版选 A）：按网址给不同岗位看不同首屏。
# 同一份网站绑 www / ai / ux / fin 四个网址；大标题和按钮都不换，只换标题上面的小字（面向的岗位）
# 和标题下那句话里例子的顺序。'www' 是现在的样子，也是没开脚本、或网址不认识时的样子。
TRACKS = {
    'www': (['产品与体验设计', 'Product & experience design'],
            ['从创作者工具、证券软件，到走廊尽头那台共享冰箱。', 'in creator tools, securities software and the shared fridge down the hall.']),
    'ai': (['AI 产品经理', 'AI product manager'],
           ['从十四个 AI agent 的协作、创作者工具，到证券软件和走廊尽头那台共享冰箱。', 'in a team of fourteen AI agents, creator tools, securities software and the shared fridge down the hall.']),
    'ux': (['交互设计', 'Interaction design'],
           ['从创作者工具、走廊尽头那台共享冰箱，到证券软件。', 'in creator tools, the shared fridge down the hall and securities software.']),
    'fin': (['金融产品设计', 'Financial product design'],
            ['从证券软件、创作者工具，到走廊尽头那台共享冰箱。', 'in securities software, creator tools and the shared fridge down the hall.']),
}

# 卡 20261118-023 本人在聊天里说「按 C 改吧」：作品列表也跟着岗位排。规则：那句话里提到的项目按同样的顺序排在前面，
# 没提到的按 www 的顺序跟在后面。ai 版刚好和 www 一样，所以不写。
TRACK_ORDER = {
    'ux': ['playbook', 'commons-fridge', 'smt', 'agent-matrix', 'qingju'],
    'fin': ['smt', 'playbook', 'commons-fridge', 'agent-matrix', 'qingju'],
}
assert all(sorted(v) == sorted(PROJECT_ORDER) for v in TRACK_ORDER.values())
# 紧跟在作品列表后面的一小段脚本：页面一边读一边执行，所以在第一次画出来之前就排好了，读屏和 Tab 顺序也跟着变。
WORK_ORDER_JS = ('<script>(function(){var o=' + json.dumps(TRACK_ORDER, separators=(',', ':')) +
                 "[document.documentElement.getAttribute('data-track')],w=document.currentScript.previousElementSibling;"
                 "if(o&&w)o.forEach(function(s){var e=w.querySelector('[data-slug=\"'+s+'\"]');if(e)w.appendChild(e)})})()</script>")
def track_text(i, lang):
    return ''.join(f'<span class="trk" data-t="{k}">{T(v[i], lang)}</span>' for k, v in TRACKS.items())

def home(lang):
    path = url('', lang)
    h = head(t('Tobie 冯渝程 — 产品与体验设计', 'Tobie (Yucheng Feng) — Product & experience design', lang),
             t('把复杂的系统，设计得让人看得懂。精选 Agent Matrix、PlayBook、兴业 SMT、The Commons Fridge 与青桔项目，附基于原始界面的可操作原型。',
               'I make complex systems understandable. Selected work — Agent Matrix, PlayBook, Industrial Securities SMT, The Commons Fridge and Qingju — with prototypes you can try, built from the original screens.', lang), lang, path)
    h += topbar(lang, path)
    spots = ''.join(f'<button type="button" class="hot__spot" data-key="{n+1}" data-x="{x}" data-y="{y}" data-r="{r}" data-side="{side}" style="left:{x}%;top:{y}%;--r:{r}%" aria-label="{escape(T(METHOD[n][1], lang))}: {escape(T(METHOD[n][0], lang))}"><i></i></button>'
                    for n, (x, y, r, side) in enumerate(PORTRAIT_SPOTS))
    spots += ''.join(f'<button type="button" class="hot__spot hot__spot--extra" data-key="{key}" data-x="{x}" data-y="{y}" data-r="{r}" data-side="{side}" data-title="{escape(title)}" data-sub="{escape(T(sub, lang))}" style="left:{x}%;top:{y}%;--r:{r}%" aria-label="MBTI: {escape(title)}"><i></i></button>'
                     for key, x, y, r, side, title, sub in PORTRAIT_MBTI)
    method = ''.join(f'<button type="button" class="method__step" data-key="{n+1}"><span class="thumb" style="--x:{PORTRAIT_SPOTS[n][0]};--y:{PORTRAIT_SPOTS[n][1]};--r:{PORTRAIT_SPOTS[n][2]}" aria-hidden="true"></span><span><b>{T(a, lang)}</b><small>{T(b, lang)}</small></span></button>' for n, (a, b) in enumerate(METHOD))
    h += f'''<main id="main">
<section class="hero"><div class="wrap">
 <div class="hero__grid">
  <div class="reveal">
   <p class="label path"><span>{track_text(0, lang)}</span><span>{t('英国南安普顿', 'Southampton, UK', lang)}</span></p>
   <h1 class="hero__title">{t('把复杂的系统，<br>设计得<em>让人看得懂。</em>', 'I make complex systems <em>understandable.</em>', lang)}</h1>
   <p class="lead hero__lead">{t('我把产品背后的结构，和人们在其中做出的决定连接起来——', 'I connect the structure behind a product to the decisions people make inside it — ', lang)}{track_text(1, lang)}</p>
   <div class="hero__ctas"><a class="btn" href="#work">{t('看作品', 'See the work', lang)} <span aria-hidden="true">↓</span></a><a class="btn btn--ghost" href="/assets/Yucheng-Feng-Portfolio.pdf" target="_blank" rel="noopener">{t('PDF 作品集', 'Portfolio PDF', lang)}</a></div>
  </div>
  <figure class="portrait frame-block reveal" data-component="Annotated figure">
   <div class="frame hot">{img('tobie/avatar', t('Tobie 的插画自画像：戴眼镜、穿牛仔外套，周围是指南针、问号、灯泡、Figma 与 ChatGPT 图标', 'Tobie’s illustrated self-portrait: glasses and a denim jacket, surrounded by a compass, a question mark, a light bulb and the Figma and ChatGPT logos', lang), lazy=False)}<div class="hot__dim" aria-hidden="true"></div>{spots}<div class="hot__note" aria-live="polite"><b></b><span></span></div></div>
   <figcaption class="hot__hint">{t('图上的小物件可以碰一碰：五件是我工作的五步，两个小人是我的 MBTI。', 'Hover or tap the objects in the picture — five are steps in how I work, and the two little figures are my MBTI types.', lang)}</figcaption>
  </figure>
 </div>
 <div class="method" data-component="Method strip"><p class="method__title label">{t('我怎么工作', 'How I work', lang)}</p>{method}</div>
</div></section>

<section class="section" id="work"><div class="wrap">
 <div class="section-head"><h2>{t('精选作品', 'Selected work', lang)}</h2><p>{t('2021–2026 年的五个项目：一套 AI 协作系统、一个创作者平台、一款证券交易软件、一个毕业设计和一次商业委托。封面上的插画是 AI 生成的，已标注。', 'Five projects, 2021–2026: an AI collaboration system, a creator platform, securities trading software, an MA final project and a commercial brief. Cover illustrations are AI-generated and labelled.', lang)}</p></div>
 <div class="work">'''
    for p in PROJECTS:
        prov_text, prov_cls = prov_shown(p['prov'])
        chips = ''.join(f'<li class="chip">{c}</li>' for c in T(p['chips'], lang))
        try_link = f'<a class="link" href="{url(p["slug"], lang)}#try">{t("亲手试原型", "Try the prototype", lang)}</a>' if has_try(p['slug']) else ''
        h += f'''
  <article class="work-item reveal" data-component="Work item" data-slug="{p['slug']}">
   <div class="work-item__visual frame-block">{frame_label(T(p['label'], lang), T(prov_text, lang), prov_cls, p['project'])}<a href="{url(p['slug'], lang)}" aria-label="{t('阅读案例：', 'Read the case: ', lang)}{p['name']}"><div class="frame">{cover(p['slug'], lang)}</div></a></div>
   <div class="work-item__copy">
    <p class="work-item__name" style="--project:var(--p-{p['project']})">{p['name']}</p>
    <p class="label work-item__meta">{p['year']} · {T(p['type'], lang)}</p>
    <h3><a href="{url(p['slug'], lang)}">{T(p['title'], lang)}</a></h3>
    <p class="work-item__summary">{T(p['summary'], lang)}</p>
    <ul class="chips">{chips}</ul>
    <div class="work-item__actions"><a class="link-arrow" href="{url(p['slug'], lang)}">{t('阅读案例', 'Read the case', lang)} <span aria-hidden="true">→</span></a>{try_link}</div>
   </div>
  </article>'''
    h += '\n </div>' + WORK_ORDER_JS + '\n</div></section>'

    explorations = [
        ('cctv', ['CDU · 批判性设计', 'CDU · critical design'], ['让看不见的监控被看见', 'Making the invisible visible'],
         ['用伦敦与温彻斯特的交互地图，探索“被看见”与“看回去”的权力关系。', 'An interactive map of London and Winchester exploring the power of being watched — and of looking back.'], 'https://project2-yuchengfeng.vercel.app/', ['可访问网页', 'Live site']),
        ('quantified', ['CDU · 数据与身份', 'CDU · data & identity'], ['情绪，也有自己的地理', 'The geography of a feeling'],
         ['把个人状态、城市与时间连起来，用 28 种状态的虚拟形象重新阅读一年的情绪记录。', 'Linking personal states, cities and time, with a 28-state avatar as a way to reread a year of mood records.'], 'https://macd-yuchengfeng-kmiz.vercel.app/', ['可访问网页', 'Live site']),
        ('wuhan', ['EAI · 城市研究', 'EAI · urban research'], ['重新阅读江汉路', 'Reading Jianghan Road'],
         ['从建筑、城市记忆与人的行为出发，绘制一条街道在不同时代留下的痕迹。', 'A counter-map of one Wuhan street: its architecture, its memory and the everyday behaviour it holds.'], '/assets/Jianghan-Road-Study.pdf', ['PDF', 'PDF']),
    ]
    h += f'''
<section class="section section--tight" id="explorations"><div class="wrap">
 <div class="section-head"><h2>{t('课程与实验', 'Explorations', lang)}</h2><p>{t('硕士课程里的交互与数据实验。三个都和“地图”有关——我习惯把系统画成可以走进去的地方。', 'Interaction and data experiments from my MA. All three are maps — I tend to draw a system as a place you can walk into.', lang)}</p></div>
 <div class="explore-grid">'''
    for image, label, title, desc, link, kind in explorations:
        h += f'''
  <article class="explore reveal"><a href="{link}" target="_blank" rel="noopener" class="frame-block">{frame_label(T(label, lang), T(kind, lang), '', 'explore')}<div class="frame">{legacy_img(image, T(title, lang))}</div></a>
   <h3>{T(title, lang)}</h3><p>{T(desc, lang)}</p><a class="link-arrow" href="{link}" target="_blank" rel="noopener">{t('打开', 'Open', lang)} <span aria-hidden="true">↗</span></a></article>'''
    h += '\n </div>\n</div></section>'

    h += f'''
<section class="section" id="about"><div class="wrap about">
 <div class="about__intro reveal">
  <span class="label">{t('关于我', 'About', lang)}</span>
  <h2>{t('好奇，<br>也在意细节。', 'Curious by nature.<br>Careful by design.', lang)}</h2>
  <div class="note"><span class="note__face" aria-hidden="true"></span><div><div class="note__who">Tobie · 冯渝程</div><p class="note__text">{t('我喜欢从人的行为出发，把模糊的需求拆开，再把它们变成人能理解、能掌控的系统。', 'I start from how people actually behave, untangle what they need, and give complex systems a shape people can understand and control.', lang)}</p></div></div>
 </div>
 <div class="about__text reveal">
  <p>{t('我是冯渝程，也叫 Tobie。2021 年起做过法律类 App、证券交易软件和创作者平台的交互与产品设计，直接对接过券商客户和创业团队。现在在南安普顿大学读 MA Communication Design，2026 年 12 月毕业。我会用研究、线框、组件规范和可运行的原型，把一个决定讲清楚。', 'I’m Yucheng Feng, also known as Tobie. Since 2021 I have designed interactions and product flows for a legal services app, securities trading software and a creator platform, working directly with brokerage clients and a startup team. I am finishing an MA in Communication Design at the University of Southampton in December 2026. I use research, wireframes, component specs and working prototypes to make a decision clear.', lang)}</p>
  <dl class="spec">
   <div><dt>{t('关注方向', 'Focus', lang)}</dt><dd>{t('需求分析与拆解、用户研究、交互与原型 · 证券交易软件、创作者工具、AI 协作流程', 'Requirements analysis, user research, interaction & prototyping · Securities trading software, creator tools, AI collaboration workflows', lang)}</dd></div>
   <div><dt>{t('经历', 'Experience', lang)}</dt><dd>{t('2023.10 – 2024.05 · PlayBook · 产品设计（远程兼职）<br>2022.02 – 2023.03 · 武汉优品楚鼎科技有限公司 · 交互设计师<br>2021.06 – 2021.09 · 武汉牛晓法科技有限公司 · UX 设计师', 'Oct 2023 – May 2024 · PlayBook · Product Designer (part-time, remote)<br>Feb 2022 – Mar 2023 · Wuhan Youpin Chuding Technology · Interaction Designer<br>Jun – Sep 2021 · Wuhan Niuxiaofa Technology · UX Designer', lang)}</dd></div>
   <div><dt>{t('教育', 'Education', lang)}</dt><dd>{t('南安普顿大学 · MA Communication Design（2025.09 – 2026.12）<br>湖北美术学院 · 产品设计 本科（2017.09 – 2021.06）', 'University of Southampton · MA Communication Design (Sep 2025 – Dec 2026, expected)<br>Hubei Institute of Fine Arts · BA Product Design (Sep 2017 – Jun 2021)', lang)}</dd></div>
   <div><dt>{t('工具', 'Toolkit', lang)}</dt><dd>Figma · ProtoPie · HTML/CSS/JS {t('原型', 'prototypes', lang)} · {t('AI 辅助原型与视觉探索', 'AI-assisted prototyping and visual exploration', lang)}</dd></div>
   <div><dt>{t('语言', 'Languages', lang)}</dt><dd>{t('中文（母语）· 英文（工作语言）', 'Chinese (native) · English (working)', lang)}</dd></div>
   <div><dt>{t('所在地', 'Based in', lang)}</dt><dd>{t('英国南安普顿', 'Southampton, UK', lang)}</dd></div>
   <div><dt>{t('到岗', 'Availability', lang)}</dt><dd>{t('2026 年 12 月 31 日起', 'From 31 December 2026', lang)}</dd></div>
  </dl>
 </div>
</div></section>
</main>
'''
    return h + footer(lang)


# ------------------------------------------------------------------ case
CASE_HERO = {
    'agent-matrix': ('cover-ill', ['Agent Matrix · 四个模型连到审核中心', 'Agent Matrix · four models wired into the review center']),
    'qingju': ('cover-ill', ['青桔 · 寻宝地图与路线讨论圈 · 2021', 'Qingju · treasure map and route discussion · 2021']),
    'playbook': ('original', ['PlayBook · Studio 活动页 + App 首页与任务页', 'PlayBook · Studio campaign page + App home and missions']),
    'smt': ('cover-gen', ['兴业 SMT · 项目卡', 'Industrial Securities SMT · project card']),
    'commons-fridge': ('cover-ill', ['The Commons Fridge · 原型首页', 'The Commons Fridge · prototype home']),
}

BRIEF_LABELS = [['问题', 'Problem'], ['我的关键决定', 'Key decisions'], ['结果', 'Outcome']]   # 案例开头三行摘要（2026-11-16）
# 决策块（2026-11-16）：section 上的可选键 'decision'，四行，每行 [zh, en]；沿用开头摘要的细线表格样式，放在正文之后、图之前
DECISION_LABELS = [['问题', 'Problem'], ['考虑过的方案', 'Alternative considered'], ['为什么没选', 'Why not'], ['结果', 'Outcome']]

CASE_TITLES = {   # conclusion headlines, aligned with the PDF deck
    'agent-matrix': ['我先设计 AI 怎么问我，再用它改这份作品集。', 'I designed how AI asks me. Then I used it to rework this portfolio.'],   # 2026-11-25 重讲，卡 20261124-012 选 A（原来是卡 20261115-002 选的 A）；PDF 里还没有这个案例
    'qingju': ['让成长体系，回到骑行本身。', 'Connect cycling rewards to the reasons people ride.'],
    'playbook': ['把复杂规则，变成可参与的体验。', 'Turn creator rules into fan experiences.'],
    'smt': ['从业务单元，建立界面秩序。', 'Make a securities interface reusable.'],
    'commons-fridge': ['共享一台冰箱，也共享清晰的边界。', 'Make shared care easier to negotiate.'],
}

def figure_html(f, lang):
    prov_text, prov_cls = prov_shown(f['prov'])
    # 图名留空（['', '']）、来源标签也不显示时，整行 frame-label 不出（2026-11-23：交接单只给了图注的图）
    has_label = T(f.get('label', ['', '']), lang) or T(prov_text, lang)
    label = frame_label(T(f['label'], lang), T(prov_text, lang), prov_cls, f['project']) if has_label else ''
    cap_text = T(f.get('caption', ['', '']), lang)
    cap = f'<figcaption class="frame-caption">{cap_text}</figcaption>' if cap_text else ''    # 图注留空（['', '']）就不出这一行：两条手机条共用后一条的图注时用
    kind = f['kind']
    if kind == 'image':
        # 'flat'：图本身就是页面底色时用，去掉图框的描边和投影，图直接落在页面上（配合 'bg' 把白底也换掉）。没有这个键的图框一个字都不变
        css = ([f'background:{f["bg"]}'] if f.get('bg') else []) + (['box-shadow:none'] if f.get('flat') else [])
        style = f' style="{";".join(css)}"' if css else ''
        pad = ' style="padding:24px"' if f.get('pad') else ''
        width = ' style="max-width:560px"' if f.get('narrow') else ''
        src = f['src_en'] if lang == 'en' and f.get('src_en') else f['src']    # 图里有文字、中英文各导一张时，英文页取 src_en
        if f.get('scroll'):
            # 'scroll'（2026-11-17，PlayBook 09 节）：比 16:9 高的整页稿放进一个 16:9 的窗口，图按窗口宽度整张显示，
            # 超出的部分在窗口里上下滑动看（滚动只靠 CSS；site.js 只管滑到底以后把提示藏起来）。
            # 窗口可以 Tab 聚焦、方向键滚动；放大按钮挪到窗口右下角，点开仍是整张图。没有这个键的图一个字都不变
            # 'fixed'（2026-11-17 第 3 版，卡 20261117-017 本人：「侧边栏都是固定的，不要让侧边栏也一起滑动」）：
            # 原图里固定不动的界面（顶部条、左侧菜单、右侧栏），按原图像素写 {'of': 原图宽, 'top': 顶部条高, 'left': 左侧栏宽, 'right': 右侧栏宽}。
            # 做法：同一张图再叠一层不滑的，用 clip-path 只露出这几块；滑的那张在它下面，最顶上时两层像素重合，看不出拼缝。
            # 图不新增文件，数字只在 figures.py 里，样式只读这里算出的几个百分比。
            fixed, extra, vars_ = f.get('fixed'), '', []
            if fixed:
                iw, ih = MANIFEST[src]
                of = fixed['of']
                pw = lambda k: fixed.get(k, 0) / of * 100                    # 占图宽的百分比
                ph = lambda k: fixed.get(k, 0) / of * iw / ih * 100          # 占图高的百分比（clip-path 的上下按图高算）
                l, r, tp = f'{pw("left"):.4f}%', f'{100 - pw("right"):.4f}%', f'{ph("top"):.4f}%'
                clip = f'polygon(0 0,100% 0,100% 100%,{r} 100%,{r} {tp},{l} {tp},{l} 100%,0 100%)'
                vars_ = [f'--fix-l:{pw("left"):.4f}%', f'--fix-r:{pw("right"):.4f}%']
                extra = img(src, '', 'shot-scroll__fixed').replace('<img ', '<img aria-hidden="true" ', 1).replace('class="shot-scroll__fixed"', f'class="shot-scroll__fixed" style="clip-path:{clip}"', 1)
            if vars_:
                css = css + vars_
                style = f' style="{";".join(css)}"'
            name = escape(T(f['label'], lang))
            return (f'<figure class="figure frame-block"{width}>{label}<div class="frame shot-scroll{" shot-scroll--fixed" if fixed else ""}" data-scroll-shot{style}>'
                    f'<div class="shot-scroll__view" tabindex="0" role="region" aria-label="{name}{t("（可上下滑动）", " (scroll to see more)", lang)}">{img(src, T(f["label"], lang))}</div>{extra}'
                    f'<span class="shot-scroll__hint" aria-hidden="true">{t("可上下滑动", "Scroll to see more", lang)}</span>'
                    f'<button type="button" class="enlarge shot-scroll__zoom" data-enlarge aria-label="{t("放大：", "Enlarge: ", lang)}{name}"></button></div>{cap}</figure>')
        return (f'<figure class="figure frame-block"{width}>{label}<div class="frame"{style}><button type="button" class="enlarge" data-enlarge aria-label="{t("放大：", "Enlarge: ", lang)}{escape(T(f["label"], lang) or cap_text)}"><div{pad}>'
                f'{img(src, T(f["label"], lang) or cap_text)}</div></button></div>{cap}</figure>')   # 没有图名的图，用图注当 alt
    if kind == 'phones':
        # 一条手机条里有三种格子，都不放大（显示宽度不超过原图宽度，.claude/agents/walkthrough.md R1、R3）：
        #   'items'    整屏截图：套 390:844 竖屏框，长图只露一屏高，点开看全图。
        #   'partials' 弹窗、卡片这类局部图：不套竖屏框、不裁切，按原比例完整显示，在格子里上下居中；不带放大按钮
        #              （放大图标会盖住弹窗里的按钮）；带它的手机条在窄屏上改成上下排（styles.css）。
        #   'whole'    和手机一样宽、但高度不是一屏的图（比一屏长很多的整页稿、比一屏短的半屏）：不套竖屏框，
        #              按原比例整张显示，顶对齐，带放大按钮。
        # 'partials' 和 'whole' 的条目可以带第三项：它在这一排里的位置（从 0 数）；不写就排在最后。
        # 'cap'：{图名: 显示宽度上限（CSS 像素）}，2 倍图用它把上限定在 1 倍宽度；不写就是导出图的宽度。
        cap_w = lambda src: f.get('cap', {}).get(src, MANIFEST[src][0])
        zoom = lambda lbl: f'<button type="button" class="enlarge" data-enlarge aria-label="{t("放大：", "Enlarge: ", lang)}{escape(T(lbl, lang))}">'
        cells = [f'<figure>{zoom(lbl)}{img(src, T(lbl, lang), "screen")}</button><figcaption>{T(lbl, lang)}</figcaption></figure>' for src, lbl in f['items']]
        extra = [(pos[0] if pos else len(f['items']) + 99, f'<figure class="partial" style="max-width:{cap_w(src)}px">{img(src, T(lbl, lang))}<figcaption>{T(lbl, lang)}</figcaption></figure>') for src, lbl, *pos in f.get('partials', [])]
        extra += [(pos[0] if pos else len(f['items']) + 99, f'<figure class="whole" style="max-width:{cap_w(src)}px">{zoom(lbl)}{img(src, T(lbl, lang))}</button><figcaption>{T(lbl, lang)}</figcaption></figure>') for src, lbl, *pos in f.get('whole', [])]
        for pos, cell in sorted(extra, key=lambda e: e[0]):
            cells.insert(pos, cell)
        items = ''.join(cells)
        return f'<figure class="figure frame-block">{label}<div class="frame frame--canvas"><div class="phone-strip" style="--n:{f["n"]}">{items}</div></div>{cap}</figure>'
    if kind == 'pair':
        (wsrc, wl), (psrc, pl) = f['wide'], f['phone']
        return (f'<figure class="figure frame-block">{label}<div class="frame frame--canvas"><div class="phone-strip" style="grid-template-columns:3fr 1fr;align-items:center">'
                f'<figure><button type="button" class="enlarge" data-enlarge aria-label="{escape(T(wl, lang))}">{img(wsrc, T(wl, lang))}</button><figcaption>{T(wl, lang)}</figcaption></figure>'
                f'<figure><button type="button" class="enlarge" data-enlarge aria-label="{escape(T(pl, lang))}">{img(psrc, T(pl, lang), "screen")}</button><figcaption>{T(pl, lang)}</figcaption></figure></div></div>{cap}</figure>')
    if kind == 'stack':
        # 'stack'（2026-11-23，Agent Matrix 07 节）：几张很扁的横条图（13:1）上下排，每张下面一行小字说是哪张；并排的话字会缩到看不清
        # 放大按钮挪到图下面那行的右边（styles.css .stack .enlarge::after），不盖住扁图上的按钮和字；小字留空时那一行照样留着放按钮；没有小字的图用图注当 alt
        # 每张图的显示宽度不超过导出图的宽度（不放大，和手机条的 partials / whole 一样）：2026-11-24 起 02 节的看板截图只有 667 宽，不加这条会被拉到整栏宽、发虚
        # 2026-11-25（Agent Matrix 03 节）：items 每项可带第三个元素 src_en，英文页用它；没有就沿用中文图。max-width 取实际选中那张的宽度
        pick = lambda it: it[2] if lang == 'en' and len(it) > 2 and it[2] else it[0]
        rows = ''.join(f'<figure style="max-width:{MANIFEST[src][0]}px"><button type="button" class="enlarge" data-enlarge aria-label="{t("放大：", "Enlarge: ", lang)}{escape(T(lbl, lang) or cap_text)}">{img(src, T(lbl, lang) or cap_text)}</button>'
                       f'<figcaption>{T(lbl, lang)}</figcaption></figure>' for src, lbl in ((pick(it), it[1]) for it in f['items']))
        return f'<figure class="figure frame-block">{label}<div class="frame frame--canvas"><div class="stack">{rows}</div></div>{cap}</figure>'
    if kind == 'anims':
        # 'anims'（2026-11-23，冰箱 07 节）：小样录屏（动态 WebP），不放大，不带放大按钮；每张自己的图注写在下面。
        # 'rows' 每行几张：同一行等高、顶对齐——行高取这一行里最矮那张的原高，各张按宽高比分宽（flex-grow = 该高度下的宽），
        # 整行最宽不超过这个宽度，所以不会放大；放不下就整行等比缩，不换行。手机上三张那行排成 2+1（styles.css .anims__row--3）
        def anim_row(row):
            h = min(MANIFEST[src][1] for src, _ in row)
            ws = [MANIFEST[src][0] * h / MANIFEST[src][1] for src, _ in row]
            cells = ''.join(f'<figure style="flex:{w:.1f} 1 0">{img(src, T(lbl, lang))}<figcaption>{T(lbl, lang)}</figcaption></figure>'
                            for (src, lbl), w in zip(row, ws))
            return f'<div class="anims__row anims__row--{len(row)}" style="max-width:calc({sum(ws):.0f}px + {len(row) - 1} * var(--s-5))">{cells}</div>'
        rows = ''.join(anim_row(row) for row in f['rows'])
        return f'<figure class="figure frame-block">{label}<div class="frame frame--canvas"><div class="anims">{rows}</div></div>{cap}</figure>'
    if kind == 'penguins':
        items = ''.join(f'<figure>{img(src, T(lbl, lang)).replace("<img", "<img style=\"box-shadow:none;border-radius:0;max-width:150px;margin:auto\"")}<figcaption style="text-align:center">{T(lbl, lang)}</figcaption></figure>' for src, lbl in f['items'])
        return f'<figure class="figure frame-block">{label}<div class="frame" style="background:#F6F1E6"><div class="phone-strip" style="--n:4">{items}</div></div>{cap}</figure>'
    return ''

def case_layout(c, key, lang, anchor='section'):
    """目录 + 正文。c 是一份案例内容（CASES[slug]，或它 'tabs' 里的一个 tab）；
    key 是 figures.py 和 section_demo 的键名（案例 slug 或 tab id）；anchor 是各节锚点的前缀（section-1、daton-section-1）。"""
    i = 0 if lang == 'zh' else 1
    h = f'''
<div class="case-layout">
 <nav class="toc" aria-label="{t('本页目录', 'On this page', lang)}"><span class="toc__title label">{t('目录', 'Contents', lang)}</span>'''
    for n, s in enumerate(c['sections']):
        label = re.sub(r'^\d+\s*/\s*', '', s['label'][i])
        h += f'<a href="#{anchor}-{n+1}"><span>{n+1:02d}</span>{label}</a>'
    h += '</nav>\n <article class="case-body">'
    for n, s in enumerate(c['sections']):
        label = re.sub(r'^\d+\s*/\s*', '', s['label'][i])
        h += f'\n<section class="case-section" id="{anchor}-{n+1}"><p class="label label--teal">{n+1:02d} · {label}</p><h2>{s["title"][i]}</h2>'
        if 'sub' in s:   # 'sub'（2026-11-24，PlayBook 04 节）：标题下面一行小号灰字，不是正文；没有这个键的章节一个字都不变
            h += f'<p class="meta case-sub">{s["sub"][i]}</p>'
        paras = [f'<p>{para[i]}</p>' for para in s['text']]
        box = 'outcome' if s.get('outcome') else 'prose'
        if 'rows' in s:
            # 'rows'（2026-11-17，Agent Matrix 06 节）：一张几行的细线表，插在正文第 after 段后面，沿用开头摘要和决策块的样式。
            # 每行 [左边小标签, 加粗的一句, 下面一句]，都是 [zh, en]。没有这个键的章节一个字都不变
            k = s['rows']['after']
            table = ('<dl class="case-brief case-decision" data-component="Rows">'
                     + ''.join(f'<div><dt>{r[0][i]}</dt><dd><strong>{r[1][i]}</strong><br>{r[2][i]}</dd></div>' for r in s['rows']['items']) + '</dl>')
            h += f'<div class="{box}">{"".join(paras[:k])}</div>{table}<div class="{box}">{"".join(paras[k:])}</div>'
        else:
            h += f'<div class="{box}">{"".join(paras)}</div>'
        if 'decision' in s:
            h += '<dl class="case-brief case-decision" data-component="Decision">' + ''.join(f'<div><dt>{T(k, lang)}</dt><dd>{v[i]}</dd></div>' for k, v in zip(DECISION_LABELS, s['decision'])) + '</dl>'
        if 'insight' in s:
            h += f'<div class="note" data-component="Tobie’s note"><span class="note__face" aria-hidden="true"></span><div><div class="note__who">{t("Tobie 的注释", "Tobie’s note", lang)}</div><p class="note__text">{s["insight"][i]}</p></div></div>'
        if 'steps' in s:
            h += '<div class="steps">' + ''.join(f'<div class="step"><span class="label label--teal">{st[0][i]}</span><h3>{st[1][i]}</h3><p>{st[2][i]}</p></div>' for st in s['steps']) + '</div>'
        figs = FIGURES.get((key, n + 1), [])
        h += ''.join(figure_html(f, lang) for f in figs if f.get('before_demo'))   # 'before_demo'（2026-11-23）：紧跟正文的图，放在原型前面
        h += section_demo(key, n + 1, lang)
        h += ''.join(figure_html(f, lang) for f in figs if not f.get('before_demo'))
        if 'external' in s:
            h += f'<p style="margin-top:24px"><a class="link" href="{s["external"][0]}" target="_blank" rel="noopener">{s["external"][1][i]}</a></p>'
        h += '</section>'
    if c.get('source'):   # 没有 Figma 原稿的案例（Agent Matrix）不出这一行
        h += f'''
<p class="source-line">{t('原稿', 'Source', lang)}: <a href="{c['source']}" target="_blank" rel="noopener">{t('Figma 项目文件', 'Figma project file', lang)} ↗</a> · {t('访问遵循原文件的分享权限。', 'Access follows the source file’s sharing settings.', lang)}</p>'''
    h += '''
 </article>
</div>'''
    return h

def case_page(slug, lang):
    c = CASES[slug]; i = 0 if lang == 'zh' else 1
    path = url(slug, lang)
    p = next(x for x in PROJECTS if x['slug'] == slug)
    title = T(CASE_TITLES[slug], lang)
    h = head(f"{p['name']} — {title} — Tobie", c['deck'][i], lang, path) + topbar(lang, path, 'work')
    facts = ''.join(f'<div><dt>{f[i]}</dt><dd>{f[i + 2]}</dd></div>' for f in c['facts'])
    brief = ''.join(f'<div><dt>{T(k, lang)}</dt><dd>{v[i]}</dd></div>' for k, v in zip(BRIEF_LABELS, c['brief']))
    prov_key, hero_label = CASE_HERO[slug]
    prov_text, prov_cls = prov_shown(prov_key)
    # 没有可试演示的案例（Agent Matrix）不出「直接试原型」，「从头读」当主按钮
    start = f'<a class="btn{" btn--ghost" if has_try(slug) else ""}" href="#section-1">{t("从头读", "Read from the start", lang)}</a>'
    actions = (f'<a class="btn" href="#try">{t("直接试原型", "Try the prototype", lang)} <span aria-hidden="true">↓</span></a>' if has_try(slug) else '') + start
    back = f'<a class="back" href="{url("", lang)}#work">← {t("全部作品", "All work", lang)}</a>'
    tabs = c.get('tabs')
    if tabs:
        # 'tabs'（2026-11-18，卡 030，只有 smt 用）：页面顶部一排 tab，返回链接挪到 tab 上面；第一个 tab 是案例本身（上面这些键），
        # 后面的 tab 各有自己的开头和章节。没开 JS 时 tab 是跳到各块的链接，几块从上往下排着都能读；site.js 把它变成真正的 tab。
        links = ''.join(f'<a class="case-tabs__tab" id="tab-{tb["id"]}" href="#{tb["id"]}" data-tab="{tb["id"]}">{T(tb["name"], lang)}</a>' for tb in tabs)
        h += f'''<main id="main" class="wrap">
<div class="case-tabs" data-component="Case tabs">
 {back}
 <div class="case-tabs__list" data-tablist>{links}</div>
</div>
<div class="case-tab" id="{tabs[0]['id']}" data-tabpanel>
<header class="case-head">'''
    else:
        h += f'''<main id="main" class="wrap">
<header class="case-head">
 {back}'''
    h += f'''
 <p class="label path" style="--project:var(--p-{p['project']})"><span>{p['name']}</span><span>{p['year']}</span><span>{T(p['type'], lang)}</span></p>
 <h1>{title}</h1>
 <p class="lead">{c['deck'][i]}</p>
 <dl class="case-brief" data-component="Case brief">{brief}</dl>
 <dl class="case-spec" data-component="Spec table">{facts}</dl>
</header>
<div class="case-hero frame-block reveal">{frame_label(T(hero_label, lang), T(prov_text, lang), prov_cls, p['project'])}<div class="frame">{cover(slug, lang)}</div>
 <div class="case-hero__actions">{actions}</div></div>'''
    h += case_layout(c, slug, lang)
    for tb in (tabs or [])[1:]:
        # 后面的 tab：开头和第一个 tab 同样的样子（标题、导语、三行摘要、事实卡），不放封面。
        # 一页只能有一个 h1，所以标题用 h2，样式和 h1 一样。各节锚点带 tab id 前缀，节号从 01 重新数。
        tfacts = ''.join(f'<div><dt>{f[i]}</dt><dd>{f[i + 2]}</dd></div>' for f in tb['facts'])
        tbrief = ''.join(f'<div><dt>{T(k, lang)}</dt><dd>{v[i]}</dd></div>' for k, v in zip(BRIEF_LABELS, tb['brief']))
        h += f'''
</div>
<div class="case-tab" id="{tb['id']}" data-tabpanel>
<header class="case-head">
 <h2 class="case-head__title">{tb['title'][i]}</h2>
 <p class="lead">{tb['deck'][i]}</p>
 <dl class="case-brief" data-component="Case brief">{tbrief}</dl>
 <dl class="case-spec" data-component="Spec table">{tfacts}</dl>
</header>''' + case_layout(tb, tb['id'], lang, f"{tb['id']}-section")
    if tabs:
        h += '\n</div>'
    idx = [x['slug'] for x in PROJECTS].index(slug)
    nxt = PROJECTS[(idx + 1) % len(PROJECTS)]
    h += f'''
<a class="next" href="{url(nxt['slug'], lang)}"><span><span class="label">{t('下一个项目', 'Next project', lang)}</span><span class="next__name">{nxt['name']}</span></span><span class="next__arrow" aria-hidden="true">→</span></a>
</main>
'''
    return h + footer(lang)


def save(route, html):
    p = OUT / route / 'index.html'
    p.parent.mkdir(parents=True, exist_ok=True)
    # 明确写 UTF-8 和 \n：Windows 上不指定的话会按系统编码写、并把换行改成 \r\n
    p.write_text(html, encoding='utf-8', newline='\n')

def sitemap():
    """站点地图：每页一条，带中英文互指。"""
    rows = []
    for slug in [''] + [p['slug'] for p in PROJECTS]:
        zh, en = SITE + url(slug, 'zh'), SITE + url(slug, 'en')
        alt = (f'<xhtml:link rel="alternate" hreflang="zh-CN" href="{zh}"/>'
               f'<xhtml:link rel="alternate" hreflang="en" href="{en}"/>')
        rows += [f' <url><loc>{zh}</loc>{alt}</url>', f' <url><loc>{en}</loc>{alt}</url>']
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
            + '\n'.join(rows) + '\n</urlset>\n')

if __name__ == '__main__':
    for lang in ('zh', 'en'):
        save('' if lang == 'zh' else 'en', home(lang))
        for p in PROJECTS:
            save(('en/' if lang == 'en' else '') + 'work/' + p['slug'], case_page(p['slug'], lang))
    (OUT / 'sitemap.xml').write_text(sitemap(), encoding='utf-8', newline='\n')
    (OUT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n', encoding='utf-8', newline='\n')
    print(f'Built {2 + 2 * len(PROJECTS)} pages, sitemap.xml and robots.txt.')
