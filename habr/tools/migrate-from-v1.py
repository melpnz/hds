from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT.parent / "archive" / "habr" / "v1"
GENERATED_DIRS = [
    ROOT / "machine" / "components",
    ROOT / "machine" / "foundations",
    ROOT / "machine" / "patterns",
    ROOT / "machine" / "documents",
    ROOT / "examples" / "generated",
    ROOT / "docs" / "rules",
    ROOT / "docs" / "patterns",
]
VIEWPORTS = [320, 480, 768, 1024]


FOUNDATIONS = [
    ("grid", "Сетка", "f-grid"),
    ("typography", "Типографика", "f-typography"),
    ("spacing", "Интервалы", "f-spacing"),
    ("colors", "Цвета и темы", "f-colors"),
    ("surfaces", "Поверхности", "f-surfaces"),
    ("header", "Шапка", "f-header"),
]

COMPONENTS = [
    ("button", "Button", "actions", "Кнопки и действия", "actions/button.md"),
    ("button-follow", "ButtonFollow", "actions", "Кнопки и действия", "actions/button-follow.md"),
    ("icon-button", "IconButton", "actions", "Кнопки и действия", "actions/icon-button.md"),
    ("votes", "Votes", "actions", "Кнопки и действия", "actions/votes.md"),
    ("field", "Field · Input / Textarea", "forms", "Поля и выбор", "forms/field.md"),
    ("checkbox", "Checkbox", "forms", "Поля и выбор", "forms/checkbox.md"),
    ("radio", "Radio", "forms", "Поля и выбор", "forms/radio.md"),
    ("chip", "Chip", "forms", "Поля и выбор", "forms/chip.md"),
    ("calendar", "Calendar", "forms", "Поля и выбор", "forms/calendar.md"),
    ("article-card", "ArticleCard", "content", "Контент и карточки", "content/article-card.md"),
    ("block", "Block", "content", "Контент и карточки", "content/block.md"),
    ("title", "Title", "content", "Контент и карточки", "content/title.md"),
    ("section-name", "SectionName", "content", "Контент и карточки", "content/section-name.md"),
    ("primitives", "Текстовые примитивы", "content", "Контент и карточки", "content/primitives.md"),
    ("badges", "Badges", "content", "Контент и карточки", "content/badges.md"),
    ("avatar", "Avatar", "content", "Контент и карточки", None),
    ("user-info", "UserInfo", "content", "Контент и карточки", None),
    ("notice", "Notice", "feedback", "Обратная связь", "feedback/notice.md"),
    ("tabs", "Tabs", "navigation", "Навигация", "navigation/tabs.md"),
    ("pagination", "Pagination", "navigation", "Навигация", "navigation/pagination.md"),
    ("popover", "Popover", "overlays", "Оверлеи", "overlays/popover.md"),
    ("dropdown", "Dropdown", "overlays", "Оверлеи", "overlays/dropdown.md"),
    ("dropdown-content", "Dropdown · строки панели", "overlays", "Оверлеи", "overlays/dropdown.md"),
    ("dialog", "Dialog / modal", "overlays", "Оверлеи", "overlays/dialog.md"),
    ("hint", "Informer / Hint", "overlays", "Оверлеи", "overlays/hint.md"),
]

PATTERNS = [
    ("shell", "Оболочка", "confirmed", "high", "production"),
    ("feed", "Content Feed / Listing", "confirmed", "high", "production"),
    ("directory", "Directory Listing", "confirmed", "medium", "production"),
    ("article-detail", "Article / Content Detail", "partial", "medium", "production"),
    ("article-comments", "Article Comments", "partial", "low", "production"),
    ("entity", "Profile / Entity", "confirmed", "high", "production"),
    ("search", "Search", "partial", "low", "production"),
    ("editor", "Editor / Content Creation", "missing", "low", "figma-fragment"),
    ("admin-section", "Admin · Section Screen", "confirmed", "medium", "figma"),
    ("admin-form", "Admin · Form / Wizard", "confirmed", "medium", "figma"),
    ("admin-list", "Admin · Management List", "confirmed", "high", "figma"),
    ("overlay-flows", "Modal / Overlay Flows", "partial", "medium", "storybook"),
    ("settings-forms", "Settings / Forms", "missing", "low", "none"),
    ("service-error", "Service / Error", "missing", "low", "none"),
]

