// src/pages/Conflitos.jsx
// ============================================================================
// 📄 PÁGINA: Gerenciamento de Conflitos de Concorrência Interna
// ============================================================================
// 🎯 FUNÇÃO: 
// - Visualizar grupos de orçamentos com múltiplos vendedores
// - Arquivar conflitos inteiros (grupo) ou orçamentos individuais
// - Restaurar conflitos arquivados
// - Navegar para orçamentos específicos
//
// 📅 CRIADO EM: 16/01/2026
// 📅 ATUALIZADO EM: 16/01/2026 - Adicionados botões individuais de arquivar
// 🔗 ROTA: /conflitos
// 👥 ACESSO: Apenas administradores
//
// ⭐ NOVIDADES:
// - Botão para arquivar grupo inteiro (header do grupo)
// - Botão para arquivar orçamento individual (cada card)
// - Quando sobra apenas 1 orçamento no grupo, o grupo some automaticamente
//
// 💡 COMO FUNCIONA:
// 1. Busca todos os orçamentos ativos (últimos 180 dias)
// 2. Busca itens de cada orçamento (produtos)
// 3. Agrupa por CNPJ (conflito crítico - vermelho)
// 4. Agrupa por Localização NORMALIZADA (conflito atenção - amarelo)
// 5. Exclui conflitos que foram arquivados
// 6. Permite arquivar/restaurar conflitos
//
// 🗄️ TABELAS USADAS:
// - orcamentos (orçamentos principais)
// - orcamentos_itens (produtos de cada orçamento)
// - usuarios (nome dos vendedores)
// - conflitos_ignorados (conflitos arquivados)
// - orcamentos_ignorados (orçamentos individuais arquivados) ← NOVA!
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
  ArchiveRestore,   // 🔄 Ícone de restaurar
  XCircle           // ❌ Ícone de remover individual
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';

