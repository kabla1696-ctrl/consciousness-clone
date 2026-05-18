'use client'
import React, { useEffect, useState } from 'react'

interface CountdownProps {
  targetDate: string | number
  label?: string
  onComplete?: () => void
}

function getTimeLeft(target: number) {
  const diff = target - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  return {
    days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000), done: false
  }
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-20 rounded-xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
        <span className="text-3xl font-bold text-white font-mono tabular-nums">{String(value).padStart(2, '0')}</span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
      </div>
      <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
    </div>
  )
}

const CountdownTimer = React.memo(function CountdownTimer({ targetDate, label, onComplete }: CountdownProps) {
  const target = typeof targetDate === 'string' ? new Date(targetDate).getTime() : targetDate
  const [time, setTime] = useState(() => getTimeLeft(target))

  useEffect(() => {
    const id = setInterval(() => {
      const t = getTimeLeft(target)
      setTime(t)
      if (t.done) { clearInterval(id); onComplete?.() }
    }, 1000)
    return () => clearInterval(id)
  }, [target, onComplete])

  if (time.done) return (
    <div className="text-center py-4"><span className="text-3xl">🎉</span><p className="text-white/60 mt-2">Time&apos;s up!</p></div>
  )

  return (
    <div className="flex flex-col items-center gap-4">
      {label && <p className="text-white/50 text-sm">{label}</p>}
      <div className="flex gap-3">
        <FlipUnit value={time.days} label="Days" />
        <div className="text-2xl text-white/20 self-start mt-6">:</div>
        <FlipUnit value={time.hours} label="Hours" />
        <div className="text-2xl text-white/20 self-start mt-6">:</div>
        <FlipUnit value={time.minutes} label="Min" />
        <div className="text-2xl text-white/20 self-start mt-6">:</div>
        <FlipUnit value={time.seconds} label="Sec" />
      </div>
    </div>
  )
})

export default CountdownTimer
