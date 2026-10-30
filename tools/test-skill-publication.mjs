import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {publishSkill,sha256} from './publish-skill.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'hds-publication-')),repo=path.join(root,'repo');
function source(name){
 const dir=path.join(root,name);fs.mkdirSync(dir,{recursive:true});
 const write=(f,s)=>{fs.mkdirSync(path.dirname(path.join(dir,f)),{recursive:true});fs.writeFileSync(path.join(dir,f),s)};
 write('SKILL.md','---\nname: '+name+'\nmetadata:\n  version: "1.0.0"\n---\nRun check-updates.mjs\r\n');write('AGENTS.md','Owner rules');write('CHANGELOG.md','## 1.0.0 — today\n');
 write('publication.json',JSON.stringify({name,repository:'melpnz/hds',branch:'main',path:'skills/'+name}));
 write('package.json',JSON.stringify({name,version:'1.0.0',author:'Owner',description:'Example'}));write('package-lock.json',JSON.stringify({version:'1.0.0',packages:{'':{version:'1.0.0'}}}));
 write('scripts/run.mjs','console.log(1);\r\n');write('bench/private.json','private evidence');write('node_modules/private/index.js','private dependency');write('.env','SECRET=dummy');write('skill-log.md','private review');return dir;
}
const a=source('sample-one'),b=source('sample-two');
publishSkill({source:a,name:'sample-one',repositoryRoot:repo});publishSkill({source:b,name:'sample-two',repositoryRoot:repo});
const published=path.join(repo,'skills/sample-one'),manifest=JSON.parse(fs.readFileSync(path.join(published,'release.json')));
assert(!fs.existsSync(path.join(published,'bench')));assert(!fs.existsSync(path.join(published,'node_modules')));assert(!fs.existsSync(path.join(published,'.env')));assert(!fs.existsSync(path.join(published,'skill-log.md')));
assert(fs.readFileSync(path.join(a,'scripts/run.mjs'),'utf8').includes('\r\n')); // Source untouched.
assert.equal(fs.readFileSync(path.join(published,'scripts/run.mjs'),'utf8'),'console.log(1);\n');
assert(manifest.files.every(f=>sha256(fs.readFileSync(path.join(published,f.path)))===f.sha256));
assert.equal(JSON.parse(fs.readFileSync(path.join(repo,'skills/catalog.json'))).skills.length,2);
publishSkill({source:a,name:'sample-one',repositoryRoot:repo}); // Deterministic repeat.
fs.writeFileSync(path.join(a,'scripts/run.mjs'),'console.log(2)');assert.throws(()=>publishSkill({source:a,name:'sample-one',repositoryRoot:repo}),/raise the skill version/);
fs.writeFileSync(path.join(b,'scripts/run.mjs'),'ghp_'+'A'.repeat(30));assert.throws(()=>publishSkill({source:b,name:'sample-two',repositoryRoot:repo}),/credential/);
assert.throws(()=>publishSkill({source:a,name:'../escape',repositoryRoot:repo}),/Invalid skill name/);
console.log('Publication checks passed: independent neighbors, deterministic manifest, source preserved, private data excluded, same-version/credential rejection. '+root);
