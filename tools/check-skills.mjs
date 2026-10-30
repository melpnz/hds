import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {sha256} from './publish-skill.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'skills/catalog.json'),'utf8'));
if(catalog.schema!=='hds-skills-catalog/1')throw Error('Unknown catalog');
const names=new Set();
for(const skill of catalog.skills){
 if(names.has(skill.name)||!/^skills\/[a-z0-9-]+$/.test(skill.path)||skill.path!=='skills/'+skill.name)throw Error('Invalid/duplicate catalog entry');names.add(skill.name);
 const dir=path.join(root,skill.path),m=JSON.parse(fs.readFileSync(path.join(dir,'release.json'),'utf8'));
 if(m.name!==skill.name||m.version!==skill.version||m.schema!=='hds-skill-release/1')throw Error('Invalid release');
 const expected=new Set(['release.json']);
 for(const f of m.files){
  if(!f.path||f.path.includes('..')||f.path.includes('\\')||path.isAbsolute(f.path)||expected.has(f.path))throw Error('Invalid/duplicate file');expected.add(f.path);
  const p=path.join(dir,f.path);if(fs.lstatSync(p).isSymbolicLink())throw Error('Symlink in package');const bytes=fs.readFileSync(p);
  if(sha256(bytes)!==f.sha256||bytes.length!==f.bytes)throw Error('Checksum mismatch: '+p);
 }
 const walk=folder=>{for(const d of fs.readdirSync(folder,{withFileTypes:true})){if(d.name==='node_modules')continue;const p=path.join(folder,d.name);if(d.isSymbolicLink())throw Error('Link in public tree');if(d.isDirectory())walk(p);else if(!expected.has(path.relative(dir,p).replaceAll(path.sep,'/')))throw Error('Unmanaged public file: '+p)}};walk(dir);
 const p=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8')),l=JSON.parse(fs.readFileSync(path.join(dir,'package-lock.json'),'utf8')),md=fs.readFileSync(path.join(dir,'SKILL.md'),'utf8');
 if(p.version!==m.version||l.version!==m.version||l.packages[''].version!==m.version||!md.includes('version: "'+m.version+'"'))throw Error('Version mismatch');
 if(!fs.readFileSync(path.join(dir,'CHANGELOG.md'),'utf8').includes('## '+m.version+' —'))throw Error('Missing release notes');
 console.log(`${skill.name} ${skill.version}: ${m.files.length} verified files`);
}
for(const dir of fs.readdirSync(path.join(root,'skills'),{withFileTypes:true}).filter(d=>d.isDirectory()))if(!names.has(dir.name))throw Error('Skill missing from catalog: '+dir.name);
