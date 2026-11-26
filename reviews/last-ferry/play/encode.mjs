import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const root = 'reviews/last-ferry/play';
const dir = root + '/390x844';
execFileSync(process.execPath,['reviews/arrival-bubble/encode-recording.mjs',dir],{stdio:['ignore','ignore','inherit']});
const media = JSON.parse(readFileSync(root+'/MEDIA.json','utf8'));
const run = JSON.parse(readFileSync(dir+'/run.json','utf8'));
media.source = 'Uninterrupted normal-motion touch play from the opening dock through the full ferry arrival. Native Chromium frame timing and simultaneous runtime audio.';
media.runtimeSource = run.source;
media.productionBuild = run.build;
const recording = JSON.parse(readFileSync(dir+'/final-arrival-recording.json','utf8'));
media.events = run.events.map(({ name, turn, epochMs }) => ({
  name, turn, secondsFromFirstFrame: Number((epochMs/1000 - recording.frames[0].timestamp).toFixed(2)),
}));
const begins = media.events.find(e => e.name === 'Last approach begins').secondsFromFirstFrame;
const ends = media.events.find(e => e.name === 'Captain commits · unload').secondsFromFirstFrame;
if (ends <= begins || ends > media.durationSeconds) throw Error('Invalid approach window');
const excerpt = dir + '/lighthouse-approach.mp4';
execFileSync('ffmpeg',['-nostdin','-v','error','-y','-i',dir+'/arrival.mp4','-ss',String(begins),'-t',String(ends-begins),
  '-map','0:v:0','-map','0:a:0','-fps_mode','vfr','-c:v','libx264','-threads','3','-preset','fast','-crf','20','-pix_fmt','yuv420p',
  '-c:a','aac','-b:a','128k','-movflags','+faststart',excerpt]);
execFileSync('ffmpeg',['-nostdin','-v','error','-xerror','-i',excerpt,'-f','null','-']);
media.approach = {path:'390x844/lighthouse-approach.mp4',startsAt:begins,endsAt:ends,sha256:createHash('sha256').update(readFileSync(excerpt)).digest('hex'),
  description:'Native-speed excerpt of the same recording, from deliberate Sail to Harbor through docking and the captain’s pause before disembarkation. Stereo game audio at unchanged gain.'};
writeFileSync(root+'/MEDIA.json',JSON.stringify(media,null,2)+'\n');
console.log(JSON.stringify({duration:media.durationSeconds, frames:media.decodedFrameCount, longestGap:media.maxNativeFrameGapSeconds}));
