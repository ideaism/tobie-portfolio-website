"""PlayBook 04, the campaign drafting assistant (交接单 02-playbook/portfolio/handoff.md 第 4 节 ⑤；2026-11-24 ⑧ 从 11 挪到 04).

A new design concept from 2026, not one of the three rebuilds that docs/design-system.md rule 8 covers.
Run: python3 -m unittest discover tests
"""
import json
import re
import shutil
import subprocess
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from prototypes import CONCEPT, DRAFT_DATA, DRAFTER, REBUILT, REBUILT_TAG, STUDIO, draft_data, section_demo  # noqa: E402
from cases import CASES  # noqa: E402


class DrafterTests(unittest.TestCase):
    def test_data_comes_from_the_one_file_in_02_playbook(self):
        self.assertEqual(DRAFT_DATA.parent.parent.name, '02-playbook')
        self.assertTrue(DRAFT_DATA.is_file(), DRAFT_DATA)
        self.assertEqual(draft_data(), json.loads(DRAFT_DATA.read_text(encoding='utf-8')))
        self.assertFalse(list((ROOT).glob('**/ai-起草助手-数据*.json')), 'no copy of the data inside the website repo')

    def test_items_referenced_and_odds_add_up(self):
        d = draft_data()
        self.assertEqual(len(d['drafts']), 3)
        self.assertEqual(len(d['checks']), 5)
        self.assertEqual(len(d['constraints']), 3)
        for dr in d['drafts']:
            ids = [i['id'] for i in dr['items']]
            self.assertEqual(len(ids), len(set(ids)), dr['id'])
            for task in dr['tasks']:
                self.assertIn(task['reward']['item'], ids, f'{dr["id"]}: mission {task["id"]}')
                self.assertIn(task['frequency']['kind'], ('once', 'daily', 'friday_only'))
                self.assertTrue(1 <= task['reward']['qty'] <= 9)
            for r in dr['recipes']:
                for m in r['require'] + r['optional'] + r['output']['items']:
                    self.assertIn(m['item'], ids, f'{dr["id"]}: recipe {r["id"]}')
                self.assertEqual(sum(o['pct'] for o in r['output']['items']), 100, f'{dr["id"]}: recipe {r["id"]}')
                lim = STUDIO['playbook-recipe']['limits']
                self.assertLessEqual(len(r['require']), lim['require'])
                self.assertLessEqual(len(r['optional']), lim['optional'])
                self.assertLessEqual(len(r['output']['items']), lim['group'])
            self.assertTrue(set(dr['home_platforms']))

    def test_score_matches_the_data(self):
        d = draft_data()
        s = d['score']
        self.assertEqual((s['drafts'], s['checks'], s['passed']), (len(d['drafts']), len(d['drafts']) * len(d['checks']), len(d['drafts']) * len(d['checks'])))
        self.assertEqual(DRAFTER['score_text'][0], '三份草案 × 五条检查 = 十五项，全部通过')
        for lang, n in (('zh', 0), ('en', 1)):
            html = section_demo('playbook', 4, lang)
            for c in d['checks']:
                self.assertIn(c['label'][lang], html)
            self.assertIn(DRAFTER['score_text'][n], html)

    def test_says_it_is_a_new_design_concept_not_a_rebuild(self):
        self.assertEqual(CONCEPT, ['2026 年新做的设计示意', 'New design concept, 2026'])
        for lang, n in (('zh', 0), ('en', 1)):
            html = section_demo('playbook', 4, lang)
            self.assertEqual(html.count('class="proto frame-block"'), 1)
            self.assertIn(f'<p class="proto__prov">{CONCEPT[n]}</p>', html)
            self.assertIn(f'<span class="prov ">{CONCEPT[n]}</span>', html)
            self.assertNotIn(REBUILT[n], html)
            self.assertNotIn(REBUILT_TAG[n], html)
            # 2026-11-25（交接单 ⑨）：双击配方时才由 JS 建一个 recipeLab，页面里不写死 data-studio（03 节的三个演示照旧是那三个）
            self.assertNotIn('data-studio', html, 'the editor is built on double-click, not in the markup')
            self.assertNotIn('http', html, 'nothing is loaded from anywhere')

    def test_section_04_right_after_studio_and_the_only_one_with_it(self):
        # 2026-11-24（交接单 ⑧）：从最后一节挪到 03 Studio 后面，原 04–10 顺延为 05–11
        secs = CASES['playbook']['sections']
        self.assertEqual(len(secs), 11)
        self.assertEqual(secs[3]['label'], ['04 / 活动起草助手', '04 / Campaign drafting assistant'])
        self.assertEqual(secs[3]['sub'], ['Studio 上线后补的设计，没有上线。', 'Designed after Studio launched; not shipped.'])
        self.assertEqual(len(secs[3]['text']), 5)
        self.assertTrue(secs[2]['label'][1].startswith('03 / '))
        self.assertTrue(secs[4]['label'][0].startswith('05 / '))
        for i, s in enumerate(secs, 1):   # 节号连着，中英文一致
            self.assertTrue(s['label'][0].startswith(f'{i:02d} / '), s['label'])
            self.assertTrue(s['label'][1].startswith(f'{i:02d} / '), s['label'])
        self.assertNotIn('2026 回看', ''.join(s['label'][0] for s in secs))
        for n in range(1, len(secs) + 2):
            has = 'data-drafter' in section_demo('playbook', n, 'zh')
            self.assertEqual(has, n == 4, n)
        for lang, path in (('zh', 'work'), ('en', 'en/work')):
            page = (ROOT / 'dist' / path / 'playbook' / 'index.html').read_text(encoding='utf-8')
            self.assertEqual(page.count('class="meta case-sub"'), 1, lang)

    def test_studio_window_is_decoration_only(self):
        # 交接单 ⑩ 起：Campaign 后面的「+」是真按钮（窄屏时在顶栏字标右边）；⑪ 起侧边栏的 Campaign 字样也是按钮（回活动列表），
        # 下面一级活动名是按钮（回活动页），开局藏着；顶栏右边 Pro Mode、铃铛、头像和名字是装饰。别的还是装饰
        for lang in ('zh', 'en'):
            html = section_demo('playbook', 4, lang)
            self.assertEqual(html.count('class="sk"'), 1)
            side = re.search(r'<div class="sk__side">(.*?)</div>', html, re.S)
            top = re.search(r'<div class="sk__top">(.*?)</div>', html, re.S)
            self.assertTrue(side and top, lang)
            for part, where in ((side.group(1), 'side'), (top.group(1), 'top')):
                self.assertNotIn('<a', part)
                self.assertNotIn('tabindex', part)
                self.assertEqual(re.findall(r'<button[^>]*data-new="(\w+)"', part), [where])
            self.assertEqual(top.group(1).count('<button'), 1)
            self.assertEqual(side.group(1).count('<button'), 3)
            self.assertIn('<button type="button" class="sk__deco" data-list>', side.group(1))
            self.assertIn('<button type="button" class="sk__sub" data-sub hidden></button>', side.group(1))
            label = DRAFTER['t']['new'][0 if lang == 'zh' else 1]
            self.assertEqual(html.count(f'aria-label="{label}"'), 2)
            items = re.findall(r'<span class="sk__item" data-nav="(\w+)"([^>]*)>', side.group(1))
            for k, attrs in items:
                self.assertEqual('aria-hidden="true"' in attrs, k != 'campaign', k)
            self.assertIn('<span class="sk__foot" aria-hidden="true">', html)
            self.assertIn('<span class="sk__search" aria-hidden="true">', top.group(1))
            who = DRAFTER['t']['creator'][0 if lang == 'zh' else 1]
            self.assertIn('<span class="sk__me" aria-hidden="true"><span class="sk__pro">Pro Mode', top.group(1))
            self.assertIn(f'<span class="sk__name" data-who>{who}</span>', top.group(1))
            for name in ('Dashboard', 'Campaign', 'Items', 'Craft Recipes', 'Missions', 'PlayBook Remix', 'My Creator Economy'):
                self.assertIn(f'<span>{name}</span>', side.group(1))   # 中英文页都用英文，照原稿
            self.assertEqual(side.group(1).count('data-on'), 1)
            self.assertIn('Search Items / Recipes / Missions / Campaigns / Tags / Public Resources', top.group(1))
            page = html.split('<div class="sk__page">', 1)[1]
            self.assertIn('data-goals', page)
            self.assertIn('data-draft', page)
            self.assertNotIn('data-status', page.split('</div></div>', 1)[0])

    def test_red_lines(self):
        s = CASES['playbook']['sections'][3]
        zh = ''.join(p[0] for p in s['text']) + s['title'][0]
        for word in ('链上', 'Web3', '验证过', '提升了效率', '用户测试'):
            self.assertNotIn(word, zh)
        page = (ROOT / 'dist' / 'work' / 'playbook' / 'index.html').read_text(encoding='utf-8')
        self.assertNotIn('链上', page)

    def test_every_item_has_its_picture(self):
        # 2026-11-18（交接单 ⑥）：17 张物品图，地址由草案 id + 物品 id 拼出来；和 tools/prepare_assets.py 的 JOBS 一一对应
        sys.path.insert(0, str(ROOT / 'tools'))
        import prepare_assets
        from prototypes import DRAFTER_ITEM_SRC
        manifest = json.loads((ROOT / 'dist' / 'assets' / 'work' / 'manifest.json').read_text(encoding='utf-8'))
        want = set()
        for dr in draft_data()['drafts']:
            for i in dr['items']:
                name = f'playbook/drafter-items/{dr["id"]}-{i["id"]}'
                want.add(name)
                src = DRAFTER_ITEM_SRC.format(draft=dr['id'], item=i['id'])
                self.assertEqual(src, f'/assets/work/{name}.webp')
                self.assertTrue((ROOT / 'dist' / src.lstrip('/')).is_file(), src)
                self.assertIn(name, manifest)
        self.assertEqual(len(want), 17)
        self.assertEqual({k for k in prepare_assets.JOBS if k.startswith('playbook/drafter-items/')}, want)
        for lang in ('zh', 'en'):
            cfg = section_demo('playbook', 4, lang)
            self.assertIn('drafter-items', cfg)
        note = DRAFTER['t']['items_note']
        self.assertEqual(note, ['物品图是用 Codex 生成的示意图，照 03 节 Studio 图标的风格画的。',
                                'Item art was generated with Codex as illustration, drawn to match the Studio icons in section 03.'])
        js = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
        art = js[js.index('const itemArt'):js.index('return im;', js.index('const itemArt'))]
        for must in ("im.alt = ''", "setAttribute('aria-hidden', 'true')", "im.loading = 'lazy'"):
            self.assertIn(must, art)

    def test_double_click_opens_the_recipe_editor(self):
        # 2026-11-25（交接单 ⑨，卡 20261125-002）：去掉「放上画布」和只读三栏；双击配方在 03 节同一个配方编辑器里打开
        from prototypes import SKIN_NAV, _drafter_config, _studio_config
        self.assertEqual(DRAFTER['t']['open_hint'], ['双击配方，在编辑器里打开', 'Double-click a recipe to open it in the editor'])
        self.assertEqual(DRAFTER['t']['back'], ['回到活动', 'Back to campaign'])   # ⑪：编辑器是从活动页打开的
        for k in ('place', 'placed', 'h_canvas', 'canvas_ro', 'canvas_empty', 'canvas_gone', 'said_placed'):
            self.assertNotIn(k, DRAFTER['t'])
        recipe = STUDIO['playbook-recipe']
        for lang in ('zh', 'en'):
            html = section_demo('playbook', 4, lang)
            for gone in ('放上画布', 'Put on canvas', 'On the canvas', '只读示意'):
                self.assertNotIn(gone, html)
            ed = _drafter_config(lang)['editor']
            full = _studio_config(recipe, lang)
            for k in ('frame', 'chrome', 'limits', 'output_w'):
                self.assertEqual(ed[k], full[k], k)
            self.assertEqual(ed['lib_at'], [list(it[-1]) for it in recipe['items']])
            self.assertEqual({**ed['geo'], 'tile-h': recipe['geo']['tile-h']}, recipe['geo'])   # 只有产出卡片高一点
            for k in ('start', 'sample', 'items', 'heading'):   # 这些由 drafterLab 按草案填
                self.assertNotIn(k, ed)
            for dr in draft_data()['drafts']:
                self.assertLessEqual(len(dr['items']), len(ed['lib_at']), dr['id'])
            # 侧边栏：每项带 data-nav，亮的那项编辑器打开时挪到 Craft Recipes
            side = re.search(r'<div class="sk__side">(.*?)</div>', html, re.S).group(1)
            self.assertEqual(re.findall(r'data-nav="(\w+)"', side), [k for k, _ in SKIN_NAV])
            self.assertIn('recipes', dict(SKIN_NAV))
        js = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
        lab = js[js.index('function drafterLab'):js.index('/* ---------- 7.', js.index('function drafterLab'))]
        for must in ("addEventListener('dblclick'", "e.key === 'Enter'", 'recipeLab(node)', "navTo('recipes')", 'window.scrollTo({ top: y', 'D.asChanged(r, st)'):
            self.assertIn(must, lab)
        for gone in ('canvasBlock', 'function place(', 'T.place'):
            self.assertNotIn(gone, lab)

    def test_recipe_editor_options_stay_off_in_section_03(self):
        # recipeLab 的可选配置（物品自己的图、数量、几选一显示概率、物品库标签）只在 04 节的编辑器里给；03 节的配置里一个都没有
        from prototypes import _studio_config
        for lang in ('zh', 'en'):
            cfg = _studio_config(STUDIO['playbook-recipe'], lang)
            for k in ('qty', 'odds', 'lib_tag'):
                self.assertNotIn(k, cfg)
            self.assertFalse(any('art' in it for it in cfg['items']))
            self.assertIn('sample', cfg)
        js = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
        lab = js[js.index('function recipeLab'):js.index('/* 6d.')]
        for guard in ('if (items[id].art)', 'if (cfg.qty)', 'if (cfg.lib_tag)', 'if (cfg.odds)', 'if (cfg.sample)', 'cfg.odds ?'):
            self.assertIn(guard, lab)
        css = (ROOT / 'dist' / 'styles.css').read_text(encoding='utf-8')
        for line in css.splitlines():   # 新加的样式都挂在 03 节没有的属性上
            if 'rz__tag' in line or 'rz-lib__name{position:absolute' in line or '.rz__lib::before' in line:
                self.assertTrue('[data-own]' in line or line.startswith('.rz__tag{display:none}'), line)

    def test_way_in_from_create_like_the_studio_campaign_pages(self):
        # 交接单 ⑪（卡 20261125-002 第 3 版打回）：照 Studio 原稿的 Campaign 三页——空状态 → Create → 活动页（一句话起草条 +
        # 三块面板）→ 选目标填进面板；侧边栏 Campaign 回活动列表（Future Campaigns 一张草稿卡）。⑩ 的 New Campaign 两张卡去掉
        t = DRAFTER['t']
        for gone in ('h_list', 'h_new', 'from_blank', 'from_sentence', 'list_empty', 'days', 'h_tasks', 'h_items', 'h_recipes'):
            self.assertNotIn(gone, t)
        both = lambda v: [v, v]
        self.assertEqual(t['empty_h'], both('You Don’t Have a Campaign Yet'))   # 照原稿，两种语言页都是英文
        self.assertEqual(t['empty_p'], both('Create Your First Campaign Here!'))
        self.assertEqual(t['create'], both('Create'))
        self.assertEqual(t['untitled'], both('Untitled Campaign'))
        self.assertEqual(t['left'], both('Left in {n} days'))
        self.assertEqual(t['future'], both('Future Campaigns'))
        self.assertEqual(t['scheduled'], both('Scheduled On {d}'))
        self.assertEqual(t['draft_tag'], ['草稿', 'Draft'])
        self.assertEqual((t['p_missions'], t['p_items'], t['p_recipes']), (both('Missions'), both('Item Rewards'), both('Crafting Recipes')))
        self.assertEqual((t['tab_all'], t['tab_on']), (both('All Tasks'), both('Ongoing Tasks')))
        self.assertEqual(t['start_missions'], both('Start your first mission here!'))
        self.assertEqual(t['creator'], both('Creator'))
        self.assertEqual(t['goal_ph'], ['用一句话说出这次活动的目标', 'Describe the campaign goal in one sentence'])
        self.assertEqual(t['said_start'], ['点 Create，新建一个活动。', 'Click Create to start a new campaign.'])
        self.assertEqual(t['blank_only'], ['这个示意只演示起草。', 'This demo only shows drafting.'])
        self.assertEqual(t['give_get'], ['交出 {give}，得到 {get}', 'Give {give}, get {get}'])
        self.assertEqual(t['new'], ['新建活动', 'New campaign'])
        intro = DRAFTER['intro']
        self.assertTrue(intro[0].startswith('点 Create 新建活动，在一句话起草条里选一个创作者目标，看助手把任务、物品和配方填进活动页。'), intro[0])
        self.assertTrue(intro[1].startswith('Click Create to start a new campaign, pick a creator’s goal in the one-sentence bar, '
                                            'and watch the assistant fill the campaign page with missions, items and recipes.'), intro[1])
        for s in intro:
            self.assertNotIn('放上画布', s)
            self.assertNotIn('canvas', s)
            self.assertNotIn('用一句话起草」', s)
        zh, en = CASES['playbook']['sections'][3]['text'][0]   # 正文第 1 段照 ⑩ 留下的样子
        self.assertIn('创作者在 Studio 新建活动时，可以选择用一句话说出目标', zh)
        self.assertIn('when creating a new campaign in Studio, the creator can choose to state a goal in one sentence', en)
        for lang in ('zh', 'en'):
            html = section_demo('playbook', 4, lang)
            for gone in ('New Campaign', '从空白开始', 'Start from blank'):
                self.assertNotIn(gone, html)
        js = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
        lab = js[js.index('function drafterLab'):js.index('/* ---------- 7.', js.index('function drafterLab'))]
        for must in ('let made = false, pick = -1, st = null', "go('empty', true)", 'say(T.said_start)', "setAttribute('data-hint', '')",
                     "removeAttribute('data-hint')", "c.setAttribute('aria-disabled', 'true')", 'say(T.blank_only)',
                     'field.readOnly = false', 'field.value = d.goal', "toCampaigns.addEventListener('click', () => go('list'))",
                     "sub.addEventListener('click', () => go('camp'))", "card.addEventListener('click', () => go('camp'))",
                     "news.forEach(b => b.addEventListener('click', create))", 'if (ed) closeEditor()', 'camp.hidden = true', 'camp.hidden = false',
                     'dz-start', 'dz-hive', 'dz-cc', 'dz-illo'):
            self.assertIn(must, lab)
        for gone in ("go('new')", "go('ask')", 'blank.setAttribute', 'dz-card'):
            self.assertNotIn(gone, lab)
        css = (ROOT / 'dist' / 'styles.css').read_text(encoding='utf-8')
        for must in ('.dz-create[data-hint]{animation:dz-breathe 1.5s ease-in-out 3}',
                     '@media (prefers-reduced-motion:reduce){.dz-create[data-hint]{animation:none}}',
                     '@container (max-width:720px){.sk__top .sk__new{display:inline-grid}}',
                     '.dz-start{display:grid;', 'border:1px dashed var(--sk-red)', '.dz-tag--blue{background:#3D6FE8}',
                     '.dz-panels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))',
                     # 配方编辑器开着时收起外面的侧边栏，编辑器拿整个窗口宽
                     '[data-drafter][data-editing] .sk__win{grid-template-columns:minmax(0,1fr)}',
                     '[data-drafter][data-editing] .sk__side{display:none}'):
            self.assertIn(must, css)
        for gone in ('.sk__new[data-hint]', '.dz-card{', '.dz-cards{', '.dz-rows'):
            self.assertNotIn(gone, css)

    def test_frame_keeps_the_reference_divisions(self):
        # 交接单 ⑫：宽屏上窗口照原稿比例（1091:614），框架按原稿划分，字和图跟着缩；不用 transform: scale（会弄乱编辑器里拖拽的坐标）
        css = (ROOT / 'dist' / 'styles.css').read_text(encoding='utf-8')
        start = css.rindex('/*', 0, css.index('PlayBook 04：框架照原稿比例'))
        block = css[start:css.index('/* ========== ', start)]
        for must in ('@container (min-width:840px){', '--sku:calc(100cqw / 1091)', 'aspect-ratio:1091 / 614',
                     '.dz-panel__body{', '[data-drafter][data-editing] .sk__top{display:none}'):
            self.assertIn(must, block)
        self.assertNotIn('transform:scale', re.sub(r'/\*.*?\*/', '', block, flags=re.S).replace(' ', ''))   # 注释里提到它不算
        lab = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
        # 面板固定大小、里面自己滚；重画后各面板留在原来滚到的位置，换一页从顶上开始
        for must in ("el('div', 'dz-panel__body')", 'page.scrollTop = 0', ".querySelectorAll('.dz-panel__body')"):
            self.assertIn(must, lab)

    def test_sixth_version_follows_the_figma_data_frame(self):
        # 交接单 ⑬（卡 20261125-002 第 5 版本人打回）：起草条照 Figma 数据卡（页签 + 黑底「起草」+ 灰底一句话），页签带数字，
        # 任务卡照 more.png 的上半截，物品 / 配方是蜂窝圆，空面板插图用物品图重画；三张封面是 Codex 出的图
        t = DRAFTER['t']
        self.assertEqual(t['draft_go'], ['起草', 'Draft'])
        self.assertEqual((t['freq'], t['reward']), (['频次', 'Frequency'], ['奖励', 'Reward']))
        self.assertEqual(t['platforms'], ['Related Platforms', 'Related Platforms'])
        for k in ('said_goal', 'said_same', 'need_goal', 'only_samples', 'gone_tag'):
            self.assertEqual(len(t[k]), 2, k)
        js = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
        lab = js[js.index('function drafterLab'):js.index('/* ---------- 7.', js.index('function drafterLab'))]
        for must in ("el('button', 'dz-draft', T.draft_go)", 'function draftIt()', "'dz-ask__top'", 'dz-count', 'function hive(',
                     "'dz-cell dz-cell--add'", 'c.dataset.tip = label', "addEventListener('dblclick'", 'dz-start__art', 'dz-ir__lines',
                     'dz-im__card', 'dz-mis__thumb', 'dz-plat-ico', "addOnly('add:missions'", 'function counts()'):
            self.assertIn(must, lab)
        css = (ROOT / 'dist' / 'styles.css').read_text(encoding='utf-8')
        start = css.rindex('/*', 0, css.index('PlayBook 04：起草助手第 6 版'))
        block = css[start:css.index('/* ========== ', start)]
        for must in ('[data-drafter] .dz-camp{--k:1.1px;--ka:1px}', '[data-drafter] .dz-camp{--k:var(--sku);--ka:var(--sku)}',
                     '.dz-hive__row>*{flex:none;width:calc((100% - 5 * var(--g)) / 6);aspect-ratio:1}',
                     '.dz-hive__row[data-odd]>:first-child{margin-left:calc((100% - 5 * var(--g)) / 12 + var(--g) / 2)}',
                     '.dz-tab--on .dz-count{background:#3D6FE8', '.dz-draft{', '[data-drafter] .dz-goal[aria-pressed="true"]{background:var(--sk-red-text)'):
            self.assertIn(must, block)
        self.assertNotIn('container-type', block)   # 不加内层容器：--sku 里的 cqw 要按 .sk 算
        # 编辑器顶上不留空：标签和物品库照 03 节的位置往上提
        self.assertIn('[data-own] .rz__tag{display:flex;align-items:center;gap:calc(12 * var(--u));position:absolute;left:calc(14 * var(--u));top:calc(172 * var(--u));', css)
        self.assertIn('[data-own] .rz-lib{left:calc((var(--x) - 64) * var(--u));top:calc((var(--y) - 212) * var(--u));', css)
        # 三张封面：网站用的 1000 宽 webp 都在，样式里按草案换图，空状态用弥音那张
        manifest = json.loads((ROOT / 'dist' / 'assets' / 'work' / 'manifest.json').read_text(encoding='utf-8'))
        for look, name in (('halloween', 'lumi-halloween'), ('move', 'ache-moving'), ('newsong', 'miyin-new-song')):
            self.assertTrue((ROOT / 'dist' / 'assets' / 'work' / 'playbook' / 'drafter-covers' / f'{name}.webp').exists(), name)
            self.assertEqual(manifest[f'playbook/drafter-covers/{name}'][0], 1000)
            self.assertIn(f'[data-look="{look}"]{{--dz-img:url(/assets/work/playbook/drafter-covers/{name}.webp)}}', block)
        self.assertIn('--dz-img-empty:url(/assets/work/playbook/drafter-covers/miyin-new-song.webp)', block)
        for must in ("cover.setAttribute('aria-hidden', 'true')", "lcArt.setAttribute('aria-hidden', 'true')", "illo.setAttribute('aria-hidden', 'true')"):
            self.assertIn(must, lab)   # 封面都是装饰

    def test_draft_rules_in_node(self):
        node = shutil.which('node')
        if not node:
            self.skipTest('node is not installed')
        run = subprocess.run([node, str(ROOT / 'tests' / 'draft_rules.test.js')], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(run.returncode, 0, run.stderr[-2000:])
        self.assertIn('checks passed', run.stdout)


if __name__ == '__main__':
    unittest.main()
