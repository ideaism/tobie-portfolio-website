"""把冰箱 3D 小样打包进 dist/demo/commons-fridge-3d/，给 Commons Fridge 07 节嵌 iframe 用（2026-11-24）。

  python tools/pack_fridge_demo.py

只读 ../01-commons-fridge/3d-小样/试装/（另一条线的东西，这里一个字节都不改），只写 dist/demo/commons-fridge-3d/（先清空再写）。
做的事，和小样自己的 试装/打包网站.py 一样，多了四处：
  1. 路径改成同级：../img/ → img/，../tripo/ → tripo/。
  2. model-viewer 不从 jsdelivr 拉，用本站一份：tools/vendor/model-viewer-3.5.0/（npm 包 @google/model-viewer@3.5.0 的
     dist/model-viewer.min.js 原样，Apache-2.0，LICENSE 一起放；出处和校验值见 docs/sources.md）。拷之前核对 sha256。
  3. 图片 PNG 转成 WebP（同尺寸，透明通道无损，颜色 quality 90），js / css / html 里的 .png 跟着改成 .webp。
     原 PNG 一共约 21 MB，转完见脚本最后一行。
  4. index.html 里 alt="" 的装饰图补 aria-hidden="true"（本站 verify.py 的无障碍检查要求）。
只拷默认网址用得到的：网页/ 里的 js、css、html、env-warm.jpg、手写体子集；img/trim/ 全部；img/stage.png、stage-b.png；
tripo/web/ 里 data.js 引用的 8 个 .glb（penguin-cheer.glb 没人引用、standin/ 只给 ?standin=1，都不拷）。
最后检查：没有剩下的 ../，没有指向外站的 script，引用到的本地文件都在。
"""
import hashlib
import io
import os
import re
import shutil
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT.parent / '01-commons-fridge' / '3d-小样' / '试装'
OUT = ROOT / 'dist' / 'demo' / 'commons-fridge-3d'
VENDOR = ROOT / 'tools' / 'vendor' / 'model-viewer-3.5.0'
MV_SHA256 = '8923739c8c1b4a02dd9c8cf66da5c2a448235cb5e49e439dd7bbba944ba4fbe1'
MV_CDN = 'https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js'
MV_LOCAL = 'vendor/model-viewer.min.js'
GLB = ['milk', 'takeaway', 'penguin-cheer-graded', 'penguin', 'cheese', 'container', 'jam', 'eggs']


def fix(text):
    text = text.replace('../img/', 'img/').replace('../tripo/', 'tripo/')
    text = text.replace(MV_CDN, MV_LOCAL)
    return re.sub(r'\.png\b', '.webp', text)   # 也有 '…penguin-' + n + '.png' 这种拼出来的


def webp(src, dst):
    im = Image.open(src)
    im.save(dst, 'WEBP', quality=90, method=4, alpha_quality=100)


def main():
    W = SRC / '网页'
    if not (W / 'index.html').exists():
        sys.exit(f'找不到小样：{W}')
    mv = (VENDOR / 'model-viewer.min.js').read_bytes()
    if hashlib.sha256(mv).hexdigest() != MV_SHA256:
        sys.exit('tools/vendor/model-viewer-3.5.0/model-viewer.min.js 的 sha256 对不上，停止')
    if OUT.exists():
        shutil.rmtree(OUT)
    for d in ('img/trim', 'tripo/web', 'fonts', 'vendor'):
        (OUT / d).mkdir(parents=True, exist_ok=True)

    for p in sorted(W.iterdir()):
        if not p.is_file():
            continue
        if p.suffix in ('.js', '.css', '.html'):
            text = fix(io.open(p, encoding='utf-8', newline='').read())
            if p.suffix == '.html':   # alt="" 的都是装饰图（台面、企鹅各个姿势），补 aria-hidden，读屏跳过；verify.py 只认带 aria-hidden 的空 alt
                text = re.sub(r'<img (?![^>]*aria-hidden)([^>]*alt=""[^>]*)>', r'<img aria-hidden="true" >', text)
            io.open(OUT / p.name, 'w', encoding='utf-8', newline='').write(text)
        elif p.suffix in ('.jpg', '.png'):
            shutil.copy(p, OUT / p.name)
    shutil.copy(W / 'fonts' / 'zcool-kuaile-subset.woff2', OUT / 'fonts')
    for p in sorted((SRC / 'img' / 'trim').glob('*.png')):
        webp(p, OUT / 'img' / 'trim' / (p.stem + '.webp'))
    for n in ('stage', 'stage-b'):
        webp(SRC / 'img' / f'{n}.png', OUT / 'img' / f'{n}.webp')
    for n in GLB:
        shutil.copy(SRC / 'tripo' / 'web' / f'{n}.glb', OUT / 'tripo' / 'web')
    (OUT / MV_LOCAL).write_bytes(mv)
    shutil.copy(VENDOR / 'LICENSE', OUT / 'vendor' / 'model-viewer.LICENSE.txt')

    texts = {p.name: p.read_text(encoding='utf-8') for p in OUT.iterdir() if p.suffix in ('.js', '.css', '.html')}
    left = [(n, m) for n, t in texts.items() for m in re.findall(r'\.\./[^\'"\s)]+', t)]
    ext = [(n, m) for n, t in texts.items() for m in re.findall(r'''\.src\s*=\s*['"](https?://[^'"]+)''', t)]
    miss = []
    for n, t in texts.items():
        for m in set(re.findall(r'''['"(]((?:img|tripo|fonts|vendor)/[\w./-]+\.(?:webp|png|jpg|glb|woff2|js))''', t)):
            if not (OUT / m).exists():
                miss.append((n, m))
    files = [p for p in OUT.rglob('*') if p.is_file()]
    total = sum(p.stat().st_size for p in files)
    print(f'{OUT.relative_to(ROOT)}: {len(files)} files, {total / 1e6:.1f} MB '
          f'(glb {sum(p.stat().st_size for p in files if p.suffix == ".glb") / 1e6:.1f} MB, '
          f'webp {sum(p.stat().st_size for p in files if p.suffix == ".webp") / 1e6:.1f} MB)')
    if left or ext or miss:
        sys.exit(f'leftover ../: {left[:5]}  external script: {ext[:5]}  missing: {miss[:10]}')
    print('ok: no ../ left, no external script, every referenced file present')


if __name__ == '__main__':
    main()
