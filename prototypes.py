"""Interactive demos built from the ORIGINAL screens.

Rules (docs/design-system.md §5):
  1. A demo only shows screens and states that exist in the source files.
  2. Hotspots sit on the real controls; they never add behaviour the design
     did not specify. Where the source has no next screen, the demo says so.
  3. Notes are Tobie's annotations, visually separate from the product.
  4. Every demo carries a provenance line.
  5. The three PlayBook Studio demos rebuilt in code (STUDIO, rule 8) may be
     operated freely inside stated limits; they say they are rebuilt from the
     source (REBUILT, no year since 2026-11-25), take their interface from the
     source, and invent no data.
  6. The campaign drafting assistant (DRAFTER) is off the page since 2026-11-25
     (the owner asked for it; section_demo no longer routes to it). The code and
     its tests stay so it can come back. When it was on the page it was not a rebuild:
     it is a new design concept from 2026 and says so (CONCEPT). Its creators,
     items and campaigns are fictional and come from one JSON file in
     02-playbook, read at build time; the page makes no request for it.

Coordinates are in the pixel space of the exported screen (see manifest).
"""
import json
from functools import lru_cache
from html import escape
from pathlib import Path

def t(zh, en, lang): return zh if lang == 'zh' else en

def _json(data):
    return escape(json.dumps(data, ensure_ascii=False), quote=True)

# 2026-11-18 卡 20261118-021 本人「同意」（网站呈现交接单 8b 第 5 条）：「原始界面」「原始线框」这两种小标签不显示，
# 和 build.py 的 PROV_HIDDEN 同一条规矩；下面各处的数据照旧留着。其余小标签（重建、可运行、录屏等）照旧显示。
_PROV_HIDDEN = {'原始界面', 'Original screen', 'Original screens', '原始线框', 'Original wireframes'}
def _frame_label(name, prov, prov_class, project):
    tag = '' if prov in _PROV_HIDDEN else f'<span class="prov {prov_class}">{prov}</span>'
    return (f'<div class="frame-label" style="--project:var(--p-{project})"><span class="frame-label__name"><span>{name}</span></span>'
            f'{tag}</div>')

def _note(text, who):
    return (f'<div class="note proto__note" aria-live="polite"><span class="note__face" aria-hidden="true"></span>'
            f'<div><div class="note__who">{who}</div><p class="note__text" data-note>{text}</p></div></div>')


# --------------------------------------------------------------------------
# Screen-flow player (phone): PlayBook App crafting, Qingju lo-fi route
# --------------------------------------------------------------------------
FLOWS = {
 'playbook-craft': {
  'project': 'playbook',
  'size': [780, 1754],
  'title': ['合成前，先看清代价', 'See the cost before crafting'],
  'intro': ['这是 PlayBook App 合成流程的三个原始状态。点击界面上的真实按钮往下走；灰色按钮在原稿中不可用，这里也不可用。',
            'These are the three original states of the PlayBook App crafting flow. Tap the real controls to move on; a control that is disabled in the source stays disabled here.'],
  'label': ['PlayBook App · 合成 Cookie Cutter', 'PlayBook App · Crafting “Cookie Cutter”'],
  'prov': ['原始界面', 'Original screens'],
  'provenance': ['界面来自 2023–24 PlayBook App 原稿，交互流程与状态是我的 UX。',
                 'Screens from the 2023–24 PlayBook App source file; the flow and states are my UX.'],
  'start': 'missing',
  # Collecting materials is not designed in the source, so "ready" is entered
  # from the step rail rather than from a control inside the screen.
  'rail_entry': ['ready'],
  'screens': {
   'missing': {'src': '/assets/work/playbook/app-craft-missing.webp',
     'step': ['材料不足', 'Materials missing'],
     'alt': ['Cookie Cutter 配方页：三项输入呈灰色，底部 Craft 按钮不可用', 'Cookie Cutter recipe: three inputs are greyed out and the Craft button is disabled'],
     'note': ['三项输入是灰色的——背包里数量不够。Craft 按钮保持不可用，而不是点了之后再报错。',
              'Three inputs are greyed out — there are not enough of them in the inventory. Craft stays disabled instead of failing after the tap.'],
     'next': ['试试点灰色的输入或 Craft，再用左侧步骤切到“材料齐全”。', 'Try the grey inputs or Craft, then use the steps to jump to “Requirements met”.'],
     'hotspots': [
       {'box': [244, 978, 125, 124], 'label': ['缺少的输入', 'Missing input'], 'note': ['这一项在原稿中是灰色边框：数量不足。缺什么，在承诺之前就能看见。', 'This tile has a grey border in the source: not enough in the inventory. What is missing is visible before any commitment.']},
       {'box': [411, 978, 125, 124], 'label': ['缺少的输入', 'Missing input'], 'note': ['第二项同样不足。三项缺口一起呈现，而不是逐个报错。', 'The second tile is short as well. All three gaps are shown together, not as errors one at a time.']},
       {'box': [580, 978, 125, 124], 'label': ['缺少的输入', 'Missing input'], 'note': ['第三项不足。输出区也保持灰色，暗示“现在还得不到”。', 'The third tile is short too. The outputs stay grey as well, signalling that nothing can be received yet.']},
       {'box': [34, 1622, 714, 100], 'label': ['Craft（不可用）', 'Craft (disabled)'], 'note': ['原稿里这个按钮是不可用状态。原型保持一致：点击不会前进。', 'In the source this button is disabled. The prototype keeps it that way: tapping it does not advance.']},
     ]},
   'ready': {'src': '/assets/work/playbook/app-craft-ready.webp',
     'step': ['材料齐全', 'Requirements met'],
     'alt': ['Cookie Cutter 配方页：八项输入均为黄色边框，Craft 按钮变为紫色可用', 'Cookie Cutter recipe: all eight inputs have yellow borders and the Craft button is purple and enabled'],
     'note': ['八项输入都亮起黄色边框，第一个输出被标出，紫色 Craft 可用。状态变化没有移动任何位置。',
              'All eight inputs light up, the first output is highlighted and the purple Craft button is enabled. Nothing moved position between states.'],
     'next': ['点击紫色的 Craft。', 'Tap the purple Craft button.'],
     'hotspots': [
       {'box': [36, 1630, 706, 100], 'go': 'confirm', 'label': ['Craft', 'Craft']},
     ]},
   'confirm': {'src': '/assets/work/playbook/app-craft-confirm.webp',
     'step': ['确认消耗', 'Review & confirm'],
     'alt': ['确认弹层“You will consume”列出将消耗的物品，按钮为 Cancel 与 Sure', 'Confirmation sheet “You will consume” lists the items to be spent, with Cancel and Sure buttons'],
     'note': ['“You will consume”在承诺那一刻列出所有代价。取消会回到上一步，材料不变。',
              '“You will consume” lists the full cost at the moment of commitment. Cancel returns to the previous state with nothing spent.'],
     'next': ['点 Cancel 返回，或点 Sure 完成。', 'Tap Cancel to go back, or Sure to finish.'],
     'hotspots': [
       {'box': [60, 1002, 326, 100], 'go': 'ready', 'label': ['Cancel', 'Cancel']},
       {'box': [406, 1002, 314, 100], 'go': '@end', 'label': ['Sure', 'Sure']},
       {'box': [191, 1112, 393, 42], 'label': ['No More Reminders Today', 'No More Reminders Today'], 'note': ['原稿在弹层里提供“今天不再提醒”，给频繁合成的用户一个出口。', 'The source sheet offers “No More Reminders Today” as an exit for people who craft often.']},
     ]},
  },
  'end': ['原稿的合成流程到这里为止——之后的界面没有设计，所以原型也在这里结束。', 'The source crafting flow ends here — no later screen was designed, so the prototype ends here too.'],
 },
 'qingju-route': {
  'project': 'qingju',
  'size': [400, 867],
  'title': ['沿着一条路线走完', 'Follow one route through the concept'],
  'intro': ['2021 年我的低保真原稿，按原板上的连线顺序串起来。点击界面里的真实按钮前进。',
            'My 2021 low-fidelity screens, linked in the order drawn on the original board. Tap the real buttons in the screens to move on.'],
  'label': ['青桔 · 低保真主流程', 'Qingju · low-fidelity main flow'],
  'prov': ['原始线框', 'Original wireframes'],
  'provenance': ['线框来自我 2021 年的低保真原型板；中文为原稿界面语言。',
                 'Screens from my 2021 low-fidelity board. The interface language is Chinese, as in the source.'],
  'start': 'discover',
  'screens': {
   'discover': {'src': '/assets/work/qingju/lofi-r0c0.webp', 'step': ['发现路线', 'Discover a route'],
     'alt': ['地图首页，“美景”筛选下的推荐路线标记', 'Map home with the “scenery” filter and a highlighted route marker'],
     'note': ['地图先按“想看什么”筛选（美景）。高亮的圆点是一条推荐路线，而不是一辆车。', 'The map is first filtered by what you want to see (美景, scenery). The highlighted dot is a suggested route, not a bike.'],
     'next': ['点击地图上的绿色路线标记。', 'Tap the green route marker on the map.'],
     'hotspots': [{'box': [248, 211, 78, 78], 'go': 'preview', 'label': ['路线标记', 'Route marker']}]},
   'preview': {'src': '/assets/work/qingju/lofi-r0c1.webp', 'step': ['预览路线', 'Preview the route'],
     'alt': ['底部路线卡片“秋日午后休闲”与“去骑车”按钮', 'Route card “Autumn afternoon ride” with a “Go ride” button'],
     'note': ['卡片只给出做决定需要的：路线名、骑过的人数、沿途风景。', 'The card gives only what a decision needs: the route name, how many people rode it and the scenic stops.'],
     'next': ['点卡片看详情，或直接“去骑车”。', 'Tap the card for detail, or go straight to “去骑车”.'],
     'hotspots': [{'box': [0, 632, 400, 128], 'go': 'detail', 'label': ['路线卡片', 'Route card']},
                  {'box': [130, 777, 255, 44], 'go': 'ride', 'label': ['去骑车', 'Go ride']}]},
   'detail': {'src': '/assets/work/qingju/lofi-r0c2.webp', 'step': ['查看详情', 'Read the detail'],
     'alt': ['路线详情：总路程、平均时长、图片与其他骑行者的感受', 'Route detail: distance, average time, photos and other riders’ notes'],
     'note': ['路程、时长、照片和别人的感受放在同一页——在陌生的地方，比较地图最费时间。', 'Distance, time, photos and other riders’ notes sit on one page — in an unfamiliar place, comparing maps is what takes the time.'],
     'next': ['点击“去骑车”。', 'Tap “去骑车” (go ride).'],
     'hotspots': [{'box': [126, 778, 255, 44], 'go': 'ride', 'label': ['去骑车', 'Go ride']}]},
   'ride': {'src': '/assets/work/qingju/lofi-r0c3.webp', 'step': ['骑行中', 'Riding'],
     'alt': ['骑行中：正在向宝藏路线骑行，已骑行 10 分钟 1.1 公里', 'Riding: heading along the treasure route, 10 min and 1.1 km so far'],
     'note': ['骑行中只保留一条进度，奖励不打断骑车本身。', 'While riding, only one progress line stays on screen; the reward does not interrupt the ride.'],
     'next': ['点击“去还车”。', 'Tap “去还车” (return the bike).'],
     'hotspots': [{'box': [130, 777, 255, 44], 'go': 'reward', 'label': ['去还车', 'Return the bike']}]},
   'reward': {'src': '/assets/work/qingju/lofi-r0c4.webp', 'step': ['获得奖励', 'Reward'],
     'alt': ['弹窗：成功获得 15 金币', 'Pop-up: 15 coins earned'],
     'note': ['还车之后才揭晓金币：奖励跟随骑行，而不是反过来。', 'Coins are revealed after the bike is returned: the reward follows the ride, not the other way round.'],
     'next': ['点击“确定”。', 'Tap “确定” (OK).'],
     'hotspots': [{'box': [143, 409, 108, 37], 'go': 'summary', 'label': ['确定', 'OK']}]},
   'summary': {'src': '/assets/work/qingju/lofi-r0c5.webp', 'step': ['结束骑行', 'End of ride'],
     'alt': ['结束页：费用 1.5 元、金币 +15、车辆是否干净，以及“发布感受”', 'End screen: fare, +15 coins, a bike-condition question and “Publish a note”'],
     'note': ['费用、金币和一个车辆状况的小问题放在一起；写感受是可选的，不是必经步骤。', 'Fare, coins and a quick bike-condition question sit together; writing a note is optional, not a required step.'],
     'next': ['点击“发布感受”。', 'Tap “发布感受” (publish a note).'],
     'hotspots': [{'box': [204, 777, 124, 44], 'go': 'write', 'label': ['发布感受', 'Publish a note']}]},
   'write': {'src': '/assets/work/qingju/lofi-r0c6.webp', 'step': ['写下感受', 'Write a note'],
     'alt': ['发布感受：路线、总长与时长已自动带入', 'Write a note: route, distance and time are attached automatically'],
     'note': ['路线、路程和时长自动带入，骑行者只补充文字和照片。', 'Route, distance and time are attached automatically; the rider only adds words and photos.'],
     'next': ['点击右上角“发布”。', 'Tap “发布” (publish), top right.'],
     'hotspots': [{'box': [333, 54, 55, 29], 'go': 'published', 'label': ['发布', 'Publish']}]},
   'published': {'src': '/assets/work/qingju/lofi-r1c6.webp', 'step': ['发布完成', 'Published'],
     'alt': ['发布成功：这是你的第 294 次骑行，并推荐下一张宝藏地图', 'Published: this was your 294th ride, with a suggested next treasure map'],
     'note': ['回忆卡片可以分享，页面底部顺势推荐下一张地图——形成“发现 → 骑行 → 记住”的循环。', 'The memory card can be shared, and the page suggests the next map — closing the discover → ride → remember loop.'],
     'next': ['主流程到此结束。', 'The main flow ends here.'],
     'hotspots': []},
  },
  'end': None,
 },
}

