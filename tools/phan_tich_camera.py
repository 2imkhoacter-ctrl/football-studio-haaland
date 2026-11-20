"""Đo chuyển động CAMERA của một video (zoom vào/ra, lia ngang/dọc, cắt cảnh) bằng numpy + ffmpeg, không cần OpenCV.
Dùng: python tools/phan_tich_camera.py <video.mp4> [fps=30] [rong=144]
Cách đo: với mỗi cặp khung liên tiếp thử nhiều tỉ lệ phóng (s), với mỗi tỉ lệ dùng tương quan pha (FFT) để tìm dịch chuyển;
chọn tỉ lệ có đỉnh tương quan cao nhất. Đỉnh thấp = cắt cảnh/chuyển cảnh. Đây là ƯỚC LƯỢNG toàn khung hình:
nhân vật chuyển động riêng cũng làm sai số, và khi nền ít chi tiết thì kém chính xác.
Ra: bảng đoạn (ZOOM VÀO/RA, LIA, ĐỨNG, CẮT) kèm mốc giây, tổng phóng to (%), tổng dịch (% khung)."""
import subprocess, sys, numpy as np
from PIL import Image

path = sys.argv[1]
fps = float(sys.argv[2]) if len(sys.argv) > 2 else 30.0
W = int(sys.argv[3]) if len(sys.argv) > 3 else 144
probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout.split('\n')[0].split(',')
vw, vh = int(probe[0]), int(probe[1]); H = int(round(W * vh / vw / 2) * 2)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'fps={fps},scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
n = len(raw) // (W * H)
frames = np.frombuffer(raw[:n * W * H], np.uint8).reshape(n, H, W).astype(np.float32)
win = np.outer(np.hanning(H), np.hanning(W)).astype(np.float32)

def prep(f):
    f = f - f.mean()
    return f * win

def zoom_img(f, s):
    """Phóng ảnh f theo tỉ lệ s quanh tâm (s>1 = phóng to)."""
    im = Image.fromarray(np.clip(f, 0, 255).astype(np.uint8))
    cx, cy = W / 2, H / 2
    # affine ngược: điểm đích (x,y) lấy từ nguồn ((x-cx)/s+cx, ...)
    a = 1 / s
    im2 = im.transform((W, H), Image.AFFINE, (a, 0, cx - a * cx, 0, a, cy - a * cy), resample=Image.BILINEAR)
    return np.asarray(im2, np.float32)

def phase(A, B):
    FA, FB = np.fft.rfft2(A), np.fft.rfft2(B)
    R = FA * np.conj(FB); R /= (np.abs(R) + 1e-6)
    r = np.fft.irfft2(R, s=A.shape)
    k = np.unravel_index(np.argmax(r), r.shape)
    dy, dx = k
    if dy > H // 2: dy -= H
    if dx > W // 2: dx -= W
    return r[k], dx, dy

SC = [0.94 + 0.005 * i for i in range(25)]  # 0.94 .. 1.06
rows = []
for i in range(1, n):
    A = prep(frames[i - 1]); best = (-1, 1.0, 0, 0)
    diff = float(np.abs(frames[i] - frames[i - 1]).mean())
    for s in SC:
        B = prep(zoom_img(frames[i], s))
        p, dx, dy = phase(A, B)
        if p > best[0]: best = (p, s, dx, dy)
    rows.append((i / fps, best[0], best[1], best[2] / W, best[3] / H, diff))
rows = np.array(rows)
t, peak, sc, dx, dy, diff = rows.T
# cắt cảnh: khác biệt khung lớn và đỉnh tương quan thấp
cut = (diff > 14) & (peak < 0.12)
label = []
for k in range(len(t)):
    ls = np.log(sc[k]) * fps  # tốc độ phóng (log/giây)
    px, py = dx[k] * fps, dy[k] * fps
    if cut[k]: label.append('CẮT')
    elif abs(ls) > 0.012: label.append('ZOOM VÀO' if ls > 0 else 'ZOOM RA')
    elif abs(px) > 0.03 or abs(py) > 0.03: label.append('LIA')
    else: label.append('ĐỨNG')
# làm mượt nhãn: gộp đoạn, bỏ đoạn quá ngắn (<0.12s) vào đoạn trước
segs = []
for k, lb in enumerate(label):
    if segs and segs[-1][0] == lb: segs[-1][2] = k
    else: segs.append([lb, k, k])
merged = []
for s in segs:
    if merged and (s[2] - s[1] + 1) / fps < 0.12 and s[0] != 'CẮT': merged[-1][2] = s[2]
    elif merged and merged[-1][0] == s[0]: merged[-1][2] = s[2]
    else: merged.append(s)
print(f'{n} khung, {fps:g} fps, đo ở {W}x{H}. Ước lượng; chuyển động nhân vật có thể làm lệch.\n')
print('ĐOẠN CAMERA (t0-t1 | loại | tổng phóng to | tổng dịch ngang/dọc % khung | số liệu):')
for lb, a, b in merged:
    tot = float(np.prod(sc[a:b + 1])); sx, sy = dx[a:b + 1].sum() * 100, dy[a:b + 1].sum() * 100
    extra = ''
    if lb in ('ZOOM VÀO', 'ZOOM RA'): extra = f'phóng {100 * (tot - 1):+.0f}% trong {(b - a + 1) / fps:.2f}s'
    if lb == 'LIA': extra = f'dịch {sx:+.0f}% ngang, {sy:+.0f}% dọc'
    print(f'  {t[a] - 0.5 / fps:6.2f}-{t[b] + 0.5 / fps:6.2f}s  {lb:9s}  x{tot:5.2f}  dịch {sx:+5.0f}/{sy:+5.0f}  {extra}')
print('\nLưu ý: tổng phóng "x1.00" nghĩa là không đổi; >1 là phóng vào, <1 là lùi ra. Dấu dịch: + là hình trượt sang phải/xuống so với khung trước.')

print('\nBẢNG TỪNG 0,5 GIÂY (phóng% = phóng vào +, lùi ra -; dịch% khung; bỏ khung cắt):')
step = int(fps / 2)
for a in range(0, len(t), step):
    b = min(len(t), a + step); m = ~cut[a:b]
    if m.sum() == 0: print(f'  {t[a]:5.1f}s  CẮT'); continue
    tot = float(np.prod(sc[a:b][m])); print(f'  {t[a]:5.1f}s  phóng {100 * (tot - 1):+5.1f}%  dịch {dx[a:b][m].sum() * 100:+5.1f}/{dy[a:b][m].sum() * 100:+5.1f}  tin cậy {peak[a:b][m].mean():.2f}')