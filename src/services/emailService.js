// =====================================================
// SERVICE DE ENVIO DE EMAIL PARA PROPOSTAS
// =====================================================

const API_URL = '/api/enviar-proposta';

/**
 * Envia proposta por email
 * @param {Object} dados - Dados da proposta
 * @returns {Promise<Object>} - Resultado do envio
 */
export const enviarPropostaPorEmail = async (dados) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.detalhes || resultado.error || 'Erro ao enviar email');
    }

    return resultado;
  } catch (error) {
    console.error('Erro no envio de email:', error);
    throw error;
  }
};

/**
 * Prepara e envia proposta com todos os dados necessários
 * @param {Object} orcamento - Dados do orçamento
 * @param {Object} proposta - Dados da proposta
 * @param {string} pdfBase64 - PDF em base64 (opcional)
 * @returns {Promise<Object>} - Resultado do envio
 */
export const enviarPropostaCompleta = async (orcamento, proposta, pdfBase64 = null) => {
  // Extrair itens do orçamento
  let itens = [];
  try {
    if (orcamento.itens_json) {
      itens = typeof orcamento.itens_json === 'string' 
        ? JSON.parse(orcamento.itens_json) 
        : orcamento.itens_json;
    }
  } catch (e) {
    console.error('Erro ao parsear itens:', e);
  }

  // Montar dados para envio
  const dadosEmail = {
    emailDestino: orcamento.cliente_email,
    numeroProposta: proposta.numero_proposta,
    nomeCliente: orcamento.cliente_nome || orcamento.cliente_empresa,
    nomeFantasia: orcamento.cliente_nome,
    valorTotal: proposta.valor_total || orcamento.valor_total,
    totalProdutos: proposta.total_produtos || orcamento.total_produtos,
    totalFrete: proposta.total_frete || orcamento.total_frete,
    tipoFrete: proposta.tipo_frete || orcamento.tipo_frete,
    dataExpiracao: proposta.data_expiracao,
    vendedor: orcamento.vendedor,
    vendedorTelefone: orcamento.vendedor_telefone,
    vendedorEmail: orcamento.vendedor_email,
    linkAceite: `${window.location.origin}/aceite/${proposta.token_aceite}`,
    itens: itens,
    pdfBase64: pdfBase64,
    pdfNome: `Proposta_${proposta.numero_proposta}.pdf`
  };

  return await enviarPropostaPorEmail(dadosEmail);
};

export default {
  enviarPropostaPorEmail,
  enviarPropostaCompleta
};
