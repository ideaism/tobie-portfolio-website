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
VERSION = '20261116'    # 样式表或脚本改了就要换这个号，不然访客的浏览器会继续用旧的缓存
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
    return (f'<div class="frame-label" style="--project:var(--p-{project})"><span class="frame-label__name"><span>{name}</span></span>'
            f'<span class="prov {prov_cls}">{prov_text}</span></div>')


# ------------------------------------------------------------------ shell
def head(title, desc, lang, path):
    other = ('/en' + path) if lang == 'zh' else (path[3:] or '/')
    zh_path, en_path = (path, other) if lang == 'zh' else (other, path)
    return f'''<!doctype html>
<html lang="{'zh-CN' if lang == 'zh' else 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
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
 {'slug': 'qingju', 'project': 'qingju', 'name': 'Qingju · 青桔', 'year': '2021',
  'type': ['青桔（滴滴）商业委托 · 训练营结项', 'Commercial brief from Qingju (DiDi) · Programme capstone'],
  'title': ['让成长体系，回到骑行本身。', 'Make growth part of the ride.'],
  'summary': ['把“提高活跃度”的业务目标，变成围绕休闲骑行的发现、记录与奖励——从研究一路做到低保真流程。', 'An engagement brief turned into discovery, memories and rewards around leisure riding — carried from research to a low-fidelity flow.'],
  'chips': [['用户研究', '旅程图', '低保真原型'], ['User research', 'Journey mapping', 'Lo-fi prototyping']],
  'label': ['青桔 · 寻宝地图与路线讨论圈，2021', 'Qingju · treasure map and route discussion, 2021'], 'prov': 'original'},
 {'slug': 'playbook', 'project': 'playbook', 'name': 'PlayBook', 'year': '2023–24',
  'type': ['创业团队 · 创作者平台', 'Startup · creator platform'],
  'title': ['把复杂规则，变成可参与的体验。', 'Turn creator rules into fan experiences.'],
  'summary': ['创作者在 Studio 里编辑规则，粉丝在 App 里参与、收集与合成。我让同一条规则在两端都能被理解。', 'Creators build rules in Studio; fans take part, collect and craft in the App. I made the same rule understandable on both sides.'],
  'chips': [['Studio UX/UI', 'App UX', '交互原型', '竞品分析'], ['Studio UX/UI', 'App UX', 'Prototyping', 'Competitive analysis']],
  'label': ['PlayBook · Studio 活动页 + App 首页与任务页', 'PlayBook · Studio campaign page + App home and missions'], 'prov': 'original'},
 {'slug': 'smt', 'project': 'smt', 'name': 'Industrial Securities · 兴业 SMT', 'year': '2022–23',
  'type': ['在职项目 · 证券桌面软件', 'In-house · securities software'],
  'title': ['从业务单元，建立界面秩序。', 'Let business meaning set component boundaries.'],
  'summary': ['与同事一起拆分业务单元，我负责组件、状态与使用规范，让高密度的金融界面可以复用。', 'With colleagues I broke the product into business units; I designed and maintained the components, states and usage rules that let a dense financial interface be reused.'],
  'chips': [['业务拆分', '组件设计', '规范维护', '需求对接'], ['Business decomposition', 'Components', 'Specifications', 'Requirements liaison']],
  'label': ['SMT-MAX · 资产与持仓', 'SMT-MAX · assets & positions'], 'prov': 'original'},
 {'slug': 'commons-fridge', 'project': 'fridge', 'name': 'The Commons Fridge', 'year': '2026',
  'type': ['硕士毕业设计', 'MA final project'],
  'title': ['共享一台冰箱，也共享清晰的边界。', 'Make shared care easier to negotiate.'],
  'summary': ['五场习惯访谈，把“全量库存”转向更轻的共享协调：看见物品，了解归属，再决定能做什么。附可运行的原型。', 'Five habit interviews turned a full-inventory idea into lighter coordination: see the item, understand ownership, then decide what you may do. Comes with a working prototype.'],
  'chips': [['质性研究', 'NFC 入口', '功能原型'], ['Qualitative research', 'NFC touchpoints', 'Working prototype']],
  'label': ['The Commons Fridge · 冰箱前的研究者演示', 'The Commons Fridge · researcher demo at the fridge'], 'prov': 'photo'},
]

# 首页「精选作品」和案例页底部「下一个项目」的先后顺序。改顺序只改这一行。
# 2026-11-16 本人定：PlayBook 排最前。其余三个保持原来的先后。
PROJECT_ORDER = ['playbook', 'qingju', 'smt', 'commons-fridge']
PROJECTS.sort(key=lambda p: PROJECT_ORDER.index(p['slug']))

def collage(slug, lang):
    """Compositions made only of original screens and photos."""
    if slug == 'qingju':
        # 2026-11-16（本人定）：封面用团队高保真，不用低保真线框。三块都裁自 2021 年的方案展示页，底色和原稿一致。
        plain = 'border-radius:0;box-shadow:none'
        return (f'<div class="collage" style="--bg:#404040">'
                + img('qingju/hifi-map', t('高保真：寻宝地图，地图上散落着不同等级的宝箱', 'High fidelity: the treasure map, with chests of different tiers on the map', lang)).replace('<img', f'<img style="left:4%;top:5%;width:42%;{plain}"')
                + img('qingju/hifi-route', t('高保真：路线讨论圈与路线详情', 'High fidelity: route discussion and route detail', lang)).replace('<img', f'<img style="left:51%;top:6%;width:42%;{plain}"')
                + img('qingju/hifi-chests', t('三个等级的宝箱：铜、银、金', 'Three chest tiers: bronze, silver and gold', lang)).replace('<img', f'<img style="left:62%;top:84%;width:30%;{plain}"')
                + '</div>')
    if slug == 'playbook':
        # 2026-11-16（本人定）：封面用成品界面。Studio 活动页是本人做的，两屏 App 是团队的成品。
        phone = 'aspect-ratio:390/844;object-fit:cover;object-position:top'
        return (f'<div class="collage" style="--bg:#F4F1EC">'
                + img('playbook/studio-campaign', t('PlayBook Studio 活动页', 'PlayBook Studio campaign page', lang)).replace('<img', '<img style="left:3%;top:13%;width:62%"')
                + img('playbook/team-mission', t('PlayBook App 任务页（成品界面）', 'PlayBook App mission page (finished UI)', lang), 'collage__phone').replace('<img', f'<img style="left:55%;top:21%;width:20%;{phone}"')
                + img('playbook/team-home', t('PlayBook App 首页（成品界面）', 'PlayBook App home (finished UI)', lang), 'collage__phone').replace('<img', f'<img style="left:77%;top:7%;width:20%;{phone}"')
                + '</div>')
    if slug == 'smt':
        return (f'<div class="collage" style="--bg:#F2F2F3;aspect-ratio:16/9">'
                + img('smt/overview', t('SMT-MAX 资产与持仓界面', 'SMT-MAX assets and positions screen', lang)).replace('<img', '<img style="left:0;top:0;width:100%;border-radius:0;box-shadow:none"')
                + '</div>')
    if slug == 'commons-fridge':
        return (f'<div class="collage" style="--bg:#1F2B28">'
                + img('fridge/photo-fridge', t('我在共享冰箱前演示手机原型', 'Me demonstrating the phone prototype at a shared fridge', lang)).replace('<img', '<img style="left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%;border-radius:0;box-shadow:none"')
                + img('fridge/cf-home', t('Commons Fridge 原型首页', 'Commons Fridge prototype home', lang), 'collage__phone').replace('<img', '<img style="right:5%;top:9%;width:21%"')
                + '</div>')
    return ''

# 自画像上的五个物件，顺序和 METHOD 一致：(x%, y%, 半径%, 说明纸条贴在物件的哪一侧)
# 2026-11-15 本人要求：去掉图上的数字圆点。平时只有很小的呼吸点，碰到或点到物件才压暗其余部分并贴出说明。
PORTRAIT_SPOTS = [
    (12.2, 63.5, 9, 'right'), (88.2, 44.5, 6.5, 'left'), (70.2, 10.5, 8, 'below'), (74.5, 32.5, 9, 'left'), (11.5, 29.0, 10, 'right')]
METHOD = [
    (['看清情境', 'Read the context'], ['指南针 · 研究', 'compass · research']),
    (['问清卡在哪', 'Ask why it hurts'], ['问号 · 问题定义', 'question mark · framing']),
    (['选定关键决定', 'Pick the decision'], ['灯泡 · 判断', 'light bulb · judgement']),
    (['把规则画出来', 'Draw the rule'], ['Figma · 结构与界面', 'Figma · structure']),
    (['做出原型，再请人检验', 'Prototype, then test'], ['AI · 快速原型', 'AI · fast prototyping']),
]

def home(lang):
    path = url('', lang)
    h = head(t('Tobie 冯渝程 — 产品与体验设计', 'Tobie (Yucheng Feng) — Product & experience design', lang),
             t('把复杂的系统，设计得让人看得懂。精选青桔、PlayBook、兴业 SMT 与 The Commons Fridge 项目，附基于原始界面的可操作原型。',
               'I make complex systems understandable. Selected work — Qingju, PlayBook, Industrial Securities SMT and The Commons Fridge — with prototypes you can try, built from the original screens.', lang), lang, path)
    h += topbar(lang, path)
    spots = ''.join(f'<button type="button" class="hot__spot" data-key="{n+1}" data-x="{x}" data-y="{y}" data-r="{r}" data-side="{side}" style="left:{x}%;top:{y}%;--r:{r}%" aria-label="{escape(T(METHOD[n][1], lang))}: {escape(T(METHOD[n][0], lang))}"><i></i></button>'
                    for n, (x, y, r, side) in enumerate(PORTRAIT_SPOTS))
    method = ''.join(f'<button type="button" class="method__step" data-key="{n+1}"><span class="thumb" style="--x:{PORTRAIT_SPOTS[n][0]};--y:{PORTRAIT_SPOTS[n][1]};--r:{PORTRAIT_SPOTS[n][2]}" aria-hidden="true"></span><span><b>{T(a, lang)}</b><small>{T(b, lang)}</small></span></button>' for n, (a, b) in enumerate(METHOD))
    h += f'''<main id="main">
