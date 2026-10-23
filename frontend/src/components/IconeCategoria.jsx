import {
  BookOpen,
  Briefcase,
  Car,
  Coffee,
  Dumbbell,
  Gamepad2,
  Gift,
  Heart,
  Music,
  Plane,
  Shirt,
  ShoppingBag,
  Store,
  Tag,
  Utensils,
  Wrench,
} from 'lucide-react'

// A chave é o nome guardado na base de dados (campo "icone" da categoria)
export const ICONES = {
  tag: Tag,
  utensils: Utensils,
  shirt: Shirt,
  plane: Plane,
  gamepad: Gamepad2,
  dumbbell: Dumbbell,
  briefcase: Briefcase,
  store: Store,
  book: BookOpen,
  heart: Heart,
  car: Car,
  gift: Gift,
  music: Music,
  coffee: Coffee,
  bag: ShoppingBag,
  wrench: Wrench,
}

export default function IconeCategoria({ nome, size = 22 }) {
  const Icone = ICONES[nome] ?? Tag
  return <Icone size={size} />
}