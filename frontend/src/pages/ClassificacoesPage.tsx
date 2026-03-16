import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

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

interface Championship {
  id: string
  name: string
}

export default function ClassificacoesPage() {
  const [standings, setStandings] = useState<Standing[]>([])
  const [championships, setChampionships] = useState<Championship[]>([])
  const [selectedChampionship, setSelectedChampionship] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadChampionships() }, [])

  async function loadChampionships() {
    try {
      const res = await api.get('/championships')
      setChampionships(res.data.data)
      if (res.data.data.length > 0) {
        setSelectedChampionship(res.data.data[0].id)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (selectedChampionship) loadStandings()
  }, [selectedChampionship])

  async function loadStandings() {
    try {
      setLoading(true)
      const res = await api.get(`/championships/${selectedChampionship}/standings`)
      setStandings(res.data.standings)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const goalDiff = (s: Standing) => s.goals_for - s.goals_against

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Classificações</h1>
          <p className="text-gray-400 mt-1">Tabela classificativa por campeonato</p>
        </div>
        <select
          value={selectedChampionship}
          onChange={(e) => setSelectedChampionship(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-xl focus:outline-none focus:border-yellow-500"
        >
          {championships.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Tabela */}
      {loading ? (
        <p className="text-gray-400">A carregar...</p>
      ) : standings.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-gray-400">Sem classificações disponíveis</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-12 px-6 py-3 bg-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wide">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4">Equipa</div>
            <div className="col-span-1 text-center">J</div>
            <div className="col-span-1 text-center">V</div>
            <div className="col-span-1 text-center">E</div>
            <div className="col-span-1 text-center">D</div>
            <div className="col-span-1 text-center">GM</div>
            <div className="col-span-1 text-center">GS</div>
            <div className="col-span-1 text-center">DG</div>
            <div className="col-span-1 text-center font-bold text-yellow-500">P</div>
          </div>

          {/* Linhas da tabela */}
          {standings.map((standing, index) => (
            <div
              key={standing.id}
              className={`grid grid-cols-12 px-6 py-4 items-center border-t border-gray-800 hover:bg-gray-800 transition-colors ${
                index === 0 ? 'border-l-4 border-l-yellow-500' :
                index === 1 ? 'border-l-4 border-l-gray-400' :
                index === 2 ? 'border-l-4 border-l-yellow-700' : 'border-l-4 border-l-transparent'
              }`}
            >
              <div className="col-span-1 text-center text-gray-400 font-bold">{index + 1}</div>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                  {standing.team.short_name}
                </div>
                <span className="text-white font-medium">{standing.team.name}</span>
              </div>
              <div className="col-span-1 text-center text-gray-400">{standing.played}</div>
              <div className="col-span-1 text-center text-green-400">{standing.wins}</div>
              <div className="col-span-1 text-center text-gray-400">{standing.draws}</div>
              <div className="col-span-1 text-center text-red-400">{standing.losses}</div>
              <div className="col-span-1 text-center text-gray-400">{standing.goals_for}</div>
              <div className="col-span-1 text-center text-gray-400">{standing.goals_against}</div>
              <div className={`col-span-1 text-center font-medium ${goalDiff(standing) > 0 ? 'text-green-400' : goalDiff(standing) < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {goalDiff(standing) > 0 ? '+' : ''}{goalDiff(standing)}
              </div>
              <div className="col-span-1 text-center text-yellow-500 font-bold text-lg">{standing.points}</div>
            </div>
          ))}

          {/* Legenda */}
          <div className="px-6 py-3 bg-gray-800 border-t border-gray-700 flex gap-6 text-xs text-gray-500">
            <span>J = Jogos</span>
            <span>V = Vitórias</span>
            <span>E = Empates</span>
            <span>D = Derrotas</span>
            <span>GM = Golos Marcados</span>
            <span>GS = Golos Sofridos</span>
            <span>DG = Diferença de Golos</span>
            <span>P = Pontos</span>
          </div>
        </div>
      )}
    </Layout>
  )
}