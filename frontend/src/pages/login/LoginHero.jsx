import heroImg from '../../assets/hero.png'

const BENEFICIOS = [
  'Registre ocorrências em poucos cliques',
  'Consulte o histórico de cada aluno',
  'Arquive com motivo e autoria registrados',
]

export default function LoginHero() {
  return (
    <div className="flex h-full flex-col justify-center gap-8 bg-primaria px-12 py-16 text-white">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-white/80">Ocorrência+</p>
        <h1 className="mt-2 text-3xl font-bold">Do registro à decisão.</h1>
        <p className="mt-2 text-white/80">
          O caminho mais rápido entre o que aconteceu em sala e a decisão da coordenação.
        </p>
      </div>
      <ul className="space-y-3">
        {BENEFICIOS.map((beneficio) => (
          <li key={beneficio} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
            {beneficio}
          </li>
        ))}
      </ul>
      <img src={heroImg} alt="" className="mt-auto max-w-[220px] self-center opacity-90" />
    </div>
  )
}