PATTERN_COMPOSITION = {
    "shell": {
        "areas": ["header", "page-container", "main", "sidebar", "footer"],
        "modules": ["header", "page-wrapper", "footer"],
        "components": ["icon-button"],
        "sequence": [
            {"id": "header", "tag": "header", "heading": None, "modules": [{"id": "header", "count": 1}], "components": [{"id": "icon-button", "count": 2}]},
            {"id": "page-container", "tag": "main", "heading": None, "modules": [{"id": "page-wrapper", "count": 1}], "components": []},
            {"id": "main", "tag": "section", "heading": None, "modules": [], "components": []},
            {"id": "sidebar", "tag": "aside", "heading": None, "modules": [], "components": []},
            {"id": "footer", "tag": "footer", "heading": None, "modules": [{"id": "footer", "count": 1}], "components": []},
        ],
    },
    "feed": {
        "areas": ["feed-navigation", "article-list", "pagination", "sidebar"],
        "modules": ["article-list"],
        "components": ["tabs", "article-card", "pagination"],
        "sequence": [
            {"id": "feed-navigation", "tag": "nav", "heading": None, "modules": [], "components": [{"id": "tabs", "count": 1}]},
            {"id": "article-list", "tag": "section", "heading": None, "modules": [{"id": "article-list", "count": 1}], "components": [{"id": "article-card", "count": 2}]},
            {"id": "pagination", "tag": "nav", "heading": None, "modules": [], "components": [{"id": "pagination", "count": 1}]},
            {"id": "sidebar", "tag": "aside", "heading": None, "modules": [], "components": []},
        ],
    },
    "directory": {
        "areas": ["directory-navigation", "entity-list", "directory-sidebar", "pagination"],
        "modules": ["page-bound-entity-list", "page-bound-sidebar-filter"],
        "components": ["tabs", "pagination"],
        "sequence": [
            {"id": "directory-navigation", "tag": "nav", "heading": None, "modules": [], "components": [{"id": "tabs", "count": 1}]},
            {"id": "entity-list", "tag": "section", "heading": None, "modules": [{"id": "page-bound-entity-list", "count": 1}], "components": []},
            {"id": "directory-sidebar", "tag": "aside", "heading": None, "modules": [{"id": "page-bound-sidebar-filter", "count": 1}], "components": []},
            {"id": "pagination", "tag": "nav", "heading": None, "modules": [], "components": [{"id": "pagination", "count": 1}]},
        ],
    },
    "entity": {
        "areas": ["identity-card", "entity-navigation", "entity-content", "entity-facts"],
        "modules": ["entity-identity-card", "entity-content", "entity-facts"],
        "components": ["avatar", "button-follow", "tabs", "block"],
        "sequence": [
            {"id": "identity-card", "tag": "section", "heading": None, "modules": [{"id": "entity-identity-card", "count": 1}], "components": [{"id": "avatar", "count": 1}, {"id": "button-follow", "count": 1}]},
            {"id": "entity-navigation", "tag": "nav", "heading": None, "modules": [], "components": [{"id": "tabs", "count": 1}]},
            {"id": "entity-content", "tag": "main", "heading": None, "modules": [{"id": "entity-content", "count": 1}], "components": [{"id": "block", "count": 1}]},
            {"id": "entity-facts", "tag": "aside", "heading": None, "modules": [{"id": "entity-facts", "count": 1}], "components": []},
        ],
    },
    "admin-section": {
        "areas": ["company-identity", "admin-navigation", "section-content", "section-navigation", "news-widget"],
        "modules": ["company-identity-card", "admin-section-content", "admin-section-navigation", "news-widget"],
        "components": ["tabs", "block", "notice", "button"],
        "sequence": [
            {"id": "company-identity", "tag": "section", "heading": None, "modules": [{"id": "company-identity-card", "count": 1}], "components": []},
            {"id": "admin-navigation", "tag": "nav", "heading": None, "modules": [], "components": [{"id": "tabs", "count": 1}]},
            {"id": "section-content", "tag": "main", "heading": None, "modules": [{"id": "admin-section-content", "count": 1}], "components": [{"id": "block", "count": 1}, {"id": "notice", "count": 1}, {"id": "button", "count": 1}]},
            {"id": "section-navigation", "tag": "aside", "heading": None, "modules": [{"id": "admin-section-navigation", "count": 1}], "components": []},
            {"id": "news-widget", "tag": "aside", "heading": "Новости Хабра", "modules": [{"id": "news-widget", "count": 1}], "components": []},
        ],
    },
    "admin-form": {
        "areas": ["task-title", "form-card", "progress-stepper"],
        "modules": ["admin-form-card", "progress-stepper"],
        "components": ["title", "radio", "field", "hint", "button"],
        "sequence": [
            {"id": "task-title", "tag": "header", "heading": "Заявка на корпоративный блог", "modules": [], "components": [{"id": "title", "count": 1}]},
            {"id": "form-card", "tag": "form", "heading": "Реквизиты компании", "modules": [{"id": "admin-form-card", "count": 1}], "components": [{"id": "radio", "count": 1}, {"id": "field", "count": 2}, {"id": "hint", "count": 1}, {"id": "button", "count": 2}]},
            {"id": "progress-stepper", "tag": "aside", "heading": None, "modules": [{"id": "progress-stepper", "count": 1}], "components": []},
        ],
    },
    "admin-list": {
        "areas": ["management-list"],
        "modules": ["management-row"],
        "components": ["icon-button", "chip"],
        "sequence": [
            {"id": "management-list", "tag": "section", "heading": None, "modules": [{"id": "management-row", "count": 4}], "components": [{"id": "icon-button", "count": 2}, {"id": "chip", "count": 2}]},
        ],
    },
}

DOCUMENTS = [
    ("guide-overview", "Обзор и границы знаний", "README.md", "Обзор"),
    ("v1-overview", "Исходный обзор v1", "docs/source/v1-overview.md", "Обзор"),
    ("component-index", "Реестр компонентов", "components/INDEX.md", "Реестры"),
    ("roadmap", "Roadmap", "ROADMAP.md", "Реестры"),
    ("pattern-taxonomy", "Таксономия page patterns", "evidence/pattern-taxonomy.md", "Evidence"),
    ("source-map", "Карта источников", "evidence/source-map.md", "Evidence"),
    ("conflicts", "Конфликты источников", "evidence/conflicts.md", "Evidence"),
    ("runtime-contract", "Runtime contract", "evidence/runtime-contract.md", "Evidence"),
    ("production-validation", "Production validation", "evidence/production-validation.md", "Evidence"),
    ("figma-inventory", "Figma inventory", "evidence/figma-inventory.md", "Evidence"),
    ("figma-parity-roadmap", "Figma parity roadmap", "evidence/figma-parity-roadmap.md", "Evidence"),
    ("asset-guide", "Гайд по ассетам", "ui/assets/README.md", "Ассеты"),
    ("logo-guide", "Логотипы Habr", "ui/assets/icons/logo/README.md", "Ассеты"),
    ("theme-guide", "Темы Habr", "ui/themes/README.md", "Ассеты"),
    ("legacy-checks", "Проверки исходного пакета", "check/README.md", "Приёмка"),
]


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def slug(value: str, fallback: str) -> str:
    value = value.lower().replace("ё", "е")
    value = re.sub(r"[^a-zа-я0-9]+", "-", value).strip("-")
    translit = str.maketrans("абвгдежзийклмнопрстуфхцчшщъыьэюя", "abvgdezzijklmnoprstufhccss_y_eua")
    value = value.translate(translit)
    value = re.sub(r"[^a-z0-9-]", "", value)
    return value[:48].strip("-") or fallback


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", BeautifulSoup(value, "html.parser").get_text(" ", strip=True)).strip()


