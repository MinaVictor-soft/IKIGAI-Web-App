import { useTranslation } from 'react-i18next'

export default function QuizzesPage() {
  const { t } = useTranslation()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('quizzes')}</h1>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border p-6 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between hover:border-primary transition"
          >
            <div className="flex-1 mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Quiz {i}</h3>
              <p className="text-text-muted text-sm">10 questions • 5 min</p>
            </div>
            <button className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition whitespace-nowrap">
              {t('startQuiz')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
