import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, TrendingUp, Package, DollarSign, Calendar, Download, AlertTriangle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('mes') // semana, mes, ano
  const [orcamentos, setOrcamentos] = useState([])
  const [produtos, setProdutos] = useState([])

  useEffect(() => {
    if (isAdmin()) {
      carregarDados()
    }
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const dataInicio = calcularDataInicio(periodo)

      // Carregar orçamentos
      const { data: orcamentosData, error: orcError } = await supabase
        .from('orcamentos')
        .select(`
          *,
          usuario:usuarios(nome),
          itens:orcamento_itens(*, produto:produtos(*))
        `)
        .gte('created_at', dataInicio)
        .order('created_at', { ascending: false })

      if (orcError) throw orcError

      // Carregar produtos
      const { data: produtosData, error: prodError } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)

      if (prodError) throw prodError

      setOrcamentos(orcamentosData || [])
      setProdutos(produtosData || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularDataInicio = (periodo) => {
    const hoje = new Date()
    let dataInicio = new Date()

    switch (periodo) {
      case 'semana':
        dataInicio.setDate(hoje.getDate() - 7)
        break
      case 'mes':
        dataInicio.setMonth(hoje.getMonth() - 1)
        break
      case 'ano':
        dataInicio.setFullYear(hoje.getFullYear() - 1)
        break
    }

    return dataInicio.toISOString()
  }

  if (!isAdmin()) {
    navigate('/admin')
    return null
  }

  // Calcular estatísticas
  const stats = {
    total: orcamentos.length,
    rascunho: orcamentos.filter(o => o.status === 'rascunho').length,
    enviado: orcamentos.filter(o => o.status === 'enviado').length,
    aprovado: orcamentos.filter(o => o.status === 'aprovado').length,
    lancado: orcamentos.filter(o => o.status === 'lancado').length,
    cancelado: orcamentos.filter(o => o.status === 'cancelado').length,
  }

  const valores = {
    total: orcamentos.reduce((sum, o) => sum + (parseFloat(o.valor_total) || 0), 0),
    lancado: orcamentos.filter(o => o.status === 'lancado').reduce((sum, o) => sum + (parseFloat(o.valor_total) || 0), 0),
    aprovado: orcamentos.filter(o => o.status === 'aprovado').reduce((sum, o) => sum + (parseFloat(o.valor_total) || 0), 0),
  }

  // Dados para gráfico de pizza - Status
  const dadosPizza = [
    { name: 'Rascunho', value: stats.rascunho, color: '#94a3b8' },
    { name: 'Enviado', value: stats.enviado, color: '#3b82f6' },
    { name: 'Aprovado', value: stats.aprovado, color: '#22c55e' },
    { name: 'Lançado', value: stats.lancado, color: '#8b5cf6' },
    { name: 'Cancelado', value: stats.cancelado, color: '#ef4444' },
  ].filter(d => d.value > 0)

  // Dados para gráfico de barras - Valores por Status
  const dadosBarras = [
    { status: 'Enviado', valor: orcamentos.filter(o => o.status === 'enviado').reduce((sum, o) => sum + parseFloat(o.valor_total || 0), 0) / 1000 },
    { status: 'Aprovado', valor: orcamentos.filter(o => o.status === 'aprovado').reduce((sum, o) => sum + parseFloat(o.valor_total || 0), 0) / 1000 },
    { status: 'Lançado', valor: orcamentos.filter(o => o.status === 'lancado').reduce((sum, o) => sum + parseFloat(o.valor_total || 0), 0) / 1000 },
  ]

  // Performance por vendedor
  const vendedores = {}
  orcamentos.forEach(orc => {
    const vendedor = orc.usuario?.nome || 'Sem vendedor'
    if (!vendedores[vendedor]) {
      vendedores[vendedor] = { nome: vendedor, total: 0, valor: 0, lancados: 0 }
    }
    vendedores[vendedor].total++
    vendedores[vendedor].valor += parseFloat(orc.valor_total || 0)
    if (orc.status === 'lancado') vendedores[vendedor].lancados++
  })
  const dadosVendedores = Object.values(vendedores).sort((a, b) => b.valor - a.valor).slice(0, 5)

  // Toneladas de Argamassa
  let toneladasArgamassa = 0
  orcamentos.forEach(orc => {
    if (orc.status === 'lancado' && orc.itens) {
      orc.itens.forEach(item => {
        if (item.produto?.produto?.toLowerCase().includes('argamassa')) {
          const pesoTotal = (item.quantidade || 0) * (item.produto?.peso_unitario || 0)
          toneladasArgamassa += pesoTotal / 1000 // converter kg para toneladas
        }
      })
    }
  })

  // Dados para evolução temporal (últimos 30 dias)
  const dadosLinha = []
  for (let i = 29; i >= 0; i--) {
    const data = new Date()
    data.setDate(data.getDate() - i)
    const dataStr = data.toISOString().split('T')[0]
    
    const orcsData = orcamentos.filter(o => {
      const orcData = new Date(o.created_at).toISOString().split('T')[0]
      return orcData === dataStr
    })

    dadosLinha.push({
      data: `${data.getDate()}/${data.getMonth() + 1}`,
      quantidade: orcsData.length,
      valor: orcsData.reduce((sum, o) => sum + parseFloat(o.valor_total || 0), 0) / 1000
    })
  }

  const periodosLabels = {
    semana: 'Última Semana',
    mes: 'Último Mês',
    ano: 'Último Ano'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Voltar"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Dashboard & Relatórios</h1>
                  <p className="text-sm text-gray-500">Análises e métricas do sistema</p>
                </div>
              </div>
            </div>

            {/* Filtro de Período */}
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-gray-500" />
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500"
              >
                <option value="semana">Última Semana</option>
                <option value="mes">Último Mês</option>
                <option value="ano">Último Ano</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Carregando dados...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* ✨ NOVO CARD - Concorrência Interna */}
            <div 
              onClick={() => navigate('/relatorios/orcamentos')}
              className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-orange-500 rounded-xl shadow-md">
                    <AlertTriangle className="text-white" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Concorrência Interna</h3>
                    <p className="text-gray-700 mt-1">
                      Análise de conflitos entre vendedores • Orçamentos sem CNPJ/CPF
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <button className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold shadow-md">
                    Ver Relatório →
                  </button>
                </div>
              </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orçamentos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {(valores.total / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Lançados</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.lancado}</p>
                    <p className="text-xs text-gray-500">
                      R$ {(valores.lancado / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Argamassa</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {toneladasArgamassa.toFixed(1)} ton
                    </p>
                    <p className="text-xs text-gray-500">Produtos lançados</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Package className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gráfico de Pizza - Status */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Orçamentos por Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico de Barras - Valores */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Valores por Status (R$ mil)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosBarras}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${value.toFixed(1)}k`} />
                    <Bar dataKey="valor" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Evolução Temporal */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Evolução - Últimos 30 Dias</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosLinha}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="quantidade" stroke="#3b82f6" name="Quantidade" />
                  <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#22c55e" name="Valor (R$ mil)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Vendedores */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Performance por Vendedor (Top 5)</h3>
              <div className="space-y-3">
                {dadosVendedores.map((vendedor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{vendedor.nome}</p>
                        <p className="text-sm text-gray-500">
                          {vendedor.total} orçamentos • {vendedor.lancados} lançados
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        R$ {(vendedor.valor / 1000).toFixed(1)}k
                      </p>
                      <p className="text-xs text-gray-500">
                        Taxa: {((vendedor.lancados / vendedor.total) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}