// src/components/EmbutirValoresControles.jsx
// Componente com botões para embutir desconto e frete no valor unitário

import { useState } from 'react'
import { Lock, Unlock, TruckIcon, PercentIcon, AlertTriangle } from 'lucide-react'

export default function EmbutirValoresControles({
  descontoEmbutido,
  freteEmbutido,
  onDescontoEmbutidoChange,
  onFreteEmbutidoChange,
  percentualDesconto,
  freteTotal,
  totalUnidades,
  disabled = false,
  isAdmin = false,
  onValidarSenhaAdmin // Callback para validar senha quando não é admin
}) {
  const [mostrarModalSenhaFrete, setMostrarModalSenhaFrete] = useState(false)
  const [usuarioLiberacao, setUsuarioLiberacao] = useState('')
  const [senhaLiberacao, setSenhaLiberacao] = useState('')
  const [erroSenha, setErroSenha] = useState(false)
  const [validandoSenha, setValidandoSenha] = useState(false)

  const freteUnitario = freteTotal && totalUnidades > 0 
    ? (freteTotal / totalUnidades).toFixed(4) 
    : 0

  const descontoValorExemplo = percentualDesconto > 0 
    ? `${percentualDesconto}%` 
    : '0%'

  // Handler para toggle de desconto embutido
  const handleDescontoToggle = () => {
    if (disabled) return
    onDescontoEmbutidoChange(!descontoEmbutido)
  }

  // Handler para toggle de frete embutido
  const handleFreteToggle = () => {
    if (disabled) return
    
    if (!freteEmbutido) {
      // Ativando frete embutido - precisa de senha ADM se não for admin
      if (isAdmin) {
        onFreteEmbutidoChange(true)
      } else {
        setMostrarModalSenhaFrete(true)
      }
    } else {
      // Desativando - não precisa de senha
      onFreteEmbutidoChange(false)
    }
  }

  // Validar senha admin para frete embutido
  const validarSenhaFrete = async () => {
    if (!usuarioLiberacao || !senhaLiberacao) {
      setErroSenha(true)
      return
    }

    setValidandoSenha(true)
    setErroSenha(false)

    try {
      // Chama callback para validar senha
      const resultado = await onValidarSenhaAdmin(usuarioLiberacao, senhaLiberacao)
      
      if (resultado.sucesso) {
        onFreteEmbutidoChange(true)
        setMostrarModalSenhaFrete(false)
        setUsuarioLiberacao('')
        setSenhaLiberacao('')
      } else {
        setErroSenha(true)
      }
    } catch (error) {
      console.error('Erro ao validar senha:', error)
      setErroSenha(true)
    } finally {
      setValidandoSenha(false)
    }
  }

  const cancelarSenha = () => {
    setMostrarModalSenhaFrete(false)
    setUsuarioLiberacao('')
    setSenhaLiberacao('')
    setErroSenha(false)
  }

  return (
    <>
      {/* Controles de Embutir */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🎯</span>
          <h3 className="text-sm font-bold text-indigo-900">Embutir Valores no Preço Unitário</h3>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
            Oculta na proposta
          </span>
        </div>
        
        <p className="text-xs text-indigo-700 mb-4">
          Quando ativado, o cliente verá apenas o preço final por unidade, sem saber que há desconto ou frete embutido.
        </p>

        <div className="flex flex-wrap gap-4">
          {/* Botão Desconto Embutido */}
          <button
            type="button"
            onClick={handleDescontoToggle}
            disabled={disabled || percentualDesconto <= 0}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              descontoEmbutido
                ? 'bg-green-100 border-green-500 text-green-800'
                : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'
            } ${disabled || percentualDesconto <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`p-2 rounded-full ${descontoEmbutido ? 'bg-green-200' : 'bg-gray-100'}`}>
              <PercentIcon size={18} className={descontoEmbutido ? 'text-green-600' : 'text-gray-500'} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">
                {descontoEmbutido ? '✓ Desconto Embutido' : 'Embutir Desconto'}
              </div>
              <div className="text-xs opacity-75">
                {percentualDesconto > 0 
                  ? `${descontoValorExemplo} no valor unitário`
                  : 'Defina um desconto primeiro'
                }
              </div>
            </div>
            {descontoEmbutido && (
              <Unlock size={16} className="text-green-600 ml-2" />
            )}
          </button>

          {/* Botão Frete Embutido */}
          <button
            type="button"
            onClick={handleFreteToggle}
            disabled={disabled || freteTotal <= 0}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
              freteEmbutido
                ? 'bg-green-100 border-green-500 text-green-800'
                : 'bg-white border-gray-300 text-gray-700 hover:border-indigo-400'
            } ${disabled || freteTotal <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className={`p-2 rounded-full ${freteEmbutido ? 'bg-green-200' : 'bg-gray-100'}`}>
              <TruckIcon size={18} className={freteEmbutido ? 'text-green-600' : 'text-gray-500'} />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">
                {freteEmbutido ? '✓ Frete Embutido' : 'Embutir Frete'}
              </div>
              <div className="text-xs opacity-75">
                {freteTotal > 0 
                  ? `R$ ${parseFloat(freteUnitario).toFixed(2)}/un (${totalUnidades} unid.)`
                  : 'Defina um frete primeiro'
                }
              </div>
            </div>
            {!isAdmin && !freteEmbutido && freteTotal > 0 && (
              <Lock size={16} className="text-amber-600 ml-2" title="Requer senha ADM" />
            )}
            {freteEmbutido && (
              <Unlock size={16} className="text-green-600 ml-2" />
            )}
          </button>
        </div>

        {/* Aviso sobre ordem de cálculo */}
        {(descontoEmbutido || freteEmbutido) && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <strong>Ordem de cálculo:</strong>
                <ol className="list-decimal ml-4 mt-1 space-y-0.5">
                  {descontoEmbutido && (
                    <li>Desconto de {percentualDesconto}% aplicado no preço original</li>
                  )}
                  {freteEmbutido && (
                    <li>Frete de R$ {parseFloat(freteUnitario).toFixed(2)}/un adicionado ao preço (SEM desconto no frete)</li>
                  )}
                </ol>
                <p className="mt-1 font-medium">
                  O desconto NÃO incide sobre o valor do frete!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Senha para Frete */}
      {mostrarModalSenhaFrete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-full">
                <Lock className="text-indigo-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Embutir Frete</h3>
                <p className="text-sm text-gray-500">
                  Requer autorização de Administrador
                </p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <p><strong>Frete Total:</strong> R$ {freteTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><strong>Total de Unidades:</strong> {totalUnidades}</p>
              <p><strong>Frete/Unidade:</strong> R$ {parseFloat(freteUnitario).toFixed(4)}</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usuário (Admin)
                </label>
                <input
                  type="text"
                  value={usuarioLiberacao}
                  onChange={(e) => {
                    setUsuarioLiberacao(e.target.value)
                    setErroSenha(false)
                  }}
                  placeholder="Nome ou email do administrador..."
                  className={`w-full px-4 py-3 border rounded-lg ${
                    erroSenha ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  value={senhaLiberacao}
                  onChange={(e) => {
                    setSenhaLiberacao(e.target.value)
                    setErroSenha(false)
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && validarSenhaFrete()}
                  placeholder="Senha do administrador..."
                  className={`w-full px-4 py-3 border rounded-lg ${
                    erroSenha ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            
            {erroSenha && (
              <p className="text-red-600 text-sm mt-3">
                ❌ Usuário ou senha inválidos, ou sem permissão de administrador.
              </p>
            )}
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={cancelarSenha}
                disabled={validandoSenha}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={validarSenhaFrete}
                disabled={validandoSenha || !usuarioLiberacao || !senhaLiberacao}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {validandoSenha ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Validando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}