# --------------------------------------------------------------------------
# PlayBook Studio: three interactions rebuilt in code (2026-11-16)
#
# The first version (2026-11-15) cut the recordings into still frames and let a
# visitor step through them in a fixed order. Tobie rejected it on review card
# 20261115-057: it should not follow one fixed path, things should move back and
# forth freely, and a boundary is enough. So these three are real, small
# interfaces written in code:
#   * what you see is taken from the source: recording frames as the static
#     parts, icons cut from the same frames, panels and tiles redrawn to the
#     sizes and colours measured on them;
#   * what you can do is free inside stated limits (STUDIO[...]['limits']);
#   * nothing the source does not contain is made up: only two items have a
#     detail view, and the demo says so.
# Every demo says in its provenance line that it is rebuilt from the source (REBUILT).
# 2026-11-25（作品集理解成本优化方案 第 1 批，本人要求不写「2026 年用代码重做」）：去掉年份和「用代码重做」，只说按原稿还原。
# Engine: dist/prototype.js (recipeRules, recipeLab, itemsLab, commentLab).

LIVE_SIZE = [1440, 810]


def _live(clip, n):
    return f'/assets/work/playbook/live-{clip}-{n:02d}.webp'


REBUILT = ['按原稿和当年录屏还原，界面元素取自原稿',
           'Rebuilt from the source design and the recordings of the time; the interface elements are taken from the source']
REBUILT_TAG = ['按原稿还原 · 界面取自原稿', 'Rebuilt from the source · interface from the original']

# One recipe as plain data: what is required, what is optional, and the chain of output groups.
_HALF = {'require': ['crates', 'key'], 'optional': [],
         'groups': [{'items': [['gamepad', 100]]}, {'items': [['pink', 10], ['blue', 10]]}], 'joins': ['and']}
_FULL = {'require': ['crates', 'key'], 'optional': [],
         'groups': [{'items': [['gamepad', 100]]}, {'items': [['pink', 10], ['blue', 10], ['yellow', 10]], 'choose': True},
                    {'items': [['battery', 80], ['charge', 20]]}], 'joins': ['or', 'or']}

