'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase-browser'

export default function AppRedirect() {
  useEffect(() => {
    const ua = navigator.userAgent || ''
    const isNative = ua.includes('Capacitor') || ua.includes('Android')
    
    if (!isNative) return

    // Running in native app — redirect to dashboard or login
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/login'
      }
    }
    
    checkAuth()
  }, [])

  return null
}
