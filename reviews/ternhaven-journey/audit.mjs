import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
const base='26ca0a4f7b42c3f9e809f4a6558b0df8dc0c9139';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trimEnd();
const sha=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const scopes=['data','src/scene','src/levels','src/game','src/ui','src/audio','assets/portraits','assets/ui','package-lock.json','reviews/animal-presentation/deployment-confirmation.json'];
const protectedFiles=Object.fromEntries(git('ls-tree','-r',base,'--',...scopes).split('\n').map(row=>{
 const [info,path]=row.split('\t'), expected=info.split(' ')[2];
 if(git('hash-object','--path',path,path)!==expected)throw Error(path);
 return [path,expected];
}));
const catalog=src=>JSON.parse(src).entries.map(e=>e.id);
if(JSON.stringify(catalog(readFileSync('assets/catalog.json','utf8')))!==JSON.stringify(catalog(git('show',base+':assets/catalog.json'))))throw Error('Changed catalog IDs');
const bundles=Object.fromEntries(readdirSync('dist/assets').filter(f=>/\.(js|css)$/.test(f)).map(f=>[f,sha('dist/assets/'+f)]));
console.log(JSON.stringify({base,guidance:'42e0b3a46e2f347a0e00a8dbb4240a36fa0197e0',node:process.version,protectedFileCount:Object.keys(protectedFiles).length,protectedFiles,bundles,assetFamilies:catalog(readFileSync('assets/catalog.json','utf8')).length},null,2));
