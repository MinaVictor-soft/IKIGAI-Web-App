import { useTranslation } from 'react-i18next'

export default function InfoPage() {
  const { t } = useTranslation()

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

        <div className="bg-surface border border-border p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">{t('version')}</h2>
          <p className="text-text-muted">1.0.0</p>
        </div>
      </div>
    </div>
  )
}
