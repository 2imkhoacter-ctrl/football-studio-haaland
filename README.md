# Football Studio (xưởng dựng cầu thủ 2D)

Kho riêng (private). Mô tả chi tiết kiến trúc và quy tắc: xem `CLAUDE.md`.

## Có gì
- `app/football-studio.html`: **xưởng chính**, một file HTML chạy offline (tạo dáng, đầu 5 góc, khuôn mặt vector, sân 360°, nhiều diễn viên, camera thật, bóng lửa, hoạt hình keyframe, xuất PNG/JSON). Mở trực tiếp bằng trình duyệt hoặc qua máy chủ tĩnh. Thêm `?nosave` để thử mà không đụng dữ liệu đã lưu.
- `data/characters/`: nhân vật đã chốt. `haaland-final.json` (đầu mới 5 ảnh), `vini-final.json`. Nạp bằng nút "Nạp JSON" trong thẻ Xuất / Lưu.
- `data/heads/v2/`, `assets/props/`: ảnh đầu, bóng, cúp.
- `animations/`: hoạt hình mẫu.
- `tools/`: sinh hoạt hình/phim bằng code (`make_animation.py`, `make_film.js`, `make_goal_film2.js` + `film_lib.js`), xuất video (`export_video.js`).
- `remotion-poc/`: dựng video bằng Remotion (nhúng tool vào khung hình, điều khiển theo từng khung). `node_modules` là junction sang `D:\ChatTextStory_AI\POC_01\node_modules` (không có trong kho).
- `docs/phong-cach-clip-bong-da-ngan.md`: ghi chú phong cách dựng clip.

## Làm lại phim trên máy có Node
```
node tools/make_goal_film2.js                  # sinh remotion-poc/public/goal2.json (đã có sẵn trong kho)
copy app\football-studio.html remotion-poc\public\studio.html
cd remotion-poc
node node_modules/@remotion/cli/remotion-cli.js render src/index.jsx Goal2 out/goal.mp4 --concurrency=3
```
Cần tạo lại junction `node_modules` (Windows): `mklink /J node_modules D:\ChatTextStory_AI\POC_01\node_modules`.

## Dùng trên điện thoại
Mở trực tiếp `app/football-studio.html` đã tải về (chưa kiểm tra cảm ứng/Safari, xem mục "Chưa làm" trong `CLAUDE.md`).
