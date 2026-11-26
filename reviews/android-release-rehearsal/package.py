"""Build a release AAB, sign it locally, and verify device-targeted APKs against v0.1.6.

Run from the Git root. JAVA_HOME, ANDROID_HOME and BUNDLETOOL point to tools.
REHEARSAL_KEYSTORE and REHEARSAL_PASSWORD_FILE point to private files outside
the checkout. Use a single local PKCS12 test key named last-ferry-local-rehearsal.
"""
import argparse
import hashlib
import io
import json
import os
import re
import shutil
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def contents(*command):
    return subprocess.check_output(command, encoding="utf-8", errors="replace")


def run(*command):
    subprocess.run(command, check=True)


def web_files(archive, prefix):
    files = [key for key in archive.namelist() if key.startswith(prefix) and not key.endswith("/")]
    require(len(files) == len(set(files)), "Duplicated bundled asset")
    return {key[len(prefix):]: digest(archive.read(key)) for key in files}


def file_record(path):
    return {"file": path.name, "bytes": path.stat().st_size, "sha256": digest(path.read_bytes())}


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("code", type=int)
parser.add_argument("--source", required=True)
parser.add_argument("--device-spec", required=True, type=Path)
parser.add_argument("--output", required=True, type=Path)
parser.add_argument("--signed-bundle", type=Path, help="Reuse a previously signed rehearsal AAB to target another device")
args = parser.parse_args()
source = contents("git", "rev-parse", "--verify", args.source + "^{commit}").strip()
runtime = ["android", "src", "assets", "data", "campaign", "cove-ui-package", "cove-panel-package",
           "index.html", "package.json", "package-lock.json", "vite.config.ts"]
run("git", "diff", "--quiet", source, "--", *runtime)
require(not contents("git", "ls-files", "--others", "--exclude-standard", "--", *runtime).strip(), "Unpinned input")
baseline = json.loads(Path("reviews/moss-invitation/android-package.json").read_text(encoding="utf-8"))
golden = baseline["matchingMinifiedWebFiles"]

exe = ".exe" if os.name == "nt" else ""
jdk = Path(os.environ["JAVA_HOME"]) / "bin"
sdk = Path(os.environ["ANDROID_HOME"]) / "build-tools/36.0.0"
java = jdk / ("java" + exe)
bundletool = [java, "-jar", Path(os.environ["BUNDLETOOL"]).resolve()]
aapt = sdk / ("aapt2" + exe)
jarsigner = jdk / ("jarsigner" + exe)
keytool = jdk / ("keytool" + exe)
keystore = Path(os.environ["REHEARSAL_KEYSTORE"]).resolve(strict=True)
pwfile = Path(os.environ["REHEARSAL_PASSWORD_FILE"]).resolve(strict=True)
dest = args.output.resolve()
require(all(not p.is_relative_to(Path.cwd()) and not p.is_relative_to(dest)
            for p in (keystore, pwfile)), "Keep signing inputs outside the checkout and artifact handoff")
alias = "last-ferry-local-rehearsal"
signer_args = ["-keystore", keystore, "-storepass:file", pwfile]
certificate = digest(subprocess.check_output([keytool, "-exportcert", *signer_args, "-alias", alias]))
require(certificate != baseline["certificateSHA256"], "Expected a distinct rehearsal signer")
device_spec = args.device_spec.resolve(strict=True)
name = "Last-Ferry-rehearsal-" + str(args.code)
package = "com.lastferry.playtest.rehearsal"
version = "0.1.6-rehearsal." + str(args.code)
dest.mkdir(parents=True, exist_ok=True)
outputs = [name + ".aab", name + ".apks", f"package-{args.code}.json"]
require(not any((dest / output).exists() for output in outputs), "Choose a fresh destination for this version")

