"""Verify the new private APK against the shipped v3 receipt and independent web build."""
import argparse
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path
from zipfile import ZipFile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def output(*args):
    return subprocess.check_output(args, text=True)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("apk", type=Path)
parser.add_argument("previous_apk", type=Path)
parser.add_argument("source")
parser.add_argument("--web", type=Path, default=Path("dist"))
args = parser.parse_args()
baseline = json.loads(Path("reviews/android-cove-view/package.json").read_text())["update"]
assert digest(args.previous_apk.read_bytes()) == baseline["apkSHA256"]
source = output("git", "rev-parse", "--verify", args.source + "^{commit}").strip()
runtime = ["src", "android", "assets", "data", "package.json", "package-lock.json", "vite.config.ts", "index.html"]
subprocess.run(["git", "diff", "--quiet", source, "--", *runtime], check=True)
assert not output("git", "ls-files", "--others", "--exclude-standard", "--", *runtime).strip()

tools = Path(os.environ["ANDROID_HOME"]) / "build-tools/36.0.0"
exe = ".exe" if os.name == "nt" else ""
java = Path(os.environ["JAVA_HOME"]) / "bin" / ("java" + exe)
signing = output(java, "-jar", tools / "lib/apksigner.jar", "verify", "--verbose", "--print-certs", args.apk)
fingerprint = re.search(r"certificate SHA-256 digest: ([0-9a-f]{64})", signing)[1]
assert fingerprint == baseline["certificateSHA256"]
badging = output(tools / ("aapt2" + exe), "dump", "badging", args.apk)
identity = re.search(r"^package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'", badging).groups()
assert identity == (baseline["package"], "4", "0.1.4-playtest")
assert not re.search(r"^uses-permission", badging, re.MULTILINE)
subprocess.run([tools / ("zipalign" + exe), "-c", "-P", "16", "4", args.apk], check=True)
web = {p.relative_to(args.web).as_posix(): digest(p.read_bytes()) for p in sorted(args.web.rglob("*")) if p.is_file()}
with ZipFile(args.apk) as archive:
    assert archive.testzip() is None
    files = [p for p in archive.namelist() if p.startswith("assets/") and not p.endswith("/")]
    assert len(files) == len(set(files)) == len(web)
    assert {p[7:]: digest(archive.read(p)) for p in files} == web
    assert "index.html" in web and any(p.endswith(".js") for p in web)
receipt = {"apkSource": source, "package": identity[0], "versionCode": 4, "versionName": identity[2],
           "certificateSHA256": fingerprint, "apkSHA256": digest(args.apk.read_bytes()), "bytes": args.apk.stat().st_size,
           "previousApkSHA256": baseline["apkSHA256"], "permissions": [], "zipAlignment": "passed",
           "matchingMinifiedWebFiles": web}
Path("reviews/harbor-log/android-package.json").write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
