import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ titulo, onFechar, children, largura = 520 }) {
  // Esc fecha a janela e a página por trás não desliza
  useEffect(() => {
    const aoPremir = (evento) => {
      if (evento.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', aoPremir)
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', aoPremir)
      document.body.style.overflow = anterior
    }
  }, [onFechar])

  return (
    <div
      className="modal-fundo"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onFechar()
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={titulo} style={{ maxWidth: largura }}>
        <header className="modal-topo">
          <h3>{titulo}</h3>
          <button type="button" className="icon-btn" onClick={onFechar} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>
        <div className="modal-corpo">{children}</div>
      </div>
    </div>
  )
}