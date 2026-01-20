import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';

// =====================================================
// PÁGINA DE ACEITE DE PROPOSTA - VERSÃO MOBILE-FIRST
// VERSÃO 4.0 - AJUSTES VISUAIS E LÓGICA DE FRETE
// =====================================================

export default function AceiteProposta() {
  const { token } = useParams();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  // Estados principais
  const [carregando, setCarregando] = useState(true);
  const [proposta, setProposta] = useState(null);
  const [erro, setErro] = useState('');
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [aceiteConfirmado, setAceiteConfirmado] = useState(false);
  
  // Estado para proposta expirada
  const [propostaExpirada, setPropostaExpirada] = useState(false);
  
  // Estado para URL do PDF
  const [pdfUrl, setPdfUrl] = useState(null);
  const [baixandoPdf, setBaixandoPdf] = useState(false);
  
  // Dados editáveis
  const [dadosEditaveis, setDadosEditaveis] = useState({
    razao_social: '',
    nome_fantasia: '',
    inscricao_estadual: '',
    contribuinte_icms: false,
    tipo_cliente: 'consumidor_final'
  });
  
  // Observação e LGPD
  const [observacaoCliente, setObservacaoCliente] = useState('');
  const [lgpdAceito, setLgpdAceito] = useState(false);
  const [termoLgpd, setTermoLgpd] = useState(null);
  const [mostrarTermoCompleto, setMostrarTermoCompleto] = useState(false);
  
  // Documentos
  const [documentos, setDocumentos] = useState([]);
  const [uploadando, setUploadando] = useState(false);
  
  // Termo de aceite final
  const [termoAceito, setTermoAceito] = useState(false);

  // URL do logo hospedado no Vercel
  const logoUrl = 'https://sistema-orcamentos-theta.vercel.app/logo-construcom.png';

  // HELPER: Busca CPF/CNPJ em todos os campos possíveis
  const getCpfCnpj = (dados, orcamento) => {
    return dados?.cpf_cnpj || 
           dados?.cliente_cpf_cnpj || 
           dados?.cnpj_cpf ||
           orcamento?.cpf_cnpj ||
           orcamento?.cliente_cpf_cnpj || 
           orcamento?.cnpj_cpf ||
           '';
  };

  // Carregar proposta
  useEffect(() => {
    carregarProposta();
    carregarTermoLgpd();
  }, [token]);

  const carregarProposta = async () => {
    try {
      setCarregando(true);
      
      const { data: propostaData, error: erroPropostaQuery } = await supabase
        .from('propostas')
        .select(`
          *,
          orcamentos(*),
          dados_cliente_proposta(*),
          documentos_proposta(*)
        `)
        .eq('token_aceite', token)
        .single();

      if (erroPropostaQuery) {
        throw new Error('Proposta não encontrada');
      }

      // Verificar se expirou
      const agora = new Date();
      const dataExpiracao = new Date(propostaData.data_expiracao);
      
      if (dataExpiracao < agora) {
        setPropostaExpirada(true);
        setProposta(propostaData);
        setCarregando(false);
        return;
      }

      // Verificar se já foi aceita
      if (propostaData.status === 'aceita') {
        setAceiteConfirmado(true);
        setProposta(propostaData);
        if (propostaData.pdf_path) {
          await carregarUrlPdf(propostaData.pdf_path);
        }
        setCarregando(false);
        return;
      }

      // Atualizar para visualizada
      if (propostaData.status === 'enviada') {
        await supabase
          .from('propostas')
          .update({ 
            status: 'visualizada',
            data_visualizacao: new Date().toISOString()
          })
          .eq('id', propostaData.id);
      }

      setProposta(propostaData);
      
      if (propostaData.pdf_path) {
        await carregarUrlPdf(propostaData.pdf_path);
      }
      
      // Preencher dados editáveis
      const dadosCliente = propostaData.dados_cliente_proposta?.[0] || propostaData.orcamentos;
      if (dadosCliente) {
        setDadosEditaveis({
          razao_social: dadosCliente.razao_social || dadosCliente.cliente_empresa || dadosCliente.cliente_nome || '',
          nome_fantasia: dadosCliente.nome_fantasia || dadosCliente.cliente_nome || '',
          inscricao_estadual: dadosCliente.inscricao_estadual || '',
          contribuinte_icms: dadosCliente.contribuinte_icms || false,
          tipo_cliente: dadosCliente.tipo_cliente || 'consumidor_final'
        });
      }

      // Carregar documentos já enviados
      if (propostaData.documentos_proposta) {
        setDocumentos(propostaData.documentos_proposta.map(doc => ({
          ...doc,
          jaEnviado: true
        })));
      }

    } catch (error) {
      console.error('Erro ao carregar proposta:', error);
      setErro(error.message || 'Erro ao carregar proposta');
    } finally {
      setCarregando(false);
    }
  };

  const carregarUrlPdf = async (pdfPath) => {
    try {
      const { data, error } = await supabase.storage
        .from('propostas-pdf')
        .createSignedUrl(pdfPath, 604800);

      if (!error && data?.signedUrl) {
        setPdfUrl(data.signedUrl);
      }
    } catch (e) {
      console.error('Erro ao carregar URL do PDF:', e);
    }
  };

  const handleBaixarPdf = async () => {
    if (!pdfUrl) {
      alert('PDF não disponível. Tente recarregar a página.');
      return;
    }
    
    setBaixandoPdf(true);
    try {
      window.open(pdfUrl, '_blank');
    } catch (e) {
      console.error('Erro ao baixar PDF:', e);
      alert('Erro ao baixar PDF. Tente novamente.');
    } finally {
      setBaixandoPdf(false);
    }
  };

  const carregarTermoLgpd = async () => {
    try {
      const { data } = await supabase
        .from('termos_lgpd')
        .select('*')
        .eq('ativo', true)
        .order('vigencia_inicio', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setTermoLgpd(data);
      }
    } catch (error) {
      console.error('Erro ao carregar termo LGPD:', error);
    }
  };

  const handleChange = (campo, valor) => {
    setDadosEditaveis(prev => ({ ...prev, [campo]: valor }));
  };

  const handleFileUpload = async (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 10MB.');
      return;
    }

    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      alert('Tipo de arquivo não permitido. Use JPG, PNG ou PDF.');
      return;
    }

    setUploadando(true);

    try {
      const extensao = file.name.split('.').pop();
      const nomeArquivo = `${proposta.id}/${tipo}_${Date.now()}.${extensao}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos-propostas')
        .upload(nomeArquivo, file);

      if (uploadError) throw uploadError;

      const { data: docData, error: docError } = await supabase
        .from('documentos_proposta')
        .insert({
          proposta_id: proposta.id,
          tipo_documento: tipo,
          nome_arquivo: file.name,
          tamanho_bytes: file.size,
          mime_type: file.type,
          storage_path: uploadData.path
        })
        .select()
        .single();

      if (docError) throw docError;

      setDocumentos(prev => [...prev, { ...docData, jaEnviado: true }]);

    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao enviar arquivo. Tente novamente.');
    } finally {
      setUploadando(false);
    }
  };

  const handleCameraCapture = async (e, tipo) => {
    await handleFileUpload(e, tipo);
  };

  const removerDocumento = async (doc, index) => {
    if (doc.jaEnviado && doc.id) {
      try {
        if (doc.storage_path) {
          await supabase.storage.from('documentos-propostas').remove([doc.storage_path]);
        }
        await supabase.from('documentos_proposta').delete().eq('id', doc.id);
      } catch (error) {
        console.error('Erro ao remover:', error);
      }
    }
    setDocumentos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAceitar = async () => {
    if (!termoAceito || !lgpdAceito) {
      alert('Você precisa aceitar os termos para continuar.');
      return;
    }

    setEnviando(true);

    try {
      let ipCliente = '';
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ipCliente = ipData.ip;
      } catch (e) {
        ipCliente = 'não disponível';
      }

      const dadosOriginais = proposta.dados_cliente_proposta?.[0];
      const emailCliente = dadosOriginais?.email || proposta.orcamentos?.cliente_email || '';
      const cpfCnpjCliente = getCpfCnpj(dadosOriginais, proposta.orcamentos);

      const { error: erroAceite } = await supabase
        .from('aceites')
        .insert({
          proposta_id: proposta.id,
          tipo: proposta.valor_total <= 5000 ? 'simples' : 'assinatura_digital',
          ip_cliente: ipCliente,
          user_agent: navigator.userAgent,
          email_aprovador: emailCliente,
          nome_aprovador: dadosEditaveis.razao_social || dadosEditaveis.nome_fantasia,
          contribuinte_icms: dadosEditaveis.contribuinte_icms,
          inscricao_estadual: dadosEditaveis.inscricao_estadual || null,
          tipo_cliente: dadosEditaveis.tipo_cliente,
          dados_confirmados: {
            ...dadosEditaveis,
            cpf_cnpj: cpfCnpjCliente,
            email: emailCliente
          },
          observacao_cliente: observacaoCliente,
          lgpd_aceito: lgpdAceito,
          lgpd_aceito_em: new Date().toISOString(),
          lgpd_versao: termoLgpd?.versao || '1.0'
        });

      if (erroAceite) throw erroAceite;

      const houveAlteracao = 
        dadosEditaveis.razao_social !== dadosOriginais?.razao_social ||
        dadosEditaveis.nome_fantasia !== dadosOriginais?.nome_fantasia ||
        dadosEditaveis.inscricao_estadual !== dadosOriginais?.inscricao_estadual ||
        dadosEditaveis.contribuinte_icms !== dadosOriginais?.contribuinte_icms ||
        dadosEditaveis.tipo_cliente !== dadosOriginais?.tipo_cliente;

      if (houveAlteracao) {
        await supabase
          .from('dados_cliente_proposta')
          .insert({
            proposta_id: proposta.id,
            cpf_cnpj: cpfCnpjCliente,
            razao_social: dadosEditaveis.razao_social,
            nome_fantasia: dadosEditaveis.nome_fantasia,
            inscricao_estadual: dadosEditaveis.inscricao_estadual,
            contribuinte_icms: dadosEditaveis.contribuinte_icms,
            tipo_cliente: dadosEditaveis.tipo_cliente,
            cep: dadosOriginais?.cep || proposta.orcamentos?.cep_entrega,
            logradouro: dadosOriginais?.logradouro || proposta.orcamentos?.endereco_entrega,
            bairro: dadosOriginais?.bairro || proposta.orcamentos?.bairro_entrega,
            cidade: dadosOriginais?.cidade || proposta.orcamentos?.cidade_entrega,
            uf: dadosOriginais?.uf || proposta.orcamentos?.uf_entrega,
            email: emailCliente,
            telefone: dadosOriginais?.telefone || proposta.orcamentos?.cliente_telefone,
            origem: 'cliente'
          });
      }

      await supabase
        .from('propostas')
        .update({ status: 'aceita', data_aceite: new Date().toISOString() })
        .eq('id', proposta.id);

      setAceiteConfirmado(true);

    } catch (error) {
      console.error('Erro ao aceitar:', error);
      alert('Erro ao processar aceite. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);
  };

  const formatarData = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const orcamento = proposta?.orcamentos;
  const dadosCliente = proposta?.dados_cliente_proposta?.[0] || orcamento;
  
  // Lógica de frete
  const isFOB = proposta?.tipo_frete === 'FOB' || orcamento?.tipo_frete === 'FOB' || orcamento?.frete_modalidade === 'FOB';
  const tipoDescarga = proposta?.tipo_descarga || orcamento?.tipo_descarga || '';
  const temDescarga = tipoDescarga && tipoDescarga.toLowerCase() !== 'sem descarga' && tipoDescarga.toLowerCase() !== 'cliente' && tipoDescarga !== '';
  
  // CPF/CNPJ
  const cpfCnpjExibicao = getCpfCnpj(dadosCliente, orcamento);
  
  // Valores
  const totalProdutos = proposta?.total_produtos || orcamento?.subtotal || orcamento?.total_produtos || 0;
  const totalFrete = proposta?.total_frete || orcamento?.frete || 0;
  const valorTotal = proposta?.valor_total || orcamento?.total || (totalProdutos + totalFrete);

  // Função para obter label do frete na etapa 3
  const getLabelFrete = () => {
    if (isFOB) {
      return 'Frete por conta do cliente';
    } else if (temDescarga) {
      return 'Total Frete e Descarga';
    } else {
      return 'Frete (descarga por conta do cliente)';
    }
  };

  // TELA DE CARREGAMENTO
  if (carregando) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Carregando proposta...</p>
      </div>
    );
  }

  // TELA DE ERRO
  if (erro) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>❌</div>
        <h1 style={styles.errorTitle}>Proposta não encontrada</h1>
        <p style={styles.errorText}>{erro}</p>
        <p style={styles.errorHint}>Verifique se o link está correto ou entre em contato com o vendedor.</p>
      </div>
    );
  }

  // TELA DE PROPOSTA EXPIRADA
  if (propostaExpirada) {
    return (
      <div style={styles.expiredContainer}>
        <div style={styles.expiredIcon}>⏰</div>
        <h1 style={styles.expiredTitle}>Proposta Expirada</h1>
        <p style={styles.expiredText}>
          Esta proposta expirou em <strong>{formatarData(proposta?.data_expiracao)}</strong>.
        </p>
        <div style={styles.expiredInfo}>
          <p><strong>Proposta:</strong> {proposta?.numero_proposta}</p>
          <p><strong>Valor:</strong> {formatarMoeda(proposta?.valor_total)}</p>
        </div>
        <div style={styles.expiredAction}>
          <p style={styles.expiredHint}>Entre em contato com o vendedor para solicitar uma nova proposta.</p>
          {orcamento?.vendedor_telefone && (
            <a 
              href={`https://wa.me/55${orcamento.vendedor_telefone.replace(/\D/g, '')}?text=Olá! A proposta ${proposta?.numero_proposta} expirou. Poderia me enviar uma nova?`}
              style={styles.whatsappButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              📱 Falar com Vendedor no WhatsApp
            </a>
          )}
        </div>
      </div>
    );
  }

  // TELA DE SUCESSO
  if (aceiteConfirmado) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>✓</div>
        <h1 style={styles.successTitle}>Proposta Aceita!</h1>
        <p style={styles.successText}>Sua confirmação foi registrada com sucesso. Nossa equipe entrará em contato em breve.</p>
        <div style={styles.successInfo}>
          <p><strong>Proposta:</strong> {proposta?.numero_proposta}</p>
          <p><strong>Valor:</strong> {formatarMoeda(valorTotal)}</p>
          <p><strong>Data do Aceite:</strong> {formatarData(proposta?.data_aceite || new Date())}</p>
        </div>
        
        {pdfUrl && (
          <button 
            onClick={handleBaixarPdf} 
            disabled={baixandoPdf}
            style={styles.downloadPdfButton}
          >
            {baixandoPdf ? '⏳ Carregando...' : '📑 Baixar Proposta'}
          </button>
        )}
        
        <p style={styles.successHint}>Um email de confirmação foi enviado para {dadosCliente?.email || orcamento?.cliente_email}</p>
      </div>
    );
  }

  // PÁGINA PRINCIPAL
  return (
    <div style={styles.container}>
      {/* HEADER COM LOGO */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            {/* Logo com fundo branco para contraste */}
            <div style={styles.logoContainer}>
              <img 
                src={logoUrl} 
                alt="Construcom" 
                style={styles.logoImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
          <div style={styles.propostaNumero}>
            <span style={styles.propostaLabel}>Proposta</span>
            <span style={styles.propostaValue}>{proposta?.numero_proposta}</span>
          </div>
        </div>
      </header>

      <div style={styles.progressContainer}>
        <div style={styles.progressBar}>
          {[1, 2, 3].map(num => (
            <div key={num} style={styles.progressStep}>
              <div style={{...styles.progressDot, background: etapaAtual >= num ? '#10b981' : '#e2e8f0'}}>
                {etapaAtual > num ? '✓' : num}
              </div>
              <span style={{...styles.progressLabel, color: etapaAtual >= num ? '#10b981' : '#94a3b8'}}>
                {num === 1 ? 'Dados' : num === 2 ? 'Docs' : 'Aceite'}
              </span>
            </div>
          ))}
          <div style={styles.progressLine}>
            <div style={{...styles.progressLineFill, width: etapaAtual === 1 ? '0%' : etapaAtual === 2 ? '50%' : '100%'}} />
          </div>
        </div>
      </div>

      <main style={styles.main}>
        {/* ETAPA 1: DADOS */}
        {etapaAtual === 1 && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📋 Revise seus Dados</h2>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <span style={styles.badgeReadonly}>🔒 DADOS FIXOS</span>
                </div>
                <div style={styles.fieldGroup}>
                  <div style={styles.field}>
                    <label style={styles.label}>CPF/CNPJ</label>
                    <div style={styles.readonlyField}>{cpfCnpjExibicao || 'Não informado'}</div>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <div style={styles.readonlyField}>{dadosCliente?.email || orcamento?.cliente_email || 'Não informado'}</div>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Telefone</label>
                    <div style={styles.readonlyField}>{dadosCliente?.telefone || orcamento?.cliente_telefone || 'Não informado'}</div>
                  </div>
                  <div style={styles.fieldFull}>
                    <label style={styles.label}>Endereço de Entrega</label>
                    <div style={styles.readonlyField}>
                      {dadosCliente?.logradouro || orcamento?.endereco_entrega || orcamento?.obra_logradouro || ''}, 
                      {dadosCliente?.bairro || orcamento?.bairro_entrega || orcamento?.obra_bairro || ''} - 
                      {dadosCliente?.cidade || orcamento?.cidade_entrega || orcamento?.obra_cidade || ''}/
                      {dadosCliente?.uf || orcamento?.uf_entrega || 'MG'}
                    </div>
                  </div>
                </div>
                <p style={styles.readonlyHint}>⚠️ Se estes dados estiverem incorretos, contate o vendedor antes de aceitar.</p>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <span style={styles.badgeEditable}>✏️ DADOS EDITÁVEIS</span>
                </div>
                <div style={styles.fieldGroup}>
                  <div style={styles.fieldFull}>
                    <label style={styles.label}>Razão Social *</label>
                    <input type="text" value={dadosEditaveis.razao_social} onChange={(e) => handleChange('razao_social', e.target.value)} style={styles.input} />
                  </div>
                  <div style={styles.fieldFull}>
                    <label style={styles.label}>Nome Fantasia</label>
                    <input type="text" value={dadosEditaveis.nome_fantasia} onChange={(e) => handleChange('nome_fantasia', e.target.value)} style={styles.input} />
                  </div>
                  <div style={styles.fieldFull}>
                    <label style={styles.label}>Inscrição Estadual</label>
                    <input type="text" value={dadosEditaveis.inscricao_estadual} onChange={(e) => handleChange('inscricao_estadual', e.target.value)} style={styles.input} placeholder="Deixe vazio se isento" />
                  </div>
                  <div style={styles.fieldFull}>
                    <label style={styles.label}>Contribuinte de ICMS? *</label>
                    <div style={styles.radioGroup}>
                      <label style={{...styles.radioOption, border: dadosEditaveis.contribuinte_icms ? '2px solid #10b981' : '2px solid #e2e8f0', background: dadosEditaveis.contribuinte_icms ? '#f0fdf4' : 'white'}}>
                        <input type="radio" checked={dadosEditaveis.contribuinte_icms === true} onChange={() => handleChange('contribuinte_icms', true)} />
                        <span>Sim</span>
                      </label>
                      <label style={{...styles.radioOption, border: dadosEditaveis.contribuinte_icms === false ? '2px solid #10b981' : '2px solid #e2e8f0', background: dadosEditaveis.contribuinte_icms === false ? '#f0fdf4' : 'white'}}>
                        <input type="radio" checked={dadosEditaveis.contribuinte_icms === false} onChange={() => handleChange('contribuinte_icms', false)} />
                        <span>Não</span>
                      </label>
                    </div>
                  </div>
                  <div style={styles.fieldFull}>
                    <label style={styles.label}>Tipo de Cliente *</label>
                    <div style={styles.tipoClienteGroup}>
                      {[{ valor: 'consumidor_final', label: '🏠 Consumidor Final' }, { valor: 'revenda', label: '🏪 Revenda' }, { valor: 'construtor', label: '👷 Construtor' }].map(tipo => (
                        <label key={tipo.valor} style={{...styles.tipoClienteOption, border: dadosEditaveis.tipo_cliente === tipo.valor ? '2px solid #10b981' : '2px solid #e2e8f0', background: dadosEditaveis.tipo_cliente === tipo.valor ? '#f0fdf4' : 'white'}}>
                          <input type="radio" checked={dadosEditaveis.tipo_cliente === tipo.valor} onChange={() => handleChange('tipo_cliente', tipo.valor)} />
                          <span>{tipo.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.section}>
                <label style={styles.label}>💬 Observações (opcional)</label>
                <textarea value={observacaoCliente} onChange={(e) => setObservacaoCliente(e.target.value)} style={styles.textarea} placeholder="Caso tenha alguma observação ou solicitação especial..." rows={3} />
              </div>

              <button onClick={() => setEtapaAtual(2)} style={styles.buttonPrimary}>Próximo: Documentos →</button>
            </div>
          </div>
        )}

        {/* ETAPA 2: DOCUMENTOS */}
        {etapaAtual === 2 && (
          <div style={styles.card}>
            <div style={styles.cardHeaderPurple}>
              <h2 style={styles.cardTitle}>📎 Documentos</h2>
              <p style={styles.cardSubtitle}>Anexe os documentos necessários (opcional)</p>
            </div>
            <div style={styles.cardContent}>
              <div style={styles.docsHint}>💡 Se você é um <strong>cliente novo</strong>, anexe os documentos abaixo para agilizar o cadastro.</div>

              {[{ tipo: 'contrato_social', label: 'Contrato Social', icone: '📄' }, { tipo: 'comprovante_endereco', label: 'Comprovante de Endereço', icone: '🏠' }, { tipo: 'cartao_cnpj', label: 'Cartão CNPJ', icone: '🏢' }, { tipo: 'outro', label: 'Outro Documento', icone: '📁' }].map(doc => {
                const docAnexado = documentos.find(d => d.tipo_documento === doc.tipo);
                return (
                  <div key={doc.tipo} style={styles.uploadItem}>
                    <div style={styles.uploadInfo}>
                      <span style={styles.uploadIcon}>{doc.icone}</span>
                      <div>
                        <p style={styles.uploadLabel}>{doc.label}</p>
                        {docAnexado && <p style={styles.uploadFileName}>✓ {docAnexado.nome_arquivo}</p>}
                      </div>
                    </div>
                    {docAnexado ? (
                      <button onClick={() => removerDocumento(docAnexado, documentos.indexOf(docAnexado))} style={styles.buttonRemove}>Remover</button>
                    ) : (
                      <div style={styles.uploadButtons}>
                        <label style={styles.buttonUpload}>📁<input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, doc.tipo)} style={{ display: 'none' }} /></label>
                        <label style={styles.buttonCamera}>📷<input type="file" accept="image/*" capture="environment" onChange={(e) => handleCameraCapture(e, doc.tipo)} style={{ display: 'none' }} /></label>
                      </div>
                    )}
                  </div>
                );
              })}

              {uploadando && <div style={styles.uploadingIndicator}><div style={styles.spinnerSmall}></div><span>Enviando arquivo...</span></div>}
              <p style={styles.uploadHint}>📱 No celular, toque em 📷 para tirar foto do documento</p>

              <div style={styles.buttonGroup}>
                <button onClick={() => setEtapaAtual(1)} style={styles.buttonSecondary}>← Voltar</button>
                <button onClick={() => setEtapaAtual(3)} style={styles.buttonPrimary}>Próximo: Aceitar →</button>
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: ACEITE */}
        {etapaAtual === 3 && (
          <div style={styles.card}>
            <div style={styles.cardHeaderGreen}>
              <h2 style={styles.cardTitle}>✅ Confirmar Aceite</h2>
            </div>
            <div style={styles.cardContent}>
              {/* RESUMO DA PROPOSTA */}
              <div style={styles.resumoBox}>
                <h3 style={styles.resumoTitle}>📦 Resumo da Proposta</h3>
                {orcamento?.itens_json && JSON.parse(orcamento.itens_json).map((item, i) => (
                  <div key={i} style={styles.resumoItem}>
                    <span style={styles.resumoItemNome}>{item.produto}</span>
                    <span style={styles.resumoItemQtd}>{item.quantidade} un</span>
                    <span style={styles.resumoItemValor}>{formatarMoeda(item.total)}</span>
                  </div>
                ))}
                
                {/* TOTAIS COM NOVA LÓGICA */}
                <div style={styles.totaisBox}>
                  {/* Total Produtos */}
                  <div style={styles.totalLinha}>
                    <span>Total Produtos:</span>
                    <span style={styles.totalValor}>{formatarMoeda(totalProdutos)}</span>
                  </div>
                  
                  {/* Frete com lógica condicional */}
                  <div style={{
                    ...styles.totalLinha, 
                    ...styles.freteLinha, 
                    background: isFOB ? '#fef3c7' : '#f0fdf4'
                  }}>
                    <span style={{ color: isFOB ? '#92400e' : '#166534', flex: 1 }}>
                      🚚 {getLabelFrete()}:
                    </span>
                    <span style={{ color: isFOB ? '#92400e' : '#166534', fontWeight: '600' }}>
                      {isFOB ? 'A COMBINAR' : formatarMoeda(totalFrete)}
                    </span>
                  </div>
                  
                  {/* Observação do frete se não for FOB */}
                  {!isFOB && !temDescarga && (
                    <p style={styles.freteObservacao}>* A descarga do material é de responsabilidade do cliente</p>
                  )}
                  
                  {/* TOTAL GERAL */}
                  <div style={styles.totalGeral}>
                    <span>TOTAL DA PROPOSTA:</span>
                    <span style={styles.totalGeralValor}>{formatarMoeda(isFOB ? totalProdutos : valorTotal)}</span>
                  </div>
                  {isFOB && <p style={styles.fobAviso}>* O valor do frete será combinado e cobrado separadamente</p>}
                </div>
              </div>

              <div style={styles.dadosConfirmados}>
                <h4 style={styles.dadosConfirmadosTitle}>✓ Dados Confirmados</h4>
                <p><strong>CNPJ:</strong> {cpfCnpjExibicao || 'Não informado'}</p>
                <p><strong>Razão Social:</strong> {dadosEditaveis.razao_social}</p>
                <p><strong>IE:</strong> {dadosEditaveis.inscricao_estadual || 'ISENTO'}</p>
                <p><strong>Contribuinte ICMS:</strong> {dadosEditaveis.contribuinte_icms ? 'Sim' : 'Não'}</p>
                <p><strong>Tipo:</strong> {dadosEditaveis.tipo_cliente === 'consumidor_final' ? 'Consumidor Final' : dadosEditaveis.tipo_cliente === 'revenda' ? 'Revenda' : 'Construtor'}</p>
              </div>

              {observacaoCliente && <div style={styles.observacaoBox}><h4>💬 Sua Observação</h4><p>{observacaoCliente}</p></div>}

              {documentos.length > 0 && <div style={styles.docsConfirmados}><h4>📎 Documentos Anexados ({documentos.length})</h4><ul>{documentos.map((doc, i) => <li key={i}>{doc.nome_arquivo}</li>)}</ul></div>}

              <div style={styles.lgpdBox}>
                <div style={styles.lgpdHeader}>
                  <h4>🔒 Proteção de Dados (LGPD)</h4>
                  <button onClick={() => setMostrarTermoCompleto(!mostrarTermoCompleto)} style={styles.lgpdExpandButton}>{mostrarTermoCompleto ? 'Ocultar' : 'Ver termo completo'}</button>
                </div>
                {mostrarTermoCompleto && termoLgpd && (
                  <div style={styles.lgpdConteudo}>
                    <h5>{termoLgpd.titulo}</h5>
                    <div style={styles.lgpdTexto}>{termoLgpd.conteudo.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>
                    <p style={styles.lgpdVersao}>Versão {termoLgpd.versao} - Vigente desde {formatarData(termoLgpd.vigencia_inicio)}</p>
                  </div>
                )}
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={lgpdAceito} onChange={(e) => setLgpdAceito(e.target.checked)} style={styles.checkbox} />
                  <span>Li e concordo com o tratamento dos meus dados pessoais conforme a LGPD</span>
                </label>
              </div>

              <div style={styles.termoBox}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={termoAceito} onChange={(e) => setTermoAceito(e.target.checked)} style={styles.checkbox} />
                  <span>
                    Declaro que revisei todos os dados e confirmo que estão corretos. 
                    Ao aceitar, concordo com os termos, valores e condições da proposta <strong>{proposta?.numero_proposta}</strong>.
                    {isFOB && <span style={{ display: 'block', marginTop: '8px', fontWeight: '600' }}>Entendo que o frete é FOB (por minha conta) e será combinado separadamente.</span>}
                  </span>
                </label>
              </div>

              <div style={styles.buttonGroup}>
                <button onClick={() => setEtapaAtual(2)} style={styles.buttonSecondary}>← Voltar</button>
                <button onClick={handleAceitar} disabled={!termoAceito || !lgpdAceito || enviando} style={{...styles.buttonPrimary, opacity: (!termoAceito || !lgpdAceito) ? 0.5 : 1, cursor: (!termoAceito || !lgpdAceito) ? 'not-allowed' : 'pointer'}}>
                  {enviando ? 'Processando...' : '✓ Aceitar Proposta'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarCard}>
            <div style={styles.sidebarHeader}>
              <p style={styles.sidebarLabel}>Valor Total</p>
              <p style={styles.sidebarValue}>{formatarMoeda(isFOB ? totalProdutos : valorTotal)}</p>
              {/* Chamada para baixar proposta ao invés de (Produtos + Frete) */}
              <p style={styles.sidebarCTA}>📄 Baixe a proposta completa abaixo</p>
            </div>
            {isFOB && <div style={styles.fobBadge}>🚚 Frete FOB - Por conta do cliente</div>}
            <div style={styles.sidebarInfo}>
              <div style={styles.sidebarInfoItem}><span style={styles.sidebarInfoLabel}>Proposta</span><span style={styles.sidebarInfoValue}>{proposta?.numero_proposta}</span></div>
              <div style={styles.sidebarInfoItem}><span style={styles.sidebarInfoLabel}>Validade</span><span style={styles.sidebarInfoValue}>{formatarData(proposta?.data_expiracao)}</span></div>
              <div style={styles.sidebarInfoItem}><span style={styles.sidebarInfoLabel}>Vendedor</span><span style={styles.sidebarInfoValue}>{orcamento?.vendedor}</span></div>
            </div>
            
            {/* BOTÃO BAIXAR PROPOSTA COM ÍCONE PDF */}
            <button 
              onClick={handleBaixarPdf} 
              disabled={!pdfUrl || baixandoPdf}
              style={{
                ...styles.downloadButton,
                opacity: pdfUrl ? 1 : 0.5,
                cursor: pdfUrl ? 'pointer' : 'not-allowed'
              }}
            >
              {baixandoPdf ? '⏳ Carregando...' : '📑 Baixar Proposta'}
            </button>
          </div>
          <div style={styles.contactCard}>
            <h4>💬 Dúvidas?</h4>
            <p>Entre em contato com o vendedor</p>
            {orcamento?.vendedor_telefone && <a href={`https://wa.me/55${orcamento.vendedor_telefone.replace(/\D/g, '')}`} style={styles.whatsappButton} target="_blank" rel="noopener noreferrer">📱 WhatsApp</a>}
          </div>
        </aside>
      </main>

      {/* RODAPÉ ATUALIZADO */}
      <footer style={styles.footer}>
        <p>Construcom Artefatos de Cimento LTDA</p>
        <p>Válido até {formatarData(proposta?.data_expiracao)}</p>
      </footer>

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        input[type="radio"] { accent-color: #10b981; }
        input[type="checkbox"] { accent-color: #10b981; width: 20px; height: 20px; }
      `}</style>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0a2540 0%, #1a365d 100%)', fontFamily: "'Segoe UI', -apple-system, sans-serif" },
  header: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '15px', position: 'sticky', top: 0, zIndex: 100 },
  headerContent: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  // Container branco arredondado para o logo
  logoContainer: { 
    background: 'white', 
    borderRadius: '12px', 
    padding: '8px 15px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoImage: { maxHeight: '40px', width: 'auto' },
  propostaNumero: { textAlign: 'right' },
  propostaLabel: { display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '11px' },
  propostaValue: { color: '#fbbf24', fontSize: '16px', fontWeight: '700' },
  progressContainer: { background: 'rgba(0,0,0,0.2)', padding: '15px' },
  progressBar: { display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '300px', margin: '0 auto' },
  progressStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 },
  progressDot: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '14px' },
  progressLabel: { fontSize: '11px', marginTop: '5px' },
  progressLine: { position: 'absolute', top: '16px', left: '40px', right: '40px', height: '3px', background: 'rgba(255,255,255,0.2)' },
  progressLineFill: { height: '100%', background: '#10b981', transition: 'width 0.3s ease' },
  main: { maxWidth: '1000px', margin: '0 auto', padding: '20px 15px', display: 'grid', gap: '20px' },
  card: { background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  cardHeader: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '20px', color: 'white' },
  cardHeaderPurple: { background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '20px', color: 'white' },
  cardHeaderGreen: { background: 'linear-gradient(135deg, #10b981, #059669)', padding: '20px', color: 'white' },
  cardTitle: { margin: 0, fontSize: '18px', fontWeight: '700' },
  cardSubtitle: { margin: '5px 0 0', opacity: 0.9, fontSize: '13px' },
  cardContent: { padding: '20px' },
  section: { marginBottom: '25px' },
  sectionHeader: { marginBottom: '15px' },
  badgeReadonly: { display: 'inline-block', background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' },
  badgeEditable: { display: 'inline-block', background: '#d1fae5', color: '#059669', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' },
  fieldGroup: { display: 'grid', gap: '15px' },
  field: { width: '100%' },
  fieldFull: { width: '100%' },
  label: { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#475569' },
  input: { width: '100%', padding: '12px 15px', border: '2px solid #10b981', borderRadius: '10px', fontSize: '16px', color: '#0a2540', background: '#f0fdf4', outline: 'none' },
  readonlyField: { width: '100%', padding: '12px 15px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', color: '#64748b', background: '#f8fafc' },
  readonlyHint: { marginTop: '15px', padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', fontSize: '12px', color: '#92400e' },
  textarea: { width: '100%', padding: '12px 15px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', color: '#0a2540', resize: 'vertical', outline: 'none', fontFamily: 'inherit' },
  radioGroup: { display: 'flex', gap: '10px' },
  radioOption: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s', flex: 1, justifyContent: 'center' },
  tipoClienteGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  tipoClienteOption: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s' },
  buttonPrimary: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' },
  buttonSecondary: { flex: 1, padding: '16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' },
  buttonGroup: { display: 'flex', gap: '10px', marginTop: '20px' },
  docsHint: { background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '10px', padding: '12px 15px', marginBottom: '20px', fontSize: '13px', color: '#92400e' },
  uploadItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '2px dashed #e2e8f0', borderRadius: '10px', marginBottom: '10px' },
  uploadInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  uploadIcon: { fontSize: '24px' },
  uploadLabel: { margin: 0, fontWeight: '600', fontSize: '14px', color: '#0a2540' },
  uploadFileName: { margin: '3px 0 0', fontSize: '12px', color: '#10b981' },
  uploadButtons: { display: 'flex', gap: '8px' },
  buttonUpload: { width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', borderRadius: '10px', fontSize: '20px', cursor: 'pointer' },
  buttonCamera: { width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', borderRadius: '10px', fontSize: '20px', cursor: 'pointer' },
  buttonRemove: { padding: '8px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
  uploadHint: { textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '15px' },
  uploadingIndicator: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '15px', color: '#6366f1', fontSize: '14px' },
  resumoBox: { background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  resumoTitle: { margin: '0 0 15px', fontSize: '15px', fontWeight: '600', color: '#0a2540' },
  resumoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e2e8f0', fontSize: '13px' },
  resumoItemNome: { flex: 1, color: '#475569' },
  resumoItemQtd: { padding: '0 10px', color: '#64748b', fontSize: '12px' },
  resumoItemValor: { color: '#0a2540', fontWeight: '500' },
  totaisBox: { marginTop: '15px', paddingTop: '15px', borderTop: '2px solid #e2e8f0' },
  totalLinha: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '14px' },
  totalValor: { fontWeight: '600', color: '#0a2540' },
  freteLinha: { padding: '10px', borderRadius: '8px', marginTop: '5px' },
  freteObservacao: { fontSize: '11px', color: '#64748b', fontStyle: 'italic', margin: '5px 0 10px', paddingLeft: '10px' },
  totalGeral: { display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'linear-gradient(135deg, #0a2540, #1a365d)', borderRadius: '10px', color: 'white', marginTop: '10px', fontSize: '14px', fontWeight: '600' },
  totalGeralValor: { fontSize: '20px', color: '#fbbf24' },
  fobAviso: { textAlign: 'center', fontSize: '11px', color: '#92400e', marginTop: '8px', fontStyle: 'italic' },
  dadosConfirmados: { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '15px', marginBottom: '15px', fontSize: '13px', color: '#166534' },
  dadosConfirmadosTitle: { margin: '0 0 10px', fontSize: '14px' },
  observacaoBox: { background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', padding: '15px', marginBottom: '15px', fontSize: '13px', color: '#1e40af' },
  docsConfirmados: { background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '12px', padding: '15px', marginBottom: '15px', fontSize: '13px', color: '#1e40af' },
  lgpdBox: { background: '#fefce8', border: '1px solid #fde047', borderRadius: '12px', padding: '15px', marginBottom: '15px' },
  lgpdHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  lgpdExpandButton: { background: 'none', border: 'none', color: '#ca8a04', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' },
  lgpdConteudo: { background: 'white', borderRadius: '8px', padding: '15px', marginBottom: '15px', maxHeight: '200px', overflow: 'auto' },
  lgpdTexto: { fontSize: '12px', color: '#475569', lineHeight: '1.6' },
  lgpdVersao: { fontSize: '11px', color: '#94a3b8', marginTop: '10px', fontStyle: 'italic' },
  checkboxLabel: { display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer', fontSize: '13px', color: '#713f12', lineHeight: '1.5' },
  checkbox: { marginTop: '2px', flexShrink: 0 },
  termoBox: { background: '#fefce8', border: '1px solid #fde047', borderRadius: '12px', padding: '15px', marginBottom: '15px' },
  sidebar: { display: 'none' },
  sidebarCard: { background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' },
  sidebarHeader: { background: 'linear-gradient(135deg, #0a2540, #1a365d)', padding: '25px', color: 'white', textAlign: 'center' },
  sidebarLabel: { margin: 0, opacity: 0.7, fontSize: '13px' },
  sidebarValue: { margin: '5px 0 0', fontSize: '28px', fontWeight: '700', color: '#fbbf24' },
  sidebarCTA: { margin: '10px 0 0', fontSize: '12px', opacity: 0.9, color: '#93c5fd' },
  fobBadge: { background: '#fef3c7', padding: '10px', textAlign: 'center', fontSize: '12px', color: '#92400e', fontWeight: '500' },
  sidebarInfo: { padding: '20px' },
  sidebarInfoItem: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' },
  sidebarInfoLabel: { color: '#94a3b8', fontSize: '12px' },
  sidebarInfoValue: { color: '#0a2540', fontWeight: '600', fontSize: '13px' },
  downloadButton: { display: 'block', margin: '0 20px 20px', padding: '14px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', borderRadius: '10px', textAlign: 'center', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: '600', border: 'none', cursor: 'pointer', width: 'calc(100% - 40px)' },
  contactCard: { background: 'rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginTop: '20px', color: 'white', textAlign: 'center' },
  whatsappButton: { display: 'inline-block', marginTop: '10px', padding: '12px 20px', background: '#25d366', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' },
  footer: { background: 'rgba(0,0,0,0.3)', padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '12px' },
  loadingContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a2540 0%, #1a365d 100%)', color: 'white' },
  spinner: { width: '50px', height: '50px', border: '4px solid rgba(255,255,255,0.2)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  spinnerSmall: { width: '20px', height: '20px', border: '3px solid #e2e8f0', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { marginTop: '20px', fontSize: '16px' },
  errorContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a2540 0%, #1a365d 100%)', color: 'white', padding: '20px', textAlign: 'center' },
  errorIcon: { fontSize: '60px', marginBottom: '20px' },
  errorTitle: { fontSize: '24px', marginBottom: '15px' },
  errorText: { opacity: 0.8, marginBottom: '10px' },
  errorHint: { opacity: 0.6, fontSize: '14px' },
  expiredContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a2540 0%, #1a365d 100%)', color: 'white', padding: '20px', textAlign: 'center' },
  expiredIcon: { fontSize: '60px', marginBottom: '20px' },
  expiredTitle: { fontSize: '24px', marginBottom: '15px', color: '#fbbf24' },
  expiredText: { opacity: 0.9, marginBottom: '20px', fontSize: '16px' },
  expiredInfo: { background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '25px' },
  expiredAction: { maxWidth: '350px' },
  expiredHint: { opacity: 0.8, fontSize: '14px', marginBottom: '20px' },
  successContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0a2540 0%, #1a365d 100%)', color: 'white', padding: '20px', textAlign: 'center' },
  successIcon: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', marginBottom: '25px', boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)' },
  successTitle: { fontSize: '28px', marginBottom: '15px' },
  successText: { opacity: 0.9, marginBottom: '25px', fontSize: '16px', maxWidth: '350px' },
  successInfo: { background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '20px' },
  successHint: { opacity: 0.6, fontSize: '13px' },
  downloadPdfButton: { display: 'inline-block', marginBottom: '20px', padding: '16px 32px', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.4)' },
};

if (typeof window !== 'undefined' && window.innerWidth >= 768) {
  styles.main.gridTemplateColumns = '1fr 320px';
  styles.sidebar.display = 'block';
  styles.fieldGroup.gridTemplateColumns = '1fr 1fr';
}
