// src/utils/numeracaoPropostaUtils.js

import { supabase } from '../services/supabase'

/**
 * Gera o próximo número sequencial de proposta para um vendedor
 * Formato: [CÓDIGO]-[ANO]-[SEQUENCIAL]
 * Exemplo: NP-26-0001, CF-26-0042, MSS-27-0003
 * 
 * @param {string} usuarioId - UUID do usuário/vendedor
 * @param {string} codigoVendedor - Código do vendedor (2 ou 3 letras)
 * @returns {Promise<string>} Número da proposta gerado
 */
export const gerarNumeroProposta = async (usuarioId, codigoVendedor) => {
  try {
    console.log('🔢 [PROPOSTA] Gerando número para:', { usuarioId, codigoVendedor })

    // Validar código do vendedor
    if (!codigoVendedor || codigoVendedor.length < 2 || codigoVendedor.length > 3) {
      throw new Error('Código do vendedor deve ter 2 ou 3 letras')
    }

    // Chamar função do banco de dados
    const { data, error } = await supabase
      .rpc('gerar_numero_proposta', {
        p_usuario_id: usuarioId,
        p_codigo_vendedor: codigoVendedor.toUpperCase()
      })

    if (error) {
      console.error('❌ [PROPOSTA] Erro ao gerar número:', error)
      throw error
    }

    console.log('✅ [PROPOSTA] Número gerado:', data)
    return data

  } catch (error) {
    console.error('❌ [PROPOSTA] Erro fatal:', error)
    throw new Error(`Erro ao gerar número de proposta: ${error.message}`)
  }
}

/**
 * Busca o código do vendedor na tabela de usuários
 * 
 * @param {string} usuarioId - UUID do usuário
 * @returns {Promise<string|null>} Código do vendedor ou null se não encontrado
 */
export const buscarCodigoVendedor = async (usuarioId) => {
  try {
    console.log('🔍 [PROPOSTA] Buscando código do vendedor:', usuarioId)

    const { data, error } = await supabase
      .from('usuarios')
      .select('codigo_vendedor, nome')
      .eq('id', usuarioId)
      .single()

    if (error) throw error

    if (!data?.codigo_vendedor) {
      console.warn('⚠️ [PROPOSTA] Vendedor sem código cadastrado:', data?.nome)
      return null
    }

    console.log('✅ [PROPOSTA] Código encontrado:', data.codigo_vendedor)
    return data.codigo_vendedor

  } catch (error) {
    console.error('❌ [PROPOSTA] Erro ao buscar código:', error)
    return null
  }
}

/**
 * Valida se um código de vendedor é válido
 * 
 * @param {string} codigo - Código a validar
 * @returns {boolean} true se válido, false caso contrário
 */
export const validarCodigoVendedor = (codigo) => {
  if (!codigo) return false
  
  const codigoUpper = codigo.toUpperCase()
  
  // Deve ter 2 ou 3 caracteres
  if (codigoUpper.length < 2 || codigoUpper.length > 3) return false
  
  // Deve conter apenas letras
  if (!/^[A-Z]{2,3}$/.test(codigoUpper)) return false
  
  return true
}

/**
 * Formata um número de proposta (caso precise reformatar)
 * 
 * @param {string} codigoVendedor - Código do vendedor (2-3 letras)
 * @param {number} ano - Ano (2 dígitos)
 * @param {number} sequencial - Número sequencial
 * @returns {string} Número formatado
 */
export const formatarNumeroProposta = (codigoVendedor, ano, sequencial) => {
  const codigo = codigoVendedor.toUpperCase()
  const anoStr = String(ano).padStart(2, '0').slice(-2) // Últimos 2 dígitos
  const seqStr = String(sequencial).padStart(4, '0') // 4 dígitos
  
  return `${codigo}-${anoStr}-${seqStr}`
}

/**
 * Parse de um número de proposta para extrair suas partes
 * 
 * @param {string} numeroProposta - Número da proposta (ex: "NP-26-0001")
 * @returns {Object|null} { codigo, ano, sequencial } ou null se inválido
 */
export const parseNumeroProposta = (numeroProposta) => {
  if (!numeroProposta) return null
  
  const regex = /^([A-Z]{2,3})-(\d{2})-(\d{4})$/
  const match = numeroProposta.match(regex)
  
  if (!match) return null
  
  return {
    codigo: match[1],
    ano: parseInt(match[2], 10),
    sequencial: parseInt(match[3], 10)
  }
}

/**
 * Verifica se um vendedor tem código cadastrado
 * Útil para validar antes de criar orçamento
 * 
 * @param {string} usuarioId - UUID do usuário
 * @returns {Promise<{temCodigo: boolean, codigo: string|null, mensagem: string}>}
 */
export const verificarCodigoVendedor = async (usuarioId) => {
  try {
    const codigo = await buscarCodigoVendedor(usuarioId)
    
    if (!codigo) {
      return {
        temCodigo: false,
        codigo: null,
        mensagem: 'Este vendedor não possui código cadastrado. Solicite ao administrador para cadastrar um código de 2 ou 3 letras.'
      }
    }
    
    return {
      temCodigo: true,
      codigo: codigo,
      mensagem: `Código: ${codigo}`
    }
    
  } catch (error) {
    return {
      temCodigo: false,
      codigo: null,
      mensagem: 'Erro ao verificar código do vendedor'
    }
  }
}