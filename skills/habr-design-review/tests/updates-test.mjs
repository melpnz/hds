import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {checkUpdates,compareVersions,changesBetween} from '../scripts/check-updates.mjs';
const parent=process.env.DR_TEST_ROOT||(fs.existsSync('D:/.agent/backups')?'D:/.agent/backups':os.tmpdir());
const root=fs.mkdtempSync(path.join(parent,'dr-updates-')),dir=path.join(root,'skill'),stateDir=path.join(root,'state');
fs.mkdirSync(dir);fs.writeFileSync(path.join(dir,'publication.json'),JSON.stringify({name:'sample',repository:'melpnz/hds',branch:'main',path:'skills/sample',manifest:'release.json',changelog:'CHANGELOG.md'}));
const local=v=>fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({version:v}));local('1.2.0');
const sha='a'.repeat(40),changelog='# Changes\n\n## 1.4.0 — today\n\n- Fourth.\n\n## 1.3.0 — yesterday\n\n- Third.\n\n## 1.2.0 — before\n\n- Old.\n';
let calls=0;
const fetcher=async url=>{calls++;if(url.includes('/commits/'))return new Response(JSON.stringify({sha}));assert(url.includes('/'+sha+'/skills/sample/'));return new Response(url.endsWith('release.json')?JSON.stringify({schema:'hds-skill-release/1',name:'sample',version:'1.4.0',files:[{path:'CHANGELOG.md',sha256:crypto.createHash('sha256').update(changelog).digest('hex')}]}):changelog);};
const now=new Date(2026,9,30,12),options={dir,stateDir,now,fetcher};
let r=await checkUpdates(options);assert.equal(r.status,'update-available');assert.equal(r.shouldNotify,true);assert.deepEqual(r.changes.entries.map(x=>x.version),['1.4.0','1.3.0']);assert(r.changes.complete);assert(!r.changes.entries[0].body.includes('Third'));
assert.equal(calls,3);r=await checkUpdates(options);assert.equal(calls,3);assert.equal(r.cached,true);assert.equal(r.shouldNotify,false);
r=await checkUpdates({...options,now:new Date(2026,9,31,0,1)});assert.equal(calls,6);assert(r.shouldNotify);
local('1.4.0');r=await checkUpdates(options);assert.equal(r.status,'current');assert.equal(calls,8);
local('1.5.0');assert.equal((await checkUpdates(options)).status,'current'); // No downgrade.
local('1.1.0');r=await checkUpdates({...options,fetcher:async()=>new Response('',{status:503})});assert.equal(r.status,'unavailable');assert(r.continueReview);
assert.equal((await checkUpdates(options)).cached,true); // Failed attempt is cached too.
r=await checkUpdates({...options,force:true,fetcher:async(_url,{signal})=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Error('timeout')))),timeoutMs:20});assert.equal(r.status,'unavailable');
r=await checkUpdates({...options,force:true,fetcher:async url=>url.endsWith('CHANGELOG.md')?new Response('bad contents'):fetcher(url)});assert.equal(r.status,'update-available');assert.equal(r.changes,null);
assert.equal(changesBetween(changelog,'1.0.0','1.4.0').complete,false);
assert.equal(compareVersions('1.10.0','1.9.9'),1);assert.throws(()=>compareVersions('latest','1.0.0'));
assert.deepEqual(fs.readdirSync(dir).sort(),['package.json','publication.json']);
console.log('Update checks passed: daily/offline cache, next day, installed version, all intervening changelog entries, timeout, integrity and no skill writes. '+root);
