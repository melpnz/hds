# -*- coding: utf-8 -*-
"""Связность документации.

Проверяет две вещи:
  1. markdown-ссылки [текст](путь) ведут на существующие файлы;
  2. пути в backticks (`ui/components/button.css`) существуют.

Имена production-артефактов (`button-Ccclp6vQ.css`, `page-feed.html`)
цитируются как источник и в пакете отсутствуют намеренно — они отсеиваются
по allowlist.json.
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ALLOW = json.load(io.open(os.path.join(ROOT, 'check', 'allowlist.json'), encoding='utf-8'))
EXTERNAL = [re.compile(p) for p in ALLOW['external_artifacts']['patterns']]


def all_files():
    out = set()
    for d, _, files in os.walk(ROOT):
        if os.sep + 'check' in d + os.sep and d.endswith('check'):
            pass
        for f in files:
            rel = os.path.relpath(os.path.join(d, f), ROOT).replace(os.sep, '/')
            out.add(rel)
    return out


def main():
    files = all_files()
    basenames = set(os.path.basename(f) for f in files)
    mds = sorted(f for f in files if f.endswith('.md'))

    bad_links, bad_paths = [], []
    checked = skipped = 0

    for m in mds:
        d = os.path.dirname(m)
        txt = io.open(os.path.join(ROOT, m), encoding='utf-8', errors='replace').read()

        for _, href in re.findall(r'!?\[([^\]]*)\]\(([^)]+)\)', txt):
            if href.startswith(('http', '#', 'mailto')):
                continue
            p = href.split('#')[0]
            if not p:
                continue
            checked += 1
            tgt = os.path.normpath(os.path.join(ROOT, d, p))
            if not os.path.exists(tgt):
                bad_links.append((m, href))

        for ref in sorted(set(re.findall(r'`([A-Za-z0-9_/.\-]+\.(?:css|md|html|svg|json))`', txt))):
            base = os.path.basename(ref)
            if any(rx.search(base) or rx.search(ref) for rx in EXTERNAL):
                skipped += 1
                continue
            checked += 1
            if base in basenames:
                continue
            if os.path.exists(os.path.normpath(os.path.join(ROOT, d, ref))):
                continue
            bad_paths.append((m, ref))

    print('проверено ссылок и путей: %d (внешних артефактов пропущено: %d)' % (checked, skipped))
    if not bad_links and not bad_paths:
        print('битых ссылок нет')
        return 0
    for m, h in bad_links:
        print('ОШИБКА ссылка   %-38s %s' % (m, h))
    for m, h in bad_paths:
        print('ОШИБКА путь     %-38s %s' % (m, h))
    return 1


if __name__ == '__main__':
    sys.exit(main())
