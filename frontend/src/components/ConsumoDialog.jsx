import { useState } from 'react'
import Modal from './Modal'
import { hojeISO } from '../utils/format'

export default function ConsumoDialog({ compra, aProcessar, onConfirmar, onCancelar }) {
  const hoje = hojeISO()
  const [data, setData] = useState(hoje < compra.dataCompra ? compra.dataCompra : hoje)

  const invalida = !data || data < compra.dataCompra

  return (
    <Modal titulo="Marcar como acabado" onFechar={onCancelar} largura={440}>
      <p className="dialogo-texto">
        <strong>{compra.produtoNome}</strong> acabou? Indique o dia em que acabou para calcularmos quanto
        tempo durou.
      </p>

      <div className="field">
        <label className="label" htmlFor="data-fim">
          Data em que acabou
        </label>
        <input
          id="data-fim"
          type="date"
          className="input"
          min={compra.dataCompra}
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
        <span className="hint">Não pode ser anterior à data da compra.</span>
      </div>

      <div className="modal-rodape">
        <button type="button" className="btn btn-ghost" onClick={onCancelar} disabled={aProcessar}>
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onConfirmar(data)}
          disabled={aProcessar || invalida}
        >
          {aProcessar ? <span className="spinner" /> : 'Confirmar'}
        </button>
      </div>
    </Modal>
  )
}