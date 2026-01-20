# Integração de PDF para Propostas Comerciais

Esta documentação descreve o fluxo completo de geração, armazenamento e envio de PDFs de propostas comerciais.

## Visão Geral do Fluxo

```
OrcamentoForm → PropostaComercial (modal)
                ↓ (clica "Salvar para Envio")
                gerarESalvarPdfProposta()
                ↓
                Supabase Storage (propostas-pdf bucket)
                ↓
                proposta.pdf_path atualizado
                ↓
                Edge Function: enviar-proposta-email
                ↓
                Email enviado (PDF anexo + link)
                ↓
                Cliente acessa /aceite/:token
                ↓
                Visualiza/baixa PDF → Aceita proposta
```

## 1. Configuração Inicial

### 1.1 Instalar Dependência

```bash
npm install html2pdf.js
```

### 1.2 Executar SQL no Supabase

Execute o script `sql/01_setup_pdf_integration.sql` no Supabase SQL Editor.

Este script irá:
- Adicionar campo `pdf_path` na tabela `propostas`
- Criar bucket `propostas-pdf` para os PDFs gerados
- Criar bucket `documentos-propostas` para uploads do cliente
- Configurar políticas de acesso (RLS)
- Criar tabela `log_emails_proposta` para auditoria

### 1.3 Deploy da Edge Function

```bash
supabase functions deploy enviar-proposta-email
```

### 1.4 Configurar Secrets

No Supabase Dashboard > Settings > Edge Functions > Secrets:

```
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=propostas@construcom.com.br
EMAIL_SERVICE=resend
```

Ou use SendGrid:
```
SENDGRID_API_KEY=SG.xxxxx
FROM_EMAIL=propostas@construcom.com.br
EMAIL_SERVICE=sendgrid
```

## 2. Uso dos Componentes

### 2.1 PropostaComercial (Modal)

O componente agora aceita duas novas props:

```jsx
<PropostaComercial
  isOpen={showProposta}
  onClose={() => setShowProposta(false)}
  dadosOrcamento={orcamento}
  produtos={produtos}
  dadosFrete={dadosFrete}
  propostaId={propostaId}          // NOVO: ID da proposta para salvar PDF
  onPdfGerado={(url, path) => {}}  // NOVO: Callback quando PDF é salvo
/>
```

### 2.2 Botões no Modal

1. **Imprimir / Salvar PDF**: Abre janela de impressão do navegador
2. **Salvar para Envio**: Gera PDF, faz upload para Storage e salva referência

### 2.3 Funções Utilitárias

```javascript
import { 
  gerarESalvarPdfProposta,
  gerarPdfBlob,
  obterUrlPdf 
} from '../utils/propostaPdfUtils'

// Gerar, fazer upload e salvar referência
const resultado = await gerarESalvarPdfProposta(
  elementoDOM,
  propostaId,
  numeroProposta
)

if (resultado.sucesso) {
  console.log('PDF URL:', resultado.pdfUrl)
  console.log('PDF Path:', resultado.pdfPath)
}
```

## 3. Envio de Email

### 3.1 Chamar a Edge Function

```javascript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/enviar-proposta-email`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      proposta_id: propostaId,
      email_cliente: 'cliente@email.com',
      link_aceite: `https://seusite.com/aceite/${tokenAceite}`,
      mensagem_personalizada: 'Olá! Segue a proposta...',
      orcamento: dadosOrcamento
    })
  }
)
```

### 3.2 Serviços de Email Suportados

- **Resend** (recomendado): Fácil de configurar, bom para começar
- **SendGrid**: Mais robusto para alto volume
- **SMTP**: Não implementado na Edge Function (usar Resend ou SendGrid)

## 4. Página de Aceite Público

A página `/aceite/:token` já está configurada em `AceiteProposta.jsx`.

### 4.1 Funcionalidades

- Visualização da proposta (carregada do banco)
- Download do PDF (URL assinada)
- Formulário de confirmação de dados
- Upload de documentos (comprovante, contrato social)
- Aceite com LGPD
- Registro de IP e user agent

### 4.2 Download do PDF na Página Pública

Para adicionar o botão de download do PDF, use:

```javascript
import { obterUrlPdf } from '../utils/propostaPdfUtils'

const handleDownloadPdf = async () => {
  if (!proposta?.pdf_path) {
    alert('PDF não disponível')
    return
  }
  
  const url = await obterUrlPdf(proposta.pdf_path, false, 3600) // 1 hora
  if (url) {
    window.open(url, '_blank')
  }
}
```

## 5. Estrutura de Pastas

```
src/
  components/
    PropostaComercial.jsx  # Modal com botão "Salvar para Envio"
  pages/
    AceiteProposta.jsx     # Página pública de aceite
  utils/
    propostaPdfUtils.js    # Funções para gerar/upload PDF
    
supabase/
  functions/
    enviar-proposta-email/
      index.ts             # Edge Function para email
      
sql/
  01_setup_pdf_integration.sql  # Script de setup
```

## 6. Troubleshooting

### PDF não é gerado
- Verifique se `html2pdf.js` está instalado
- Verifique o console do navegador para erros
- Certifique-se que o `propostaId` está sendo passado

### Upload falha
- Verifique se o bucket `propostas-pdf` existe
- Verifique as políticas de acesso do bucket
- Usuário precisa estar autenticado

### Email não é enviado
- Verifique os secrets da Edge Function
- Verifique o domínio do remetente no Resend/SendGrid
- Consulte logs em `log_emails_proposta`

### URL assinada expirada
- URLs assinadas têm validade limitada (padrão: 7 dias)
- Gere uma nova URL quando necessário

## 7. Segurança

- Bucket `propostas-pdf` é privado (não público)
- Acesso via URLs assinadas com expiração
- RLS habilitado em todas as tabelas
- Validação de tipos de arquivo (apenas PDF)
- Limite de tamanho (10MB)
- Registro de IP e user agent no aceite
- Consentimento LGPD obrigatório
