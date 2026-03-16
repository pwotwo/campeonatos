import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CampeonatosPage from './pages/CampeonatosPage'
import EquipasPage from './pages/EquipasPage'
import JogosPage from './pages/JogosPage'
import ClassificacoesPage from './pages/ClassificacoesPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/campeonatos" element={<PrivateRoute><CampeonatosPage /></PrivateRoute>} />
      <Route path="/equipas" element={<PrivateRoute><EquipasPage /></PrivateRoute>} />
      <Route path="/jogos" element={<PrivateRoute><JogosPage /></PrivateRoute>} />
      <Route path="/classificacoes" element={<PrivateRoute><ClassificacoesPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}