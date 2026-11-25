"""Shorten the middle of a continuous Android recording, retaining both decisions at real speed."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("original", type=Path)
parser.add_argument("start_fast", type=float)
parser.add_argument("end_fast", type=float)
parser.add_argument("--speed", type=int, default=4)
parser.add_argument("--output", type=Path, default=Path("reviews/moss-invitation/android-offer-to-bellwater.mp4"))
args = parser.parse_args()
run = json.loads(Path("reviews/moss-invitation/android-film.json").read_text(encoding="utf-8"))
assert run["passed"] and args.speed >= 2
assert hashlib.sha256(args.original.read_bytes()).hexdigest() == run["originalRecording"]["sha256"]


def describe(path):
    output = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0",
                                      "-show_entries", "stream=codec_name,width,height:format=duration",
                                      "-of", "json", str(path)], text=True)
    return json.loads(output)


original = describe(args.original)
duration = float(original["format"]["duration"])
assert 0 < args.start_fast < args.end_fast < duration
filters = (
    "[0:v]split=3[opening][crossing][ending];"
    f"[opening]trim=end={args.start_fast},setpts=PTS-STARTPTS[a];"
    f"[crossing]trim=start={args.start_fast}:end={args.end_fast},setpts=(PTS-STARTPTS)/{args.speed},"
    f"drawtext=font=Arial:text='Voyage at {args.speed}x':fontsize=27:fontcolor=white:"
    "box=1:boxcolor=black@0.65:boxborderw=5:x=(w-text_w)/2:y=7[b];"
    f"[ending]trim=start={args.end_fast},setpts=PTS-STARTPTS[c];"
    "[a][b][c]concat=n=3:v=1:a=0,fps=24,scale=1560:640:flags=lanczos[out]"
)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(args.original), "-filter_complex_threads", "2",
                "-filter_complex", filters, "-map", "[out]", "-an", "-c:v", "libx264", "-threads", "2",
                "-preset", "veryfast", "-crf", "19", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                str(args.output)], check=True)
edited = describe(args.output)
assert abs(float(edited["format"]["duration"]) - (duration-(args.end_fast-args.start_fast)*(1-1/args.speed))) < 0.6
receipt = {"file": args.output.name, "sha256": hashlib.sha256(args.output.read_bytes()).hexdigest(),
           "bytes": args.output.stat().st_size, "video": edited, "original": original,
           "originalSHA256": run["originalRecording"]["sha256"], "acceleratedIntervalSeconds":
           [args.start_fast, args.end_fast], "middleSpeed": args.speed}
args.output.with_name("android-short-film.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
