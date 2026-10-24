import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  Bell,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  ShieldCheck,
  ShoppingCart,
  Tag,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { primeiroNome } from '../utils/format'
import Logo from './Logo'

const MENU = [
  { para: '/', rotulo: 'Painel', icone: LayoutDashboard, exato: true },
  { para: '/compras', rotulo: 'Compras', icone: ShoppingCart },
  { para: '/lista-compras', rotulo: 'Lista de compras', icone: ListChecks },
  { para: '/categorias', rotulo: 'Categorias', icone: Tag },
  { para: '/estatisticas', rotulo: 'Estatísticas', icone: Activity },
  { para: '/notificacoes', rotulo: 'Notificações', icone: Bell },
]

const MENU_ADMIN = [
  { para: '/admin/utilizadores', rotulo: 'Utilizadores', icone: Users },
  { para: '/admin/categorias', rotulo: 'Categorias padrão', icone: ShieldCheck },
]

const TITULOS = Object.fromEntries(
  [...MENU, ...MENU_ADMIN].map((item) => [item.para, item.rotulo]),
)

function ItemMenu({ item }) {
  const Icone = item.icone
  return (
    <NavLink
      to={item.para}
      end={item.exato}
      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
    >
      <Icone size={20} />
      {item.rotulo}
    </NavLink>
  )
}

export default function Layout() {
  const { utilizador, sair } = useAuth()
  const { pathname } = useLocation()
  const navegar = useNavigate()
  const [aberta, setAberta] = useState(false)
  const [naoLidas, setNaoLidas] = useState(0)

  const eAdmin = utilizador?.papel === 'ADMIN'

  // fecha o menu no telemóvel ao mudar de página
  useEffect(() => {
    setAberta(false)
  }, [pathname])

    // número do sino: ao mudar de página, de minuto a minuto e quando outra página pede
  useEffect(() => {
    let ativo = true
    const carregar = () =>
      api
        .get('/notificacoes/contagem')
        .then(({ data }) => {
          if (ativo) setNaoLidas(data.naoLidas)
        })
        .catch(() => {})

    carregar()
    const temporizador = setInterval(carregar, 60000)
    window.addEventListener('notificacoes:atualizar', carregar)

    return () => {
      ativo = false
      clearInterval(temporizador)
      window.removeEventListener('notificacoes:atualizar', carregar)
    }
  }, [pathname])

  function terminarSessao() {
    sair()
    navegar('/login', { replace: true })
  }

  return (
    <div className="shell">
      <aside className={`sidebar${aberta ? ' aberta' : ''}`}>
        <div className="sidebar-brand">
          <Logo tamanho={40} />
          <span>
            Gastos da Casa
            <small>{eAdmin ? 'Administração' : 'Controlo de gastos'}</small>
          </span>
        </div>

        <nav className="nav" aria-label="Menu principal">
          {MENU.map((item) => (
            <ItemMenu key={item.para} item={item} />
          ))}

          {eAdmin && (
            <>
              <div className="nav-title">Administração</div>
              {MENU_ADMIN.map((item) => (
                <ItemMenu key={item.para} item={item} />
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-foot">Gestão de Gastos de uma Casa</div>
      </aside>

      <div
        className={`overlay${aberta ? ' aberta' : ''}`}
        onClick={() => setAberta(false)}
        aria-hidden="true"
      />

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn menu-btn"
            onClick={() => setAberta((v) => !v)}
            aria-label={aberta ? 'Fechar menu' : 'Abrir menu'}
          >
            {aberta ? <X size={20} /> : <Menu size={20} />}
          </button>

          <h1>{TITULOS[pathname] ?? 'Painel'}</h1>
          <div className="topbar-space" />

          <NavLink
            to="/notificacoes"
            className="icon-btn"
            aria-label={`Notificações${naoLidas ? `, ${naoLidas} por ler` : ''}`}
          >
            <Bell size={20} />
            {naoLidas > 0 && <span className="bell-badge">{naoLidas > 99 ? '99+' : naoLidas}</span>}
          </NavLink>

          <div className="user-chip">
            <span className="avatar">{primeiroNome(utilizador?.nome).charAt(0).toUpperCase()}</span>
            <span className="user-chip-text">
              <strong>{primeiroNome(utilizador?.nome)}</strong>
              <span>{eAdmin ? 'Administrador' : 'Utilizador'}</span>
            </span>
          </div>

          <button type="button" className="icon-btn" onClick={terminarSessao} aria-label="Terminar sessão" title="Terminar sessão">
            <LogOut size={20} />
          </button>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}