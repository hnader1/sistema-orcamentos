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
    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserData(session.user.id)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserData(session.user.id)
      }
    } catch (error) {
      console.error('Erro ao verificar sessao:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async (authId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, nome, telefone, tipo')
        .eq('auth_id', authId)
        .eq('ativo', true)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Erro ao carregar usuario:', error)
      setUser(null)
    }
  }

  const login = async (email, senha) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      })

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Email ou senha incorretos' }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const isAdmin = () => user?.tipo === 'admin'
  const isVendedor = () => user?.tipo === 'vendedor'
  const isComercialInterno = () => user?.tipo === 'comercial_interno'
  const podeAcessarLancamento = () => user?.tipo === 'admin' || user?.tipo === 'comercial_interno'

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin,
      isVendedor,
      isComercialInterno,
      podeAcessarLancamento
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}