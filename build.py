from pathlib import Path
from html import escape
import json
import re
ROOT=Path(__file__).parent
OUT=ROOT/'dist'
ASSETS=json.loads((ROOT/'assets.json').read_text())

def tr(zh,en,lang): return zh if lang=='zh' else en
def url(slug,lang): return ('/en' if lang=='en' else '')+('/' if not slug else '/work/'+slug+'/')
def img(name,alt,extra=''):
 extra=re.sub(r'(?:width|height)="[0-9]+"', '', extra)
 w,h=ASSETS[name]
 return f'<img src="/assets/{name}.webp" alt="{escape(alt)}" width="{w}" height="{h}" {extra}>' 
def head(title,desc,lang):
 return f'''<!doctype html><html lang="{'zh-CN' if lang=='zh' else 'en'}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(title)} — Tobie / Yucheng Feng</title><meta name="description" content="{escape(desc)}"><meta name="theme-color" content="#244ce4"><meta property="og:type" content="website"><meta property="og:title" content="{escape(title)} — Tobie"><meta property="og:description" content="{escape(desc)}"><link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%23244ce4'/%3E%3Ctext x='13' y='47' font-family='Arial' font-weight='700' font-size='43' fill='white'%3Et.%3C/text%3E%3C/svg%3E"><link rel="stylesheet" href="/styles.css"><script src="/site.js" defer></script></head><body>'''
def nav(lang,slug=''):
 home=url('',lang);other=url(slug,'en' if lang=='zh' else 'zh')
 return f'''<a class="skip" href="#main">{tr('跳到内容','Skip to content',lang)}</a><header class="header"><div class="wrap nav"><a class="brand" href="{home}" aria-label="Tobie · {tr('首页','Home',lang)}">tobie<i>.</i><small>YUCHENG FENG</small></a><nav class="navlinks" id="navigation" aria-label="{tr('主导航','Main navigation',lang)}"><a href="{home}#work">{tr('精选作品','Work',lang)}</a><a class="nav-extra" href="{home}#explorations">{tr('探索','Explorations',lang)}</a><a class="nav-extra" href="{home}#about">{tr('关于我','About',lang)}</a><a class="nav-extra" href="#contact">{tr('联系','Contact',lang)}</a><a class="lang" href="{other}" lang="{'en' if lang=='zh' else 'zh-CN'}" aria-label="{tr('Read in English','切换到中文',lang)}">{tr('EN','中文',lang)}</a></nav><button class="menu-btn" aria-label="{tr('展开导航','Open navigation',lang)}" aria-controls="navigation" aria-expanded="false">☰</button></div></header>'''
def footer(lang):
 return f'''<footer class="contact" id="contact"><div class="wrap"><div class="kicker">LET’S MAKE SOMETHING MEANINGFUL</div><h2>{tr('从一个问题，开始交流。','Good things start<br>with a conversation.',lang)}</h2><a class="contact-link" href="mailto:beijixinfei@gmail.com">beijixinfei@gmail.com <span aria-hidden="true">↗</span></a><div class="footer-row"><span>© 2026 Yucheng Feng · Tobie</span><div class="footer-links"><a href="/assets/Yucheng-Feng-Portfolio.pdf" target="_blank" rel="noopener">{tr('PDF 作品集 ↗','Portfolio PDF ↗',lang)}</a><a href="{url('',lang)}#about">{tr('关于我','About me',lang)}</a><a href="#main">{tr('回到顶部 ↑','Back to top ↑',lang)}</a></div></div></div></footer>'''
