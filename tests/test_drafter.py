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
        for lang in ('zh', 'en'):
            html = section_demo('playbook', 4, lang)
            self.assertEqual(html.count('class="sk"'), 1)
            side = re.search(r'<div class="sk__side" aria-hidden="true">(.*?)</div>', html, re.S)
            top = re.search(r'<div class="sk__top" aria-hidden="true">(.*?)</div>', html, re.S)
            self.assertTrue(side and top, lang)
            for part in (side.group(1), top.group(1)):
                self.assertNotIn('<a', part)
                self.assertNotIn('<button', part)
                self.assertNotIn('tabindex', part)
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
        self.assertEqual(DRAFTER['t']['back'], ['回到草案', 'Back to draft'])
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
            side = re.search(r'<div class="sk__side" aria-hidden="true">(.*?)</div>', html, re.S).group(1)
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

    def test_draft_rules_in_node(self):
        node = shutil.which('node')
        if not node:
            self.skipTest('node is not installed')
        run = subprocess.run([node, str(ROOT / 'tests' / 'draft_rules.test.js')], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(run.returncode, 0, run.stderr[-2000:])
        self.assertIn('checks passed', run.stdout)


if __name__ == '__main__':
    unittest.main()
