import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const base = 'reviews/lantern-reach-difficulty/play';
const manifest = {};
for (const size of ['390x844','780x320']) {
  const dir = join(base,size);
  const run = JSON.parse(readFileSync(join(dir,'run.json')));
  manifest[size] = { source:run.source, build:run.build, frames:{} };
  for (const name of readdirSync(dir).filter(s => s.endsWith('.png'))) {
    const bytes = readFileSync(join(dir,name));
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    assert.equal(width+'x'+height, size, name);
    manifest[size].frames[name] = { width, height, sha256:createHash('sha256').update(bytes).digest('hex') };
  }
}
console.log(JSON.stringify(manifest,null,2));
