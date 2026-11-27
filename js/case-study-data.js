// Nam Bao Portfolio — dữ liệu trang case study
// Một chỗ duy nhất để sửa nội dung một case study: thêm dự án mới
// thì chỉ thêm một mục vào window.CASE_STUDIES rồi thêm ảnh vào
// assets/case-study/<slug>/, không cần viết thêm HTML hay CSS.
// Renderer ở js/case-study.js vẽ trang từ dữ liệu này; khung HTML
// mỏng ở work/<slug>.html chỉ khai báo slug và nạp script.
//
// Quy ước dữ liệu (nội dung và thứ tự lấy đúng từ Figma):
// - hero: ảnh đầu trang, hiện ở tỉ lệ gốc, không crop. width/height
//   là kích thước file ảnh (để trình duyệt giữ chỗ, không giật layout).
// - meta: [{label, value}] — hiện chồng dọc, label trên, value dưới.
// - intro: {label, paragraphs[]} — nhãn section rồi các đoạn văn.
// - sections: từng khối theo đúng thứ tự Figma, mỗi khối một type:
//   full       : một ảnh toàn chiều rộng (1840, 6 cột) + caption.
//   trio       : 3 ảnh ngang hàng, mỗi ảnh 2 cột (600) + caption.
//   duo        : 2 ảnh lệch chiều cao, mỗi ảnh 3 cột (910) + caption.
//   pair       : 2 ảnh, ảnh rộng 3 cột (910), ảnh hẹp 2 cột (600),
//                cách nhau 330px (1 cột trống ở giữa).
//   portrait   : một ảnh căn giữa, 4 cột (1220) + caption.
//   text-image : cột chữ + ảnh, khoảng cách chữ tới ảnh là gutter
//                20px ở mọi section. Mặc định: cột chữ 1 cột (290),
//                ảnh 5 cột (1530); riêng section chữ rộng (TH28 slot
//                cuối) thì cột chữ 2 cột (600), ảnh 4 cột (1220).
//                imageSide 'left' | 'right' là phía của ẢNH.
//                text là mảng block: {t:'p', text, w} hoặc {t:'h', text}.
//                w là chiều rộng tối đa của đoạn đó, bằng rộng cột chữ.
//   text       : tiêu đề trái 1 cột (290) + các đoạn văn phải 2 cột
//                (600), cách nhau 330px (thân bài bắt đầu ở cột 3).
// - credits: {label, lines[]} — chỉ TH28 có.
// - next: [{title, tag, href, cover}] — thẻ dự án tiếp theo ở cuối
//   trang, dạng Work Card có ảnh cover kèm tên (theo Figma).
//   cover: {src, width, height} là ảnh cover thật của dự án đó.
//
// Lưu ý nội dung (không tự sửa, để Bảo quyết):
// - EGG: một số caption trong Figma không còn khớp ảnh sau khi đổi
//   thứ tự (vd caption full-width "Bottle silhouette, ribbed glass"
//   đang nằm dưới ảnh wordmark Frame 3). Dữ liệu dưới đây copy y
//   nguyên caption từ Figma, không viết lại.
// - TH28 hero dùng 1.png (4500x3000, key visual), theo quyết định
//   của Bảo 26/11/2026, thay banner sạch hero-banner.jpg. 1.png
//   cũng là ảnh ở section text-image slot 6, nên hero và section
//   đó trùng ảnh; giữ nguyên section đó, để Bảo quyết.
// - EGG hero gần vuông (1920x1860) nên màn hình đầu chủ yếu là hero,
//   đó là hệ quả trực tiếp của việc không crop.

