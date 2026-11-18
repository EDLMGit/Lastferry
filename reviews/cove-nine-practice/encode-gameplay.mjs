import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,renameSync} from 'node:fs';
import {join} from 'node:path';

const base=process.argv[2]??'reviews/cove-nine-practice/gameplay';
const native=join(base,'390x844');
execFileSync(process.execPath,['reviews/arrival-bubble/encode-recording.mjs',native],{stdio:['ignore','ignore','inherit']});
const mediaPath=join(base,'MEDIA.json'),media=JSON.parse(readFileSync(mediaPath,'utf8'));
const capture=JSON.parse(readFileSync(join(native,'final-arrival-recording.json'),'utf8'));
const gaps=capture.frames.slice(1).map((frame,i)=>({between:[i,i+1],seconds:frame.timestamp-capture.frames[i].timestamp})).sort((a,b)=>b.seconds-a.seconds);
renameSync(join(native,'arrival.mp4'),join(native,'orchard-rescue.mp4'));
Object.assign(media,{video:'390x844/orchard-rescue.mp4',source:'Actual minified Practice after reaching Orchard on action 3. Shows the temporary Sloe landing, outward trip, timely return and final rescue on the clear-steps-first strategy, with normal motion. All earlier actions were played in the same session. No added audio, cut, overlays or retiming.',longestNativeGaps:gaps.slice(0,5)});
media.audio.source='MediaRecorder receives a parallel feed from the actual output node connected to the browser destination, at its original gain. No test tone or second AudioContext.';
writeFileSync(mediaPath,JSON.stringify(media,null,2)+'\n');
console.log(media.durationSeconds,media.sourceFrameCount,media.maxNativeFrameGapSeconds,media.sha256);
