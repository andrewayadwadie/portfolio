"""Gate: every word on the site matches the CV, and the site claims nothing extra.

Standard library only (zipfile, xml.etree, html, re, unicodedata): no package
manager, no project dependency. Run from the repo root:

    python3 specs/002-cv-motion-redesign/check-cv-sync.py

Reads word/document.xml from files/Andrew_Ayad_Flutter_Developer_CV.docx and
applies every rule in contracts/site-data.contract.md against js/data.js,
js/main.js and index.html. Exits 1 on any failure, printing
`FAIL <rule>: expected "<cv text>"` for each.
"""

import html
import re
import sys
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCX = ROOT / "files" / "Andrew_Ayad_Flutter_Developer_CV.docx"
DATA_JS = ROOT / "js" / "data.js"
MAIN_JS = ROOT / "js" / "main.js"
INDEX = ROOT / "index.html"

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

BANNED = [
    "11+",
    "~30%",
    "30%",
    "Glowy",
    "ClinicQ",
    "competencies",
    "Core competencies",
    "fintech-adjacent",
    "Professional Working Proficiency",
    "Open to senior Flutter roles",
    "side-projects",
]

SECTION_NAMES = [
    "PROFESSIONAL SUMMARY",
    "PROFESSIONAL EXPERIENCE",
    "TECHNICAL SKILLS",
    "EDUCATION",
    "LANGUAGES",
]

failures: list[str] = []
passes = 0


def norm(text: str) -> str:
    text = html.unescape(unicodedata.normalize("NFC", text))
    text = text.replace("—", "–")  # em and en dash compare equal
    return re.sub(r"\s+", " ", text).strip()


def strip_tags(markup: str) -> str:
    markup = re.sub(r"<script\b.*?</script>", " ", markup, flags=re.S)
    markup = re.sub(r"<svg\b.*?</svg>", " ", markup, flags=re.S)
    return re.sub(r"<[^>]+>", "", markup)


def check(rule: str, ok: bool, expected: str) -> None:
    global passes
    if ok:
        passes += 1
    else:
        failures.append(f'FAIL {rule}: expected "{expected}"')


def js_str(value: str) -> str:
    """The value as it is written inside a JS double-quoted string."""
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


# -- read the CV ---------------------------------------------------------------

def cv_paragraphs() -> list[str]:
    with zipfile.ZipFile(DOCX) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    out = []
    for p in root.iter(W + "p"):
        parts = []
        for node in p.iter():
            if node.tag == W + "t" and node.text:
                parts.append(node.text)
            elif node.tag == W + "tab":
                parts.append("\t")
        text = "".join(parts)
        if text.strip():
            out.append(unicodedata.normalize("NFC", text))
    return out


def split_outside_parens(text: str) -> list[str]:
    items, depth, buf = [], 0, ""
    i = 0
    while i < len(text):
        c = text[i]
        if c == "(":
            depth += 1
        elif c == ")":
            depth -= 1
        if depth == 0 and text.startswith(", ", i):
            items.append(buf.strip())
            buf = ""
            i += 2
            continue
        buf += c
        i += 1
    if buf.strip():
        items.append(buf.strip())
    return items


# -- main ----------------------------------------------------------------------

