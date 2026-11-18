import { useEffect, useRef } from 'react'

const SELETOR_FOCAVEL = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export default function useFocusTrap(aberto, onFechar) {
  const painelRef = useRef(null)
  const onFecharRef = useRef(onFechar)

  useEffect(() => {
    onFecharRef.current = onFechar
  })

  useEffect(() => {
    if (!aberto) return

    const gatilho = document.activeElement
    const painel = painelRef.current
    painel?.querySelector(SELETOR_FOCAVEL)?.focus()

    document.body.style.overflow = 'hidden'

    function aoTeclar(evento) {
      if (evento.key === 'Escape') {
        onFecharRef.current()
        return
      }
      if (evento.key !== 'Tab' || !painel) return

      const focaveis = painel.querySelectorAll(SELETOR_FOCAVEL)
      if (focaveis.length === 0) return
      const primeiro = focaveis[0]
      const ultimo = focaveis[focaveis.length - 1]

      if (evento.shiftKey && document.activeElement === primeiro) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primeiro.focus()
      }
    }

    document.addEventListener('keydown', aoTeclar)
    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = ''
      gatilho?.focus()
    }
  }, [aberto])

  return painelRef
}
