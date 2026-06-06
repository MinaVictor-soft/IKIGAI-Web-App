import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { Trophy, Zap, Users, Medal } from 'lucide-react'

interface LeaderboardEntry {
  id: string
  name: string
  xp: number
  rank?: number
  avatar?: string
}

interface Tribe {
  id: string
  name: string
  totalXp: number
  memberCount: number
}

export default function LeaderboardPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [tab, setTab] = useState<'individual' | 'tribes'>('individual')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [tribes, setTribes] = useState<Tribe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [tab])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      if (tab === 'individual') {
        const response = await api.get('/xp/leaderboard')
        const data = response.data?.data || []
        const withRanks = data.map((entry: any, index: number) => ({
          ...entry,
          rank: index + 1,
        }))
        setLeaderboard(withRanks)
      } else {
        const response = await api.get('/xp/tribes')
        const data = response.data?.data || []
        setTribes(data)
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'
    if (rank === 2) return 'text-gray-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-indigo-500'
  }

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          {t('leaderboard')}
        </h1>
        <p className="text-text-muted">{t('leaderboard') || 'Compete with others and climb the rankings'}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        <button
          onClick={() => setTab('individual')}
          className={`px-6 py-3 font-semibold transition ${
            tab === 'individual'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-muted hover:text-text'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          {t('individual') || 'Individual'}
        </button>
        <button
          onClick={() => setTab('tribes')}
          className={`px-6 py-3 font-semibold transition ${
            tab === 'tribes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-muted hover:text-text'
          }`}
        >
          <Users className="w-5 h-5 inline mr-2" />
          {t('tribes') || 'Tribes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <p className="mt-4 text-text-muted">{t('loading') || 'Loading...'}</p>
        </div>
      ) : tab === 'individual' ? (
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Medal className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-muted">{t('noResults') || 'No leaderboard data yet'}</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => {
              const isUser = entry.id === user?.id
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition ${
                    isUser
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'bg-surface border border-border hover:border-primary'
                  }`}
                >
                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getMedalColor(index + 1)} ${
                    index < 3 ? 'bg-yellow-500/10' : 'bg-surface'
                  }`}>
                    {getMedalIcon(index + 1)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {entry.name}
                      {isUser && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded">You</span>}
                    </h3>
                    <p className="text-text-muted text-sm">Rank #{index + 1}</p>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <Zap className="w-5 h-5" />
                      {entry.xp.toLocaleString()}
                    </div>
                    <p className="text-text-muted text-sm">XP</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {tribes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-muted">{t('noResults') || 'No tribes yet'}</p>
            </div>
          ) : (
            tribes.map((tribe, index) => (
              <div
                key={tribe.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-border hover:border-primary transition"
              >
                {/* Rank */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getMedalColor(index + 1)} ${
                  index < 3 ? 'bg-yellow-500/10' : 'bg-surface'
                }`}>
                  {getMedalIcon(index + 1)}
                </div>

                {/* Tribe Info */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{tribe.name}</h3>
                  <p className="text-text-muted text-sm">{tribe.memberCount} members</p>
                </div>

                {/* XP */}
                <div className="text-right">
                  <div className="flex items-center gap-2 font-bold text-primary">
                    <Zap className="w-5 h-5" />
                    {tribe.totalXp.toLocaleString()}
                  </div>
                  <p className="text-text-muted text-sm">Total XP</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
