import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
const root = new URL('../', import.meta.url);
const option = (name) => {
  const i = process.argv.indexOf(name);
  return i < 0 ? undefined : process.argv[i + 1];
};
const reviewDir = option('--review-dir') ?? 'reviews/m1';
const captureDir = option('--captures-from') ?? reviewDir;
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const gitIdentity = () => {
  try {
    return {
      head: git('rev-parse', 'HEAD'),
      branch: git('branch', '--show-current'),
      comparisonBase: option('--base') ?? null,
      workingTree: git('status', '--porcelain=v1'),
    };
  } catch {
    return null;
  }
};
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
  ...(existsSync(new URL('NEXT_TASK.md', root)) ? ['NEXT_TASK.md'] : []),
  ...(existsSync(new URL('FOLLOWING_TASK_UI.md', root)) ? ['FOLLOWING_TASK_UI.md'] : []),
  ...(existsSync(new URL('NEXT_TASK_VICTORY.md', root)) ? ['NEXT_TASK_VICTORY.md'] : []),
  ...(existsSync(new URL('NEXT_TASK_HOMECOMING.md', root)) ? ['NEXT_TASK_HOMECOMING.md'] : []),
  ...(existsSync(new URL('NEXT_TASK_LIGHTHOUSE.md', root)) ? ['NEXT_TASK_LIGHTHOUSE.md'] : []),
  ...(existsSync(new URL('NEXT_TASK_WATER_MOTION.md', root)) ? ['NEXT_TASK_WATER_MOTION.md'] : []),
  'docs/GAMEPLAY_RULES.md',
  'docs/FIRST_COVE.md',
  'docs/ART_DIRECTION.md',
  'docs/TECHNICAL_PLAN.md',
  'docs/ASSET_LEDGER.md',
  ...(existsSync(new URL('docs/HOLDING_PIER.md', root)) ? ['docs/HOLDING_PIER.md'] : []),
  ...(existsSync(new URL('docs/BELLWATER.md', root)) ? ['docs/BELLWATER.md'] : []),
  ...(existsSync(new URL('docs/ENVIRONMENT.md', root)) ? ['docs/ENVIRONMENT.md'] : []),
  ...(existsSync(new URL('docs/AUDIO.md', root)) ? ['docs/AUDIO.md'] : []),
  'tools/snapshot-evidence.mjs',
  ...(existsSync(new URL('tools/capture-environment.mjs', root))
    ? ['tools/capture-environment.mjs']
    : []),
  ...(existsSync(new URL('tools/capture-atmosphere.mjs', root))
    ? ['tools/capture-atmosphere.mjs']
    : []),
  ...(existsSync(new URL('tools/compare-atmosphere-timing.mjs', root))
    ? ['tools/compare-atmosphere-timing.mjs']
    : []),
  ...walk('tools/').filter(
    (path) =>
      path.includes('refinement') ||
      path.includes('selection') ||
      path.includes('transfer') ||
      path.includes('audio-polish') ||
      path.includes('cove-interface') ||
      path.includes('cove-contrast') ||
      path.includes('victory-mix') ||
      path.includes('homecoming') ||
      path.includes('lighthouse-light') ||
      path.includes('water-motion'),
  ),
].sort();
const files = Object.fromEntries(paths.map((p) => [p, digest(readFileSync(new URL(p, root)))]));
const sourceHash = digest(JSON.stringify(files));
const target = new URL(`${reviewDir}/source-manifest.json`, root);
if (!process.argv.includes('--finalize')) {
  writeFileSync(
    target,
    JSON.stringify(
      {
        source: gitIdentity() ?? 'No commit yet; directory is not a Git repository.',
        snapshotTime: new Date().toISOString(),
        hashAlgorithm: 'SHA-256',
        sourceHash,
        files,
        scope:
          'Runtime, tests, dependencies, level data and authoritative instructions. Review reports, README, STATUS and docs/PROJECT_STATE are continuity metadata outside this hash.',
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
  const captures = readdirSync(new URL(`${captureDir}/`, root))
    .filter((n) => n.endsWith('.png') && !n.includes('prototype'))
    .map((name) => {
      const path = `${captureDir}/${name}`,
        p = new URL(path, root),
        b = readFileSync(p);
      return {
        path,
        captureTime: statSync(p).mtime.toISOString(),
        sha256: digest(b),
        sourceIdentity: stored.source,
        viewport: [b.readUInt32BE(16), b.readUInt32BE(20)],
        input:
          /^(desktop|phone)-(loading|loaded)\./.test(name) ||
          name.includes('keyboard-success') ||
          name.startsWith('baseline-')
            ? 'Keyboard: Tab, Shift+Tab, Enter and Escape'
            : name.startsWith('phone-') || name.startsWith('bellwater-phone-')
              ? 'Chromium emulated touch'
              : name === 'portrait.png'
                ? 'Mouse, portrait and reduced motion'
                : 'Mouse; keyboard tested separately',
        method: 'Playwright screenshot of the actual WebGL application',
      };
    });
  const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
  writeFileSync(
    new URL(`${reviewDir}/capture-manifest.json`, root),
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
        videos: [
          'desktop-rescue',
          'phone-rescue',
          'boarding-unloading',
          'boarding-unloading-closeup',
          'uninterrupted-rescue',
          'bellwater-uninterrupted',
        ]
          .map((name) => `${reviewDir}/raw/${name}.webm`)
          .filter((path) => existsSync(new URL(path, root)))
          .map((path) => ({
            path,
            sha256: digest(readFileSync(new URL(path, root))),
            mtime: statSync(new URL(path, root)).mtime.toISOString(),
            edited: path.includes('closeup'),
            transformation: path.includes('closeup')
              ? 'Spatial crop at 730,350, size 300x260, enlarged 3x; no temporal cuts. Derived from boarding-unloading.webm.'
              : null,
            sourceHash,
          })),
      },
      null,
      2,
    ),
  );
  console.log(
    `Source unchanged; ${captures.length} gameplay screenshots and available local recordings recorded.`,
  );
}
