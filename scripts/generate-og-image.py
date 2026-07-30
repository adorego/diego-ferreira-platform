#!/usr/bin/env python3
"""Genera apps/web/public/og-image.jpg (1200x630) a partir del hero y el logo."""

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
WEB_PUBLIC = ROOT / "apps" / "web" / "public"
IMAGES = WEB_PUBLIC / "images"

HERO_PATH = IMAGES / "hero_image.jpeg"
LOGO_PATH = IMAGES / "diego_logo_cropped.png"
OUT_PATH = WEB_PUBLIC / "og-image.jpg"

TARGET_W, TARGET_H = 1200, 630
BG_KEY = (8, 8, 8)
BG_KEY_THRESHOLD = 25
GOLD = (235, 191, 1)

FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def cover_crop(im: Image.Image, target_w: int, target_h: int) -> Image.Image:
    """Redimensiona con 'cover' (recorte centrado, sin deformar)."""
    src_w, src_h = im.size
    scale = max(target_w / src_w, target_h / src_h)
    new_w, new_h = round(src_w * scale), round(src_h * scale)
    resized = im.resize((new_w, new_h), Image.LANCZOS)
    left = (new_w - target_w) // 2
    top = (new_h - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def apply_gradient_overlay(im: Image.Image) -> Image.Image:
    """linear-gradient izq→der, rgba(10,10,10,0.72) → rgba(10,10,10,0.45)."""
    w, h = im.size
    overlay = Image.new("RGBA", (w, h))
    alpha_start, alpha_end = 0.72, 0.45
    row = []
    for x in range(w):
        t = x / (w - 1)
        a = round(255 * (alpha_start + (alpha_end - alpha_start) * t))
        row.append((10, 10, 10, a))
    data = row * h
    overlay.putdata(data)
    return Image.alpha_composite(im.convert("RGBA"), overlay)


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


def scale_to_width(im: Image.Image, max_width: int) -> Image.Image:
    w, h = im.size
    if w <= max_width:
        return im
    new_h = round(h * (max_width / w))
    return im.resize((max_width, new_h), Image.LANCZOS)


def main() -> None:
    if not HERO_PATH.exists():
        raise SystemExit(f"No se encontró {HERO_PATH}")
    if not LOGO_PATH.exists():
        raise SystemExit(f"No se encontró {LOGO_PATH}")

    hero = Image.open(HERO_PATH).convert("RGB")
    base = cover_crop(hero, TARGET_W, TARGET_H)
    base = apply_gradient_overlay(base)

    logo = Image.open(LOGO_PATH)
    logo = remove_black_background(logo)
    logo = scale_to_width(logo, 520)

    canvas = base.copy()

    logo_x = (TARGET_W - logo.width) // 2
    logo_y = 120
    canvas.alpha_composite(logo, (logo_x, logo_y))

    draw = ImageDraw.Draw(canvas)

    line_w, line_h = 200, 2
    line_gap = 28
    line_x0 = (TARGET_W - line_w) // 2
    line_y0 = logo_y + logo.height + line_gap
    draw.rectangle(
        [line_x0, line_y0, line_x0 + line_w, line_y0 + line_h],
        fill=(*GOLD, 255),
    )

    heading_font = ImageFont.truetype(FONT_BOLD, 28)
    heading_gap = 24
    heading_y = line_y0 + line_h + heading_gap
    draw.text(
        (TARGET_W // 2, heading_y),
        "Entrenamiento Mental de Alto Rendimiento",
        font=heading_font,
        fill=(255, 255, 255, 255),
        anchor="ma",
    )
    heading_bbox = draw.textbbox(
        (TARGET_W // 2, heading_y), "Entrenamiento Mental de Alto Rendimiento",
        font=heading_font, anchor="ma",
    )

    sub_font = ImageFont.truetype(FONT_REGULAR, 20)
    sub_gap = 12
    sub_y = heading_bbox[3] + sub_gap
    draw.text(
        (TARGET_W // 2, sub_y),
        "diegoferreira.coach",
        font=sub_font,
        fill=(200, 200, 200, 255),
        anchor="ma",
    )

    final = canvas.convert("RGB")
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    final.save(OUT_PATH, "JPEG", quality=95)

    print(f"OK: {OUT_PATH} -> {final.size[0]}x{final.size[1]}")


if __name__ == "__main__":
    main()
