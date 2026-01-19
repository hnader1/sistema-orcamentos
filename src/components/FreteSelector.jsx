// ====================================================================================
// COMPONENTE SELETOR DE FRETE - COM CÁLCULO POR PESO E PALLETS
// ====================================================================================
// Autor: Nader / Claude
// Última atualização: Janeiro 2026
// 
// FUNCIONALIDADES:
// - Calcula viagens pelo MAIOR LIMITANTE entre peso e pallets
// - Mostra qual é o fator limitante (peso ou pallets)
// - Exibe análise de carga completa
// - Suporta frete manual
//
// REGRA DE NEGÓCIO:
// viagens = MAX(ceil(pesoTotal / capacidadePeso), ceil(totalPallets / capacidadePallets))
//
// EXEMPLO:
// Pedido: 15 ton em 25 pallets | Truck 14t (14 ton, 10 pallets)
// Por peso: 15/14 = 2 viagens | Por pallets: 25/10 = 3 viagens
// Resultado: 3 viagens (limitado por pallets - não cabem fisicamente)
// ====================================================================================

import { useState, useEffect } from 'react'
import { Truck, Package, AlertCircle, CheckCircle, Search, AlertTriangle, Scale, Boxes } from 'lucide-react'

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

  // Capacidades dos veículos em KG (peso)
  const capacidadesVeiculo = {
    'Toco 8t': 8000,
    'Truck 14t': 14000,
    'Carreta 32t': 32000
  }

  // Capacidades de pallets padrão (caso não venha do banco)
  const capacidadesPalletsPadrao = {
    'Toco 8t': { 'CIF_SEM_DESCARGA': 6, 'CIF_COM_DESCARGA': 5 },
    'Truck 14t': { 'CIF_SEM_DESCARGA': 10, 'CIF_COM_DESCARGA': 9 },
    'Carreta 32t': { 'CIF_SEM_DESCARGA': 18, 'CIF_COM_DESCARGA': 18 }
  }

  useEffect(() => {
    carregarFretes()
  }, [])

  useEffect(() => {
    calcularFrete()
  }, [modalidade, tipoVeiculo, cidadeSelecionada, pesoTotal, totalPallets, freteManual, valorManual, fretes])

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
        modalidade: 'FOB',
        tipo_caminhao: null,
        tipo_veiculo: null,
        localidade: null,
        capacidade_kg: 0,
        capacidade_pallets: 0,
        peso_total_kg: pesoTotal || 0,
        total_pallets: totalPallets || 0,
        viagens_por_peso: 0,
        viagens_por_pallets: 0,
        viagens_necessarias: 0,
        fator_limitante: null,
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
        modalidade: modalidade,
        tipo_caminhao: tipoVeiculo,
        tipo_veiculo: tipoVeiculo,
        localidade: cidadeSelecionada,
        capacidade_kg: capacidadesVeiculo[tipoVeiculo] || 0,
        capacidade_pallets: 0,
        peso_total_kg: pesoTotal || 0,
        total_pallets: totalPallets || 0,
        viagens_por_peso: 1,
        viagens_por_pallets: 0,
        viagens_necessarias: 1,
        fator_limitante: 'manual',
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
    
    const frete = fretes.find(f => 
      f.cidade === cidadeSelecionada && 
      f.tipo_veiculo === veiculoBusca &&
      f.modalidade === modalidade
    )

    console.log('🔍 Buscando frete:', { cidadeSelecionada, veiculoBusca, modalidade })
    console.log('📦 Frete encontrado:', frete)

    if (!frete) {
      setCalculoFrete(null)
      notificarFrete(null)
      return
    }

    // ====================================================================================
    // ✨ CÁLCULO DE VIAGENS - MAIOR LIMITANTE ENTRE PESO E PALLETS
    // ====================================================================================
    
    const pesoTotalKg = pesoTotal || 0
    const totalPalletsCalc = totalPallets || 0
    
    // Capacidade de peso
    const capacidadeKg = frete.capacidade_kg || capacidadesVeiculo[tipoVeiculo]
    
    // Capacidade de pallets (do banco ou padrão)
    const capacidadePallets = frete.capacidade_pallets || 
      capacidadesPalletsPadrao[tipoVeiculo]?.[modalidade] || 10

    // Calcular viagens por PESO
    let viagensPorPeso = 1
    if (pesoTotalKg > 0 && capacidadeKg > 0) {
      viagensPorPeso = Math.ceil(pesoTotalKg / capacidadeKg)
    }

    // Calcular viagens por PALLETS
    let viagensPorPallets = 1
    if (totalPalletsCalc > 0 && capacidadePallets > 0) {
      viagensPorPallets = Math.ceil(totalPalletsCalc / capacidadePallets)
    }

    // ✅ REGRA: Viagens = MAIOR entre peso e pallets
    // O maior número é o que garante que TUDO seja transportado
    const viagensNecessarias = Math.max(viagensPorPeso, viagensPorPallets)

    // Identificar fator limitante
    let fatorLimitante = 'peso'
    if (viagensPorPallets > viagensPorPeso) {
      fatorLimitante = 'pallets'
    } else if (viagensPorPallets === viagensPorPeso && totalPalletsCalc > 0) {
      fatorLimitante = 'ambos'
    }

    console.log('📊 Cálculo de viagens:', {
      pesoTotalKg,
      totalPalletsCalc,
      capacidadeKg,
      capacidadePallets,
      viagensPorPeso,
      viagensPorPallets,
      viagensNecessarias,
      fatorLimitante
    })

    // Calcular valores
    const valorUnitarioViagem = frete.preco_fixo || frete.preco_por_kg || 0
    const valorTotalFrete = valorUnitarioViagem * viagensNecessarias

    // Calcular percentuais de ocupação na última viagem
    const pesoUltimaViagem = pesoTotalKg % capacidadeKg || capacidadeKg
    const palletsUltimaViagem = totalPalletsCalc % capacidadePallets || capacidadePallets
    const ocupacaoPesoPercent = (pesoUltimaViagem / capacidadeKg) * 100
    const ocupacaoPalletsPercent = capacidadePallets > 0 
      ? (palletsUltimaViagem / capacidadePallets) * 100 
      : 0

    const resultado = {
      tipo_frete: modalidade,
      modalidade: modalidade,
      tipo_caminhao: tipoVeiculo,
      tipo_veiculo: tipoVeiculo,
      localidade: cidadeSelecionada,
      capacidade_kg: capacidadeKg,
      capacidade_pallets: capacidadePallets,
      peso_total_kg: pesoTotalKg,
      total_pallets: totalPalletsCalc,
      viagens_por_peso: viagensPorPeso,
      viagens_por_pallets: viagensPorPallets,
      viagens_necessarias: viagensNecessarias,
      fator_limitante: fatorLimitante,
      ocupacao_peso_percent: ocupacaoPesoPercent,
      ocupacao_pallets_percent: ocupacaoPalletsPercent,
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

  // Obter cor do fator limitante
  const getCorFatorLimitante = () => {
    if (!calculoFrete || !calculoFrete.fator_limitante) return 'gray'
    if (calculoFrete.fator_limitante === 'pallets') return 'purple'
    if (calculoFrete.fator_limitante === 'peso') return 'blue'
    return 'green'
  }

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
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-1 mb-1">
              <Scale size={14} className="text-blue-500" />
              <span className="text-xs text-blue-600">Peso Total</span>
            </div>
            <p className="text-xl font-bold text-gray-900">
              {((pesoTotal || 0) / 1000).toFixed(2)} ton
            </p>
          </div>

          {/* Total de Pallets */}
          <div className="bg-white rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-1 mb-1">
              <Boxes size={14} className="text-purple-500" />
              <span className="text-xs text-purple-600">Total Pallets</span>
            </div>
            <p className="text-xl font-bold text-purple-600">
              {(totalPallets || 0).toFixed(1)}
            </p>
          </div>

          {/* Capacidade do Veículo */}
          {tipoVeiculo && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <span className="text-xs text-gray-500 block mb-1">Capacidade Veículo</span>
              <p className="text-lg font-bold text-gray-900">
                {(capacidadesVeiculo[tipoVeiculo] / 1000).toFixed(0)} ton
              </p>
              <span className="text-xs text-gray-500">
                {calculoFrete?.capacidade_pallets || '?'} pallets
              </span>
            </div>
          )}

          {/* Viagens Necessárias */}
          {calculoFrete && calculoFrete.viagens_necessarias > 0 && modalidade !== 'FOB' && (
            <div className={`bg-white rounded-lg p-3 border-2 ${
              calculoFrete.fator_limitante === 'pallets' 
                ? 'border-purple-300 bg-purple-50' 
                : 'border-orange-200'
            }`}>
              <span className="text-xs text-gray-600 block mb-1">Viagens Necessárias</span>
              <p className="text-2xl font-bold text-orange-600">
                {calculoFrete.viagens_necessarias}
              </p>
              {calculoFrete.fator_limitante && calculoFrete.fator_limitante !== 'manual' && (
                <span className={`text-xs font-medium ${
                  calculoFrete.fator_limitante === 'pallets' 
                    ? 'text-purple-600' 
                    : calculoFrete.fator_limitante === 'ambos'
                    ? 'text-green-600'
                    : 'text-blue-600'
                }`}>
                  Limitado por {calculoFrete.fator_limitante === 'pallets' ? '📦 pallets' : 
                               calculoFrete.fator_limitante === 'ambos' ? '⚖️ ambos' : '⚖️ peso'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ✨ NOVO: Comparativo Peso vs Pallets */}
        {calculoFrete && calculoFrete.viagens_necessarias > 0 && modalidade !== 'FOB' && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {/* Viagens por Peso */}
            <div className={`rounded-lg p-3 ${
              calculoFrete.fator_limitante === 'peso' || calculoFrete.fator_limitante === 'ambos'
                ? 'bg-blue-100 border-2 border-blue-300'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Por Peso</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {calculoFrete.viagens_por_peso} viagem(ns)
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(calculoFrete.ocupacao_peso_percent, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                Última viagem: {calculoFrete.ocupacao_peso_percent?.toFixed(0)}% da capacidade
              </span>
            </div>

            {/* Viagens por Pallets */}
            <div className={`rounded-lg p-3 ${
              calculoFrete.fator_limitante === 'pallets' || calculoFrete.fator_limitante === 'ambos'
                ? 'bg-purple-100 border-2 border-purple-300'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Por Pallets</span>
                </div>
                <span className="text-lg font-bold text-purple-600">
                  {calculoFrete.viagens_por_pallets} viagem(ns)
                </span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(calculoFrete.ocupacao_pallets_percent, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                Última viagem: {calculoFrete.ocupacao_pallets_percent?.toFixed(0)}% da capacidade
              </span>
            </div>
          </div>
        )}

        {/* Alerta quando pallets é o limitante */}
        {calculoFrete && calculoFrete.fator_limitante === 'pallets' && (
          <div className="mt-3 flex items-center gap-2 text-purple-700 bg-purple-100 p-3 rounded-lg border border-purple-200">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              ⚠️ Atenção: O caminhão aguenta o peso, mas NÃO CABEM todos os pallets! 
              Serão necessárias <strong>{calculoFrete.viagens_necessarias} viagens</strong> por causa do volume.
            </span>
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
                <span>Frete calculado automaticamente</span>
              </div>
            </div>
          </div>
        )}

        {/* Frete Manual */}
        {modalidade && modalidade !== 'FOB' && (
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={freteManual}
                onChange={(e) => setFreteManual(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Definir valor de frete manualmente</span>
            </label>

            {freteManual && (
              <div className="mt-3">
                <input
                  type="number"
                  value={valorManual}
                  onChange={(e) => setValorManual(e.target.value)}
                  placeholder="Digite o valor do frete"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Aviso se não tem peso e não é FOB */}
        {(!pesoTotal || pesoTotal === 0) && modalidade && modalidade !== 'FOB' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-sm text-yellow-700">
                Adicione produtos ao orçamento para calcular o número de viagens necessárias.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}