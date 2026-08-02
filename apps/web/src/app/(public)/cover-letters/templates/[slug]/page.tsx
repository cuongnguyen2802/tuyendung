'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRightIcon, ChevronLeftIcon, CheckIcon, ArrowRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Variant { id: string; label: string; accent: string; bg: string }

interface TemplateData {
  title: string
  category: string
  desc: string
  tips: string[]
  sample: { name: string; role: string; company: string; hiring: string; date: string }
}

// ── Template registry ──────────────────────────────────────────────────────────

const TEMPLATE_VARIANTS: Record<string, Variant[]> = {
  classic: [
    { id: 'cl1', label: 'Charcoal',     accent: '#374151', bg: '#ffffff' },
    { id: 'cl2', label: 'Navy',         accent: '#1e3a5f', bg: '#ffffff' },
    { id: 'cl3', label: 'Forest',       accent: '#14532d', bg: '#ffffff' },
    { id: 'cl4', label: 'Burgundy',     accent: '#7f1d1d', bg: '#ffffff' },
    { id: 'cl5', label: 'Warm White',   accent: '#374151', bg: '#fefce8' },
    { id: 'cl6', label: 'Cool Gray',    accent: '#1e3a5f', bg: '#f0f4f8' },
  ],
  modern: [
    { id: 'md1', label: 'Brand Green',  accent: '#2E7D32', bg: '#ffffff' },
    { id: 'md2', label: 'Ocean Blue',   accent: '#1d4ed8', bg: '#ffffff' },
    { id: 'md3', label: 'Violet',       accent: '#6d28d9', bg: '#ffffff' },
    { id: 'md4', label: 'Teal',         accent: '#0f766e', bg: '#ffffff' },
    { id: 'md5', label: 'Rose',         accent: '#be123c', bg: '#ffffff' },
    { id: 'md6', label: 'Slate',        accent: '#334155', bg: '#f8fafc' },
  ],
  minimal: [
    { id: 'mn1', label: 'Black',        accent: '#111827', bg: '#ffffff' },
    { id: 'mn2', label: 'Navy',         accent: '#1e3a5f', bg: '#ffffff' },
    { id: 'mn3', label: 'Brand',        accent: '#2E7D32', bg: '#ffffff' },
    { id: 'mn4', label: 'Indigo',       accent: '#4338ca', bg: '#ffffff' },
    { id: 'mn5', label: 'Stone',        accent: '#57534e', bg: '#fafaf9' },
    { id: 'mn6', label: 'Slate',        accent: '#475569', bg: '#f8fafc' },
  ],
  academic: [
    { id: 'ac1', label: 'Oxford Navy',  accent: '#1e3a5f', bg: '#ffffff' },
    { id: 'ac2', label: 'Harvard',      accent: '#7f1d1d', bg: '#ffffff' },
    { id: 'ac3', label: 'Forest',       accent: '#14532d', bg: '#fffde7' },
    { id: 'ac4', label: 'Royal',        accent: '#1d4ed8', bg: '#ffffff' },
    { id: 'ac5', label: 'Ink',          accent: '#111827', bg: '#fafafa' },
    { id: 'ac6', label: 'Mahogany',     accent: '#78350f', bg: '#fffbeb' },
  ],
  tech: [
    { id: 'tc1', label: 'Terminal',     accent: '#22d3ee', bg: '#0d1117' },
    { id: 'tc2', label: 'Emerald',      accent: '#4ade80', bg: '#052e16' },
    { id: 'tc3', label: 'Violet',       accent: '#a78bfa', bg: '#1e1b4b' },
    { id: 'tc4', label: 'Slate Light',  accent: '#1e293b', bg: '#ffffff' },
    { id: 'tc5', label: 'Ocean',        accent: '#0284c7', bg: '#f0f9ff' },
    { id: 'tc6', label: 'Indigo',       accent: '#4338ca', bg: '#eef2ff' },
  ],
  sales: [
    { id: 'sl1', label: 'Orange',       accent: '#c2410c', bg: '#ffffff' },
    { id: 'sl2', label: 'Crimson',      accent: '#991b1b', bg: '#ffffff' },
    { id: 'sl3', label: 'Brand Green',  accent: '#2E7D32', bg: '#ffffff' },
    { id: 'sl4', label: 'Navy Bold',    accent: '#1e2d4d', bg: '#ffffff' },
    { id: 'sl5', label: 'Gold',         accent: '#78350f', bg: '#fffbeb' },
    { id: 'sl6', label: 'Violet',       accent: '#4c1d95', bg: '#ffffff' },
  ],
}

