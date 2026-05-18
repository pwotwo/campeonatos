import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../services/api'

interface Championship {
  id: string
  name: string
  sport_type: string
  format: string
  season: string
  status: string
  organizer: { full_name: string }
}

interface Match {
  id: string
  round: number
  scheduled_at: string
  venue: string | null
  home_score: number | null
  away_score: number | null
  status: string
  home_team: { name: string; short_name: string }
  away_team: { name: string; short_name: string }
}

interface Standing {
  id: string
  points: number
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  team: { name: string; short_name: string }
}

interface RankedPlayer {
  player_id: string
  full_name: string
  jersey_number: number
  team: { name: string; short_name: string }
  goals: number
  yellow_cards: number
  red_cards: number
}

export default function PublicChampionshipPage() {
  const { id } = useParams()
  const [championship, setChampionship] = useState<Championship | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [standings, setStandings] = useState<Standing[]>([])
  const [scorers, setScorers] = useState<RankedPlayer[]>([])
  const [discipline, setDiscipline] = useState<RankedPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadPublicData() {
      if (!id) return

      try {
        const [championshipRes, matchesRes, standingsRes, rankingsRes] = await Promise.all([
          api.get(`/championships/${id}`),
          api.get(`/matches?championship_id=${id}`),
          api.get(`/championships/${id}/standings`),
          api.get(`/championships/${id}/rankings`)
        ])

        setChampionship(championshipRes.data.championship)
        setMatches(matchesRes.data.matches)
        setStandings(standingsRes.data.standings)
        setScorers(rankingsRes.data.rankings.scorers)
        setDiscipline(rankingsRes.data.rankings.discipline)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadPublicData()
  }, [id])

  const goalDiff = (standing: Standing) => standing.goals_for - standing.goals_against

  if (loading) {
    return <div className="min-h-screen bg-gray-950 text-gray-400 p-8">A carregar...</div>
  }

  if (!championship) {
    return <div className="min-h-screen bg-gray-950 text-gray-400 p-8">Campeonato não encontrado</div>
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link to="/login" className="text-yellow-500 text-sm font-semibold">Área de gestão</Link>
          <h1 className="text-4xl font-bold mt-4">{championship.name}</h1>
          <p className="text-gray-400 mt-2">
            {championship.sport_type} · {championship.format} · Época {championship.season} · {championship.status}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Classificação</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {standings.length === 0 ? (
              <p className="text-gray-500 p-6">Sem classificação disponível.</p>
            ) : standings.map((standing, index) => (
              <div key={standing.id} className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-gray-800 first:border-t-0 items-center text-sm">
                <span className="col-span-1 text-gray-400">{index + 1}</span>
                <span className="col-span-5 font-semibold">{standing.team.name}</span>
                <span className="col-span-1 text-center">{standing.played}J</span>
                <span className="col-span-1 text-center text-green-400">{standing.wins}V</span>
                <span className="col-span-1 text-center">{standing.draws}E</span>
                <span className="col-span-1 text-center text-red-400">{standing.losses}D</span>
                <span className="col-span-1 text-center">{goalDiff(standing)}</span>
                <span className="col-span-1 text-center text-yellow-500 font-bold">{standing.points}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">Jogos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <div key={match.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-right">
                    <p className="font-bold">{match.home_team.short_name}</p>
                    <p className="text-xs text-gray-500">{match.home_team.name}</p>
                  </div>
                  <div className="text-center min-w-24">
                    {match.status === 'SCHEDULED' ? (
                      <p className="text-xs text-gray-400">{new Date(match.scheduled_at).toLocaleDateString('pt-PT')}</p>
                    ) : (
                      <p className="text-2xl font-bold">{match.home_score ?? 0} - {match.away_score ?? 0}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{match.status}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{match.away_team.short_name}</p>
                    <p className="text-xs text-gray-500">{match.away_team.name}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4">Jornada {match.round} · {match.venue || 'Local não definido'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Artilheiros</h2>
            <RankingList players={scorers} valueKey="goals" empty="Sem golos registados." />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-4">Disciplina</h2>
            <RankingList players={discipline} valueKey="red_cards" empty="Sem cartões registados." />
          </div>
        </section>
      </main>
    </div>
  )
}

function RankingList({ players, valueKey, empty }: { players: RankedPlayer[]; valueKey: 'goals' | 'red_cards'; empty: string }) {
  if (players.length === 0) {
    return <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-gray-500 text-sm">{empty}</div>
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {players.map((player, index) => (
        <div key={player.player_id} className="flex items-center justify-between px-4 py-3 border-t border-gray-800 first:border-t-0">
          <div>
            <p className="font-semibold">{index + 1}. #{player.jersey_number} {player.full_name}</p>
            <p className="text-xs text-gray-500">{player.team.short_name} · {player.team.name}</p>
          </div>
          <span className="text-yellow-500 font-bold">
            {valueKey === 'goals' ? player.goals : `${player.red_cards}V / ${player.yellow_cards}A`}
          </span>
        </div>
      ))}
    </div>
  )
}
