"""Export the original project screens used by the website.

Every file written here is a resized copy of an original source screen,
photo or recording poster. Nothing is redrawn. The only edits are:
  * resizing / WebP compression;
  * Qingju wireframes: individual screens cut from the lo-fi board and the
    board's teal flow arrows removed (sources/work/clean_qingju_lines.py);
  * tobie/face.webp: a circular crop of the existing avatar illustration.

Run:  python3 tools/prepare_assets.py                      (all assets)
      python3 tools/prepare_assets.py playbook/app-home    (only the named ones; the rest stay byte-identical)
Output: dist/assets/work/<project>/*.webp and dist/assets/work/manifest.json
"""
from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent                              # 简历作品集投递/
OUT = ROOT / 'dist' / 'assets' / 'work'
SRC = ROOT / 'sources'
EXP = REPO / '04-shared' / 'output' / 'portfolio' / 'assets'      # output/ moved to 04-shared/ on 2026-10-20
V2 = REPO / '04-shared' / 'output' / 'portfolio' / 'v2' / 'assets'

# name -> (source path, max width, quality)
JOBS = {
    # identity
    'tobie/avatar': (SRC / 'tobie-avatar.png', 500, 90),
    # Qingju — 2021
    'qingju/cover': (SRC / 'qingju-cover.png', 1920, 82),
    'qingju/research': (V2 / 'qingju-research.png', 1920, 82),
    'qingju/journey': (V2 / 'qingju-journey.png', 1920, 84),
    'qingju/field': (V2 / 'qingju-field.png', 1920, 82),
    'qingju/team-route': (V2 / 'qingju-final.png', 1200, 84),
    'qingju/team-memory': (SRC / 'work' / 'qingju' / 'team-memory@2x.png', 800, 86),   # 2 倍原稿，见 docs/sources.md 2026-11-15
    'qingju/lofi-board': (SRC / 'work' / 'qingju-lofi-board-raw.png', 2400, 80),
    # PlayBook — 2023–24
    'playbook/studio-editor': (EXP / 'studio-editor.png', 2400, 84),
    'playbook/studio-campaign': (EXP / 'studio-campaign.png', 1464, 84),
    'playbook/app-craft-missing': (EXP / 'app-craft-insufficient.png', 780, 86),
    'playbook/app-craft-ready': (EXP / 'app-craft-ready.png', 780, 86),
    'playbook/app-craft-confirm': (EXP / 'app-craft-confirm.png', 780, 86),
    # live demos: still frames from the original Studio recordings (tools/extract_playbook_frames.py)
    'playbook/live-recipe-00': (SRC / 'work' / 'playbook-live' / 'recipe-00.png', 1440, 76),
    'playbook/live-recipe-01': (SRC / 'work' / 'playbook-live' / 'recipe-01.png', 1440, 76),
    'playbook/live-recipe-02': (SRC / 'work' / 'playbook-live' / 'recipe-02.png', 1440, 76),
    'playbook/live-recipe-03': (SRC / 'work' / 'playbook-live' / 'recipe-03.png', 1440, 76),
    'playbook/live-recipe-04': (SRC / 'work' / 'playbook-live' / 'recipe-04.png', 1440, 76),
    'playbook/live-recipe-05': (SRC / 'work' / 'playbook-live' / 'recipe-05.png', 1440, 76),
    'playbook/live-recipe-06': (SRC / 'work' / 'playbook-live' / 'recipe-06.png', 1440, 76),
    'playbook/live-recipe-07': (SRC / 'work' / 'playbook-live' / 'recipe-07.png', 1440, 76),
    'playbook/live-recipe-08': (SRC / 'work' / 'playbook-live' / 'recipe-08.png', 1440, 76),
    'playbook/live-recipe-09': (SRC / 'work' / 'playbook-live' / 'recipe-09.png', 1440, 76),
    'playbook/live-recipe-10': (SRC / 'work' / 'playbook-live' / 'recipe-10.png', 1440, 76),
    'playbook/live-recipe-11': (SRC / 'work' / 'playbook-live' / 'recipe-11.png', 1440, 76),
    'playbook/live-recipe-12': (SRC / 'work' / 'playbook-live' / 'recipe-12.png', 1440, 76),
    'playbook/live-recipe-13': (SRC / 'work' / 'playbook-live' / 'recipe-13.png', 1440, 76),
    'playbook/live-recipe-14': (SRC / 'work' / 'playbook-live' / 'recipe-14.png', 1440, 76),
    'playbook/live-items-00': (SRC / 'work' / 'playbook-live' / 'items-00.png', 1440, 76),
    'playbook/live-items-01': (SRC / 'work' / 'playbook-live' / 'items-01.png', 1440, 76),
    'playbook/live-items-02': (SRC / 'work' / 'playbook-live' / 'items-02.png', 1440, 76),
    'playbook/live-items-03': (SRC / 'work' / 'playbook-live' / 'items-03.png', 1440, 76),
    'playbook/live-comments-00': (SRC / 'work' / 'playbook-live' / 'comments-00.png', 1440, 76),
    'playbook/live-comments-01': (SRC / 'work' / 'playbook-live' / 'comments-01.png', 1440, 76),
    'playbook/live-comments-02': (SRC / 'work' / 'playbook-live' / 'comments-02.png', 1440, 76),
    'playbook/live-comments-03': (SRC / 'work' / 'playbook-live' / 'comments-03.png', 1440, 76),
    # 2026-11-16：重做的三个演示用到的小部件，裁自上面的画面（tools/extract_playbook_parts.py）
    'playbook/live-recipe-icons': (SRC / 'work' / 'playbook-live' / 'parts' / 'recipe-icons.png', 768, 90),
    'playbook/live-items-nodes': (SRC / 'work' / 'playbook-live' / 'parts' / 'items-nodes.png', 924, 90),
    'playbook/app-home': (SRC / 'work' / 'playbook' / 'app-home@2x.png', 780, 88),   # 2 倍原稿，见 docs/sources.md 2026-11-15
    'playbook/app-inventory': (EXP / 'app-inventory.png', 390, 88),
    'playbook/app-reward': (EXP / 'app-reward.png', 330, 88),
    'playbook/app-missions': (V2 / 'app-missions.png', 390, 88),
    'playbook/app-owned': (V2 / 'app-owned.png', 390, 88),
    'playbook/app-unowned': (V2 / 'app-unowned.png', 390, 88),
    'playbook/app-search': (V2 / 'app-search.png', 390, 88),
    'playbook/app-search-creators': (V2 / 'app-search-creators.png', 390, 88),
    'playbook/cauldron-list': (V2 / 'cauldron-list.png', 390, 88),
    'playbook/early-ui': (V2 / 'pb-initial.png', 390, 88),
    'playbook/team-home': (V2 / 'pb-finished-home.png', 390, 86),
    'playbook/team-inventory': (V2 / 'pb-finished-inventory.png', 390, 86),
    'playbook/team-search': (V2 / 'pb-finished-search.png', 390, 86),
    'playbook/team-profile': (V2 / 'pb-finished-profile.png', 390, 86),
    'playbook/team-mission': (V2 / 'pb-finished-mission.png', 390, 86),
    # Industrial Securities SMT — 2022–23
    'smt/overview': (EXP / 'smt-overview.png', 1920, 86),
    'smt/states': (EXP / 'smt-states.png', 1944, 88),
    'smt/trade-components': (EXP / 'smt-trade-components.png', 1797, 86),
    'smt/buy': (V2 / 'smt-buy.png', 153, 92),
    'smt/sell': (V2 / 'smt-sell.png', 263, 92),
    # The Commons Fridge — 2026
    'fridge/photo-fridge': (EXP / 'fridge-p1-0.jpg', 2000, 78),
    'fridge/photo-touch': (EXP / 'fridge-p18-1.jpg', 1400, 78),
    'fridge/research': (V2 / 'cf-research.png', 2280, 84),
    'fridge/cf-home': (V2 / 'cf-home.png', 480, 88),
    'fridge/cf-add': (V2 / 'cf-add.png', 480, 88),
    'fridge/cf-house': (V2 / 'cf-house-clean.png', 480, 86),
    'fridge/cf-found': (V2 / 'cf-found-clean.png', 480, 88),
    'fridge/cf-shop': (V2 / 'cf-shop.png', 480, 88),
    'fridge/penguin-duo': (V2 / 'penguin-duo.png', 1200, 86),
    'fridge/penguin-add': (V2 / 'penguin-add.png', 240, 92),
    'fridge/penguin-manage': (V2 / 'penguin-manage.png', 240, 92),
    'fridge/penguin-received': (V2 / 'penguin-received.png', 240, 92),
    'fridge/penguin-found': (V2 / 'penguin-found.png', 240, 92),
    'fridge/penguin-motion': (V2 / 'penguin-motion.png', 985, 88),
    # 2026-11-15：最终提交稿（23 页横版 PDF）里的八页，裁掉页脚和四周空白，见 docs/sources.md
    'fridge/sub-chain': (SRC / 'work' / 'fridge' / 'sub-L02-chain.png', 2000, 86),
    'fridge/sub-personas': (SRC / 'work' / 'fridge' / 'sub-L04-personas.png', 2000, 86),
    'fridge/sub-curves': (SRC / 'work' / 'fridge' / 'sub-L08-curves.png', 2000, 86),
    'fridge/sub-failures': (SRC / 'work' / 'fridge' / 'sub-L09-failures.png', 2000, 86),
    'fridge/sub-failure-to-feature': (SRC / 'work' / 'fridge' / 'sub-L10-failure-to-feature.png', 2000, 86),
    'fridge/sub-refusals': (SRC / 'work' / 'fridge' / 'sub-L15-refusals.png', 2000, 86),
    'fridge/sub-rounds': (SRC / 'work' / 'fridge' / 'sub-L16-rounds.png', 2000, 86),
    'fridge/sub-test-not-run': (SRC / 'work' / 'fridge' / 'sub-L19-test-not-run.png', 2000, 86),
}
for n in range(5):
    JOBS[f'fridge/submission-{n}'] = (EXP / f'fridge-p22-{n}.jpg', 800, 82)
