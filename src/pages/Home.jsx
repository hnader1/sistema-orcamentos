import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Package, DollarSign, Building2, Users, Database } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function Home() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    orcamentos: 0,
    produtos: 0,
    totalMes: 0
  })

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const carregarEstatisticas = async () => {
    try {
      // Contar orçamentos
      const { count: countOrcamentos } = await supabase
        .from('orcamentos')
        .select('*', { count: 'exact', head: true })
      
      // Contar produtos
      const { count: countProdutos } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true)
      
      // Calcular total do mês
      const mesAtual = new Date().getMonth() + 1
      const anoAtual = new Date().getFullYear()
      
      const { data: orcamentosMes } = await supabase
        .from('orcamentos')
        .select('total')
        .gte('data_orcamento', `${anoAtual}-${mesAtual.toString().padStart(2, '0')}-01`)
        .lt('data_orcamento', `${anoAtual}-${(mesAtual + 1).toString().padStart(2, '0')}-01`)
      
      const totalMes = orcamentosMes?.reduce((sum, orc) => sum + parseFloat(orc.total || 0), 0) || 0
      
      setStats({
        orcamentos: countOrcamentos || 0,
        produtos: countProdutos || 0,
        totalMes
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sistema de Gestão</h1>
                <p className="text-xs sm:text-sm text-gray-500">Controle total do seu negócio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bem-vindo!</h2>
          <p className="text-sm sm:text-base text-gray-600">Escolha um módulo para começar</p>
        </div>

        {/* Cards de Módulos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Sistema de Orçamentos */}
          <button
            onClick={() => navigate('/orcamentos')}
            className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-1 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="text-white" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Sistema de Orçamentos</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Crie, edite e gerencie orçamentos de forma rápida e profissional
              </p>
              <div className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs sm:text-sm font-medium">
                Acessar →
              </div>
            </div>
          </button>

          {/* Cadastro de Produtos */}
          <button
            onClick={() => navigate('/produtos')}
            className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border-2 border-transparent hover:border-green-500 transform hover:-translate-y-1 text-left"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Package className="text-white" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Cadastro de Produtos</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Gerencie o catálogo de produtos, preços e especificações técnicas
              </p>
              <div className="mt-4 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm font-medium">
                Acessar →
              </div>
            </div>
          </button>

          {/* Módulo Futuro 1 */}
          <button
            disabled
            className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-gray-200 opacity-60 cursor-not-allowed"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Módulo Futuro</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Em desenvolvimento
              </p>
              <div className="mt-4 px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-xs sm:text-sm font-medium">
                Em breve
              </div>
            </div>
          </button>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Orçamentos</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.orcamentos}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Produtos</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.produtos}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total do Mês</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  R$ {(stats.totalMes / 1000).toFixed(1)}k
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-purple-600" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
