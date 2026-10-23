import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import useDados from '../../hooks/useDados'
import { rotuloDia, ultimosDias } from '../../utils/datas'
import { formatarMT } from '../../utils/format'
import { abreviar, COR_ATUAL, COR_EIXO, COR_GRELHA, ESTILO_TOOLTIP } from '../../utils/graficos'
import Secao from './Secao'

export default function EvolucaoDiaria() {
  const [dias, setDias] = useState(7)
  const { dados, erro, aCarregar, recarregar } = useDados('/estatisticas/por-dia', ultimosDias(dias))

  const pontos = dados ? dados.map((d) => ({ dia: rotuloDia(d.data), total: Number(d.total) })) : []
  const total = Math.round(pontos.reduce((soma, p) => soma + p.total * 100, 0)) / 100
  const maior = pontos.reduce((m, p) => (p.total > m.total ? p : m), { dia: '', total: 0 })

  const seletor = (
    <div className="chips">
      {[7, 30].map((n) => (
        <button key={n} type="button" className={`chip${dias === n ? ' ativo' : ''}`} onClick={() => setDias(n)}>
          {n} dias
        </button>
      ))}
    </div>
  )

  return (
    <Secao
      titulo="Evolução diária"
      subtitulo={`Últimos ${dias} dias`}
      acoes={seletor}
      aCarregar={aCarregar && !dados}
      erro={erro}
      onRepetir={recarregar}
    >
      {dados && (
        <>
          <p className="stat-nota" style={{ marginBottom: 8 }}>
            Total: <strong className="num">{formatarMT(total)}</strong> · Média por dia:{' '}
            <strong className="num">{formatarMT(total / dias)}</strong>
            {maior.total > 0 && (
              <>
                {' '}
                · Dia mais caro: <strong>{maior.dia}</strong> (<span className="num">{formatarMT(maior.total)}</span>)
              </>
            )}
          </p>

          {total === 0 ? (
            <p className="vazio-texto">Sem compras nestes {dias} dias.</p>
          ) : (
            <div className="grafico grafico--menor" role="img" aria-label={`Gastos diários dos últimos ${dias} dias`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pontos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COR_GRELHA} />
                  <XAxis
                    dataKey="dia"
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={14}
                    tick={{ fill: COR_EIXO, fontSize: 12 }}
                  />
                  <YAxis
                    tickFormatter={abreviar}
                    tickLine={false}
                    axisLine={false}
                    width={56}
                    tick={{ fill: COR_EIXO, fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgb(15 23 42 / 4%)' }}
                    contentStyle={ESTILO_TOOLTIP}
                    formatter={(valor) => [formatarMT(valor), 'Gasto']}
                  />
                  <Bar dataKey="total" fill={COR_ATUAL} radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </Secao>
  )
}