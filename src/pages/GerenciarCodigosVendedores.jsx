// src/pages/GerenciarCodigosVendedores.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import Header from '../components/Header'
import { Save, Check, X, AlertCircle } from 'lucide-react'
import { validarCodigoVendedor } from '../utils/numeracaoPropostaUtils'

function GerenciarCodigosVendedores() {
  const [vendedores, setVendedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState({})
  const [erros, setErros] = useState({})
  const [sucessos, setSucessos] = useState({})

  useEffect(() => {
    carregarVendedores()
  }, [])

  const carregarVendedores = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, codigo_vendedor, ativo')
        .order('nome')

      if (error) throw error

      setVendedores(data || [])
      console.log('✅ Vendedores carregados:', data?.length)
    } catch (error) {
      console.error('❌ Erro ao carregar vendedores:', error)
      alert('Erro ao carregar vendedores: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const atualizarCodigo = (vendedorId, novoCodigo) => {
    setVendedores(prev => 
      prev.map(v => 
        v.id === vendedorId 
          ? { ...v, codigo_vendedor: novoCodigo.toUpperCase() }
          : v
      )
    )
    
    // Limpar mensagens ao digitar
    setErros(prev => ({ ...prev, [vendedorId]: null }))
    setSucessos(prev => ({ ...prev, [vendedorId]: false }))
  }

  const salvarCodigo = async (vendedor) => {
    try {
      const codigo = vendedor.codigo_vendedor?.trim().toUpperCase()

      // Validar código
      if (codigo && !validarCodigoVendedor(codigo)) {
        setErros(prev => ({ 
          ...prev, 
          [vendedor.id]: 'Código deve ter 2 ou 3 letras (apenas A-Z)' 
        }))
        return
      }

      // Verificar duplicatas
      if (codigo) {
        const { data: duplicatas } = await supabase
          .from('usuarios')
          .select('id, nome')
          .eq('codigo_vendedor', codigo)
          .neq('id', vendedor.id)

        if (duplicatas && duplicatas.length > 0) {
          setErros(prev => ({ 
            ...prev, 
            [vendedor.id]: `Código já usado por: ${duplicatas[0].nome}` 
          }))
          return
        }
      }

      setSalvando(prev => ({ ...prev, [vendedor.id]: true }))

      const { error } = await supabase
        .from('usuarios')
        .update({ codigo_vendedor: codigo || null })
        .eq('id', vendedor.id)

      if (error) throw error

      setSucessos(prev => ({ ...prev, [vendedor.id]: true }))
      setErros(prev => ({ ...prev, [vendedor.id]: null }))

      // Limpar sucesso após 3 segundos
      setTimeout(() => {
        setSucessos(prev => ({ ...prev, [vendedor.id]: false }))
      }, 3000)

      console.log('✅ Código salvo:', codigo || '(removido)')

    } catch (error) {
      console.error('❌ Erro ao salvar:', error)
      setErros(prev => ({ 
        ...prev, 
        [vendedor.id]: 'Erro ao salvar: ' + error.message 
      }))
    } finally {
      setSalvando(prev => ({ ...prev, [vendedor.id]: false }))
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Carregando...</div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* CABEÇALHO */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white mb-2">
              Códigos dos Vendedores
            </h1>
            <p className="text-purple-100 text-sm">
              Cadastre códigos de 2 ou 3 letras para cada vendedor.
              Estes códigos serão usados na numeração automática das propostas.
            </p>
          </div>

          {/* EXEMPLO */}
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="text-blue-600" size={18} />
              <div>
                <span className="font-semibold text-blue-900">Formato das propostas:</span>
                <span className="text-blue-700 ml-2">
                  [CÓDIGO]-[ANO]-[SEQUENCIAL]
                </span>
                <span className="text-blue-600 ml-2">
                  Exemplo: <strong>NP-26-0001</strong>, <strong>CF-26-0042</strong>
                </span>
              </div>
            </div>
          </div>

          {/* TABELA */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vendedores.map((vendedor) => (
                  <tr key={vendedor.id} className={!vendedor.ativo ? 'bg-gray-50 opacity-60' : ''}>
                    
                    {/* NOME */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{vendedor.nome}</div>
                      {!vendedor.ativo && (
                        <span className="text-xs text-gray-500">(Inativo)</span>
                      )}
                    </td>

                    {/* EMAIL */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vendedor.email || '-'}
                    </td>

                    {/* CÓDIGO */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <input
                          type="text"
                          value={vendedor.codigo_vendedor || ''}
                          onChange={(e) => atualizarCodigo(vendedor.id, e.target.value)}
                          placeholder="Ex: NP, CF, MSS"
                          maxLength={3}
                          className={`w-24 px-3 py-2 text-center border rounded-lg font-bold uppercase focus:ring-2 focus:ring-purple-500 ${
                            erros[vendedor.id] 
                              ? 'border-red-300 bg-red-50' 
                              : sucessos[vendedor.id]
                              ? 'border-green-300 bg-green-50'
                              : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {erros[vendedor.id] && (
                        <div className="mt-1 text-xs text-red-600 text-center">
                          {erros[vendedor.id]}
                        </div>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4 text-center">
                      {sucessos[vendedor.id] ? (
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <Check size={16} />
                          <span className="text-sm">Salvo!</span>
                        </div>
                      ) : vendedor.codigo_vendedor ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Configurado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pendente
                        </span>
                      )}
                    </td>

                    {/* AÇÃO */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => salvarCodigo(vendedor)}
                        disabled={salvando[vendedor.id]}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {salvando[vendedor.id] ? (
                          <>
                            <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                            Salvando...
                          </>
                        ) : (
                          <>
                            <Save size={14} />
                            Salvar
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RODAPÉ COM ESTATÍSTICAS */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Total de vendedores: <strong>{vendedores.length}</strong>
              </div>
              <div className="flex gap-4">
                <div className="text-green-600">
                  Configurados: <strong>{vendedores.filter(v => v.codigo_vendedor).length}</strong>
                </div>
                <div className="text-yellow-600">
                  Pendentes: <strong>{vendedores.filter(v => !v.codigo_vendedor).length}</strong>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* INSTRUÇÕES */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">📋 Instruções</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">1.</span>
              <span>Digite um código único de <strong>2 ou 3 letras</strong> para cada vendedor (apenas A-Z)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">2.</span>
              <span>Clique em <strong>"Salvar"</strong> para confirmar o código</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">3.</span>
              <span>Os códigos serão usados automaticamente nas propostas: <strong>[CÓDIGO]-[ANO]-[SEQUENCIAL]</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">4.</span>
              <span>Vendedores sem código poderão criar orçamentos, mas as propostas não terão numeração automática</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  )
}

export default GerenciarCodigosVendedores