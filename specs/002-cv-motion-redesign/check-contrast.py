"""Verify every design token pair against the WCAG 2.1 contrast bars.

Standalone by design: no package manager, no project dependency (FR-019).
Run from the repo root:

    python3 specs/002-cv-motion-redesign/check-contrast.py

Exits non-zero if any pair falls below its bar, so it can gate a commit.
Token values must stay in sync with the :root and [data-theme="light"]
blocks in css/style.css.

Feature 002 adds the hero background: text sits on top of drifting gradient
blobs, so each theme is also checked against the worst case, a blob at its
peak alpha composited over --bg. The four blob alphas are read straight from
css/motion.css (research R8), so CSS and gate can never drift apart.
"""

import re
import sys
from pathlib import Path

MOTION_CSS = Path(__file__).resolve().parents[2] / "css" / "motion.css"
MAX_ALPHA = {"Dark theme": 0.35, "Light theme": 0.22}

DARK = {
    "bg": "#0d1514",
    "surface": "#121d1d",
    "text": "#e6ede9",
    "text-muted": "#9db0a8",
    "accent": "#4ade9b",
    "accent-warm": "#c99b70",
}

LIGHT = {
    "bg": "#f7f5f1",
    "surface": "#ffffff",
    "text": "#111d1a",
    "text-muted": "#4a5a53",
    "accent": "#0f6b45",
    "accent-warm": "#7a5334",
}

# (foreground token, background token, minimum ratio)
# 4.5 for body text, 3.0 for large text and interactive controls.
PAIRS = [
    ("text", "bg", 4.5),
    ("text", "surface", 4.5),
    ("text-muted", "bg", 4.5),
    ("text-muted", "surface", 4.5),
    ("accent", "bg", 3.0),
    ("accent", "surface", 3.0),
    ("accent-warm", "bg", 3.0),
    ("accent-warm", "surface", 3.0),
]


def _channel(value: int) -> float:
    c = value / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _channel(r) + 0.7152 * _channel(g) + 0.0722 * _channel(b)


def contrast(fg: str, bg: str) -> float:
    hi, lo = sorted((luminance(fg), luminance(bg)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def composite(fg_hex: str, bg_hex: str, alpha: float) -> str:
    f = [int(fg_hex.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]
    b = [int(bg_hex.lstrip("#")[i:i + 2], 16) for i in (0, 2, 4)]
    return "#" + "".join(f"{round(alpha * x + (1 - alpha) * y):02x}" for x, y in zip(f, b))


def blob_alphas() -> dict:
    """{'Dark theme': {'green': a, 'warm': a}, 'Light theme': {...}} from motion.css."""
    css = MOTION_CSS.read_text(encoding="utf-8")
    blocks = {
        "Dark theme": re.search(r":root\s*{([^}]*--blob-alpha[^}]*)}", css),
        "Light theme": re.search(r'\[data-theme="light"\]\s*{([^}]*--blob-alpha[^}]*)}', css),
    }
    out = {}
    for theme, m in blocks.items():
        if not m:
            raise SystemExit(f"blob alpha block for {theme} not found in {MOTION_CSS}")
        vals = dict(re.findall(r"--blob-alpha-(green|warm):\s*([0-9.]+)", m.group(1)))
        out[theme] = {k: float(v) for k, v in vals.items()}
    return out


# Text that sits on the hero: body copy at 4.5, the accent name at 3.0 (large).
HERO_PAIRS = [("text", 4.5), ("text-muted", 4.5), ("accent", 3.0)]


def check(theme_name: str, tokens: dict, alphas: dict) -> list[str]:
    failures = []
    print(f"\n{theme_name}")
    for fg, bg, bar in PAIRS:
        ratio = contrast(tokens[fg], tokens[bg])
        ok = ratio >= bar
        mark = "PASS" if ok else "FAIL"
        print(f"  [{mark}] {fg:<12} on {bg:<8} {ratio:6.2f}:1  (min {bar})")
        if not ok:
            failures.append(f"{theme_name}: {fg} on {bg} is {ratio:.2f}:1, needs {bar}:1")

    cap = MAX_ALPHA[theme_name]
    for blob, token in (("green", "accent"), ("warm", "accent-warm")):
        alpha = alphas[blob]
        label = f"bg+{blob}@{alpha:g}"
        if alpha > cap:
            failures.append(f"{theme_name}: {blob} blob alpha {alpha} exceeds cap {cap}")
            print(f"  [FAIL] {blob} blob alpha {alpha} > cap {cap}")
        surface = composite(tokens[token], tokens["bg"], alpha)
        for fg, bar in HERO_PAIRS:
            ratio = contrast(tokens[fg], surface)
            ok = ratio >= bar
            mark = "PASS" if ok else "FAIL"
            print(f"  [{mark}] {fg:<12} on {label:<16} {ratio:6.2f}:1  (min {bar})")
            if not ok:
                failures.append(f"{theme_name}: {fg} on {label} is {ratio:.2f}:1, needs {bar}:1")
    return failures


if __name__ == "__main__":
    alphas = blob_alphas()
    failures = check("Dark theme", DARK, alphas["Dark theme"]) + check(
        "Light theme", LIGHT, alphas["Light theme"]
    )
    if failures:
        print("\nSC-009 FAILED:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("\nSC-009 passed: all token pairs and hero composites clear their bar in both themes.")
