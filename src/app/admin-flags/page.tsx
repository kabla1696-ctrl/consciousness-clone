'use client'
import { useState } from 'react'
import { useFeatureFlags, FeatureFlag, DEFAULT_FLAGS } from '@/lib/feature-flags'
import { useABTesting } from '@/lib/ab-testing'

const FLAG_LABELS: Record<FeatureFlag, { label: string; description: string }> = {
  'new-dashboard': { label: 'New Dashboard', description: 'New dashboard design' },
  'ai-suggestions': { label: 'AI Suggestions', description: 'AI-powered suggestions' },
  'voice-mode': { label: 'Voice Mode', description: 'Voice features' },
  'beta-features': { label: 'Beta Features', description: 'Show beta features' },
  'simplified-ui': { label: 'Simplified UI', description: 'Simplified interface' },
}

export default function AdminFlagsPage() {
  const { flags, setFlag, resetFlags, exportFlags, importFlags } = useFeatureFlags()
  const { getAllExperiments, resetAssignments } = useABTesting()
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [copied, setCopied] = useState(false)

  const experiments = getAllExperiments()

  const handleExport = () => {
    navigator.clipboard.writeText(exportFlags())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = () => {
    importFlags(importText)
    setImportText('')
    setShowImport(false)
  }

  return (
    <div className="min-h-screen bg-[#050510] text-white px-4 py-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--accent-color, #8b5cf6)' }}>
          🚩 Feature Flags
        </h1>
        <p className="text-sm text-white/40 mb-8">Hidden admin panel — direct URL only</p>

        {/* Feature Flags */}
        <section className="glass-card p-5 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Flags
          </h2>
          <div className="space-y-3">
            {(Object.keys(DEFAULT_FLAGS) as FeatureFlag[]).map(flag => (
              <div key={flag} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <div className="text-sm font-medium">{FLAG_LABELS[flag].label}</div>
                  <div className="text-xs text-white/40">{FLAG_LABELS[flag].description}</div>
                </div>
                <button
                  onClick={() => setFlag(flag, !flags[flag])}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                    flags[flag] ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      flags[flag] ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* A/B Test Assignments */}
        <section className="glass-card p-5 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            A/B Test Assignments
          </h2>
          <div className="space-y-3">
            {experiments.map(({ experiment, assigned }) => (
              <div key={experiment.id} className="py-2 border-b border-white/5 last:border-0">
                <div className="text-sm font-medium">{experiment.id}</div>
                <div className="text-xs text-white/40 mt-1">
                  Variants: {experiment.variants.join(', ')}
                </div>
                <div className="mt-1">
                  <span
                    className="inline-block px-2 py-0.5 text-xs rounded-full"
                    style={{
                      background: 'var(--accent-color, #8b5cf6)',
                      color: 'white',
                    }}
                  >
                    {assigned ?? 'unassigned'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={resetAssignments}
            className="mt-4 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Reset all assignments
          </button>
        </section>

        {/* Actions */}
        <section className="glass-card p-5 mb-6">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
            Config
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {copied ? '✓ Copied!' : 'Export JSON'}
            </button>
            <button
              onClick={() => setShowImport(!showImport)}
              className="px-3 py-1.5 text-xs rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              Import JSON
            </button>
            <button
              onClick={resetFlags}
              className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
            >
              Reset All Flags
            </button>
          </div>

          {showImport && (
            <div className="mt-3">
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Paste flag JSON here..."
                className="w-full h-24 p-3 text-xs bg-black/30 border border-white/10 rounded-lg text-white/80 font-mono resize-none focus:outline-none focus:border-white/20"
              />
              <button
                onClick={handleImport}
                className="mt-2 px-3 py-1.5 text-xs rounded-lg transition-colors"
                style={{ background: 'var(--accent-color, #8b5cf6)', color: 'white' }}
              >
                Apply
              </button>
            </div>
          )}
        </section>

        {/* Current State Preview */}
        <section className="glass-card p-5">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Current State
          </h2>
          <pre className="text-xs text-white/60 font-mono overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(flags, null, 2)}
          </pre>
        </section>
      </div>
    </div>
  )
}
