'use client'

import { useState, useRef, useCallback } from 'react'

export interface GalleryImage {
  src: string
  alt?: string
  id?: string
}

interface ImageGalleryProps {
  images: GalleryImage[]
  onUpload?: (files: File[]) => void
  onDelete?: (index: number) => void
  columns?: number
  maxUploadSize?: number
}

export default function ImageGallery({
  images,
  onUpload,
  onDelete,
  columns = 3,
  maxUploadSize = 10 * 1024 * 1024,
}: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null))
  }, [images.length])

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + images.length) % images.length : null
    )
  }, [images.length])

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const valid = Array.from(files).filter(
        (f) => f.type.startsWith('image/') && f.size <= maxUploadSize
      )
      if (valid.length > 0) onUpload?.(valid)
    },
    [maxUploadSize, onUpload]
  )

  const handleDelete = (index: number) => {
    if (deleteConfirm === index) {
      onDelete?.(index)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(index)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  // Keyboard navigation for lightbox
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (lightboxIndex === null) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') goNext()
    if (e.key === 'ArrowLeft') goPrev()
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Upload zone */}
      {onUpload && (
        <div
          className={`relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-300 cursor-pointer ${
            dragging
              ? 'border-violet-500 bg-violet-500/10'
              : 'border-white/10 bg-white/[0.03] hover:border-white/20'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            handleFiles(e.dataTransfer.files)
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
          />
          <div className="space-y-2">
            <div className="text-3xl">{dragging ? '📥' : '🖼️'}</div>
            <p className="text-white/60 text-sm font-medium">
              {dragging ? 'Drop images here' : 'Drag & drop or click to upload'}
            </p>
            <p className="text-white/30 text-xs">
              Max {Math.round(maxUploadSize / 1024 / 1024)}MB per image
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      {images.length > 0 ? (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {images.map((img, i) => (
            <div
              key={img.id ?? i}
              className="group relative aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] cursor-pointer"
              onClick={() => openLightbox(i)}
            >
              <img
                src={img.src}
                alt={img.alt ?? ''}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Delete button */}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(i)
                  }}
                  className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                    deleteConfirm === i
                      ? 'bg-red-500 text-white scale-110'
                      : 'bg-black/50 text-white/70 opacity-0 group-hover:opacity-100 hover:bg-red-500/80'
                  }`}
                  title={deleteConfirm === i ? 'Click again to confirm' : 'Delete'}
                >
                  {deleteConfirm === i ? '✓' : '✕'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        !onUpload && (
          <div className="text-center py-12 text-white/30">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm">No images yet</p>
          </div>
        )
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
          >
            ✕
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/50 text-sm z-10">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Previous */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev() }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              ‹
            </button>
          )}

          {/* Image */}
          <img
            src={images[lightboxIndex].src}
            alt={images[lightboxIndex].alt ?? ''}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext() }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  )
}
