import type { EntradaControleEstoque, ResumoVendaBemSucedida } from '../types.ts'

/** Texto fixo exigido pelo professor quando não há estoque suficiente. */
export const MENSAGEM_ESTOQUE_INSUFICIENTE =
  'Estoque insuficiente para realizar a venda.'

export type ResultadoProcessamento =
  | { ok: true; resumo: ResumoVendaBemSucedida }
  | { ok: false; mensagem: string }

/** Produto já validado na etapa 1; `estoqueAtual` muda após cada venda bem-sucedida. */
export type ProdutoCadastrado = {
  nomeProduto: string
  preco: number
  estoqueAtual: number
}

export type ResultadoCadastro =
  | { ok: true; produto: ProdutoCadastrado }
  | { ok: false; mensagem: string }

export function formatarPrecoExemploTrabalho(preco: number): string {
  return `R$ ${preco.toFixed(2)}`
}

function ehInteiroNaoNegativo(valor: number): boolean {
  return Number.isFinite(valor) && valor >= 0 && Number.isInteger(valor)
}

/**
 * Etapa 1: valida nome, preço e quantidade inicial (sem venda ainda).
 * O estoque digitado vira o primeiro `estoqueAtual` do produto.
 */
export function cadastrarProduto(entrada: {
  nomeProduto: string
  preco: number
  quantidadeInicialEstoque: number
}): ResultadoCadastro {
  const nome = entrada.nomeProduto.trim()
  if (nome.length === 0) {
    return { ok: false, mensagem: 'Informe o nome do produto.' }
  }

  if (!Number.isFinite(entrada.preco) || entrada.preco < 0) {
    return { ok: false, mensagem: 'Informe um preço válido (número maior ou igual a zero).' }
  }

  if (!ehInteiroNaoNegativo(entrada.quantidadeInicialEstoque)) {
    return {
      ok: false,
      mensagem:
        'A quantidade inicial em estoque deve ser um número inteiro maior ou igual a zero.',
    }
  }

  return {
    ok: true,
    produto: {
      nomeProduto: nome,
      preco: entrada.preco,
      estoqueAtual: entrada.quantidadeInicialEstoque,
    },
  }
}

/**
 * Etapa 2: usa o estoque **atual** do produto como "estoque antes da venda".
 * Se quantidade vendida for maior que esse estoque, retorna erro oficial.
 */
export function processarVenda(entrada: EntradaControleEstoque): ResultadoProcessamento {
  const nome = entrada.nomeProduto.trim()
  if (nome.length === 0) {
    return { ok: false, mensagem: 'Informe o nome do produto.' }
  }

  if (!Number.isFinite(entrada.preco) || entrada.preco < 0) {
    return { ok: false, mensagem: 'Informe um preço válido (número maior ou igual a zero).' }
  }

  if (!ehInteiroNaoNegativo(entrada.quantidadeInicialEstoque)) {
    return {
      ok: false,
      mensagem: 'A quantidade inicial em estoque deve ser um número inteiro maior ou igual a zero.',
    }
  }

  if (!ehInteiroNaoNegativo(entrada.quantidadeVendida)) {
    return {
      ok: false,
      mensagem: 'A quantidade vendida deve ser um número inteiro maior ou igual a zero.',
    }
  }

  if (entrada.quantidadeVendida > entrada.quantidadeInicialEstoque) {
    return { ok: false, mensagem: MENSAGEM_ESTOQUE_INSUFICIENTE }
  }

  const estoqueAtualizado =
    entrada.quantidadeInicialEstoque - entrada.quantidadeVendida

  return {
    ok: true,
    resumo: {
      nomeProduto: nome,
      precoFormatado: formatarPrecoExemploTrabalho(entrada.preco),
      estoqueAntesDaVenda: entrada.quantidadeInicialEstoque,
      quantidadeVendida: entrada.quantidadeVendida,
      estoqueAtualizado,
    },
  }
}
