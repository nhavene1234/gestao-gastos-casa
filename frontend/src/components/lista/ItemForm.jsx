import { useState } from 'react'
import Modal from '../Modal'
import api, { mensagemErro } from '../../services/api'
import { formatarMT } from '../../utils/format'

// item = null: acrescentar com detalhes. Com item: editar.
export default function ItemForm({ lista, item, categorias, onGuardado, onFechar }) {
  const eEdicao = Boolean(item)

  const [nome, setNome] = useState(item?.nome ?? '')
  const [quantidade, setQuantidade] = useState(item ? String(item.quantidade) : '1')
  const [preco, setPreco] = useState(item?.precoEstimado != null ? String(item.precoEstimado) : '')
  const [categoriaId, setCategoriaId] = useState(item?.categoriaId ? String(item.categoriaId) : '')
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  const total = Number(quantidade) > 0 && Number(preco) > 0 ? Number(quantidade) * Number(preco) : null

  async function submeter(evento) {
    evento.preventDefault()
    setErro('')

    if (!nome.trim()) return setErro('Indique o nome do item.')
    if (!(Number(quantidade) > 0)) return setErro('A quantidade deve ser maior que zero.')
    if (preco && !(Number(preco) > 0)) return setErro('O preço estimado deve ser maior que zero.')

    const corpo = {
      nome: nome.trim(),
      quantidade: Number(quantidade),
      precoEstimado: preco ? Number(preco) : null,
      categoriaId: categoriaId ? Number(categoriaId) : null,
    }

    setAEnviar(true)
    try {
      const { data } = eEdicao
        ? await api.put(`/listas/${lista.id}/itens/${item.id}`, corpo)
        : await api.post(`/listas/${lista.id}/itens`, corpo)
      onGuardado(data)
    } catch (e) {
      setErro(mensagemErro(e))
      setAEnviar(false)
    }
  }

  return (
    <Modal titulo={eEdicao ? 'Editar item' : 'Novo item'} onFechar={onFechar} largura={460}>
      <form onSubmit={submeter} noValidate>
        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="item-nome">
            Item
          </label>
          <input
            id="item-nome"
            className="input"
            placeholder="Ex.: Arroz 5kg"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={120}
            autoFocus
          />
        </div>

        <div className="form-grid">
          <div className="field">
            <label className="label" htmlFor="item-qtd">
              Quantidade
            </label>
            <input
              id="item-qtd"
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
            <label className="label" htmlFor="item-preco">
              Preço estimado (MT)
            </label>
            <input
              id="item-preco"
              className="input num"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="Opcional"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="item-cat">
            Categoria (opcional)
          </label>
          <select id="item-cat" className="input" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
            <option value="">Escolher mais tarde</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <span className="hint">O preço e a categoria podem ficar em branco e preencher-se ao registar a compra.</span>
        </div>

        <div className="total-preview">
          <span>Total estimado</span>
          <strong className="num">{total === null ? '—' : formatarMT(total)}</strong>
        </div>

        <div className="modal-rodape">
          <button type="button" className="btn btn-ghost" onClick={onFechar} disabled={aEnviar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={aEnviar}>
            {aEnviar ? <span className="spinner" /> : eEdicao ? 'Guardar alterações' : 'Acrescentar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}