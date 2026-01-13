import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, Search, Edit2, Copy, FileText, Calendar, User, DollarSign,
  Edit, Send, CheckCircle, XCircle
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { format } from 'date-fns'

export default function OrcamentosStatus() {
  const navigate = useNavigate()
  const { status } = useParams()
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    carregarOrcamentos()
  }, [status])

  const carregarOrcamentos = async () => {
    try {
      setLoading(true)
      console.log('📊 Carregando orçamentos com status:', status)
      
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('excluido', false)
        .eq('status', status)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('✅ Orçamentos carregados:', data?.length || 0)
      setOrcamentos(data || [])
    } catch (error) {
      console.error('❌ Erro ao carregar orçamentos:', error)
      alert('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  const orcamentosFiltrados = orcamentos.filter(orc => {
    if (!busca) return true
    
    const buscaLower = busca.toLowerCase()
    return (
      orc.numero?.toLowerCase().includes(buscaLower) ||
      orc.cliente_nome?.toLowerCase().includes(buscaLower) ||
      orc.cliente_empresa?.toLowerCase().includes(buscaLower)
    )
  })

  const duplicar = async (id) => {
    try {
      console.log('📋 Duplicando orçamento ID:', id)
      
      const { data: original, error: errorOrc } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single()

      if (errorOrc) throw errorOrc

      const { data: itens, error: errorItens } = await supabase
        .from('orcamentos_itens')
        .select('*')
        .eq('orcamento_id', id)

      if (errorItens) throw errorItens

      // Gerar novo número
      const { data: ultimoOrc, error: errorUltimo } = await supabase
        .from('orcamentos')
        .select('numero')
        .order('created_at', { ascending: false })
        .limit(1)

      if (errorUltimo) throw errorUltimo

      let novoNumero = 'ORC-0001'
      if (ultimoOrc && ultimoOrc.length > 0) {
        const ultimoNumero = ultimoOrc[0].numero
        const numero = parseInt(ultimoNumero.split('-')[1]) + 1
        novoNumero = `ORC-${numero.toString().padStart(4, '0')}`
      }

      console.log('📝 Novo número gerado:', novoNumero)

      const novoOrcamento = {
        ...original,
        id: undefined,
        numero: novoNumero,
        status: 'rascunho',
        excluido: false,
        data_exclusao: null,
        created_at: undefined,
        updated_at: undefined
      }

      const { data: orcCriado, error: errorCriar } = await supabase
        .from('orcamentos')
        .insert([novoOrcamento])
        .select()
        .single()

      if (errorCriar) throw errorCriar

      console.log('✅ Orçamento duplicado com ID:', orcCriado.id)

      if (itens && itens.length > 0) {
        const novosItens = itens.map(item => ({
          ...item,
          id: undefined,
          orcamento_id: orcCriado.id,
          created_at: undefined
        }))

        console.log(`📦 Copiando ${novosItens.length} produtos...`)

        const { error: errorItensNovos } = await supabase
          .from('orcamentos_itens')
          .insert(novosItens)

        if (errorItensNovos) throw errorItensNovos
        
        console.log('✅ Produtos copiados!')
      }

      alert('Orçamento duplicado com sucesso!')
      navigate(`/orcamentos/editar/${orcCriado.id}`)
    } catch (error) {
      console.error('❌ Erro ao duplicar:', error)
      alert('Erro ao duplicar orçamento: ' + error.message)
    }
  }

  const getStatusInfo = (statusName) => {
    const statusMap = {
      'rascunho': {
        titulo: 'Rascunhos',
        icone: Edit,
        cor: 'text-gray-600',
        corFundo: 'bg-gray-100'
      },
      'enviado': {
        titulo: 'Enviados',
        icone: Send,
        cor: 'text-blue-600',
        corFundo: 'bg-blue-100'
      },
      'aprovado': {
        titulo: 'Aprovados',
        icone: CheckCircle,
        cor: 'text-green-600',
        corFundo: 'bg-green-100'
      },
      'cancelado': {
        titulo: 'Cancelados',
        icone: XCircle,
        cor: 'text-red-600',
        corFundo: 'bg-red-100'
      }
    }
    return statusMap[statusName] || statusMap.rascunho
  }

  const getStatusBadge = (statusName) => {
    const styles = {
      'rascunho': 'bg-gray-100 text-gray-800',
      'enviado': 'bg-blue-100 text-blue-800',
      'aprovado': 'bg-green-100 text-green-800',
      'cancelado': 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[statusName] || styles.rascunho}`}>
        {statusName?.toUpperCase() || 'RASCUNHO'}
      </span>
    )
  }

  const statusInfo = getStatusInfo(status)
  const StatusIcon = statusInfo.icone

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <div className={`w-10 h-10 ${statusInfo.corFundo} rounded-lg flex items-center justify-center`}>
                  <StatusIcon className={statusInfo.cor} size={24} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {statusInfo.titulo}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {orcamentosFiltrados.length} orçamentos
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/orcamentos/novo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FileText size={20} />
              <span className="hidden sm:inline">Novo Orçamento</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, cliente ou empresa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Orçamentos */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Carregando...
          </div>
        ) : orcamentosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <StatusIcon className={`mx-auto ${statusInfo.cor} mb-3`} size={48} />
            <p className="text-gray-500">
              {busca 
                ? 'Nenhum orçamento encontrado com esse filtro' 
                : `Nenhum orçamento ${statusInfo.titulo.toLowerCase()}`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orcamentosFiltrados.map((orc) => (
              <div 
                key={orc.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Orçamento #{orc.numero}
                      </h3>
                      {getStatusBadge(orc.status)}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <span>{orc.cliente_nome || 'Sem cliente'}</span>
                      </div>
                      {orc.cliente_empresa && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">•</span>
                          <span>{orc.cliente_empresa}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>
                          {orc.data_orcamento 
                            ? format(new Date(orc.data_orcamento), 'dd/MM/yyyy') 
                            : '-'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          R$ {parseFloat(orc.total || 0).toLocaleString('pt-BR', { 
                            minimumFractionDigits: 2 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/orcamentos/editar/${orc.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button
                      onClick={() => duplicar(orc.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
