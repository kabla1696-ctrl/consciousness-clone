'use client'
import { useEffect, useRef, useState } from 'react'

interface DataPoint { label: string; value: number; color: string }

export default function PieChart({ data }: { data: DataPoint[] }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const r = 70, cx = 100, cy = 100
  let cumAngle = 0

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const slices = data.map((d) => {
    const angle = (d.value / total) * 360
    const startAngle = cumAngle
    cumAngle += angle
    const largeArc = angle > 180 ? 1 : 0
    const sr = (Math.PI * startAngle) / 180, er = (Math.PI * (startAngle + angle)) / 180
    const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr)
    const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er)
    return { ...d, d: `M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z` }
  })

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <svg viewBox="0 0 200 200" className="w-48 h-48" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s' }}>
        <circle cx={cx} cy={cy} r={r + 10} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="20" />
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} opacity={visible ? 0.9 : 0}
            style={{ transition: `opacity 0.5s ${i * 120}ms`, filter: 'drop-shadow(0 0 6px rgba(139,92,246,0.3))' }} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)">total</text>
      </svg>
      <div className="flex flex-wrap gap-3 justify-center">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-xs text-white/60">{d.label} ({Math.round((d.value / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}
