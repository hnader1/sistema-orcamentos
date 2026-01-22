// ====================================================================================
// PÁGINA DE LISTAGEM DE ORÇAMENTOS - CONSTRUCOM
// ====================================================================================
// Descrição: Lista todos os orçamentos com filtros, estatísticas e ações
// Autor: Nader
// Última atualização: Janeiro 2026
//
// FUNCIONALIDADES:
// - Dashboard com cards de status (Rascunho, Enviado, Aprovado, Lançado, Cancelado)
// - Últimos 5 orçamentos em destaque
// - Lista completa com busca e filtros
// - Ações: Editar, Duplicar, Cancelar
// - Soft delete (marca como cancelado, não exclui do banco)
// - Permissões: Vendedor vê apenas seus orçamentos, outros veem todos
// - NOVO: Botão para ver dados da aceitação (Admin/Comercial Interno)
// - NOVO: Badge de origem da aprovação (Link/Manual)
//
// MELHORIAS RECENTES:
// - Layout compacto (2 linhas por orçamento)
// - Nome do cliente ao lado do número (#ORC-0010 • Nome Cliente)
// - Badge de status posicionado ao lado dos botões de ação
// - Cidade do cadastro incluída nas informações
// - Função duplicar corrigida: desconto zerado + campos de liberação resetados
// - Botão "Ver Dados da Aceitação" para orçamentos aprovados (Admin/Comercial)
// - Badge diferenciando aprovação via link vs manual
// ====================================================================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, FileText, Plus, Search, Edit2, Copy, Ban, Calendar, User, DollarSign,
  Edit, Send, CheckCircle, XCircle, Briefcase, TrendingUp, MapPin, PackageCheck, ClipboardList,
  Link as LinkIcon, Hand, Download
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import ModalDadosAceitacao from '../components/ModalDadosAceitacao'

