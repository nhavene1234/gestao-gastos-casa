import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Modal from '../Modal'
import api, { mensagemErro } from '../../services/api'

// utilizador = null: criar. Com utilizador: editar.
export default function UtilizadorForm({ utilizador, eEuProprio = false, onGuardado, onFechar }) {
  const eEdicao = Boolean(utilizador)

  const [nome, setNome] = useState(utilizador?.nome ?? '')
  const [email, setEmail] = useState(utilizador?.email ?? '')
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
  const [papel, setPapel] = useState(utilizador?.papel ?? 'UTILIZADOR')
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  async function submeter(evento) {
    evento.preventDefault()
    setErro('')

    if (!nome.trim()) return setErro('Indique o nome.')
    if (!email.trim()) return setErro('Indique o email.')
    if (!eEdicao && senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.')

    const corpo = eEdicao
      ? { nome: nome.trim(), email: email.trim(), papel }
      : { nome: nome.trim(), email: email.trim(), senha, papel }

    setAEnviar(true)
    try {
      const { data } = eEdicao
        ? await api.put(`/admin/utilizadores/${utilizador.id}`, corpo)
        : await api.post('/admin/utilizadores', corpo)
      onGuardado(data)
    } catch (e) {
      setErro(mensagemErro(e))
      setAEnviar(false)
    }
  }

  return (
    <Modal titulo={eEdicao ? 'Editar utilizador' : 'Novo utilizador'} onFechar={onFechar}>
      <form onSubmit={submeter} noValidate>
        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="u-nome">
            Nome
          </label>
          <input
            id="u-nome"
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={100}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="u-email">
            Email
          </label>
          <input
            id="u-email"
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={120}
          />
        </div>

        {!eEdicao && (
          <div className="field">
            <label className="label" htmlFor="u-senha">
              Senha inicial
            </label>
            <div className="input-wrap">
              <input
                id="u-senha"
                className="input"
                type={ver ? 'text' : 'password'}
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setVer((v) => !v)}
                aria-label={ver ? 'Esconder senha' : 'Mostrar senha'}
              >
                {ver ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="hint">Mínimo de 6 caracteres. Comunique-a ao utilizador.</span>
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="u-papel">
            Papel
          </label>
          <select
            id="u-papel"
            className="input"
            value={papel}
            onChange={(e) => setPapel(e.target.value)}
            disabled={eEuProprio}
          >
            <option value="UTILIZADOR">Utilizador (gere só os seus dados)</option>
            <option value="ADMIN">Administrador (gere utilizadores e categorias padrão)</option>
          </select>
          {eEuProprio && <span className="hint">Não pode alterar o seu próprio papel.</span>}
        </div>

        <div className="modal-rodape">
          <button type="button" className="btn btn-ghost" onClick={onFechar} disabled={aEnviar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={aEnviar}>
            {aEnviar ? <span className="spinner" /> : eEdicao ? 'Guardar alterações' : 'Criar utilizador'}
          </button>
        </div>
      </form>
    </Modal>
  )
}