// src/utils/embutirValoresUtils.js
// Utilitário para cálculos de desconto e frete embutido no valor unitário

/**
 * Calcula o desconto unitário para cada produto
 * @param {number} precoOriginal - Preço unitário original do produto
 * @param {number} percentualDesconto - Percentual de desconto (ex: 10 para 10%)
 * @returns {number} Valor do desconto por unidade
 */
export const calcularDescontoUnitario = (precoOriginal, percentualDesconto) => {
  if (!precoOriginal || !percentualDesconto) return 0
  return parseFloat(precoOriginal) * (parseFloat(percentualDesconto) / 100)
}

/**
 * Calcula o frete unitário baseado no total de unidades
 * IMPORTANTE: Desconto NÃO incide sobre o frete!
 * @param {number} freteTotal - Valor total do frete
 * @param {number} totalUnidades - Soma total de unidades de todos os produtos
 * @returns {number} Valor do frete por unidade
 */
export const calcularFreteUnitario = (freteTotal, totalUnidades) => {
  if (!freteTotal || !totalUnidades || totalUnidades <= 0) return 0
  return parseFloat(freteTotal) / parseFloat(totalUnidades)
}

/**
 * Calcula o total de unidades de todos os produtos
 * @param {Array} produtos - Array de produtos selecionados
 * @returns {number} Soma total de unidades
 */
export const calcularTotalUnidades = (produtos) => {
  if (!produtos || !Array.isArray(produtos)) return 0
  return produtos.reduce((total, produto) => {
    return total + (parseInt(produto.quantidade) || 0)
  }, 0)
}

/**
 * Calcula o novo preço unitário com valores embutidos
 * Ordem: 1) Aplica desconto no preço original, 2) Adiciona frete (sem desconto)
 * @param {number} precoOriginal - Preço unitário original
 * @param {number} descontoUnitario - Valor do desconto por unidade (já calculado)
 * @param {number} freteUnitario - Valor do frete por unidade (já calculado)
 * @param {boolean} descontoEmbutido - Se o desconto está embutido
 * @param {boolean} freteEmbutido - Se o frete está embutido
 * @returns {number} Novo preço unitário com valores embutidos
 */
export const calcularPrecoComEmbutido = (
  precoOriginal, 
  descontoUnitario = 0, 
  freteUnitario = 0,
  descontoEmbutido = false,
  freteEmbutido = false
) => {
  let novoPreco = parseFloat(precoOriginal) || 0
  
  // 1. Subtrai desconto (se embutido)
  if (descontoEmbutido && descontoUnitario > 0) {
    novoPreco = novoPreco - descontoUnitario
  }
  
  // 2. Adiciona frete (se embutido) - frete NÃO recebe desconto!
  if (freteEmbutido && freteUnitario > 0) {
    novoPreco = novoPreco + freteUnitario
  }
  
  return novoPreco
}

/**
 * Calcula o subtotal de um item com valores embutidos
 * @param {Object} produto - Produto com preço e quantidade
 * @param {number} descontoUnitario - Desconto por unidade
 * @param {number} freteUnitario - Frete por unidade
 * @param {boolean} descontoEmbutido - Se desconto está embutido
 * @param {boolean} freteEmbutido - Se frete está embutido
 * @returns {number} Subtotal do item
 */
export const calcularSubtotalItem = (
  produto,
  descontoUnitario = 0,
  freteUnitario = 0,
  descontoEmbutido = false,
  freteEmbutido = false
) => {
  const quantidade = parseInt(produto.quantidade) || 0
  const precoOriginal = parseFloat(produto.preco) || 0
  
  const precoFinal = calcularPrecoComEmbutido(
    precoOriginal,
    descontoUnitario,
    freteUnitario,
    descontoEmbutido,
    freteEmbutido
  )
  
  return precoFinal * quantidade
}

/**
 * Gera observação automática para o frete embutido
 * @param {string} modalidadeFrete - CIF com descarga, CIF sem descarga, etc.
 * @returns {string} Texto formatado para exibição
 */
export const getTextoFreteEmbutido = (modalidadeFrete) => {
  if (!modalidadeFrete) return 'Frete embutido no valor unitário'
  return `${modalidadeFrete} (embutido no valor unitário)`
}

