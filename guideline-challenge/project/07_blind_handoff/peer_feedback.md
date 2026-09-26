# Peer feedback + owner response

Phần 1 do **Team 01 (Nhóm peer)** trả lời sau khi gán nhãn gói bàn giao `blind-pack.zip`. Phần 2 do **Team 09 (Nhóm owner)** phân loại và đề xuất hành động kỹ thuật.

- **Nhóm peer:** Team 01
- **Người label blind:** Trịnh Nam Trung (Peer Annotator — Team 01)
- **Thời gian label:** 19:45 – 19:59 (26/09/2026). Bản export cuối là bản cập nhật sau khi tự soát lại, ngoài 15 phút.

## 1. Peer trả lời

1. **Rule nào rõ nhất / giúp quyết định nhanh nhất?**  
   Mục 5.1 phân `sign_group` theo hình dạng + màu viền; ghi rõ "thoi vàng Priority Road → `other_info`" nên `GTS25` quyết được ngay. Ngưỡng $L = \max(w,h)$ với 3 mức ($\ge 30$ / $12\text{--}30$ / $<12\text{ px}$) đo được, không phải đoán.

2. **Rule nào mơ hồ hoặc phải tự suy diễn?**  
   - (a) Mức $12 \le L < 30\text{ px}$ ghi "GÁN NẾU RÕ KHỐI" nhưng không định nghĩa "rõ khối". Cụm biển nhòe chuyển động ở cột trái `GTS24` (khoảng 20–25 px) phải tự quyết là vẽ.
   - (b) `relevance`: `facing_ego < 60°`, `lateral` khoảng 90°, `facing_away > 90°`. Mục 9 chỉ nói escalate ở vùng 50–70°, vùng 70–90° chưa có quy định; relevance cũng không có giá trị unknown nên khi không chắc chỉ còn cách tick `escalate_review`.
   - (c) Biển P vuông nền xanh (`GTS24`, cột trái) không được nêu trong mục 5.1; cùng nền xanh nên dễ nhầm với mandatory, phải tự suy ra là `other_info`.

3. **Sample nào khiến guideline "vỡ"?**  
   - `GTS24`: biển tròn bị cột đèn che quá nửa (bên phải). Có rule amodal nhưng ví dụ chỉ có cành cây che, chưa có ví dụ cột che; tôi chỉ vẽ box phần nhìn thấy vì không chắc phải kéo box sang phía sau cột tới đâu.
   - `GTS25`: biển tên đường xanh trên cột phải (khoảng 30 px, quay ngang). Mục UNCERTAIN_SCOPE chỉ nêu biển số nhà / quảng cáo; nếu tính là "biển chỉ dẫn địa danh" thì theo ngưỡng $\ge 30\text{ px}$ lại bắt buộc gán.
   - `GTS25`: tấm biển trắng rất xa (14×8 px) không rõ mặt trước hay mặt sau → phân vân giữa `facing_away` và `IGNORE` ("mặt sau trơn nhẵn → IGNORE").

4. **Attribute / default nào trong CVAT dễ gây thao tác sai?**  
   `occlusion` mặc định "none" và `legibility` mặc định "legible" đều là giá trị thật, quên đổi thì sai mà không lộ ra; guideline có cảnh báo cho legibility nhưng không có cho occlusion. `sign_group = unknown` đang mang 2 nghĩa: mục 5.1 dùng cho biển phai màu, mục 9 dùng cho escalate.

5. **Một thay đổi cụ thể giúp annotator mới ít hỏi hơn?**  
   Gói gửi đi thiếu thư mục `images/guideline-images/`, nên 5 ảnh mẫu trong mục 8 (`occu`, `sang`, `toi`, `hard`, `troitoi`) không hiển thị trong file HTML; nên đóng gói kèm. Thêm: định nghĩa "rõ khối" bằng tiêu chí đo được, liệt kê biển P / biển chỉ dẫn nền xanh vào `other_info`, và thêm `relevance = unknown` hoặc quy định rõ vùng 60–90°.

## 2. Owner phân loại

Bảng phân loại phản hồi và định hướng kỹ thuật nâng cấp sang Guideline v3:

| Feedback / Quyết định của Peer | Nguyên nhân | Xử lý | Bằng chứng & Hành động kỹ thuật |
|---|---|---|---|
| Mức $12 \le L < 30\text{ px}$ ghi "GÁN NẾU RÕ KHỐI" thiếu định nghĩa định lượng gây phân vân ở `GTS24`. | guideline_gap | accept + revise | Bổ sung định lượng cho "rõ khối": ranh giới tương phản $\ge 15$ giá trị pixel (gradient rõ) hoặc nhận diện được $\ge 3$ cạnh hình học khép kín. |
| Vùng góc quan sát 60°–90° của `relevance` chưa phân định rõ ranh giới giữa `facing_ego` và `lateral`. | guideline_gap | accept + revise | Chuẩn hóa bảng phân vùng góc quay: $[0^\circ, 60^\circ] = \text{facing\_ego}$, $(60^\circ, 120^\circ) = \text{lateral}$, $> 120^\circ = \text{facing\_away}$. Vùng biên $60^\circ \pm 5^\circ$ không chắc chắn thì tick `escalate_review = true`. |
| Biển vuông chữ P nền xanh dễ nhầm với `mandatory` (biển tròn mũi tên). | guideline_gap | accept + revise | Cập nhật Mục 5.1: Biển chữ P vuông/chữ nhật và biển tên đường nền xanh phân loại vào `other_info`. Chỉ biển tròn nền xanh mang biểu tượng mũi tên hành động mới thuộc `mandatory`. |
| Amodal box cho biển bị cột che quá nửa tại `GTS24`: chưa có ví dụ cột kim loại che thẳng đứng. | guideline_gap | accept + revise | Cập nhật quy tắc Amodal Box: khi bị cột/thanh chắn che cắt ngang, annotator lấy đối xứng tâm hình học ước lượng biên vật lý đầy đủ của mặt biển. |
| Biển tên đường quay ngang $\ge 30\text{ px}$ và biển trắng ở xa $14\times 8\text{ px}$ tại `GTS25` gây phân vân scope / facing_away. | data_ambiguity | add_escalation | Biển tên đường công cộng thuộc scope `other_info` (`relevance = lateral/facing_away`). Biển xa không rõ mặt trước/sau: tick `escalate_review = true` để QA Owner phân giải. |
| Thuộc tính `occlusion` có default là `none` tạo bẫy thao tác "Silent Default" tương tự `legibility`. | guideline_gap | accept + revise | Bổ sung hộp cảnh báo vàng kép cho cả `occlusion` và `legibility` vào Checklist Mục 11, yêu cầu kiểm tra kỹ các ca có bóng râm/vật che. |
| `sign_group = unknown` mang 2 nghĩa chồng chéo giữa biển bạc màu và ca escalate. | guideline_gap | accept + revise | Làm rõ ngữ nghĩa: `unknown` chỉ dùng cho biển suy giảm chất lượng vật lý (phai màu/rỉ sét). Biển mơ hồ do góc chụp thì chọn nhóm phán đoán có cơ sở nhất và tick `escalate_review = true`. |
| Thiếu thư mục assets `images/guideline-images/` khiến file visualizer HTML không hiển thị ảnh cục bộ. | guideline_gap | accept + revise | Đóng gói tự động toàn bộ thư mục assets đi kèm trong file zip handoff hoặc nhúng base64/SVG vector trực tiếp để tài liệu self-contained 100%. |
