import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Consciousness Clone'
  const description = searchParams.get('description') || 'Your digital consciousness'
  
  return NextResponse.json({ title, description })
}
