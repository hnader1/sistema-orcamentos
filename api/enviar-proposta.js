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

// Template do email HTML - VERSÃO CORRIGIDA COM LOGO E LINK COMPLETO
const gerarTemplateEmail = (dados) => {
  const {
    numeroProposta,
    nomeCliente,
    nomeFantasia,
    valorTotal,
    totalProdutos,
    totalFrete,
    tipoFrete,
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

  // URL do logo hospedado no Vercel
  const logoUrl = 'https://sistema-orcamentos-theta.vercel.app/logo-construcom.png';

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
        <img src="${logoUrl}" alt="Construcom" style="max-width: 180px; height: auto; margin-bottom: 10px;" />
        <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0; font-size: 14px;">Materiais de Construção</p>
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

              <!-- Totais -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px; border-top: 2px solid #e2e8f0; padding-top: 15px;">
                <tr>
                  <td style="padding: 8px 0; color: #475569;">Total Produtos:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0a2540;">${formatarMoeda(totalProdutos)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: ${isFOB ? '#92400e' : '#166534'}; background-color: ${isFOB ? '#fef3c7' : '#f0fdf4'}; padding-left: 10px; border-radius: 6px 0 0 6px;">
                    🚚 Frete (${isFOB ? 'FOB - Por sua conta' : 'CIF - Incluso'}):
                  </td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${isFOB ? '#92400e' : '#166534'}; background-color: ${isFOB ? '#fef3c7' : '#f0fdf4'}; padding-right: 10px; border-radius: 0 6px 6px 0;">
                    ${isFOB ? 'A COMBINAR' : formatarMoeda(totalFrete)}
                  </td>
                </tr>
              </table>

              <!-- Total Geral -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                <tr>
                  <td style="background: linear-gradient(135deg, #0a2540, #1a365d); padding: 15px; border-radius: 10px;">
                    <table width="100%">
                      <tr>
                        <td style="color: #ffffff; font-weight: 600;">TOTAL${isFOB ? ' (sem frete)' : ''}:</td>
                        <td style="text-align: right; color: #fbbf24; font-size: 22px; font-weight: 700;">${formatarMoeda(valorExibir)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              ${isFOB ? '<p style="text-align: center; color: #92400e; font-size: 12px; margin: 10px 0 0; font-style: italic;">* O valor do frete será combinado e cobrado separadamente</p>' : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA Button -->
    <tr>
      <td style="padding: 0 30px 20px; text-align: center;">
        <a href="${linkAceite}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; text-decoration: none; padding: 18px 40px; border-radius: 12px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
          ✓ ACEITAR PROPOSTA
        </a>
      </td>
    </tr>

    <!-- Link Completo Visível -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; border-radius: 10px; border: 1px solid #e2e8f0;">
          <tr>
            <td style="padding: 15px;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; font-weight: 600;">🔗 Link para aceite da proposta:</p>
              <p style="margin: 0; font-size: 12px; word-break: break-all; line-height: 1.5;">
                <a href="${linkAceite}" style="color: #6366f1; text-decoration: underline;">${linkAceite}</a>
              </p>
              <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8;">
                💡 Copie e cole este link no navegador caso o botão acima não funcione.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Validade -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef3c7; border-radius: 10px; border: 1px solid #fbbf24;">
          <tr>
            <td style="padding: 15px; text-align: center;">
              <span style="color: #92400e; font-size: 14px;">⏰ Esta proposta é válida até <strong>${formatarData(dataExpiracao)}</strong></span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Contato Vendedor -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 10px; border: 1px solid #86efac;">
          <tr>
            <td style="padding: 20px;">
              <p style="color: #166534; margin: 0 0 10px; font-weight: 600;">💬 Dúvidas? Fale com seu vendedor:</p>
              <p style="color: #166534; margin: 0; font-size: 15px;">
                <strong>${vendedor}</strong>
                ${vendedorTelefone ? `<br><a href="https://wa.me/55${vendedorTelefone.replace(/\\D/g, '')}" style="color: #25d366; text-decoration: none;">📱 WhatsApp: ${vendedorTelefone}</a>` : ''}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Aviso PDF -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 10px; border: 1px solid #93c5fd;">
          <tr>
            <td style="padding: 15px; text-align: center;">
              <span style="color: #1e40af; font-size: 13px;">📄 A proposta comercial completa está disponível no link acima.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #0a2540; padding: 25px; text-align: center;">
        <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 12px;">
          Construcom Materiais de Construção LTDA<br>
          Este email foi enviado automaticamente. Em caso de dúvidas, contate seu vendedor.
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `;
};

// Handler principal
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const {
      emailDestino,
      numeroProposta,
      nomeCliente,
      nomeFantasia,
      valorTotal,
      totalProdutos,
      totalFrete,
      tipoFrete,
      dataExpiracao,
      vendedor,
      vendedorTelefone,
      vendedorEmail,
      linkAceite,
      itens,
      pdfBase64,
      pdfNome
    } = req.body;

    // Validações
    if (!emailDestino || !numeroProposta || !linkAceite) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios faltando',
        detalhes: 'emailDestino, numeroProposta e linkAceite são obrigatórios'
      });
    }

    // Criar transporter
    const transporter = createTransporter();

    // Verificar conexão
    await transporter.verify();

    // Gerar HTML do email
    const htmlEmail = gerarTemplateEmail({
      numeroProposta,
      nomeCliente,
      nomeFantasia,
      valorTotal,
      totalProdutos,
      totalFrete,
      tipoFrete,
      dataExpiracao,
      vendedor,
      vendedorTelefone,
      linkAceite,
      itens
    });

    // Configurar email
    const mailOptions = {
      from: `"Construcom" <${process.env.SMTP_USER}>`,
      to: emailDestino,
      cc: vendedorEmail || undefined,
      subject: `Proposta Comercial ${numeroProposta} - Construcom`,
      html: htmlEmail,
      attachments: []
    };

    // Adicionar PDF se fornecido
    if (pdfBase64) {
      mailOptions.attachments.push({
        filename: pdfNome || `Proposta_${numeroProposta}.pdf`,
        content: pdfBase64,
        encoding: 'base64',
        contentType: 'application/pdf'
      });
    }

    // Enviar email
    const info = await transporter.sendMail(mailOptions);

    console.log('Email enviado:', info.messageId);

    return res.status(200).json({
      success: true,
      messageId: info.messageId,
      mensagem: `Email enviado com sucesso para ${emailDestino}`
    });

  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    return res.status(500).json({
      error: 'Erro ao enviar email',
      detalhes: error.message,
      codigo: error.code
    });
  }
}
