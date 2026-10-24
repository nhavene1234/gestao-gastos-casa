import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ListChecks, Plus } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog'
import CartaoLista from '../components/lista/CartaoLista'
import ItemForm from '../components/lista/ItemForm'
import ListaForm from '../components/lista/ListaForm'
import RegistarListaDialog from '../components/lista/RegistarListaDialog'
import { useToast } from '../context/ToastContext'
import api, { mensagemErro } from '../services/api'
import { diasAte } from '../utils/lista'

export default function ListaCompras() {
  const { notificar } = useToast()

  const [listas, setListas] = useState([])
  const [categorias, setCategorias] = useState([])
  const [aCarregar, setACarregar] = useState(true)
  const [erro, setErro] = useState('')
  const [verAnteriores, setVerAnteriores] = useState(false)

  const [formLista, setFormLista] = useState(null) // { lista: objeto ou null }
  const [formItem, setFormItem] = useState(null) // { lista, item: objeto ou null }
  const [registarAlvo, setRegistarAlvo] = useState(null)
  const [apagarAlvo, setApagarAlvo] = useState(null)
  const [aProcessar, setAProcessar] = useState(false)

  // número de notificações por ler, para detetar um alerta novo depois de registar
  const naoLidasRef = useRef(null)

  const carregar = useCallback(async () => {
    setErro('')
    setACarregar(true)
    try {
      const { data } = await api.get('/listas')
      setListas(data)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setACarregar(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    api
      .get('/categorias')
      .then(({ data }) => setCategorias(data))
      .catch(() => {})
    api
      .get('/notificacoes/contagem')
      .then(({ data }) => {
        naoLidasRef.current = data.naoLidas
      })
      .catch(() => {})
  }, [])

  // troca a lista pela versão atualizada (ou acrescenta, se for nova)
  const substituir = useCallback((resposta) => {
    setListas((atual) =>
      atual.some((l) => l.id === resposta.id)
        ? atual.map((l) => (l.id === resposta.id ? resposta : l))
        : [resposta, ...atual],
    )
  }, [])

  const { proximas, anteriores } = useMemo(() => {
    const prox = listas
      .filter((l) => diasAte(l.dataPrevista) >= 0)
      .sort((a, b) => a.dataPrevista.localeCompare(b.dataPrevista) || a.id - b.id)
    const ant = listas
      .filter((l) => diasAte(l.dataPrevista) < 0)
      .sort((a, b) => b.dataPrevista.localeCompare(a.dataPrevista) || b.id - a.id)
    return { proximas: prox, anteriores: ant }
  }, [listas])

  const mostrarAnteriores = verAnteriores || proximas.length === 0

  // ---------- ações ----------

  function aoGuardarLista(resposta) {
    const eEdicao = Boolean(formLista?.lista)
    setFormLista(null)
    substituir(resposta)
    notificar(eEdicao ? 'Lista atualizada.' : 'Lista criada. Já pode acrescentar itens.', 'sucesso')
  }

  function aoGuardarItem(resposta) {
    setFormItem(null)
    substituir(resposta)
  }

  async function confirmarApagar() {
    setAProcessar(true)
    try {
      await api.delete(`/listas/${apagarAlvo.id}`)
      setListas((atual) => atual.filter((l) => l.id !== apagarAlvo.id))
      notificar('Lista apagada.', 'sucesso')
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
    } finally {
      setAProcessar(false)
      setApagarAlvo(null)
    }
  }

  async function aposRegistar(resposta) {
    setRegistarAlvo(null)
    substituir(resposta.lista)
    notificar(
      resposta.registadas === 1 ? '1 compra registada.' : `${resposta.registadas} compras registadas.`,
      'sucesso',
    )

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
    window.dispatchEvent(new Event('notificacoes:atualizar'))
  }

  function cartao(lista) {
    return (
      <CartaoLista
        key={lista.id}
        lista={lista}
        onAtualizada={substituir}
        onEditarLista={(l) => setFormLista({ lista: l })}
        onApagarLista={setApagarAlvo}
        onNovoItem={(l) => setFormItem({ lista: l, item: null })}
        onEditarItem={(l, i) => setFormItem({ lista: l, item: i })}
        onRegistar={setRegistarAlvo}
      />
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Lista de compras</h2>
          <p>Planeie o que vai comprar, marque na loja e registe tudo de uma vez.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setFormLista({ lista: null })}>
          <Plus size={18} />
          Nova lista
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

      {aCarregar && listas.length === 0 && (
        <div className="listas">
          {[1, 2].map((n) => (
            <div key={n} className="card" style={{ padding: 20, display: 'grid', gap: 12 }}>
              <div className="skeleton" style={{ height: 24, width: '60%' }} />
              <div className="skeleton" style={{ height: 18 }} />
              <div className="skeleton" style={{ height: 18 }} />
            </div>
          ))}
        </div>
      )}

      {!aCarregar && !erro && listas.length === 0 && (
        <div className="card empty">
          <div className="empty-icon">
            <ListChecks size={28} />
          </div>
          <h3>Ainda não tem listas de compras</h3>
          <p>
            Crie uma lista para o dia em que vai às compras, escreva os itens e vá marcando o que comprou. No fim,
            transforme-os em compras registadas.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setFormLista({ lista: null })}>
            <Plus size={18} />
            Criar a primeira lista
          </button>
        </div>
      )}

      {listas.length > 0 && (
        <>
          <h3 className="secao-titulo">
            Hoje e próximas <small>({proximas.length})</small>
          </h3>
          {proximas.length === 0 ? (
            <p className="stat-nota">Não tem listas para hoje nem para os próximos dias.</p>
          ) : (
            <div className="listas">{proximas.map(cartao)}</div>
          )}

          {anteriores.length > 0 && (
            <>
              <h3 className="secao-titulo">
                Anteriores <small>({anteriores.length})</small>
                {proximas.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setVerAnteriores((v) => !v)}
                  >
                    {verAnteriores ? 'Esconder' : 'Mostrar'}
                  </button>
                )}
              </h3>
              {mostrarAnteriores && <div className="listas">{anteriores.map(cartao)}</div>}
            </>
          )}
        </>
      )}

      {formLista && (
        <ListaForm lista={formLista.lista} onGuardada={aoGuardarLista} onFechar={() => setFormLista(null)} />
      )}

      {formItem && (
        <ItemForm
          lista={formItem.lista}
          item={formItem.item}
          categorias={categorias}
          onGuardado={aoGuardarItem}
          onFechar={() => setFormItem(null)}
        />
      )}

      {registarAlvo && (
        <RegistarListaDialog
          lista={registarAlvo}
          categorias={categorias}
          onConcluido={aposRegistar}
          onCancelar={() => setRegistarAlvo(null)}
        />
      )}

      {apagarAlvo && (
        <ConfirmDialog
          titulo="Apagar lista"
          rotuloConfirmar="Apagar"
          perigo
          aProcessar={aProcessar}
          onConfirmar={confirmarApagar}
          onCancelar={() => setApagarAlvo(null)}
        >
          Tem a certeza de que quer apagar a lista <strong>{apagarAlvo.titulo}</strong> e todos os seus itens? As
          compras já registadas a partir dela não são apagadas.
        </ConfirmDialog>
      )}
    </>
  )
}