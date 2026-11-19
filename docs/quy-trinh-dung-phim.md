# Quy trình dựng phim ngắn và cách làm việc với chủ dự án

Tài liệu này gom: (1) **ngôn ngữ dựng của chủ dự án**, (2) **quy tắc nội dung**, (3) **cách Claude làm việc**, (4) **cách dựng và xuất phim**, (5) **bài học kỹ thuật đã gặp**. Đọc cùng `CLAUDE.md` và `docs/quy-trinh-xem-video-mau.md`.

## 1. Ngôn ngữ dựng của chủ dự án (đã chốt qua nhiều lần chỉnh)
- **Mỗi lúc chỉ MỘT thứ động**, mọi thứ khác đứng im hẳn.
- **Hoặc đứng im hẳn, hoặc chuyển động rõ.** Không có chuyển động nhẹ lửng lơ khắp nơi (video mẫu: ~46% khung hình hoàn toàn không đổi). Sự tương phản này làm chuyển động nhìn mượt và mạnh gấp đôi.
- **Chuyển động giật nhanh, dứt khoát:** "phắc một phát" giơ tay lên, vẫy nhanh liên tục, "cúp cái rẹt" hạ xuống. Một cú thật chỉ 0,1–0,3 giây.
- **Phối hợp nhanh – chậm – nhanh trong từng động tác:** đi cực nhanh, gần tới điểm dừng thì **chậm lại đúng lúc chân đang ở điểm giơ**, rồi dậm xuống nhanh, xoay người đi tiếp. Bước cuối là bước đi bình thường chậm lại, **không phải** một cú nhấc gối cao đột ngột.
- **Dịch cả khối** thay vì diễn từng khớp: trượt vào khung, lơ lửng trên không, bóng bỗng hiện ra. Hàng rào nhảy lên vẫn đơ như tượng.
- **Cảm xúc bằng khuôn mặt** (mày, mắt, môi); thân giữ nguyên. Dáng suy nghĩ có hồn: ngẩng đầu, mắt lúc mở lúc híp, thở dài. Mặt có thể tức giận, mày dữ, môi mếu, nghiến răng cho vui.
- **Nhịp nhanh:** khoảng 1–1,5 giây có một thay đổi mới; đứng im thì ngắn (0,5–2 giây). Chỗ cần đọc (bong bóng thoại) giữ khoảng 2 giây.
- **Cắt cảnh thẳng** ("phắc"), máy quay hầu như đứng yên. Khi lia thì chỉ **một đường lia ngang đều** theo bóng. Haaland nhìn lên thì **camera cũng ngẩng lên trời** rồi mới hiện cảnh sau.
- **Không cần hoàn hảo**, miễn nhanh, đẹp, mượt. Cái người xem nhớ là ý đồ.
- Kiểu miệng **"chu môi siuuu"**: là phần đầu bị **kéo nhô ra** (không dán ống lên mặt), **không viền**, **chỉ dùng màu da** của khuôn mặt, đầu mõm có lỗ tối. Nhìn thẳng thì không kéo ra được nên phim xoay **đầu** nghiêng 3/4, thân giữ nhìn thẳng.

