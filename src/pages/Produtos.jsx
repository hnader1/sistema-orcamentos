import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package } from 'lucide-react'

export default function Produtos() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Cadastro de Produtos</h1>
                <p className="text-xs sm:text-sm text-gray-500">Gerencie seu catálogo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Módulo de Produtos</h3>
          <p className="text-gray-600 mb-6">
            Esta página será desenvolvida nas próximas etapas.<br />
            Por enquanto, os 188 produtos já estão cadastrados no banco de dados!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg">
            ✅ 188 produtos já disponíveis
          </div>
        </div>
      </div>
    </div>
  )
}