for r in range(3):
    for c in range(7):
        JOBS[f'qingju/lofi-r{r}c{c}'] = (SRC / 'work' / 'qingju-screens' / f'r{r}c{c}.png', 400, 88)


# name -> (left, top, right, bottom) in source pixels. For Figma exports that were not clipped to
# their frame: the export keeps a grey margin and lets overflowing layers hang outside the frame.
CROP = {
    'playbook/studio-campaign': (20, 20, 1460, 830),   # the 1440×810 Studio frame (2026-11-16)
}


def export(name, src, max_w, quality):
    im = Image.open(src)
    if name in CROP:
        im = im.crop(CROP[name])
    im = im.convert('RGBA') if im.mode in ('RGBA', 'LA', 'P') else im.convert('RGB')
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    dest = OUT / f'{name}.webp'
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, 'WEBP', quality=quality, method=6)
    return im.width, im.height


def face():
    im = Image.open(SRC / 'tobie-avatar.png').convert('RGB')
    w, h = im.size
    box = (int(w * .30), int(h * .12), int(w * .70), int(h * .52))
    crop = im.crop(box).resize((160, 160), Image.LANCZOS)
    dest = OUT / 'tobie' / 'face.webp'
    crop.save(dest, 'WEBP', quality=90, method=6)
    return crop.size


if __name__ == '__main__':
    import sys
    only = sys.argv[1:]          # 只重导指定的几张：python3 tools/prepare_assets.py playbook/app-home qingju/team-memory
    path = OUT / 'manifest.json'
    if only:
        unknown = [n for n in only if n not in JOBS]
        if unknown:
            sys.exit(f'JOBS 里没有：{", ".join(unknown)}')
        manifest = json.loads(path.read_text(encoding='utf-8'))
        for name in only:
            src, max_w, q = JOBS[name]
            manifest[name] = export(name, src, max_w, q)
            print(f'{name}: {manifest[name][0]} × {manifest[name][1]}')
    else:
        manifest = {}
        for name, (src, max_w, q) in JOBS.items():
            manifest[name] = export(name, src, max_w, q)
        manifest['tobie/face'] = face()
    path.write_text(json.dumps(manifest, indent=1, sort_keys=True), encoding='utf-8', newline='\n')
    total = sum(p.stat().st_size for p in OUT.rglob('*.webp'))
    print(f'{len(manifest)} assets, {total/1e6:.1f} MB')
