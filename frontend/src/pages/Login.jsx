import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { mensagemErro } from '../services/api'

export default function Login() {
  const { sessao, entrar } = useAuth()
  const local = useLocation()
  const destino = local.state?.de || '/'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [ver, setVer] = useState(false)
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  // depois de entrar, a sessão passa a existir e o utilizador é reencaminhado
  if (sessao) {
    return <Navigate to={destino} replace />
  }

  async function submeter(evento) {
    evento.preventDefault()
    setErro('')
    setAEnviar(true)
    try {
      await entrar(email.trim(), senha)
    } catch (e) {
      setErro(mensagemErro(e))
      setAEnviar(false)
    }
  }

  return (
    <AuthLayout titulo="Bem-vindo de volta" subtitulo="Entre para ver os seus gastos.">
      <form onSubmit={submeter} noValidate>
        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="input"
            type="email"
            autoComplete="email"
            placeholder="nome@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="senha">
            Senha
          </label>
          <div className="input-wrap">
            <input
              id="senha"
              className="input"
              type={ver ? 'text' : 'password'}
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button
              type="button"
              className="input-toggle"
              onClick={() => setVer((v) => !v)}
              aria-label={ver ? 'Esconder senha' : 'Mostrar senha'}
            >
              {ver ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="btn btn-primary btn-block" type="submit" disabled={aEnviar || !email || !senha}>
          {aEnviar ? <span className="spinner" /> : 'Entrar'}
        </button>
      </form>

      <p className="auth-alt">
        Ainda não tem conta? <Link to="/registo">Criar conta</Link>
      </p>
    </AuthLayout>
  )
}