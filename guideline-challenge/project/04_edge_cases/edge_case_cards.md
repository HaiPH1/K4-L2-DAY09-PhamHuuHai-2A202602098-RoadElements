# Edge-case library

Tối thiểu **8 card**, khuyến nghị 10–12. Một edge case tốt là case mà hai annotator hợp lý có thể làm khác nhau nếu
guideline chưa rõ. Tám ảnh dễ có label rõ ràng không được tính là edge-case library.

Cần có đủ độ đa dạng: occlusion / truncation / small-far · ambiguous semantics · conflicting road elements · **một case
critical-risk** · **một case guideline cho phép escalation**.

File này là kho nội bộ của nhóm, **không gửi cho peer**. Card dùng ảnh example/calibration thì chép rule + ví dụ sang
`02_guideline.md` (mục 7 và 9) để peer đọc được. Card về ảnh blind chỉ nằm ở đây, và decision của nó phải có trong
`gold_decisions.csv` trước `make freeze`.

`make status` đếm số dòng `CASE ID:` đã điền (đã thay placeholder). Copy khối dưới cho mỗi case.

---

CASE ID: EC-01-DISTANT-TWO-COLOR
Sample: GTS01
Scene: Đường quốc lộ ngoại ô, cụm biển báo ở cự ly xa bên lề đường
Observation: Cột biển báo ở xa (khoảng cách > 50m), quan sát phóng to 100% thấy 2 mảng màu tách biệt theo trục dọc: mảng trên màu đỏ viền tròn (kích thước ~14x13 px), mảng dưới màu trắng hình chữ nhật (kích thước ~14x11 px).
Decision: LABEL (Bắt buộc tạo 2 box riêng biệt)
Expected: 
- Box 1: traffic_sign, sign_group=prohibitory, relevance=facing_ego, occlusion=none, legibility=unreadable, escalate_review=false.
- Box 2: traffic_sign, sign_group=other_info, relevance=facing_ego, occlusion=none, legibility=unreadable, escalate_review=false.
Rationale: Hợp đồng downstream contract yêu cầu phân tách từng mặt biển độc lập để multitask attribute classification head học đúng phân loại nhóm biển và tránh làm méo mó tỷ lệ khung hình bounding box.
Common mistake: Gộp chung cả 2 mảng màu vào 1 bounding box to, hoặc chỉ vẽ biển đỏ ở trên mà bỏ quên biển phụ màu trắng ở dưới.
Diversity: small_far, conflict, edge

CASE ID: EC-02-GANTRY-NIGHT-SIGNS
Sample: troitoi.png (images/guideline-images/troitoi.png)
Scene: Đường cao tốc ban đêm có hệ thống chiếu sáng đèn cao áp vàng, giá long môn khung thép vắt ngang các làn đường.
Observation: Trên giá long môn có 2 biển chỉ dẫn kích thước lớn bằng vật liệu phản quang (biển xanh lá "Jahra 80" và biển xanh dương "Doha / Salmiya 4"). Giàn thép và cột đèn cao áp gắn liền phía trên và hai bên.
Decision: LABEL (Tách biệt 2 box biển báo, loại trừ hoàn toàn giàn thép và cột đèn)
Expected: 
- Box 1: traffic_sign, sign_group=other_info, relevance=facing_ego, occlusion=none, legibility=legible, escalate_review=false. Ôm sát viền phản quang của biển xanh lá.
- Box 2: traffic_sign, sign_group=other_info, relevance=facing_ego, occlusion=none, legibility=legible, escalate_review=false. Ôm sát viền phản quang của biển xanh dương.
- Giàn thép giá long môn & bóng đèn cao áp: IGNORE (không vẽ bounding box).
Rationale: Downstream model nhận diện biển báo đường bộ phục vụ điều hướng xe tự hành. Việc bao trùm cả khung thép giá long môn sẽ làm sai lệch nghiêm trọng tỷ lệ aspect ratio (gây false positive cho object detector) và làm nhiễu đặc trưng visual của biển báo.
Common mistake: Vẽ 1 bounding box khổng lồ ôm trọn cả giá long môn cùng 2 biển, hoặc bao trùm cả thanh đà thép vào box của từng biển.
Diversity: conflict, ambient_light, overhead_gantry

---

CASE ID: TODO
Sample: TODO (sample_id)
Scene: TODO
Observation: TODO — thấy gì trong ảnh
Decision: TODO — LABEL / IGNORE / UNKNOWN / ESCALATE
Expected: TODO — class, attribute, geometry cụ thể
Rationale: TODO — gắn với downstream contract ở `01_problem_statement.md`
Common mistake: TODO
Diversity: TODO — occlusion / small_far / ambiguity / conflict / critical / escalation / …

---