def markdown_summary(path: Path, fallback: str) -> str:
    if not path.exists():
        return fallback
    text = path.read_text(encoding="utf-8")
    for paragraph in re.split(r"\n\s*\n", text):
        paragraph = paragraph.strip()
        if paragraph and not paragraph.startswith(("#", "|", "```", "---")):
            return re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", re.sub(r"[*_`]", "", paragraph)).replace("\n", " ")
    return fallback


def gaps_from_markdown(path: Path | None) -> list[str]:
    if not path or not path.exists():
        return []
    results = []
    blocks = re.split(r"\n\s*\n", path.read_text(encoding="utf-8"))
    for block in blocks:
        if re.search(r"\b(GAP|не покрыт|не подтвержден|не исследован)", block, re.I):
            text = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", block)
            text = re.sub(r"[*_`#>]", "", text)
            text = re.sub(r"^\s*[-+]\s+", "", text, flags=re.M)
            text = re.sub(r"\s+", " ", text).strip()
            if text and text not in results:
                results.append(text)
    return results[:6]


def visual_from_css(paths: list[Path]) -> dict | None:
    tracked = ("width", "height", "min-width", "min-height", "max-width", "padding", "gap", "border", "border-radius", "background", "background-color", "color", "object-fit", "font-size", "line-height", "font-weight", "box-shadow")
    values: dict[str, list[str]] = {}
    dimension_values = {}
    dimension_path = ROOT / "machine" / "dimension-tokens.json"
    if dimension_path.exists():
        dimension_document = json.loads(dimension_path.read_text(encoding="utf-8"))
        dimension_values = {
            token["cssVariable"]: token["$value"]
            for group in dimension_document.get("tokens", {}).values()
            for token in group.values()
        }
    for path in paths:
        if not path.exists():
            continue
        source = re.sub(r"/\*[\s\S]*?\*/", "", path.read_text(encoding="utf-8"))
        source = re.sub(r"var\((--habr-[^)]+)\)", lambda match: dimension_values.get(match.group(1), match.group(0)), source)
        for prop, value in re.findall(r"([a-z-]+)\s*:\s*([^;}]+)", source):
            if prop not in tracked:
                continue
            cleaned = re.sub(r"\s+", " ", value).strip()
            bucket = values.setdefault(prop, [])
            if cleaned not in bucket and len(bucket) < 12:
                bucket.append(cleaned)
    if not values:
        return None
    return {"source": [path.relative_to(ROOT).as_posix() for path in paths if path.exists()], "properties": values}


def rewrite_fragment(fragment: BeautifulSoup, page: bool = False, section_id: str = "") -> str:
    for tag in fragment.select("script"):
        tag.decompose()
    for tag in fragment.select(".doc-note, .doc-meta, .doc-family__note, .doc-family__meta"):
        tag.decompose()
    if page:
        for text in list(fragment.find_all(string=True)):
            if isinstance(text, NavigableString) and re.match(r"^\s*\[.+\]\s*$", str(text), re.S):
                text.extract()
    if section_id == "admin-list":
        wrapper = fragment.select_one('.doc-frame > div[style*="display:flex"]')
        if wrapper:
            cards = wrapper.find_all("div", recursive=False)
            if len(cards) > 1:
                cards[1].decompose()
            label = wrapper.find("div", string=lambda value: value and value.strip() == "Desktop")
            if label:
                label.decompose()
    if section_id == "shell":
        for selector in (".tm-page__main", ".tm-page__sidebar"):
            node = fragment.select_one(selector)
            if node:
                node.clear()
    for tag in fragment.find_all(True):
        for attr in ("src", "href"):
            value = tag.get(attr)
            if value and value.startswith("../ui/"):
                tag[attr] = "../../../../ui/" + value[len("../ui/"):]
        for attr in ("href", "xlink:href"):
            value = tag.get(attr)
            if value and value.startswith("#"):
                tag[attr] = "../../../../ui/assets/icons/megazord.svg" + value
    body = fragment.decode_contents()
    if section_id == "feed":
        body = f'''<div class="tm-header" style="position:static">
<div class="tm-header__container tm-page-width">
<div class="example-header-brand"><svg class="tm-svg-img" height="24" width="24"><use xlink:href="../../../../ui/assets/icons/megazord.svg#header-burger"></use></svg><strong>Хабр</strong></div>
<div class="example-header-actions"><svg class="tm-svg-img" height="20" width="20"><use xlink:href="../../../../ui/assets/icons/megazord.svg#search"></use></svg><svg class="tm-svg-img" height="20" width="20"><use xlink:href="../../../../ui/assets/icons/megazord.svg#write"></use></svg></div>
</div></div>
<div class="example-page-shell"><div class="tm-page-width"><div class="tm-page__wrapper">
<main class="tm-page__main tm-page__main_has-sidebar">{body}</main>
<aside class="tm-page__sidebar" aria-label="Боковая колонка"></aside>
</div></div></div>'''
    return body


def example_document(title: str, body: str, page: bool = False, section_id: str = "") -> str:
    extra = '<link rel="stylesheet" href="../../../../examples/showcase-pages.css">' if page else '<link rel="stylesheet" href="../../../../examples/showcase-components.css">'
    body_class = f"migration-example migration-example--page pattern-{section_id}" if page else "migration-example migration-example--intrinsic"
    return f'''<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <link rel="stylesheet" href="../../../../ui/themes/light-v2.css">
  <link rel="stylesheet" href="../../../../ui/habr.css">
  {extra}
  <link rel="stylesheet" href="../../../../examples/example-shell.css">
</head>
<body class="{body_class}">
{body}
<script src="../../../../examples/components.js"></script>
</body>
</html>
'''


def section_examples(source_html: Path, section_id: str, output_group: str, page: bool = False) -> tuple[list[dict], list[dict], str]:
    soup = BeautifulSoup(source_html.read_text(encoding="utf-8"), "html.parser")
    section = soup.find(id=section_id)
    if not section:
        return [], [{"type": "coverage-warning", "text": f"Секция #{section_id} не найдена в исходной витрине."}], ""
    notes = []
    for node in section.select(".doc-note, .doc-family__note"):
        text = clean_text(str(node))
        if text:
            notes.append({"type": "guidance", "text": text})
    meta = section.select_one(".doc-meta, .doc-family__meta")
    if meta:
        notes.append({"type": "guidance", "text": clean_text(str(meta))})

    candidates = section.select(":scope > .doc-specimen") if not page else section.select(":scope > .doc-frame")
    if not candidates:
        candidates = section.select(".doc-specimen") if not page else section.select(".doc-frame")
    if not candidates:
        cleaned = BeautifulSoup(str(section), "html.parser")
        for node in cleaned.select("h2, .doc-meta, .doc-note, .doc-family__head, .doc-gaps"):
            node.decompose()
        candidates = [cleaned]

    examples = []
    used_ids: set[str] = set()
    for index, candidate in enumerate(candidates, start=1):
        fragment = BeautifulSoup(str(candidate), "html.parser")
        label = fragment.select_one(".doc-specimen-label")
        example_title = clean_text(str(label)) if label else ("Страница" if page and len(candidates) == 1 else f"Пример {index}")
        if label:
            label.decompose()
        root = fragment.find()
        body = rewrite_fragment(root if root else fragment, page=page, section_id=section_id)
        example_id = slug(example_title, f"example-{index}")
        while example_id in used_ids:
            example_id = f"{example_id}-{index}"
        used_ids.add(example_id)
        relative = Path("examples") / "generated" / output_group / section_id / f"{example_id}.html"
        target = ROOT / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(example_document(example_title, body, page=page, section_id=section_id), encoding="utf-8")
        examples.append({
            "id": example_id,
            "title": example_title,
            "file": relative.as_posix(),
            "covers": [section_id],
            "preview": {"mode": "viewport", "widths": VIEWPORTS, "height": 700} if page else {"mode": "intrinsic"},
        })
    return examples, notes, clean_text(str(section.select_one(".doc-note, .doc-family__note") or ""))


def icon_examples() -> list[dict]:
    groups = [
        ("production", "Production icons", ROOT / "ui/assets/icons/single"),
        ("editor", "Editor icon library", ROOT / "ui/assets/icons/library"),
        ("illustrations", "Иллюстрации", ROOT / "ui/assets/illustrations"),
    ]
    examples = []
    for group_id, title, directory in groups:
        files = sorted(path for path in directory.rglob("*.svg"))
        cards = "\n".join(
            f'<figure class="asset-card"><img src="../../../../{path.relative_to(ROOT).as_posix()}" alt=""><figcaption>{path.stem}</figcaption></figure>'
            for path in files
        )
        relative = Path("examples/generated/foundations/icons") / f"{group_id}.html"
        target = ROOT / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(example_document(title, f'<div class="asset-grid">{cards}</div>'), encoding="utf-8")
        examples.append({"id": group_id, "title": f"{title} · {len(files)}", "file": relative.as_posix(), "covers": [f"{len(files)}-assets"], "preview": {"mode": "intrinsic"}})
    return examples


def base_item(item_id: str, title: str, kind: str, category: str, purpose: str, maturity: str = "complete", confidence: str = "high") -> dict:
    return {
        "$schema": "../../schema.json",
        "id": item_id,
        "title": title,
        "kind": kind,
        "category": category,
        "maturity": {"spec": maturity, "markup": "available"},
        "knowledge": {"authority": [], "confidence": confidence, "scope": "habr"},
        "purpose": purpose,
        "implementation": {"markup": "available-in-examples", "cssRoots": [], "styles": ["ui/habr.css"], "scripts": []},
        "states": {"ui": [], "feature": [], "domain": []},
        "examples": [],
        "evidence": [],
        "unknowns": [],
    }


def split_rule_documents() -> list[tuple[str, str, str, str]]:
    source = (ROOT / "RULES.md").read_text(encoding="utf-8")
    matches = list(re.finditer(r"^(##|###)\s+(.+)$", source, re.M))
    results = []
    for index, match in enumerate(matches):
        level, title = match.groups()
        if level == "###" and not title.startswith("DG-"):
            continue
        end = len(source)
        for next_match in matches[index + 1:]:
            if level == "##" and (next_match.group(1) == "##" or next_match.group(2).startswith("DG-")):
                end = next_match.start()
                break
            if level == "###" and (next_match.group(1) == "##" or next_match.group(2).startswith("DG-")):
                end = next_match.start()
                break
        content = source[match.start():end].strip() + "\n"
        prefix = "decision" if title.startswith("DG-") else "rule"
        item_id = f"{prefix}-{slug(title, str(index + 1))}"
        path = ROOT / "docs" / "rules" / f"{item_id}.md"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        results.append((item_id, clean_text(title), path.relative_to(ROOT).as_posix(), "Decision Guides" if prefix == "decision" else "Правила композиции"))
    return results


def split_pattern_documents() -> dict[str, str]:
    source_path = ROOT / "evidence" / "pattern-taxonomy.md"
    source = source_path.read_text(encoding="utf-8")
    matches = list(re.finditer(r"^##\s+(\d+)\s+·\s+(.+)$", source, re.M))
    output = {}
    direct_map = {
        1: "shell", 2: "feed", 3: "directory", 4: "article-detail",
        5: "article-comments", 6: "entity", 7: "search", 8: "editor",
        10: "overlay-flows", 11: "settings-forms", 12: "service-error",
    }
    for index, match in enumerate(matches):
        number = int(match.group(1))
        end = matches[index + 1].start() if index + 1 < len(matches) else len(source)
        content = source[match.start():end].strip() + "\n"
        if number == 9:
            subpatterns = list(re.finditer(r"^###\s+9\.(1|2|3)\s+·\s+(.+)$", content, re.M))
            sub_ids = {"1": "admin-section", "2": "admin-form", "3": "admin-list"}
            for sub_index, submatch in enumerate(subpatterns):
                sub_end = subpatterns[sub_index + 1].start() if sub_index + 1 < len(subpatterns) else len(content)
                pattern_id = sub_ids[submatch.group(1)]
                path = ROOT / "docs" / "patterns" / f"{pattern_id}.md"
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content[submatch.start():sub_end].strip() + "\n", encoding="utf-8")
                output[pattern_id] = path.relative_to(ROOT).as_posix()
            continue
        pattern_id = direct_map.get(number)
        if not pattern_id:
            continue
        path = ROOT / "docs" / "patterns" / f"{pattern_id}.md"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        output[pattern_id] = path.relative_to(ROOT).as_posix()
    return output


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(f"Archive source is missing: {SOURCE}")
    for directory in GENERATED_DIRS:
        resolved = directory.resolve()
        if ROOT.resolve() not in resolved.parents:
            raise SystemExit(f"Unsafe generated path: {resolved}")
        if directory.exists():
            shutil.rmtree(directory)
        directory.mkdir(parents=True, exist_ok=True)

    catalog = []
    component_html = SOURCE / "showcase" / "components.html"
    page_html = SOURCE / "showcase" / "pages.html"
    pattern_docs = split_pattern_documents()

    for item_id, title, source_id in FOUNDATIONS:
        examples, notes, section_summary = section_examples(component_html, source_id, "foundations")
        item = base_item(item_id, title, "foundation", "foundations", section_summary or f"Базовые значения и правила Habr: {title.lower()}.")
        item["knowledge"]["authority"] = ["production", "storybook", "figma"]
        item["examples"] = examples
        item["previewNotes"] = notes
        item["implementation"]["cssRoots"] = [source_id]
        item["evidence"] = [{"type": "legacy-showcase", "ref": f"archive:habr/v1/showcase/components.html#{source_id}"}]
        path = Path("machine/foundations") / f"{item_id}.json"
        write_json(ROOT / path, item)
        catalog.append({"id": item_id, "title": title, "kind": "foundation", "category": "foundations", "navSection": "foundations", "navSectionTitle": "Основы", "navGroup": "visual", "navGroupTitle": "Визуальный язык", "file": path.as_posix(), "tags": [item_id, source_id]})

    icon_item = base_item("icons", "Иконки и иллюстрации", "foundation", "assets", "Полный адресный инвентарь production-иконок, редакторских иконок и иллюстраций Habr.")
    icon_item["knowledge"]["authority"] = ["production-bundle", "figma"]
    icon_item["examples"] = icon_examples()
    icon_item["implementation"]["cssRoots"] = ["tm-svg-icon", "tm-svg-img"]
    icon_item["markdown"] = "components/data/icon.md"
    icon_item["evidence"] = [{"type": "inventory", "ref": "evidence/icon-library-map.json"}]
    write_json(ROOT / "machine/foundations/icons.json", icon_item)
    catalog.append({"id": "icons", "title": "Иконки и иллюстрации", "kind": "foundation", "category": "assets", "navSection": "foundations", "navSectionTitle": "Основы", "navGroup": "assets", "navGroupTitle": "Ассеты", "file": "machine/foundations/icons.json", "markdown": "components/data/icon.md", "tags": ["icons", "svg", "illustrations", "sprite", "assets"]})

    for item_id, title, category, group_title, doc_relative in COMPONENTS:
        doc_path = ROOT / "components" / doc_relative if doc_relative else None
        examples, notes, section_summary = section_examples(component_html, item_id, "components")
        purpose = markdown_summary(doc_path, section_summary or f"Компонент Habr: {title}.") if doc_path else (section_summary or f"Компонент Habr: {title}.")
        item = base_item(item_id, title, "component", category, purpose)
        item["knowledge"]["authority"] = ["production", "storybook"]
        item["examples"] = examples
        item["previewNotes"] = notes
        item["implementation"]["cssRoots"] = [item_id]
        css_candidates = [ROOT / "ui/components" / f"{item_id}.css"]
        if item_id == "field":
            css_candidates = [ROOT / "ui/components/input.css", ROOT / "ui/components/textarea.css"]
        elif item_id == "user-info":
            css_candidates = [ROOT / "ui/components/article-card.css"]
        elif item_id == "dropdown-content":
            css_candidates = [ROOT / "ui/components/dropdown.css"]
        item["implementation"]["styles"] = [path.relative_to(ROOT).as_posix() for path in css_candidates if path.exists()]
        extracted_visual = visual_from_css(css_candidates)
        if extracted_visual:
            item["visual"] = extracted_visual
        if item_id == "user-info":
            item["visual"] = {"source": ["ui/components/article-card.css"], "avatar": "24px", "avatarRadius": "4px", "inlineGap": "4px", "mobileStackGap": "2px"}
        if item_id == "avatar":
            item["purpose"] += " Нормативный гайд округляет production-radius 3px до токена --habr-radius-4."
        item["evidence"] = [{"type": "legacy-showcase", "ref": f"archive:habr/v1/showcase/components.html#{item_id}"}]
        if doc_path and doc_path.exists():
            item["markdown"] = doc_path.relative_to(ROOT).as_posix()
            item["evidence"].append({"type": "component-spec", "ref": item["markdown"]})
        item["unknowns"] = gaps_from_markdown(doc_path)
        if item_id == "button":
            item["visual"] = {
                "source": "ui/components/button.css and components/actions/button.md",
                "radius": "4px",
                "sizes": {
                    "small": {"height": "32px", "padding": "8px 14px"},
                    "middle": {"height": "36px", "padding": "10px 14px"},
                    "large": {"height": "40px", "padding": "12px 16px"},
                },
                "responsive": "Размеры не зависят от ширины вьюпорта.",
            }
        path = Path("machine/components") / f"{item_id}.json"
        write_json(ROOT / path, item)
        entry = {"id": item_id, "title": title, "kind": "component", "category": category, "navSection": "components", "navSectionTitle": "Компоненты", "navGroup": category, "navGroupTitle": group_title, "file": path.as_posix(), "tags": [item_id, title.lower(), category]}
        if item.get("markdown"):
            entry["markdown"] = item["markdown"]
        catalog.append(entry)

    for item_id, title, source_status, confidence, authority in PATTERNS:
        examples, notes, section_summary = section_examples(page_html, item_id, "patterns", page=True) if item_id in {"shell", "feed", "directory", "entity", "admin-section", "admin-form", "admin-list"} else ([], [], "")
        doc_relative = pattern_docs.get(item_id)
        doc_path = ROOT / doc_relative if doc_relative else None
        purpose = markdown_summary(doc_path, section_summary or f"Семейство страниц Habr: {title}.") if doc_path else (section_summary or f"Семейство страниц Habr: {title}.")
        maturity = "complete" if source_status == "confirmed" else source_status
        item = base_item(item_id, title, "pattern", "page-families", purpose, maturity=maturity, confidence=confidence)
        item["sourceStatus"] = source_status
        item["knowledge"]["authority"] = [] if authority == "none" else [authority]
        item["family"] = item_id.upper().replace("-", "_")
        composition = PATTERN_COMPOSITION.get(item_id, {})
        item["areas"] = composition.get("areas", [])
        item["modules"] = composition.get("modules", [])
        item["components"] = composition.get("components", [])
        if composition.get("sequence"):
            item["sequence"] = composition["sequence"]
        item["examples"] = examples
        item["previewNotes"] = notes
        if doc_relative:
            item["markdown"] = doc_relative
            item["unknowns"] = gaps_from_markdown(doc_path)
        if not examples:
            item["maturity"]["markup"] = "missing"
            item["implementation"] = {
                "markup": None,
                "styles": [],
                "missingReason": "copy-safe-page-example-not-captured",
                "fallback": "Использовать ближайший подтверждённый паттерн и явно раскрыть допущение. Не восстанавливать DOM по названию семейства.",
            }
        item["evidence"] = [{"type": authority, "ref": doc_relative or "evidence/pattern-taxonomy.md"}] if authority != "none" else []
        path = Path("machine/patterns") / f"{item_id}.json"
        write_json(ROOT / path, item)
        entry = {"id": item_id, "title": title, "kind": "pattern", "category": "page-families", "navSection": "patterns", "navSectionTitle": "Паттерны", "navGroup": "pages", "navGroupTitle": "Страницы", "file": path.as_posix(), "tags": [item_id, title.lower(), source_status, authority]}
        if doc_relative:
            entry["markdown"] = doc_relative
        catalog.append(entry)

    document_rows = DOCUMENTS + split_rule_documents()
    for item_id, title, markdown, group_title in document_rows:
        markdown_path = ROOT / markdown
        item = base_item(item_id, title, "document", "documentation", markdown_summary(markdown_path, title))
        item["previewMode"] = "none"
        item["implementation"] = {"markup": None, "styles": [], "missingReason": "not-applicable-document", "fallback": "Read the linked Markdown document."}
        item["markdown"] = markdown
        item["knowledge"] = {"authority": ["migrated-source"], "confidence": "high", "scope": "habr"}
        item["evidence"] = [{"type": "source-document", "ref": markdown}]
        path = Path("machine/documents") / f"{item_id}.json"
        write_json(ROOT / path, item)
        catalog.append({"id": item_id, "title": title, "kind": "document", "category": "documentation", "navSection": "documents", "navSectionTitle": "Документы", "navGroup": slug(group_title, "docs"), "navGroupTitle": group_title, "file": path.as_posix(), "markdown": markdown, "tags": [item_id, title.lower(), group_title.lower()]})

    write_json(ROOT / "machine/catalog.json", catalog)
    search_index = []
    for entry in catalog:
        item = json.loads((ROOT / entry["file"]).read_text(encoding="utf-8"))
        parts = [entry["id"], entry["title"], " ".join(entry.get("tags", [])), item.get("purpose", ""), " ".join(item.get("unknowns", []))]
        if item.get("markdown") and (ROOT / item["markdown"]).exists():
            parts.append((ROOT / item["markdown"]).read_text(encoding="utf-8"))
        search_index.append({"id": entry["id"], "text": "\n".join(parts).lower()})
    write_json(ROOT / "viewer/search-index.json", search_index)

    light = (ROOT / "ui/themes/light-v2.css").read_text(encoding="utf-8")
    dark = (ROOT / "ui/themes/dark-v2.css").read_text(encoding="utf-8")
    variable_pattern = re.compile(r"(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);")
    light_tokens = dict(variable_pattern.findall(light))
    dark_tokens = dict(variable_pattern.findall(dark))
    write_json(ROOT / "machine/tokens.json", {"source": ["ui/themes/light-v2.css", "ui/themes/dark-v2.css"], "themes": {"light-v2": light_tokens, "dark-v2": dark_tokens}, "counts": {"light": len(light_tokens), "dark": len(dark_tokens)}})
    write_json(ROOT / "machine/style-profile.json", {
        "schemaVersion": 1,
        "dimensionTokens": {"baseUnit": "4px", "source": "machine/dimension-tokens.json", "css": "ui/dimension-tokens.css", "exceptions": "machine/reports/dimension-exceptions.json"},
        "product": {"id": "habr", "title": "Хабр", "guideVersion": "1.0", "status": "active-with-coverage-limits"},
        "scope": {"confidence": "mixed", "boundary": "Публичный гостевой production-срез и подтверждённые экраны company admin."},
        "typography": {
            "families": {"interface": "-apple-system, BlinkMacSystemFont, Arial, sans-serif", "display": "Fira Sans, sans-serif"},
            "roles": {"titleH1": "24px/1.3", "titleH2": "20px/1.3", "body": "15px/24px", "secondary": "13px/16px"}
        },
        "colors": {
            "themes": ["light-v2", "dark-v2"],
            "roles": {name: {"light": light_tokens.get(name), "dark": dark_tokens.get(name)} for name in (
                "--text-main", "--text-secondary", "--background-primary", "--background-secondary",
                "--accent-primary", "--accent-primary-hover", "--accent-positive", "--accent-danger",
                "--header-background", "--header-text"
            )}
        },
        "shape": {"radii": {"control": "4px"}, "borders": {"default": "1px"}, "shadows": {"default": "none"}},
        "layout": {
            "container": {"desktop": "1096px with 24px padding", "tablet": "768px with 16px padding", "mobile": "edge-to-edge"},
            "sidebar": "300px", "breakpoints": {"mobile": "767px", "desktop": "1024px"}, "header": {"desktop": "56px", "mobile": "48px"}
        },
        "signaturePatterns": [
            {"id": "reserved-sidebar", "rule": "Сайдбар — зарезервированная колонка и может оставаться пустым.", "evidence": "docs/patterns/shell.md"},
            {"id": "flat-dense-controls", "rule": "Компактные контролы используют токен радиуса 4px; production-значение 3px нормализовано дизайнерским решением.", "evidence": "ui/components/button.css"},
            {"id": "theme-pair", "rule": "Семантические роли поддерживают светлую и тёмную темы.", "evidence": "machine/tokens.json"}
        ],
        "sources": ["machine/dimension-tokens.json", "machine/tokens.json", "ui/foundations.css", "ui/layout.css", "ui/components/title.css", "ui/components/primitives.css"],
        "unknowns": ["Редактор, настройки, сервисные ошибки и авторизованный production не подтверждены полными экранами."]
    })
    foundation_visuals = {
        "colors": {"themes": {"light-v2": light_tokens, "dark-v2": dark_tokens}},
        "grid": {"container": {"desktop": "1096px / 24px", "tablet": "768px / 16px", "mobile": "edge-to-edge"}, "sidebar": "300px"},
        "header": {"height": {"desktop": "56px", "mobile": "48px"}, "position": "sticky"},
        "spacing": {"pagePadding": {"desktop": "24px", "tablet": "16px", "mobile": "0"}},
        "surfaces": {"primary": light_tokens.get("--background-primary"), "secondary": light_tokens.get("--background-secondary"), "gray": light_tokens.get("--background-gray")},
        "typography": {"families": {"interface": "-apple-system, BlinkMacSystemFont, Arial, sans-serif", "display": "Fira Sans, sans-serif"}, "roles": {"titleH1": "24px/1.3", "titleH2": "20px/1.3", "body": "15px/24px", "secondary": "13px/16px"}},
        "icons": {"inventory": {"production": 109, "editor": 137, "illustrations": 20}, "format": "SVG"},
    }
    for foundation_id, visual in foundation_visuals.items():
        foundation_path = ROOT / "machine" / "foundations" / f"{foundation_id}.json"
        foundation = json.loads(foundation_path.read_text(encoding="utf-8"))
        foundation["visual"] = visual
        write_json(foundation_path, foundation)
    write_json(ROOT / "machine/states.json", {"ui": ["default", "hover", "focus-visible", "pressed", "disabled"], "feature": ["loading", "empty", "success", "error"], "domain": ["guest", "authenticated", "admin"], "note": "Наблюдённость конкретного состояния задаётся в спецификации сущности; список не означает полное покрытие."})
    assets = []
    for path in sorted((ROOT / "ui/assets").rglob("*")):
        if path.is_file():
            assets.append({"path": path.relative_to(ROOT).as_posix(), "type": path.suffix.lower().lstrip("."), "bytes": path.stat().st_size, "previewable": path.suffix.lower() in {".svg", ".png", ".jpg", ".jpeg", ".webp"}})
    write_json(ROOT / "machine/assets.json", {"total": len(assets), "previewable": sum(asset["previewable"] for asset in assets), "assets": assets})

    examples_count = sum(len(json.loads((ROOT / entry["file"]).read_text(encoding="utf-8"))["examples"]) for entry in catalog)
    index = {
        "schemaVersion": 3,
        "product": {"id": "habr", "title": "Хабр", "guideVersion": "1.0", "status": "active", "productionRelease": "2.346.1", "lastVerified": "2026-09-07"},
        "readOrder": ["machine/style-profile.json для задач уровня продукта или нового экрана", "machine/dimension-tokens.json для геометрии", "machine/catalog.json", "только выбранный file из catalog", "markdown, rules, implementation и examples — только при необходимости"],
        "files": {"catalog": "machine/catalog.json", "states": "machine/states.json", "tokens": "machine/tokens.json", "dimensionTokens": "machine/dimension-tokens.json", "dimensionExceptions": "machine/reports/dimension-exceptions.json", "styleProfile": "machine/style-profile.json", "assets": "machine/assets.json", "migrationMap": "machine/migration-map.json", "schema": "schema.json", "roadmap": "ROADMAP.md"},
        "coverage": {"boundary": "public guest production + company admin Figma", "known": ["public shell", "content feed", "directory", "entity", "company admin"], "unknown": ["editor screen", "settings outside admin", "service/error", "authenticated production"], "onUnknown": {"action": "use-nearest-confirmed-pattern-and-disclose-assumption", "doc": "ROADMAP.md"}},
        "viewerContract": {"intrinsic": "components and foundations, stacked without viewport toolbar", "viewport": "modules and pages at 320/480/768/1024/Auto", "pageBreakpoints": [320, 768, 1024], "fluidCheckpoints": [480], "notes": "previewNotes are rendered outside iframe"},
        "provenance": {"legacyPrefix": "archive:habr/v1/", "archivePublished": False, "note": "Структура пакета мигрирована без объявления нового релиза; все доступные для использования знания находятся в habr/."},
        "checks": ["node validate.mjs", "node tools/validate-viewer.mjs"],
        "migration": {"source": "archive/habr/v1", "inventory": {"files": 362, "componentSpecs": 23, "showcaseSections": 34, "pageSections": 8, "singleIcons": 109, "libraryIcons": 137, "spriteIcons": 138, "illustrations": 20}, "mapping": "machine/migration-map.json"},
        "metrics": {"catalogItems": len(catalog), "foundations": sum(entry["kind"] == "foundation" for entry in catalog), "components": sum(entry["kind"] == "component" for entry in catalog), "patterns": sum(entry["kind"] == "pattern" for entry in catalog), "documents": sum(entry["kind"] == "document" for entry in catalog), "examples": examples_count},
    }
    write_json(ROOT / "machine/index.json", index)
    component_section_map = [
        {"source": source_id, "target": f"machine/foundations/{item_id}.json", "status": "migrated"}
        for item_id, _, source_id in FOUNDATIONS
    ]
    component_section_map.append({"source": "f-icons", "target": "machine/foundations/icons.json", "status": "migrated"})
    component_section_map.extend({"source": item_id, "target": f"machine/components/{item_id}.json", "status": "migrated"} for item_id, *_ in COMPONENTS)
    component_section_map.extend([
        {"source": "new-classes", "target": "components/INDEX.md", "status": "merged", "reason": "реестр кода, а не отдельный UI-компонент"},
        {"source": "gaps", "target": "ROADMAP.md", "status": "merged", "reason": "свод пробелов"},
    ])
    page_section_map = [
        {"source": item_id, "target": f"machine/patterns/{item_id}.json", "status": "migrated"}
        for item_id in ("shell", "feed", "directory", "entity", "admin-section", "admin-form", "admin-list")
    ]
    page_section_map.append({"source": "gaps", "target": "ROADMAP.md", "status": "expanded", "reason": "пробелы представлены отдельными pattern specs"})
    component_documents = []
    for path in sorted((ROOT / "components").rglob("*.md")):
        if path.name == "INDEX.md":
            continue
        relative = path.relative_to(ROOT).as_posix()
        references = [entry["id"] for entry in catalog if entry.get("markdown") == relative]
        component_documents.append({"source": relative, "referencedBy": references, "status": "migrated" if references else "missing"})
    write_json(ROOT / "machine/migration-map.json", {
        "source": "archive/habr/v1",
        "baselineFiles": 362,
        "showcaseComponents": component_section_map,
        "showcasePages": page_section_map,
        "componentDocuments": component_documents,
        "ruleDocuments": [entry["file"] for entry in catalog if entry["id"].startswith(("rule-", "decision-"))],
        "catalogTargets": [{"id": entry["id"], "target": entry["file"], "status": "migrated"} for entry in catalog],
    })
    print(f"Migrated {len(catalog)} catalog items and {examples_count} isolated examples")


if __name__ == "__main__":
    main()
