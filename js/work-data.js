// Nam Bao Portfolio — dữ liệu trang Work
// Một chỗ duy nhất để sửa nội dung trang /work: đổi tên, tag,
// ảnh, tỉ lệ hay thứ tự thì chỉ sửa file này, không cần động
// vào work.html hay work.js. Thứ tự trong mảng là thứ tự hiển
// thị trên trang (2 cột, card wide chiếm cả 2 cột).
//
// - aspect: tỉ lệ khung ảnh "rộng/cao" theo đúng Figma ở 1920px
//   (ví dụ "910/512"). Web giữ đúng tỉ lệ này ở mọi màn hình,
//   ảnh crop theo kiểu cover giống scaleMode FILL trong Figma.
// - wide: true thì card chiếm full width (RMIT25, section to nhất).
// - width/height: kích thước thật của file ảnh, để trình duyệt
//   giữ chỗ trước khi ảnh tải về (không bị giật layout).

window.WORK_PROJECTS = [
  {
    id: "vore",
    title: "Vore",
    tag: "Food & beverage",
    image: "assets/work/vore.jpg",
    alt: "Ba poster của Vore treo trên tường",
    aspect: "910/512",
    width: 1600,
    height: 900,
    wide: false
  },
  {
    id: "egg01",
    title: "EGG:01",
    tag: "Food & beverage",
    image: "assets/work/egg01.jpg",
    alt: "Hộp bạc EGG:01 cạnh chai thủy tinh gân sóng có lòng đỏ cam",
    aspect: "910/882",
    width: 1400,
    height: 1356,
    wide: false
  },
  {
    id: "rmit25",
    title: "RMIT25",
    tag: "Education",
    image: "assets/work/rmit25.jpg",
    alt: "Billboard 25 Years Of Progress trên mặt tiền gỗ",
    aspect: "1840/1035",
    width: 1920,
    height: 1080,
    wide: true
  },
  {
    id: "dothanh",
    title: "Đô Thành Cổ Tích",
    tag: "Art",
    image: "assets/work/dothanh.jpg",
    alt: "Laptop chạy website Phố Việt Cổ Truyện",
    aspect: "910/480",
    width: 1393,
    height: 853,
    wide: false
  },
  {
    id: "tad",
    title: "Tad.atelier",
    tag: "Architecture",
    image: "assets/work/tad.jpg",
    alt: "Board tổng hợp các dự án của Tad.atelier",
    aspect: "910/720",
    width: 1400,
    height: 989,
    wide: false
  },
  {
    id: "vibe",
    title: "VIBE Expo",
    tag: "Architecture",
    image: "assets/work/vibe.jpg",
    alt: "Render 3D sảnh expo cam của VIBE",
    aspect: "910/460",
    width: 1000,
    height: 558,
    wide: false
  },
  {
    id: "th28",
    title: "Tuổi Hồng 28",
    tag: "Entertainment",
    image: "assets/work/th28.jpg",
    alt: "Bốn poster Tuổi Hồng 28 năm 2024 trên nền sọc hồng",
    aspect: "910/700",
    width: 1600,
    height: 1067,
    wide: false
  }
];

// Thứ tự các mục filter, theo đúng Figma (thêm Entertainment
// vì Tuổi Hồng 28 đã đổi tag sang Entertainment). Bấm một mục
// để chỉ hiện dự án thuộc ngành đó, bấm lại để hiện tất cả.
window.WORK_FILTERS = [
  "Food & beverage",
  "Education",
  "Architecture",
  "Art",
  "Entertainment"
];
