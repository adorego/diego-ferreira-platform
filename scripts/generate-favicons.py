#!/usr/bin/env python3
"""Genera favicon.ico y los PNG de ícono en apps/web/public/ a partir del
ícono de llama recortado del logo."""

import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
WEB_PUBLIC = ROOT / "apps" / "web" / "public"
LOGO_PATH = WEB_PUBLIC / "images" / "diego_logo_cropped.png"

BG_KEY = (8, 8, 8)
BG_KEY_THRESHOLD = 25
ICON_BG = (8, 8, 8, 255)  # #080808
PADDING_RATIO = 0.08
FLAME_WIDTH_RATIO = 0.28  # los primeros ~28% del ancho del logo

PNG_TARGETS = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
}
ICO_SIZES = [16, 32, 48]


def remove_black_background(im: Image.Image) -> Image.Image:
    """Píxeles con distancia euclidiana < 25 a rgb(8,8,8) → alpha 0."""
    im = im.convert("RGBA")
    pixels = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            dist = math.sqrt((r - BG_KEY[0]) ** 2 + (g - BG_KEY[1]) ** 2 + (b - BG_KEY[2]) ** 2)
            if dist < BG_KEY_THRESHOLD:
                pixels[x, y] = (r, g, b, 0)
    return im


def extract_flame(logo: Image.Image) -> Image.Image:
    """Recorta solo el ícono de llama (primeros ~28% del ancho del logo).

    En vez de cortar en un x fijo (que puede caer en medio de una letra si el
    ancho real del ícono no es exactamente 28%), se busca el primer hueco
    vertical (columnas sin píxeles opacos) cercano a ese punto y se corta en
    el medio del hueco, para separar limpiamente el ícono del wordmark.
    """
    w, h = logo.size
    alpha = logo.getchannel("A")
    col_has_content = [alpha.crop((x, 0, x + 1, h)).getbbox() is not None for x in range(w)]

    approx_cut = round(w * FLAME_WIDTH_RATIO)
    search_start = max(0, approx_cut - 80)
    search_end = min(w, approx_cut + 80)

    gap_start = gap_end = None
    x = search_start
    while x < search_end:
        if not col_has_content[x]:
            start = x
            while x < w and not col_has_content[x]:
                x += 1
            if x - start >= 15:  # hueco real, no solo antialiasing
                gap_start, gap_end = start, x
                break
        else:
            x += 1

    cut = (gap_start + gap_end) // 2 if gap_start is not None else approx_cut

    flame = logo.crop((0, 0, cut, h))
    bbox = flame.getbbox()
    if bbox:
        flame = flame.crop(bbox)
    return flame


def make_icon(flame: Image.Image, size: int) -> Image.Image:
    """Compone la llama centrada sobre un canvas cuadrado #080808 con 8% de padding."""
    usable = round(size * (1 - 2 * PADDING_RATIO))
    fw, fh = flame.size
    scale = min(usable / fw, usable / fh)
    new_w, new_h = max(1, round(fw * scale)), max(1, round(fh * scale))
    resized_flame = flame.resize((new_w, new_h), Image.LANCZOS)

    canvas = Image.new("RGBA", (size, size), ICON_BG)
    x = (size - new_w) // 2
    y = (size - new_h) // 2
    canvas.alpha_composite(resized_flame, (x, y))
    return canvas


def main() -> None:
    if not LOGO_PATH.exists():
        raise SystemExit(f"No se encontró {LOGO_PATH}")

    logo = Image.open(LOGO_PATH)
    logo = remove_black_background(logo)
    flame = extract_flame(logo)

    for filename, size in PNG_TARGETS.items():
        icon = make_icon(flame, size)
        out_path = WEB_PUBLIC / filename
        icon.save(out_path, "PNG")
        print(f"OK: {out_path} -> {icon.size[0]}x{icon.size[1]}")

    ico_path = WEB_PUBLIC / "favicon.ico"
    largest = make_icon(flame, max(ICO_SIZES))
    largest.save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in ICO_SIZES],
    )
    print(f"OK: {ico_path} -> capas {ICO_SIZES}")


if __name__ == "__main__":
    main()
