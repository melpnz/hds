import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

export const TOKEN_KEYS = ['input', 'output', 'cachedInput', 'cacheWriteInput', 'reasoningOutput', 'total'];
export const REVIEW_STAGES = ['context', 'figma', 'capture', 'compare', 'curation', 'report', 'feedback'];
const n = x => Number.isSafeInteger(x) && x >= 0 ? x : null;
export function codexTokens(u) {
  const input = n(u?.input_tokens), output = n(u?.output_tokens);
  if (input === null || output === null) return null;
  return { input, output, cachedInput: n(u.cached_input_tokens), cacheWriteInput: n(u.cache_write_input_tokens), reasoningOutput: n(u.reasoning_output_tokens), total: input + output };
}
export function claudeTokens(u) {
  const fresh = n(u?.input_tokens), output = n(u?.output_tokens);
  if (fresh === null || output === null) return null;
  const cachedInput = n(u.cache_read_input_tokens), cacheWriteInput = n(u.cache_creation_input_tokens);
  const input = fresh + (cachedInput ?? 0) + (cacheWriteInput ?? 0);
  return { input, output, cachedInput, cacheWriteInput, reasoningOutput: null, total: input + output };
}
export function difference(before, after) {
  if (!before?.tokens || !after?.tokens || before.source !== after.source || before.provider !== after.provider) return null;
  const tokens = {};
  for (const key of TOKEN_KEYS) {
    const a = before.tokens[key], b = after.tokens[key];
    if (a == null || b == null) tokens[key] = null;
    else if (b < a) return null; // Counter reset: do not turn it into a negative or fabricated zero.
    else tokens[key] = b - a;
  }
  return tokens;
}
export async function readUsage(file) {
  if (!file || !fs.existsSync(file)) return null;
  const handle = fs.openSync(file, 'r'), size = fs.fstatSync(handle).size;
  const head = Buffer.alloc(Math.min(size, 4096)); fs.readSync(handle, head, 0, head.length, 0);
  const provider = head.toString('utf8').includes('session_meta') ? 'codex' : 'claude';
  fs.closeSync(handle);
  const source = path.resolve(file);
  if (provider === 'codex') {
    // Cumulative counters are near EOF. Never load a multi-GB conversation into memory.
    const fd = fs.openSync(file, 'r'), start = Math.max(0, size - 8 * 1024 * 1024), buf = Buffer.alloc(size - start);
    fs.readSync(fd, buf, 0, buf.length, start); fs.closeSync(fd);
    const lines = buf.toString('utf8').split('\n'); if (start) lines.shift();
    let result = null;
    for (const line of lines) {
      let row; try { row = JSON.parse(line); } catch { continue; }
      const tokens = row.type === 'event_msg' && row.payload?.type === 'token_count' ? codexTokens(row.payload.info?.total_token_usage) : null;
      if (tokens) result = { provider, source, tokens, reportedAt: row.timestamp || null };
    }
    return result;
  }
  const messages = new Map(); let reportedAt = null;
  for await (const line of readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity })) {
    let row; try { row = JSON.parse(line); } catch { continue; }
    if (row.type !== 'assistant' || !row.message?.id) continue;
    const tokens = claudeTokens(row.message.usage); if (!tokens) continue;
    const prev = messages.get(row.message.id);
    // Claude may repeat/extend the same assistant message in the transcript.
    messages.set(row.message.id, Object.fromEntries(TOKEN_KEYS.map(k => [k, tokens[k] == null ? prev?.[k] ?? null : Math.max(tokens[k], prev?.[k] ?? 0)])));
    reportedAt = row.timestamp || reportedAt;
  }
  if (!messages.size) return null;
  const tokens = Object.fromEntries(TOKEN_KEYS.map(k => [k, [...messages.values()].every(t => t[k] == null) ? null : [...messages.values()].reduce((sum, t) => sum + (t[k] ?? 0), 0)]));
  return { provider, source, tokens, reportedAt };
}
export function summarizeUsage(data) {
  if (!data) return null;
  const stages = (data.stages || []).map(s => ({ id: s.id, stage: s.stage, startedAt: s.startedAt, endedAt: s.endedAt || null, durationMs: s.endedAt ? Date.parse(s.endedAt) - Date.parse(s.startedAt) : null, status: s.status, source: s.provider || s.sourceLabel || 'unavailable', counterWindow: s.counterWindow || null, tokens: s.tokens || null, note: s.note || null }));
  const untrackedStages = (data.expectedStages || REVIEW_STAGES).filter(name => !stages.some(s => s.stage === name || s.stage.startsWith(name + '/')));
  for (const stage of untrackedStages) stages.push({ stage, status: 'not-recorded', tokens: null, source: 'unavailable', note: 'Этап ещё не зарегистрирован; затраты неизвестны.' });
  const measured = stages.filter(s => s.status === 'reported' && s.tokens && Number.isSafeInteger(s.tokens.input) && s.tokens.input >= 0 && Number.isSafeInteger(s.tokens.output) && s.tokens.output >= 0 && s.tokens.total === s.tokens.input + s.tokens.output);
  const totals = Object.fromEntries(TOKEN_KEYS.map(k => [k, measured.some(s => s.tokens[k] != null) ? measured.reduce((sum, s) => sum + (s.tokens[k] ?? 0), 0) : null]));
  return { schema: 'design-review-usage/1', stages, totals, complete: stages.length > 0 && measured.length === stages.length, measuredStages: measured.length, totalStages: stages.length, untrackedStages, limitation: 'Сумма зарегистрированных интервалов usage, не стоимость и не размер контекста. Cached входит во входные токены, reasoning — в выходные. Неизмеренные этапы не считаются нулевыми. Границы этапов ограничены последними опубликованными счётчиками; незавершённые запросы и незарегистрированные сессии не включены.' };
}
