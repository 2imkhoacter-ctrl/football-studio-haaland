# Football Studio — xưởng dựng cầu thủ hoạt hình 2D

Công cụ HTML một file (không cần cài gì), dựng cầu thủ hoạt hình 2D: tạo dáng, xoay 360°, đổi tỉ lệ, màu, đầu (5 góc từ ảnh GPT), logo/số/chữ trên áo và quần, hoạt hình keyframe, xuất PNG.

## Chạy
Mở `app/football-studio.html` bằng Chrome hoặc Edge (nên chạy qua máy chủ cục bộ, ví dụ `py -m http.server 8770` rồi vào `http://localhost:8770/app/football-studio.html`).
Thêm `?nosave` vào địa chỉ để chạy mà không đụng dữ liệu đã lưu của bạn (dùng khi thử).

## Thư mục
- `app/football-studio.html` — công cụ chính (bản đang phát triển).
- `data/characters/haaland-final.json` — thông số Haaland đã CHỐT (dùng nút "Nạp JSON").
- `data/heads/` — 5 ảnh đầu Haaland.
- `animations/haaland-intro-10s.json` — hoạt hình mẫu 10 giây (vẫy chào, đi, nhảy). Tạo bằng `tools/make_animation.py`.
- `legacy/` — bản cũ và ghi chú bàn giao.

## Quy tắc của chủ dự án (QUAN TRỌNG)
1. Không bao giờ reset thông số đã chốt; test bằng tab riêng với `?nosave`.
2. Giữ nhãn giao diện bằng tiếng Việt.
3. Giải pháp tổng quát, không chỉnh riêng cho Haaland.
4. Tiết kiệm credit: kiểm tra bằng mắt một lần, giải thích ngắn.
5. Không sửa cơ chế khi chỉ được nhờ chỉnh nét/màu.

## Việc chưa làm / chưa kiểm tra
- Xuất video / chuỗi PNG cho clip dài (chưa thử); tool chỉ có 1 cầu thủ, chưa có bóng, sân, máy quay, âm thanh.
- Chạy thử trên điện thoại (Safari) chưa kiểm tra.
