import Modal from './Modal'

export default function ConfirmDialog({
  titulo,
  children,
  rotuloConfirmar = 'Confirmar',
  perigo = false,
  aProcessar = false,
  onConfirmar,
  onCancelar,
}) {
  return (
    <Modal titulo={titulo} onFechar={onCancelar} largura={440}>
      <div className="dialogo-texto">{children}</div>
      <div className="modal-rodape">
        <button type="button" className="btn btn-ghost" onClick={onCancelar} disabled={aProcessar}>
          Cancelar
        </button>
        <button
          type="button"
          className={`btn ${perigo ? 'btn-danger' : 'btn-primary'}`}
          onClick={onConfirmar}
          disabled={aProcessar}
        >
          {aProcessar ? <span className="spinner" /> : rotuloConfirmar}
        </button>
      </div>
    </Modal>
  )
}