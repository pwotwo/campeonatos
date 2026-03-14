import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError('Email ou password incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🏆</div>
          <h1 className="text-3xl font-bold text-white">Campeonatos</h1>
          <p className="text-gray-400 text-sm mt-1">Sistema de Gestão Desportiva</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@campeonatos.com"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
            />
          </div>

          {/* Erro */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 text-sm px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors text-base"
          >
            {loading ? 'A entrar...' : '→ Entrar'}
          </button>

        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">
          © 2026 Campeonatos · Todos os direitos reservados
        </p>

      </div>
    </div>
  )
}