const Conflitos = () => {
  // ==========================================================================
  // 🔧 HOOKS E ESTADOS
  // ==========================================================================
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conflitos, setConflitos] = useState([]);
  const [conflitosIgnorados, setConflitosIgnorados] = useState([]);
  const [orcamentosIgnorados, setOrcamentosIgnorados] = useState([]); // ⭐ NOVO
  const [loading, setLoading] = useState(true);
  const [gruposExpandidos, setGruposExpandidos] = useState({});
  const [mostrarIgnorados, setMostrarIgnorados] = useState(false);

  // ==========================================================================
  // ⚙️ EFFECT: Carrega dados quando a página abre
  // ==========================================================================
  useEffect(() => {
    carregarConflitos();
  }, []);

  // ==========================================================================
  // 📥 FUNÇÃO: Carregar Conflitos
  // ==========================================================================
  const carregarConflitos = async () => {
    try {
      setLoading(true);

      const data180DiasAtras = new Date();
      data180DiasAtras.setDate(data180DiasAtras.getDate() - 180);

      // ----------------------------------------------------------------------
      // 1️⃣ BUSCAR ORÇAMENTOS ATIVOS
      // ----------------------------------------------------------------------
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
        .in('status', ['rascunho', 'enviado', 'aprovado', 'lancado'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // ----------------------------------------------------------------------
      // 2️⃣ BUSCAR ITENS (PRODUTOS)
      // ----------------------------------------------------------------------
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
      // 3️⃣ BUSCAR CONFLITOS ARQUIVADOS (GRUPOS)
      // ----------------------------------------------------------------------
      const { data: ignorados } = await supabase
        .from('conflitos_ignorados')
        .select('*')
        .order('created_at', { ascending: false });

      setConflitosIgnorados(ignorados || []);

      const chavesIgnoradas = new Set(
        (ignorados || []).map(i => `${i.tipo}:${i.chave_conflito}`)
      );

      // ----------------------------------------------------------------------
      // 4️⃣ BUSCAR ORÇAMENTOS ARQUIVADOS INDIVIDUALMENTE ⭐ NOVO
      // ----------------------------------------------------------------------
      const { data: orcsIgnorados } = await supabase
        .from('orcamentos_ignorados')
        .select('orcamento_id');

      setOrcamentosIgnorados(orcsIgnorados || []);
      
      const idsIgnorados = new Set(
        (orcsIgnorados || []).map(o => o.orcamento_id)
      );

      // Filtrar orçamentos individuais ignorados
      const orcamentosFiltrados = orcamentosComItens.filter(
        orc => !idsIgnorados.has(orc.id)
      );

      // ----------------------------------------------------------------------
      // 5️⃣ AGRUPAR E IDENTIFICAR CONFLITOS
      // ----------------------------------------------------------------------
      const grupos = agruparConflitos(orcamentosFiltrados, chavesIgnoradas);
      setConflitos(grupos);

    } catch (error) {
      console.error('❌ Erro ao carregar conflitos:', error);
      alert('Erro ao carregar conflitos. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // 📊 FUNÇÃO: Agrupar Conflitos
  // ==========================================================================
  const agruparConflitos = (orcamentos, chavesIgnoradas) => {
    const grupos = [];

    // PARTE 1: CONFLITOS POR CNPJ
    const porCNPJ = {};
    
    orcamentos.forEach(orc => {
      if (orc.cnpj_cpf) {
        if (!porCNPJ[orc.cnpj_cpf]) {
          porCNPJ[orc.cnpj_cpf] = [];
        }
        porCNPJ[orc.cnpj_cpf].push(orc);
      }
    });

    Object.entries(porCNPJ).forEach(([cnpj, orcs]) => {
      const vendedoresUnicos = new Set(orcs.map(o => o.usuario_id));
      
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

    // PARTE 2: CONFLITOS POR LOCALIZAÇÃO
    const cnpjsConflitantes = new Set(
      Object.entries(porCNPJ)
        .filter(([, orcs]) => new Set(orcs.map(o => o.usuario_id)).size > 1)
        .map(([cnpj]) => cnpj)
    );

    const porLocalizacao = {};
    
    orcamentos
      .filter(orc => !cnpjsConflitantes.has(orc.cnpj_cpf))
      .forEach(orc => {
        if (orc.obra_cidade && orc.obra_bairro) {
          const cidadeNormalizada = orc.obra_cidade.toLowerCase().trim();
          const bairroNormalizado = orc.obra_bairro.toLowerCase().trim();
          const chave = `${cidadeNormalizada}|${bairroNormalizado}`;
          
          if (!porLocalizacao[chave]) {
            porLocalizacao[chave] = {
              cidade: orc.obra_cidade,
              bairro: orc.obra_bairro,
              orcamentos: []
            };
          }
          porLocalizacao[chave].orcamentos.push(orc);
        }
      });

    Object.entries(porLocalizacao).forEach(([chave, dados]) => {
      const vendedoresUnicos = new Set(dados.orcamentos.map(o => o.usuario_id));
      
      if (vendedoresUnicos.size > 1 && !chavesIgnoradas.has(`LOCALIZACAO:${chave}`)) {
        grupos.push({
          id: `loc-${chave}`,
          tipo: 'LOCALIZACAO',
          nivel: 'ATENCAO',
          chave,
          titulo: `${dados.cidade} - ${dados.bairro}`,
          orcamentos: dados.orcamentos,
          totalVendedores: vendedoresUnicos.size
        });
      }
    });

    return grupos.sort((a, b) => {
      if (a.nivel !== b.nivel) {
        return a.nivel === 'CRITICO' ? -1 : 1;
      }
      return b.totalVendedores - a.totalVendedores;
    });
  };

  // ==========================================================================
  // 🗄️ FUNÇÃO: Arquivar GRUPO Completo
  // ==========================================================================
  const ignorarGrupo = async (grupo) => {
    if (!confirm(`Deseja arquivar TODOS os ${grupo.orcamentos.length} orçamentos deste grupo?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('conflitos_ignorados')
        .insert({
          tipo: grupo.tipo,
          chave_conflito: grupo.chave,
          orcamento_ids: grupo.orcamentos.map(o => o.id),
          ignorado_por: user?.id
        });

      if (error) throw error;

      alert('✅ Grupo arquivado com sucesso!');
      carregarConflitos();
      
    } catch (error) {
      console.error('❌ Erro ao arquivar grupo:', error);
      alert('Erro ao arquivar grupo. Verifique o console.');
    }
  };

  // ==========================================================================
  // 📦 FUNÇÃO: Arquivar ORÇAMENTO Individual ⭐ NOVO
  // ==========================================================================
  const ignorarOrcamento = async (orcamento, grupo) => {
  if (!confirm(`Deseja arquivar apenas o orçamento ${orcamento.numero}?`)) {
    return;
  }

  try {
    console.log('🔄 Tentando arquivar orçamento:', orcamento.id);
    console.log('📝 Tipo conflito:', grupo.tipo);
    console.log('🔑 Chave conflito:', grupo.chave);
    
    // Tentativa 1: Inserir em orcamentos_ignorados
    const { data, error } = await supabase
      .from('orcamentos_ignorados')
      .insert({
        orcamento_id: orcamento.id,
        tipo_conflito: grupo.tipo,
        chave_conflito: grupo.chave,
        ignorado_por: user?.id
      })
      .select();

    // Se erro for "tabela não existe" (42P01), usar método alternativo
    if (error && error.code === '42P01') {
      console.warn('⚠️ Tabela orcamentos_ignorados não existe. Usando conflitos_ignorados...');
      
      // Método alternativo: inserir em conflitos_ignorados com chave única
      const chaveUnica = `${grupo.tipo}_INDIVIDUAL:${grupo.chave}|${orcamento.id}`;
      
      const { error: error2 } = await supabase
        .from('conflitos_ignorados')
        .insert({
          tipo: `${grupo.tipo}_INDIVIDUAL`,
          chave_conflito: chaveUnica,
          orcamento_ids: [orcamento.id],
          ignorado_por: user?.id
        });

      if (error2) {
        console.error('❌ Erro no método alternativo:', error2);
        throw error2;
      }
      
      console.log('✅ Arquivado usando método alternativo');
      
    } else if (error) {
      console.error('❌ Erro ao arquivar:', error);
      console.error('📋 Detalhes do erro:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    } else {
      console.log('✅ Arquivado com sucesso:', data);
    }

    alert(`✅ Orçamento ${orcamento.numero} arquivado!`);
    carregarConflitos();
    
  } catch (error) {
    console.error('❌ Erro fatal ao arquivar orçamento:', error);
    alert(`Erro ao arquivar orçamento: ${error.message || 'Erro desconhecido'}`);
  }
};

  // ==========================================================================
  // 🔄 FUNÇÃO: Restaurar Conflito
  // ==========================================================================
  const restaurarConflito = async (ignorado) => {
    if (!confirm('Deseja restaurar este conflito?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('conflitos_ignorados')
        .delete()
        .eq('id', ignorado.id);

      if (error) throw error;

      alert('✅ Conflito restaurado!');
      carregarConflitos();
      
    } catch (error) {
      console.error('❌ Erro ao restaurar conflito:', error);
      alert('Erro ao restaurar conflito.');
    }
  };

  // ==========================================================================
  // 🔧 FUNÇÕES AUXILIARES
  // ==========================================================================

  const formatarCNPJ = (cnpj) => {
    const nums = cnpj.replace(/\D/g, '');
    if (nums.length === 14) {
      return nums.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return cnpj;
  };

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

  const toggleGrupo = (grupoId) => {
    setGruposExpandidos(prev => ({ 
      ...prev, 
      [grupoId]: !prev[grupoId] 
    }));
  };

  const verOrcamento = (orcamentoId) => {
    navigate(`/orcamentos/editar/${orcamentoId}`);
  };

  // ==========================================================================
  // 🎨 RENDERIZAÇÃO - Loading
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
        
        {/* HEADER DA PÁGINA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
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

        {/* CONFLITOS ATIVOS */}
        {!mostrarIgnorados && (
          <>
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
                    {/* ========================================
                        HEADER DO GRUPO
                        ======================================== */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
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

                        {/* ⭐ BOTÃO ARQUIVAR GRUPO COMPLETO */}
                        <button
                          onClick={() => ignorarGrupo(grupo)}
                          className="ml-4 p-2 text-gray-600 hover:bg-white rounded-lg transition-colors"
                          title="Arquivar grupo completo"
                        >
                          <Archive size={20} />
                        </button>
                      </div>
                    </div>

                    {/* ========================================
                        CARDS DE ORÇAMENTOS
                        ======================================== */}
                    {gruposExpandidos[grupo.id] && (
                      <div className="border-t border-gray-200 bg-white p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          
                          {grupo.orcamentos.map((orc) => (
                            <div
                              key={orc.id}
                              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white relative"
                            >
                              {/* ⭐ BOTÃO ARQUIVAR INDIVIDUAL (canto superior direito) */}
                              <button
                                onClick={() => ignorarOrcamento(orc, grupo)}
                                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Arquivar apenas este orçamento"
                              >
                                <XCircle size={18} />
                              </button>

                              <div className="flex items-start justify-between mb-3 pr-8">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-gray-900">
                                      {orc.numero}
                                    </span>
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

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-gray-400" />
                                  <span className="text-gray-700 font-medium">
                                    {orc.usuarios?.nome || 'Vendedor não informado'}
                                  </span>
                                </div>

                                {orc.cnpj_cpf && (
                                  <div className="flex items-center gap-2">
                                    <FileText size={14} className="text-gray-400" />
                                    <span className="text-gray-600 text-xs">
                                      {formatarCNPJ(orc.cnpj_cpf)}
                                    </span>
                                  </div>
                                )}

                                {orc.obra_cidade && (
                                  <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400" />
                                    <span className="text-gray-600 text-xs">
                                      {orc.obra_cidade}
                                      {orc.obra_bairro && ` - ${orc.obra_bairro}`}
                                    </span>
                                  </div>
                                )}

                                <div className="pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-500 mb-1">Produtos:</p>
                                  <p className="text-xs text-gray-700">
                                    {formatarProdutos(orc.itens)}
                                  </p>
                                </div>
                              </div>

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

        {/* CONFLITOS ARQUIVADOS */}
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
// 📝 NOTAS IMPORTANTES
// ============================================================================
//
// ⭐ NOVIDADES EM 16/01/2026:
// - Botão no header do grupo: Arquiva TODOS os orçamentos do grupo
// - Botão em cada card (❌ canto superior direito): Arquiva APENAS aquele orçamento
// - Quando sobra apenas 1 orçamento no grupo, o grupo desaparece automaticamente
//
// 🗄️ NOVA TABELA NECESSÁRIA:
// Você precisa criar a tabela orcamentos_ignorados no Supabase:
//
// CREATE TABLE orcamentos_ignorados (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   orcamento_id UUID REFERENCES orcamentos(id) ON DELETE CASCADE,
//   tipo_conflito VARCHAR(20), -- 'CNPJ' ou 'LOCALIZACAO'
//   chave_conflito VARCHAR(255),
//   ignorado_por UUID REFERENCES usuarios(id),
//   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//   UNIQUE(orcamento_id)
// );
//
// Se a tabela não existir, o código usa conflitos_ignorados como fallback
//
// ============================================================================