with tempfile.TemporaryDirectory(dir=dest) as work:
    work = Path(work)
    aab = work / (name + ".aab")
    apks = work / (name + ".apks")
    if args.signed_bundle:
        prior = json.loads(Path(__file__).with_name(f"package-{args.code}.json").read_text(encoding="utf-8"))
        require(prior["source"] == source and prior["bundle"]["sha256"] == digest(args.signed_bundle.read_bytes()),
                "The supplied bundle differs from its pinned rehearsal receipt")
        shutil.copyfile(args.signed_bundle, aab)
    else:
        gradle = Path("android", "gradlew.bat" if os.name == "nt" else "gradlew").resolve()
        run(gradle, "-p", "android", ":app:bundleRelease", "-PrehearsalVersion=" + str(args.code), "--console=plain")
        unsigned = Path("android/app/build/outputs/bundle/release/app-release.aab")
        run(jarsigner, *signer_args, "-signedjar", aab, unsigned, alias)
    verified = contents(jarsigner, "-J-Duser.language=en", "-verify", "-strict", *signer_args, aab, alias)
    require("jar verified." in verified, "AAB signature verification failed")
    cert_info = contents(keytool, "-J-Duser.language=en", "-printcert", "-jarfile", aab)
    bundle_certs = re.findall(r"SHA256: ([0-9A-F:]+)", cert_info)
    require([c.replace(":", "").lower() for c in bundle_certs] == [certificate], "AAB signer mismatch")
    run(*bundletool, "validate", "--bundle=" + str(aab))
    with ZipFile(aab) as archive:
        require(web_files(archive, "base/assets/") == golden, "AAB game differs from v0.1.6")
        require(archive.testzip() is None, "AAB CRC failure")
    manifest = ET.fromstring(contents(*bundletool, "dump", "manifest", "--module=base", "--bundle=" + str(aab)))
    ns = "{http://schemas.android.com/apk/res/android}"
    app = manifest.find("application")
    require(manifest.get("package") == package and manifest.get(ns + "versionCode") == str(args.code)
            and manifest.get(ns + "versionName") == version, "Incorrect bundle identity")
    require(app.get(ns + "debuggable", "false") == "false" and app.get(ns + "testOnly", "false") == "false"
            and app.get(ns + "allowBackup") == "false" and app.get(ns + "usesCleartextTraffic") == "false",
            "Incorrect release flags")
    require(not any(el.tag.startswith("uses-permission") for el in manifest), "Unexpected permission")
    run(*bundletool, "build-apks", "--bundle=" + str(aab), "--output=" + str(apks),
        "--device-spec=" + str(device_spec), "--aapt2=" + str(aapt), "--ks=" + str(keystore),
        "--ks-key-alias=" + alias, "--ks-pass=file:" + str(pwfile), "--key-pass=file:" + str(pwfile))

    installed_files = {}
    splits = []
    with ZipFile(apks) as archive:
        require(archive.testzip() is None, "APK set CRC failure")
        for entry in sorted(s for s in archive.namelist() if s.endswith(".apk")):
            apk = work / Path(entry).name
            data = archive.read(entry)
            apk.write_bytes(data)
            signatures = contents(java, "-jar", sdk / "lib/apksigner.jar", "verify", "--verbose", "--print-certs", apk)
            require(re.findall(r"certificate SHA-256 digest: ([0-9a-f]{64})", signatures) == [certificate],
                    "APK signer mismatch: " + entry)
            run(sdk / ("zipalign" + exe), "-c", "-P", "16", "4", apk)
            badging = contents(aapt, "dump", "badging", apk)
            require(f"name='{package}' versionCode='{args.code}'" in badging, "Incorrect split identity")
            # Config splits inherit the base target SDK. Isolated 'dump badging'
            # guesses SDK 1 for them and invents compatibility permissions.
            tree = contents(aapt, "dump", "xmltree", apk, "--file", "AndroidManifest.xml")
            require("E: uses-permission" not in tree, "Unexpected permission in " + entry)
            record = {"entry": entry, "bytes": len(data), "sha256": digest(data), "certificateSHA256": certificate}
            if entry == "splits/base-master.apk":
                require(not re.search(r"^uses-permission|^application-debuggable", badging, re.MULTILINE),
                        "Unexpected effective base capability")
                require(f"versionName='{version}'" in badging and "application-label:'Last Ferry Rehearsal'" in badging,
                        "Incorrect delivered app name/version")
                require("launchable-activity: name='com.lastferry.playtest.MainActivity'" in badging, "Incorrect entry point")
            with ZipFile(io.BytesIO(data)) as split:
                files = web_files(split, "assets/")
                require(not installed_files.keys() & files.keys(), "Duplicate game file across targeting splits")
                installed_files.update(files)
            record["gameFiles"] = len(files)
            splits.append(record)
    require(any(s["entry"] == "splits/base-master.apk" for s in splits), "Missing targeted base APK")
    require(installed_files == golden, "Targeted APK game differs from v0.1.6")
    receipt = {"source": source, "reviewedGameSource": baseline["apkSource"],
               "deviceSpecSHA256": digest(device_spec.read_bytes()), "bundletoolVersion": contents(*bundletool, "version").strip(),
               "package": package, "label": "Last Ferry Rehearsal", "versionCode": args.code, "versionName": version,
               "manifest": {"debuggable": False, "testOnly": False, "allowBackup": False, "usesCleartextTraffic": False,
                            "permissions": [], "targetSdk": int(manifest.find("uses-sdk").get(ns + "targetSdkVersion")),
                            "minSdk": int(manifest.find("uses-sdk").get(ns + "minSdkVersion"))},
               "bundle": {**file_record(aab), "certificateSHA256": certificate, "jarsignerStrict": "passed",
                          "bundletoolValidate": "passed"},
               "targetedSet": {**file_record(apks), "apks": splits, "zipAlignment": "passed"},
               "matchingMinifiedWebFiles": golden}
    receipt_path = work / f"package-{args.code}.json"
    receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    for path in (aab, apks, receipt_path):
        shutil.move(str(path), str(dest / path.name))
    print(f"Verified {name}: {len(splits)} APK(s), {len(golden)} matching web files")
