import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Modal from '../Modal'
import api, { mensagemErro } from '../../services/api'

export default function NovaSenhaDialog({ utilizador, onConcluido, onCancelar }) {
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  async function submeter(evento) {
    evento.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setAEnviar(true)
    try {
      await api.patch(`/admin/utilizadores/${utilizador.id}/senha`, { novaSenha: senha })
      onConcluido()
    } catch (e) {
      setErro(mensagemErro(e))
      setAEnviar(false)
    }
  }

  return (
    <Modal titulo="Redefinir senha" onFechar={onCancelar} largura={440}>
      <form onSubmit={submeter} noValidate>
        <p className="dialogo-texto">
          Defina uma nova senha para <strong>{utilizador.nome}</strong>. A senha atual deixa de funcionar.
        </p>

        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="nova-senha">
            Nova senha
          </label>
          <div className="input-wrap">
            <input
              id="nova-senha"
              className="input"
              type={ver ? 'text' : 'password'}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              autoFocus
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
          <span className="hint">Mínimo de 6 caracteres.</span>
        </div>

        <div className="modal-rodape">
          <button type="button" className="btn btn-ghost" onClick={onCancelar} disabled={aEnviar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={aEnviar}>
            {aEnviar ? <span className="spinner" /> : 'Guardar senha'}
          </button>
        </div>
      </form>
    </Modal>
  )
}