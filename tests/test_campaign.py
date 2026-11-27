"""PlayBook 05 Studio · 活动页 (2026-11-27; card 20261127-004, decision 20261127-006 option A).

What the owner asked for: missions, items and recipes each scroll on their own; pointing at an item shows its hover card;
clicking it goes straight to the item page. The page and its parts come from the Figma exports (docs/sources.md 2026-11-27).
The real wheel / hover / click run is the headless Chrome script in
04-shared/qa/walkthrough/2026-11-27-PlayBook-Studio活动页/shots.mjs; these tests pin the data and the code paths it relies on.

Run: python3 -m unittest discover tests
"""
import html as H
import json
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from prototypes import (CAMPAIGN_ITEMS, CAMPAIGN_NAMES, CAMPAIGN_RECIPES, CAMPAIGN_ROWS, CAMPAIGN_SPRITE,  # noqa: E402
                        STUDIO, _studio_config, section_demo)

MANIFEST = json.loads((ROOT / 'dist' / 'assets' / 'work' / 'manifest.json').read_text())
JS = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
CSS = (ROOT / 'dist' / 'styles.css').read_text(encoding='utf-8')
D = STUDIO['playbook-campaign']


def asset(src):
    return re.sub(r'^/assets/work/|\.webp$', '', src)


def lab_body():
    start = JS.index('function campaignLab(root)')
    return JS[start:JS.index('\n}\n', start)]


class CampaignTabTests(unittest.TestCase):
    def test_first_tab_of_05_studio_and_open(self):
        for lang, name in (('zh', '活动页'), ('en', 'Campaign page')):
            page = section_demo('playbook', 8, lang)
            tabs = re.findall(r'data-live-tab="([^"]+)"[^>]*>([^<]+)<', page)
            self.assertEqual(tabs[0][1].strip(), name, lang)
            first = re.search(r'data-live-panel="([^"]+)"([^>]*)>', page)
            self.assertEqual(first.group(1), tabs[0][0], lang)
            self.assertNotIn('hidden', first.group(2), f'{lang}: the campaign page is the panel shown first')
            self.assertEqual(len(tabs), 4, f'{lang}: the other three demos stay')
            self.assertIn('data-studio="campaign"', page, lang)

    def test_no_drafting_layer_and_no_year(self):
        for lang in ('zh', 'en'):
            page = section_demo('playbook', 8, lang)
            block = page[page.index('id="try-campaign"'):]
            block = block[:block.index('</section>')]
            self.assertNotIn('2026', H.unescape(block), lang)
            for word in ('起草', 'Draft', 'AI '):
                self.assertNotIn(word, H.unescape(block), f'{lang}: {word}')