<section class="hero"><div class="wrap">
 <div class="hero__grid">
  <div class="reveal">
   <p class="label path"><span>{t('产品与体验设计', 'Product & experience design', lang)}</span><span>{t('英国南安普顿', 'Southampton, UK', lang)}</span></p>
   <h1 class="hero__title">{t('把复杂的系统，<br>设计得<em>让人看得懂。</em>', 'I make complex systems <em>understandable.</em>', lang)}</h1>
   <p class="lead hero__lead">{t('我把产品背后的结构，和人们在其中做出的决定连接起来——从创作者工具、证券软件，到走廊尽头那台共享冰箱。', 'I connect the structure behind a product to the decisions people make inside it — in creator tools, securities software and the shared fridge down the hall.', lang)}</p>
   <div class="hero__ctas"><a class="btn" href="#work">{t('看作品', 'See the work', lang)} <span aria-hidden="true">↓</span></a><a class="btn btn--ghost" href="/assets/Yucheng-Feng-Portfolio.pdf" target="_blank" rel="noopener">{t('PDF 作品集', 'Portfolio PDF', lang)}</a></div>
  </div>
  <figure class="portrait frame-block reveal" data-component="Annotated figure">
   <div class="frame hot">{img('tobie/avatar', t('Tobie 的插画自画像：戴眼镜、穿牛仔外套，周围是指南针、问号、灯泡、Figma 与 ChatGPT 图标', 'Tobie’s illustrated self-portrait: glasses and a denim jacket, surrounded by a compass, a question mark, a light bulb and the Figma and ChatGPT logos', lang), lazy=False)}<div class="hot__dim" aria-hidden="true"></div>{spots}<div class="hot__note" aria-live="polite"><b></b><span></span></div></div>
   <figcaption class="hot__hint">{t('图上的小物件可以碰一碰：每一件对应我工作的一步。', 'Hover or tap the objects in the picture — each one is a step in how I work.', lang)}</figcaption>
  </figure>
 </div>
 <div class="method" data-component="Method strip"><p class="method__title label">{t('我怎么工作', 'How I work', lang)}</p>{method}</div>
