# Học từ cách chủ dự án tự chỉnh biếm họa (Haaland chạy chúi, 2026-11-20)

Nguồn: file JSON chủ dự án lưu sau khi tự chỉnh bằng tool (đã trích số vào `data/poses/haaland-chay-chui-chu-du-an.json`). So với bản mình dựng bằng số trước đó (`haaland-khong-lo.json`), bản này **đẹp hơn rõ**.

## Bản của chủ dự án làm gì khác
| Chỉ số | Mình đặt | Chủ dự án | Ý nghĩa |
|---|---|---|---|
| Ngực | 135 | 135 | giống |
| **Eo** | 150 | **22** | eo rất nhỏ → thân thành **tam giác ngược** |
| **Hông** | 70 | **28** | hông nhỏ, thân thu dần xuống chân |
| Dày ngực (nhìn nghiêng) | 140 | 64 | thân dẹt hơn, không thành khối hộp |
| Rộng vai | (mặc định) | 120 | vai rộng hơn ngực |
| Độ dốc vai | 0 | 57 | vai dốc, chùng tự nhiên |
| Vai cao | 25 | 4 | gần như không nâng |
| Bo tròn viền áo | 70 | 11 | chỉ bo nhẹ; hình tròn đến từ tam giác ngược |
| Bắp tay / cẳng tay | 70 / 52 | 70 / 43 | bắp to, cẳng tay nhỏ hơn: thon dần |
| Đùi / bắp chân (to) | 40 / 28 | **57 / 37** | chân ngắn nhưng **to**, chắc chắn |
| Dài tay trên / cẳng | 130 / 115 | 110 / 74 | tay không dài quá mức |
| Cỡ đầu | 135 | **158** | đầu to hơn |
| Bàn tay to | 140 | 86 | bàn tay nhỏ lại |

Dáng: yaw 68°, xoay thân 38° (giống mình), tay trước giơ ra trước (z +154) hơi cong, tay sau vung ra sau và xuống (z −147), chân trước nhấc cao (y 38), chân sau chống (y 110).

## Quy luật rút ra (áp lần sau)
1. **Biếm họa đến từ SILHOUETTE tam giác ngược** (ngực rất to, eo và hông rất nhỏ), không phải tăng mọi chỉ số.
2. **Đừng bo tròn nhiều** (11%); hình dáng làm việc chính, bo tròn chỉ làm mềm cạnh.
3. **Chân ngắn nhưng dày**; cẳng tay mảnh hơn bắp tay (thon dần); **đầu to hơn** mình tưởng.
4. **Tay và chân đặt lệch nhịp** (tay trước chân sau, tay sau chân trước) cho cảm giác chạy.
5. Dáng đứng yaw 68° (3/4 ngang) đẹp hơn ngang hẳn 90°.
