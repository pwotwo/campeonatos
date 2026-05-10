import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

interface Match {
  id: string
  home_team_id: string
  away_team_id: string
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

interface Player {
  id: string
  full_name: string
  jersey_number: number
}

interface EventForm {
  team_id: string
  player_id: string
  type: string
  minute: number
  description: string
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
  const [actionId, setActionId] = useState<string | null>(null)
  const [openEventMatchId, setOpenEventMatchId] = useState<string | null>(null)
  const [playersByTeam, setPlayersByTeam] = useState<Record<string, Player[]>>({})
  const [eventForms, setEventForms] = useState<Record<string, EventForm>>({})
  const [error, setError] = useState('')

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
      setError('')
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

  function defaultEventForm(match: Match): EventForm {
    return {
      team_id: match.home_team_id,
      player_id: '',
      type: 'GOAL',
      minute: 1,
      description: ''
    }
  }

  async function loadPlayers(teamId: string) {
    if (playersByTeam[teamId]) return

    const res = await api.get(`/teams/${teamId}/players`)
    setPlayersByTeam((current) => ({
      ...current,
      [teamId]: res.data.players
    }))
  }

  async function handleStart(match: Match) {
    try {
      setError('')
      setActionId(match.id)
      await api.patch(`/matches/${match.id}/start`)
      await loadMatches()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível iniciar o jogo')
    } finally {
      setActionId(null)
    }
  }

  async function handleFinish(match: Match) {
    try {
      setError('')
      setActionId(match.id)
      await api.patch(`/matches/${match.id}/finish`)
      setOpenEventMatchId(null)
      await loadMatches()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível finalizar o jogo')
    } finally {
      setActionId(null)
    }
  }

  async function handleOpenEventForm(match: Match) {
    const nextForm = eventForms[match.id] || defaultEventForm(match)
    setOpenEventMatchId(openEventMatchId === match.id ? null : match.id)
    setEventForms((current) => ({ ...current, [match.id]: nextForm }))
    await loadPlayers(nextForm.team_id)
  }

  async function updateEventForm(match: Match, updates: Partial<EventForm>) {
    const currentForm = eventForms[match.id] || defaultEventForm(match)
    const nextForm = { ...currentForm, ...updates }

    if (updates.team_id) {
      nextForm.player_id = ''
      await loadPlayers(updates.team_id)
    }

    setEventForms((current) => ({ ...current, [match.id]: nextForm }))
  }

  async function handleAddEvent(match: Match, e: React.FormEvent) {
    e.preventDefault()
    const form = eventForms[match.id]
    if (!form?.player_id) {
      setError('Escolhe um jogador para registar o evento')
      return
    }

    try {
      setError('')
      setActionId(match.id)
      await api.post(`/matches/${match.id}/events`, {
        player_id: form.player_id,
        team_id: form.team_id,
        type: form.type,
        minute: Number(form.minute),
        description: form.description || undefined
      })
      setEventForms((current) => ({
        ...current,
        [match.id]: { ...form, player_id: '', minute: Math.min(Number(form.minute) + 1, 120), description: '' }
      }))
      await loadMatches()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Não foi possível registar o evento')
    } finally {
      setActionId(null)
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

      {error && (
        <div className="mb-6 bg-red-900/30 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

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

              <div className="flex flex-wrap gap-3 mt-4">
                {match.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleStart(match)}
                    disabled={actionId === match.id}
                    className="bg-green-900 hover:bg-green-800 disabled:opacity-60 text-green-300 font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
                  >
                    {actionId === match.id ? 'A iniciar...' : 'Iniciar jogo'}
                  </button>
                )}

                {match.status === 'ONGOING' && (
                  <>
                    <button
                      onClick={() => handleOpenEventForm(match)}
                      disabled={actionId === match.id}
                      className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
                    >
                      Registar evento
                    </button>
                    <button
                      onClick={() => handleFinish(match)}
                      disabled={actionId === match.id}
                      className="bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-blue-300 font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
                    >
                      {actionId === match.id ? 'A finalizar...' : 'Finalizar jogo'}
                    </button>
                  </>
                )}
              </div>

              {openEventMatchId === match.id && (
                <form onSubmit={(e) => handleAddEvent(match, e)} className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3 bg-gray-800 rounded-xl p-4">
                  <select
                    value={(eventForms[match.id] || defaultEventForm(match)).team_id}
                    onChange={(e) => updateEventForm(match, { team_id: e.target.value })}
                    className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value={match.home_team_id}>{match.home_team.name}</option>
                    <option value={match.away_team_id}>{match.away_team.name}</option>
                  </select>

                  <select
                    value={(eventForms[match.id] || defaultEventForm(match)).player_id}
                    onChange={(e) => updateEventForm(match, { player_id: e.target.value })}
                    className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">Jogador</option>
                    {(playersByTeam[(eventForms[match.id] || defaultEventForm(match)).team_id] || []).map((player) => (
                      <option key={player.id} value={player.id}>
                        #{player.jersey_number} {player.full_name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={(eventForms[match.id] || defaultEventForm(match)).type}
                    onChange={(e) => updateEventForm(match, { type: e.target.value })}
                    className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
                  >
                    <option value="GOAL">Golo</option>
                    <option value="YELLOW_CARD">Cartão amarelo</option>
                    <option value="RED_CARD">Cartão vermelho</option>
                    <option value="SUBSTITUTION">Substituição</option>
                  </select>

                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={(eventForms[match.id] || defaultEventForm(match)).minute}
                    onChange={(e) => updateEventForm(match, { minute: Number(e.target.value) })}
                    className="bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-yellow-500"
                  />

                  <button
                    type="submit"
                    disabled={actionId === match.id}
                    className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-60 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    {actionId === match.id ? 'A guardar...' : 'Guardar evento'}
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
