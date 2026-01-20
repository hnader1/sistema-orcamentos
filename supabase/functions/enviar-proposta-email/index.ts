// =====================================================
// EDGE FUNCTION: ENVIAR PROPOSTA POR EMAIL
// =====================================================
// Supabase Edge Function para enviar email com:
// - Link de aceite da proposta
// - PDF da proposta anexado
// - Template profissional HTML
// =====================================================
// Deploy: supabase functions deploy enviar-proposta-email
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configurações de Email (usar Resend, SendGrid, ou SMTP Locaweb)
const EMAIL_SERVICE = Deno.env.get('EMAIL_SERVICE') || 'resend' // 'resend', 'sendgrid', 'smtp'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
const SMTP_HOST = Deno.env.get('SMTP_HOST')
const SMTP_PORT = Deno.env.get('SMTP_PORT')
const SMTP_USER = Deno.env.get('SMTP_USER')
const SMTP_PASS = Deno.env.get('SMTP_PASS')

const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'propostas@construcom.com.br'
const FROM_NAME = 'Construcom - Propostas'

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      proposta_id, 
      email_cliente, 
      link_aceite, 
      mensagem_personalizada,
      orcamento 
    } = await req.json()

    // Validações
    if (!proposta_id || !email_cliente || !link_aceite) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar proposta e dados do PDF
    const { data: proposta, error: propostaError } = await supabase
      .from('propostas')
      .select('*, orcamentos(*)')
      .eq('id', proposta_id)
      .single()

    if (propostaError || !proposta) {
      console.error('Erro ao buscar proposta:', propostaError)
      return new Response(
        JSON.stringify({ error: 'Proposta não encontrada' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Baixar o PDF do Storage (se existir)
    let pdfBase64 = null
    let pdfNome = null

    if (proposta.pdf_path) {
      try {
        const { data: pdfData, error: pdfError } = await supabase.storage
          .from('propostas-pdf')
          .download(proposta.pdf_path)

        if (!pdfError && pdfData) {
          const arrayBuffer = await pdfData.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer)
          pdfBase64 = btoa(String.fromCharCode(...uint8Array))
          pdfNome = `Proposta-${proposta.numero_proposta || 'CONSTRUCOM'}.pdf`
        }
      } catch (e) {
        console.warn('Não foi possível anexar o PDF:', e)
      }
    }

    // Gerar HTML do email
    const emailHtml = gerarTemplateEmail({
      numeroProposta: proposta.numero_proposta,
      nomeCliente: orcamento?.cliente_empresa || orcamento?.cliente_nome || 'Cliente',
      valorTotal: proposta.valor_total,
      dataValidade: proposta.data_expiracao,
      vendedorNome: orcamento?.vendedor_nome || 'Equipe Comercial',
      vendedorTelefone: orcamento?.vendedor_telefone || '(31) 99279-0656',
      linkAceite: link_aceite,
      mensagemPersonalizada: mensagem_personalizada
    })

    // Enviar email baseado no serviço configurado
    let resultado

    switch (EMAIL_SERVICE) {
      case 'resend':
        resultado = await enviarViaResend({
          to: email_cliente,
          subject: `Proposta Comercial ${proposta.numero_proposta} - Construcom`,
          html: emailHtml,
          pdfBase64,
          pdfNome
        })
        break

      case 'sendgrid':
        resultado = await enviarViaSendGrid({
          to: email_cliente,
          subject: `Proposta Comercial ${proposta.numero_proposta} - Construcom`,
          html: emailHtml,
          pdfBase64,
          pdfNome
        })
        break

      case 'smtp':
        resultado = await enviarViaSMTP({
          to: email_cliente,
          subject: `Proposta Comercial ${proposta.numero_proposta} - Construcom`,
          html: emailHtml,
          pdfBase64,
          pdfNome
        })
        break

      default:
        throw new Error('Serviço de email não configurado')
    }

    // Log do envio
    await supabase.from('log_emails_proposta').insert({
      proposta_id: proposta_id,
      tipo: 'envio_proposta',
      de_email: FROM_EMAIL,
      para_email: email_cliente,
      assunto: `Proposta Comercial ${proposta.numero_proposta} - Construcom`,
      status: resultado.success ? 'enviado' : 'erro',
      erro_mensagem: resultado.error,
      data_envio: new Date().toISOString()
    })

    if (!resultado.success) {
      return new Response(
        JSON.stringify({ error: resultado.error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email enviado com sucesso' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na Edge Function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// =====================================================
// FUNÇÕES DE ENVIO DE EMAIL
// =====================================================

async function enviarViaResend({ to, subject, html, pdfBase64, pdfNome }) {
  try {
    const attachments = pdfBase64 ? [{
      filename: pdfNome,
      content: pdfBase64
    }] : []

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html,
        attachments
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, error: errorData.message || 'Erro no Resend' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function enviarViaSendGrid({ to, subject, html, pdfBase64, pdfNome }) {
  try {
    const attachments = pdfBase64 ? [{
      content: pdfBase64,
      filename: pdfNome,
      type: 'application/pdf',
      disposition: 'attachment'
    }] : []

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL, name: FROM_NAME },
        subject,
        content: [{ type: 'text/html', value: html }],
        attachments
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      return { success: false, error: errorText }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function enviarViaSMTP({ to, subject, html, pdfBase64, pdfNome }) {
  // Para SMTP (Locaweb), precisamos usar uma biblioteca diferente
  // Uma opção é usar nodemailer via Deno
  // Por enquanto, retornar erro sugerindo usar Resend ou SendGrid
  return { 
    success: false, 
    error: 'SMTP não implementado na Edge Function. Use Resend ou SendGrid.' 
  }
}

// =====================================================
// TEMPLATE DE EMAIL
// =====================================================

function gerarTemplateEmail({
  numeroProposta,
  nomeCliente,
  valorTotal,
  dataValidade,
  vendedorNome,
  vendedorTelefone,
  linkAceite,
  mensagemPersonalizada
}) {
  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  const formatarData = (data) => {
    if (!data) return ''
    return new Date(data).toLocaleDateString('pt-BR')
  }

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proposta Comercial ${numeroProposta}</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #f1f5f9;
  line-height: 1.6;
">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        ">
          
          <!-- Header -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #4c7f8a 0%, #3d6570 100%);
              padding: 30px 40px;
              text-align: center;
            ">
              <h1 style="
                color: #ffffff;
                font-size: 24px;
                margin: 0 0 8px 0;
                font-weight: 700;
              ">CONSTRUCOM</h1>
              <p style="
                color: rgba(255,255,255,0.9);
                font-size: 12px;
                margin: 0;
                letter-spacing: 1px;
              ">ARTEFATOS DE CIMENTO</p>
            </td>
          </tr>
          
          <!-- Saudação -->
          <tr>
            <td style="padding: 40px 40px 20px 40px;">
              <h2 style="
                color: #1e293b;
                font-size: 20px;
                margin: 0 0 16px 0;
              ">Olá, ${nomeCliente}!</h2>
              
              ${mensagemPersonalizada ? `
              <p style="color: #475569; margin: 0 0 20px 0; font-size: 15px;">
                ${mensagemPersonalizada}
              </p>
              ` : ''}
              
              <p style="color: #475569; margin: 0; font-size: 15px;">
                Segue sua <strong>Proposta Comercial</strong> conforme solicitado.
                Você pode visualizar todos os detalhes clicando no botão abaixo.
              </p>
            </td>
          </tr>
          
          <!-- Card da Proposta -->
          <tr>
            <td style="padding: 0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background-color: #f8fafc;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
              ">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <p style="
                            color: #64748b;
                            font-size: 12px;
                            margin: 0 0 4px 0;
                            text-transform: uppercase;
                          ">Proposta Nº</p>
                          <p style="
                            color: #f6ad55;
                            font-size: 22px;
                            font-weight: 700;
                            margin: 0;
                          ">${numeroProposta}</p>
                        </td>
                        <td style="text-align: right;">
                          <p style="
                            color: #64748b;
                            font-size: 12px;
                            margin: 0 0 4px 0;
                            text-transform: uppercase;
                          ">Valor Total</p>
                          <p style="
                            color: #059669;
                            font-size: 24px;
                            font-weight: 700;
                            margin: 0;
                          ">${formatarMoeda(valorTotal)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 24px 24px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="
                      background-color: #fef3c7;
                      border-radius: 8px;
                      padding: 12px 16px;
                    ">
                      <tr>
                        <td>
                          <p style="
                            color: #92400e;
                            font-size: 13px;
                            margin: 0;
                          ">
                            ⏰ <strong>Válida até ${formatarData(dataValidade)}</strong>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Botão CTA -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <a href="${linkAceite}" style="
                display: inline-block;
                background: linear-gradient(135deg, #4c7f8a 0%, #3d6570 100%);
                color: #ffffff;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                box-shadow: 0 4px 14px rgba(76, 127, 138, 0.4);
              ">
                📋 Ver Proposta e Aceitar
              </a>
              <p style="
                color: #94a3b8;
                font-size: 12px;
                margin: 16px 0 0 0;
              ">
                ou copie este link: <br>
                <a href="${linkAceite}" style="color: #4c7f8a; word-break: break-all;">
                  ${linkAceite}
                </a>
              </p>
            </td>
          </tr>
          
          <!-- Info sobre anexo -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background-color: #ecfdf5;
                border-radius: 8px;
                border: 1px solid #a7f3d0;
              ">
                <tr>
                  <td style="padding: 16px;">
                    <p style="
                      color: #065f46;
                      font-size: 14px;
                      margin: 0;
                    ">
                      📎 <strong>PDF em anexo:</strong> A proposta completa também está anexada neste email para sua conveniência.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Contato do Vendedor -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <p style="
                color: #64748b;
                font-size: 14px;
                margin: 0 0 8px 0;
              ">Dúvidas? Fale diretamente com seu vendedor:</p>
              <p style="
                color: #1e293b;
                font-size: 15px;
                margin: 0;
              ">
                <strong>${vendedorNome}</strong><br>
                📞 ${vendedorTelefone}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="
              background-color: #f1f5f9;
              padding: 24px 40px;
              text-align: center;
            ">
              <p style="
                color: #64748b;
                font-size: 12px;
                margin: 0 0 8px 0;
              ">
                <strong>Construcom Artefatos de Cimento</strong><br>
                Pedro Leopoldo - MG
              </p>
              <p style="
                color: #94a3b8;
                font-size: 11px;
                margin: 0;
              ">
                Este email foi enviado automaticamente. Por favor, não responda diretamente.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
