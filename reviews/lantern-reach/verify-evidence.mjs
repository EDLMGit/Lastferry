import { strict as assert } from 'node:assert';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const baseline = 'e583ec29578e7561c0a8ab8fe6e3b08275d44ac2';
const read = path => JSON.parse(readFileSync(path, 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = args => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 16e6 });
const gitBlob = bytes => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
const dir = 'reviews/lantern-reach';
const sourceDir = join(dir, 'gameplay/source');
const names = readdirSync(sourceDir).filter(name => name.endsWith('.json'));
assert.equal(names.length, 1);
const source = read(join(sourceDir, names[0]));
assert.equal(sha(JSON.stringify(source.inputs)), source.sha256);
const tracked = new Map(git(['ls-files', '-s', '-z']).split('\0').filter(Boolean).map(line => {
  const [header, path] = line.split('\t');
  return [path, header.split(' ')[1]];
}));
let exact = 0, newlineEquivalent = 0;
for (const [path, hash] of Object.entries(source.inputs)) {
  const bytes = readFileSync(path);
  assert.equal(sha(bytes), hash, 'Capture differs from working bytes: ' + path);
  if (gitBlob(bytes) === tracked.get(path)) exact++;
  else {
    assert.ok(!bytes.includes(0), path);
    assert.equal(gitBlob(Buffer.from(bytes.toString().replaceAll('\r\n','\n'))), tracked.get(path), 'Capture differs from staged blob: ' + path);
    newlineEquivalent++;
  }
}
const allData = git(['ls-tree','-r','--name-only',baseline,'--','data']).trim().split('\n');
const protectedPaths = [...allData, 'src/campaign/progress.ts','src/game/mastery.ts','src/game/session.ts','src/audio','assets/portraits'];
assert.equal(git(['diff','--cached','--name-only',baseline,'--',...protectedPaths]), '');
for (const size of ['320x740','1440x900']) {
  const run = read(join(dir,'isolation',size,'run.json'));
  assert.equal(sha(readFileSync(join('dist',run.bundle))), run.sha256);
}
for (const size of ['390x844','780x320']) {
  const route = read(join(dir,'gameplay',size,'actual-route.json'));
  assert.equal(route.source, source.sha256);
  assert.deepEqual(route.build, source.build);
}
console.log(JSON.stringify({baseline, source:source.sha256, exact, newlineEquivalent, protectedExistingDataFiles:allData.length,
  build:source.build, checkedViewports:['390x844','780x320','320x740','1440x900']},null,2));
