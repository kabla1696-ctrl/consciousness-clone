'use client'
export default function ChatError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">💬❌</div>
        <h2 className="text-xl font-semibold text-white mb-2">Chat Error</h2>
        <p className="text-white/40 text-sm mb-6">Your conversation couldn&apos;t load.</p>
        <button onClick={reset} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all">Try Again</button>
      </div>
    </div>
  )
}
