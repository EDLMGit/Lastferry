import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';

const root='reviews/animal-presentation';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=path=>JSON.parse(readFileSync(join(root,path),'utf8'));
const filenames=(path)=>readdirSync(join(root,path),{recursive:true,encoding:'utf8'}).map(name=>name.replaceAll('\\','/')).sort();
const method='Actual UI, native Chromium viewport screenshot, touch emulation at device scale factor 1. Matched Holding runs use the same legitimate start-of-cove Journey checkpoint, all nine actions through controls, Reduced Motion and the same default camera/lighting; the static captures do not freeze lighthouse phase.';
const evidence={method,reviewedRuntime:'a2740e61ec5a782f558ea6caad4181466d04e9f7',guidance:'d7884445c35fc24ebdabc2790b168b68294bf0bd',captures:[],builds:{},crowdedFrame:{},commands:{
  beforeServer:'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5314 --strictPort --outDir .cache/animal-before-a2740e6',
  afterServer:'node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 5315 --strictPort',
  browser:'ANIMAL_URL and ANIMAL_PHASE select the server and evidence group; node node_modules/@playwright/test/cli.js test -c reviews/animal-presentation/playwright.config.ts',
  record:'ANIMAL_URL points to development server; ANIMAL_PHASE=record; same command --grep "uninterrupted|interrupted direct"',
  encode:'node reviews/arrival-bubble/encode-recording.mjs reviews/animal-presentation/record/390x844'
}};
for(const phase of ['before','after']){
  const run=json(phase+'/runs/holding.json');
  evidence.builds[phase]=run.build;
  for(const name of phase==='after'?['wide-five','driftwood','ternhaven']:['wide-five','driftwood']){
    if(JSON.stringify(json(phase+'/runs/'+name+'.json').build.bundles)!==JSON.stringify(run.build.bundles))throw new Error('Mixed served builds: '+name);
  }
  if(phase==='after')for(const [url,digest] of Object.entries(run.build.bundles)){
    if(hash(readFileSync(join('dist',url)))!==digest)throw new Error('Served bytes differ from final dist: '+url);
  }
  for(const file of filenames(phase).filter(path=>/^[\d]+x[\d]+\/[^/]+\.png$/.test(path))){
    const path=phase+'/'+file,bytes=readFileSync(join(root,path)),width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
    if(!file.startsWith(width+'x'+height+'/'))throw new Error('Native dimensions differ: '+path);
    evidence.captures.push({path,width,height,bytes:bytes.length,sha256:hash(bytes)});
  }
  const wide=json(phase+'/runs/wide-five.json');
  const records=wide.draws.records.filter(row=>row.calls>0);
  if(!records.length)throw new Error('No rendered samples');
  const range=values=>[Math.min(...values),Math.max(...values)];
  evidence.crowdedFrame[phase]={view:'Real Wide Berth after action 10 of the outer witness; all five aboard at Shell Landing, Play camera and default zoom, 390×844, Reduced Motion.',aboard:wide.current.aboard,method:wide.draws.method,drawCallRange:range(records.map(row=>row.calls)),triangleRange:range(records.map(row=>row.triangles)),activeFrameCount:records.length,raw:phase+'/runs/wide-five.json'};
}
writeFileSync(join(root,'ACTUAL_EVIDENCE.json'),JSON.stringify(evidence,null,2)+'\n');
