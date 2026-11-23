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
index.html          Nội dung và cấu trúc trang (Hero, About, Awards, Press, Footer)
css/styles.css      Toàn bộ giao diện, token màu, breakpoint và motion
js/main.js          Chữ cuộn từng ký tự, hiện dần khi cuộn, con trỏ "Read",
                    Press trượt ngang theo cuộn dọc, cuộn mượt
assets/logo.svg     Logo "nam bao" ở nav, xuất từ Figma
assets/logo-footer.svg  Logo "nam bao" lớn ở footer, xuất từ Figma
assets/triangle.svg Tam giác hero (bo góc 9), xuất từ Figma
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

## Việc tiếp theo

1. Bản mobile: hiện tại chỉ có responsive cơ bản (chữ co bằng
   `clamp()`, bố cục xếp chồng dưới 900px). Khi có thiết kế mobile
   trong Figma thì thêm breakpoint, không cần sửa HTML.
2. Trang Work (Selected Works), Playground, Contact: nav đang trỏ
   tới `/work`, `/playground`, `/contact`, các trang này chưa có nên
   Vercel hiện trả về `404.html`.
3. Link Instagram, Facebook, LinkedIn, Behance ở footer hiện là
   chữ thường (chưa có URL hồ sơ), cần hỏi Bảo lấy link rồi mới
   gắn thành link bấm được.
