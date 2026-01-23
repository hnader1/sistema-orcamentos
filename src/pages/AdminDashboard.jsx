import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, BarChart3, TrendingUp, Package, DollarSign, Calendar, 
  AlertTriangle, Users, Truck, Target, Filter, RefreshCw,
  FileText, CheckCircle, XCircle, Clock, Award, MapPin,
  Percent, Scale, Activity, Eye, Send, Briefcase, Star,
  AlertCircle, TrendingDown, ArrowRight, ChevronDown, Download,
  Trophy, Flame, Zap, Medal, Crown, GitCompare, LineChart as LineChartIcon
} from 'lucide-react'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { format, subDays, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, differenceInDays, getMonth, getYear } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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

const TABS = [
  { id: 'resumo', label: 'Resumo', icon: BarChart3 },
  { id: 'funil', label: 'Funil', icon: Target },
  { id: 'vendedores', label: 'Vendedores', icon: Users },
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'clientes', label: 'Clientes', icon: MapPin },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'frete', label: 'Frete', icon: Truck },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
  { id: 'comparativo', label: 'Comparativo', icon: GitCompare },
  { id: 'evolucao', label: 'Evolução', icon: LineChartIcon },
  { id: 'metas', label: 'Metas', icon: Target },
  { id: 'conquistas', label: 'Conquistas', icon: Trophy }
]

