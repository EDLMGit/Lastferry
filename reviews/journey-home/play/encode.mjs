import { execFileSync } from 'node:child_process';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(process.env.LAST_FERRY_REVIEW_DIR ?? 'reviews/journey-home/play');
const voyage = JSON.parse(readFileSync(out + '/voyage.json', 'utf8'));

function encode(folder, name, description) {
  const cue = out + '/' + folder;
  execFileSync(process.execPath, ['reviews/arrival-bubble/encode-recording.mjs', cue], { stdio: 'pipe' });
  const result = JSON.parse(readFileSync(out + '/MEDIA.json', 'utf8'));
  const tail = result.durationSeconds - result.firstToLastNativeFrameSeconds;
  if (tail < -0.15 || tail > 0.8) throw Error('Inspect timing between final visible frame and audio end: '+tail.toFixed(3)+'s');
  result.finalFrameToStreamEndSeconds = Number(tail.toFixed(3));
  result.video = '390x844/' + name + '.mp4';
  renameSync(cue + '/arrival.mp4', out + '/' + result.video);
  result.source = description;
  result.frameTiming = 'Native viewport samples in time order. Original wall-clock intervals from local screenshot requests and receipts are retained; no cuts, retiming or interpolation.';
  return result;
}

const firstWelcome = encode('delivery', 'delivery-to-supper',
  'All four are docked after terminal Undo. The player delivers them, explicitly chooses Continue story, sees the first welcome and lets the sweep settle. Simultaneous unamplified runtime audio.');
const credits = encode('390x844', 'supper-to-credits',
  'The fresh Journey has reloaded its pending supper. The player opens More, replays the welcome at natural speed, lets the illustration rest and continues to credits. Simultaneous unamplified runtime audio.');
const result = { runtimeSource:voyage.source, productionBuild:voyage.build, firstWelcome, credits };
writeFileSync(out + '/MEDIA.json', JSON.stringify(result, null, 2) + '\n');
for(const film of [firstWelcome,credits]) console.log(JSON.stringify({ video:film.video, sha256:film.sha256,
  seconds:film.durationSeconds, frames:film.decodedFrameCount, audio:film.audio.encodedCodec }));
