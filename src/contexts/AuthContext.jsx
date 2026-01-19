import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async (authId) => {
    try {
      const { data } = await supabase
        .from('usuarios')
        .select('id, email, nome, telefone, tipo')
        .eq('auth_id', authId)
        .eq('ativo', true)
        .single()
      return data
    } catch (e) {
      return null
    }
  }

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && isMounted) {
          const userData = await loadUser(session.user.id)
          if (isMounted) setUser(userData)
        }
      } catch (e) {
        // Ignore errors, just show login
      }
      if (isMounted) setLoading(false)
    }

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false)
      }
    }, 3000)

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        if (session?.user) {
          const userData = await loadUser(session.user.id)
          if (isMounted) setUser(userData)
        } else {
          if (isMounted) setUser(null)
        }
      }
    )

    return () => {
      isMounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email, senha) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      })
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (e) {
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
  const podeAcessarLancamento = () => ['admin', 'comercial_interno'].includes(user?.tipo)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isVendedor, isComercialInterno, podeAcessarLancamento }}>
      {children}
    </AuthContext.Provider>
  )
}