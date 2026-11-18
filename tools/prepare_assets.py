"""Export the original project screens used by the website.

Every file written here is a resized copy of an original source screen,
photo or recording poster. Nothing is redrawn. The only edits are:
  * resizing / WebP compression;
  * Qingju wireframes: individual screens cut from the lo-fi board and the
    board's teal flow arrows removed (sources/work/clean_qingju_lines.py);
  * tobie/face.webp: a circular crop of the existing avatar illustration.
  * gen/*: cover decorations generated with Figma AI on 2026-11-18 (card 20261118-013).
    They are not project work, only backdrops/icons on the home covers. qj-bike-chest is
    cut from the clay render by tools/cut_gen_clay.py.

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
    'qingju/research': (SRC / 'work' / 'qingju' / 'research-2021.png', 1920, 82),
    'qingju/journey': (SRC / 'work' / 'qingju' / 'journey-2021.png', 1920, 84),
    'qingju/field': (SRC / 'work' / 'qingju' / 'field-2021.png', 1920, 82),
    'qingju/team-route': (SRC / 'work' / 'qingju' / 'team-route-2021.png', 1200, 84),   # 2026-11-18 卡 20261118-003：上方白底换成 #F6F8F6，见 docs/sources.md
    'qingju/team-memory': (SRC / 'work' / 'qingju' / 'team-memory@2x.png', 800, 86),   # 2 倍原稿，见 docs/sources.md 2026-11-15
    'qingju/lofi-board': (SRC / 'work' / 'qingju-lofi-board-raw.png', 2400, 80),
    # 2026-11-16：07 节「2026 复盘」的两张图，中英文各一张（03-qingju/portfolio/figures/，2800 宽；正文栏 936，导出 2 倍），见 docs/sources.md
    'qingju/retro-metric-tree-zh': (SRC / 'work' / 'qingju' / 'retro-metric-tree-zh.png', 1920, 86),
    'qingju/retro-metric-tree-en': (SRC / 'work' / 'qingju' / 'retro-metric-tree-en.png', 1920, 86),
    'qingju/retro-experiment-zh': (SRC / 'work' / 'qingju' / 'retro-experiment-zh.png', 1920, 86),
    'qingju/retro-experiment-en': (SRC / 'work' / 'qingju' / 'retro-experiment-en.png', 1920, 86),
    # 2026-11-16 夜：01、04 节的三张 2021 原稿配图（交接单 2g；03-qingju/portfolio/figures/，只缩放压缩，不裁切），见 docs/sources.md
    'qingju/growth-system-2021': (SRC / 'work' / 'qingju' / 'growth-system-2021.png', 1920, 86),
    'qingju/active-user-stages-2021': (SRC / 'work' / 'qingju' / 'active-user-stages-2021.png', 1920, 86),
    'qingju/user-flow-2021': (SRC / 'work' / 'qingju' / 'user-flow-2021.png', 1920, 86),
    # 2026-11-17：06 节新增的团队高保真（卡 20261117-021，交接单 3c），见 docs/sources.md
    'qingju/team-treasure-map': (SRC / 'work' / 'qingju' / 'team-treasure-map-2021.png', 1120, 86),
    'qingju/team-vault': (SRC / 'work' / 'qingju' / 'team-vault-2021.png', 1920, 86),
    'qingju/team-publish': (SRC / 'work' / 'qingju' / 'team-publish-2021.png', 800, 86),
    'qingju/team-merge': (SRC / 'work' / 'qingju' / 'team-merge-2021.png', 800, 86),
    'qingju/team-memory-list': (SRC / 'work' / 'qingju' / 'team-memory-list-2021.png', 800, 86),
    # PlayBook — 2023–24
    'playbook/studio-editor': (EXP / 'studio-editor.png', 2400, 84),
    'playbook/studio-campaign': (EXP / 'studio-campaign.png', 1464, 84),
    # cover: team high-fidelity screens cut from the 2021 showcase page (Figma lfqzkEzhH33yq5kvIkNEqW 2206:20841), 2026-11-16
    'qingju/hifi-map': (SRC / 'work' / 'qingju-hifi' / 'map.png', 800, 86),
    'qingju/hifi-route': (SRC / 'work' / 'qingju-hifi' / 'route.png', 795, 86),
    'qingju/hifi-chests': (SRC / 'work' / 'qingju-hifi' / 'chests.png', 890, 88),
    # cover pieces (2026-11-17, card 20261117-020; reused 2026-11-18 for card 20261118-013): single screens cut from the
    # same two exports (see CROP), and the three chests with the page background removed by tools/cut_qingju_chests.py
    'qingju/hifi-phone-map': (SRC / 'work' / 'qingju-hifi' / 'map.png', 800, 90),
    'qingju/hifi-phone-food': (SRC / 'work' / 'qingju-hifi' / 'map.png', 800, 90),
    'qingju/hifi-phone-discussion': (SRC / 'work' / 'qingju-hifi' / 'route.png', 800, 90),
    # 封面装饰（Figma AI 生成，2026-11-18 卡 20261118-013 选 A、-017 SMT 改 S1）——不是项目成果
    'gen/smt-icon-window': (SRC / 'work' / 'gen' / 'smt-icon-window.png', 900, 84),
    'gen/cf-door': (SRC / 'work' / 'gen' / 'cf-door.png', 1200, 84),
    'gen/qj-map': (SRC / 'work' / 'gen' / 'qj-map.png', 1200, 84),
    'gen/qj-bike-chest': (SRC / 'work' / 'gen' / 'qj-bike-chest.png', 900, 88),
    'qingju/hifi-chests-cut': (SRC / 'work' / 'qingju-hifi' / 'chests-cut.png', 890, 92),
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
    # 2026-11-16：用户动线前后对比图，中英文各一张（02-playbook/portfolio/figures/，2800×2980；正文栏 936，导出 2 倍），见 docs/sources.md
    'playbook/flow-before-after-zh': (SRC / 'work' / 'playbook' / 'flow-before-after-zh.png', 1920, 86),
    'playbook/flow-before-after-en': (SRC / 'work' / 'playbook' / 'flow-before-after-en.png', 1920, 86),
    'playbook/app-inventory': (EXP / 'app-inventory.png', 390, 88),
    'playbook/app-reward': (SRC / 'work' / 'playbook' / 'app-reward@2x.png', 660, 88),   # 2026-11-16 换成 2 倍图（原来是 EXP 里 330 宽的那张）；页面上显示宽度仍不超过 330
    # 2026-11-16 第三批：02-playbook/portfolio/figures/ 里 2026-11-16 从 Figma 导出后切出来的图，只切、没改内容，见 docs/sources.md
    'playbook/feature-map': (SRC / 'work' / 'playbook' / 'feature-map-2024.png', 1920, 86),   # 2026-11-17 起页面不再引用（换成下面两张重画版），留着只为整批重导时不出错
    # 2026-11-17：功能架构图重画版，内容照 2024 年那张，只换呈现方式；中英文各一张（2800×1944，导出 2 倍），见 docs/sources.md
    'playbook/feature-map-zh': (SRC / 'work' / 'playbook' / 'feature-map-zh.png', 1920, 86),
    'playbook/feature-map-en': (SRC / 'work' / 'playbook' / 'feature-map-en.png', 1920, 86),
    'playbook/app-furnace-draft': (SRC / 'work' / 'playbook' / 'app-furnace-draft@2x.png', 780, 88),
    'playbook/app-home-events-only': (SRC / 'work' / 'playbook' / 'app-home-events-only@2x.png', 780, 88),
    'playbook/app-showcase-empty': (SRC / 'work' / 'playbook' / 'app-showcase-empty@2x.png', 780, 88),
    'playbook/app-showcase-pick': (SRC / 'work' / 'playbook' / 'app-showcase-pick@2x.png', 780, 88),
    'playbook/app-showcase-filled': (SRC / 'work' / 'playbook' / 'app-showcase-filled@2x.png', 780, 88),
    'playbook/app-showcase-visitor': (SRC / 'work' / 'playbook' / 'app-showcase-visitor@2x.png', 780, 88),
    'playbook/app-market-home': (SRC / 'work' / 'playbook' / 'app-market-home.png', 390, 88),            # 交易和以物换物八张是 1 倍图，2 倍图以后再换
    'playbook/app-market-listings': (SRC / 'work' / 'playbook' / 'app-market-listings.png', 390, 88),
    'playbook/app-market-trend': (SRC / 'work' / 'playbook' / 'app-market-trend.png', 390, 88),
    'playbook/app-market-buy-confirm': (SRC / 'work' / 'playbook' / 'app-market-buy-confirm.png', 390, 88),
    'playbook/app-barter-market': (SRC / 'work' / 'playbook' / 'app-barter-market.png', 390, 88),
    'playbook/app-barter-request': (SRC / 'work' / 'playbook' / 'app-barter-request.png', 390, 88),
    'playbook/app-barter-consume': (SRC / 'work' / 'playbook' / 'app-barter-consume.png', 390, 88),
    'playbook/app-barter-received': (SRC / 'work' / 'playbook' / 'app-barter-received.png', 390, 88),
    # 2026-11-17（卡 20261115-031、20261117-011）：新 09 节「二创与联名 / Remix」五张 Studio 定稿，2880 宽的 2 倍图，
    # 设置照 playbook/studio-editor（最大宽 2400，质量 84），只缩放压缩，不裁切。来源见 docs/sources.md
    'playbook/studio-remix-fan-challenges': (SRC / 'work' / 'playbook' / 'studio-remix-fan-challenges@2x.png', 2400, 84),
    'playbook/studio-remix-new-challenge': (SRC / 'work' / 'playbook' / 'studio-remix-new-challenge@2x.png', 2400, 84),
    'playbook/studio-remix-challenge-page': (SRC / 'work' / 'playbook' / 'studio-remix-challenge-page@2x.png', 2400, 84),
    'playbook/studio-remix-submission-detail': (SRC / 'work' / 'playbook' / 'studio-remix-submission-detail@2x.png', 2400, 84),
    'playbook/studio-remix-creator-collab': (SRC / 'work' / 'playbook' / 'studio-remix-creator-collab@2x.png', 2400, 84),
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
    # 2026-11-16：夜间版 Figma 原稿导出的 8 张（1 倍，最大宽 = 原图宽，不放大）。整页 5 张用的是打过码的版本（文件名带 -masked），见 docs/sources.md
    'smt/credit-order-panel': (SRC / 'work' / 'smt' / 'night-credit-order-panel-683-24828.png', 1840, 88),
    'smt/level-variants': (SRC / 'work' / 'smt' / 'night-level-variants-517-54278.png', 1510, 88),
    'smt/market-components': (SRC / 'work' / 'smt' / 'night-market-components-2492-69029.png', 3309, 86),   # 整张，不裁
    'smt/screen-asset-home': (SRC / 'work' / 'smt' / 'night-asset-home-0-1110-masked.png', 1920, 88),
    'smt/screen-main-menu': (SRC / 'work' / 'smt' / 'night-asset-home-menu-213-5799-masked.png', 1920, 88),
    'smt/screen-quick-order': (SRC / 'work' / 'smt' / 'night-quick-order-656-24252-masked.png', 1920, 88),
    'smt/screen-basket-order': (SRC / 'work' / 'smt' / 'night-basket-order-1759-63399-masked.png', 1920, 88),
    'smt/screen-grid-strategy': (SRC / 'work' / 'smt' / 'night-grid-strategy-1727-54810-masked.png', 1920, 88),
    # 2026-11-17（卡 20261117-013）：06 节「适老化方案」，大通证券关怀版 12 张手机界面。2 倍图，取自 04-shared/大通适老化-裁图-2026-11-17/打码/，
    # 最大宽 = 原图宽（首页 600，其余 750），不放大。来源见 docs/sources.md
    'smt/daton-home-care': (SRC / 'work' / 'smt' / 'daton-home-care.png', 600, 88),
    'smt/daton-home-standard': (SRC / 'work' / 'smt' / 'daton-home-standard.png', 600, 88),
    'smt/daton-buy-care': (SRC / 'work' / 'smt' / 'daton-buy-care.png', 750, 88),
    'smt/daton-buy-standard': (SRC / 'work' / 'smt' / 'daton-buy-standard.png', 750, 88),
    'smt/daton-order-limit': (SRC / 'work' / 'smt' / 'daton-order-limit.png', 750, 88),
    'smt/daton-order-market': (SRC / 'work' / 'smt' / 'daton-order-market.png', 750, 88),
    'smt/daton-order-star-market': (SRC / 'work' / 'smt' / 'daton-order-star-market.png', 750, 88),
    'smt/daton-holdings-care': (SRC / 'work' / 'smt' / 'daton-holdings-care.png', 750, 88),
    'smt/daton-holdings-care-sheet': (SRC / 'work' / 'smt' / 'daton-holdings-care-sheet.png', 750, 88),
    'smt/daton-holdings-standard': (SRC / 'work' / 'smt' / 'daton-holdings-standard.png', 750, 88),
    'smt/daton-repay-care': (SRC / 'work' / 'smt' / 'daton-repay-care.png', 750, 88),
    'smt/daton-repay-standard': (SRC / 'work' / 'smt' / 'daton-repay-standard.png', 750, 88),
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
    # Agent Matrix — 2026。2026-11-17：四张图，中英文各一张（05-agent-matrix/portfolio/figures/，1800 宽，由 figures/src/build.mjs 生成；
    # 本人在卡 20261115-001 第 3 版通过）。只压缩成 WebP，不缩放不裁切，见 docs/sources.md
    'agent-matrix/fig-agents-zh': (SRC / 'work' / 'agent-matrix' / 'fig-agents-zh.png', 1800, 88),
    'agent-matrix/fig-agents-en': (SRC / 'work' / 'agent-matrix' / 'fig-agents-en.png', 1800, 88),
    'agent-matrix/fig-sequence-zh': (SRC / 'work' / 'agent-matrix' / 'fig-sequence-zh.png', 1800, 88),
    'agent-matrix/fig-sequence-en': (SRC / 'work' / 'agent-matrix' / 'fig-sequence-en.png', 1800, 88),
    'agent-matrix/fig-who-waits-zh': (SRC / 'work' / 'agent-matrix' / 'fig-who-waits-zh.png', 1800, 88),
    'agent-matrix/fig-who-waits-en': (SRC / 'work' / 'agent-matrix' / 'fig-who-waits-en.png', 1800, 88),
    'agent-matrix/fig-trust-zh': (SRC / 'work' / 'agent-matrix' / 'fig-trust-zh.png', 1800, 88),
    'agent-matrix/fig-trust-en': (SRC / 'work' / 'agent-matrix' / 'fig-trust-en.png', 1800, 88),
}
for n in range(5):
    JOBS[f'fridge/submission-{n}'] = (EXP / f'fridge-p22-{n}.jpg', 800, 82)
# 2026-11-18：PlayBook 11 节起草助手的 17 张物品图（交接单第 4 节 ⑥；02-playbook/portfolio/figures/items/，512×512 透明底，Codex 生成）。
# 文件名 = 草案 id + 物品 id（两个草案都有 sticker、badge）。宽 192（页面上显示 32–72 像素），保留透明，见 docs/sources.md
DRAFTER_ITEMS = {
    'halloween': ('candy', 'sticker', 'jack', 'hat', 'badge'),
    'move': ('box', 'sticker', 'key', 'stub', 'plate', 'badge'),
    'newsong': ('note', 'card', 'headphones', 'record', 'signed', 'gold'),
}
for draft, item_ids in DRAFTER_ITEMS.items():
    for item in item_ids:
        JOBS[f'playbook/drafter-items/{draft}-{item}'] = (SRC / 'work' / 'playbook' / 'drafter-items' / f'{draft}-{item}.png', 192, 88)
for r in range(3):
    for c in range(7):
        JOBS[f'qingju/lofi-r{r}c{c}'] = (SRC / 'work' / 'qingju-screens' / f'r{r}c{c}.png', 400, 88)


# name -> (left, top, right, bottom) in source pixels. For Figma exports that were not clipped to
# their frame: the export keeps a grey margin and lets overflowing layers hang outside the frame.
CROP = {
    'playbook/studio-campaign': (20, 20, 1460, 830),   # the 1440×810 Studio frame (2026-11-16)
    'qingju/hifi-phone-map': (33, 47, 433, 912),          # the front phone on the map crop (2026-11-17)
    'qingju/hifi-phone-food': (433, 101, 750, 857),       # what shows of the phone behind it: its left edge is hidden in the original
    'qingju/hifi-phone-discussion': (9, 42, 409, 905),    # the discussion phone on the route crop
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