PROJECTS=[
 {'slug':'qingju','class':'featured','name':'Qingju · 青桔','image':'qingju-cover','year':'2021','type':['商业委托 · 训练营结项','Commercial brief · Programme capstone'],'title':['让成长体系，回到骑行本身。','Making growth part of the ride.'],'summary':['从休闲骑行的真实动机出发，将探索、记录与奖励连接成一条完整的体验。','Connecting discovery, memories and rewards around the reasons people choose to ride.'],'tags':['用户研究 / 用户旅程 / 低保真原型','User research / Journey mapping / Wireframes']},
 {'slug':'playbook','class':'playbook','name':'PlayBook','image':'studio-campaign','year':'2023–2024','type':['创业团队 · 创作者与粉丝平台','Startup · Creator & fan platform'],'title':['把复杂规则，变成可参与的体验。','Complex rules. Meaningful participation.'],'summary':['连接 Studio 的创作自由与 App 的参与流程，让任务、物品和合成围绕同一套规则运转。','Bringing creator freedom in Studio and fan participation in the App into one coherent system.'],'tags':['Studio UX/UI / App UX / 交互原型','Studio UX/UI / App UX / Prototyping']},
 {'slug':'smt','class':'smt','name':'Industrial Securities · 兴业 SMT','image':'smt-overview','year':'PROFESSIONAL WORK','type':['企业项目 · 金融工具','Professional work · Financial tools'],'title':['从业务单元，建立界面秩序。','A shared structure for financial workflows.'],'summary':['与同事共同拆分业务单元，通过组件、状态与规范支撑高密度金融界面的一致性。','Breaking down business units with colleagues, then defining components, states and specifications.'],'tags':['业务拆分 / 组件设计 / 规范维护','Business decomposition / Components / Specifications']},
 {'slug':'commons-fridge','class':'fridge','name':'The Commons Fridge','image':'fridge-p1-0','year':'2026','type':['硕士毕业设计 · 实体与数字交互','MA final project · Physical & digital interaction'],'title':['共享一台冰箱，也共享清晰的边界。','A shared fridge, with clearer boundaries.'],'summary':['从五次习惯访谈出发，把设计从库存管理转向低负担的可见性、空间归属与处理权限。','Five habit interviews redirected a stock-management idea toward visibility, ownership and permission.'],'tags':['质性研究 / NFC 入口 / 功能原型','Qualitative research / NFC touchpoints / Functional prototype']}
]
def project_card(p,lang):
 i=0 if lang=='zh' else 1
 return f'''<a class="project {p['class']}" href="{url(p['slug'],lang)}"><div class="project-visual">{img(p['image'],p['name']+' — '+p['title'][i],'loading="lazy" width="1920" height="1080"')}<span class="round-arrow" aria-hidden="true">↗</span></div><div class="project-copy"><div class="project-meta"><span>{p['type'][i]}</span><span>{p['year']}</span></div><h3><span class="project-title-line">{p['name']}</span>{p['title'][i]}</h3><p>{p['summary'][i]}</p><div class="project-tags">{p['tags'][i]}</div></div></a>'''
