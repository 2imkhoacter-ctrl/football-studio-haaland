# CLAUDE.md — ngữ cảnh dự án Football Studio (đọc trước khi làm)

## Dự án là gì
Chủ dự án là người làm YouTube người Việt. Mục tiêu dài hạn: kênh bóng đá "faceless" (phân tích chiến thuật, chủ đề nóng, tổng hợp tuần) bằng hoạt hình 2D cartoon tự dựng. `app/football-studio.html` là **xưởng dựng cầu thủ**: một file HTML + JS + SVG thuần, không thư viện, chạy offline. Nhân vật chính hiện tại: Haaland (đầu cartoon do GPT vẽ, 5 góc).

Làm được: tạo dáng bằng IK (kéo vòng vàng/xanh/trắng), xoay 360°, đổi tỉ lệ từng bộ phận, màu, đầu 5 góc tự khớp cổ áo, bàn tay/bàn chân xoay được, tay trước/sau thân, 6 ô in (số, chữ, logo ảnh) trên áo/quần/lưng, hoạt hình keyframe, xuất PNG.

## Quy tắc chủ dự án (đã bị "cháy" nhiều lần, TUYỆT ĐỐI giữ)
1. **Không bao giờ reset hay ghi đè thông số đã chốt.** File chốt: `data/characters/haaland-final.json` (bản chốt mới nhất, có sẵn 5 ảnh đầu kiểu mới + khuôn mặt vector bật; bản cũ là `haaland-final-v1.json`; nạp bằng nút "Nạp JSON"). Thông số tự lưu trong localStorage khóa `fs_state_v2`. Khi thêm tham số mới, mặc định phải để hình **không đổi** trừ khi chủ dự án yêu cầu.
2. **Test trong tab riêng với `?nosave`** (không đụng dữ liệu đã lưu).
3. Nhãn giao diện tiếng **Việt**; trả lời chủ dự án bằng tiếng Việt, **ngắn gọn**, nói thẳng cái gì đã kiểm tra, cái gì chưa.
4. **Đừng sửa cơ chế khi chỉ được nhờ chỉnh nét/màu.** Giải pháp phải tổng quát (dùng cho cầu thủ khác), không chỉnh riêng cho Haaland.
5. Tiết kiệm credit: kiểm tra bằng mắt một lần, không dài dòng. Chủ dự án hay gửi ảnh chụp có khoanh đỏ — đọc kỹ vùng khoanh.
6. Không sửa file gốc của chủ dự án ngoài kho này (`D:\Download\...`).
7. Không giúp tránh Content ID / né phát hiện bản quyền; không đưa nội dung của người khác (video, khung hình, bản chép lời) vào kho.

## Kiến trúc (trong IIFE của app/football-studio.html)
- State `S`: `pose` {hip, type, yaw, rotFine, limbs (offset 3D trong khung thân: vai→tay, hông→chân), poles, ends (bàn tay/chân: [gập, xoay bên, lật]), armSide}, `body` (tỉ lệ), `look` (màu, tên, số), `head`, `decals` (6 ô in), `library`, `keys`, `bodyLocked`.
- IK 2 xương trong khung thân 3D rồi chiếu theo góc xoay thân; xương không giãn. Thân/chi dựng bằng lưới 3D `socketMesh()` (shell/ball/cup/hinge) + khử mặt khuất (`visibleParts`) → ra path SVG theo từng bộ phận.
- `drawLayer(parent, items)`: vẽ **mọi viền trước, rồi mọi nền** → các mảnh cùng lớp tự liền khối, chỉ có viền ngoài. Đây là chìa khóa tránh "stroke dính".
- Tay: gồm đoạn cổ tay ngắn cắm vào lỗ đầu cẳng tay + lòng bàn tay dẹt + 3 ngón + ngón cái, **gộp thành một khối** (kiểu Family Guy). Mặc định lòng bàn tay hướng **vào thân** khi buông; dang ngang thì úp xuống; ngón cái ra trước.
- Tay trước/sau thân (`armSide`): "Trước ngực" chỉ ép khi camera nhìn thấy ngực và vai không ở phía xa. Tay phía sau được vẽ **trước** chân và áo.
- In ấn (`DECAL_DEF`): ô áo trước 1–3, quần (bám vào xương đùi, dán trên mặt ống quần), lưng tên/số. Số và tên mặc định giữ y như cũ.
- Cổ áo tự khớp cổ đầu (`body.holeAuto`): độ rộng lỗ lấy từ ảnh đầu đã đo (`headMeta`).
- Vai bằng: `body.shDrop` (0 = bằng, mặc định 0). Nét viền: `body.ow` (% , mặc định 100).
- Keyframe: `takeKey`, `poseAt`, `applyKey`; key có `lin:true` thì không làm mượt lại (dùng cho hoạt hình lấy mẫu dày).
- Zoom chỉ ảnh hưởng khung xem, xuất PNG luôn dùng khung đầy đủ 600x720.

