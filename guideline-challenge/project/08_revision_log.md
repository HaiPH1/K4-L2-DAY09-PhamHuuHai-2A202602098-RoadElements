# Revision log

Guideline v1 = bản nháp đầu; v2 = sau calibration nội bộ; v3 = sau blind handoff. Mỗi lần tăng `Version` trong
`02_guideline.md`, thêm một hoặc nhiều dòng vào bảng: đổi gì và vì sao, kèm bằng chứng (sample_id, dòng
calibration report, câu hỏi trong clarification log, feedback của peer).

Cột Version ghi dạng `v1`, `v2`, `v3` — `make status` tìm dòng bảng có `v2` và dòng có `v3`.

| Version | Đổi gì | Vì sao | Bằng chứng |
|---|---|---|---|
| v1 | Soạn guideline bbox-only: traffic_sign, quy tắc hình học, ngưỡng kích thước, tag review và ví dụ đề xuất. | Theo phạm vi chỉ bbox đã thống nhất; không phân nhóm hoặc suy đoán hiệu lực với xe. | Xem GTS01, GTS03, GTS07 và GT tham chiếu. Chưa calibration; schema và split cần đồng bộ. |
| v2 | Nâng cấp toàn diện sang phân tầng taxonomy: bổ sung đầy đủ 5 thuộc tính (sign_group, relevance, occlusion, legibility, escalate_review); định nghĩa 2 lỗi chí mạng (Critical 1: bỏ sót biển an toàn facing_ego; Critical 2: gán nhầm facing_ego cho biển quay lưng/đường phụ gây phantom braking); chuẩn hóa dung sai IoU >= 0.85, lệch cạnh <= 3px/1.5px; tích hợp ma trận quyết định và ví dụ thực tế GTSDB. Chuẩn hóa theo Bước 5/11 của Challenge: bổ sung quy tắc bắt buộc tách 2 box cho edge case cụm biển ở xa có 2 màu khác nhau (mảng đỏ và mảng trắng/xanh tiếp giáp nhau), quy định ranh giới pixel tiếp giáp và mã lỗi phòng ngừa E-08. | Đồng bộ hóa với Problem Statement của Spec Owner (Phạm Hữu Hải) và schema CVAT của CVAT Owner (Vương Tuấn Dương); giải quyết triệt để bất đồng gộp biển khi calibration; khắc phục chỗ vấp quên chọn attribute do default __undefined__; ngăn ngừa lỗi bỏ sót biển phụ ở cự ly xa; đáp ứng ràng buộc downstream ADAS L2+/L3. | `01_problem_statement.md`, `03_cvat_labels.json`, `03_ontology_and_cvat_setup.md`, `04_edge_cases/edge_case_cards.md` (EC-01), hình ảnh thực tế `data/gtsdb/GTS01.png`, `GTS02.png`, `GTS03.png`, `GTS07.png`. |
