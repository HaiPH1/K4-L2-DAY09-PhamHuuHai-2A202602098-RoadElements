# Revision log

Guideline v1 = bản nháp đầu; v2 = sau calibration nội bộ; v3 = sau blind handoff. Mỗi lần tăng `Version` trong
`02_guideline.md`, thêm một hoặc nhiều dòng vào bảng: đổi gì và vì sao, kèm bằng chứng (sample_id, dòng
calibration report, câu hỏi trong clarification log, feedback của peer).

Cột Version ghi dạng `v1`, `v2`, `v3` — `make status` tìm dòng bảng có `v2` và dòng có `v3`.

| Version | Đổi gì | Vì sao | Bằng chứng |
|---|---|---|---|
| v1 | Soạn guideline bbox-only: traffic_sign, quy tắc hình học, ngưỡng kích thước, tag review và ví dụ đề xuất. | Theo phạm vi chỉ bbox đã thống nhất; không phân nhóm hoặc suy đoán hiệu lực với xe. | Xem GTS01, GTS03, GTS07 và GT tham chiếu. Chưa calibration; schema và split cần đồng bộ. |
| v2 | Nâng cấp toàn diện sang phân tầng taxonomy: bổ sung đầy đủ 5 thuộc tính (sign_group, relevance, occlusion, legibility, escalate_review); định nghĩa 2 lỗi chí mạng (Critical 1: bỏ sót biển an toàn facing_ego; Critical 2: gán nhầm facing_ego cho biển quay lưng/đường phụ gây phantom braking); chuẩn hóa dung sai IoU >= 0.85, lệch cạnh <= 3px/1.5px; tích hợp ma trận quyết định và ví dụ thực tế GTSDB. Chuẩn hóa theo Bước 5/11 của Challenge: bổ sung quy tắc bắt buộc tách 2 box cho edge case cụm biển ở xa có 2 màu khác nhau (mảng đỏ và mảng trắng/xanh tiếp giáp nhau), quy định ranh giới pixel tiếp giáp và mã lỗi phòng ngừa E-08. | Đồng bộ hóa với Problem Statement của Spec Owner (Phạm Hữu Hải) và schema CVAT của CVAT Owner (Vương Tuấn Dương); giải quyết triệt để bất đồng gộp biển khi calibration; khắc phục chỗ vấp quên chọn attribute do default __undefined__; ngăn ngừa lỗi bỏ sót biển phụ ở cự ly xa; đáp ứng ràng buộc downstream ADAS L2+/L3. | `01_problem_statement.md`, `03_cvat_labels.json`, `03_ontology_and_cvat_setup.md`, `04_edge_cases/edge_case_cards.md` (EC-01), hình ảnh thực tế `data/gtsdb/GTS01.png`, `GTS02.png`, `GTS03.png`, `GTS07.png`. |
| v3 | Bổ sung hộp cảnh báo màu vàng "Default Value Trap" cho thuộc tính `legibility` chống quên đổi mặc định trên CVAT; hoàn thiện quy tắc Amodal Box cho trường hợp che khuất > 50% nhưng mắt người vẫn nhận biết được loại biển; chuẩn hóa quy cách tách box cụm biển nhiều tầng phức hợp (multi-tier stacked); hoàn tất bộ 8 thẻ Ca biên hoàn chỉnh. | Khắc phục các rào cản và phản hồi từ phiên kiểm thử mù độc lập (Blind Handoff Test) với Team 01; đạt điểm khả năng chuyển giao hoàn hảo GTS = 100.0/100; phòng ngừa sai sót gán nhãn hàng loạt cho các biển ở xa hoặc ngược nắng chói lóa. | Báo cáo kiểm định `07_blind_handoff/transfer_score.csv`, phản hồi `07_blind_handoff/peer_feedback.md`, tóm tắt `07_blind_handoff/gts_summary.md`, thư viện ca biên `04_edge_cases/edge_case_cards.md` (EC-01 đến EC-08). |

## Ghi chú về Refreeze (`refreeze_count = 2`)
- **Lý do Refreeze:** Nhóm thực hiện refreeze để đồng bộ hóa chính xác tập blind split thực tế đã bàn giao trong gói `peer_team.zip` cho Team 01 (`GTS24`, `GTS25`, `GTS26`, `GTS27`, `GTS28`) thay cho tập blind dự kiến ban đầu, đồng thời chuẩn hóa 16 quyết định vàng (`gold_decisions.csv`) tương ứng với bối cảnh mới trước khi nhập bài gán nhãn thực tế của peer.
- **Bảo toàn nguyên tắc:** Quy trình refreeze tuân thủ nghiêm ngặt quy định: được thực hiện trước khi import kết quả gán nhãn của peer để chấm điểm, đảm bảo tính khách quan và toàn vẹn của bài test mù.
