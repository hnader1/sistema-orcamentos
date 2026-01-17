import { useState, useEffect, useRef } from 'react'
import { Truck, Package, CheckCircle, Search } from 'lucide-react'

export default function FreteSelector({ pesoTotal, totalPallets, onFreteChange, freteAtual }) {
  const [fretes, setFretes] = useState([])
  const [localidades, setLocalidades] = useState([])
  const [buscaCidade, setBuscaCidade] = useState('')
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false)

  const [modalidade, setModalidade] = useState('')
  const [tipoVeiculo, setTipoVeiculo] = useState('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState('')
  
  const [freteManual, setFreteManual] = useState(false)
  const [valorManual, setValorManual] = useState('')
  
  const [calculoFrete, setCalculoFrete] = useState(null)
  
  // ✅ CORREÇÃO: Flag para controlar inicialização
  const [jaInicializado, setJaInicializado] = useState(false)
  const inicializandoRef = useRef(false)

  const capacidadesVeiculo = {
    'Toco 8t': 8000,
    'Truck 14t': 14000,
    'Carreta 32t': 32000
  }

  // Carrega fretes do banco
  useEffect(() => {
    carregarFretes()
  }, [])

  // ✅ CORREÇÃO: useEffect do cálculo com proteção
  useEffect(() => {
    // Não calcula durante inicialização
    if (inicializandoRef.current) {
      console.log('⏳ Aguardando inicialização, não calculando...')
      return
    }
    
    // Só calcula se já inicializou OU se não tem freteAtual (orçamento novo)
    if (jaInicializado || !freteAtual) {
      calcularFrete()
    }
  }, [modalidade, tipoVeiculo, cidadeSelecionada, pesoTotal, freteManual, valorManual, jaInicializado])

  // ✅ CORREÇÃO: useEffect do freteAtual com controle de inicialização
  useEffect(() => {
    console.log('🔄 useEffect freteAtual:', { 
      freteAtual, 
      fretesLength: fretes.length,
      jaInicializado 
    })
    
    // Se tem freteAtual e fretes carregados, inicializa os valores
    if (freteAtual && fretes.length > 0 && !jaInicializado) {
      inicializandoRef.current = true
      
      console.log('✅ Inicializando FreteSelector com:', {
        modalidade: freteAtual.modalidade,
        tipo_veiculo: freteAtual.tipo_veiculo,
        localidade: freteAtual.localidade
      })
      
      // Seta os valores vindos do banco
      setModalidade(freteAtual.modalidade || '')
      setTipoVeiculo(freteAtual.tipo_veiculo || '')
      setCidadeSelecionada(freteAtual.localidade || '')
      setBuscaCidade(freteAtual.localidade || '')
      
      // Libera para calcular após um pequeno delay
      setTimeout(() => {
        inicializandoRef.current = false
        setJaInicializado(true)
        console.log('✅ FreteSelector inicializado!')
      }, 150)
    } 
    // Se não tem freteAtual (orçamento novo), libera imediatamente
    else if (!freteAtual && fretes.length > 0 && !jaInicializado) {
      setJaInicializado(true)
      console.log('✅ Orçamento novo - FreteSelector liberado')
    }
  }, [freteAtual, fretes])

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
    console.log('🧮 calcularFrete executando:', { modalidade, tipoVeiculo, cidadeSelecionada })
    
    if (modalidade === 'FOB') {
      const resultado = {
        modalidade: 'FOB',
        tipo_veiculo: null,
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

    if (freteManual && valorManual) {
      const resultado = {
        modalidade: modalidade,
        tipo_veiculo: tipoVeiculo,
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

    if (!modalidade || !tipoVeiculo || !cidadeSelecionada) {
      setCalculoFrete(null)
      // ✅ CORREÇÃO: Só notifica null se já inicializou
      if (jaInicializado) {
        notificarFrete(null)
      }
      return
    }

    const modalidadeBusca = modalidade === 'CIF_COM_DESCARGA' ? 'COM DESCARGA' : 'SEM DESCARGA'
    const veiculoBusca = `${tipoVeiculo} - ${modalidadeBusca}`
    
    const frete = fretes.find(f => 
      f.cidade === cidadeSelecionada && 
      f.tipo_veiculo === veiculoBusca &&
      f.modalidade === modalidade
    )

    if (!frete) {
      setCalculoFrete(null)
      if (jaInicializado) {
        notificarFrete(null)
      }
      return
    }

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

    const valorUnitarioViagem = frete.preco_fixo || frete.preco_por_kg || 0
    const valorTotalFrete = valorUnitarioViagem * viagensNecessarias

    // ✅ CORREÇÃO: Nomes padronizados
    const resultado = {
      modalidade: modalidade,
      tipo_veiculo: tipoVeiculo,
      localidade: cidadeSelecionada,
      capacidade_kg: capacidadeKg,
      peso_total_kg: pesoTotalKg,
      viagens_necessarias: viagensNecessarias,
      viagens_completas: viagensCompletas,
      ultima_viagem_percentual: ultimaViagemPercentual,
      valor_unitario_viagem: valorUnitarioViagem,
      valor_total_frete: valorTotalFrete
    }

    console.log('✅ Frete calculado:', resultado)
    setCalculoFrete(resultado)
    notificarFrete(resultado)
  }

  const notificarFrete = (dadosFrete) => {
    console.log('📤 Notificando frete para OrcamentoForm:', dadosFrete)
    if (onFreteChange) onFreteChange(dadosFrete)
  }

  const resetarSelecoes = () => {
    setTipoVeiculo('')
    setCidadeSelecionada('')
    setBuscaCidade('')
    setFreteManual(false)
    setValorManual('')
  }

  const tiposVeiculo = [
    { valor: 'Toco 8t', nome: 'Toco', capacidade: '8 ton', icon: '🚚' },
    { valor: 'Truck 14t', nome: 'Truck', capacidade: '14 ton', icon: '🚛' },
    { valor: 'Carreta 32t', nome: 'Carreta', capacidade: '32 ton', icon: '🚛' }
  ]

  const isPedidoGrande = (pesoTotal || 0) >= 8000

  return (
    <div className="space-y-3">
      {/* ANÁLISE DE CARGA - COMPACTA */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Package className="text-purple-600" size={16} />
            <h3 className="font-semibold text-purple-900 text-sm">Análise de Carga</h3>
          </div>
          {isPedidoGrande && (
            <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded text-xs">
              <CheckCircle size={12} /> Pedido grande!
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white rounded p-2 border border-purple-100 text-center">
            <span className="text-xs text-purple-600 block">Peso Total</span>
            <p className="text-base font-bold">{((pesoTotal || 0) / 1000).toFixed(2)} ton</p>
          </div>
          <div className="bg-white rounded p-2 border border-purple-100 text-center">
            <span className="text-xs text-purple-600 block">Pallets</span>
            <p className="text-base font-bold text-purple-600">{(totalPallets || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded p-2 border border-purple-100 text-center">
            <span className="text-xs text-purple-600 block">Capacidade</span>
            <p className="text-base font-bold">
              {tipoVeiculo ? `${(capacidadesVeiculo[tipoVeiculo] / 1000).toFixed(0)} ton` : '-'}
            </p>
          </div>
          <div className="bg-white rounded p-2 border border-orange-200 text-center">
            <span className="text-xs text-orange-600 block">Viagens</span>
            <p className="text-base font-bold text-orange-600">
              {calculoFrete?.viagens_necessarias || '-'}
            </p>
          </div>
        </div>

        {/* Barras Compactas */}
        {calculoFrete && calculoFrete.viagens_necessarias > 0 && modalidade !== 'FOB' && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-gray-500 w-16">Ocupação:</span>
            <div className="flex-1 flex gap-0.5 items-center">
              {[...Array(Math.min(calculoFrete.viagens_completas, 10))].map((_, i) => (
                <div key={i} className="h-2 w-4 bg-green-500 rounded-sm" />
              ))}
              {calculoFrete.ultima_viagem_percentual > 0 && calculoFrete.ultima_viagem_percentual < 100 && (
                <div className="h-2 w-4 bg-gray-200 rounded-sm overflow-hidden">
                  <div 
                    className={`h-full ${calculoFrete.ultima_viagem_percentual < 50 ? 'bg-red-400' : 'bg-orange-400'}`}
                    style={{ width: `${calculoFrete.ultima_viagem_percentual}%` }}
                  />
                </div>
              )}
              {calculoFrete.viagens_completas > 10 && (
                <span className="text-gray-500">+{calculoFrete.viagens_completas - 10}</span>
              )}
            </div>
            {calculoFrete.ultima_viagem_percentual > 0 && calculoFrete.ultima_viagem_percentual < 100 && (
              <span className={calculoFrete.ultima_viagem_percentual < 50 ? 'text-red-600' : 'text-gray-500'}>
                Última: {calculoFrete.ultima_viagem_percentual.toFixed(0)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* FRETE - COMPACTO */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="text-blue-600" size={16} />
          <h3 className="font-semibold text-gray-900 text-sm">Informações de Frete</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Modalidade</label>
            <select
              value={modalidade}
              onChange={(e) => {
                setModalidade(e.target.value)
                if (e.target.value === 'FOB') resetarSelecoes()
              }}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            >
              <option value="">Selecione...</option>
              <option value="FOB">FOB (Cliente Retira)</option>
              <option value="CIF_SEM_DESCARGA">CIF - Sem Descarga</option>
              <option value="CIF_COM_DESCARGA">CIF - Com Descarga</option>
            </select>
          </div>

          {(modalidade === 'CIF_SEM_DESCARGA' || modalidade === 'CIF_COM_DESCARGA') && (
            <>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Veículo</label>
                <select
                  value={tipoVeiculo}
                  onChange={(e) => setTipoVeiculo(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  <option value="">Selecione...</option>
                  {tiposVeiculo.map(v => (
                    <option key={v.valor} value={v.valor}>{v.icon} {v.nome} ({v.capacidade})</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-xs text-gray-600 mb-1">
                  <Search size={10} className="inline" /> Destino
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
                  placeholder="Digite a cidade..."
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                {mostrarSugestoes && buscaCidade && cidadesFiltradas.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-32 overflow-auto">
                    {cidadesFiltradas.map(cidade => (
                      <button
                        key={cidade}
                        onClick={() => selecionarCidade(cidade)}
                        className="w-full px-2 py-1 text-left text-sm hover:bg-blue-50"
                      >
                        {cidade}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {cidadeSelecionada && (
          <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <CheckCircle size={12} /> {cidadeSelecionada}
          </p>
        )}

        {modalidade === 'FOB' && (
          <p className="mt-2 text-sm text-green-700 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle size={14} /> FOB - Cliente retira. Sem frete.
          </p>
        )}

        {calculoFrete && modalidade !== 'FOB' && cidadeSelecionada && (
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              R$ {calculoFrete.valor_unitario_viagem.toFixed(2)} × {calculoFrete.viagens_necessarias}
            </span>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">
                R$ {calculoFrete.valor_total_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <span className="text-xs text-green-600">✓ Automático</span>
            </div>
          </div>
        )}

        {modalidade && modalidade !== 'FOB' && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <label className="flex items-center gap-1 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                checked={freteManual}
                onChange={(e) => setFreteManual(e.target.checked)}
                className="w-3 h-3"
              />
              Manual
            </label>
            {freteManual && (
              <input
                type="number"
                value={valorManual}
                onChange={(e) => setValorManual(e.target.value)}
                placeholder="R$ 0,00"
                className="w-24 px-2 py-1 border rounded text-sm"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}