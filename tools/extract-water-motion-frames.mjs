import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const folder = process.argv[2];
if (!folder) throw Error('Pass a water-motion capture folder');
const hash = (value) => createHash('sha256').update(value).digest('hex');
const capture = JSON.parse(readFileSync(folder + '/capture.json', 'utf8'));
const result = {
  sourceHead: capture.sourceHead,
  runtimeHash: capture.runtimeHash,
  environment: capture.environment,
  method:
    'Unscaled ordered frames at two frames per encoded-video second from uninterrupted natural full-interface originals. Video times are temporal inspection only: they do not infer normalized journey phase or synchronize the browser performance clock. Use separately captured same-rAF canvas/state PNGs for phase comparisons. No cuts or media speed changes.',
  frames: [],
  media: [],
};
for (const route of capture.routes) {
  if (!route.recording) continue;
  const probe = JSON.parse(
    execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration:stream=index,codec_name,width,height',
        '-of',
        'json',
        route.recording.path,
      ],
      { encoding: 'utf8' },
    ),
  );
  const output = folder + '/raw/' + route.length + '-temporal';
  mkdirSync(output, { recursive: true });
  execFileSync('ffmpeg', [
    '-v',
    'error',
    '-threads',
    '1',
    '-i',
    route.recording.path,
    '-vf',
    'fps=2',
    '-y',
    output + '/frame-%04d.png',
  ]);
  result.media.push({ path: route.recording.path, sha256: route.recording.sha256, probe });
  for (const [index, name] of readdirSync(output)
    .filter((name) => name.endsWith('.png'))
    .sort()
    .entries()) {
    const path = output + '/' + name,
      bytes = readFileSync(path);
    result.frames.push({
      path,
      sha256: hash(bytes),
      width: bytes.readUInt32BE(16),
      height: bytes.readUInt32BE(20),
      recording: route.recording.path,
      sequence: index + 1,
      videoSecond: index / 2,
      purpose: 'Ordered native temporal inspection; no journey-progress claim.',
    });
  }
}
writeFileSync(folder + '/temporal-frames.json', JSON.stringify(result, null, 2) + '\n');
process.stdout.write(
  JSON.stringify({ frames: result.frames.length, media: result.media.length }) + '\n',
);
