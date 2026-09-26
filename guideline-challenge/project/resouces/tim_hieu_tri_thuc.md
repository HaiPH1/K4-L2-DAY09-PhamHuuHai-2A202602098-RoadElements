# Day 08: Tìm Hiểu Tri Thức – Kỹ Thuật Phân Chia Dữ Liệu (Train - Val - Test), Bản Chất Ground Truth & Phòng Chống Data Leakage Tuyệt Đối Trong Computer Vision & ADAS

> **Khóa học:** K4 AI / Computer Vision (VinUni / VinFast AI)  
> **Chủ đề chính:** Data Pipeline & Governance, Chiến lược phân chia Dataset chuẩn mực (Train / Val / Test), Giải mã bản chất Ground Truth, Các hình thức Rò rỉ Dữ liệu (Data Leakage) trong Thị giác máy tính và Xe tự hành, Giải thuật & Chốt chặn Kiểm định (Release Gate) tự động chống Leakage.  
> **Tài liệu tham chiếu:** `Day07-Data-pipeline-and-Governance-Demo`, Slide bài giảng VinUni AI20K, Chuẩn công nghiệp MLOps & Autonomous Driving.

---

## MỤC LỤC TỔNG QUAN

1. [Giải Mã Khái Niệm Cốt Lõi: Train, Val, Test vs Ground Truth](#1-giải-mã-khái-niệm-cốt-lõi-train-val-test-vs-ground-truth)
   - 1.1. Bản chất của bộ ba phân vùng: Train – Validation (Dev) – Test
   - 1.2. Ground Truth là gì và tại sao "Ground Truth không phải là tập dữ liệu thứ 3 riêng biệt"?
   - 1.3. Ngữ cảnh đặc biệt: "Hidden Ground Truth / Private Test" trong Benchmarking & Thi đấu AI
2. [Data Leakage Là Gì? Kẻ Giết Chết Thầm Lặng Của Mô Hình AI](#2-data-leakage-là-gì-kẻ-giết-chết-thầm-lặng-của-mô-hình-ai)
   - 2.1. Định nghĩa toán học & bản chất rò rỉ thông tin
   - 2.2. Nghịch lý "Điểm thi cao ngất nhưng ra đường gây tai nạn"
   - 2.3. Nguyên lý bất biến: *"Đề thi không bao giờ được phép nằm trong sách bài tập"*
3. [Phân Loại 5 Kiểu Data Leakage Chí Mạng Trong Computer Vision & ADAS](#3-phân-loại-5-kiểu-data-leakage-chí-mạng-trong-computer-vision--adas)
   - 3.1. Rò rỉ thời gian / Khung hình lân cận (Temporal & Adjacent Frame Leakage)
   - 3.2. Rò rỉ địa lý / Không gian (Spatial & Location Leakage)
   - 3.3. Rò rỉ chủ thể / Định danh (Subject & Identity Leakage – In-Cabin DMS)
   - 3.4. Rò rỉ do trạng thái dừng đỗ & Khung hình gần trùng (Near-Duplicate Leakage)
   - 3.5. Rò rỉ quy trình xử lý dữ liệu (Preprocessing & Pipeline Leakage)
4. [So Sánh Các Chiến Lược Phân Chia Dữ Liệu (Splitting Strategies)](#4-so-sánh-các-chiến-lược-phân-chia-dữ-liệu-splitting-strategies)
   - 4.1. Bảng so sánh toàn diện: Random vs Group-by-Clip vs Group-by-Location
   - 4.2. Sơ đồ luồng quyết định lựa chọn chiến lược chia tập (Decision Tree)
5. [Giải Thuật & Quy Trình Kỹ Thuật Chia Tập Không Bị Leakage (Zero-Leakage Pipeline)](#5-giải-thuật--quy-trình-kỹ-thuật-chia-tập-không-bị-leakage-zero-leakage-pipeline)
   - 5.1. Bước 1: Thu thập Metadata & Nhóm phân vùng (Metadata-driven Partitioning)
   - 5.2. Bước 2: Quét ảnh tương đồng bằng Feature Embedding / Perceptual Hash
   - 5.3. Bước 3: Thuật toán phân bổ Disjoint Group & Stratification
   - 5.4. Bước 4: Mã hóa ngẫu nhiên có kiểm soát (Fixed Seed Reproducibility)
6. [Hệ Thống Chốt Chặn Kiểm Định Tự Động (Automated Leakage Guardrail & Release Gate)](#6-hệ-thống-chốt-chặn-kiểm-định-tự-động-automated-leakage-guardrail--release-gate)
   - 6.1. Triết lý Governance: *"mAP đẹp không bao giờ là lý do để Release nếu có Leakage"*
   - 6.2. Cấu trúc file Evidence (`leakage_report.json`)
   - 6.3. Mã nguồn mẫu giải thuật quét Leakage (Scanner Algorithm)
7. [Tổng Kết Bài Học Kinh Nghiệm & Checklist Hành Động](#7-tổng-kết-bài-học-kinh-nghiệm--checklist-hành-động)

---

## 1. Giải Mã Khái Niệm Cốt Lõi: Train, Val, Test vs Ground Truth

Khi bước vào kỹ nghệ dữ liệu (Data Engineering) và MLOps, một trong những hiểu lầm thường gặp nhất là sự nhầm lẫn giữa **các phân vùng dữ liệu (Data Partitions)** và **thuộc tính nhãn (Ground Truth Annotation)**.

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       TOÀN BỘ BỘ DỮ LIỆU THỰC ĐỊA                                      │
│                                           (RAW COLLECTED DATA)                                         │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │ Được gán nhãn chuẩn xác
                                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              GROUND TRUTH (CHÂN LÝ NỀN TẢNG CỦA TOÀN DỰ ÁN)                            │
│                  Tất cả các bounding box, segmentation mask, keypoints do người gán chuẩn                │
└───────────────────────────────────────────────────┬────────────────────────────────────────────────────┘
                                                    │ Chia độc lập (Zero Leakage Split)
                      ┌─────────────────────────────┼─────────────────────────────┐
                      ▼                             ▼                             ▼
┌──────────────────────────────────┐ ┌─────────────────────────────┐ ┌──────────────────────────────────┐
│         TRAIN SET (70%)          │ │       VAL / DEV SET (15%)   │ │          TEST SET (15%)          │
│ • Có Ground Truth để tính Loss   │ │ • Có Ground Truth để đo     │ │ • Có Ground Truth để nghiệm thu  │
│ • Model trực tiếp cập nhật trọng │ │   mAP, chọn checkpoint và   │ │   độc lập (Holdout Benchmark),   │
│   số (Backpropagation)           │ │   tinh chỉnh siêu tham số   │ │   tuyệt đối không chạm vào code  │
└──────────────────────────────────┘ └─────────────────────────────┘ └──────────────────────────────────┘
```

### 1.1. Bản chất của bộ ba phân vùng: Train – Validation (Dev) – Test

Trong thực tế kỹ nghệ học máy tiêu chuẩn, dữ liệu được chia làm 3 tập với chức năng toán học và vận hành hoàn toàn tách biệt:

1. **Training Set (Tập huấn luyện – thường chiếm 70% – 80%):**
   - **Mục đích:** Cung cấp mẫu cho thuật toán tối ưu hóa (Gradient Descent, AdamW) học các trọng số mạng ($W, b$).
   - **Cơ chế:** Mô hình "nhìn thấy" cả ảnh và nhãn Ground Truth tương ứng. Sai số dự đoán được tính qua hàm Loss ($\mathcal{L}_{\text{total}} = \mathcal{L}_{\text{box}} + \mathcal{L}_{\text{cls}} + \mathcal{L}_{\text{dfl}}$) và lan truyền ngược (Backpropagation) để cập nhật tham số.

2. **Validation Set (Tập kiểm định / Development Set – thường chiếm 10% – 15%):**
   - **Mục đích:** Đánh giá năng lực tổng quát hóa của mô hình **trong quá trình huấn luyện**, hỗ trợ chọn mô hình tốt nhất (Best Checkpoint Selection), tinh chỉnh siêu tham số (Hyperparameter Tuning: learning rate, weight decay, IoU threshold) và dừng sớm (Early Stopping) khi mô hình bắt đầu bị quá khớp (overfitting).
   - **Lưu ý kỹ thuật:** Dù trọng số mô hình không được cập nhật trực tiếp trên tập Validation, người kỹ sư AI vẫn "gián tiếp" tối ưu hóa quyết định dựa trên chỉ số của tập này. Do đó, tập Validation **vẫn có thể bị rò rỉ thiên kiến (bias leakage)** sau hàng trăm lần thử nghiệm.

3. **Test Set (Tập kiểm thử độc lập / Holdout Set – thường chiếm 10% – 15%):**
   - **Mục đích:** Đóng vai trò là "Kỳ thi tốt nghiệp chuẩn quốc gia". Tập này dùng để đo lường năng lực thực sự của mô hình trên dữ liệu chưa từng gặp trước khi triển khai (Production Deployment).
   - **Kỷ luật vàng:** Tập Test **chỉ được phép chạy duy nhất một lần (hoặc vài lần khi nghiệm thu phiên bản)**. Tuyệt đối không được nhìn vào kết quả Test Set để quay lại chỉnh siêu tham số, đổi kiến trúc mạng hay can thiệp vào quá trình train.

---

### 1.2. Ground Truth là gì và tại sao "Ground Truth không phải là tập dữ liệu thứ 3 riêng biệt"?

> [!IMPORTANT]
> **ĐỊNH NGHĨA KỸ THUẬT CHUẨN MỰC:**  
> **Ground Truth (Chân lý nền tảng)** không phải là một tập con phân chia cùng cấp với Train và Test. Ground Truth là **tập hợp các nhãn đúng tuyệt đối do con người thiết lập (Human-verified gold standard)**.  
> Cả 3 tập **Train**, **Validation**, và **Test** đều **BẮT BUỘC PHẢI CÓ GROUND TRUTH** đi kèm:
> - **Train có Ground Truth:** Để tính độ chênh lệch (Loss) và dạy mô hình.
> - **Validation có Ground Truth:** Để so sánh IoU/mAP giữa dự đoán và đáp án, từ đó chọn model tốt nhất.
> - **Test có Ground Truth:** Để hội đồng thẩm định (QA/Mentor/Khách hàng) chấm điểm độ chính xác cuối cùng của hệ thống.

Nếu một tập ảnh không có Ground Truth, đó là **Dữ liệu thô chưa gán nhãn (Unlabeled Raw Data)** hoặc dữ liệu chạy thực tế ngoài đời (Inference Data), chứ không thể dùng làm tập đánh giá hay huấn luyện có giám sát.

---

### 1.3. Ngữ cảnh đặc biệt: "Hidden Ground Truth / Private Test" trong Benchmarking & Thi đấu AI

Trong một số bối cảnh đặc thù (các cuộc thi Kaggle, AI Benchmark, hệ thống nộp bài thi VinUni/VinFast):
- Ban tổ chức chia dữ liệu thành: `Train`, `Public Test`, và `Private Test (Ground Truth Holdout)`.
- Khi đó, thí sinh/kỹ sư chỉ được tải về ảnh của tập Test mà **bị giấu đi file Ground Truth**. Sau khi mô hình suy luận ra kết quả, file dự đoán được gửi lên server; server sẽ dùng **Ground Truth ẩn (Hidden Ground Truth)** để chấm điểm tự động.
- Đây chính là nguồn gốc khiến nhiều người nhầm lẫn gọi "Ground Truth" là một tập con thứ 3 riêng biệt thay cho Validation hay Test set.

---

## 2. Data Leakage Là Gì? Kẻ Giết Chết Thầm Lặng Của Mô Hình AI

### 2.1. Định nghĩa toán học & bản chất rò rỉ thông tin

**Data Leakage (Rò rỉ dữ liệu)** xảy ra khi thông tin từ ngoài tập huấn luyện (thông tin từ tập Validation, Test hoặc thông tin tương lai) bị vô tình đưa vào hoặc làm ô nhiễm quá trình huấn luyện mô hình.

Về mặt xác suất thống kê:
Giả sử tập dữ liệu phân phối theo $P(X, Y)$. Một mô hình tổng quát tốt phải tối ưu:
$$\min_{\theta} \mathbb{E}_{(X, Y) \sim P_{\text{test}}} [\mathcal{L}(f(X; \theta), Y)]$$
Khi xảy ra Data Leakage, phân phối điều kiện của dữ liệu kiểm thử bị phụ thuộc chặt vào dữ liệu huấn luyện:
$$I(X_{\text{test}}; X_{\text{train}}) \gg \epsilon \quad \text{hoặc} \quad P(Y_{\text{test}} \mid X_{\text{test}}, X_{\text{train}}) \neq P(Y_{\text{test}} \mid X_{\text{test}})$$
Trong đó $I(\cdot ; \cdot)$ là lượng thông tin tương hỗ (Mutual Information). Mô hình không học quy luật tổng quát của thế giới thực $f: X \rightarrow Y$ mà chỉ đơn thuần "nhớ mặt" hoặc "tra bảng" các đặc trưng đã bị rò rỉ.

---

### 2.2. Nghịch lý "Điểm thi cao ngất nhưng ra đường gây tai nạn"

Trong xe tự hành ADAS và thị giác máy tính, hậu quả của Data Leakage là thảm họa:

```text
┌──────────────────────────────────────────────┐
│  QUÁ TRÌNH HUẤN LUYỆN & KIỂM THỬ (PHÒNG LAB) │
│  • Split ngẫu nhiên từng frame (Random Split)│
│  • Frame t vào Train, Frame t+1 vào Test     │
│  ===> mAP@50 đạt 98.6% (Báo cáo cực đẹp!)    │
└──────────────────────┬───────────────────────┘
                       │ Mang mô hình nạp lên xe thật chạy ngoài phố
                       ▼
┌──────────────────────────────────────────────┐
│        VẬN HÀNH THỰC TẾ (PRODUCTION)         │
│  • Gặp ngã tư mới, góc nắng mới, xe cộ mới   │
│  • Mô hình mất phương hướng, bỏ sót người đi │
│    bộ (False Negative chí mạng)              │
│  ===> GÂY TAI NẠN – SỤP ĐỔ HỆ THỐNG AN TOÀN  │
└──────────────────────────────────────────────┘
```

> [!CAUTION]
> **BÀI HỌC THỰC CHIẾN:**  
> Một chỉ số mAP cao chót vót ($>95\%$) trên tập Test đối với bài toán đường phố thực tế không phải là dấu hiệu của một mô hình siêu việt, mà $90\%$ là dấu hiệu cảnh báo của **Data Leakage** hoặc **Tập dữ liệu bị trùng lặp nặng**.

---

### 2.3. Nguyên lý bất biến: *"Đề thi không bao giờ được phép nằm trong sách bài tập"*

Nguyên lý cơ bản nhất của việc kiểm định mô hình AI:
1. Tập Test phải đại diện cho **những gì mô hình sẽ phải đối mặt trong tương lai mà nó CHƯA TỪNG THẤY trong quá khứ**.
2. Bất kỳ thông tin nào xuất hiện ở Test mà có sự tương đồng gần như tuyệt đối với Train (cùng xe, cùng người, cùng góc phố, cùng thời điểm quay video) đều biến kỳ thi thành trò "học vẹt".

---

## 3. Phân Loại 5 Kiểu Data Leakage Chí Mạng Trong Computer Vision & ADAS

Trong xử lý dữ liệu dạng bảng (Tabular Data), data leakage thường là chuẩn hóa toàn bộ cột trước khi chia. Nhưng trong **Computer Vision và Xe tự hành**, data leakage tinh vi và đa dạng hơn rất nhiều.

```text
                                  ┌────────────────────────────────────────┐
                                  │   5 KIỂU DATA LEAKAGE TRONG CV & ADAS  │
                                  └───────────────────┬────────────────────┘
          ┌───────────────────┬───────────────────────┼───────────────────────┬───────────────────┐
          ▼                   ▼                       ▼                       ▼                   ▼
┌──────────────────┐ ┌──────────────────┐   ┌──────────────────┐    ┌──────────────────┐ ┌──────────────────┐
│   1. TEMPORAL    │ │   2. SPATIAL     │   │   3. SUBJECT     │    │   4. DUPLICATE   │ │  5. PIPELINE     │
│   (Thời gian)    │ │   (Địa lý)       │   │   (Chủ thể DMS)  │    │   (Dừng đỗ trùng)│ │  (Tiền xử lý)    │
├──────────────────┤ ├──────────────────┤   ├──────────────────┤    ├──────────────────┤ ├──────────────────┤
│ Frame t: Train   │ │ Clip A: Sáng     │   │ Tài xế Tuấn:     │    │ Xe dừng đèn đỏ,  │ │ Chuẩn hóa mean,  │
│ Frame t+1: Test  │ │ Clip B: Chiều    │   │ Train 800 frame, │    │ camera ghi 30    │ │ std hoặc Augment │
│ Cách nhau 33ms   │ │ Cùng ngã tư      │   │ Test 200 frame   │    │ frame y hệt      │ │ trước khi chia   │
└──────────────────┘ └──────────────────┘   └──────────────────┘    └──────────────────┘ └──────────────────┘
```

### 3.1. Rò rỉ thời gian / Khung hình lân cận (Temporal & Adjacent Frame Leakage)

- **Cơ chế phát sinh:** Camera trên xe tự hành ghi hình ở tốc độ 30 FPS (30 khung hình/giây). Khoảng cách giữa 2 khung hình liên tiếp chỉ là $\Delta t = \frac{1}{30} \approx 33.3\text{ ms}$.
- **Nguyên nhân lỗi:** Kỹ sư dùng lệnh `train_test_split(images, test_size=0.2, random_state=42)`. Hàm này xáo trộn ngẫu nhiên toàn bộ frame ảnh.
- **Hệ quả:**
  - Frame số `0012` (thời điểm $t$) rơi vào tập **Train**.
  - Frame số `0013` (thời điểm $t + 33\text{ms}$) rơi vào tập **Test**.
  - Vị trí xe cộ, ánh sáng mặt trời, biển số xe, người đi bộ trong 2 frame này gần như dịch chuyển chưa tới vài pixel. Mô hình Test đạt mAP 99% vì nó đã "học thuộc lòng" frame `0012`.
- **Dấu hiệu nhận biết trong Report:** Báo cáo kiểm định phát hiện `"reason": "adjacent_frame"` với `|frame_index_A - frame_index_B| <= 2` thuộc cùng `clip_id`.

---

### 3.2. Rò rỉ địa lý / Không gian (Spatial & Location Leakage)

- **Cơ chế phát sinh:** Kỹ sư đã tiến bộ hơn, chia tập dữ liệu theo Clip (Group-by-Clip). Clip số 1 (100 frame) vào Train, Clip số 2 (100 frame) vào Test.
- **Lỗ hổng tiềm ẩn (Case B trong Day 07 Demo):**
  - Chiếc xe thu thập dữ liệu đi qua ngã tư Trần Phú lúc 08h00 sáng (`clip00`).
  - Chiếc xe đó (hoặc xe khác trong đội xe) lại đi qua chính ngã tư Trần Phú đó vào lúc 16h00 chiều (`clip03`).
  - Nếu `clip00` nằm ở Train và `clip03` nằm ở Val/Test: Dù góc nắng có đổi nhẹ, **toàn bộ background tĩnh (tòa nhà, cột đèn, vỉa hè, biển báo cố định)** hoàn toàn trùng khớp!
- **Hệ quả:** Mô hình Object Detector học thuộc đặc trưng nền (background context) của ngã tư Trần Phú để dự đoán, thay vì học nhận diện hình thái xe cộ độc lập với môi trường. Khi đem sang ngã tư Nguyễn Trãi, mô hình suy giảm hiệu năng nghiêm trọng.
- **Giải pháp:** Phải nhóm dữ liệu theo **`location_id` (Địa điểm địa lý độc lập)** chứ không dừng lại ở `clip_id`.

---

### 3.3. Rò rỉ chủ thể / Định danh (Subject & Identity Leakage – In-Cabin DMS)

- **Cơ chế phát sinh trong hệ thống giám sát khoang lái (Driver Monitoring System):**
  - Thu thập 10.000 frame hình ảnh của 20 tài xế khác nhau đang lái xe mô phỏng (ngủ gật, ngáp, bấm điện thoại, nhìn gương).
- **Lỗ hổng:** Chia ngẫu nhiên theo ảnh hoặc chia theo video clip ngắn của cùng một người: Tài xế Nguyễn Văn A có clip 1 ở Train, clip 2 ở Test.
- **Hệ quả:** Mạng nơ-ron nhận diện khuôn mặt và nét mặt đặc thù của riêng tài xế A (màu da, dáng mắt, nếp nhăn) thay vì học đặc trưng "nhắm mắt / gật đầu" tổng quát của nhân loại.
- **Kỷ luật:** Phải chia theo **`subject_id` (Disjoint Subjects)**: Dữ liệu của 15 người dùng để Train; dữ liệu của 5 người còn lại tuyệt đối chỉ dùng cho Test. Mô hình bắt buộc phải dự đoán đúng trên người mà nó chưa từng gặp bao giờ!

---

### 3.4. Rò rỉ do trạng thái dừng đỗ & Khung hình gần trùng (Near-Duplicate Leakage)

- **Cơ chế phát sinh:**
  - Xe tự hành dừng chờ đèn đỏ 90 giây ở ngã tư, hoặc di chuyển trong tình trạng tắc đường cục bộ.
  - Cảm biến camera vẫn ghi hình đều đặn 1 frame mỗi giây (hoặc mỗi 5 giây).
  - Kết quả: Hàng chục frame có quang cảnh tĩnh $99.9\%$ y hệt nhau.
- **Hệ quả:** Nếu không phát hiện và loại bỏ các ảnh trùng lặp hoặc nhóm chúng vào cùng một tập, các bản sao của cảnh dừng đỗ này sẽ phân tán sang cả Train và Val/Test.
- **Giải pháp:** Sử dụng **Image Embedding Cosine Similarity** hoặc **Perceptual Hash (pHash)** để quét độ tương đồng. Bất kỳ cặp ảnh nào có $\text{Similarity} \ge 0.985$ phải được gộp chung nhóm (Cluster) hoặc loại bỏ bớt khung trùng lặp (Deduplication) trước khi chia.

---

### 3.5. Rò rỉ quy trình xử lý dữ liệu (Preprocessing & Pipeline Leakage)

- **Tính toán thống kê toàn cục:** Tính giá trị trung bình (mean) và độ lệch chuẩn (std) của toàn bộ tập dữ liệu (Pixel normalization) trước khi chia Train/Val/Test. Khi đó, mean/std của tập Test đã "chảy" vào tập Train.
- **Tăng cường dữ liệu (Data Augmentation) sai thứ tự:** Tăng cường dữ liệu (xoay ảnh, đổi màu, cắt dán) trên toàn bộ folder ảnh rồi mới chia tập. Khi đó, bản gốc nằm ở Train còn bản xoay/lật nằm ở Test $\rightarrow$ Rò rỉ 100%!
- **Quy chuẩn bất biến:** Mọi phép tính thống kê (fit) và tăng cường dữ liệu (augmentation) **CHỈ ĐƯỢC PHÉP THỰC HIỆN TRÊN TẬP TRAIN SAU KHI ĐÃ TÁCH TẬP**.

---

## 4. So Sánh Các Chiến Lược Phân Chia Dữ Liệu (Splitting Strategies)

### 4.1. Bảng so sánh toàn diện: Random vs Group-by-Clip vs Group-by-Location

| Tiêu chí so sánh | Chiến lược 1: Random Frame Split | Chiến lược 2: Group-by-Clip Split | Chiến lược 3: Group-by-Location / Subject (Chuẩn Công Nghiệp) |
| :--- | :--- | :--- | :--- |
| **Cách thức thực hiện** | Xáo trộn ngẫu nhiên từng frame ảnh bất kỳ trong dataset. | Giữ nguyên từng đoạn clip ngắn (ví dụ: mỗi clip 100-300 frames); phân bổ clip vào Train/Val/Test. | Phân bổ toàn bộ các clip/frame thuộc cùng một **Địa điểm (Location)** hoặc **Chủ thể (Subject)** vào duy nhất một tập. |
| **Nguy cơ Temporal Leakage** | **CỰC KỲ CAO (100% FAIL)**: Frame $t$ và $t+1$ bị xé lẻ sang cả 2 bên. | **TRIỆT TIÊU**: Các frame liền kề trong cùng 1 clip luôn nằm chung một tập. | **TRIỆT TIÊU**: Không bao giờ bị rò rỉ frame lân cận. |
| **Nguy cơ Spatial / Subject Leakage** | **CỰC KỲ CAO**: Mọi clip, mọi góc phố đều bị phân tán đều vào cả 2 bên. | **VẪN CÒN NGUY CƠ**: Cùng ngã tư quay ở 2 clip khác nhau vẫn rơi vào cả Train và Test. | **TRIỆT TIÊU TOÀN DIỆN**: Ngã tư đã xuất hiện ở Train thì Test không bao giờ có ngã tư đó nữa. |
| **Độ chân thực của chỉ số mAP** | **ẢO TƯỞNG**: mAP thường rất cao ($>95\%$), tạo cảm giác an tâm giả tạo. | **TRUNG BÌNH**: Phản ánh tốt hơn, nhưng vẫn bị thiên lệch nếu trùng bối cảnh. | **TRUNG THỰC & KHẮT KHE**: mAP có thể thấp hơn 5-10% trong lab, nhưng đem ra đường chạy thật là chạy được ngay! |
| **Độ phức tạp khi triển khai** | Rất đơn giản (`scikit-learn` 1 dòng lệnh). | Cần metadata `clip_id` trong file annotation. | Đòi hỏi hệ thống Data Governance có siêu dữ liệu: `location_id`, GPS, `subject_id`, thời tiết. |
| **Kết luận ứng dụng** | **CẤM DÙNG** cho dữ liệu dạng chuỗi/video trong Computer Vision. | Tạm chấp nhận cho bài toán thử nghiệm nhanh nội bộ nếu các clip quay ở các địa điểm hoàn toàn khác biệt. | **TIÊU CHUẨN BẮT BUỘC** cho dự án sản xuất xe tự hành, ADAS và camera an ninh. |

---

### 4.2. Sơ đồ luồng quyết định lựa chọn chiến lược chia tập (Decision Tree)

```text
                                  ┌───────────────────────────────┐
                                  │ BẮT ĐẦU: CẦN CHIA DATASET     │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                    /───────────────────────────\
                                   <  Dữ liệu có yếu tố video/   >
                                   <  chuỗi thời gian hay không? >
                                    \───────────────────────────/
                                           │              │
                                        CÓ │              │ KHÔNG
                                           ▼              ▼
                    /─────────────────────────────\    ┌───────────────────────────┐
                   < Có thông tin Vị trí / Địa lý  >   │ Có thông tin Định danh     │
                   < (Location ID / GPS / Tuyến)? >   │ Chủ thể (Subject ID)?     │
                    \─────────────────────────────/    └─────────────┬─────────────┘
                             │              │                        │
                          CÓ │              │ KHÔNG                  │
                             ▼              ▼                        ▼
                ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
                │ GROUP-BY-LOCATION│ │ GROUP-BY-CLIP    │ │ GROUP-BY-SUBJECT     │
                │ Đảm bảo ngã tư,  │ │ Kết hợp lọc      │ │ (Tài xế, Bệnh nhân,  │
                │ tuyến đường độc  │ │ Embedding Cosine │ │ Khuôn mặt người)     │
                │ lập giữa các tập │ │ khử duplicate    │ │ Disjoint Groups      │
                └──────────────────┘ └──────────────────┘ └──────────────────────┘
```

---

## 5. Giải Thuật & Quy Trình Kỹ Thuật Chia Tập Không Bị Leakage (Zero-Leakage Pipeline)

Để đảm bảo không bị rò rỉ dữ liệu một cách tuyệt đối, quy trình kỹ thuật phải tuân thủ nghiêm ngặt 4 bước:

### 5.1. Bước 1: Thu thập Metadata & Nhóm phân vùng (Metadata-driven Partitioning)
Trong file annotation gốc (ví dụ COCO JSON hoặc CVAT XML), mỗi frame hình không chỉ có `id` và `file_name`, mà bắt buộc phải mang theo các siêu dữ liệu quản trị (Governance Metadata):
- `clip_id`: Mã nhận diện đoạn video clip gốc.
- `frame_index`: Số thứ tự khung hình trong đoạn clip.
- `location_id`: Mã định danh địa điểm thực tế (ví dụ: `intersection_tran_phu`, `highway_ct01`).
- `scene_id` / `time_of_day`: Mã phân cảnh, thời điểm (ban ngày, hoàng hôn, ban đêm, trời mưa).

### 5.2. Bước 2: Quét ảnh tương đồng bằng Feature Embedding / Perceptual Hash
Trước khi quyết định chia tập, chạy một tiến trình kiểm tra tự động đo lường độ tương đồng ngữ nghĩa:
- Trích xuất vector đặc trưng $E_i = \text{Encoder}(I_i)$ bằng một mô hình trích xuất đặc trưng nhẹ (ví dụ: MobileNet, ResNet hoặc DinoV2).
- Tính ma trận Cosine Similarity:
  $$\text{Sim}(I_a, I_b) = \frac{E_a \cdot E_b}{\|E_a\|_2 \|E_b\|_2}$$
- Nếu $\text{Sim}(I_a, I_b) \ge 0.985$: Hệ thống tự động gộp $I_a$ và $I_b$ vào cùng một cụm (Cluster), ép buộc chúng phải rơi vào cùng một phân vùng hoặc loại bỏ bớt 1 ảnh để tránh nhiễu.

### 5.3. Bước 3: Thuật toán phân bổ Disjoint Group & Stratification
- Lấy danh sách các nhóm độc lập $\mathcal{G} = \{g_1, g_2, \dots, g_M\}$ (với $g$ là một `location_id` hoặc `subject_id`).
- Xáo trộn danh sách nhóm bằng một Random Seed cố định.
- Phân bổ tích lũy theo tỷ lệ mục tiêu (ví dụ 70% Train, 15% Val, 15% Test) sao cho:
  $$\mathcal{G}_{\text{train}} \cap \mathcal{G}_{\text{val}} = \emptyset, \quad \mathcal{G}_{\text{train}} \cap \mathcal{G}_{\text{test}} = \emptyset, \quad \mathcal{G}_{\text{val}} \cap \mathcal{G}_{\text{test}} = \emptyset$$
- Kiểm tra độ cân bằng phân phối nhãn (Stratification Check): Đảm bảo các class hiếm (xe cứu thương, người khuyết tật) vẫn xuất hiện ở cả 3 tập theo tỷ lệ tương ứng.

### 5.4. Bước 4: Mã hóa ngẫu nhiên có kiểm soát (Fixed Seed Reproducibility)
- Kỷ luật quản trị: Không bao giờ chạy lệnh random mà không khai báo hạt giống ngẫu nhiên:
  ```python
  import random
  import numpy as np

  RANDOM_SEED = 42
  random.seed(RANDOM_SEED)
  np.random.seed(RANDOM_SEED)
  ```
- File kết quả chia tập (`split.json`) phải được lưu trữ phiên bản, băm SHA-256 (`split_sha256`) và ký duyệt vào `manifest.yaml`.

---

## 6. Hệ Thống Chốt Chặn Kiểm Định Tự Động (Automated Leakage Guardrail & Release Gate)

Trong hệ sinh thái MLOps công nghiệp của bài thực hành Day 07/08, một bộ dữ liệu muốn được bàn giao (Release) cho nhóm Model Training phải bước qua cánh cổng **Release Gate**.

### 6.1. Triết lý Governance: *"mAP đẹp không bao giờ là lý do để Release nếu có Leakage"*

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        DATA RELEASE GATEWAY                            │
│                                                                        │
│   [Kiểm tra Định dạng]        [Kiểm tra Bảo mật PII]                   │
│   • Round-trip PASS           • Che biển số / khuôn mặt PASS           │
│   • Class mapping PASS        • Không rò rỉ GPS sidecar PASS           │
│                                                                        │
│   [Kiểm tra Rò rỉ Dữ liệu (Leakage Gate)]                              │
│   • adjacent_frame count == 0                                          │
│   • same_location count == 0                                           │
│   • near_duplicate count == 0                                          │
│                                                                        │
│   ===> NẾU LEAKAGE COUNT > 0: QUYẾT ĐỊNH NGAY LẬP TỨC: BLOCK!          │
│        (Bất kể mAP của mô hình có cao tới 99%!)                        │
└────────────────────────────────────────────────────────────────────────┘
```

> [!WARNING]
> **TIÊU CHUẨN XỬ LÝ RELEASE GATE:**
> - Trạng thái **PASS**: Mọi tiêu chí an toàn dữ liệu đều đạt $\rightarrow$ Cấp tem **BÀN GIAO / RELEASE**.
> - Trạng thái **REWORK**: Lỗi kỹ thuật chuyển đổi định dạng, mất mát thông tin nhãn có thể sửa được $\rightarrow$ Trả về cho đội Data Tooling chỉnh sửa script.
> - Trạng thái **BLOCK**: Phát hiện **Data Leakage** hoặc **Rò rỉ thông tin cá nhân (PII)** $\rightarrow$ Dừng toàn bộ dự án, cấm đưa vào huấn luyện cho đến khi dữ liệu được phân chia lại sạch sẽ!

---

### 6.2. Cấu trúc file Evidence (`leakage_report.json`)

Khi chạy kịch bản quét rò rỉ (`scripts/scan_leakage.py`), hệ thống sinh ra file bằng chứng minh bạch:

```json
{
  "split_strategy": "group_by_location",
  "threshold": 0.985,
  "leak_count": 0,
  "status": "PASS",
  "reason_counts": {
    "adjacent_frame": 0,
    "same_location": 0,
    "near_duplicate": 0
  },
  "top_leaks": []
}
```

Nếu chạy theo chiến lược sai (`random_frame` hoặc `group_by_clip` chia sai ngã tư):
```json
{
  "split_strategy": "random_frame",
  "threshold": 0.985,
  "leak_count": 14,
  "status": "FAIL",
  "reason_counts": {
    "adjacent_frame": 10,
    "same_location": 4,
    "near_duplicate": 0
  },
  "top_leaks": [
    {
      "image_a": "clip00_frame012.jpg", "split_a": "train",
      "image_b": "clip00_frame013.jpg", "split_b": "val",
      "similarity": 0.9942,
      "adjacent": true,
      "reason": "adjacent_frame"
    }
  ]
}
```

---

### 6.3. Mã nguồn mẫu giải thuật quét Leakage (Scanner Algorithm)

Dưới đây là mã nguồn Python thực chiến (dựa trên module chuẩn `scan_leakage.py` trong dự án) dùng để quét và phát hiện rò rỉ giữa các phân vùng:

```python
"""
Mô-đun kiểm định rò rỉ dữ liệu tự động (Leakage Scanner).
Chống rò rỉ: Adjacent Frames, Same Location, và Near-Duplicates.
"""
from __future__ import annotations
import numpy as np
from pathlib import Path
from typing import Dict, List, Any

def scan_dataset_leakage(
    images_metadata: List[Dict[str, Any]],
    split_mapping: Dict[str, str], # image_id -> 'train' | 'val' | 'test'
    embeddings: Dict[str, np.ndarray], # image_id -> vector đặc trưng
    similarity_threshold: float = 0.985
) -> Dict[str, Any]:
    leaks = []
    ids = list(split_mapping.keys())
    
    for i, id_a in enumerate(ids):
        for id_b in ids[i + 1:]:
            part_a = split_mapping[id_a]
            part_b = split_mapping[id_b]
            
            # Nếu 2 ảnh nằm cùng một tập (cùng train hoặc cùng test) thì không tính là leak
            if part_a == part_b:
                continue
                
            meta_a = images_metadata[id_a]
            meta_b = images_metadata[id_b]
            
            # Tính Cosine Similarity giữa 2 ảnh
            vec_a = embeddings[id_a]
            vec_b = embeddings[id_b]
            sim = float(np.dot(vec_a, vec_b) / (np.linalg.norm(vec_a) * np.linalg.norm(vec_b)))
            
            same_clip = meta_a.get("clip_id") == meta_b.get("clip_id")
            same_location = bool(meta_a.get("location_id")) and (meta_a.get("location_id") == meta_b.get("location_id"))
            
            # Kiểm tra 2 frame liền kề trong cùng clip
            adjacent = same_clip and abs(meta_a.get("frame_index", 0) - meta_b.get("frame_index", 0)) <= 2
            
            reason = None
            if adjacent:
                reason = "adjacent_frame"
            elif same_location:
                reason = "same_location"
            elif sim >= similarity_threshold:
                reason = "near_duplicate"
                
            if reason:
                leaks.append({
                    "image_a": meta_a["file_name"], "split_a": part_a,
                    "image_b": meta_b["file_name"], "split_b": part_b,
                    "similarity": round(sim, 4),
                    "reason": reason,
                    "location_id": meta_a.get("location_id") if same_location else None
                })
                
    return {
        "total_leaks": len(leaks),
        "status": "FAIL" if leaks else "PASS",
        "leaks_detail": leaks
    }
```

---

## 7. Tổng Kết Bài Học Kinh Nghiệm & Checklist Hành Động

> [!TIP]
> ### CHECKLIST VÀNG PHÒNG CHỐNG DATA LEAKAGE:
> 1. [ ] **Hiểu đúng thuật ngữ:** Phân định rõ Train, Validation, Test là 3 phân vùng độc lập; Ground Truth là nhãn đúng chuẩn mực có mặt ở cả 3 phân vùng.
> 2. [ ] **Tuyệt đối không dùng Random Frame Split** trên dữ liệu chuỗi video thời gian thực.
> 3. [ ] **Áp dụng Group-by-Location** cho bài toán nhận diện ngoài đường (Autonomous Driving / Traffic CV).
> 4. [ ] **Áp dụng Group-by-Subject** cho bài toán giám sát người (In-Cabin DMS, Face Recognition).
> 5. [ ] **Khử trùng lặp (Deduplication):** Quét Perceptual Hash hoặc Embedding Similarity để loại bỏ ảnh tĩnh trùng lặp khi xe dừng đỗ.
> 6. [ ] **Đóng băng quy trình tiền xử lý:** Chỉ fit scaler, normalizer và thực hiện Data Augmentation trên tập Train.
> 7. [ ] **Bảo vệ tính tái lập:** Cố định `random_seed`, ghi vết `split.json`, tính mã SHA-256 kiểm định.
> 8. [ ] **Cương quyết với Release Gate:** Nếu phát hiện dù chỉ 1 trường hợp Data Leakage $\rightarrow$ Lập tức BLOCK và REWORK, không bao giờ nhượng bộ trước chỉ số mAP đẹp giả tạo!
