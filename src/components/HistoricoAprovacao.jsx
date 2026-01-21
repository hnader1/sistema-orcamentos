// src/components/HistoricoAprovacao.jsx
// =====================================================
// COMPONENTE: Exibe histórico completo de como a proposta foi aprovada
// =====================================================

import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  User, 
  Globe, 
  Calendar, 
  Clock,
  FileCheck,
  UserCheck,
  Link as LinkIcon,
  Monitor,
  MapPin
} from 'lucide-react'
import { supabase } from '../services/supabase'

function HistoricoAprovacao({ orcamentoId, status }) {
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orcamentoId && ['aprovado', 'lancado', 'finalizado'].includes(status)) {
      carregarDados()
    }
  }, [orcamentoId, status])

  const carregarDados = async () => {
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('aprovado_via, aprovado_em, aprovado_por, aprovacao_historico, aceite_ip, aceite_navegador')
        .eq('id', orcamentoId)
        .single()

      if (error) throw error
      setDados(data)
    } catch (error) {
      console.error('Erro ao carregar dados de aprovação:', error)
    } finally {
      setLoading(false)
    }
  }

  // Não mostrar se não está em status pós-aprovação
  if (!['aprovado', 'lancado', 'finalizado'].includes(status)) {
    return null
  }

  if (loading) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-green-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-green-100 rounded w-2/3"></div>
      </div>
    )
  }

  if (!dados) return null

  const isAprovacaoCliente = dados.aprovado_via === 'cliente'
  const historico = dados.aprovacao_historico || {}

  return (
    <div className={`rounded-xl border-2 p-4 mb-6 ${
      isAprovacaoCliente 
        ? 'bg-green-50 border-green-300' 
        : 'bg-blue-50 border-blue-300'
    }`}>
      <div className="flex items-start gap-3">
        {/* Ícone */}
        <div className={`p-2 rounded-full ${
          isAprovacaoCliente ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          {isAprovacaoCliente ? (
            <LinkIcon size={24} className="text-green-600" />
          ) : (
            <UserCheck size={24} className="text-blue-600" />
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1">
          <h3 className={`font-bold text-lg ${
            isAprovacaoCliente ? 'text-green-800' : 'text-blue-800'
          }`}>
            {isAprovacaoCliente 
              ? '✅ Aprovado pelo Cliente (via Link)' 
              : '✅ Aprovado Manualmente'}
          </h3>

          <div className="mt-3 space-y-2">
            {/* Data/hora */}
            {dados.aprovado_em && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-gray-700">
                  {new Date(dados.aprovado_em).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            {/* Quem aprovou */}
            {dados.aprovado_por && (
              <div className="flex items-center gap-2 text-sm">
                <User size={16} className="text-gray-500" />
                <span className="text-gray-700">
                  {isAprovacaoCliente ? 'Cliente: ' : 'Aprovado por: '}
                  <strong>{dados.aprovado_por}</strong>
                </span>
              </div>
            )}

            {/* IP (se aprovação cliente) */}
            {isAprovacaoCliente && (dados.aceite_ip || historico.ip) && (
              <div className="flex items-center gap-2 text-sm">
                <Globe size={16} className="text-gray-500" />
                <span className="text-gray-700">
                  IP: <code className="bg-gray-100 px-1 rounded">{dados.aceite_ip || historico.ip}</code>
                </span>
              </div>
            )}

            {/* Navegador (se aprovação cliente) */}
            {isAprovacaoCliente && (dados.aceite_navegador || historico.navegador) && (
              <div className="flex items-center gap-2 text-sm">
                <Monitor size={16} className="text-gray-500" />
                <span className="text-gray-700 truncate" title={dados.aceite_navegador || historico.navegador}>
                  Navegador: {(dados.aceite_navegador || historico.navegador)?.substring(0, 60)}...
                </span>
              </div>
            )}

            {/* Observação */}
            {historico.observacao && (
              <div className="flex items-start gap-2 text-sm mt-2 p-2 bg-white/50 rounded">
                <FileCheck size={16} className="text-gray-500 mt-0.5" />
                <span className="text-gray-700">{historico.observacao}</span>
              </div>
            )}
          </div>

          {/* Badge de garantia */}
          <div className={`mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            isAprovacaoCliente 
              ? 'bg-green-200 text-green-800' 
              : 'bg-blue-200 text-blue-800'
          }`}>
            <CheckCircle size={14} />
            {isAprovacaoCliente 
              ? 'Aceite registrado com dados do cliente' 
              : 'Aprovação interna registrada'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoricoAprovacao