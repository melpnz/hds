import sys, os
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
raw, name = sys.argv[1], sys.argv[2]
TARGET_W = int(sys.argv[3]) if len(sys.argv) > 3 else 1000
TILE_H   = int(sys.argv[4]) if len(sys.argv) > 4 else 1300
out = os.path.dirname(os.path.abspath(raw))
im = Image.open(raw).convert("RGB")
W, H = im.size
print("RAW %s %dx%d" % (name, W, H))
if W != TARGET_W:
    H = int(H * TARGET_W / W); W = TARGET_W
    im = im.resize((W, H), Image.LANCZOS)
n = max(1, -(-H // TILE_H))
for i in range(n):
    top = i * TILE_H; bot = min(H, top + TILE_H)
    p = os.path.join(out, "%s_%02d.png" % (name, i))
    im.crop((0, top, W, bot)).save(p)
    print("TILE %s" % p)
