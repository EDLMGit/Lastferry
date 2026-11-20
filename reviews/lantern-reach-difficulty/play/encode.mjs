import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'reviews/lantern-reach-difficulty/play';
const phone = join(dir, '390x844');
execFileSync(process.execPath, ['reviews/arrival-bubble/encode-recording.mjs', phone], { stdio:['ignore','ignore','inherit'] });
const read = file => JSON.parse(readFileSync(file,'utf8'));
const mediaPath = join(dir,'MEDIA.json');
const media = read(mediaPath);
const run = read(join(phone,'run.json'));
const raw = read(join(phone,'final-arrival-recording.json'));
media.source = 'Uninterrupted portrait play through a choice, its consequence, Undo recovery and the successful rescue. Normal game motion and simultaneous game master audio, original gain.';
media.runtimeSource = run.source;
media.build = run.build;
media.events = run.clock.map(row => ({ event: row.event, turn: row.turn, secondsFromFirstFrame:
  Number((row.epochMs / 1000 - raw.frames[0].timestamp).toFixed(2)) }));
writeFileSync(mediaPath, JSON.stringify(media,null,2)+'\n');
console.log(JSON.stringify({ seconds:media.durationSeconds, maxGap:media.maxNativeFrameGapSeconds, frames:media.sourceFrameCount, video:media.video }));
