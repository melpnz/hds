# -*- coding: utf-8 -*-
"""Покрытие: что объявлено в CSS против того, что показано в витрине.

Две ошибки, которые ловит:
  * класс есть в разметке витрины, но объявления нет нигде — копирующий
    получит не то, что видел (кроме известных разметочных, allowlist.json);
  * класс объявлен, но нигде не показан — для потребителя его как бы нет.
    Такие собираются в отчёт и должны быть перечислены в секции «Новое»
    витрины; проверка следит, чтобы список там не разошёлся с кодом.
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALLOW = json.load(io.open(os.path.join(ROOT, 'check', 'allowlist.json'), encoding='utf-8'))
MARKUP_ONLY = set(k for k in ALLOW['markup_only_classes'] if not k.startswith('_'))
OK_PREFIX = tuple(ALLOW['undemonstrated_ok']['prefixes'])
OK_EXACT = set(ALLOW['undemonstrated_ok']['exact'])


def read(p):
    return io.open(os.path.join(ROOT, p), encoding='utf-8', errors='replace').read()


def css_files():
    out = []
    for d, _, files in os.walk(os.path.join(ROOT, 'ui')):
        for f in files:
            if f.endswith('.css'):
                out.append(os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/'))
    return sorted(out)


def declared():
    out = {}
    for f in css_files():
        txt = re.sub(r'/\*.*?\*/', ' ', read(f), flags=re.S)
        for block in re.findall(r'([^{}]+)\{', txt):
            if '@' in block:
                continue
            for cls in re.findall(r'\.([A-Za-z][A-Za-z0-9_-]*)', block):
                out.setdefault(cls, set()).add(f)
    return out


def used():
    out = set()
    for f in ('showcase/components.html', 'showcase/pages.html', 'showcase/header-frame.html'):
        if not os.path.exists(os.path.join(ROOT, f)):
            continue
        for attr in re.findall(r'class="([^"]+)"', read(f)):
            out.update(attr.split())
    return out


def undemonstrated():
    """Классы, объявленные в ui/, но не встречающиеся в разметке витрины."""
    decl, use = declared(), used()
    out = []
    for c, files in sorted(decl.items()):
        if c.startswith('doc-') or c in use:
            continue
        if c.startswith(OK_PREFIX) or c in OK_EXACT:
            continue
        out.append((c, sorted(files)))
    return out


def main():
    decl, use = declared(), used()
    prod = {c: v for c, v in decl.items() if not c.startswith('doc-')}

    orphans = sorted(c for c in use
                     if c not in decl and not c.startswith('doc-')
                     and not c.startswith('tm-svg-')
                     and c not in MARKUP_ONLY and c != 'visually-hidden')

    und = undemonstrated()
    shown = len(prod) - len([c for c, _ in und if c in prod])

    print('продуктовых классов объявлено: %d' % len(prod))
    print('показано в витрине:            %d' % shown)
    print('не показано (секция «Новое»):  %d' % len(und))

    # список в витрине должен совпадать со списком из кода
    show = read('showcase/components.html')
    m = re.search(r'id="new-classes".*?</section>', show, re.S)
    drift = None
    if m:
        listed = set(re.findall(r'<code>\.([A-Za-z][A-Za-z0-9_-]*)</code>', m.group(0)))
        expect = set(c for c, _ in und)
        missing = sorted(expect - listed)
        extra = sorted(listed - expect)
        if missing or extra:
            drift = (missing, extra)

    ok = True
    if orphans:
        ok = False
        print()
        for c in orphans:
            print('ОШИБКА: .%s есть в разметке витрины, но не объявлен и не в allowlist' % c)
    if drift:
        ok = False
        missing, extra = drift
        print()
        for c in missing:
            print('ОШИБКА: .%s не показан и отсутствует в секции «Новое»' % c)
        for c in extra:
            print('ОШИБКА: .%s перечислен в «Новом», но уже показан или удалён' % c)
    elif m is None:
        ok = False
        print('ОШИБКА: в витрине нет секции id="new-classes"')

    if ok:
        print('расхождений нет')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
