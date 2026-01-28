// src/pages/AdminResetRevisao.jsx
// =====================================================
// PAINEL ADMIN: Reset de Contagem de Revisão
// Permite resetar propostas de "NH-26-0014 Rev.2" para "NH-26-0014"
// =====================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  ArrowLeft, 
  RefreshCcw, 
  Search, 
  AlertTriangle,
  Check,
  X,
  FileText
} from 'lucide-react'

export default function AdminResetRevisao() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [confirmando, setConfirmando] = useState(null)
  const [processando, setProcessando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  // Buscar orçamentos com revisão (Rev. no numero_proposta ou revisao > 0)
  useEffect(() => {
    carregarOrcamentos()
  }, [])

  const carregarOrcamentos = async () => {
    setLoading(true)
    try {
      // Buscar TODOS os orçamentos e filtrar no cliente os que têm Rev.
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          id,
          numero_proposta,
          revisao,
          cliente_nome,
          cliente_empresa,
          status,
          created_at,
          usuarios:usuario_id (nome, codigo)
        `)
        .order('updated_at', { ascending: false })
        .limit(500)

      if (error) throw error
      
      // Filtrar apenas os que têm "Rev." no numero_proposta OU revisao > 0
      const comRevisao = (data || []).filter(o => {
        const temRevNoNome = o.numero_proposta?.includes('Rev.')
        const temRevisaoNumero = o.revisao && o.revisao > 0
        return temRevNoNome || temRevisaoNumero
      })

      // Extrair número da revisão do nome se não tiver no campo
      const processados = comRevisao.map(o => {
        let revisaoNum = o.revisao || 0
        if (!revisaoNum && o.numero_proposta) {
          const match = o.numero_proposta.match(/Rev\.(\d+)/)
          if (match) {
            revisaoNum = parseInt(match[1], 10)
          }
        }
        return { ...o, revisao: revisaoNum }
      })

      // Ordenar por revisão decrescente
      processados.sort((a, b) => (b.revisao || 0) - (a.revisao || 0))

      setOrcamentos(processados)
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar orçamentos: ' + error.message })
    } finally {
      setLoading(false)
    }
  }

  // Resetar revisão de um orçamento específico
  const resetarRevisao = async (orcamento) => {
    setProcessando(true)
    try {
      // Extrair número base (sem Rev.X)
      const numeroBase = orcamento.numero_proposta.replace(/ Rev\.\d+$/, '')

      // Atualizar orçamento
      const { error: erroOrcamento } = await supabase
        .from('orcamentos')
        .update({
          revisao: 0,
          numero_proposta: numeroBase
        })
        .eq('id', orcamento.id)

      if (erroOrcamento) throw erroOrcamento

      // Registrar log (se tabela existir)
      try {
        await supabase
          .from('propostas_revisoes')
          .insert({
            orcamento_id: orcamento.id,
            proposta_id: null,
            numero_revisao: 0,
            editado_por_id: user?.id,
            editado_por_nome: user?.nome || 'Admin',
            editado_em: new Date().toISOString(),
            campos_alterados: { _reset_revisao: true },
            valores_anteriores: { 
              numero_proposta: orcamento.numero_proposta,
              revisao: orcamento.revisao
            },
            valores_novos: { 
              numero_proposta: numeroBase,
              revisao: 0
            },
            motivo: 'Reset manual de revisão pelo administrador',
            status_anterior: orcamento.status,
            status_novo: orcamento.status
          })
      } catch (e) {
        console.warn('Aviso: Não foi possível registrar log de reset:', e)
      }

      setMensagem({ 
        tipo: 'sucesso', 
        texto: `Revisão resetada! ${orcamento.numero_proposta} → ${numeroBase}` 
      })
      
      // Atualizar lista
      setOrcamentos(prev => prev.filter(o => o.id !== orcamento.id))
      setConfirmando(null)

    } catch (error) {
      console.error('Erro ao resetar revisão:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao resetar revisão: ' + error.message })
    } finally {
      setProcessando(false)
    }
  }

  // Filtrar orçamentos pela busca
  const orcamentosFiltrados = orcamentos.filter(o => {
    const termo = busca.toLowerCase()
    return (
      o.numero_proposta?.toLowerCase().includes(termo) ||
      o.cliente_nome?.toLowerCase().includes(termo) ||
      o.cliente_empresa?.toLowerCase().includes(termo)
    )
  })

  // Formatar data
  const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  // Status badge
  const statusBadge = (status) => {
    const cores = {
      rascunho: 'bg-gray-100 text-gray-800',
      enviado: 'bg-blue-100 text-blue-800',
      aprovado: 'bg-green-100 text-green-800',
      recusado: 'bg-red-100 text-red-800',
      revisada: 'bg-yellow-100 text-yellow-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${cores[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Reset de Revisão</h1>
              <p className="text-sm text-gray-500">
                Remover sufixo Rev.X de propostas específicas
              </p>
            </div>
          </div>
          <button
            onClick={carregarOrcamentos}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            <RefreshCcw size={18} />
            Atualizar
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Mensagem */}
        {mensagem && (
          <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            mensagem.tipo === 'sucesso' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {mensagem.tipo === 'sucesso' ? <Check size={20} /> : <AlertTriangle size={20} />}
            {mensagem.texto}
            <button 
              onClick={() => setMensagem(null)}
              className="ml-auto hover:opacity-70"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, cliente ou empresa..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Info */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Atenção: Esta operação é irreversível!</p>
            <p>
              O reset remove o sufixo "Rev.X" do número da proposta e zera o contador de revisões.
              Use apenas quando realmente necessário, como em casos de teste ou correção.
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Proposta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Revisão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Data
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : orcamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <FileText className="mx-auto mb-2 text-gray-300" size={40} />
                    {busca 
                      ? 'Nenhum orçamento encontrado com essa busca'
                      : 'Nenhum orçamento com revisão encontrado'
                    }
                  </td>
                </tr>
              ) : (
                orcamentosFiltrados.map((orcamento) => (
                  <tr key={orcamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {orcamento.numero_proposta}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{orcamento.cliente_nome}</div>
                      <div className="text-xs text-gray-500">{orcamento.cliente_empresa}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {orcamento.usuarios?.codigo || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                        Rev.{orcamento.revisao}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(orcamento.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatarData(orcamento.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {confirmando === orcamento.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-gray-500">Confirmar?</span>
                          <button
                            onClick={() => resetarRevisao(orcamento)}
                            disabled={processando}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {processando ? 'Aguarde...' : 'Sim'}
                          </button>
                          <button
                            onClick={() => setConfirmando(null)}
                            disabled={processando}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmando(orcamento.id)}
                          className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 flex items-center gap-2 ml-auto"
                        >
                          <RefreshCcw size={16} />
                          Resetar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Contador */}
        {!loading && orcamentosFiltrados.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            {orcamentosFiltrados.length} orçamento(s) com revisão encontrado(s)
          </div>
        )}
      </main>
    </div>
  )
}
