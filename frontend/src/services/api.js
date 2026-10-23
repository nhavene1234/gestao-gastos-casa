import axios from 'axios'

export const CHAVE_SESSAO = 'gastos.sessao'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 15000,
})

// Função chamada quando o servidor recusa o token (sessão expirada ou conta desativada)
let aoExpirar = () => {}
export function definirAoExpirar(funcao) {
  aoExpirar = funcao
}

api.interceptors.request.use((config) => {
  try {
    const sessao = JSON.parse(localStorage.getItem(CHAVE_SESSAO))
    if (sessao?.token) {
      config.headers.Authorization = `Bearer ${sessao.token}`
    }
  } catch {
    // sessão ilegível: segue sem token
  }
  return config
})

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const url = erro.config?.url || ''
    const publica = url.includes('/auth/login') || url.includes('/auth/registo')
    if (erro.response?.status === 401 && !publica) {
      aoExpirar()
    }
    return Promise.reject(erro)
  },
)

// Transforma um erro da API numa frase para mostrar ao utilizador
export function mensagemErro(erro) {
  if (!erro.response) {
    return 'Não foi possível ligar ao servidor. Confirme que o backend está a correr.'
  }

  const dados = erro.response.data

  if (Array.isArray(dados?.errors) && dados.errors.length > 0) {
    const mensagens = dados.errors.map((e) => e.defaultMessage || e.message).filter(Boolean)
    if (mensagens.length > 0) {
      return [...new Set(mensagens)].join(' ')
    }
  }

  if (dados?.message) return dados.message
  if (erro.response.status === 403) return 'Não tem permissão para esta ação.'
  if (erro.response.status === 401) return 'Sessão inválida ou expirada.'
  return 'Ocorreu um erro inesperado. Tente novamente.'
}

export default api