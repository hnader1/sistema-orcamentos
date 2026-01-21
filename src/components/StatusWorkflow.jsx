// src/components/StatusWorkflow.jsx
// =====================================================
// COMPONENTE: Fluxo de Status da Proposta
// Substitui dropdown por botões de Avançar/Voltar
// =====================================================

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Send, 
  CheckCircle, 
  Truck,
  Flag,
  XCircle,
  Lock,
  AlertTriangle
} from 'lucide-react';

// Definição do fluxo de status
const FLUXO_STATUS = [
  { 
    id: 'rascunho', 
    label: 'Rascunho', 
    icon: FileText, 
    cor: 'gray',
    descricao: 'Orçamento em edição',
    podeAvancar: (ctx) => ctx.temPDF, // Só avança se gerar PDF
    msgBloqueio: 'Gere o PDF da proposta para avançar'
  },
  { 
    id: 'enviado', 
    label: 'Enviado', 
    icon: Send, 
    cor: 'blue',
    descricao: 'Proposta enviada ao cliente',
    podeAvancar: (ctx) => ctx.temPDF,
    msgBloqueio: 'Aguardando aprovação do cliente'
  },
  { 
    id: 'aprovado', 
    label: 'Aprovado', 
    icon: CheckCircle, 
    cor: 'green',
    descricao: 'Cliente aprovou a proposta',
    podeAvancar: (ctx) => ctx.isAdmin || ctx.isComercialInterno,
    msgBloqueio: 'Apenas Admin pode lançar no ERP'
  },
  { 
    id: 'lancado', 
    label: 'Lançado', 
    icon: Truck, 
    cor: 'purple',
    descricao: 'Lançado no ERP',
    podeAvancar: (ctx) => ctx.isAdmin,
    msgBloqueio: 'Apenas Admin pode finalizar'
  },
  { 
    id: 'finalizado', 
    label: 'Finalizado', 
    icon: Flag, 
    cor: 'emerald',
    descricao: 'Processo concluído',
    podeAvancar: () => false,
    msgBloqueio: 'Status final'
  }
];

// Status especiais (fora do fluxo linear)
const STATUS_ESPECIAIS = {
  cancelado: { label: 'Cancelado', icon: XCircle, cor: 'red' },
  rejeitado: { label: 'Rejeitado', icon: XCircle, cor: 'orange' }
};

