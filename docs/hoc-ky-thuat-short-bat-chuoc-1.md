# Học kỹ thuật từ một short bóng đá hoạt hình (NHÁP, chờ chủ dự án duyệt)

Ghi chú **kỹ thuật dựng và nhịp**, viết bằng lời của mình, rút từ một short khổ dọc 64 giây (30 khung/giây). Không chứa khung hình, lời thoại hay kịch bản của ai. Mục đích: áp vào nhân vật và câu chuyện của riêng mình.
Cách đo: so khác biệt hình giữa các khung liên tiếp (đo máy, ước lượng) rồi đối chiếu bằng mắt ở các mốc chính. Chủ dự án giải thích ý đồ cho các cảnh đầu (giây 0–13); phần còn lại là mình tự quan sát, **cần chủ dự án sửa nếu sai**.

## 1. Cấu trúc: một khuôn lặp 5 màn
Video lặp cùng một khuôn nhiều lần: một nhân vật "ngôi sao" làm một việc đỉnh, nhân vật nhỏ hơn bắt chước kèm một câu nói ngắn lặp lại ở mọi màn (người xem nhớ ngay), rồi sang màn khác đổi bối cảnh và nhân vật. Mỗi màn dài khoảng 8–14 giây. Cắt cảnh bằng cắt thẳng (khoảng 1 khung), một lần có chuyển cảnh ~0,4 giây. Cuối video có cắt gấp (có vẻ để lặp lại từ đầu).

## 2. Nhịp: đứng im hẳn hoặc chuyển động rõ
- **Khoảng 46% số khung hình của cả video là hoàn toàn không đổi** (đứng im tuyệt đối).
- Chuyển động thật chỉ là **các cú ngắn 100–300 ms (3–9 khung)**: tay đưa lên ngực, quay đầu, vung đũa, trượt vào khung, hiện bong bóng. Giữa các cú là đứng im 0,5–2 giây.
- Cứ khoảng **1–1,5 giây có một thay đổi mới**, và mỗi lúc chỉ **một thứ** động.
- Không có chuyển động "lửng lơ" nhẹ khắp nơi. Chính sự tương phản (im hẳn ↔ động rõ) làm chuyển động nhìn mượt và mạnh.

## 3. Công thức mỗi màn (lặp lại)
1. Mở cảnh: ngôi sao đang làm việc đỉnh, **giữ tư thế** ~1–2 giây.
2. Nhân vật nhỏ **trượt cả khối** vào khung, rất nhanh (~0,3 giây, khoảng 9 khung), không có bước chân.
3. **Đứng im** ~1 giây.
4. **Bong bóng thoại hiện tức thì** (3 khung) cùng lúc một cử chỉ nhỏ (tay lên ngực).
5. **Giữ nguyên ~2 giây** để người xem đọc. Phần giữ này là lúc dài nhất của màn.
6. Cử chỉ nhỏ nối nhau (gật đầu nhẹ, ưỡn ngực nhẹ), mặt giữ một biểu cảm.
7. Cắt sang màn sau.

## 4. Kỹ thuật chuyển động (rẻ công làm)
- **Đóng khuôn tư thế rồi dịch cả khối:** trượt vào, lơ lửng trên không (hàng rào nhảy lên vẫn đơ như tượng), thủ môn là một tư thế cuộn người rồi trượt ngang. Không diễn từng khớp.
- **Bộ phận nào cần diễn mới động:** cú sút chỉ có chân động, thân đứng yên; phản ứng chỉ có đầu quay hoặc mặt đổi.
- **Cảm xúc bằng khuôn mặt:** nhân vật bị chọc tức chỉ đổi nét mặt (chau mày, nheo mắt), thân giữ nguyên.
- **Đồ vật xuất hiện/biến đổi tức thì:** bóng bỗng hiện dưới chân; bóng trắng đổi thành đồng vàng bằng một cú đổi nhanh (1–6 khung) kèm tia sáng, không có chuyển tiếp từ từ.
- **Hiệu ứng lấp lánh cập nhật chậm:** các tia sáng và điểm lóe đổi hình khoảng mỗi 3 khung (~10 hình/giây), nhìn như nhấp nháy.
- **Một nét chuyển động nhỏ lặp vòng:** một bàn tay/ngón cái nhúc nhích lặp lại khoảng 0,5 giây mỗi lần, cách nhau ~1,5 giây, trong lúc cảnh nhìn như đứng im.
- **Người xem chỉ nhìn một chỗ:** cảnh bảng chiến thuật chỉ có cánh tay thầy chỉ vào các điểm khác nhau bằng những cú giật 0,13–0,23 giây rồi giữ 0,5–2 giây.

## 5. Máy quay
- Hầu như **đứng yên và cắt cảnh**.
- Một đoạn **lia ngang đều** theo bóng (từ trái sang phải); nhân vật cũ trượt ra khỏi khung chứ không xoay, không nhỏ lại.
- Có cảnh lùi/trượt chậm khoảng 4 giây khi bóng bay xa (nhân vật chính đứng im, phần xa trôi chậm).
- Cuối video cắt gấp để lặp.

## 6. Áp vào tool Football Studio (đề xuất, chưa làm)
- Hoạt hình: dùng **hai key cùng tư thế để giữ im thật**, rồi đổi tư thế bằng hai key cách nhau 0,1–0,3 giây (tay lên "phắc một phát", vẫy nhanh, hạ "rẹt"). Tránh nội suy mượt kéo dài và tránh tay chân đung đưa nhẹ liên tục.
- Cảm xúc: dùng khuôn mặt vector (lông mày, mắt, miệng) đổi giữa các key thay vì đổi dáng người.
- Cắt cảnh: dùng cờ "key kế tiếp là CẮT" của camera thật.
- Đồ vật: bóng và vật phẩm hiện/ẩn tức thì giữa hai key.
- Chưa có: bong bóng thoại; hiệu ứng lấp lánh 10 hình/giây; chuyển nét mặt nhanh.

## 7. Chưa rõ / cần chủ dự án sửa
- Chuyển động toàn khung ~1 giây ở đầu màn 3 (giây 27,6–28,8) và đoạn ~3 giây chuyển động nhẹ ở cuối màn 3 (giây 35,8–39): mình chỉ đoán là vung đũa và gật đầu/ưỡn ngực nhẹ.
- Cảnh cuối (giây 60,8–63,3, hơn 2 giây chuyển động rất nhẹ ở nhiều chỗ): chưa rõ là máy quay trượt chậm hay nhân vật thở/nhúc nhích.
- Chưa nghe tiếng/nhạc nên chưa biết âm thanh bám nhịp cắt thế nào.
