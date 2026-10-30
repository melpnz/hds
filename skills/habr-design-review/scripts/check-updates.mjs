// Read-only update check. No npm dependencies, installs or review data access.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';

export const skillDir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const semver=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
export function compareVersions(a,b){
  if(!semver.test(a)||!semver.test(b))throw Error('Unsupported release version');
  const A=a.split('.').map(Number),B=b.split('.').map(Number);
  for(let i=0;i<3;i++)if(A[i]!==B[i])return A[i]>B[i]?1:-1;
  return 0;
}
export function changesBetween(text,from,to){
  const sections=[...text.matchAll(/^##\s+v?(\d+\.\d+\.\d+)\b([^\n]*)\n([\s\S]*?)(?=^##\s|$(?![\s\S]))/gm)];
  return {complete:sections.some(m=>m[1]===from),entries:sections.filter(m=>compareVersions(m[1],from)>0&&compareVersions(m[1],to)<=0).map(m=>({version:m[1],heading:m[1]+m[2].trimEnd(),body:m[3].trim()}))};
}
export function stateHome(){
  if(process.env.HDS_SKILL_STATE_HOME)return path.resolve(process.env.HDS_SKILL_STATE_HOME);
  if(process.platform==='win32'&&fs.existsSync('D:/.agent'))return 'D:/.agent/apps/skill-updates';
  return path.join(process.env.XDG_STATE_HOME||path.join(os.homedir(),'.local','state'),'hds','skill-updates');
}
const day=now=>[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');
export async function checkUpdates({dir=skillDir,stateDir=stateHome(),force=false,now=new Date(),fetcher=fetch,timeoutMs=6000}={}){
  const version=JSON.parse(fs.readFileSync(path.join(dir,'package.json'),'utf8')).version;
  const source=JSON.parse(fs.readFileSync(path.join(dir,'publication.json'),'utf8'));
  if(!/^[\w.-]+\/[\w.-]+$/.test(source.repository)||!/^skills\/[a-z0-9-]+$/.test(source.path)||source.manifest!=='release.json'||source.changelog!=='CHANGELOG.md')throw Error('Invalid publication config');
  compareVersions(version,version);
  const date=day(now),key=crypto.createHash('sha256').update(fs.realpathSync(dir)).digest('hex').slice(0,16);
  const file=path.join(stateDir,source.name+'-'+key+'.json');
  const save=result=>{try{fs.mkdirSync(stateDir,{recursive:true});const tmp=file+'.'+process.pid+'.tmp';fs.writeFileSync(tmp,JSON.stringify({date,version,result},null,2));fs.renameSync(tmp,file)}catch{/* Read-only home must not block a review. */}};
  if(!force){try{const cached=JSON.parse(fs.readFileSync(file,'utf8'));if(cached.date===date&&cached.version===version)return {...cached.result,cached:true,shouldNotify:false}}catch{}}
  const base={skill:source.name,installed:version,checkedOn:date,cached:false,shouldNotify:false};
  save({...base,status:'checking'}); // A failed check also counts as today's attempt.
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);
  const get=async url=>{const r=await fetcher(url,{signal:controller.signal,redirect:'error',headers:{Accept:'application/vnd.github+json','User-Agent':'hds-skill-update-check'}});if(!r.ok)throw Error('HTTP '+r.status);return r.text();};
  let result;
  try{
    const commit=JSON.parse(await get(`https://api.github.com/repos/${source.repository}/commits/${encodeURIComponent(source.branch)}`)).sha;
    if(!/^[a-f0-9]{40}$/.test(commit))throw Error('Invalid commit');
    const raw=`https://raw.githubusercontent.com/${source.repository}/${commit}/${source.path}`;
    const release=JSON.parse(await get(raw+'/'+source.manifest));
    if(release.schema!=='hds-skill-release/1'||release.name!==source.name)throw Error('Invalid release');
    const newer=compareVersions(release.version,version)>0;
    result={...base,status:newer?'update-available':'current',latest:release.version,commit,releaseUrl:`https://github.com/${source.repository}/tree/${commit}/${source.path}`,changelogUrl:`https://github.com/${source.repository}/blob/${commit}/${source.path}/${source.changelog}`,shouldNotify:newer};
    if(newer){
      try{
        const text=await get(raw+'/'+source.changelog),expected=release.files.find(f=>f.path===source.changelog)?.sha256;
        if(!expected||crypto.createHash('sha256').update(text).digest('hex')!==expected)throw Error('Changelog checksum mismatch');
        result.changes=changesBetween(text,version,release.version);
      }catch{result.changes=null;result.note='Changelog unavailable: do not invent changes. Offer the pinned release link.';}
    }
  }catch{result={...base,status:'unavailable',continueReview:true};}
  finally{clearTimeout(timer);}
  save(result);return result;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{console.log(JSON.stringify(await checkUpdates({force:process.argv.includes('--force')}),null,2));}
  catch{console.log(JSON.stringify({status:'unavailable',continueReview:true,shouldNotify:false}));}
}
