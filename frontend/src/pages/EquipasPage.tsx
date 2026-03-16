import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

interface Team {
  id: string
  name: string
  short_name: string
  city: string
  founded_year: number
  badge_url: string | null
  manager: { full_name: string; email: string }
  _count: { players: number }
}

interface Player {
  id: string
  full_name: string
  position: string | null
  jersey_number: number
  nationality: string | null
}

export default function EquipasPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [form, setForm] = useState({
    name: '', short_name: '', city: '', founded_year: 2000
  })
  const [playerForm, setPlayerForm] = useState({
    full_name: '', birth_date: '', position: '', jersey_number: 1, nationality: ''
  })

  useEffect(() => { loadTeams() }, [])

  async function loadTeams() {
    try {
      const res = await api.get('/teams')
      setTeams(res.data.teams)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadPlayers(teamId: string) {
    try {
      const res = await api.get(`/teams/${teamId}/players`)
      setPlayers(res.data.players)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSelectTeam(team: Team) {
    setSelectedTeam(team)
    setShowPlayerForm(false)
    await loadPlayers(team.id)
  }

  async function handleCreateTeam(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/teams', { ...form, founded_year: Number(form.founded_year) })
      setShowForm(false)
      setForm({ name: '', short_name: '', city: '', founded_year: 2000 })
      loadTeams()
    } catch (err) {
      console.error(err)
    }
  }

  async function handleAddPlayer(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTeam) return
    try {
      await api.post(`/teams/${selectedTeam.id}/players`, {
        ...playerForm,
        jersey_number: Number(playerForm.jersey_number)
      })
      setShowPlayerForm(false)
      setPlayerForm({ full_name: '', birth_date: '', position: '', jersey_number: 1, nationality: '' })
      loadPlayers(selectedTeam.id)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Equipas</h1>
          <p className="text-gray-400 mt-1">Gere as equipas e jogadores</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition-colors"
        >
          + Nova Equipa
        </button>
      </div>

      {/* Formulário nova equipa */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-bold text-lg mb-4">Nova Equipa</h2>
          <form onSubmit={handleCreateTeam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Abreviatura</label>
              <input value={form.short_name} onChange={(e) => setForm({ ...form, short_name: e.target.value })} required maxLength={4}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cidade</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ano de Fundação</label>
              <input type="number" value={form.founded_year} onChange={(e) => setForm({ ...form, founded_year: Number(e.target.value) })} required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500" />
            </div>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-xl transition-colors">Criar</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded-xl transition-colors">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de equipas */}
        <div className="space-y-4">
          {loading ? <p className="text-gray-400">A carregar...</p> : teams.map((team) => (
            <div
              key={team.id}
              onClick={() => handleSelectTeam(team)}
              className={`bg-gray-900 border rounded-2xl p-5 cursor-pointer transition-colors ${
                selectedTeam?.id === team.id ? 'border-yellow-500' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {team.short_name}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{team.name}</p>
                    <p className="text-gray-400 text-sm">{team.city} · Fundado em {team.founded_year}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-500 font-bold">{team._count.players}</p>
                  <p className="text-gray-500 text-xs">jogadores</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Painel de jogadores */}
        {selectedTeam && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold text-lg">{selectedTeam.name}</h2>
              <button
                onClick={() => setShowPlayerForm(!showPlayerForm)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                + Jogador
              </button>
            </div>

            {/* Formulário novo jogador */}
            {showPlayerForm && (
              <form onSubmit={handleAddPlayer} className="space-y-3 mb-4 p-4 bg-gray-800 rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <input value={playerForm.full_name} onChange={(e) => setPlayerForm({ ...playerForm, full_name: e.target.value })}
                      placeholder="Nome completo" required
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500" />
                  </div>
                  <input type="date" value={playerForm.birth_date} onChange={(e) => setPlayerForm({ ...playerForm, birth_date: e.target.value })}
                    required className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500" />
                  <input value={playerForm.position} onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}
                    placeholder="Posição" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500" />
                  <input type="number" value={playerForm.jersey_number} onChange={(e) => setPlayerForm({ ...playerForm, jersey_number: Number(e.target.value) })}
                    placeholder="Nº" min={1} max={99} required
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500" />
                  <input value={playerForm.nationality} onChange={(e) => setPlayerForm({ ...playerForm, nationality: e.target.value })}
                    placeholder="Nacionalidade" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-yellow-500" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-yellow-500 text-black font-bold py-2 rounded-lg text-sm">Adicionar</button>
                  <button type="button" onClick={() => setShowPlayerForm(false)} className="flex-1 bg-gray-700 text-white font-bold py-2 rounded-lg text-sm">Cancelar</button>
                </div>
              </form>
            )}

            {/* Lista de jogadores */}
            <div className="space-y-2">
              {players.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">Sem jogadores registados</p>
              ) : players.map((player) => (
                <div key={player.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-xl">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center text-black font-bold text-sm">
                    {player.jersey_number}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{player.full_name}</p>
                    <p className="text-gray-400 text-xs">{player.position || 'Sem posição'} · {player.nationality || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}