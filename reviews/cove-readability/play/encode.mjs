import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const phone = 'reviews/cove-readability/play/after/390x844';
const dir = phone + '/holding-pier';
execFileSync(process.execPath,['reviews/arrival-bubble/encode-recording.mjs',dir],{stdio:['ignore','ignore','inherit']});
const read = file => JSON.parse(readFileSync(file,'utf8'));
const media = read(phone+'/MEDIA.json');
const run = read(dir+'/run.json');
media.video = 'holding-pier/arrival.mp4';
media.source = 'Normal-motion, unbroken native Chromium play from first control in Holding Pier to arrival, including route inspection, free passenger selection and Undo across the tide. Simultaneous runtime master audio at original game gain.';
media.productionBuild = run.build;
media.runtimeSource = run.source;
media.viewport = run.viewport;
writeFileSync(phone+'/MEDIA.json',JSON.stringify(media,null,2)+'\n');
console.log(JSON.stringify({duration:media.durationSeconds,frames:media.decodedFrameCount,maximumNativeFrameGap:media.maxNativeFrameGapSeconds}));