const TEMPLATES: Record<string, TemplateData> = {
  classic: {
    title: 'Thư xin việc Cổ điển',
    category: 'Thư xin việc theo phong cách',
    desc: 'Định dạng thư xin việc truyền thống với cấu trúc chuẩn mực, lịch sự và chuyên nghiệp. Phù hợp với mọi ngành nghề và mọi cấp độ kinh nghiệm.',
    tips: ['Giữ thư trong 1 trang A4', 'Gọi tên người nhận cụ thể nếu biết', 'Kết thúc với lời kêu gọi hành động rõ ràng'],
    sample: { name: 'Nguyễn Văn An', role: 'Vị trí Chuyên viên Marketing', company: 'Công ty ABC', hiring: 'Ban Tuyển dụng', date: '01/08/2026' },
  },
  modern: {
    title: 'Thư xin việc Hiện đại',
    category: 'Thư xin việc theo phong cách',
    desc: 'Thiết kế hiện đại với điểm nhấn màu sắc nổi bật và bố cục cân đối. Phù hợp với môi trường năng động, sáng tạo.',
    tips: ['Dùng màu accent phù hợp với ngành', 'Mở đầu ấn tượng trong câu đầu tiên', 'Tránh sao chép lại CV — nêu thêm câu chuyện cá nhân'],
    sample: { name: 'Lê Thị Bình', role: 'Vị trí Marketing Manager', company: 'FPT Telecom', hiring: 'Phòng Nhân sự', date: '01/08/2026' },
  },
  minimal: {
    title: 'Thư xin việc Tối giản',
    category: 'Thư xin việc theo phong cách',
    desc: 'Thiết kế tối giản, tập trung vào nội dung. Ít yếu tố trang trí, nhiều khoảng trắng — phù hợp với các vị trí đòi hỏi sự chính xác và rõ ràng.',
    tips: ['Mỗi đoạn chỉ 2-4 câu', 'Dùng số liệu cụ thể để thuyết phục', 'Không dùng mẫu câu sáo rỗng'],
    sample: { name: 'Trần Minh Đức', role: 'Vị trí Product Manager', company: 'Tiki Corporation', hiring: 'HR Team', date: '01/08/2026' },
  },
  academic: {
    title: 'Thư xin việc Học thuật',
    category: 'Thư xin việc theo phong cách',
    desc: 'Định dạng chuẩn học thuật với font serif trang nhã. Dành cho vị trí nghiên cứu, giảng dạy, hoặc môi trường đòi hỏi sự chính trực và nghiêm túc.',
    tips: ['Trích dẫn nghiên cứu hoặc thành tích học thuật cụ thể', 'Sử dụng ngôn ngữ trang trọng', 'Đề cập đến sự phù hợp với tầm nhìn tổ chức'],
    sample: { name: 'PGS.TS Phạm Thị Lan', role: 'Vị trí Giảng viên Kinh tế', company: 'Đại học Kinh tế Quốc dân', hiring: 'Hội đồng Tuyển dụng', date: '01/08/2026' },
  },
  tech: {
    title: 'Thư xin việc IT',
    category: 'Thư xin việc theo phong cách',
    desc: 'Thiết kế dành riêng cho lập trình viên và kỹ sư phần mềm. Có thể chọn phong cách tối (terminal) hoặc sáng hiện đại.',
    tips: ['Đề cập tech stack cụ thể liên quan đến JD', 'Link đến GitHub/portfolio nổi bật', 'Nêu một vấn đề kỹ thuật bạn từng giải quyết'],
    sample: { name: 'Nguyễn Chiến Thắng', role: 'Vị trí Senior Backend Engineer', company: 'VNG Corporation', hiring: 'Engineering Team', date: '01/08/2026' },
  },
  sales: {
    title: 'Thư xin việc Kinh doanh',
    category: 'Thư xin việc theo phong cách',
    desc: 'Thư xin việc mạnh mẽ, số liệu hóa thành tích bán hàng. Mở đầu với một KPI ấn tượng — thu hút nhà tuyển dụng ngay từ dòng đầu.',
    tips: ['Mở đầu ngay bằng con số doanh số ấn tượng', 'Nêu phương pháp bán hàng cụ thể bạn áp dụng', 'Thể hiện khả năng xây dựng mối quan hệ khách hàng lâu dài'],
    sample: { name: 'Vũ Hoàng Minh', role: 'Vị trí Sales Manager', company: 'Vinamilk Corporation', hiring: 'Bộ phận Kinh doanh', date: '01/08/2026' },
  },
}

