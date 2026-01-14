import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Users, Truck, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import ProdutosAdmin from '../components/admin/ProdutosAdmin.jsx'
import UsuariosAdmin from '../components/admin/UsuariosAdmin.jsx'
import FreteAdmin from '../components/admin/FreteAdmin.jsx'

export default function Admin() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [abaAtiva, setAbaAtiva] = useState('produtos')

  // Proteger rota - só admin pode acessar
  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-900 mb-2">Acesso Negado</h2>
            <p className="text-red-700">Você não tem permissão para acessar esta área.</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  const abas = [
    {
      id: 'produtos',
      nome: 'Produtos',
      icone: Package,
      cor: 'blue',
      corAtiva: 'from-blue-500 to-blue-600',
      corBorda: 'border-blue-500'
    },
    {
      id: 'usuarios',
      nome: 'Usuários',
      icone: Users,
      cor: 'green',
      corAtiva: 'from-green-500 to-green-600',
      corBorda: 'border-green-500'
    },
    {
      id: 'frete',
      nome: 'Frete',
      icone: Truck,
      cor: 'purple',
      corAtiva: 'from-purple-500 to-purple-600',
      corBorda: 'border-purple-500'
    }
  ]

  const abaAtual = abas.find(a => a.id === abaAtiva)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header da Página */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${abaAtual.corAtiva} rounded-lg flex items-center justify-center`}>
                  <Settings className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Administração</h1>
                  <p className="text-xs sm:text-sm text-gray-500">Gerenciar sistema</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Abas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {abas.map((aba) => {
              const IconeAba = aba.icone
              const ativo = abaAtiva === aba.id
              return (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                    ativo
                      ? `${aba.corBorda} text-${aba.cor}-600`
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <IconeAba size={20} />
                  <span className="hidden sm:inline">{aba.nome}</span>
                </button>
              )
            })}
          </div>

          {/* Conteúdo das Abas */}
          <div className="p-6">
            {abaAtiva === 'produtos' && <ProdutosAdmin />}
            {abaAtiva === 'usuarios' && <UsuariosAdmin />}
            {abaAtiva === 'frete' && <FreteAdmin />}
          </div>
        </div>
      </div>
    </div>
  )
}
