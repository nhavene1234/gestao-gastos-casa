import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import AuthLayout from '../components/AuthLayout'
import { useAuth } from '../context/AuthContext'
import { mensagemErro } from '../services/api'

export default function Registo() {
  const { sessao, registar } = useAuth()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [ver, setVer] = useState(false)
  const [erro, setErro] = useState('')
  const [aEnviar, setAEnviar] = useState(false)

  if (sessao) {
    return <Navigate to="/" replace />
  }

  async function submeter(evento) {
    evento.preventDefault()
    setErro('')

    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }

    setAEnviar(true)
    try {
      await registar(nome.trim(), email.trim(), senha)
    } catch (e) {
      setErro(mensagemErro(e))
      setAEnviar(false)
    }
  }

  return (
    <AuthLayout titulo="Criar conta" subtitulo="É grátis e demora menos de um minuto.">
      <form onSubmit={submeter} noValidate>
        {erro && (
          <div className="alert alert-error" role="alert">
            {erro}
          </div>
        )}

        <div className="field">
          <label className="label" htmlFor="nome">
            Nome
          </label>
          <input
            id="nome"
            className="input"
            autoComplete="name"
            placeholder="O seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

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
              autoComplete="new-password"
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
          <span className="hint">Mínimo de 6 caracteres.</span>
        </div>

        <div className="field">
          <label className="label" htmlFor="confirmar">
            Confirmar senha
          </label>
          <input
            id="confirmar"
            className="input"
            type={ver ? 'text' : 'password'}
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
        </div>

        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={aEnviar || !nome || !email || !senha || !confirmar}
        >
          {aEnviar ? <span className="spinner" /> : 'Criar conta'}
        </button>
      </form>

      <p className="auth-alt">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  )
}