## Hoạt hình mẫu
`animations/haaland-intro-10s.json` (vẫy chào, đi qua lại, nhảy) sinh bởi `tools/make_animation.py` (đọc file chốt, ghi file mới; sửa đường dẫn đầu script cho khớp máy). Tay buông: lệch ngang ±23, gần thẳng; đi bộ tay đung đưa nhẹ trước sau.

## Khuôn mặt vector (mắt / lông mày / miệng) — cách hoạt động (MẶC ĐỊNH TẮT, nút "Khuôn mặt vector")
**Ý tưởng:** ảnh đầu do GPT vẽ KHÔNG có lông mày và miệng, và lòng mắt tô xanh #00FF00. Tool khử màu xanh thành lỗ trong suốt, rồi tự vẽ mắt/lông mày/miệng bằng vector để đổi biểu cảm, chớp mắt, đưa vào keyframe. Cách này thay cho việc phải vẽ nhiều ảnh biểu cảm.

**Hợp đồng ảnh đầu (mỗi nhân vật 5 PNG, data/heads/v2/):** front, q45, side, q135, back; vuông 1024; nền trong suốt; mặt hướng sang PHẢI trong ảnh (app tự lật khi quay trái); đáy cổ cắt phẳng, cổ cùng độ rộng/vị trí ở cả 5 ảnh; KHÔNG lông mày, KHÔNG miệng; phần trong khung mắt (cả lòng trắng và con ngươi) = một màu phẳng #00FF00, không dùng màu đó chỗ khác. front và q45 thấy 2 mắt; side thấy 1 mắt; q135 và back không có mắt (không có xanh) nên không vẽ gì thêm. Nạp cả 5 file bằng nút "Nạp bộ 5 ảnh đầu kiểu mới" (tên file chứa front/q45/side/q135/back).

**Trạng thái `S.face`** (mặc định `FACE_DEF`, lưu trong JSON và trong keyframe): `on`; `lookX`,`lookY` (-100..100, hướng nhìn so với hướng đầu); `pupil` (50..160 %, cỡ chấm); `lidL`,`lidR` (0 mở .. 100 nhắm); `browKind` (normal, angry, sad, surprised, skeptic, happy, focus, smug), `browHL`,`browHR` (-100..100 độ cao mỗi bên), `browThick` (50..200 %); `mouthKind` (closed, smile, smirk, sad, grin, a, o, teeth, tongue), `mouthOpen` (0..100), `mouthDx`,`mouthDy` (-100..100), `mouthScale` (50..200 %); tùy chọn `browColor` (mặc định màu tóc).

