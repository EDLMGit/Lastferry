"""Verify release gameplay using only ordinary Android controls and visible player information."""
import hashlib
import json
import os
import re
import struct
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

OUT = Path(__file__).resolve().parent
RELEASE = "com.lastferry.playtest.rehearsal"
PLAYTEST = "com.lastferry.playtest"
ACTIVITY = "com.lastferry.playtest.MainActivity"
serial = os.environ["ANDROID_SERIAL"]
phase = sys.argv[1]
pkg = PLAYTEST if phase.startswith("ordinary") else RELEASE
report = {"phase": phase, "package": pkg, "inputs": [], "frames": []}


def adb(*args, raw=False):
    value = subprocess.check_output([os.environ.get("ADB", "adb"), "-s", serial, *args], timeout=90)
    return value if raw else value.decode("utf-8").strip()


def sh(*args):
    return adb("shell", *args)


def receipt_file(name):
    return OUT / ("device-" + name + ".json")


def previous(name):
    r = json.loads(receipt_file(name).read_text(encoding="utf-8"))
    assert r.get("passed"), name + " requires a completed observation"
    return r


def digest(blob):
    return hashlib.sha256(blob).hexdigest()


def frame(name):
    blob = adb("exec-out", "screencap", "-p", raw=True)
    assert blob[:8] == b"\x89PNG\r\n\x1a\n"
    filename = "device-" + name + ".png"
    (OUT / filename).write_bytes(blob)
    report["frames"].append({"file": filename, "sha256": digest(blob), "size": struct.unpack(">II", blob[16:24])})


def tree():
    guest = "/data/local/tmp/ferry-rehearsal-screen.xml"
    for _ in range(4):
        output = sh("uiautomator", "dump", guest)
        if "dumped" in output:
            return ET.fromstring(adb("exec-out", "cat", guest, raw=True))
        time.sleep(1)
    raise RuntimeError("Android accessibility hierarchy unavailable: " + output)


def label(n):
    return n.get("text") or n.get("content-desc") or ""


def bounds(n):
    return list(map(int, re.findall(r"\d+", n.get("bounds", ""))))


def matches(n, key="", text="", contains=False):
    return (not key or n.get("resource-id") == key) and (not text or (text in label(n) if contains else text == label(n)))


def lookup(key="", text="", contains=False, wait=25):
    until = time.monotonic() + wait
    while True:
        xml = tree()
        for n in xml.iter("node"):
            if matches(n, key, text, contains) and len(bounds(n)) == 4:
                l,t,r,b = bounds(n)
                if r > l and b > t:
                    return n
        if time.monotonic() >= until:
            found = [(n.get("resource-id"), label(n)) for n in xml.iter("node") if label(n)]
            raise AssertionError(f"Screen lacks {key=} {text=}: {found}")
        time.sleep(.25)


def tap_node(n):
    l,t,r,b = bounds(n)
    x,y = (l+r)//2,(t+b)//2
    assert n.get("enabled") == "true"
    sh("input","tap",str(x),str(y))
    report["inputs"].append({"id":n.get("resource-id"),"label":label(n),"point":[x,y]})
    time.sleep(.25)


def tap(key="",text="",contains=False):
    tap_node(lookup(key,text,contains))


def visible():
    return [label(n) for n in tree().iter("node") if label(n)]


def launch():
    sh("am","force-stop","--user",report["androidUser"],pkg)
    sh("am","start","--user",report["androidUser"],"-a","android.intent.action.MAIN","-c",
       "android.intent.category.LAUNCHER","-n",pkg + "/" + ACTIVITY)
    time.sleep(3)
    lookup("home-play",wait=45)


def package_info():
    dump = sh("dumpsys","package",pkg)
    flags = re.search(r"^\s*flags=\[([^\]]+)\]",dump,re.M)[1].split()
    def field(name):
        return re.search(r"^\s*" + name + r"=(.+)$",dump,re.M)[1].strip()
    files = [line.removeprefix("package:") for line in sh("pm","path","--user",report["androidUser"],pkg).splitlines()]
    sigs = {p.split("/")[-1]: sh("sha256sum",p).split()[0] for p in files}
    requested = re.findall(r"^\s+(android\.permission\.[\w.]+)\s*$",dump,re.M)
    user = re.search(r"^\s*User " + report["androidUser"] + r":.*?(?=^\s*User \d+:|\Z)",dump,re.M|re.S)
    first = re.search(r"firstInstallTime=(.+)",user[0]) if user else None
    return {"code":int(field("versionCode").split()[0]),"version":field("versionName"),
            "appId":field("appId"),"firstInstallTime":field("firstInstallTime"),
            "userFirstInstallTime":first[1].strip() if first else None,
            "lastUpdateTime":field("lastUpdateTime"),"flags":flags,"requestedAndroidPermissions":requested,
            "installedDigests":sigs}


