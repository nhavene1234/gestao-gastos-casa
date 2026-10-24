import { useRef, useState } from 'react'
import { Pencil, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import api, { mensagemErro } from '../../services/api'
import { formatarDataLonga, formatarMT, formatarQuantidade } from '../../utils/format'
import { rotuloData } from '../../utils/lista'

export default function CartaoLista({
  lista,
  onAtualizada,
  onEditarLista,
  onApagarLista,
  onNovoItem,
  onEditarItem,
  onRegistar,
}) {
  const { notificar } = useToast()
  const campoNome = useRef(null)

  const [nome, setNome] = useState('')
  const [quantidade, setQuantidade] = useState('1')
  const [aProcessar, setAProcessar] = useState(false)

  const pendentes = lista.itens.filter((i) => !i.comprado).length
  const porRegistar = lista.itens.filter((i) => i.comprado && !i.registado).length
  const rotulo = rotuloData(lista.dataPrevista, pendentes > 0)
  const percentagem = lista.totalItens ? Math.round((lista.itensComprados / lista.totalItens) * 100) : 0

  // executa um pedido que devolve a lista atualizada
  async function executar(pedido) {
    setAProcessar(true)
    try {
      const { data } = await pedido()
      onAtualizada(data)
      return true
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
      return false
    } finally {
      setAProcessar(false)
    }
  }

  async function adicionar(evento) {
    evento.preventDefault()
    if (!nome.trim()) return

    const ok = await executar(() =>
      api.post(`/listas/${lista.id}/itens`, {
        nome: nome.trim(),
        quantidade: Number(quantidade) > 0 ? Number(quantidade) : 1,
        precoEstimado: null,
        categoriaId: null,
      }),
    )

    if (ok) {
      setNome('')
      setQuantidade('1')
      campoNome.current?.focus()
    }
  }

  const alternar = (item, comprado) =>
    executar(() => api.patch(`/listas/${lista.id}/itens/${item.id}/comprado`, { comprado }))

  const remover = (item) => executar(() => api.delete(`/listas/${lista.id}/itens/${item.id}`))

  return (
    <article className="card lista">
      <header className="lista-topo">
        <div>
          <h3>{lista.titulo}</h3>
          <div className="lista-meta">
            <span className={`badge badge-${rotulo.tipo}`}>{rotulo.texto}</span>
            <span className="lista-data">{formatarDataLonga(lista.dataPrevista)}</span>
          </div>
        </div>

        <div className="acoes">
          <button
            type="button"
            className="acao"
            title="Editar lista"
            aria-label={`Editar a lista ${lista.titulo}`}
            onClick={() => onEditarLista(lista)}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            className="acao acao--perigo"
            title="Apagar lista"
            aria-label={`Apagar a lista ${lista.titulo}`}
            onClick={() => onApagarLista(lista)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {lista.totalItens > 0 && (
        <div className="progresso">
          <div className="progresso-txt">
            <span>
              {lista.itensComprados} de {lista.totalItens} comprados
            </span>
            <span className="num">{percentagem}%</span>
          </div>
          <div
            className={`barra${percentagem === 100 ? ' completa' : ''}`}
            role="progressbar"
            aria-valuenow={percentagem}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${percentagem}%` }} />
          </div>
        </div>
      )}

      {lista.itens.length === 0 ? (
        <p className="itens-vazio" style={{ borderTop: '1px solid var(--border)' }}>
          A lista está vazia. Escreva o primeiro item em baixo.
        </p>
      ) : (
        <ul className="itens">
          {lista.itens.map((i) => (
            <li key={i.id} className={`item${i.comprado ? ' item--feito' : ''}`}>
              <label className="item-check">
                <input
                  type="checkbox"
                  checked={i.comprado}
                  disabled={i.registado || aProcessar}
                  onChange={(e) => alternar(i, e.target.checked)}
                />
                <span className="item-nome" title={i.nome}>
                  {i.nome}
                </span>
              </label>

              <span className="item-qtd num">× {formatarQuantidade(i.quantidade)}</span>

              {i.categoriaCor && (
                <span className="cat-dot" style={{ background: i.categoriaCor }} title={i.categoriaNome} />
              )}

              <span className="item-preco num">{i.totalEstimado != null ? formatarMT(i.totalEstimado) : '—'}</span>

              {i.registado ? (
                <span className="badge badge-success">Registado</span>
              ) : (
                <div className="acoes">
                  <button
                    type="button"
                    className="acao"
                    title="Editar item"
                    aria-label={`Editar ${i.nome}`}
                    onClick={() => onEditarItem(lista, i)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="acao acao--perigo"
                    title="Remover item"
                    aria-label={`Remover ${i.nome}`}
                    onClick={() => remover(i)}
                    disabled={aProcessar}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <form className="add-item" onSubmit={adicionar}>
        <input
          ref={campoNome}
          className="input add-nome"
          placeholder="Adicionar item e carregar em Enter"
          aria-label={`Novo item para ${lista.titulo}`}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={120}
          disabled={aProcessar}
        />
        <input
          className="input add-qtd num"
          type="number"
          step="0.01"
          min="0.01"
          aria-label="Quantidade"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          disabled={aProcessar}
        />
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ height: 40 }}
          onClick={() => onNovoItem(lista)}
          title="Acrescentar com preço e categoria"
        >
          <Plus size={16} />
          Detalhes
        </button>
      </form>

      <footer className="lista-rodape">
        <div className="lista-total">
          <span>Total estimado</span>
          <strong className="num">{formatarMT(lista.totalEstimado)}</strong>
          {lista.itensSemPreco > 0 && (
            <small>
              {lista.itensSemPreco} {lista.itensSemPreco === 1 ? 'item sem preço' : 'itens sem preço'}
            </small>
          )}
        </div>

        {porRegistar > 0 && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onRegistar(lista)}>
            <ShoppingCart size={16} />
            Registar {porRegistar} {porRegistar === 1 ? 'compra' : 'compras'}
          </button>
        )}
      </footer>
    </article>
  )
}