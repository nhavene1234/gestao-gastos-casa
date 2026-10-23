import { useCallback, useEffect, useRef, useState } from 'react'
import api, { mensagemErro } from '../services/api'

// Vai buscar dados à API e volta a pedir sempre que os parâmetros mudam.
// Se o utilizador mudar o filtro depressa, só conta a resposta do último pedido.
export default function useDados(url, params) {
  const chave = JSON.stringify(params ?? {})
  const pedido = useRef(0)
  const [estado, setEstado] = useState({ dados: null, erro: '', aCarregar: true })

  const carregar = useCallback(async () => {
    const meu = ++pedido.current
    setEstado((atual) => ({ ...atual, erro: '', aCarregar: true }))
    try {
      const { data } = await api.get(url, { params: JSON.parse(chave) })
      if (meu === pedido.current) {
        setEstado({ dados: data, erro: '', aCarregar: false })
      }
    } catch (e) {
      if (meu === pedido.current) {
        setEstado((atual) => ({ ...atual, erro: mensagemErro(e), aCarregar: false }))
      }
    }
  }, [url, chave])

  useEffect(() => {
    carregar()
  }, [carregar])

  return { ...estado, recarregar: carregar }
}