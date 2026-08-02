'use client'

import { useState, memo } from 'react'

interface Point { week: string; count: number }

export const JobMarketChart = memo(function JobMarketChart({ points }: { points: Point[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-white/30">
        Chưa đủ dữ liệu
      </div>
    )
  }

  // ── Layout ─────────────────────────────────────────────────────────────────
  const W = 500, H = 170
  const padL = 52, padR = 12, padT = 14, padB = 28
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const counts = points.map((p) => p.count)
  const dataMin = Math.min(...counts)
  const dataMax = Math.max(...counts)
  const spread = dataMax - dataMin || Math.max(dataMax * 0.1, 1)
  const yMin = Math.max(0, Math.floor((dataMin - spread * 0.2) / 1000) * 1000)
  const yMax = Math.ceil((dataMax + spread * 0.2) / 1000) * 1000
  const yRange = yMax - yMin || 1

  // 5 Y ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => yMax - Math.round((yRange / 4) * i))

  const toX = (i: number) =>
    padL + (points.length > 1 ? i / (points.length - 1) : 0.5) * plotW
  const toY = (v: number) => padT + ((yMax - v) / yRange) * plotH

  const coords = points.map((p, i) => ({ x: toX(i), y: toY(p.count) }))

  // Smooth cubic bezier path
  const pathD = coords
    .map((c, i) => {
      if (i === 0) return `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
      const prev = coords[i - 1]
      const cpx = ((prev.x + c.x) / 2).toFixed(1)
      return `C ${cpx} ${prev.y.toFixed(1)} ${cpx} ${c.y.toFixed(1)} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`
    })
    .join(' ')

  const areaD = `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${(padT + plotH).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(padT + plotH).toFixed(1)} Z`

  // X tick indices (show ~5 evenly)
  const step = Math.max(1, Math.floor((points.length - 1) / 4))
  const xTicks: number[] = []
  for (let i = 0; i < points.length; i += step) xTicks.push(i)
  if (xTicks[xTicks.length - 1] !== points.length - 1) xTicks.push(points.length - 1)

  // Active point
  const active = activeIdx !== null ? points[activeIdx] : null
  const ac = activeIdx !== null ? coords[activeIdx] : null

  // ── Tooltip ────────────────────────────────────────────────────────────────
  function Tooltip() {
    if (!active || !ac) return null
    const d = new Date(active.week)
    const dateStr = [
      d.getDate().toString().padStart(2, '0'),
      (d.getMonth() + 1).toString().padStart(2, '0'),
      d.getFullYear(),
    ].join('/')
    const valStr = active.count.toLocaleString('vi-VN') + ' việc làm'

    const TW = 148, TH = 50, GAP = 10
    let tx = ac.x - TW / 2
    let ty = ac.y - TH - GAP
    tx = Math.max(padL, Math.min(tx, W - padR - TW))
    if (ty < padT) ty = ac.y + GAP

    return (
      <g style={{ pointerEvents: 'none' }}>
        {/* Vertical dashed line */}
        <line
          x1={ac.x} y1={padT} x2={ac.x} y2={padT + plotH}
          stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 3"
        />
        {/* Tooltip box */}
        <rect x={tx} y={ty} width={TW} height={TH} rx="7"
          fill="#0f2d1a" stroke="rgba(74,222,128,0.4)" strokeWidth="1.2"
          filter="drop-shadow(0 2px 8px rgba(0,0,0,0.5))" />
        <text x={tx + TW / 2} y={ty + 18} textAnchor="middle"
          fontSize="10" fill="rgba(134,239,172,0.75)" fontFamily="system-ui,sans-serif">
          {dateStr}
        </text>
        <text x={tx + TW / 2} y={ty + 37} textAnchor="middle"
          fontSize="12" fill="white" fontWeight="700" fontFamily="system-ui,sans-serif">
          {valStr}
        </text>
      </g>
    )
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full select-none"
      style={{ height: 190, overflow: 'visible' }}
      onMouseLeave={() => setActiveIdx(null)}
    >
      <defs>
        <linearGradient id="jmAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
        <clipPath id="jmClip">
          <rect x={padL} y={padT} width={plotW} height={plotH + 1} />
        </clipPath>
      </defs>

      {/* Y-axis grid lines + labels */}
      {yTicks.map((val) => {
        const y = toY(val)
        const label = val >= 1000
          ? (val / 1000).toLocaleString('vi-VN') + '.000'
          : val.toString()
        return (
          <g key={val}>
            <line x1={padL} y1={y} x2={W - padR} y2={y}
              stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            <text x={padL - 5} y={y + 4} textAnchor="end"
              fontSize="9" fill="rgba(134,239,172,0.55)" fontFamily="system-ui,sans-serif">
              {label}
            </text>
          </g>
        )
      })}

      {/* Vertical guides at x ticks */}
      {xTicks.map((i) => (
        <line key={i}
          x1={coords[i].x} y1={padT} x2={coords[i].x} y2={padT + plotH}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#jmAreaGrad)" clipPath="url(#jmClip)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#4ade80" strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" clipPath="url(#jmClip)" />

      {/* X-axis labels */}
      {xTicks.map((i) => {
        const d = new Date(points[i].week)
        const label = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
        return (
          <text key={i} x={coords[i].x} y={H - 4} textAnchor="middle"
            fontSize="9.5" fill="rgba(134,239,172,0.5)" fontFamily="system-ui,sans-serif">
            {label}
          </text>
        )
      })}

      {/* Hover hit columns (Voronoi-like: each point owns midpoint region) */}
      {coords.map((c, i) => {
        const prev = coords[i - 1]
        const next = coords[i + 1]
        const x1 = prev ? (prev.x + c.x) / 2 : padL
        const x2 = next ? (c.x + next.x) / 2 : W - padR
        return (
          <rect key={i}
            x={x1} y={padT} width={x2 - x1} height={plotH}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onMouseEnter={() => setActiveIdx(i)}
          />
        )
      })}

      {/* Data dots */}
      {coords.map((c, i) => {
        const isActive = activeIdx === i
        return (
          <circle key={i} cx={c.x} cy={c.y}
            r={isActive ? 5.5 : 3}
            fill={isActive ? '#ffffff' : '#22c55e'}
            stroke={isActive ? '#22c55e' : 'none'}
            strokeWidth="2"
          />
        )
      })}

      {/* Tooltip (rendered last = on top) */}
      <Tooltip />
    </svg>
  )
})
