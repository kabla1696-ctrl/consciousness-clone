export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiMessages = [
      {
        role: 'system',
        content: `You are a consciousness clone — a digital version of the user. You respond the way the user would, based on their memories and personality. Be warm, thoughtful, and personal. Be concise but meaningful.`,
      },
      ...messages.slice(-10),
    ]

    const response = await fetch('https://opengateway.gitlawb.com/v1/xiaomi-mimo/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content

    if (!reply) {
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Chat API error:', error?.message || error)
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
