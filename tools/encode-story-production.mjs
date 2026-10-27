import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const dir = process.argv[2] ?? 'reviews/story-production/browser';
const manifest = JSON.parse(readFileSync(`${dir}/actual-journey-recording.json`, 'utf8'));
const frames = manifest.frames.filter(
  (frame, index, list) => !index || frame.timestamp > list[index - 1].timestamp,
);
if (frames.length < 2) throw Error('No complete screencast');
const concat = `${dir}/raw/actual-journey/frames.ffconcat`;
const duration = frames.at(-1).timestamp - frames[0].timestamp;
const offset = frames[0].timestamp - manifest.audioStartEpochMs / 1000;
if (offset < 0 || offset > 3) throw Error(`Unexpected native clock offset ${offset}`);
const lines = ['ffconcat version 1.0'];
for (let i = 0; i < frames.length; i++) {
  lines.push(`file '${resolve(frames[i].path).replaceAll('\\', '/')}'`);
  if (i + 1 < frames.length)
    lines.push(`duration ${frames[i + 1].timestamp - frames[i].timestamp}`);
}
writeFileSync(concat, lines.join('\n') + '\n');
const output = `${dir}/actual-journey.mp4`;
const command = [
  '-nostdin',
  '-y',
  '-v',
  'warning',
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  concat,
  '-ss',
  String(offset),
  '-i',
  manifest.audio,
  '-map',
  '0:v:0',
  '-map',
  '1:a:0',
  '-t',
  String(duration),
  '-c:v',
  'libx264',
  '-preset',
  'slow',
  '-crf',
  '24',
  '-pix_fmt',
  'yuv420p',
  '-fps_mode',
  'vfr',
  '-c:a',
  'aac',
  '-b:a',
  '128k',
  '-movflags',
  '+faststart',
  output,
];
execFileSync('ffmpeg', command, { stdio: ['ignore', 'ignore', 'pipe'] });
const probe = JSON.parse(
  execFileSync('ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', output], {
    encoding: 'utf8',
  }),
);
execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-i', output, '-f', 'null', '-'], {
  stdio: ['ignore', 'ignore', 'pipe'],
});
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
writeFileSync(
  `${dir}/actual-journey-encoding.json`,
  JSON.stringify(
    {
      capturedFrom: manifest.method,
      nativeViewport: manifest.viewport,
      output,
      bytes: statSync(output).size,
      sha256: hash(output),
      audioSource: { path: manifest.audio, sha256: hash(manifest.audio) },
      firstFrame: frames[0],
      lastFrame: frames.at(-1),
      rawFrameCount: manifest.frames.length,
      encodedFrameCount: frames.length,
      elapsedSeconds: duration,
      audioLeadingTrimSeconds: offset,
      timing:
        'Video timestamps from native CDP frame metadata; audio recording start from performance.timeOrigin + performance.now(). Only pre-first-frame audio is trimmed to align the continuously recorded streams. VFR preserves observed source frame durations; no speed adjustment or internal edits.',
      sound:
        'Actual runtime Sound.captureStream master output, unchanged gain; AAC encoding only, no normalization, boost, substitute audio or narration.',
      decoding: 'ffmpeg full video/audio decode completed without errors',
      command,
      probe,
    },
    null,
    2,
  ),
);
process.stdout.write(
  JSON.stringify({
    output,
    bytes: statSync(output).size,
    duration,
    offset,
    frames: frames.length,
  }) + '\n',
);
