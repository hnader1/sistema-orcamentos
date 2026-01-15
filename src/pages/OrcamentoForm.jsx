// src/components/EnderecoObraForm.jsx

import React, { useState, useEffect } from 'react';
import { 
  buscarCEP, 
  formatarCEP, 
  buscarCidadesMG, 
  buscarBairrosPorCidade 
} from '../utils/cepUtils';

const EnderecoObraForm = ({ valores, onChange }) => {
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

  // Carrega cidades disponíveis ao montar
  useEffect(() => {
    carregarCidades();
  }, []);

  // Atualiza bairros quando cidade muda
  useEffect(() => {
    if (cidade && !cepValidado) {
      carregarBairros(cidade);
    }
  }, [cidade, cepValidado]);

  // Notifica componente pai sobre mudanças
  useEffect(() => {
    onChange({
      obra_cep: cep,
      obra_cidade: cidade,
      obra_bairro: bairro,
      obra_logradouro: logradouro,
      obra_numero: numero,
      obra_complemento: complemento,
      obra_endereco_validado: cepValidado
    });
  }, [cep, cidade, bairro, logradouro, numero, complemento, cepValidado]);

  const carregarCidades = async () => {
    const cidades = await buscarCidadesMG();
    setCidadesDisponiveis(cidades);
  };

  const carregarBairros = async (nomeCidade) => {
    const bairros = await buscarBairrosPorCidade(nomeCidade);
    setBairrosDisponiveis(bairros);
  };

  const handleBuscarCEP = async () => {
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
    setCidade(novaCidade);
    setMostrarSugestoesCidade(false);

    // Verifica se cidade existe no banco
    const cidadeExiste = cidadesDisponiveis.some(
      c => c.nome.toLowerCase() === novaCidade.toLowerCase()
    );

    if (!cidadeExiste && novaCidade.trim() !== '') {
      // Cidade não existe! CEP obrigatório
      setCepObrigatorio(true);
      setErroCEP('⚠️ Cidade não encontrada. Informe o CEP para adicionar ao sistema.');
    } else {
      setCepObrigatorio(false);
      setErroCEP('');
    }
  };

  const handleCepBlur = () => {
    if (cep && !cepValidado) {
      handleBuscarCEP();
    }
  };

  return (
    <div className="spaco-y-4">
      {/* Título */}
      <h3 className="text-lg font-semibold text-gray-700">
        Endereço da Obra
      </h3>

      {/* Dica */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        💡 <strong>Dica:</strong> Informe o CEP para preencher automaticamente e melhorar a detecção de concorrência interna!
      </div>

      {/* CEP */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CEP {cepObrigatorio && <span className="text-red-500">*</span>}
          {!cepObrigatorio && <span className="text-gray-500 text-xs">(opcional, mas recomendado)</span>}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={cep}
            onChange={(e) => {
              const formatted = formatarCEP(e.target.value);
              setCep(formatted);
              setCepValidado(false);
            }}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            maxLength={9}
            disabled={cepValidado}
            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              cepValidado ? 'bg-gray-100 cursor-not-allowed' : ''
            } ${erroCEP ? 'border-red-500' : 'border-gray-300'}`}
          />
          <button
            type="button"
            onClick={handleBuscarCEP}
            disabled={buscandoCEP || cepValidado || !cep}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {buscandoCEP ? (
              <>
                <span className="animate-spin">⏳</span>
                Buscando...
              </>
            ) : (
              <>
                🔍 Buscar
              </>
            )}
          </button>
          {cepValidado && (
            <button
              type="button"
              onClick={() => {
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
        {erroCEP && (
          <p className="text-sm text-red-600 mt-1">{erroCEP}</p>
        )}
        {cepValidado && (
          <p className="text-sm text-green-600 mt-1">✓ CEP validado</p>
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
            handleCidadeChange(e.target.value);
            setMostrarSugestoesCidade(true);
          }}
          onFocus={() => setMostrarSugestoesCidade(true)}
          onBlur={() => setTimeout(() => setMostrarSugestoesCidade(false), 200)}
          placeholder="Digite ou selecione a cidade"
          disabled={cepValidado}
          required
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            cepValidado ? 'bg-gray-100 cursor-not-allowed' : ''
          } ${cepObrigatorio && cidade ? 'border-orange-500' : 'border-gray-300'}`}
        />
        
        {/* Sugestões de Cidade */}
        {mostrarSugestoesCidade && !cepValidado && cidadesDisponiveis.length > 0 && (
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

      {/* Bairro */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bairro {cepValidado && <span className="text-gray-500 text-xs">(validado pelo CEP)</span>}
        </label>
        <input
          type="text"
          value={bairro}
          onChange={(e) => {
            setBairro(e.target.value);
            setMostrarSugestoesBairro(true);
          }}
          onFocus={() => setMostrarSugestoesBairro(true)}
          onBlur={() => setTimeout(() => setMostrarSugestoesBairro(false), 200)}
          placeholder="Digite ou selecione o bairro"
          disabled={cepValidado}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            cepValidado ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
        
        {/* Sugestões de Bairro */}
        {mostrarSugestoesBairro && !cepValidado && bairrosDisponiveis.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {bairrosDisponiveis
              .filter(b => b.toLowerCase().includes(bairro.toLowerCase()))
              .slice(0, 10)
              .map((b, idx) => (
                <div
                  key={idx}
                  onClick={() => {
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
          onChange={(e) => setLogradouro(e.target.value)}
          placeholder="Ex: Rua das Flores"
          disabled={cepValidado}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            cepValidado ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
        />
      </div>

      {/* Número e Complemento */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número
          </label>
          <input
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="123"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complemento
          </label>
          <input
            type="text"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            placeholder="Apto 45, Bloco B"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default EnderecoObraForm;