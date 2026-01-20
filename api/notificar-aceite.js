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

// Formatar moeda
const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
};

// Formatar data
const formatarData = (data) => {
  if (!data) return '';
  return new Date(data).toLocaleDateString('pt-BR');
};

// Template email para CLIENTE
const templateEmailCliente = (dados) => {
  const { numeroProposta, nomeCliente, valorTotal, dataAceite, vendedor, vendedorTelefone, vendedorEmail } = dados;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposta Aceita - ${numeroProposta}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
        <div style="width: 80px; height: 80px; background: white; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 40px;">✓</span>
        </div>
        <h1 style="color: white; margin: 0; font-size: 24px;">Proposta Aceita!</h1>
      </td>
    </tr>

    <!-- Conteúdo -->
    <tr>
      <td style="padding: 30px;">
        <p style="color: #0a2540; font-size: 16px; margin: 0 0 20px;">
          Olá <strong>${nomeCliente}</strong>,
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
          Confirmamos o recebimento do aceite da sua proposta comercial. Nossa equipe entrará em contato em breve para dar continuidade ao seu pedido.
        </p>
        
        <!-- Resumo -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; margin: 20px 0;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 10px;"><strong>📄 Proposta:</strong> ${numeroProposta}</p>
              <p style="margin: 0 0 10px;"><strong>💰 Valor Total:</strong> ${formatarMoeda(valorTotal)}</p>
              <p style="margin: 0;"><strong>📅 Data do Aceite:</strong> ${formatarData(dataAceite)}</p>
            </td>
          </tr>
        </table>

        <!-- Vendedor -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 12px; margin: 20px 0;">
          <tr>
            <td style="padding: 20px;">
              <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px;">
                <strong>Seu Vendedor:</strong>
              </p>
              <p style="color: #475569; font-size: 14px; margin: 0;">
                👤 ${vendedor || 'Equipe Comercial'}<br>
                ${vendedorTelefone ? `📱 ${vendedorTelefone}<br>` : ''}
                ${vendedorEmail ? `✉️ ${vendedorEmail}` : ''}
              </p>
            </td>
          </tr>
        </table>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 20px 0 0;">
          Agradecemos a confiança em nossos produtos!
        </p>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background-color: #0a2540; padding: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Construcom Artefatos de Cimento LTDA<br>
          Este email foi enviado automaticamente.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

// Template email para VENDEDOR e ADMINISTRATIVO
const templateEmailInterno = (dados) => {
  const { 
    numeroProposta, 
    nomeCliente, 
    cpfCnpj,
    emailCliente,
    telefoneCliente,
    valorTotal, 
    dataAceite, 
    vendedor,
    observacaoCliente,
    tipoCliente,
    contribuinteIcms,
    inscricaoEstadual
  } = dados;
  
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🎉 Proposta Aceita - ${numeroProposta}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <tr>
      <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🎉 PROPOSTA ACEITA!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px;">${numeroProposta}</p>
      </td>
    </tr>

    <!-- Alerta -->
    <tr>
      <td style="background-color: #fef3c7; padding: 15px; text-align: center;">
        <p style="color: #92400e; font-size: 14px; margin: 0; font-weight: 600;">
          ⚡ O cliente ${nomeCliente} aceitou a proposta!
        </p>
      </td>
    </tr>

    <!-- Dados do Cliente -->
    <tr>
      <td style="padding: 30px;">
        <h3 style="color: #0a2540; margin: 0 0 15px; font-size: 16px;">📋 Dados do Cliente</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 8px;"><strong>Cliente:</strong> ${nomeCliente}</p>
              <p style="margin: 0 0 8px;"><strong>CPF/CNPJ:</strong> ${cpfCnpj || 'Não informado'}</p>
              <p style="margin: 0 0 8px;"><strong>Email:</strong> ${emailCliente || 'Não informado'}</p>
              <p style="margin: 0 0 8px;"><strong>Telefone:</strong> ${telefoneCliente || 'Não informado'}</p>
              <p style="margin: 0 0 8px;"><strong>Tipo:</strong> ${tipoCliente === 'consumidor_final' ? 'Consumidor Final' : tipoCliente === 'revenda' ? 'Revenda' : 'Construtor'}</p>
              <p style="margin: 0 0 8px;"><strong>Contribuinte ICMS:</strong> ${contribuinteIcms ? 'Sim' : 'Não'}</p>
              <p style="margin: 0;"><strong>IE:</strong> ${inscricaoEstadual || 'ISENTO'}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Dados da Proposta -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <h3 style="color: #0a2540; margin: 0 0 15px; font-size: 16px;">💰 Dados da Proposta</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a2540; border-radius: 12px; color: white;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 8px;"><strong>Proposta:</strong> ${numeroProposta}</p>
              <p style="margin: 0 0 8px;"><strong>Valor Total:</strong> <span style="color: #fbbf24; font-size: 18px;">${formatarMoeda(valorTotal)}</span></p>
              <p style="margin: 0 0 8px;"><strong>Vendedor:</strong> ${vendedor || 'Não atribuído'}</p>
              <p style="margin: 0;"><strong>Data Aceite:</strong> ${formatarData(dataAceite)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${observacaoCliente ? `
    <!-- Observação do Cliente -->
    <tr>
      <td style="padding: 0 30px 30px;">
        <h3 style="color: #0a2540; margin: 0 0 15px; font-size: 16px;">💬 Observação do Cliente</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fefce8; border-radius: 12px; border: 1px solid #fde047;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0; color: #713f12;">${observacaoCliente}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ` : ''}

    <!-- Footer -->
    <tr>
      <td style="background-color: #0a2540; padding: 20px; text-align: center;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          Sistema de Orçamentos - Construcom<br>
          Email automático - ${formatarData(new Date())}
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
      numeroProposta,
      nomeCliente,
      cpfCnpj,
      emailCliente,
      telefoneCliente,
      valorTotal,
      dataAceite,
      vendedor,
      vendedorTelefone,
      vendedorEmail,
      observacaoCliente,
      tipoCliente,
      contribuinteIcms,
      inscricaoEstadual
    } = req.body;

    if (!numeroProposta) {
      return res.status(400).json({ error: 'Número da proposta é obrigatório' });
    }

    const transporter = createTransporter();
    const resultados = [];

    // Email administrativo fixo
    const emailAdministrativo = 'no-reply@unistein.com.br';

    // 1. EMAIL PARA O CLIENTE (se tiver email)
    if (emailCliente) {
      try {
        const htmlCliente = templateEmailCliente({
          numeroProposta,
          nomeCliente,
          valorTotal,
          dataAceite,
          vendedor,
          vendedorTelefone,
          vendedorEmail
        });

        const infoCliente = await transporter.sendMail({
          from: `"Construcom" <${process.env.SMTP_USER}>`,
          to: emailCliente,
          subject: `✅ Proposta ${numeroProposta} Aceita - Confirmação`,
          html: htmlCliente
        });

        resultados.push({ destinatario: 'cliente', email: emailCliente, sucesso: true, messageId: infoCliente.messageId });
        console.log('Email cliente enviado:', infoCliente.messageId);
      } catch (err) {
        console.error('Erro email cliente:', err);
        resultados.push({ destinatario: 'cliente', email: emailCliente, sucesso: false, erro: err.message });
      }
    }

    // 2. EMAIL PARA O VENDEDOR (se tiver email)
    if (vendedorEmail) {
      try {
        const htmlVendedor = templateEmailInterno({
          numeroProposta,
          nomeCliente,
          cpfCnpj,
          emailCliente,
          telefoneCliente,
          valorTotal,
          dataAceite,
          vendedor,
          observacaoCliente,
          tipoCliente,
          contribuinteIcms,
          inscricaoEstadual
        });

        const infoVendedor = await transporter.sendMail({
          from: `"Sistema Construcom" <${process.env.SMTP_USER}>`,
          to: vendedorEmail,
          subject: `🎉 PROPOSTA ACEITA! ${numeroProposta} - Cliente: ${nomeCliente}`,
          html: htmlVendedor
        });

        resultados.push({ destinatario: 'vendedor', email: vendedorEmail, sucesso: true, messageId: infoVendedor.messageId });
        console.log('Email vendedor enviado:', infoVendedor.messageId);
      } catch (err) {
        console.error('Erro email vendedor:', err);
        resultados.push({ destinatario: 'vendedor', email: vendedorEmail, sucesso: false, erro: err.message });
      }
    }

    // 3. EMAIL PARA ADMINISTRATIVO (no-reply@unistein.com.br)
    try {
      const htmlAdmin = templateEmailInterno({
        numeroProposta,
        nomeCliente,
        cpfCnpj,
        emailCliente,
        telefoneCliente,
        valorTotal,
        dataAceite,
        vendedor,
        observacaoCliente,
        tipoCliente,
        contribuinteIcms,
        inscricaoEstadual
      });

      const infoAdmin = await transporter.sendMail({
        from: `"Sistema Construcom" <${process.env.SMTP_USER}>`,
        to: emailAdministrativo,
        subject: `🎉 PROPOSTA ACEITA! ${numeroProposta} - Cliente: ${nomeCliente} - Vendedor: ${vendedor || 'N/A'}`,
        html: htmlAdmin
      });

      resultados.push({ destinatario: 'administrativo', email: emailAdministrativo, sucesso: true, messageId: infoAdmin.messageId });
      console.log('Email administrativo enviado:', infoAdmin.messageId);
    } catch (err) {
      console.error('Erro email administrativo:', err);
      resultados.push({ destinatario: 'administrativo', email: emailAdministrativo, sucesso: false, erro: err.message });
    }

    // Verificar se pelo menos um email foi enviado com sucesso
    const algumSucesso = resultados.some(r => r.sucesso);

    return res.status(algumSucesso ? 200 : 500).json({
      success: algumSucesso,
      message: algumSucesso ? 'Emails de notificação enviados' : 'Falha ao enviar emails',
      resultados
    });

  } catch (error) {
    console.error('Erro ao processar notificação de aceite:', error);
    return res.status(500).json({
      error: 'Erro ao enviar notificações',
      details: error.message
    });
  }
}
