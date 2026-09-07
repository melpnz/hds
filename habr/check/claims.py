# -*- coding: utf-8 -*-
"""Спецификации не должны отставать от кода.

Берёт в спеках объявления вида `padding: 8px 16px`, взятые в backticks, и
проверяет, что такое же значение у того же свойства есть хоть в одном
ui/*.css. Ловит случай, когда CSS поправили, а текст рядом — нет.
"""
import io, os, re, glob, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

css = ''
for f in glob.glob('ui/**/*.css', recursive=True):
    css += io.open(f, encoding='utf-8', errors='replace').read()
css_norm = re.sub(r'\s+', ' ', css)

PROPS = ('width|height|padding|margin|border-radius|font-size|line-height|gap|'
         'border|top|left|right|bottom|min-width|max-width|min-height|column-gap|'
         'row-gap|flex|opacity|z-index|border-width|letter-spacing|font-weight')

suspect = []
checked = 0
for f in sorted(glob.glob('components/**/*.md', recursive=True)):
    txt = io.open(f, encoding='utf-8', errors='replace').read()
    for m in re.findall(r'`((?:' + PROPS + r')\s*:\s*[^`;{}]+)`', txt):
        decl = re.sub(r'\s+', ' ', m).strip().rstrip(';')
        prop, val = decl.split(':', 1)
        prop, val = prop.strip(), val.strip()
        checked += 1
        # ищем такое же объявление в CSS, допуская 0.5 <-> .5 и пробелы
        alts = {val}
        alts.add(re.sub(r'\b0(\.\d)', r'\1', val))
        alts.add(re.sub(r'(^|\s)(\.\d)', r'\g<1>0\2', val))
        found = any(re.search(re.escape(prop) + r'\s*:\s*' + re.escape(a).replace(r'\ ', r'\s*') + r'\s*[;}]', css_norm)
                    for a in alts)
        if not found:
            suspect.append((f, decl))

print('проверено объявлений, процитированных в спеках:', checked)
if not suspect:
    print('расхождений нет')
    sys.exit(0)
print('не нашлось в ui/*.css:', len(suspect))
print('(часть может быть цитатой Figma или описанием удалённого —')
print(' проверять глазами, это подсказка, а не приговор)')
for f, d in suspect:
    print('   %-38s %s' % (f.replace(os.sep, '/'), d))
sys.exit(0)