**Quy trình khi `on` và có ảnh đầu của góc đang dùng** (trong khối vẽ đầu của render):
1. `ensureKeyed(metaKey)` → `keyGreen(src)` chạy MỘT lần mỗi ảnh: độ trội xanh gd=g-max(r,b); gd>120 → alpha 0 (lỗ mắt), 40..120 → alpha một phần + bỏ ám xanh; tìm 2 vùng lỗ lớn nhất = mắt → `meta.eyes[]` (tỉ lệ 0..1: x0,y0,x1,y1,cx,cy,w,h, sắp từ trái sang phải); tạo `holeMask` (chỉ các lỗ mắt) và `silMask` (cả hình đầu); lưu ở `S.headMeta[view]`.
2. Vẽ trong nhóm đầu, theo thứ tự: **lớp SAU ảnh** `drawFaceBack` (cắt bằng holeMask nên không bao giờ lòi ra ngoài mắt): lòng trắng (elip to hơn lỗ), con ngươi, mí mắt (khối màu da từ trên xuống, tỉ lệ lid%, kèm đường viền mí) → ảnh đầu đã khử xanh → **lớp TRƯỚC ảnh** `drawFaceFront` (cắt bằng silMask nên không tràn ra ngoài viền đầu): 2 lông mày + miệng.
3. **Con ngươi bám theo hướng đầu** (xem như chấm trên quả cầu): góc th = góc danh nghĩa của ảnh (front 0, q45 45, side 90) + phần quay đầu dư giữa hai ảnh + lookX*0.4°; vị trí ngang = tâm + sin(th)*0.4*bề rộng mắt, bề rộng chấm bị bóp theo |cos(th)| (tối thiểu 0.18) → ở góc ngang chấm nằm sát rìa và chỉ còn một nửa/vệt mỏng.
4. **Lông mày**: bảng `BROWS[kind]` cho mỗi bên (độ cao, góc xoay); hình thon (dày ở đầu gần mũi, nhọn dần ra ngoài), tô màu tóc, viền đen mảnh; mỗi bên chỉnh độ cao riêng bằng browHL/browHR.
5. **Miệng**: tâm giữa hai mắt, thấp hơn mắt khoảng 1.05 × khoảng cách hai mắt, rộng 0.95 × khoảng cách hai mắt; góc xoay thì nhỏ hơn và lệch về phía mũi; góc nghiêng (1 mắt) đặt ở mép trước mặt. Kiểu mở (grin, a, o, teeth, tongue) có nền tối + răng/lưỡi, độ mở theo mouthOpen.
6. Góc q135/back không có mắt nên không vẽ lớp mặt (dùng ảnh gốc).

**Keyframe:** mỗi key lưu ảnh chụp `S.face`; giữa hai key các số được nội suy (kiểu và `on` đổi ở giữa đoạn). Chớp mắt = các key `lidL/lidR` 0 → 100 → 0 trong khoảng 0.2 giây. Chưa có chớp mắt tự động; hoạt hình mẫu chưa có biểu cảm.

