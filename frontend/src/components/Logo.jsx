export default function Logo({ tamanho = 40 }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Gestão de Gastos de uma Casa"
    >
      <rect width="40" height="40" rx="11" fill="#14B8A6" />
      <path
        d="M10 19.5 20 11l10 8.5V29a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 10 29v-9.5Z"
        fill="#fff"
      />
      <circle cx="20" cy="23" r="4.4" fill="#0F766E" />
      <circle cx="20" cy="23" r="1.6" fill="#fff" />
    </svg>
  )
}