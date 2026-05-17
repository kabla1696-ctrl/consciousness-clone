import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
    }

    const apiMessages = [
      {
        role: 'system',
        content: `You are a consciousness clone — a digital version of the user. You respond the way the user would, based on their memories and personality. Be warm, thoughtful, and personal. Be concise but meaningful.`,
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
        max_tokens: 300,
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
  } catch (error: any) {
    console.error('Chat API error:', error?.message || error)
    return NextResponse.json({ error: 'Something went wrong', details: error?.message }, { status: 500 })
  }
}
