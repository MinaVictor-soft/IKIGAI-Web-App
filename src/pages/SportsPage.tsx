import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import api from '../lib/api'

interface Tournament {
  id: string
  name: string
  status: string
  numberOfGroups: number
  teamsPerGroup: number
}

interface Group {
  id: string
  groupName: string
  teams: any[]
}

interface Match {
  id: string
  homeTeam?: { id: string; name: string }
  awayTeam?: { id: string; name: string }
  homeScore?: number
  awayScore?: number
  status: string
  stageType: string
}

export default function SportsPage() {
  const { t } = useTranslation()
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null)

  // Fetch tournaments
  const { data: tournaments, isLoading: tournamentsLoading } = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const res = await api.get('/sports/tournaments')
      return res.data.data || []
    },
  })

  // Fetch tournament details
  const { data: tournamentDetails } = useQuery({
    queryKey: ['tournament', selectedTournament],
    queryFn: async () => {
      if (!selectedTournament) return null
      const res = await api.get(`/sports/tournaments/${selectedTournament}`)
      return res.data.data
    },
    enabled: !!selectedTournament,
  })

  if (tournamentsLoading) {
    return (
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t('sports')}</h1>
        <div className="text-center py-8">{t('loading')}</div>
      </div>
    )
  }

  const activeTournament = tournaments?.find((t: Tournament) => t.status === 'GROUP_STAGE' || t.status === 'KNOCKOUT')

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t('sports')}</h1>

      {/* Tournaments List */}
      {tournaments && tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {tournaments.map((tournament: Tournament) => (
            <div
              key={tournament.id}
              onClick={() => setSelectedTournament(tournament.id)}
              className={`border rounded-lg p-6 cursor-pointer transition ${
                selectedTournament === tournament.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface border-border hover:border-primary'
              }`}
            >
              <h3 className="text-lg font-bold mb-2">{tournament.name}</h3>
              <div className="space-y-1 text-sm">
                <p>
                  {t('numberOfGroups')}: {tournament.numberOfGroups}
                </p>
                <p>
                  {t('teamsPerGroup')}: {tournament.teamsPerGroup}
                </p>
                <p className={`font-medium ${tournament.status === 'PLANNING' ? 'text-yellow-600' : tournament.status === 'GROUP_STAGE' ? 'text-blue-600' : 'text-green-600'}`}>
                  {t(tournament.status.toLowerCase())}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Tournament Details */}
      {selectedTournament && tournamentDetails ? (
        <div className="bg-surface border border-border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">{tournamentDetails.name}</h2>

          {/* Group Stage */}
          {tournamentDetails.groups && tournamentDetails.groups.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">{t('groupStandings')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tournamentDetails.groups.map((group: Group) => (
                  <div key={group.id} className="border border-border rounded-lg p-4">
                    <h4 className="font-bold mb-3">{t('groupStage')} {group.groupName}</h4>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2">{t('name')}</th>
                          <th className="text-center">P</th>
                          <th className="text-center">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.teams.map((team: any, idx: number) => (
                          <tr key={team.id} className={idx < 2 ? 'bg-green-50' : ''}>
                            <td className="py-2">{team.team?.name || 'Team'}</td>
                            <td className="text-center">{team.matchesPlayed}</td>
                            <td className="text-center font-bold">{team.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matches */}
          {tournamentDetails.matches && tournamentDetails.matches.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">{t('matches')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tournamentDetails.matches.map((match: Match) => (
                  <div key={match.id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs font-medium text-text-muted">{match.stageType}</p>
                      <p className={`text-xs font-medium ${match.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {match.status}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-right flex-1">
                        <p className="font-medium">{match.homeTeam?.name || 'TBD'}</p>
                      </div>
                      <div className="flex gap-2 mx-3">
                        <span className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center font-bold">
                          {match.homeScore ?? '-'}
                        </span>
                        <span className="text-text-muted font-bold">vs</span>
                        <span className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center font-bold">
                          {match.awayScore ?? '-'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{match.awayTeam?.name || 'TBD'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : activeTournament ? (
        <div className="text-center py-8 text-text-muted">
          {t('selectTournament')}
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted">{t('noTournamentsYet')}</div>
      )}
    </div>
  )
}
