import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

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

interface Championship {
  id: string
  name: string
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-gray-700 text-gray-300',
  ONGOING: 'bg-green-900 text-green-400',
  FINISHED: 'bg-blue-900 text-blue-400',
  POSTPONED: 'bg-yellow-900 text-yellow-400',
  CANCELLED: 'bg-red-900 text-red-400'
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  ONGOING: 'Em curso',
  FINISHED: 'Terminado',
  POSTPONED: 'Adiado',
  CANCELLED: 'Cancelado'
}

export default function JogosPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [selectedChampionship, setSelectedChampionship] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadChampionships()
  }, [])

  useEffect(() => {
    loadMatches()
  }, [selectedChampionship])

  async function loadChampionships() {
    try {
      const res = await api.get('/championships')
      setChampionships(res.data.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadMatches() {
    try {
      setLoading(true)
      const url = selectedChampionship
        ? `/matches?championship_id=${selectedChampionship}`
        : '/matches'
      const res = await api.get(url)
      setMatches(res.data.matches)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Jogos</h1>
          <p className="text-gray-400 mt-1">Calendário e resultados</p>
        </div>

        {/* Filtro por campeonato */}
        <select
          value={selectedChampionship}
          onChange={(e) => setSelectedChampionship(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:border-yellow-500"
        >
          <option value="">Todos os campeonatos</option>
          {championships.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Lista de jogos */}
      {loading ? (
        <p className="text-gray-400">A carregar...</p>
      ) : matches.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">⚽</p>
          <p className="text-gray-400">Nenhum jogo encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between">

                {/* Equipa da casa */}
                <div className="flex-1 text-right">
                  <p className="text-white font-bold text-lg">{match.home_team.name}</p>
                  <p className="text-gray-500 text-sm">{match.home_team.short_name}</p>
                </div>

                {/* Score */}
                <div className="mx-8 text-center">
                  {match.status === 'SCHEDULED' ? (
                    <div>
                      <p className="text-gray-400 text-sm mb-1">
                        {new Date(match.scheduled_at).toLocaleDateString('pt-PT')}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(match.scheduled_at).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-white text-3xl font-bold">{match.home_score ?? 0}</span>
                      <span className="text-gray-500 text-xl">—</span>
                      <span className="text-white text-3xl font-bold">{match.away_score ?? 0}</span>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium mt-2 inline-block ${statusColors[match.status]}`}>
                    {statusLabels[match.status]}
                  </span>
                </div>

                {/* Equipa visitante */}
                <div className="flex-1">
                  <p className="text-white font-bold text-lg">{match.away_team.name}</p>
                  <p className="text-gray-500 text-sm">{match.away_team.short_name}</p>
                </div>

              </div>

              {/* Info extra */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
                <span>🏟️ {match.venue || 'Local não definido'}</span>
                <span>📅 Jornada {match.round}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}