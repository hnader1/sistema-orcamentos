// src/components/ModalAlertaConcorrencia.jsx

import React from 'react';
import { X, AlertTriangle, MapPin, Calendar, DollarSign, User } from 'lucide-react';
import { 
  formatarCNPJCPFExibicao, 
  formatarDataExibicao, 
  formatarValorExibicao 
} from '../utils/concorrenciaUtils';

const ModalAlertaConcorrencia = ({ isOpen, onClose, conflitos }) => {
  if (!isOpen || !conflitos) return null;

  const getStatusBadge = (status) => {
    const badges = {
      'rascunho': 'bg-gray-100 text-gray-700',
      'enviado': 'bg-blue-100 text-blue-700',
      'aprovado': 'bg-green-100 text-green-700',
      'rejeitado': 'bg-red-100 text-red-700',
      'cancelado': 'bg-gray-100 text-gray-500',
      'lancado': 'bg-purple-100 text-purple-700'
    };
    return badges[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusTexto = (status) => {
    const textos = {
      'rascunho': 'Rascunho',
      'enviado': 'Enviado',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'cancelado': 'Cancelado',
      'lancado': 'Lançado'
    };
    return textos[status] || status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">⚠️ Concorrência Interna Detectada</h2>
                <p className="text-yellow-100 mt-1">
                  {conflitos.totalConflitos} orçamento(s) conflitante(s) encontrado(s)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {conflitos.conflitos.map((conflito, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              {/* Título do Conflito */}
              <div className={`flex items-center gap-3 mb-4 p-4 rounded-lg ${
                conflito.tipo === 'CRITICO' 
                  ? 'bg-red-50 border-2 border-red-200' 
                  : 'bg-yellow-50 border-2 border-yellow-200'
              }`}>
                <span className="text-3xl">{conflito.nivel}</span>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${
                    conflito.tipo === 'CRITICO' ? 'text-red-900' : 'text-yellow-900'
                  }`}>
                    {conflito.titulo}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    conflito.tipo === 'CRITICO' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {conflito.mensagem}
                  </p>
                  {conflito.detalhes && (
                    <p className={`text-xs mt-1 italic ${
                      conflito.tipo === 'CRITICO' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {conflito.detalhes}
                    </p>
                  )}
                </div>
              </div>

              {/* Lista de Orçamentos Conflitantes */}
              <div className="space-y-3">
                {conflito.orcamentos.map((orc, orcIdx) => (
                  <div 
                    key={orcIdx}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-bold text-gray-900">
                            {orc.numero_orcamento}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(orc.status)}`}>
                            {getStatusTexto(orc.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {orc.cliente_nome || 'Cliente não informado'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {formatarValorExibicao(orc.valor_total)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {/* Vendedor */}
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        <div>
                          <span className="text-gray-500">Vendedor:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {orc.vendedores?.nome || 'Não informado'}
                          </span>
                        </div>
                      </div>

                      {/* Data */}
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <div>
                          <span className="text-gray-500">Criado em:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {formatarDataExibicao(orc.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* CNPJ/CPF */}
                      {orc.cnpj_cpf && (
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-gray-400" />
                          <div>
                            <span className="text-gray-500">CNPJ/CPF:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {formatarCNPJCPFExibicao(orc.cnpj_cpf)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Localização */}
                      {orc.obra_cidade && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          <div>
                            <span className="text-gray-500">Local:</span>
                            <span className="ml-1 font-medium text-gray-900">
                              {orc.obra_cidade}
                              {orc.obra_bairro && ` - ${orc.obra_bairro}`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Logradouro */}
                    {orc.obra_logradouro && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          📍 {orc.obra_logradouro}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
              <AlertTriangle size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">O que fazer agora?</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Verifique</strong> se é realmente o mesmo cliente/obra</li>
                <li>• <strong>Entre em contato</strong> com o vendedor responsável</li>
                <li>• <strong>Coordene</strong> a abordagem comercial para evitar conflito</li>
                <li>• Você pode <strong>continuar</strong> criando o orçamento, mas estará ciente do conflito</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Entendi, continuar mesmo assim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAlertaConcorrencia;