// src/utils/revisaoUtils.js
// =====================================================
// UTILITÁRIOS: Gerenciamento de Revisões de Propostas
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

    // 2. Buscar próximo número de revisão
    const { data: ultimaRevisao } = await supabase
      .from('propostas_revisoes')
      .select('numero_revisao')
      .eq('orcamento_id', orcamentoId)
      .order('numero_revisao', { ascending: false })
      .limit(1);

    const proximaRevisao = (ultimaRevisao?.[0]?.numero_revisao || 0) + 1;

    // 3. Inserir registro de revisão
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

    if (erroRevisao) throw erroRevisao;

    // 4. Atualizar número de revisão no orçamento
    const { error: erroOrcamento } = await supabase
      .from('orcamentos')
      .update({
        revisao: proximaRevisao,
        historico_revisoes: supabase.sql`
          COALESCE(historico_revisoes, '[]'::jsonb) || 
          ${JSON.stringify([{
            rev: proximaRevisao,
            data: new Date().toISOString(),
            por: usuarioNome,
            campos: Object.keys(alteracoes.campos).length
          }])}::jsonb
        `
      })
      .eq('id', orcamentoId);

    if (erroOrcamento) {
      console.warn('Aviso: Não foi possível atualizar historico_revisoes no orçamento:', erroOrcamento);
      // Tentar update simples
      await supabase
        .from('orcamentos')
        .update({ revisao: proximaRevisao })
        .eq('id', orcamentoId);
    }

    console.log(`✅ Revisão ${proximaRevisao} criada com sucesso`);
    
    return {
      sucesso: true,
      revisaoCriada: true,
      numeroRevisao: proximaRevisao,
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
 * Exclui PDF e prepara orçamento para nova edição (cria revisão)
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
    // 1. Guardar referência do PDF antigo no histórico
    if (pdfPath) {
      const { data: proposta } = await supabase
        .from('propostas')
        .select('pdf_path_historico')
        .eq('id', propostaId)
        .single();

      const historico = proposta?.pdf_path_historico || [];
      historico.push({
        path: pdfPath,
        excluido_em: new Date().toISOString(),
        excluido_por: usuarioNome
      });

      // 2. Limpar PDF atual e guardar no histórico
      await supabase
        .from('propostas')
        .update({
          pdf_path: null,
          pdf_path_historico: historico
        })
        .eq('id', propostaId);

      // 3. Excluir arquivo do storage
      await supabase.storage
        .from('propostas-pdf')
        .remove([pdfPath]);
    }

    // 4. Criar registro de início de revisão
    await supabase
      .from('propostas_revisoes')
      .insert({
        orcamento_id: orcamentoId,
        proposta_id: propostaId,
        numero_revisao: 0, // Será atualizado ao salvar
        editado_por_id: usuarioId,
        editado_por_nome: usuarioNome,
        editado_em: new Date().toISOString(),
        campos_alterados: { _inicio_revisao: true },
        valores_anteriores: {},
        valores_novos: {},
        motivo: motivo || 'Edição solicitada após envio'
      });

    return { sucesso: true };

  } catch (error) {
    console.error('Erro ao preparar edição com revisão:', error);
    return { sucesso: false, erro: error.message };
  }
}

/**
 * Atualiza número da proposta com sufixo de revisão
 */
export function formatarNumeroPropostaComRevisao(numeroBase, revisao) {
  if (!revisao || revisao === 0) return numeroBase;
  
  // Remove revisão anterior se existir
  const numeroLimpo = numeroBase.replace(/ Rev\.\d+$/, '');
  return `${numeroLimpo} Rev.${revisao}`;
}
