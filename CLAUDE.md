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

## Chưa làm / chưa kiểm tra
- Xuất chuỗi PNG/video cho clip dài (chưa thử; 2 phút ≈ 3600 khung, mỗi khung SVG ~1 MB). Kế hoạch: xuất PNG nền trong suốt từng cảnh 3–10 giây rồi ghép trong CapCut/Premiere.
- Chỉ có 1 cầu thủ; chưa có bóng, đối thủ, sân, máy quay trong hoạt hình, âm thanh.
- Chạy trên điện thoại (Safari, cảm ứng) chưa kiểm tra; zoom/di chuyển khung bằng chuột phải chưa có bản cảm ứng.
- Cổ chân/bàn chân chưa được hoạt hình hóa; biểu cảm khuôn mặt (cần thêm ảnh GPT).
- Chỗ tay áo/vai ở một số góc nghiêng vẫn là điểm dễ lỗi; ống quần chân giơ cao đã sửa độ dày nhưng chỉ thử với một tư thế.

## Cách làm việc khi chủ dự án gửi ảnh lỗi
Dựng lại đúng tư thế/góc quay (nạp `data/characters/haaland-final.json`, đặt yaw), phóng to vùng khoanh, tìm nguyên nhân gốc, sửa tổng quát, kiểm tra lại, báo ngắn: đã sửa gì, đã thử ở đâu, chưa thử gì.







## B?n v25 (dua v�o kho 2026-11-19, do ch? d? �n + GPT l�m th�m)
app/football-studio.html gi? l� v25 (6,5 MB, nh�ng th�m ?nh); b?n tru?c gi? ? app/football-studio-v24-backup.html. Th�m: � CH?NH H�NH �?U (bi?m h?a: m?t/tai kh?ng l?, c?m, h�m, m�, mui, ki?u t�c, t? can khung m?t), n?m/x�e tay, nh�n v?t Vini Jr. (d?u 4 g�c, 2 d�ng m?u, c� kh�i ph?c), ch?nh d? d�i tay �o/trang ph?c/g?u qu?n, s�n d�m 360� (camera xoay, ng?ng, b�ng kh�a s�n t? d?i l?p), c�c c?nh bi�n/khu HLV/g�c c?u m�n/nh�n t? tr�n. Kh�a luu v?n fs_state_v2. M?i ch? ki?m tra: m? du?c, kh�ng l?i console; chua th? t?ng t�nh nang m?i b?ng m?t.

## Nhi?u di?n vi�n (d?i th?, d?ng d?i) � th�m 2026-11-19
Nh�n v?t dang ch?nh lu�n ? trong S; c�c di?n vi�n kh�c ? S.cast (m?i ngu?i: pose, body, look, head, headMeta, decals, face, keys). Ch?n di?n vi�n = ho�n d?i (swapIn). render = renderOne (ngu?i dang ch?nh) + drawCast: ngu?i c� h�ng cao hon tr�n m�n h�nh (xa) v? tru?c, g?n v? sau; id SVG c?a ngu?i ph? du?c d?i h?u t? d? kh?i tr�ng. V?t ph?m (b�ng/c�p/n?n) g?n v�o ngu?i dang ch?nh. Luu di?n vi�n trong n�t Luu JSON (cast); t? luu tr�nh duy?t ch? gi? ngu?i dang ch?nh. Th? giao di?n "Di?n vi�n". Chua th?: ho?t h�nh keyframe nhi?u ngu?i, n?p l?i JSON c� cast, xu?t video nhi?u ngu?i. Menu chia th? (tab) ki?u game. T�nh nang t�ch b? ph?n khu�n m?t d� T?T (PARTS_ENABLED=false). Vini ch?t: data/characters/vini-final.json.

### Di?n vi�n tr�n s�n d�m 360� (2026-11-19)
Khi c?nh "s�n d�m 360�" (style night360) b?t: camera b�m NGU?I �ANG CH?NH (props.scene.x,y = v? tr� m�t tr�n s�n, rot = hu?ng). M?i di?n vi�n c� S.meta {wx,wy,wh} (ngu?i ph?) � ho�n d?i khi ch?n: ch?n ai th� camera nh?y sang ngu?i d�. Ngu?i ph? chi?u qua c�ng camera: v? tr� d?ng im tr�n s�n khi xoay camera, nh? d?n theo xa, x?p tru?c/sau theo d? s�u th?t, c� b�ng elip du?i ch�n; hu?ng hi?n th? = camDeg - wh. Ngu?i ph? c� keyframe th� v? tr� l?y t? props.scene.x/y/rot trong key. Chua gi?i: tay ch�n hai ngu?i ch?ng nhau v?n theo t?ng l?p c? ngu?i (kh�ng dan xen).

## Camera th?t (2026-11-19)
Th? "V?t ph?m & n?n" -> h?p CAMERA. B?t "D�ng camera th?t" (scene.cam3d=1, ch? ? s�n d�m 360�): camera d?c l?p (camX/camY di?m nh?m, camYaw, dist, focal, camH, ty, dof); m?i ngu?i co gi�n theo focal/(300*d? s�u) n�n kh?p t? l? v?i s�n. T?t = h�nh vi cu (m?c d?nh, kh�ng d?i h�nh d� ch?t). C� n�t Nh?m v�o ngu?i, 4 khung nhanh (to�n c?nh/to�n th�n/n?a ngu?i/c?n m?t), luu c?nh (S.shots, n?m trong JSON), c? "key k? ti?p l� C?T" (key.cutCam: c�c tru?ng camera nh?y th?ng thay v� n?i suy). Chua ki?m tra: d�ng trong phim d?ng s?n (make_goal_film2.js v?n d�ng ch? d? cu), c?t c?nh b?ng UI, xu?t video v?i camera th?t.
