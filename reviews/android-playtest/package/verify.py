import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
from xml.etree import ElementTree
from zipfile import ZipFile


def run(*command):
    return subprocess.run(command, check=True, capture_output=True, text=True).stdout.strip()


def sha(data):
    return hashlib.sha256(data).hexdigest()


def match(pattern, text):
    found = re.search(pattern, text, re.MULTILINE)
    assert found, pattern
    return found[1]


def verify_assets(path, prefix, expected):
    with ZipFile(path) as archive:
        assert archive.testzip() is None
        names = [entry.filename for entry in archive.infolist() if not entry.is_dir()]
        assert len(names) == len(set(names))
        packaged = {
            name[len(prefix):]: sha(archive.read(name))
            for name in names if name.startswith(prefix)
        }
        assert packaged == expected, {
            "missing": sorted(expected.keys() - packaged.keys()),
            "unexpected": sorted(packaged.keys() - expected.keys()),
            "mismatch": [name for name in expected.keys() & packaged.keys() if packaged[name] != expected[name]],
        }
        assert not any(name.lower().endswith((".keystore", ".jks", ".p12", ".pem")) for name in names)
        return {
            "artifact": path.name,
            "bytes": path.stat().st_size,
            "sha256": sha(path.read_bytes()),
            "matchingWebFiles": len(packaged),
            "dexFiles": {
                name.split("/")[-1]: sha(archive.read(name))
                for name in names if re.fullmatch(r"(?:base/dex/)?classes[0-9]*\.dex", name)
            },
        }


def verify_apk(path, code, options, expected):
    report = verify_assets(path, "assets/", expected)
    tool = options.build_tools
    badging = run(tool / ("aapt2" + suffix), "dump", "badging", path)
    assert match(r"^package: name='([^']+)'", badging) == package
    assert match(r"versionCode='([^']+)'", badging) == str(code)
    assert match(r"^minSdkVersion:'([^']+)'", badging) == "29"
    assert match(r"^targetSdkVersion:'([^']+)'", badging) == "36"
    assert match(r"^launchable-activity: name='([^']+)'", badging) == package + ".MainActivity"
    assert "application-debuggable" in badging
    assert not re.search(r"^uses-permission", badging, re.MULTILINE)
    signed = run(options.jdk / "bin" / ("java" + suffix), "-jar", tool / "lib" / "apksigner.jar",
                 "verify", "--verbose", "--print-certs", path)
    fingerprint = match(r"^Signer #1 certificate SHA-256 digest: ([0-9a-f]{64})", signed)
    assert match(r"^Number of signers: (\d+)", signed) == "1"
    run(tool / ("zipalign" + suffix), "-c", "-P", "16", "4", path)
    report.update({
        "applicationId": package, "versionCode": code,
        "versionName": match(r"versionName='([^']+)'", badging),
        "minSdk": 29, "targetSdk": 36,
        "permissions": [], "debuggable": True, "zipAlignment": "passed",
        "signerSHA256": fingerprint,
        "verifiedSignatureSchemes": re.findall(r"^Verified using (v[0-9.]+) scheme.*: true$", signed, re.MULTILINE),
    })
    return report


def verify_bundle(path, expected_version, options, expected):
    report = verify_assets(path, "base/assets/", expected)
    xml = run(options.jdk / "bin" / ("java" + suffix), "-jar", options.bundletool,
              "dump", "manifest", "--module=base", "--bundle=" + str(path))
    root = ElementTree.fromstring(xml)
    ns = "{http://schemas.android.com/apk/res/android}"
    application = root.find("application")
    sdk = root.find("uses-sdk")
    assert root.attrib["package"] == package
    assert root.attrib[ns + "versionCode"] == str(expected_version)
    assert sdk.attrib[ns + "targetSdkVersion"] == "36" and sdk.attrib[ns + "minSdkVersion"] == "29"
    assert application.attrib[ns + "debuggable"] == "true"
    assert application.attrib[ns + "hardwareAccelerated"] == "true"
    assert application.attrib[ns + "usesCleartextTraffic"] == "false"
    assert application.attrib[ns + "allowBackup"] == "false"
    assert application.find("activity").attrib[ns + "name"] == package + ".MainActivity"
    assert not any(e.tag.startswith("uses-permission") for e in root)
    verification = run(options.jdk / "bin" / ("jarsigner" + suffix), "-J-Duser.language=en",
                       "-verify", path)
    assert "jar is unsigned." in verification
    report.update({
        "applicationId": package, "versionCode": expected_version,
        "versionName": root.attrib[ns + "versionName"], "permissions": [],
        "minSdk": 29, "targetSdk": 36, "debuggable": True,
        "backupEnabled": False, "hardwareAccelerated": True, "cleartextAllowed": False,
        "jarSignature": "unsigned test bundle",
    })
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Compare both APKs and the test bundle to the independently built website.")
    for name in ["apk1", "apk2", "bundle", "dist", "build-tools", "jdk", "bundletool", "out"]:
        parser.add_argument("--" + name, type=Path, required=True)
    parser.add_argument("--commit", required=True)
    args = parser.parse_args()
    suffix = ".exe" if os.name == "nt" else ""
    package = "com.lastferry.playtest"
    source = run("git", "rev-parse", args.commit)
    run("git", "diff", "--quiet", source, "--", "android", "src", "data", "assets", "cove-ui-package",
        "cove-panel-package", "cove-portrait-package", "index.html", "package.json", "package-lock.json", "vite.config.ts")
    website = {
        file.relative_to(args.dist).as_posix(): sha(file.read_bytes())
        for file in sorted(args.dist.rglob("*")) if file.is_file()
    }
    assert "index.html" in website and any(path.endswith(".js") for path in website)
    old = verify_apk(args.apk1, 1, args, website)
    new = verify_apk(args.apk2, 2, args, website)
    bundle = verify_bundle(args.bundle, 2, args, website)
    assert old["signerSHA256"] == new["signerSHA256"]
    assert old["dexFiles"] and old["dexFiles"] == new["dexFiles"] == bundle["dexFiles"]
    result = {
        "sourceCommit": source,
        "webFiles": website,
        "artifacts": [old, new, bundle],
        "installIdentity": "Both APKs have the same application ID, signer and dex. Version code advances from 1 to 2.",
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"Verified {len(website)} web files in each archive, both APK signatures, the unsigned test AAB, manifests and dex.")
