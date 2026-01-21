// src/components/LogRevisoes.jsx
// =====================================================
// COMPONENTE: Log de Revisões da Proposta
// VERSÃO CORRIGIDA - Filtra campos internos e mostra alterações reais
// =====================================================

import React, { useState, useEffect } from 'react'
import { History, ChevronDown, ChevronUp, User, Calendar, FileText } from 'lucide-react'
import { supabase } from '../services/supabase'

// Tradução dos nomes dos campos para exibição
const TRADUCAO_CAMPOS = {
  cliente_nome: 'Nome do Cliente',
  cliente_empresa: 'Empresa/Contato',
  cliente_email: 'Email',
  cliente_telefone: 'Telefone',
  endereco_entrega: 'Endereço de Entrega',
  observacoes: 'Observações',
  forma_pagamento_id: 'Forma de Pagamento',
  prazo_entrega: 'Prazo de Entrega',
  desconto_geral: 'Desconto (%)',
  validade_dias: 'Validade (dias)',
  frete: 'Valor do Frete',
  frete_cidade: 'Cidade do Frete',
  frete_modalidade: 'Modalidade do Frete',
  frete_tipo_caminhao: 'Tipo de Caminhão',
  frete_qtd_viagens: 'Qtd. Viagens',
  obra_cep: 'CEP da Obra',
  obra_cidade: 'Cidade da Obra',
  obra_bairro: 'Bairro da Obra',
  obra_logradouro: 'Logradouro da Obra',
  obra_numero: 'Número da Obra',
  cnpj_cpf: 'CNPJ/CPF',
  numero_proposta: 'Número da Proposta',
  status: 'Status'
}

// Campos internos que não devem ser exibidos
const CAMPOS_INTERNOS = ['_inicio_revisao']

function LogRevisoes({ orcamentoId, revisaoAtual = 0 }) {
  const [revisoes, setRevisoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState({})

  useEffect(() => {
    if (orcamentoId) {
      carregarRevisoes()
    }
  }, [orcamentoId])

  const carregarRevisoes = async () => {
    try {
      const { data, error } = await supabase
        .from('propostas_revisoes')
        .select('*')
        .eq('orcamento_id', orcamentoId)
        .order('numero_revisao', { ascending: false })

      if (error) {
        console.warn('Tabela propostas_revisoes pode não existir:', error)
        setRevisoes([])
        return
      }

      setRevisoes(data || [])
    } catch (error) {
      console.error('Erro ao carregar revisões:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpandir = (id) => {
    setExpandido(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const formatarValor = (valor) => {
    if (valor === null || valor === undefined) return '-'
    if (valor === '') return '(vazio)'
    if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
    if (typeof valor === 'number') {
      // Se parece ser dinheiro
      if (valor > 100) {
        return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      }
      return valor.toString()
    }
    return String(valor)
  }

  const traduzirCampo = (campo) => {
    return TRADUCAO_CAMPOS[campo] || campo
  }

  // Filtrar campos internos e retornar apenas alterações reais
  const getAlteracoesReais = (revisao) => {
    const campos = revisao.campos_alterados || {}
    const anteriores = revisao.valores_anteriores || {}
    const novos = revisao.valores_novos || {}
    
    const alteracoes = []
    
    for (const campo of Object.keys(campos)) {
      // Ignorar campos internos
      if (CAMPOS_INTERNOS.includes(campo)) continue
      
      alteracoes.push({
        campo,
        antes: anteriores[campo],
        depois: novos[campo]
      })
    }
    
    return alteracoes
  }

  // Verificar se é apenas um registro de início (sem alterações reais)
  const isApenasInicio = (revisao) => {
    const campos = Object.keys(revisao.campos_alterados || {})
    return campos.length === 1 && campos[0] === '_inicio_revisao'
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-gray-100 rounded"></div>
      </div>
    )
  }

  if (revisoes.length === 0) {
    return null // Não mostrar nada se não há revisões
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="text-gray-500" size={20} />
          <h2 className="text-lg font-semibold">Histórico de Revisões</h2>
          <span className="text-sm text-gray-500">
            {revisoes.length} revisão(ões) • Versão atual: Rev.{revisaoAtual}
          </span>
        </div>
        
        {revisaoAtual > 0 && (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
            Documento Revisado
          </span>
        )}
      </div>

      <div className="space-y-3">
        {revisoes.map((revisao) => {
          const alteracoesReais = getAlteracoesReais(revisao)
          const apenasInicio = isApenasInicio(revisao)
          
          return (
            <div 
              key={revisao.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Cabeçalho da revisão */}
              <div 
                className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => toggleExpandir(revisao.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                    {revisao.numero_revisao}
                  </span>
                  <div>
                    <span className="font-medium">Revisão {revisao.numero_revisao}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User size={12} />
                      <span>{revisao.editado_por_nome || 'Sistema'}</span>
                      <Calendar size={12} />
                      <span>
                        {new Date(revisao.editado_em).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {apenasInicio ? (
                    <span className="text-sm text-gray-500">
                      Edição iniciada
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {alteracoesReais.length} campo(s) alterado(s)
                    </span>
                  )}
                  {expandido[revisao.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {/* Detalhes expandidos */}
              {expandido[revisao.id] && (
                <div className="p-4 border-t border-gray-200">
                  {/* Motivo */}
                  {revisao.motivo && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <span className="text-amber-800 font-medium">Motivo:</span>{' '}
                      <span className="text-amber-700">{revisao.motivo}</span>
                    </div>
                  )}

                  {/* Tabela de alterações */}
                  {alteracoesReais.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Alterações:</p>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left">Campo</th>
                            <th className="px-3 py-2 text-left">Antes</th>
                            <th className="px-3 py-2 text-left">Depois</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alteracoesReais.map((alt, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-3 py-2 font-medium">{traduzirCampo(alt.campo)}</td>
                              <td className="px-3 py-2 text-red-600">{formatarValor(alt.antes)}</td>
                              <td className="px-3 py-2 text-green-600">{formatarValor(alt.depois)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : apenasInicio ? (
                    <div className="text-sm text-gray-500 italic">
                      <FileText size={16} className="inline mr-2" />
                      Revisão iniciada - PDF anterior excluído para permitir edição.
                      <br />
                      As alterações serão registradas quando o orçamento for salvo.
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Nenhuma alteração de campo registrada nesta revisão.
                    </p>
                  )}

                  {/* Status anterior/novo */}
                  {(revisao.status_anterior || revisao.status_novo) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                      <span className="text-gray-600">Status: </span>
                      {revisao.status_anterior && (
                        <span className="text-red-600">{revisao.status_anterior}</span>
                      )}
                      {revisao.status_anterior && revisao.status_novo && ' → '}
                      {revisao.status_novo && (
                        <span className="text-green-600">{revisao.status_novo}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default LogRevisoes