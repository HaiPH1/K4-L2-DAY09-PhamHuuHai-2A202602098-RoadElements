# QA plan + quality gates

Kế hoạch kiểm soát chất lượng dữ liệu gán nhãn biển báo giao thông (Traffic Sign Taxonomy) phục vụ downstream model tự hành ADAS Level 2+/3.

## Flow

Quy trình vòng đời chất lượng: **Guideline v1/v2 → Calibration → Production Annotation → Self-QC (Annotator tự kiểm 100%) → QA Review → Rework → Quality Gate Release**.

- **Ai review, review bao nhiêu:**
  - **Reviewer:** Phạm Xuân Duy (QA Owner) và Ngô Duy Ngọc (Gold/Edge-case Owner).
  - **Tỷ lệ kiểm định:** Kiểm tra 100% đối với các ảnh chứa nhãn `critical` hoặc gắn tag `edge`, `occlusion`, `conflict`. Đối với các ảnh điều kiện chuẩn (`normal`), áp dụng lấy mẫu ngẫu nhiên tối thiểu **30%** lô ảnh.
- **Chọn sample theo rule nào:**
  - Ưu tiên 1 (Stratified High-Risk Sampling): 100% các sample có chứa biển cấm dừng/đỗ, biển cấm đi ngược chiều, giới hạn tốc độ và biển cảnh báo nguy hiểm (`sign_group` = `prohibitory` / `warning`).
  - Ưu tiên 2 (Edge & Ambiguity Sampling): 100% các frame có đánh dấu checkbox `escalate_review` = `true` hoặc tag `image_escalate`.
  - Ưu tiên 3 (Random Sampling): 30% các sample còn lại để kiểm tra độ trôi chất lượng (quality drift).
- **Issue được ghi ở đâu, đóng thế nào:**
  - Ghi nhận lỗi và bất đồng trực tiếp trên issue tracking của CVAT (chức năng Issue/Comment gắn theo bounding box cụ thể) và đồng bộ vào bảng theo dõi nội bộ `clarification_log.csv`.
  - Một Issue chỉ được đóng (Closed) khi Annotator đã sửa đổi trực tiếp trên CVAT, QA Reviewer kiểm tra lại đạt chuẩn và xác nhận "Resolved".
- **Khi phát hiện guideline gap thì update và version ra sao:**
  - Khi xuất hiện ca biên mới hoặc mâu thuẫn diễn giải mà 2 annotator không thống nhất: Tạm thời gắn cờ `escalate_review = true`.
  - QA Owner triệu tập họp nhanh 10 phút, đối chiếu downstream contract với Spec Owner, thống nhất quy tắc mới.
  - Cập nhật quy tắc mới vào `02_guideline.md`, nâng version (v1 → v2 → v3) và ghi rõ lý do/bằng chứng vào `08_revision_log.md`.

## Defect severity

Phân cấp mức độ khuyết tật dựa trên tác động trực tiếp đến an toàn vận hành xe tự hành:

| Severity | Định nghĩa cho project này | Ví dụ | Action mặc định |
|---|---|---|---|
| Critical | Lỗi đe dọa trực tiếp an toàn tính mạng, có nguy cơ gây tai nạn đối đầu hoặc phanh gấp đột ngột (Phantom Braking). | Bỏ sót biển STOP / Cấm đi ngược chiều (False Negative); gán nhầm biển cấm thành biển thông tin; gán nhầm `facing_ego` cho biển `facing_away`. | REJECT toàn bộ batch của annotator, dừng gán nhãn để đào tạo lại ngay lập tức (100% rework). |
| Major | Lỗi làm sai lệch điều hướng hành trình hoặc vi phạm luật giao thông đường bộ. | Gán sai biển hiệu lệnh bắt buộc rẽ (`mandatory`) thành biển chỉ dẫn (`other_info`); bỏ sót biển phụ cự ly hiệu lực gắn dưới biển chính; gộp 2 biển xếp chồng vào 1 box to. | Yêu cầu Annotator sửa lại (Rework) toàn bộ các ca liên quan trong lô dữ liệu. |
| Minor | Lỗi dung sai hình học nhỏ, không làm đổi bản chất phân loại của vật thể. | Bounding box lẹm viền hoặc rộng hơn mép biển 2–3 px; IoU nằm trong khoảng 0.75 – 0.85; quên không chuyển `legibility` sang `unreadable` cho biển ở cự ly xa > 60m. | Annotator chỉnh sửa cục bộ tại các vị trí QA gắn cờ trước khi xuất dữ liệu. |
| Question | Tình huống bất định về thị giác trong dữ liệu ảnh thực tế cần chuyên gia phân giải. | Biển báo bị gỉ sét biến dạng hoàn toàn, cành cây che rậm rạp > 80% không rõ viền, hoặc biển bị phản quang lóa trắng xóa. | Gán `escalate_review = true` để Hội đồng kỹ thuật phân giải, đưa vào Thư viện Ca biên. |

