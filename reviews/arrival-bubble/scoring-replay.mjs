import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { extname } from 'node:path';
import { fileURLToPath } from 'node:url';

registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && !extname(specifier) && context.parentURL &&
    existsSync(fileURLToPath(new URL(specifier + '.ts', context.parentURL))))
    return next(specifier + '.ts', context);
  return next(specifier, context);
} });

const { Session } = await import('../../src/game/session.ts');
const { ternhaven } = await import('../../src/levels/level.ts');
const { masteryTargets } = await import('../../src/game/mastery.ts');
const plans = JSON.parse(readFileSync('data/ternhaven/witnesses.json', 'utf8'));
const play = (session, actions) => {
  for (const action of actions) {
    if (!session.commit(action)) throw new Error('Unexpected rejected witness action');
    session.finish();
  }
};
const replays = plans.witnesses.map(plan => {
  const session = new Session(ternhaven);
  play(session, plan.actions);
  const initialRescueResult = session.result;
  if (session.state.status !== 'won' || initialRescueResult?.lanterns !== 3)
    throw new Error('Accepted witness did not earn all three lanterns');
  const before = structuredClone(session.state);
  if (!session.undo() || session.result !== null) throw new Error('Terminal Undo did not withdraw result');
  play(session, plan.actions.slice(-1));
  const resultAfterTerminalUndoAndRedelivery = session.result;
  if (JSON.stringify(session.state) !== JSON.stringify(before) ||
    resultAfterTerminalUndoAndRedelivery?.lanterns !== 2 || session.successfulUndos !== 1)
    throw new Error('Redelivery changed the puzzle or omitted successful Undo');
  const accepted = session.takeResult();
  if (session.takeResult() !== null) throw new Error('Accepted result was offered twice');
  return { id: plan.id, initialRescueResult, resultAfterTerminalUndoAndRedelivery,
    accepted, secondAcceptance: null, finalPuzzleStateRestored: true };
});
const paths = ['src/game/mastery.ts', 'src/game/session.ts', 'src/game/rules.ts', 'src/levels/level.ts',
  'data/ternhaven.level.json', 'data/ternhaven/witnesses.json', 'reviews/arrival-bubble/scoring-replay.mjs'];
const sources = Object.fromEntries(paths.map(path => [path,
  createHash('sha256').update(readFileSync(path)).digest('hex')]));
const protectedPaths = ['data', 'reviews/cove-eight-practice/audit.mjs',
  'reviews/cove-eight-practice/audit-results.json', 'reviews/cove-eight-practice/INDEPENDENT_AUDIT_RESULTS.json'];
const changedProtectedFiles = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', ...protectedPaths], { encoding: 'utf8' }).trim();
if (changedProtectedFiles) throw new Error('Protected puzzle or historical proof changed: ' + changedProtectedFiles);
console.log(JSON.stringify({ node: process.version, baseHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sources, target: masteryTargets.ternhaven, protectedPuzzleAndHistoricalAuditFilesUnchanged: true,
  proof: { retained: 'reviews/cove-eight-practice/INDEPENDENT_AUDIT_RESULTS.json', newPuzzleSearchRun: false },
  replays }, null, 2));
