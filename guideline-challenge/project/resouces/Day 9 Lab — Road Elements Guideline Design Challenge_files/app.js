/**
 * Day 9 Lab — Road Elements Guideline Design Challenge
 * Interactive Step-by-Step Guide Core Logic & Dataset
 * Strictly follows lab-humanizer & generative_ui standards.
 */

// Global State
const state = {
  currentStepIndex: 0,
  completedSteps: new Set(),
  selectedOS: localStorage.getItem('day9_os') || 'win', // 'win' | 'posix'
  theme: localStorage.getItem('day9_theme') || 'dark', // 'dark' | 'light'
};

// Checklists State (keyed by step id)
const checklistState = JSON.parse(localStorage.getItem('day9_checklists') || '{}');

// Save / Load Completed Steps
function loadCompletedSteps() {
  const saved = localStorage.getItem('day9_completed_steps');
  if (saved) {
    try {
      state.completedSteps = new Set(JSON.parse(saved));
    } catch (e) {
      state.completedSteps = new Set();
    }
  }
}

function saveCompletedSteps() {
  localStorage.setItem('day9_completed_steps', JSON.stringify([...state.completedSteps]));
}

// 11 Step Definitions
const LAB_STEPS = [
  {
    id: 1,
    part: "Phần I: Khung lý thuyết & giới thiệu",
    title: "1. Bối cảnh & bản chất lab",
    fullTitle: "Bước 1 · Bối cảnh kỹ thuật & triết lý bài lab",
    timeline: "Giới thiệu chung",
    gate: null,
    desc: "Hiểu đúng mục tiêu bài lab: Xây dựng một annotation system chuyển giao được thay vì thi vẽ hình đẹp.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Bối cảnh kỹ thuật: Bài toán road elements trong xe tự hành
        </h2>
        <p>
          Trong các hệ thống lái tự động (Autonomous Driving) và hỗ trợ lái nâng cao (ADAS), mô hình thị giác máy tính phải nhận diện chuẩn xác các thực thể mặt đường: vạch kẻ làn, vùng di chuyển được (drivable area), biển báo, và đèn giao thông.
        </p>
        <p>
          Thực tế kỹ thuật chứng minh: <strong>Một mô hình dù tối tân đến đâu cũng sẽ thất bại nếu dữ liệu huấn luyện có nhãn mâu thuẫn hoặc đặc tả kỹ thuật (guideline) mơ hồ.</strong> Khi gặp thời tiết xấu, bóng cây đổ, vạch mờ hay nút giao phức tạp, nếu không có quy chuẩn rõ ràng, mỗi annotator sẽ tự gán nhãn theo cảm tính cá nhân, tạo ra nhiễu hệ thống (systemic noise) làm tê liệt mô hình downstream.
        </p>

        <div class="callout callout-info">
          <div class="callout-body">
            <span class="callout-title">Chuyển dịch tư duy kỹ sư</span>
            Bài lab này không chấm ai vẽ hình đẹp nhất trên CVAT. Mục tiêu của bạn là chuyển dịch từ vai trò <em>người vẽ nhãn cảm tính</em> sang <strong>Kỹ sư thiết kế quy chuẩn dữ liệu (Data Specifier / Annotation Architect)</strong> — người có khả năng đóng gói một bài toán phức tạp thành một hệ thống vận hành độc lập.
          </div>
        </div>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Định nghĩa hoàn thành (Definition of Done)
        </h2>
        <p>
          Bài lab chỉ được coi là hoàn thành khi: <strong>Một nhóm khác (peer team) sử dụng bộ tài liệu guideline và CVAT task của nhóm bạn, thao tác hoàn toàn độc lập, và tạo ra kết quả gán nhãn trùng khớp với kỳ vọng bạn đã khóa (freeze) từ trước.</strong>
        </p>
        <p>
          Nếu người khác không thể làm theo guideline của bạn khi không có bạn đứng bên cạnh giải thích miệng, hệ thống quy chuẩn của bạn coi như chưa đạt yêu cầu bàn giao.
        </p>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Ma trận phân nhiệm 4 vai trò (ai làm gì)
        </h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 18%;">Vai trò</th>
                <th style="width: 41%;">Được làm & trách nhiệm</th>
                <th style="width: 41%;">Tuyệt đối không làm</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Nhóm bạn</strong></td>
                <td>Research, chọn scope, thiết kế ontology/guideline, setup CVAT, tạo edge case, calibrate nội bộ, QA, test nhóm khác.</td>
                <td>Hỏi giảng viên "đáp án label đúng là gì" hoặc giải thích rule bằng miệng cho nhóm peer trong blind window.</td>
              </tr>
              <tr>
                <td><strong>Nhóm peer</strong></td>
                <td>Dùng guideline/task như annotator mới, label blind sample theo đúng câu chữ, góp ý usability.</td>
                <td>Xem gold trước khi test; nhờ owner "giảng lại" guideline trong blind window hoặc tự đoán ý owner.</td>
              </tr>
              <tr>
                <td><strong>Lab Coach</strong></td>
                <td>Giữ timeline 240 phút, hỗ trợ CVAT/login/import/export/git, ghép cặp, xác nhận gold đã freeze.</td>
                <td>Sửa guideline, quyết định domain semantics thay nhóm, phán quyết label nào là đúng.</td>
              </tr>
              <tr>
                <td><strong>Giảng viên</strong></td>
                <td>Briefing, duyệt topic (Gate G1), chấm cuối (Gate G6).</td>
                <td>Đưa starter solution, giải edge case thay nhóm.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="callout callout-warning">
          <div class="callout-body">
            <span class="callout-title">Quy tắc ứng xử khi thảo luận kỹ thuật</span>
            Khi bạn hỏi giảng viên hoặc Coach "Vẽ như thế này đã đúng chưa?", câu trả lời sẽ luôn là câu hỏi ngược: <em>"Quy tắc đã viết trong guideline của nhóm bạn là gì? Bằng chứng thị giác trên ảnh là gì? Nếu ảnh không đủ bằng chứng, guideline có cung cấp cơ chế chuyển tiếp (escalation path) không?"</em>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 2,
    part: "Phần I: Khung lý thuyết & giới thiệu",
    title: "2. Lộ trình 240' & 6 gates",
    fullTitle: "Bước 2 · Lộ trình 240 phút & hệ thống 6 Quality Gates",
    timeline: "Toàn buổi · 240 phút",
    gate: "G1–G6",
    desc: "Nắm vững chuỗi 7 pha kỹ thuật, 6 trạm kiểm soát chất lượng và công thức tính điểm chuyển giao GTS.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Chuỗi quy trình 7 pha (pipeline flow)
        </h2>
        <p>
          Toàn bộ buổi lab vận hành liên tục theo chu trình khép kín của một dự án dữ liệu thực chiến:
        </p>
        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Quy trình kỹ thuật</span>
          </div>
          <pre>Research → Specify → Configure → Calibrate → QA → Blind test → Revise</pre>
        </div>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Lịch trình chi tiết & 6 trạm kiểm soát (Quality Gates)
        </h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 12%;">Thời gian</th>
                <th style="width: 18%;">Pha kỹ thuật</th>
                <th style="width: 45%;">Sản phẩm đầu ra (Deliverable)</th>
                <th style="width: 25%;">Quality Gate</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>0–15'</strong></td>
                <td>Briefing + Topic</td>
                <td>Chốt danh sách nhóm <code>00_team.md</code>, chọn nhóm bài toán, nhận cặp đối ứng.</td>
                <td>—</td>
              </tr>
              <tr>
                <td><strong>15–35'</strong></td>
                <td>Research & Contract</td>
                <td>Hoàn thiện <code>01_problem_statement.md</code> (trả lời đủ 4 câu downstream contract).</td>
                <td><span class="gate-tag g-topic">G1: Topic Lock</span></td>
              </tr>
              <tr>
                <td><strong>35–80'</strong></td>
                <td>Guideline v1 + Ontology</td>
                <td>Soạn <code>02_guideline.md</code> (v1, đủ 10 mục), bảng ontology trong <code>03_ontology_and_cvat_setup.md</code>.</td>
                <td>—</td>
              </tr>
              <tr>
                <td><strong>80–110'</strong></td>
                <td>CVAT Setup & Pack</td>
                <td>Xuất <code>03_cvat_labels.json</code>, phân chia <code>sample_pack.csv</code>, task calibration mở được.</td>
                <td><span class="gate-tag g-cvat">G2: CVAT Ready</span></td>
              </tr>
              <tr>
                <td><strong>110–120'</strong></td>
                <td>Nghỉ giải lao</td>
                <td>Chuẩn bị máy và tài khoản cho phiên gán nhãn calibration.</td>
                <td>—</td>
              </tr>
              <tr>
                <td><strong>120–140'</strong></td>
                <td>Calibration nội bộ</td>
                <td>Mỗi người xuất zip riêng, đo bằng <code>calib</code>, điền <code>06_calibration_report.csv</code>.</td>
                <td>—</td>
              </tr>
              <tr>
                <td><strong>140–160'</strong></td>
                <td>Refine + QA + Freeze</td>
                <td>Nâng cấp guideline v2, viết <code>05_qa_plan.md</code>, chốt <code>gold_decisions.csv</code>, chạy lệnh khóa.</td>
                <td>
                  <span class="gate-tag g-calib">G3: Calibrated</span><br>
                  <span class="gate-tag g-freeze">G4: Gold Frozen</span>
                </td>
              </tr>
              <tr>
                <td><strong>160–185'</strong></td>
                <td>Blind Handoff Test</td>
                <td>Gửi blind pack 2 chiều, nhóm peer làm bài, ghi log câu hỏi <code>clarification_log.csv</code>.</td>
                <td><span class="gate-tag g-handoff">G5: Handoff Complete</span></td>
              </tr>
              <tr>
                <td><strong>185–205'</strong></td>
                <td>Score & Diagnose</td>
                <td>Nhận bài peer, chạy <code>score</code>, chấm điểm, tính GTS bằng <code>gts</code>, phân tích nguyên nhân.</td>
                <td>—</td>
              </tr>
              <tr>
                <td><strong>205–225'</strong></td>
                <td>Final Revision</td>
                <td>Guideline v3 từ bằng chứng thực tế, ghi log <code>08_revision_log.md</code>, thư viện ca biên ≥ 8 card.</td>
                <td>—</td>
              </tr>
              <tr>
                <td><strong>225–240'</strong></td>
                <td>Nộp bài & Debrief</td>
                <td>Chạy <code>check</code> đạt cả 6 gate, push git kèm tag, debrief 2 phút mỗi chiều với nhóm peer.</td>
                <td><span class="gate-tag g-final">G6: Final Handoff</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Cơ cấu điểm 100 & điểm chuyển giao GTS
        </h2>
        <p>
          Điểm số được đánh giá thuần túy dựa trên <strong>bằng chứng kỹ thuật</strong> trong repository:
        </p>
        <ul>
          <li><strong>Problem + Downstream framing (10 điểm):</strong> Sử dụng use-case hẹp, rủi ro mô hình rõ, phạm vi hợp lý.</li>
          <li><strong>Ontology + CVAT setup (15 điểm):</strong> Schema nhãn chuẩn xác, cấu hình không tạo lỗi ngầm (silent defaults).</li>
          <li><strong>Guideline completeness (20 điểm):</strong> Đủ 10 mục bắt buộc, có tính hành động cao, không có quy tắc nói miệng.</li>
          <li><strong>Edge-case library (15 điểm):</strong> Đủ ít nhất 8 thẻ ca biên chất lượng, phản ánh độ phức tạp thực tế.</li>
          <li><strong>QA design + Metrics (15 điểm):</strong> Ma trận mức độ nghiêm trọng, ngưỡng pass/fail, quy trình rework cụ thể.</li>
          <li><strong>Calibration evidence (5 điểm):</strong> Có bằng chứng bất đồng thực tế và căn cứ nâng cấp guideline.</li>
          <li><strong>Blind handoff transferability (20 điểm):</strong> Đo lường thông qua điểm GTS, nhật ký làm rõ và phản hồi của peer.</li>
        </ul>

        <div class="callout callout-danger">
          <div class="callout-body">
            <span class="callout-title">Quy tắc khống chế critical cap</span>
            Công thức tính điểm chuyển giao: <code>GTS = 0.60 D + 0.20 C + 0.10 G + 0.10 I</code> (trong đó: <strong>D</strong> là độ chính xác quyết định, <strong>C</strong> là độ chính xác các ca critical, <strong>G</strong> là dung sai hình học, <strong>I</strong> là tính độc lập không cần hỏi).<br>
            <strong>Cảnh báo:</strong> Nếu nhóm peer mắc lỗi critical vì guideline của bạn bị thiếu hoặc mơ hồ, và nhóm bạn không có quy tắc chuyển tiếp (escalation) để ngăn chặn, phần điểm Blind Handoff sẽ <strong>bị khống chế trần tối đa 10/20 điểm</strong>.
          </div>
        </div>
      </div>
    `
  },
  {
    id: 3,
    part: "Phần I: Khung lý thuyết & giới thiệu",
    title: "3. Môi trường & bảng lệnh",
    fullTitle: "Bước 3 · Chuẩn bị môi trường kỹ thuật & bảng tra cứu lệnh",
    timeline: "Trước phút 0",
    gate: null,
    desc: "Kích hoạt CVAT local có sẵn qua Docker và làm quen với bộ lệnh tự động hóa lab9.py / Makefile.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Bật CVAT local đã cài đặt
        </h2>
        <p>
          Bài lab tái sử dụng phiên bản CVAT v2.74.1 bạn đã cài đặt từ Day 2 (trong thư mục <code>cvat-day2</code> hoặc <code>cvat</code>). <strong>Tuyệt đối không cài mới CVAT</strong> để tránh mất thời gian.
        </p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Terminal · Mở CVAT qua Docker</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code># 1. Mở Docker Desktop và đợi Docker Engine khởi động hoàn tất
# 2. Chuyển vào thư mục CVAT trên máy của bạn
cd &lt;đường_dẫn&gt;/cvat-day2

# 3. Khởi động các container đã có sẵn
docker compose start</code></pre>
        </div>

        <p>Sau đó, quay lại thư mục <code>guideline-challenge/</code> và kiểm tra trạng thái CVAT:</p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Kiểm tra kết nối CVAT</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code class="cmd-snippet" data-win="python lab9.py cvat" data-posix="make cvat-status">python lab9.py cvat</code></pre>
        </div>

        <p>
          Khi màn hình in ra dòng <code>✓ CVAT v2.74.1 tại http://localhost:8080</code>, hãy mở trình duyệt (Chrome hoặc Edge) và đăng nhập bằng tài khoản CVAT bạn đã tạo từ Day 2.
        </p>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Bảng lệnh thao tác trong lab
        </h2>
        <p>
          Tất cả các lệnh phải được chạy bên trong thư mục <code>guideline-challenge/</code>. Công cụ được viết bằng Python thuần, không cần cài đặt thêm thư viện ngoài.
        </p>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 32%;">Mục đích thao tác</th>
                <th style="width: 34%;">Windows (PowerShell / py)</th>
                <th style="width: 34%;">macOS / Linux (make)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kiểm tra CVAT đang chạy</td>
                <td><code>python lab9.py cvat</code></td>
                <td><code>make cvat-status</code></td>
              </tr>
              <tr>
                <td>Xem danh mục ảnh dữ liệu</td>
                <td><code>python lab9.py samples [--source ...]</code></td>
                <td><code>make samples [SOURCE=...]</code></td>
              </tr>
              <tr>
                <td>Gom ảnh cho một split</td>
                <td><code>python lab9.py pack &lt;split&gt;</code></td>
                <td><code>make pack SPLIT=&lt;split&gt;</code></td>
              </tr>
              <tr>
                <td>Đo bất đồng calibration</td>
                <td><code>python lab9.py calib file1.zip file2.zip</code></td>
                <td><code>make calib FILES="..."</code></td>
              </tr>
              <tr>
                <td>Khóa bộ gold Expectation</td>
                <td><code>python lab9.py freeze</code></td>
                <td><code>make freeze</code></td>
              </tr>
              <tr>
                <td>Xác minh tính nguyên vẹn Gold</td>
                <td><code>python lab9.py verify</code></td>
                <td><code>make verify</code></td>
              </tr>
              <tr>
                <td>Đóng gói bàn giao Blind</td>
                <td><code>python lab9.py handoff</code></td>
                <td><code>make handoff</code></td>
              </tr>
              <tr>
                <td>Tạo bảng chấm điểm từ bài peer</td>
                <td><code>python lab9.py score peer.zip</code></td>
                <td><code>make score FILE=peer.zip</code></td>
              </tr>
              <tr>
                <td>Tính điểm chuyển giao GTS</td>
                <td><code>python lab9.py gts</code></td>
                <td><code>make gts</code></td>
              </tr>
              <tr>
                <td>Xem tiến độ các quality gates</td>
                <td><code>python lab9.py status</code></td>
                <td><code>make status</code></td>
              </tr>
              <tr>
                <td>Tổng kiểm tra gói nộp cuối</td>
                <td><code>python lab9.py check</code></td>
                <td><code>make check</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Khảo sát 3 tập dữ liệu có sẵn trong <code>data/</code>
        </h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Nguồn ảnh</th>
                <th>Số lượng & đặc tính</th>
                <th>Phù hợp cho bài toán nào</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>bdd100k</code></td>
                <td><strong>26 ảnh:</strong> Đa dạng điều kiện thực tế (cao tốc, đường phố, ban ngày, ban đêm, chạng vạng, tuyết, mưa).</td>
                <td>Vạch kẻ làn (lane), vùng di chuyển được (drivable area), nhận diện đèn giao thông trong điều kiện tầm nhìn kém (low visibility).</td>
              </tr>
              <tr>
                <td><code>gtsdb</code></td>
                <td><strong>28 ảnh:</strong> Tập dữ liệu biển báo Đức. Chú ý có các ảnh không hề có biển báo (negative samples).</td>
                <td>Phân cấp phân loại biển báo (sign taxonomy), biển kích thước nhỏ, biển ở xa hoặc bị che khuất (occlusion).</td>
              </tr>
              <tr>
                <td><code>lisa</code></td>
                <td><strong>30 frame:</strong> Chuỗi 30 khung hình liên tiếp trích từ một video clip quay đèn giao thông ban ngày.</td>
                <td>Bài toán theo dõi vật thể theo thời gian (temporal tracking), trạng thái đổi màu đèn. Blind set nên bổ sung ảnh BDD để có cảnh chưa từng thấy.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `
  },
  {
    id: 4,
    part: "Phần II: Thực hành từng bước",
    title: "4. Chọn bài toán & khóa contract",
    fullTitle: "Bước 4 · Thu hẹp bài toán & khóa downstream contract",
    timeline: "Phút 0–35",
    gate: "G1",
    desc: "Biến đề tài chung chung thành một bài toán production cụ thể, ký hợp đồng downstream và nghiệm thu Gate G1.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Kỹ thuật thu hẹp bài toán (scope narrowing)
        </h2>
        <p>
          Sai lầm phổ biến nhất của các kỹ sư mới là chọn bài toán quá rộng, dẫn đến bảng phân loại (taxonomy) phình to ngoài tầm kiểm soát và annotator phải tự đoán mò.
        </p>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Đề tài quá rộng (dễ thất bại)</th>
                <th style="width: 55%;">Đề tài đủ hẹp & cụ thể (chuẩn production)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>"Gán nhãn đèn giao thông (traffic lights)"</td>
                <td><strong>Trạng thái đèn + Độ liên quan xe chủ (ego-relevance)</strong> tại nút giao có nhiều đầu đèn phức tạp.</td>
              </tr>
              <tr>
                <td>"Gán nhãn vạch kẻ đường (lane)"</td>
                <td><strong>Ranh giới làn tại điểm nhập/tách làn (merge/split)</strong> kết hợp xử lý vạch mờ, vạch tạm công trường.</td>
              </tr>
              <tr>
                <td>"Phân đoạn mặt đường (road segmentation)"</td>
                <td><strong>Xác định drivable area</strong> tại khu vực chuyển tiếp giữa vỉa hè, lối đi bộ và lề đường dễ nhầm lẫn.</td>
              </tr>
              <tr>
                <td>"Gán nhãn biển báo (traffic signs)"</td>
                <td><strong>Taxonomy phân cấp cho biển báo</strong> ở cự ly xa, kích thước dưới 32px hoặc bị cành cây che khuất một phần.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Thiết lập hồ sơ bài toán
        </h2>
        <p>
          Trong thư mục <code>project/</code>, hãy mở và hoàn thiện 2 file đầu tiên:
        </p>
        <ol>
          <li>
            <strong><code>00_team.md</code>:</strong> Điền tên thành viên, nhóm trưởng và chỉ định rõ ai chịu trách nhiệm chính (owner) cho từng file tài liệu.
          </li>
          <li>
            <strong><code>01_problem_statement.md</code>:</strong> Trả lời dứt khoát 4 câu hỏi cốt lõi của hợp đồng downstream (tối đa nửa trang):
            <ul>
              <li><strong>Câu hỏi 1 (Consumer):</strong> Mô hình AI nào sẽ tiêu thụ dữ liệu này và nó đưa ra quyết định gì trong hệ thống lái xe?</li>
              <li><strong>Câu hỏi 2 (Risk):</strong> Hậu quả an toàn nghiêm trọng nhất (catastrophic failure) nếu annotator gán nhãn sai là gì?</li>
              <li><strong>Câu hỏi 3 (Boundary):</strong> Đối tượng nào bắt buộc phải gán nhãn (in-scope) và đối tượng nào dứt khoát bỏ qua (out-of-scope)?</li>
              <li><strong>Câu hỏi 4 (Escalation):</strong> Khi ảnh bị mờ hoặc không đủ bằng chứng kết luận, quy trình xử lý chuyển tiếp lên cấp trên diễn ra như thế nào?</li>
            </ul>
          </li>
        </ol>
      </div>

      <div class="checklist-card">
        <div class="checklist-title">
          <span>Tiêu chí nghiệm thu Gate G1 (Topic lock)</span>
          <span class="checklist-badge">Bắt buộc</span>
        </div>
        <div class="checklist-items">
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 4, 0)">
            <span>Đã điền đầy đủ danh sách và phân công file trong <code>00_team.md</code>.</span>
          </label>
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 4, 1)">
            <span><code>01_problem_statement.md</code> trả lời đủ 4 câu downstream contract, không còn chữ TODO.</span>
          </label>
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 4, 2)">
            <span>Chạy lệnh kiểm tra trạng thái và xác nhận Gate G1 báo hoàn thành.</span>
          </label>
        </div>
      </div>

      <div class="code-card">
        <div class="code-header">
          <span class="code-lang">Kiểm tra nghiệm thu Gate G1</span>
          <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
        </div>
        <pre><code class="cmd-snippet" data-win="python lab9.py status" data-posix="make status">python lab9.py status</code></pre>
      </div>
    `
  },
  {
    id: 5,
    part: "Phần II: Thực hành từng bước",
    title: "5. Viết guideline v1 & ontology",
    fullTitle: "Bước 5 · Thiết kế guideline v1 & xây dựng bảng ontology",
    timeline: "Phút 35–80",
    gate: null,
    desc: "Xây dựng tài liệu quy chuẩn dữ liệu 10 mục chuẩn mực và thiết kế bảng ontology không có luật ngầm.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Cấu trúc 10 mục bắt buộc trong <code>02_guideline.md</code>
        </h2>
        <p>
          Quy chuẩn vàng của tài liệu dữ liệu: <strong>"No hidden rules"</strong>. Bất kỳ quy tắc nào chỉ được giải thích miệng trong nhóm coi như không tồn tại, vì nhóm peer sẽ chỉ nhìn thấy duy nhất file văn bản này.
        </p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="width: 30%;">Mục quy chuẩn</th>
                <th style="width: 70%;">Nội dung kỹ thuật cần đặc tả</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>1. Objective & Scope</td><td>Mục tiêu bài toán và phạm vi ứng dụng thực tế.</td></tr>
              <tr><td>2. Annotation Unit</td><td>Đơn vị gán nhãn: từng vật thể độc lập (instance) hay vùng phủ (semantic region).</td></tr>
              <tr><td>3. Geometry Rule</td><td>Quy định hình học: bounding box ôm sát vỏ hay ôm cả ánh sáng lóe (bloom)? Polygon cắt tỉa thế nào?</td></tr>
              <tr><td>4. Taxonomy</td><td>Bảng phân loại nhãn và thuộc tính chi tiết kèm định nghĩa.</td></tr>
              <tr><td>5. Inclusion / Exclusion</td><td>Bảng đối chiếu 2 cột: đối tượng nào gán nhãn và đối tượng nào dứt khoát bỏ qua.</td></tr>
              <tr><td>6. Visibility & Occlusion</td><td>Vật thể bị che khuất bao nhiêu phần trăm thì không vẽ? Dưới bao nhiêu pixel thì bỏ qua?</td></tr>
              <tr><td>7. Ambiguity & Escalation</td><td>Quy trình xử lý khi không đủ bằng chứng (dùng tag nào, checkbox nào trên CVAT).</td></tr>
              <tr><td>8. Temporal Rule</td><td>(Nếu dùng video) Quy định track ID, keyframe nội suy và đánh dấu kết thúc (outside - phím O).</td></tr>
              <tr><td>9. Examples</td><td>Ví dụ ảnh điển hình kèm lý do minh họa bằng <code>sample_id</code>.</td></tr>
              <tr><td>10. Common Mistakes</td><td>Các lỗi sai phổ biến mà annotator thường mắc phải và cách phòng ngừa.</td></tr>
            </tbody>
          </table>
        </div>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Đoạn trích mẫu chuẩn mực cho Mục 3 (Geometry Rule) & Mục 5 (Inclusion / Exclusion)</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code>## 3. Geometry Rule (Quy chuẩn hình học)
- **Bounding Box Tightness:** Hộp chữ nhật phải ôm sát phần khung vỏ vật lý (housing) của đèn giao thông. Cắt bỏ quầng sáng phát xạ (bloom/glare) và không vẽ trùm cột/tay đòn treo đèn.
- **Kích thước tối thiểu (Min size):** Bỏ qua không gán nhãn các cụm đèn có cạnh dài nhất &lt; 10 pixel do không đủ độ phân giải cho detector.
- **Che khuất (Occlusion):** Nếu đèn bị che khuất &gt; 60% diện tích hoặc không thể nhận diện được hình dạng vật lý: KHÔNG vẽ box; nếu đèn nằm ở làn đường ưu tiên của xe tự hành thì đánh dấu tag \`occluded_escalate\` cho toàn bộ ảnh.

## 5. Inclusion / Exclusion (bao hàm và loại trừ)
| Đối tượng quan sát | Quyết định | Căn cứ kỹ thuật & Downstream Contract |
|---|---|---|
| Đèn tín hiệu giao thông chính trên cột/giá long môn | LABEL (\`traffic_light\`) | Quyết định trực tiếp hành vi dừng/chạy của xe |
| Đèn tín hiệu người đi bộ (hình người đỏ/xanh) | IGNORE (Không vẽ) | Nằm ngoài scope bài toán xe tự hành |
| Đèn tín hiệu xe buýt / tàu điện | ESCALATE (\`needs_review\`) | Dễ gây nhiễu cho thuật toán phân tích quỹ đạo |
| Hình ảnh đèn trên biển quảng cáo/pano | IGNORE (Không vẽ) | Tránh sinh false positive nguy hiểm cho mô hình |</code></pre>
        </div>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Thiết kế bảng ontology trong <code>03_ontology_and_cvat_setup.md</code>
        </h2>
        <p>
          Bảng ontology là <em>source of truth</em> (nguồn chuẩn duy nhất), file JSON cấu hình CVAT chỉ là bản dịch trực tiếp từ bảng này. Bảng phải có đủ 7 cột:
        </p>
        <ul>
          <li><code>Name</code>: Tên nhãn (viết thường, dùng gạch dưới, ví dụ <code>traffic_light</code>).</li>
          <li><code>Geometry</code>: Dạng hình học (<code>rectangle</code>, <code>polygon</code>, <code>polyline</code>, hoặc <code>tag</code>).</li>
          <li><code>Class / Attribute</code>: Phân định rạch ròi. Dùng <strong>Class</strong> khi bản chất vật lý khác nhau; dùng <strong>Attribute</strong> khi là thuộc tính có thể thay đổi của cùng một thực thể (ví dụ: màu đèn, trạng thái bật/tắt).</li>
          <li><code>Allowed values</code>: Danh sách các giá trị hợp lệ.</li>
          <li><code>Default value</code>: Giá trị mặc định khi tạo mới.</li>
          <li><code>Mutable?</code>: Đánh dấu <code>true</code> nếu giá trị có thể đổi giữa các frame của cùng một track.</li>
          <li><code>Rationale</code>: Căn cứ thiết kế kỹ thuật từ góc nhìn downstream contract.</li>
        </ul>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Thể hiện 4 quyết định cốt lõi trên CVAT
        </h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Quyết định kỹ thuật</th>
                <th>Cách thức thể hiện cụ thể trên giao diện CVAT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>LABEL</strong></td>
                <td>Vẽ hình học tương ứng (rectangle/polygon) và gán các attribute phù hợp.</td>
              </tr>
              <tr>
                <td><strong>IGNORE</strong></td>
                <td>Quy định rõ trong guideline "vùng này không vẽ", hoặc tạo một label riêng dạng hình chữ nhật mang tên <code>ignore_region</code>.</td>
              </tr>
              <tr>
                <td><strong>UNKNOWN</strong></td>
                <td>Thuộc tính có một giá trị lựa chọn mang tên <code>unknown</code> trong dropdown.</td>
              </tr>
              <tr>
                <td><strong>ESCALATE</strong></td>
                <td>Một checkbox mang tên <code>needs_review</code> trên vật thể, hoặc gắn nhãn kiểu <code>tag</code> cho toàn bộ khung hình (ví dụ <code>image_escalate</code>).</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Khi hoàn thiện bản nháp đầu tiên, hãy sửa dòng đầu trong <code>02_guideline.md</code> thành <strong><code>Version: v1</code></strong>.
        </p>
      </div>
    `
  },
  {
    id: 6,
    part: "Phần II: Thực hành từng bước",
    title: "6. CVAT setup & sample pack",
    fullTitle: "Bước 6 · Cấu hình task CVAT & phân chia sample pack",
    timeline: "Phút 80–110",
    gate: "G2",
    desc: "Biên soạn file schema nhãn JSON, phân bổ dữ liệu mẫu và khởi tạo task CVAT mở được cho calibration.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Biên soạn <code>project/03_cvat_labels.json</code>
        </h2>
        <p>
          Dịch bảng ontology thành định dạng Raw JSON của CVAT. Hãy lưu ý kỹ thuật thiết kế giá trị mặc định:
        </p>

        <div class="callout callout-warning">
          <div class="callout-body">
            <span class="callout-title">Chống lỗi gán nhãn im lặng (silent defaults)</span>
            Nếu bạn đặt default của trạng thái đèn là <code>green</code>, khi annotator quên chọn attribute, hệ thống sẽ âm thầm ghi nhận đèn xanh. Để buộc annotator phải chủ động suy nghĩ và chọn, hãy đặt giá trị <code>"__undefined__"</code> lên đầu danh sách và làm default.
          </div>
        </div>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Cấu trúc mẫu 03_cvat_labels.json</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code>[
  {
    "name": "traffic_light",
    "color": "#F9A825",
    "type": "rectangle",
    "attributes": [
      {
        "name": "state",
        "mutable": true,
        "input_type": "select",
        "default_value": "__undefined__",
        "values": ["__undefined__", "red", "yellow", "green", "off", "unknown"]
      },
      {
        "name": "needs_review",
        "mutable": false,
        "input_type": "checkbox",
        "default_value": "false",
        "values": ["false"]
      }
    ]
  },
  {
    "name": "image_escalate",
    "color": "#8E24AA",
    "type": "tag",
    "attributes": []
  }
]</code></pre>
        </div>

        <p>Kiểm tra tính hợp lệ cú pháp JSON trước khi sử dụng:</p>
        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Kiểm tra cú pháp JSON</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code>python -m json.tool project/03_cvat_labels.json</code></pre>
        </div>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Phân chia tập ảnh trong <code>project/sample_pack.csv</code>
        </h2>
        <p>
          Chia ảnh từ danh mục <code>data/catalog.csv</code> vào 3 tập mục đích rõ rệt:
        </p>
        <ul>
          <li><strong><code>example</code> (3–5 ảnh):</strong> Dùng để chụp hình minh họa trực tiếp các trường hợp trong guideline.</li>
          <li><strong><code>calibration</code> (5–8 ảnh):</strong> Tập ảnh dùng cho phiên đo độ bất đồng nội bộ nhóm.</li>
          <li><strong><code>blind</code> (4–5 ảnh):</strong> Tập ảnh tuyệt đối giữ kín, dùng để kiểm thử nhóm đối ứng.</li>
        </ul>

        <div class="callout callout-danger">
          <div class="callout-body">
            <span class="callout-title">Quy chuẩn bắt buộc cho tập blind set</span>
            Tập ảnh blind bắt buộc phải chứa ít nhất: <strong>1 ảnh <code>normal</code> + 2 ảnh <code>edge</code> + 1 ảnh <code>critical</code></strong>, và thêm <strong>1 ảnh <code>ambiguity</code></strong> nếu dùng 5 ảnh. Một ảnh chỉ thuộc một split duy nhất.
          </div>
        </div>

        <p>Cấu trúc chuẩn của file <code>project/sample_pack.csv</code> (đủ 4 cột bắt buộc):</p>
        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Mẫu cấu trúc project/sample_pack.csv</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code>sample_id,split,tags,reason
BDD01,example,"day,clear","Ảnh ngày rõ nét dùng chụp hình minh họa bounding box chuẩn"
BDD03,calibration,"night,glare","Đèn lóa ướt kính xe, dùng đo độ bất đồng nội bộ"
BDD07,blind,"edge,occluded","Đèn bị cành cây che 45%, kiểm thử độ nhạy của peer"
BDD09,blind,"critical,arrow","Đèn mũi tên xanh rẽ trái, ca an toàn sống còn"</code></pre>
        </div>

        <p>Tra cứu nhanh danh mục ảnh có sẵn trong repo để chọn vào các split:</p>
        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Tra cứu danh mục ảnh</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code class="cmd-snippet" data-win="python lab9.py samples --source bdd100k" data-posix="make samples SOURCE=bdd100k">python lab9.py samples --source bdd100k</code></pre>
        </div>
        <p class="text-sm text-muted">Có thể đổi tham số thành <code>gtsdb</code> hoặc <code>lisa</code> tùy theo dataset nhóm chọn, hoặc mở trực tiếp <code>data/catalog.csv</code> trên VS Code để lọc theo cột <code>tags</code>.</p>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Gom ảnh và tạo task CVAT
        </h2>
        <p>Chạy lệnh gom ảnh của split calibration vào thư mục <code>build/calibration/</code>:</p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Gom ảnh calibration</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code class="cmd-snippet" data-win="python lab9.py pack calibration" data-posix="make pack SPLIT=calibration">python lab9.py pack calibration</code></pre>
        </div>

        <p>Tạo task trên CVAT (xem chi tiết bấm phím tại <a href="javascript:void(0)" onclick="openHelpModal('cvat', 'cvat-sec-2')">Mục 2 GUIDE.md</a>):</p>
        <ol>
          <li>Trong CVAT: vào <strong>Tasks</strong> → click <strong>+</strong> → <strong>Create a new task</strong>.</li>
          <li>Đặt tên task theo định dạng: <code>&lt;tên_nhóm&gt;-calib-&lt;tên_bạn&gt;</code>.</li>
          <li>Chuyển sang tab <strong>Raw</strong>, dán toàn bộ nội dung file <code>project/03_cvat_labels.json</code>, click <strong>Save</strong>.</li>
          <li>Ở mục <strong>Select files</strong>, chọn toàn bộ các file ảnh trong thư mục <code>build/calibration/</code>.</li>
          <li>Click <strong>Submit & Open</strong>. Sau khi task tạo xong, dưới phần <strong>Task description</strong>, click <strong>Edit</strong> và dán toàn bộ nội dung <code>project/02_guideline.md</code> vào ô Markdown.</li>
        </ol>
      </div>

      <div class="checklist-card">
        <div class="checklist-title">
          <span>Tiêu chí nghiệm thu Gate G2 (CVAT ready)</span>
          <span class="checklist-badge">Bắt buộc</span>
        </div>
        <div class="checklist-items">
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 6, 0)">
            <span>File <code>03_cvat_labels.json</code> đúng cú pháp và phản ánh 100% bảng ontology.</span>
          </label>
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 6, 1)">
            <span>File <code>sample_pack.csv</code> phân bổ đủ 3 split và thỏa mãn điều kiện blind set.</span>
          </label>
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 6, 2)">
            <span>Thực hiện kiểm thử thiết lập (setup test): Một thành viên mở task CVAT và xác nhận nhãn, thuộc tính, guideline hiển thị hoàn chỉnh.</span>
          </label>
        </div>
      </div>
    `
  },
  {
    id: 7,
    part: "Phần II: Thực hành từng bước",
    title: "7. Calibration nội bộ",
    fullTitle: "Bước 7 · Gán nhãn độc lập & đo bất đồng calibration",
    timeline: "Phút 120–140",
    gate: "G3",
    desc: "Từng thành viên gán nhãn độc lập trên CVAT local, chạy thuật toán đo bất đồng và chuyển hóa mâu thuẫn thành quy tắc.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Quy trình gán nhãn độc lập (blind calibration)
        </h2>
        <p>
          <strong>Mỗi thành viên trong nhóm</strong> tạo một task CVAT riêng trên máy cá nhân từ bộ ảnh <code>build/calibration/</code> (sử dụng cùng file <code>03_cvat_labels.json</code> và Guideline v1).
        </p>
        <p>
          Gán nhãn <strong>hoàn toàn độc lập</strong>: Không nhìn màn hình nhau, không thảo luận chốt trước các ca khó. Mục đích của bước này là để lộ ra những chỗ guideline viết chưa rõ hoặc thiếu sót.
        </p>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Xuất dữ liệu & chạy lệnh đo bất đồng
        </h2>
        <p>
          Gán nhãn xong, từng người export nhãn:
        </p>
        <ol>
          <li>Nhấn <strong>Ctrl+S</strong> để lưu bài trong CVAT.</li>
          <li>Click <strong>Menu</strong> (góc trên trái) → <strong>Export job dataset</strong> (hoặc ngoài trang Task: <strong>Actions</strong> → <strong>Export task dataset</strong>).</li>
          <li>Chọn định dạng: <strong>CVAT for images 1.1</strong> (nếu có track video: chọn <strong>CVAT for video 1.1</strong>). <strong>Tắt tùy chọn Save images</strong>.</li>
          <li>Tải file zip về, đổi tên theo tên thành viên (ví dụ <code>an.zip</code>, <code>binh.zip</code>), và chép vào thư mục <code>project/06_calibration_exports/</code>.</li>
        </ol>

        <p>Chạy công cụ đo bất đồng tự động:</p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Đo bất đồng calibration</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code class="cmd-snippet" data-win="python lab9.py calib project/06_calibration_exports/an.zip project/06_calibration_exports/binh.zip" data-posix="make calib FILES=&quot;project/06_calibration_exports/an.zip project/06_calibration_exports/binh.zip&quot;">python lab9.py calib project/06_calibration_exports/an.zip project/06_calibration_exports/binh.zip</code></pre>
        </div>

        <p>
          Lệnh sinh file <code>project/06_calibration_measure.csv</code> so sánh số lượng vật thể, giá trị thuộc tính và tag giữa các thành viên, đồng thời in tóm tắt độ đồng thuận lên màn hình.
        </p>

        <div class="callout callout-info">
          <div class="callout-body">
            <span class="callout-title">Quy trình 3 bước đọc file & lọc bất đồng</span>
            <ol style="margin-top: 6px; padding-left: 18px;">
              <li><strong>Xem log terminal:</strong> Terminal in ngay danh sách các ca bất đồng lớn nhất kèm dấu <code>!</code> (ví dụ: <code>! BDD02 · traffic_light · attr:state: 2 giá trị (an=red, binh=yellow)</code>).</li>
              <li><strong>Mở file measure:</strong> Mở <code>project/06_calibration_measure.csv</code>, lọc các dòng có cột <code>agree = 0</code> để quan sát chi tiết sự lệch pha về <code>count</code>, <code>attr:*</code> hoặc <code>tag</code>.</li>
              <li><strong>Chọn 3 ca mâu thuẫn lớn nhất:</strong> Lấy 3 ca này đưa vào file <code>06_calibration_report.csv</code> để tìm nguyên nhân gốc rễ và đề xuất hành động kỹ thuật.</li>
            </ol>
          </div>
        </div>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Phân tích nguyên nhân và điền <code>06_calibration_report.csv</code>
        </h2>
        <p>
          Chọn ít nhất <strong>3 bất đồng lớn nhất</strong> để phân tích nguyên nhân gốc rễ và điền vào bảng:
        </p>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Cột phân loại</th>
                <th>Giá trị cho phép</th>
                <th>Ý nghĩa kỹ thuật</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>diagnosis</code></td>
                <td><code>guideline_gap</code></td>
                <td>Quy tắc bị thiếu sót, mâu thuẫn hoặc diễn đạt mơ hồ.</td>
              </tr>
              <tr>
                <td><code>diagnosis</code></td>
                <td><code>data_ambiguity</code></td>
                <td>Dữ liệu ảnh thực tế không đủ bằng chứng kết luận (cần quy tắc escalation).</td>
              </tr>
              <tr>
                <td><code>diagnosis</code></td>
                <td><code>execution_error</code></td>
                <td>Guideline đã viết rất rõ nhưng annotator làm sai (cần đào tạo lại).</td>
              </tr>
              <tr>
                <td><code>action</code></td>
                <td><code>revise_rule</code> | <code>add_example</code> | <code>add_escalation</code> | <code>coaching</code></td>
                <td>Hành động kỹ thuật tương ứng để xử lý triệt để nguyên nhân.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Mẫu điền project/06_calibration_report.csv</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code>sample_id,item,values_by_annotator,diagnosis,action,rule_change
BDD02,attr:state,"an=red|binh=unknown",guideline_gap,revise_rule,"Bổ sung quy tắc: Đèn đêm dù mờ vẫn gán màu nếu thấy ánh sáng phát xạ rõ ràng"
BDD05,count,"an=2|binh=1",execution_error,coaching,"Nhắc nhở thành viên kiểm tra kỹ các góc khuất bên phải cột đèn"
BDD07,attr:state,"an=yellow|binh=off",data_ambiguity,add_escalation,"Quy định gán unknown và tích checkbox needs_review khi đèn bị che trên 50%"</code></pre>
        </div>

        <div class="callout callout-info">
          <div class="callout-body">
            <span class="callout-title">Chuyển hóa bất đồng thành chất lượng quy chuẩn</span>
            Đừng cố ép đồng thuận bằng lời nói miệng. Hãy biến mọi điểm bất đồng thành quy tắc bổ sung, ca ngoại lệ hoặc ví dụ minh họa trong guideline. Cập nhật file <code>02_guideline.md</code> lên <strong><code>Version: v2</code></strong> và ghi một dòng vào <code>08_revision_log.md</code>.
          </div>
        </div>
      </div>
    `
  },
  {
    id: 8,
    part: "Phần II: Thực hành từng bước",
    title: "8. Kế hoạch QA & khóa gold",
    fullTitle: "Bước 8 · Kế hoạch kiểm định (QA plan) & khóa bộ gold (freeze)",
    timeline: "Phút 140–160",
    gate: "G4",
    desc: "Thiết lập kế hoạch QA, xây dựng bảng quyết định chuẩn (gold decisions) và khóa toàn vẹn dữ liệu.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Soạn thảo kế hoạch QA trong <code>project/05_qa_plan.md</code>
        </h2>
        <p>Đặc tả hệ thống kiểm soát chất lượng dữ liệu của nhóm:</p>
        <ul>
          <li><strong>Cơ chế lấy mẫu (sampling strategy):</strong> Audit 100% hay lấy mẫu ngẫu nhiên có trọng số (ưu tiên các ảnh khó, ảnh đêm)?</li>
          <li><strong>Phân cấp mức độ lỗi (severity matrix):</strong>
            <ul>
              <li><code>critical</code>: Lỗi đe dọa trực tiếp an toàn xe (ví dụ: nhận nhầm đèn đỏ thành đèn xanh).</li>
              <li><code>major</code>: Lỗi ảnh hưởng điều hướng (ví dụ: gán sai loại vạch phân cách làn).</li>
              <li><code>minor</code>: Lỗi hình học nhỏ, không làm đổi bản chất vật thể.</li>
            </ul>
          </li>
          <li><strong>Ngưỡng chấp thuận (thresholds):</strong> Tỷ lệ lỗi tối đa cho phép để lô dữ liệu đạt trạng thái PASS, REWORK (sửa lại) hoặc REJECT (hủy làm lại).</li>
          <li><strong>Quy trình xử lý lỗi:</strong> Cách đóng issue và quy trình nâng cấp version guideline khi phát hiện lỗ hổng.</li>
        </ul>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Xây dựng bảng gold decisions trong <code>04_edge_cases/gold_decisions.csv</code>
        </h2>
        <p>
          Đây là tập kỳ vọng chuẩn cho <strong>từng ảnh blind</strong>, viết trước khi nhóm peer nhìn thấy ảnh:
        </p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Cấu trúc mẫu gold_decisions.csv</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code>sample_id,decision_id,expected,severity,rationale
BDD07,d1,label=traffic_light x2,major,hai đầu đèn nhìn thấy rõ vỏ
BDD07,d2,relevance=not_relevant (đèn trái),critical,đèn điều khiển làn rẽ trái không phải làn xe chủ
BDD07,d3,geometry: box ôm sát vỏ đèn nhìn thấy,minor,theo mục 3 guideline
BDD12,d1,ESCALATE,major,không suy ra được làn nào đèn đang điều khiển</code></pre>
        </div>

        <div class="callout callout-warning">
          <div class="callout-body">
            <span class="callout-title">Tiêu chuẩn bắt buộc cho bảng gold</span>
            Tối thiểu <strong>10 quyết định (decisions)</strong>. Bắt buộc có <strong>≥ 2 quyết định <code>critical</code></strong> và <strong>≥ 1 quyết định hình học</strong> (cột <code>expected</code> bắt đầu bằng chữ <code>geometry:</code>). Trước khi khóa, hãy mở từng ảnh blind ở kích thước gốc để soi kỹ các vật thể nhỏ hoặc ở xa.
          </div>
        </div>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Thao tác khóa gold (gold freeze)
        </h2>
        <p>
          <strong>Chú ý nghiêm ngặt:</strong> Chỉ <strong>DUY NHẤT MỘT NGƯỜI</strong> trong nhóm (người giữ bản gold chuẩn) chạy lệnh khóa freeze:
        </p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Khóa bộ gold</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code class="cmd-snippet" data-win="python lab9.py freeze" data-posix="make freeze">python lab9.py freeze</code></pre>
        </div>

        <p>
          Lệnh tự động tính toán mã băm sha256 của toàn bộ guideline, schema nhãn, sample pack và gold decisions, ghi nhận vào file <code>project/FREEZE.txt</code> và tạo tag git mang tên <code>gold-freeze</code>.
        </p>
        <p>
          Người chạy lệnh lập tức đẩy lên GitHub: <code>git push --follow-tags</code>.<br>
          Tất cả các thành viên còn lại đồng bộ về máy mình:
        </p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Đồng bộ tag git cho các thành viên còn lại</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code>git pull && git fetch --tags --force</code></pre>
        </div>
      </div>
    `
  },
  {
    id: 9,
    part: "Phần II: Thực hành từng bước",
    title: "9. Blind handoff test",
    fullTitle: "Bước 9 · Kiểm thử bàn giao độc lập (blind handoff test)",
    timeline: "Phút 160–185",
    gate: "G5",
    desc: "Đóng gói bàn giao, thực hiện bài kiểm thử 2 chiều độc lập và tuân thủ nghiêm ngặt giao thức Blind Window.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Đóng gói bàn giao blind (phía nhóm owner)
        </h2>
        <p>Chạy lệnh tạo gói bàn giao chuẩn:</p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Tạo gói blind handoff</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code class="cmd-snippet" data-win="python lab9.py handoff" data-posix="make handoff">python lab9.py handoff</code></pre>
        </div>

        <p>
          Lệnh tạo ra file <code>handoff/blind-pack.zip</code> chứa guideline, file nhãn JSON, các ảnh blind và file hướng dẫn <code>PEER_README.md</code>. <strong>Gói này tuyệt đối không chứa file gold, không chứa tag và không chứa thẻ ca biên.</strong> Gửi file zip này cho nhóm peer qua kênh quy định của lớp.
        </p>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Thực hiện gán nhãn bài đối ứng (phía nhóm peer - 15 phút)
        </h2>
        <p>Khi nhận được <code>blind-pack.zip</code> từ nhóm đối ứng:</p>
        <ol>
          <li>Giải nén và đọc nhanh file <code>PEER_README.md</code>.</li>
          <li>Mở CVAT, tạo task mới mang tên: <code>peer-&lt;tên_nhóm_owner&gt;</code>.</li>
          <li>Dán file nhãn JSON trong gói vào tab <strong>Raw</strong>, chọn các ảnh trong thư mục <code>images/</code>, dán <code>guideline.md</code> vào tab <strong>Guide</strong> của task.</li>
          <li>Gán nhãn 4–5 ảnh trong đúng <strong>15 phút</strong>. <strong>Không đoán ý tác giả</strong>: câu chữ trong guideline viết thế nào làm đúng như thế.</li>
          <li>Export kết quả (định dạng CVAT for images 1.1, tắt Save images), đổi tên thành <code>&lt;tên_nhóm_bạn&gt;-blind.zip</code> và gửi lại cho nhóm owner kèm câu trả lời cho 5 câu hỏi feedback.</li>
        </ol>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Kỷ luật trong cửa sổ blind (blind window protocol)
        </h2>
        <div class="callout callout-danger">
          <div class="callout-body">
            <span class="callout-title">Không giải thích rule bằng miệng trong blind window</span>
            Trong 15 phút blind test, nhóm tác giả tuyệt đối không đứng cạnh giảng giải rule. Mọi khúc mắc từ nhóm peer phải được ghi nhận nguyên văn vào file <code>project/07_blind_handoff/clarification_log.csv</code> để đối soát tính độc lập của tài liệu.
          </div>
        </div>
      </div>
    `
  },
  {
    id: 10,
    part: "Phần II: Thực hành từng bước",
    title: "10. Chấm điểm, đo GTS & chẩn đoán lỗi",
    fullTitle: "Bước 10 · Chấm điểm chuyển giao, đo GTS & chẩn đoán lỗi",
    timeline: "Phút 185–205",
    gate: null,
    desc: "Nhận bài làm của peer, lập bảng đối chiếu tự động, điền kết quả thẩm định và tính điểm GTS.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Nạp bài làm của peer và lập bảng chấm
        </h2>
        <p>
          Khi nhận được file zip bài làm từ nhóm peer (ví dụ <code>peer.zip</code>), hãy chạy lệnh:
        </p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Khởi tạo bảng chấm điểm</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code class="cmd-snippet" data-win="python lab9.py score peer.zip" data-posix="make score FILE=peer.zip">python lab9.py score peer.zip</code></pre>
        </div>

        <p>
          Lệnh tự động trích xuất các nét vẽ của peer vào cột <code>peer_evidence</code> trong file <code>project/07_blind_handoff/transfer_score.csv</code> ứng với từng dòng quyết định chuẩn bạn đã freeze.
        </p>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Thẩm định kết quả và điền cột correct
        </h2>
        <p>
          Mở file <code>transfer_score.csv</code> và điền 2 cột:
        </p>
        <ul>
          <li><code>correct</code>: Điền <code>1</code> nếu peer làm đúng kỳ vọng gold, điền <code>0</code> nếu làm sai.</li>
          <li><code>note</code>: Ghi chú bằng chứng đối soát.</li>
        </ul>

        <div class="callout callout-warning">
          <div class="callout-body">
            <span class="callout-title">Xử lý khi phát hiện bộ gold bị sai sót</span>
            Nếu peer làm đúng theo câu chữ guideline nhưng kết quả lại lệch với gold (do nhóm bạn sơ suất bỏ sót vật thể khi lập gold trước đó): <strong>Vẫn chấm <code>0</code> theo đúng bản gold đã freeze</strong>. Ở cột <code>note</code>, ghi bắt đầu bằng cụm từ: <code>gold sai: [bằng chứng cụ thể]</code>. Tool tính GTS sẽ đếm riêng các trường hợp này để thảo luận trong phiên debrief. Tuyệt đối không sửa lại file gold sau khi đã freeze.
          </div>
        </div>

        <p>
          Đối với các quyết định hình học (geometry decisions), hãy mở file export của peer trên CVAT để đối chiếu trực quan (Xem chi tiết tại <a href="javascript:void(0)" onclick="openHelpModal('cvat', 'cvat-sec-6')">Mục 6 GUIDE.md</a>).
        </p>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Tính điểm GTS & thu thập feedback
        </h2>
        <p>Chạy lệnh tính điểm chuyển giao tự động:</p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Tính điểm GTS</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code class="cmd-snippet" data-win="python lab9.py gts" data-posix="make gts">python lab9.py gts</code></pre>
        </div>

        <p>
          Kiểm tra báo cáo tổng hợp tại <code>project/07_blind_handoff/gts_summary.md</code>. Sau đó, chép 5 câu trả lời feedback của nhóm peer vào <code>07_blind_handoff/peer_feedback.md</code> và phân loại nguyên nhân theo 3 hướng: <em>chấp thuận và sửa đổi (accept + revise)</em>, <em>bác bỏ có bằng chứng kỹ thuật (reject with evidence)</em>, hoặc <em>bổ sung quy tắc chuyển tiếp (add escalation rule)</em>.
        </p>
      </div>
    `
  },
  {
    id: 11,
    part: "Phần II: Thực hành từng bước",
    title: "11. Hoàn thiện & nộp bài",
    fullTitle: "Bước 11 · Cải tiến guideline v3, kiểm tra 6 gate & nộp bài",
    timeline: "Phút 205–240",
    gate: "G6",
    desc: "Nâng cấp guideline v3 từ bằng chứng thực tế, hoàn thiện thư viện ca biên, tổng kiểm tra và đẩy mã nguồn.",
    content: `
      <div class="article-section">
        <h2 class="section-h2">
          1. Hoàn thiện bộ hồ sơ nộp bài
        </h2>
        <p>Trước khi kết thúc buổi lab, thực hiện các cập nhật sau:</p>
        <ol>
          <li>
            <strong>Nâng cấp Guideline lên <code>v3</code>:</strong> Bổ sung các quy tắc xử lý triệt để những điểm gãy được phát hiện trong đợt blind test. Đổi <code>Version: v3</code> trong <code>02_guideline.md</code> và ghi log vào <code>08_revision_log.md</code>.
          </li>
          <li>
            <strong>Hoàn thiện Thư viện Ca biên:</strong> Đảm bảo file <code>04_edge_cases/edge_case_cards.md</code> có <strong>ít nhất 8 thẻ ca biên</strong> hoàn chỉnh, trong đó bắt buộc có cả ca critical và ca escalation.
          </li>
          <li>
            <strong>Điền thông tin tham chiếu CVAT:</strong> Hoàn tất nội dung trong <code>project/09_cvat_export_or_task_reference.txt</code>.
          </li>
        </ol>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          2. Tổng kiểm tra toàn diện 6 Quality Gates
        </h2>
        <p>Chạy lệnh kiểm tra điều kiện nộp bài chính thức:</p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Tổng kiểm tra điều kiện nộp bài</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code class="cmd-snippet" data-win="python lab9.py check" data-posix="make check">python lab9.py check</code></pre>
        </div>

        <p>
          Lệnh sẽ rà soát tuần tự cả 6 mốc Quality Gates. Nếu có bất kỳ dòng <code>✗</code> nào xuất hiện, hãy đọc kỹ thông báo hướng dẫn và khắc phục ngay trước khi nộp.
        </p>
      </div>

      <div class="article-section">
        <h2 class="section-h2">
          3. Đẩy bài lên GitHub & phiên trao đổi debrief
        </h2>
        <p>Khi lệnh check đã báo xanh (PASS) toàn bộ 6 Gate, commit và push lên repo:</p>

        <div class="code-card">
          <div class="code-header">
            <span class="code-lang">Commit và đẩy mã nguồn kèm tag</span>
            <button class="copy-btn" onclick="copySnippet(this)">Sao chép</button>
          </div>
          <pre><code>git add project
git commit -m "Day 9 project submission"
git push --follow-tags</code></pre>
        </div>

        <p>
          <strong>Phiên Debrief 2 phút hai chiều theo cặp nhóm:</strong><br>
          Mỗi nhóm có 2 phút để trình bày: Nhóm owner giải thích guideline của mình bị vỡ ở điểm nào và đã sửa đổi những gì từ bằng chứng blind test; nhóm peer chia sẻ những rào cản và khó khăn lớn nhất khi vận hành guideline của nhóm bạn.
        </p>
      </div>

      <div class="checklist-card">
        <div class="checklist-title">
          <span>5 câu tự kiểm cuối cùng trước khi nộp</span>
          <span class="checklist-badge">Checklist hoàn tất</span>
        </div>
        <div class="checklist-items">
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 11, 0)">
            <span>Annotator mới có biết đối tượng nào cần vẽ và đối tượng nào bỏ qua mà không cần hỏi thêm?</span>
          </label>
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 11, 1)">
            <span>Khi gặp ca biên chưa từng thấy, guideline có cung cấp nguyên tắc phán đoán hoặc quy trình escalation rõ ràng?</span>
          </label>
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 11, 2)">
            <span>Schema CVAT có phản ánh đúng 100% ontology và không tạo ra các giá trị mặc định im lặng (silent defaults)?</span>
          </label>
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 11, 3)">
            <span>Kế hoạch QA có khả năng bắt được các lỗi nghiêm trọng bằng số liệu và ngưỡng đo lường cụ thể?</span>
          </label>
          <label class="check-item">
            <input type="checkbox" onchange="toggleCheckItem(this, 11, 4)">
            <span>Lệnh <code>python lab9.py check</code> báo xanh toàn bộ 6 Gate và đã push kèm tag git lên repo.</span>
          </label>
        </div>
      </div>
    `
  }
];

// ==========================================================================
// CVAT Handbook Content (Trích xuất quy chuẩn từ GUIDE.md)
// ==========================================================================
const CVAT_GUIDE_HTML = `
  <div class="modal-quick-nav">
    <a href="#cvat-sec-1">1. Bật CVAT</a>
    <a href="#cvat-sec-2">2. Tạo Task & Guideline</a>
    <a href="#cvat-sec-3">3. Phím tắt & kỹ thuật vẽ</a>
    <a href="#cvat-sec-4">4. Export nhãn</a>
    <a href="#cvat-sec-5">5. Peer Tester</a>
    <a href="#cvat-sec-6">6. Xem export của peer</a>
  </div>

  <div class="modal-section" id="cvat-sec-1">
    <h3 class="section-h3">1. Bật CVAT đã cài đặt</h3>
    <p>Lab dùng lại CVAT local bạn đã cài ở Day 2 (thư mục <code>cvat-day2</code>, bản v2.74.1 hoặc v2.76.0). <strong>Không cài CVAT mới.</strong></p>
    <ol>
      <li>Mở Docker Desktop, chờ Docker Engine chạy xong.</li>
      <li>Mở terminal, vào thư mục CVAT và khởi chạy:
        <div class="code-card" style="margin: 8px 0;">
          <div class="code-header"><span class="code-lang">Bật container CVAT</span><button class="copy-btn" onclick="copySnippet(this)">Sao chép</button></div>
          <pre><code>docker compose start</code></pre>
        </div>
      </li>
      <li>Quay về thư mục <code>guideline-challenge/</code>, kiểm tra trạng thái kết nối:
        <div class="code-card" style="margin: 8px 0;">
          <div class="code-header"><span class="code-lang">Kiểm tra trạng thái CVAT</span><button class="copy-btn" onclick="copySnippet(this)">Sao chép</button></div>
          <pre><code class="cmd-snippet" data-win="python lab9.py cvat" data-posix="make cvat-status">python lab9.py cvat</code></pre>
        </div>
      </li>
      <li>Mở trình duyệt truy cập <code>http://localhost:8080</code> và đăng nhập tài khoản bạn đã tạo từ Day 2.</li>
    </ol>
    <div class="callout callout-warning">
      <div class="callout-body">
        <span class="callout-title">Lưu ý quản lý dữ liệu Docker</span>
        Khi kết thúc buổi lab, tắt container bằng <code>docker compose stop</code>. Tuyệt đối KHÔNG chạy <code>docker compose down -v</code> vì cờ <code>-v</code> sẽ xóa toàn bộ volume database chứa task và nhãn đã vẽ. Nhớ lưu bài thường xuyên bằng <strong>Ctrl+S</strong>.
      </div>
    </div>
  </div>

  <div class="modal-section" id="cvat-sec-2">
    <h3 class="section-h3">2. Tạo task calibration & dán guideline (Mục 2 GUIDE.md)</h3>
    <h4 style="font-size: 0.95rem; font-weight: 700; margin: 12px 0 6px; color: var(--text-primary);">2.1 Chuẩn bị Labels JSON</h4>
    <p>CVAT nhận danh sách nhãn ở định dạng JSON trong tab <strong>Raw</strong>. Bảng ontology là nguồn chuẩn duy nhất, file JSON chỉ là bản dịch kỹ thuật. Chú ý kỹ thuật chống silent defaults bằng cách đưa <code>"__undefined__"</code> lên đầu danh sách values và làm default.</p>
    <div class="code-card">
      <div class="code-header"><span class="code-lang">Kiểm tra hợp lệ JSON trước khi dùng</span><button class="copy-btn" onclick="copySnippet(this)">Sao chép</button></div>
      <pre><code>python -m json.tool project/03_cvat_labels.json</code></pre>
    </div>

    <h4 style="font-size: 0.95rem; font-weight: 700; margin: 14px 0 6px; color: var(--text-primary);">2.2 Thao tác tạo Task</h4>
    <ol>
      <li>Chạy lệnh gom ảnh: <code>python lab9.py pack calibration</code> (ảnh gom vào <code>build/calibration/</code>).</li>
      <li>Trong CVAT: vào trang <strong>Tasks</strong> → click nút <strong>+</strong> → chọn <strong>Create a new task</strong>.</li>
      <li><strong>Name:</strong> Đặt theo quy chuẩn: <code>&lt;tên_nhóm&gt;-calib-&lt;tên_bạn&gt;</code> (ví dụ: <code>nhom1-calib-an</code>).</li>
      <li><strong>Labels:</strong> Click tab <strong>Raw</strong>, xóa toàn bộ nội dung có sẵn, dán nội dung <code>project/03_cvat_labels.json</code> vào rồi click <strong>Save</strong>. Chuyển sang tab <strong>Constructor</strong> kiểm tra lại các nhãn và thuộc tính đã hiển thị đúng.</li>
      <li><strong>Select files:</strong> Chọn <strong>My computer</strong> → chọn <strong>toàn bộ</strong> file ảnh trong thư mục <code>build/calibration/</code>.</li>
      <li>Mở <strong>Advanced configuration</strong>, giữ nguyên <strong>Sorting method</strong> mặc định (<em>lexicographical</em>) để giữ thứ tự ảnh theo tên file.</li>
      <li>Click <strong>Submit & Open</strong>. Trong trang chi tiết task, click dòng <strong>Job #...</strong> để mở màn hình gắn nhãn.</li>
    </ol>

    <h4 style="font-size: 0.95rem; font-weight: 700; margin: 14px 0 6px; color: var(--text-primary);">2.3 Dán guideline vào Guide của task</h4>
    <ol>
      <li>Ở trang chi tiết task, dưới mục <strong>Task description</strong>, click <strong>Edit</strong>.</li>
      <li>Dán toàn bộ nội dung file <code>project/02_guideline.md</code> vào ô Markdown, sau đó click <strong>Submit</strong>.</li>
      <li>Trong màn hình gắn nhãn, nút <strong>Guide</strong> ở góc trên bên phải cho phép annotator xem lại quy chuẩn bất kỳ lúc nào.</li>
    </ol>
  </div>

  <div class="modal-section" id="cvat-sec-3">
    <h3 class="section-h3">3. Bảng phím tắt & kỹ thuật vẽ trên CVAT (Mục 3 GUIDE.md)</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 28%;">Thao tác</th>
            <th style="width: 72%;">Phím tắt / cách thực hiện trên giao diện</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Vẽ Rectangle</strong></td>
            <td>Chọn công cụ Rectangle → chọn Label → click góc trên trái rồi click góc dưới phải.</td>
          </tr>
          <tr>
            <td><strong>Vẽ Polygon</strong></td>
            <td>Chọn Polygon → click từng điểm ranh giới (≥ 3 điểm) → bấm <strong>N</strong> hoặc nút <strong>Done</strong> trên thanh công cụ để hoàn thành.</td>
          </tr>
          <tr>
            <td><strong>Lặp lại công cụ</strong></td>
            <td>Bấm phím <strong>N</strong> để vẽ tiếp vật thể cùng loại vừa dùng.</td>
          </tr>
          <tr>
            <td><strong>Sửa hình / Xóa</strong></td>
            <td>Click chọn vật thể để kéo cạnh/điểm. Bấm <strong>Del</strong> để xóa vật thể. Hoàn tác bằng <strong>Ctrl+Z</strong>.</td>
          </tr>
          <tr>
            <td><strong>Setup Tag (Cả ảnh)</strong></td>
            <td>Chọn công cụ <strong>Setup tag</strong> bên trái → chọn label kiểu tag → click <strong>Tag</strong>.</td>
          </tr>
          <tr>
            <td><strong>Chuyển ảnh nhanh</strong></td>
            <td>Phím <strong>F</strong> (ảnh tiếp theo), phím <strong>D</strong> (ảnh trước đó). Nhảy nhiều ảnh: <strong>V</strong> / <strong>C</strong>.</td>
          </tr>
          <tr>
            <td><strong>Gán nhanh thuộc tính</strong></td>
            <td>Đổi chế độ ở góc trên phải từ <strong>Standard</strong> sang <strong>Attribute annotation</strong>. Màn hình phóng to từng vật thể: dùng <strong>↑ / ↓</strong> đổi thuộc tính, phím số chọn giá trị, <strong>Tab</strong> đổi vật thể.</td>
          </tr>
          <tr>
            <td><strong>Temporal Track (Video)</strong></td>
            <td>Ở frame đầu chọn <strong>Track</strong> thay vì Shape. Khi chuyển frame (<strong>F</strong>), CVAT tự động nội suy vị trí; nếu lệch thì kéo lại. Bấm <strong>K</strong> để bật/tắt keyframe. <strong>Khi vật thể biến mất/bị che hẳn:</strong> chọn track và bấm <strong>O</strong> (outside).</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div class="modal-section" id="cvat-sec-4">
    <h3 class="section-h3">4. Hướng dẫn export nhãn chuẩn (Mục 4 GUIDE.md)</h3>
    <ol>
      <li>Nhấn <strong>Ctrl+S</strong> để chắc chắn toàn bộ nhãn đã được lưu lên server.</li>
      <li>Trong màn hình Job: click <strong>Menu</strong> (góc trên trái) → chọn <strong>Export job dataset</strong> (hoặc ngoài trang Task: <strong>Actions</strong> → <strong>Export task dataset</strong>).</li>
      <li>Tại mục <strong>Export format</strong>: Chọn <strong>CVAT for images 1.1</strong> (nếu bài toán có video track: chọn <strong>CVAT for video 1.1</strong>).</li>
      <li><strong>TẮT tùy chọn "Save images"</strong> (bỏ chọn checkbox này để gói zip chỉ chứa file XML nhãn nhẹ và chuẩn format chấm điểm).</li>
      <li>Tải file zip về, đổi tên theo tên thành viên (ví dụ <code>an.zip</code>, <code>binh.zip</code>), sau đó chép vào thư mục <code>project/06_calibration_exports/</code> để chạy lệnh đo bất đồng.</li>
    </ol>
  </div>

  <div class="modal-section" id="cvat-sec-5">
    <h3 class="section-h3">5. Quy trình làm peer tester (Mục 5 GUIDE.md)</h3>
    <ol>
      <li>Nhận file <code>blind-pack.zip</code> từ nhóm đối ứng, giải nén và đọc kỹ file <code>PEER_README.md</code>.</li>
      <li>Tạo task mới trên CVAT máy bạn: đặt tên <code>peer-&lt;tên_nhóm_owner&gt;</code>, tab Raw dán file <code>cvat_labels.json</code> trong gói nhận được, mục Select files chọn toàn bộ ảnh trong thư mục <code>images/</code>.</li>
      <li>Label theo guideline trong 15 phút. Không đoán ý owner. Chỗ nào phải hỏi hoặc không hiểu: ghi lại nguyên văn câu hỏi và mốc giờ để owner ghi vào <code>clarification_log.csv</code>.</li>
      <li>Export dataset theo định dạng <strong>CVAT for images 1.1</strong> (tắt Save images), đổi tên file thành <code>&lt;tên_nhóm_bạn&gt;-blind.zip</code> và gửi lại cho nhóm owner kèm câu trả lời cho 5 câu hỏi feedback.</li>
    </ol>
  </div>

  <div class="modal-section" id="cvat-sec-6">
    <h3 class="section-h3">6. Xem & đối chiếu export của peer (Mục 6 GUIDE.md)</h3>
    <p>Đối với các quyết định hình học (geometry decisions) hoặc khi cột tóm tắt <code>peer_evidence</code> chưa đủ chi tiết, bạn cần mở trực tiếp nét vẽ của peer trên CVAT để đối chiếu visual:</p>
    <ol>
      <li>Chạy lệnh gom ảnh blind: <code>python lab9.py pack blind</code> (hoặc <code>make pack SPLIT=blind</code>).</li>
      <li>Tạo task kiểm tra trên CVAT: đặt tên <code>review-&lt;tên_nhóm_peer&gt;</code> với <strong>đúng</strong> file <code>project/03_cvat_labels.json</code> đã freeze và toàn bộ ảnh trong <code>build/blind/</code>.</li>
      <li>Ở trang task vừa tạo: click <strong>Actions</strong> → chọn <strong>Upload annotations</strong>:
        <ul style="margin-top: 6px;">
          <li><strong>Import format:</strong> Chọn <strong>CVAT 1.1</strong> (định dạng này nhận cả export for images lẫn for video).</li>
          <li><strong>Import mode:</strong> Giữ mặc định là <strong>Replace</strong>.</li>
          <li>Kéo thả file export của peer (trong thư mục <code>project/07_blind_handoff/peer_output/</code>) vào vùng tải file → click <strong>OK</strong>.</li>
        </ul>
      </li>
      <li>Mở job gán nhãn, đối chiếu trực quan từng bounding box và attribute của peer vẽ so với quyết định Gold của nhóm bạn, sau đó điền kết quả vào file <code>transfer_score.csv</code>.</li>
    </ol>
  </div>