// ── Letter Preview Components ──────────────────────────────────────────────────

const LOREM_LINES = [
  'Tôi viết thư này để bày tỏ sự quan tâm đến vị trí đang được quý công ty tuyển dụng,',
  'cùng mong muốn được đóng góp vào sự phát triển chung của tổ chức.',
  '',
  'Với hơn 5 năm kinh nghiệm trong lĩnh vực liên quan, tôi đã đạt được nhiều thành tích',
  'đáng ghi nhận và tin tưởng rằng bản thân có thể mang lại giá trị thiết thực cho công ty.',
  '',
  'Tôi hiểu rằng quý công ty đang tìm kiếm một ứng viên có khả năng làm việc độc lập',
  'cũng như phối hợp hiệu quả trong môi trường nhóm. Trong suốt sự nghiệp của mình,',
  'tôi đã thể hiện cả hai phẩm chất này qua nhiều dự án thực tế.',
  '',
  'Tôi rất mong có cơ hội trao đổi trực tiếp về vị trí này và cách tôi có thể đóng góp',
  'cho tổ chức của quý vị. Xin chân thành cảm ơn.',
]

function lines(widths: number[], h = 2.5, color = '#e5e7eb') {
  return widths.map((w, i) => (
    <div key={i} style={{ height: h, background: color, marginBottom: 3.5, borderRadius: 1.5, width: `${w}%` }} />
  ))
}

// Classic letter
function ClassicLetter({ v, data }: { v: Variant; data: TemplateData }) {
  const s = data.sample
  const dark = v.bg !== '#ffffff' && v.bg !== '#fefce8' && v.bg !== '#f0f4f8'
  const textColor = dark ? '#1f2937' : '#1f2937'
  const mutedColor = '#6b7280'
  return (
    <div style={{ height: '100%', background: v.bg, fontFamily: 'Georgia, serif', padding: '48px 52px', overflowY: 'hidden' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: textColor, fontWeight: 700, marginBottom: 2 }}>{s.name}</div>
        {lines([50, 40], 2, v.accent + '60')}
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 9, color: mutedColor, marginBottom: 2 }}>{s.date}</div>
        <div style={{ fontSize: 9, color: textColor, marginBottom: 1 }}>{s.hiring}</div>
        <div style={{ fontSize: 9, color: textColor }}>{s.company}</div>
      </div>
      <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: `1px solid ${v.accent}40` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: v.accent }}>V/v: {s.role}</div>
      </div>
      <div style={{ fontSize: 9, color: textColor, marginBottom: 12 }}>Kính gửi {s.hiring},</div>
      {LOREM_LINES.map((line, i) =>
        line === '' ? <div key={i} style={{ height: 8 }} /> :
        <div key={i} style={{ fontSize: 8.5, color: mutedColor, lineHeight: 1.65, marginBottom: 1.5 }}>{line}</div>
      )}
      <div style={{ marginTop: 28 }}>
        <div style={{ fontSize: 8.5, color: textColor, marginBottom: 16 }}>Trân trọng,</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: v.accent }}>{s.name}</div>
      </div>
    </div>
  )
}

