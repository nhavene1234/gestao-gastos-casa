import { useState } from 'react'
import Modal from './Modal'
import IconeCategoria, { ICONES } from './IconeCategoria'
import api, { mensagemErro } from '../services/api'

// Paleta do design system
const CORES = [
  '#0F766E', '#14B8A6', '#0EA5E9', '#2563EB', '#6366F1', '#8B5CF6',
  '#EC4899', '#E11D48', '#F97316', '#F59E0B', '#22C55E', '#64748B',
]

// padrao = true: o admin cria ou edita uma categoria padrão do sistema
export default function CategoriaForm({ categoria, padrao = false, onGuardada, onFechar }) {
  const eEdicao = Boolean(categoria)
  const rota = padrao ? '/admin/categorias' : '/categorias'

  const [nome, setNome] = useState(categoria?.nome ?? '')
  const [cor, setCor] = useState(categoria?.cor ?? '#0F766E')
  const [icone, setIcone] = useState(categoria?.icone ?? 'tag')
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  async function submeter(evento) {
    evento.preventDefault()
    setErro('')

    if (!nome.trim()) {
      setErro('Indique o nome da categoria.')
      return
    }

    const corpo = { nome: nome.trim(), cor: cor.toUpperCase(), icone }

    setAEnviar(true)
    try {
      const { data } = eEdicao
        ? await api.put(`${rota}/${categoria.id}`, corpo)
        : await api.post(rota, corpo)
      onGuardada(data)
    } catch (e) {
      setErro(mensagemErro(e))
      setAEnviar(false)
    }
  }

  const titulo = `${eEdicao ? 'Editar' : 'Nova'} categoria${padrao ? ' padrão' : ''}`

  return (
    <Modal titulo={titulo} onFechar={onFechar}>
      <form onSubmit={submeter} noValidate>
        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        {padrao && (
          <div className="alert alert-info">Esta categoria vai aparecer para todos os utilizadores.</div>
        )}

        <div className="field">
          <label className="label" htmlFor="cat-nome">
            Nome
          </label>
          <input
            id="cat-nome"
            className="input"
            placeholder="Ex.: Educação"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={60}
            autoFocus
          />
        </div>

        <div className="field">
          <span className="label">Cor</span>
          <div className="cores">
            {CORES.map((c) => (
              <button
                key={c}
                type="button"
                className={`cor${cor.toUpperCase() === c ? ' ativo' : ''}`}
                style={{ background: c }}
                onClick={() => setCor(c)}
                aria-label={`Cor ${c}`}
                aria-pressed={cor.toUpperCase() === c}
              />
            ))}
            <input
              type="color"
              className="cor-custom"
              value={cor.toLowerCase()}
              onChange={(e) => setCor(e.target.value)}
              aria-label="Escolher outra cor"
              title="Outra cor"
            />
          </div>
        </div>

        <div className="field">
          <span className="label">Ícone</span>
          <div className="icones">
            {Object.keys(ICONES).map((chave) => (
              <button
                key={chave}
                type="button"
                className={`icone-op${icone === chave ? ' ativo' : ''}`}
                onClick={() => setIcone(chave)}
                aria-label={`Ícone ${chave}`}
                aria-pressed={icone === chave}
              >
                <IconeCategoria nome={chave} size={20} />
              </button>
            ))}
          </div>
        </div>

        <div className="cat-preview" aria-label="Pré-visualização">
          <span
            className="cat-icone"
            style={{ background: `color-mix(in srgb, ${cor} 16%, white)`, color: cor }}
          >
            <IconeCategoria nome={icone} />
          </span>
          <strong>{nome.trim() || 'Nome da categoria'}</strong>
        </div>

        <div className="modal-rodape">
          <button type="button" className="btn btn-ghost" onClick={onFechar} disabled={aEnviar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={aEnviar}>
            {aEnviar ? <span className="spinner" /> : eEdicao ? 'Guardar alterações' : 'Criar categoria'}
          </button>
        </div>
      </form>
    </Modal>
  )
}