STUDIO = {
 'playbook-recipe': {
  'kind': 'recipe', 'anchor': 'try-recipe',
  'tab': ['配方编辑', 'Recipe editor'],
  'label': ['PlayBook Studio · 配方编辑', 'PlayBook Studio · Recipe editor'],
  'title': ['自己搭一条合成配方', 'Build a crafting recipe yourself'],
  # 2026-11-25（优化方案第 1 批）：侧边说明卡只留三条短提示，去掉 intro 和注释，视线还给画布
  'how': [['把物品拖进 Require / Optional / Output', 'Drag items into Require / Optional / Output'],
          ['点 And / Or 切换，点物品改概率', 'Click And / Or to switch; click an item to set its odds'],
          ['拖回左边就拿掉', 'Drag it back to the left to remove it']],
  'provenance': [REBUILT[0] + '（UX 与 UI 均为我的工作）。',
                 REBUILT[1] + ' (UX and UI are both my work).'],
  'still': [_live('recipe', 8), ['配方编辑器：Require 里有宝箱和钥匙，Output 里是手柄和两种颜料', 'Recipe editor: a crate and a key in Require; a gamepad and two paints in Output']],
  'frame': [1920, 1080],
  'chrome': _live('recipe', 3), 'icons': '/assets/work/playbook/live-recipe-icons.webp',
  'heading': 'Craft Recipes 3',
  # id, name in the library, name on an output tile, the probability the recording gives it, centre of its library icon
  'items': [('key', 'Key', 'Key', None, (101, 432)), ('crates', 'Crates', 'Crates', None, (274, 432)),
            ('charge', 'Super Charge', 'Super Charge', 20, (101, 611)), ('battery', 'Normal Battery', 'Battery', 80, (274, 611)),
            ('gamepad', 'Gamepad', 'Gamepad', 100, (101, 790)), ('pink', 'Pink Paint', 'Pink Paint', 10, (274, 790)),
            ('blue', 'Blue Paint', 'Blue Paint', 10, (101, 968)), ('yellow', 'Yellow Paint', 'Yellow Paint', 10, (274, 968))],
  'default_pct': 100,     # Key and Crates never reach Output in the recording, so there is no number to copy
  # the boundary: how much fits. Checked against `geo` in tests/test_prototypes.py
  'limits': {'require': 3, 'optional': 2, 'groups': 3, 'group': 3},
  # measured on the recording frames, in frame pixels; handed to the stylesheet as --names
  'geo': {'in-item': 92, 'in-gap': 30, 'require-h': 457, 'optional-h': 278, 'box-tab': 31,
          'tile-w': 116, 'tile-h': 158, 'tile-choose-h': 128, 'choose-h': 26,
          'pill-w': 60, 'pill-h': 31, 'pill-gap': 11, 'group-pad': 10, 'chain-gap': 36,
          'panel-h': 834, 'out-min': 264},
  'output_w': [264, 392, 592, 1000],    # width of the Output area with 0, 1, 2, 3 groups, as in the recording
  'condition_min': 177,                 # what is left of the Condition area when Output is widest
  'start': _HALF, 'sample': _FULL,
  't': {
    'lib_item': ['物品库：{name}', 'Library: {name}'],
    'in_item': ['{zone} 里的 {name}', '{name} in {zone}'],
    'out_item': ['Output 里的 {name}', '{name} in Output'],
    'join': ['{kind}，点一下切换', '{kind}; click to switch'],
    'choose_off': ['取消几选一', 'Turn off choose-one'],
    'tools': ['底部工具栏（这段录屏里没用到）', 'Bottom toolbar (not used in this recording)'],
    'upload': ['Upload（原稿之后没有下一屏）', 'Upload (the source has no next screen)'],
    'bar_idle': ['点一样物品：左边的可以放进来，放进去的可以改概率、调先后、拿掉。', 'Click an item: one on the left to place it, a placed one to change its probability, order, or remove it.'],
    'bar_lib': ['拿着 {name}，放到：', 'Holding {name}. Put it in:'],
    'bar_new': ['Output · 新的一组', 'Output · new group'],
    'bar_join': ['Output · 并进第 {n} 组', 'Output · into group {n}'],
    'bar_cancel': ['放下', 'Put down'],
    'bar_at': ['{name} · {zone}', '{name} · {zone}'],
    'bar_pct': ['概率', 'Probability'],
    'bar_less': ['概率减 5%', 'Probability down 5%'], 'bar_more': ['概率加 5%', 'Probability up 5%'],
    'bar_earlier': ['往前', 'Earlier'], 'bar_later': ['往后', 'Later'],
    'bar_to': ['移到 {zone}', 'Move to {zone}'],
    'bar_choose': ['这一组 {n} 选 1', 'Choose 1 out of {n}'],
    'bar_remove': ['拿掉', 'Remove'],
    'no_full': ['{zone} 最多放 {n} 样，已经满了。', '{zone} takes {n} items at most and is full.'],
    'no_dup': ['{name} 已经在这一边了，同一样不放两次。', '{name} is already on this side; the same item is not placed twice.'],
    'no_groups': ['Output 最多 {n} 组。可以并进已有的一组。', 'Output takes {n} groups at most. It can join an existing group.'],
    'no_groupfull': ['一组最多 {n} 样，这一组满了。', 'A group takes {n} items at most; this one is full.'],
    'no_nowhere': ['这里放不了，已经放回原处。物品只能进 Require、Optional 或 Output。', 'It cannot go there and is back where it was. Items only go into Require, Optional or Output.'],
    'no_edge': ['已经在最边上了。', 'It is already at the end.'],
    'said_put': ['{name} 放进了 {zone}。', '{name} is in {zone}.'],
    'said_moved': ['{name} 挪到了 {zone}。', '{name} moved to {zone}.'],
    'said_removed': ['{name} 拿掉了。', '{name} removed.'],
    'said_join': ['改成了 {kind}。', 'Now {kind}.'],
    'said_locked': ['「几选一」的一组里固定是 Or。先点组顶上那行字取消几选一。', 'Inside a choose-one group it is always Or. Click the line at the top of the group to turn choose-one off first.'],
    'said_choose_on': ['这一组变成 {n} 选 1：只给其中一样，不再各算概率。', 'This group is now choose 1 out of {n}: one of them is given, with no separate odds.'],
    'said_choose_off': ['取消了几选一，每样恢复自己的概率。', 'Choose-one is off; each item has its own probability again.'],
    'said_choose_need': ['一组里至少两样才能「几选一」。把另一样物品拖到这一组上。', 'A group needs at least two items for choose-one. Drag another item onto this group.'],
    'said_cond': ['条件栏在这段录屏里没用到，放不了物品。', 'The Condition area is not used in this recording and takes no items.'],
    'said_tools': ['底部工具栏在这段录屏里没用到，这里只照原样摆着。', 'The bottom toolbar is not used in this recording; it is only shown as it was.'],
    'said_upload': ['原稿里 Upload 之后没有下一屏，这里不会上传任何东西。', 'The source has no screen after Upload; nothing is uploaded here.'],
    'said_reset': ['回到开始的样子。', 'Back to the starting recipe.'],
    'said_clear': ['画布清空了。', 'The canvas is empty.'],
    'said_sample': ['摆成了录屏最后的那条配方。', 'Set to the recipe the recording ends on.'],
    'read': ['读作：', 'Reads as: '],
    'read_empty': ['画布是空的。从左边拖一样物品进来。', 'The canvas is empty. Drag an item in from the left.'],
    'read_in': ['交出 {list}', 'hand in {list}'], 'read_no_in': ['不用交东西', 'hand in nothing'],
    'read_opt': ['（可以再加 {list}）', ' (optionally {list})'],
    'read_out': ['，得到 {list}。', '; get {list}.'], 'read_no_out': ['，还没有产出。', '; no output yet.'],
    'read_and': [' 并且 ', ' and '], 'read_or': [' 或者 ', ' or '], 'read_sep': ['、', ', '],
    'read_choose': ['{list} 里选一样', 'one of {list}'], 'read_wrap': ['（{list}）', '({list})'],
    'reset': ['重来', 'Start over'], 'clear': ['清空画布', 'Clear the canvas'], 'sample': ['摆成录屏最后的样子', 'Set to the recording’s final recipe'],
    'big': ['放大操作', 'Enlarge'], 'small': ['退出放大', 'Exit enlarged view'],
  },
 },
 'playbook-items': {
  'kind': 'items', 'anchor': 'try-items',
  'tab': ['物品与关系网', 'Items and their web'],
  'label': ['PlayBook Studio · 物品与关系网', 'PlayBook Studio · Items and their relationship web'],
  'title': ['点开一件物品，看它连着什么', 'Open an item and see what it connects to'],
  'how': [['点纸鹤或红耳机，打开详情', 'Click the paper crane or the red headphones to open the detail'],
          ['拖关系网里的物品，连线跟着走', 'Drag items in the web; the lines follow'],
          ['点线那头的物品，走到它的详情', 'Click the item at the other end of a line to go to it']],
  'provenance': [REBUILT[0] + '（UX 与 UI 均为我的工作）。',
                 REBUILT[1] + ' (UX and UI are both my work).'],
  'still': [_live('items', 2), ['物品库和纸鹤的详情：三档价格和一张关系网', 'The item library with the paper crane’s detail: three price tiers and a relationship web']],
  'frame': [2880, 1620],
  'frames': {'closed': _live('items', 1), 'crane': _live('items', 2), 'phones': _live('items', 3)},
  'nodes_src': '/assets/work/playbook/live-items-nodes.webp',
  'sprites': ['phones', 'crane', 'gamepad', 'purple', 'cassette', 'rocket', 'cat'],      # order in the sprite sheet
  # the item grid: 34 items after the Create button; ten columns with the detail panel open, seventeen without
  'grid': {'count': 34, 'x0': 609, 'dx': 136, 'size': 122,
           'open': {'cols': 10, 'rows': [392, 526, 664, 792]}, 'closed': {'cols': 17, 'rows': [392, 526, 666]}},
  'detail': {'1': 'crane', '3': 'phones'},      # the only two items the source drew a detail view for
  'names': {'crane': ['纸鹤 Lofi Girl’s Paper Crane', 'Lofi Girl’s Paper Crane'], 'phones': ['红耳机 Lofi Girl’s Red Headphones', 'Lofi Girl’s Red Headphones']},
  'short': {'crane': ['纸鹤', 'Paper crane'], 'phones': ['红耳机', 'Red headphones']},
  'handle': {'open': [1886, 925, 44, 186], 'closed': [2836, 925, 44, 186]},
  'web': {'cover': [1925, 975, 955, 645], 'bg': '#FBFBFB', 'title': [1930, 950, 330, 62], 'title_src': 'phones',
          'bounds': [1995, 1090, 2810, 1566], 'node': 132, 'radius': 46, 'red': '#F4524D', 'blue': '#486CFF'},
  # a cursor left in two of the frames: covered with the page's own fill / with the same spot from the other frame
  'patches': {'closed': [{'box': [2030, 630, 130, 140], 'fill': '#FBFBFB'}], 'phones': [{'box': [1345, 590, 150, 150], 'from': 'crane'}]},
  'webs': {
    'crane': {'nodes': [['phones', 2082, 1248, 'phones'], ['crane', 2388, 1334, 'crane'], ['gamepad', 2686, 1424, None]],
              'edges': [['phones', 'crane', 'red', -0.12], ['crane', 'gamepad', 'blue', -0.12]]},
    'phones': {'nodes': [['purple', 2668, 1140, None], ['cassette', 2204, 1236, None], ['phones', 2458, 1364, 'phones'],
                         ['rocket', 2182, 1396, None], ['crane', 2760, 1450, 'crane'], ['cat', 2042, 1560, None]],
               'edges': [['cassette', 'phones', 'red', 0.18], ['rocket', 'phones', 'red', 0.12], ['cat', 'phones', 'red', 0.14],
                         ['phones', 'purple', 'blue', -0.25], ['phones', 'crane', 'blue', -0.12]]},
  },
  'node_names': {'phones': ['红耳机', 'Red headphones'], 'crane': ['纸鹤', 'Paper crane'], 'gamepad': ['黄色手柄', 'Yellow gamepad'], 'purple': ['紫色纸鹤', 'Purple paper crane'],
                 'cassette': ['磁带', 'Cassette'], 'rocket': ['火箭', 'Rocket'], 'cat': ['猫', 'Cat']},
  # narrow screens show one part of the page at a time
  'views': {'grid': [520, 300, 1400, 600], 'detail': [1880, 300, 1000, 1320]},
  't': {
    'item': ['物品库第 {n} 件', 'Library item {n}'],
    'item_none': ['物品库第 {n} 件（原稿没有画详情）', 'Library item {n} (no detail view in the source)'],
    'node': ['关系网里的{name}', '{name} in the web'],
    'handle_open': ['收起右边的详情', 'Fold the detail panel away'], 'handle_closed': ['展开右边的详情', 'Bring the detail panel back'],
    'bar_idle': ['点一件物品，或者：', 'Click an item, or:'],
    'bar_fold': ['收起详情', 'Fold detail'], 'bar_unfold': ['展开详情', 'Show detail'],
    'bar_grid': ['看物品库', 'Library'], 'bar_detail': ['看详情和关系网', 'Detail and web'],
    'bar_tidy': ['关系网摆回原样', 'Reset the web'],
    'said_open': ['打开了{name}。关系网里的物品可以拖。', 'Opened {name}. Items in the web can be dragged.'],
    'said_none': ['原稿只给纸鹤和红耳机画了详情，这一件没有数据，这里不编。', 'The source drew a detail view only for the paper crane and the red headphones; this one has no data, and none is made up here.'],
    'said_self': ['这就是现在打开的这一件。', 'This is the item that is open now.'],
    'said_moved': ['{name}挪了位置，连线跟着走。', '{name} moved; the lines follow.'],
    'said_fold': ['详情收起来了，物品库排成一整排。', 'The detail panel is folded away and the library fills the width.'],
    'said_tidy': ['关系网摆回了录屏里的位置。', 'The web is back to where the recording has it.'],
    'reset': ['重来', 'Start over'], 'said_reset': ['回到开始的样子。', 'Back to the start.'],
    'big': ['放大操作', 'Enlarge'], 'small': ['退出放大', 'Exit enlarged view'],
  },
 },
 'playbook-comments': {
  'kind': 'comments', 'anchor': 'try-comments',
  'tab': ['评论', 'Comments'],
  'label': ['PlayBook Studio · 二创投稿的评论', 'PlayBook Studio · Commenting on a remix submission'],
  'title': ['把意见落在画面的具体位置上', 'Pin a comment to a place on the image'],
  'how': [['在图上拖个框或点一下', 'Drag a box on the image, or click a spot'],
          ['写一句，发送', 'Write a line and send it'],
          ['圆点能拖，下面清单能删', 'Drag a dot to move it; delete it from the list below']],
  'provenance': [REBUILT[0] + '（UX 与 UI 均为我的工作）。你写的字只留在这一页，刷新就没了，不会上传。',
                 REBUILT[1] + ' (UX and UI are both my work). What you type stays on this page until it is reloaded; nothing is uploaded.'],
  'still': [_live('comments', 2), ['一张粉丝投稿的大图，图上有一个蓝色圆点和一条留言气泡', 'A large fan submission image with a blue dot and a comment bubble on it']],
  'frame': [1920, 1080],
  'base': _live('comments', 0), 'parts': _live('comments', 1),
  'region': [64, 232, 1366, 788],
  'dialog': [628, 688, 424, 286], 'field': [640, 820, 400, 100], 'send': [976, 934, 66, 28], 'cancel': [896, 934, 60, 28],
  'avatar': [638, 778, 28, 28], 'gap': [18, 23], 'pin': 24, 'colour': '#486CFF', 'who': 'Lofi girl (you)', 'placeholder': 'Add Comments',
  'limits': {'marks': 5, 'chars': 60},
  'view': [40, 70, 1420, 980],      # narrow screens show the image and its heading, not the whole page
  't': {
    'area': ['投稿图：拖一个框或点一下，留一条评论', 'The submission: drag a box or click to leave a comment'],
    'field': ['回复内容', 'Your reply'], 'send': ['Send（发送）', 'Send'], 'cancel': ['Cancel（取消）', 'Cancel'],
    'pin': ['第 {n} 个标记：{text}', 'Marker {n}: {text}'],
    'bar_idle': ['在图上拖一个框，或者点一下。', 'Drag a box on the image, or click a spot.'],
    'bar_count': ['你留下的标记 {n} / {max}', 'Your markers {n} / {max}'],
    'bar_add': ['在图中间留一个标记', 'Add a marker in the middle'],
    'bar_clear': ['全部清掉', 'Clear all'],
    'bar_delete': ['删掉这个标记', 'Remove this marker'],
    'bar_write': ['写给这一处的话：', 'Your comment on this spot:'],
    'bar_send': ['发送', 'Send'], 'bar_cancel': ['取消', 'Cancel'],
    'said_draft': ['回复框贴着你圈的地方弹出来了：写的是这一处，不是整张图。', 'The reply box opened next to the place you marked: the comment is about this spot, not the whole image.'],
    'said_sent': ['选区收成了一个圆点，带着这句话。圆点可以拖，点一下收起。', 'The area collapsed into a dot that carries the line. Drag the dot to move it; click to fold it.'],
    'said_empty': ['先写一句话再发送。', 'Write a line before sending.'],
    'said_max': ['最多留 {max} 个标记。先在下面删掉一个。', 'There can be {max} markers at most. Remove one below first.'],
    'said_cancel': ['取消了，图上没有留下东西。', 'Cancelled; nothing was left on the image.'],
    'said_deleted': ['删掉了一个标记。', 'One marker removed.'],
    'said_cleared': ['标记全部清掉了。', 'All markers cleared.'],
    'said_moved': ['圆点挪了位置，留言跟着它。', 'The dot moved; its comment goes with it.'],
    'reset': ['重来', 'Start over'],
    'big': ['放大操作', 'Enlarge'], 'small': ['退出放大', 'Exit enlarged view'],
  },
 },
}


def _studio_config(d, lang):
    """What the engine needs, with every bilingual pair reduced to the page's language."""
    skip = {'tab', 'label', 'title', 'intro', 'how', 'note', 'provenance', 'still', 'anchor'}
    pick = lambda v: t(v[0], v[1], lang)
    cfg = {k: v for k, v in d.items() if k not in skip}
    cfg['t'] = {k: pick(v) for k, v in d['t'].items()}
    for k in ('names', 'short', 'node_names'):
        if k in d:
            cfg[k] = {n: pick(v) for n, v in d[k].items()}
    if d['kind'] == 'recipe':
        cfg['items'] = [{'id': i, 'name': name, 'out': out, 'pct': d['default_pct'] if pct is None else pct, 'lib': list(lib)} for i, name, out, pct, lib in d['items']]
    return cfg


