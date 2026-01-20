// src/components/EnderecoObraForm.jsx

import React, { useState, useEffect } from 'react';
import { 
  buscarCEP, 
  formatarCEP, 
  buscarCidadesMG, 
  buscarBairrosPorCidade 
} from '../utils/cepUtils';

function EnderecoObraForm({ valores, onChange, disabled = false }) {
  const [cep, setCep] = useState(valores?.obra_cep || '');
  const [cidade, setCidade] = useState(valores?.obra_cidade || '');
  const [bairro, setBairro] = useState(valores?.obra_bairro || '');
  const [logradouro, setLogradouro] = useState(valores?.obra_logradouro || '');
  const [numero, setNumero] = useState(valores?.obra_numero || '');
  const [complemento, setComplemento] = useState(valores?.obra_complemento || '');
  
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [cepValidado, setCepValidado] = useState(false);
  const [erroCEP, setErroCEP] = useState('');
  
  const [cidadesDisponiveis, setCidadesDisponiveis] = useState([]);
  const [bairrosDisponiveis, setBairrosDisponiveis] = useState([]);
  const [mostrarSugestoesCidade, setMostrarSugestoesCidade] = useState(false);
  const [mostrarSugestoesBairro, setMostrarSugestoesBairro] = useState(false);
  
  const [cepObrigatorio, setCepObrigatorio] = useState(false);

  useEffect(() => {
    carregarCidades();
  }, []);

  useEffect(() => {
    if (cidade && !cepValidado) {
      carregarBairros(cidade);
    }
  }, [cidade, cepValidado]);

  useEffect(() => {
    if (!disabled) {
      onChange({
        obra_cep: cep,
        obra_cidade: cidade,
        obra_bairro: bairro,
        obra_logradouro: logradouro,
        obra_numero: numero,
        obra_complemento: complemento,
        obra_endereco_validado: cepValidado
      });
    }
  }, [cep, cidade, bairro, logradouro, numero, complemento, cepValidado, disabled]);

  const carregarCidades = async () => {
    const cidades = await buscarCidadesMG();
    setCidadesDisponiveis(cidades);
  };

  const carregarBairros = async (nomeCidade) => {
    const bairros = await buscarBairrosPorCidade(nomeCidade);
    setBairrosDisponiveis(bairros);
  };

  const handleBuscarCEP = async () => {
    if (disabled) return;
    
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      setErroCEP('CEP inválido');
      return;
    }

    setBuscandoCEP(true);
    setErroCEP('');

    const resultado = await buscarCEP(cep);

    if (resultado.sucesso) {
      setCidade(resultado.dados.cidade);
      setBairro(resultado.dados.bairro);
      setLogradouro(resultado.dados.logradouro);
      setCepValidado(true);
      setCepObrigatorio(false);
      setErroCEP('');
    } else {
      setErroCEP(resultado.erro);
      setCepValidado(false);
    }

    setBuscandoCEP(false);
  };

  const handleCidadeChange = async (novaCidade) => {
    if (disabled) return;
    
    setCidade(novaCidade);
    setMostrarSugestoesCidade(false);

    const cidadeExiste = cidadesDisponiveis.some(
      c => c.nome.toLowerCase() === novaCidade.toLowerCase()
    );

    if (!cidadeExiste && novaCidade.trim() !== '') {
      setCepObrigatorio(true);
      setErroCEP('⚠️ Cidade não encontrada. Informe o CEP para adicionar ao sistema.');
    } else {
      setCepObrigatorio(false);
      setErroCEP('');
    }
  };

  const handleCepBlur = () => {
    if (cep && !cepValidado && !disabled) {
      handleBuscarCEP();
    }
  };

  // ✅ Determinar se campos devem estar desabilitados
  const isFieldDisabled = disabled || cepValidado;

  return (
    <div className="space-y-3">
      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-700">
        Endereço da Obra
      </h3>

      {/* ✨ CEP + BUSCAR + CIDADE NA MESMA LINHA */}
      <div className="grid grid-cols-1 lg:grid-cols-[180px_auto_1fr] gap-2">
        {/* CEP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP {cepObrigatorio && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={cep}
            onChange={(e) => {
              if (disabled) return;
              const formatted = formatarCEP(e.target.value);
              setCep(formatted);
              setCepValidado(false);
            }}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            maxLength={9}
            disabled={disabled || cepValidado}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              disabled || cepValidado ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            } ${erroCEP ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>

        {/* Botão Buscar */}
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleBuscarCEP}
            disabled={disabled || buscandoCEP || cepValidado || !cep}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap ${
              disabled ? 'opacity-60' : ''
            }`}
          >
            {buscandoCEP ? (
              <>
                <span className="animate-spin">⏳</span>
                <span className="hidden sm:inline">Buscando...</span>
              </>
            ) : (
              <>
                🔍 <span className="hidden sm:inline">Buscar</span>
              </>
            )}
          </button>
          {cepValidado && !disabled && (
            <button
              type="button"
              onClick={() => {
                if (disabled) return;
                setCep('');
                setCidade('');
                setBairro('');
                setLogradouro('');
                setCepValidado(false);
              }}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              ✕
            </button>
          )}
        </div>

        {/* Cidade */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={cidade}
            onChange={(e) => {
              if (disabled) return;
              handleCidadeChange(e.target.value);
              setMostrarSugestoesCidade(true);
            }}
            onFocus={() => !disabled && !cepValidado && setMostrarSugestoesCidade(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoesCidade(false), 200)}
            placeholder="Digite ou selecione a cidade"
            disabled={isFieldDisabled}
            required
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isFieldDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            } ${cepObrigatorio && cidade ? 'border-orange-500' : 'border-gray-300'}`}
          />
          
          {/* Sugestões de Cidade */}
          {mostrarSugestoesCidade && !disabled && !cepValidado && cidadesDisponiveis.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {cidadesDisponiveis
                .filter(c => c.nome.toLowerCase().includes(cidade.toLowerCase()))
                .slice(0, 10)
                .map((c, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCidadeChange(c.nome)}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {c.nome}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Mensagens de erro/sucesso */}
      {erroCEP && (
        <p className="text-sm text-red-600">{erroCEP}</p>
      )}
      {cepValidado && (
        <p className="text-sm text-green-600">✓ CEP validado</p>
      )}

      {/* ✨ BAIRRO + LOGRADOURO NA MESMA LINHA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Bairro */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro
          </label>
          <input
            type="text"
            value={bairro}
            onChange={(e) => {
              if (disabled) return;
              setBairro(e.target.value);
              setMostrarSugestoesBairro(true);
            }}
            onFocus={() => !disabled && !cepValidado && setMostrarSugestoesBairro(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoesBairro(false), 200)}
            placeholder="Digite ou selecione o bairro"
            disabled={isFieldDisabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isFieldDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            }`}
          />
          
          {/* Sugestões de Bairro */}
          {mostrarSugestoesBairro && !disabled && !cepValidado && bairrosDisponiveis.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {bairrosDisponiveis
                .filter(b => b.toLowerCase().includes(bairro.toLowerCase()))
                .slice(0, 10)
                .map((b, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (disabled) return;
                      setBairro(b);
                      setMostrarSugestoesBairro(false);
                    }}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {b}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Logradouro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logradouro (Rua/Avenida)
          </label>
          <input
            type="text"
            value={logradouro}
            onChange={(e) => {
              if (disabled) return;
              setLogradouro(e.target.value);
            }}
            placeholder="Ex: Rua das Flores"
            disabled={isFieldDisabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isFieldDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            }`}
          />
        </div>
      </div>

      {/* Número e Complemento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número
          </label>
          <input
            type="text"
            value={numero}
            onChange={(e) => {
              if (disabled) return;
              setNumero(e.target.value);
            }}
            placeholder="123"
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complemento
          </label>
          <input
            type="text"
            value={complemento}
            onChange={(e) => {
              if (disabled) return;
              setComplemento(e.target.value);
            }}
            placeholder="Apto 45, Bloco B"
            disabled={disabled}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
}

export default EnderecoObraForm;
