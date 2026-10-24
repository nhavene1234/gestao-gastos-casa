import { paraData } from './format'

const MS_DIA = 24 * 60 * 60 * 1000
const doisDigitos = (n) => String(n).padStart(2, '0')

// Dias entre hoje e a data da lista (positivo = no futuro)
export function diasAte(iso) {
  const hoje = new Date()
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return Math.round((paraData(iso) - base) / MS_DIA)
}

// "AAAA-MM-DD" de hoje + n dias
export function dataEmDias(n) {
  const hoje = new Date()
  const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + n)
  return `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}`
}

// Texto e cor do selo da data: verde = hoje, azul = futuro, âmbar = passou com itens por comprar
export function rotuloData(iso, temPendentes) {
  const d = diasAte(iso)

  if (d === 0) return { texto: 'Hoje', tipo: 'success' }
  if (d === 1) return { texto: 'Amanhã', tipo: 'info' }
  if (d > 1) return { texto: `Em ${d} dias`, tipo: 'info' }

  const quando = d === -1 ? 'Ontem' : `Há ${-d} dias`
  return temPendentes
    ? { texto: `${quando} · por concluir`, tipo: 'warning' }
    : { texto: quando, tipo: 'neutral' }
}