## Metrics

Hệ thống chỉ số định lượng đo lường chất lượng nhãn:

| Metric | Cách tính | Vì sao phù hợp với bài toán |
|---|---|---|
| Defect Rate ($DR$) | $\frac{\text{Tổng số lỗi (Critical} \times 3 + \text{Major} \times 2 + \text{Minor} \times 0.5)}{\text{Tổng số vật thể được kiểm tra}} \times 100\%$ | Đo lường mức độ sai sót toàn diện có tính đến trọng số nguy hiểm của từng loại lỗi. |
| Box Tightness (IoU) | $\text{IoU} = \frac{\text{Area}(B_{\text{annotator}} \cap B_{\text{QA}})}{\text{Area}(B_{\text{annotator}} \cup B_{\text{QA}})}$ | Đảm bảo bounding box ôm khít mặt biển vật lý, tránh nhiễu background cho detector. |
| Attribute Accuracy | $\frac{\text{Số attribute gán đúng}}{\text{Tổng số attribute kiểm tra}} \times 100\%$ | Đảm bảo tính nhất quán của multi-task attribute classification head. |

- **Metric high-risk tách riêng (Critical Defect Escape Rate):**
  $$\text{Critical Escape Rate} = \frac{\text{Số lỗi Critical lọt qua khâu Self-QC}}{\text{Tổng số vật thể Critical trong mẫu kiểm tra}} \times 100\%$$
  **Yêu cầu bắt buộc:** $\text{Critical Escape Rate} = 0\%$. Bất kỳ trường hợp bỏ sót biển cấm hoặc biển nguy hiểm nào bị phát hiện đều kích hoạt dừng quy trình.

## Quality gate

Quy chuẩn nghiệm thu chất lượng để chuyển giao dữ liệu sang bước tiếp theo:

```text
PASS if:
  - Critical Defect Count = 0 (Không có bất kỳ lỗi Critical nào)
  - Major Defect Rate <= 2.0%
  - Minor Defect Rate <= 5.0%
  - Average IoU >= 0.85 trên toàn bộ các bounding box
  - Tỷ lệ giá trị mặc định __undefined__ = 0% trên các trường sign_group và relevance

REWORK if:
  - Critical Defect Count = 0 NHƯNG
  - Major Defect Rate > 2.0% và <= 5.0%, HOẶC
  - Average IoU trong khoảng [0.75, 0.85), HOẶC
  - Còn sót giá trị __undefined__ trên 1–3 vật thể.
  -> Trả về cho annotator sửa trong vòng 30 phút.

REJECT / ESCALATE if:
  - Phát hiện >= 1 lỗi Critical (False Negative ở biển ưu tiên an toàn), HOẶC
  - Major Defect Rate > 5.0%, HOẶC
  - Average IoU < 0.75 (vẽ cẩu thả, lệch viền nghiêm trọng).
  -> Hủy bỏ kết quả của lô, dừng toàn bộ tiến trình để tổ chức họp coaching lại guideline.
```

Trade-off: Chấp nhận dung sai nhỏ (Minor) về độ khít mép viền (1-2 px) đối với các biển nhỏ ở cự ly xa ($12 \le L < 20\text{ px}$) để tối ưu tốc độ gán nhãn của annotator, nhưng giữ kỷ luật tuyệt đối 0% sai số đối với thuộc tính phân loại an toàn (`prohibitory` / `warning`) và hướng hiệu lực (`facing_ego`).
