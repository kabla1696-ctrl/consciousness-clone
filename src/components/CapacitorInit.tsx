'use client'

import { useEffect } from 'react'

export default function CapacitorInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if running in Capacitor
    const ua = navigator.userAgent || ''
    const isNative = ua.includes('Capacitor') || ua.includes('Android')

    const init = async () => {
      // Status bar
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar')
        await StatusBar.setStyle({ style: Style.Dark })
        await StatusBar.setBackgroundColor({ color: '#050510' })
        await StatusBar.setOverlaysWebView({ overlay: false })
      } catch (e) {}

      // Splash screen
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen')
        await SplashScreen.hide()
      } catch (e) {}

      // Keyboard
      try {
        const { Keyboard } = await import('@capacitor/keyboard')
        
        Keyboard.addListener('keyboardWillShow', () => {
          document.body.classList.add('keyboard-open')
        })
        
        Keyboard.addListener('keyboardWillHide', () => {
          document.body.classList.remove('keyboard-open')
        })
      } catch (e) {}

      // Back button
      try {
        const { App } = await import('@capacitor/app')
        
        App.addListener('backButton', ({ canGoBack }) => {
          const path = window.location.pathname
          
          // Main screens — exit app
          if (path === '/' || path === '/login' || path === '/signup') {
            App.exitApp()
            return
          }
          
          // Dashboard — exit app
          if (path === '/dashboard' || path === '/dashboard/') {
            App.exitApp()
            return
          }
          
          // Other screens — go back
          if (canGoBack) {
            window.history.back()
          } else {
            window.location.href = '/dashboard'
          }
        })
      } catch (e) {}

      // Network status
      try {
        const { Network } = await import('@capacitor/network')
        
        Network.addListener('networkStatusChange', (status) => {
          if (!status.connected) {
            // Show offline toast
            const toast = document.createElement('div')
            toast.className = 'offline-toast'
            toast.textContent = '📵 You are offline'
            document.body.appendChild(toast)
            setTimeout(() => toast.remove(), 3000)
          }
        })
      } catch (e) {}
    }

    init()

    // Add native-like page transitions
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a[href]') as HTMLAnchorElement
      
      if (link && link.href.startsWith(window.location.origin)) {
        e.preventDefault()
        const href = link.getAttribute('href') || '/'
        
        // Add transition class
        document.body.classList.add('page-exit')
        
        setTimeout(() => {
          window.location.href = href
        }, 150)
      }
    }

    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
  }, [])

  return null
}
