import Button from './Button'
import Dialog from './Dialog'

export default function ConfirmDialog({ aberto, titulo, mensagem, textoConfirmar = 'Confirmar', onConfirmar, onFechar }) {
  return (
    <Dialog
      aberto={aberto}
      titulo={titulo}
      onFechar={onFechar}
      rodape={
        <>
          <Button variante="secundario" onClick={onFechar}>
            Cancelar
          </Button>
          <Button variante="primario" onClick={onConfirmar}>
            {textoConfirmar}
          </Button>
        </>
      }
    >
      <p className="text-sm text-texto-secundario">{mensagem}</p>
    </Dialog>
  )
}
