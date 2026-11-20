# Bàn giao: phiên máy tính ngày 2026-11-20 → phiên điện thoại

Đọc file này TRƯỚC, sau đó `CLAUDE.md`. File này ghi lại **cách chủ dự án nghĩ**, **cách làm việc đã chốt**, **cái đã xong / chưa kiểm tra**, và **việc đang mở**. Mọi thứ đã nằm trên GitHub (`main`).

## 1. Chủ dự án muốn gì (ý của họ, diễn đạt lại)
- Dự án có thể **làm quy mô toàn cầu** (nhiều clip dài, nhiều tập). Vì vậy **đầu tư vào điều khiển bằng tay** thay vì dựa vào tự động của Claude: chủ dự án tự thiết kế cầu thủ mỗi tập, tự đặt dáng chạy và tương tác với diễn viên phụ, "chỉnh pose như búp bê" và quay camera. Claude lo **motion, camera, xuất video, ghép chữ/nhạc/SFX, sửa lỗi công cụ** và **học từ những gì chủ dự án đã chỉnh**.
- **Nhịp cắt camera, zoom, lia, chuyển cảnh quan trọng hơn thế pose.** Nhân vật 2D đơn giản đặt đúng chỗ, chỉ cần motion ở tay/chân; máy quay làm phần lớn việc kể.
- **Máy quay 3D nên theo cơ chế phần mềm chuyên nghiệp** (orbit, dolly, truck, pan, tilt, look-at nhân vật, DOF, đường cong ease, cắt giữa máy, rung máy, danh sách cảnh). Chủ dự án chưa nói quen phần mềm nào (đã hỏi, chưa trả lời): hỏi lại để đặt tên nút/phím.
- **Biếm họa phải CỰC ĐOAN** như Tom & Jerry: cổ dài, chân dài vắt qua nửa sân hất bóng vào lưới, đầu to bằng cái nhà, thân to bằng cả sân 360, camera chạy theo chân. Muốn **toàn quyền tự do** chỉnh cơ thể và đầu, **không bị khóa** ở khoảng "người bình thường". Kiểu chỉnh thân nên **như bộ tạo nhân vật trong game**: nhóm theo bộ phận (vai, ngực, eo, hông, tay, chân...), tên dễ hiểu.
- **Cái làm biếm họa có hồn là hình dáng (silhouette), không phải số cực đoan:** Haaland bản chủ dự án chỉnh có thân **tam giác ngược** (ngực 135, eo 22, hông 28), vai rộng dốc, đùi to, đầu to (158), bo tròn chỉ 11%. Xem `docs/hoc-bieng-hoa-tu-chu-du-an.md`.
- **Kênh mẫu** (nhìn thumbnail): "hamid sahari" (dấu HAMID) — biếm họa tự do, mỗi tập một ẩn dụ hình (hang, lửa, bậc thang), màu phẳng đổi theo tâm trạng, đạo cụ làm nên nhân vật (vương miện, sừng, mũ sừng). Học **tinh thần**, **không chép nhân vật/khung hình** của họ vào kho (quy tắc 7). Chủ dự án nói rõ muốn "ăn theo kịch bản" (ý/cốt truyện chung, ví dụ "Ronaldo đứng buồn khóc, lũ phản bội cười cợt") nhưng làm bằng nhân vật và đạo cụ riêng của mình.
- Kế hoạch dài hạn đã nêu: nhiều **cảnh nền** (hang, phòng, nhà cháy, bậc thang), **ghép đầu** cho diễn viên phụ (đầu PNG 5 góc, nhờ GPT/Gemini vẽ), **nhạc + SFX** (chủ dự án đưa file; bản quyền nhạc là việc của họ).

## 2. Cách làm việc đã chốt (rất quan trọng, chủ dự án đã bực vì vi phạm)
1. **Tiết kiệm credit.** Hôm nay làm quá nhiều thứ không cần (tay vẽ sẵn Gemini, tay 3D 4 ngón...), chủ dự án yêu cầu **xóa** (đã xóa). **Chỉ làm đúng việc được nhờ, không tự thêm tính năng.** Việc lớn: hỏi một câu rồi mới làm.
2. **Không nói "không biết lỗi gì".** Khi họ khoanh ảnh lỗi: **chốt nguyên nhân gốc**, sửa, kiểm tra các góc liên quan. Nếu không chắc, nói rõ cái chưa chắc nhưng vẫn đưa chẩn đoán cụ thể.
3. **Nói rõ đã xem bằng mắt cái gì / chưa.** Không nói "xong" khi mới xem một khung.
4. **Không nhầm vai:** họ làm dáng, Claude không tự đặt dáng rồi nói giống ảnh. Claude đọc JSON họ lưu để học số.
5. **Tiếng Việt, ngắn gọn.** Họ hay gửi ảnh có khoanh đỏ: đọc kỹ vùng khoanh. Họ hay giận khi bị đổ lỗi hay hứa quá.
6. **Hỏi trước khi sửa file chính** (`app/football-studio.html`): đề xuất, họ gật. Hôm nay họ đã gật cho: mở khóa tỉ lệ, kiểu thân nhanh, bo tròn + vai cao, camera/rack focus. Mọi thứ mới phải **mặc định không đổi hình đã chốt**.
7. Không sửa file của họ ngoài kho (`D:\Download\...`), trừ file mình tự tạo ở đó (phim, bản chép tool để họ mở).

