import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import Header from '../components/Header'
import UsuariosAdmin from '../components/admin/UsuariosAdmin'
import { useAuth } from '../contexts/AuthContext'

export default function AdminUsuarios() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  if (!isAdmin()) {
    navigate('/admin')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gerenciar Usuários</h1>
                <p className="text-sm text-gray-500">Controle de acessos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <UsuariosAdmin />
      </div>
    </div>
  )
}