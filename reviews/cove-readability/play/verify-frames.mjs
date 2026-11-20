import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const root = new URL('./',import.meta.url);
const read = file => readFileSync(new URL(file,root));
const digest = data => createHash('sha256').update(data).digest('hex');
const manifest = {};
const firstBuild = {};
for(const size of ['390x844','780x320']) {
  const [width,height] = size.split('x').map(Number);
  for(const level of ['holding-pier','far-shore']) {
    const key = size+'/'+level;
    const pair = {};
    for(const stage of ['before','after']) {
      const dir = stage+'/'+key+'/';
      const run = JSON.parse(read(dir+'run.json'));
      const identity = {source:run.source,build:run.build};
      firstBuild[stage] ??= identity;
      assert.deepEqual(identity,firstBuild[stage],stage + ' runs used different builds');
      assert.deepEqual(run.viewport,[width,height]);
      assert.deepEqual(run.errors,[]);
      const files = readdirSync(new URL(dir,root)).filter(name => name.endsWith('.png')).sort();
      const frames = {};
      for(const path of files) {
        const png = read(dir+path);
        assert.equal(png.readUInt32BE(16),width,path);
        assert.equal(png.readUInt32BE(20),height,path);
        frames[path] = digest(png);
      }
      pair[stage] = {source:run.source,build:run.build,frames};
    }
    assert.deepEqual(Object.keys(pair.before.frames), Object.keys(pair.after.frames));
    assert.ok(Object.keys(pair.before.frames).length >= (level === 'holding-pier' ? 7 : 5));
    assert.notEqual(pair.before.source,pair.after.source);
    manifest[key] = pair;
  }
}
const film = JSON.parse(read('after/390x844/MEDIA.json'));
assert.deepEqual({source:film.runtimeSource,build:film.productionBuild},firstBuild.after);
assert.equal(digest(read('after/390x844/'+film.video)),film.sha256);
assert.ok(film.decodedFrameCount > 0 && film.decodedFrameCount === film.sourceFrameCount);
assert.equal(film.fullDecode,'passed');
writeFileSync(new URL('frames.json',root),JSON.stringify(manifest,null,2)+'\n');
console.log('Verified all four matched before/after sets, native dimensions and final film identity.');
