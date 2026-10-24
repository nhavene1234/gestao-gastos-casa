import { useMemo, useState } from 'react'
import Modal from '../Modal'
import api, { mensagemErro } from '../../services/api'
import { formatarMT, hojeISO } from '../../utils/format'

// Converte os itens marcados como comprados em compras reais
export default function RegistarListaDialog({ lista, categorias, onConcluido, onCancelar }) {
  const elegiveis = useMemo(() => lista.itens.filter((i) => i.comprado && !i.registado), [lista])

  const [dia, setDia] = useState(hojeISO())
  const [linhas, setLinhas] = useState(() =>
    Object.fromEntries(
      elegiveis.map((i) => [
        i.id,
        {
          quantidade: String(i.quantidade),
          preco: i.precoEstimado != null ? String(i.precoEstimado) : '',
          categoriaId: i.categoriaId ? String(i.categoriaId) : '',
        },
      ]),
    ),
  )
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  function alterar(id, campo, valor) {
    setLinhas((atual) => ({ ...atual, [id]: { ...atual[id], [campo]: valor } }))
  }

  // soma em cêntimos para evitar erros de arredondamento
  const total = useMemo(() => {
    const cêntimos = elegiveis.reduce((soma, i) => {
      const l = linhas[i.id]
      const q = Number(l.quantidade)
      const p = Number(l.preco)
      return q > 0 && p > 0 ? soma + Math.round(q * p * 100) : soma
    }, 0)
    return cêntimos / 100
  }, [elegiveis, linhas])

  async function submeter(evento) {
    evento.preventDefault()
    setErro('')

    if (!dia) return setErro('Indique a data da compra.')

    for (const i of elegiveis) {
      const l = linhas[i.id]
      if (!l.categoriaId) return setErro(`Escolha a categoria de "${i.nome}".`)
      if (!(Number(l.quantidade) > 0)) return setErro(`Indique a quantidade de "${i.nome}".`)
      if (!(Number(l.preco) > 0)) return setErro(`Indique o preço unitário de "${i.nome}".`)
    }

    const corpo = {
      dataCompra: dia,
      itens: elegiveis.map((i) => ({
        itemId: i.id,
        categoriaId: Number(linhas[i.id].categoriaId),
        quantidade: Number(linhas[i.id].quantidade),
        precoUnitario: Number(linhas[i.id].preco),
      })),
    }

    setAEnviar(true)
    try {
      const { data } = await api.post(`/listas/${lista.id}/registar`, corpo)
      onConcluido(data)
    } catch (e) {
      setErro(mensagemErro(e))
      setAEnviar(false)
    }
  }

  return (
    <Modal titulo="Registar como compras" onFechar={onCancelar} largura={780}>
      <form onSubmit={submeter} noValidate>
        <p className="dialogo-texto">
          Confirme o preço que realmente pagou e a categoria de cada item de <strong>{lista.titulo}</strong>. Vão
          passar a aparecer em <strong>Compras</strong> e nas estatísticas.
        </p>

        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        <div className="field" style={{ maxWidth: 240 }}>
          <label className="label" htmlFor="reg-dia">
            Data da compra
          </label>
          <input id="reg-dia" className="input" type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
        </div>

        {elegiveis.map((i) => {
          const l = linhas[i.id]
          return (
            <div key={i.id} className="reg-linha">
              <div className="reg-nome">{i.nome}</div>

              <div className="field">
                <label className="label" htmlFor={`q-${i.id}`}>
                  Quantidade
                </label>
                <input
                  id={`q-${i.id}`}
                  className="input num"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={l.quantidade}
                  onChange={(e) => alterar(i.id, 'quantidade', e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor={`p-${i.id}`}>
                  Preço unitário (MT)
                </label>
                <input
                  id={`p-${i.id}`}
                  className="input num"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  value={l.preco}
                  onChange={(e) => alterar(i.id, 'preco', e.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor={`c-${i.id}`}>
                  Categoria
                </label>
                <select
                  id={`c-${i.id}`}
                  className="input"
                  value={l.categoriaId}
                  onChange={(e) => alterar(i.id, 'categoriaId', e.target.value)}
                >
                  <option value="">Escolher</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}

        <div className="total-preview">
          <span>
            Total a registar ({elegiveis.length} {elegiveis.length === 1 ? 'item' : 'itens'})
          </span>
          <strong className="num">{formatarMT(total)}</strong>
        </div>

        <div className="modal-rodape">
          <button type="button" className="btn btn-ghost" onClick={onCancelar} disabled={aEnviar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={aEnviar}>
            {aEnviar ? <span className="spinner" /> : 'Registar compras'}
          </button>
        </div>
      </form>
    </Modal>
  )
}