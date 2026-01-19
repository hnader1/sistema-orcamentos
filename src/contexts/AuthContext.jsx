import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    checkUser()
  }, [])

  const checkUser = () => {
  try {
    const savedUser = localStorage.getItem('user')
    const sessionCreated = localStorage.getItem('session_created')
    
    // Session expires after 8 hours
    if (sessionCreated && Date.now() - parseInt(sessionCreated) > 8 * 60 * 60 * 1000) {
      localStorage.removeItem('user')
      localStorage.removeItem('session_created')
      setLoading(false)
      return
    }
    
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  } catch (error) {
    console.error('Erro ao verificar usuário:', error)
    localStorage.removeItem('user')
  } finally {
    setLoading(false)
  }
}

  const login = async (email, senha) => {
    try {
      console.log('🔐 Tentando login:', email)

      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('senha_hash', senha)
        .eq('ativo', true)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar usuário:', error)
        throw new Error('Email ou senha incorretos')
      }

      if (!data) {
        throw new Error('Email ou senha incorretos')
      }

      console.log('✅ Login bem-sucedido:', data.nome)

      // Salvar usuário no estado e localStorage
      const userData = {
        id: data.id,
        email: data.email,
        nome: data.nome,
        telefone: data.telefone,
        tipo: data.tipo
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('session_created', Date.now().toString())

      return { success: true, user: userData }
    } catch (error) {
      console.error('❌ Erro no login:', error)
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    console.log('👋 Fazendo logout')
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAdmin = () => {
    return user?.tipo === 'admin'
  }

  const isVendedor = () => {
    return user?.tipo === 'vendedor'
  }

  const isComercialInterno = () => {
    return user?.tipo === 'comercial_interno'
  }

  const podeAcessarLancamento = () => {
    return user?.tipo === 'admin' || user?.tipo === 'comercial_interno'
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
    isVendedor,
    isComercialInterno,
    podeAcessarLancamento
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
