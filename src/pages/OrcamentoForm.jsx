// src/pages/OrcamentoForm.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Plus, Trash2, Lock, FileText, Copy, Send, CheckCircle, Edit3, AlertTriangle, Eye, Download } from 'lucide-react'
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
import DocumentosAnexados from '../components/DocumentosAnexados'
import HistoricoAprovacao from '../components/HistoricoAprovacao'
import { 
  requerRevisao, 
  criarRevisao, 
  detectarAlteracoes,
  prepararEdicaoComRevisao 
} from '../utils/revisaoUtils'

// ✅ NOVOS IMPORTS PARA EMBUTIR VALORES
import EmbutirValoresControles from '../components/EmbutirValoresControles'
import { 
  calcularDescontoUnitario, 
  calcularFreteUnitario, 
  calcularTotalUnidades,
  calcularPrecoComEmbutido,
  calcularTotaisComEmbutido
} from '../utils/embutirValoresUtils'

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
  
  // Estrutura padrão de produto vazio
  const produtoVazio = {
    produto_id: '',
    codigo: '',
    produto: '',
    classe: '',
    mpa: '',
    quantidade: 1,
    preco: 0,
    peso_unitario: 0,
    qtd_por_pallet: 0,
    unidade: 'Unid.'
  }
  
  const [produtosSelecionados, setProdutosSelecionados] = useState([{...produtoVazio}])
  const [dadosFrete, setDadosFrete] = useState(null)
  const [mostrarProposta, setMostrarProposta] = useState(false)
  const [usarNomeCompleto, setUsarNomeCompleto] = useState(false) // ✅ Para PDF: usar nome_completo ao invés de Material/Classe/MPA
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
  const [descontoSolicitado, setDescontoSolicitado] = useState(0)
  const LIMITE_DESCONTO = 3
  const LIMITE_DESCONTO_COMERCIAL = 5
  const [salvandoObs, setSalvandoObs] = useState(false);

  // ✅ NOVO: Estados para controle de PDF/Proposta travada
  const [propostaTravada, setPropostaTravada] = useState(false)
  const [pdfExistente, setPdfExistente] = useState(null)
  const [propostaIdAtual, setPropostaIdAtual] = useState(null)

  // ✅ NOVOS ESTADOS PARA SISTEMA DE REVISÕES
  const [revisaoAtual, setRevisaoAtual] = useState(0)
  const [dadosOriginais, setDadosOriginais] = useState(null) // Snapshot ao carregar
  const [motivoRevisao, setMotivoRevisao] = useState('')
  const [mostrarModalRevisao, setMostrarModalRevisao] = useState(false)

  // ✅ NOVOS ESTADOS PARA EMBUTIR VALORES
  const [descontoEmbutido, setDescontoEmbutido] = useState(false)
  const [freteEmbutido, setFreteEmbutido] = useState(false)
  
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
    usuario_id_selecionado: null,
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
    desconto_valor_liberado: null,
    data_entrega: ''
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

  // ✅ NOVO: Função para editar proposta (exclui PDF e libera edição)
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

      alert(`✅ PDF excluído e proposta editável!\n\n⚠️ IMPORTANTE: O link enviado ao cliente FOI INVALIDADO.\n\nApós editar, gere um novo PDF e envie novamente ao cliente.\n\nNovo número: ${resultado.novoNumeroProposta || formData.numero_proposta}`)

    } catch (error) {
      console.error('❌ Erro:', error)
      alert('Erro: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ MANTIDA PARA COMPATIBILIDADE: Função para editar proposta (agora chama modal)
  const editarProposta = async () => {
    solicitarEdicao()
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
          aprovado_por: user?.id  // ✅ CORRIGIDO: usar ID ao invés de nome
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
        vendedor_email: vendedorSelecionado.email || '',
        usuario_id_selecionado: vendedorSelecionado.id // ✅ Guarda o ID do vendedor selecionado
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        vendedor: nomeVendedor,
        vendedor_telefone: '',
        vendedor_email: '',
        usuario_id_selecionado: null
      }))
    }
  }

  // ✅ CORRIGIDO: Usar vendedor selecionado ao invés de usuário logado
  const verificarConcorrencia = async () => {
    if (!dadosCNPJCPF?.cnpj_cpf && !dadosEndereco?.obra_cidade) {
      return
    }

    // ✅ CORREÇÃO: Usar o vendedor selecionado no formulário, não o usuário logado
    const vendedorIdParaVerificacao = formData.usuario_id_selecionado || user?.id

    try {
      const resultado = await verificarConcorrenciaInterna(
        {
          cnpj_cpf: dadosCNPJCPF?.cnpj_cpf,
          cnpj_cpf_nao_informado: dadosCNPJCPF?.cnpj_cpf_nao_informado,
          obra_cidade: dadosEndereco?.obra_cidade,
          obra_bairro: dadosEndereco?.obra_bairro
        },
        vendedorIdParaVerificacao,  // ✅ CORRIGIDO: Agora usa o vendedor selecionado!
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

  // ✅ CORRIGIDO: Adicionar formData.usuario_id_selecionado como dependência
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
  }, [dadosCNPJCPF, dadosEndereco, propostaTravada, formData.status, formData.usuario_id_selecionado])

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
          vendedor_email: user.email,
          usuario_id_selecionado: user.id // ✅ Novo orçamento pertence ao usuário logado
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

      let novoNumero = 'Rascunho-00001'
      if (data && data.length > 0) {
        const ultimoNumero = data[0].numero
        // Pega só os números do final, independente do prefixo
        const match = ultimoNumero.match(/(\d+)$/)
        const numero = match ? parseInt(match[1]) + 1 : 1
        novoNumero = `Rascunho-${numero.toString().padStart(5, '0')}`
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
        usuario_id_selecionado: orc.usuario_id, // ✅ Inicializa com o dono atual
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
        desconto_valor_liberado: orc.desconto_valor_liberado || null,
        data_entrega: orc.data_entrega || ''
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

      // ✅ NOVO: Carregar estados de embutido
      setDescontoEmbutido(orc.desconto_embutido || false)
      setFreteEmbutido(orc.frete_embutido || false)

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
          qtd_manual_viagens: orc.frete_qtd_manual_viagens || orc.frete_qtd_viagens || 1,
          observacao_frete_manual: orc.observacao_frete_manual || '',
          justificativa_frete_manual: orc.observacao_frete_manual || ''
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
          qtd_por_pallet: item.qtd_por_pallet,
          unidade: item.unidade || 'Unid.'
        }))
        
        setProdutosSelecionados(produtosCarregados.length > 0 ? produtosCarregados : [{...produtoVazio}])
      } else {
        setProdutosSelecionados([{...produtoVazio}])
      }

    } catch (error) {
      console.error('❌ Erro ao carregar orçamento:', error)
      alert('Erro ao carregar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDescontoChange = (valor) => {
    const novoValor = parseFloat(valor) || 0
    
    if (descontoTravado && novoValor !== parseFloat(formData.desconto_geral)) {
      setDescontoSolicitado(novoValor)
      setMostrarModalSenha(true)
      return
    }
    
    if (novoValor > LIMITE_DESCONTO && !descontoLiberado) {
      setDescontoSolicitado(novoValor)
      setMostrarModalSenha(true)
      return
    }
    
    setFormData({ ...formData, desconto_geral: valor })
  }

  const validarSenha = async () => {
    if (!usuarioLiberacao || !senhaLiberacao) {
      setErroSenha(true)
      return
    }

    setValidandoSenha(true)
    setErroSenha(false)

    try {
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, senha, senha_hash, tipo')
        .eq('ativo', true)

      if (error) throw error

      const inputLower = usuarioLiberacao.toLowerCase().trim()
      
      const usuarioEncontrado = usuarios?.find(u => {
        const nomeLower = (u.nome || '').toLowerCase().trim()
        const emailLower = (u.email || '').toLowerCase().trim()
        return nomeLower === inputLower || emailLower === inputLower || 
               nomeLower.includes(inputLower) || emailLower.includes(inputLower)
      })

      if (!usuarioEncontrado) {
        setErroSenha(true)
        setValidandoSenha(false)
        return
      }

      const perfisPermitidos = descontoSolicitado > LIMITE_DESCONTO_COMERCIAL 
        ? ['admin', 'administrador']  // Acima de 5% só admin
        : ['admin', 'administrador', 'comercial_interno']  // Entre 3% e 5% comercial_interno ou admin
      const tipoLower = (usuarioEncontrado.tipo || '').toLowerCase().trim()
      
      if (!perfisPermitidos.includes(tipoLower)) {
        setErroSenha(true)
        setValidandoSenha(false)
        return
      }

      const senhaCorreta = usuarioEncontrado.senha_hash ? usuarioEncontrado.senha_hash : usuarioEncontrado.senha
      
      if (!senhaCorreta || senhaCorreta !== senhaLiberacao) {
        setErroSenha(true)
        setValidandoSenha(false)
        return
      }

      const agora = new Date()
      const dataHora = agora.toLocaleString('pt-BR')
      
      setDescontoLiberado(true)
      setDescontoTravado(false)
      setDescontoLiberadoPor({
        id: usuarioEncontrado.id,
        nome: usuarioEncontrado.nome,
        data: dataHora
      })
      
      setFormData(prev => ({
        ...prev,
        desconto_liberado: true,
        desconto_liberado_por: usuarioEncontrado.nome,
        desconto_liberado_por_id: usuarioEncontrado.id,
        desconto_liberado_em: agora.toISOString()
      }))

      setMostrarModalSenha(false)
      setUsuarioLiberacao('')
      setSenhaLiberacao('')

    } catch (error) {
      console.error('❌ Erro ao validar senha:', error)
      setErroSenha(true)
    } finally {
      setValidandoSenha(false)
    }
  }

  const cancelarSenha = () => {
    setMostrarModalSenha(false)
    setUsuarioLiberacao('')
    setSenhaLiberacao('')
    setErroSenha(false)
  }

  // ✅ NOVA FUNÇÃO: Validar senha admin para frete embutido
  const validarSenhaAdmin = async (usuario, senha) => {
    try {
      const { data: usuarios, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, senha, senha_hash, tipo')
        .eq('ativo', true)

      if (error) throw error

      const inputLower = usuario.toLowerCase().trim()
      
      const usuarioEncontrado = usuarios?.find(u => {
        const nomeLower = (u.nome || '').toLowerCase().trim()
        const emailLower = (u.email || '').toLowerCase().trim()
        return nomeLower === inputLower || emailLower === inputLower || 
               nomeLower.includes(inputLower) || emailLower.includes(inputLower)
      })

      if (!usuarioEncontrado) {
        return { sucesso: false, erro: 'Usuário não encontrado' }
      }

      // Só admin pode liberar frete embutido
      const tipoLower = (usuarioEncontrado.tipo || '').toLowerCase().trim()
      if (!['admin', 'administrador'].includes(tipoLower)) {
        return { sucesso: false, erro: 'Usuário não é administrador' }
      }

      const senhaCorreta = usuarioEncontrado.senha_hash || usuarioEncontrado.senha
      if (!senhaCorreta || senhaCorreta !== senha) {
        return { sucesso: false, erro: 'Senha incorreta' }
      }

      return { sucesso: true, usuario: usuarioEncontrado }
    } catch (error) {
      console.error('Erro ao validar senha:', error)
      return { sucesso: false, erro: error.message }
    }
  }

  // ✅ ORGANIZADO: Argamassa → Blocos → Pisos
  const getProdutosUnicos = () => {
    const unicos = [...new Set(produtos.map(p => p.produto))]
    
    // Função para determinar o tipo do produto
    const getTipoProduto = (nome) => {
      const nomeLower = (nome || '').toLowerCase()
      // Argamassa - prioridade 1
      if (nomeLower.includes('argamassa') || nomeLower.includes('reboco') || 
          nomeLower.includes('contrapiso')) {
        return 1
      }
      // Piso - prioridade 3
      if (nomeLower.includes('piso') || nomeLower.includes('paver') || 
          nomeLower.includes('intertravado') || nomeLower.includes('16 faces') ||
          nomeLower.includes('sextavado')) {
        return 3
      }
      // Bloco - prioridade 2 (padrão)
      return 2
    }
    
    // Ordenar por tipo e depois alfabeticamente dentro do tipo
    return unicos.sort((a, b) => {
      const tipoA = getTipoProduto(a)
      const tipoB = getTipoProduto(b)
      
      if (tipoA !== tipoB) {
        return tipoA - tipoB
      }
      
      // Mesmo tipo: ordenar alfabeticamente
      return a.localeCompare(b)
    })
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
    return mpas.sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, ''))
      const numB = parseFloat(b.replace(/[^\d.]/g, ''))
      return numA - numB
    })
  }

  const getProdutoCompleto = (nomeProduto, classe, mpa) => {
    return produtos.find(p => 
      p.produto === nomeProduto && 
      p.classe === classe && 
      p.mpa === mpa
    )
  }

  const adicionarProduto = () => {
    setProdutosSelecionados([...produtosSelecionados, {...produtoVazio}])
  }

  const inserirProdutoEm = (index) => {
    const novos = [...produtosSelecionados]
    novos.splice(index + 1, 0, {...produtoVazio})
    setProdutosSelecionados(novos)
  }

  const removerProduto = (index) => {
    // Se só tem 1 produto, limpa ele ao invés de remover
    if (produtosSelecionados.length === 1) {
      setProdutosSelecionados([{...produtoVazio}])
    } else {
      setProdutosSelecionados(produtosSelecionados.filter((_, i) => i !== index))
    }
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
        qtd_por_pallet: 0,
        unidade: 'Unid.'
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
        qtd_por_pallet: 0,
        unidade: 'Unid.'
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
          qtd_por_pallet: produtoCompleto.qtd_por_pallet,
          unidade: produtoCompleto.unidade || 'Unid.'
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

  // Arredonda para 2 casas decimais
  const arredondar = (valor) => {
    return Math.round(valor * 100) / 100
  }

  const calcularTotalPallets = () => {
    return produtosSelecionados.reduce((sum, item) => {
      const quantidade = parseInt(item.quantidade) || 0
      const qtdPorPallet = parseInt(item.qtd_por_pallet) || 1
      return sum + (quantidade / qtdPorPallet)
    }, 0)
  }

  // ✅ NOVAS FUNÇÕES PARA CÁLCULO COM EMBUTIDO

  // Função para calcular total de unidades
  const calcularTotalUnidadesProdutos = () => {
    return produtosSelecionados.reduce((total, item) => {
      return total + (parseInt(item.quantidade) || 0)
    }, 0)
  }

  // Função para calcular frete unitário
  const getFreteUnitario = () => {
    const freteTotal = dadosFrete?.valor_total_frete || 0
    const totalUnidades = calcularTotalUnidadesProdutos()
    if (freteTotal <= 0 || totalUnidades <= 0) return 0
    return freteTotal / totalUnidades
  }

  // Função para calcular desconto unitário de um produto
  const getDescontoUnitario = (precoOriginal) => {
    if (!descontoEmbutido || !formData.desconto_geral) return 0
    return parseFloat(precoOriginal) * (parseFloat(formData.desconto_geral) / 100)
  }

  // Função para calcular subtotal de um item (considerando embutido)
  const calcularSubtotalItem = (item) => {
    const quantidade = parseInt(item.quantidade) || 0
    const precoOriginal = parseFloat(item.preco) || 0
    
    if (!descontoEmbutido && !freteEmbutido) {
      return quantidade * arredondar(precoOriginal)
    }
    
    const descontoUnit = descontoEmbutido ? getDescontoUnitario(precoOriginal) : 0
    const freteUnit = freteEmbutido ? getFreteUnitario() : 0
    
    // Ordem: 1) desconto no preço, 2) adiciona frete (sem desconto)
    // Arredondar cada valor unitário para 2 casas decimais
    const precoComDesconto = precoOriginal - descontoUnit
    const precoFinal = arredondar(precoComDesconto + freteUnit)
    
    return quantidade * precoFinal
  }

  // Função auxiliar para calcular subtotal sem embutido (para comparação)
  const calcularSubtotalProdutosSemEmbutido = () => {
    return produtosSelecionados.reduce((sum, item) => {
      return sum + (item.quantidade * item.preco)
    }, 0)
  }

  // ✅ MODIFICADO: calcularSubtotal considerando embutido
  const calcularSubtotal = () => {
    return produtosSelecionados.reduce((sum, item) => {
      return sum + calcularSubtotalItem(item)
    }, 0)
  }

  // ✅ MODIFICADO: calcularTotal considerando embutido
  // IMPORTANTE: Desconto é aplicado no valor unitário, arredondado, depois somado
  const calcularTotal = () => {
    let subtotal = 0
    
    // Calcular subtotal com desconto aplicado no unitário
    produtosSelecionados.forEach(item => {
      const quantidade = parseInt(item.quantidade) || 0
      const precoOriginal = parseFloat(item.preco) || 0
      
      // Aplicar desconto no valor unitário (não embutido)
      const percentualDesconto = !descontoEmbutido ? (formData.desconto_geral || 0) : 0
      const precoComDesconto = precoOriginal * (1 - percentualDesconto / 100)
      
      // Arredondar valor unitário para 2 dígitos
      const precoFinal = arredondar(precoComDesconto)
      
      subtotal += quantidade * precoFinal
    })
    
    // Se desconto embutido, não subtrai novamente (já foi aplicado acima)
    const desconto = 0
    
    // Se frete embutido, não adiciona novamente
    const frete = freteEmbutido ? 0 : arredondar(dadosFrete?.valor_total_frete || 0)
    
    return arredondar(subtotal + frete)
  }

  const duplicar = async () => {
    if (!confirm('Deseja duplicar este orçamento? Será criada uma cópia em modo RASCUNHO.')) return

    try {
      setLoading(true)

      const { data: ultimoOrc, error: errorUltimo } = await supabase
        .from('orcamentos')
        .select('numero')
        .order('created_at', { ascending: false })
        .limit(1)

      if (errorUltimo) throw errorUltimo

      let novoNumero = 'Rascunho-00001'
      if (ultimoOrc && ultimoOrc.length > 0) {
        const ultimoNumero = ultimoOrc[0].numero
        // Pega só os números do final, independente do prefixo
        const match = ultimoNumero.match(/(\d+)$/)
        const numero = match ? parseInt(match[1]) + 1 : 1
        novoNumero = `Rascunho-${numero.toString().padStart(5, '0')}`
      }

      const subtotal = calcularSubtotal()
      const desconto = (subtotal * (formData.desconto_geral || 0)) / 100
      const subtotalComDesconto = subtotal - desconto
      const frete = dadosFrete?.valor_total_frete || 0
      const total = subtotalComDesconto + frete

      const novoOrcamento = {
        numero: novoNumero,
        numero_proposta: null,
        cliente_nome: formData.cliente_nome,
        cliente_empresa: formData.cliente_empresa,
        cliente_email: formData.cliente_email,
        cliente_telefone: formData.cliente_telefone,
        cliente_cpf_cnpj: formData.cliente_cpf_cnpj,
        endereco_entrega: formData.endereco_entrega,
        vendedor: user?.nome || formData.vendedor,
        vendedor_telefone: user?.telefone || formData.vendedor_telefone,
        vendedor_email: user?.email || formData.vendedor_email,
        data_orcamento: new Date().toISOString().split('T')[0],
        validade_dias: parseInt(formData.validade_dias) || 15,
        data_validade: formData.data_validade,
        forma_pagamento_id: formData.forma_pagamento_id || null,
        prazo_entrega: formData.prazo_entrega,
        desconto_geral: 0,
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
        observacao_frete_manual: dadosFrete?.frete_manual ? (dadosFrete?.observacao_frete_manual || dadosFrete?.justificativa_frete_manual) : null,
        total,
        observacoes: formData.observacoes,
        observacoes_internas: formData.observacoes_internas, 
        status: 'rascunho',
        numero_lancamento_erp: null,
        usuario_id: user?.id,
        excluido: false,
        cnpj_cpf: dadosCNPJCPF?.cnpj_cpf || formData.cnpj_cpf || null,
        cnpj_cpf_nao_informado: dadosCNPJCPF?.cnpj_cpf_nao_informado || formData.cnpj_cpf_nao_informado || false,
        cnpj_cpf_nao_informado_aceite_data: dadosCNPJCPF?.cnpj_cpf_nao_informado_aceite_data || formData.cnpj_cpf_nao_informado_aceite_data || null,
        cnpj_cpf_nao_informado_aceite_ip: null,
        obra_cep: dadosEndereco?.obra_cep || formData.obra_cep || null,
        obra_cidade: dadosEndereco?.obra_cidade || formData.obra_cidade || null,
        obra_bairro: dadosEndereco?.obra_bairro || formData.obra_bairro || null,
        obra_logradouro: dadosEndereco?.obra_logradouro || formData.obra_logradouro || null,
        obra_numero: dadosEndereco?.obra_numero || formData.obra_numero || null,
        obra_complemento: dadosEndereco?.obra_complemento || formData.obra_complemento || null,
        obra_endereco_validado: dadosEndereco?.obra_endereco_validado || formData.obra_endereco_validado || false,
        desconto_liberado: false,
        desconto_liberado_por: null,
        desconto_liberado_por_id: null,
        desconto_liberado_em: null,
        desconto_valor_liberado: null,
        // ✅ NOVO: Resetar embutido na duplicação
        desconto_embutido: false,
        frete_embutido: false
      }

      const { data: orcCriado, error: errorCriar } = await supabase
        .from('orcamentos')
        .insert([novoOrcamento])
        .select()
        .single()

      if (errorCriar) throw errorCriar

      const itens = produtosSelecionados.map((item, index) => ({
        orcamento_id: orcCriado.id,
        produto_id: item.produto_id,
        produto_codigo: item.codigo,
        produto: item.produto,
        classe: item.classe,
        mpa: item.mpa,
        quantidade: parseInt(item.quantidade),
        preco_unitario: parseFloat(item.preco),
        peso_unitario: parseFloat(item.peso_unitario),
        qtd_por_pallet: parseInt(item.qtd_por_pallet),
        unidade: item.unidade || 'Unid.',
        subtotal: item.quantidade * item.preco,
        ordem: index
      }))

      const { error: errorItens } = await supabase
        .from(TABELA_ITENS)
        .insert(itens)

      if (errorItens) throw errorItens

      alert(`Orçamento duplicado com sucesso!\nNovo número: ${novoNumero}`)
      navigate(`/orcamentos/editar/${orcCriado.id}`)
    } catch (error) {
      console.error('❌ Erro ao duplicar:', error)
      alert('Erro ao duplicar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ APROVAR MANUAL - Admin/Comercial Interno
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
          aprovado_por: user?.id  // ✅ CORRIGIDO: usar ID ao invés de nome
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

  // Verificar se pode aprovar manualmente
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


  // ✅ ATUALIZADO: Salvar com verificação de permissões
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
        if (!dadosEndereco?.obra_cidade) {
        alert('Cidade é obrigatória!');
        return;
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

      // ✅ NOVO: Detectar e registrar alterações se já houve revisão
      if (id && dadosOriginais && revisaoAtual > 0) {
        try {
          // Montar dados atuais para comparação
          const dadosAtuais = {
            cliente_nome: formData.cliente_nome,
            cliente_empresa: formData.cliente_empresa,
            cliente_email: formData.cliente_email,
            cliente_telefone: formData.cliente_telefone,
            endereco_entrega: formData.endereco_entrega,
            observacoes: formData.observacoes,
            forma_pagamento_id: formData.forma_pagamento_id,
            prazo_entrega: formData.prazo_entrega,
            desconto_geral: parseFloat(formData.desconto_geral) || 0,
            validade_dias: parseInt(formData.validade_dias) || 15,
            frete: dadosFrete?.valor_total_frete || 0,
            frete_cidade: dadosFrete?.localidade || '',
            frete_modalidade: dadosFrete?.modalidade || '',
            obra_cep: dadosEndereco?.obra_cep || '',
            obra_cidade: dadosEndereco?.obra_cidade || '',
            obra_bairro: dadosEndereco?.obra_bairro || '',
            cnpj_cpf: dadosCNPJCPF?.cnpj_cpf || ''
          }

          // Detectar alterações
          const alteracoes = detectarAlteracoes(dadosOriginais, dadosAtuais)
          
          // Se houve alterações, atualizar o registro de revisão existente
          if (Object.keys(alteracoes.campos).length > 0) {
            console.log('📝 Alterações detectadas:', alteracoes.campos)
            
            // Atualizar o registro de revisão mais recente com as alterações reais
            const { error: erroUpdate } = await supabase
              .from('propostas_revisoes')
              .update({
                campos_alterados: alteracoes.campos,
                valores_anteriores: alteracoes.valoresAnteriores,
                valores_novos: alteracoes.valoresNovos
              })
              .eq('orcamento_id', id)
              .eq('numero_revisao', revisaoAtual)

            if (erroUpdate) {
              console.warn('Aviso ao atualizar revisão:', erroUpdate)
            } else {
              console.log('✅ Revisão atualizada com alterações reais')
            }

            // Atualizar snapshot para próximas comparações
            setDadosOriginais(dadosAtuais)
          }
        } catch (erroRevisao) {
          console.warn('Erro ao processar revisão:', erroRevisao)
          // Continua salvando mesmo se falhar o registro de revisão
        }
      }

      // Manter número de proposta existente ou gerar novo se não existir
      let numeroProposta = formData.numero_proposta || null
      
      // Se não tem numero_proposta ainda, tentar gerar
      // ✅ Usa o vendedor selecionado (não o usuário logado)
      const vendedorIdParaProposta = formData.usuario_id_selecionado || user?.id
      if (!numeroProposta && vendedorIdParaProposta) {
        try {
          const codigoVendedor = await buscarCodigoVendedor(vendedorIdParaProposta)
          if (codigoVendedor) {
            numeroProposta = await gerarNumeroProposta(vendedorIdParaProposta, codigoVendedor)
            console.log('✅ Número de proposta gerado:', numeroProposta)
          }
        } catch (erroProposta) {
          console.warn('⚠️ Não foi possível gerar número de proposta:', erroProposta)
          // Continua sem numero_proposta - pode ser gerado depois
        }
      }

      const subtotal = calcularSubtotal()
      const desconto = descontoEmbutido ? 0 : (calcularSubtotalProdutosSemEmbutido() * (formData.desconto_geral || 0)) / 100
      const subtotalComDesconto = calcularSubtotalProdutosSemEmbutido() - desconto
      const frete = freteEmbutido ? 0 : (dadosFrete?.valor_total_frete || 0)
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
        frete: dadosFrete?.valor_total_frete || 0,
        frete_modalidade: dadosFrete?.modalidade || 'FOB',
        frete_qtd_viagens: dadosFrete?.viagens_necessarias || 0,
        frete_valor_viagem: dadosFrete?.valor_unitario_viagem || 0,
        frete_cidade: dadosFrete?.localidade || null,
        frete_tipo_caminhao: dadosFrete?.tipo_veiculo || null,
        frete_manual: dadosFrete?.frete_manual || false,
        frete_valor_manual_viagem: dadosFrete?.frete_manual ? dadosFrete?.valor_manual_viagem : null,
        frete_qtd_manual_viagens: dadosFrete?.frete_manual ? dadosFrete?.qtd_manual_viagens : null,
        observacao_frete_manual: dadosFrete?.frete_manual ? (dadosFrete?.observacao_frete_manual || dadosFrete?.justificativa_frete_manual) : null,
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
        data_entrega: formData.data_entrega || null,
        // ✅ NOVO: Campos de embutido
        desconto_embutido: descontoEmbutido,
        frete_embutido: freteEmbutido
      }

      // ✅ LÓGICA DE PROPRIETÁRIO DO ORÇAMENTO
      // - Vendedor: sempre ele mesmo
      // - Admin/Comercial: usa o vendedor selecionado no dropdown
      if (!id) {
        // Novo orçamento
        if (isVendedor()) {
          dadosOrcamento.usuario_id = user?.id || null
        } else {
          // Admin/Comercial escolheu um vendedor
          dadosOrcamento.usuario_id = formData.usuario_id_selecionado || user?.id || null
        }
      } else {
        // Editando orçamento existente
        if (isVendedor()) {
          dadosOrcamento.usuario_id = formData.usuario_id_original
        } else {
          // Admin/Comercial pode mudar o proprietário
          dadosOrcamento.usuario_id = formData.usuario_id_selecionado || formData.usuario_id_original
        }
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

        const { error: errorDelete } = await supabase
          .from(TABELA_ITENS)
          .delete()
          .eq('orcamento_id', id)

        if (errorDelete) throw errorDelete

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
        unidade: item.unidade || 'Unid.',
        subtotal: item.quantidade * item.preco,
        ordem: index
      }))

      const { error: errorItens } = await supabase
        .from(TABELA_ITENS)
        .insert(itens)

      if (errorItens) throw errorItens

      if (numeroProposta) {
        setFormData(prev => ({ ...prev, numero_proposta: numeroProposta }))
      }

      alert('Orçamento salvo com sucesso!')
      
      if (!id) {
        navigate(`/orcamentos/editar/${orcamentoId}`)
      }

    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      alert('Erro ao salvar orçamento: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

// ====================================================================================
  // EXPORTAR ORÇAMENTO PARA EXCEL
  // ====================================================================================
  // ====================================================================================
  // EXPORTAR ORÇAMENTO PARA EXCEL - COMPLETO
  // ====================================================================================
  const exportarExcel = () => {
    const formatarValor = (valor) => {
      if (!valor && valor !== 0) return '0,00'
      return parseFloat(valor).toFixed(2).replace('.', ',')
    }

    const linhas = [
      // CABEÇALHO DO ORÇAMENTO
      ['ORÇAMENTO', formData.numero || ''],
      ['PROPOSTA', formData.numero_proposta || ''],
      ['DATA', formData.data_orcamento || ''],
      ['VALIDADE', formData.data_validade || ''],
      ['STATUS', formData.status || ''],
      [''],
      // VENDEDOR
      ['VENDEDOR', formData.vendedor || ''],
      ['TELEFONE VENDEDOR', formData.vendedor_telefone || ''],
      ['EMAIL VENDEDOR', formData.vendedor_email || ''],
      [''],
      // CLIENTE
      ['CLIENTE', formData.cliente_nome || ''],
      ['EMPRESA', formData.cliente_empresa || ''],
      ['CPF/CNPJ', dadosCNPJCPF?.cnpj_cpf || formData.cnpj_cpf || ''],
      ['TELEFONE', formData.cliente_telefone || ''],
      ['EMAIL', formData.cliente_email || ''],
      [''],
      // ENDEREÇO DA OBRA
      ['ENDEREÇO DA OBRA', ''],
      ['CEP', dadosEndereco?.obra_cep || formData.obra_cep || ''],
      ['CIDADE', dadosEndereco?.obra_cidade || formData.obra_cidade || ''],
      ['BAIRRO', dadosEndereco?.obra_bairro || formData.obra_bairro || ''],
      ['LOGRADOURO', dadosEndereco?.obra_logradouro || formData.obra_logradouro || ''],
      ['NÚMERO', dadosEndereco?.obra_numero || formData.obra_numero || ''],
      ['COMPLEMENTO', dadosEndereco?.obra_complemento || formData.obra_complemento || ''],
      [''],
      // FRETE
      ['FRETE', ''],
      ['MODALIDADE', dadosFrete?.modalidade || formData.frete_modalidade || 'FOB'],
      ['TIPO VEÍCULO', dadosFrete?.tipo_veiculo || formData.frete_tipo_caminhao || ''],
      ['CIDADE FRETE', dadosFrete?.cidade || formData.frete_cidade || ''],
      ['QTD VIAGENS', dadosFrete?.qtd_viagens || formData.frete_qtd_viagens || ''],
      ['VALOR POR VIAGEM', formatarValor(dadosFrete?.valor_viagem || formData.frete_valor_viagem)],
      ['VALOR TOTAL FRETE', formatarValor(dadosFrete?.valor_total_frete || formData.frete)],
      ['TIPO DESCARGA', dadosFrete?.tipo_descarga || ''],
      [''],
      // PRODUTOS - CABEÇALHO
      ['PRODUTOS', '', '', '', '', ''],
      ['CÓDIGO', 'PRODUTO', 'CLASSE', 'MPA', 'QTD', 'VALOR UNIT.', 'SUBTOTAL'],
    ]

    // PRODUTOS - ITENS
    produtosSelecionados.forEach(item => {
      linhas.push([
        item.codigo || '',
        item.produto || '',
        item.classe || '',
        item.mpa || '',
        item.quantidade || 0,
        formatarValor(item.preco),
        formatarValor(item.quantidade * item.preco)
      ])
    })

    // TOTAIS
    linhas.push([''])
    linhas.push(['', '', '', '', '', 'SUBTOTAL PRODUTOS', formatarValor(calcularSubtotal())])
    linhas.push(['', '', '', '', '', 'FRETE', formatarValor(dadosFrete?.valor_total_frete || formData.frete || 0)])
    linhas.push(['', '', '', '', '', 'DESCONTO', (formData.desconto_geral || 0) + '%'])
    linhas.push(['', '', '', '', '', 'TOTAL GERAL', formatarValor(calcularTotal())])
    
    // FORMA DE PAGAMENTO
    linhas.push([''])
    linhas.push(['FORMA DE PAGAMENTO', formData.condicoes_pagamento || ''])
    linhas.push(['PRAZO DE ENTREGA', formData.prazo_entrega || ''])
    
    // OBSERVAÇÕES
    linhas.push([''])
    linhas.push(['OBSERVAÇÕES', formData.observacoes || ''])
    linhas.push(['OBSERVAÇÕES INTERNAS', formData.observacoes_internas || ''])

    // Gerar CSV
    const csvContent = linhas.map(row => row.join(';')).join('\n')

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const nomeArquivo = formData.numero_proposta 
  ? `${formData.numero_proposta}_${formData.cliente_nome || 'cliente'}.csv`
  : `Rascunho_${formData.numero || 'ORC'}_${formData.cliente_nome || 'cliente'}.csv`
link.download = nomeArquivo.replace(/[^a-zA-Z0-9_\-\.]/g, '_')
    link.click()
    URL.revokeObjectURL(url)
  }

  const podeGerarProposta = () => {
    if (produtosSelecionados.length === 0) return false
    if (!id) return false
    if (!formData.numero_proposta) return false
    return true
  }

  const getTooltipGerarProposta = () => {
    if (produtosSelecionados.length === 0) {
      return 'Adicione produtos primeiro'
    }
    if (!id) {
      return 'Salve o orçamento primeiro'
    }
    if (!formData.numero_proposta) {
      return 'Salve o orçamento para gerar o número da proposta'
    }
    return ''
  }

  // ✅ Callback quando PDF é gerado - trava a proposta
  const handlePdfGerado = (pdfUrl, pdfPath) => {
    console.log('✅ PDF gerado, travando proposta:', pdfPath)
    setPdfExistente(pdfPath)
    setPropostaTravada(true)
  }

  // ✅ Função para montar dados do orçamento para o botão enviar
  const getOrcamentoParaEnvio = () => {
    return {
      id: id,
      numero: formData.numero,
      numero_proposta: formData.numero_proposta,
      cliente_nome: formData.cliente_nome,
      cliente_empresa: formData.cliente_empresa,
      cliente_email: formData.cliente_email,
      cliente_telefone: formData.cliente_telefone,
      cnpj_cpf: dadosCNPJCPF?.cnpj_cpf,
      obra_cep: dadosEndereco?.obra_cep,
      obra_logradouro: dadosEndereco?.obra_logradouro,
      obra_bairro: dadosEndereco?.obra_bairro,
      obra_cidade: dadosEndereco?.obra_cidade,
      usuario_id: formData.usuario_id_original || user?.id,
      validade_dias: formData.validade_dias,
      frete_modalidade: dadosFrete?.modalidade || 'FOB',
      total: calcularTotal(),
      total_geral: calcularTotal()
    }
  }

  // ✅ Função para montar dados completos para PropostaComercial (incluindo id!)
  const getDadosOrcamentoParaProposta = () => {
    return {
      ...formData,
      id: id,
      // ✅ NOVO: Passar dados de embutido para PropostaComercial
      desconto_embutido: descontoEmbutido,
      frete_embutido: freteEmbutido
    }
  }

  // ✅ Obter mensagem de bloqueio
  const getMensagemBloqueio = () => {
    const modo = getModoVisualizacao()
    
    if (modo === 'visualizacao') {
      return {
        titulo: 'Modo Visualização',
        descricao: `Este orçamento está com status "${formData.status.toUpperCase()}" e você não tem permissão para editá-lo. Use "Duplicar" para criar uma nova proposta baseada neste orçamento.`,
        cor: 'blue',
        icone: Eye
      }
    }
    
    if (modo === 'proposta_travada') {
      return {
        titulo: 'Proposta Travada - PDF Gerado',
        descricao: 'Este orçamento possui um PDF gerado e está travado para edição. Para fazer alterações, clique em "Editar Proposta" - isso excluirá o PDF atual.',
        cor: 'amber',
        icone: Lock
      }
    }
    
    if (modo === 'apenas_erp') {
      return {
        titulo: 'Edição Restrita',
        descricao: `Este orçamento está com status "${formData.status.toUpperCase()}". Apenas o número do ERP pode ser alterado.`,
        cor: 'purple',
        icone: AlertTriangle
      }
    }
    
    return null
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

  const mensagemBloqueio = getMensagemBloqueio()
  const modo = getModoVisualizacao()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {mostrarModalSenha && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-full">
                <Lock className="text-yellow-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Desconto de {descontoSolicitado}%</h3>
                <p className="text-sm text-gray-500">
                  {descontoSolicitado > LIMITE_DESCONTO_COMERCIAL 
                    ? 'Requer autorização de um Administrador'
                    : 'Requer autorização de Comercial Interno ou Administrador'}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário {descontoSolicitado > LIMITE_DESCONTO_COMERCIAL ? '(Admin)' : '(Comercial/Admin)'}
                </label>
                <input
                  type="text"
                  value={usuarioLiberacao}
                  onChange={(e) => {
                    setUsuarioLiberacao(e.target.value)
                    setErroSenha(false)
                  }}
                  placeholder="Nome ou email do autorizador..."
                  className={`w-full px-4 py-3 border rounded-lg ${
                    erroSenha ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={senhaLiberacao}
                  onChange={(e) => {
                    setSenhaLiberacao(e.target.value)
                    setErroSenha(false)
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && validarSenha()}
                  placeholder="Senha do autorizador..."
                  className={`w-full px-4 py-3 border rounded-lg ${
                    erroSenha ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            
            {erroSenha && (
              <p className="text-red-600 text-sm mt-3">
                ❌ {descontoSolicitado > LIMITE_DESCONTO_COMERCIAL 
                  ? 'Usuário ou senha inválidos. Apenas Administradores podem liberar acima de 5%.'
                  : 'Usuário ou senha inválidos, ou sem permissão para liberar desconto.'}
              </p>
            )}
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={cancelarSenha}
                disabled={validandoSenha}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={validarSenha}
                disabled={validandoSenha || !usuarioLiberacao || !senhaLiberacao}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {validandoSenha ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Validando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          
          {/* ✅ NOVO: Banner de bloqueio */}
          {mensagemBloqueio && (
            <div className={`mb-4 bg-${mensagemBloqueio.cor}-50 border border-${mensagemBloqueio.cor}-200 rounded-lg p-4`}>
              <div className="flex items-center gap-3">
                <mensagemBloqueio.icone className={`text-${mensagemBloqueio.cor}-600`} size={24} />
                <div className="flex-1">
                  <h3 className={`font-semibold text-${mensagemBloqueio.cor}-900`}>{mensagemBloqueio.titulo}</h3>
                  <p className={`text-sm text-${mensagemBloqueio.cor}-700`}>
                    {mensagemBloqueio.descricao}
                  </p>
                </div>
                
                {/* ✅ Botão Editar Proposta (quando travada por PDF) - AGORA CRIA REVISÃO */}
                {modo === 'proposta_travada' && (isAdmin() || isComercialInterno() || !isStatusBloqueado()) && (
                  <button
                    onClick={solicitarEdicao}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    <Edit3 size={18} />
                    Editar Proposta (Nova Revisão)
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/orcamentos')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              {/* Botão Exportar Excel */}
              <button
                onClick={exportarExcel}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                title="Exportar para Excel"
              >
                <Download size={20} />
                <span className="hidden sm:inline">Exportar</span>
              </button>
              
              {/* Botão Duplicar - sempre visível */}
              <button
                onClick={duplicar}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Copy size={20} />
                <span className="hidden sm:inline">Duplicar</span>
              </button>
              
              {/* ✅ BOTÃO APROVAR MANUAL - Admin/Comercial Interno (não em status bloqueado) */}
              {podeAprovarManual() && (
                <button
                  onClick={aprovarManual}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  title="Aprovar orçamento manualmente"
                >
                  <CheckCircle size={20} />
                  <span className="hidden sm:inline">Aprovar</span>
                </button>
              )}
              
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

        {/* ✅ NOVO: HISTÓRICO DE APROVAÇÃO (aparece em aprovado, lançado, finalizado) */}
        {id && (
          <HistoricoAprovacao 
            orcamentoId={id}
            status={formData.status}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Dados do Orçamento</h2>
            <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg shadow-sm">
              <span className="text-sm font-semibold text-purple-700">📋 Proposta:</span>
              {formData.numero_proposta ? (
                <span className="text-2xl font-bold text-purple-900 tracking-wider">
                  {formData.numero_proposta}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor *</label>
              <select
                value={formData.vendedor}
                onChange={(e) => handleVendedorChange(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isVendedor() ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                disabled={modo !== 'edicao' || isVendedor()}
              >
                <option value="">Selecione...</option>
                {isVendedor() ? (
                  // Vendedor só vê o próprio nome
                  <option value={user?.nome}>{user?.nome}</option>
                ) : (
                  // Admin/Comercial pode escolher qualquer vendedor
                  vendedores.map(v => (
                    <option key={v.id} value={v.nome}>{v.nome}</option>
                  ))
                )}
              </select>
              {isVendedor() && (
                <p className="text-xs text-gray-500 mt-1">🔒 Vendedor não pode alterar</p>
              )}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={modo !== 'edicao' || isVendedor()}
              >
                <option value="rascunho">Rascunho</option>
                <option value="enviado">Enviado</option>
                <option value="aprovado">Aprovado</option>
                {podeAcessarLancamento() && (
                  <option value="lancado">Lançado</option>
                )}
                {podeAcessarLancamento() && (
                  <option value="finalizado">Finalizado</option>
                )}
                <option value="rejeitado">Rejeitado</option>
                <option value="cancelado">Cancelado</option>
              </select>
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
            
            {/* ✅ Campo Data de Entrega (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Entrega
              </label>
              <input
                type="date"
                value={formData.data_entrega}
                onChange={(e) => setFormData({ ...formData, data_entrega: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={modo !== 'edicao'}
              />
            </div>
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
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cliente_telefone}
                onChange={(e) => setFormData({ ...formData, cliente_telefone: e.target.value })}
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
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <EnderecoObraForm
            valores={formData}
            onChange={(dados) => {
              if (modo === 'edicao') {
                setDadosEndereco(dados)
                setFormData(prev => ({ ...prev, ...dados }))
              }
            }}
            disabled={modo !== 'edicao'}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Produtos</h2>
            {/* ✅ CHECKBOX PARA USAR NOME COMPLETO NO PDF */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={usarNomeCompleto}
                onChange={(e) => setUsarNomeCompleto(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-purple-700 font-medium">📝 Usar nome completo no PDF</span>
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* ✅ CABEÇALHO DA TABELA - MODIFICADO COM COLUNAS CONDICIONAIS */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600 w-10">Item</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Produto</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">Classe</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-600">MPa</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Qtd</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Unid.</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600">Preço</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600">Peso Unit.</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Qtd/Pallet</th>
                  <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600">Peso Total</th>
                  
                  {/* COLUNA FRETE - só aparece quando embutido */}
                  {freteEmbutido && (
                    <th className="px-2 py-2 text-right text-xs font-semibold text-indigo-600 bg-indigo-50">
                      Frete Unit.
                    </th>
                  )}
                  
                  {/* COLUNA DESCONTO - só aparece quando embutido */}
                  {descontoEmbutido && (
                    <th className="px-2 py-2 text-right text-xs font-semibold text-green-600 bg-green-50">
                      Desc. Unit.
                    </th>
                  )}
                  
                  <th className="px-2 py-2 text-right text-xs font-semibold text-gray-600">Subtotal</th>
                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Pallets</th>
                  <th className="px-2 py-2 w-16"></th>
                </tr>
              </thead>
              
              {/* ✅ CORPO DA TABELA - MODIFICADO COM COLUNAS CONDICIONAIS */}
              <tbody>
                {produtosSelecionados.map((item, index) => {
                  const precoOriginal = parseFloat(item.preco) || 0
                  const descontoUnit = descontoEmbutido ? getDescontoUnitario(precoOriginal) : 0
                  const freteUnit = freteEmbutido ? getFreteUnitario() : 0
                  const subtotalItem = calcularSubtotalItem(item)
                  
                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1 text-center text-xs font-semibold text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-2 py-1">
                        <select
                          value={item.produto}
                          onChange={(e) => atualizarProduto(index, 'produto', e.target.value)}
                          disabled={modo !== 'edicao'}
                          className="w-40 px-2 py-1 border rounded text-sm"
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
                          disabled={!item.produto || modo !== 'edicao'}
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
                          disabled={!item.classe || modo !== 'edicao'}
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
                          disabled={modo !== 'edicao'}
                          className="w-20 px-2 py-1 border rounded text-sm text-center"
                          min="1"
                        />
                      </td>
                      <td className="px-2 py-1 text-center text-gray-600 text-xs">
                        {item.unidade || 'Unid.'}
                      </td>
                      <td className="px-2 py-1 text-right text-gray-600">
                        {item.preco ? `R$ ${parseFloat(item.preco).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-2 py-1 text-right text-gray-600">
                        {item.peso_unitario ? `${item.peso_unitario} kg` : '-'}
                      </td>
                      <td className="px-2 py-1 text-center">
                        {item.qtd_por_pallet ? (
                          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold min-w-[40px]">
                            {item.qtd_por_pallet}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-1 text-right text-gray-600">
                        {item.peso_unitario && item.quantidade 
                          ? `${((item.peso_unitario * item.quantidade) / 1000).toFixed(2)} ton` 
                          : '-'} 
                      </td>
                      
                      {/* COLUNA FRETE UNITÁRIO - só aparece quando embutido */}
                      {freteEmbutido && (
                        <td className="px-2 py-1 text-right text-indigo-600 bg-indigo-50/50 font-medium">
                          {freteUnit > 0 ? `+ R$ ${freteUnit.toFixed(2)}` : '-'}
                        </td>
                      )}
                      
                      {/* COLUNA DESCONTO UNITÁRIO - só aparece quando embutido */}
                      {descontoEmbutido && (
                        <td className="px-2 py-1 text-right text-green-600 bg-green-50/50 font-medium">
                          {descontoUnit > 0 ? `- R$ ${descontoUnit.toFixed(2)}` : '-'}
                        </td>
                      )}
                      
                      <td className="px-2 py-1 text-right font-semibold text-gray-900">
                        {subtotalItem > 0
                          ? `R$ ${subtotalItem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
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
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => inserirProdutoEm(index)}
                            disabled={modo !== 'edicao'}
                            className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Inserir produto abaixo"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => removerProduto(index)}
                            disabled={modo !== 'edicao'}
                            className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remover produto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ✅ NOVO: COMPONENTE DE CONTROLES PARA EMBUTIR VALORES */}
        <EmbutirValoresControles
          descontoEmbutido={descontoEmbutido}
          freteEmbutido={freteEmbutido}
          onDescontoEmbutidoChange={setDescontoEmbutido}
          onFreteEmbutidoChange={setFreteEmbutido}
          percentualDesconto={parseFloat(formData.desconto_geral) || 0}
          freteTotal={dadosFrete?.valor_total_frete || 0}
          totalUnidades={calcularTotalUnidadesProdutos()}
          disabled={modo !== 'edicao'}
          isAdmin={isAdmin()}
          onValidarSenhaAdmin={validarSenhaAdmin}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <FreteSelector 
            pesoTotal={calcularPesoTotal()}
            totalPallets={calcularTotalPallets()}
            onFreteChange={(dados) => {
              if (modo === 'edicao') {
                setDadosFrete(dados)
              }
            }}
            freteAtual={dadosFrete}
            disabled={modo !== 'edicao'}
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Observações</h2>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                rows="10"
                disabled={modo !== 'edicao'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Observações adicionais que aparecerão na proposta comercial..."
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Resumo Financeiro</h2>
              <div className="space-y-2">
                {/* ✅ MODIFICADO: Subtotal sem embutir (para referência) */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Subtotal Produtos {(descontoEmbutido || freteEmbutido) ? '(original)' : ''}:
                  </span>
                  <span className="font-medium">
                    R$ {calcularSubtotalProdutosSemEmbutido().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* ✅ NOVO: Mostrar valor embutido no subtotal se aplicável */}
                {(descontoEmbutido || freteEmbutido) && (
                  <div className="flex justify-between text-sm bg-indigo-50 px-2 py-1 rounded">
                    <span className="text-indigo-700 font-medium">
                      Subtotal (com valores embutidos):
                    </span>
                    <span className="font-semibold text-indigo-700">
                      R$ {calcularSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* ✅ MODIFICADO: Desconto - mostra diferente se embutido */}
                <div className={`flex justify-between items-center ${descontoEmbutido ? 'opacity-50' : ''}`}>
                  <label className="text-sm text-gray-600 flex items-center gap-1 flex-wrap">
                    Desconto (%):
                    {descontoEmbutido && (
                      <span className="text-xs text-green-600 flex items-center gap-0.5">
                        ✓ Embutido no valor unitário
                      </span>
                    )}
                    {!descontoEmbutido && !descontoLiberado && !descontoTravado && (
                      <span className="text-xs text-yellow-600 flex items-center gap-0.5">
                        <Lock size={10} /> máx {LIMITE_DESCONTO}%
                      </span>
                    )}
                    {!descontoEmbutido && descontoTravado && descontoLiberadoPor && (
                      <span className="text-xs text-blue-600 flex items-center gap-0.5" title={`Liberado por ${descontoLiberadoPor.nome} em ${descontoLiberadoPor.data}\nPara alterar, clique no campo.`}>
                        🔒 {descontoLiberadoPor.nome} ({descontoLiberadoPor.data})
                      </span>
                    )}
                    {!descontoEmbutido && descontoLiberado && !descontoTravado && descontoLiberadoPor && (
                      <span className="text-xs text-green-600">
                        ✓ liberado por {descontoLiberadoPor.nome}
                      </span>
                    )}
                    {!descontoEmbutido && descontoLiberado && !descontoLiberadoPor && (
                      <span className="text-xs text-green-600">✓ liberado</span>
                    )}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      max={descontoLiberado ? 100 : LIMITE_DESCONTO}
                      value={formData.desconto_geral}
                      onChange={(e) => handleDescontoChange(e.target.value)}
                      disabled={modo !== 'edicao' || descontoEmbutido}
                      className={`w-20 px-2 py-1 border rounded text-center text-sm ${
                        descontoEmbutido
                          ? 'border-green-400 bg-green-50 cursor-not-allowed'
                          : descontoTravado 
                            ? 'border-blue-400 bg-blue-50 cursor-pointer' 
                            : formData.desconto_geral > LIMITE_DESCONTO 
                              ? 'border-yellow-400 bg-yellow-50' 
                              : 'border-gray-300'
                      }`}
                    />
                    {descontoTravado && modo === 'edicao' && !descontoEmbutido && (
                      <button
                        type="button"
                        onClick={() => setMostrarModalSenha(true)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Alterar desconto (requer autorização)"
                      >
                        <Lock size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* ✅ MODIFICADO: Subtotal com desconto - oculto se embutido */}
                {!descontoEmbutido && (
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-700 font-medium">Subtotal de Produtos:</span>
                    <span className="font-semibold">
                      R$ {(calcularSubtotalProdutosSemEmbutido() - (calcularSubtotalProdutosSemEmbutido() * (formData.desconto_geral || 0) / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* ✅ MODIFICADO: Frete - mostra diferente se embutido */}
                <div className={`flex justify-between text-sm ${freteEmbutido ? 'opacity-50' : ''}`}>
                  <span className="text-gray-600">
                    Total Frete:
                    {freteEmbutido && (
                      <span className="text-xs text-green-600 ml-1">
                        (Embutido no valor unitário)
                      </span>
                    )}
                  </span>
                  <span className="font-medium">
                    {freteEmbutido 
                      ? 'R$ 0,00' 
                      : `R$ ${(dadosFrete?.valor_total_frete || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    }
                  </span>
                </div>

                <div className="flex justify-between items-center border-t-2 border-blue-200 pt-3 mt-2">
                  <span className="text-lg font-bold text-gray-900">Total Geral:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condições de Pagamento *
                  </label>
                  <SearchableSelectFormaPagamento
                    value={formData.forma_pagamento_id}
                    onChange={(id) => {
                      if (modo === 'edicao') {
                        setFormData({ ...formData, forma_pagamento_id: id })
                      }
                    }}
                    placeholder="Digite para buscar (ex: 28, pix, boleto)..."
                    disabled={modo !== 'edicao'}
                  />
                </div>
              </div>
            </div>
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
        </div>

        {/* ✅ NOVO: LOG DE REVISÕES */}
        {id && requerRevisao(formData.status) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <LogRevisoes 
              orcamentoId={id}
              revisaoAtual={revisaoAtual}
            />
          </div>
        )}

        {/* ✅ NOVO: DOCUMENTOS ANEXADOS */}
        {id && (
          <DocumentosAnexados 
            orcamentoId={id}
            disabled={modo === 'visualizacao'}
          />
        )}
      </div>

      {/* ✅ NOVO: Modal Motivo da Revisão */}
      {mostrarModalRevisao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🕐</span>
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

      {/* ✅ CORRIGIDO: Passar callback onPdfGerado e dados de embutido */}
      <PropostaComercial
        isOpen={mostrarProposta}
        onClose={() => setMostrarProposta(false)}
        dadosOrcamento={getDadosOrcamentoParaProposta()}
        produtos={produtosSelecionados.map(p => {
          // Buscar nome_completo do produto original no banco
          const produtoOriginal = produtos.find(prod => 
            prod.produto === p.produto && prod.classe === p.classe && prod.mpa === p.mpa
          )
          return {
            ...p,
            nome_completo: produtoOriginal?.nome_completo || null,
            desconto_unitario: descontoEmbutido ? getDescontoUnitario(p.preco) : 0,
            frete_unitario: freteEmbutido ? getFreteUnitario() : 0
          }
        })}
        dadosFrete={dadosFrete}
        propostaId={propostaIdAtual}
        onPdfGerado={handlePdfGerado}
        usarNomeCompleto={usarNomeCompleto}
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
