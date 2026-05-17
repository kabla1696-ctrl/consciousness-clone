'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { LANGUAGES, TRANSLATIONS, type Language } from '../../lib/languages'
import { useT } from '../../lib/language-context'

export default function LanguagePage() {
  const [current, setCurrent] = useState('en')
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)
  const t = useT()

  useEffect(() => {
    const lang = localStorage.getItem('cc_language') || 'en'
    setCurrent(lang)
  }, [])

  const selectLanguage = (code: string) => {
    setCurrent(code)
    localStorage.setItem('cc_language', code)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Apply direction
    const lang = LANGUAGES.find(l => l.code === code)
    document.documentElement.dir = lang?.dir || 'ltr'
    document.documentElement.lang = code
  }

  const filtered = search
    ? LANGUAGES.filter(l => l.name.toLowerCase().includes(search.toLowerCase()) || l.native.toLowerCase().includes(search.toLowerCase()) || l.code.includes(search.toLowerCase()))
    : LANGUAGES

  const currentLang = LANGUAGES.find(l => l.code === current)
  const hasTranslation = (code: string) => !!TRANSLATIONS[code]
  const translationCoverage = (code: string) => {
    if (!TRANSLATIONS[code]) return 0
    return Math.round((Object.keys(TRANSLATIONS[code]).length / Object.keys(TRANSLATIONS['en']).length) * 100)
  }

  return (
    <main className="min-h-screen bg-[#050510] page-transition" style={{ background: 'linear-gradient(135deg, #050510, #080818, #0d0520)' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => <div key={i} className="absolute rounded-full" style={{ width: Math.random() * 4 + 1 + 'px', height: Math.random() * 4 + 1 + 'px', left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', background: ['rgba(59,130,246,0.4)', 'rgba(139,92,246,0.3)', 'rgba(99,102,241,0.3)'][i % 3], animation: `float${i % 3} ${8 + Math.random() * 12}s ease-in-out infinite`, animationDelay: Math.random() * 5 + 's' }} />)}
      </div>

      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/[0.06] safe-top" style={{ background: 'rgba(5,5,16,0.85)' }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.06] tap-feedback">←</Link>
          <span className="text-xl">🌍</span>
          <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">{t('language')}</span>
        </div>
      </header>

      <div className="px-4 py-6 pb-24 md:pb-8 relative z-10">
        {/* Current Language */}
        <div className="rounded-xl border border-blue-500/20 p-5 mb-6 backdrop-blur-xl" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.05), rgba(99,102,241,0.03))' }}>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{currentLang?.flag || '🌍'}</span>
            <div>
              <h2 className="text-lg font-bold">{currentLang?.native || 'English'}</h2>
              <p className="text-white/30 text-xs">{currentLang?.name} • {translationCoverage(current)}% {t('translated')}</p>
            </div>
          </div>
          {saved && (
            <div className="mt-3 flex items-center gap-2 text-emerald-400 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              {t('language saved')} {currentLang?.native}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search languages')} className="w-full p-3 pl-10 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm focus:outline-none focus:border-blue-500/40" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">🔍</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: t('total'), value: LANGUAGES.length, color: 'text-blue-400' },
            { label: t('full ui'), value: Object.keys(TRANSLATIONS).length, color: 'text-emerald-400' },
            { label: t('basic'), value: LANGUAGES.length - Object.keys(TRANSLATIONS).length, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] p-3 text-center backdrop-blur-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-white/30 text-[10px]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Language List */}
        <div className="space-y-2">
          {filtered.map(lang => {
            const isActive = current === lang.code
            const coverage = translationCoverage(lang.code)
            return (
              <button key={lang.code} onClick={() => selectLanguage(lang.code)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all tap-feedback ${isActive ? 'border-blue-500/30 bg-blue-500/5' : 'border-white/[0.06] bg-white/[0.02] hover:border-blue-500/20'}`}>
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <span className={`text-sm font-medium ${isActive ? 'text-blue-400' : 'text-white/80'}`}>{lang.native}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-white/20 text-[10px]">{lang.name}</span>
                    {coverage > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${coverage}%` }} />
                        </div>
                        <span className="text-white/10 text-[10px]">{coverage}%</span>
                      </div>
                    )}
                  </div>
                </div>
                {isActive && <span className="text-blue-400 text-sm">✓</span>}
                {lang.dir === 'rtl' && <span className="text-white/10 text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03]">RTL</span>}
              </button>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-white/30 text-sm">{t('no languages found')}</p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float0 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-30px); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-15px,20px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-15px); } }
      `}</style>
    </main>
  )
}