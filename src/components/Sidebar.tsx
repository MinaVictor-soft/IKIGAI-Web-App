import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import {
  Home,
  User,
  Calendar,
  Book,
  HelpCircle,
  Medal,
  Trophy,
  QrCode,
  Info,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLang } from '../contexts/LangContext'
import { getNavConfig, onNavConfigChange, type NavConfig } from '../lib/navConfig'

const ALL_TABS = [
  { name: 'home', path: '/', icon: Home, configKey: 'dashboard' as const },
  { name: 'profile', path: '/profile', icon: User, configKey: 'profile' as const },
  { name: 'leaderboard', path: '/leaderboard', icon: Medal, configKey: 'leaderboard' as const },
  { name: 'events', path: '/events', icon: Calendar, configKey: 'events' as const },
  { name: 'quizzes', path: '/quizzes', icon: HelpCircle, configKey: 'quizzes' as const },
  { name: 'library', path: '/library', icon: Book, configKey: 'library' as const },
  { name: 'sports', path: '/sports', icon: Trophy, configKey: 'sports' as const },
  { name: 'scanQr', path: '/scan', icon: QrCode, configKey: 'scanQr' as const },
  { name: 'info', path: '/info', icon: Info, configKey: 'info' as const },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  currentPath: string
}

export default function Sidebar({ isOpen, onClose, currentPath }: SidebarProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { isRTL } = useLang()
  const [navConfig, setNavConfig] = useState<NavConfig>(getNavConfig())

  // Listen for nav config changes from admin dashboard
  useEffect(() => {
    const unsubscribe = onNavConfigChange((config) => {
      setNavConfig(config)
    })
    return unsubscribe
  }, [])

  // Filter tabs based on nav config
  const TABS = ALL_TABS.filter(tab => navConfig[tab.configKey] !== false)

  const handleNavigate = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-surface border-r border-border flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">IKIGAI</h1>
          <p className="text-sm text-text-muted mt-1">Quest</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {TABS.map(({ name, path, icon: Icon }) => {
            const isActive = currentPath === path
            return (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-background'
                }`}
              >
                <Icon size={20} />
                <span>{t(name)}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-0 z-30 md:hidden w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
        }`}
        style={isRTL ? { right: 0 } : { left: 0 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary">IKIGAI Quest</h1>
          <button onClick={onClose} className="p-2 hover:bg-background rounded-lg">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {TABS.map(({ name, path, icon: Icon }) => {
            const isActive = currentPath === path
            return (
              <button
                key={path}
                onClick={() => handleNavigate(path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-text hover:bg-background'
                }`}
              >
                <Icon size={20} />
                <span>{t(name)}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