// Modern letter (left accent bar)
function ModernLetter({ v, data }: { v: Variant; data: TemplateData }) {
  const s = data.sample
  return (
    <div style={{ display: 'flex', height: '100%', background: v.bg, fontFamily: 'system-ui, sans-serif', overflowY: 'hidden' }}>
      <div style={{ width: 8, background: v.accent, flexShrink: 0 }} />
      <div style={{ flex: 1, padding: '40px 44px' }}>
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `1px solid ${v.accent}30` }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: v.accent, letterSpacing: -0.5, marginBottom: 4 }}>{s.name}</div>
          {lines([45, 35], 2.5, v.accent + '35')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 8.5, color: '#374151', fontWeight: 600 }}>{s.hiring}</div>
            <div style={{ fontSize: 8.5, color: '#9ca3af' }}>{s.company}</div>
          </div>
          <div style={{ fontSize: 8.5, color: '#9ca3af' }}>{s.date}</div>
        </div>
        <div style={{ fontSize: 11, fontWeight: 800, color: v.accent, marginBottom: 18, letterSpacing: -0.25 }}>{s.role}</div>
        <div style={{ fontSize: 9, color: '#374151', marginBottom: 12 }}>Kính gửi {s.hiring},</div>
        {LOREM_LINES.map((line, i) =>
          line === '' ? <div key={i} style={{ height: 7 }} /> :
          <div key={i} style={{ fontSize: 8.5, color: '#6b7280', lineHeight: 1.65, marginBottom: 1.5 }}>{line}</div>
        )}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 8.5, color: '#374151', marginBottom: 10 }}>Trân trọng,</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: v.accent }}>{s.name}</div>
          </div>
          <div style={{ width: 60, height: 2, background: v.accent, opacity: 0.4, borderRadius: 1 }} />
        </div>
      </div>
    </div>
  )
}

// Minimal letter
function MinimalLetter({ v, data }: { v: Variant; data: TemplateData }) {
  const s = data.sample
  return (
    <div style={{ height: '100%', background: v.bg, fontFamily: 'system-ui, sans-serif', padding: '52px 60px', overflowY: 'hidden' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: v.accent, letterSpacing: -0.5, marginBottom: 2 }}>{s.name}</div>
        {lines([40, 32], 1.5, v.accent + '40')}
      </div>
      <div style={{ marginBottom: 32, display: 'flex', gap: 40 }}>
        <div>
          <div style={{ fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>GỬI ĐẾN</div>
          <div style={{ fontSize: 9, color: '#374151' }}>{s.hiring}</div>
          <div style={{ fontSize: 9, color: '#374151' }}>{s.company}</div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>NGÀY</div>
          <div style={{ fontSize: 9, color: '#374151' }}>{s.date}</div>
        </div>
      </div>
      <div style={{ width: 40, height: 2, background: v.accent, marginBottom: 24, borderRadius: 1 }} />
      <div style={{ fontSize: 9, color: '#374151', marginBottom: 16 }}>Kính gửi {s.hiring},</div>
      {LOREM_LINES.map((line, i) =>
        line === '' ? <div key={i} style={{ height: 8 }} /> :
        <div key={i} style={{ fontSize: 8.5, color: '#6b7280', lineHeight: 1.7, marginBottom: 1.5 }}>{line}</div>
      )}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 8.5, color: '#374151', marginBottom: 14 }}>Trân trọng,</div>
        <div style={{ width: 48, height: 1.5, background: v.accent, marginBottom: 8, borderRadius: 1 }} />
        <div style={{ fontSize: 9, fontWeight: 600, color: '#111827' }}>{s.name}</div>
      </div>
    </div>
  )
}

