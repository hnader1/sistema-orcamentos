import { useState, useEffect } from 'react'
import { Plus, Edit2, Power, Search, X, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../../services/supabase'

export default function ProdutosAdmin() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [salvando, setSalvando] = useState(false)

  const [formData, setFormData] = useState({
    produto: '',
    classe: '',
    mpa: '',
    codigo_sistema: '',
    preco: '',
    peso_unitario: '',
    qtd_por_pallet: '',
    peso_pallet: '',
    ativo: true
  })

  const [erros, setErros] = useState({})

  useEffect(() => {
    carregarProdutos()
  }, [])

  const carregarProdutos = async () => {
    try {
      setLoading(true)
      console.log('📦 Carregando produtos...')

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('produto', { ascending: true })

      if (error) throw error

      console.log('✅ Produtos carregados:', data?.length || 0)
      setProdutos(data || [])
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error)
      alert('Erro ao carregar produtos: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const produtosFiltrados = produtos.filter(p => {
    if (!busca) return true
    const buscaLower = busca.toLowerCase()
    return (
      p.produto?.toLowerCase().includes(buscaLower) ||
      p.classe?.toLowerCase().includes(buscaLower) ||
      p.mpa?.toLowerCase().includes(buscaLower) ||
      p.codigo_sistema?.toLowerCase().includes(buscaLower)
    )
  })

  const abrirModal = (produto = null) => {
    if (produto) {
      setEditando(produto)
      setFormData({
        produto: produto.produto || '',
        classe: produto.classe || '',
        mpa: produto.mpa || '',
        codigo_sistema: produto.codigo_sistema || '',
        preco: produto.preco || '',
        peso_unitario: produto.peso_unitario || '',
        qtd_por_pallet: produto.qtd_por_pallet || '',
        peso_pallet: produto.peso_pallet || '',
        ativo: produto.ativo !== false
      })
    } else {
      setEditando(null)
      setFormData({
        produto: '',
        classe: '',
        mpa: '',
        codigo_sistema: '',
        preco: '',
        peso_unitario: '',
        qtd_por_pallet: '',
        peso_pallet: '',
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

  const validarForm = () => {
    const novosErros = {}

    if (!formData.produto?.trim()) novosErros.produto = 'Campo obrigatório'
    if (!formData.classe?.trim()) novosErros.classe = 'Campo obrigatório'
    if (!formData.mpa?.trim()) novosErros.mpa = 'Campo obrigatório'
    if (!formData.codigo_sistema?.trim()) novosErros.codigo_sistema = 'Campo obrigatório'
    
    if (!formData.preco || parseFloat(formData.preco) <= 0) {
      novosErros.preco = 'Preço deve ser maior que zero'
    }
    if (!formData.peso_unitario || parseFloat(formData.peso_unitario) <= 0) {
      novosErros.peso_unitario = 'Peso deve ser maior que zero'
    }
    if (!formData.qtd_por_pallet || parseFloat(formData.qtd_por_pallet) <= 0) {
      novosErros.qtd_por_pallet = 'Quantidade deve ser maior que zero'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const salvar = async () => {
    if (!validarForm()) return

    try {
      setSalvando(true)

      // Calcular peso_pallet automaticamente
      const pesoUnitario = parseFloat(formData.peso_unitario)
      const qtdPorPallet = parseFloat(formData.qtd_por_pallet)
      const pesoPallet = pesoUnitario * qtdPorPallet

      const dados = {
        produto: formData.produto.trim(),
        classe: formData.classe.trim(),
        mpa: formData.mpa.trim(),
        codigo_sistema: formData.codigo_sistema.trim(),
        preco: parseFloat(formData.preco),
        peso_unitario: pesoUnitario,
        qtd_por_pallet: qtdPorPallet,
        peso_pallet: pesoPallet,
        ativo: formData.ativo
      }

      if (editando) {
        console.log('📝 Atualizando produto:', editando.id)
        const { error } = await supabase
          .from('produtos')
          .update(dados)
          .eq('id', editando.id)

        if (error) throw error
        console.log('✅ Produto atualizado!')
        alert('Produto atualizado com sucesso!')
      } else {
        console.log('✨ Criando novo produto')
        const { error } = await supabase
          .from('produtos')
          .insert([dados])

        if (error) throw error
        console.log('✅ Produto criado!')
        alert('Produto criado com sucesso!')
      }

      fecharModal()
      carregarProdutos()
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      alert('Erro ao salvar produto: ' + error.message)
    } finally {
      setSalvando(false)
    }
  }

  const toggleAtivo = async (produto) => {
    const novoStatus = !produto.ativo
    const acao = novoStatus ? 'ativar' : 'desativar'
    
    if (!confirm(`Deseja ${acao} o produto "${produto.produto}"?`)) return

    try {
      console.log(`🔄 ${acao} produto:`, produto.id)
      
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: novoStatus })
        .eq('id', produto.id)

      if (error) throw error

      console.log(`✅ Produto ${novoStatus ? 'ativado' : 'desativado'}!`)
      carregarProdutos()
    } catch (error) {
      console.error('❌ Erro:', error)
      alert(`Erro ao ${acao} produto: ` + error.message)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Gerenciar Produtos</h2>
          <p className="text-sm text-gray-600">
            {produtos.length} produtos cadastrados ({produtos.filter(p => p.ativo).length} ativos)
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por produto, classe, MPA ou código..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de Produtos */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Carregando produtos...</div>
      ) : produtosFiltrados.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className={`bg-white border rounded-lg p-4 hover:shadow-md transition-shadow ${
                produto.ativo ? 'border-gray-200' : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {produto.produto}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        produto.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Classe:</span>
                      <p className="font-medium">{produto.classe}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">MPa:</span>
                      <p className="font-medium">{produto.mpa}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Código:</span>
                      <p className="font-medium">{produto.codigo_sistema}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Preço:</span>
                      <p className="font-medium text-green-600">
                        R$ {parseFloat(produto.preco).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Peso Unit.:</span>
                      <p className="font-medium">{produto.peso_unitario} kg</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Qtd/Pallet:</span>
                      <p className="font-medium">{produto.qtd_por_pallet} un</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => abrirModal(produto)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => toggleAtivo(produto)}
                    className={`p-2 rounded-lg transition-colors ${
                      produto.ativo
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={produto.ativo ? 'Desativar' : 'Ativar'}
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
                {editando ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={fecharModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Produto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto *
                </label>
                <input
                  type="text"
                  value={formData.produto}
                  onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    erros.produto ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Bloco de Concreto"
                />
                {erros.produto && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {erros.produto}
                  </p>
                )}
              </div>

              {/* Classe e MPa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classe *
                  </label>
                  <input
                    type="text"
                    value={formData.classe}
                    onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      erros.classe ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: A"
                  />
                  {erros.classe && (
                    <p className="text-red-600 text-sm mt-1">{erros.classe}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MPa *
                  </label>
                  <input
                    type="text"
                    value={formData.mpa}
                    onChange={(e) => setFormData({ ...formData, mpa: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      erros.mpa ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 4,5"
                  />
                  {erros.mpa && (
                    <p className="text-red-600 text-sm mt-1">{erros.mpa}</p>
                  )}
                </div>
              </div>

              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código do Sistema *
                </label>
                <input
                  type="text"
                  value={formData.codigo_sistema}
                  onChange={(e) => setFormData({ ...formData, codigo_sistema: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    erros.codigo_sistema ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: BL001"
                />
                {erros.codigo_sistema && (
                  <p className="text-red-600 text-sm mt-1">{erros.codigo_sistema}</p>
                )}
              </div>

              {/* Preço, Peso e Quantidade */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      erros.preco ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {erros.preco && (
                    <p className="text-red-600 text-sm mt-1">{erros.preco}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso Unit. (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.peso_unitario}
                    onChange={(e) => setFormData({ ...formData, peso_unitario: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      erros.peso_unitario ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {erros.peso_unitario && (
                    <p className="text-red-600 text-sm mt-1">{erros.peso_unitario}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qtd/Pallet *
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.qtd_por_pallet}
                    onChange={(e) => setFormData({ ...formData, qtd_por_pallet: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                      erros.qtd_por_pallet ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {erros.qtd_por_pallet && (
                    <p className="text-red-600 text-sm mt-1">{erros.qtd_por_pallet}</p>
                  )}
                </div>
              </div>

              {/* Preview Peso do Pallet */}
              {formData.peso_unitario && formData.qtd_por_pallet && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Peso do Pallet (calculado):</strong> {(parseFloat(formData.peso_unitario) * parseFloat(formData.qtd_por_pallet)).toFixed(2)} kg
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
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-gray-700">
                  Produto ativo (disponível para orçamentos)
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
