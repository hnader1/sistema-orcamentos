import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, FileText } from 'lucide-react'
import { supabase } from '../services/supabase'
import FreteSelector from '../components/FreteSelector'
import PropostaComercial from '../components/PropostaComercial'

export default function OrcamentoForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [produtosSelecionados, setProdutosSelecionados] = useState([])
  const [dadosFrete, setDadosFrete] = useState(null)
  const [mostrarProposta, setMostrarProposta] = useState(false)
  
  const [formData, setFormData] = useState({
    numero: '',
    cliente_nome: '',
    cliente_empresa: '',
    cliente_email: '',
    cliente_telefone: '',
    cliente_cpf_cnpj: '',
    endereco_entrega: '',
    vendedor: '',
    vendedor_telefone: '',
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
        const ultimoNumero = parseInt(data[0].numero.replace('ORC-', ''))
        novoNumero = `ORC-${String(ultimoNumero + 1).padStart(4, '0')}`
      }
      setFormData(prev => ({ ...prev, numero: novoNumero }))
    } catch (error) {
      console.error('Erro ao gerar número:', error)
      setFormData(prev => ({ ...prev, numero: `ORC-${Date.now()}` }))
    }
  }

  const carregarProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
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
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          ...data,
          data_orcamento: data.data_orcamento || new Date().toISOString().split('T')[0],
          validade_dias: data.validade_dias || 15
        })
        if (data.itens) {
          setProdutosSelecionados(data.itens)
        }
        if (data.dados_frete) {
          setDadosFrete(data.dados_frete)
        }
      }
    } catch (error) {
      console.error('Erro ao carregar orçamento:', error)
    } finally {
      setLoading(false)
    }
  }

  const adicionarProduto = () => {
    setProdutosSelecionados([
      ...produtosSelecionados,
      {
        id: Date.now(),
        produto: '',
        classe: '',
        mpa: '',
        quantidade: 0,
        preco_original: 0,
        preco_final: 0,
        desconto: 0,
        peso_unitario: 0,
        pallets_unitario: 0
      }
    ])
  }

  const removerProduto = (index) => {
    setProdutosSelecionados(produtosSelecionados.filter((_, i) => i !== index))
  }

  const atualizarProduto = (index, campo, valor) => {
    const novosProdutos = [...produtosSelecionados]
    novosProdutos[index][campo] = valor

    if (campo === 'produto' || campo === 'classe' || campo === 'mpa') {
      const produtoEncontrado = produtos.find(
        p => p.produto === novosProdutos[index].produto &&
             p.classe === novosProdutos[index].classe &&
             p.mpa === novosProdutos[index].mpa
      )
      if (produtoEncontrado) {
        novosProdutos[index].preco_original = produtoEncontrado.preco || 0
        novosProdutos[index].preco_final = produtoEncontrado.preco || 0
        novosProdutos[index].peso_unitario = produtoEncontrado.peso_unitario || 0
        novosProdutos[index].pallets_unitario = produtoEncontrado.pallets_unitario || 0
      }
    }

    if (campo === 'desconto') {
      const desconto = parseFloat(valor) || 0
      novosProdutos[index].preco_final = novosProdutos[index].preco_original * (1 - desconto / 100)
    }

    setProdutosSelecionados(novosProdutos)
  }

  const calcularSubtotalProdutos = () => {
    return produtosSelecionados.reduce((acc, p) => acc + (p.quantidade * p.preco_final), 0)
  }

  const calcularTotal = () => {
    const subtotalProdutos = calcularSubtotalProdutos()
    const totalFrete = dadosFrete?.valor_total_frete || 0
    return subtotalProdutos + totalFrete
  }

  const calcularTotalPallets = () => {
    return produtosSelecionados.reduce((acc, p) => {
      const palletsItem = p.pallets_unitario ? Math.ceil(p.quantidade / p.pallets_unitario) : 0
      return acc + palletsItem
    }, 0)
  }

  const salvarOrcamento = async () => {
    try {
      setLoading(true)
      
      const dadosParaSalvar = {
        ...formData,
        itens: produtosSelecionados,
        dados_frete: dadosFrete,
        subtotal_produtos: calcularSubtotalProdutos(),
        total_frete: dadosFrete?.valor_total_frete || 0,
        total_geral: calcularTotal()
      }

      let result
      if (id) {
        result = await supabase
          .from('orcamentos')
          .update(dadosParaSalvar)
          .eq('id', id)
      } else {
        result = await supabase
          .from('orcamentos')
          .insert([dadosParaSalvar])
      }

      if (result.error) throw result.error

      alert('Orçamento salvo com sucesso!')
      navigate('/orcamentos')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Obter opções únicas para dropdowns
  const getProdutosUnicos = () => [...new Set(produtos.map(p => p.produto))].sort()
  const getClassesParaProduto = (produto) => [...new Set(produtos.filter(p => p.produto === produto).map(p => p.classe))].sort()
  const getMpasParaProdutoClasse = (produto, classe) => [...new Set(produtos.filter(p => p.produto === produto && p.classe === classe).map(p => p.mpa))].sort()

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/orcamentos')}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {id ? 'Editar Orçamento' : 'Novo Orçamento'}
              </h1>
              <p className="text-gray-600">{formData.numero}</p>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Botão Gerar Proposta */}
            <button
              onClick={() => setMostrarProposta(true)}
              disabled={produtosSelecionados.length === 0}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={20} />
              Gerar Proposta Comercial
            </button>
            <button
              onClick={salvarOrcamento}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
          </div>
        </div>

        {/* Dados do Orçamento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Dados do Orçamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input
                type="text"
                value={formData.numero}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={formData.data_orcamento}
                onChange={(e) => setFormData({ ...formData, data_orcamento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validade (dias)</label>
              <input
                type="number"
                value={formData.validade_dias}
                onChange={(e) => setFormData({ ...formData, validade_dias: parseInt(e.target.value) || 15 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={formData.cliente_email}
                onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* NOVO: Endereço de Entrega */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📍 Endereço de Entrega
              </label>
              <input
                type="text"
                value={formData.endereco_entrega}
                onChange={(e) => setFormData({ ...formData, endereco_entrega: e.target.value })}
                placeholder="Rua, número, bairro, cidade - UF, CEP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dados do Vendedor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Dados do Vendedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
              <input
                type="text"
                value={formData.vendedor}
                onChange={(e) => setFormData({ ...formData, vendedor: e.target.value })}
                placeholder="Nome do vendedor"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* NOVO: Telefone do Vendedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">📞 Telefone do Vendedor</label>
              <input
                type="text"
                value={formData.vendedor_telefone}
                onChange={(e) => setFormData({ ...formData, vendedor_telefone: e.target.value })}
                placeholder="(XX) XXXXX-XXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Produtos</h2>
            <button
              onClick={adicionarProduto}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
            >
              <Plus size={18} />
              Adicionar Produto
            </button>
          </div>

          {produtosSelecionados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto adicionado. Clique em "Adicionar Produto" para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold">Produto</th>
                    <th className="px-3 py-3 text-left font-semibold">Classe</th>
                    <th className="px-3 py-3 text-left font-semibold">MPA</th>
                    <th className="px-3 py-3 text-right font-semibold">Qtd</th>
                    <th className="px-3 py-3 text-right font-semibold">Preço</th>
                    <th className="px-3 py-3 text-right font-semibold">Desc %</th>
                    <th className="px-3 py-3 text-right font-semibold">Preço Final</th>
                    <th className="px-3 py-3 text-right font-semibold">Total</th>
                    <th className="px-3 py-3 text-center font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {produtosSelecionados.map((item, index) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <select
                          value={item.produto}
                          onChange={(e) => atualizarProduto(index, 'produto', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="">Selecione</option>
                          {getProdutosUnicos().map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.classe}
                          onChange={(e) => atualizarProduto(index, 'classe', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          disabled={!item.produto}
                        >
                          <option value="">Selecione</option>
                          {getClassesParaProduto(item.produto).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={item.mpa}
                          onChange={(e) => atualizarProduto(index, 'mpa', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                          disabled={!item.classe}
                        >
                          <option value="">Selecione</option>
                          {getMpasParaProdutoClasse(item.produto, item.classe).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantidade}
                          onChange={(e) => atualizarProduto(index, 'quantidade', parseInt(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-mono">
                        R$ {item.preco_original?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.desconto}
                          onChange={(e) => atualizarProduto(index, 'desconto', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                          step="0.1"
                          min="0"
                          max="100"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-green-600 font-semibold">
                        R$ {item.preco_final?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">
                        R$ {(item.quantidade * item.preco_final).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => removerProduto(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Frete */}
        <FreteSelector 
          totalPallets={calcularTotalPallets()}
          onFreteChange={setDadosFrete}
          dadosIniciais={dadosFrete}
        />

        {/* Condições e Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Condições de Pagamento */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Condições de Pagamento</h2>
            <input
              type="text"
              value={formData.condicoes_pagamento}
              onChange={(e) => setFormData({ ...formData, condicoes_pagamento: e.target.value })}
              placeholder="Ex: 28 DIAS, À VISTA, 30/60/90..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Resumo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Resumo</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal Produtos:</span>
                <span className="font-mono">R$ {calcularSubtotalProdutos().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Frete:</span>
                <span className="font-mono">R$ {(dadosFrete?.valor_total_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg text-green-600 font-mono">
                  R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
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
            placeholder="Observações adicionais que aparecerão na proposta comercial..."
          />
        </div>
      </div>

      {/* Modal da Proposta Comercial */}
      <PropostaComercial
        isOpen={mostrarProposta}
        onClose={() => setMostrarProposta(false)}
        dadosOrcamento={formData}
        produtos={produtosSelecionados}
        dadosFrete={dadosFrete}
      />
    </div>
  )
}
