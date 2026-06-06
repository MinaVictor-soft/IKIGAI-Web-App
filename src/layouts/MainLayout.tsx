import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useLang } from '../contexts/LangContext'
import Sidebar from '../components/Sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { language, setLanguage, isRTL } = useLang()
  const { t } = useTranslation()
  const location = useLocation()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en'
    setLanguage(newLang)
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPath={location.pathname}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="bg-surface border-b border-border sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-4 md:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:bg-background rounded-lg transition"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-primary hidden sm:block">IKIGAI Quest</h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="px-3 py-2 rounded-lg bg-background hover:bg-border transition text-sm font-medium"
              >
                {language === 'en' ? 'عربي' : 'EN'}
              </button>

              {/* Settings */}
              <button
                onClick={() => navigate('/settings')}
                className="p-2 hover:bg-background rounded-lg transition hidden sm:block"
                title={t('settings')}
              >
                <Settings size={20} />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-background rounded-lg transition text-error"
                title={t('logout')}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="w-full h-full">{children}</div>
        </main>
      </div>
    </div>
  )
}
