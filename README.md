# 🧠 Consciousness Clone

> Your digital consciousness, preserved forever.

## ✨ Features

### Core
- 💬 **AI Chat** — Talk to your digital clone
- 🔒 **Memory Vault** — Store your most precious memories
- 📰 **Social Feed** — Share moments with your clone
- 🎭 **Mood Tracker** — Track your emotional journey

### AI Features
- 🌐 **Clone Social** — Your clone's social presence
- 🧬 **Personality Quiz** — Understand your digital self
- 🌙 **Dream Lab** — Explore your subconscious
- 🎙️ **Voice Clone** — Preserve your voice
- 📖 **Clone Diary** — AI-powered journaling
- ✍️ **Clone Poet** — AI poetry generation
- 🎧 **Clone Podcast** — AI podcast creation

### Memory & Legacy
- 📚 **Life Story** — Your autobiography, AI-assisted
- 💌 **Legacy Letter** — Letters for the future
- ⏳ **Time Capsule** — Messages to your future self
- 🧬 **Memory DNA** — Your memory genome
- 🏆 **Achievements** — Unlock badges and milestones
- ❤️ **Relationships** — Map your connections

### Tools
- 📈 **Analytics** — Insights into your digital life
- 📅 **Calendar** — Memory timeline
- 💡 **Insights** — AI-powered analysis
- ☁️ **Backup** — Export/import your consciousness
- 🔔 **Notifications** — Stay connected
- ⚙️ **Settings** — Customize everything

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **AI**: OpenAI GPT-4
- **Mobile**: Capacitor 8 (iOS/Android)
- **Deployment**: Vercel
- **Testing**: Jest, Testing Library

## 📊 Stats

- **150+ pages** with loading + error boundaries
- **55+ components** — all integrated
- **80K+ lines** of TypeScript
- **38 unit tests** — all passing
- **45 languages** supported
- **0 console statements** in production
- **0 TypeScript errors**

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- pnpm

### Installation
```bash
git clone https://github.com/kabla1696-ctrl/consciousness-clone.git
cd consciousness-clone
pnpm install
```

### Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Required:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key

Optional:
- `OPENAI_API_KEY` — For AI features

### Development
```bash
pnpm dev
```

### Testing
```bash
pnpm test           # Run tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage
```

### Build
```bash
pnpm build
```

## 📱 Mobile

This app is also a mobile app using Capacitor:
```bash
npx cap add ios
npx cap add android
npx cap sync
```

## 🔒 Security

- Input sanitization (XSS prevention)
- Rate limiting on API routes
- CSRF protection
- Content Security Policy headers
- Supabase Row Level Security (RLS)
- Environment variable validation

## 🌍 Internationalization

45 languages supported with complete translations:
English, বাংলা, हिन्दी, Español, Français, Deutsch, العربية, 中文, 日本語, 한국어, and 36 more.

## 📄 License

MIT © Consciousness Clone Team
