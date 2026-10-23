const doisDigitos = (n) => String(n).padStart(2, '0')

const paraISO = (data) =>
  `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`

export const NOMES_MES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const MESES_CURTOS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

export const capitalizar = (texto = '') => texto.charAt(0).toUpperCase() + texto.slice(1)

// Primeiro e último dia de um mês (mes de 1 a 12)
export function intervaloDoMes(ano, mes) {
  return {
    de: paraISO(new Date(ano, mes - 1, 1)),
    ate: paraISO(new Date(ano, mes, 0)),
  }
}

// Os últimos n dias, incluindo hoje
export function ultimosDias(n) {
  const fim = new Date()
  const inicio = new Date(fim.getFullYear(), fim.getMonth(), fim.getDate() - (n - 1))
  return { de: paraISO(inicio), ate: paraISO(fim) }
}

// "2026-10-21" -> "21/10"
export function rotuloDia(iso) {
  const [, mes, dia] = iso.split('-')
  return `${dia}/${mes}`
}