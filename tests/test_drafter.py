"""PlayBook 04, the campaign drafting assistant (交接单 02-playbook/portfolio/handoff.md 第 4 节 ⑤；2026-11-24 ⑧ 从 11 挪到 04).

A new design concept from 2026, not one of the rebuilds that docs/design-system.md rule 8 covers.
2026-11-25 it left the PlayBook page (本人要求); its code and data stay. 2026-11-27 the class-level skip went away
(卡 20261127-004 / -006): the tests that looked for it on the page or in the built HTML were removed, the ones
about its data, assets, stylesheet and engine source still hold and run.
Run: python3 -m unittest discover tests
"""
import json
import re
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from prototypes import DRAFT_DATA, DRAFTER, STUDIO, _drafter_config, draft_data  # noqa: E402
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
        note = DRAFTER['t']['items_note']
        self.assertEqual(note, ['物品图是用 Codex 生成的示意图，照 03 节 Studio 图标的风格画的。',
                                'Item art was generated with Codex as illustration, drawn to match the Studio icons in section 03.'])
        js = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
        art = js[js.index('const itemArt'):js.index('return im;', js.index('const itemArt'))]
        for must in ("im.alt = ''", "setAttribute('aria-hidden', 'true')", "im.loading = 'lazy'"):
            self.assertIn(must, art)

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
        for k in ('said_goal', 'said_same', 'need_goal', 'gone_tag'):
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
        self.assertIn('[data-own] .rz-lib{left:calc((var(--x) - 64) * var(--u));top:calc((var(--y) - 217.5) * var(--u));', css)
        # 三张封面：网站用的 1000 宽 webp 都在，样式里按草案换图，空状态用弥音那张
        manifest = json.loads((ROOT / 'dist' / 'assets' / 'work' / 'manifest.json').read_text(encoding='utf-8'))
        for look, name in (('halloween', 'lumi-halloween'), ('move', 'ache-moving'), ('newsong', 'miyin-new-song')):
            self.assertTrue((ROOT / 'dist' / 'assets' / 'work' / 'playbook' / 'drafter-covers' / f'{name}.webp').exists(), name)
            self.assertEqual(manifest[f'playbook/drafter-covers/{name}'][0], 1000)
            self.assertIn(f'[data-look="{look}"]{{--dz-img:url(/assets/work/playbook/drafter-covers/{name}.webp)}}', block)
        self.assertIn('--dz-img-empty:url(/assets/work/playbook/drafter-covers/miyin-new-song.webp)', block)
        for must in ("cover.setAttribute('aria-hidden', 'true')", "lcArt.setAttribute('aria-hidden', 'true')", "illo.setAttribute('aria-hidden', 'true')"):
            self.assertIn(must, lab)   # 封面都是装饰

    def test_the_bar_reads_at_a_glance(self):
        # 交接单 ⑭（本人试用时在灰框里打了一句，点「起草」只得到拒绝）：一进来就选好第一个目标、「起草」呼吸；
        # 页签写「创作者 · 几个字的目标」；自己写的句子也起草，按关键词挑最接近的一份，状态行老实说
        t = DRAFTER['t']
        self.assertNotIn('only_samples', t)
        self.assertEqual(t['said_camp'], ['点「起草」看草案；也可以换个页签，或自己写一句。',
                                          'Click Draft to see a draft; you can also switch tabs or write your own sentence.'])
        self.assertEqual(t['typed_closest'][0], '这个示意只有三份事先起草好的草案，按你这句，先用最接近的「{name}」演示。')
        for k in ('typed_closest', 'typed_none'):
            self.assertEqual([s.count('{name}') for s in t[k]], [1, 1], k)
        self.assertEqual(DRAFTER['tabs']['halloween'][0], '露米 · 万圣节直播')
        self.assertEqual(DRAFTER['tabs']['move'][0], '阿澈 · 换平台')
        self.assertEqual(DRAFTER['tabs']['newsong'][0], '弥音 · 新歌拉新')
        for lang, i in (('zh', 0), ('en', 1)):
            cfg = _drafter_config(lang)
            self.assertEqual(set(cfg['tabs']), {d['id'] for d in cfg['drafts']})
            for d in cfg['drafts']:
                self.assertTrue(cfg['tabs'][d['id']].startswith(d['creator'] + ' · '), (lang, d['id']))   # 名字照数据
                self.assertTrue(cfg['match'][d['id']])
            self.assertNotIn('only_samples', cfg['t'])
        js = (ROOT / 'dist' / 'prototype.js').read_text(encoding='utf-8')
        self.assertNotIn('only_samples', js)
        lab = js[js.index('function drafterLab'):js.index('/* ---------- 7.', js.index('function drafterLab'))]
        for must in ('field.value = cfg.drafts[0].goal', "drafting.setAttribute('data-hint', '')", "drafting.removeAttribute('data-hint')",
                     'D.closest(text, cfg.drafts, cfg.match', 'T.typed_none', 'T.typed_closest', 'say(T.said_camp)', "'dz-goal__who'", "'dz-goal__what'"):
            self.assertIn(must, lab)
        css = (ROOT / 'dist' / 'styles.css').read_text(encoding='utf-8')
        start = css.index('PlayBook 04：起草条一眼看懂')
        block = css[start:css.index('/* ========== ', start)]
        for must in ('.dz-draft[data-hint]{animation:dz-breathe 1.5s ease-in-out 3}',
                     '@media (prefers-reduced-motion:reduce){.dz-draft[data-hint]{animation:none}}',
                     'background:#fff;box-shadow:inset 0 0 0 1px', '[data-drafter] .dz-goal[aria-pressed="true"]{background:var(--sk-red-text)'):
            self.assertIn(must, block)



if __name__ == '__main__':
    unittest.main()
