'use client'
export default function Loading() {
  return (
    <div className="min-h-screen p-6 md:p-10" style={{ background: '#050510' }}>
      <div className="mb-8">
        <div className="h-8 w-48 rounded-lg bg-white/5 animate-pulse mb-3" />
        <div className="h-4 w-72 rounded-lg bg-white/3 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
