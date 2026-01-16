// src/components/CardConflitosInternos.jsx
// ============================================================================
// 📊 COMPONENTE: Card de Conflitos Internos
// ============================================================================
// 🎯 FUNÇÃO: Exibir no dashboard o número de grupos com conflitos de concorrência
// 📅 CRIADO EM: 16/01/2026
// 🔗 USADO EM: src/pages/RelatorioOrcamentos.jsx
// 
// 💡 O QUE FAZ:
// - Conta grupos de orçamentos com múltiplos vendedores
// - Exclui conflitos arquivados (tabela conflitos_ignorados)
// - Muda cor: Verde (0 conflitos) / Laranja (tem conflitos)
// - Clicável: redireciona para /conflitos
// 
// 🗄️ TABELAS USADAS:
// - orcamentos (busca últimos 180 dias)
// - conflitos_ignorados (para excluir arquivados)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabase';

const CardConflitosInternos = () => {
  const navigate = useNavigate();
  const [totalConflitos, setTotalConflitos] = useState(0);
  const [loading, setLoading] = useState(true);

  // ============================================================================
  // ⚙️ EFFECT: Carrega conflitos quando componente monta
  // ============================================================================
  useEffect(() => {
    contarConflitos();
  }, []);

  // ============================================================================
  // 🔍 FUNÇÃO: Contar Conflitos
  // ============================================================================
  // Busca orçamentos ativos e agrupa por CNPJ e Localização
  // Exclui conflitos que foram arquivados pelo administrador
  // ============================================================================
  const contarConflitos = async () => {
    try {
      setLoading(true);

      // --------------------------------------------------------------------
      // 1️⃣ BUSCAR ORÇAMENTOS ATIVOS (últimos 180 dias)
      // --------------------------------------------------------------------
      const data180DiasAtras = new Date();
      data180DiasAtras.setDate(data180DiasAtras.getDate() - 180);

      const { data: orcamentos, error } = await supabase
        .from('orcamentos')
        .select('id, cnpj_cpf, obra_cidade, obra_bairro, usuario_id')
        .gte('created_at', data180DiasAtras.toISOString())
        .in('status', ['rascunho', 'enviado', 'aprovado', 'lancado']); // ⚠️ Inclui "lancado"!

      if (error) throw error;

      // --------------------------------------------------------------------
      // 2️⃣ BUSCAR CONFLITOS ARQUIVADOS (para excluir da contagem)
      // --------------------------------------------------------------------
      const { data: ignorados } = await supabase
        .from('conflitos_ignorados')
        .select('tipo, chave_conflito');

      const chavesIgnoradas = new Set(
        (ignorados || []).map(i => `${i.tipo}:${i.chave_conflito}`)
      );

      // --------------------------------------------------------------------
      // 3️⃣ CONTAR CONFLITOS POR CNPJ
      // --------------------------------------------------------------------
      // Agrupa orçamentos pelo mesmo CNPJ e conta quantos vendedores diferentes
      let grupos = 0;

      const porCNPJ = {};
      orcamentos.forEach(orc => {
        if (orc.cnpj_cpf) {
          if (!porCNPJ[orc.cnpj_cpf]) {
            porCNPJ[orc.cnpj_cpf] = new Set();
          }
          porCNPJ[orc.cnpj_cpf].add(orc.usuario_id);
        }
      });

      // Se tem mais de 1 vendedor para o mesmo CNPJ = CONFLITO!
      Object.entries(porCNPJ).forEach(([cnpj, vendedores]) => {
        if (vendedores.size > 1 && !chavesIgnoradas.has(`CNPJ:${cnpj}`)) {
          grupos++;
        }
      });

      // --------------------------------------------------------------------
      // 4️⃣ CONTAR CONFLITOS POR LOCALIZAÇÃO (Cidade + Bairro)
      // --------------------------------------------------------------------
      // Exclui orçamentos que já foram detectados como conflito de CNPJ
      const cnpjsConflitantes = new Set(
        Object.entries(porCNPJ)
          .filter(([, vendedores]) => vendedores.size > 1)
          .map(([cnpj]) => cnpj)
      );

      const porLocalizacao = {};
      orcamentos
        .filter(orc => !cnpjsConflitantes.has(orc.cnpj_cpf)) // Evita duplicação
        .forEach(orc => {
          if (orc.obra_cidade && orc.obra_bairro) {
            const chave = `${orc.obra_cidade}|${orc.obra_bairro}`;
            if (!porLocalizacao[chave]) {
              porLocalizacao[chave] = new Set();
            }
            porLocalizacao[chave].add(orc.usuario_id);
          }
        });

      // Se tem mais de 1 vendedor na mesma localização = CONFLITO!
      Object.entries(porLocalizacao).forEach(([chave, vendedores]) => {
        if (vendedores.size > 1 && !chavesIgnoradas.has(`LOCALIZACAO:${chave}`)) {
          grupos++;
        }
      });

      // --------------------------------------------------------------------
      // 5️⃣ ATUALIZAR ESTADO
      // --------------------------------------------------------------------
      setTotalConflitos(grupos);
      
    } catch (error) {
      console.error('❌ Erro ao contar conflitos:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // 🎨 RENDERIZAÇÃO DO CARD
  // ============================================================================
  return (
    <div
      onClick={() => navigate('/conflitos')} // 👆 Clicável - vai para página dedicada
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">Conflitos Internos</p>
          
          {/* Estado de Loading */}
          {loading ? (
            <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            /* Número de Conflitos - Muda cor conforme quantidade */
            <h3 className={`text-3xl font-bold ${
              totalConflitos > 0 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {totalConflitos}
            </h3>
          )}
        </div>

        {/* Ícone - Muda cor conforme quantidade */}
        <div className={`p-4 rounded-full ${
          totalConflitos > 0 ? 'bg-orange-100' : 'bg-green-100'
        }`}>
          <AlertTriangle 
            size={32} 
            className={totalConflitos > 0 ? 'text-orange-600' : 'text-green-600'} 
          />
        </div>
      </div>

      {/* Mensagem de Status */}
      <div className="mt-2">
        <p className="text-xs text-gray-500">
          {totalConflitos === 0 
            ? '✅ Nenhum conflito detectado'
            : `⚠️ ${totalConflitos} grupo(s) com múltiplos vendedores`
          }
        </p>
      </div>
    </div>
  );
};

export default CardConflitosInternos;

// ============================================================================
// 📝 NOTAS IMPORTANTES:
// ============================================================================
// 
// 🔄 ATUALIZAÇÃO AUTOMÁTICA:
// - O componente carrega ao montar (useEffect)
// - Se quiser atualizar automaticamente a cada X segundos:
//   useEffect(() => {
//     const interval = setInterval(contarConflitos, 60000); // 1 minuto
//     return () => clearInterval(interval);
//   }, []);
// 
// 🎨 CORES:
// - Verde (text-green-600): 0 conflitos
// - Laranja (text-orange-600): tem conflitos
// - Para mudar cores, edite as classes Tailwind nas linhas 108-117
// 
// 🗄️ DEPENDÊNCIAS:
// - Tabela: conflitos_ignorados (deve existir no Supabase)
// - Rota: /conflitos (deve estar configurada no App.jsx)
// - Página: src/pages/Conflitos.jsx (deve ser criada)
// 
// ⚠️ TROUBLESHOOTING:
// - Se não aparecer número: verificar console do navegador
// - Se clicar e não navegar: verificar se rota /conflitos existe
// - Se sempre mostra 0: verificar se há orçamentos nos últimos 180 dias
// 
// ============================================================================