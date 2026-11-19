# Ghi chú phong cách: clip bóng đá hoạt hình ngắn (rút từ việc xem kênh khác, viết bằng lời của mình)

Đây là **ghi chú kỹ thuật**, không chứa khung hình, lời thoại hay kịch bản của ai. Mục đích: học cách dựng/diễn rồi áp vào nhân vật và câu chuyện của riêng mình.
Nguồn quan sát: một short bóng đá hoạt hình 46 giây (xem từng 0,4–1 giây ở đoạn đầu và đoạn thủ môn). Chưa đo được chuyển động nhỏ hơn 0,4 giây.

## 1. Nhịp: ít tư thế mạnh, GIỮ lâu
- Cú sút ở đoạn đầu gần như **một tư thế giữ ~2 giây**; chuyển động chỉ nằm ở thứ phụ (bóng xoay, vệt lửa, nét mặt), thân người gần như đứng nguyên.
- Cảnh thủ môn bay người: người **trôi chậm và xoay nhẹ trong ~2 giây**, không có nhiều tư thế trung gian.
- Bài học: đừng chạy animation liên tục. Chọn 1 tư thế đắt, giữ, rồi thêm chuyển động phụ.

## 2. Máy quay: CẮT cảnh, không lia/xoay liên tục
- Mỗi cảnh máy đứng yên; đổi cảnh bằng cắt thẳng.
- Có ít nhất 3 cỡ cảnh: cận 3 người nổi bật ở khung dọc, **cận cực đại khung thành + thủ môn** (lưới phủ kín khung), rồi quay lại cảnh đầu với tư thế khác.
- Bài học: bản "Bàn thắng" của mình xoay camera liên tục và để nhân vật quá nhỏ -> nhìn lỏng lẻo.

## 3. Cỡ nhân vật và bố cục
- Nhân vật **lấp đầy khung** (thân cao ~50–60% khung hình dọc), đầu rất to so với thân, bàn chân to.
- Nền đơn giản: khán đài mờ bằng khối màu, cỏ phẳng có vài nét chấm. Không cần sân 3D toàn cảnh.
- Hai bên chủ thể là hai nhân vật phụ nghiêng người vào giữa (bố cục "ba cái đầu một hàng").

## 4. Diễn xuất
- Biểu cảm đơn giản nhưng RÕ: mắt nheo, miệng mếu/cười lớn, mày dữ. Mỗi nhân vật chỉ 1–2 biểu cảm cho cả cảnh.
- Tay chân co giãn như cao su, tư thế thể thao phóng đại (chân đá vươn rất dài, thủ môn thành một đường chéo).

## 5. Hiệu ứng
- Vệt lửa/tia lửa: ngắn, vài khung, gắn vào chân/bóng đúng lúc chạm.
- Bóng xoay trong lúc bay (hoa văn đổi khung).
- Hiệu ứng nhỏ, lặp, rẻ -> hợp để làm bằng code.

## 6. Cái mình đã làm sai ở bản "Bàn thắng" 18s
1. Nhân vật nhỏ, sân 3D rộng, khung thành bé tí.
2. Camera xoay, nhân vật chạy liên tục -> không có chỗ "giữ" để người xem hiểu.
3. Thủ môn/hàng thủ là người nộm không mặt, nhân vật không có cá tính.
4. Không cắt cảnh, không có cảnh cận cực đại.

## 7. Cách làm lại (đề xuất)
- Dựng theo **danh sách cảnh (shot list)**, mỗi cảnh 1–3 giây, cắt thẳng; mỗi cảnh một khung hình riêng (cận/trung/cực cận).
- Tool cần: chế độ "cận cảnh phóng đại" (size < 100), đầu to/chân to nhờ thông số có sẵn, bố cục nền phẳng.
- Mỗi cảnh chỉ 1–2 chuyển động chính + hiệu ứng phụ.
