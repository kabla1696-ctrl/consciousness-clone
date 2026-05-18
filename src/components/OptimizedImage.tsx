'use client'

import { useState, useCallback } from 'react'
import Image, { type ImageProps } from 'next/image'

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallbackEmoji?: string
}

export default function OptimizedImage({
  src,
  alt = '',
  fallbackEmoji = '🧠',
  className,
  style,
  fill,
  width,
  height,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleError = useCallback(() => setHasError(true), [])
  const handleLoad = useCallback(() => setIsLoaded(true), [])

  const srcString = typeof src === 'string' ? src : ''

  // Data/blob URLs can't be optimized by Next.js — use plain <img>
  const isUnoptimizable = srcString.startsWith('data:') || srcString.startsWith('blob:')

  if (hasError || !src) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(217,70,239,0.15), rgba(6,182,212,0.1))',
          borderRadius: style?.borderRadius ?? '12px',
          fontSize: '2rem',
          ...(fill ? { position: 'absolute' as const, inset: 0 } : {}),
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        {fallbackEmoji}
      </div>
    )
  }

  // Wrapper needed for blur placeholder when using next/image
  const wrapperStyle: React.CSSProperties = fill
    ? { position: 'relative', width: '100%', height: '100%' }
    : {}

  return (
    <div style={wrapperStyle}>
      {/* Blur placeholder while loading */}
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(217,70,239,0.06))',
            borderRadius: style?.borderRadius ?? '12px',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {isUnoptimizable ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={srcString}
          alt={alt}
          loading={priority ? undefined : 'lazy'}
          decoding="async"
          onError={handleError}
          onLoad={handleLoad}
          className={className}
          style={{
            display: 'block',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
            ...(fill ? { width: '100%', height: '100%', objectFit: 'cover' as const, position: 'absolute' as const, inset: 0 } : {}),
            ...style,
          }}
          {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          decoding="async"
          onError={handleError}
          onLoad={handleLoad}
          className={className}
          style={{
            display: 'block',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
            ...style,
          }}
          {...props}
        />
      )}
    </div>
  )
}
