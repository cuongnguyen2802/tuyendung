'use client'

import { useState, memo } from 'react'

interface BarData { label: string; count: number }

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#06b6d4', '#eab308', '#a855f7']

export const JobMarketBarChart = memo(function JobMarketBarChart({ data }: { data: BarData[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-white/30">
        Chưa có dữ liệu
      </div>
    )
  }

  // ── Layout ─────────────────────────────────────────────────────────────────
  const W = 380, H = 175
  const padL = 50, padR = 10, padT = 12, padB = 52
  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const counts = data.map((d) => d.count)
  const dataMax = Math.max(...counts)
  const yMax = Math.ceil((dataMax * 1.25) / 1000) * 1000 || 10
  const yRange = yMax

  // 5 Y ticks from 0 to yMax
  const yTicks = Array.from({ length: 6 }, (_, i) =>
    Math.round((yMax / 5) * (5 - i))
  )

  const barSlot = plotW / data.length
  const barW = Math.min(barSlot * 0.55, 32)

  const toX = (i: number) => padL + barSlot * i + barSlot / 2
  const toY = (v: number) => padT + ((yMax - v) / yRange) * plotH
  const barH = (v: number) => Math.max(1, ((v / yMax) * plotH))

  return (
    <div onMouseLeave={() => setActiveIdx(null)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full select-none"
        style={{ height: 195, overflow: 'visible' }}
      >
        <defs>
          {COLORS.map((c, i) => (
            <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c} stopOpacity="1" />
              <stop offset="100%" stopColor={c} stopOpacity="0.5" />
            </linearGradient>
          ))}
        </defs>

        {/* Y grid + labels */}
        {yTicks.map((val) => {
          const y = toY(val)
          const label =
            val >= 1000
              ? (val / 1000).toFixed(1).replace('.0', '') + '.000'
              : val.toString()
          return (
            <g key={val}>
              <line
                x1={padL} y1={y} x2={W - padR} y2={y}
                stroke="rgba(255,255,255,0.07)" strokeWidth="1"
              />
              <text
                x={padL - 5} y={y + 4} textAnchor="end"
                fontSize="9" fill="rgba(134,239,172,0.55)" fontFamily="system-ui,sans-serif"
              >
                {label}
              </text>
            </g>
          )
        })}

        {/* X baseline */}
        <line
          x1={padL} y1={padT + plotH} x2={W - padR} y2={padT + plotH}
          stroke="rgba(255,255,255,0.1)" strokeWidth="1"
        />

        {/* Bars */}
        {data.map((d, i) => {
          const x = toX(i)
          const bh = barH(d.count)
          const by = padT + plotH - bh
          const isActive = activeIdx === i
          const color = COLORS[i % COLORS.length]

          // Tooltip positioning
          const TW = 130, TH = 46
          let tx = x - TW / 2
          const ty = by - TH - 8
          tx = Math.max(padL, Math.min(tx, W - padR - TW))

          return (
            <g
              key={i}
              onMouseEnter={() => setActiveIdx(i)}
              style={{ cursor: 'pointer' }}
            >
              {/* Hit area */}
              <rect
                x={x - barSlot / 2} y={padT} width={barSlot} height={plotH}
                fill="transparent"
              />

              {/* Bar shadow */}
              {isActive && (
                <rect
                  x={x - barW / 2 - 2} y={by}
                  width={barW + 4} height={bh}
                  rx="4" fill={color} opacity="0.15"
                />
              )}

              {/* Bar */}
              <rect
                x={x - barW / 2} y={by}
                width={barW} height={bh}
                rx="3"
                fill={`url(#barGrad${i % COLORS.length})`}
                opacity={isActive ? 1 : 0.82}
              />

              {/* Top cap highlight */}
              <rect
                x={x - barW / 2} y={by}
                width={barW} height={Math.min(4, bh)}
                rx="3" fill={color}
              />

              {/* Tooltip */}
              {isActive && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={tx} y={ty} width={TW} height={TH} rx="7"
                    fill="#0f2d1a" stroke="rgba(74,222,128,0.4)" strokeWidth="1.2"
                    filter="drop-shadow(0 2px 8px rgba(0,0,0,0.5))"
                  />
                  <text
                    x={tx + TW / 2} y={ty + 17} textAnchor="middle"
                    fontSize="10" fill="rgba(134,239,172,0.75)" fontFamily="system-ui,sans-serif"
                  >
                    {d.label}
                  </text>
                  <text
                    x={tx + TW / 2} y={ty + 36} textAnchor="middle"
                    fontSize="12.5" fill="white" fontWeight="700" fontFamily="system-ui,sans-serif"
                  >
                    {d.count.toLocaleString('vi-VN')} tin
                  </text>
                </g>
              )}

              {/* X label */}
              <text
                x={x}
                y={padT + plotH + 14}
                textAnchor="middle"
                fontSize="8.5"
                fill={isActive ? color : 'rgba(134,239,172,0.45)'}
                fontFamily="system-ui,sans-serif"
              >
                {d.label.length > 9 ? d.label.slice(0, 8) + '…' : d.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1">
        {data.map((d, i) => (
          <button
            key={d.label}
            className="flex items-center gap-1.5 text-[10px] text-white/50 transition hover:text-white/80"
            onMouseEnter={() => setActiveIdx(i)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            {d.label.length > 18 ? d.label.slice(0, 16) + '…' : d.label}
          </button>
        ))}
      </div>
    </div>
  )
})