def runtime():
    pid = sh("pidof",pkg)
    assert pid.isdecimal()
    lines = sh("cat","/proc/net/unix").splitlines()
    sockets = [line.split()[-1].lstrip("@") for line in lines if "webview_devtools_remote" in line]
    own = sorted({s for s in sockets if re.search(r"(?:_|-)" + pid + r"$",s)})
    info = package_info()
    if pkg == RELEASE:
        assert not own and "DEBUGGABLE" not in info["flags"] and "TEST_ONLY" not in info["flags"], (pid,own,info)
        assert not info["requestedAndroidPermissions"]
    else:
        assert own and "DEBUGGABLE" in info["flags"], (pid,own,info)
    return {"pid":pid,"appPidWebViewDebugSockets":own,"packageInfo":info,
            "provider":next(l.strip() for l in sh("dumpsys","webviewupdate").splitlines() if "Current WebView package" in l)}


def install(source,version):
    archive_path = Path(source)
    verified = json.loads((OUT / f"package-{version}.json").read_text(encoding="utf-8"))["targetedSet"]
    archive_digest = digest(archive_path.read_bytes())
    assert archive_digest == verified["sha256"]
    if version == 7:
        packages = sh("pm","list","packages","--user",report["androidUser"]).splitlines()
        assert "package:"+RELEASE not in packages, "First install requires an empty rehearsal package"
    else:
        assert package_info()["code"] == 7
    # Each source archive was generated against the device spec. Install only that archive's APKs together.
    with zipfile.ZipFile(archive_path) as archive, tempfile.TemporaryDirectory() as temp:
        members = [name for name in archive.namelist() if name.endswith(".apk")]
        assert members and all(name.startswith("splits/") for name in members), members
        paths = []
        delivered = {}
        for name in members:
            path = Path(temp)/Path(name).name
            assert not path.exists()
            apk = archive.read(name)
            path.write_bytes(apk)
            delivered[name] = digest(apk)
            paths.append(str(path))
        assert delivered == {entry["entry"]:entry["sha256"] for entry in verified["apks"]}
        update = ["-r"] if version > 7 else []
        result = adb("install-multiple","--user",report["androidUser"],*update,*paths)
    assert "Success" in result
    info = package_info()
    assert info["code"] == version
    assert sorted(info["installedDigests"].values()) == sorted(delivered.values())
    report["installation"] = {"archive":archive_path.name,"sha256":archive_digest,
                              "apks":delivered,"result":result,"replace":bool(update),"package":info}


def ordinary():
    launch()
    report["ordinaryHome"] = label(lookup("home-play"))
    assert report["ordinaryHome"] == "Play"
    tap("home-practice")
    report["ordinaryLog"] = visible()
    assert any("0 of 12 coves rescued" in s for s in report["ordinaryLog"])
    report["runtime"] = runtime()
    assert report["runtime"]["packageInfo"]["code"] == 6
    assert report["runtime"]["packageInfo"]["installedDigests"]["base.apk"] == "119a352c1fbf9d614dea897e883f2c39b178d71825e72739ba94a39f118341e6"
    if phase == "ordinary-before":
        tap("journey-title")
    else:
        before = previous("ordinary-before")
        assert before["ordinaryHome"] == report["ordinaryHome"]
        assert before["ordinaryLog"] == report["ordinaryLog"]
        assert before["runtime"]["packageInfo"] == report["runtime"]["packageInfo"]
        frame("ordinary-independent")
    sh("am","force-stop","--user",report["androidUser"],pkg)


def fresh():
    install(sys.argv[2],7)
    launch()
    assert label(lookup("home-play")) == "Play"
    report["freshHome"] = visible()
    report["runtime"] = runtime()
    frame("fresh-home")
    tap("home-practice")
    lookup(text="0 of 12 coves rescued",contains=True)
    report["emptyLog"] = visible()
    tap("journey-title")


def choose_preference():
    tap("home-options")
    before = label(lookup("motion-status"))
    assert "Following device" in before
    tap("motion-preference")
    tap(text="Reduced")
    after = label(lookup("motion-status",text="Reduced motion is on."))
    report["preferenceChanged"] = {"before":before,"after":after}
    tap("settings-back")


def story(destination):
    for _ in range(6):
        button = lookup("story-continue")
        text = label(button)
        tap_node(button)
        if destination.casefold() in text.casefold():
            return
        time.sleep(.5)
    raise AssertionError("The story did not reach " + destination)


def turn(number,cove):
    name = f"{number} action" + ("" if number == 1 else "s") + " taken"
    status = label(lookup("status-toggle",name,True))
    load = label(lookup("load-toggle"))
    report.setdefault("turns",[]).append({"cove":cove,"action":number,"forecast":status,"passengers":load})
    print(cove,number,flush=True)


def place(location):
    names = {"harbor":"Harbor","shallows":"Shallows","rabbit-pier":"Rabbit Pier","stone":"Stone Pier"}
    # Inspecting from the list also works when a marker is outside the camera.
    tap("load-toggle")
    if location == "harbor":
        tap("find-home")
    else:
        xml = tree()
        if not any(matches(n,text=names[location]) and n.get("clickable")=="true" for n in xml.iter("node")):
            tap(text="Inspect a place",contains=True)
        tap(text=names[location])
    return names[location]