## 2. Quy tắc nội dung kênh
- Chỉ làm **tin thật, chủ đề nóng thật**, kể theo kiểu **hài hước trào phúng** ai cũng hiểu. **Không bịa tình huống** về người thật.
- Hài nằm ở **cách kể** (phóng đại hình ảnh, biểu cảm, ví von), **sự thật giữ nguyên**. Không khẳng định sai sự thật, không xúc phạm cá nhân; để tranh luận nằm ở **ý kiến**, không nằm ở sự thật bị bóp méo.
- **Cho cả hai phe cùng có đất**, không phán ai hơn, **chốt bằng câu hỏi mở / hai kho báu đặt ngang hàng** để bình luận tự nổ ra (ví dụ: "Barça có Yamal, Real cũng có Güler").
- Số liệu và nguồn tin do chủ dự án đưa hoặc đã đối chiếu được; chỗ chưa xác minh phải đánh dấu rõ. Claude không tự bịa số liệu hay lời cầu thủ.
- **Khuôn kịch bản** học từ video mẫu: các màn "ngôi sao làm A, nhân vật chính nói tôi cũng làm được và làm theo" (dựa trên chuyện có thật) → màn chốt hai phe ngang hàng → không phán, để tranh luận ở phần bình luận.
- **Kịch câm:** quy tắc ban đầu là không chữ, không bong bóng thoại. Chủ dự án đã **nới: học theo bong bóng thoại cũng được** (ngày 2026-11-19). **Chưa chốt bỏ hẳn** quy tắc kịch câm cho mọi clip; khi làm clip mới thì hỏi lại.
- Nội dung đăng: lưu ý bản quyền (cúp Premier League là biểu tượng đã đăng ký; logo CLB, tên cầu thủ thật).

## 3. Cách Claude làm việc với chủ dự án
- **Trả lời tiếng Việt, ngắn.** Nói thẳng **đã kiểm tra bằng mắt / bằng số** gì, **chưa kiểm tra** gì, đoán gì. Chủ dự án hay gửi ảnh có khoanh đỏ: đọc kỹ vùng khoanh.
- **Hỏi trước khi sửa file chính** (`app/football-studio.html`, `haaland-final.json`, `vini-final.json`). Một lần Claude tự sửa file chính mà không hỏi và bị nhắc; đã hoàn tác. Cách đúng: đề xuất → chủ dự án đồng ý → làm, ưu tiên **bản riêng / script sinh ra** (ví dụ `tools/build_mobile.py` sinh `app/football-studio-mobile.html`, file gốc không đổi). Chỉ làm một việc chủ dự án đã gật, không làm cả loạt.
- **Thêm tính năng mới thì mặc định TẮT / thêm một lựa chọn**, hình đã chốt không đổi. Luôn so ảnh trước sau để chắc các kiểu cũ không đổi.
- **Không cắt giảm chất lượng khi xuất.** Bản "nhẹ" chỉ để xem trên màn hình điện thoại; PNG và video xuất luôn đầy đủ chi tiết (đã kiểm tra: ảnh xuất giống hệt file gốc từng điểm ảnh). Xuất PNG/video nên làm trên máy tính bằng file gốc.
- **Khi chủ dự án chỉ ra lỗi:** tìm nguyên nhân gốc, sửa tổng quát, kiểm tra lại, báo ngắn. Chủ dự án **không thích bị hỏi quá nhiều lúc mệt**: hỏi theo số, nhóm câu hỏi, chỗ nào bỏ qua thì ghi "chưa rõ".
- **Không hứa quá:** từ ảnh tĩnh không biết chuyển động có "phắc" đúng cảm giác không; chuyện đó chủ dự án là người đánh giá.
- Lỗi chủ dự án thấy mà Claude từng bỏ sót: màu lông mày lệch màu tóc, khung thành nhìn như đồ chơi, tay chắp sau lưng thành chống hông. **Tự soi các lỗi dạng này trước khi báo xong.**

