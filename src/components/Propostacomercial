import { useState } from 'react'
import { X, Download, Printer, Mail, FileText } from 'lucide-react'

// Logo Construcom em Base64 - será substituído pelo logo real
const LOGO_CONSTRUCOM = '/logo-construcom.png'

export default function PropostaComercial({ 
  isOpen, 
  onClose, 
  dadosOrcamento, 
  produtos, 
  dadosFrete 
}) {
  const [gerando, setGerando] = useState(false)

  if (!isOpen) return null

  // Calcular totais
  const totalProdutos = produtos.reduce((acc, p) => acc + (p.quantidade * p.preco_final), 0)
  const totalFrete = dadosFrete?.valor_total_frete || 0
  const totalGeral = totalProdutos + totalFrete

  // Formatar data
  const formatarData = (dataStr) => {
    if (!dataStr) return ''
    const data = new Date(dataStr)
    return data.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }

  // Formatar valor
  const formatarValor = (valor) => {
    return (valor || 0).toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    })
  }

  // Mensagem do tipo de frete
  const getMensagemFrete = () => {
    const tipo = dadosFrete?.tipo_frete || 'CIF'
    if (tipo === 'FOB') {
      return { texto: '🚚 Frete por conta do cliente', classe: 'bg-yellow-100 text-yellow-800 border-yellow-400' }
    } else if (tipo === 'CIF' || tipo === 'CIF - SEM DESCARGA') {
      return { texto: '⚠️ Descarga por conta do cliente', classe: 'bg-blue-100 text-blue-800 border-blue-400' }
    } else {
      return { texto: '✅ Frete com descarga inclusa', classe: 'bg-green-100 text-green-800 border-green-400' }
    }
  }

  const mensagemFrete = getMensagemFrete()

  // Gerar PDF
  const gerarPDF = async () => {
    setGerando(true)
    
    // Usar a API de impressão do navegador
    const conteudo = document.getElementById('proposta-content')
    const printWindow = window.open('', '_blank')
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Proposta Comercial - ${dadosOrcamento.numero}</title>
        <style>
          ${getEstilosPDF()}
        </style>
      </head>
      <body>
        ${conteudo.innerHTML}
      </body>
      </html>
    `)
    
    printWindow.document.close()
    
    setTimeout(() => {
      printWindow.print()
      setGerando(false)
    }, 500)
  }

  const getEstilosPDF = () => `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 11px; color: #333; }
    .proposal-container { max-width: 800px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); color: white; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
    .logo-section { display: flex; align-items: center; gap: 15px; }
    .logo-section img { height: 60px; border-radius: 8px; }
    .company-name { font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .proposal-info { text-align: right; }
    .proposal-number { font-size: 18px; font-weight: 700; color: #e67e22; }
    .client-section { background: #f8f9fa; padding: 20px 30px; border-bottom: 3px solid #e67e22; }
    .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .client-item { display: flex; gap: 8px; }
    .client-item.full { grid-column: 1 / -1; }
    .client-label { font-weight: 600; color: #1e3a5f; min-width: 80px; font-size: 10px; text-transform: uppercase; }
    .delivery-section { background: #e3f2fd; padding: 12px 30px; display: flex; align-items: center; gap: 15px; }
    .delivery-icon { width: 30px; height: 30px; background: #1e3a5f; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; }
    .intro-text { padding: 15px 30px; }
    .section-title { background: #1e3a5f; color: white; padding: 10px 30px; font-weight: 600; }
    .products-section { padding: 0 30px 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 10px; }
    th { background: #2d5a8a; color: white; padding: 10px 8px; text-align: left; font-weight: 600; text-transform: uppercase; }
    th:last-child, th:nth-child(4), th:nth-child(5) { text-align: right; }
    td { padding: 8px; border-bottom: 1px solid #dee2e6; }
    td:last-child, td:nth-child(4), td:nth-child(5) { text-align: right; font-family: Consolas, monospace; }
    tr:nth-child(even) { background: #f8f9fa; }
    .subtotal-row { background: #e9ecef !important; font-weight: 600; }
    .subtotal-row td { border-top: 2px solid #1e3a5f; }
    .freight-section { padding: 0 30px 20px; }
    .freight-card { background: #f5f7fa; border-radius: 8px; padding: 15px; border-left: 4px solid #e67e22; }
    .freight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .freight-type { font-weight: 700; color: #1e3a5f; }
    .freight-type span { background: #e67e22; color: white; padding: 3px 10px; border-radius: 15px; font-size: 10px; margin-left: 8px; }
    .freight-note { font-size: 10px; padding: 5px 10px; border-radius: 5px; font-weight: 600; border: 1px solid; }
    .freight-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .freight-item { text-align: center; padding: 10px; background: white; border-radius: 8px; }
    .freight-item .label { font-size: 9px; color: #6c757d; text-transform: uppercase; margin-bottom: 4px; }
    .freight-item .value { font-size: 14px; font-weight: 700; color: #1e3a5f; font-family: Consolas, monospace; }
    .total-section { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8a 100%); padding: 20px 30px; color: white; }
    .total-breakdown { display: flex; flex-direction: column; gap: 5px; }
    .total-line { display: flex; justify-content: space-between; min-width: 250px; }
    .total-line .label { opacity: 0.85; }
    .total-line .value { font-weight: 600; font-family: Consolas, monospace; }
    .total-line.main { border-top: 2px solid rgba(255,255,255,0.3); padding-top: 10px; margin-top: 5px; }
    .total-line.main .label { font-size: 14px; font-weight: 700; opacity: 1; }
    .total-line.main .value { font-size: 20px; font-weight: 800; color: #e67e22; }
    .terms-section { padding: 20px 30px; }
    .term-block { margin-bottom: 15px; }
    .term-title { font-weight: 700; color: #1e3a5f; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .term-title .num { background: #e67e22; color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; }
    .term-content { padding-left: 30px; }
    .term-content p { color: #343a40; font-size: 10px; line-height: 1.5; margin-bottom: 4px; }
    .term-content p::before { content: "•"; color: #e67e22; font-weight: bold; margin-right: 6px; }
    .term-highlight { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 10px 15px; font-weight: 600; color: #856404; }
    .payment-highlight { background: #d4edda; border: 2px solid #28a745; border-radius: 8px; padding: 15px; text-align: center; margin: 8px 0; }
    .payment-highlight .value { font-size: 18px; font-weight: 800; color: #28a745; }
    .payment-highlight .label { font-size: 10px; color: #155724; margin-top: 3px; }
    .observations-section { background: #fff8e1; border: 2px dashed #e67e22; border-radius: 8px; padding: 15px; margin: 12px 0; }
    .observations-section h4 { color: #e67e22; margin-bottom: 8px; font-size: 12px; }
    .observations-section p { color: #343a40; font-size: 11px; line-height: 1.5; }
    .observations-section p::before { content: none !important; }
    .footer { background: #f8f9fa; padding: 20px 30px; border-top: 3px solid #1e3a5f; display: flex; justify-content: space-between; align-items: center; }
    .signature .att { font-style: italic; color: #6c757d; margin-bottom: 5px; }
    .signature .company { font-size: 20px; font-weight: 800; color: #1e3a5f; letter-spacing: 1px; }
    .seller-info { margin-top: 10px; padding-top: 10px; border-top: 1px solid #dee2e6; }
    .seller-info .name { font-weight: 600; }
    .seller-info .phone { color: #6c757d; margin-top: 2px; }
    .validity-stamp { background: #1e3a5f; color: white; padding: 12px 20px; border-radius: 10px; text-align: center; }
    .validity-stamp .days { font-size: 22px; font-weight: 800; color: #e67e22; }
    .validity-stamp .text { font-size: 9px; opacity: 0.9; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  `

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <FileText size={24} />
            <div>
              <h2 className="text-xl font-bold">Proposta Comercial</h2>
              <p className="text-sm opacity-80">Pré-visualização do documento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition">
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo da Proposta (scrollável) */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <div id="proposta-content" className="proposal-container bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            
            {/* Header */}
            <header className="header bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 flex justify-between items-center">
              <div className="logo-section flex items-center gap-4">
                <img 
                  src={LOGO_CONSTRUCOM} 
                  alt="Construcom" 
                  className="h-16 rounded-lg bg-white p-1"
                  style={{ maxWidth: '200px', objectFit: 'contain' }}
                />
              </div>
              <div className="proposal-info text-right">
                <div className="text-xs opacity-80 uppercase">Proposta Comercial</div>
                <div className="proposal-number text-2xl font-bold text-orange-400">
                  #{dadosOrcamento.numero || 'ORC-0001'}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {formatarData(dadosOrcamento.data_orcamento)}
                </div>
                <div className="text-xs opacity-80">Pedro Leopoldo - MG</div>
              </div>
            </header>

            {/* Dados do Cliente */}
            <section className="client-section bg-gray-100 p-6 border-b-4 border-orange-500">
              <div className="client-grid grid grid-cols-2 gap-3">
                <div className="client-item full col-span-2 flex gap-2">
                  <span className="client-label font-semibold text-blue-900 text-xs uppercase min-w-[90px]">Cliente:</span>
                  <span className="client-value">{dadosOrcamento.cliente_nome || dadosOrcamento.cliente_empresa || '-'}</span>
                </div>
                {dadosOrcamento.cliente_cpf_cnpj && (
                  <div className="client-item full col-span-2 flex gap-2">
                    <span className="client-label font-semibold text-blue-900 text-xs uppercase min-w-[90px]">CPF/CNPJ:</span>
                    <span className="client-value">{dadosOrcamento.cliente_cpf_cnpj}</span>
                  </div>
                )}
                <div className="client-item flex gap-2">
                  <span className="client-label font-semibold text-blue-900 text-xs uppercase min-w-[90px]">Telefone:</span>
                  <span className="client-value">{dadosOrcamento.cliente_telefone || '-'}</span>
                </div>
                <div className="client-item flex gap-2">
                  <span className="client-label font-semibold text-blue-900 text-xs uppercase min-w-[90px]">E-mail:</span>
                  <span className="client-value">{dadosOrcamento.cliente_email || '-'}</span>
                </div>
              </div>
            </section>

            {/* Endereço de Entrega */}
            {dadosOrcamento.endereco_entrega && (
              <section className="delivery-section bg-blue-50 p-4 flex items-center gap-4 border-b border-blue-200">
                <div className="delivery-icon w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white text-lg">
                  📍
                </div>
                <div className="delivery-info">
                  <div className="text-xs text-blue-900 uppercase font-semibold">Endereço de Entrega</div>
                  <div className="text-sm text-gray-800 mt-1">{dadosOrcamento.endereco_entrega}</div>
                </div>
              </section>
            )}

            {/* Intro */}
            <section className="intro-text p-5 border-b border-gray-200">
              <p className="greeting font-semibold text-blue-900 mb-2">Prezado Sr.(a),</p>
              <p className="text-gray-700">Atendendo a sua solicitação, apresentamos a proposta comercial para fornecimento de produtos para a sua obra.</p>
            </section>

            {/* Produtos */}
            <div className="section-title bg-blue-900 text-white py-3 px-6 font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">01</span>
              PRODUTOS
            </div>
            <section className="products-section px-6 pb-5">
              <table className="w-full mt-4 text-sm">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="p-3 text-left font-semibold text-xs uppercase">Material</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase">Classe</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase">Resistência</th>
                    <th className="p-3 text-right font-semibold text-xs uppercase">Qtd</th>
                    <th className="p-3 text-right font-semibold text-xs uppercase">Valor Unit.</th>
                    <th className="p-3 text-right font-semibold text-xs uppercase">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 border-b border-gray-200">{produto.produto}</td>
                      <td className="p-3 border-b border-gray-200">{produto.classe}</td>
                      <td className="p-3 border-b border-gray-200">{produto.mpa}</td>
                      <td className="p-3 border-b border-gray-200 text-right font-mono">
                        {produto.quantidade?.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-right font-mono">
                        {formatarValor(produto.preco_final)}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-right font-mono font-semibold">
                        {formatarValor(produto.quantidade * produto.preco_final)}
                      </td>
                    </tr>
                  ))}
                  <tr className="subtotal-row bg-gray-200 font-semibold">
                    <td colSpan="5" className="p-3 text-right border-t-2 border-blue-900">SUBTOTAL PRODUTOS:</td>
                    <td className="p-3 text-right font-mono border-t-2 border-blue-900">{formatarValor(totalProdutos)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Frete */}
            <div className="section-title bg-blue-900 text-white py-3 px-6 font-semibold flex items-center gap-2">
              <span className="text-lg">📦</span>
              FRETE
            </div>
            <section className="freight-section px-6 pb-5">
              <div className="freight-card bg-gray-100 rounded-xl p-5 mt-4 border-l-4 border-orange-500">
                <div className="freight-header flex justify-between items-center flex-wrap gap-3 mb-4">
                  <div className="freight-type font-bold text-blue-900">
                    Tipo de Frete: 
                    <span className="ml-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                      {dadosFrete?.tipo_frete || 'CIF'}
                    </span>
                  </div>
                  <div className={`freight-note text-sm px-3 py-1 rounded-lg font-semibold border ${mensagemFrete.classe}`}>
                    {mensagemFrete.texto}
                  </div>
                </div>
                <div className="freight-details grid grid-cols-3 gap-4">
                  <div className="freight-item bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="label text-xs text-gray-500 uppercase mb-1">Quantidade de Viagens</div>
                    <div className="value text-xl font-bold text-blue-900">{dadosFrete?.quantidade_viagens || 0}</div>
                  </div>
                  <div className="freight-item bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="label text-xs text-gray-500 uppercase mb-1">Valor por Viagem</div>
                    <div className="value text-xl font-bold text-blue-900">{formatarValor(dadosFrete?.valor_frete || 0)}</div>
                  </div>
                  <div className="freight-item bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="label text-xs text-gray-500 uppercase mb-1">Total Frete</div>
                    <div className="value text-xl font-bold text-orange-500">{formatarValor(totalFrete)}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Total com Resumo */}
            <section className="total-section bg-gradient-to-r from-blue-900 to-blue-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <div className="total-breakdown">
                  <div className="total-line flex justify-between min-w-[280px] mb-2">
                    <span className="label opacity-85">Total Produtos:</span>
                    <span className="value font-semibold font-mono">{formatarValor(totalProdutos)}</span>
                  </div>
                  <div className="total-line flex justify-between min-w-[280px] mb-2">
                    <span className="label opacity-85">Total Frete:</span>
                    <span className="value font-semibold font-mono">{formatarValor(totalFrete)}</span>
                  </div>
                  <div className="total-line main flex justify-between min-w-[280px] border-t-2 border-white/30 pt-3 mt-2">
                    <span className="label text-lg font-bold">TOTAL DA PROPOSTA:</span>
                    <span className="value text-3xl font-extrabold text-orange-400">{formatarValor(totalGeral)}</span>
                  </div>
                </div>
                <div className="total-badge bg-white/15 p-4 rounded-xl text-center">
                  <div className="text-4xl mb-1">✅</div>
                  <div className="text-xs opacity-90">Proposta<br/>Comercial</div>
                </div>
              </div>
            </section>

            {/* Termos e Condições */}
            <section className="terms-section p-6">
              {/* 02. Condições Gerais */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">02</span>
                  CONDIÇÕES GERAIS
                </div>
                <div className="term-content pl-8 text-sm text-gray-700">
                  <p className="mb-1">• Todos os produtos fornecidos estão de acordo com as normas técnicas brasileiras vigentes.</p>
                  <p className="mb-1">• Esta proposta é personalizada e considera as condições específicas da obra informada.</p>
                </div>
              </div>

              {/* 03. Validade */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">03</span>
                  VALIDADE DA PROPOSTA
                </div>
                <div className="term-content pl-8">
                  <div className="term-highlight bg-yellow-100 border border-yellow-400 rounded-lg p-3 font-semibold text-yellow-800">
                    ⏰ Esta proposta é válida por <strong>{dadosOrcamento.validade_dias || 15} dias</strong>.
                  </div>
                  <p className="mt-3 text-sm text-gray-700">• Os preços aqui apresentados são válidos por até 60 (sessenta) dias após o aceite da proposta.</p>
                </div>
              </div>

              {/* 04. Programação de Entrega */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">04</span>
                  PROGRAMAÇÃO DE ENTREGA
                </div>
                <div className="term-content pl-8 text-sm text-gray-700">
                  <p className="mb-1">• O cronograma geral da obra deve ser entregue junto com este documento e será a orientação principal das programações de fabricação e entrega dos materiais.</p>
                  <p className="mb-1">• Qualquer alteração da programação deve ser comunicada antecipadamente para ajuste da produção.</p>
                  <p className="mb-1">• É de responsabilidade da obra enviar as programações dos produtos, quantidade desejada para a semana seguinte até, no máximo quarta-feira da semana anterior à demanda.</p>
                  <p className="mb-1">• O prazo médio de início da fabricação do produto é de 7 dias úteis após confirmação do pedido, podendo variar conforme volume e demanda da fábrica.</p>
                  <p className="mb-1">• Produtos de Alta resistência (acima de 10 MPa) necessitam ter prazo de entrega validada junto com a equipe técnica interna.</p>
                  <p className="mb-1">• Não serão aceitas devoluções motivadas por erro de especificação dos produtos.</p>
                </div>
              </div>

              {/* 05. Garantia */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">05</span>
                  GARANTIA DOS PRODUTOS
                </div>
                <div className="term-content pl-8 text-sm text-gray-700">
                  <p className="mb-1">• Os produtos possuem garantia de 5 (cinco) anos contra defeito de fabricação.</p>
                  <p className="mb-1">• Essa garantia é válida desde que sejam respeitadas as cargas e finalidades indicadas nas fichas técnicas.</p>
                  <p className="mb-1">• Produtos com avarias devem ser registrados no ato do recebimento, no canhoto da nota fiscal ou em documento específico.</p>
                </div>
              </div>

              {/* 06. Qualidade */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">06</span>
                  QUALIDADE
                </div>
                <div className="term-content pl-8 text-sm text-gray-700">
                  <p className="mb-1">• Contamos com laboratório próprio para controle de qualidade dos produtos e matérias-primas.</p>
                  <p className="mb-1">• Apresentamos laudos de resistência à carga de ruptura e, quando aplicável, de permeabilidade.</p>
                  <p className="mb-1">• A coloração dos produtos pode variar, inclusive dentro do mesmo pallet, devido ao uso de agregados naturais.</p>
                  <p className="mb-1">• A eflorescência (manchas esbranquiçadas) é um fenômeno natural e não caracteriza defeito.</p>
                  <p className="mb-1">• Produtos à base de materiais naturais (mesmo dentro do mesmo lote e/ou pallet) podem apresentar variações de tonalidade e textura, não sendo essas caracterizadas como defeito de fabricação.</p>
                </div>
              </div>

              {/* 07. Cancelamentos */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">07</span>
                  CANCELAMENTOS E ACRÉSCIMOS
                </div>
                <div className="term-content pl-8 text-sm text-gray-700">
                  <p className="mb-1">• Produtos sob encomenda (coloridos, táteis, drenantes, blocos e canaletas acima de 8 MPa, etc.) só podem ser cancelados se ainda não tiverem iniciado a fabricação.</p>
                  <p className="mb-1">• Para solicitação de acréscimos, favor consultar o vendedor sobre a quantidade mínima e a viabilidade de fornecimento.</p>
                  <p className="mb-1">• Produtos acima de 8,0 MPa são fabricados sob demanda, podendo ser cancelados somente antes do início do processo de fabricação.</p>
                  <p className="mb-1">• O cancelamento (automático ou por solicitação do cliente) e/ou a redução da quantidade desses produtos acarretará multa de 15% sobre o valor restante, exceto nas seguintes situações: o produto ainda não passou pelo processo de fabricação; ou a redução da quantidade for inferior a 10% da quantidade originalmente solicitada do produto específico.</p>
                </div>
              </div>

              {/* 08. Cronograma */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">08</span>
                  CRONOGRAMA DE ENTREGA
                </div>
                <div className="term-content pl-8 text-sm text-gray-700">
                  <p className="mb-1">• Para efetivação do pedido o contratante deverá apresentar um cronograma de recebimento do produto.</p>
                </div>
              </div>

              {/* 09. Pagamento */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">09</span>
                  CONDIÇÕES DE PAGAMENTO
                </div>
                <div className="term-content pl-8">
                  <div className="payment-highlight bg-green-100 border-2 border-green-500 rounded-xl p-4 text-center">
                    <div className="value text-2xl font-extrabold text-green-600">
                      {dadosOrcamento.condicoes_pagamento || '28 DIAS'}
                    </div>
                    <div className="label text-sm text-green-700 mt-1">Prazo para pagamento após faturamento</div>
                  </div>
                </div>
              </div>

              {/* 10. Carregamento */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">10</span>
                  CARREGAMENTO E DESCARGA DO MATERIAL
                </div>
                <div className="term-content pl-8 text-sm text-gray-700">
                  <p className="mb-1">• A responsabilidade pela descarga na obra pode ser negociada previamente. Na ausência de acordo, ela será de responsabilidade exclusiva do CLIENTE.</p>
                  <p className="mb-1">• Não carregamos caminhões bascula ou outros tipos de carrocerias que não sejam livre de obstáculo para manuseio de pallets pela empilhadeira.</p>
                  <p className="mb-1">• A Construcom não manuseia cargas de terceiros na carroceria dos caminhões.</p>
                  <p className="mb-1">• Atrasos superiores a 2 (duas) horas na descarga implicam cobrança adicional de 20% do valor unitário do frete, por hora ou fração.</p>
                  <p className="mb-1">• Caso a entrega não ocorra por motivo imputável ao CLIENTE, será cobrado o valor do frete de ida acrescido de 60% como retorno, além de eventuais horas de espera.</p>
                </div>
              </div>

              {/* 11. Pallets */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">11</span>
                  PALLETS
                </div>
                <div className="term-content pl-8 text-sm text-gray-700">
                  <p className="mb-1">• Os Pallets utilizados na entrega são bens consignados e devem ser devolvidos em perfeitas condições.</p>
                  <p className="mb-1">• Frete CIF: o CLIENTE é responsável pela guarda e liberação dos pallets para retirada posterior.</p>
                  <p className="mb-1">• Frete FOB: o CLIENTE deve devolver os pallets diretamente na unidade da fábrica.</p>
                  <p className="mb-1">• Os Pallets são itens de alto custo e reutilização obrigatória. Danos, Extravios ou não devolução no prazo implicam cobrança de R$ 50,00 por unidade.</p>
                  <p className="mb-1">• Não devolução dos pallets poderá suspender futuras entregas até regularização.</p>
                </div>
              </div>

              {/* 12. Observações */}
              <div className="term-block mb-5">
                <div className="term-title font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="num w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">12</span>
                  OBSERVAÇÕES FINAIS
                </div>
                <div className="term-content pl-8">
                  <div className="observations-section bg-yellow-50 border-2 border-dashed border-orange-400 rounded-xl p-4">
                    <h4 className="text-orange-500 font-semibold mb-2 flex items-center gap-2">
                      📝 Observações do Orçamento
                    </h4>
                    <p className="text-gray-700">
                      {dadosOrcamento.observacoes || 'Esta proposta não possui observações adicionais no momento.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="footer bg-gray-100 p-6 border-t-4 border-blue-900 flex justify-between items-center">
              <div className="signature">
                <p className="att italic text-gray-500 mb-2">Atenciosamente,</p>
                <p className="company text-2xl font-extrabold text-blue-900 tracking-wider">CONSTRUCOM</p>
                <div className="seller-info mt-3 pt-3 border-t border-gray-300">
                  <p className="name font-semibold text-gray-800">👤 {dadosOrcamento.vendedor || 'Vendedor'}</p>
                  {dadosOrcamento.vendedor_telefone && (
                    <p className="phone text-gray-600 mt-1">📞 {dadosOrcamento.vendedor_telefone}</p>
                  )}
                </div>
              </div>
              <div className="validity-stamp bg-blue-900 text-white p-4 rounded-xl text-center">
                <div className="days text-3xl font-extrabold text-orange-400">{dadosOrcamento.validade_dias || 15}</div>
                <div className="text text-xs opacity-90">dias de<br/>validade</div>
              </div>
            </footer>
          </div>
        </div>

        {/* Barra de Ações */}
        <div className="bg-gray-100 p-4 flex justify-end gap-3 border-t">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition flex items-center gap-2"
          >
            <X size={18} />
            Fechar
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Printer size={18} />
            Imprimir
          </button>
          <button
            onClick={gerarPDF}
            disabled={gerando}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Download size={18} />
            {gerando ? 'Gerando...' : 'Baixar PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}
