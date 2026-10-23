import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// papel (opcional): só deixa entrar quem tiver esse papel, por exemplo "ADMIN"
export default function ProtectedRoute({ children, papel }) {
  const { sessao } = useAuth()
  const local = useLocation()

  if (!sessao) {
    return <Navigate to="/login" replace state={{ de: local.pathname }} />
  }

  if (papel && sessao.utilizador.papel !== papel) {
    return <Navigate to="/" replace />
  }

  return children
}