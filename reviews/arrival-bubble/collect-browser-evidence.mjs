import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root='reviews/arrival-bubble';
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const json=path=>JSON.parse(readFileSync(join(root,path),'utf8'));
const write=(name,value)=>writeFileSync(join(root,name),JSON.stringify(value,null,2)+'\n');
const finalSource=json('gameplay/recording-sequence.json').source;
const source=json('source/'+finalSource+'.json');
const old='92ada9683bad42248b9e48436f29c9b276954331ddd959fc76845ea730befc00';
const journey='9f4ee4b5879a1989bb1dd9bcff3f25f5fbc71009113d8a1ab7f47d0ee03ef6de';
const cases=[
  {id:'portrait-lifecycle',file:'original-runs/full-batch-cached-css.json',title:'portrait Ternhaven',source:old,qualifier:'Development CSS cache retained pre-spacing style. Logic passed; current final-source presentation repeated in recording.'},
  {id:'minified-current1-prior3',file:'original-runs/full-batch-cached-css.json',title:'minified short-landscape',source:old,qualifier:'Fresh minified bundle; later notice-only CSS and 2px border-height cap are absent/inactive here.'},
  {id:'journey-tide-undo-continue',file:'journey-and-notice-results.json',title:'actual scored Journey',source:journey,qualifier:'Restarted server; subsequent storage-notice-only CSS absent from this actual arrival.'},
  {id:'desktop-home-write-failure',file:'original-runs/full-batch-cached-css.json',title:'desktop confirmed Home',source:old,qualifier:'Development served pre-spacing CSS; unchanged acceptance/storage semantics.'},
  {id:'six-cast-and-notice-fit',file:'final-fixture-results.json',title:'isolated six-neighbor',source:finalSource,qualifier:'Explicit isolated renderer specimen; no rescue claim.'},
  {id:'image-pending-and-failure',file:'final-image-fallback-results.json',title:'isolated initial',source:finalSource,qualifier:'Explicit isolated renderer specimen; delayed/failed image resources.'},
  {id:'loss-undo',file:'original-runs/full-batch-cached-css.json',title:'an actual loss',source:old,qualifier:'Unchanged failure UI, rules and recovery; development pre-spacing arrival CSS irrelevant.'},
  {id:'final-minified-read-failure',file:'production-final-results.json',title:'final minified',source:finalSource,qualifier:'Actual nine-action Holding UI rescue; final minified build; malformed best storage and untouched valid Journey.'},
];
for(const c of cases){
  if(!existsSync(join(root,c.file))){c.status='not recorded';continue;}
  const result=json(c.file);
  const specs=result.suites.flatMap(s=>s.specs??[]);
  const spec=specs.find(s=>s.title.startsWith(c.title));
  c.status=spec?.tests[0]?.results.at(-1)?.status??'missing case';
  c.resultSHA256=hash(join(root,c.file));
}
const list=[];
const add=(path,sourceIdentity,scope,qualifier)=>{
  const buffer=readFileSync(join(root,path));
  list.push({path,sha256:hash(join(root,path)),native:{width:buffer.readUInt32BE(16),height:buffer.readUInt32BE(20),dpr:1},source:sourceIdentity,scope,qualifier});
};
for(const name of ['390x844','780x320'])add('before/'+name+'.png','reviewed bundle dbc74f6bfad5d3d857967fa1d0a1172aedbac7214547a76291bb2bfc4b943415','actual UI rescue','Old unscored Ternhaven runtime; see before/source.json and driver-provenance.json.');
for(const name of readdirSync(join(root,'gameplay')).filter(p=>p.endsWith('.png')))add('gameplay/'+name,finalSource,'actual UI rescue','Fresh restarted final runtime; normal motion after actual Reduced Motion preparation.');
for(const name of readdirSync(join(root,'fixtures')).filter(p=>p.endsWith('.png')))add('fixtures/'+name,finalSource,'isolated renderer fixture','Synthetic won-state rendering, explicitly labeled; does not claim a played rescue.');
for(const name of ['journey-two','details'])add('320x740/'+name+'.png',journey,'actual Journey rescue','Subsequent notice-only CSS absent from this actual arrival.');
for(const name of ['one-current-best-three','details'])add('780x320/'+name+'.png',old,'actual minified UI rescue','Fresh minified earlier build; later notice-only CSS absent here.');
if(existsSync(join(root,'production-final')))for(const name of readdirSync(join(root,'production-final')).filter(p=>p.endsWith('.png')))add('production-final/'+name,finalSource,'actual minified UI rescue','Fresh final build; visible read-failure notice.');
const assets=readdirSync('dist/assets').filter(p=>/^index-.*\.(js|css)$/.test(p)).map(p=>({path:'dist/assets/'+p,sha256:hash('dist/assets/'+p)}));
const configFiles=['.cache/arrival-vite.config.ts','.cache/arrival-playwright.config.ts','.cache/arrival-record.config.ts'];
write('ENVIRONMENT.json',{
  task:'ARRIVAL_BUBBLE_01',headDuringEvidence:source.head,runtimeInputsSHA256:finalSource,runtimeInputCount:Object.keys(source.inputs).length,
  sourceManifest:'source/'+finalSource+'.json',finalTestHashes:source.tests,
  captureDriver:{path:'recording-driver.ts',sha256:hash(join(root,'recording-driver.ts')),testFileSHA256DuringCapture:'794fcb5e2e060e47b9e9d0fe37cdc729f3f2c3f652d709d457b65f3f6e82dfd9',qualification:'Final minified notice case was appended after capture; runtime unchanged.'},
  node:process.version,npm:'11.12.1',browser:'Chromium 156.0.8078.4',playwright:'1.64.1',platform:process.platform,renderer:'ANGLE SwiftShader',dpr:1,
  viewports:[[390,844],[780,320],[320,740],[1440,900]],input:'Playwright mobile/touch emulation plus normal Tab/Shift+Tab/Enter/Escape',
  servers:{development:5298,production:5285,before:5284,user:5270,hmr:false,watch:null},
  configs:Object.fromEntries(configFiles.map(p=>[p,readFileSync(p,'utf8')])),
  commands:{build:'npm run build',typecheck:'npm run typecheck',assets:'npm run check:assets',suite:'set "PLAYWRIGHT_BROWSERS_PATH=.cache/ms-playwright"&& set "LAST_FERRY_REVIEW_DIR=reviews/arrival-bubble"&& set "LAST_FERRY_PRODUCTION_PORT=5285"&& node node_modules/@playwright/test/cli.js test -c .cache/arrival-playwright.config.ts --workers=1',record:'same environment, node node_modules/@playwright/test/cli.js test -c .cache/arrival-record.config.ts --workers=1',encode:'node reviews/arrival-bubble/encode-recording.mjs reviews/arrival-bubble/390x844'},
  finalBuildAssets:assets,servedCSS:{path:'served-arrival-css.txt',sha256:hash(join(root,'served-arrival-css.txt')),qualification:'Fetched after the final known development server restart; no-watch cache issue and earlier response retained under original-runs.'},
  resultMapping:cases,recording:{result:'recording-results.json',source:finalSource,manifest:'390x844/final-arrival-recording.json',media:'MEDIA.json',preparation:json('gameplay/recording-sequence.json').prep,scope:json('gameplay/recording-sequence.json').recorded},
  limits:['No physical Android/iOS viewport chrome or device-performance validation.','Fullscreen entered actual Chromium app root; not a physical phone guarantee.','Visibility recovery uses synthetic document.hidden events.','No spoken screen-reader or human listening approval.','Selected capture retains actual frame gaps; raw WebM/JPEG intermediates are local disposable output.','Earlier valid behavior cases reused with explicit served-source qualifications; not a single final all-green batch.'],
});
write('EVIDENCE.json',{runtimeInputsSHA256:finalSource,frames:list,media:json('MEDIA.json'),inspection:'Native phone frames and representative natural-speed captured frames inspected; full labels/controls and portrait identity retained. Final notice Details reserves utility controls; full Harbor visible after closing. Open portrait bubble deliberately covers most Harbor. Expanded Details intentionally uses bounded scrolling.',notSelected:['original-runs/pre-spacing-frames/','final-source/ from the interrupted overlong recording','390x844/ earlier pre-spacing presentation frames; behavior JSON retained']});
console.log(JSON.stringify({source:finalSource,cases:cases.map(c=>({id:c.id,status:c.status})),frames:list.length,assets}));
