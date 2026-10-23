import { Hammer } from 'lucide-react'

export default function EmBreve({ titulo }) {
  return (
    <div className="card empty">
      <div className="empty-icon">
        <Hammer size={28} />
      </div>
      <h3>{titulo}</h3>
      <p>Esta secção está em construção e fica pronta nos próximos passos.</p>
    </div>
  )
}