import { useState, useRef, useEffect } from 'react'
import { X, Printer, Upload, Check } from 'lucide-react'
import { supabase } from '../services/supabase'
import { gerarESalvarPdfProposta } from '../utils/propostaPdfUtils'
import logoConstrucom from '../assets/logo-construcom.png'

export default function PropostaComercial({ 
  isOpen, 
  onClose, 
  dadosOrcamento, 
  produtos, 
  dadosFrete,
  propostaId,
  onPdfGerado
}) {
  const printRef = useRef()
  const [formaPagamento, setFormaPagamento] = useState(null)
  const [loading, setLoading] = useState(true)
  const [salvandoPdf, setSalvandoPdf] = useState(false)
  const [pdfSalvo, setPdfSalvo] = useState(false)
  const [propostaIdLocal, setPropostaIdLocal] = useState(propostaId)

  useEffect(() => {
    if (isOpen && dadosOrcamento?.forma_pagamento_id) {
      carregarFormaPagamento()
    } else {
      setLoading(false)
    }
    
    // Verificar se já existe proposta com PDF para este orçamento
    if (isOpen && dadosOrcamento?.id) {
      verificarPropostaExistente()
    }
  }, [isOpen, dadosOrcamento?.forma_pagamento_id, dadosOrcamento?.id])

  // Atualizar propostaIdLocal quando propostaId prop mudar
  useEffect(() => {
    if (propostaId) {
      setPropostaIdLocal(propostaId)
    }
  }, [propostaId])

  const verificarPropostaExistente = async () => {
    try {
      const { data, error } = await supabase
        .from('propostas')
        .select('id, pdf_path')
        .eq('orcamento_id', dadosOrcamento.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0) {
        setPropostaIdLocal(data[0].id)
        if (data[0].pdf_path) {
          setPdfSalvo(true)
          console.log('✅ Proposta existente com PDF encontrada:', data[0].id)
        }
      }
    } catch (e) {
      console.error('Erro ao verificar proposta existente:', e)
    }
  }

  const carregarFormaPagamento = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('formas_pagamento')
        .select('descricao')
        .eq('id', dadosOrcamento.forma_pagamento_id)
        .single()

      if (error) {
        console.error('Erro ao carregar forma de pagamento:', error)
        setFormaPagamento(null)
      } else {
        setFormaPagamento(data)
      }
    } catch (error) {
      console.error('Erro ao carregar forma de pagamento:', error)
      setFormaPagamento(null)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Calcular totais
  const totalProdutos = produtos.reduce((acc, p) => {
    const qty = parseFloat(p.quantidade) || 0
    const price = parseFloat(p.preco) || 0
    return acc + (qty * price)
  }, 0)
  const desconto = (totalProdutos * (parseFloat(dadosOrcamento.desconto_geral) || 0)) / 100
  const totalProdutosComDesconto = totalProdutos - desconto
  const totalFrete = parseFloat(dadosFrete?.valor_total_frete) || 0
  const totalGeral = totalProdutosComDesconto + totalFrete

  const formatarData = (dataStr) => {
    if (!dataStr) return ''
    const data = new Date(dataStr + 'T00:00:00')
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatarValor = (valor) => {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const getTipoFreteExibicao = () => {
    const modalidade = dadosFrete?.modalidade || 'FOB'
    if (modalidade === 'FOB') return 'FOB (Cliente Retira)'
    if (modalidade === 'CIF_SEM_DESCARGA') return 'CIF - Sem Descarga'
    if (modalidade === 'CIF_COM_DESCARGA') return 'CIF - Com Descarga'
    return modalidade
  }

  const getMensagemFrete = () => {
    const modalidade = dadosFrete?.modalidade || 'FOB'
    if (modalidade === 'FOB') return 'FRETE POR CONTA DO CLIENTE'
    if (modalidade === 'CIF_SEM_DESCARGA') return 'DESCARGA POR CONTA DO CLIENTE'
    if (modalidade === 'CIF_COM_DESCARGA') return 'FRETE COM DESCARGA INCLUSA'
    return 'FRETE POR CONTA DO CLIENTE'
  }

  const isCIF = () => {
    const modalidade = dadosFrete?.modalidade || 'FOB'
    return modalidade === 'CIF_SEM_DESCARGA' || modalidade === 'CIF_COM_DESCARGA'
  }

  const getEnderecoCompacto = () => {
    const partes = []
    if (dadosOrcamento.obra_logradouro) partes.push(dadosOrcamento.obra_logradouro)
    if (dadosOrcamento.obra_numero) partes.push(dadosOrcamento.obra_numero)
    if (dadosOrcamento.obra_bairro) partes.push(dadosOrcamento.obra_bairro)
    if (dadosOrcamento.obra_cidade) partes.push(dadosOrcamento.obra_cidade)
    if (dadosOrcamento.obra_cep) partes.push(`CEP: ${dadosOrcamento.obra_cep}`)
    return partes.join(', ')
  }

  const imprimir = () => {
    const conteudo = printRef.current.innerHTML
    const janela = window.open('', '_blank')
    janela.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proposta ${dadosOrcamento.numero_proposta || dadosOrcamento.numero}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #333; line-height: 1.4; }
          @page { margin: 12mm; size: A4; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${conteudo}</body>
      </html>
    `)
    janela.document.close()
    setTimeout(() => { janela.print(); janela.close() }, 300)
  }

  // ✅ Criar ou buscar proposta automaticamente
  const obterOuCriarProposta = async () => {
    // Se já temos um ID, usar ele
    if (propostaIdLocal) {
      return propostaIdLocal
    }

    // Verificar se já existe proposta para este orçamento
    const { data: existente, error: erroConsulta } = await supabase
      .from('propostas')
      .select('id')
      .eq('orcamento_id', dadosOrcamento.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!erroConsulta && existente && existente.length > 0) {
      setPropostaIdLocal(existente[0].id)
      return existente[0].id
    }

    // Criar nova proposta
    const token = crypto.randomUUID().replace(/-/g, '')
    const dataExpiracao = new Date()
    dataExpiracao.setDate(dataExpiracao.getDate() + (dadosOrcamento.validade_dias || 15))

    const { data: novaProposta, error: erroCriacao } = await supabase
      .from('propostas')
      .insert({
        orcamento_id: dadosOrcamento.id,
        vendedor_id: dadosOrcamento.usuario_id || dadosOrcamento.usuario_id_original,
        token_aceite: token,
        numero_proposta: dadosOrcamento.numero_proposta || dadosOrcamento.numero,
        valor_total: totalGeral,
        total_produtos: totalProdutosComDesconto,
        total_frete: totalFrete,
        tipo_frete: dadosFrete?.modalidade || 'FOB',
        status: 'rascunho',
        data_expiracao: dataExpiracao.toISOString()
      })
      .select()
      .single()

    if (erroCriacao) {
      console.error('Erro ao criar proposta:', erroCriacao)
      throw new Error('Não foi possível criar a proposta: ' + erroCriacao.message)
    }

    console.log('✅ Proposta criada:', novaProposta.id)
    setPropostaIdLocal(novaProposta.id)
    return novaProposta.id
  }

  // Salvar PDF para envio por email
  const salvarPdfParaEnvio = async () => {
    if (!dadosOrcamento?.id) {
      alert('Erro: Salve o orçamento primeiro antes de gerar o PDF.')
      return
    }

    setSalvandoPdf(true)
    try {
      // 1. Obter ou criar proposta
      console.log('📋 Obtendo/criando proposta...')
      const idProposta = await obterOuCriarProposta()
      
      if (!idProposta) {
        throw new Error('Não foi possível obter o ID da proposta')
      }

      // 2. Gerar e salvar PDF
      const numeroProposta = dadosOrcamento.numero_proposta || dadosOrcamento.numero
      console.log('📄 Gerando PDF para proposta:', idProposta)
      
      const resultado = await gerarESalvarPdfProposta(
        printRef.current,
        idProposta,
        numeroProposta
      )

      if (resultado.sucesso) {
        setPdfSalvo(true)
        if (onPdfGerado) {
          onPdfGerado(resultado.pdfUrl, resultado.pdfPath)
        }
        alert('✅ PDF salvo com sucesso! Agora você pode enviar a proposta por email.')
      } else {
        throw resultado.error || new Error('Falha ao salvar PDF')
      }
    } catch (error) {
      console.error('Erro ao salvar PDF:', error)
      alert('❌ Erro ao salvar PDF: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setSalvandoPdf(false)
    }
  }

  // Estilos
  const styles = {
    container: { maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '20px' },
    secaoTitulo: { backgroundColor: '#4c7f8a', color: '#fff', padding: '5px 12px', fontSize: '10px', fontWeight: 'bold', marginBottom: '8px' },
    label: { fontSize: '8px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' },
    valor: { fontSize: '11px', color: '#333' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '9px' },
    th: { backgroundColor: '#e2e8f0', padding: '5px 8px', textAlign: 'left', fontWeight: 'bold', borderBottom: '1px solid #cbd5e0', fontSize: '8px' },
    thRight: { backgroundColor: '#e2e8f0', padding: '5px 8px', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #cbd5e0', fontSize: '8px' },
    td: { padding: '4px 8px', borderBottom: '1px solid #e2e8f0', fontSize: '9px' },
    tdRight: { padding: '4px 8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontSize: '9px' },
    clausulaTitulo: { fontSize: '9px', fontWeight: 'bold', color: '#4c7f8a', marginBottom: '3px' },
    clausulaTexto: { fontSize: '8px', color: '#4a5568', paddingLeft: '8px', lineHeight: '1.5' }
  }

  // Verificar se pode mostrar o botão de salvar
  const podeSalvarPdf = dadosOrcamento?.id && dadosOrcamento?.numero_proposta

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '8px', width: '100%', maxWidth: '900px', maxHeight: '95vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Modal */}
        <div style={{ backgroundColor: '#4c7f8a', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Proposta Comercial - Pré-visualização</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px', backgroundColor: '#f0f0f0' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Carregando proposta...</div>
          ) : (
            <div ref={printRef} style={styles.container}>
              
              {/* ========== HEADER ========== */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '3px solid #4c7f8a', paddingBottom: '12px', marginBottom: '12px' }}>
                <img src={logoConstrucom} alt="Construcom" style={{ height: '45px', maxWidth: '140px' }} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4c7f8a' }}>PROPOSTA COMERCIAL</div>
                  <div style={{ fontSize: '14px', color: '#9333ea', fontWeight: 'bold' }}>
                    {dadosOrcamento.numero_proposta || dadosOrcamento.numero}
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>{formatarData(dadosOrcamento.data_orcamento)} | Pedro Leopoldo - MG</div>
                </div>
              </div>

              {/* ========== CLIENTE EM DESTAQUE ========== */}
              <div style={{ backgroundColor: '#f0f7f8', border: '2px solid #4c7f8a', borderRadius: '8px', padding: '12px 15px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <div style={{ fontSize: '8px', color: '#4c7f8a', fontWeight: 'bold', marginBottom: '2px' }}>PROPOSTA PARA</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2d3748' }}>
                      {dadosOrcamento.cliente_nome || dadosOrcamento.cliente_empresa || 'Cliente'}
                    </div>
                    {dadosOrcamento.cnpj_cpf && (
                      <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                        CNPJ/CPF: {dadosOrcamento.cnpj_cpf}
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '10px', color: '#4a5568' }}>
                    {dadosOrcamento.cliente_empresa && dadosOrcamento.cliente_nome && (
                      <div><strong>Contato:</strong> {dadosOrcamento.cliente_empresa}</div>
                    )}
                    {dadosOrcamento.cliente_telefone && <div>📞 {dadosOrcamento.cliente_telefone}</div>}
                    {dadosOrcamento.cliente_email && <div>✉️ {dadosOrcamento.cliente_email}</div>}
                  </div>
                </div>
              </div>

              {/* ========== PRODUTOS ========== */}
              <div style={{ marginBottom: '10px' }}>
                <div style={styles.secaoTitulo}>01. PRODUTOS</div>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Material</th>
                      <th style={styles.th}>Classe</th>
                      <th style={styles.th}>MPa</th>
                      <th style={styles.thRight}>Qtd</th>
                      <th style={styles.thRight}>Valor Unit.</th>
                      <th style={styles.thRight}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((p, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                        <td style={styles.td}>{p.produto}</td>
                        <td style={styles.td}>{p.classe || '-'}</td>
                        <td style={styles.td}>{p.mpa || '-'}</td>
                        <td style={styles.tdRight}>{parseFloat(p.quantidade).toLocaleString('pt-BR')}</td>
                        <td style={styles.tdRight}>{formatarValor(p.preco)}</td>
                        <td style={{ ...styles.tdRight, fontWeight: 'bold' }}>{formatarValor(p.quantidade * p.preco)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ========== FRETE COMPACTO ========== */}
              <div style={{ marginBottom: '10px' }}>
                <div style={styles.secaoTitulo}>02. FRETE</div>
                <div style={{ backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '8px', color: '#666' }}>MODALIDADE</span>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4c7f8a' }}>{getTipoFreteExibicao()}</div>
                      </div>
                      {isCIF() && dadosFrete?.localidade && (
                        <div>
                          <span style={{ fontSize: '8px', color: '#666' }}>DESTINO</span>
                          <div style={{ fontSize: '11px', fontWeight: '500' }}>{dadosFrete.localidade}</div>
                        </div>
                      )}
                      {isCIF() && dadosFrete?.viagens_necessarias > 0 && (
                        <div>
                          <span style={{ fontSize: '8px', color: '#666' }}>VIAGENS</span>
                          <div style={{ fontSize: '11px', fontWeight: '500' }}>{dadosFrete.viagens_necessarias}x de {formatarValor(dadosFrete.valor_unitario_viagem)}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '8px', color: '#666' }}>TOTAL FRETE</span>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#c05621' }}>
                        {totalFrete > 0 ? formatarValor(totalFrete) : 'SEM FRETE'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Endereço compacto */}
                  {isCIF() && getEnderecoCompacto() && (
                    <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #cbd5e0', fontSize: '9px', color: '#4a5568' }}>
                      📍 {getEnderecoCompacto()}
                    </div>
                  )}
                  
                  {/* Aviso */}
                  <div style={{ marginTop: '6px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '4px', padding: '4px 8px', fontSize: '9px', fontWeight: 'bold', color: '#92400e', textAlign: 'center' }}>
                    ⚠️ {getMensagemFrete()}
                  </div>
                </div>
              </div>

              {/* ========== TOTAIS + PAGAMENTO JUNTOS ========== */}
              <div style={{ backgroundColor: '#4c7f8a', borderRadius: '8px', padding: '12px 15px', marginBottom: '12px', color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '25px' }}>
                    <div>
                      <div style={{ fontSize: '8px', opacity: 0.8 }}>PRODUTOS</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{formatarValor(totalProdutosComDesconto)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '8px', opacity: 0.8 }}>FRETE</div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{totalFrete > 0 ? formatarValor(totalFrete) : '—'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '20px' }}>
                    <div style={{ fontSize: '8px', opacity: 0.8 }}>TOTAL DA PROPOSTA</div>
                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f6ad55' }}>{formatarValor(totalGeral)}</div>
                  </div>
                </div>
                
                {/* Pagamento + Validade integrados */}
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '8px', opacity: 0.8 }}>CONDIÇÃO DE PAGAMENTO</div>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {formaPagamento?.descricao || dadosOrcamento.condicoes_pagamento || 'A DEFINIR'}
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(246,173,85,0.2)', padding: '5px 12px', borderRadius: '15px', border: '1px solid #f6ad55' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#f6ad55' }}>
                      ⏱️ Válida por {dadosOrcamento.validade_dias || 15} dias
                    </span>
                  </div>
                </div>
              </div>

              {/* ========== TERMOS E CONDIÇÕES ========== */}
              <div style={{ marginBottom: '10px' }}>
                <div style={styles.secaoTitulo}>TERMOS E CONDIÇÕES</div>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={styles.clausulaTitulo}>03. VALIDADE DA PROPOSTA</div>
                  <div style={styles.clausulaTexto}>• Os preços são válidos por até 60 dias após o aceite.</div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={styles.clausulaTitulo}>04. PROGRAMAÇÃO DE ENTREGA</div>
                  <div style={styles.clausulaTexto}>
                    • O cronograma geral da obra deve ser entregue junto com este documento.<br/>
                    • Qualquer alteração deve ser comunicada antecipadamente.<br/>
                    • Programações devem ser enviadas até quarta-feira da semana anterior.<br/>
                    • Prazo médio de fabricação: 7 dias úteis após confirmação.<br/>
                    • Produtos acima de 10 MPa necessitam validação com equipe técnica.<br/>
                    • Não são aceitas devoluções por erro de especificação.
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={styles.clausulaTitulo}>05. GARANTIA DOS PRODUTOS</div>
                  <div style={styles.clausulaTexto}>
                    • Garantia de 5 anos contra defeito de fabricação.<br/>
                    • Válida desde que respeitadas as cargas e finalidades indicadas.<br/>
                    • Avarias devem ser registradas no ato do recebimento.
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={styles.clausulaTitulo}>06. QUALIDADE</div>
                  <div style={styles.clausulaTexto}>
                    • Laboratório próprio para controle de qualidade.<br/>
                    • Laudos de resistência à carga disponíveis.<br/>
                    • Variações de coloração são naturais e não caracterizam defeito.<br/>
                    • Eflorescência é fenômeno natural.
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={styles.clausulaTitulo}>07. CANCELAMENTOS E ACRÉSCIMOS</div>
                  <div style={styles.clausulaTexto}>
                    • Produtos sob encomenda só podem ser cancelados antes da fabricação.<br/>
                    • Produtos acima de 8,0 MPa são fabricados sob demanda.<br/>
                    • Cancelamento/redução acarreta multa de 15% (exceto se não iniciou fabricação ou redução &lt; 10%).
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={styles.clausulaTitulo}>10. CARREGAMENTO E DESCARGA</div>
                  <div style={styles.clausulaTexto}>
                    • Descarga pode ser negociada; na ausência, é responsabilidade do CLIENTE.<br/>
                    • Não carregamos caminhões bascula.<br/>
                    • Atraso &gt;2h na descarga: cobrança adicional de 20% do frete por hora.<br/>
                    • Entrega não realizada por culpa do cliente: frete ida + 60% retorno.
                  </div>
                </div>

                <div style={{ marginBottom: '8px' }}>
                  <div style={styles.clausulaTitulo}>11. PALLETS</div>
                  <div style={styles.clausulaTexto}>
                    • Pallets são bens consignados e devem ser devolvidos em perfeitas condições.<br/>
                    • Danos, extravios ou não devolução: cobrança de R$ 50,00/unidade.<br/>
                    • Não devolução pode suspender entregas futuras.
                  </div>
                </div>

                {/* Observações */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={styles.clausulaTitulo}>12. OBSERVAÇÕES FINAIS</div>
                  <div style={{ fontSize: '9px', backgroundColor: '#fffbeb', border: '1px dashed #d69e2e', padding: '8px', borderRadius: '4px' }}>
                    {dadosOrcamento.observacoes || 'Esta proposta não possui observações adicionais.'}
                  </div>
                </div>
              </div>

              {/* ========== RODAPÉ ========== */}
              <div style={{ borderTop: '2px solid #4c7f8a', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontStyle: 'italic', color: '#666', marginBottom: '4px', fontSize: '10px' }}>Atenciosamente,</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4c7f8a' }}>CONSTRUCOM</div>
                  <div style={{ fontSize: '10px', marginTop: '6px', color: '#4a5568' }}>
                    <strong>{dadosOrcamento.vendedor || 'Vendedor'}</strong><br/>
                    {dadosOrcamento.cliente_empresa && dadosOrcamento.cliente_nome && (
                      <span style={{ color: '#666' }}>{dadosOrcamento.cliente_empresa}<br/></span>
                    )}
                    {dadosOrcamento.vendedor_telefone && <span>📞 {dadosOrcamento.vendedor_telefone}</span>}
                    {dadosOrcamento.vendedor_telefone && dadosOrcamento.vendedor_email && <span> • </span>}
                    {dadosOrcamento.vendedor_email && <span>✉️ {dadosOrcamento.vendedor_email}</span>}
                  </div>
                </div>
                <div style={{ backgroundColor: '#4c7f8a', color: '#fff', padding: '8px 15px', textAlign: 'center', borderRadius: '6px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f6ad55' }}>{dadosOrcamento.validade_dias || 15}</div>
                  <div style={{ fontSize: '8px' }}>dias de validade</div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Ações */}
        <div style={{ backgroundColor: '#f0f0f0', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #ddd', flexWrap: 'wrap' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Fechar
          </button>
          <button 
            onClick={imprimir} 
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#4c7f8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.5 : 1 }}
          >
            <Printer size={18} />
            Imprimir
          </button>
          
          {/* ✅ BOTÃO SEMPRE VISÍVEL SE ORÇAMENTO TIVER NÚMERO */}
          {podeSalvarPdf ? (
            <button 
              onClick={salvarPdfParaEnvio} 
              disabled={loading || salvandoPdf}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: pdfSalvo ? '#10b981' : '#9333ea', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: (loading || salvandoPdf) ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                opacity: (loading || salvandoPdf) ? 0.7 : 1 
              }}
            >
              {salvandoPdf ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                  Salvando...
                </>
              ) : pdfSalvo ? (
                <>
                  <Check size={18} />
                  PDF Salvo!
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Salvar para Envio
                </>
              )}
            </button>
          ) : (
            <button 
              disabled
              title="Salve o orçamento primeiro para gerar o número da proposta"
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#9ca3af', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'not-allowed', 
                fontWeight: 'bold', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                opacity: 0.6 
              }}
            >
              <Upload size={18} />
              Salve primeiro
            </button>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  )
}
