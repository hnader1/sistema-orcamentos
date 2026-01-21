// src/pages/OrcamentoForm.jsx
// =====================================================
// VERSÃO COM NOVO FLUXO DE STATUS E SISTEMA DE REVISÕES
// =====================================================
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Lock, FileText, Copy, Send, CheckCircle, Edit3, AlertTriangle, Eye, History } from 'lucide-react'
import { supabase } from '../services/supabase'
import FreteSelector from '../components/FreteSelector'
import PropostaComercial from '../components/PropostaComercial'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import CNPJCPFForm from '../components/CNPJCPFForm'
import EnderecoObraForm from '../components/EnderecoObraForm'
import { verificarConcorrenciaInterna } from '../utils/concorrenciaUtils'
import { gerarNumeroProposta, buscarCodigoVendedor } from '../utils/numeracaoPropostaUtils'
import ModalAlertaConcorrencia from '../components/ModalAlertaConcorrencia'
import SearchableSelectFormaPagamento from '../components/SearchableSelectFormaPagamento'
import BotaoEnviarProposta from '../components/BotaoEnviarProposta'
// ✅ NOVOS IMPORTS PARA SISTEMA DE REVISÕES
import StatusWorkflow from '../components/StatusWorkflow'
import LogRevisoes from '../components/LogRevisoes'
import { 
  requerRevisao, 
  criarRevisao, 
  detectarAlteracoes,
  prepararEdicaoComRevisao 
} from '../utils/revisaoUtils'

const TABELA_ITENS = 'orcamentos_itens'

// ✅ STATUS QUE BLOQUEIAM EDIÇÃO TOTAL (exceto ERP para admin)
const STATUS_BLOQUEADOS = ['aprovado', 'lancado', 'finalizado']

function OrcamentoForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user, podeAcessarLancamento, isVendedor, isAdmin, isComercialInterno } = useAuth()
  const [loading, setLoading] = useState(false)
  const [produtos, setProdutos] = useState([])
  const [vendedores, setVendedores] = useState([])
  const [produtosSelecionados, setProdutosSelecionados] = useState([])
  const [dadosFrete, setDadosFrete] = useState(null)
  const [mostrarProposta, setMostrarProposta] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [dadosCNPJCPF, setDadosCNPJCPF] = useState(null)
  const [dadosEndereco, setDadosEndereco] = useState(null)
  const [cnpjCpfValido, setCnpjCpfValido] = useState(false)
  const [conflitosDetectados, setConflitosDetectados] = useState(null)
  const [mostrarAlertaConcorrencia, setMostrarAlertaConcorrencia] = useState(false)
  const [descontoLiberado, setDescontoLiberado] = useState(false)
  const [mostrarModalSenha, setMostrarModalSenha] = useState(false)
  const [erroSenha, setErroSenha] = useState(false)
  const [usuarioLiberacao, setUsuarioLiberacao] = useState('')
  const [senhaLiberacao, setSenhaLiberacao] = useState('')
  const [validandoSenha, setValidandoSenha] = useState(false)
  const [descontoLiberadoPor, setDescontoLiberadoPor] = useState(null)
  const [descontoTravado, setDescontoTravado] = useState(false)
  const LIMITE_DESCONTO = 5
  const [salvandoObs, setSalvandoObs] = useState(false);

  // ✅ Estados para controle de PDF/Proposta travada
  const [propostaTravada, setPropostaTravada] = useState(false)
  const [pdfExistente, setPdfExistente] = useState(null)
  const [propostaIdAtual, setPropostaIdAtual] = useState(null)

  // ✅ NOVOS ESTADOS PARA SISTEMA DE REVISÕES
  const [revisaoAtual, setRevisaoAtual] = useState(0)
  const [dadosOriginais, setDadosOriginais] = useState(null) // Snapshot ao carregar
  const [motivoRevisao, setMotivoRevisao] = useState('')
  const [mostrarModalRevisao, setMostrarModalRevisao] = useState(false)
  
  const [formData, setFormData] = useState({
    numero: '',
    numero_proposta: '',
    cliente_nome: '',
    cliente_empresa: '',
    cliente_email: '',
    cliente_telefone: '',
    cliente_cpf_cnpj: '',
    endereco_entrega: '',
    vendedor: '',
    vendedor_telefone: '',
    vendedor_email: '',
    data_orcamento: new Date().toISOString().split('T')[0],
    validade_dias: 15,
    data_validade: '',
    forma_pagamento_id: '',
    prazo_entrega: '',
    desconto_geral: 0,
    observacoes: '',
    observacoes_internas: '',
    status: 'rascunho',
    numero_lancamento_erp: '',
    usuario_id_original: null,
    cnpj_cpf: null,
    cnpj_cpf_nao_informado: false,
    cnpj_cpf_nao_informado_aceite_data: null,
    cnpj_cpf_nao_informado_aceite_ip: null,
    obra_cep: '',
    obra_cidade: '',
    obra_bairro: '',
    obra_logradouro: '',
    obra_numero: '',
    obra_complemento: '',
    obra_endereco_validado: false,
    desconto_liberado: false,
    desconto_liberado_por: null,
    desconto_liberado_por_id: null,
    desconto_liberado_em: null,
    desconto_valor_liberado: null
  })

  // ✅ NOVO: Verificar se orçamento está em status bloqueado
  const isStatusBloqueado = () => {
    return STATUS_BLOQUEADOS.includes(formData.status)
  }

  // ✅ NOVO: Verificar se usuário pode editar
  const podeEditar = () => {
    // Se é vendedor e status está bloqueado, não pode editar
    if (isVendedor() && isStatusBloqueado()) {
      return false
    }
    // Se tem PDF gerado (proposta travada), não pode editar
    if (propostaTravada) {
      return false
    }
    return true
  }

  // ✅ NOVO: Verificar se pode editar apenas campo ERP
  const podeEditarApenasERP = () => {
    // Admin ou Comercial Interno pode editar ERP em status bloqueado
    if ((isAdmin() || isComercialInterno()) && isStatusBloqueado()) {
      return true
    }
    return false
  }

  // ✅ NOVO: Determinar modo de visualização
  const getModoVisualizacao = () => {
    // Vendedor em status bloqueado = somente visualização
    if (isVendedor() && isStatusBloqueado()) {
      return 'visualizacao'
    }
    // Proposta travada (PDF gerado) = somente visualização
    if (propostaTravada) {
      return 'proposta_travada'
    }
    // Admin/Comercial em status bloqueado = apenas ERP editável
    if ((isAdmin() || isComercialInterno()) && isStatusBloqueado()) {
      return 'apenas_erp'
    }
    // Modo normal
    return 'edicao'
  }

  // ✅ NOVO: Verificar se existe PDF para este orçamento
  const verificarPropostaExistente = async () => {
    if (!id) return

    try {
      const { data, error } = await supabase
        .from('propostas')
        .select('id, pdf_path, status')
        .eq('orcamento_id', id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        setPropostaIdAtual(data[0].id)
        if (data[0].pdf_path) {
          setPdfExistente(data[0].pdf_path)
          setPropostaTravada(true)
          console.log('🔒 Proposta travada - PDF existente:', data[0].pdf_path)
        }
      }
    } catch (e) {
      console.error('Erro ao verificar proposta existente:', e)
    }
  }

  // ✅ NOVO: Função para solicitar edição (abre modal de motivo)
  const solicitarEdicao = async () => {
    if (!propostaTravada) {
      // Não tem PDF, pode editar normalmente
      return
    }
    // Mostrar modal pedindo motivo da revisão
    setMostrarModalRevisao(true)
  }

  // ✅ CORRIGIDO: Confirmar edição com criação de revisão - ATUALIZA NÚMERO IMEDIATAMENTE
  const confirmarEdicaoComRevisao = async () => {
    if (!motivoRevisao.trim()) {
      alert('Por favor, informe o motivo da revisão.')
      return
    }

    try {
      setLoading(true)

      // Preparar para edição (exclui PDF, cria revisão, ATUALIZA NÚMERO)
      const resultado = await prepararEdicaoComRevisao({
        orcamentoId: id,
        propostaId: propostaIdAtual,
        pdfPath: pdfExistente,
        usuarioId: user?.id,
        usuarioNome: user?.nome,
        motivo: motivoRevisao
      })

      if (!resultado.sucesso) {
        throw new Error(resultado.erro)
      }

      // Atualizar estados locais
      setPdfExistente(null)
      setPropostaTravada(false)
      setMostrarModalRevisao(false)
      setMotivoRevisao('')

      // ✅ CORREÇÃO: Atualizar revisão e número da proposta no estado LOCAL
      if (resultado.novaRevisao) {
        setRevisaoAtual(resultado.novaRevisao)
      }
      if (resultado.novoNumeroProposta) {
        setFormData(prev => ({ 
          ...prev, 
          numero_proposta: resultado.novoNumeroProposta 
        }))
      }

      alert(`✅ PDF excluído! Agora você pode editar.\n\nNovo número da proposta: ${resultado.novoNumeroProposta || formData.numero_proposta}`)

    } catch (error) {
      console.error('❌ Erro:', error)
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ NOVO: Handler para avançar status
  const handleAvancarStatus = async (novoStatus) => {
    try {
      setLoading(true)

      // Validações específicas por status
      if (novoStatus === 'enviado' && !propostaTravada) {
        alert('Gere o PDF da proposta antes de marcar como enviado.')
        setLoading(false)
        return
      }

      let dadosUpdate = { status: novoStatus }

      if (novoStatus === 'aprovado') {
        // Registrar aprovação manual
        dadosUpdate = { 
          ...dadosUpdate,
          aprovado_via: 'manual',
          aprovado_em: new Date().toISOString(),
          aprovado_por: user?.nome
        }
      }

      const { error } = await supabase
        .from('orcamentos')
        .update(dadosUpdate)
        .eq('id', id)

      if (error) throw error

      setFormData(prev => ({ ...prev, status: novoStatus }))
      alert(`✅ Status alterado para "${novoStatus.toUpperCase()}"`)

    } catch (error) {
      console.error('Erro ao avançar status:', error)
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ NOVO: Handler para voltar status
  const handleVoltarStatus = async (novoStatus) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('orcamentos')
        .update({ status: novoStatus })
        .eq('id', id)

      if (error) throw error

      setFormData(prev => ({ ...prev, status: novoStatus }))
      alert(`✅ Status retornado para "${novoStatus.toUpperCase()}"`)

    } catch (error) {
      console.error('Erro ao voltar status:', error)
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ ANTIGO: Função para editar proposta (exclui PDF e libera edição) - MANTIDA PARA COMPATIBILIDADE
  const editarProposta = async () => {
    // Agora chama o novo fluxo com modal
    solicitarEdicao()
  }

  const carregarVendedores = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, telefone, email')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      setVendedores(data || [])
    } catch (error) {
      console.error('❌ Erro ao carregar vendedores:', error)
    }
  }

  const handleVendedorChange = (nomeVendedor) => {
    const vendedorSelecionado = vendedores.find(v => v.nome === nomeVendedor)
    
    if (vendedorSelecionado) {
      setFormData(prev => ({
        ...prev,
        vendedor: vendedorSelecionado.nome,
        vendedor_telefone: vendedorSelecionado.telefone || '',
        vendedor_email: vendedorSelecionado.email || ''
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        vendedor: nomeVendedor,
        vendedor_telefone: '',
        vendedor_email: ''
      }))
    }
  }

  const verificarConcorrencia = async () => {
    if (!dadosCNPJCPF?.cnpj_cpf && !dadosEndereco?.obra_cidade) {
      return
    }

    try {
      const resultado = await verificarConcorrenciaInterna(
        {
          cnpj_cpf: dadosCNPJCPF?.cnpj_cpf,
          cnpj_cpf_nao_informado: dadosCNPJCPF?.cnpj_cpf_nao_informado,
          obra_cidade: dadosEndereco?.obra_cidade,
          obra_bairro: dadosEndereco?.obra_bairro
        },
        user?.id,
        id
      )

      if (resultado.temConflito) {
        setConflitosDetectados(resultado)
        setMostrarAlertaConcorrencia(true)
      }
    } catch (error) {
      console.error('Erro ao verificar concorrência:', error)
    }
  }

  useEffect(() => {
    const modoAtual = getModoVisualizacao()
    if (modoAtual === 'visualizacao' || modoAtual === 'proposta_travada') return
    
    const temCNPJ = dadosCNPJCPF?.cnpj_cpf && !dadosCNPJCPF?.cnpj_cpf_nao_informado
    const temLocalizacao = dadosEndereco?.obra_cidade
    
    if (!temCNPJ && !temLocalizacao) {
      return
    }

    const timer = setTimeout(() => {
      verificarConcorrencia()
    }, 1000)

    return () => clearTimeout(timer)
  }, [dadosCNPJCPF, dadosEndereco, propostaTravada, formData.status])

  useEffect(() => {
    carregarProdutos()
    carregarVendedores()
    calcularDataValidade()
    if (id) {
      carregarOrcamento()
      verificarPropostaExistente()
    } else {
      gerarNumeroSequencial()
      if (user) {
        setFormData(prev => ({
          ...prev,
          vendedor: user.nome,
          vendedor_telefone: user.telefone,
          vendedor_email: user.email
        }))
      }
    }
  }, [id, user])

  useEffect(() => {
    calcularDataValidade()
  }, [formData.data_orcamento, formData.validade_dias])

  // ✅ ATUALIZADO: Definir isReadOnly baseado nas regras
  useEffect(() => {
    const modo = getModoVisualizacao()
    setIsReadOnly(modo === 'visualizacao' || modo === 'proposta_travada' || modo === 'apenas_erp')
  }, [formData.status, propostaTravada, user])

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

  const gerarNumeroSequencial = async () => {
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
        numero_proposta: orc.numero_proposta || '',
        cliente_nome: orc.cliente_nome || '',
        cliente_empresa: orc.cliente_empresa || '',
        cliente_email: orc.cliente_email || '',
        cliente_telefone: orc.cliente_telefone || '',
        cliente_cpf_cnpj: orc.cliente_cpf_cnpj || '',
        endereco_entrega: orc.endereco_entrega || '',
        vendedor: orc.vendedor || '',
        vendedor_telefone: orc.vendedor_telefone || '',
        vendedor_email: orc.vendedor_email || '',
        data_orcamento: orc.data_orcamento || '',
        validade_dias: orc.validade_dias || 15,
        data_validade: orc.data_validade || '',
        condicoes_pagamento: orc.condicoes_pagamento || '',
        forma_pagamento_id: orc.forma_pagamento_id || '',
        prazo_entrega: orc.prazo_entrega || '',
        desconto_geral: orc.desconto_geral || 0,
        observacoes: orc.observacoes || '',
        observacoes_internas: orc.observacoes_internas || '',
        status: orc.status || 'rascunho',
        numero_lancamento_erp: orc.numero_lancamento_erp || '',
        usuario_id_original: orc.usuario_id,
        cnpj_cpf: orc.cnpj_cpf || null,
        cnpj_cpf_nao_informado: orc.cnpj_cpf_nao_informado || false,
        cnpj_cpf_nao_informado_aceite_data: orc.cnpj_cpf_nao_informado_aceite_data || null,
        obra_cep: orc.obra_cep || '',
        obra_cidade: orc.obra_cidade || '',
        obra_bairro: orc.obra_bairro || '',
        obra_logradouro: orc.obra_logradouro || '',
        obra_numero: orc.obra_numero || '',
        obra_complemento: orc.obra_complemento || '',
        obra_endereco_validado: orc.obra_endereco_validado || false,
        desconto_liberado: orc.desconto_liberado || false,
        desconto_liberado_por: orc.desconto_liberado_por || null,
        desconto_liberado_por_id: orc.desconto_liberado_por_id || null,
        desconto_liberado_em: orc.desconto_liberado_em || null,
        desconto_valor_liberado: orc.desconto_valor_liberado || null
      })

      // ✅ NOVO: Guardar snapshot dos dados originais para comparação em revisões
      setDadosOriginais({
        cliente_nome: orc.cliente_nome || '',
        cliente_empresa: orc.cliente_empresa || '',
        cliente_email: orc.cliente_email || '',
        cliente_telefone: orc.cliente_telefone || '',
        endereco_entrega: orc.endereco_entrega || '',
        observacoes: orc.observacoes || '',
        forma_pagamento_id: orc.forma_pagamento_id || '',
        prazo_entrega: orc.prazo_entrega || '',
        desconto_geral: orc.desconto_geral || 0,
        validade_dias: orc.validade_dias || 15,
        frete: orc.frete || 0,
        frete_cidade: orc.frete_cidade || '',
        frete_modalidade: orc.frete_modalidade || '',
        obra_cep: orc.obra_cep || '',
        obra_cidade: orc.obra_cidade || '',
        obra_bairro: orc.obra_bairro || '',
        cnpj_cpf: orc.cnpj_cpf || '',
        status: orc.status || 'rascunho'
      })

      // ✅ NOVO: Carregar revisão atual
      setRevisaoAtual(orc.revisao || 0)

      setDadosCNPJCPF({
        cnpj_cpf: orc.cnpj_cpf || null,
        cnpj_cpf_nao_informado: orc.cnpj_cpf_nao_informado || false,
        cnpj_cpf_nao_informado_aceite_data: orc.cnpj_cpf_nao_informado_aceite_data || null
      })

      const cnpjValido = orc.cnpj_cpf || orc.cnpj_cpf_nao_informado
      setCnpjCpfValido(cnpjValido)

      setDadosEndereco({
        obra_cep: orc.obra_cep || '',
        obra_cidade: orc.obra_cidade || '',
        obra_bairro: orc.obra_bairro || '',
        obra_logradouro: orc.obra_logradouro || '',
        obra_numero: orc.obra_numero || '',
        obra_complemento: orc.obra_complemento || '',
        obra_endereco_validado: orc.obra_endereco_validado || false
      })

      if (orc.desconto_geral > LIMITE_DESCONTO) {
        setDescontoLiberado(true)
        setDescontoTravado(true)
        
        if (orc.desconto_liberado_por) {
          setDescontoLiberadoPor({
            nome: orc.desconto_liberado_por,
            data: orc.desconto_liberado_em ? new Date(orc.desconto_liberado_em).toLocaleString('pt-BR') : '',
            valor: orc.desconto_valor_liberado
          })
        }
      }

      if (orc.frete_cidade || orc.frete_modalidade || orc.frete_manual) {
        const dadosFreteCarregados = {
          modalidade: orc.frete_modalidade || 'FOB',
          tipo_frete: orc.frete_modalidade || 'FOB',
          tipo_veiculo: orc.frete_tipo_caminhao || '',
          tipo_caminhao: orc.frete_tipo_caminhao || '',
          localidade: orc.frete_cidade || '',
          cidade: orc.frete_cidade || '',
          viagens_necessarias: orc.frete_qtd_viagens || 0,
          valor_unitario_viagem: parseFloat(orc.frete_valor_viagem) || 0,
          valor_total_frete: parseFloat(orc.frete) || 0,
          frete_manual: orc.frete_manual || false,
          manual: orc.frete_manual || false,
          valor_manual_viagem: parseFloat(orc.frete_valor_manual_viagem) || parseFloat(orc.frete_valor_viagem) || 0,
          qtd_manual_viagens: orc.frete_qtd_manual_viagens || orc.frete_qtd_viagens || 1
        }
        setDadosFrete(dadosFreteCarregados)
      }

      const { data: itens, error: errorItens } = await supabase
        .from(TABELA_ITENS)
        .select('*')
        .eq('orcamento_id', id)
        .order('ordem', { ascending: true })

      if (errorItens) throw errorItens

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
        setProdutosSelecionados(produtosCarregados)
      }

    } catch (error) {
      console.error('❌ Erro ao carregar orçamento:', error)
      alert('Erro ao carregar orçamento!')
      navigate('/orcamentos')
    } finally {
      setLoading(false)
    }
  }

  const adicionarProduto = (produto) => {
    const jaExiste = produtosSelecionados.find(p => p.produto_id === produto.id)
    if (jaExiste) {
      alert('Produto já adicionado!')
      return
    }

    setProdutosSelecionados([...produtosSelecionados, {
      produto_id: produto.id,
      codigo: produto.codigo,
      produto: produto.produto,
      classe: produto.classe,
      mpa: produto.mpa,
      quantidade: 1,
      preco: produto.preco || 0,
      peso_unitario: produto.peso_unitario || 0,
      qtd_por_pallet: produto.qtd_por_pallet || 0
    }])
  }

  const removerProduto = (index) => {
    setProdutosSelecionados(produtosSelecionados.filter((_, i) => i !== index))
  }

  const atualizarQuantidade = (index, quantidade) => {
    const novos = [...produtosSelecionados]
    novos[index].quantidade = quantidade
    setProdutosSelecionados(novos)
  }

  const atualizarPreco = (index, preco) => {
    const novos = [...produtosSelecionados]
    novos[index].preco = preco
    setProdutosSelecionados(novos)
  }

  const calcularSubtotal = () => {
    return produtosSelecionados.reduce((acc, item) => {
      return acc + (item.quantidade * item.preco)
    }, 0)
  }

  const calcularPesoTotal = () => {
    return produtosSelecionados.reduce((acc, item) => {
      return acc + (item.quantidade * (item.peso_unitario || 0))
    }, 0)
  }

  const duplicar = async () => {
    if (!id) {
      alert('Salve o orçamento primeiro!')
      return
    }

    if (!confirm('Deseja DUPLICAR este orçamento?\n\nSerá criado um novo orçamento com todos os dados atuais, mas sem número de proposta e com desconto zerado.')) {
      return
    }

    try {
      setLoading(true)

      const subtotal = calcularSubtotal()
      const frete = dadosFrete?.valor_total_frete || 0
      const total = subtotal + frete

      const novoOrcamento = {
        numero: 'TEMP',
        numero_proposta: null,
        cliente_nome: formData.cliente_nome,
        cliente_empresa: formData.cliente_empresa,
        cliente_email: formData.cliente_email,
        cliente_telefone: formData.cliente_telefone,
        cliente_cpf_cnpj: formData.cliente_cpf_cnpj,
        endereco_entrega: formData.endereco_entrega,
        vendedor: formData.vendedor,
        vendedor_telefone: formData.vendedor_telefone,
        vendedor_email: formData.vendedor_email,
        data_orcamento: new Date().toISOString().split('T')[0],
        validade_dias: parseInt(formData.validade_dias),
        data_validade: formData.data_validade,
        forma_pagamento_id: formData.forma_pagamento_id,
        prazo_entrega: formData.prazo_entrega,
        desconto_geral: 0,
        subtotal: subtotal,
        frete: frete,
        frete_modalidade: dadosFrete?.modalidade || 'FOB',
        frete_qtd_viagens: dadosFrete?.viagens_necessarias || 0,
        frete_valor_viagem: dadosFrete?.valor_unitario_viagem || 0,
        frete_cidade: dadosFrete?.localidade || null,
        frete_tipo_caminhao: dadosFrete?.tipo_veiculo || null,
        frete_manual: dadosFrete?.frete_manual || false,
        frete_valor_manual_viagem: dadosFrete?.frete_manual ? dadosFrete?.valor_manual_viagem : null,
        frete_qtd_manual_viagens: dadosFrete?.frete_manual ? dadosFrete?.qtd_manual_viagens : null,
        total,
        observacoes: formData.observacoes,
        observacoes_internas: '',
        status: 'rascunho',
        usuario_id: user?.id || null,
        cnpj_cpf: dadosCNPJCPF?.cnpj_cpf || null,
        cnpj_cpf_nao_informado: dadosCNPJCPF?.cnpj_cpf_nao_informado || false,
        cnpj_cpf_nao_informado_aceite_data: dadosCNPJCPF?.cnpj_cpf_nao_informado_aceite_data || null,
        obra_cep: dadosEndereco?.obra_cep || null,
        obra_cidade: dadosEndereco?.obra_cidade || null,
        obra_bairro: dadosEndereco?.obra_bairro || null,
        obra_logradouro: dadosEndereco?.obra_logradouro || null,
        obra_numero: dadosEndereco?.obra_numero || null,
        obra_complemento: dadosEndereco?.obra_complemento || null,
        obra_endereco_validado: dadosEndereco?.obra_endereco_validado || false,
        desconto_liberado: false,
        desconto_liberado_por: null,
        desconto_liberado_por_id: null,
        desconto_liberado_em: null,
        desconto_valor_liberado: null,
        revisao: 0 // ✅ NOVO: Sem revisão na duplicação
      }

      const { data: inserted, error } = await supabase
        .from('orcamentos')
        .insert(novoOrcamento)
        .select()
        .single()

      if (error) throw error

      const numero = parseInt(inserted.id.toString().slice(-4)) || inserted.id
      const novoNumero = `ORC-${numero.toString().padStart(4, '0')}`

      await supabase
        .from('orcamentos')
        .update({ numero: novoNumero })
        .eq('id', inserted.id)

      if (produtosSelecionados.length > 0) {
        const itensParaInserir = produtosSelecionados.map((item, index) => ({
          orcamento_id: inserted.id,
          produto_id: item.produto_id,
          produto_codigo: item.codigo,
          produto: item.produto,
          classe: item.classe,
          mpa: item.mpa,
          quantidade: item.quantidade,
          preco_unitario: item.preco,
          subtotal: item.quantidade * item.preco,
          peso_unitario: item.peso_unitario,
          qtd_por_pallet: item.qtd_por_pallet,
          ordem: index + 1
        }))

        const { error: errorItens } = await supabase
          .from(TABELA_ITENS)
          .insert(itensParaInserir)

        if (errorItens) throw errorItens
      }

      alert('✅ Orçamento duplicado com sucesso!')
      navigate(`/orcamentos/${inserted.id}`)

    } catch (error) {
      console.error('❌ Erro ao duplicar:', error)
      alert('Erro ao duplicar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const aprovarManual = async () => {
    if (!id) {
      alert('Salve o orçamento primeiro!')
      return
    }

    // ✅ NOVO: Verificar se tem PDF gerado
    if (!propostaTravada) {
      alert('⚠️ Gere o PDF da proposta antes de aprovar!\n\nO cliente precisa receber a proposta formatada.')
      return
    }

    if (!confirm('Deseja APROVAR MANUALMENTE este orçamento?\n\nO status será alterado para "Aprovado" e será registrado como aprovação manual.')) {
      return
    }

    try {
      setLoading(true)

      const { error } = await supabase
        .from('orcamentos')
        .update({ 
          status: 'aprovado',
          aprovado_via: 'manual',
          aprovado_em: new Date().toISOString(),
          aprovado_por: user?.nome
        })
        .eq('id', id)

      if (error) throw error

      setFormData(prev => ({ ...prev, status: 'aprovado' }))
      
      alert('✅ Orçamento aprovado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao aprovar:', error)
      alert('Erro ao aprovar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ ATUALIZADO: Verificar se pode aprovar manualmente
  const podeAprovarManual = () => {
    if (!id) return false
    if (!isAdmin() && !isComercialInterno()) return false
    if (['aprovado', 'lancado', 'cancelado', 'finalizado'].includes(formData.status)) return false
    // ✅ NOVO: Só pode aprovar se tiver PDF gerado
    if (!propostaTravada) return false
    return true
  }

// Função para salvar apenas observações internas quando proposta travada
const salvarObservacoesInternas = async () => {
  if (!id) return;
  
  setSalvandoObs(true);
  try {
    const { error } = await supabase
      .from('orcamentos')
      .update({ observacoes_internas: formData.observacoes_internas })
      .eq('id', id);
    
    if (error) throw error;
    alert('Observações salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar observações:', error);
    alert('Erro ao salvar observações: ' + error.message);
  } finally {
    setSalvandoObs(false);
  }
};


  // ✅ ATUALIZADO: Salvar com verificação de permissões E CRIAÇÃO DE REVISÃO
  const salvar = async () => {
    // Verificar se pode salvar
    const modo = getModoVisualizacao()
    
    if (modo === 'visualizacao') {
      alert('Você não tem permissão para editar este orçamento.')
      return
    }

    if (modo === 'proposta_travada') {
      alert('Este orçamento possui PDF gerado e está travado.\nUse "Editar Proposta" para desbloquear.')
      return
    }

    try {
      const temCnpjCpfPreenchido = dadosCNPJCPF?.cnpj_cpf && dadosCNPJCPF.cnpj_cpf.trim() !== ''
      const marcouNaoInformar = dadosCNPJCPF?.cnpj_cpf_nao_informado === true
      const cnpjCpfOk = cnpjCpfValido || temCnpjCpfPreenchido || marcouNaoInformar

      // Se é modo apenas_erp, só salva o número ERP
      if (modo === 'apenas_erp') {
        if (!formData.numero_lancamento_erp && formData.status === 'lancado') {
          alert('Informe o número do lançamento no ERP!')
          return
        }

        setLoading(true)

        const { error } = await supabase
          .from('orcamentos')
          .update({
            numero_lancamento_erp: formData.numero_lancamento_erp,
            data_lancamento: formData.status === 'lancado' ? new Date().toISOString() : null
          })
          .eq('id', id)

        if (error) throw error

        alert('✅ Número ERP atualizado com sucesso!')
        setLoading(false)
        return
      }

      if (!cnpjCpfOk) {
        alert('CNPJ/CPF é obrigatório!\n\nPreencha um CNPJ ou CPF válido, ou marque a opção "Não informar".')
        return
      }

      if (!formData.cliente_nome) {
        alert('Preencha os campos obrigatórios!')
        return
      }

      if (!formData.cliente_email) {
        alert('Por favor, informe o email do cliente!')
        return
      }

      if (!formData.cliente_telefone) {
        alert('Por favor, informe o telefone do cliente!')
        return
      }

      if (!formData.forma_pagamento_id) {
        alert('Por favor, selecione uma forma de pagamento!')
        return
      }

      setLoading(true)

      // ✅ NOVO: Verificar se precisa criar revisão
      let novaRevisao = revisaoAtual
      
      if (id && dadosOriginais && requerRevisao(dadosOriginais.status)) {
        // Detectar alterações
        const dadosAtuais = {
          cliente_nome: formData.cliente_nome,
          cliente_empresa: formData.cliente_empresa,
          cliente_email: formData.cliente_email,
          cliente_telefone: formData.cliente_telefone,
          endereco_entrega: formData.endereco_entrega,
          observacoes: formData.observacoes,
          forma_pagamento_id: formData.forma_pagamento_id,
          prazo_entrega: formData.prazo_entrega,
          desconto_geral: formData.desconto_geral,
          validade_dias: formData.validade_dias,
          frete: dadosFrete?.valor_total_frete || 0,
          frete_cidade: dadosFrete?.localidade || '',
          frete_modalidade: dadosFrete?.modalidade || '',
          obra_cep: dadosEndereco?.obra_cep || '',
          obra_cidade: dadosEndereco?.obra_cidade || '',
          obra_bairro: dadosEndereco?.obra_bairro || '',
          cnpj_cpf: dadosCNPJCPF?.cnpj_cpf || '',
          status: formData.status
        }

        const alteracoes = detectarAlteracoes(dadosOriginais, dadosAtuais)
        
        if (Object.keys(alteracoes.campos).length > 0) {
          // Criar revisão
          const resultadoRevisao = await criarRevisao({
            orcamentoId: id,
            propostaId: propostaIdAtual,
            usuarioId: user?.id,
            usuarioNome: user?.nome,
            dadosOriginais: dadosOriginais,
            dadosNovos: dadosAtuais,
            statusAnterior: dadosOriginais.status,
            statusNovo: formData.status,
            motivo: motivoRevisao || 'Alteração via formulário'
          })

          if (resultadoRevisao.sucesso && resultadoRevisao.revisaoCriada) {
            novaRevisao = resultadoRevisao.numeroRevisao
            setRevisaoAtual(novaRevisao)
            console.log(`✅ Revisão ${novaRevisao} criada`)
          }
        }
      }

      let numeroProposta = formData.numero_proposta
      
      if (!numeroProposta) {
        try {
          const codigoVendedor = await buscarCodigoVendedor(user?.id)
          
          if (!codigoVendedor) {
            const resposta = confirm(
              'Você não possui um código de vendedor cadastrado.\n' +
              'Deseja continuar sem gerar número de proposta?\n\n' +
              '(Solicite ao administrador para cadastrar seu código de 2 ou 3 letras)'
            )
            
            if (!resposta) {
              setLoading(false)
              return
            }
          } else {
            numeroProposta = await gerarNumeroProposta(user?.id, codigoVendedor)
          }
        } catch (error) {
          console.error('❌ Erro ao gerar número de proposta:', error)
          alert('Erro ao gerar número de proposta. Continuando sem numeração...')
        }
      }

      const subtotal = calcularSubtotal()
      const desconto = (subtotal * (formData.desconto_geral || 0)) / 100
      const subtotalComDesconto = subtotal - desconto
      const frete = dadosFrete?.valor_total_frete || 0
      const total = subtotalComDesconto + frete

      const dadosOrcamento = {
        numero: formData.numero || 'TEMP',
        numero_proposta: numeroProposta || null,
        cliente_nome: formData.cliente_nome,
        cliente_empresa: formData.cliente_empresa,
        cliente_email: formData.cliente_email,
        cliente_telefone: formData.cliente_telefone,
        cliente_cpf_cnpj: formData.cliente_cpf_cnpj,
        endereco_entrega: formData.endereco_entrega,
        vendedor: formData.vendedor,
        vendedor_telefone: formData.vendedor_telefone,
        vendedor_email: formData.vendedor_email,
        data_orcamento: formData.data_orcamento,
        validade_dias: parseInt(formData.validade_dias),
        data_validade: formData.data_validade,
        forma_pagamento_id: formData.forma_pagamento_id,
        prazo_entrega: formData.prazo_entrega,
        desconto_geral: parseFloat(formData.desconto_geral),
        subtotal: subtotalComDesconto,
        frete: frete,
        frete_modalidade: dadosFrete?.modalidade || 'FOB',
        frete_qtd_viagens: dadosFrete?.viagens_necessarias || 0,
        frete_valor_viagem: dadosFrete?.valor_unitario_viagem || 0,
        frete_cidade: dadosFrete?.localidade || null,
        frete_tipo_caminhao: dadosFrete?.tipo_veiculo || null,
        frete_manual: dadosFrete?.frete_manual || false,
        frete_valor_manual_viagem: dadosFrete?.frete_manual ? dadosFrete?.valor_manual_viagem : null,
        frete_qtd_manual_viagens: dadosFrete?.frete_manual ? dadosFrete?.qtd_manual_viagens : null,
        total,
        observacoes: formData.observacoes,
        observacoes_internas: formData.observacoes_internas,
        status: formData.status,
        numero_lancamento_erp: formData.status === 'lancado' ? formData.numero_lancamento_erp : null,
        cnpj_cpf: dadosCNPJCPF?.cnpj_cpf || null,
        cnpj_cpf_nao_informado: dadosCNPJCPF?.cnpj_cpf_nao_informado || false,
        cnpj_cpf_nao_informado_aceite_data: dadosCNPJCPF?.cnpj_cpf_nao_informado_aceite_data || null,
        cnpj_cpf_nao_informado_aceite_ip: null,
        obra_cep: dadosEndereco?.obra_cep || null,
        obra_cidade: dadosEndereco?.obra_cidade || null,
        obra_bairro: dadosEndereco?.obra_bairro || null,
        obra_logradouro: dadosEndereco?.obra_logradouro || null,
        obra_numero: dadosEndereco?.obra_numero || null,
        obra_complemento: dadosEndereco?.obra_complemento || null,
        obra_endereco_validado: dadosEndereco?.obra_endereco_validado || false,
        desconto_liberado: formData.desconto_liberado || false,
        desconto_liberado_por: formData.desconto_liberado_por || null,
        desconto_liberado_por_id: formData.desconto_liberado_por_id || null,
        desconto_liberado_em: formData.desconto_liberado_em || null,
        desconto_valor_liberado: formData.desconto_liberado ? parseFloat(formData.desconto_geral) : null,
        revisao: novaRevisao // ✅ NOVO: Salvar revisão
      }

      if (!id) {
        dadosOrcamento.usuario_id = user?.id || null
      } else {
        dadosOrcamento.usuario_id = formData.usuario_id_original
      }

      if (formData.status === 'lancado' && formData.numero_lancamento_erp) {
        dadosOrcamento.data_lancamento = new Date().toISOString()
      }

      let orcamentoId = id

      if (id) {
        const { error } = await supabase
          .from('orcamentos')
          .update(dadosOrcamento)
          .eq('id', id)

        if (error) throw error
      } else {
        const { data: inserted, error } = await supabase
          .from('orcamentos')
          .insert(dadosOrcamento)
          .select()
          .single()

        if (error) throw error
        orcamentoId = inserted.id

        const numero = parseInt(inserted.id.toString().slice(-4)) || inserted.id
        const novoNumero = `ORC-${numero.toString().padStart(4, '0')}`
        
        await supabase
          .from('orcamentos')
          .update({ numero: novoNumero })
          .eq('id', orcamentoId)
      }

      await supabase
        .from(TABELA_ITENS)
        .delete()
        .eq('orcamento_id', orcamentoId)

      if (produtosSelecionados.length > 0) {
        const itensParaInserir = produtosSelecionados.map((item, index) => ({
          orcamento_id: orcamentoId,
          produto_id: item.produto_id,
          produto_codigo: item.codigo,
          produto: item.produto,
          classe: item.classe,
          mpa: item.mpa,
          quantidade: item.quantidade,
          preco_unitario: item.preco,
          subtotal: item.quantidade * item.preco,
          peso_unitario: item.peso_unitario,
          qtd_por_pallet: item.qtd_por_pallet,
          ordem: index + 1
        }))

        const { error: errorItens } = await supabase
          .from(TABELA_ITENS)
          .insert(itensParaInserir)

        if (errorItens) throw errorItens
      }

      // ✅ NOVO: Atualizar snapshot após salvar
      setDadosOriginais({
        cliente_nome: formData.cliente_nome,
        cliente_empresa: formData.cliente_empresa,
        cliente_email: formData.cliente_email,
        cliente_telefone: formData.cliente_telefone,
        endereco_entrega: formData.endereco_entrega,
        observacoes: formData.observacoes,
        forma_pagamento_id: formData.forma_pagamento_id,
        prazo_entrega: formData.prazo_entrega,
        desconto_geral: formData.desconto_geral,
        validade_dias: formData.validade_dias,
        frete: dadosFrete?.valor_total_frete || 0,
        frete_cidade: dadosFrete?.localidade || '',
        frete_modalidade: dadosFrete?.modalidade || '',
        obra_cep: dadosEndereco?.obra_cep || '',
        obra_cidade: dadosEndereco?.obra_cidade || '',
        obra_bairro: dadosEndereco?.obra_bairro || '',
        cnpj_cpf: dadosCNPJCPF?.cnpj_cpf || '',
        status: formData.status
      })

      if (numeroProposta && !formData.numero_proposta) {
        setFormData(prev => ({ ...prev, numero_proposta: numeroProposta }))
      }

      alert('✅ Orçamento salvo com sucesso!')

      if (!id) {
        navigate(`/orcamentos/${orcamentoId}`)
      }

    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      alert('Erro ao salvar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDescontoChange = async (valor) => {
    const novoDesconto = parseFloat(valor) || 0

    if (novoDesconto > LIMITE_DESCONTO && !descontoLiberado) {
      setMostrarModalSenha(true)
      return
    }

    if (descontoTravado && novoDesconto > formData.desconto_valor_liberado) {
      alert(`Desconto máximo liberado: ${formData.desconto_valor_liberado}%`)
      return
    }

    setFormData(prev => ({ ...prev, desconto_geral: novoDesconto }))
  }

  const validarSenhaLiberacao = async () => {
    if (!usuarioLiberacao || !senhaLiberacao) {
      setErroSenha(true)
      return
    }

    setValidandoSenha(true)
    setErroSenha(false)

    try {
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nome, senha_liberacao, pode_liberar_desconto')
        .eq('nome', usuarioLiberacao)
        .single()

      if (error || !usuario) {
        setErroSenha(true)
        setValidandoSenha(false)
        return
      }

      if (!usuario.pode_liberar_desconto) {
        alert('Este usuário não tem permissão para liberar descontos!')
        setValidandoSenha(false)
        return
      }

      if (usuario.senha_liberacao !== senhaLiberacao) {
        setErroSenha(true)
        setValidandoSenha(false)
        return
      }

      setDescontoLiberado(true)
      setMostrarModalSenha(false)
      setUsuarioLiberacao('')
      setSenhaLiberacao('')
      
      setFormData(prev => ({
        ...prev,
        desconto_liberado: true,
        desconto_liberado_por: usuario.nome,
        desconto_liberado_por_id: usuario.id,
        desconto_liberado_em: new Date().toISOString()
      }))

      setDescontoLiberadoPor({
        nome: usuario.nome,
        data: new Date().toLocaleString('pt-BR')
      })

      alert(`✅ Desconto liberado por ${usuario.nome}!\nAgora você pode inserir descontos acima de ${LIMITE_DESCONTO}%.`)

    } catch (error) {
      console.error('Erro ao validar senha:', error)
      setErroSenha(true)
    } finally {
      setValidandoSenha(false)
    }
  }

  const podeGerarProposta = () => {
    if (!formData.cliente_nome) return false
    if (!cnpjCpfValido && !dadosCNPJCPF?.cnpj_cpf_nao_informado) return false
    if (produtosSelecionados.length === 0) return false
    if (!formData.forma_pagamento_id) return false
    return true
  }

  const getTooltipGerarProposta = () => {
    if (!formData.cliente_nome) return 'Preencha o nome do cliente'
    if (!cnpjCpfValido && !dadosCNPJCPF?.cnpj_cpf_nao_informado) return 'Preencha CNPJ/CPF ou marque "Não informar"'
    if (produtosSelecionados.length === 0) return 'Adicione ao menos um produto'
    if (!formData.forma_pagamento_id) return 'Selecione uma forma de pagamento'
    return 'Gerar Proposta Comercial'
  }

  const getDadosOrcamentoParaProposta = () => {
    const subtotal = calcularSubtotal()
    const desconto = (subtotal * (formData.desconto_geral || 0)) / 100
    const subtotalComDesconto = subtotal - desconto
    const frete = dadosFrete?.valor_total_frete || 0
    const total = subtotalComDesconto + frete

    return {
      id,
      ...formData,
      subtotal: subtotalComDesconto,
      frete,
      total,
      cnpj_cpf: dadosCNPJCPF?.cnpj_cpf,
      cnpj_cpf_nao_informado: dadosCNPJCPF?.cnpj_cpf_nao_informado,
      obra_cidade: dadosEndereco?.obra_cidade,
      obra_bairro: dadosEndereco?.obra_bairro,
      obra_logradouro: dadosEndereco?.obra_logradouro,
      obra_numero: dadosEndereco?.obra_numero,
      obra_complemento: dadosEndereco?.obra_complemento,
      obra_cep: dadosEndereco?.obra_cep
    }
  }

  const handlePdfGerado = (propostaData) => {
    console.log('✅ PDF gerado com sucesso:', propostaData)
    if (propostaData?.pdf_path) {
      setPdfExistente(propostaData.pdf_path)
      setPropostaTravada(true)
      setPropostaIdAtual(propostaData.id)
    }
  }

  const getOrcamentoParaEnvio = () => {
    const subtotal = calcularSubtotal()
    const desconto = (subtotal * (formData.desconto_geral || 0)) / 100
    const subtotalComDesconto = subtotal - desconto
    const frete = dadosFrete?.valor_total_frete || 0
    const total = subtotalComDesconto + frete

    return {
      id,
      ...formData,
      subtotal: subtotalComDesconto,
      frete,
      total,
      cnpj_cpf: dadosCNPJCPF?.cnpj_cpf,
      cnpj_cpf_nao_informado: dadosCNPJCPF?.cnpj_cpf_nao_informado,
      itens: produtosSelecionados
    }
  }

  const modo = getModoVisualizacao()

  // Mensagens de alerta por modo
  const AlertaModo = () => {
    if (modo === 'visualizacao') {
      return (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Lock className="text-orange-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-orange-800">🔒 Modo Somente Visualização</h3>
            <p className="text-orange-700 text-sm mt-1">
              Este orçamento está com status "{formData.status.toUpperCase()}" e você não tem permissão para editá-lo. Use "Duplicar" para criar uma nova proposta baseada neste orçamento.
            </p>
          </div>
        </div>
      )
    }

    if (modo === 'proposta_travada') {
      return (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <FileText className="text-blue-500 flex-shrink-0 mt-1" size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-blue-800">📋 Proposta com PDF Gerado</h3>
            <p className="text-blue-700 text-sm mt-1">
              Este orçamento possui PDF gerado e está travado para edição. 
              {revisaoAtual > 0 && ` (Revisão atual: Rev.${revisaoAtual})`}
            </p>
            <button
              onClick={solicitarEdicao}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit3 size={18} />
              Editar Proposta (Nova Revisão)
            </button>
          </div>
        </div>
      )
    }

    if (modo === 'apenas_erp') {
      return (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="text-purple-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-purple-800">⚙️ Modo Edição ERP</h3>
            <p className="text-purple-700 text-sm mt-1">
              Este orçamento está com status "{formData.status.toUpperCase()}". Apenas o número do ERP pode ser alterado.
            </p>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/orcamentos')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {modo === 'visualizacao' || modo === 'proposta_travada' 
                  ? 'Visualizar Orçamento' 
                  : modo === 'apenas_erp'
                    ? 'Atualizar ERP'
                    : (id ? 'Editar Orçamento' : 'Novo Orçamento')}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Botão Duplicar - sempre visível */}
              <button
                onClick={duplicar}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Copy size={20} />
                <span className="hidden sm:inline">Duplicar</span>
              </button>
              
              {/* ✅ BOTÃO GERAR PROPOSTA - não em modo visualização puro */}
              {modo !== 'visualizacao' && (
                <button
                  onClick={() => setMostrarProposta(true)}
                  disabled={!podeGerarProposta()}
                  title={getTooltipGerarProposta()}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FileText size={20} />
                  <span className="hidden sm:inline">Gerar Proposta</span>
                </button>
              )}
              
              {/* ✅ BOTÃO ENVIAR PARA CLIENTE - quando tem PDF */}
              {id && formData.numero_proposta && propostaTravada && (
                <BotaoEnviarProposta 
                  orcamento={getOrcamentoParaEnvio()}
                  onEnviado={(proposta) => {
                    console.log('✅ Proposta enviada:', proposta)
                    setFormData(prev => ({ ...prev, status: 'enviado' }))
                  }}
                />
              )}
              
              {/* ✅ BOTÃO SALVAR - adapta ao modo */}
              {(modo === 'edicao' || modo === 'apenas_erp') && (
                <button
                  onClick={salvar}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save size={20} />
                  <span className="hidden sm:inline">
                    {modo === 'apenas_erp' ? 'Salvar ERP' : 'Salvar'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AlertaModo />

        {/* ✅ NOVO: COMPONENTE DE FLUXO DE STATUS */}
        {id && (
          <div className="mb-6">
            <StatusWorkflow
              statusAtual={formData.status}
              temPDF={propostaTravada}
              isVendedor={isVendedor()}
              isAdmin={isAdmin()}
              isComercialInterno={isComercialInterno()}
              onAvancar={handleAvancarStatus}
              onVoltar={handleVoltarStatus}
              disabled={loading}
              orcamentoId={id}
            />
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dados do Orçamento</h2>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg shadow-sm">
              <span className="text-sm font-semibold text-purple-700">📋 Proposta:</span>
              {formData.numero_proposta ? (
                <span className="text-2xl font-bold text-purple-900 tracking-wider">
                  {formData.numero_proposta}
                  {revisaoAtual > 0 && <span className="text-sm ml-2 text-purple-600">Rev.{revisaoAtual}</span>}
                </span>
              ) : (
                <span className="text-sm italic text-purple-600">Será gerado ao salvar</span>
              )}
            </div>  
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input
                type="date"
                value={formData.data_orcamento}
                onChange={(e) => setFormData({ ...formData, data_orcamento: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={modo !== 'edicao'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Validade</label>
              <input
                type="date"
                value={formData.data_validade}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Validade (dias)</label>
              <input
                type="number"
                value={formData.validade_dias}
                onChange={(e) => setFormData({ ...formData, validade_dias: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={modo !== 'edicao'}
              />
            </div>
            
            {/* ✅ Campo ERP - editável mesmo em modo apenas_erp */}
            {(formData.status === 'lancado' || formData.status === 'aprovado' || formData.status === 'finalizado') && podeAcessarLancamento() && (
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
                  disabled={false}
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Dados do Cliente</h2>
          
          <CNPJCPFForm
            valores={formData}
            onChange={(dados) => {
              if (modo === 'edicao') {
                setDadosCNPJCPF(dados)
                setFormData(prev => ({ ...prev, ...dados }))
              }
            }}
            onValidacao={setCnpjCpfValido}
            disabled={modo !== 'edicao'}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cliente_nome}
                onChange={(e) => setFormData({ ...formData, cliente_nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={modo !== 'edicao'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Contato</label>
              <input
                type="text"
                value={formData.cliente_empresa}
                onChange={(e) => setFormData({ ...formData, cliente_empresa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={modo !== 'edicao'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.cliente_email}
                onChange={(e) => setFormData({ ...formData, cliente_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={modo !== 'edicao'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.cliente_telefone}
                onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={modo !== 'edicao'}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <EnderecoObraForm
            valores={dadosEndereco}
            onChange={(dados) => {
              if (modo === 'edicao') {
                setDadosEndereco(dados)
              }
            }}
            disabled={modo !== 'edicao'}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Vendedor Responsável</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
              <select
                value={formData.vendedor}
                onChange={(e) => handleVendedorChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={modo !== 'edicao'}
              >
                <option value="">Selecione...</option>
                {vendedores.map(v => (
                  <option key={v.id} value={v.nome}>{v.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={formData.vendedor_telefone}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.vendedor_email}
                readOnly
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Produtos</h2>
            {modo === 'edicao' && (
              <select
                onChange={(e) => {
                  const produto = produtos.find(p => p.id === e.target.value)
                  if (produto) adicionarProduto(produto)
                  e.target.value = ''
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">+ Adicionar Produto</option>
                {produtos.map(p => (
                  <option key={p.id} value={p.id}>{p.codigo} - {p.produto}</option>
                ))}
              </select>
            )}
          </div>

          {produtosSelecionados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto adicionado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                    {modo === 'edicao' && <th className="px-4 py-3"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {produtosSelecionados.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm">{item.codigo}</td>
                      <td className="px-4 py-3 text-sm">{item.produto}</td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantidade}
                          onChange={(e) => atualizarQuantidade(index, parseInt(e.target.value) || 1)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          disabled={modo !== 'edicao'}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={item.preco}
                          onChange={(e) => atualizarPreco(index, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-right"
                          disabled={modo !== 'edicao'}
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        R$ {(item.quantidade * item.preco).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      {modo === 'edicao' && (
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removerProduto(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-right">
            <p className="text-gray-600">
              Peso Total: <span className="font-bold">{calcularPesoTotal().toLocaleString('pt-BR')} kg</span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <FreteSelector
            pesoTotal={calcularPesoTotal()}
            onFreteChange={(dados) => {
              if (modo === 'edicao') {
                setDadosFrete(dados)
              }
            }}
            dadosIniciais={dadosFrete}
            disabled={modo !== 'edicao'}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Resumo Financeiro</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">R$ {calcularSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Desconto (%):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.desconto_geral}
                      onChange={(e) => handleDescontoChange(e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                      disabled={modo !== 'edicao'}
                    />
                    {descontoLiberadoPor && (
                      <span className="text-xs text-green-600">
                        ✓ Liberado por {descontoLiberadoPor.nome}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frete:</span>
                  <span className="font-medium">R$ {(dadosFrete?.valor_total_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-lg font-bold">TOTAL:</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {(calcularSubtotal() - (calcularSubtotal() * (formData.desconto_geral || 0) / 100) + (dadosFrete?.valor_total_frete || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Condições</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelectFormaPagamento
                    value={formData.forma_pagamento_id}
                    onChange={(value) => {
                      if (modo === 'edicao') {
                        setFormData({ ...formData, forma_pagamento_id: value })
                      }
                    }}
                    placeholder="Digite para buscar (ex: 28, pix, boleto)..."
                    disabled={modo !== 'edicao'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Observações (Aparece na Proposta)</h2>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Observações que aparecerão na proposta..."
            disabled={modo !== 'edicao'}
          />
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🔒</span>
            <h2 className="text-lg font-semibold text-yellow-800">Observações Internas</h2>
            <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded-full">
              NÃO aparece na proposta
            </span>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            Use este campo para anotações da equipe (ex: negociação, pendências, alertas sobre o cliente).
          </p>
          <textarea
            value={formData.observacoes_internas}
            onChange={(e) => setFormData({ ...formData, observacoes_internas: e.target.value })}
            rows="4"
            disabled={modo === 'visualizacao'}
            className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 bg-white"
            placeholder="Ex: Cliente solicitou desconto adicional, aguardando aprovação do gerente..."
          />
         {modo === 'proposta_travada' && (
            <button
              type="button"
              onClick={salvarObservacoesInternas}
              disabled={salvandoObs}
              className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {salvandoObs ? 'Salvando...' : 'Salvar Observações'}
            </button>
          )}
        </div>

        {/* ✅ NOVO: LOG DE REVISÕES */}
        {id && requerRevisao(formData.status) && (
          <div className="mt-6">
            <LogRevisoes 
              orcamentoId={id}
              revisaoAtual={revisaoAtual}
            />
          </div>
        )}
      </div>

      {/* Modal Senha Liberação Desconto */}
      {mostrarModalSenha && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">🔐 Liberar Desconto Acima de {LIMITE_DESCONTO}%</h3>
            <p className="text-gray-600 mb-4">
              Solicite a um gerente ou usuário autorizado para liberar este desconto.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input
                  type="text"
                  value={usuarioLiberacao}
                  onChange={(e) => setUsuarioLiberacao(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${erroSenha ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha de Liberação</label>
                <input
                  type="password"
                  value={senhaLiberacao}
                  onChange={(e) => setSenhaLiberacao(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${erroSenha ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Senha"
                />
              </div>
              {erroSenha && (
                <p className="text-red-500 text-sm">Usuário ou senha incorretos!</p>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setMostrarModalSenha(false)
                  setUsuarioLiberacao('')
                  setSenhaLiberacao('')
                  setErroSenha(false)
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={validarSenhaLiberacao}
                disabled={validandoSenha}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {validandoSenha ? 'Validando...' : 'Liberar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NOVO: Modal Motivo da Revisão */}
      {mostrarModalRevisao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <History className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold">Motivo da Edição</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Esta proposta já foi enviada ao cliente. 
              Por favor, informe o motivo da alteração para registro.
            </p>

            <textarea
              value={motivoRevisao}
              onChange={(e) => setMotivoRevisao(e.target.value)}
              placeholder="Ex: Cliente solicitou alteração de quantidade..."
              className="w-full px-3 py-2 border rounded-lg mb-4 h-24"
              autoFocus
            />

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                ⚠️ O PDF atual será excluído e você precisará gerar um novo.
                O número da proposta será atualizado para incluir "Rev.{revisaoAtual + 1}".
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setMostrarModalRevisao(false)
                  setMotivoRevisao('')
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEdicaoComRevisao}
                disabled={!motivoRevisao.trim() || loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Confirmar Edição'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ CORRIGIDO: Passar callback onPdfGerado */}
      <PropostaComercial
        isOpen={mostrarProposta}
        onClose={() => setMostrarProposta(false)}
        dadosOrcamento={getDadosOrcamentoParaProposta()}
        produtos={produtosSelecionados}
        dadosFrete={dadosFrete}
        propostaId={propostaIdAtual}
        onPdfGerado={handlePdfGerado}
      />
      
      <ModalAlertaConcorrencia
        isOpen={mostrarAlertaConcorrencia}
        onClose={() => setMostrarAlertaConcorrencia(false)}
        conflitos={conflitosDetectados}
      />
    </div>
  )
}

export default OrcamentoForm