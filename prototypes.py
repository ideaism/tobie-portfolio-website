"""Interactive demos built from the ORIGINAL screens.

Rules (docs/design-system.md §5):
  1. A demo only shows screens and states that exist in the source files.
  2. Hotspots sit on the real controls; they never add behaviour the design
     did not specify. Where the source has no next screen, the demo says so.
  3. Notes are Tobie's annotations, visually separate from the product.
  4. Every demo carries a provenance line.
  5. The three PlayBook Studio demos rebuilt in code (STUDIO, rule 8) may be
     operated freely inside stated limits; they say they are a 2026 rebuild,
     take their interface from the source, and invent no data.

Coordinates are in the pixel space of the exported screen (see manifest).
"""
import json
from html import escape

def t(zh, en, lang): return zh if lang == 'zh' else en

def _json(data):
    return escape(json.dumps(data, ensure_ascii=False), quote=True)

def _frame_label(name, prov, prov_class, project):
    return (f'<div class="frame-label" style="--project:var(--p-{project})"><span class="frame-label__name"><span>{name}</span></span>'
            f'<span class="prov {prov_class}">{prov}</span></div>')

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
# Every demo says in its provenance line that it is a 2026 rebuild (REBUILT).
# Engine: dist/prototype.js (recipeRules, recipeLab, itemsLab, commentLab).

LIVE_SIZE = [1440, 810]


def _live(clip, n):
    return f'/assets/work/playbook/live-{clip}-{n:02d}.webp'


REBUILT = ['2026 年按原稿和当年录屏用代码重做，界面元素取自原稿',
           'This was rebuilt in code in 2026 from the source design and the recordings of the time; the interface elements are taken from the source']
REBUILT_TAG = ['2026 年用代码重做 · 界面取自原稿', 'Rebuilt in code, 2026 · interface from the source']

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
  'intro': ['没有固定顺序。左边八样物品随便拖进 Require、Optional、Output，放进去的可以再挪、再拿掉。',
            'There is no fixed order. Drag any of the eight items on the left into Require, Optional or Output; anything placed can be moved again or taken out.'],
  'how': [['拖：物品拖进三个栏；放进去的拖到别的栏、别的组，或者拖回左边物品库拿掉。', 'Drag: items go into the three areas; a placed item can be dragged to another area or group, or back to the library to remove it.'],
          ['点：And / Or 点一下就切换；点一样放进去的物品，在画面下方改概率、调先后，或者把它那一组变成「几选一」（直接点那一组的边框也行）。', 'Click: And / Or toggles on a click; click a placed item to change its probability or order below the canvas, or to make its group “choose 1 out of N” (clicking the frame of the group does the same).'],
          ['不拖也行：先点左边的物品，再点要放的栏，或者用画面下方的按钮。', 'No dragging needed: click an item on the left, then the area it goes to, or use the buttons below the canvas.']],
  'note': ['当年想让创作者看得见的，就是这条规则本身：要交什么、能得到什么、几样里给哪样。所以它被画成能摆弄的积木，而不是一张表单。',
           'What creators needed to see was the rule itself: what to hand in, what comes out, which one of several. That is why it is drawn as blocks to move around rather than as a form.'],
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
  'intro': ['点物品库里的物品。纸鹤和红耳机有详情；关系网里的物品可以拖着摆，点一下能顺着线走到另一件。',
            'Click items in the library. The paper crane and the red headphones have a detail view; items in the relationship web can be dragged around, and a click follows a line to the other item.'],
  'how': [['点：纸鹤、红耳机打开详情；其余 32 件原稿没画详情，点了会直说。', 'Click: the paper crane and the red headphones open a detail view; the source drew none for the other 32, and the demo says so.'],
          ['拖：关系网里的物品可以拖到别的位置，连线跟着走。', 'Drag: items in the web can be moved, and the lines follow.'],
          ['顺着线走：在纸鹤的关系网里点红耳机，就到了红耳机；反过来也一样。红色竖条收起或展开右边的详情。', 'Follow a line: click the headphones in the crane’s web to get to the headphones, and back again. The red tab folds the detail panel away or brings it back.']],
  'note': ['一件物品值不值得收，常常取决于它能换成什么、由什么换来。关系网把这层关系画在物品详情里，不用翻配方表。',
           'Whether an item is worth keeping often depends on what it can become and what it comes from. The relationship web shows that inside the item detail, without opening the recipe list.'],
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
  'intro': ['在图上拖一个框，或者直接点一下，写一句话发出去。可以留好几个标记，圆点能拖到别处。',
            'Drag a box on the image, or just click a spot, then write a line and send it. You can leave several markers, and each dot can be dragged somewhere else.'],
  'how': [['拖框或点一下：圈出想说的地方，回复框贴着它弹出来。', 'Drag a box or click: mark the place you mean, and the reply box opens next to it.'],
          ['发送：选区收成一个圆点，带着你写的话；点圆点收起或展开。', 'Send: the area collapses into a dot that carries your line; click the dot to fold or unfold it.'],
          ['来回调：圆点可以拖到别的位置；画面下方的清单能逐个删掉，或者全部清掉。', 'Adjust: a dot can be dragged to another place; the list below the image removes markers one by one, or all at once.']],
  'note': ['创作者审粉丝投稿时，想说的话要落在画面的具体位置上，而不是笼统地说「这张图」。',
           'When a creator reviews a fan submission, a comment should land on a specific place in the image, not on “the picture” in general.'],
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
   <div class="proto__intro"><span class="label label--teal">{t('可以自由操作', 'Free to play with', lang)}</span><h3>{t(*d['title'], lang)}</h3><p>{t(*d['intro'], lang)}</p>
    <ul class="studio__how">{how}</ul></div>
   <div class="studio__right">{_note(t(*d['note'], lang), t('Tobie 的注释', 'Tobie’s note', lang))}
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
<p>{t('当年录屏里的三段交互，2026 年按原稿用代码重做了一遍：没有固定顺序，东西可以随便拖、来回调。原始录屏在下面，可以对照。', 'The three interactions from the original recordings, rebuilt in code in 2026 from the source: no fixed order, and things can be dragged and adjusted freely. The recordings themselves are below for comparison.', lang)}</p>
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
# Commons Fridge: the real working prototype, embedded
# --------------------------------------------------------------------------
FRIDGE_URL = 'https://ideaism.github.io/commons-fridge-functional-v1/'

