import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Calendar,
  CalendarDays,
  CalendarRange,
  Plus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api, { mensagemErro } from '../services/api'
import {
  formatarDataLonga,
  formatarMT,
  formatarNumero,
  formatarPercentagem,
  primeiroNome,
} from '../utils/format'

// Cor do mês conforme a média habitual: coral = acima, âmbar = perto, verde = dentro
function estadoDoMes(comp) {
  if (!comp || comp.mediaHabitual == null) {
    return { classe: '', tipo: 'neutral', rotulo: 'Sem histórico para comparar', icone: null }
  }

  const total = Number(comp.total)
  const media = Number(comp.mediaHabitual)

  if (comp.acimaDaMedia) {
    return {
      classe: 'stat--perigo',
      tipo: 'danger',
      icone: TrendingUp,
      rotulo: `${formatarPercentagem(comp.variacaoMediaPercentual)}% acima da média`,
    }
  }
  if (media > 0 && total / media >= 0.85) {
    return { classe: 'stat--aviso', tipo: 'warning', icone: TrendingUp, rotulo: 'Perto da média' }
  }
  return { classe: 'stat--ok', tipo: 'success', icone: TrendingDown, rotulo: 'Dentro da média' }
}

function CartaoSkeleton() {
  return (
    <div className="card stat">
      <div className="skeleton" style={{ height: 20, width: '50%' }} />
      <div className="skeleton" style={{ height: 36, width: '70%' }} />
      <div className="skeleton" style={{ height: 16, width: '40%' }} />
    </div>
  )
}

export default function Dashboard() {
  const { utilizador } = useAuth()
  const [resumo, setResumo] = useState(null)
  const [comparacao, setComparacao] = useState(null)
  const [erro, setErro] = useState('')
  const [aCarregar, setACarregar] = useState(true)

  const carregar = useCallback(async () => {
    setErro('')
    setACarregar(true)
    try {
      const [r, c] = await Promise.all([
        api.get('/estatisticas/resumo'),
        api.get('/estatisticas/comparacao/mensal'),
      ])
      setResumo(r.data)
      setComparacao(c.data)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setACarregar(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const estado = estadoDoMes(comparacao)

  const cartoes = resumo
    ? [
        { chave: 'dia', titulo: 'Hoje', icone: Calendar, dados: resumo.dia },
        { chave: 'semana', titulo: 'Esta semana', icone: CalendarDays, dados: resumo.semana },
        { chave: 'mes', titulo: 'Este mês', icone: CalendarRange, dados: resumo.mes },
        { chave: 'ano', titulo: 'Este ano', icone: Wallet, dados: resumo.ano },
      ]
    : []

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Olá, {primeiroNome(utilizador?.nome)}</h2>
          <p>
            {resumo ? `Resumo de ${formatarDataLonga(resumo.data)}` : 'A carregar o seu resumo...'}
          </p>
        </div>
        <Link to="/compras" className="btn btn-primary">
          <Plus size={18} />
          Registar compra
        </Link>
      </div>

      {erro && (
        <div className="alert alert-error" role="alert">
          <span style={{ flex: 1 }}>{erro}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={carregar}>
            Tentar de novo
          </button>
        </div>
      )}

      {comparacao?.acimaDaMedia && (
        <div className="banner banner--perigo" role="status">
          <Bell size={22} />
          <div>
            <strong>Gastos acima da média em {comparacao.nomeMes}</strong>
            Já gastou {formatarMT(comparacao.total)}, {formatarPercentagem(comparacao.variacaoMediaPercentual)}% acima
            da sua média habitual de {formatarMT(comparacao.mediaHabitual)}.
          </div>
        </div>
      )}

      {aCarregar && !resumo && (
        <div className="grid-resumo">
          <CartaoSkeleton />
          <CartaoSkeleton />
          <CartaoSkeleton />
          <CartaoSkeleton />
        </div>
      )}

      {resumo && resumo.ano.compras === 0 && (
        <div className="card empty">
          <div className="empty-icon">
            <ShoppingCart size={28} />
          </div>
          <h3>Ainda não registou compras</h3>
          <p>Comece por registar a primeira compra e o painel passa a mostrar os totais e as comparações.</p>
          <Link to="/compras" className="btn btn-primary">
            <Plus size={18} />
            Registar a primeira compra
          </Link>
        </div>
      )}

      {resumo && resumo.ano.compras > 0 && (
        <div className="grid-resumo">
          {cartoes.map(({ chave, titulo, icone: Icone, dados }) => {
            const eMes = chave === 'mes'
            const IconeEstado = eMes ? estado.icone : null
            return (
              <article key={chave} className={`card stat ${eMes ? estado.classe : ''}`}>
                <div className="stat-head">
                  {titulo}
                  <span className="stat-icon">
                    <Icone size={20} />
                  </span>
                </div>

                <div className="stat-valor num">
                  {formatarNumero(dados.total)}
                  <small>MT</small>
                </div>

                <div className="stat-nota">
                  {dados.compras} {dados.compras === 1 ? 'compra' : 'compras'}
                </div>

                {eMes && (
                  <>
                    <span className={`badge badge-${estado.tipo}`}>
                      {IconeEstado && <IconeEstado size={14} />}
                      {estado.rotulo}
                    </span>
                    {comparacao?.mediaHabitual != null && (
                      <div className="stat-nota">
                        Média habitual: <span className="num">{formatarMT(comparacao.mediaHabitual)}</span>
                      </div>
                    )}
                  </>
                )}
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}