def studio(key, lang):
    d = STUDIO[key]
    W, H = LIVE_SIZE
    still, alt = d['still']
    geo = ''.join(f'--{k}:{v};' for k, v in d.get('geo', {}).items())
    how = ''.join(f'<li>{t(*h, lang)}</li>' for h in d['how'])
    T = lambda k: t(*d['t'][k], lang)
    return f'''<section class="proto frame-block" id="{d['anchor']}" data-studio="{d['kind']}" data-config="{_json(_studio_config(d, lang))}" data-component="Rebuilt prototype">
{_frame_label(t(*d['label'], lang), t(*REBUILT_TAG, lang), 'prov--retro', 'playbook')}
<div class="frame frame--canvas">
 <div class="studio">
  <div class="studio__stage" data-stage style="{geo}"><img class="studio__still" src="{still}" width="{W}" height="{H}" alt="{escape(t(*alt, lang))}" loading="lazy"></div>
  <p class="studio__read" data-read hidden></p>
  <div class="studio__bar"><div class="studio__controls" data-bar></div><p class="studio__status" data-status role="status"></p></div>
  <div class="studio__side">
   <div class="proto__intro"><h3>{t(*d['title'], lang)}</h3>
    <ol class="studio__how">{how}</ol></div>
   <div class="studio__right">
    <div class="proto__tools" data-tools><button type="button" class="tool-btn" data-action="reset">↺ {T('reset')}</button><button type="button" class="tool-btn" data-action="big" data-on="{T('small')}" data-off="{T('big')}" hidden>⤢ {T('big')}</button></div></div>
  </div>
 </div>
 <p class="proto__prov">{t(*d['provenance'], lang)}</p>
</div>
<noscript><p class="frame-caption">{t('启用 JavaScript 后可以操作；下方保留了当年的原始录屏。', 'Enable JavaScript to use this; the original recordings are kept below.', lang)}</p></noscript>
</section>'''


def live_set(lang):
    """The three rebuilt interactions, one visible at a time."""
    keys = list(STUDIO)
    buttons = ''.join(f'<button type="button" data-live-tab="{k}" aria-pressed="{str(n == 0).lower()}">{t(*STUDIO[k]["tab"], lang)}</button>' for n, k in enumerate(keys))
    panels = ''.join(f'<div data-live-panel="{k}" {"hidden" if n else ""}>{studio(k, lang)}</div>' for n, k in enumerate(keys))
    return f'''<div class="liveset" data-liveset data-component="Rebuilt prototypes">
<div class="liveset__head"><span class="label label--teal">{t('亲手试', 'Try it', lang)}</span>
<p>{t('三段交互按原稿还原，没有固定顺序，可以随便拖、来回调。原始录屏在下面。', 'Three interactions rebuilt from the source, in no fixed order: drag and adjust freely. The original recordings are below.', lang)}</p>
<div class="clips__tabs" role="group" aria-label="{t('选择一段交互', 'Choose an interaction', lang)}">{buttons}</div></div>
{panels}</div>'''


def _pct(box, W, H):
    return {'x': box[0] / W * 100, 'y': box[1] / H * 100, 'w': box[2] / W * 100, 'h': box[3] / H * 100}


def _hot(h, W, H, lang):
    return {**_pct(h['box'], W, H), 'go': h.get('go'), 'label': t(*h['label'], lang), 'note': t(*h['note'], lang) if 'note' in h else None}


def flow(key, lang, anchor):
    f = FLOWS[key]
    W, H = f['size']
    screens_html = ''
    data = {'start': f['start'], 'screens': {}, 'end': f['end'][0 if lang == 'zh' else 1] if f['end'] else None,
            'labels': {'restart': t('重新开始', 'Restart', lang), 'hint': t('显示可点区域', 'Show tap targets', lang)}}
    for i, (sid, s) in enumerate(f['screens'].items()):
        screens_html += (f'<img class="proto__screen" data-screen="{sid}" src="{s["src"]}" width="{W}" height="{H}" '
                         f'alt="{escape(t(*s["alt"], lang))}" {"loading=\"lazy\"" if i else ""} {"" if sid == f["start"] else "data-hidden"}>')
        data['screens'][sid] = {
            'note': t(*s['note'], lang), 'next': t(*s['next'], lang),
            'hotspots': [_hot(h, W, H, lang) for h in s['hotspots']]}
    rail = ''.join(f'<li><button type="button" data-go="{sid}"><span class="pin">{n+1}</span><span>{t(*s["step"], lang)}</span></button></li>'
                   for n, (sid, s) in enumerate(f['screens'].items()))
    first = f['screens'][f['start']]
    inner = f'<div class="proto__screens">{screens_html}<div class="proto__hotspots"></div></div>'
    device = f'<div class="proto__device"><div class="phone"><div class="phone__screen">{inner}</div></div></div>'
    return f'''<section class="proto frame-block" id="{anchor}" data-proto="{_json(data)}" data-component="Prototype player">
{_frame_label(t(*f['label'], lang), t(*f['prov'], lang), '', f['project'])}
<div class="frame frame--canvas">
 <div class="proto__stage">
  {device}
  <div class="proto__side">
   <div class="proto__intro"><span class="label label--teal">{t('可操作原型', 'Try it', lang)}</span><h3>{t(*f['title'], lang)}</h3><p>{t(*f['intro'], lang)}</p></div>
   <ol class="rail" aria-label="{t('原型步骤', 'Prototype steps', lang)}">{rail}</ol>
   {_note(t(*first['note'], lang), t('Tobie 的注释', 'Tobie’s note', lang))}
   <p class="proto__next" data-next>{t(*first['next'], lang)}</p>
   <div class="proto__tools"><button type="button" class="tool-btn" data-action="hint">◎ {data['labels']['hint']}</button><button type="button" class="tool-btn" data-action="restart">↺ {data['labels']['restart']}</button></div>
  </div>
 </div>
 <p class="proto__prov">{t(*f['provenance'], lang)}</p>
</div>
<noscript><p class="frame-caption">{t('启用 JavaScript 后可点击操作；下方仍保留全部原始界面。', 'Enable JavaScript to click through; all original screens are also shown below.', lang)}</p></noscript>
</section>'''


# --------------------------------------------------------------------------
# PlayBook Studio: guided tour of the original recipe editor
# --------------------------------------------------------------------------
TOUR = {
 # regions in % of the original 2880×1620 screenshot (x, y, w, h)
 'steps': [
  {'id': 'library', 'box': [0.4, 5.4, 19.2, 52], 'title': ['物品库', 'Item library'],
   'note': ['创作者从自己的物品开始。标签（#Chargers）把 Gamepad、Super Charger、Normal Battery 归在一起。', 'Creators start from their own items. A tag (#Chargers) groups Gamepad, Super Charger and Normal Battery.']},
  {'id': 'inputs', 'box': [21.0, 6.6, 15.5, 69], 'title': ['输入：必选与可选', 'Inputs: required vs optional'],
   'note': ['在写任何逻辑之前，输入先被分成 Require（手柄、电池）和 Optional（增压器）两栏。', 'Before any logic is written, inputs are split into Require (gamepad, battery) and Optional (supercharger).']},
  {'id': 'condition', 'box': [37.6, 16.5, 17.8, 14.2], 'title': ['条件：只测一个变量', 'Condition: one explicit test'],
   'note': ['分支只检查一件事：可选的 Super Charger 有没有被选中。', 'The branch tests one thing only: whether the optional Super Charger was selected.']},
  {'id': 'branches', 'box': [38.6, 38.5, 43.6, 33.8], 'title': ['True / False 两条路径', 'True and False paths'],
   'note': ['两条路径都写在画布上：False 把两项电量相加；True 在相加后再 ×2。切换下方开关，看哪条路径生效。', 'Both paths are on the canvas: False adds the two battery values; True adds them and applies ×2. Use the switch below to see which path applies.']},
  {'id': 'output', 'box': [84.6, 27.4, 14.6, 26.6], 'title': ['输出：结果保持可见', 'Output: the result stays visible'],
   'note': ['输出物品旁直接写着 Set Battery Life To New Battery Life——改变了哪个属性，一眼可见。', 'Next to the output item: Set Battery Life To New Battery Life — which attribute changed is visible at a glance.']},
  {'id': 'toolbar', 'box': [33.8, 84.8, 48.2, 12.2], 'title': ['工具栏：规则的语法', 'Toolbar: the grammar of rules'],
   'note': ['画布上的每个块都来自这几个部件：If、Set…To…、and/or、Variable、+−×÷=。', 'Every block on the canvas comes from these pieces: If, Set…To…, and/or, Variable, +−×÷=.']},
 ],
 # branch overlays (% of screenshot) used by the True/False switch
 'false_box': [48.2, 39.8, 31.8, 10.8],
 'true_box': [39.2, 51.2, 42.8, 20.8],
}

def studio_tour(lang, anchor):
    steps = [{'id': s['id'], 'box': s['box'], 'title': t(*s['title'], lang), 'note': t(*s['note'], lang)} for s in TOUR['steps']]
    data = {'steps': steps, 'false': TOUR['false_box'], 'true': TOUR['true_box']}
    rail = ''.join(f'<li><button type="button" data-step="{n}"><span class="pin">{n+1}</span><span>{s["title"]}</span></button></li>' for n, s in enumerate(steps))
    return f'''<section class="proto frame-block" id="{anchor}" data-tour="{_json(data)}" data-component="Guided tour">
{_frame_label(t('PlayBook Studio · 合成配方编辑器', 'PlayBook Studio · Craft Recipes editor', lang), t('原始界面', 'Original screen', lang), '', 'playbook')}
<div class="frame frame--canvas"><div class="tour">
 <div class="browser"><div class="browser__bar"><i></i><i></i><i></i><span>PlayBook Studio — Craft Recipes</span></div>
  <div class="tour__viewport"><div class="tour__canvas"><img src="/assets/work/playbook/studio-editor.webp" width="2400" height="1350" alt="{t('PlayBook Studio 合成配方编辑器原始界面：左侧物品库，中间为输入、条件与输出三栏，底部工具栏', 'Original PlayBook Studio Craft Recipes editor: item library on the left, Input, Condition and Output columns, toolbar at the bottom', lang)}" loading="lazy">
   <span class="tour__branch tour__branch--dim" data-branch="false" hidden></span><span class="tour__branch tour__branch--dim" data-branch="true" hidden></span>
   <span class="tour__mark" data-off></span></div></div></div>
 <div class="tour__controls">
  <div><span class="label label--teal">{t('导览原始编辑器', 'Guided tour of the original editor', lang)}</span><ol class="rail" style="margin-top:12px" aria-label="{t('导览步骤', 'Tour steps', lang)}">{rail}</ol>
   <div class="proto__tools" style="margin-top:14px"><button type="button" class="tool-btn" data-action="overview">⤢ {t('看全图', 'Whole screen', lang)}</button></div></div>
  <div>{_note(t('选一个步骤，画面会移到原始界面的对应区域。', 'Pick a step to move to that part of the original screen.', lang), t('Tobie 的注释', 'Tobie’s note', lang))}
   <div class="toggle-row" data-branch-row hidden><span>{t('Super Charger 被选中？', 'Super Charger selected?', lang)}</span><span class="toggle" role="group" aria-label="{t('可选输入是否被选中', 'Is the optional input selected', lang)}"><button type="button" aria-pressed="true" data-selected="true">{t('是 · True', 'Yes · True', lang)}</button><button type="button" aria-pressed="false" data-selected="false">{t('否 · False', 'No · False', lang)}</button></span></div>
  </div>
 </div>
</div>
<p class="proto__prov">{t('界面来自 PlayBook Studio 原稿（UX 与 UI 均为我的工作），导览只加了注释。', 'Screen from the PlayBook Studio source file (UX and UI are my work); the tour only adds annotations.', lang)}</p>
</div></section>'''


