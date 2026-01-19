import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async (authId) => {
    const { data } = await supabase
      .from('usuarios')
      .select('id, email, nome, telefone, tipo')
      .eq('auth_id', authId)
      .eq('ativo', true)
      .single()
    return data
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userData = await loadUser(session.user.id)
        setUser(userData)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userData = await loadUser(session.user.id)
          setUser(userData)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email, senha) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    })
    if (error) return { success: false, error: 'Email ou senha incorretos' }
    return { success: true }
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