## 3. Đã làm hôm nay (và đã kiểm tra tới đâu)
Chi tiết kỹ thuật nằm ở `CLAUDE.md` (mục 2026-11-20). Tóm tắt:
- **Tool (`app/football-studio.html`)**: hiệu ứng khung hình, thế mẫu 21 thế, dáng ngón bằng code, Haaland chốt là mặc định (`bundled-character`), tay Tự nhiên viền mượt (mesh 28 cạnh), **sửa tay "Trước ngực" ở góc ngang** (`armInFront`), **ô số gõ giá trị bất kỳ** cho mọi thanh trượt thân và đầu, **nhóm thân theo bộ phận + nút Kiểu thân nhanh**, **Bo tròn viền áo (`round`) + Vai cao/chùng (`shY`)**.
- **Phim và camera** (`tools/`): `make_film_doi_dau_5_0.js` (dựng cấu trúc edit clip "Đức 5-0": cam3d, rack focus bằng `dof`, punch-in, lia + phóng, tối dần), `make_film_haaland_chay.js` (Haaland của chủ dự án chạy chúi, bóng xoay, nội suy theo cung), `render_film.js` (Chrome/Edge có sẵn + ffmpeg).
- **Remotion** (`remotion-poc/`): composition `HaalandRun` nhúng chính tool (iframe) và điều khiển thời gian từng khung.
- **Ghi chú học 6 video** ở `docs/hoc-ky-thuat-short-*.md` + `docs/hoc-motion-nhan-vat-2-kenh.md` + `docs/checklist-hoc-tu-video.md`.
- **Dáng/tỉ lệ chủ dự án chỉnh**: `data/poses/om-vini-nho.json` (ôm Vini nhỏ), `data/poses/haaland-chay-chui-chu-du-an.json` (dáng chạy biếm họa), `data/poses/haaland-khong-lo.json` (bản Claude thử, kém hơn).
- **Chưa kiểm tra / còn lỗi**: phần lớn tính năng mới mới xem 1–3 góc xoay. Chưa thử hết tỉ lệ cực đoan ở mọi góc, tay áo/cổ áo khi bo tròn mạnh. Cảnh 2 phim Đức 5-0 còn thấp trong khung. Chưa nghe/ghép âm thanh. Chưa rebuild bản điện thoại (`tools/build_mobile.py` chưa chạy lại sau các thay đổi).

## 4. Ngữ pháp camera đã rút ra từ 6 clip mẫu (áp khi dựng)
| Việc | Cách các clip làm | Số đo |
|---|---|---|
| Mở clip | giữ nhân vật chính, đẩy chậm vào | zoom +31..47% trong 2,6–4 s |
| Nhấn hành động | cắt rồi phóng nhanh (punch-in) | +25..31% trong 0,3–0,6 s |
| Cho thấy "dài/bao nhiêu" | lia ngang dài dọc hàng người | 3 giây đến 7,6 s; dịch ~3 chiều rộng khung |
| Lộ không gian | lùi chậm | 26–33% trong 1,3–5,6 s |
| Nhảy thời gian | chữ năm giữa khung + nháy trắng/vệt trắng + đổi nền | 2–2,5 s mỗi mốc |
| Flashback/quay về | hòa tan ~1 giây | chưa có trong tool |
| Rack focus | mờ nhân vật chính rồi nét | `dof` 70→0 trong ~0,4 s (làm được trong tool) |
| Chuyển động | một bộ phận lặp vòng nhỏ, thân đứng im; hoặc đổi dáng cả thân mỗi 2–3 khung ở cú chính | 3–12 dáng/giây |
| Giữ để đọc | đóng băng 0,75–1,5 s; lời thoại có thể giữ 10 s | |
Nhịp cảnh: cảnh đỉnh 1–3 s; cắt dồn ở đầu clip.
Việc còn thiếu trong tool để làm kiểu này: hòa tan, bóng thoại, chữ năm, vệt trắng chéo, nền hang/lửa, squash bóng, nháy chữ, hạt mưa.