window.CASE_STUDIES = {
  "tuoi-hong-28": {
    slug: "tuoi-hong-28",
    title: "TUOI HONG 28 Music Festival",
    subtitle: "Not An Ordinary Festival",
    hero: {
      src: "/assets/case-study/tuoi-hong-28/01-hero.jpg",
      alt: "Tuoi Hong 28 key visual",
      width: 1920, height: 1280
    },
    meta: [
      { label: "INDUSTRY", value: "Entertainment / Music Festival" },
      { label: "CLIENT", value: "Nguyen Thi Minh Khai High School (Tuoi Hong 28)" },
      { label: "YEAR", value: "2024" },
      { label: "WHAT I DID", value: "Brand Identity, Key Visual, Typography, Applications, Merchandise" }
    ],
    intro: {
      label: "Introduction",
      paragraphs: [
        "Tuoi Hong is an annual charity music event organized by Nguyen Thi Minh Khai High School since 1994. Not limited to just students within the school, Tuoi Hong is one of the most renowned music festivals among the youth throughout the city, featuring top Vietnamese music artists as special guests."
      ]
    },
    sections: [
      { type: "full",
        image: { src: "../assets/case-study/tuoi-hong-28/02-fullwidth.jpg", alt: "Thehien Display in use", width: 1920, height: 1080 },
        caption: "Thehien Display in use" },
      { type: "trio", images: [
        { src: "../assets/case-study/tuoi-hong-28/03-c1.jpg", alt: "Key visual, 3D broom", width: 1920, height: 1920, caption: "Key visual, 3D broom" },
        { src: "../assets/case-study/tuoi-hong-28/04-c2.jpg", alt: "Key visual, 3D flip-flop violin", width: 1920, height: 1920, caption: "Key visual, 3D flip-flop violin" },
        { src: "../assets/case-study/tuoi-hong-28/05-c3.jpg", alt: "Key visual, 3D milk can", width: 1920, height: 1920, caption: "Key visual, 3D milk can" }
      ] },
      { type: "text-image", imageSide: "left",
        image: { src: "../assets/case-study/tuoi-hong-28/06-text-image.jpg", alt: "Tuoi Hong 28 key visual", width: 1920, height: 1280 },
        text: [
          { t: "p", text: "The brand identity is inspired by the phrase 'from ordinary to extraordinary,' signifying that everyone has the potential to shine on stage with their talent.", w: 290 },
          { t: "p", text: "Things that are often overlooked in daily life become magically radiant in the musical world of 'Tuoi Hong'.", w: 290 }
        ] },
      { type: "duo", images: [
        { src: "../assets/case-study/tuoi-hong-28/07-b1.jpg", alt: "Photo booth, key visual in use", width: 1920, height: 1280, caption: "Photo booth, key visual in use" },
        { src: "../assets/case-study/tuoi-hong-28/08-b2.jpg", alt: "Poster standee", width: 1920, height: 1280, caption: "Poster standee" }
      ] },
      { type: "pair", images: [
        { src: "../assets/case-study/tuoi-hong-28/09-f1a.jpg", alt: "Thehien Display, alphabet", width: 1920, height: 1154, w: 910, caption: "Thehien Display, alphabet" },
        { src: "../assets/case-study/tuoi-hong-28/10-f1b.jpg", alt: "Thehien Display, letter forms", width: 1920, height: 1080, w: 600, caption: "Thehien Display, letter forms" }
      ] },
      { type: "text", heading: "Key Visual", paragraphs: [
        "The 3D elements are created to serve as key visuals appearing dominantly in various materials, evoking feelings of joy, excitement, and a touch of surrealism.",
        "Behind the use of everyday objects like broom, flip-flop, and milk can lies a message about appreciating the humbleness inherent in them, challenging stereotypes about their cheapness, dirtiness, showing that things that people often ignore can be honored and shine in their own way."
      ] },
      { type: "portrait",
        image: { src: "../assets/case-study/tuoi-hong-28/11-portrait.jpg", alt: "Key visual, 3D racket lute", width: 1920, height: 1920 },
        caption: "Key visual, 3D racket lute" },
      { type: "pair", images: [
        { src: "../assets/case-study/tuoi-hong-28/12-f2a.jpg", alt: "Ticket design, blank personalization space", width: 1333, height: 2000, w: 600, caption: "Ticket design, blank personalization space" },
        { src: "../assets/case-study/tuoi-hong-28/13-f2b.jpg", alt: "Alphabet stickers", width: 1920, height: 1172, w: 910, caption: "Alphabet stickers" }
      ] },
      { type: "text", heading: "Typography", paragraphs: [
        "In a world where everything shines with music, letters are no exception. Thehien Display, an experimental typeface designed specifically for Tuoi Hong, draws inspiration from musical notes.",
        "While Thehien Display is an experimental type that is not designed to be read, in applications requiring clarity, readability is ensured by pairing it with the secondary typeface, Bricolage Grotesque by Mathieu Triay."
      ] },
      { type: "text-image", imageSide: "right",
        image: { src: "../assets/case-study/tuoi-hong-28/14-image-text.jpg", alt: "Tuoi Hong 28 merchandise", width: 1920, height: 1281 },
        text: [
          { t: "p", text: "In a branding identity built on individualism, even merchandise items are carefully considered to align with this philosophy.", w: 290 },
          { t: "p", text: "Instead of just producing regular paper tickets, we have opted to design tickets with blank space, allowing owners to personalize it according to their own name and style.", w: 290 }
        ] },
      { type: "text-image", imageSide: "left", imageWidth: 1220, textWidth: 600, align: "center",
        image: { src: "../assets/case-study/tuoi-hong-28/15-image-text.jpg", alt: "Ending, live stage performance", width: 1920, height: 1405, caption: "Ending, live stage performance" },
        text: [
          { t: "p", text: "Alphabet stickers, cardholders, and lanyards, are also sold as a combo to create a cohesive system.", w: 600 },
          { t: "p", text: "This enables ticket owners to customize their tickets and wear them around their necks for showing off in the event.", w: 600 }
        ] }
    ],
    credits: {
      label: "Credits",
      lines: [
        "Creative Director: Nam Bao",
        "Design Manager: Phat Nghiem, Khang Phan",
        "Designer: Ngoc Han, Tue Minh, Minh Hoang, Thanh Mai, Gia Hoa, Bao Thy",
        "Motion Designer: Minh Khoi, Khang Phan",
        "Photographer: Phat Nghiem, Thien An, Nhu An, Duc Thanh, Hong Han",
        "Type Designer: Nam Bao"
      ]
    },
    next: [
      { title: "Vore", tag: "", href: "/work", cover: { src: "../assets/work/vore.jpg", alt: "Vore cover", width: 1600, height: 900 } }
    ]
  }
};
