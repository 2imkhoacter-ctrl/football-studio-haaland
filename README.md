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
Dùng bản riêng `app/football-studio-mobile.html` (bố cục dọc, vuốt hai ngón để zoom, vẽ nhẹ khi kéo thanh trượt; PNG/video xuất vẫn đầy đủ chi tiết). File này **sinh tự động** từ file gốc: `python3 tools/build_mobile.py` (file gốc không đổi). Mới thử bằng trình duyệt giả lập cảm ứng, chưa thử Safari/điện thoại thật.

## Dựng phim ngắn và học từ video mẫu
- `node tools/make_film_haaland_vini.js` rồi `node tools/render_film.js <phim.json> <thu_muc_ra>`: dựng và xuất phim nhiều nhân vật (MP4 1080×1920, không cần Remotion).
- `python3 tools/phan_tich_video.py <video> <thu_muc_tam>`: đo nhịp (đứng im/chuyển động/cắt cảnh) và chọn khung để học kỹ thuật dựng.
- Tài liệu: `docs/quy-trinh-dung-phim.md` (ngôn ngữ dựng, quy tắc nội dung, bài học kỹ thuật), `docs/quy-trinh-xem-video-mau.md` (cách xem video mẫu), `docs/hoc-ky-thuat-short-bat-chuoc-1.md`.
- Video/khung hình của người khác **không** được đưa vào kho; chỉ ghi chú kỹ thuật bằng lời của mình.
