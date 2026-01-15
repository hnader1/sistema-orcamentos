// src/utils/concorrenciaUtils.js
// VERSÃO COM LOGS DETALHADOS PARA DEBUG

import { supabase } from '../services/supabase';

export const verificarConcorrenciaInterna = async (
  dadosOrcamento, 
  vendedorAtualId,
  orcamentoIdAtual = null
) => {
  console.log('🔵 [INICIO] verificarConcorrenciaInterna chamada');
  console.log('📥 Dados recebidos:', { dadosOrcamento, vendedorAtualId, orcamentoIdAtual });
  
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

      if (orcamentoIdAtual) {
        queryCNPJ = queryCNPJ.neq('id', orcamentoIdAtual);
      }

      console.log('📤 Executando query CNPJ...');
      const { data: conflitosCNPJ, error: erroCNPJ } = await queryCNPJ;

      console.log('📥 Resposta da query CNPJ:', { 
        sucesso: !erroCNPJ, 
        erro: erroCNPJ, 
        resultados: conflitosCNPJ?.length || 0,
        dados: conflitosCNPJ
      });

      if (erroCNPJ) {
        console.error('❌ Erro ao verificar CNPJ/CPF:', erroCNPJ);
        console.error('❌ Detalhes do erro:', JSON.stringify(erroCNPJ, null, 2));
      } else {
        console.log('✅ Query CNPJ executada. Resultados:', conflitosCNPJ?.length || 0);
      }

      if (conflitosCNPJ && conflitosCNPJ.length > 0) {
        console.log('⚠️ CONFLITOS ENCONTRADOS POR CNPJ:', conflitosCNPJ);
        
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
    } else {
      console.log('⏭️ Pulando verificação de CNPJ (não informado ou checkbox marcado)');
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

      if (orcamentoIdAtual) {
        queryLocal = queryLocal.neq('id', orcamentoIdAtual);
      }

      const idsJaDetectados = conflitos.flatMap(c => c.orcamentos.map(o => o.id));
      if (idsJaDetectados.length > 0) {
        queryLocal = queryLocal.not('id', 'in', `(${idsJaDetectados.join(',')})`);
      }

      console.log('📤 Executando query localização...');
      const { data: conflitosLocal, error: erroLocal } = await queryLocal;

      console.log('📥 Resposta da query localização:', {
        sucesso: !erroLocal,
        erro: erroLocal,
        resultados: conflitosLocal?.length || 0,
        dados: conflitosLocal
      });

      if (erroLocal) {
        console.error('❌ Erro ao verificar localização:', erroLocal);
      } else {
        console.log('✅ Query localização executada. Resultados:', conflitosLocal?.length || 0);
      }

      if (conflitosLocal && conflitosLocal.length > 0) {
        console.log('⚠️ CONFLITOS ENCONTRADOS POR LOCALIZAÇÃO:', conflitosLocal);
        
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
    } else {
      console.log('⏭️ Pulando verificação de localização (cidade ou bairro não informados)');
    }

    conflitos.sort((a, b) => a.prioridade - b.prioridade);

    const resultado = {
      temConflito: conflitos.length > 0,
      conflitos: conflitos,
      totalConflitos: conflitos.reduce((acc, c) => acc + c.orcamentos.length, 0)
    };

    console.log('🎯 [FIM] Resultado da verificação:', resultado);
    
    if (resultado.temConflito) {
      console.log('⚠️⚠️⚠️ CONFLITOS DETECTADOS:', resultado.totalConflitos);
    } else {
      console.log('✅✅✅ Nenhum conflito detectado');
    }
    
    return resultado;

  } catch (error) {
    console.error('❌❌❌ ERRO FATAL ao verificar concorrência:', error);
    console.error('Stack trace:', error.stack);
    return {
      temConflito: false,
      conflitos: [],
      erro: 'Erro ao verificar concorrência. Tente novamente.'
    };
  }
};

export const formatarCNPJCPFExibicao = (cnpjCpf) => {
  if (!cnpjCpf) return 'Não informado';
  const apenasNumeros = cnpjCpf.replace(/\D/g, '');
  if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (apenasNumeros.length === 14) {
    return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return cnpjCpf;
};

export const formatarDataExibicao = (dataISO) => {
  if (!dataISO) return '-';
  const data = new Date(dataISO);
  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatarValorExibicao = (valor) => {
  if (!valor) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};