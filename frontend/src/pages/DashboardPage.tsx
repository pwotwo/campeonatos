import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'

interface Stats {
  championships: number
  teams: number
  players: number
  matches: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    championships: 0,
    teams: 0,
    players: 0,
    matches: 0
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const [championships, teams, matches] = await Promise.all([
          api.get('/championships'),
          api.get('/teams'),
          api.get('/matches')
        ])
        setStats({
          championships: championships.data.total || championships.data.data?.length || 0,
          teams: teams.data.teams?.length || 0,
          players: teams.data.teams?.reduce((acc: number, t: any) => acc + (t._count?.players || 0), 0) || 0,
          matches: matches.data.matches?.length || 0
        })
      } catch (err) {
        console.error(err)
      }
    }
    loadStats()
  }, [])

  const cards = [
    { label: 'Campeonatos', value: stats.championships, icon: '🏆', color: 'bg-yellow-500' },
    { label: 'Equipas', value: stats.teams, icon: '👥', color: 'bg-blue-500' },
    { label: 'Jogadores', value: stats.players, icon: '⚽', color: 'bg-green-500' },
    { label: 'Jogos', value: stats.matches, icon: '📅', color: 'bg-purple-500' },
  ]

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Bem-vindo ao sistema de gestão de campeonatos</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
              {card.icon}
            </div>
            <p className="text-gray-400 text-sm">{card.label}</p>
            <p className="text-white text-3xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>
    </Layout>
  )
}