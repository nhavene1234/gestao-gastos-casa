import { useCallback, useEffect, useState } from 'react'
import { Lock, Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import CategoriaForm from '../components/CategoriaForm'
import ConfirmDialog from '../components/ConfirmDialog'
import IconeCategoria from '../components/IconeCategoria'
import { useToast } from '../context/ToastContext'
import api, { mensagemErro } from '../services/api'

function Cartao({ categoria, children }) {
  return (
    <article className="card cat-card">
      <span
        className="cat-icone"
        style={{
          background: `color-mix(in srgb, ${categoria.cor} 16%, white)`,
          color: categoria.cor,
        }}
      >
        <IconeCategoria nome={categoria.icone} />
      </span>
      <div className="cat-info">
        <strong>{categoria.nome}</strong>
        {categoria.padrao && (
          <span>
            <Lock size={12} style={{ verticalAlign: '-1px' }} /> Categoria padrão
          </span>
        )}
      </div>
      {children}
    </article>
  )
}

export default function Categorias() {
  const { notificar } = useToast()

  const [categorias, setCategorias] = useState([])
  const [aCarregar, setACarregar] = useState(true)
  const [erro, setErro] = useState('')

  const [formAberto, setFormAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState(null)
  const [apagarAlvo, setApagarAlvo] = useState(null)
  const [aProcessar, setAProcessar] = useState(false)

  const carregar = useCallback(async () => {
    setErro('')
    setACarregar(true)
    try {
      const { data } = await api.get('/categorias')
      setCategorias(data)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setACarregar(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const minhas = categorias.filter((c) => !c.padrao)
  const padrao = categorias.filter((c) => c.padrao)

  function abrirNova() {
    setEmEdicao(null)
    setFormAberto(true)
  }

  function abrirEdicao(categoria) {
    setEmEdicao(categoria)
    setFormAberto(true)
  }

  function fecharForm() {
    setFormAberto(false)
    setEmEdicao(null)
  }

  async function aoGuardar() {
    const eEdicao = Boolean(emEdicao)
    fecharForm()
    notificar(eEdicao ? 'Categoria atualizada.' : 'Categoria criada.', 'sucesso')
    await carregar()
  }

  async function confirmarApagar() {
    setAProcessar(true)
    try {
      await api.delete(`/categorias/${apagarAlvo.id}`)
      setApagarAlvo(null)
      notificar('Categoria apagada.', 'sucesso')
      await carregar()
    } catch (e) {
      setApagarAlvo(null)
      notificar(mensagemErro(e), 'erro')
    } finally {
      setAProcessar(false)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Categorias</h2>
          <p>Organize as suas compras. Pode criar categorias além das que já existem.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={abrirNova}>
          <Plus size={18} />
          Nova categoria
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

      {aCarregar && categorias.length === 0 && (
        <div className="cat-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card cat-card">
              <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 14 }} />
              <div className="skeleton" style={{ height: 18, flex: 1 }} />
            </div>
          ))}
        </div>
      )}

      {!aCarregar && !erro && (
        <>
          <h3 className="secao-titulo">
            As minhas categorias <small>({minhas.length})</small>
          </h3>

          {minhas.length === 0 ? (
            <div className="card empty" style={{ marginTop: 0 }}>
              <div className="empty-icon">
                <Tag size={28} />
              </div>
              <h3>Ainda não criou categorias</h3>
              <p>
                Crie as suas, por exemplo "Educação", "Saúde" ou "Transportes", e use-as ao registar compras.
              </p>
              <button type="button" className="btn btn-primary" onClick={abrirNova}>
                <Plus size={18} />
                Nova categoria
              </button>
            </div>
          ) : (
            <div className="cat-grid">
              {minhas.map((c) => (
                <Cartao key={c.id} categoria={c}>
                  <div className="acoes">
                    <button
                      type="button"
                      className="acao"
                      title="Editar"
                      aria-label={`Editar categoria ${c.nome}`}
                      onClick={() => abrirEdicao(c)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="acao acao--perigo"
                      title="Apagar"
                      aria-label={`Apagar categoria ${c.nome}`}
                      onClick={() => setApagarAlvo(c)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Cartao>
              ))}
            </div>
          )}

          <h3 className="secao-titulo">
            Categorias padrão <small>({padrao.length}) · só o administrador as pode alterar</small>
          </h3>
          <div className="cat-grid">
            {padrao.map((c) => (
              <Cartao key={c.id} categoria={c} />
            ))}
          </div>
        </>
      )}

      {formAberto && <CategoriaForm categoria={emEdicao} onGuardada={aoGuardar} onFechar={fecharForm} />}

      {apagarAlvo && (
        <ConfirmDialog
          titulo="Apagar categoria"
          rotuloConfirmar="Apagar"
          perigo
          aProcessar={aProcessar}
          onConfirmar={confirmarApagar}
          onCancelar={() => setApagarAlvo(null)}
        >
                    Tem a certeza de que quer apagar a categoria <strong>{apagarAlvo.nome}</strong>? Só é possível se não
          tiver compras registadas.
        </ConfirmDialog>
      )}
    </>
  )
}