'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#050510' }}>
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #7c3aed, transparent)',
            top: '-10%',
            left: '-10%',
            animation: 'float-orb 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[100px]"
          style={{
            background: 'radial-gradient(circle, #a855f7, transparent)',
            bottom: '-5%',
            right: '-5%',
            animation: 'float-orb 10s ease-in-out infinite reverse',
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Animated brain emoji */}
        <div
          className={`text-8xl mb-8 transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          style={{ animation: mounted ? 'float-brain 3s ease-in-out infinite' : 'none' }}
        >
          🧠
        </div>

        {/* 404 gradient text */}
        <h1
          className={`text-8xl font-bold mb-4 transition-all duration-700 delay-200 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          404
        </h1>

        {/* Page not found */}
        <h2
          className={`text-2xl font-semibold text-white mb-3 transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Page Not Found
        </h2>

        <p
          className={`text-gray-400 mb-8 transition-all duration-700 delay-400 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          This neural pathway doesn&apos;t exist. The consciousness you&apos;re looking for has wandered elsewhere.
        </p>

        {/* Search bar */}
        <div
          className={`mb-8 transition-all duration-700 delay-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="Search features..."
              className="w-full px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
            />
            <svg
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Go Home button */}
        <Link
          href="/"
          className={`inline-block px-8 py-3.5 rounded-xl font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            transitionDelay: '600ms',
          }}
        >
          ← Go Home
        </Link>
      </div>

      <style jsx>{`
        @keyframes float-brain {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-orb {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }
      `}</style>
    </div>
  );
}
