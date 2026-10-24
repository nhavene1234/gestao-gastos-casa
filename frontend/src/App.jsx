import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Categorias from './pages/Categorias'
import Compras from './pages/Compras'
import Dashboard from './pages/Dashboard'
import Estatisticas from './pages/Estatisticas'
import ListaCompras from './pages/ListaCompras'
import Login from './pages/Login'
import Notificacoes from './pages/Notificacoes'
import Registo from './pages/Registo'
import AdminCategorias from './pages/admin/AdminCategorias'
import AdminUtilizadores from './pages/admin/AdminUtilizadores'

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
              <Route path="lista-compras" element={<ListaCompras />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="estatisticas" element={<Estatisticas />} />
              <Route path="notificacoes" element={<Notificacoes />} />

              <Route
                path="admin/utilizadores"
                element={
                  <ProtectedRoute papel="ADMIN">
                    <AdminUtilizadores />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/categorias"
                element={
                  <ProtectedRoute papel="ADMIN">
                    <AdminCategorias />
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