// READ-ONLY. Имена переменных (токенов) макета по их id — через use_figma (Plugin API), когда REST недоступен
// (имена переменных в REST — только Enterprise). Ничего не меняет в макете.
// 1) Подставить VAR_IDS из <run>/figma/variables-needed.json (частями по ~70, чтобы ответ влез в 20 КБ).
// 2) Строки ответа сохранить как есть в <run>/figma/variables.tsv (части — подряд) — match-figma.mjs подхватит.
// Формат строки: <локальный id>@<8 символов ключа> | имя | коллекция | значение (#RRGGBB или число)
const VAR_IDS = ["REPLACE"];

const hex = c => { const h = n => Math.round(n * 255).toString(16).padStart(2, '0'); return ('#' + h(c.r) + h(c.g) + h(c.b) + (c.a !== undefined && c.a < 1 ? h(c.a) : '')).toUpperCase(); };
const out = [];
for (const id of VAR_IDS) {
  let v = null; try { v = await figma.variables.getVariableByIdAsync(id); } catch {}
  if (!v) { out.push(`${id} | ? | | `); continue; }
  let col = null; try { col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); } catch {}
  // значение в режиме по умолчанию; алиасы раскрываем до конечного значения
  let val = col ? v.valuesByMode[col.defaultModeId] : Object.values(v.valuesByMode)[0];
  for (let i = 0; i < 5 && val && val.type === 'VARIABLE_ALIAS'; i++) {
    const a = await figma.variables.getVariableByIdAsync(val.id); if (!a) break;
    const ac = await figma.variables.getVariableCollectionByIdAsync(a.variableCollectionId).catch(() => null);
    val = ac ? a.valuesByMode[ac.defaultModeId] : Object.values(a.valuesByMode)[0];
  }
  const value = val && typeof val === 'object' && 'r' in val ? hex(val) : typeof val === 'number' ? Math.round(val * 100) / 100 : val && typeof val === 'object' ? 'alias' : val;
  const key = id.includes('/') ? id.split('/')[1] + '@' + id.slice(11, 19) : id;
  out.push([key, v.name, col ? col.name : '', value].join(' | '));
}
return out.join('\n');
