"""PlayBook 11, the campaign drafting assistant (交接单 02-playbook/portfolio/handoff.md 第 4 节 ⑤).

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
            html = section_demo('playbook', 11, lang)
            for c in d['checks']:
                self.assertIn(c['label'][lang], html)
            self.assertIn(DRAFTER['score_text'][n], html)

    def test_says_it_is_a_new_design_concept_not_a_rebuild(self):
        self.assertEqual(CONCEPT, ['2026 年新做的设计示意', 'New design concept, 2026'])
        for lang, n in (('zh', 0), ('en', 1)):
            html = section_demo('playbook', 11, lang)
            self.assertEqual(html.count('class="proto frame-block"'), 1)
            self.assertIn(f'<p class="proto__prov">{CONCEPT[n]}</p>', html)
            self.assertIn(f'<span class="prov ">{CONCEPT[n]}</span>', html)
            self.assertNotIn(REBUILT[n], html)
            self.assertNotIn(REBUILT_TAG[n], html)
            self.assertNotIn('data-studio', html, 'not a recipeLab instance')
            self.assertNotIn('http', html, 'nothing is loaded from anywhere')

    def test_section_11_is_the_last_and_the_only_one_with_it(self):
        secs = CASES['playbook']['sections']
        self.assertEqual(len(secs), 11)
        self.assertEqual(secs[10]['label'], ['11 / 2026 回看 · 活动起草助手', '11 / 2026 revisit · Campaign drafting assistant'])
        self.assertEqual(len(secs[10]['text']), 5)
        for n in range(1, len(secs) + 2):
            has = 'data-drafter' in section_demo('playbook', n, 'zh')
            self.assertEqual(has, n == 11, n)

    def test_red_lines(self):
        s = CASES['playbook']['sections'][10]
        zh = ''.join(p[0] for p in s['text']) + s['title'][0]
        for word in ('链上', 'Web3', '验证过', '提升了效率', '用户测试'):
            self.assertNotIn(word, zh)
        page = (ROOT / 'dist' / 'work' / 'playbook' / 'index.html').read_text(encoding='utf-8')
        self.assertNotIn('链上', page)

    def test_draft_rules_in_node(self):
        node = shutil.which('node')
        if not node:
            self.skipTest('node is not installed')
        run = subprocess.run([node, str(ROOT / 'tests' / 'draft_rules.test.js')], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(run.returncode, 0, run.stderr[-2000:])
        self.assertIn('checks passed', run.stdout)


if __name__ == '__main__':
    unittest.main()
