// Deterministic public mirror. Never copy a whole agent home or local review bench.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const topFiles=['SKILL.md','AGENTS.md','CHANGELOG.md','publication.json','package.json','package-lock.json'];
const folders=['scripts','templates','profiles','references','tests'];
export const sha256=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export function publicFiles(source){
  const files=[];
  const walk=rel=>{
    const absolute=path.join(source,rel),s=fs.lstatSync(absolute);
    if(s.isSymbolicLink())throw Error('Links are not distributable: '+rel);
    if(s.isDirectory()){for(const name of fs.readdirSync(absolute).sort())walk(rel+'/'+name);return;}
    if(!s.isFile()||! /\.(md|json|mjs|js|html|css|tsv|txt|svg)$/.test(rel))throw Error('Review public allowlist: '+rel);
    if(/(^|\/)(node_modules|bench|\.auth|\.cache|\.env|pass\.txt|skill-log\.md)(\/|$)/.test(rel))throw Error('Private artifact: '+rel);
    const text=fs.readFileSync(absolute,'utf8').replace(/\r\n/g,'\n');
    if(/gh[pousr]_[A-Za-z0-9]{25,}|figd_[A-Za-z0-9_-]{25,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/.test(text))throw Error('Potential credential: '+rel);
    files.push({path:rel,bytes:Buffer.from(text)});
  };
  for(const f of topFiles)walk(f);
  for(const f of folders)if(fs.existsSync(path.join(source,f)))walk(f);
  return files.sort((a,b)=>a.path.localeCompare(b.path,'en'));
}
export function buildCatalog(repositoryRoot){
  const dir=path.join(repositoryRoot,'skills'),skills=[];
  for(const name of fs.readdirSync(dir).sort()){
    const manifest=path.join(dir,name,'release.json');if(!fs.existsSync(manifest))continue;
    const m=JSON.parse(fs.readFileSync(manifest,'utf8'));
    skills.push({name:m.name,version:m.version,description:m.description,author:m.author,path:'skills/'+m.name,entrypoint:'skills/'+m.name+'/SKILL.md',manifest:'skills/'+m.name+'/release.json',changelog:'skills/'+m.name+'/CHANGELOG.md',url:`https://github.com/melpnz/hds/tree/main/skills/${m.name}`});
  }
  const catalog={schema:'hds-skills-catalog/1',repository:'melpnz/hds',branch:'main',skills};
  fs.writeFileSync(path.join(dir,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');return catalog;
}
export function publishSkill({source,name,repositoryRoot=root}){
  source=fs.realpathSync(path.resolve(source));
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name))throw Error('Invalid skill name');
  const destination=path.join(repositoryRoot,'skills',name);
  if(fs.existsSync(destination)&&fs.lstatSync(destination).isSymbolicLink())throw Error('Public copy must not be a link');
  if(source===path.resolve(destination))throw Error('Publish from the author source, not the public mirror');
  const files=publicFiles(source),json=f=>JSON.parse(files.find(x=>x.path===f).bytes.toString());
  const pkg=json('package.json'),lock=json('package-lock.json'),config=json('publication.json');
  const md=files.find(x=>x.path==='SKILL.md').bytes.toString(),version=md.match(/^\s+version:\s*"?(\d+\.\d+\.\d+)"?\s*$/m)?.[1];
  if(pkg.version!==version||lock.version!==version||lock.packages?.['']?.version!==version)throw Error('Version fields disagree');
  if(config.name!==name||config.repository!=='melpnz/hds'||config.branch!=='main'||config.path!=='skills/'+name)throw Error('Publication source disagrees');
  if(!md.includes('check-updates.mjs'))throw Error('Document the daily update check');
  const manifest={schema:'hds-skill-release/1',name,version,description:pkg.description,author:pkg.author,files:files.map(f=>({path:f.path,sha256:sha256(f.bytes),bytes:f.bytes.length}))};
  const oldFile=path.join(destination,'release.json');
  const old=fs.existsSync(oldFile)?JSON.parse(fs.readFileSync(oldFile,'utf8')):null;
  if(old?.version===version&&JSON.stringify(old)!==JSON.stringify(manifest))throw Error('Published version changed: raise the skill version first');
  fs.mkdirSync(destination,{recursive:true});
  for(const f of files){const p=path.join(destination,f.path);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,f.bytes);}
  // Remove only files explicitly managed by the previous release, never unknown local files.
  for(const f of old?.files||[]){
    if(!f.path||f.path.includes('..')||path.isAbsolute(f.path))throw Error('Invalid previous manifest path');
    if(!files.some(x=>x.path===f.path)){const p=path.join(destination,f.path);if(fs.existsSync(p))fs.unlinkSync(p);}
  }
  fs.writeFileSync(oldFile,JSON.stringify(manifest,null,2)+'\n');buildCatalog(repositoryRoot);
  return {name,version,files:files.length,destination};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  const args=process.argv.slice(2),source=args[args.indexOf('--source')+1],name=args[args.indexOf('--name')+1];
  if(!args.includes('--source')||!args.includes('--name'))throw Error('Usage: node tools/publish-skill.mjs --name <slug> --source <author-directory>');
  console.log(JSON.stringify(publishSkill({source,name}),null,2));
}
