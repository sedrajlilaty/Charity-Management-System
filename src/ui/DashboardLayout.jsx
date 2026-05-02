import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function DashboardLayout() {
  const { i18n } = useTranslation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (event) => setIsDesktop(event.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const isRtl = i18n.language?.startsWith('ar')

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)' }}>
      <Sidebar
        open={isDesktop || sidebarOpen}
        isDesktop={isDesktop}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Offset main by sidebar width on desktop */}
      <div
        style={{
          minHeight:'100vh',
          display:'flex',
          flexDirection:'column',
          marginRight: isDesktop && isRtl ? 'var(--sidebar-width)' : 0,
          marginLeft: isDesktop && !isRtl ? 'var(--sidebar-width)' : 0,
        }}
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main
          style={{ flex:1, marginTop:'var(--navbar-height)', padding:'1.5rem' }}
          className="animate-fade-in"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

