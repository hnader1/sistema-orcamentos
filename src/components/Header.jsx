import { useNavigate } from 'react-router-dom'
import { LogOut, User, Shield, Briefcase, BarChart3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Header() {
  const navigate = useNavigate()
  const { user, logout, podeAcessarLancamento } = useAuth()

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      logout()
      navigate('/login')
    }
  }

  const getTipoIcon = () => {
    if (user?.tipo === 'admin') return <Shield size={16} className="text-yellow-600" />
    if (user?.tipo === 'comercial_interno') return <Briefcase size={16} className="text-purple-600" />
    return <User size={16} className="text-blue-600" />
  }

  const getTipoLabel = () => {
    if (user?.tipo === 'admin') return 'Administrador'
    if (user?.tipo === 'comercial_interno') return 'Comercial Interno'
    return 'Vendedor'
  }

  const getTipoBadge = () => {
    const badges = {
      'admin': 'bg-yellow-100 text-yellow-800',
      'vendedor': 'bg-blue-100 text-blue-800',
      'comercial_interno': 'bg-purple-100 text-purple-800'
    }
    return badges[user?.tipo] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Título */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">
              Sistema de Orçamentos
            </h1>
          </div>

          {/* User Info + Painel Gerencial + Logout */}
          <div className="flex items-center gap-4">
            {/* Link de Painel Gerencial (só para Admin e Comercial Interno) */}
            {podeAcessarLancamento() && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Painel Gerencial"
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline text-sm font-medium">Painel Gerencial</span>
              </button>
            )}

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.nome}
                </p>
                <div className="flex items-center gap-1 justify-end">
                  {getTipoIcon()}
                  <span className="text-xs text-gray-500">
                    {getTipoLabel()}
                  </span>
                </div>
              </div>

              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.nome?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}