// src/components/CNPJCPFForm.jsx

import React, { useState, useEffect } from 'react';

function CNPJCPFForm({ valores, onChange, onValidacao }) {
  const [cnpjCpf, setCnpjCpf] = useState(valores?.cnpj_cpf || '');
  const [naoInformar, setNaoInformar] = useState(valores?.cnpj_cpf_nao_informado || false);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [erroValidacao, setErroValidacao] = useState('');

  useEffect(() => {
    const dadosValidos = validarDados();
    
    onChange({
      cnpj_cpf: naoInformar ? null : cnpjCpf,
      cnpj_cpf_nao_informado: naoInformar,
      cnpj_cpf_nao_informado_aceite_data: naoInformar && aceiteTermos ? new Date().toISOString() : null
    });

    if (onValidacao) {
      onValidacao(dadosValidos);
    }
  }, [cnpjCpf, naoInformar, aceiteTermos]);

  const validarDados = () => {
    if (naoInformar) {
      return aceiteTermos;
    }
    
    return cnpjCpf.trim() !== '' && erroValidacao === '';
  };

  const formatarCNPJCPF = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros.length <= 11) {
      return apenasNumeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      return apenasNumeros
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const validarCNPJCPF = (valor) => {
    const apenasNumeros = valor.replace(/\D/g, '');
    
    if (apenasNumeros.length === 0) {
      return '';
    }
    
    if (apenasNumeros.length === 11) {
      if (!validarCPF(apenasNumeros)) {
        return 'CPF inválido';
      }
    } else if (apenasNumeros.length === 14) {
      if (!validarCNPJ(apenasNumeros)) {
        return 'CNPJ inválido';
      }
    } else if (apenasNumeros.length > 0) {
      return 'Digite um CPF (11 dígitos) ou CNPJ (14 dígitos) válido';
    }
    
    return '';
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;
    
    if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;
    
    return digitoVerificador2 === parseInt(cpf.charAt(10));
  };

  const validarCNPJ = (cnpj) => {
    cnpj = cnpj.replace(/\D/g, '');
    
    if (cnpj.length !== 14) return false;
    
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1));
  };

  const handleCnpjCpfChange = (e) => {
    const valorFormatado = formatarCNPJCPF(e.target.value);
    setCnpjCpf(valorFormatado);
    
    const erro = validarCNPJCPF(valorFormatado);
    setErroValidacao(erro);
  };

  const handleNaoInformarChange = (e) => {
    const marcado = e.target.checked;
    setNaoInformar(marcado);
    
    if (marcado) {
      setCnpjCpf('');
      setErroValidacao('');
      setAceiteTermos(false);
    } else {
      setAceiteTermos(false);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* CAMPO CNPJ/CPF + CHECKBOX NA MESMA LINHA */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CNPJ/CPF do Cliente <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 items-start w-full">
          {/* Input CNPJ/CPF */}
          <div className="flex-1">
            <input
              type="text"
              value={naoInformar ? 'NÃO INFORMADO' : cnpjCpf}
              onChange={handleCnpjCpfChange}
              placeholder="00.000.000/0000-00 ou 000.000.000-00"
              maxLength={18}
              disabled={naoInformar}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                naoInformar ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''
              } ${erroValidacao && !naoInformar ? 'border-red-500' : 'border-gray-300'}`}
            />
            {erroValidacao && !naoInformar && (
              <p className="text-sm text-red-600 mt-1">{erroValidacao}</p>
            )}
          </div>

          {/* Checkbox "Não informar" */}
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
            <input
              type="checkbox"
              checked={naoInformar}
              onChange={handleNaoInformarChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Não informar</span>
          </label>
        </div>
      </div>

      {/* Alerta - MAIS COMPACTO */}
      {!naoInformar && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-800">
          💡 <strong>Importante:</strong> O CNPJ/CPF é usado para detectar se outro vendedor já está atendendo este cliente, evitando concorrência interna.
        </div>
      )}

      {/* Alerta de Termo de Responsabilidade */}
      {naoInformar && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 animate-fadeIn">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-yellow-800 mb-2">
                ATENÇÃO - TERMO DE RESPONSABILIDADE
              </h4>
              
              <div className="space-y-2 text-sm text-yellow-900">
                <p className="font-semibold">
                  Ao não informar o CNPJ/CPF do cliente:
                </p>
                
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <strong>Não haverá verificação de concorrência interna</strong> - O sistema não poderá alertá-lo se outro vendedor estiver atendendo o mesmo cliente
                  </li>
                  <li>
                    <strong>Você perde o direito de contestar futuramente</strong> - Caso outro vendedor esteja atendendo este cliente, você não poderá reclamar ou solicitar revisão
                  </li>
                  <li>
                    Este orçamento será registrado como <strong>"Cliente não identificado"</strong>
                  </li>
                </ul>

                <div className="mt-4 pt-4 border-t border-yellow-300">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aceiteTermos}
                      onChange={(e) => setAceiteTermos(e.target.checked)}
                      required
                      className="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-yellow-900">
                      Li e estou ciente das consequências. Aceito os termos e assumo total responsabilidade por não informar o CNPJ/CPF do cliente.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CNPJCPFForm;