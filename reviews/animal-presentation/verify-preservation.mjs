import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const base = 'd7884445c35fc24ebdabc2790b168b68294bf0bd';
const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trimEnd();
const scopes = ['data', 'src/game', 'src/levels', 'src/audio', 'src/campaign', 'src/scene',
  'src/ui/lanterns.ts', 'src/ui/lanterns.css', 'assets/ui/result-lantern.svg', 'package-lock.json',
  'NEXT_TASK_TERNHAVEN_JOURNEY.md', 'reviews/arrival-bubble/deployment-confirmation.json'];
const editable = new Set(['src/scene/models.ts']);
const unchanged = [];
const differences = [];
for (const line of git('ls-tree', '-r', base, '--', ...scopes).split('\n')) {
  const [info, path] = line.split('\t');
  if (editable.has(path)) continue;
  const expected = info.split(' ')[2];
  const actual = git('hash-object', '--path', path, path);
  if (actual !== expected) differences.push({ path, expected, actual });
  else unchanged.push({ path, blob: actual });
}
const factory = 'src/scene/models.ts';
const originalFactory = git('show', `${base}:${factory}`).replaceAll('\r\n', '\n');
const originalPrefix = originalFactory.split('export function animal(')[0].trimEnd();
const currentFactory = readFileSync(factory, 'utf8').replaceAll('\r\n', '\n');
const unchangedFactoryPrefix = currentFactory.includes(originalPrefix);
const endMarker = 'export function pine(';
const unchangedScenery = originalFactory.includes(endMarker) && currentFactory.slice(currentFactory.indexOf(endMarker)).trimEnd() === originalFactory.slice(originalFactory.indexOf(endMarker)).trimEnd();
const factoryPrefixSHA256 = createHash('sha256').update(originalPrefix).digest('hex');
console.log(JSON.stringify({ base, unchanged, differences, unchangedFactoryPrefix, unchangedScenery, factoryPrefixSHA256 }, null, 2));
if (differences.length || !unchangedFactoryPrefix || !unchangedScenery || !originalFactory.includes('export function animal(')) process.exitCode = 1;
