# Revision log

Guideline v1 = bản nháp đầu; v2 = sau calibration nội bộ; v3 = sau blind handoff. Mỗi lần tăng `Version` trong
`02_guideline.md`, thêm một hoặc nhiều dòng vào bảng: đổi gì và vì sao, kèm bằng chứng (sample_id, dòng
calibration report, câu hỏi trong clarification log, feedback của peer).

Cột Version ghi dạng `v1`, `v2`, `v3` — `make status` tìm dòng bảng có `v2` và dòng có `v3`.

| Version | Đổi gì | Vì sao | Bằng chứng |
|---|---|---|---|
| v1 | Soạn guideline bbox-only: traffic_sign, quy tắc hình học, ngưỡng kích thước, tag review và ví dụ đề xuất. | Theo phạm vi chỉ bbox đã thống nhất; không phân nhóm hoặc suy đoán hiệu lực với xe. | Xem GTS01, GTS03, GTS07 và GT tham chiếu. Chưa calibration; schema và split cần đồng bộ. |
