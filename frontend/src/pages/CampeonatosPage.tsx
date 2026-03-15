import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

interface Championship {
  id: string
  name: string
  sport_type: string
  format: string
  season: string
  status: string
  start_date: string
  end_date: string
  max_teams: number
  organizer: { full_name: string }
  _count: { enrollments: number }
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-700 text-gray-300',
  OPEN: 'bg-green-900 text-green-400',
  ONGOING: 'bg-blue-900 text-blue-400',
  FINISHED: 'bg-yellow-900 text-yellow-400',
  CANCELLED: 'bg-red-900 text-red-400'
}

const statusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  OPEN: 'Aberto',
  ONGOING: 'Em curso',
  FINISHED: 'Terminado',
  CANCELLED: 'Cancelado'
}

const formatLabels: Record<string, string> = {
  LEAGUE: '🏅 Liga',
  CUP: '🏆 Taça',
  MIXED: '🎯 Misto'
}

export default function CampeonatosPage() {
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', sport_type: '', format: 'LEAGUE',
    season: '2026', start_date: '', end_date: '', max_teams: 8
  })

  useEffect(() => {
    loadChampionships()
  }, [])

  async function loadChampionships() {
    try {
      const res = await api.get('/championships')
      setChampionships(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/championships', {
        ...form,
        max_teams: Number(form.max_teams)
      })
      setShowForm(false)
      setForm({ name: '', sport_type: '', format: 'LEAGUE', season: '2026', start_date: '', end_date: '', max_teams: 8 })
      loadChampionships()
    } catch (err) {
      console.error(err)
    }
  }

  async function handlePublish(id: string) {
    try {
      await api.patch(`/championships/${id}/publish`)
      loadChampionships()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Campeonatos</h1>
          <p className="text-gray-400 mt-1">Gere todos os campeonatos do sistema</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 py-3 rounded-xl transition-colors"
        >
          + Novo Campeonato
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <h2 className="text-white font-bold text-lg mb-4">Novo Campeonato</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Modalidade</label>
              <input
                value={form.sport_type}
                onChange={(e) => setForm({ ...form, sport_type: e.target.value })}
                placeholder="Futebol, Basquetebol..."
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Formato</label>
              <select
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value })}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="LEAGUE">Liga</option>
                <option value="CUP">Taça</option>
                <option value="MIXED">Misto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Época</label>
              <input
                value={form.season}
                onChange={(e) => setForm({ ...form, season: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Data de Início</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Data de Fim</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Máximo de Equipas</label>
              <input
                type="number"
                value={form.max_teams}
                onChange={(e) => setForm({ ...form, max_teams: Number(e.target.value) })}
                min={2}
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div className="flex items-end gap-3">
              <button
                type="submit"
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 rounded-xl transition-colors"
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de campeonatos */}
      {loading ? (
        <p className="text-gray-400">A carregar...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {championships.map((c) => (
            <div key={c.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-white font-bold text-lg leading-tight">{c.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0 ${statusColors[c.status]}`}>
                  {statusLabels[c.status]}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-400 mb-4">
                <p>🎯 {c.sport_type} · {formatLabels[c.format]}</p>
                <p>📅 Época {c.season}</p>
                <p>👥 {c._count.enrollments}/{c.max_teams} equipas</p>
                <p>👤 {c.organizer.full_name}</p>
              </div>
              {c.status === 'DRAFT' && (
                <button
                  onClick={() => handlePublish(c.id)}
                  className="w-full bg-green-900 hover:bg-green-800 text-green-400 font-semibold py-2 rounded-xl transition-colors text-sm"
                >
                  ✓ Publicar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}