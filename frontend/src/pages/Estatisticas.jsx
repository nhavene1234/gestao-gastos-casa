import { useState } from 'react'
import ComparacaoAnual from '../components/estatisticas/ComparacaoAnual'
import ComparacaoMensal from '../components/estatisticas/ComparacaoMensal'
import EvolucaoDiaria from '../components/estatisticas/EvolucaoDiaria'
import GastoCategorias from '../components/estatisticas/GastoCategorias'
import TempoConsumo from '../components/estatisticas/TempoConsumo'
import { NOMES_MES } from '../utils/datas'

export default function Estatisticas() {
  const hoje = new Date()
  const [ano, setAno] = useState(hoje.getFullYear())
  const [mes, setMes] = useState(hoje.getMonth() + 1)

  const anos = Array.from({ length: 6 }, (_, i) => hoje.getFullYear() - i)

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Estatísticas</h2>
          <p>Compare meses e anos e descubra para onde vai o seu dinheiro.</p>
        </div>
      </div>

      <section className="card filtros stats-filtros" aria-label="Período">
        <div className="field">
          <label className="label" htmlFor="est-mes">
            Mês
          </label>
          <select id="est-mes" className="input" value={mes} onChange={(e) => setMes(Number(e.target.value))}>
            {NOMES_MES.map((nome, i) => (
              <option key={nome} value={i + 1}>
                {nome}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="est-ano">
            Ano
          </label>
          <select id="est-ano" className="input" value={ano} onChange={(e) => setAno(Number(e.target.value))}>
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </section>

      <ComparacaoMensal ano={ano} mes={mes} />
      <ComparacaoAnual ano={ano} />

      <div className="grid-2">
        <GastoCategorias ano={ano} mes={mes} />
        <EvolucaoDiaria />
      </div>

      <TempoConsumo />
    </>
  )
}