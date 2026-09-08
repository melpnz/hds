import json, pathlib, re

p = pathlib.Path(__file__).resolve().parents[2]
e = p / 'evidence/source/figma'
semantic = json.loads((e/'typography-details.json').read_text(encoding='utf8'))['variants']
fixed = json.loads((e/'typography-fixed-lists.json').read_text(encoding='utf8'))[0]['children']
groups = [g for g in json.loads((e/'typography-groups.json').read_text(encoding='utf8')) if g['id'] in ['2049:285','2058:321','2077:427']]
tokens = {'--ps-type-font': "'Partner Inter', Arial, sans-serif", '--ps-type-color':'#000000', '--ps-type-heading-weight':'700', '--ps-type-body-weight':'400', '--ps-type-letter-spacing':'0px'}
descriptions = {'--ps-type-font':'Тема: семейство шрифта; после замены проверьте переносы.', '--ps-type-color':'Тема: цвет текста, исходное значение Figma.', '--ps-type-heading-weight':'Тема: начертание заголовков и t-стилей; исходное 700.', '--ps-type-body-weight':'Тема: начертание абзацев; исходное 400.', '--ps-type-letter-spacing':'Геометрия: исходный межбуквенный интервал.'}
for v in semantic:
    style, bp = re.match(r'Text style=(.*), Breakpoint=(.*)', v['name']).groups()
    style=style.lower(); bp='mobile' if bp=='tablet mobile' else 'desktop'
    for suffix,val in [('size',v['text'][0]['size']),('line',v['text'][0]['line']['value'])]:
        name=f'--ps-type-{style}-{bp}-{suffix}'
        tokens[name]=f'{val}px'; descriptions[name]=f'Геометрия: {style}, {bp}, '+('кегль' if suffix=='size' else 'межстрочный интервал')+f". Figma {v['id']}."
for v in fixed:
    style=re.search(r'Text style=(.*), Font',v['name'])[1]
    for suffix,val in [('size',v['children'][0]['size']),('line',v['children'][0]['line']['value'])]:
        name=f'--ps-type-{style}-{suffix}'
        tokens[name]=f'{val}px'; descriptions[name]=f'Геометрия: фиксированный {style}, '+('кегль' if suffix=='size' else 'межстрочный интервал')+'.'
gaps=sorted({v['gap'] for g in groups for v in g['children']})
for gap in gaps:
    name=f'--ps-type-gap-{gap}'; tokens[name]=f'{gap}px'; descriptions[name]='Геометрия: промежуток конкретной пары из typography-groups.json.'
token_css='/* New names for values read from the supplied Figma UI-kit; not production tokens. */\n:root {\n'+''.join(f'  {k}: {v};\n' for k,v in tokens.items())+'}\n[data-ps-theme="demo"] { --ps-type-color: #362048; }\n'
(p/'ui/typography-tokens.css').write_text(token_css,encoding='utf8')
styles=list(dict.fromkeys(re.search(r'Text style=(.*), Breakpoint',v['name'])[1].lower() for v in semantic))
css='''/* Typography geometry from saved Figma. HTML API, wrapping and auto threshold are new implementation. */
.ps-type { box-sizing: border-box; margin: 0; min-width: 0; max-width: 100%; font-family: var(--ps-type-font); color: var(--ps-type-color); font-weight: var(--ps-type-body-weight); font-style: normal; letter-spacing: var(--ps-type-letter-spacing); text-align: left; overflow-wrap: anywhere; }
.ps-type-pair { display: flex; flex-direction: column; min-width: 0; max-width: 100%; margin: 0; padding: 0; }
'''
for s in styles:
    weight='heading' if s[0] in ['h','t'] else 'body'
    css+=f'.ps-type[data-type="{s}"] {{ font-size: var(--ps-type-{s}-desktop-size); line-height: var(--ps-type-{s}-desktop-line); font-weight: var(--ps-type-{weight}-weight); }}\n'
for s in ['f12','f14','f16','f18','f20']:
    css+=f'.ps-type[data-type="{s}"] {{ font-size: var(--ps-type-{s}-size); line-height: var(--ps-type-{s}-line); }}\n'
css+='.ps-type[data-weight="bold"] { font-weight: var(--ps-type-heading-weight); }\n'
pairs={}
for g in groups:
    for v in g['children']:
        pair,bp=re.match(r'Text style=(.*), Breakpoint=(.*)',v['name']).groups()
        key=pair.lower().replace(' + ','-'); bp='mobile' if bp=='tablet mobile' else 'desktop'
        pairs.setdefault(key,{})[bp]=v['gap']
for key,v in pairs.items(): css+=f'.ps-type-pair[data-pair="{key}"] {{ gap: var(--ps-type-gap-{v["desktop"]}); }}\n'
def mode_rules(mode,indent=''):
    out=''
    for s in styles: out+=indent+f'[data-ps-type-mode="{mode}"] .ps-type[data-type="{s}"] {{ font-size: var(--ps-type-{s}-mobile-size); line-height: var(--ps-type-{s}-mobile-line); }}\n'
    for key,v in pairs.items(): out+=indent+f'[data-ps-type-mode="{mode}"] .ps-type-pair[data-pair="{key}"] {{ gap: var(--ps-type-gap-{v["mobile"]}); }}\n'
    return out
css+='/* 1024px is a chosen runtime threshold, not a measured Figma breakpoint. */\n@media (max-width: 1023px) {\n'+mode_rules('auto','  ')+'}\n'+mode_rules('mobile')
(p/'ui/components/typography.css').write_text(css,encoding='utf8')
(p/'.pipeline/typography/token-catalog.json').write_text(json.dumps([{'name':k,'description':descriptions[k],'sourceValue':v} for k,v in tokens.items()],ensure_ascii=False,indent=2),encoding='utf8')
data={'semantic':semantic,'fixed':fixed,'groups':groups,'tokenCatalog':[{'name':k,'description':descriptions[k]} for k in tokens]}
(p/'showcase/typography-data.js').write_text('export default '+json.dumps(data,ensure_ascii=False)+';\n',encoding='utf8')
integration={'imports':["@import './typography-tokens.css';","@import './components/typography.css';"], 'manifest':{'id':'typography','canonicalName':'Typography','storybookNames':[],'legacyAliases':['Typography Item Semantic','Typography Item Fix','Typography group H+p','Typography group H+t','Typography group t+p'],'category':'data-display','kind':'primitive','specPath':'components/foundations/typography.md','cssRoots':['.ps-type','.ps-type-pair'],'showcaseAnchor':'c-typography','showcasePath':'showcase/typography.html','figmaEvidence':['evidence/source/figma/typography-details.json','evidence/source/figma/typography-fixed-lists.json','evidence/source/figma/typography-groups.json','evidence/source/figma/typography-context.txt','evidence/source/figma/typography-overview.png'],'status':'partial','requiredStates':['default'],'coveredScope':'28 semantic + 10 fixed text variants + 64 paired combinations; new HTML API and auto1024 threshold','uncovered':['List Vertical Item and Point icon implementation pending Icon R2-01','Exact Inter source version','Production runtime comparison'],'runtimeSource':'new implementation'},'indexLabel':'Typography — semantic/fixed/pairs, partial; list/point pending Icon','showcaseLink':'showcase/typography.html#c-typography'}
(p/'.pipeline/typography/integration.json').write_text(json.dumps(integration,ensure_ascii=False,indent=2),encoding='utf8')
print(f'Generated {len(tokens)} typography tokens, {len(semantic)} semantic + {len(fixed)} fixed + {sum(len(g["children"]) for g in groups)} pair examples.')
