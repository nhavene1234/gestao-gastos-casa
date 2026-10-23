import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import { formatarPercentagem } from '../../utils/format'

export default function Variacao({ valor }) {
  if (valor == null) {
    return <span className="badge badge-neutral">Sem gastos para comparar</span>
  }

  const v = Number(valor)

  if (v > 0) {
    return (
      <span className="badge badge-danger">
        <TrendingUp size={14} />+{formatarPercentagem(v)}%
      </span>
    )
  }
  if (v < 0) {
    return (
      <span className="badge badge-success">
        <TrendingDown size={14} />−{formatarPercentagem(v)}%
      </span>
    )
  }
  return (
    <span className="badge badge-neutral">
      <Minus size={14} />
      Igual
    </span>
  )
}