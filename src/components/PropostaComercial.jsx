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
    
    if (isOpen && dadosOrcamento?.id) {
      verificarPropostaExistente()
    }
  }, [isOpen, dadosOrcamento?.forma_pagamento_id, dadosOrcamento?.id])

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
    } catch (error) {
      console.error('Erro ao verificar proposta existente:', error)
    }
  }

  const carregarFormaPagamento = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('formas_pagamento')
        .select('*')
        .eq('id', dadosOrcamento.forma_pagamento_id)
        .single()
      
      if (!error && data) {
        setFormaPagamento(data)
      }
    } catch (error) {
      console.error('Erro ao carregar forma de pagamento:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Formatadores
  const formatarData = (data) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarValor = (valor) => {
    if (!valor && valor !== 0) return '-'
    return `R$ ${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  // Cálculos
  const subtotalProdutos = produtos.reduce((acc, p) => acc + (p.quantidade * p.preco), 0)
  const totalFrete = dadosFrete?.valor_total_frete || 0
  const desconto = dadosOrcamento.desconto_geral || 0
  const valorDesconto = (subtotalProdutos + totalFrete) * (desconto / 100)
  const valorTotal = subtotalProdutos + totalFrete - valorDesconto

  // Peso total
  const pesoTotal = produtos.reduce((acc, p) => {
    const peso = p.peso_unitario || 0
    return acc + (peso * p.quantidade)
  }, 0)

  // Funções auxiliares de frete
  const isCIF = () => {
    const modalidade = dadosFrete?.modalidade || ''
    return modalidade.toLowerCase().includes('cif') || 
           modalidade.toLowerCase().includes('frete incluso') ||
           modalidade.toLowerCase().includes('entrega')
  }

  const getTipoFreteExibicao = () => {
    if (!dadosFrete?.modalidade) return 'FOB - Retira'
    const modalidade = dadosFrete.modalidade
    if (modalidade.toLowerCase().includes('cif')) return 'CIF - Frete Incluso'
    if (modalidade.toLowerCase().includes('fob')) return 'FOB - Retira'
    return modalidade
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

  // Imprimir
  const handlePrint = () => {
    const conteudo = printRef.current.innerHTML
    const janela = window.open('', '_blank')
    janela.document.write(`
      <html>
        <head>
          <title>Proposta ${dadosOrcamento.numero_proposta || dadosOrcamento.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>${conteudo}</body>
      </html>
    `)
    janela.document.close()
    setTimeout(() => { janela.print(); janela.close() }, 300)
  }

  // Salvar PDF
  const handleSalvarPdf = async () => {
    if (!dadosOrcamento?.id) {
      alert('Erro: Salve o orçamento primeiro antes de gerar o PDF.')
      return
    }

    try {
      setSalvandoPdf(true)

      let idProposta = propostaIdLocal

      if (!idProposta) {
        const { data: novaProposta, error: erroProposta } = await supabase
          .from('propostas')
          .insert({
            orcamento_id: dadosOrcamento.id,
            numero_proposta: dadosOrcamento.numero_proposta || dadosOrcamento.numero,
            valor_total: valorTotal,
            status: 'gerada',
            vendedor_id: dadosOrcamento.usuario_id_original, // ✅ CORREÇÃO: Adicionado vendedor_id
            data_expiracao: new Date(Date.now() + (dadosOrcamento.validade_dias || 15) * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single()

        if (erroProposta) throw erroProposta
        idProposta = novaProposta.id
        setPropostaIdLocal(idProposta)
      }

      console.log('📄 Gerando PDF para proposta:', idProposta)

      const resultado = await gerarESalvarPdfProposta(
        printRef.current,
        idProposta,
        dadosOrcamento.numero_proposta || dadosOrcamento.numero,
        dadosOrcamento.cliente_nome
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

  // ✅ ESTILOS OTIMIZADOS PARA PDF
  const styles = {
    container: { 
      width: '794px',
      maxWidth: '794px', 
      margin: '0 auto', 
      backgroundColor: '#ffffff', 
      padding: '20px',
      fontFamily: 'Arial, Helvetica, sans-serif',
      WebkitFontSmoothing: 'antialiased',
      lineHeight: '1.4'
    },
    secaoTitulo: { 
      backgroundColor: '#4c7f8a', 
      color: '#ffffff', 
      padding: '6px 12px', 
      fontSize: '11px',
      fontWeight: 'bold', 
      marginBottom: '8px',
      letterSpacing: '0.5px'
    },
    table: { 
      width: '100%', 
      borderCollapse: 'collapse', 
      fontSize: '10px',
      tableLayout: 'fixed'
    },
    th: { 
      backgroundColor: '#e2e8f0', 
      padding: '8px 10px',
      textAlign: 'left', 
      fontWeight: 'bold', 
      borderBottom: '2px solid #cbd5e0',
      fontSize: '9px',
      verticalAlign: 'middle'
    },
    thRight: { 
      backgroundColor: '#e2e8f0', 
      padding: '8px 10px', 
      textAlign: 'right', 
      fontWeight: 'bold', 
      borderBottom: '2px solid #cbd5e0', 
      fontSize: '9px',
      verticalAlign: 'middle'
    },
    td: { 
      padding: '6px 10px',
      borderBottom: '1px solid #e2e8f0', 
      fontSize: '10px',
      verticalAlign: 'middle'
    },
    tdRight: { 
      padding: '6px 10px', 
      borderBottom: '1px solid #e2e8f0', 
      textAlign: 'right', 
      fontSize: '10px',
      verticalAlign: 'middle'
    },
    clausulaTitulo: { 
      fontSize: '10px',
      fontWeight: 'bold', 
      color: '#4c7f8a', 
      marginBottom: '3px',
      marginTop: '6px'
    },
    clausulaTexto: { 
      fontSize: '9px',
      color: '#4a5568', 
      paddingLeft: '8px', 
      lineHeight: '1.5'
    }
  }

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

              {/* ========== CLIENTE ========== */}
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
                      <th style={{...styles.th, width: '30%'}}>Material</th>
                      <th style={{...styles.th, width: '12%'}}>Classe</th>
                      <th style={{...styles.th, width: '10%'}}>MPa</th>
                      <th style={{...styles.thRight, width: '10%'}}>Qtd</th>
                      <th style={{...styles.th, width: '8%'}}>Unid.</th>
                      <th style={{...styles.thRight, width: '15%'}}>Valor Unit.</th>
                      <th style={{...styles.thRight, width: '15%'}}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((p, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                        <td style={styles.td}>{p.produto}</td>
                        <td style={styles.td}>{p.classe || '-'}</td>
                        <td style={styles.td}>{p.mpa || '-'}</td>
                        <td style={styles.tdRight}>{parseFloat(p.quantidade).toLocaleString('pt-BR')}</td>
                        <td style={styles.td}>{p.unidade || 'Unid.'}</td>
                        <td style={styles.tdRight}>{formatarValor(p.preco)}</td>
                        <td style={{ ...styles.tdRight, fontWeight: 'bold' }}>{formatarValor(p.quantidade * p.preco)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ========== FRETE ========== */}
              <div style={{ marginBottom: '10px' }}>
                <div style={styles.secaoTitulo}>02. FRETE</div>
                <div style={{ backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '8px', color: '#666', display: 'block' }}>MODALIDADE</span>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4c7f8a' }}>{getTipoFreteExibicao()}</div>
                      </div>
                      {isCIF() && dadosFrete?.localidade && (
                        <div>
                          <span style={{ fontSize: '8px', color: '#666', display: 'block' }}>DESTINO</span>
                          <div style={{ fontSize: '11px', fontWeight: '500' }}>{dadosFrete.localidade}</div>
                        </div>
                      )}
                      {isCIF() && dadosFrete?.viagens_necessarias > 0 && (
                        <div>
                          <span style={{ fontSize: '8px', color: '#666', display: 'block' }}>VIAGENS</span>
                          <div style={{ fontSize: '11px', fontWeight: '500' }}>{dadosFrete.viagens_necessarias}x de {formatarValor(dadosFrete.valor_unitario_viagem)}</div>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '8px', color: '#666', display: 'block' }}>TOTAL FRETE</span>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#c05621' }}>
                        {totalFrete > 0 ? formatarValor(totalFrete) : 'SEM FRETE'}
                      </div>
                    </div>
                  </div>
                  
                  {isCIF() && getEnderecoCompacto() && (
                    <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #cbd5e0', fontSize: '9px', color: '#4a5568' }}>
                      📍 {getEnderecoCompacto()}
                    </div>
                  )}
                  
                  <div style={{ marginTop: '6px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '4px', padding: '4px 8px', fontSize: '9px', fontWeight: 'bold', color: '#92400e', textAlign: 'center' }}>
                    ⚠️ Verificar acesso para caminhão. Responsabilidade do cliente garantir condições de descarga.
                  </div>
                </div>
              </div>

              {/* ========== RESUMO FINANCEIRO ========== */}
              <div style={{ background: 'linear-gradient(135deg, #4c7f8a, #2d5a63)', borderRadius: '8px', padding: '15px', color: 'white', marginBottom: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '12px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', opacity: 0.8, textTransform: 'uppercase' }}>Subtotal Produtos</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{formatarValor(subtotalProdutos)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', opacity: 0.8, textTransform: 'uppercase' }}>Frete</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{formatarValor(totalFrete)}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', opacity: 0.8, textTransform: 'uppercase' }}>Desconto ({desconto}%)</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>- {formatarValor(valorDesconto)}</div>
                  </div>
                </div>
                <div style={{ borderTop: '2px solid rgba(255,255,255,0.3)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px' }}>VALOR TOTAL DA PROPOSTA</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold' }}>{formatarValor(valorTotal)}</div>
                </div>
              </div>

              {/* ========== 4 CARDS: PAGAMENTO, VALIDADE, PESO, PALLETS ========== */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '12px' }}>
                <div style={{ backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>💳</div>
                  <div style={{ fontSize: '7px', color: '#666', textTransform: 'uppercase' }}>Pagamento</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748' }}>{formaPagamento?.descricao || '28 DDL'}</div>
                </div>
                <div style={{ backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>📅</div>
                  <div style={{ fontSize: '7px', color: '#666', textTransform: 'uppercase' }}>Validade Proposta</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748' }}>{dadosOrcamento.validade_dias || 15} dias</div>
                </div>
                <div style={{ backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>📦</div>
                  <div style={{ fontSize: '7px', color: '#666', textTransform: 'uppercase' }}>Peso Total</div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#2d3748' }}>{(pesoTotal / 1000).toFixed(2)} ton</div>
                </div>
                <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>🔄</div>
                  <div style={{ fontSize: '7px', color: '#856404', textTransform: 'uppercase' }}>Pallets</div>
                  <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#856404' }}>Devem ser devolvidos</div>
                </div>
              </div>

              {/* ========== TERMOS E CONDIÇÕES (2 COLUNAS) ========== */}
              <div style={styles.secaoTitulo}>TERMOS E CONDIÇÕES</div>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '12px' }}>
                
                {/* COLUNA ESQUERDA */}
                <div style={{ flex: 1 }}>
                  <div style={styles.clausulaTitulo}>03. VALIDADE DA PROPOSTA</div>
                  <div style={styles.clausulaTexto}>• Os preços são válidos por até {dadosOrcamento.validade_dias || 15} dias após o aceite.</div>
                  
                  <div style={styles.clausulaTitulo}>04. PROGRAMAÇÃO DE ENTREGA</div>
                  <div style={styles.clausulaTexto}>
                    • O cronograma geral da obra deve ser entregue junto com este documento.<br/>
                    • Qualquer alteração deve ser comunicada antecipadamente.<br/>
                    • Programações devem ser enviadas até quarta-feira da semana anterior.<br/>
                    • Prazo médio de fabricação: 7 dias úteis após confirmação.<br/>
                    • Produtos acima de 10 MPa necessitam validação com equipe técnica.<br/>
                    • Não são aceitas devoluções por erro de especificação.
                  </div>
                  
                  <div style={styles.clausulaTitulo}>05. GARANTIA DOS PRODUTOS</div>
                  <div style={styles.clausulaTexto}>
                    • Garantia de 5 anos contra defeito de fabricação.<br/>
                    • Válida desde que respeitadas as cargas e finalidades indicadas.<br/>
                    • Avarias devem ser registradas no ato do recebimento.
                  </div>
                  
                  <div style={styles.clausulaTitulo}>06. QUALIDADE</div>
                  <div style={styles.clausulaTexto}>
                    • Laboratório próprio para controle de qualidade.<br/>
                    • Laudos de resistência à carga disponíveis.<br/>
                    • Variações de coloração são naturais e não caracterizam defeito.<br/>
                    • Eflorescência é fenômeno natural.
                  </div>
                </div>
                
                {/* COLUNA DIREITA */}
                <div style={{ flex: 1 }}>
                  <div style={styles.clausulaTitulo}>07. CANCELAMENTOS E ACRÉSCIMOS</div>
                  <div style={styles.clausulaTexto}>
                    • Produtos sob encomenda só podem ser cancelados antes da fabricação.<br/>
                    • Produtos acima de 8,0 MPa são fabricados sob demanda.<br/>
                    • Cancelamento/redução acarreta multa de 15% (exceto se não iniciou fabricação ou redução &lt; 10%).
                  </div>
                  
                  <div style={styles.clausulaTitulo}>08. CARREGAMENTO E DESCARGA</div>
                  <div style={styles.clausulaTexto}>
                    • Descarga pode ser negociada; na ausência, é responsabilidade do CLIENTE.<br/>
                    • Não carregamos caminhões bascula.<br/>
                    • Atraso &gt;2h na descarga: cobrança adicional de 20% do frete por hora.<br/>
                    • Entrega não realizada por culpa do cliente: frete ida + 60% retorno.
                  </div>
                  
                  <div style={styles.clausulaTitulo}>09. PALLETS</div>
                  <div style={styles.clausulaTexto}>
                    • Pallets são bens consignados e devem ser devolvidos em perfeitas condições.<br/>
                    • Danos, extravios ou não devolução: cobrança de R$ 50,00/unidade.<br/>
                    • Não devolução pode suspender entregas futuras.
                  </div>

                  {/* CARD VENDEDOR HORIZONTAL */}
                  <div style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)', borderRadius: '8px', padding: '10px 15px', color: 'white', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>👤</span>
                      <div>
                        <div style={{ fontSize: '9px', opacity: 0.8 }}>Seu Vendedor</div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{dadosOrcamento.vendedor || 'Vendedor'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '10px' }}>
                      <div>📞 (31) 3965-1515</div>
                      <div>comercial@construcomartefatos.com.br</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========== 10. OBSERVAÇÕES FINAIS ========== */}
              <div style={{ backgroundColor: '#fffbeb', border: '2px solid #f59e0b', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#92400e', marginBottom: '6px' }}>10. OBSERVAÇÕES FINAIS</div>
                <div style={{ fontSize: '10px', color: '#78350f', lineHeight: '1.5' }}>
                  {dadosOrcamento.observacoes || 'Esta proposta não possui observações adicionais.'}
                </div>
              </div>

              {/* ========== RODAPÉ ========== */}
              <div style={{ borderTop: '2px solid #4c7f8a', paddingTop: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4c7f8a' }}>CONSTRUCOM ARTEFATOS DE CIMENTO</div>
                <div style={{ fontSize: '9px', color: '#666', marginTop: '4px' }}>
                  Pedro Leopoldo - MG | Tel: (31) 3965-1515 | comercial@construcomartefatos.com.br
                </div>
                <div style={{ fontSize: '8px', color: '#9333ea', marginTop: '2px', fontStyle: 'italic' }}>
                  Empresa do Grupo Uni-Stein
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Modal - Botões */}
        <div style={{ padding: '15px 20px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button 
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#4c7f8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
          >
            <Printer size={18} />
            Imprimir
          </button>
          
          {podeSalvarPdf && (
            <button 
              onClick={handleSalvarPdf}
              disabled={salvandoPdf}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '10px 20px', 
                backgroundColor: pdfSalvo ? '#10b981' : '#9333ea', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: salvandoPdf ? 'not-allowed' : 'pointer', 
                fontWeight: '500',
                opacity: salvandoPdf ? 0.7 : 1
              }}
            >
              {salvandoPdf ? (
                <>
                  <Upload size={18} className="animate-spin" />
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
                  Salvar PDF
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}