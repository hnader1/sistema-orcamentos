// src/utils/concorrenciaUtils.js
// Última atualização: 15/01/2026 13:15 - Fix verificação concorrência

import { supabase } from '../services/supabase';

/**
 * Verifica se existe concorrência interna para um orçamento
 * @param {object} dadosOrcamento - Dados do orçamento (cnpj_cpf, obra_cidade, obra_bairro)
 * @param {string} vendedorAtualId - ID do vendedor que está criando o orçamento
 * @param {string} orcamentoIdAtual - ID do orçamento atual (para edição, opcional)
 * @returns {object} Resultado da verificação
 */
export const verificarConcorrenciaInterna = async (
  dadosOrcamento, 
  vendedorAtualId,
  orcamentoIdAtual = null
) => {
  try {
    const conflitos = [];
    const data180DiasAtras = new Date();
    data180DiasAtras.setDate(data180DiasAtras.getDate() - 180);

    // 1. VERIFICAÇÃO CRÍTICA: Mesmo CNPJ/CPF
    if (dadosOrcamento.cnpj_cpf && !dadosOrcamento.cnpj_cpf_nao_informado) {
      console.log('🔍 Verificando CNPJ/CPF:', dadosOrcamento.cnpj_cpf);
      
      let queryCNPJ = supabase
        .from('orcamentos')
        .select(`
          id,
          numero,
          cliente_nome,
          cnpj_cpf,
          obra_cidade,
          obra_bairro,
          status,
          total,
          created_at,
          usuario_id,
          usuarios!inner(nome)
        `)
        .eq('cnpj_cpf', dadosOrcamento.cnpj_cpf)
        .neq('usuario_id', vendedorAtualId)
        .gte('created_at', data180DiasAtras.toISOString())
        .in('status', ['rascunho', 'enviado', 'aprovado']);

      // Se estiver editando, ignora o próprio orçamento
      if (orcamentoIdAtual) {
        queryCNPJ = queryCNPJ.neq('id', orcamentoIdAtual);
      }

      const { data: conflitosCNPJ, error: erroCNPJ } = await queryCNPJ;

      if (erroCNPJ) {
        console.error('❌ Erro ao verificar CNPJ/CPF:', erroCNPJ);
      } else {
        console.log('✅ Query CNPJ executada. Resultados:', conflitosCNPJ?.length || 0);
      }

      if (conflitosCNPJ && conflitosCNPJ.length > 0) {
        conflitos.push({
          tipo: 'CRITICO',
          nivel: '🔴',
          titulo: 'CONCORRÊNCIA CRÍTICA - Mesmo CNPJ/CPF',
          mensagem: `Este cliente (CNPJ/CPF: ${dadosOrcamento.cnpj_cpf}) já possui ${conflitosCNPJ.length} orçamento(s) ativo(s) com outro(s) vendedor(es).`,
          orcamentos: conflitosCNPJ.map(orc => ({
            ...orc,
            numero_orcamento: orc.numero,
            valor_total: orc.total,
            vendedores: orc.usuarios
          })),
          prioridade: 1
        });
      }
    }

    // 2. VERIFICAÇÃO ATENÇÃO: Mesma Localização (Cidade + Bairro)
    if (dadosOrcamento.obra_cidade && dadosOrcamento.obra_bairro) {
      console.log('📍 Verificando localização:', dadosOrcamento.obra_cidade, '-', dadosOrcamento.obra_bairro);
      
      let queryLocal = supabase
        .from('orcamentos')
        .select(`
          id,
          numero,
          cliente_nome,
          cnpj_cpf,
          obra_cidade,
          obra_bairro,
          obra_logradouro,
          status,
          total,
          created_at,
          usuario_id,
          usuarios!inner(nome)
        `)
        .eq('obra_cidade', dadosOrcamento.obra_cidade)
        .eq('obra_bairro', dadosOrcamento.obra_bairro)
        .neq('usuario_id', vendedorAtualId)
        .gte('created_at', data180DiasAtras.toISOString())
        .in('status', ['rascunho', 'enviado', 'aprovado']);

      // Se estiver editando, ignora o próprio orçamento
      if (orcamentoIdAtual) {
        queryLocal = queryLocal.neq('id', orcamentoIdAtual);
      }

      // Exclui orçamentos que já foram detectados na verificação de CNPJ/CPF
      const idsJaDetectados = conflitos.flatMap(c => c.orcamentos.map(o => o.id));
      if (idsJaDetectados.length > 0) {
        queryLocal = queryLocal.not('id', 'in', `(${idsJaDetectados.join(',')})`);
      }

      const { data: conflitosLocal, error: erroLocal } = await queryLocal;

      if (erroLocal) {
        console.error('❌ Erro ao verificar localização:', erroLocal);
      } else {
        console.log('✅ Query localização executada. Resultados:', conflitosLocal?.length || 0);
      }

      if (conflitosLocal && conflitosLocal.length > 0) {
        conflitos.push({
          tipo: 'ATENCAO',
          nivel: '🟡',
          titulo: 'ATENÇÃO - Mesma Localização',
          mensagem: `Encontrado(s) ${conflitosLocal.length} orçamento(s) para o mesmo local (${dadosOrcamento.obra_cidade} - ${dadosOrcamento.obra_bairro}) com outro(s) vendedor(es).`,
          detalhes: 'Pode ser a mesma obra com cliente diferente (obra por administração).',
          orcamentos: conflitosLocal.map(orc => ({
            ...orc,
            numero_orcamento: orc.numero,
            valor_total: orc.total,
            vendedores: orc.usuarios
          })),
          prioridade: 2
        });
      }
    }

    // Ordena conflitos por prioridade (críticos primeiro)
    conflitos.sort((a, b) => a.prioridade - b.prioridade);

    const resultado = {
      temConflito: conflitos.length > 0,
      conflitos: conflitos,
      totalConflitos: conflitos.reduce((acc, c) => acc + c.orcamentos.length, 0)
    };

    console.log('🎯 Resultado da verificação:', resultado);
    return resultado;

  } catch (error) {
    console.error('❌ Erro ao verificar concorrência:', error);
    return {
      temConflito: false,
      conflitos: [],
      erro: 'Erro ao verificar concorrência. Tente novamente.'
    };
  }
};

/**
 * Formata CNPJ/CPF para exibição
 */
export const formatarCNPJCPFExibicao = (cnpjCpf) => {
  if (!cnpjCpf) return 'Não informado';
  
  const apenasNumeros = cnpjCpf.replace(/\D/g, '');
  
  if (apenasNumeros.length === 11) {
    // CPF: 000.000.000-00
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (apenasNumeros.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return cnpjCpf;
};

/**
 * Formata data para exibição
 */
export const formatarDataExibicao = (dataISO) => {
  if (!dataISO) return '-';
  
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formata valor monetário para exibição
 */
export const formatarValorExibicao = (valor) => {
  if (!valor) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};