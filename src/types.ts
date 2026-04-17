/**
 * Dados digitados pelo usuário no formulário de controle de estoque.
 * Os números já vêm validados (tipos corretos) antes de processar a venda.
 */
export type EntradaControleEstoque = {
  /** Nome do produto (texto livre). */
  nomeProduto: string
  /** Preço unitário em reais (número decimal). */
  preco: number
  /**
   * Estoque disponível **antes** desta venda (na etapa 2, use o estoque atual do produto).
   */
  quantidadeInicialEstoque: number
  /** Quantidade que se deseja vender (inteiro não negativo). */
  quantidadeVendida: number
}

/**
 * Resultado exibido na tela quando a venda é aceita.
 * Espelha os rótulos pedidos no enunciado/exemplo.
 */
export type ResumoVendaBemSucedida = {
  nomeProduto: string
  /** Ex.: "R$ 3500.00" como no exemplo do trabalho. */
  precoFormatado: string
  estoqueAntesDaVenda: number
  quantidadeVendida: number
  estoqueAtualizado: number
}
