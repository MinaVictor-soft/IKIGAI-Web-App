import { useTranslation } from 'react-i18next'

export default function InfoPage() {
  const { t } = useTranslation()

  const openLink = (url: string) => {
    window.open(url, '_blank')
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('info')}</h1>

      <div className="space-y-8">
        <div className="bg-surface border border-border p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{t('aboutApp')}</h2>
          <p className="text-text-muted leading-relaxed">
            IKIGAI Quest is a comprehensive platform for learning, competing, and growing.
            Engage with quizzes, attend events, and track your progress on our leaderboards.
          </p>
        </div>

        <div className="bg-surface border border-border p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{t('contact')}</h2>
          <p className="text-text-muted">
            Email: support@ikigaiquest.com
          </p>
        </div>

        {/* Social Media Links */}
        <div className="bg-surface border border-border p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Follow Us</h2>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => openLink('https://www.facebook.com/lagnetsanawy')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button
              onClick={() => openLink('https://www.youtube.com/@lagnetsanawy8545')}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </button>
          </div>
        </div>

        <div className="bg-surface border border-border p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{t('version')}</h2>
          <p className="text-text-muted">1.0.0</p>
        </div>
      </div>
    </div>
  )
}