</div></section>

<section class="section" id="work"><div class="wrap">
 <div class="section-head"><h2>{t('精选作品', 'Selected work', lang)}</h2><p>{t('2021–2026 年的四个项目。每张图都是原始设计；每个可操作原型都运行在原始界面上，不做重新“美化”。', 'Four projects, 2021–2026. Every image is the original design, and every prototype runs on the original screens — nothing is re-skinned.', lang)}</p></div>
 <div class="work">'''
    for p in PROJECTS:
        prov_text, prov_cls = PROV[p['prov']]
        chips = ''.join(f'<li class="chip">{c}</li>' for c in T(p['chips'], lang))
        h += f'''
  <article class="work-item reveal" data-component="Work item">
   <div class="work-item__visual frame-block">{frame_label(T(p['label'], lang), T(prov_text, lang), prov_cls, p['project'])}<a href="{url(p['slug'], lang)}" aria-label="{t('阅读案例：', 'Read the case: ', lang)}{p['name']}"><div class="frame">{collage(p['slug'], lang)}</div></a></div>
   <div class="work-item__copy">
    <p class="work-item__name" style="--project:var(--p-{p['project']})">{p['name']}</p>
    <p class="label work-item__meta">{p['year']} · {T(p['type'], lang)}</p>
    <h3><a href="{url(p['slug'], lang)}">{T(p['title'], lang)}</a></h3>
    <p class="work-item__summary">{T(p['summary'], lang)}</p>
    <ul class="chips">{chips}</ul>
    <div class="work-item__actions"><a class="link-arrow" href="{url(p['slug'], lang)}">{t('阅读案例', 'Read the case', lang)} <span aria-hidden="true">→</span></a><a class="link" href="{url(p['slug'], lang)}#try">{t('亲手试原型', 'Try the prototype', lang)}</a></div>
   </div>
  </article>'''
    h += '\n </div>\n</div></section>'

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
  <p>{t('我是冯渝程，也叫 Tobie，目前在南安普顿大学攻读 MA Communication Design。我的设计经历跨越金融工具、创作者平台和日常生活中的实体交互；我会用研究、线框、组件规范和可运行的原型，把一个决定讲清楚。', 'I’m Yucheng Feng, also known as Tobie, studying for an MA in Communication Design at the University of Southampton. My work spans financial tools, creator platforms and physical everyday interactions; I use research, wireframes, component specs and working prototypes to make a decision clear.', lang)}</p>
  <dl class="spec">
   <div><dt>{t('关注方向', 'Focus', lang)}</dt><dd>{t('用户研究、交互设计、组件体系、实体与数字体验', 'User research, interaction design, component systems, physical + digital experiences', lang)}</dd></div>
   <div><dt>{t('教育', 'Education', lang)}</dt><dd>{t('南安普顿大学 · MA Communication Design<br>湖北美术学院 · 本科', 'University of Southampton · MA Communication Design<br>Hubei Institute of Fine Arts · BA', lang)}</dd></div>
   <div><dt>{t('工具', 'Toolkit', lang)}</dt><dd>Figma · ProtoPie · HTML/CSS/JS {t('原型', 'prototypes', lang)} · {t('AI 辅助原型与视觉探索', 'AI-assisted prototyping and visual exploration', lang)}</dd></div>
   <div><dt>{t('语言', 'Languages', lang)}</dt><dd>{t('中文（母语）· 英文（工作语言）', 'Chinese (native) · English (working)', lang)}</dd></div>
   <div><dt>{t('所在地', 'Based in', lang)}</dt><dd>{t('英国南安普顿', 'Southampton, UK', lang)}</dd></div>
  </dl>
 </div>
</div></section>
</main>
'''
    return h + footer(lang)