# --------------------------------------------------------------------------
# SMT: the "Table / Account Positions" component, rebuilt 1:1 from the source
# --------------------------------------------------------------------------
SMT_ROWS = [
 ('1', '000001', '平安银行', '2500', '2500', '59.060', '40.110', '623,311.23', '-1623.31', '-24.13', '2000', '2000', '沪A', '200000026', '李永'),
 ('2', '000811', '冰轮环境', '2500', '2500', '192.440', '109.130', '962,211.20', '-1,123.13', '-10.21', '600', '600', '沪A', '200000026', '李永'),
 ('3', '002030', '天奇股份', '1400', '1400', '2.440', '2.860', '2,222,211.20', '141,123.13', '10.21', '600', '600', '沪A', '200000026', '李永'),
 ('4', '002031', '达安基因', '1400', '1400', '2.440', '2.860', '2,222,211.20', '141,123.13', '10.21', '600', '600', '沪A', '200000026', '李永'),
 ('5', '600000', '浦发银行', '100000', '100000', '12.000', '34.170', '61,506,000.00', '399,021,131.00', '341.00', '0', '0', '沪A', '200000026', '李永'),
 ('6', '600036', '招商银行', '11800', '11800', '10.230', '34.170', '61,506,000.00', '399,021,131.00', '341.00', '0', '0', '沪A', '200000026', '李永'),
 ('7', '600070', '浙江富润', '1133100', '1133100', '10.230', '5.530', '506,000.00', '-511,233.00', '-80.00', '0', '0', '沪A', '200000026', '李永'),
]
SMT_HEAD = ['序号', '证券代码', '证券名称', '持仓数量', '可卖数量', '成本价', '最新价', '市值', '盈亏金额', '盈亏比例(%)', '今日买入', '今日卖出', '市场', '资金账户', '姓名']
SMT_COLS = [48, 92, 96, 92, 92, 82, 82, 112, 118, 100, 80, 80, 56, 100, 60]

def smt_table(lang, anchor):
    cols = ''.join(f'<col style="width:{w}px">' for w in SMT_COLS)
    head = ''.join(f'<th scope="col">{h}</th>' for h in SMT_HEAD)
    body = ''
    for r in SMT_ROWS:
        cells = ''
        for i, v in enumerate(r):
            cls = ''
            if i in (8, 9): cls = ' class="down"' if v.startswith('-') else ' class="up"'
            cells += f'<td{cls}>{v.replace("-", "−") if i in (8, 9) else v}</td>'
        body += f'<tr tabindex="0">{cells}</tr>'
    states = [('default', t('默认 · 阅读', 'Default · read', lang)), ('selected', t('选中 · 保留上下文', 'Selected · keep context', lang)),
              ('hover', t('悬停 · 定位', 'Hover · locate', lang)), ('empty', t('无数据 · 保留行高', 'Empty · reserve space', lang))]
    notes = {
      'default': t('默认行：白底、1px 分隔线。列顺序是阅读顺序——先认出证券，再比较持仓与现值，最后看盈亏。', 'Default row: white, 1px dividers. Column order is reading order — identify the security, compare position with current value, then read profit and loss.', lang),
      'selected': t('选中行用浅蓝 #F1F4FF 标出，文字颜色不变——你知道自己在操作哪一行，但整张表仍然可读。', 'A selected row turns pale blue (#F1F4FF) while text colours stay the same — you know which row you are acting on, and the table stays readable.', lang),
      'hover': t('悬停用中性灰 #E5E6E9，只帮助定位，不暗示“已选中”。', 'Hover uses a neutral grey (#E5E6E9) to help locate a row, without suggesting it is selected.', lang),
      'empty': t('无数据变体保留整行的高度：数据刷新时，下面的行不会跳动。', 'The empty variant keeps the full row height, so rows below do not jump while data refreshes.', lang)}
    data = {'notes': notes}
    rail = ''.join(f'<li><button type="button" data-state="{k}"><span class="pin">{n+1}</span><span>{v}</span></button></li>' for n, (k, v) in enumerate(states))
    return f'''<section class="proto frame-block" id="{anchor}" data-smt="{_json(data)}" data-component="Component replica">
{_frame_label(t('SMT · 表格 / 账户持仓组件', 'SMT · Table / Account Positions component', lang), t('按原稿 1:1 重建', 'Rebuilt 1:1 from source', lang), 'prov--retro', 'smt')}
<div class="frame frame--canvas"><div class="tour">
 <div class="browser"><div class="browser__bar"><i></i><i></i><i></i><span>SMT-MAX — 资产 / 持仓</span></div>
  <div class="smt product" lang="zh-CN">
   <div class="smt__titlebar"><span>持仓</span><span class="smt__refresh" aria-hidden="true"></span></div>
   <div class="smt__search" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>证券代码/名称</div>
   <div class="smt__scroll" tabindex="0" role="region" aria-label="{t('持仓表，可横向滚动', 'Positions table, scrolls horizontally', lang)}"><table><colgroup>{cols}</colgroup><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table></div>
   <div class="smt__status"><span>上证指数 <b class="up" style="color:#DF3537;font-weight:400">3000.21 +120.21 +8.21%</b></span><span>{t('原稿中的示例数据', 'Sample data from the source file', lang)}</span></div>
  </div></div>
 <div class="tour__controls">
  <div><span class="label label--teal">{t('原稿记录的四种状态', 'The four states documented in the source', lang)}</span><ol class="rail" style="margin-top:12px" aria-label="{t('组件状态', 'Component states', lang)}">{rail}</ol></div>
  <div>{_note(notes['default'], t('Tobie 的注释', 'Tobie’s note', lang))}<p class="meta" style="margin-top:12px">{t('也可以直接把鼠标移到行上、点击行来选中。', 'You can also hover and click rows directly.', lang)}</p></div>
 </div>
</div>
<p class="proto__prov">{t('这是“表格 / 账户持仓”组件的代码复刻：列、数值、颜色（涨红 #DF3537、跌绿 #1D9920、选中 #F1F4FF、悬停 #E5E6E9）与行高均取自原稿截图，数值为原稿示例数据。', 'A code replica of the “Table / Account Positions” component: columns, values, colours (gain red #DF3537, loss green #1D9920, selected #F1F4FF, hover #E5E6E9) and row height are taken from the source screenshots. Values are the source file’s sample data.', lang)}</p>
</div></section>'''


# --------------------------------------------------------------------------
# Commons Fridge 07：3D 小样，嵌在本站（2026-11-24，交接单 6h，替掉原 08 节嵌的 v1.8 外链原型）。
# dist/demo/commons-fridge-3d/ 由 tools/pack_fridge_demo.py 从 01-commons-fridge/3d-小样/试装/ 打包，不发外站请求；
# 点「在这里运行」之前只有一张封面图（fridge/3d-home），点了才载入。JS 用 prototype.js 的 live()（没有入口按钮时不带 #）
# --------------------------------------------------------------------------
FRIDGE_3D_URL = '/demo/commons-fridge-3d/'

def fridge_3d(lang, anchor):
    T = lambda zh, en: t(zh, en, lang)
    # 右栏的“手势 → 产品里的事”（2026-11-24 打回后补：右边太空）。每一行都在打包进站的小样里点过，
    # 出处见 claudestudy/evidence/2026-11-24-作品集-冰箱页换成3D小样/小样画面/右栏事实.txt。小样改了要重对。
    rows = ''.join(f'<div><dt>{T(*a)}</dt><dd>{T(*b)}</dd></div>' for a, b in (
        (('向右拖门把手', 'Drag the handle to the right'), ('开门', 'The door opens')),
        (('点一样东西', 'Tap an item'), ('看它是谁的、放了几天、打算什么时候吃', 'See whose it is, how long it has been there, and the plan for it')),
        (('把自己的东西拖给企鹅', 'Drag something of yours to the penguin'), ('处理掉了，企鹅得一条鱼', 'It is dealt with, and the penguin gets a fish')),
        (('把自己的东西拖到别的层', 'Drag something of yours to another shelf'), ('换了位置，还是我的', 'It moves, and it is still yours')),
        (('点二层「+2」里的果酱', 'Tap the jam inside “+2” on the second shelf'), ('小满的，放在我的层，没有处理按钮', 'Xiaoman’s, sitting on my shelf: no button to dispose of it')),
    ))
    return f'''<section class="proto frame-block" id="{anchor}" data-live="{FRIDGE_3D_URL}" data-component="Live prototype">
{_frame_label(T('The Commons Fridge · 3D 小样', 'The Commons Fridge · 3D prototype'), T('可运行原型', 'Working prototype'), 'prov--live', 'fridge')}
<div class="frame frame--canvas"><div class="live live--3d">
 <div class="live__phone"><div class="phone"><div class="phone__screen">
  <div class="live__poster"><img src="/assets/work/fridge/3d-home.webp" width="480" height="1039" alt="{T('3D 小样首页：冰箱门关着，底下是查看处理、放入、买菜前看一眼', '3D prototype home: the fridge door closed, with Check, Put in and Before you shop below')}" loading="lazy"><button type="button" class="btn" data-action="load">▶ {T('在这里运行', 'Run it here')}</button></div>
 </div></div></div>
 <div class="proto__side">
  <div class="proto__intro"><span class="label label--teal">{T('可以上手的小样', 'Hands-on prototype')}</span><h3>{T('开门，拿起二层那瓶牛奶，拖给企鹅。', 'Open the door, pick up the milk on the second shelf, drag it to the penguin.')}</h3><p>{T('下一版首页的小样，里面是示例数据。每个手势对应产品里的一件事：', 'A prototype of the next home screen, with example data. Each gesture stands for one thing in the product:')}</p></div>
  <dl class="gest">{rows}</dl>
  <p class="gest__key">{T('东西上的小圆贴：<span><b>我</b> 我的</span> · <span><b>共</b> 共用</span> · <span><b>满</b> <b>青</b> 室友的</span> · <span><b>?</b> 不知道是谁的</span> · <span><b>请吃</b> 谁想吃都可以拿</span>。放在自己那层的不贴。', 'Round stickers on items: <span><b>我</b> mine</span> · <span><b>共</b> shared</span> · <span><b>满</b> <b>青</b> a flatmate’s</span> · <span><b>?</b> nobody knows whose</span> · <span><b>请吃</b> anyone may have it</span>. Items on their owner’s own shelf carry none.')}</p>
  <div class="proto__tools"><a class="tool-btn" href="{FRIDGE_3D_URL}" target="_blank" rel="noopener">↗ {T('全屏打开', 'Open full screen')}</a><button type="button" class="tool-btn" data-action="reset-frame" disabled>↺ {T('重新载入', 'Reload')}</button></div>
 </div>
</div>
<p class="proto__prov">{T('嵌入的是 3D 小样本身，示例数据，只在这台设备上，刷新就复原。', 'The 3D prototype itself, in Chinese, with example data that stays on this device and resets on reload.')}</p>
</div></section>'''