**Mã nguồn:** `FACE_DEF`, `BROWS`, `ensureKeyed`, `keyGreen`, `maskedGroup`, `drawFaceBack`, `drawFaceFront`, ô giao diện "KHUÔN MẶT VECTOR" (`FACE_UI`, `syncFace`), `mixFace` (keyframe). **Không đổi hợp đồng ảnh; mọi tham số mới mặc định không làm đổi hình; giữ mặc định TẮT.**
## Vật phẩm (props)
S.props (PROP_DEF/PROP_DRAW/drawProps): mỗi món có show, layer (trước/sau nhân vật), attach (free/fL/fR/hL/hR), x, y, size, rot; nằm trong keyframe và trạng thái lưu. Đã có **bóng** (PNG của chủ dự án, hoặc vẽ vector) và **cúp** (PNG; ảnh nhúng sẵn trong HTML, đổi được bằng ô \"Đổi ảnh\"; bản sạch ở assets/props/). Có thêm **khung thành** (vector, nhìn chính diện, mặc định vẽ sau nhân vật, gốc ở giữa vạch gôn). Có **nền sân** (id scene: trời, khán đài đông bằng pattern, biển quảng cáo, cỏ cắt sọc; style stands/grass; vẽ đầu tiên; PNG xuất dùng khung đầy đủ 600x720 khi bật). Làm tiếp từng món: đối thủ (nhân vật thứ hai), khán đài. Lưu ý bản quyền: cúp Premier League là biểu tượng đã đăng ký, cân nhắc khi đăng video.

## Chạy và kiểm tra
Chạy máy chủ tĩnh ở gốc kho, mở `app/football-studio.html?nosave`. Biến toàn cục để thử: `window.__S` (state), `window.__render`. Để kiểm tra bằng mắt cần trình duyệt; nếu môi trường không có thì nói rõ là **chưa xem bằng mắt**.

## Chưa làm / chưa kiểm tra (cập nhật 2026-11-19)
- Xuất clip dài: đã xuất được phim 9 giây (`tools/render_film.js`, ~10–15 phút cho ~220 khung trên máy chủ không card đồ họa); clip 2 phút (~3600 khung) chưa thử. Kế hoạch: dựng từng cảnh 3–10 giây rồi ghép trong CapCut/Premiere.
- Đã có: bóng, cúp, khung thành, sân đêm 360°, nhiều diễn viên, camera thật, 2 cầu thủ (Haaland, Vini) và người nộm. **Chưa có:** âm thanh/nhạc, chữ và bong bóng thoại trong tool, nhiều cầu thủ có đầu riêng khác.
- Chạy trên điện thoại: bản riêng `app/football-studio-mobile.html` (sinh bằng `tools/build_mobile.py`) mới thử bằng trình duyệt giả lập cảm ứng; **chưa thử Safari/điện thoại thật**.
- Cổ chân/bàn chân chưa được hoạt hình hóa.
- Biểu cảm khuôn mặt: đã có khuôn mặt vector (mắt/mày/miệng) và kiểu miệng "Chu môi siuuu"; chưa có chớp mắt tự động, chưa thử kiểu miệng siu với Haaland và với góc ngang hẳn.
- Chỗ tay áo/vai ở một số góc nghiêng vẫn là điểm dễ lỗi; ống quần chân giơ cao đã sửa độ dày nhưng chỉ thử với một tư thế.

## Cách làm việc khi chủ dự án gửi ảnh lỗi
Dựng lại đúng tư thế/góc quay (nạp `data/characters/haaland-final.json`, đặt yaw), phóng to vùng khoanh, tìm nguyên nhân gốc, sửa tổng quát, kiểm tra lại, báo ngắn: đã sửa gì, đã thử ở đâu, chưa thử gì.

## Bản v25 (đưa vào kho 2026-11-19, do chủ dự án + GPT làm thêm)
*(Phục dựng lại từ bản bị hỏng mã hóa; có thể sai chi tiết nhỏ ở các từ đoán, hỏi chủ dự án nếu cần.)*
`app/football-studio.html` giờ là v25 (6,5 MB vì thêm ảnh); bản trước giữ ở `app/football-studio-v24-backup.html`. Thêm: ô **CHỈNH HÌNH ĐẦU** (biếm họa: mắt/tai khổng lồ, cằm, hàm, má, mũi, kiểu tóc, tự cân khung mắt), nắm/xòe tay, nhân vật **Vini Jr.** (đầu 4 góc, 2 dáng mẫu, có khôi phục), chỉnh độ dài tay áo/trang phục/gấu quần, **sân đêm 360°** (camera xoay, ngẩng, bóng khóa sân tự đổi lớp), các cảnh biên/khu HLV/góc cầu môn/nhìn từ trên. Khóa lưu vẫn `fs_state_v2`. Mới chỉ kiểm tra: mở được, không lỗi console; chưa thử từng tính năng mới bằng mắt.

## Nhiều diễn viên (đối thủ, đồng đội) — thêm 2026-11-19
Nhân vật đang chỉnh luôn ở trong `S`; các diễn viên khác ở `S.cast` (mỗi người: pose, body, look, head, headMeta, decals, face, keys). Chọn diễn viên = hoán đổi (`swapIn`). `render` = `renderOne` (người đang chỉnh) + `drawCast`: người có hàng cao hơn trên màn hình (xa) vẽ trước, gần vẽ sau; id SVG của người phụ được đổi hậu tố để khỏi trùng. Vật phẩm (bóng/cúp/nền) gắn vào người đang chỉnh. Lưu diễn viên trong nút "Lưu JSON" (`cast`); tự lưu trình duyệt chỉ giữ người đang chỉnh. Thẻ giao diện "Diễn viên". Menu chia thẻ (tab) kiểu game. Tính năng tách bộ phận khuôn mặt đã TẮT (`PARTS_ENABLED=false`, mã giữ lại). Vini chốt: `data/characters/vini-final.json`.
Chưa thử: hoạt hình keyframe nhiều người trong giao diện, nạp lại JSON có cast, xuất video nhiều người bằng nút trong tool (phim nhiều người đã xuất được bằng `tools/render_film.js`).

### Diễn viên trên sân đêm 360° (2026-11-19)
Khi cảnh "sân đêm 360°" (`style night360`) bật: camera bám NGƯỜI ĐANG CHỈNH (`props.scene.x,y` = vị trí mặt trên sân, `rot` = hướng). Mỗi diễn viên phụ có `S.meta {wx,wy,wh}` và hoán đổi khi chọn: chọn ai thì camera nhảy sang người đó. Người phụ chiếu qua cùng camera: vị trí đứng im trên sân khi xoay camera, nhỏ dần theo độ xa, xếp trước/sau theo độ sâu thật, có bóng elip dưới chân; hướng hiển thị = `camDeg - wh`. Người phụ có keyframe thì vị trí lấy từ `props.scene.x/y/rot` trong key. Chưa giải: tay chân hai người chồng nhau vẫn theo từng lớp cả người (không đan xen).

## Camera thật (2026-11-19)
Thẻ "Vật phẩm & nền" → hộp CAMERA. Bật "Dùng camera thật" (`scene.cam3d=1`, chỉ ở sân đêm 360°): camera độc lập (`camX/camY` điểm nhắm, `camYaw`, `dist`, `focal`, `camH`, `ty`, `dof`); mỗi người co giãn theo `focal/(300*độ sâu)` nên khớp tỉ lệ với sân. Tắt = hành vi cũ (mặc định, không đổi hình đã chốt). Có nút Nhắm vào người, 4 khung nhanh (toàn cảnh/toàn thân/nửa người/cận mặt), lưu cảnh (`S.shots`, nằm trong JSON), cờ "key kế tiếp là CẮT" (`key.cutCam`: các trường camera nhảy thẳng thay vì nội suy). Chưa kiểm tra: dùng camera thật trong phim dựng sẵn (các script phim `make_goal_film2.js`, `make_film_haaland_vini.js` dùng chế độ cũ `free=1`), cắt cảnh bằng UI, xuất video với camera thật.

## Cập nhật phiên điện thoại (2026-11-19): quy tắc làm việc, phim, học từ video mẫu
**Đọc thêm:** `docs/quy-trinh-dung-phim.md` (ngôn ngữ dựng của chủ dự án, quy tắc nội dung, cách làm việc, cách dựng/xuất phim, bài học kỹ thuật), `docs/quy-trinh-xem-video-mau.md` (cách xem và phân tích video mẫu), `docs/hoc-ky-thuat-short-bat-chuoc-1.md`.

**Quy tắc làm việc thêm (chủ dự án nhắc):**
- **Hỏi trước khi sửa file chính** (`app/football-studio.html`, các file `*-final.json`); đề xuất, chủ dự án gật rồi mới làm. Ưu tiên bản riêng/script sinh ra, không đụng file gốc.
- Bản xem điện thoại: `python3 tools/build_mobile.py` sinh `app/football-studio-mobile.html` từ file gốc (bố cục dọc, cảm ứng, vẽ nhẹ khi kéo thanh trượt); xuất PNG/video vẫn đầy đủ chi tiết (đã so ảnh giống hệt). Xuất bằng file gốc trên máy tính.
- Nội dung kênh: chỉ tin thật, hài trào phúng, hai phe cùng có đất, không bịa sự thật về người thật. Kịch câm đã nới cho việc học bong bóng thoại; chưa chốt bỏ hẳn, hỏi lại khi làm clip mới.
- Học từ video mẫu: chủ dự án gửi file video (phiên cloud không vào được YouTube), Claude đo bằng `tools/phan_tich_video.py`, hỏi theo số ảnh, ghi ghi chú bằng lời của mình, **không lưu khung hình/video của người khác vào kho**.

**Công cụ phim:** `tools/make_film_haaland_vini.js` (sinh phim JSON) + `tools/render_film.js` (xuất MP4 1080×1920, không cần Remotion), `tools/export_video.js` (xuất hoạt hình một nhân vật), `tools/build_mobile.py`, `tools/phan_tich_video.py`.

**Thay đổi trong `app/football-studio.html` (chủ dự án đã đồng ý, gộp vào `main` ngày 2026-11-19):** thêm kiểu miệng **"Chu môi siuuu"** (`mouthKind:'siu'`, hàm `siuWarp`/`siuGeom`): nhìn nghiêng thì kéo chính đầu nhô ra, không viền, màu da, lỗ tối ở đầu mõm; nhìn thẳng là khối tròn phồng. Chỉ thêm một lựa chọn; các kiểu miệng cũ đã so ảnh không đổi. Cũng đã sửa lỗi nhỏ: `mixFace` từng bỏ `browColor` khi chạy keyframe (giờ giữ lại; không có `browColor` thì hành vi như cũ).

**Lưu ý mã hóa (đã xử lý 2026-11-19):** các mục "Bản v25", "Nhiều diễn viên", "Camera thật" từng bị hỏng chữ tiếng Việt (có thể do lưu bằng PowerShell sai bảng mã); đã phục dựng lại bằng UTF-8 sạch ở trên. Khi lưu file bằng PowerShell nhớ đặt UTF-8.


## Cập nhật 2026-11-20: hiệu ứng khung hình, thế mẫu, dáng bàn tay
- **Hiệu ứng khung hình** (hộp CAMERA > "Hiệu ứng khung hình / chuyển cảnh", trường `scene.fade/bars/zb/spark`, mặc định 0 = tắt): màn đen, viền đen trên/dưới, nhòe tỏa từ tâm (zoom blur, vẽ nhiều bản phóng to mờ), lấp lánh nhấp nháy. Dùng bằng key để làm chuyển cảnh (ví dụ zb 100 -> 0 trong 0,15s sau khi cắt). Vẽ trong `#fxLayer` (hàm `updateFx`).
- **Thế mẫu**: danh sách thả xuống "Thế mẫu (học từ video)" trong hộp TƯ THẾ (21 thế, nhóm Cơ bản / Ăn mừng / Vật cầm trên tay / Thể thao), nút "Hoàn tác thế mẫu". Dữ liệu ở `POSE_PRESETS`/`posePresetData`, tự co theo độ dài tay chân (`ka`, `kl`). Thế mẫu chỉ đặt tay/chân/thân/độ cao hông/dáng bàn tay/lật bàn tay.
- **Dáng bàn tay (ngón)**: chọn trong hộp XOAY BÀN TAY (chọn tay trái/phải bằng nút ở trên): Tự nhiên (như cũ), Xòe 5 ngón, Khép sát, Chỉ ngón trỏ, Dấu rock (trỏ + út), Giơ ngón cái. Lưu ở `S.pose.handShape {hL,hR}` và trong key (`hshape`); mặc định `auto` = hình cũ. Muốn thấy lòng bàn tay (nhất là khi giơ tay lên) thì đặt "Lật bàn tay" = ±90 (thế mẫu đã đặt sẵn). Đã thêm tiếp (2026-11-20): "Nắm vật / vải (ngón cong ôm)" (grab) và "Chắp tay đan ngón" (clasp: hai tay đặt giao nhau ở giữa người, khuỷu hướng xuống, 	wist ±75 cho ngón dựng lên; thế mẫu Quỳ một gối, chắp tay đã đặt sẵn). Ngón vẽ bằng hai đốt cong (hg*, hh*). Đan ngón thật sự giữa hai bàn tay chưa có: hai bàn tay chỉ chồng lên nhau, nhìn ra dáng chắp tay.
- Tài liệu học video: `docs/checklist-hoc-tu-video.md` (cần trả lời gì khi xem video), `docs/hoc-ky-thuat-short-2-hai-ao-so-7-10.md`; công cụ đo camera `tools/phan_tich_camera.py`.
- Đã kiểm tra bằng mắt: hiệu ứng fade/zoom blur/lấp lánh (một khung), 10 thế mẫu, dáng bàn tay xòe/rock/ngón cái/chỉ ở tay giơ lên. Chưa kiểm tra: tất cả thế mẫu ở mọi góc xoay, hiệu ứng khung hình khi xuất video, dáng grab/clasp ở các góc nghiêng.
- Ngón tay (2026-11-20): các dáng ngón MỚI (khác "Tự nhiên") vẽ mỗi ngón thành một hình riêng có viền ngoài rõ (hàm drawFingers, ngón thon dần capProf2/prof), nên thấy đường chia ngón và chắp tay đan ngón nhìn ra. Dáng Tự nhiên giữ nguyên cách vẽ cũ (ngón gộp vào bàn tay).
- **Mặc định Haaland = bản chốt (2026-11-20):** thẻ `bundled-character` trong HTML đã thay bằng nội dung `data/characters/haaland-final.json` (đầu 5 góc mới + khuôn mặt vector BẬT). Mở `?nosave` hoặc lần đầu là ra Haaland chốt. Trình duyệt đã có dữ liệu lưu (fs_state_v2) vẫn dùng dữ liệu đó. File HTML nặng ~10 MB. Bản trước đó xem lại bằng git.
- Tay Tự nhiên (auto) mượt hơn (2026-11-20): `capProf/capProf2` đầu ngón chia 8 bước, mesh tay 40 cạnh. Hình dáng không đổi, chỉ viền mượt hơn; vẫn mặc định.

- **Dọn nhẹ (2026-11-20):** đã BỎ tay vẽ sẵn (ảnh Gemini) và tay 3D 4 ngón, thanh chỉnh riêng tay, tờ ảnh tay (xem lại bằng git: commit d47e674..HEAD~). Giữ: tay Tự nhiên + thanh "Độ nắm ngón" (50% = nắm vải), dáng ngón dựng bằng code. Mặc định Haaland = bản chốt (bundled-character). Mesh tay 28 cạnh (socketMesh(N)), đầu ngón chia 8 bước cho viền mượt.- **Tay 'Trước ngực' ở góc ngang (2026-11-20):** `armInFront`: khi armSide='front', vai GẦN máy và bàn tay nằm phía trước ngực trong khung thân (limbs[k][2] > .3*wUpA) thì tay vẽ ĐÈ lên thân ở mọi góc trừ khi camera nhìn từ sau lưng (cs ≤ -.35). Trước đó, ở góc ngang và 3/4 phần cẳng tay/vai bị thân che nên tay 'ló' ra với đường cắt phẳng khi ôm/bế người khác. Đã xem bằng mắt ở -90°, 78°, -116° với file dáng ôm Vini của chủ dự án. Chưa kiểm tra mọi dáng và mọi góc khác.
  (Chỉnh lại cùng ngày: vai XA máy thì tay vẫn nằm SAU thân, thân phải che; đã xem bằng mắt ở 100°, -90°, 78°.)
  (Chỉnh lần 2, cùng ngày: vai XA máy + camera nhìn ngang/sau (cs ≤ .35) thì tay LUÔN nằm sau thân; đã xem 90°, -64°, -90°.)
- **Phim học tập Đức 5-0 (2026-11-20):** `tools/make_film_doi_dau_5_0.js` (sinh phim JSON, ghi vào D:\Download, không commit file JSON 9 MB). Dùng camera thật (cam3d: dist/focal/camH/dof), rack focus bằng `dof` (làm mờ nhân vật chính), punch-in, lia + phóng, tối dần (`scene.fade`). Dáng ôm + tỉ lệ Vini thu nhỏ do chủ dự án chỉnh lưu ở `data/poses/om-vini-nho.json` (Vini: bắp tay 60%, đùi 51%, thân 73%, đầu 72% so với Haaland). Nhân vật chính = Vini (có mặt vector), Haaland = người ôm, người nộm = vai phụ. Đã xem bằng mắt cảnh 1 (rack focus), cảnh 3 (ôm), cảnh đám đông; chưa xuất MP4 (máy chưa có Playwright), cảnh 2 còn thấp trong khung.
- **Mở khóa tỉ lệ cơ thể (2026-11-20):** mỗi thanh trượt trong 'THÂN HÌNH' có thêm ô SỐ (`bn_<khóa>`): gõ giá trị bất kỳ (cổ, chân, tay, đầu, ngực... vượt giới hạn thanh trượt); thanh trượt tự nới biên (`syncBody` cũng nới biên khi nạp). Đã thử: cổ 120, đùi 420, cẳng chân 400, tay 200, thân 160, cỡ đầu 300 → vẽ được, chưa thử các góc xoay/dáng ở tỉ lệ đó. CHƯA có: tỉ lệ cơ thể trong keyframe (kéo giãn chân theo thời gian), camera bám theo chân/tay.
