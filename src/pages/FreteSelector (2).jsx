import { useState, useEffect } from 'react'
import { Truck, Calculator, AlertCircle } from 'lucide-react'

export default function FreteSelector({ pesoTotal, onFreteChange, freteAtual }) {
  const [fretes, setFretes] = useState([])
  const [localidades, setLocalidades] = useState([])
  
  const [tipoFrete, setTipoFrete] = useState(freteAtual?.tipo_frete || '')
  const [tipoCaminhao, setTipoCaminhao] = useState(freteAtual?.tipo_caminhao || '')
  const [localidade, setLocalidade] = useState(freteAtual?.localidade || '')
  
  const [freteSelecionado, setFreteSelecionado] = useState(null)
  const [calculoFrete, setCalculoFrete] = useState(null)

  useEffect(() => {
    carregarFretes()
  }, [])

  useEffect(() => {
    calcularFrete()
  }, [tipoFrete, tipoCaminhao, localidade, pesoTotal])

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

  const calcularFrete = () => {
    if (tipoFrete === 'FOB') {
      const resultado = {
        tipo_frete: 'FOB',
        tipo_caminhao: null,
        localidade: null,
        capacidade_kg: 0,
        peso_total_kg: pesoTotal || 0,
        viagens_necessarias: 0,
        valor_unitario_viagem: 0,
        valor_total_frete: 0
      }
      setCalculoFrete(resultado)
      notificarFrete(resultado)
      setFreteSelecionado(null)
      return
    }

    if (!tipoFrete || !tipoCaminhao || !localidade) {
      setCalculoFrete(null)
      setFreteSelecionado(null)
      notificarFrete(null)
      return
    }

    const frete = fretes.find(f => 
      f.cidade === localidade && 
      f.modalidade === tipoFrete &&
      f.tipo_veiculo.includes(tipoCaminhao)
    )

    if (!frete) {
      setCalculoFrete(null)
      setFreteSelecionado(null)
      notificarFrete(null)
      return
    }

    setFreteSelecionado(frete)

    const pesoTotalKg = pesoTotal || 0
    const capacidadeKg = frete.capacidade_kg
    const viagensNecessarias = pesoTotalKg > 0 
      ? Math.ceil(pesoTotalKg / capacidadeKg) 
      : 1

    const valorUnitarioViagem = frete.preco_fixo || frete.preco_por_kg
    const valorTotalFrete = valorUnitarioViagem * viagensNecessarias

    const resultado = {
      tipo_frete: tipoFrete,
      tipo_caminhao: tipoCaminhao,
      localidade: localidade,
      capacidade_kg: capacidadeKg,
      peso_total_kg: pesoTotalKg,
      viagens_necessarias: viagensNecessarias,
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

  return (
    <div className="space-y-4">
      {/* DROPDOWNS EM SEQUÊNCIA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. Tipo de Frete */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Frete *
          </label>
          <select
            value={tipoFrete}
            onChange={(e) => {
              setTipoFrete(e.target.value)
              setTipoCaminhao('')
              setLocalidade('')
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="FOB">FOB (Cliente retira)</option>
            <option value="CIF_COM_DESCARGA">CIF Com Descarga</option>
            <option value="CIF_SEM_DESCARGA">CIF Sem Descarga</option>
          </select>
        </div>

        {/* 2. Tipo de Caminhão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Caminhão *
          </label>
          <select
            value={tipoCaminhao}
            onChange={(e) => {
              setTipoCaminhao(e.target.value)
              setLocalidade('')
            }}
            disabled={!tipoFrete || tipoFrete === 'FOB'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecione...</option>
            <option value="Toco 8t">Toco (8 toneladas)</option>
            <option value="Truck 14t">Truck (14 toneladas)</option>
            <option value="Carreta 32t">Carreta (32 toneladas)</option>
          </select>
        </div>

        {/* 3. Local de Entrega */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local de Entrega *
          </label>
          <select
            value={localidade}
            onChange={(e) => setLocalidade(e.target.value)}
            disabled={!tipoCaminhao || tipoFrete === 'FOB'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecione...</option>
            {localidades.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CÁLCULO DO FRETE */}
      {calculoFrete && (
        <div className={`border-2 rounded-lg p-4 ${
          calculoFrete.tipo_frete === 'FOB' 
            ? 'bg-yellow-50 border-yellow-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          {calculoFrete.tipo_frete === 'FOB' ? (
            // FOB
            <div className="flex items-start gap-2">
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-yellow-900">FOB - Free On Board</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Cliente retira o produto no local. Não será cobrado frete.
                </p>
                <div className="mt-3 bg-white border border-yellow-300 rounded p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Valor do Frete:</span>
                    <span className="text-xl font-bold text-green-600">R$ 0,00</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // CIF
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="text-blue-600" size={20} />
                <h3 className="text-sm font-semibold text-blue-900">Cálculo do Frete</h3>
              </div>

              <div className="space-y-3">
                {/* Informações */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-white rounded p-2">
                    <span className="text-gray-600 block text-xs">Peso Total:</span>
                    <p className="font-semibold text-gray-900">
                      {(calculoFrete.peso_total_kg / 1000).toFixed(2)}t
                    </p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <span className="text-gray-600 block text-xs">Capacidade:</span>
                    <p className="font-semibold text-gray-900">
                      {(calculoFrete.capacidade_kg / 1000).toFixed(0)}t
                    </p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <span className="text-gray-600 block text-xs">Viagens Necessárias:</span>
                    <p className="font-semibold text-blue-900 text-lg">
                      {calculoFrete.viagens_necessarias}x
                    </p>
                  </div>
                  <div className="bg-white rounded p-2">
                    <span className="text-gray-600 block text-xs">Valor Unitário:</span>
                    <p className="font-semibold text-gray-900">
                      R$ {calculoFrete.valor_unitario_viagem.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Alerta múltiplas viagens */}
                {calculoFrete.viagens_necessarias > 1 && (
                  <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded p-2">
                    <AlertCircle className="text-orange-600 flex-shrink-0 mt-0.5" size={16} />
                    <p className="text-xs text-orange-700">
                      Serão necessárias <strong>{calculoFrete.viagens_necessarias} viagens</strong> para 
                      transportar {(calculoFrete.peso_total_kg / 1000).toFixed(2)}t
                    </p>
                  </div>
                )}

                {/* Total Frete */}
                <div className="bg-white border-2 border-blue-300 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Valor por viagem:</span>
                      <span className="font-semibold text-gray-900">
                        R$ {calculoFrete.valor_unitario_viagem.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Quantidade de viagens:</span>
                      <span className="font-semibold text-gray-900">
                        {calculoFrete.viagens_necessarias}x
                      </span>
                    </div>
                    <div className="border-t-2 border-blue-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-blue-900">TOTAL FRETE:</span>
                        <span className="text-2xl font-bold text-blue-900">
                          R$ {calculoFrete.valor_total_frete.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aviso sem produtos */}
      {(!pesoTotal || pesoTotal === 0) && tipoFrete && tipoFrete !== 'FOB' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-sm text-yellow-700">
              Adicione produtos ao orçamento para calcular o número de viagens necessárias.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
