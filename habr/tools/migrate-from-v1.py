from __future__ import annotations

import json
import re
import shutil
from html import escape
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
    ("article-detail", "Article / Content Detail", "confirmed", "high", "production"),
    ("article-comments", "Article Comments", "confirmed", "high", "production"),
    ("entity", "Profile / Entity", "confirmed", "high", "production"),
    ("search", "Search", "confirmed", "medium", "production"),
    ("editor", "Editor / Content Creation", "confirmed", "medium", "figma"),
    ("admin-section", "Admin · Section Screen", "confirmed", "medium", "figma"),
    ("admin-form", "Admin · Form / Wizard", "confirmed", "medium", "figma"),
    ("admin-list", "Admin · Management List", "confirmed", "high", "figma"),
    ("overlay-flows", "Modal / Overlay Flows", "confirmed", "high", "figma"),
    ("settings-forms", "Settings / Forms", "confirmed", "medium", "figma"),
    ("service-error", "Service / Error", "confirmed", "high", "figma"),
]

PATTERN_EVIDENCE = {
    "article-detail": [{"type": "production", "ref": "https://habr.com/ru/companies/ruvds/articles/1078914/"}],
    "article-comments": [{"type": "production", "ref": "https://habr.com/ru/articles/1006666/comments/"}],
    "search": [{"type": "production", "ref": "https://habr.com/ru/search/?q=users&target_type=posts&order=relevance"}],
    "editor": [{"type": "figma", "ref": "https://www.figma.com/design/T6D4YRKF3qdAmGNAu4wIBo/?node-id=34497-1053810"}],
    "overlay-flows": [{"type": "figma", "ref": "https://www.figma.com/design/T6D4YRKF3qdAmGNAu4wIBo/?node-id=33113-474686"}],
    "settings-forms": [{"type": "figma", "ref": "https://www.figma.com/design/T6D4YRKF3qdAmGNAu4wIBo/?node-id=5733-231005"}],
    "service-error": [{"type": "figma", "ref": "https://www.figma.com/design/T6D4YRKF3qdAmGNAu4wIBo/?node-id=30995-354578"}],
}

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
    "article-detail": {
        "areas": ["article", "author", "article-navigation", "sidebar"],
        "modules": ["article-presenter", "article-author"],
        "components": ["title", "user-info", "votes", "icon-button", "button", "button-follow", "article-card"],
        "sequence": [
            {"id": "article", "tag": "article", "heading": "Заголовок статьи", "modules": [{"id": "article-presenter", "count": 1}], "components": [{"id": "title", "count": 1}, {"id": "user-info", "count": 1}, {"id": "votes", "count": 1}, {"id": "icon-button", "count": 2}]},
            {"id": "author", "tag": "section", "heading": "Компания и автор публикации", "modules": [{"id": "article-author", "count": 1}], "components": [{"id": "button", "count": 1}, {"id": "button-follow", "count": 1}, {"id": "icon-button", "count": 1}]},
            {"id": "article-navigation", "tag": "section", "heading": "Комментарии и похожие публикации", "modules": [], "components": [{"id": "article-card", "count": 1}]},
            {"id": "sidebar", "tag": "aside", "heading": None, "modules": [], "components": []},
        ],
    },
    "article-comments": {
        "areas": ["article-summary", "comments-navigation", "comments-tree", "sidebar"],
        "modules": ["article-summary", "comment-tree"],
        "components": ["article-card", "user-info", "votes", "icon-button", "notice", "checkbox", "field", "button"],
        "sequence": [
            {"id": "article-summary", "tag": "article", "heading": "Публикация", "modules": [{"id": "article-summary", "count": 1}], "components": [{"id": "article-card", "count": 1}]},
            {"id": "comments-navigation", "tag": "header", "heading": "Комментарии", "modules": [], "components": [{"id": "icon-button", "count": 3}, {"id": "notice", "count": 1}]},
            {"id": "comments-tree", "tag": "section", "heading": "Комментарии", "modules": [{"id": "comment-tree", "count": 1}], "components": [{"id": "user-info", "count": 6}, {"id": "votes", "count": 6}, {"id": "checkbox", "count": 1}, {"id": "field", "count": 1}, {"id": "button", "count": 1}]},
            {"id": "sidebar", "tag": "aside", "heading": None, "modules": [], "components": []},
        ],
    },
    "search": {
        "areas": ["search-form", "result-navigation", "results", "sidebar"],
        "modules": ["search-form", "search-results"],
        "components": ["field", "icon-button", "tabs", "notice", "article-card"],
        "sequence": [
            {"id": "search-form", "tag": "form", "heading": None, "modules": [{"id": "search-form", "count": 1}], "components": [{"id": "field", "count": 1}, {"id": "icon-button", "count": 1}]},
            {"id": "result-navigation", "tag": "nav", "heading": None, "modules": [], "components": [{"id": "tabs", "count": 1}]},
            {"id": "results", "tag": "section", "heading": "Результаты поиска", "modules": [{"id": "search-results", "count": 1}], "components": [{"id": "notice", "count": 1}, {"id": "article-card", "count": 0}]},
            {"id": "sidebar", "tag": "aside", "heading": None, "modules": [], "components": []},
        ],
    },
    "editor": {
        "areas": ["editor-notice", "publication-editor", "publication-actions"],
        "modules": ["publication-editor", "editor-toolbar"],
        "components": ["notice", "chip", "button", "icon-button", "user-info"],
        "sequence": [
            {"id": "editor-notice", "tag": "aside", "heading": None, "modules": [], "components": [{"id": "notice", "count": 1}]},
            {"id": "publication-editor", "tag": "form", "heading": "Создание публикации", "modules": [{"id": "publication-editor", "count": 1}, {"id": "editor-toolbar", "count": 1}], "components": [{"id": "chip", "count": 7}, {"id": "icon-button", "count": 9}, {"id": "user-info", "count": 1}]},
            {"id": "publication-actions", "tag": "footer", "heading": None, "modules": [], "components": [{"id": "button", "count": 5}]},
        ],
    },
    "overlay-flows": {
        "areas": ["page-context", "overlay", "dialog"],
        "modules": ["modal-flow"],
        "components": ["dialog", "radio", "field", "button"],
        "sequence": [
            {"id": "page-context", "tag": "article", "heading": "Контекст страницы", "modules": [], "components": []},
            {"id": "overlay", "tag": "div", "heading": None, "modules": [{"id": "modal-flow", "count": 1}], "components": []},
            {"id": "dialog", "tag": "section", "heading": "Подтверждение", "modules": [], "components": [{"id": "dialog", "count": 1}, {"id": "radio", "count": 9}, {"id": "field", "count": 1}, {"id": "button", "count": 2}]},
        ],
    },
    "settings-forms": {
        "areas": ["settings-navigation", "profile-form", "avatar"],
        "modules": ["profile-settings-form"],
        "components": ["tabs", "field", "button", "avatar", "notice"],
        "sequence": [
            {"id": "settings-navigation", "tag": "nav", "heading": "Настройки", "modules": [], "components": [{"id": "tabs", "count": 1}]},
            {"id": "profile-form", "tag": "form", "heading": "Профиль", "modules": [{"id": "profile-settings-form", "count": 1}], "components": [{"id": "field", "count": 13}, {"id": "notice", "count": 1}, {"id": "button", "count": 4}]},
            {"id": "avatar", "tag": "aside", "heading": "Аватар", "modules": [], "components": [{"id": "avatar", "count": 1}]},
        ],
    },
    "service-error": {
        "areas": ["error-illustration", "error-message", "recovery-action"],
        "modules": ["service-error-state"],
        "components": ["button"],
        "sequence": [
            {"id": "error-illustration", "tag": "figure", "heading": None, "modules": [{"id": "service-error-state", "count": 1}], "components": []},
            {"id": "error-message", "tag": "section", "heading": "Код ошибки", "modules": [], "components": []},
            {"id": "recovery-action", "tag": "div", "heading": None, "modules": [], "components": [{"id": "button", "count": 1}]},
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
        "components": ["title", "radio", "field", "button"],
        "sequence": [
            {"id": "task-title", "tag": "header", "heading": "Заявка на корпоративный блог", "modules": [], "components": [{"id": "title", "count": 1}]},
            {"id": "form-card", "tag": "form", "heading": "Реквизиты компании", "modules": [{"id": "admin-form-card", "count": 1}], "components": [{"id": "radio", "count": 2}, {"id": "field", "count": 1}, {"id": "button", "count": 2}]},
            {"id": "progress-stepper", "tag": "aside", "heading": None, "modules": [{"id": "progress-stepper", "count": 1}], "components": []},
        ],
    },
    "admin-list": {
        "areas": ["management-list"],
        "modules": ["management-row"],
        "components": ["chip"],
        "sequence": [
            {"id": "management-list", "tag": "section", "heading": None, "modules": [{"id": "management-row", "count": 1}], "components": [{"id": "chip", "count": 1}]},
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
        source = re.sub(
            r"var\((--habr-[^)]+)\)",
            lambda match: str(dimension_values.get(match.group(1), match.group(0))),
            source,
        )
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
    def restyle(node, *classes, tag_name=None):
        if not node:
            return None
        if tag_name:
            node.name = tag_name
        node["class"] = list(classes)
        node.attrs.pop("style", None)
        return node

    for tag in fragment.select("script"):
        tag.decompose()
    for tag in fragment.select(".doc-note, .doc-meta, .doc-family__note, .doc-family__meta"):
        tag.decompose()
    if page:
        # Page examples consume the shared shell component. Any shell copied
        # from the legacy showcase would create a second, stale header/footer.
        for tag in fragment.select(".tm-header, .tm-footer-menu, .tm-footer"):
            tag.decompose()
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
    if section_id == "directory":
        wrapper = restyle(fragment.select_one('div[style*="max-width:820px"]'), "tm-page__wrapper")
        columns = wrapper.find_all("div", recursive=False) if wrapper else []
        if len(columns) >= 2:
            restyle(columns[0], "tm-page__main", "tm-page__main_has-sidebar", "page-example__surface", "page-example__surface_compact", tag_name="section")
            restyle(columns[1], "tm-page__sidebar", "page-example__surface", "page-example__surface_compact", tag_name="aside")
            columns[1]["aria-label"] = "Фильтры каталога"
    if section_id == "entity":
        wrapper = restyle(fragment.select_one('div[style*="max-width:900px"]'), "tm-page__wrapper")
        columns = wrapper.find_all("div", recursive=False) if wrapper else []
        if len(columns) >= 2:
            restyle(columns[0], "tm-page__main", "tm-page__main_has-sidebar", tag_name="section")
            restyle(columns[1], "tm-page__sidebar", tag_name="aside")
            columns[1]["aria-label"] = "Информация о хабе"
        restyle(fragment.select_one('div[style*="align-items:center"][style*="gap:4px"]'), "page-example__actions")
        restyle(fragment.select_one('.tabs[style*="margin:16px"]'), "tabs", "page-example__entity-tabs")
        restyle(fragment.select_one('.badges[style*="margin-top:16px"]'), "badges", "page-example__badges")
        # Page-level surfaces are deliberately flat. Shape belongs to controls
        # and small semantic elements, not to composition blocks.
        for node in fragment.select(".tm-hub-card, .tm-block"):
            node.attrs.pop("style", None)
        restyle(fragment.select_one('div[style*="background:var(--background-primary)"][style*="border-radius"]'), "page-example__empty")
    if section_id == "feed":
        restyle(fragment.select_one('div[style*="max-width:620px"][style*="justify-content"]'), "page-example__tabs")
        tabs = fragment.select_one(".page-example__tabs .tabs")
        if tabs:
            tabs.attrs.pop("style", None)
        for node in fragment.select('[style*="max-width:620px"]'):
            node.attrs.pop("style", None)
        # The listing consumes the same ArticleCard anatomy as the component
        # preview. The legacy page used a hand-tuned footer whose inline gap
        # and missing item wrappers made cards drift visually.
        for data_icons in fragment.select(".tm-articles-list__item .tm-data-icons"):
            data_icons.attrs.pop("style", None)
            for child in data_icons.find_all(recursive=False):
                classes = child.get("class", [])
                if "tm-data-icons__item" not in classes:
                    child["class"] = [*classes, "tm-data-icons__item"]
        for wrapper in fragment.select(".tm-articles-list__item .bookmarks-button > .icon"):
            classes = wrapper.get("class", [])
            if "tm-svg-icon__wrapper" not in classes:
                wrapper["class"] = ["tm-svg-icon__wrapper", *classes]
            icon = wrapper.find("svg")
            if icon:
                icon_classes = icon.get("class", [])
                if "tm-svg-icon" not in icon_classes:
                    icon["class"] = [*icon_classes, "tm-svg-icon"]
    if section_id == "admin-section":
        outer = fragment.select_one('div[style*="max-width:900px"]')
        if outer:
            outer.attrs.pop("style", None)
        restyle(fragment.select_one('.tm-hub-card[style*="margin-bottom:16px"]'), "tm-hub-card", "page-example__hero")
        restyle(fragment.select_one('.tabs[style*="margin-bottom:16px"]'), "tabs", "page-example__tabs")
        columns = restyle(fragment.select_one('div[style*="display:flex"][style*="gap:16px"]'), "page-example__columns")
        children = columns.find_all("div", recursive=False) if columns else []
        if len(children) >= 2:
            restyle(children[0], "page-example__primary", "page-example__panel", tag_name="section")
            restyle(children[1], "page-example__aside", tag_name="aside")
            children[1]["aria-label"] = "Навигация и новости"
        blocks = fragment.select(".tm-block")
        for index, block in enumerate(blocks):
            block.attrs.pop("style", None)
            if index == 0:
                block["class"] = [*block.get("class", []), "page-example__block-spaced"]
    if section_id == "admin-form":
        outer = fragment.select_one('div[style*="max-width:820px"]')
        if outer:
            outer.attrs.pop("style", None)
        restyle(fragment.select_one('div[style*="font-weight:700"][style*="margin-bottom:16px"]'), "page-example__panel", "page-example__heading-panel", "tm-title", "tm-title_h2")
        columns = restyle(fragment.select_one('div[style*="display:flex"][style*="gap:16px"]'), "page-example__columns")
        children = columns.find_all("div", recursive=False) if columns else []
        if len(children) >= 2:
            restyle(children[0], "page-example__primary", "page-example__panel", tag_name="section")
            restyle(children[1], "page-example__aside", "page-example__aside_narrow", "page-example__panel", tag_name="aside")
            children[1]["aria-label"] = "Прогресс заполнения"
        for radio in fragment.select('input[type="radio"]'):
            radio["class"] = ["tm-radio__input", "visually-hidden"]
            label = radio.find_parent("label")
            if label:
                label.attrs.pop("style", None)
                label["class"] = ["tm-radio__option", "page-example__radio"]
                indicator = BeautifulSoup('<span class="tm-radio__indicator"></span>', "html.parser").span
                radio.insert_after(indicator)
    if section_id == "admin-list":
        outer = restyle(fragment.select_one('div[style*="max-width:900px"]'), "page-example__surface", "page-example__surface_compact", tag_name="section")
        card = outer.find("div", recursive=False) if outer else None
        if card:
            card.attrs.pop("style", None)
        restyle(fragment.select_one('div[style*="justify-content:space-between"][style*="padding-bottom:12px"]'), "page-example__management-row")
        status = fragment.find("span", string=lambda value: value and value.strip() == "В черновиках")
        if status:
            restyle(status, "tm-chip", "page-example__status")
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
    if section_id == "shell":
        body = '''<main class="tm-page shell-demo">
  <div class="tm-page-width">
    <div class="tm-page__wrapper">
      <section class="tm-page__main tm-page__main_has-sidebar shell-demo__surface">
        <span class="shell-demo__label">Основная колонка</span>
        <strong>Рабочая область</strong>
        <p>Белая контентная поверхность располагается поверх серого фона страницы.</p>
      </section>
      <aside class="tm-page__sidebar shell-demo__surface shell-demo__sidebar" aria-label="Боковая колонка">
        <span class="shell-demo__label">Сайдбар · 300px</span>
      </aside>
    </div>
  </div>
</main>'''
    if section_id == "feed":
        body = f'''<main class="tm-page page-example"><div class="tm-page-width"><div class="tm-page__wrapper">
<section class="tm-page__main tm-page__main_has-sidebar">{body}</section>
<aside class="tm-page__sidebar" aria-label="Боковая колонка"></aside>
</div></div></main>'''
    elif page and section_id in {"directory", "entity"}:
        body = f'<main class="tm-page page-example"><div class="tm-page-width">{body}</div></main>'
    elif page and section_id in {"admin-section", "admin-form", "admin-list"}:
        body = f'<main class="tm-page page-example"><div class="tm-page-width">{body}</div></main>'
    return body


def example_document(title: str, body: str, page: bool = False, section_id: str = "") -> str:
    extra = '<link rel="stylesheet" href="../../../../examples/showcase-pages.css">' if page else '<link rel="stylesheet" href="../../../../examples/showcase-components.css">'
    shell_script = '  <script src="../../../../examples/site-shell.js" defer></script>\n' if page else ''
    shell_header = '<habr-site-header></habr-site-header>\n' if page else ''
    shell_footer = '<habr-site-footer></habr-site-footer>\n' if page else ''
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
{shell_script}</head>
<body class="{body_class}">
{shell_header}{body}
{shell_footer}<script src="../../../../examples/components.js"></script>
</body>
</html>
'''


def render_icon(icon: str, symbol: str, size: int = 24, extra_class: str = "") -> str:
    classes = " ".join(part for part in ("tm-svg-img", extra_class) if part)
    return f'<svg class="{classes}" width="{size}" height="{size}" aria-hidden="true"><use href="{icon}#{escape(symbol)}"></use></svg>'


def render_button(label: str, *, variant: str = "transparent", size: str = "small", extra_class: str = "", button_type: str = "button") -> str:
    classes = " ".join(part for part in ("btn", f"btn_{variant}", f"btn_{size}", extra_class) if part)
    return f'<button class="{classes}" type="{button_type}">{escape(label)}</button>'


def render_icon_button(icon: str, symbol: str, label: str, *, bordered: bool = False, near_field: bool = False, extra_class: str = "") -> str:
    modifiers = ["tm-icon-button"]
    if bordered:
        modifiers.append("tm-icon-button_bordered")
    if near_field:
        modifiers.append("tm-icon-button_near-field")
    if extra_class:
        modifiers.append(extra_class)
    return f'<button class="{" ".join(modifiers)}" type="button" aria-label="{escape(label)}" title="{escape(label)}">{render_icon(icon, symbol, 24)}</button>'


def render_avatar(avatar: str, *, size: int = 24, kind: str = "user", alt: str = "") -> str:
    owner_class = "tm-user-info__userpic" if kind == "user" and size == 24 else ""
    classes = " ".join(part for part in (owner_class, "avatar-default", f"avatar-default_{kind}") if part)
    return f'<img class="{classes}" src="{avatar}" width="{size}" height="{size}" alt="{escape(alt)}">'


def render_user_info(avatar: str, username: str, timestamp: str = "", *, extra_class: str = "") -> str:
    time_markup = f'<a class="tm-article-datetime-published tm-article-datetime-published_link" href="#"><time>{escape(timestamp)}</time></a>' if timestamp else ""
    classes = " ".join(part for part in ("tm-user-info", "author", extra_class) if part)
    return f'''<span class="{classes}">{render_avatar(avatar)}<span class="tm-user-info__user tm-user-info__user_appearance-default"><a class="tm-user-info__username" href="#">{escape(username)}</a>{time_markup}</span></span>'''


def render_field(*, value: str = "", placeholder: str = "", field_type: str = "text", label: str = "", aria_label: str = "", textarea: bool = False, extra_class: str = "", rows: int = 0) -> str:
    label_open = f'<label class="{extra_class}">{escape(label)}' if label else ""
    label_close = "</label>" if label else ""
    aria_attr = f' aria-label="{escape(aria_label)}"' if aria_label else ""
    if textarea:
        rows_attr = f' rows="{rows}"' if rows else ""
        control = f'<textarea class="tm-textarea-reconstructed"{rows_attr}{aria_attr} placeholder="{escape(placeholder)}">{escape(value)}</textarea>'
    else:
        control = f'<input class="tm-input-text-decorated__input" type="{escape(field_type)}" value="{escape(value)}"{aria_attr} placeholder="{escape(placeholder)}">'
    return f'{label_open}{control}{label_close}'


def render_radio(label: str, name: str, *, checked: bool = False, extra_class: str = "") -> str:
    checked_attr = " checked" if checked else ""
    classes = " ".join(part for part in ("tm-radio__option", extra_class) if part)
    return f'<label class="{classes}"><input class="tm-radio__input visually-hidden" type="radio" name="{escape(name)}"{checked_attr}><span class="tm-radio__indicator"></span><span class="tm-radio__label">{escape(label)}</span></label>'


def render_checkbox(label: str, *, extra_class: str = "") -> str:
    classes = " ".join(part for part in ("checkbox", extra_class) if part)
    return f'<label class="{classes}"><input class="input visually-hidden" type="checkbox"><span class="indicator"></span><span>{escape(label)}</span></label>'


def render_chip(label: str) -> str:
    return f'<button class="tm-chip" type="button">{escape(label)}</button>'


def render_notice(content: str, *, variant: str = "info", extra_class: str = "") -> str:
    classes = " ".join(part for part in ("tm-notice", f"tm-notice_{variant}" if variant else "", extra_class) if part)
    return f'<div class="{classes}"><div class="tm-notice__inner"><div class="tm-notice__content">{content}</div></div></div>'


def render_tabs(labels: tuple[str, ...], active: str) -> str:
    items = "".join(f'<span class="tab-item"><button class="{"active " if label == active else ""}tab-link" type="button">{escape(label)}</button></span>' for label in labels)
    return f'<div class="tabs"><div class="tabs-scroll-area"><div class="tabs-padding-area">{items}</div></div></div>'


def render_article_footer(icon: str, *, rating: str, bookmarks: str = "", comments: str = "", unread: str = "", extra_class: str = "", share: bool = False) -> str:
    rating_tone = " tm-votes-meter__icon_positive" if rating.startswith("+") else ""
    parts = [f'<div class="tm-votes-meter tm-data-icons__item">{render_icon(icon, "counter-rating", 24, f"tm-votes-meter__icon{rating_tone}")}<span class="tm-votes-meter__value tm-votes-meter__value_rating">{escape(rating)}</span></div>']
    if bookmarks:
        parts.append(f'<button class="bookmarks-button tm-data-icons__item" type="button" aria-label="Закладки">{render_icon(icon, "counter-favorite")}<span class="counter">{escape(bookmarks)}</span></button>')
    if share:
        parts.append(render_icon_button(icon, "share", "Поделиться", extra_class="tm-data-icons__item article-share"))
    if comments:
        unread_markup = f'<span class="unread-counter">{escape(unread)}</span>' if unread else ""
        parts.append(f'<div class="article-comments-counter-link-wrapper tm-data-icons__item"><a class="article-comments-counter-link" href="#comments">{render_icon(icon, "counter-comments")}<span class="value">{escape(comments)}</span>{unread_markup}</a></div>')
    classes = " ".join(part for part in ("tm-articles-list__item-footer", extra_class) if part)
    return f'<footer class="{classes}"><div class="tm-data-icons">{"".join(parts)}</div></footer>'


def custom_pattern_examples(section_id: str, title: str) -> tuple[list[dict], list[dict], str]:
    """Build source-backed page examples that did not exist in the v1 showcase."""
    icon = "../../../../ui/assets/icons/megazord.svg"
    avatar = "../../../../ui/assets/illustrations/avatars/avatar-default-user.svg"

    def page(content: str, sidebar: bool = True, sidebar_content: str = "") -> str:
        sidebar_markup = f'<aside class="tm-page__sidebar" aria-label="Боковая колонка">{sidebar_content}</aside>' if sidebar else ""
        main_class = "tm-page__main tm-page__main_has-sidebar" if sidebar else "tm-page__main"
        return f'''<main class="tm-page page-example"><div class="tm-page-width"><div class="tm-page__wrapper">
<section class="{main_class}">{content}</section>{sidebar_markup}
</div></div></main>'''

    def article_card(headline: str, author: str, rating: str, comments: str, *, timestamp: str = "сегодня в 12:40") -> str:
        return f'''<div class="tm-articles-list__item">
  <div class="article-snippet">
    <div class="meta-container"><div class="meta">{render_user_info(avatar, author, timestamp)}</div></div>
    <h2 class="tm-title tm-title_h2"><a class="tm-title__link" href="#">{headline}</a></h2>
    <div class="stats"><div class="tm-article-reading-time"><svg class="tm-svg-img tm-article-reading-time__icon" width="24" height="24"><use href="{icon}#clock"></use></svg><span class="tm-article-reading-time__label">8 мин</span></div></div>
  </div>
  {render_article_footer(icon, rating=rating, comments=comments)}
</div>'''

    examples: list[tuple[str, str, str, int]] = []
    notes: list[dict] = []

    if section_id == "article-detail":
        article_footer = render_article_footer(icon, rating="+268", bookmarks="115", comments="61", unread="+61", extra_class="article-detail__footer", share=True)
        company_actions = "".join((
            render_icon_button(icon, "settings", "Настройки", bordered=True, extra_class="company-profile__settings"),
            render_button("Я работаю здесь"),
            '<button class="btn btn_transparent btn_small tm-button-follow company-profile__follow" type="button"><span class="button-content">Подписаться</span></button>',
        ))
        related_card = article_card("Как восстановить материал из старого видеоархива", "RUVDS.com", "+42", "18", timestamp="вчера")
        content = f'''<section class="company-profile"><div class="company-profile__top"><div class="company-profile__identity"><div class="company-profile__logo">R</div><div class="company-profile__reach"><b>512K+</b><small>Охват за 30 дней</small></div></div><div class="company-profile__actions">{company_actions}</div></div><div class="company-profile__about"><strong>RUVDS.com</strong><p>Облачные и выделенные серверы</p><div class="company-profile__metrics"><span><b>4.17</b> Оценка работодателя</span><span><b>4 053,27</b> Рейтинг</span><span><b>159 142</b> Подписчики</span></div></div></section>
<article class="article-detail"><div class="article-detail__content"><div class="article-detail__authorline">{render_user_info(avatar, "Realife", "10 сен в 10:01")}</div><h1 class="article-detail__title">Как я сделал ремастер «Том и Джерри» в 4K за два года: дубль два</h1><div class="article-detail__stats"><span>◉ Средний</span><span>◷ 9 мин</span><span>◉ 105K</span></div><p class="article-detail__hubs">Блог компании RUVDS.com, Работа с видео*, Искусственный интеллект, DIY или Сделай сам, Обработка изображений*</p><span class="article-detail__tag">Кейс</span><div class="article-detail__media">Кадр из ремастера «Том и Джерри»</div><div class="article-detail__body"><p>Два года работы — это не только восстановление изображения. Нужно было найти исходные кадры, убрать дефекты, сохранить характер оригинальной анимации и собрать материал заново.</p><h2>Итоги</h2><p>В статье остаётся широкая типографическая колонка: Fira Sans у заголовков и системный шрифт у основного текста.</p></div></div>{article_footer}</article>
<section class="article-detail__comments" id="comments"><h2>Комментарии <b>61</b></h2><a href="#">Перейти к обсуждению</a></section><section class="article-detail__related"><h2>Похожие публикации</h2>{related_card}</section>'''
        sidebar = '''<section class="article-sidebar"><h2>Информация</h2><dl><div><dt>Сайт</dt><dd>ruvds.com</dd></div><div><dt>Дата регистрации</dt><dd>18 марта 2016</dd></div><div><dt>Дата основания</dt><dd>27 июля 2015</dd></div><div><dt>Численность</dt><dd>11–30 человек</dd></div><div><dt>Местоположение</dt><dd>Россия</dd></div></dl></section><section class="article-sidebar"><h2>Ссылки</h2><a href="#">VPS / VDS сервер от 149 рублей в месяц</a><a href="#">Дата-центры RUVDS в Москве</a><a href="#">Помощь и вопросы</a></section>'''
        examples.append(("production-article", "Статья · production", page(content, sidebar_content=sidebar), 760))
        notes = [{"type": "guidance", "text": "Production: article presenter → тело статьи → счётчики → автор → навигация к комментариям и похожим материалам."}]

    elif section_id == "article-comments":
        def comment(level: int, user: str, timestamp: str, text: str, score: str, tone: str = "") -> str:
            actions = "".join((
                f'<div class="tm-votes-meter">{render_icon(icon, "counter-rating", 20)}<span class="tm-votes-meter__value">{escape(score)}</span></div>',
                '<button class="comment-thread__reply" type="button">Ответить</button>',
                render_icon_button(icon, "counter-comments", "Ответы", extra_class="comment-thread__action"),
                render_icon_button(icon, "dots", "Ещё", extra_class="comment-thread__action"),
            ))
            return f'''<article class="comment-thread comment-thread_level-{level} {tone}"><i class="comment-thread__branch"></i><div class="comment-thread__meta">{render_user_info(avatar, user, timestamp)}{render_icon_button(icon, "dots", "Меню комментария", extra_class="comment-thread__menu")}</div><p class="comment-thread__text">{escape(text)}</p><footer class="comment-thread__footer">{actions}</footer></article>'''

        comments_toolbar = "".join((
            render_icon_button(icon, "settings", "Настройки"),
            render_icon_button(icon, "rss", "RSS"),
            render_icon_button(icon, "notifications", "Уведомления"),
        ))
        comments_notice = render_notice('Материал мог вызвать противоречивые чувства. Будьте критичны к любой публикуемой информации. Перед написанием комментария вспомните <a href="#">правила сообщества</a>.', extra_class="comments-page__notice")
        comment_form = f'''<form class="comments-page__form"><strong>Ваш комментарий</strong>{render_checkbox("От имени модератора", extra_class="comments-page__checkbox")}{render_field(placeholder="＋ Нажмите ‘/’ для вызова меню", textarea=True)}{render_button("Отправить", variant="solid", button_type="submit")}</form>'''
        content = f'''<div class="comments-article">{article_card("Самый беззащитный — уже не Сапсан. Всё оказалось куда хуже...", "LMonoceros", "+1447", "988", timestamp="13 янв 2021 в 08:51")}</div>
<aside class="comments-banner">РЕКЛАМА · Материал партнёра</aside>
<section class="comments-page"><header class="comments-page__header"><h2>Комментарии <b>60</b></h2><div>{comments_toolbar}</div></header>{comments_notice}<div class="comments-page__pinned"><p>⚒ Закреплённые комментарии</p>{comment(0, 'Scratch', '13 янв 2021 в 09:21', 'Мне кажется, пока им реально не снести все камеры, они ничего не сделают. Опять отмахнутся и всё.', '+30')}</div><p class="comment-tree-label">○ НЛО прилетело и опубликовало эту надпись здесь</p><button class="comment-tree-expand" type="button">⊕ Раскрыть ветку (6)</button><div class="comments-page__tree">{comment(0, 'ramilexe', '13 янв 2021 в 09:17', 'Это было круто! Читается как детектив. Неужели они не проводили никакой аудит?', '+126')}{comment(1, 'Strigov', '13 янв 2021 в 12:11', 'Если и проводили, то по бумагам на распиле, судя по всему.', '−1', 'comment-thread_muted')}{comment(0, 'LMonoceros', '14 янв 2021 в 02:06', 'Возможно, ситуация сложнее, но проверить её всё равно стоит.', '+4', 'comment-thread_highlight')}{comment(0, 'melpnz', '14 янв 2021 в 14:42', 'Главбухи, кстати, еще нормально зарабатывают.', '+2', 'comment-thread_warm')}{comment(0, 'Yacudz', '14 янв 2021 в 15:02', 'Пром. безопасность — из той же оперы...', '0', 'comment-thread_alert')}</div>{comment_form}</section>'''
        sidebar = '''<div class="comments-sidebar"><div class="comments-sidebar__ad comments-sidebar__ad_large"><span>РЕКЛАМА</span><b>300×600</b></div><section class="comments-sidebar__reading"><h2>Читают сейчас</h2><a href="#">Осваиваем 3-рублёвые микроконтроллеры</a><a href="#">Золотая эпоха в микроэлектронике</a><a href="#">Теория игр за 15 минут</a><a href="#">Разбираем самый маленький PNG в мире</a><a href="#">Телеграм показывает удаленные сообщения</a></section><section class="comments-sidebar__stories"><h2>Истории</h2><div><span></span><span></span><span></span></div></section><div class="comments-sidebar__ad comments-sidebar__ad_small"><b>300×250</b></div></div>'''
        examples.append(("production-comments", "Комментарии · production", page(content, sidebar_content=sidebar), 760))
        notes = [{"type": "guidance", "text": "Figma: ArticleCard → banner → comments shell (header, informer, pinned tree, обычное дерево, форма) → похожие публикации. Sidebar: 300×600 ad → читают сейчас → stories → 300×250 ad. На мобильном сайдбар скрывается вместе с двухколоночной оболочкой."}]

    elif section_id == "search":
        search_field = render_field(value="users", field_type="search")
        search_action = render_icon_button(icon, "search", "Искать", near_field=True)
        search_tabs = render_tabs(("Публикации", "Хабы", "Компании", "Пользователи", "Комментарии"), "Публикации")
        search_hint = render_notice("Нажмите на иконку поиска, чтобы увидеть результаты", extra_class="search-page__hint")
        content = f'''<section class="search-page"><form class="search-page__form">{search_field}{search_action}</form>{search_tabs}<div class="search-page__sort">по релевантности <span>⌄</span><b>◔</b></div></section>{search_hint}'''
        sidebar = '<div class="search-sidebar-skeleton"><i></i><small></small><small></small><small></small></div>'
        examples.append(("production-search", "Поиск · начальное состояние", page(content, sidebar_content=sidebar), 760))
        notes = [{"type": "guidance", "text": "Production URL: поле поиска → вкладки типа результата → сортировка → информационное состояние до запуска поиска. Список ArticleCard появляется только после получения результатов, поэтому в этом примере не имитируется."}]

    elif section_id == "editor":
        toolbar_icons = (
            ("wysiwyg", "Форматирование"), ("markdown", "Markdown"),
            ("image", "Изображение"), ("arrow-link-small", "Ссылка"),
            ("sorting-down", "Список"), ("edit", "Код"), ("dots", "Ещё"),
        )
        toolbar = "".join(render_icon_button(icon, symbol, label) for symbol, label in toolbar_icons)
        mode_switch = "".join((render_icon_button(icon, "markdown", "Markdown"), render_icon_button(icon, "wysiwyg", "WYSIWYG")))
        labels = "".join(render_chip(label) for label in ("Статья", "Аудитория", "Перевод", "Сложность", "Формат"))
        content = f'''{render_notice("У вас есть резервное сохранение «Самый беззащитный» — уже не сегодня в 14:23.", extra_class="editor-page__notice")}
<form class="editor-page"><section class="editor-page__canvas"><div class="pattern-page__row" style="justify-content:space-between"><h1 class="tm-title tm-title_h2">Создание публикации</h1><div class="editor-page__mode">{mode_switch}</div></div>
<div class="editor-page__labels">{labels}</div>
<div class="editor-page__author pattern-page__row">{render_user_info(avatar, "Никита Цаплин", "Управляющий партнёр")}</div>
<input class="editor-page__title-input" aria-label="Заголовок статьи" placeholder="Заголовок статьи"><p class="pattern-page__muted">Напишите, о чём публикация до 200 символов</p>
<div class="editor-page__cover"><span><strong>Добавьте обложку</strong><br><small>Перенесите сюда изображение или загрузите файл</small><br>{render_button("Загрузить обложку")}</span></div>
<div class="editor-page__workspace">＋ Нажмите «/» для вызова меню</div><div class="editor-page__toolbar">{toolbar}</div>
<div class="pattern-page__row" style="margin-top:16px"><strong>Хабы:</strong>{render_chip("＋ Хаб")}</div><div class="pattern-page__row" style="margin-top:8px"><strong>Теги:</strong>{render_chip("＋ Тег")}</div></section>
<section class="editor-page__footer"><div class="pattern-page__actions">{render_button("＋ Опрос")}{render_button("＋ Баннер")}{render_button("＋ Мультивиджет")}</div><div class="pattern-page__actions">{render_button("Опубликовать", variant="solid", extra_class="tm-button_color-christi")}{render_button("В черновик")}</div></section></form>'''
        examples.append(("figma-editor", "Редактор публикации", page(content, sidebar=False), 760))
        notes = [{"type": "guidance", "text": "Figma: полный экран редактора на 1024/768/320. На мобильном инструменты переносятся вниз, контент остаётся одноколоночным."}]

    elif section_id == "overlay-flows":
        options = ("Нарушение правил публикации", "Рекламный материал без пометки", "Нужны правки оформления", "Неподходящий хаб", "Недостоверная информация", "Слишком короткая публикация", "Дублирующий материал", "Требуется проверка модератором", "Другое")
        choices = ''.join(render_radio(item, "reason", checked=item == "Другое", extra_class="overlay-modal__choice") for item in options)
        dialog_footer = f'<footer class="dialog-footer">{render_button("Отправить", variant="solid")}{render_button("Отмена")}</footer>'
        content = f'''<div class="overlay-page"><div class="overlay-page__context"></div><div class="overlay-page__shade"></div><section class="overlay-modal modal-window" role="dialog" aria-modal="true" aria-labelledby="remove-reason-title"><header class="dialog-header"><h1 class="dialog-title" id="remove-reason-title">Причина снятия публикации<br>с размещения</h1></header><div class="dialog-body"><div class="overlay-modal__choices">{choices}</div>{render_field(textarea=True, aria_label="Другая причина")}</div>{dialog_footer}</section></div>'''
        examples.append(("figma-modal", "Модалка · причина снятия публикации", page(content, sidebar=False), 700))
        notes = [{"type": "guidance", "text": "Figma: модалка причины снятия публикации. На desktop — окно 320 px по центру затемнённой подложки; на mobile — та же модалка шириной экрана без нижней шторки."}]

    elif section_id == "settings-forms":
        field = lambda label, value: render_field(label=label, value=value, extra_class="settings-page__label")
        tabs = render_tabs(("Профиль", "Специализация", "Аккаунт", "Приватность", "Уведомления"), "Профиль")
        donation_notice = render_notice("Укажите данные кошельков или подключите сервис для получения вознаграждений.", extra_class="settings-page__notice")
        content = f'''<section class="settings-page__header"><h1 class="tm-title tm-title_h1">Настройки</h1>{tabs}</section>
<form class="settings-page__grid"><div><section class="settings-page__group">{field('Настоящее имя', 'Вася Пупкин')}{field('Место работы', '')}{render_button('Добавить место работы')}</section><section class="settings-page__group">{field('Специализация', 'Программист всех руси')}<div class="settings-page__fields">{field('Пол', 'Мужской')}{field('Дата рождения', '19 марта')}{field('Год', '1989')}</div>{field('Местоположение', 'Россия · Московская обл. · Москва')}</section><section class="settings-page__group"><h2>Контактная информация и веб-ресурсы</h2>{field('Сайт', 'https://habr.com/ru/auth/settings/profile/')}<div class="settings-page__fields">{field('Хабр Карма', 'melpnz')}{field('Ссылка', 'https://example.com')}</div>{render_button('Добавить ссылку')}</section><section class="settings-page__group"><h2>Донаты</h2>{donation_notice}{field('Кошелёк', 'YooMoney')}<div class="settings-page__fields">{field('Сервис', 'destream')}{field('Username', 'Username-destreamdonate')}</div></section><section class="settings-page__group">{render_field(label='Расскажите о себе', textarea=True, rows=6, extra_class='settings-page__label')}{render_button('Сохранить изменения', variant='solid', size='middle', extra_class='tm-button_color-christi', button_type='submit')}</section></div><aside class="settings-page__avatar"><strong>Аватар</strong>{render_avatar(avatar, size=64)}<a href="#">⟳ Загрузить аватарку</a><small>Формат: jpg, gif, png<br>Максимальный размер файла: 1Mb.</small>{render_button('Загрузить')}</aside></form>'''
        examples.append(("figma-settings", "Настройки профиля", page(content, sidebar=False), 760))
        notes = [{"type": "guidance", "text": "Figma: tabs настроек → форма профиля + avatar rail. На мобильном rail становится первым блоком, поля складываются в одну колонку."}]

    elif section_id == "service-error":
        messages = {
            "404": ("Страница устарела, была удалена или не существовала вовсе", "Обновить"),
            "403": ("У вас недостаточно прав для просмотра этой страницы", "На главную"),
            "500": ("Что-то пошло не так. Мы уже разбираемся", "Обновить"),
        }
        for code, (message, action) in messages.items():
            illustration = f"../../../../ui/assets/illustrations/placeholders/{code}.svg"
            content = f'''<section class="service-error"><div><img class="service-error__illustration" src="{illustration}" alt=""><h1 class="service-error__code">{code}</h1><p class="service-error__message">{message}</p><button class="btn btn_solid btn_middle" type="button">{action}</button></div></section>'''
            examples.append((f"figma-{code}", f"Ошибка {code}", page(content, sidebar=False), 620))
        notes = [{"type": "guidance", "text": "Figma: глобальные ошибки 401/403/404/451/500/502/503/504 и продуктовые заглушки. В витрине показаны три базовых композиционных варианта; SVG берутся из локального набора."}]

    if not examples:
        return [], [], ""
    output = []
    for example_id, example_title, body, height in examples:
        directory = ROOT / "examples" / "generated" / "patterns" / section_id
        directory.mkdir(parents=True, exist_ok=True)
        path = directory / f"{slug(example_id, example_id)}.html"
        path.write_text(example_document(example_title, body, page=True, section_id=section_id), encoding="utf-8")
        output.append({"id": example_id, "title": example_title, "file": path.relative_to(ROOT).as_posix(), "covers": [section_id], "preview": {"mode": "viewport", "widths": VIEWPORTS, "height": height}})
    return output, notes, title


def section_examples(source_html: Path, section_id: str, output_group: str, page: bool = False) -> tuple[list[dict], list[dict], str]:
    soup = BeautifulSoup(source_html.read_text(encoding="utf-8"), "html.parser")
    # Some component ids also exist in the inline SVG sprite (for example
    # `calendar`). Prefer the showcase section so an icon symbol cannot be
    # mistaken for the component example.
    section = soup.select_one(f"section#{section_id}") or soup.find(id=section_id)
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
    # Header and footer are maintained from current production, not reconstructed
    # from the legacy v1 showcase. Preserve them across the legacy migration so
    # `npm run migrate` cannot silently replace the current shell with old demos.
    preserved_shell_specs = {}
    preserved_shell_examples = {}
    for shell_id in ("header", "footer"):
        spec_path = ROOT / "machine" / "foundations" / f"{shell_id}.json"
        if spec_path.exists():
            preserved_shell_specs[shell_id] = spec_path.read_text(encoding="utf-8")
        example_root = ROOT / "examples" / "generated" / "foundations" / f"f-{shell_id}"
        if example_root.exists():
            preserved_shell_examples[shell_id] = {
                path.relative_to(example_root): path.read_bytes()
                for path in example_root.rglob("*") if path.is_file()
            }
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

    for shell_id, content in preserved_shell_specs.items():
        (ROOT / "machine" / "foundations" / f"{shell_id}.json").write_text(content, encoding="utf-8")
        example_root = ROOT / "examples" / "generated" / "foundations" / f"f-{shell_id}"
        for relative, payload in preserved_shell_examples.get(shell_id, {}).items():
            target = example_root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(payload)
    if "footer" in preserved_shell_specs:
        catalog.append({"id": "footer", "title": "Подвал", "kind": "foundation", "category": "foundations", "navSection": "foundations", "navSectionTitle": "Основы", "navGroup": "visual", "navGroupTitle": "Визуальный язык", "file": "machine/foundations/footer.json", "tags": ["footer", "tm-footer", "tm-footer-menu"]})

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
        if item_id in {"shell", "feed", "directory", "entity", "admin-section", "admin-form", "admin-list"}:
            examples, notes, section_summary = section_examples(page_html, item_id, "patterns", page=True)
        else:
            examples, notes, section_summary = custom_pattern_examples(item_id, title)
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
        if item_id == "shell":
            item["previewNotes"] = [
                {
                    "type": "guidance",
                    "text": "До 1023px основная область и сайдбар идут вертикально; с 1024px основная колонка занимает остаток, сайдбар фиксирован на 300px, gap — 16px. Контейнер: edge-to-edge до 767px, 768/16 на планшете и 1096/24 на desktop.",
                },
                {
                    "type": "guidance",
                    "text": "Фон страницы использует --background-gray, рабочие поверхности — --background-primary. Шапка и подвал подключаются на всех готовых страницах через общие habr-site-header и habr-site-footer из examples/site-shell.js.",
                },
                {"type": "guidance", "text": "production · 14/14 страниц"},
            ]
            item["layoutContract"] = {
                "pageBackground": "var(--background-gray)",
                "surfaceBackground": "var(--background-primary)",
                "container": {
                    "mobile": {"maxWidth": "none", "paddingInline": "0"},
                    "tablet": {"maxWidth": "48rem", "paddingInline": "1rem"},
                    "desktop": {"maxWidth": "68.5rem", "paddingInline": "1.5rem"},
                },
                "columns": {
                    "through1023": "stacked",
                    "from1024": "main + 1rem gap + 18.75rem sidebar",
                    "sidebarPosition": "relative",
                },
                "order": ["header", "page", "main", "sidebar", "footer"],
            }
        if examples:
            item["implementation"]["scripts"] = ["examples/site-shell.js"]
            item["shellDependencies"] = ["header", "footer"]
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
        item["evidence"] = PATTERN_EVIDENCE.get(
            item_id,
            [{"type": authority, "ref": doc_relative or "evidence/pattern-taxonomy.md"}] if authority != "none" else [],
        )
        if doc_relative:
            item["evidence"].append({"type": "pattern-spec", "ref": doc_relative})
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
        "dimensionTokens": {"baseUnit": "0.25rem", "referenceRootFontSize": "16px", "source": "machine/dimension-tokens.json", "css": "ui/dimension-tokens.css", "exceptions": "machine/reports/dimension-exceptions.json"},
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
        if foundation_id in preserved_shell_specs:
            continue
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
        "product": {"id": "habr", "title": "Хабр", "guideVersion": "1.0", "status": "active", "productionRelease": "2.349.1", "lastVerified": "2026-09-17"},
        "readOrder": ["machine/style-profile.json для задач уровня продукта или нового экрана", "machine/dimension-tokens.json для геометрии", "machine/catalog.json", "только выбранный file из catalog", "markdown, rules, implementation и examples — только при необходимости"],
        "files": {"catalog": "machine/catalog.json", "states": "machine/states.json", "tokens": "machine/tokens.json", "dimensionTokens": "machine/dimension-tokens.json", "dimensionExceptions": "machine/reports/dimension-exceptions.json", "maturityDiagnostics": "machine/reports/maturity-diagnostics.json", "styleProfile": "machine/style-profile.json", "assets": "machine/assets.json", "migrationMap": "machine/migration-map.json", "schema": "schema.json", "roadmap": "ROADMAP.md"},
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
        "catalogTargets": [{"id": entry["id"], "target": entry["file"], "status": "added-from-production" if entry["id"] == "footer" else "migrated"} for entry in catalog],
    })
    print(f"Migrated {len(catalog)} catalog items and {examples_count} isolated examples")


if __name__ == "__main__":
    main()
