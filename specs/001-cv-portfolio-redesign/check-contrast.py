"""Verify every design token pair against the WCAG 2.1 contrast bars.

Standalone by design: no package manager, no project dependency (FR-019).
Run from the repo root:

    python specs/001-cv-portfolio-redesign/check-contrast.py

Exits non-zero if any pair falls below its bar, so it can gate a commit.
Token values must stay in sync with the :root and [data-theme="light"]
blocks in css/style.css.
"""

import sys

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


def check(theme_name: str, tokens: dict) -> list[str]:
    failures = []
    print(f"\n{theme_name}")
    for fg, bg, bar in PAIRS:
        ratio = contrast(tokens[fg], tokens[bg])
        ok = ratio >= bar
        mark = "PASS" if ok else "FAIL"
        print(f"  [{mark}] {fg:<12} on {bg:<8} {ratio:6.2f}:1  (min {bar})")
        if not ok:
            failures.append(f"{theme_name}: {fg} on {bg} is {ratio:.2f}:1, needs {bar}:1")
    return failures


if __name__ == "__main__":
    failures = check("Dark theme", DARK) + check("Light theme", LIGHT)
    if failures:
        print("\nSC-005 FAILED:")
        for f in failures:
            print(f"  - {f}")
        sys.exit(1)
    print("\nSC-005 passed: all token pairs clear their contrast bar in both themes.")
