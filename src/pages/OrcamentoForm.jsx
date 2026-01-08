import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, X } from 'lucide-react'
import { supabase } from '../services/supabase'

export default function OrcamentoForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [produtosSelecionados, setProdutosSelecionados] = useState([])
  
  const [formData, setFormData] = useState({
    numero: '',
    cliente_nome: '',
    cliente_empresa: '',
    cliente_email: '',
    cliente_telefone: '',
    cliente_cpf_cnpj: '',
    vendedor: '',
    data_orcamento: new Date().toISOString().split('T')[0],
    validade_dias: 15,
    data_validade: '',
    condicoes_pagamento: '',
    prazo_entrega: '',
    desconto_geral: 0,
    frete: 0,
    observacoes: '',
    status: 'rascunho'
  })

  useEffect(() => {
    carregarProdutos()
    calcularDataValidade()
    if (id) {
      carregarOrcamento()
    } else {
      gerarNumero()
    }
  }, [id])

  useEffect(() => {
    calcularDataValidade()
  }, [formData.data_orcamento, formData.validade_dias])

  const calcularDataValidade = () => {
    if (formData.data_orcamento && formData.validade_dias) {
      const dataOrc = new Date(formData.data_orcamento)
      dataOrc.setDate(dataOrc.getDate() + parseInt(formData.validade_dias))
      setFormData(prev => ({
        ...prev,
        data_validade: dataOrc.toISOString().split('T')[0]
      }))
    }
  }

  const gerarNumero = async () => {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('numero')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      let novoNumero = 'ORC-0001'
      if (data && data.length > 0) {
        const ultimoNumero = data[0].numero
        const numero = parseInt(ultimoNumero.split('-')[1]) + 1
        novoNumero = `ORC-${numero.toString().padStart(4, '0')}`
      }

      setFormData(prev => ({ ...prev, numero: novoNumero }))
    } catch (error) {
      console.error('Erro ao gerar número:', error)
    }
  }

  const carregarProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('ativo', true)
        .order('produto')

      if (error) throw error
      setProdutos(data || [])
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const carregarOrcamento = async () => {
    try {
      setLoading(true)
      
      const { data: orc, error: errorOrc } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single()

      if (errorOrc) throw errorOrc

      setFormData({
        numero: orc.numero,
        cliente_nome: orc.cliente_nome || '',
        cliente_empresa: orc.cliente_empresa || '',
        cliente_email: orc.cliente_email || '',
        cliente_telefone: orc.cliente_telefone || '',
        cliente_cpf_cnpj: orc.cliente_cpf_cnpj || '',
        vendedor: orc.vendedor || '',
        data_orcamento: orc.data_orcamento || '',
        validade_dias: orc.validade_dias || 15,
        data_validade: orc.data_validade || '',
        condicoes_pagamento: orc.condicoes_pagamento || '',
        prazo_entrega: orc.prazo_entrega || '',
        desconto_geral: orc.desconto_geral || 0,
        frete: orc.frete || 0,
        observacoes: orc.observacoes || '',
        status: orc.status || 'rascunho'
      })

      const { data: itens, error: errorItens } = await supabase
        .from('orcamentos_itens')
        .select('*')
        .eq('orcamento_id', id)

      if (errorItens) throw errorItens

      if (itens && itens.length > 0) {
        setProdutosSelecionados(itens.map(item => ({
          produto_id: item.produto_id,
          codigo: item.produto_codigo,
          nome: item.produto,
          classe: item.classe,
          mpa: item.mpa,
          quantidade: item.quantidade,
          preco: item.preco_unitario,
          peso_unitario: item.peso_unitario,
          qtd_por_pallet: item.qtd_por_pallet
        })))
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error)
      alert('Erro ao carregar orçamento')
    } finally {
      setLoading(false)
    }
  }

  const adicionarProduto = () => {
    setProdutosSelecionados([...produtosSelecionados, {
      produto_id: '',
      codigo: '',
      nome: '',
      classe: '',
      mpa: '',
      quantidade: 1,
      preco: 0,
      peso_unitario: 0,
      qtd_por_pallet: 0
    }])
  }

  const removerProduto = (index) => {
    setProdutosSelecionados(produtosSelecionados.filter((_, i) => i !== index))
  }

  const atualizarProduto = (index, campo, valor) => {
    const novos = [...produtosSelecionados]
    
    if (campo === 'produto_id') {
      const produto = produtos.find(p => p.id === valor)
      if (produto) {
        novos[index] = {
          ...novos[index],
          produto_id: produto.id,
          codigo: produto.codigo_sistema,
          nome: produto.produto,
          classe: produto.classe,
          mpa: produto.mpa,
          preco: produto.preco,
          peso_unitario: produto.peso_unitario,
          qtd_por_pallet: produto.qtd_por_pallet
        }
      }
    } else {
      novos[index] = { ...novos[index], [campo]: valor }
    }
    
    setProdutosSelecionados(novos)
  }

  const calcularSubtotal = () => {
    return produtosSelecionados.reduce((sum, item) => {
      const precoComDesconto = item.preco * (1 - (formData.desconto_geral || 0) / 100)
      return sum + (item.quantidade * precoComDesconto)
    }, 0)
  }

  const calcularTotal = () => {
    return calcularSubtotal() + parseFloat(formData.frete || 0)
  }

  const salvar = async () => {
    try {
      if (!formData.numero || !formData.cliente_nome) {
        alert('Preencha os campos obrigatórios!')
        return
      }

      if (produtosSelecionados.length === 0) {
        alert('Adicione pelo menos um produto!')
        return
      }

      setLoading(true)

      const subtotal = calcularSubtotal()
      const total = calcularTotal()

      const dadosOrcamento = {
        numero: formData.numero,
        cliente_nome: formData.cliente_nome,
        cliente_empresa: formData.cliente_empresa,
        cliente_email: formData.cliente_email,
        cliente_telefone: formData.cliente_telefone,
        cliente_cpf_cnpj: formData.cliente_cpf_cnpj,
        vendedor: formData.vendedor,
        data_orcamento: formData.data_orcamento,
        validade_dias: parseInt(formData.validade_dias),
        data_validade: formData.data_validade,
        condicoes_pagamento: formData.condicoes_pagamento,
        prazo_entrega: formData.prazo_entrega,
        desconto_geral: parseFloat(formData.desconto_geral),
        frete: parseFloat(formData.frete),
        subtotal,
        total,
        observacoes: formData.observacoes,
        status: formData.status
      }

      let orcamentoId = id

      if (id) {
        // Atualizar existente
        const { error } = await supabase
          .from('orcamentos')
          .update(dadosOrcamento)
          .eq('id', id)

        if (error) throw error

        // Deletar itens antigos
        await supabase
          .from('orcamentos_itens')
          .delete()
          .eq('orcamento_id', id)
      } else {
        // Criar novo
        const { data, error } = await supabase
          .from('orcamentos')
          .insert([dadosOrcamento])
          .select()
          .single()

        if (error) throw error
        orcamentoId = data.id
      }

      // Inserir itens
      const itens = produtosSelecionados.map((item, index) => ({
        orcamento_id: orcamentoId,
        produto_id: item.produto_id,
        produto_codigo: item.codigo,
        produto: item.nome,
        classe: item.classe,
        mpa: item.mpa,
        quantidade: parseInt(item.quantidade),
        preco_unitario: parseFloat(item.preco),
        peso_unitario: parseFloat(item.peso_unitario),
        qtd_por_pallet: parseInt(item.qtd_por_pallet),
        subtotal: item.quantidade * item.preco * (1 - (formData.desconto_geral || 0) / 100),
        ordem: index
      }))

      const { error: errorItens } = await supabase
        .from('orcamentos_itens')
        .insert(itens)

      if (errorItens) throw errorItens

      alert('Orçamento salvo com sucesso!')
      navigate('/orcamentos')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/orcamentos')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {id ? 'Editar Orçamento' : 'Novo Orçamento'}
              </h1>
            </div>
            <button
              onClick={salvar}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={20} />
              Salvar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Dados do Orçamento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Dados do Orçamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
              <input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={!!id}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input
                type="date"
                value={formData.data_orcamento}
                onChange={(e) => setFormData({ ...formData, data_orcamento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
              <input
                type="text"
                value={formData.vendedor}
                onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validade (dias)</label>
              <input
                type="number"
                value={formData.validade_dias}
                onChange={(e) => setFormData({ ...formData, validade_dias: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Válido até</label>
              <input
                type="date"
                value={formData.data_validade}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="rascunho">Rascunho</option>
                <option value="enviado">Enviado</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Dados do Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={formData.cliente_nome}
                onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <input
                type="text"
                value={formData.cliente_empresa}
                onChange={(e) => setFormData({ ...formData, cliente_empresa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
              <input
                type="text"
                value={formData.cliente_cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cliente_cpf_cnpj: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="text"
                value={formData.cliente_telefone}
                onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.cliente_email}
                onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Produtos</h2>
            <button
              onClick={adicionarProduto}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>

          {produtosSelecionados.map((item, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3 pb-3 border-b border-gray-200">
              <div className="md:col-span-4">
                <select
                  value={item.produto_id}
                  onChange={(e) => atualizarProduto(index, 'produto_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Selecione...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.codigo_sistema}] {p.produto} - {p.classe} - {p.mpa}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  value={item.quantidade}
                  onChange={(e) => atualizarProduto(index, 'quantidade', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Qtd"
                  min="1"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  step="0.01"
                  value={item.preco}
                  onChange={(e) => atualizarProduto(index, 'preco', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="Preço"
                />
              </div>
              <div className="md:col-span-3">
                <input
                  type="text"
                  value={`R$ ${(item.quantidade * item.preco * (1 - (formData.desconto_geral || 0) / 100)).toFixed(2)}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                />
              </div>
              <div className="md:col-span-1 flex items-center justify-center">
                <button
                  onClick={() => removerProduto(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totais */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desconto Geral (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.desconto_geral}
                onChange={(e) => setFormData({ ...formData, desconto_geral: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frete (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.frete}
                onChange={(e) => setFormData({ ...formData, frete: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <input
                type="text"
                value={`R$ ${calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 font-semibold text-lg"
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Observações</h2>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Observações adicionais..."
          />
        </div>
      </div>
    </div>
  )
}
