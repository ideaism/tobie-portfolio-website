"""Checks that the demos obey the fidelity rules in docs/design-system.md §5.

Run: python3 -m unittest discover tests
"""
import json
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from prototypes import FLOWS, TOUR, SMT_ROWS, SMT_HEAD, SMT_COLS, section_demo  # noqa: E402
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
                if f['kind'] == 'pair':
                    srcs = [f['wide'][0], f['phone'][0]]
                for s in srcs:
                    self.assertIn(s, MANIFEST, f'{slug}/{n}: {s}')
                self.assertEqual(len(f['caption']), 2)


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
