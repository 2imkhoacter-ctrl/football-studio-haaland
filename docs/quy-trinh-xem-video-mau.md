# Quy trình xem và phân tích video mẫu (để học kỹ thuật dựng theo ý chủ dự án)

Mục đích: chủ dự án đưa một video hay của kênh khác. Claude **học kỹ thuật và cấu trúc**, ghi bằng lời của mình, rồi áp vào nhân vật và nội dung của chủ dự án. Không sao chép nhân vật, câu chuyện hay trình tự y hệt.

## 0. Quy tắc bắt buộc
- **Không đưa video, khung hình, lời thoại, bản chép lời hay kịch bản của người khác vào kho.** Khung hình chỉ nằm trong thư mục tạm của phiên. Vào kho chỉ có ghi chú kỹ thuật bằng lời của mình.
- Không tải video bằng cách lách điều khoản nền tảng, không giúp né Content ID.
- Nói thẳng cái gì đã xem bằng mắt/đo bằng số, cái gì chỉ là đoán, cái gì chưa kiểm tra (ví dụ chưa nghe tiếng).

## 1. Lấy video vào phiên
- **Phiên điện thoại/đám mây không vào được YouTube** (mạng môi trường chặn, lỗi `ERR_TUNNEL_CONNECTION_FAILED`). Đừng thử lách.
- Cách chạy được: chủ dự án **gửi file video** (đã thử: file mp4 4,8 MB, 64 giây, gửi từ điện thoại vào chat là đủ). Phiên máy tính có trình duyệt thật đăng nhập sẵn thì có thể mở link trực tiếp.
- Chỉ có link thì Claude không xem được hình, nên chưa làm gì và nói rõ.

## 2. Đo và chọn khung (script `tools/phan_tich_video.py`)
```
python3 tools/phan_tich_video.py <video.mp4> <thu_muc_tam_NGOAI_kho> [fps_do=10] [so_khung=10]
```
Script in ra:
- **Bảng đoạn:** ĐỨNG IM / CHUYỂN ĐỘNG / CẮT CẢNH, tính bằng giây, số khung và mili-giây; với đoạn chuyển động có thêm vùng chuyển động (trái/phải/cả khung) và độ mạnh.
- **Tỉ lệ khung hoàn toàn không đổi** của cả video, và mức chuyển động từng giây.
- Các ảnh ghép `chon_N.png`: khung ở điểm cắt, đỉnh chuyển động, giữa đoạn đứng im dài; mỗi ảnh có **số** và **mốc giây**.

Giới hạn đã biết: đo bằng "khác biệt hình giữa hai khung", là ước lượng. Ở 10 khung/giây, chuyển động rất nhanh có thể bị tính là cắt cảnh; muốn chính xác hơn dùng `fps_do=30`. Ảnh tĩnh **không cho thấy** chuyển động, nên ý nghĩa của chuyển động phải dựa vào số đo và lời chủ dự án.

## 3. Hỏi chủ dự án theo số (đỡ mệt cho chủ dự án)
- Mỗi đợt **khoảng 10 ảnh**, đánh số, kèm mốc giây, mỗi ảnh **một câu hỏi ngắn**, ví dụ: "ảnh 3: vì sao nhân vật đứng im ở đây?", "ảnh 4: mắt, lông mày, tay đang diễn gì?".
- Cái cần nhất là **LÝ DO** (vì sao đứng im, vì sao cắt cảnh ở đó, vì sao người xem cười), vì cái "gì" thì nhìn ảnh là thấy.
- Chủ dự án trả lời theo số, nói ngắn hoặc gõ bằng giọng nói, sai chính tả cũng được. Không cần trả lời hết; ảnh nào bỏ qua thì ghi "chưa rõ", không đoán bừa.
- Chủ dự án có thể gửi thêm ảnh khoanh đỏ hoặc ảnh chụp từ video để sửa chỗ Claude hiểu sai.

## 4. Ghi chú (lời của mình, bằng tiếng Việt, ngắn)
Mỗi cảnh ghi: **mốc giây, máy quay, ai làm gì (một việc duy nhất mỗi lúc), chỗ nào đứng im và vì sao, cảm giác người xem**, kèm số đo. Tách rõ **"chủ dự án nói"** với **"mình quan sát/đoán"**.
Sau mỗi cảnh **đọc lại cho chủ dự án sửa** trước khi lưu vào kho. Các lần hiểu sai đã gặp (để tránh):
- Thứ tự: Messi quay đầu **sau khi** cầu thủ áo đỏ vào hẳn, không phải lúc đang lao vào.
- Máy quay chỉ **lia ngang** theo bóng, không có chuyện "nhỏ lại" hay nghiêng; nhân vật trượt ra khỏi khung vì máy đi qua.
- "Đứng im tuyệt đối" không đúng với người đứng lẻ nhìn bóng: thân đơ nhưng **đầu có quay theo bóng**.
- Gật đầu và ưỡn ngực **rất nhẹ**, khuôn mặt giữ nguyên một biểu cảm.
- Người "đi" chỉ là **trượt cả khối** như đồ chơi xích, không có bước chân.

## 5. Rút nguyên tắc và khuôn
Sau vài đợt, tách thành **nguyên tắc dựng** (xem `docs/quy-trinh-dung-phim.md`) và **khuôn kịch bản** (mở, cao trào, chốt). Chủ dự án chỉ cần đưa chủ đề thì Claude dựng **danh sách cảnh** theo khuôn để chủ dự án duyệt trước khi làm.

## 6. Video đã học
- `docs/hoc-ky-thuat-short-bat-chuoc-1.md`: short 64 giây (khuôn 5 màn "tôi cũng làm được"). Đo: 46% khung hình hoàn toàn không đổi; chuyển động thật chỉ là các cú 0,1–0,3 giây; một thay đổi mới khoảng mỗi 1–1,5 giây.
