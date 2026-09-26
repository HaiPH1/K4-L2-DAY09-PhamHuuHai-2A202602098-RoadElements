# Annotation guideline: Hướng dẫn gán bounding box biển báo giao thông — GTSDB

**Version:** v1

## 1. Objective + scope

Tạo dữ liệu phục vụ mô hình phát hiện vị trí biển báo đường bộ trên ảnh tĩnh GTSDB. Mỗi mặt biển được biểu diễn bằng một bounding box nhãn `traffic_sign`. Không phân nhóm biển, đọc nội dung. Bounding box chỉ phục vụ định vị, chưa đủ để quyết định hành động lái xe.

**Trong scope:**
- Mặt trước nhận diện được của biển báo đường bộ: cấm, cảnh báo, hiệu lệnh, ưu tiên, chỉ dẫn; tất cả dùng một nhãn.
- Biển cố định và biển tạm phục vụ tổ chức giao thông; gồm biển ở đường nhánh hoặc phía đối diện nếu thấy mặt trước.
- Biển phụ là tấm riêng, xác định được chức năng bổ sung thông tin giao thông và đạt điều kiện kích thước.
- Biển nhỏ, mờ, nghiêng, bị che hoặc cắt mép theo mục 6–7.
- Nguồn hiện tại: 28 ảnh GTSDB trong repo; không dùng video LISA hay ảnh BDD trong bản này.

**Ngoài scope:** mặt sau biển; cột/giá đỡ; quảng cáo, số nhà, tên cửa hàng, bảng công trường không có chức năng báo hiệu giao thông; hình biển in trên quảng cáo/thân xe; đèn giao thông, cọc tiêu, rào chắn, vạch đường, xe và người.

## 2. Annotation unit

- Gán độc lập từng ảnh bằng **Shape / Rectangle**, không dùng Track.
- Mỗi mặt biển vật lý là một instance, một box `traffic_sign`.
- Nhiều mặt biển cùng cột hoặc sát nhau: mỗi mặt một box.
- Nhiều ký hiệu/dòng chữ trên cùng tấm biển: vẫn một instance.
- Các phần nhìn thấy của cùng biển bị che: vẫn một instance, không tách box.
- Cùng biển xuất hiện trong nhiều ảnh: gán lại từng ảnh, không liên kết ID.

## 3. Geometry rule

- Rectangle song song trục ảnh, ôm sát viền ngoài của **phần mặt biển nhìn thấy**, gồm viền biển; không lấy cột, giá đỡ, bóng đổ hoặc quầng sáng.
- Biển nghiêng vẫn dùng rectangle. Không suy rộng box tới phần bị che hoặc ngoài ảnh.
- Nếu phần nhìn thấy bị tách rời, dùng một box bao các phần chắc chắn cùng mặt biển; box có thể chứa vật che ở giữa.
- Biển cắt mép: box dừng ở biên ảnh.
- Đo ở ảnh gốc: `w = xmax - xmin`, `h = ymax - ymin`, `L = max(w,h)`.
- Gán khi **L >= 12 px**; bỏ qua khi L < 12 px. Không đo theo kích thước hiển thị sau zoom. Chưa xác định được viền để đo thì chuyển review.
- Dung sai QA đề xuất: lệch mỗi cạnh không quá **2 px khi L >= 30 px**, **1 px khi 12 <= L < 30 px**, so với box tham chiếu đã rà soát. Dùng L của box tham chiếu chọn ngưỡng.
- IoU có thể báo cáo bổ sung; không đồng thời áp ngưỡng IoU 0.85 trong v1. Kiểm chứng dung sai qua calibration, đặc biệt với biển nhỏ.

## 4. Taxonomy

| Tên | Loại | Geometry | Ý nghĩa |
|---|---|---|---|
| traffic_sign | Object class | Rectangle | Mặt biển thuộc scope, đủ bằng chứng đặt box |
| image_escalate | Tag toàn ảnh | Không có geometry | Có ít nhất một trường hợp chưa quyết định được hoặc ảnh không đủ chất lượng |

Không có thuộc tính `sign_group`, `relevance`, `legibility`, `occlusion`; không có class `unknown`. Tag review là dấu hiệu quy trình, không phải nhóm biển thứ hai.

Người phụ trách file 03 phải cấu hình đúng class và tag trước khi tạo task; không tự thêm nhãn khi calibration.

## 5. Inclusion / exclusion

| Trường hợp | Quyết định |
|---|---|
| Nhận diện được mặt biển, viền rõ, L >= 12 px | LABEL |
| Không đọc được nội dung nhưng chắc chắn là biển và đặt được box | LABEL |
| Nhiều mặt biển chung cột | LABEL từng mặt riêng |
| Biển phụ là tấm riêng thuộc scope | LABEL nếu đạt kích thước |
| Biển đường nhánh, thấy mặt trước | LABEL, không suy đoán hiệu lực với xe |
| Mặt sau, quảng cáo, cột và đối tượng ngoài scope | IGNORE |
| Chắc chắn L < 12 px | IGNORE |
| Có thể là biển nhưng không đủ bằng chứng hoặc không xác định được viền | ESCALATE |

## 6. Visibility / occlusion

- **Nhỏ/xa:** dùng ngưỡng mục 3; zoom để xem pixel gốc, không dùng công cụ sinh thêm chi tiết để quyết định.
- **Mờ/lóa:** nhận diện được biển và viền thì vẽ phần nhìn thấy, không lấy quầng sáng; không xác định được thì review.
- **Bị che:** vẽ khi nhận diện được mặt biển và giới hạn phần nhìn thấy; không đoán toàn bộ hình dạng. Không dùng ngưỡng che 50%/80% khi chưa có cách ước lượng đáng tin cậy.
- **Cắt mép:** vẽ phần trong ảnh nếu nhận diện được và L >= 12 px.
- **Nghiêng:** không bỏ chỉ vì nghiêng hoặc không đọc được chữ. Chắc chắn mặt sau thì bỏ; chưa phân định được thì review.
- **Phản chiếu:** không gán ảnh phản chiếu của biển trong kính/gương; nếu không phân biệt được, review.

