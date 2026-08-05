/**
 * seed-articles.ts — add blog articles to the database
 * Run: $env:DATABASE_URL="..."; npx tsx src/seed-articles.ts
 */
import { PrismaClient, ArticleStatus } from './generated/client'

const prisma = new PrismaClient()

const ARTICLES = [
  {
    categorySlug: 'bi-kip-tim-viec',
    title: 'Hướng dẫn viết CV xin việc từ A đến Z (2025)',
    slug: 'huong-dan-viet-cv',
    excerpt:
      'Nhà tuyển dụng trung bình chỉ dành 7 giây để nhìn qua một CV. Hướng dẫn đầy đủ giúp bạn tạo CV chuyên nghiệp, vượt ATS và gây ấn tượng ngay từ cái nhìn đầu tiên.',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80&fit=crop',
    views: 12840,
    content: `## CV là gì và tại sao nó quan trọng?

CV (Curriculum Vitae) là tài liệu tóm tắt toàn bộ quá trình học vấn, kinh nghiệm làm việc và kỹ năng của bạn. Đây là ấn tượng đầu tiên — và đôi khi là duy nhất — mà bạn tạo ra với nhà tuyển dụng.

**Tại sao CV lại quan trọng đến vậy?**

- Nhà tuyển dụng trung bình chỉ dành **7 giây** để nhìn qua một CV lần đầu
- Hơn **75% CV** bị loại trước khi đến tay HR do hệ thống ATS (Applicant Tracking System) lọc tự động
- CV được cá nhân hóa theo từng vị trí có tỷ lệ được gọi phỏng vấn cao hơn **40%**

---

## Cấu trúc CV chuẩn năm 2025

Một CV hiệu quả cần có các phần chính theo thứ tự sau:

### 1. Thông tin cá nhân
Họ tên đầy đủ, số điện thoại, email chuyên nghiệp, địa chỉ (thành phố là đủ), LinkedIn và/hoặc GitHub.

> ⚠️ **Lưu ý:** Không cần ghi ngày sinh, CMND, tôn giáo hay tình trạng hôn nhân vào CV hiện đại.

### 2. Mục tiêu nghề nghiệp (Professional Summary)
2–3 câu ngắn gọn, súc tích thể hiện **bạn là ai, bạn có gì và bạn muốn đóng góp gì** cho vị trí ứng tuyển.

**Ví dụ tốt:**
> "Frontend Developer với 4 năm kinh nghiệm xây dựng ứng dụng React hiệu suất cao. Thành thạo TypeScript, Next.js và tối ưu Core Web Vitals. Mong muốn đóng góp vào sản phẩm SaaS quy mô lớn tại môi trường Agile."

### 3. Kinh nghiệm làm việc
Liệt kê theo **thứ tự ngược** (vị trí gần nhất lên đầu). Mỗi vị trí ghi rõ:
- Tên công ty, chức danh
- Thời gian làm việc (tháng/năm)
- 3–5 bullet points thể hiện đóng góp và kết quả đo được

### 4. Học vấn
Trường học, bằng cấp, chuyên ngành, năm tốt nghiệp, GPA (nếu ≥ 3.2/4.0).

### 5. Kỹ năng
Chia thành kỹ năng cứng (kỹ thuật, công cụ) và kỹ năng mềm. Chỉ liệt kê những kỹ năng **thực sự thành thạo**.

### 6. Chứng chỉ và thành tích
Bằng chứng nhận, dự án nổi bật, giải thưởng, đóng góp open source.

---

## Cách viết phần Kinh nghiệm làm việc hiệu quả

Phần kinh nghiệm là **quan trọng nhất** trong CV. Dùng công thức **CAR** để mô tả từng bullet:

- **C**hallenge — Bối cảnh/thách thức bạn đối mặt
- **A**ction — Hành động cụ thể bạn đã làm
- **R**esult — Kết quả đo lường được

### So sánh thực tế

❌ **Không nên viết:**
> "Phụ trách marketing cho sản phẩm."

✅ **Nên viết:**
> "Triển khai chiến dịch email marketing cho 50.000 khách hàng, tăng tỷ lệ mở email 35% và doanh số quý Q3/2024 tăng 18%."

### Nguyên tắc viết bullet point:
- Bắt đầu bằng **động từ hành động mạnh**: Xây dựng, Tăng, Giảm, Triển khai, Quản lý, Tối ưu
- Luôn kèm **số liệu cụ thể** (%, VNĐ, số lượng)
- Tập trung vào **kết quả**, không chỉ mô tả nhiệm vụ

---

## Thiết kế và trình bày CV

Thiết kế **đơn giản và dễ đọc** luôn tốt hơn thiết kế phức tạp. ATS thường không đọc được bảng biểu hay đồ họa phức tạp.

| Yếu tố | Khuyến nghị |
|---|---|
| Font chữ | Arial, Calibri, cỡ 10–12pt |
| Lề trang | 2–2.5 cm |
| Độ dài | 1 trang (< 5 năm KN), 2 trang (senior) |
| Màu sắc | 1–2 màu, tránh màu neon |
| File | Lưu PDF để giữ định dạng |

---

## Tối ưu CV cho hệ thống ATS

ATS là phần mềm lọc CV tự động. Hơn 98% công ty lớn sử dụng ATS. Để không bị loại sớm:

1. **Dùng từ khóa từ JD** — Copy những kỹ năng và yêu cầu quan trọng từ Job Description vào CV
2. **Tên section rõ ràng** — Ghi "Kinh nghiệm làm việc" không phải "Hành trình của tôi"
3. **Không dùng text box hay header/footer** — ATS thường bỏ qua
4. **Tránh nhúng hình ảnh có text** — ATS không đọc được
5. **Lưu file .pdf hoặc .docx** — Không dùng file scan

---

## 6 lỗi thường gặp cần tránh

1. **Ảnh chụp kém chất lượng** — Dùng ảnh thẻ 3×4 hoặc ảnh công sở chuyên nghiệp
2. **Sai chính tả, lỗi ngữ pháp** — Dùng Grammarly hoặc nhờ người đọc lại trước khi gửi
3. **Email thiếu chuyên nghiệp** — Tránh \`cungbeme2000@gmail.com\`, dùng \`ten.ho@gmail.com\`
4. **Khai thông tin không trung thực** — Rủi ro bị loại khi xác minh, ảnh hưởng uy tín
5. **Copy CV chung chung cho mọi công ty** — Mỗi vị trí nên có CV được tùy chỉnh riêng
6. **Liệt kê quá nhiều kỹ năng không liên quan** — Chỉ giữ những gì thật sự phù hợp với JD

---

## Checklist CV hoàn chỉnh trước khi nộp

- [ ] Không lỗi chính tả, ngữ pháp
- [ ] Định dạng nhất quán (font, cỡ chữ, bullet)
- [ ] Email và số điện thoại chính xác
- [ ] Mỗi bullet point có động từ + số liệu
- [ ] Tùy chỉnh mục tiêu theo JD cụ thể
- [ ] Đã tối ưu từ khóa ATS
- [ ] File lưu dạng PDF, đặt tên \`HoTen_CV.pdf\`
- [ ] Nhờ người khác đọc lại lần cuối

---

## Công cụ hỗ trợ tạo CV

- **[TuyenDung.vn CV Builder](/resumes/builder)** — Tạo CV chuyên nghiệp với hàng chục mẫu miễn phí
- **Canva** — Thiết kế CV đẹp (lưu ý: một số mẫu không ATS-friendly)
- **Grammarly** — Kiểm tra lỗi ngữ pháp tiếng Anh
- **Jobscan.co** — Phân tích CV vs JD để tối ưu ATS score

---

*Bài viết được cập nhật tháng 8/2025 bởi đội ngũ TuyenDung.vn.*
`,
  },
  {
    categorySlug: 'bi-kip-tim-viec',
    title: '5 mẫu thư xin việc (cover letter) ấn tượng theo ngành nghề',
    slug: 'mau-thu-xin-viec-cover-letter-theo-nganh',
    excerpt:
      'Cover letter tốt có thể giúp bạn nổi bật khi CV gần như tương đương đối thủ. 5 mẫu thư xin việc thực tế cho IT, Marketing, Finance, Sales và HR.',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80&fit=crop',
    views: 5320,
    content: `## Cover letter là gì và có cần thiết không?

Cover letter (thư xin việc) là văn bản đi kèm CV, giải thích **tại sao bạn là ứng viên phù hợp nhất** cho vị trí đó. Không phải mọi nhà tuyển dụng đều đọc, nhưng khi cần tiebreaker giữa hai ứng viên ngang nhau, cover letter thường là yếu tố quyết định.

**Nên viết cover letter khi:**
- JD yêu cầu nộp kèm
- Bạn ứng tuyển công ty mơ ước
- Bạn có gap trong CV cần giải thích
- Bạn chuyển ngành và cần kể câu chuyện

---

## Cấu trúc cover letter chuẩn (3–4 đoạn)

### Đoạn 1 — Mở đầu (Hook)
Nêu vị trí ứng tuyển và lý do bạn hứng thú với công ty/vị trí này. Tránh mở đầu nhàm chán như "Tôi viết thư này để ứng tuyển vị trí...".

### Đoạn 2 — Bạn mang lại gì
Nêu 2–3 thành tích cụ thể liên quan nhất đến JD. Không kể lại CV mà **kể câu chuyện** đằng sau con số.

### Đoạn 3 — Tại sao công ty này
Thể hiện bạn đã research công ty: sản phẩm, văn hóa, giai đoạn phát triển. Nhà tuyển dụng nhận ra ngay ứng viên copy-paste.

### Đoạn 4 — Kết và CTA
Cảm ơn, đề nghị được phỏng vấn, ghi thông tin liên hệ.

---

## Mẫu 1: Cover letter cho lập trình viên (IT)

> Kính gửi Anh/Chị tuyển dụng tại [Tên công ty],
>
> Với 4 năm kinh nghiệm phát triển ứng dụng web với React và Node.js, tôi rất hứng thú với vị trí **Senior Frontend Developer** tại [Tên công ty] — đặc biệt khi biết team đang xây dựng nền tảng SaaS B2B với quy mô hàng triệu người dùng.
>
> Tại [Công ty cũ], tôi đã chủ trì refactor toàn bộ frontend từ jQuery sang React, giảm load time xuống 60% và tăng Lighthouse score từ 45 lên 92. Tôi cũng dẫn dắt đội 3 junior developer, thiết lập quy trình code review và CI/CD pipeline bằng GitHub Actions.
>
> Tôi theo dõi blog kỹ thuật của [Tên công ty] từ lâu và ấn tượng với cách team xử lý real-time data ở bài viết về WebSocket optimization. Đây chính xác là bài toán tôi muốn được đóng góp giải quyết.
>
> Rất mong được trao đổi thêm. Tôi sẵn sàng phỏng vấn bất kỳ thời điểm nào thuận tiện cho team.
>
> Trân trọng,
> [Họ tên] | [SĐT] | [Email]

---

## Mẫu 2: Cover letter cho Marketing

> Kính gửi Anh/Chị,
>
> Sau 3 năm xây dựng digital marketing từ zero cho startup fintech, tôi tin mình có thể mang lại impact tương tự cho vị trí **Marketing Manager** tại [Tên công ty].
>
> Tại [Công ty cũ], tôi đã tăng organic traffic từ 5.000 lên 85.000 lượt/tháng trong 18 tháng thông qua chiến lược content SEO kết hợp với performance marketing. CAC giảm 40% trong khi conversion rate tăng từ 1.2% lên 3.8%.
>
> [Tên công ty] đang ở giai đoạn mở rộng sang thị trường B2B — đây là lĩnh vực tôi có nhiều kinh nghiệm thực chiến với các chiến dịch ABM (Account-Based Marketing).
>
> Tôi rất mong được chia sẻ kế hoạch marketing 90 ngày đầu nếu được vào vị trí này.
>
> Trân trọng,
> [Họ tên]

---

## Lỗi thường gặp khi viết cover letter

- **Quá dài** — Giữ trong 250–350 từ, tối đa 1 trang A4
- **Copy-paste chung chung** — HR nhận ra ngay, ảnh hưởng nghiêm trọng đến ấn tượng
- **Kể lại CV** — Cover letter phải kể câu chuyện, không liệt kê lại những gì CV đã có
- **Sai tên công ty/vị trí** — Lỗi này thường xảy ra khi nộp hàng loạt
- **Không có CTA** — Luôn kết bằng lời đề nghị được phỏng vấn

*Cập nhật tháng 8/2025 — TuyenDung.vn*
`,
  },
]

async function main() {
  console.log('🌱 Seeding blog articles...\n')

  let created = 0
  let skipped = 0

  for (const art of ARTICLES) {
    // Find category
    const cat = await prisma.articleCategory.findUnique({ where: { slug: art.categorySlug } })
    if (!cat) {
      console.warn(`  ⚠ Category not found: ${art.categorySlug} — skipping "${art.title}"`)
      skipped++
      continue
    }

    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        title: art.title,
        excerpt: art.excerpt,
        content: art.content,
        imageUrl: art.imageUrl,
        status: ArticleStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      create: {
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        imageUrl: art.imageUrl,
        categoryId: cat.id,
        status: ArticleStatus.PUBLISHED,
        views: art.views,
        publishedAt: new Date(),
      },
    })

    console.log(`  ✓ [${cat.name}] ${art.title}`)
    created++
  }

  console.log(`\n✅ Done! Created/updated ${created} articles, skipped ${skipped}.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
