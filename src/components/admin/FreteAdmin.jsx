import { useState, useEffect } from 'react'
import { Plus, Edit2, Power, Search, X, Save, AlertCircle, Truck } from 'lucide-react'
import { supabase } from '../../services/supabase'

export default function FreteAdmin() {
  const [fretes, setFretes] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroModalidade, setFiltroModalidade] = useState('todos')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const [formData, setFormData] = useState({
    cidade: '',
    modalidade: 'CIF_SEM_DESCARGA',
    tipo_base: 'Truck 14t',
    preco_fixo: '',
    capacidade_kg: '',
    ativo: true
  })

  const [erros, setErros] = useState({})

  // Capacidades padrão por tipo de veículo
  const capacidadesVeiculo = {
    'Toco 8t': 8000,
    'Truck 14t': 14000,
    'Carreta 32t': 32000
  }

  const tiposVeiculo = [
    { valor: 'Toco 8t', nome: 'Toco 8t', capacidade: 8000 },
    { valor: 'Truck 14t', nome: 'Truck 14t', capacidade: 14000 },
    { valor: 'Carreta 32t', nome: 'Carreta 32t', capacidade: 32000 }
  ]

  useEffect(() => {
    carregarFretes()
  }, [])

  // Auto-preencher capacidade ao selecionar tipo de veículo
  useEffect(() => {
    if (formData.tipo_base && !editando) {
      const capacidade = capacidadesVeiculo[formData.tipo_base]
      if (capacidade) {
        setFormData(prev => ({ ...prev, capacidade_kg: capacidade.toString() }))
      }
    }
  }, [formData.tipo_base])

  const carregarFretes = async () => {
    try {
      setLoading(true)
      console.log('🚚 Carregando fretes...')

      const { data, error } = await supabase
        .from('fretes')
        .select('*')
        .order('cidade', { ascending: true })

      if (error) throw error

      console.log('✅ Fretes carregados:', data?.length || 0)
      setFretes(data || [])
    } catch (error) {
      console.error('❌ Erro ao carregar fretes:', error)
      alert('Erro ao carregar fretes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const fretesFiltrados = fretes.filter(f => {
    const matchBusca = !busca || 
      f.cidade?.toLowerCase().includes(busca.toLowerCase()) ||
      f.tipo_veiculo?.toLowerCase().includes(busca.toLowerCase())
    
    const matchModalidade = filtroModalidade === 'todos' || f.modalidade === filtroModalidade

    return matchBusca && matchModalidade
  })

  const abrirModal = (frete = null) => {
    if (frete) {
      setEditando(frete)
      
      // Extrair tipo base do tipo_veiculo
      // Ex: "Truck 14t - SEM DESCARGA" -> "Truck 14t"
      const tipoBase = frete.tipo_veiculo?.split(' - ')[0] || 'Truck 14t'
      
      setFormData({
        cidade: frete.cidade || '',
        modalidade: frete.modalidade || 'CIF_SEM_DESCARGA',
        tipo_base: tipoBase,
        preco_fixo: frete.preco_fixo || '',
        capacidade_kg: frete.capacidade_kg || '',
        ativo: frete.ativo !== false
      })
    } else {
      setEditando(null)
      setFormData({
        cidade: '',
        modalidade: 'CIF_SEM_DESCARGA',
        tipo_base: 'Truck 14t',
        preco_fixo: '',
        capacidade_kg: capacidadesVeiculo['Truck 14t'].toString(),
        ativo: true
      })
    }
    setErros({})
    setMostrarModal(true)
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setEditando(null)
    setErros({})
  }

  const construirTipoVeiculo = (tipoBase, modalidade) => {
    const sufixo = modalidade === 'CIF_COM_DESCARGA' ? 'COM DESCARGA' : 'SEM DESCARGA'
    return `${tipoBase} - ${sufixo}`
  }

  const validarForm = () => {
    const novosErros = {}

    if (!formData.cidade?.trim()) {
      novosErros.cidade = 'Campo obrigatório'
    }

    if (!formData.modalidade) {
      novosErros.modalidade = 'Campo obrigatório'
    }

    if (!formData.tipo_base) {
      novosErros.tipo_base = 'Campo obrigatório'
    }

    if (!formData.preco_fixo || parseFloat(formData.preco_fixo) <= 0) {
      novosErros.preco_fixo = 'Preço deve ser maior que zero'
    }

    if (!formData.capacidade_kg || parseInt(formData.capacidade_kg) <= 0) {
      novosErros.capacidade_kg = 'Capacidade deve ser maior que zero'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const verificarDuplicata = async (cidade, tipoVeiculo, modalidade) => {
    const { data } = await supabase
      .from('fretes')
      .select('id')
      .eq('cidade', cidade)
      .eq('tipo_veiculo', tipoVeiculo)
      .eq('modalidade', modalidade)
      .single()

    return data
  }

  const salvar = async () => {
    if (!validarForm()) return

    try {
      setSalvando(true)

      const tipoVeiculo = construirTipoVeiculo(formData.tipo_base, formData.modalidade)

      const dados = {
        cidade: formData.cidade.trim().toUpperCase(),
        modalidade: formData.modalidade,
        tipo_veiculo: tipoVeiculo,
        preco_fixo: parseFloat(formData.preco_fixo),
        capacidade_kg: parseInt(formData.capacidade_kg),
        ativo: formData.ativo
      }

      if (editando) {
        console.log('📝 Atualizando frete:', editando.id)
        
        // Verificar duplicata (excluindo o registro atual)
        const { data: duplicata } = await supabase
          .from('fretes')
          .select('id')
          .eq('cidade', dados.cidade)
          .eq('tipo_veiculo', dados.tipo_veiculo)
          .eq('modalidade', dados.modalidade)
          .neq('id', editando.id)
          .single()

        if (duplicata) {
          alert('Já existe um frete cadastrado para esta cidade + modalidade + tipo de veículo!')
          return
        }

        const { error } = await supabase
          .from('fretes')
          .update(dados)
          .eq('id', editando.id)

        if (error) throw error
        console.log('✅ Frete atualizado!')
        alert('Frete atualizado com sucesso!')
      } else {
        console.log('✨ Criando novo frete')
        
        // Verificar duplicata
        const duplicata = await verificarDuplicata(dados.cidade, dados.tipo_veiculo, dados.modalidade)
        
        if (duplicata) {
          alert('Já existe um frete cadastrado para esta cidade + modalidade + tipo de veículo!')
          return
        }

        const { error } = await supabase
          .from('fretes')
          .insert([dados])

        if (error) throw error
        console.log('✅ Frete criado!')
        alert('Frete criado com sucesso!')
      }

      fecharModal()
      carregarFretes()
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      alert('Erro ao salvar frete: ' + error.message)
    } finally {
      setSalvando(false)
    }
  }

  const toggleAtivo = async (frete) => {
    const novoStatus = !frete.ativo
    const acao = novoStatus ? 'ativar' : 'desativar'
    
    if (!confirm(`Deseja ${acao} o frete para "${frete.cidade}"?`)) return

    try {
      console.log(`🔄 ${acao} frete:`, frete.id)
      
      const { error } = await supabase
        .from('fretes')
        .update({ ativo: novoStatus })
        .eq('id', frete.id)

      if (error) throw error

      console.log(`✅ Frete ${novoStatus ? 'ativado' : 'desativado'}!`)
      carregarFretes()
    } catch (error) {
      console.error('❌ Erro:', error)
      alert(`Erro ao ${acao} frete: ` + error.message)
    }
  }

  const getModalidadeLabel = (modalidade) => {
    const labels = {
      'CIF_SEM_DESCARGA': 'CIF - Sem Descarga',
      'CIF_COM_DESCARGA': 'CIF - Com Descarga'
    }
    return labels[modalidade] || modalidade
  }

  const getModalidadeColor = (modalidade) => {
    const colors = {
      'CIF_SEM_DESCARGA': 'bg-blue-100 text-blue-800',
      'CIF_COM_DESCARGA': 'bg-purple-100 text-purple-800'
    }
    return colors[modalidade] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gerenciar Frete</h2>
          <p className="text-sm text-gray-600">
            {fretes.length} rotas cadastradas ({fretes.filter(f => f.ativo).length} ativas)
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Nova Rota
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por cidade ou tipo de veículo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={filtroModalidade}
          onChange={(e) => setFiltroModalidade(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="todos">Todas Modalidades</option>
          <option value="CIF_SEM_DESCARGA">CIF - Sem Descarga</option>
          <option value="CIF_COM_DESCARGA">CIF - Com Descarga</option>
        </select>
      </div>

      {/* Lista de Fretes */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando fretes...</div>
      ) : fretesFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <Truck className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-500">
            {busca || filtroModalidade !== 'todos' ? 'Nenhum frete encontrado' : 'Nenhum frete cadastrado'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {fretesFiltrados.map((frete) => (
            <div
              key={frete.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                frete.ativo ? 'border-gray-200' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck size={20} className="text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {frete.cidade}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getModalidadeColor(frete.modalidade)}`}>
                      {getModalidadeLabel(frete.modalidade)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        frete.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {frete.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Veículo:</span>
                      <p className="font-medium">{frete.tipo_veiculo}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Capacidade:</span>
                      <p className="font-medium">{(frete.capacidade_kg / 1000).toFixed(1)} ton</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Preço Fixo:</span>
                      <p className="font-medium text-green-600">
                        R$ {parseFloat(frete.preco_fixo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Preço/ton:</span>
                      <p className="font-medium text-gray-500">
                        R$ {(parseFloat(frete.preco_fixo) / (frete.capacidade_kg / 1000)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => abrirModal(frete)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => toggleAtivo(frete)}
                    className={`p-2 rounded-lg transition-colors ${
                      frete.ativo
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={frete.ativo ? 'Desativar' : 'Ativar'}
                  >
                    <Power size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {editando ? 'Editar Frete' : 'Nova Rota de Frete'}
              </h3>
              <button
                onClick={fecharModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Cidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value.toUpperCase() })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                    erros.cidade ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: BELO HORIZONTE"
                />
                {erros.cidade && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {erros.cidade}
                  </p>
                )}
              </div>

              {/* Modalidade e Tipo de Veículo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modalidade *
                  </label>
                  <select
                    value={formData.modalidade}
                    onChange={(e) => setFormData({ ...formData, modalidade: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      erros.modalidade ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="CIF_SEM_DESCARGA">CIF - Sem Descarga</option>
                    <option value="CIF_COM_DESCARGA">CIF - Com Descarga</option>
                  </select>
                  {erros.modalidade && (
                    <p className="text-red-600 text-sm mt-1">{erros.modalidade}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Veículo *
                  </label>
                  <select
                    value={formData.tipo_base}
                    onChange={(e) => setFormData({ ...formData, tipo_base: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      erros.tipo_base ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {tiposVeiculo.map(v => (
                      <option key={v.valor} value={v.valor}>
                        {v.nome} ({(v.capacidade / 1000).toFixed(0)} ton)
                      </option>
                    ))}
                  </select>
                  {erros.tipo_base && (
                    <p className="text-red-600 text-sm mt-1">{erros.tipo_base}</p>
                  )}
                </div>
              </div>

              {/* Preview do Tipo Completo */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-900">
                  <strong>Tipo Completo:</strong> {construirTipoVeiculo(formData.tipo_base, formData.modalidade)}
                </p>
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
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      erros.preco_fixo ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {erros.preco_fixo && (
                    <p className="text-red-600 text-sm mt-1">{erros.preco_fixo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidade (kg) *
                  </label>
                  <input
                    type="number"
                    value={formData.capacidade_kg}
                    onChange={(e) => setFormData({ ...formData, capacidade_kg: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      erros.capacidade_kg ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="14000"
                  />
                  {erros.capacidade_kg && (
                    <p className="text-red-600 text-sm mt-1">{erros.capacidade_kg}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.capacidade_kg ? `${(parseInt(formData.capacidade_kg) / 1000).toFixed(1)} toneladas` : '-'}
                  </p>
                </div>
              </div>

              {/* Cálculo Automático */}
              {formData.preco_fixo && formData.capacidade_kg && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Preço por tonelada:</strong> R$ {(parseFloat(formData.preco_fixo) / (parseInt(formData.capacidade_kg) / 1000)).toFixed(2)}
                  </p>
                </div>
              )}

              {/* Ativo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  className="w-4 h-4 text-purple-600"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                  Rota ativa (disponível para orçamentos)
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={fecharModal}
                disabled={salvando}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Save size={20} />
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
