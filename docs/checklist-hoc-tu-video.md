# Checklist: cần học gì khi xem một video mẫu

Dùng cùng `docs/quy-trinh-xem-video-mau.md`. Mục đích là **học kỹ thuật bằng lời của mình** rồi áp vào nhân vật và nội dung của chủ dự án. Không đưa video, khung hình, lời thoại hay kịch bản của người khác vào kho.

Mỗi video chủ dự án gửi, **trả lời hết các mục dưới đây** (mục nào không thấy thì ghi "không có", mục nào chỉ đoán thì ghi "đoán"):

## A. Cấu trúc và nhịp
- Dài bao nhiêu giây, khổ nào. Chia mấy cảnh, mỗi cảnh mấy giây.
- Tỉ lệ khung hình **đứng im hẳn** (đo bằng `tools/phan_tich_video.py`). Cứ mỗi bao lâu có một thay đổi mới.
- Khung mở nói gì (luận điểm), cú chốt là gì (câu hỏi mở?), có cấu trúc lặp A/B không.

## B. Camera (chủ dự án đánh giá RẤT QUAN TRỌNG)
Đo bằng `python tools/phan_tich_camera.py <video>` rồi xem lại ảnh ghép các chỗ nghi ngờ (số đo có thể bị mặt đổi liên tục đánh lừa thành "zoom").
- **Cắt cảnh:** mốc giây từng lần cắt; cắt thẳng hay có hiệu ứng.
- **Lia (pan):** mốc, hướng, thời lượng, nhanh/chậm đầu cuối, có kèm phóng to không.
- **Zoom vào/ra liên tục:** có thật không, bao nhiêu % trong bao lâu. Nhiều video không zoom mượt mà chỉ **cắt sang khung rộng/chặt hơn**.
- **Đổi cỡ khung** (rộng/trung/cận/cực cận), có viền đen (letterbox) không.
- **Chuyển cảnh:** cắt thẳng, nhòe tỏa từ tâm, mờ dần, chia đôi màn hình, tối dần cuối video.
- Camera rung/giật nhẹ ở đâu, vì sao.

## C. Chuyển động của nhân vật
Với từng nhân vật/đoạn, ghi nhân vật làm **loại chuyển động nào**:
1. đứng im hẳn; 2. trượt cả khối; 3. rơi/bay vào từ ngoài khung; 4. đổi tư thế tay (mấy tư thế, có trung gian không); 5. đổi mặt kiểu lật sách (mấy kiểu, tốc độ); 6. đung đưa/con lắc; 7. bước chân thật (có hay không); 8. hiệu ứng nhỏ (lấp lánh, rung).
- Chỗ nào **thân đứng im, chỉ tay hoặc mặt động**. Chỗ nào **chỉ máy động, nhân vật đứng im**.
- Không đoán chuyển động từ ảnh tĩnh; phải xem ảnh ghép dày (0,1–0,25 giây một khung) hoặc hỏi chủ dự án.

## D. Thế dáng (pose)
- Liệt kê **từng thế**: thân (đứng/quỳ/lộn ngược/ngả), **chân**, **tay**, đầu (nghiêng/ngửa/quay), trọng tâm.
- Chấm độ khó với tool: dễ / vừa / khó, và cần thêm gì (vật cầm, dáng tay, độ ngẩng đầu...).
- Thế nào đã có trong thư viện thế mẫu (thẻ Tư thế, danh sách "Thế mẫu"), thế nào cần thêm.

## E. Bàn tay (chủ dự án nhắc: RẤT QUAN TRỌNG)
- Từng bàn tay làm dáng gì: xòe 5 ngón, nắm đấm, chỉ trỏ, dấu rock, giơ ngón cái, chắp tay đan ngón, nắm vật (vải/cúp/bóng), khép sát.
- Hướng bàn tay: lòng bàn tay hướng camera hay hướng vào người (dùng "Lật bàn tay" 90° khi tay giơ lên để thấy lòng bàn tay).
- Dáng nào đã có trong "Dáng bàn tay (ngón)" của tool; dáng nào còn thiếu (đan ngón khi chắp tay, nắm cầm vải có ngón cong ôm).

## F. Biểu cảm
- Mỗi nhân vật dùng mấy kiểu mặt; đổi nhanh cỡ nào; mày, mắt, miệng, hướng nhìn.
- Cái nào là "diễn" chính (cảm xúc nằm ở mặt hay thân).

## G. Hiệu ứng, màu, vật phẩm
- Phát sáng/lấp lánh ở vật nào; vệt tốc độ, lửa; bóng đổ.
- **Màu theo phe/bối cảnh** (xanh vs đỏ...), nền mờ/nét (độ sâu).
- Vật cầm trên tay (áo, cúp, bóng vàng, bao tiền...), vật đặt dưới chân (thành tích).
- Chữ, bong bóng thoại, phụ đề: có hay không, kiểu nào.

## H. Âm thanh
- Chưa nghe được thì ghi rõ "chưa nghe tiếng". Nếu chủ dự án mô tả nhạc/tiếng, ghi lại ở mục riêng.

## I. Đối chiếu với tool và việc cần thêm
- Bảng: kỹ thuật → tool đã có / chưa có / cách làm nhanh nhất (tool, Remotion, hay `tools/*.js`).
- Chỉ đề xuất, chủ dự án gật mới làm. Mặc định tính năng mới là tùy chọn và TẮT.

## Cách trình bày khi trả lời chủ dự án
Tiếng Việt, ngắn, bảng nếu có nhiều thứ. Nói rõ **đo bằng số**, **thấy trên ảnh**, **đoán**, **chưa kiểm tra**. Hỏi theo số, đỡ mệt cho chủ dự án. Đọc lại ghi chú cho chủ dự án sửa **trước khi** lưu vào `docs/`.

## Những câu chủ dự án đã hỏi (để lần sau trả lời sẵn)
1. Người ta làm sao (cách edit tổng thể)?
2. Nhân vật di chuyển nhiều không, phức tạp không; motion như thế nào, chỗ nào chỉ có tay, chỗ nào chỉ có mặt?
3. Camera di chuyển, zoom vào/ra, chuyển cảnh như thế nào?
4. Nhân vật có những thế pose gì, từng pose ra sao, có khó không; **bàn tay** thế nào?
5. Biểu cảm, ánh mắt, nụ cười, tư thế tay chân, từng chuyển động nhỏ nhất.
