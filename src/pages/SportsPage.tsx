import { useTranslation } from 'react-i18next'

export default function SportsPage() {
  const { t } = useTranslation()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('sports')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border p-6 rounded-lg hover:border-primary transition"
          >
            <div className="bg-gradient-to-r from-primary to-secondary h-32 rounded-lg mb-4" />
            <h3 className="text-xl font-bold mb-2">Match {i}</h3>
            <p className="text-text-muted mb-4">Team A vs Team B</p>
            <button className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition text-sm">
              {t('viewDetails')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
