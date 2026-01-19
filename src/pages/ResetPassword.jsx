import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import logoConstrucom from '../assets/logo-construcom.png'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [erro, setErro] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')

    if (!email) {
      setErro('Digite seu email')
      return
    }

    if (!email.includes('@')) {
      setErro('Email inválido')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://sistema-orcamentos-theta.vercel.app/reset-password'
      })

      if (error) throw error
      
      // Always show success (for security - don't reveal if email exists)
      setSent(true)
    } catch (error) {
      console.error('Reset email error:', error)
      // Still show success for security reasons
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifique seu Email</h1>
          <p className="text-gray-600 mb-2">
            Se o email <strong>{email}</strong> estiver cadastrado, você receberá um link para redefinir sua senha.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Verifique também a pasta de spam.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src={logoConstrucom} alt="Construcom" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Recuperar Senha</h1>
            <p className="text-sm text-gray-500 mt-2">Digite seu email para receber o link</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-600">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft size={18} />
              Voltar ao Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}