import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const directory = process.argv[2] ?? 'reviews/reef-return/phone';
const name = 'reef-rescue';
const recording = JSON.parse(readFileSync(`${directory}/${name}-recording.json`, 'utf8'));
const frames = recording.frames.toSorted((a, b) => a.timestamp - b.timestamp);
if (frames.length < 2 || !recording.audio) throw Error('The recording needs both native frames and runtime audio.');
const timeline = ['ffconcat version 1.0'];
for (const [index, frame] of frames.entries()) {
  const path = resolve(frame.path).replaceAll('\\', '/').replaceAll("'", "'\\''");
  timeline.push(`file '${path}'`, 'option framerate 1000');
  const next = frames[index + 1];
  if (!next) break;
  const duration = next.timestamp - frame.timestamp;
  if (duration < 0.001) throw Error('Adjacent screen frames have indistinguishable timestamps.');
  timeline.push(`duration ${duration}`);
}
const list = `${directory}/raw/${name}/frames.ffconcat`;
writeFileSync(list, timeline.join('\n') + '\n');
const offset = frames[0].timestamp - recording.audioStartEpochMs / 1000;
if (Math.abs(offset) > 3) throw Error('Audio and picture clocks need inspection.');
const output = `${directory}/${name}.mp4`;
const args = ['-nostdin', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list,
  ...(offset > 0 ? ['-ss', String(offset)] : []), '-i', recording.audio,
  ...(offset < 0 ? ['-af', `adelay=${Math.round(-offset * 1000)}:all=1`] : []),
  '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
  '-pix_fmt', 'yuv420p', '-fps_mode', 'vfr', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', output];
execFileSync('ffmpeg', args, { stdio: 'inherit' });
const probe = JSON.parse(execFileSync('ffprobe', ['-v','error','-show_streams','-show_format','-of','json',output], { encoding:'utf8' }));
const video = probe.streams.find(s => s.codec_type === 'video');
const audio = probe.streams.find(s => s.codec_type === 'audio');
if (Number(video.nb_frames) !== frames.length || !audio) throw Error('Encoding lost frames or audio.');
execFileSync('ffmpeg', ['-nostdin','-v','error','-i',output,'-f','null','-'], { stdio:'inherit' });
const digest = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const evidence = {
  sha256: digest(output), runtimeAudioSha256: digest(recording.audio), frames: frames.length,
  width: video.width, height: video.height, seconds: Number(probe.format.duration),
  audio: { codec: audio.codec_name, channels: audio.channels, sampleRate: Number(audio.sample_rate), syncOffsetSeconds: offset },
  timestampSpanSeconds: frames.at(-1).timestamp - frames[0].timestamp,
  source: 'All captured frames, at native presentation timestamps. Original Sound capture stream. Audio aligned to the first picture, encoded at runtime gain. Full file decoded.',
};
writeFileSync(`${directory}/encoding.json`, JSON.stringify(evidence,null,2)+'\n');
console.log(evidence);
