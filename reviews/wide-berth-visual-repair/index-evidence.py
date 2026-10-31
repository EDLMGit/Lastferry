import hashlib
import json
import struct
import subprocess
from datetime import datetime, timezone
from pathlib import Path

review = Path(__file__).resolve().parent
root = review.parents[1]
digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
runtime = sorted([p for folder in ['src', 'data'] for p in (root / folder).rglob('*') if p.is_file()] + [root / 'package.json', root / 'package-lock.json'])
identity = {p.relative_to(root).as_posix(): digest(p) for p in runtime}
groups = {}
for folder in ['final-candidate', 'journey-final', 'lifecycle', 'production', 'launch-final', 'launch-baseline', 'baseline-overview']:
    directory = review / folder
    if not directory.exists():
        continue
    entries = []
    for p in sorted(directory.rglob('*')):
        if 'raw' in p.relative_to(directory).parts or p.suffix not in ['.png', '.jpg', '.mp4']:
            continue
        entry = {'path': p.relative_to(root).as_posix(), 'sha256': digest(p), 'bytes': p.stat().st_size}
        if p.suffix == '.png':
            entry['nativePixels'] = list(struct.unpack('>II', p.read_bytes()[16:24]))
        entries.append(entry)
    groups[folder] = entries
comparisons = []
for old, new in [
    ('reviews/wide-berth/close/390x844-six-spaces', 'final-candidate/390x844-full-wide-play'),
    ('reviews/wide-berth/chooser/390x844-five-bodies', 'final-candidate/390x844-five-shell-play'),
    ('reviews/wide-berth/chooser/390x844-six-ashore', 'final-candidate/390x844-six-ashore-play'),
]:
    a, b = root / (old + '.json'), review / (new + '.json')
    if not b.exists():
        continue
    before, after = json.loads(a.read_text()), json.loads(b.read_text())
    comparisons.append({'baseline': old + '.png', 'candidate': (review / (new + '.png')).relative_to(root).as_posix(), 'stateIdentical': before['state'] == after['state'], 'viewport': [390, 844], 'mode': 'released Play / Back to boat', 'baselineSource': '45ab9768792ddd3a8dffb67da6c332f8fe2234ff retains the prior source-indexed capture', 'framing': 'Intentional geometry and local phone framing changes; no cropping or developer-only camera.'})
checks = {}
for folder in ['final-candidate', 'journey-final', 'lifecycle']:
    directory = review / folder
    a, b = directory / 'source-before.json', directory / 'source-after.json'
    if a.exists() and b.exists():
        before, after = json.loads(a.read_text()), json.loads(b.read_text())
        checks[folder] = {'beforeAfterEqual': before['files'] == after['files'], 'matchesCurrentRuntime': after['files'] == identity, 'runtimeFiles': len(identity)}
output = {'at': datetime.now(timezone.utc).isoformat(), 'baseline': '45ab9768792ddd3a8dffb67da6c332f8fe2234ff', 'headAtPackaging': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip(), 'runtime': identity, 'captureSourceChecks': checks, 'matchedPairs': comparisons, 'media': groups, 'limits': 'Native browser emulation/software rendering, not physical Android or human acceptance. Held launch composition frames retain their earlier exact working-tree hashes; unchanged painter/registry support bounded reuse. Normal-motion recordings are separate. No concept image is gameplay evidence.'}
(review / 'MEDIA.json').write_text(json.dumps(output, indent=2) + '\n', encoding='utf-8')
print(json.dumps({'runtimeFiles': len(identity), 'mediaFiles': sum(len(v) for v in groups.values()), 'captureSourceChecks': checks, 'matchedStates': [c['stateIdentical'] for c in comparisons]}))
