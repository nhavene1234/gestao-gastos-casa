import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import useDados from '../../hooks/useDados'
import { capitalizar, intervaloDoMes, NOMES_MES } from '../../utils/datas'
import { formatarMT, formatarPercentagem } from '../../utils/format'
import { ESTILO_TOOLTIP } from '../../utils/graficos'
import Secao from './Secao'

export default function GastoCategorias({ ano, mes }) {
  const { de, ate } = intervaloDoMes(ano, mes)
  const { dados, erro, aCarregar, recarregar } = useDados('/estatisticas/por-categoria', { de, ate })

  const pontos = dados ? dados.map((c) => ({ ...c, total: Number(c.total) })) : []
  const total = Math.round(pontos.reduce((soma, c) => soma + c.total * 100, 0)) / 100

  return (
    <Secao
      titulo="Gastos por categoria"
      subtitulo={`${capitalizar(NOMES_MES[mes - 1])} de ${ano}`}
      aCarregar={aCarregar && !dados}
      erro={erro}
      onRepetir={recarregar}
    >
      {dados && pontos.length === 0 && <p className="vazio-texto">Sem compras neste mês.</p>}

      {pontos.length > 0 && (
        <>
          <div className="grafico grafico--menor" role="img" aria-label="Distribuição dos gastos por categoria">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pontos}
                  dataKey="total"
                  nameKey="categoriaNome"
                  innerRadius={62}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pontos.map((c) => (
                    <Cell key={c.categoriaId} fill={c.cor} />
                  ))}
                </Pie>
                <Tooltip contentStyle={ESTILO_TOOLTIP} formatter={(valor, nome) => [formatarMT(valor), nome]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="legenda">
            {pontos.map((c) => (
              <div key={c.categoriaId} className="legenda-linha">
                <span className="legenda-cor" style={{ background: c.cor }} />
                <span>{c.categoriaNome}</span>
                <span className="num">{formatarMT(c.total)}</span>
                <span className="legenda-pct num">{formatarPercentagem(c.percentagem)}%</span>
              </div>
            ))}
            <div className="legenda-linha">
              <span />
              <strong>Total</strong>
              <strong className="num">{formatarMT(total)}</strong>
              <span />
            </div>
          </div>
        </>
      )}
    </Secao>
  )
}