import { useState } from 'react'
import Modal from '../Modal'
import api, { mensagemErro } from '../../services/api'
import { hojeISO } from '../../utils/format'
import { dataEmDias } from '../../utils/lista'

export default function ListaForm({ lista, onGuardada, onFechar }) {
  const eEdicao = Boolean(lista)

  const [titulo, setTitulo] = useState(lista?.titulo ?? '')
  const [dia, setDia] = useState(lista?.dataPrevista ?? hojeISO())
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  async function submeter(evento) {
    evento.preventDefault()
    setErro('')

    if (!titulo.trim()) return setErro('Dê um nome à lista.')
    if (!dia) return setErro('Indique o dia das compras.')

    const corpo = { titulo: titulo.trim(), dataPrevista: dia }

    setAEnviar(true)
    try {
      const { data: resposta } = eEdicao
        ? await api.put(`/listas/${lista.id}`, corpo)
        : await api.post('/listas', corpo)
      onGuardada(resposta)
    } catch (e) {
      setErro(mensagemErro(e))
      setAEnviar(false)
    }
  }

  return (
    <Modal titulo={eEdicao ? 'Editar lista' : 'Nova lista de compras'} onFechar={onFechar} largura={460}>
      <form onSubmit={submeter} noValidate>
        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="lista-titulo">
            Nome da lista
          </label>
          <input
            id="lista-titulo"
            className="input"
            placeholder="Ex.: Compras de sábado"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            maxLength={100}
            autoFocus
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="lista-dia">
            Dia das compras
          </label>
          <input id="lista-dia" className="input" type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
          <div className="chips" style={{ marginTop: 4 }}>
            <button type="button" className="chip" onClick={() => setDia(dataEmDias(0))}>
              Hoje
            </button>
            <button type="button" className="chip" onClick={() => setDia(dataEmDias(1))}>
              Amanhã
            </button>
            <button type="button" className="chip" onClick={() => setDia(dataEmDias(7))}>
              Daqui a 1 semana
            </button>
          </div>
        </div>

        <div className="modal-rodape">
          <button type="button" className="btn btn-ghost" onClick={onFechar} disabled={aEnviar}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={aEnviar}>
            {aEnviar ? <span className="spinner" /> : eEdicao ? 'Guardar alterações' : 'Criar lista'}
          </button>
        </div>
      </form>
    </Modal>
  )
}