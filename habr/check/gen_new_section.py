# -*- coding: utf-8 -*-
"""Генерирует секцию «Новое» в витрине — перечень классов, которые есть
   в CSS, но не показаны ни одним специменом.

Секция собирается тем же кодом, которым check/coverage.py её проверяет,
поэтому разойтись они не могут. Запускать после любой правки ui/*.css:

    python check/gen_new_section.py
"""
import io
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from coverage import undemonstrated                                   # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOW = os.path.join(ROOT, 'showcase', 'components.html')

# как назвать группу по имени файла
TITLES = {
    'ui/components/article-card.css': 'ArticleCard',
    'ui/components/badges.css': 'Badges',
    'ui/components/block.css': 'Block',
    'ui/components/button.css': 'Button',
    'ui/components/calendar.css': 'Calendar',
    'ui/components/checkbox.css': 'Checkbox',
    'ui/components/chip.css': 'Chip',
    'ui/components/dialog.css': 'Dialog',
    'ui/components/dropdown.css': 'Dropdown',
    'ui/components/hint.css': 'Informer / Hint',
    'ui/components/icon-button.css': 'IconButton',
    'ui/components/icon.css': 'Icon',
    'ui/components/input.css': 'Input',
    'ui/components/notice.css': 'Notice',
    'ui/components/pagination.css': 'Pagination',
    'ui/components/popover.css': 'Popover',
    'ui/components/primitives.css': 'Мелкие примитивы',
    'ui/components/radio.css': 'Radio',
    'ui/components/section-name.css': 'SectionName',
    'ui/components/tabs.css': 'Tabs',
    'ui/components/textarea.css': 'Textarea',
    'ui/components/title.css': 'Title',
    'ui/components/votes.css': 'Votes',
    'ui/components/avatar.css': 'Avatar',
    'ui/layout.css': 'Оболочка страницы',
    'ui/patterns.css': 'Паттерны страниц',
    'ui/foundations.css': 'Foundations',
}


def build():
    items = undemonstrated()
    groups = {}
    for cls, files in items:
        key = files[0]
        groups.setdefault(key, []).append(cls)

    L = []
    a = L.append
    a('  <section class="doc-section" id="new-classes">')
    a('    <h2>Новое — есть в коде, нет в примерах</h2>')
    a('    <p class="doc-meta">%d класс(ов) · сгенерировано check/gen_new_section.py</p>' % len(items))
    a('    <p class="doc-note">Эти классы перенесены из production и лежат в')
    a('      <code>ui/</code>, но ни один специмен выше их не показывает —')
    a('      значит, для того, кто собирает экран по витрине, их как бы нет.')
    a('      Список собирается из самого CSS, а не пишется руками:')
    a('      <code>check/coverage.py</code> сверяет его при каждой проверке и')
    a('      падает, если он разошёлся с кодом. Класс уходит отсюда сам, как')
    a('      только появляется в разметке любого примера.</p>')
    a('')
    a('    <div class="doc-specimen" style="padding:0;overflow-x:auto">')
    a('      <table class="doc-table">')
    a('        <tr><th>Компонент</th><th>Файл</th><th>Классы без примера</th></tr>')
    for f in sorted(groups, key=lambda x: (TITLES.get(x, 'яя'), x)):
        title = TITLES.get(f, f.split('/')[-1])
        cls = ' '.join('<code>.%s</code>' % c for c in sorted(groups[f]))
        a('        <tr><td>%s</td><td><code>%s</code></td><td>%s</td></tr>' % (title, f, cls))
    a('      </table>')
    a('    </div>')
    a('  </section>')
    return '\n'.join(L), len(items)


def main():
    html, n = build()
    s = io.open(SHOW, encoding='utf-8', newline='').read()

    if 'id="new-classes"' in s:
        i = s.index('  <section class="doc-section" id="new-classes">')
        j = s.index('</section>', i) + len('</section>')
        s = s[:i] + html + s[j:]
        where = 'обновлена'
    else:
        anchor = '  <section class="doc-section" id="gaps">'
        assert s.count(anchor) == 1, 'не найдена секция gaps, некуда вставлять'
        s = s.replace(anchor, html + '\n\n  <!-- ' + '=' * 65 + ' -->\n' + anchor)
        where = 'создана'

    if 'href="#new-classes"' not in s:
        nav = '  <a href="#gaps">Coverage checkpoint</a>'
        assert s.count(nav) == 1, 'не найден пункт навигации Coverage checkpoint'
        s = s.replace(nav, '  <a href="#new-classes">Новое</a>\n' + nav)

    io.open(SHOW, 'w', encoding='utf-8', newline='').write(s)
    print('секция «Новое» %s: %d классов' % (where, n))
    return 0


if __name__ == '__main__':
    sys.exit(main())