# ------------------------------------------------------------------ case
CASE_HERO = {
    'qingju': ('original', ['青桔 · 寻宝地图与路线讨论圈 · 2021', 'Qingju · treasure map and route discussion · 2021']),
    'playbook': ('original', ['PlayBook · Studio 活动页 + App 首页与任务页', 'PlayBook · Studio campaign page + App home and missions']),
    'smt': ('original', ['SMT-MAX · 资产与持仓工作区', 'SMT-MAX · assets & positions workspace']),
    'commons-fridge': ('photo', ['The Commons Fridge · 研究者演示', 'The Commons Fridge · researcher demonstration']),
}

BRIEF_LABELS = [['问题', 'Problem'], ['我的关键决定', 'Key decisions'], ['结果', 'Outcome']]   # 案例开头三行摘要（2026-11-16）
# 决策块（2026-11-16）：section 上的可选键 'decision'，四行，每行 [zh, en]；沿用开头摘要的细线表格样式，放在正文之后、图之前
DECISION_LABELS = [['问题', 'Problem'], ['考虑过的方案', 'Alternative considered'], ['为什么没选', 'Why not'], ['结果', 'Outcome']]

CASE_TITLES = {   # conclusion headlines, aligned with the PDF deck
    'qingju': ['让成长体系，回到骑行本身。', 'Connect cycling rewards to the reasons people ride.'],
    'playbook': ['把复杂规则，变成可参与的体验。', 'Turn creator rules into fan experiences.'],
    'smt': ['从业务单元，建立界面秩序。', 'Make a securities interface reusable.'],
    'commons-fridge': ['共享一台冰箱，也共享清晰的边界。', 'Make shared care easier to negotiate.'],
}

