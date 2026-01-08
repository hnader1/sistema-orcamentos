import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../services/supabase'
import FreteSelector from '../components/FreteSelector'

export default function OrcamentoForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [produtosSelecionados, setProdutosSelecionados] = useState([])
  const [dadosFrete, setDadosFrete] = useState(null)
  
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
        observacoes: orc.observacoes || '',
        status: orc.status || 'rascunho'
      })

      // Carregar dados do frete se existirem
      if (orc.frete_cidade) {
        setDadosFrete({
          cidade: orc.frete_cidade,
          tipo_veiculo: orc.frete_tipo_veiculo,
          modalidade: orc.frete_modalidade || 'CIF',
          valor_total_frete: orc.frete || 0
        })
      }

      const { data: itens, error: errorItens } = await supabase
        .from('orcamentos_itens')
        .select('*')
        .eq('orcamento_id', id)

      if (errorItens) throw errorItens

      if (itens && itens.length > 0) {
        setProdutosSelecionados(itens.map(item => ({
          produto_id: item.produto_id,
          codigo: item.produto_codigo,
          produto: item.produto,
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

  // Funções para seleção em cascata
  const getProdutosUnicos = () => {
    const unicos = [...new Set(produtos.map(p => p.produto))]
    return unicos.sort()
  }

  const getClassesDisponiveis = (nomeProduto) => {
    if (!nomeProduto) return []
    const classes = [...new Set(
      produtos
        .filter(p => p.produto === nomeProduto)
        .map(p => p.classe)
    )]
    return classes.sort()
  }

  const getMPAsDisponiveis = (nomeProduto, classe) => {
    if (!nomeProduto || !classe) return []
    const mpas = [...new Set(
      produtos
        .filter(p => p.produto === nomeProduto && p.classe === classe)
        .map(p => p.mpa)
    )]
    return mpas.sort()
  }

  const getProdutoCompleto = (nomeProduto, classe, mpa) => {
    return produtos.find(p => 
      p.produto === nomeProduto && 
      p.classe === classe && 
      p.mpa === mpa
    )
  }

  const adicionarProduto = () => {
    setProdutosSelecionados([...produtosSelecionados, {
      produto_id: '',
      codigo: '',
      produto: '',
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
    
    if (campo === 'produto') {
      novos[index] = {
        ...novos[index],
        produto: valor,
        classe: '',
        mpa: '',
        produto_id: '',
        codigo: '',
        preco: 0,
        peso_unitario: 0,
        qtd_por_pallet: 0
      }
    } else if (campo === 'classe') {
      novos[index] = {
        ...novos[index],
        classe: valor,
        mpa: '',
        produto_id: '',
        codigo: '',
        preco: 0,
        peso_unitario: 0,
        qtd_por_pallet: 0
      }
    } else if (campo === 'mpa') {
      const produtoCompleto = getProdutoCompleto(
        novos[index].produto,
        novos[index].classe,
        valor
      )
      
      if (produtoCompleto) {
        novos[index] = {
          ...novos[index],
          mpa: valor,
          produto_id: produtoCompleto.id,
          codigo: produtoCompleto.codigo_sistema,
          preco: produtoCompleto.preco,
          peso_unitario: produtoCompleto.peso_unitario,
          qtd_por_pallet: produtoCompleto.qtd_por_pallet
        }
      }
    } else {
      novos[index] = { ...novos[index], [campo]: valor }
    }
    
    setProdutosSelecionados(novos)
  }

  // Cálculo de peso total para o frete
  const calcularPesoTotal = () => {
    return produtosSelecionados.reduce((sum, item) => {
      const pesoItem = parseFloat(item.peso_unitario) || 0
      const quantidade = parseInt(item.quantidade) || 0
      return sum + (pesoItem * quantidade)
    }, 0)
  }

  // Cálculo de pallets total
  const calcularTotalPallets = () => {
    return produtosSelecionados.reduce((sum, item) => {
      const quantidade = parseInt(item.quantidade) || 0
      const qtdPorPallet = parseInt(item.qtd_por_pallet) || 1
      return sum + (quantidade / qtdPorPallet)
    }, 0)
  }

  // Subtotal SEM desconto (desconto é aplicado depois)
  const calcularSubtotal = () => {
    return produtosSelecionados.reduce((sum, item) => {
      return sum + (item.quantidade * item.preco)
    }, 0)
  }

  // Total: Produtos com desconto + Frete sem desconto
  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    const desconto = (subtotal * (formData.desconto_geral || 0)) / 100
    const subtotalComDesconto = subtotal - desconto
    const frete = dadosFrete?.valor_total_frete || 0
    return subtotalComDesconto + frete
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

      const produtoIncompleto = produtosSelecionados.find(
        p => !p.produto || !p.classe || !p.mpa
      )
      if (produtoIncompleto) {
        alert('Complete a seleção de todos os produtos (Produto, Classe e MPA)!')
        return
      }

      setLoading(true)

      const subtotal = calcularSubtotal()
      const desconto = (subtotal * (formData.desconto_geral || 0)) / 100
      const subtotalComDesconto = subtotal - desconto
      const frete = dadosFrete?.valor_total_frete || 0
      const total = subtotalComDesconto + frete

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
        subtotal: subtotalComDesconto,
        frete: frete,
        frete_tipo_frete: dadosFrete?.tipo_frete || 'FOB',
        frete_tipo_caminhao: dadosFrete?.tipo_caminhao || null,
        frete_localidade: dadosFrete?.localidade || null,
        frete_cidade: dadosFrete?.localidade || null,
        total,
        observacoes: formData.observacoes,
        status: formData.status
      }

      let orcamentoId = id

      if (id) {
        const { error } = await supabase
          .from('orcamentos')
          .update(dadosOrcamento)
          .eq('id', id)

        if (error) throw error

        await supabase
          .from('orcamentos_itens')
          .delete()
          .eq('orcamento_id', id)
      } else {
        const { data, error } = await supabase
          .from('orcamentos')
          .insert([dadosOrcamento])
          .select()
          .single()

        if (error) throw error
        orcamentoId = data.id
      }

      const itens = produtosSelecionados.map((item, index) => ({
        orcamento_id: orcamentoId,
        produto_id: item.produto_id,
        produto_codigo: item.codigo,
        produto: item.produto,
        classe: item.classe,
        mpa: item.mpa,
        quantidade: parseInt(item.quantidade),
        preco_unitario: parseFloat(item.preco),
        peso_unitario: parseFloat(item.peso_unitario),
        qtd_por_pallet: parseInt(item.qtd_por_pallet),
        subtotal: item.quantidade * item.preco,
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

        {/* PRODUTOS - TABELA HORIZONTAL IGUAL AO MODELO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Produtos</h2>
            <button
              onClick={adicionarProduto}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus size={18} />
              Adicionar Produto
            </button>
          </div>

          {produtosSelecionados.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
              Clique em "Adicionar Produto" para incluir produtos no orçamento
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Cabeçalho da Tabela */}
              <div className="min-w-[1000px]">
                <div className="grid grid-cols-12 gap-2 bg-gray-100 p-3 rounded-t-lg text-xs font-semibold text-gray-600 uppercase">
                  <div className="col-span-3">Produto</div>
                  <div className="col-span-1">Classe</div>
                  <div className="col-span-1">MPa</div>
                  <div className="col-span-1 text-center">Qtd</div>
                  <div className="col-span-1 text-right">Preço Tab.</div>
                  <div className="col-span-1 text-right">Peso Unit.</div>
                  <div className="col-span-1 text-right">Peso Total</div>
                  <div className="col-span-1 text-right">Subtotal</div>
                  <div className="col-span-1 text-center">Pallets</div>
                </div>

                {/* Linhas da Tabela */}
                {produtosSelecionados.map((item, index) => (
                  <div 
                    key={index} 
                    className={`grid grid-cols-12 gap-2 p-3 items-center border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    {/* Produto */}
                    <div className="col-span-3">
                      <select
                        value={item.produto}
                        onChange={(e) => atualizarProduto(index, 'produto', e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione...</option>
                        {getProdutosUnicos().map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* Classe */}
                    <div className="col-span-1">
                      <select
                        value={item.classe}
                        onChange={(e) => atualizarProduto(index, 'classe', e.target.value)}
                        disabled={!item.produto}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">-</option>
                        {getClassesDisponiveis(item.produto).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* MPA */}
                    <div className="col-span-1">
                      <select
                        value={item.mpa}
                        onChange={(e) => atualizarProduto(index, 'mpa', e.target.value)}
                        disabled={!item.classe}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">-</option>
                        {getMPAsDisponiveis(item.produto, item.classe).map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quantidade */}
                    <div className="col-span-1">
                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => atualizarProduto(index, 'quantidade', e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>

                    {/* Preço Tab. */}
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={item.preco ? `R$ ${parseFloat(item.preco).toFixed(2)}` : '-'}
                        disabled
                        className="w-full px-2 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-right"
                      />
                    </div>

                    {/* Peso Unit. */}
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={item.peso_unitario ? `${item.peso_unitario} kg` : '-'}
                        disabled
                        className="w-full px-2 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-right"
                      />
                    </div>

                    {/* Peso Total */}
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={item.peso_unitario && item.quantidade 
                          ? `${((item.peso_unitario * item.quantidade) / 1000).toFixed(2)} ton` 
                          : '-'}
                        disabled
                        className="w-full px-2 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-right"
                      />
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-1">
                      <input
                        type="text"
                        value={item.preco && item.quantidade 
                          ? `R$ ${(item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                          : '-'}
                        disabled
                        className="w-full px-2 py-2 border border-gray-200 rounded-lg bg-yellow-50 text-sm text-right font-semibold"
                      />
                    </div>

                    {/* Pallets + Botão Remover */}
                    <div className="col-span-1 flex items-center gap-1">
                      <input
                        type="text"
                        value={item.qtd_por_pallet && item.quantidade 
                          ? (item.quantidade / item.qtd_por_pallet).toFixed(2) 
                          : '-'}
                        disabled
                        className="w-full px-2 py-2 border border-purple-200 rounded-lg bg-purple-50 text-sm text-center font-semibold text-purple-700"
                      />
                      <button
                        onClick={() => removerProduto(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg flex-shrink-0"
                        title="Remover produto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FRETE - COMPONENTE COM ANÁLISE DE CARGA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <FreteSelector 
            pesoTotal={calcularPesoTotal()}
            totalPallets={calcularTotalPallets()}
            onFreteChange={setDadosFrete}
            freteAtual={dadosFrete}
          />
        </div>

        {/* TOTAIS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="max-w-md ml-auto space-y-3">
            {/* Subtotal sem desconto */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal (sem desconto):</span>
              <span className="font-medium">
                R$ {calcularSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Desconto */}
            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600 flex items-center gap-2">
                Desconto Geral (%):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.desconto_geral}
                  onChange={(e) => setFormData({ ...formData, desconto_geral: e.target.value })}
                  className="w-20 px-3 py-2 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 text-center bg-yellow-50"
                />
              </div>
            </div>

            {/* Subtotal de Produtos */}
            <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
              <span className="text-gray-700 font-medium">Subtotal de Produtos:</span>
              <span className="font-semibold">
                R$ {(calcularSubtotal() - (calcularSubtotal() * (formData.desconto_geral || 0) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Total Produtos */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Produtos:</span>
              <span className="font-medium">
                R$ {(calcularSubtotal() - (calcularSubtotal() * (formData.desconto_geral || 0) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Total Frete */}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Frete:</span>
              <span className="font-medium">
                R$ {(dadosFrete?.valor_total_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* TOTAL GERAL */}
            <div className="flex justify-between items-center border-t-2 border-blue-200 pt-3 mt-3">
              <span className="text-lg font-bold text-gray-900">Total Geral:</span>
              <span className="text-2xl font-bold text-blue-600">
                R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
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
