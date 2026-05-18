export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#050510' }}>
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #7c3aed, transparent)',
            top: '20%',
            left: '30%',
            animation: 'float-orb 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #a855f7, transparent)',
            bottom: '20%',
            right: '25%',
            animation: 'float-orb 8s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6">
        {/* Neural network animation */}
        <div className="relative w-32 h-32 mx-auto mb-10">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-violet-500/30"
            style={{ animation: 'spin-slow 4s linear infinite' }}
          />
          {/* Middle ring */}
          <div
            className="absolute inset-3 rounded-full border-2 border-purple-500/40"
            style={{ animation: 'spin-slow 3s linear infinite reverse' }}
          />
          {/* Inner ring */}
          <div
            className="absolute inset-6 rounded-full border-2 border-violet-400/50"
            style={{ animation: 'spin-slow 2s linear infinite' }}
          />
          {/* Brain emoji center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
              🧠
            </span>
          </div>
          {/* Orbiting dots */}
          <div
            className="absolute inset-0"
            style={{ animation: 'spin-slow 3s linear infinite' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
          </div>
          <div
            className="absolute inset-0"
            style={{ animation: 'spin-slow 5s linear infinite reverse' }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-lg shadow-purple-400/50" />
          </div>
        </div>

        {/* Loading text */}
        <h2
          className="text-xl font-medium text-white mb-3"
          style={{ animation: 'fade-text 2s ease-in-out infinite' }}
        >
          Loading consciousness...
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-500">
          Establishing neural pathways
        </p>

        {/* Gradient progress bar */}
        <div className="mt-8 w-48 h-1 mx-auto rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc, #a855f7, #7c3aed)',
              backgroundSize: '200% 100%',
              animation: 'shimmer-bar 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
        @keyframes fade-text {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes shimmer-bar {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
      `}</style>
    </div>
  );
}