`;

// ==========================================================================
// Quick Help / Troubleshooting Content (Trích xuất từ Mục 7 GUIDE.md)
// ==========================================================================
const QUICK_HELP_HTML = `
  <div class="modal-section">
    <h3 class="section-h3">1. CVAT chưa chạy ở http://localhost:8080</h3>
    <p><strong>Nguyên nhân:</strong> Docker Desktop chưa bật hoặc các container CVAT đang ở trạng thái dừng.</p>
    <p><strong>Cách khắc phục:</strong> Mở Docker Desktop, vào thư mục chứa CVAT (ví dụ <code>cvat-day2</code>), chạy lệnh:</p>
    <div class="code-card">
      <div class="code-header"><span class="code-lang">Khởi động lại CVAT</span><button class="copy-btn" onclick="copySnippet(this)">Sao chép</button></div>
      <pre><code>docker compose start
# Nếu báo container chưa tồn tại:
docker compose up -d</code></pre>
    </div>
  </div>

  <div class="modal-section">
    <h3 class="section-h3">2. Lỗi 'make: command not found' trên Windows</h3>
    <p><strong>Cách khắc phục:</strong> Hệ điều hành Windows mặc định không có công cụ make. Hãy chuyển sang dùng lệnh Python tương ứng: <code>python lab9.py &lt;tên_lệnh&gt;</code> (hoặc <code>py lab9.py ...</code>).</p>
  </div>

  <div class="modal-section">
    <h3 class="section-h3">3. Lỗi xung đột tag 'gold-freeze' trong Git</h3>
    <p><strong>Nguyên nhân:</strong> Một thành viên trong nhóm đã chạy freeze và push tag mới, nhưng máy của bạn chưa cập nhật đè tag git.</p>
    <p><strong>Cách khắc phục:</strong> Chạy lệnh kéo tag bắt buộc:</p>
    <div class="code-card">
      <div class="code-header"><span class="code-lang">Đồng bộ tag bắt buộc</span><button class="copy-btn" onclick="copySnippet(this)">Sao chép</button></div>
      <pre><code>git pull && git fetch --tags --force</code></pre>
    </div>
  </div>

  <div class="modal-section">
    <h3 class="section-h3">4. Lỗi 'Clone này đã có tag gold-freeze nhưng thiếu project/FREEZE.txt'</h3>
    <p><strong>Nguyên nhân:</strong> Bạn cùng nhóm đã freeze; quy chuẩn lab quy định mỗi nhóm chỉ <strong>DUY NHẤT một người</strong> chạy lệnh freeze.</p>
    <p><strong>Cách khắc phục:</strong> Chạy <code>git pull</code> để kéo file về. Nếu lỡ tay xóa mất: <code>git restore --source=gold-freeze -- project/FREEZE.txt</code>. Nếu nhóm thật sự cần freeze lại (và chưa nhận export từ peer): chạy <code>python lab9.py freeze --refreeze</code> (hoặc <code>make freeze REFREEZE=1</code>).</p>
  </div>

  <div class="modal-section">
    <h3 class="section-h3">5. Lỗi 'Khác bản đã commit ở tag gold-freeze'</h3>
    <p><strong>Nguyên nhân:</strong> Sau khi nhóm đã freeze, có người đã vô tình sửa vào file gold decisions hoặc sample pack, làm sai lệch mã băm SHA256.</p>
    <p><strong>Cách khắc phục:</strong> Hoàn tác các sửa đổi ngoài ý muốn để đưa file về trạng thái chuẩn đã khóa: <code>git checkout gold-freeze -- &lt;đường_dẫn_file&gt;</code>.</p>
  </div>

  <div class="modal-section">
    <h3 class="section-h3">6. Quên mật khẩu đăng nhập CVAT</h3>
    <p><strong>Cách khắc phục:</strong> Trong thư mục CVAT trên terminal, tạo ngay một tài khoản superuser mới:</p>
    <div class="code-card">
      <div class="code-header"><span class="code-lang">Tạo tài khoản quản trị mới</span><button class="copy-btn" onclick="copySnippet(this)">Sao chép</button></div>
      <pre><code>docker exec -it cvat_server bash -ic 'python3 ~/manage.py createsuperuser'</code></pre>
    </div>
  </div>

  <div class="modal-section">
    <h3 class="section-h3">7. Lỗi 'UnicodeEncodeError: charmap codec' trên Windows PowerShell</h3>
    <p><strong>Nguyên nhân:</strong> Bảng mã mặc định của console Windows là CP1252, không thể in các ký tự tiếng Việt có dấu từ script Python.</p>
    <p><strong>Cách khắc phục:</strong> Thiết lập biến môi trường UTF-8 trong PowerShell trước khi chạy lệnh:</p>
    <div class="code-card">
      <div class="code-header"><span class="code-lang">Kích hoạt UTF-8 trên PowerShell</span><button class="copy-btn" onclick="copySnippet(this)">Sao chép</button></div>
      <pre><code>$env:PYTHONUTF8 = "1"
