'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRightIcon, ChevronLeftIcon, CheckIcon, ArrowRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Variant { id: string; label: string; sidebar: string; accent: string; layout: string }
interface SampleData { name: string; role: string; degree: string; school: string; company: string; period: string }
interface PositionData { title: string; category: string; count: number; desc: string; sample: SampleData }

// ── Per-position variants ─────────────────────────────────────────────────────

const POSITION_VARIANTS: Record<string, Variant[]> = {
  developer: [
    { id: 'd1', label: 'Terminal Dark',   sidebar: '#0d1117', accent: '#22d3ee', layout: 'dev-dark' },
    { id: 'd2', label: 'Emerald Code',    sidebar: '#052e16', accent: '#4ade80', layout: 'dev-dark' },
    { id: 'd3', label: 'Violet Hacker',   sidebar: '#1e1b4b', accent: '#a78bfa', layout: 'dev-dark' },
    { id: 'd4', label: 'Ocean Split',     sidebar: '#1e3a5f', accent: '#38bdf8', layout: 'dev-split' },
    { id: 'd5', label: 'Brand Split',     sidebar: '#042616', accent: '#4ade80', layout: 'dev-split' },
    { id: 'd6', label: 'Coral Split',     sidebar: '#7c2d12', accent: '#fb923c', layout: 'dev-split' },
    { id: 'd7', label: 'Slate Minimal',   sidebar: '#1e293b', accent: '#94a3b8', layout: 'dev-minimal' },
    { id: 'd8', label: 'Ink Minimal',     sidebar: '#111827', accent: '#6366f1', layout: 'dev-minimal' },
  ],
  accountant: [
    { id: 'a1', label: 'Navy Classic',    sidebar: '#1e3a5f', accent: '#1e3a5f', layout: 'acct-formal' },
    { id: 'a2', label: 'Forest Classic',  sidebar: '#14532d', accent: '#166534', layout: 'acct-formal' },
    { id: 'a3', label: 'Burgundy',        sidebar: '#7f1d1d', accent: '#991b1b', layout: 'acct-formal' },
    { id: 'a4', label: 'Teal Modern',     sidebar: '#0f766e', accent: '#0d9488', layout: 'acct-modern' },
    { id: 'a5', label: 'Indigo Modern',   sidebar: '#3730a3', accent: '#4338ca', layout: 'acct-modern' },
    { id: 'a6', label: 'Slate Modern',    sidebar: '#334155', accent: '#475569', layout: 'acct-modern' },
    { id: 'a7', label: 'Dark Executive',  sidebar: '#111827', accent: '#374151', layout: 'acct-corporate' },
    { id: 'a8', label: 'Royal Corporate', sidebar: '#1d4ed8', accent: '#1e40af', layout: 'acct-corporate' },
  ],
  sales: [
    { id: 's1', label: 'Orange Bold',     sidebar: '#c2410c', accent: '#ea580c', layout: 'sales-bold' },
    { id: 's2', label: 'Crimson Bold',    sidebar: '#991b1b', accent: '#dc2626', layout: 'sales-bold' },
    { id: 's3', label: 'Emerald Bold',    sidebar: '#064e3b', accent: '#059669', layout: 'sales-bold' },
    { id: 's4', label: 'Navy Metrics',    sidebar: '#1e2d4d', accent: '#2563eb', layout: 'sales-metrics' },
    { id: 's5', label: 'Brand Metrics',   sidebar: '#042616', accent: '#16a34a', layout: 'sales-metrics' },
    { id: 's6', label: 'Purple Metrics',  sidebar: '#4c1d95', accent: '#7c3aed', layout: 'sales-metrics' },
    { id: 's7', label: 'Dark Executive',  sidebar: '#1e2d3d', accent: '#64748b', layout: 'sales-corporate' },
    { id: 's8', label: 'Gold Executive',  sidebar: '#78350f', accent: '#d97706', layout: 'sales-corporate' },
  ],
  marketing: [
    { id: 'm1', label: 'Rose Creative',   sidebar: '#be123c', accent: '#e11d48', layout: 'mkt-creative' },
    { id: 'm2', label: 'Violet Creative', sidebar: '#5b21b6', accent: '#7c3aed', layout: 'mkt-creative' },
    { id: 'm3', label: 'Flame Creative',  sidebar: '#c2410c', accent: '#ea580c', layout: 'mkt-creative' },
    { id: 'm4', label: 'Ocean Modern',    sidebar: '#1d4ed8', accent: '#3b82f6', layout: 'mkt-modern' },
    { id: 'm5', label: 'Pink Modern',     sidebar: '#9d174d', accent: '#ec4899', layout: 'mkt-modern' },
    { id: 'm6', label: 'Teal Modern',     sidebar: '#0f766e', accent: '#14b8a6', layout: 'mkt-modern' },
    { id: 'm7', label: 'Minimal Coral',   sidebar: '#c2410c', accent: '#9a3412', layout: 'mkt-minimal' },
    { id: 'm8', label: 'Minimal Navy',    sidebar: '#1e3a5f', accent: '#1e40af', layout: 'mkt-minimal' },
  ],
  simple: [
    { id: 'sp1', label: 'Sky Blue',       sidebar: '#0369a1', accent: '#0284c7', layout: 'sidebar' },
    { id: 'sp2', label: 'Forest Green',   sidebar: '#15803d', accent: '#16a34a', layout: 'sidebar' },
    { id: 'sp3', label: 'Brand Green',    sidebar: '#2E7D32', accent: '#1B5E20', layout: 'sidebar' },
    { id: 'sp4', label: 'Corporate Navy', sidebar: '#1e2d3d', accent: '#334155', layout: 'bold' },
    { id: 'sp5', label: 'Purple Bold',    sidebar: '#6d28d9', accent: '#5b21b6', layout: 'bold' },
    { id: 'sp6', label: 'Classic Dark',   sidebar: '#374151', accent: '#374151', layout: 'classic' },
    { id: 'sp7', label: 'Classic Navy',   sidebar: '#1e3a5f', accent: '#1e3a5f', layout: 'classic' },
    { id: 'sp8', label: 'Teal Classic',   sidebar: '#0f766e', accent: '#0f766e', layout: 'classic' },
  ],
}

