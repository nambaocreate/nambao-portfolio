# Nam Bảo — Portfolio

Trang portfolio một trang, làm theo khung **Nam Bao Portfolio** trong Figma
(file NAM-BAO, Page 11). Bản v3 đã có motion tham khảo noho.ink
(xem rồi tự viết lại, không copy code của họ).

## Chạy thử trên máy

```bash
cd nambao-portfolio
python3 -m http.server 8000
```

Mở http://localhost:8000

## Cấu trúc

```text
index.html          Nội dung và cấu trúc trang chủ (Hero, About, Awards, Press, Footer)
work.html           Trang Work (Selected Works), lưới dự án vẽ từ js/work-data.js
css/styles.css      Toàn bộ giao diện, token màu, breakpoint và motion dùng chung
css/work.css        Bố cục và motion riêng của trang Work (lưới, card, filter, hover zoom)
js/main.js          Chữ cuộn từng ký tự, hiện dần khi cuộn, con trỏ "Read",
                    Press trượt ngang theo cuộn dọc, cuộn mượt (dùng chung mọi trang)
js/work-data.js     Dữ liệu 7 dự án trang Work (tên, tag, ảnh, tỉ lệ, thứ tự) + mục filter
js/work.js          Vẽ lưới dự án từ work-data.js, xử lý filter theo ngành
assets/logo.svg     Logo "nam bao" ở nav, xuất từ Figma
assets/logo-footer.svg  Logo "nam bao" lớn ở footer, xuất từ Figma
assets/triangle.svg Tam giác hero (bo góc 9), xuất từ Figma
assets/work/        7 ảnh cover trang Work (JPEG đã tối ưu, tên theo dự án)
404.html            Trang báo lỗi Vercel tự dùng khi link chưa có
```

## Motion (v3, tham khảo noho.ink)

- Chữ cuộn từng ký tự khi hover: nav và từng hàng Awards. Mỗi chữ có
  2 bản giống hệt nhau xếp chồng, mỗi ký tự là một span riêng, hover
  thì từng ký tự trượt lên 1 dòng với độ trễ 35ms mỗi ký tự.
- Mọi element hiện dần khi cuộn: mờ dần + trượt lên 32px trong 0.7s,
  lệch nhau 90ms trong cùng một nhóm. Headline ở hero trượt lên
  khỏi khung cắt (clip) khi trang tải xong.
- Press: section ghim (pinned) cao 200vh, cuộn dọc đẩy hàng thẻ
  trượt ngang, giống Noho Stories. Không có thanh trượt ngang.
  Trên mobile thẻ xếp dọc. Thẻ Press không tự chuyển động khi
  hover (đúng như Noho Stories), thay vào đó con trỏ chuột nở
  thành đĩa tròn đen 120px có chữ Read.
- Footer cao tối thiểu đúng một màn hình (100svh), logo co giãn
  ôm sát đáy nên hàng contact không bị đẩy mất.
- Tôn trọng `prefers-reduced-motion` và thiết bị cảm ứng (không có
  con trỏ, không có motion).

## Quy ước

- Một file một việc. Sửa giao diện thì chỉ sửa `css/styles.css`,
  sửa chữ thì chỉ sửa `index.html`.
- Màu và cỡ chữ lấy đúng từ Figma, ghi chú trong `:root` của
  `css/styles.css`. Đổi màu thì đổi trong Figma trước, rồi đổi ở đây.
- `assets/logo.svg` là file xuất từ Figma, không vẽ lại bằng tay.
- Chữ dùng font Libre Franklin, lấy từ Google Fonts.
- Chữ hiển thị theo đúng textCase của Figma: các nhãn section là
  chữ hoa (INTRODUCTION, WHAT I DO, AWARDS & RECOGNITIONS, PRESS),
  nav là Title Case (Contact, không phải contact). Từ v3, mọi cỡ
  chữ giảm 4px so với v2 (nav 20, headline 69, thân bài About 44,
  hàng Awards 20, tiêu đề Press 28), khung trong Figma cũng đã
  giảm 4pt tương ứng.
- Cụm shape hero: vị trí tuyệt đối theo đúng Figma, tam giác là
  file SVG xuất từ Figma (bo góc 9), vuông bo góc 16.
- Bảng Awards theo đúng grid 6 cột của Figma (offset 80, gutter 20):
  cột 297 / 300 / 597 / 420 / 140 trên nền nội dung 1760px,
  header cách nhãn 48px, hàng cao 72px, divider 1px dưới mỗi hàng.
- Không có secret, không có `.env`, không có dữ liệu người dùng.
  Trang này không thu thập gì cả.

## Deploy