# --------------------------------------------------------------------------
# Original recordings (PlayBook)
# --------------------------------------------------------------------------
def clips(lang):
    items = [('recipe', t('配方编辑', 'Recipe editor', lang), t('在原始画布上创建一个合成配方。', 'Creating a crafting recipe on the original canvas.', lang)),
             ('items', t('物品交互', 'Item interaction', lang), t('物品详情与关联内容的原始交互。', 'The original item-detail and related-content interaction.', lang)),
             ('comments', t('评论交互', 'Comment interaction', lang), t('评论流程的原始操作与反馈。', 'Actions and feedback in the original comment flow.', lang))]
    tabs = ''.join(f'<button type="button" data-clip="{k}" aria-pressed="{str(n == 0).lower()}">{label}</button>' for n, (k, label, d) in enumerate(items))
    figs = ''.join(f'<figure data-clip-panel="{k}" {"hidden" if n else ""}><video controls playsinline preload="none" poster="/assets/motion/{k}-poster.webp" aria-label="{label}"><source src="/assets/motion/{k}.mp4" type="video/mp4"></video><figcaption>{d} {t("无声录屏，未经剪辑。", "Silent, unedited screen recording.", lang)}</figcaption></figure>' for n, (k, label, d) in enumerate(items))
    return f'''<section class="frame-block clips" data-clips data-component="Recordings" style="margin:48px 0">
{_frame_label(t('PlayBook · 当年的交互录屏', 'PlayBook · interaction recordings from the time', lang), t('原始录屏', 'Screen recording', lang), '', 'playbook')}
<div class="frame frame--canvas"><div class="clips__tabs" role="group" aria-label="{t('选择录屏', 'Choose a recording', lang)}">{tabs}</div>{figs}</div></section>'''


# --------------------------------------------------------------------------
# PlayBook 04: campaign drafting assistant (a new design concept, 2026; section 11 until 2026-11-24)
#
# 交接单 02-playbook/portfolio/handoff.md 第 4 节 ⑤；本人的结论在卡 20261116-001（做）、
# 20261116-013（B 档：能点的示意加评分结果）、20261117-003（打分「都通过」）、20261117-024（「放上画布」选 A）。
# 不属于 docs/design-system.md 规则 8 管的三个重做演示：这是 2026 年新做的设计，物品、创作者、活动都是虚构的。
# 数据只有一份：02-playbook 里的 JSON，构建时读进来写进页面（data-config），页面运行时不发任何请求。
# 2026-11-25（交接单 ⑨，卡 20261125-002 本人打回）：「放上画布」那块只读三栏去掉了。双击一条配方（触屏双击、
# 聚焦后按 Enter 也行），在 Studio 窗口里打开 03 节同一个配方编辑器（recipeLab，能拖），物品库换成这份草案的物品和图，
# 这条配方摆好、带数量和概率；改动不写回草案。recipeLab 的这些都是可选配置（_drafter_config 的 editor），
# 不给时 03 节的演示和原来一模一样。STUDIO 不动（03 节的测试要求那里正好三个演示、八样物品）。
# 引擎：dist/prototype.js 的 draftRules（纯函数，tests/draft_rules.test.js 在 Node 里跑）、drafterLab、recipeLab。
# --------------------------------------------------------------------------
DRAFT_DATA = Path(__file__).resolve().parent.parent / '02-playbook' / 'case-study' / 'ai-起草助手-数据.json'
CONCEPT = ['2026 年新做的设计示意', 'New design concept, 2026']
DRAFTER_ITEM_SRC = '/assets/work/playbook/drafter-items/{draft}-{item}.webp'   # 2026-11-18：17 张物品图（Codex 生成，交接单 ⑥）


@lru_cache(maxsize=1)
def draft_data():
    return json.loads(DRAFT_DATA.read_text(encoding='utf-8'))


def _pick(v, lang):
    """Every {'zh': …, 'en': …} in the data becomes the page's language."""
    if isinstance(v, dict):
        if set(v) == {'zh', 'en'}:
            return v[lang]
        return {k: _pick(x, lang) for k, x in v.items()}
    if isinstance(v, list):
        return [_pick(x, lang) for x in v]
    return v


DRAFTER = {
 'anchor': 'try-drafter',
 'label': ['PlayBook · 活动起草助手', 'PlayBook · Campaign drafting assistant'],
 'title': ['选一个目标，改一份草案', 'Pick a goal, edit a draft'],
 # 2026-11-25（交接单 ⑪）：开头一句照交接单原文，换成照 Studio 原稿 Campaign 三页走的点法；后两句照 ⑩ 的意思顺了一下
 'intro': ['点 Create 新建活动，在一句话起草条里选一个创作者目标，看助手把任务、物品和配方填进活动页。每个任务、每条配方都可以接受、改数量或删掉；改过以后，活动页下面会按现在的样子重新检查。双击一条配方，它会在 Studio 的配方编辑器里打开，可以接着拖。',
           'Click Create to start a new campaign, pick a creator’s goal in the one-sentence bar, and watch the assistant fill the campaign page with missions, items and recipes. Every mission and every recipe can be accepted, edited (quantities only) or removed; once you change something, the campaign is checked again as it now stands, further down the page. Double-click a recipe to open it in the Studio recipe editor and keep working on it by dragging.'],
 'score': ['评分结果', 'Score'],
 'score_text': ['三份草案 × 五条检查 = 十五项，全部通过', '3 drafts × 5 checks = 15 checks, all passed'],
 'score_checks': ['五条检查', 'The five checks'],
 't': {
   'pick': ['选一个创作者目标', 'Pick a creator’s goal'],
   'draft': ['草案{n}', 'Draft {n}'],
   'nums': [['一', '二', '三', '四', '五', '六', '七', '八', '九'], ['1', '2', '3', '4', '5', '6', '7', '8', '9']],
   'task': ['任务 {n}', 'Mission {n}'],
   'recipe': ['配方{n}', 'Recipe {n}'],
   'h_self': ['助手起草时的自查', 'The assistant’s own check while drafting'],
   'h_why': ['为什么这样配', 'Why it is set up this way'],
   'h_recheck': ['按现在的改动重新检查', 'Checked again with your changes'],
   'open_hint': ['双击配方，在编辑器里打开', 'Double-click a recipe to open it in the editor'],
   'common': ['普通', 'Common'], 'rare': ['稀有', 'Rare'],
   'opt': ['可选材料', 'Optional'],
   'give_get': ['交出 {give}，得到 {get}', 'Give {give}, get {get}'],
   'choose': ['{n} 选 1', 'Choose 1 of {n}'],
   'qty': ['{name} × {n}', '{name} × {n}'],
   'sep': ['、', ', '], 'colon': ['：', ': '], 'dash': ['：', ': '], 'gap': ['', ' '],
   'accept': ['接受', 'Accept'], 'accepted': ['已接受', 'Accepted'],
   'edit': ['修改', 'Edit'], 'edit_done': ['改好了', 'Done'],
   'remove': ['删除', 'Remove'], 'restore': ['恢复', 'Restore'], 'restore_all': ['全部恢复', 'Restore all'],
   'back': ['回到活动', 'Back to campaign'],
   # 2026-11-25（交接单 ⑪，卡 20261125-002 第 3 版打回）：窗口里的页面照 Studio 原稿 Campaign 三页（还没有活动、新账号、活动列表）。
   # 原稿是英文界面，这些字中英文页都用英文（照原稿，改正语法：Don’t Have a Campaign）；「草稿」标签照交接单中英成对。
   'empty_h': ['You Don’t Have a Campaign Yet', 'You Don’t Have a Campaign Yet'],
   'empty_p': ['Create Your First Campaign Here!', 'Create Your First Campaign Here!'],
   'create': ['Create', 'Create'],
   'untitled': ['Untitled Campaign', 'Untitled Campaign'],
   'left': ['Left in {n} days', 'Left in {n} days'],
   'future': ['Future Campaigns', 'Future Campaigns'],
   'scheduled': ['Scheduled On {d}', 'Scheduled On {d}'],
   'draft_tag': ['草稿', 'Draft'],
   'to_list': ['Campaign', 'Campaign'],
   'creator': ['Creator', 'Creator'],
   'p_missions': ['Missions', 'Missions'], 'p_items': ['Item Rewards', 'Item Rewards'], 'p_recipes': ['Crafting Recipes', 'Crafting Recipes'],
   'tab_all': ['All Tasks', 'All Tasks'], 'tab_on': ['Ongoing Tasks', 'Ongoing Tasks'],
   'start_missions': ['Start your first mission here!', 'Start your first mission here!'],
   'start_items': ['Create your first item reward here!', 'Create your first item reward here!'],
   'start_recipes': ['Create your first crafting recipe here!', 'Create your first crafting recipe here!'],
   'new': ['新建活动', 'New campaign'],
   'blank_only': ['这个示意只演示起草。', 'This demo only shows drafting.'],
   'goal_ph': ['用一句话说出这次活动的目标', 'Describe the campaign goal in one sentence'],
   'said_start': ['点 Create，新建一个活动。', 'Click Create to start a new campaign.'],
   'said_filled': ['草案填进了活动页，往下滚能看到助手的自查。', 'The draft is in the campaign page; scroll down for the assistant’s own check.'],
   'act': ['{act}：{name}', '{act}: {name}'],
   'edit_hint': ['只改数量，1 到 9。', 'Quantities only, 1 to 9.'],
   'less': ['{name} 减 1', 'One fewer {name}'], 'more': ['{name} 加 1', 'One more {name}'],
   'at_min': ['最少 1 个。', 'At least 1.'], 'at_max': ['最多 9 个。', 'At most 9.'],
   're_none': ['没有发现问题。', 'No problems found.'],
   're_no_source': ['{item}没有任务会发。', 'No mission gives {item}.'],
   're_short': ['{item}最多拿到 {max} 个，这条配方要 {need} 个。', '{item}: at most {max} can be earned, and this recipe needs {need}.'],
   're_contention': ['{item}不够同时合这几条配方，只能选一条。', 'There is not enough {item} for these recipes together; only one of them can be crafted.'],
   're_platform': ['剩下的 {n} 个任务里，只有 {k} 个在原平台上，不到一半。', 'Only {k} of the {n} remaining missions happen on the home platforms, which is less than half.'],
   're_no_tasks': ['一个任务都不剩了。', 'No missions are left.'],
   're_structure': ['放不进配方编辑器：{why}', 'Does not fit in the recipe editor: {why}'],
   're_removed': ['删掉的 {n} 项不参与检查。', 'The {n} removed part(s) are left out of the check.'],
   'items_note': ['物品图是用 Codex 生成的示意图，照 03 节 Studio 图标的风格画的。', 'Item art was generated with Codex as illustration, drawn to match the Studio icons in section 03.'],
   'open_gone': ['{name}已经删掉，恢复以后才能在编辑器里打开。', '{name} has been removed; restore it to open it in the editor.'],
   'said_pick': ['换成了{name}，之前的改动都清空了。', 'Switched to {name}; earlier changes are cleared.'],
   'said_accept': ['{name} 标成已接受。', '{name} is marked as accepted.'],
   'said_unaccept': ['{name} 取消了接受。', '{name} is no longer marked as accepted.'],
   'said_qty': ['{name}：{item}改成 {n} 个。', '{name}: {item} set to {n}.'],
   'said_removed': ['{name} 删掉了，不再参与检查。', '{name} removed; it is left out of the check.'],
   'said_restored': ['{name} 恢复了。', '{name} restored.'],
   'said_restore_all': ['删掉的都恢复了。', 'Everything removed is back.'],
   'said_open': ['{name} 在配方编辑器里打开了。这里改的不会写回草案。', '{name} is open in the recipe editor. Changes here do not go back into the draft.'],
   'said_back': ['回到了活动页，{name} 还是草案里的样子。', 'Back to the campaign; {name} is as the draft has it.'],
   'sum_some': ['重新检查：{n} 个问题。', 'Checked again: {n} problem(s).'],
   'sum_none': ['重新检查：没有发现问题。', 'Checked again: no problems found.'],
   # 2026-11-25（交接单 ⑬）：起草条照 Figma 数据卡排——左上三个目标页签、右上黑色「起草」按钮、下面灰底一句话（能输入）；
   # 任务卡照 Figma 任务卡（频次 / 奖励两组数、Related Platforms 照原稿英文）；物品、配方画成蜂窝圆图
   'draft_go': ['起草', 'Draft'],
   'said_goal': ['选了{name}的目标。点「起草」出草案。', 'Picked {name}’s goal. Click Draft to get a draft.'],
   'said_same': ['这个目标的草案已经在下面了。', 'The draft for this goal is already below.'],
   'need_goal': ['先选左上一个目标，再点「起草」。', 'Pick a goal at the top left first, then click Draft.'],
   # 2026-11-25（交接单 ⑭，本人试用时在灰框里自己打了一句，点「起草」只得到拒绝）：一进活动页就选好第一个目标；
   # 状态行开头说清两步；自己写的句子也起草，按关键词挑最接近的一份，老实说只有三份事先起草好的
   'said_camp': ['点「起草」看草案；也可以换个页签，或自己写一句。', 'Click Draft to see a draft; you can also switch tabs or write your own sentence.'],
   'typed_closest': ['这个示意只有三份事先起草好的草案，按你这句，先用最接近的「{name}」演示。',
                     'This demo has only three drafts written in advance; going by your sentence, it shows the closest one, “{name}”.'],
   'typed_none': ['这个示意只有三份事先起草好的草案，你这句对不上哪一份，先用第一份「{name}」演示。',
                  'This demo has only three drafts written in advance; your sentence matches none of them, so it shows the first one, “{name}”.'],
   'freq': ['频次', 'Frequency'], 'reward': ['奖励', 'Reward'],
   'platforms': ['Related Platforms', 'Related Platforms'],
   'gone_tag': ['已删除', 'Removed'],
 },
 # 交接单 ⑭：页签写「创作者 · 几个字的目标」，字从三份草案的 goal 里取（数据文件不改）
 'tabs': {
   'halloween': ['露米 · 万圣节直播', 'Lumi · Halloween'],
   'move': ['阿澈 · 换平台', 'Che · New platform'],
   'newsong': ['弥音 · 新歌拉新', 'Mion · New fans'],
 },
 # 交接单 ⑭：自己写的句子按这些词挑最接近的一份（中英两页共用，命中最多的那份；都没命中用第一份）
 'match': {
   'halloween': ['万圣节', '节日', '直播', '守着', '南瓜', '周五晚', 'halloween', 'holiday', 'festival', 'stream', 'pumpkin'],
   'move': ['搬家', '搬到', '换平台', '转平台', '迁移', 'youtube', 'twitch', 'moving', 'move to', 'switch', 'migrat', 'new platform'],
   'newsong': ['拉新', '新粉', '新歌', '新人', '歌', '涨粉', 'new fan', 'new song', 'song', 'newcomer', 'new viewer', 'attract', 'grow'],
 },
}


