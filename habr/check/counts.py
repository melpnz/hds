# -*- coding: utf-8 -*-
"""Считает всё, что пакет о себе утверждает.

Единственный источник чисел для README.md, ROADMAP.md и витрины: если
где-то в тексте стоит число, оно должно приходить отсюда. Числа, набитые
руками, устаревают молча — это уже случалось.

Запуск:  python check/counts.py            — печатает таблицу
         python check/counts.py --json     — печатает JSON
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(path):
    return io.open(os.path.join(ROOT, path), encoding='utf-8', errors='replace').read()


def walk(rel, ext):
    out = []
    base = os.path.join(ROOT, rel)
    for d, _, files in os.walk(base):
        for f in files:
            if f.endswith(ext):
                out.append(os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/'))
    return sorted(out)


def collect():
    n = {}

    # --- компоненты
    comp_css = [f for f in walk('ui/components', '.css')]
    n['component_css'] = len(comp_css)
    specs = [f for f in walk('components', '.md') if not f.endswith('INDEX.md')]
    n['component_specs'] = len(specs)

    # --- витрина
    show = read('showcase/components.html')
    n['showcase_sections'] = len(re.findall(r'<section class="doc-section" id="', show))
    n['showcase_nav_links'] = len(re.findall(r'<a href="#', show[:show.index('</nav>')]))
    n['sprite_symbols'] = len(re.findall(r'<symbol id="', show))
    pages = read('showcase/pages.html')
    n['page_patterns'] = len(re.findall(r'<section[^>]*id="', pages))

    # --- правила
    rules = read('RULES.md')
    ids = set(re.findall(r'^\| \*\*([A-Z]{2,}-\d+)\*\*', rules, re.M))
    ids |= set(re.findall(r'^\*\*([A-Z]{2,}-\d+)\.', rules, re.M))
    n['rules'] = len(ids)
    n['decision_guides'] = len(set(re.findall(r'DG-(\d+)', rules)))

    # --- иконки
    n['icons_single'] = len(walk('ui/assets/icons/single', '.svg'))
    n['icons_library'] = len(walk('ui/assets/icons/library', '.svg'))
    n['icons_megazord'] = len(re.findall(r'<symbol id="', read('ui/assets/icons/megazord.svg')))
    n['illustrations_avatars'] = len(walk('ui/assets/illustrations/avatars', '.svg'))
    n['illustrations_placeholders'] = len(walk('ui/assets/illustrations/placeholders', '.svg'))

    # --- токены темы
    light = read('ui/themes/light-v2.css')
    dark = read('ui/themes/dark-v2.css')
    n['tokens_light'] = len(set(re.findall(r'^\s*(--[a-z0-9-]+):', light, re.M)))
    n['tokens_dark'] = len(set(re.findall(r'^\s*(--[a-z0-9-]+):', dark, re.M)))

    # --- CSS-файлы всего
    n['ui_css_files'] = len(walk('ui', '.css'))

    # --- версия production, на которую пакет ссылается
    vers = set(re.findall(r'2\.\d+\.\d+', read('README.md') + read('ROADMAP.md')))
    n['claimed_release'] = sorted(vers)[0] if vers else '—'
    return n


LABELS = [
    ('component_css', 'CSS-файлов компонентов (ui/components/*.css)'),
    ('component_specs', 'спецификаций компонентов (components/**/*.md)'),
    ('showcase_sections', 'секций в витрине components.html'),
    ('showcase_nav_links', 'пунктов навигации витрины'),
    ('page_patterns', 'разделов в pages.html'),
    ('sprite_symbols', 'символов в спрайте витрины'),
    ('rules', 'правил в RULES.md'),
    ('decision_guides', 'Decision Guides'),
    ('icons_single', 'иконок в assets/icons/single/'),
    ('icons_library', 'иконок в assets/icons/library/'),
    ('icons_megazord', 'символов в production-спрайте megazord.svg'),
    ('illustrations_avatars', 'иллюстраций-аватаров'),
    ('illustrations_placeholders', 'иллюстраций пустых состояний'),
    ('tokens_light', 'токенов в light-v2.css'),
    ('tokens_dark', 'токенов в dark-v2.css'),
    ('ui_css_files', 'CSS-файлов в ui/ всего'),
    ('claimed_release', 'release production, заявленный в пакете'),
]


def main():
    n = collect()
    if '--json' in sys.argv:
        print(json.dumps(n, ensure_ascii=False, indent=1))
        return 0
    for key, label in LABELS:
        print('%-48s %s' % (label, n[key]))
    # согласованность внутри самого пакета
    bad = []
    if n['showcase_sections'] != n['showcase_nav_links']:
        bad.append('секций %d != пунктов навигации %d'
                   % (n['showcase_sections'], n['showcase_nav_links']))
    if n['tokens_light'] != n['tokens_dark']:
        bad.append('токенов light %d != dark %d' % (n['tokens_light'], n['tokens_dark']))
    print()
    if bad:
        for b in bad:
            print('ОШИБКА: ' + b)
        return 1
    print('внутренняя согласованность: в порядке')
    return 0


if __name__ == '__main__':
    sys.exit(main())