def rescue():
    assert package_info()["code"] == 7
    previous("first")
    assert label(lookup("home-play")) == "Play"
    choose_preference()
    tap("home-play")
    story("helm")
    turn(0,"Holding Pier")
    actions = json.loads((OUT.parents[1]/"data/experiments/holding-pier-solution.json").read_text())["actions"]
    current = "stone"
    for i,action in enumerate(actions,1):
        if action["type"] == "move":
            destination = place(action["to"])
            tap("sail","Sail to " + destination,True)
            current = action["to"]
        else:
            xml = tree()
            if not any(matches(n,action["type"]) for n in xml.iter("node")):
                place(current)
            tap(action["type"])
            # With multiple candidates, the chooser defaults to the full group.
            if any(matches(n,"commit") for n in tree().iter("node")):
                tap("commit")
        if i < len(actions):
            turn(i,"Holding Pier")
    lookup("dialog-title","Rue’s Lantern")
    lookup(text="3 of 3 lanterns",contains=True)
    frame("rue-three-lanterns")
    report["arrival"] = visible()
    tap("continue-story")
    story("Bellwater")
    lookup("seascape","Bellwater Cove",True)
    turn(0,"Bellwater")
    frame("before-bellwater")
    observe("before")


def swipe_up():
    width,height = map(int,re.findall(r"(\d+)x(\d+)",sh("wm","size"))[-1])
    sh("input","swipe",str(width//2),str(height*7//10),str(width//2),str(height*3//10),"400")
    time.sleep(.5)


def observe(prefix):
    launch()
    report[prefix] = {}
    seen = report[prefix]
    seen["home"] = visible()
    assert any("Bellwater" in t for t in seen["home"])
    card = label(lookup("home-practice"))
    assert "Rue’s Lantern" in card and "3 lanterns" in card
    seen["homeCard"] = card
    tap("home-options")
    value = label(lookup("motion-status"))
    assert "Reduced" in value
    seen["motion"] = value
    if prefix == "after": frame("updated-preference")
    tap("settings-back")
    tap("home-practice")
    seen["log"] = visible()
    assert any("1 of 12 coves rescued" in t for t in seen["log"]) and any("Rue’s Lantern" in t for t in seen["log"])
    if prefix == "after": frame("updated-rue-log")
    for _ in range(5):
        xml = tree()
        rows = [n for n in xml.iter("node") if matches(n,"practice-holding-pier") and bounds(n)[3]>bounds(n)[1]]
        if rows:
            seen["earnedRevisit"] = label(rows[0])
            assert "Holding Pier" in seen["earnedRevisit"] and "3" in seen["earnedRevisit"]
            break
        swipe_up()
    assert "earnedRevisit" in seen
    if prefix == "after": frame("updated-rescued-coves")
    report["runtime"] = runtime()


def upgrade():
    baseline = previous("rescue")
    install(sys.argv[2],8)
    observe("after")
    assert report["after"] == baseline["before"]
    installed = report["runtime"]["packageInfo"]
    for field in ("appId","userFirstInstallTime","firstInstallTime"):
        assert installed[field] == baseline["runtime"]["packageInfo"][field]
    launch()
    tap("home-play")
    lookup("seascape","Bellwater Cove",True)
    turn(0,"Bellwater")
    frame("updated-bellwater")


def inspect_screen():
    for n in tree().iter("node"):
        if label(n) or n.get("resource-id"):
            print(n.get("resource-id"),n.get("class"),label(n),n.get("bounds"))


if __name__ == "__main__":
    if phase == "inspect":
        inspect_screen()
        sys.exit()
    try:
        report["androidUser"] = sh("am","get-current-user")
        report["system"] = {k:sh("getprop",k) for k in ("ro.kernel.qemu","ro.build.type","ro.debuggable","ro.build.fingerprint")}
        assert report["system"]["ro.kernel.qemu"] == "1" and report["system"]["ro.build.type"] == "user"
        assert report["system"]["ro.debuggable"] == "0"
        report["offline"] = {key:sh("settings","get","global",key) for key in ("airplane_mode_on","wifi_on","mobile_data")}
        report["activeNetwork"] = [s.strip() for s in sh("dumpsys","connectivity").splitlines() if "Active default network" in s]
        assert list(report["offline"].values()) == ["1","0","0"]
        assert report["activeNetwork"] == ["Active default network: none"]
        if phase.startswith("ordinary-"): ordinary()
        elif phase == "first": fresh()
        elif phase == "rescue": rescue()
        elif phase == "update": upgrade()
        else: raise ValueError(phase)
        report["passed"] = True
    except Exception as error:
        report["failure"] = str(error)
        raise
    finally:
        receipt_file(phase).write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
