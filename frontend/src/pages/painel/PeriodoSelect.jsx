import SegmentedControl from '../../components/ui/SegmentedControl'

const OPCOES = [
  { value: '30', label: '30 dias' },
  { value: '60', label: '60 dias' },
  { value: '90', label: '90 dias' },
]

export default function PeriodoSelect({ periodoDias, onChange }) {
  return <SegmentedControl opcoes={OPCOES} valor={String(periodoDias)} onChange={(valor) => onChange(Number(valor))} />
}
