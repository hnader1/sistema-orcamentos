import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import logoConstrucom from '../assets/logo-construcom.png'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    
    if (!formData.email || !formData.senha) {
      setErro('Preencha email e senha')
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.email, formData.senha)
      
      if (result.success) {
        console.log('✅ Redirecionando para dashboard...')
        navigate('/')
      } else {
        setErro(result.error || 'Email ou senha incorretos')
      }
    } catch (error) {
      setErro('Erro ao fazer login. Tente novamente.')
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={logoConstrucom} 
              alt="Construcom" 
              className="h-16 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">
              Sistema de Orçamentos
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Faça login para continuar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-600">{erro}</p>
              </div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Info de teste */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">
              💡 Usuários de teste:
            </p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>👑 Admin: nader@construcom.com.br / Nader@123</p>
              <p>👤 Vendedor: vendedor@construcom.com.br / vendedor123</p>
              <p>💼 Comercial: comercial@construcom.com.br / comercial123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2025 Construcom - Sistema de Orçamentos
        </p>
      </div>
    </div>
  )
}
