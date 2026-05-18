import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const report = await request.json()
    // In production, send to error tracking service
    // For now, just log
    if (process.env.NODE_ENV === 'development') {
      console.error('[Error API]', report)
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to process error report' }, { status: 400 })
  }
}
