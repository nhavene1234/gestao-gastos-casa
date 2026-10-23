import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Bell, Check, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const ICONES = {
  sucesso: Check,
  erro: X,
  aviso: Bell,
  info: Info,
}

let proximoId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remover = useCallback((id) => {
    setToasts((lista) => lista.filter((t) => t.id !== id))
  }, [])

  // tipo: 'sucesso' | 'erro' | 'aviso' | 'info'
  const notificar = useCallback(
    (mensagem, tipo = 'sucesso') => {
      const id = proximoId++
      setToasts((lista) => [...lista, { id, mensagem, tipo }])
      setTimeout(() => remover(id), tipo === 'aviso' ? 8000 : 4500)
    },
    [remover],
  )

  const valor = useMemo(() => ({ notificar }), [notificar])

  return (
    <ToastContext.Provider value={valor}>
      {children}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => {
          const Icone = ICONES[t.tipo] ?? Info
          return (
            <div key={t.id} className={`toast toast--${t.tipo}`} role="status">
              <Icone size={18} />
              <span>{t.mensagem}</span>
              <button type="button" onClick={() => remover(t.id)} aria-label="Fechar aviso">
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const contexto = useContext(ToastContext)
  if (!contexto) {
    throw new Error('useToast tem de ser usado dentro de ToastProvider')
  }
  return contexto
}