def _drafter_config(lang):
    """What drafterLab needs, already in the page's language."""
    d = draft_data()
    i = 0 if lang == 'zh' else 1
    recipe = STUDIO['playbook-recipe']
    read_keys = ('read', 'read_in', 'read_no_in', 'read_opt', 'read_out', 'read_no_out', 'read_and', 'read_or', 'read_sep', 'read_choose', 'read_wrap',
                 'no_full', 'no_dup', 'no_groups', 'no_groupfull', 'no_nowhere')
    return {
        'constraints': {c['id']: c['label'][lang] for c in d['constraints']},
        'drafts': _pick(d['drafts'], lang),
        # 结构合法：用 03 节配方编辑器的同一份上限和规则验（recipeRules）
        'limits': recipe['limits'],
        # 2026-11-18（交接单 ⑥）：物品图的地址由草案 id + 物品 id 拼出来，数据文件不用改；图由 tools/prepare_assets.py 导出
        'item_src': DRAFTER_ITEM_SRC,
        't': {**{k: v[i] for k, v in DRAFTER['t'].items()}, **{k: recipe['t'][k][i] for k in read_keys}},
        # 2026-11-25（交接单 ⑨）：双击配方打开的编辑器就是 03 节的 recipeLab，用它的画面、上限和文字；
        # 物品、开局摆放、数量、标题由 drafterLab 按这份草案填（prototype.js 的 openEditor）
        'editor': _drafter_editor(lang),
        # 2026-11-25（交接单 ⑪）：活动页三块面板的标题图标和「+ Create」用侧边栏同一套图标
        'icons': {k: _SKIN_ICONS[k] for k in ('missions', 'items', 'recipes', 'plus')},
        # 2026-11-25（交接单 ⑭）：页签上的短目标、自己写一句时挑草案用的词
        'tabs': {k: v[i] for k, v in DRAFTER['tabs'].items()},
        'match': DRAFTER['match'],
    }


# 编辑器里和 03 节说法不同的几句：03 节讲的是录屏，这里讲的是示意
DRAFTER_EDITOR_T = {
    'tools': ['底部工具栏（示意，点不了）', 'Bottom toolbar (illustration only)'],
    'upload': ['Upload（示意，不会上传）', 'Upload (illustration; nothing is uploaded)'],
    'said_cond': ['Condition 这一栏在这里不放物品。', 'The Condition area takes no items here.'],
    'said_tools': ['底部工具栏只照 Studio 原样摆着，这里点不了。', 'The bottom toolbar is only shown as it is in Studio; it does nothing here.'],
    'said_upload': ['这是示意，不会上传；在这里改的也不会写回草案。', 'This is a concept: nothing is uploaded, and changes here do not go back into the draft.'],
    'said_reset': ['回到草案里这条配方的样子。', 'Back to the recipe as the draft has it.'],
    'said_choose_on': ['这一组变成 {n} 选 1：按概率给其中一样。', 'This group is now choose 1 out of {n}: one of them is given, by the odds shown.'],
    'said_choose_off': ['取消了几选一，每样各算各的概率。', 'Choose-one is off; each item has its own probability.'],
    'qty': DRAFTER['t']['qty'],
}


def _drafter_editor(lang):
    recipe = STUDIO['playbook-recipe']
    full = _studio_config(recipe, lang)
    return {
        'frame': full['frame'], 'chrome': full['chrome'], 'icons': full['icons'],
        'limits': full['limits'], 'output_w': full['output_w'], 'default_pct': recipe['default_pct'],
        'geo': {**full['geo'], 'tile-h': 168},   # 草案物品的名字长，产出卡片高一点，名字能放两行
        'lib_at': [list(it[-1]) for it in recipe['items']],   # 物品库的八个位置，照录屏
        't': {**full['t'], **{k: t(v[0], v[1], lang) for k, v in DRAFTER_EDITOR_T.items()}},
    }


# 2026-11-24（交接单 ⑧，卡 20261124-006 选 A）：演示套上 Studio 窗口的样子。照 Studio 定稿「新建挑战」
# （Figma XDyOn5545LrSOsCwqUcED7 画框 5671:57226，导出图 02-playbook/portfolio/figures/studio-remix-new-challenge@2x.png）：
# 左边侧边栏、上面顶栏只是装饰（aria-hidden、没有链接和按钮，点不了），中英文页都照原稿用英文；颜色在 styles.css 的 .sk 一段。
# 里面的 [data-goals]、[data-draft] 原样，drafterLab 不动。
# 2026-11-25（交接单 ⑨）：每项带 data-nav，配方编辑器打开时 drafterLab 把亮的那项从 Campaign 挪到 Craft Recipes，回到草案再挪回来。
# 2026-11-25（交接单 ⑩，卡 20261125-004 选 A）：Campaign 后面的「+」是真按钮（新建活动，演示从这里开始）；
# 侧边栏收起时（窗口窄、手机）顶栏字标右边另有一个同样的「+」，CSS 只露一个。别的菜单项、字标、搜索框仍是装饰，各自 aria-hidden。
SKIN_NAV = [('dashboard', 'Dashboard'), ('campaign', 'Campaign'), ('items', 'Items'), ('recipes', 'Craft Recipes'),
            ('missions', 'Missions'), ('remix', 'PlayBook Remix'), ('economy', 'My Creator Economy')]
SKIN_ON = 'campaign'
SKIN_NEW = 'campaign'   # 「+」跟着 Campaign，不跟着亮的那项走（原稿「新建挑战」里亮的是 PlayBook Remix，+ 仍在 Campaign 后面）
SKIN_SEARCH = 'Search Items / Recipes / Missions / Campaigns / Tags / Public Resources'
_SKIN_ICONS = {   # 24×24 线框图标，照原稿侧边栏的样子画的简化版；不写 xmlns（内联 SVG 不需要，页面里也不出现网址）
 'dashboard': '<rect x="3.5" y="4" width="17" height="16" rx="1.5"/><path d="M9.5 4v16"/>',
 'campaign': '<path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V19c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V20M6 9.5h3M6 13h3M15 9.5h3M15 13h3"/>',
 'items': '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8C10.5 5 7 4.5 7 6.5S10 8 12 8zm0 0c1.5-3 5-3.5 5-1.5S14 8 12 8z"/>',
 'recipes': '<path d="M8 4h10a2 2 0 0 1 2 2v1.5h-4"/><path d="M16 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5h9"/><path d="M8 4a2 2 0 0 0-2 2v10.5M9.5 9h3.5M9.5 12.5h3.5"/>',
 'missions': '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4.5M8 20h8"/>',
 'remix': '<circle cx="12" cy="7" r="3"/><path d="M10.5 10v3H5.5A1.5 1.5 0 0 0 4 14.5V17h16v-2.5a1.5 1.5 0 0 0-1.5-1.5h-5v-3M4 20h16"/>',
 'economy': '<path d="M12 4v16M8 20h8M5 7h14M5 7l-3 6a3 3 0 0 0 6 0zM19 7l-3 6a3 3 0 0 0 6 0z"/>',
 'search': '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
 'plus': '<path d="M12 5v14M5 12h14"/>',
 # 2026-11-25（交接单 ⑪）：顶栏右边和侧边栏底下，照原稿 Campaign 三页
 'bell': '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5h4"/>',
 'down': '<path d="m7 10 5 5 5-5"/>',
 'gear': '<circle cx="12" cy="12" r="3"/><path d="M12 3.5 14 5l2.4-.4 1 2.2 2.1 1.2-.4 2.4L20.5 12 19 14l.4 2.4-2.2 1-1.2 2.1-2.4-.4L12 20.5 10 19l-2.4.4-1-2.2-2.1-1.2.4-2.4L3.5 12 5 10l-.4-2.4 2.2-1L8 4.5l2.4.4z"/>',
 'logout': '<path d="M14 4h5v16h-5M4 12h10M10 8l4 4-4 4"/>',
}
_SKIN_MARK = '<svg class="sk__mark" viewBox="0 0 30 20" aria-hidden="true"><path d="M13 20 21 6l9 14z" fill="#1A1A1A"/><path d="M0 20 10 3l10 17z" fill="#F95757" stroke="#fff" stroke-width="1.5"/></svg>'


def _skin_icon(name):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{_SKIN_ICONS[name]}</svg>'


