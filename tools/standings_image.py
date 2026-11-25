"""Render a cropped Championship standings table as a PNG.

Usage: python3 tools/standings_image.py out.png "20|Lincoln City|16|15|-12" ... --highlight "Derby County"
Columns follow the post text order: Pos, Team, P, Pts, GD.

Club crests: if tools/crests/<team-slug>.png exists (e.g. derby-county.png),
it's drawn as a small round avatar left of the team name. Missing crests are
skipped, so the table still renders without them.
"""
import argparse
import os
import re
from PIL import Image, ImageDraw, ImageFont

CRESTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "crests")

FONT = "/usr/share/fonts/opentype/inter/Inter-%s.otf"
S = 2  # render scale


def slug(team):
    return re.sub(r"[^a-z0-9]+", "-", team.lower()).strip("-")


def avatar(path, size):
    """Crest fitted inside a white circle with a thin grey ring."""
    crest = Image.open(path).convert("RGBA")
    crest.thumbnail((int(size * 0.72), int(size * 0.72)), Image.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(out).ellipse([0, 0, size - 1, size - 1], fill="white",
                                outline="#BBBBBB", width=max(1, size // 20))
    out.alpha_composite(crest, ((size - crest.width) // 2, (size - crest.height) // 2))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("rows", nargs="+", help="pos|team|played|points|gd")
    ap.add_argument("--highlight", default="Derby County")
    ap.add_argument("--relegation-after", type=int, default=21,
                    help="draw a dotted line under this position (0 to disable)")
    ap.add_argument("--crests", default=CRESTS, help="folder of <team-slug>.png crests")
    a = ap.parse_args()

    rows = [r.split("|") for r in a.rows]
    head = ["Pos", "Team", "P", "Pts", "GD"]
    reg = ImageFont.truetype(FONT % "Regular", 22 * S)
    bold = ImageFont.truetype(FONT % "Bold", 22 * S)
    hfont = ImageFont.truetype(FONT % "SemiBold", 18 * S)

    pad, row_h, head_h = 28 * S, 56 * S, 48 * S
    # column x-positions and alignment: (x, anchor)
    crest_files = {r[1]: os.path.join(a.crests, slug(r[1]) + ".png") for r in rows}
    crest_files = {t: f for t, f in crest_files.items() if os.path.exists(f)}
    av, shift = 36 * S, (48 * S if crest_files else 0)
    cols = [(pad + 30 * S, "mm"), (pad + 80 * S + shift, "lm"), (pad + 420 * S + shift, "mm"),
            (pad + 500 * S + shift, "mm"), (pad + 590 * S + shift, "mm")]
    width = pad * 2 + 630 * S + shift
    height = pad * 2 + head_h + row_h * len(rows)

    img = Image.new("RGBA", (width, height), "white")
    d = ImageDraw.Draw(img)
    left, right = pad, width - pad

    y = pad
    for (x, anc), t in zip(cols, head):
        d.text((x, y + head_h / 2), t, font=hfont, fill="black", anchor=anc)
    y += head_h
    d.line([(left, y), (right, y)], fill="black", width=2 * S)

    for r in rows:
        hi = r[1] == a.highlight
        if hi:
            d.rectangle([left, y, right, y + row_h], fill="#E6FF00")
        for (x, anc), t in zip(cols, r):
            if t.startswith("-"):
                t = "−" + t[1:]  # proper minus sign
            d.text((x, y + row_h / 2), t, font=bold if hi else reg, fill="black", anchor=anc)
        if r[1] in crest_files:
            img.alpha_composite(avatar(crest_files[r[1]], av),
                                (pad + 80 * S, int(y + (row_h - av) / 2)))
        y += row_h
        if r[0] == str(a.relegation_after):
            dot, gap = 6 * S, 6 * S
            for x in range(left, right, dot + gap):
                d.line([(x, y), (min(x + dot, right), y)], fill="black", width=3 * S)
        else:
            d.line([(left, y), (right, y)], fill="black", width=S)

    # thicker border round the highlighted row, drawn last so it sits on top
    for i, r in enumerate(rows):
        if r[1] == a.highlight:
            top = pad + head_h + i * row_h
            d.rectangle([left, top, right, top + row_h], outline="black", width=4 * S)

    img.convert("RGB").save(a.out, optimize=True)


if __name__ == "__main__":
    main()
