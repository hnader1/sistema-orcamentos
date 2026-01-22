// Serviço de Autenticação Admin - Supabase
// Usa a service_role key para operações administrativas

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY

/**
 * Cria um novo usuário no Supabase Auth com email já confirmado
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<{user: object, error: string|null}>}
 */
export async function criarUsuarioAuth(email, password) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email: email,
        password: password,
        email_confirm: true, // Já confirma o email automaticamente!
        user_metadata: {
          created_by_admin: true
        }
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Erro ao criar usuário no Auth:', data)
      return { 
        user: null, 
        error: data.message || data.msg || 'Erro ao criar usuário na autenticação' 
      }
    }

    console.log('✅ Usuário criado no Auth:', data.id)
    return { user: data, error: null }
  } catch (error) {
    console.error('❌ Erro de rede ao criar usuário:', error)
    return { user: null, error: error.message }
  }
}

/**
 * Atualiza a senha de um usuário existente
 * @param {string} authId - ID do usuário no auth.users
 * @param {string} newPassword - Nova senha
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function atualizarSenhaUsuario(authId, newPassword) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        password: newPassword
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Erro ao atualizar senha:', data)
      return { 
        success: false, 
        error: data.message || data.msg || 'Erro ao atualizar senha' 
      }
    }

    console.log('✅ Senha atualizada para usuário:', authId)
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ Erro de rede ao atualizar senha:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Deleta um usuário do Supabase Auth
 * @param {string} authId - ID do usuário no auth.users
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function deletarUsuarioAuth(authId) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    })

    if (!response.ok) {
      const data = await response.json()
      console.error('❌ Erro ao deletar usuário:', data)
      return { 
        success: false, 
        error: data.message || data.msg || 'Erro ao deletar usuário' 
      }
    }

    console.log('✅ Usuário deletado do Auth:', authId)
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ Erro de rede ao deletar usuário:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Busca um usuário pelo email no Supabase Auth
 * @param {string} email - Email do usuário
 * @returns {Promise<{user: object|null, error: string|null}>}
 */
export async function buscarUsuarioPorEmail(email) {
  try {
    // Usar a API de listagem com filtro
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?filter=email.eq.${encodeURIComponent(email)}`, 
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY
        }
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return { user: null, error: data.message || 'Erro ao buscar usuário' }
    }

    // A API retorna um array de usuários
    const usuarios = data.users || data || []
    const usuario = usuarios.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    return { user: usuario || null, error: null }
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error)
    return { user: null, error: error.message }
  }
}

/**
 * Confirma o email de um usuário (caso tenha sido criado sem confirmação)
 * @param {string} authId - ID do usuário no auth.users
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function confirmarEmailUsuario(authId) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email_confirm: true
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao confirmar email' }
    }

    console.log('✅ Email confirmado para usuário:', authId)
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * Atualiza o email de um usuário
 * @param {string} authId - ID do usuário no auth.users
 * @param {string} newEmail - Novo email
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function atualizarEmailUsuario(authId, newEmail) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${authId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify({
        email: newEmail,
        email_confirm: true
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao atualizar email' }
    }

    console.log('✅ Email atualizado para:', newEmail)
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
