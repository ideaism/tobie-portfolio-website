"""Interactive demos built from the ORIGINAL screens.

Rules (docs/design-system.md §5):
  1. A demo only shows screens and states that exist in the source files.
  2. Hotspots sit on the real controls; they never add behaviour the design
     did not specify. Where the source has no next screen, the demo says so.
  3. Notes are Tobie's annotations, visually separate from the product.
  4. Every demo carries a provenance line.

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
  'provenance': ['界面来自 2023–24 PlayBook App 原稿：交互流程与状态为我的 UX，视觉 UI 由另一位设计师完成。热点为作品集添加，未新增任何状态。',
                 'Screens from the 2023–24 PlayBook App source file: flow and states are my UX; the visual UI is by another designer. Hotspots were added for this portfolio; no states were invented.'],
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
  'provenance': ['线框截自 2021 年低保真原型板（本人完成），仅去除了板上的连线箭头；中文为原稿界面语言。高保真由团队完成，未在此演示。',
                 'Screens cut from my 2021 low-fidelity board; only the board’s flow arrows were removed. The interface language is Chinese, as in the source. High fidelity was a team output and is not used here.'],
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
# PlayBook Studio: the three recorded interactions, playable (added 2026-11-15)
#
# Every screen is one still frame of the original recordings (see
# tools/extract_playbook_frames.py). A drag or a tap moves to the frame the
# recording itself reaches next; no state is drawn that the recording lacks.
# Boxes are measured on the 1920×1080 frame and scaled to the exported size.

LIVE_SIZE = [1440, 810]


def _b(x, y, w, h):
    k = LIVE_SIZE[0] / 1920
    return [round(x * k), round(y * k), round(w * k), round(h * k)]


def _live(clip, n):
    return f'/assets/work/playbook/live-{clip}-{n:02d}.webp'


_LIB = {  # item library icons, same place in every editor frame
    'key': _b(30, 364, 140, 140), 'crates': _b(204, 364, 140, 140),
    'charge': _b(30, 540, 140, 140), 'battery': _b(204, 540, 140, 140),
    'gamepad': _b(30, 718, 140, 140), 'pink': _b(204, 718, 140, 140),
    'blue': _b(30, 894, 140, 140), 'yellow': _b(204, 894, 140, 140),
}
_REQUIRE = _b(424, 150, 256, 430)
_MISS_REQ = ['要放进左边第一栏的 Require（必需）。', 'Drop it into Require, the first column on the left.']
_MISS_OUT = ['要放进最右边的 Output（产出）栏。', 'Drop it into Output, the column on the right.']


def _drag(item, label, drop, go, miss):
    return {'box': _LIB[item], 'drop': drop, 'go': go, 'label': label, 'miss': miss}


LIVE_FLOWS = {
 'playbook-recipe': {
  'project': 'playbook', 'size': LIVE_SIZE, 'layout': 'wide',
  'title': ['亲手搭一条合成配方', 'Build a crafting recipe yourself'],
  'intro': ['照当年录屏里的顺序走一遍：建配方、填基本信息、把物品拖进画布。物品可以拖，也可以直接点。',
            'Follow the order of the original recording: create a recipe, fill in the basics, drag items onto the canvas. You can drag an item or simply tap it.'],
  'label': ['PlayBook Studio · 配方编辑', 'PlayBook Studio · Recipe editor'],
  'prov': ['原始录屏的画面', 'Frames from the original recording'],
  'provenance': ['每一屏都是当年录屏里的一帧，界面来自 PlayBook Studio 原稿（UX 与 UI 均为我的工作）。拖动和点击是 2026 年为作品集加的；每一步落到的画面，都是录屏里本来就有的状态，没有新增。',
                 'Every screen is a still frame of the original recording of the PlayBook Studio design (UX and UI are both my work). Dragging and tapping were added in 2026 for this portfolio; each step lands on a state the recording already contains, and nothing was invented.'],
  'start': 'campaign',
  'end': ['录屏到这里结束：一条带「三选一」和概率的配方搭好了。', 'The recording ends here, with a recipe that has a “choose 1 of 3” group and probabilities.'],
  'screens': {
   'campaign': {'src': _live('recipe', 0), 'step': ['活动页', 'Campaign'],
     'alt': ['PlayBook Studio 活动页，右侧「合成配方」栏里只有一个 Create 按钮', 'PlayBook Studio campaign page; the Crafting Recipes panel holds a single Create button'],
     'note': ['从活动页开始。「合成配方」这一栏还是空的，只有一个入口。', 'It starts on the campaign page. The Crafting Recipes panel is still empty, with one way in.'],
     'next': ['点右边「Crafting Recipes」栏里的 Create。', 'Tap Create in the Crafting Recipes panel on the right.'],
     'hotspots': [{'box': _b(1548, 896, 164, 44), 'go': 'form', 'label': ['Create（新建配方）', 'Create (new recipe)']}]},
   'form': {'src': _live('recipe', 1), 'step': ['基本信息', 'Basics'],
     'alt': ['新建合成配方的基本信息表单，各项都还是空的', 'The Basic Information form for a new crafting recipe, still empty'],
     'note': ['进画布之前，先给配方起名字，选它属于哪个活动、什么时候截止。', 'Before the canvas, the recipe gets a name, a campaign and a time limit.'],
     'next': ['点最上面的名称输入框，填上录屏里的内容。', 'Tap the name field at the top to fill in what the recording typed.'],
     'hotspots': [
       {'box': _b(372, 240, 900, 48), 'go': 'filled', 'label': ['配方名称输入框', 'Recipe name field']},
       {'box': _b(1400, 1012, 116, 48), 'label': ['Next（还没填）', 'Next (nothing filled in yet)'],
        'note': ['录屏里是填完才点 Next。先点上面的名称输入框。', 'In the recording, Next comes after the form is filled in. Tap the name field first.']}]},
   'filled': {'src': _live('recipe', 2), 'step': ['填好了', 'Filled in'],
     'alt': ['基本信息表单已填写：名称 ABC、编号 123、一段说明和一张封面图', 'The form filled in: name ABC, ID 123, a description and a cover image'],
     'note': ['名称、编号、说明和封面都填上了。', 'Name, ID, description and cover are in.'],
     'next': ['点右下角的 Next，进入配方画布。', 'Tap Next at the bottom right to open the recipe canvas.'],
     'hotspots': [{'box': _b(1400, 1010, 116, 50), 'go': 'empty', 'label': ['Next', 'Next']}]},
   'empty': {'src': _live('recipe', 3), 'step': ['空画布', 'Empty canvas'],
     'alt': ['配方编辑器：左侧物品库，右侧 Input、Condition、Output 三栏都是空的', 'Recipe editor: item library on the left; Input, Condition and Output columns all empty'],
     'note': ['左边是物品库，右边三栏：输入、条件、产出。输入又分成「必需」和「可选」。', 'The item library is on the left; on the right are three columns: input, condition and output. Input is split into Require and Optional.'],
     'next': ['把 Crates（宝箱）拖进 Require 栏，或者直接点它。', 'Drag Crates into Require, or just tap it.'],
     'hotspots': [_drag('crates', ['Crates（宝箱）', 'Crates'], _REQUIRE, 'crate', _MISS_REQ)]},
   'crate': {'src': _live('recipe', 4), 'step': ['放入宝箱', 'Crate in'],
     'alt': ['Require 栏里有了一个宝箱', 'Require now holds a crate'],
     'note': ['宝箱进了必需栏：粉丝合成时必须交出它。', 'The crate is in Require: fans must hand it over to craft.'],
     'next': ['再把 Key（钥匙）拖进 Require 栏。', 'Now drag Key into Require.'],
     'hotspots': [_drag('key', ['Key（钥匙）', 'Key'], _REQUIRE, 'key', _MISS_REQ)]},
   'key': {'src': _live('recipe', 5), 'step': ['放入钥匙', 'Key in'],
     'alt': ['Require 栏里有宝箱和钥匙', 'Require holds a crate and a key'],
     'note': ['两样必需材料齐了。接下来定义能得到什么。', 'Both required materials are in. Next: what the fan gets.'],
     'next': ['把 Gamepad（手柄）拖进最右边的 Output 栏。', 'Drag Gamepad into Output, on the far right.'],
     'hotspots': [_drag('gamepad', ['Gamepad（手柄）', 'Gamepad'], _b(1640, 80, 250, 820), 'gamepad', _MISS_OUT)]},
   'gamepad': {'src': _live('recipe', 6), 'step': ['产出手柄', 'Gamepad out'],
     'alt': ['Output 栏里有一个手柄，标着 100%', 'Output holds a gamepad marked 100%'],
     'note': ['手柄进了产出，概率是 100%。', 'The gamepad is an output, at 100%.'],
     'next': ['把 Pink Paint（粉色颜料）也拖进 Output。', 'Drag Pink Paint into Output as well.'],
     'hotspots': [_drag('pink', ['Pink Paint（粉色颜料）', 'Pink Paint'], _b(1510, 80, 380, 820), 'pink', _MISS_OUT)]},
   'pink': {'src': _live('recipe', 7), 'step': ['加粉色颜料', 'Pink paint'],
     'alt': ['手柄和粉色颜料之间出现 And，颜料标着 10%', 'An And appears between the gamepad and the pink paint, which is marked 10%'],
     'note': ['第二样产出和手柄之间自动连上了 And：两样都给。颜料的概率是 10%。', 'The second output is joined to the gamepad with And: both are given. The paint is at 10%.'],
     'next': ['把物品库最下面一排左边的 Blue Paint（蓝色颜料）拖进 Output。', 'Drag Blue Paint, bottom left of the library, into Output.'],
     'hotspots': [_drag('blue', ['Blue Paint（蓝色颜料）', 'Blue Paint'], _b(1305, 80, 585, 820), 'blue', _MISS_OUT)]},
   'blue': {'src': _live('recipe', 8), 'step': ['加蓝色颜料', 'Blue paint'],
     'alt': ['粉色和蓝色颜料上下排列，中间是 Or', 'Pink and blue paint stacked, with Or between them'],
     'note': ['两种颜料上下排在一起，之间是 Or。', 'The two paints stack, with Or between them.'],
     'next': ['把旁边的 Yellow Paint（黄色颜料）也拖进 Output。', 'Drag Yellow Paint, next to it, into Output too.'],
     'hotspots': [_drag('yellow', ['Yellow Paint（黄色颜料）', 'Yellow Paint'], _b(1315, 80, 575, 820), 'yellow', _MISS_OUT)]},
   'yellow': {'src': _live('recipe', 9), 'step': ['加黄色颜料', 'Yellow paint'],
     'alt': ['三种颜料排成一组，各标着 10%', 'Three paints form a group, each marked 10%'],
     'note': ['三种颜料成了一组，各 10%。', 'The three paints form a group, 10% each.'],
     'next': ['把 Normal Battery（电池）拖进 Output。', 'Drag Normal Battery into Output.'],
     'hotspots': [_drag('battery', ['Normal Battery（电池）', 'Normal Battery'], _b(1310, 80, 580, 820), 'battery', _MISS_OUT)]},
   'battery': {'src': _live('recipe', 10), 'step': ['加电池', 'Battery'],
     'alt': ['颜料组后面接上了电池，标着 80%', 'A battery follows the paint group, marked 80%'],
     'note': ['电池接在颜料组后面，概率 80%。', 'The battery follows the paint group, at 80%.'],
     'next': ['把 Super Charge（增压器）拖进 Output。', 'Drag Super Charge into Output.'],
     'hotspots': [_drag('charge', ['Super Charge（增压器）', 'Super Charge'], _b(1110, 80, 780, 820), 'charge', _MISS_OUT)]},
   'charge': {'src': _live('recipe', 11), 'step': ['加增压器', 'Supercharger'],
     'alt': ['电池和增压器之间是 Or，分别标着 80% 和 20%', 'Or sits between the battery and the supercharger, marked 80% and 20%'],
     'note': ['电池和增压器之间是 Or：80% 对 20%，二选一。', 'Or sits between battery and supercharger: 80% against 20%, one or the other.'],
     'next': ['点中间那一组三种颜料。', 'Tap the group of three paints in the middle.'],
     'hotspots': [{'box': _b(1250, 180, 150, 610), 'go': 'choose', 'label': ['三种颜料这一组', 'The group of three paints']}]},
   'choose': {'src': _live('recipe', 12), 'step': ['三选一', 'Choose 1 of 3'],
     'alt': ['颜料组顶上出现 Choose 1 Out Of 3，三个 10% 标签消失', 'The paint group is now headed Choose 1 Out Of 3 and the three 10% tags are gone'],
     'note': ['这一组变成了 Choose 1 Out Of 3：三种颜料里给一种，不再各算各的概率。', 'The group became Choose 1 Out Of 3: one of the three paints is given, instead of each having its own odds.'],
     'next': ['点手柄右边的 And。', 'Tap the And to the right of the gamepad.'],
     'hotspots': [{'box': _b(1145, 478, 72, 48), 'go': 'or1', 'label': ['手柄右边的 And', 'The And next to the gamepad']}]},
   'or1': {'src': _live('recipe', 13), 'step': ['改成 Or', 'And to Or'],
     'alt': ['手柄和颜料组之间的 And 变成了 Or', 'The And between the gamepad and the paint group is now Or'],
     'note': ['手柄和颜料组之间，从「都给」变成了「给其中一样」。', 'Between the gamepad and the paint group, “both” became “one of them”.'],
     'next': ['再点颜料组右边的 And。', 'Now tap the And to the right of the paint group.'],
     'hotspots': [{'box': _b(1407, 478, 72, 48), 'go': 'or2', 'label': ['颜料组右边的 And', 'The And after the paint group']}]},
   'or2': {'src': _live('recipe', 14), 'step': ['配方完成', 'Done'],
     'alt': ['完成的配方：手柄 Or 三选一颜料组 Or 电池与增压器', 'The finished recipe: gamepad Or the choose-one paint group Or battery and supercharger'],
     'note': ['整条规则从左到右读得出来：交出宝箱和钥匙，得到手柄，或三种颜料之一，或电池与增压器之一。', 'The whole rule reads left to right: hand in a crate and a key, get the gamepad, or one of three paints, or one of battery and supercharger.'],
     'next': ['这是录屏的最后一帧。点右下角的 Upload 收尾。', 'This is the last frame of the recording. Tap Upload at the bottom right to finish.'],
     'hotspots': [{'box': _b(1728, 960, 164, 48), 'go': '@end', 'label': ['Upload', 'Upload']}]},
  },
 },
 'playbook-items': {
  'project': 'playbook', 'size': LIVE_SIZE, 'layout': 'wide',
  'title': ['点开一件物品，看它连着什么', 'Open an item and see what it connects to'],
  'intro': ['从活动页进物品库，点开一件物品。原稿里只给纸鹤和红耳机做了详情，其余物品点了没有下一屏。',
            'Go from the campaign page into the item library and open an item. Only the paper crane and the red headphones have a detail view in the source; other items lead nowhere.'],
  'label': ['PlayBook Studio · 物品与关系网', 'PlayBook Studio · Items and their relationship web'],
  'prov': ['原始录屏的画面', 'Frames from the original recording'],
  'provenance': ['每一屏都是当年录屏里的一帧，界面来自 PlayBook Studio 原稿（UX 与 UI 均为我的工作）。热点只放在录屏里真的点过的控件上，没有新增状态。',
                 'Every screen is a still frame of the original recording of the PlayBook Studio design (UX and UI are both my work). Hotspots sit only on controls the recording actually uses; no states were invented.'],
  'start': 'campaign', 'end': None,
  'screens': {
   'campaign': {'src': _live('items', 0), 'step': ['活动页', 'Campaign'],
     'alt': ['PlayBook Studio 活动页，中间一栏是 Item Rewards 物品列表', 'PlayBook Studio campaign page with the Item Rewards list in the middle'],
     'note': ['活动页上，物品只露出一小部分。', 'On the campaign page only some of the items are visible.'],
     'next': ['点「Item Rewards」标题右边的展开图标。', 'Tap the expand icon to the right of the Item Rewards title.'],
     'hotspots': [{'box': _b(1262, 442, 48, 48), 'go': 'library', 'label': ['展开物品列表', 'Expand the item list']}]},
   'library': {'src': _live('items', 1), 'step': ['物品库', 'Library'],
     'alt': ['物品库页面，标题写着 You Have 2093 Results', 'The item library, headed You Have 2093 Results'],
     'note': ['展开以后是这个活动的全部物品，页面上写着 2093 件。', 'Expanded, it lists every item in the campaign: 2093, the page says.'],
     'next': ['点第一排的纸鹤（第三个）。', 'Tap the paper crane, third in the first row.'],
     'hotspots': [
       {'box': _b(548, 224, 72, 72), 'go': 'crane', 'label': ['纸鹤', 'Paper crane']},
       {'box': _b(730, 224, 72, 72), 'go': 'phones', 'label': ['红耳机', 'Red headphones']},
       {'box': _b(376, 78, 84, 40), 'go': 'campaign', 'label': ['返回活动页（Lofi Girls）', 'Back to the campaign (Lofi Girls)']},
       {'box': _b(280, 316, 1560, 76), 'label': ['第二排的物品', 'Items in the second row'],
        'note': ['原稿里只给纸鹤和红耳机做了详情，其余物品点了没有下一屏。', 'Only the paper crane and the red headphones have a detail view in the source; the other items lead nowhere.']}]},
   'crane': {'src': _live('items', 2), 'step': ['纸鹤', 'Paper crane'],
     'alt': ['纸鹤的详情：三档价格和一张关系网', 'Paper crane detail: three price tiers and a relationship web'],
     'note': ['右边出现详情：三档价格各有进度；下面的「关系网」画出这件物品和哪些物品连着。', 'Details appear on the right: three price tiers, each with its progress. The relationship web below shows which items this one is linked to.'],
     'next': ['再点红耳机（纸鹤右边第二个），看另一件的关系网。', 'Now tap the red headphones, two to the right, to see another web.'],
     'hotspots': [
       {'box': _b(730, 224, 72, 72), 'go': 'phones', 'label': ['红耳机', 'Red headphones']},
       {'box': _b(376, 78, 84, 40), 'go': 'campaign', 'label': ['返回活动页（Lofi Girls）', 'Back to the campaign (Lofi Girls)']}]},
   'phones': {'src': _live('items', 3), 'step': ['红耳机', 'Headphones'],
     'alt': ['红耳机的详情：三档价格和一张更密的关系网', 'Red headphones detail: three price tiers and a denser relationship web'],
     'note': ['红耳机的关系网更密，连着更多物品。', 'The headphones have a denser web, linked to more items.'],
     'next': ['点左上角的 Lofi Girls 回到活动页。', 'Tap Lofi Girls at the top left to return to the campaign.'],
     'hotspots': [
       {'box': _b(548, 224, 72, 72), 'go': 'crane', 'label': ['纸鹤', 'Paper crane']},
       {'box': _b(376, 78, 84, 40), 'go': 'campaign', 'label': ['返回活动页（Lofi Girls）', 'Back to the campaign (Lofi Girls)']}]},
  },
 },
 'playbook-comments': {
  'project': 'playbook', 'size': LIVE_SIZE, 'layout': 'wide',
  'title': ['把意见落在画面的具体位置上', 'Pin a comment to a place on the image'],
  'intro': ['创作者审粉丝投稿时，在图上框出一处、写一句话。电脑上可以自己拖框、打字；窄屏上直接点图，按录屏里的那一处走。',
            'When a creator reviews a fan submission, they mark an area and write a line. On a wide screen you can draw your own box and type; on a narrow one, tap the image to follow the spot used in the recording.'],
  'label': ['PlayBook Studio · 二创投稿的评论', 'PlayBook Studio · Commenting on a remix submission'],
  'prov': ['原始录屏的画面 · 三个部件按原稿复刻', 'Frames from the original recording · three components rebuilt'],
  'provenance': ['底图和各步画面是当年录屏里的帧，界面来自 PlayBook Studio 原稿（UX 与 UI 均为我的工作）。自己拖框时出现的选框、回复框和圆点标记，是 2026 年按原稿复刻的：回复框直接取自录屏画面，位置和你输入的文字随你的操作变化。',
                 'The image and each step are frames of the original recording of the PlayBook Studio design (UX and UI are both my work). When you draw your own box, the selection, the reply box and the marker are rebuilt in 2026 from the source: the reply box is taken straight from the recording, while its position and the text follow what you do.'],
  'start': 'clean', 'end': None,
  'draw': {
    'base': [1920, 1080], 'src': _live('comments', 1),
    'dialog': [628, 688, 424, 286], 'field': [640, 820, 400, 100], 'send': [976, 934, 66, 28], 'cancel': [896, 934, 60, 28],
    'avatar': [638, 778, 28, 28], 'gap': [24, 16], 'pin': 24, 'colour': '#486CFF', 'who': 'Lofi girl (you)',
    'placeholder': 'Add Comments',
    'field_label': ['回复内容', 'Your reply'], 'send_label': ['Send（发送）', 'Send'], 'cancel_label': ['Cancel（取消）', 'Cancel'],
    'pin_label': ['你留下的标记，点开看留言', 'Your marker; tap to read the comment'],
    'sent': ['你框的那一处收成了一个圆点，留言跟着它。这三个部件是按原稿复刻的。', 'The area you marked collapsed into a dot that carries your comment. These three components are rebuilt from the source.'],
    'sent_next': ['点圆点可以收起或展开留言；再拖一个框可以重来。', 'Tap the dot to hide or show the comment; draw another box to start again.'],
  },
  'screens': {
   'clean': {'src': _live('comments', 0), 'step': ['投稿页', 'Submission'],
     'alt': ['一张粉丝投稿的大图，右侧是按版本排列的留言栏', 'A large fan submission image with a comment panel on the right, grouped by revision'],
     'note': ['创作者在审一张粉丝投稿。想说的话要落在画面的具体位置上，而不是笼统地说「这张图」。', 'A creator is reviewing a fan submission. A comment should land on a specific place in the image, not on “the picture” in general.'],
     'next': ['在图上拖出一个框，圈出想说的地方。窄屏上直接点图。', 'Drag a box on the image around the area you mean. On a narrow screen, just tap the image.'],
     'hotspots': [{'box': _b(64, 232, 1366, 788), 'go': 'reply', 'draw': True, 'label': ['在图上框选一处', 'Mark an area on the image']}]},
   'reply': {'src': _live('comments', 1), 'step': ['写回复', 'Reply'],
     'alt': ['图上有一个蓝色选框，旁边弹出 Reply 回复框', 'A blue selection on the image with a Reply box next to it'],
     'note': ['框选以后，回复框贴着选区弹出来：写的是这一处，不是整张图。', 'After marking, the reply box opens next to the selection: the comment is about this area, not the whole image.'],
     'next': ['点回复框右下角的 Send。', 'Tap Send at the bottom right of the reply box.'],
     'hotspots': [
       {'box': _b(964, 924, 90, 44), 'go': 'bubble', 'label': ['Send（发送）', 'Send']},
       {'box': _b(880, 924, 80, 44), 'go': 'clean', 'label': ['Cancel（取消）', 'Cancel']}]},
   'bubble': {'src': _live('comments', 2), 'step': ['留下标记', 'Marker'],
     'alt': ['选区收成一个蓝色圆点，旁边的气泡显示留言', 'The selection has become a blue dot with a bubble showing the comment'],
     'note': ['发出以后，选区收成一个圆点，旁边带着刚写的那句话。', 'Once sent, the selection collapses into a dot that carries the line just written.'],
     'next': ['点图上别的地方，气泡收起来。', 'Tap elsewhere on the image and the bubble closes.'],
     'hotspots': [{'box': _b(64, 232, 1366, 380), 'go': 'pin', 'label': ['图上别的地方', 'Elsewhere on the image']}]},
   'pin': {'src': _live('comments', 3), 'step': ['只留圆点', 'Dot only'],
     'alt': ['图上只剩一个蓝色圆点', 'Only a blue dot remains on the image'],
     'note': ['圆点留在图上，不挡画面。右边的留言栏按版本归档。', 'The dot stays on the image without covering it. The panel on the right files comments by revision.'],
     'next': ['点圆点可以再看一次留言。', 'Tap the dot to read the comment again.'],
     'hotspots': [{'box': _b(596, 668, 52, 52), 'go': 'bubble', 'label': ['圆点标记', 'The marker']}]},
  },
 },
}
FLOWS.update(LIVE_FLOWS)


def live_set(lang):
    """The three playable recordings, one visible at a time."""
    tabs = [('playbook-recipe', t('配方编辑', 'Recipe editor', lang)), ('playbook-items', t('物品交互', 'Item interaction', lang)), ('playbook-comments', t('评论交互', 'Comment interaction', lang))]
    buttons = ''.join(f'<button type="button" data-live-tab="{k}" aria-pressed="{str(n == 0).lower()}">{label}</button>' for n, (k, label) in enumerate(tabs))
    panels = ''.join(f'<div data-live-panel="{k}" {"hidden" if n else ""}>{flow(k, lang, "try-" + k.split("-")[1])}</div>' for n, (k, label) in enumerate(tabs))
    return f'''<div class="liveset" data-liveset data-component="Playable recordings">
<div class="liveset__head"><span class="label label--teal">{t('亲手试', 'Try it', lang)}</span>
<p>{t('当年录屏里的三段交互，现在可以自己做一遍。原始录屏在下面，可以对照。', 'The three interactions from the original recordings, now playable. The recordings themselves are below for comparison.', lang)}</p>
<div class="clips__tabs" role="group" aria-label="{t('选择一段交互', 'Choose an interaction', lang)}">{buttons}</div></div>
{panels}</div>'''


def _pct(box, W, H):
    return {'x': box[0] / W * 100, 'y': box[1] / H * 100, 'w': box[2] / W * 100, 'h': box[3] / H * 100}


def _hot(h, W, H, lang):
    d = {**_pct(h['box'], W, H), 'go': h.get('go'), 'label': t(*h['label'], lang), 'note': t(*h['note'], lang) if 'note' in h else None}
    if 'drop' in h:   # a drag: `box` is the thing picked up, `drop` is where it has to land
        d['drop'] = _pct(h['drop'], W, H)
        d['miss'] = t(*h['miss'], lang)
    if h.get('draw'):  # a region the visitor can draw a selection in
        d['draw'] = True
    return d


def flow(key, lang, anchor):
    f = FLOWS[key]
    W, H = f['size']
    screens_html = ''
    data = {'start': f['start'], 'screens': {}, 'end': f['end'][0 if lang == 'zh' else 1] if f['end'] else None,
            'labels': {'restart': t('重新开始', 'Restart', lang), 'hint': t('显示可点区域', 'Show tap targets', lang)}}
    if 'draw' in f:
        dr = f['draw']
        data['draw'] = {k: dr[k] for k in ('base', 'src', 'dialog', 'field', 'send', 'cancel', 'avatar', 'gap', 'pin', 'colour', 'who', 'placeholder')}
        for k in ('field_label', 'send_label', 'cancel_label', 'pin_label', 'sent', 'sent_next'):
            data['draw'][k] = t(*dr[k], lang)
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
    wide = f.get('layout') == 'wide'   # a desktop screen instead of a phone
    do = f'<button type="button" class="btn btn--small proto__do" data-action="do">{t("照做这一步", "Do this step", lang)} →</button>' if wide else ''
    device = (f'<div class="proto__device"><div class="window">{inner}</div></div>' if wide else
              f'<div class="proto__device"><div class="phone"><div class="phone__screen">{inner}</div></div></div>')
    return f'''<section class="proto frame-block" id="{anchor}"{' data-layout="wide"' if wide else ''} data-proto="{_json(data)}" data-component="Prototype player">
{_frame_label(t(*f['label'], lang), t(*f['prov'], lang), '', f['project'])}
<div class="frame frame--canvas">
 <div class="proto__stage">
  {device}
  <div class="proto__side">
   <div class="proto__intro"><span class="label label--teal">{t('可操作原型', 'Try it', lang)}</span><h3>{t(*f['title'], lang)}</h3><p>{t(*f['intro'], lang)}</p></div>
   <ol class="rail" aria-label="{t('原型步骤', 'Prototype steps', lang)}">{rail}</ol>
   {_note(t(*first['note'], lang), t('Tobie 的注释', 'Tobie’s note', lang))}
   <p class="proto__next" data-next>{t(*first['next'], lang)}</p>{do}
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
<p class="proto__prov">{t('界面来自 PlayBook Studio 原稿（UX 与 UI 均为我的工作）。导览只移动视角并加注释，没有改变界面内容；这是确定性的规则编辑，不是 AI 工作流。', 'Screen from the PlayBook Studio source file (UX and UI are my work). The tour only pans and annotates; the interface itself is unchanged. This is deterministic rule editing, not an AI workflow.', lang)}</p>
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
<p class="proto__prov">{t('这是“表格 / 账户持仓”组件的代码复刻：列、数值、颜色（涨红 #DF3537、跌绿 #1D9920、选中 #F1F4FF、悬停 #E5E6E9）与行高均取自原稿截图；数值为原稿示例数据，不连接任何账户或行情。原稿中搜索框的行为未在组件里定义，因此这里只保留外观。', 'A code replica of the “Table / Account Positions” component: columns, values, colours (gain red #DF3537, loss green #1D9920, selected #F1F4FF, hover #E5E6E9) and row height are taken from the source screenshots. Values are the source file’s sample data; nothing connects to an account or market feed. The search field’s behaviour is not defined in the component, so only its appearance is kept.', lang)}</p>
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
<p class="proto__prov">{t('嵌入的是公开部署的原型（GitHub Pages）。原型自身在每一屏标注版本与“研究者自测”说明；它证明流程可以运行，不代表使用率或减少浪费的效果。', 'Embedded from the public deployment (GitHub Pages). The prototype labels its version and its researcher self-test status on every screen; it shows that the flow runs, not adoption or reduced waste.', lang)}</p>
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
    if slug == 'playbook' and number == 2: return studio_tour(lang, 'try') + live_set(lang) + clips(lang)
    if slug == 'playbook' and number == 3: return flow('playbook-craft', lang, 'try-app')
    if slug == 'smt' and number == 3: return smt_table(lang, 'try')
    if slug == 'commons-fridge' and number == 6: return fridge_live(lang, 'try')   # 2026-11-15：前面插了一节「从研究到功能」，原 05 顺延为 06
    return ''