def figure_html(f, lang):
    prov_text, prov_cls = PROV[f['prov']]
    label = frame_label(T(f['label'], lang), T(prov_text, lang), prov_cls, f['project'])
    cap = f'<figcaption class="frame-caption">{T(f["caption"], lang)}</figcaption>' if T(f['caption'], lang) else ''    # 图注留空（['', '']）就不出这一行：两条手机条共用后一条的图注时用
    kind = f['kind']
    if kind == 'image':
        # 'flat'：图本身就是页面底色时用，去掉图框的描边和投影，图直接落在页面上（配合 'bg' 把白底也换掉）。没有这个键的图框一个字都不变
        css = ([f'background:{f["bg"]}'] if f.get('bg') else []) + (['box-shadow:none'] if f.get('flat') else [])
        style = f' style="{";".join(css)}"' if css else ''
        pad = ' style="padding:24px"' if f.get('pad') else ''
        width = ' style="max-width:560px"' if f.get('narrow') else ''
        src = f['src_en'] if lang == 'en' and f.get('src_en') else f['src']    # 图里有文字、中英文各导一张时，英文页取 src_en
        return (f'<figure class="figure frame-block"{width}>{label}<div class="frame"{style}><button type="button" class="enlarge" data-enlarge aria-label="{t("放大：", "Enlarge: ", lang)}{escape(T(f["label"], lang))}"><div{pad}>'
                f'{img(src, T(f["label"], lang))}</div></button></div>{cap}</figure>')
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
    if kind == 'penguins':
        items = ''.join(f'<figure>{img(src, T(lbl, lang)).replace("<img", "<img style=\"box-shadow:none;border-radius:0;max-width:150px;margin:auto\"")}<figcaption style="text-align:center">{T(lbl, lang)}</figcaption></figure>' for src, lbl in f['items'])
        return f'<figure class="figure frame-block">{label}<div class="frame" style="background:#F6F1E6"><div class="phone-strip" style="--n:4">{items}</div></div>{cap}</figure>'
    return ''

