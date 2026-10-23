import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Pencil, Plus, RotateCcw, ShoppingCart, Trash2 } from 'lucide-react'
import CompraForm from '../components/CompraForm'
import ConfirmDialog from '../components/ConfirmDialog'
import ConsumoDialog from '../components/ConsumoDialog'
import { useToast } from '../context/ToastContext'
import api, { mensagemErro } from '../services/api'
import {
  formatarDataCurta,
  formatarMT,
  formatarQuantidade,
  intervaloAno,
  intervaloMes,
} from '../utils/format'

const PERIODOS = [
  { chave: 'mes', rotulo: 'Este mês', intervalo: () => intervaloMes(0) },
  { chave: 'passado', rotulo: 'Mês passado', intervalo: () => intervaloMes(-1) },
  { chave: 'ano', rotulo: 'Este ano', intervalo: intervaloAno },
  { chave: 'tudo', rotulo: 'Tudo', intervalo: () => ({ de: '', ate: '' }) },
]

const textoDias = (dias) => (dias === 1 ? '1 dia' : `${dias} dias`)

export default function Compras() {
  const { notificar } = useToast()

  const [periodo, setPeriodo] = useState('mes')
  const [filtros, setFiltros] = useState(() => ({ ...intervaloMes(0), categoriaId: '' }))

  const [compras, setCompras] = useState([])
  const [categorias, setCategorias] = useState([])
  const [produtos, setProdutos] = useState([])
  const [aCarregar, setACarregar] = useState(true)
  const [erro, setErro] = useState('')

  const [formAberto, setFormAberto] = useState(false)
  const [compraEmEdicao, setCompraEmEdicao] = useState(null)
  const [consumoAlvo, setConsumoAlvo] = useState(null)
  const [apagarAlvo, setApagarAlvo] = useState(null)
  const [aProcessar, setAProcessar] = useState(false)

  // número de notificações por ler antes de gravar, para detetar um alerta novo
  const naoLidasRef = useRef(null)

  const carregarCompras = useCallback(async () => {
    setErro('')
    setACarregar(true)
    try {
      const params = {}
      if (filtros.de) params.de = filtros.de
      if (filtros.ate) params.ate = filtros.ate
      if (filtros.categoriaId) params.categoriaId = filtros.categoriaId
      const { data } = await api.get('/compras', { params })
      setCompras(data)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setACarregar(false)
    }
  }, [filtros])

  useEffect(() => {
    carregarCompras()
  }, [carregarCompras])

  const carregarProdutos = useCallback(async () => {
    try {
      const { data } = await api.get('/produtos')
      setProdutos(data)
    } catch {
      // a lista de sugestões é opcional
    }
  }, [])

  useEffect(() => {
    api
      .get('/categorias')
      .then(({ data }) => setCategorias(data))
      .catch(() => {})
    carregarProdutos()
    api
      .get('/notificacoes/contagem')
      .then(({ data }) => {
        naoLidasRef.current = data.naoLidas
      })
      .catch(() => {})
  }, [carregarProdutos])

  // Depois de gravar: atualiza as listas e avisa se a compra gerou um alerta de média
  async function aposGravar(mensagem, verificarAlerta) {
    notificar(mensagem, 'sucesso')
    await Promise.all([carregarCompras(), carregarProdutos()])

    if (verificarAlerta) {
      try {
        const { data } = await api.get('/notificacoes/contagem')
        if (naoLidasRef.current !== null && data.naoLidas > naoLidasRef.current) {
          notificar(
            'Atenção: os gastos deste mês passaram da sua média habitual. Veja as notificações.',
            'aviso',
          )
        }
        naoLidasRef.current = data.naoLidas
      } catch {
        // sem aviso extra
      }
    }
    window.dispatchEvent(new Event('notificacoes:atualizar'))
  }

  // ---------- filtros ----------

  function escolherPeriodo(chave) {
    const escolhido = PERIODOS.find((p) => p.chave === chave)
    setPeriodo(chave)
    setFiltros((f) => ({ ...f, ...escolhido.intervalo() }))
  }

  function alterarData(campo, valor) {
    setPeriodo('personalizado')
    setFiltros((f) => ({ ...f, [campo]: valor }))
  }

  function limpar() {
    setPeriodo('mes')
    setFiltros({ ...intervaloMes(0), categoriaId: '' })
  }

  // ---------- ações ----------

  function abrirNovo() {
    setCompraEmEdicao(null)
    setFormAberto(true)
  }

  function abrirEdicao(compra) {
    setCompraEmEdicao(compra)
    setFormAberto(true)
  }

  function fecharForm() {
    setFormAberto(false)
    setCompraEmEdicao(null)
  }

  async function aoGuardar() {
    const eEdicao = Boolean(compraEmEdicao)
    fecharForm()
    await aposGravar(eEdicao ? 'Compra atualizada.' : 'Compra registada.', true)
  }

  async function confirmarConsumo(dataFim) {
    setAProcessar(true)
    try {
      await api.patch(`/compras/${consumoAlvo.id}/consumo`, { dataFimConsumo: dataFim })
      setConsumoAlvo(null)
      await aposGravar('Produto marcado como acabado.', false)
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
    } finally {
      setAProcessar(false)
    }
  }

  async function reabrir(compra) {
    try {
      await api.patch(`/compras/${compra.id}/consumo`, { dataFimConsumo: null })
      await aposGravar('Produto marcado como em uso.', false)
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
    }
  }

  async function confirmarApagar() {
    setAProcessar(true)
    try {
      await api.delete(`/compras/${apagarAlvo.id}`)
      setApagarAlvo(null)
      await aposGravar('Compra apagada.', false)
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
    } finally {
      setAProcessar(false)
    }
  }

  // soma em cêntimos para evitar erros de arredondamento
  const totalPeriodo = useMemo(
    () => compras.reduce((soma, c) => soma + Math.round(Number(c.precoTotal) * 100), 0) / 100,
    [compras],
  )

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Compras</h2>
          <p>Registe o que compra e veja para onde vai o dinheiro.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={abrirNovo}>
          <Plus size={18} />
          Registar compra
        </button>
      </div>

      <section className="card filtros" aria-label="Filtros">
        <div className="field">
          <span className="label">Período</span>
          <div className="chips">
            {PERIODOS.map((p) => (
              <button
                key={p.chave}
                type="button"
                className={`chip${periodo === p.chave ? ' ativo' : ''}`}
                onClick={() => escolherPeriodo(p.chave)}
              >
                {p.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="filtro-de">
            De
          </label>
          <input
            id="filtro-de"
            type="date"
            className="input"
            value={filtros.de}
            max={filtros.ate || undefined}
            onChange={(e) => alterarData('de', e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="filtro-ate">
            Até
          </label>
          <input
            id="filtro-ate"
            type="date"
            className="input"
            value={filtros.ate}
            min={filtros.de || undefined}
            onChange={(e) => alterarData('ate', e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="filtro-categoria">
            Categoria
          </label>
          <select
            id="filtro-categoria"
            className="input"
            value={filtros.categoriaId}
            onChange={(e) => setFiltros((f) => ({ ...f, categoriaId: e.target.value }))}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="btn btn-ghost" onClick={limpar}>
          Limpar
        </button>
      </section>

      {erro && (
        <div className="alert alert-error" role="alert">
          <span style={{ flex: 1 }}>{erro}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={carregarCompras}>
            Tentar de novo
          </button>
        </div>
      )}

      <div className="resumo-lista">
        <div className="card mini">
          <span>Total no período</span>
          <strong className="num">{formatarMT(totalPeriodo)}</strong>
        </div>
        <div className="card mini">
          <span>Compras</span>
          <strong className="num">{compras.length}</strong>
        </div>
      </div>

      {aCarregar && compras.length === 0 && (
        <div className="card" style={{ padding: 20, display: 'grid', gap: 12 }}>
          <div className="skeleton" style={{ height: 22 }} />
          <div className="skeleton" style={{ height: 22 }} />
          <div className="skeleton" style={{ height: 22 }} />
        </div>
      )}

      {!aCarregar && !erro && compras.length === 0 && (
        <div className="card empty">
          <div className="empty-icon">
            <ShoppingCart size={28} />
          </div>
          <h3>Nenhuma compra neste período</h3>
          <p>Altere o período ou os filtros, ou registe uma nova compra.</p>
          <button type="button" className="btn btn-primary" onClick={abrirNovo}>
            <Plus size={18} />
            Registar compra
          </button>
        </div>
      )}

      {compras.length > 0 && (
        <div className="card tabela-card">
          <table className="tabela">
            <thead>
              <tr>
                <th>Data</th>
                <th>Produto</th>
                <th className="dir">Qtd.</th>
                <th className="dir">Preço unitário</th>
                <th className="dir">Total</th>
                <th>Consumo</th>
                <th className="dir">Ações</th>
              </tr>
            </thead>
            <tbody>
              {compras.map((c) => (
                <tr key={c.id}>
                  <td data-label="Data">{formatarDataCurta(c.dataCompra)}</td>

                  <td data-label="Produto">
                    <div>
                      <div className="produto-nome">{c.produtoNome}</div>
                      <span className="cat-pill">
                        <span className="cat-dot" style={{ background: c.categoriaCor }} />
                        {c.categoriaNome}
                      </span>
                      {c.notas && <div className="nota">{c.notas}</div>}
                    </div>
                  </td>

                  <td data-label="Quantidade" className="dir num">
                    {formatarQuantidade(c.quantidade)}
                  </td>
                  <td data-label="Preço unitário" className="dir num">
                    {formatarMT(c.precoUnitario)}
                  </td>
                  <td data-label="Total" className="dir num">
                    <strong>{formatarMT(c.precoTotal)}</strong>
                  </td>

                  <td data-label="Consumo">
                    {c.dataFimConsumo ? (
                      <span className="badge badge-success">Durou {textoDias(c.diasConsumo)}</span>
                    ) : (
                      <span className="badge badge-info">Em uso</span>
                    )}
                  </td>

                  <td data-label="">
                    <div className="acoes">
                      {c.dataFimConsumo ? (
                        <button
                          type="button"
                          className="acao"
                          title="Marcar como em uso"
                          aria-label={`Marcar ${c.produtoNome} como em uso`}
                          onClick={() => reabrir(c)}
                        >
                          <RotateCcw size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="acao acao--ok"
                          title="Marcar como acabado"
                          aria-label={`Marcar ${c.produtoNome} como acabado`}
                          onClick={() => setConsumoAlvo(c)}
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="acao"
                        title="Editar"
                        aria-label={`Editar compra de ${c.produtoNome}`}
                        onClick={() => abrirEdicao(c)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="acao acao--perigo"
                        title="Apagar"
                        aria-label={`Apagar compra de ${c.produtoNome}`}
                        onClick={() => setApagarAlvo(c)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formAberto && (
        <CompraForm
          compra={compraEmEdicao}
          categorias={categorias}
          produtos={produtos}
          onGuardada={aoGuardar}
          onFechar={fecharForm}
        />
      )}

      {consumoAlvo && (
        <ConsumoDialog
          compra={consumoAlvo}
          aProcessar={aProcessar}
          onConfirmar={confirmarConsumo}
          onCancelar={() => setConsumoAlvo(null)}
        />
      )}

      {apagarAlvo && (
        <ConfirmDialog
          titulo="Apagar compra"
          rotuloConfirmar="Apagar"
          perigo
          aProcessar={aProcessar}
          onConfirmar={confirmarApagar}
          onCancelar={() => setApagarAlvo(null)}
        >
          Tem a certeza de que quer apagar a compra de <strong>{apagarAlvo.produtoNome}</strong> (
          {formatarMT(apagarAlvo.precoTotal)}, {formatarDataCurta(apagarAlvo.dataCompra)})? Esta ação não
          se pode desfazer.
        </ConfirmDialog>
      )}
    </>
  )
}