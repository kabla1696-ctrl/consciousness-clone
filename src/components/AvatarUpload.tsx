'use client'

import { useRef, useState, useCallback } from 'react'
import { uploadFile, getPublicUrl, STORAGE_BUCKETS } from '@/lib/storage'

interface AvatarUploadProps {
  userId: string
  currentAvatar?: string | null
  onUpload?: (url: string) => void
  size?: number
  name?: string
}

export default function AvatarUpload({
  userId,
  currentAvatar,
  onUpload,
  size = 96,
  name,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : userId.slice(0, 2).toUpperCase()

  /** Center-crop a file to a square and return a Blob */
  const cropToSquare = useCallback((file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        const canvas = canvasRef.current ?? document.createElement('canvas')
        canvas.width = side
        canvas.height = side
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas not supported'))
        ctx.drawImage(img, sx, sy, side, side, 0, 0, side, side)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('Crop failed'))),
          'image/webp',
          0.85
        )
      }
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = url
    })
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      setError(null)
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be under 5 MB')
        return
      }

      // Show preview
      const previewUrl = URL.createObjectURL(file)
      setPreview(previewUrl)

      setUploading(true)
      try {
        const cropped = await cropToSquare(file)
        const path = `${userId}/avatar-${Date.now()}.webp`
        const { error: uploadErr } = await uploadFile(
          STORAGE_BUCKETS.avatars,
          path,
          cropped,
          { contentType: 'image/webp', upsert: true }
        )
        if (uploadErr) throw new Error(uploadErr)

        const publicUrl = getPublicUrl(STORAGE_BUCKETS.avatars, path)
        URL.revokeObjectURL(previewUrl)
        setPreview(publicUrl)
        onUpload?.(publicUrl)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setError(msg)
        setPreview(null)
      } finally {
        setUploading(false)
      }
    },
    [userId, cropToSquare, onUpload]
  )

  const displaySrc = preview ?? currentAvatar

  return (
    <div className="relative inline-flex flex-col items-center gap-2">
      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Avatar circle */}
      <div
        className="group relative cursor-pointer rounded-full overflow-hidden"
        style={{ width: size, height: size }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files?.[0]
          if (file) handleFile(file)
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload avatar image"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
      >
        {displaySrc ? (
          <img
            src={displaySrc}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white font-semibold"
            style={{
              background:
                'linear-gradient(135deg, rgba(139,92,246,0.6), rgba(217,70,239,0.5), rgba(6,182,212,0.4))',
              fontSize: size * 0.36,
            }}
          >
            {initials}
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            dragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
        >
          {uploading ? (
            <div
              className="border-2 border-white/30 border-t-white rounded-full animate-spin"
              style={{ width: size * 0.28, height: size * 0.28 }}
            />
          ) : (
            <svg
              width={size * 0.3}
              height={size * 0.3}
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
        </div>

        {/* Drag highlight ring */}
        {dragging && (
          <div className="absolute inset-0 rounded-full ring-2 ring-violet-400 ring-offset-2 ring-offset-transparent" />
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      {error && (
        <p className="text-xs text-red-400 max-w-[200px] text-center">{error}</p>
      )}
    </div>
  )
}
