import Button from './Button'

export default function ErrorState({ mensagem = 'Não foi possível carregar os dados.', onTentarNovamente }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center text-texto-secundario">
      <p>{mensagem}</p>
      {onTentarNovamente && (
        <Button variante="secundario" onClick={onTentarNovamente}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}
