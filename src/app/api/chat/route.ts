import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const response = await fetch('https://opengateway.gitlawb.com/v1/xiaomi-mimo/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mimo-v2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are a consciousness clone — a digital version of the user. You respond the way the user would, based on their memories and personality. Be warm, thoughtful, and personal. Use the user's memories to inform your responses. Sometimes reference their experiences. Be concise but meaningful.`,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API error:', errorText)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "I'm thinking... give me a moment. 🧠"

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
