// node stage-usage.mjs <run> start|end|record <stage> [--log transcript.jsonl]
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import { readUsage, difference, summarizeUsage } from './usage-lib.mjs';

const [run, action, stage, ...args] = process.argv.slice(2);
const opt = name => { const i = args.indexOf('--' + name); return i < 0 ? undefined : args[i + 1]; };
if (!run || !stage || !['start', 'end', 'record'].includes(action)) throw new Error('usage: stage-usage.mjs <run> start|end|record <stage> [--log path]');
const file = path.join(run, 'token-usage.json'); fs.mkdirSync(run, { recursive: true });
const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { schema: 'design-review-usage/1', stages: [] };
const findLog = () => {
  if (opt('log')) return path.resolve(opt('log'));
  if (process.env.CODEX_THREAD_ID && process.env.CLAUDE_SESSION_ID) return null; // Ambiguous nested hosts: require --log.
  const id = process.env.CODEX_THREAD_ID || process.env.CLAUDE_SESSION_ID;
  if (!id) return null; // Never guess another session from the newest file.
  const roots = [path.join(process.env.CODEX_HOME || path.join(os.homedir(), '.codex'), 'sessions'), path.join(os.homedir(), '.claude', 'projects')];
  const walk = dir => { if (!fs.existsSync(dir)) return null; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isFile() && e.name.endsWith('.jsonl') && e.name.includes(id)) return p; if (e.isDirectory()) { const hit = walk(p); if (hit) return hit; } } return null; };
  for (const dir of roots) { const p = walk(dir); if (p) return p; } return null;
};
const at = new Date().toISOString();
if (action === 'start') {
  if (data.stages.some(s => !s.endedAt)) throw new Error('Предыдущий этап не закрыт; завершите его, чтобы не считать токены дважды');
  const logPath = findLog();
  let baseline = null; try { baseline = await readUsage(logPath); } catch { /* Missing/locked host telemetry remains unavailable. */ }
  data.stages.push({ id: randomUUID(), stage, startedAt: at, logPath, baseline, provider: baseline?.provider || null, status: 'running' });
} else if (action === 'end') {
  const entry = data.stages.findLast(s => s.stage === stage && !s.endedAt);
  if (!entry) throw new Error('Нет открытого этапа: ' + stage);
  let current = null; try { current = await readUsage(entry.logPath); } catch { }
  const tokens = difference(entry.baseline, current);
  entry.endedAt = at; entry.provider = current?.provider || entry.baseline?.provider || null;
  entry.counterWindow = { startReportedAt: entry.baseline?.reportedAt || null, endReportedAt: current?.reportedAt || null };
  entry.status = tokens && tokens.total > 0 ? 'reported' : 'unavailable'; entry.tokens = entry.status === 'reported' ? tokens : null;
  entry.note = entry.tokens ? 'Разность опубликованных счётчиков на границах этапа; это не точный учёт ещё не завершённых запросов.' : 'Нет доступного нового счётчика usage либо счётчик сброшен. Токены неизвестны, не ноль.';
  delete entry.baseline; delete entry.logPath; // Do not export transcript paths or conversation contents.
} else {
  if (!opt('source')) throw new Error('Для ручного ввода нужен --source: откуда получены фактические счётчики');
  if (data.stages.some(s => !s.endedAt)) throw new Error('Сначала закройте открытый этап');
  const input = Number(opt('input')), output = Number(opt('output'));
  if (![input, output].every(n => Number.isSafeInteger(n) && n >= 0)) throw new Error('--input и --output должны быть фактическими неотрицательными числами');
  const cachedInput = opt('cached') == null ? null : Number(opt('cached'));
  if (cachedInput !== null && (!Number.isSafeInteger(cachedInput) || cachedInput < 0 || cachedInput > input)) throw new Error('Некорректное число cached');
  data.stages.push({ id: randomUUID(), stage, startedAt: at, endedAt: at, status: 'reported', sourceLabel: opt('source'), tokens: { input, output, cachedInput, cacheWriteInput: null, reasoningOutput: null, total: input + output }, note: 'Фактические показатели внесены агентом из указанного источника; время этапа не измерялось.' });
}
const tmp = file + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(data, null, 2)); fs.renameSync(tmp, file);
const summary = summarizeUsage(data), entry = data.stages.at(-1);
console.log(JSON.stringify(args.includes('--verbose') ? summary : { stage, action, status: entry.status, tokens: entry.tokens || null, measuredTotal: summary.totals.total, complete: summary.complete, file }, null, 2));
