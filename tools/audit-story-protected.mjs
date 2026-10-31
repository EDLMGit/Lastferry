import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const base = '1a85874883af5caa59f6294a75495eccf2afebbc';
const git = (...args) => execFileSync('git', args, { maxBuffer: 64 * 1024 * 1024 });
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const names = git('ls-tree', '-r', '--name-only', base).toString('utf8').trim().split('\n').filter((name) => /^(src\/|data\/|assets\/|cove-(?:ui|panel|portrait)-package\/)/.test(name) || ['package.json', 'package-lock.json', 'index.html', 'vite.config.ts', 'tsconfig.json', '.nvmrc'].includes(name));
const expected = {
  'src/main.ts': 'Journey entrance, explicit checkpoint continuation, same app/dialog/audio owner, managed World remount and title/settings integration.',
  'src/scene/world.ts': 'Opt-in story composition fit; normal gameplay frame calculation preserved and restored when disabled.',
  'src/dev/asset-gallery.ts': 'Development-only title/story specimen integration.',
  'assets/catalog.json': 'Existing-family consumer/evidence updates and one implemented story presentation family.',
  'index.html': 'Document title updated to Last Ferry for the journey entrance.',
};
const input = Buffer.from(names.map((name) => `${base}:${name}\n`).join(''));
const batch = execFileSync('git', ['cat-file', '--batch'], { input, maxBuffer: 64 * 1024 * 1024 });
let cursor = 0;
const entries = names.map((name) => {
  const lineEnd = batch.indexOf(10, cursor);
  const header = batch.subarray(cursor, lineEnd).toString('utf8');
  const size = Number(header.split(' ')[2]);
  const before = batch.subarray(lineEnd + 1, lineEnd + 1 + size);
  cursor = lineEnd + 1 + size + 1;
  const exists = fs.existsSync(name);
  const after = exists ? fs.readFileSync(name) : Buffer.alloc(0);
  const binary = before.includes(0) || after.includes(0);
  const normalizedBefore = binary ? before : Buffer.from(before.toString('utf8').replaceAll('\r\n', '\n'));
  const normalizedAfter = binary ? after : Buffer.from(after.toString('utf8').replaceAll('\r\n', '\n'));
  const rawEqual = exists && before.equals(after);
  const newlineOnly = !rawEqual && exists && !binary && normalizedBefore.equals(normalizedAfter);
  const status = rawEqual ? 'byte-identical' : newlineOnly ? 'newline-only' : exists ? 'modified' : 'missing';
  return { path: name, status, baseBytes: before.length, workingBytes: after.length, baseSha256: sha(before), workingSha256: sha(after), normalizedBaseSha256: sha(normalizedBefore), normalizedWorkingSha256: sha(normalizedAfter), expectedModification: expected[name] ?? null };
});
const changed = entries.filter((entry) => ['modified', 'missing'].includes(entry.status));
const unexpected = changed.filter((entry) => !entry.expectedModification);
const group = (predicate) => {
  const selected = entries.filter((entry) => predicate(entry.path));
  return { count: selected.length, byteIdentical: selected.filter((entry) => entry.status === 'byte-identical').length, newlineOnly: selected.filter((entry) => entry.status === 'newline-only').length, modified: selected.filter((entry) => entry.status === 'modified').map((entry) => entry.path), missing: selected.filter((entry) => entry.status === 'missing').map((entry) => entry.path) };
};
const report = {
  schema: 1,
  generatedAt: new Date().toISOString(),
  base,
  workingHead: git('rev-parse', 'HEAD').toString().trim(),
  branch: git('branch', '--show-current').toString().trim(),
  scope: 'Every pre-existing src/, data/, assets/, cove-ui-package/, cove-panel-package/, cove-portrait-package/ file plus dependency and build configuration files. New story sources are identified separately by the final source manifest.',
  method: 'Read baseline Git blobs with git cat-file --batch; compare current filesystem bytes and SHA-256. Text differences accepted as newline-only only when CRLF-to-LF normalization makes bytes identical. Binary files require exact bytes. No runtime execution or gameplay state injection.',
  counts: { total: entries.length, byteIdentical: entries.filter((entry) => entry.status === 'byte-identical').length, newlineOnly: entries.filter((entry) => entry.status === 'newline-only').length, expectedModified: changed.filter((entry) => entry.expectedModification).length, unexpectedModified: unexpected.length },
  protectedGroups: {
    puzzleData: group((name) => name.startsWith('data/')),
    rulesAndSessions: group((name) => /^src\/game\//.test(name)),
    audio: group((name) => name.startsWith('src/audio/')),
    acceptedUiModulesAndStyles: group((name) => name.startsWith('src/ui/') || name === 'src/style.css'),
    acceptedAssetPackages: group((name) => /^cove-(?:ui|panel|portrait)-package\//.test(name)),
    portraitPngs: group((name) => /^cove-portrait-package\/portraits\/.*\.png$/.test(name)),
    dependencyAndBuildConfiguration: group((name) => ['package.json', 'package-lock.json', 'vite.config.ts', 'tsconfig.json', '.nvmrc'].includes(name)),
    acceptedWaterWakeTimingLighthouse: group((name) => /^src\/scene\/(?:water|effects|models|contact|transitions|motion|poses|deck-transfer|shore|scenery|layout|homecoming|paths|view)\.ts$/.test(name)),
  },
  changedPaths: changed,
  unexpectedChanges: unexpected,
  result: unexpected.length ? 'fail: unexpected protected changes' : 'pass: all protected files retain their baseline content; only enumerated scoped files changed',
  limits: 'A source identity audit does not establish physical Android, audio listening, visual acceptance or unchanged performance. Actual UI sequences and framing assertions are reported separately.',
  entries,
};
fs.mkdirSync('reviews/story-foundation', { recursive: true });
fs.writeFileSync('reviews/story-foundation/protected-source-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ result: report.result, counts: report.counts, protectedGroups: report.protectedGroups, changedPaths: changed.map((entry) => entry.path) }, null, 2));
