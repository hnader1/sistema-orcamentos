// =====================================================
// UTILITÁRIO PARA GERAÇÃO E UPLOAD DO PDF DA PROPOSTA
// =====================================================
// Este módulo lida com:
// 1. Geração do PDF a partir do HTML da proposta
// 2. Upload do PDF para Supabase Storage
// 3. Obtenção da URL pública/assinada do PDF
// =====================================================

import { supabase } from '../services/supabase'

// Nome do bucket no Supabase Storage
const BUCKET_NAME = 'propostas-pdf'

/**
 * Gera o PDF da proposta usando html2pdf.js
 * @param {HTMLElement} elemento - Elemento DOM contendo a proposta
 * @param {string} numeroProposta - Número da proposta (ex: NH-26-0014)
 * @returns {Promise<Blob>} - Blob do PDF gerado
 */
export const gerarPdfBlob = async (elemento, numeroProposta) => {
  // Importar html2pdf dinamicamente (para evitar problemas com SSR)
  // Se html2pdf não estiver instalado, retorna erro amigável
  let html2pdf
  try {
    html2pdf = (await import('html2pdf.js')).default
  } catch (e) {
    console.error('html2pdf.js não encontrado. Execute: npm install html2pdf.js')
    throw new Error('Biblioteca html2pdf.js não instalada. Execute: npm install html2pdf.js')
  }
  
  const options = {
    margin: [10, 10, 10, 10],
    filename: `Proposta-${numeroProposta}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      logging: false,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' 
    }
  }

  // Gerar como Blob
  const pdfBlob = await html2pdf()
    .set(options)
    .from(elemento)
    .outputPdf('blob')

  return pdfBlob
}

/**
 * Faz upload do PDF para o Supabase Storage
 * @param {Blob} pdfBlob - Blob do PDF
 * @param {string} propostaId - ID da proposta (UUID)
 * @param {string} numeroProposta - Número da proposta para nome do arquivo
 * @returns {Promise<{path: string, error: Error|null}>}
 */
export const uploadPdfParaStorage = async (pdfBlob, propostaId, numeroProposta) => {
  try {
    // Nome do arquivo: propostaId/Proposta-NH-26-0014.pdf
    const nomeArquivo = `${propostaId}/Proposta-${numeroProposta.replace(/\//g, '-')}.pdf`

    // Verificar se já existe e deletar (para atualização)
    const { data: existente } = await supabase.storage
      .from(BUCKET_NAME)
      .list(propostaId)

    if (existente && existente.length > 0) {
      const arquivosParaDeletar = existente.map(f => `${propostaId}/${f.name}`)
      await supabase.storage
        .from(BUCKET_NAME)
        .remove(arquivosParaDeletar)
    }

    // Fazer upload do novo PDF
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(nomeArquivo, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (error) {
      console.error('Erro no upload do PDF:', error)
      return { path: null, error }
    }

    return { path: data.path, error: null }
  } catch (error) {
    console.error('Erro ao fazer upload do PDF:', error)
    return { path: null, error }
  }
}

/**
 * Obtém URL pública ou assinada do PDF
 * @param {string} storagePath - Caminho do arquivo no Storage
 * @param {boolean} publica - Se deve gerar URL pública (true) ou assinada (false)
 * @param {number} expiresIn - Tempo de expiração em segundos (para URL assinada)
 * @returns {Promise<string|null>}
 */
export const obterUrlPdf = async (storagePath, publica = false, expiresIn = 3600) => {
  try {
    if (publica) {
      // URL pública (bucket precisa ser público)
      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(storagePath)
      
      return data?.publicUrl || null
    } else {
      // URL assinada (expira após expiresIn segundos)
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, expiresIn)

      if (error) {
        console.error('Erro ao gerar URL assinada:', error)
        return null
      }

      return data?.signedUrl || null
    }
  } catch (error) {
    console.error('Erro ao obter URL do PDF:', error)
    return null
  }
}

/**
 * Salva o caminho do PDF na proposta
 * @param {string} propostaId - ID da proposta
 * @param {string} pdfPath - Caminho do PDF no storage
 */
export const salvarPdfNaProposta = async (propostaId, pdfPath) => {
  try {
    const { error } = await supabase
      .from('propostas')
      .update({ pdf_path: pdfPath })
      .eq('id', propostaId)

    if (error) {
      console.error('Erro ao salvar path do PDF:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar proposta:', error)
    return false
  }
}

/**
 * Processo completo: Gerar PDF, fazer upload e salvar referência
 * @param {HTMLElement} elemento - Elemento DOM da proposta
 * @param {string} propostaId - ID da proposta
 * @param {string} numeroProposta - Número da proposta
 * @returns {Promise<{sucesso: boolean, pdfUrl: string|null, error: Error|null}>}
 */
export const gerarESalvarPdfProposta = async (elemento, propostaId, numeroProposta) => {
  try {
    console.log('📄 Gerando PDF da proposta...')
    
    // 1. Gerar o PDF como Blob
    const pdfBlob = await gerarPdfBlob(elemento, numeroProposta)
    console.log('✅ PDF gerado com sucesso')

    // 2. Fazer upload para o Storage
    console.log('📤 Fazendo upload para o Storage...')
    const { path, error: uploadError } = await uploadPdfParaStorage(
      pdfBlob, 
      propostaId, 
      numeroProposta
    )

    if (uploadError || !path) {
      throw uploadError || new Error('Falha no upload do PDF')
    }
    console.log('✅ Upload concluído:', path)

    // 3. Salvar referência na proposta
    console.log('💾 Salvando referência no banco...')
    await salvarPdfNaProposta(propostaId, path)

    // 4. Obter URL assinada (válida por 7 dias = 604800 segundos)
    const pdfUrl = await obterUrlPdf(path, false, 604800)
    console.log('✅ PDF processado com sucesso!')

    return { sucesso: true, pdfUrl, pdfPath: path, error: null }
  } catch (error) {
    console.error('❌ Erro no processo de PDF:', error)
    return { sucesso: false, pdfUrl: null, pdfPath: null, error }
  }
}

/**
 * Gera PDF e retorna apenas o Blob (para envio por email)
 * Útil quando se quer o PDF sem fazer upload
 */
export const gerarPdfParaEmail = async (elemento, numeroProposta) => {
  try {
    const pdfBlob = await gerarPdfBlob(elemento, numeroProposta)
    
    // Converter Blob para Base64 (para enviar via API)
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1]
        resolve(base64String)
      }
      reader.onerror = reject
      reader.readAsDataURL(pdfBlob)
    })

    return { blob: pdfBlob, base64, error: null }
  } catch (error) {
    console.error('Erro ao gerar PDF para email:', error)
    return { blob: null, base64: null, error }
  }
}
