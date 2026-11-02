import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import http from 'node:http';
import os from 'node:os';
import { PNG } from 'pngjs';
import { chromium } from 'playwright';
import { readUsage, difference, summarizeUsage, codexTokens } from '../scripts/usage-lib.mjs';
import { gapMeasurement } from '../scripts/measurements.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(process.env.DR_TEST_ROOT || (fs.existsSync('D:/.agent/backups')?'D:/.agent/backups':os.tmpdir()), 'dr-improvements-'));
const script = (name, ...args) => execFileSync(process.execPath, [path.join(root, 'scripts', name), ...args], { encoding: 'utf8' });
const write = (p, obj) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(obj)); };
const codexRow = (input, output, cached = 0) => ({ type: 'event_msg', timestamp: new Date().toISOString(), payload: { type: 'token_count', info: { total_token_usage: { input_tokens: input, output_tokens: output, cached_input_tokens: cached, reasoning_output_tokens: 3 } } } });
const log = path.join(tmp, 'session.jsonl');
fs.writeFileSync(log, JSON.stringify({ type: 'session_meta' }) + '\n' + JSON.stringify(codexRow(100, 10, 80)) + '\n');
const before = await readUsage(log);
fs.appendFileSync(log, JSON.stringify(codexRow(150, 20, 100)) + '\n{unfinished');
const after = await readUsage(log);
assert.deepEqual(difference(before, after), { input: 50, output: 10, cachedInput: 20, cacheWriteInput: null, reasoningOutput: 0, total: 60 });
assert.equal(difference(after, before), null);
assert.equal(codexTokens({ input_tokens: 2 }), null);
assert.equal(summarizeUsage({ stages: [{ id: 'missing', stage: 'capture', status: 'unavailable' }] }).totals.total, null);
const cl = path.join(tmp, 'claude.jsonl');
fs.writeFileSync(cl, [2, 5, 5].map(out => JSON.stringify({ type: 'assistant', message: { id: 'same-message', usage: { input_tokens: 10, cache_read_input_tokens: 20, cache_creation_input_tokens: 30, output_tokens: out } } })).join('\n'));
assert.equal((await readUsage(cl)).tokens.total, 65); // One message, not three; cache counted once.
console.log('✓ usage: cumulative deltas, partial JSONL, cache, duplicate messages, resets, unknown counters');

const run = path.join(tmp, 'run'); fs.mkdirSync(run);
fs.writeFileSync(log, JSON.stringify({ type: 'session_meta' }) + '\n' + JSON.stringify(codexRow(100, 10, 80)) + '\n');
script('stage-usage.mjs', run, 'start', 'compare', '--log', log);
assert.throws(() => script('stage-usage.mjs', run, 'start', 'overlap', '--log', log));
fs.appendFileSync(log, JSON.stringify(codexRow(150, 20, 100)) + '\n');
script('stage-usage.mjs', run, 'end', 'compare');
script('stage-usage.mjs', run, 'start', 'unknown', '--log', path.join(tmp, 'missing.jsonl'));
script('stage-usage.mjs', run, 'end', 'unknown');
assert.equal(summarizeUsage(JSON.parse(fs.readFileSync(path.join(run, 'token-usage.json')))).totals.total, 60);
console.log('✓ stage ledger: overlaps rejected, unavailable is null, measured total remains partial');

const gap = { axis: 'y', label: 'header → message', a: { from: [0, 0, 320, 64], to: [84, 144, 200, 22] }, b: { from: [0, 0, 320, 64], to: [84, 88, 200, 22] } };
const measured = gapMeasurement(gap);
assert.equal(measured.a.value, 80); assert.equal(measured.b.value, 24);
assert.equal(measured.a.box[1], 0); assert.equal(measured.a.box[3], 166);
assert.throws(() => gapMeasurement({ ...gap, b: { from: [0, 0, 320, 64], to: [0, 40, 100, 10] } }));
console.log('✓ gap measurement: both anchors, 80/24 px, overlap rejected');