/**
 * Prepara os dados dos produtos para salvar no banco
 * Quando embutido, o preço salvo é o preço COM os valores embutidos
 * @param {Array} produtos - Produtos originais
 * @param {number} percentualDesconto - Percentual de desconto
 * @param {number} freteTotal - Frete total
 * @param {boolean} descontoEmbutido - Se desconto está embutido
 * @param {boolean} freteEmbutido - Se frete está embutido
 * @returns {Array} Produtos com preços ajustados para salvar
 */
export const prepararProdutosParaSalvar = (
  produtos,
  percentualDesconto,
  freteTotal,
  descontoEmbutido,
  freteEmbutido
) => {
  const totalUnidades = calcularTotalUnidades(produtos)
  const freteUnitario = calcularFreteUnitario(freteTotal, totalUnidades)
  
  return produtos.map(produto => {
    const precoOriginal = parseFloat(produto.preco) || 0
    const descontoUnitario = calcularDescontoUnitario(precoOriginal, percentualDesconto)
    
    // Se embutido, ajusta o preço; senão mantém original
    let precoFinal = precoOriginal
    let precoOriginalSalvo = precoOriginal
    
    if (descontoEmbutido || freteEmbutido) {
      precoFinal = calcularPrecoComEmbutido(
        precoOriginal,
        descontoEmbutido ? descontoUnitario : 0,
        freteEmbutido ? freteUnitario : 0,
        descontoEmbutido,
        freteEmbutido
      )
      precoOriginalSalvo = precoOriginal // Guarda o original para referência
    }
    
    return {
      ...produto,
      preco: precoFinal,
      preco_original: precoOriginalSalvo,
      desconto_embutido: descontoEmbutido ? descontoUnitario : 0,
      frete_embutido: freteEmbutido ? freteUnitario : 0
    }
  })
}

/**
 * Calcula o total geral considerando valores embutidos
 * @param {Array} produtos - Produtos
 * @param {number} percentualDesconto - Percentual de desconto
 * @param {number} freteTotal - Frete total
 * @param {boolean} descontoEmbutido - Se desconto está embutido
 * @param {boolean} freteEmbutido - Se frete está embutido
 * @returns {Object} { subtotal, descontoTotal, freteExibido, total }
 */
export const calcularTotaisComEmbutido = (
  produtos,
  percentualDesconto,
  freteTotal,
  descontoEmbutido,
  freteEmbutido
) => {
  const totalUnidades = calcularTotalUnidades(produtos)
  const freteUnitario = calcularFreteUnitario(freteTotal, totalUnidades)
  
  let subtotalProdutos = 0
  let subtotalComEmbutido = 0
  
  produtos.forEach(produto => {
    const quantidade = parseInt(produto.quantidade) || 0
    const precoOriginal = parseFloat(produto.preco) || 0
    const descontoUnitario = calcularDescontoUnitario(precoOriginal, percentualDesconto)
    
    // Subtotal sem embutir
    subtotalProdutos += precoOriginal * quantidade
    
    // Subtotal com embutido
    const precoComEmbutido = calcularPrecoComEmbutido(
      precoOriginal,
      descontoEmbutido ? descontoUnitario : 0,
      freteEmbutido ? freteUnitario : 0,
      descontoEmbutido,
      freteEmbutido
    )
    subtotalComEmbutido += precoComEmbutido * quantidade
  })
  
  // Valores para exibição
  const descontoExibido = descontoEmbutido ? 0 : (subtotalProdutos * percentualDesconto / 100)
  const freteExibido = freteEmbutido ? 0 : freteTotal
  
  // Total final
  // Se embutido: subtotalComEmbutido já tem tudo
  // Se não embutido: subtotal - desconto + frete
  const total = descontoEmbutido || freteEmbutido
    ? subtotalComEmbutido + (descontoEmbutido ? 0 : -descontoExibido) + (freteEmbutido ? 0 : freteExibido)
    : subtotalProdutos - descontoExibido + freteExibido
  
  return {
    subtotalProdutos,
    subtotalComEmbutido,
    descontoTotal: descontoEmbutido ? 0 : descontoExibido,
    descontoEmbutidoTotal: descontoEmbutido ? (subtotalProdutos * percentualDesconto / 100) : 0,
    freteExibido,
    freteEmbutidoTotal: freteEmbutido ? freteTotal : 0,
    total: subtotalComEmbutido
  }
}

export default {
  calcularDescontoUnitario,
  calcularFreteUnitario,
  calcularTotalUnidades,
  calcularPrecoComEmbutido,
  calcularSubtotalItem,
  getTextoFreteEmbutido,
  prepararProdutosParaSalvar,
  calcularTotaisComEmbutido
}