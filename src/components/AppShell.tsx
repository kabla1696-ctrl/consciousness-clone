'use client'
import MobileNav from './MobileNav'
import DesktopNav from './DesktopNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopNav />
      <div className="md:ml-[240px] transition-all duration-300 min-h-screen pb-20 md:pb-0 overflow-y-auto">
        {children}
      </div>
      <MobileNav />
    </>
  )
}
