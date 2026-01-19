import { useState, useEffect } from 'react'
import { Truck, Package, AlertCircle, CheckCircle, Search } from 'lucide-react'

export default function FreteSelector({ pesoTotal, totalPallets, onFreteChange, freteAtual }) {
  const [fretes, setFretes] = useState([])
  const [localidades, setLocalidades] = useState([])
  const [buscaCidade, setBuscaCidade] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)
  
  // Seleções
  const [modalidade, setModalidade] = useState(freteAtual?.modalidade || freteAtual?.tipo_frete || '')
  const [tipoVeiculo, setTipoVeiculo] = useState(freteAtual?.tipo_veiculo || freteAtual?.tipo_caminhao || '')
  const [cidadeSelecionada, setCidadeSelecionada] = useState(freteAtual?.localidade || freteAtual?.cidade || '')
  
  // Frete manual - com valor por viagem e quantidade de viagens
  const [freteManual, setFreteManual] = useState(freteAtual?.frete_manual || false)
  const [valorManualViagem, setValorManualViagem] = useState(freteAtual?.valor_manual_viagem || '')
  const [qtdManualViagens, setQtdManualViagens] = useState(freteAtual?.qtd_manual_viagens || 1)
  
  const [calculoFrete, setCalculoFrete] = useState(null)

  // Capacidades dos veículos (peso em kg e pallets)
  const capacidadesVeiculo = {
    'Toco 8t': { peso: 8000, pallets: 12 },
    'Truck 14t': { peso: 14000, pallets: 20 },
    'Carreta 32t': { peso: 32000, pallets: 28 }
  }

  // Inicialização com dados do freteAtual
  useEffect(() => {
    if (freteAtual) {
      console.log('🚚 [FreteSelector] Inicializando com freteAtual:', freteAtual)
      
      setModalidade(freteAtual.modalidade || freteAtual.tipo_frete || '')
      setTipoVeiculo(freteAtual.tipo_veiculo || freteAtual.tipo_caminhao || '')
      setCidadeSelecionada(freteAtual.localidade || freteAtual.cidade || '')
      setBuscaCidade(freteAtual.localidade || freteAtual.cidade || '')
      
      // Verificar se é frete manual
      if (freteAtual.frete_manual) {
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
  }, [modalidade, tipoVeiculo, cidadeSelecionada, pesoTotal, totalPallets, freteManual, valorManualViagem, qtdManualViagens])

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
      const locsUnicas = [...new Set(data?.map(f => f.cidade) || [])]
      setLocalidades(locsUnicas.sort())
    } catch (error) {
      console.error('Erro ao carregar fretes:', error)
    }
  }

  const cidadesFiltradas = localidades.filter(cidade =>
    cidade.toLowerCase().includes(buscaCidade.toLowerCase())
  ).slice(0, 8)

  const selecionarCidade = (cidade) => {
    setCidadeSelecionada(cidade)
    setBuscaCidade(cidade)
    setMostrarSugestoes(false)
  }

  const calcularFrete = () => {
    // FOB não tem frete
    if (modalidade === 'FOB') {
      const resultado = {
        tipo_frete: 'FOB',
        modalidade: 'FOB',
        localidade: cidadeSelecionada,
        tipo_veiculo: null,
        tipo_caminhao: null,
        viagens_necessarias: 0,
        valor_unitario_viagem: 0,
        valor_total_frete: 0,
        frete_manual: false
      }
      setCalculoFrete(resultado)
      onFreteChange?.(resultado)
      return
    }

    // Se está usando frete manual
    if (freteManual && valorManualViagem) {
      const valorViagem = parseFloat(valorManualViagem) || 0
      const qtdViagens = parseInt(qtdManualViagens) || 1
      const valorTotal = valorViagem * qtdViagens

      const resultado = {
        tipo_frete: modalidade,
        modalidade: modalidade,
        localidade: cidadeSelecionada,
        tipo_veiculo: tipoVeiculo,
        tipo_caminhao: tipoVeiculo,
        viagens_necessarias: qtdViagens,
        valor_unitario_viagem: valorViagem,
        valor_total_frete: valorTotal,
        frete_manual: true,
        valor_manual_viagem: valorViagem,
        qtd_manual_viagens: qtdViagens
      }

      console.log('🚚 [FreteSelector] Frete MANUAL calculado:', resultado)
      setCalculoFrete(resultado)
      onFreteChange?.(resultado)
      return
    }

    // Cálculo automático
    if (!cidadeSelecionada || !tipoVeiculo || !modalidade) {
      setCalculoFrete(null)
      onFreteChange?.(null)
      return
    }

    // Buscar valor do frete cadastrado
    const freteCadastrado = fretes.find(
      f => f.cidade === cidadeSelecionada && f.tipo_veiculo === tipoVeiculo
    )

    if (!freteCadastrado) {
      setCalculoFrete(null)
      onFreteChange?.(null)
      return
    }

    // Calcular viagens baseado no maior limitante (peso ou pallets)
    const capacidade = capacidadesVeiculo[tipoVeiculo]
    const pesoKg = (pesoTotal || 0) * 1000
    
    const viagensPorPeso = capacidade?.peso ? Math.ceil(pesoKg / capacidade.peso) : 1
    const viagensPorPallets = (totalPallets && capacidade?.pallets) 
      ? Math.ceil(totalPallets / capacidade.pallets) 
      : 0
    
    const viagens = Math.max(viagensPorPeso, viagensPorPallets, 1)

    // Valor base da viagem
    let valorViagem = freteCadastrado.valor || 0

    // Adicionar 15% se tiver descarga
    if (modalidade === 'CIF_COM_DESCARGA') {
      valorViagem = valorViagem * 1.15
    }

    const valorTotal = valorViagem * viagens

    const resultado = {
      tipo_frete: modalidade,
      modalidade: modalidade,
      localidade: cidadeSelecionada,
      cidade: cidadeSelecionada,
      tipo_veiculo: tipoVeiculo,
      tipo_caminhao: tipoVeiculo,
      viagens_necessarias: viagens,
      valor_unitario_viagem: valorViagem,
      valor_total_frete: valorTotal,
      frete_manual: false,
      viagens_por_peso: viagensPorPeso,
      viagens_por_pallets: viagensPorPallets
    }

    console.log('🚚 [FreteSelector] Frete AUTOMÁTICO calculado:', resultado)
    setCalculoFrete(resultado)
    onFreteChange?.(resultado)
  }

  const formatarMoeda = (valor) => {
    return `R$ ${(valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Truck className="text-teal-600" size={20} />
        <h3 className="font-semibold text-gray-800">Frete</h3>
      </div>

      <div className="space-y-4">
        {/* Modalidade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Modalidade
          </label>
          <select
            value={modalidade}
            onChange={(e) => setModalidade(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Selecione...</option>
            <option value="FOB">FOB - Cliente retira</option>
            <option value="CIF">CIF - Sem Descarga</option>
            <option value="CIF_COM_DESCARGA">CIF - Com Descarga (+15%)</option>
          </select>
        </div>

        {/* Tipo de Veículo - só mostra se não for FOB */}
        {modalidade && modalidade !== 'FOB' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Veículo
            </label>
            <select
              value={tipoVeiculo}
              onChange={(e) => setTipoVeiculo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Selecione...</option>
              <option value="Toco 8t">Toco 8t (12 pallets)</option>
              <option value="Truck 14t">Truck 14t (20 pallets)</option>
              <option value="Carreta 32t">Carreta 32t (28 pallets)</option>
            </select>
          </div>
        )}

        {/* Busca de Cidade - só mostra se não for FOB */}
        {modalidade && modalidade !== 'FOB' && (
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
                setMostrarSugestoes(true)
                if (e.target.value !== cidadeSelecionada) {
                  setCidadeSelecionada('')
                }
              }}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
              placeholder="Ex: Betim, BH Centro, Contagem..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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

            {/* Cidade encontrada */}
            {cidadeSelecionada && (
              <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle size={16} />
                Localidade encontrada: {cidadeSelecionada}
              </div>
            )}
          </div>
        )}

        {/* Resultado do cálculo de frete automático */}
        {calculoFrete && modalidade !== 'FOB' && cidadeSelecionada && !freteManual && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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

        {/* FOB selecionado */}
        {modalidade === 'FOB' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-gray-600">
              <Package size={20} className="inline mr-2" />
              FOB - Cliente retira na fábrica. Sem frete.
            </p>
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

            {/* Campos de frete manual - valor por viagem e quantidade de viagens */}
            {freteManual && (
              <div className="mt-4 space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
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