const PERIODOS = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta Semana' },
  { value: 'mes', label: 'Este Mês' },
  { value: '30dias', label: 'Últimos 30 dias' },
  { value: '90dias', label: 'Últimos 90 dias' },
  { value: 'ano', label: 'Este Ano' },
  { value: '12meses', label: 'Últimos 12 meses' }
]

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [abaAtiva, setAbaAtiva] = useState('resumo')
  const [periodo, setPeriodo] = useState('mes')
  const [vendedorFiltro, setVendedorFiltro] = useState('todos')
  
  const [orcamentos, setOrcamentos] = useState([])
  const [orcamentosHistorico, setOrcamentosHistorico] = useState([])
  const [produtos, setProdutos] = useState([])
  const [usuarios, setUsuarios] = useState([])

  useEffect(() => {
    if (isAdmin()) {
      carregarDados()
    }
  }, [periodo, vendedorFiltro])

  const calcularPeriodo = (periodo) => {
    const hoje = new Date()
    let inicio, fim = endOfDay(hoje)
    switch (periodo) {
      case 'hoje': inicio = startOfDay(hoje); break
      case 'semana': inicio = startOfWeek(hoje, { locale: ptBR }); fim = endOfWeek(hoje, { locale: ptBR }); break
      case 'mes': inicio = startOfMonth(hoje); fim = endOfMonth(hoje); break
      case '30dias': inicio = subDays(hoje, 30); break
      case '90dias': inicio = subDays(hoje, 90); break
      case 'ano': inicio = startOfYear(hoje); break
      case '12meses': inicio = subMonths(hoje, 12); break
      default: inicio = subDays(hoje, 30)
    }
    return { inicio: inicio.toISOString(), fim: fim.toISOString() }
  }

  const carregarDados = async () => {
    try {
      setLoading(true)
      const { inicio, fim } = calcularPeriodo(periodo)

      let queryOrcamentos = supabase
        .from('orcamentos')
        .select(`*, usuario:usuarios!orcamentos_usuario_id_fkey(id, nome, codigo_vendedor), itens:orcamentos_itens(*)`)
        .gte('created_at', inicio)
        .lte('created_at', fim)
        .eq('excluido', false)
        .order('created_at', { ascending: false })

      if (vendedorFiltro !== 'todos') {
        queryOrcamentos = queryOrcamentos.eq('usuario_id', vendedorFiltro)
      }

      const { data: orcamentosData } = await queryOrcamentos

      // Carregar histórico dos últimos 12 meses para comparativos
      const inicio12Meses = subMonths(new Date(), 12).toISOString()
      let queryHistorico = supabase
        .from('orcamentos')
        .select(`id, created_at, status, total, usuario_id, usuario:usuarios!orcamentos_usuario_id_fkey(id, nome, codigo_vendedor)`)
        .gte('created_at', inicio12Meses)
        .eq('excluido', false)

      if (vendedorFiltro !== 'todos') {
        queryHistorico = queryHistorico.eq('usuario_id', vendedorFiltro)
      }

      const { data: historicoData } = await queryHistorico

      const { data: usuariosData } = await supabase
        .from('usuarios')
        .select('id, nome, codigo_vendedor, tipo')
        .eq('ativo', true)
        .order('nome')

      const { data: produtosData } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)

      setOrcamentos(orcamentosData || [])
      setOrcamentosHistorico(historicoData || [])
      setUsuarios(usuariosData || [])
      setProdutos(produtosData || [])

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // ==========================================
  // MÉTRICAS PRINCIPAIS
  // ==========================================
  const metricas = useMemo(() => {
    if (!orcamentos.length) return null

    const porStatus = {
      rascunho: orcamentos.filter(o => o.status === 'rascunho'),
      enviado: orcamentos.filter(o => o.status === 'enviado'),
      aprovado: orcamentos.filter(o => o.status === 'aprovado'),
      lancado: orcamentos.filter(o => o.status === 'lancado'),
      finalizado: orcamentos.filter(o => o.status === 'finalizado'),
      cancelado: orcamentos.filter(o => o.status === 'cancelado')
    }

    const valorPorStatus = {}
    Object.keys(porStatus).forEach(status => {
      valorPorStatus[status] = porStatus[status].reduce((sum, o) => 
        sum + (parseFloat(o.valor_total) || parseFloat(o.total) || 0), 0
      )
    })

    const totalEnviados = porStatus.enviado.length + porStatus.aprovado.length + porStatus.lancado.length + porStatus.finalizado.length + porStatus.cancelado.length
    const totalAprovados = porStatus.aprovado.length + porStatus.lancado.length + porStatus.finalizado.length
    const totalLancados = porStatus.lancado.length + porStatus.finalizado.length

    const taxaEnvio = orcamentos.length > 0 ? (totalEnviados / orcamentos.length) * 100 : 0
    const taxaAprovacao = totalEnviados > 0 ? (totalAprovados / totalEnviados) * 100 : 0
    const taxaLancamento = totalAprovados > 0 ? (totalLancados / totalAprovados) * 100 : 0
    const taxaConversaoGeral = orcamentos.length > 0 ? (totalLancados / orcamentos.length) * 100 : 0
    const ticketMedio = totalLancados > 0 ? (valorPorStatus.lancado + valorPorStatus.finalizado) / totalLancados : 0

    let toneladasArgamassa = 0, toneladasTotal = 0
    orcamentos.forEach(orc => {
      if ((orc.status === 'lancado' || orc.status === 'finalizado') && orc.itens) {
        orc.itens.forEach(item => {
          const peso = (item.quantidade || 0) * (item.peso_unitario || 0) / 1000
          toneladasTotal += peso
          if (item.produto?.toLowerCase().includes('argamassa')) toneladasArgamassa += peso
        })
      }
    })

    const comDesconto = orcamentos.filter(o => (o.desconto_geral || 0) > 0)
    const descontoMedio = comDesconto.length > 0 ? comDesconto.reduce((sum, o) => sum + (o.desconto_geral || 0), 0) / comDesconto.length : 0
    const valorDescontos = orcamentos.reduce((sum, o) => {
      const subtotal = parseFloat(o.subtotal_produtos) || parseFloat(o.total) || 0
      return sum + (subtotal * (o.desconto_geral || 0) / 100)
    }, 0)

    const comFrete = orcamentos.filter(o => o.tipo_frete?.toLowerCase().includes('cif'))
    const valorFreteTotal = orcamentos.reduce((sum, o) => sum + (parseFloat(o.valor_frete) || 0), 0)
    const percentualCIF = orcamentos.length > 0 ? (comFrete.length / orcamentos.length) * 100 : 0

    const porVendedor = {}
    orcamentos.forEach(orc => {
      const vendedor = orc.usuario?.nome || 'Sem vendedor'
      const vendedorId = orc.usuario?.id || 'sem-id'
      const codigo = orc.usuario?.codigo_vendedor || ''
      
      if (!porVendedor[vendedorId]) {
        porVendedor[vendedorId] = { id: vendedorId, nome: vendedor, codigo, total: 0, enviados: 0, aprovados: 0, lancados: 0, cancelados: 0, valor: 0, valorLancado: 0, descontos: [] }
      }
      
      porVendedor[vendedorId].total++
      porVendedor[vendedorId].valor += parseFloat(orc.valor_total) || parseFloat(orc.total) || 0
      if (orc.desconto_geral > 0) porVendedor[vendedorId].descontos.push(orc.desconto_geral)
      if (orc.status === 'enviado') porVendedor[vendedorId].enviados++
      if (orc.status === 'aprovado') porVendedor[vendedorId].aprovados++
      if (orc.status === 'lancado' || orc.status === 'finalizado') {
        porVendedor[vendedorId].lancados++
        porVendedor[vendedorId].valorLancado += parseFloat(orc.valor_total) || parseFloat(orc.total) || 0
      }
      if (orc.status === 'cancelado') porVendedor[vendedorId].cancelados++
    })

    Object.values(porVendedor).forEach(v => {
      v.descontoMedio = v.descontos.length > 0 ? v.descontos.reduce((a, b) => a + b, 0) / v.descontos.length : 0
      v.taxaConversao = v.total > 0 ? (v.lancados / v.total) * 100 : 0
    })

    const porProduto = {}
    orcamentos.forEach(orc => {
      if (orc.itens) {
        orc.itens.forEach(item => {
          const produtoNome = item.produto || 'Sem nome'
          if (!porProduto[produtoNome]) porProduto[produtoNome] = { nome: produtoNome, quantidade: 0, valor: 0, peso: 0, ocorrencias: 0 }
          porProduto[produtoNome].quantidade += item.quantidade || 0
          porProduto[produtoNome].valor += (item.quantidade || 0) * (item.preco_unitario || item.preco || 0)
          porProduto[produtoNome].peso += (item.quantidade || 0) * (item.peso_unitario || 0) / 1000
          porProduto[produtoNome].ocorrencias++
        })
      }
    })

    const clientesUnicos = new Set(orcamentos.map(o => o.cnpj_cpf || o.cliente_nome).filter(Boolean))
    
    const porCidade = {}
    orcamentos.forEach(orc => {
      const cidade = orc.obra_cidade || orc.cidade || 'Não informado'
      if (!porCidade[cidade]) porCidade[cidade] = { nome: cidade, quantidade: 0, valor: 0 }
      porCidade[cidade].quantidade++
      porCidade[cidade].valor += parseFloat(orc.valor_total) || parseFloat(orc.total) || 0
    })

    const hoje = new Date()
    const alertas = {
      propostasVencendo: orcamentos.filter(o => {
        if (o.status !== 'enviado') return false
        const dataOrc = new Date(o.created_at)
        const validadeDias = o.validade_dias || 15
        const dataExpiracao = new Date(dataOrc.getTime() + validadeDias * 24 * 60 * 60 * 1000)
        return differenceInDays(dataExpiracao, hoje) <= 3 && differenceInDays(dataExpiracao, hoje) >= 0
      }),
      semRespostaHa7Dias: orcamentos.filter(o => o.status === 'enviado' && differenceInDays(hoje, new Date(o.created_at)) >= 7),
      rascunhosAntigos: orcamentos.filter(o => o.status === 'rascunho' && differenceInDays(hoje, new Date(o.created_at)) >= 3)
    }

    return {
      total: orcamentos.length, porStatus, valorPorStatus,
      valorTotal: Object.values(valorPorStatus).reduce((a, b) => a + b, 0),
      taxaEnvio, taxaAprovacao, taxaLancamento, taxaConversaoGeral, ticketMedio,
      toneladasArgamassa, toneladasTotal, descontoMedio, valorDescontos, percentualCIF, valorFreteTotal,
      porVendedor: Object.values(porVendedor).sort((a, b) => b.valorLancado - a.valorLancado),
      porProduto: Object.values(porProduto).sort((a, b) => b.valor - a.valor),
      clientesUnicos: clientesUnicos.size,
      porCidade: Object.values(porCidade).sort((a, b) => b.valor - a.valor),
      alertas
    }
  }, [orcamentos])

  // ==========================================
  // MÉTRICAS COMPARATIVO MÊS A MÊS
  // ==========================================
  const comparativo = useMemo(() => {
    if (!orcamentosHistorico.length) return null

    const hoje = new Date()
    const mesAtual = getMonth(hoje)
    const anoAtual = getYear(hoje)
    
    // Agrupar por mês
    const porMes = {}
    for (let i = 11; i >= 0; i--) {
      const data = subMonths(hoje, i)
      const mes = getMonth(data)
      const ano = getYear(data)
      const chave = `${ano}-${String(mes + 1).padStart(2, '0')}`
      porMes[chave] = {
        mes: MESES[mes],
        ano,
        chave,
        total: 0,
        lancados: 0,
        valor: 0,
        valorLancado: 0
      }
    }

    orcamentosHistorico.forEach(orc => {
      const data = new Date(orc.created_at)
      const mes = getMonth(data)
      const ano = getYear(data)
      const chave = `${ano}-${String(mes + 1).padStart(2, '0')}`
      
      if (porMes[chave]) {
        porMes[chave].total++
        porMes[chave].valor += parseFloat(orc.valor_total) || parseFloat(orc.total) || 0
        if (orc.status === 'lancado' || orc.status === 'finalizado') {
          porMes[chave].lancados++
          porMes[chave].valorLancado += parseFloat(orc.valor_total) || parseFloat(orc.total) || 0
        }
      }
    })

    const dados = Object.values(porMes)
    
    // Calcular variações
    const mesAtualData = dados[dados.length - 1]
    const mesAnteriorData = dados[dados.length - 2]
    const mesmoMesAnoPassado = dados.find(d => {
      const [ano, mes] = d.chave.split('-')
      return parseInt(mes) === mesAtual + 1 && parseInt(ano) === anoAtual - 1
    })

    return {
      dados,
      mesAtual: mesAtualData,
      mesAnterior: mesAnteriorData,
      mesmoMesAnoPassado,
      variacaoMesAnterior: mesAnteriorData?.valorLancado > 0 
        ? ((mesAtualData.valorLancado - mesAnteriorData.valorLancado) / mesAnteriorData.valorLancado) * 100 
        : 0,
      variacaoAnoPassado: mesmoMesAnoPassado?.valorLancado > 0
        ? ((mesAtualData.valorLancado - mesmoMesAnoPassado.valorLancado) / mesmoMesAnoPassado.valorLancado) * 100
        : 0
    }
  }, [orcamentosHistorico])

  // ==========================================
  // MÉTRICAS DE METAS
  // ==========================================
  const metricasMetas = useMemo(() => {
    if (!metricas || !usuarios.length) return null

    const hoje = new Date()
    const diasNoMes = endOfMonth(hoje).getDate()
    const diaAtual = hoje.getDate()
    const percentualMes = (diaAtual / diasNoMes) * 100

    const vendedoresComMeta = metricas.porVendedor.map(v => {
      const meta = 100000 // Meta padrão de R$ 100k
      const atingido = v.valorLancado
      const percentualAtingido = (atingido / meta) * 100
      const projecao = diaAtual > 0 ? (atingido / diaAtual) * diasNoMes : 0
      const status = percentualAtingido >= percentualMes ? 'no_ritmo' : percentualAtingido >= percentualMes * 0.8 ? 'atencao' : 'atrasado'

      return {
        ...v,
        meta,
        atingido,
        percentualAtingido,
        projecao,
        status,
        faltando: Math.max(0, meta - atingido)
      }
    }).sort((a, b) => b.percentualAtingido - a.percentualAtingido)

    return {
      vendedores: vendedoresComMeta,
      percentualMes,
      diasRestantes: diasNoMes - diaAtual
    }
  }, [metricas, usuarios])

  // ==========================================
  // CONQUISTAS / GAMIFICAÇÃO
  // ==========================================
  const conquistas = useMemo(() => {
    if (!metricas || !orcamentos.length) return null

    // Maior venda do período
    const maiorVenda = orcamentos.reduce((max, orc) => {
      const valor = parseFloat(orc.valor_total) || parseFloat(orc.total) || 0
      return valor > max.valor ? { ...orc, valor } : max
    }, { valor: 0 })

    // Vendedor com mais lançamentos
    const topLancamentos = metricas.porVendedor[0]

    // Vendedor com melhor taxa de conversão (mínimo 5 orçamentos)
    const topConversao = [...metricas.porVendedor]
      .filter(v => v.total >= 5)
      .sort((a, b) => b.taxaConversao - a.taxaConversao)[0]

    // Venda mais rápida (menor tempo entre criação e lançamento)
    const vendaMaisRapida = orcamentos
      .filter(o => o.status === 'lancado' && o.data_lancamento)
      .map(o => ({
        ...o,
        diasParaFechar: differenceInDays(new Date(o.data_lancamento || o.updated_at), new Date(o.created_at))
      }))
      .sort((a, b) => a.diasParaFechar - b.diasParaFechar)[0]

    // Recordes
    const recordes = {
      maiorVendaMes: maiorVenda,
      maisLancamentos: topLancamentos,
      melhorConversao: topConversao,
      vendaMaisRapida
    }

    // Badges dos vendedores
    const badges = metricas.porVendedor.map(v => {
      const badgesList = []
      
      if (v.lancados >= 10) badgesList.push({ icon: '🔥', label: 'Em Chamas', desc: '10+ lançamentos' })
      if (v.taxaConversao >= 60) badgesList.push({ icon: '🎯', label: 'Precisão', desc: '60%+ conversão' })
      if (v.valorLancado >= 200000) badgesList.push({ icon: '💰', label: 'Faturador', desc: 'R$ 200k+ lançado' })
      if (v.descontoMedio <= 3 && v.lancados >= 3) badgesList.push({ icon: '💎', label: 'Margem Alta', desc: 'Desconto ≤3%' })
      if (v.id === topLancamentos?.id) badgesList.push({ icon: '👑', label: 'Líder', desc: 'Mais lançamentos' })
      if (v.id === topConversao?.id) badgesList.push({ icon: '🏆', label: 'Campeão', desc: 'Melhor conversão' })

      return { ...v, badges: badgesList }
    })

    return { recordes, badges }
  }, [metricas, orcamentos])

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
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Dashboard Gerencial</h1>
                  <p className="text-sm text-gray-500">Análises completas</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Calendar size={18} className="text-gray-500" />
                <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="bg-transparent border-none text-sm font-medium focus:ring-0">
                  {PERIODOS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <Users size={18} className="text-gray-500" />
                <select value={vendedorFiltro} onChange={(e) => setVendedorFiltro(e.target.value)} className="bg-transparent border-none text-sm font-medium focus:ring-0">
                  <option value="todos">Todos Vendedores</option>
                  {usuarios.filter(u => u.codigo_vendedor).map(u => (
                    <option key={u.id} value={u.id}>{u.codigo_vendedor} - {u.nome}</option>
                  ))}
                </select>
              </div>

              <button onClick={carregarDados} disabled={loading} className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Abas */}
          <div className="mt-4 flex gap-1 overflow-x-auto pb-2">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setAbaAtiva(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    abaAtiva === tab.id ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                  {tab.id === 'alertas' && metricas?.alertas && (metricas.alertas.propostasVencendo.length + metricas.alertas.semRespostaHa7Dias.length) > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {metricas.alertas.propostasVencendo.length + metricas.alertas.semRespostaHa7Dias.length}
                    </span>
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
            <p className="text-gray-500 mt-4">Carregando...</p>
          </div>
        ) : !metricas ? (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum dado encontrado para o período selecionado</p>
          </div>
        ) : (
          <>
            {/* ABA RESUMO */}
            {abaAtiva === 'resumo' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Total</p>
                    <p className="text-2xl font-bold">{metricas.total}</p>
                  </div>
                  <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Valor Total</p>
                    <p className="text-2xl font-bold text-green-600">{formatarValor(metricas.valorTotal)}</p>
                  </div>
                  <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Lançados</p>
                    <p className="text-2xl font-bold text-purple-600">{metricas.porStatus.lancado.length + metricas.porStatus.finalizado.length}</p>
                    <p className="text-xs text-gray-400">{formatarValor(metricas.valorPorStatus.lancado + metricas.valorPorStatus.finalizado)}</p>
                  </div>
                  <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Conversão</p>
                    <p className="text-2xl font-bold text-blue-600">{metricas.taxaConversaoGeral.toFixed(0)}%</p>
                  </div>
                  <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Ticket Médio</p>
                    <p className="text-2xl font-bold text-orange-600">{formatarValor(metricas.ticketMedio)}</p>
                  </div>
                  <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Argamassa</p>
                    <p className="text-2xl font-bold text-teal-600">{metricas.toneladasArgamassa.toFixed(1)} ton</p>
                  </div>
                </div>

                {/* Mini Funil */}
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                        {etapa.taxa !== undefined && <p className="text-xs text-gray-400">{etapa.taxa.toFixed(0)}%</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Por Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={dadosPizza} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {dadosPizza.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Valores por Status (R$ mil)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={[
                        { status: 'Enviado', valor: metricas.valorPorStatus.enviado / 1000 },
                        { status: 'Aprovado', valor: metricas.valorPorStatus.aprovado / 1000 },
                        { status: 'Lançado', valor: metricas.valorPorStatus.lancado / 1000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="status" />
                        <YAxis />
                        <Tooltip formatter={(v) => `R$ ${v.toFixed(1)}k`} />
                        <Bar dataKey="valor" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Vendedores */}
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Award size={20} className="text-yellow-500" />
                    Ranking de Vendedores
                  </h3>
                  <div className="space-y-3">
                    {metricas.porVendedor.slice(0, 5).map((v, i) => (
                      <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-400' : 'bg-gray-300'}`}>{i + 1}</div>
                          <div>
                            <p className="font-medium">{v.codigo} - {v.nome}</p>
                            <p className="text-xs text-gray-500">{v.total} orç • {v.lancados} lanç • {v.taxaConversao.toFixed(0)}%</p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">{formatarValor(v.valorLancado)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA FUNIL */}
            {abaAtiva === 'funil' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-6">Funil Detalhado</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Criados', value: metricas.total, color: 'bg-gray-400', width: '100%' },
                      { label: 'Enviados', value: metricas.porStatus.enviado.length + metricas.porStatus.aprovado.length + metricas.porStatus.lancado.length, color: 'bg-blue-500', width: `${metricas.taxaEnvio}%`, taxa: metricas.taxaEnvio },
                      { label: 'Aprovados', value: metricas.porStatus.aprovado.length + metricas.porStatus.lancado.length, color: 'bg-green-500', width: `${metricas.taxaAprovacao * metricas.taxaEnvio / 100}%`, taxa: metricas.taxaAprovacao },
                      { label: 'Lançados', value: metricas.porStatus.lancado.length, color: 'bg-purple-500', width: `${metricas.taxaConversaoGeral}%`, taxa: metricas.taxaLancamento }
                    ].map((etapa, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-32 text-sm font-medium">{etapa.label}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-10 overflow-hidden">
                          <div className={`${etapa.color} h-full rounded-full flex items-center justify-end pr-4`} style={{ width: etapa.width }}>
                            <span className="text-white font-bold">{etapa.value}</span>
                          </div>
                        </div>
                        <div className="w-16 text-right">
                          {etapa.taxa !== undefined && <span className={`text-sm font-medium ${etapa.taxa >= 50 ? 'text-green-600' : 'text-red-600'}`}>{etapa.taxa.toFixed(0)}%</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-700">Cancelados</p>
                    <p className="text-2xl font-bold text-red-600">{metricas.porStatus.cancelado.length}</p>
                    <p className="text-xs text-red-500">{formatarValor(metricas.valorPorStatus.cancelado)}</p>
                  </div>
                  <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="text-sm text-gray-700">Em Rascunho</p>
                    <p className="text-2xl font-bold text-gray-600">{metricas.porStatus.rascunho.length}</p>
                    <p className="text-xs text-gray-500">{formatarValor(metricas.valorPorStatus.rascunho)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">Aguardando</p>
                    <p className="text-2xl font-bold text-blue-600">{metricas.porStatus.enviado.length}</p>
                    <p className="text-xs text-blue-500">{formatarValor(metricas.valorPorStatus.enviado)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ABA VENDEDORES */}
            {abaAtiva === 'vendedores' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-4 border-b"><h3 className="text-lg font-bold">Performance dos Vendedores</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Vendedor</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Total</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Lançados</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Taxa</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Desc.</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Valor Lançado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {metricas.porVendedor.map((v, i) => (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i < 3 ? 'bg-yellow-500' : 'bg-gray-300'}`}>{i + 1}</span></td>
                            <td className="px-4 py-3 font-medium">{v.codigo} - {v.nome}</td>
                            <td className="px-4 py-3 text-center">{v.total}</td>
                            <td className="px-4 py-3 text-center text-purple-600 font-bold">{v.lancados}</td>
                            <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs ${v.taxaConversao >= 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{v.taxaConversao.toFixed(0)}%</span></td>
                            <td className="px-4 py-3 text-center text-orange-600">{v.descontoMedio.toFixed(1)}%</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">{formatarValor(v.valorLancado)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ABA PRODUTOS */}
            {abaAtiva === 'produtos' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Tonelagem Total</p><p className="text-2xl font-bold">{metricas.toneladasTotal.toFixed(1)} ton</p></div>
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Argamassa</p><p className="text-2xl font-bold text-orange-600">{metricas.toneladasArgamassa.toFixed(1)} ton</p></div>
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Produtos</p><p className="text-2xl font-bold text-purple-600">{metricas.porProduto.length}</p></div>
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Valor</p><p className="text-2xl font-bold text-green-600">{formatarValor(metricas.porProduto.reduce((s, p) => s + p.valor, 0))}</p></div>
                </div>

                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Top 15 Produtos</h3>
                  <div className="space-y-2">
                    {metricas.porProduto.slice(0, 15).map((p, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-6 text-sm text-gray-500">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm truncate">{p.nome.substring(0, 40)}</span>
                            <span className="text-sm font-bold text-green-600">{formatarValor(p.valor)}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(p.valor / metricas.porProduto[0].valor) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA CLIENTES */}
            {abaAtiva === 'clientes' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Clientes</p><p className="text-2xl font-bold">{metricas.clientesUnicos}</p></div>
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Ticket Médio</p><p className="text-2xl font-bold text-green-600">{formatarValor(metricas.ticketMedio)}</p></div>
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Cidades</p><p className="text-2xl font-bold text-blue-600">{metricas.porCidade.length}</p></div>
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Orç/Cliente</p><p className="text-2xl font-bold text-purple-600">{(metricas.total / Math.max(metricas.clientesUnicos, 1)).toFixed(1)}</p></div>
                </div>

                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Top Cidades</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metricas.porCidade.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                      <YAxis dataKey="nome" type="category" width={120} />
                      <Tooltip formatter={(v) => formatarValor(v)} />
                      <Bar dataKey="valor" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ABA FINANCEIRO */}
            {abaAtiva === 'financeiro' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <p className="text-xs uppercase opacity-80">Lançado</p>
                    <p className="text-2xl font-bold">{formatarValor(metricas.valorPorStatus.lancado + metricas.valorPorStatus.finalizado)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <p className="text-xs uppercase opacity-80">Pipeline</p>
                    <p className="text-2xl font-bold">{formatarValor(metricas.valorPorStatus.enviado + metricas.valorPorStatus.aprovado)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <p className="text-xs uppercase opacity-80">Descontos</p>
                    <p className="text-2xl font-bold">{formatarValor(metricas.valorDescontos)}</p>
                    <p className="text-xs opacity-70">Média: {metricas.descontoMedio.toFixed(1)}%</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
                    <p className="text-xs uppercase opacity-80">Cancelado</p>
                    <p className="text-2xl font-bold">{formatarValor(metricas.valorPorStatus.cancelado)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Desconto por Vendedor</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[...metricas.porVendedor].sort((a, b) => b.descontoMedio - a.descontoMedio).slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="codigo" />
                      <YAxis unit="%" />
                      <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
                      <Bar dataKey="descontoMedio" fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ABA FRETE */}
            {abaAtiva === 'frete' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">CIF</p><p className="text-2xl font-bold text-blue-600">{metricas.percentualCIF.toFixed(0)}%</p></div>
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">FOB</p><p className="text-2xl font-bold text-gray-600">{(100 - metricas.percentualCIF).toFixed(0)}%</p></div>
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Valor Frete</p><p className="text-2xl font-bold text-green-600">{formatarValor(metricas.valorFreteTotal)}</p></div>
                  <div className="bg-white rounded-xl border p-4"><p className="text-xs text-gray-500">Frete Médio</p><p className="text-2xl font-bold text-orange-600">{formatarValor(metricas.valorFreteTotal / Math.max(orcamentos.filter(o => o.valor_frete > 0).length, 1))}</p></div>
                </div>

                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">CIF vs FOB</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={[{ name: 'CIF', value: metricas.percentualCIF }, { name: 'FOB', value: 100 - metricas.percentualCIF }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}>
                        <Cell fill={COLORS.info} />
                        <Cell fill={COLORS.secondary} />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ABA ALERTAS */}
            {abaAtiva === 'alertas' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500 rounded-lg"><AlertCircle className="text-white" size={24} /></div>
                      <div><p className="text-sm text-red-700">Vencendo (3 dias)</p><p className="text-3xl font-bold text-red-600">{metricas.alertas.propostasVencendo.length}</p></div>
                    </div>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500 rounded-lg"><Clock className="text-white" size={24} /></div>
                      <div><p className="text-sm text-orange-700">Sem resposta 7+ dias</p><p className="text-3xl font-bold text-orange-600">{metricas.alertas.semRespostaHa7Dias.length}</p></div>
                    </div>
                  </div>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500 rounded-lg"><FileText className="text-white" size={24} /></div>
                      <div><p className="text-sm text-yellow-700">Rascunhos antigos</p><p className="text-3xl font-bold text-yellow-600">{metricas.alertas.rascunhosAntigos.length}</p></div>
                    </div>
                  </div>
                </div>

                {metricas.alertas.semRespostaHa7Dias.length > 0 && (
                  <div className="bg-white rounded-xl border border-orange-200 shadow-sm overflow-hidden">
                    <div className="p-4 bg-orange-50 border-b"><h3 className="text-lg font-bold text-orange-800">Sem Resposta há 7+ dias</h3></div>
                    <div className="divide-y max-h-96 overflow-y-auto">
                      {metricas.alertas.semRespostaHa7Dias.slice(0, 15).map((orc, i) => (
                        <div key={i} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/orcamentos/editar/${orc.id}`)}>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{orc.numero_proposta || orc.numero}</p>
                              <p className="text-sm text-gray-500">{orc.cliente_nome}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">{formatarValor(parseFloat(orc.total) || 0)}</p>
                              <p className="text-xs text-gray-500">{orc.usuario?.nome}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ABA COMPARATIVO */}
            {abaAtiva === 'comparativo' && comparativo && (
              <div className="space-y-6">
                {/* Cards de Comparação */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <p className="text-sm text-gray-500 mb-2">Este Mês</p>
                    <p className="text-3xl font-bold text-purple-600">{formatarValor(comparativo.mesAtual?.valorLancado || 0)}</p>
                    <p className="text-sm text-gray-400">{comparativo.mesAtual?.lancados || 0} lançados</p>
                  </div>
                  <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <p className="text-sm text-gray-500 mb-2">Mês Anterior</p>
                    <p className="text-3xl font-bold">{formatarValor(comparativo.mesAnterior?.valorLancado || 0)}</p>
                    <div className={`flex items-center gap-1 mt-1 ${comparativo.variacaoMesAnterior >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {comparativo.variacaoMesAnterior >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="text-sm font-medium">{comparativo.variacaoMesAnterior >= 0 ? '+' : ''}{comparativo.variacaoMesAnterior.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border p-6 shadow-sm">
                    <p className="text-sm text-gray-500 mb-2">Mesmo Mês Ano Passado</p>
                    <p className="text-3xl font-bold">{formatarValor(comparativo.mesmoMesAnoPassado?.valorLancado || 0)}</p>
                    {comparativo.mesmoMesAnoPassado && (
                      <div className={`flex items-center gap-1 mt-1 ${comparativo.variacaoAnoPassado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {comparativo.variacaoAnoPassado >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span className="text-sm font-medium">{comparativo.variacaoAnoPassado >= 0 ? '+' : ''}{comparativo.variacaoAnoPassado.toFixed(0)}% vs ano passado</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gráfico de Evolução */}
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Evolução Mensal (12 meses)</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={comparativo.dados}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis yAxisId="left" tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip formatter={(v, name) => name.includes('Valor') ? formatarValor(v) : v} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="valorLancado" name="Valor Lançado" fill={COLORS.success} radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="lancados" name="Qtd Lançados" stroke={COLORS.primary} strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabela Comparativa */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-4 border-b"><h3 className="text-lg font-bold">Detalhamento Mensal</h3></div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Mês</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Orçamentos</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Lançados</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Taxa</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Valor Total</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Valor Lançado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {comparativo.dados.slice().reverse().map((m, i) => (
                          <tr key={i} className={i === 0 ? 'bg-purple-50' : 'hover:bg-gray-50'}>
                            <td className="px-4 py-3 font-medium">{m.mes}/{m.ano}</td>
                            <td className="px-4 py-3 text-center">{m.total}</td>
                            <td className="px-4 py-3 text-center text-purple-600 font-bold">{m.lancados}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${m.total > 0 && (m.lancados / m.total) >= 0.4 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {m.total > 0 ? ((m.lancados / m.total) * 100).toFixed(0) : 0}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">{formatarValor(m.valor)}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-600">{formatarValor(m.valorLancado)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ABA EVOLUÇÃO */}
            {abaAtiva === 'evolucao' && comparativo && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Tendência de Valor Lançado</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={comparativo.dados}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => formatarValor(v)} />
                      <Area type="monotone" dataKey="valorLancado" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-bold mb-4">Volume de Orçamentos vs Lançamentos</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={comparativo.dados}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mes" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total Orçamentos" fill={COLORS.info} />
                      <Bar dataKey="lancados" name="Lançados" fill={COLORS.success} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ABA METAS */}
            {abaAtiva === 'metas' && metricasMetas && (
              <div className="space-y-6">
                {/* Progresso do Mês */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Progresso do Mês</h3>
                    <span className="text-sm opacity-80">{metricasMetas.diasRestantes} dias restantes</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-4 mb-2">
                    <div className="bg-white h-4 rounded-full" style={{ width: `${Math.min(metricasMetas.percentualMes, 100)}%` }} />
                  </div>
                  <p className="text-sm opacity-80">{metricasMetas.percentualMes.toFixed(0)}% do mês decorrido</p>
                </div>

                {/* Vendedores */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  <div className="p-4 border-b"><h3 className="text-lg font-bold">Metas por Vendedor</h3></div>
                  <div className="divide-y">
                    {metricasMetas.vendedores.map((v, i) => (
                      <div key={v.id} className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${v.status === 'no_ritmo' ? 'bg-green-500' : v.status === 'atencao' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="font-medium">{v.codigo} - {v.nome}</span>
                          </div>
                          <span className={`text-sm font-bold ${v.percentualAtingido >= 100 ? 'text-green-600' : v.percentualAtingido >= metricasMetas.percentualMes ? 'text-blue-600' : 'text-red-600'}`}>
                            {v.percentualAtingido.toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-100 rounded-full h-3">
                            <div className={`h-3 rounded-full ${v.percentualAtingido >= 100 ? 'bg-green-500' : v.percentualAtingido >= metricasMetas.percentualMes ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${Math.min(v.percentualAtingido, 100)}%` }} />
                          </div>
                          <div className="text-right text-sm">
                            <span className="font-bold text-green-600">{formatarValor(v.atingido)}</span>
                            <span className="text-gray-400"> / {formatarValor(v.meta)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Projeção: {formatarValor(v.projecao)}</span>
                          <span>Falta: {formatarValor(v.faltando)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ABA CONQUISTAS */}
            {abaAtiva === 'conquistas' && conquistas && (
              <div className="space-y-6">
                {/* Recordes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={20} />
                      <span className="text-sm font-medium">Maior Venda</span>
                    </div>
                    <p className="text-2xl font-bold">{formatarValor(conquistas.recordes.maiorVendaMes?.valor || 0)}</p>
                    <p className="text-xs opacity-80">{conquistas.recordes.maiorVendaMes?.cliente_nome}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={20} />
                      <span className="text-sm font-medium">Mais Lançamentos</span>
                    </div>
                    <p className="text-2xl font-bold">{conquistas.recordes.maisLancamentos?.lancados || 0}</p>
                    <p className="text-xs opacity-80">{conquistas.recordes.maisLancamentos?.nome}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={20} />
                      <span className="text-sm font-medium">Melhor Conversão</span>
                    </div>
                    <p className="text-2xl font-bold">{conquistas.recordes.melhorConversao?.taxaConversao.toFixed(0) || 0}%</p>
                    <p className="text-xs opacity-80">{conquistas.recordes.melhorConversao?.nome}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={20} />
                      <span className="text-sm font-medium">Venda Mais Rápida</span>
                    </div>
                    <p className="text-2xl font-bold">{conquistas.recordes.vendaMaisRapida?.diasParaFechar || '-'} dias</p>
                    <p className="text-xs opacity-80">{conquistas.recordes.vendaMaisRapida?.cliente_nome}</p>
                  </div>
                </div>

                {/* Badges por Vendedor */}
                <div className="bg-white rounded-xl border shadow-sm">
                  <div className="p-4 border-b"><h3 className="text-lg font-bold flex items-center gap-2"><Medal size={20} className="text-yellow-500" />Conquistas dos Vendedores</h3></div>
                  <div className="divide-y">
                    {conquistas.badges.filter(v => v.badges.length > 0).map((v, i) => (
                      <div key={v.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{v.codigo} - {v.nome}</p>
                            <p className="text-sm text-gray-500">{v.lancados} lançados • {formatarValor(v.valorLancado)}</p>
                          </div>
                          <div className="flex gap-2">
                            {v.badges.map((badge, bi) => (
                              <div key={bi} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full" title={badge.desc}>
                                <span>{badge.icon}</span>
                                <span className="text-xs font-medium">{badge.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legenda de Badges */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium mb-3">Legenda de Conquistas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
                    <div className="flex items-center gap-2"><span>🔥</span><span>Em Chamas (10+ lanç)</span></div>
                    <div className="flex items-center gap-2"><span>🎯</span><span>Precisão (60%+ conv)</span></div>
                    <div className="flex items-center gap-2"><span>💰</span><span>Faturador (R$ 200k+)</span></div>
                    <div className="flex items-center gap-2"><span>💎</span><span>Margem Alta (≤3% desc)</span></div>
                    <div className="flex items-center gap-2"><span>👑</span><span>Líder (+ lançamentos)</span></div>
                    <div className="flex items-center gap-2"><span>🏆</span><span>Campeão (melhor conv)</span></div>
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