class CampaignDataTests(unittest.TestCase):
    def test_grids_follow_the_source(self):
        self.assertEqual(sum(CAMPAIGN_ROWS), 38)
        for cells in (CAMPAIGN_ITEMS, CAMPAIGN_RECIPES):
            self.assertEqual(len(cells), 38)
            self.assertIsNone(cells[0], 'the first cell is the dashed Create cell')
            self.assertEqual(cells.count(None), 1)
        self.assertEqual(D['cols']['items']['cells'], CAMPAIGN_ITEMS)
        self.assertEqual(D['cols']['recipes']['cells'], CAMPAIGN_RECIPES)

    def test_every_item_has_a_name_and_an_icon(self):
        self.assertEqual(len(CAMPAIGN_NAMES), 37)
        for cells in (CAMPAIGN_ITEMS, CAMPAIGN_RECIPES):
            for slug in filter(None, cells):
                self.assertIn(D['warn'].get(slug, slug), CAMPAIGN_NAMES, slug)
                self.assertIn(slug, CAMPAIGN_SPRITE, slug)
        self.assertIn('create', CAMPAIGN_SPRITE)
        w, h = MANIFEST[asset(D['icons'])]
        cols = D['sheet_cols']
        rows = -(-len(CAMPAIGN_SPRITE) // cols)
        self.assertEqual(w * rows, h * cols, 'square icons, sheet_cols across')

    def test_names_follow_decision_a(self):
        self.assertEqual(CAMPAIGN_NAMES['red-headphones'], 'Lofi Girl’s Red Headphones')
        self.assertEqual(CAMPAIGN_NAMES['crane'], 'Lofi Girl’s Paper Crane')
        self.assertEqual(CAMPAIGN_NAMES['cassette'], 'Lofi Cassette Tape')
        self.assertEqual(D['warn'], {'warning-a': 'cassette', 'warning-b': 'cat'})
        for lang in ('zh', 'en'):
            names = _studio_config(D, lang)['names']
            self.assertEqual(names, CAMPAIGN_NAMES, f'{lang}: the names are English on both pages')

    def test_cards_and_item_page_follow_decision_a(self):
        self.assertEqual(list(D['card_special']), ['crane'], 'only the crane has its own prices')
        crane = D['card_special']['crane']
        self.assertEqual(crane['price'], '$23.4')
        self.assertEqual([t[1] for t in crane['tiers']], ['$20.00', '$30.00', '$50.00'])
        self.assertEqual(D['card']['price'], '0.03$')
        self.assertEqual(D['item']['source'], 'red-headphones')

    def test_three_columns_scroll(self):
        W, Hh = D['frame']
        for key, c in D['cols'].items():
            x, y, w, h = c['box']
            self.assertTrue(0 <= x and x + w <= W and 0 <= y and y + h <= Hh, f'{key}: column outside the page')
            self.assertGreater(c['height'], h, f'{key}: content taller than the column, so it scrolls')
            if 'grid' in c:
                last = len(CAMPAIGN_ROWS) - 1
                right = max(c['grid'][0] + (D['shift'] if r % 2 else 0) + (n - 1) * D['pitch'][0] + D['cell'] for r, n in enumerate(CAMPAIGN_ROWS))
                self.assertLessEqual(right, w, f'{key}: a cell sticks out of the column')
                self.assertLessEqual(c['grid'][1] + last * D['pitch'][1] + D['cell'], c['height'], f'{key}: the last row is cut off')

    def test_parts_are_exported(self):
        for k in ('page', 'detail', 'icons', 'mission_card', 'mission_create'):
            self.assertIn(asset(D[k]), MANIFEST, k)
        self.assertEqual(list(MANIFEST[asset(D['page'])]), [2400, 1350])


class CampaignCodeTests(unittest.TestCase):
    def test_registered(self):
        self.assertRegex(JS, r'const labs = \{ campaign: campaignLab,')

    def test_columns_scroll_on_their_own(self):
        rule = re.search(r'\.cp__col\{([^}]+)\}', CSS).group(1)
        self.assertIn('overflow-y:auto', rule)
        self.assertIn('overscroll-behavior:contain', rule, 'reaching the end of a column must not drag the page')

    def test_hover_shows_the_card_click_opens_the_item(self):
        body = lab_body()
        self.assertIn("addEventListener('pointerover'", body)
        self.assertIn("e.pointerType !== 'mouse' && e.pointerType !== 'pen'", body, 'touch gets no hover card')
        self.assertIn("addEventListener('focusin'", body, 'keyboard focus shows the card too')
        self.assertIn("page.addEventListener('click', e => { const cell = cellOf(e); if (cell) open(cell); })", body)
        self.assertIn("col.scrollTop = tops[col.dataset.col]", body, 'back keeps each column where it was')
        self.assertIn("addEventListener('scroll', hide", body, 'scrolling a column hides the card')

    def test_hover_card_is_the_small_one(self):
        # card 20261127-007: the source card (582 wide) covered 49 items; card 20261127-008 approved the 216 wide one
        rule = re.search(r'\.cp__card\{([^}]+)\}', CSS).group(1)
        self.assertIn('width:216px', rule)
        self.assertEqual(set(D['card']), {'price', 'sold', 'none'}, 'no address, introduction or "create a sales channel"')
        body = lab_body()
        fill = body[body.index('function fill('):body.index('function hide(')]
        for gone in ('cp__addr', 'cp__pic', 'cp__intro', 'cp__new', 'cp__lbl'):
            self.assertNotIn(gone, fill)
        self.assertIn('card.replaceChildren(name, price, sales)', fill)
        self.assertIn('let left = x + cfg.cell + 10;', body, '10 px right of the item')
        self.assertIn('if (left + cw > W - 8) left = x - 10 - cw;', body, 'to its left at the right edge')

    def test_mission_cards_are_not_clickable(self):
        body = lab_body()
        missions = body[body.index("if (key === 'missions')"):body.index('} else {', body.index("if (key === 'missions')"))]
        self.assertNotIn("'button'", missions)
        self.assertNotIn('addEventListener', missions)
        self.assertIn("'.cp__cell[data-item]'", body, 'only item cells react')


if __name__ == '__main__':
    unittest.main()
