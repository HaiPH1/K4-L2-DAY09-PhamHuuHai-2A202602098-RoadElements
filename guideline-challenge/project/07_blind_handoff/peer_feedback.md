# Peer feedback + owner response

Phần 1 do **Team 01 (Nhóm peer)** trả lời sau khi gán nhãn gói bàn giao `blind-pack.zip`. Phần 2 do **Team 09 (Nhóm owner)** phân loại và đề xuất hành động kỹ thuật.

- **Nhóm peer:** Team 01
- **Người label blind:** Hoàng Minh Tuấn (Peer Annotator — Team 01)

## 1. Peer trả lời

1. **Rule nào rõ nhất / giúp quyết định nhanh nhất?**  
   Quy tắc phân tầng taxonomy trong Mục 5 và Mục 7 của guideline: quy định tách riêng biển phụ (`other_info`) và biển chính (`prohibitory` / `warning`) trên cùng một cột rất rõ ràng, giúp không bị lúng túng khi gặp cụm biển xếp chồng.

2. **Rule nào mơ hồ hoặc phải tự suy diễn?**  
   Quy tắc về ranh giới biển ở cự ly xa ($12 \le L < 20\text{ px}$): khi zoom 100% thấy viền tròn đỏ mờ, lúc đầu chưa chắc chắn có nên bật checkbox `escalate_review` hay không, sau đối chiếu quy định đã chủ động gán `legibility = unreadable`.

3. **Sample nào khiến guideline "vỡ"?**  
   Không có sample nào làm vỡ guideline; tuy nhiên sample `GTS20` có mật độ biển báo dày đặc (14 biển) khiến thời gian gán nhãn kéo dài, cần có thêm hình vẽ tổng thể minh họa quy cách đánh số thứ tự cho cụm biển phức tạp.

4. **Attribute / default nào trong CVAT dễ gây thao tác sai?**  
   Thuộc tính `legibility` có default là `legible`, nếu annotator thao tác vội rất dễ quên không chuyển sang `unreadable` đối với các biển nhỏ ở cự ly xa. Rất may bảng checklist Mục 11 đã nhắc nhở điều này.

5. **Một thay đổi cụ thể giúp annotator mới ít hỏi hơn?**  
   Bổ sung trực tiếp ảnh ví dụ cắt crop (visual crops) của các biển nhỏ ở cự ly xa vào ngay dưới bảng phân tầng thuộc tính Mục 5 để annotator có mốc đối chiếu trực quan tức thì.

## 2. Owner phân loại

Bảng phân loại phản hồi và định hướng nâng cấp sang Guideline v3:

| Feedback / decision sai | Nguyên nhân (guideline gap / data ambiguity / execution error) | Xử lý (accept + revise / reject with evidence / add escalation rule) | Bằng chứng |
|---|---|---|---|
| Nguy cơ quên đổi thuộc tính `legibility = unreadable` cho biển ở xa do default CVAT là `legible`. | guideline_gap | accept + revise | Bổ sung hộp cảnh báo màu vàng "Default Value Trap" tại Mục 5.2 và Mục 11 trong Guideline v3. |
| Cụm biển dày đặc đa tầng trên sample `GTS20` tốn nhiều thời gian nhận diện biển chính / biển phụ. | guideline_gap | accept + revise | Bổ sung sơ đồ trực quan hóa cụm biển nhiều tầng vào Thư viện Ca biên `EC-07` và nâng cấp Guideline v3. |
| Biển quay chéo góc 30–45 độ khó xác định hiệu lực làn xe. | data_ambiguity | add_escalation | Giữ vững quy tắc: khi không chắc chắn hiệu lực làn xe chủ thì tick `escalate_review = true` để QA Owner phân giải. |
