// src/utils/cepUtils.js

import { supabase } from '../services/supabase';

/**
 * Busca CEP na API e atualiza banco de dados
 * SEMPRE salva no cache (qualquer estado)
 * SÓ permite usar em orçamentos se for MG
 * @param {string} cep - CEP no formato 00000-000 ou 00000000
 * @returns {object} Dados do endereço ou erro
 */
export const buscarCEP = async (cep) => {
  try {
    // Remove formatação
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      return { 
        sucesso: false, 
        erro: 'CEP inválido. Use o formato: 00000-000' 
      };
    }

    // 1. Verifica se já existe no cache
    const { data: cacheExistente, error: errCache } = await supabase
      .from('enderecos_cache')
      .select('*')
      .eq('cep', cepLimpo)
      .single();

    if (cacheExistente) {
      console.log('✅ CEP encontrado no cache');
      
      // Incrementa contador de uso
      await supabase
        .from('enderecos_cache')
        .update({ uso_count: cacheExistente.uso_count + 1 })
        .eq('id', cacheExistente.id);

      // Valida se é MG (mesmo que esteja no cache)
      if (cacheExistente.estado !== 'MG') {
        return {
          sucesso: false,
          erro: `CEP de ${cacheExistente.cidade}/${cacheExistente.estado}. Sistema aceita apenas Minas Gerais para orçamentos.`,
          dados: cacheExistente
        };
      }

      return {
        sucesso: true,
        dados: {
          cep: cacheExistente.cep,
          cidade: cacheExistente.cidade,
          bairro: cacheExistente.bairro,
          logradouro: cacheExistente.logradouro,
          estado: cacheExistente.estado,
          validado: true,
          fonte: 'cache'
        }
      };
    }

    // 2. Busca na API ViaCEP
    console.log('🔍 Buscando CEP na API ViaCEP...');
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao consultar API ViaCEP');
    }

    const dadosAPI = await response.json();

    if (dadosAPI.erro) {
      return {
        sucesso: false,
        erro: 'CEP não encontrado'
      };
    }

    // 3. SEMPRE adiciona ao cache (qualquer estado!)
    console.log('💾 Salvando endereço no cache (qualquer estado)...');
    const { error: erroCache } = await supabase
      .from('enderecos_cache')
      .insert({
        cep: cepLimpo,
        cidade: dadosAPI.localidade,
        bairro: dadosAPI.bairro || null,
        logradouro: dadosAPI.logradouro || null,
        estado: dadosAPI.uf, // ← Qualquer estado!
        validado_api: true,
        fonte: 'viacep',
        uso_count: 1
      });

    if (erroCache) {
      console.error('Erro ao salvar no cache:', erroCache);
    }

    // 4. Adiciona cidade ao banco cidades_mg (SÓ se for MG)
    if (dadosAPI.uf === 'MG') {
      const { data: cidadeExistente } = await supabase
        .from('cidades_mg')
        .select('*')
        .eq('nome', dadosAPI.localidade)
        .eq('estado', 'MG')
        .single();

      if (!cidadeExistente) {
        console.log('➕ Adicionando nova cidade MG ao banco:', dadosAPI.localidade);
        
        const { error: erroCidade } = await supabase
          .from('cidades_mg')
          .insert({
            nome: dadosAPI.localidade,
            estado: 'MG',
            codigo_ibge: dadosAPI.ibge,
            adicionado_via: 'api_cep'
          });

        if (erroCidade) {
          console.error('Erro ao adicionar cidade MG:', erroCidade);
        }
      }
    }

    // 5. Valida se pode usar no orçamento (SÓ MG)
    if (dadosAPI.uf !== 'MG') {
      return {
        sucesso: false,
        erro: `CEP de ${dadosAPI.localidade}/${dadosAPI.uf}. Sistema aceita apenas Minas Gerais para orçamentos.`,
        dados: {
          cep: cepLimpo,
          cidade: dadosAPI.localidade,
          bairro: dadosAPI.bairro || '',
          logradouro: dadosAPI.logradouro || '',
          estado: dadosAPI.uf
        }
      };
    }

    // 6. Retorna sucesso (só chega aqui se for MG)
    return {
      sucesso: true,
      dados: {
        cep: cepLimpo,
        cidade: dadosAPI.localidade,
        bairro: dadosAPI.bairro || '',
        logradouro: dadosAPI.logradouro || '',
        estado: dadosAPI.uf,
        validado: true,
        fonte: 'viacep'
      }
    };

  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return {
      sucesso: false,
      erro: 'Erro ao buscar CEP. Tente novamente.'
    };
  }
};

/**
 * Formata CEP para exibição
 */
export const formatarCEP = (cep) => {
  const limpo = cep.replace(/\D/g, '');
  if (limpo.length === 8) {
    return `${limpo.substring(0, 5)}-${limpo.substring(5)}`;
  }
  return limpo;
};

/**
 * Busca cidades de MG do banco
 */
export const buscarCidadesMG = async (termoBusca = '') => {
  try {
    let query = supabase
      .from('cidades_mg')
      .select('nome, estado')
      .eq('estado', 'MG') // ← Só MG
      .order('nome');

    if (termoBusca) {
      query = query.ilike('nome', `%${termoBusca}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    return [];
  }
};

/**
 * Busca bairros de uma cidade específica
 */
export const buscarBairrosPorCidade = async (cidade, termoBusca = '') => {
  try {
    let query = supabase
      .from('enderecos_cache')
      .select('bairro')
      .eq('cidade', cidade)
      .eq('estado', 'MG') // ← Só bairros de MG
      .not('bairro', 'is', null)
      .order('bairro');

    if (termoBusca) {
      query = query.ilike('bairro', `%${termoBusca}%`);
    }

    const { data, error } = await query.limit(30);

    if (error) throw error;

    // Remove duplicatas
    const bairrosUnicos = [...new Set(data.map(item => item.bairro))];
    
    return bairrosUnicos;
  } catch (error) {
    console.error('Erro ao buscar bairros:', error);
    return [];
  }
};