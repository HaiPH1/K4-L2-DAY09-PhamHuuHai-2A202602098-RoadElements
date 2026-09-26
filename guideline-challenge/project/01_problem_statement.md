# Problem statement + downstream contract

## Bài toán

Phân tầng phân loại và phát hiện hộp bao (hierarchical bounding box & sign taxonomy) cho các **biển báo giao thông có hiệu lực trực tiếp tới xe tự hành (Ego vehicle)** trong điều kiện môi trường thực tế (bị che khuất một phần, thời tiết xấu hoặc góc nhìn nghiêng).

## Downstream contract

1. **Downstream task / model / user là ai?**
   - **Mô hình mục tiêu:** Model 2-stage/multitask Object Detection & Classification (YOLO / Faster R-CNN kết hợp attribute classification head).
   - **Downstream consumer:** Hệ thống ADAS Decision & Planning (Lập kế hoạch hành trình và hỗ trợ người lái ADAS cấp độ 2+/3).

2. **Output annotation nào thực sự cần?**
   - **Geometry:** 2D Bounding Box (`rectangle`) ôm sát toàn bộ mặt hiển thị của biển báo (visible face).
   - **Class:** `traffic_sign`.
   - **Attributes bắt buộc:**
     - `sign_group`: `prohibitory` (biển cấm/dừng), `warning` (nguy hiểm/cảnh báo), `mandatory` (hiệu lệnh), `other_info` (chỉ dẫn/thông tin).
     - `relevance`: `facing_ego` (hướng về xe mình - có hiệu lực), `facing_away` (quay lưng/ngược chiều), `lateral` (hướng sang đường nhánh/song song).
     - `occlusion`: `none` (< 10%), `partial` (10% - 50%), `heavy` (> 50%).
     - `legibility`: `legible` (nhìn rõ nội dung/hình họa), `unreadable` (bị mờ, chói sáng, hoặc quá xa).
     - `escalate_review`: `false` (mặc định), `true` (khi annotator không thể chắc chắn cần reviewer phân giải).

3. **Failure nào gây hậu quả lớn nhất? (đây sẽ là decision `critical` trong gold):**
   - **Lỗi chí mạng 1 (False Negative ở biển ưu tiên an toàn):** Bỏ sót hoặc gán nhãn `ignore`/nhầm nhóm cho biển cấm (`prohibitory`: STOP, Cấm đi ngược chiều, Giới hạn tốc độ) hoặc biển cảnh báo nguy hiểm (`warning`) đang hướng thẳng về xe mình. Hậu quả: Xe không nhận biết luật/chướng ngại dẫn tới tai nạn trực diện.
   - **Lỗi chí mạng 2 (False Positive hướng đi):** Gán `facing_ego` cho một biển cấm đang quay lưng hoặc thuộc làn đường ngược chiều cách biệt, dẫn tới xe phanh gấp nguy hiểm (phantom braking).

4. **Khi ambiguity không resolve được, ai / ở đâu là escalation path?**
   - Nếu biển bị che > 80%, quá tối/chói, hoặc không thể suy đoán được thuộc nhóm nào dù đã phóng to zoom tối đa: Đánh dấu attribute `escalate_review = true` (hoặc gán tag `image_escalate` nếu toàn bộ frame bị hỏng).
   - **Escalation path:** Chuyển case sang reviewer/team lead trên kênh trao đổi nội bộ kèm `sample_id` và toạ độ box để đưa ra quyết định chuẩn hóa vào `04_edge_cases/edge_case_cards.md`.

## Scope

- **Trong scope (bắt buộc label):**
  - Tất cả biển báo giao thông chuẩn (theo chuẩn Vienna/GTSDB và chuẩn Mỹ/LISA, BDD100k) còn nguyên vẹn hoặc bị che khuất < 80%.
  - Kích thước bounding box tối thiểu: chiều cao hoặc chiều rộng $\ge 12 \text{ px}$.
  - Biển gắn trên cột, giá long môn (overhead gantry) hoặc rào chắn bên đường.
- **Ngoài scope (ignore):**
  - Biển báo phụ quá nhỏ ($< 12 \text{ px}$) không thể nhận dạng hình khối.
  - Biển báo tạm thời dán trên thân xe tải/xe buýt (không phải biển hạ tầng đường bộ).
  - Bảng hiệu quảng cáo, số nhà, biển tên trạm xăng dầu.
  - Mặt sau của biển báo đã được gắn cọc nhưng không thấy viền/hình phản quang và quay hoàn toàn ngược lại (`facing_away` quay 180° và trơn nhẵn).
- **Geometry tolerance:**
  - Hộp bao (`rectangle`) phải ôm sát mép ngoài của mặt biển báo nhìn thấy (visible contour), không bao gồm cột gắn biển.
  - Sai số cho phép: IoU $\ge 0.85$, lệch mỗi cạnh $\le 3 \text{ px}$ đối với biển $\ge 30 \text{ px}$, và $\le 1.5 \text{ px}$ đối với biển $< 30 \text{ px}$.

## Output chấm được

Mỗi annotation export từ CVAT (định dạng CVAT for images 1.1 / XML hoặc JSON) phải có:
1. `Decision: LABEL`: Bounding box `traffic_sign` kèm đủ các attribute (`sign_group`, `relevance`, `occlusion`, `legibility`).
2. `Decision: IGNORE`: Không tạo box nếu đối tượng thuộc ngoại vi scope (nhỏ hơn 12px, biển quảng cáo, v.v.).
3. `Decision: UNKNOWN / ESCALATE`: Tạo box và chọn `sign_group = other_info` kèm tick `escalate_review = true`.
4. `Decision: TAG ESCALATE`: Gán tag `image_escalate` cho ảnh nếu ảnh hỏng, quá mờ không thể nhận diện toàn cảnh.

## Dữ liệu và giới hạn

- **Nguồn ảnh:** Dữ liệu có sẵn trong repo bao gồm:
  - `data/gtsdb/` (German Traffic Sign Detection Benchmark - ảnh độ phân giải cao 1360x800, biển chuẩn châu Âu đa dạng thời tiết).
  - `data/lisa/` (LISA Traffic Sign - video clip liên tiếp 30 frames 1280x960, chuẩn Mỹ ban ngày).
  - `data/bdd100k/` (BDD100k - ảnh thực tế giao thông thành phố/cao tốc, điều kiện ngày/đêm/mưa).
- **Quy mô dự kiến:** Khoảng 30 - 40 ảnh phân bổ đều qua các split (Calibration, Gold freeze, Blind test).
- **Giới hạn đã biết:** Dữ liệu có sự pha trộn giữa hai hệ thống biển báo (Mỹ và Châu Âu/Việt Nam - ví dụ hình thoi vàng vs tam giác viền đỏ), do đó taxonomy nhóm biển cần quy chuẩn hóa theo công năng (`prohibitory`, `warning`, `mandatory`) thay vì mã số biển cục bộ của một quốc gia.
