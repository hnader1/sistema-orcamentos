import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import logoConstrucom from '../assets/logo-construcom.png'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [success, setSuccess] = useState(false)
  const [erro, setErro] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [linkValido, setLinkValido] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const hash = window.location.hash
        console.log('URL hash:', hash)

        // Check for error in URL
        if (hash.includes('error=')) {
          const params = new URLSearchParams(hash.substring(1))
          const errorDesc = params.get('error_description')
          console.log('Error in URL:', errorDesc)
          setLinkValido(false)
          setErro(errorDesc?.replace(/\+/g, ' ') || 'Link inválido')
          setInitializing(false)
          return
        }

        // Wait for Supabase to process the URL hash
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check session
        const { data, error } = await supabase.auth.getSession()
        console.log('Session data:', data)
        console.log('Session error:', error)

        if (data?.session) {
          setHasSession(true)
          setLinkValido(true)
        } else if (hash.includes('access_token') || hash.includes('type=recovery')) {
          // Has token but no session - might still work
          setHasSession(true)
          setLinkValido(true)
        } else {
          setLinkValido(false)
          setErro('Nenhuma sessão encontrada. Use o link do email.')
        }
      } catch (e) {
        console.error('Check session error:', e)
      } finally {
        setInitializing(false)
      }
    }

    checkSession()
  }, [])

  const handleReset = async (e) => {
    e.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('Senha deve ter pelo menos 6 caracteres')
      return
    }

    if (senha !== confirmarSenha) {
      setErro('Senhas não conferem')
      return
    }

    setLoading(true)

    try {
      console.log('Attempting password update...')
      const { data, error } = await supabase.auth.updateUser({ password: senha })
      console.log('Update result:', data, error)

      if (error) {
        if (error.message.includes('different')) {
          setErro('A nova senha deve ser diferente da anterior')
        } else {
          setErro(error.message)
        }
        setLoading(false)
        return
      }

      await supabase.auth.signOut()
      setSuccess(true)

      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (error) {
      console.error('Reset error:', error)
      setErro(error.message || 'Erro ao redefinir senha')
      setLoading(false)
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando link...</p>
        </div>
      </div>
    )
  }

  if (!linkValido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expirado</h1>
          <p className="text-gray-600 mb-6">{erro || 'O link expirou ou é inválido.'}</p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Solicitar Novo Link
          </button>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Senha Alterada!</h1>
          <p className="text-gray-600">Redirecionando para o login...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Nova Senha</h1>
            <p className="text-sm text-gray-500 mt-2">Digite sua nova senha</p>
          </div>

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm text-red-600">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
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