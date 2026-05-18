import { NextResponse } from 'next/server'
import { rateLimit } from '../../../lib/rate-limit'
import { sanitizeInput } from '../../../lib/sanitize'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = rateLimit({ key: ip, limit: 3, windowSeconds: 60 })
  
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  
  try {
    const { message, email } = await request.json()
    const cleanMessage = sanitizeInput(message)
    const cleanEmail = sanitizeInput(email || '')
    
    // In production, send to email or database
    return NextResponse.json({ success: true, message: 'Feedback received' })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
