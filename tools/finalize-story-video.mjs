import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';
import { createHash } from 'node:crypto';

const dir = 'reviews/story-foundation';
const run = JSON.parse(readFileSync(`${dir}/browser/full-sequence.json`));
const source = JSON.parse(readFileSync(`${dir}/runtime-source.json`));
const original = run.video;
const output = `${dir}/story-journey-780.webp`;
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration:stream=codec_type,codec_name,width,height,r_frame_rate', '-of', 'json', original], { encoding: 'utf8' }));
execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-i', original, '-f', 'null', '-'], { stdio: ['ignore', 'ignore', 'pipe'] });
execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', '-i', original, '-vf', 'fps=8', '-c:v', 'libwebp_anim', '-quality', '65', '-compression_level', '4', '-loop', '0', '-threads', '1', output], { stdio: ['ignore', 'ignore', 'pipe'] });
const decoded = JSON.parse(execFileSync('python', ['-c', `import json
from PIL import Image
im=Image.open(r'${output}')
durations=[]
for i in range(im.n_frames):
 im.seek(i)
 im.load()
 durations.append(im.info.get('duration',0))
print(json.dumps({'width':im.width,'height':im.height,'frames':im.n_frames,'durationMs':sum(durations)}))`], { encoding: 'utf8' }));
const hash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const video = probe.streams.find(stream => stream.codec_type === 'video');
const result = {
  source: { runtimeHash: source.runtimeHash, source: 'runtime-source.json', workingTreeBase: source.head },
  original: { path: relative(dir, original).replaceAll('\\', '/'), sha256: hash(original), bytes: statSync(original).size, codec: video.codec_name, width: video.width, height: video.height, durationSeconds: Number(probe.format.duration), audioTracks: probe.streams.filter(stream => stream.codec_type === 'audio').length, availability: 'Local ignored original' },
  derivative: { path: 'story-journey-780.webp', sha256: hash(output), bytes: statSync(output).size, ...decoded, sampleFps: 8, endpointRoundingMs: decoded.durationMs - Number(probe.format.duration) * 1000 },
  method: 'Entire uninterrupted actual UI sequence at native size. No cuts, crop or speed change; 8fps sampling and identical-frame coalescing. Complete original and every derivative frame decoded successfully.',
  coverage: 'Default title, watched opening, Holding rescue, tide Undo/reboard, terminal Undo/redelivery, explicit connective scene, skipped motion, untouched Bellwater, visible pan around existing dock overlap, complete Bellwater rescue, explicit prototype endpoint and reload.',
  limitations: ['Silent visual evidence, no new acoustic approval.', 'Chromium SwiftShader with emulated touch, not physical Android.', 'This capture precedes only the separately verified return-to-title cancellation refinement; source reuse is recorded in the review.']
};
writeFileSync(`${dir}/VIDEO_EVIDENCE.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result.derivative));
