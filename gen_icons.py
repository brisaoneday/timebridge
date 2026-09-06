from PIL import Image, ImageDraw
import os

DAY_SKY = (255, 205, 130)
NIGHT_SKY = (36, 40, 74)
SUN = (240, 170, 70)
MOON = (230, 228, 235)
BRIDGE = (250, 249, 246)
PYLON = (230, 226, 218)


def lerp(f, inset):
    # Scale a 0..1 fractional coordinate toward the center by `inset` on each side.
    return 0.5 + (f - 0.5) * (1 - 2 * inset)


def draw_scene(d, size, inset):
    cx = size / 2
    # Day/night background always bleeds to the full canvas, regardless of inset.
    d.rectangle([0, 0, cx, size], fill=DAY_SKY)
    d.rectangle([cx, 0, size, size], fill=NIGHT_SKY)

    def X(f):
        return lerp(f, inset) * size

    def Y(f):
        return lerp(f, inset) * size

    def L(f):
        # length (radius/width/height) scales with the same shrink factor
        return f * size * (1 - 2 * inset)

    sun_r = L(0.10)
    sx, sy = X(0.18), Y(0.22)
    d.ellipse([sx - sun_r, sy - sun_r, sx + sun_r, sy + sun_r], fill=SUN)

    moon_r = L(0.10)
    mcx, mcy = X(0.80), Y(0.22)
    d.ellipse([mcx - moon_r, mcy - moon_r, mcx + moon_r, mcy + moon_r], fill=MOON)
    d.ellipse([mcx - moon_r + moon_r * 0.55, mcy - moon_r, mcx + moon_r + moon_r * 0.55, mcy + moon_r], fill=NIGHT_SKY)

    # --- Bridge spanning across the day/night seam ---
    deck_y = Y(0.64)
    deck_left, deck_right = X(0.08), X(0.92)
    tower_h = L(0.30)
    tower_w = L(0.045)
    tower1_x = X(0.30)
    tower2_x = X(0.70)

    for tx in (tower1_x, tower2_x):
        d.rectangle([tx - tower_w / 2, deck_y - tower_h, tx + tower_w / 2, deck_y], fill=PYLON)

    deck_h = L(0.035)
    d.rectangle([deck_left, deck_y, deck_right, deck_y + deck_h], fill=BRIDGE)

    cable_w = max(2, int(L(0.008)))
    suspender_w = max(1, int(L(0.004)))

    def sag(x0, x1, top_y, low_y, steps=10):
        pts = []
        for i in range(steps + 1):
            t = i / steps
            x = x0 + (x1 - x0) * t
            y = top_y + (low_y - top_y) * (1 - (2 * t - 1) ** 2)
            pts.append((x, y))
        d.line(pts, fill=BRIDGE, width=cable_w)

    low_outer = deck_y - L(0.02)
    sag(deck_left, tower1_x, deck_y - tower_h * 0.75, low_outer)
    sag(tower1_x, tower2_x, deck_y - tower_h, deck_y - tower_h * 0.55)
    sag(tower2_x, deck_right, deck_y - tower_h * 0.75, low_outer)

    for i in range(1, 6):
        t = i / 6
        x = deck_left + (tower1_x - deck_left) * t
        y_top = deck_y - tower_h * 0.75 + (low_outer - (deck_y - tower_h * 0.75)) * (1 - (2 * t - 1) ** 2)
        d.line([(x, y_top), (x, deck_y)], fill=BRIDGE, width=suspender_w)
    for i in range(1, 6):
        t = i / 6
        x = tower2_x + (deck_right - tower2_x) * t
        y_top = deck_y - tower_h * 0.75 + (low_outer - (deck_y - tower_h * 0.75)) * (1 - (2 * t - 1) ** 2)
        d.line([(x, y_top), (x, deck_y)], fill=BRIDGE, width=suspender_w)


def make_icon(size, path, maskable=False):
    inset = 0.12 if maskable else 0.0
    img = Image.new("RGB", (size, size), (255, 255, 255))
    d = ImageDraw.Draw(img)
    draw_scene(d, size, inset)

    if not maskable:
        radius = int(size * 0.22)
        mask = Image.new("L", (size, size), 0)
        md = ImageDraw.Draw(mask)
        md.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=255)
        out = Image.new("RGB", (size, size), (255, 255, 255))
        out.paste(img, (0, 0), mask)
        img = out

    img.save(path)


os.makedirs("icons", exist_ok=True)
make_icon(192, "icons/icon-192.png", maskable=False)
make_icon(512, "icons/icon-512.png", maskable=False)
make_icon(192, "icons/icon-192-maskable.png", maskable=True)
make_icon(512, "icons/icon-512-maskable.png", maskable=True)
print("done")