## 4. Dựng và xuất phim
```
node tools/make_film_haaland_vini.js [file_ra.json]     # sinh JSON phim (nhiều diễn viên + camera thật), mặc định animations/phim-haaland-vini.json
node tools/render_film.js <phim.json> <thu_muc_ra> [fps=24] [giay_toi_da|-] [khung_le=1.0,2.5,...]
```
- `render_film.js` dùng Playwright + ffmpeg, **không cần Remotion**; ra MP4 khổ dọc **1080×1920** (bản ép 1080×1920 vì ảnh gốc 1921 px lẻ làm ffmpeg lỗi).
- Muốn xem nhanh vài khung: truyền `khung_le` (chỉ chụp PNG các mốc giây đó), tiết kiệm nhiều thời gian trước khi render cả phim.
- Thời gian: khoảng **10–15 phút cho ~220 khung** trên máy chủ không có card đồ họa. Chạy nền và chờ.
- Biến môi trường để thử nhanh: `HP_Z` (Haaland cách khung thành), `VINI_FACE`/`VINI_HYAW` (hướng thân/đầu Vini), `VS`/`VW` (cỡ/độ cao cảnh Vini), `TILT_TY` (độ ngẩng camera), `VIEW_THETA` (xem từ phía sau).
- Video xuất **không vào kho** (`.gitignore` chặn `exports/`). Phim cuối đã làm: Haaland mặt hầm hầm đi qua đi lại, thở dài, nhìn lên → camera ngẩng trời → cắt sang Vini "siuuu", 9,2 giây.

## 5. Bài học kỹ thuật (đã gặp lỗi, đừng lặp lại)
- **Tay chắp sau lưng:** tay phải áp sát lưng dưới/mông (khuỷu gập ra sau, bàn tay sát mông), không để vênh ra khỏi người. Nhìn chính diện thì tay biến mất sau lưng.
- **Khung thành gốc của sân 360° có đúng kích thước thật**, nhìn như đồ chơi vì **đặt người đứng quá xa nó**: camera làm vật càng xa càng nhỏ rất mạnh (cách 6 m thì khung thành chỉ còn khoảng 40% so với người). Đặt người cách vạch gôn khoảng 2,3 m cho đúng tỉ lệ; sát quá (~1 m) thì khung thành chiếm cả khung hình.
- **Màu lông mày = màu tóc** (`look.hair`), tool **bỏ rơi `browColor` khi chạy keyframe** (`mixFace` chỉ nội suy các khóa trong `FACE_DEF`). Muốn đúng màu thì đặt `look.hair` trong JSON phim. Màu tóc phải **đo trên ảnh đầu thật** (Haaland ≈ `#f9d07a`), đừng tự pha màu. Vini: tóc đen `#1b1716` (hồ sơ có `look.hair` vàng nhạt `#e8d27a`, nên ghi đè trong script phim, không sửa `vini-final.json`).
- **Camera ngẩng lên trời:** dịch `ty` của camera theo độ ngẩng (đã thử, giữ ngẩng vừa để còn thấy rìa khán đài và sao, đừng ngẩng hết thành màu xanh trơn).
- **Cảnh Vini:** cỡ khung rộng hơn một chút và dịch người lên giữa khung, tay giang hẹp và chúc xuống để không bị cắt mép khung dọc.
- **Mắt "hét":** biểu cảm có sẵn khép mắt nửa chừng làm nhân vật trông buồn ngủ; muốn hưng phấn thì mày dữ, mắt nheo hoặc mở to, tùy cảnh.
- **Ảnh xuất có chiều cao lẻ** làm ffmpeg lỗi: luôn ép 1080×1920.

## 6. Việc chưa làm / chưa kiểm tra
- Chưa xem clip **chạy liên tục** (chỉ xem khung tĩnh và đo số); độ "phắc", độ mượt do chủ dự án đánh giá.
- Chưa có **tiếng, nhạc, chữ "SIUUU"**; chưa có chữ/bong bóng thoại trong tool.
- Kiểu miệng "siu" mới thử với **Vini** ở góc 3/4; chưa thử Haaland, chưa có ảnh đầu góc ngang hẳn của Vini.
- Bản điện thoại (`app/football-studio-mobile.html`) chỉ thử bằng trình duyệt giả lập cảm ứng, **chưa thử Safari/điện thoại thật** của chủ dự án.
- Các thay đổi trong `app/football-studio.html` (kiểu miệng "Chu môi siuuu", `siuWarp`) đang nằm trên nhánh `claude/lucid-keller-nkhyau`, **chưa gộp vào `main`**; chờ chủ dự án đồng ý.
