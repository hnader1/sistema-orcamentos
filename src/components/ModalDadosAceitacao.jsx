// ====================================================================================
// MODAL DE DADOS DA ACEITAÇÃO - CONSTRUCOM
// ====================================================================================
// Descrição: Modal para visualizar os dados que o cliente preencheu na aceitação
// Acesso: Apenas Admin e Comercial Interno
// ====================================================================================

import { useState, useEffect } from 'react'
import { X, FileText, User, Building, Calendar, MapPin, Phone, Mail, Shield, Download, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '../services/supabase'
import { format } from 'date-fns'

export default function ModalDadosAceitacao({ orcamentoId, onClose }) {
  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (orcamentoId) {
      carregarDados()
    }
  }, [orcamentoId])

  const carregarDados = async () => {
    try {
      setLoading(true)
      setErro(null)

      // Buscar proposta aceita do orçamento
      const { data: proposta, error: erroProposta } = await supabase
        .from('propostas')
        .select(`
          *,
          aceites(*),
          dados_cliente_proposta(*),
          documentos_proposta(*)
        `)
        .eq('orcamento_id', orcamentoId)
        .eq('status', 'aceita')
        .order('data_aceite', { ascending: false })
        .limit(1)
        .single()

      if (erroProposta) {
        console.error('Erro ao buscar proposta:', erroProposta)
        setErro('Não foi possível carregar os dados da aceitação')
        return
      }

      if (!proposta) {
        setErro('Nenhuma proposta aceita encontrada para este orçamento')
        return
      }

      // Pegar o aceite mais recente
      const aceite = proposta.aceites?.[0] || null
      
      // Pegar os dados do cliente preenchidos na aceitação (origem = 'cliente')
      const dadosCliente = proposta.dados_cliente_proposta?.find(d => d.origem === 'cliente') 
        || proposta.dados_cliente_proposta?.[0] 
        || null

      // Montar objeto com todos os dados
      setDados({
        proposta,
        aceite,
        dadosCliente,
        documentos: proposta.documentos_proposta || []
      })

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      setErro('Erro ao carregar dados da aceitação')
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data) => {
    if (!data) return '-'
    return format(new Date(data), "dd/MM/yyyy 'às' HH:mm")
  }

  const formatarTamanho = (bytes) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getTipoClienteLabel = (tipo) => {
    const tipos = {
      'consumidor_final': '🏠 Consumidor Final',
      'revenda': '🏪 Revenda',
      'construtor': '👷 Construtor'
    }
    return tipos[tipo] || tipo || '-'
  }

  const getTipoDocLabel = (tipo) => {
    const tipos = {
      'contrato_social': '📄 Contrato Social',
      'comprovante_endereco': '🏠 Comprovante de Endereço',
      'documento_identidade': '🪪 Documento de Identidade',
      'cartao_cnpj': '🏢 Cartão CNPJ',
      'outro': '📁 Outro Documento'
    }
    return tipos[tipo] || tipo
  }

  const baixarDocumento = async (doc) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos-propostas')
        .createSignedUrl(doc.storage_path, 3600) // 1 hora de validade

      if (error) throw error
      
      window.open(data.signedUrl, '_blank')
    } catch (error) {
      console.error('Erro ao baixar documento:', error)
      alert('Erro ao baixar documento. Tente novamente.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Dados da Aceitação</h2>
              <p className="text-emerald-100 text-sm">Informações preenchidas pelo cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="text-white" size={24} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            </div>
          )}

          {erro && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="mx-auto text-red-500 mb-3" size={48} />
              <p className="text-red-700 font-medium">{erro}</p>
            </div>
          )}

          {dados && !loading && (
            <div className="space-y-6">
              
              {/* Seção: Informações da Aprovação */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} />
                  Aprovação Registrada
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-emerald-600 font-medium">Data/Hora:</span>
                    <p className="text-emerald-900 font-semibold">
                      {formatarData(dados.aceite?.data_hora_aceite || dados.proposta?.data_aceite)}
                    </p>
                  </div>
                  <div>
                    <span className="text-emerald-600 font-medium">Proposta:</span>
                    <p className="text-emerald-900 font-semibold">{dados.proposta?.numero_proposta}</p>
                  </div>
                  {dados.aceite?.ip_cliente && (
                    <div>
                      <span className="text-emerald-600 font-medium">IP do Cliente:</span>
                      <p className="text-emerald-900">{dados.aceite.ip_cliente}</p>
                    </div>
                  )}
                  {dados.aceite?.lgpd_aceito && (
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-emerald-600" />
                      <span className="text-emerald-700">LGPD aceita em {formatarData(dados.aceite.lgpd_aceito_em)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção: Dados Fiscais do Cliente */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Building size={18} />
                  Dados Fiscais (Preenchido pelo Cliente)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600 font-medium">Contribuinte ICMS:</span>
                    <p className={`font-semibold ${
                      dados.dadosCliente?.contribuinte_icms || dados.aceite?.dados_confirmados?.contribuinte_icms
                        ? 'text-green-600' 
                        : 'text-gray-600'
                    }`}>
                      {(dados.dadosCliente?.contribuinte_icms || dados.aceite?.dados_confirmados?.contribuinte_icms) 
                        ? '✅ Sim' 
                        : '❌ Não'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Inscrição Estadual:</span>
                    <p className="text-blue-900 font-semibold">
                      {dados.dadosCliente?.inscricao_estadual 
                        || dados.aceite?.dados_confirmados?.inscricao_estadual 
                        || 'ISENTO'}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Tipo de Cliente:</span>
                    <p className="text-blue-900 font-semibold">
                      {getTipoClienteLabel(
                        dados.dadosCliente?.tipo_cliente || dados.aceite?.dados_confirmados?.tipo_cliente
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">Razão Social:</span>
                    <p className="text-blue-900 font-semibold">
                      {dados.dadosCliente?.razao_social || dados.aceite?.dados_confirmados?.razao_social || '-'}
                    </p>
                  </div>
                  {dados.dadosCliente?.nome_fantasia && (
                    <div className="col-span-2">
                      <span className="text-blue-600 font-medium">Nome Fantasia:</span>
                      <p className="text-blue-900">{dados.dadosCliente.nome_fantasia}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção: Observações do Cliente */}
              {dados.aceite?.observacao_cliente && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <FileText size={18} />
                    Observações do Cliente
                  </h3>
                  <div className="bg-white border border-amber-100 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{dados.aceite.observacao_cliente}</p>
                  </div>
                </div>
              )}

              {/* Seção: Documentos Anexados */}
              {dados.documentos && dados.documentos.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                    <FileText size={18} />
                    Documentos Anexados ({dados.documentos.length})
                  </h3>
                  <div className="space-y-2">
                    {dados.documentos.map((doc) => (
                      <div 
                        key={doc.id}
                        className="bg-white border border-purple-100 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <FileText className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{doc.nome_arquivo}</p>
                            <p className="text-xs text-gray-500">
                              {getTipoDocLabel(doc.tipo_documento)} • {formatarTamanho(doc.tamanho_bytes)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => baixarDocumento(doc)}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Download size={16} />
                          Baixar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sem documentos */}
              {(!dados.documentos || dados.documentos.length === 0) && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
                  <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500 text-sm">Nenhum documento anexado pelo cliente</p>
                </div>
              )}

              {/* Dados técnicos (para admin) */}
              <details className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                <summary className="px-4 py-3 cursor-pointer text-gray-600 text-sm font-medium hover:bg-gray-100">
                  🔧 Dados Técnicos (Debug)
                </summary>
                <div className="px-4 py-3 border-t border-gray-200">
                  <pre className="text-xs text-gray-600 overflow-x-auto">
                    {JSON.stringify({
                      proposta_id: dados.proposta?.id,
                      aceite_id: dados.aceite?.id,
                      dados_confirmados: dados.aceite?.dados_confirmados,
                      user_agent: dados.aceite?.user_agent?.substring(0, 100) + '...'
                    }, null, 2)}
                  </pre>
                </div>
              </details>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
