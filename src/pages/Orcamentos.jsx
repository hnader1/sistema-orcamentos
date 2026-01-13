import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, FileText, Plus, Search, Edit2, Copy, Ban, Calendar, User, DollarSign 
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { format } from 'date-fns'

export default function Orcamentos() {
  const navigate = useNavigate()
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  useEffect(() => {
    carregarOrcamentos()
  }, [])

  const carregarOrcamentos = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Carregando orçamentos (excluido = false)')
      
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('excluido', false)
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
    const matchBusca = !busca || 
      orc.numero?.toLowerCase().includes(busca.toLowerCase()) ||
      orc.cliente_nome?.toLowerCase().includes(busca.toLowerCase()) ||
      orc.cliente_empresa?.toLowerCase().includes(busca.toLowerCase())
    
    const matchStatus = filtroStatus === 'todos' || orc.status === filtroStatus
    
    return matchBusca && matchStatus
  })

  const cancelar = async (id, numero) => {
    if (!confirm(`Tem certeza que deseja CANCELAR o orçamento ${numero}?\n\nO orçamento será marcado como CANCELADO.`)) return

    try {
      console.log('🚫 Cancelando orçamento:', numero, 'ID:', id)
      
      // Marcar como cancelado
      const { error } = await supabase
        .from('orcamentos')
        .update({ 
          status: 'cancelado'
        })
        .eq('id', id)

      if (error) {
        console.error('❌ Erro ao cancelar:', error)
        throw error
      }

      console.log('✅ Orçamento cancelado')
      
      alert('Orçamento cancelado com sucesso!')
      carregarOrcamentos()
    } catch (error) {
      console.error('❌ Erro ao cancelar:', error)
      alert('Erro ao cancelar orçamento: ' + (error.message || 'Erro desconhecido'))
    }
  }

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
      carregarOrcamentos()
    } catch (error) {
      console.error('❌ Erro ao duplicar:', error)
      alert('Erro ao duplicar orçamento: ' + error.message)
    }
  }

  const getStatusBadge = (status) => {
    const styles = {
      'rascunho': 'bg-gray-100 text-gray-800',
      'enviado': 'bg-blue-100 text-blue-800',
      'aprovado': 'bg-green-100 text-green-800',
      'rejeitado': 'bg-red-100 text-red-800',
      'cancelado': 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.rascunho}`}>
        {status?.toUpperCase() || 'RASCUNHO'}
      </span>
    )
  }

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
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orçamentos</h1>
                  <p className="text-xs sm:text-sm text-gray-500">{orcamentos.length} orçamentos</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/orcamentos/novo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Novo Orçamento</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filtros */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, cliente ou empresa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos os Status</option>
            <option value="rascunho">Rascunho</option>
            <option value="enviado">Enviado</option>
            <option value="aprovado">Aprovado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Lista de Orçamentos */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            Carregando...
          </div>
        ) : orcamentosFiltrados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            {busca || filtroStatus !== 'todos' ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento cadastrado'}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {orcamentosFiltrados.map((orc) => (
              <div key={orc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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
                        <span>{orc.data_orcamento ? format(new Date(orc.data_orcamento), 'dd/MM/yyyy') : '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          R$ {parseFloat(orc.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    {orc.status !== 'cancelado' && (
                      <button
                        onClick={() => cancelar(orc.id, orc.numero)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Cancelar"
                      >
                        <Ban size={20} />
                      </button>
                    )}
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
