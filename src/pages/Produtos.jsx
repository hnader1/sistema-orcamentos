import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Plus, Search, Edit2, Trash2, Save, X } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function Produtos() {
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState(null)
  const [novoProduto, setNovoProduto] = useState(false)
  const [formData, setFormData] = useState({
    codigo_sistema: '',
    produto: '',
    classe: '',
    mpa: '',
    preco: '',
    peso_unitario: '',
    qtd_por_pallet: '',
    peso_pallet: ''
  })

  useEffect(() => {
    carregarProdutos()
  }, [])

  useEffect(() => {
    // Calcular peso do pallet automaticamente
    const peso = parseFloat(formData.peso_unitario) || 0
    const qtd = parseFloat(formData.qtd_por_pallet) || 0
    setFormData(prev => ({
      ...prev,
      peso_pallet: (peso * qtd).toFixed(2)
    }))
  }, [formData.peso_unitario, formData.qtd_por_pallet])

  const carregarProdutos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('codigo_sistema', { ascending: true })

      if (error) throw error
      setProdutos(data || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
      alert('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const produtosFiltrados = produtos.filter(p =>
    p.produto.toLowerCase().includes(busca.toLowerCase()) ||
    p.classe.toLowerCase().includes(busca.toLowerCase()) ||
    p.mpa.toLowerCase().includes(busca.toLowerCase()) ||
    p.codigo_sistema.toLowerCase().includes(busca.toLowerCase())
  )

  const iniciarEdicao = (produto) => {
    setEditando(produto.id)
    setFormData({
      codigo_sistema: produto.codigo_sistema,
      produto: produto.produto,
      classe: produto.classe,
      mpa: produto.mpa,
      preco: produto.preco,
      peso_unitario: produto.peso_unitario,
      qtd_por_pallet: produto.qtd_por_pallet,
      peso_pallet: produto.peso_pallet
    })
    setNovoProduto(false)
  }

  const iniciarNovo = () => {
    setNovoProduto(true)
    setEditando(null)
    setFormData({
      codigo_sistema: '',
      produto: '',
      classe: '',
      mpa: '',
      preco: '',
      peso_unitario: '',
      qtd_por_pallet: '',
      peso_pallet: ''
    })
  }

  const cancelar = () => {
    setEditando(null)
    setNovoProduto(false)
    setFormData({
      codigo_sistema: '',
      produto: '',
      classe: '',
      mpa: '',
      preco: '',
      peso_unitario: '',
      qtd_por_pallet: '',
      peso_pallet: ''
    })
  }

  const salvar = async () => {
    try {
      // Validação
      if (!formData.codigo_sistema || !formData.produto || !formData.classe || !formData.mpa || !formData.preco) {
        alert('Preencha todos os campos obrigatórios!')
        return
      }

      const dadosProduto = {
        codigo_sistema: formData.codigo_sistema,
        produto: formData.produto,
        classe: formData.classe,
        mpa: formData.mpa,
        preco: parseFloat(formData.preco),
        peso_unitario: parseFloat(formData.peso_unitario) || 0,
        qtd_por_pallet: parseInt(formData.qtd_por_pallet) || 0,
        peso_pallet: parseFloat(formData.peso_pallet) || 0,
        ativo: true
      }

      if (novoProduto) {
        // Criar novo
        const { error } = await supabase
          .from('produtos')
          .insert([dadosProduto])

        if (error) throw error
        alert('Produto criado com sucesso!')
      } else {
        // Atualizar existente
        const { error } = await supabase
          .from('produtos')
          .update(dadosProduto)
          .eq('id', editando)

        if (error) throw error
        alert('Produto atualizado com sucesso!')
      }

      cancelar()
      carregarProdutos()
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar produto: ' + error.message)
    }
  }

  const excluir = async (id, nome) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) return

    try {
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id)

      if (error) throw error
      alert('Produto excluído com sucesso!')
      carregarProdutos()
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir produto')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
                  <p className="text-xs sm:text-sm text-gray-500">{produtos.length} produtos cadastrados ({produtosFiltrados.length} ativos)</p>
                </div>
              </div>
            </div>
            <button
              onClick={iniciarNovo}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Novo Produto</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Busca */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por produto, classe, MPA ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Formulário Novo/Editar */}
        {(novoProduto || editando) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {novoProduto ? 'Novo Produto' : 'Editar Produto'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Sistema *
                </label>
                <input
                  type="text"
                  value={formData.codigo_sistema}
                  onChange={(e) => setFormData({ ...formData, codigo_sistema: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 23208"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Produto *
                </label>
                <input
                  type="text"
                  value={formData.produto}
                  onChange={(e) => setFormData({ ...formData, produto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 1540"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Classe *
                </label>
                <input
                  type="text"
                  value={formData.classe}
                  onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: C"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MPA *
                </label>
                <input
                  type="text"
                  value={formData.mpa}
                  onChange={(e) => setFormData({ ...formData, mpa: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: 4,5 MPA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Unitário (kg)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.peso_unitario}
                  onChange={(e) => setFormData({ ...formData, peso_unitario: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qtd por Pallet
                </label>
                <input
                  type="number"
                  value={formData.qtd_por_pallet}
                  onChange={(e) => setFormData({ ...formData, qtd_por_pallet: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Pallet (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.peso_pallet}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  placeholder="Calculado"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={salvar}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Save size={20} />
                Salvar
              </button>
              <button
                onClick={cancelar}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                <X size={20} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Tabela Compacta */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          ) : produtosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {busca ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Produto</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Classe</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">MPa</th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Código</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Preço</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Peso</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qtd/Pallet</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {produtosFiltrados.map((produto) => (
                    <tr key={produto.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-3 py-2 font-medium text-gray-900">{produto.produto}</td>
                      <td className="px-3 py-2 text-gray-600">{produto.classe}</td>
                      <td className="px-3 py-2 text-gray-600">{produto.mpa}</td>
                      <td className="px-3 py-2 text-gray-500">{produto.codigo_sistema}</td>
                      <td className="px-3 py-2 text-right font-medium text-green-600">R$ {parseFloat(produto.preco).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{produto.peso_unitario} kg</td>
                      <td className="px-3 py-2 text-right text-gray-600">{produto.qtd_por_pallet}</td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => iniciarEdicao(produto)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => excluir(produto.id, produto.produto)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}