// ====================================================================================
// PÁGINA DE ORÇAMENTOS FILTRADOS POR STATUS - CONSTRUCOM
// ====================================================================================
// Descrição: Exibe orçamentos filtrados por um status específico
// Autor: Nader
// Última atualização: Janeiro 2026
//
// FUNCIONALIDADES:
// - Filtragem automática por status (vem da URL: /orcamentos/status/:status)
// - Busca por número, cliente ou empresa
// - Ações: Editar e Duplicar
// - Header personalizado com ícone e cor do status
// - Permissões: Vendedor vê apenas seus orçamentos, outros veem todos
//
// STATUS SUPORTADOS:
// - rascunho, enviado, aprovado, lancado, cancelado
//
// MELHORIAS RECENTES:
// - Layout compacto (2 linhas por orçamento)
// - Nome do cliente ao lado do número (#ORC-0010 • Nome Cliente)
// - Badge de status posicionado ao lado dos botões de ação
// - Cidade do cadastro incluída nas informações
// - ✅ DESCONTO ZERADO ao duplicar (requer nova autorização)
// ====================================================================================

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, Search, Edit2, Copy, FileText, Calendar, User, DollarSign,
  Edit, Send, CheckCircle, XCircle, Briefcase, MapPin, PackageCheck
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function OrcamentosStatus() {
  const navigate = useNavigate()
  const { status } = useParams() // Pega o status da URL
  const { user, isVendedor } = useAuth()
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')

  // ====================================================================================
  // CARREGAMENTO INICIAL DE DADOS
  // ====================================================================================
  useEffect(() => {
    carregarOrcamentos()
  }, [status, user])

  const carregarOrcamentos = async () => {
    try {
      setLoading(true)
      console.log('📊 Carregando orçamentos com status:', status)
      
      // Query base: busca orçamentos não excluídos com o status específico
      let query = supabase
        .from('orcamentos')
        .select('*')
        .eq('excluido', false)
        .eq('status', status)
      
      // Se for vendedor, filtrar apenas seus orçamentos
      if (isVendedor()) {
        query = query.eq('usuario_id', user.id)
      }
      
      const { data, error } = await query
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

  // ====================================================================================
  // FILTRO DE BUSCA
  // ====================================================================================
  const orcamentosFiltrados = orcamentos.filter(orc => {
    if (!busca) return true
    
    const buscaLower = busca.toLowerCase()
    return (
      orc.numero?.toLowerCase().includes(buscaLower) ||
      orc.cliente_nome?.toLowerCase().includes(buscaLower) ||
      orc.cliente_empresa?.toLowerCase().includes(buscaLower)
    )
  })

  // ====================================================================================
  // AÇÃO: DUPLICAR ORÇAMENTO - CORRIGIDO (DESCONTO ZERADO)
  // ====================================================================================
  const duplicar = async (id) => {
    if (!confirm('Deseja duplicar este orçamento?\n\n⚠️ O desconto será zerado (nova proposta requer nova autorização).')) return

    try {
      console.log('📋 [DUPLICAR] Duplicando orçamento ID:', id)
      
      // Busca o orçamento original
      const { data: original, error: errorOrc } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single()

      if (errorOrc) throw errorOrc

      // Busca os itens do orçamento
      const { data: itens, error: errorItens } = await supabase
        .from('orcamentos_itens')
        .select('*')
        .eq('orcamento_id', id)

      if (errorItens) throw errorItens

      // Gerar novo número sequencial
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

      console.log('📝 [DUPLICAR] Novo número gerado:', novoNumero)
      console.log('📝 [DUPLICAR] Desconto original:', original.desconto_geral, '→ Novo: 0')

      // ✅ CORREÇÃO: Criar objeto novo explicitamente, DESCONTO = 0
      const novoOrcamento = {
        numero: novoNumero,
        numero_proposta: null, // Será gerado novo ao salvar
        cliente_nome: original.cliente_nome,
        cliente_empresa: original.cliente_empresa,
        cliente_email: original.cliente_email,
        cliente_telefone: original.cliente_telefone,
        cliente_cpf_cnpj: original.cliente_cpf_cnpj,
        endereco_entrega: original.endereco_entrega,
        vendedor: user?.nome || original.vendedor,
        vendedor_telefone: user?.telefone || original.vendedor_telefone,
        vendedor_email: user?.email || original.vendedor_email,
        data_orcamento: new Date().toISOString().split('T')[0],
        validade_dias: original.validade_dias || 15,
        data_validade: original.data_validade,
        forma_pagamento_id: original.forma_pagamento_id,
        prazo_entrega: original.prazo_entrega,
        // ✅ DESCONTO ZERADO - nova proposta requer nova autorização
        desconto_geral: 0,
        subtotal: original.subtotal,
        frete: original.frete,
        frete_modalidade: original.frete_modalidade || 'FOB',
        frete_qtd_viagens: original.frete_qtd_viagens || 0,
        frete_valor_viagem: original.frete_valor_viagem || 0,
        frete_cidade: original.frete_cidade,
        frete_tipo_caminhao: original.frete_tipo_caminhao,
        frete_manual: original.frete_manual || false,
        frete_valor_manual_viagem: original.frete_valor_manual_viagem,
        frete_qtd_manual_viagens: original.frete_qtd_manual_viagens,
        observacao_frete_manual: original.observacao_frete_manual,
        total: original.subtotal + (original.frete || 0), // Recalcular sem desconto
        observacoes: original.observacoes,
        observacoes_internas: original.observacoes_internas,
        status: 'rascunho',
        excluido: false,
        numero_lancamento_erp: null,
        data_lancamento: null,
        lancado_por: null,
        usuario_id: user?.id || null,
        // Campos de CNPJ/CPF
        cnpj_cpf: original.cnpj_cpf,
        cnpj_cpf_nao_informado: original.cnpj_cpf_nao_informado || false,
        cnpj_cpf_nao_informado_aceite_data: original.cnpj_cpf_nao_informado_aceite_data,
        cnpj_cpf_nao_informado_aceite_ip: null,
        // Campos de endereço da obra
        obra_cep: original.obra_cep,
        obra_cidade: original.obra_cidade,
        obra_bairro: original.obra_bairro,
        obra_logradouro: original.obra_logradouro,
        obra_numero: original.obra_numero,
        obra_complemento: original.obra_complemento,
        obra_endereco_validado: original.obra_endereco_validado || false,
        // ✅ CAMPOS DE DESCONTO ZERADOS
        desconto_liberado: false,
        desconto_liberado_por: null,
        desconto_liberado_por_id: null,
        desconto_liberado_em: null,
        desconto_valor_liberado: null
      }

      console.log('📦 [DUPLICAR] Dados do novo orçamento (desconto_geral=0):', novoOrcamento.desconto_geral)

      const { data: orcCriado, error: errorCriar } = await supabase
        .from('orcamentos')
        .insert([novoOrcamento])
        .select()
        .single()

      if (errorCriar) {
        console.error('❌ [DUPLICAR] Erro ao criar orçamento:', errorCriar)
        throw errorCriar
      }

      console.log('✅ [DUPLICAR] Orçamento duplicado com ID:', orcCriado.id)
      console.log('✅ [DUPLICAR] desconto_geral no banco:', orcCriado.desconto_geral)

      // Copia os itens para o novo orçamento
      if (itens && itens.length > 0) {
        const novosItens = itens.map(item => ({
          orcamento_id: orcCriado.id,
          produto_id: item.produto_id,
          produto_codigo: item.produto_codigo,
          produto: item.produto,
          classe: item.classe,
          mpa: item.mpa,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          peso_unitario: item.peso_unitario,
          qtd_por_pallet: item.qtd_por_pallet,
          subtotal: item.subtotal,
          ordem: item.ordem
        }))

        console.log(`📦 [DUPLICAR] Copiando ${novosItens.length} produtos...`)

        const { error: errorItensNovos } = await supabase
          .from('orcamentos_itens')
          .insert(novosItens)

        if (errorItensNovos) {
          console.error('❌ [DUPLICAR] Erro ao copiar itens:', errorItensNovos)
          throw errorItensNovos
        }
        
        console.log('✅ [DUPLICAR] Produtos copiados!')
      }

      alert(`Orçamento duplicado com sucesso!\nNovo número: ${novoNumero}\n\n⚠️ Desconto zerado - solicite nova autorização se necessário.`)
      navigate(`/orcamentos/editar/${orcCriado.id}`)
    } catch (error) {
      console.error('❌ [DUPLICAR] Erro ao duplicar:', error)
      alert('Erro ao duplicar orçamento: ' + error.message)
    }
  }

  // ====================================================================================
  // CONFIGURAÇÕES DE VISUAL POR STATUS
  // ====================================================================================
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
      'lancado': {
        titulo: 'Lançados',
        icone: Briefcase,
        cor: 'text-purple-600',
        corFundo: 'bg-purple-100'
      },
      'finalizado': {
        titulo: 'Finalizados',
        icone: PackageCheck,
        cor: 'text-teal-600',
        corFundo: 'bg-teal-100'
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

  // ====================================================================================
  // COMPONENTE DE BADGE DE STATUS
  // ====================================================================================
  const getStatusBadge = (statusName) => {
    const styles = {
      'rascunho': 'bg-gray-100 text-gray-700 border border-gray-200',
      'enviado': 'bg-blue-100 text-blue-700 border border-blue-200',
      'aprovado': 'bg-green-100 text-green-700 border border-green-200',
      'lancado': 'bg-purple-100 text-purple-700 border border-purple-200',
      'finalizado': 'bg-teal-100 text-teal-700 border border-teal-200',
      'cancelado': 'bg-red-100 text-red-700 border border-red-200'
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[statusName] || styles.rascunho}`}>
        {statusName?.toUpperCase() || 'RASCUNHO'}
      </span>
    )
  }

  const statusInfo = getStatusInfo(status)
  const StatusIcon = statusInfo.icone

  // ====================================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ====================================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* ==================================================================== */}
      {/* HEADER DA PÁGINA - COM ÍCONE E COR DO STATUS */}
      {/* ==================================================================== */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/orcamentos')}
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
                    {isVendedor() ? 'Seus orçamentos' : `${orcamentosFiltrados.length} orçamentos`}
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
        {/* ==================================================================== */}
        {/* CAMPO DE BUSCA */}
        {/* ==================================================================== */}
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

        {/* ==================================================================== */}
        {/* LISTA DE ORÇAMENTOS - LAYOUT COMPACTO */}
        {/* ==================================================================== */}
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
          <div className="grid grid-cols-1 gap-3">
            {orcamentosFiltrados.map((orc) => (
              <div 
                key={orc.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Coluna Esquerda: Informações do Orçamento */}
                  <div className="flex-1 min-w-0">
                    {/* Linha 1: Número • Nome do Cliente */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900">
                        <h3 className="text-base font-bold text-gray-900">
  {orc.numero_proposta ? (
    <span className="text-purple-700">{orc.numero_proposta}</span>
  ) : (
    <span className="text-gray-400">#{orc.numero}</span>
  )}
</h3>
                      </h3>
                      <span className="text-blue-600 font-semibold">•</span>
                      <span className="text-gray-700 font-medium truncate">
                        {orc.cliente_nome || 'Sem cliente'}
                      </span>
                      {/* Badge ERP se existir */}
                      {orc.numero_lancamento_erp && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium border border-purple-200">
                          ERP: {orc.numero_lancamento_erp}
                        </span>
                      )}
                    </div>
                    
                    {/* Linha 2: Cidade | Valor | Data | Vendedor */}
                    <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                      {orc.cidade && (
                        <>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-gray-400" />
                            <span>{orc.cidade}</span>
                          </div>
                          <span className="text-gray-300">|</span>
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} className="text-blue-500" />
                        <span className="font-semibold text-gray-900">
                          R$ {parseFloat(orc.total || 0).toLocaleString('pt-BR', { 
                            minimumFractionDigits: 2 
                          })}
                        </span>
                      </div>
                      <span className="text-gray-300">|</span>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span>
                          {orc.data_orcamento 
                            ? format(new Date(orc.data_orcamento), 'dd/MM/yyyy') 
                            : '-'
                          }
                        </span>
                      </div>
                      {orc.vendedor && (
                        <>
                          <span className="text-gray-300">|</span>
                          <div className="flex items-center gap-1">
                            <User size={14} className="text-gray-400" />
                            <span className="text-xs">{orc.vendedor}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Coluna Direita: Badge Status + Botões de Ação */}
                  <div className="flex flex-col items-end gap-2">
                    {/* Badge de Status */}
                    {getStatusBadge(orc.status)}
                    
                    {/* Botões de Ação */}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ====================================================================================
// NOTAS IMPORTANTES PARA FUTURAS MODIFICAÇÕES:
// ====================================================================================
//
// 1. ESTRUTURA DO LAYOUT:
//    - Cards organizados em 2 linhas por orçamento
//    - Linha 1: #Número • Nome do Cliente [+ Badge ERP se existir]
//    - Linha 2: 📍 Cidade | 💰 Valor | 📅 Data | 👤 Vendedor
//    - Badge de status posicionado acima dos botões de ação (lado direito)
//
// 2. DIFERENÇAS COM A PÁGINA PRINCIPAL:
//    - Esta página filtra por UM status específico (vem da URL)
//    - Não tem botão "Cancelar" (apenas Editar e Duplicar)
//    - Não tem cards de estatísticas no topo
//    - Não tem seção "Últimos 5"
//
// 3. BUSCA:
//    - Busca por texto: número, nome do cliente ou empresa
//    - Já está filtrado por status (não tem filtro adicional de status)
//
// 4. HEADER PERSONALIZADO:
//    - Muda cor e ícone conforme o status
//    - Rascunho: Cinza + ícone de lápis
//    - Enviado: Azul + ícone de envio
//    - Aprovado: Verde + ícone de check
//    - Lançado: Roxo + ícone de maleta
//    - Cancelado: Vermelho + ícone de X
//
// 5. BADGE ERP:
//    - Se o orçamento foi lançado no ERP, mostra o número do lançamento
//    - Aparece na Linha 1, após o nome do cliente
//
// 6. CAMPOS NECESSÁRIOS NO BANCO (tabela orcamentos):
//    - numero (string) - Número do orçamento formato ORC-0001
//    - cliente_nome (string) - Nome do cliente
//    - cliente_empresa (string) - Nome da empresa
//    - cidade (string) - Cidade do cadastro (IMPORTANTE: garantir que está sendo buscado)
//    - total (decimal) - Valor total do orçamento
//    - data_orcamento (date) - Data de criação
//    - vendedor (string) - Nome do vendedor
//    - status (enum) - Fixo nesta página, vem da URL
//    - excluido (boolean) - Sempre false
//    - usuario_id (uuid) - ID do vendedor responsável
//    - numero_lancamento_erp (string) - Número do lançamento no ERP (opcional)
//
// 7. NAVEGAÇÃO:
//    - Ao duplicar, redireciona para edição do novo orçamento
//    - Botão voltar retorna para /orcamentos (página principal)
//
// 8. QUERIES DO SUPABASE:
//    Certifique-se que a query está buscando todos os campos:
//    .select('*, cidade, vendedor, usuarios!orcamentos_usuario_id_fkey!inner(nome)')
//
// 9. DUPLICAÇÃO:
//    - ✅ DESCONTO É ZERADO ao duplicar (nova proposta requer nova autorização)
//    - Campos de desconto_liberado também são resetados
//
// ====================================================================================
