"""Checks that the demos obey the fidelity rules in docs/design-system.md §5.

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

from prototypes import FLOWS, TOUR, SMT_ROWS, SMT_HEAD, SMT_COLS, STUDIO, REBUILT, REBUILT_TAG, section_demo  # noqa: E402
from figures import FIGURES, PROV  # noqa: E402

MANIFEST = json.loads((ROOT / 'dist' / 'assets' / 'work' / 'manifest.json').read_text())


def asset_name(src):
    return re.sub(r'^/assets/work/|\.webp$', '', src)


class FlowTests(unittest.TestCase):
    def test_every_screen_is_an_exported_original(self):
        for key, flow in FLOWS.items():
            for sid, screen in flow['screens'].items():
                name = asset_name(screen['src'])
                self.assertIn(name, MANIFEST, f'{key}/{sid}: {name} is not an exported source asset')
                self.assertEqual(list(MANIFEST[name]), flow['size'], f'{key}/{sid}: size differs from the flow size')

    def test_start_and_targets_exist(self):
        for key, flow in FLOWS.items():
            self.assertIn(flow['start'], flow['screens'])
            for sid, screen in flow['screens'].items():
                for h in screen['hotspots']:
                    go = h.get('go')
                    if go is None:
                        self.assertIn('note', h, f'{key}/{sid}: a hotspot without a target must explain itself')
                    elif go == '@end':
                        self.assertTrue(flow['end'], f'{key}: @end used without an end message')
                    else:
                        self.assertIn(go, flow['screens'], f'{key}/{sid}: unknown target {go}')

    def test_hotspots_sit_inside_the_screen(self):
        for key, flow in FLOWS.items():
            W, H = flow['size']
            for sid, screen in flow['screens'].items():
                for h in screen['hotspots']:
                    x, y, w, hh = h['box']
                    self.assertTrue(0 <= x and 0 <= y and x + w <= W and y + hh <= H, f'{key}/{sid}: {h["box"]} outside {W}x{H}')
                    self.assertGreaterEqual(min(w, hh), 24, f'{key}/{sid}: tap target too small')

    def test_every_screen_is_reachable(self):
        """Reachable through real controls, or explicitly declared as a rail entry."""
        for key, flow in FLOWS.items():
            entries = [flow['start'], *flow.get('rail_entry', [])]
            reached, todo = set(entries), list(entries)
            while todo:
                for h in flow['screens'][todo.pop()]['hotspots']:
                    go = h.get('go')
                    if go and go != '@end' and go not in reached:
                        reached.add(go); todo.append(go)
            self.assertEqual(reached, set(flow['screens']), f'{key}: unreachable {set(flow["screens"]) - reached}')

    def test_bilingual_copy_present(self):
        for key, flow in FLOWS.items():
            for field in ('title', 'intro', 'label', 'prov', 'provenance'):
                self.assertEqual(len(flow[field]), 2, f'{key}.{field}')
            for sid, s in flow['screens'].items():
                for field in ('step', 'alt', 'note', 'next'):
                    self.assertTrue(all(s[field]), f'{key}/{sid}.{field}')


class StudioTests(unittest.TestCase):
    """The three PlayBook Studio demos rebuilt in code (docs/design-system.md §5, rule 8):
    free to operate inside limits, labelled as a rebuild, interface from the source, no invented data."""

    def test_every_rebuilt_demo_says_it_is_a_rebuild(self):
        # 2026-11-16（卡 20261116-007）：不再强制出现「不是当年的交付物」/ "not a deliverable from the time"
        # 2026-11-25（优化方案第 1 批）：不写年份、不写「用代码重做」，只说按原稿还原
        for needle in ('还原', '界面元素取自原稿'):
            self.assertIn(needle, REBUILT[0])
        for needle in ('Rebuilt from the source', 'taken from the source'):
            self.assertIn(needle, REBUILT[1])
        for pair in (REBUILT, REBUILT_TAG):
            for s in pair:
                self.assertNotIn('2026', s)
        for key, d in STUDIO.items():
            self.assertTrue(d['provenance'][0].startswith(REBUILT[0]), f'{key}: the provenance line must open by saying this is rebuilt from the source')
            self.assertTrue(d['provenance'][1].startswith(REBUILT[1]), f'{key}: the provenance line must open by saying this is rebuilt from the source')
        for lang, n in (('zh', 0), ('en', 1)):
            html = section_demo('playbook', 3, lang)
            self.assertEqual(html.count(f'<p class="proto__prov">{REBUILT[n]}'), len(STUDIO), lang)
            self.assertEqual(html.count(f'<span class="prov prov--retro">{REBUILT_TAG[n]}</span>'), len(STUDIO), lang)
            self.assertIn('data-clips', html, 'the original recordings stay below the rebuilt demos')

    def test_pictures_and_parts_come_from_exported_frames(self):
        def paths(v):
            if isinstance(v, str):
                if v.startswith('/assets/'):
                    yield v
            elif isinstance(v, dict):
                for x in v.values():
                    yield from paths(x)
            elif isinstance(v, (list, tuple)):
                for x in v:
                    yield from paths(x)
        for key, d in STUDIO.items():
            found = list(paths(d))
            self.assertGreaterEqual(len(found), 2, key)
            for src in found:
                self.assertIn(asset_name(src), MANIFEST, f'{key}: {src} is not an exported source asset')

    def test_recipe_uses_only_the_library_items_and_starts_inside_its_limits(self):
        d = STUDIO['playbook-recipe']
        ids = [i[0] for i in d['items']]
        self.assertEqual(len(ids), 8)
        self.assertEqual(len(set(ids)), 8)
        w, h = MANIFEST[asset_name(d['icons'])]
        self.assertEqual(w, h * len(ids), 'one square icon per library item, cut from the recording frame')
        lim = d['limits']
        for name in ('start', 'sample'):
            spec = d[name]
            self.assertLessEqual(len(spec['require']), lim['require'], name)
            self.assertLessEqual(len(spec['optional']), lim['optional'], name)
            self.assertLessEqual(len(spec['groups']), lim['groups'], name)
            inputs = spec['require'] + spec['optional']
            outputs = [i for g in spec['groups'] for i, pct in g['items']]
            for side in (inputs, outputs):
                self.assertEqual(len(side), len(set(side)), f'{name}: the same item twice on one side')
                self.assertLessEqual(set(side), set(ids), f'{name}: an item that is not in the library')
            for g in spec['groups']:
                self.assertTrue(1 <= len(g['items']) <= lim['group'], name)
                for i, pct in g['items']:
                    self.assertTrue(0 <= pct <= 100 and pct % 5 == 0, f'{name}: {i} {pct}')
            self.assertEqual(len(spec['joins']), max(0, len(spec['groups']) - 1), name)
        # probabilities the demo hands out are the recording's; the two items it never shows as outputs get the stated default
        shown = {i: pct for i, _, _, pct, _ in d['items'] if pct is not None}
        self.assertEqual(shown, {'charge': 20, 'battery': 80, 'gamepad': 100, 'pink': 10, 'blue': 10, 'yellow': 10})

    def test_recipe_limits_fit_the_frame(self):
        """With every area filled to its limit, nothing can overflow or overlap (sizes in frame pixels)."""
        d = STUDIO['playbook-recipe']
        lim, g = d['limits'], d['geo']
        for zone in ('require', 'optional'):
            n = lim[zone]
            need = n * g['in-item'] + (n - 1) * g['in-gap']
            self.assertLessEqual(need, g[f'{zone}-h'] - g['box-tab'], f'{zone}: {n} items need {need}px')
        n = lim['group']
        stack = n * g['tile-h'] + (n - 1) * (g['pill-h'] + 2 * g['pill-gap']) + 2 * g['group-pad']
        chosen = n * g['tile-choose-h'] + (n - 1) * (g['pill-h'] + 2 * g['pill-gap']) + 2 * g['group-pad'] + g['choose-h']
        self.assertLessEqual(max(stack, chosen), g['panel-h'] - 2 * g['box-tab'], f'a full group is {max(stack, chosen)}px tall')
        self.assertEqual(len(d['output_w']), lim['groups'] + 1, 'one Output width per number of groups')
        self.assertEqual(d['output_w'][0], g['out-min'])
        for groups in range(1, lim['groups'] + 1):
            chain = groups * (g['tile-w'] + 2 * g['group-pad'] + 2) + (groups - 1) * (g['pill-w'] + 2 * g['chain-gap'])
            self.assertLessEqual(chain + 2 * g['group-pad'], d['output_w'][groups], f'{groups} groups need {chain}px')
        # Output grows to the left over the Condition area, as in the recording; Condition must not vanish or be overlapped
        frame_w, condition_left, gap_and_margin = d['frame'][0], 386 + 327, 16 + 14      # as laid out in dist/styles.css (.rz-panel--cond)
        left_for_condition = frame_w - condition_left - gap_and_margin - max(d['output_w'])
        self.assertEqual(left_for_condition, d['condition_min'])
        self.assertGreaterEqual(left_for_condition, 120)

    def test_items_invent_no_detail(self):
        d = STUDIO['playbook-items']
        W, H = d['frame']
        grid = d['grid']
        self.assertEqual(set(d['detail'].values()), {'crane', 'phones'}, 'the source drew a detail view for two items only')
        self.assertEqual(set(d['webs']), set(d['detail'].values()))
        self.assertEqual(set(d['frames']), {'closed', *d['detail'].values()})
        self.assertLessEqual({int(k) for k in d['detail']}, set(range(grid['count'])))
        for layout in ('open', 'closed'):
            L = grid[layout]
            cells = [((k + 1) % L['cols'], (k + 1) // L['cols']) for k in range(grid['count'])]
            self.assertLess(max(r for c, r in cells), len(L['rows']), layout)
            for c, r in cells:
                x, y, half = grid['x0'] + c * grid['dx'], L['rows'][r], grid['size'] / 2
                self.assertTrue(half <= x <= W - half and half <= y <= H - half, f'{layout}: cell {c},{r} outside the frame')
            self.assertLessEqual(grid['size'], grid['dx'], 'neighbouring items must not overlap')
        x0, y0, x1, y1 = d['web']['bounds']
        cx, cy, cw, ch = d['web']['cover']
        half = d['web']['node'] / 2
        self.assertTrue(cx <= x0 - half and x1 + half <= cx + cw and cy <= y0 - half, 'the web boundary keeps every node on the web area')
        self.assertLessEqual(y1 + d['web']['radius'], H, 'a node at the bottom boundary still shows its artwork')
        for key, web in d['webs'].items():
            names = [n[0] for n in web['nodes']]
            self.assertEqual(len(names), len(set(names)), key)
            self.assertIn(key, names, f'{key}: the open item sits in its own web')
            for name, x, y, detail in web['nodes']:
                self.assertIn(name, d['sprites'], f'{key}: {name} has no picture cut from the frames')
                self.assertIn(name, d['node_names'])
                self.assertTrue(x0 <= x <= x1 and y0 <= y <= y1, f'{key}: {name} starts outside the boundary')
                self.assertIn(detail, (None, *d['detail'].values()), f'{key}: {name} links to a detail view the source does not have')
            for a, b, colour, bend in web['edges']:
                self.assertIn(a, names); self.assertIn(b, names)
                self.assertIn(key, (a, b), f'{key}: every line in the recording touches the open item')
                self.assertIn(colour, ('red', 'blue'))
        for view in d['views'].values():
            x, y, w, h = view
            self.assertTrue(0 <= x and 0 <= y and x + w <= W and y + h <= H, view)

    def test_comment_boundaries(self):
        d = STUDIO['playbook-comments']
        W, H = d['frame']
        rx, ry, rw, rh = d['region']
        self.assertTrue(0 <= rx and 0 <= ry and rx + rw <= W and ry + rh <= H)
        dx, dy, dw, dh = d['dialog']
        for part in ('dialog', 'avatar'):
            x, y, w, h = d[part]
            self.assertTrue(0 <= x and 0 <= y and x + w <= W and y + h <= H, f'{part} outside the frame')
        for part in ('field', 'send', 'cancel'):   # live controls sit exactly on the recorded ones
            x, y, w, h = d[part]
            self.assertTrue(dx <= x and dy <= y and x + w <= dx + dw and y + h <= dy + dh, f'{part} outside the reply box')
        self.assertTrue(1 <= d['limits']['marks'] <= 9)
        self.assertTrue(10 <= d['limits']['chars'] <= 120)
        vx, vy, vw, vh = d['view']
        self.assertTrue(0 <= vx <= rx and 0 <= vy <= ry and rx + rw <= vx + vw <= W and ry + rh <= vy + vh <= H, 'the narrow-screen view shows the whole image')

    def test_bilingual_copy_and_placeholders(self):
        for key, d in STUDIO.items():
            for field in ('tab', 'label', 'title', 'provenance'):
                self.assertEqual(len(d[field]), 2, f'{key}.{field}')
                self.assertTrue(all(d[field]), f'{key}.{field}')
            # 2026-11-25（优化方案第 1 批）：侧边卡最多三条短提示
            self.assertLessEqual(len(d['how']), 3, key)
            for pair in d['how']:
                self.assertEqual(len(pair), 2, key)
                self.assertLessEqual(len(pair[0].replace(' ', '')), 30, f'{key}: {pair[0]}')   # 栏名是英文，按去空格的字符数算
            for name, pair in d['t'].items():
                self.assertEqual(len(pair), 2, f'{key}.t.{name}')
                self.assertTrue(all(pair), f'{key}.t.{name}')
                self.assertEqual(sorted(re.findall(r'\{\w+\}', pair[0])), sorted(re.findall(r'\{\w+\}', pair[1])), f'{key}.t.{name}: placeholders differ between languages')

    def test_engine_has_no_fixed_path_left(self):
        """The frame-by-frame player of 2026-11-15 (one legal next step per screen) must not come back for these demos."""
        js = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
        for gone in ('dragSetup', 'drawSetup', 'data-action="do"'):
            self.assertNotIn(gone, js)
        for key in STUDIO:
            self.assertNotIn(key, FLOWS, f'{key} must not be a click-through flow')
        for name in ('recipeRules', 'recipeLab', 'itemsLab', 'commentLab'):
            self.assertIn(f'function {name}(' if name != 'recipeRules' else 'const recipeRules', js)

    def test_recipe_rules_hold_the_boundary(self):
        """Limits, illegal drops and 10,000 random operations, run against the shipped engine in Node."""
        node = shutil.which('node')
        if not node:
            self.skipTest('node is not installed')
        run = subprocess.run([node, str(ROOT / 'tests' / 'recipe_rules.test.js')], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(run.returncode, 0, run.stderr[-2000:])
        self.assertIn('checks passed', run.stdout)


class TourTests(unittest.TestCase):
    def test_regions_inside_screen(self):
        for st in TOUR['steps']:
            x, y, w, h = st['box']
            self.assertTrue(0 <= x and 0 <= y and x + w <= 100 and y + h <= 100, st['id'])
        for key in ('true_box', 'false_box'):
            x, y, w, h = TOUR[key]
            self.assertTrue(x + w <= 100 and y + h <= 100, key)


class SmtTests(unittest.TestCase):
    def test_table_shape_matches_source_columns(self):
        self.assertEqual(len(SMT_HEAD), 15)
        self.assertEqual(len(SMT_COLS), 15)
        for row in SMT_ROWS:
            self.assertEqual(len(row), 15, row)

    def test_gain_loss_colour_follows_sign(self):
        html = section_demo('smt', 3, 'en')
        self.assertIn('class="down">−1623.31', html)
        self.assertIn('class="up">141,123.13', html)


class FigureTests(unittest.TestCase):
    def test_figures_use_exported_assets_and_known_provenance(self):
        for (slug, n), figs in FIGURES.items():
            for f in figs:
                self.assertIn(f['prov'], PROV, f'{slug}/{n}')
                srcs = [f['src']] if 'src' in f else [i[0] for i in f.get('items', [])]
                srcs += [f['src_en']] if 'src_en' in f else []        # 英文页另取的图
                srcs += [i[0] for i in f.get('partials', [])]         # 不是整屏的局部图
                srcs += [i[0] for i in f.get('whole', [])]            # 和手机一样宽、整张显示的图
                srcs += [i[0] for row in f.get('rows', []) for i in row]   # 'anims' 的动图（2026-11-23）
                for name, cap in f.get('cap', {}).items():            # 显示宽度上限不能超过导出图的宽度
                    self.assertLessEqual(cap, MANIFEST[name][0], f'{slug}/{n}: {name}')
                if f['kind'] == 'pair':
                    srcs = [f['wide'][0], f['phone'][0]]
                for s in srcs:
                    self.assertIn(s, MANIFEST, f'{slug}/{n}: {s}')
                self.assertEqual(len(f['caption']), 2)

    def test_scroll_window_only_for_tall_images_and_reachable(self):
        """'scroll' (2026-11-17): only single images taller than 16:9; the window is focusable and named, the enlarge button stays."""
        from build import figure_html
        for (slug, n), figs in FIGURES.items():
            for f in figs:
                if not f.get('scroll'):
                    continue
                self.assertEqual(f['kind'], 'image', f'{slug}/{n}')
                w, h = MANIFEST[f['src']]
                self.assertGreater(h / w, 9 / 16, f'{slug}/{n}: {f["src"]} fits 16:9 already')
                for lang, hint in (('zh', '可上下滑动'), ('en', 'Scroll to see more')):
                    html = figure_html(f, lang)
                    self.assertIn('class="shot-scroll__view" tabindex="0" role="region" aria-label="', html)
                    self.assertIn(hint, html)
                    self.assertEqual(html.count('data-enlarge'), 1)
                    fixed = f.get('fixed')
                    # 2026-11-25: one copy for top / left / right, one more for 'bottom', one per 'sticky' column
                    layers = (1 if fixed and any(fixed.get(k) for k in ('top', 'left', 'right')) else 0) + (1 if fixed and fixed.get('bottom') else 0) + len((fixed or {}).get('sticky', []))
                    self.assertEqual(html.count('<img '), 1 + layers)
                    self.assertEqual(html.count('<img aria-hidden="true" src='), layers)
                    if fixed:   # v3: the unscrolled copies are decorative, clipped to the fixed chrome, and come after the scrolling picture
                        if any(fixed.get(k) for k in ('top', 'left', 'right')):
                            self.assertIn('alt="" class="shot-scroll__fixed" style="clip-path:polygon(', html)
                        if fixed.get('bottom'):
                            self.assertIn('class="shot-scroll__fixed shot-scroll__fixed--b" style="-webkit-mask-image:', html)
                            self.assertIn('--fix-b:', html)
                        self.assertEqual(html.count('class="shot-scroll__fixed shot-scroll__sticky" style="clip-path:inset('), len(fixed.get('sticky', [])))
                        self.assertLess(html.index('shot-scroll__view'), html.index('shot-scroll__fixed'))
        for (slug, n), figs in FIGURES.items():   # 'fixed' only goes with 'scroll', in source pixels that fit the picture's first 16:9 screen
            for f in figs:
                fx = f.get('fixed')
                if not fx:
                    continue
                self.assertTrue(f.get('scroll'), f'{slug}/{n}')
                self.assertLessEqual(set(fx), {'of', 'top', 'left', 'right', 'bottom', 'fade', 'sticky'})
                self.assertLess(fx.get('left', 0) + fx.get('right', 0), fx['of'])
                self.assertLess(fx.get('top', 0) + fx.get('bottom', 0), fx['of'] * 9 / 16)   # the fixed bars leave room in the first screen
                self.assertLessEqual(fx.get('fade', 0), fx.get('bottom', 0))
                w, h = MANIFEST[f['src']]
                for st in fx.get('sticky', []):   # inside the picture, below the top bar, and short enough to fit between the bars
                    (x0, x1), (y0, y1) = st['x'], st['y']
                    self.assertTrue(0 <= x0 < x1 <= fx['of'] and 0 <= y0 < y1 <= fx['of'] * h / w, f'{slug}/{n}')
                    self.assertTrue(fx.get('top', 0) <= st['at'] < y0, f'{slug}/{n}')
                    self.assertLessEqual(st['at'] + (y1 - y0), fx['of'] * 9 / 16 - fx.get('bottom', 0), f'{slug}/{n}: the column would run under the bottom bar')
        plain = dict(FIGURES[('playbook', 8)][0])   # 2026-11-24：Remix 从 09 顺延为 10；2026-11-25 起草助手下线，回到 9；2026-11-26 回到主线，键 8
        self.assertNotIn('scroll', plain)
        self.assertNotIn('shot-scroll', figure_html(plain, 'zh'))   # the switch is off by default


class PageTests(unittest.TestCase):
    def test_no_invented_demo_vocabulary_left(self):
        """Phrases from the retired re-skinned demos must not come back."""
        banned = ['DEMO-A', 'Sample Alpha', '示例甲', '加入示例电池', 'Add sample battery', '绿道小风景', 'Blue lunch box', '蓝色午餐盒']
        for page in (ROOT / 'dist').rglob('index.html'):
            text = page.read_text()
            for phrase in banned:
                self.assertNotIn(phrase, text, f'{page}: {phrase}')

    def test_every_demo_has_provenance(self):
        for page in (ROOT / 'dist').rglob('index.html'):
            text = page.read_text()
            demos = text.count('class="proto frame-block"')
            self.assertEqual(demos, text.count('class="proto__prov"'), page)


if __name__ == '__main__':
    unittest.main()