## 5. Việc đang mở (chủ dự án chưa chốt, đừng tự làm)
1. **Cánh tay thon dần** (to ở vai, nhỏ về cổ tay): họ gõ dòng "làm cảnh tay thon dần đi" trong khung chat nhưng chưa xác nhận. Hỏi lại.
2. **Xem trước nhẹ khi phát** (mỗi khung vẽ 0,4–0,7 s nên không xem mượt trong tool): đã chọn hướng "xuất MP4"; có thể làm thêm chế độ hạ chi tiết khi phát (chưa hỏi lại).
3. **Camera**: bám chân/tay (look-at), kiểu ease cho từng đoạn, mờ theo độ sâu mọi diễn viên, rung máy, tilt thật, danh sách cảnh; **quay trực tiếp** (lăn chuột zoom, kéo lia, phím 1–9 cắt).
4. **Tỉ lệ cơ thể vào keyframe** (chân dài ra dần): chưa làm.
5. **Thư viện tư thế của chủ dự án** (lưu dáng ôm/bế, áp lên nhân vật khác, tự co theo tỉ lệ): chưa làm.
6. **Vai cao thấp thật** đã có một phần (`shY`); **kiểu thân bầu tròn** hiện bằng bo viền; cánh tay phình rồi thon vẫn thiếu.
7. **Ghép đầu diễn viên phụ, nền riêng, nhạc, SFX**: chờ chủ dự án đưa tài nguyên.
8. **Hòa tan, bóng thoại, chữ năm, hào quang, lửa, bảng cầm tay** bằng Remotion (đã nói đây là chỗ Remotion bù cho tool).

## 6. Chạy và kiểm tra (máy tính)
- Xem tool: máy chủ tĩnh ở `D:\Download` (cấu hình `userdl` trong `.claude/launch.json`, cổng 8770). Mình chép bản mới nhất vào `D:\Download\football-studio-haaland-wrist-ankle.html` sau mỗi lần sửa; mở `?nosave`.
- Xuất phim thô: `node tools/make_film_haaland_chay.js <ra.json>` (nguồn nhân vật: `D:\Download\haaland-final.json`, dáng B: `D:\Download\phim-haaland-chay 2.json`; đổi bằng `HAALAND_JSON`, `HAALAND_POSE_B`), rồi `PW_CORE=C:/Users/ADMIN/fs-render/node_modules/playwright-core node tools/render_film.js <phim.json> <thư_mục_ra> 24`. (`playwright-core` đã cài ngoài kho; dùng Chrome ở `C:\Program Files\Google\Chrome\Application\chrome.exe`.)
- Xuất bằng Remotion: chạy trong `remotion-poc`: `node ../tools/make_film_haaland_chay.js public/haaland-run.json`, chép `app/football-studio.html` thành `public/studio.html`, rồi `npx remotion render src/index.jsx HaalandRun out/haaland-run.mp4 --browser-executable="C:/Program Files/Google/Chrome/Application/chrome.exe" --concurrency=2`. Khoảng 2–3 phút cho 7 giây.
- **Bản điện thoại**: nhớ chạy lại `python3 tools/build_mobile.py` vì `app/football-studio.html` đã đổi nhiều.

## 7. Bẫy đã gặp (đỡ mất thời gian)
- **Ảnh chụp của trình duyệt trong app thường trễ một nhịp**: chụp lại lần hai trước khi kết luận.
- **Khi cần xem khổ dọc** đừng chèn CSS ẩn bảng điều khiển rồi quên gỡ (đã làm mất bảng điều khiển của chủ dự án một lần); tải lại trang là hết.
- **Sửa file HTML lớn bằng script:** khi tìm mốc để cắt đoạn, luôn tìm mốc **sau** vị trí bắt đầu (`t.index(mốc, i)`); từng làm lặp đoạn mã vì mốc xuất hiện hai lần.
- Không có `python` trong Bash, dùng `py`. Heredoc có một số ký tự lạ có thể bị lỗi: dùng công cụ Write cho file dài.
- Xuất tiếng Việt từ Python in ra console cần `PYTHONIOENCODING=utf-8`.
- `dof` của camera thật chỉ làm mờ **nhân vật chính**, không phải diễn viên phụ.
- Nhân vật chính luôn vẽ ở kích thước chuẩn; chiều sâu của diễn viên phụ tính theo khoảng cách tới điểm nhắm camera.
