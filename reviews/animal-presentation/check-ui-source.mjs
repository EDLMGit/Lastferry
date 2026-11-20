import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = 'reviews/animal-presentation';
const base = process.env.ANIMAL_COMPONENT_URL ?? 'http://127.0.0.1:5326';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const read = name => JSON.parse(readFileSync(join(root, name), 'utf8'));
const source = read('components/fixtures/six-neighbor-source.json').source;
const manifest = read('components/source/' + source + '.json');
const gallery = read('gallery/measurements.json');
const pngs = {};
for (const profile of ['choice', 'arrival']) {
  for (const key of ['rabbit-cream','rabbit-tan','sheep-wool','beaver-brown','deer-chestnut']) {
    const path = 'assets/portraits/' + profile + '/' + key + '.png';
    const response = await fetch(base + '/' + path);
    const expected = hash(readFileSync(path));
    if (!response.ok || hash(Buffer.from(await response.arrayBuffer())) !== expected ||
      manifest.inputs[path] !== expected || gallery.source.files[path] !== expected) throw Error('Source mismatch: ' + path);
    pngs[path] = expected;
  }
}
const captures = [];
for (const directory of ['components/choices', 'components/fixtures', 'gallery']) {
  for (const file of readdirSync(join(root, directory)).filter(name => name.endsWith('.png')).sort()) {
    const relative = directory + '/' + file;
    const bytes = readFileSync(join(root, relative));
    captures.push({ path: relative, kind: directory.endsWith('choices') ? 'actual Wide Berth' : 'renderer or gallery specimen',
      width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), sha256: hash(bytes) });
  }
}
writeFileSync(join(root,'UI_EVIDENCE.json'), JSON.stringify({ guidance: manifest.head, componentInputs: source,
  galleryInputs: gallery.source.hash, browser: manifest.browser, node: process.version, deviceScaleFactor: 1,
  derivativesVerifiedOverHTTP: pngs, captures }, null, 2) + '\n');
console.log(source, Object.keys(pngs).length + ' HTTP/source matches', captures.length + ' images');
