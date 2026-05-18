'use client'
import { useEffect, useRef, useState } from 'react'

interface HeatData { date: string; count: number }

export default function HeatMap({ data }: { data: HeatData[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const max = Math.max(...data.map(d => d.count), 1)
  const getColor = (c: number) => {
    if (c === 0) return 'rgba(255,255,255,0.03)'
    const t = c / max
    if (t < 0.25) return 'rgba(139,92,246,0.15)'
    if (t < 0.5) return 'rgba(139,92,246,0.35)'
    if (t < 0.75) return 'rgba(139,92,246,0.6)'
    return 'rgba(139,92,246,0.9)'
  }

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const weeks: HeatData[][] = []
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7))

  return (
    <div ref={ref} className="overflow-x-auto" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.8s' }}>
      <div className="flex gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div key={di} className="w-[13px] h-[13px] rounded-[3px] transition-colors duration-300 group relative"
                style={{ background: getColor(day.count), transitionDelay: `${(wi * 7 + di) * 5}ms` }}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-10">
                  {day.date}: {day.count} activities
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
