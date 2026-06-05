import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('profile')}</h1>

      <div className="bg-surface border border-border p-8 rounded-lg max-w-2xl">
        <div className="space-y-6">
          <div>
            <p className="text-text-muted text-sm mb-1">{t('name')}</p>
            <p className="text-lg font-semibold">{user?.name}</p>
          </div>

          <div>
            <p className="text-text-muted text-sm mb-1">{t('email')}</p>
            <p className="text-lg font-semibold">{user?.email}</p>
          </div>

          <div className="pt-4 border-t border-border">
            <button className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition">
              {t('updateProfile')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
