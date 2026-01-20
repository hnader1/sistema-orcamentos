import nodemailer from 'nodemailer';

// Configuração do transporter SMTP Locaweb
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'email-ssl.com.br',
    port: parseInt(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Template do email HTML
const gerarTemplateEmail = (dados) => {
  const {
    numeroProposta,
    nomeCliente,
    nomeFantasia,
    valorTotal,
    totalProdutos,
    totalFrete,
    tipoFrete,
    qtdViagens,
    dataExpiracao,
    vendedor,
    vendedorTelefone,
    linkAceite,
    itens
  } = dados;

  const isFOB = tipoFrete === 'FOB';
  const valorExibir = isFOB ? totalProdutos : valorTotal;

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  let itensHtml = '';
  if (itens && itens.length > 0) {
    itensHtml = itens.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.produto}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantidade} ${item.unidade || 'un'}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatarMoeda(item.preco_unitario)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">${formatarMoeda(item.total)}</td>
      </tr>
    `).join('');
  }

  const logoUrl = 'https://sistema-orcamentos-theta.vercel.app/logo-construcom.png';

  const viagensHtml = qtdViagens && qtdViagens > 0 ? `
    <tr>
      <td style="padding: 8px 0; color: #475569;">🚛 Quantidade de Viagens:</td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0a2540;">${qtdViagens} ${qtdViagens === 1 ? 'viagem' : 'viagens'}</td>
    </tr>
  ` : '';

  const freteHtml = !isFOB && totalFrete > 0 ? `
    <tr>
      <td style="padding: 8px 0; color: #475569;">🚚 Frete:</td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0a2540;">${formatarMoeda(totalFrete)}</td>
    </tr>
  ` : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposta Comercial ${numeroProposta}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header com Logo -->
    <tr>
      <td style="background: linear-gradient(135deg, #0a2540 0%, #1a365d 100%); padding: 30px; text-align: center;">
        <img src="${logoUrl}" alt="Construcom" style="max-width: 200px; height: auto;" />
      </td>
    </tr>

    <!-- Proposta Badge -->
    <tr>
      <td style="background-color: #fbbf24; padding: 15px; text-align: center;">
        <span style="color: #92400e; font-size: 14px; font-weight: 600;">PROPOSTA COMERCIAL</span>
        <br>
        <span style="color: #78350f; font-size: 20px; font-weight: 700;">${numeroProposta}</span>
      </td>
    </tr>

    <!-- Saudação -->
    <tr>
      <td style="padding: 30px;">
        <p style="color: #0a2540; font-size: 16px; margin: 0 0 20px;">
          Olá <strong>${nomeFantasia || nomeCliente}</strong>,
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          Conforme conversamos, segue nossa proposta comercial para fornecimento de materiais de construção.
        </p>
      </td>
    </tr>

    <!-- Resumo da Proposta -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 20px;">
              <h3 style="color: #0a2540; margin: 0 0 15px; font-size: 16px;">📦 Itens da Proposta</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 13px;">
                <thead>
                  <tr style="background-color: #e2e8f0;">
                    <th style="padding: 10px; text-align: left; color: #475569;">Produto</th>
                    <th style="padding: 10px; text-align: center; color: #475569;">Qtd</th>
                    <th style="padding: 10px; text-align: right; color: #475569;">Unit.</th>
                    <th style="padding: 10px; text-align: right; color: #475569;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itensHtml}
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Totais -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a2540; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="color: #ffffff; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #94a3b8;">📋 Subtotal Produtos:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatarMoeda(totalProdutos)}</td>
                </tr>
                ${freteHtml}
                ${viagensHtml}
                <tr style="border-top: 1px solid #334155;">
                  <td style="padding: 15px 0 8px; color: #fbbf24; font-size: 16px; font-weight: 600;">💰 VALOR TOTAL:</td>
                  <td style="padding: 15px 0 8px; text-align: right; font-size: 20px; font-weight: 700; color: #fbbf24;">${formatarMoeda(valorExibir)}</td>
                </tr>
                ${isFOB ? '<tr><td colspan="2" style="padding: 5px 0; color: #94a3b8; font-size: 12px;">* Frete por conta do cliente (FOB)</td></tr>' : ''}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Validade -->
    ${dataExpiracao ? `
    <tr>
      <td style="padding: 0 30px 20px;">
        <p style="color: #dc2626; font-size: 13px; margin: 0; text-align: center;">
          ⏰ Esta proposta é válida até <strong>${formatarData(dataExpiracao)}</strong>
        </p>
      </td>
    </tr>
    ` : ''}

    <!-- Botão de Aceite -->
    <tr>
      <td style="padding: 0 30px 30px; text-align: center;">
        <a href="${linkAceite}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
          ✅ ACEITAR PROPOSTA
        </a>
      </td>
    </tr>

    <!-- Contato do Vendedor -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px;">
          <tr>
            <td style="padding: 20px;">
              <p style="color: #0a2540; font-size: 14px; margin: 0 0 10px;">
                <strong>Dúvidas? Fale com seu vendedor:</strong>
              </p>
              <p style="color: #475569; font-size: 14px; margin: 0;">
                👤 ${vendedor || 'Equipe Comercial'}<br>
                ${vendedorTelefone ? `📱 ${vendedorTelefone}` : ''}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #0a2540; padding: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Construcom - Materiais de Construção<br>
          Este email foi enviado automaticamente. Por favor, não responda.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
};

// Handler principal da API
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const {
      email,
      emailDestino, // Aceitar também emailDestino do frontend
      numeroProposta,
      nomeCliente,
      nomeFantasia,
      valorTotal,
      totalProdutos,
      totalFrete,
      tipoFrete,
      qtdViagens,
      dataExpiracao,
      vendedor,
      vendedorTelefone,
      linkAceite,
      itens,
      pdfBase64
    } = req.body;

    // Aceitar tanto 'email' quanto 'emailDestino'
    const destinatario = email || emailDestino;

    if (!destinatario) {
      return res.status(400).json({ error: 'Email do destinatário é obrigatório' });
    }

    if (!numeroProposta) {
      return res.status(400).json({ error: 'Número da proposta é obrigatório' });
    }

    const transporter = createTransporter();

    // Gerar HTML do email
    const htmlContent = gerarTemplateEmail({
      numeroProposta,
      nomeCliente,
      nomeFantasia,
      valorTotal,
      totalProdutos,
      totalFrete,
      tipoFrete,
      qtdViagens,
      dataExpiracao,
      vendedor,
      vendedorTelefone,
      linkAceite,
      itens
    });

    // Configurar email
    const mailOptions = {
      from: `"Construcom" <${process.env.SMTP_USER}>`,
      to: destinatario,
      subject: `Proposta Comercial ${numeroProposta} - Construcom`,
      html: htmlContent
    };

    // Adicionar PDF como anexo se fornecido
    if (pdfBase64) {
      mailOptions.attachments = [
        {
          filename: `Proposta-${numeroProposta}.pdf`,
          content: pdfBase64,
          encoding: 'base64'
        }
      ];
    }

    // Enviar email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email enviado:', info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      message: 'Email enviado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return res.status(500).json({
      error: 'Erro ao enviar email',
      details: error.message
    });
  }
}
