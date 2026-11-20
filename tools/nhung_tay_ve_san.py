"""Nhúng 12 bàn tay vẽ sẵn (assets/hands/tay_*.png) vào app/football-studio.html thành bảng HAND_SPRITES (base64, thu nhỏ).
Dùng: python tools/nhung_tay_ve_san.py [app/football-studio.html] [ti_le=0.5]
Chạy lại được nhiều lần: thay đoạn giữa /*HANDSPRITES-START*/ ... /*HANDSPRITES-END*/.
Mỗi tay có: src (PNG base64), w,h, ax,ay (điểm cổ tay trong ảnh), ww (độ rộng cổ tay), dx,dy (hướng từ cổ tay ra các ngón trong ảnh)."""
import sys, io, json, base64, re, math
import numpy as np
from PIL import Image

html = sys.argv[1] if len(sys.argv) > 1 else 'app/football-studio.html'
scale = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
NAMES = ['xoe', 'nam_dam', 'chi_tro', 'rock', 'ngon_cai', 'phang', 'nam_cong', 'chu_v', 'ok', 'buong', 'ngua', 'ngoac']
table = {}
for n in NAMES:
    im = Image.open(f'assets/hands/tay_{n}.png').convert('RGBA')
    im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS)
    w, h = im.size
    al = np.asarray(im)[..., 3] > 40
    ys, xs = np.where(al)
    if n == 'ngon_cai':      # cổ tay ở bên TRÁI, bàn tay chỉ sang phải
        sel = xs <= xs.min() + max(2, int(w * .06))
        ax, ay, ww, dx, dy = float(xs.min()), float(ys[sel].mean()), float(ys[sel].max() - ys[sel].min()), 1.0, 0.0
    elif n == 'ngua':         # tay ngửa: cổ tay ở góc dưới-trái, bàn tay hướng lên-phải
        ax, ay, ww = w * .13, h * .80, h * .30
        v = np.array([.78, -.62]); v /= np.linalg.norm(v); dx, dy = float(v[0]), float(v[1])
    else:                     # cổ tay ở đáy, bàn tay hướng lên
        sel = ys >= ys.max() - max(2, int(h * .05))
        ax, ay, ww, dx, dy = float(xs[sel].mean()), float(ys.max()), float(xs[sel].max() - xs[sel].min()), 0.0, -1.0
    rgb = np.asarray(im)[..., :3].astype(np.float32); sel2 = (np.asarray(im)[..., 3] > 230) & (rgb.sum(axis=2) > 450)
    sk = [int(v) for v in np.median(rgb[sel2], axis=0)] if sel2.any() else [246, 188, 138]
    # PNG 256 màu có alpha cho nhẹ
    q = im.quantize(colors=96, method=Image.FASTOCTREE, dither=Image.NONE)
    buf = io.BytesIO(); q.save(buf, 'PNG', optimize=True)
    if len(buf.getvalue()) > 60000:
        buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True)
    table[n] = {'src': 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), 'w': w, 'h': h,
                'sk': sk, 'ax': round(ax, 1), 'ay': round(ay, 1), 'ww': round(max(ww, 8), 1), 'dx': round(dx, 3), 'dy': round(dy, 3)}
body = 'const HAND_SPRITES=' + json.dumps(table, ensure_ascii=False, separators=(',', ':')) + ';'
block = '/*HANDSPRITES-START*/' + body + '/*HANDSPRITES-END*/'
s = open(html, encoding='utf-8').read()
if '/*HANDSPRITES-START*/' in s:
    s = re.sub(r'/\*HANDSPRITES-START\*/.*?/\*HANDSPRITES-END\*/', lambda m: block, s, flags=re.S)
else:
    anchor = 'const DEFAULT_POSE=()=>({'
    assert s.count(anchor) == 1, 'không tìm thấy điểm chèn'
    s = s.replace(anchor, block + '\n' + anchor)
open(html, 'w', encoding='utf-8', newline='').write(s)
print('đã nhúng', len(table), 'tay;', round(len(body) / 1024), 'KB')
for n, t in table.items(): print(' ', n, t['w'], 'x', t['h'], 'cổ tay', t['ax'], t['ay'], 'rộng', t['ww'])
