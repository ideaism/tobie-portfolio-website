"""青桔封面的三个宝箱：把展示页的灰底（#404040）去掉，只留宝箱本身，存成带透明底的 PNG。

为什么要去底：新封面的舞台底色不是 #404040，带着灰底的方块会露出来。
怎么去：只去掉和图片四边连着的那一片灰底（从四边往里漫延），宝箱里面的颜色一个像素都不动。
只有紧贴灰底的那一圈像素（一个像素宽）会变：按「宝箱颜色半透明地盖在 #404040 上」反算出透明度，
这样放到别的底色上不会带一圈灰边。

用法：python3 tools/cut_qingju_chests.py            （在 portfolio-web/ 里跑）
读 sources/work/qingju-hifi/chests.png，写 sources/work/qingju-hifi/chests-cut.png
"""
import sys
from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'sources' / 'work' / 'qingju-hifi' / 'chests.png'
DST = Path(sys.argv[2]) if len(sys.argv) > 2 else SRC.with_name('chests-cut.png')
BG = (64, 64, 64)
TOL = 10          # 和灰底差多少以内算灰底


def main():
    im = Image.open(SRC).convert('RGB')
    w, h = im.size
    px = im.load()
    near = lambda x, y: max(abs(px[x, y][i] - BG[i]) for i in range(3)) <= TOL
    bg = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if near(x, y) and not bg[y][x]:
                bg[y][x] = True; q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if near(x, y) and not bg[y][x]:
                bg[y][x] = True; q.append((x, y))
    while q:
        x, y = q.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not bg[ny][nx] and near(nx, ny):
                bg[ny][nx] = True; q.append((nx, ny))
    out = Image.new('RGBA', (w, h))
    op = out.load()
    edge = 0
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            if bg[y][x]:
                op[x, y] = (r, g, b, 0)
                continue
            touches = any(0 <= x + dx < w and 0 <= y + dy < h and bg[y + dy][x + dx]
                          for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if not touches:
                op[x, y] = (r, g, b, 255)
                continue
            # 边缘一圈：这个像素 = 宝箱颜色 × a + 灰底 × (1 - a)，取能解释它的最小 a
            a = max((c - k) / (255 - k) if c > k else (k - c) / k for c, k in zip((r, g, b), BG))
            a = min(1.0, max(a, 0.0))
            if a < 0.02:
                op[x, y] = (r, g, b, 0)
            else:
                f = tuple(min(255, max(0, round((c - (1 - a) * k) / a))) for c, k in zip((r, g, b), BG))
                op[x, y] = (*f, round(a * 255))
            edge += 1
    out.save(DST)
    kept = sum(1 for y in range(h) for x in range(w) if not bg[y][x])
    print(f'{DST.name}: {w} × {h}，留下 {kept} 个像素，其中边缘 {edge} 个')


if __name__ == '__main__':
    main()
