import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const dir = process.argv[2] ?? 'reviews/arrival-bubble/390x844';
const manifestPath = join(dir, 'final-arrival-recording.json');
const fromJSON = path => JSON.parse(readFileSync(path, 'utf8'));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const out = join(dir, 'arrival.mp4');
const manifest = fromJSON(manifestPath);
const frames = [...manifest.frames].sort((a,b) => a.timestamp - b.timestamp || a.receipt - b.receipt);
if (frames.length < 10 || !manifest.audio || manifest.viewport.width !== 390 || manifest.viewport.height !== 844) throw Error('Missing native capture');
const pts = frames.map(f => f.timestamp);
const gaps = pts.slice(1).map((v,i) => v - pts[i]);
if (gaps.some(g => !Number.isFinite(g) || g <= 0)) throw Error('Inspect native timestamp collision');
const offset = pts[0] - manifest.audioStartEpochMs / 1000;
if (offset < -8 || offset > 8) throw Error('Inspect audio/video alignment');
const joinList = join(dir, 'raw', 'final-arrival', 'frames.ffconcat');
const list = ['ffconcat version 1.0'];
frames.forEach((f,i) => {
  list.push("file '" + resolve(f.path).replaceAll('\\','/').replaceAll("'", "'\\''") + "'", 'option framerate 1000');
  if (i < gaps.length) list.push('duration ' + gaps[i].toFixed(6));
});
writeFileSync(joinList, list.join('\n')+'\n');
function ffprobe(path) {
  return fromProcess('ffprobe', ['-v','error','-count_frames','-show_streams','-show_format','-of','json',path]);
}
function fromProcess(exe,args) { return JSON.parse(execFileSync(exe,args,{encoding:'utf8'})); }
execFileSync('ffmpeg',['-nostdin','-y','-v','warning','-f','concat','-safe','0','-i',joinList,
 ...(offset > 0 ? ['-ss',offset.toFixed(6)] : []),'-i',manifest.audio,
 ...(offset < 0 ? ['-af','adelay='+Math.round(-offset*1000)+':all=1'] : []),
 '-map','0:v:0','-map','1:a:0','-c:v','libx264','-threads','3','-preset','fast','-crf','23','-pix_fmt','yuv420p','-fps_mode','vfr',
 '-c:a','aac','-b:a','128k','-movflags','+faststart',out],{stdio:['ignore','ignore','pipe']});
const probe = ffprobe(out);
const video = probe.streams.find(s=>s.codec_type==='video');
const aud = probe.streams.find(s=>s.codec_type==='audio');
if (Number(video.nb_read_frames)!==frames.length || video.width!==390 || video.height!==844 || !aud) throw Error('Stream mismatch');
execFileSync('ffmpeg',['-nostdin','-v','error','-xerror','-i',out,'-f','null','-'],{stdio:['ignore','ignore','pipe']});
import { spawnSync } from 'node:child_process';
function measuredAudio(path) {
 const p = spawnSync('ffmpeg',['-nostdin','-hide_banner','-nostats','-i',path,'-vn','-af','astats=metadata=0:reset=0','-f','null','-'],{encoding:'utf8',windowsHide:true});
 const text = p.stderr.split('Overall').at(-1);
 const nums=Object.fromEntries(['Peak level dB','RMS level dB','Number of samples'].map(k=>[k,Number(text.match(new RegExp(k+': ([^\\r\\n]+)'))?.[1])]));
 if (p.status!==0 || !Number.isFinite(nums['RMS level dB']) || nums['Number of samples'] < 44100) throw Error('Missing audible stream '+JSON.stringify(nums));
 return nums;
}
const audioIn = measuredAudio(manifest.audio), audioOut=measuredAudio(out);
const result={video:'390x844/arrival.mp4',sha256:hash(out),bytes:statSync(out).size,
source:'Uninterrupted real UI final approach, visible arrival, Settings, dismissal and reopening; earlier rescue actions completed through the UI before capture. Native Chromium CDP screencast at 390x844 and simultaneous game master output via MediaRecorder. See REVIEW.md for runtime source and browser identity.',
nativeViewport:manifest.viewport,sourceFrameCount:frames.length,decodedFrameCount:Number(video.nb_read_frames),durationSeconds:Number(probe.format.duration),
firstToLastNativeFrameSeconds:pts.at(-1)-pts[0],maxNativeFrameGapSeconds:Math.max(...gaps),firstNativeFrameMinusAudioStartSeconds:offset,
videoCodec:video.codec_name,variableFrameRate:true,frameTiming:'All delivered frames in timestamp order; real intervals retained. Native browser capture stalls remain. No cuts, retiming, overlays or interpolated frames.',
audio:{sourceCodec:'opus',sourceSHA256:hash(manifest.audio),encodedCodec:aud.codec_name,channels:aud.channels,sampleRate:Number(aud.sample_rate),sourceLevel:audioIn,encodedLevel:audioOut,alignment:'Runtime recorder aligned to first native image. Original in-game levels preserved; AAC compression, no gain adjustment.'},fullDecode:'passed'};
writeFileSync(join(dir,'..','MEDIA.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result));
