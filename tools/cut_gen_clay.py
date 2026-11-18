"""青桔封面上的「单车 + 宝箱 + 藏宝图」：从 Figma AI 生成的黏土图里去掉薄荷绿底色，存成带透明底的 PNG。

来源：sources/work/gen/qj-clay.png（2026-11-18 用 Figma AI 生成，只当封面装饰，不是项目成果）。
怎么去：取图片四边的中位色当底色，和底色差得越多越不透明（差 34 以下全透明，50 以上全不透明，中间渐变），
再做一次 5 像素的中值滤波去掉零碎噪点，最后裁到内容边界。地面的浅绿阴影会留下一点，放在地图插画上看不出来。

用法：python3 tools/cut_gen_clay.py            （在 portfolio-web/ 里跑）
读 sources/work/gen/qj-clay.png，写 sources/work/gen/qj-bike-chest.png
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'sources' / 'work' / 'gen' / 'qj-clay.png'
DST = Path(sys.argv[2]) if len(sys.argv) > 2 else SRC.with_name('qj-bike-chest.png')

im = Image.open(SRC).convert('RGB')
a = np.asarray(im).astype(float)
border = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3), a[:, :8].reshape(-1, 3)])
bg = np.median(border, axis=0)
d = np.sqrt(((a - bg) ** 2).sum(2))
alpha = Image.fromarray((np.clip((d - 34) / 16, 0, 1) * 255).astype('uint8')).filter(ImageFilter.MedianFilter(5))
out = im.copy()
out.putalpha(alpha)
out = out.crop(alpha.point(lambda v: 255 if v > 128 else 0).getbbox())
out.save(DST)
print(f'{DST.name}: {out.width} × {out.height}')
