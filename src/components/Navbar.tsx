import { useNavigate } from 'react-router-dom'
import {
  Home,
  User,
  Calendar,
  Book,
  HelpCircle,
  Trophy,
  QrCode,
  Info,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const TABS = [
  { name: 'home', path: '/', icon: Home },
  { name: 'profile', path: '/profile', icon: User },
  { name: 'events', path: '/events', icon: Calendar },
  { name: 'library', path: '/library', icon: Book },
  { name: 'quizzes', path: '/quizzes', icon: HelpCircle },
  { name: 'sports', path: '/sports', icon: Trophy },
  { name: 'scanQr', path: '/scan', icon: QrCode },
  { name: 'info', path: '/info', icon: Info },
]

interface NavbarProps {
  currentPath: string
}

export default function Navbar({ currentPath }: NavbarProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <nav className="bg-surface border-t border-border md:border-none">
      <div className="flex justify-around gap-2 px-2 py-4 md:flex-col md:gap-1">
        {TABS.map(({ name, path, icon: Icon }) => {
          const isActive = currentPath === path
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg transition font-medium text-sm ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:bg-background'
              }`}
              title={t(name)}
            >
              <Icon size={20} />
              <span className="hidden md:inline text-xs md:text-sm">{t(name)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