# Hoặc truyền cờ -X utf8 trực tiếp:
python -X utf8 lab9.py &lt;lệnh&gt;</code></pre>
    </div>
  </div>

  <div class="modal-section">
    <h3 class="section-h3">8. Lỗi 'Export không có &lt;image&gt;, &lt;track&gt; hay &lt;tag&gt; nào'</h3>
    <p><strong>Nguyên nhân:</strong> Thao tác export chọn nhầm định dạng hoặc job chưa có annotation nào được lưu lại.</p>
    <p><strong>Cách khắc phục:</strong> Vào lại task, bấm Ctrl+S để lưu, sau đó export lại chính xác với định dạng <strong>CVAT for images 1.1</strong> (nhớ tắt checkbox Save images).</p>
  </div>
`;

// Helper: Render Current Step
function renderStep(index) {
  state.currentStepIndex = index;
  const step = LAB_STEPS[index];

  // Update Top Bar
  document.getElementById('step-current-number').textContent = `Bước ${step.id} / ${LAB_STEPS.length}`;
  document.getElementById('step-timeline-badge').textContent = step.timeline;

  // Render Content Header
  let gateBadgeHtml = '';
  if (step.gate) {
    gateBadgeHtml = `<span class="gate-badge-lg">${step.gate}</span>`;
  }

  const contentContainer = document.getElementById('step-viewport');
  contentContainer.innerHTML = `
    <div class="step-header">
      <div class="step-meta-row">
        <span class="step-num-pill">${step.timeline}</span>
        ${gateBadgeHtml}
      </div>
      <h1 class="step-title">${step.fullTitle}</h1>
      <p class="step-desc">${step.desc}</p>
    </div>
    <div class="step-body-content">
      ${step.content}
    </div>
  `;

  // Update Bottom Nav Buttons
  document.getElementById('btn-prev').disabled = (index === 0);
  const nextBtn = document.getElementById('btn-next');
  if (index === LAB_STEPS.length - 1) {
    nextBtn.innerHTML = `
      <span>Hoàn tất & Nộp bài</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
    `;
  } else {
    nextBtn.innerHTML = `
      <span>Bước tiếp theo</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
    `;
  }

  // Update Mark Complete Checkbox
  const completeCheckbox = document.getElementById('chk-mark-complete');
  completeCheckbox.checked = state.completedSteps.has(step.id);

  // Update Sidebar Items Active State
  document.querySelectorAll('.step-item').forEach((el, idx) => {
    if (idx === index) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }

    if (state.completedSteps.has(LAB_STEPS[idx].id)) {
      el.classList.add('completed');
    } else {
      el.classList.remove('completed');
    }
  });

  // Apply OS snippet texts
  applyOSSnippets();

  // Restore checklist states for this step
  restoreChecklistState(step.id);

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Helper: Apply OS snippets
function applyOSSnippets() {
  const snippets = document.querySelectorAll('.cmd-snippet');
  snippets.forEach(el => {
    const text = state.selectedOS === 'win' ? el.getAttribute('data-win') : el.getAttribute('data-posix');
    if (text) {
      el.textContent = text;
    }
  });
}

// Navigation Handlers
function nextStep() {
  if (state.currentStepIndex < LAB_STEPS.length - 1) {
    renderStep(state.currentStepIndex + 1);
  }
}

function prevStep() {
  if (state.currentStepIndex > 0) {
    renderStep(state.currentStepIndex - 1);
  }
}

function toggleStepComplete() {
  const stepId = LAB_STEPS[state.currentStepIndex].id;
  if (state.completedSteps.has(stepId)) {
    state.completedSteps.delete(stepId);
  } else {
    state.completedSteps.add(stepId);
  }
  saveCompletedSteps();
  updateProgressBar();
  renderStep(state.currentStepIndex);
}

function updateProgressBar() {
  const total = LAB_STEPS.length;
  const done = state.completedSteps.size;
  const pct = Math.round((done / total) * 100);
  
  const bar = document.getElementById('progress-bar-fill');
  const txt = document.getElementById('progress-percent-txt');
  if (bar) bar.style.width = `${pct}%`;
  if (txt) txt.textContent = `${pct}%`;
}

// OS Switcher
function setOS(os) {
  state.selectedOS = os;
  localStorage.setItem('day9_os', os);
  
  document.querySelectorAll('.os-btn').forEach(btn => {
    if (btn.getAttribute('data-os') === os) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  applyOSSnippets();
}

// Theme Switcher
function setTheme(theme) {
  state.theme = theme;
  localStorage.setItem('day9_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);

  const icon = document.getElementById('theme-icon');
  if (icon) {
    if (theme === 'light') {
      // Show moon icon
      icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
    } else {
      // Show sun icon
      icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
    }
  }
}

function toggleTheme() {
  setTheme(state.theme === 'dark' ? 'light' : 'dark');
}

// Copy Code Button
function copySnippet(button) {
  const codeCard = button.closest('.code-card');
  const codeEl = codeCard.querySelector('pre code') || codeCard.querySelector('pre');
  if (!codeEl) return;

  const textToCopy = codeEl.textContent.trim();
  navigator.clipboard.writeText(textToCopy).then(() => {
    const originalText = button.textContent;
    button.textContent = 'Đã sao chép!';
    button.classList.add('copied');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  });
}

// Checklist Item Toggle
function toggleCheckItem(checkbox, stepId, itemIndex) {
  const key = `${stepId}_${itemIndex}`;
  checklistState[key] = checkbox.checked;
  localStorage.setItem('day9_checklists', JSON.stringify(checklistState));

  const label = checkbox.closest('.check-item');
  if (label) {
    if (checkbox.checked) {
      label.classList.add('checked');
    } else {
      label.classList.remove('checked');
    }
  }
}

function restoreChecklistState(stepId) {
  const checkboxes = document.querySelectorAll('.checklist-card input[type="checkbox"]');
  checkboxes.forEach((cb, idx) => {
    const key = `${stepId}_${idx}`;
    if (checklistState[key]) {
      cb.checked = true;
      cb.closest('.check-item')?.classList.add('checked');
    }
  });
}

// Modal Tab Switcher
function switchModalTab(tabName) {
  const btnCvat = document.getElementById('tab-btn-cvat');
  const btnTrouble = document.getElementById('tab-btn-troubleshoot');
  const paneCvat = document.getElementById('modal-pane-cvat');
  const paneTrouble = document.getElementById('modal-pane-troubleshoot');

  if (tabName === 'cvat') {
    btnCvat?.classList.add('active');
    btnTrouble?.classList.remove('active');
    paneCvat?.classList.add('active');
    paneTrouble?.classList.remove('active');
  } else {
    btnTrouble?.classList.add('active');
    btnCvat?.classList.remove('active');
    paneTrouble?.classList.add('active');
    paneCvat?.classList.remove('active');
  }
}

// Quick Help / CVAT Handbook Modal
function openHelpModal(tab = 'troubleshoot', targetSectionId = null) {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('open');
  switchModalTab(tab);

  if (targetSectionId) {
    setTimeout(() => {
      const el = document.getElementById(targetSectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.remove('highlight-target');
        void el.offsetWidth;
        el.classList.add('highlight-target');
      }
    }, 120);
  }
}

function closeHelpModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// Mobile Sidebar Toggle
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Build Sidebar Navigation
function buildSidebarNav() {
  const navContainer = document.getElementById('sidebar-nav');
  navContainer.innerHTML = '';

  let currentPart = '';

  LAB_STEPS.forEach((step, idx) => {
    if (step.part !== currentPart) {
      currentPart = step.part;
      const sectionTitle = document.createElement('div');
      sectionTitle.className = 'nav-section-title';
      sectionTitle.textContent = currentPart;
      navContainer.appendChild(sectionTitle);
    }

    const stepItem = document.createElement('div');
    stepItem.className = 'step-item';
    stepItem.onclick = () => {
      renderStep(idx);
      // Close sidebar on mobile
      document.getElementById('sidebar').classList.remove('open');
    };

    let gateTagHtml = '';
    if (step.gate) {
      gateTagHtml = `<span class="gate-tag">${step.gate}</span>`;
    }

    stepItem.innerHTML = `
      <div class="step-index-badge">${step.id}</div>
      <div class="step-item-content">
        <span class="step-item-title">${step.title}</span>
        <div class="step-item-meta">
          <span>${step.timeline}</span>
          ${gateTagHtml}
        </div>
      </div>
    `;

    navContainer.appendChild(stepItem);
  });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight') {
    nextStep();
  } else if (e.key === 'ArrowLeft') {
    prevStep();
  } else if (e.key === 'Escape') {
    closeHelpModal();
  }
});

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
  loadCompletedSteps();
  buildSidebarNav();
  setTheme(state.theme);
  setOS(state.selectedOS);
  updateProgressBar();
  renderStep(0);

  // Inject CVAT Handbook & Quick Help content into modal
  const modalContainer = document.getElementById('modal-body-container');
  if (modalContainer) {
    modalContainer.innerHTML = `
      <div class="modal-tab-pane active" id="modal-pane-cvat">
        ${CVAT_GUIDE_HTML}
      </div>
      <div class="modal-tab-pane" id="modal-pane-troubleshoot">
        ${QUICK_HELP_HTML}
      </div>
    `;
  }
});
