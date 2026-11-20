"""Cắt tờ ảnh 12 bàn tay (nền xanh lá) thành 12 file PNG nền trong suốt + hands.json (điểm cổ tay, độ rộng cổ tay).
Dùng: python tools/cat_tay_ve_san.py <to_anh.webp|png> [thu_muc_ra=assets/hands] [ten1,ten2,...12 tên theo thứ tự đọc]
Tờ ảnh: 4 cột x 3 hàng, thứ tự đọc: xòe, nắm đấm, chỉ trỏ, rock, ngón cái, phẳng, nắm cong, chữ V, OK, buông, ngửa, ngoắc.
Tách nền bằng độ trội xanh lá (g - max(r,b)); đã bỏ ám xanh ở viền; bỏ dấu sao Gemini ở góc."""
import sys, json, os
import numpy as np
from PIL import Image

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else 'assets/hands'
os.makedirs(out, exist_ok=True)
im = Image.open(src).convert('RGB')
W, H = im.size
a = np.asarray(im).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
gd = g - np.maximum(r, b)
alpha = np.clip((70 - gd) / 40.0, 0, 1)  # gd>=70: nền; gd<=30: giữ hẳn
alpha[gd > 70] = 0
# bỏ ám xanh ở pixel nửa trong suốt
spill = (gd > 0)
g2 = np.where(spill, np.minimum(g, np.maximum(r, b)), g)
rgba = np.dstack([r, g2, b, alpha * 255]).astype(np.uint8)
full = Image.fromarray(rgba, 'RGBA')

NAMES = sys.argv[3].split(',') if len(sys.argv) > 3 else ['xoe', 'nam_dam', 'chi_tro', 'rock', 'ngon_cai', 'phang', 'nam_cong', 'chu_v', 'ok', 'buong', 'ngua', 'ngoac']
cw, ch = W / 4, H / 3
meta = {}
for i, name in enumerate(NAMES):
    col, row = i % 4, i // 4
    x0, y0, x1, y1 = int(col * cw), int(row * ch), int((col + 1) * cw), int((row + 1) * ch)
    cell = full.crop((x0, y0, x1, y1))
    al = np.asarray(cell)[..., 3]
    # bỏ các mảnh nhỏ (dấu sao, bụi): giữ phần liên thông lớn nhất bằng lấp đầy từ điểm có alpha cao nhất
    mask = al > 40
    ys, xs = np.where(mask)
    if len(xs) == 0:
        continue
    # liên thông bằng BFS trên lưới thu nhỏ 4x
    sm = mask[::4, ::4]; lab = np.zeros(sm.shape, np.int32); n = 0; sizes = {}
    for sy, sx in zip(*np.where(sm)):
        if lab[sy, sx]: continue
        n += 1; stack = [(sy, sx)]; lab[sy, sx] = n; c = 0
        while stack:
            cy, cx = stack.pop(); c += 1
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < sm.shape[0] and 0 <= nx < sm.shape[1] and sm[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = n; stack.append((ny, nx))
        sizes[n] = c
    big = max(sizes, key=sizes.get)
    keep = np.kron(lab == big, np.ones((4, 4), bool))[:mask.shape[0], :mask.shape[1]]
    arr = np.asarray(cell).copy(); arr[~keep, 3] = 0
    ys, xs = np.where(arr[..., 3] > 40)
    pad = 6
    bx0, by0, bx1, by1 = max(0, xs.min() - pad), max(0, ys.min() - pad), min(arr.shape[1], xs.max() + pad + 1), min(arr.shape[0], ys.max() + pad + 1)
    sprite = Image.fromarray(arr[by0:by1, bx0:bx1], 'RGBA')
    sprite.save(os.path.join(out, f'tay_{name}.png'), optimize=True)
    sw, sh = sprite.size
    meta[name] = {'file': f'tay_{name}.png', 'w': sw, 'h': sh}
json.dump(meta, open(os.path.join(out, 'hands_raw.json'), 'w'), indent=1)
print('xong', len(meta), 'tay ->', out)
for k, v in meta.items(): print(' ', k, v['w'], 'x', v['h'])
