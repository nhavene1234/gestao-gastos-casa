// Cartão com título, estado de carregamento e de erro
export default function Secao({ titulo, subtitulo, acoes, aCarregar, erro, onRepetir, children }) {
  return (
    <section className="card secao">
      <header className="secao-topo">
        <div>
          <h3>{titulo}</h3>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
        {acoes}
      </header>

      {erro ? (
        <div className="alert alert-error" role="alert">
          <span style={{ flex: 1 }}>{erro}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onRepetir}>
            Tentar de novo
          </button>
        </div>
      ) : aCarregar ? (
        <div className="secao-skeleton" aria-busy="true">
          <div className="skeleton" />
        </div>
      ) : (
        children
      )}
    </section>
  )
}