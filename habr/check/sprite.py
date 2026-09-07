# -*- coding: utf-8 -*-
"""Инлайновый спрайт витрины — производная от ui/assets/icons/single/.

Спрайт лежит прямо в components.html, потому что `<use xlink:href="файл.svg#id">`
не работает при открытии страницы по `file://`. Но раз он инлайновый, его
легко поправить руками и разойтись с источником — так уже случалось:
удалённая иконка продолжала рисоваться, потому что в документе оказалось
два спрайта с одинаковыми id.

    python check/sprite.py            проверить, что спрайт = файлам
    python check/sprite.py --write    пересобрать спрайт из файлов
"""
import io
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOW = os.path.join(ROOT, 'showcase', 'components.html')
ICONS = os.path.join(ROOT, 'ui', 'assets', 'icons', 'single')

START = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'


def symbols_from_files():
    """Читает single/*.svg и превращает каждый в <symbol> с id по имени файла."""
    out = []
    for f in sorted(os.listdir(ICONS)):
        if not f.endswith('.svg'):
            continue
        name = f[:-4]
        txt = io.open(os.path.join(ICONS, f), encoding='utf-8').read()
        vb = re.search(r'viewBox="([^"]+)"', txt)
        body = re.sub(r'^.*?<svg[^>]*>', '', txt, flags=re.S)
        body = re.sub(r'</svg>\s*$', '', body).strip()
        body = re.sub(r'\s+', ' ', body)
        out.append('  <symbol id="%s"%s>%s</symbol>'
                   % (name, ' viewBox="%s"' % vb.group(1) if vb else '', body))
    return out


def current_sprite(html):
    """Границы инлайнового спрайта: от открывающего <svg> до </svg>
       после последнего <symbol> — внутри символов свои </svg> нет,
       но так надёжнее при любом форматировании."""
    i = html.find(START)
    if i < 0:
        return None, None, None
    last = html.rindex('</symbol>', i)
    j = html.index('</svg>', last) + len('</svg>')
    return i, j, html[i:j]


def main():
    html = io.open(SHOW, encoding='utf-8', newline='').read()
    i, j, sprite = current_sprite(html)
    if sprite is None:
        print('ОШИБКА: инлайновый спрайт не найден в showcase/components.html')
        return 1

    have = re.findall(r'<symbol id="([^"]+)"', sprite)
    want = [os.path.splitext(f)[0] for f in sorted(os.listdir(ICONS)) if f.endswith('.svg')]

    dup = sorted(set(x for x in have if have.count(x) > 1))
    missing = sorted(set(want) - set(have))
    extra = sorted(set(have) - set(want))

    if '--write' in sys.argv:
        new = START + '\n' + '\n'.join(symbols_from_files()) + '\n</svg>'
        io.open(SHOW, 'w', encoding='utf-8', newline='').write(html[:i] + new + html[j:])
        print('спрайт пересобран из %s: %d символов' % ('ui/assets/icons/single/', len(want)))
        return 0

    print('символов в спрайте: %d, файлов в single/: %d' % (len(have), len(want)))
    ok = True
    for x in dup:
        ok = False
        print('ОШИБКА: id «%s» в спрайте дважды — второй перекроет первый' % x)
    for x in missing:
        ok = False
        print('ОШИБКА: %s.svg есть в single/, но не попал в спрайт' % x)
    for x in extra:
        ok = False
        print('ОШИБКА: символ «%s» в спрайте, но файла single/%s.svg нет' % (x, x))
    if ok:
        print('спрайт совпадает с источником')
        return 0
    print('пересобрать:  python check/sprite.py --write')
    return 1


if __name__ == '__main__':
    sys.exit(main())
