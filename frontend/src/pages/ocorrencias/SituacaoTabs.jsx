import SegmentedControl from '../../components/ui/SegmentedControl'

const ABAS = [
  { value: 'ativas', label: 'Ativas' },
  { value: 'arquivadas', label: 'Arquivadas' },
  { value: 'todas', label: 'Todas' },
]

export default function SituacaoTabs({ situacao, total, onChange }) {
  const opcoes = ABAS.map((aba) => (aba.value === situacao ? { ...aba, contagem: total } : aba))
  return <SegmentedControl opcoes={opcoes} valor={situacao} onChange={onChange} />
}
