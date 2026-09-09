# Проверки Habr

Основные проверки machine-first пакета:

```powershell
npm run validate
npm run serve
npm run validate:viewer -- http://127.0.0.1:4173
```

Команда `python check/run.py` сохранена для обратной совместимости и запускает статическую проверку нового пакета.

Исходные проверки v1, рассчитанные на монолитные `showcase/components.html` и `showcase/pages.html`, находятся в `archive/habr/v1/check/`. Они не применяются к новой нарезанной витрине.
