"""Nhúng 12 bàn tay vẽ sẵn (assets/hands/tay_*.png) vào app/football-studio.html thành bảng HAND_SPRITES (base64, thu nhỏ).
Dùng: python tools/nhung_tay_ve_san.py [app/football-studio.html] [ti_le=0.5]
Chạy lại được nhiều lần: thay đoạn giữa /*HANDSPRITES-START*/ ... /*HANDSPRITES-END*/.
Mỗi tay có: src (PNG base64), w,h, ax,ay (điểm cổ tay trong ảnh), ww (độ rộng cổ tay), dx,dy (hướng từ cổ tay ra các ngón trong ảnh)."""
import sys, io, json, base64, re, math
import numpy as np
from PIL import Image

html = sys.argv[1] if len(sys.argv) > 1 else 'app/football-studio.html'
scale = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
NAMES = ['xoe', 'nam_dam', 'chi_tro', 'rock', 'ngon_cai', 'phang', 'nam_cong', 'chu_v', 'ok', 'buong', 'ngua', 'ngoac',
         'mu_xoe', 'ben_chi_tro', 'dan_ngon', 'chap_tay', 'nam_chat', 'ba_ngon', 'khum_ngua']  # tờ 2: chỉ nhúng các hình MỚI (bỏ hình lặp tờ 1)
table = {}
for n in NAMES:
    im = Image.open(f'assets/hands/tay_{n}.png').convert('RGBA')
    im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS)
    w, h = im.size
    al = np.asarray(im)[..., 3] > 40
    ys, xs = np.where(al)
    two = n in ('dan_ngon', 'chap_tay')
    if two:                   # HAI bàn tay trong một hình: điểm neo giữa hai cổ tay ở đáy; ww = độ rộng MỘT cổ tay
        ax, ay, ww, dx, dy = w / 2.0, float(h), w * .28, 0.0, -1.0
    elif n in ('ngon_cai', 'ben_chi_tro'):      # cổ tay ở bên TRÁI, bàn tay chỉ sang phải
        sel = xs <= xs.min() + max(2, int(w * .06))
        ax, ay, ww, dx, dy = float(xs.min()), float(ys[sel].mean()), float(ys[sel].max() - ys[sel].min()), 1.0, 0.0
        if n == 'ben_chi_tro': dx, dy = 0.78, -0.62
    elif n in ('ngua', 'khum_ngua'):         # tay ngửa: cổ tay ở góc dưới-trái, bàn tay hướng lên-phải
        ax, ay, ww = w * .13, h * .80, h * .30
        v = np.array([.78, -.62]); v /= np.linalg.norm(v); dx, dy = float(v[0]), float(v[1])
    else:                     # cổ tay ở đáy, bàn tay hướng lên
        sel = ys >= ys.max() - max(2, int(h * .05))
        ax, ay, ww, dx, dy = float(xs[sel].mean()), float(ys.max()), float(xs[sel].max() - xs[sel].min()), 0.0, -1.0
    rgb = np.asarray(im)[..., :3].astype(np.float32); sel2 = (np.asarray(im)[..., 3] > 230) & (rgb.sum(axis=2) > 450)
    sk = [int(v) for v in np.median(rgb[sel2], axis=0)] if sel2.any() else [246, 188, 138]
    # TÁCH HAI LỚP: nét viền (đen, nền trong suốt) + hình khối (trắng, để tool tô màu tùy ý: màu da hoặc màu găng)
    arr = np.asarray(im).astype(np.float32)
    a0 = arr[..., 3] / 255.0
    sk_v = np.array(sk, np.float32)
    t = np.clip((arr[..., :3] @ sk_v) / float(sk_v @ sk_v), 0, 1)
    ln = np.stack([np.zeros_like(a0), np.clip(a0 * (1 - t), 0, 1) * 255], axis=-1).astype(np.uint8)
    fl = np.stack([np.full_like(a0, 255), a0 * 255], axis=-1).astype(np.uint8)
    def enc(x):
        bb = io.BytesIO(); Image.fromarray(x, 'LA').save(bb, 'PNG', optimize=True)
        return 'data:image/png;base64,' + base64.b64encode(bb.getvalue()).decode()
    table[n] = {'src': enc(ln), 'fl': enc(fl), 'w': w, 'h': h,
                'sk': sk, 'ax': round(ax, 1), 'ay': round(ay, 1), 'ww': round(max(ww, 8), 1), 'dx': round(dx, 3), 'dy': round(dy, 3), 'two': two}
body = 'const HAND_SPRITES=' + json.dumps(table, ensure_ascii=False, separators=(',', ':')) + ';'
block = '/*HANDSPRITES-START*/' + body + '/*HANDSPRITES-END*/'
s = open(html, encoding='utf-8').read()
if '/*HANDSPRITES-START*/' in s:
    s = re.sub(r'/\*HANDSPRITES-START\*/.*?/\*HANDSPRITES-END\*/', lambda m: block, s, flags=re.S)
else:
    anchor = 'const DEFAULT_POSE=()=>({'
    assert s.count(anchor) == 1, 'không tìm thấy điểm chèn'
    s = s.replace(anchor, block + chr(10) + anchor)
open(html, 'w', encoding='utf-8', newline='').write(s)
print('đã nhúng', len(table), 'tay;', round(len(body) / 1024), 'KB')
for n, t in table.items(): print(' ', n, t['w'], 'x', t['h'], 'cổ tay', t['ax'], t['ay'], 'rộng', t['ww'])
