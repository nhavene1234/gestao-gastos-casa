import { useCallback, useEffect, useState } from 'react'
import { KeyRound, Pencil, Plus, Search, Trash2, UserCheck, UserX, Users } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import NovaSenhaDialog from '../../components/admin/NovaSenhaDialog'
import UtilizadorForm from '../../components/admin/UtilizadorForm'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import api, { mensagemErro } from '../../services/api'
import { formatarDataCurta } from '../../utils/format'

const RESUMO = [
  ['utilizadores', 'Utilizadores'],
  ['ativos', 'Ativos'],
  ['inativos', 'Desativados'],
  ['administradores', 'Administradores'],
  ['compras', 'Compras registadas'],
  ['produtos', 'Produtos'],
  ['categoriasPadrao', 'Categorias padrão'],
]

export default function AdminUtilizadores() {
  const { utilizador: eu } = useAuth()
  const { notificar } = useToast()

  const [resumo, setResumo] = useState(null)
  const [lista, setLista] = useState([])
  const [pesquisa, setPesquisa] = useState('')
  const [termo, setTermo] = useState('')
  const [aCarregar, setACarregar] = useState(true)
  const [erro, setErro] = useState('')

  const [formAberto, setFormAberto] = useState(false)
  const [emEdicao, setEmEdicao] = useState(null)
  const [senhaAlvo, setSenhaAlvo] = useState(null)
  const [desativarAlvo, setDesativarAlvo] = useState(null)
  const [apagarAlvo, setApagarAlvo] = useState(null)
  const [aProcessar, setAProcessar] = useState(false)

  // espera um instante depois de escrever para pesquisar
  useEffect(() => {
    const temporizador = setTimeout(() => setTermo(pesquisa.trim()), 300)
    return () => clearTimeout(temporizador)
  }, [pesquisa])

  const carregarLista = useCallback(async () => {
    setErro('')
    setACarregar(true)
    try {
      const { data } = await api.get('/admin/utilizadores', { params: termo ? { pesquisa: termo } : {} })
      setLista(data)
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setACarregar(false)
    }
  }, [termo])

  const carregarResumo = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/resumo')
      setResumo(data)
    } catch {
      // o resumo é secundário
    }
  }, [])

  useEffect(() => {
    carregarLista()
  }, [carregarLista])

  useEffect(() => {
    carregarResumo()
  }, [carregarResumo])

  const atualizarTudo = () => Promise.all([carregarLista(), carregarResumo()])

  function abrirNovo() {
    setEmEdicao(null)
    setFormAberto(true)
  }

  function abrirEdicao(u) {
    setEmEdicao(u)
    setFormAberto(true)
  }

  function fecharForm() {
    setFormAberto(false)
    setEmEdicao(null)
  }

  async function aoGuardar() {
    const eEdicao = Boolean(emEdicao)
    fecharForm()
    notificar(eEdicao ? 'Utilizador atualizado.' : 'Utilizador criado.', 'sucesso')
    await atualizarTudo()
  }

  async function alterarAtivo(utilizador, ativo) {
    setAProcessar(true)
    try {
      await api.patch(`/admin/utilizadores/${utilizador.id}/ativo`, { ativo })
      notificar(ativo ? 'Conta ativada.' : 'Conta desativada.', 'sucesso')
      await atualizarTudo()
    } catch (e) {
      notificar(mensagemErro(e), 'erro')
    } finally {
      setAProcessar(false)
      setDesativarAlvo(null)
    }
  }

  async function confirmarApagar() {
    setAProcessar(true)
    try {
      await api.delete(`/admin/utilizadores/${apagarAlvo.id}`)
      notificar('Utilizador apagado.', 'sucesso')
      await atualizarTudo()
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
          <h2>Utilizadores</h2>
          <p>Gerir as contas de quem usa o sistema.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={abrirNovo}>
          <Plus size={18} />
          Novo utilizador
        </button>
      </div>

      {resumo && (
        <div className="resumo-lista">
          {RESUMO.map(([chave, rotulo]) => (
            <div key={chave} className="card mini">
              <span>{rotulo}</span>
              <strong className="num">{resumo[chave]}</strong>
            </div>
          ))}
        </div>
      )}

      <div className="pesquisa">
        <Search size={18} />
        <input
          type="search"
          className="input"
          placeholder="Pesquisar por nome ou email"
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          aria-label="Pesquisar utilizadores"
        />
      </div>

      {erro && (
        <div className="alert alert-error" role="alert">
          <span style={{ flex: 1 }}>{erro}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={carregarLista}>
            Tentar de novo
          </button>
        </div>
      )}

      {aCarregar && lista.length === 0 && (
        <div className="card" style={{ padding: 20, display: 'grid', gap: 12 }}>
          <div className="skeleton" style={{ height: 22 }} />
          <div className="skeleton" style={{ height: 22 }} />
          <div className="skeleton" style={{ height: 22 }} />
        </div>
      )}

      {!aCarregar && !erro && lista.length === 0 && (
        <div className="card empty">
          <div className="empty-icon">
            <Users size={28} />
          </div>
          <h3>{termo ? 'Nenhum utilizador encontrado' : 'Ainda não há utilizadores'}</h3>
          <p>{termo ? `Não há resultados para "${termo}".` : 'Crie o primeiro utilizador.'}</p>
        </div>
      )}

      {lista.length > 0 && (
        <div className="card tabela-card">
          <table className="tabela">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>Papel</th>
                <th>Estado</th>
                <th>Registo</th>
                <th className="dir">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((u) => {
                const sou = u.id === eu?.id
                return (
                  <tr key={u.id}>
                    <td data-label="Utilizador">
                      <div className="pessoa">
                        <span className="avatar">{u.nome.charAt(0).toUpperCase()}</span>
                        <div>
                          <strong>
                            {u.nome}
                            {sou && <span className="tag-voce">você</span>}
                          </strong>
                          <span>{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td data-label="Papel">
                      {u.papel === 'ADMIN' ? (
                        <span className="badge badge-info">Administrador</span>
                      ) : (
                        <span className="badge badge-neutral">Utilizador</span>
                      )}
                    </td>

                    <td data-label="Estado">
                      {u.ativo ? (
                        <span className="badge badge-success">Ativo</span>
                      ) : (
                        <span className="badge badge-warning">Desativado</span>
                      )}
                    </td>

                    <td data-label="Registo">{u.criadoEm ? formatarDataCurta(u.criadoEm.slice(0, 10)) : '—'}</td>

                    <td data-label="">
                      <div className="acoes">
                        <button
                          type="button"
                          className="acao"
                          title="Editar"
                          aria-label={`Editar ${u.nome}`}
                          onClick={() => abrirEdicao(u)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          className="acao"
                          title="Redefinir senha"
                          aria-label={`Redefinir a senha de ${u.nome}`}
                          onClick={() => setSenhaAlvo(u)}
                        >
                          <KeyRound size={16} />
                        </button>

                        {!sou &&
                          (u.ativo ? (
                            <button
                              type="button"
                              className="acao acao--aviso"
                              title="Desativar conta"
                              aria-label={`Desativar a conta de ${u.nome}`}
                              onClick={() => setDesativarAlvo(u)}
                            >
                              <UserX size={16} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="acao acao--ok"
                              title="Ativar conta"
                              aria-label={`Ativar a conta de ${u.nome}`}
                              onClick={() => alterarAtivo(u, true)}
                              disabled={aProcessar}
                            >
                              <UserCheck size={16} />
                            </button>
                          ))}

                        {!sou && !u.ativo && (
                          <button
                            type="button"
                            className="acao acao--perigo"
                            title="Apagar utilizador"
                            aria-label={`Apagar ${u.nome}`}
                            onClick={() => setApagarAlvo(u)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {formAberto && (
        <UtilizadorForm
          utilizador={emEdicao}
          eEuProprio={emEdicao?.id === eu?.id}
          onGuardado={aoGuardar}
          onFechar={fecharForm}
        />
      )}

      {senhaAlvo && (
        <NovaSenhaDialog
          utilizador={senhaAlvo}
          onConcluido={() => {
            setSenhaAlvo(null)
            notificar('Senha redefinida.', 'sucesso')
          }}
          onCancelar={() => setSenhaAlvo(null)}
        />
      )}

      {desativarAlvo && (
        <ConfirmDialog
          titulo="Desativar conta"
          rotuloConfirmar="Desativar"
          perigo
          aProcessar={aProcessar}
          onConfirmar={() => alterarAtivo(desativarAlvo, false)}
          onCancelar={() => setDesativarAlvo(null)}
        >
          <strong>{desativarAlvo.nome}</strong> deixa de poder entrar e a sessão atual é terminada de imediato. Os
          dados ficam guardados e pode reativar a conta quando quiser.
        </ConfirmDialog>
      )}

      {apagarAlvo && (
        <ConfirmDialog
          titulo="Apagar utilizador"
          rotuloConfirmar="Apagar para sempre"
          perigo
          aProcessar={aProcessar}
          onConfirmar={confirmarApagar}
          onCancelar={() => setApagarAlvo(null)}
        >
          Vai apagar <strong>{apagarAlvo.nome}</strong> e <strong>todos os seus dados</strong>: compras, produtos,
          categorias e notificações. Esta ação não se pode desfazer.
        </ConfirmDialog>
      )}
    </>
  )
}