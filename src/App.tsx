import { type FormEvent, useState } from 'react'
import type { ProdutoCadastrado } from './utils/venda.ts'
import {
  type ResultadoProcessamento,
  cadastrarProduto,
  formatarPrecoExemploTrabalho,
  MENSAGEM_ESTOQUE_INSUFICIENTE,
  processarVenda,
} from './utils/venda.ts'

/** Fluxo em duas etapas: primeiro cadastra o produto, depois registra vendas sobre o estoque atual. */
type Etapa = 'cadastro' | 'venda'

export function App() {
  const [etapa, setEtapa] = useState<Etapa>('cadastro')
  const [produto, setProduto] = useState<ProdutoCadastrado | null>(null)

  const [nomeProduto, setNomeProduto] = useState('')
  const [preco, setPreco] = useState('')
  const [quantidadeInicialEstoque, setQuantidadeInicialEstoque] = useState('')
  const [quantidadeVendida, setQuantidadeVendida] = useState('')

  const [mensagemCadastro, setMensagemCadastro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoProcessamento | null>(null)

  /** Volta ao início: útil para cadastrar outro produto do zero. */
  function reiniciarFluxo() {
    setEtapa('cadastro')
    setProduto(null)
    setNomeProduto('')
    setPreco('')
    setQuantidadeInicialEstoque('')
    setQuantidadeVendida('')
    setMensagemCadastro(null)
    setResultado(null)
  }

  /** Etapa 1: grava nome, preço e estoque inicial na memória e abre a etapa de venda. */
  function aoCadastrarProduto(evento: FormEvent) {
    evento.preventDefault()
    setMensagemCadastro(null)
    setResultado(null)

    if (preco.trim() === '') {
      setMensagemCadastro('Informe o preço.')
      return
    }
    if (quantidadeInicialEstoque.trim() === '') {
      setMensagemCadastro('Informe a quantidade inicial em estoque.')
      return
    }

    const precoNumero = Number(preco.replace(',', '.'))
    const estoqueInicialNumero = Number(quantidadeInicialEstoque)
    const saida = cadastrarProduto({
      nomeProduto,
      preco: precoNumero,
      quantidadeInicialEstoque: estoqueInicialNumero,
    })

    if (!saida.ok) {
      setMensagemCadastro(saida.mensagem)
      return
    }

    setProduto(saida.produto)
    setEtapa('venda')
    setQuantidadeVendida('')
  }

  /** Etapa 2: aplica a venda sobre o estoque atual e, se der certo, atualiza o estoque para a próxima venda. */
  function aoProcessarVenda(evento: FormEvent) {
    evento.preventDefault()
    if (!produto) return

    if (quantidadeVendida.trim() === '') {
      setResultado({ ok: false, mensagem: 'Informe a quantidade vendida.' })
      return
    }

    const vendidaNumero = Number(quantidadeVendida)
    const saida = processarVenda({
      nomeProduto: produto.nomeProduto,
      preco: produto.preco,
      quantidadeInicialEstoque: produto.estoqueAtual,
      quantidadeVendida: vendidaNumero,
    })

    setResultado(saida)

    if (saida.ok) {
      setProduto((anterior) =>
        anterior ? { ...anterior, estoqueAtual: saida.resumo.estoqueAtualizado } : anterior,
      )
      setQuantidadeVendida('')
    }
  }

  const erroOficialDeEstoque =
    resultado && resultado.ok === false && resultado.mensagem === MENSAGEM_ESTOQUE_INSUFICIENTE

  return (
    <div className="pagina">
      <header className="cabecalho">
        <h1>Mini Projeto — Controle de Estoque</h1>
        <p className="subtitulo">
          Em duas etapas: primeiro cadastre o produto e o estoque; depois informe cada venda e veja o
          estoque atualizado.
        </p>
        <ol className="indicador-etapas" aria-label="Etapas do fluxo">
          <li className={etapa === 'cadastro' ? 'ativa' : 'concluida'}>Cadastro do produto</li>
          <li className={etapa === 'venda' ? 'ativa' : ''}>Venda e atualização do estoque</li>
        </ol>
      </header>

      <main className="conteudo">
        {etapa === 'cadastro' ? (
          <form className="cartao formulario" onSubmit={aoCadastrarProduto}>
            <h2 className="titulo-etapa">Etapa 1 — Cadastro</h2>
            <p className="texto-etapa">Informe nome, preço e quantidade inicial em estoque.</p>

            <div className="campo">
              <label htmlFor="nomeProduto">Nome do produto</label>
              <input
                id="nomeProduto"
                name="nomeProduto"
                autoComplete="off"
                value={nomeProduto}
                onChange={(e) => setNomeProduto(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="preco">Preço</label>
              <input
                id="preco"
                name="preco"
                type="text"
                inputMode="decimal"
                placeholder="Ex.: 3500 ou 3500,50"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />
            </div>

            <div className="campo">
              <label htmlFor="quantidadeInicialEstoque">Quantidade inicial em estoque</label>
              <input
                id="quantidadeInicialEstoque"
                name="quantidadeInicialEstoque"
                type="number"
                min={0}
                step={1}
                value={quantidadeInicialEstoque}
                onChange={(e) => setQuantidadeInicialEstoque(e.target.value)}
              />
            </div>

            <button className="botao-primario" type="submit">
              Cadastrar e ir para venda
            </button>

            {mensagemCadastro && (
              <p className="mensagem-erro" role="alert">
                {mensagemCadastro}
              </p>
            )}
          </form>
        ) : (
          <>
            {produto && (
              <section className="cartao resumo-produto" aria-label="Produto cadastrado">
                <h2 className="titulo-etapa">Etapa 2 — Venda</h2>
                <p className="texto-etapa">
                  O estoque abaixo é o <strong>atual</strong>; cada venda bem-sucedida já atualiza esse
                  número para a próxima.
                </p>
                <ul className="lista-resumo lista-resumo-compacta">
                  <li>
                    <span className="rotulo">Produto:</span>{' '}
                    <span className="valor">{produto.nomeProduto}</span>
                  </li>
                  <li>
                    <span className="rotulo">Preço:</span>{' '}
                    <span className="valor">{formatarPrecoExemploTrabalho(produto.preco)}</span>
                  </li>
                  <li>
                    <span className="rotulo">Estoque disponível agora:</span>{' '}
                    <span className="valor">{produto.estoqueAtual} unidades</span>
                  </li>
                </ul>

                <form className="formulario formulario-venda" onSubmit={aoProcessarVenda}>
                  <div className="campo">
                    <label htmlFor="quantidadeVendida">Quantidade vendida</label>
                    <input
                      id="quantidadeVendida"
                      name="quantidadeVendida"
                      type="number"
                      min={0}
                      step={1}
                      value={quantidadeVendida}
                      onChange={(e) => setQuantidadeVendida(e.target.value)}
                    />
                  </div>
                  <button className="botao-primario" type="submit">
                    Processar venda
                  </button>
                </form>

                <button className="botao-secundario" type="button" onClick={reiniciarFluxo}>
                  Novo cadastro (recomeçar)
                </button>
              </section>
            )}

            {resultado && (
              <section
                className="cartao resultado"
                aria-live="polite"
                aria-label="Resultado do processamento da venda"
              >
                {resultado.ok ? (
                  <ul className="lista-resumo">
                    <li>
                      <span className="rotulo">Produto:</span>{' '}
                      <span className="valor">{resultado.resumo.nomeProduto}</span>
                    </li>
                    <li>
                      <span className="rotulo">Preço:</span>{' '}
                      <span className="valor">{resultado.resumo.precoFormatado}</span>
                    </li>
                    <li>
                      <span className="rotulo">Estoque antes da venda:</span>{' '}
                      <span className="valor">{resultado.resumo.estoqueAntesDaVenda} unidades</span>
                    </li>
                    <li>
                      <span className="rotulo">Venda realizada:</span>{' '}
                      <span className="valor">{resultado.resumo.quantidadeVendida} unidades</span>
                    </li>
                    <li>
                      <span className="rotulo">Estoque atualizado:</span>{' '}
                      <span className="valor">{resultado.resumo.estoqueAtualizado} unidades</span>
                    </li>
                  </ul>
                ) : (
                  <p className={erroOficialDeEstoque ? 'mensagem-erro-oficial' : 'mensagem-erro'}>
                    {resultado.mensagem}
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
