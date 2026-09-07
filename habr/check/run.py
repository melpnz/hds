# -*- coding: utf-8 -*-
"""Одна команда, чтобы проверить пакет целиком.

    python check/run.py            все проверки
    python check/run.py --offline  без тех, что ходят в браузер и сеть

Возвращает ненулевой код, если хоть одна проверка нашла ошибку, — годится
для pre-commit и CI.
"""
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, 'check')

OFFLINE = [
    ('счётчики и внутренняя согласованность', [sys.executable, os.path.join(HERE, 'counts.py')]),
    ('связность документации', [sys.executable, os.path.join(HERE, 'links.py')]),
    ('покрытие: код против витрины', [sys.executable, os.path.join(HERE, 'coverage.py')]),
    ('цитаты значений в спецификациях', [sys.executable, os.path.join(HERE, 'claims.py')]),
    ('спрайт против файлов иконок', [sys.executable, os.path.join(HERE, 'sprite.py')]),
]
ONLINE = [
    ('отрисовка витрины', ['node', os.path.join(HERE, 'showcase.js')]),
    ('паритет с habr.com', ['node', os.path.join(HERE, 'parity.js')]),
]


def run(title, cmd):
    print('\n' + '=' * 68)
    print('  ' + title)
    print('=' * 68)
    env = dict(os.environ, PYTHONIOENCODING='utf-8')
    try:
        p = subprocess.run(cmd, cwd=ROOT, env=env, capture_output=True)
    except FileNotFoundError:
        print('ПРОПУЩЕНО: не найден ' + cmd[0])
        return 0
    out = (p.stdout + p.stderr).decode('utf-8', 'replace').rstrip()
    if out:
        print(out)
    return p.returncode


def main():
    checks = list(OFFLINE)
    if '--offline' not in sys.argv:
        checks += ONLINE
    failed = []
    for title, cmd in checks:
        if run(title, cmd) != 0:
            failed.append(title)
    print('\n' + '=' * 68)
    if failed:
        print('  ПРОВАЛЕНО: ' + ', '.join(failed))
        return 1
    print('  всё чисто (%d проверок)' % len(checks))
    return 0


if __name__ == '__main__':
    sys.exit(main())
