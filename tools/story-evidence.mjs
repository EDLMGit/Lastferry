import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';

const dir = 'reviews/story-foundation';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const walk = path => readdirSync(path, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? walk(`${path}/${entry.name}`) : [`${path}/${entry.name}`]);
const paths = [...walk('src').filter(path => !path.startsWith('src/dev/')), ...walk('data'),
  ...walk('cove-ui-package'), ...walk('cove-panel-package'), ...walk('cove-portrait-package'),
  'index.html', 'package.json', 'package-lock.json', 'vite.config.ts'];
const files = Object.fromEntries(paths.sort().map(path => [path, hash(readFileSync(path))]));
const runtimeHash = hash(JSON.stringify(files));
if (process.argv.includes('--snapshot')) {
  writeFileSync(`${dir}/runtime-source.json`, JSON.stringify({
    at: new Date().toISOString(), head: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    workingTree: 'Reviewed baseline plus story working tree', runtimeHash, files,
    scope: 'Production runtime sources, unchanged production asset packages, level data and build dependencies. Gallery, tests and review metadata are separate.'
  }, null, 2));
  console.log(runtimeHash);
} else {
  const source = JSON.parse(readFileSync(`${dir}/runtime-source.json`));
  const changes = paths.filter(path => source.files[path] !== files[path]);
  const beforeGuard = readFileSync('src/main.ts', 'utf8').replace(
    "  if (next !== 'return-title') {\n    app.classList.add('journey-screen');\n    world.setStoryFraming(true);\n  }",
    "  app.classList.add('journey-screen');\n  world.setStoryFraming(true);"
  );
  if (changes.length !== 1 || changes[0] !== 'src/main.ts' || hash(beforeGuard) !== source.files['src/main.ts'])
    throw Error('Unexpected runtime difference from full sequence capture');
  writeFileSync(`${dir}/final-runtime-source.json`, JSON.stringify({
    at: new Date().toISOString(), runtimeHash, files,
    comparison: { earlier: 'runtime-source.json', changedPaths: changes, exactReversePatchMatchesEarlierHash: true,
      change: 'Return-to-title confirmation keeps normal game framing, so Cancel preserves manual pan. All other runtime bytes unchanged.',
      affectedEvidence: 'final-checks/', reusedEvidence: 'browser/ except original cold-fixture failure; full sequence never opens Return-to-title confirmation before its endpoint.' }
  }, null, 2));
  const captures = walk(`${dir}/browser`).filter(path => path.endsWith('.png')).map(path => {
    const bytes = readFileSync(path);
    return { path, at: statSync(path).mtime.toISOString(), sha256: hash(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20),
      method: 'Actual Playwright Chromium application screenshot at native DPR1 dimensions', runtimeHash: source.runtimeHash };
  });
  captures.push(...walk(`${dir}/final-checks`).filter(path => path.endsWith('.png')).map(path => {
    const bytes = readFileSync(path);
    return { path, at: statSync(path).mtime.toISOString(), sha256: hash(bytes), width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20),
      method: 'Actual Playwright Chromium application screenshot at native DPR1 dimensions', runtimeHash };
  }));
  const production = Object.fromEntries(walk('dist').map(path => [path, { bytes: statSync(path).size, sha256: hash(readFileSync(path)) }]));
  writeFileSync(`${dir}/evidence-manifest.json`, JSON.stringify({
    at: new Date().toISOString(), source: 'final-runtime-source.json', runtimeHash, fullSequenceRuntimeHash: source.runtimeHash,
    environment: { os: os.version(), release: os.release(), node: process.version, renderer: 'Chromium / SwiftShader, emulated touch and natural keyboard, no physical Android' },
    captures, production, note: 'Per-state JSON and browser results supply exact input and actions. Development runs remain separate, not relabeled as final.'
  }, null, 2));
  console.log(`${captures.length} native captures; exact full-sequence reuse and final runtime audited`);
}
