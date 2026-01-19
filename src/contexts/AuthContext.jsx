import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      // Check if session is still valid (8 hours)
      const loginTime = localStorage.getItem('loginTime')
      if (loginTime) {
        const hoursElapsed = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60)
        if (hoursElapsed > 8) {
          // Session expired
          localStorage.removeItem('user')
          localStorage.removeItem('loginTime')
          setUser(null)
        } else {
          setUser(userData)
        }
      } else {
        setUser(userData)
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, senha) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, email, nome, telefone, tipo, senha')
        .eq('email', email)
        .eq('ativo', true)
        .single()

      if (error || !data) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      if (data.senha !== senha) {
        return { success: false, error: 'Senha incorreta' }
      }

      const userData = {
        id: data.id,
        email: data.email,
        nome: data.nome,
        telefone: data.telefone,
        tipo: data.tipo
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('loginTime', Date.now().toString())

      return { success: true }
    } catch (e) {
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('loginTime')
  }

  const isAdmin = () => user?.tipo === 'admin'
  const isVendedor = () => user?.tipo === 'vendedor'
  const isComercialInterno = () => user?.tipo === 'comercial_interno'
  const podeAcessarLancamento = () => ['admin', 'comercial_interno'].includes(user?.tipo)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isVendedor, isComercialInterno, podeAcessarLancamento }}>
      {children}
    </AuthContext.Provider>
  )
}