def case_page(slug, lang):
    c = CASES[slug]; i = 0 if lang == 'zh' else 1
    path = url(slug, lang)
    p = next(x for x in PROJECTS if x['slug'] == slug)
    title = T(CASE_TITLES[slug], lang)
    h = head(f"{p['name']} — {title} — Tobie", c['deck'][i], lang, path) + topbar(lang, path, 'work')
    facts = ''.join(f'<div><dt>{f[i]}</dt><dd>{f[i + 2]}</dd></div>' for f in c['facts'])
    brief = ''.join(f'<div><dt>{T(k, lang)}</dt><dd>{v[i]}</dd></div>' for k, v in zip(BRIEF_LABELS, c['brief']))
    prov_key, hero_label = CASE_HERO[slug]
    prov_text, prov_cls = PROV[prov_key]
    h += f'''<main id="main" class="wrap">
<header class="case-head">
 <a class="back" href="{url('', lang)}#work">← {t('全部作品', 'All work', lang)}</a>
 <p class="label path" style="--project:var(--p-{p['project']})"><span>{p['name']}</span><span>{p['year']}</span><span>{T(p['type'], lang)}</span></p>
 <h1>{title}</h1>
 <p class="lead">{c['deck'][i]}</p>
 <dl class="case-brief" data-component="Case brief">{brief}</dl>
 <dl class="case-spec" data-component="Spec table">{facts}</dl>
</header>
<div class="case-hero frame-block reveal">{frame_label(T(hero_label, lang), T(prov_text, lang), prov_cls, p['project'])}<div class="frame">{collage(slug, lang)}</div>
 <div class="case-hero__actions"><a class="btn" href="#try">{t('直接试原型', 'Try the prototype', lang)} <span aria-hidden="true">↓</span></a><a class="btn btn--ghost" href="#section-1">{t('从头读', 'Read from the start', lang)}</a></div></div>
<div class="case-layout">
 <nav class="toc" aria-label="{t('本页目录', 'On this page', lang)}"><span class="toc__title label">{t('目录', 'Contents', lang)}</span>'''
    for n, s in enumerate(c['sections']):
        label = re.sub(r'^\d+\s*/\s*', '', s['label'][i])
        h += f'<a href="#section-{n+1}"><span>{n+1:02d}</span>{label}</a>'
    h += '</nav>\n <article class="case-body">'
    for n, s in enumerate(c['sections']):
        label = re.sub(r'^\d+\s*/\s*', '', s['label'][i])
        h += f'\n<section class="case-section" id="section-{n+1}"><p class="label label--teal">{n+1:02d} · {label}</p><h2>{s["title"][i]}</h2>'
        body = ''.join(f'<p>{para[i]}</p>' for para in s['text'])
        h += f'<div class="{"outcome" if s.get("outcome") else "prose"}">{body}</div>'
        if 'decision' in s:
            h += '<dl class="case-brief case-decision" data-component="Decision">' + ''.join(f'<div><dt>{T(k, lang)}</dt><dd>{v[i]}</dd></div>' for k, v in zip(DECISION_LABELS, s['decision'])) + '</dl>'
        if 'insight' in s:
            h += f'<div class="note" data-component="Tobie’s note"><span class="note__face" aria-hidden="true"></span><div><div class="note__who">{t("Tobie 的注释", "Tobie’s note", lang)}</div><p class="note__text">{s["insight"][i]}</p></div></div>'
        if 'steps' in s:
            h += '<div class="steps">' + ''.join(f'<div class="step"><span class="label label--teal">{st[0][i]}</span><h3>{st[1][i]}</h3><p>{st[2][i]}</p></div>' for st in s['steps']) + '</div>'
        h += section_demo(slug, n + 1, lang)
        for f in FIGURES.get((slug, n + 1), []):
            h += figure_html(f, lang)
        if 'external' in s:
            h += f'<p style="margin-top:24px"><a class="link" href="{s["external"][0]}" target="_blank" rel="noopener">{s["external"][1][i]}</a></p>'
        h += '</section>'
    h += f'''
<p class="source-line">{t('原稿', 'Source', lang)}: <a href="{c['source']}" target="_blank" rel="noopener">{t('Figma 项目文件', 'Figma project file', lang)} ↗</a> · {t('访问遵循原文件的分享权限。', 'Access follows the source file’s sharing settings.', lang)}</p>
 </article>
</div>'''
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
    print('Built 10 pages, sitemap.xml and robots.txt.')
