import { useState, useRef, useEffect } from 'react'
import { X, Printer } from 'lucide-react'
import { supabase } from '../services/supabase'
import logoConstrucom from '../assets/logo-construcom.png'

export default function PropostaComercial({ 
  isOpen, 
  onClose, 
  dadosOrcamento, 
  produtos, 
  dadosFrete 
}) {
  const printRef = useRef()
  const [formaPagamento, setFormaPagamento] = useState(null)
  const [loading, setLoading] = useState(true)

  // Buscar forma de pagamento quando abrir o modal
  useEffect(() => {
    if (isOpen && dadosOrcamento?.forma_pagamento_id) {
      carregarFormaPagamento()
    } else {
      setLoading(false)
    }
  }, [isOpen, dadosOrcamento?.forma_pagamento_id])

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

  // Formatar data
  const formatarData = (dataStr) => {
    if (!dataStr) return ''
    const data = new Date(dataStr + 'T00:00:00')
    return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  // Formatar valor
  const formatarValor = (valor) => {
    return (valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  // ✅ CORREÇÃO: Usar nomes padronizados
  const getTipoFreteExibicao = () => {
    const modalidade = dadosFrete?.modalidade || 'FOB'
    if (modalidade === 'FOB') return 'FOB'
    if (modalidade === 'CIF_SEM_DESCARGA') return 'CIF - Sem Descarga'
    if (modalidade === 'CIF_COM_DESCARGA') return 'CIF - Com Descarga'
    return modalidade
  }

  // ✅ CORREÇÃO: Mensagem do tipo de frete usando nome padronizado
  const getMensagemFrete = () => {
    const modalidade = dadosFrete?.modalidade || 'FOB'
    if (modalidade === 'FOB') return 'FRETE POR CONTA DO CLIENTE'
    if (modalidade === 'CIF_SEM_DESCARGA') return 'DESCARGA POR CONTA DO CLIENTE'
    if (modalidade === 'CIF_COM_DESCARGA') return 'FRETE COM DESCARGA INCLUSA'
    return 'FRETE POR CONTA DO CLIENTE'
  }

  // ✅ CORREÇÃO: Verificar se é CIF usando nome padronizado
  const isCIF = () => {
    const modalidade = dadosFrete?.modalidade || 'FOB'
    return modalidade === 'CIF_SEM_DESCARGA' || modalidade === 'CIF_COM_DESCARGA'
  }

  // Imprimir
  const imprimir = () => {
    const conteudo = printRef.current.innerHTML
    const janela = window.open('', '_blank')
    janela.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proposta ${dadosOrcamento.numero}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #333; line-height: 1.4; }
          @page { margin: 15mm; size: A4; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${conteudo}</body>
      </html>
    `)
    janela.document.close()
    setTimeout(() => { janela.print(); janela.close() }, 300)
  }

  // Estilos inline
  const styles = {
    container: { maxWidth: '800px', margin: '0 auto', backgroundColor: '#fff', padding: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #4c7f8a', paddingBottom: '15px', marginBottom: '15px' },
    logo: { height: '50px', maxWidth: '150px' },
    headerRight: { textAlign: 'right' },
    titulo: { fontSize: '18px', fontWeight: 'bold', color: '#4c7f8a', marginBottom: '3px' },
    numero: { fontSize: '14px', color: '#666' },
    dataLocal: { fontSize: '11px', color: '#666' },
    secao: { marginBottom: '15px' },
    secaoTitulo: { backgroundColor: '#4c7f8a', color: '#fff', padding: '6px 12px', fontSize: '11px', fontWeight: 'bold', marginBottom: '8px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
    campo: { marginBottom: '4px' },
    label: { fontSize: '9px', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' },
    valor: { fontSize: '11px', color: '#333' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '10px' },
    th: { backgroundColor: '#e2e8f0', padding: '6px 8px', textAlign: 'left', fontWeight: 'bold', borderBottom: '1px solid #cbd5e0', fontSize: '9px' },
    thRight: { backgroundColor: '#e2e8f0', padding: '6px 8px', textAlign: 'right', fontWeight: 'bold', borderBottom: '1px solid #cbd5e0', fontSize: '9px' },
    td: { padding: '5px 8px', borderBottom: '1px solid #e2e8f0' },
    tdRight: { padding: '5px 8px', borderBottom: '1px solid #e2e8f0', textAlign: 'right', fontFamily: 'monospace' },
    freteBox: { backgroundColor: '#f7fafc', border: '1px solid #e2e8f0', padding: '10px', marginBottom: '10px' },
    freteGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' },
    freteItem: { padding: '8px' },
    freteLabel: { fontSize: '9px', color: '#666', marginBottom: '3px' },
    freteValor: { fontSize: '13px', fontWeight: 'bold', color: '#4c7f8a' },
    freteAviso: { backgroundColor: '#fef3c7', border: '1px solid #f59e0b', padding: '6px 10px', fontSize: '10px', fontWeight: 'bold', color: '#92400e', textAlign: 'center', marginTop: '8px' },
    totalBox: { backgroundColor: '#4c7f8a', color: '#fff', padding: '12px', marginBottom: '15px' },
    totalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', textAlign: 'center' },
    totalItem: { },
    totalLabel: { fontSize: '9px', opacity: 0.8 },
    totalValor: { fontSize: '14px', fontWeight: 'bold' },
    totalGeral: { fontSize: '20px', fontWeight: 'bold', color: '#f6ad55' },
    clausula: { marginBottom: '10px' },
    clausulaTitulo: { fontSize: '10px', fontWeight: 'bold', color: '#4c7f8a', marginBottom: '4px' },
    clausulaTexto: { fontSize: '9px', color: '#4a5568', paddingLeft: '10px' },
    destaque: { backgroundColor: '#ebf8ff', border: '1px solid #3182ce', padding: '8px', textAlign: 'center', margin: '4px 0' },
    destaqueValor: { fontSize: '16px', fontWeight: 'bold', color: '#2b6cb0' },
    observacoes: { fontSize: '10px', backgroundColor: '#fffbeb', border: '1px dashed #d69e2e', padding: '8px', marginTop: '4px' },
    footer: { borderTop: '2px solid #4c7f8a', paddingTop: '12px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
    assinatura: { },
    validadeBox: { backgroundColor: '#4c7f8a', color: '#fff', padding: '10px 20px', textAlign: 'center' },
    validadeDias: { fontSize: '20px', fontWeight: 'bold', color: '#f6ad55' },
    validadeTexto: { fontSize: '9px' }
  }

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
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Carregando proposta...
            </div>
          ) : (
            <div ref={printRef} style={styles.container}>
            
            {/* Header */}
            <div style={styles.header}>
              <img src={logoConstrucom} alt="Construcom" style={styles.logo} />
              <div style={styles.headerRight}>
                <div style={styles.titulo}>PROPOSTA COMERCIAL</div>
                <div style={styles.numero}>
                  {dadosOrcamento.numero_proposta ? (
                    <span style={{ color: '#9333ea', fontWeight: 'bold' }}>
                      PROPOSTA: {dadosOrcamento.numero_proposta}
                    </span>
                  ) : (
                    dadosOrcamento.numero
                  )}
                </div>
                <div style={styles.dataLocal}>{formatarData(dadosOrcamento.data_orcamento)} | Pedro Leopoldo - MG</div>
              </div>
            </div>

            {/* Cliente */}
            <div style={styles.secao}>
              <div style={styles.secaoTitulo}>DADOS DO CLIENTE</div>
              <div style={styles.grid2}>
                <div style={styles.campo}>
                  <div style={styles.label}>Cliente</div>
                  <div style={styles.valor}>{dadosOrcamento.cliente_nome || dadosOrcamento.cliente_empresa || '-'}</div>
                </div>
                {dadosOrcamento.cliente_cpf_cnpj && (
                  <div style={styles.campo}>
                    <div style={styles.label}>CPF/CNPJ</div>
                    <div style={styles.valor}>{dadosOrcamento.cliente_cpf_cnpj}</div>
                  </div>
                )}
                <div style={styles.campo}>
                  <div style={styles.label}>Telefone</div>
                  <div style={styles.valor}>{dadosOrcamento.cliente_telefone || '-'}</div>
                </div>
                <div style={styles.campo}>
                  <div style={styles.label}>E-mail</div>
                  <div style={styles.valor}>{dadosOrcamento.cliente_email || '-'}</div>
                </div>
              </div>
              {dadosOrcamento.endereco_entrega && (
                <div style={{ ...styles.campo, marginTop: '8px', backgroundColor: '#f7fafc', padding: '8px' }}>
                  <div style={styles.label}>📍 Endereço de Entrega</div>
                  <div style={styles.valor}>{dadosOrcamento.endereco_entrega}</div>
                </div>
              )}
            </div>

            {/* Produtos */}
            <div style={styles.secao}>
              <div style={styles.secaoTitulo}>01. PRODUTOS</div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Material</th>
                    <th style={styles.th}>Classe</th>
                    <th style={styles.th}>MPA</th>
                    <th style={styles.thRight}>Qtd</th>
                    <th style={styles.thRight}>Valor Unit.</th>
                    <th style={styles.thRight}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((p, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f7fafc' }}>
                      <td style={styles.td}>{p.produto}</td>
                      <td style={styles.td}>{p.classe}</td>
                      <td style={styles.td}>{p.mpa}</td>
                      <td style={styles.tdRight}>{parseFloat(p.quantidade).toLocaleString('pt-BR')}</td>
                      <td style={styles.tdRight}>{formatarValor(p.preco)}</td>
                      <td style={styles.tdRight}><strong>{formatarValor(p.quantidade * p.preco)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Frete - ✅ CORRIGIDO */}
            <div style={styles.secao}>
              <div style={styles.secaoTitulo}>02. FRETE</div>
              <div style={styles.freteBox}>
                <div style={styles.freteGrid}>
                  <div style={styles.freteItem}>
                    <div style={styles.freteLabel}>TIPO</div>
                    <div style={styles.freteValor}>{getTipoFreteExibicao()}</div>
                  </div>
                  <div style={styles.freteItem}>
                    <div style={styles.freteLabel}>VIAGENS</div>
                    <div style={styles.freteValor}>{dadosFrete?.viagens_necessarias || 0}</div>
                  </div>
                  <div style={styles.freteItem}>
                    <div style={styles.freteLabel}>VALOR/VIAGEM</div>
                    <div style={styles.freteValor}>{formatarValor(dadosFrete?.valor_unitario_viagem)}</div>
                  </div>
                  <div style={styles.freteItem}>
                    <div style={styles.freteLabel}>TOTAL FRETE</div>
                    <div style={{ ...styles.freteValor, color: '#c05621' }}>{formatarValor(totalFrete)}</div>
                  </div>
                </div>
                <div style={styles.freteAviso}>⚠️ {getMensagemFrete()}</div>
                
                {/* ✅ CORREÇÃO: Usar função isCIF() */}
                {isCIF() && (
                  <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', padding: '10px', marginTop: '10px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#0369a1', marginBottom: '4px' }}>
                      📍 ENDEREÇO DE ENTREGA
                    </div>
                    <div style={{ fontSize: '10px', color: '#0c4a6e' }}>
                      {dadosOrcamento.obra_logradouro && `${dadosOrcamento.obra_logradouro}, `}
                      {dadosOrcamento.obra_numero && `${dadosOrcamento.obra_numero}`}
                      {dadosOrcamento.obra_complemento && ` - ${dadosOrcamento.obra_complemento}`}
                      <br />
                      {dadosOrcamento.obra_bairro && `${dadosOrcamento.obra_bairro}, `}
                      {dadosOrcamento.obra_cidade}
                      {dadosOrcamento.obra_cep && ` - CEP: ${dadosOrcamento.obra_cep}`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Totais */}
            <div style={styles.totalBox}>
              <div style={styles.totalGrid}>
                <div style={styles.totalItem}>
                  <div style={styles.totalLabel}>TOTAL PRODUTOS</div>
                  <div style={styles.totalValor}>{formatarValor(totalProdutosComDesconto)}</div>
                </div>
                <div style={styles.totalItem}>
                  <div style={styles.totalLabel}>TOTAL FRETE</div>
                  <div style={styles.totalValor}>{formatarValor(totalFrete)}</div>
                </div>
                <div style={styles.totalItem}>
                  <div style={styles.totalLabel}>TOTAL DA PROPOSTA</div>
                  <div style={styles.totalGeral}>{formatarValor(totalGeral)}</div>
                </div>
              </div>
            </div>

            {/* Cláusulas */}
            <div style={styles.secao}>
              <div style={styles.secaoTitulo}>TERMOS E CONDIÇÕES</div>
              
              <div style={styles.clausula}>
                <div style={styles.clausulaTitulo}>03. VALIDADE DA PROPOSTA</div>
                <div style={styles.destaque}>
                  <div style={styles.destaqueValor}>Válida por {dadosOrcamento.validade_dias || 15} dias</div>
                </div>
                <div style={styles.clausulaTexto}>• Os preços são válidos por até 60 dias após o aceite.</div>
              </div>

              <div style={styles.clausula}>
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

              <div style={styles.clausula}>
                <div style={styles.clausulaTitulo}>05. GARANTIA DOS PRODUTOS</div>
                <div style={styles.clausulaTexto}>
                  • Garantia de 5 anos contra defeito de fabricação.<br/>
                  • Válida desde que respeitadas as cargas e finalidades indicadas.<br/>
                  • Avarias devem ser registradas no ato do recebimento.
                </div>
              </div>

              <div style={styles.clausula}>
                <div style={styles.clausulaTitulo}>06. QUALIDADE</div>
                <div style={styles.clausulaTexto}>
                  • Laboratório próprio para controle de qualidade.<br/>
                  • Laudos de resistência à carga disponíveis.<br/>
                  • Variações de coloração são naturais e não caracterizam defeito.<br/>
                  • Eflorescência é fenômeno natural.
                </div>
              </div>

              <div style={styles.clausula}>
                <div style={styles.clausulaTitulo}>07. CANCELAMENTOS E ACRÉSCIMOS</div>
                <div style={styles.clausulaTexto}>
                  • Produtos sob encomenda só podem ser cancelados antes da fabricação.<br/>
                  • Produtos acima de 8,0 MPa são fabricados sob demanda.<br/>
                  • Cancelamento/redução acarreta multa de 15% (exceto se não iniciou fabricação ou redução &lt; 10%).
                </div>
              </div>

              <div style={styles.clausula}>
                <div style={styles.clausulaTitulo}>09. CONDIÇÕES DE PAGAMENTO</div>
                <div style={styles.destaque}>
                  <div style={styles.destaqueValor}>
                    {formaPagamento?.descricao || dadosOrcamento.condicoes_pagamento || 'A DEFINIR'}
                  </div>
                </div>
              </div>

              <div style={styles.clausula}>
                <div style={styles.clausulaTitulo}>10. CARREGAMENTO E DESCARGA</div>
                <div style={styles.clausulaTexto}>
                  • Descarga pode ser negociada; na ausência, é responsabilidade do CLIENTE.<br/>
                  • Não carregamos caminhões bascula.<br/>
                  • Atraso &gt;2h na descarga: cobrança adicional de 20% do frete por hora.<br/>
                  • Entrega não realizada por culpa do cliente: frete ida + 60% retorno.
                </div>
              </div>

              <div style={styles.clausula}>
                <div style={styles.clausulaTitulo}>11. PALLETS</div>
                <div style={styles.clausulaTexto}>
                  • Pallets são bens consignados e devem ser devolvidos em perfeitas condições.<br/>
                  • Danos, extravios ou não devolução: cobrança de R$ 50,00/unidade.<br/>
                  • Não devolução pode suspender entregas futuras.
                </div>
              </div>

              <div style={styles.clausula}>
                <div style={styles.clausulaTitulo}>12. OBSERVAÇÕES FINAIS</div>
                <div style={styles.observacoes}>
                  {dadosOrcamento.observacoes || 'Esta proposta não possui observações adicionais.'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
              <div style={styles.assinatura}>
                <div style={{ fontStyle: 'italic', color: '#666', marginBottom: '5px' }}>Atenciosamente,</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4c7f8a' }}>CONSTRUCOM</div>
                <div style={{ fontSize: '11px', marginTop: '8px' }}>
                  <strong>{dadosOrcamento.vendedor || 'Vendedor'}</strong><br/>
                  {dadosOrcamento.vendedor_telefone && <span>📞 {dadosOrcamento.vendedor_telefone}</span>}
                  {dadosOrcamento.vendedor_telefone && dadosOrcamento.vendedor_email && <br/>}
                  {dadosOrcamento.vendedor_email && <span>📧 {dadosOrcamento.vendedor_email}</span>}
                </div>
              </div>
              <div style={styles.validadeBox}>
                <div style={styles.validadeDias}>{dadosOrcamento.validade_dias || 15}</div>
                <div style={styles.validadeTexto}>dias de validade</div>
              </div>
            </div>

          </div>
          )}
        </div>

        {/* Ações */}
        <div style={{ backgroundColor: '#f0f0f0', padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #ddd' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Fechar
          </button>
          <button 
            onClick={imprimir} 
            disabled={loading}
            style={{ padding: '10px 20px', backgroundColor: '#4c7f8a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.5 : 1 }}
          >
            <Printer size={18} />
            Imprimir / Salvar PDF
          </button>
        </div>
      </div>
    </div>
  )
}