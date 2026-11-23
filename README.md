# Nam Bảo — Portfolio

Trang portfolio một trang, làm theo khung **Nam Bao Portfolio** trong Figma
(file NAM-BAO, Page 11). Bản tĩnh v1: chưa có animation, animation thêm sau
khi chốt bản tĩnh.

## Chạy thử trên máy

```bash
cd nambao-portfolio
python3 -m http.server 8000
```

Mở http://localhost:8000

## Cấu trúc

```text
index.html          Nội dung và cấu trúc trang (Hero, About, Awards, Press)
css/styles.css      Toàn bộ giao diện, token màu và breakpoint
js/main.js          Chỉ 2 việc nhỏ: năm ở footer, cuộn mượt tới anchor
assets/logo.svg     Logo "nam bao" ở nav và footer, xuất từ Figma
404.html            Trang báo lỗi Vercel tự dùng khi link chưa có
```

## Quy ước

- Một file một việc. Sửa giao diện thì chỉ sửa `css/styles.css`,
  sửa chữ thì chỉ sửa `index.html`.
- Màu và cỡ chữ lấy đúng từ Figma, ghi chú trong `:root` của
  `css/styles.css`. Đổi màu thì đổi trong Figma trước, rồi đổi ở đây.
- `assets/logo.svg` là file xuất từ Figma, không vẽ lại bằng tay.
- Chữ dùng font Libre Franklin, lấy từ Google Fonts.
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
2. Animation: thêm sau khi chốt bản tĩnh.
3. Trang Work (Selected Works), Playground, Contact: nav đang trỏ
   tới `/work`, `/playground`, `/contact`, các trang này chưa có nên
   Vercel hiện trả về `404.html`.
