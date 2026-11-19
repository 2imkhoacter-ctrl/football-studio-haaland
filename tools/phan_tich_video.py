#!/usr/bin/env python3
"""Phân tích một video mẫu để HỌC KỸ THUẬT DỰNG (nhịp, chỗ đứng im, cú cắt cảnh, vùng chuyển động) và cắt khung chọn lọc.

Dùng:  python3 tools/phan_tich_video.py <video.mp4> <thu_muc_tam> [fps_do=10] [so_khung_chon=10]
Cần:   ffmpeg, ffprobe, python3 + numpy + Pillow.

QUAN TRỌNG (quy tắc chủ dự án):
- <thu_muc_tam> phải nằm NGOÀI kho (thư mục tạm). KHÔNG đưa video, khung hình, lời thoại của người khác vào kho.
- Chỉ ghi vào kho phần ghi chú kỹ thuật bằng LỜI CỦA MÌNH (xem docs/quy-trinh-xem-video-mau.md).
Đầu ra:
  1. In ra bảng thời gian: từng đoạn ĐỨNG IM / CHUYỂN ĐỘNG / CẮT CẢNH (giây, số khung, ms) + vùng chuyển động (trái/phải/cả khung).
  2. Tỉ lệ khung hình hoàn toàn không đổi, mức chuyển động theo từng giây.
  3. <thu_muc_tam>/chon_N.png: các khung chọn (ở điểm cắt, đỉnh chuyển động, giữa đoạn đứng im), đánh số + mốc giây, để hỏi chủ dự án theo số.
"""
import subprocess, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont

def run(cmd): return subprocess.run(cmd, capture_output=True, text=True).stdout

def main():
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    video, out = sys.argv[1], sys.argv[2]
    fps_do = int(sys.argv[3]) if len(sys.argv) > 3 else 10
    n_pick = int(sys.argv[4]) if len(sys.argv) > 4 else 10
    os.makedirs(out, exist_ok=True)
    info = run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate:format=duration', '-of', 'default=nw=1', video])
    print(info.strip().replace('\n', ' | '))
    w, h = 72, 128
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', video, '-vf', f'fps={fps_do},scale={w}:{h},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.int16)
    ad = np.abs(np.diff(fr, axis=0)); mean = ad.mean(axis=(1, 2)); mask = ad > 14
    # trạng thái từng bước: 0 đứng im, 1 chuyển động, 2 cắt cảnh (đổi gần hết khung)
    state = np.where(mean > 9, 2, np.where(mean >= 0.05, 1, 0))
    runs, s = [], 0
    for i in range(1, len(state) + 1):
        if i == len(state) or state[i] != state[s]:
            runs.append((int(state[s]), s, i - 1)); s = i
    names = {0: 'ĐỨNG IM    ', 1: 'CHUYỂN ĐỘNG', 2: 'CẮT CẢNH   '}
    print(f'\nBẢNG ĐOẠN (đo ở {fps_do} khung/giây; ngưỡng im < 0,05, cắt cảnh > 9):')
    for st, a, b in runs:
        d = b - a + 1
        if st == 0 and d < 2: continue
        extra = ''
        if st == 1:
            m = mask[a:b + 1].any(axis=0); ys, xs = np.where(m)
            if len(xs):
                cols = m.mean(axis=0); L, R = cols[:w // 2].sum(), cols[w // 2:].sum()
                side = 'cả khung' if m.mean() > .35 else ('trái' if L > 1.8 * R else 'phải' if R > 1.8 * L else 'giữa/cả hai')
                extra = f'| mạnh nhất {mean[a:b + 1].max():.1f} | vùng {side} ({m.mean() * 100:.0f}% khung)'
        print(f'{a / fps_do:6.2f}-{(b + 1) / fps_do:6.2f}s {names[st]} {d:3d} bước = {d * 1000 // fps_do:5d} ms {extra}')
    print(f'\nTỉ lệ bước hoàn toàn không đổi: {(mean < 0.05).mean() * 100:.0f}%  (video mẫu đã đo: ~46%)')
    print('Mức chuyển động từng giây:')
    for sec in range(int(len(mean) / fps_do) + 1):
        x = mean[sec * fps_do:(sec + 1) * fps_do]
        if len(x): print(f'{sec:3d}s {"#" * int(min(x.mean() * 6, 50))} {x.mean():.2f}')
    # chọn khung: điểm cắt, đỉnh chuyển động, giữa các đoạn đứng im dài
    picks = []
    for st, a, b in runs:
        if st == 2: picks.append((a + 1) / fps_do + 0.1)
    peaks = np.argsort(-mean)[:n_pick]
    picks += [(i + 1) / fps_do for i in peaks]
    for st, a, b in runs:
        if st == 0 and b - a + 1 >= fps_do: picks.append((a + b + 1) / 2 / fps_do)
    picks = sorted(set(round(p, 1) for p in picks))
    chosen = []
    for p in picks:
        if all(abs(p - q) > 0.6 for q in chosen): chosen.append(p)
    chosen = chosen[:n_pick * 2]
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 40)
    except Exception: font = ImageFont.load_default()
    ims = []
    for k, t in enumerate(chosen, 1):
        p = os.path.join(out, f'_k{k}.png')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(t), '-i', video, '-frames:v', '1', '-vf', 'scale=360:-1', p])
        if not os.path.exists(p): continue
        im = Image.open(p).convert('RGB'); d = ImageDraw.Draw(im)
        d.rectangle((0, 0, 190, 52), fill=(0, 0, 0)); d.text((6, 4), f'{k}  {t:g}s', font=font, fill=(255, 230, 0)); ims.append(im)
    for g in range(0, len(ims), 6):
        grp = ims[g:g + 6]; W, H = grp[0].size
        sh = Image.new('RGB', (W * 3 + 10, H * 2 + 5), (20, 20, 20))
        for j, im in enumerate(grp): sh.paste(im, ((j % 3) * (W + 5), (j // 3) * (H + 5)))
        sh.save(os.path.join(out, f'chon_{g // 6 + 1}.png'))
    for f in os.listdir(out):
        if f.startswith('_k'): os.remove(os.path.join(out, f))
    print(f'\nĐã tạo {len(ims)} khung chọn -> {out}/chon_*.png (số trên ảnh = số khung để hỏi chủ dự án)')

if __name__ == '__main__': main()
