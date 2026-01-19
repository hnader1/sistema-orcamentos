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
    let mounted = true

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && mounted) {
          const { data } = await supabase
            .from('usuarios')
            .select('id, email, nome, telefone, tipo')
            .eq('auth_id', session.user.id)
            .eq('ativo', true)
            .single()
          
          if (mounted) setUser(data)
        }
      } catch (error) {
        console.error('Init error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && mounted) {
          const { data } = await supabase
            .from('usuarios')
            .select('id, email, nome, telefone, tipo')
            .eq('auth_id', session.user.id)
            .eq('ativo', true)
            .single()
          
          if (mounted) setUser(data)
        } else if (mounted) {
          setUser(null)
        }
        if (mounted) setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

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
export default AuthProvider