export default function Orcamentos() {
  const navigate = useNavigate()
  const { user, isVendedor, isAdmin, isComercialInterno } = useAuth()
  const [orcamentos, setOrcamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [estatisticas, setEstatisticas] = useState({
    rascunho: 0,
    enviado: 0,
    aprovado: 0,
    lancado: 0,
    finalizado: 0,
    cancelado: 0
  })
  
  // Estado para o modal de dados da aceitação
  const [modalAceitacao, setModalAceitacao] = useState({
    aberto: false,
    orcamentoId: null
  })

  // Verificar se pode ver dados da aceitação (Admin ou Comercial Interno)
 // Verificar se pode ver dados da aceitação (Admin ou Comercial Interno)
  const podeVerDadosAceitacao = () => isAdmin() || isComercialInterno()

  // ====================================================================================
  // EXPORTAR PARA EXCEL
  // ====================================================================================
  const exportarExcel = () => {
    // Filtrar orçamentos conforme busca/filtro atual
    const dados = orcamentosFiltrados.flatMap(orc => {
      const itens = orc.orcamentos_itens || []
      if (itens.length === 0) {
        return [{
          numero: orc.numero,
          numero_proposta: orc.numero_proposta || '',
          data: orc.data_orcamento ? format(new Date(orc.data_orcamento), 'dd/MM/yyyy') : '',
          cliente: orc.cliente_nome || '',
          empresa: orc.cliente_empresa || '',
          cpf_cnpj: orc.cnpj_cpf || '',
          cidade: orc.obra_cidade || '',
          vendedor: orc.vendedor || '',
          status: orc.status || '',
          produto_codigo: '',
          produto: '',
          quantidade: '',
          valor_unitario: '',
          subtotal: orc.subtotal || 0,
          frete: orc.frete || 0,
          desconto: orc.desconto_geral || 0,
          total: orc.total || 0,
          forma_pagamento: orc.formas_pagamento?.descricao || ''
        }]
      }
      return itens.map((item, idx) => ({
        numero: idx === 0 ? orc.numero : '',
        numero_proposta: idx === 0 ? (orc.numero_proposta || '') : '',
        data: idx === 0 ? (orc.data_orcamento ? format(new Date(orc.data_orcamento), 'dd/MM/yyyy') : '') : '',
        cliente: idx === 0 ? (orc.cliente_nome || '') : '',
        empresa: idx === 0 ? (orc.cliente_empresa || '') : '',
        cpf_cnpj: idx === 0 ? (orc.cnpj_cpf || '') : '',
        cidade: idx === 0 ? (orc.obra_cidade || '') : '',
        vendedor: idx === 0 ? (orc.vendedor || '') : '',
        status: idx === 0 ? (orc.status || '') : '',
        produto_codigo: item.produto_codigo || '',
        produto: item.produto || '',
        quantidade: item.quantidade || '',
        valor_unitario: item.preco || '',
        subtotal: idx === 0 ? (orc.subtotal || 0) : '',
        frete: idx === 0 ? (orc.frete || 0) : '',
        desconto: idx === 0 ? (orc.desconto_geral || 0) : '',
        total: idx === 0 ? (orc.total || 0) : '',
        forma_pagamento: idx === 0 ? (orc.formas_pagamento?.descricao || '') : ''
      }))
    })

    // Criar CSV
    const headers = ['Número', 'Proposta', 'Data', 'Cliente', 'Empresa', 'CPF/CNPJ', 'Cidade', 'Vendedor', 'Status', 'Cód. Produto', 'Produto', 'Qtd', 'Valor Unit.', 'Subtotal', 'Frete', 'Desconto %', 'Total', 'Forma Pagamento']
    const csvContent = [
      headers.join(';'),
      ...dados.map(row => [
        row.numero,
        row.numero_proposta,
        row.data,
        row.cliente,
        row.empresa,
        row.cpf_cnpj,
        row.cidade,
        row.vendedor,
        row.status,
        row.produto_codigo,
        row.produto,
        row.quantidade,
        row.valor_unitario,
        row.subtotal,
        row.frete,
        row.desconto,
        row.total,
        row.forma_pagamento
      ].join(';'))
    ].join('\n')

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orcamentos_${format(new Date(), 'yyyy-MM-dd')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ====================================================================================
  // CARREGAMENTO INICIAL DE DADOS
  // ====================================================================================

  // ====================================================================================
  // CARREGAMENTO INICIAL DE DADOS
  // ====================================================================================
  useEffect(() => {
    carregarOrcamentos()
  }, [user])

  const carregarOrcamentos = async () => {
    try {
      setLoading(true)
      
      console.log('🔍 Carregando orçamentos (excluido = false)')
      
      // Query base: busca todos os orçamentos não excluídos
      // ✅ ATUALIZADO: Inclui itens para permitir busca por produto
      let query = supabase
      .from('orcamentos')
      .select(`
        *,
        formas_pagamento (
          id,
          descricao,
          categoria
        ),
        orcamentos_itens (
          produto,
          produto_codigo
        )
  `)
  .eq('excluido', false)
      
      // Se for vendedor, filtrar apenas seus orçamentos
      if (isVendedor()) {
        query = query.eq('usuario_id', user.id)
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('✅ Orçamentos carregados:', data?.length || 0)
      
      setOrcamentos(data || [])

      // Calcular estatísticas por status
      const stats = {
        rascunho: data?.filter(o => o.status === 'rascunho').length || 0,
        enviado: data?.filter(o => o.status === 'enviado').length || 0,
        aprovado: data?.filter(o => o.status === 'aprovado').length || 0,
        lancado: data?.filter(o => o.status === 'lancado').length || 0,
        finalizado: data?.filter(o => o.status === 'finalizado').length || 0,
        cancelado: data?.filter(o => o.status === 'cancelado').length || 0
      }
      setEstatisticas(stats)
    } catch (error) {
      console.error('❌ Erro ao carregar orçamentos:', error)
      alert('Erro ao carregar orçamentos')
    } finally {
      setLoading(false)
    }
  }

  // ====================================================================================
  // FILTROS E BUSCAS
  // ====================================================================================
  const orcamentosFiltrados = orcamentos.filter(orc => {
    // Filtro de busca por texto (número, cliente, empresa, ERP, cidade, bairro, produto)
    const buscaLower = busca.toLowerCase()
    const matchBusca = !busca || 
      orc.numero?.toLowerCase().includes(buscaLower) ||
      orc.numero_proposta?.toLowerCase().includes(buscaLower) ||
      orc.cliente_nome?.toLowerCase().includes(buscaLower) ||
      orc.cliente_empresa?.toLowerCase().includes(buscaLower) ||
      // ✅ NOVO: Busca por código ERP
      orc.numero_lancamento_erp?.toLowerCase().includes(buscaLower) ||
      // ✅ NOVO: Busca por cidade e bairro da obra
      orc.obra_cidade?.toLowerCase().includes(buscaLower) ||
      orc.obra_bairro?.toLowerCase().includes(buscaLower) ||
      orc.frete_cidade?.toLowerCase().includes(buscaLower) ||
      // ✅ NOVO: Busca por produto (nome ou código)
      orc.orcamentos_itens?.some(item => 
        item.produto?.toLowerCase().includes(buscaLower) ||
        item.produto_codigo?.toLowerCase().includes(buscaLower)
      )
    
    // Filtro de status
    const matchStatus = filtroStatus === 'todos' || orc.status === filtroStatus
    
    return matchBusca && matchStatus
  })

  // Pega os 5 orçamentos mais recentes para exibir em destaque
  const ultimos5 = orcamentos.slice(0, 5)

  // ====================================================================================
  // AÇÕES DE ORÇAMENTO
  // ====================================================================================
  
  // CANCELAR ORÇAMENTO
  // Soft delete: marca status como 'cancelado' mas não exclui do banco
  const cancelar = async (id, numero) => {
    if (!confirm(`Tem certeza que deseja CANCELAR o orçamento ${numero}?\n\nO orçamento será marcado como CANCELADO.`)) return

    try {
      console.log('🚫 Cancelando orçamento:', numero, 'ID:', id)
      
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: 'cancelado' })
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

  // ====================================================================================
  // DUPLICAR ORÇAMENTO - CORRIGIDO (DESCONTO ZERADO)
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
        numero_proposta: null,
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
        // ✅ DESCONTO SEMPRE ZERADO - nova proposta requer nova autorização
        desconto_geral: 0,
        subtotal: original.subtotal,
        frete: original.frete,
        frete_modalidade: original.frete_modalidade || 'FOB',
        frete_qtd_viagens: original.frete_qtd_viagens || 0,
        frete_valor_viagem: original.frete_valor_viagem || 0,
        frete_cidade: original.frete_cidade,
        frete_tipo_caminhao: original.frete_tipo_caminhao,
        total: original.total,
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
        // ✅ LIBERAÇÃO DE DESCONTO - NÃO COPIA (nova proposta = nova autorização)
        desconto_liberado: false,
        desconto_liberado_por: null,
        desconto_liberado_por_id: null,
        desconto_liberado_em: null,
        desconto_valor_liberado: null,
        // ✅ APROVAÇÃO - NÃO COPIA
        aprovado_via: null
      }

      console.log('📦 [DUPLICAR] Dados do novo orçamento (desconto zerado)')

      const { data: orcCriado, error: errorCriar } = await supabase
        .from('orcamentos')
        .insert([novoOrcamento])
        .select()
        .single()

      if (errorCriar) {
        console.error('❌ Erro ao criar orçamento:', errorCriar)
        throw errorCriar
      }

      console.log('✅ [DUPLICAR] Orçamento duplicado com ID:', orcCriado.id)

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
          console.error('❌ Erro ao copiar itens:', errorItensNovos)
          throw errorItensNovos
        }
        
        console.log('✅ [DUPLICAR] Produtos copiados!')
      }

      alert(`Orçamento duplicado com sucesso!\nNovo número: ${novoNumero}\n\n⚠️ Desconto zerado - solicite nova autorização se necessário.`)
      carregarOrcamentos()
    } catch (error) {
      console.error('❌ Erro ao duplicar:', error)
      alert('Erro ao duplicar orçamento: ' + error.message)
    }
  }

  // ====================================================================================
  // ABRIR MODAL DE DADOS DA ACEITAÇÃO
  // ====================================================================================
  const abrirModalAceitacao = (orcamentoId) => {
    setModalAceitacao({
      aberto: true,
      orcamentoId
    })
  }

  const fecharModalAceitacao = () => {
    setModalAceitacao({
      aberto: false,
      orcamentoId: null
    })
  }

  // ====================================================================================
  // COMPONENTE DE BADGE DE STATUS
  // ====================================================================================
  const getStatusBadge = (status) => {
    const styles = {
      'rascunho': 'bg-gray-100 text-gray-700 border border-gray-200',
      'enviado': 'bg-blue-100 text-blue-700 border border-blue-200',
      'aprovado': 'bg-green-100 text-green-700 border border-green-200',
      'lancado': 'bg-purple-100 text-purple-700 border border-purple-200',
      'finalizado': 'bg-teal-100 text-teal-700 border border-teal-200',
      'rejeitado': 'bg-red-100 text-red-700 border border-red-200',
      'cancelado': 'bg-red-100 text-red-700 border border-red-200'
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.rascunho}`}>
        {status?.toUpperCase() || 'RASCUNHO'}
      </span>
    )
  }

  // ====================================================================================
  // COMPONENTE DE BADGE DE ORIGEM DA APROVAÇÃO
  // ====================================================================================
  const getAprovadoViaBadge = (aprovadoVia) => {
    if (!aprovadoVia) return null
    
    if (aprovadoVia === 'link') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
          <LinkIcon size={12} />
          Cliente
        </span>
      )
    }
    
    if (aprovadoVia === 'manual') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
          <Hand size={12} />
          Manual
        </span>
      )
    }
    
    return null
  }

  // ====================================================================================
  // COMPONENTE DE CARD DE ORÇAMENTO (REUTILIZÁVEL)
  // ====================================================================================
  const OrcamentoCard = ({ orc }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        {/* Coluna Esquerda: Informações do Orçamento */}
        <div className="flex-1 min-w-0">
          {/* Linha 1: Número • Nome do Cliente */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900">
              {orc.numero_proposta ? (
                <span className="text-purple-700">{orc.numero_proposta}</span>
              ) : (
                <span className="text-gray-400">#{orc.numero}</span>
              )}
            </h3>
            <span className="text-blue-600 font-semibold">•</span>
            <span className="text-gray-700 font-medium truncate">
              {orc.cliente_nome || 'Sem cliente'}
            </span>
          </div>
          
          {/* Linha 2: Cidade | Valor | Data | Vendedor */}
          <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
            {orc.obra_cidade && (
              <>
                <div className="flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{orc.obra_cidade}</span>
                </div>
                <span className="text-gray-300">|</span>
              </>
            )}
            <div className="flex items-center gap-1">
              <DollarSign size={14} className="text-blue-500" />
              <span className="font-semibold text-gray-900">
                R$ {parseFloat(orc.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <Calendar size={14} className="text-gray-400" />
              <span>{orc.data_orcamento ? format(new Date(orc.data_orcamento), 'dd/MM/yyyy') : '-'}</span>
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
            {orc.formas_pagamento?.descricao && (
              <>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600">
                    {orc.formas_pagamento.descricao}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Coluna Direita: Badge Status + Badge Origem + Botões de Ação */}
        <div className="flex flex-col items-end gap-2">
          {/* Badges de Status e Origem */}
          <div className="flex items-center gap-2">
            {getStatusBadge(orc.status)}
            {/* ✅ CORRIGIDO: Mostrar badge de aprovação em aprovado, lançado e finalizado */}
            {['aprovado', 'lancado', 'finalizado'].includes(orc.status) && getAprovadoViaBadge(orc.aprovado_via)}
          </div>
          
          {/* Botões de Ação */}
          <div className="flex gap-2">
            {/* ✅ CORRIGIDO: Botão Ver Dados da Aceitação (em aprovado, lançado e finalizado) */}
            {['aprovado', 'lancado', 'finalizado'].includes(orc.status) && podeVerDadosAceitacao() && (
              <button
                onClick={() => abrirModalAceitacao(orc.id)}
                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                title="Ver Dados da Aceitação"
              >
                <ClipboardList size={18} />
              </button>
            )}
            <button
              onClick={() => navigate(`/orcamentos/editar/${orc.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => duplicar(orc.id)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Duplicar"
            >
              <Copy size={18} />
            </button>
            {orc.status !== 'cancelado' && (
              <button
                onClick={() => cancelar(orc.id, orc.numero)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cancelar"
              >
                <Ban size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // ====================================================================================
  // CONFIGURAÇÃO DOS CARDS DE STATUS
  // ====================================================================================
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
      status: 'finalizado',
      titulo: 'Finalizados',
      icone: PackageCheck,
      cor: 'from-teal-500 to-teal-600',
      corFundo: 'bg-teal-50',
      corBorda: 'border-teal-200',
      quantidade: estatisticas.finalizado
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

  // ====================================================================================
  // RENDERIZAÇÃO DO COMPONENTE
  // ====================================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Modal de Dados da Aceitação */}
      {modalAceitacao.aberto && (
        <ModalDadosAceitacao 
          orcamentoId={modalAceitacao.orcamentoId}
          onClose={fecharModalAceitacao}
        />
      )}

      {/* ==================================================================== */}
      {/* HEADER DA PÁGINA */}
      {/* ==================================================================== */}
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
                  <p className="text-xs sm:text-sm text-gray-500">
                    {isVendedor() ? 'Seus orçamentos' : `${orcamentos.length} orçamentos`}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={exportarExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={20} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
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
       
        {/* ==================================================================== */}
        {/* CARDS DE STATUS - DASHBOARD */}
        {/* ==================================================================== */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Por Status</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {statusCards.map((card) => {
              const IconComponent = card.icone
              return (
                <button
                  key={card.status}
                  onClick={() => navigate(`/orcamentos/status/${card.status}`)}
                  className={`${card.corFundo} border-2 ${card.corBorda} rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 bg-gradient-to-br ${card.cor} rounded-lg shadow-md`}>
                      <IconComponent className="text-white" size={20} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {card.quantidade}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-gray-600 group-hover:text-gray-900">
                    {card.titulo}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* ÚLTIMOS 5 ORÇAMENTOS */}
        {/* ==================================================================== */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-gray-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">Últimos 5 Orçamentos</h2>
          </div>

          {ultimos5.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <FileText className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500">Nenhum orçamento criado ainda</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {ultimos5.map((orc) => (
                <OrcamentoCard key={orc.id} orc={orc} />
              ))}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* FILTROS DE BUSCA */}
        {/* ==================================================================== */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por número, cliente, ERP, cidade, bairro ou produto..."
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
            <option value="lancado">Lançado</option>
            <option value="finalizado">Finalizado</option>
            <option value="rejeitado">Rejeitado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* ==================================================================== */}
        {/* LISTA COMPLETA DE ORÇAMENTOS */}
        {/* ==================================================================== */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Todos os Orçamentos</h2>
          
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              Carregando...
            </div>
          ) : orcamentosFiltrados.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              {busca || filtroStatus !== 'todos' ? 'Nenhum orçamento encontrado' : 'Nenhum orçamento cadastrado'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {orcamentosFiltrados.map((orc) => (
                <OrcamentoCard key={orc.id} orc={orc} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}