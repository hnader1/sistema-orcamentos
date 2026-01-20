import React, { useState } from 'react';
import { supabase } from '../services/supabase';

export function BotaoEnviarProposta({ orcamento, onEnviado }) {
  const [modalAberto, setModalAberto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [emailCliente, setEmailCliente] = useState(orcamento?.cliente_email || '');
  const [mensagemPersonalizada, setMensagemPersonalizada] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const podeEnviar = emailCliente && emailCliente.includes('@');

  const handleEnviar = async () => {
    if (!podeEnviar) { setErro('Email do cliente é obrigatório'); return; }
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
          numero_proposta: orcamento.numero,
          valor_total: orcamento.total_geral || orcamento.valor_total,
          status: 'enviada',
          data_envio: new Date().toISOString(),
          data_expiracao: dataExpiracao.toISOString()
        })
        .select()
        .single();

      if (erroProposta) throw erroProposta;

      await supabase.from('dados_cliente_proposta').insert({
        proposta_id: proposta.id,
        cpf_cnpj: orcamento.cliente_cpf_cnpj,
        razao_social: orcamento.cliente_empresa || orcamento.cliente_nome,
        nome_fantasia: orcamento.cliente_nome,
        cep: orcamento.cep_entrega,
        logradouro: orcamento.endereco_entrega,
        bairro: orcamento.bairro_entrega,
        cidade: orcamento.cidade_entrega,
        uf: orcamento.uf_entrega || 'MG',
        inscricao_estadual: orcamento.inscricao_estadual || '',
        contribuinte_icms: orcamento.contribuinte_icms || false,
        tipo_cliente: orcamento.tipo_cliente || 'consumidor_final',
        email: emailCliente,
        telefone: orcamento.cliente_telefone,
        origem: 'orcamento'
      });

      const linkAceite = `${window.location.origin}/aceite/${token}`;
      
      const { error: erroEmail } = await supabase.functions.invoke('enviar-proposta-email', {
        body: { proposta_id: proposta.id, email_cliente: emailCliente, link_aceite: linkAceite, mensagem_personalizada: mensagemPersonalizada, orcamento }
      });

      await supabase.from('log_emails_proposta').insert({
        proposta_id: proposta.id,
        tipo: 'envio_proposta',
        de_email: 'propostas@construcom.com.br',
        para_email: emailCliente,
        assunto: `Proposta Comercial ${orcamento.numero} - Construcom`,
        status: erroEmail ? 'erro' : 'enviado',
        erro_mensagem: erroEmail?.message,
        data_envio: new Date().toISOString()
      });

      await supabase.from('orcamentos').update({ status: 'proposta_enviada', proposta_enviada_em: new Date().toISOString() }).eq('id', orcamento.id);

      setSucesso(true);
      if (onEnviado) onEnviado(proposta);

    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      setErro(error.message || 'Erro ao enviar proposta');
    } finally {
      setEnviando(false);
    }
  };

  if (sucesso) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '40px' }}>✓</div>
          <h3 style={{ margin: '0 0 15px', color: '#0a2540', fontSize: '22px' }}>Proposta Enviada!</h3>
          <p style={{ margin: '0 0 25px', color: '#64748b', fontSize: '15px' }}>Um email foi enviado para <strong>{emailCliente}</strong> com o link para aceite da proposta.</p>
          <button onClick={() => { setSucesso(false); setModalAberto(false); }} style={{ padding: '12px 30px', background: 'linear-gradient(135deg, #0a2540, #1a365d)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button onClick={() => setModalAberto(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)', transition: 'all 0.2s' }}>📧 Enviar para Cliente</button>

      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', padding: '25px 30px', color: 'white' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>📧 Enviar Proposta para Cliente</h2>
              <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>Proposta {orcamento.numero}</p>
            </div>
            <div style={{ padding: '30px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '25px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div><p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Cliente</p><p style={{ margin: '5px 0 0', fontSize: '14px', fontWeight: '600', color: '#0a2540' }}>{orcamento.cliente_nome || orcamento.cliente_empresa}</p></div>
                  <div><p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Valor Total</p><p style={{ margin: '5px 0 0', fontSize: '14px', fontWeight: '600', color: '#10b981' }}>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(orcamento.total_geral || orcamento.valor_total)}</p></div>
                  <div><p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Validade</p><p style={{ margin: '5px 0 0', fontSize: '14px', fontWeight: '600', color: '#0a2540' }}>{orcamento.validade_dias || 15} dias</p></div>
                  <div><p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Tipo Frete</p><p style={{ margin: '5px 0 0', fontSize: '14px', fontWeight: '600', color: '#0a2540' }}>{orcamento.tipo_frete || 'CIF'}</p></div>
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#0a2540' }}>Email do Cliente *</label>
                <input type="email" value={emailCliente} onChange={(e) => setEmailCliente(e.target.value)} placeholder="cliente@empresa.com" style={{ width: '100%', padding: '14px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#0a2540' }}>Mensagem Personalizada (opcional)</label>
                <textarea value={mensagemPersonalizada} onChange={(e) => setMensagemPersonalizada(e.target.value)} placeholder="Adicione uma mensagem personalizada..." rows={3} style={{ width: '100%', padding: '14px 16px', border: '2px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '15px 20px', marginBottom: '25px' }}>
                <p style={{ margin: '0 0 10px', fontWeight: '600', color: '#166534', fontSize: '14px' }}>📧 O que será enviado:</p>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#166534', fontSize: '13px' }}><li>Email com resumo da proposta</li><li>PDF da proposta comercial em anexo</li><li>Link para o cliente revisar dados e aceitar</li></ul>
              </div>
              {erro && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 15px', marginBottom: '20px', color: '#dc2626', fontSize: '14px' }}>⚠️ {erro}</div>}
              <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setModalAberto(false)} disabled={enviando} style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                <button onClick={handleEnviar} disabled={enviando || !podeEnviar} style={{ flex: 2, padding: '14px', background: podeEnviar ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : '#e2e8f0', color: podeEnviar ? 'white' : '#94a3b8', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: podeEnviar ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  {enviando ? <><span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Enviando...</> : <>📧 Enviar Proposta</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </>
  );
}

export default BotaoEnviarProposta;