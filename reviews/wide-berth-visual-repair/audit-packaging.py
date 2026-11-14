import hashlib
import json
import subprocess
import sys
from pathlib import Path

review = Path(__file__).resolve().parent
root = review.parents[1]
commit = sys.argv[1]
media = json.loads((review / 'MEDIA.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
normal = lambda data: data.replace(b'\r\n', b'\n')
git = lambda *args: subprocess.check_output(['git', *args], cwd=root)
runtime = []
for path, expected in media['runtime'].items():
    working = (root / path).read_bytes()
    committed = git('show', f'{commit}:{path}')
    runtime.append({'path': path, 'testedSha256': expected, 'workingMatchesTested': sha(working) == expected, 'committedSha256': sha(committed), 'match': 'exact' if committed == working else 'newline-only' if normal(committed) == normal(working) else 'MISMATCH'})
images = []
for group in media['media'].values():
    for item in group:
        data = git('show', f'{commit}:{item["path"]}')
        images.append({'path': item['path'], 'match': sha(data) == item['sha256']})
package = []
for p in sorted((root / 'LAST_FERRY_WIDE_BERTH_VISUAL_REPAIR_PACKAGE').rglob('*')):
    if p.is_file():
        path = p.relative_to(root).as_posix()
        original = root.parent / path
        data = git('show', f'{commit}:{path}')
        package.append({'path': path, 'originalExists': original.exists(), 'originalMatches': original.exists() and normal(original.read_bytes()) == normal(data)})
failures = [r['path'] for r in runtime if not r['workingMatchesTested'] or r['match'] == 'MISMATCH'] + [r['path'] for r in images if not r['match']] + [r['path'] for r in package if not r['originalMatches']]
result = {'implementationCommit': commit, 'baseline': media['baseline'], 'runtime': runtime, 'media': images, 'suppliedPackage': package, 'failures': failures, 'counts': {'runtime': len(runtime), 'byteExactRuntime': sum(r['match'] == 'exact' for r in runtime), 'newlineOnlyRuntime': sum(r['match'] == 'newline-only' for r in runtime), 'exactMedia': sum(r['match'] for r in images), 'packageInputs': len(package)}, 'scope': 'Implementation commit matches the actual tested working tree and selected source-indexed media. A subsequent metadata-only handoff commit may record this audit; its full final SHA is reported in PR1 and the handoff. No runtime, puzzle, asset or recording changes are implied by that metadata commit.'}
(review / 'packaging-audit.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'counts': result['counts'], 'failures': failures}))
if failures:
    raise SystemExit(1)
