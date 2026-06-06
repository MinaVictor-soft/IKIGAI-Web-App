import { useTranslation } from 'react-i18next'

export default function EventsPage() {
  const { t } = useTranslation()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('events')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border p-6 rounded-lg hover:border-primary transition cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">Event {i}</h3>
            <p className="text-text-muted mb-4">Coming soon...</p>
            <button className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition text-sm">
              {t('details')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
