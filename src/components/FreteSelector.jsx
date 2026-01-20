// src/components/FreteSelector.jsx
import { useState, useEffect } from 'react'
import { Truck, Package, AlertCircle, CheckCircle, Search, Weight } from 'lucide-react'

export default function FreteSelector({ pesoTotal, totalPallets, onFreteChange, freteAtual }) {
  const [fretes, setFretes] = useState([])
  const [localidades, setLocalidades] = useState([])
  const [buscaCidade, setBuscaCidade] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  
  // Seleções
  const [modalidade, setModalidade] = useState('')
  const [tipoVeiculo, setTipoVeiculo] = useState('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState('')
  
  // Frete manual - com valor por viagem, quantidade de viagens e observação
  const [freteManual, setFreteManual] = useState(false)
  const [valorManualViagem, setValorManualViagem] = useState('')
  const [qtdManualViagens, setQtdManualViagens] = useState(1)
  const [observacaoFreteManual, setObservacaoFreteManual] = useState('')
  
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
        setObservacaoFreteManual(freteAtual.observacao_frete_manual || '')
      }
    }
  }, [freteAtual])

  useEffect(() => {
    carregarFretes()
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    calcularFrete()
  }, [modalidade, tipoVeiculo, cidadeSelecionada, pesoTotal, totalPallets, freteManual, valorManualViagem, qtdManualViagens, observacaoFreteManual, fretes])

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
        modalidade: 'FOB',
        tipo_frete: 'FOB',
        tipo_veiculo: null,
        tipo_caminhao: null,
        localidade: null,
        cidade: null,
        capacidade_kg: 0,
        peso_total_kg: pesoTotal || 0,
        viagens_necessarias: 0,
        viagens_completas: 0,
        ultima_viagem_percentual: 0,
        valor_unitario_viagem: 0,
        valor_total_frete: 0,
        frete_manual: false,
        observacao_frete_manual: null
      }
      setCalculoFrete(resultado)
      notificarFrete(resultado)
      return
    }

    // ✅ CORREÇÃO: Se está usando frete manual
    if (freteManual && valorManualViagem) {
      const valorViagem = parseFloat(valorManualViagem) || 0
      const qtdViagens = parseInt(qtdManualViagens) || 1
      const valorTotal = valorViagem * qtdViagens

      const resultado = {
        modalidade: modalidade,
        tipo_frete: modalidade,
        tipo_veiculo: tipoVeiculo,
        tipo_caminhao: tipoVeiculo,
        localidade: cidadeSelecionada,
        cidade: cidadeSelecionada,
        capacidade_kg: 0,
        capacidade_pallets: 0,
        peso_total_kg: pesoTotal || 0,
        viagens_necessarias: qtdViagens,
        viagens_completas: qtdViagens,
        ultima_viagem_percentual: 100,
        valor_unitario_viagem: valorViagem,
        valor_total_frete: valorTotal,
        // ✅ IMPORTANTE: Campos específicos de frete manual
        frete_manual: true,
        manual: true,
        valor_manual_viagem: valorViagem,
        qtd_manual_viagens: qtdViagens,
        observacao_frete_manual: observacaoFreteManual || null
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

    // 🔧 FIX: Mapear modalidade e tipo_veiculo para o formato do banco
    // Frontend: modalidade = "CIF" ou "CIF_COM_DESCARGA"
    // Banco: modalidade = "CIF_SEM_DESCARGA" ou "CIF_COM_DESCARGA"
    const modalidadeDB = modalidade === 'CIF' ? 'CIF_SEM_DESCARGA' : modalidade
    
    // Frontend: tipo_veiculo = "Truck 14t"
    // Banco: tipo_veiculo = "Truck 14t - SEM DESCARGA" ou "Truck 14t - COM DESCARGA"
    const sufixo = modalidade === 'CIF_COM_DESCARGA' ? 'COM DESCARGA' : 'SEM DESCARGA'
    const tipoVeiculoDB = `${tipoVeiculo} - ${sufixo}`
    
    // 🔧 FIX: Buscar frete com TODOS os 3 campos (cidade, tipo_veiculo, modalidade)
    // Cada combinação é uma linha diferente no banco com seu próprio preço!
    const frete = fretes.find(f => 
      f.cidade === cidadeSelecionada && 
      f.tipo_veiculo === tipoVeiculoDB &&
      f.modalidade === modalidadeDB
    )

    console.log('🔍 Buscando frete:', { 
      cidadeSelecionada, 
      tipoVeiculoDB, 
      modalidadeDB 
    })
    console.log('✅ Frete encontrado:', frete)

    if (!frete) {
      console.log('❌ Frete não encontrado - verifique os valores no banco')
      setCalculoFrete(null)
      notificarFrete(null)
      return
    }

    // 🔧 FIX: Calcular viagens baseado no MAIOR limitante (peso OU pallets)
    // Usa capacidades DIRETO do banco (capacidade_kg e capacidade_pallets)
    const pesoTotalKg = pesoTotal || 0
    const capacidadeKg = frete.capacidade_kg || 1
    const capacidadePallets = frete.capacidade_pallets || 1
    
    // Calcular viagens por peso
    const viagensPorPeso = pesoTotalKg > 0 && capacidadeKg > 0 
      ? Math.ceil(pesoTotalKg / capacidadeKg) 
      : 1
    
    // Calcular viagens por pallets
    const viagensPorPallets = totalPallets > 0 && capacidadePallets > 0
      ? Math.ceil(totalPallets / capacidadePallets)
      : 0
    
    // 🔧 CRITICAL: Usar o MAIOR entre peso e pallets!
    // Se precisa 2 viagens por peso mas 3 por pallets, usa 3 viagens!
    const viagensNecessarias = Math.max(viagensPorPeso, viagensPorPallets, 1)
    
    // ✨ Calcular percentual de utilização POR VIAGEM
    // Se são 2 viagens, mostra quanto % de UMA viagem está usando
    const percentualPeso = pesoTotalKg > 0 && capacidadeKg > 0 
      ? ((pesoTotalKg / viagensNecessarias) / capacidadeKg) * 100
      : 0
    
    const percentualPallets = totalPallets > 0 && capacidadePallets > 0
      ? ((totalPallets / viagensNecessarias) / capacidadePallets) * 100
      : 0
    
    console.log('📊 Cálculo de viagens:', {
      pesoTotalKg,
      totalPallets,
      capacidadeKg,
      capacidadePallets,
      viagensPorPeso,
      viagensPorPallets,
      viagensNecessarias,
      percentualPeso,
      percentualPallets
    })

    let viagensCompletas = 0
    let ultimaViagemPercentual = 0

    if (pesoTotalKg > 0 && capacidadeKg > 0) {
      viagensCompletas = Math.floor(pesoTotalKg / capacidadeKg)
      const pesoUltimaViagem = pesoTotalKg % capacidadeKg
      ultimaViagemPercentual = pesoUltimaViagem > 0 
        ? (pesoUltimaViagem / capacidadeKg) * 100 
        : 100
    }

    // 🔧 FIX: Usar preco_fixo DIRETAMENTE do banco (sem cálculos adicionais)
    // O preço já está correto no banco para cada combinação!
    const valorUnitarioViagem = frete.preco_fixo || 0
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
      total_pallets: totalPallets,
      viagens_necessarias: viagensNecessarias,
      viagens_por_peso: viagensPorPeso,
      viagens_por_pallets: viagensPorPallets,
      percentual_utilizacao_peso: percentualPeso,
      percentual_utilizacao_pallets: percentualPallets,
      viagens_completas: viagensCompletas,
      ultima_viagem_percentual: ultimaViagemPercentual,
      valor_unitario_viagem: valorUnitarioViagem,
      valor_total_frete: valorTotalFrete,
      frete_manual: false,
      observacao_frete_manual: null
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
    setObservacaoFreteManual('')
  }

  // Tipos de veículos disponíveis
  const tiposVeiculo = [
    { valor: 'Toco 8t', nome: 'Toco', capacidade: '8 ton', icon: '🚚' },
    { valor: 'Truck 14t', nome: 'Truck', capacidade: '14 ton', icon: '🚛' },
    { valor: 'Carreta 32t', nome: 'Carreta', capacidade: '32 ton', icon: '🚛' }
  ]

  // Verificar se é um pedido grande
  const isPedidoGrande = (pesoTotal || 0) >= 8000

  // Verificar se frete manual pode ser salvo (tem observação)
  const freteManualValido = !freteManual || (freteManual && observacaoFreteManual.trim().length > 0)

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

          {/* Capacidade do Veículo - PESO */}
          {calculoFrete && calculoFrete.capacidade_kg > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <span className="text-xs text-purple-600 block mb-1">Capacidade - Peso</span>
              <p className="text-xl font-bold text-gray-900">
                {(calculoFrete.capacidade_kg / 1000).toFixed(1)} ton
              </p>
              <span className="text-xs text-gray-500">{tipoVeiculo}</span>
            </div>
          )}

          {/* Capacidade do Veículo - PALLETS */}
          {calculoFrete && calculoFrete.capacidade_pallets > 0 && (
            <div className="bg-white rounded-lg p-3 border border-purple-100">
              <span className="text-xs text-purple-600 block mb-1">Capacidade - Pallets</span>
              <p className="text-xl font-bold text-purple-600">
                {calculoFrete.capacidade_pallets} pallets
              </p>
              <span className="text-xs text-gray-500">{tipoVeiculo}</span>
            </div>
          )}
        </div>

        {/* ✨ Viagens Necessárias com Barras de Progresso Duplas */}
        {calculoFrete && calculoFrete.viagens_necessarias > 0 && (
          <div className="mt-4 bg-white border-2 border-orange-300 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-orange-700">Viagens Necessárias</span>
              <span className="text-2xl font-bold text-orange-600">{calculoFrete.viagens_necessarias} {calculoFrete.viagens_necessarias === 1 ? 'viagem' : 'viagens'}</span>
            </div>
            
            {/* Barra de Peso */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Weight size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Peso</span>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {Math.min(calculoFrete.percentual_utilizacao_peso, 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${Math.min(calculoFrete.percentual_utilizacao_peso, 100)}%` }}
                >
                  {calculoFrete.percentual_utilizacao_peso > 20 && (
                    <span className="text-xs font-bold text-white">
                      {((pesoTotal || 0) / 1000).toFixed(2)} ton
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de Pallets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Package size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Pallets</span>
                </div>
                <span className="text-sm font-bold text-purple-600">
                  {Math.min(calculoFrete.percentual_utilizacao_pallets, 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${Math.min(calculoFrete.percentual_utilizacao_pallets, 100)}%` }}
                >
                  {calculoFrete.percentual_utilizacao_pallets > 20 && (
                    <span className="text-xs font-bold text-white">
                      {(totalPallets || 0).toFixed(2)} pallets
                    </span>
                  )}
                </div>
              </div>
            </div>
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
              <option value="FOB">FOB - Cliente retira</option>
              <option value="CIF">CIF - Sem Descarga</option>
              <option value="CIF_COM_DESCARGA">CIF - Com Descarga</option>
            </select>
          </div>

          {/* Tipo de Veículo */}
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
              {tiposVeiculo.map(v => (
                <option key={v.valor} value={v.valor}>
                  {v.icon} {v.nome} ({v.capacidade})
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
                    setObservacaoFreteManual('')
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Definir valor de frete manualmente</span>
            </label>

            {/* ✅ LAYOUT: Valor por Viagem, Quantidade de Viagens e Observação */}
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

                {/* ✅ NOVO: Campo de Observação (Obrigatório) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <AlertCircle size={14} className="inline mr-1 text-orange-500" />
                    Motivo do frete manual <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={observacaoFreteManual}
                    onChange={(e) => setObservacaoFreteManual(e.target.value)}
                    placeholder="Ex: Cliente negociou valor especial, frete combinado com transportadora X, desconto aprovado por gerência..."
                    rows={2}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      !observacaoFreteManual.trim() ? 'border-orange-400 bg-orange-50' : 'border-blue-300'
                    }`}
                  />
                  {!observacaoFreteManual.trim() && (
                    <p className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Obrigatório informar o motivo do frete manual
                    </p>
                  )}
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
