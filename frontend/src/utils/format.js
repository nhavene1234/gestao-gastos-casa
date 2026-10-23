const formatoNumero = new Intl.NumberFormat('pt-PT', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatarNumero = (valor) => formatoNumero.format(Number(valor ?? 0))

export const formatarMT = (valor) => `${formatarNumero(valor)} MT`

export const formatarQuantidade = (valor) =>
  Number(valor ?? 0).toLocaleString('pt-PT', { maximumFractionDigits: 2 })

// Datas "AAAA-MM-DD" lidas à mão, para não haver deslocamento por fuso horário
export function paraData(iso) {
  const [ano, mes, dia] = iso.split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

export const formatarDataLonga = (iso) =>
  paraData(iso).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })

export const formatarDataCurta = (iso) =>
  paraData(iso).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })

export const primeiroNome = (nome = '') => nome.trim().split(/\s+/)[0] || ''

export const formatarPercentagem = (valor) =>
  Math.abs(Number(valor ?? 0)).toLocaleString('pt-PT', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })

// ---------- Datas para filtros e formulários ----------

const doisDigitos = (n) => String(n).padStart(2, '0')

const paraISO = (data) =>
  `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`

export const hojeISO = () => paraISO(new Date())

// deslocamento 0 = mês atual, -1 = mês passado
export function intervaloMes(deslocamento = 0) {
  const hoje = new Date()
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento, 1)
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento + 1, 0)
  return { de: paraISO(inicio), ate: paraISO(fim) }
}

export function intervaloAno() {
  const ano = new Date().getFullYear()
  return { de: `${ano}-01-01`, ate: `${ano}-12-31` }
}