def home(lang):
 content=head(tr('冯渝程 · 用户体验与交互设计','UX & Interaction Design',lang),tr('从用户研究、复杂工具到实体交互。精选青桔、PlayBook、兴业 SMT 与 The Commons Fridge 项目。','Selected work in user research, complex tools and physical interactions: Qingju, PlayBook, Industrial Securities SMT and The Commons Fridge.',lang),lang)+nav(lang)
 content+=f'''<main id="main"><section class="hero wrap"><div class="hero-top"><span>UX / INTERACTION DESIGNER</span><span>SELECTED WORK · 2021—2026</span></div><div class="hero-main"><div class="reveal"><h1>Tobie<span>.</span></h1><p class="name">{tr('冯渝程 / Yucheng Feng','Yucheng Feng / 冯渝程',lang)}</p><p class="intro">{tr('理解人的日常，<br>把复杂的问题，设计得<em>清晰而可用。</em>','I explore everyday behaviour<br>and make complex experiences<br><em>clearer to use.</em>',lang)}</p></div><div class="hero-art">{img('tobie-avatar',tr('Tobie 的个人插画形象：黑发、眼镜与牛仔外套','Tobie’s illustrated avatar with dark hair, glasses and a denim jacket',lang),'width="500" height="500" fetchpriority="high"')}<p class="art-label">CURIOUS MIND. THOUGHTFUL DESIGN.</p></div></div><div class="hero-bottom"><a class="inline-link" href="#work">{tr('看看我的设计','Explore selected work',lang)}<span class="arrow" aria-hidden="true">↓</span></a><p>{tr('研究 → 交互 → 系统 → 真实情境','Research → Interaction → Systems → Context',lang)}</p></div></section><section class="section wrap" id="work"><div class="section-top"><h2>{tr('精选作品','Selected work',lang)}</h2><small>01—04 / {tr('从问题到设计决策','From questions to design decisions',lang)}</small></div><div class="work-grid">{''.join(project_card(p,lang) for p in PROJECTS)}</div></section>'''
 content+=f'''<section class="section explorations" id="explorations"><div class="wrap"><div class="section-top"><h2>{tr('持续探索','Beyond the brief',lang)}</h2><small>{tr('学校项目与交互实验','Academic projects & interaction experiments',lang)}</small></div><div class="exploration-grid">'''
 for image,label,title,desc,link in [
 ('cctv','CDU / CRITICAL DESIGN',tr('让不可见的监控可见','Making the invisible visible',lang),tr('通过伦敦与温彻斯特的交互地图，探索“被看见”与“看回去”的权力关系。','An interactive map exploring the power of being watched and looking back in London and Winchester.',lang),'https://project2-yuchengfeng.vercel.app/'),
 ('quantified','CDU / DATA & IDENTITY',tr('情绪，也有自己的地理','The geography of a feeling',lang),tr('把个人状态、城市与时间连起来，用虚拟形象重新阅读一年的情绪记录。','Connecting personal statuses, cities and time, with virtual avatars as a way to revisit emotional records.',lang),'https://macd-yuchengfeng-kmiz.vercel.app/'),
 ('wuhan','EAI / URBAN RESEARCH',tr('重新阅读江汉路','Reading Jianghan Road',lang),tr('从建筑、城市记忆与人的行为出发，探索一条街道在不同时代留下的痕迹。','Exploring architecture, urban memory and everyday behaviour through the changing layers of one street.',lang),'/assets/Jianghan-Road-Study.pdf')]:
  content+=f'''<article class="experiment"><div class="experiment-image">{img(image,title,'loading="lazy" width="1200" height="800"')}</div><div class="kicker">{label}</div><h3>{title}</h3><p>{desc}</p><a class="inline-link" href="{link}" target="_blank" rel="noopener">{tr('查看项目','Explore project',lang)} <span aria-hidden="true">↗</span></a></article>'''
 content+=f'''</div></div></section><section class="about wrap" id="about"><div class="about-grid"><div class="about-label"><div class="kicker">A LITTLE ABOUT ME</div><h2>{tr('好奇，<br>也在意细节。','Curious by nature.<br>Careful by design.',lang)}</h2></div><div class="about-text"><p>{tr('我是冯渝程，也叫 Tobie。我的设计经历跨越金融工具、创作者平台和日常生活中的交互。我喜欢从人的行为出发，把模糊的需求拆开，再让它们成为可以理解、可以使用的系统。','I’m Yucheng Feng, also known as Tobie. My work spans financial tools, creator platforms and everyday interactions. I start with people’s behaviour, untangle the requirements, and give complex systems a form people can understand.',lang)}</p><div class="about-details"><div class="detail-row"><span>{tr('关注方向','Focus',lang)}</span><span>{tr('用户研究、交互设计、组件体系、实体与数字体验','User research, interaction design, component systems, physical and digital experiences',lang)}</span></div><div class="detail-row"><span>{tr('学习背景','Education',lang)}</span><span>{tr('南安普顿大学 · MA Communication Design<br>湖北美术学院 · 工业设计','University of Southampton · MA Communication Design<br>Hubei Institute of Fine Arts · Industrial Design',lang)}</span></div><div class="detail-row"><span>{tr('设计工具','Toolkit',lang)}</span><span>Figma · ProtoPie · {tr('流程与原型 · 规范与文档','Flows & prototypes · Specifications & documentation',lang)}</span></div></div></div></div></section></main>'''
 return content+footer(lang)+'</body></html>'
def save(route,content):
 p=OUT/route/'index.html';p.parent.mkdir(parents=True,exist_ok=True);p.write_text(content)
if __name__=='__main__':
 for lang in ['zh','en']: save('' if lang=='zh' else 'en',home(lang))
 print('Homepage generated in Chinese and English.')