Đẩy code lên nhánh `main` của repo GitHub là Vercel tự deploy lại,
không cần deploy bằng tay. Link chạy ở tên miền `.vercel.app` của
project trên Vercel.

## Trang Work (/work)

- Lưới 2 cột, lề 40px, gap 20px, theo đúng Frame 4 trong Figma
  (1920x5673). Thứ tự: Vore + EGG:01, RMIT25 full width
  (section to nhất), Việt Cổ Truyện + Tad.atelier,
  VIBE Expo + Tuổi Hồng 28. Mỗi cặp 1 lùn 1 cao để tạo
  dynamic, tỉ lệ khung ảnh giữ đúng Figma ở mọi màn hình.
- Dữ liệu 7 dự án nằm hết trong `js/work-data.js` (tên, tag,
  ảnh, tỉ lệ, thứ tự, mục filter). Đổi tên, tag, ảnh hay thứ
  tự thì chỉ sửa file đó, không cần động vào HTML hay JS.
- Motion trang Work: tiêu đề trượt lên khỏi khung cắt khi tải
  xong (cùng cơ chế với headline ở hero); card hiện dần bằng
  `.reveal` dùng chung, ảnh trong card thì "lắng" từ zoom
  1.08 về 1 khi vào viewport (kiểu reveal của trang case
  tham khảo brandonyasin.com/cases/bestseller, xem rồi tự
  viết lại, không copy code); hover thì ảnh zoom nhẹ lên
  1.05 trong khung overflow hidden. Chỉ dùng transform và
  opacity (GPU) nên không giật layout.
- Filter theo ngành: bấm một ngành để chỉ hiện dự án thuộc
  ngành đó, bấm lại để hiện tất cả. Card không khớp thì mờ
  dần rồi mới ẩn khỏi lưới.
- Ảnh cover trong `assets/work/` là JPEG đã tối ưu (tổng 7
  ảnh khoảng 1,8 MB). Ảnh full width RMIT25 giữ 1920px vì
  hiển thị tới 1840px, các ảnh còn lại 1000-1600px. Hai ảnh
  đầu tải eager (trên màn hình đầu tiên), còn lại lazy.

### Bản v7 (11/2026) — đang chạy ở /work

Phần mô tả lưới 2 cột ở trên là bản cũ (`work.css`, `work.js`,
`work-data.js` không còn được `work.html` dùng). Bản đang chạy:

- Bố cục theo Figma Frame 28 (node 1742:156): cột trái là nút
  INDEPENDENT WORKS / AGENCY WORKS, mục lục số + TAGLINE dự án
  (không phải tên), rồi số thứ tự, tên dự án, tag ở đáy; cột
  phải là chồng ảnh. Cả bố cục co theo đơn vị `--u` (1px Figma,
  đúng từng px ở 1920 x 920). Code: `css/work-new.css`,
  `js/work-new.js`.
- Chồng ảnh kiểu "Folders" (tham khảo madewithgsap tutorial 045,
  tự viết lại): 3 dự án kế tiếp nằm sau, nhỏ dần và nhô lên.
  Sang dự án tiếp thì tờ trước rơi xuống, cả chồng tiến lên; dừng
  ở 2 đầu, không lặp vòng. Hover ảnh trước vẫn nghiêng theo chuột,
  giữ con trỏ Open / Coming Soon / tab mới và note trong ảnh.
- Tagline nằm trong `js/work-new.js` (trường `tagline`). Vore,
  EGG:01, RMIT theo Figma; Tuổi Hồng 28 theo case study; 4 dự án
  Agency rút từ trang collectivedesign.agency; Việt Cổ Truyện,
  Tad.atelier, VIBE Expo, Dế STEM, WEWELL, CyPeace là BẢN NHÁP.
- Nav v2: CONTACT xanh chanh + thanh xám ấm, góc vuông, khấc cuống
  vé ở chỗ nối; mở menu như rút tờ giấy ra từ cục cam.
- Logo footer v3: outline Sarina thật, hiện dần dưới mặt nạ nét bút
  chạy theo centerline (thứ tự viết tự nhiên, tốc độ bút đều).

## Việc tiếp theo

1. Bản mobile: hiện tại chỉ có responsive cơ bản (chữ co bằng
   `clamp()`, bố cục xếp chồng dưới 900px). Khi có thiết kế mobile
   trong Figma thì thêm breakpoint, không cần sửa HTML.
2. Trang Playground, Contact: nav đang trỏ tới `/playground`,
   `/contact`, các trang này chưa có nên Vercel hiện trả về
   `404.html`.
3. Link Instagram, Facebook, LinkedIn, Behance ở footer hiện là
   chữ thường (chưa có URL hồ sơ), cần hỏi Bảo lấy link rồi mới
   gắn thành link bấm được.
