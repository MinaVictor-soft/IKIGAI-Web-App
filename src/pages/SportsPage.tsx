import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Match {
  id: string
  homeTeam: { id: string; name: string; color: string }
  awayTeam: { id: string; name: string; color: string }
  homeScore?: number
  awayScore?: number
  status: string
  scheduledAt: string
  winXp: number
  drawXp: number
  lossXp: number
}

interface Team {
  id: string
  name: string
  color: string
  wins: number
  draws: number
  losses: number
  points: number
  goalDifference: number
}

interface AdminSettings {
  sportsTabVisibilityWeb: boolean
}

export default function SportsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = i18n.language
  const isRTL = lang === 'ar'
  const [myTeamId, setMyTeamId] = useState<string | null>(null)

  // Check if sports tab is visible
  const { data: adminSettings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      try {
        const res = await api.get('/admin/settings')
        return res.data || {}
      } catch (error) {
        console.error('Failed to fetch admin settings:', error)
        return { sportsTabVisibilityWeb: true }
      }
    },
  })

  // Redirect if sports is not visible
  useEffect(() => {
    if (adminSettings && !adminSettings.sportsTabVisibilityWeb) {
      navigate('/')
    }
  }, [adminSettings, navigate])

  // Fetch matches
  const { data: matches, isLoading: matchesLoading, refetch } = useQuery({
    queryKey: ['sports-matches'],
    queryFn: async () => {
      const res = await api.get('/sports/matches')
      return res.data.data || []
    },
    refetchInterval: 30000,
  })

  // Fetch standings
  const { data: standings } = useQuery({
    queryKey: ['sports-standings'],
    queryFn: async () => {
      const res = await api.get('/sports/standings')
      return res.data.data || []
    },
    refetchInterval: 30000,
  })

  // Fetch user's team
  const { data: myTeam } = useQuery({
    queryKey: ['my-team'],
    queryFn: async () => {
      const res = await api.get('/sports/my-team')
      if (res.data.data?.id) {
        setMyTeamId(res.data.data.id)
      }
      return res.data.data || null
    },
  })

  // Filter matches
  const upcoming = (matches || []).filter(
    (m: Match) => m.status === 'SCHEDULED' || m.status === 'LIVE'
  )
  const completed = (matches || []).filter((m: Match) => m.status === 'COMPLETED')

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-indigo-600 text-white p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">⚽ {t('sports') || 'Sports'}</h1>
        <p className="text-indigo-100">
          {lang === 'ar' ? 'المباريات والنتائج' : 'Matches & Results'}
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        {/* Standings Section */}
        {standings && (standings as Team[]).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🏆 {lang === 'ar' ? 'ترتيب الفرق' : 'Team Standings'}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className={`px-4 py-3 font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      #
                    </th>
                    <th className={`px-4 py-3 font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                      {lang === 'ar' ? 'الفريق' : 'Team'}
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">P</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">W</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">D</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">L</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">GD</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {(standings as Team[]).map((team: Team, idx: number) => {
                    const isMyTeam = myTeamId === team.id
                    const played = team.wins + team.draws + team.losses
                    return (
                      <tr
                        key={team.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition ${
                          isMyTeam
                            ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                            : idx < 2
                              ? 'bg-green-50'
                              : ''
                        }`}
                      >
                        <td className={`px-4 py-3 font-bold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {idx + 1}
                        </td>
                        <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: team.color || '#6366f1' }}
                            />
                            <span className="font-medium text-gray-900">
                              {team.name}
                              {isMyTeam && ' ⭐'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">{played}</td>
                        <td className="px-4 py-3 text-center text-green-600 font-semibold">{team.wins}</td>
                        <td className="px-4 py-3 text-center text-blue-600 font-semibold">{team.draws}</td>
                        <td className="px-4 py-3 text-center text-red-600 font-semibold">{team.losses}</td>
                        <td className={`px-4 py-3 text-center font-semibold ${team.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-indigo-600">{team.points}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center">
          <button
            onClick={handleRefresh}
            disabled={matchesLoading}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {matchesLoading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Matches Sections */}
        {matchesLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
          </div>
        ) : (
          <>
            {/* Upcoming Matches */}
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  📅 {lang === 'ar' ? 'المباريات القادمة' : 'Upcoming Matches'}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {upcoming.map((match: Match) => (
                    <MatchCard key={match.id} match={match} lang={lang} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Matches */}
            {completed.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  ✅ {lang === 'ar' ? 'المباريات المنتهية' : 'Completed Matches'}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {completed.map((match: Match) => (
                    <MatchCard key={match.id} match={match} lang={lang} />
                  ))}
                </div>
              </div>
            )}

            {upcoming.length === 0 && completed.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-lg">
                  {lang === 'ar' ? 'لا توجد مباريات' : 'No Matches Yet'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {lang === 'ar' ? 'ستظهر المباريات هنا' : 'Matches will appear here'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MatchCard({ match, lang }: { match: Match; lang: string }) {
  const statusColor =
    match.status === 'LIVE'
      ? '#ef4444'
      : match.status === 'COMPLETED'
        ? '#10b981'
        : '#6366f1'

  const statusLabel =
    match.status === 'LIVE'
      ? lang === 'ar'
        ? '🔴 مباشر'
        : '🔴 LIVE'
      : match.status === 'COMPLETED'
        ? lang === 'ar'
          ? 'انتهت'
          : 'Finished'
        : lang === 'ar'
          ? 'قادمة'
          : 'Upcoming'

  const matchDate = new Date(match.scheduledAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-sm font-semibold" style={{ color: statusColor }}>
            {statusLabel}
          </span>
        </div>
        <span className="text-xs text-gray-500">{matchDate}</span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: match.homeTeam.color || '#6366f1' }}
            />
            <p className="font-semibold text-gray-900">{match.homeTeam.name}</p>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 px-4 flex-shrink-0">
          {match.status !== 'SCHEDULED' ? (
            <>
              <span className="text-2xl font-bold text-gray-900">{match.homeScore}</span>
              <span className="text-gray-400 font-semibold">-</span>
              <span className="text-2xl font-bold text-gray-900">{match.awayScore}</span>
            </>
          ) : (
            <span className="text-sm font-bold text-gray-500">VS</span>
          )}
        </div>

        <div className="flex-1 text-right">
          <div className="flex items-center gap-2 mb-2 justify-end">
            <p className="font-semibold text-gray-900">{match.awayTeam.name}</p>
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: match.awayTeam.color || '#6366f1' }}
            />
          </div>
        </div>
      </div>

      {/* XP Rewards */}
      <div className="border-t border-gray-100 pt-4">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <p className="text-gray-600 mb-1">🏆 {lang === 'ar' ? 'فوز' : 'Win'}</p>
            <p className="font-bold text-green-600">+{match.winXp}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-1">🤝 {lang === 'ar' ? 'تعادل' : 'Draw'}</p>
            <p className="font-bold text-blue-600">+{match.drawXp}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-1">💪 {lang === 'ar' ? 'خسارة' : 'Loss'}</p>
            <p className="font-bold text-amber-600">+{match.lossXp}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
