// src/components/LogRevisoes.jsx
// =====================================================
// COMPONENTE: Log de Revisões da Proposta
// Mostra histórico de todas as alterações após envio
// =====================================================

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  FileEdit, 
  ChevronDown, 
  ChevronUp,
  Eye,
  History,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../services/supabase';

export default function LogRevisoes({ orcamentoId, revisaoAtual }) {
  const [revisoes, setRevisoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  useEffect(() => {
    if (orcamentoId) {
      carregarRevisoes();
    }
  }, [orcamentoId]);

  const carregarRevisoes = async () => {
    try {
      setCarregando(true);
      
      const { data, error } = await supabase
        .from('propostas_revisoes')
        .select('*')
        .eq('orcamento_id', orcamentoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRevisoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar revisões:', error);
    } finally {
      setCarregando(false);
    }
  };

  // Formatar data
  const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Traduzir nome do campo
  const traduzirCampo = (campo) => {
    const traducoes = {
      cliente_nome: 'Nome do Cliente',
      cliente_empresa: 'Nome do Contato',
      cliente_email: 'Email',
      cliente_telefone: 'Telefone',
      endereco_entrega: 'Endereço de Entrega',
      observacoes: 'Observações',
      observacoes_internas: 'Observações Internas',
      forma_pagamento_id: 'Forma de Pagamento',
      prazo_entrega: 'Prazo de Entrega',
      desconto_geral: 'Desconto Geral',
      validade_dias: 'Validade (dias)',
      frete: 'Frete',
      frete_cidade: 'Cidade do Frete',
      itens: 'Itens do Orçamento',
      status: 'Status'
    };
    return traducoes[campo] || campo;
  };

  // Se não tem revisões, mostrar mensagem
  if (!carregando && revisoes.length === 0) {
    if (revisaoAtual === 0) {
      return null; // Não mostrar nada se é a versão original e sem revisões
    }
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhuma revisão registrada</p>
      </div>
    );
  }

  // Revisões a mostrar (limitadas ou todas)
  const revisoesVisiveis = mostrarTodos ? revisoes : revisoes.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Histórico de Revisões</h3>
              <p className="text-sm text-gray-500">
                {revisoes.length} revisão(ões) • Versão atual: Rev.{revisaoAtual || 0}
              </p>
            </div>
          </div>
          
          {revisaoAtual > 0 && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
              Documento Revisado
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {carregando && (
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Carregando histórico...</p>
        </div>
      )}

      {/* Lista de Revisões */}
      {!carregando && (
        <div className="divide-y divide-gray-100">
          {revisoesVisiveis.map((rev, idx) => (
            <div 
              key={rev.id}
              className={`transition-all ${
                expandido === rev.id ? 'bg-blue-50/30' : 'hover:bg-gray-50'
              }`}
            >
              {/* Linha Principal */}
              <div 
                className="px-6 py-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandido(expandido === rev.id ? null : rev.id)}
              >
                <div className="flex items-center gap-4">
                  {/* Badge da Revisão */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold">
                      {rev.numero_revisao}
                    </span>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      Revisão {rev.numero_revisao}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {rev.editado_por_nome || 'Sistema'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatarData(rev.editado_em)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Resumo dos campos alterados */}
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-gray-600">
                      {Object.keys(rev.campos_alterados || {}).length} campo(s) alterado(s)
                    </p>
                    {rev.status_anterior !== rev.status_novo && (
                      <p className="text-xs text-amber-600">
                        Status: {rev.status_anterior} → {rev.status_novo}
                      </p>
                    )}
                  </div>
                  
                  {expandido === rev.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Detalhes Expandidos */}
              {expandido === rev.id && (
                <div className="px-6 pb-4 border-t border-gray-100 bg-white">
                  <div className="mt-4 space-y-3">
                    {/* Motivo da Revisão */}
                    {rev.motivo && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                          <strong>Motivo:</strong> {rev.motivo}
                        </p>
                      </div>
                    )}

                    {/* Campos Alterados */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Alterações:</p>
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Campo</th>
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Antes</th>
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Depois</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {Object.keys(rev.campos_alterados || {}).map(campo => (
                              <tr key={campo}>
                                <td className="px-4 py-2 font-medium text-gray-700">
                                  {traduzirCampo(campo)}
                                </td>
                                <td className="px-4 py-2 text-red-600">
                                  <del>
                                    {formatarValor(rev.valores_anteriores?.[campo])}
                                  </del>
                                </td>
                                <td className="px-4 py-2 text-green-600">
                                  {formatarValor(rev.valores_novos?.[campo])}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botão Ver Mais */}
      {!carregando && revisoes.length > 3 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => setMostrarTodos(!mostrarTodos)}
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {mostrarTodos 
              ? 'Mostrar menos' 
              : `Ver todas as ${revisoes.length} revisões`
            }
          </button>
        </div>
      )}
    </div>
  );
}

// Helper para formatar valores
function formatarValor(valor) {
  if (valor === null || valor === undefined) return '-';
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
  if (typeof valor === 'number') return valor.toLocaleString('pt-BR');
  if (typeof valor === 'object') return JSON.stringify(valor).substring(0, 50) + '...';
  if (String(valor).length > 100) return String(valor).substring(0, 100) + '...';
  return String(valor);
}
