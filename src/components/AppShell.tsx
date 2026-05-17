'use client'
import MobileNav from './MobileNav'
import DesktopNav from './DesktopNav'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DesktopNav />
      <div className="md:ml-[240px] transition-all duration-300">
        {children}
      </div>
      <MobileNav />
    </>
  )
}
