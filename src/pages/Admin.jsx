import { useNavigate } from 'react-router-dom'
import { Package, Users, Truck, BarChart3, ArrowLeft, Settings, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function Admin() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

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

  const cards = [
    {
      id: 'dashboard',
      titulo: 'Dashboard',
      descricao: 'Relatórios e análises',
      icone: BarChart3,
      cor: 'from-purple-500 to-purple-600',
      rota: '/admin/dashboard',
      stats: 'Visualizar gráficos'
    },
    {
      id: 'produtos',
      titulo: 'Produtos',
      descricao: 'Gerenciar catálogo',
      icone: Package,
      cor: 'from-blue-500 to-blue-600',
      rota: '/admin/produtos',
      stats: 'CRUD completo'
    },
    {
      id: 'usuarios',
      titulo: 'Usuários',
      descricao: 'Gerenciar acessos',
      icone: Users,
      cor: 'from-green-500 to-green-600',
      rota: '/admin/usuarios',
      stats: 'Vendedores e comerciais'
    },
    {
      id: 'frete',
      titulo: 'Frete',
      descricao: 'Rotas e valores',
      icone: Truck,
      cor: 'from-orange-500 to-orange-600',
      rota: '/admin/frete',
      stats: 'Tabela de preços'
    },
    {
      id: 'concorrencia',
      titulo: 'Concorrência Interna',
      descricao: 'Análise de conflitos',
      icone: AlertTriangle,
      cor: 'from-yellow-500 to-orange-600',
      rota: '/relatorios/orcamentos',
      stats: 'Orçamentos sem CNPJ/CPF'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header da Página */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voltar ao Dashboard"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Administração</h1>
                  <p className="text-sm text-gray-600">Gerenciar sistema e visualizar relatórios</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => {
            const Icone = card.icone
            return (
              <button
                key={card.id}
                onClick={() => navigate(card.rota)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200 text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${card.cor} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icone className="text-white" size={28} />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {card.titulo}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3">
                  {card.descricao}
                </p>
                
                <div className="pt-3 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-500">
                    {card.stats}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Settings className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">Painel Administrativo</h3>
              <p className="text-sm text-purple-700">
                Acesso exclusivo para administradores. Gerencie produtos, usuários, tabela de frete e visualize relatórios completos do sistema.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}