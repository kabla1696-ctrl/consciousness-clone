'use client'
import { useRef, useState, useCallback } from 'react'

interface FileUploadProps {
  accept?: string
  maxSize?: number
  multiple?: boolean
  onUpload?: (files: File[]) => void
}

export default function FileUpload({ accept = '*', maxSize = 10 * 1024 * 1024, multiple = false, onUpload }: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((list: FileList | null) => {
    if (!list) return
    const valid = Array.from(list).filter(f => f.size <= maxSize)
    setFiles(valid)
    onUpload?.(valid)
  }, [maxSize, onUpload])

  return (
    <div className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 cursor-pointer ${
      dragging ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'
    }`} onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files) }}>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
      <div className="space-y-3">
        <div className="text-4xl">{dragging ? '📥' : '📁'}</div>
        <p className="text-white/70 font-medium">{dragging ? 'Drop here' : 'Drag & drop or click'}</p>
        <p className="text-white/40 text-xs">Max {Math.round(maxSize / 1024 / 1024)}MB</p>
      </div>
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-white/60 bg-white/5 rounded-lg px-3 py-2">
              <span>📄</span><span className="truncate flex-1">{f.name}</span>
              <span className="text-white/30 text-xs">{(f.size / 1024).toFixed(0)}KB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