def studio_skin(inner, new_label, who='Creator'):
    """Wrap a demo in a PlayBook Studio window: sidebar and top bar are decoration, except Campaign, its + and the campaign under it."""
    brand = f'<span class="sk__brand" aria-hidden="true">{_SKIN_MARK}<span><b>PlayBook</b> Studio</span></span>'
    caret = '<i class="sk__caret" aria-hidden="true"></i>'
    new = lambda where: (f'<button type="button" class="sk__new" data-new="{where}" aria-label="{new_label}" title="{new_label}">'
                         f'{_skin_icon("plus")}</button>')
    nav = ''
    for k, name in SKIN_NAV:
        on = ' data-on' if k == SKIN_ON else ''
        look = f'{_skin_icon(k)}<span>{name}</span>'
        if k == SKIN_NEW:
            # 2026-11-25（交接单 ⑪）：Campaign 本身也是按钮（回到活动列表；还没有活动时回到空状态），下面多一级活动名（有活动以后才出现）
            nav += (f'<span class="sk__item" data-nav="{k}"{on}>{caret if on else ""}<button type="button" class="sk__deco" data-list>{look}</button>{new("side")}</span>'
                    f'<button type="button" class="sk__sub" data-sub hidden></button>')
        else:
            nav += f'<span class="sk__item" data-nav="{k}"{on} aria-hidden="true">{caret if on else ""}{look}</span>'
    foot = f'<span class="sk__foot" aria-hidden="true">{_skin_icon("gear")}<i></i>{_skin_icon("logout")}</span>'
    # 顶栏右边照原稿：Pro Mode 开关、铃铛（红点）、圆头像、名字、下拉箭头；都是装饰，名字由 drafterLab 换成选中的创作者
    me = (f'<span class="sk__me" aria-hidden="true"><span class="sk__pro">Pro Mode<i class="sk__switch"></i></span><i class="sk__vr"></i>'
          f'<span class="sk__bell">{_skin_icon("bell")}</span><span class="sk__who"><i class="sk__av"></i><span class="sk__name" data-who>{who}</span>{_skin_icon("down")}</span></span>')
    return f'''<div class="sk" data-component="Studio window"><div class="sk__win">
   <div class="sk__side">{brand}<span class="sk__nav">{nav}</span>{foot}</div>
   <div class="sk__main">
    <div class="sk__top">{brand}{new("top")}<span class="sk__search" aria-hidden="true">{_skin_icon('search')}<span class="sk__ph">{SKIN_SEARCH}</span></span>{me}</div>
    <div class="sk__page">{inner}</div>
   </div>
  </div></div>'''


def drafter(lang):
    d = draft_data()
    T = lambda pair: t(*pair, lang)
    checks = ''.join(f'<li>{escape(c["label"][lang])}</li>' for c in d['checks'])
    score = (f'<dl class="case-brief case-decision dz-score" data-component="Score">'
             f'<div><dt>{T(DRAFTER["score"])}</dt><dd><strong>{T(DRAFTER["score_text"])}</strong></dd></div>'
             f'<div><dt>{T(DRAFTER["score_checks"])}</dt><dd><ol class="dz-score__list">{checks}</ol></dd></div></dl>')
    return f'''<section class="proto frame-block" id="{DRAFTER['anchor']}" data-drafter data-config="{_json(_drafter_config(lang))}" data-component="Design concept">
{_frame_label(T(DRAFTER['label']), T(CONCEPT), '', 'playbook')}
<div class="frame frame--canvas">
 <div class="drafter">
  <div class="proto__intro"><span class="label label--teal">{t('可以点的示意', 'Try it', lang)}</span><h3>{T(DRAFTER['title'])}</h3><p>{T(DRAFTER['intro'])}</p></div>
  {studio_skin(f'<div class="dz-pick" role="group" aria-label="{T(DRAFTER["t"]["pick"])}" data-goals></div><div class="dz-body" data-draft></div>', T(DRAFTER['t']['new']), T(DRAFTER['t']['creator']))}
  <div class="dz-bar"><p class="studio__status" data-status role="status"></p><div class="dz-bar__tools" data-tools></div></div>
  {score}
 </div>
 <p class="proto__prov">{T(CONCEPT)}</p>
</div>
<noscript><p class="frame-caption">{t('启用 JavaScript 后可以操作这个示意。', 'Enable JavaScript to use this concept.', lang)}</p></noscript>
</section>'''


# --------------------------------------------------------------------------
# Agent Matrix 07「重新定义」：203 张卡的处理记录，按「隔多久算新的一批」分批（2026-11-21，交接单第 9 节，卡 20261121-011 选 B）
# 数据只有一份：05-agent-matrix/portfolio/data/sittings.json（去标识：只有每个动作的时间和结论，没有标题、意见、卡号），
# 构建时写进页面（data-config），页面运行时不发请求。出处和重算脚本在 claudestudy/evidence/2026-11-21-审核中心使用数据/。
# --------------------------------------------------------------------------
SITTINGS_DATA = Path(__file__).resolve().parent.parent / '05-agent-matrix' / 'portfolio' / 'data' / 'sittings.json'

@lru_cache(maxsize=1)
def sittings_data():
    return json.loads(SITTINGS_DATA.read_text(encoding='utf-8'))

def sittings(lang):
    d = sittings_data()
    T = lambda zh, en: t(zh, en, lang)
    cfg = {'t': d['t'], 'v': ['r' if v == 'rejected' else '' for v in d['v']], 'gap': d['default_gap_min'], 'tz': 8 * 3600,
           'i18n': {'min': T(' 分钟', ' min'), 'items': T(' 张', ' cards'), 'from': T(' 起', ''),
                    'rej': T('打回 ', 'sent back '), 'span': T('用了 ', 'took '), 'sec': T(' 秒', 's'), 'one': T('1 张', '1 card'),
                    'aria': T('每个圆点是一批，圆点越大，那一批处理得越多。', 'Each dot is one sitting; larger dots mean more cards handled.')}}
    stats = ''.join(f'<div><dt>{T(*lab)}</dt><dd data-stat="{k}">–</dd></div>' for k, lab in [
        ('n', ('分成几批', 'Sittings')), ('med', ('一批中位几张', 'Median per sitting')), ('one', ('只处理 1 张的批', 'Sittings of one card')), ('max', ('最大一批', 'Largest sitting'))])
    return f'''<section class="proto frame-block" id="sittings" data-sittings data-config="{_json(cfg)}" data-component="Data chart">
{_frame_label(T('审核中心 · 203 张卡的处理记录', 'Review centre · how 203 cards were handled'), T('按项目记录绘制', 'Drawn from project records'), '', 'matrix')}
<div class="frame frame--canvas"><div class="sit">
 <div class="proto__intro"><span class="label label--teal">{T('可以拖的图', 'Try it')}</span><h3>{T('我每次坐下来，处理了几张。', 'How many cards I handled per sitting.')}</h3><p>{T('一个点是一批。拖动滑杆，改「隔多久算新的一批」。', 'Each dot is one sitting. Drag the slider to change how long a pause starts a new one.')}</p></div>
 <dl class="sit__stats" aria-live="polite">{stats}</dl>
 <label class="sit__ctl"><span class="label">{T('隔多久算新的一批', 'A new sitting after')}</span><input type="range" min="1" max="120" step="1" value="{d['default_gap_min']}" data-gap><output data-gap-out>{d['default_gap_min']}{T(' 分钟', ' min')}</output></label>
 <div class="sit__plot" data-plot><svg role="img" aria-label="{T('每个圆点是一批，圆点越大，那一批处理得越多。', 'Each dot is one sitting; larger dots mean more cards handled.')}"></svg><div class="sit__tip" data-tip hidden></div></div>
</div>
<p class="proto__prov">{T('203 张真卡的处理时间，不含标题和意见。', 'Handling times of 203 real cards, without titles or comments.')}</p>
</div>
<noscript><p class="frame-caption">{T('启用 JavaScript 后可以拖这张图。', 'Enable JavaScript to use this chart.')}</p></noscript>
</section>'''


# Agent Matrix 07：审核中心小原型（2026-11-21）。dist/demo/review-center/ 是审核中心 web/ 线上那一版（commit 168e852）的 app.js、style.css 原样，
# 加一个 mock.js 把读写服务器的那一层换成内存里的 8 张示例卡：不用登录、不发请求、刷新就复原。源和改动清单在 05-agent-matrix/portfolio/demo/review-center/README.md。
REVIEW_URL = '/demo/review-center/#/card/demo-03'   # 直接开到封面截图那张卡（同一件事的第三张，卡头下有前几张）

def review_demo(lang, anchor):
    T = lambda zh, en: t(zh, en, lang)
    sizes = ''.join(f'<button type="button" data-size="{k}" aria-pressed="{str(k == "wide").lower()}" disabled>{v}</button>'
                    for k, v in [('wide', T('电脑宽', 'Desktop')), ('phone', T('手机宽', 'Phone'))])
    return f'''<section class="proto frame-block" id="{anchor}" data-review="{REVIEW_URL}" data-component="Live prototype">
{_frame_label(T('审核中心 · 看卡', 'Review centre · card view'), T('可运行原型', 'Working prototype'), 'prov--live', 'matrix')}
<div class="frame frame--canvas"><div class="rv">
 <div class="proto__intro"><span class="label label--teal">{T('真实代码，示例卡', 'Real code, example cards')}</span>
  <p>{T('点右上角「还剩 4 张」，或者通过一张。', 'Click “还剩 4 张” (4 left) at the top right, or approve a card.')}</p></div>
 <div class="rv__screen" data-screen data-size="wide"><div class="rv__poster"><img src="/assets/work/agent-matrix/review-demo-poster.webp" alt="{T('审核中心看卡页截图：顶上一行「还剩 4 张 · 下一张」，卡头下面是前几张', 'Screenshot of the card view: “4 left · next” at the top, earlier cards under the header')}" loading="lazy"><button type="button" class="btn" data-action="load">▶ {T('在这里运行', 'Run it here')}</button></div></div>
 <div class="rv__side">
  <div class="routes" role="group" aria-label="{T('宽度', 'Width')}">{sizes}</div>
  <div class="proto__tools"><a class="tool-btn" href="{REVIEW_URL}" target="_blank" rel="noopener">↗ {T('新窗口全屏打开', 'Open full screen')}</a><button type="button" class="tool-btn" data-action="reset-frame" disabled>↺ {T('重新载入', 'Reload')}</button></div>
 </div>
</div>
<p class="proto__prov">{T('嵌入的是审核中心的网页代码本身，换上了 8 张示例卡。', 'This is the review centre’s own web code, running on eight example cards.')}</p>
</div></section>'''

def section_demo(slug, number, lang):
    """Which demo sits in which case section (1-based)."""
    if slug == 'qingju' and number == 4: return flow('qingju-route', lang, 'try')
    # 2026-11-16：PlayBook 前面插了一节「用户与动线」，Studio 从 02 顺延为 03，App 从 03 顺延为 04
    if slug == 'playbook' and number == 3: return studio_tour(lang, 'try') + live_set(lang) + clips(lang)
    # 2026-11-25（优化方案第 1 批）：04 起草助手下线（drafter() 留着没删），原 05 App 成为 04
    if slug == 'playbook' and number == 4: return flow('playbook-craft', lang, 'try-app')
    if slug == 'smt' and number == 3: return smt_table(lang, 'try')
    if slug == 'commons-fridge' and number == 7: return fridge_3d(lang, 'try')   # 2026-11-24（交接单 6h）：v1.8 外链原型撤掉，换成 07「3D 小样」里嵌本站打包的小样；原 08「原型与结果」并进 07
    # 2026-11-21：新 07「重新定义」（交接单第 9 节）放的是审核中心小原型和批次图。
    # 2026-11-25 重讲成 5 节（交接单第 14 节，卡 20261125-001）：小原型挪到 02「搬到作品集」（#try 锚点跟着走），批次图留在 04「重新定义」
    if slug == 'agent-matrix' and number == 2: return review_demo(lang, 'try')
    if slug == 'agent-matrix' and number == 4: return sittings(lang)
    return ''
