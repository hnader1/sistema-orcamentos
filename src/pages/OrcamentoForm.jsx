import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Lock, FileText } from 'lucide-react'
import { supabase } from '../services/supabase'
import FreteSelector from '../components/FreteSelector'
import PropostaComercial from '../components/PropostaComercial'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

const TABELA_ITENS = 'orcamentos_itens'

export default function OrcamentoForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, podeAcessarLancamento, isVendedor } = useAuth()
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [produtosSelecionados, setProdutosSelecionados] = useState([])
  const [dadosFrete, setDadosFrete] = useState(null)
  const [mostrarProposta, setMostrarProposta] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [descontoLiberado, setDescontoLiberado] = useState(false)
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false)
  const [senhaDigitada, setSenhaDigitada] = useState('')
  const [erroSenha, setErroSenha] = useState(false)
  const SENHA_DESCONTO = 'Nader@123'
  const LIMITE_DESCONTO = 5
  
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
    status: 'rascunho',
    numero_lancamento_erp: '' 
  })

  useEffect(() => {
    carregarProdutos()
    calcularDataValidade()
    if (id) {
      carregarOrcamento()
    } else {
      gerarNumero()
      // Auto-preencher vendedor
      if (user) {
        setFormData(prev => ({
          ...prev,
          vendedor: user.nome,
          vendedor_telefone: user.telefone
        }))
      }
    }
  }, [id, user])

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
      
      console.log('🔍 [CARREGAR] Iniciando carregamento do orçamento ID:', id)
      
      const { data: orc, error: errorOrc } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single()

      if (errorOrc) throw errorOrc

      console.log('✅ [CARREGAR] Orçamento carregado:', orc.numero)

      setFormData({
        numero: orc.numero,
        cliente_nome: orc.cliente_nome || '',
        cliente_empresa: orc.cliente_empresa || '',
        cliente_email: orc.cliente_email || '',
        cliente_telefone: orc.cliente_telefone || '',
        cliente_cpf_cnpj: orc.cliente_cpf_cnpj || '',
        endereco_entrega: orc.endereco_entrega || '',
        vendedor: orc.vendedor || '',
        vendedor_telefone: orc.vendedor_telefone || '',
        data_orcamento: orc.data_orcamento || '',
        validade_dias: orc.validade_dias || 15,
        data_validade: orc.data_validade || '',
        condicoes_pagamento: orc.condicoes_pagamento || '',
        prazo_entrega: orc.prazo_entrega || '',
        desconto_geral: orc.desconto_geral || 0,
        observacoes: orc.observacoes || '',
        status: orc.status || 'rascunho',
        numero_lancamento_erp: orc.numero_lancamento_erp || ''
      })

      if (orc.desconto_geral > LIMITE_DESCONTO) {
        setDescontoLiberado(true)
      }

      if (orc.frete_cidade || orc.frete_modalidade) {
        setDadosFrete({
          modalidade: orc.frete_modalidade || '',
          tipo_veiculo: orc.frete_tipo_caminhao || '',
          localidade: orc.frete_cidade || '',
          tipo_frete: orc.frete_modalidade || 'FOB',
          tipo_caminhao: orc.frete_tipo_caminhao || '',
          viagens_necessarias: orc.frete_qtd_viagens || 0,
          valor_unitario_viagem: orc.frete_valor_viagem || 0,
          valor_total_frete: orc.frete || 0
        })
      }

      console.log(`🔍 [CARREGAR] Buscando itens para orcamento_id: ${id}`)
      
      const { data: itens, error: errorItens } = await supabase
        .from(TABELA_ITENS)
        .select('*')
        .eq('orcamento_id', id)
        .order('ordem', { ascending: true })

      if (errorItens) {
        console.error('❌ [CARREGAR] Erro ao buscar itens:', errorItens)
        throw errorItens
      }

      console.log('📦 [CARREGAR] Itens encontrados:', itens?.length || 0)

      if (itens && itens.length > 0) {
        const produtosCarregados = itens.map(item => ({
          produto_id: item.produto_id,
          codigo: item.produto_codigo,
          produto: item.produto,
          classe: item.classe,
          mpa: item.mpa,
          quantidade: item.quantidade,
          preco: item.preco_unitario,
          peso_unitario: item.peso_unitario,
          qtd_por_pallet: item.qtd_por_pallet
        }))
        
        console.log('✅ [CARREGAR] Produtos carregados com sucesso')
        setProdutosSelecionados(produtosCarregados)
      } } else {
        console.log('⚠️ [CARREGAR] Nenhum item encontrado')
        setProdutosSelecionados([])
      }

      // Verificar se vendedor está vendo orçamento lançado
      if (isVendedor() && orc.status === 'lancado') {
        setIsReadOnly(true)
        console.log('🔒 Modo leitura ativado')
      }
    } catch (error) {
      
      console.error('❌ [CARREGAR] Erro ao carregar orçamento:', error)
      alert('Erro ao carregar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDescontoChange = (valor) => {
    const novoValor = parseFloat(valor) || 0
    
    if (novoValor > LIMITE_DESCONTO && !descontoLiberado) {
      setMostrarModalSenha(true)
      return
    }
    
    setFormData({ ...formData, desconto_geral: valor })
  }

  const validarSenha = () => {
    if (senhaDigitada === SENHA_DESCONTO) {
      setDescontoLiberado(true)
      setMostrarModalSenha(false)
      setSenhaDigitada('')
      setErroSenha(false)
    } else {
      setErroSenha(true)
    }
  }

  const cancelarSenha = () => {
    setMostrarModalSenha(false)
    setSenhaDigitada('')
    setErroSenha(false)
  }

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

  const calcularPesoTotal = () => {
    return produtosSelecionados.reduce((sum, item) => {
      const pesoItem = parseFloat(item.peso_unitario) || 0
      const quantidade = parseInt(item.quantidade) || 0
      return sum + (pesoItem * quantidade)
    }, 0)
  }

  const calcularTotalPallets = () => {
    return produtosSelecionados.reduce((sum, item) => {
      const quantidade = parseInt(item.quantidade) || 0
      const qtdPorPallet = parseInt(item.qtd_por_pallet) || 1
      return sum + (quantidade / qtdPorPallet)
    }, 0)
  }

  const calcularSubtotal = () => {
    return produtosSelecionados.reduce((sum, item) => {
      return sum + (item.quantidade * item.preco)
    }, 0)
  }

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

      if (formData.status === 'lancado' && !formData.numero_lancamento_erp) {
        alert('Informe o Número de Lançamento no ERP!')
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
        endereco_entrega: formData.endereco_entrega,
        vendedor: formData.vendedor,
        vendedor_telefone: formData.vendedor_telefone,
        data_orcamento: formData.data_orcamento,
        validade_dias: parseInt(formData.validade_dias),
        data_validade: formData.data_validade,
        condicoes_pagamento: formData.condicoes_pagamento,
        prazo_entrega: formData.prazo_entrega,
        desconto_geral: parseFloat(formData.desconto_geral),
        subtotal: subtotalComDesconto,
        frete: frete,
        frete_modalidade: dadosFrete?.tipo_frete || 'FOB',
        frete_qtd_viagens: dadosFrete?.viagens_necessarias || 0,
        frete_valor_viagem: dadosFrete?.valor_unitario_viagem || 0,
        frete_cidade: dadosFrete?.localidade || null,
        frete_tipo_caminhao: dadosFrete?.tipo_caminhao || null,
        total,
        observacoes: formData.observacoes,
        status: formData.status,
        numero_lancamento_erp: formData.status === 'lancado' ? formData.numero_lancamento_erp : null,
        usuario_id: user?.id || null
      }

      // Se mudou para lançado, registrar data
      if (formData.status === 'lancado' && formData.numero_lancamento_erp) {
        dadosOrcamento.data_lancamento = new Date().toISOString()
      }

      let orcamentoId = id

      if (id) {
        // EDITANDO
        console.log('📝 [EDITAR] Atualizando orçamento ID:', id)
        
        const { error } = await supabase
          .from('orcamentos')
          .update(dadosOrcamento)
          .eq('id', id)

        if (error) throw error
        console.log('✅ [EDITAR] Orçamento atualizado')

        // Deletar itens antigos
        console.log('🗑️ [EDITAR] Deletando itens antigos...')
        const { error: errorDelete } = await supabase
          .from(TABELA_ITENS)
          .delete()
          .eq('orcamento_id', id)

        if (errorDelete) {
          console.error('❌ [EDITAR] Erro ao deletar:', errorDelete)
          throw errorDelete
        }
        console.log('✅ [EDITAR] Itens deletados')

      } else {
        // CRIANDO NOVO
        console.log('✨ [CRIAR] Criando novo orçamento:', formData.numero)
        
        const { data, error } = await supabase
          .from('orcamentos')
          .insert([dadosOrcamento])
          .select()
          .single()

        if (error) throw error
        
        orcamentoId = data.id
        console.log('✅ [CRIAR] Orçamento criado com ID:', orcamentoId)
      }

      // Inserir novos itens
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

      console.log(`💾 [INSERT] Inserindo ${itens.length} itens...`)

      const { error: errorItens } = await supabase
        .from(TABELA_ITENS)
        .insert(itens)

      if (errorItens) {
        console.error('❌ [INSERT] Erro:', errorItens)
        throw errorItens
      }

      console.log('✅ [INSERT] Itens inseridos')
      console.log('🎉 Salvamento concluído!')

      alert('Orçamento salvo com sucesso!')
      navigate('/orcamentos')
    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      alert('Erro ao salvar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && id) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Modal de Senha */}
      {mostrarModalSenha && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Lock className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Desconto acima de {LIMITE_DESCONTO}%</h3>
                <p className="text-sm text-gray-500">Digite a senha para liberar</p>
              </div>
            </div>
            
            <input
              type="password"
              value={senhaDigitada}
              onChange={(e) => {
                setSenhaDigitada(e.target.value)
                setErroSenha(false)
              }}
              onKeyPress={(e) => e.key === 'Enter' && validarSenha()}
              placeholder="Digite a senha..."
              className={`w-full px-4 py-3 border rounded-lg mb-3 ${
                erroSenha ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              autoFocus
            />
            
            {erroSenha && (
              <p className="text-red-600 text-sm mb-3">Senha incorreta!</p>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={cancelarSenha}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={validarSenha}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Botões de Ação */}
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMostrarProposta(true)}
                disabled={produtosSelecionados.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText size={20} />
                <span className="hidden sm:inline">Gerar Proposta</span>
              </button>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Dados do Orçamento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Dados do Orçamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">📞 Tel. Vendedor</label>
              <input
                type="text"
                value={formData.vendedor_telefone}
                onChange={(e) => setFormData({ ...formData, vendedor_telefone: e.target.value })}
                placeholder="(XX) XXXXX-XXXX"
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
                {podeAcessarLancamento() && (
                  <option value="lancado">Lançado</option>
                )}
                <option value="rejeitado">Rejeitado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            {/* Campo condicional: Número Lançamento ERP */}
            {formData.status === 'lancado' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nº Lançamento ERP *
                </label>
                <input
                  type="text"
                  value={formData.numero_lancamento_erp}
                  onChange={(e) => setFormData({ ...formData, numero_lancamento_erp: e.target.value })}
                  placeholder="Ex: PED-12345"
                  className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-purple-50"
                />
              </div>
            )}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">📍 Endereço de Entrega</label>
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

        {/* PRODUTOS */}
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
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              Clique em "Adicionar Produto" para incluir produtos no orçamento
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Produto</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Classe</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">MPa</th>
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Qtd</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600">Preço</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600">Peso Unit.</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600">Peso Total</th>
                    <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600">Subtotal</th>
                    <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Pallets</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {produtosSelecionados.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1">
                        <select
                          value={item.produto}
                          onChange={(e) => atualizarProduto(index, 'produto', e.target.value)}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          <option value="">Selecione...</option>
                          {getProdutosUnicos().map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <select
                          value={item.classe}
                          onChange={(e) => atualizarProduto(index, 'classe', e.target.value)}
                          disabled={!item.produto}
                          className="w-full px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                        >
                          <option value="">-</option>
                          {getClassesDisponiveis(item.produto).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <select
                          value={item.mpa}
                          onChange={(e) => atualizarProduto(index, 'mpa', e.target.value)}
                          disabled={!item.classe}
                          className="w-full px-2 py-1 border rounded text-sm disabled:bg-gray-100"
                        >
                          <option value="">-</option>
                          {getMPAsDisponiveis(item.produto, item.classe).map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          value={item.quantidade}
                          onChange={(e) => atualizarProduto(index, 'quantidade', e.target.value)}
                          className="w-16 px-2 py-1 border rounded text-sm text-center"
                          min="1"
                        />
                      </td>
                      <td className="px-2 py-1 text-right text-gray-600">
                        {item.preco ? `R$ ${parseFloat(item.preco).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-2 py-1 text-right text-gray-600">
                        {item.peso_unitario ? `${item.peso_unitario} kg` : '-'}
                      </td>
                      <td className="px-2 py-1 text-right text-gray-600">
                        {item.peso_unitario && item.quantidade 
                          ? `${((item.peso_unitario * item.quantidade) / 1000).toFixed(2)} ton` 
                          : '-'} 
                      </td>
                      <td className="px-2 py-1 text-right font-semibold text-gray-900">
                        {item.preco && item.quantidade 
                          ? `R$ ${(item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                          : '-'}
                      </td>
                      <td className="px-2 py-1 text-center">
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-semibold">
                          {item.qtd_por_pallet && item.quantidade 
                            ? (item.quantidade / item.qtd_por_pallet).toFixed(2) 
                            : '-'}
                        </span>
                      </td>
                      <td className="px-2 py-1">
                        <button
                          onClick={() => removerProduto(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* FRETE */}
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
          <div className="max-w-md ml-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal (sem desconto):</span>
              <span className="font-medium">
                R$ {calcularSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <label className="text-sm text-gray-600 flex items-center gap-1">
                Desconto (%):
                {!descontoLiberado && (
                  <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                    <Lock size={10} /> máx {LIMITE_DESCONTO}%
                  </span>
                )}
                {descontoLiberado && (
                  <span className="text-xs text-green-600">✓ liberado</span>
                )}
              </label>
              <input
                type="number"
                step="0.01"
                max={descontoLiberado ? 100 : LIMITE_DESCONTO}
                value={formData.desconto_geral}
                onChange={(e) => handleDescontoChange(e.target.value)}
                className={`w-20 px-2 py-1 border rounded text-center text-sm ${
                  formData.desconto_geral > LIMITE_DESCONTO 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-300'
                }`}
              />
            </div>

            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-gray-700 font-medium">Subtotal de Produtos:</span>
              <span className="font-semibold">
                R$ {(calcularSubtotal() - (calcularSubtotal() * (formData.desconto_geral || 0) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Frete:</span>
              <span className="font-medium">
                R$ {(dadosFrete?.valor_total_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center border-t-2 border-blue-200 pt-3 mt-2">
              <span className="text-lg font-bold text-gray-900">Total Geral:</span>
              <span className="text-2xl font-bold text-blue-600">
                R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Condições de Pagamento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Condições de Pagamento</h2>
          <input
            type="text"
            value={formData.condicoes_pagamento}
            onChange={(e) => setFormData({ ...formData, condicoes_pagamento: e.target.value })}
            placeholder="Ex: 28 DIAS, À VISTA, 30/60/90..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Observações */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Observações</h2>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows="3"
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
