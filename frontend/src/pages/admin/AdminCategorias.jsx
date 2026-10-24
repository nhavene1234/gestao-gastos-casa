import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Tag, Trash2 } from 'lucide-react'
import CategoriaForm from '../../components/CategoriaForm'
import ConfirmDialog from '../../components/ConfirmDialog'
import IconeCategoria from '../../components/IconeCategoria'
import { useToast } from '../../context/ToastContext'
import api, { mensagemErro } from '../../services/api'

export default function AdminCategorias() {
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
      const { data } = await api.get('/admin/categorias')
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
    notificar(eEdicao ? 'Categoria padrão atualizada.' : 'Categoria padrão criada.', 'sucesso')
    await carregar()
  }

  async function confirmarApagar() {
    setAProcessar(true)
    try {
      await api.delete(`/admin/categorias/${apagarAlvo.id}`)
      notificar('Categoria padrão apagada.', 'sucesso')
      await carregar()
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
    } finally {
      setAProcessar(false)
      setApagarAlvo(null)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Categorias padrão</h2>
          <p>Aparecem para todos os utilizadores. Só o administrador as pode alterar.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={abrirNova}>
          <Plus size={18} />
          Nova categoria padrão
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

      {!aCarregar && !erro && categorias.length === 0 && (
        <div className="card empty">
          <div className="empty-icon">
            <Tag size={28} />
          </div>
          <h3>Não há categorias padrão</h3>
          <p>Crie as categorias que quer oferecer a todos os utilizadores.</p>
        </div>
      )}

      {categorias.length > 0 && (
        <div className="cat-grid">
          {categorias.map((c) => (
            <article key={c.id} className="card cat-card">
              <span
                className="cat-icone"
                style={{ background: `color-mix(in srgb, ${c.cor} 16%, white)`, color: c.cor }}
              >
                <IconeCategoria nome={c.icone} />
              </span>
              <div className="cat-info">
                <strong>{c.nome}</strong>
              </div>
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
            </article>
          ))}
        </div>
      )}

      {formAberto && <CategoriaForm categoria={emEdicao} padrao onGuardada={aoGuardar} onFechar={fecharForm} />}

      {apagarAlvo && (
        <ConfirmDialog
          titulo="Apagar categoria padrão"
          rotuloConfirmar="Apagar"
          perigo
          aProcessar={aProcessar}
          onConfirmar={confirmarApagar}
          onCancelar={() => setApagarAlvo(null)}
        >
          Tem a certeza de que quer apagar <strong>{apagarAlvo.nome}</strong>? Só é possível se nenhum utilizador
          tiver compras nesta categoria.
        </ConfirmDialog>
      )}
    </>
  )
}