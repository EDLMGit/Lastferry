import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const baseCommit = '107b18adedc4f59202eb105a35c2d9676d2752ee';
const scopes = ['data', 'src/game/rules.ts', 'src/levels/level.ts', 'src/campaign', 'src/audio',
  'src/scene/story-staging.ts', 'src/scene/motion.ts', 'src/game/passenger-appearance.ts',
  'src/scene/ferry-profile.ts', 'src/scene/models.ts', 'src/game/session.ts',
  'src/scene/effects.ts', 'src/scene/contact.ts', 'src/scene/homecoming.ts',
  'src/scene/wake.ts', 'src/scene/water.ts', 'src/scene/water-shader.ts', 'src/scene/transitions.ts'];
const lines = execFileSync('git', ['ls-tree', '-r', '--full-tree', baseCommit, '--', ...scopes],
  { encoding: 'utf8' }).trim().split('\n');
const sources = lines.map(line => {
  const [metadata, path] = line.split('\t');
  const gitBlob = metadata.split(' ')[2];
  const workingTreeGitBlob = execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim();
  return { path, gitBlob, workingTreeGitBlob,
    sha256: createHash('sha256').update(readFileSync(path)).digest('hex'),
    unchanged: gitBlob === workingTreeGitBlob };
});
const changed = sources.filter(source => !source.unchanged);
const report = { baseCommit,
  description: 'Protected level/witness data, rules/Session/loader, campaign/story, audio, sailing/transfers, water/wake/contact, lighthouse/homecoming, identity and ferry/model source; normalized Git blobs compared with current working files.',
  scopes, files: sources.length, changed, sources };
writeFileSync('reviews/arrival-bubble/protected-source-manifest.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ files: sources.length, changed }, null, 2));
if (changed.length) process.exitCode = 1;