def main() -> int:
    paras = cv_paragraphs()
    data_raw = DATA_JS.read_text(encoding="utf-8")
    main_raw = MAIN_JS.read_text(encoding="utf-8")
    index_raw = INDEX.read_text(encoding="utf-8")

    data = norm(data_raw)
    index_text = norm(strip_tags(index_raw))
    haystack = data + "\n" + index_text

    # Section boundaries.
    idx = {name: paras.index(name) for name in SECTION_NAMES if name in paras}
    for name in SECTION_NAMES:
        check("cv-structure", name in idx, name)
    if len(idx) != len(SECTION_NAMES):
        return report()

    header = paras[: idx["PROFESSIONAL SUMMARY"]]

    # Line 1: name.
    name = header[0].strip().title()
    h1 = re.search(r"<h1\b[^>]*>(.*?)</h1>", index_raw, flags=re.S)
    check("name/h1", bool(h1) and norm(strip_tags(h1.group(1))) == name, name)
    check("name/profile.name", f"name: {js_str(name)}" in data, name)

    # Line 2: headline.
    headline = norm(header[1])
    check("headline/profile.headline", f"headline: {js_str(headline)}" in data, headline)
    check("headline/hero", headline in index_text, headline)

    # Contact lines.
    for line in header[2:]:
        for token in (norm(t) for t in line.split("•")):
            if token:
                check("contact", token in haystack, token)

    # Summary: in profile.summary and in the static #summary markup.
    summary = norm(" ".join(paras[idx["PROFESSIONAL SUMMARY"] + 1 : idx["PROFESSIONAL EXPERIENCE"]]))
    check("summary/profile.summary", f"summary: {js_str(summary)}" in data, summary[:60] + "…")
    sec = re.search(r'<section id="summary".*?</section>', index_raw, flags=re.S)
    check("summary/#summary", bool(sec) and summary in norm(strip_tags(sec.group(0))), summary[:60] + "…")

    # Experience.
    exp = paras[idx["PROFESSIONAL EXPERIENCE"] + 1 : idx["TECHNICAL SKILLS"]]
    employer_re = re.compile(r"^(?P<company>.+?)\s*\|\s*(?P<loc>.+?)\t+(?P<start>.+?)\s*[–—-]\s*(?P<end>.+)$")
    i = 0
    while i < len(exp):
        m = employer_re.match(exp[i].strip())
        if not m:
            check("experience/heading", False, exp[i])
            i += 1
            continue
        company, loc = norm(m["company"]), norm(m["loc"])
        start, end = norm(m["start"]), norm(m["end"])
        check("experience/company", f"company: {js_str(company)}" in data, company)
        check("experience/location", f"location: {js_str(loc)}" in data, loc)
        check("experience/start", f"start: {js_str(start)}" in data, start)
        check("experience/end", f"end: {js_str(end)}" in data, end)

        role = norm(exp[i + 1])
        check("experience/role", f"role: {js_str(role)}" in data, role)

        # Bullets until the next employer heading.
        j = i + 2
        block_start = data.find(f"company: {js_str(company)}")
        last_pos = block_start
        while j < len(exp) and not employer_re.match(exp[j].strip()):
            bullet = norm(exp[j])
            if bullet.startswith("Key products:"):
                body = bullet[len("Key products:"):].strip().rstrip(".")
                for raw in body.split("), "):
                    raw = raw if raw.endswith(")") else raw + ")"
                    pm = re.match(r"^(.*?) \((.*)\)$", raw)
                    if not pm:
                        check("experience/product-parse", False, raw)
                        continue
                    pname, pdesc = pm[1], pm[2]
                    pat = f"name: {js_str(pname)}, description: {js_str(pdesc)}"
                    pos = data.find(pat, block_start)
                    check("experience/product", pos != -1, f"{pname} ({pdesc})")
            else:
                pos = data.find(js_str(bullet), block_start)
                check("experience/bullet", pos != -1, bullet[:70] + "…")
                if pos != -1:
                    check("experience/bullet-order", pos > last_pos, bullet[:70] + "…")
                    last_pos = pos
            j += 1
        i = j

    # Skills: category exact; items exact and in order.
    skills = paras[idx["TECHNICAL SKILLS"] + 1 : idx["EDUCATION"]]
    skills_block_start = data.find("skills: [ {")
    if skills_block_start == -1:
        skills_block_start = data.find("skills: [")
    cat_count = 0
    for line in skills:
        cat, _, items = line.partition(":")
        cat = norm(cat)
        cat_count += 1
        cpos = data.find(f"category: {js_str(cat)}", skills_block_start)
        check("skills/category", cpos != -1, cat)
        if cpos == -1:
            continue
        nxt = data.find("category:", cpos + 1)
        block = data[cpos : nxt if nxt != -1 else data.find("education:", cpos)]
        expected = [norm(s) for s in split_outside_parens(items.strip())]
        found = re.findall(r'"((?:[^"\\]|\\.)*)"', block[block.find("skills:"):])
        check("skills/items", found == expected, f"{cat}: {', '.join(expected)}")
    check("skills/count", data.count("category:") == cat_count, f"{cat_count} skill groups")

    # Education.
    edu = [norm(p) for p in paras[idx["EDUCATION"] + 1 : idx["LANGUAGES"]]]
    degree, _, grad = edu[0].partition("|")
    degree, grad = norm(degree), norm(grad)
    check("education/degree", f"degree: {js_str(degree)}" in data, degree)
    year = grad.replace("Graduated", "").strip()
    check("education/graduated", f"graduated: {js_str(year)}" in data and '"Graduated "' in main_raw, grad)
    faculty_line = edu[1]
    fac, _, inst = faculty_line.partition(", ")
    check("education/faculty", f"faculty: {js_str(fac)}" in data, fac)
    check("education/institution", f"institution: {js_str(inst)}" in data, inst)
    pm = re.match(r"^Graduation Project: (.*?) – Grade: (.*)$", edu[2])
    check("education/project", bool(pm) and f"project: {js_str(pm[1])}" in data, edu[2])
    check("education/grade", bool(pm) and f"grade: {js_str(pm[2])}" in data, edu[2])

    # Languages.
    lang_line = " ".join(paras[idx["LANGUAGES"] + 1 :])
    pairs = re.findall(r"(\w+): (.+?)(?=\s{2,}\w+:|$)", lang_line)
    check("languages/count", len(pairs) == data.count("language:"), f"{len(pairs)} languages")
    for lang, level in pairs:
        lang, level = norm(lang), norm(level)
        check("languages", f"language: {js_str(lang)}, level: {js_str(level)}" in data, f"{lang}: {level}")

    # Section headings: CV names, CV order.
    expected_heads = [n.title() for n in SECTION_NAMES]
    found_heads = re.findall(r'heading: "([^"]+)"', data)
    check("sections/headings", found_heads[: len(expected_heads)] == expected_heads, " · ".join(expected_heads))

    # Reverse rule: no extra claims.
    sources = {"index.html": index_raw}
    for js in sorted((ROOT / "js").glob("*.js")):
        sources[f"js/{js.name}"] = js.read_text(encoding="utf-8")
    for label, text in sources.items():
        for banned in BANNED:
            check(f"banned/{label}", banned not in text, f"no '{banned}'")

    return report()


def report() -> int:
    for f in failures:
        print(f)
    print(f"\n{passes} passed, {len(failures)} failures")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
