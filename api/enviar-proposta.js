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

// Template do email HTML - VERSÃO CORRIGIDA
// - Logo da empresa (sem ícone + texto)
// - Valores de frete e viagens corretos
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

  // URL do logo hospedado no Vercel - APENAS O LOGO (sem ícone + texto)
  const logoUrl = 'https://sistema-orcamentos-theta.vercel.app/logo-construcom.png';

  // HTML para viagens (se houver)
  const viagensHtml = qtdViagens && qtdViagens > 0 ? `
    <tr>
      <td style="padding: 8px 0; color: #475569;">🚛 Quantidade de Viagens:</td>
      <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0a2540;">${qtdViagens} ${qtdViagens === 1 ? 'viagem' : 'viagens'}</td>
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
    
    <!-- Header APENAS com Logo (sem ícone + texto) -->
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
                </tbody