"""Cut the item icons for the Studio campaign page demo out of the Figma exports.

Source: Figma XDyOn5545LrSOsCwqUcED7, Final pages 5685:4981 "Christmas Special Campaign"
(exports in sources/work/playbook/campaign/figma/, see docs/sources.md 2026-11-27).

Nothing is drawn here. Each icon is a 64 px grid cell of the Figma export, cut at 3x
(192 px) and masked to the circle the cell already is. The last row of both grids
sits below the 810 px page edge, so Figma does not render it in the export; those five
cells use the cell's own image fill (items-row6-*.png, object-fit: cover in Figma).

  icons/<slug>.png   192 px, transparent outside the circle
  icons.png          the same icons in one sheet (SHEET_COLS across, SPRITE order), for the page
  mission-card.png   the first mission card of the missions column (the second one in Figma is the same card)
  mission-create.png the dashed Create bar above it
  contact.png        every cell with its grid and index, for checking names

Run:  python3 tools/extract_campaign_parts.py
      python3 tools/prepare_assets.py playbook/campaign
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'sources' / 'work' / 'playbook' / 'campaign'
FIG = SRC / 'figma'
OUT = SRC / 'icons'
S = 3            # export scale
CELL = 64

# grid -> (export, left/top offset of the first cell in the 1x export)
GRIDS = {'items': ('items-grid-5685-5151@3x.png', 7, 7), 'recipes': ('recipes-grid-5685-5223@3x.png', 7, 8)}

# Cells in reading order, as laid out in Figma: rows alternate 6 / 5 cells, odd rows shifted 34 px,
# the last row has 5 cells. Row 0 cell 0 is the dashed "Create" cell and is not an item.
# The slug lists live in prototypes.py (one copy for the page and for this cutter).
sys.path.insert(0, str(ROOT))
from prototypes import CAMPAIGN_ITEMS as ITEMS, CAMPAIGN_RECIPES as RECIPES, CAMPAIGN_ROWS as ROWS, CAMPAIGN_SPRITE as SPRITE  # noqa: E402
SHEET_COLS = 8

# the missions column export (2x, 1x column = 279 wide): first card and the Create bar, measured on the export
MISSION_CROPS = {'mission-card.png': (32, 326, 526, 702), 'mission-create.png': (30, 214, 528, 294)}


def cells(grid):
    """(row, col, x, y) of every cell in 1x grid coordinates."""
    out = []
    for r, n in enumerate(ROWS):
        for c in range(n):
            out.append((r, c, (34 if r % 2 else 0) + 68 * c, 64 * r))
    return out


def disc(tile):
    size = tile.size[0]
    mask = Image.new('L', (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    tile = tile.convert('RGBA')
    tile.putalpha(mask.resize((size, size), Image.LANCZOS))
    return tile


def cover(path, size):
    """The hidden last row: white disc with the image fill scaled to cover it (Figma object-cover)."""
    img = Image.open(path).convert('RGBA')
    k = max(size / img.width, size / img.height)
    img = img.resize((round(img.width * k), round(img.height * k)), Image.LANCZOS)
    x, y = (img.width - size) // 2, (img.height - size) // 2
    tile = Image.new('RGBA', (size, size), (255, 255, 255, 255))
    tile.alpha_composite(img.crop((x, y, x + size, y + size)))
    return tile


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    size = CELL * S
    sheet = []
    for grid, slugs in (('items', ITEMS), ('recipes', RECIPES)):
        name, ox, oy = GRIDS[grid]
        frame = Image.open(FIG / name).convert('RGBA')
        for i, (r, c, x, y) in enumerate(cells(grid)):
            if r == len(ROWS) - 1:
                tile = cover(FIG / f'items-row6-{c}.png', size)
            else:
                X, Y = (ox + x) * S, (oy + y) * S
                tile = frame.crop((X, Y, X + size, Y + size))
            tile = disc(tile)
            sheet.append((grid, i, slugs[i], tile))
            # the recipe grid repeats item icons; only its two warning cells are new
            if slugs[i] and (grid == 'items' or slugs[i] not in ITEMS):
                tile.save(OUT / f'{slugs[i]}.png')
            elif grid == 'items' and i == 0:
                tile.save(OUT / 'create.png')   # the dashed Create cell, same in both columns
    # one sheet for the page
    n = len(SPRITE)
    out = Image.new('RGBA', (SHEET_COLS * size, -(-n // SHEET_COLS) * size), (0, 0, 0, 0))
    for k, slug in enumerate(SPRITE):
        out.paste(Image.open(OUT / f'{slug}.png'), ((k % SHEET_COLS) * size, (k // SHEET_COLS) * size))
    out.save(SRC / 'icons.png')
    col = Image.open(FIG / 'missions-5685-5034@2x.png').convert('RGB')
    for name, box in MISSION_CROPS.items():
        col.crop(box).save(SRC / name)
    # contact sheet
    cols = 11
    w, h = 220, 250
    rows = -(-len(sheet) // cols)
    out = Image.new('RGB', (cols * w, rows * h), 'white')
    d = ImageDraw.Draw(out)
    for k, (grid, i, slug, tile) in enumerate(sheet):
        X, Y = (k % cols) * w, (k // cols) * h
        out.paste(tile, (X + 14, Y + 6), tile)
        d.text((X + 10, Y + 205), f'{grid[0]}{i:02d} {slug or "Create"}', fill='black')
    out.save(SRC / 'contact.png')
    print(len(sheet), 'cells;', len(list(OUT.glob('*.png'))), 'icons')


if __name__ == '__main__':
    main()
