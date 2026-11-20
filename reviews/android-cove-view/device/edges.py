import hashlib
import json
from pathlib import Path

from PIL import Image
import numpy as np

folder = Path(__file__).parent
before = json.loads((folder / "before.json").read_text())
after = json.loads((folder / "after.json").read_text())
baseline = next(f for f in before["frames"] if f["name"] == "before-harbor-eight")
updated = next(f for f in after["frames"] if f["name"] == "after-harbor-eight")
left, top, right, bottom = baseline["bounds"]["webView"]
width, height = baseline["frame"]["width"], baseline["frame"]["height"]
regions = {"old left margin": (0, top, left, bottom), "old top margin": (0, 0, width, top), "old bottom margin": (0, bottom, width, height)}
colors = []
for capture in [baseline, updated]:
    path = folder / capture["frame"]["file"]
    assert hashlib.sha256(path.read_bytes()).hexdigest() == capture["frame"]["sha256"]
    pixels = np.array(Image.open(path).convert("RGB"))
    assert pixels.shape == (height, width, 3)
    sample = {}
    for name, rect in regions.items():
        l, t, r, b = rect
        part = pixels[t:b, l:r]
        matching = np.all(part == np.array([22, 61, 71]), axis=2)
        sample[name] = {"physicalRect": rect, "oldHostColorFraction": round(float(matching.mean()), 6)}
    colors.append({"file": path.name, "bounds": capture["bounds"]["webView"], "regions": sample})
for name in regions:
    assert colors[0]["regions"][name]["oldHostColorFraction"] > .8
    assert colors[1]["regions"][name]["oldHostColorFraction"] < .05
(folder / "edges.json").write_text(json.dumps(colors, indent=2) + "\n")
