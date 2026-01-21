// src/utils/revisaoUtils.js
// =====================================================
// UTILITÁRIOS: Gerenciamento de Revisões de Propostas
// VERSÃO CORRIGIDA - Atualiza numero_proposta diretamente
// =====================================================

import { supabase } from '../services/supabase';

// Campos que devem ser monitorados para criar revisão
const CAMPOS_MONITORADOS = [
  'cliente_nome',
  'cliente_empresa',
  'cliente_email',
  'cliente_telefone',
  'endereco_entrega',
  'observacoes',
  'forma_pagamento_id',
  'prazo_entrega',
  'desconto_geral',
  'validade_dias',
  'frete',
  'frete_cidade',
  'frete_modalidade',
  'frete_tipo_caminhao',
  'frete_qtd_viagens',
  'frete_valor_viagem',
  'obra_cep',
  'obra_cidade',
  'obra_bairro',
  'obra_logradouro',
  'obra_numero',
  'cnpj_cpf'
];

/**
 * Verifica se o orçamento está em um status que requer log de revisão
 * (já foi enviado ou aprovado)
 */
export function requerRevisao(status) {
  const statusQueRequerem = ['enviado', 'aprovado'];
  return statusQueRequerem.includes(status);
}

/**
 * Compara dois objetos e retorna as diferenças
 */
export function detectarAlteracoes(original, atualizado) {
  const alteracoes = {
    campos: {},
    valoresAnteriores: {},
    valoresNovos: {}
  };

  for (const campo of CAMPOS_MONITORADOS) {
    const valorOriginal = original[campo];
    const valorNovo = atualizado[campo];

    // Normalizar valores para comparação
    const normalizado1 = normalizar(valorOriginal);
    const normalizado2 = normalizar(valorNovo);

    if (normalizado1 !== normalizado2) {
      alteracoes.campos[campo] = true;
      alteracoes.valoresAnteriores[campo] = valorOriginal;
      alteracoes.valoresNovos[campo] = valorNovo;
    }
  }

  return alteracoes;
}

/**
 * Normaliza valor para comparação
 */
function normalizar(valor) {
  if (valor === null || valor === undefined || valor === '') return '';
  if (typeof valor === 'number') return String(valor);
  if (typeof valor === 'object') return JSON.stringify(valor);
  return String(valor).trim();
}

/**
 * Formata número da proposta com sufixo de revisão
 */
export function formatarNumeroPropostaComRevisao(numeroBase, revisao) {
  if (!numeroBase) return numeroBase;
  if (!revisao || revisao === 0) return numeroBase;
  
  // Remove revisão anterior se existir
  const numeroLimpo = numeroBase.replace(/ Rev\.\d+$/, '');
  return `${numeroLimpo} Rev.${revisao}`;
}

/**
 * Cria uma nova revisão no banco de dados
 */
export async function criarRevisao({
  orcamentoId,
  propostaId,
  usuarioId,
  usuarioNome,
  dadosOriginais,
  dadosNovos,
  statusAnterior,
  statusNovo,
  motivo = null
}) {
  try {
    // 1. Detectar alterações
    const alteracoes = detectarAlteracoes(dadosOriginais, dadosNovos);
    
    // Se não teve alterações, não criar revisão
    if (Object.keys(alteracoes.campos).length === 0) {
      console.log('Nenhuma alteração detectada, revisão não criada');
      return { sucesso: true, revisaoCriada: false };
    }

    // 2. Buscar dados atuais do orçamento (revisão e numero_proposta)
    const { data: orcamentoAtual, error: erroOrcamento } = await supabase
      .from('orcamentos')
      .select('revisao, numero_proposta')
      .eq('id', orcamentoId)
      .single();

    if (erroOrcamento) throw erroOrcamento;

    const revisaoAtual = orcamentoAtual?.revisao || 0;
    const numeroPropostaAtual = orcamentoAtual?.numero_proposta || '';
    const proximaRevisao = revisaoAtual + 1;

    // 3. Calcular novo número da proposta com Rev.X
    const novoNumeroProposta = formatarNumeroPropostaComRevisao(numeroPropostaAtual, proximaRevisao);

    console.log(`📝 Criando revisão ${proximaRevisao}: ${numeroPropostaAtual} → ${novoNumeroProposta}`);

    // 4. Inserir registro de revisão
    const { data: revisao, error: erroRevisao } = await supabase
      .from('propostas_revisoes')
      .insert({
        orcamento_id: orcamentoId,
        proposta_id: propostaId,
        numero_revisao: proximaRevisao,
        editado_por_id: usuarioId,
        editado_por_nome: usuarioNome,
        editado_em: new Date().toISOString(),
        campos_alterados: alteracoes.campos,
        valores_anteriores: alteracoes.valoresAnteriores,
        valores_novos: alteracoes.valoresNovos,
        status_anterior: statusAnterior,
        status_novo: statusNovo,
        motivo: motivo
      })
      .select()
      .single();

    if (erroRevisao) {
      console.warn('Aviso: Erro ao inserir revisão (tabela pode não existir):', erroRevisao);
      // Continua mesmo se a tabela não existir
    }

    // 5. Atualizar orçamento com nova revisão E novo numero_proposta
    const { error: erroUpdateOrcamento } = await supabase
      .from('orcamentos')
      .update({
        revisao: proximaRevisao,
        numero_proposta: novoNumeroProposta
      })
      .eq('id', orcamentoId);

    if (erroUpdateOrcamento) {
      console.error('Erro ao atualizar orçamento com revisão:', erroUpdateOrcamento);
      throw erroUpdateOrcamento;
    }

    console.log(`✅ Revisão ${proximaRevisao} criada com sucesso. Novo número: ${novoNumeroProposta}`);
    
    return {
      sucesso: true,
      revisaoCriada: true,
      numeroRevisao: proximaRevisao,
      novoNumeroProposta: novoNumeroProposta,
      revisao: revisao
    };

  } catch (error) {
    console.error('❌ Erro ao criar revisão:', error);
    return {
      sucesso: false,
      erro: error.message
    };
  }
}

