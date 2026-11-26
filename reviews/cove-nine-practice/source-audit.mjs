import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
const runtime='1e3146652f50c88db1ce7d56c6de14e311aab719',guidance='9e2fc31cab1a6a925a13629cee308884b645677f';
const git=(...args)=>execFileSync('git',args,{maxBuffer:12e6});
const sha=b=>createHash('sha256').update(b).digest('hex');
const paths=['index.html','vite.config.ts','package-lock.json','package.json','data','src','assets','cove-ui-package/ui','cove-panel-package/material','cove-portrait-package/portraits'];
const previous=new Map(git('ls-tree','-r',runtime,'--',...paths).toString().trimEnd().split('\n').map(x=>[x.split('\t')[1],x.split(' ')[2].split('\t')[0]]));
const index=git('ls-files','-s','--',...paths).toString().trimEnd().split('\n').map(x=>({path:x.split('\t')[1],blob:x.split(' ')[1]}));
const capture=process.argv[2]?JSON.parse(readFileSync(process.argv[2],'utf8')).inputs:undefined;
const compare={},changes=[];
for(const {path,blob} of index){
 const work=readFileSync(path),bin=git('cat-file','blob',blob);
 const working=sha(work),committed=sha(bin);
 const match=committed===working?'exact':(!bin.includes(0)&&sha(Buffer.from(work.toString().replaceAll('\r\n','\n')))===committed?'CRLF in working copy':'unresolved');
 if(capture?.[path]&&capture[path]!==working)throw Error('Capture differs from working bytes: '+path);
 compare[path]={blob,working,committed,match,...(capture?.[path]?{capture: capture[path]}:{})};
 if(previous.get(path)!==blob)changes.push(path);
 previous.delete(path);
}
if(previous.size)throw Error('Removed input: '+[...previous.keys()]);
if(capture&&Object.keys(capture).some(k=>!compare[k]))throw Error('Capture has unaccounted inputs');
const protectedChanges=changes.filter(p=>/^data\//.test(p)&&!p.includes('drowned-orchard')||/^src\/(audio|game|ui)\//.test(p)||/^assets\/portraits\//.test(p)||/^src\/campaign\//.test(p)&&!p.endsWith('/registry.ts')||/src\/scene\/(animals|models)\.ts/.test(p));
if(protectedChanges.length)throw Error('Changed protected inputs: '+protectedChanges);
const counts=Object.values(compare).reduce((n,v)=>(n[v.match]=(n[v.match]||0)+1,n),{});
const bundles=Object.fromEntries(readdirSync('dist/assets').filter(f=>/\.(js|css)$/.test(f)).map(f=>[f,sha(readFileSync('dist/assets/'+f))]));
console.log(JSON.stringify({runtime,guidance,node:process.version,changes,counts,bundles,captureManifest:process.argv[2]??null,matchedCaptureInputs:Object.values(compare).filter(x=>x.capture).length,index:compare},null,2));
if(counts.unresolved)process.exitCode=1;
