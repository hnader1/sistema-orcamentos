import { useState, useEffect } from 'react'
import { Truck, Package, AlertCircle, CheckCircle, Search } from 'lucide-react'

export default function FreteSelector({ pesoTotal, totalPallets, onFreteChange, freteAtual }) {
  const [fretes, setFretes] = useState([])
  const [localidades, setLocalidades] = useState([])
  const [buscaCidade, setBuscaCidade] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  
  // Seleções
  const [modalidade, setModalidade] = useState(freteAtual?.modalidade || '')
  const [tipoVeiculo, setTipoVeiculo] = useState(freteAtual?.tipo_veiculo || '')
  const [cidadeSelecionada, setCidadeSelecionada] = useState(freteAtual?.localidade || '')
  
  // Frete manual
  const [freteManual, setFreteManual] = useState(false)
  const [valorManual, setValorManual] = useState('')
  
  const [calculoFrete, setCalculoFrete] = useState(null)

  // Capacidades dos veículos em KG
  const capacidadesVeiculo = {
    'Toco 8t': 8000,
    'Truck 14t': 14000,
    'Carreta 32t': 32000
  }

  useEffect(() => {
    carregarFretes()
  }, [])

  useEffect(() => {
    calcularFrete()
  }, [modalidade, tipoVeiculo, cidadeSelecionada, pesoTotal, freteManual, valorManual])

  const carregarFretes = async () => {
    try {
      const { supabase } = await import('../services/supabase')
      const { data, error } = await supabase
        .from('fretes')
        .select('*')
        .eq('ativo', true)
        .order('cidade')

      if (error) throw error
      
      setFretes(data || [])
      
      // Extrair localidades únicas
      const locsUnicas = [...new Set(data?.map(f => f.cidade) || [])]
      setLocalidades(locsUnicas.sort())
    } catch (error) {
      console.error('Erro ao carregar fretes:', error)
    }
  }

  // Filtrar cidades para autocomplete
  const cidadesFiltradas = localidades.filter(cidade =>
    cidade.toLowerCase().includes(buscaCidade.toLowerCase())
  ).slice(0, 10)

  const selecionarCidade = (cidade) => {
    setCidadeSelecionada(cidade)
    setBuscaCidade(cidade)
    setMostrarSugestoes(false)
  }

  const calcularFrete = () => {
    // Se FOB, frete = 0
    if (modalidade === 'FOB') {
      const resultado = {
        tipo_frete: 'FOB',
        tipo_caminhao: null,
        localidade: null,
        capacidade_kg: 0,
        peso_total_kg: pesoTotal || 0,
        viagens_necessarias: 0,
        viagens_completas: 0,
        ultima_viagem_percentual: 0,
        valor_unitario_viagem: 0,
        valor_total_frete: 0
      }
      setCalculoFrete(resultado)
      notificarFrete(resultado)
      return
    }

    // Se frete manual
    if (freteManual && valorManual) {
      const resultado = {
        tipo_frete: modalidade,
        tipo_caminhao: tipoVeiculo,
        localidade: cidadeSelecionada,
        capacidade_kg: capacidadesVeiculo[tipoVeiculo] || 0,
        peso_total_kg: pesoTotal || 0,
        viagens_necessarias: 1,
        viagens_completas: 1,
        ultima_viagem_percentual: 100,
        valor_unitario_viagem: parseFloat(valorManual) || 0,
        valor_total_frete: parseFloat(valorManual) || 0,
        manual: true
      }
      setCalculoFrete(resultado)
      notificarFrete(resultado)
      return
    }

    // Se CIF, precisa selecionar tudo
    if (!modalidade || !tipoVeiculo || !cidadeSelecionada) {
      setCalculoFrete(null)
      notificarFrete(null)
      return
    }

    // Buscar frete na tabela
    const modalidadeBusca = modalidade === 'CIF_COM_DESCARGA' 
      ? 'COM DESCARGA' 
      : 'SEM DESCARGA'
    
    const veiculoBusca = `${tipoVeiculo} - ${modalidadeBusca}`
    
    // Buscar frete verificando cidade, tipo_veiculo E modalidade
    const frete = fretes.find(f => 
      f.cidade === cidadeSelecionada && 
      f.tipo_veiculo === veiculoBusca &&
      f.modalidade === modalidade
    )

    console.log('Buscando frete:', { cidadeSelecionada, veiculoBusca, modalidade })
    console.log('Frete encontrado:', frete)

    if (!frete) {
      setCalculoFrete(null)
      notificarFrete(null)
      return
    }

    // Calcular número de viagens
    const pesoTotalKg = pesoTotal || 0
    const capacidadeKg = frete.capacidade_kg || capacidadesVeiculo[tipoVeiculo]
    
    let viagensNecessarias = 1
    let viagensCompletas = 0
    let ultimaViagemPercentual = 0

    if (pesoTotalKg > 0 && capacidadeKg > 0) {
      viagensNecessarias = Math.ceil(pesoTotalKg / capacidadeKg)
      viagensCompletas = Math.floor(pesoTotalKg / capacidadeKg)
      const pesoUltimaViagem = pesoTotalKg % capacidadeKg
      ultimaViagemPercentual = pesoUltimaViagem > 0 
        ? (pesoUltimaViagem / capacidadeKg) * 100 
        : 100
    }

    // Usar preco_fixo - valor fixo por viagem (do banco de dados)
    const valorUnitarioViagem = frete.preco_fixo || frete.preco_por_kg || 0
    const valorTotalFrete = valorUnitarioViagem * viagensNecessarias

    const resultado = {
      tipo_frete: modalidade,
      tipo_caminhao: tipoVeiculo,
      localidade: cidadeSelecionada,
      capacidade_kg: capacidadeKg,
      peso_total_kg: pesoTotalKg,
      viagens_necessarias: viagensNecessarias,
      viagens_completas: viagensCompletas,
      ultima_viagem_percentual: ultimaViagemPercentual,
      valor_unitario_viagem: valorUnitarioViagem,
      valor_total_frete: valorTotalFrete
    }

    setCalculoFrete(resultado)
    notificarFrete(resultado)
  }

  const notificarFrete = (dadosFrete) => {
    if (onFreteChange) {
      onFreteChange(dadosFrete)
    }
  }

  const resetarSelecoes = () => {
    setTipoVeiculo('')
    setCidadeSelecionada('')
    setBuscaCidade('')
    setFreteManual(false)
    setValorManual('')
  }

  // Tipos de veículos disponíveis
  const tiposVeiculo = [
    { valor: 'Toco 8t', nome: 'Toco', capacidade: '8 ton', icon: '🚚' },
    { valor: 'Truck 14t', nome: 'Truck', capacidade: '14 ton', icon: '🚛' },
    { valor: 'Carreta 32t', nome: 'Carreta', capacidade: '32 ton', icon: '🚛' }
  ]

  // Verificar se é um pedido grande
  const isPedidoGrande = (pesoTotal || 0) >= 8000

  return (
    <div className="space-y-4">
      {/* ANÁLISE DE CARGA - Cards */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="text-purple-600" size={20} />
          <h3 className="font-semibold text-purple-900">Análise de Carga</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Peso Total do Pedido */}
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <span className="text-xs text-purple-600 block mb-1">Peso Total do Pedido</span>
            <p className="text-xl font-bold text-gray-900">
              {((pesoTotal || 0) / 1000).toFixed(2)} ton
            </p>
          </div>

          {/* Total de Pallets */}
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <span className="text-xs text-purple-600 block mb-1">Total de Pallets</span>
            <p className="text-xl font-bold text-purple-600">
              {(totalPallets || 0).toFixed(2)}
            </p>
          </div>

          {/* Capacidade do Veículo */}
          {tipoVeiculo && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <span className="text-xs text-purple-600 block mb-1">Capacidade do Veículo</span>
              <p className="text-xl font-bold text-gray-900">
                {(capacidadesVeiculo[tipoVeiculo] / 1000).toFixed(0)} ton
              </p>
              <span className="text-xs text-gray-500">{tipoVeiculo.toUpperCase()}</span>
            </div>
          )}

          {/* Viagens Necessárias */}
          {calculoFrete && calculoFrete.viagens_necessarias > 0 && (
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <span className="text-xs text-orange-600 block mb-1">Viagens Necessárias</span>
              <p className="text-xl font-bold text-orange-600">
                {calculoFrete.viagens_necessarias} viagens
              </p>
              {calculoFrete.viagens_completas > 0 && (
                <span className="text-xs text-gray-500">
                  {calculoFrete.viagens_completas} x 100%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Barras de Viagens */}
        {calculoFrete && calculoFrete.viagens_necessarias > 0 && modalidade !== 'FOB' && (
          <div className="mt-4 space-y-2">
            {/* Viagens Completas */}
            {calculoFrete.viagens_completas > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Viagens Completas:</span>
                  <span>{calculoFrete.viagens_completas} x 100%</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(Math.min(calculoFrete.viagens_completas, 10))].map((_, i) => (
                    <div key={i} className="flex-1 h-3 bg-green-500 rounded" />
                  ))}
                </div>
                {calculoFrete.viagens_completas > 10 && (
                  <span className="text-xs text-gray-500">+ {calculoFrete.viagens_completas - 10} viagens completas</span>
                )}
              </div>
            )}

            {/* Última Viagem (parcial) */}
            {calculoFrete.ultima_viagem_percentual > 0 && calculoFrete.ultima_viagem_percentual < 100 && (
              <div>
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Última Viagem (parcial):</span>
                  <span>{calculoFrete.ultima_viagem_percentual.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
                  <div 
                    className={`h-full rounded ${calculoFrete.ultima_viagem_percentual < 50 ? 'bg-red-500' : 'bg-orange-400'}`}
                    style={{ width: `${calculoFrete.ultima_viagem_percentual}%` }}
                  />
                </div>
                {calculoFrete.ultima_viagem_percentual < 50 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-red-600 text-xs">✗</span>
                    <span className="text-xs text-red-600">Muito baixa</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Indicador de Pedido Grande */}
        {isPedidoGrande && (
          <div className="mt-3 flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-lg">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Pedido grande - Excelente venda!</span>
          </div>
        )}
      </div>

      {/* INFORMAÇÕES DE FRETE */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900">Informações de Frete</h3>
        </div>

        {/* Modalidade de Frete - DROPDOWN */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modalidade de Frete
          </label>
          <select
            value={modalidade}
            onChange={(e) => {
              setModalidade(e.target.value)
              if (e.target.value === 'FOB') {
                resetarSelecoes()
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Selecione a modalidade</option>
            <option value="FOB">FOB (Cliente Retira - Sem Frete)</option>
            <option value="CIF_SEM_DESCARGA">CIF - Sem Descarga</option>
            <option value="CIF_COM_DESCARGA">CIF - Com Descarga</option>
          </select>
        </div>

        {/* Mensagem FOB */}
        {modalidade === 'FOB' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-green-900">FOB - Free on Board</p>
                <p className="text-sm text-green-700 mt-1">
                  Cliente retira na fábrica. Não há cobrança de frete.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tipo de Veículo - DROPDOWN (só se CIF) */}
        {(modalidade === 'CIF_SEM_DESCARGA' || modalidade === 'CIF_COM_DESCARGA') && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Veículo
              </label>
              <select
                value={tipoVeiculo}
                onChange={(e) => setTipoVeiculo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Selecione o veículo</option>
                {tiposVeiculo.map(v => (
                  <option key={v.valor} value={v.valor}>
                    {v.icon} {v.nome} ({v.capacidade})
                  </option>
                ))}
              </select>
            </div>

            {/* Destino - Campo de Busca com Autocomplete */}
            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-1">
                  <Search size={14} />
                  Destino (Cidade/Bairro)
                </span>
              </label>
              <input
                type="text"
                value={buscaCidade}
                onChange={(e) => {
                  setBuscaCidade(e.target.value)
                  setCidadeSelecionada('')
                  setMostrarSugestoes(true)
                }}
                onFocus={() => setMostrarSugestoes(true)}
                placeholder="Ex: Betim, BH Centro, Contagem..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              
              {/* Sugestões de Cidades */}
              {mostrarSugestoes && buscaCidade && cidadesFiltradas.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {cidadesFiltradas.map(cidade => (
                    <button
                      key={cidade}
                      onClick={() => selecionarCidade(cidade)}
                      className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50"
                    >
                      {cidade}
                    </button>
                  ))}
                </div>
              )}

              {/* Cidade Encontrada */}
              {cidadeSelecionada && (
                <div className="mt-2 flex items-center gap-2 text-green-700 bg-green-50 p-2 rounded-lg">
                  <CheckCircle size={16} />
                  <span className="text-sm">Localidade encontrada: {cidadeSelecionada}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Cálculo do Frete */}
        {calculoFrete && modalidade !== 'FOB' && cidadeSelecionada && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor por Viagem:</span>
                <span className="font-semibold">
                  R$ {calculoFrete.valor_unitario_viagem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Qtd de Viagens:</span>
                <span className="font-semibold">{calculoFrete.viagens_necessarias}x</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-blue-900">Valor Total de Frete:</span>
                  <span className="text-xl font-bold text-blue-600">
                    R$ {calculoFrete.valor_total_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600 text-xs">
                <CheckCircle size={14} />
                <span>Frete calculado automat
