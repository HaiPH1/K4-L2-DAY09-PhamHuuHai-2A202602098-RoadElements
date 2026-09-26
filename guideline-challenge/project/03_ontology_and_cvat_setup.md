# Ontology + CVAT setup

Bảng ontology là **source of truth** cho schema CVAT: `03_cvat_labels.json` phải khớp từng dòng ở đây. Thay mọi
placeholder mới là xong (gate G2).

## Ontology table

| Name | Geometry | Type (class / attribute) | Allowed values | Default | Mutable? | Rationale |
|---|---|---|---|---|---|---|
| `traffic_sign` | `rectangle` | class | n/a | n/a | false | Hộp bao ôm trọn mặt nhìn thấy của biển báo giao thông hợp lệ trong scope |
| `sign_group` | n/a | attribute (`traffic_sign`) | `__undefined__`, `prohibitory`, `warning`, `mandatory`, `other_info`, `unknown` | `__undefined__` | false | Phân loại nhóm chức năng theo quy chuẩn an toàn; để default `__undefined__` buộc annotator phải chủ động chọn, tránh bias |
| `relevance` | n/a | attribute (`traffic_sign`) | `__undefined__`, `facing_ego`, `facing_away`, `lateral` | `__undefined__` | false | Hướng hiệu lực của biển đối với xe mình; ngăn ngừa lỗi phanh gấp vô cớ (phantom braking) khi biển quay lưng |
| `occlusion` | n/a | attribute (`traffic_sign`) | `none`, `partial`, `heavy` | `none` | false | Mức độ che khuất bề mặt biển (<10%, 10%-50%, >50%) để downstream lọc dữ liệu huấn luyện |
| `legibility` | n/a | attribute (`traffic_sign`) | `legible`, `unreadable` | `legible` | false | Biển có đủ độ nét/kích thước để con người đọc được nội dung/ký hiệu hay không |
| `escalate_review` | n/a | attribute (`traffic_sign`) | `false` (checkbox) | `false` | false | Đánh dấu các trường hợp khó/ambiguous cần reviewer hoặc team lead phân giải |
| `image_escalate` | `tag` | class (image tag) | n/a | n/a | false | Tag mức độ toàn ảnh khi ảnh bị lỗi nghiêm trọng, vỡ hạt, hoặc không thể gán nhãn |

## Class hay attribute

- **Tại sao `traffic_sign` là class duy nhất, còn lại là attribute:** Tránh hiện tượng bùng nổ class (class explosion). Nếu gộp nhóm biển, hướng quay và che khuất vào class (`prohibitory_facing_ego_occluded`,...) sẽ tạo ra hàng chục class con rất khó quản lý và gây mất cân bằng dữ liệu lớn. Kiến trúc 1 class + multi-attributes giúp downstream model detect bounding box chuẩn xác trước, sau đó phân loại các đặc tính qua multitask classification head.
- **Default gây bias:** Nếu để default của `sign_group` là `prohibitory` hoặc `relevance` là `facing_ego`, annotator khi thao tác nhanh có thể bỏ qua bước chọn, tạo ra hàng loạt nhãn sai "im lặng" (silent false positive) - gây hậu quả cực kỳ nghiêm trọng cho ADAS. Do đó, hai attribute quan trọng này bắt buộc đặt default là `__undefined__`.

## CVAT

- **Phiên bản CVAT** (`make cvat-status`): `CVAT 2.74.1` tại `http://localhost:8080`
- **Tên task calibration** (có version guideline, ví dụ `team07-calib-v1`): `team09-calib-v1`
- **Guide của task đã dán `02_guideline.md`?** có
- **Nhóm dùng Track hay Shape, vì sao:** Nhóm dùng `Shape` vì tập dữ liệu chính (`gtsdb`) là các ảnh tĩnh chụp độc lập tại các vị trí khác nhau; mỗi biển báo là một instance tĩnh không cần liên kết temporal tracking qua các frame.

## Setup test

Một thành viên **chưa tham gia setup** mở task và trả lời: label gì, dùng tool nào, gán attribute nào, khi nào
escalate. Ghi lại ai test và chỗ họ vấp:

- **Người thực hiện test:** Ngô Duy Ngọc (Gold & Edge-case Owner).
- **Kết quả test:** Mở được task calibration trên CVAT, tab Raw nhận diện đủ 1 rectangle class (`traffic_sign`) và 1 tag (`image_escalate`).
- **Chỗ vấp ban đầu:** Khi vẽ box `traffic_sign`, nếu không để ý bảng attribute bên phải thì attribute `sign_group` và `relevance` vẫn ở trạng thái `__undefined__`. Annotator đã được nhắc nhở đây là tính năng có chủ đích để ngăn ngừa quên chọn. Đã kiểm tra tick checkbox `escalate_review` hoạt động bình thường.