const POSITIONS: Record<string, PositionData> = {
  developer: {
    title: 'Mẫu CV Lập trình viên',
    category: 'Mẫu CV theo vị trí ứng tuyển',
    count: 37,
    desc: 'Các mẫu CV Developer độc đáo, từ dark terminal đến minimal hiện đại. Làm nổi bật tech stack, dự án và kinh nghiệm kỹ thuật của bạn.',
    sample: { name: 'Lê Chiến', role: 'Senior Frontend Developer', degree: 'Công nghệ thông tin', school: 'Đại học Bách Khoa HN', company: 'Công ty TNHH MTV SVT', period: '2021 – 2024' },
  },
  marketing: {
    title: 'Mẫu CV Marketing',
    category: 'Mẫu CV theo vị trí ứng tuyển',
    count: 28,
    desc: 'Mẫu CV Marketing sáng tạo, nổi bật. Thể hiện rõ năng lực chiến lược và kết quả chiến dịch của bạn qua thiết kế độc đáo.',
    sample: { name: 'Nguyễn Lan Anh', role: 'Marketing Manager', degree: 'Quản trị kinh doanh', school: 'Đại học Kinh tế TPHCM', company: 'FPT Telecom', period: '2020 – 2024' },
  },
  accountant: {
    title: 'Mẫu CV Kế toán',
    category: 'Mẫu CV theo vị trí ứng tuyển',
    count: 24,
    desc: 'Mẫu CV Kế toán chuyên nghiệp, chính xác. Làm nổi bật kiến thức tài chính, chứng chỉ và kinh nghiệm xử lý số liệu của bạn.',
    sample: { name: 'Trần Minh Tuấn', role: 'Trưởng phòng Kế toán', degree: 'Tài chính – Kế toán', school: 'Đại học Kinh tế Quốc dân', company: 'Deloitte Vietnam', period: '2019 – 2024' },
  },
  sales: {
    title: 'Mẫu CV Kinh doanh',
    category: 'Mẫu CV theo vị trí ứng tuyển',
    count: 31,
    desc: 'Mẫu CV Sales mạnh mẽ, thu hút. Trình bày rõ thành tích doanh số, kỹ năng thuyết phục và mối quan hệ khách hàng.',
    sample: { name: 'Phạm Thị Hoa', role: 'Sales Manager', degree: 'Marketing', school: 'Đại học Thương mại HN', company: 'Vinamilk Corporation', period: '2018 – 2024' },
  },
  simple: {
    title: 'Mẫu CV Đơn giản',
    category: 'Mẫu CV theo phong cách',
    count: 42,
    desc: 'Mẫu CV đơn giản, tối giản và chuyên nghiệp. Thiết kế sạch sẽ giúp nhà tuyển dụng tập trung vào nội dung.',
    sample: { name: 'Nguyễn Văn An', role: 'Chuyên viên', degree: 'Quản trị kinh doanh', school: 'Đại học Hà Nội', company: 'Công ty ABC', period: '2020 – 2024' },
  },
}

// ── Helper ─────────────────────────────────────────────────────────────────────

const lines = (widths: number[], h = 2.5, color = '#e5e7eb') =>
  widths.map((w, i) => (
    <div key={i} style={{ height: h, background: color, marginBottom: 3.5, borderRadius: 1.5, width: `${w}%` }} />
  ))

// ── DEVELOPER: Terminal Dark ───────────────────────────────────────────────────

function DevDarkCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: '"SF Mono", "Fira Code", monospace, system-ui', background: '#0d1117' }}>
      <div style={{ width: '33%', background: v.sidebar, borderRight: `1px solid ${v.accent}25`, padding: '28px 16px', flexShrink: 0 }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: `${v.accent}18`, border: `2px solid ${v.accent}80`, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 16px ${v.accent}30` }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" fill={v.accent} opacity="0.8" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill={v.accent} opacity="0.8" />
          </svg>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 6 }}>{s.name}</div>
          <div style={{ fontSize: 8, color: v.accent, background: `${v.accent}15`, border: `1px solid ${v.accent}40`, padding: '2px 10px', borderRadius: 3, display: 'inline-block' }}>
            &lt;{s.role.split(' ').pop()} /&gt;
          </div>
        </div>
        <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${v.accent}20` }}>
          {['📧 email@example.com', '🔗 github.com/abc', '📱 0901 234 567', '📍 Hà Nội, VN'].map((l, i) => (
            <div key={i} style={{ fontSize: 7.5, color: '#94a3b8', marginBottom: 5 }}>{l}</div>
          ))}
        </div>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 8, color: v.accent, marginBottom: 8, letterSpacing: 1 }}>// TECH STACK</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {['React', 'Next.js', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'PostgreSQL', 'Redis'].map((t) => (
              <span key={t} style={{ fontSize: 7, color: v.accent, background: `${v.accent}15`, border: `1px solid ${v.accent}35`, padding: '2px 6px', borderRadius: 3 }}>{t}</span>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: v.accent, marginBottom: 10, letterSpacing: 1 }}>// PROFICIENCY</div>
          {[['React / Next.js', 95], ['TypeScript', 90], ['Node.js', 85], ['Databases', 78], ['DevOps', 70]].map(([sk, pct]) => (
            <div key={sk as string} style={{ marginBottom: 7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2.5 }}>
                <span style={{ fontSize: 7.5, color: '#94a3b8' }}>{sk}</span>
                <span style={{ fontSize: 7, color: v.accent }}>{pct}%</span>
              </div>
              <div style={{ height: 2.5, background: '#ffffff12', borderRadius: 1.5 }}>
                <div style={{ height: '100%', background: v.accent, borderRadius: 1.5, width: `${pct}%`, boxShadow: `0 0 6px ${v.accent}60` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: '28px 22px', background: '#0d1117', overflowY: 'hidden' }}>
        <div style={{ marginBottom: 18, padding: '10px 12px', background: `${v.accent}0d`, border: `1px solid ${v.accent}25`, borderRadius: 6 }}>
          <div style={{ fontSize: 8, color: v.accent, marginBottom: 6, letterSpacing: 1 }}>// ABOUT</div>
          {lines([100, 92, 86, 70], 2.5, '#ffffff18')}
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 8, color: v.accent, marginBottom: 10, letterSpacing: 1 }}>// EXPERIENCE</div>
          {[{ role: s.role, co: s.company, period: s.period }, { role: 'Junior Developer', co: 'Startup ABC', period: '2019 – 2021' }].map((e, i) => (
            <div key={i} style={{ marginBottom: 14, paddingLeft: 10, borderLeft: `2px solid ${v.accent}50` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: '#e2e8f0' }}>{e.role}</div>
                <div style={{ fontSize: 7.5, color: v.accent }}>{e.period}</div>
              </div>
              <div style={{ fontSize: 8, color: '#64748b', marginBottom: 6 }}>{e.co}</div>
              {lines([88, 76, 92, 68], 2.5, '#ffffff15')}
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 8, color: v.accent, marginBottom: 10, letterSpacing: 1 }}>// PROJECTS</div>
          {[{ name: 'E-commerce Platform', tech: 'Next.js · Prisma · AWS S3' }, { name: 'Real-time Dashboard', tech: 'React · WebSocket · Redis' }].map((p, i) => (
            <div key={i} style={{ marginBottom: 8, padding: '8px 10px', background: '#ffffff06', borderRadius: 5, border: '1px solid #ffffff10' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: '#e2e8f0', marginBottom: 3 }}>{p.name}</div>
              <div style={{ fontSize: 7.5, color: v.accent }}>{p.tech}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 8, color: v.accent, marginBottom: 8, letterSpacing: 1 }}>// EDUCATION</div>
          <div style={{ fontSize: 9, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{s.school}</div>
          <div style={{ fontSize: 8, color: '#64748b' }}>{s.degree} · 2014 – 2017</div>
        </div>
      </div>
    </div>
  )
}

// ── DEVELOPER: Split Modern ────────────────────────────────────────────────────

function DevSplitCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff' }}>
      <div style={{ width: '38%', background: v.sidebar, padding: '32px 18px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '3px solid rgba(255,255,255,0.5)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white" opacity="0.8">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 4 }}>{s.name}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>{s.role}</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 9 }}>Liên hệ</div>
          {['email@example.com', '0901 234 567', 'Hà Nội, VN', 'github.com/abc', 'portfolio.dev'].map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)', marginBottom: 5 }}>{c}</div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Kỹ năng</div>
          {[['React / Next.js', 95], ['TypeScript', 90], ['Node.js', 85], ['AWS / Cloud', 78], ['Docker', 72]].map(([sk, pct]) => (
            <div key={sk as string} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.85)' }}>{sk}</span>
                <span style={{ fontSize: 7.5, color: v.accent }}>{pct}%</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }}>
                <div style={{ height: '100%', background: v.accent, borderRadius: 2, width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 9 }}>Ngôn ngữ</div>
          {[['Tiếng Việt', 'Bản ngữ'], ['Tiếng Anh', 'IELTS 7.0']].map(([l, lv]) => (
            <div key={l as string} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 8.5, fontWeight: 600, color: '#fff' }}>{l}</div>
              <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.5)' }}>{lv}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: '28px 22px', overflowY: 'hidden' }}>
        {[{ label: 'GIỚI THIỆU', body: lines([100, 92, 86, 74]) },
          { label: 'KINH NGHIỆM', body: (
            <div>
              {[{ role: s.role, co: s.company, period: s.period }, { role: 'Junior Developer', co: 'Startup ABC', period: '2019–2021' }].map((e, i) => (
                <div key={i} style={{ marginBottom: 14, paddingLeft: 10, borderLeft: `3px solid ${v.accent}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#1f2937' }}>{e.role}</span>
                    <span style={{ fontSize: 8, color: '#9ca3af', background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>{e.period}</span>
                  </div>
                  <div style={{ fontSize: 8.5, color: v.sidebar, fontWeight: 600, marginBottom: 6 }}>{e.co}</div>
                  {lines([88, 75, 92, 68])}
                </div>
              ))}
            </div>
          )},
          { label: 'DỰ ÁN', body: (
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ n: 'E-commerce', t: 'Next.js · AWS' }, { n: 'Dashboard', t: 'React · WS' }, { n: 'API Gateway', t: 'Node · Redis' }].map((p, i) => (
                <div key={i} style={{ flex: 1, padding: '8px', background: `${v.sidebar}08`, border: `1px solid ${v.sidebar}20`, borderRadius: 6 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: '#1f2937', marginBottom: 3 }}>{p.n}</div>
                  <div style={{ fontSize: 7, color: v.accent }}>{p.t}</div>
                </div>
              ))}
            </div>
          )},
          { label: 'HỌC VẤN', body: (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#1f2937', marginBottom: 2 }}>{s.school}</div>
              <div style={{ fontSize: 8.5, color: '#6b7280' }}>{s.degree} · 2014–2017</div>
            </div>
          )},
        ].map(({ label, body }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 4, height: 14, background: v.accent, borderRadius: 2, flexShrink: 0 }} />
              <span style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5 }}>{label}</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>
            {body}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── DEVELOPER: Minimal ─────────────────────────────────────────────────────────

function DevMinimalCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff', padding: '40px 44px', overflowY: 'hidden' }}>
      <div style={{ borderBottom: `3px solid ${v.sidebar}`, paddingBottom: 18, marginBottom: 24 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: -0.5, marginBottom: 4 }}>{s.name}</div>
        <div style={{ fontSize: 12, color: v.accent, fontWeight: 600, marginBottom: 10 }}>{s.role}</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['email@example.com', '0901 234 567', 'github.com/abc', 'Hà Nội, VN'].map((c, i) => (
            <span key={i} style={{ fontSize: 8.5, color: '#6b7280' }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          {[{ h: 'KINH NGHIỆM', content: (
            <div>
              {[{ role: s.role, co: s.company, period: s.period }, { role: 'Junior Developer', co: 'Startup ABC', period: '2019–2021' }].map((e, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#111827' }}>{e.role}</span>
                    <span style={{ fontSize: 8, color: '#9ca3af' }}>{e.period}</span>
                  </div>
                  <div style={{ fontSize: 8.5, color: v.accent, marginBottom: 6 }}>{e.co}</div>
                  {lines([88, 75, 92])}
                </div>
              ))}
            </div>
          )}, { h: 'HỌC VẤN', content: (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#111827', marginBottom: 2 }}>{s.school}</div>
              <div style={{ fontSize: 8.5, color: '#6b7280', marginBottom: 2 }}>{s.degree} · 2014–2017</div>
            </div>
          )}].map(({ h, content }) => (
            <div key={h} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>{h}</div>
              {content}
            </div>
          ))}
        </div>
        <div style={{ width: 160, flexShrink: 0 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>TECH STACK</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {['React', 'Next.js', 'TypeScript', 'Node.js', 'Docker', 'AWS', 'PostgreSQL', 'Git', 'Redis'].map((t) => (
                <span key={t} style={{ fontSize: 7.5, background: `${v.sidebar}10`, color: v.sidebar, border: `1px solid ${v.sidebar}30`, padding: '2px 7px', borderRadius: 99 }}>{t}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>CHỨNG CHỈ</div>
            {['AWS Developer Assoc.', 'Google Cloud Prof.', 'IELTS 7.0'].map((c, i) => (
              <div key={i} style={{ fontSize: 8, color: '#374151', marginBottom: 5, display: 'flex', gap: 5 }}>
                <span style={{ color: v.accent }}>✓</span>{c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ACCOUNTANT: Formal ─────────────────────────────────────────────────────────

function AcctFormalCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'Georgia, "Times New Roman", serif', background: '#fff' }}>
      <div style={{ width: '35%', background: v.sidebar, padding: '32px 16px', flexShrink: 0 }}>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.45)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white" opacity="0.8"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </div>
        <div style={{ textAlign: 'center', paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fff', marginBottom: 4 }}>{s.name}</div>
          <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>{s.role}</div>
        </div>
        {[{ title: 'THÔNG TIN', items: ['📧 email@example.com', '📱 0901 234 567', '📍 Hà Nội, VN'] },
          { title: 'CHỨNG CHỈ', items: ['CPA Việt Nam', 'ACCA Certificate', 'Chứng chỉ Kiểm toán'] },
          { title: 'KỸ NĂNG', items: ['Kế toán doanh nghiệp', 'Kiểm toán nội bộ', 'Lập báo cáo tài chính', 'Phân tích chi phí', 'Phần mềm MISA / SAP'] },
        ].map(({ title, items }) => (
          <div key={title} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
            {items.map((item, i) => (
              <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)', marginBottom: 5 }}>{item}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '28px 22px', overflowY: 'hidden' }}>
        {[{ h: 'HỌC VẤN & CHỨNG CHỈ', body: (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{s.school}</span>
              <span style={{ fontSize: 8.5, color: '#6b7280' }}>2014 – 2017</span>
            </div>
            <div style={{ fontSize: 8.5, fontStyle: 'italic', color: '#555', marginBottom: 12 }}>{s.degree}</div>
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
              {[['Chứng chỉ CPA', '2020', 'Hội Kế toán & Kiểm toán VN'], ['Chứng chỉ ACCA', '2022', 'ACCA Global, UK']].map(([cert, yr, issuer]) => (
                <div key={cert as string} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 0, borderBottom: '1px solid #e5e7eb' }}>
                  {[cert, yr, issuer].map((cell, j) => (
                    <div key={j} style={{ padding: '5px 8px', fontSize: 7.5, color: '#374151', background: j === 0 ? '#f9fafb' : '#fff', borderRight: j < 2 ? '1px solid #e5e7eb' : 'none' }}>{cell}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}, { h: 'KINH NGHIỆM LÀM VIỆC', body: (
          <div>
            {[{ role: s.role, co: s.company, period: s.period }, { role: 'Nhân viên Kế toán', co: 'Công ty TNHH Audit ABC', period: '2016–2019' }].map((e, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{e.role}</span>
                  <span style={{ fontSize: 8, color: '#9ca3af' }}>{e.period}</span>
                </div>
                <div style={{ fontSize: 8.5, color: v.sidebar, fontStyle: 'italic', marginBottom: 6 }}>{e.co}</div>
                {['Lập báo cáo tài chính hàng quý và năm theo chuẩn VAS và IFRS', 'Phân tích chi phí, kiểm tra tính chính xác của số liệu kế toán', 'Đội nhóm kiểm toán nội bộ, giảm sai sót 35% trong 2 năm'].map((b, j) => (
                  <div key={j} style={{ fontSize: 8, color: '#374151', marginBottom: 4, display: 'flex', gap: 5 }}>
                    <span style={{ color: v.sidebar }}>▸</span><span>{b}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}].map(({ h, body }) => (
          <div key={h} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: v.sidebar, letterSpacing: 0.5 }}>{h}</span>
              <div style={{ flex: 1, height: 1.5, background: v.sidebar, opacity: 0.3 }} />
            </div>
            {body}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── ACCOUNTANT: Modern ─────────────────────────────────────────────────────────

function AcctModernCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
      <div style={{ background: v.sidebar, padding: '24px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white" opacity="0.9"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{s.name}</div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.8)' }}>{s.role}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['CPA', 'ACCA', 'MBA'].map((cert) => (
              <div key={cert} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, padding: '4px 10px', fontSize: 9, fontWeight: 700, color: '#fff' }}>{cert}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
          {['📧 email@example.com', '📱 0901 234 567', '📍 Hà Nội', '🔗 linkedin.com/in/abc'].map((c, i) => (
            <span key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)' }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, padding: '20px 22px', borderRight: '1px solid #f0f0f0' }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>KINH NGHIỆM</div>
            {[{ role: s.role, co: s.company, period: s.period }, { role: 'Kế toán trưởng', co: 'Công ty CP ABC', period: '2016–2019' }].map((e, i) => (
              <div key={i} style={{ marginBottom: 14, paddingLeft: 10, borderLeft: `3px solid ${v.sidebar}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 2 }}>{e.role}</div>
                <div style={{ fontSize: 8.5, color: v.sidebar, marginBottom: 5 }}>{e.co} · {e.period}</div>
                {lines([88, 75, 92, 68])}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>HỌC VẤN</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 2 }}>{s.school}</div>
            <div style={{ fontSize: 8.5, color: '#6b7280' }}>{s.degree} · 2014–2017</div>
          </div>
        </div>
        <div style={{ width: 190, padding: '20px 16px', flexShrink: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>KỸ NĂNG</div>
            {[['Kế toán doanh nghiệp', 95], ['Kiểm toán nội bộ', 88], ['IFRS / VAS', 90], ['Phân tích chi phí', 85], ['SAP / MISA', 80]].map(([sk, pct]) => (
              <div key={sk as string} style={{ marginBottom: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2.5 }}>
                  <span style={{ fontSize: 8, color: '#374151' }}>{sk}</span>
                  <span style={{ fontSize: 7.5, color: v.sidebar }}>{pct}%</span>
                </div>
                <div style={{ height: 3, background: '#e5e7eb', borderRadius: 2 }}>
                  <div style={{ height: '100%', background: v.sidebar, borderRadius: 2, width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>THÀNH TÍCH</div>
            {[['Doanh thu kiểm soát', '250 tỷ/năm'], ['Sai sót giảm', '40%'], ['Đội kế toán', '12 người']].map(([label, val]) => (
              <div key={label as string} style={{ marginBottom: 8, padding: '6px 8px', background: `${v.sidebar}10`, borderRadius: 5, borderLeft: `3px solid ${v.sidebar}` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: v.sidebar }}>{val}</div>
                <div style={{ fontSize: 7.5, color: '#6b7280' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ACCOUNTANT: Corporate ──────────────────────────────────────────────────────

function AcctCorporateCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ height: '100%', fontFamily: 'system-ui, sans-serif', background: '#f8fafc', display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
      <div style={{ background: v.sidebar, padding: '28px 36px 20px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: '100%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginBottom: 4, letterSpacing: -0.5 }}>{s.name}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 2 }}>{s.role}</div>
        <div style={{ display: 'flex', gap: 24 }}>
          {['email@example.com', '0901 234 567', 'Hà Nội, VN'].map((c, i) => (
            <span key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.7)' }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 0, flex: 1 }}>
        <div style={{ flex: 1, padding: '20px 24px' }}>
          {[{ h: 'KINH NGHIỆM LÀM VIỆC', body: (
            <div>
              {[{ role: s.role, co: s.company, period: s.period }, { role: 'Kế toán trưởng', co: 'Công ty CP ABC', period: '2016–2019' }].map((e, i) => (
                <div key={i} style={{ marginBottom: 16, padding: '10px 12px', background: '#fff', borderRadius: 6, border: `1px solid #e5e7eb`, borderLeft: `4px solid ${v.sidebar}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{e.role}</span>
                    <span style={{ fontSize: 8, color: '#9ca3af' }}>{e.period}</span>
                  </div>
                  <div style={{ fontSize: 8.5, color: v.sidebar, marginBottom: 8 }}>{e.co}</div>
                  {lines([88, 75, 92])}
                </div>
              ))}
            </div>
          )}, { h: 'HỌC VẤN', body: (
            <div style={{ padding: '10px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e5e7eb', borderLeft: `4px solid ${v.sidebar}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 2 }}>{s.school}</div>
              <div style={{ fontSize: 8.5, color: '#6b7280' }}>{s.degree} · 2014–2017 · Tốt nghiệp Xuất sắc</div>
            </div>
          )}].map(({ h, body }) => (
            <div key={h} style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>{h}</span><div style={{ flex: 1, height: 1, background: `${v.sidebar}30` }} />
              </div>
              {body}
            </div>
          ))}
        </div>
        <div style={{ width: 180, padding: '20px 16px', background: '#f1f5f9', flexShrink: 0, borderLeft: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>CHỨNG CHỈ</div>
            {['CPA Việt Nam', 'ACCA Certificate', 'Chứng chỉ thuế', 'ISO 9001 Auditor'].map((c, i) => (
              <div key={i} style={{ fontSize: 8.5, color: '#374151', marginBottom: 6, display: 'flex', gap: 5, alignItems: 'center' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: v.sidebar, flexShrink: 0 }} />{c}
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>PHẦN MỀM</div>
            {['SAP ERP', 'MISA', 'Excel nâng cao', 'QuickBooks'].map((sw, i) => (
              <div key={i} style={{ fontSize: 8, color: '#374151', marginBottom: 5, padding: '3px 8px', background: '#fff', borderRadius: 4, border: '1px solid #e2e8f0' }}>{sw}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>NGÔN NGỮ</div>
            <div style={{ fontSize: 8.5, color: '#374151', marginBottom: 4 }}>Tiếng Việt — Bản ngữ</div>
            <div style={{ fontSize: 8.5, color: '#374151' }}>Tiếng Anh — TOEIC 750</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SALES: Bold KPI ────────────────────────────────────────────────────────────

function SalesBoldCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
      <div style={{ background: v.sidebar, padding: '28px 32px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" opacity="0.9"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: -0.5, marginBottom: 3 }}>{s.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 2 }}>{s.role}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {['📧 email@example.com', '📱 0901 234 567', '📍 Hà Nội, VN'].map((c, i) => (
            <span key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)' }}>{c}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, borderBottom: '2px solid #f3f4f6' }}>
        {[['120%', 'Quota đạt được', '#'], ['₫45 tỷ', 'Doanh số 2023', '#'], ['350+', 'Khách hàng', '#']].map(([val, label, _], i) => (
          <div key={i} style={{ padding: '14px 16px', background: i % 2 === 0 ? '#fff' : '#fafafa', borderRight: i < 2 ? '1px solid #e5e7eb' : 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: v.sidebar, marginBottom: 2 }}>{val}</div>
            <div style={{ fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, padding: '18px 22px', borderRight: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>KINH NGHIỆM</div>
          {[{ role: s.role, co: s.company, period: s.period }, { role: 'Sales Executive', co: 'Công ty Phân phối XYZ', period: '2016–2018' }].map((e, i) => (
            <div key={i} style={{ marginBottom: 14, paddingLeft: 10, borderLeft: `3px solid ${v.sidebar}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{e.role}</span>
                <span style={{ fontSize: 8, color: '#9ca3af' }}>{e.period}</span>
              </div>
              <div style={{ fontSize: 8.5, color: v.sidebar, marginBottom: 6 }}>{e.co}</div>
              {['Đạt 120% KPI doanh số mục tiêu năm 2023, vượt target ₫45 tỷ', 'Xây dựng đội ngũ 15 Sales, tăng hiệu suất team 35%', 'Mở rộng thị trường miền Bắc, tăng 200 khách hàng mới'].map((b, j) => (
                <div key={j} style={{ fontSize: 8, color: '#374151', marginBottom: 4, display: 'flex', gap: 5 }}>
                  <span style={{ color: v.sidebar, fontWeight: 700 }}>✦</span><span>{b}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ width: 180, padding: '18px 16px', flexShrink: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>KỸ NĂNG</div>
            {['Đàm phán & Chốt Sales', 'Quản lý team Sales', 'CRM & Pipeline', 'Phân tích thị trường', 'Thuyết trình'].map((sk, i) => (
              <div key={i} style={{ fontSize: 8, color: '#374151', marginBottom: 5, display: 'flex', gap: 5 }}>
                <span style={{ color: v.accent }}>▸</span>{sk}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>HỌC VẤN</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#111', marginBottom: 2 }}>{s.school}</div>
            <div style={{ fontSize: 8, color: '#6b7280' }}>{s.degree} · 2014–2017</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SALES: Metrics ─────────────────────────────────────────────────────────────

function SalesMetricsCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff' }}>
      <div style={{ width: '34%', background: v.sidebar, padding: '28px 16px', flexShrink: 0 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.45)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" opacity="0.85"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', marginBottom: 4 }}>{s.name}</div>
          <div style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.7)' }}>{s.role}</div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 12 }}>KPI 2023</div>
          {[['₫45 tỷ', 'Doanh số'], ['120%', 'Quota đạt'], ['350', 'Khách hàng'], ['15', 'Team size']].map(([val, label]) => (
            <div key={label as string} style={{ marginBottom: 12, padding: '8px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: 6, borderLeft: '3px solid rgba(255,255,255,0.5)' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>LIÊN HỆ</div>
          {['email@example.com', '0901 234 567', 'Hà Nội, VN'].map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: 'rgba(255,255,255,0.75)', marginBottom: 5 }}>{c}</div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: '28px 22px', overflowY: 'hidden' }}>
        {[{ h: 'KINH NGHIỆM', body: (
          <div>
            {[{ role: s.role, co: s.company, period: s.period }, { role: 'Sales Executive', co: 'Phân phối XYZ', period: '2016–2018' }].map((e, i) => (
              <div key={i} style={{ marginBottom: 16, padding: '10px 12px', borderRadius: 6, background: `${v.sidebar}06`, border: `1px solid ${v.sidebar}18` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{e.role}</span>
                  <span style={{ fontSize: 8, color: '#9ca3af' }}>{e.period}</span>
                </div>
                <div style={{ fontSize: 8.5, color: v.sidebar, marginBottom: 6 }}>{e.co}</div>
                {lines([88, 75, 92, 68])}
              </div>
            ))}
          </div>
        )}, { h: 'KỸ NĂNG', body: (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {['Đàm phán', 'Quản lý team', 'CRM', 'Pipeline', 'Thuyết trình', 'Thị trường B2B', 'Xuất khẩu'].map((sk) => (
              <span key={sk} style={{ fontSize: 8, background: `${v.sidebar}12`, color: v.sidebar, border: `1px solid ${v.sidebar}30`, padding: '3px 9px', borderRadius: 99 }}>{sk}</span>
            ))}
          </div>
        )}, { h: 'HỌC VẤN', body: (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 2 }}>{s.school}</div>
            <div style={{ fontSize: 8.5, color: '#6b7280' }}>{s.degree} · 2014–2017</div>
          </div>
        )}].map(({ h, body }) => (
          <div key={h} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>{h}</span><div style={{ flex: 1, height: 1.5, background: `${v.sidebar}30` }} />
            </div>
            {body}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── SALES: Corporate ───────────────────────────────────────────────────────────

function SalesCorporateCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff', padding: '36px 40px', overflowY: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 20, marginBottom: 22, borderBottom: `2px solid ${v.sidebar}` }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#111', marginBottom: 4, letterSpacing: -0.5 }}>{s.name}</div>
          <div style={{ fontSize: 11, color: v.sidebar, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5 }}>{s.role}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {['email@example.com', '0901 234 567', 'Hà Nội, VN', 'linkedin.com/in/abc'].map((c, i) => (
            <div key={i} style={{ fontSize: 8, color: '#6b7280', marginBottom: 3 }}>{c}</div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 28 }}>
        <div style={{ flex: 1 }}>
          {[{ h: 'KINH NGHIỆM', body: (
            <div>
              {[{ role: s.role, co: s.company, period: s.period }, { role: 'Sales Executive', co: 'Phân phối XYZ', period: '2016–2018' }].map((e, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#111' }}>{e.role}</span>
                    <span style={{ fontSize: 8, color: '#9ca3af' }}>{e.period}</span>
                  </div>
                  <div style={{ fontSize: 9, color: v.sidebar, fontWeight: 600, marginBottom: 7 }}>{e.co}</div>
                  {['Đạt 120% chỉ tiêu doanh số, vượt KPI ₫45 tỷ trong năm 2023', 'Quản lý và phát triển đội ngũ 15 nhân viên kinh doanh', 'Mở rộng mạng lưới 200 khách hàng doanh nghiệp tại miền Bắc'].map((b, j) => (
                    <div key={j} style={{ fontSize: 8.5, color: '#374151', marginBottom: 5, display: 'flex', gap: 6 }}>
                      <span style={{ color: v.sidebar, fontWeight: 700, marginTop: 1 }}>▸</span><span>{b}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}, { h: 'HỌC VẤN', body: (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 2 }}>{s.school}</div>
                <div style={{ fontSize: 8.5, color: '#6b7280' }}>{s.degree}</div>
              </div>
              <div style={{ fontSize: 8, color: '#9ca3af' }}>2014 – 2017</div>
            </div>
          )}].map(({ h, body }) => (
            <div key={h} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{h}</span><div style={{ flex: 1, height: 1, background: `${v.sidebar}40` }} />
              </div>
              {body}
            </div>
          ))}
        </div>
        <div style={{ width: 155, flexShrink: 0 }}>
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>KỸ NĂNG</div>
            {['Đàm phán & Chốt Deal', 'Quản lý đội nhóm', 'CRM Salesforce', 'Lập kế hoạch Sales', 'Phân tích thị trường', 'Tiếng Anh B2'].map((sk, i) => (
              <div key={i} style={{ fontSize: 8.5, color: '#374151', marginBottom: 5, display: 'flex', gap: 5 }}>
                <span style={{ color: v.sidebar }}>•</span>{sk}
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>THÀNH TÍCH</div>
            <div style={{ padding: '8px 10px', background: `${v.sidebar}08`, border: `1px solid ${v.sidebar}25`, borderRadius: 6, marginBottom: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: v.sidebar }}>₫45 tỷ</div>
              <div style={{ fontSize: 7.5, color: '#6b7280' }}>Doanh số cao nhất 2023</div>
            </div>
            <div style={{ padding: '8px 10px', background: `${v.sidebar}08`, border: `1px solid ${v.sidebar}25`, borderRadius: 6 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: v.sidebar }}>Top 1</div>
              <div style={{ fontSize: 7.5, color: '#6b7280' }}>Nhân viên xuất sắc năm</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MARKETING: Creative ────────────────────────────────────────────────────────

function MktCreativeCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'hidden' }}>
      <div style={{ display: 'flex', height: 220 }}>
        <div style={{ background: v.sidebar, width: '45%', padding: '28px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.5)', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white" opacity="0.9"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </div>
          <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', marginBottom: 4, lineHeight: 1.1 }}>{s.name}</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: 2 }}>{s.role}</div>
        </div>
        <div style={{ flex: 1, background: '#fff', padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: `3px solid ${v.sidebar}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: v.sidebar, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Thành tích nổi bật</div>
          {[['5M+', 'Reach chiến dịch/năm'], ['₫2 tỷ', 'Ngân sách quản lý'], ['40%', 'Tăng conversion rate']].map(([val, lbl]) => (
            <div key={lbl as string} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: v.sidebar, minWidth: 48 }}>{val}</div>
              <div style={{ fontSize: 8, color: '#6b7280' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1, padding: '16px 20px', borderRight: '1px solid #f0f0f0' }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>KINH NGHIỆM</div>
          {[{ role: s.role, co: s.company, period: s.period }, { role: 'Digital Marketing Exec.', co: 'Agency Creative', period: '2018–2020' }].map((e, i) => (
            <div key={i} style={{ marginBottom: 14, paddingLeft: 10, borderLeft: `3px solid ${v.sidebar}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{e.role}</span>
                <span style={{ fontSize: 8, color: '#9ca3af' }}>{e.period}</span>
              </div>
              <div style={{ fontSize: 8.5, color: v.sidebar, marginBottom: 5 }}>{e.co}</div>
              {lines([88, 75, 92])}
            </div>
          ))}
        </div>
        <div style={{ width: 180, padding: '16px 14px', flexShrink: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 9 }}>KỸ NĂNG</div>
            {['Content Marketing', 'Google Ads / Meta', 'SEO / SEM', 'Data Analytics', 'Brand Strategy', 'Email Marketing'].map((sk, i) => (
              <div key={i} style={{ fontSize: 8, color: '#374151', marginBottom: 5, padding: '2px 8px', background: `${v.sidebar}10`, borderRadius: 4, border: `1px solid ${v.sidebar}20` }}>{sk}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 9 }}>LIÊN HỆ</div>
            {['email@example.com', '0901 234 567', 'Hà Nội, VN'].map((c, i) => (
              <div key={i} style={{ fontSize: 8, color: '#6b7280', marginBottom: 4 }}>{c}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MARKETING: Modern ─────────────────────────────────────────────────────────

function MktModernCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fafafa' }}>
      <div style={{ width: '36%', background: '#fff', padding: '28px 16px', borderRight: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${v.sidebar}15`, border: `2px solid ${v.sidebar}50`, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill={v.sidebar} opacity="0.7"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </div>
        <div style={{ textAlign: 'center', paddingBottom: 14, marginBottom: 14, borderBottom: `2px solid ${v.sidebar}` }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: '#111', marginBottom: 4 }}>{s.name}</div>
          <div style={{ fontSize: 8.5, color: v.sidebar, fontWeight: 600 }}>{s.role}</div>
        </div>
        {[{ title: 'LIÊN HỆ', items: ['📧 email@example.com', '📱 0901 234 567', '📍 Hà Nội, VN', '🔗 portfolio.vn'] },
          { title: 'TOOLS', items: ['Google Analytics', 'Facebook Ads', 'HubSpot CRM', 'Canva / Figma', 'Mailchimp'] },
          { title: 'NGÔN NGỮ', items: ['Tiếng Việt — Bản ngữ', 'Tiếng Anh — TOEIC 800'] },
        ].map(({ title, items }) => (
          <div key={title} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 8, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>{title}</div>
            {items.map((item, i) => (
              <div key={i} style={{ fontSize: 8, color: '#374151', marginBottom: 5 }}>{item}</div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '24px 20px', overflowY: 'hidden' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[['5M+', 'Reach/năm'], ['40%', 'CVR tăng'], ['₫2 tỷ', 'Budget']].map(([val, lbl]) => (
            <div key={lbl as string} style={{ flex: 1, padding: '10px 8px', background: '#fff', border: `1px solid ${v.sidebar}30`, borderTop: `3px solid ${v.sidebar}`, borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: v.sidebar }}>{val}</div>
              <div style={{ fontSize: 7, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>{lbl}</div>
            </div>
          ))}
        </div>
        {[{ h: 'KINH NGHIỆM', body: (
          <div>
            {[{ role: s.role, co: s.company, period: s.period }, { role: 'Digital Mktg Exec.', co: 'Agency XYZ', period: '2018–2020' }].map((e, i) => (
              <div key={i} style={{ marginBottom: 14, padding: '10px 12px', background: '#fff', borderRadius: 6, border: '1px solid #e5e7eb', borderLeft: `4px solid ${v.sidebar}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{e.role}</span>
                  <span style={{ fontSize: 8, color: '#9ca3af' }}>{e.period}</span>
                </div>
                <div style={{ fontSize: 8.5, color: v.sidebar, marginBottom: 6 }}>{e.co}</div>
                {lines([88, 75, 92])}
              </div>
            ))}
          </div>
        )}, { h: 'KỸ NĂNG', body: (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {['Content Marketing', 'Google Ads', 'Meta Ads', 'SEO / SEM', 'Email Mktg', 'Brand Strategy', 'Influencer', 'Data Analytics'].map((sk) => (
              <span key={sk} style={{ fontSize: 7.5, background: `${v.sidebar}12`, color: v.sidebar, border: `1px solid ${v.sidebar}30`, padding: '3px 9px', borderRadius: 99 }}>{sk}</span>
            ))}
          </div>
        )}, { h: 'HỌC VẤN', body: (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 2 }}>{s.school}</div>
            <div style={{ fontSize: 8.5, color: '#6b7280' }}>{s.degree} · 2014–2017</div>
          </div>
        )}].map(({ h, body }) => (
          <div key={h} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 9, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>{h}</span><div style={{ flex: 1, height: 1, background: `${v.sidebar}30` }} />
            </div>
            {body}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MARKETING: Minimal ─────────────────────────────────────────────────────────

function MktMinimalCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff', overflowY: 'hidden' }}>
      <div style={{ height: 8, background: v.sidebar }} />
      <div style={{ padding: '28px 40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 18, marginBottom: 24, borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, color: '#111', marginBottom: 5, letterSpacing: -1 }}>{s.name}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: v.sidebar, textTransform: 'uppercase', letterSpacing: 3 }}>{s.role}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {['email@example.com', '0901 234 567', 'Hà Nội, VN'].map((c, i) => (
              <div key={i} style={{ fontSize: 8, color: '#9ca3af', marginBottom: 3 }}>{c}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 22 }}>
          {[['5M+', 'Organic Reach / năm'], ['40%', 'CVR increase'], ['₫2 tỷ', 'Budget managed']].map(([val, lbl]) => (
            <div key={lbl as string} style={{ borderLeft: `3px solid ${v.sidebar}`, paddingLeft: 10 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: v.sidebar }}>{val}</div>
              <div style={{ fontSize: 8, color: '#9ca3af' }}>{lbl}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          <div style={{ flex: 1 }}>
            {[{ h: 'KINH NGHIỆM', body: (
              <div>
                {[{ role: s.role, co: s.company, period: s.period }, { role: 'Digital Marketing Exec.', co: 'Agency XYZ', period: '2018–2020' }].map((e, i) => (
                  <div key={i} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{e.role}</span>
                      <span style={{ fontSize: 8, color: '#9ca3af' }}>{e.period}</span>
                    </div>
                    <div style={{ fontSize: 8.5, color: v.accent, marginBottom: 6 }}>{e.co}</div>
                    {lines([88, 75, 92])}
                  </div>
                ))}
              </div>
            )}, { h: 'HỌC VẤN', body: (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 2 }}>{s.school}</div>
                <div style={{ fontSize: 8.5, color: '#6b7280' }}>{s.degree} · 2014–2017</div>
              </div>
            )}].map(({ h, body }) => (
              <div key={h} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: '#374151', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, paddingBottom: 4, borderBottom: `1px solid #f3f4f6` }}>{h}</div>
                {body}
              </div>
            ))}
          </div>
          <div style={{ width: 150, flexShrink: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#374151', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, paddingBottom: 4, borderBottom: '1px solid #f3f4f6' }}>KỸ NĂNG</div>
            {['Content Marketing', 'Google & Meta Ads', 'SEO / SEM', 'Brand Strategy', 'Email Marketing', 'Data Analytics', 'Influencer Mktg'].map((sk, i) => (
              <div key={i} style={{ fontSize: 8, color: '#374151', marginBottom: 5, display: 'flex', gap: 5 }}>
                <span style={{ color: v.sidebar, fontWeight: 700 }}>—</span>{sk}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Generic layouts (for "simple" position) ────────────────────────────────────

function SidebarCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff' }}>
      <div style={{ width: '36%', background: v.sidebar, padding: '32px 20px', flexShrink: 0 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '3px solid rgba(255,255,255,0.5)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="white" opacity="0.8"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </div>
        <div style={{ textAlign: 'center', marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#fff', marginBottom: 4 }}>{s.name}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>{s.role}</div>
        </div>
        {['📧 email@example.com', '📱 0901 234 567', '📍 Hà Nội, VN', '💼 linkedin.com/in/abc'].map((l, i) => (
          <div key={i} style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>{l}</div>
        ))}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.2)', margin: '14px 0' }} />
        <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>Kỹ năng</div>
        {[['Kỹ năng 1', 90], ['Kỹ năng 2', 85], ['Kỹ năng 3', 78], ['Kỹ năng 4', 72]].map(([sk, pct]) => (
          <div key={sk as string} style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2.5 }}>
              <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.8)' }}>{sk}</span>
              <span style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.55)' }}>{pct}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
              <div style={{ height: '100%', background: 'rgba(255,255,255,0.65)', borderRadius: 2, width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '28px 22px', overflowY: 'hidden' }}>
        {[{ h: 'Giới thiệu', body: lines([100, 92, 86, 74]) },
          { h: 'Kinh nghiệm làm việc', body: (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#111' }}>{s.role}</span>
                <span style={{ fontSize: 8, color: '#9ca3af' }}>{s.period}</span>
              </div>
              <div style={{ fontSize: 8.5, color: v.sidebar, marginBottom: 6 }}>{s.company}</div>
              {lines([88, 75, 92, 68])}
            </div>
          )},
          { h: 'Học vấn', body: (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#111', marginBottom: 2 }}>{s.school}</div>
              <div style={{ fontSize: 8.5, color: '#6b7280' }}>{s.degree} · 2014–2017</div>
            </div>
          )},
        ].map(({ h, body }) => (
          <div key={h} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 3, height: 14, background: v.sidebar, borderRadius: 2 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: v.sidebar, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
            </div>
            {body}
          </div>
        ))}
      </div>
    </div>
  )
}

function BoldCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ height: '100%', fontFamily: 'system-ui, sans-serif', background: '#fff', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: v.sidebar, padding: '28px 32px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.45)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" opacity="0.85"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{s.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>{s.role}</div>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'hidden' }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ flex: 1 }}>
            {[{ h: 'Kinh nghiệm', body: lines([88, 75, 92, 68]) }, { h: 'Học vấn', body: lines([70, 60]) }].map(({ h, body }) => (
              <div key={h} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>{h}</div>
                {body}
              </div>
            ))}
          </div>
          <div style={{ width: 140 }}>
            {[{ h: 'Kỹ năng', body: lines([90, 80, 75, 70, 65]) }, { h: 'Ngôn ngữ', body: lines([50, 45]) }].map(({ h, body }) => (
              <div key={h} style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: v.sidebar, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>{h}</div>
                {body}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ClassicCV({ v, data: { sample: s } }: { v: Variant; data: PositionData }) {
  return (
    <div style={{ height: '100%', fontFamily: 'Georgia, serif', background: '#fff', padding: '36px 40px', overflowY: 'hidden' }}>
      <div style={{ textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${v.accent}` }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#111', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{s.name}</div>
        <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>{s.role}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 8.5, color: '#777' }}>
          {['email@example.com', '0901 234 567', 'Hà Nội', 'linkedin.com'].map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>
      {[{ h: 'KINH NGHIỆM LÀM VIỆC', body: lines([88, 75, 92, 68]) },
        { h: 'HỌC VẤN', body: lines([70, 60]) },
        { h: 'KỸ NĂNG', body: lines([90, 80, 75]) },
      ].map(({ h, body }) => (
        <div key={h} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: v.accent, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{h}</span><div style={{ flex: 1, height: 1, background: v.accent, opacity: 0.3 }} />
          </div>
          {body}
        </div>
      ))}
    </div>
  )
}

// ── CV renderer ───────────────────────────────────────────────────────────────

function renderCV(layout: string, v: Variant, data: PositionData) {
  switch (layout) {
    case 'dev-dark':         return <DevDarkCV v={v} data={data} />
    case 'dev-split':        return <DevSplitCV v={v} data={data} />
    case 'dev-minimal':      return <DevMinimalCV v={v} data={data} />
    case 'acct-formal':      return <AcctFormalCV v={v} data={data} />
    case 'acct-modern':      return <AcctModernCV v={v} data={data} />
    case 'acct-corporate':   return <AcctCorporateCV v={v} data={data} />
    case 'sales-bold':       return <SalesBoldCV v={v} data={data} />
    case 'sales-metrics':    return <SalesMetricsCV v={v} data={data} />
    case 'sales-corporate':  return <SalesCorporateCV v={v} data={data} />
    case 'mkt-creative':     return <MktCreativeCV v={v} data={data} />
    case 'mkt-modern':       return <MktModernCV v={v} data={data} />
    case 'mkt-minimal':      return <MktMinimalCV v={v} data={data} />
    case 'bold':             return <BoldCV v={v} data={data} />
    case 'classic':          return <ClassicCV v={v} data={data} />
    default:                 return <SidebarCV v={v} data={data} />
  }
}

// ── Responsive full-width preview ─────────────────────────────────────────────

function CVPreview({ variant, data }: { variant: Variant; data: PositionData }) {
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
        {renderCV(variant.layout, variant, data)}
      </div>
    </div>
  )
}

// Tiny thumbnail for carousel
function ThumbCV({ variant, data, selected, onClick }: { variant: Variant; data: PositionData; selected: boolean; onClick: () => void }) {
  const W = 794, H = 1123, SCALE = 0.1
  return (
    <button
      onClick={onClick}
      className={cn('relative shrink-0 overflow-hidden rounded border-2 transition', selected ? 'border-brand shadow-md shadow-brand/20' : 'border-gray-200 hover:border-gray-300')}
      style={{ width: W * SCALE + 4, height: H * SCALE + 4, padding: 2 }}
    >
      <div style={{ width: W * SCALE, height: H * SCALE, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
          {renderCV(variant.layout, variant, data)}
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

export default function TemplateDetailPage() {
  const params = useParams<{ slug: string }>()
  const slug   = params?.slug ?? ''
  const data   = POSITIONS[slug]
  if (!data) return notFound()

  const variants = POSITION_VARIANTS[slug] ?? POSITION_VARIANTS.simple

  const [selectedId, setSelectedId]       = useState(variants[0].id)
  const [lang, setLang]                   = useState<'vi' | 'en'>('vi')
  const [createOption, setCreateOption]   = useState<'template' | 'blank'>('template')
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
            <CVPreview variant={selectedVariant} data={data} />
          </div>

          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-3 py-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">
                {data.count} mẫu cho {data.title}
              </span>
              <div className="flex gap-1">
                {[-1, 1].map((d) => (
                  <button key={d} onClick={() => scrollStrip(d as -1 | 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition">
                    {d === -1 ? <ChevronLeftIcon className="h-3.5 w-3.5" /> : <ChevronRightIcon className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>
            <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {variants.map((v) => (
                <ThumbCV key={v.id} variant={v} data={data} selected={v.id === selectedId} onClick={() => setSelectedId(v.id)} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: controls */}
        <div className="w-full lg:w-[380px] shrink-0">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-gray-400">
            <Link href="/" className="hover:text-brand transition">Trang chủ</Link>
            <ChevronRightIcon className="h-3 w-3" />
            <Link href="/resumes/templates" className="hover:text-brand transition">{data.category}</Link>
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
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Màu sắc & thiết kế</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => (
                <button key={v.id} title={v.label} onClick={() => setSelectedId(v.id)}
                  className={cn('h-8 w-8 rounded-full border-2 transition flex items-center justify-center', v.id === selectedId ? 'border-gray-400 scale-110' : 'border-transparent hover:border-gray-300')}
                  style={{ background: v.sidebar }}>
                  {v.id === selectedId && <CheckIcon className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-400">Đang chọn: {selectedVariant.label}</p>
          </div>

          {/* Creation options */}
          <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-bold text-gray-800">Bạn muốn tạo CV từ?</p>
            <div className="space-y-3">
              {[{ value: 'template', label: 'Mẫu nội dung + Thiết kế như ảnh', desc: 'Nội dung mẫu sẵn, bạn chỉ cần chỉnh sửa' },
                { value: 'blank',    label: 'Chỉ lấy thiết kế, tôi tạo từ đầu', desc: 'Bắt đầu trang trắng, giữ nguyên layout' }].map(({ value, label, desc }) => (
                <label key={value}
                  className={cn('flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition', createOption === value ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-gray-300')}
                  onClick={() => setCreateOption(value as 'template' | 'blank')}>
                  <div className="mt-0.5 flex-shrink-0 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition"
                    style={{ borderColor: createOption === value ? 'var(--brand)' : '#d1d5db', background: createOption === value ? 'var(--brand)' : 'transparent' }}>
                    {createOption === value && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <Link
            href={`/resumes/builder?template=${slug}&variant=${selectedId}&mode=${createOption}&lang=${lang}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90"
          >
            Tạo CV <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-center text-xs text-gray-400">Miễn phí · Không cần tài khoản · Xuất PDF ngay</p>

          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="mb-2 text-xs font-bold text-amber-700">Mẹo tạo CV hiệu quả</p>
            <ul className="space-y-1.5 text-xs text-amber-700/80">
              <li>• Thay thế toàn bộ nội dung mẫu bằng thông tin thực của bạn</li>
              <li>• Giữ CV trong 1–2 trang với kinh nghiệm dưới 8 năm</li>
              <li>• Dùng số liệu cụ thể để minh chứng thành tích (%, doanh số)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
