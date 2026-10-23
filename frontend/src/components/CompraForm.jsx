import { useMemo, useState } from 'react'
import Modal from './Modal'
import api, { mensagemErro } from '../services/api'
import { formatarMT, hojeISO } from '../utils/format'

// Formulário para registar ou editar uma compra.
// O produto é identificado por nome + categoria: se já existir é reutilizado, senão é criado.
export default function CompraForm({ compra, categorias, produtos, onGuardada, onFechar }) {
  const eEdicao = Boolean(compra)

  const [nome, setNome] = useState(compra?.produtoNome ?? '')
  const [categoriaId, setCategoriaId] = useState(compra ? String(compra.categoriaId) : '')
  const [quantidade, setQuantidade] = useState(compra ? String(compra.quantidade) : '1')
  const [preco, setPreco] = useState(compra ? String(compra.precoUnitario) : '')
  const [data, setData] = useState(compra?.dataCompra ?? hojeISO())
  const [notas, setNotas] = useState(compra?.notas ?? '')
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  const nomesConhecidos = useMemo(() => [...new Set(produtos.map((p) => p.nome))], [produtos])

  const produtoExistente = useMemo(
    () =>
      produtos.some(
        (p) =>
          p.nome.toLowerCase() === nome.trim().toLowerCase() && String(p.categoriaId) === categoriaId,
      ),
    [produtos, nome, categoriaId],
  )

  const total = useMemo(() => {
    const q = Number(quantidade)
    const p = Number(preco)
    if (!(q > 0) || !(p > 0)) return null
    return Math.round(q * p * 100) / 100
  }, [quantidade, preco])

  // Ao escolher um produto conhecido, a categoria é preenchida sozinha
  function alterarNome(valor) {
    setNome(valor)
    if (!categoriaId) {
      const iguais = produtos.filter((p) => p.nome.toLowerCase() === valor.trim().toLowerCase())
      if (iguais.length > 0) {
        setCategoriaId(String(iguais[0].categoriaId))
      }
    }
  }

  async function submeter(evento) {
    evento.preventDefault()
    setErro('')

    if (!nome.trim()) return setErro('Indique o nome do produto.')
    if (!categoriaId) return setErro('Escolha uma categoria.')
    if (!(Number(quantidade) > 0)) return setErro('A quantidade deve ser maior que zero.')
    if (!(Number(preco) > 0)) return setErro('O preço unitário deve ser maior que zero.')
    if (!data) return setErro('Indique a data da compra.')

    const corpo = {
      produtoNome: nome.trim(),
      categoriaId: Number(categoriaId),
      quantidade: Number(quantidade),
      precoUnitario: Number(preco),
      dataCompra: data,
      notas: notas.trim() || null,
    }

    setAEnviar(true)
    try {
      const { data: resposta } = eEdicao
        ? await api.put(`/compras/${compra.id}`, corpo)
        : await api.post('/compras', corpo)
      onGuardada(resposta)
    } catch (e) {
      setErro(mensagemErro(e))
      setAEnviar(false)
    }
  }

  return (
    <Modal titulo={eEdicao ? 'Editar compra' : 'Registar compra'} onFechar={onFechar}>
      <form onSubmit={submeter} noValidate>
        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        <div className="form-grid">
          <div className="field full">
            <label className="label" htmlFor="produto">
              Produto
            </label>
            <input
              id="produto"
              className="input"
              list="produtos-lista"
              placeholder="Ex.: Arroz 5kg"
              autoComplete="off"
              value={nome}
              onChange={(e) => alterarNome(e.target.value)}
              maxLength={120}
              autoFocus
            />
            <datalist id="produtos-lista">
              {nomesConhecidos.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
            {nome.trim() && categoriaId && (
              <span className="hint">
                {produtoExistente
                  ? 'Produto já existente: a compra fica associada a ele.'
                  : 'Produto novo: será criado automaticamente.'}
              </span>
            )}
          </div>

          <div className="field full">
            <label className="label" htmlFor="categoria">
              Categoria
            </label>
            <select
              id="categoria"
              className="input"
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
            >
              <option value="">Escolha uma categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label" htmlFor="quantidade">
              Quantidade
            </label>
            <input
              id="quantidade"
              className="input num"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="preco">
              Preço unitário (MT)
            </label>
            <input
              id="preco"
              className="input num"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </div>

          <div className="field full">
            <label className="label" htmlFor="data">
              Data da compra
            </label>
            <input
              id="data"
              className="input"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </div>

          <div className="field full">
            <label className="label" htmlFor="notas">
              Notas (opcional)
            </label>
            <input
              id="notas"
              className="input"
              placeholder="Ex.: promoção no mercado"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              maxLength={255}
            />
          </div>
        </div>

        <div className="total-preview">
          <span>Total desta compra</span>
          <strong className="num">{total === null ? '—' : formatarMT(total)}</strong>
        </div>

        <div className="modal-rodape">
          <button type="button" className="btn btn-ghost" onClick={onFechar} disabled={aEnviar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={aEnviar}>
            {aEnviar ? <span className="spinner" /> : eEdicao ? 'Guardar alterações' : 'Guardar compra'}
          </button>
        </div>
      </form>
    </Modal>
  )
}