import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
const root = new URL('../', import.meta.url);
const digest = (value) => createHash('sha256').update(value).digest('hex');
function walk(dir) {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(`${dir}${e.name}/`) : [`${dir}${e.name}`],
  );
}
const paths = [
  ...walk('src/'),
  ...walk('tests/'),
  ...walk('data/'),
  'index.html',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'playwright.config.ts',
  '.nvmrc',
  'AGENTS.md',
  'FIRST_TASK.md',
  'docs/GAMEPLAY_RULES.md',
  'docs/FIRST_COVE.md',
  'docs/ART_DIRECTION.md',
  'docs/TECHNICAL_PLAN.md',
  'docs/ASSET_LEDGER.md',
  'tools/snapshot-evidence.mjs',
].sort();
const files = Object.fromEntries(paths.map((p) => [p, digest(readFileSync(new URL(p, root)))]));
const sourceHash = digest(JSON.stringify(files));
const target = new URL('reviews/m1/source-manifest.json', root);
if (!process.argv.includes('--finalize')) {
  writeFileSync(
    target,
    JSON.stringify(
      {
        source: 'No commit yet; directory is not a Git repository.',
        snapshotTime: new Date().toISOString(),
        hashAlgorithm: 'SHA-256',
        sourceHash,
        files,
        scope:
          'Runtime, tests, dependencies, level data and authoritative instructions. Review reports, README and STATUS are metadata outside this hash.',
      },
      null,
      2,
    ),
  );
  console.log(`Source snapshot: ${paths.length} files, SHA-256 ${sourceHash}`);
} else {
  const stored = JSON.parse(readFileSync(target, 'utf8'));
  if (stored.sourceHash !== sourceHash)
    throw new Error(
      'Tested source changed after the snapshot. Repeat affected checks and captures.',
    );
  const captures = readdirSync(new URL('reviews/m1/', root))
    .filter((n) => n.endsWith('.png'))
    .map((name) => {
      const path = `reviews/m1/${name}`,
        p = new URL(path, root),
        b = readFileSync(p);
      return {
        path,
        captureTime: statSync(p).mtime.toISOString(),
        sha256: digest(b),
        viewport: [b.readUInt32BE(16), b.readUInt32BE(20)],
        input: name.startsWith('phone-')
          ? 'Chromium emulated touch'
          : name === 'portrait.png'
            ? 'Mouse, portrait and reduced motion'
            : 'Mouse; keyboard tested separately',
        method: 'Playwright screenshot of the actual WebGL application',
      };
    });
  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  writeFileSync(
    new URL('reviews/m1/capture-manifest.json', root),
    JSON.stringify(
      {
        sourceHash,
        sourceManifest: 'source-manifest.json',
        sourceUnchangedSinceSnapshot: true,
        generatedAt: new Date().toISOString(),
        environment: {
          os: os.version(),
          release: os.release(),
          arch: os.arch(),
          node: process.version,
          dependencies: pkg.dependencies,
          devDependencies: pkg.devDependencies,
          renderer:
            'Chromium with SwiftShader software WebGL; no physical device or native GPU performance claim',
        },
        captures,
        videos: ['reviews/m1/raw/desktop-rescue.webm', 'reviews/m1/raw/phone-rescue.webm'].map(
          (path) => ({
            path,
            sha256: digest(readFileSync(new URL(path, root))),
            mtime: statSync(new URL(path, root)).mtime.toISOString(),
            edited: false,
            sourceHash,
          }),
        ),
      },
      null,
      2,
    ),
  );
  console.log(
    `Source unchanged; ${captures.length} gameplay screenshots and two unedited recordings recorded.`,
  );
}
