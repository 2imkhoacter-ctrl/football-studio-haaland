# Học kỹ thuật: short "kỷ nguyên Ronaldo – Messi chưa kết thúc" (52 giây)

Ghi chú bằng lời của mình, không có khung hình hay lời thoại. Nguồn: file video chủ dự án gửi (720x1280, 30 fps, 52,4 giây). Đo bằng `tools/phan_tich_video.py` (10 khung/giây) và `tools/phan_tich_camera.py`, kèm ảnh ghép 4 giây một khung (**mẫu thưa, có thể sót chi tiết giữa hai khung**). **Chưa nghe tiếng.** Có dấu tên tác giả nhỏ ở góc dưới.

## Cấu trúc (ẩn dụ: hang kho báu)
1. Hang động tối: cầu thủ trẻ nổi tiếng (nhận ra Haaland, Vini, Yamal, Bellingham, ...) xếp hàng dài dưới biển "cấm vào", mỗi người mang một bao rỗng + giày vàng.
2. Phía trong: Ronaldo và Messi đang đào, đống Quả bóng vàng, cúp, giày vàng chất cao.
3. Nhảy thời gian bằng chữ năm ("2085"): hàng người trẻ thành ông già râu bạc, vẫn xếp hàng.
4. Chữ "3022": hai huyền thoại vẫn đứng cạnh hai bao đầy; cảnh cuối: bộ xương của hàng người chờ, rồi tối dần.
Luận điểm nói bằng hình, không cần lời: "hàng chờ không bao giờ tới lượt".

## Camera (đo + xem ảnh)
- **Cắt thẳng rất nhiều**: ≥ 12 lần trong 45 giây (nhiều đoạn 1–3 giây một cảnh); đầu video cắt dồn dập (0–8 giây).
- **Lia ngang thật**: ~9,6–11,1 s (sang trái), 13,4–14,4 s (sang phải), 35,3–37,5 s (sang trái); mỗi lần là đi dọc hàng người.
- **Zoom ra nhanh** (0,2–0,4 s, 7–14%) ở vài chỗ; **zoom vào chậm** một đoạn ~1,6 s (+28%) ở ~21,7 s (nhấn vào đống vàng).
- **Chuyển cảnh nét trắng chéo** (vài vệt trắng quét chéo khung) quanh 16–17 s: ảnh ghép thấy rõ; đây là hiệu ứng chuyển, không phải chuyển động nhân vật.
- **Chữ năm xuất hiện giữa khung** để báo nhảy thời gian; nền đổi sang xanh đậm (khác nền vàng hang).
- Tối dần cuối video.

## Chuyển động nhân vật
Ít: phần lớn là hình tĩnh (đứng im > 60% thời gian đo) với vài kiểu: tay đào (cuốc), tay cầm biển giơ lên, người nhún nhẹ, đầu ngóc. Thân gần như không đổi dáng; cảm xúc ở mặt (méo mó, mắt tròn). Hàng người trẻ ↔ già dùng cùng bố cục, chỉ đổi mặt/tóc/màu (đoán: ảnh khác nhau, không phải dịch chuyển).

## Dáng và tay
Đứng buông tay nhìn xuống (Haaland); tay xách bao; một người giơ biển cấm; đào bằng xẻng; ngồi trên đống vàng và giơ cúp (Messi); đứng giơ cúp một tay (Ronaldo). Tay chủ yếu là nắm vật (bao, cuốc, cúp) — **tay Tự nhiên + độ nắm 50–100% đủ**, không cần dáng ngón phức tạp.

## Màu và vật phẩm
Hai bảng màu: hang vàng ấm (kho báu) và xanh đậm (năm xa, cái chết). Vật chồng nhiều lớp (cúp, bóng vàng, giày vàng) tạo cảm giác "đầy". Phụ đề/chữ chỉ dùng cho năm.

## Học được gì cho clip của chủ dự án
1. Một ẩn dụ hình (hàng chờ, hang kho báu) thay cho nhiều lời.
2. Nhảy thời gian bằng chữ + đổi bảng màu + biến đổi cùng một bố cục.
3. Cắt nhanh ở đầu để giữ người xem, lia dọc hàng người để cho thấy "dài".
4. Chuyển cảnh nét trắng chéo = tool có thể làm bằng key (hiệu ứng khung hình) hoặc thêm vệt trắng vector.
5. Cảnh cuối đảo ngược kỳ vọng (bộ xương) rồi tối dần.

## Đối chiếu tool (chỉ đề xuất)
- Có sẵn: cắt cảnh, lia, zoom, nhòe tỏa tâm, màn đen, viền; nhiều diễn viên; vật phẩm (cúp, bóng).
- Chưa có: biển cấm vật phẩm, hang/cảnh nền vàng, chữ năm giữa khung, vệt trắng chéo, hàng 8+ nhân vật cùng khung (nhiều diễn viên có nhưng chưa thử số lượng lớn), giày vàng, bao tải.
