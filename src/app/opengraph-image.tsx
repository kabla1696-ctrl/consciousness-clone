import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Consciousness Clone'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050510',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient orbs */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            right: '-100px',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.25) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Neural network dots */}
        {[
          { x: 150, y: 180, r: 4 },
          { x: 280, y: 120, r: 3 },
          { x: 420, y: 200, r: 5 },
          { x: 550, y: 100, r: 3 },
          { x: 700, y: 170, r: 4 },
          { x: 850, y: 130, r: 3 },
          { x: 950, y: 220, r: 4 },
          { x: 1050, y: 150, r: 3 },
          { x: 200, y: 450, r: 3 },
          { x: 350, y: 500, r: 4 },
          { x: 500, y: 470, r: 3 },
          { x: 650, y: 520, r: 5 },
          { x: 800, y: 480, r: 3 },
          { x: 950, y: 440, r: 4 },
          { x: 1050, y: 510, r: 3 },
        ].map((dot, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${dot.x}px`,
              top: `${dot.y}px`,
              width: `${dot.r * 2}px`,
              height: `${dot.r * 2}px`,
              borderRadius: '50%',
              background: `rgba(99,102,241,${0.3 + (i % 3) * 0.15})`,
              boxShadow: `0 0 ${dot.r * 3}px rgba(99,102,241,0.4)`,
            }}
          />
        ))}

        {/* Brain emoji */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '20px',
            filter: 'drop-shadow(0 0 30px rgba(168,85,247,0.5))',
          }}
        >
          🧠
        </div>

        {/* Title with gradient */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 40%, #e879f9 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            letterSpacing: '-2px',
            textAlign: 'center',
            lineHeight: 1.1,
          }}
        >
          Consciousness Clone
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: 'rgba(255,255,255,0.6)',
            marginTop: '20px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Your digital consciousness, living forever
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            width: '200px',
            height: '3px',
            borderRadius: '2px',
            background: 'linear-gradient(90deg, transparent, #818cf8, #a78bfa, transparent)',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}
