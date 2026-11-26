import { execFileSync } from 'node:child_process';
import { copyFileSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = process.argv[2] ?? 'reviews/lantern-reach/gameplay';
const portrait = join(base, '390x844');
execFileSync(process.execPath, ['reviews/arrival-bubble/encode-recording.mjs', portrait], { stdio: ['ignore', 'ignore', 'inherit'] });
const mediaPath = join(base, 'MEDIA.json');
const media = JSON.parse(readFileSync(mediaPath, 'utf8'));
const capture = JSON.parse(readFileSync(join(portrait, 'final-arrival-recording.json'), 'utf8'));
const gaps = capture.frames.slice(1).map((frame, i) => ({ between: [i, i + 1], seconds: frame.timestamp - capture.frames[i].timestamp }));
renameSync(join(portrait, 'arrival.mp4'), join(portrait, 'bridge-rescue.mp4'));
media.video = '390x844/bridge-rescue.mp4';
media.source = 'Uninterrupted release UI from turn zero through the open-bridge shortcut and delivery. Native browser frames, natural speed, normal motion, runtime audio.';
media.longestNativeGaps = gaps.sort((a, b) => b.seconds - a.seconds).slice(0, 5);
const opening = JSON.parse(readFileSync(join(portrait, 'opening-time.json'), 'utf8'));
const inMotion = capture.frames.map((frame, index) => ({ index, millisecondsAfterInput: frame.timestamp * 1000 - opening.inputMs }))
  .filter(frame => frame.millisecondsAfterInput >= 0 && frame.millisecondsAfterInput <= 1400);
media.bridgeFramesDuringNominalOpening = inMotion;
if (inMotion.length) {
  const middle = inMotion.reduce((a, b) => Math.abs(a.millisecondsAfterInput - 700) < Math.abs(b.millisecondsAfterInput - 700) ? a : b);
  copyFileSync(capture.frames[middle.index].path, join(portrait, 'swing-frame.jpg'));
  media.bridgeFrame = { ...middle, image: '390x844/swing-frame.jpg' };
}
media.audio.source = 'A parallel connection from the game output node feeds the browser MediaRecorder at the original gain.';
writeFileSync(mediaPath, JSON.stringify(media, null, 2) + '\n');
console.log(media.durationSeconds, media.sourceFrameCount, media.maxNativeFrameGapSeconds, media.sha256);
