// src/components/FreteSelector.jsx
// ====================================================================================
// COMPONENTE DE SELEÇÃO DE FRETE - DADOS DO SUPABASE
// ====================================================================================
// CORREÇÃO: Todos os dados (modalidades, veículos, pallets) vêm da tabela fretes
// Pallets não aparecem no dropdown pois variam por cidade + modalidade
// ====================================================================================

import { useState, useEffect } from 'react'
import { Truck, Package, AlertCircle, CheckCircle, Search } from 'lucide-react'

export default function FreteSelector({ pesoTotal, totalPallets, onFreteChange, freteAtual }) {
  const [fretes, setFretes] = useState([])
  const [localidades, setLocalidades] = useState([])
  const [buscaCidade, setBuscaCidade] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  
  // ✅ Dados extraídos do banco
  const [tiposVeiculoUnicos, setTiposVeiculoUnicos] = useState([])
  const [modalidadesUnicas, setModalidadesUnicas] = useState([])
  
  // Seleções
  const [modalidade, setModalidade] = useState('')
  const [tipoVeiculo, setTipoVeiculo] = useState('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState('')
  
  // Frete manual - com valor por viagem e quantidade de viagens
  const [freteManual, setFreteManual] = useState(false)
  const [valorManualViagem, setValorManualViagem] = useState('')
  const [qtdManualViagens, setQtdManualViagens] = useState(1)
  
  const [calculoFrete, setCalculoFrete] = useState(null)

  // ✅ CORREÇÃO: Inicialização com dados do freteAtual (ao reabrir orçamento)
  useEffect(() => {
    if (freteAtual) {
      console.log('🚚 [FreteSelector] Inicializando com freteAtual:', freteAtual)
      
      // Preencher modalidade
      const mod = freteAtual.modalidade || freteAtual.tipo_frete || ''
      setModalidade(mod)
      
      // Preencher tipo de veículo
      const veiculo = freteAtual.tipo_veiculo || freteAtual.tipo_caminhao || ''
      setTipoVeiculo(veiculo)
      
      // Preencher cidade
      const cidade = freteAtual.localidade || freteAtual.cidade || ''
      setCidadeSelecionada(cidade)
      setBuscaCidade(cidade)
      
      // ✅ CORREÇÃO: Verificar se é frete manual
      if (freteAtual.frete_manual || freteAtual.manual) {
        setFreteManual(true)
        setValorManualViagem(freteAtual.valor_manual_viagem || freteAtual.valor_unitario_viagem || '')
        setQtdManualViagens(freteAtual.qtd_manual_viagens || freteAtual.viagens_necessarias || 1)
      }
    }
  }, [freteAtual])

  useEffect(() => {
    carregarFretes()
  }, [])

  useEffect(() => {
    calcularFrete()
  }, [modalidade, tipoVeiculo, cidadeSelecionada, pesoTotal, totalPallets, freteManual, valorManualViagem, qtdManualViagens, fretes])

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
      
      // ✅ Extrair localidades únicas
      const locsUnicas = [...new Set(data?.map(f => f.cidade) || [])]
      setLocalidades(locsUnicas.sort())
      
      // ✅ Extrair tipos de veículos únicos (apenas peso, SEM pallets pois varia por cidade/modalidade)
      const veiculosMap = new Map()
      data?.forEach(f => {
        // Extrair tipo base do tipo_veiculo (ex: "Truck 14t - SEM DESCARGA" → "Truck 14t")
        const tipoBase = f.tipo_veiculo?.split(' - ')[0] || f.tipo_veiculo
        if (tipoBase && !veiculosMap.has(tipoBase)) {
          veiculosMap.set(tipoBase, {
            valor: tipoBase,
            capacidade_kg: f.capacidade_kg || 0
            // NÃO inclui pallets aqui pois varia por cidade/modalidade
          })
        }
      })
      
      // Converter para array e ordenar por capacidade
      const veiculosArray = Array.from(veiculosMap.values()).sort((a, b) => a.capacidade_kg - b.capacidade_kg)
      setTiposVeiculoUnicos(veiculosArray)
      console.log('🚛 Tipos de veículos extraídos:', veiculosArray)
      
      // ✅ Extrair modalidades únicas
      const modalidadesSet = new Set()
      data?.forEach(f => {
        if (f.modalidade) {
          modalidadesSet.add(f.modalidade)
        }
      })
      
      // Converter para array com labels amigáveis
      const modalidadesArray = Array.from(modalidadesSet).map(mod => ({
        valor: mod,
        label: formatarModalidade(mod)
      }))
      
      // Adicionar FOB manualmente (não está na tabela fretes)
      modalidadesArray.unshift({ valor: 'FOB', label: 'FOB - Cliente retira' })
      
      setModalidadesUnicas(modalidadesArray)
      console.log('📋 Modalidades extraídas:', modalidadesArray)
      
    } catch (error) {
      console.error('Erro ao carregar fretes:', error)
    }
  }

  // ✅ Formatar nome da modalidade para exibição
  const formatarModalidade = (mod) => {
    switch(mod) {
      case 'CIF':
      case 'CIF_SEM_DESCARGA':
        return 'CIF - Sem Descarga'
      case 'CIF_COM_DESCARGA':
        return 'CIF - Com Descarga'
      default:
        return mod
    }
  }

  // ✅ Buscar dados do frete específico (cidade + veículo + modalidade)
  const buscarFreteEspecifico = (cidade, tipoVeic, mod) => {
    if (!cidade || !tipoVeic || !mod || mod === 'FOB') return null
    
    const modalidadeBusca = mod === 'CIF_COM_DESCARGA' ? 'COM DESCARGA' : 'SEM DESCARGA'
    const veiculoBusca = `${tipoVeic} - ${modalidadeBusca}`
    
    const frete = fretes.find(f => 
      f.cidade === cidade && 
      f.tipo_veiculo === veiculoBusca &&
      f.modalidade === mod
    )
    
    return frete
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
        modalidade: 'FOB',
        tipo_frete: 'FOB',
        tipo_veiculo: null,
        tipo_caminhao: null,
        localidade: null,
        cidade: null,
        capacidade_kg: 0,
        capacidade_pallets: 0,
        peso_total_kg: pesoTotal || 0,
        viagens_necessarias: 0,
        viagens_completas: 0,
        ultima_viagem_percentual: 0,
        valor_unitario_viagem: 0,
        valor_total_frete: 0,
        frete_manual: false
      }
      setCalculoFrete(resultado)
      notificarFrete(resultado)
      return
    }

    // ✅ Se está usando frete manual
    if (freteManual && valorManualViagem) {
      const valorViagem = parseFloat(valorManualViagem) || 0
      const qtdViagens = parseInt(qtdManualViagens) || 1
      const valorTotal = valorViagem * qtdViagens
      
      // Buscar frete específico para pegar capacidades
      const freteEspecifico = buscarFreteEspecifico(cidadeSelecionada, tipoVeiculo, modalidade)

      const resultado = {
        modalidade: modalidade,
        tipo_frete: modalidade,
        tipo_veiculo: tipoVeiculo,
        tipo_caminhao: tipoVeiculo,
        localidade: cidadeSelecionada,
        cidade: cidadeSelecionada,
        capacidade_kg: freteEspecifico?.capacidade_kg || tiposVeiculoUnicos.find(v => v.valor === tipoVeiculo)?.capacidade_kg || 0,
        capacidade_pallets: freteEspecifico?.capacidade_pallets || 0,
        peso_total_kg: pesoTotal || 0,
        viagens_necessarias: qtdViagens,
        viagens_completas: qtdViagens,
        ultima_viagem_percentual: 100,
        valor_unitario_viagem: valorViagem,
        valor_total_frete: valorTotal,
        // ✅ Campos específicos de frete manual
        frete_manual: true,
        manual: true,
        valor_manual_viagem: valorViagem,
        qtd_manual_viagens: qtdViagens
      }

      console.log('🚚 [FreteSelector] Frete MANUAL calculado:', resultado)
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
    const frete = buscarFreteEspecifico(cidadeSelecionada, tipoVeiculo, modalidade)

    console.log('Buscando frete:', { cidadeSelecionada, tipoVeiculo, modalidade })
    console.log('Frete encontrado:', frete)

    if (!frete) {
      setCalculoFrete(null)
      notificarFrete(null)
      return
    }

    // ✅ Usar capacidade_kg e capacidade_pallets do registro encontrado
    const pesoTotalKg = pesoTotal || 0
    const capacidadeKg = frete.capacidade_kg || 0
    const capacidadePallets = frete.capacidade_pallets || 0
    
    // ✅ Calcular viagens por PESO
    let viagensPorPeso = 1
    if (pesoTotalKg > 0 && capacidadeKg > 0) {
      viagensPorPeso = Math.ceil(pesoTotalKg / capacidadeKg)
    }
    
    // ✅ Calcular viagens por PALLETS
    let viagensPorPallets = 1
    const palletsTotal = totalPallets || 0
    if (palletsTotal > 0 && capacidadePallets > 0) {
      viagensPorPallets = Math.ceil(palletsTotal / capacidadePallets)
    }
    
    // ✅ Usar o MAIOR limitante
    const viagensNecessarias = Math.max(viagensPorPeso, viagensPorPallets, 1)
    const limitante = viagensPorPallets > viagensPorPeso ? 'pallets' : 'peso'
    
    console.log('📊 Cálculo de viagens:', {
      viagensPorPeso,
      viagensPorPallets,
      viagensNecessarias,
      limitante,
      capacidadePallets
    })

    // Usar preco_fixo - valor fixo por viagem (do banco de dados)
    const valorUnitarioViagem = frete.preco_fixo || frete.preco_por_kg || 0
    const valorTotalFrete = valorUnitarioViagem * viagensNecessarias

    const resultado = {
      modalidade: modalidade,
      tipo_frete: modalidade,
      tipo_veiculo: tipoVeiculo,
      tipo_caminhao: tipoVeiculo,
      localidade: cidadeSelecionada,
      cidade: cidadeSelecionada,
      capacidade_kg: capacidadeKg,
      capacidade_pallets: capacidadePallets,
      peso_total_kg: pesoTotalKg,
      total_pallets: palletsTotal,
      viagens_necessarias: viagensNecessarias,
      viagens_por_peso: viagensPorPeso,
      viagens_por_pallets: viagensPorPallets,
      limitante: limitante,
      viagens_completas: viagensNecessarias,
      ultima_viagem_percentual: 100,
      valor_unitario_viagem: valorUnitarioViagem,
      valor_total_frete: valorTotalFrete,
      frete_manual: false
    }

    console.log('🚚 [FreteSelector] Frete AUTOMÁTICO calculado:', resultado)
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
    setValorManualViagem('')
    setQtdManualViagens(1)
  }

  // Verificar se é um pedido grande
  const isPedidoGrande = (pesoTotal || 0) >= 8000

  const formatarMoeda = (valor) => {
    return `R$ ${(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
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

          {/* Capacidade do Veículo - MOSTRA PALLETS CORRETOS APÓS SELECIONAR TUDO */}
          {tipoVeiculo && calculoFrete && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <span className="text-xs text-purple-600 block mb-1">Capacidade do Veículo</span>
              <p className="text-lg font-bold text-gray-900">
                {((calculoFrete.capacidade_kg || 0) / 1000).toFixed(0)} ton
              </p>
              <span className="text-xs text-purple-700 font-semibold">
                📦 {calculoFrete.capacidade_pallets || 0} pallets
              </span>
            </div>
          )}

          {/* Viagens Necessárias */}
          {calculoFrete && calculoFrete.viagens_necessarias > 0 && (
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <span className="text-xs text-orange-600 block mb-1">Viagens Necessárias</span>
              <p className="text-xl font-bold text-orange-600">
                {calculoFrete.viagens_necessarias} viagens
              </p>
              {calculoFrete.limitante && (
                <span className="text-xs text-gray-500">
                  Limitante: {calculoFrete.limitante === 'pallets' ? '📦 pallets' : '⚖️ peso'}
                </span>
              )}
            </div>
          )}
        </div>

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
          <Truck className="text-teal-600" size={20} />
          <h3 className="font-semibold text-gray-900">Frete</h3>
        </div>

        {/* ✅ LAYOUT LADO A LADO: Modalidade, Tipo Veículo, Destino */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Modalidade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalidade
            </label>
            <select
              value={modalidade}
              onChange={(e) => {
                setModalidade(e.target.value)
                if (e.target.value === 'FOB') {
                  resetarSelecoes()
                  setModalidade('FOB')
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Selecione...</option>
              {modalidadesUnicas.map(m => (
                <option key={m.valor} value={m.valor}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Veículo - SEM PALLETS (pois varia por cidade/modalidade) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Veículo
            </label>
            <select
              value={tipoVeiculo}
              onChange={(e) => setTipoVeiculo(e.target.value)}
              disabled={!modalidade || modalidade === 'FOB'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Selecione...</option>
              {tiposVeiculoUnicos.map(v => (
                <option key={v.valor} value={v.valor}>
                  🚚 {v.valor} ({(v.capacidade_kg / 1000).toFixed(0)} ton)
                </option>
              ))}
            </select>
          </div>

          {/* Destino - Busca de Cidade */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Search size={14} className="inline mr-1" />
              Destino (Cidade/Bairro)
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
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
              disabled={!modalidade || modalidade === 'FOB'}
              placeholder="Ex: Betim, BH Centro, Contagem..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            
            {/* Dropdown de sugestões */}
            {mostrarSugestoes && cidadesFiltradas.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {cidadesFiltradas.map((cidade, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selecionarCidade(cidade)}
                    className="w-full px-3 py-2 text-left hover:bg-teal-50 text-sm"
                  >
                    {cidade}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cidade encontrada */}
        {cidadeSelecionada && (
          <div className="mb-4 flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-lg">
            <CheckCircle size={16} />
            Localidade encontrada: <strong>{cidadeSelecionada}</strong>
          </div>
        )}

        {/* FOB selecionado */}
        {modalidade === 'FOB' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center mb-4">
            <p className="text-gray-600">
              <Package size={20} className="inline mr-2" />
              FOB - Cliente retira na fábrica. Sem frete.
            </p>
          </div>
        )}

        {/* Resultado do cálculo de frete automático */}
        {calculoFrete && modalidade !== 'FOB' && cidadeSelecionada && !freteManual && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Valor por Viagem:</span>
              <span className="font-semibold">{formatarMoeda(calculoFrete.valor_unitario_viagem)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Qtd de Viagens:</span>
              <span className="font-semibold">{calculoFrete.viagens_necessarias}x</span>
            </div>
            {/* ✅ Mostrar detalhes do cálculo */}
            {calculoFrete.limitante && (
              <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
                <span>Viagens por peso: {calculoFrete.viagens_por_peso} | Viagens por pallets: {calculoFrete.viagens_por_pallets}</span>
                <span className="font-medium text-orange-600">
                  Limitante: {calculoFrete.limitante === 'pallets' ? '📦 Pallets' : '⚖️ Peso'}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-green-200">
              <span className="font-semibold text-gray-700">Valor Total de Frete:</span>
              <span className="text-xl font-bold text-green-600">{formatarMoeda(calculoFrete.valor_total_frete)}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle size={14} />
              Frete calculado automaticamente
            </div>
          </div>
        )}

        {/* Checkbox para frete manual - só mostra se não for FOB */}
        {modalidade && modalidade !== 'FOB' && (
          <div className="border-t border-gray-200 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={freteManual}
                onChange={(e) => {
                  setFreteManual(e.target.checked)
                  if (!e.target.checked) {
                    // Limpar valores manuais ao desmarcar
                    setValorManualViagem('')
                    setQtdManualViagens(1)
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Definir valor de frete manualmente</span>
            </label>

            {/* ✅ LAYOUT LADO A LADO: Valor por Viagem e Quantidade de Viagens */}
            {freteManual && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Valor por Viagem */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor por Viagem (R$)
                    </label>
                    <input
                      type="number"
                      value={valorManualViagem}
                      onChange={(e) => setValorManualViagem(e.target.value)}
                      placeholder="Ex: 500.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    />
                  </div>

                  {/* Quantidade de Viagens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade de Viagens
                    </label>
                    <input
                      type="number"
                      value={qtdManualViagens}
                      onChange={(e) => setQtdManualViagens(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                      step="1"
                      className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    />
                  </div>
                </div>

                {/* Valor Total (calculado) */}
                {valorManualViagem && (
                  <div className="pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Valor por Viagem:</span>
                      <span className="font-semibold">{formatarMoeda(parseFloat(valorManualViagem) || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Qtd de Viagens:</span>
                      <span className="font-semibold">{qtdManualViagens}x</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                      <span className="font-semibold text-gray-700">Valor Total de Frete:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatarMoeda((parseFloat(valorManualViagem) || 0) * (parseInt(qtdManualViagens) || 1))}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-blue-600 text-sm">
                      <AlertCircle size={14} />
                      Frete definido manualmente
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Aviso se não tem peso e não é FOB */}
        {(!pesoTotal || pesoTotal === 0) && modalidade && modalidade !== 'FOB' && !freteManual && (
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
