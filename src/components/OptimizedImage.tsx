'use client'

import { useState, useCallback, type ImgHTMLAttributes } from 'react'

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
  fallbackEmoji?: string
  blurDataURL?: string
}

export default function OptimizedImage({
  src,
  alt = '',
  fallbackEmoji = '🧠',
  blurDataURL,
  style,
  className,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleError = useCallback(() => setHasError(true), [])
  const handleLoad = useCallback(() => setIsLoaded(true), [])

  if (hasError || !src) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(217,70,239,0.15), rgba(6,182,212,0.1))',
          borderRadius: '12px',
          fontSize: '2rem',
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        {fallbackEmoji}
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: style?.borderRadius ?? '12px' }}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: blurDataURL
              ? `url(${blurDataURL}) center/cover no-repeat`
              : 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(217,70,239,0.06))',
            filter: blurDataURL ? 'blur(20px)' : undefined,
            transform: 'scale(1.1)',
            transition: 'opacity 0.4s ease',
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        className={className}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
          ...style,
        }}
        {...props}
      />
    </div>
  )
}
