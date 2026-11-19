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

## Khuôn mặt vector (thử nghiệm, mặc định TẮT)
Ảnh đầu kiểu mới (data/heads/haaland_front_v2_vectorface.png): không lông mày, không miệng, khung mắt tô xanh #00FF00, nền trong suốt. Khi bật, app khử màu xanh (keyGreen), tự tìm 2 mắt, vẽ lòng trắng/con ngươi/mí SAU ảnh và lông mày/miệng TRƯỚC ảnh (drawFaceBack/drawFaceFront). Trạng thái ở S.face (cũng nằm trong keyframe để chớp mắt/đổi biểu cảm). Hiện chỉ có góc chính diện; 4 góc còn lại chưa có ảnh kiểu mới.

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


