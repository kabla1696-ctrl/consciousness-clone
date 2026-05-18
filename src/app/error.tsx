'use client';

import { useEffect, useState } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#050510' }}>
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #ef4444, transparent)',
            top: '10%',
            right: '10%',
            animation: 'float-orb 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #7c3aed, transparent)',
            bottom: '10%',
            left: '10%',
            animation: 'float-orb 10s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Animated error icon */}
        <div
          className={`text-8xl mb-8 transition-all duration-1000 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
          }`}
          style={{ animation: mounted ? 'pulse-error 2s ease-in-out infinite' : 'none' }}
        >
          ⚠️
        </div>

        {/* Title */}
        <h1
          className={`text-4xl font-bold text-white mb-4 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Something went wrong
        </h1>

        {/* Description */}
        <p
          className={`text-gray-400 mb-3 transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          A neural misfire occurred in the consciousness matrix. Our synapses are working to restore connectivity.
        </p>

        {/* Error details (collapsible) */}
        {error.digest && (
          <p
            className={`text-sm text-gray-600 mb-8 font-mono transition-all duration-700 delay-400 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Error ID: {error.digest}
          </p>
        )}

        {/* Try Again button */}
        <button
          onClick={reset}
          className={`px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            transitionDelay: '500ms',
          }}
        >
          🔄 Try Again
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse-error {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
      `}</style>
    </div>
  );
}
