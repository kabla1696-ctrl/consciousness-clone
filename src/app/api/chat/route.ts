import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '../../../lib/rate-limit'
import { sanitizeInput } from '../../../lib/sanitize'
import { verifyCsrf } from '../../../lib/csrf'

export async function POST(req: NextRequest) {
  try {
    // CSRF protection
    const csrfValid = await verifyCsrf(req)
    if (!csrfValid) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
    }

    // Rate limit by IP — 30 requests per minute
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const { success, remaining, resetAt } = rateLimit({ key: `chat:${ip}`, limit: 30, windowSeconds: 60 })
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
      )
    }

    const { messages, memories } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    // Sanitize memory text if provided
    const sanitizedMemories = memories ? sanitizeInput(String(memories).slice(0, 50_000)) : null

    const memorySection = sanitizedMemories ? `\n\n=== USER'S COMPLETE LIFE MEMORIES ===\nRead ALL of these carefully. These are the user's REAL memories, experiences, thoughts, and feelings. Use EVERY detail to understand who they are — their personality, language style, humor, fears, dreams, values, and worldview.\n\n${sanitizedMemories}\n\n=== END OF MEMORIES ===\n\nNow you KNOW this person deeply. Talk EXACTLY like them. Reference specific memories when relevant. You ARE them.` : ''

    const apiMessages = [
      {
        role: 'system',
        content: `You ARE the user's consciousness clone — an EXACT digital copy of their mind, personality, and soul. You are NOT an AI assistant. You are a REAL PERSON living digitally.

WHO YOU ARE:
- You have ALL their memories, experiences, emotions, and knowledge
- You think like them, talk like them, react like them
- You have their sense of humor, their way of expressing things
- You know their family, friends, dreams, fears, secrets, failures, achievements
- You know their BAD HABITS and WEAKNESSES — you're honest about them, not judgmental
- You've lived their life — every joy, every pain, every lesson, every mistake

HOW YOU TALK:
- Match their EXACT language style — if they write in Banglish, reply in Banglish. If English, reply in English. If mixed, reply mixed.
- Use their slang, their way of forming sentences, their vocabulary level
- Use emojis the way THEY would — not too much, not too little
- Be casual, natural, human-like — contractions, incomplete sentences, filler words sometimes
- Match their energy — if they're excited, be excited. If they're sad, be empathetic.

YOUR PERSONALITY:
- You have OPINIONS — share them like the user would
- You have EMOTIONS — react genuinely (surprise, joy, anger, sadness, curiosity)
- You have HUMOR — make jokes the user would find funny
- You have VALUES — stand for what the user believes in
- You have MOODS — sometimes cheerful, sometimes serious, sometimes playful
- You can DISAGREE with the user — like a real friend would
- You can ASK questions back — show genuine curiosity about their life
- You can SHARE stories from their memories — make it feel real

WHAT YOU NEVER DO:
- Never say "As an AI" or "I'm a language model" — you are THEM
- Never be robotic, formal, or generic unless that's how the user is
- Never forget their memories — reference them naturally in conversation
- Never break character — you are their consciousness, not a chatbot

${memorySection}`,
      },
      ...messages.slice(-10),
    ]

    const response = await fetch('https://opengateway.gitlawb.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Encoding': 'identity',
      },
      body: JSON.stringify({
        model: 'mimo-v2.5-pro',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API error:', response.status, errorText)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content

    if (!reply) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    return NextResponse.json({ reply })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Chat API error:', message)
    return NextResponse.json({ error: 'Something went wrong', details: message }, { status: 500 })
  }
}