def case_page(slug,lang):
 from cases import CASES
 c=CASES[slug];i=0 if lang=='zh' else 1
 title=c['title'][i];deck=c['deck'][i]
 html=head(title,deck,lang)+nav(lang,slug)
 facts=''.join(f'<div><dt>{f[i]}</dt><dd>{f[i+2]}</dd></div>' for f in c['facts'])
 html+=f'''<main id="main" class="wrap"><header class="case-head"><a class="back" href="{url('',lang)}#work">← {tr('返回精选作品','Back to selected work',lang)}</a><div class="kicker">{slug.replace('-',' ').upper()} / CASE STUDY</div><h1>{title}</h1><p class="case-deck">{deck}</p><dl class="case-facts">{facts}</dl></header><div class="case-cover {'fridge' if slug=='commons-fridge' else ''}">{img(c['image'],title,'width="1920" height="1080" fetchpriority="high"')}</div><div class="case-layout"><nav class="case-toc" aria-label="{tr('案例目录','Case study contents',lang)}">'''
 for n,s in enumerate(c['sections']): html+=f'<a href="#section-{n+1}">{s["label"][i]}</a>'
 html+='</nav><article>'
 for n,s in enumerate(c['sections']):
  html+=f'<section class="case-section" id="section-{n+1}"><div class="kicker">{s["label"][i]}</div><h2>{s["title"][i]}</h2>'
  if s.get('outcome'):html+='<div class="case-outcome">'
  html+=''.join(f'<p>{p[i]}</p>' for p in s['text'])
  if s.get('outcome'):html+='</div>'
  if 'insight' in s:html+=f'<div class="insight">{s["insight"][i]}</div>'
  if 'steps' in s:
   html+='<div class="steps">'+''.join(f'<div class="step"><span>{st[0][i]}</span><h3>{st[1][i]}</h3><p>{st[2][i]}</p></div>' for st in s['steps'])+'</div>'
  if 'image' in s:
   cap=s['caption'][i]
   html+=f'<figure class="evidence"><button data-enlarge aria-label="{tr("放大图片：","Enlarge image: ",lang)+escape(s["title"][i])}">{img(s["image"],s["title"][i],"loading=\"lazy\"")}</button><figcaption>{cap}</figcaption></figure>'
  if 'phones' in s:
   labels=[tr('材料不足','Missing materials',lang),tr('满足要求','Requirements met',lang),tr('确认合成','Confirm crafting',lang)]
   html+='<figure class="evidence"><div class="phone-row">'+''.join(f'<button data-enlarge aria-label="{tr("放大图片：","Enlarge image: ",lang)}{labels[j]}">'+img(p,labels[j],'loading="lazy"')+'</button>' for j,p in enumerate(s['phones']))+'</div><figcaption>'+s['caption'][i]+'</figcaption></figure>'
  if 'external' in s:html+=f'<p style="margin-top:24px"><a class="source-link" href="{s["external"][0]}" target="_blank" rel="noopener">{s["external"][1][i]}</a></p>'
  html+='</section>'
 html+=f'<p class="archive-note"><a class="source-link" href="{c["source"]}" target="_blank" rel="noopener">{tr("查看 Figma 项目原稿 ↗","View the original Figma file ↗",lang)}</a> · {tr("原稿访问遵循原文件权限。","Access follows the source file’s sharing permissions.",lang)}</p></article></div>'
 index=[p['slug'] for p in PROJECTS].index(slug);nxt=PROJECTS[(index+1)%len(PROJECTS)]
 html+=f'<a class="next-project" href="{url(nxt["slug"],lang)}"><span><small>{tr("下一个项目","Next project",lang)}</small><strong>{nxt["name"]}</strong></span><span class="arrow" aria-hidden="true">↗</span></a></main>'
 html+=f'<dialog class="lightbox" aria-label="{tr("作品图片放大预览","Enlarged project image",lang)}"><button autofocus>{tr("关闭 ×","Close ×",lang)}</button><img alt=""><a class="original-image" target="_blank" rel="noopener">{tr("查看原尺寸 ↗","Open full-size image ↗",lang)}</a><p></p></dialog>'
 return html+footer(lang)+'</body></html>'

if __name__=='__main__':
 for lang in ['zh','en']:
  for p in PROJECTS: save(('en/' if lang=='en' else '')+'work/'+p['slug'],case_page(p['slug'],lang))
 print('Eight bilingual case-study pages generated.')
