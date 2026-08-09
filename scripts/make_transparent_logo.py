import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

src = Image.open('/tmp/hosted.png').convert('RGB')
arr = np.array(src).astype(np.int16)

# "Near-white" = bright AND neutral. The wordmark is white too, so brightness
# alone cannot distinguish background from logo.
mn, mx = arr.min(axis=2), arr.max(axis=2)
nearwhite = (mn >= 234) & ((mx - mn) <= 12)

# Only near-white CONNECTED TO THE BORDER is background. This is what protects
# the white letters and the ball's white panels: both are enclosed by dark
# outlines and never touch the image edge.
lbl, n = ndimage.label(nearwhite)
edge = set(lbl[0, :]) | set(lbl[-1, :]) | set(lbl[:, 0]) | set(lbl[:, -1])
edge.discard(0)
bg = np.isin(lbl, list(edge))

alpha = np.where(bg, 0, 255).astype(np.uint8)
out = Image.fromarray(np.dstack([np.array(src), alpha]), 'RGBA')
# Feather ~1px so edges are not jagged against the dark UI.
out.putalpha(out.getchannel('A').filter(ImageFilter.GaussianBlur(0.7)))

# Trim dead space, then re-pad square so it centres predictably anywhere.
bbox = out.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
out = out.crop(bbox)
w, h = out.size
side = int(max(w, h) * 1.04)
canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0))
canvas.paste(out, ((side - w) // 2, (side - h) // 2), out)

canvas.resize((1024, 1024), Image.LANCZOS).save('public/brand/paryaj888-logo.png')
for s in (512, 192, 180, 32):
    canvas.resize((s, s), Image.LANCZOS).save('public/brand/paryaj888-logo-%d.png' % s)

# --- verification ---
chk = Image.open('public/brand/paryaj888-logo.png')
a = np.array(chk.getchannel('A'))
rgb = np.array(chk.convert('RGB'))
print('mode:', chk.mode, 'size:', chk.size)
print('alpha extrema:', (int(a.min()), int(a.max())))
print('corner alpha:', [int(a[y, x]) for y, x in [(0, 0), (0, 1023), (1023, 0), (1023, 1023)]])
print('transparent pixels: %.1f%%' % (100 * (a < 8).mean()))
white_kept = int(((rgb.min(axis=2) >= 234) & (a > 250)).sum())
print('opaque white pixels kept (wordmark + ball panels):', white_kept)
