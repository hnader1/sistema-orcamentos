import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, Plus, Edit, Send, CheckCircle, XCircle, Briefcase,
  TrendingUp, Calendar, User
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, isVendedor } = useAuth()
  const [loading, setLoading] = useState(true)
  const [ultimosOrcamentos, setUltimosOrcamentos] = useState([])
  const [estatisticas, setEstatisticas] = useState({
    rascunho: 0,
    enviado: 0,
    aprovado: 0,
    lancado: 0,
    cancelado: 0,
    total: 0
  })

  useEffect(() => {
    carregarDados()
  }, [user])

  const carregarDados = async () => {
    try {
      setLoading(true)

      // Query base
      let queryUltimos = supabase
        .from('orcamentos')
        .select('id, numero, cliente_nome, data_orcamento, status, total')
        .eq('excluido', false)

      let queryTodos = supabase
        .from('orcamentos')
        .select('status')
        .eq('excluido', false)

      // Se for vendedor, filtrar apenas seus orçamentos
      if (isVendedor()) {
        queryUltimos = queryUltimos.eq('usuario_id', user.id)
        queryTodos = queryTodos.eq('usuario_id', user.id)
      }

      // Buscar últimos 5 orçamentos
      const { data: ultimos, error: errorUltimos } = await queryUltimos
        .order('created_at', { ascending: false })
        .limit(5)

      if (errorUltimos) throw errorUltimos
      setUltimosOrcamentos(ultimos || [])

      // Buscar estatísticas por status
      const { data: todos, error: errorTodos } = await queryTodos

      if (errorTodos) throw errorTodos

      const stats = {
        rascunho: todos.filter(o => o.status === 'rascunho').length,
        enviado: todos.filter(o => o.status === 'enviado').length,
        aprovado: todos.filter(o => o.status === 'aprovado').length,
        lancado: todos.filter(o => o.status === 'lancado').length,
        cancelado: todos.filter(o => o.status === 'cancelado').length,
        total: todos.length
      }

      setEstatisticas(stats)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'rascunho': 'bg-gray-100 text-gray-700',
      'enviado': 'bg-blue-100 text-blue-700',
      'aprovado': 'bg-green-100 text-green-700',
      'lancado': 'bg-purple-100 text-purple-700',
      'cancelado': 'bg-red-100 text-red-700'
    }
    return colors[status] || colors.rascunho
  }

  const statusCards = [
    {
      status: 'rascunho',
      titulo: 'Rascunhos',
      icone: Edit,
      cor: 'from-gray-500 to-gray-600',
      corFundo: 'bg-gray-50',
      corBorda: 'border-gray-200',
      quantidade: estatisticas.rascunho
    },
    {
      status: 'enviado',
      titulo: 'Enviados',
      icone: Send,
      cor: 'from-blue-500 to-blue-600',
      corFundo: 'bg-blue-50',
      corBorda: 'border-blue-200',
      quantidade: estatisticas.enviado
    },
    {
      status: 'aprovado',
      titulo: 'Aprovados',
      icone: CheckCircle,
      cor: 'from-green-500 to-green-600',
      corFundo: 'bg-green-50',
      corBorda: 'border-green-200',
      quantidade: estatisticas.aprovado
    },
    {
      status: 'lancado',
      titulo: 'Lançados',
      icone: Briefcase,
      cor: 'from-purple-500 to-purple-600',
      corFundo: 'bg-purple-50',
      corBorda: 'border-purple-200',
      quantidade: estatisticas.lancado
    },
    {
      status: 'cancelado',
      titulo: 'Cancelados',
      icone: XCircle,
      cor: 'from-red-500 to-red-600',
      corFundo: 'bg-red-50',
      corBorda: 'border-red-200',
      quantidade: estatisticas.cancelado
    }
  ]

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Content */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                {isVendedor() ? 'Seus orçamentos' : 'Visão geral dos orçamentos'}
              </p>
            </div>
            <button
              onClick={() => navigate('/orcamentos/novo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Novo Orçamento
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Estatísticas Gerais */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Estatísticas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {statusCards.map((card) => {
              const IconComponent = card.icone
              return (
                <button
                  key={card.status}
                  onClick={() => navigate(`/orcamentos/status/${card.status}`)}
                  className={`${card.corFundo} border-2 ${card.corBorda} rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 bg-gradient-to-br ${card.cor} rounded-lg shadow-md`}>
                      <IconComponent className="text-white" size={24} />
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        {card.quantidade}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-600 group-hover:text-gray-900">
                    {card.titulo}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Últimos 5 Orçamentos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">
                Últimos Orçamentos
              </h2>
            </div>
            <button
              onClick={() => navigate('/orcamentos')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver todos →
            </button>
          </div>

          {ultimosOrcamentos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500">Nenhum orçamento criado ainda</p>
              <button
                onClick={() => navigate('/orcamentos/novo')}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={18} />
                Criar Primeiro Orçamento
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
              {ultimosOrcamentos.map((orc) => (
                <div
                  key={orc.id}
                  onClick={() => navigate(`/orcamentos/editar/${orc.id}`)}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Número */}
                      <div className="flex-shrink-0">
                        <div className="text-lg font-bold text-blue-600">
                          {orc.numero}
                        </div>
                        <div className="text-xs text-gray-500">
                          {orc.data_orcamento ? format(new Date(orc.data_orcamento), 'dd/MM/yyyy') : '-'}
                        </div>
                      </div>

                      {/* Cliente */}
                      <div className="flex items-center gap-2 flex-1">
                        <User size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {orc.cliente_nome || 'Sem cliente'}
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orc.status)}`}>
                          {orc.status?.toUpperCase() || 'RASCUNHO'}
                        </span>
                      </div>

                      {/* Valor */}
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          R$ {parseFloat(orc.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo Total */}
        <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">Total de Orçamentos</div>
              <div className="text-3xl font-bold mt-1">{estatisticas.total}</div>
            </div>
            <FileText size={48} className="opacity-20" />
          </div>
        </div>
      </div>
    </div>
  )
}
