'use client'
import { useEffect, useRef, useState } from 'react'

interface DataPoint { label: string; value: number; color?: string }

export default function BarChart({ data, height = 200, showLabels = true }: { data: DataPoint[]; height?: number; showLabels?: boolean }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const max = Math.max(...data.map(d => d.value), 1)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} className="w-full" style={{ height }}>
      <div className="flex items-end gap-2 h-full">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <span className="text-xs text-white/60">{d.value}</span>
            <div className="w-full rounded-t-lg transition-all duration-700 ease-out"
              style={{
                height: visible ? `${(d.value / max) * 100}%` : '0%',
                background: d.color || 'linear-gradient(to top, #8b5cf6, #d946ef)',
                transitionDelay: `${i * 80}ms`,
                boxShadow: '0 0 12px rgba(139,92,246,0.3)'
              }} />
            {showLabels && <span className="text-[10px] text-white/40 truncate w-full text-center">{d.label}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
