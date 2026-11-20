import argparse
import hashlib
import json
import os
import re
import subprocess
from pathlib import Path
from zipfile import ZipFile


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def capture(*args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout


parser = argparse.ArgumentParser(description="Check the Android update against the private v0.1.2 APK and the web build.")
for name in ["previous", "apk", "web", "out"]:
    parser.add_argument("--" + name, required=True, type=Path)
parser.add_argument("--source", required=True)
args = parser.parse_args()
tools = Path(os.environ["ANDROID_HOME"]) / "build-tools/36.0.0"
exe = ".exe" if os.name == "nt" else ""
java = Path(os.environ["JAVA_HOME"]) / "bin" / ("java" + exe)
baseline = json.loads(Path("reviews/android-playtest/package/handoff.json").read_text())


def package(path, version):
    badging = capture(tools / ("aapt2" + exe), "dump", "badging", path)
    identity = re.search(r"^package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'", badging)
    assert identity.groups() == (baseline["identity"], str(version), f"0.1.{version}-playtest")
    assert not re.search(r"^uses-permission", badging, re.MULTILINE)
    signing = capture(java, "-jar", tools / "lib/apksigner.jar", "verify", "--verbose", "--print-certs", path)
    fingerprint = re.search(r"certificate SHA-256 digest: ([0-9a-f]{64})", signing)[1]
    assert fingerprint == baseline["signingCertificateSHA256"]
    capture(tools / ("zipalign" + exe), "-c", "-P", "16", "4", path)
    return {"package": identity[1], "versionCode": version, "versionName": identity[3],
            "certificateSHA256": fingerprint, "apkSHA256": sha256(path.read_bytes()),
            "bytes": path.stat().st_size, "permissions": [], "zipAlignment": "passed"}


previous = package(args.previous, 2)
assert previous["apkSHA256"] == next(p["sha256"] for p in baseline["privateCopies"] if "0.1.2-playtest.apk" in p["file"])
update = package(args.apk, 3)
web = {p.relative_to(args.web).as_posix(): sha256(p.read_bytes()) for p in args.web.rglob("*") if p.is_file()}
with ZipFile(args.apk) as archive:
    assert archive.testzip() is None
    files = [p for p in archive.namelist() if p.startswith("assets/") and not p.endswith("/")]
    assert len(files) == len(set(files)) == len(web)
    assert {p[7:]: sha256(archive.read(p)) for p in files} == web
    assert "index.html" in web and any(p.endswith(".js") for p in web)
subprocess.run(["git", "diff", "--quiet", args.source, "--", "src", "android", "assets", "data",
                "package.json", "package-lock.json", "vite.config.ts", "index.html"], check=True)
args.out.write_text(json.dumps({"apkSource": args.source, "previous": previous, "update": update,
                                "matchingMinifiedWebFiles": web}, indent=2) + "\n", encoding="utf-8")
