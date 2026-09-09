# -*- coding: utf-8 -*-
"""Совместимая точка входа для проверки нового machine-first пакета.

Старые проверки v1 сохранены в archive/habr/v1/check. Новый канон
проверяется validate.mjs, чтобы внешняя команда ``python check/run.py``
не сломалась после миграции.
"""
import os
import subprocess
import sys


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main() -> int:
    env = dict(os.environ, PYTHONIOENCODING="utf-8")
    result = subprocess.run(["node", "validate.mjs"], cwd=ROOT, env=env)
    if result.returncode:
        return result.returncode
    print("Совместимая проверка Habr завершена. Браузерная приёмка: npm run validate:viewer -- <base-url>")
    return 0


if __name__ == "__main__":
    sys.exit(main())