## 7. Ambiguity / escalation

**Biểu diễn trong CVAT:**
1. **LABEL:** tạo box `traffic_sign`.
2. **IGNORE:** không tạo box. Khi chấm, đối chiếu việc không có box ở vùng đã xác định trong gold; export không chứa đối tượng IGNORE riêng.
3. **ESCALATE:** nghi có biển nhưng chưa quyết định được hoặc không đặt được viền thì không vẽ box đoán; gán tag `image_escalate` cho ảnh. Vẫn gán các biển khác đã rõ. Một tag đủ cho ảnh có nhiều ca chưa rõ.
4. **Ảnh hỏng/mờ toàn cảnh:** gán `image_escalate`, không đoán box. Kiểm tra tag có trong export.

Annotator ghi sample_id, vị trí gần đúng và lý do vào nhật ký QA chung, kèm ảnh chụp vùng cần xem. QA owner tiếp nhận, chuyển nhóm trưởng nếu còn bất đồng. Trước freeze, thống nhất quyết định, sửa guideline khi cần, thực hiện LABEL/IGNORE rồi xóa tag nếu mọi ca trong ảnh đã giải quyết. Không chốt gold cho ca còn bất đồng.

Trong blind window, peer gán tag và ghi câu hỏi vào clarification log, không nhờ owner giải thích miệng.

Lỗi bỏ sót biển có vai trò an toàn có thể được định nghĩa critical trong QA/gold trước freeze. Không mặc định mọi lỗi box là critical; bbox không xác định nội dung hay hành động lái xe.

## 8. Temporal rule

Không áp dụng — task ảnh tĩnh. Không dùng track, nội suy hoặc ảnh kế tiếp để suy ra phần không nhìn thấy.

## 9. Examples

**Các ảnh dưới đây là đề xuất, chưa khóa split.** Sample pack hiện trống. Dành GTS01, GTS03, GTS07 cho example hoặc calibration; không dùng chúng làm blind sau khi đã đưa vào guideline.

| sample_id | Thấy gì | Expected output | Rule |
|---|---|---|---|
| GTS01 | Hai cụm biển xếp dọc, mỗi cụm ba mặt biển | Sáu box riêng tại hai cụm; không gom cả cột. Một box tham chiếu bên phải: (723,431)–(752,457) | Mục 2–3 |
| GTS03 | Biển tam giác và biển tròn bên phải; có đèn giao thông phía trên đường | Hai box riêng tại cụm bên phải: tham chiếu (1113,436)–(1152,473), (1117,473)–(1146,502). Không gán đèn giao thông. Đây không phải toàn bộ biển của ảnh | Mục 2, 5 |
| GTS07 | Công trường dưới cầu, có chi tiết nhỏ giống biển; GT nguồn không có dòng nhãn | Không coi GT trống là ảnh âm tính. Xem ứng viên ở ảnh gốc: đủ bằng chứng và L >= 12 thì LABEL, dưới ngưỡng thì IGNORE, chưa rõ thì image_escalate | Mục 3, 6–7 |

Ảnh để đối chiếu:
- [GTS01](../data/gtsdb/GTS01.png)
- [GTS03](../data/gtsdb/GTS03.png)
- [GTS07](../data/gtsdb/GTS07.png)

Cần bổ sung hình có box đúng/sai và ca che khuất sau khi nhóm rà soát, trước blind handoff. Đính kèm hình vào CVAT Guide/gói bàn giao; đường dẫn repo không tự hoạt động trong CVAT.

GT gốc chỉ là tham chiếu. Scope nhóm có thể gồm biển phụ hoặc biển ngoài tập lớp nguồn, nên phải kiểm tra trực quan trước khi chốt gold. Không đưa ảnh hoặc đáp án blind vào guideline.

## 10. Common mistakes

| Lỗi | Cách tránh |
|---|---|
| Gộp nhiều biển cùng cột | Đếm và vẽ từng mặt riêng |
| Lấy cả cột hoặc quầng sáng | Bám viền mặt biển nhìn thấy |
| Vẽ bù phần bị che/ngoài ảnh | Không suy đoán phần khuất |
| Bỏ biển do không đọc được nội dung | Vẫn vẽ nếu nhận diện và đặt được viền |
| Chỉ gán biển được cho là liên quan xe mình | Gán mọi mặt trước thuộc scope |
| Đo 12 px theo màn hình zoom | Đo bằng tọa độ ảnh gốc |
| Coi GT trống là không có biển | Rà soát ảnh theo mục 5–7 |
| Tự thêm nhóm biển | Chỉ dùng traffic_sign và tag review đã cấu hình |
| Để ca mơ hồ trống mà không báo | Thêm image_escalate và ghi lý do |

### Việc cần đồng bộ trước khi sử dụng

- File 01: chuyển về bài bbox-only, không giữ yêu cầu phân nhóm/hướng hiệu lực.
- File 03: cấu hình class và tag đúng mục 4; thử export.
- Sample pack: chốt ảnh example, calibration và blind không trùng nhau.
- Bổ sung hình minh họa, cho thành viên khác làm thử.
- Sau calibration cập nhật v2; sau blind test cập nhật v3; ghi từng lần tăng version vào file 08.
