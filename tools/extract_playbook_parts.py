"""Cut the small parts the rebuilt PlayBook Studio demos need out of the
recording frames (sources/work/playbook-live/*.png, see extract_playbook_frames.py).

Nothing is drawn here: every part is a crop of a recording frame. The only
processing is making the flat background around an icon transparent, so the
icon can sit on a tile, be dragged, or be laid out again on a narrow screen.

  recipe-icons.png  the eight library items of the recipe editor, 96 px each, left to right
                    in RECIPE_ICONS order (from recipe-03.png, the empty editor)
  items-nodes.png   the seven items that appear in the two relationship webs, 132 px each,
                    in WEB_NODES order (from items-02.png and items-03.png)

Run:  python3 tools/extract_playbook_parts.py
      python3 tools/prepare_assets.py playbook/live-recipe-icons playbook/live-items-nodes
Output: sources/work/playbook-live/parts/*.png
"""
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'sources' / 'work' / 'playbook-live'
OUT = SRC / 'parts'

# centre of each library icon on the 1920×1080 recipe frame
RECIPE_ICONS = [('key', 101, 432), ('crates', 274, 432), ('charge', 101, 611), ('battery', 274, 611),
                ('gamepad', 101, 790), ('pink', 274, 790), ('blue', 101, 968), ('yellow', 274, 968)]
RECIPE_SIZE = 96

# (name, frame, centre x, centre y) on the 2880×1620 items frames
WEB_NODES = [('phones', 'items-03', 2458, 1364), ('crane', 'items-03', 2760, 1450), ('gamepad', 'items-02', 2686, 1424),
             ('purple', 'items-03', 2668, 1140), ('cassette', 'items-03', 2204, 1236), ('rocket', 'items-03', 2182, 1396),
             ('cat', 'items-03', 2042, 1564)]
NODE_SIZE = 132
NODE_RADIUS = 52


def cut_icon(frame, cx, cy, size):
    """Crop a square around (cx, cy) and make the flat fill around the artwork transparent."""
    half = size // 2
    tile = frame.crop((cx - half, cy - half, cx + half, cy + half)).convert('RGB')
    soft = tile.filter(ImageFilter.GaussianBlur(1.2))      # the GIF dithers its flat fills; compare on a smoothed copy
    corner = soft.getpixel((2, 2))
    far = ImageChops.difference(soft, Image.new('RGB', tile.size, corner)).convert('L').point(lambda v: 255 if v > 14 else 0)
    # flood the background in from the four corners; whatever the flood cannot reach is artwork
    reach = far.copy()
    for xy in ((0, 0), (size - 1, 0), (0, size - 1), (size - 1, size - 1)):
        if reach.getpixel(xy) == 0:
            ImageDraw.floodfill(reach, xy, 128)
    alpha = reach.point(lambda v: 0 if v == 128 else 255).filter(ImageFilter.GaussianBlur(0.7))
    out = tile.convert('RGBA')
    out.putalpha(alpha)
    return out


def cut_node(frame, cx, cy):
    """Crop a square around a web node and keep a disc, so the lines next to it are left out."""
    half = NODE_SIZE // 2
    tile = frame.crop((cx - half, cy - half, cx + half, cy + half)).convert('RGBA')
    # a frame cuts the lowest node off at its bottom edge: fill what is missing with the page's own near-white
    if cy + half > frame.height:
        fill = Image.new('RGBA', tile.size, frame.getpixel((cx - half, cy - half)) + (255,))
        fill.paste(tile.crop((0, 0, NODE_SIZE, frame.height - (cy - half))), (0, 0))
        tile = fill
    mask = Image.new('L', (NODE_SIZE * 4, NODE_SIZE * 4), 0)
    r = NODE_RADIUS * 4
    c = NODE_SIZE * 2
    ImageDraw.Draw(mask).ellipse((c - r, c - r, c + r, c + r), fill=255)
    tile.putalpha(mask.resize((NODE_SIZE, NODE_SIZE), Image.LANCZOS))
    return tile


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    frame = Image.open(SRC / 'recipe-03.png').convert('RGB')
    sheet = Image.new('RGBA', (RECIPE_SIZE * len(RECIPE_ICONS), RECIPE_SIZE), (0, 0, 0, 0))
    for n, (name, cx, cy) in enumerate(RECIPE_ICONS):
        sheet.paste(cut_icon(frame, cx, cy, RECIPE_SIZE), (n * RECIPE_SIZE, 0))
    sheet.save(OUT / 'recipe-icons.png', optimize=True)
    print(f'recipe-icons.png: {sheet.size[0]} x {sheet.size[1]}')

    frames = {}
    sheet = Image.new('RGBA', (NODE_SIZE * len(WEB_NODES), NODE_SIZE), (0, 0, 0, 0))
    for n, (name, src, cx, cy) in enumerate(WEB_NODES):
        if src not in frames:
            frames[src] = Image.open(SRC / f'{src}.png').convert('RGB')
        sheet.paste(cut_node(frames[src], cx, cy), (n * NODE_SIZE, 0))
    sheet.save(OUT / 'items-nodes.png', optimize=True)
    print(f'items-nodes.png: {sheet.size[0]} x {sheet.size[1]}')


if __name__ == '__main__':
    main()