export default function StatusWorkflow({
  statusAtual,
  temPDF,
  isVendedor,
  isAdmin,
  isComercialInterno,
  onAvancar,
  onVoltar,
  onCancelar,
  disabled = false,
  orcamentoId
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [acaoPendente, setAcaoPendente] = useState(null);

  // Contexto para validações
  const ctx = { temPDF, isVendedor, isAdmin, isComercialInterno };

  // Encontrar posição atual no fluxo
  const indexAtual = FLUXO_STATUS.findIndex(s => s.id === statusAtual);
  const statusInfo = FLUXO_STATUS[indexAtual] || STATUS_ESPECIAIS[statusAtual];
  
  // Se status especial (cancelado/rejeitado), mostrar só badge
  if (STATUS_ESPECIAIS[statusAtual]) {
    const info = STATUS_ESPECIAIS[statusAtual];
    const Icon = info.icon;
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
        <div className={`p-2 rounded-full bg-${info.cor}-100`}>
          <Icon className={`w-5 h-5 text-${info.cor}-600`} />
        </div>
        <div>
          <span className={`text-sm font-semibold text-${info.cor}-700`}>
            {info.label.toUpperCase()}
          </span>
          <p className="text-xs text-gray-500">Este orçamento foi {statusAtual}</p>
        </div>
      </div>
    );
  }

  // Verificar se pode avançar
  const statusProximo = FLUXO_STATUS[indexAtual + 1];
  const podeAvancarStatus = statusProximo && 
    statusInfo?.podeAvancar?.(ctx) && 
    !disabled;

  // Verificar se pode voltar (só admin/comercial interno e não em rascunho)
  const statusAnterior = FLUXO_STATUS[indexAtual - 1];
  const podeVoltarStatus = statusAnterior && 
    (isAdmin || isComercialInterno) && 
    !disabled;

  // Handler para avançar com confirmação
  const handleAvancar = () => {
    if (!podeAvancarStatus) return;
    
    setAcaoPendente({
      tipo: 'avancar',
      statusNovo: statusProximo.id,
      label: statusProximo.label
    });
    setConfirmando(true);
  };

  // Handler para voltar com confirmação
  const handleVoltar = () => {
    if (!podeVoltarStatus) return;
    
    setAcaoPendente({
      tipo: 'voltar',
      statusNovo: statusAnterior.id,
      label: statusAnterior.label
    });
    setConfirmando(true);
  };

  // Confirmar ação
  const confirmarAcao = () => {
    if (acaoPendente?.tipo === 'avancar') {
      onAvancar?.(acaoPendente.statusNovo);
    } else if (acaoPendente?.tipo === 'voltar') {
      onVoltar?.(acaoPendente.statusNovo);
    }
    setConfirmando(false);
    setAcaoPendente(null);
  };

  // Cores por status
  const coresStatus = {
    rascunho: 'bg-gray-100 text-gray-700 border-gray-300',
    enviado: 'bg-blue-100 text-blue-700 border-blue-300',
    aprovado: 'bg-green-100 text-green-700 border-green-300',
    lancado: 'bg-purple-100 text-purple-700 border-purple-300',
    finalizado: 'bg-emerald-100 text-emerald-700 border-emerald-300'
  };

  const Icon = statusInfo?.icon || FileText;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Cabeçalho com Status Atual */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${coresStatus[statusAtual]?.split(' ')[0]} border ${coresStatus[statusAtual]?.split(' ')[2]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-gray-500 uppercase tracking-wide">Status Atual</span>
            <p className="font-bold text-lg">{statusInfo?.label || statusAtual}</p>
          </div>
        </div>

        {/* Indicador de travado */}
        {!temPDF && statusAtual === 'rascunho' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span className="text-xs text-amber-700">Gere o PDF para avançar</span>
          </div>
        )}

        {temPDF && statusAtual === 'rascunho' && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-700">PDF gerado - pronto para enviar</span>
          </div>
        )}
      </div>

      {/* Progress Bar Visual */}
      <div className="flex items-center gap-1 mb-4">
        {FLUXO_STATUS.map((status, idx) => {
          const isAtual = status.id === statusAtual;
          const isPassado = idx < indexAtual;
          const isFuturo = idx > indexAtual;
          
          return (
            <div 
              key={status.id}
              className="flex-1 relative"
            >
              <div 
                className={`h-2 rounded-full transition-all ${
                  isPassado ? 'bg-green-500' :
                  isAtual ? 'bg-blue-500' :
                  'bg-gray-200'
                }`}
              />
              <span className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap ${
                isAtual ? 'text-blue-600 font-semibold' : 'text-gray-400'
              }`}>
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Botões de Navegação */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
        {/* Botão Voltar */}
        <button
          onClick={handleVoltar}
          disabled={!podeVoltarStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            podeVoltarStatus
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
          }`}
          title={!podeVoltarStatus ? 'Apenas Admin/Comercial Interno pode retroceder' : `Voltar para ${statusAnterior?.label}`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">
            {statusAnterior ? `Voltar (${statusAnterior.label})` : 'Início'}
          </span>
        </button>

        {/* Botão Avançar */}
        <button
          onClick={handleAvancar}
          disabled={!podeAvancarStatus}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            podeAvancarStatus
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          title={!podeAvancarStatus ? statusInfo?.msgBloqueio : `Avançar para ${statusProximo?.label}`}
        >
          <span className="text-sm">
            {statusProximo ? `Avançar (${statusProximo.label})` : 'Finalizado'}
          </span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de Confirmação */}
      {confirmando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold mb-2">
              Confirmar Alteração de Status
            </h3>
            <p className="text-gray-600 mb-4">
              {acaoPendente?.tipo === 'avancar' 
                ? `Deseja avançar o status para "${acaoPendente.label}"?`
                : `Deseja retornar o status para "${acaoPendente.label}"?`
              }
            </p>
            
            {acaoPendente?.statusNovo === 'aprovado' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>⚠️ Atenção:</strong> Ao aprovar, a proposta será marcada como aprovada manualmente e o vendedor não poderá mais editá-la.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setConfirmando(false);
                  setAcaoPendente(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAcao}
                className={`px-4 py-2 rounded-lg text-white ${
                  acaoPendente?.tipo === 'voltar' 
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
