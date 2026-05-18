'use client'
import { useEffect, useRef, useState } from 'react'

interface DataPoint { label: string; value: number }

export default function LineChart({ data, color = '#8b5cf6', height = 200 }: { data: DataPoint[]; color?: string; height?: number }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const max = Math.max(...data.map(d => d.value), 1)
  const w = 400
  const h = height - 40
  const points = data.map((d, i) => ({ x: (i / (data.length - 1 || 1)) * w, y: h - (d.value / max) * h }))
  const pathD = points.length > 1 ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` : ''

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      <svg viewBox={`0 0 ${w} ${h + 30}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {pathD && (
          <>
            <path d={`${pathD} L ${w},${h} L 0,${h} Z`} fill="url(#lineGrad)" opacity={visible ? 1 : 0} style={{ transition: 'opacity 1s' }} />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray={visible ? '0' : '1000'} strokeDashoffset={visible ? '0' : '1000'}
              style={{ transition: 'stroke-dasharray 1.5s ease-out, stroke-dashoffset 1.5s ease-out' }} />
          </>
        )}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} opacity={visible ? 1 : 0}
            style={{ transition: `opacity 0.5s ${i * 100}ms` }} />
        ))}
        {data.map((d, i) => (
          <text key={i} x={points[i]?.x} y={h + 20} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.35)">{d.label}</text>
        ))}
      </svg>
    </div>
  )
}
