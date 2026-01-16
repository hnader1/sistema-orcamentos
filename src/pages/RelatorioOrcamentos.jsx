// src/pages/RelatorioOrcamentos.jsx
// 📋 PÁGINA: Relatório de Concorrência Interna
// 🎯 FUNÇÃO: Exibir estatísticas de orçamentos com/sem CNPJ e conflitos internos
// 📅 ÚLTIMA MODIFICAÇÃO: 15/01/2026 - Adicionado card de conflitos internos

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  AlertTriangle, 
  Users, 
  FileText, 
  TrendingUp,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import { formatarCNPJCPFExibicao, formatarDataExibicao } from '../utils/concorrenciaUtils';

// ⚠️ IMPORTANTE: Componente adicionado em 15/01/2026
// 🎯 Este componente substitui o card "% Sem CNPJ" e mostra conflitos de concorrência interna
import CardConflitosInternos from '../components/CardConflitosInternos';

export default function RelatorioOrcamentos() {
  const navigate = useNavigate();
  const { podeAcessarLancamento } = useAuth();
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30'); // dias
  const [estatisticas, setEstatisticas] = useState({
    totalOrcamentos: 0,
    comCNPJ: 0,
    semCNPJ: 0,
    percentualSemCNPJ: 0,
    porVendedor: []
  });
  const [orcamentosSemCNPJ, setOrcamentosSemCNPJ] = useState([]);

  useEffect(() => {
    if (!podeAcessarLancamento()) {
      navigate('/orcamentos');
      return;
    }
    carregarDados();
  }, [periodo]);

  const carregarDados = async () => {
    try {
      setLoading(true);

      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

      // Busca todos os orçamentos do período
      const { data: orcamentos, error: errorOrc } = await supabase
        .from('orcamentos')
        .select('*')
        .gte('created_at', dataInicio.toISOString())
        .neq('status', 'cancelado')
        .order('created_at', { ascending: false });

      if (errorOrc) {
        console.error('Erro ao carregar orçamentos:', errorOrc);
        throw errorOrc;
      }

      // Calcula estatísticas
      const total = orcamentos?.length || 0;
      const semCNPJ = orcamentos?.filter(o => o.cnpj_cpf_nao_informado === true) || [];
      const comCNPJ = orcamentos?.filter(o => o.cnpj_cpf_nao_informado !== true) || [];

      // Agrupa por vendedor
      const porVendedor = {};
      orcamentos?.forEach(orc => {
        const vendedor = orc.vendedor || 'Não informado';
        if (!porVendedor[vendedor]) {
          porVendedor[vendedor] = {
            nome: vendedor,
            total: 0,
            semCNPJ: 0,
            comCNPJ: 0
          };
        }
        porVendedor[vendedor].total++;
        if (orc.cnpj_cpf_nao_informado) {
          porVendedor[vendedor].semCNPJ++;
        } else {
          porVendedor[vendedor].comCNPJ++;
        }
      });

      const vendedoresArray = Object.values(porVendedor)
        .sort((a, b) => b.semCNPJ - a.semCNPJ);

      setEstatisticas({
        totalOrcamentos: total,
        comCNPJ: comCNPJ.length,
        semCNPJ: semCNPJ.length,
        percentualSemCNPJ: total > 0 ? ((semCNPJ.length / total) * 100).toFixed(1) : 0,
        porVendedor: vendedoresArray
      });

      setOrcamentosSemCNPJ(semCNPJ);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const exportarCSV = () => {
    const csv = [
      ['Número', 'Cliente', 'Vendedor', 'Status', 'Cidade', 'Bairro', 'Data', 'Valor'].join(';'),
      ...orcamentosSemCNPJ.map(orc => [
        orc.numero,
        orc.cliente_nome || 'Não informado',
        orc.vendedor || 'Não informado',
        orc.status,
        orc.obra_cidade || '-',
        orc.obra_bairro || '-',
        formatarDataExibicao(orc.created_at),
        orc.total || 0
      ].join(';'))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orcamentos_sem_cnpj_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (!podeAcessarLancamento()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ========================================
            HEADER DA PÁGINA
            ======================================== */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                📊 Relatório de Concorrência Interna
              </h1>
              <p className="text-gray-600 mt-1">
                Análise de orçamentos sem CNPJ/CPF informado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="180">Últimos 180 dias</option>
                <option value="365">Último ano</option>
              </select>
              <button
                onClick={exportarCSV}
                disabled={orcamentosSemCNPJ.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={20} />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Carregando...</div>
        ) : (
          <>
            {/* ========================================
                CARDS DE ESTATÍSTICAS (4 CARDS)
                ⚠️ MODIFICAÇÃO: Card 4 foi substituído
                ======================================== */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              
              {/* ==========================================
                  CARD 1: TOTAL DE ORÇAMENTOS
                  ========================================== */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Orçamentos</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {estatisticas.totalOrcamentos}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileText className="text-blue-600" size={24} />
                  </div>
                </div>
              </div>

              {/* ==========================================
                  CARD 2: COM CNPJ/CPF
                  ========================================== */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Com CNPJ/CPF</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                      {estatisticas.comCNPJ}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <BarChart3 className="text-green-600" size={24} />
                  </div>
                </div>
              </div>

              {/* ==========================================
                  CARD 3: SEM CNPJ/CPF
                  ========================================== */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sem CNPJ/CPF</p>
                    <p className="text-3xl font-bold text-yellow-600 mt-1">
                      {estatisticas.semCNPJ}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <AlertTriangle className="text-yellow-600" size={24} />
                  </div>
                </div>
              </div>

              {/* ==========================================
                  CARD 4: CONFLITOS INTERNOS
                  ⚠️ NOVO COMPONENTE - ADICIONADO EM 15/01/2026
                  
                  📝 O QUE FAZ:
                  - Conta conflitos de concorrência interna
                  - Mostra número de grupos com múltiplos vendedores
                  - Clicável: redireciona para /conflitos
                  - Verde: 0 conflitos / Laranja: tem conflitos
                  
                  📂 ARQUIVO: src/components/CardConflitosInternos.jsx
                  
                  🔄 SUBSTITUIU:
                  Antigamente aqui tinha um card com "% Sem CNPJ"
                  que mostrava estatisticas.percentualSemCNPJ
                  
                  💡 PARA REVERTER (se precisar):
                  Descomente o código abaixo e comente o <CardConflitosInternos />
                  ========================================== */}
              
              <CardConflitosInternos />

              {/* 
              ⬇️ CÓDIGO ANTIGO - COMENTADO PARA REFERÊNCIA FUTURA
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">% Sem CNPJ/CPF</p>
                    <p className="text-3xl font-bold text-orange-600 mt-1">
                      {estatisticas.percentualSemCNPJ}%
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <TrendingUp className="text-orange-600" size={24} />
                  </div>
                </div>
              </div>
              */}

            </div>
            {/* FIM DOS CARDS DE ESTATÍSTICAS */}

            {/* ========================================
                TABELA POR VENDEDOR
                ======================================== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} />
                Estatísticas por Vendedor
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                        Vendedor
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                        Total
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                        Com CNPJ/CPF
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                        Sem CNPJ/CPF
                      </th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">
                        % Sem CNPJ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {estatisticas.porVendedor.map((vendedor, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {vendedor.nome}
                        </td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">
                          {vendedor.total}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                            {vendedor.comCNPJ}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                            {vendedor.semCNPJ}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                            ((vendedor.semCNPJ / vendedor.total) * 100) > 50
                              ? 'bg-red-100 text-red-700'
                              : ((vendedor.semCNPJ / vendedor.total) * 100) > 25
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {((vendedor.semCNPJ / vendedor.total) * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========================================
                LISTA DE ORÇAMENTOS SEM CNPJ/CPF
                ======================================== */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={20} className="text-yellow-600" />
                Orçamentos sem CNPJ/CPF ({orcamentosSemCNPJ.length})
              </h2>

              {orcamentosSemCNPJ.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  🎉 Nenhum orçamento sem CNPJ/CPF no período selecionado
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Número
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Vendedor
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                          Localização
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          Data
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">
                          Valor
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orcamentosSemCNPJ.map((orc) => (
                        <tr key={orc.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {orc.numero}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {orc.cliente_nome || 'Não informado'}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {orc.vendedor || 'Não informado'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              orc.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                              orc.status === 'enviado' ? 'bg-blue-100 text-blue-700' :
                              orc.status === 'rejeitado' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {orc.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {orc.obra_cidade || '-'}
                            {orc.obra_bairro && ` - ${orc.obra_bairro}`}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            {formatarDataExibicao(orc.created_at)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(orc.total || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => navigate(`/orcamentos/editar/${orc.id}`)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Ver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/*
================================================================================
📝 NOTAS IMPORTANTES PARA O FUTURO:
================================================================================

1. 🔄 MODIFICAÇÃO PRINCIPAL (15/01/2026):
   - Card 4 foi substituído de "% Sem CNPJ" para "Conflitos Internos"
   - Componente usado: <CardConflitosInternos />
   - Localização: Linha ~180 (aproximadamente)

2. 📂 ARQUIVOS RELACIONADOS:
   - src/components/CardConflitosInternos.jsx (novo componente)
   - src/pages/Conflitos.jsx (página dedicada de conflitos)
   - src/utils/concorrenciaUtils.js (funções de verificação)

3. 🗄️ BANCO DE DADOS:
   - Tabela: conflitos_ignorados (para arquivar conflitos)
   - Migration: migration_conflitos_ignorados.sql

4. 🔗 NAVEGAÇÃO:
   - O card é clicável e redireciona para: /conflitos
   - Rota deve ser adicionada no arquivo de rotas

5. ⚠️ SE PRECISAR REVERTER:
   - Descomente o código antigo (linha ~183 - comentado)
   - Comente ou remova a linha: <CardConflitosInternos />

6. 🐛 TROUBLESHOOTING:
   - Se card não aparecer: verifique se o componente foi criado em src/components/
   - Se der erro de import: verifique o caminho do import (linha 23)
   - Se clicar e não navegar: verifique se a rota /conflitos foi adicionada

================================================================================
*/