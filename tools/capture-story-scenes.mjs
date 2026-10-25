import { mkdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const dir = process.argv[2] ?? 'reviews/story-scenes/browser';
const output = `${dir}/frames`;
mkdirSync(output, { recursive: true });
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const mediaCommand = (args) =>
  execFileSync('ffmpeg', ['-nostdin', '-y', '-v', 'error', ...args], {
    stdio: ['ignore', 'ignore', 'pipe'],
  });
function nearestFrame(times, seconds) {
  let best = 0;
  for (let i = 1; i < times.length; i++)
    if (Math.abs(times[i] - seconds) < Math.abs(times[best] - seconds)) best = i;
  return best;
}
function extractFrame(video, times, seconds, path) {
  const frameIndex = nearestFrame(times, seconds);
  mediaCommand([
    '-i',
    video,
    '-vf',
    `select=eq(n\\,${frameIndex})`,
    '-fps_mode',
    'passthrough',
    '-frames:v',
    '1',
    '-threads',
    '1',
    path,
  ]);
  return {
    sourceFrameIndex: frameIndex,
    videoOffset: times[frameIndex],
    path,
    bytes: statSync(path).size,
    sha256: hash(path),
  };
}
function matchContent(video, times, start, end, reference, roi, cache) {
  mkdirSync(cache, { recursive: true });
  const indices = [
    ...new Set(
      Array.from({ length: Math.ceil((end - start) / 0.1) + 1 }, (_, i) =>
        nearestFrame(times, Math.min(end, start + i * 0.1)),
      ),
    ),
  ];
  mediaCommand([
    '-i',
    video,
    '-vf',
    `select=${indices.map((index) => `eq(n\\,${index})`).join('+')}`,
    '-fps_mode',
    'passthrough',
    '-threads',
    '1',
    `${cache}/candidate-%03d.png`,
  ]);
  const candidates = indices.map((index, i) => ({
    sourceFrameIndex: index,
    videoOffset: times[index],
    path: `${cache}/candidate-${String(i + 1).padStart(3, '0')}.png`,
  }));
  writeFileSync(`${cache}/candidates.json`, JSON.stringify({ reference, roi, candidates }));
  const scores = JSON.parse(
    execFileSync(
      'python',
      [
        '-c',
        `import json
from PIL import Image,ImageChops,ImageStat
d=json.load(open(r'${cache}/candidates.json'))
ref=Image.open(d['reference']).convert('RGB').crop(tuple(d['roi']))
for c in d['candidates']:
 im=Image.open(c['path']).convert('RGB').crop(tuple(d['roi']))
 c['meanAbsoluteDifference']=sum(ImageStat.Stat(ImageChops.difference(ref,im)).mean)/3
print(json.dumps(d['candidates']))`,
      ],
      { encoding: 'utf8' },
    ),
  );
  const first = scores.find((candidate) => candidate.meanAbsoluteDifference <= 4);
  writeFileSync(
    `${cache}/scores.json`,
    JSON.stringify(
      { reference, referenceSha256: hash(reference), roi, threshold: 4, first, scores },
      null,
      2,
    ),
  );
  if (!first) throw Error(`No matching actual video content: ${cache}`);
  return {
    ...first,
    reference,
    referenceSha256: hash(reference),
    roi,
    threshold: 4,
    scores: `${cache}/scores.json`,
  };
}
const captures = [];
const gestureSelections = existsSync(`${dir}/gesture-selections.json`)
  ? JSON.parse(readFileSync(`${dir}/gesture-selections.json`)).selections
  : [];
const runs = existsSync(`${dir}/opening-recordings.json`)
  ? JSON.parse(readFileSync(`${dir}/opening-recordings.json`)).map((run) => ({
      ...run,
      kind: 'opening',
    }))
  : [];
if (existsSync(`${dir}/composition-recordings.json`))
  runs.push(
    ...JSON.parse(readFileSync(`${dir}/composition-recordings.json`)).map((run) => ({
      ...run,
      kind: 'opening',
      representativeOnly: true,
    })),
  );
if (existsSync(`${dir}/two-cove-journey.json`)) {
  const run = JSON.parse(readFileSync(`${dir}/two-cove-journey.json`));
  runs.push({ ...run, captures: run.connection, kind: 'connection' });
}
for (const run of runs) {
  const first = run.captures[0];
  const openingOffset =
    (Date.parse(first.at) - run.startedAt - first.diagnostics.scene.timeline.elapsed) / 1000;
  const probe = JSON.parse(
    execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration:stream=codec_name,width,height,codec_type',
        '-of',
        'json',
        run.video,
      ],
      { encoding: 'utf8' },
    ),
  );
  const stream = probe.streams.find((stream) => stream.codec_type === 'video');
  const width = stream.width,
    height = stream.height;
  const times = JSON.parse(
    execFileSync(
      'ffprobe',
      [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_frames',
        '-show_entries',
        'frame=best_effort_timestamp_time',
        '-of',
        'json',
        run.video,
      ],
      { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 },
    ),
  ).frames.map((frame) => Number(frame.best_effort_timestamp_time));
  const prefix = `${width}x${height}-${run.kind}`;
  const reference = `${output}/${prefix}-${run.representativeOnly ? 'end' : 'acknowledgment'}.png`;
  const rectangles = first.measurement.captionLines.map((line) => line.rect);
  const roi = [
    Math.max(0, Math.floor(Math.min(...rectangles.map((rect) => rect.left))) - 1),
    Math.max(0, Math.floor(Math.min(...rectangles.map((rect) => rect.top))) - 1),
    Math.min(width, Math.ceil(Math.max(...rectangles.map((rect) => rect.right))) + 1),
    Math.min(height, Math.ceil(Math.max(...rectangles.map((rect) => rect.bottom))) + 1),
  ];
  const sceneMatch = matchContent(
    run.video,
    times,
    Math.max(0, openingOffset - 2),
    Math.min(Number(probe.format.duration), openingOffset + 2),
    reference,
    roi,
    `${dir}/raw/alignment/${prefix}-caption`,
  );
  const sceneOffset = sceneMatch.videoOffset;
  const correction = sceneOffset - openingOffset;
  const hudReference = `${dir}/raw/alignment/${prefix}-hud-reference.png`;
  const referenceOffset =
    run.kind === 'opening'
      ? Number(probe.format.duration) - 0.1
      : (run.bellwaterStartedAt - run.startedAt) / 1000 + correction + 2;
  extractFrame(run.video, times, referenceOffset, hudReference);
  const handoffEstimate =
    ((run.kind === 'opening' ? run.handoff.at : run.bellwaterStartedAt) - run.startedAt) / 1000 +
    correction;
  const hudMatch = matchContent(
    run.video,
    times,
    Math.max(sceneOffset + (run.kind === 'opening' ? 7.2 : 4), handoffEstimate - 2.5),
    Math.min(Number(probe.format.duration) - 0.04, handoffEstimate + 2),
    hudReference,
    [10, 8, Math.min(250, width - 10), 48],
    `${dir}/raw/alignment/${prefix}-handoff`,
  );
  const frames = [];
  const gestureSelection = gestureSelections.find(
    (selection) => selection.originalSha256 === hash(run.video),
  );
  const targets =
    run.kind === 'opening'
      ? run.representativeOnly
        ? [
            ['begin', 0.15],
            ['light', 5],
            ['end', 7.3],
          ]
        : [
            ['begin', 0.15],
            ['acknowledgment', 1],
            ['reveal', 3.6],
            ['light', 5],
            ['end', 7.3],
          ]
      : [
          ['begin', 0.1],
          ['acknowledgment', 1],
          ['reveal', 2.6],
          ['end', 4.1],
        ];
  for (const [beat, elapsed] of targets) {
    const at =
      beat === 'acknowledgment' && gestureSelection
        ? gestureSelection.sourcePts
        : beat === 'end'
          ? times[Math.max(0, hudMatch.sourceFrameIndex - 1)]
          : sceneOffset + elapsed;
    const path = `${output}/${width}x${height}-${run.kind}-${beat}.png`;
    const extracted = extractFrame(run.video, times, at, path);
    frames.push({
      beat,
      elapsedRequested: elapsed,
      basis:
        beat === 'acknowledgment' && gestureSelection
          ? gestureSelection.reason
          : beat === 'end'
            ? 'Last complete scene frame before the matched normal gameplay HUD; all captions remain readable'
            : 'Offset from first source frame with complete scene caption',
      ...extracted,
    });
  }
  frames.push({
    beat: 'gameplay-handoff',
    ...extractFrame(
      run.video,
      times,
      hudMatch.videoOffset + 0.2,
      `${output}/${prefix}-gameplay-handoff.png`,
    ),
  });
  const result = {
    kind: run.kind,
    viewport: { width, height },
    original: { path: run.video, sha256: hash(run.video), ...probe },
    originalWallEstimate: openingOffset,
    sceneOffset,
    correction,
    contentAlignment: { sceneMatch, hudMatch },
    gestureSelection: gestureSelection ?? null,
    alignment:
      'Wall/timeline estimate supplies only a search window. First complete-caption and gameplay-title frames are found by matching actual source pixels at 0.1-second search cadence; selections retain exact decoded source frame index/PTS and are inspected at native size. Authored elapsed offsets remain approximate to the first matched rendered frame, not a subframe clock claim.',
    frames,
  };
  if (process.argv.includes('--media') && !run.representativeOnly) {
    const start = sceneOffset;
    const end = Math.min(
      Number(probe.format.duration),
      hudMatch.videoOffset + (run.kind === 'connection' ? 0.2 : 0.6),
    );
    const path = `${dir}/${run.kind}-${width}x${height}.webp`;
    execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-i', run.video, '-f', 'null', '-'], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    execFileSync(
      'ffmpeg',
      [
        '-nostdin',
        '-y',
        '-v',
        'error',
        '-ss',
        start.toFixed(3),
        '-i',
        run.video,
        '-t',
        (end - start).toFixed(3),
        '-vf',
        'fps=12',
        '-c:v',
        'libwebp_anim',
        '-quality',
        '78',
        '-compression_level',
        '4',
        '-loop',
        '0',
        '-threads',
        '1',
        path,
      ],
      { stdio: ['ignore', 'ignore', 'pipe'] },
    );
    const decode = JSON.parse(
      execFileSync(
        'python',
        [
          '-c',
          `import json
from PIL import Image
im=Image.open(r'${path}')
durations=[]
for i in range(im.n_frames):
 im.seek(i)
 im.load()
 durations.append(im.info.get('duration',0))
print(json.dumps({'width':im.width,'height':im.height,'frames':im.n_frames,'durationMs':sum(durations)}))`,
        ],
        { encoding: 'utf8' },
      ),
    );
    result.derivative = {
      path,
      bytes: statSync(path).size,
      sha256: hash(path),
      clipStart: start,
      clipEnd: end,
      clipDuration: end - start,
      sampleFps: 12,
      ...decode,
      endpointRoundingMs: decode.durationMs - (end - start) * 1000,
      method:
        'One continuous excerpt containing the complete real scene and its gameplay handoff. Title/loading and later unrelated play trimmed at the declared endpoints. No internal cuts, crop, time injection, interpolation or speed change; native dimensions and natural elapsed timing retained. Every derivative frame and complete source decoded successfully. Silent visual evidence.',
    };
  }
  captures.push(result);
}
writeFileSync(
  `${dir}/video-frames.json`,
  JSON.stringify(
    { at: new Date().toISOString(), helperSha256: hash(new URL(import.meta.url)), captures },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    captures.map((run) => ({
      viewport: run.viewport,
      openingOffset: run.openingOffset,
      frames: run.frames.map((frame) => frame.path),
    })),
    null,
    2,
  ),
);
