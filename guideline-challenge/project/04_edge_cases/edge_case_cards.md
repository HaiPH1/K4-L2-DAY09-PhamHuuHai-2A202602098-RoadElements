# Edge-case library

Tối thiểu **8 card**, khuyến nghị 10–12. Một edge case tốt là case mà hai annotator hợp lý có thể làm khác nhau nếu
guideline chưa rõ. Tám ảnh dễ có label rõ ràng không được tính là edge-case library.

Cần có đủ độ đa dạng: occlusion / truncation / small-far · ambiguous semantics · conflicting road elements · **một case
critical-risk** · **một case guideline cho phép escalation**.

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

---

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

CASE ID: EC-03-HEAVY-OCCLUSION-AMODAL
Sample: GTS13
Scene: Lề đường nông thôn nhiều cây xanh rậm rạp, biển báo tam giác cảnh báo bị cành cây vắt ngang thân biển.
Observation: Biển tam giác viền đỏ đỉnh hướng lên bị tán lá cây rậm rạp che mất ~40% diện tích bề mặt ở góc trên bên phải, nhưng 2 góc chân tam giác và màu sắc viền đỏ vẫn lộ rõ.
Decision: LABEL (Vẽ 1 Amodal Bounding Box duy nhất bao trọn tam giác vật lý nguyên bản)
Expected: traffic_sign, sign_group=warning, relevance=facing_ego, occlusion=partial, legibility=legible, escalate_review=false.
Rationale: Object detector cần học biểu diễn đầy đủ hình học của mặt biển vật lý (full physical extent). Việc vẽ lẹm theo tán lá hoặc cắt thành các box vụn sẽ phá hủy ground truth geometry.
Common mistake: Tách thành 2 box nhỏ hoặc thu hẹp box né cành cây làm méo mó aspect ratio.
Diversity: occlusion, edge

---

CASE ID: EC-04-CRITICAL-SPEED-LIMIT-FACING-EGO
Sample: GTS09
Scene: Đường đôi đô thị, biển giới hạn tốc độ tròn viền đỏ nền trắng ở dải phân cách giữa.
Observation: Biển tròn viền đỏ có chữ số rõ ràng hướng thẳng về phía xe mình (facing_ego), không bị che khuất.
Decision: LABEL (Ca an toàn Critical - Không được phép có False Negative)
Expected: traffic_sign, sign_group=prohibitory, relevance=facing_ego, occlusion=none, legibility=legible, escalate_review=false.
Rationale: Lỗi chí mạng nếu bỏ sót hoặc gán sai nhóm/hướng cho biển cấm tốc độ đang hướng thẳng về xe chủ. Xe tự hành ADAS sẽ không điều chỉnh vận tốc an toàn dẫn tới tai nạn hoặc vi phạm pháp luật.
Common mistake: Bỏ sót không vẽ do tập trung vào các biển phía bên phải đường.
Diversity: critical, normal

---

CASE ID: EC-05-LATERAL-SECONDARY-SIGN
Sample: GTS10
Scene: Ngã ba giao cắt với đường nhánh, biển báo đặt ở góc rẽ ngoặt chéo 60 độ.
Observation: Mặt biển quay lệch hẳn sang hướng đường ngang nhánh phụ, xe chạy trên đường chính chỉ nhìn thấy mặt nghiêng góc hẹp.
Decision: LABEL
Expected: traffic_sign, sign_group=warning, relevance=lateral, occlusion=none, legibility=unreadable, escalate_review=false.
Rationale: Gán chính xác relevance=lateral giúp hệ thống xe tự hành không bị nhầm lẫn hiệu lực biển của đường nhánh, ngăn chặn triệt để hiện tượng phanh gấp vô cớ (Phantom Braking).
Common mistake: Nhầm lẫn gán relevance=facing_ego khiến xe tự hành phản ứng sai lệch với luật giao thông của đường khác.
Diversity: conflict, edge

---

CASE ID: EC-06-GLARE-FAR-UNREADABLE
Sample: GTS15
Scene: Tuyến đường quốc lộ ngược hướng mặt trời chiều, ánh sáng tán xạ chói gắt trên mặt đường.
Observation: Biển tròn viền đỏ ở xa (khoảng cách > 65m, kích thước ~15x15 px), viền đỏ nhìn thấy mờ mờ nhưng lòng biển bị lóa trắng, mắt người không thể đọc được chữ số bên trong.
Decision: LABEL
Expected: traffic_sign, sign_group=prohibitory, relevance=facing_ego, occlusion=none, legibility=unreadable, escalate_review=false.
Rationale: Model detector cần bắt được vị trí biển để cảnh báo sự hiện diện, nhưng legibility=unreadable giúp module OCR bỏ qua không cố đọc số sai, xe sẽ tra cứu vận tốc theo bản đồ số HD Map.
Common mistake: Lười đổi thuộc tính mà để nguyên giá trị mặc định legibility=legible của CVAT.
Diversity: small_far, low_visibility, edge

---

CASE ID: EC-07-MULTI-TIER-CLUSTER-STACKED
Sample: GTS20
Scene: Cột biển báo tích hợp nhiều thông tin tại nút giao thông phức hợp.
Observation: Trên cùng 1 cột thép gắn liên hoàn: 1 biển cấm tròn viền đỏ ở trên cùng, 1 biển tam giác cảnh báo ở giữa, và 2 biển phụ chữ nhật màu trắng ở dưới cùng.
Decision: LABEL (Tạo 4 bounding box tiếp giáp riêng biệt)
Expected: 
- Box 1: traffic_sign, sign_group=prohibitory, relevance=facing_ego, occlusion=none, legibility=legible, escalate_review=false.
- Box 2: traffic_sign, sign_group=warning, relevance=facing_ego, occlusion=none, legibility=legible, escalate_review=false.
- Box 3: traffic_sign, sign_group=other_info, relevance=facing_ego, occlusion=none, legibility=legible, escalate_review=false.
- Box 4: traffic_sign, sign_group=other_info, relevance=facing_ego, occlusion=none, legibility=legible, escalate_review=false.
Rationale: Tuân thủ nghiêm ngặt nguyên tắc 1-Object-1-Box; bảo đảm tách bạch các nhóm chức năng khác nhau để các đầu ra phân loại hoạt động độc lập.
Common mistake: Vẽ 1 box to bao bọc toàn bộ cột biển hoặc gộp chung 2 biển phụ bên dưới thành 1.
Diversity: conflict, ambiguity, multi_tier

---

CASE ID: EC-08-ESCALATION-AMBIGUOUS-ORIENTATION
Sample: GTS08
Scene: Khúc cua gắt tay áo sườn núi, biển báo gắn trên lan can uốn cong bị rung lắc cơ học nghiêng 40 độ.
Observation: Biển báo nghiêng chéo góc bất định, vừa có xu hướng hướng về làn đường chính vừa có góc mở sang lối rẽ đất phụ.
Decision: ESCALATE (Gắn cờ kiểm định chuyên sâu)
Expected: traffic_sign, sign_group=warning, relevance=__undefined__, occlusion=none, legibility=legible, escalate_review=true.
Rationale: Trong các trường hợp bất định hình học về hướng hiệu lực mà annotator không đủ bằng chứng kết luận 100%, quy trình cho phép kích hoạt escalate_review=true để QA Owner và Reviewer phân giải độc lập.
Common mistake: Tự ý phán đoán theo cảm tính cá nhân dẫn tới không nhất quán giữa các annotator.
Diversity: ambiguity, escalation
