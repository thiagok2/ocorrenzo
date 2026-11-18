import { useState } from 'react'
import Button from '../../components/ui/Button'
import TextField from '../../components/ui/TextField'
import { IconCadeado, IconOlho, IconOlhoFechado, IconUsuario } from '../../components/ui/icons'

export default function LoginForm({ onEntrar }) {
  const [matricula, setMatricula] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  async function aoEnviar(evento) {
    evento.preventDefault()

    const proximosErros = {}
    if (!matricula) proximosErros.matricula = 'Informe a matrícula.'
    if (!senha) proximosErros.senha = 'Informe a senha.'
    if (Object.keys(proximosErros).length > 0) {
      setErros(proximosErros)
      return
    }

    setEnviando(true)
    setErros({})
    try {
      await onEntrar(matricula, senha)
    } catch (erro) {
      const mensagem =
        erro.response?.status === 401
          ? 'Matrícula ou senha inválidos.'
          : erro.response?.data?.mensagem ?? 'Não foi possível entrar. Tente novamente.'
      setErros({ geral: mensagem })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={aoEnviar} className="w-full max-w-sm space-y-4" noValidate>
      <div>
        <h2 className="text-lg font-semibold text-texto">Entrar</h2>
        <p className="text-sm text-texto-secundario">Use a matrícula e a senha fornecidas pela secretaria.</p>
      </div>

      <TextField
        rotulo="Matrícula"
        obrigatorio
        icone={<IconUsuario />}
        value={matricula}
        onChange={(evento) => setMatricula(evento.target.value)}
        erro={erros.matricula}
        autoComplete="username"
      />

      <TextField
        rotulo="Senha"
        obrigatorio
        type={senhaVisivel ? 'text' : 'password'}
        icone={<IconCadeado />}
        value={senha}
        onChange={(evento) => setSenha(evento.target.value)}
        erro={erros.senha}
        autoComplete="current-password"
        acaoDireita={
          <button
            type="button"
            onClick={() => setSenhaVisivel((visivel) => !visivel)}
            aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
            className="text-texto-secundario"
          >
            {senhaVisivel ? <IconOlhoFechado /> : <IconOlho />}
          </button>
        }
      />

      {erros.geral && (
        <p role="alert" className="text-sm text-gravidade-grave-texto">
          {erros.geral}
        </p>
      )}

      <Button type="submit" carregando={enviando} className="w-full">
        Entrar
      </Button>

      <p className="text-center text-sm text-texto-secundario">
        Primeiro acesso ou problemas? Fale com a secretaria.
      </p>
    </form>
  )
}