write(path.join(run, 'figma/figma-320.json'), { frame: { w: 320, h: 200 }, elements: [] });
write(path.join(run, 'figma/figma-320-switch.json'), { frame: { w: 320, h: 200 }, elements: [] });
write(path.join(run, 'page/page-320.json'), { width: 320, state: 'default', elements: [] });
write(path.join(run, 'page/page-320-error.json'), { width: 320, state: 'error', elements: [] });
write(path.join(run, 'figma/frames.json'), { frames: [{ json: 'figma-320-switch.json' }] }); // Last-batch-only export manifest must not hide an existing exact pair.
script('review-plan.mjs', run);
const errorPlan = JSON.parse(fs.readFileSync(path.join(run, 'state-plan.json'))).states.find(s => s.id === '320-error');
assert.equal(errorPlan.reviewMode, 'visual-hypothesis'); assert.equal(errorPlan.visualReview.status, 'pending');
script('match-figma.mjs', run);
let reportData = JSON.parse(fs.readFileSync(path.join(run, 'findings.json')));
assert.deepEqual(reportData.meta.unresolvedStates.map(s => s.id), ['320-switch']);
assert(!reportData.meta.widths.some(w => w.id === '320-switch'));
write(path.join(run, 'page/page-320-switch.json'), { width: 320, state: 'switch', stepErrors: ['failed'], elements: [] });
script('match-figma.mjs', run, '--out', 'failed-state.json');
assert.equal(JSON.parse(fs.readFileSync(path.join(run, 'failed-state.json'))).meta.unresolvedStates.length, 1);
console.log('✓ all states inventoried; missing/failed switch asks for clarification instead of comparing default');

const png = new PNG({ width: 320, height: 200 }); png.data.fill(255);
fs.writeFileSync(path.join(run, 'figma/figma-320.png'), PNG.sync.write(png));
fs.writeFileSync(path.join(run, 'page/page-320.png'), PNG.sync.write(png));
fs.writeFileSync(path.join(run, 'page/page-320-error.png'), PNG.sync.write(png));
reportData.meta.widths.push({ id: '320-error', w: 320, state: 'error', bImg: 'page/page-320-error.png' });
reportData.meta.title = 'Regression'; reportData.meta.testUrl = 'https://example.test';
reportData.findings = [{ id: 'GAP', kind: 'bug', severity: 'minor', category: 'spacing', title: 'Gap', widths: [320], css: [], evidence: [{ shot: '320', measurement: gap }] }];
reportData.findings.push({ id: 'HYP', kind: 'improvement', severity: 'discuss', category: 'responsive', title: 'Visual hypothesis', basis: 'visual-heuristic', referenceStatus: 'missing', foundBy: 'designer', widths: [320], evidence: [{ shot: '320-error', b: [24, 60, 272, 100] }] });
write(path.join(run, 'findings.json'), reportData);
script('build-report.mjs', run);
const browser = await chromium.launch();
try {
  const page = await browser.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(pathToFileURL(path.join(run, 'report.html')).href); await page.waitForTimeout(300);
  const payload = await page.evaluate(() => feedbackPayload());
  assert.equal(payload.findings.find(f => f.id === 'HYP').referenceStatus, 'missing');
  assert.equal(payload.metrics.missed, 0); // A visual hypothesis is not a confirmed designer-found bug.
  await page.click('[data-tab="improve"]');
  assert.equal(await page.locator('[data-card="HYP"] [data-reference-status="missing"]').count(), 1);
  assert.equal(await page.locator('[data-modeseg="HYP"]').count(), 0);
  assert.equal(payload.tokenUsage.totals.total, 60); assert.equal(payload.tokenUsage.complete, false);
  assert.equal(payload.run.skillRelease, JSON.parse(fs.readFileSync(path.join(root, 'package.json'))).version);
  assert.equal(await page.locator('[data-token-usage]').count(), 1);
  assert.equal(await page.locator('details[data-token-usage]').evaluate(el => el.open), true);
  assert.equal(await page.locator('[data-token-usage] table').isVisible(), false);
  await page.click('[data-tab="extra"]');
  assert.equal(await page.locator('[data-token-usage] table').isVisible(), true);
  await page.click('[data-token-usage] > summary');
  assert.equal(await page.locator('[data-token-usage] table').isVisible(), false);
  await page.evaluate(() => summary());
  assert.equal(await page.locator('details[data-token-usage]').evaluate(el => el.open), false);
  await page.reload(); await page.waitForTimeout(150);
  assert.equal(await page.locator('details[data-token-usage]').evaluate(el => el.open), true);
  assert.equal(await page.evaluate(() => DATA.findings[0].evidence[0].aMarks.find(x => x.kind === 'padding').box[3]), 80);
  const accepted = await page.evaluate(async () => {
    const before = metrics();
    decisions.HYP = {v:'take',note:'Mobile: button below text; tablet and desktop: right.'};
    reportView();
    const exported = await mdReport();
    const shots = await evidenceShots(DATA.findings.find(f=>f.id==='HYP'),0);
    const result = {ids:reportList().map(f=>f.id),html:document.querySelector('[data-rcard="HYP"]').innerHTML,md:exported.md,files:exported.files.map(f=>f.name),oneSide:shots.fig===null,unchanged:JSON.stringify(before)===JSON.stringify(metrics())};
    decisions.HYP.v='skip'; result.skipped=!reportList().some(f=>f.id==='HYP');
    delete decisions.HYP; result.pending=!reportList().some(f=>f.id==='HYP');
    return result;
  });
  assert(accepted.ids.includes('HYP')); assert(accepted.html.includes('Mobile: button below text'));
  assert(accepted.md.includes('Mobile: button below text')); assert(accepted.oneSide); assert(accepted.unchanged);
  assert(accepted.skipped && accepted.pending);
  assert.deepEqual(errors, []);
  write(path.join(run, 'feedback-test.json'), payload);
} finally { await browser.close(); }
script('feedback.mjs', path.join(run, 'feedback-test.json'), '--run', run, '--name', 'costs', '--bench', path.join(tmp, 'bench'));
assert.equal(JSON.parse(fs.readFileSync(path.join(tmp, 'bench/costs/labels.json'))).tokenUsage.totals.total, 60);
assert(fs.existsSync(path.join(tmp, 'bench/costs/state-plan.json')));
assert.equal(JSON.parse(fs.readFileSync(path.join(tmp, 'bench/costs/labels.json'))).visualHypotheses[0].foundBy, 'designer');
assert.equal(JSON.parse(fs.readFileSync(path.join(tmp, 'bench/costs/labels.json'))).missed.length, 0);
console.log('✓ HTML and feedback export stages; training ingestion preserves measured usage');

