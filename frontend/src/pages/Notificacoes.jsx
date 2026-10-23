import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, CheckCheck, Info, Trash2, TrendingUp } from 'lucide-react'
import { useToast } from '../context/ToastContext'
import api, { mensagemErro } from '../services/api'
import { formatarDataLonga } from '../utils/format'

// A cor e o ícone dizem de que tipo é a notificação
const TIPOS = {
  ALERTA_MEDIA: { icone: TrendingUp, classe: 'perigo' },
  INFO: { icone: Info, classe: 'info' },
  SISTEMA: { icone: Bell, classe: 'neutro' },
}

const avisarSino = () => window.dispatchEvent(new Event('notificacoes:atualizar'))

export default function Notificacoes() {
  const { notificar } = useToast()

  const [lista, setLista] = useState([])
  const [soNaoLidas, setSoNaoLidas] = useState(false)
  const [aCarregar, setACarregar] = useState(true)
  const [erro, setErro] = useState('')
  const [aProcessar, setAProcessar] = useState(false)

  const carregar = useCallback(async () => {
    setErro('')
    setACarregar(true)
    try {
      const { data } = await api.get('/notificacoes', { params: { apenasNaoLidas: soNaoLidas } })
      setLista(data)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setACarregar(false)
    }
  }, [soNaoLidas])

  useEffect(() => {
    carregar()
  }, [carregar])

  const porLer = lista.filter((n) => !n.lida).length

  async function marcarLida(notificacao) {
    try {
      const { data } = await api.patch(`/notificacoes/${notificacao.id}/lida`)
      setLista((atual) =>
        soNaoLidas
          ? atual.filter((n) => n.id !== data.id)
          : atual.map((n) => (n.id === data.id ? data : n)),
      )
      avisarSino()
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
    }
  }

  async function marcarTodas() {
    setAProcessar(true)
    try {
      const { data } = await api.patch('/notificacoes/marcar-todas-lidas')
      notificar(
        data.marcadas === 1 ? '1 notificação marcada como lida.' : `${data.marcadas} notificações marcadas como lidas.`,
        'sucesso',
      )
      await carregar()
      avisarSino()
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
    } finally {
      setAProcessar(false)
    }
  }

  async function apagar(notificacao) {
    try {
      await api.delete(`/notificacoes/${notificacao.id}`)
      setLista((atual) => atual.filter((n) => n.id !== notificacao.id))
      avisarSino()
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Notificações</h2>
          <p>Avisos sobre os seus gastos, como quando passa da média habitual.</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={marcarTodas}
          disabled={aProcessar || porLer === 0}
        >
          <CheckCheck size={18} />
          Marcar todas como lidas
        </button>
      </div>

      <div className="chips" style={{ marginBottom: 16 }}>
        <button type="button" className={`chip${!soNaoLidas ? ' ativo' : ''}`} onClick={() => setSoNaoLidas(false)}>
          Todas
        </button>
        <button type="button" className={`chip${soNaoLidas ? ' ativo' : ''}`} onClick={() => setSoNaoLidas(true)}>
          Por ler
        </button>
      </div>

      {erro && (
        <div className="alert alert-error" role="alert">
          <span style={{ flex: 1 }}>{erro}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={carregar}>
            Tentar de novo
          </button>
        </div>
      )}

      {aCarregar && lista.length === 0 && (
        <div className="notif-lista">
          {[1, 2].map((n) => (
            <div key={n} className="card" style={{ padding: 18 }}>
              <div className="skeleton" style={{ height: 20, width: '45%', marginBottom: 10 }} />
              <div className="skeleton" style={{ height: 16, width: '80%' }} />
            </div>
          ))}
        </div>
      )}

      {!aCarregar && !erro && lista.length === 0 && (
        <div className="card empty">
          <div className="empty-icon">
            <Bell size={28} />
          </div>
          <h3>{soNaoLidas ? 'Não tem notificações por ler' : 'Sem notificações'}</h3>
          <p>
            Quando os gastos do mês passarem da sua média habitual, o aviso aparece aqui.
          </p>
          <Link to="/compras" className="btn btn-ghost">
            Ver as minhas compras
          </Link>
        </div>
      )}

      {lista.length > 0 && (
        <div className="notif-lista">
          {lista.map((n) => {
            const tipo = TIPOS[n.tipo] ?? TIPOS.SISTEMA
            const Icone = tipo.icone
            return (
              <article
                key={n.id}
                className={`card notif notif--${tipo.classe}${n.lida ? '' : ' notif--nova'}`}
              >
                <span className="notif-icone">
                  <Icone size={20} />
                </span>

                <div className="notif-corpo">
                  <div className="notif-titulo">
                    {n.titulo}
                    {!n.lida && <span className="notif-ponto" aria-label="Por ler" />}
                  </div>
                  <p className="notif-texto">{n.mensagem}</p>
                  {n.criadoEm && <div className="notif-data">{formatarDataLonga(n.criadoEm.slice(0, 10))}</div>}
                </div>

                <div className="notif-acoes">
                  {!n.lida && (
                    <button
                      type="button"
                      className="acao acao--ok"
                      title="Marcar como lida"
                      aria-label="Marcar como lida"
                      onClick={() => marcarLida(n)}
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="acao acao--perigo"
                    title="Apagar"
                    aria-label="Apagar notificação"
                    onClick={() => apagar(n)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}