/**
 * Busca o número da revisão atual de um orçamento
 */
export async function buscarRevisaoAtual(orcamentoId) {
  try {
    const { data, error } = await supabase
      .from('orcamentos')
      .select('revisao, numero_proposta')
      .eq('id', orcamentoId)
      .single();

    if (error) throw error;
    
    return {
      revisao: data?.revisao || 0,
      numeroProposta: data?.numero_proposta
    };
  } catch (error) {
    console.error('Erro ao buscar revisão atual:', error);
    return { revisao: 0, numeroProposta: null };
  }
}

/**
 * Verifica se precisa excluir PDF existente antes de permitir edição
 */
export async function verificarPDFExistente(orcamentoId) {
  try {
    const { data, error } = await supabase
      .from('propostas')
      .select('id, pdf_path')
      .eq('orcamento_id', orcamentoId)
      .not('pdf_path', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    return {
      temPDF: data && data.length > 0 && data[0].pdf_path,
      propostaId: data?.[0]?.id,
      pdfPath: data?.[0]?.pdf_path
    };
  } catch (error) {
    console.error('Erro ao verificar PDF existente:', error);
    return { temPDF: false };
  }
}

/**
 * Exclui PDF e prepara orçamento para nova edição
 * AGORA INCREMENTA A REVISÃO IMEDIATAMENTE
 */
export async function prepararEdicaoComRevisao({
  orcamentoId,
  propostaId,
  pdfPath,
  usuarioId,
  usuarioNome,
  motivo
}) {
  try {
    // 1. Buscar dados atuais do orçamento
    const { data: orcamentoAtual, error: erroOrcamento } = await supabase
      .from('orcamentos')
      .select('revisao, numero_proposta')
      .eq('id', orcamentoId)
      .single();

    if (erroOrcamento) throw erroOrcamento;

    const revisaoAtual = orcamentoAtual?.revisao || 0;
    const numeroPropostaAtual = orcamentoAtual?.numero_proposta || '';
    const proximaRevisao = revisaoAtual + 1;

    // 2. Calcular novo número da proposta com Rev.X
    const novoNumeroProposta = formatarNumeroPropostaComRevisao(numeroPropostaAtual, proximaRevisao);

    console.log(`🔄 Preparando edição: Rev.${revisaoAtual} → Rev.${proximaRevisao}`);
    console.log(`📝 Número: ${numeroPropostaAtual} → ${novoNumeroProposta}`);

    // 3. Guardar referência do PDF antigo no histórico (se existir)
    if (pdfPath && propostaId) {
      try {
        const { data: proposta } = await supabase
          .from('propostas')
          .select('pdf_path_historico')
          .eq('id', propostaId)
          .single();

        const historico = proposta?.pdf_path_historico || [];
        historico.push({
          path: pdfPath,
          excluido_em: new Date().toISOString(),
          excluido_por: usuarioNome,
          revisao: revisaoAtual
        });

        // Limpar PDF atual e guardar no histórico
        await supabase
          .from('propostas')
          .update({
            pdf_path: null,
            pdf_path_historico: historico
          })
          .eq('id', propostaId);

        // Excluir arquivo do storage
        await supabase.storage
          .from('propostas-pdf')
          .remove([pdfPath]);

        console.log('✅ PDF antigo excluído e arquivado');
      } catch (e) {
        console.warn('Aviso ao processar PDF antigo:', e);
      }
    }

    // 4. ATUALIZAR ORÇAMENTO COM NOVA REVISÃO E NÚMERO
    const { error: erroUpdate } = await supabase
      .from('orcamentos')
      .update({
        revisao: proximaRevisao,
        numero_proposta: novoNumeroProposta
      })
      .eq('id', orcamentoId);

    if (erroUpdate) throw erroUpdate;

    // 5. Registrar início da revisão (opcional - se tabela existir)
    try {
      await supabase
        .from('propostas_revisoes')
        .insert({
          orcamento_id: orcamentoId,
          proposta_id: propostaId,
          numero_revisao: proximaRevisao,
          editado_por_id: usuarioId,
          editado_por_nome: usuarioNome,
          editado_em: new Date().toISOString(),
          campos_alterados: { _inicio_revisao: true },
          valores_anteriores: { numero_proposta: numeroPropostaAtual },
          valores_novos: { numero_proposta: novoNumeroProposta },
          motivo: motivo || 'Edição solicitada após envio',
          status_anterior: null,
          status_novo: null
        });
    } catch (e) {
      console.warn('Aviso: Não foi possível registrar revisão (tabela pode não existir):', e);
    }

    console.log(`✅ Edição preparada! Nova revisão: ${proximaRevisao}, Novo número: ${novoNumeroProposta}`);

    return { 
      sucesso: true,
      novaRevisao: proximaRevisao,
      novoNumeroProposta: novoNumeroProposta
    };

  } catch (error) {
    console.error('Erro ao preparar edição com revisão:', error);
    return { sucesso: false, erro: error.message };
  }
}