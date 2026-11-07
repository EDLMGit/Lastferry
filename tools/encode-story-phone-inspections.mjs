import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const directory = process.argv[2] ?? 'reviews/story-production/dev3';
const runs = JSON.parse(readFileSync(`${directory}/native-compositions.json`, 'utf8'));
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const outputs = [];
for (const run of runs.filter((run) => run.detailed)) {
  const output = `${directory}/${run.width}x${run.height}-scene-inspection-silent.mp4`;
  const command = [
    '-nostdin',
    '-y',
    '-v',
    'error',
    '-i',
    run.video,
    '-map',
    '0:v:0',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '24',
    '-pix_fmt',
    'yuv420p',
    '-fps_mode',
    'passthrough',
    '-an',
    '-movflags',
    '+faststart',
    output,
  ];
  execFileSync('ffmpeg', command, { stdio: ['ignore', 'ignore', 'pipe'] });
  execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-i', output, '-f', 'null', '-'], {
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  const probe = JSON.parse(
    execFileSync(
      'ffprobe',
      ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', output],
      { encoding: 'utf8' },
    ),
  );
  outputs.push({
    output,
    bytes: statSync(output).size,
    sha256: hash(output),
    source: { path: run.video, sha256: hash(run.video) },
    viewport: { width: run.width, height: run.height },
    sound: 'Silent Playwright video; the separate actual-journey.mp4 contains runtime sound.',
    method:
      'Full original native-size inspection recording transcoded without trim, scaling, speed change or inserted frames. Opening uses actual Begin journey; the later Harbor scene is explicitly restored from a valid pending checkpoint and Replay scene, not an earned rescue in this clip.',
    decoding: 'Complete ffmpeg video decode passed',
    command,
    probe,
  });
}
writeFileSync(`${directory}/phone-inspection-encoding.json`, JSON.stringify(outputs, null, 2));
process.stdout.write(
  JSON.stringify(
    outputs.map(({ output, bytes, probe }) => ({ output, bytes, duration: probe.format.duration })),
  ) + '\n',
);
