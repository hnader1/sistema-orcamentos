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
    if (modalidade === 'FOB') return 'Cliente retira na fábrica'
    if (modalidade === 'CIF_SEM_DESCARGA') return 'Entrega sem descarga'
    if (modalidade === 'CIF_COM_DESCARGA') return 'Entrega com descarga inclusa'
    return ''
  }

  const isCIF = () => {
    const modalidade = dadosFrete?.modalidade || 'FOB'
    return modalidade === 'CIF_SEM_DESCARGA' || modalidade === 'CIF_COM_DESCARGA'
  }

  const getEnderecoCompleto = () => {
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
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10px; color: #1a1a1a; line-height: 1.4; }
          @page { margin: 10mm; size: A4; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>${conteudo}</body>
      </html>
    `)
    janela.document.close()
    setTimeout(() => { janela.print(); janela.close() }, 300)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '10px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '850px', maxHeight: '95vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
        
        {/* Header Modal */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '600', fontSize: '14px' }}>📄 Pré-visualização da Proposta</span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        {/* Conteúdo */}
        <div style={{ flex: 1, overflow: 'auto', padding: '15px', backgroundColor: '#e8e8e8' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Carregando...</div>
          ) : (
            <div ref={printRef} style={{ maxWidth: '780px', margin: '0 auto', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
              
              {/* ========== HEADER COM DESTAQUE PARA O CLIENTE ========== */}
              <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', color: '#fff', padding: '20px 25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <img src={logoConstrucom} alt="Construcom" style={{ height: '40px', filter: 'brightness(0) invert(1)' }} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', opacity: 0.8 }}>PROPOSTA COMERCIAL</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fbbf24' }}>
                      {dadosOrcamento.numero_proposta || dadosOrcamento.numero}
                    </div>
                    <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>
                      {formatarData(dadosOrcamento.data_orcamento)} • Pedro Leopoldo/MG
                    </div>
                  </div>
                </div>
                
                {/* CLIENTE EM MEGA DESTAQUE */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px 15px', borderLeft: '4px solid #fbbf24' }}>
                  <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '3px' }}>PROPOSTA EXCLUSIVA PARA</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    {dadosOrcamento.cliente_nome || dadosOrcamento.cliente_empresa || 'Cliente'}
                  </div>
                  <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '4px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    {dadosOrcamento.cnpj_cpf && <span>📋 {dadosOrcamento.cnpj_cpf}</span>}
                    {dadosOrcamento.cliente_telefone && <span>📞 {dadosOrcamento.cliente_telefone}</span>}
                    {dadosOrcamento.cliente_email && <span>✉️ {dadosOrcamento.cliente_email}</span>}
                  </div>
                </div>
              </div>

              {/* ========== PRODUTOS - TABELA LIMPA ========== */}
              <div style={{ padding: '15px 20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#1e3a5f', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>1</span>
                  MATERIAIS
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Produto</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Classe</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>MPa</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Qtd</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Unit.</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '600', color: '#475569', borderBottom: '2px solid #e2e8f0' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((p, i) => (
                      <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <td style={{ padding: '7px 10px', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>{p.produto}</td>
                        <td style={{ padding: '7px 6px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', color: '#64748b' }}>{p.classe || '-'}</td>
                        <td style={{ padding: '7px 6px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', color: '#64748b' }}>{p.mpa || '-'}</td>
                        <td style={{ padding: '7px 6px', borderBottom: '1px solid #f1f5f9', textAlign: 'center', fontWeight: '600' }}>{parseFloat(p.quantidade).toLocaleString('pt-BR')}</td>
                        <td style={{ padding: '7px 10px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#64748b' }}>{formatarValor(p.preco)}</td>
                        <td style={{ padding: '7px 10px', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '600', color: '#1e3a5f' }}>{formatarValor(p.quantidade * p.preco)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ========== FRETE - COMPACTO EM LINHA ========== */}
              <div style={{ padding: '0 20px 15px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#1e3a5f', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>2</span>
                  ENTREGA
                </div>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>MODALIDADE</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#1e3a5f' }}>{getTipoFreteExibicao()}</span>
                      </div>
                      {isCIF() && dadosFrete?.localidade && (
                        <div>
                          <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>DESTINO</span>
                          <span style={{ fontSize: '11px', fontWeight: '500' }}>{dadosFrete.localidade}</span>
                        </div>
                      )}
                      {isCIF() && dadosFrete?.viagens_necessarias > 0 && (
                        <div>
                          <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>VIAGENS</span>
                          <span style={{ fontSize: '11px', fontWeight: '500' }}>{dadosFrete.viagens_necessarias}x</span>
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '8px', color: '#64748b', display: 'block' }}>FRETE</span>
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: totalFrete > 0 ? '#ea580c' : '#16a34a' }}>
                        {totalFrete > 0 ? formatarValor(totalFrete) : 'GRÁTIS'}
                      </span>
                    </div>
                  </div>
                  {isCIF() && getEnderecoCompleto() && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', fontSize: '9px', color: '#475569' }}>
                      📍 {getEnderecoCompleto()}
                    </div>
                  )}
                  <div style={{ marginTop: '6px', fontSize: '8px', color: '#64748b', fontStyle: 'italic' }}>
                    ℹ️ {getMensagemFrete()}
                  </div>
                </div>
              </div>

              {/* ========== RESUMO FINANCEIRO - IMPACTANTE ========== */}
              <div style={{ margin: '0 20px 15px', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', borderRadius: '10px', padding: '15px 20px', color: '#fff' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '15px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '8px', opacity: 0.7 }}>PRODUTOS</div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{formatarValor(totalProdutosComDesconto)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '8px', opacity: 0.7 }}>FRETE</div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{totalFrete > 0 ? formatarValor(totalFrete) : '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '20px' }}>
                    <div style={{ fontSize: '8px', opacity: 0.7 }}>TOTAL DA PROPOSTA</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>{formatarValor(totalGeral)}</div>
                  </div>
                </div>
                
                {/* PAGAMENTO INTEGRADO */}
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '8px', opacity: 0.7 }}>CONDIÇÃO DE PAGAMENTO</span>
                    <div style={{ fontSize: '12px', fontWeight: '600', marginTop: '2px' }}>
                      {formaPagamento?.descricao || dadosOrcamento.condicoes_pagamento || 'A definir'}
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'rgba(251,191,36,0.2)', padding: '6px 12px', borderRadius: '20px', border: '1px solid #fbbf24' }}>
                    <span style={{ fontSize: '9px', fontWeight: '600', color: '#fbbf24' }}>
                      ⏱️ Válida por {dadosOrcamento.validade_dias || 15} dias
                    </span>
                  </div>
                </div>
              </div>

              {/* ========== TERMOS - COMPACTO EM COLUNAS ========== */}
              <div style={{ padding: '0 20px 15px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e3a5f', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#1e3a5f', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>3</span>
                  TERMOS E CONDIÇÕES
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '8px', color: '#475569' }}>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '4px', fontSize: '9px' }}>📦 Entrega</div>
                    <div>• Prazo: 7 dias úteis após confirmação</div>
                    <div>• Programação até quarta-feira anterior</div>
                    <div>• Produtos +10 MPa: validação técnica</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '4px', fontSize: '9px' }}>✅ Garantia</div>
                    <div>• 5 anos contra defeito de fabricação</div>
                    <div>• Avarias: registrar no recebimento</div>
                    <div>• Eflorescência é fenômeno natural</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '4px', fontSize: '9px' }}>🚛 Frete/Descarga</div>
                    <div>• Atraso +2h: 20% adicional/hora</div>
                    <div>• Não realizada: ida + 60% retorno</div>
                    <div>• Não carregamos caminhão bascula</div>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', borderRadius: '6px', padding: '8px 10px' }}>
                    <div style={{ fontWeight: '600', color: '#1e3a5f', marginBottom: '4px', fontSize: '9px' }}>📋 Pallets</div>
                    <div>• Bens consignados - devolver</div>
                    <div>• Dano/extravio: R$ 50,00/un</div>
                    <div>• Não devolução suspende entregas</div>
                  </div>
                </div>

                {/* Observações */}
                {dadosOrcamento.observacoes && (
                  <div style={{ marginTop: '10px', backgroundColor: '#fef3c7', borderRadius: '6px', padding: '8px 10px', border: '1px solid #fbbf24' }}>
                    <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '3px', fontSize: '9px' }}>📝 Observações</div>
                    <div style={{ fontSize: '9px', color: '#78350f' }}>{dadosOrcamento.observacoes}</div>
                  </div>
                )}
              </div>

              {/* ========== RODAPÉ - VENDEDOR ========== */}
              <div style={{ backgroundColor: '#f1f5f9', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #1e3a5f' }}>
                <div>
                  <div style={{ fontSize: '8px', color: '#64748b', marginBottom: '2px' }}>SEU CONSULTOR</div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e3a5f' }}>{dadosOrcamento.vendedor || 'Vendedor'}</div>
                  <div style={{ fontSize: '9px', color: '#475569', marginTop: '3px' }}>
                    {dadosOrcamento.vendedor_telefone && <span>📞 {dadosOrcamento.vendedor_telefone}</span>}
                    {dadosOrcamento.vendedor_telefone && dadosOrcamento.vendedor_email && <span style={{ margin: '0 8px' }}>•</span>}
                    {dadosOrcamento.vendedor_email && <span>✉️ {dadosOrcamento.vendedor_email}</span>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a5f' }}>CONSTRUCOM</div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>Artefatos de Cimento</div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>Pedro Leopoldo - MG</div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Ações */}
        <div style={{ backgroundColor: '#f8fafc', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            💡 Dica: Salve como PDF para enviar pelo WhatsApp
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ padding: '10px 20px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', color: '#475569' }}>
              Fechar
            </button>
            <button 
              onClick={imprimir} 
              disabled={loading}
              style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.5 : 1 }}
            >
              <Printer size={16} />
              Gerar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}