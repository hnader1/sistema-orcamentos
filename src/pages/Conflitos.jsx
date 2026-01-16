// src/pages/Conflitos.jsx
// ============================================================================
// 📄 PÁGINA: Gerenciamento de Conflitos de Concorrência Interna
// ============================================================================
// 🎯 FUNÇÃO: 
// - Visualizar grupos de orçamentos com múltiplos vendedores
// - Arquivar conflitos que não precisam mais de atenção
// - Restaurar conflitos arquivados
// - Navegar para orçamentos específicos
//
// 📅 CRIADO EM: 16/01/2026
// 🔗 ROTA: /conflitos
// 👥 ACESSO: Apenas administradores
//
// 💡 COMO FUNCIONA:
// 1. Busca todos os orçamentos ativos (últimos 180 dias)
// 2. Busca itens de cada orçamento (produtos)
// 3. Agrupa por CNPJ (conflito crítico - vermelho)
// 4. Agrupa por Localização (conflito atenção - amarelo)
// 5. Exclui conflitos que foram arquivados
// 6. Permite arquivar/restaurar conflitos
//
// 🗄️ TABELAS USADAS:
// - orcamentos (orçamentos principais)
// - orcamentos_itens (produtos de cada orçamento)
// - usuarios (nome dos vendedores)
// - conflitos_ignorados (conflitos arquivados)
//
// 📦 COMPONENTES USADOS:
// - Header (cabeçalho da página)
// - Ícones do lucide-react
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle,    // ⚠️ Ícone de alerta
  Eye,              // 👁️ Ícone de visualizar
  ChevronDown,      // ▼ Seta para baixo (expandir)
  ChevronUp,        // ▲ Seta para cima (recolher)
  Users,            // 👥 Ícone de usuários
  MapPin,           // 📍 Ícone de localização
  FileText,         // 📄 Ícone de documento
  Archive,          // 📦 Ícone de arquivar
  ArchiveRestore    // 🔄 Ícone de restaurar
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const Conflitos = () => {
  // ==========================================================================
  // 🔧 HOOKS E ESTADOS
  // ==========================================================================
  const navigate = useNavigate();
  const { user } = useAuth(); // Usuário logado (para saber quem arquivou)
  
  // Estados principais
  const [conflitos, setConflitos] = useState([]);                    // Lista de conflitos ativos
  const [conflitosIgnorados, setConflitosIgnorados] = useState([]);  // Lista de conflitos arquivados
  const [loading, setLoading] = useState(true);                      // Estado de carregamento
  const [gruposExpandidos, setGruposExpandidos] = useState({});      // Controla quais grupos estão expandidos
  const [mostrarIgnorados, setMostrarIgnorados] = useState(false);   // Toggle: mostrar ativos ou arquivados

  // ==========================================================================
  // ⚙️ EFFECT: Carrega dados quando a página abre
  // ==========================================================================
  useEffect(() => {
    carregarConflitos();
  }, []);

  // ==========================================================================
  // 📥 FUNÇÃO: Carregar Conflitos
  // ==========================================================================
  // Esta é a função PRINCIPAL que busca e organiza todos os dados
  // 
  // PASSO A PASSO:
  // 1. Busca orçamentos dos últimos 180 dias (exceto cancelados)
  // 2. Para cada orçamento, busca os produtos (itens)
  // 3. Busca conflitos que foram arquivados
  // 4. Agrupa orçamentos por CNPJ e Localização
  // 5. Identifica quais grupos têm múltiplos vendedores
  // 6. Remove grupos que foram arquivados
  // ==========================================================================
  const carregarConflitos = async () => {
    try {
      setLoading(true);

      // ----------------------------------------------------------------------
      // 1️⃣ BUSCAR ORÇAMENTOS ATIVOS
      // ----------------------------------------------------------------------
      // Data de corte: 180 dias atrás
      const data180DiasAtras = new Date();
      data180DiasAtras.setDate(data180DiasAtras.getDate() - 180);

      // Query principal: busca orçamentos com join de usuários
      const { data: orcamentos, error } = await supabase
        .from('orcamentos')
        .select(`
          id,
          numero,
          cliente_nome,
          cliente_empresa,
          cnpj_cpf,
          obra_cidade,
          obra_bairro,
          status,
          total,
          created_at,
          usuario_id,
          usuarios!orcamentos_usuario_id_fkey(nome)
        `)
        .gte('created_at', data180DiasAtras.toISOString())
        .in('status', ['rascunho', 'enviado', 'aprovado', 'lancado']) // ⚠️ Inclui "lancado"!
        .order('created_at', { ascending: false });

      if (error) throw error;

      // ----------------------------------------------------------------------
      // 2️⃣ BUSCAR ITENS (PRODUTOS) DE CADA ORÇAMENTO
      // ----------------------------------------------------------------------
      // Para cada orçamento, busca seus produtos para exibir no card
      const orcamentosComItens = await Promise.all(
        orcamentos.map(async (orc) => {
          const { data: itens } = await supabase
            .from('orcamentos_itens')
            .select('produto, classe, mpa, quantidade')
            .eq('orcamento_id', orc.id);
          
          return { ...orc, itens: itens || [] };
        })
      );

      // ----------------------------------------------------------------------
      // 3️⃣ BUSCAR CONFLITOS ARQUIVADOS
      // ----------------------------------------------------------------------
      const { data: ignorados } = await supabase
        .from('conflitos_ignorados')
        .select('*')
        .order('created_at', { ascending: false });

      setConflitosIgnorados(ignorados || []);

      // Criar Set de chaves ignoradas para filtrar depois
      // Formato: "CNPJ:12.345.678/0001-90" ou "LOCALIZACAO:Belo Horizonte|Centro"
      const chavesIgnoradas = new Set(
        (ignorados || []).map(i => `${i.tipo}:${i.chave_conflito}`)
      );

      // ----------------------------------------------------------------------
      // 4️⃣ AGRUPAR E IDENTIFICAR CONFLITOS
      // ----------------------------------------------------------------------
      const grupos = agruparConflitos(orcamentosComItens, chavesIgnoradas);
      setConflitos(grupos);

    } catch (error) {
      console.error('❌ Erro ao carregar conflitos:', error);
      alert('Erro ao carregar conflitos. Verifique o console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // 📊 FUNÇÃO: Agrupar Conflitos
  // ==========================================================================
  // Recebe lista de orçamentos e retorna grupos de conflitos
  //
  // LÓGICA:
  // 1. Agrupa por CNPJ (mesmo cliente)
  // 2. Se 2+ vendedores para mesmo CNPJ = CONFLITO CRÍTICO 🔴
  // 3. Agrupa por Localização (cidade + bairro)
  // 4. Se 2+ vendedores na mesma localização = CONFLITO ATENÇÃO 🟡
  // 5. Remove conflitos que foram arquivados
  // 6. Ordena: críticos primeiro, depois por qtd de vendedores
  // ==========================================================================
  const agruparConflitos = (orcamentos, chavesIgnoradas) => {
    const grupos = [];

    // --------------------------------------------------------------------------
    // PARTE 1: CONFLITOS POR CNPJ (CRÍTICO - VERMELHO)
    // --------------------------------------------------------------------------
    const porCNPJ = {};
    
    // Agrupa orçamentos pelo CNPJ
    orcamentos.forEach(orc => {
      if (orc.cnpj_cpf) {
        if (!porCNPJ[orc.cnpj_cpf]) {
          porCNPJ[orc.cnpj_cpf] = [];
        }
        porCNPJ[orc.cnpj_cpf].push(orc);
      }
    });

    // Para cada CNPJ, verifica se tem múltiplos vendedores
    Object.entries(porCNPJ).forEach(([cnpj, orcs]) => {
      const vendedoresUnicos = new Set(orcs.map(o => o.usuario_id));
      
      // Se tem 2 ou mais vendedores = CONFLITO!
      if (vendedoresUnicos.size > 1 && !chavesIgnoradas.has(`CNPJ:${cnpj}`)) {
        grupos.push({
          id: `cnpj-${cnpj}`,
          tipo: 'CNPJ',
          nivel: 'CRITICO',
          chave: cnpj,
          titulo: `CNPJ: ${formatarCNPJ(cnpj)}`,
          orcamentos: orcs,
          totalVendedores: vendedoresUnicos.size
        });
      }
    });

    // --------------------------------------------------------------------------
    // PARTE 2: CONFLITOS POR LOCALIZAÇÃO (ATENÇÃO - AMARELO)
    // --------------------------------------------------------------------------
    // Primeiro, cria Set de CNPJs que já têm conflito
    // (para não duplicar: se já tem conflito de CNPJ, não precisa alertar por localização)
    const cnpjsConflitantes = new Set(
      Object.entries(porCNPJ)
        .filter(([, orcs]) => new Set(orcs.map(o => o.usuario_id)).size > 1)
        .map(([cnpj]) => cnpj)
    );

    const porLocalizacao = {};
    
    // Agrupa orçamentos por localização (cidade + bairro)
    // Exclui os que já têm conflito de CNPJ
    orcamentos
      .filter(orc => !cnpjsConflitantes.has(orc.cnpj_cpf))
      .forEach(orc => {
        if (orc.obra_cidade && orc.obra_bairro) {
          const chave = `${orc.obra_cidade}|${orc.obra_bairro}`;
          if (!porLocalizacao[chave]) {
            porLocalizacao[chave] = [];
          }
          porLocalizacao[chave].push(orc);
        }
      });

    // Para cada localização, verifica se tem múltiplos vendedores
    Object.entries(porLocalizacao).forEach(([chave, orcs]) => {
      const vendedoresUnicos = new Set(orcs.map(o => o.usuario_id));
      
      // Se tem 2 ou mais vendedores = CONFLITO!
      if (vendedoresUnicos.size > 1 && !chavesIgnoradas.has(`LOCALIZACAO:${chave}`)) {
        const [cidade, bairro] = chave.split('|');
        grupos.push({
          id: `loc-${chave}`,
          tipo: 'LOCALIZACAO',
          nivel: 'ATENCAO',
          chave,
          titulo: `${cidade} - ${bairro}`,
          orcamentos: orcs,
          totalVendedores: vendedoresUnicos.size
        });
      }
    });

    // --------------------------------------------------------------------------
    // PARTE 3: ORDENAR GRUPOS
    // --------------------------------------------------------------------------
    // Críticos primeiro, depois por quantidade de vendedores
    return grupos.sort((a, b) => {
      if (a.nivel !== b.nivel) {
        return a.nivel === 'CRITICO' ? -1 : 1;
      }
      return b.totalVendedores - a.totalVendedores;
    });
  };

  // ==========================================================================
  // 🗄️ FUNÇÃO: Arquivar Conflito
  // ==========================================================================
  // Quando o admin clica em "Arquivar", este conflito some da lista ativa
  // e vai para a lista de arquivados
  //
  // PARÂMETROS:
  // - grupo: objeto com informações do conflito (tipo, chave, orcamentos)
  //
  // O QUE FAZ:
  // 1. Pede confirmação
  // 2. Insere registro na tabela conflitos_ignorados
  // 3. Recarrega a página
  // ==========================================================================
  const ignorarConflito = async (grupo) => {
    // Confirmação antes de arquivar
    if (!confirm(`Deseja arquivar este conflito? Ele não aparecerá mais na lista de conflitos ativos.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('conflitos_ignorados')
        .insert({
          tipo: grupo.tipo,                           // 'CNPJ' ou 'LOCALIZACAO'
          chave_conflito: grupo.chave,                // CNPJ ou "cidade|bairro"
          orcamento_ids: grupo.orcamentos.map(o => o.id),  // Array de IDs
          ignorado_por: user?.id                      // Quem arquivou
        });

      if (error) throw error;

      alert('✅ Conflito arquivado com sucesso!');
      carregarConflitos(); // Recarrega a lista
      
    } catch (error) {
      console.error('❌ Erro ao arquivar conflito:', error);
      alert('Erro ao arquivar conflito. Verifique o console.');
    }
  };

  // ==========================================================================
  // 🔄 FUNÇÃO: Restaurar Conflito
  // ==========================================================================
  // Quando o admin clica em "Restaurar", o conflito volta para a lista ativa
  //
  // PARÂMETROS:
  // - ignorado: registro da tabela conflitos_ignorados
  //
  // O QUE FAZ:
  // 1. Pede confirmação
  // 2. Deleta registro da tabela conflitos_ignorados
  // 3. Recarrega a página
  // ==========================================================================
  const restaurarConflito = async (ignorado) => {
    if (!confirm('Deseja restaurar este conflito? Ele voltará a aparecer na lista ativa.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('conflitos_ignorados')
        .delete()
        .eq('id', ignorado.id);

      if (error) throw error;

      alert('✅ Conflito restaurado!');
      carregarConflitos(); // Recarrega a lista
      
    } catch (error) {
      console.error('❌ Erro ao restaurar conflito:', error);
      alert('Erro ao restaurar conflito. Verifique o console.');
    }
  };

  // ==========================================================================
  // 🔧 FUNÇÕES AUXILIARES (Formatação e Navegação)
  // ==========================================================================

  // Formata CNPJ: 12345678000190 → 12.345.678/0001-90
  const formatarCNPJ = (cnpj) => {
    const nums = cnpj.replace(/\D/g, '');
    if (nums.length === 14) {
      return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  };

  // Formata lista de produtos: "50 un Bloco + 20 un Tijolo +2 mais"
  const formatarProdutos = (itens) => {
    if (!itens || itens.length === 0) return 'Sem produtos';
    
    const resumo = itens.slice(0, 3).map(item => 
      `${item.quantidade} un ${item.produto}`
    ).join(' + ');
    
    if (itens.length > 3) {
      return `${resumo} +${itens.length - 3} mais`;
    }
    return resumo;
  };

  // Expande/recolhe um grupo de conflitos
  const toggleGrupo = (grupoId) => {
    setGruposExpandidos(prev => ({ 
      ...prev, 
      [grupoId]: !prev[grupoId] 
    }));
  };

  // Navega para a página de edição do orçamento
  const verOrcamento = (orcamentoId) => {
    navigate(`/orcamentos/editar/${orcamentoId}`);
  };

  // ==========================================================================
  // 🎨 RENDERIZAÇÃO - Estado de Loading
  // ==========================================================================
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Carregando conflitos...</div>
        </div>
      </>
    );
  }

  // ==========================================================================
  // 🎨 RENDERIZAÇÃO PRINCIPAL
  // ==========================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* ====================================================================
            HEADER DA PÁGINA
            ==================================================================== */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            
            {/* Título e Estatísticas */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="text-orange-600" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Conflitos de Concorrência Interna
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {conflitos.length} conflito(s) ativo(s) · {conflitosIgnorados.length} arquivado(s)
                </p>
              </div>
            </div>

            {/* Botão Toggle: Ver Ativos / Ver Arquivados */}
            <button
              onClick={() => setMostrarIgnorados(!mostrarIgnorados)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {mostrarIgnorados ? (
                <>
                  <AlertTriangle size={18} />
                  Ver Ativos
                </>
              ) : (
                <>
                  <Archive size={18} />
                  Ver Arquivados ({conflitosIgnorados.length})
                </>
              )}
            </button>
          </div>
        </div>

        {/* ====================================================================
            CONFLITOS ATIVOS
            ==================================================================== */}
        {!mostrarIgnorados && (
          <>
            {/* Nenhum conflito - Mensagem de Sucesso */}
            {conflitos.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                  <AlertTriangle className="text-green-600" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  🎉 Nenhum conflito ativo!
                </h3>
                <p className="text-gray-600">
                  Últimos 180 dias analisados - Tudo certo!
                </p>
              </div>
            ) : (
              /* Lista de Grupos de Conflitos */
              <div className="space-y-4">
                {conflitos.map((grupo) => (
                  <div
                    key={grupo.id}
                    className={`border-2 rounded-lg overflow-hidden ${
                      grupo.nivel === 'CRITICO'
                        ? 'border-red-200 bg-red-50'
                        : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    {/* --------------------------------------------------------
                        HEADER DO GRUPO
                        -------------------------------------------------------- */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        
                        {/* Título e Info do Grupo - Clicável para Expandir */}
                        <div
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                          onClick={() => toggleGrupo(grupo.id)}
                        >
                          <span className="text-2xl">
                            {grupo.nivel === 'CRITICO' ? '🔴' : '🟡'}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-bold ${
                                grupo.nivel === 'CRITICO' ? 'text-red-900' : 'text-yellow-900'
                              }`}>
                                {grupo.tipo === 'CNPJ' ? 'Mesmo Cliente' : 'Mesma Localização'}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                grupo.nivel === 'CRITICO'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-yellow-200 text-yellow-800'
                              }`}>
                                {grupo.totalVendedores} vendedores
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${
                              grupo.nivel === 'CRITICO' ? 'text-red-700' : 'text-yellow-700'
                            }`}>
                              {grupo.titulo}
                            </p>
                          </div>
                          
                          {/* Contador e Seta */}
                          <div className="flex items-center gap-4">
                            <span className={`text-sm font-medium ${
                              grupo.nivel === 'CRITICO' ? 'text-red-700' : 'text-yellow-700'
                            }`}>
                              {grupo.orcamentos.length} orçamentos
                            </span>
                            {gruposExpandidos[grupo.id] ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </div>
                        </div>

                        {/* Botão Arquivar */}
                        <button
                          onClick={() => ignorarConflito(grupo)}
                          className="ml-4 p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                          title="Arquivar conflito"
                        >
                          <Archive size={20} />
                        </button>
                      </div>
                    </div>

                    {/* --------------------------------------------------------
                        CONTEÚDO EXPANDIDO - CARDS DE ORÇAMENTOS
                        -------------------------------------------------------- */}
                    {gruposExpandidos[grupo.id] && (
                      <div className="border-t border-gray-200 bg-white p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          
                          {/* Loop: Card para cada orçamento do grupo */}
                          {grupo.orcamentos.map((orc) => (
                            <div
                              key={orc.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                            >
                              {/* Header do Card */}
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">
                                      {orc.numero}
                                    </span>
                                    {/* Badge de Status */}
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                      orc.status === 'lancado' ? 'bg-purple-100 text-purple-700' :
                                      orc.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                                      orc.status === 'enviado' ? 'bg-blue-100 text-blue-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {orc.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">
                                    {orc.cliente_nome || 'Sem nome'}
                                  </p>
                                </div>
                              </div>

                              {/* Informações do Orçamento */}
                              <div className="space-y-2 text-sm">
                                
                                {/* Vendedor */}
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-gray-400" />
                                  <span className="text-gray-700 font-medium">
                                    {orc.usuarios?.nome || 'Vendedor não informado'}
                                  </span>
                                </div>

                                {/* CNPJ */}
                                {orc.cnpj_cpf && (
                                  <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-gray-400" />
                                    <span className="text-gray-600 text-xs">
                                      {formatarCNPJ(orc.cnpj_cpf)}
                                    </span>
                                  </div>
                                )}

                                {/* Localização */}
                                {orc.obra_cidade && (
                                  <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span className="text-gray-600 text-xs">
                                      {orc.obra_cidade}
                                      {orc.obra_bairro && ` - ${orc.obra_bairro}`}
                                    </span>
                                  </div>
                                )}

                                {/* Produtos */}
                                <div className="pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Produtos:</p>
                                  <p className="text-xs text-gray-700">
                                    {formatarProdutos(orc.itens)}
                                  </p>
                                </div>
                              </div>

                              {/* Botão Ver Detalhes */}
                              <button
                                onClick={() => verOrcamento(orc.id)}
                                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                <Eye size={16} />
                                Ver Detalhes
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ====================================================================
            CONFLITOS ARQUIVADOS
            ==================================================================== */}
        {mostrarIgnorados && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Conflitos Arquivados</h2>
            
            {conflitosIgnorados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum conflito arquivado
              </p>
            ) : (
              <div className="space-y-3">
                {conflitosIgnorados.map((ignorado) => (
                  <div
                    key={ignorado.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {ignorado.tipo === 'CNPJ' 
                          ? '🔴 Conflito por CNPJ' 
                          : '🟡 Conflito por Localização'
                        }
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {ignorado.tipo === 'CNPJ' 
                          ? formatarCNPJ(ignorado.chave_conflito)
                          : ignorado.chave_conflito.replace('|', ' - ')
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Arquivado em: {new Date(ignorado.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    
                    {/* Botão Restaurar */}
                    <button
                      onClick={() => restaurarConflito(ignorado)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ArchiveRestore size={18} />
                      Restaurar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Conflitos;

// ============================================================================
// 📝 NOTAS IMPORTANTES PARA O FUTURO
// ============================================================================
//
// 🔧 MANUTENÇÃO:
// - Para mudar o período de análise (180 dias): linha 112
// - Para adicionar novos status: linha 129 (array de status)
// - Para mudar cores dos conflitos: procure por "bg-red-" e "bg-yellow-"
//
// 🐛 TROUBLESHOOTING COMUM:
// 1. "Nenhum conflito aparece":
//    - Verificar se há orçamentos nos últimos 180 dias
//    - Verificar se os orçamentos têm CNPJ ou cidade+bairro preenchidos
//    - Verificar se os orçamentos têm vendedores diferentes
//
// 2. "Erro ao arquivar":
//    - Verificar se tabela conflitos_ignorados existe
//    - Verificar RLS policies da tabela
//    - Verificar se user.id está disponível
//
// 3. "Botão Ver Detalhes não funciona":
//    - Verificar se rota /orcamentos/editar/:id existe
//    - Verificar permissões do usuário
//
// 🔄 FUNCIONALIDADES:
// - Arquivar: Move conflito para lista de arquivados
// - Restaurar: Volta conflito para lista ativa
// - Expandir/Recolher: Mostra/esconde cards de orçamentos
// - Ver Detalhes: Abre orçamento para edição
//
// 📊 TIPOS DE CONFLITO:
// - CRÍTICO (🔴): Mesmo CNPJ - mesmo cliente
// - ATENÇÃO (🟡): Mesma localização - possível obra por administração
//
// ⚙️ COMO FUNCIONA O AGRUPAMENTO:
// 1. Busca todos os orçamentos ativos
// 2. Agrupa por CNPJ
// 3. Se 2+ vendedores → conflito crítico
// 4. Agrupa por cidade+bairro (excluindo os que já têm conflito de CNPJ)
// 5. Se 2+ vendedores → conflito atenção
// 6. Remove conflitos arquivados
//
// 🗄️ ESTRUTURA DO BANCO:
// conflitos_ignorados:
// - id (uuid)
// - tipo ('CNPJ' ou 'LOCALIZACAO')
// - chave_conflito (CNPJ ou "cidade|bairro")
// - orcamento_ids (array de IDs)
// - ignorado_por (uuid do usuário)
// - created_at (timestamp)
//
// ============================================================================