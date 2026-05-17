'use client'

import { useEffect } from 'react'

export default function CapacitorInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Only run on native platforms
    const ua = navigator.userAgent || ''
    const isNative = ua.includes('Capacitor') || ua.includes('Android')
    if (!isNative) return

    const initCapacitor = async () => {
      try {
        const { App } = await import('@capacitor/app')
        
        // Handle back button
        App.addListener('backButton', ({ canGoBack }) => {
          const path = window.location.pathname
          if (path === '/' || path === '/login' || path === '/dashboard') {
            App.exitApp()
          } else if (canGoBack) {
            window.history.back()
          } else {
            window.location.href = '/dashboard'
          }
        })
      } catch (e) {
        // Not on native
      }

      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar')
        await StatusBar.setStyle({ style: Style.Dark })
        await StatusBar.setBackgroundColor({ color: '#050510' })
      } catch (e) {
        // Not on native
      }

      try {
        const { SplashScreen } = await import('@capacitor/splash-screen')
        await SplashScreen.hide()
      } catch (e) {
        // Not on native
      }
    }

    initCapacitor()
  }, [])

  return null
}
