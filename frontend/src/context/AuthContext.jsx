import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import api, { CHAVE_SESSAO, definirAoExpirar } from '../services/api'

const AuthContext = createContext(null)

function lerSessao() {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO)
    return bruto ? JSON.parse(bruto) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(lerSessao)

  const guardar = useCallback((dados) => {
    const nova = {
      token: dados.token,
      utilizador: {
        id: dados.id,
        nome: dados.nome,
        email: dados.email,
        papel: dados.papel,
      },
    }
    localStorage.setItem(CHAVE_SESSAO, JSON.stringify(nova))
    setSessao(nova)
  }, [])

  const sair = useCallback(() => {
    localStorage.removeItem(CHAVE_SESSAO)
    setSessao(null)
  }, [])

  const entrar = useCallback(
    async (email, senha) => {
      const { data } = await api.post('/auth/login', { email, senha })
      guardar(data)
    },
    [guardar],
  )

  const registar = useCallback(
    async (nome, email, senha) => {
      const { data } = await api.post('/auth/registo', { nome, email, senha })
      guardar(data)
    },
    [guardar],
  )

  useEffect(() => {
    definirAoExpirar(sair)
  }, [sair])

  const valor = useMemo(
    () => ({ sessao, utilizador: sessao?.utilizador ?? null, entrar, registar, sair }),
    [sessao, entrar, registar, sair],
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth tem de ser usado dentro de AuthProvider')
  }
  return contexto
}