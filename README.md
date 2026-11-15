# Tobie / Yucheng Feng — Portfolio website

Bilingual (中文 `/`, English `/en/`) static portfolio: four case studies — Qingju, PlayBook, Industrial Securities SMT, The Commons Fridge — plus explorations, about and contact.

Design system **“Annotated”** (v3, 2026-09-19): the site is a working canvas; real work sits in white frames and my voice appears as annotations. Product screens are never re-skinned. Full spec: [`docs/design-system.md`](docs/design-system.md).

## What is where
| File | Role |
|---|---|
| `build.py` | Page templates (home, case pages, shell) |
| `cases.py` | Case study text (paired zh / en) |
| `figures.py` | Evidence figures per case section, with provenance |
| `prototypes.py` | Demos built on original screens: click-through flows, guided tour, SMT component replica, live Fridge prototype; and the three PlayBook Studio interactions rebuilt in code (`STUDIO`: free to operate inside limits, labelled as a 2026 rebuild) |
| `tools/prepare_assets.py` | Exports original screens/photos to `dist/assets/work/` (+ `manifest.json`) |
| `dist/styles.css` | Tokens and components |
| `dist/site.js` · `dist/prototype.js` | Navigation, lightbox, reveal · demo engine |
| `tests/test_prototypes.py` · `tests/recipe_rules.test.js` | Enforce the demo fidelity rules · the limits of the rebuilt recipe editor, run against the shipped engine |
| `docs/sources.md` | Where every source came from; factual boundaries |

## Build and check
```
python3 tools/prepare_assets.py      # only when source images change
python3 build.py
python3 -m unittest discover tests   # also runs node tests/recipe_rules.test.js
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
python3 verify.py                     # with the server running
node --check dist/site.js dist/prototype.js
```

`dist/` is the complete portable site. Fonts (Atkinson Hyperlegible Next / Mono, OFL) and images are self-hosted. The only external request is the Commons Fridge prototype, loaded into the page only when a visitor presses “Run the prototype here”.

## Publish (2026-10-20)
`tools/publish.sh check` runs build → tests → JS syntax → `verify.py` (starts a temporary server on 4173 if none is running); `tools/publish.sh deploy` (the old Vercel deploy) is retired since 2026-11-14; the live site www.tobiefeng.com is updated with `~/其他任务/部署中心/tools/部署国内版.sh`, after the owner says so. Case changes arrive as handoff files from the project folders; see [`docs/handoff-contract.md`](docs/handoff-contract.md).

## Source images
`sources/` (original screens, avatar, recordings used by `tools/prepare_assets.py`) is not part of this public repository. It is kept in the owner's private workspace and restored next to this folder before re-exporting assets. `dist/` already contains every exported image, so building the site does not need `sources/`.
