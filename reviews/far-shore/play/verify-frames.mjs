import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const root = new URL('./', import.meta.url);
const read = file => readFileSync(new URL(file, root));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const sets = {};
for (const path of ['development/390x844', '390x844', '780x320']) {
  const [width, height] = path.split('/').at(-1).split('x').map(Number);
  const run = JSON.parse(read(path + '/run.json'));
  const frames = {};
  for (const name of readdirSync(new URL(path + '/', root)).filter(name => name.endsWith('.png'))) {
    const bytes = read(path + '/' + name);
    assert.equal(bytes.readUInt32BE(16), width, name);
    assert.equal(bytes.readUInt32BE(20), height, name);
    frames[name] = digest(bytes);
  }
  if (run.levelSHA256) {
    assert.equal(digest(read('development/level.json')), run.levelSHA256);
  } else {
    assert.equal(JSON.parse(read('source/' + run.source + '.json')).sha256, run.source);
    assert.ok(frames['rush-with-thistle.png'] && frames['rush-with-button.png']);
    assert.notEqual(frames['rush-with-thistle.png'], frames['rush-with-button.png']);
  }
  sets[path] = {width, height, source: run.levelSHA256 ?? run.source, build: run.build, frames};
}
assert.equal(sets['390x844'].source, sets['780x320'].source);
assert.deepEqual(sets['390x844'].build, sets['780x320'].build);
writeFileSync(new URL('frames.json',root), JSON.stringify(sets,null,2) + '\n');
