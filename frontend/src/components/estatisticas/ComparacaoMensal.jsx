import { TrendingDown, TrendingUp } from 'lucide-react'
import useDados from '../../hooks/useDados'
import { capitalizar } from '../../utils/datas'
import { formatarMT, formatarNumero, formatarPercentagem } from '../../utils/format'
import Secao from './Secao'
import Variacao from './Variacao'

// Coral = acima da média, âmbar = perto, verde = dentro
function estadoDoMes(comp) {
  if (!comp || comp.mediaHabitual == null) {
    return { classe: '', tipo: 'neutral', icone: null, rotulo: 'Sem histórico suficiente para a média' }
  }

  const total = Number(comp.total)
  const media = Number(comp.mediaHabitual)

  if (comp.acimaDaMedia) {
    return {
      classe: 'comp--perigo',
      tipo: 'danger',
      icone: TrendingUp,
      rotulo: `${formatarPercentagem(comp.variacaoMediaPercentual)}% acima da média`,
    }
  }
  if (media > 0 && total / media >= 0.85) {
    return { classe: 'comp--aviso', tipo: 'warning', icone: TrendingUp, rotulo: 'Perto da média' }
  }
  return { classe: 'comp--ok', tipo: 'success', icone: TrendingDown, rotulo: 'Dentro da média' }
}

function Referencia({ titulo, referencia }) {
  return (
    <article className="comp-item">
      <span className="comp-rotulo">{titulo}</span>
      <div className="comp-ref">
        {capitalizar(referencia.nomeMes)} de {referencia.ano}
      </div>
      <div className="stat-valor num" style={{ fontSize: 24 }}>
        {formatarNumero(referencia.total)}
        <small>MT</small>
      </div>
      <Variacao valor={referencia.variacaoPercentual} />
      {Number(referencia.total) === 0 && <span className="stat-nota">Sem compras nesse mês.</span>}
    </article>
  )
}

export default function ComparacaoMensal({ ano, mes }) {
  const { dados, erro, aCarregar, recarregar } = useDados('/estatisticas/comparacao/mensal', { ano, mes })

  const estado = estadoDoMes(dados)
  const IconeEstado = estado.icone
  const diferenca = dados?.diferencaMedia != null ? Number(dados.diferencaMedia) : null

  return (
    <Secao
      titulo="Comparação do mês"
      subtitulo={dados ? `${capitalizar(dados.nomeMes)} de ${dados.ano}` : ''}
      aCarregar={aCarregar && !dados}
      erro={erro}
      onRepetir={recarregar}
    >
      {dados && (
        <div className="comp-grid">
          <article className={`comp-principal ${estado.classe}`}>
            <span className="comp-rotulo">Total do mês</span>
            <div className="stat-valor num">
              {formatarNumero(dados.total)}
              <small>MT</small>
            </div>
            <div className="stat-nota">
              {dados.compras} {dados.compras === 1 ? 'compra' : 'compras'}
            </div>

            <span className={`badge badge-${estado.tipo}`}>
              {IconeEstado && <IconeEstado size={14} />}
              {estado.rotulo}
            </span>

            {dados.mediaHabitual != null && (
              <div className="stat-nota">
                Média habitual: <span className="num">{formatarMT(dados.mediaHabitual)}</span>
                {diferenca !== null && diferenca !== 0 && (
                  <>
                    {' · '}
                    <span className="num">{formatarMT(Math.abs(diferenca))}</span>{' '}
                    {diferenca > 0 ? 'acima' : 'abaixo'}
                  </>
                )}
              </div>
            )}
          </article>

          <Referencia titulo="Face ao mês anterior" referencia={dados.mesAnterior} />
          <Referencia titulo="Face ao mesmo mês do ano passado" referencia={dados.mesmoMesAnoAnterior} />
        </div>
      )}
    </Secao>
  )
}