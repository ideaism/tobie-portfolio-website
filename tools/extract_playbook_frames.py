"""Pull the still frames used by the three PlayBook Studio live demos out of the
original screen recordings (sources/playbook-video/*.gif).

Each frame is one state that already exists in the recording; nothing is drawn
or composited here. Run before tools/prepare_assets.py when the list changes.

Output: sources/work/playbook-live/<clip>-<nn>.png
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'sources' / 'playbook-video'
OUT = ROOT / 'sources' / 'work' / 'playbook-live'

# clip -> frame numbers in the GIF, in the order the demo walks through them
FRAMES = {
    # campaign page, form empty, form filled, empty editor, crate, key, gamepad,
    # pink, blue, yellow, battery, super charge, choose-1-of-3, first Or, second Or
    'recipe': [0, 24, 120, 132, 144, 156, 168, 184, 200, 228, 252, 276, 306, 330, 366],
    # campaign page, item library, paper crane selected, red headphones selected
    'items': [0, 240, 520, 800],
    # clean page, selection + reply dialog, marker with its bubble, marker only
    'comments': [0, 144, 268, 352],
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for clip, numbers in FRAMES.items():
        gif = Image.open(SRC / f'{clip}.gif')
        for n, number in enumerate(numbers):
            gif.seek(number)
            dest = OUT / f'{clip}-{n:02d}.png'
            gif.convert('RGB').save(dest, optimize=True)
            print(f'{dest.name}: frame {number}, {gif.size[0]} x {gif.size[1]}')


if __name__ == '__main__':
    main()
