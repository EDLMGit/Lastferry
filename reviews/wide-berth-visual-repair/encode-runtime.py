import argparse
import hashlib
import json
import math
from datetime import datetime, timezone
from pathlib import Path
import shutil
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('manifest', type=Path)
parser.add_argument('--crf', type=int, default=25)
parser.add_argument('--plan-only', action='store_true')
args = parser.parse_args()
root = Path(__file__).resolve().parents[2]
review = Path(__file__).resolve().parent
manifest_path = args.manifest.resolve()
if not manifest_path.is_relative_to(review):
    raise ValueError('Recording must belong to this review directory.')
manifest = json.loads(manifest_path.read_text(encoding='utf-8-sig'))
frames = manifest['frames']
if len(frames) < 2:
    raise ValueError('At least two native timestamped frames are required.')
ordered = sorted(frames, key=lambda f: f['timestamp'])
times = [float(f['timestamp']) for f in ordered]
if not all(math.isfinite(t) for t in times):
    raise ValueError('Non-finite native timestamp.')
intervals = [b - a for a, b in zip(times, times[1:])]
if min(intervals) < 0.001:
    raise ValueError('Native timestamps repeat or need finer-than-millisecond encoding; inspect before encoding.')

def resolve_source(value):
    p = (root / value).resolve()
    if not p.is_relative_to(review) or not p.is_file():
        raise ValueError(f'Unavailable review source: {p}')
    return p

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write_json(path, data):
    path.write_text(json.dumps(data, indent=2) + '\n', encoding='utf-8')

def probe(path):
    return json.loads(subprocess.check_output([
        shutil.which('ffprobe') or 'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)
    ]))

sources = [resolve_source(f['path']) for f in ordered]
audio = resolve_source(manifest['audio'])
audio_probe = probe(audio)
audio_duration = float(audio_probe['format']['duration'])
offset = float(manifest['audioStartEpochMs']) / 1000 - times[0]
span = times[-1] - times[0]
duration = max(span + 0.05, offset + audio_duration)
name = manifest.get('name', manifest_path.stem.removesuffix('-recording'))
if Path(name).name != name:
    raise ValueError('Recording name must be a filename component.')
destination = manifest_path.parent
plan = destination / 'raw' / f'{name}-chronological.ffconcat'
plan.parent.mkdir(parents=True, exist_ok=True)
lines = ['ffconcat version 1.0']
for index, p in enumerate(sources):
    escaped = p.as_posix().replace("'", "'\\''")
    lines.extend([f"file '{escaped}'", 'option framerate 1000'])
    if index < len(intervals):
        lines.append(f'duration {intervals[index]:.9f}')
plan.write_text('\n'.join(lines) + '\n', encoding='utf-8')
output = destination / f'{name}.mp4'
viewport = manifest['viewport']
command = [
    shutil.which('ffmpeg') or 'ffmpeg', '-hide_banner', '-loglevel', 'warning', '-y',
    '-f', 'concat', '-safe', '0', '-i', str(plan),
    '-itsoffset', f'{offset:.9f}', '-i', str(audio),
    '-t', f'{duration:.9f}', '-map', '0:v:0', '-map', '1:a:0',
    '-fps_mode', 'vfr', '-enc_time_base', '1:1000', '-c:v', 'libx264', '-bf', '0',
    '-threads', '2', '-preset', 'medium', '-crf', str(args.crf),
    '-x264-params', 'fps=30/1:force-cfr=0',
    '-level:v', '3.1' if viewport['width'] * viewport['height'] <= 1280 * 720 else '4.2',
    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', str(output)
]
audit = {
    'at': datetime.now(timezone.utc).isoformat(),
    'manifest': manifest_path.relative_to(root).as_posix(),
    'manifestSha256': digest(manifest_path),
    'sourceViewport': viewport,
    'originalDeliveryBackwardEvents': sum(b['timestamp'] < a['timestamp'] for a, b in zip(frames, frames[1:])),
    'sourceFrames': len(frames),
    'nativeSpanSeconds': span,
    'audioOffsetSeconds': offset,
    'sourceAudioSeconds': audio_duration,
    'plannedContainerSeconds': duration,
    'lastFrameHoldForAudioSeconds': max(0, duration - span),
    'nativeIntervalsSeconds': {'min': min(intervals), 'max': max(intervals), 'mean': sum(intervals) / len(intervals)},
    'method': 'One uninterrupted actual recording. Native compositor timestamps sorted chronologically; every source frame retained. Millisecond encoder time base; no scene splice, scaling, speed change, gain adjustment, normalization or replacement audio. Negative audio preroll precedes the first video frame and is aligned away; full remaining source audio retained, with last picture held naturally through any audio tail. Sparse delivered frames are not native-device FPS.',
    'sourceAudio': {'path': audio.relative_to(root).as_posix(), 'sha256': digest(audio)},
    'orderedFrames': [{'path': p.relative_to(root).as_posix(), 'timestamp': f['timestamp'], 'sha256': digest(p)} for p, f in zip(sources, ordered)],
    'command': command,
}
audit_path = destination / f'{name}-encoding.json'
write_json(audit_path, audit)
if args.plan_only:
    print(json.dumps({'plan': str(plan), 'audit': str(audit_path), 'frames': len(frames), 'seconds': duration}))
    raise SystemExit(0)
with (destination / f'{name}-encode.txt').open('w', encoding='utf-8') as log:
    subprocess.run(command, stdout=log, stderr=subprocess.STDOUT, check=True)
encoded = probe(output)
write_json(destination / f'{name}-encoded-media.json', encoded)
video = next(s for s in encoded['streams'] if s['codec_type'] == 'video')
if int(video['nb_frames']) != len(frames):
    raise RuntimeError(f'Frame count changed: source {len(frames)}, encoded {video["nb_frames"]}. Output is not accepted.')
if video['width'] != viewport['width'] or video['height'] != viewport['height']:
    raise RuntimeError('Native dimensions changed; output is not accepted.')
decode_command = [shutil.which('ffmpeg') or 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-i', str(output), '-f', 'null', '-']
with (destination / f'{name}-decode.txt').open('w', encoding='utf-8') as log:
    subprocess.run(decode_command, stdout=log, stderr=subprocess.STDOUT, check=True)
audit['result'] = {
    'output': output.relative_to(root).as_posix(), 'sha256': digest(output),
    'bytes': output.stat().st_size, 'containerSeconds': float(encoded['format']['duration']),
    'encodedFrames': int(video['nb_frames']), 'fullDecode': 'pass',
    'browserPlayback': 'not yet checked', 'humanListening': 'not performed',
}
write_json(audit_path, audit)
print(json.dumps(audit['result']))
