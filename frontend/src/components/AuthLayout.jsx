import Logo from './Logo'

export default function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-brand-top">
          <Logo tamanho={44} />
          <span>Gestão de Gastos de uma Casa</span>
        </div>

        <div>
          <h2>Saiba para onde vai o seu dinheiro.</h2>
          <ul>
            <li>Registe as compras em poucos segundos</li>
            <li>Veja os totais por dia, semana, mês e ano</li>
            <li>Receba um aviso quando passar da média habitual</li>
            <li>Descubra quanto tempo dura cada produto</li>
          </ul>
        </div>

        <small>Sem folhas de cálculo, sem complicações.</small>
      </aside>

      <main className="auth-form">
        <div className="auth-card">
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
          {children}
        </div>
      </main>
    </div>
  )
}