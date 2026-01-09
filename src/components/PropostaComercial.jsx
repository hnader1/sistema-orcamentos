import { useState } from 'react'
import { X, Download, Printer } from 'lucide-react'
import logoConstrucom from '../assets/logo-construcom.png'

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
  const totalProdutos = produtos.reduce((acc, p) => acc + (p.quantidade * p.preco), 0)
  const desconto = (totalProdutos * (dadosOrcamento.desconto_geral || 0)) / 100
  const totalProdutosComDesconto = totalProdutos - desconto
  const totalFrete = dadosFrete?.valor_total_frete || 0
  const totalGeral = totalProdutosComDesconto + totalFrete

  // Formatar data
  const formatarData = (dataStr) => {
    if (!dataStr) return ''
    const data = new Date(dataStr + 'T00:00:00')
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
    const tipo = dadosFrete?.tipo_frete || 'FOB'
    if (tipo === 'FOB') {
      return { texto: '🚚 Frete por conta do cliente', classe: 'bg-yellow-100 text-yellow-800 border-yellow-400' }
    } else if (tipo.includes('SEM DESCARGA') || tipo === 'CIF') {
      return { texto: '⚠️ Descarga por conta do cliente', classe: 'bg-blue-100 text-blue-800 border-blue-400' }
    } else {
      return { texto: '✅ Frete com descarga inclusa', classe: 'bg-green-100 text-green-800 border-green-400' }
    }
  }

  const mensagemFrete = getMensagemFrete()

  // Imprimir
  const imprimir = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-4 flex justify-between items-center print:hidden">
          <div className="flex items-center gap-3">
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
        <div className="flex-1 overflow-auto p-4 bg-gray-100 print:p-0 print:bg-white">
          <div id="proposta-content" className="proposal-container bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto print:shadow-none print:rounded-none">
            
            {/* Header com Logo */}
            <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white p-6 flex justify-between items-center print:bg-blue-900">
              <div className="flex items-center gap-4">
                <img 
                  src={logoConstrucom} 
                  alt="Construcom" 
                  className="h-16 rounded-lg"
                  style={{ maxWidth: '180px', objectFit: 'contain' }}
                />
              </div>
              <div className="text-right">
                <div className="text-xs opacity-80 uppercase">Proposta Comercial</div>
                <div className="text-2xl font-bold text-orange-400">
                  #{dadosOrcamento.numero || 'ORC-0001'}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  {formatarData(dadosOrcamento.data_orcamento)}
                </div>
                <div className="text-xs opacity-80">Pedro Leopoldo - MG</div>
              </div>
            </header>

            {/* Dados do Cliente */}
            <section className="bg-gray-100 p-6 border-b-4 border-orange-500">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 flex gap-2">
                  <span className="font-semibold text-blue-900 text-xs uppercase min-w-[90px]">Cliente:</span>
                  <span>{dadosOrcamento.cliente_nome || dadosOrcamento.cliente_empresa || '-'}</span>
                </div>
                {dadosOrcamento.cliente_cpf_cnpj && (
                  <div className="col-span-2 flex gap-2">
                    <span className="font-semibold text-blue-900 text-xs uppercase min-w-[90px]">CPF/CNPJ:</span>
                    <span>{dadosOrcamento.cliente_cpf_cnpj}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="font-semibold text-blue-900 text-xs uppercase min-w-[90px]">Telefone:</span>
                  <span>{dadosOrcamento.cliente_telefone || '-'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-blue-900 text-xs uppercase min-w-[90px]">E-mail:</span>
                  <span>{dadosOrcamento.cliente_email || '-'}</span>
                </div>
              </div>
            </section>

            {/* Endereço de Entrega */}
            {dadosOrcamento.endereco_entrega && (
              <section className="bg-blue-50 p-4 flex items-center gap-4 border-b border-blue-200">
                <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white text-lg">
                  📍
                </div>
                <div>
                  <div className="text-xs text-blue-900 uppercase font-semibold">Endereço de Entrega</div>
                  <div className="text-sm text-gray-800 mt-1">{dadosOrcamento.endereco_entrega}</div>
                </div>
              </section>
            )}

            {/* Intro */}
            <section className="p-5 border-b border-gray-200">
              <p className="font-semibold text-blue-900 mb-2">Prezado Sr.(a),</p>
              <p className="text-gray-700">Atendendo a sua solicitação, apresentamos a proposta comercial para fornecimento de produtos para a sua obra.</p>
            </section>

            {/* Produtos */}
            <div className="bg-blue-900 text-white py-3 px-6 font-semibold flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">01</span>
              PRODUTOS
            </div>
            <section className="px-6 pb-5">
              <table className="w-full mt-4 text-sm">
                <thead>
                  <tr className="bg-blue-700 text-white">
                    <th className="p-3 text-left font-semibold text-xs uppercase">Material</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase">Classe</th>
                    <th className="p-3 text-left font-semibold text-xs uppercase">MPA</th>
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
                        {formatarValor(produto.preco)}
                      </td>
                      <td className="p-3 border-b border-gray-200 text-right font-mono font-semibold">
                        {formatarValor(produto.quantidade * produto.preco)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-200 font-semibold">
                    <td colSpan="5" className="p-3 text-right border-t-2 border-blue-900">SUBTOTAL PRODUTOS:</td>
                    <td className="p-3 text-right font-mono border-t-2 border-blue-900">{formatarValor(totalProdutosComDesconto)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Frete */}
            <div className="bg-blue-900 text-white py-3 px-6 font-semibold flex items-center gap-2">
              <span className="text-lg">📦</span>
              FRETE
            </div>
            <section className="px-6 pb-5">
              <div className="bg-gray-100 rounded-xl p-5 mt-4 border-l-4 border-orange-500">
                <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
                  <div className="font-bold text-blue-900">
                    Tipo de Frete: 
                    <span className="ml-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
                      {dadosFrete?.tipo_frete || 'FOB'}
                    </span>
                  </div>
                  <div className={`text-sm px-3 py-1 rounded-lg font-semibold border ${mensagemFrete.classe}`}>
                    {mensagemFrete.texto}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-gray-500 uppercase mb-1">Quantidade de Viagens</div>
                    <div className="text-xl font-bold text-blue-900">{dadosFrete?.quantidade_viagens || 0}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-gray-500 uppercase mb-1">Valor por Viagem</div>
                    <div className="text-xl font-bold text-blue-900">{formatarValor(dadosFrete?.valor_frete || 0)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-xs text-gray-500 uppercase mb-1">Total Frete</div>
                    <div className="text-xl font-bold text-orange-500">{formatarValor(totalFrete)}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Total com Resumo */}
            <section className="bg-gradient-to-r from-blue-900 to-blue-700 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex justify-between min-w-[280px] mb-2">
                    <span className="opacity-85">Total Produtos:</span>
                    <span className="font-semibold font-mono">{formatarValor(totalProdutosComDesconto)}</span>
                  </div>
                  <div className="flex justify-between min-w-[280px] mb-2">
                    <span className="opacity-85">Total Frete:</span>
                    <span className="font-semibold font-mono">{formatarValor(totalFrete)}</span>
                  </div>
                  <div className="flex justify-between min-w-[280px] border-t-2 border-white/30 pt-3 mt-2">
                    <span className="text-lg font-bold">TOTAL DA PROPOSTA:</span>
                    <span className="text-3xl font-extrabold text-orange-400">{formatarValor(totalGeral)}</span>
                  </div>
                </div>
                <div className="bg-white/15 p-4 rounded-xl text-center">
                  <div className="text-4xl mb-1">✅</div>
                  <div className="text-xs opacity-90">Proposta<br/>Comercial</div>
                </div>
              </div>
            </section>

            {/* Termos e Condições */}
            <section className="p-6 text-sm">
              {/* 02. Condições Gerais */}
              <div className="mb-5">
                <div className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">02</span>
                  CONDIÇÕES GERAIS
                </div>
                <div className="pl-8 text-gray-700">
                  <p className="mb-1">• Todos os produtos fornecidos estão de acordo com as normas técnicas brasileiras vigentes.</p>
                  <p className="mb-1">• Esta proposta é personalizada e considera as condições específicas da obra informada.</p>
                </div>
              </div>

              {/* 03. Validade */}
              <div className="mb-5">
                <div className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">03</span>
                  VALIDADE DA PROPOSTA
                </div>
                <div className="pl-8">
                  <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3 font-semibold text-yellow-800 mb-2">
                    ⏰ Esta proposta é válida por <strong>{dadosOrcamento.validade_dias || 15} dias</strong>.
                  </div>
                  <p className="text-gray-700">• Os preços aqui apresentados são válidos por até 60 (sessenta) dias após o aceite da proposta.</p>
                </div>
              </div>

              {/* 04-08 Resumidos */}
              <div className="mb-5">
                <div className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">04</span>
                  PROGRAMAÇÃO DE ENTREGA
                </div>
                <div className="pl-8 text-gray-700">
                  <p className="mb-1">• O cronograma geral da obra deve ser entregue junto com este documento.</p>
                  <p className="mb-1">• O prazo médio de início da fabricação é de 7 dias úteis após confirmação do pedido.</p>
                </div>
              </div>

              <div className="mb-5">
                <div className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">05</span>
                  GARANTIA DOS PRODUTOS
                </div>
                <div className="pl-8 text-gray-700">
                  <p className="mb-1">• Os produtos possuem garantia de 5 (cinco) anos contra defeito de fabricação.</p>
                </div>
              </div>

              {/* 09. Pagamento */}
              <div className="mb-5">
                <div className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">09</span>
                  CONDIÇÕES DE PAGAMENTO
                </div>
                <div className="pl-8">
                  <div className="bg-green-100 border-2 border-green-500 rounded-xl p-4 text-center">
                    <div className="text-2xl font-extrabold text-green-600">
                      {dadosOrcamento.condicoes_pagamento || '28 DIAS'}
                    </div>
                    <div className="text-sm text-green-700 mt-1">Prazo para pagamento após faturamento</div>
                  </div>
                </div>
              </div>

              {/* 12. Observações */}
              <div className="mb-5">
                <div className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">12</span>
                  OBSERVAÇÕES FINAIS
                </div>
                <div className="pl-8">
                  <div className="bg-yellow-50 border-2 border-dashed border-orange-400 rounded-xl p-4">
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
            <footer className="bg-gray-100 p-6 border-t-4 border-blue-900 flex justify-between items-center">
              <div>
                <p className="italic text-gray-500 mb-2">Atenciosamente,</p>
                <p className="text-2xl font-extrabold text-blue-900 tracking-wider">CONSTRUCOM</p>
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="font-semibold text-gray-800">👤 {dadosOrcamento.vendedor || 'Vendedor'}</p>
                  {dadosOrcamento.vendedor_telefone && (
                    <p className="text-gray-600 mt-1">📞 {dadosOrcamento.vendedor_telefone}</p>
                  )}
                </div>
              </div>
              <div className="bg-blue-900 text-white p-4 rounded-xl text-center">
                <div className="text-3xl font-extrabold text-orange-400">{dadosOrcamento.validade_dias || 15}</div>
                <div className="text-xs opacity-90">dias de<br/>validade</div>
              </div>
            </footer>
          </div>
        </div>

        {/* Barra de Ações */}
        <div className="bg-gray-100 p-4 flex justify-end gap-3 border-t print:hidden">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition flex items-center gap-2"
          >
            <X size={18} />
            Fechar
          </button>
          <button
            onClick={imprimir}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center gap-2"
          >
            <Printer size={18} />
            Imprimir / PDF
          </button>
        </div>
      </div>

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #proposta-content, #proposta-content * {
            visibility: visible;
          }
          #proposta-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
