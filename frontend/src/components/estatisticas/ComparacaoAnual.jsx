import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import useDados from '../../hooks/useDados'
import { MESES_CURTOS } from '../../utils/datas'
import { formatarMT, formatarNumero } from '../../utils/format'
import { abreviar, COR_ANTERIOR, COR_ATUAL, COR_EIXO, COR_GRELHA, ESTILO_TOOLTIP } from '../../utils/graficos'
import Secao from './Secao'
import Variacao from './Variacao'

export default function ComparacaoAnual({ ano }) {
  const { dados, erro, aCarregar, recarregar } = useDados('/estatisticas/comparacao/anual', { ano })

  const pontos = dados
    ? dados.meses.map((m) => ({
        mes: MESES_CURTOS[m.mes - 1],
        atual: Number(m.atual),
        anterior: Number(m.anterior),
      }))
    : []

  const vazio = dados && Number(dados.totalAno) === 0 && Number(dados.totalAnoAnterior) === 0

  return (
    <Secao
      titulo="Comparação entre anos"
      subtitulo={dados ? `${dados.ano} contra ${dados.anoAnterior}, mês a mês` : ''}
      aCarregar={aCarregar && !dados}
      erro={erro}
      onRepetir={recarregar}
    >
      {dados && (
        <>
          <div className="mini-stats">
            <article className="comp-item">
              <span className="comp-rotulo">Total em {dados.ano}</span>
              <div className="stat-valor num" style={{ fontSize: 24 }}>
                {formatarNumero(dados.totalAno)}
                <small>MT</small>
              </div>
            </article>
            <article className="comp-item">
              <span className="comp-rotulo">Total em {dados.anoAnterior}</span>
              <div className="stat-valor num" style={{ fontSize: 24 }}>
                {formatarNumero(dados.totalAnoAnterior)}
                <small>MT</small>
              </div>
            </article>
            <article className="comp-item">
              <span className="comp-rotulo">Variação</span>
              <Variacao valor={dados.variacaoPercentual} />
            </article>
          </div>

          {vazio ? (
            <p className="vazio-texto">Ainda não há compras nestes dois anos.</p>
          ) : (
            <div
              className="grafico"
              role="img"
              aria-label={`Gastos mensais de ${dados.ano} comparados com ${dados.anoAnterior}`}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pontos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COR_GRELHA} />
                  <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: COR_EIXO, fontSize: 13 }} />
                  <YAxis
                    tickFormatter={abreviar}
                    tickLine={false}
                    axisLine={false}
                    width={60}
                    tick={{ fill: COR_EIXO, fontSize: 13 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgb(15 23 42 / 4%)' }}
                    contentStyle={ESTILO_TOOLTIP}
                    formatter={(valor, nome) => [formatarMT(valor), nome]}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="anterior" name={String(dados.anoAnterior)} fill={COR_ANTERIOR} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="atual" name={String(dados.ano)} fill={COR_ATUAL} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Secao>
  )
}