import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, BarChart3, TrendingUp, Package, DollarSign, Calendar, 
  AlertTriangle, Users, Truck, Target, Filter, RefreshCw,
  FileText, CheckCircle, XCircle, Clock, Award, MapPin,
  Percent, Scale, Activity, Eye, Send, Briefcase, Star,
  AlertCircle, TrendingDown, ArrowRight, ChevronDown, Download
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, FunnelChart, Funnel, LabelList, ComposedChart
} from 'recharts'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { format, subDays, subMonths, subYears, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Cores padrão para gráficos
const COLORS = {
  rascunho: '#94a3b8',
  enviado: '#3b82f6',
  aprovado: '#22c55e',
  lancado: '#8b5cf6',
  finalizado: '#14b8a6',
  cancelado: '#ef4444',
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
}

// Abas do Dashboard
const TABS = [
  { id: 'resumo', label: 'Resumo', icon: BarChart3 },
  { id: 'funil', label: 'Funil & Conversão', icon: Target },
  { id: 'vendedores', label: 'Vendedores', icon: Users },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'clientes', label: 'Clientes', icon: MapPin },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'frete', label: 'Frete', icon: Truck },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle }
]

// Períodos disponíveis
const PERIODOS = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta Semana' },
  { value: 'mes', label: 'Este Mês' },
  { value: '30dias', label: 'Últimos 30 dias' },
  { value: '90dias', label: 'Últimos 90 dias' },
  { value: 'ano', label: 'Este Ano' },
  { value: '12meses', label: 'Últimos 12 meses' }
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  
  // Estados principais
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('resumo')
  
  // Filtros globais
  const [periodo, setPeriodo] = useState('mes')
  const [vendedorFiltro, setVendedorFiltro] = useState('todos')
  
  // Dados
  const [orcamentos, setOrcamentos] = useState([])
  const [produtos, setProdutos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [propostas, setPropostas] = useState([])

  // Carregar dados quando filtros mudam
  useEffect(() => {
    if (isAdmin()) {
      carregarDados()
    }
  }, [periodo, vendedorFiltro])

  // Calcular datas do período
  const calcularPeriodo = (periodo) => {
    const hoje = new Date()
    let inicio, fim = endOfDay(hoje)

    switch (periodo) {
      case 'hoje':
        inicio = startOfDay(hoje)
        break
      case 'semana':
        inicio = startOfWeek(hoje, { locale: ptBR })
        fim = endOfWeek(hoje, { locale: ptBR })
        break
      case 'mes':
        inicio = startOfMonth(hoje)
        fim = endOfMonth(hoje)
        break
      case '30dias':
        inicio = subDays(hoje, 30)
        break
      case '90dias':
        inicio = subDays(hoje, 90)
        break
      case 'ano':
        inicio = startOfYear(hoje)
        break
      case '12meses':
        inicio = subMonths(hoje, 12)
        break
      default:
        inicio = subDays(hoje, 30)
    }

    return { inicio: inicio.toISOString(), fim: fim.toISOString() }
  }

  const carregarDados = async () => {
    try {
      setLoading(true)
      const { inicio, fim } = calcularPeriodo(periodo)

      // Carregar orçamentos com relacionamentos
      let queryOrcamentos = supabase
        .from('orcamentos')
        .select(`
          *,
          usuario:usuarios(id, nome, codigo),
          itens:orcamento_itens(*, produto:produtos(*))
        `)
        .gte('created_at', inicio)
        .lte('created_at', fim)
        .eq('excluido', false)
        .order('created_at', { ascending: false })

      // Filtrar por vendedor se selecionado
      if (vendedorFiltro !== 'todos') {
        queryOrcamentos = queryOrcamentos.eq('usuario_id', vendedorFiltro)
      }

      const { data: orcamentosData, error: orcError } = await queryOrcamentos
      if (orcError) throw orcError

      // Carregar usuários/vendedores
      const { data: usuariosData, error: usrError } = await supabase
        .from('usuarios')
        .select('id, nome, codigo, perfil')
        .eq('ativo', true)
        .order('nome')

      if (usrError) throw usrError

      // Carregar propostas
      const { data: propostasData, error: propError } = await supabase
        .from('propostas')
        .select('*')
        .gte('created_at', inicio)
        .lte('created_at', fim)

      // Carregar produtos
      const { data: produtosData, error: prodError } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)

      if (prodError) throw prodError

      setOrcamentos(orcamentosData || [])
      setUsuarios(usuariosData || [])
      setPropostas(propostasData || [])
      setProdutos(produtosData || [])

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // CÁLCULOS E MÉTRICAS
  // ==========================================
  
  const metricas = useMemo(() => {
    if (!orcamentos.length) return null

    // Contagens por status
    const porStatus = {
      rascunho: orcamentos.filter(o => o.status === 'rascunho'),
      enviado: orcamentos.filter(o => o.status === 'enviado'),
      aprovado: orcamentos.filter(o => o.status === 'aprovado'),
      lancado: orcamentos.filter(o => o.status === 'lancado'),
      finalizado: orcamentos.filter(o => o.status === 'finalizado'),
      cancelado: orcamentos.filter(o => o.status === 'cancelado')
    }

    // Valores por status
    const valorPorStatus = {}
    Object.keys(porStatus).forEach(status => {
      valorPorStatus[status] = porStatus[status].reduce((sum, o) => 
        sum + (parseFloat(o.valor_total) || parseFloat(o.total) || 0), 0
      )
    })

    // Funil de conversão
    const totalEnviados = porStatus.enviado.length + porStatus.aprovado.length + porStatus.lancado.length + porStatus.finalizado.length + porStatus.cancelado.length
    const totalAprovados = porStatus.aprovado.length + porStatus.lancado.length + porStatus.finalizado.length
    const totalLancados = porStatus.lancado.length + porStatus.finalizado.length

    const taxaEnvio = orcamentos.length > 0 ? (totalEnviados / orcamentos.length) * 100 : 0
    const taxaAprovacao = totalEnviados > 0 ? (totalAprovados / totalEnviados) * 100 : 0
    const taxaLancamento = totalAprovados > 0 ? (totalLancados / totalAprovados) * 100 : 0
    const taxaConversaoGeral = orcamentos.length > 0 ? (totalLancados / orcamentos.length) * 100 : 0

    // Ticket médio
    const ticketMedio = totalLancados > 0 ? valorPorStatus.lancado / totalLancados : 0

    // Tonelagem de argamassa
    let toneladasArgamassa = 0
    let toneladasTotal = 0
    orcamentos.forEach(orc => {
      if (orc.status === 'lancado' && orc.itens) {
        orc.itens.forEach(item => {
          const peso = (item.quantidade || 0) * (item.produto?.peso_unitario || 0) / 1000
          toneladasTotal += peso
          if (item.produto?.produto?.toLowerCase().includes('argamassa')) {
            toneladasArgamassa += peso
          }
        })
      }
    })

    // Métricas de desconto
    const comDesconto = orcamentos.filter(o => (o.desconto_geral || 0) > 0)
    const descontoMedio = comDesconto.length > 0 
      ? comDesconto.reduce((sum, o) => sum + (o.desconto_geral || 0), 0) / comDesconto.length 
      : 0
    const valorDescontos = orcamentos.reduce((sum, o) => {
      const subtotal = parseFloat(o.subtotal_produtos) || parseFloat(o.total) || 0
      const desconto = (o.desconto_geral || 0) / 100
      return sum + (subtotal * desconto)
    }, 0)

    // Métricas de frete
    const comFrete = orcamentos.filter(o => o.tipo_frete?.toLowerCase().includes('cif'))
    const valorFreteTotal = orcamentos.reduce((sum, o) => sum + (parseFloat(o.valor_frete) || 0), 0)
    const percentualCIF = orcamentos.length > 0 ? (comFrete.length / orcamentos.length) * 100 : 0

    // Performance por vendedor
    const porVendedor = {}
    orcamentos.forEach(orc => {
      const vendedor = orc.usuario?.nome || 'Sem vendedor'
      const vendedorId = orc.usuario?.id || 'sem-id'
      const codigo = orc.usuario?.codigo || ''
      
      if (!porVendedor[vendedorId]) {
        porVendedor[vendedorId] = {
          id: vendedorId,
          nome: vendedor,
          codigo: codigo,
          total: 0,
          enviados: 0,
          aprovados: 0,
          lancados: 0,
          cancelados: 0,
          valor: 0,
          valorLancado: 0,
          descontoMedio: 0,
          descontos: []
        }
      }
      
      porVendedor[vendedorId].total++
      porVendedor[vendedorId].valor += parseFloat(orc.valor_total) || parseFloat(orc.total) || 0
      
      if (orc.desconto_geral > 0) {
        porVendedor[vendedorId].descontos.push(orc.desconto_geral)
      }
      
      if (orc.status === 'enviado') porVendedor[vendedorId].enviados++
      if (orc.status === 'aprovado') porVendedor[vendedorId].aprovados++
      if (orc.status === 'lancado' || orc.status === 'finalizado') {
        porVendedor[vendedorId].lancados++
        porVendedor[vendedorId].valorLancado += parseFloat(orc.valor_total) || parseFloat(orc.total) || 0
      }
      if (orc.status === 'cancelado') porVendedor[vendedorId].cancelados++
    })

    // Calcular médias de desconto por vendedor
    Object.values(porVendedor).forEach(v => {
      v.descontoMedio = v.descontos.length > 0 
        ? v.descontos.reduce((a, b) => a + b, 0) / v.descontos.length 
        : 0
      v.taxaConversao = v.total > 0 ? (v.lancados / v.total) * 100 : 0
    })

    // Top produtos
    const porProduto = {}
    orcamentos.forEach(orc => {
      if (orc.itens) {
        orc.itens.forEach(item => {
          const produtoNome = item.produto?.produto || item.produto_nome || 'Produto'
          if (!porProduto[produtoNome]) {
            porProduto[produtoNome] = {
              nome: produtoNome,
              quantidade: 0,
              valor: 0,
              peso: 0,
              ocorrencias: 0
            }
          }
          porProduto[produtoNome].quantidade += item.quantidade || 0
          porProduto[produtoNome].valor += (item.quantidade || 0) * (item.preco_unitario || item.preco || 0)
          porProduto[produtoNome].peso += (item.quantidade || 0) * (item.produto?.peso_unitario || 0) / 1000
          porProduto[produtoNome].ocorrencias++
        })
      }
    })

    // Clientes únicos
    const clientesUnicos = new Set(orcamentos.map(o => o.cnpj_cpf || o.cliente_nome).filter(Boolean))
    
    // Por cidade
    const porCidade = {}
    orcamentos.forEach(orc => {
      const cidade = orc.obra_cidade || orc.cidade || 'Não informado'
      if (!porCidade[cidade]) {
        porCidade[cidade] = { nome: cidade, quantidade: 0, valor: 0 }
      }
      porCidade[cidade].quantidade++
      porCidade[cidade].valor += parseFloat(orc.valor_total) || parseFloat(orc.total) || 0
    })

    // Alertas
    const hoje = new Date()
    const alertas = {
      propostasVencendo: orcamentos.filter(o => {
        if (o.status !== 'enviado') return false
        const dataOrc = new Date(o.created_at)
        const validadeDias = o.validade_dias || 15
        const dataExpiracao = new Date(dataOrc.getTime() + validadeDias * 24 * 60 * 60 * 1000)
        const diasRestantes = differenceInDays(dataExpiracao, hoje)
        return diasRestantes <= 3 && diasRestantes >= 0
      }),
      semRespostaHa7Dias: orcamentos.filter(o => {
        if (o.status !== 'enviado') return false
        const dataOrc = new Date(o.created_at)
        return differenceInDays(hoje, dataOrc) >= 7
      }),
      rascunhosAntigos: orcamentos.filter(o => {
        if (o.status !== 'rascunho') return false
        const dataOrc = new Date(o.created_at)
        return differenceInDays(hoje, dataOrc) >= 3
      })
    }

    return {
      total: orcamentos.length,
      porStatus,
      valorPorStatus,
      valorTotal: Object.values(valorPorStatus).reduce((a, b) => a + b, 0),
      taxaEnvio,
      taxaAprovacao,
      taxaLancamento,
      taxaConversaoGeral,
      ticketMedio,
      toneladasArgamassa,
      toneladasTotal,
      descontoMedio,
      valorDescontos,
      percentualCIF,
      valorFreteTotal,
      porVendedor: Object.values(porVendedor).sort((a, b) => b.valorLancado - a.valorLancado),
      porProduto: Object.values(porProduto).sort((a, b) => b.valor - a.valor),
      clientesUnicos: clientesUnicos.size,
      porCidade: Object.values(porCidade).sort((a, b) => b.valor - a.valor),
      alertas
    }
  }, [orcamentos])

  // ==========================================
  // RENDERIZAÇÃO
  // ==========================================

  if (!isAdmin()) {
    navigate('/admin')
    return null
  }

  const formatarValor = (valor) => {
    if (valor >= 1000000) return `R$ ${(valor / 1000000).toFixed(1)}M`
    if (valor >= 1000) return `R$ ${(valor / 1000).toFixed(0)}k`
    return `R$ ${valor.toFixed(0)}`
  }

  // Dados para o funil
  const dadosFunil = metricas ? [
    { name: 'Criados', value: metricas.total, fill: COLORS.rascunho },
    { name: 'Enviados', value: metricas.porStatus.enviado.length + metricas.porStatus.aprovado.length + metricas.porStatus.lancado.length + metricas.porStatus.finalizado.length, fill: COLORS.enviado },
    { name: 'Aprovados', value: metricas.porStatus.aprovado.length + metricas.porStatus.lancado.length + metricas.porStatus.finalizado.length, fill: COLORS.aprovado },
    { name: 'Lançados', value: metricas.porStatus.lancado.length + metricas.porStatus.finalizado.length, fill: COLORS.lancado }
  ] : []

  // Dados pizza status
  const dadosPizza = metricas ? [
    { name: 'Rascunho', value: metricas.porStatus.rascunho.length, color: COLORS.rascunho },
    { name: 'Enviado', value: metricas.porStatus.enviado.length, color: COLORS.enviado },
    { name: 'Aprovado', value: metricas.porStatus.aprovado.length, color: COLORS.aprovado },
    { name: 'Lançado', value: metricas.porStatus.lancado.length, color: COLORS.lancado },
    { name: 'Finalizado', value: metricas.porStatus.finalizado.length, color: COLORS.finalizado },
    { name: 'Cancelado', value: metricas.porStatus.cancelado.length, color: COLORS.cancelado }
  ].filter(d => d.value > 0) : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header com Filtros Globais */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Título */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Dashboard Gerencial</h1>
                  <p className="text-sm text-gray-500">Análises completas do sistema</p>
                </div>
              </div>
            </div>

            {/* Filtros Globais */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filtro Período */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Calendar size={18} className="text-gray-500" />
                <select
                  value={periodo}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                >
                  {PERIODOS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Vendedor */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Users size={18} className="text-gray-500" />
                <select
                  value={vendedorFiltro}
                  onChange={(e) => setVendedorFiltro(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer"
                >
                  <option value="todos">Todos Vendedores</option>
                  {usuarios.filter(u => u.perfil === 'vendedor' || u.perfil === 'comercial').map(u => (
                    <option key={u.id} value={u.id}>{u.codigo} - {u.nome}</option>
                  ))}
                </select>
              </div>

              {/* Botão Atualizar */}
              <button
                onClick={carregarDados}
                disabled={loading}
                className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                title="Atualizar dados"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Abas */}
          <div className="mt-4 flex gap-1 overflow-x-auto pb-2">
            {TABS.map(tab => {
              const Icon = tab.icon
              const isActive = abaAtiva === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setAbaAtiva(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.id === 'alertas' && metricas && (
                    (metricas.alertas.propostasVencendo.length + metricas.alertas.semRespostaHa7Dias.length) > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {metricas.alertas.propostasVencendo.length + metricas.alertas.semRespostaHa7Dias.length}
                      </span>
                    )
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Carregando dados...</p>
          </div>
        ) : !metricas ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum dado encontrado para o período selecionado</p>
          </div>
        ) : (
          <>
            {/* ==================== ABA RESUMO ==================== */}
            {abaAtiva === 'resumo' && (
              <div className="space-y-6">
                {/* KPIs Principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Total Orçamentos</p>
                        <p className="text-2xl font-bold text-gray-900">{metricas.total}</p>
                      </div>
                      <FileText className="text-gray-400" size={24} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Valor Total</p>
                        <p className="text-2xl font-bold text-green-600">{formatarValor(metricas.valorTotal)}</p>
                      </div>
                      <DollarSign className="text-green-400" size={24} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Lançados</p>
                        <p className="text-2xl font-bold text-purple-600">{metricas.porStatus.lancado.length + metricas.porStatus.finalizado.length}</p>
                        <p className="text-xs text-gray-400">{formatarValor(metricas.valorPorStatus.lancado + metricas.valorPorStatus.finalizado)}</p>
                      </div>
                      <Briefcase className="text-purple-400" size={24} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Taxa Conversão</p>
                        <p className="text-2xl font-bold text-blue-600">{metricas.taxaConversaoGeral.toFixed(0)}%</p>
                      </div>
                      <Target className="text-blue-400" size={24} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Ticket Médio</p>
                        <p className="text-2xl font-bold text-orange-600">{formatarValor(metricas.ticketMedio)}</p>
                      </div>
                      <TrendingUp className="text-orange-400" size={24} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Argamassa</p>
                        <p className="text-2xl font-bold text-teal-600">{metricas.toneladasArgamassa.toFixed(1)} ton</p>
                      </div>
                      <Package className="text-teal-400" size={24} />
                    </div>
                  </div>
                </div>

                {/* Mini Funil + Alertas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Mini Funil */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Target size={20} className="text-purple-600" />
                      Funil de Conversão
                    </h3>
                    <div className="flex items-center justify-between gap-2">
                      {[
                        { label: 'Criados', value: metricas.total, color: 'bg-gray-200' },
                        { label: 'Enviados', value: metricas.porStatus.enviado.length + metricas.porStatus.aprovado.length + metricas.porStatus.lancado.length, color: 'bg-blue-500', taxa: metricas.taxaEnvio },
                        { label: 'Aprovados', value: metricas.porStatus.aprovado.length + metricas.porStatus.lancado.length, color: 'bg-green-500', taxa: metricas.taxaAprovacao },
                        { label: 'Lançados', value: metricas.porStatus.lancado.length, color: 'bg-purple-500', taxa: metricas.taxaLancamento }
                      ].map((etapa, idx) => (
                        <div key={idx} className="flex-1 text-center">
                          <div className={`${etapa.color} text-white rounded-lg py-4 mb-2`}>
                            <p className="text-2xl font-bold">{etapa.value}</p>
                          </div>
                          <p className="text-xs font-medium text-gray-600">{etapa.label}</p>
                          {etapa.taxa !== undefined && (
                            <p className="text-xs text-gray-400">{etapa.taxa.toFixed(0)}%</p>
                          )}
                          {idx < 3 && <ArrowRight className="mx-auto text-gray-300 mt-2" size={16} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Alertas Rápidos */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-orange-500" />
                      Alertas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-sm text-red-700">Propostas vencendo</span>
                        <span className="font-bold text-red-600">{metricas.alertas.propostasVencendo.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="text-sm text-orange-700">Sem resposta há 7+ dias</span>
                        <span className="font-bold text-orange-600">{metricas.alertas.semRespostaHa7Dias.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm text-yellow-700">Rascunhos antigos</span>
                        <span className="font-bold text-yellow-600">{metricas.alertas.rascunhosAntigos.length}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAbaAtiva('alertas')}
                      className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Ver todos alertas →
                    </button>
                  </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pizza Status */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={dadosPizza}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {dadosPizza.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Valores por Status */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Valores por Status (R$ mil)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { status: 'Enviado', valor: metricas.valorPorStatus.enviado / 1000 },
                        { status: 'Aprovado', valor: metricas.valorPorStatus.aprovado / 1000 },
                        { status: 'Lançado', valor: metricas.valorPorStatus.lancado / 1000 },
                        { status: 'Cancelado', valor: metricas.valorPorStatus.cancelado / 1000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip formatter={(value) => `R$ ${value.toFixed(1)}k`} />
                        <Bar dataKey="valor" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top 5 Vendedores */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Award size={20} className="text-yellow-500" />
                      Ranking de Vendedores
                    </h3>
                    <button 
                      onClick={() => setAbaAtiva('vendedores')}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      Ver todos →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {metricas.porVendedor.slice(0, 5).map((vendedor, index) => (
                      <div key={vendedor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{vendedor.codigo} - {vendedor.nome}</p>
                            <p className="text-xs text-gray-500">
                              {vendedor.total} orç • {vendedor.lancados} lançados • {vendedor.taxaConversao.toFixed(0)}% conv.
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">{formatarValor(vendedor.valorLancado)}</p>
                          <p className="text-xs text-gray-400">lançado</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ABA FUNIL ==================== */}
            {abaAtiva === 'funil' && (
              <div className="space-y-6">
                {/* Funil Visual Grande */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Funil de Vendas Detalhado</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'Orçamentos Criados', value: metricas.total, color: 'bg-gray-400', width: '100%' },
                      { label: 'Enviados para Cliente', value: metricas.porStatus.enviado.length + metricas.porStatus.aprovado.length + metricas.porStatus.lancado.length + metricas.porStatus.finalizado.length, color: 'bg-blue-500', width: `${metricas.taxaEnvio}%`, taxa: metricas.taxaEnvio },
                      { label: 'Aprovados pelo Cliente', value: metricas.porStatus.aprovado.length + metricas.porStatus.lancado.length + metricas.porStatus.finalizado.length, color: 'bg-green-500', width: `${metricas.taxaAprovacao * metricas.taxaEnvio / 100}%`, taxa: metricas.taxaAprovacao },
                      { label: 'Lançados/Faturados', value: metricas.porStatus.lancado.length + metricas.porStatus.finalizado.length, color: 'bg-purple-500', width: `${metricas.taxaConversaoGeral}%`, taxa: metricas.taxaLancamento }
                    ].map((etapa, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-48 text-sm font-medium text-gray-700">{etapa.label}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                          <div 
                            className={`${etapa.color} h-full rounded-full flex items-center justify-end pr-4 transition-all duration-500`}
                            style={{ width: etapa.width }}
                          >
                            <span className="text-white font-bold">{etapa.value}</span>
                          </div>
                        </div>
                        <div className="w-20 text-right">
                          {etapa.taxa !== undefined && (
                            <span className={`text-sm font-medium ${etapa.taxa >= 50 ? 'text-green-600' : etapa.taxa >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {etapa.taxa.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Perdas */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <XCircle size={18} className="text-red-500" />
                      Perdas no Funil
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-700">Cancelados</p>
                        <p className="text-2xl font-bold text-red-600">{metricas.porStatus.cancelado.length}</p>
                        <p className="text-xs text-red-500">{formatarValor(metricas.valorPorStatus.cancelado)} perdidos</p>
                      </div>
                      <div className="p-4 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-700">Ainda em Rascunho</p>
                        <p className="text-2xl font-bold text-gray-600">{metricas.porStatus.rascunho.length}</p>
                        <p className="text-xs text-gray-500">{formatarValor(metricas.valorPorStatus.rascunho)} parados</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">Aguardando Resposta</p>
                        <p className="text-2xl font-bold text-blue-600">{metricas.porStatus.enviado.length}</p>
                        <p className="text-xs text-blue-500">{formatarValor(metricas.valorPorStatus.enviado)} em espera</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Taxas de Conversão por Vendedor */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Taxa de Conversão por Vendedor</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metricas.porVendedor.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis dataKey="nome" type="category" width={100} />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                      <Bar dataKey="taxaConversao" fill={COLORS.success} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Desconto vs Conversão */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Desconto x Conversão</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">Com Desconto</p>
                      <p className="text-2xl font-bold text-green-600">
                        {((orcamentos.filter(o => o.desconto_geral > 0 && o.status === 'lancado').length / 
                          Math.max(orcamentos.filter(o => o.desconto_geral > 0).length, 1)) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-green-500">taxa de conversão</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">Sem Desconto</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {((orcamentos.filter(o => !o.desconto_geral && o.status === 'lancado').length / 
                          Math.max(orcamentos.filter(o => !o.desconto_geral).length, 1)) * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-blue-500">taxa de conversão</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ABA VENDEDORES ==================== */}
            {abaAtiva === 'vendedores' && (
              <div className="space-y-6">
                {/* Ranking Completo */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Performance Completa dos Vendedores</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendedor</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Enviados</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aprovados</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lançados</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cancelados</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Taxa Conv.</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Desc. Médio</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Lançado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {metricas.porVendedor.map((vendedor, index) => (
                          <tr key={vendedor.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900">{vendedor.codigo} - {vendedor.nome}</p>
                            </td>
                            <td className="px-4 py-3 text-center font-medium">{vendedor.total}</td>
                            <td className="px-4 py-3 text-center text-blue-600">{vendedor.enviados}</td>
                            <td className="px-4 py-3 text-center text-green-600">{vendedor.aprovados}</td>
                            <td className="px-4 py-3 text-center text-purple-600 font-bold">{vendedor.lancados}</td>
                            <td className="px-4 py-3 text-center text-red-600">{vendedor.cancelados}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                vendedor.taxaConversao >= 50 ? 'bg-green-100 text-green-700' :
                                vendedor.taxaConversao >= 30 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {vendedor.taxaConversao.toFixed(0)}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-orange-600">{vendedor.descontoMedio.toFixed(1)}%</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">{formatarValor(vendedor.valorLancado)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Gráfico Comparativo */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Comparativo de Valores (R$ mil)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metricas.porVendedor.slice(0, 8)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="codigo" />
                      <YAxis />
                      <Tooltip formatter={(value) => `R$ ${(value/1000).toFixed(1)}k`} />
                      <Legend />
                      <Bar dataKey="valor" name="Valor Total" fill={COLORS.info} />
                      <Bar dataKey="valorLancado" name="Valor Lançado" fill={COLORS.success} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ==================== ABA PRODUTOS ==================== */}
            {abaAtiva === 'produtos' && (
              <div className="space-y-6">
                {/* KPIs de Produtos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Tonelagem Total</p>
                    <p className="text-2xl font-bold text-gray-900">{metricas.toneladasTotal.toFixed(1)} ton</p>
                    <p className="text-xs text-gray-400">Produtos lançados</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Argamassa</p>
                    <p className="text-2xl font-bold text-orange-600">{metricas.toneladasArgamassa.toFixed(1)} ton</p>
                    <p className="text-xs text-gray-400">{((metricas.toneladasArgamassa / Math.max(metricas.toneladasTotal, 1)) * 100).toFixed(0)}% do total</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Produtos Únicos</p>
                    <p className="text-2xl font-bold text-purple-600">{metricas.porProduto.length}</p>
                    <p className="text-xs text-gray-400">No período</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Valor em Produtos</p>
                    <p className="text-2xl font-bold text-green-600">{formatarValor(metricas.porProduto.reduce((sum, p) => sum + p.valor, 0))}</p>
                  </div>
                </div>

                {/* Top Produtos por Valor */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Top 15 Produtos por Valor</h3>
                  <div className="space-y-2">
                    {metricas.porProduto.slice(0, 15).map((produto, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="w-6 text-sm font-medium text-gray-500">{index + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate" title={produto.nome}>
                              {produto.nome.substring(0, 40)}{produto.nome.length > 40 ? '...' : ''}
                            </span>
                            <span className="text-sm font-bold text-green-600">{formatarValor(produto.valor)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${(produto.valor / metricas.porProduto[0].valor) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Produtos por Quantidade/Peso */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 por Quantidade</h3>
                    <div className="space-y-2">
                      {[...metricas.porProduto].sort((a, b) => b.quantidade - a.quantidade).slice(0, 10).map((produto, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-900 truncate flex-1" title={produto.nome}>
                            {produto.nome.substring(0, 30)}...
                          </span>
                          <span className="text-sm font-bold text-blue-600 ml-2">{produto.quantidade.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top 10 por Peso (ton)</h3>
                    <div className="space-y-2">
                      {[...metricas.porProduto].sort((a, b) => b.peso - a.peso).slice(0, 10).map((produto, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-900 truncate flex-1" title={produto.nome}>
                            {produto.nome.substring(0, 30)}...
                          </span>
                          <span className="text-sm font-bold text-orange-600 ml-2">{produto.peso.toFixed(2)} ton</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ABA CLIENTES ==================== */}
            {abaAtiva === 'clientes' && (
              <div className="space-y-6">
                {/* KPIs de Clientes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Clientes Únicos</p>
                    <p className="text-2xl font-bold text-gray-900">{metricas.clientesUnicos}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Ticket Médio</p>
                    <p className="text-2xl font-bold text-green-600">{formatarValor(metricas.ticketMedio)}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Cidades Atendidas</p>
                    <p className="text-2xl font-bold text-blue-600">{metricas.porCidade.length}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Orç. por Cliente</p>
                    <p className="text-2xl font-bold text-purple-600">{(metricas.total / Math.max(metricas.clientesUnicos, 1)).toFixed(1)}</p>
                  </div>
                </div>

                {/* Top Cidades */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Top Cidades por Valor</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metricas.porCidade.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                      <YAxis dataKey="nome" type="category" width={120} />
                      <Tooltip formatter={(value) => formatarValor(value)} />
                      <Bar dataKey="valor" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabela de Cidades */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">Detalhamento por Cidade</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Orçamentos</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ticket Médio</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {metricas.porCidade.slice(0, 20).map((cidade, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{cidade.nome}</td>
                            <td className="px-4 py-3 text-center">{cidade.quantidade}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">{formatarValor(cidade.valor)}</td>
                            <td className="px-4 py-3 text-right text-gray-600">{formatarValor(cidade.valor / cidade.quantidade)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ABA FINANCEIRO ==================== */}
            {abaAtiva === 'financeiro' && (
              <div className="space-y-6">
                {/* KPIs Financeiros */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs uppercase opacity-80">Valor Lançado</p>
                    <p className="text-2xl font-bold">{formatarValor(metricas.valorPorStatus.lancado + metricas.valorPorStatus.finalizado)}</p>
                    <p className="text-xs opacity-70">Faturamento efetivo</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs uppercase opacity-80">Em Aprovação</p>
                    <p className="text-2xl font-bold">{formatarValor(metricas.valorPorStatus.enviado + metricas.valorPorStatus.aprovado)}</p>
                    <p className="text-xs opacity-70">Pipeline ativo</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs uppercase opacity-80">Descontos Dados</p>
                    <p className="text-2xl font-bold">{formatarValor(metricas.valorDescontos)}</p>
                    <p className="text-xs opacity-70">Média: {metricas.descontoMedio.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
                    <p className="text-xs uppercase opacity-80">Perdido/Cancelado</p>
                    <p className="text-2xl font-bold">{formatarValor(metricas.valorPorStatus.cancelado)}</p>
                    <p className="text-xs opacity-70">{metricas.porStatus.cancelado.length} orçamentos</p>
                  </div>
                </div>

                {/* Descontos por Vendedor */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Desconto Médio por Vendedor</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[...metricas.porVendedor].sort((a, b) => b.descontoMedio - a.descontoMedio).slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="codigo" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                      <Bar dataKey="descontoMedio" name="Desconto Médio" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Distribuição de Valores */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Valores por Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Lançado', value: metricas.valorPorStatus.lancado, color: COLORS.lancado },
                          { name: 'Aprovado', value: metricas.valorPorStatus.aprovado, color: COLORS.aprovado },
                          { name: 'Enviado', value: metricas.valorPorStatus.enviado, color: COLORS.enviado },
                          { name: 'Rascunho', value: metricas.valorPorStatus.rascunho, color: COLORS.rascunho },
                          { name: 'Cancelado', value: metricas.valorPorStatus.cancelado, color: COLORS.cancelado }
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatarValor(value)}`}
                      >
                        {[
                          { name: 'Lançado', value: metricas.valorPorStatus.lancado, color: COLORS.lancado },
                          { name: 'Aprovado', value: metricas.valorPorStatus.aprovado, color: COLORS.aprovado },
                          { name: 'Enviado', value: metricas.valorPorStatus.enviado, color: COLORS.enviado },
                          { name: 'Rascunho', value: metricas.valorPorStatus.rascunho, color: COLORS.rascunho },
                          { name: 'Cancelado', value: metricas.valorPorStatus.cancelado, color: COLORS.cancelado }
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatarValor(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ==================== ABA FRETE ==================== */}
            {abaAtiva === 'frete' && (
              <div className="space-y-6">
                {/* KPIs de Frete */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">CIF (Entrega)</p>
                    <p className="text-2xl font-bold text-blue-600">{metricas.percentualCIF.toFixed(0)}%</p>
                    <p className="text-xs text-gray-400">dos orçamentos</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">FOB (Retira)</p>
                    <p className="text-2xl font-bold text-gray-600">{(100 - metricas.percentualCIF).toFixed(0)}%</p>
                    <p className="text-xs text-gray-400">dos orçamentos</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Valor Total Frete</p>
                    <p className="text-2xl font-bold text-green-600">{formatarValor(metricas.valorFreteTotal)}</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Frete Médio</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {formatarValor(metricas.valorFreteTotal / Math.max(orcamentos.filter(o => o.valor_frete > 0).length, 1))}
                    </p>
                  </div>
                </div>

                {/* Gráfico CIF vs FOB */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Modalidade de Frete</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'CIF (Entrega)', value: metricas.percentualCIF, color: COLORS.info },
                            { name: 'FOB (Retira)', value: 100 - metricas.percentualCIF, color: COLORS.secondary }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
                        >
                          <Cell fill={COLORS.info} />
                          <Cell fill={COLORS.secondary} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="flex flex-col justify-center space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Truck className="text-blue-600" size={20} />
                            <span className="font-medium text-blue-900">CIF - Entrega</span>
                          </div>
                          <span className="text-lg font-bold text-blue-600">
                            {orcamentos.filter(o => o.tipo_frete?.toLowerCase().includes('cif')).length}
                          </span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          Valor: {formatarValor(orcamentos.filter(o => o.tipo_frete?.toLowerCase().includes('cif')).reduce((sum, o) => sum + (parseFloat(o.valor_total) || 0), 0))}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="text-purple-600" size={20} />
                            <span className="font-medium text-purple-900">FOB - Retira</span>
                          </div>
                          <span className="text-lg font-bold text-purple-600">
                            {orcamentos.filter(o => !o.tipo_frete?.toLowerCase().includes('cif')).length}
                          </span>
                        </div>
                        <p className="text-sm text-purple-700 mt-1">
                          Valor: {formatarValor(orcamentos.filter(o => !o.tipo_frete?.toLowerCase().includes('cif')).reduce((sum, o) => sum + (parseFloat(o.valor_total) || 0), 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frete Embutido vs Separado */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Estratégia de Frete</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-green-700 font-medium">Frete Embutido</p>
                      <p className="text-2xl font-bold text-green-600">
                        {orcamentos.filter(o => o.frete_embutido).length}
                      </p>
                      <p className="text-xs text-green-600">orçamentos</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium">Frete Separado</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {orcamentos.filter(o => !o.frete_embutido && o.valor_frete > 0).length}
                      </p>
                      <p className="text-xs text-blue-600">orçamentos</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ==================== ABA ALERTAS ==================== */}
            {abaAtiva === 'alertas' && (
              <div className="space-y-6">
                {/* Resumo de Alertas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <AlertCircle className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-red-700">Propostas Vencendo (3 dias)</p>
                        <p className="text-3xl font-bold text-red-600">{metricas.alertas.propostasVencendo.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Clock className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-orange-700">Sem Resposta há 7+ dias</p>
                        <p className="text-3xl font-bold text-orange-600">{metricas.alertas.semRespostaHa7Dias.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500 rounded-lg">
                        <FileText className="text-white" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-yellow-700">Rascunhos Antigos (3+ dias)</p>
                        <p className="text-3xl font-bold text-yellow-600">{metricas.alertas.rascunhosAntigos.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lista de Propostas Vencendo */}
                {metricas.alertas.propostasVencendo.length > 0 && (
                  <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-red-50 border-b border-red-200">
                      <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                        <AlertCircle size={20} />
                        Propostas Vencendo em 3 dias
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {metricas.alertas.propostasVencendo.map((orc, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/orcamentos/editar/${orc.id}`)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{orc.numero_proposta || orc.numero}</p>
                              <p className="text-sm text-gray-500">{orc.cliente_nome}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatarValor(parseFloat(orc.valor_total) || parseFloat(orc.total) || 0)}</p>
                              <p className="text-xs text-red-600">Vendedor: {orc.usuario?.nome}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista Sem Resposta */}
                {metricas.alertas.semRespostaHa7Dias.length > 0 && (
                  <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-orange-50 border-b border-orange-200">
                      <h3 className="text-lg font-bold text-orange-800 flex items-center gap-2">
                        <Clock size={20} />
                        Aguardando Resposta há mais de 7 dias
                      </h3>
                    </div>
                    <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                      {metricas.alertas.semRespostaHa7Dias.slice(0, 20).map((orc, index) => (
                        <div key={index} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/orcamentos/editar/${orc.id}`)}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{orc.numero_proposta || orc.numero}</p>
                              <p className="text-sm text-gray-500">{orc.cliente_nome}</p>
                              <p className="text-xs text-orange-600">
                                Enviado há {differenceInDays(new Date(), new Date(orc.created_at))} dias
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatarValor(parseFloat(orc.valor_total) || parseFloat(orc.total) || 0)}</p>
                              <p className="text-xs text-gray-500">{orc.usuario?.nome}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pipeline Atual */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-purple-600" />
                    Pipeline Atual
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-gray-600">{metricas.porStatus.rascunho.length}</p>
                      <p className="text-sm text-gray-500">Para Enviar</p>
                      <p className="text-xs text-gray-400">{formatarValor(metricas.valorPorStatus.rascunho)}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">{metricas.porStatus.enviado.length}</p>
                      <p className="text-sm text-blue-700">Aguardando</p>
                      <p className="text-xs text-blue-500">{formatarValor(metricas.valorPorStatus.enviado)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">{metricas.porStatus.aprovado.length}</p>
                      <p className="text-sm text-green-700">Para Lançar</p>
                      <p className="text-xs text-green-500">{formatarValor(metricas.valorPorStatus.aprovado)}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-purple-600">{metricas.porStatus.lancado.length}</p>
                      <p className="text-sm text-purple-700">Lançados</p>
                      <p className="text-xs text-purple-500">{formatarValor(metricas.valorPorStatus.lancado)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