// Academic letter (serif, formal)
function AcademicLetter({ v, data }: { v: Variant; data: TemplateData }) {
  const s = data.sample
  return (
    <div style={{ height: '100%', background: v.bg, fontFamily: 'Georgia, "Times New Roman", serif', padding: '44px 52px', overflowY: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 24, paddingBottom: 20, borderBottom: `2px solid ${v.accent}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: v.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{s.name}</div>
        {lines([50, 40], 2, v.accent + '40')}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 9, color: '#374151' }}>{s.hiring}</div>
          <div style={{ fontSize: 9, color: '#374151' }}>{s.company}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: '#374151' }}>{s.date}</div>
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: v.accent, fontStyle: 'italic', marginBottom: 2 }}>Kính gửi: {s.role}</div>
        <div style={{ height: 1, background: v.accent, opacity: 0.3 }} />
      </div>
      {LOREM_LINES.map((line, i) =>
        line === '' ? <div key={i} style={{ height: 8 }} /> :
        <div key={i} style={{ fontSize: 8.5, color: '#374151', lineHeight: 1.7, marginBottom: 1.5, textIndent: i === 0 || LOREM_LINES[i - 1] === '' ? 20 : 0 }}>{line}</div>
      )}
      <div style={{ marginTop: 28, textAlign: 'right' }}>
        <div style={{ fontSize: 8.5, color: '#374151', fontStyle: 'italic', marginBottom: 14 }}>Kính trân trọng,</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: v.accent }}>{s.name}</div>
      </div>
    </div>
  )
}

// Tech letter (dark/light dual)
function TechLetter({ v, data }: { v: Variant; data: TemplateData }) {
  const s = data.sample
  const isDark = v.bg.startsWith('#0') || v.bg.startsWith('#1')
  const textColor = isDark ? '#e2e8f0' : '#1f2937'
  const mutedColor = isDark ? '#94a3b8' : '#6b7280'
  const borderColor = isDark ? `${v.accent}30` : '#e5e7eb'
  return (
    <div style={{ height: '100%', background: v.bg, fontFamily: '"SF Mono", monospace, system-ui', padding: '38px 44px', overflowY: 'hidden' }}>
      <div style={{ marginBottom: 20, padding: '10px 14px', border: `1px solid ${v.accent}30`, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.04)' : `${v.accent}08` }}>
        <div style={{ fontSize: 7, color: v.accent, marginBottom: 6, letterSpacing: 1.5 }}>// COVER LETTER</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: textColor, marginBottom: 2 }}>{s.name}</div>
        {lines([42, 34], 2, v.accent + '40')}
      </div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: 8.5 }}>
        <div>
          <div style={{ color: v.accent, marginBottom: 1 }}>// TO</div>
          <div style={{ color: textColor }}>{s.hiring}</div>
          <div style={{ color: mutedColor }}>{s.company}</div>
        </div>
        <div>
          <div style={{ color: v.accent, marginBottom: 1 }}>// DATE</div>
          <div style={{ color: textColor }}>{s.date}</div>
        </div>
      </div>
      <div style={{ marginBottom: 16, padding: '6px 10px', background: `${v.accent}15`, borderRadius: 4, border: `1px solid ${v.accent}30` }}>
        <span style={{ fontSize: 9, color: v.accent, fontWeight: 700 }}>RE: {s.role}</span>
      </div>
      <div style={{ fontSize: 9, color: textColor, marginBottom: 12 }}>Kính gửi {s.hiring},</div>
      {LOREM_LINES.map((line, i) =>
        line === '' ? <div key={i} style={{ height: 7 }} /> :
        <div key={i} style={{ fontSize: 8.5, color: mutedColor, lineHeight: 1.65, marginBottom: 1.5 }}>{line}</div>
      )}
      <div style={{ marginTop: 24, paddingTop: 14, borderTop: `1px solid ${borderColor}` }}>
        <div style={{ fontSize: 8.5, color: mutedColor, marginBottom: 8 }}>Trân trọng,</div>
        <div style={{ fontSize: 9, fontWeight: 700, color: v.accent }}>{s.name}</div>
      </div>
    </div>
  )
}

// Sales letter (bold, KPI-first)
function SalesLetter({ v, data }: { v: Variant; data: TemplateData }) {
  const s = data.sample
  return (
    <div style={{ height: '100%', background: v.bg, fontFamily: 'system-ui, sans-serif', overflowY: 'hidden' }}>
      <div style={{ background: v.accent, padding: '24px 44px 20px' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: -0.5, marginBottom: 4 }}>{s.name}</div>
        {lines([40, 32], 2, 'rgba(255,255,255,0.35)')}
        <div style={{ marginTop: 10, display: 'flex', gap: 14 }}>
          {lines([30, 28, 25], 2, 'rgba(255,255,255,0.25)')}
        </div>
      </div>
      <div style={{ padding: '28px 44px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 8.5 }}>
          <div>
            <div style={{ fontWeight: 600, color: '#374151' }}>{s.hiring}</div>
            <div style={{ color: '#9ca3af' }}>{s.company}</div>
          </div>
          <div style={{ color: '#9ca3af' }}>{s.date}</div>
        </div>
        <div style={{ marginBottom: 18, padding: '10px 14px', background: `${v.accent}10`, borderLeft: `4px solid ${v.accent}`, borderRadius: '0 6px 6px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: v.accent }}>{s.role}</div>
        </div>
        <div style={{ fontSize: 9, color: '#374151', marginBottom: 12 }}>Kính gửi {s.hiring},</div>
        {LOREM_LINES.map((line, i) =>
          line === '' ? <div key={i} style={{ height: 7 }} /> :
          <div key={i} style={{ fontSize: 8.5, color: '#6b7280', lineHeight: 1.65, marginBottom: 1.5 }}>{line}</div>
        )}
        <div style={{ marginTop: 24, borderTop: `2px solid ${v.accent}`, paddingTop: 14 }}>
          <div style={{ fontSize: 8.5, color: '#374151', marginBottom: 8 }}>Trân trọng,</div>
          <div style={{ fontSize: 10, fontWeight: 800, color: v.accent }}>{s.name}</div>
        </div>
      </div>
    </div>
  )
}

// ── Render dispatcher ─────────────────────────────────────────────────────────

function renderLetter(slug: string, v: Variant, data: TemplateData) {
  switch (slug) {
    case 'modern':   return <ModernLetter v={v} data={data} />
    case 'minimal':  return <MinimalLetter v={v} data={data} />
    case 'academic': return <AcademicLetter v={v} data={data} />
    case 'tech':     return <TechLetter v={v} data={data} />
    case 'sales':    return <SalesLetter v={v} data={data} />
    default:         return <ClassicLetter v={v} data={data} />
  }
}

// ── Responsive A4 preview ─────────────────────────────────────────────────────

function LetterPreview({ slug, variant, data }: { slug: string; variant: Variant; data: TemplateData }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.75)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setScale(el.offsetWidth / 794)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const W = 794, H = 1123
  return (
    <div ref={containerRef} style={{ width: '100%', height: Math.round(H * scale), position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {renderLetter(slug, variant, data)}
      </div>
    </div>
  )
}

function ThumbLetter({ slug, variant, data, selected, onClick }: { slug: string; variant: Variant; data: TemplateData; selected: boolean; onClick: () => void }) {
  const W = 794, H = 1123, SCALE = 0.1
  return (
    <button onClick={onClick}
      className={cn('relative shrink-0 overflow-hidden rounded border-2 transition', selected ? 'border-brand shadow-md shadow-brand/20' : 'border-gray-200 hover:border-gray-300')}
      style={{ width: W * SCALE + 4, height: H * SCALE + 4, padding: 2 }}>
      <div style={{ width: W * SCALE, height: H * SCALE, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
          {renderLetter(slug, variant, data)}
        </div>
      </div>
      {selected && (
        <div className="absolute bottom-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand">
          <CheckIcon className="h-2.5 w-2.5 text-white" />
        </div>
      )}
    </button>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CoverLetterTemplateDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ''
  const data = TEMPLATES[slug]
  if (!data) return notFound()

  const variants = TEMPLATE_VARIANTS[slug] ?? TEMPLATE_VARIANTS.classic

  const [selectedId, setSelectedId] = useState(variants[0].id)
  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const stripRef = useRef<HTMLDivElement>(null)
  const selectedVariant = variants.find(v => v.id === selectedId) ?? variants[0]

  function scrollStrip(dir: -1 | 1) {
    if (stripRef.current) stripRef.current.scrollLeft += dir * 200
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto flex max-w-[1200px] gap-8 px-4 py-8 lg:flex-row flex-col">

        {/* LEFT: preview + carousel */}
        <div className="flex-1 lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
            <LetterPreview slug={slug} variant={selectedVariant} data={data} />
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">{variants.length} màu sắc cho {data.title}</span>
              <div className="flex gap-1">
                {[-1, 1].map((d) => (
                  <button key={d} onClick={() => scrollStrip(d as -1 | 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                    {d === -1 ? <ChevronLeftIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
            <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {variants.map((v) => (
                <ThumbLetter key={v.id} slug={slug} variant={v} data={data} selected={v.id === selectedId} onClick={() => setSelectedId(v.id)} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: controls */}
        <div className="w-full lg:w-[380px] shrink-0">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-brand transition">Trang chủ</Link>
            <ChevronRightIcon className="h-3 w-3" />
            <Link href="/cover-letters/templates" className="hover:text-brand transition">{data.category}</Link>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="text-gray-600 truncate">{data.title}</span>
          </nav>

          <h1 className="mb-4 text-2xl font-bold text-gray-900">{data.title}</h1>

          <div className="mb-4 flex gap-2">
            {(['vi', 'en'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={cn('rounded-full border px-5 py-1.5 text-sm font-semibold transition', lang === l ? 'border-brand text-brand' : 'border-gray-300 text-gray-600 hover:border-gray-400')}>
                {l === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}
              </button>
            ))}
          </div>

          <p className="mb-5 text-sm leading-relaxed text-gray-600">{data.desc}</p>

          {/* Color picker */}
          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Màu sắc</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button key={v.id} title={v.label} onClick={() => setSelectedId(v.id)}
                  className={cn('h-8 w-8 rounded-full border-2 transition flex items-center justify-center', v.id === selectedId ? 'border-gray-400 scale-110' : 'border-transparent hover:border-gray-300')}
                  style={{ background: v.accent }}>
                  {v.id === selectedId && <CheckIcon className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">Đang chọn: {selectedVariant.label}</p>
          </div>

          {/* Tips */}
          <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="mb-2 text-xs font-bold text-amber-700">Mẹo viết thư hiệu quả</p>
            <ul className="space-y-1.5">
              {data.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-amber-700/80">
                  <span className="shrink-0 font-bold">•</span>{tip}
                </li>
              ))}
            </ul>
          </div>

          <Link href={`/cover-letters?template=${slug}&variant=${selectedId}&lang=${lang}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90">
            Tạo thư xin việc <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-center text-xs text-gray-400">Miễn phí · Không cần tài khoản · Xuất PDF ngay</p>
        </div>
      </div>
    </div>
  )
}
