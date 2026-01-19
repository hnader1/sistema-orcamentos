// ====================================================================================
// COMPONENTE ADMIN DE FRETE - COM CAPACIDADE DE PALLETS
// ====================================================================================
// Autor: Nader / Claude
// Última atualização: Janeiro 2026
// Descrição: Gerenciamento de rotas de frete com capacidade de peso E pallets
// ====================================================================================

import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Power, Truck, X, Save } from 'lucide-react'
import { supabase } from '../../services/supabase'

export default function FreteAdmin() {
  const [fretes, setFretes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroModalidade, setFiltroModalidade] = useState('todas')
  const [modalAberto, setModalAberto] = useState(false)
  const [freteEditando, setFreteEditando] = useState(null)
  const [salvando, setSalvando] = useState(false)

  // Estado do formulário
  const [formData, setFormData] = useState({
    cidade: '',
    modalidade: 'CIF_SEM_DESCARGA',
    tipo_veiculo_base: 'Truck 14t',
    preco_fixo: '',
    capacidade_kg: '',
    capacidade_pallets: '',
    ativo: true
  })

  // Capacidades padrão por veículo
  const capacidadesPadrao = {
    'Toco 8t': { kg: 8000, pallets_sem: 6, pallets_com: 5 },
    'Truck 14t': { kg: 14000, pallets_sem: 10, pallets_com: 9 },
    'Carreta 32t': { kg: 32000, pallets_sem: 18, pallets_com: 18 }
  }

  useEffect(() => {
    carregarFretes()
  }, [])

  const carregarFretes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fretes')
        .select('*')
        .order('cidade')
        .order('tipo_veiculo')

      if (error) throw error
      setFretes(data || [])
    } catch (error) {
      console.error('Erro ao carregar fretes:', error)
      alert('Erro ao carregar fretes')
    } finally {
      setLoading(false)
    }
  }

  // Filtrar fretes
  const fretesFiltrados = fretes.filter(f => {
    const matchBusca = !busca || 
      f.cidade?.toLowerCase().includes(busca.toLowerCase()) ||
      f.tipo_veiculo?.toLowerCase().includes(busca.toLowerCase())
    
    const matchModalidade = filtroModalidade === 'todas' || f.modalidade === filtroModalidade

    return matchBusca && matchModalidade
  })

  // Abrir modal para novo frete
  const novoFrete = () => {
    setFreteEditando(null)
    setFormData({
      cidade: '',
      modalidade: 'CIF_SEM_DESCARGA',
      tipo_veiculo_base: 'Truck 14t',
      preco_fixo: '',
      capacidade_kg: 14000,
      capacidade_pallets: 10,
      ativo: true
    })
    setModalAberto(true)
  }

  // Abrir modal para editar frete
  const editarFrete = (frete) => {
    // Extrair tipo de veículo base do tipo_veiculo completo
    let tipoBase = 'Truck 14t'
    if (frete.tipo_veiculo?.includes('Toco')) tipoBase = 'Toco 8t'
    else if (frete.tipo_veiculo?.includes('Truck')) tipoBase = 'Truck 14t'
    else if (frete.tipo_veiculo?.includes('Carreta')) tipoBase = 'Carreta 32t'

    setFreteEditando(frete)
    setFormData({
      cidade: frete.cidade || '',
      modalidade: frete.modalidade || 'CIF_SEM_DESCARGA',
      tipo_veiculo_base: tipoBase,
      preco_fixo: frete.preco_fixo || '',
      capacidade_kg: frete.capacidade_kg || capacidadesPadrao[tipoBase].kg,
      capacidade_pallets: frete.capacidade_pallets || 0,
      ativo: frete.ativo !== false
    })
    setModalAberto(true)
  }

  // Atualizar capacidades quando mudar veículo ou modalidade
  const handleVeiculoChange = (tipoBase) => {
    const capacidades = capacidadesPadrao[tipoBase]
    const pallets = formData.modalidade === 'CIF_COM_DESCARGA' 
      ? capacidades.pallets_com 
      : capacidades.pallets_sem

    setFormData(prev => ({
      ...prev,
      tipo_veiculo_base: tipoBase,
      capacidade_kg: capacidades.kg,
      capacidade_pallets: pallets
    }))
  }

  const handleModalidadeChange = (modalidade) => {
    const capacidades = capacidadesPadrao[formData.tipo_veiculo_base]
    const pallets = modalidade === 'CIF_COM_DESCARGA' 
      ? capacidades.pallets_com 
      : capacidades.pallets_sem

    setFormData(prev => ({
      ...prev,
      modalidade,
      capacidade_pallets: pallets
    }))
  }

  // Salvar frete
  const salvarFrete = async () => {
    try {
      if (!formData.cidade || !formData.preco_fixo) {
        alert('Preencha cidade e preço fixo!')
        return
      }

      setSalvando(true)

      // Montar tipo_veiculo completo (ex: "Truck 14t - SEM DESCARGA")
      const sufixo = formData.modalidade === 'CIF_COM_DESCARGA' ? 'COM DESCARGA' : 'SEM DESCARGA'
      const tipoVeiculoCompleto = `${formData.tipo_veiculo_base} - ${sufixo}`

      // Calcular preço por kg
      const precoKg = formData.capacidade_kg > 0 
        ? parseFloat(formData.preco_fixo) / formData.capacidade_kg * 1000
        : 0

      const dados = {
        cidade: formData.cidade.toUpperCase().trim(),
        modalidade: formData.modalidade,
        tipo_veiculo: tipoVeiculoCompleto,
        preco_fixo: parseFloat(formData.preco_fixo),
        preco_por_kg: precoKg,
        capacidade_kg: parseInt(formData.capacidade_kg),
        capacidade_pallets: parseInt(formData.capacidade_pallets) || 0,
        ativo: formData.ativo
      }

      console.log('💾 Salvando frete:', dados)

      if (freteEditando) {
        // Atualizar existente
        const { error } = await supabase
          .from('fretes')
          .update(dados)
          .eq('id', freteEditando.id)

        if (error) throw error
        console.log('✅ Frete atualizado')
      } else {
        // Inserir novo
        const { error } = await supabase
          .from('fretes')
          .insert([dados])

        if (error) throw error
        console.log('✅ Frete criado')
      }

      setModalAberto(false)
      carregarFretes()
      alert('Frete salvo com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      alert('Erro ao salvar frete: ' + error.message)
    } finally {
      setSalvando(false)
    }
  }

  // Alternar status ativo/inativo
  const alternarStatus = async (frete) => {
    try {
      const novoStatus = !frete.ativo
      
      const { error } = await supabase
        .from('fretes')
        .update({ ativo: novoStatus })
        .eq('id', frete.id)

      if (error) throw error

      carregarFretes()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status')
    }
  }

  // Badge de modalidade
  const getModalidadeBadge = (modalidade) => {
    if (modalidade === 'CIF_COM_DESCARGA') {
      return <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">CIF - Com Descarga</span>
    }
    return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">CIF - Sem Descarga</span>
  }

  return (
    <div>
      {/* Header com estatísticas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Gerenciar Frete</h2>
            <p className="text-sm text-gray-500">
              {fretes.length} rotas cadastradas ({fretes.filter(f => f.ativo).length} ativas)
            </p>
          </div>
          <button
            onClick={novoFrete}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus size={20} />
            Nova Rota
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por cidade ou tipo de veículo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <select
            value={filtroModalidade}
            onChange={(e) => setFiltroModalidade(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="todas">Todas Modalidades</option>
            <option value="CIF_SEM_DESCARGA">CIF - Sem Descarga</option>
            <option value="CIF_COM_DESCARGA">CIF - Com Descarga</option>
          </select>
        </div>
      </div>

      {/* Lista de fretes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : fretesFiltrados.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {busca || filtroModalidade !== 'todas' 
              ? 'Nenhuma rota encontrada com os filtros aplicados'
              : 'Nenhuma rota cadastrada'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {fretesFiltrados.map((frete) => (
              <div 
                key={frete.id} 
                className={`p-4 hover:bg-gray-50 transition-colors ${!frete.ativo ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Truck className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{frete.cidade}</span>
                        {getModalidadeBadge(frete.modalidade)}
                        {!frete.ativo && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Inativo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Veículo: <strong>{frete.tipo_veiculo}</strong></span>
                        <span>Capacidade: <strong>{(frete.capacidade_kg / 1000).toFixed(1)} ton</strong></span>
                        {/* ✨ NOVO: Mostrar capacidade de pallets */}
                        <span className="text-purple-600">
                          Pallets: <strong>{frete.capacidade_pallets || 0}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Preço Fixo:</div>
                      <div className="text-lg font-bold text-green-600">
                        R$ {parseFloat(frete.preco_fixo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-gray-500">
                        Preço/ton: R$ {((frete.preco_fixo / (frete.capacidade_kg / 1000)) || 0).toFixed(2)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => editarFrete(frete)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => alternarStatus(frete)}
                        className={`p-2 rounded-lg ${frete.ativo 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-green-600 hover:bg-green-50'}`}
                        title={frete.ativo ? 'Desativar' : 'Ativar'}
                      >
                        <Power size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">
                {freteEditando ? 'Editar Frete' : 'Nova Rota de Frete'}
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="p-4 space-y-4">
              {/* Cidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Ex: BELO HORIZONTE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Modalidade e Veículo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modalidade *
                  </label>
                  <select
                    value={formData.modalidade}
                    onChange={(e) => handleModalidadeChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="CIF_SEM_DESCARGA">CIF - Sem Descarga</option>
                    <option value="CIF_COM_DESCARGA">CIF - Com Descarga</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Veículo *
                  </label>
                  <select
                    value={formData.tipo_veiculo_base}
                    onChange={(e) => handleVeiculoChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Toco 8t">Toco 8t (8 ton)</option>
                    <option value="Truck 14t">Truck 14t (14 ton)</option>
                    <option value="Carreta 32t">Carreta 32t (32 ton)</option>
                  </select>
                </div>
              </div>

              {/* Info do tipo completo */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <span className="text-sm text-purple-700">
                  <strong>Tipo Completo:</strong> {formData.tipo_veiculo_base} - {formData.modalidade === 'CIF_COM_DESCARGA' ? 'COM DESCARGA' : 'SEM DESCARGA'}
                </span>
              </div>

              {/* Preço e Capacidade */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço Fixo (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco_fixo}
                    onChange={(e) => setFormData({ ...formData, preco_fixo: e.target.value })}
                    placeholder="Ex: 1750"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidade (kg) *
                  </label>
                  <input
                    type="number"
                    value={formData.capacidade_kg}
                    onChange={(e) => setFormData({ ...formData, capacidade_kg: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-xs text-gray-500">
                    {(formData.capacidade_kg / 1000).toFixed(1)} toneladas
                  </span>
                </div>
              </div>

              {/* ✨ NOVO: Capacidade de Pallets */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  📦 Capacidade de Pallets *
                </label>
                <input
                  type="number"
                  value={formData.capacidade_pallets}
                  onChange={(e) => setFormData({ ...formData, capacidade_pallets: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-lg font-bold text-center"
                />
                <p className="text-xs text-purple-600 mt-2">
                  💡 Quantidade máxima de pallets que o caminhão comporta nesta modalidade.
                  <br/>
                  O cálculo de viagens usará o <strong>maior limitante</strong> entre peso e pallets.
                </p>
              </div>

              {/* Preview do cálculo */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-sm text-blue-700">
                  <strong>Preço por tonelada:</strong> R$ {formData.preco_fixo && formData.capacidade_kg 
                    ? ((parseFloat(formData.preco_fixo) / (parseInt(formData.capacidade_kg) / 1000))).toFixed(2)
                    : '0.00'}
                </span>
              </div>

              {/* Status */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Rota ativa (disponível para orçamentos)</span>
              </label>
            </div>

            {/* Footer do Modal */}
            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setModalAberto(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={salvarFrete}
                disabled={salvando}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}