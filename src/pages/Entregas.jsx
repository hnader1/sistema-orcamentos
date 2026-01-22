import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, ChevronLeft, ChevronRight, X, Eye, Truck,
  Filter, Package, Layers
} from 'lucide-react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

export default function Entregas() {
  const navigate = useNavigate()
  const { user, isVendedor, isAdmin, isComercialInterno } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [entregas, setEntregas] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [entregaSelecionada, setEntregaSelecionada] = useState(null)
  
  // Filtros
  const [filtroVendedor, setFiltroVendedor] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [visualizacao, setVisualizacao] = useState('semanal') // 'semanal' ou 'mensal'
  
  // Data atual para navegação
  const [dataAtual, setDataAtual] = useState(new Date())

  useEffect(() => {
    carregarVendedores()
    carregarEntregas()
  }, [user, dataAtual, filtroVendedor, filtroTipo])

  const carregarVendedores = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      setVendedores(data || [])
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error)
    }
  }

  const carregarEntregas = async () => {
    try {
      setLoading(true)
      
      // Calcular range de datas baseado na visualização
      const { inicio, fim } = calcularRangeDatas()
      
      let query = supabase
        .from('orcamentos')
        .select(`
          id, numero_proposta, cliente_nome, cliente_empresa, vendedor,
          data_entrega, frete_modalidade, frete_cidade, usuario_id,
          obra_cidade, obra_bairro,
          orcamentos_itens (
            produto, classe, mpa, quantidade, unidade
          )
        `)
        .eq('status', 'lancado')
        .not('data_entrega', 'is', null)
        .gte('data_entrega', inicio)
        .lte('data_entrega', fim)
        .order('data_entrega')

      // Filtro de vendedor
      if (isVendedor()) {
        query = query.eq('usuario_id', user?.id)
      } else if (filtroVendedor !== 'todos') {
        query = query.eq('usuario_id', filtroVendedor)
      }

      const { data, error } = await query

      if (error) throw error

      // Filtrar por tipo de produto se necessário
      let entregasFiltradas = data || []
      if (filtroTipo !== 'todos') {
        entregasFiltradas = entregasFiltradas.filter(e => {
          // Buscar tipo dos produtos nos itens
          const tipos = e.orcamentos_itens?.map(item => detectarTipoProduto(item)) || []
          return tipos.includes(filtroTipo)
        })
      }

      // Adicionar tipo predominante a cada entrega
      entregasFiltradas = entregasFiltradas.map(e => ({
        ...e,
        tipo: detectarTipoPredominante(e.orcamentos_itens)
      }))

      setEntregas(entregasFiltradas)
    } catch (error) {
      console.error('Erro ao carregar entregas:', error)
    } finally {
      setLoading(false)
    }
  }

  const detectarTipoProduto = (item) => {
    const produto = (item.produto || '').toLowerCase()
    const classe = (item.classe || '').toLowerCase()
    
    if (classe.includes('ac') || produto.includes('argamassa') || produto.includes('reboco')) {
      return 'Argamassa'
    }
    if (produto.includes('piso') || produto.includes('paver') || produto.includes('intertravado')) {
      return 'Piso'
    }
    return 'Bloco'
  }

  const detectarTipoPredominante = (itens) => {
    if (!itens || itens.length === 0) return 'Bloco'
    
    const tipos = itens.map(item => detectarTipoProduto(item))
    const contagem = tipos.reduce((acc, tipo) => {
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {})
    
    return Object.entries(contagem).sort((a, b) => b[1] - a[1])[0][0]
  }

  const calcularRangeDatas = () => {
    const data = new Date(dataAtual)
    
    if (visualizacao === 'semanal') {
      // Início da semana (segunda-feira)
      const diaSemana = data.getDay()
      const diff = diaSemana === 0 ? -6 : 1 - diaSemana
      const inicio = new Date(data)
      inicio.setDate(data.getDate() + diff)
      inicio.setHours(0, 0, 0, 0)
      
      const fim = new Date(inicio)
      fim.setDate(inicio.getDate() + 6)
      fim.setHours(23, 59, 59, 999)
      
      return {
        inicio: inicio.toISOString().split('T')[0],
        fim: fim.toISOString().split('T')[0]
      }
    } else {
      // Mensal
      const inicio = new Date(data.getFullYear(), data.getMonth(), 1)
      const fim = new Date(data.getFullYear(), data.getMonth() + 1, 0)
      
      return {
        inicio: inicio.toISOString().split('T')[0],
        fim: fim.toISOString().split('T')[0]
      }
    }
  }

  const navegarPeriodo = (direcao) => {
    const novaData = new Date(dataAtual)
    if (visualizacao === 'semanal') {
      novaData.setDate(novaData.getDate() + (direcao * 7))
    } else {
      novaData.setMonth(novaData.getMonth() + direcao)
    }
    setDataAtual(novaData)
  }

  const getDiasSemana = () => {
    const { inicio } = calcularRangeDatas()
    const inicioDate = new Date(inicio + 'T00:00:00')
    const dias = []
    
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioDate)
      dia.setDate(inicioDate.getDate() + i)
      dias.push(dia)
    }
    
    return dias
  }

  const getDiasMes = () => {
    const ano = dataAtual.getFullYear()
    const mes = dataAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    
    const dias = []
    
    // Adicionar dias do mês anterior para completar a semana
    const diaSemanaInicio = primeiroDia.getDay() || 7
    for (let i = diaSemanaInicio - 1; i > 0; i--) {
      const dia = new Date(ano, mes, 1 - i)
      dias.push({ data: dia, outroMes: true })
    }
    
    // Dias do mês atual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      dias.push({ data: new Date(ano, mes, i), outroMes: false })
    }
    
    // Completar última semana
    const diasRestantes = 7 - (dias.length % 7)
    if (diasRestantes < 7) {
      for (let i = 1; i <= diasRestantes; i++) {
        dias.push({ data: new Date(ano, mes + 1, i), outroMes: true })
      }
    }
    
    return dias
  }

  const getEntregasDoDia = (data) => {
    const dataStr = data.toISOString().split('T')[0]
    return entregas.filter(e => e.data_entrega === dataStr)
  }

  const isHoje = (data) => {
    const hoje = new Date()
    return data.toDateString() === hoje.toDateString()
  }

  const formatarPeriodo = () => {
    if (visualizacao === 'semanal') {
      const dias = getDiasSemana()
      const inicio = dias[0]
      const fim = dias[6]
      
      const formatarData = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
      return `${formatarData(inicio)} - ${formatarData(fim)} ${fim.getFullYear()}`
    } else {
      return dataAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }
  }

  const getTipoColor = (tipo) => {
    switch (tipo) {
      case 'Piso': return { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800' }
      case 'Argamassa': return { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-800' }
      default: return { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800' }
    }
  }

  const getFreteLabel = (modalidade) => {
    switch (modalidade?.toUpperCase()) {
      case 'CIF': return 'CIF com descarga'
      case 'CIF_SEM_DESCARGA': return 'CIF sem descarga'
      case 'FOB': return 'FOB'
      default: return modalidade || 'Não informado'
    }
  }

  const formatarProdutos = (entrega) => {
    const itens = entrega.orcamentos_itens || []
    const tipo = entrega.tipo
    
    if (tipo === 'Argamassa') {
      // Só mostrar classe e quantidade
      return itens.slice(0, 4).map(item => ({
        descricao: item.classe || 'Argamassa',
        quantidade: `${item.quantidade} ${item.unidade || 'sacos'}`
      }))
    } else {
      // Bloco e Piso: produto + classe + mpa
      return itens.slice(0, 4).map(item => ({
        descricao: `${item.produto || ''} ${item.classe || ''} ${item.mpa || ''}`.trim(),
        quantidade: `${item.quantidade} ${item.unidade || 'pç'}`
      }))
    }
  }

  const resumoSemana = () => {
    const total = entregas.length
    const blocos = entregas.filter(e => e.tipo === 'Bloco').length
    const pisos = entregas.filter(e => e.tipo === 'Piso').length
    const argamassas = entregas.filter(e => e.tipo === 'Argamassa').length
    return { total, blocos, pisos, argamassas }
  }

  const nomeDiaSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Título */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário de Entregas</h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Filtro Vendedor */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
              <select
                value={filtroVendedor}
                onChange={(e) => setFiltroVendedor(e.target.value)}
                disabled={isVendedor()}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 ${
                  isVendedor() ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
              >
                {isVendedor() ? (
                  <option value={user?.id}>{user?.nome}</option>
                ) : (
                  <>
                    <option value="todos">Todos os vendedores</option>
                    {vendedores.map(v => (
                      <option key={v.id} value={v.id}>{v.nome}</option>
                    ))}
                  </>
                )}
              </select>
            </div>

            {/* Filtro Tipo */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Produto</label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              >
                <option value="todos">Todos</option>
                <option value="Bloco">🧱 Bloco</option>
                <option value="Piso">🟫 Piso</option>
                <option value="Argamassa">🪣 Argamassa</option>
              </select>
            </div>

            {/* Visualização */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Visualização</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setVisualizacao('semanal')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    visualizacao === 'semanal'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Semanal
                </button>
                <button
                  onClick={() => setVisualizacao('mensal')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    visualizacao === 'mensal'
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Mensal
                </button>
              </div>
            </div>

            {/* Navegação */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navegarPeriodo(-1)}
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="font-semibold text-gray-700 min-w-[180px] text-center capitalize">
                {formatarPeriodo()}
              </span>
              <button
                onClick={() => navegarPeriodo(1)}
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendário */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 mt-2">Carregando entregas...</p>
          </div>
        ) : visualizacao === 'semanal' ? (
          /* CALENDÁRIO SEMANAL */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header dias */}
            <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
              {getDiasSemana().map((dia, index) => (
                <div
                  key={index}
                  className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
                    isHoje(dia) ? 'bg-amber-100' : ''
                  }`}
                >
                  <p className={`text-xs ${isHoje(dia) ? 'text-amber-600' : 'text-gray-500'}`}>
                    {nomeDiaSemana[dia.getDay()]}
                  </p>
                  <p className={`text-lg font-bold ${isHoje(dia) ? 'text-amber-600' : 'text-gray-900'}`}>
                    {dia.getDate()}
                  </p>
                  {isHoje(dia) && <p className="text-xs text-amber-600">HOJE</p>}
                </div>
              ))}
            </div>

            {/* Conteúdo dias */}
            <div className="grid grid-cols-7 min-h-[400px]">
              {getDiasSemana().map((dia, index) => {
                const entregasDia = getEntregasDoDia(dia)
                return (
                  <div
                    key={index}
                    className={`border-r border-gray-200 last:border-r-0 p-2 space-y-2 ${
                      isHoje(dia) ? 'bg-amber-50' : ''
                    } ${dia.getDay() === 0 || dia.getDay() === 6 ? 'bg-gray-50' : ''}`}
                  >
                    {entregasDia.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm mt-8">Sem entregas</p>
                    ) : (
                      entregasDia.map(entrega => {
                        const cores = getTipoColor(entrega.tipo)
                        return (
                          <div
                            key={entrega.id}
                            onClick={() => setEntregaSelecionada(entrega)}
                            className={`${cores.bg} border-l-4 ${cores.border} rounded p-2 text-xs cursor-pointer hover:shadow-md transition-shadow`}
                          >
                            <p className={`font-bold ${cores.text}`}>{entrega.numero_proposta}</p>
                            <p className={cores.text}>{entrega.cliente_nome}</p>
                            <span className={`inline-block mt-1 px-1.5 py-0.5 ${cores.bg} ${cores.text} rounded text-[10px]`}>
                              {entrega.tipo}
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* CALENDÁRIO MENSAL */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header dias da semana */}
            <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
              {['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'].map((dia, index) => (
                <div key={index} className="p-2 text-center text-xs font-medium text-gray-500 border-r border-gray-200 last:border-r-0">
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7">
              {getDiasMes().map(({ data, outroMes }, index) => {
                const entregasDia = getEntregasDoDia(data)
                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-1 border-r border-b border-gray-200 ${
                      outroMes ? 'bg-gray-50' : ''
                    } ${isHoje(data) ? 'bg-amber-50' : ''}`}
                  >
                    <p className={`text-xs font-medium mb-1 ${
                      outroMes ? 'text-gray-400' : isHoje(data) ? 'text-amber-600' : 'text-gray-700'
                    }`}>
                      {data.getDate()}
                    </p>
                    <div className="space-y-1">
                      {entregasDia.slice(0, 3).map(entrega => {
                        const cores = getTipoColor(entrega.tipo)
                        return (
                          <div
                            key={entrega.id}
                            onClick={() => setEntregaSelecionada(entrega)}
                            className={`${cores.bg} rounded px-1 py-0.5 text-[10px] ${cores.text} truncate cursor-pointer hover:shadow`}
                          >
                            {entrega.numero_proposta}
                          </div>
                        )
                      })}
                      {entregasDia.length > 3 && (
                        <p className="text-[10px] text-gray-500">+{entregasDia.length - 3} mais</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Legenda */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-500 rounded"></span>
            <span className="text-gray-600">Bloco</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-purple-500 rounded"></span>
            <span className="text-gray-600">Piso</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-orange-500 rounded"></span>
            <span className="text-gray-600">Argamassa</span>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-gray-500">Clique em uma entrega para ver detalhes</span>
          </div>
        </div>

        {/* Resumo */}
        {visualizacao === 'semanal' && (
          <div className="mt-6 grid grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">{resumoSemana().total}</p>
              <p className="text-sm text-gray-500">Entregas na semana</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{resumoSemana().blocos}</p>
              <p className="text-sm text-gray-500">Blocos</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">{resumoSemana().pisos}</p>
              <p className="text-sm text-gray-500">Pisos</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">{resumoSemana().argamassas}</p>
              <p className="text-sm text-gray-500">Argamassas</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {entregaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${getTipoColor(entregaSelecionada.tipo).border.replace('border', 'bg')}`}></span>
                Detalhes da Entrega
              </h3>
              <button
                onClick={() => setEntregaSelecionada(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Proposta:</span>
                <span className={`font-semibold ${getTipoColor(entregaSelecionada.tipo).text}`}>
                  {entregaSelecionada.numero_proposta}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-semibold">{entregaSelecionada.cliente_nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vendedor:</span>
                <span className="font-semibold">{entregaSelecionada.vendedor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data Entrega:</span>
                <span className="font-semibold">
                  {new Date(entregaSelecionada.data_entrega + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Frete:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  entregaSelecionada.frete_modalidade === 'FOB'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {getFreteLabel(entregaSelecionada.frete_modalidade)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Local:</span>
                <span className="font-semibold">
                  {entregaSelecionada.obra_cidade || entregaSelecionada.frete_cidade || 'Não informado'}
                  {entregaSelecionada.obra_bairro && ` - ${entregaSelecionada.obra_bairro}`}
                </span>
              </div>

              <hr className="my-2" />

              {/* Produtos */}
              <div>
                <p className="text-gray-500 mb-2">Produtos:</p>
                <div className="space-y-1 bg-gray-50 rounded-lg p-3">
                  {formatarProdutos(entregaSelecionada).map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-700">{item.descricao}</span>
                      <span className="font-semibold">{item.quantidade}</span>
                    </div>
                  ))}
                  {(entregaSelecionada.orcamentos_itens?.length || 0) > 4 && (
                    <div className="text-gray-400 text-xs">
                      +{entregaSelecionada.orcamentos_itens.length - 4} produto(s)...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  navigate(`/orcamentos/editar/${entregaSelecionada.id}`)
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2 ${
                  getTipoColor(entregaSelecionada.tipo).border.replace('border', 'bg')
                }`}
              >
                <Eye className="w-4 h-4" />
                Ver Orçamento
              </button>
              <button
                onClick={() => setEntregaSelecionada(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
