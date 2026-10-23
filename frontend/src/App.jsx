import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import EmBreve from './components/EmBreve'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Categorias from './pages/Categorias'
import Compras from './pages/Compras'
import Dashboard from './pages/Dashboard'
import Estatisticas from './pages/Estatisticas'
import Login from './pages/Login'
import Notificacoes from './pages/Notificacoes'
import Registo from './pages/Registo'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registo" element={<Registo />} />

            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="compras" element={<Compras />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="estatisticas" element={<Estatisticas />} />
              <Route path="notificacoes" element={<Notificacoes />} />

              <Route
                path="admin/utilizadores"
                element={
                  <ProtectedRoute papel="ADMIN">
                    <EmBreve titulo="Utilizadores" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/categorias"
                element={
                  <ProtectedRoute papel="ADMIN">
                    <EmBreve titulo="Categorias padrão" />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}