import { Link } from 'react-router-dom'
import useDados from '../../hooks/useDados'
import { formatarDataCurta } from '../../utils/format'
import Secao from './Secao'

const textoDias = (n) => (Number(n) === 1 ? '1 dia' : `${n} dias`)

export default function TempoConsumo() {
  const { dados, erro, aCarregar, recarregar } = useDados('/estatisticas/consumo')

  return (
    <Secao
      titulo="Quanto tempo dura cada produto"
      subtitulo="Calculado a partir das compras que marcou como acabadas"
      aCarregar={aCarregar && !dados}
      erro={erro}
      onRepetir={recarregar}
    >
      {dados && dados.length === 0 && (
        <p className="vazio-texto">
          Ainda não há dados. Quando um produto acabar, marque-o como acabado na página{' '}
          <Link to="/compras">Compras</Link> e aqui vai ver quanto tempo costuma durar.
        </p>
      )}

      {dados && dados.length > 0 && (
        <div className="tabela-card">
          <table className="tabela">
            <thead>
              <tr>
                <th>Produto</th>
                <th className="dir">Dura em média</th>
                <th className="dir">Mais curto / mais longo</th>
                <th className="dir">Compras acabadas</th>
                <th className="dir">Última compra</th>
              </tr>
            </thead>
            <tbody>
              {dados.map((p) => (
                <tr key={p.produtoId}>
                  <td data-label="Produto">
                    <div>
                      <div className="produto-nome">{p.produtoNome}</div>
                      <span className="cat-pill">
                        <span className="cat-dot" style={{ background: p.categoriaCor }} />
                        {p.categoriaNome}
                      </span>
                    </div>
                  </td>
                  <td data-label="Dura em média" className="dir num">
                    <strong>
                      {Number(p.diasMedios).toLocaleString('pt-PT', { maximumFractionDigits: 1 })} dias
                    </strong>
                  </td>
                  <td data-label="Mais curto / mais longo" className="dir num">
                    {p.diasMinimo === p.diasMaximo
                      ? textoDias(p.diasMinimo)
                      : `${p.diasMinimo} a ${textoDias(p.diasMaximo)}`}
                  </td>
                  <td data-label="Compras acabadas" className="dir num">
                    {p.comprasConcluidas}
                  </td>
                  <td data-label="Última compra" className="dir num">
                    {formatarDataCurta(p.ultimaCompra)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Secao>
  )
}