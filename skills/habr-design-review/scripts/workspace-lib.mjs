import fs from 'node:fs';
import path from 'node:path';

const FILE = 'review-workspace.json';
export function workspaceRoot(run) {
  let dir = path.resolve(run);
  if (fs.existsSync(dir)) dir = fs.realpathSync(dir);
  while (true) {
    if (fs.existsSync(path.join(dir, FILE))) return dir;
    const parent = path.dirname(dir); if (parent === dir) return null; dir = parent;
  }
}
const read = root => JSON.parse(fs.readFileSync(path.join(root, FILE), 'utf8'));
const save = (root, data) => { const file = path.join(root, FILE); fs.writeFileSync(file + '.tmp', JSON.stringify(data, null, 2)); fs.renameSync(file + '.tmp', file); };
export function ensureWorkspace(root) {
  root = path.resolve(root);
  if (!fs.existsSync(path.join(root, FILE))) save(root, { schema: 'design-review-workspace/1', current: '.', revisions: [{ id: 'initial', path: '.', type: 'review', status: 'ready' }] });
  return read(root);
}
export function registerRecheck(root, run, status = 'planned') {
  const data = ensureWorkspace(root), rel = path.relative(root, path.resolve(run)).replaceAll(path.sep, '/');
  if (!rel || rel === '..' || rel.startsWith('../') || path.isAbsolute(rel)) throw new Error('Перепроверка должна находиться внутри папки задачи');
  let revision = data.revisions.find(r => r.path === rel);
  if (!revision) { revision = { id: 'recheck-' + path.basename(run), path: rel, type: 'recheck' }; data.revisions.push(revision); }
  revision.status = status;
  if (status === 'ready') data.current = rel;
  save(root, data);
  return revision;
}
export function allocateRecheck(origin, explicit) {
  const root = workspaceRoot(origin) || path.resolve(origin);
  if (explicit) {
    const run=path.resolve(explicit);
    if(run===path.resolve(origin)||run===root)throw new Error('Перепроверка не должна перезаписывать исходное ревью');
    if(run.startsWith(root+path.sep))registerRecheck(root,run);
    return { root, run }; // Explicit legacy destinations remain supported; instructions use nested paths.
  }
  ensureWorkspace(root);
  const parent = path.join(root, 'rechecks'); fs.mkdirSync(parent, { recursive: true });
  let number = 1; while (fs.existsSync(path.join(parent, String(number).padStart(2, '0')))) number++;
  const run = path.join(parent, String(number).padStart(2, '0')); fs.mkdirSync(run);
  registerRecheck(root, run);
  return { root, run };
}
export function resolveReviewRun(root) {
  root = path.resolve(root);
  if (fs.existsSync(root)) root = fs.realpathSync(root);
  if (!fs.existsSync(path.join(root, FILE))) return root;
  const current = read(root).current || '.', target = path.resolve(root, current);
  if (target !== root && !target.startsWith(root + path.sep)) throw new Error('Некорректный путь текущей перепроверки');
  return fs.existsSync(path.join(target, 'report.html')) ? target : root;
}
export function completeRevision(run) {
  const root = workspaceRoot(run); if (!root || path.resolve(run) === root) return root;
  const rel = path.relative(root, path.resolve(run)).replaceAll(path.sep, '/');
  if (!read(root).revisions.some(r => r.path === rel)) return null; // Preview/test folders are not review revisions.
  registerRecheck(root, run, 'ready'); return root;
}
