import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export function BotaoEnviarProposta({ orcamento, onEnviado }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [etapa, setEtapa] = useState(1); // 1 = dados, 2 = verificação
  const [enviando, setEnviando] = useState(false);
  const [emailCliente, setEmailCliente] = useState(orcamento?.cliente_email || '');
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  
  // ✅ VERIFICAÇÃO DE SEGURANÇA
  const [desafio, setDesafio] = useState({ num1: 0, num2: 0, resposta: 0 });
  const [respostaUsuario, setRespostaUsuario] = useState('');
  const [erroVerificacao, setErroVerificacao] = useState(false);

  const podeEnviar = emailCliente && emailCliente.includes('@');

  // Gera novo desafio matemático
  const gerarDesafio = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setDesafio({ num1, num2, resposta: num1 + num2 });
    setRespostaUsuario('');
    setErroVerificacao(false);
  };

  // Gera desafio ao abrir modal
  useEffect(() => {
    if (modalAberto) {
      gerarDesafio();
      setEtapa(1);
    }
  }, [modalAberto]);

  const avancarParaVerificacao = () => {
    if (!podeEnviar) {
      setErro('Email do cliente é obrigatório');
      return;
    }
    setErro('');
    gerarDesafio();
    setEtapa(2);
  };

  const verificarEEnviar = () => {
    const respostaNum = parseInt(respostaUsuario);
    if (respostaNum !== desafio.resposta) {
      setErroVerificacao(true);
      gerarDesafio();
      return;
    }
    handleEnviar();
  };

  const handleEnviar = async () => {
    setEnviando(true);
    setErro('');

    try {
      const token = crypto.randomUUID().replace(/-/g, '');
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + (orcamento.validade_dias || 15));

      const { data: proposta, error: erroProposta } = await supabase
        .from('propostas')
        .insert({
          orcamento_id: orcamento.id,
          vendedor_id: orcamento.usuario_id || orcamento.usuario_id_original,
          token_aceite: token,
          numero_proposta: orcamento.numero_proposta || orcamento.numero,
          valor_total: orcamento.total || orcamento.total_geral || orcamento.valor_total,
          status: 'enviada',
          data_envio: new Date().toISOString(),
          data_expiracao: dataExpiracao.toISOString()
        })
        .select()
        .single();

      if (erroProposta) throw erroProposta;

      // Salvar dados do cliente
      await supabase.from('dados_cliente_proposta').insert({
        proposta_id: proposta.id,
        cpf_cnpj: orcamento.cnpj_cpf || orcamento.cliente_cpf_cnpj,
        razao_social: orcamento.cliente_nome,
        nome_fantasia: orcamento.cliente_empresa || orcamento.cliente_nome,
        cep: orcamento.obra_cep,
        logradouro: orcamento.obra_logradouro,
        bairro: orcamento.obra_bairro,
        cidade: orcamento.obra_cidade,
        uf: 'MG',
        inscricao_estadual: '',
        contribuinte_icms: false,
        tipo_cliente: 'consumidor_final',
        email: emailCliente,
        telefone: orcamento.cliente_telefone,
        origem: 'orcamento'
      });

      const linkAceite = `${window.location.origin}/aceite/${token}`;
      
      // Tentar enviar email via Edge Function
      const { error: erroEmail } = await supabase.functions.invoke('enviar-proposta-email', {
        body: { 
          proposta_id: proposta.id, 
          email_cliente: emailCliente, 
          link_aceite: linkAceite, 
          mensagem_personalizada: mensagemPersonalizada, 
          orcamento 
        }
      });

      // Log do email
      await supabase.from('log_emails_proposta').insert({
        proposta_id: proposta.id,
        tipo: 'envio_proposta',
        de_email: 'propostas@construcom.com.br',
        para_email: emailCliente,
        assunto: `Proposta Comercial ${orcamento.numero_proposta || orcamento.numero} - Construcom`,
        status: erroEmail ? 'erro' : 'enviado',
        erro_mensagem: erroEmail?.message,
        data_envio: new Date().toISOString()
      });

      // Atualizar status do orçamento
      await supabase.from('orcamentos').update({ 
        status: 'enviado', 
        proposta_enviada_em: new Date().toISOString() 
      }).eq('id', orcamento.id);

      setSucesso(true);
      if (onEnviado) onEnviado(proposta);

    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      setErro(error.message || 'Erro ao enviar proposta');
      setEtapa(1);
    } finally {
      setEnviando(false);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setSucesso(false);
    setEtapa(1);
    setErro('');
    setRespostaUsuario('');
    setErroVerificacao(false);
  };

  // ✅ TELA DE SUCESSO
  if (sucesso) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modalSucesso}>
          <div style={styles.iconeSucesso}>✓</div>
          <h3 style={styles.tituloSucesso}>Proposta Enviada!</h3>
          <p style={styles.textoSucesso}>
            Um email foi enviado para <strong>{emailCliente}</strong> com o link para aceite da proposta.
          </p>
          <div style={styles.infoLinkBox}>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Link para aceite:</p>
            <code style={styles.linkCode}>{window.location.origin}/aceite/...</code>
          </div>
          <button onClick={fecharModal} style={styles.btnFechar}>
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* BOTÃO PRINCIPAL */}
      <button 
        onClick={() => setModalAberto(true)} 
        disabled={!orcamento?.numero_proposta}
        title={!orcamento?.numero_proposta ? 'Salve o orçamento primeiro para gerar o número da proposta' : ''}
        style={{
          ...styles.btnPrincipal,
          opacity: !orcamento?.numero_proposta ? 0.5 : 1,
          cursor: !orcamento?.numero_proposta ? 'not-allowed' : 'pointer'
        }}
      >
        📧 Enviar para Cliente
      </button>

      {/* MODAL */}
      {modalAberto && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            {/* HEADER */}
            <div style={styles.header}>
              <h2 style={styles.headerTitulo}>📧 Enviar Proposta para Cliente</h2>
              <p style={styles.headerSubtitulo}>
                Proposta {orcamento.numero_proposta || orcamento.numero}
              </p>
              <button onClick={fecharModal} style={styles.btnFecharX}>✕</button>
            </div>

            <div style={styles.corpo}>
              {/* ETAPA 1: DADOS */}
              {etapa === 1 && (
                <>
                  {/* Resumo do Orçamento */}
                  <div style={styles.resumoBox}>
                    <div style={styles.resumoGrid}>
                      <div>
                        <p style={styles.resumoLabel}>Cliente</p>
                        <p style={styles.resumoValor}>{orcamento.cliente_nome}</p>
                      </div>
                      <div>
                        <p style={styles.resumoLabel}>Valor Total</p>
                        <p style={{ ...styles.resumoValor, color: '#10b981' }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                            .format(orcamento.total || orcamento.total_geral || 0)}
                        </p>
                      </div>
                      <div>
                        <p style={styles.resumoLabel}>Validade</p>
                        <p style={styles.resumoValor}>{orcamento.validade_dias || 15} dias</p>
                      </div>
                      <div>
                        <p style={styles.resumoLabel}>Frete</p>
                        <p style={styles.resumoValor}>
                          {orcamento.frete_modalidade === 'FOB' ? 'FOB (Cliente retira)' : 'CIF (Incluso)'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Campo Email */}
                  <div style={styles.campo}>
                    <label style={styles.label}>Email do Cliente *</label>
                    <input
                      type="email"
                      value={emailCliente}
                      onChange={(e) => setEmailCliente(e.target.value)}
                      placeholder="cliente@empresa.com"
                      style={styles.input}
                    />
                  </div>

                  {/* Campo Mensagem */}
                  <div style={styles.campo}>
                    <label style={styles.label}>Mensagem Personalizada (opcional)</label>
                    <textarea
                      value={mensagemPersonalizada}
                      onChange={(e) => setMensagemPersonalizada(e.target.value)}
                      placeholder="Adicione uma mensagem personalizada..."
                      rows={3}
                      style={styles.textarea}
                    />
                  </div>

                  {/* Info do que será enviado */}
                  <div style={styles.infoBox}>
                    <p style={styles.infoTitulo}>📧 O que será enviado:</p>
                    <ul style={styles.infoLista}>
                      <li>Email com resumo da proposta</li>
                      <li>PDF da proposta comercial em anexo</li>
                      <li>Link para o cliente revisar dados e aceitar</li>
                    </ul>
                  </div>

                  {erro && <div style={styles.erroBox}>⚠️ {erro}</div>}

                  {/* Botões */}
                  <div style={styles.botoesContainer}>
                    <button onClick={fecharModal} style={styles.btnCancelar}>
                      Cancelar
                    </button>
                    <button
                      onClick={avancarParaVerificacao}
                      disabled={!podeEnviar}
                      style={{
                        ...styles.btnAvancar,
                        opacity: podeEnviar ? 1 : 0.5,
                        cursor: podeEnviar ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Continuar →
                    </button>
                  </div>
                </>
              )}

              {/* ETAPA 2: VERIFICAÇÃO DE SEGURANÇA */}
              {etapa === 2 && (
                <>
                  <div style={styles.verificacaoBox}>
                    <div style={styles.verificacaoIcone}>🔐</div>
                    <h3 style={styles.verificacaoTitulo}>Confirmação de Envio</h3>
                    <p style={styles.verificacaoTexto}>
                      Para confirmar o envio da proposta para <strong>{emailCliente}</strong>, 
                      resolva a operação abaixo:
                    </p>

                    <div style={styles.desafioBox}>
                      <span style={styles.desafioNumero}>{desafio.num1}</span>
                      <span style={styles.desafioOperador}>+</span>
                      <span style={styles.desafioNumero}>{desafio.num2}</span>
                      <span style={styles.desafioIgual}>=</span>
                      <input
                        type="number"
                        value={respostaUsuario}
                        onChange={(e) => {
                          setRespostaUsuario(e.target.value);
                          setErroVerificacao(false);
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && verificarEEnviar()}
                        placeholder="?"
                        style={{
                          ...styles.desafioInput,
                          borderColor: erroVerificacao ? '#ef4444' : '#e2e8f0',
                          backgroundColor: erroVerificacao ? '#fef2f2' : 'white'
                        }}
                        autoFocus
                      />
                    </div>

                    {erroVerificacao && (
                      <p style={styles.erroVerificacao}>
                        ❌ Resposta incorreta. Tente novamente!
                      </p>
                    )}

                    <div style={styles.avisoFinal}>
                      <strong>⚠️ Atenção:</strong> Após o envio, o cliente receberá um email 
                      com link para aceitar a proposta. O status do orçamento será alterado 
                      para "Enviado".
                    </div>
                  </div>

                  {/* Botões */}
                  <div style={styles.botoesContainer}>
                    <button onClick={() => setEtapa(1)} style={styles.btnCancelar}>
                      ← Voltar
                    </button>
                    <button
                      onClick={verificarEEnviar}
                      disabled={enviando || !respostaUsuario}
                      style={{
                        ...styles.btnEnviar,
                        opacity: (enviando || !respostaUsuario) ? 0.5 : 1,
                        cursor: (enviando || !respostaUsuario) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {enviando ? (
                        <>
                          <span style={styles.spinner} />
                          Enviando...
                        </>
                      ) : (
                        <>📧 Confirmar e Enviar</>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
      `}</style>
    </>
  );
}

// ESTILOS
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 80px rgba(0,0,0,0.4)'
  },
  header: {
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    padding: '25px 30px',
    color: 'white',
    position: 'relative'
  },
  headerTitulo: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700'
  },
  headerSubtitulo: {
    margin: '8px 0 0',
    opacity: 0.9,
    fontSize: '14px'
  },
  btnFecharX: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px'
  },
  corpo: {
    padding: '30px'
  },
  resumoBox: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px'
  },
  resumoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  resumoLabel: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8'
  },
  resumoValor: {
    margin: '5px 0 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0a2540'
  },
  campo: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#0a2540'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  infoBox: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '12px',
    padding: '15px 20px',
    marginBottom: '25px'
  },
  infoTitulo: {
    margin: '0 0 10px',
    fontWeight: '600',
    color: '#166534',
    fontSize: '14px'
  },
  infoLista: {
    margin: 0,
    paddingLeft: '20px',
    color: '#166534',
    fontSize: '13px'
  },
  erroBox: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    padding: '12px 15px',
    marginBottom: '20px',
    color: '#dc2626',
    fontSize: '14px'
  },
  botoesContainer: {
    display: 'flex',
    gap: '15px'
  },
  btnCancelar: {
    flex: 1,
    padding: '14px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  btnAvancar: {
    flex: 2,
    padding: '14px',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  btnEnviar: {
    flex: 2,
    padding: '14px',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  btnPrincipal: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s'
  },
  
  // Verificação
  verificacaoBox: {
    textAlign: 'center',
    padding: '10px 0 20px'
  },
  verificacaoIcone: {
    fontSize: '50px',
    marginBottom: '15px'
  },
  verificacaoTitulo: {
    margin: '0 0 10px',
    fontSize: '22px',
    fontWeight: '700',
    color: '#0a2540'
  },
  verificacaoTexto: {
    margin: '0 0 25px',
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.5'
  },
  desafioBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '20px'
  },
  desafioNumero: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#6366f1'
  },
  desafioOperador: {
    fontSize: '28px',
    fontWeight: '500',
    color: '#94a3b8'
  },
  desafioIgual: {
    fontSize: '28px',
    fontWeight: '500',
    color: '#94a3b8'
  },
  desafioInput: {
    width: '80px',
    height: '60px',
    border: '3px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '28px',
    fontWeight: '700',
    textAlign: 'center',
    color: '#0a2540',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  erroVerificacao: {
    color: '#ef4444',
    fontSize: '14px',
    margin: '0 0 15px'
  },
  avisoFinal: {
    background: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '10px',
    padding: '15px',
    fontSize: '13px',
    color: '#92400e',
    lineHeight: '1.5',
    textAlign: 'left'
  },
  
  // Sucesso
  modalSucesso: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '400px',
    textAlign: 'center',
    boxShadow: '0 25px 80px rgba(0,0,0,0.4)'
  },
  iconeSucesso: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: '40px',
    color: 'white'
  },
  tituloSucesso: {
    margin: '0 0 15px',
    color: '#0a2540',
    fontSize: '22px'
  },
  textoSucesso: {
    margin: '0 0 20px',
    color: '#64748b',
    fontSize: '15px'
  },
  infoLinkBox: {
    background: '#f1f5f9',
    borderRadius: '10px',
    padding: '12px 15px',
    marginBottom: '25px'
  },
  linkCode: {
    display: 'block',
    marginTop: '5px',
    fontSize: '11px',
    color: '#6366f1',
    wordBreak: 'break-all'
  },
  btnFechar: {
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #0a2540, #1a365d)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

export default BotaoEnviarProposta;
