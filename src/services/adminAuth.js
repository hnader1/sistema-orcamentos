// Serviço de Autenticação Admin - Supabase
// Chama Edge Functions que rodam no servidor (seguro!)

import { supabase } from './supabase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * Cria um novo usuário via Edge Function
 * @param {object} dados - Dados do usuário
 * @returns {Promise<{success: boolean, user: object|null, auth_id: string|null, error: string|null}>}
 */
export async function criarUsuarioAuth(dados) {
  try {
    // Pegar token do usuário logado (admin)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      return { success: false, user: null, auth_id: null, error: 'Usuário não autenticado' }
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(dados)
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Erro ao criar usuário:', result)
      return { 
        success: false, 
        user: null, 
        auth_id: null,
        error: result.error || 'Erro ao criar usuário' 
      }
    }

    console.log('✅ Usuário criado com sucesso!')
    return { success: true, user: result.user, auth_id: result.auth_id, error: null }
  } catch (error) {
    console.error('❌ Erro de rede:', error)
    return { success: false, user: null, auth_id: null, error: error.message }
  }
}

/**
 * Reseta a senha de um usuário via Edge Function
 * @param {string} authId - ID do usuário no auth.users
 * @param {string} newPassword - Nova senha
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function atualizarSenhaUsuario(authId, newPassword) {
  try {
    // Pegar token do usuário logado (admin)
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        auth_id: authId,
        new_password: newPassword
      })
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Erro ao resetar senha:', result)
      return { success: false, error: result.error || 'Erro ao resetar senha' }
    }

    console.log('✅ Senha resetada com sucesso!')
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ Erro de rede:', error)
    return { success: false, error: error.message }
  }
}
