import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { Zap, BookOpen, HelpCircle, Users } from 'lucide-react'

export default function HomePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  const features = [
    {
      icon: HelpCircle,
      title: 'Interactive Quizzes',
      description: 'Challenge yourself with engaging quizzes across various topics',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: 'Compete Globally',
      description: 'Compete with users worldwide and climb the leaderboards',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: BookOpen,
      title: 'Learn & Grow',
      description: 'Access educational publications and resources',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Zap,
      title: 'Earn XP Points',
      description: 'Earn rewards and track your progress in real-time',
      color: 'from-orange-500 to-red-500',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-secondary to-primary py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {t('welcomeBack')}, {user?.name}! 👋
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8">
            Keep learning, competing, and growing. Your journey continues here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary hover:bg-white/90 font-bold py-3 px-8 rounded-lg transition text-lg">
              {t('startQuiz')}
            </button>
            <button className="border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-lg transition text-lg">
              {t('scanQr')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-12">
          <div className="bg-surface border border-border/50 p-6 md:p-8 rounded-lg text-center hover:border-primary transition">
            <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{user?.xp || 0}</div>
            <p className="text-text-muted">{t('totalXp')}</p>
          </div>
          <div className="bg-surface border border-border/50 p-6 md:p-8 rounded-lg text-center hover:border-primary transition">
            <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">#{user?.rank || 0}</div>
            <p className="text-text-muted">{t('rank')}</p>
          </div>
          <div className="bg-surface border border-border/50 p-6 md:p-8 rounded-lg text-center hover:border-primary transition">
            <div className="text-4xl md:text-5xl font-bold text-success mb-2">100%</div>
            <p className="text-text-muted">{t('yourScore')}</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">{t('quickActions')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-surface border border-border rounded-lg p-6 hover:border-primary hover:shadow-lg transition duration-300 group cursor-pointer"
                >
                  <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition`}>
                    <Icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Recent Activity */}
          <div className="bg-surface border border-border rounded-lg p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-6">{t('recentQuizzes')}</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-background rounded-lg hover:border border-border transition">
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Quiz {i}</p>
                    <p className="text-sm text-text-muted">Completed on June {5 - i}, 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">85%</p>
                    <p className="text-sm text-text-muted">+50 XP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="bg-surface border border-border rounded-lg p-6 md:p-8">
            <h3 className="text-2xl font-bold mb-6">🏆 {t('leaderboard')}</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-background rounded-lg hover:border border-border transition">
                  <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                    {i}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">User {i}</p>
                    <p className="text-sm text-text-muted">Premium Member</p>
                  </div>
                  <p className="font-bold text-primary text-lg">{10000 - i * 1000} XP</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
