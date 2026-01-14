import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Truck } from 'lucide-react'
import Header from '../components/Header'
import FreteAdmin from '../components/admin/FreteAdmin'
import { useAuth } from '../contexts/AuthContext'

export default function AdminFrete() {
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
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Truck className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gerenciar Frete</h1>
                <p className="text-sm text-gray-500">Rotas e tabela de preços</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <FreteAdmin />
      </div>
    </div>
  )
}