// Capture the actual browser element, not a fixture mirroring the serialization code.
const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<img style="width:48px;height:48px;object-fit:cover;object-position:20% 30%" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%2280%22/%3E">'); });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const capture = path.join(tmp, 'capture');
try {
  await promisify(execFile)(process.execPath, [path.join(root, 'scripts/capture.mjs'), '--url', `http://127.0.0.1:${server.address().port}`, '--out', capture, '--widths', '320', '--height', '200', '--no-tokens', '--no-profile', '--max-height', '200'], { timeout: 45000 });
  const file = fs.readdirSync(capture).find(f => /^page-320.*\.json$/.test(f));
  const img = JSON.parse(fs.readFileSync(path.join(capture, file))).elements.find(e => e.tag === 'img');
  assert.equal(img.box.width, 48); assert.equal(img.image.naturalWidth, 100); assert.equal(img.image.naturalHeight, 80);
  assert.equal(img.image.objectFit, 'cover'); assert.equal(img.image.objectPosition, '20% 30%');
  const imageRun = path.join(tmp, 'image-run'); fs.mkdirSync(path.join(imageRun, 'page'), { recursive: true });
  fs.copyFileSync(path.join(capture, file), path.join(imageRun, 'page', file));
  script('image-audit.mjs', imageRun);
  assert.throws(() => script('image-audit.mjs', imageRun, 'verify'));
  const audit = JSON.parse(fs.readFileSync(path.join(imageRun, 'image-audit.json')));
  assert.equal(audit.images[0].status, 'pending');
  audit.images[0].status = 'checked'; audit.images[0].reference = 'Figma layer'; audit.images[0].evidence = ['figma.png', 'site.png'];
  write(path.join(imageRun, 'image-audit.json'), audit); script('image-audit.mjs', imageRun, 'verify');
  console.log('✓ live local capture: natural size vs display size, object-fit/position, explicit visual audit');
} finally { await new Promise(resolve => server.close(resolve)); }
console.log('All improvement checks passed. Isolated artifacts: ' + tmp);
