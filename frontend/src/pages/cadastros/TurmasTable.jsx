export default function TurmasTable({ itens }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-borda text-texto-secundario">
          <th scope="col" className="py-2 font-medium">
            Turma
          </th>
        </tr>
      </thead>
      <tbody>
        {itens.map((turma) => (
          <tr key={turma.id} className="border-b border-borda">
            <td className="py-3 text-texto">{turma.nome}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
