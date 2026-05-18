'use client'
import React from 'react'
import { escapeHtml } from '../lib/sanitize'

function parseInline(text: string): string {
  // Escape HTML first to prevent XSS, then apply markdown transforms
  const safe = escapeHtml(text)
  return safe
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-violet-300 text-sm font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-violet-400 underline hover:text-violet-300" target="_blank" rel="noopener">$1</a>')
}

export default function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let inCode = false, codeLines: string[] = []

  lines.forEach((line, i) => {
    if (line.startsWith('```')) {
      if (inCode) {
        elements.push(<pre key={i} className="my-3 p-4 rounded-xl bg-black/40 border border-white/5 overflow-x-auto"><code className="text-sm text-emerald-300 font-mono">{codeLines.join('\n')}</code></pre>)
        inCode = false; codeLines = []
      } else { inCode = true }
      return
    }
    if (inCode) { codeLines.push(line); return }
    if (line.startsWith('# ')) elements.push(<h1 key={i} className="text-2xl font-bold text-white mt-4 mb-2">{parseInline(line.slice(2))}</h1>)
    else if (line.startsWith('## ')) elements.push(<h2 key={i} className="text-xl font-semibold text-white/90 mt-3 mb-1.5">{parseInline(line.slice(3))}</h2>)
    else if (line.startsWith('### ')) elements.push(<h3 key={i} className="text-lg font-medium text-white/80 mt-2 mb-1">{parseInline(line.slice(4))}</h3>)
    else if (line.startsWith('> ')) elements.push(<blockquote key={i} className="my-2 pl-4 border-l-2 border-violet-500/50 text-white/60 italic">{parseInline(line.slice(2))}</blockquote>)
    else if (line.startsWith('- ') || line.startsWith('* ')) elements.push(<li key={i} className="ml-4 text-white/80 list-disc">{parseInline(line.slice(2))}</li>)
    else if (/^\d+\.\s/.test(line)) elements.push(<li key={i} className="ml-4 text-white/80 list-decimal">{parseInline(line.replace(/^\d+\.\s/, ''))}</li>)
    else if (line.trim() === '') elements.push(<br key={i} />)
    else elements.push(<p key={i} className="text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: parseInline(line) }} />)
  })

  return <div className="prose prose-invert max-w-none text-sm leading-relaxed">{elements}</div>
}
