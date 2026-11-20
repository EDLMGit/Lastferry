import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL, fileURLToPath } from 'node:url';
const args=process.argv.slice(2);
const option=(name,fallback)=>{const i=args.indexOf(name);return i<0?fallback:args[i+1]};
const root=path.resolve(option('--repo',process.cwd()));
const output=option('--out',null);
if(!output)throw new Error('Pass --out <scratch-directory>; --repo defaults to the working directory.');
const manifest=JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),'SOURCE_MANIFEST.json'),'utf8'));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'ferry-lantern-targets-'));
try{
 for(const f of manifest.files){
  const bytes=fs.readFileSync(path.join(root,f.path));
  const h=crypto.createHash('sha1').update('blob '+bytes.length).update(Buffer.from([0])).update(bytes).digest('hex');
  if(h!==f.gitBlobSha)throw new Error('source mismatch '+f.path);
  const to=path.join(temp,f.path);fs.mkdirSync(path.dirname(to),{recursive:true});
  fs.writeFileSync(to,f.path==='src/game/rules.ts'?bytes.toString('utf8').replaceAll("'../levels/level'","'../levels/level.ts'"):bytes);
 }
 const {initial,legalActions,reduce}=await import(pathToFileURL(path.join(temp,'src/game/rules.ts')));
 const levels=await import(pathToFileURL(path.join(temp,'src/levels/level.ts')));
 const coves=[levels.level,levels.holdingPier,levels.bellwater,levels.driftwoodYard,levels.twoShelters,levels.wideBerth,levels.reefReturn,levels.orchardLanding];
 const targets={'first-crossing':8,'holding-pier':9,bellwater:10,'driftwood-yard':12,'two-shelters':12,'wide-berth':14,'reef-return':11,'orchard-landing':13};
 const results=[];
 for(const l of coves){
  const cap=l.rules.tide.rises.at(-1)?.afterTurn??0;
  const key=s=>JSON.stringify([Math.min(s.turn,cap),s.boatNodeId,s.status,[...s.aboard].sort(),[...s.delivered].sort(),l.piers.map(p=>[...s.waitingByPier[p.id]].sort())]);
  const states=[initial(l)],seen=new Set([key(states[0])]);let min=null,won=0,transitions=0;
  for(let i=0;i<states.length;i++){
   const s=states[i];if(s.status==='won'){won++;min??=s.turn;continue;}if(s.status!=='playing')continue;
   for(const a of legalActions(s,l)){transitions++;const n=reduce(s,a,l),k=key(n);if(!seen.has(k)){seen.add(k);states.push(n)}}
  }
  const witnesses=[];
  for(const file of l.validation.witnessReplays){
   const data=JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
   for(const w of data.witnesses??[data]){
    let s=initial(l);for(const a of w.actions){const n=reduce(s,a,l);if(n===s)throw new Error(l.id+' rejected '+JSON.stringify(a));s=n;}
    if(s.status!=='won')throw new Error(l.id+' witness did not win');
    witnesses.push({id:w.id??'canonical',source:file,actions:s.turn,status:s.status,qualifies:s.turn<=targets[l.id],description:w.description??w.purpose??null});
   }
  }
  results.push({id:l.id,minimum:min,target:targets[l.id],states:states.length,transitions,witnesses});
 }
 const out={reviewedCommit:manifest.reviewedCommit,nodeVersion:process.version,method:"Exhaustive production legalActions/reduce BFS with post-final-tide equivalent-turn normalization; exact source blobs; temporary import-specifier adaptation only.",results};
 fs.mkdirSync(output,{recursive:true});
 fs.writeFileSync(path.join(output,'TARGET_AUDIT.json'),JSON.stringify(out,null,2)+'\n');
 console.log(JSON.stringify(out.results.map(({id,minimum,target,witnesses})=>({id,minimum,target,witnesses:witnesses.map(({id,actions,qualifies})=>({id,actions,qualifies}))})),null,2));
}finally{fs.rmSync(temp,{recursive:true,force:true});}