def fridge_live(lang, anchor):
    routes = [('home', t('首页', 'Home', lang)), ('add', t('放进去', 'Put in', lang)), ('manage', t('查看与处理', 'Check & handle', lang)),
              ('shop', t('买菜之前', 'Before you shop', lang)), ('found', t('发现了东西', 'Found something', lang))]
    buttons = ''.join(f'<button type="button" data-route="{k}" disabled>{v}</button>' for k, v in routes)
    return f'''<section class="proto frame-block" id="{anchor}" data-live="{FRIDGE_URL}" data-component="Live prototype">
{_frame_label(t('The Commons Fridge · 功能原型 v1.8', 'The Commons Fridge · functional prototype v1.8', lang), t('可运行原型', 'Working prototype', lang), 'prov--live', 'fridge')}
<div class="frame frame--canvas"><div class="live">
 <div class="live__phone"><div class="phone"><div class="phone__screen">
  <div class="live__poster"><img src="/assets/work/fridge/cf-home.webp" width="480" height="1062" alt="{t('功能原型首页截图：冰箱前的四个入口', 'Screenshot of the prototype home: four entry points at the fridge', lang)}" loading="lazy"><button type="button" class="btn" data-action="load">▶ {t('在这里运行原型', 'Run the prototype here', lang)}</button></div>
 </div></div></div>
 <div class="proto__side">
  <div class="proto__intro"><span class="label label--teal">{t('真实原型，不是示意', 'The real prototype, not a mock-up', lang)}</span><h3>{t('在冰箱前，只做这一刻需要的事。', 'At the fridge, do only what this moment needs.', lang)}</h3>
   <p>{t('左边运行的是我部署的 v1.8 双语功能原型本身。数据只存在你这台设备的浏览器里，是虚构示例；不会上传，也不会同步给任何人。', 'On the left is the deployed v1.8 bilingual functional prototype itself. Records live only in this browser as fictional examples; nothing is uploaded or shared with anyone.', lang)}</p></div>
  <div><span class="label">{t('直接跳到一个入口', 'Jump to an entry point', lang)}</span><div class="routes">{buttons}</div></div>
  {_note(t('试试“放进去”：选一个计划再保存；然后去“查看与处理”，看看“不确定是谁的”物品为什么不能被随手清掉。', 'Try “Put in”: choose a plan and save it. Then open “Check & handle” and see why a “not sure whose” item cannot simply be cleared.', lang), t('Tobie 的注释', 'Tobie’s note', lang))}
  <div class="proto__tools"><a class="tool-btn" href="{FRIDGE_URL}" target="_blank" rel="noopener">↗ {t('新窗口全屏打开', 'Open full screen', lang)}</a><button type="button" class="tool-btn" data-action="reset-frame" disabled>↺ {t('重新载入', 'Reload', lang)}</button></div>
 </div>
</div>
<p class="proto__prov">{t('嵌入的是公开部署的原型（GitHub Pages），每一屏都标着版本号。', 'Embedded from the public deployment (GitHub Pages); every screen shows its version.', lang)}</p>
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


def section_demo(slug, number, lang):
    """Which demo sits in which case section (1-based)."""
    if slug == 'qingju' and number == 4: return flow('qingju-route', lang, 'try')
    # 2026-11-16：PlayBook 前面插了一节「用户与动线」，Studio 从 02 顺延为 03，App 从 03 顺延为 04
    if slug == 'playbook' and number == 3: return studio_tour(lang, 'try') + live_set(lang) + clips(lang)
    if slug == 'playbook' and number == 4: return flow('playbook-craft', lang, 'try-app')
    if slug == 'smt' and number == 3: return smt_table(lang, 'try')
    if slug == 'commons-fridge' and number == 6: return fridge_live(lang, 'try')   # 2026-11-15：前面插了一节「从研究到功能」，原 05 顺延为 06
    return ''
