"""出分享卡片：把 tools/share-card.html 用无界面浏览器截成 1200×630，存成 dist/assets/share-zh.jpg 和 share-en.jpg。

  python3 tools/share_card.py

只在卡片内容变了的时候跑（标题、自画像、网址）。需要本机装了 Edge 或 Chrome，以及 Pillow。
"""
from pathlib import Path
import shutil, subprocess, sys, tempfile
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CARD = ROOT / 'tools' / 'share-card.html'
OUT = ROOT / 'dist' / 'assets'
SIZE = (1200, 630)
BROWSERS = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
]


def browser():
    for b in BROWSERS:
        if Path(b).exists():
            return b
    for name in ('google-chrome', 'chromium', 'msedge'):
        if shutil.which(name):
            return shutil.which(name)
    sys.exit('没找到 Edge 或 Chrome，出不了分享卡片。')


def shoot(lang, exe):
    with tempfile.TemporaryDirectory() as tmp:
        png = Path(tmp) / 'card.png'
        subprocess.run([exe, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                        f'--user-data-dir={tmp}/profile', f'--window-size={SIZE[0]},{SIZE[1]}',
                        '--virtual-time-budget=4000', f'--screenshot={png}', f'{CARD.as_uri()}?lang={lang}'],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)
        im = Image.open(png).convert('RGB')
        if im.size != SIZE:
            sys.exit(f'截图尺寸是 {im.size}，应该是 {SIZE}。')
        dest = OUT / f'share-{lang}.jpg'
        im.save(dest, 'JPEG', quality=88, optimize=True, progressive=True)
        return dest


if __name__ == '__main__':
    exe = browser()
    for lang in ('zh', 'en'):
        dest = shoot(lang, exe)
        print(f'{dest.relative_to(ROOT)}  {dest.stat().st_size / 1024:.0f} KB')
