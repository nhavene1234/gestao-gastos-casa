export const COR_ATUAL = '#0F766E'
export const COR_ANTERIOR = '#94A3B8'
export const COR_EIXO = '#64748B'
export const COR_GRELHA = '#E2E8F0'

export const ESTILO_TOOLTIP = {
  borderRadius: 12,
  border: '1px solid #E2E8F0',
  boxShadow: '0 8px 24px rgb(15 23 42 / 10%)',
  fontSize: 14,
}

// 1500 -> "1,5 mil"
export function abreviar(valor) {
  const n = Number(valor)
  if (n >= 1000000) {
    return `${(n / 1000000).toLocaleString('pt-PT', { maximumFractionDigits: 1 })} M`
  }
  if (n >= 1000) {
    return `${(n / 1000).toLocaleString('pt-PT', { maximumFractionDigits: 1 })} mil`
  }
  return String(n)
}