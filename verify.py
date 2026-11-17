from pathlib import Path
from urllib.parse import urlsplit,unquote
from html.parser import HTMLParser
import json, urllib.request
ROOT=Path(__file__).parent/'dist'
class Page(HTMLParser):
 def __init__(self,path):
  super().__init__();self.path=path;self.refs=[];self.ids=set();self.h1=0;self.imgs=[];self.lang=None;self.stack=[];self.structure_errors=[];self.feed(path.read_text());self.structure_errors.extend(self.stack)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:self.stack.append(tag)
  if 'id' in a:self.ids.add(a['id'])
  if tag=='html':self.lang=a.get('lang')
  if tag=='h1':self.h1+=1
  if tag=='img':self.imgs.append(a)
  for k in ['src','href']:
   if a.get(k):self.refs.append(a[k])
 def handle_endtag(self,tag):
  if not self.stack or self.stack[-1]!=tag:self.structure_errors.append('mismatched closing '+tag)
  else:self.stack.pop()
pages={p:Page(p) for p in ROOT.rglob('index.html')};errors=[];checked=set()
for p,v in pages.items():
 if v.structure_errors:errors.append(f'{p}: structure {v.structure_errors}')
 if v.h1!=1:errors.append(f'{p}: h1 count {v.h1}')
 if v.lang not in ['en','zh-CN']:errors.append(f'{p}: lang missing')
 for img in v.imgs:
  if 'src' in img and not img.get('alt') and img.get('aria-hidden')!='true':errors.append(f'{p}: missing alt')   # aria-hidden copies (scroll 'fixed' layer) are decorative
 for ref in v.refs:
  u=urlsplit(ref)
  if u.scheme or ref.startswith('//'):continue
  target=ROOT/unquote(u.path.lstrip('/')) if u.path.startswith('/') else p.parent/unquote(u.path)
  if not u.path:target=p
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{p}: missing {ref}');continue
  if u.fragment and target in pages and u.fragment not in pages[target].ids:errors.append(f'{p}: missing anchor {ref}')
  if u.path.startswith('/'):checked.add(u.path)
for path in sorted(checked):
 try:
  with urllib.request.urlopen('http://127.0.0.1:4173'+path) as r:
   if r.status!=200:errors.append(f'{path}: {r.status}')
 except Exception as e:errors.append(f'{path}: {e}')
report={'pages':len(pages),'local_urls_checked':len(checked),'errors':errors}
Path('qa').mkdir(exist_ok=True)   # qa/ 不进仓库，新克隆的电脑上没有这个文件夹
Path('qa/static-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=False,indent=2));assert not errors
